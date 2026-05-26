import type { Telemetry } from "@/lib/telemetry-types";

/**
 * F1-style hero lap time display.
 * Large current lap time, delta, best/last/predicted row.
 */
export function F1LapHero({ t }: { t: Telemetry }) {
  const deltaStr = `${t.deltaSec >= 0 ? "+" : ""}${t.deltaSec.toFixed(3)}`;
  const deltaColor = t.deltaSec < 0 ? "text-emerald-400" : "text-rose-400";

  return (
    <div className="border-b border-border px-3 py-2">
      {/* Header */}
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">
        Current Lap
      </div>

      {/* Hero row: lap time + delta */}
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[28px] font-bold leading-none text-foreground tabular-nums">
          {t.lastLap || "—:——.———"}
        </span>
        <span className={`font-mono text-[18px] font-bold tabular-nums ${deltaColor}`}>
          {deltaStr}
        </span>
      </div>

      {/* Best / Last / Predicted row */}
      <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
        <div>
          <div className="text-muted-foreground uppercase tracking-wider text-[8px]">Best Lap</div>
          <div className="font-mono tabular-nums text-foreground">{t.bestLap || "—:——.———"}</div>
        </div>
        <div>
          <div className="text-muted-foreground uppercase tracking-wider text-[8px]">Last Lap</div>
          <div className="font-mono tabular-nums text-foreground">{t.lastLap || "—:——.———"}</div>
        </div>
        <div>
          <div className="text-muted-foreground uppercase tracking-wider text-[8px]">Predicted</div>
          <div className="font-mono tabular-nums text-foreground">
            {t.lapLastLapTimeSec > 0
              ? formatLapTime(t.lapLastLapTimeSec + t.deltaSec)
              : "—:——.———"}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatLapTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—:——.———";
  const mins = Math.floor(seconds / 60);
  const secs = seconds - mins * 60;
  return `${mins}:${secs.toFixed(3).padStart(6, "0")}`;
}
