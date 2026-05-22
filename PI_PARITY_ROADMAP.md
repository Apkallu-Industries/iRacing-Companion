# Pit Wall -> Pi Toolbox Parity Roadmap

Last updated: 2026-05-22

Execution artifacts:

- [PI_PARITY_EXECUTION_PLAN.md](PI_PARITY_EXECUTION_PLAN.md)
- [docs/MATH_V1_TECH_SPEC.md](docs/MATH_V1_TECH_SPEC.md)

## 1. Goal

Bring Pit Wall to practical parity with Pi Toolbox class workflows for sim-racing users:

- fast live telemetry
- rich post-session analysis
- engineer-grade customization
- robust collaboration/reporting

Parity target does not mean UI cloning. It means users can accomplish equivalent analysis outcomes with similar speed and confidence.

---

## 2. Current Position

Pit Wall is strong in:

- live dashboard + bridge flow
- core lap workbench (traces/map/GG/sector tools)
- AI-assisted coaching
- community sharing foundations

Pit Wall is behind in:

- breadth of display/widgets
- user-defined math/constants/events engine
- advanced workspace orchestration
- collaboration/reporting maturity
- long-session reliability instrumentation

---

## 3. Widget/Display Parity Matrix

Legend:

- `Done` = available now
- `Partial` = basic version exists, not engineering-grade yet
- `Missing` = not available

| Capability group | Pit Wall status | Priority |
| --- | --- | --- |
| Time-series trace stacks with synced cursor | Done | Maintain |
| Track map with cursor replay | Done | Maintain |
| G-G and core vehicle dynamics views | Done | Maintain |
| Sector/corner comparative summaries | Done | Maintain |
| Multi-lap batch/stint analytics dashboards | Partial | High |
| Advanced scatter/XY tooling (configurable axes, density/heat) | Partial | High |
| Histograms/distribution panels per channel | Missing | High |
| Event-latched channels and event windows | Missing | High |
| User-built derived channels (formula editor) | Missing | Critical |
| Constants library + reusable formulas | Missing | Critical |
| Trigger/event engine (if/then, thresholds, state) | Missing | Critical |
| Workspace templates / role-based presets | Partial | High |
| Multi-window / linked panes / saved layouts | Partial | High |
| Report builder (session KPI PDFs/exports) | Missing | Medium |
| Annotation timeline + comments | Missing | Medium |
| Comparative overlays across sessions at scale | Partial | High |
| Data quality diagnostics (dropouts, timestamps, jitter) | Missing | High |
| Performance diagnostics (FPS, stream Hz, lag) | Partial | High |

---

## 4. 30/60/90 Day Plan

## Day 0-30 (Foundation + Highest ROI)

1. Ship Math v1

- Add user formula editor for derived channels:
  - arithmetic, min/max, abs, clamp
  - channel references + constants
- Persist formulas per user/workspace.

1. Ship Display Expansion v1

- Add:
  - histogram widget
  - XY scatter widget
  - lap table with sortable metrics

1. Workspace UX pass

- Save/Load named workspaces.
- Quick presets for:
  - live driving
  - race engineer
  - post-lap review

1. Reliability telemetry

- Add bridge/client diagnostics:
  - effective stream rate
  - dropped frames
  - reconnect count

Deliverable: v1 “Engineer Beta” profile with measurable gains in setup/review speed.

## Day 31-60 (Engineering Depth)

1. Event Engine v1

- Trigger rules:
  - threshold crossing
  - duration-in-state
  - lap sector-bound windows
- Event markers on traces/map.

1. Stint analysis suite

- Tire temp/pressure trend views
- Pace decay vs fuel
- consistency and variance widgets

1. Reporting v1

- Auto session summary:
  - top gains/losses
  - corner priorities
  - setup-impact notes
- Export to shareable artifact.

Deliverable: complete stint workflow without external tools.

## Day 61-90 (Parity Push)

1. Comparative power tools

- Multi-session overlay manager
- batch comparisons against reference sets

1. Collaboration layer

- Annotations/bookmarks at timestamp/corner
- shared team workspace links

1. Polishing + scale hardening

- Large session performance tuning
- regression tests for parser, math engine, widget rendering

Deliverable: “Pi-class” functional parity for sim-racing coaching/engineering core workflows.

---

## 5. Beta Exit Criteria (Objective)

Parity milestone is “ready” when:

1. Analysis speed

- Users can perform common review tasks in <= 3 clicks from a saved workspace.

1. Display breadth

- At least 20 high-value display/widget types available and composable.

1. Custom math/events

- Users can define and persist formulas + event triggers without code changes.

1. Stability

- 60Hz UI mode stable for 30-minute sessions on target hardware.
- automatic fallback to 30Hz with clear indicator under load.

1. Data confidence

- Diagnostics panel exposes stream health and warns on degraded conditions.

1. Collaboration

- Session annotations + workspace sharing available to team users.

---

## 6. Recommended Build Order (Pragmatic)

1. Math engine + derived channels
2. Histogram/scatter/event markers
3. Workspace templates + saved layouts
4. Stint analytics
5. Reporting/annotation/collaboration

Reason: this sequence unlocks the highest user value earliest and avoids building many static widgets that should instead be formula/event-driven.

---

## 7. Risks and Mitigations

Risk: Feature sprawl without workflow cohesion  
Mitigation: enforce “task-first” acceptance tests (e.g., “find top 3 time-loss corners in <= 60s”).

Risk: High-rate telemetry causing UI instability  
Mitigation: keep decoupled sample/stream/record clocks and adaptive stream fallback.

Risk: Complex formula/event UX becomes inaccessible  
Mitigation: ship curated starter templates and one-click examples.

Risk: Beta users lack trust in AI outputs  
Mitigation: show evidence traces and confidence score for every AI recommendation.

---

## 8. Immediate Next Actions

1. Create “Math v1” technical design doc (schema + evaluator + safety constraints).
2. Build widget backlog issues with acceptance criteria.
3. Add beta telemetry dashboard (FPS, stream Hz, reconnects) visible via debug toggle.
4. Schedule a weekly parity review against this matrix and mark status.
