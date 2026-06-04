/**
 * predictiveEngine.ts — High-Frequency Predictive Instability Engine
 *
 * Models and predicts impending chassis lateral or longitudinal instability
 * 0.5s to 1.0s prior to severe threshold breaches in iRacing telemetry.
 */

export interface TelemetryTickFrame {
  tick: number;
  speedMps: number;
  brake: number; // 0.0 to 1.0
  throttle: number; // 0.0 to 1.0
  steeringWheelAngle: number; // radians
  yawRate: number; // radians/sec
  pitch: number; // radians
  roll: number; // radians
  mgukDeploykW?: number;
  frontLeftDeflection?: number; // mm
  rearRightSpeedMps?: number;
  rearLeftSpeedMps?: number;
}

export interface InstabilityPrediction {
  isRiskHigh: boolean;
  instabilityProbability: number; // 0.0 to 1.0
  predictionHorizonSec: number; // estimated time before stability breach (e.g. 0.8s)
  primaryTriggerFactor:
    | "STEERING_CORRECTION"
    | "YAW_ACCELERATION_SPIKE"
    | "AERO_PLATFORM_STALL"
    | "ERS_TORQUE_OVERLOAD"
    | "THROTTLE_OSCILLATION"
    | "NONE";
  recommendedCorrection: string;
}

/**
 * Predicts stability breach risks using high-frequency derivative signals.
 */
export function predictNextTickInstability(
  current: TelemetryTickFrame,
  previous: TelemetryTickFrame,
  hz = 60,
): InstabilityPrediction {
  const dt = 1 / hz;

  // 1. Calculate Yaw Acceleration (First derivative of YawRate)
  const yawAccel = (current.yawRate - previous.yawRate) / dt;

  // 2. Calculate Steering Input Velocity (First derivative of Steering angle)
  const steerVel = (current.steeringWheelAngle - previous.steeringWheelAngle) / dt;

  // 3. Calculate Brake Pressure Gradient
  const brakeGradient = (current.brake - previous.brake) / dt;

  // 4. Calculate Throttle Gradient
  const throttleGradient = (current.throttle - previous.throttle) / dt;

  // 5. Vertical Aero Pitch Compression rate
  const pitchVelocity = (current.pitch - previous.pitch) / dt;

  // Initialize weights
  let steeringRisk = 0;
  let yawRisk = 0;
  let aeroRisk = 0;
  let ERSOverloadRisk = 0;
  let throttleOscillationRisk = 0;

  // Trigger A: High steer velocity opposite to high yaw rate (driver trying to catch a slide!)
  const isCorrectingSlide =
    Math.sign(steerVel) !== Math.sign(current.yawRate) && Math.abs(current.yawRate) > 0.25;
  if (isCorrectingSlide && Math.abs(steerVel) > 1.8) {
    // Very rapid countersteering correction
    steeringRisk = Math.min(1.0, (Math.abs(steerVel) - 1.8) * 0.35 + 0.5);
  }

  // Trigger B: Rapid angular yaw acceleration spike
  if (Math.abs(yawAccel) > 1.5) {
    // yaw rate changing faster than 85 deg/sec^2
    yawRisk = Math.min(1.0, (Math.abs(yawAccel) - 1.5) * 0.4 + 0.4);
  }

  // Trigger C: Aero Pitch ground collapse (splitter bottoming, stalling diffuser flow)
  // pitch rate plunging forward under high speed (Aerodynamic vacuum seal danger zone)
  if (current.pitch < -0.014 && pitchVelocity < -0.05 && current.speedMps > 35) {
    aeroRisk = Math.min(1.0, Math.abs(pitchVelocity) * 4.0 + 0.3);
  }

  // Trigger D: Hybrid ERS deployment surge on slippery exits
  if (current.mgukDeploykW && current.mgukDeploykW > 90.0 && current.throttle > 0.8) {
    // Check if driven wheels are slipping
    if (current.rearRightSpeedMps && current.rearLeftSpeedMps) {
      const avgRearSpeed = (current.rearRightSpeedMps + current.rearLeftSpeedMps) / 2;
      const mismatch = Math.abs(avgRearSpeed - current.speedMps) / Math.max(1, current.speedMps);
      if (mismatch > 0.07) {
        ERSOverloadRisk = Math.min(1.0, (mismatch - 0.07) * 5.0 + 0.4);
      }
    }
  }

  // Trigger E: Oscillating exit throttle under lateral yaw loads
  if (Math.abs(current.yawRate) > 0.15 && current.throttle > 0.3) {
    const isOscillating =
      Math.sign(throttleGradient) !== Math.sign(current.throttle - previous.throttle);
    if (isOscillating && Math.abs(throttleGradient) > 4.0) {
      throttleOscillationRisk = 0.55;
    }
  }

  // Consolidate probabilities
  const maxProbability = Math.max(
    steeringRisk,
    yawRisk,
    aeroRisk,
    ERSOverloadRisk,
    throttleOscillationRisk,
  );

  let primaryTrigger: InstabilityPrediction["primaryTriggerFactor"] = "NONE";
  let recommendedCorrection =
    "No platform stability warnings active. Maintain current vector line.";

  if (maxProbability > 0) {
    if (maxProbability === steeringRisk) {
      primaryTrigger = "STEERING_CORRECTION";
      recommendedCorrection =
        "Chassis sliding lateral vector limit. Smoothly release steering lock toward exit apex.";
    } else if (maxProbability === yawRisk) {
      primaryTrigger = "YAW_ACCELERATION_SPIKE";
      recommendedCorrection =
        "Transient yaw acceleration spike detected. Ease exit throttle sweep by -10% to restore tire carcass contact.";
    } else if (maxProbability === aeroRisk) {
      primaryTrigger = "AERO_PLATFORM_STALL";
      recommendedCorrection =
        "Diffuser splitters grounding limit. Increase mechanical packer heights or slow initial braking load transfers.";
    } else if (maxProbability === ERSOverloadRisk) {
      primaryTrigger = "ERS_TORQUE_OVERLOAD";
      recommendedCorrection =
        "MGU-K deployment oversaturating exit traction footprint. Shift ERS maps down or engage higher gear vector.";
    } else if (maxProbability === throttleOscillationRisk) {
      primaryTrigger = "THROTTLE_OSCILLATION";
      recommendedCorrection =
        "Throttle exit hunting detected. Stabilize pedal pressure, avoid rapid on-off cycles under lateral load.";
    }
  }

  return {
    isRiskHigh: maxProbability >= 0.7,
    instabilityProbability: parseFloat(maxProbability.toFixed(2)),
    predictionHorizonSec:
      maxProbability >= 0.7 ? parseFloat((0.8 - (maxProbability - 0.7) * 0.4).toFixed(2)) : 0,
    primaryTriggerFactor: primaryTrigger,
    recommendedCorrection,
  };
}
