/* eslint-disable */
/**
 * Pit Wall Desktop — Electron shell
 *
 * 1. Spawns the bundled iRacing → WebSocket bridge (local-bridge or desktop/bridge).
 * 2. Opens the published dashboard OR local dev server in a native window.
 * 3. Handles auto-updates, window state persistence, system tray, deep links.
 *
 * Architecture:
 *   Production  → loads https://iracing-companion.lovable.app (always latest UI)
 *   Dev (--dev) → loads http://127.0.0.1:8080 (local Vite dev server)
 */

const { app, BrowserWindow, shell, Menu, Tray, dialog, ipcMain, nativeTheme, screen, globalShortcut } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const os = require("os");
const supervisor = require("./runtimeSupervisor.cjs");

// ─── Config ───────────────────────────────────────────────────────────────────

const isDev = process.argv.includes("--dev") || process.env.DEV === "1";
const APP_VERSION = require("./package.json").version ?? "1.0.0";

/**
 * URL Resolution — always prefer local servers so the desktop is a
 * 1-to-1 mirror of whatever is running on this machine.
 *
 * Priority order:
 *   1. Vite dev server  → http://127.0.0.1:8080  (npm run dev in root)
 *   2. Bridge HTTP UI   → http://localhost:3001   (bridge serves PWA build)
 *   3. Cloud fallback   → https://iracing-companion.lovable.app (no local servers running)
 *
 * In --dev mode we always use 8080 (fast, no wait).
 * In production mode we probe 8080 first, then 3001, then fall back to cloud.
 */
const VITE_URL  = "http://127.0.0.1:8080";
const BRIDGE_UI = "http://localhost:3001";

// Start with a sensible default; resolveUrl() will update it before the window opens.
let BASE_URL    = isDev ? VITE_URL : BRIDGE_UI;
// Electron opens the /runtime boot sequence first; the RuntimeStatusMatrix
// component navigates to /live once services are confirmed ready.
let DASHBOARD_URL = `${BASE_URL}/runtime`;

/**
 * Probe a URL with a short timeout. Returns true if the server is up.
 */
async function isReachable(url, timeoutMs = 1500) {
  const { net } = require("electron");
  return new Promise((resolve) => {
    try {
      const req = net.request({ method: "HEAD", url });
      const timer = setTimeout(() => { try { req.abort(); } catch {} resolve(false); }, timeoutMs);
      req.on("response", () => { clearTimeout(timer); resolve(true); });
      req.on("error",    () => { clearTimeout(timer); resolve(false); });
      req.end();
    } catch {
      resolve(false);
    }
  });
}

/**
 * Resolve the best available base URL before we show the window.
 * Called once during app startup (after bridge has had a moment to start).
 */
async function resolveUrl() {
  if (isDev) {
    // Dev mode: always use Vite — load /runtime for boot sequence
    BASE_URL      = VITE_URL;
    DASHBOARD_URL = `${VITE_URL}/runtime`;
    console.log(`[desktop] dev mode → ${DASHBOARD_URL}`);
    return;
  }

  // Give the bridge a moment if it just started
  await new Promise(r => setTimeout(r, 1200));

  if (await isReachable(VITE_URL)) {
    BASE_URL      = VITE_URL;
    DASHBOARD_URL = `${VITE_URL}/runtime`;
    console.log(`[desktop] local Vite dev server detected → ${DASHBOARD_URL}`);
    return;
  }

  if (await isReachable(BRIDGE_UI)) {
    BASE_URL      = BRIDGE_UI;
    DASHBOARD_URL = `${BRIDGE_UI}/runtime`;
    console.log(`[desktop] local bridge UI detected → ${DASHBOARD_URL}`);
    return;
  }

  // Fallback: If neither local server is reachable, just use BRIDGE_UI and wait for it to come up.
  BASE_URL      = BRIDGE_UI;
  DASHBOARD_URL = `${BRIDGE_UI}/runtime`;
  console.log(`[desktop] loading local bridge UI (may take a moment to start) → ${DASHBOARD_URL}`);
}

