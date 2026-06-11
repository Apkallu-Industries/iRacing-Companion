import { useTelemetryStore } from "./useTelemetryStore";
import { DEFAULT_TELEMETRY, type Telemetry } from "./telemetry-types";

/**
 * Hook: Subscribe to live bridge telemetry.
 *
 * Backward-compatible bridge to useTelemetryStore.
 * Throttled to ~20Hz (50ms) to prevent high-frequency React state churn and UI lag.
 * Centralized in useTelemetryStore to avoid spawning a setInterval timer per observer.
 * Supports an optional 'active' boolean flag to disable telemetry state subscription when not in live mode.
 */
export function useTelemetry(active = true): Telemetry {
  const throttled = useTelemetryStore((s) => (active ? s.throttledTelemetry : null));
  return throttled ?? DEFAULT_TELEMETRY;
}
