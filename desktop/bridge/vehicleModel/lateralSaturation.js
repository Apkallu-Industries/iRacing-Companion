/**
 * lateralSaturation.js — Lateral Tire Saturation & Slip Angle Model
 *
 * Models cornering yaw limits, dynamic lateral slip angles, and tire sliding scrub
 * factors as steering inputs traverse slip limits.
 */

/**
 * Calculates slip angles and cornering saturation states.
 * @param {number} steeringDeg steer wheel angle (degrees)
 * @param {number} yawRateRadSec vehicle rotation rate (radians/sec)
 * @param {number} speedMps vehicle velocity (m/s)
 * @param {number} verticalLoadN vertical tire load (Newtons)
 * @param {number} tireTempC carcass temperature (°C)
 * @param {number} globalFrictionCoeff track friction coefficient (e.g. 1.0)
 * @returns {object} { slipAngleRad, corneringYawLimit, lateralG }
 */
function calculateLateralSaturation(
  steeringDeg,
  yawRateRadSec,
  speedMps,
  verticalLoadN,
  tireTempC,
  globalFrictionCoeff = 1.0
) {
  // Convert steering to wheel angle (approximate steering ratio 14:1)
  const steeringWheelRad = (steeringDeg * Math.PI) / 180;
  const averageWheelAngleRad = steeringWheelRad / 14.0;

  // 1. Calculate dynamic slip angle (wheel heading vs vehicle travel heading)
  const vehicleSlipAngleRad = speedMps > 2.0 ? Math.atan2(yawRateRadSec * 1.6, speedMps) : 0;
  const slipAngleRad = averageWheelAngleRad - vehicleSlipAngleRad;

  // 2. Tire lateral load capabilities (friction coefficient + thermal bounds)
  let thermalFactor = 1.0;
  if (tireTempC > 105) {
    // Thermal overheating degradation
    thermalFactor = Math.max(0.70, 1.0 - (tireTempC - 105) * 0.007);
  } else if (tireTempC < 65) {
    // Tire carcass too cold to adhere
    thermalFactor = Math.max(0.75, 1.0 - (65 - tireTempC) * 0.009);
  }

  const maxLateralForceN = verticalLoadN * globalFrictionCoeff * thermalFactor * 1.12;

  // 3. Peak lateral grip (saturates near 7-9 degrees = ~0.14 radians)
  const absSlipAngle = Math.abs(slipAngleRad);
  let saturationFactor = 1.0;
  
  if (absSlipAngle > 0.14) {
    // Tire is sliding/scrubbing past maximum adhesion peak
    const excessSlip = absSlipAngle - 0.14;
    saturationFactor = Math.max(0.68, 1.0 - excessSlip * 1.4);
  } else {
    // Linear building phase
    saturationFactor = absSlipAngle / 0.14;
  }

  const actualLateralForceN = maxLateralForceN * saturationFactor;

  // 4. Compute lateral G-load (F = m * a => a = F/m, approximate mass overlay)
  const lateralG = actualLateralForceN / 6500.0; // approximate corner load mass

  // 5. Convert to cornering yaw limit rating (0-100 scale)
  // Higher steer angles past peak grip cause severe scrub saturation and yaw limit warnings
  let corneringYawLimit = 100 - (absSlipAngle > 0.15 ? (absSlipAngle - 0.15) * 220 : 0);
  corneringYawLimit = Math.max(15, Math.min(99, Math.round(corneringYawLimit)));

  return {
    slipAngleRad: Number(slipAngleRad.toFixed(3)),
    corneringYawLimit,
    lateralG: Number(lateralG.toFixed(2))
  };
}

module.exports = {
  calculateLateralSaturation
};
