/**
 * strategyTrees.ts — Branching Strategic Decision Trees
 *
 * Compiles real-time stint metrics and traffic positioning parameters into
 * logical branching decision trees, outputting probability-weighted recommendations.
 */

export interface StrategyDecisionNode {
  nodeId: string;
  conditionMet: string;
  recommendedAction:
    | "BOX_THIS_LAP"
    | "EXTEND_STINT"
    | "FUEL_SAVE_LIFT"
    | "PUSH_LAP_ATTACK"
    | "SAFETY_CAR_STANDBY";
  probabilityWeightPct: number; // estimated chance of outcome success
  alternativeBranchName: string;
  alternativeBranchNarrative: string;
}

/**
 * Navigates and evaluates branching strategy loops.
 * @param tireGripPct calculated tire grip remaining
 * @param fuelLapsRemaining calculated fuel remaining in laps
 * @param trafficGapSec exit gap to nearest traffic pack (seconds)
 * @param currentObjectiveMode active session objective mode
 */
export function evaluateStrategyTree(
  tireGripPct: number,
  fuelLapsRemaining: number,
  trafficGapSec: number,
  currentObjectiveMode: string,
): StrategyDecisionNode {
  const isTireCliffClose = tireGripPct < 75.0;
  const isFuelLimitClose = fuelLapsRemaining < 2.0;
  const isTrafficClear = trafficGapSec > 2.5;

  // Branch A: Fuel critical limit breached
  if (isFuelLimitClose) {
    return {
      nodeId: "NODE_FUEL_CRITICAL",
      conditionMet: `Fuel reserves exhausted (${fuelLapsRemaining.toFixed(1)} laps remaining).`,
      recommendedAction: "BOX_THIS_LAP",
      probabilityWeightPct: 100,
      alternativeBranchName: "Combustion starvation recovery",
      alternativeBranchNarrative:
        "Fuel exhaustion renders stint extension non-viable. Pit immediately.",
    };
  }

  // Branch B: Tire grip collapse detected (Tire Cliff zone)
  if (isTireCliffClose) {
    if (isTrafficClear) {
      // Clean pit exit window available
      return {
        nodeId: "NODE_TIRE_CLIFF_UNDERCUT",
        conditionMet: `Tire grip degraded below optimal limits (${tireGripPct.toFixed(1)}%) while pit exit window is clear (gap: ${trafficGapSec.toFixed(1)}s).`,
        recommendedAction: "BOX_THIS_LAP",
        probabilityWeightPct: 88,
        alternativeBranchName: "Extend stint for overcut",
        alternativeBranchNarrative:
          "Extending stint runs worn tires into cumulative pace losses, risking sector time decay.",
      };
    } else {
      // Exiting would merge inside traffic pack
      return {
        nodeId: "NODE_TIRE_CLIFF_TRAFFIC_BLOCK",
        conditionMet: `Tire grip degraded (${tireGripPct.toFixed(1)}%) but pit exit is blocked by a traffic queue (gap: ${trafficGapSec.toFixed(1)}s).`,
        recommendedAction: "FUEL_SAVE_LIFT",
        probabilityWeightPct: 76,
        alternativeBranchName: "Immediate pit release",
        alternativeBranchNarrative:
          "Pitting now exits directly behind slower GT cars, block-stalling downforce flow.",
      };
    }
  }

  // Branch C: Safety Car pacing active
  if (currentObjectiveMode === "SAFETY_CAR") {
    return {
      nodeId: "NODE_SAFETY_CAR_PACE",
      conditionMet: "Safety Car pacing limits active.",
      recommendedAction: "SAFETY_CAR_STANDBY",
      probabilityWeightPct: 95,
      alternativeBranchName: "Pre-emptive cheap pitstop",
      alternativeBranchNarrative:
        "Box now to acquire fresh compound vectors under low time-loss penalty.",
    };
  }

  // Branch D: Fuel save active
  if (currentObjectiveMode === "FUEL_SAVE") {
    return {
      nodeId: "NODE_FUEL_SAVE_ACTIVE",
      conditionMet: "Strategic lift-and-coast fuel economy active.",
      recommendedAction: "FUEL_SAVE_LIFT",
      probabilityWeightPct: 90,
      alternativeBranchName: "Qualifying Pace Attack",
      alternativeBranchNarrative:
        "Toggling to attack consumes fuel reserves rapidly, shortening stint limits by -3 laps.",
    };
  }

  // Fallback: Standard Race Stint pacing
  return {
    nodeId: "NODE_STANDARD_PACE",
    conditionMet: "Chassis and fuel parameters within optimal margins.",
    recommendedAction: "PUSH_LAP_ATTACK",
    probabilityWeightPct: 85,
    alternativeBranchName: "Early strategy window",
    alternativeBranchNarrative:
      "Pitting now triggers an early undercut, but pushes subsequent tyre wear limits.",
  };
}
