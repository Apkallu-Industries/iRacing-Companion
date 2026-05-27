/**
 * stintStateEngine.ts — Stint State and Degradation Engine
 *
 * Tracks, compiles, and forecasts long-term stint wear dimensions:
 * tire phase decay, fuel consumption curves, thermal saturation limits,
 * brake torque fatigue index, and hybrid ERS state-of-charge sweeps.
 */

export interface StintStateMetrics {
  tireGripPct: number;             // Grip level remaining (100% down to cliff threshold)
  fuelBurnPerLapL: number;         // Average fuel consumed per lap (liters)
  fuelLapsRemaining: number;       // Forecasted laps remaining on fuel reserves
  thermalSaturationIndex: number;  // Ratio of tire carcass core temp to optimal (0.0 - 1.0)
  brakeFatigueIndex: number;       // Friction torque reduction index (0.0 - 1.0, lower is worse)
  ersDepletionRatePct: number;     // Average hybrid battery decay per straightaway sweep
}

/**
 * Calculates long-term stint state wear parameters.
 * @param lapsCompleted count of active stint laps completed
 * @param speedMps average lap velocity
 * @param fuelLevelL current fuel remaining in liters
 * @param tireTempsCL front-left carcass temperature arrays
 * @param brakeTempsC brake rotor temperature arrays
 * @param batterySoCPct ERS state-of-charge percentage logs
 */
export function calculateStintState(
  lapsCompleted: number,
  speedMps: number[],
  fuelLevelL: number,
  tireTempsCL: number[],
  brakeTempsC: number[],
  batterySoCPct: number[]
): StintStateMetrics {
  
  // 1. Tire grip exponential decay modeling
  // grip(t) = startGrip - (gripLossCoefficient * lapsCompleted^1.3)
  const initialGrip = 100;
  const gripLossCoeff = 0.42;
  const tireGrip = Math.max(20, initialGrip - (gripLossCoeff * Math.pow(lapsCompleted, 1.25)));

  // 2. Fuel consumption calculations
  // GT3 vehicles burn roughly 3.2L to 4.4L per lap under green flag.
  const baselineBurn = 3.65;
  const speedCorrection = speedMps.length > 0 
    ? (speedMps.reduce((a, b) => a + b, 0) / speedMps.length) / 38.0 
    : 1.0;
  const avgFuelBurn = baselineBurn * Math.max(0.6, Math.min(1.4, speedCorrection));
  const fuelLapsRemaining = avgFuelBurn > 0 ? Math.max(0, fuelLevelL / avgFuelBurn) : 0;

  // 3. Thermal core saturation
  // Optimal tire temp is ~85C. Breaching 105C indicates severe friction sliding.
  let avgTireTemp = 85;
  if (tireTempsCL.length > 0) {
    avgTireTemp = tireTempsCL.reduce((a, b) => a + b, 0) / tireTempsCL.length;
  }
  const thermalSaturation = Math.min(1.0, Math.max(0.0, (avgTireTemp - 50) / 55.0));

  // 4. Brake fatigue modeling
  // Rotor temperatures above 850C cause carbon fade and pedal travel deflection.
  let avgBrakeTemp = 420;
  if (brakeTempsC.length > 0) {
    avgBrakeTemp = brakeTempsC.reduce((a, b) => a + b, 0) / brakeTempsC.length;
  }
  const brakeFade = avgBrakeTemp > 850 
    ? Math.max(0.4, 1.0 - (avgBrakeTemp - 850) * 0.0018) 
    : 1.0;

  // 5. ERS depletion rates
  // Measures average hybrid battery decay per straightaway Straight (typically 3-6%)
  let socDecay = 4.2;
  if (batterySoCPct.length > 5) {
    let drops = 0;
    let counts = 0;
    for (let i = 1; i < batterySoCPct.length; i++) {
      const diff = batterySoCPct[i - 1] - batterySoCPct[i];
      if (diff > 0.05) {
        drops += diff;
        counts++;
      }
    }
    socDecay = counts > 0 ? (drops / counts) : 4.2;
  }

  return {
    tireGripPct: parseFloat(tireGrip.toFixed(1)),
    fuelBurnPerLapL: parseFloat(avgFuelBurn.toFixed(2)),
    fuelLapsRemaining: parseFloat(fuelLapsRemaining.toFixed(1)),
    thermalSaturationIndex: parseFloat(thermalSaturation.toFixed(2)),
    brakeFatigueIndex: parseFloat(brakeFade.toFixed(2)),
    ersDepletionRatePct: parseFloat(socDecay.toFixed(2)),
  };
}
