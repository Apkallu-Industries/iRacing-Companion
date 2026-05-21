/**
 * Pure deterministic rules layer for the live AI coach.
 * Given the freshly-completed lap + PB + recent session laps, decide the
 * coaching TONE and produce a compact summary the AI can phrase naturally.
 *
 * Three tones, F1-radio style cadence (one message per lap):
 *   - "push": you have time on the table, attack
 *   - "hold": you're at the limit, repeat what you're doing
 *   - "warn": risk is high (PB streak + hot tires/low fuel, or an incident)
 */

export type Tone = "push" | "hold" | "warn";

export interface LiveLap {
  lapTimeS: number;
  s1S: number | null;
  s2S: number | null;
  s3S: number | null;
  maxBrakePct: number;
  maxThrottlePct: number;
  peakLatG: number;
  peakLonG: number;
  tireAvgC: number;
  fuelLapsRemaining: number;
  isValid: boolean;
}

export interface RuleInput {
  lap: LiveLap;
  pbS: number | null;
  sectorBests: { s1: number | null; s2: number | null; s3: number | null } | null;
  pbStreak: number; // how many consecutive PBs (including this lap if it's one)
  recentDeltas: number[]; // last few (lap - pb) deltas, oldest first
}

export interface RuleSummary {
  tone: Tone;
  reasonCode:
    | "incident"
    | "pb-streak-warn"
    | "pb-streak-soft"
    | "first-pb"
    | "matching-pb"
    | "off-pace-soft"
    | "off-pace-hard"
    | "trending-slower"
    | "no-pb-yet";
  deltaToPbS: number | null;
  sectorOpportunities: Array<{ sector: 1 | 2 | 3; deltaS: number }>;
  flags: {
    hotTires: boolean;
    lowFuel: boolean;
    bigG: boolean;
    invalidLap: boolean;
    gentleInputs: boolean;
  };
  /** Plain-English bullets we hand to the AI for phrasing. */
  beats: string[];
}

const HOT_TIRE_C = 100;
const LOW_FUEL_LAPS = 3;
const BIG_G = 1.9;

