/**
 * strategyBoardRuntime.ts — Endurance Team Strategy Board Coordinator
 *
 * Coordinates strategic pit timelines across multiple teammate cars, fuel windows,
 * and caution safety bounds, flagging double-stack conflicts.
 */

export interface CarStintPlan {
  carNumber: string;
  driverName: string;
  lapsCompletedInStint: number;
  estFuelLapsRemaining: number;
  projectedPitLap: number;
  tireGripRemainingPct: number;
}

export interface PitOverlapWarning {
  warningId: string;
  severity: "info" | "warning" | "critical";
  message: string;
  involvedCars: string[];
  conflictLap: number;
}

export interface StrategyBoardState {
  cars: CarStintPlan[];
  warnings: PitOverlapWarning[];
  recommendations: string[];
}

/**
 * Evaluates the stint states and compiles warnings for the Strategy Board.
 * @param plans list of active car stint plans in the team
 * @returns StrategyBoardState resolved command center state
 */
export function evaluateTeamStrategyBoard(plans: CarStintPlan[]): StrategyBoardState {
  const warnings: PitOverlapWarning[] = [];
  const recommendations: string[] = [];

  if (!plans || plans.length === 0) {
    return { cars: [], warnings: [], recommendations: ["No active teammate telemetry sessions detected in the team namespace."] };
  }

  // 1. Scan for Double-Stack garage box conflicts (projected pit windows overlap)
  for (let i = 0; i < plans.length; i++) {
    for (let j = i + 1; j < plans.length; j++) {
      const carA = plans[i];
      const carB = plans[j];
      
      const lapDifference = Math.abs(carA.projectedPitLap - carB.projectedPitLap);
      if (lapDifference <= 1) { // Pitting on the same lap or adjacent laps
        warnings.push({
          warningId: `warn_ds_${carA.carNumber}_${carB.carNumber}`,
          severity: lapDifference === 0 ? "critical" : "warning",
          message: `DOUBLE-STACK ALERT: Car #${carA.carNumber} and Car #${carB.carNumber} projected pitstop windows overlap on Lap ${carA.projectedPitLap}.`,
          involvedCars: [carA.carNumber, carB.carNumber],
          conflictLap: carA.projectedPitLap
        });

        recommendations.push(
          `STRATEGY: Adjust Car #${carB.carNumber} objective to FUEL_SAVE to extend its stint by +2 laps and clear the box.`
        );
      }
    }
  }

  // 2. Scan for high tyre wear fatigue
  plans.forEach((car) => {
    if (car.tireGripRemainingPct < 72.0) {
      warnings.push({
        warningId: `warn_tire_${car.carNumber}`,
        severity: "warning",
        message: `TYRE GRIP DEPLETED: Car #${car.carNumber} tire carcass grip is degraded to ${car.tireGripRemainingPct.toFixed(1)}%.`,
        involvedCars: [car.carNumber],
        conflictLap: car.projectedPitLap
      });
      recommendations.push(
        `PERFORMANCE: Instruct Driver ${car.driverName} (Car #${car.carNumber}) to shift brake bias forward +0.5% to preserve rear tyres.`
      );
    }
  });

  if (recommendations.length === 0) {
    recommendations.push("Garage operations fully synchronized. Baseline stints and fuel schedules optimal.");
  }

  return {
    cars: plans,
    warnings,
    recommendations
  };
}
