# Pi Parity Execution Plan

Last updated: 2026-05-22

This is the active delivery tracker for the roadmap in [PI_PARITY_ROADMAP.md](PI_PARITY_ROADMAP.md).

## 1. Workstreams

| Workstream                  | Scope                                   | Status      |
| --------------------------- | --------------------------------------- | ----------- |
| WS1 Math engine             | Derived channels + formulas + constants | In progress |
| WS2 Display expansion       | Histogram, XY scatter, lap table        | Planned     |
| WS3 Workspace system        | Saved workspaces + presets              | Planned     |
| WS4 Reliability diagnostics | FPS, stream Hz, reconnects, dropouts    | Planned     |
| WS5 Event engine            | Trigger rules + event markers           | Planned     |
| WS6 Collaboration/reporting | Annotations + report export             | Planned     |

## 2. Sprint 1 (Days 0-14)

Goal: ship Math v1 backbone + first diagnostics surface.

- [ ] WS1-T1 Create math expression schema + validator
- [ ] WS1-T2 Build safe evaluator (no `eval`, no dynamic code execution)
- [ ] WS1-T3 Add derived channel persistence model (`user/workspace scoped`)
- [ ] WS1-T4 Wire derived channels into live channel registry + workbench channel list
- [ ] WS4-T1 Add debug diagnostics panel (`?debug=1`) with FPS and stream Hz
- [ ] WS4-T2 Add reconnect + dropped message counters

Exit criteria:

- user can define at least 5 derived channels
- derived channels render in live + workbench
- diagnostics panel visible and stable

## 3. Sprint 2 (Days 15-30)

Goal: ship Display Expansion v1 + workspace save/load.

- [ ] WS2-T1 Histogram widget
- [ ] WS2-T2 Configurable XY scatter widget
- [ ] WS2-T3 Lap metrics table (sortable + filterable)
- [ ] WS3-T1 Save named workspaces
- [ ] WS3-T2 Load and switch workspaces
- [ ] WS3-T3 Ship presets (Live Driving, Engineer, Post-Lap)

Exit criteria:

- 3 new widgets in production routes
- users can save/load at least 3 workspace profiles

## 4. Sprint 3 (Days 31-45)

Goal: event engine foundation.

- [ ] WS5-T1 Trigger schema (`threshold`, `duration`, `window`)
- [ ] WS5-T2 Event processing loop
- [ ] WS5-T3 Event markers in traces + map
- [ ] WS5-T4 Event templates library

Exit criteria:

- users can define and visualize triggers without code changes

## 5. Sprint 4 (Days 46-60)

Goal: stint analytics suite v1.

- [ ] Tire trend panel
- [ ] Pace decay vs fuel panel
- [ ] Consistency/variance panel
- [ ] Session-level KPI summary

Exit criteria:

- complete stint review possible without external tools

## 6. Tracking Cadence

- Weekly parity review against widget matrix
- Weekly perf review (UI FPS at 30/60Hz stream settings)
- Regression checklist run before each beta drop

## 7. Risks Being Actively Managed

- Scope creep: only roadmap-priority tasks accepted during parity sprints
- Performance regressions: enforce debug metrics on every PR
- UX complexity: ship templates/defaults before advanced customization