// Prefer the source-tree bridge over the bundled copy (dev workflow).
// Falls back to desktop/bridge for packaged distributions.
const BRIDGE_DIR = (() => {
  const srcBridge = path.join(__dirname, "..", "local-bridge");
  if (fs.existsSync(path.join(srcBridge, "server.js"))) return srcBridge;

  const unpackedBridge = path.join(process.resourcesPath || __dirname, "bridge");
  if (fs.existsSync(path.join(unpackedBridge, "server.js"))) return unpackedBridge;

  return path.join(__dirname, "bridge");
})();

const STATE_FILE_PATH = path.join(app.getPath("userData"), "window-state.json");
const LOG_FILE_PATH = path.join(app.getPath("userData"), "bridge.log");

// ─── State ────────────────────────────────────────────────────────────────────

let mainWindow = null;
let tray = null;
let bridgeProc = null;
let bridgeRestartCount = 0;
let bridgeStatus = "starting"; // 'starting' | 'running' | 'crashed'
let currentSessionId = null;

/**
 * Emit bridge status change events to the renderer so the UI
 * can update its RuntimeMonitor without polling.
 */
function emitBridgeStatusToRenderer(status) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("bridge-status-changed", status);
  }
}

/**
 * Update the main window title to reflect bridge status.
 */
function updateWindowTitle() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const hostname = require("os").hostname();
  const statusEmoji = bridgeStatus === "running" ? "●" : bridgeStatus === "crashed" ? "✕" : "◎";
  mainWindow.setTitle(`Pit Wall Workstation ${statusEmoji} ${bridgeStatus.toUpperCase()} · ${hostname}`);
}

let windowState = { width: 1600, height: 980, x: undefined, y: undefined, maximized: false };

/**
 * Validate that saved window position is within bounds of any current display.
 * Resets position to undefined if invalid to let Electron use default behavior.
 */
function isPositionValid(x, y, width, height) {
  if (x === undefined || y === undefined) return true;
  
  const displays = screen.getAllDisplays();
  if (displays.length === 0) return true;
  
  // Check if window overlaps with any display
  for (const display of displays) {
    const bounds = display.bounds;
    // Check if window center is within display bounds
    const windowCenterX = x + width / 2;
    const windowCenterY = y + height / 2;
    if (
      windowCenterX >= bounds.x &&
      windowCenterX <= bounds.x + bounds.width &&
      windowCenterY >= bounds.y &&
      windowCenterY <= bounds.y + bounds.height
    ) {
      return true;
    }
  }
  return false;
}

try {
  if (fs.existsSync(STATE_FILE_PATH)) {
    const data = JSON.parse(fs.readFileSync(STATE_FILE_PATH, "utf-8"));
    if (data.width && data.height) {
      windowState = { ...windowState, ...data };
      // Validate position against current display configuration
      if (!isPositionValid(windowState.x, windowState.y, windowState.width, windowState.height)) {
        console.log("[desktop] Saved window position invalid for current display setup, resetting to default");
        windowState.x = undefined;
        windowState.y = undefined;
      }
    }
  }
} catch {}

// ─── Bridge management ────────────────────────────────────────────────────────

let bridgeLogStream = null;

function openBridgeLog() {
  try {
    bridgeLogStream = fs.createWriteStream(LOG_FILE_PATH, { flags: "a" });
  } catch {}
}

function writeBridgeLog(line) {
  try {
    bridgeLogStream?.write(`${new Date().toISOString()} ${line}\n`);
  } catch {}
}

