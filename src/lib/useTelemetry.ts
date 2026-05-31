import { useTelemetryStore } from "./useTelemetryStore";
import type { Telemetry } from "./telemetry-types";

/**
 * Hook: Subscribe to live bridge telemetry.
 *
 * Backward-compatible bridge to useTelemetryStore.
 * Returns the full live Telemetry state object.
 * Note: To prevent unnecessary re-renders in optimized components,
 * use selector-based subscriptions (e.g. useTelemetryStore(state => state.telemetry.rpm)).
 */
export function useTelemetry(): Telemetry {
  return useTelemetryStore((s) => s.telemetry);
}
