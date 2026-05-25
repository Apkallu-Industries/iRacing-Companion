export interface ScatterPoint {
  x: number;
  y: number;
  density?: number;
  age?: number;
  time?: number;
}

export type DensityMode = "none" | "grid";

export function prepareScatterData(
  samples: Array<Record<string, any>>,
  xKey: string,
  yKey: string,
): ScatterPoint[] {
  const points: ScatterPoint[] = [];

  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    const x = s[xKey];
    const y = s[yKey];

    if (Number.isFinite(x) && Number.isFinite(y)) {
      points.push({
        x,
        y,
        age: (samples.length - i) / samples.length, // 0 (old) to 1 (new)
        time: i,
      });
    }
  }

  return points;
}

export function calculateGridDensity(
  points: ScatterPoint[],
  gridSize: number = 20,
): Map<string, number> {
  if (points.length === 0) return new Map();

  // Find bounds
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  // Bin points
  const density = new Map<string, number>();
  for (const p of points) {
    const binX = Math.floor(((p.x - minX) / rangeX) * gridSize);
    const binY = Math.floor(((p.y - minY) / rangeY) * gridSize);
    const key = `${binX},${binY}`;
    density.set(key, (density.get(key) || 0) + 1);
  }

  return density;
}

export interface ScatterMetrics {
  correlation: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export function calculateScatterMetrics(points: ScatterPoint[]): ScatterMetrics {
  if (points.length === 0) {
    return {
      correlation: 0,
      minX: 0,
      maxX: 1,
      minY: 0,
      maxY: 1,
    };
  }

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  // Calculate Pearson correlation
  const meanX = xs.reduce((a, b) => a + b) / xs.length;
  const meanY = ys.reduce((a, b) => a + b) / ys.length;

  let numerator = 0;
  let sumSqX = 0;
  let sumSqY = 0;

  for (let i = 0; i < points.length; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    numerator += dx * dy;
    sumSqX += dx * dx;
    sumSqY += dy * dy;
  }

  const correlation = sumSqX * sumSqY > 0 ? numerator / Math.sqrt(sumSqX * sumSqY) : 0;

  return {
    correlation: Math.max(-1, Math.min(1, correlation)),
    minX,
    maxX,
    minY,
    maxY,
  };
}
