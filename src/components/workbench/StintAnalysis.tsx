import { useMemo } from "react";
import type { IbtParsed } from "@/lib/ibt/types";

const TIRE_KEYS = ["LFtempCM", "RFtempCM", "LRtempCM", "RRtempCM"] as const;

function lapAvgInRange(ch: Float32Array | undefined, start: number, end: number): number | null {
  if (!ch || end <= start) return null;
  let sum = 0;
  let n = 0;
  for (let i = start; i < end; i++) {
    const v = ch[i];
    if (isFinite(v) && v > 20 && v < 200) {
      sum += v;
      n++;
    }
  }
  return n > 10 ? sum / n : null;
}

function linearSlope(xs: number[], ys: number[]): number | null {
  const n = xs.length;
  if (n < 2) return null;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  return den === 0 ? null : num / den;
}

function fmtLap(s: number) {
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  return `${m}:${r.toFixed(3).padStart(6, "0")}`;
}

export function StintAnalysis({ parsed }: { parsed: IbtParsed }) {
  const analysis = useMemo(() => {
    const valid = parsed.laps.filter((l) => l.timeS > 10 && l.timeS < 600);
    if (valid.length < 2) return null;

    const rows = valid.map((lap) => {
      const tires: Record<string, number | null> = {};
      for (const key of TIRE_KEYS) {
        tires[key] = lapAvgInRange(parsed.channels[key]?.data, lap.startTick, lap.endTick);
      }
      const front =
        tires.LFtempCM != null && tires.RFtempCM != null ? (tires.LFtempCM + tires.RFtempCM) / 2 : null;
      const rear =
        tires.LRtempCM != null && tires.RRtempCM != null ? (tires.LRtempCM + tires.RRtempCM) / 2 : null;
      return { lap: lap.lap, timeS: lap.timeS, tires, front, rear };
    });

    const times = rows.map((r) => r.timeS);
    const mean = times.reduce((a, b) => a + b, 0) / times.length;
    const variance = times.reduce((a, t) => a + (t - mean) ** 2, 0) / times.length;
    const stdev = Math.sqrt(variance);
    const best = Math.min(...times);
    const xs = rows.map((_, i) => i + 1);
    const paceSlope = linearSlope(xs, times);

    return { rows, mean, stdev, best, paceSlope, lapCount: rows.length };
  }, [parsed]);

  if (!analysis) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        Need at least 2 valid laps in this file for stint analysis.
      </div>
    );
  }

  const { rows, mean, stdev, best, paceSlope, lapCount } = analysis;
  const maxT = Math.max(...rows.map((r) => r.timeS));
  const minT = Math.min(...rows.map((r) => r.timeS));
  const span = maxT - minT || 1;

  return (
    <div className="flex h-full flex-col overflow-auto p-4 gap-4 text-xs font-mono">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Stat label="Laps" value={String(lapCount)} />
        <Stat label="Best" value={fmtLap(best)} highlight />
        <Stat label="Avg" value={fmtLap(mean)} />
        <Stat label="σ pace" value={`${stdev.toFixed(3)}s`} />
        <Stat
          label="Pace trend"
          value={paceSlope == null ? "—" : `${paceSlope >= 0 ? "+" : ""}${(paceSlope * 1000).toFixed(0)}ms/lap`}
          hint={
            paceSlope != null && paceSlope > 0.05
              ? "Slowing"
              : paceSlope != null && paceSlope < -0.05
                ? "Improving"
                : "Stable"
          }
        />
      </div>

      <div>
        <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">Lap times</div>
        <div className="flex items-end gap-1 h-24">
          {rows.map((r) => {
            const h = ((maxT - r.timeS) / span) * 70 + 18;
            const offPb = r.timeS - best;
            return (
              <div key={r.lap} className="flex flex-1 flex-col items-center gap-1 min-w-0">
                <div
                  className={`w-full rounded-t ${offPb < 0.15 ? "bg-racing-green/80" : offPb < 0.5 ? "bg-primary/70" : "bg-racing-orange/70"}`}
                  style={{ height: h }}
                  title={`Lap ${r.lap}: ${fmtLap(r.timeS)}`}
                />
                <span className="text-[9px] text-muted-foreground truncate w-full text-center">L{r.lap}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
          Tire temps (°C avg per lap)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="text-muted-foreground border-b border-border">
                <th className="py-1 text-left">Lap</th>
                <th className="py-1 text-right">LF</th>
                <th className="py-1 text-right">RF</th>
                <th className="py-1 text-right">LR</th>
                <th className="py-1 text-right">RR</th>
                <th className="py-1 text-right">F-R Δ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.lap} className="border-b border-border/50">
                  <td className="py-1">{r.lap}</td>
                  {TIRE_KEYS.map((k) => (
                    <td key={k} className="py-1 text-right tabular-nums">
                      {r.tires[k] != null ? Math.round(r.tires[k]!) : "—"}
                    </td>
                  ))}
                  <td className="py-1 text-right tabular-nums text-muted-foreground">
                    {r.front != null && r.rear != null ? `${(r.front - r.rear).toFixed(0)}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
  hint,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  hint?: string;
}) {
  return (
    <div className="rounded-sm bg-rail/60 px-2 py-1.5 ring-1 ring-border/50">
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`tabular-nums text-sm ${highlight ? "text-racing-green" : "text-foreground"}`}>
        {value}
      </div>
      {hint && <div className="text-[9px] text-muted-foreground">{hint}</div>}
    </div>
  );
}
