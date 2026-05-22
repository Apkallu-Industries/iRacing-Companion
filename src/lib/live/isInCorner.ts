import type { Telemetry } from "@/lib/telemetry-types";

type TelemetryGetter = () => Telemetry;

interface WaitOptions {
  timeoutMs?: number;
  pollMs?: number;
  settleMs?: number;
}

function isLikelyInCorner(t: Telemetry): boolean {
  // Treat high lateral load or meaningful steering angle as cornering.
  const latG = Math.abs(t.gLat ?? 0);
  const steerDeg = Math.abs(t.steeringDeg ?? 0);
  return latG > 0.55 || steerDeg > 8;
}

/**
 * Wait until telemetry indicates the car is on a straight for a short stable
 * window before allowing a radio callout.
 */
export async function waitForStraight(
  getTelemetry: TelemetryGetter,
  options: WaitOptions = {},
): Promise<void> {
  const timeoutMs = options.timeoutMs ?? 7000;
  const pollMs = options.pollMs ?? 120;
  const settleMs = options.settleMs ?? 900;

  const startedAt = Date.now();
  let straightSince: number | null = null;

  while (Date.now() - startedAt < timeoutMs) {
    const now = Date.now();
    const t = getTelemetry();
    const inCorner = isLikelyInCorner(t);

    if (!inCorner) {
      if (straightSince == null) straightSince = now;
      if (now - straightSince >= settleMs) return;
    } else {
      straightSince = null;
    }

    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }
}
