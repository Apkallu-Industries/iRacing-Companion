/**
 * eventTaxonomy.ts — Structured Motorsport Ontology & Temporal Event Taxonomy
 *
 * Implements a formal taxonomy for vehicle states, behavior-centric Driver DNA,
 * temporal telemetry events, stateful engineering episodes (progressive instability sequences),
 * causality-aware motorsport reasoning nodes, session narratives, and auditable decision lineage tracing.
 *
 * Aligned with the Motorsport Ontology Kernel v1.0.0.
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

export enum EventSeverity {
  INFO = "INFO",
  ADVISORY = "ADVISORY",
  WARNING = "WARNING",
  CRITICAL = "CRITICAL",
}

export enum EngineeringPersonality {
  CONSERVATIVE_ENDURANCE = "CONSERVATIVE_ENDURANCE", // Prioritizes tire longevity, platform stability, and predictability
  AGGRESSIVE_QUALIFYING = "AGGRESSIVE_QUALIFYING",   // Prioritizes peak rotation, front-axle bite, and risk-tolerant track attack
  BALANCED_STRATEGIST = "BALANCED_STRATEGIST",       // Coordinated balance between pit windows, fuel margin, and dynamic track evolution
}

/**
 * Physics Truth Boundary Classification Tiers.
 * Categorizes the mathematical and mechanical reliability of any event, trait, or recommendation.
 */
export type PhysicsTruthSourceType =
  | "deterministic_physics"
  | "historical_correlation"
  | "behavioral_model"
  | "probabilistic_projection";

export interface PhysicsTruthBoundary {
  sourceTypes: PhysicsTruthSourceType[];
}

/**
 * Race Event Priority Matrix.
 * Dictates cognitive load and prioritization filters for the pit-wall advisor.
 */
export interface RaceEventPriority {
  severity: EventSeverity;
  confidence: number;       // Heuristic certainty rating (0.0 to 1.0)
  persistence: number;      // Number of consecutive laps this event has occurred
  lapTimeImpactS: number;   // Projected delta cost in seconds
  driverRiskRating: number; // 0 (low) to 10 (spin/crash risk)
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
  physicsTruthBoundary: PhysicsTruthBoundary;
}

/**
 * Represent a structured, classified telemetry event.
 */
export interface TelemetryEvent {
  id: string; // Must follow regex "^evt_[a-f0-9]+$"
  timestamp: string; // ISO 8601 string
  lapNumber: number;
  sectorNumber: number;
  eventType: RaceEventType;
  priority: RaceEventPriority;
  /** The specific telemetry channel that triggered this event. */
  triggerChannel: string;
  triggerValue: number;
  narrativeDescription: string;
  physicsTruthBoundary: PhysicsTruthBoundary;
}

/**
 * Temporal Engineering Episode.
 * Groups related sequences of isolated events into causal, progressive handling episodes
 * (e.g. progressive rear tire saturation cascades over consecutive laps).
 */
export interface EngineeringEpisode {
  episodeId: string; // Must follow regex "^eps_[a-f0-9]+$"
  title: string;                 // e.g. "Rear Tire Thermal Saturation Cascade"
  startTime: string;
  endTime?: string;
  isActive: boolean;
  precursorEvents: RaceEventType[];
  triggerConditions: string[];
  progressionStages: {
    stageIndex: number;
    description: string;
    detectedEventIds: string[]; // Referencing the IDs of TelemetryEvent
  }[];
  mitigationAdvised: string;
  physicsTruthBoundary: PhysicsTruthBoundary;
}

/**
 * Causality-Aware Knowledge Graph Nodes.
 * Maps deterministic physical links between conditions, handling anomalies, and driver inputs.
 */
export interface CausalityNode {
  nodeId: string; // Must follow snake_case regex
  label: string;                  // e.g. "High Rear Rebound"
  type: "condition" | "chassis_behavior" | "driver_input" | "aero_state" | "thermal_state";
  affectsNodes: {
    targetNodeId: string;
    relationship: string;         // e.g. "STALLS_DIFFUSER_FLOW" or "OVERLOADS_FRONT_AXLE"
    strength: "low" | "medium" | "high";
  }[];
  physicsTruthBoundary: PhysicsTruthBoundary;
}

/**
 * Session Evolution Narrative.
 * Models macro-level stint evolution, tracking how changing fuel loads and track evolution
 * interact with driver inputs over the course of a session.
 */
export interface SessionNarrative {
  sessionId: string; // Must follow regex "^ses_[a-f0-9]+$"
  trackEvolutionState: "green" | "rubbered_in" | "greasy_hot" | "abrasive";
  fuelLoadDecayState: "heavy_start" | "stint_mid" | "fuel_reserve";
  driverConfidenceTrend: "improving" | "stable" | "decaying";
  keyMechanicalNarrative: string; // e.g. "Track rubbering masked entry over-rotation until rear tire thermal saturation on lap 18."
  physicsTruthBoundary: PhysicsTruthBoundary;
}

/**
 * Recommendation Lineage (Observability Audit Log).
 * Provides a clean answer to: "WHY did the system make this setup/coaching suggestion?"
 */
export interface RecommendationLineage {
  recommendationId: string; // Must follow regex "^rec_[a-f0-9]+$"
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
  
  /** Active stateful engineering episodes influencing this recommendation */
  relatedEpisodes: string[]; // Referencing the IDs of EngineeringEpisode
  
  /** Driver trait influence (The "Personalization") */
  driverTraitsInfluence: Partial<DriverBehaviorTraits>;
  physicsTruthBoundary: PhysicsTruthBoundary;
}

/**
 * Strict Ontological Guardrail.
 * Every payload pushed to the LLM/AI Communication Layer MUST conform to this schema,
 * guaranteeing the LLM can NEVER parse raw telemetry or bypass ontology logic.
 */
export interface AICommunicationPayload {
  recipientDriverId: string;
  activeContext: {
    track: string;
    car: string;
    ambientTempC: number;
    fuelLapsMargin: number;
  };
  personality: EngineeringPersonality;
  /** ONLY classified events are exposed to the AI, never raw sensor traces. */
  ontologyEvents: TelemetryEvent[];
  activeEpisodes: EngineeringEpisode[];
  provenRecommendations: RecommendationLineage[];
  sessionNarrative: SessionNarrative;
  driverTraits: DriverBehaviorTraits;
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
  // 1. Corner Entry Rotation Preference
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
    physicsTruthBoundary: {
      sourceTypes: ["behavioral_model"]
    }
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
  relatedEpisodes: string[],
  traits: DriverBehaviorTraits,
  physicsTruthBoundary: PhysicsTruthBoundary
): RecommendationLineage {
  return {
    recommendationId: `rec_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    proposedAction: action,
    citationSource: citation,
    confidenceRating: confidence,
    sensorEvidence: evidence,
    activeCorrelations: correlations,
    relatedEpisodes,
    driverTraitsInfluence: {
      cornerEntryRotationPreference: traits.cornerEntryRotationPreference,
      rearAxleStabilityTolerance: traits.rearAxleStabilityTolerance,
    },
    physicsTruthBoundary,
  };
}
