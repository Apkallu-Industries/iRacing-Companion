/**
 * throttleRelease.ts — Exit Traction and Lift-and-Coast Analysis
 *
 * Studies the driver's exit throttle re-application profiles, lift-and-coast
 * efficiency on corner entry, exit modulation noise, and wheelspin correction responses.
 */

export interface ThrottleSignatureMetrics {
  throttleExitGradient: number; // Throttle application speed (travel / sec)
  liftAndCoastDurationSec: number; // Time spent at 0% throttle & 0% brake prior to entry
  throttleOscillationFrequency: number; // Exit throttle modulations (adjustments / corner)
  correctionReactionTimeSec: number; // Time elapsed to lift throttle when rear slip > 10%
}

/**
 * Parses throttle logs to extract clean behavioral metrics.
 */
export function analyzeThrottleSignature(
  throttle: number[],
  brake: number[],
  rearSlip: number[],
  hz = 60,
): ThrottleSignatureMetrics {
  if (throttle.length === 0) {
    return {
      throttleExitGradient: 0,
      liftAndCoastDurationSec: 0,
      throttleOscillationFrequency: 0,
      correctionReactionTimeSec: 0,
    };
  }

  const dt = 1 / hz;
  let totalThrottles = 0;
  let throttleSamples = 0;
  let coastTicks = 0;
  let modulationOscillations = 0;
  let isModulating = false;
  let slipDetectionTicks = 0;
  let slipCorrectionTicks = 0;
  let inSlipEvent = false;

  for (let i = 1; i < throttle.length; i++) {
    const prevT = throttle[i - 1];
    const currT = throttle[i];
    const currB = brake[i];

    const delta = currT - prevT;
    const rate = delta / dt;

    // Acceleration exit phase (throttle rising rapidly)
    if (currT > 0.15 && delta > 0.03) {
      totalThrottles += rate;
      throttleSamples++;
    }

    // Lift and coast detection (both pedal inputs at zero)
    if (currT < 0.02 && currB < 0.02) {
      coastTicks++;
    }

    // Exit throttle modulation/oscillation (hunting for grip)
    // Detected by small negative changes during active exit acceleration (> 40% throttle)
    if (currT > 0.4 && delta < -0.05) {
      if (!isModulating) {
        modulationOscillations++;
        isModulating = true;
      }
    } else if (delta >= 0) {
      isModulating = false;
    }

    // Wheelspin slip response delay
    const slipBreached = rearSlip[i] > 0.12; // 12% slip delta
    if (slipBreached) {
      if (!inSlipEvent) {
        inSlipEvent = true;
        slipDetectionTicks = 0;
      }
      slipDetectionTicks++;

      // Check if driver reacted by reducing throttle input
      if (delta < -0.04) {
        slipCorrectionTicks += slipDetectionTicks;
        inSlipEvent = false; // Reset for next event
      }
    } else {
      inSlipEvent = false;
    }
  }

  const avgReactionSec = slipCorrectionTicks > 0 ? slipCorrectionTicks * dt : 0.35; // Default fallback to typical driver reaction

  return {
    throttleExitGradient:
      throttleSamples > 0 ? parseFloat((totalThrottles / throttleSamples).toFixed(2)) : 0,
    liftAndCoastDurationSec: parseFloat((coastTicks * dt).toFixed(2)),
    throttleOscillationFrequency: modulationOscillations,
    correctionReactionTimeSec: parseFloat(avgReactionSec.toFixed(2)),
  };
}
