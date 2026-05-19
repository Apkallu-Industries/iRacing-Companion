import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Fingerprint, History } from "lucide-react";
import type { Telemetry } from "@/lib/telemetry-types";
import { useAuth } from "@/lib/auth";
import { getFingerprintForPair, getLastSessionForPair } from "@/lib/fingerprint.functions";

function fmtLap(s: number | null | undefined): string {
  if (s == null || !isFinite(s)) return "—";
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  return `${m}:${r.toFixed(3).padStart(6, "0")}`;
}

function relativeTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso).getTime();
  if (!isFinite(d)) return "";
  const diff = Date.now() - d;
  const day = 86400000;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < day) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / day)}d ago`;
}

function parseLapStr(s: string | null | undefined): number | null {
  if (!s || s === "--.---" || s === "--:--.---") return null;
  const m = /^(?:(\d+):)?(\d+(?:\.\d+)?)$/.exec(s.trim());
  if (!m) return null;
  const mins = m[1] ? parseInt(m[1], 10) : 0;
  return mins * 60 + parseFloat(m[2]);
}

export function LiveReference({ t }: { t: Telemetry }) {
  const { user } = useAuth();
  const [fp, setFp] = useState<{ best_ever_s: number; optimal_ever_s: number | null } | null>(null);
  const [lastSess, setLastSess] = useState<{
    id: string;
    name: string;
    recorded_at: string | null;
    best_lap_s: number | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !t.track || !t.car) {
      setFp(null);
      setLastSess(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const [fpR, sessR] = await Promise.all([
          getFingerprintForPair({ data: { track: t.track, car: t.car } }) as Promise<{ fp: typeof fp }>,
          getLastSessionForPair({ data: { track: t.track, car: t.car } }) as Promise<{ session: typeof lastSess }>,
        ]);
        if (cancelled) return;
        setFp(fpR.fp);
        setLastSess(sessR.session);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, t.track, t.car]);

  const liveBest = parseLapStr(t.bestLap);
  const pb = fp?.best_ever_s ?? null;
  const opt = fp?.optimal_ever_s ?? null;
  const last = lastSess?.best_lap_s != null ? Number(lastSess.best_lap_s) : null;

  const dPb = liveBest != null && pb != null ? +(liveBest - pb).toFixed(3) : null;
  const dOpt = liveBest != null && opt != null ? +(liveBest - opt).toFixed(3) : null;
  const dLast = liveBest != null && last != null ? +(liveBest - last).toFixed(3) : null;

  return (
    <div className="bg-zinc-925 ring-1 ring-white/5 rounded-lg p-4">
      <div className="mb-3 flex items-center gap-2">
        <Fingerprint className="h-3.5 w-3.5 text-racing-cyan" />
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-zinc-300 font-medium">
          Reference Pace
        </h2>
        {!user && (
          <span className="ml-auto text-[10px] font-mono text-racing-orange">Sign in to use baseline</span>
        )}
        {user && !fp && !loading && (
          <Link
            to="/fingerprint"
            className="ml-auto text-[10px] font-mono text-racing-cyan hover:underline"
          >
            Build fingerprint →
          </Link>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2 font-mono text-[11px]">
        <RefCell label="This best" value={fmtLap(liveBest)} highlight />
        <RefCell
          label="All-time PB"
          value={fmtLap(pb)}
          delta={dPb}
          sub={fp ? "fingerprint" : loading ? "…" : "—"}
        />
        <RefCell
          label="Optimal"
          value={fmtLap(opt)}
          delta={dOpt}
          sub={fp ? "theoretical" : "—"}
        />
        <RefCell
          label="Last session"
          value={fmtLap(last)}
          delta={dLast}
          sub={lastSess ? relativeTime(lastSess.recorded_at) : loading ? "…" : "no upload"}
          link={lastSess ? `/sessions/${lastSess.id}` : undefined}
        />
      </div>

      {lastSess && (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
          <History className="h-3 w-3" />
          <span className="truncate">{lastSess.name}</span>
        </div>
      )}
    </div>
  );
}

function RefCell({
  label,
  value,
  delta,
  sub,
  highlight,
  link,
}: {
  label: string;
  value: string;
  delta?: number | null;
  sub?: string;
  highlight?: boolean;
  link?: string;
}) {
  const dColor =
    delta == null
      ? "text-zinc-500"
      : delta < -0.05
        ? "text-emerald-400"
        : delta > 0.05
          ? "text-rose-400"
          : "text-zinc-300";
  const dStr = delta == null ? "" : `${delta > 0 ? "+" : ""}${delta.toFixed(3)}s`;
  const inner = (
    <div className="rounded-sm bg-zinc-900/60 px-2 py-1.5">
      <div className="text-[9px] uppercase tracking-widest text-zinc-500">{label}</div>
      <div className={`tabular-nums ${highlight ? "text-racing-cyan" : "text-zinc-100"}`}>{value}</div>
      <div className={`text-[10px] tabular-nums ${dColor}`}>{dStr || (sub ?? "\u00a0")}</div>
      {dStr && sub && <div className="text-[9px] uppercase tracking-widest text-zinc-600">{sub}</div>}
    </div>
  );
  return link ? (
    <Link to={link} className="block hover:ring-1 hover:ring-racing-cyan/40 rounded-sm">
      {inner}
    </Link>
  ) : (
    inner
  );
}
