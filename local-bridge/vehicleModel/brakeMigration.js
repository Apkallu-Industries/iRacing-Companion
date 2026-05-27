/**
 * brakeMigration.js — Brake Migration & Heat Fade Model
 *
 * Models front-to-rear hydraulic brake pressure migration, deceleration limits,
 * temperature heat fade, and locked sliding wheel warnings.
 */

/**
 * Calculates dynamic brake outputs and lockup risks.
 * @param {number} brake pedal position (0.0 to 1.0)
 * @param {number} frontBrakeBias front pressure distribution percentage (e.g. 54.5)
 * @param {number} verticalLoadN axle normal load (Newtons)
 * @param {number} brakeTempC disc pad temperature (°C)
 * @param {number} speedMps vehicle velocity (m/s)
 * @returns {object} { brakingForceN, lockupProbability, padTempC }
 */
function calculateBrakingDynamics(
  brake,
  frontBrakeBias,
  verticalLoadN,
  brakeTempC,
  speedMps
) {
  if (brake < 0.05 || speedMps < 1.0) {
    return { brakingForceN: 0, lockupProbability: 0, padTempC: Math.max(30, brakeTempC - 2.5) };
  }

  // 1. Friction coefficient efficiency based on disc pad temperature
  // High performance motorsport pads have an optimal heat sweep (350°C to 650°C)
  let frictionFadeFactor = 1.0;
  if (brakeTempC > 800) {
    // Severe thermal fade
    frictionFadeFactor = Math.max(0.45, 1.0 - (brakeTempC - 800) * 0.0022);
  } else if (brakeTempC < 150) {
    // Friction pads too cold
    frictionFadeFactor = Math.max(0.70, 0.7 + (brakeTempC / 150) * 0.3);
  }

  // 2. Front and Rear pressure balance calculations
  const frontRatio = frontBrakeBias / 100.0;
  const rearRatio = 1.0 - frontRatio;

  // 3. Torque output force
  const baseTorqueN = brake * 16000.0 * frictionFadeFactor;
  const frontForceN = baseTorqueN * frontRatio;
  const rearForceN = baseTorqueN * rearRatio;
  const totalBrakingForceN = frontForceN + rearForceN;

  // 4. Locked Wheel Lockup Probability
  // Lockup occurs when braking force overruns vertical tire load adhesion
  let lockupProbability = 0;
  const frontAdhesionLimitN = verticalLoadN * frontRatio * 1.15;
  const rearAdhesionLimitN = verticalLoadN * rearRatio * 1.05;

  if (frontForceN > frontAdhesionLimitN) {
    lockupProbability = Math.min(1.0, (frontForceN - frontAdhesionLimitN) / 2000.0);
  } else if (rearForceN > rearAdhesionLimitN) {
    // Back axle locking is highly unstable (initiates rotation snap slides)
    lockupProbability = Math.min(1.0, (rearForceN - rearAdhesionLimitN) / 1200.0) * 1.2;
  }

  // 5. Disc temperature buildup (conversion of kinetic speed deceleration to heat)
  const kineticHeatBuildup = brake * speedMps * 4.8;
  const nextPadTempC = brakeTempC + kineticHeatBuildup - (speedMps * 0.12); // cooling from rotation

  return {
    brakingForceN: Math.round(totalBrakingForceN),
    lockupProbability: Number(lockupProbability.toFixed(3)),
    padTempC: Math.max(35.0, Math.min(1150.0, Number(nextPadTempC.toFixed(1))))
  };
}

module.exports = {
  calculateBrakingDynamics
};
