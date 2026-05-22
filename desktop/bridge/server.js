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
const lapCache = require("./lap-cache");
const { TelemetryRecorder } = require("./telemetry-recorder");
const { buildChannelsManifest } = require("./channel-manifest");

let IRacingSDK = null;
try {
  ({ IRacingSDK } = require("irsdk-node"));
} catch (err) {
  console.warn("[bridge] irsdk-node unavailable — running in no-op mode.");
  console.warn(`[bridge] ${err.message}`);
}

const PORT = 3001;
const TICK_HZ = intFromEnv("TICK_HZ", 120, 1, 360);
const UI_HZ = intFromEnv("UI_HZ", 60, 1, 360);
const RECORD_HZ = intFromEnv("RECORD_HZ", TICK_HZ, 1, 360);
const ADAPTIVE_UI = (process.env.ADAPTIVE_UI ?? "1") !== "0";
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

/* ───────────────────────────────────────── HTTP server (static PWA) */

const server = http.createServer((req, res) => {
  const urlPath = (req.url || "/").split("?")[0];

  // Offline lap cache endpoint — reads ~/.pitwall/laps.jsonl
  if (urlPath === "/api/laps") {
    const limit = Number(new URL(req.url, "http://x").searchParams.get("limit")) || 500;
    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    });
    res.end(JSON.stringify({ file: lapCache.FILE, laps: lapCache.readLaps(limit) }));
    return;
  }

  // Mark laps as synced (dashboard tells bridge after cloud insert).
  if (urlPath === "/api/laps/mark-synced" && req.method === "POST") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      let ts = [];
      try { ts = JSON.parse(body).timestamps || []; } catch {}
      const changed = lapCache.markSynced(ts);
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(JSON.stringify({ ok: true, changed }));
    });
    return;
  }
  if (urlPath === "/api/laps/mark-synced" && req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  let filePath = path.join(PUBLIC_DIR, urlPath === "/" ? "index.html" : urlPath);

  // Prevent path traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403); res.end("forbidden"); return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      // SPA fallback
      filePath = path.join(PUBLIC_DIR, "index.html");
    }
    fs.readFile(filePath, (e, data) => {
      if (e) { res.writeHead(404); res.end("not found"); return; }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        "Content-Type": MIME[ext] || "application/octet-stream",
        "Cache-Control": "no-cache",
      });
      res.end(data);
    });
  });
});

const wss = new WebSocketServer({ server });
server.listen(PORT, () => {
  console.log(`[bridge] dashboard:  http://localhost:${PORT}`);
  console.log(`[bridge] websocket:  ws://localhost:${PORT}`);
  console.log(`[bridge] rates: sample=${TICK_HZ}Hz ui=${UI_HZ}Hz record=${RECORD_HZ}Hz adaptive=${ADAPTIVE_UI ? "on" : "off"}`);
  printNetworkUrls(PORT);
});

let latest = null;
let packetCount = 0;
let lastLapNum = -1;
let telemetryRecorder = null;
let sampleTick = 0;
let uiIntervalMs = Math.round(1000 / clampHz(UI_HZ));
const clientPerf = new Map();

