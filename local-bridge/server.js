/**
 * iRacing → WebSocket bridge + local PWA dashboard.
 *
 * Run on the same Windows PC as iRacing:
 *   npm install
 *   npm start
 *
 * Then open http://localhost:3001 on ANY device on your network
 * (phone, tablet, second monitor). One command, no mixed content,
 * installable as a PWA from the browser menu ("Install app").
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { WebSocketServer } = require("ws");
const licensing = require("./licensing");
const teamRelay = require("./teamRelay");
const { TelemetryRecorder } = require("./telemetry-recorder");
const { parseTelemetryQuery } = require("./query-parser");

// Import Phase 13 & 14 Deterministic Runtime & Simulation components
const runtimeBus = require("./runtimeBus");
const binaryEncoder = require("./binaryEncoder");
const queryPlanner = require("./queryPlanner");
const { Worker } = require("worker_threads");
const simulationRuntime = require("./simulationRuntime");
const observability = require("./observability");
const carStateRuntime = require("./carStateRuntime");
const driverSwapContinuity = require("./driverSwapContinuity");
const pitStopRuntime = require("./pitStopRuntime");
const vehicleIdentityRuntime = require("./vehicleIdentityRuntime");

// Spawn and supervise isolated analytical worker thread
let analyticalWorker = null;
let previousFrame = null;

function startAnalyticalWorker() {
  try {
    const workerPath = path.join(__dirname, "workers", "analyticalWorker.js");
    analyticalWorker = new Worker(workerPath);
    console.log("[bridge] Analytical worker thread spawned successfully.");

    analyticalWorker.on("message", (msg) => {
      const { type, payload } = msg;
      if (type === "PREDICTION_RESULT") {
        runtimeBus.publish("PREDICTION_WARNING", payload.prediction);
      } else if (type === "STRATEGY_RESULT") {
        runtimeBus.publish("STINT_UPDATED", payload.strategy);
      } else if (type === "ERROR") {
        console.warn("[analytical-worker] Isolated thread error:", payload.message);
      }
    });

    analyticalWorker.on("error", (err) => {
      console.error("[analytical-worker] Thread crashed:", err.message);
      setTimeout(startAnalyticalWorker, 2000); // Auto-reboot after 2s
    });

    analyticalWorker.on("exit", (code) => {
      if (code !== 0) {
        console.warn(`[analytical-worker] Exited with code ${code}. Rebooting thread…`);
        setTimeout(startAnalyticalWorker, 2000);
      }
    });
  } catch (e) {
    console.error("[analytical-worker] Failed to initialize worker thread:", e.message);
  }
}

startAnalyticalWorker();

// Load .env from local-bridge directory (TEAM_CODE, SUPABASE_URL, etc.)
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Load local driver config if exists
const configPath = path.join(__dirname, "driver-config.json");
if (fs.existsSync(configPath)) {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    if (config.driverName) process.env.DRIVER_NAME = config.driverName;
    if (config.iracingId) process.env.IRACING_ID = config.iracingId;
    if (config.teamCode) process.env.TEAM_CODE = config.teamCode;
    console.log(`[bridge] Loaded saved driver config: ${config.driverName} (ID: ${config.iracingId}) | Team: ${config.teamCode}`);
  } catch (e) {
    console.warn("[bridge] Failed to load driver-config.json:", e.message);
  }
}

// ─── MongoDB Telemetry Recorder ───────────────────────────────────────────────────

// MONGO_URI is injected by the Electron Runtime Supervisor via env.
// If absent, recording silently degrades — bridge still works without MongoDB.
const MONGO_URI = process.env.MONGO_URI || null;
const USER_ID   = process.env.PITWALL_USER_ID || "local";

/** @type {import('./telemetry-recorder').TelemetryRecorder | null} */
let recorder = null;
let recorderConnected = false;
let recorderSampleCount = 0;
let recorderSessionId = null;
let lastRecordedLap = -1;

/**
 * Start a MongoDB recording session when iRacing connects.
 * Safe to call multiple times — creates a new recorder each connection.
 */
async function startRecordingSession(sessionInfo) {
  if (!MONGO_URI) return;
  try {
    if (recorder) await recorder.close();
  } catch {}

  recorder = new TelemetryRecorder(MONGO_URI, USER_ID, sessionInfo);
  recorderConnected = await recorder.connect();
  if (recorderConnected) {
    recorderSessionId = await recorder.startSession(Object.keys(latest || {}));
    recorderSampleCount = 0;
    lastRecordedLap = -1;
    console.log("[bridge] Telemetry recording started → MongoDB");

    // Asynchronously run tiered retention compaction
    try {
      const { executeRetentionPolicy } = require("./retention");
      executeRetentionPolicy(recorder.db).catch(err => {
        console.warn("[bridge] Retention policy sweep warning:", err.message);
      });
    } catch (e) {
      console.warn("[bridge] Failed to load retention sweeps module:", e.message);
    }
  }
}

async function stopRecordingSession() {
  if (!recorder) return;
  try {
    await recorder.close();
    console.log(`[bridge] Telemetry recording ended — ${recorderSampleCount} samples recorded`);
  } catch (e) {
    console.warn("[bridge] Recorder close error:", e.message);
  }
  recorder = null;
  recorderConnected = false;
  recorderSessionId = null;
}

let IRacingSDK = null;
let iracingInstance = null;
let currentIracingConnected = false;
const bridgeVersion = (() => {
  try { return require("./package.json").version || "unknown"; }
  catch { return "unknown"; }
})();
const serverStartedAt = Date.now();

try {
  ({ IRacingSDK } = require("irsdk-node"));
} catch (err) {
  console.warn("[bridge] irsdk-node unavailable — running in no-op mode.");
  console.warn(`[bridge] ${err.message}`);
}

/* ───────────────────────────────────────── Licensing System Activation */

let activeLicense = {
  valid: false,
  hwid: licensing.getHWID(),
  tier: "lite",
  expires: "never",
  error: "No license key installed."
};

const LICENSE_FILE = path.join(__dirname, "license.key");
if (fs.existsSync(LICENSE_FILE)) {
  try {
    const key = fs.readFileSync(LICENSE_FILE, "utf8").trim();
    const result = licensing.validateLicenseKey(key);
    if (result.valid) {
      activeLicense = {
        valid: true,
        hwid: result.hwid,
        tier: result.tier,
        expires: result.expires,
        error: null
      };
      console.log(`[bridge] Loaded valid license key (Tier: ${result.tier.toUpperCase()})`);
    } else {
      activeLicense.error = result.error;
      console.warn(`[bridge] Invalid license key file: ${result.error}`);
    }
  } catch (err) {
    activeLicense.error = err.message;
    console.error("[bridge] Failed to read license key file:", err);
  }
}

