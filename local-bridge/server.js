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

let IRacingSDK = null;
try {
  ({ IRacingSDK } = require("irsdk-node"));
} catch (err) {
  console.warn("[bridge] irsdk-node unavailable — running in no-op mode.");
  console.warn(`[bridge] ${err.message}`);
}

const PORT = 3001;
const TICK_HZ = 30;
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
  let filePath = path.join(PUBLIC_DIR, urlPath === "/" ? "index.html" : urlPath);

  // Prevent path traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("forbidden");
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      // SPA fallback
      filePath = path.join(PUBLIC_DIR, "index.html");
    }
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
  });
});

const wss = new WebSocketServer({ server });
server.listen(PORT, () => {
  console.log(`[bridge] dashboard:  http://localhost:${PORT}`);
  console.log(`[bridge] websocket:  ws://localhost:${PORT}`);
  printNetworkUrls(PORT);
});

let latest = null;
let packetCount = 0;

if (IRacingSDK) {
  const iracing = new IRacingSDK({ autoEnableTelemetry: true });
  let wasConnected = false;

  setInterval(() => {
    const connected = iracing.sessionStatusOK || iracing.startSDK();
    if (connected !== wasConnected) {
      console.log(connected ? "[bridge] iRacing connected" : "[bridge] iRacing disconnected");
      wasConnected = connected;
    }
    if (!connected || !iracing.waitForData(1000 / TICK_HZ)) return;
    const flat = flattenTelemetry(iracing.getTelemetry());
    latest = mapTelemetry(flat, iracing.getSessionData());
    latest.all = flat;
    packetCount += 1;
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
}, 1000 / TICK_HZ);

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
