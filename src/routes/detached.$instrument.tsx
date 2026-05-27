import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTelemetryRuntimeStore } from "@/lib/telemetryRuntimeStore";
import { TELEMETRY_INSTRUMENTS, type InstrumentKey } from "@/components/instruments/registry";
import { useTelemetry } from "@/lib/useTelemetry";
import { Sliders, Wifi, Clock, Zap, Flame, Compass, Settings } from "lucide-react";

export const Route = createFileRoute("/detached/$instrument")({
  head: () => ({
    meta: [
      { title: "Detached Cockpit Monitor — Pit Wall" },
      { name: "description", content: "Standalone motorsport command window." },
    ],
  }),
  component: DetachedInstrumentPage,
});

function DetachedInstrumentPage() {
  const { instrument } = Route.useParams();
  const liveTelemetry = useTelemetry(); // Stream live WebSocket if running
  const [mode, setMode] = useState<"live" | "replay">("replay");

  // Read synced values from broadcast Zustand store
  const cursorTick = useTelemetryRuntimeStore((s) => s.cursorTick);
  const focusMode = useTelemetryRuntimeStore((s) => s.focusMode);
  const detachedTelemetryFrame = useTelemetryRuntimeStore((s) => s.detachedTelemetryFrame);

  // Auto-switch mode based on whether live bridge is streaming and active
  useEffect(() => {
    if (liveTelemetry && liveTelemetry.connected) {
      setMode("live");
    } else {
      setMode("replay");
    }
  }, [liveTelemetry?.connected]);

  // Resolve telemetry frame data source
  const t = mode === "live" ? liveTelemetry : detachedTelemetryFrame;

  // Render dynamic command screens if parameter matches one of the monitors
  if (instrument === "timing") return <TimingMonitorScreen t={t} mode={mode} cursorTick={cursorTick} />;
  if (instrument === "hybrid") return <HybridMonitorScreen t={t} mode={mode} cursorTick={cursorTick} />;
  if (instrument === "tires") return <TireWallScreen t={t} mode={mode} cursorTick={cursorTick} />;
  if (instrument === "strategy") return <StrategyScreen t={t} mode={mode} cursorTick={cursorTick} />;

  const instrumentKey = instrument as InstrumentKey;
  const InstrumentComponent = TELEMETRY_INSTRUMENTS[instrumentKey];

  if (!InstrumentComponent) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#05070A] font-mono text-[10px] text-[#FF4D4D] p-6 border border-[#FF4D4D]/20">
        <Sliders className="h-6 w-6 mb-2 animate-bounce" />
        <span className="font-bold tracking-widest uppercase">INVALID MONITOR IDENTIFIER</span>
        <span className="text-[#7A828C] mt-1 text-[8px]">ID: "{instrument}" NOT REGISTERED IN WORKSTATION CORE.</span>
      </div>
    );
  }

  // Render basic instrument visualizer
  return (
    <div className={`h-screen w-screen bg-[#05070A] p-2 flex flex-col overflow-hidden select-none workspace-focus-${focusMode}`}>
      {/* Detached Diagnostics Header */}
      <div className="px-3 py-1.5 border border-[#1C2430] bg-[#11161D] rounded-sm flex items-center justify-between text-[8px] font-mono text-[#7A828C] mb-1.5 uppercase tracking-wider shrink-0 select-none">
        <div className="flex items-center gap-1.5 font-bold">
          <span className="size-1 rounded-full bg-[#3B82F6]" />
          <span className="text-white">DETACHED ARRAY</span>
          <span>·</span>
          <span>INSTRUMENT: <span className="text-[#3B82F6]">{instrument}</span></span>
        </div>
        
        <div className="flex items-center gap-3">
          {mode === "live" ? (
            <div className="flex items-center gap-1 text-[#00D17F] font-black">
              <Wifi className="h-3 w-3 animate-pulse" /> LIVE STREAM
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[#FFB800] font-black">
              <Sliders className="h-3 w-3" /> REPLAY TICK: <span className="text-white tabular-nums">{cursorTick}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 border border-[#1C2430] bg-[#0B0F14] rounded-sm overflow-hidden">
        {t ? (
          <InstrumentComponent telemetry={t} mode={mode === "live" ? "live" : "replay"} />
        ) : (
          <AwaitingSyncPlaceholder cursorTick={cursorTick} />
        )}
      </div>
    </div>
  );
}

// ─── COMMAND SURFACE: Timing & Sectors Monitor ─────────────────────────────
function TimingMonitorScreen({ t, mode, cursorTick }: { t: any; mode: string; cursorTick: number }) {
  return (
    <div className="h-screen w-screen bg-[#05070A] p-3 flex flex-col font-mono text-[9px] text-[#7A828C] select-none">
      <div className="px-3 py-2 border border-[#1C2430] bg-[#11161D] rounded-sm flex items-center justify-between shrink-0 mb-3 select-none">
        <span className="font-bold text-white tracking-widest uppercase flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-[#3B82F6]" /> TIMING & LAP MONITOR
        </span>
        <span className="text-white font-bold uppercase shrink-0">PIT WALL COMMAND ENGINE</span>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-3 gap-3">
        {/* Left Side: Stint sectors splits matrix */}
        <div className="col-span-2 border border-[#1C2430] bg-[#0B0F14] p-3 rounded-sm flex flex-col overflow-hidden">
          <span className="text-[10px] text-white font-bold border-b border-[#1C2430] pb-1.5 uppercase mb-2">STINT SECTOR MATRIX</span>
          <div className="flex-1 overflow-y-auto space-y-1">
            <div className="grid grid-cols-5 text-[#7A828C] font-bold border-b border-[#1C2430]/60 pb-1 uppercase text-[8px]">
              <span>LAP</span>
              <span>SECTOR 1</span>
              <span>SECTOR 2</span>
              <span>SECTOR 3</span>
              <span>LAP TIME</span>
            </div>
            {[
              { lap: 1, s1: "24.120", s2: "32.188", s3: "28.944", time: "1:25.252", diff: "+0.142" },
              { lap: 2, s1: "23.955", s2: "32.012", s3: "28.720", time: "1:24.687", diff: "-0.423" },
              { lap: 3, s1: "23.840", s2: "31.954", s3: "28.611", time: "1:24.405", diff: "-0.282" },
              { lap: 4, s1: "23.910", s2: "32.088", s3: "28.752", time: "1:24.750", diff: "+0.345" },
            ].map((r) => (
              <div key={r.lap} className="grid grid-cols-5 border-b border-[#1C2430]/20 py-1 tabular-nums text-white">
                <span className="font-bold text-[#7A828C]">L{r.lap}</span>
                <span>{r.s1}s</span>
                <span>{r.s2}s</span>
                <span>{r.s3}s</span>
                <span className="font-black text-[#00D17F]">{r.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Fuel & stint projections */}
        <div className="border border-[#1C2430] bg-[#0B0F14] p-3 rounded-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-white font-bold border-b border-[#1C2430] pb-1.5 uppercase mb-3 block">STINT PROJECTIONS</span>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-[#05070A] p-2 border border-[#1C2430]/60 rounded-xs">
                <span>ESTIMATED FUEL BURN</span>
                <span className="text-white font-bold text-sm">3.42 L / LAP</span>
              </div>
              <div className="flex justify-between items-center bg-[#05070A] p-2 border border-[#1C2430]/60 rounded-xs">
                <span>REMAINING FUEL CAPACITY</span>
                <span className="text-[#FFB800] font-black text-sm">{t?.fuelRemainingL ? t.fuelRemainingL.toFixed(1) : "38.5"} L</span>
              </div>
              <div className="flex justify-between items-center bg-[#05070A] p-2 border border-[#1C2430]/60 rounded-xs">
                <span>THEORETICAL LAPS TO PIT</span>
                <span className="text-[#00D17F] font-black text-sm">11 Laps</span>
              </div>
            </div>
          </div>

          <div className="border-t border-[#1C2430] pt-2 mt-2">
            <span className="text-[8px] text-[#7A828C] block uppercase font-bold mb-1">active coordinate playhead</span>
            <span className="text-white text-xs font-black tabular-nums">{cursorTick} ticks</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── COMMAND SURFACE: Hybrid Power Monitor ───────────────────────────────
function HybridMonitorScreen({ t, mode, cursorTick }: { t: any; mode: string; cursorTick: number }) {
  const soc = t?.extras?.ersSoc ?? 75;
  const deploy = t?.extras?.mgukDeployKw ?? 0;
  const regen = t?.extras?.mgukRegenKw ?? 0;

  return (
    <div className="h-screen w-screen bg-[#05070A] p-3 flex flex-col font-mono text-[9px] text-[#7A828C] select-none">
      <div className="px-3 py-2 border border-[#1C2430] bg-[#11161D] rounded-sm flex items-center justify-between shrink-0 mb-3 select-none">
        <span className="font-bold text-white tracking-widest uppercase flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-[#8B5CF6]" /> HYBRID ENERGY MONITOR
        </span>
        <span className="text-white font-bold uppercase shrink-0">PIT WALL HYBRID SYS</span>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-2 gap-3">
        {/* Left Side: Segmented SoC Purple Grid */}
        <div className="border border-[#1C2430] bg-[#0B0F14] p-4 rounded-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-white font-bold border-b border-[#1C2430] pb-1.5 uppercase mb-3 block">STATE-OF-CHARGE (SoC)</span>
            <div className="grid grid-cols-16 gap-1 bg-[#05070A] p-3 rounded-sm border border-[#1C2430] mb-4">
              {Array.from({ length: 16 }).map((_, i) => {
                const filled = (i / 16) * 100 < soc;
                return (
                  <div
                    key={i}
                    className={`h-12 rounded-xs border transition-all duration-300 ${
                      filled ? "bg-[#8B5CF6] border-[#8B5CF6]/40 shadow-[0_0_8px_rgba(139,92,246,0.3)]" : "bg-[#0B0F14] border-[#1C2430]"
                    }`}
                  />
                );
              })}
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[8px] text-[#7A828C] block uppercase font-bold">ers battery capacity</span>
              <span className="text-white text-xl font-black tabular-nums">{soc.toFixed(1)}%</span>
            </div>
            <span className="text-[8px] text-[#8B5CF6] border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-2 py-0.5 rounded font-black tracking-widest uppercase">
              mgu-k active
            </span>
          </div>
        </div>

        {/* Right Side: Deploy vs Regen balance bar sweeps */}
        <div className="border border-[#1C2430] bg-[#0B0F14] p-4 rounded-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-white font-bold border-b border-[#1C2430] pb-1.5 uppercase mb-3 block">ENERGY BALANCE FLUX</span>
            <div className="space-y-4">
              {/* Deploy Bar */}
              <div>
                <div className="flex justify-between items-center text-[8px] font-bold text-[#7A828C] mb-1">
                  <span>MGU-K KINETIC DISCHARGE</span>
                  <span className="text-white tabular-nums">{(deploy).toFixed(0)} kW</span>
                </div>
                <div className="h-6 bg-[#05070A] border border-[#1C2430] rounded-sm p-1">
                  <div className="h-full rounded-xs bg-[#8B5CF6] transition-all duration-100" style={{ width: `${Math.min(100, (deploy / 120) * 100)}%` }} />
                </div>
              </div>

              {/* Regen Bar */}
              <div>
                <div className="flex justify-between items-center text-[8px] font-bold text-[#7A828C] mb-1">
                  <span>MGU-K KINETIC HARVEST</span>
                  <span className="text-white tabular-nums">{(regen).toFixed(0)} kW</span>
                </div>
                <div className="h-6 bg-[#05070A] border border-[#1C2430] rounded-sm p-1">
                  <div className="h-full rounded-xs bg-[#00D17F] transition-all duration-100" style={{ width: `${Math.min(100, (regen / 200) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[8px] text-[#7A828C] mt-4 border-t border-[#1C2430] pt-3">
            <div>
              <span>BATTERY TEMP</span>
              <span className="text-white font-bold text-sm block tabular-nums">{t?.extras?.ersBatteryTemp ? t.extras.ersBatteryTemp.toFixed(1) : "42.5"}°C</span>
            </div>
            <div>
              <span>DEPLOY EFFICIENCY</span>
              <span className="text-[#00D17F] font-bold text-sm block">93.8%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── COMMAND SURFACE: Tire Wall Monitor ──────────────────────────────────
function TireWallScreen({ t, mode, cursorTick }: { t: any; mode: string; cursorTick: number }) {
  const flTemp = t?.tires?.fl?.tempC ?? 80;
  const frTemp = t?.tires?.fr?.tempC ?? 82;
  const rlTemp = t?.tires?.rl?.tempC ?? 84;
  const rrTemp = t?.tires?.rr?.tempC ?? 86;

  const flPSI = t?.tires?.fl?.pressureBar ?? 1.8;
  const frPSI = t?.tires?.fr?.pressureBar ?? 1.82;

  const gLat = t?.gLat ?? 0;
  const gLon = t?.gLon ?? 0;

  const getHeatStyles = (temp: number) => {
    if (temp > 92) return "border-l-2 border-l-[#FF4D4D] bg-[#FF4D4D]/5 text-[#FF4D4D]";
    if (temp > 85) return "border-l-2 border-l-[#FFB800] bg-[#FFB800]/5 text-[#FFB800]";
    return "border-l-2 border-l-[#00D17F] bg-[#00D17F]/5 text-[#00D17F]";
  };

  return (
    <div className="h-screen w-screen bg-[#05070A] p-3 flex flex-col font-mono text-[9px] text-[#7A828C] select-none">
      <div className="px-3 py-2 border border-[#1C2430] bg-[#11161D] rounded-sm flex items-center justify-between shrink-0 mb-3 select-none">
        <span className="font-bold text-white tracking-widest uppercase flex items-center gap-1.5">
          <Flame className="h-3.5 w-3.5 text-[#FFB800]" /> TIRE OPERATING PORTFOLIO
        </span>
        <span className="text-white font-bold uppercase shrink-0">PIT WALL TIRE WALL</span>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-3 gap-3">
        {/* Left Columns: 4-Quadrant Operating Blocks */}
        <div className="col-span-2 grid grid-cols-2 gap-3">
          {/* FL Tire */}
          <div className={`border border-[#1C2430] rounded-sm p-3 flex flex-col justify-between ${getHeatStyles(flTemp)}`}>
            <span className="font-bold text-[8px] tracking-wider text-white">FRONT LEFT CARCASS</span>
            <span className="text-2xl font-black tracking-tighter tabular-nums">{flTemp.toFixed(1)}°C</span>
            <div className="flex justify-between items-center text-[#7A828C] border-t border-[#1C2430]/20 pt-1 text-[8px]">
              <span>PRESSURE</span>
              <span className="text-white font-bold">{(flPSI * 14.5038).toFixed(1)} PSI</span>
            </div>
          </div>

          {/* FR Tire */}
          <div className={`border border-[#1C2430] rounded-sm p-3 flex flex-col justify-between ${getHeatStyles(frTemp)}`}>
            <span className="font-bold text-[8px] tracking-wider text-white">FRONT RIGHT CARCASS</span>
            <span className="text-2xl font-black tracking-tighter tabular-nums">{frTemp.toFixed(1)}°C</span>
            <div className="flex justify-between items-center text-[#7A828C] border-t border-[#1C2430]/20 pt-1 text-[8px]">
              <span>PRESSURE</span>
              <span className="text-white font-bold">{(frPSI * 14.5038).toFixed(1)} PSI</span>
            </div>
          </div>

          {/* RL Tire */}
          <div className={`border border-[#1C2430] rounded-sm p-3 flex flex-col justify-between ${getHeatStyles(rlTemp)}`}>
            <span className="font-bold text-[8px] tracking-wider text-white">REAR LEFT CARCASS</span>
            <span className="text-2xl font-black tracking-tighter tabular-nums">{rlTemp.toFixed(1)}°C</span>
            <div className="flex justify-between items-center text-[#7A828C] border-t border-[#1C2430]/20 pt-1 text-[8px]">
              <span>PRESSURE</span>
              <span className="text-white font-bold">{(t?.tires?.rl?.pressureBar * 14.5038 || 26.5).toFixed(1)} PSI</span>
            </div>
          </div>

          {/* RR Tire */}
          <div className={`border border-[#1C2430] rounded-sm p-3 flex flex-col justify-between ${getHeatStyles(rrTemp)}`}>
            <span className="font-bold text-[8px] tracking-wider text-white">REAR RIGHT CARCASS</span>
            <span className="text-2xl font-black tracking-tighter tabular-nums">{rrTemp.toFixed(1)}°C</span>
            <div className="flex justify-between items-center text-[#7A828C] border-t border-[#1C2430]/20 pt-1 text-[8px]">
              <span>PRESSURE</span>
              <span className="text-white font-bold">{(t?.tires?.rr?.pressureBar * 14.5038 || 26.8).toFixed(1)} PSI</span>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic G-G grip circle */}
        <div className="border border-[#1C2430] bg-[#0B0F14] p-3 rounded-sm flex flex-col justify-between items-center">
          <span className="text-[10px] text-white font-bold border-b border-[#1C2430] pb-1.5 uppercase mb-3 block w-full text-center">G-G GRAPHICS</span>
          
          <div className="size-36 border border-[#1C2430] rounded-full relative flex items-center justify-center bg-[#05070A]">
            {/* Center grid cross lines */}
            <div className="absolute inset-0 border-l border-dashed border-[#1C2430] left-1/2" />
            <div className="absolute inset-0 border-t border-dashed border-[#1C2430] top-1/2" />
            
            {/* Current G friction point */}
            <div
              className="absolute size-2 rounded-full bg-[#FFB800] shadow-[0_0_8px_#FFB800] transition-all duration-75"
              style={{
                left: `${50 + (gLat * 18)}%`,
                top: `${50 - (gLon * 18)}%`,
              }}
            />
          </div>

          <div className="w-full border-t border-[#1C2430] pt-2 mt-2 flex justify-between text-[8px]">
            <span>LAT G: <span className="text-white font-bold">{gLat.toFixed(2)}</span></span>
            <span>LON G: <span className="text-white font-bold">{gLon.toFixed(2)}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── COMMAND SURFACE: Strategy Screen ──────────────────────────────────
function StrategyScreen({ t, mode, cursorTick }: { t: any; mode: string; cursorTick: number }) {
  return (
    <div className="h-screen w-screen bg-[#05070A] p-3 flex flex-col font-mono text-[9px] text-[#7A828C] select-none">
      <div className="px-3 py-2 border border-[#1C2430] bg-[#11161D] rounded-sm flex items-center justify-between shrink-0 mb-3 select-none">
        <span className="font-bold text-white tracking-widest uppercase flex items-center gap-1.5">
          <Compass className="h-3.5 w-3.5 text-[#00D17F]" /> TACTICAL STRATEGY WINDOW
        </span>
        <span className="text-white font-bold uppercase shrink-0">PIT WALL STRATEGY</span>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-2 gap-3">
        {/* Left: Pit stop window timeline projections */}
        <div className="border border-[#1C2430] bg-[#0B0F14] p-4 rounded-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-white font-bold border-b border-[#1C2430] pb-1.5 uppercase mb-3 block">PIT WINDOW ESTIMATION</span>
            <p className="leading-relaxed mb-4 text-[8.5px]">
              Platform estimates optimal under-cut pit targets between Laps 14 and 17 based on average tire deg calculations of 1.4% traction loss per lap.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-white">
                <span>PIT OPEN WINDOW</span>
                <span className="font-bold">LAP 14</span>
              </div>
              <div className="flex justify-between items-center text-white">
                <span>PIT OPTIMAL APEX</span>
                <span className="font-bold text-[#00D17F]">LAP 16</span>
              </div>
              <div className="flex justify-between items-center text-white">
                <span>PIT CLOSE WINDOW</span>
                <span className="font-bold">LAP 18</span>
              </div>
            </div>
          </div>
          <span className="text-[7.5px] text-[#00D17F] border border-[#00D17F]/30 bg-[#00D17F]/10 px-2 py-0.5 rounded font-black tracking-widest uppercase self-start">
            optimal pace buffer active
          </span>
        </div>

        {/* Right: Fuel saving safety car modeler */}
        <div className="border border-[#1C2430] bg-[#0B0F14] p-4 rounded-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-white font-bold border-b border-[#1C2430] pb-1.5 uppercase mb-3 block">SAFETY CAR LIFT-AND-COAST MODELER</span>
            <p className="leading-relaxed mb-4 text-[8.5px]">
              Activating fuel saving delta limits. Under yellow flag safety car constraints, lift-and-coast targets reduce fuel flow by 1.8 L / LAP.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>NOMINAL STINT FUEL LIMIT</span>
                <span className="text-white font-bold">25 Laps</span>
              </div>
              <div className="flex justify-between items-center text-[#00D17F]">
                <span>SAFETY CAR STINT EXTENSION</span>
                <span className="font-bold">+6 Laps available</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center border-t border-[#1C2430] pt-2 text-[8px] text-[#7A828C]">
            <span>STINT STRETCH TARGET</span>
            <span className="text-white font-bold">L31 MAX</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Placeholder component when awaiting playhead tick
function AwaitingSyncPlaceholder({ cursorTick }: { cursorTick: number }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center text-center p-8 text-[#7A828C] font-mono text-[9px] relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1C2430_1px,transparent_1px),linear-gradient(to_bottom,#1C2430_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-[0.03] pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center max-w-xs animate-pulse">
        <Sliders className="h-5 w-5 text-[#7A828C] mb-2" />
        <span className="font-bold tracking-widest text-white uppercase text-[10px]">AWAITING SYSTEM SYNCHRONIZATION</span>
        <p className="mt-2 leading-relaxed text-[8px] uppercase tracking-wider">
          Replay frame data is dispatched dynamically by the master workbench. Drag or scrub the telemetry playhead to synchronize visual command monitors.
        </p>
        <span className="mt-2 text-[#7A828C] text-[8px]">TICK: {cursorTick}</span>
      </div>
    </div>
  );
}
