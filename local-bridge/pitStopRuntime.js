/**
 * pitStopRuntime.js — Stationary Pit Stop & Rejoin Intelligence Engine
 *
 * Tracks stationary fueling times, tire swap delays, and driver swap intervals,
 * predicting track exit slots relative to closing traffic classes.
 */

class PitStopRuntime {
  constructor() {
    this.fuelFlowRate = 3.2; // Litres per second flow rate
    this.tireChangeTime = 22.0; // Seconds to swap 4 tyres (adjacent or sequential)
    this.driverSwapTime = 12.5; // Additional seconds for seatbelt/radio swaps
  }

  /**
   * Evaluates stationary times and track exit gaps.
   * @param {number} fuelToLoadL Litres of fuel to inject
   * @param {boolean} changeTires whether tyre swap is selected
   * @param {boolean} swapDrivers whether driver swap is active
   * @param {number} trailingTrafficDistM distance to nearest trailing vehicle (meters)
   * @param {number} trailingTrafficSpeedMps velocity of trailing vehicle (m/s)
   * @returns {object} pit stop time projections and exit gaps
   */
  calculatePitStopProjections(
    fuelToLoadL,
    changeTires,
    swapDrivers,
    trailingTrafficDistM = 500,
    trailingTrafficSpeedMps = 60
  ) {
    // 1. Calculate stationary durations
    const fuelingTime = fuelToLoadL / this.fuelFlowRate;
    
    // In WEC/IMSA, fueling and tire changes can run concurrently or sequentially depending on rules.
    // We assume sequential here for safety margin projections (conservative bounds)
    let stationaryTime = fuelingTime;
    if (changeTires) {
      stationaryTime += this.tireChangeTime;
    }
    if (swapDrivers) {
      stationaryTime += this.driverSwapTime;
    }

    // Total pitlane loss is stationary time + pit entry/exit speed limit traversal loss (~24.5s)
    const pitlaneSpeedLimitLoss = 24.5;
    const totalTimeLoss = stationaryTime + pitlaneSpeedLimitLoss;

    // 2. Predict track rejoin gaps relative to trailing pack
    // Trailing car closing speed sweeps down pit lane
    const trailingTimeArrival = trailingTrafficSpeedMps > 0 ? trailingTrafficDistM / trailingTrafficSpeedMps : 999;
    const exitGapsSeconds = trailingTimeArrival - totalTimeLoss;

    let exitSlotVerdict = "SAFE_REJOIN";
    let rationale = `Rejoin exit slot is clear (+${exitGapsSeconds.toFixed(1)}s gap ahead of traffic).`;

    if (exitGapsSeconds < 2.0 && exitGapsSeconds > -3.0) {
      exitSlotVerdict = "TRAFFIC_COMPRESSION";
      rationale = `WARNING: Rejoining directly inside traffic pack (rejoin gap: ${exitGapsSeconds.toFixed(1)}s). Expect aero wash.`;
    } else if (exitGapsSeconds <= -3.0) {
      exitSlotVerdict = "UNDERCUT_BLOCKED";
      rationale = `CAUTION: Pit stop drops car behind the traffic queue (rejoin gap: ${exitGapsSeconds.toFixed(1)}s).`;
    }

    return {
      stationaryFuelingTimeSec: Number(fuelingTime.toFixed(1)),
      stationaryTotalTimeSec: Number(stationaryTime.toFixed(1)),
      totalTimeLossSec: Number(totalTimeLoss.toFixed(1)),
      rejoinGapSec: Number(exitGapsSeconds.toFixed(1)),
      exitSlotVerdict,
      rationale
    };
  }
}

module.exports = new PitStopRuntime();
