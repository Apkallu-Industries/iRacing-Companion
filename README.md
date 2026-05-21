# Pit Wall — iRacing Telemetry & Lap Analysis

> Live iRacing telemetry dashboard **+** MoTeC‑style `.ibt` lap analysis workbench, in the browser.
> Telemetry on track. Analysis off track. One app.

**Live:** https://iracing-companion.lovable.app

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

| Area | Route | Highlights |
|---|---|---|
| Marketing / landing | `/` | Hero, feature overview, schema.org metadata |
| How it works | `/how-it-works` | Parsing pipeline diagram, `.ibt` format breakdown |
| Auth | `/auth` | Email + password, Google OAuth |
| Live dashboard | `/live` | Real‑time telemetry, gauges, AI coach, bridge install |
| Workbench | `/sessions/$id` | Lap analysis for an uploaded `.ibt` |
| Sessions list | `/sessions` | All uploaded laps, fingerprint deltas |
| Car fingerprint | `/fingerprint` | Tire / brake / aero fingerprint vs reference |
| Shared lap | `/share/$token` | Public read‑only view of a lap |
| Lab | `/lab/lapfile` | Diagnostic parser playground |
| Sitemap | `/sitemap.xml` | SEO sitemap |

A global floating **Back** button (`src/components/BackButton.tsx`) renders on every non‑landing page so you’re never trapped.

---

## Live telemetry (on track)

Route: **`/live`** · Components: `src/components/live/*`

### Bridge

- **`BridgeInstall.tsx`** — One‑click download + setup instructions for the local desktop bridge that exposes iRacing’s IRSDK over a local websocket.
- **`DesktopLapSync.tsx`** — Auto‑uploads completed laps from the bridge into your session history so you can analyze them in the workbench right after the run.

### Dashboard widgets

- **`ConfigurableChannelList.tsx`** + **`ChannelRegistry.ts`** — Pick any of the 250+ live IRSDK channels and lay them out as compact readouts. Layout is persisted per user via `preferences.functions.ts` and shareable as a *community channel layout* (votes, security‑definer RPC for vote counts).
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

| Component | What it does |
|---|---|
| `ChannelBrowser.tsx` | All 250+ channels grouped (Driver Inputs · Vehicle · Engine · Tires · Suspension · Session · Environment), searchable, click‑to‑plot |
| `StackedTraces.tsx` | Synchronized uPlot panels with min/max/avg readout per channel |
| `TrackMap.tsx` | Reconstructed XY outline, live cursor dot, optional sector overlay |
| `Timeline.tsx` + `LapList.tsx` | Pick reference lap + compare lap (dashed overlay on every trace) |
| `SectorSpider.tsx` | Per‑sector deltas vs reference as a radar chart |
| `TimeLossWaterfall.tsx` | Where you lost / gained time across a lap, per micro‑sector |
| `GGDiagram.tsx` | Longitudinal × lateral G scatter with envelope |
| `MinCornerSpeed.tsx` | Apex speed per corner, deltas vs reference |
| `BrakeBias.tsx` | Brake‑bias analysis over a stint |
| `SlipAngle.tsx` | Slip angle estimate (front/rear) from IMU + steering |
| `OptimalLap.tsx` | Theoretical best lap stitched from your fastest sectors |
| `PianoRoll.tsx` | Throttle/brake/gear roll for pattern spotting |
| `SetupSheet.tsx` + `SetupDiff.tsx` | Parsed setup YAML; diff two setups side by side |
| `ReplayThree.tsx` + `CinemaPlayback.tsx` | 3D car‑on‑track playback driven by telemetry |
| `LiveReadout.tsx` | HUD‑style readout you can pop out (`HudSettings.tsx`) |
| `FingerprintDelta.tsx` | Compare lap’s fingerprint vs your baseline |
| `Counterfactuals.tsx` | “What if you’d braked 5m later into T3?” — AI counterfactual analysis |
| `AICoach.tsx` | Per‑lap natural‑language critique |
| `ExportButton.tsx` / `ShareButton.tsx` | CSV export + create a public share link |

---

## AI Coach & Advisor

Powered by **Lovable AI Gateway** (no API key needed):

- `src/lib/coach.functions.ts` + `src/lib/coach/summarize.ts` — Server functions that build a compact lap summary (driver inputs, corner phases, sector times, deltas) and call an LLM to produce a critique + actionable suggestions.
- `src/lib/coach/physics.ts` — Lightweight vehicle physics features fed to the LLM (load transfer estimates, slip ratios).
- `src/lib/advisor.functions.ts` + `src/lib/advisor.knowledge.ts` — Setup advisor that combines a curated knowledge base (springs, dampers, bars, aero, brake bias) with lap telemetry to recommend setup nudges.
- `src/lib/tts.functions.ts` — Server‑side TTS so the live coach can *speak* call‑outs while you drive.

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

```
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

## Running locally

This project is built and previewed in [Lovable](https://lovable.dev). For local development against your own Lovable Cloud project:

```bash
npm install
npm run dev      # vite dev (TanStack Start)
npm run build    # production build (Cloudflare Worker target)
```

Environment is auto‑provisioned by Lovable Cloud — `.env` contains `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` and is **not** hand‑edited.

---

## Credits

Built with [Lovable](https://lovable.dev) on Lovable Cloud + Lovable AI Gateway.
iRacing® and IRSDK are trademarks of iRacing.com Motorsport Simulations, LLC. This project is an independent companion tool and is not affiliated with or endorsed by iRacing.
