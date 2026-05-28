/**
 * telemetryService.js — Isolated Telemetry Stream Service Layer
 *
 * Coordinates live iRacing telemetry acquisition, stream buffering,
 * and high-frequency delta compression updates.
 */

class TelemetryService {
  constructor() {
    this.latestFrame = null;
    this.buffer = [];
    this.subscribers = new Set();
  }

  processTelemetryTick(rawTick) {
    if (!rawTick) return;

    // Standardize metrics matching Pit Wall schema
    const frame = {
      tick: rawTick.Tick || Date.now(),
      speedMps: rawTick.Speed || 0,
      brake: rawTick.Brake || 0,
      throttle: rawTick.Throttle || 0,
      steeringWheelAngle: rawTick.SteeringWheelAngle || 0,
      yawRate: rawTick.YawRate || 0,
      pitch: rawTick.Pitch || 0,
      roll: rawTick.Roll || 0,
      mgukDeploykW: rawTick.MgukDeploykW || 0,
      frontLeftDeflection: rawTick.ShockDeflectionFL || 0,
      rearRightSpeedMps: rawTick.RRspeed || 0,
      rearLeftSpeedMps: rawTick.LRspeed || 0,
      timestamp: Date.now()
    };

    this.latestFrame = frame;
    this.buffer.push(frame);

    // Limit sliding buffer to 5000 frames to protect memory footprints
    if (this.buffer.length > 5000) {
      this.buffer.shift();
    }

    // Broadcast to subscribers
    for (const sub of this.subscribers) {
      sub(frame);
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  getLatestFrame() {
    return this.latestFrame;
  }

  clearBuffer() {
    this.buffer = [];
  }
}

module.exports = new TelemetryService();