function broadcastLicenseStatus() {
  if (typeof wss === "undefined" || !wss) return;
  const msg = JSON.stringify({ type: "license", ...activeLicense });
  for (const client of wss.clients) {
    if (client.readyState === 1) {
      client.send(msg);
    }
  }
}

const PORT = 3001;
const TICK_HZ = 60; // iRacing SDK polls at 60Hz natively
const PUBLIC_DIR = path.join(__dirname, "public");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
};

// ─── TanStack Start SSR Fallback ────────────────────────────────────────────────
let ssrHandler = null;
(async function initSSR() {
  try {
    const serverPath = path.join(__dirname, 'server', 'server.js');
    if (fs.existsSync(serverPath)) {
      const { createServerAdapter } = await import('@whatwg-node/server');
      const ssrModule = await import("file://" + serverPath.replace(/\\/g, '/'));
      ssrHandler = createServerAdapter(ssrModule.default.fetch);
      console.log("[bridge] Mounted TanStack Start SSR Handler");
    }
  } catch (err) {
    console.log("[bridge] SSR adapter not found or failed, skipping SSR fallback:", err.message);
  }
})();

/* ───────────────────────────────────────── HTTP server (static PWA) */

const server = http.createServer(async (req, res) => {
  const urlPath = (req.url || "/").split("?")[0];

  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (urlPath === "/health" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      connected: true,
      iRacingConnected: currentIracingConnected,
      version: bridgeVersion,
      uptimeMs: Date.now() - serverStartedAt,
      timestamp: Date.now(),
    }));
    return;
  }

  /* ───────────────────────────────────────── Driver Config Endpoints */

  if (urlPath === "/api/driver/config" && req.method === "GET") {
    const configPath = path.join(__dirname, "driver-config.json");
    let config = { driverName: "", iracingId: "", teamCode: "" };
    if (fs.existsSync(configPath)) {
      try {
        config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      } catch {}
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(config));
    return;
  }

  if (urlPath === "/api/driver/config" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", () => {
      try {
        const payload = JSON.parse(body);
        const { driverName, iracingId, teamCode } = payload;
        
        // Save to file
        const configPath = path.join(__dirname, "driver-config.json");
        fs.writeFileSync(configPath, JSON.stringify({ driverName, iracingId, teamCode }, null, 2), "utf8");
        
        // Update environment variables
        process.env.DRIVER_NAME = driverName || "";
        process.env.IRACING_ID = iracingId || "";
        process.env.TEAM_CODE = teamCode || "";
        
        console.log(`[bridge] Configured driver: ${driverName} (ID: ${iracingId}) | Team: ${teamCode}`);
        
        // Re-initialize team relay dynamically
        teamRelay.init();
        
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, driverName, iracingId, teamCode }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  if (urlPath === "/api/replay/command" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", () => {
      try {
        const payload = JSON.parse(body);
        const { command } = payload;
        
        if (!iracingInstance || !currentIracingConnected) {
          res.writeHead(503, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: "iRacing SDK not connected" }));
          return;
        }

        switch (command) {
          case "seek": {
            const sessionNum = parseInt(payload.sessionNum ?? 0, 10);
            const sessionTimeMS = parseInt(payload.sessionTimeMS ?? 0, 10);
            iracingInstance.triggerReplaySessionSearch(sessionNum, sessionTimeMS);
            console.log(`[bridge] Replay seek sent: session ${sessionNum}, time ${sessionTimeMS}ms`);
            break;
          }
          case "speed": {
            const speedVal = parseFloat(payload.speed ?? 1.0);
            const slowMotion = !!payload.slowMotion;
            iracingInstance.changeReplaySpeed(speedVal, slowMotion);
            console.log(`[bridge] Replay speed sent: speed ${speedVal}, slow ${slowMotion}`);
            break;
          }
          case "position": {
            const positionVal = parseInt(payload.position ?? 1, 10); // ReplayPositionCommand (0=Begin, 1=Current, 2=End)
            const frameVal = parseInt(payload.frame ?? 0, 10);
            iracingInstance.changeReplayPosition(positionVal, frameVal);
            console.log(`[bridge] Replay position sent: command ${positionVal}, frame ${frameVal}`);
            break;
          }
          case "search": {
            const searchVal = parseInt(payload.searchCommand ?? 0, 10); // ReplaySearchCommand
            iracingInstance.searchReplay(searchVal);
            console.log(`[bridge] Replay search sent: command ${searchVal}`);
            break;
          }
          case "state": {
            const stateVal = parseInt(payload.state ?? 0, 10); // ReplayStateCommand
            iracingInstance.changeReplayState(stateVal);
            console.log(`[bridge] Replay state sent: command ${stateVal}`);
            break;
          }
          case "camera": {
            const positionVal = parseInt(payload.position ?? 0, 10);
            const groupVal = parseInt(payload.group ?? 1, 10);
            const cameraVal = parseInt(payload.camera ?? 0, 10);
            iracingInstance.changeCameraPosition(positionVal, groupVal, cameraVal);
            console.log(`[bridge] Camera position switch sent: position ${positionVal}, group ${groupVal}, camera ${cameraVal}`);
            break;
          }
          default:
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: `Unknown command: ${command}` }));
            return;
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, command }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  /* ───────────────────────────────────────── Licensing API Endpoints */

  if (urlPath === "/api/license" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(activeLicense));
    return;
  }

  if (urlPath === "/api/hwid" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ hwid: licensing.getHWID() }));
    return;
  }

  if (urlPath === "/api/license" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const payload = JSON.parse(body);
        const { key } = payload;
        const result = licensing.validateLicenseKey(key);
        if (result.valid) {
          fs.writeFileSync(LICENSE_FILE, key, "utf8");
          activeLicense = {
            valid: true,
            hwid: result.hwid,
            tier: result.tier,
            expires: result.expires,
            error: null
          };
          console.log(`[bridge] Activated license successfully (Tier: ${result.tier.toUpperCase()})`);
          broadcastLicenseStatus();
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, tier: result.tier, expires: result.expires }));
        } else {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: result.error }));
        }
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  /* ─────────────────────────────────────────── MongoDB Status API */

  if (urlPath === "/api/mongo/status" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      connected: recorderConnected,
      uri: MONGO_URI ? MONGO_URI.replace(/:([^@]+)@/, ":***@") : null,
      sessionId: recorderSessionId ? recorderSessionId.toString() : null,
      sampleCount: recorderSampleCount,
    }));
    return;
  }

  if (urlPath === "/api/sessions" && req.method === "GET") {
    if (!recorder || !recorderConnected) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "MongoDB not connected" }));
      return;
    }
    // Expose recent sessions for the HistoricalQueryPanel
    // (recorder.db is the MongoClient db instance)
    try {
      const sessions = await recorder.db
        .collection("telemetry_sessions")
        .find({}, { projection: { session_info_yaml: 0 } })
        .sort({ start_time: -1 })
        .limit(20)
        .toArray();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ sessions }));
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  if (urlPath === "/api/sessions/laps" && req.method === "GET") {
    const sessionId = new URL(req.url, `http://localhost`).searchParams.get("sessionId");
    if (!recorder || !recorderConnected || !sessionId) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "MongoDB not connected or no sessionId" }));
      return;
    }
    try {
      const { ObjectId } = require("mongodb");
      const laps = await recorder.db
        .collection("laps")
        .find({ session_id: new ObjectId(sessionId) })
        .sort({ lap_number: 1 })
        .toArray();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ laps }));
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  if (urlPath === "/api/events" && req.method === "GET") {
    if (!recorder || !recorderConnected) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "MongoDB not connected" }));
      return;
    }
    try {
      const params = new URL(req.url, "http://localhost").searchParams;
      let filter = {};
      let projection = {};

      const q = params.get("q");
      if (q) {
        const parsedQuery = parseTelemetryQuery(q);
        filter = parsedQuery.filter;
        projection = parsedQuery.projection;
      } else {
        if (params.get("track"))    filter.track    = params.get("track");
        if (params.get("car"))      filter.car      = params.get("car");
        if (params.get("category")) filter.category = params.get("category");
        if (params.get("severity")) filter.severity = params.get("severity");
        if (params.get("corner"))   filter.cornerNumber = parseInt(params.get("corner"), 10);
      }

      // Shape and optimize query using Phase 13 QueryPlanner
      const planned = queryPlanner.plan({ filter, projection }, recorderSessionId);

      const cursor = recorder.db
        .collection("scanner_events")
        .find(planned.filter, { projection: planned.projection });

      if (planned.hint) {
        cursor.hint(planned.hint);
      }

      const events = await cursor
        .sort({ timestamp: -1 })
        .limit(planned.limit)
        .toArray();

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ events }));
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  if (urlPath === "/api/events" && req.method === "POST") {
    if (!recorder || !recorderConnected) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "MongoDB not connected" }));
      return;
    }
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", async () => {
      try {
        const payload = JSON.parse(body);
        const { events } = payload;
        if (Array.isArray(events) && events.length > 0) {
          const { ObjectId } = require("mongodb");
          const docs = events.map(ev => {
            let sid = null;
            if (ev.session_id) {
              sid = ObjectId.isValid(ev.session_id) ? new ObjectId(ev.session_id) : ev.session_id;
            } else {
              sid = recorderSessionId;
            }
            return {
              session_id: sid,
              timestamp: ev.timestamp ? new Date(ev.timestamp) : new Date(),
              track: ev.track || "unknown",
              car: ev.car || "unknown",
              category: ev.category || "inputs",
              classification: ev.classification || "STABILITY",
              severity: ev.severity || "info",
              label: ev.label || "",
              description: ev.description || "",
              cornerNumber: ev.cornerNumber != null ? parseInt(ev.cornerNumber, 10) : undefined,
              lapNumber: ev.lapNumber != null ? parseInt(ev.lapNumber, 10) : undefined,
              metadata: ev.metadata || {},
            };
          });

          await recorder.db.collection("scanner_events").insertMany(docs);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, count: docs.length }));
        } else {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid events format" }));
        }
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (urlPath === "/api/setup-changes" && req.method === "GET") {
    if (!recorder || !recorderConnected) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "MongoDB not connected" }));
      return;
    }
    try {
      const params = new URL(req.url, "http://localhost").searchParams;
      const { ObjectId } = require("mongodb");
      const filter = {};
      const sid = params.get("sessionId");
      if (sid) {
        filter.session_id = ObjectId.isValid(sid) ? new ObjectId(sid) : sid;
      }
      const changes = await recorder.db
        .collection("setup_changes")
        .find(filter)
        .sort({ timestamp: -1 })
        .toArray();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ changes }));
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  if (urlPath === "/api/setup-changes" && req.method === "POST") {
    if (!recorder || !recorderConnected) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "MongoDB not connected" }));
      return;
    }
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", async () => {
      try {
        const payload = JSON.parse(body);
        const { session_id, lap_number, change_type, parameter, delta, consequences, notes } = payload;
        const { ObjectId } = require("mongodb");
        const doc = {
          session_id: session_id && ObjectId.isValid(session_id) ? new ObjectId(session_id) : (recorderSessionId || null),
          timestamp: new Date(),
          lap_number: lap_number != null ? parseInt(lap_number, 10) : 0,
          change_type: change_type || "general",
          parameter: parameter || "",
          delta: delta || "",
          consequences: Array.isArray(consequences) ? consequences : [],
          notes: notes || "",
        };
        await recorder.db.collection("setup_changes").insertOne(doc);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, change: doc }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (urlPath === "/api/team-profiles" && req.method === "GET") {
    if (!recorder || !recorderConnected) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "MongoDB not connected" }));
      return;
    }
    try {
      const profiles = await recorder.db
        .collection("team_profiles")
        .find({})
        .toArray();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ profiles }));
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  if (urlPath === "/api/team-profiles" && req.method === "POST") {
    if (!recorder || !recorderConnected) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "MongoDB not connected" }));
      return;
    }
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", async () => {
      try {
        const profile = JSON.parse(body);
        if (!profile.id) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Profile id is required" }));
          return;
        }

        await recorder.db.collection("team_profiles").updateOne(
          { id: profile.id },
          { $set: profile },
          { upsert: true }
        );
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, profile }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (urlPath === "/api/session-notes" && req.method === "GET") {
    if (!recorder || !recorderConnected) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "MongoDB not connected" }));
      return;
    }
    try {
      const params = new URL(req.url, "http://localhost").searchParams;
      const { ObjectId } = require("mongodb");
      const filter = {};
      const sid = params.get("sessionId");
      if (sid) {
        filter.session_id = ObjectId.isValid(sid) ? new ObjectId(sid) : sid;
      }
      const notes = await recorder.db
        .collection("session_notes")
        .find(filter)
        .sort({ timestamp: -1 })
        .toArray();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ notes }));
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  if (urlPath === "/api/session-notes" && req.method === "POST") {
    if (!recorder || !recorderConnected) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "MongoDB not connected" }));
      return;
    }
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", async () => {
      try {
        const payload = JSON.parse(body);
        const { session_id, lap_number, corner_number, engineer_name, notes, linked_incident_id, replay_bookmark_sec } = payload;
        const { ObjectId } = require("mongodb");
        const doc = {
          session_id: session_id && ObjectId.isValid(session_id) ? new ObjectId(session_id) : (recorderSessionId || null),
          timestamp: new Date(),
          lap_number: lap_number != null ? parseInt(lap_number, 10) : undefined,
          corner_number: corner_number != null ? parseInt(corner_number, 10) : undefined,
          engineer_name: engineer_name || "Lead Engineer",
          notes: notes || "",
          linked_incident_id: linked_incident_id && ObjectId.isValid(linked_incident_id) ? new ObjectId(linked_incident_id) : undefined,
          replay_bookmark_sec: replay_bookmark_sec != null ? parseFloat(replay_bookmark_sec) : undefined,
        };
        await recorder.db.collection("session_notes").insertOne(doc);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, note: doc }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  /* ────────────────────────────────────── Strategy, Bookmarks and Setup Notebook API */

  if (urlPath === "/api/notebook/notes" && req.method === "GET") {
    if (!recorder || !recorderConnected) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "MongoDB not connected" }));
      return;
    }
    try {
      const params = new URL(req.url, "http://localhost").searchParams;
      const { ObjectId } = require("mongodb");
      const filter = {};
      const sid = params.get("sessionId");
      if (sid) {
        filter.session_id = ObjectId.isValid(sid) ? new ObjectId(sid) : sid;
      }
      const notes = await recorder.db
        .collection("engineering_notes")
        .find(filter)
        .sort({ timestamp: -1 })
        .toArray();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ notes }));
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  if (urlPath === "/api/notebook/notes" && req.method === "POST") {
    if (!recorder || !recorderConnected) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "MongoDB not connected" }));
      return;
    }
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", async () => {
      try {
        const payload = JSON.parse(body);
        const { session_id, title, content, engineer_name, tags } = payload;
        const { ObjectId } = require("mongodb");
        const doc = {
          session_id: session_id && ObjectId.isValid(session_id) ? new ObjectId(session_id) : (recorderSessionId || null),
          timestamp: new Date(),
          title: title || "Stint Strategy Update",
          content: content || "",
          engineer_name: engineer_name || "Lead Engineer",
          tags: Array.isArray(tags) ? tags : [],
        };
        await recorder.db.collection("engineering_notes").insertOne(doc);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, note: doc }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (urlPath === "/api/notebook/bookmarks" && req.method === "GET") {
    if (!recorder || !recorderConnected) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "MongoDB not connected" }));
      return;
    }
    try {
      const params = new URL(req.url, "http://localhost").searchParams;
      const { ObjectId } = require("mongodb");
      const filter = {};
      const sid = params.get("sessionId");
      if (sid) {
        filter.session_id = ObjectId.isValid(sid) ? new ObjectId(sid) : sid;
      }
      const bookmarks = await recorder.db
        .collection("notebook_bookmarks")
        .find(filter)
        .sort({ timestamp: -1 })
        .toArray();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ bookmarks }));
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  if (urlPath === "/api/notebook/bookmarks" && req.method === "POST") {
    if (!recorder || !recorderConnected) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "MongoDB not connected" }));
      return;
    }
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", async () => {
      try {
        const payload = JSON.parse(body);
        const { session_id, lap_number, replay_tick, label, description } = payload;
        const { ObjectId } = require("mongodb");
        const doc = {
          session_id: session_id && ObjectId.isValid(session_id) ? new ObjectId(session_id) : (recorderSessionId || null),
          timestamp: new Date(),
          lap_number: lap_number != null ? parseInt(lap_number, 10) : 1,
          replay_tick: replay_tick != null ? parseInt(replay_tick, 10) : 0,
          label: label || "Replay Hotspot",
          description: description || "",
        };
        await recorder.db.collection("notebook_bookmarks").insertOne(doc);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, bookmark: doc }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (urlPath === "/api/notebook/snapshots" && req.method === "GET") {
    if (!recorder || !recorderConnected) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "MongoDB not connected" }));
      return;
    }
    try {
      const params = new URL(req.url, "http://localhost").searchParams;
      const { ObjectId } = require("mongodb");
      const filter = {};
      const sid = params.get("sessionId");
      if (sid) {
        filter.session_id = ObjectId.isValid(sid) ? new ObjectId(sid) : sid;
      }
      const snapshots = await recorder.db
        .collection("setup_snapshots")
        .find(filter)
        .sort({ timestamp: -1 })
        .toArray();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ snapshots }));
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  if (urlPath === "/api/notebook/snapshots" && req.method === "POST") {
    if (!recorder || !recorderConnected) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "MongoDB not connected" }));
      return;
    }
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", async () => {
      try {
        const payload = JSON.parse(body);
        const { session_id, lap_number, chassis_profile, springs, dampers, wing_angle, tire_pressures } = payload;
        const { ObjectId } = require("mongodb");
        const doc = {
          session_id: session_id && ObjectId.isValid(session_id) ? new ObjectId(session_id) : (recorderSessionId || null),
          timestamp: new Date(),
          lap_number: lap_number != null ? parseInt(lap_number, 10) : 1,
          chassis_profile: chassis_profile || "gt3",
          springs: springs || {},
          dampers: dampers || {},
          wing_angle: wing_angle != null ? parseFloat(wing_angle) : 0,
          tire_pressures: tire_pressures || {},
        };
        await recorder.db.collection("setup_snapshots").insertOne(doc);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, snapshot: doc }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (urlPath === "/api/intelligence/correlations" && req.method === "GET") {
    if (!recorder || !recorderConnected) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "MongoDB not connected" }));
      return;
    }
    try {
      const params = new URL(req.url, "http://localhost").searchParams;
      const track = params.get("track") || "unknown";
      const car = params.get("car") || "unknown";
      const ambient = parseFloat(params.get("ambient") || "20");
      const rebound = parseInt(params.get("rebound") || "0", 10);
      const laps = parseInt(params.get("laps") || "0", 10);

      // Query historical setup changes and scanner events to feed the correlation builder
      const [changes, events] = await Promise.all([
        recorder.db.collection("setup_changes").find({}).limit(50).toArray(),
        recorder.db.collection("scanner_events").find({}).limit(100).toArray()
      ]);

      const { calculateSessionCorrelations } = require("../src/lib/session-intelligence/correlationEngine");
      const correlation = calculateSessionCorrelations(track, car, rebound, ambient, laps, changes, events);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ correlation }));
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  if (urlPath === "/api/multi-car/sessions" && req.method === "GET") {
    if (!recorder || !recorderConnected) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "MongoDB not connected" }));
      return;
    }
    try {
      const sessions = await recorder.db
        .collection("telemetry_sessions")
        .find({ garage_sharing: true })
        .sort({ start_time: -1 })
        .toArray();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ sessions }));
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  if (urlPath === "/api/multi-car/telemetry" && req.method === "GET") {
    if (!recorder || !recorderConnected) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "MongoDB not connected" }));
      return;
    }
    try {
      const params = new URL(req.url, "http://localhost").searchParams;
      const carNumber = params.get("carNumber") || "unknown";
      const telemetry = await recorder.db
        .collection("telemetry_samples")
        .find({ car_number: carNumber })
        .sort({ timestamp: 1 })
        .limit(100)
        .toArray();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ telemetry }));
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  if (urlPath === "/api/sandbox/simulate" && req.method === "POST") {
    if (!recorder || !recorderConnected) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "MongoDB not connected" }));
      return;
    }
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", async () => {
      const startQueryTime = Date.now();
      try {
        const payload = JSON.parse(body);
        const { sessionId, adjustments } = payload;
        const { ObjectId } = require("mongodb");
        
        if (!sessionId) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "sessionId is required for scenario cloning" }));
          return;
        }

        const sid = ObjectId.isValid(sessionId) ? new ObjectId(sessionId) : sessionId;

        // Fetch baseline telemetry ticks from indexed collection
        const samples = await recorder.db
          .collection("telemetry_samples")
          .find({ session_id: sid })
          .sort({ timestamp: 1 })
          .toArray();

        // Enforce Replay Sort Normalization Guarantees: sort strictly by (sequenceId ASC, timestamp ASC) keys
        samples.sort((a, b) => {
          const seqA = a.sequence_id || a.channels?.sequenceId || a.channels?.carOperationalState?.sequenceId || 0;
          const seqB = b.sequence_id || b.channels?.sequenceId || b.channels?.carOperationalState?.sequenceId || 0;
          if (seqA !== seqB) return seqA - seqB;
          const tsA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const tsB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return tsA - tsB;
        });

        // Run counterfactual physical stint simulation using our Physics layer
        const counterfactual = simulationRuntime.simulateCounterfactualStint(samples, adjustments || {});

        // Log query planning performance to our self-monitoring observability tracker
        observability.recordQueryLatency(Date.now() - startQueryTime);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          success: true,
          count: counterfactual.length,
          counterfactual
        }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (urlPath === "/api/observability/metrics" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      success: true,
      metrics: observability.getMetrics()
    }));
    return;
  }

  /* ────────────────────────────────────── Static File Serving */

  let filePath = path.join(PUBLIC_DIR, urlPath === "/" ? "index.html" : urlPath);

  // Prevent path traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("forbidden");
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isFile()) {
      fs.readFile(filePath, (e, data) => {
        if (e) {
          res.writeHead(404);
          res.end("not found");
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, {
          "Content-Type": MIME[ext] || "application/octet-stream",
          "Cache-Control": "no-cache",
        });
        res.end(data);
      });
    } else {
      if (ssrHandler) {
        return ssrHandler(req, res);
      }
      // SPA fallback
      const fallbackPath = path.join(PUBLIC_DIR, "index.html");
      fs.readFile(fallbackPath, (e, data) => {
        if (e) {
          res.writeHead(404);
          res.end("not found");
          return;
        }
        res.writeHead(200, {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-cache",
        });
        res.end(data);
      });
    }
  });
});

