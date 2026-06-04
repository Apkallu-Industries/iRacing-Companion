/**
 * steeringAggression.ts — Steering Input and Directional Aggression Analytics
 *
 * Measures steering wheel rate velocities, counts micro-correction noise,
 * and compiles overall steering smoothness indexes.
 */

export interface SteeringSignatureMetrics {
  steeringVelocity: number; // Average rate of steering angle change (rad/sec)
  microCorrectionFrequencyHz: number; // High-frequency steering corrections per second
  maxSteeringAngleRad: number; // Peak steering wheel angle reached
  steeringSmoothnessIndex: number; // Index of smooth arcs vs. rapid adjustments (0 - 100)
}

/**
 * Parses steering wheel angular position to evaluate driver aggression and correction rates.
 * @param steer steering wheel angle in radians
 */
export function analyzeSteeringSignature(steer: number[], hz = 60): SteeringSignatureMetrics {
  if (steer.length === 0) {
    return {
      steeringVelocity: 0,
      microCorrectionFrequencyHz: 0,
      maxSteeringAngleRad: 0,
      steeringSmoothnessIndex: 100,
    };
  }

  const dt = 1 / hz;
  let totalSteerVelocities = 0;
  let steerSamples = 0;
  let peakSteer = 0;
  let directionChanges = 0;
  let lastDelta = 0;
  let smoothTicks = 0;
  let aggressiveTicks = 0;

  for (let i = 1; i < steer.length; i++) {
    const prev = steer[i - 1];
    const curr = steer[i];
    const absCurr = Math.abs(curr);

    if (absCurr > peakSteer) {
      peakSteer = absCurr;
    }

    const delta = curr - prev;
    const velocity = Math.abs(delta / dt);

    if (velocity > 0.05) {
      totalSteerVelocities += velocity;
      steerSamples++;
    }

    // High steering rate velocity thresholds (indicates aggressive corrections or catches)
    if (velocity > 1.8) {
      // > ~100 deg/sec steering rate
      aggressiveTicks++;
    } else if (velocity > 0.1 && velocity < 0.8) {
      smoothTicks++;
    }

    // Micro-corrections tracking: count directional input flips under lateral loads
    if (absCurr > 0.1) {
      if (lastDelta > 0 && delta < -0.01) {
        directionChanges++;
      } else if (lastDelta < 0 && delta > 0.01) {
        directionChanges++;
      }
    }

    if (Math.abs(delta) > 0.002) {
      lastDelta = delta;
    }
  }

  const totalTime = steer.length * dt;
  const correctionFrequency = totalTime > 0 ? directionChanges / totalTime : 0;
  const totalTicks = smoothTicks + aggressiveTicks;
  const smoothness = totalTicks > 0 ? (smoothTicks / totalTicks) * 100 : 100;

  return {
    steeringVelocity:
      steerSamples > 0 ? parseFloat((totalSteerVelocities / steerSamples).toFixed(2)) : 0,
    microCorrectionFrequencyHz: parseFloat(correctionFrequency.toFixed(2)),
    maxSteeringAngleRad: parseFloat(peakSteer.toFixed(2)),
    steeringSmoothnessIndex: parseFloat(smoothness.toFixed(1)),
  };
}
