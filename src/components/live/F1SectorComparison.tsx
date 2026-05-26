import type { Telemetry } from "@/lib/telemetry-types";

/**
 * F1-style sector comparison table.
 * THIS LAP / BEST LAP / DELTA rows × S1/S2/S3/LAP columns.
 * Matches the bottom-center SECTOR COMPARISON widget in the F1 reference.
 */
export function F1SectorComparison({ t }: { t: Telemetry }) {
  const s1 = t.sectors.s1;
  const s2 = t.sectors.s2;
  const s3 = t.sectors.s3;

  // Mock best-lap sector times (in a real system these would come from stored best lap)
  const bestS1 = s1 ? (parseFloat(s1) - 0.1 - Math.random() * 0.2).toFixed(3) : null;
  const bestS2 = s2 ? (parseFloat(s2) - 0.1 - Math.random() * 0.3).toFixed(3) : null;
  const bestS3 = s3 ? (parseFloat(s3) + 0.05 - Math.random() * 0.1).toFixed(3) : null;

  const deltaS1 = s1 && bestS1 ? parseFloat(s1) - parseFloat(bestS1) : null;
  const deltaS2 = s2 && bestS2 ? parseFloat(s2) - parseFloat(bestS2) : null;
  const deltaS3 = s3 && bestS3 ? parseFloat(s3) - parseFloat(bestS3) : null;

  const totalThis = t.lastLap;
  const totalBest = t.bestLap;
  const totalDelta = t.deltaSec;

  const fmtDelta = (d: number | null) => {
    if (d === null) return "—";
    return `${d < 0 ? "" : "+"}${d.toFixed(3)}`;
  };
  const deltaColor = (d: number | null) =>
    d === null ? "text-muted-foreground" : d < 0 ? "text-emerald-400" : "text-rose-400";

  return (
    <div className="border border-border bg-background h-full flex flex-col">
      <div className="border-b border-border px-2 py-1.5 text-[9px] uppercase tracking-wider text-muted-foreground flex-shrink-0">
        Sector Comparison
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-[10px] font-mono">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="px-2 py-1 text-left font-normal" />
              <th className="px-2 py-1 text-right font-normal">S1</th>
              <th className="px-2 py-1 text-right font-normal">S2</th>
              <th className="px-2 py-1 text-right font-normal">S3</th>
              <th className="px-2 py-1 text-right font-normal">LAP</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="px-2 py-1.5 text-muted-foreground text-[9px] uppercase">This Lap</td>
              <td className="px-2 py-1.5 text-right tabular-nums text-foreground">{s1 ?? "—"}</td>
              <td className="px-2 py-1.5 text-right tabular-nums text-foreground">{s2 ?? "—"}</td>
              <td className="px-2 py-1.5 text-right tabular-nums text-foreground">{s3 ?? "—"}</td>
              <td className="px-2 py-1.5 text-right tabular-nums text-foreground">{totalThis || "—"}</td>
            </tr>
            <tr className="border-b border-border">
              <td className="px-2 py-1.5 text-muted-foreground text-[9px] uppercase">Best Lap</td>
              <td className="px-2 py-1.5 text-right tabular-nums text-foreground">{bestS1 ?? "—"}</td>
              <td className="px-2 py-1.5 text-right tabular-nums text-foreground">{bestS2 ?? "—"}</td>
              <td className="px-2 py-1.5 text-right tabular-nums text-foreground">{bestS3 ?? "—"}</td>
              <td className="px-2 py-1.5 text-right tabular-nums text-foreground">{totalBest || "—"}</td>
            </tr>
            <tr>
              <td className="px-2 py-1.5 text-muted-foreground text-[9px] uppercase">Delta</td>
              <td className={`px-2 py-1.5 text-right tabular-nums ${deltaColor(deltaS1)}`}>{fmtDelta(deltaS1)}</td>
              <td className={`px-2 py-1.5 text-right tabular-nums ${deltaColor(deltaS2)}`}>{fmtDelta(deltaS2)}</td>
              <td className={`px-2 py-1.5 text-right tabular-nums ${deltaColor(deltaS3)}`}>{fmtDelta(deltaS3)}</td>
              <td className={`px-2 py-1.5 text-right tabular-nums font-bold ${totalDelta < 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {fmtDelta(totalDelta)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
