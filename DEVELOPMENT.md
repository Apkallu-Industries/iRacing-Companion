Windows developer setup and packaging notes
=========================================

If a contributor or teammate downloads the repository and attempts to "install" or run the project from source on Windows, the most common failure is that `node` / `npm` are not installed or not on the PATH. The packaged `.exe` that we build with `electron-builder` bundles a Node runtime for the packaged app, but building/running from source requires Node.

Quick checklist (recommended)
- Install Node.js LTS (match repo engines: `24.13.0`) via https://nodejs.org/
- Or install `nvm-windows` and `nvm install 24.13.0 && nvm use 24.13.0`
- Restart your terminal after install so PATH changes take effect

Helpful helper scripts
- `scripts/check-node.ps1` — PowerShell script that verifies `node` and `npm` and prints helpful links. Run in PowerShell:

  powershell -ExecutionPolicy Bypass -File .\scripts\check-node.ps1

- `scripts/check-node.bat` — Batch file for quick checks in Command Prompt or double-click.

How to run locally (development)
1. Open PowerShell (or cmd) in the repo root
2. Run the environment check (optional but helpful):

  powershell -ExecutionPolicy Bypass -File .\scripts\check-node.ps1

3. Install dependencies and build the web assets:

  npm ci
  npm run build

4. Run the desktop app in dev:

  npm --prefix desktop run dev

Packaging notes
- The desktop `dist` builds are created by `electron-builder`. Building the installer requires NSIS (`makensis`) on PATH for the Windows NSIS target. If `makensis` is missing, packaging will fail with an error telling you to install NSIS.
- The installer does not install developer Node/npm — it bundles what the packaged Electron app needs at runtime. To produce that `.exe` you still need a build environment with Node installed.

If you'd like, I can:
- Add a `scripts/check-env` npm script to run the PowerShell check
- Add a short `setup-dev.bat` that runs the check and the `npm ci`/`npm run build` sequence for Windows
