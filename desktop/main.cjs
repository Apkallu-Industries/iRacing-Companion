/* eslint-disable */
// Pit Wall Desktop — Electron shell that:
//   1. Spawns the bundled iRacing → WebSocket bridge (Node child process).
//   2. Opens the published dashboard in a native window pointing at the
//      local bridge on ws://localhost:3001.
//
// The dashboard is loaded from the live published site so it stays
// up-to-date without re-shipping a new desktop build for every UI tweak.

const { app, BrowserWindow, shell, Menu, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const DASHBOARD_URL = "https://iracing-companion.lovable.app/live";
const BRIDGE_DIR = path.join(__dirname, "bridge");

let mainWindow = null;
let bridgeProc = null;
let bridgeStatus = "starting"; // 'starting' | 'running' | 'crashed'

function startBridge() {
  if (bridgeProc) return;
  const serverPath = path.join(BRIDGE_DIR, "server.js");
  if (!fs.existsSync(serverPath)) {
    bridgeStatus = "crashed";
    console.error("[desktop] bridge server.js missing at", serverPath);
    return;
  }
  // Use Electron's bundled node by setting ELECTRON_RUN_AS_NODE.
  bridgeProc = spawn(process.execPath, [serverPath], {
    cwd: BRIDGE_DIR,
    env: { ...process.env, ELECTRON_RUN_AS_NODE: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  bridgeStatus = "running";
  bridgeProc.stdout.on("data", (b) => process.stdout.write(`[bridge] ${b}`));
  bridgeProc.stderr.on("data", (b) => process.stderr.write(`[bridge] ${b}`));
  bridgeProc.on("exit", (code) => {
    console.log("[desktop] bridge exited with code", code);
    bridgeProc = null;
    bridgeStatus = code === 0 ? "starting" : "crashed";
  });
}

function stopBridge() {
  if (!bridgeProc) return;
  try {
    bridgeProc.kill();
  } catch {}
  bridgeProc = null;
  bridgeStatus = "starting";
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 980,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: "#09090b",
    title: "Pit Wall Desktop",
    autoHideMenuBar: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(DASHBOARD_URL);

  // External links open in the user's browser, not in the app shell.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function buildMenu() {
  const isMac = process.platform === "darwin";
  const template = [
    ...(isMac ? [{ role: "appMenu" }] : []),
    {
      label: "App",
      submenu: [
        {
          label: "Dashboard",
          click: () => mainWindow?.loadURL(DASHBOARD_URL),
        },
        {
          label: "Local Bridge UI (localhost:3001)",
          click: () => mainWindow?.loadURL("http://localhost:3001"),
        },
        { type: "separator" },
        {
          label: "Restart Bridge",
          click: () => {
            stopBridge();
            setTimeout(startBridge, 250);
          },
        },
        {
          label: "Bridge Status…",
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "Pit Wall Bridge",
              message: `Bridge: ${bridgeStatus}`,
              detail:
                bridgeStatus === "running"
                  ? "ws://localhost:3001 is live — the dashboard will switch to live data automatically once iRacing is in a session."
                  : "The local bridge isn't running. Try 'Restart Bridge' from this menu.",
            });
          },
        },
        { type: "separator" },
        isMac ? { role: "close" } : { role: "quit" },
      ],
    },
    { role: "viewMenu" },
    { role: "windowMenu" },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  startBridge();
  buildMenu();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("before-quit", () => {
  stopBridge();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
