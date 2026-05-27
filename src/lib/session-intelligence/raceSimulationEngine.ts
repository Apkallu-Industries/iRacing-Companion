/**
 * raceSimulationEngine.ts — Strategic Race Outcome Simulator
 *
 * Runs branching stint simulations to compare the pace, traffic, and finishing
 * deltas for different pit stop laps (e.g. Lap 22 vs Lap 24).
 */

export interface SimulationOutcome {
  pitLapSelected: number;
  tireCliffLap: number;
  totalTimeDeltaSec: number;       // relative to baseline strategy
  undercutViabilityPct: number;    // probability of undercut success
  trafficEmergenceGapSec: number;  // gap to traffic pack on pit exit
  safetyCarProbabilityPct: number; // probability of SC interrupting stints
  fuelSaveTargetL: number;         // target fuel burn required to make stint
  cleanAirEmergence: boolean;
  verdictNarrative: string;
}

/**
 * Simulates stint outcomes based on pitstop timing selections.
 * @param pitLapSelected proposed lap number to pit
 * @param currentLap active lap number in stint
 * @param tireGripPct current calculated tire grip percentage
 * @param fuelLevelL current fuel remaining in liters
 * @param pitstopPenaltySec total time lost during pit lane stop (e.g. 24.5s)
 */
export function simulateRaceOutcome(
  pitLapSelected: number,
  currentLap: number,
  tireGripPct: number,
  fuelLevelL: number,
  pitstopPenaltySec = 24.5
): SimulationOutcome {
  
  // 1. Tire wear pace decay curve modeling
  // worn tires lose roughly 0.08s - 0.12s per lap.
  const baselineOptimalPitLap = 24;
  const lapsToTarget = pitLapSelected - currentLap;
  const gripDecayCoefficient = Math.max(0.1, (100 - tireGripPct) / 100);

  // 2. Undercut/overcut pace deltas
  // Pitting early (undercut) gains fresh-compound speed delta of ~1.6s per lap
  // but runs longer on worn rubber at the end of the second stint.
  const earlyPitSteps = baselineOptimalPitLap - pitLapSelected;
  let timeDelta = 0;

  if (earlyPitSteps > 0) {
    // Undercut scenario: gain initial pace but lose grip later
    timeDelta = -(earlyPitSteps * 1.25) + (earlyPitSteps * earlyPitSteps * 0.22);
  } else {
    // Overcut scenario: extend worn rubber, hoping for clean air
    timeDelta = (Math.abs(earlyPitSteps) * 1.55) * gripDecayCoefficient;
  }

  // 3. Traffic emergence calculations
  // Traffic clusters typically move at GT Pace offsets. Pit exit emerges behind or inside.
  // 1.0s to 1.8s trailing triggers wake downforce wash drops.
  const trafficGap = Math.abs((pitLapSelected * 4.2) % 18.0 - 9.0);
  const cleanAir = trafficGap > 2.5;

  // 4. Fuel Save constraints
  // Extended stint (overcut) requires saving fuel.
  const standardFuelBurn = 3.65;
  const fuelTarget = pitLapSelected > baselineOptimalPitLap
    ? Math.max(2.8, standardFuelBurn - (pitLapSelected - baselineOptimalPitLap) * 0.18)
    : standardFuelBurn;

  // 5. Safety Car event probability bounds
  const scProb = Math.min(65, 8 + (pitLapSelected * 1.25));

  // 6. Formulate operational verdict
  let verdict = "";
  if (earlyPitSteps > 0 && cleanAir) {
    verdict = `Undercut highly viable. fresh compound offset gains an estimated ${Math.abs(timeDelta).toFixed(1)}s delta, emerging in a clean ${trafficGap.toFixed(1)}s traffic slot.`;
  } else if (earlyPitSteps > 0 && !cleanAir) {
    verdict = `Undercut compromised. Pitting on Lap ${pitLapSelected} yields initial pace gains but exits directly into a GT traffic queue (gap: ${trafficGap.toFixed(1)}s).`;
  } else if (earlyPitSteps === 0) {
    verdict = `Standard stint balance. Baseline strategy preserves fuel margins and ensures steady tyre core carcass expansion rates.`;
  } else {
    verdict = `Overcut requires severe lift-and-coast fuel save of ${fuelTarget.toFixed(2)}L/lap. High probability (${scProb.toFixed(0)}%) of Safety Car track interception.`;
  }

  return {
    pitLapSelected,
    tireCliffLap: Math.round(baselineOptimalPitLap * 1.1),
    totalTimeDeltaSec: parseFloat(timeDelta.toFixed(2)),
    undercutViabilityPct: parseFloat(Math.min(95, Math.max(5, 75 - earlyPitSteps * 15)).toFixed(0)),
    trafficEmergenceGapSec: parseFloat(trafficGap.toFixed(1)),
    safetyCarProbabilityPct: parseFloat(scProb.toFixed(0)),
    fuelSaveTargetL: parseFloat(fuelTarget.toFixed(2)),
    cleanAirEmergence: cleanAir,
    verdictNarrative: verdict,
  };
}
