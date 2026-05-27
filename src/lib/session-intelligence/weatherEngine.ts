/**
 * weatherEngine.ts — Dynamic Weather Evolution and grip Engine
 *
 * Models tire thermal shifts, dynamic friction grip coefficient declines under rain,
 * and tyre crossover windows (slick compound vs. wet tread compounds).
 */

export interface WeatherImpactMetrics {
  optimalCarcassTempShiftC: number;  // Shift in tire core optimal temp envelope (Celsius)
  globalFrictionGripCoeff: number;   // Calculated track grip friction multiplier (0.0 - 1.0)
  rainThermalCoolingOffset: number;  // Additional surface thermal cooling rate under rain (C/lap)
  optimalTireCompound: "SLICK_DRY" | "SLICK_INTERMEDIATE" | "WET_TREAD";
  crossoverViabilityPct: number;    // Probability that wet tires are faster than dry slicks
  verdictDescription: string;
}

/**
 * Calculates environmental weather impacts on tire mechanical performance.
 * @param ambientTempC ambient air temperature
 * @param trackTempC track surface temperature
 * @param rainIntensityPct moisture level on track (0% dry to 100% standing water)
 * @param rubberLevelPct track rubber layer build-up (0% green track to 100% fully scuffed)
 */
export function calculateWeatherGripImpact(
  ambientTempC: number,
  trackTempC: number,
  rainIntensityPct: number,
  rubberLevelPct: number
): WeatherImpactMetrics {
  
  // 1. Optimal carcass core temperature shift
  // Cool ambient track conditions shift optimal tyre core operational thresholds downwards.
  const tempDelta = trackTempC - 25.0; // 25C is standard track baseline
  const optimalTempShift = tempDelta * 0.18;

  // 2. Global track friction grip decay
  // Rain moisture severely reduces grip coefficients. Fully wet track reduces grip by up to 50%.
  // Rubber layer increases dry grip but worsens wet hydroplaning slides!
  const moistureFactor = rainIntensityPct / 100;
  const rubberWetSlickPenalty = moistureFactor > 0.15 ? (rubberLevelPct / 100) * 0.08 : 0;
  const globalGrip = Math.max(0.4, 1.0 - (moistureFactor * 0.52) - rubberWetSlickPenalty);

  // 3. Rain surface core thermal cooling offset
  // Surface moisture cools rubber carcass cores at up to -8.5C per lap.
  const coreCoolingOffset = moistureFactor * 8.5;

  // 4. Slick-to-wet compound crossover windows
  // Slicks are viable until moisture level breaches 20%. Beyond 35% wets are strictly faster.
  let crossoverProbability = 0;
  let optimalTyre: WeatherImpactMetrics["optimalTireCompound"] = "SLICK_DRY";

  if (rainIntensityPct > 35) {
    optimalTyre = "WET_TREAD";
    crossoverProbability = Math.min(100, 60 + (rainIntensityPct - 35) * 1.5);
  } else if (rainIntensityPct > 15) {
    optimalTyre = "SLICK_INTERMEDIATE";
    crossoverProbability = Math.min(60, 10 + (rainIntensityPct - 15) * 2.5);
  } else {
    optimalTyre = "SLICK_DRY";
    crossoverProbability = 0;
  }

  // 5. Formulate operational briefing
  let verdict = "";
  if (optimalTyre === "WET_TREAD") {
    verdict = `Track moisture has breached wet crossover limits (${rainIntensityPct}%). Slick tyre aquaplane sliding risk is critical. Re-tread instantly.`;
  } else if (optimalTyre === "SLICK_INTERMEDIATE") {
    verdict = `Intermediate moisture boundary. Dry slicks remain faster in sector splits if tyre carcass cores can preserve ${trackTempC.toFixed(0)}°C surface heat.`;
  } else {
    const rubberBonus = (rubberLevelPct * 0.05).toFixed(1);
    verdict = `Optimal dry conditions. Track rubber layer (${rubberLevelPct}%) provides a +${rubberBonus}% friction vector coefficient.`;
  }

  return {
    optimalCarcassTempShiftC: parseFloat(optimalTempShift.toFixed(1)),
    globalFrictionGripCoeff: parseFloat(globalGrip.toFixed(2)),
    rainThermalCoolingOffset: parseFloat(coreCoolingOffset.toFixed(1)),
    optimalTireCompound: optimalTyre,
    crossoverViabilityPct: parseFloat(crossoverProbability.toFixed(0)),
    verdictDescription: verdict,
  };
}
