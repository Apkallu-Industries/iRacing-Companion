/**
 * aeroSensitivity.js — Aerodynamic Downforce & Pitch Sensitivity Model
 *
 * Models dynamic downforce loads, pitch rake coefficients, and diffuser vacuum
 * flow seal compression under ride heights and suspension deflections.
 */

/**
 * Calculates aerodynamic downforce load forces and diffuser groundings.
 * @param {number} speedMps vehicle velocity (m/s)
 * @param {number} pitchRad vehicle pitch angle (radians)
 * @param {number} frontDeflectionMm front suspension compression deflection (mm)
 * @param {number} frontPackersClicks mechanical packer bump stops (clicks)
 * @param {number} rideHeightRearDeltaRearMm counterfactual rear ride height adjustment (mm)
 * @returns {object} { downforceN, stabilityRakeRating, isBottoming }
 */
function calculateAeroSensitivity(
  speedMps,
  pitchRad,
  frontDeflectionMm,
  frontPackersClicks,
  rideHeightRearDeltaRearMm = 0
) {
  if (speedMps < 5.0) {
    return { downforceN: 0, stabilityRakeRating: 99, isBottoming: false };
  }

  // 1. Aerodynamic drag and downforce scale quadratically with velocity (F = 0.5 * rho * Cl * A * v^2)
  const baseCl = 3.4; // coefficient of lift/downforce
  const airDensity = 1.225; // kg/m^3
  const referenceArea = 2.0; // m^2
  
  // 2. Adjust aerodynamic coefficient based on pitch rake (nose-down rake expands diffuser vacuum)
  // Optimal rake for GTP/GT3 typically sits around -0.010 to -0.014 radians (nose pitched forward)
  const counterfactualRake = pitchRad - (rideHeightRearDeltaRearMm * 0.0005);
  
  let rakeFactor = 1.0;
  if (counterfactualRake < -0.016) {
    // Nose pitched too low, splitter blocks airflow entering the underbody floor
    rakeFactor = Math.max(0.70, 1.0 - (Math.abs(counterfactualRake) - 0.016) * 12.0);
  } else if (counterfactualRake > -0.002) {
    // Nose pitched too high, vacuum seal leaks pressure
    rakeFactor = Math.max(0.75, 1.0 - (counterfactualRake - (-0.002)) * 8.0);
  } else {
    // Highly efficient rake zone
    const gap = Math.abs(counterfactualRake - (-0.011));
    rakeFactor = 1.0 + (0.14 - gap * 10);
  }

  // 3. Packer engagement and bottoming groundings
  // Mechanical front packers limit vertical suspension travel
  const maxTravelMm = 45.0 + (frontPackersClicks * 1.5);
  const isBottoming = frontDeflectionMm > maxTravelMm;

  let bottomingMultiplier = 1.0;
  if (isBottoming) {
    // Diffuser vacuum stalls completely when front splitter hits the ground (pressure spikes)
    bottomingMultiplier = Math.max(0.40, 1.0 - (frontDeflectionMm - maxTravelMm) * 0.08);
  }

  // 4. Calculate final downforce force (Newtons)
  const Cl = baseCl * rakeFactor * bottomingMultiplier;
  const downforceN = 0.5 * airDensity * Cl * referenceArea * Math.pow(speedMps, 2);

  // 5. Convert to 0-100 aerodynamic stability rake rating
  let stabilityRakeRating = 100 - (isBottoming ? 35 : 0) - (rakeFactor < 0.85 ? 15 : 0);
  stabilityRakeRating = Math.max(10, Math.min(99, Math.round(stabilityRakeRating)));

  return {
    downforceN: Math.round(downforceN),
    stabilityRakeRating,
    isBottoming
  };
}

module.exports = {
  calculateAeroSensitivity
};
