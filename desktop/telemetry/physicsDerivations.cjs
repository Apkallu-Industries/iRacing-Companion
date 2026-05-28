/**
 * Pit Wall Physics Derivations Engine
 *
 * Stateless utility to compute higher-order derived physical states
 * (understeer index, oversteer index, input gradients, dynamic slip, steering velocity)
 * using strict, versioned TelemetryValue metadata contracts.
 */

const { resolveVehicleProfile } = require("./vehicleProfiles.cjs");

/**
 * Creates a standard TelemetryValue wrapper for derived channels.
 */
function derivedVal(value, confidence, source, derivedFrom, origin = "iRacing", tickSource = 0, latency = 0) {
  const freshness = typeof latency === "number" && latency >= 0 ? latency : 0;
  
  // Temporal Confidence Decay:
  // If packet freshness stalls (>100ms), decay derived confidence exponentially.
  let decayedConfidence = confidence;
  if (freshness > 100) {
    decayedConfidence = confidence * Math.max(0, 1 - (freshness - 100) / 1000);
  }

  return {
    value: Number(value.toFixed(6)),
    confidence: Number(decayedConfidence.toFixed(4)),
    source: source || "derived",
    freshnessMs: freshness,
    provenance: {
      derivedFrom: derivedFrom || [],
      simSource: null,
      origin: origin || "iRacing",
      tickSource: typeof tickSource === "number" ? tickSource : 0,
      latency: freshness
    }
  };
}

/**
 * Computes derived physics properties by comparing the current frame
 * with the previous frame or sliding window history, dynamically reading
 * class profile parameters and physical boundaries.
 *
 * @param {object} current Normalized CoreTelemetryV1 frame
 * @param {object|null} prev Previous normalized telemetry frame
 * @param {object|null} rawOriginal Original raw packet (for accessing raw sensors)
 * @param {object|null} vehicleProfile Dynamic vehicle class profile configuration
 * @returns {object} Derived channels map of TelemetryValue structures
 */