const wss = new WebSocketServer({ server });
server.listen(PORT, () => {
  console.log(`[bridge] dashboard:  http://localhost:${PORT}`);
  console.log(`[bridge] websocket:  ws://localhost:${PORT}`);
  printNetworkUrls(PORT);
  // Init team relay AFTER server is up (dotenv already loaded above)
  teamRelay.init();
});

let latest = null;
let packetCount = 0;
let currentLap = 0;

if (IRacingSDK) {
  const iracing = new IRacingSDK({ autoEnableTelemetry: true });
  iracingInstance = iracing;
  let wasConnected = false;

  setInterval(() => {
    const connected = iracing.sessionStatusOK || iracing.startSDK();
    currentIracingConnected = Boolean(connected);
    if (connected !== wasConnected) {
      console.log(connected ? "[bridge] iRacing connected" : "[bridge] iRacing disconnected");
      wasConnected = connected;
      if (connected) {
        // Start recording session when iRacing connects
        const sessionData = iracing.getSessionData();
        const weekend = sessionData?.WeekendInfo;
        const driverInfo = sessionData?.DriverInfo;
        const me = driverInfo?.Drivers?.[driverInfo?.DriverCarIdx] ?? {};
        startRecordingSession({
          track:  weekend?.TrackDisplayName ?? "unknown",
          car:    me.CarScreenName ?? "unknown",
          driver: process.env.DRIVER_NAME || me.UserName || "unknown",
          sessionInfoYaml: "",
        });
        vehicleIdentityRuntime.initializeSession({
          carId: me.CarScreenName ?? "unknown",
          carNumber: me.CarNumber ?? "0",
          carName: me.CarScreenName ?? "Unknown Car",
          teamId: process.env.TEAM_CODE || "local",
          driverId: process.env.DRIVER_NAME || me.UserName || "unknown",
          env: {
            trackTempC: weekend?.WeekendOptions?.TrackTemp ?? 0,
            airTempC: weekend?.WeekendOptions?.AirTemp ?? 0,
          }
        });
      } else {
        // Stop recording when iRacing disconnects
        stopRecordingSession();
      }
    }
    if (!connected || !iracing.waitForData(1000 / TICK_HZ)) return;
    const flat = flattenTelemetry(iracing.getTelemetry());
    if (packetCount === 1) {
      const keys = Object.keys(flat).filter((k) => /temp|wear|brake|press|surface/i.test(k));
      require("fs").writeFileSync("keys_dump.json", JSON.stringify(keys, null, 2));
    }
    latest = mapTelemetry(flat, iracing.getSessionData());
    latest.all = flat;
    currentLap = flat.Lap ?? 0;
    packetCount += 1;

    // Phase 15 Endurance State calculations
    carStateRuntime.updateCarState(latest, 1 / TICK_HZ);
    const swapReport = driverSwapContinuity.detectSwapAndTrackAdaptation(latest, currentLap);
    
    // Authoritative Ingest to produce deterministic nextState & sequences
    const enduranceState = carStateRuntime.getCurrentState();
    const nextState = vehicleIdentityRuntime.ingestFrame(latest, enduranceState, swapReport, currentLap);
    
    // Add authoritative state to frame projection
    latest.carOperationalState = nextState;
    latest.enduranceState = enduranceState;
    if (swapReport) {
      latest.adaptationState = swapReport;
    }

    // Periodically persist coherent state snapshot & deltas to MongoDB (every 10s)
    if (recorder && recorderConnected && packetCount % (TICK_HZ * 10) === 0) {
      vehicleIdentityRuntime.persistSnapshot(recorder.db, recorderSessionId);
      vehicleIdentityRuntime.flushDeltasToMongo(recorder.db, recorderSessionId);
    }

    // Publish live frame tick to the Decoupled Runtime Event Bus
    runtimeBus.publish("FRAME_RECEIVED", latest);

    // Delegate high-frequency calculations to the isolated analytical worker
    if (analyticalWorker) {
      const currentTick = {
        tick: latest.tick || packetCount,
        speedMps: latest.speedKph / 3.6,
        brake: latest.brake,
        throttle: latest.throttle,
        steeringWheelAngle: (latest.steeringDeg * Math.PI) / 180,
        yawRate: latest.yawRate || latest.all?.YawRate || 0,
        pitch: latest.all?.Pitch || 0,
        roll: latest.all?.Roll || 0,
        mgukDeploykW: latest.all?.MgukDeploykW || 0,
        frontLeftDeflection: latest.all?.LFshockDefl || latest.all?.LFshockDefl_ST || 0,
        rearRightSpeedMps: latest.all?.RRspeed || 0,
        rearLeftSpeedMps: latest.all?.LRspeed || 0
      };

      analyticalWorker.postMessage({
        type: "PROCESS_TICK",
        payload: {
          current: currentTick,
          previous: previousFrame || currentTick,
          hz: TICK_HZ
        }
      });

      previousFrame = currentTick;
    }

    // ─── Telemetry Recording ─────────────────────────────────────────────────────
    if (recorder && recorderConnected) {
      // Record 60Hz sample
      recorder.recordSample(flat, currentLap);
      recorderSampleCount++;

      // Record completed lap metadata
      const lapTime = flat.LapLastLapTime ?? 0;
      if (currentLap > lastRecordedLap && lapTime > 0 && currentLap > 0) {
        lastRecordedLap = currentLap;
        recorder.recordLap(
          currentLap,
          lapTime,
          flat.FuelLevel ?? 0,
          flat.TrackTemp ?? 0,
          flat.AirTemp ?? 0,
        );
      }
    }
    // ──────────────────────────────────────────────────────────────────────

    if (packetCount === 1 || packetCount % (TICK_HZ * 5) === 0) {
      console.log(
        `[bridge] live packets=${packetCount} speed=${Math.round(latest.speedKph)}kph rpm=${Math.round(
          latest.rpm,
        )} gear=${latest.gear} clients=${wss.clients.size}`,
      );
    }
  }, 1000 / TICK_HZ);
}

