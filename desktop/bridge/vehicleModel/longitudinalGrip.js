/**
 * longitudinalGrip.js — Longitudinal Grip & Driven Traction Model
 *
 * Models tire driven exit traction ratings and longitudinal slip ratios based on
 * vertical tire load, carcass temperatures, throttle application, and ERS torque maps.
 */

/**
 * Calculates exit traction and longitudinal slip ratios.
 * @param {number} throttle position (0.0 to 1.0)
 * @param {number} verticalLoadN vertical load on driven axle (Newtons)
 * @param {number} tireTempC carcass temperature (°C)
 * @param {number} minOptimalTemp optimal temperature lower bound (°C)
 * @param {number} maxOptimalTemp optimal temperature upper bound (°C)
 * @param {number} globalFrictionCoeff track friction coefficient (e.g. 1.0)
 * @param {number} ersDeploykW active electric deploy kW (e.g. 0 to 120)
 * @returns {object} { exitTractionRating, slipRatio }
 */
function calculateLongitudinalGrip(
  throttle,
  verticalLoadN,
  tireTempC,
  minOptimalTemp,
  maxOptimalTemp,
  globalFrictionCoeff = 1.0,
  ersDeploykW = 0
) {
  // 1. Thermal efficiency coefficient (parabolic dropoff outside optimal window)
  const optimalCenter = (minOptimalTemp + maxOptimalTemp) / 2;
  const optimalHalfWidth = (maxOptimalTemp - minOptimalTemp) / 2;
  const tempDeviation = Math.abs(tireTempC - optimalCenter);
  
  let thermalFactor = 1.0;
  if (tempDeviation > optimalHalfWidth) {
    const excessiveDelta = tempDeviation - optimalHalfWidth;
    thermalFactor = Math.max(0.65, 1.0 - Math.pow(excessiveDelta * 0.035, 2));
  }

  // 2. Driven Axle Engine/ERS Torque approximation
  const totalTorqueDemand = throttle * 600 + (ersDeploykW * 4.5); // estimated Nm
  
  // 3. Normal grip capability (Amontons' Law with friction coefficients)
  const maxGripForceN = verticalLoadN * globalFrictionCoeff * thermalFactor * 1.15;
  const slipPotentialForceN = totalTorqueDemand / 0.33; // torque divided by tire radius (0.33m)

  // 4. Resolve slip ratio (0.0 to 1.0)
  let slipRatio = 0.0;
  if (verticalLoadN > 500) {
    const rawSlip = slipPotentialForceN / maxGripForceN;
    slipRatio = Math.max(0.0, Math.min(1.0, Math.pow(rawSlip, 1.8) * 0.12));
  }

  // 5. Convert to 0-100 exit traction rating
  // Traction drops as slip ratio and excessive throttle demand overrun vertical grip
  let exitTractionRating = 100 - (slipRatio * 280) - (throttle > 0.8 && slipRatio > 0.05 ? 12 : 0);
  exitTractionRating = Math.max(10, Math.min(99, Math.round(exitTractionRating)));

  return {
    exitTractionRating,
    slipRatio: Number(slipRatio.toFixed(3))
  };
}

module.exports = {
  calculateLongitudinalGrip
};
