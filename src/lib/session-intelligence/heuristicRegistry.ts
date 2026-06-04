/**
 * heuristicRegistry.ts — Heuristic Reputation & Contextual Similarity Weighting
 *
 * Implements Stage 8 (Heuristic Version Lineage & Reputation Registry)
 * and Stage 9 (Contextual Similarity Weighting) to prevent cross-context calibration contamination.
 */

import { type PhysicsTruthBoundary } from "./eventTaxonomy";

export interface ValidationRecord {
  sessionId: string;
  outcomeStatus: "SUCCESS_VERIFIED" | "COMPROMISED_FAIL" | "INCONCLUSIVE_NO_DATA";
  attributionSetupPct: number;
  timestamp: string;
}

export interface HeuristicVersionEntry {
  heuristicId: string; // e.g. "heur_gt3_rear_rebound_stabilization"
  version: string; // e.g. "1.0.0"
  baseConfidenceIndex: number; // e.g. 70
  activeConfidenceIndex: number; // e.g. 84 (Calibrated dynamically by Closed-Loop)
  deprecationStatus: "active" | "deprecated" | "archived";
  validationHistory: ValidationRecord[];
  physicsTruthBoundary: PhysicsTruthBoundary;
}

export interface SimilarityContext {
  trackLayoutType:
    | "slow_hairpin"
    | "medium_chicanes"
    | "highspeed_sweeper"
    | "heavy_braking_zone"
    | "curb_strike_zone";
  optimalThermalWindowC: { min: number; max: number };
  vehicleClass: "gt3" | "gtp" | "lemans";
  driverTraits: {
    cornerEntryRotationPreference: "high" | "medium" | "low";
    rearAxleStabilityTolerance: "aggressive" | "neutral" | "cautious";
    brakeReleaseStyle: "fast_decay" | "linear" | "smooth_trail";
    throttleCommitmentConfidence: "early" | "progressive" | "hesitant";
  };
}

/**
 * Computes a mathematical similarity coefficient (0.1 to 1.0) between two stints.
 * Weights track layout, optimal tire heat windows, vehicle classes, and personalized driver traits.
 */
export function calculateContextualSimilarity(
  pre: SimilarityContext,
  post: SimilarityContext,
): number {
  let layoutScore = 0.05;
  let vehicleScore = 0.05;
  let thermalScore = 0.05;
  let driverScore = 0.05;

  // 1. Track Layout Similarity (30% weight)
  if (pre.trackLayoutType === post.trackLayoutType) {
    layoutScore = 0.3;
  }

  // 2. Vehicle Class Similarity (30% weight)
  if (pre.vehicleClass === post.vehicleClass) {
    vehicleScore = 0.3;
  }

  // 3. Thermal Window Similarity (20% weight)
  const minDelta = Math.abs(pre.optimalThermalWindowC.min - post.optimalThermalWindowC.min);
  const maxDelta = Math.abs(pre.optimalThermalWindowC.max - post.optimalThermalWindowC.max);
  thermalScore = Math.max(0.05, 0.2 - (minDelta + maxDelta) * 0.01);

  // 4. Personalized Driver Style Similarity (20% weight)
  if (
    pre.driverTraits.cornerEntryRotationPreference ===
    post.driverTraits.cornerEntryRotationPreference
  ) {
    driverScore += 0.05;
  }
  if (
    pre.driverTraits.rearAxleStabilityTolerance === post.driverTraits.rearAxleStabilityTolerance
  ) {
    driverScore += 0.05;
  }
  if (pre.driverTraits.brakeReleaseStyle === post.driverTraits.brakeReleaseStyle) {
    driverScore += 0.05;
  }
  if (
    pre.driverTraits.throttleCommitmentConfidence === post.driverTraits.throttleCommitmentConfidence
  ) {
    driverScore += 0.05;
  }

  // Aggregate total coefficient and guarantee bounds [0.1, 1.0]
  const totalCoefficient = layoutScore + vehicleScore + thermalScore + driverScore;
  return Number(Math.max(0.1, Math.min(1.0, totalCoefficient)).toFixed(3));
}

/**
 * Dynamically calibrates a versioned heuristic confidence rating by multiplying the
 * closed-loop learning delta by the contextual similarity score.
 */
export function calibrateHeuristicConfidence(
  entry: HeuristicVersionEntry,
  validationOutcome: {
    sessionId: string;
    outcomeStatus: "SUCCESS_VERIFIED" | "COMPROMISED_FAIL" | "INCONCLUSIVE_NO_DATA";
    confidenceDelta: number;
    timestamp: string;
    attributionSetupPct: number;
  },
  similarityMultiplier: number,
): HeuristicVersionEntry {
  // Multiply the raw confidence delta by the similarity multiplier (0.1 to 1.0)
  const effectiveShift = Math.round(validationOutcome.confidenceDelta * similarityMultiplier);

  const updatedHistory = [...entry.validationHistory];
  updatedHistory.push({
    sessionId: validationOutcome.sessionId,
    outcomeStatus: validationOutcome.outcomeStatus,
    attributionSetupPct: validationOutcome.attributionSetupPct,
    timestamp: validationOutcome.timestamp,
  });

  const newActiveConfidence = Math.max(
    30,
    Math.min(98, entry.activeConfidenceIndex + effectiveShift),
  );

  return {
    ...entry,
    activeConfidenceIndex: newActiveConfidence,
    validationHistory: updatedHistory,
  };
}
