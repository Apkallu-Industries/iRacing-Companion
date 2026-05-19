import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { BackButton } from "@/components/BackButton";
import { useTelemetry } from "@/lib/useTelemetry";
import { useTelemetryBuffer } from "@/lib/useTelemetryBuffer";
import type { Telemetry } from "@/lib/telemetry-types";
import { LiveCoach } from "@/components/live/LiveCoach";
import { LiveReference } from "@/components/live/LiveReference";
import { BridgeInstall } from "@/components/live/BridgeInstall";
import { RecordingControls } from "@/components/live/RecordingControls";
import { AdvisorButton } from "@/components/live/AdvisorButton";
import { FingerprintUploadCard } from "@/components/live/FingerprintUploadCard";
import { TraceStack, GGScatter, type SmoothingMode, type CursorInfo } from "@/components/live/MotecPanels";
import { DerivedMetrics } from "@/components/live/DerivedMetrics";
import { ConfigurableChannelList } from "@/components/live/ConfigurableChannelList";
import { GearAdvisor } from "@/components/live/GearAdvisor";
import { DesktopLapSync } from "@/components/live/DesktopLapSync";

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
    links: [
      { rel: "canonical", href: "https://iracing-companion.lovable.app/" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const t = useTelemetry();
  const samples = useTelemetryBuffer(t, 30_000, 30);
  const [smoothing, setSmoothing] = useState<SmoothingMode>("none");
  const [smoothWindow, setSmoothWindow] = useState<number>(5);
  const [cursor, setCursor] = useState<CursorInfo | null>(null);
  const handleCursor = useCallback((c: CursorInfo | null) => setCursor(c), []);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-200 font-mono p-4 select-none">
      <TopBar t={t} />
      <RpmBar rpm={t.rpm} warn={t.rpmShiftWarn} red={t.rpmShiftRedline} max={t.rpmMax} />

      <div className="mt-3 grid grid-cols-12 gap-3">
        <section className="col-span-3 space-y-3">
          <ConfigurableChannelList t={t} />
          <SectorPanel t={t} />
        </section>

        <section className="col-span-6 space-y-3">
          <div className="flex items-center justify-between px-1">
            <PanelHeader
              title="Time Trace"
              right={cursor ? `cursor t=${(cursor.sample.t / 1000).toFixed(2)}s` : "Last 30s · 30Hz"}
            />
            <FilterControls
              mode={smoothing}
              window={smoothWindow}
              onMode={setSmoothing}
              onWindow={setSmoothWindow}
            />
          </div>
          <TraceStack
            samples={samples}
            smoothing={smoothing}
            smoothWindow={smoothWindow}
            onCursorChange={handleCursor}
          />
          <InputBars t={t} />
          <DerivedMetrics samples={samples} t={t} cursor={cursor} />
        </section>

        <section className="col-span-3 space-y-3">
          <PanelHeader title="G-G Diagram" right={`${samples.length} pts`} />
          <GGScatter samples={samples} />
          <TirePanel t={t} />
          <GearAdvisor t={t} samples={samples} />
        </section>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {t.connected ? <RecordingControls t={t} /> : <BridgeInstall />}
        <LiveReference t={t} />
        <LiveCoach t={t} />
        <AdvisorButton t={t} />
        <FingerprintUploadCard />
        <DesktopLapSync />
      </div>

      <FooterBar t={t} />
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
            className={`size-1.5 rounded-full ${
              t.connected ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
          <span className="text-[10px]">
            {t.connected ? `${t.sdkVersion} · ${t.latencyMs}ms` : "Simulated"}
          </span>
        </div>
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
              mode === m.k ? "bg-zinc-800 text-zinc-100" : "bg-zinc-950 text-zinc-500 hover:text-zinc-300"
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
                className={`ml-auto tabular-nums ${
                  isBest ? "text-emerald-400" : "text-zinc-100"
                }`}
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
