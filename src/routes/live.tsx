import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import { Settings, Palette } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { BackButton } from "@/components/BackButton";
import { useWorkbench } from "@/lib/store";
import { WORKSPACES } from "@/lib/workspaces";
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
import { TelemetryEventTimeline } from "@/components/workbench/TelemetryEventTimeline";
import { DerivedMetrics } from "@/components/live/DerivedMetrics";
import { ConfigurableChannelList } from "@/components/live/ConfigurableChannelList";
import { GearAdvisor } from "@/components/live/GearAdvisor";
import { BridgeConnectionBanner } from "@/components/live/BridgeConnectionBanner";
import { DiagnosticsPanel } from "@/components/live/DiagnosticsPanel";
import { TabedAnalysisPanel } from "@/components/live/TabedAnalysisPanel";
import { useTheme } from "@/lib/themeContext";
import { LAYOUT_PROFILES, type LayoutProfile } from "@/lib/layoutProfiles";
import { PRESETS, DARK_THEME } from "@/lib/theme";
import { F1SpeedGauge } from "@/components/live/F1SpeedGauge";
import { F1LapHero } from "@/components/live/F1LapHero";
import { F1SectorTable } from "@/components/live/F1SectorTable";
import { F1TyreDisplay } from "@/components/live/F1TyreDisplay";
import { F1QuickStats } from "@/components/live/F1QuickStats";
import { F1SectorComparison } from "@/components/live/F1SectorComparison";
import { RaceCommandLayout } from "@/components/live/RaceCommandLayout";

