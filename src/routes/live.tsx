import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { BackButton } from "@/components/BackButton";
import { useTelemetry } from "@/lib/useTelemetry";
import { useTelemetryBuffer, type Sample } from "@/lib/useTelemetryBuffer";
import { useBridgeDiagnostics } from "@/lib/bridgeDiagnostics";
import type { Telemetry } from "@/lib/telemetry-types";
import { LiveCoach } from "@/components/live/LiveCoach";
import { LiveReference } from "@/components/live/LiveReference";
import { BridgeInstall } from "@/components/live/BridgeInstall";
import { RecordingControls } from "@/components/live/RecordingControls";
import { AdvisorButton } from "@/components/live/AdvisorButton";
import { FingerprintUploadCard } from "@/components/live/FingerprintUploadCard";
import {
  TraceStack,
  GGScatter,
  type SmoothingMode,
  type CursorInfo,
} from "@/components/live/MotecPanels";
import { DerivedMetrics } from "@/components/live/DerivedMetrics";
import { ConfigurableChannelList } from "@/components/live/ConfigurableChannelList";
import { GearAdvisor } from "@/components/live/GearAdvisor";
import { DesktopLapSync } from "@/components/live/DesktopLapSync";
import { BridgeConnectionBanner } from "@/components/live/BridgeConnectionBanner";
import { DiagnosticsPanel } from "@/components/live/DiagnosticsPanel";
import { TabedAnalysisPanel } from "@/components/live/TabedAnalysisPanel";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "Pit Wall — Live iRacing Telemetry Workbench" },
      {
        name: "description",
        content:
          "MoTeC-style live iRacing telemetry workbench. Rolling channel traces, G-G scatter, channel list, sector + tyre data straight from the bridge.",
      },
      { property: "og:title", content: "Pit Wall — Live iRacing Telemetry Workbench" },
      {
        property: "og:description",
        content:
          "MoTeC-style live iRacing telemetry workbench. Rolling channel traces, G-G scatter, channel list, sector + tyre data straight from the bridge.",
      },
      { property: "og:url", content: "https://iracing-companion.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://iracing-companion.lovable.app/" }],
  }),
  component: Dashboard,
});

