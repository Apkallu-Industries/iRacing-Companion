/**
 * eventTaxonomy.ts — Structured Motorsport Ontology & Temporal Event Taxonomy
 *
 * Implements a formal taxonomy for vehicle states, behavior-centric Driver DNA,
 * temporal telemetry events, and recommendation lineages (observability/tracing).
 */

export enum RaceEventType {
  ENTRY_OVER_ROTATION = "ENTRY_OVER_ROTATION",
  EXIT_UNDERSTEER = "EXIT_UNDERSTEER",
  AERO_BOTTOM_OUT = "AERO_BOTTOM_OUT",
  BRAKE_LOCK_FRONT_LEFT = "BRAKE_LOCK_FRONT_LEFT",
  BRAKE_LOCK_FRONT_RIGHT = "BRAKE_LOCK_FRONT_RIGHT",
  REAR_TRACTION_COLLAPSE = "REAR_TRACTION_COLLAPSE",
  DIRTY_AIR_PUSH = "DIRTY_AIR_PUSH",
  THERMAL_REAR_OVERLOAD = "THERMAL_REAR_OVERLOAD",
  HIGH_SPEED_HEAVE_SPIKE = "HIGH_SPEED_HEAVE_SPIKE",
}

/**
 * Behavior-centric Driver DNA Traits.
 * Moves from simple metric floats to high-level driver preference classifications
 * suitable for semantic reasoning.
 */
export interface DriverBehaviorTraits {
  cornerEntryRotationPreference: "high" | "medium" | "low";
  rearAxleStabilityTolerance: "aggressive" | "neutral" | "cautious";
  brakeReleaseStyle: "fast_decay" | "linear" | "smooth_trail";
  throttleCommitmentConfidence: "early" | "progressive" | "hesitant";
}

/**
 * Represent a structured, classified telemetry event.
 */
export interface TelemetryEvent {
  id: string;
  timestamp: string;
  lapNumber: number;
  sectorNumber: number;
  eventType: RaceEventType;
  severity: "low" | "medium" | "high" | "critical";
  /** The specific telemetry channel that triggered this event. */
  triggerChannel: string;
  triggerValue: number;
  narrativeDescription: string;
}

/**
 * Recommendation Lineage (Observability Audit Log).
 * Provides a clean answer to: "WHY did the system make this setup/coaching suggestion?"
 */
export interface RecommendationLineage {
  recommendationId: string;
  timestamp: string;
  proposedAction: string;       // e.g. "Soften rear rebound dampers by -1 click"
  citationSource: string;       // e.g. "Tim McArthur Flowchart: Road Oversteer #1 (ARB)"
  confidenceRating: number;     // 0 to 100
  
  /** Supporting sensor inputs (The "Facts") */
  sensorEvidence: {
    channel: string;
    value: string | number;
    threshold: string | number;
  }[];
  
  /** Active heuristic correlations (The "Interpretation") */
  activeCorrelations: string[];
  
  /** Driver trait influence (The "Personalization") */
  driverTraitsInfluence: Partial<DriverBehaviorTraits>;
}

/**
 * Maps metric-centric raw metrics into behavior-centric Driver DNA traits.
 */
export function synthesizeDriverTraits(
  averageBrakeGradient: number,
  trailBrakeDurationSec: number,
  steeringSmoothnessIndex: number,
  throttleExitGradient: number,
  averageYawRateRads: number
): DriverBehaviorTraits {
  // 1. Entry Rotation Preference
  let rotation: DriverBehaviorTraits["cornerEntryRotationPreference"] = "medium";
  if (averageYawRateRads > 0.35) rotation = "high";
  else if (averageYawRateRads < 0.18) rotation = "low";

  // 2. Rear Axle Tolerance
  let stability: DriverBehaviorTraits["rearAxleStabilityTolerance"] = "neutral";
  if (steeringSmoothnessIndex < 70 && averageYawRateRads > 0.30) stability = "aggressive";
  else if (steeringSmoothnessIndex > 85) stability = "cautious";

  // 3. Brake Release Style
  let brakeStyle: DriverBehaviorTraits["brakeReleaseStyle"] = "linear";
  if (averageBrakeGradient > 5.0 && trailBrakeDurationSec < 0.8) brakeStyle = "fast_decay";
  else if (trailBrakeDurationSec > 1.3) brakeStyle = "smooth_trail";

  // 4. Throttle Commitment
  let throttleStyle: DriverBehaviorTraits["throttleCommitmentConfidence"] = "progressive";
  if (throttleExitGradient > 5.5) throttleStyle = "early";
  else if (throttleExitGradient < 2.5) throttleStyle = "hesitant";

  return {
    cornerEntryRotationPreference: rotation,
    rearAxleStabilityTolerance: stability,
    brakeReleaseStyle: brakeStyle,
    throttleCommitmentConfidence: throttleStyle,
  };
}

/**
 * Traces a decision flow, creating an auditable recommendation lineage record.
 */
export function traceDecisionLineage(
  action: string,
  citation: string,
  confidence: number,
  evidence: RecommendationLineage["sensorEvidence"],
  correlations: string[],
  traits: DriverBehaviorTraits
): RecommendationLineage {
  return {
    recommendationId: `rec_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    proposedAction: action,
    citationSource: citation,
    confidenceRating: confidence,
    sensorEvidence: evidence,
    activeCorrelations: correlations,
    driverTraitsInfluence: {
      cornerEntryRotationPreference: traits.cornerEntryRotationPreference,
      rearAxleStabilityTolerance: traits.rearAxleStabilityTolerance,
    },
  };
}
