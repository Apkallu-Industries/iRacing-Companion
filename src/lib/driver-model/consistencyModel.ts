/**
 * consistencyModel.ts — Driver Pace and Input Consistency Modeling
 *
 * Computes statistical standard deviations across multiple laps or sector segments.
 * Translates input variance into an overall Consistency Percentage (0 - 100).
 */

export interface DriverConsistencyMetrics {
  lapTimeStandardDeviationSec: number;
  apexSpeedStdDevMps: number;
  brakeMarkersVarianceMeters: number; // Variance in initial braking points (meters)
  throttleApplyVariancePct: number; // Variance in exit throttle application point
  overallConsistencyScore: number; // Consolidated score (0 - 100%)
}

/**
 * Calculates standard deviation of a number array.
 */
function calculateStdDev(arr: number[]): number {
  if (arr.length <= 1) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

/**
 * Resolves consistency metrics across historical laps.
 */
export function analyzeDriverConsistency(
  lapTimes: number[],
  apexSpeeds: number[][], // apex speeds for each corner across multiple laps
  brakingPointsDist: number[][], // braking distances from entry for each corner across laps
  throttleLapsPoint: number[][], // throttle application percentages (or location deltas)
): DriverConsistencyMetrics {
  if (lapTimes.length <= 1) {
    return {
      lapTimeStandardDeviationSec: 0,
      apexSpeedStdDevMps: 0,
      brakeMarkersVarianceMeters: 0,
      throttleApplyVariancePct: 0,
      overallConsistencyScore: 100,
    };
  }

  // Lap time std dev
  const lapTimeStdDev = calculateStdDev(lapTimes);

  // Apex speeds average std dev across all analyzed corners
  let totalSpeedStdDev = 0;
  let speedCornerCount = 0;
  for (const cornerSpeeds of apexSpeeds) {
    if (cornerSpeeds.length > 1) {
      totalSpeedStdDev += calculateStdDev(cornerSpeeds);
      speedCornerCount++;
    }
  }
  const avgApexSpeedStdDev = speedCornerCount > 0 ? totalSpeedStdDev / speedCornerCount : 0;

  // Braking point variance (in meters estimation)
  let totalBrakeStdDev = 0;
  let brakeCornerCount = 0;
  for (const cornerBrakes of brakingPointsDist) {
    if (cornerBrakes.length > 1) {
      totalBrakeStdDev += calculateStdDev(cornerBrakes);
      brakeCornerCount++;
    }
  }
  const avgBrakeStdDev = brakeCornerCount > 0 ? totalBrakeStdDev / brakeCornerCount : 0;

  // Throttle application point variance (standard deviation in percentages or positions)
  let totalThrottleStdDev = 0;
  let throttleCornerCount = 0;
  for (const cornerThrottles of throttleLapsPoint) {
    if (cornerThrottles.length > 1) {
      totalThrottleStdDev += calculateStdDev(cornerThrottles);
      throttleCornerCount++;
    }
  }
  const avgThrottleStdDev = throttleCornerCount > 0 ? totalThrottleStdDev / throttleCornerCount : 0;

  // Consolidate into overall Consistency Score (0 - 100%)
  // Pro motorsport target: standard deviation in lap time < 0.15s, apex speeds < 0.8 m/s, braking points < 1.5m.
  const lapWeight = Math.max(0, 100 - (lapTimeStdDev / 0.15) * 15);
  const speedWeight = Math.max(0, 100 - (avgApexSpeedStdDev / 0.8) * 10);
  const brakeWeight = Math.max(0, 100 - (avgBrakeStdDev / 1.5) * 10);
  const throttleWeight = Math.max(0, 100 - (avgThrottleStdDev / 5) * 5);

  const combinedScore =
    lapWeight * 0.4 + speedWeight * 0.2 + brakeWeight * 0.2 + throttleWeight * 0.2;

  return {
    lapTimeStandardDeviationSec: parseFloat(lapTimeStdDev.toFixed(3)),
    apexSpeedStdDevMps: parseFloat(avgApexSpeedStdDev.toFixed(2)),
    brakeMarkersVarianceMeters: parseFloat(avgBrakeStdDev.toFixed(2)),
    throttleApplyVariancePct: parseFloat(avgThrottleStdDev.toFixed(2)),
    overallConsistencyScore: parseFloat(Math.min(100, Math.max(0, combinedScore)).toFixed(1)),
  };
}
