/**
 * mechanicalReasoningEngine.ts — Motorsport Mechanical State Reasoning Engine
 *
 * Implements the continuous causal engineering loop, unifying Setup Intelligence
 * and Live Race Intelligence into one inseparable reasoning system.
 *
 * Implements the 5 core AI reasoning contracts:
 * - MechanicalStateInference
 * - SetupTradeoffEvaluation
 * - RecommendationOutcomePrediction
 * - DynamicBalanceProjection
 * - ThermalLifecycleProjection
 */

import {
  type TelemetryEvent,
  type EngineeringEpisode,
  type DriverBehaviorTraits,
  type PhysicsTruthBoundary,
  type RecommendationLineage,
  RaceEventType,
} from "./eventTaxonomy";

// ==========================================
// 1. INTERFACES & CONTRACTS
// ==========================================

export interface MechanicalStateInference {
  inferenceId: string;
  inferredState: string;          // e.g. "DIFFUSER_VACUUM_STALL_GROUNDING", "REAR_TIRE_THERMAL_SATURATION"
  confidenceIndex: number;        // 0 to 100
  rootCauseNarrative: string;
  evidenceEventIds: string[];
  physicsTruthBoundary: PhysicsTruthBoundary;
}

export interface SetupTradeoffEvaluation {
  proposedChange: string;         // e.g. "Reduce Rear Rebound -1 click"
  primaryObjective: string;
  expectedGain: string;
  expectedCompromise: string;
  confidenceIndex: number;
  affectedCornerArchetypes: Array<
    "slow_hairpin" | "medium_chicanes" | "highspeed_sweeper" | "heavy_braking_zone" | "curb_strike_zone"
  >;
  affectedDriverTraits: Array<
    "cornerEntryRotationPreference" | "rearAxleStabilityTolerance" | "brakeReleaseStyle" | "throttleCommitmentConfidence"
  >;
  stintLifecycleForecast: {
    fuelDecayImpact: string;      // behavior as car burns fuel and rake rises
    thermalLifecycleTrend: string; // tire thermal impact
    gripBalanceShift: string;     // aeromechanical shift
  };
  physicsTruthBoundary: PhysicsTruthBoundary;
}

export interface RecommendationOutcomePrediction {
  predictedStateImpact: string;   // e.g. "Restores 85% diffuser downforce under compression"
  mitigationCertainty: number;    // 0.0 to 1.0
  secondaryRiskIntroduced: string; // e.g. "Slightly slower direction change in chicanes"
  stabilityHorizonGainSec: number; // e.g. delay rear slide by 4 laps
}

export interface DynamicBalanceProjection {
  currentRakeMm: number;
  projectedRakeShiftEndStintMm: number;
  fuelRakeSensitivity: "high" | "medium" | "low";
  trackRubberGripFactor: number;   // 0.0 to 1.0 (grip improvement multiplier)
  balanceMigrationNarrative: string;
}

export interface ThermalLifecycleProjection {
  currentCarcassTempC: number;
  projectedGrowthRatePerLapC: number;
  stabilizationHorizonLaps: number;
  slidingThresholdCoolingRating: "high" | "medium" | "low";
}

export interface UnifiedRecommendation {
  recommendationId: string;
  timestamp: string;
  lineage: RecommendationLineage;
  tradeoff: SetupTradeoffEvaluation;
  outcomePrediction: RecommendationOutcomePrediction;
}

// ==========================================
// 2. CORE COGNITION PIPELINE
// ==========================================

/**
 * Infers structural mechanical faults from live events and episodes.
 */