export function decideTone(input: RuleInput): RuleSummary {
  const { lap, pbS, sectorBests, pbStreak, recentDeltas } = input;
  const delta = pbS != null ? +(lap.lapTimeS - pbS).toFixed(3) : null;

  const flags = {
    hotTires: lap.tireAvgC > HOT_TIRE_C,
    lowFuel: lap.fuelLapsRemaining < LOW_FUEL_LAPS,
    bigG: lap.peakLatG > BIG_G || Math.abs(lap.peakLonG) > BIG_G + 0.2,
    invalidLap: !lap.isValid,
    gentleInputs: lap.maxBrakePct < 80 && lap.maxThrottlePct < 95,
  };

  const sectorOpportunities: RuleSummary["sectorOpportunities"] = [];
  if (sectorBests) {
    const checks: Array<[1 | 2 | 3, number | null, number | null]> = [
      [1, lap.s1S, sectorBests.s1],
      [2, lap.s2S, sectorBests.s2],
      [3, lap.s3S, sectorBests.s3],
    ];
    for (const [s, cur, best] of checks) {
      if (cur != null && best != null && cur > best + 0.05) {
        sectorOpportunities.push({ sector: s, deltaS: +(cur - best).toFixed(3) });
      }
    }
    sectorOpportunities.sort((a, b) => b.deltaS - a.deltaS);
  }

  // --- Decision ladder ---
  const beats: string[] = [];

  // 1. Incident / invalid lap → always warn-reset
  if (flags.invalidLap || flags.bigG) {
    beats.push(`Lap ${flags.invalidLap ? "invalidated" : "had a >${BIG_G.toFixed(1)}g spike"} — reset and re-find rhythm.`);
    return summarize("warn", "incident", delta, sectorOpportunities, flags, beats);
  }

  // 2. New PB this lap
  const isNewPb = pbS == null || lap.lapTimeS < pbS;

  if (isNewPb) {
    if (pbStreak >= 3) {
      beats.push(`That's PB #${pbStreak} in a row — you are well past the comfort zone.`);
      if (flags.hotTires) beats.push(`Tires reading ${Math.round(lap.tireAvgC)}°C, well over the working window.`);
      if (flags.lowFuel) beats.push(`Only ~${lap.fuelLapsRemaining.toFixed(1)} laps of fuel left, save the car.`);
      beats.push("Bank this time. Don't chase another tenth this stint.");
      return summarize("warn", "pb-streak-warn", delta, sectorOpportunities, flags, beats);
    }
    if (pbStreak === 2 && (flags.hotTires || flags.lowFuel)) {
      beats.push(`Two PBs back-to-back, but ${flags.hotTires ? "tires are hot" : "fuel is getting tight"}.`);
      beats.push("Hold this pace for a lap, let the car settle before pushing for more.");
      return summarize("warn", "pb-streak-soft", delta, sectorOpportunities, flags, beats);
    }
    beats.push("New personal best — keep the same inputs, exact same lines.");
    if (sectorOpportunities[0]) {
      beats.push(`Sector ${sectorOpportunities[0].sector} is still ${sectorOpportunities[0].deltaS.toFixed(2)}s off your best in that sector — quietly chase that next.`);
    }
    return summarize("hold", "first-pb", delta, sectorOpportunities, flags, beats);
  }

  // 3. We have a PB, compare delta
  if (delta == null) {
    beats.push("No personal best on file for this combo yet — set a clean lap to anchor the coach.");
    return summarize("push", "no-pb-yet", delta, sectorOpportunities, flags, beats);
  }

  // 4. Trending slower across last 3 laps
  const trendingSlower = recentDeltas.length >= 3 && recentDeltas.slice(-3).every((d, i, arr) => i === 0 || d > arr[i - 1]);

  if (delta <= 0.1) {
    beats.push(`Matched the PB to within ${Math.abs(delta).toFixed(3)}s.`);
    beats.push("Repeat that lap. The reps build the confidence to find more.");
    return summarize("hold", "matching-pb", delta, sectorOpportunities, flags, beats);
  }

  if (trendingSlower) {
    beats.push(`Last three laps drifted from ${recentDeltas[recentDeltas.length - 3].toFixed(2)}s to ${recentDeltas[recentDeltas.length - 1].toFixed(2)}s off.`);
    beats.push("Reset focus: pick one corner, nail the reference, build from there.");
    return summarize("push", "trending-slower", delta, sectorOpportunities, flags, beats);
  }

  if (delta > 0.4) {
    beats.push(`${delta.toFixed(2)}s off your PB.`);
    if (flags.gentleInputs) beats.push(`Peak brake only ${Math.round(lap.maxBrakePct)}%, peak throttle ${Math.round(lap.maxThrottlePct)}% — there is real margin here.`);
    if (sectorOpportunities[0]) beats.push(`Sector ${sectorOpportunities[0].sector} alone is ${sectorOpportunities[0].deltaS.toFixed(2)}s — start there.`);
    return summarize("push", "off-pace-hard", delta, sectorOpportunities, flags, beats);
  }

  beats.push(`${delta.toFixed(2)}s off PB — close, but committable.`);
  if (sectorOpportunities[0]) beats.push(`Sector ${sectorOpportunities[0].sector} is the largest gap (${sectorOpportunities[0].deltaS.toFixed(2)}s).`);
  return summarize("push", "off-pace-soft", delta, sectorOpportunities, flags, beats);
}

function summarize(
  tone: Tone,
  reasonCode: RuleSummary["reasonCode"],
  deltaToPbS: number | null,
  sectorOpportunities: RuleSummary["sectorOpportunities"],
  flags: RuleSummary["flags"],
  beats: string[],
): RuleSummary {
  return { tone, reasonCode, deltaToPbS, sectorOpportunities, flags, beats };
}