function startBridge() {
  if (bridgeProc) return;
  const serverPath = path.join(BRIDGE_DIR, "server.js");
  if (!fs.existsSync(serverPath)) {
    bridgeStatus = "crashed";
    console.error("[desktop] bridge server.js missing at", serverPath);
    updateTray();
    return;
  }

  openBridgeLog();
  writeBridgeLog(`[desktop] Starting bridge (restart #${bridgeRestartCount}) from: ${BRIDGE_DIR}`);

  // Inherit parent env so MONGODB_URI, LOVABLE_API_KEY etc. flow through
  // Inject runtime environment so the bridge can connect to MongoDB and
  // knows which local AI endpoint to use for narrative generation.
  const mongoUri    = supervisor.getMongoUri();
  const aiEndpoint  = supervisor.getAiEndpoint();
  const aiMode      = supervisor.getAiMode();

  bridgeProc = spawn(process.execPath, [serverPath], {
    cwd: BRIDGE_DIR,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      NODE_ENV: isDev ? "development" : "production",
      // Telemetry persistence — injected by supervisor after MongoDB probe
      MONGO_URI:         mongoUri    ?? "",
      PITWALL_AI_MODE:   aiMode      ?? "cloud",
      PITWALL_AI_ENDPOINT: aiEndpoint ?? "",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  bridgeStatus = "running";
  updateTray();
  emitBridgeStatusToRenderer("running");
  updateWindowTitle();

  bridgeProc.stdout.on("data", (b) => {
    const line = b.toString().trim();
    process.stdout.write(`[bridge] ${line}\n`);
    writeBridgeLog(`[bridge:stdout] ${line}`);
  });
  bridgeProc.stderr.on("data", (b) => {
    const line = b.toString().trim();
    process.stderr.write(`[bridge:err] ${line}\n`);
    writeBridgeLog(`[bridge:stderr] ${line}`);
  });

  bridgeProc.on("exit", (code, signal) => {
    writeBridgeLog(`[desktop] Bridge exited: code=${code} signal=${signal}`);
    console.log("[desktop] bridge exited", { code, signal });
    bridgeProc = null;
    bridgeStatus = code === 0 ? "starting" : "crashed";
    bridgeLogStream?.end();
    bridgeLogStream = null;
    updateTray();
    emitBridgeStatusToRenderer(bridgeStatus);
    updateWindowTitle();

    // Auto-restart on crash (up to 5 times, with back-off)
    if (code !== 0 && bridgeRestartCount < 5) {
      const delay = Math.min(1000 * Math.pow(2, bridgeRestartCount), 30000);
      bridgeRestartCount++;
      console.log(`[desktop] auto-restarting bridge in ${delay}ms (attempt ${bridgeRestartCount})`);
      setTimeout(startBridge, delay);
    }
  });
}

function stopBridge() {
  if (!bridgeProc) return;
  writeBridgeLog("[desktop] Stopping bridge by request");
  try { bridgeProc.kill("SIGTERM"); } catch {}
  bridgeProc = null;
  bridgeStatus = "starting";
  updateTray();
}

// ─── Window state ─────────────────────────────────────────────────────────────

function saveWindowState() {
  if (!mainWindow) return;
  try {
    const bounds = mainWindow.getBounds();
    const maximized = mainWindow.isMaximized();
    fs.writeFileSync(STATE_FILE_PATH, JSON.stringify({ ...bounds, maximized }), "utf-8");
  } catch {}
}

// ─── Main window ──────────────────────────────────────────────────────────────

function createWindow() {
  const hostname = require("os").hostname();
  mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: "#09090b",
    title: `Pit Wall Workstation · ${hostname}`,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#09090b",
      symbolColor: "#71717a",
      height: 32,
    },
    autoHideMenuBar: true,
    show: false,
    icon: path.join(__dirname, "assets", "icon.png"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      // Preload script exposes window.pitWallRuntime via contextBridge
      preload: path.join(__dirname, "preload.cjs"),
      // Allow audio output device selection (setSinkId) — requires this flag
      experimentalFeatures: true,
    },
  });

  if (windowState.maximized) {
    mainWindow.maximize();
  }

  mainWindow.loadURL(DASHBOARD_URL);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    if (isDev) mainWindow.webContents.openDevTools({ mode: "detach" });
  });

  // Persist layout on resize/move
  mainWindow.on("resize", saveWindowState);
  mainWindow.on("move", saveWindowState);
  mainWindow.on("maximize", saveWindowState);
  mainWindow.on("unmaximize", saveWindowState);

  // Intercept window opens: allow native child windows for our own local pages (detached views),
  // while routing external links to the default system browser.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (
      url.startsWith(BASE_URL) ||
      url.startsWith("http://localhost") ||
      url.startsWith("http://127.0.0.1")
    ) {
      return {
        action: "allow",
        overrideBrowserWindowOptions: {
          width: 520,
          height: 400,
          backgroundColor: "#05070A",
          title: "Pit Wall Instrument Window",
          autoHideMenuBar: true,
          frame: true,
          titleBarStyle: "default",
          webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
          },
        },
      };
    }
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Intercept navigation away from our app
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith(BASE_URL) && !url.startsWith("http://localhost")) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// ─── System Tray ─────────────────────────────────────────────────────────────

