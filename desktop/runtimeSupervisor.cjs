/* eslint-disable */
/**
 * Pit Wall — Runtime Supervisor
 *
 * Orchestrates the local engineering runtime stack — MongoDB service, local AI
 * inference (LM Studio / Ollama), and future native services.
 *
 * Design principles:
 * ─ MongoDB is managed as a Windows SERVICE, not a child process. Services survive
 *   Electron crashes and have proper OS-level lifecycle management.
 * ─ Never crashes Pit Wall if dependencies are absent. Marks them "unavailable"
 *   and the UI degrades gracefully.
 * ─ LM Studio / Ollama are READ-ONLY probes. Engineers launch their own model
 *   server — the supervisor only detects and reports.
 * ─ Exposes getStatus() for the IPC runtime manifest handler.
 */

const net    = require("net");
const http   = require("http");
const { exec, execSync } = require("child_process");
const os     = require("os");

// ─── Port constants ────────────────────────────────────────────────────────────

const MONGO_PORT    = 27017;
const LMSTUDIO_PORT = 1234;
const OLLAMA_PORT   = 11434;

const MONGO_SERVICE_NAME = "PitWallMongoDB";   // NSIS installs this name
const MONGO_FALLBACK_SVC = "MongoDB";           // Default MongoDB service name

// ─── State ────────────────────────────────────────────────────────────────────

/** @type {"initializing"|"active"|"unavailable"|"starting"|"error"} */
let mongoStatus = "initializing";
let mongoUri    = null;

/** @type {"lmstudio"|"ollama"|"cloud"|"unknown"} */
let aiMode = "unknown";
let aiEndpoint = null;

let initialized = false;

// ─── Utility: port probe ──────────────────────────────────────────────────────

/**
 * Returns true if something is listening on the given TCP port.
 * Times out after `timeoutMs` ms.
 */
function isPortListening(port, timeoutMs = 1000) {
  return new Promise((resolve) => {
    const sock = new net.Socket();
    let resolved = false;
    const done = (val) => {
      if (!resolved) {
        resolved = true;
        sock.destroy();
        resolve(val);
      }
    };
    sock.setTimeout(timeoutMs);
    sock.once("connect",  () => done(true));
    sock.once("error",    () => done(false));
    sock.once("timeout",  () => done(false));
    sock.connect(port, "127.0.0.1");
  });
}

/**
 * Returns true if the URL returns a 2xx/3xx HTTP response.
 */
function isHttpReachable(url, timeoutMs = 2000) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: timeoutMs }, (res) => {
      resolve(res.statusCode < 500);
      res.resume(); // drain
    });
    req.once("error",   () => resolve(false));
    req.once("timeout", () => { req.destroy(); resolve(false); });
  });
}

// ─── MongoDB orchestration ────────────────────────────────────────────────────

/**
 * Attempt to start a Windows service by name.
 * Resolves with true if the service was started, false if it failed or is
 * unsupported (non-Windows).
 */
function startWindowsService(serviceName) {
  return new Promise((resolve) => {
    if (os.platform() !== "win32") {
      resolve(false);
      return;
    }
    exec(`net start "${serviceName}"`, (err, stdout) => {
      if (err) {
        console.warn(`[supervisor] net start "${serviceName}" failed:`, err.message);
        resolve(false);
      } else {
        console.log(`[supervisor] Service "${serviceName}" started`);
        resolve(true);
      }
    });
  });
}

/**
 * Check if a Windows service exists.
 */
