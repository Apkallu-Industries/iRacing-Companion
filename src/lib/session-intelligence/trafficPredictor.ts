/**
 * trafficPredictor.ts — Multiclass Traffic Intersection & Pass Planner
 *
 * Forecasts Closing closing speeds, GT class intersection points, dirty air
 * wake wash duration sweeps, and hybrid ERS straightaway passing overrides.
 */

export interface TrafficIntersection {
  leadingCarClass: "GT3" | "LMP2" | "GTP_HYBRID";
  leadingCarNumber: string;
  distanceAheadM: number;
  closingSpeedMps: number; // Speed delta (closing speed)
  estimatedIntersectionSec: number; // Time to intercept (seconds)
  catchCornerNumber: number; // Corner number where overtake will occur
  dirtyAirWashExposureSec: number; // estimated downforce loss duration
  passErsMapRecommendation: string;
}

/**
 * Predicts catch points and energy overrides for traffic intersections.
 * @param speedMps current prototype speed
 * @param gapAheadSec time gap to leading vehicle class
 * @param trackPosPct current track position percentage (0.0 to 100.0)
 * @param trackLengthM track length in meters
 */
export function forecastTrafficIntersections(
  speedMps: number,
  gapAheadSec: number,
  trackPosPct: number,
  trackLengthM = 7004, // Spa default
): TrafficIntersection[] {
  if (gapAheadSec <= 0 || gapAheadSec > 25.0) {
    return [];
  }

  // GT3 vehicles typically move ~25 m/s slower than GTP prototypes at Spa
  const closingSpeed = 25.0; // m/s speed delta
  const distanceAhead = gapAheadSec * (speedMps - closingSpeed);

  // Time to intercept
  const interceptSec = distanceAhead / closingSpeed;

  // Predict catch corner index based on distance and average corner sectors at Spa
  // Spa corners are spaced roughly 400m to 600m.
  const distanceCovered = speedMps * interceptSec;
  const currentPosM = (trackPosPct / 100) * trackLengthM;
  const interceptPosM = (currentPosM + distanceCovered) % trackLengthM;

  // Simple segment sector map for Spa corners
  // Map interceptPosM to corner number
  let catchCorner = 8;
  if (interceptPosM < 1000) {
    catchCorner = 1; // La Source
  } else if (interceptPosM < 2200) {
    catchCorner = 3; // Eau Rouge / Raidillon straight
  } else if (interceptPosM < 3200) {
    catchCorner = 5; // Les Combes
  } else if (interceptPosM < 4200) {
    catchCorner = 8; // Bruxelles
  } else if (interceptPosM < 5500) {
    catchCorner = 15; // Stavelot
  } else {
    catchCorner = 19; // Bus Stop chicane
  }

  // Estimate downforce loss wash exposure duration
  // Slow corners (Bruxelles, Bus Stop) increase wake exposure duration
  const isSlowCorner = catchCorner === 1 || catchCorner === 8 || catchCorner === 19;
  const washExposure = isSlowCorner ? 4.5 : 1.8;

  // Expose hybrid pass recommendations
  let passAdvice = "Maintain standard straightaway ERS harvesting.";
  if (catchCorner === 3 || catchCorner === 15) {
    passAdvice =
      "High-speed sector pass. Trigger ERS Boost map on exit corner to secure straightaway overtake before turn entry.";
  } else if (isSlowCorner) {
    passAdvice =
      "Slow-speed entry pack. Defer overtake. Harvest hybrid SoC reserves in corner entry, prepare exit straight sweep.";
  }

  return [
    {
      leadingCarClass: "GT3",
      leadingCarNumber: "#92",
      distanceAheadM: parseFloat(distanceAhead.toFixed(0)),
      closingSpeedMps: closingSpeed,
      estimatedIntersectionSec: parseFloat(interceptSec.toFixed(1)),
      catchCornerNumber: catchCorner,
      dirtyAirWashExposureSec: washExposure,
      passErsMapRecommendation: passAdvice,
    },
  ];
}