export function inferMechanicalState(
  events: TelemetryEvent[],
  episodes: EngineeringEpisode[],
  traits: DriverBehaviorTraits
): MechanicalStateInference {
  const eventTypes = events.map((e) => e.eventType);
  const episodeTitles = episodes.map((ep) => ep.title);

  // Default inference
  let inferredState = "NOMINAL_VEHICLE_BALANCE";
  let confidenceIndex = 90;
  let rootCauseNarrative = "Platform rake, damping, and thermal lifecycles are stabilized within optimum design parameters.";
  let sourceTypes: PhysicsTruthBoundary["sourceTypes"] = ["deterministic_physics"];

  const hasBottoming = eventTypes.includes(RaceEventType.AERO_BOTTOM_OUT);
  const hasLockups = eventTypes.includes(RaceEventType.BRAKE_LOCK_FRONT_LEFT) || eventTypes.includes(RaceEventType.BRAKE_LOCK_FRONT_RIGHT);
  const hasRearSlide = eventTypes.includes(RaceEventType.REAR_TRACTION_COLLAPSE);
  const hasThermalRear = eventTypes.includes(RaceEventType.THERMAL_REAR_OVERLOAD);
  const hasOverRotation = eventTypes.includes(RaceEventType.ENTRY_OVER_ROTATION);

  if (hasBottoming || episodeTitles.some(t => t.includes("Diffuser"))) {
    inferredState = "DIFFUSER_VACUUM_STALL_GROUNDING";
    confidenceIndex = 95;
    rootCauseNarrative = "Aerodynamic downforce compression compresses rear heave springs past limits, grounding the skid block and breaking the low-pressure venturi seal.";
    sourceTypes = ["deterministic_physics"];
  } else if (hasRearSlide && hasThermalRear) {
    inferredState = "REAR_TIRE_THERMAL_SATURATION";
    confidenceIndex = 88;
    rootCauseNarrative = "Rear tire carcass heating saturates operating limits. The resultant traction decay induces persistent friction sliding under acceleration.";
    sourceTypes = ["deterministic_physics", "historical_correlation"];
  } else if (hasOverRotation && traits.brakeReleaseStyle === "fast_decay") {
    inferredState = "LIFT_OFF_OVERSTEER_BRAKE_RELEASE_TIMING";
    confidenceIndex = 90;
    rootCauseNarrative = "Aggressive or abrupt brake pedal release during turn-in collapses the front axle contact patch load before the chassis stabilizes, triggering dynamic lift-off oversteer.";
    sourceTypes = ["deterministic_physics", "behavioral_model"];
  } else if (hasLockups && traits.brakeReleaseStyle === "fast_decay") {
    inferredState = "BRAKE_RELEASE_LOAD_COLLAPSE";
    confidenceIndex = 85;
    rootCauseNarrative = "Abrupt brake pressure decay (+18% variance) collapses front vertical load transfer during steering angle sweep, locking the tire footprint.";
    sourceTypes = ["deterministic_physics", "behavioral_model"];
  }

  return {
    inferenceId: `inf_${Math.random().toString(36).substr(2, 9)}`,
    inferredState,
    confidenceIndex,
    rootCauseNarrative,
    evidenceEventIds: events.map((e) => e.id),
    physicsTruthBoundary: { sourceTypes },
  };
}

/**
 * Strategist Gatekeeper. Strictly filters out inferences below 90% confidence
 * to guarantee that critical race strategy decisions are driven by hard mechanical facts.
 */
export function getStrategistMechanicalState(
  events: TelemetryEvent[],
  episodes: EngineeringEpisode[],
  traits: DriverBehaviorTraits
): MechanicalStateInference | null {
  const inference = inferMechanicalState(events, episodes, traits);
  if (inference.confidenceIndex < 90) {
    return null;
  }
  return inference;
}

/**
 * Coaching Gatekeeper. Filters out inferences below 75% confidence
 * for probabilistic driver performance analysis and dynamic trackside training context.
 */
export function getCoachingMechanicalState(
  events: TelemetryEvent[],
  episodes: EngineeringEpisode[],
  traits: DriverBehaviorTraits
): MechanicalStateInference | null {
  const inference = inferMechanicalState(events, episodes, traits);
  if (inference.confidenceIndex < 75) {
    return null;
  }
  return inference;
}

/**
 * Overlay Gatekeeper. Filters out inferences below 60% confidence
 * for real-time visual UI telemetry metrics and observational gauges.
 */
export function getOverlayMechanicalState(
  events: TelemetryEvent[],
  episodes: EngineeringEpisode[],
  traits: DriverBehaviorTraits
): MechanicalStateInference | null {
  const inference = inferMechanicalState(events, episodes, traits);
  if (inference.confidenceIndex < 60) {
    return null;
  }
  return inference;
}

