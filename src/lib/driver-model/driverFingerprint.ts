/**
 * driverFingerprint.ts — Comprehensive Driver Fingerprint Synthesizer
 *
 * Compiles all mechanical and statistical dimensions (brake, throttle, steering, consistency)
 * into a single cohesive profile. Persistence-ready for MongoDB.
 */

import { type BrakeSignatureMetrics } from "./brakeSignature";
import { type ThrottleSignatureMetrics } from "./throttleRelease";
import { type SteeringSignatureMetrics } from "./steeringAggression";
import { type DriverConsistencyMetrics } from "./consistencyModel";
import {
  type DriverBehaviorTraits,
  synthesizeDriverTraits,
} from "../session-intelligence/eventTaxonomy";

export type DriverClass =
  | "AGGRESSIVE_TRAILBRAKER"
  | "SMOOTH_COAST_OPTIMIZER"
  | "CONSERVATIVE_FLUID"
  | "UNSTABLE_AGGRESSIVE"
  | "BALANCED_COMPOSITE";

export interface DriverFingerprint {
  driverId: string;
  driverName: string;
  timestamp: string;
  car: string;
  track: string;

  brakeSignature: BrakeSignatureMetrics;
  throttleSignature: ThrottleSignatureMetrics;
  steeringSignature: SteeringSignatureMetrics;
  consistency: DriverConsistencyMetrics;

  driverClass: DriverClass;
  overallRating: number; // calculated mechanical rating out of 100
  focusAreas: string[];

  /** Behavior-centric Driver DNA Traits (Ontology Layer) */
  behaviorTraits?: DriverBehaviorTraits;
}

/**
 * Synthesizes a unified DriverFingerprint based on collected input metrics.
 */
export function generateDriverFingerprint(
  driverId: string,
  driverName: string,
  car: string,
  track: string,
  brake: BrakeSignatureMetrics,
  throttle: ThrottleSignatureMetrics,
  steering: SteeringSignatureMetrics,
  consistency: DriverConsistencyMetrics,
): DriverFingerprint {
  // 1. Determine driver class
  let driverClass: DriverClass = "BALANCED_COMPOSITE";
  const focusAreas: string[] = [];

  const isBrakeAggressive = brake.averageBrakeGradient > 4.5 || brake.peakBrakePressure > 0.85;
  const isTrailDeep = brake.trailBrakeDurationSec > 1.4;
  const isThrottleAggressive = throttle.throttleExitGradient > 5.0;
  const isSteeringAggressive =
    steering.steeringVelocity > 1.5 || steering.microCorrectionFrequencyHz > 4.0;
  const isUnstable = consistency.overallConsistencyScore < 75;

  if (isUnstable) {
    driverClass = "UNSTABLE_AGGRESSIVE";
    focusAreas.push(
      "Establish consistency in initial braking points to prevent micro-correction steering catches.",
    );
    focusAreas.push("Stabilize apex speeds to build structural muscle memory.");
  } else if (isBrakeAggressive && isTrailDeep && !isSteeringAggressive) {
    driverClass = "AGGRESSIVE_TRAILBRAKER";
    focusAreas.push(
      "Trace exit throttle re-application slightly earlier while completing brake-release rotation.",
    );
  } else if (throttle.liftAndCoastDurationSec > 1.2 && !isThrottleAggressive) {
    driverClass = "SMOOTH_COAST_OPTIMIZER";
    focusAreas.push(
      "Explore deeper entry lines to maximize mid-corner aerodynamic downforce flow.",
    );
  } else if (brake.peakBrakePressure < 0.65 && steering.steeringSmoothnessIndex > 90) {
    driverClass = "CONSERVATIVE_FLUID";
    focusAreas.push(
      "Increase peak braking threshold targets to compress deceleration zone distances.",
    );
    focusAreas.push("Commit to earlier exit power sweeps.");
  } else {
    driverClass = "BALANCED_COMPOSITE";
    focusAreas.push(
      "Optimize ERS state-of-charge decay through selective straightaway lift-and-coast.",
    );
  }

  if (brake.lockupTendencyIndex > 0.15) {
    focusAreas.push(
      "Reduce trail-braking foot pressure under high steering rotation angles to prevent front-wheel lockups.",
    );
  }
  if (steering.microCorrectionFrequencyHz > 3.5) {
    focusAreas.push(
      "Calibrate shock rebound dampers or soften roll-bars to settle chassis understeer catches.",
    );
  }

  // 2. Compute mechanical rating
  // Combines pace consistency (60% weight) and mechanical input smoothness (40% weight)
  const inputSmoothness =
    steering.steeringSmoothnessIndex * 0.5 +
    Math.max(0, 100 - brake.lockupTendencyIndex * 150) * 0.5;
  const overallRating = consistency.overallConsistencyScore * 0.6 + inputSmoothness * 0.4;

  // 3. Synthesize behavior-centric Driver DNA traits (Ontology Layer)
  const behaviorTraits = synthesizeDriverTraits(
    brake.averageBrakeGradient,
    brake.trailBrakeDurationSec,
    steering.steeringSmoothnessIndex,
    throttle.throttleExitGradient,
    0.28, // Baseline average yaw rate
  );

  return {
    driverId,
    driverName,
    timestamp: new Date().toISOString(),
    car,
    track,
    brakeSignature: brake,
    throttleSignature: throttle,
    steeringSignature: steering,
    consistency,
    driverClass,
    overallRating: parseFloat(Math.min(100, Math.max(0, overallRating)).toFixed(1)),
    focusAreas,
    behaviorTraits,
  };
}
