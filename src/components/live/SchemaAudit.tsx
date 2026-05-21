import { useEffect, useMemo, useState } from "react";
import { Download, FileSearch, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { auditCoverage, groupMissing } from "@/lib/ibt/schemaAudit";
import type { Telemetry } from "@/lib/telemetry-types";

/**
 * Live schema-coverage audit for the bridge.
 *
 * - Compares the current bridge `extras` channel list against the curated
 *   iRacing .ibt channel catalog and reports missing channels grouped by
 *   ATLAS-style category.
 * - Exposes a "Download schema" button that pulls the full per-channel
 *   header (name, type code, array length) from `/api/schema` so you can
 *   verify the bridge matches an .ibt layout for the current car.
 * - Surfaces the bridge's active limits (array depth, extras KB cap,
 *   WebSocket Hz, sample Hz) as reported by `/api/config`, so you can
 *   confirm tuning before recording.
 */
const BRIDGE_BASE = "http://localhost:3001";

interface BridgeConfig {
  tickHz: number;
  wsHz: number;
  arrayDepth: number;
  extrasMaxBytes: number;
  connected: boolean;
  packets: number;
}

export function SchemaAudit({ t }: { t: Telemetry }) {
  const [config, setConfig] = useState<BridgeConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [loadingSchema, setLoadingSchema] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`${BRIDGE_BASE}/api/config`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data: BridgeConfig) => { if (alive) setConfig(data); })
      .catch((e) => { if (alive) setConfigError((e as Error).message); });
    return () => { alive = false; };
  }, []);

  const captured = useMemo(() => {
    const names = new Set<string>(
      ["Speed", "RPM", "Gear", "Throttle", "Brake", "Clutch", "SteeringWheelAngle",
        "LatAccel", "LongAccel", "FuelLevel", "AirTemp", "TrackTempCrew", "dcBrakeBias"],
    );
    if (t.extras) for (const k of Object.keys(t.extras)) names.add(k);
    return Array.from(names);
  }, [t.extras]);

  const report = useMemo(() => auditCoverage(captured), [captured]);
  const grouped = useMemo(() => groupMissing(report.missing), [report.missing]);

  const downloadSchema = async () => {
    setLoadingSchema(true);
    try {
      const res = await fetch(`${BRIDGE_BASE}/api/schema?download=1`);
      if (!res.ok) throw new Error(`Bridge schema unavailable (HTTP ${res.status}). Start iRacing first.`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pitwall-schema-${Date.now()}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      toast.success("Bridge schema downloaded");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoadingSchema(false);
    }
  };

  const pctClass =
    report.coveragePct >= 80 ? "text-racing-green" :
    report.coveragePct >= 50 ? "text-amber-400" : "text-racing-red";

  return (
    <div className="rounded-lg bg-zinc-925 ring-1 ring-white/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-zinc-300 font-medium flex items-center gap-1.5">
          <FileSearch className="h-3 w-3" />
          Schema audit
        </h2>
        <span className={`text-xs font-mono ${pctClass}`}>
          {report.coveragePct.toFixed(0)}% coverage
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 font-mono text-xs mb-3">
        <Stat label="CAPTURED" value={String(report.capturedCount)} />
        <Stat label="EXPECTED" value={String(report.expectedCount)} />
        <Stat label="MISSING" value={String(report.missingCount)} tone={report.missingCount > 0 ? "warn" : "ok"} />
        <Stat label="BONUS" value={String(report.extra.length)} />
      </div>

      {config && (
        <div className="grid grid-cols-4 gap-2 font-mono text-xs mb-3">
          <Stat label="ARR DEPTH" value={String(config.arrayDepth)} />
          <Stat label="EXTRAS KB" value={String(Math.round(config.extrasMaxBytes / 1024))} />
          <Stat label="WS HZ" value={String(config.wsHz)} />
          <Stat label="TICK HZ" value={String(config.tickHz)} />
        </div>
      )}

      {configError && (
        <p className="text-[10px] text-amber-400 mb-2 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> Bridge config unreachable — {configError}.
          Tune via env vars <code className="text-zinc-400">PITWALL_ARRAY_DEPTH</code>,{" "}
          <code className="text-zinc-400">PITWALL_EXTRAS_MAX_KB</code>,{" "}
          <code className="text-zinc-400">PITWALL_WS_HZ</code> on the bridge process.
        </p>
      )}

      <button
        onClick={downloadSchema}
        disabled={loadingSchema}
        className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-3 py-1.5 text-xs font-mono uppercase tracking-wider disabled:opacity-40 mb-3"
      >
        <Download className="h-3.5 w-3.5" />
        {loadingSchema ? "Loading…" : "Download bridge schema"}
      </button>

      {report.missingCount === 0 ? (
        <p className="text-[11px] text-racing-green flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          All catalog channels covered by the bridge.
        </p>
      ) : (
        <details className="text-[11px]">
          <summary className="cursor-pointer text-zinc-300 hover:text-white">
            Missing channels by group ({report.missingCount})
          </summary>
          <div className="mt-2 space-y-2 max-h-64 overflow-y-auto pr-1">
            {Object.entries(grouped).map(([group, entries]) => (
              <div key={group}>
                <p className="text-[10px] uppercase text-zinc-500">{group} · {entries.length}</p>
                <ul className="font-mono text-[10px] text-zinc-400 leading-snug">
                  {entries.map((e) => (
                    <li key={e.name} title={e.desc}>
                      <span className="text-zinc-300">{e.name}</span>
                      <span className="text-zinc-600"> — {e.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "ok" | "warn" }) {
  const color = tone === "warn" ? "text-amber-400" : tone === "ok" ? "text-racing-green" : "text-zinc-200";
  return (
    <div className="bg-zinc-900/60 rounded p-2">
      <p className="text-[9px] text-zinc-400 uppercase">{label}</p>
      <p className={`text-sm tabular-nums ${color}`}>{value}</p>
    </div>
  );
}
