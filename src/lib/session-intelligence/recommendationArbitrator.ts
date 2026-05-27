/**
 * recommendationArbitrator.ts — Real-Time Operational Decision Arbitrator
 *
 * Resolves conflicts between suspension adjustments, tyre core thermal warnings,
 * and strategic stint timelines. Prioritizes actions dynamically using the
 * active Session Objective Mode.
 */

import { type SessionObjectiveMode } from "./objectiveModes";

export interface ArbitratedRecommendation {
  actionToken: "ADJUST_SETUP" | "BOX_IMMEDIATE" | "EXTEND_STINT_FUEL_SAVE" | "MAINTAIN_PACE";
  targetChannel: string;            // e.g. "Rear Rebound", "Pit Lane", "Throttle"
  direction: "INCREASE" | "DECREASE" | "BOX" | "MAINTAIN";
  confidenceIndex: number;          // 0 to 100
  conflictResolved: string;         // description of what was resolved
  rationale: string;
}

/**
 * Resolves adjustments in conflict based on active session parameters.
 */
export function arbitrateRecommendations(
  objectiveMode: SessionObjectiveMode,
  isTireOverheating: boolean,
  isStabilityRiskHigh: boolean,
  isFuelMarginCritical: boolean,
  isPitCrossoverReached: boolean
): ArbitratedRecommendation {
  
  // 1. Conflict evaluation:
  // Stability risk demands "Increase Rear Rebound" to slow rear unloading.
  // Overheating tires demand "Decrease Rear Rebound" to limit friction slides.
  // Strategy demands "Box now" under crossover limits.
  // Fuel save demands "Extend stint and Lift-and-Coast".

  // Resolution Rule 1: Fuel Margin Critical always takes supreme priority
  if (isFuelMarginCritical) {
    return {
      actionToken: "BOX_IMMEDIATE",
      targetChannel: "Pit Lane",
      direction: "BOX",
      confidenceIndex: 99,
      conflictResolved: "Conflict resolved: Fuel combustion exhaustion takes priority over tyre preservation limits.",
      rationale: "Fuel reserves depleted below maximum stint threshold. Box immediately to avoid straightaway combustion starvation.",
    };
  }

  // Resolution Rule 2: Under Safety Car or Pit Crossover reached, prioritize boxing
  if (isPitCrossoverReached && objectiveMode !== "QUALIFYING_ATTACK") {
    return {
      actionToken: "BOX_IMMEDIATE",
      targetChannel: "Pit Lane",
      direction: "BOX",
      confidenceIndex: 92,
      conflictResolved: "Conflict resolved: Pit crossover time-loss exceeds worn tyre rubber pace losses.",
      rationale: "Fresh-compound pace delta gains surpass pit lane transit penalty bounds. Box this lap.",
    };
  }

  // Resolution Rule 3: High stability slide risk vs. Tire thermal saturation
  if (isStabilityRiskHigh && isTireOverheating) {
    if (objectiveMode === "QUALIFYING_ATTACK") {
      // Prioritize entry pivot grip over long-term tire carcass thermal growth
      return {
        actionToken: "ADJUST_SETUP",
        targetChannel: "Rear Rebound",
        direction: "INCREASE",
        confidenceIndex: 85,
        conflictResolved: "Conflict resolved: Qualifying hotlap attack prioritizes lateral corner bite over thermal tire decay.",
        rationale: "Increase rear rebound by +1 click to anchor entry pitch under heavy trail-braking deceleration, overriding thermal cooling guidelines.",
      };
    } else {
      // Prioritize tyre longevity in race stint or fuel save mode
      return {
        actionToken: "ADJUST_SETUP",
        targetChannel: "Rear Rebound",
        direction: "DECREASE",
        confidenceIndex: 78,
        conflictResolved: "Conflict resolved: Stint preservation prioritizes thermal tire core cooling over extreme pivot grip.",
        rationale: "De-tune rear rebound by -1 click to reduce driven-axle friction sliding coefficient, preserving tyre carcass carcass life.",
      };
    }
  }

  // Resolution Rule 4: Standard stability adjustment
  if (isStabilityRiskHigh) {
    return {
      actionToken: "ADJUST_SETUP",
      targetChannel: "Rear Rebound",
      direction: "INCREASE",
      confidenceIndex: 88,
      conflictResolved: "Chassis vector slide detected. Heuristics locked.",
      rationale: "Increase rear rebound damping by +1 click to restrict deceleration pitch rate, stabilizing underbody diffuser flow.",
    };
  }

  // Default: Maintain pace
  return {
    actionToken: "MAINTAIN_PACE",
    targetChannel: "Throttle",
    direction: "MAINTAIN",
    confidenceIndex: 90,
    conflictResolved: "No conflicts active. Base vectors clean.",
    rationale: "Telemetry signals within green envelope margins. Maintain active stint objective pace targets.",
  };
}