function emitSessionChanged(sessionId) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("session-changed", sessionId);
  }
}

function setCurrentSession(sessionId) {
  currentSessionId = sessionId || null;
  updateTray();
  emitSessionChanged(currentSessionId);
}

function startCurrentSession(sessionId, meta) {
  try {
    const result = supervisor.startSession ? supervisor.startSession(sessionId, meta) : { ok: false, error: "supervisor unavailable" };
    if (result?.ok) {
      setCurrentSession(result.sessionId);
    }
    return result;
  } catch (e) {
    console.warn("[desktop] startCurrentSession failed", e);
    return { ok: false, error: String(e) };
  }
}

function stopCurrentSession(sessionId) {
  const id = sessionId || currentSessionId || (supervisor.getActiveSession ? supervisor.getActiveSession()?.id : null);
  if (!id) {
    return { ok: false, error: "no active session" };
  }
  try {
    const result = supervisor.stopSession ? supervisor.stopSession(id) : { ok: false, error: "supervisor unavailable" };
    if (result?.ok) {
      setCurrentSession(null);
    }
    return result;
  } catch (e) {
    console.warn("[desktop] stopCurrentSession failed", e);
    return { ok: false, error: String(e) };
  }
}

function toggleSession() {
  if (currentSessionId) {
    return stopCurrentSession();
  }
  return startCurrentSession();
}

function registerSessionHotkey() {
  const shortcut = "Control+Shift+R";
  try {
    if (!globalShortcut.register(shortcut, toggleSession)) {
      console.warn(`[desktop] failed to register hotkey ${shortcut}`);
    } else {
      console.log(`[desktop] registered session hotkey ${shortcut}`);
    }
  } catch (e) {
    console.warn("[desktop] global shortcut registration failed", e);
  }
}

function updateTray() {
  if (!tray) return;
  const bridgeLabel =
    bridgeStatus === "running"
      ? "✅ Bridge: Running (ws://localhost:3001)"
      : bridgeStatus === "crashed"
        ? "❌ Bridge: Crashed"
        : "⏳ Bridge: Starting…";
  const sessionLabel = currentSessionId ? `🟢 Active session: ${currentSessionId}` : "⚪ No active session";

  const menu = Menu.buildFromTemplate([
    {
      label: `Pit Wall Desktop v${APP_VERSION}`,
      enabled: false,
    },
    { type: "separator" },
    { label: bridgeLabel, enabled: false },
    { label: sessionLabel, enabled: false },
    {
      label: currentSessionId ? "Stop Session" : "Start Session",
      accelerator: "Ctrl+Shift+R",
      click: () => toggleSession(),
    },
    { type: "separator" },
    {
      label: "Restart Bridge",
      click: () => {
        bridgeRestartCount = 0;
        stopBridge();
        setTimeout(startBridge, 300);
      },
    },
    {
      label: "Open Bridge Log",
      click: () => shell.openPath(LOG_FILE_PATH),
    },
    { type: "separator" },
    {
      label: "Show Dashboard",
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        } else {
          createWindow();
        }
      },
    },
    {
      label: "Open in Browser",
      click: () => shell.openExternal(DASHBOARD_URL),
    },
    { type: "separator" },
    { label: "Quit Pit Wall", role: "quit" },
  ]);
  tray.setContextMenu(menu);
  tray.setToolTip(
    `Pit Wall Desktop v${APP_VERSION}\nBridge: ${bridgeStatus}\nSession: ${currentSessionId ?? "none"}\nUI: ${BASE_URL}`
  );
}

