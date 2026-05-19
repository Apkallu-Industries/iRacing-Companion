import type { Telemetry } from "@/lib/telemetry-types";

/** Heuristic: driver is likely mid-corner (defer spoken call-outs). */
export function isInCorner(t: Telemetry): boolean {
  return (
    Math.abs(t.gLat) > 1.15 &&
    t.speedKph > 35 &&
    (t.brake > 0.12 || Math.abs(t.steeringDeg) > 12)
  );
}

/** Wait until a straight-ish segment before TTS, or timeout. */
export function waitForStraight(
  getTelemetry: () => Telemetry,
  maxWaitMs = 20_000,
  pollMs = 400,
): Promise<void> {
  return new Promise((resolve) => {
    const start = Date.now();
    const tick = () => {
      if (!isInCorner(getTelemetry()) || Date.now() - start >= maxWaitMs) {
        resolve();
        return;
      }
      setTimeout(tick, pollMs);
    };
    tick();
  });
}
