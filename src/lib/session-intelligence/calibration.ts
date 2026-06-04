import type { IbtParsed } from "@/lib/ibt/types";

export interface SignalQualityMetrics {
  snr: number; // Signal-to-noise ratio in dB
  noiseStdDev: number;
  anomalyCertainty: number; // 0.0 to 1.0
}

/**
 * Filters transient spikes and noise from high-frequency sensor streams using a simple moving average.
 */
export function filterSignalNoise(data: number[] | Float32Array, windowSize: number = 5): number[] {
  const filtered: number[] = [];
  const len = data.length;
  if (len === 0) return filtered;

  for (let i = 0; i < len; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(len - 1, i + Math.floor(windowSize / 2));
    let sum = 0;
    for (let j = start; j <= end; j++) {
      sum += data[j];
    }
    filtered.push(sum / (end - start + 1));
  }
  return filtered;
}

/**
 * Calculates a certainty rating (0.0 to 1.0) for a detected anomaly
 * based on signal duration stability, peak amplitude threshold bounds, and signal noise.
 */
export function calculateScannerCertainty(
  parsed: IbtParsed,
  channelNames: string[],
  startTick: number,
  endTick: number,
): number {
  if (endTick <= startTick) return 0.5;

  let sumCertainty = 0;
  let activeChannels = 0;

  channelNames.forEach((name) => {
    const ch = parsed.channels[name];
    if (!ch) return;

    activeChannels++;
    const slice = ch.data.slice(startTick, endTick);
    if (slice.length === 0) return;

    // Standard deviation of signal slice as a proxy for noise variance
    const avg = Array.from(slice).reduce((a, b) => a + b, 0) / slice.length;
    const sqDiff = Array.from(slice).reduce((a, b) => a + Math.pow(b - avg, 2), 0);
    const stdDev = Math.sqrt(sqDiff / slice.length);

    // Calculate signal range
    const max = Math.max(...Array.from(slice));
    const min = Math.min(...Array.from(slice));
    const range = max - min;

    // SNR estimation (low range with high stdDev represents a noisy, low-confidence trigger)
    let channelCertainty = 0.85;
    if (range > 0 && stdDev > 0) {
      const snr = 20 * Math.log10(range / (stdDev + 0.001));
      if (snr < 6) {
        channelCertainty = 0.45; // Noisy signal spike
      } else if (snr > 18) {
        channelCertainty = 0.98; // Solid, clean step function alert
      } else {
        channelCertainty = 0.5 + (snr / 18) * 0.48;
      }
    }

    sumCertainty += channelCertainty;
  });

  return activeChannels > 0 ? Number((sumCertainty / activeChannels).toFixed(3)) : 0.82;
}

/**
 * Assesses weight metrics of causal transitions (e.g. how likely splitter bottoming induced diffuser vacuum failure)
 */
export function calculateCausalConfidence(
  fromNode: string,
  toNode: string,
  bottomingCount: number,
  releaseVariancePct: number,
  wheelspinWastePct: number,
): number {
  if (fromNode === "splitter_grounding" && toNode === "diffuser_seal_collapse") {
    // If we bottom out frequently, the splitter grounding will almost certainly stall the diffuser
    return bottomingCount > 4 ? 0.96 : bottomingCount > 1 ? 0.85 : 0.6;
  }
  if (fromNode === "diffuser_seal_collapse" && toNode === "rear_traction_loss") {
    // Diffuser seal collapse inducing exit traction loss depends on exit wheelspin levels
    return wheelspinWastePct > 6.0 ? 0.92 : wheelspinWastePct > 3.0 ? 0.78 : 0.55;
  }
  if (fromNode === "abrupt_brake_release" && toNode === "axle_lockup") {
    // Release slope variance over 15% is extremely strongly linked to entry axle locking
    return releaseVariancePct > 18 ? 0.95 : releaseVariancePct > 12 ? 0.84 : 0.62;
  }
  if (fromNode === "axle_lockup" && toNode === "fr_carcass_overheat") {
    return releaseVariancePct > 15 ? 0.89 : 0.74;
  }
  return 0.75; // Default physical causality weight
}