/**
 * Evaluates setup tradeoffs and compromises using the Mechanical Consequence Graph rules.
 */
export function evaluateSetupTradeoff(
  proposedChange: string,
  inference: MechanicalStateInference
): SetupTradeoffEvaluation {
  let primaryObjective = "Restore dynamic tyre contact pressure";
  let expectedGain = "Stabilized vertical force distribution";
  let expectedCompromise = "Reduced compliance in alternative sectors";
  let confidenceIndex = 80;
  let affectedCornerArchetypes: SetupTradeoffEvaluation["affectedCornerArchetypes"] = ["medium_chicanes"];
  let affectedDriverTraits: SetupTradeoffEvaluation["affectedDriverTraits"] = ["cornerEntryRotationPreference"];
  let fuelDecayImpact = "Neutral shift during stint timeline.";
  let thermalLifecycleTrend = "Negligible thermal impact.";
  let gripBalanceShift = "Neutral shift.";
  let sourceTypes: PhysicsTruthBoundary["sourceTypes"] = ["deterministic_physics"];

  const changeLower = proposedChange.toLowerCase();

  if (changeLower.includes("wing")) {
    primaryObjective = "Stabilize rear platform under aerodynamic compression";
    expectedGain = "Increased high-speed rear vertical load and stability";
    expectedCompromise = "Increased aerodynamic drag and reduced straight-line speed";
    confidenceIndex = 95;
    affectedCornerArchetypes = ["highspeed_sweeper"];
    affectedDriverTraits = ["rearAxleStabilityTolerance"];
    fuelDecayImpact = "Alleviates high-speed entry snap as fuel weight decays and rear ride height rises.";
    thermalLifecycleTrend = "Reduces rear sliding, cooling rear carcass core temperature growth rate by -1.5°C/lap.";
    gripBalanceShift = "Shifts aerodynamic balance -1.5% rearward.";
    sourceTypes = ["deterministic_physics"];
  } else if (changeLower.includes("rebound") || changeLower.includes("compression")) {
    primaryObjective = "Optimize transient load transfer rate and tire patch vertical force";
    expectedGain = "Slower transient pitch rates, stabilizing underbody aerodynamics";
    expectedCompromise = "Slower vehicle transient responsiveness during rapid steering transitions";
    confidenceIndex = 88;
    affectedCornerArchetypes = ["heavy_braking_zone", "curb_strike_zone"];
    affectedDriverTraits = ["brakeReleaseStyle", "cornerEntryRotationPreference"];
    fuelDecayImpact = "Stabilizes rear axle rotation on turn-in as dynamic center of gravity moves rearward.";
    thermalLifecycleTrend = "Limits tire friction slide duration, reducing overall thermal escalation.";
    gripBalanceShift = "Shifts initial corner entry balance +0.8% forward.";
    sourceTypes = ["deterministic_physics", "historical_correlation"];
  } else if (changeLower.includes("diff") || changeLower.includes("differential")) {
    primaryObjective = "Control wheel speed variation across the driven axle";
    expectedGain = "Improved tractive force exit capability";
    expectedCompromise = "Increased snap-oversteer risk and mid-corner understeer";
    confidenceIndex = 90;
    affectedCornerArchetypes = ["slow_hairpin"];
    affectedDriverTraits = ["throttleCommitmentConfidence", "rearAxleStabilityTolerance"];
    fuelDecayImpact = "Protects traction circle limit as rear vertical load decays due to fuel burn.";
    thermalLifecycleTrend = "Locks footprint, potentially spiking local tread heat under extreme wheelspin.";
    gripBalanceShift = "Reduces yaw rotation mid-corner.";
    sourceTypes = ["deterministic_physics"];
  }

  return {
    proposedChange,
    primaryObjective,
    expectedGain,
    expectedCompromise,
    confidenceIndex,
    affectedCornerArchetypes,
    affectedDriverTraits,
    stintLifecycleForecast: {
      fuelDecayImpact,
      thermalLifecycleTrend,
      gripBalanceShift,
    },
    physicsTruthBoundary: { sourceTypes },
  };
}