function Dashboard() {
  const t = useTelemetry();
  const samples = useTelemetryBuffer(t, 30_000, 30);
  const diagnostics = useBridgeDiagnostics(t, t.connected);
  const [smoothing, setSmoothing] = useState<SmoothingMode>("none");
  const [smoothWindow, setSmoothWindow] = useState<number>(5);
  const [cursor, setCursor] = useState<CursorInfo | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const handleCursor = useCallback((c: CursorInfo | null) => setCursor(c), []);

  // Keyboard shortcut for debug mode (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "D") {
        e.preventDefault();
        setDebugMode((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Check query param for debug mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("debug") === "1") {
      setDebugMode(true);
    }
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-200 font-mono p-0 select-none flex flex-col overflow-hidden">
      <TopBar t={t} />
      <BridgeConnectionBanner t={t} />
      <RpmBar rpm={t.rpm} warn={t.rpmShiftWarn} red={t.rpmShiftRedline} max={t.rpmMax} />

      {/* Main content: Fill all remaining vertical space */}
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-0">
        {/* Left column: Channels + Metrics */}
        <section className="col-span-3 flex flex-col overflow-hidden border-r border-zinc-900">
          <div className="flex-1 min-h-0 overflow-auto">
            <ConfigurableChannelList t={t} />
          </div>
          <div className="border-t border-zinc-900">
            <SectorPanel t={t} />
          </div>
          <div className="border-t border-zinc-900 flex-1 min-h-0 overflow-auto">
            <TirePanel t={t} />
          </div>
        </section>

        {/* Center column: Main traces (fill most space) */}
        <section className="col-span-6 flex flex-col overflow-hidden border-r border-zinc-900">
          <div className="flex items-center justify-between px-2 py-1 border-b border-zinc-900 flex-shrink-0 bg-zinc-925">
            <PanelHeader
              title="Time Trace"
              right={
                cursor ? `cursor t=${(cursor.sample.t / 1000).toFixed(2)}s` : "Last 30s · 30Hz"
              }
            />
            <FilterControls
              mode={smoothing}
              window={smoothWindow}
              onMode={setSmoothing}
              onWindow={setSmoothWindow}
            />
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <TraceStack
              samples={samples}
              smoothing={smoothing}
              smoothWindow={smoothWindow}
              onCursorChange={handleCursor}
            />
          </div>
          <div className="border-t border-zinc-900 flex-shrink-0">
            <InputBars t={t} />
          </div>
          <div className="border-t border-zinc-900 flex-shrink-0 max-h-24">
            <DerivedMetrics samples={samples} t={t} cursor={cursor} />
          </div>
        </section>

        {/* Right column: Analysis Panels + Coach */}
        <section className="col-span-3 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-hidden border-b border-zinc-900">
            <TabedAnalysisPanel
              samples={samples}
              ggScatterComponent={<GGScatterPanel samples={samples} />}
            />
          </div>
          <div className="flex-1 min-h-0 overflow-auto">
            <LiveCoach t={t} />
          </div>
        </section>
      </div>

      {/* Bottom bar: Controls (no gaps, packed) */}
      <div className="border-t border-zinc-900 bg-zinc-925 px-2 py-1 flex flex-wrap gap-1 items-center text-xs flex-shrink-0">
        {t.connected ? <RecordingControls t={t} /> : <BridgeInstall iracingLive={t.connected} />}
        <GearAdvisor t={t} samples={samples} />
        <AdvisorButton t={t} />
        <LiveReference t={t} />
        <FingerprintUploadCard />
        <DesktopLapSync />
      </div>

      <FooterBar t={t} />
      {debugMode && <DiagnosticsPanel diagnostics={diagnostics} />}
    </main>
  );
}

/* ──────────────────────────────────────────────────────────── Top bar */

function TopBar({ t }: { t: Telemetry }) {
  return (
    <header className="flex items-center gap-3 border-b border-zinc-900 pb-2 text-[11px] uppercase tracking-wider">
      <BackButton />
      <span className="rounded-sm bg-zinc-900 px-2 py-1 text-zinc-400">Pit Wall i2</span>
      <div className="flex items-center gap-4 text-zinc-500">
        <Field label="Session" value={t.session} />
        <Field label="Track" value={t.track} />
        <Field label="Car" value={`${t.car} #${t.carNumber}`} />
      </div>
      <div className="ml-auto flex items-center gap-3 text-zinc-500">
        <Field label="Best" value={t.bestLap} mono valueClass="text-emerald-400" />
        <Field label="Last" value={t.lastLap} mono />
        <Field
          label="Δ"
          value={`${t.deltaSec >= 0 ? "+" : ""}${t.deltaSec.toFixed(3)}`}
          mono
          valueClass={t.deltaSec < 0 ? "text-emerald-400" : "text-rose-400"}
        />
        <div className="flex items-center gap-1.5 rounded-sm bg-zinc-900 px-2 py-1">
          <span
            className={`size-1.5 rounded-full ${t.connected ? "bg-emerald-500" : "bg-amber-500"}`}
          />
          <span className="text-[10px]">
            {t.connected ? `${t.sdkVersion} · ${t.latencyMs}ms` : "Simulated"}
          </span>
        </div>
        <Link
          to="/settings"
          className="flex h-6 w-6 items-center justify-center rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-primary hover:border-primary/50 transition-all hover:scale-110 group cursor-pointer"
          title="Settings"
        >
          <Settings className="h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-90 text-zinc-500 group-hover:text-primary" />
        </Link>
      </div>
    </header>
  );
}

