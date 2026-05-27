import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTelemetryRuntimeStore } from "@/lib/telemetryRuntimeStore";
import { TELEMETRY_INSTRUMENTS, type InstrumentKey } from "@/components/instruments/registry";
import { useTelemetry } from "@/lib/useTelemetry";
import { Sliders, HelpCircle, Wifi } from "lucide-react";

export const Route = createFileRoute("/detached/$instrument")({
  head: () => ({
    meta: [
      { title: "Detached Engineering Instrument — Pit Wall" },
      { name: "description", content: "Standalone motorsport instrument window." },
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
  const isPlaying = useTelemetryRuntimeStore((s) => s.isPlaying);
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

  const instrumentKey = instrument as InstrumentKey;
  const InstrumentComponent = TELEMETRY_INSTRUMENTS[instrumentKey];

  if (!InstrumentComponent) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#05070A] font-mono text-[10px] text-[#FF4D4D] p-6 border border-[#FF4D4D]/20">
        <Sliders className="h-6 w-6 mb-2 animate-bounce" />
        <span className="font-bold tracking-widest uppercase">INVALID INSTRUMENT IDENTIFIER</span>
        <span className="text-[#7A828C] mt-1 text-[8px]">ID: "{instrument}" NOT REGISTERED IN PLATFORM PORTFOLIO.</span>
      </div>
    );
  }

  // Pick the active telemetry frame: live stream or broadcast replay frame
  const t = mode === "live" ? liveTelemetry : detachedTelemetryFrame;

  // Render restrained professional full-screen panel
  return (
    <div className={`h-screen w-screen bg-[#05070A] p-2 flex flex-col overflow-hidden select-none workspace-focus-${focusMode}`}>
      {/* Detached Screen Diagnostics Header */}
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
          {focusMode !== "none" && (
            <span className="text-[7.5px] font-black tracking-widest text-[#8B5CF6] border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-1 rounded">
              FOCUS MODE ACTIVE: {focusMode}
            </span>
          )}
        </div>
      </div>

      {/* Main Instrument Wrapper */}
      <div className="flex-1 min-h-0 border border-[#1C2430] bg-[#0B0F14] rounded-sm overflow-hidden">
        {t ? (
          <InstrumentComponent telemetry={t} mode={mode === "live" ? "live" : "replay"} />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-center p-8 text-[#7A828C] font-mono text-[9px] relative">
            {/* Engineering Grid Mesh background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1C2430_1px,transparent_1px),linear-gradient(to_bottom,#1C2430_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-[0.03] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center max-w-xs animate-pulse">
              <Sliders className="h-5 w-5 text-[#7A828C] mb-2" />
              <span className="font-bold tracking-widest text-white uppercase text-[10px]">AWAITING SYSTEM SYNCHRONIZATION</span>
              <p className="mt-2 leading-relaxed text-[8px] uppercase tracking-wider">
                Replay frame data is dispatched dynamically by the master workbench. Drag or scrub the telemetry playhead to synchronize visual instruments.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
