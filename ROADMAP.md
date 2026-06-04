# Pit Wall — Roadmap

Where the project goes next. Ordered by impact ÷ effort within each horizon.

> **Build status:** 60Hz live telemetry, three workspace tiers, ElevenLabs voice with output device routing, AI engines (Live Coach, Advisor, Offline Coach) with bridge extras, HWID licensing, Admin Dashboard, Electron desktop app with system tray.

---

## ✅ Recently Shipped

| Feature                       | Notes                                                                               |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| 60Hz telemetry (up from 30Hz) | Bridge polls and broadcasts at 60Hz                                                 |
| Bridge extras block           | Yaw, shock deflection, brake line pressure, wheel speed, pitch/roll forwarded to AI |
| AI workspace context          | Active workspace tier + math channel names injected into all AI prompts             |
| Output device selector        | ElevenLabs audio routed via `setSinkId` to user-chosen speaker                      |
| Microphone selector           | Device picker + live VU meter for push-to-talk                                      |
| Electron desktop v1.2         | Auto-bridge-sync, system tray, crash recovery, single-instance lock                 |
| Licensing system              | HWID-bound keys, Admin Dashboard for key generation                                 |
| Pit wall team hero image      | On landing page + OG image for social sharing                                       |

---

## Now (next 1–2 iterations)

### 1. Push-to-talk voice commands

The microphone device is now selectable. Wire it up:

- `Space` hold on `/live` → starts recording from selected mic
- Send audio to ElevenLabs Speech-to-Text (or Whisper local)
- Parsed intent routed to the Live Coach as a direct question
- Response spoken back via TTS on the selected output device

### 2. Live coach signal quality

- Add **confidence score** per call-out; suppress anything below threshold while mid-corner
- Debounce: never repeat the same call-out within N laps unless delta worsened
- Persist call-out history to `live_coach_events` for A/B prompt tuning

### 3. Workbench performance budget

- `.ibt` files for endurance stints can hit 200MB+
- Audit the Web Worker parser: most channels fine as `Float32` not `Float64`
- Lazy-mount heavy panes (`ReplayThree`, `GGDiagram`) behind tab visibility
- Perf HUD (FPS, parse ms, sample count) behind `?debug=1`

### 4. Bridge onboarding checklist

- `BridgeInstall` is currently text-heavy
- Replace with an animated 3-step checklist that auto-detects bridge connectivity
- Each step turns green when complete (port check → iRacing detected → first packet)
- If bridge not detected after 60s, surface friendly diagnostic (firewall suggestion)

---

## Next (1–2 months)

### 5. Multi-lap stint analysis

Today's workbench is lap-centric. Add a **stint view**:

- Tyre deg curves across a fuel run with regression fit
- Pace decay vs fuel burn — separate tyre fade from fuel-weight effects
- Driver consistency band (std dev of sector times)
- Pit-window calculator informed by observed deg + fuel use

### 6. Workspace tier enforcement

Workspaces (`lite`, `plus`, `realtime`) are defined but not yet gated by licence tier:

- Unlock `plus` at Tier 1, `realtime` at Tier 2
- Show upgrade prompt when a user attempts to switch to a locked workspace
- Admin Dashboard: assign workspace tier per licence key

### 7. Reference lap library

- Community-moderated **"gold" laps** per car/track combo
- Surface in workbench as a third overlay (alien-level reference)
- Voting + provenance (iRating, lap time, conditions)

### 8. Setup advisor v2

- Today's knowledge base is static; move to a structured symptom → cause → adjustment graph
- Show predicted lap-time delta with uncertainty range
- Link each recommendation to the telemetry evidence that triggered it

### 9. Race-engineer mode

- Two-pane layout: live telemetry left, strategy panel right
- Strategy panel: fuel, tyres, pit windows, gap to ahead/behind
- Voice input: "how many laps of fuel?" → AI responds via TTS

### 10. Lap diffing across sessions

- Pick lap A from session X and lap B from session Y
- Full workbench compare experience across different days/setups

---

## Later (3–6 months)

### 11. Mobile companion

- Read-only PWA for phones/tablets: live telemetry mirror + post-session AI summary
- Push notification when a stint completes

### 12. League / team workspaces

- Shared session pool with role-based access (driver, engineer, spotter)
- Comments on specific lap timestamps
- Engineer can push setup recommendations visible in driver's `/live` HUD

### 13. Predictive coaching

- Per-user model trained on historical laps to predict where they'll lose time
- Pre-emptive call-outs ("carrying less into T1 — watch T4 brake point")
- Requires ~50+ laps of same car/track to be useful — UI must say so

### 14. Native data export pipeline

- One-click export to MoTeC i2 Pro `.ld` format
- CSV/Parquet bulk export for Python/R analysis
- Webhook endpoints (`/api/public/webhooks/lap-completed`)

### 15. Track-condition awareness

- Cross-reference user laps with iRacing weather/rubber state
- Normalise comparisons ("0.4s slower but track was 8°C cooler — adjusted: +0.1s")

---

## Speculative / research

### Computer-vision overlay

Parse iRacing replay video to extract racing line vs ideal line, overlay on TrackMap. Hard: requires reliable car detection across camera angles.

### Real-time multi-driver telemetry

Spectator mode ingesting telemetry from multiple drivers (with consent) for league broadcasts.

### Full-duplex voice AI engineer

Sub-500ms round-trip voice conversation during stints. Likely needs on-device model for wake-word + intent layer.

---

## Cross-cutting investments

| Investment                                 | Why it matters                                                                       |
| ------------------------------------------ | ------------------------------------------------------------------------------------ |
| **Test harness for `.ibt` parser**         | Fixture files + golden snapshots — parser regressions currently only caught by users |
| **Server-function observability**          | Structured logs + traces for AI functions — failures are currently silent            |
| **Token-cost dashboard**                   | Per-user AI usage to spot abuse and tune model selection                             |
| **`live_coach_events` schema**             | Required for "did the coach actually help?" analysis                                 |
| **Rate limiting on community submissions** | Per-user daily caps via RPC to prevent spam                                          |

---

## Explicit non-goals

- **No iRacing replay file (`.rpy`) parsing** — format is undocumented; `.ibt` covers 95% of needs
- **No real-time multiplayer telemetry sharing without explicit consent** — privacy first
- **No "auto-tune my setup" button** — recommendations stay advisory; driver always in the loop
- **No support for other sims** — scope discipline; ACC/AC/rFactor each deserve dedicated tools

---

## How to contribute

Open an issue tagged `roadmap:` with the horizon (now/next/later) and a one-paragraph rationale.  
PRs that ship items from **Now** are welcome without prior discussion.  
**Next** and **Later** items: discuss first.