import { WORKSPACE_PRESETS, TELEMETRY_INSTRUMENTS } from "@/components/instruments/registry";

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
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const t = useTelemetry();
  const samples = useTelemetryBuffer(t, 30_000, 60);
  const diagnostics = useBridgeDiagnostics(t, t.connected);
  const [smoothing, setSmoothing] = useState<SmoothingMode>("none");
  const [smoothWindow, setSmoothWindow] = useState<number>(5);
  const [cursor, setCursor] = useState<CursorInfo | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const handleCursor = useCallback((c: CursorInfo | null) => setCursor(c), []);
  const { layout } = useTheme();
  const isF1Layout = (layout as string) === "f1";
  const isRaceCommand = (layout as string) === "racecommand";

  // Active Workspace Preset
  const [activePreset, setActivePreset] = useState<keyof typeof WORKSPACE_PRESETS>("gt3");

  // Global Contextual Channel Listener to auto-shift active preset
  useEffect(() => {
    const handleChannelClick = (e: Event) => {
      const channel = ((e as CustomEvent).detail?.channel || "").toLowerCase();
      if (["brake", "bias", "press", "tempc"].some(k => channel.includes(k))) {
        setActivePreset("gt3");
      } else if (["ers", "soc", "mgu", "hybrid", "power", "charge"].some(k => channel.includes(k))) {
        setActivePreset("gtp");
      } else if (["suspension", "damper", "ride", "pitch", "roll", "yaw", "accel", "heave"].some(k => channel.includes(k))) {
        setActivePreset("aero");
      } else if (["throttle", "steer", "clutch", "input"].some(k => channel.includes(k))) {
        setActivePreset("coach");
      }
    };
    window.addEventListener("pitwall-contextual-channel", handleChannelClick);
    return () => window.removeEventListener("pitwall-contextual-channel", handleChannelClick);
  }, []);

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

  // Check query param for debug mode (robust against accidental spaces/percent-encodings)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasDebug = Array.from(params.entries()).some(
      ([key, val]) => key.trim() === "debug" && val.trim() === "1"
    );
    if (hasDebug) {
      setDebugMode(true);
    }
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground font-mono p-0 select-none flex flex-col overflow-hidden">
      <TopBar t={t} />
      <BridgeConnectionBanner t={t} />
      <RpmBar rpm={t.rpm} warn={t.rpmShiftWarn} red={t.rpmShiftRedline} max={t.rpmMax} />


      {isRaceCommand ? (
        <RaceCommandLayout t={t} samples={samples} />
      ) : isF1Layout ? (
        /* ═══════════════ F1 LAYOUT ═══════════════ */
        <>
          {/* Top section: 3-column grid */}
          <div className="flex-1 min-h-0 grid grid-cols-12 gap-0">
            {/* Left column: Lap info + Speed gauge + Quick stats */}
            <section className="col-span-3 flex flex-col overflow-hidden border-r border-border">
              {/* Live Telemetry header */}
              <div className="flex items-center gap-2 border-b border-border px-3 py-1.5 text-[10px] flex-shrink-0">
                <span className="uppercase tracking-wider text-muted-foreground">Live Telemetry</span>
                <span className={`size-1.5 rounded-full ${t.connected ? "bg-emerald-500" : "bg-amber-500"}`} />
                <span className="text-muted-foreground">{t.connected ? "Connected" : "Simulated"}</span>
                {t.connected && <span className="text-muted-foreground ml-auto">{t.latencyMs}ms</span>}
              </div>

              {/* Lap hero */}
              <F1LapHero t={t} />

              {/* Sectors */}
              <F1SectorTable t={t} />

              {/* Speed gauge + Gear */}
              <div className="flex-1 flex flex-col items-center justify-center border-b border-border px-3 py-2">
                <F1SpeedGauge t={t} />
                <div className="mt-1 text-center">
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Gear</div>
                  <div className="font-mono text-[32px] font-bold leading-none text-foreground">{t.gear}</div>
                </div>
              </div>

              {/* Quick stats: THR/BRK/DRS/Fuel */}
              <div className="flex-shrink-0">
                <F1QuickStats t={t} />
              </div>
            </section>

            {/* Center column: Traces */}
            <section className="col-span-6 flex flex-col overflow-hidden border-r border-border">
              <div className="flex items-center justify-between px-2 py-1 border-b border-border flex-shrink-0 bg-panel-2">
                <PanelHeader
                  title="Time Trace"
                  right={
                    cursor ? `cursor t=${(cursor.sample.t / 1000).toFixed(2)}s` : "Last 30s · 60Hz"
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
            </section>

            {/* Right column: Track map placeholder + G-G + Tyres */}
            <section className="col-span-3 flex flex-col overflow-hidden">
              {/* Track Map placeholder */}
              <div className="border-b border-border px-2 py-1.5 flex-shrink-0">
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Track Map</div>
                <div className="h-28 flex items-center justify-center text-muted-foreground text-[10px] opacity-50">
                  {t.track || "No track data"}
                </div>
              </div>

              {/* G-G Diagram */}
              <div className="flex-1 min-h-0 overflow-hidden border-b border-border">
                <GGScatterPanel samples={samples} />
              </div>

              {/* Tyre temps */}
              <div className="flex-shrink-0">
                <F1TyreDisplay t={t} />
              </div>
            </section>
          </div>

          {/* Bottom section: Sector comparison + AI Coach */}
          <div className="border-t border-border grid grid-cols-12 gap-0 flex-shrink-0" style={{ height: "180px" }}>
            {/* Sector comparison (spans 8 cols) */}
            <div className="col-span-8 border-r border-border overflow-hidden">
              <F1SectorComparison t={t} />
            </div>

            {/* AI Coach (spans 4 cols) */}
            <div className="col-span-4 overflow-auto">
              <LiveCoach t={t} />
            </div>
          </div>

          {/* Bottom controls */}
          <div className="border-t border-border bg-background p-2 grid grid-cols-12 gap-2 text-xs flex-shrink-0">
            <div className="col-span-12 lg:col-span-2 flex flex-col justify-between">
              {t.connected ? <RecordingControls t={t} /> : <BridgeInstall iracingLive={t.connected} />}
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-3 flex flex-col justify-between">
              <GearAdvisor t={t} samples={samples} />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-3 flex flex-col justify-between">
              <AdvisorButton t={t} />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-2 flex flex-col justify-between">
              <LiveReference t={t} />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-2 flex flex-col justify-between relative">
              <FingerprintUploadCard />
            </div>
          </div>
        </>
      ) : (
        /* ═══════════════ MOTORSPORT WORKSTATION DEFAULT LAYOUT ═══════════════ */
        <>
          {/* Main workspace pane splits */}
          <div className="flex-1 min-h-0 grid grid-cols-12 gap-0 bg-[#05070A]">
            
            {/* 1. LEFT RAIL: ENGINEERING NAVIGATION RAIL (Col span 3) */}
            <section className="col-span-3 flex flex-col overflow-hidden border-r border-[#1C2430] bg-[#0B0F14] select-none">
              {/* Profile / Workspace Header */}
              <div className="border-b border-[#1C2430] px-3 py-2 flex items-center justify-between bg-[#11161D] shrink-0">
                <span className="text-[9px] font-mono font-bold tracking-[0.25em] text-[#7A828C] uppercase">
                  OPERATIONS PANEL
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#00D17F] shadow-[0_0_6px_#00D17F]" />
              </div>

              {/* Channel Browser & Configuration list */}
              <div className="flex-1 min-h-0 overflow-y-auto border-b border-[#1C2430]">
                <ConfigurableChannelList t={t} />
              </div>

              {/* Fast Sector Splits splits */}
              <div className="border-b border-[#1C2430] bg-[#0B0F14]">
                <SectorPanel t={t} />
              </div>

              {/* Tyre State and pressure diagnostics */}
              <div className="flex-1 min-h-0 overflow-y-auto bg-[#0B0F14]">
                <TirePanel t={t} />
              </div>
            </section>

            {/* 2. CENTER PANEL: GRAPH/TRACE CLUSTER (Col span 6 - 60-70% space) */}
            <section className="col-span-6 flex flex-col overflow-hidden border-r border-[#1C2430] bg-[#05070A]">
              
              {/* Stacked trace controls */}
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#1C2430] shrink-0 bg-[#0B0F14]">
                <PanelHeader
                  title="rolling stacked channel traces"
                  right={
                    cursor ? `cursor delta t=${(cursor.sample.t / 1000).toFixed(3)}s` : "last 30s @ 60hz stream"
                  }
                />
                <FilterControls
                  mode={smoothing}
                  window={smoothWindow}
                  onMode={setSmoothing}
                  onWindow={setSmoothWindow}
                />
              </div>

              {/* Rolling Traces Graph Region */}
              <div className="flex-1 min-h-0 overflow-hidden bg-[#05070A] p-1">
                <TraceStack
                  samples={samples}
                  smoothing={smoothing}
                  smoothWindow={smoothWindow}
                  onCursorChange={handleCursor}
                />
              </div>

              {/* ────────────────── ACTIVE WORKSPACE INSTRUMENTS ────────────────── */}
              <div className="border-t border-[#1C2430] bg-[#11161D] px-3 py-1.5 flex items-center justify-between shrink-0 select-none">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold tracking-[0.2em] text-[#7A828C] uppercase">
                    ACTIVE WORKSPACE ENVIRONMENT:
                  </span>
                  <div className="flex bg-[#05070A] border border-[#1C2430] rounded-sm overflow-hidden">
                    {(Object.keys(WORKSPACE_PRESETS) as Array<keyof typeof WORKSPACE_PRESETS>).map((key) => {
                      const isActive = activePreset === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setActivePreset(key)}
                          className={`px-2 py-0.5 text-[8px] uppercase tracking-wider font-bold cursor-pointer ${
                            isActive
                              ? "bg-[#8B5CF6] text-white"
                              : "text-[#7A828C] hover:text-[#E2E4E8]"
                          }`}
                        >
                          {WORKSPACE_PRESETS[key].name}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <span className="text-[7.5px] text-[#7A828C] font-bold uppercase truncate max-w-[200px] hidden md:inline">
                  {WORKSPACE_PRESETS[activePreset].description}
                </span>
              </div>

              {/* Grid of the 3 active specialized instruments */}
              <div className="border-t border-[#1C2430] bg-[#05070A] p-1 h-[270px] shrink-0 overflow-y-auto">
                <div className="grid grid-cols-3 gap-1 h-full min-h-[220px]">
                  {WORKSPACE_PRESETS[activePreset].instruments.map((instrumentKey) => {
                    const InstrumentComponent = TELEMETRY_INSTRUMENTS[instrumentKey];
                    return (
                      <div key={instrumentKey} className="h-full">
                        <InstrumentComponent telemetry={t} mode="live" />
                      </div>
                    );
                  })}
                </div>
              </div>

            </section>

            {/* 3. RIGHT RAIL: AI COACH & STRATEGY CENTER (Col span 3) */}
            <section className="col-span-3 flex flex-col overflow-hidden bg-[#0B0F14]">
              {/* Strategy Header */}
              <div className="border-b border-[#1C2430] px-3 py-2 flex items-center justify-between bg-[#11161D] shrink-0">
                <span className="text-[9px] font-mono font-bold tracking-[0.25em] text-[#8B5CF6] uppercase">
                  COACH STRATEGY NET
                </span>
                <span className="text-[8px] font-mono font-black text-[#8B5CF6] tracking-widest">
                  AI ACTIVE
                </span>
              </div>

              {/* Scatter / G-G Analysis panels */}
              <div className="flex-1 min-h-0 overflow-hidden border-b border-[#1C2430]">
                <TabedAnalysisPanel
                  samples={samples}
                  ggScatterComponent={<GGScatterPanel samples={samples} />}
                />
              </div>

              {/* Real-time Incident Event Timeline */}
              <div className="h-[200px] shrink-0 border-b border-[#1C2430]">
                <TelemetryEventTimeline />
              </div>

              {/* Live Assistant Coach Panel (Moved to bottom of right rail for premium readability) */}
              <div className="h-[320px] shrink-0 bg-[#0B0F14] overflow-y-auto border-t border-[#1C2430]/40">
                <LiveCoach t={t} />
              </div>
            </section>
          </div>

          {/* 4. BOTTOM RAIL: TIMING & CONTROLS RAIL (packed tightly) */}
          <div className="border-t border-[#1C2430] bg-[#0B0F14] p-2 grid grid-cols-12 gap-2 text-[10px] uppercase font-mono tracking-wider shrink-0 select-none">
            {/* Column 1: Connection & Recording controls */}
            <div className="col-span-12 lg:col-span-3 flex flex-col justify-between pr-2">
              {t.connected ? <RecordingControls t={t} /> : <BridgeInstall iracingLive={t.connected} />}
            </div>

            {/* Column 2: Gear Ratio Advisor (Top) and Reference Pace (Bottom) */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-2 border-l border-[#1C2430]/60 pl-2">
              <GearAdvisor t={t} samples={samples} />
              <LiveReference t={t} />
            </div>

            {/* Column 3: Telemetry Advisor (Top) and Driver Fingerprint (Bottom) */}
            <div className="col-span-12 lg:col-span-5 flex flex-col gap-2 border-l border-[#1C2430]/60 pl-2 relative">
              <AdvisorButton t={t} />
              <FingerprintUploadCard />
            </div>
          </div>
        </>
      )}

      <FooterBar t={t} />
      {debugMode && <DiagnosticsPanel diagnostics={diagnostics} />}
    </main>
  );
}

/* ──────────────────────────────────────────────────────────── Top bar */

function TopBar({ t }: { t: Telemetry }) {
  const { activeWorkspace, setActiveWorkspace } = useWorkbench();
  const { layout, setLayout, setTheme } = useTheme();
  const activeProfile = LAYOUT_PROFILES.find((p) => p.id === layout);

  const handleLayoutChange = (id: string) => {
    setLayout(id as LayoutProfile);
    const preset = PRESETS.find((p) => p.id === id);
    if (preset) setTheme(preset.theme);
    else setTheme(DARK_THEME);
  };

  return (
    <header className="flex items-center gap-3 border-b border-border pb-2 text-[11px] uppercase tracking-wider">
      <BackButton />
      <span className="rounded-sm bg-muted px-2 py-1 text-muted-foreground">Pit Wall i2</span>
      <div className="flex items-center gap-1.5 bg-muted border border-border-strong rounded-sm px-2 py-0.5 ml-1 select-none text-[10px] text-muted-foreground">
        <span className="text-[9px] text-muted-foreground uppercase font-mono tracking-wider">Profile</span>
        <select
          value={activeWorkspace}
          onChange={(e) => setActiveWorkspace(e.target.value as any)}
          className="bg-transparent text-foreground border-none font-mono text-[10px] uppercase tracking-wider focus:outline-none cursor-pointer pr-1"
        >
          {Object.values(WORKSPACES).map((w) => (
            <option key={w.key} value={w.key} className="bg-background text-foreground font-mono uppercase text-[10px]">
              {w.name}
            </option>
          ))}
        </select>
      </div>
      {/* Layout style switcher */}
      <div className="flex items-center gap-1.5 bg-muted border border-border-strong rounded-sm px-2 py-0.5 select-none text-[10px] text-muted-foreground">
        <Palette className="h-3 w-3 text-primary" />
        <span className="text-[9px] text-muted-foreground uppercase font-mono tracking-wider">Style</span>
        <select
          value={layout}
          onChange={(e) => handleLayoutChange(e.target.value)}
          className="bg-transparent text-foreground border-none font-mono text-[10px] uppercase tracking-wider focus:outline-none cursor-pointer pr-1"
        >
          {LAYOUT_PROFILES.map((p) => (
            <option key={p.id} value={p.id} className="bg-background text-foreground font-mono uppercase text-[10px]">
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-4 text-muted-foreground">
        <Field label="Session" value={t.session} />
        <Field label="Track" value={t.track} />
        <Field label="Car" value={`${t.car} #${t.carNumber}`} />
      </div>
      <div className="ml-auto flex items-center gap-3 text-muted-foreground">
        <Field label="Best" value={t.bestLap} mono valueClass="text-emerald-400" />
        <Field label="Last" value={t.lastLap} mono />
        <Field
          label="Δ"
          value={`${t.deltaSec >= 0 ? "+" : ""}${t.deltaSec.toFixed(3)}`}
          mono
          valueClass={t.deltaSec < 0 ? "text-emerald-400" : "text-rose-400"}
        />
        <div className="flex items-center gap-1.5 rounded-sm bg-muted px-2 py-1">
          <span
            className={`size-1.5 rounded-full ${t.connected ? "bg-emerald-500" : "bg-amber-500"}`}
          />
          <span className="text-[10px]">
            {t.connected ? `${t.sdkVersion} · ${t.latencyMs}ms` : "Simulated"}
          </span>
        </div>
        <Link
          to="/settings"
          className="flex h-6 w-6 items-center justify-center rounded-sm bg-muted border border-border-strong text-muted-foreground hover:text-primary hover:border-primary/50 transition-all hover:scale-110 group cursor-pointer"
          title="Settings"
        >
          <Settings className="h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-90 text-muted-foreground group-hover:text-primary" />
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
      <span className="text-[9px] text-muted-foreground">{label}</span>
      <span className={`${mono ? "tabular-nums" : ""} text-foreground ${valueClass}`}>{value}</span>
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
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-sm bg-muted relative">
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
      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{title}</span>
      {right && <span className="text-[10px] tabular-nums text-muted-foreground">{right}</span>}
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
      <span className="text-muted-foreground">Filter</span>
      <div className="flex overflow-hidden rounded-sm border border-border-strong">
        {modes.map((m) => (
          <button
            key={m.k}
            type="button"
            onClick={() => onMode(m.k)}
            className={`px-2 py-0.5 ${
              mode === m.k
                ? "bg-accent text-foreground"
                : "bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      {mode !== "none" && (
        <label className="flex items-center gap-1.5 text-muted-foreground">
          <span>N</span>
          <input
            type="range"
            min={2}
            max={30}
            value={win}
            onChange={(e) => onWindow(Number(e.target.value))}
            className="h-1 w-20 accent-amber-500"
          />
          <span className="w-5 text-right tabular-nums text-foreground">{win}</span>
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
    <div className="rounded-sm border border-border bg-background">
      <div className="border-b border-border px-2 py-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Sectors
      </div>
      <ul className="divide-y divide-border">
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
              <span className="w-8 text-muted-foreground">S{idx}</span>
              <span
                className={`ml-auto tabular-nums ${isBest ? "text-emerald-400" : "text-foreground"}`}
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
    <div className="rounded-sm border border-border bg-background p-2">
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
      <span className="w-7 text-muted-foreground">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-sm bg-muted">
        <div className="h-full" style={{ width: `${value * 100}%`, background: color }} />
      </div>
      <span className="w-8 text-right tabular-nums text-foreground">{Math.round(value * 100)}</span>
    </div>
  );
}

function SteerBar({ deg }: { deg: number }) {
  const clamped = Math.max(-180, Math.min(180, deg));
  const leftPct = 50 + (clamped / 180) * 50;
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="w-7 text-muted-foreground">STR</span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-sm bg-muted">
        <div className="absolute inset-y-0 left-1/2 w-px bg-zinc-700" />
        <div
          className="absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400"
          style={{ left: `${leftPct}%` }}
        />
      </div>
      <span className="w-8 text-right tabular-nums text-foreground">{Math.round(deg)}°</span>
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
    <div className="rounded-sm border border-border bg-background">
      <div className="border-b border-border px-2 py-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Tyres
      </div>
      <div className="grid grid-cols-2 gap-px bg-muted">
        {corners.map(({ key, label }) => {
          const c = t.tires[key];
          return (
            <div key={key} className="bg-background p-2">
              <div className="flex items-baseline justify-between">
                <span className="text-[9px] text-muted-foreground">{label}</span>
                <span className={`text-[9px] uppercase ${stateColor(c.state)}`}>{c.state}</span>
              </div>
              <div className="mt-0.5 flex items-baseline justify-between tabular-nums">
                <span className="text-sm text-foreground">{Math.round(c.tempC)}°</span>
                <span className="text-[10px] text-muted-foreground">{c.pressureBar.toFixed(2)} bar</span>
              </div>
              <div className="mt-1 h-0.5 w-full overflow-hidden rounded-sm bg-muted">
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
    <footer className="mt-3 flex items-center gap-4 rounded-sm border border-border bg-background px-3 py-1.5 text-[10px] text-muted-foreground">
      <span>
        DRS <span className="text-foreground">{t.drsAvailable ? "AVAIL" : "OFF"}</span>
      </span>
      <span>
        BBIAS <span className="tabular-nums text-foreground">{t.brakeBias.toFixed(1)}%</span>
      </span>
      <span>
        DIFF <span className="tabular-nums text-foreground">MAP {t.diffMap}</span>
      </span>
      <div className="ml-auto flex items-center gap-4 tabular-nums">
        <span>
          AIR <span className="text-foreground">{t.airTempC}°C</span>
        </span>
        <span>
          TRACK <span className="text-foreground">{t.trackTempC}°C</span>
        </span>
        <span>
          SOF <span className="text-foreground">{t.sof.toLocaleString()}</span>
        </span>
        <span>
          SR <span className="text-foreground">{t.safetyRating.toFixed(2)}</span>
        </span>
      </div>
    </footer>
  );
}

function GGScatterPanel({ samples }: { samples: Sample[] }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-2 py-1 border-b border-border bg-panel-2">
        <PanelHeader title="G-G Diagram" right={`${samples.length} pts`} />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <GGScatter samples={samples} />
      </div>
    </div>
  );
}
