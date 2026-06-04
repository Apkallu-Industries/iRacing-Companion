/**
 * tireThermal.js — Tire Carcass Thermal Growth Model
 *
 * Simulates tire tread and core carcass temperature growth under vertical tire loads,
 * sliding friction, and ambient cooling/heating conditions.
 */

/**
 * Calculates updated tire temperature for a single tick.
 * @param {number} prevTempC baseline tire temperature (°C)
 * @param {number} verticalLoadN vertical load on tire (Newtons)
 * @param {number} slipAngleRad lateral slip angle (radians)
 * @param {number} slipRatio longitudinal slip ratio (0.0 to 1.0)
 * @param {number} speedMps vehicle velocity (m/s)
 * @param {number} ambientC air temperature (°C)
 * @param {number} brakeHeatC heat radiation from nearby brakes (°C)
 * @param {number} dt elapsed tick time (seconds)
 * @returns {number} updated tire temperature (°C)
 */
function calculateTireTemp(
  prevTempC,
  verticalLoadN,
  slipAngleRad,
  slipRatio,
  speedMps,
  ambientC,
  brakeHeatC,
  dt = 1 / 60,
) {
  // 1. Friction heat generation (sliding mechanical energy converts to thermal energy)
  const lateralFrictionWork = Math.abs(verticalLoadN * Math.sin(slipAngleRad) * speedMps * 0.12);
  const longitudinalFrictionWork = Math.abs(verticalLoadN * slipRatio * speedMps * 0.15);
  const totalFrictionHeatGen = (lateralFrictionWork + longitudinalFrictionWork) * 0.0035;

  // 2. Convective cooling (heat dissipating into passing air)
  const coolingVelocityFactor = 1 + 0.15 * Math.pow(speedMps, 0.8);
  const coolingRate = (prevTempC - ambientC) * 0.045 * coolingVelocityFactor;

  // 3. Brake heat radiation (heat soaking from brake disc rotation)
  const brakeSoakRate = Math.max(0, (brakeHeatC - prevTempC) * 0.008);

  // 4. Update temperature with thermal capacity delay
  const tempDelta = (totalFrictionHeatGen - coolingRate + brakeSoakRate) * dt;
  const nextTemp = prevTempC + tempDelta;

  // Clamp within realistic thermodynamic boundaries (ambient to carcass saturation limit)
  return Math.max(ambientC, Math.min(145.0, Number(nextTemp.toFixed(2))));
}

module.exports = {
  calculateTireTemp,
};