if (IRacingSDK) {
  const iracing = new IRacingSDK({ autoEnableTelemetry: true });
  let wasConnected = false;
  let recordingStarted = false;

  setInterval(async () => {
    const connected = iracing.sessionStatusOK || iracing.startSDK();
    if (connected !== wasConnected) {
      console.log(connected ? "[bridge] iRacing connected" : "[bridge] iRacing disconnected");
      wasConnected = connected;

      if (connected && !recordingStarted) {
        // Start telemetry recording to MongoDB
        recordingStarted = true;
        const mUri = process.env.MONGODB_URI && process.env.MONGODB_URI !== "undefined" && process.env.MONGODB_URI !== "null"
          ? process.env.MONGODB_URI
          : "mongodb://127.0.0.1:27017/";
        telemetryRecorder = new TelemetryRecorder(
          mUri,
          process.env.USER_ID || "bridge-user",
          {
            track: "loading...",
            car: "loading...",
            driver: "bridge",
          }
        );
        const connected = await telemetryRecorder.connect();
        if (connected) {
          // Build manifest from current telemetry
          const telemetry = iracing.getTelemetry();
          const manifest = buildChannelsManifest(telemetry);
          const sessionId = await telemetryRecorder.startSession(manifest);
          if (sessionId) {
            console.log(`[bridge] Telemetry recording started (MongoDB)`);
          }
        }
      }
    }

    if (!connected || !iracing.waitForData(1000 / TICK_HZ)) return;
    const raw = iracing.getTelemetry();
    const flat = flattenTelemetry(raw);            // scalar view (first element of arrays)
    const wide = expandTelemetry(raw);             // every channel, arrays exploded into _0,_1,...
    latest = mapTelemetry(flat, iracing.getSessionData());
    latest.streamHz = Math.round(1000 / uiIntervalMs);
    latest.all = flat;                              // legacy passthrough
    latest.extras = numericOnly(wide);              // full .ibt-equivalent channel set
    packetCount += 1;
    sampleTick += 1;

    // Record telemetry sample to MongoDB
    const lapNum = Number(flat.Lap ?? flat.LapCompleted ?? -1);
    const recordEveryTicks = Math.max(1, Math.round(TICK_HZ / RECORD_HZ));
    if (telemetryRecorder && sampleTick % recordEveryTicks === 0) {
      telemetryRecorder.recordSample(latest.extras || {}, lapNum);
    }

    // Detect lap rollover and append to offline cache + record to MongoDB.
    const lastLapT = Number(flat.LapLastLapTime ?? 0);
    if (lapNum !== lastLapNum && lastLapNum >= 0 && lastLapT > 0) {
      lapCache.recordLap({
        car: latest.car,
        track: latest.track,
        lap: lastLapNum,
        lapTimeS: lastLapT,
        fuel: latest.fuelRemainingL,
        sof: latest.sof,
        source: "live",
      });

      // Also record lap metadata to MongoDB
      if (telemetryRecorder) {
        const trackTemp = flat.TrackTempCelsius ?? 20;
        const airTemp = flat.AirTempCelsius ?? 20;
        await telemetryRecorder.recordLap(lastLapNum, lastLapT, latest.fuelRemainingL, trackTemp, airTemp);
      }
    }
    if (lapNum !== lastLapNum) lastLapNum = lapNum;
    if (packetCount === 1 || packetCount % (TICK_HZ * 5) === 0) {
      console.log(
        `[bridge] live packets=${packetCount} speed=${Math.round(latest.speedKph)}kph rpm=${Math.round(
          latest.rpm,
        )} gear=${latest.gear} clients=${wss.clients.size}`,
      );
    }
  }, 1000 / TICK_HZ);
}

// Broadcast loop
setInterval(() => {
  if (!latest || wss.clients.size === 0) return;
  const msg = JSON.stringify(latest);
  for (const client of wss.clients) if (client.readyState === 1) client.send(msg);
}, uiIntervalMs);

setInterval(() => {
  if (!ADAPTIVE_UI) return;
  const now = Date.now();
  let hasSlowClient = false;
  for (const perf of clientPerf.values()) {
    if (now - perf.at > 5000) continue;
    if (perf.fps < 50) {
      hasSlowClient = true;
      break;
    }
  }
  const targetHz = hasSlowClient ? Math.min(30, UI_HZ) : UI_HZ;
  const next = Math.round(1000 / clampHz(targetHz));
  if (next !== uiIntervalMs) {
    uiIntervalMs = next;
    console.log(`[bridge] adaptive ui rate -> ${Math.round(1000 / uiIntervalMs)}Hz`);
  }
}, 2000);

wss.on("connection", (ws) => {
  console.log("[bridge] dashboard connected");
  if (latest) ws.send(JSON.stringify(latest));
  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(String(raw));
      if (msg?.type === "perf" && Number.isFinite(msg.fps)) {
        clientPerf.set(ws, { fps: Number(msg.fps), at: Date.now() });
      }
    } catch {
      // ignore
    }
  });
  ws.on("close", () => {
    clientPerf.delete(ws);
    console.log("[bridge] dashboard disconnected");
  });
});

function intFromEnv(name, fallback, min, max) {
  const raw = process.env[name];
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}
function clampHz(n) {
  return Math.max(1, Math.min(360, n));
}

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

/**
 * Wide-form telemetry: every channel iRacing exposes, with array channels
 * (CarIdxLap, tire temps per-row, etc.) exploded into `Name_0`, `Name_1`, …
 * This matches the per-channel layout of an .ibt file so a recorded .pwlap
 * preserves the same coverage.
 */
function expandTelemetry(raw) {
  const out = {};
  for (const [key, variable] of Object.entries(raw ?? {})) {
    const value = variable && typeof variable === "object" && "value" in variable ? variable.value : variable;
    if (Array.isArray(value)) {
      // Cap exploded arrays at 64 entries — covers CarIdx* (64 cars) without runaway payloads.
      const n = Math.min(value.length, 64);
      for (let i = 0; i < n; i++) out[`${key}_${i}`] = value[i];
    } else {
      out[key] = value;
    }
  }
  return out;
}

/** Keep only finite numeric / boolean entries (booleans become 0/1). */
function numericOnly(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
    else if (typeof v === "boolean") out[k] = v ? 1 : 0;
  }
  return out;
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
  return {
    tempC,
    pressureBar: pressureKPa / 100,
    wearPct,
    state: tempC > 92 ? "hot" : tempC < 70 ? "cold" : "ok",
  };
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
    ? (v.FuelUsePerHour * v.LapLastLapTime) / 3600
    : 2.5;
  return perLap > 0 ? fuel / perLap : 0;
}