// 60Hz local WebSocket broadcast (Binary & JSON adaptive transport)
setInterval(() => {
  if (!latest || wss.clients.size === 0) return;

  let jsonMsg = null;
  let binaryMsg = null;

  for (const client of wss.clients) {
    if (client.readyState === 1) {
      if (client.isBinary) {
        if (!binaryMsg) {
          binaryMsg = binaryEncoder.encodeTelemetry(latest);
        }
        client.send(binaryMsg);
      } else {
        if (!jsonMsg) {
          jsonMsg = JSON.stringify({
            carId: latest.carNumber || "963",
            teamId: "team_pitwall",
            driverId: latest.driver || "driver_A",
            payload: latest
          });
        }
        client.send(jsonMsg);
      }
    }
  }
}, 1000 / TICK_HZ);

// 2Hz team relay publish (Supabase Realtime — no-op if TEAM_CODE not set)
setInterval(() => {
  if (!latest) return;
  teamRelay.publish(latest);
}, 500); // 2Hz = every 500ms

wss.on("connection", (ws) => {
  console.log("[bridge] dashboard connected");
  ws.send(JSON.stringify({ type: "license", ...activeLicense }));
  if (latest) {
    if (ws.isBinary) {
      ws.send(binaryEncoder.encodeTelemetry(latest));
    } else {
      ws.send(JSON.stringify({
        carId: latest.carNumber || "963",
        teamId: "team_pitwall",
        driverId: latest.driver || "driver_A",
        payload: latest
      }));
    }
  }

  // Handle client-initiated WebSocket messages for protocol negotiation
  ws.on("message", (msg) => {
    try {
      const payloadStr = msg.toString().trim();
      if (payloadStr === "protocol:binary") {
        ws.isBinary = true;
        console.log("[bridge] WebSocket connection upgraded to binary protocol");
      } else if (payloadStr === "protocol:json") {
        ws.isBinary = false;
        console.log("[bridge] WebSocket connection downgraded to json protocol");
      }
    } catch (e) {
      console.warn("[bridge] Error parsing WebSocket message:", e.message);
    }
  });

  ws.on("close", () => console.log("[bridge] dashboard disconnected"));
});