function windowsServiceExists(serviceName) {
  if (os.platform() !== "win32") return false;
  try {
    execSync(`sc query "${serviceName}"`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensure MongoDB is reachable.
 * Strategy:
 *   1. Probe port 27017. If listening → done.
 *   2. Try to start PitWallMongoDB service (installed by NSIS).
 *   3. Try to start the default MongoDB service.
 *   4. If no service, try `mongod` on PATH (development fallback).
 *   5. If all fail → mark unavailable.
 */
async function ensureMongoDB() {
  mongoStatus = "starting";
  console.log("[supervisor] Probing MongoDB on port", MONGO_PORT);

  const alreadyUp = await isPortListening(MONGO_PORT, 500);
  if (alreadyUp) {
    mongoStatus = "active";
    mongoUri = `mongodb://localhost:${MONGO_PORT}`;
    console.log("[supervisor] MongoDB already listening →", mongoUri);
    return;
  }

  // Try PitWall-specific service first
  if (windowsServiceExists(MONGO_SERVICE_NAME)) {
    console.log(`[supervisor] Starting ${MONGO_SERVICE_NAME} service…`);
    await startWindowsService(MONGO_SERVICE_NAME);
    await new Promise((r) => setTimeout(r, 2500)); // give service time to bind
    if (await isPortListening(MONGO_PORT, 1000)) {
      mongoStatus = "active";
      mongoUri = `mongodb://localhost:${MONGO_PORT}`;
      console.log("[supervisor] MongoDB started via PitWall service →", mongoUri);
      return;
    }
  }

  // Try default MongoDB service
  if (windowsServiceExists(MONGO_FALLBACK_SVC)) {
    console.log(`[supervisor] Starting ${MONGO_FALLBACK_SVC} service…`);
    await startWindowsService(MONGO_FALLBACK_SVC);
    await new Promise((r) => setTimeout(r, 2500));
    if (await isPortListening(MONGO_PORT, 1000)) {
      mongoStatus = "active";
      mongoUri = `mongodb://localhost:${MONGO_PORT}`;
      console.log("[supervisor] MongoDB started via default service →", mongoUri);
      return;
    }
  }

  // Development fallback: mongod on PATH (no --fork on Windows without auth)
  // We skip spawning mongod here — too complex to manage cleanly.
  // Engineers in dev mode should have MongoDB running already.

  mongoStatus = "unavailable";
  mongoUri = null;
  console.warn(
    "[supervisor] MongoDB not reachable. Telemetry recording disabled.",
    "Install MongoDB Community Server or ensure the service is running."
  );
}

// ─── Local AI inference probe ─────────────────────────────────────────────────

/**
 * Probe for local AI inference servers.
 * LM Studio: GET http://localhost:1234/v1/models → JSON with { data: [...] }
 * Ollama:    GET http://localhost:11434/api/tags  → JSON with { models: [...] }
 */
async function probeLocalAI() {
  aiMode = "cloud";
  aiEndpoint = null;

  // LM Studio check
  const lmStudioUp = await isPortListening(LMSTUDIO_PORT, 800);
  if (lmStudioUp) {
    let isApiV1 = true;
    let reachable = await isHttpReachable(`http://localhost:${LMSTUDIO_PORT}/api/v1/models`);
    if (!reachable) {
      reachable = await isHttpReachable(`http://localhost:${LMSTUDIO_PORT}/v1/models`);
      isApiV1 = false;
    }
    if (reachable) {
      aiMode = "lmstudio";
      aiEndpoint = isApiV1
        ? `http://localhost:${LMSTUDIO_PORT}/api/v1/chat`
        : `http://localhost:${LMSTUDIO_PORT}/v1/chat/completions`;
      console.log("[supervisor] Local AI → LM Studio detected at port", LMSTUDIO_PORT);
      return;
    }
  }

  // Ollama check
  const ollamaUp = await isPortListening(OLLAMA_PORT, 800);
  if (ollamaUp) {
    const reachable = await isHttpReachable(`http://localhost:${OLLAMA_PORT}/api/tags`);
    if (reachable) {
      aiMode = "ollama";
      aiEndpoint = `http://localhost:${OLLAMA_PORT}/v1/chat/completions`;
      console.log("[supervisor] Local AI → Ollama detected at port", OLLAMA_PORT);
      return;
    }
  }

  console.log("[supervisor] No local AI server detected → cloud fallback");
}

// ─── Operational Workstation States ──────────────────────────────────────────

/** @type {"RUNNING"|"DEGRADED"|"RECOVERING"|"FAILED"|"OFFLINE"} */
let supervisorState = "OFFLINE";
let bridgeStatus = "offline";
let watchdogInterval = null;
let mongoRecoveryRetries = 0;
const MAX_RECOVERY_RETRIES = 3;

/**
 * Resilient supervisor watchdog loop. Runs every 3 seconds to probe services,
 * isolate faults, and trigger automated self-healing recoveries.
 */
function startWatchdogLoop() {
  if (watchdogInterval) clearInterval(watchdogInterval);

  watchdogInterval = setInterval(async () => {
    // 1. Probe MongoDB port
    const mongoListening = await isPortListening(MONGO_PORT, 400);
    if (!mongoListening && mongoStatus === "active") {
      console.warn("[supervisor] MongoDB port disconnected. Attempting self-healing recovery…");
      mongoStatus = "error";
      if (mongoRecoveryRetries < MAX_RECOVERY_RETRIES) {
        mongoRecoveryRetries++;
        supervisorState = "RECOVERING";
        await ensureMongoDB();
      } else {
        mongoStatus = "unavailable";
        console.error("[supervisor] Maximum MongoDB recovery retries exceeded. Marking service degraded.");
      }
    } else if (mongoListening) {
      mongoStatus = "active";
      mongoUri = `mongodb://localhost:${MONGO_PORT}`;
      mongoRecoveryRetries = 0; // Reset retries on successful connection
    }

    // 2. Probe Local Bridge (port 3001)
    const bridgeListening = await isPortListening(3001, 400);
    bridgeStatus = bridgeListening ? "online" : "offline";

    // 3. Resolve unified supervisor workspace state
    if (mongoStatus === "starting") {
      supervisorState = "RECOVERING";
    } else if (bridgeStatus === "offline") {
      supervisorState = "FAILED";
    } else if (mongoStatus === "unavailable" || mongoStatus === "error") {
      supervisorState = "DEGRADED";
    } else {
      supervisorState = "RUNNING";
    }
  }, 3000);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Initialize the runtime supervisor.
 * Call once from app.whenReady().
 * Runs all checks in parallel for fast startup.
 */
async function init() {
  if (initialized) return;
  initialized = true;
  supervisorState = "RECOVERING";
  console.log("[supervisor] Initializing runtime services…");

  // Run MongoDB and AI probe in parallel
  await Promise.all([
    ensureMongoDB(),
    probeLocalAI(),
  ]);

  // Start active supervision watchdog
  startWatchdogLoop();

  console.log(`[supervisor] Init complete — State: ${supervisorState} | MongoDB: ${mongoStatus} | AI: ${aiMode}`);
}

/**
 * Re-probe AI mode (called by the UI "refresh" action).
 */
async function refreshAiMode() {
  await probeLocalAI();
  return { aiMode, aiEndpoint };
}

/**
 * Re-probe MongoDB (called by "Start MongoDB" action in RuntimeMonitor).
 */
async function ensureMongoDBNow() {
  initialized = true; // prevent re-init guard
  mongoRecoveryRetries = 0;
  await ensureMongoDB();
  return { mongoStatus, mongoUri };
}

/**
 * Returns the full runtime status for IPC manifest handlers.
 */
function getStatus() {
  return {
    supervisorState,
    bridgeStatus,
    mongoStatus,
    mongoUri,
    aiMode,
    aiEndpoint,
    mongoPort: MONGO_PORT,
    lmStudioPort: LMSTUDIO_PORT,
    ollamaPort: OLLAMA_PORT,
  };
}

/**
 * Returns the MongoDB URI for injecting into bridge env.
 * Returns null if MongoDB is not available.
 */
function getMongoUri() {
  return mongoUri;
}

/**
 * Returns the detected AI mode.
 */
function getAiMode() {
  return aiMode;
}

/**
 * Returns the local AI chat completions endpoint, or null if cloud.
 */
function getAiEndpoint() {
  return aiEndpoint;
}

/**
 * Graceful shutdown — cleans up watchdog intervals.
 */
async function shutdown() {
  if (watchdogInterval) {
    clearInterval(watchdogInterval);
  }
  supervisorState = "OFFLINE";
  console.log("[supervisor] Shutdown complete");
}

module.exports = {
  init,
  shutdown,
  getStatus,
  getMongoUri,
  getAiMode,
  getAiEndpoint,
  ensureMongoDBNow,
  refreshAiMode,
};
