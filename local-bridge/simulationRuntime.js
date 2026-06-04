/**
 * simulationRuntime.js — Counterfactual Telemetry Simulation Engine
 *
 * Runs counterfactual dynamics models over historical or active telemetry stints.
 * Takes base telemetry ticks, applies mechanical setup variations, and resolves
 * a comprehensive comparative counterfactual telemetry dataset.
 */

const { calculateTireTemp } = require("./vehicleModel/tireThermal");
const { calculateLongitudinalGrip } = require("./vehicleModel/longitudinalGrip");
const { calculateLateralSaturation } = require("./vehicleModel/lateralSaturation");
const { calculateAeroSensitivity } = require("./vehicleModel/aeroSensitivity");
const { calculateBrakingDynamics } = require("./vehicleModel/brakeMigration");
const { calculateEnergyDeployment } = require("./vehicleModel/energyDeployment");
const { calculateTrackEvolution } = require("./vehicleModel/trackEvolution");

/**
 * Executes stint counterfactual dynamics.
 * @param {Array} baseTicks raw array of telemetry samples
 * @param {object} adj mechanical adjustments
 * @returns {Array} counterfactual simulated telemetry frames
 */
function simulateCounterfactualStint(baseTicks, adj) {
  if (!Array.isArray(baseTicks) || baseTicks.length === 0) return [];

  // Parse adjustments
  const rearRebound = adj.rearReboundClicks || 0;
  const rearArb = adj.rearAntiRollBar || 0;
  const frontBias = adj.frontBrakeBias || 0; // % bias offset, e.g. +0.5
  const frontPackers = adj.frontPackerClicks || 0;
  const rearRideHeightDelta = adj.rideHeightRearDeltaRearMm || 0;
  const fuelDelta = adj.fuelDeltaKg || 0;

  let currentSoC = 80.0;
  let tireTempFL = 80.0;
  let tireTempFR = 80.0;
  let tireTempRL = 80.0;
  let tireTempRR = 80.0;
  let padTemp = 350.0;

  const dt = 1 / 60; // 60Hz tick steps

  return baseTicks.map((sample, idx) => {
    // Expose raw telemetry fields safely
    const c = sample.channels || {};
    const getVal = (chKey, fallback = 0) => {
      return c[chKey] && typeof c[chKey] === "object" ? c[chKey].avg : sample[chKey] || fallback;
    };

    const speed = getVal("speedKph", 0) / 3.6; // m/s
    const throttle = getVal("throttle", 0);
    const brake = getVal("brake", 0);
    const steering = getVal("steeringDeg", 0);
    const rpm = getVal("rpm", 5000);
    const gear = getVal("gear", 3);
    const yawRate = getVal("YawRate", 0);
    const pitch = getVal("Pitch", 0);
    const roll = getVal("Roll", 0);
    const frontDeflect = getVal("LFshockDefl", 0) * 1000; // mm

    // 1. Calculate Track surface evolution
    const track = calculateTrackEvolution(20.0, sample.lap_number || 1, 0, 80);

    // 2. Dynamic Brake migration & thermal fade
    const braking = calculateBrakingDynamics(
      brake,
      54.5 + frontBias, // base bias is 54.5% front
      3000.0, // normal load
      padTemp,
      speed,
    );
    padTemp = braking.padTempC;

    // 3. ERS state update
    const energy = calculateEnergyDeployment(
      throttle,
      brake,
      currentSoC,
      2, // Balanced
      speed,
      dt,
    );
    currentSoC = energy.nextSoCPct;

    // 4. Aero platforms & splitters grounding limit
    const aero = calculateAeroSensitivity(
      speed,
      pitch,
      frontDeflect,
      frontPackers,
      rearRideHeightDelta,
    );

    // 5. Tire temperature updates under counterfactual loads
    const normalLoadF = 3500.0 + aero.downforceN * 0.45;
    const normalLoadR = 4000.0 + aero.downforceN * 0.55;

    tireTempFL = calculateTireTemp(
      tireTempFL,
      normalLoadF,
      0.05,
      0.0,
      speed,
      20.0,
      padTemp * 0.1,
      dt,
    );
    tireTempFR = calculateTireTemp(
      tireTempFR,
      normalLoadF,
      0.05,
      0.0,
      speed,
      20.0,
      padTemp * 0.1,
      dt,
    );
    tireTempRL = calculateTireTemp(tireTempRL, normalLoadR, 0.02, 0.02, speed, 20.0, 30.0, dt);
    tireTempRR = calculateTireTemp(tireTempRR, normalLoadR, 0.02, 0.02, speed, 20.0, 30.0, dt);

    // 6. Longitudinal driven traction exits
    const longGrip = calculateLongitudinalGrip(
      throttle,
      normalLoadR,
      (tireTempRL + tireTempRR) / 2,
      75,
      95,
      track.globalFrictionGripCoeff,
      energy.mguKDeploykW,
    );

    // 7. Lateral Saturation & scrub factors
    const latGrip = calculateLateralSaturation(
      steering,
      yawRate,
      speed,
      normalLoadR,
      (tireTempFL + tireTempFR) / 2,
      track.globalFrictionGripCoeff,
    );

    // 8. Output simulated performance changes (delta effects)
    // Stiffer rear rebound improves aero stability, softening ARB gains traction
    const setupEfficiencyBonus =
      rearRebound * 0.015 + (rearArb < 0 ? Math.abs(rearArb) * 0.025 : -rearArb * 0.02);
    const speedMultiplier = 1.0 + setupEfficiencyBonus * 0.005 - (aero.isBottoming ? 0.04 : 0);
    const simulatedSpeedKph = Math.max(0, speed * 3.6 * speedMultiplier);

    // Build comprehensive telemetry frame payload matching uPlot tracers
    return {
      timestamp: sample.timestamp || new Date(),
      lapNumber: sample.lap_number || 1,
      channels: {
        speedKph: Number(simulatedSpeedKph.toFixed(1)),
        rpm: Math.round(rpm * speedMultiplier),
        gear,
        throttle,
        brake,
        steeringDeg: steering,
        fuelRemainingL: Math.max(0, getVal("fuelRemainingL", 40.0) - fuelDelta * 0.02),
        aeroStabilityRating: aero.stabilityRakeRating,
        exitTractionRating: longGrip.exitTractionRating,
        lateralG: latGrip.lateralG,
        isBottoming: aero.isBottoming ? 1.0 : 0.0,
        tireTempFL: Math.round(tireTempFL),
        tireTempFR: Math.round(tireTempFR),
        tireTempRL: Math.round(tireTempRL),
        tireTempRR: Math.round(tireTempRR),
      },
    };
  });
}

module.exports = {
  simulateCounterfactualStint,
};
