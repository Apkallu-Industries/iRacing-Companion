/**
 * driverSwapContinuity.js — Driver Swap Continuity & Adaptation Window Layer
 *
 * Detects driver swaps in multi-hour stints, initializes a 3-lap Adaptation Window,
 * and measures incoming driver braking bite variations and steering jitters.
 */

class DriverSwapContinuity {
  constructor() {
    this.activeDriverName = null;
    this.adaptationActive = false;
    this.adaptationStartLap = 0;
    this.adaptationLapsDuration = 3;

    // Baseline comparisons
    this.avgBrakeBite = 0.0;
    this.avgSteerJitter = 0.0;
    this.adaptationReport = null;
  }

  /**
   * Tracks and evaluates driver changes and adaptation windows.
   * @param {object} t live mapped telemetry frame
   * @param {number} lapNumber current lap index
   * @returns {object|null} adaptation report if active
   */
  detectSwapAndTrackAdaptation(t, lapNumber) {
    if (!t || !t.driver) return null;

    const incomingDriver = t.driver || "unknown";

    // 1. Detect active driver swap event
    if (this.activeDriverName && this.activeDriverName !== incomingDriver) {
      console.log(`[swap-continuity] Driver Swap detected! ${this.activeDriverName} → ${incomingDriver}`);
      this.adaptationActive = true;
      this.adaptationStartLap = lapNumber;
      
      // Seed initial mismatch benchmarks
      this.avgBrakeBite = t.brake || 0;
      this.avgSteerJitter = Math.abs(t.steeringDeg || 0);

      this.adaptationReport = {
        event: "DRIVER_SWAP_INITIATED",
        outgoingDriver: this.activeDriverName,
        incomingDriver: incomingDriver,
        adaptationStartLap: lapNumber,
        brakeBiteMismatchPct: 0,
        steeringJitterMismatchPct: 0,
        tireThermalGradientDelta: 0
      };
    }

    this.activeDriverName = incomingDriver;

    // 2. Track adaptation parameters during the 3-lap window
    if (this.adaptationActive) {
      const elapsedLaps = lapNumber - this.adaptationStartLap;
      if (elapsedLaps >= this.adaptationLapsDuration) {
        // Adaptation window completed
        this.adaptationActive = false;
        console.log(`[swap-continuity] Driver Adaptation window completed for ${incomingDriver}.`);
        return {
          event: "DRIVER_ADAPTATION_COMPLETED",
          driver: incomingDriver,
          ...this.adaptationReport
        };
      }

      // Calculate style variations
      const currentBrake = t.brake || 0;
      const currentSteer = Math.abs(t.steeringDeg || 0);

      const brakeMismatch = Math.max(0, Math.round(Math.abs(currentBrake - this.avgBrakeBite) * 100));
      const steerJitter = Math.max(0, Math.round(Math.abs(currentSteer - this.avgSteerJitter) * 12));

      this.adaptationReport = {
        event: "DRIVER_ADAPTATION_ACTIVE",
        incomingDriver: incomingDriver,
        currentLapInWindow: elapsedLaps + 1,
        brakeBiteMismatchPct: Math.min(100, brakeMismatch),
        steeringJitterMismatchPct: Math.min(100, steerJitter),
        tireThermalGradientDelta: t.tires?.rl?.tempC > 95 ? 12 : 2
      };

      return this.adaptationReport;
    }

    return null;
  }

  getActiveDriver() {
    return this.activeDriverName;
  }

  isAdaptationActive() {
    return this.adaptationActive;
  }
}

module.exports = new DriverSwapContinuity();
