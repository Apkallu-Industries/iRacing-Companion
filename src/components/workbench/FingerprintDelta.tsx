import { useEffect, useState } from "react";
import { Fingerprint, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { getFingerprintForPair } from "@/lib/fingerprint.functions";
import { classifyCar } from "@/lib/fingerprint/carClass";

interface Props {
  track?: string | null;
  car?: string | null;
  thisLapS?: number | null;
  thisSectors?: number[];
}

interface Fp {
  track: string;
  car: string;
  best_ever_s: number;
  optimal_ever_s: number | null;
  best_per_sector: number[] | null;
}

function fmtLap(s: number | null | undefined): string {
  if (s == null || !isFinite(s)) return "—";
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  return `${m}:${r.toFixed(3).padStart(6, "0")}`;
}

function fmtDelta(d: number | null) {
  if (d == null || !isFinite(d)) return "—";
  const sign = d > 0 ? "+" : "";
  return `${sign}${d.toFixed(3)}s`;
}

function deltaColor(d: number | null) {
  if (d == null) return "text-zinc-400";
  if (d < -0.05) return "text-emerald-400";
  if (d > 0.05) return "text-rose-400";
  return "text-zinc-200";
}

export function FingerprintDelta({ track, car, thisLapS, thisSectors }: Props) {
  const [fp, setFp] = useState<Fp | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!track || !car) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const r = (await getFingerprintForPair({ data: { track, car } })) as { fp: Fp | null };
        if (!cancelled) setFp(r.fp);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [track, car]);

  const pb = fp?.best_ever_s ?? null;
  const opt = fp?.optimal_ever_s ?? null;
  const dPb = thisLapS != null && pb != null ? +(thisLapS - pb).toFixed(3) : null;
  const dOpt = thisLapS != null && opt != null ? +(thisLapS - opt).toFixed(3) : null;

  return (
    <div className="hairline rounded-md bg-panel p-3">
      <div className="mb-2 flex items-center gap-2">
        <Fingerprint className="h-3.5 w-3.5 text-primary" />
        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Fingerprint Delta
        </div>
        {fp && (
          <div className="ml-auto font-mono text-[10px] text-muted-foreground">
            {classifyCar(fp.car)} · {fp.track}
          </div>
        )}
      </div>

      {!track || !car ? (
        <div className="text-[11px] text-muted-foreground">Session has no track/car metadata.</div>
      ) : loading ? (
        <div className="text-[11px] text-muted-foreground">Looking up your baseline…</div>
      ) : !fp ? (
        <div className="text-[11px] text-muted-foreground">
          No fingerprint match for this pair.{" "}
          <Link to="/fingerprint" className="text-primary underline">
            Build your fingerprint
          </Link>{" "}
          to compare against your all-time PB.
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 font-mono text-[11px]">
          <Cell label="This best" value={fmtLap(thisLapS ?? null)} />
          <Cell
            label="All-time PB"
            value={fmtLap(pb)}
            sub={dPb != null ? fmtDelta(dPb) : undefined}
            subClass={deltaColor(dPb)}
            icon={dPb}
          />
          <Cell
            label="Optimal"
            value={fmtLap(opt)}
            sub={dOpt != null ? fmtDelta(dOpt) : undefined}
            subClass={deltaColor(dOpt)}
            icon={dOpt}
          />
          <Cell
            label="Sectors vs best"
            value={
              thisSectors && fp.best_per_sector && fp.best_per_sector.length
                ? thisSectors
                    .map((s, i) =>
                      fp.best_per_sector && fp.best_per_sector[i] != null
                        ? (s - fp.best_per_sector[i]).toFixed(2)
                        : "—",
                    )
                    .join(" / ")
                : "—"
            }
          />
        </div>
      )}
    </div>
  );
}

function Cell({
  label,
  value,
  sub,
  subClass,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  subClass?: string;
  icon?: number | null;
}) {
  const Icon =
    icon == null ? Minus : icon < -0.05 ? TrendingDown : icon > 0.05 ? TrendingUp : Minus;
  return (
    <div className="rounded-sm bg-rail px-2 py-1.5">
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="tabular-nums text-zinc-100">{value}</div>
      {sub && (
        <div className={`flex items-center gap-1 text-[10px] tabular-nums ${subClass ?? ""}`}>
          <Icon className="h-3 w-3" />
          {sub}
        </div>
      )}
    </div>
  );
}
