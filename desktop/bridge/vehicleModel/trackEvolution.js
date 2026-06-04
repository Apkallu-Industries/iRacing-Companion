/**
 * trackEvolution.js — Track Evolution & Surface Friction Model
 *
 * Models dynamic track rubbering-in, solar track surface temperature drift, and
 * rain-intensity moisture wash-off decay.
 */

/**
 * Calculates evolved track state metrics.
 * @param {number} ambientC air temperature (°C)
 * @param {number} currentLaps laps completed in session
 * @param {number} rainIntensity moisture level (0 to 100)
 * @param {number} rubberLevelBase baseline track rubbering (0 to 100)
 * @returns {object} { globalFrictionGripCoeff, trackTempC, rubberPercent }
 */
function calculateTrackEvolution(ambientC, currentLaps, rainIntensity, rubberLevelBase = 50) {
  // 1. Rubber accumulation (accumulates +0.4% per lap up to maximum limit of 100%)
  // If rain starts, rubber is washed off rapidly (-1.5% per 1% rain intensity)
  const accumulation = currentLaps * 0.4;
  const washOff = rainIntensity * 1.5;

  let rubberPercent = rubberLevelBase + accumulation - washOff;
  rubberPercent = Math.max(5.0, Math.min(100.0, rubberPercent));

  // 2. Track surface temperature shift
  // Solar thermal absorption adds +3°C to +8°C above ambient under dry conditions.
  // Rain causes severe evaporative thermal cooling (-0.22°C per 1% rain intensity)
  const solarAbsorption = 6.5;
  const rainCooling = rainIntensity * 0.25;

  let trackTempC = ambientC + solarAbsorption - rainCooling;
  trackTempC = Math.max(ambientC - 2.0, Math.min(65.0, Number(trackTempC.toFixed(1))));

  // 3. Resolve global friction grip coefficient (baseline 1.0)
  // Clean, rubbered-in dry line adds +4% friction grip (+0.04)
  // Moisture/rain drops grip severely (up to -35% friction)
  const rubberFrictionFactor = (rubberPercent / 100.0) * 0.04;
  const rainFrictionFactor = (rainIntensity / 100.0) * 0.35;

  const globalFrictionGripCoeff = 1.0 + rubberFrictionFactor - rainFrictionFactor;

  return {
    globalFrictionGripCoeff: Number(globalFrictionGripCoeff.toFixed(3)),
    trackTempC,
    rubberPercent: Math.round(rubberPercent),
  };
}

module.exports = {
  calculateTrackEvolution,
};
