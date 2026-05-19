# Pit Wall — Roadmap

Where this project goes next. Grouped by horizon and ordered by impact ÷ effort. Honest about what's hard and what's speculative.

---

## Now (next 1–2 iterations)

High‑leverage polish on what already exists. Low risk, immediate user value.

### 1. Make "Back" navigation truly unmissable

- Floating `BackButton` exists, but pair it with **breadcrumbs in `AppHeader`** for deep workbench routes (`/sessions/$id` → lap → pane).
- Keyboard shortcut: `Esc` = back, `g h` = home (vim‑style), surfaced in a `?` cheat‑sheet modal.

### 2. Live coach signal quality

- Today the coach mixes rules + LLM. Add a **confidence score** per call‑out and suppress anything below a threshold while the user is mid‑corner (don't talk over the apex).
- Debounce repeats: never repeat the same call‑out within N seconds unless the delta got worse.
- Persist call‑out history to `live_coach_events` so we can A/B prompts later.

### 3. Workbench performance budget

- `.ibt` files for endurance stints can hit 200MB+. Audit the Worker parser for unnecessary `Float64Array` use — most channels are fine as `Float32`.
- Lazy‑mount heavy panes (`ReplayThree`, `GGDiagram`) behind tab visibility; today they all mount on session load.
- Add a perf HUD (FPS, parse ms, sample count) gated behind `?debug=1`.

### 4. Onboarding for the bridge

- `BridgeInstall` is a wall of text. Replace with a 3‑step animated checklist that auto‑detects bridge connectivity and turns each step green as it completes.
- First‑run telemetry: if no bridge detected after 60s on `/live`, surface a friendly diagnostic ("port 8182 not reachable — firewall?").

---

## Next (1–2 months)

Features that meaningfully expand the product.

### 5. Multi‑lap stint analysis

Today's workbench is lap‑centric. Add a **stint view**:

- Tire deg curves across a fuel run (front/rear, L/R) with regression fit.
- Pace decay vs fuel burn — separate tire fade from fuel‑weight effects.
- Driver consistency band (std dev of sector times across the stint).
- Pit‑window calculator informed by observed deg + fuel use.

### 6. Reference lap library

- Curated, community‑moderated **"gold" laps** per car/track combo (alien‑level reference).
- Surface in workbench as a third overlay alongside user's best + compare lap.
- Voting + provenance (iRating, lap time, conditions) so users can judge quality.

### 7. Setup advisor v2

- Today's `advisor.knowledge.ts` is static. Move to a **structured knowledge graph** (symptom → cause → adjustment → magnitude) so recommendations can chain ("understeer on entry" + "front tire temps low" → "soften front ARB 2 clicks, not 1").
- Show predicted lap‑time delta with uncertainty range — never a single false‑precision number.
- Link each recommendation to the telemetry evidence that triggered it.

### 8. Race‑engineer mode

- Two‑pane layout: live telemetry on the left, **strategy panel** on the right (fuel, tires, pit windows, gap to ahead/behind from session info).
- Voice input ("how many laps of fuel?") routed through the existing TTS infra in reverse.

### 9. Lap diffing across sessions

- Pick lap A from session X and lap B from session Y, get the full workbench compare experience.
- Useful for "am I actually faster than last week, or just on better tires?".

---

## Later (3–6 months)

Bigger bets. Worth doing if the audience grows.

### 10. Mobile companion

- Read‑only PWA for phones/tablets: live telemetry mirror + post‑session AI coach summary.
- Push notification when a stint completes ("your AI coach has 3 notes on session #142").

### 11. League / team workspaces

- Shared session pool with role‑based access (driver, engineer, spotter).
- Comments on specific lap timestamps (like Loom for telemetry).
- Engineer can push a setup recommendation that shows up in the driver's `/live` HUD next session.

### 12. Predictive coaching

- Train a per‑user model on their own historical laps to predict where they'll lose time in the *next* lap based on the first sector.
- Pre‑emptive call‑outs ("you're carrying 4kph less into T1 — watch T4 brake point").
- Honest constraint: needs ~50+ laps of the same car/track to be useful. UI must say so.

### 13. Native data export pipeline

- One‑click export to MoTeC i2 Pro `.ld` format.
- CSV/Parquet bulk export for users who want to do their own analysis in Python/R.
- Webhook endpoints (`/api/public/webhooks/lap-completed`) so users can pipe to their own tools.

### 14. Track‑condition awareness

- Cross‑reference user laps with iRacing weather/rubber state to normalize comparisons.
- Surface in fingerprint deltas ("your lap was 0.4s slower but the track was 8°C cooler — adjusted delta: +0.1s").

---

## Speculative / research

Worth prototyping, not committing to.

### 15. Computer‑vision overlay

Parse iRacing replay video to extract racing line vs ideal line, overlay on `TrackMap`. Hard: requires reliable car detection across camera angles.

### 16. Real‑time multi‑driver telemetry

Spectator mode that ingests telemetry from multiple drivers in the same session (with consent) for league broadcasts. Bandwidth and consent UX are the hard parts, not the tech.

### 17. AI race engineer in voice loop

Full‑duplex voice conversation with the AI during stints. Latency budget is brutal (sub‑500ms round trip). Probably needs an on‑device model for the wake‑word + intent layer.

---

## Cross‑cutting investments

Not features — foundations that unblock the above.

| Investment | Why it matters |
| --- | --- |
| **Test harness for `.ibt` parser** | Fixture files + golden snapshots. Right now a parser regression would only be caught by a user. |
| **Server‑function observability** | Structured logs + traces for `coach.functions.ts`, `advisor.functions.ts`, `tts.functions.ts`. Today AI failures are silent. |
| **Token‑cost dashboard** | Per‑user AI usage so we can spot abuse and tune model selection (Gemini Flash vs GPT‑5). |
| **Migration to SSR‑first marketing pages** | Landing + `/how-it-works` should be statically rendered with proper OG images for sharing. |
| **Schema for `live_coach_events`** | Required for any future "did the coach actually help?" analysis. |
| **Rate limiting on community submissions** | Today nothing prevents a single user from publishing 10k gear ratio sets. Add per‑user daily caps via RPC. |

---

## Explicit non‑goals

Saying no is a feature.

- **No iRacing replay file (`.rpy`) parsing.** Format is undocumented and brittle; `.ibt` covers 95% of analysis needs.
- **No real‑time multiplayer telemetry sharing without explicit consent.** Privacy first.
- **No "auto‑tune my setup" button.** Setup recommendations stay advisory — driver always in the loop.
- **No support for sims other than iRacing.** Scope discipline. ACC/AC/rFactor each deserve their own dedicated tool.

---

## How to contribute to this roadmap

Open an issue tagged `roadmap:` with the horizon (now/next/later) and a one‑paragraph rationale. PRs that ship items from **Now** without discussion are welcome. **Next** and later: discuss first.
