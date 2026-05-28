# Getting Started — Pit Wall

This guide is the primary reference for alpha testers using both the standalone desktop app and the web-based version.

## Supported modes

- **Desktop Standalone** — Electron desktop experience with auto-spawned bridge and local telemetry handling.
- **Web-based** — Browser UI served by Vite or production build; works with locally running bridge or imported session files.

## System requirements

- Windows 10 or 11 for live iRacing telemetry.
- Node.js **24 LTS or newer** for local development and build.
- Recommended: 16GB RAM, modern CPU, and a stable network for browser access.

## 1. Desktop Standalone Setup

### Install

1. Download and install the Pit Wall Desktop package.
2. If using the repo, run:

```powershell
cd desktop
npm install
npm run dev
```

3. For production desktop mode:

```powershell
npm run desktop
```

### Launch

- Launch the desktop app.
- The embedded bridge starts automatically and listens on `ws://127.0.0.1:3001`.
- Once iRacing is running, the live dashboard should connect automatically.

### What works in Desktop mode

- Live 60Hz telemetry from the local bridge.
- `.pwlap` recording and playback.
- Local MongoDB diagnostics and session caching.
- AI coach / advisor with local LLM support.

## 2. Web-based Setup

### Install and run

```powershell
npm install
npm run dev
```

- Open the browser URL shown by Vite.
- The web app runs on any OS for analysis views and cloud sign-in.

### Live telemetry from browser

To use live telemetry from the browser, the local bridge must run on the same Windows sim PC:

```powershell
cd local-bridge
npm install
npm start
```

Then open the web app and navigate to `/live`.

### Import and analysis only

If you do not need live telemetry, use the app for:

- `.ibt` file import and analysis.
- `.pwlap` recording playback.
- session library and shared lap review.

## 3. Build for production

### Web app production build

```powershell
npm run build
npm run preview
```

### Desktop packaging

From the `desktop/` folder:

```powershell
cd desktop
npm install
npm run package
```

This produces a packaged installer under `desktop/dist-installer` or `desktop/dist`.

## 4. Local bridge quick start

The local bridge reads iRacing shared memory and broadcasts telemetry to the app.

```powershell
cd local-bridge
npm install
npm start
```

- Web app URL: `http://localhost:3001`
- WebSocket endpoint: `ws://localhost:3001`

## 5. Recommended alpha-tester workflow

### Option A: Desktop-first

1. Install desktop app.
2. Launch Pit Wall Desktop.
3. Start iRacing and join a session.
4. Open the Live dashboard and confirm telemetry.
5. Record sessions as `.pwlap` for later analysis.

### Option B: Web-first

1. Run the web app with `npm run dev`.
2. Run the local bridge separately on the Windows sim PC.
3. Open the browser dashboard and connect to `/live`.
4. Upload `.ibt` or `.pwlap` files from the session library.

## 6. Alpha tester checklist

- [ ] Confirm Node.js 24 LTS or newer is installed.
- [ ] Confirm local bridge starts successfully.
- [ ] Confirm live telemetry arrives in the dashboard.
- [ ] Confirm `.pwlap` recording plays back in the Workbench.
- [ ] Confirm AI coach or local LLM settings are reachable.
- [ ] Confirm local MongoDB diagnostics if using session caching.

## 7. Notes for testers

- The desktop app is recommended for the cleanest live telemetry experience.
- The web app is ideal for users who want a browser-based workbench.
- The same repo supports both modes; follow the mode-specific sections above.
