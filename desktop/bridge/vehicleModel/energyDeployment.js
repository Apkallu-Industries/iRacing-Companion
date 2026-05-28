/**
 * energyDeployment.js — MGU-K Hybrid Energy Deployment Model
 *
 * Models electric hybrid battery State of Charge (SoC) decay curves, dynamic MGU-K
 * kinetic recovery harvesting, and straightaway kW deploy sweeps.
 */

/**
 * Calculates battery charge updates and electric motor deployment torque.
 * @param {number} throttle position (0.0 to 1.0)
 * @param {number} brake position (0.0 to 1.0)
 * @param {number} currentSoCPct active state of charge (0 to 100)
 * @param {number} ersMode active ERS mapping mode (e.g. 0 to 4)
 * @param {number} speedMps vehicle velocity (m/s)
 * @param {number} dt elapsed tick time (seconds)
 * @returns {object} { nextSoCPct, mguKDeploykW, mguKHarvestkW }
 */
function calculateEnergyDeployment(
  throttle,
  brake,
  currentSoCPct,
  ersMode = 2, // 0 = OFF, 1 = CONSERVE, 2 = BALANCED, 3 = ATTACK, 4 = QUAL
  speedMps,
  dt = 1 / 60
) {
  if (currentSoCPct <= 0.5) {
    return { nextSoCPct: 0, mguKDeploykW: 0, mguKHarvestkW: 0 };
  }

  // 1. Resolve active ERS map parameters
  let deployCapkW = 0;
  let deployThresholdThrottle = 0.8;
  
  switch (ersMode) {
    case 1: // Conserve
      deployCapkW = 30.0;
      deployThresholdThrottle = 0.9;
      break;
    case 2: // Balanced
      deployCapkW = 80.0;
      deployThresholdThrottle = 0.75;
      break;
    case 3: // Attack
      deployCapkW = 120.0;
      deployThresholdThrottle = 0.6;
      break;
    case 4: // Qualifying peak
      deployCapkW = 150.0;
      deployThresholdThrottle = 0.5;
      break;
    default: // Off
      deployCapkW = 0;
      break;
  }

  // MGU-K deploys under high throttle above key speeds
  let mguKDeploykW = 0;
  if (throttle >= deployThresholdThrottle && currentSoCPct > 1.0 && speedMps > 15.0) {
    mguKDeploykW = deployCapkW * throttle;
  }

  // 2. MGU-K Harvesting (converts deceleration brake drag to electrical battery energy)
  let mguKHarvestkW = 0;
  if (brake > 0.10 && speedMps > 10.0) {
    // Harvest cap is typical WEC limit (e.g. 150kW or 200kW)
    mguKHarvestkW = Math.min(220.0, brake * 180.0);
  }

  // 3. Update battery State of Charge (SoC)
  // Consumption: 1 kW of deploy for 1s drains ~0.02% of full hybrid capacity
  const deployDrain = mguKDeploykW * 0.02 * dt;
  // Harvest: 1 kW of harvest for 1s recovers ~0.015% of capacity (efficiency loss)
  const harvestRecover = mguKHarvestkW * 0.015 * dt;

  let nextSoCPct = currentSoCPct - deployDrain + harvestRecover;
  nextSoCPct = Math.max(0.0, Math.min(100.0, Number(nextSoCPct.toFixed(3))));

  return {
    nextSoCPct,
    mguKDeploykW: Number(mguKDeploykW.toFixed(1)),
    mguKHarvestkW: Number(mguKHarvestkW.toFixed(1))
  };
}

module.exports = {
  calculateEnergyDeployment
};
