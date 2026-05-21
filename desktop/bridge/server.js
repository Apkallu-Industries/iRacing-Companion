/**
 * iRacing → WebSocket bridge + local PWA dashboard.
 *
 * Run on the same Windows PC as iRacing:
 *   npm install
 *   npm start
 *
 * Then open http://localhost:3001 on ANY device on your network.
 *
 * Tunable limits (env vars):
 *   PITWALL_ARRAY_DEPTH   how many entries per exploded array channel (default 64,
 *                         covers CarIdx* across all 64 cars). Set higher to keep
 *                         every entry, lower to shrink payloads.
 *   PITWALL_EXTRAS_MAX_KB max size of the `extras` payload sent over WS, in KB
 *                         (default 512). If the serialized extras exceeds this,
 *                         exploded array entries are dropped from the tail until
 *                         under cap, before scalar channels are touched.
 *   PITWALL_WS_HZ         WebSocket broadcast rate (default 30). Lower this if
 *                         the UI stutters; sampling stays at TICK_HZ so the
 *                         recorder is unaffected.
 *   PITWALL_SAMPLE_HZ     iRacing SDK polling rate (default 30).
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { WebSocketServer } = require("ws");
const lapCache = require("./lap-cache");

let IRacingSDK = null;
try {
  ({ IRacingSDK } = require("irsdk-node"));
} catch (err) {
  console.warn("[bridge] irsdk-node unavailable — running in no-op mode.");
  console.warn(`[bridge] ${err.message}`);
}

const PORT = 3001;
const TICK_HZ = Number(process.env.PITWALL_SAMPLE_HZ) || 30;
const WS_HZ = Number(process.env.PITWALL_WS_HZ) || 30;
const ARRAY_DEPTH = Math.max(1, Number(process.env.PITWALL_ARRAY_DEPTH) || 64);
const EXTRAS_MAX_BYTES = Math.max(16, Number(process.env.PITWALL_EXTRAS_MAX_KB) || 512) * 1024;
const PUBLIC_DIR = path.join(__dirname, "public");

console.log(
  `[bridge] limits: arrayDepth=${ARRAY_DEPTH} extrasMaxKB=${Math.round(
    EXTRAS_MAX_BYTES / 1024,
  )} wsHz=${WS_HZ} tickHz=${TICK_HZ}`,
);

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

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/* ───────────────────────────────────────── HTTP server (static PWA) */

const server = http.createServer((req, res) => {
  const urlPath = (req.url || "/").split("?")[0];

  // Offline lap cache endpoint
  if (urlPath === "/api/laps") {
    const limit = Number(new URL(req.url, "http://x").searchParams.get("limit")) || 500;
    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      ...CORS,
      "Cache-Control": "no-store",
    });
    res.end(JSON.stringify({ file: lapCache.FILE, laps: lapCache.readLaps(limit) }));
    return;
  }

  if (urlPath === "/api/laps/mark-synced" && req.method === "POST") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      let ts = [];
      try { ts = JSON.parse(body).timestamps || []; } catch {}
      const changed = lapCache.markSynced(ts);
      res.writeHead(200, { "Content-Type": "application/json", ...CORS });
      res.end(JSON.stringify({ ok: true, changed }));
    });
    return;
  }

  // Live bridge configuration (read-only).
  if (urlPath === "/api/config") {
    res.writeHead(200, { "Content-Type": "application/json", ...CORS, "Cache-Control": "no-store" });
    res.end(JSON.stringify({
      tickHz: TICK_HZ,
      wsHz: WS_HZ,
      arrayDepth: ARRAY_DEPTH,
      extrasMaxBytes: EXTRAS_MAX_BYTES,
      connected: !!latest,
      packets: packetCount,
    }));
    return;
  }

  // Downloadable telemetry schema: every channel iRacing exposes this session,
  // including type code and array length. Use this to confirm the bridge
  // matches .ibt layout for the car you're driving.
  if (urlPath === "/api/schema") {
    const download = new URL(req.url, "http://x").searchParams.get("download") === "1";
    if (!latestSchema) {
      res.writeHead(503, { "Content-Type": "application/json", ...CORS });
      res.end(JSON.stringify({ error: "Schema not built yet — start iRacing and load into a session." }));
      return;
    }
    const filename = `pitwall-schema-${(latest?.track || "session").replace(/[^\w]+/g, "_")}-${Date.now()}.json`;
    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      ...CORS,
      "Cache-Control": "no-store",
      ...(download ? { "Content-Disposition": `attachment; filename="${filename}"` } : {}),
    });
    res.end(JSON.stringify(latestSchema, null, 2));
    return;
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  let filePath = path.join(PUBLIC_DIR, urlPath === "/" ? "index.html" : urlPath);
  if (!filePath.startsWith(PUBLIC_DIR)) { res.writeHead(403); res.end("forbidden"); return; }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) filePath = path.join(PUBLIC_DIR, "index.html");
    fs.readFile(filePath, (e, data) => {
      if (e) { res.writeHead(404); res.end("not found"); return; }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream", "Cache-Control": "no-cache" });
      res.end(data);
    });
  });
});

