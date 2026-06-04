/**
 * analyticalWorker.js — Isolated Analytical Worker Thread
 *
 * Runs stability predictions, strategy trees, and mathematical models in a secondary
 * worker thread. Keeps the primary thread free of GC pauses.
 */

const { parentPort } = require("worker_threads");

// Direct port of predictNextTickInstability to avoid import path complexities
function predictNextTickInstability(current, previous, hz = 60) {
  const dt = 1 / hz;

  // 1. Calculate Yaw Acceleration
  const yawAccel = (current.yawRate - previous.yawRate) / dt;

  // 2. Calculate Steering Input Velocity
  const steerVel = (current.steeringWheelAngle - previous.steeringWheelAngle) / dt;

  // 3. Calculate Brake Pressure Gradient
  const brakeGradient = (current.brake - previous.brake) / dt;

  // 4. Calculate Throttle Gradient
  const throttleGradient = (current.throttle - previous.throttle) / dt;

  // 5. Vertical Aero Pitch Compression rate
  const pitchVelocity = (current.pitch - previous.pitch) / dt;

  // Weights
  let steeringRisk = 0;
  let yawRisk = 0;
  let aeroRisk = 0;
  let ERSOverloadRisk = 0;
  let throttleOscillationRisk = 0;

  // Countersteering Slide catch
  const isCorrectingSlide =
    Math.sign(steerVel) !== Math.sign(current.yawRate) && Math.abs(current.yawRate) > 0.25;
  if (isCorrectingSlide && Math.abs(steerVel) > 1.8) {
    steeringRisk = Math.min(1.0, (Math.abs(steerVel) - 1.8) * 0.35 + 0.5);
  }

  // Yaw Acceleration
  if (Math.abs(yawAccel) > 1.5) {
    yawRisk = Math.min(1.0, (Math.abs(yawAccel) - 1.5) * 0.4 + 0.4);
  }

  // Splitter/diffuser bottoming stall
  if (current.pitch < -0.014 && pitchVelocity < -0.05 && current.speedMps > 35) {
    aeroRisk = Math.min(1.0, Math.abs(pitchVelocity) * 4.0 + 0.3);
  }

  // ERS / Traction slip
  if (current.mgukDeploykW && current.mgukDeploykW > 90.0 && current.throttle > 0.8) {
    if (current.rearRightSpeedMps && current.rearLeftSpeedMps) {
      const avgRearSpeed = (current.rearRightSpeedMps + current.rearLeftSpeedMps) / 2;
      const mismatch = Math.abs(avgRearSpeed - current.speedMps) / Math.max(1, current.speedMps);
      if (mismatch > 0.07) {
        ERSOverloadRisk = Math.min(1.0, (mismatch - 0.07) * 5.0 + 0.4);
      }
    }
  }

  // Throttle oscillation under load
  if (Math.abs(current.yawRate) > 0.15 && current.throttle > 0.3) {
    const isOscillating =
      Math.sign(throttleGradient) !== Math.sign(current.throttle - previous.throttle);
    if (isOscillating && Math.abs(throttleGradient) > 4.0) {
      throttleOscillationRisk = 0.55;
    }
  }

  const maxProbability = Math.max(
    steeringRisk,
    yawRisk,
    aeroRisk,
    ERSOverloadRisk,
    throttleOscillationRisk,
  );

  let primaryTrigger = "NONE";
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

// Strategy Tree Evaluation
function evaluateStrategyTree(tireGripPct, fuelLapsRemaining, trafficGapSec, currentObjectiveMode) {
  const isTireCliffClose = tireGripPct < 75.0;
  const isFuelLimitClose = fuelLapsRemaining < 2.0;
  const isTrafficClear = trafficGapSec > 2.5;

  if (isFuelLimitClose) {
    return {
      nodeId: "NODE_FUEL_CRITICAL",
      conditionMet: `Fuel reserves exhausted (${fuelLapsRemaining.toFixed(1)} laps remaining).`,
      recommendedAction: "BOX_THIS_LAP",
      probabilityWeightPct: 100,
      alternativeBranchName: "Combustion starvation recovery",
      alternativeBranchNarrative:
        "Fuel exhaustion renders stint extension non-viable. Pit immediately.",
    };
  }

  if (isTireCliffClose) {
    if (isTrafficClear) {
      return {
        nodeId: "NODE_TIRE_CLIFF_UNDERCUT",
        conditionMet: `Tire grip degraded below optimal limits (${tireGripPct.toFixed(1)}%) while pit exit window is clear (gap: ${trafficGapSec.toFixed(1)}s).`,
        recommendedAction: "BOX_THIS_LAP",
        probabilityWeightPct: 88,
        alternativeBranchName: "Extend stint for overcut",
        alternativeBranchNarrative:
          "Extending stint runs worn tires into cumulative pace losses, risking sector time decay.",
      };
    } else {
      return {
        nodeId: "NODE_TIRE_CLIFF_TRAFFIC_BLOCK",
        conditionMet: `Tire grip degraded (${tireGripPct.toFixed(1)}%) but pit exit is blocked by a traffic queue (gap: ${trafficGapSec.toFixed(1)}s).`,
        recommendedAction: "FUEL_SAVE_LIFT",
        probabilityWeightPct: 76,
        alternativeBranchName: "Immediate pit release",
        alternativeBranchNarrative:
          "Pitting now exits directly behind slower GT cars, block-stalling downforce flow.",
      };
    }
  }

  if (currentObjectiveMode === "SAFETY_CAR") {
    return {
      nodeId: "NODE_SAFETY_CAR_PACE",
      conditionMet: "Safety Car pacing limits active.",
      recommendedAction: "SAFETY_CAR_STANDBY",
      probabilityWeightPct: 95,
      alternativeBranchName: "Pre-emptive cheap pitstop",
      alternativeBranchNarrative:
        "Box now to acquire fresh compound vectors under low time-loss penalty.",
    };
  }

  if (currentObjectiveMode === "FUEL_SAVE") {
    return {
      nodeId: "NODE_FUEL_SAVE_ACTIVE",
      conditionMet: "Strategic lift-and-coast fuel economy active.",
      recommendedAction: "FUEL_SAVE_LIFT",
      probabilityWeightPct: 90,
      alternativeBranchName: "Qualifying Pace Attack",
      alternativeBranchNarrative:
        "Toggling to attack consumes fuel reserves rapidly, shortening stint limits by -3 laps.",
    };
  }

  return {
    nodeId: "NODE_STANDARD_PACE",
    conditionMet: "Chassis and fuel parameters within optimal margins.",
    recommendedAction: "PUSH_LAP_ATTACK",
    probabilityWeightPct: 85,
    alternativeBranchName: "Early strategy window",
    alternativeBranchNarrative:
      "Pitting now triggers an early undercut, but pushes subsequent tyre wear limits.",
  };
}

// Thread-safe Message Processing
parentPort.on("message", (msg) => {
  try {
    const { type, payload } = msg;

    if (type === "PROCESS_TICK") {
      const { current, previous, hz } = payload;
      const prediction = predictNextTickInstability(current, previous, hz);
      parentPort.postMessage({
        type: "PREDICTION_RESULT",
        payload: { tick: current.tick, prediction },
      });
    } else if (type === "EVALUATE_STRATEGY") {
      const { tireGripPct, fuelLapsRemaining, trafficGapSec, currentObjectiveMode } = payload;
      const strategy = evaluateStrategyTree(
        tireGripPct,
        fuelLapsRemaining,
        trafficGapSec,
        currentObjectiveMode,
      );
      parentPort.postMessage({
        type: "STRATEGY_RESULT",
        payload: { strategy },
      });
    }
  } catch (err) {
    parentPort.postMessage({
      type: "ERROR",
      payload: { message: err.message },
    });
  }
});