// Graceful shutdown — close recorder and Supabase channel cleanly
process.on("SIGINT",  async () => { await stopRecordingSession(); teamRelay.disconnect(); process.exit(0); });
process.on("SIGTERM", async () => { await stopRecordingSession(); teamRelay.disconnect(); process.exit(0); });

function printNetworkUrls(port) {
  try {
    const ifaces = require("os").networkInterfaces();
    for (const name of Object.keys(ifaces)) {
      for (const i of ifaces[name] || []) {
        if (i.family === "IPv4" && !i.internal) {
          console.log(`[bridge] network:    http://${i.address}:${port}`);
        }
      }
    }
  } catch {}
}

/* ───────────────────────────────────────── Telemetry mapping */

function flattenTelemetry(raw) {
  const values = {};
  for (const [key, variable] of Object.entries(raw ?? {})) {
    const value =
      variable && typeof variable === "object" && "value" in variable ? variable.value : variable;
    values[key] = Array.isArray(value) ? value[0] : value;
  }
  return values;
}

function mapTelemetry(v, session) {
  const driverInfo = session?.DriverInfo;
  const weekend = session?.WeekendInfo;
  const drivers = driverInfo?.Drivers ?? [];
  const me = drivers[driverInfo?.DriverCarIdx] ?? {};

  const rpm = v.RPM ?? 0;
  const speedMs = v.Speed ?? 0;

  return {
    connected: true,
    source: "live",
    session:
      `${weekend?.EventType ?? "SESSION"} — ${weekend?.TrackDisplayName ?? "TRACK"}`.toUpperCase(),
    track: weekend?.TrackDisplayName ?? "—",
    car: me.CarScreenName ?? "—",
    carNumber: me.CarNumber ?? "0",
    sdkVersion: "irsdk v1.0",
    latencyMs: 0,
    safetyRating: parseFloat(me.LicSafetyRating ?? "0"),

    gear: v.Gear ?? 0,
    speedKph: Math.max(0, speedMs * 3.6),
    rpm,
    rpmMax: driverInfo?.DriverCarSLLastRPM ?? 11000,
    rpmShiftWarn: driverInfo?.DriverCarSLShiftRPM ?? 8800,
    rpmShiftRedline: driverInfo?.DriverCarSLBlinkRPM ?? 9800,

    throttle: clamp01(v.Throttle ?? 0),
    brake: clamp01(v.Brake ?? 0),
    clutch: clamp01(1 - (v.Clutch ?? 1)),
    steeringDeg: ((v.SteeringWheelAngle ?? 0) * 180) / Math.PI,

    lastLap: formatLap(v.LapLastLapTime),
    bestLap: formatLap(v.LapBestLapTime),
    deltaSec: v.LapDeltaToBestLap ?? 0,
    sectors: updateSectors(v, session),

    fuelRemainingL: v.FuelLevel ?? 0,
    fuelUsePerHour: v.FuelUsePerHour ?? 0,       // kg/hr from iRacing (≈ L/hr for petrol)
    lapLastLapTimeSec: v.LapLastLapTime ?? 0,     // raw seconds — lets UI compute burn per lap
    lapsEstimated: estimateLaps(v),

    tires: {
      fl: tireCorner(v, "LF"),
      fr: tireCorner(v, "RF"),
      rl: tireCorner(v, "LR"),
      rr: tireCorner(v, "RR"),
    },

    gLat: v.LatAccel ?? 0,
    gLon: v.LongAccel ?? 0,
    drsAvailable: !!v.DRS_Status,
    brakeBias: v.dcBrakeBias ?? 0,
    diffMap: v.dcDiffEntry ?? 0,
    airTempC: weekend?.WeekendOptions?.AirTemp ?? 0,
    trackTempC: weekend?.WeekendOptions?.TrackTemp ?? 0,
    liveAirTempC: v.AirTemp ?? weekend?.WeekendOptions?.AirTemp ?? 0,
    liveTrackTempC: v.TrackTemp ?? weekend?.WeekendOptions?.TrackTemp ?? 0,
    airDensity: v.AirDensity ?? 0,
    airPressure: v.AirPressure ?? 101325,
    windVel: v.WindVel ?? 0,
    windDir: v.WindDir ?? 0,
    trackWetness: v.TrackWetness ?? 0,
    sof: session?.SessionInfo?.Sessions?.[0]?.ResultsFastestLap?.[0]?.FastestLap ?? 0,
    myCarIdx: driverInfo?.DriverCarIdx ?? -1,
    competitors: getCompetitors(v, session),

    /**
     * High-value extras forwarded from iRacing shared memory.
     * These are optional — only populated when the car/session exports the channel.
     * The UI/AI engines read these via t.extras[key].
     */
    extras: {
      // Yaw rate (rad/s) — body rotation, useful for detecting oversteer/snap
      YawRate: v.YawRate ?? 0,
      // Yaw (rad) — cumulative yaw angle
      Yaw: v.Yaw ?? 0,
      // Front-left shock deflection (m) — damper travel, bump/rebound indicator
      LFshockDefl: v.LFshockDefl ?? v.LFshockDefl_ST ?? 0,
      RFshockDefl: v.RFshockDefl ?? v.RFshockDefl_ST ?? 0,
      LRshockDefl: v.LRshockDefl ?? v.LRshockDefl_ST ?? 0,
      RRshockDefl: v.RRshockDefl ?? v.RRshockDefl_ST ?? 0,
      // Brake line pressure per corner (Pa) — braking trace, bias indicator
      BrakeLinePressureLF: v.LFbrakeLinePress ?? 0,
      BrakeLinePressureRF: v.RFbrakeLinePress ?? 0,
      BrakeLinePressureLR: v.LRbrakeLinePress ?? 0,
      BrakeLinePressureRR: v.RRbrakeLinePress ?? 0,
      // Tyre lateral/longitudinal force (N) — if car supports it
      LFtireForceLatN: v.LFtireForceLatN ?? 0,
      RFtireForceLatN: v.RFtireForceLatN ?? 0,
      // Wheel speed per corner (rad/s) — wheel lock detection
      LFwheelSpeed: v.LFwheelSpeed ?? 0,
      RFwheelSpeed: v.RFwheelSpeed ?? 0,
      LRwheelSpeed: v.LRwheelSpeed ?? 0,
      RRwheelSpeed: v.RRwheelSpeed ?? 0,
      // Pitch/roll rates (rad/s)
      Pitch: v.Pitch ?? 0,
      Roll: v.Roll ?? 0,
      PitchRate: v.PitchRate ?? 0,
      RollRate: v.RollRate ?? 0,
      // Velocity components (m/s) in body frame
      VelocityX: v.VelocityX ?? 0,
      VelocityY: v.VelocityY ?? 0,
      VelocityZ: v.VelocityZ ?? 0,
    },
  };
}

