/**
 * cornerBehavior.ts — Sector-Slicing Corner Behavior Analyst
 *
 * Slices high-frequency telemetry traces by corner segments (Entry, Apex, Exit)
 * and runs sub-analyzers (Brake, Throttle, Steering) on those localized segments.
 */

import { analyzeBrakeSignature, type BrakeSignatureMetrics } from "./brakeSignature";
import { analyzeThrottleSignature, type ThrottleSignatureMetrics } from "./throttleRelease";
import { analyzeSteeringSignature, type SteeringSignatureMetrics } from "./steeringAggression";

export interface CornerBehaviorMetrics {
  cornerNumber: number;
  entrySpeedMps: number;
  apexSpeedMps: number;
  exitSpeedMps: number;
  brakeSignature: BrakeSignatureMetrics;
  throttleSignature: ThrottleSignatureMetrics;
  steeringSignature: SteeringSignatureMetrics;
}

/**
 * Analyzes driver inputs and telemetry profiles for a single specific corner window.
 * @param cornerNumber track sector corner index (e.g. 8)
 * @param startTick start of deceleration/entry zone in lap trace
 * @param apexTick mid-corner speed minimum point
 * @param endTick exit straightaway acceleration point
 * @param channels reference dictionary containing raw telemetry arrays
 */
export function analyzeCornerBehavior(
  cornerNumber: number,
  startTick: number,
  apexTick: number,
  endTick: number,
  channels: Record<string, number[]>,
): CornerBehaviorMetrics {
  const speed = channels["Speed"] || [];
  const brake = channels["Brake"] || [];
  const throttle = channels["Throttle"] || [];
  const steer = channels["SteeringWheelAngle"] || [];
  const lfSpeed = channels["LFspeed"] || [];
  const lrSpeed = channels["LRspeed"] || [];

  // Slice segment slices
  const sliceBrake = brake.slice(startTick, endTick);
  const sliceSpeed = speed.slice(startTick, endTick);
  const sliceSteer = steer.slice(startTick, endTick);
  const sliceThrottle = throttle.slice(startTick, endTick);

  // Mismatch calculations for wheel slip (mismatch ratio between driven speeds and ground velocity)
  const wheelSlip: number[] = [];
  const rearSlip: number[] = [];
  for (let i = startTick; i < endTick; i++) {
    const spd = speed[i] || 1;
    const lf = lfSpeed[i] || 0;
    const lr = lrSpeed[i] || 0;

    // Front slip (locking indicator)
    const frontMismatch = Math.abs(spd - lf) / spd;
    wheelSlip.push(frontMismatch);

    // Rear driven wheel slip (traction indicator)
    const rearMismatch = Math.abs(spd - lr) / spd;
    rearSlip.push(rearMismatch);
  }

  // Calculate entry, apex, and exit speeds
  const entrySpeed = speed[startTick] || 0;
  const apexSpeed = speed[apexTick] || 0;
  const exitSpeed = speed[endTick - 1] || 0;

  // Run specialized input analyzers on sliced segment tracks
  const brakeMetrics = analyzeBrakeSignature(sliceBrake, sliceSpeed, sliceSteer, wheelSlip);
  const throttleMetrics = analyzeThrottleSignature(sliceThrottle, sliceBrake, rearSlip);
  const steeringMetrics = analyzeSteeringSignature(sliceSteer);

  return {
    cornerNumber,
    entrySpeedMps: parseFloat(entrySpeed.toFixed(2)),
    apexSpeedMps: parseFloat(apexSpeed.toFixed(2)),
    exitSpeedMps: parseFloat(exitSpeed.toFixed(2)),
    brakeSignature: brakeMetrics,
    throttleSignature: throttleMetrics,
    steeringSignature: steeringMetrics,
  };
}
