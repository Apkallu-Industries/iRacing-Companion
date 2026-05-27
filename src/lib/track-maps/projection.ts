/**
 * Track Map Spline Math & Projection Engine
 * Pure-JS layout calculations. Zero DOM dependencies.
 */

/**
 * Linearly interpolates coordinates along a prebuilt normalized spline.
 * @param spline Prebuilt spline node array of [x, y] coordinates in [0..1]
 * @param pct Distance percentage along lap (0.0 to 1.0)
 */
export function getCoordinatesAtPct(spline: [number, number][], pct: number): { x: number; y: number } {
  if (!spline || spline.length === 0) return { x: 0, y: 0 };
  
  // Cleanly wrap pct if out of bounds (lap dist wraps naturally around finish line)
  let p = pct % 1.0;
  if (p < 0) p += 1.0;

  const len = spline.length;
  // Map pct to exact float index in spline array
  const exactIdx = p * (len - 1);
  const idx0 = Math.floor(exactIdx);
  const idx1 = Math.min(len - 1, idx0 + 1);
  const f = exactIdx - idx0; // Fractional distance between nodes

  const node0 = spline[idx0];
  const node1 = spline[idx1];

  return {
    x: node0[0] * (1 - f) + node1[0] * f,
    y: node0[1] * (1 - f) + node1[1] * f,
  };
}

/**
 * Generates an SVG path 'd' string scaled to target canvas dimensions.
 * @param spline Prebuilt spline node array
 * @param width Target canvas/box width
 * @param height Target canvas/box height
 */
export function getSvgPathFromSpline(spline: [number, number][], width: number, height: number): string {
  if (!spline || spline.length === 0) return "";
  
  let d = `M ${spline[0][0] * width} ${spline[0][1] * height}`;
  for (let i = 1; i < spline.length; i++) {
    d += ` L ${spline[i][0] * width} ${spline[i][1] * height}`;
  }
  d += " Z"; // Close the path
  return d;
}