const wearTracker = { LF: 100, RF: 100, LR: 100, RR: 100, lastTime: 0, dt: 0 };
function getEstimatedWear(v, c, tempC) {
  const time = v.SessionTime ?? 0;
  if (c === "LF") {
    wearTracker.dt = time - (wearTracker.lastTime || time);
    wearTracker.lastTime = time;
  }
  const dt = wearTracker.dt;
  if (v.PlayerTrackSurface === 3 && (v.Speed ?? 0) < 1) {
    wearTracker[c] = 100;
  }
  const speed = v.Speed ?? 0;
  if (dt > 0 && speed > 5) {
    const gForce = Math.sqrt(Math.pow(v.LatAccel ?? 0, 2) + Math.pow(v.LongAccel ?? 0, 2));
    let heatMult = 1.0;
    if (tempC > 100) heatMult += (tempC - 100) * 0.02;
    if (tempC < 60) heatMult += (60 - tempC) * 0.01;
    let loadMult = 1.0 + gForce * 0.5;
    wearTracker[c] -= 0.000002 * speed * dt * heatMult * loadMult;
    wearTracker[c] = Math.max(0, wearTracker[c]);
  }
  return wearTracker[c];
}

function tireCorner(v, c) {
  // Live Surface Temperatures
  const tempL = v[`${c}tempL`] ?? v[`${c}tempCL`] ?? 0;
  const tempM = v[`${c}tempM`] ?? v[`${c}tempCM`] ?? 0;
  const tempR = v[`${c}tempR`] ?? v[`${c}tempCR`] ?? 0;
  const tempC = (tempL + tempM + tempR) / 3 || 0;

  // Wear (Only updates in pit, but kept for UI)
  const wearL = v[`${c}wearL`] ?? 1;
  const wearM = v[`${c}wearM`] ?? 1;
  const wearR = v[`${c}wearR`] ?? 1;
  const wearPct = Math.round(((wearL + wearM + wearR) / 3) * 100);

  // Live running pressure (fallback to coldPressure)
  const pressureKPa = v[`${c}pressure`] ?? v[`${c}coldPressure`] ?? 0;

  // Brakes (some cars only export these natively)
  const brakeTempC = v[`${c}brakeTempC`] ?? v[`${c}brakeTemp`] ?? 0;
  const brakeLinePress = v[`${c}brakeLinePress`] ?? 0;

  return {
    tempC,
    pressureBar: pressureKPa / 100,
    wearPct,
    estWearPct: getEstimatedWear(v, c, tempC),
    brakeTempC,
    brakeLinePress,
    state: tempC > 92 ? "hot" : tempC < 70 ? "cold" : "ok",
  };
}