function derivePhysicsChannels(current, prev, rawOriginal = {}, vehicleProfile = null) {
  const dt = prev ? (current.timestamp.value - prev.timestamp.value) / 1000 : 0.016; // seconds
  const safeDt = dt > 0.001 ? dt : 0.016;

  // Extract raw provenance attributes from normalized measured telemetry
  const origin = current.timestamp.provenance?.origin || "iRacing";
  const tickSource = current.frameNumber.value || 0;
  const latency = current.timestamp.provenance?.latency || 0;

  // Resolve active vehicle dynamic profile if not supplied
  const profile = vehicleProfile || resolveVehicleProfile(rawOriginal?.car ?? rawOriginal?.Car ?? "default");
  const wheelbase = profile.wheelbase;

  // 1. Steering Velocity (rad/s)
  const steeringCurr = current.car.inputs.steering.value;
  const steeringPrev = prev ? prev.car.inputs.steering.value : steeringCurr;
  const steeringVelocityVal = (steeringCurr - steeringPrev) / safeDt;
  
  // Confidence decays if frame interval jitter is extremely high
  let steeringVelocityConfidence = 0.95;
  if (dt > 0.050) steeringVelocityConfidence = 0.70; // high jitter penalty

  const steeringVelocity = derivedVal(
    steeringVelocityVal, 
    steeringVelocityConfidence, 
    "derived", 
    ["inputs.steering"],
    origin,
    tickSource,
    latency
  );

  // 2. Input Aggression Gradients
  const throttleCurr = current.car.inputs.throttle.value;
  const throttlePrev = prev ? prev.car.inputs.throttle.value : throttleCurr;
  const throttleGradientVal = (throttleCurr - throttlePrev) / safeDt;
  const throttleGradient = derivedVal(
    throttleGradientVal, 
    0.95, 
    "derived", 
    ["inputs.throttle"],
    origin,
    tickSource,
    latency
  );

  const brakeCurr = current.car.inputs.brake.value;
  const brakePrev = prev ? prev.car.inputs.brake.value : brakeCurr;
  const brakeGradientVal = (brakeCurr - brakePrev) / safeDt;
  const brakeGradient = derivedVal(
    brakeGradientVal, 
    0.95, 
    "derived", 
    ["inputs.brake"],
    origin,
    tickSource,
    latency
  );

  // 3. Actual Yaw Rate (rad/s)
  let actualYawRateVal = 0;
  let actualYawRateConfidence = 1.0;
  let yawSource = "measured";

  if (typeof rawOriginal.YawRate === "number") {
    actualYawRateVal = rawOriginal.YawRate;
    actualYawRateConfidence = 1.0; // direct sim measurement
    yawSource = "measured";
  } else if (prev && typeof rawOriginal.Yaw === "number" && typeof prev._rawYaw === "number") {
    let deltaYaw = rawOriginal.Yaw - prev._rawYaw;
    while (deltaYaw < -Math.PI) deltaYaw += Math.PI * 2;
    while (deltaYaw > Math.PI) deltaYaw -= Math.PI * 2;
    actualYawRateVal = deltaYaw / safeDt;
    actualYawRateConfidence = 0.85; // mathematically estimated
    yawSource = "derived";
  }

  // Temporal Confidence Decay for actual yaw rate
  let decayedYawConfidence = actualYawRateConfidence;
  if (latency > 100) {
    decayedYawConfidence = actualYawRateConfidence * Math.max(0, 1 - (latency - 100) / 1000);
  }

  const actualYawRate = {
    value: Number(actualYawRateVal.toFixed(6)),
    confidence: Number(decayedYawConfidence.toFixed(4)),
    source: yawSource,
    freshnessMs: latency,
    provenance: {
      derivedFrom: yawSource === "derived" ? ["Yaw"] : null,
      simSource: yawSource === "measured" ? "YawRate" : "Yaw",
      origin: origin,
      tickSource: tickSource,
      latency: latency
    }
  };

  // 4. Expected Yaw Rate (rad/s) based on Kinematic Bicycle Model
  const speed = current.car.speed.value;
  const expectedYawRateVal = speed > 2.0 
    ? (speed / wheelbase) * Math.tan(steeringCurr)
    : 0;

  // Kinematic model confidence decays at extremely low speed (friction/slip dominates)
  // or extremely high speed (where aerodynamic yaw slip angle dominates over pure kinematics)
  let expectedYawRateConfidence = 0.95;
  if (speed < 5.0) {
    expectedYawRateConfidence = Math.max(0.40, speed / 5.0 * 0.95);
  } else if (speed > 70.0) { // >250 km/h aero slip effects
    expectedYawRateConfidence = 0.80;
  }

  const expectedYawRate = derivedVal(
    expectedYawRateVal, 
    expectedYawRateConfidence, 
    "derived", 
    ["car.speed", "inputs.steering"],
    origin,
    tickSource,
    latency
  );

  // 5. Understeer & Oversteer Indices (Heuristics)
  let understeerIndexVal = 0;
  let oversteerIndexVal = 0;
  let heuristicConfidence = 0.90;

  if (speed > 5.0 && Math.abs(steeringCurr) > 0.02) {
    const signSteer = Math.sign(steeringCurr);
    const wExpSign = expectedYawRateVal;
    const wActSign = actualYawRateVal;

    const magExp = wExpSign * signSteer;
    const magAct = wActSign * signSteer;

    if (magExp > magAct) {
      understeerIndexVal = magExp - magAct;
    } else {
      oversteerIndexVal = magAct - magExp;
    }

    // Confidence penalties for small steering inputs where noise dominates
    if (Math.abs(steeringCurr) < 0.05) {
      heuristicConfidence = 0.60;
    }
  } else {
    // If steering or speed is below dynamic thresholds, index is inactive
    heuristicConfidence = 1.0; // fully confident in 0 index
  }

  const understeerIndex = derivedVal(
    understeerIndexVal, 
    heuristicConfidence, 
    "heuristic", 
    ["car.speed", "inputs.steering", "derived.actualYawRate"],
    origin,
    tickSource,
    latency
  );

  const oversteerIndex = derivedVal(
    oversteerIndexVal, 
    heuristicConfidence, 
    "heuristic", 
    ["car.speed", "inputs.steering", "derived.actualYawRate"],
    origin,
    tickSource,
    latency
  );

  // Preserve raw fields on the current frame object for the next delta tick
  current._rawYaw = typeof rawOriginal.Yaw === "number" ? rawOriginal.Yaw : 0;

  return {
    wheelbase: derivedVal(wheelbase, 1.0, "derived", [], origin, tickSource, latency),
    steeringVelocity,
    throttleGradient,
    brakeGradient,
    actualYawRate,
    expectedYawRate,
    understeerIndex,
    oversteerIndex
  };
}

module.exports = {
  derivePhysicsChannels,
  derivedVal
};