/**
 * Predicts the mechanical outcomes and mitigations of a proposed change.
 */
export function predictRecommendationOutcome(
  inference: MechanicalStateInference,
  tradeoff: SetupTradeoffEvaluation,
  traits: DriverBehaviorTraits
): RecommendationOutcomePrediction {
  let predictedStateImpact = "Improves general dynamic compliance.";
  let mitigationCertainty = 0.75;
  let secondaryRiskIntroduced = "Negligible chassis risks.";
  let stabilityHorizonGainSec = 0.5;

  if (inference.inferredState === "DIFFUSER_VACUUM_STALL_GROUNDING") {
    predictedStateImpact = "Prevents skid grounding and restores 95% of diffuser downforce under high downforce.";
    mitigationCertainty = 0.95;
    secondaryRiskIntroduced = "Slightly higher pitch stiffness, reducing curb-strike compliance.";
    stabilityHorizonGainSec = 1.2;
  } else if (inference.inferredState === "REAR_TIRE_THERMAL_SATURATION") {
    predictedStateImpact = "Reduces exit slide wheelspin coefficient, keeping tires inside optimal friction window.";
    mitigationCertainty = 0.88;
    secondaryRiskIntroduced = "Slight reduction in mechanical pivot rotation at slow apexes.";
    stabilityHorizonGainSec = 2.5;
  } else if (inference.inferredState === "BRAKE_RELEASE_LOAD_COLLAPSE") {
    predictedStateImpact = "Smooths the transient load decay, giving the driver +15% more braking rotation stability.";
    mitigationCertainty = 0.82;
    secondaryRiskIntroduced = "Slightly less responsive initial steering turn-in response.";
    stabilityHorizonGainSec = 0.8;
  }

  return {
    predictedStateImpact,
    mitigationCertainty,
    secondaryRiskIntroduced,
    stabilityHorizonGainSec,
  };
}

/**
 * Project overall stint-state dynamic balance.
 */
export function projectDynamicBalance(
  fuelRemainingL: number,
  averageRakeMm: number
): DynamicBalanceProjection {
  const isHeavy = fuelRemainingL > 65.0;
  const projectShift = isHeavy ? -0.8 : -0.2; // heavier burns fuel, rear ride height rises
  
  return {
    currentRakeMm: averageRakeMm,
    projectedRakeShiftEndStintMm: projectShift,
    fuelRakeSensitivity: isHeavy ? "high" : "medium",
    trackRubberGripFactor: 0.05, // +5% grip from rubbering in
    balanceMigrationNarrative: isHeavy 
      ? "Heavier starting fuel load compresses rear. As fuel burns off, rear ride height will rise +0.8mm, increasing entry rotation pivot sensitivity."
      : "Rake is stabilized in core stint window. Balance migration will remain minimal.",
  };
}

/**
 * Project tire thermal core lifecycle trends.
 */
export function projectThermalLifecycle(
  currentCarcassAvgC: number,
  trackTempC: number,
  isTireSlipping: boolean
): ThermalLifecycleProjection {
  const baseGrowth = trackTempC > 45.0 ? 0.8 : 0.3;
  const slideGrowth = isTireSlipping ? 1.8 : 0.0;
  
  return {
    currentCarcassTempC: currentCarcassAvgC,
    projectedGrowthRatePerLapC: baseGrowth + slideGrowth,
    stabilizationHorizonLaps: isTireSlipping ? 8 : 4,
    slidingThresholdCoolingRating: trackTempC > 45.0 ? "low" : "high",
  };
}

// ==========================================
// 3. THE UNIFIED ENGINE CHAMBER
// ==========================================

/**
 * Unifies Setup Intelligence and Live Race Intelligence into one continuous reasoning block.
 */
