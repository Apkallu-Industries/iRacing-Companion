/**
 * intelligenceService.js — Isolated Engineering Intelligence and Predictions Layer
 *
 * Runs driver signature updates, sector archetype learning, and predictive
 * stability calculations decoupled from iRacing SDK socket streams.
 */

const { predictNextTickInstability } = require("../../src/lib/session-intelligence/predictiveEngine");
const telemetryService = require("./telemetryService");

class IntelligenceService {
  constructor() {
    this.previousFrame = null;
    this.driverFingerprints = new Map();
  }

  evaluateFrameStability(currentFrame) {
    if (!currentFrame) return null;

    if (!this.previousFrame) {
      this.previousFrame = currentFrame;
      return null;
    }

    // Convert raw frame types matching our predictive engine schemas
    const currTick = {
      tick: currentFrame.tick,
      speedMps: currentFrame.speedMps,
      brake: currentFrame.brake,
      throttle: currentFrame.throttle,
      steeringWheelAngle: currentFrame.steeringWheelAngle,
      yawRate: currentFrame.yawRate,
      pitch: currentFrame.pitch,
      roll: currentFrame.roll,
      mgukDeploykW: currentFrame.mgukDeploykW,
      frontLeftDeflection: currentFrame.frontLeftDeflection,
      rearRightSpeedMps: currentFrame.rearRightSpeedMps,
      rearLeftSpeedMps: currentFrame.rearLeftSpeedMps
    };

    const prevTick = {
      tick: this.previousFrame.tick,
      speedMps: this.previousFrame.speedMps,
      brake: this.previousFrame.brake,
      throttle: this.previousFrame.throttle,
      steeringWheelAngle: this.previousFrame.steeringWheelAngle,
      yawRate: this.previousFrame.yawRate,
      pitch: this.previousFrame.pitch,
      roll: this.previousFrame.roll,
      mgukDeploykW: this.previousFrame.mgukDeploykW,
      frontLeftDeflection: this.previousFrame.frontLeftDeflection,
      rearRightSpeedMps: this.previousFrame.rearRightSpeedMps,
      rearLeftSpeedMps: this.previousFrame.rearLeftSpeedMps
    };

    const prediction = predictNextTickInstability(currTick, prevTick);

    this.previousFrame = currentFrame;
    return prediction;
  }

  registerDriverProfile(driverId, profile) {
    this.driverFingerprints.set(driverId, profile);
  }

  getDriverProfile(driverId) {
    return this.driverFingerprints.get(driverId) || null;
  }
}

module.exports = new IntelligenceService();
