# Pit Wall — iRacing Telemetry & Lap Analysis

> Live iRacing telemetry dashboard **+** MoTeC‑style `.ibt` lap analysis workbench, in the browser.
> Telemetry on track. Analysis off track. One app.

**Live:** [https://iracing-companion.lovable.app](https://iracing-companion.lovable.app)

---

## Table of contents

1. [What this is](#what-this-is)
2. [Tech stack](#tech-stack)
3. [Feature map](#feature-map)
4. [Live telemetry (on track)](#live-telemetry-on-track)
5. [Lap analysis workbench (off track)](#lap-analysis-workbench-off-track)
6. [AI Coach & Advisor](#ai-coach--advisor)
7. [Car fingerprint & setup tools](#car-fingerprint--setup-tools)
8. [Community](#community)
9. [Sessions, sharing & history](#sessions-sharing--history)
10. [Theming](#theming)
11. [Backend, auth & security](#backend-auth--security)
12. [Project structure](#project-structure)
13. [Running locally](#running-locally)
14. [Pi-parity roadmap](#pi-parity-roadmap)

---

## What this is

Pit Wall is a two‑sided iRacing companion:

- **Live mode** streams real‑time telemetry from a local bridge running alongside iRacing and renders a configurable dashboard (gauges, channel readouts, derived metrics, a spoken AI coach).
- **Workbench mode** parses native iRacing `.ibt` telemetry files **directly in the browser** (Web Worker), and gives you a MoTeC‑style analysis environment: stacked traces, track map, sector spider, G‑G diagram, lap compare, optimal lap, time‑loss waterfall, setup sheet, replay, and AI counterfactuals.

Everything is account‑scoped via row‑level security — your laps are yours.

---

## Tech stack

- **Framework:** TanStack Start v1 (React 19, SSR, file‑based routing) on Vite 7
- **Runtime:** Cloudflare Workers (edge) for server functions & API routes
- **Styling:** Tailwind CSS v4 with `oklch` design tokens in `src/styles.css`
- **UI:** shadcn/ui (Radix primitives) + lucide-react icons
- **Charts:** uPlot (synchronized stacked traces), custom Canvas/SVG (track map, G‑G, spider)
- **3D / Replay:** `@react-three/fiber` + `@react-three/drei`
- **State / data:** TanStack Query, Zustand
- **Backend:** Lovable Cloud (Supabase: Postgres + Auth + Storage + Realtime)
- **AI:** Lovable AI Gateway (Google Gemini / OpenAI GPT‑5 family) for coaching, summarization, setup advice
- **TTS:** Server‑side text‑to‑speech for spoken coach call‑outs
- **Parser:** Custom `.ibt` (IRSDK) binary parser in a Web Worker — typed arrays for 250+ channels

---

## Feature map

| Area                | Route           | Highlights                                                        |
| ------------------- | --------------- | ----------------------------------------------------------------- |
| Marketing / landing | `/`             | Hero, feature overview, schema.org metadata                       |
| How it works        | `/how-it-works` | Parsing pipeline diagram, `.ibt` format breakdown                 |
| Auth                | `/auth`         | Email + password, Google OAuth                                    |
| Live dashboard      | `/live`         | Real‑time telemetry, gauges, AI coach, bridge install             |
| Settings            | `/settings`     | AI provider, Voice (ElevenLabs), Local DB diagnostics, Appearance |
| Workbench           | `/sessions/$id` | Lap analysis for an uploaded `.ibt`                               |
| Sessions list       | `/sessions`     | All uploaded laps, fingerprint deltas                             |
| Car fingerprint     | `/fingerprint`  | Tire / brake / aero fingerprint vs reference                      |
| Shared lap          | `/share/$token` | Public read‑only view of a lap                                    |
| Lab                 | `/lab/lapfile`  | Diagnostic parser playground                                      |
| Sitemap             | `/sitemap.xml`  | SEO sitemap                                                       |

A global fixed **Back** button (`src/components/BackButton.tsx`) is pinned top‑left on every non‑landing page so you’re never trapped.

---

## Live telemetry (on track)

Route: **`/live`** · Components: `src/components/live/*`

### Bridge

- **`BridgeInstall.tsx`** — One‑click download + setup instructions for the local desktop bridge that exposes iRacing’s IRSDK over a local websocket.
- Bridge runtime now supports independent rates and adaptive streaming:
  - `TICK_HZ` (sample rate, up to 360Hz)
  - `UI_HZ` (dashboard websocket rate)
  - `RECORD_HZ` (recording rate)
  - `ADAPTIVE_UI=1` auto-falls back to 30Hz for slow clients based on reported browser FPS
- **`DesktopLapSync.tsx`** — Auto‑uploads completed laps from the bridge into your session history so you can analyze them in the workbench right after the run.

### Dashboard widgets

- **`ConfigurableChannelList.tsx`** + **`ChannelRegistry.ts`** — Pick any of the 250+ live IRSDK channels and lay them out as compact readouts. Layout is persisted per user via `preferences.functions.ts` and shareable as a _community channel layout_ (votes, security‑definer RPC for vote counts).
- **`DerivedMetrics.tsx`** — Computed channels (delta to ref, brake bias %, slip estimates, ideal gear).
- **`MotecPanels.tsx`** — MoTeC‑style multi‑panel gauges.
- **`RecordingControls.tsx`** — Start / stop a local recording buffer (`liveRecorder.ts`) — useful when you want to capture a stint without waiting for iRacing’s own .ibt write.
- **`LiveReference.tsx`** — Overlays your best historical lap as a moving reference while driving.
- **`FingerprintUploadCard.tsx`** — Upload a fingerprint baseline from your car so the coach knows your tire/brake envelope.

### Real‑time coach

- **`LiveCoach.tsx`** + **`AdvisorButton.tsx`** + `src/lib/live/coachRules.ts` — Rule‑based + LLM hybrid coach that watches live channels and surfaces call‑outs (“lift earlier into T4”, “brake bias too rearward for this fuel load”). Spoken via `tts.functions.ts`.
- **`GearAdvisor.tsx`** — Suggests gear ratio changes based on observed RPM histograms vs target shift points; integrates with the community gear‑ratio library.

---

## Lap analysis workbench (off track)

Route: **`/sessions/$id`** · Components: `src/components/workbench/*`

### Parsing pipeline (`src/lib/ibt/`)

1. **Upload** `.ibt` → stored privately (RLS scoped) via `uploadIbt.ts`.
2. **Decode header** — IRSDK header, variable headers, embedded session YAML (`parser.ts`).
3. **Stream samples** in a dedicated **Web Worker** (`parser.worker.ts`, `parseInWorker.ts`) — 250+ channels decoded into `Float32Array`s without blocking the UI.
4. **Reconstruct** lap boundaries from the `Lap` channel and integrate `VelocityX/Y` × `Yaw` to rebuild the track outline.
5. **Render** with uPlot + a single shared sub‑frame cursor across every pane.

### Panes

| Component                                | What it does                                                                                                                         |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `ChannelBrowser.tsx`                     | All 250+ channels grouped (Driver Inputs · Vehicle · Engine · Tires · Suspension · Session · Environment), searchable, click‑to‑plot |
| `StackedTraces.tsx`                      | Synchronized uPlot panels with min/max/avg readout per channel                                                                       |
| `TrackMap.tsx`                           | Reconstructed XY outline, live cursor dot, optional sector overlay                                                                   |
| `Timeline.tsx` + `LapList.tsx`           | Pick reference lap + compare lap (dashed overlay on every trace)                                                                     |
| `SectorSpider.tsx`                       | Per‑sector deltas vs reference as a radar chart                                                                                      |
| `TimeLossWaterfall.tsx`                  | Where you lost / gained time across a lap, per micro‑sector                                                                          |
| `GGDiagram.tsx`                          | Longitudinal × lateral G scatter with envelope                                                                                       |
| `MinCornerSpeed.tsx`                     | Apex speed per corner, deltas vs reference                                                                                           |
| `BrakeBias.tsx`                          | Brake‑bias analysis over a stint                                                                                                     |
| `SlipAngle.tsx`                          | Slip angle estimate (front/rear) from IMU + steering                                                                                 |
| `OptimalLap.tsx`                         | Theoretical best lap stitched from your fastest sectors                                                                              |
| `PianoRoll.tsx`                          | Throttle/brake/gear roll for pattern spotting                                                                                        |
| `SetupSheet.tsx` + `SetupDiff.tsx`       | Parsed setup YAML; diff two setups side by side                                                                                      |
| `ReplayThree.tsx` + `CinemaPlayback.tsx` | 3D car‑on‑track playback driven by telemetry                                                                                         |
| `LiveReadout.tsx`                        | HUD‑style readout you can pop out (`HudSettings.tsx`)                                                                                |
| `FingerprintDelta.tsx`                   | Compare lap’s fingerprint vs your baseline                                                                                           |
| `Counterfactuals.tsx`                    | “What if you’d braked 5m later into T3?” — AI counterfactual analysis                                                                |
| `AICoach.tsx`                            | Per‑lap natural‑language critique                                                                                                    |
| `ExportButton.tsx` / `ShareButton.tsx`   | CSV export + create a public share link                                                                                              |

---

## AI Coach & Advisor

Powered by **Lovable AI Gateway** (no API key needed):

- `src/lib/coach.functions.ts` + `src/lib/coach/summarize.ts` — Server functions that build a compact lap summary (driver inputs, corner phases, sector times, deltas) and call an LLM to produce a critique + actionable suggestions.
- `src/lib/coach/physics.ts` — Lightweight vehicle physics features fed to the LLM (load transfer estimates, slip ratios).
- `src/lib/advisor.functions.ts` + `src/lib/advisor.knowledge.ts` — Setup advisor that combines a curated knowledge base (springs, dampers, bars, aero, brake bias) with lap telemetry to recommend setup nudges.
- `src/lib/tts.functions.ts` — Server‑side TTS so the live coach can _speak_ call‑outs while you drive.
- `src/components/VoiceSettings.tsx` — Per-user ElevenLabs API key + Voice ID configuration from Settings.

All AI calls go through authenticated server functions (`requireSupabaseAuth`) so user context and rate limits are honored.

---

## Car fingerprint & setup tools

`src/lib/fingerprint/` + route `/fingerprint`

A “fingerprint” is a compact, comparable signature of how a given car/track combo behaves for you:

- `compute.ts` — Derives the fingerprint from a lap (tire temps envelope, brake duty cycle, throttle modulation, aero balance proxy).
- `carClass.ts` + `trackLengths.ts` — Normalizes by car class and track length so comparisons are apples‑to‑apples.
- `targets.ts` — Reference targets per car class (community‑sourced).
- `FingerprintDelta.tsx` — Visual delta in the workbench.

This feeds the live coach (“your front tires are 18°C hotter than baseline — back off the kerbs”) and the setup advisor.

---

## Community

`src/lib/community.functions.ts` · `src/components/community/*`

Three sharable artifact types — all stored in their own tables with strict RLS:

1. **Gear ratio sets** (`shared_gear_ratios`) — Per car class, votable.
2. **Channel layouts** (`shared_channel_layouts`) — Live‑dashboard configurations.
3. **Car class profiles** (`shared_car_classes`) — Class metadata used by the advisor.

**Security note (enforced by the DB, not the client):** vote counts can only be mutated through the `public.set_community_votes(kind, target_id, votes)` SECURITY DEFINER RPC. A `BEFORE UPDATE` trigger blocks any direct `UPDATE … SET votes = …` from clients. This is intentional — do not “simplify” around it.

`CommunityBrowser.tsx` and `CarClassCommunity.tsx` provide browse / search / upvote UIs.

---

## Sessions, sharing & history

- `src/lib/history.functions.ts` — Server functions for listing, deleting, and renaming sessions.
- `src/lib/share.functions.ts` + `/share/$token` — Generates a one‑way share token that lets anyone view a single lap without an account. The shared view is read‑only and only exposes the chosen lap.
- `src/lib/exportView.ts` + `ExportButton.tsx` — CSV export of the currently‑plotted channels.
- `src/lib/liveLaps.functions.ts` — Bridges live‑recorded laps into the same `sessions` table used by uploaded `.ibt` files, so everything lives in one history.

---

## Theming

`src/lib/themes.functions.ts` · `src/lib/themeContext.tsx` · `ThemeEditor.tsx` · `ThemeCard.tsx`

- Tokens are defined in `oklch` in `src/styles.css` and consumed exclusively via semantic Tailwind classes (`bg-background`, `text-primary`, etc).
- Users can author their own themes in `ThemeEditor` and save them to `shared_themes`.
- **Security note:** `SELECT` on `shared_themes` is authenticated‑only by design — do not re‑open this to anon.

---

## Backend, auth & security

- **Auth:** Supabase Auth via Lovable Cloud — email/password + Google OAuth. Sign‑up requires email verification.
- **Server logic:** TanStack `createServerFn` only (no Supabase Edge Functions). Every protected function uses the `requireSupabaseAuth` middleware; the browser auto‑attaches the bearer token via `attachSupabaseAuth` registered in `src/start.ts`.
- **CSRF:** `createCsrfMiddleware` is registered globally for all server functions in `src/start.ts`.
- **RLS:** Every user‑owned table (sessions, laps, fingerprints, preferences, themes, community submissions) enforces row‑level security keyed to `auth.uid()`. The `user_roles` table follows the recommended pattern with a SECURITY DEFINER `has_role()` helper — roles are **never** stored on profiles.
- **Public API routes:** Live under `app/routes/api/public/*` and verify signatures before any write.
- **Storage:** `.ibt` uploads live in private buckets, scoped by `user_id`.

See `supabase/migrations/` for the full schema history.

---

## Project structure

```bash
src/
├── routes/                     # TanStack Start file-based routes
│   ├── __root.tsx              # Shell + global providers + BackButton
│   ├── index.tsx               # Landing
│   ├── how-it-works.tsx
│   ├── auth.tsx
│   ├── live.tsx                # Live telemetry dashboard
│   ├── sessions.index.tsx      # All sessions
│   ├── sessions.$id.tsx        # Workbench for one lap
│   ├── fingerprint.tsx
│   ├── share.$token.tsx        # Public share view
│   ├── lab.lapfile.tsx         # Parser playground
│   ├── sitemap[.]xml.ts
│   └── api/                    # Server routes (webhooks, public API)
├── components/
│   ├── AppHeader.tsx
│   ├── BackButton.tsx          # Global "Back / Home" affordance
│   ├── ThemeCard.tsx, ThemeEditor.tsx
│   ├── live/                   # Live dashboard widgets
│   ├── workbench/              # Lap-analysis panes
│   ├── community/              # Browse & vote on shared artifacts
│   └── ui/                     # shadcn primitives
├── lib/
│   ├── ibt/                    # .ibt parser + Web Worker
│   ├── lapfile/                # Generic lap-file parser
│   ├── pwlap/                  # Pit Wall internal lap format
│   ├── live/                   # Live coach rules
│   ├── coach/, fingerprint/    # Domain logic
│   ├── *.functions.ts          # createServerFn server endpoints
│   ├── themeContext.tsx, theme.ts
│   ├── store.ts                # Zustand store
│   └── useTelemetry.ts, useTelemetryBuffer.ts
├── integrations/supabase/      # Auto-generated client + middleware (do not edit)
├── styles.css                  # Tailwind v4 + oklch design tokens
└── start.ts                    # Server runtime + middleware registration
supabase/
├── config.toml
└── migrations/                 # Schema, RLS, RPCs, triggers
```

---

## Running locally & Offline Mode

You can run Pit Wall entirely locally on your Windows machine without a Supabase cloud connection, using a local MongoDB database and browser-level IndexedDB file storage.

### 1. Boot the Application

Install dependencies and boot the development server:

```bash
npm install
npm run dev
```

### 2. Standalone Offline / Local Developer Mode

1. Open [http://localhost:3000](http://localhost:3000) in your browser.
2. Go to the login screen and click **"Continue as Local Developer (No Cloud)"**. This logs you in with a mock credential and directs your traffic to local storage endpoints.

### 3. Local Database & File Setup

1. **Database**: Download and start a local **MongoDB** server.
   
   #### Method A: Windows Installer (Recommended GUI)
   1. Visit the [MongoDB Community Download Center](https://www.mongodb.com/try/download/community).
   2. Select the latest stable version, Platform **Windows**, Package **MSI**, and click **Download**.
   3. Run the downloaded `.msi` installer.
   4. Choose the **Complete** setup type.
   5. Keep the default configuration: **"Install MongoDB as a Service"** and **"Run service as Network Service user"**. This ensures MongoDB runs automatically in the background as a system service.
   6. Ensure the checkbox for **"Install MongoDB Compass"** is checked (this installs the official MongoDB graphical interface to inspect and query telemetry records easily).
   7. Finish the installation. MongoDB will start automatically on standard port `27017`.

   #### Method B: Windows Package Manager (winget)
   1. Open PowerShell or Command Prompt as Administrator and run:
      ```powershell
      winget install MongoDB.Community.Server
      ```
   2. Once installed, start the MongoDB service by running:
      ```powershell
      Start-Service -Name MongoDB
      ```

   #### Method C: Docker Container (Alternative)
   If you already run Docker on your machine, launch a containerized instance:
   ```powershell
   docker run -d -p 27017:27017 --name iracing-mongo mongo:latest
   ```

   #### Verifying the Connection
   - To confirm MongoDB is active and reachable, test the TCP port in PowerShell:
     ```powershell
     Test-NetConnection -ComputerName 127.0.0.1 -Port 27017
     ```
   - Alternatively, open **MongoDB Compass** and click **Connect** using the default connection URI: `mongodb://localhost:27017`.

2. **File Storage**: Telemetry binary files are automatically cached inside your browser's private **IndexedDB** memory.
3. Open the **Database** setup panel in the header to run connection tests and manage your local browser cache size.

### 4. Spawning the iRacing Bridge

**iRacing Bridge** is a Node.js process that runs in the background. It connects to your local database and file storage, and streams telemetry data from iRacing to your browser. Start the companion app.

- Navigate to the **Live** dashboard (`/live`).
- If the bridge is stopped, click **"Run Local Bridge"** in the UI. The app spawns `local-bridge` on port `3001` automatically.
- Optional performance env vars for the bridge process:
  - `TICK_HZ` (default `120`)
  - `UI_HZ` (default `60`)
  - `RECORD_HZ` (default `120`)
  - `ADAPTIVE_UI` (`1` default, set `0` to disable adaptive fallback)
- Launch iRacing and start driving — data will stream live immediately.

### 5. Local AI Setup (LM Studio / Ollama)

Pit Wall supports fully offline **AI Coaching and Setup Advice** by connecting directly to local large language model (LLM) engines running on your machine.

1. **Choose/Install your Local AI Engine**:
   - **LM Studio**: Download and start [LM Studio](https://lmstudio.ai/).
   - **Ollama**: Download and run [Ollama](https://ollama.com/).
2. **Load a Model**:
   - Open your local AI engine and download/load an instruction-following model (e.g., `Llama 3 8B Instruct`, `Mistral 7B Instruct`, or `Liquid LFM 2.5`).
   - *Note: For the Setup Advisor to function correctly, it is recommended to use models that support tool-calling schemas.*
3. **Configure the AI Engine in Pit Wall**:
   - Open [http://localhost:3000/settings](http://localhost:3000/settings) in your browser.
   - Under **AI Provider**, choose either **LM Studio** or **Ollama**.
   - The app will pre-fill the default endpoints:
     - **LM Studio**: `http://localhost:1234/v1`
     - **Ollama**: `http://localhost:11434/v1`
   - Enter your loaded **Model ID** (e.g. `llama-3-8b-instruct`).
4. **Test the Connection**:
   - Click **"Test Local Host Software Connection"** (or **"Test Connection"**) under the settings card to verify the app can successfully communicate with your local AI engine.
   - Once verified, all telemetry analysis, lap critiques, and car setup recommendations will be processed locally on your machine, with 100% data privacy.

---

## Credits

Built with [Lovable](https://lovable.dev) on Lovable Cloud + Lovable AI Gateway.
iRacing® and IRSDK are trademarks of iRacing.com Motorsport Simulations, LLC. This project is an independent companion tool and is not affiliated with or endorsed by iRacing.

---

## Pi-parity roadmap

For a full gap matrix and 30/60/90 execution plan toward Pi Toolbox-class workflows, see:

- [PI_PARITY_ROADMAP.md](PI_PARITY_ROADMAP.md)
