export interface HistogramBin {
  min: number;
  max: number;
  count: number;
  label: string;
  percentage: number;
}

export interface HistogramStats {
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  count: number;
  q1: number;
  q3: number;
}

export interface HistogramData {
  bins: HistogramBin[];
  stats: HistogramStats;
}

export function computeHistogram(values: number[], binCount: number): HistogramData {
  const filtered = values.filter((v) => Number.isFinite(v));

  if (filtered.length === 0) {
    return {
      bins: [],
      stats: {
        mean: 0,
        median: 0,
        stdDev: 0,
        min: 0,
        max: 0,
        count: 0,
        q1: 0,
        q3: 0,
      },
    };
  }

  const sorted = [...filtered].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const range = max - min || 1;
  const binWidth = range / binCount;

  // Initialize bins
  const bins: HistogramBin[] = Array.from({ length: binCount }, (_, i) => {
    const binMin = min + i * binWidth;
    const binMax = i === binCount - 1 ? max + 0.0001 : min + (i + 1) * binWidth;
    return {
      min: binMin,
      max: binMax,
      count: 0,
      label: `${binMin.toFixed(1)}-${binMax.toFixed(1)}`,
      percentage: 0,
    };
  });

  // Populate bins
  for (const v of filtered) {
    let binIdx = Math.floor((v - min) / binWidth);
    if (binIdx >= binCount) binIdx = binCount - 1;
    bins[binIdx].count++;
  }

  // Calculate percentages
  const totalCount = filtered.length;
  for (const bin of bins) {
    bin.percentage = (bin.count / totalCount) * 100;
  }

  // Calculate stats
  const mean = filtered.reduce((a, b) => a + b, 0) / filtered.length;
  const variance = filtered.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / filtered.length;
  const stdDev = Math.sqrt(variance);
  const median = sorted[Math.floor(sorted.length / 2)];
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];

  return {
    bins,
    stats: {
      mean,
      median,
      stdDev,
      min,
      max,
      count: filtered.length,
      q1,
      q3,
    },
  };
}
