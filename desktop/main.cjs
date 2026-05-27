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

const { app, BrowserWindow, shell, Menu, Tray, dialog, ipcMain, nativeTheme } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const os = require("os");

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
const CLOUD_URL = "https://iracing-companion.lovable.app";

// Start with a sensible default; resolveUrl() will update it before the window opens.
let BASE_URL    = isDev ? VITE_URL : BRIDGE_UI;
let DASHBOARD_URL = `${BASE_URL}/live`;

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
    // Dev mode: always use Vite
    BASE_URL      = VITE_URL;
    DASHBOARD_URL = `${VITE_URL}/live`;
    console.log(`[desktop] dev mode → ${DASHBOARD_URL}`);
    return;
  }

  // Give the bridge a moment if it just started
  await new Promise(r => setTimeout(r, 1200));

  if (await isReachable(VITE_URL)) {
    BASE_URL      = VITE_URL;
    DASHBOARD_URL = `${VITE_URL}/live`;
    console.log(`[desktop] local Vite dev server detected → ${DASHBOARD_URL}`);
    return;
  }

  if (await isReachable(BRIDGE_UI)) {
    BASE_URL      = BRIDGE_UI;
    DASHBOARD_URL = `${BRIDGE_UI}/live`;
    console.log(`[desktop] bridge HTTP server detected → ${DASHBOARD_URL}`);
    return;
  }

  BASE_URL      = CLOUD_URL;
  DASHBOARD_URL = `${CLOUD_URL}/live`;
  console.log(`[desktop] ⚠️  no local server found, falling back to cloud → ${DASHBOARD_URL}`);
}

// Prefer the source-tree bridge over the bundled copy (dev workflow).
// Falls back to desktop/bridge for packaged distributions.
const BRIDGE_DIR = (() => {
  const srcBridge = path.join(__dirname, "..", "local-bridge");
  return fs.existsSync(path.join(srcBridge, "server.js")) ? srcBridge : path.join(__dirname, "bridge");
})();

const STATE_FILE_PATH = path.join(app.getPath("userData"), "window-state.json");
const LOG_FILE_PATH = path.join(app.getPath("userData"), "bridge.log");

// ─── State ────────────────────────────────────────────────────────────────────

let mainWindow = null;
let tray = null;
let bridgeProc = null;
let bridgeRestartCount = 0;
let bridgeStatus = "starting"; // 'starting' | 'running' | 'crashed'

let windowState = { width: 1600, height: 980, x: undefined, y: undefined, maximized: false };
try {
  if (fs.existsSync(STATE_FILE_PATH)) {
    const data = JSON.parse(fs.readFileSync(STATE_FILE_PATH, "utf-8"));
    if (data.width && data.height) windowState = { ...windowState, ...data };
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
  bridgeProc = spawn(process.execPath, [serverPath], {
    cwd: BRIDGE_DIR,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      NODE_ENV: isDev ? "development" : "production",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  bridgeStatus = "running";
  updateTray();

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
  mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: "#09090b",
    title: "Pit Wall Desktop",
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
      url.startsWith("http://127.0.0.1") ||
      url.startsWith("https://iracing-companion.lovable.app")
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

function updateTray() {
  if (!tray) return;
  const bridgeLabel =
    bridgeStatus === "running"
      ? "✅ Bridge: Running (ws://localhost:3001)"
      : bridgeStatus === "crashed"
        ? "❌ Bridge: Crashed"
        : "⏳ Bridge: Starting…";

  const menu = Menu.buildFromTemplate([
    {
      label: `Pit Wall Desktop v${APP_VERSION}`,
      enabled: false,
    },
    { type: "separator" },
    { label: bridgeLabel, enabled: false },
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
    `Pit Wall Desktop v${APP_VERSION}\nBridge: ${bridgeStatus}\nUI: ${BASE_URL}`
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

// ─── App lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  // Force dark mode to match the UI
  nativeTheme.themeSource = "dark";

  startBridge();
  buildMenu();

  // Resolve which local server to use BEFORE opening the window
  await resolveUrl();

  createWindow();
  createTray();

  // Rebuild the menu now that BASE_URL is set correctly
  buildMenu();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("before-quit", () => {
  saveWindowState();
  stopBridge();
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
