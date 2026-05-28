# Pit Wall — Desktop Command Platform

This document describes the planned Desktop Command Platform: goals, architecture, API surface, integration points, and an initial incremental implementation plan.

## Goals

- Turn the packaged Desktop app (Windows .exe) into a local Command Platform for sim racing:
  - Persistent background supervisor that runs even when UI is closed
  - Local HTTP + WS/SSE control plane for scripts, plugins, overlays, and mobile apps
  - System tray + global hotkeys for quick control
  - Robust telemetry ingestion, validation, and local indexing
  - Plugin engine + CLI for automation

## High-level architecture

- Electron UI (existing) — front-end and workbench.
- Runtime Supervisor (already present in `desktop/runtimeSupervisor.cjs`) — process health, service probes, lifecycle.
- Supervisor API (new) — HTTP + SSE endpoints for control and telemetry subscriptions. Runs inside the supervisor process (tray agent model).
- Bridge process (`desktop/bridge/*`) — existing iRacing bridge that produces telemetry and HTTP UI.
- Local DB (future) — SQLite / MongoDB for indexed telemetry and retention.
- Plugin engine (future) — user scripts communicate via the Supervisor API.

## Why a tray‑resident supervisor first

- Fast to ship and debug; no elevated installer required initially.
- Provides a stable control plane that all other components (tray, hotkeys, DB, plugins, overlays) call into.
- Easy upgrade path to a Windows Service once the API and lifecycle are stable.

## Initial API surface (minimal v0)

- HTTP JSON (port default: `17777`, localhost only)
  - `POST /session/start` — start observing/recording a session. Body: `{ "sessionId": "<id>", "meta": {...} }` → 200
  - `POST /session/stop` — stop session. Body: `{ "sessionId": "<id>" }` → returns session summary
  - `GET /supervisor/status` — returns current runtime status (mongo, bridge, aiMode, state)
  - `POST /import/file` — upload a small lapfile / artifact to the supervisor for ingestion (JSON or base64 payload)

- Telemetry stream
  - `GET /telemetry/live` — Server‑Sent Events (SSE) subscription for live telemetry messages (fallback to WebSocket in future)

## Integration points (files to edit)

- `desktop/runtimeSupervisor.cjs` — start/stop the Supervisor API, expose auxiliary helpers (already present)
- `desktop/supervisorApi.cjs` — new module: HTTP + SSE server, routing, basic auth stub (local only)
- `desktop/main.cjs` — tray menu items and `globalShortcut` already used — wire menu items to call Supervisor API endpoints via IPC or direct function calls if supervisor runs in-process
- `desktop/preload.cjs` — expose `window.pitWallRuntime.supervisor` API to the renderer for advanced UI hooks
- `desktop/bridge/*` — telemetry ingestion hooks: supervisor will optionally receive telemetry pushed from bridge
- `installer/runtime-setup.nsh` — later: register service or auto-start entries for Windows installer

## Security model

- Localhost only (bind to 127.0.0.1).
- No external network exposure by default.
- Optional token-based auth / API key for local plugins (future).

## Milestones & Tasks

1. Documentation and scaffolding (this file + API scaffold) — deliverable: `desktop/supervisorApi.cjs` and runtime wiring. (current)
2. Tray + global hotkeys wiring — add tray menu items that call the API (`Start session`, `Stop session`, `Status`).
3. File watch & auto-import — supervisor watches `Documents/iRacing/lapfiles` for changes and auto-imports new lapfiles.
4. Local DB ingestion & schema — add SQLite/Mongo adapters and indexing pipeline.
5. Plugin engine + CLI — scripts run against API; add plugin lifecycle hooks.
6. OBS overlay & Stream integration — expose overlay ports and sample overlay client.
7. Windows Service packaging — optional migration to a service with elevated installer steps.

## v0 Implementation plan (short term)

1. Create `desktop/supervisorApi.cjs` with the endpoints listed above (SSE for telemetry).
2. Wire API start/stop into `desktop/runtimeSupervisor.cjs#init` and `#shutdown`.
3. Add minimal route handlers that mutate an in-memory `sessions` map so UI/tray can start/stop sessions.
4. Add a small README + dev run instructions.

## Run / test locally

Run Electron dev as before. The supervisor API will bind to `http://127.0.0.1:17777` and can be exercised with `curl`:

```powershell
curl -X POST http://127.0.0.1:17777/session/start -H "Content-Type: application/json" -d '{"sessionId":"local-1"}'
curl http://127.0.0.1:17777/supervisor/status
curl -N http://127.0.0.1:17777/telemetry/live    # SSE subscription
```

---

If this aligns with expectations I will scaffold the `supervisorApi` module and wire it into the existing `runtimeSupervisor.cjs` so we have a working v0 runtime API to iterate against.