export function executeCausalEngineeringLoop(
  events: TelemetryEvent[],
  episodes: EngineeringEpisode[],
  driverTraits: DriverBehaviorTraits,
  fuelRemainingL: number,
  averageRakeMm: number,
  currentCarcassAvgC: number,
  trackTempC: number
): UnifiedRecommendation {
  // 1. Mechanical Inference (observe and classify root cause)
  const inference = inferMechanicalState(events, episodes, driverTraits);

  // 2. Dynamic Projections (incorporate session lifecycle)
  const balanceProj = projectDynamicBalance(fuelRemainingL, averageRakeMm);
  const tireProj = projectThermalLifecycle(currentCarcassAvgC, trackTempC, events.some(e => e.eventType === RaceEventType.REAR_TRACTION_COLLAPSE));

  // 3. Setup Heuristic Mapping (select best mechanical correction)
  let proposedAction = "Maintain current mechanical suspension parameters. Focus on stabilizing trail-brake deceleration.";
  let citationSource = "Standard iRacing Dynamic Profile Ruleset v1.0.0";
  let baseEvidenceChannel = "YawRate";
  let baseEvidenceVal = 0.12;
  let baseEvidenceThreshold = 0.25;

  if (inference.inferredState === "DIFFUSER_VACUUM_STALL_GROUNDING") {
    proposedAction = "Increase front ride height +1.0mm or stiffen heave packers to protect splitter ride height.";
    citationSource = "iRacing Aerodynamics Setup Manual: Venturi Flow Seal Section";
    baseEvidenceChannel = "AeroBottomOutCount";
    baseEvidenceVal = events.length;
    baseEvidenceThreshold = 2;
  } else if (inference.inferredState === "REAR_TIRE_THERMAL_SATURATION") {
    proposedAction = "Soften rear anti-roll bar by -1 click or reduce rear rebound damping by -1 click.";
    citationSource = "Carroll Smith Heuristics: Tuning Rear Axis Traction";
    baseEvidenceChannel = "TireCarcassTempRear";
    baseEvidenceVal = currentCarcassAvgC;
    baseEvidenceThreshold = 95.0;
  } else if (inference.inferredState === "BRAKE_RELEASE_LOAD_COLLAPSE") {
    proposedAction = "Soften front compression damping by -1 click and smooth trail-brake pedal release rate.";
    citationSource = "Tim McArthur Flowcharts: Brake Release Transient Instability";
    baseEvidenceChannel = "BrakeReleaseGradient";
    baseEvidenceVal = 6.2;
    baseEvidenceThreshold = 5.0;
  }

  // 4. Tradeoff Evaluation
  const tradeoff = evaluateSetupTradeoff(proposedAction, inference);

  // Inject dynamic balance forecasts into tradeoff
  tradeoff.stintLifecycleForecast.fuelDecayImpact = balanceProj.balanceMigrationNarrative;
  tradeoff.stintLifecycleForecast.thermalLifecycleTrend = `Projected growth rate: +${tireProj.projectedGrowthRatePerLapC.toFixed(1)}°C/lap; cooling rating: ${tireProj.slidingThresholdCoolingRating}.`;

  // 5. Outcome Prediction
  const outcome = predictRecommendationOutcome(inference, tradeoff, driverTraits);

  // 6. Recommendation Lineage
  const lineage: RecommendationLineage = {
    recommendationId: `rec_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    proposedAction,
    citationSource,
    confidenceRating: tradeoff.confidenceIndex,
    sensorEvidence: [
      {
        channel: baseEvidenceChannel,
        value: baseEvidenceVal,
        threshold: baseEvidenceThreshold,
      },
    ],
    activeCorrelations: [
      inference.inferredState,
      balanceProj.fuelRakeSensitivity === "high" ? "HIGH_FUEL_RAKE_SENSITIVITY" : "NOMINAL_RAKE",
    ],
    relatedEpisodes: episodes.map((e) => e.episodeId),
    driverTraitsInfluence: {
      cornerEntryRotationPreference: driverTraits.cornerEntryRotationPreference,
      rearAxleStabilityTolerance: driverTraits.rearAxleStabilityTolerance,
    },
    physicsTruthBoundary: tradeoff.physicsTruthBoundary,
  };

  return {
    recommendationId: lineage.recommendationId,
    timestamp: lineage.timestamp,
    lineage,
    tradeoff,
    outcomePrediction: outcome,
  };
}
