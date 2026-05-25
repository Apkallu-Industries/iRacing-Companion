import { useMemo } from "react";
import type { Sample } from "@/lib/useTelemetryBuffer";
import type { Telemetry } from "@/lib/telemetry-types";
import type { CursorInfo } from "./MotecPanels";

/**
 * Derived metrics computed from the rolling telemetry buffer.
 *
 * - Accel/Brake rate: peak +/- dV/dt over the recent window (m/s²)
 * - Jerk: peak |d(gLon)/dt| (G/s) — a precision-of-inputs metric
 * - Brake balance: from the bridge channel + computed bias-of-effort proxy
 * - Tyre slip estimates: front/rear lateral slip proxy using steering vs gLat
 */
export function DerivedMetrics({
  samples,
  t,
  cursor,
}: {
  samples: Sample[];
  t: Telemetry;
  cursor: CursorInfo | null;
}) {
  const metrics = useMemo(() => computeMetrics(samples, t), [samples, t]);

  return (
    <div className="rounded-sm border border-zinc-900 bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-900 px-2 py-1.5">
        <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          Derived Metrics
        </span>
        <span className="text-[9px] tabular-nums text-zinc-600">
          {cursor ? "@ cursor" : `${metrics.windowSec.toFixed(1)}s window`}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-px bg-zinc-900 text-[11px]">
        <Cell
          label="ACCEL RATE"
          value={metrics.accelRate.toFixed(2)}
          unit="m/s²"
          tone="emerald"
          sub="peak +dV/dt"
        />
        <Cell
          label="BRAKE RATE"
          value={metrics.brakeRate.toFixed(2)}
          unit="m/s²"
          tone="rose"
          sub="peak -dV/dt"
        />
        <Cell
          label="JERK"
          value={metrics.jerk.toFixed(2)}
          unit="G/s"
          tone="amber"
          sub="|d(gLon)/dt|"
        />
        <Cell
          label="BRK BAL"
          value={t.brakeBias.toFixed(1)}
          unit="% F"
          tone="zinc"
          sub={`effort ${metrics.brakeEffortBiasPct.toFixed(0)}% F`}
        />
        <Cell
          label="FRONT SLIP"
          value={metrics.frontSlip.toFixed(2)}
          unit="idx"
          tone={metrics.frontSlip > 1.15 ? "rose" : "sky"}
          sub="steer / gLat"
        />
        <Cell
          label="REAR SLIP"
          value={metrics.rearSlip.toFixed(2)}
          unit="idx"
          tone={metrics.rearSlip > 1.15 ? "rose" : "sky"}
          sub="yaw / gLat"
        />
      </div>
      {cursor && (
        <div className="border-t border-zinc-900 px-2 py-1.5 text-[10px] text-zinc-500">
          <div className="flex items-center justify-between">
            <span className="uppercase tracking-wider">Cursor</span>
            <span className="tabular-nums text-amber-400">
              t = {(cursor.sample.t / 1000).toFixed(2)}s
            </span>
          </div>
          <div className="mt-1 grid grid-cols-3 gap-x-2 gap-y-0.5 tabular-nums text-zinc-300">
            <Row
              k="Spd"
              v={`${(cursor.smoothed["speed:0"] ?? cursor.sample.speed).toFixed(1)} km/h`}
            />
            <Row k="Rpm" v={Math.round(cursor.smoothed["rpm:0"] ?? cursor.sample.rpm).toString()} />
            <Row k="Gear" v="—" />
            <Row
              k="Thr"
              v={`${Math.round(cursor.smoothed["inputs:0"] ?? cursor.sample.throttle * 100)}%`}
            />
            <Row
              k="Brk"
              v={`${Math.round(cursor.smoothed["inputs:1"] ?? cursor.sample.brake * 100)}%`}
            />
            <Row
              k="Str"
              v={`${Math.round(cursor.smoothed["steering:0"] ?? cursor.sample.steering)}°`}
            />
            <Row k="gLat" v={(cursor.smoothed["g:0"] ?? cursor.sample.gLat).toFixed(2)} />
            <Row k="gLon" v={(cursor.smoothed["g:1"] ?? cursor.sample.gLon).toFixed(2)} />
            <Row
              k="Δt"
              v={`-${((samples[samples.length - 1]?.t ?? 0) - cursor.sample.t) / 1000}s`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-1">
      <span className="text-zinc-600">{k}</span>
      <span>{v}</span>
    </div>
  );
}

function Cell({
  label,
  value,
  unit,
  sub,
  tone,
}: {
  label: string;
  value: string;
  unit: string;
  sub?: string;
  tone: "emerald" | "rose" | "amber" | "sky" | "zinc";
}) {
  const toneClass = {
    emerald: "text-emerald-400",
    rose: "text-rose-400",
    amber: "text-amber-400",
    sky: "text-sky-400",
    zinc: "text-zinc-100",
  }[tone];
  return (
    <div className="bg-zinc-950 p-2">
      <div className="flex items-baseline justify-between">
        <span className="text-[9px] uppercase tracking-wider text-zinc-500">{label}</span>
        <span className="text-[9px] text-zinc-600">{unit}</span>
      </div>
      <div className={`mt-0.5 text-base tabular-nums ${toneClass}`}>{value}</div>
      {sub && <div className="text-[9px] text-zinc-600">{sub}</div>}
    </div>
  );
}

/* ───────── Computations ───────── */

interface Computed {
  windowSec: number;
  accelRate: number;
  brakeRate: number;
  jerk: number;
  brakeEffortBiasPct: number;
  frontSlip: number;
  rearSlip: number;
}

function computeMetrics(samples: Sample[], t: Telemetry): Computed {
  if (samples.length < 4) {
    return {
      windowSec: 0,
      accelRate: 0,
      brakeRate: 0,
      jerk: 0,
      brakeEffortBiasPct: t.brakeBias,
      frontSlip: 1,
      rearSlip: 1,
    };
  }
  // Work on the last ~2s window for "right now" feel.
  const last = samples[samples.length - 1];
  const cutoff = last.t - 2000;
  let i0 = samples.length - 1;
  while (i0 > 0 && samples[i0 - 1].t >= cutoff) i0--;
  const win = samples.slice(i0);

  let accelRate = 0;
  let brakeRate = 0;
  let jerk = 0;
  // Accumulate brake effort weighted by gLon during braking (proxy for bias of effort).
  let brakeWeightFront = 0;
  let brakeWeightTotal = 0;

  for (let k = 1; k < win.length; k++) {
    const a = win[k - 1];
    const b = win[k];
    const dt = Math.max(0.001, (b.t - a.t) / 1000); // s
    const dv = (b.speed - a.speed) / 3.6; // m/s
    const acc = dv / dt; // m/s²
    if (acc > accelRate) accelRate = acc;
    if (acc < brakeRate) brakeRate = acc;
    const dG = (b.gLon - a.gLon) / dt;
    const j = Math.abs(dG);
    if (j > jerk) jerk = j;

    if (b.brake > 0.05) {
      const w = b.brake;
      brakeWeightTotal += w;
      brakeWeightFront += w * (t.brakeBias / 100);
    }
  }

  // Slip proxy: at moderate-to-high speed, the lateral G should scale with
  // steering input. Ratios > 1 mean steering is producing less G than expected
  // (sliding). Rear uses yaw/g approximation (steering sign change vs gLat).
  const speedMs = Math.max(1, last.speed / 3.6);
  const expectedG = Math.abs((last.steering * Math.PI) / 180) * (speedMs / 60); // rough
  const frontSlip =
    Math.abs(last.gLat) < 0.05 ? 1 : Math.min(3, expectedG / Math.max(0.05, Math.abs(last.gLat)));
  // Rear: when oversteering, |gLat| grows faster than steering → low ratio.
  // Use sign agreement: if steering and gLat have opposite signs, treat as oversteer.
  const opposite =
    Math.sign(last.steering) !== 0 && Math.sign(last.steering) === -Math.sign(last.gLat);
  const rearSlip = opposite
    ? 1.4 + Math.min(0.8, Math.abs(last.gLat) / 3)
    : 0.9 + Math.abs(last.gLat) / 6;

  return {
    windowSec: (last.t - win[0].t) / 1000,
    accelRate: Math.max(0, accelRate),
    brakeRate: Math.abs(brakeRate),
    jerk,
    brakeEffortBiasPct:
      brakeWeightTotal > 0 ? (brakeWeightFront / brakeWeightTotal) * 100 : t.brakeBias,
    frontSlip,
    rearSlip,
  };
}