const wss = new WebSocketServer({ server });
server.listen(PORT, () => {
  console.log(`[bridge] dashboard:  http://localhost:${PORT}`);
  console.log(`[bridge] websocket:  ws://localhost:${PORT}`);
  console.log(`[bridge] schema:     http://localhost:${PORT}/api/schema`);
  printNetworkUrls(PORT);
});

let latest = null;
let latestSchema = null;
let packetCount = 0;
let lastLapNum = -1;

if (IRacingSDK) {
  const iracing = new IRacingSDK({ autoEnableTelemetry: true });
  let wasConnected = false;

  setInterval(() => {
    const connected = iracing.sessionStatusOK || iracing.startSDK();
    if (connected !== wasConnected) {
      console.log(connected ? "[bridge] iRacing connected" : "[bridge] iRacing disconnected");
      if (!connected) latestSchema = null;
      wasConnected = connected;
    }
    if (!connected || !iracing.waitForData(1000 / TICK_HZ)) return;
    const raw = iracing.getTelemetry();
    if (!latestSchema) {
      latestSchema = buildSchema(raw);
      console.log(`[bridge] schema built — ${latestSchema.channelCount} channels (${latestSchema.expandedChannelCount} expanded)`);
    }
    const flat = flattenTelemetry(raw);            // scalar view
    const wide = expandTelemetry(raw, ARRAY_DEPTH); // exploded view
    latest = mapTelemetry(flat, iracing.getSessionData());
    latest.all = flat;
    latest.extras = capPayload(numericOnly(wide), EXTRAS_MAX_BYTES);
    latest.schemaSummary = {
      channelCount: latestSchema.channelCount,
      expandedChannelCount: latestSchema.expandedChannelCount,
      arrayDepth: ARRAY_DEPTH,
      generatedAt: latestSchema.generatedAt,
    };
    packetCount += 1;

    const lapNum = Number(flat.Lap ?? flat.LapCompleted ?? -1);
    const lastLapT = Number(flat.LapLastLapTime ?? 0);
    if (lapNum !== lastLapNum && lastLapNum >= 0 && lastLapT > 0) {
      lapCache.recordLap({
        car: latest.car, track: latest.track, lap: lastLapNum,
        lapTimeS: lastLapT, fuel: latest.fuelRemainingL, sof: latest.sof, source: "live",
      });
    }
    if (lapNum !== lastLapNum) lastLapNum = lapNum;
    if (packetCount === 1 || packetCount % (TICK_HZ * 5) === 0) {
      console.log(
        `[bridge] live packets=${packetCount} speed=${Math.round(latest.speedKph)}kph rpm=${Math.round(
          latest.rpm,
        )} gear=${latest.gear} extras=${Object.keys(latest.extras).length} clients=${wss.clients.size}`,
      );
    }
  }, 1000 / TICK_HZ);
}

// Broadcast loop — runs independently of sample tick so wsHz can be tuned
// without affecting recorder fidelity.
setInterval(() => {
  if (!latest || wss.clients.size === 0) return;
  const msg = JSON.stringify(latest);
  for (const client of wss.clients) if (client.readyState === 1) client.send(msg);
}, 1000 / WS_HZ);

wss.on("connection", (ws) => {
  console.log("[bridge] dashboard connected");
  if (latest) ws.send(JSON.stringify(latest));
  ws.on("close", () => console.log("[bridge] dashboard disconnected"));
});

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
    const value = variable && typeof variable === "object" && "value" in variable ? variable.value : variable;
    values[key] = Array.isArray(value) ? value[0] : value;
  }
  return values;
}

function expandTelemetry(raw, depth) {
  const out = {};
  for (const [key, variable] of Object.entries(raw ?? {})) {
    const value = variable && typeof variable === "object" && "value" in variable ? variable.value : variable;
    if (Array.isArray(value)) {
      const n = Math.min(value.length, depth);
      for (let i = 0; i < n; i++) out[`${key}_${i}`] = value[i];
    } else {
      out[key] = value;
    }
  }
  return out;
}

function numericOnly(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
    else if (typeof v === "boolean") out[k] = v ? 1 : 0;
  }
  return out;
}

