/* eslint-disable */
/**
 * Pit Wall Desktop — Electron contextBridge Preload
 *
 * Exposes a typed `window.pitWallRuntime` API to the renderer process.
 * This is the ONLY way renderer code should interact with native Electron
 * capabilities. All calls are proxied through ipcRenderer.invoke().
 *
 * Security: contextIsolation=true, nodeIntegration=false (always).
 * This script runs in an isolated context with access to ipcRenderer
 * but NOT to Node.js internals directly.
 */

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("pitWallRuntime", {
  // ── Identity & Machine Info ──────────────────────────────────────────────
  
  /**
   * Returns the full workstation runtime manifest:
   * hostname, platform, CPU model, RAM, monitor count, bridge status, etc.
   */
  getRuntimeManifest: () => ipcRenderer.invoke("get-runtime-manifest"),

  /**
   * Returns an array of all connected displays with bounds and work area.
   * Use this to build a monitor layout picker for instrument placement.
   */
  getMonitorLayout: () => ipcRenderer.invoke("get-monitor-layout"),

  // ── Instrument Windows ────────────────────────────────────────────────────
  
  /**
   * Opens a properly-configured detached instrument window.
   * @param type  - Instrument type: "timing" | "tires" | "hybrid" | "strategy" | "telemetry" | "engineering"
   * @param url   - Full URL to load in the new window (e.g. http://localhost:8080/detached/timing)
   */
  openInstrumentWindow: (type, url) =>
    ipcRenderer.invoke("open-instrument-window", { type, url }),

  // ── Bridge Control ────────────────────────────────────────────────────────
  
  /** Returns the current bridge status: "running" | "crashed" | "starting" */
  getBridgeStatus: () => ipcRenderer.invoke("get-bridge-status"),
  
  /** Triggers a clean bridge restart (stops → waits 300ms → starts again) */
  restartBridge: () => ipcRenderer.invoke("restart-bridge"),

  /** Triggers MongoDB service start (idempotent — safe to call if already running) */
  ensureMongoDB: () => ipcRenderer.invoke("ensure-mongodb"),

  /** Re-probes LM Studio / Ollama and returns the current AI mode */
  refreshAiMode: () => ipcRenderer.invoke("refresh-ai-mode"),

  // ── App Info ──────────────────────────────────────────────────────────────
  
  /** Returns app version, isDev flag, platform, dashboardUrl */
  getAppInfo: () => ipcRenderer.invoke("get-app-info"),

  // ── Event listeners ───────────────────────────────────────────────────────
  
  /**
   * Subscribe to bridge status change events emitted from the main process.
   * The callback receives the new status: "running" | "crashed" | "starting"
   */
  onBridgeStatus: (callback) => {
    const listener = (_, status) => callback(status);
    ipcRenderer.on("bridge-status-changed", listener);
    // Return an unsubscribe function
    return () => ipcRenderer.removeListener("bridge-status-changed", listener);
  },
  onSessionChanged: (callback) => {
    const listener = (_, sessionId) => callback(sessionId);
    ipcRenderer.on("session-changed", listener);
    return () => ipcRenderer.removeListener("session-changed", listener);
  },
  // ── Supervisor / Sessions ─────────────────────────────────────────────────
  getSupervisorStatus: () => ipcRenderer.invoke("supervisor:get-status"),
  getActiveSession: () => ipcRenderer.invoke("supervisor:get-active-session"),
  listSessions: () => ipcRenderer.invoke("supervisor:get-sessions"),
  startSession: (sessionId, meta) => ipcRenderer.invoke("supervisor:start-session", { sessionId, meta }),
  stopSession: (sessionId) => ipcRenderer.invoke("supervisor:stop-session", { sessionId }),
  onTelemetryLive: (callback) => {
    const listener = (_, packet) => callback(packet);
    ipcRenderer.on("telemetry-live", listener);
    return () => ipcRenderer.removeListener("telemetry-live", listener);
  },
  onTelemetryRaw: (callback) => {
    const listener = (_, packet) => callback(packet);
    ipcRenderer.on("telemetry-raw", listener);
    return () => ipcRenderer.removeListener("telemetry-raw", listener);
  },
  onTelemetryEvent: (callback) => {
    const listener = (_, event) => callback(event);
    ipcRenderer.on("telemetry-event", listener);
    return () => ipcRenderer.removeListener("telemetry-event", listener);
  },
  getTelemetrySchema: () => ipcRenderer.invoke("supervisor:get-telemetry-schema"),
});
