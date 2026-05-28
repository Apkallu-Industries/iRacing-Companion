# Pit Wall Desktop — Electron Packager

This directory contains the **Electron desktop wrapper** for Pit Wall. It bundles the web front-end alongside the local telemetry bridge into a self-contained Windows installer (`.exe`).

---

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | `24.x` | Must match the `engines` field in `package.json` |
| npm | `10.x+` | Comes with Node |
| Pit Wall web app built | `dist/` present | Run `npm run build` from the repo root first |

Install desktop dependencies once (if not already done):

```powershell
cd desktop
npm install
```

---

## Full Release Build (Two Steps)

### Step 1 — Build the Web App

Run from the **repository root** (`c:\Dev\iRacing-Companion`):

```powershell
npm run build
```

This compiles the React/Vite front-end and SSR server into:
- `dist/client/` — browser-side assets
- `dist/server/` — server-side render assets

> You must rebuild the web app whenever you change any source files under `src/` before repackaging the installer.

---

### Step 2 — Package the Electron Installer

Run from the **`desktop/`** directory:

```powershell
cd desktop
npm run dist
```

`npm run dist` performs two actions in sequence:

1. **`copy-bridge.js`** — Syncs the canonical `local-bridge/` source into `desktop/bridge/` so the packager bundles the latest bridge code.
2. **`electron-builder --win --x64`** — Packages Electron + the web app + the bridge into a Windows NSIS installer.

#### Output

```
desktop/dist-installer/Pit Wall Setup X.X.X.exe       ← Installer for end-users
desktop/dist-installer/Pit Wall Setup X.X.X.exe.blockmap
desktop/dist-installer/win-unpacked/                  ← Unpacked app (for quick testing)
```

---

## Build Variants

| Command | Output | Use Case |
|---|---|---|
| `npm run dist` | `dist-installer/Pit Wall Setup X.X.X.exe` (NSIS) | Full installer for end-user distribution |
| `npm run dist:dir` | `dist-installer/win-unpacked/` | No installer — raw folder, fastest to test |
| `npm run dist:portable` | `dist-installer/*.exe` (portable) | Run-anywhere EXE, no install required |

---

## One-Liner Full Rebuild

To do both steps back-to-back from the repo root:

```powershell
# PowerShell
npm run build; cd desktop; npm run dist; cd ..
```

---

## Directory Structure

```
desktop/
├── assets/               # App icon (icon.ico), installer graphics
├── bridge/               # Auto-synced copy of local-bridge/ (do not edit directly)
├── dist-installer/       # Build output — installer EXE lives here
├── installer/            # NSIS installer assets / license files
├── scripts/
│   ├── copy-bridge.js    # Syncs local-bridge/ → bridge/ before packaging
│   └── remove-bridge.js  # Cleanup helper
├── main.cjs              # Electron main process entry point
├── preload.cjs           # Electron preload script (context bridge)
├── runtimeSupervisor.cjs # Watchdog that manages the bridge child process
└── package.json          # Electron-builder configuration & npm scripts
```

> **Important:** Never edit files inside `desktop/bridge/` directly. That folder is wiped and re-synced from `local-bridge/` every time you run `npm run dist` or `npm start`. Make all bridge changes in `local-bridge/` instead.

---

## Running in Development (Electron Dev Mode)

To launch the Electron shell against the Vite dev server (hot-reload):

```powershell
# 1. Start the web dev server in one terminal (from repo root)
npm run dev

# 2. Start Electron in dev mode (from desktop/)
cd desktop
npm run dev
```

---

## Known Build Warnings

### `rcedit` — "Unable to commit changes"

```
⨯ cannot execute  cause=exit status 1
  errorOut=Fatal error: Unable to commit changes
```

**This is non-fatal.** `rcedit` is a tool that patches the Windows `.exe` version metadata (file description, product name, icon, etc.). It occasionally fails on the first attempt due to file-locking. electron-builder automatically retries up to 3 times. If it succeeds on a retry (which it usually does), the build continues normally and a complete installer is produced.

**If it fails all retries:** Close any running instances of `Pit Wall.exe` and retry `npm run dist`.

---

### Code Signing — "signing is skipped"

```
• no signing info identified, signing is skipped  signHook=false cscInfo=null
```

**Expected.** No code-signing certificate is configured. The installer and EXE will be unsigned. Windows SmartScreen may display a warning on first launch — users can bypass it by clicking **More info → Run anyway**.

To add code signing in the future, set the following environment variables before running `npm run dist`:

```powershell
$env:CSC_LINK      = "path\to\certificate.pfx"
$env:CSC_KEY_PASSWORD = "your-cert-password"
```

---

## Versioning

The installer version is controlled by the `version` field in [`desktop/package.json`](file:///c:/Dev/iRacing-Companion/desktop/package.json). Bump it before a release:

```json
{
  "version": "1.3.0"
}
```

The installer filename will reflect the new version automatically:
```
Pit Wall Setup 1.3.0.exe
```

---

## Boot Behaviour

When Pit Wall Desktop launches it opens the `/runtime` initialization page, which runs the **RuntimeStatusMatrix** boot sequence (checking Node bridge, Supabase connectivity, etc.), then navigates to the **Landing Page** (`/`) once ready.

From the landing page the user selects their workspace:

| Workspace | Route | Description |
|---|---|---|
| Live Telemetry Command | `/live` | 60Hz real-time telemetry dashboard |
| Team Strategy Command | `/team` | Endurance race strategy operations center |
| Analysis Workbench | `/sessions` | `.ibt` lap file analysis workbench |
| AI Engineer Terminal | `/ai-engineer` | AI-powered race engineering assistant |
