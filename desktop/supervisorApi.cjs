/* Minimal Supervisor API (HTTP + SSE)
 * - Binds to 127.0.0.1:17777 by default
 * - Endpoints:
 *    POST /session/start   { sessionId, meta }
 *    POST /session/stop    { sessionId }
 *    GET  /supervisor/status
 *    POST /import/file     { path, contentBase64 }
 *    POST /telemetry/packet  { ...telemetry }  // inject raw telemetry into ingestion
 *    GET  /telemetry/live  SSE stream
 */

const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const os = require("os");

function start(opts = {}) {
  const port = opts.port || 17777;
  const host = "127.0.0.1";
  const getStatus = typeof opts.getStatus === "function" ? opts.getStatus : () => ({});
  const onExternalTelemetry =
    typeof opts.onExternalTelemetry === "function" ? opts.onExternalTelemetry : () => false;

  const sseLiveClients = new Set();
  const sseRawClients = new Set();
  const sseEventClients = new Set();
  let server = null;
  const sessions = new Map();

  const sessionsDir = path.join(process.env.APPDATA || os.homedir(), "PitWall");
  const sessionsFile = path.join(sessionsDir, "sessions.json");

  function loadSessionsFromDisk() {
    try {
      if (!fs.existsSync(sessionsFile)) return [];
      const txt = fs.readFileSync(sessionsFile, "utf-8");
      const arr = JSON.parse(txt || "[]");
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      console.warn("[supervisorApi] failed to load sessions:", e?.message || e);
      return [];
    }
  }

  function saveSessionsToDisk() {
    try {
      if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir, { recursive: true });
      const arr = Array.from(sessions.values());
      fs.writeFileSync(sessionsFile, JSON.stringify(arr, null, 2), "utf-8");
    } catch (e) {
      console.warn("[supervisorApi] failed to save sessions:", e?.message || e);
    }
  }

  // Hydrate sessions from disk
  try {
    const persisted = loadSessionsFromDisk();
    for (const s of persisted) sessions.set(s.id ?? s.sessionId ?? `s-${Date.now()}`, s);
  } catch {}

  function broadcastTelemetry(obj) {
    const payload = `data: ${JSON.stringify(obj)}\n\n`;
    for (const res of sseLiveClients) {
      try {
        res.write(payload);
      } catch {}
    }
  }

  function broadcastRawTelemetry(obj) {
    const payload = `data: ${JSON.stringify(obj)}\n\n`;
    for (const res of sseRawClients) {
      try {
        res.write(payload);
      } catch {}
    }
  }

  function broadcastEvent(obj) {
    const payload = `data: ${JSON.stringify(obj)}\n\n`;
    for (const res of sseEventClients) {
      try {
        res.write(payload);
      } catch {}
    }
  }

  function getActiveSession() {
    for (const session of sessions.values()) {
      if (!session.endedAt) return session;
    }
    return null;
  }

  function startSession(sessionId, meta) {
    const id = sessionId || `s-${Date.now()}`;
    const existing = sessions.get(id);
    if (existing && !existing.endedAt) {
      return { ok: true, sessionId: id, existing: true };
    }

    const rec = {
      id,
      meta: meta || {},
      startedAt: Date.now(),
    };
    sessions.set(id, rec);
    saveSessionsToDisk();
    broadcastTelemetry({ type: "session.start", sessionId: id, meta: rec.meta, ts: rec.startedAt });
    return { ok: true, sessionId: id, session: rec };
  }

  function stopSession(sessionId) {
    if (!sessionId) {
      return { ok: false, error: "missing sessionId" };
    }
    const session = sessions.get(sessionId);
    if (!session) {
      return { ok: false, error: "session not found" };
    }
    if (session.endedAt) {
      return { ok: true, sessionId: sessionId, session, alreadyStopped: true };
    }
    session.endedAt = Date.now();
    sessions.set(sessionId, session);
    saveSessionsToDisk();
    broadcastTelemetry({ type: "session.stop", sessionId, session, ts: session.endedAt });
    return { ok: true, sessionId, session };
  }

  function parseJson(req) {
    return new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (c) => (body += c.toString()));
      req.on("end", () => {
        if (!body) return resolve(null);
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
      req.on("error", reject);
    });
  }

  server = http.createServer(async (req, res) => {
    const p = url.parse(req.url, true);
    // CORS / local-only safety header
    res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1");
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      });
      return res.end();
    }

    try {
      if (req.method === "GET" && p.pathname === "/supervisor/status") {
        const st = getStatus();
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(st));
        return;
      }

      if (req.method === "POST" && p.pathname === "/session/start") {
        const body = await parseJson(req);
        const id = body?.sessionId || `s-${Date.now()}`;
        const rec = { id, meta: body?.meta || {}, startedAt: Date.now() };
        sessions.set(id, rec);
        saveSessionsToDisk();
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ ok: true, sessionId: id }));
        broadcastTelemetry({ type: "session.start", sessionId: id });
        return;
      }

      if (req.method === "POST" && p.pathname === "/session/stop") {
        const body = await parseJson(req);
        const id = body?.sessionId;
        const s = sessions.get(id);
        if (!s) {
          res.writeHead(404);
          res.end("not found");
          return;
        }
        s.endedAt = Date.now();
        sessions.set(id, s);
        saveSessionsToDisk();
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ ok: true, session: s }));
        broadcastTelemetry({ type: "session.stop", sessionId: id, session: s });
        return;
      }

      if (req.method === "POST" && p.pathname === "/import/file") {
        const body = await parseJson(req);
        const targetDir = path.join(process.env.APPDATA || process.cwd(), "PitWall", "imports");
        try {
          fs.mkdirSync(targetDir, { recursive: true });
        } catch {}
        const filename = body?.path ? path.basename(body.path) : `import-${Date.now()}`;
        const filePath = path.join(targetDir, filename);
        if (body?.contentBase64) {
          const buf = Buffer.from(body.contentBase64, "base64");
          fs.writeFileSync(filePath, buf);
        } else {
          fs.writeFileSync(filePath, JSON.stringify(body || {}));
        }
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ ok: true, path: filePath }));
        broadcastTelemetry({ type: "import.file", path: filePath });
        return;
      }

      if (req.method === "POST" && p.pathname === "/telemetry/packet") {
        const body = await parseJson(req);
        if (!body) {
          res.writeHead(400);
          res.end("invalid payload");
          return;
        }
        const accepted = onExternalTelemetry(body);
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ ok: accepted, packet: body }));
        // Note: the packet is queued in ingestion controller and broadcast via callbacks
        return;
      }

      if (req.method === "GET" && p.pathname === "/telemetry/live") {
        // SSE Normalized
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        });
        res.write(`: connected\n\n`);
        sseLiveClients.add(res);
        req.on("close", () => sseLiveClients.delete(res));
        return;
      }

      if (req.method === "GET" && p.pathname === "/telemetry/raw") {
        // SSE Raw
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        });
        res.write(`: connected\n\n`);
        sseRawClients.add(res);
        req.on("close", () => sseRawClients.delete(res));
        return;
      }

      if (req.method === "GET" && p.pathname === "/telemetry/events") {
        // SSE Events
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        });
        res.write(`: connected\n\n`);
        sseEventClients.add(res);
        req.on("close", () => sseEventClients.delete(res));
        return;
      }

      if (req.method === "GET" && p.pathname === "/telemetry/schema") {
        const { CoreTelemetryV1 } = require("./telemetry/coreSchema.cjs");
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(CoreTelemetryV1));
        return;
      }

      if (req.method === "GET" && p.pathname === "/sessions") {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(Array.from(sessions.values())));
        return;
      }

      // Unknown route
      res.writeHead(404);
      res.end("not found");
    } catch (err) {
      res.writeHead(500);
      res.end(String(err?.message ?? err));
    }
  });

  server.listen(port, host, () => {
    console.log(`[supervisorApi] listening http://${host}:${port}`);
  });

  return {
    stop: () =>
      new Promise((resolve) => {
        try {
          server.close(() => resolve());
        } catch {
          resolve();
        }
      }),
    broadcastTelemetry,
    broadcastRawTelemetry,
    broadcastEvent,
    getSessions: () => Array.from(sessions.values()),
    getActiveSession,
    startSession,
    stopSession,
    port,
    host,
  };
}

module.exports = { start };
