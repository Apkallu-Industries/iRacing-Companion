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
    if (packetCount === 1) {
      const keys = Object.keys(flat).filter(k => /temp|wear|brake|press|surface/i.test(k));
      require("fs").writeFileSync("keys_dump.json", JSON.stringify(keys, null, 2));
    }
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
    const value = variable && typeof variable === "object" && "value" in variable ? variable.value : variable;
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
    sectors: updateSectors(v, session),

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
    myCarIdx: driverInfo?.DriverCarIdx ?? -1,
    competitors: getCompetitors(v, session),
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
     let loadMult = 1.0 + (gForce * 0.5);
     wearTracker[c] -= (0.000002 * speed * dt * heatMult * loadMult);
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
    wearPct, estWearPct: getEstimatedWear(v, c, tempC),
    brakeTempC,
    brakeLinePress,
    state: tempC > 92 ? "hot" : tempC < 70 ? "cold" : "ok",
  };
}

const sectorTracker = {
  s1: null, s2: null, s3: null,
  lastPct: 0, lapStartSec: 0,
  splits: [],
  lastLapTime: 0
};

function updateSectors(v, session) {
  if (!sectorTracker.splits.length && session?.SplitTimeInfo?.Sectors) {
    try {
      const s = session.SplitTimeInfo.Sectors;
      sectorTracker.splits = Array.isArray(s) ? s.map(x => x.SectorStartPct) : [];
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
    sectorTracker.lapStartSec = time - (pct * (v.Speed ?? 0)); // approximate start
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
      sectorTracker.s2 = (time - sectorTracker.lapStartSec) - (sectorTracker.s1 || 0);
    }
  }

  // Formatting helper
  const fmtSec = (val) => val ? val.toFixed(3) : "--.---";

  return {
    s1: fmtSec(sectorTracker.s1),
    s2: fmtSec(sectorTracker.s2),
    s3: fmtSec(sectorTracker.s3),
    bestSector: null
  };
}


function getCompetitors(v, session) {
  try {
    const sNum = v.SessionNum ?? 0;
    const s = session?.SessionInfo?.Sessions?.[sNum] || session?.SessionInfo?.Sessions?.[0];
    const positions = s?.ResultsPositions;
    if (!Array.isArray(positions)) return [];
    return positions.map(p => ({
      pos: p.Position ?? 0,
      carIdx: p.CarIdx ?? -1,
      lap: p.Lap ?? 0,
      lastTime: p.LastTime ?? -1,
      fastestTime: p.FastestTime ?? -1
    }));
  } catch {
    return [];
  }
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






