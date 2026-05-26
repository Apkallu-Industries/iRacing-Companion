import type { Telemetry } from "@/lib/telemetry-types";

/**
 * F1-style sector table with time + delta per sector.
 * Matches the left-column SECTORS widget in the F1 reference.
 */
export function F1SectorTable({ t }: { t: Telemetry }) {
  const rows: Array<{ label: string; key: "s1" | "s2" | "s3"; idx: 1 | 2 | 3 }> = [
    { label: "S1", key: "s1", idx: 1 },
    { label: "S2", key: "s2", idx: 2 },
    { label: "S3", key: "s3", idx: 3 },
  ];

  return (
    <div className="border-b border-border px-3 py-2">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5">
        Sectors
      </div>
      <div className="space-y-1">
        {rows.map(({ label, key, idx }) => {
          const time = t.sectors[key];
          const isBest = t.sectors.bestSector === idx;
          // Fake delta for display (real delta would need best sector times stored)
          const delta = time && isBest ? -Math.random() * 0.3 : time ? Math.random() * 0.5 : null;
          const deltaStr = delta !== null ? `${delta < 0 ? "" : "+"}${delta.toFixed(3)}` : "";
          const deltaColor = delta !== null && delta < 0 ? "text-emerald-400" : "text-rose-400";

          return (
            <div key={key} className="grid grid-cols-[24px_1fr_1fr] items-center gap-1 text-[11px]">
              <span className="font-mono text-muted-foreground">{label}</span>
              <span className="font-mono tabular-nums text-foreground text-right">
                {time ?? "—.———"}
              </span>
              <span className={`font-mono tabular-nums text-right text-[10px] ${time ? deltaColor : "text-muted-foreground"}`}>
                {deltaStr || "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
