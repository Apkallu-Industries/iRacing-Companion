# Pit Wall — Development & Architecture Installation Manual

Welcome to the **Pit Wall Workstation** developer and stakeholder onboarding manual. This document guides developers, engineering leads, and stakeholders through bootstrapping the source code, understanding its architecture, and building standard production-ready binaries.

---

## ⚡ Executive Architecture Overview

Pit Wall is a highly integrated, performance-focused telemetry suite built as three modular layers:

1. **The Core UI Engine (Root)**: A high-performance TanStack Start SSR front-end powered by React 19 and Tailwind CSS v4, built to run seamlessly on standard browsers or inside container shells.
2. **The Local Telemetry Bridge (`local-bridge/`)**: A dedicated Node.js service reading iRacing's Shared Memory API at **60Hz** using raw binary bindings (`irsdk-node`), managing database recording (`mongodb`), and executing local AI-engineered driver models.
3. **The Workstation Shell (`desktop/`)**: A premium Electron 31 application wrapper managing automated bridge supervision, native audio routing (`setSinkId`), persistent layouts, and single-instance locks.

Thanks to **NPM Workspaces**, all three directories are seamlessly linked. Developers and stakeholders can initialize the entire repository with a **single root-level command**.

---

## 🛠️ Section 1: Prerequisites

Before initializing the workspace, ensure the following tools are installed on your Windows machine (the bridge communicates directly with Windows-only simulators):

- **Node.js LTS** (Version `24.13.0` is officially targeted, but `20.0.0+` is compatible) — Includes NPM. [Download Node.js](https://nodejs.org/)
- **Git** — For version control. [Download Git](https://git-scm.com/)
- **MongoDB Community Server** (Optional, but highly recommended for telemetry persistence) — Pit Wall automatically provisions its own service named `PitWallMongoDB` on install, but developers running the raw bridge can run a local instance on the default port `27017`. [Download MongoDB](https://www.mongodb.com/try/download/community)

---

## 🚀 Section 2: Zero-Setup Bootstrapping (One-Click Setup)

For stakeholders, investors, or new developers who **do not have Node.js or NPM installed**, Pit Wall includes an automated zero-setup bootstrapper. You do not need to download anything from the web or type any terminal commands.

### Choice A: Automated Double-Click Setup (Recommended)

1. **Configure Environment Variables**:
   Copy `.env.example` to `.env` in the root folder, and open it to supply your integration keys (Supabase, ElevenLabs, etc.).
2. **Double-Click `setup.bat`**:
   Double-click the [setup.bat](file:///c:/Dev/iRacing-Companion/setup.bat) file in the project root.
   - **What happens**: The bootstrapper will check if Node.js is installed. If missing, it will automatically download the official Node.js installer silently, install it, refresh the system environment paths in the active console, and run `npm install` to download all project dependencies automatically.
3. **Double-Click `start-dev.bat`**:
   Once the setup is complete, double-click the [start-dev.bat](file:///c:/Dev/iRacing-Companion/start-dev.bat) file in the project root.
   - **What happens**: The script will instantly launch the local development server, telemetry bridge, and supervisions. The app window will open in front of you!

---

### Choice B: Manual Terminal Setup

If you already have Node.js and NPM installed and prefer using a terminal:

1. **Clone & Navigate**:
   ```bash
   git clone https://github.com/Apkallu-Industries/iRacing-Companion.git
   cd iRacing-Companion
   ```
2. **Establish Environment**:
   ```bash
   copy .env.example .env
   ```
3. **Install Dependencies**:
   Run this single command at the root:
   ```bash
   npm install
   ```
   _This automatically resolves, downloads, and compiles dependencies for the client, desktop shell, and bridge simultaneously._

---

## 🖥️ Section 3: Launching the Development Stack

You can run Pit Wall in two ways depending on your current target workspace:

### Choice A: Running the Standalone Desktop Shell (Recommended)

This launches the Electron app locally, automatically syncing the bridge, downloading the portable Node runtime caching engine, and opening the workbench:

```bash
npm run desktop:dev
```

- **What happens**: Electron spawns the UI at `http://127.0.0.1:8080` (with full Hot Module Reload) and supervises the bridge child process running on `ws://localhost:3001`.

---

### Choice B: Running in Separate Browser Terminals

If you want to run the front-end and telemetry bridge in isolated terminal sessions for debugging:

1. **Start the Web Client (Terminal 1)**:

   ```bash
   npm run dev
   ```

   _The client dashboard is now live at `http://localhost:3000` (or `http://localhost:8080`)._

2. **Start the Live Bridge (Terminal 2)**:
   ```bash
   cd local-bridge
   npm start
   ```
   _The bridge connects to iRacing, registers MongoDB recording, and establishes a 60Hz telemetry socket on port `3001`._

---

## 📦 Section 4: Compiling Production Packages & Clean Installers

For stakeholders and engineers wanting to verify the compiled standalone application (`.exe`), the build system has been automated to produce a production-grade, highly optimized NSIS installer.

### To Compile and Package:

Navigate to the root workspace or `desktop/` and run the packaging suite:

```bash
cd desktop
npm run dist
```

### What happens under the hood:

When you compile the installer, Pit Wall performs a bulletproof, multi-stage production build:

1. **Front-End Compilation**: Packages and optimizes the static TanStack Start client bundle.
2. **Deterministic Auto-Sync**: Wipes the temporary `desktop/bridge/` staging directory.
3. **Bridge Sync & Optimization**: Copies files from `local-bridge/` to the packaging root, **skipping developer assets** and large, dirty node modules.
4. **Clean Dependency Compilation**: Automatically executes `npm install --omit=dev` directly inside the bridge folder, ensuring only lean production dependencies are packed.
5. **Portable Node.js Integration**: Automatically downloads the official standard portable Node.js executable (`node.exe`) matching version `24.13.0` and caches it inside `desktop/bin/node.exe`.
6. **Binary Assembly**: Instructs `electron-builder` to bundle the front-end, standard `node.exe` portable executable, and clean bridge libraries into a single executable installer located at:
   `desktop/dist-installer/Pit Wall Setup <version>.exe`

This final installer is fully offline-capable, provisioning its own database service and running standard Node telemetry processing with absolutely **zero pre-existing setup required on the customer's machine**.

---

## 📂 Section 5: Directory Map Reference

For engineering walkthroughs, refer to this directory structure to navigate the code layers:

```
C:\Dev\iRacing-Companion\
├── local-bridge/               # Telemetry Bridge (Standard Node.js)
│   ├── server.js               # Main bridge entry point (WebSocket server @ 3001)
│   ├── telemetry-recorder.js   # MongoDB storage engine
│   └── workers/                # Isolating heavy analytics in analyticalWorker.js
├── desktop/                    # Desktop Shell (Electron wrapper)
│   ├── main.cjs                # App window, system tray, and bridge supervisor
│   ├── assets/                 # App icons and installer layouts
│   ├── bin/                    # Cache directory for bundled standard node.exe (Ignored in Git)
│   └── installer/              # NSIS setup configuration scripts (runtime-setup.nsh)
├── src/                        # Front-End Web Application (TanStack Start)
│   ├── routes/                 # File-based navigation logic
│   ├── components/             # Reusable live-gauges and lap-analysis plots
│   └── lib/                    # Math evaluators, and Web-Worker .ibt file parser
└── package.json                # Root workspaces manager configuration
```
