import { useState, useEffect } from "react";
import { useTelemetryStore } from "./useTelemetryStore";
import type { Telemetry } from "./telemetry-types";

/**
 * Hook: Subscribe to live bridge telemetry.
 *
 * Backward-compatible bridge to useTelemetryStore.
 * Throttled to ~20Hz (50ms) to prevent high-frequency React state churn and UI lag
 * while maintaining a perfectly fluid real-time feel for motorsport metrics.
 * Raw 60Hz samples are still accumulated in the background for pixel-perfect uPlot rendering.
 */
export function useTelemetry(): Telemetry {
  const [t, setT] = useState<Telemetry>(useTelemetryStore.getState().telemetry);

  useEffect(() => {
    const interval = setInterval(() => {
      setT(useTelemetryStore.getState().telemetry);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return t;
}