function createTray() {
  const iconPath = path.join(__dirname, "assets", "tray-icon.png");
  // Fall back gracefully if assets folder doesn't exist yet
  if (!fs.existsSync(iconPath)) return;
  tray = new Tray(iconPath);
  tray.setToolTip("Pit Wall Desktop");
  tray.on("double-click", () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    } else {
      createWindow();
    }
  });
  updateTray();
}

// ─── App menu ─────────────────────────────────────────────────────────────────

function buildMenu() {
  const isMac = process.platform === "darwin";

  const navigate = (url) => () => mainWindow?.loadURL(url);

  const template = [
    ...(isMac ? [{ role: "appMenu" }] : []),
    {
      label: "App",
      submenu: [
        {
          label: "Dashboard (Live)",
          accelerator: "CmdOrCtrl+1",
          click: navigate(DASHBOARD_URL),
        },
        {
          label: "Sessions / Workbench",
          accelerator: "CmdOrCtrl+2",
          click: navigate(`${BASE_URL}/sessions`),
        },
        {
          label: "Team Command Center",
          accelerator: "CmdOrCtrl+3",
          click: navigate(`${BASE_URL}/team`),
        },
        {
          label: "Settings",
          accelerator: "CmdOrCtrl+,",
          click: navigate(`${BASE_URL}/settings`),
        },
        { type: "separator" },
        {
          label: "Local Bridge UI (port 3001)",
          click: navigate("http://localhost:3001"),
        },
        { type: "separator" },
        {
          label: "Restart Bridge",
          accelerator: "CmdOrCtrl+Shift+R",
          click: () => {
            bridgeRestartCount = 0;
            stopBridge();
            setTimeout(startBridge, 300);
          },
        },
        {
          label: "Bridge Status…",
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: bridgeStatus === "running" ? "info" : "warning",
              title: "Pit Wall Bridge",
              message: `Bridge: ${bridgeStatus.toUpperCase()}`,
              detail:
                bridgeStatus === "running"
                  ? `ws://localhost:3001 is live (60Hz).\nDashboard URL: ${DASHBOARD_URL}\nBridge dir: ${BRIDGE_DIR}`
                  : `The local bridge isn't running.\n\nTry 'Restart Bridge' from this menu.\nBridge dir: ${BRIDGE_DIR}`,
              buttons: ["OK", "Open Log"],
            }).then(({ response }) => {
              if (response === 1) shell.openPath(LOG_FILE_PATH);
            });
          },
        },
        {
          label: "Open Bridge Log",
          click: () => shell.openPath(LOG_FILE_PATH),
        },
        { type: "separator" },
        {
          label: "Reset Window Position",
          click: () => {
            try {
              if (fs.existsSync(STATE_FILE_PATH)) {
                fs.unlinkSync(STATE_FILE_PATH);
              }
              windowState = { width: 1600, height: 980, x: undefined, y: undefined, maximized: false };
              if (mainWindow && !mainWindow.isDestroyed()) {
                const primary = screen.getPrimaryDisplay();
                const centerX = primary.bounds.x + (primary.bounds.width - windowState.width) / 2;
                const centerY = primary.bounds.y + (primary.bounds.height - windowState.height) / 2;
                mainWindow.setBounds({
                  x: Math.max(primary.bounds.x, centerX),
                  y: Math.max(primary.bounds.y, centerY),
                  width: windowState.width,
                  height: windowState.height,
                });
                mainWindow.unmaximize();
              }
            } catch (err) {
              console.error("[desktop] failed to reset window position", err);
            }
          },
        },
        isMac ? { role: "close" } : { role: "quit" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        ...(isDev ? [{ role: "toggleDevTools" }] : []),
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    { role: "windowMenu" },
    {
      label: "Help",
      submenu: [
        {
          label: `Pit Wall Desktop v${APP_VERSION}`,
          enabled: false,
        },
        { type: "separator" },
        {
          label: "Documentation",
          click: () => shell.openExternal("https://github.com/Apkallu-Industries/iRacing-Companion"),
        },
        {
          label: "Report Issue",
          click: () => shell.openExternal("https://github.com/Apkallu-Industries/iRacing-Companion/issues"),
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ─── IPC handlers (called from renderer via contextBridge if needed) ──────────

ipcMain.handle("get-bridge-status", () => ({
  status: bridgeStatus,
  dir: BRIDGE_DIR,
  restarts: bridgeRestartCount,
  url: "ws://localhost:3001",
}));

ipcMain.handle("restart-bridge", () => {
  bridgeRestartCount = 0;
  stopBridge();
  setTimeout(startBridge, 300);
  return { ok: true };
});

ipcMain.handle("get-app-info", () => ({
  version: APP_VERSION,
  isDev,
  platform: process.platform,
  dashboardUrl: DASHBOARD_URL,
  bridgeDir: BRIDGE_DIR,
}));

// ─── GPU & VRAM Detection Helper ──────────────────────────────────────────────

/**
 * Detect GPU and dedicated VRAM using nvidia-smi (if available)
 * or fallback to PowerShell / WMI querying.
 */
function getGpuDetails() {
  const { exec } = require("child_process");
  return new Promise((resolve) => {
    // 1. Try nvidia-smi first for accurate Nvidia GPU + VRAM
    exec("nvidia-smi --query-gpu=name,memory.total --format=csv,noheader", { timeout: 3000 }, (err, stdout) => {
      if (!err && stdout) {
        const parts = stdout.trim().split(",");
        if (parts.length >= 2) {
          const name = parts[0].trim();
          const memStr = parts[1].trim(); // e.g. "16303 MiB"
          const mib = parseInt(memStr, 10);
          if (!isNaN(mib)) {
            const gb = parseFloat((mib / 1024).toFixed(1));
            return resolve({ name, vramGb: gb, source: "nvidia-smi" });
          }
        }
      }

      // 2. Fallback to PowerShell WMI for AMD, Intel or other GPUs
      exec('powershell -Command "Get-CimInstance Win32_VideoController | Select-Object Name, AdapterRAM | ConvertTo-Json"', { timeout: 4000 }, (wmiErr, wmiStdout) => {
        if (!wmiErr && wmiStdout) {
          try {
            let data = JSON.parse(wmiStdout.trim());
            if (!Array.isArray(data)) {
              data = [data];
            }
            // Filter out basic or virtual displays
            const realGpus = data.filter(g => g.Name && !g.Name.includes("Basic Render") && !g.Name.includes("Virtual"));
            const target = realGpus.length > 0 ? realGpus : data;

            let bestGpu = null;
            for (const gpu of target) {
              if (!bestGpu || (gpu.AdapterRAM > bestGpu.AdapterRAM)) {
                bestGpu = gpu;
              }
            }

            if (bestGpu) {
              const name = bestGpu.Name;
              let vramGb = parseFloat((bestGpu.AdapterRAM / 1e9).toFixed(1));
              // Handle WMI 4GB limitation overflow (reports exactly 4293918720)
              if (bestGpu.AdapterRAM === 4293918720) {
                vramGb = 4.0;
              }
              return resolve({ name, vramGb, source: "wmi" });
            }
          } catch (e) {}
        }
        resolve({ name: "Intel/AMD HD Graphics", vramGb: 2.0, source: "fallback" });
      });
    });
  });
}

// ─── Workstation Runtime IPC ──────────────────────────────────────────────────

/**
 * Returns the full machine identity manifest for the RuntimeMonitor / RuntimeStatusMatrix.
 */
ipcMain.handle("get-runtime-manifest", async () => {
  const os_module = require("os");
  const displays = screen.getAllDisplays();
  const svStatus = supervisor.getStatus();
  const gpuInfo = await getGpuDetails();

  return {
    hostname: os_module.hostname(),
    platform: os_module.platform(),
    arch: os_module.arch(),
    cpuModel: os_module.cpus()[0]?.model ?? "Unknown CPU",
    cpuCores: os_module.cpus().length,
    totalRamGb: (os_module.totalmem() / 1e9).toFixed(1),
    freeRamGb: (os_module.freemem() / 1e9).toFixed(1),
    uptimeSec: Math.round(os_module.uptime()),
    bridgeDir: BRIDGE_DIR,
    bridgeStatus,
    bridgeRestarts: bridgeRestartCount,
    appVersion: APP_VERSION,
    isDev,
    monitorCount: displays.length,
    workstationMode: true,
    // Runtime Supervisor services
    mongoStatus:  svStatus.mongoStatus,
    mongoUri:     svStatus.mongoUri,
    aiMode:       svStatus.aiMode,
    aiEndpoint:   svStatus.aiEndpoint,
    // Detected Graphics & VRAM
    gpuModel: gpuInfo.name,
    vramGb: gpuInfo.vramGb,
  };
});

/** Trigger MongoDB service start from the RuntimeMonitor UI */
ipcMain.handle("ensure-mongodb", async () => {
  const result = await supervisor.ensureMongoDBNow();
  // Restart bridge so it picks up the new MONGO_URI
  if (result.mongoStatus === "active" && bridgeProc) {
    bridgeRestartCount = 0;
    stopBridge();
    setTimeout(startBridge, 500);
  }
  return result;
});

/** Re-probe local AI inference servers from the RuntimeMonitor UI */
ipcMain.handle("refresh-ai-mode", async () => {
  return supervisor.refreshAiMode();
});

/**
 * Returns all connected display bounds and work areas.
 * Enables the UI to show a monitor layout picker for instrument placement.
 */
ipcMain.handle("get-monitor-layout", () => {
  const displays = screen.getAllDisplays();
  const primary = screen.getPrimaryDisplay();
  return displays.map((d) => ({
    id: d.id,
    isPrimary: d.id === primary.id,
    bounds: d.bounds,
    workArea: d.workArea,
    scaleFactor: d.scaleFactor,
    label: d.id === primary.id ? "Primary Display" : `External Display ${d.id}`,
  }));
});

// Supervisor helpers exposed to renderer via preload
ipcMain.handle("supervisor:get-status", () => supervisor.getStatus());
ipcMain.handle("supervisor:get-sessions", () => {
  try { return supervisor.getSessions ? supervisor.getSessions() : []; } catch { return []; }
});
ipcMain.handle("supervisor:get-active-session", () => {
  try { return supervisor.getActiveSession ? supervisor.getActiveSession() : null; } catch { return null; }
});
ipcMain.handle("supervisor:start-session", (_e, { sessionId, meta } = {}) => {
  return startCurrentSession(sessionId, meta);
});
ipcMain.handle("supervisor:stop-session", (_e, { sessionId } = {}) => {
  return stopCurrentSession(sessionId);
});

/** Reset window position to default (useful for multi-monitor issues) */
ipcMain.handle("reset-window-position", () => {
  try {
    // Clear saved state file
    if (fs.existsSync(STATE_FILE_PATH)) {
      fs.unlinkSync(STATE_FILE_PATH);
    }
    // Reset in-memory state
    windowState = { width: 1600, height: 980, x: undefined, y: undefined, maximized: false };
    // Reposition window to primary display
    if (mainWindow && !mainWindow.isDestroyed()) {
      const primary = screen.getPrimaryDisplay();
      const centerX = primary.bounds.x + (primary.bounds.width - windowState.width) / 2;
      const centerY = primary.bounds.y + (primary.bounds.height - windowState.height) / 2;
      mainWindow.setBounds({
        x: Math.max(primary.bounds.x, centerX),
        y: Math.max(primary.bounds.y, centerY),
        width: windowState.width,
        height: windowState.height,
      });
      mainWindow.unmaximize();
    }
    console.log("[desktop] window position reset to primary display center");
    return { ok: true, message: "Window position reset to primary display" };
  } catch (err) {
    console.error("[desktop] failed to reset window position", err);
    return { ok: false, error: String(err) };
  }
});
ipcMain.handle("supervisor:get-telemetry-schema", () => {
  try {
    const { CoreTelemetryV1 } = require("./telemetry/coreSchema.cjs");
    return CoreTelemetryV1;
  } catch (e) {
    return { schemaVersion: 1, error: e.message };
  }
});

/**
 * Opens a properly-configured detached instrument window.
 * Sizes are calibrated per instrument type for optimal data density.
 */
const INSTRUMENT_SIZES = {
  timing:      { width: 900,  height: 640 },
  tires:       { width: 800,  height: 600 },
  hybrid:      { width: 800,  height: 560 },
  strategy:    { width: 900,  height: 600 },
  telemetry:   { width: 1200, height: 720 },
  engineering: { width: 1440, height: 900 },
};

ipcMain.handle("open-instrument-window", (_event, { type, url }) => {
  const size = INSTRUMENT_SIZES[type] ?? { width: 900, height: 640 };
  const win = new BrowserWindow({
    width: size.width,
    height: size.height,
    backgroundColor: "#05070A",
    title: `Pit Wall · ${String(type).toUpperCase()} MONITOR`,
    autoHideMenuBar: true,
    frame: true,
    titleBarStyle: "default",
    alwaysOnTop: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });
  win.loadURL(url || `${BASE_URL}/detached/${type}`);
  return { ok: true, type };
});

// ─── App lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  // Force dark mode to match the UI
  nativeTheme.themeSource = "dark";

  // Initialize runtime supervisor FIRST — it probes MongoDB and local AI
  // before the bridge spawns so MONGO_URI is available for injection.
  await supervisor.init();

  // Forward live/raw telemetry from supervisor in-process events to all open renderer windows
  if (typeof supervisor.onTelemetryLive === "function") {
    supervisor.onTelemetryLive((packet) => {
      const windows = BrowserWindow.getAllWindows();
      for (const win of windows) {
        if (!win.isDestroyed() && win.webContents) {
          win.webContents.send("telemetry-live", packet);
        }
      }
    });
  }

  if (typeof supervisor.onTelemetryRaw === "function") {
    supervisor.onTelemetryRaw((packet) => {
      const windows = BrowserWindow.getAllWindows();
      for (const win of windows) {
        if (!win.isDestroyed() && win.webContents) {
          win.webContents.send("telemetry-raw", packet);
        }
      }
    });
  }

  if (typeof supervisor.onTelemetryEvent === "function") {
    supervisor.onTelemetryEvent((event) => {
      const windows = BrowserWindow.getAllWindows();
      for (const win of windows) {
        if (!win.isDestroyed() && win.webContents) {
          win.webContents.send("telemetry-event", event);
        }
      }
    });
  }

  currentSessionId = supervisor.getActiveSession ? supervisor.getActiveSession()?.id : null;

  startBridge();
  buildMenu();

  // Resolve which local server to use BEFORE opening the window
  await resolveUrl();

  createWindow();
  createTray();
  registerSessionHotkey();

  // Rebuild the menu now that BASE_URL is set correctly
  buildMenu();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("before-quit", () => {
  saveWindowState();
  stopBridge();
  supervisor.shutdown();
});

app.on("will-quit", () => {
  try { globalShortcut.unregisterAll(); } catch {}
});

app.on("window-all-closed", () => {
  // On macOS keep the app alive in the tray
  if (process.platform !== "darwin") app.quit();
});

// Single instance lock — focus existing window if user opens a second instance
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
