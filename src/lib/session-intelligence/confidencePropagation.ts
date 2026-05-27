/**
 * confidencePropagation.ts — Engineering Confidence & Uncertainty Propagation Subsystem
 *
 * Tracks, scales, and propagates sensor noise and telemetry variances through
 * subsequent physical stability models, strategy branches, and AI recommendations.
 */

export interface ConfidenceChain {
  sensorReliabilityIndex: number;      // raw sensor accuracy (0 to 100)
  tireThermalConfidence: number;        // propagated tyre temp confidence
  aeroStabilityConfidence: number;      // propagated downforce confidence
  stintStrategyConfidence: number;      // strategy pathway confidence
  overallAdvisoryAuthority: number;     // final AI recommendation weight (0 to 100)
  reasons: string[];
}

/**
 * Propagates telemetry and sensor uncertainties down the computational chain.
 * @param sensorReliability baseline sensor reliability index (0 to 100)
 * @param telemetrySpikeCount count of high-frequency signal spikes detected
 * @param isAeroBottoming whether splitter grounding was active
 * @param weatherUnpredictability environmental volatility (0 to 100)
 * @param activeObjectiveMode active session objective mode
 * @returns ConfidenceChain full uncertainty propagation matrix
 */
export function propagateConfidenceChain(
  sensorReliability: number,
  telemetrySpikeCount: number,
  isAeroBottoming: boolean,
  weatherUnpredictability = 10,
  activeObjectiveMode = "RACE_STINT"
): ConfidenceChain {
  const reasons: string[] = [];

  // 1. Calculate Tire Thermal Confidence
  // Sensor noise and rapid high-frequency spikes degrade temperature estimation accuracy
  let tireThermal = sensorReliability - (telemetrySpikeCount * 2.5);
  if (telemetrySpikeCount > 5) {
    reasons.push("High-frequency telemetry jitter detected on carcass sensors.");
  }
  tireThermal = Math.max(10, Math.min(100, tireThermal));

  // 2. Propagate down to Aero Stability Confidence
  // Splitter bottomings and low tyre thermal confidence degrade downforce model accuracy
  let aeroStability = tireThermal * 0.90;
  if (isAeroBottoming) {
    aeroStability -= 15;
    reasons.push("Splitter grounding pitch moments degrade diffuser vacuum flow seal models.");
  }
  aeroStability = Math.max(10, Math.min(100, aeroStability));

  // 3. Propagate down to Stint Strategy Confidence
  // Weather volatility and low aero confidence degrade strategic window estimations
  let strategyConfidence = aeroStability * 0.95 - (weatherUnpredictability * 0.4);
  if (weatherUnpredictability > 35) {
    reasons.push("High environmental volatility (rain onset) dampens overcut/undercut forecasts.");
  }
  strategyConfidence = Math.max(10, Math.min(100, strategyConfidence));

  // 4. Propagate down to Overall Advisory Authority
  // Strategy confidence + objective mode weight decides final recommendation authority
  let overallAuthority = strategyConfidence;
  if (activeObjectiveMode === "QUALIFYING_ATTACK") {
    // Attack mode prioritizes instant physical performance, lowering strategic path weight
    overallAuthority = Math.max(10, overallAuthority * 0.85);
    reasons.push("Qualifying performance mode gates strategic stint projections.");
  } else if (activeObjectiveMode === "SAFETY_CAR") {
    // Safety car simplifies pitstop timelines, boosting strategic authority
    overallAuthority = Math.min(99, overallAuthority * 1.10);
    reasons.push("Safety Car caution pacing elevates cheap pitstop strategic authority.");
  }

  return {
    sensorReliabilityIndex: Math.round(sensorReliability),
    tireThermalConfidence: Math.round(tireThermal),
    aeroStabilityConfidence: Math.round(aeroStability),
    stintStrategyConfidence: Math.round(strategyConfidence),
    overallAdvisoryAuthority: Math.round(overallAuthority),
    reasons
  };
}