const sectorTracker = {
  s1: null,
  s2: null,
  s3: null,
  lastPct: 0,
  lapStartSec: 0,
  splits: [],
  lastLapTime: 0,
};

function updateSectors(v, session) {
  if (!sectorTracker.splits.length && session?.SplitTimeInfo?.Sectors) {
    try {
      const s = session.SplitTimeInfo.Sectors;
      sectorTracker.splits = Array.isArray(s) ? s.map((x) => x.SectorStartPct) : [];
    } catch {}
  }

  const pct = v.LapDistPct ?? 0;
  const time = v.SessionTime ?? 0;

  // Detect lap crossing
  if (pct < 0.05 && sectorTracker.lastPct > 0.9) {
    // If we finished a lap, s3 is the remainder
    if (sectorTracker.s1 && sectorTracker.s2 && v.LapLastLapTime > 0) {
      sectorTracker.s3 = v.LapLastLapTime - sectorTracker.s1 - sectorTracker.s2;
    }

    // Hold the previous lap sectors for a few seconds if we want,
    // but the dashboard updates instantly. Let us reset them so they populate live.
    sectorTracker.lapStartSec = time - pct * (v.Speed ?? 0); // approximate start
    sectorTracker.s1 = null;
    sectorTracker.s2 = null;
  }
  sectorTracker.lastPct = pct;

  if (sectorTracker.splits.length >= 3) {
    const s1End = sectorTracker.splits[1];
    const s2End = sectorTracker.splits[2];

    if (!sectorTracker.s1 && pct > s1End && pct < s2End) {
      sectorTracker.s1 = time - sectorTracker.lapStartSec;
    }
    if (!sectorTracker.s2 && pct > s2End) {
      sectorTracker.s2 = time - sectorTracker.lapStartSec - (sectorTracker.s1 || 0);
    }
  }

  // Formatting helper
  const fmtSec = (val) => (val ? val.toFixed(3) : "--.---");

  return {
    s1: fmtSec(sectorTracker.s1),
    s2: fmtSec(sectorTracker.s2),
    s3: fmtSec(sectorTracker.s3),
    bestSector: null,
  };
}

function getCompetitors(v, session) {
  try {
    const sNum = v.SessionNum ?? 0;
    const s = session?.SessionInfo?.Sessions?.[sNum] || session?.SessionInfo?.Sessions?.[0];
    const positions = s?.ResultsPositions;
    if (!Array.isArray(positions)) return [];
    return positions.map((p) => ({
      pos: p.Position ?? 0,
      carIdx: p.CarIdx ?? -1,
      lap: p.Lap ?? 0,
      lastTime: p.LastTime ?? -1,
      fastestTime: p.FastestTime ?? -1,
    }));
  } catch {
    return [];
  }
}

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function formatLap(sec) {
  if (!sec || sec <= 0) return "--:--.---";
  const m = Math.floor(sec / 60);
  const s = (sec - m * 60).toFixed(3).padStart(6, "0");
  return `${m}:${s}`;
}

function estimateLaps(v) {
  const fuel = v.FuelLevel ?? 0;
  const perLap =
    v.FuelUsePerHour && v.LapLastLapTime ? (v.FuelUsePerHour * v.LapLastLapTime) / 3600 : 2.5;
  return perLap > 0 ? fuel / perLap : 0;
}
