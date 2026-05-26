import type { Telemetry } from "@/lib/telemetry-types";

/**
 * F1-style quick stats bar at the bottom of the left column.
 * Throttle %, Brake %, DRS status, Fuel level — matching the F1 reference.
 */
export function F1QuickStats({ t }: { t: Telemetry }) {
  return (
    <div className="grid grid-cols-4 gap-px bg-border">
      <Stat label="Throttle" value={`${Math.round(t.throttle * 100)}%`} />
      <Stat label="Brake" value={`${Math.round(t.brake * 100)}%`} />
      <Stat
        label="DRS"
        value={t.drsAvailable ? "OPEN" : "OFF"}
        valueColor={t.drsAvailable ? "text-emerald-400" : "text-muted-foreground"}
      />
      <Stat label="Fuel" value={`${t.fuelRemainingL.toFixed(1)} L`} />
    </div>
  );
}

function Stat({
  label,
  value,
  valueColor = "text-foreground",
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-background px-2 py-1.5 text-center">
      <div className="text-[8px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-mono text-[12px] font-bold tabular-nums ${valueColor}`}>{value}</div>
    </div>
  );
}
