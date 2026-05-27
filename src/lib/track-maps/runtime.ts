import type { TrackMapDefinition } from "./types";

export interface PreparedSpline {
  points: [number, number][];
  cumulativeLengths: number[];
  totalLength: number;
}

export interface PreparedTrackMap {
  trackId: string;
  displayName: string;
  mainSpline: PreparedSpline;
  sectors: TrackMapDefinition["sectors"];
  corners?: TrackMapDefinition["corners"];
  pitSpline?: PreparedSpline;
  mergePct?: number;
  exitPct?: number;
}

/**
 * Transforms a point [x, y] with rotation and horizontal mirroring around center (0.5, 0.5)
 */
function transformPoint(
  p: [number, number],
  rotationDeg = 0,
  mirrorX = false
): [number, number] {
  let x = p[0];
  let y = p[1];

  // 1. Mirror horizontally around 0.5
  if (mirrorX) {
    x = 1.0 - x;
  }

  // 2. Rotate around center (0.5, 0.5)
  if (rotationDeg !== 0) {
    const rad = (rotationDeg * Math.PI) / 180;
    const dx = x - 0.5;
    const dy = y - 0.5;
    const rx = dx * Math.cos(rad) - dy * Math.sin(rad);
    const ry = dx * Math.sin(rad) + dy * Math.cos(rad);
    x = rx + 0.5;
    y = ry + 0.5;
  }

  return [x, y];
}

/**
 * Computes segment lengths, cumulative perimeter spacing, and transforms coordinates
 */
export function prepareSpline(
  rawPoints: [number, number][],
  rotationDeg = 0,
  mirrorX = false
): PreparedSpline {
  if (!rawPoints || rawPoints.length === 0) {
    return { points: [], cumulativeLengths: [], totalLength: 0 };
  }

  // 1. Apply orientation transformations to points
  const points = rawPoints.map(p => transformPoint(p, rotationDeg, mirrorX));

  const n = points.length;
  const cumulativeLengths = new Array(n + 1);
  cumulativeLengths[0] = 0;

  // 2. Compute segment lengths and cumulative distances closed-loop
  let currentDist = 0;
  for (let i = 0; i < n; i++) {
    const p0 = points[i];
    const p1 = points[(i + 1) % n]; // Wraps to close the loop
    const dx = p1[0] - p0[0];
    const dy = p1[1] - p0[1];
    const segmentLength = Math.sqrt(dx * dx + dy * dy);
    
    currentDist += segmentLength;
    cumulativeLengths[i + 1] = currentDist;
  }

  return {
    points,
    cumulativeLengths,
    totalLength: currentDist,
  };
}

/**
 * Resolves a prepared track definition from static raw definition
 */
export function prepareTrackMap(def: TrackMapDefinition): PreparedTrackMap {
  const rotation = def.orientation?.rotationDeg ?? 0;
  const mirror = def.orientation?.mirrorX ?? false;

  return {
    trackId: def.trackId,
    displayName: def.displayName,
    mainSpline: prepareSpline(def.spline, rotation, mirror),
    sectors: def.sectors,
    corners: def.corners,
    pitSpline: def.pitLane ? prepareSpline(def.pitLane.spline, rotation, mirror) : undefined,
    mergePct: def.pitLane?.mergePct,
    exitPct: def.pitLane?.exitPct,
  };
}

/**
 * Uniform arc-length linear interpolation along the prepared spline.
 * @param prepared Precomputed PreparedSpline
 * @param pct Distance percentage along lap (0.0 to 1.0)
 */
export function getCoordinatesAtPct(prepared: PreparedSpline, pct: number): { x: number; y: number } {
  const { points, cumulativeLengths, totalLength } = prepared;
  if (!points || points.length === 0) return { x: 0.5, y: 0.5 };

  // Cleanly wrap pct if out of bounds
  let p = (pct % 1.0 + 1.0) % 1.0;
  const targetDistance = p * totalLength;

  // Find segment containing the target distance
  let i = 0;
  while (i < points.length - 1 && cumulativeLengths[i + 1] < targetDistance) {
    i++;
  }

  const p0 = points[i];
  const p1 = points[(i + 1) % points.length];
  
  const dist0 = cumulativeLengths[i];
  const dist1 = cumulativeLengths[i + 1];
  const segmentLength = dist1 - dist0;

  const f = segmentLength > 0 ? (targetDistance - dist0) / segmentLength : 0;

  return {
    x: p0[0] * (1 - f) + p1[0] * f,
    y: p0[1] * (1 - f) + p1[1] * f,
  };
}

/**
 * Generates SVG path scaled to viewport dimensions from pre-oriented spline coordinates
 */
export function getSvgPathFromSpline(prepared: PreparedSpline, width: number, height: number): string {
  const { points } = prepared;
  if (!points || points.length === 0) return "";

  let d = `M ${points[0][0] * width} ${points[0][1] * height}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i][0] * width} ${points[i][1] * height}`;
  }
  d += " Z";
  return d;
}
