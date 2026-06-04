# TypeScript Type-Safety Fixes & Packaging Verification

## Problem

`npx tsc --noEmit` found **15 TypeScript errors** across 4 files that the normal Vite build didn't catch (Vite transpiles only, no full type-check). These fell into 3 root causes:

1. **Bridge runtime event type gap** — `BridgeEvent.type` didn't include `"event"`
2. **Recharts v3 type drift** — shadcn `chart.tsx` used stale props after recharts 2→3 upgrade
3. **react-day-picker v10 ClassNames drift** — `calendar.tsx` used string key `"table"` instead of enum `"month_grid"`
4. **Zustand v5 `.subscribe()` API change** — selector-based overload requires `subscribeWithSelector` middleware

---

## Changes Made

### 1. Bridge Event Type — [bridgeDataClient.ts](file:///c:/Dev/iRacing-Companion/src/lib/bridgeDataClient.ts#L27)

Added `"event"` to the `BridgeEvent.type` union. The bridge emits `type: "event"` for runtime events (`PREDICTION_WARNING`, `STINT_UPDATED`) but the type union only listed lifecycle types. This fixed:

- `TS2322` in the emitter (line 89)
- `TS2367` in the consumer [useBridgeEvents.ts](file:///c:/Dev/iRacing-Companion/src/lib/useBridgeEvents.ts#L15)

### 2. Recharts v3 Chart Component — [chart.tsx](file:///c:/Dev/iRacing-Companion/src/components/ui/chart.tsx)

Recharts v3 moved `payload`, `label`, `active` to context-only on `TooltipProps` and `payload`/`verticalAlign` on `LegendProps`. The shadcn component wraps these as content renderers where recharts _does_ still pass them, so we:

- Declared explicit `ChartTooltipContentProps` and `ChartLegendContentProps` types
- Imported `Payload` and `LegendPayload` types directly from recharts internals
- Added explicit type annotations on `.filter()`/`.map()` callbacks
- Fixed `item.dataKey` used as React key (can be a function in v3)

This resolved **10 errors** in chart.tsx.

### 3. Calendar ClassNames — [calendar.tsx](file:///c:/Dev/iRacing-Companion/src/components/ui/calendar.tsx#L76)

react-day-picker v10 switched `ClassNames` from string-keyed to enum-keyed (`UI | SelectionState | DayFlag | Animation`). Changed `table` → `month_grid` to match the `UI.MonthGrid` enum value.

### 4. Zustand Subscribe — [telemetryRuntimeStore.ts](file:///c:/Dev/iRacing-Companion/src/lib/telemetryRuntimeStore.ts#L136-L143)

Zustand v5 removed the `subscribe(selector, listener)` overload from the base store (it's now in `subscribeWithSelector` middleware). Replaced with `subscribe(listener)` + manual reference-equality diffing on `state.events`.

---

## Packaging Verification

| Check                   | Result                                       |
| ----------------------- | -------------------------------------------- |
| `npx tsc --noEmit`      | ✅ 0 errors                                  |
| `npm run build`         | ✅ clean (1.89s client + 1.34s server)       |
| `npm run lint`          | ✅ clean (exit 0)                            |
| `npm audit` (root)      | ✅ 0 vulnerabilities                         |
| `npm audit` (desktop)   | ✅ 0 vulnerabilities (927 deps)              |
| `npm ls` (local-bridge) | ✅ all 11 deps resolve via workspace symlink |

> [!NOTE]
> The desktop audit came back clean (0 vulnerabilities). If you saw high-severity advisories earlier, the most recent `npm install` may have updated transitive dependency resolutions in `package-lock.json`.