/**
 * Build a downloadable schema describing every channel iRacing exposes this
 * session — name, type code, array length, unit, description. Mirrors the
 * variable header in an .ibt file so you can confirm bridge coverage.
 */
function buildSchema(raw) {
  const channels = [];
  let expanded = 0;
  for (const [name, variable] of Object.entries(raw ?? {})) {
    const v = variable && typeof variable === "object" ? variable : { value: variable };
    const value = "value" in v ? v.value : variable;
    const count = Array.isArray(value) ? value.length : 1;
    expanded += Math.min(count, ARRAY_DEPTH);
    channels.push({
      name,
      type: v.type ?? null,           // irsdk type code: 0=char,1=bool,2=int,3=bitfield,4=float,5=double
      count,                          // raw array length from .ibt
      capturedCount: Math.min(count, ARRAY_DEPTH),
      unit: v.unit ?? "",
      desc: v.desc ?? "",
    });
  }
  channels.sort((a, b) => a.name.localeCompare(b.name));
  return {
    version: 1,
    format: "pitwall-bridge-schema",
    generatedAt: new Date().toISOString(),
    arrayDepth: ARRAY_DEPTH,
    channelCount: channels.length,
    expandedChannelCount: expanded,
    channels,
  };
}

/**
 * Cap the serialized extras payload. Exploded array entries (`Name_N`) are
 * dropped from the tail of each array first, keeping scalar channels intact
 * so the live UI never loses signal even on huge multiclass grids.
 */
function capPayload(obj, maxBytes) {
  let size = Buffer.byteLength(JSON.stringify(obj));
  if (size <= maxBytes) return obj;
  const keys = Object.keys(obj);
  // Group exploded keys by base name, sort by trailing index desc.
  const exploded = keys
    .map((k) => { const m = /^(.+?)_(\d+)$/.exec(k); return m ? { k, base: m[1], i: Number(m[2]) } : null; })
    .filter(Boolean)
    .sort((a, b) => b.i - a.i);
  for (const { k } of exploded) {
    delete obj[k];
    size = Buffer.byteLength(JSON.stringify(obj));
    if (size <= maxBytes) return obj;
  }
  return obj;
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
    session: `${weekend?.EventType ?? "SESSION"} — ${weekend?.TrackDisplayName ?? "TRACK"}`.toUpperCase(),
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
    sectors: { s1: null, s2: null, s3: null, bestSector: null },

    fuelRemainingL: v.FuelLevel ?? 0,
    lapsEstimated: estimateLaps(v),

    tires: {
      fl: tireCorner(v, "LF"), fr: tireCorner(v, "RF"),
      rl: tireCorner(v, "LR"), rr: tireCorner(v, "RR"),
    },

    gLat: v.LatAccel ?? 0,
    gLon: v.LongAccel ?? 0,
    drsAvailable: !!v.DRS_Status,
    brakeBias: v.dcBrakeBias ?? 0,
    diffMap: v.dcDiffEntry ?? 0,
    airTempC: weekend?.WeekendOptions?.AirTemp ?? 0,
    trackTempC: weekend?.WeekendOptions?.TrackTemp ?? 0,
    sof: session?.SessionInfo?.Sessions?.[0]?.ResultsFastestLap?.[0]?.FastestLap ?? 0,
  };
}

function tireCorner(v, c) {
  const tempL = v[`${c}tempCL`] ?? 0;
  const tempM = v[`${c}tempCM`] ?? 0;
  const tempR = v[`${c}tempCR`] ?? 0;
  const tempC = (tempL + tempM + tempR) / 3 || 0;
  const wearL = v[`${c}wearL`] ?? 1;
  const wearM = v[`${c}wearM`] ?? 1;
  const wearR = v[`${c}wearR`] ?? 1;
  const wearPct = Math.round(((wearL + wearM + wearR) / 3) * 100);
  const pressureKPa = v[`${c}coldPressure`] ?? 0;
  return { tempC, pressureBar: pressureKPa / 100, wearPct,
    state: tempC > 92 ? "hot" : tempC < 70 ? "cold" : "ok" };
}

function clamp01(x) { return Math.max(0, Math.min(1, x)); }

function formatLap(sec) {
  if (!sec || sec <= 0) return "--:--.---";
  const m = Math.floor(sec / 60);
  const s = (sec - m * 60).toFixed(3).padStart(6, "0");
  return `${m}:${s}`;
}

function estimateLaps(v) {
  const fuel = v.FuelLevel ?? 0;
  const perLap = v.FuelUsePerHour && v.LapLastLapTime
    ? (v.FuelUsePerHour * v.LapLastLapTime) / 3600 : 2.5;
  return perLap > 0 ? fuel / perLap : 0;
}
