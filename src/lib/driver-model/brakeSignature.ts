/**
 * brakeSignature.ts — Deceleration and Trail-Braking Analysis Engine
 *
 * Evaluates the driver's deceleration signatures, peak pressures,
 * trail-braking blending efficiency, and transient wheel lockup indexes.
 */

export interface BrakeSignatureMetrics {
  peakBrakePressure: number;
  averageBrakeGradient: number;     // Rate of brake application (pedal travel / sec)
  trailBrakeDurationSec: number;    // Time spent blending brake (5% - 30%) with steering > 0.15 rad
  releaseRate: number;              // Rate of brake release (pedal travel / sec)
  lockupTendencyIndex: number;      // Metric of slip mismatch under heavy braking
}

/**
 * Performs professional motorsport trace analysis on a completed lap segment or stint.
 * @param brake pedal inputs normalized from 0.0 to 1.0
 * @param speed velocity traces in m/s
 * @param steer steering input in radians
 * @param wheelSlip difference ratio in front-to-ground velocity mismatch
 * @param hz telemetry sample frequency (typically 60Hz)
 */
export function analyzeBrakeSignature(
  brake: number[],
  speed: number[],
  steer: number[],
  wheelSlip: number[],
  hz = 60
): BrakeSignatureMetrics {
  if (brake.length === 0) {
    return { peakBrakePressure: 0, averageBrakeGradient: 0, trailBrakeDurationSec: 0, releaseRate: 0, lockupTendencyIndex: 0 };
  }

  const dt = 1 / hz;
  let peakBrake = 0;
  let totalBrakeGradients = 0;
  let gradientSamples = 0;
  let trailBrakeTicks = 0;
  let totalReleases = 0;
  let releaseSamples = 0;
  let lockupTicks = 0;
  let heavyBrakingTicks = 0;

  for (let i = 1; i < brake.length; i++) {
    const prev = brake[i - 1];
    const curr = brake[i];

    if (curr > peakBrake) {
      peakBrake = curr;
    }

    const delta = curr - prev;
    const rate = delta / dt;

    // Deceleration application phase (pressure rising rapidly)
    if (curr > 0.1 && delta > 0.02) {
      totalBrakeGradients += rate;
      gradientSamples++;
    }

    // Release phase (pressure falling)
    if (prev > 0.1 && delta < -0.02) {
      totalReleases += Math.abs(rate);
      releaseSamples++;
    }

    // Trail braking detection
    // Partial brake pressure held simultaneously while turning the steering wheel
    const isTurning = Math.abs(steer[i]) > 0.15; // > ~8.5 degrees
    const isTrailPressure = curr >= 0.05 && curr <= 0.30;
    if (isTurning && isTrailPressure) {
      trailBrakeTicks++;
    }

    // Lockup detection under heavy braking
    if (curr > 0.5) {
      heavyBrakingTicks++;
      if (wheelSlip[i] > 0.15) {
        lockupTicks++;
      }
    }
  }

  return {
    peakBrakePressure: parseFloat(peakBrake.toFixed(2)),
    averageBrakeGradient: gradientSamples > 0 ? parseFloat((totalBrakeGradients / gradientSamples).toFixed(2)) : 0,
    trailBrakeDurationSec: parseFloat((trailBrakeTicks * dt).toFixed(2)),
    releaseRate: releaseSamples > 0 ? parseFloat((totalReleases / releaseSamples).toFixed(2)) : 0,
    lockupTendencyIndex: heavyBrakingTicks > 0 ? parseFloat((lockupTicks / heavyBrakingTicks).toFixed(2)) : 0,
  };
}