function Field({
  label,
  value,
  mono,
  valueClass = "",
}: {
  label: string;
  value: string;
  mono?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-[9px] text-zinc-600">{label}</span>
      <span className={`${mono ? "tabular-nums" : ""} text-zinc-300 ${valueClass}`}>{value}</span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── RPM bar */

function RpmBar({ rpm, warn, red, max }: { rpm: number; warn: number; red: number; max: number }) {
  const pct = Math.max(0, Math.min(1, rpm / max));
  const warnFrac = warn / max;
  const redFrac = red / max;
  const color = rpm > red ? "bg-rose-500" : rpm > warn ? "bg-amber-400" : "bg-emerald-500";
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-sm bg-zinc-900 relative">
      <div className={`h-full ${color} transition-[width]`} style={{ width: `${pct * 100}%` }} />
      <div
        className="absolute inset-y-0 w-px bg-amber-500/50"
        style={{ left: `${warnFrac * 100}%` }}
      />
      <div
        className="absolute inset-y-0 w-px bg-rose-500/70"
        style={{ left: `${redFrac * 100}%` }}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── Panel header */

function PanelHeader({ title, right }: { title: string; right?: string }) {
  return (
    <div className="flex items-baseline justify-between px-1">
      <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{title}</span>
      {right && <span className="text-[10px] tabular-nums text-zinc-600">{right}</span>}
    </div>
  );
}

function FilterControls({
  mode,
  window: win,
  onMode,
  onWindow,
}: {
  mode: SmoothingMode;
  window: number;
  onMode: (m: SmoothingMode) => void;
  onWindow: (n: number) => void;
}) {
  const modes: Array<{ k: SmoothingMode; label: string }> = [
    { k: "none", label: "RAW" },
    { k: "ma", label: "MA" },
    { k: "lp", label: "LP" },
  ];
  return (
    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider">
      <span className="text-zinc-600">Filter</span>
      <div className="flex overflow-hidden rounded-sm border border-zinc-800">
        {modes.map((m) => (
          <button
            key={m.k}
            type="button"
            onClick={() => onMode(m.k)}
            className={`px-2 py-0.5 ${
              mode === m.k
                ? "bg-zinc-800 text-zinc-100"
                : "bg-zinc-950 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      {mode !== "none" && (
        <label className="flex items-center gap-1.5 text-zinc-500">
          <span>N</span>
          <input
            type="range"
            min={2}
            max={30}
            value={win}
            onChange={(e) => onWindow(Number(e.target.value))}
            className="h-1 w-20 accent-amber-500"
          />
          <span className="w-5 text-right tabular-nums text-zinc-300">{win}</span>
        </label>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── Sectors */

function SectorPanel({ t }: { t: Telemetry }) {
  const rows: Array<{ key: "s1" | "s2" | "s3"; idx: 1 | 2 | 3 }> = [
    { key: "s1", idx: 1 },
    { key: "s2", idx: 2 },
    { key: "s3", idx: 3 },
  ];
  return (
    <div className="rounded-sm border border-zinc-900 bg-zinc-950">
      <div className="border-b border-zinc-900 px-2 py-1.5 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
        Sectors
      </div>
      <ul className="divide-y divide-zinc-900">
        {rows.map(({ key, idx }) => {
          const time = t.sectors[key];
          const isBest = t.sectors.bestSector === idx;
          return (
            <li key={key} className="flex items-center gap-2 px-2 py-1.5 text-[11px]">
              <span
                className={`size-1.5 rounded-full ${
                  !time ? "bg-zinc-700" : isBest ? "bg-emerald-500" : "bg-rose-500"
                }`}
              />
              <span className="w-8 text-zinc-500">S{idx}</span>
              <span
                className={`ml-auto tabular-nums ${isBest ? "text-emerald-400" : "text-zinc-100"}`}
              >
                {time ?? "--.---"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── Input bars */

function InputBars({ t }: { t: Telemetry }) {
  return (
    <div className="rounded-sm border border-zinc-900 bg-zinc-950 p-2">
      <div className="grid grid-cols-3 gap-3">
        <Bar label="THR" value={t.throttle} color="#22c55e" />
        <Bar label="BRK" value={t.brake} color="#ef4444" />
        <SteerBar deg={t.steeringDeg} />
      </div>
    </div>
  );
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="w-7 text-zinc-500">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-sm bg-zinc-900">
        <div className="h-full" style={{ width: `${value * 100}%`, background: color }} />
      </div>
      <span className="w-8 text-right tabular-nums text-zinc-300">{Math.round(value * 100)}</span>
    </div>
  );
}

function SteerBar({ deg }: { deg: number }) {
  const clamped = Math.max(-180, Math.min(180, deg));
  const leftPct = 50 + (clamped / 180) * 50;
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="w-7 text-zinc-500">STR</span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-sm bg-zinc-900">
        <div className="absolute inset-y-0 left-1/2 w-px bg-zinc-700" />
        <div
          className="absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400"
          style={{ left: `${leftPct}%` }}
        />
      </div>
      <span className="w-8 text-right tabular-nums text-zinc-300">{Math.round(deg)}°</span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── Tires */

function TirePanel({ t }: { t: Telemetry }) {
  const corners: Array<{ key: "fl" | "fr" | "rl" | "rr"; label: string }> = [
    { key: "fl", label: "FL" },
    { key: "fr", label: "FR" },
    { key: "rl", label: "RL" },
    { key: "rr", label: "RR" },
  ];
  const stateColor = (s: "cold" | "ok" | "hot") =>
    s === "hot" ? "text-amber-400" : s === "cold" ? "text-sky-400" : "text-emerald-400";
  return (
    <div className="rounded-sm border border-zinc-900 bg-zinc-950">
      <div className="border-b border-zinc-900 px-2 py-1.5 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
        Tyres
      </div>
      <div className="grid grid-cols-2 gap-px bg-zinc-900">
        {corners.map(({ key, label }) => {
          const c = t.tires[key];
          return (
            <div key={key} className="bg-zinc-950 p-2">
              <div className="flex items-baseline justify-between">
                <span className="text-[9px] text-zinc-500">{label}</span>
                <span className={`text-[9px] uppercase ${stateColor(c.state)}`}>{c.state}</span>
              </div>
              <div className="mt-0.5 flex items-baseline justify-between tabular-nums">
                <span className="text-sm text-zinc-100">{Math.round(c.tempC)}°</span>
                <span className="text-[10px] text-zinc-400">{c.pressureBar.toFixed(2)} bar</span>
              </div>
              <div className="mt-1 h-0.5 w-full overflow-hidden rounded-sm bg-zinc-900">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${Math.max(0, Math.min(100, c.wearPct))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── Footer */

function FooterBar({ t }: { t: Telemetry }) {
  return (
    <footer className="mt-3 flex items-center gap-4 rounded-sm border border-zinc-900 bg-zinc-950 px-3 py-1.5 text-[10px] text-zinc-500">
      <span>
        DRS <span className="text-zinc-300">{t.drsAvailable ? "AVAIL" : "OFF"}</span>
      </span>
      <span>
        BBIAS <span className="tabular-nums text-zinc-300">{t.brakeBias.toFixed(1)}%</span>
      </span>
      <span>
        DIFF <span className="tabular-nums text-zinc-300">MAP {t.diffMap}</span>
      </span>
      <div className="ml-auto flex items-center gap-4 tabular-nums">
        <span>
          AIR <span className="text-zinc-300">{t.airTempC}°C</span>
        </span>
        <span>
          TRACK <span className="text-zinc-300">{t.trackTempC}°C</span>
        </span>
        <span>
          SOF <span className="text-zinc-300">{t.sof.toLocaleString()}</span>
        </span>
        <span>
          SR <span className="text-zinc-300">{t.safetyRating.toFixed(2)}</span>
        </span>
      </div>
    </footer>
  );
}

function GGScatterPanel({ samples }: { samples: Sample[] }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-2 py-1 border-b border-zinc-900 bg-zinc-925">
        <PanelHeader title="G-G Diagram" right={`${samples.length} pts`} />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <GGScatter samples={samples} />
      </div>
    </div>
  );
}
