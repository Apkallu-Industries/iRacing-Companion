import { Link } from "@tanstack/react-router";
import { Radio } from "lucide-react";
import { useTelemetry } from "@/lib/useTelemetry";

/**
 * Compact live-telemetry ribbon for the .ibt workbench. Only renders when
 * the local iRacing bridge is actually streaming — so reviewing past laps
 * stays distraction-free when you're not driving, but you get a glanceable
 * speed/gear/inputs readout when you are.
 */
export function LiveBridgeStrip() {
  const t = useTelemetry();
  if (!t.connected) return null;

  return (
    <div className="hairline-b flex items-center gap-4 bg-emerald-500/5 px-4 py-1.5 font-mono text-[11px] tabular-nums">
      <span className="flex items-center gap-1.5 text-emerald-400">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
        <Radio className="h-3 w-3" />
        <span className="uppercase tracking-wider">Bridge live</span>
      </span>

      <Cell label="SPD" value={`${Math.round(t.speedKph)} kph`} />
      <Cell label="RPM" value={Math.round(t.rpm).toLocaleString()} />
      <Cell label="GEAR" value={String(t.gear)} />
      <Bar label="THR" value={t.throttle} color="bg-emerald-500" />
      <Bar label="BRK" value={t.brake} color="bg-rose-500" />
      <Cell
        label="Δ"
        value={`${t.deltaSec >= 0 ? "+" : ""}${t.deltaSec.toFixed(3)}`}
        valueClass={t.deltaSec < 0 ? "text-emerald-400" : "text-rose-400"}
      />

      <Link
        to="/live"
        className="ml-auto rounded-sm border border-emerald-500/30 px-2 py-0.5 uppercase tracking-wider text-emerald-400 hover:bg-emerald-500/15"
      >
        Open Live →
      </Link>
    </div>
  );
}

function Cell({ label, value, valueClass = "" }: { label: string; value: string; valueClass?: string }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={`text-foreground ${valueClass}`}>{value}</span>
    </span>
  );
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="relative h-1.5 w-16 overflow-hidden rounded-sm bg-zinc-800">
        <span className={`absolute inset-y-0 left-0 ${color}`} style={{ width: `${pct}%` }} />
      </span>
      <span className="w-7 text-right text-foreground">{Math.round(pct)}</span>
    </span>
  );
}
