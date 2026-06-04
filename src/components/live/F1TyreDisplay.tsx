import type { Telemetry } from "@/lib/telemetry-types";

/**
 * F1-style tyre temperature display.
 * 2×2 grid with large temp numbers, car silhouette SVG in center.
 * Matches the TYRE TEMP widget in the F1 reference.
 */
export function F1TyreDisplay({ t }: { t: Telemetry }) {
  const corners: Array<{ key: "fl" | "fr" | "rl" | "rr"; label: string; gridPos: string }> = [
    { key: "fl", label: "FL", gridPos: "col-start-1 row-start-1" },
    { key: "fr", label: "FR", gridPos: "col-start-3 row-start-1" },
    { key: "rl", label: "RL", gridPos: "col-start-1 row-start-2" },
    { key: "rr", label: "RR", gridPos: "col-start-3 row-start-2" },
  ];

  return (
    <div className="border border-border bg-background">
      <div className="border-b border-border px-2 py-1.5 text-[9px] uppercase tracking-wider text-muted-foreground">
        Tyre Temp (°C)
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] grid-rows-2 items-center gap-y-2 px-3 py-3">
        {corners.map(({ key, label, gridPos }) => {
          const temp = Math.round(t.tires[key].tempC);
          const color = tempColor(temp);
          return (
            <div key={key} className={`${gridPos} text-center`}>
              <div className={`font-mono text-[22px] font-bold tabular-nums leading-none ${color}`}>
                {temp}
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5">{label}</div>
            </div>
          );
        })}
        {/* Car silhouette in center */}
        <div className="col-start-2 row-span-2 flex items-center justify-center px-2">
          <CarSilhouette />
        </div>
      </div>
    </div>
  );
}

function tempColor(temp: number): string {
  if (temp > 105) return "text-rose-400";
  if (temp > 95) return "text-amber-400";
  if (temp < 60) return "text-sky-400";
  return "text-foreground";
}

/** Simple top-down F1 car silhouette SVG */
function CarSilhouette() {
  return (
    <svg
      viewBox="0 0 40 80"
      className="w-10 h-20 opacity-30"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      {/* Body */}
      <path d="M12 8 L12 4 Q12 2 14 2 L26 2 Q28 2 28 4 L28 8" className="stroke-muted-foreground" />
      <rect x="10" y="8" width="20" height="50" rx="4" className="stroke-muted-foreground" />
      <path
        d="M12 58 L12 72 Q12 76 16 76 L24 76 Q28 76 28 72 L28 58"
        className="stroke-muted-foreground"
      />
      {/* Front wing */}
      <rect
        x="4"
        y="2"
        width="6"
        height="10"
        rx="1"
        className="stroke-muted-foreground fill-muted-foreground/20"
      />
      <rect
        x="30"
        y="2"
        width="6"
        height="10"
        rx="1"
        className="stroke-muted-foreground fill-muted-foreground/20"
      />
      {/* Rear wing */}
      <rect
        x="4"
        y="66"
        width="6"
        height="10"
        rx="1"
        className="stroke-muted-foreground fill-muted-foreground/20"
      />
      <rect
        x="30"
        y="66"
        width="6"
        height="10"
        rx="1"
        className="stroke-muted-foreground fill-muted-foreground/20"
      />
      {/* Cockpit */}
      <ellipse cx="20" cy="28" rx="5" ry="8" className="stroke-muted-foreground" />
    </svg>
  );
}
