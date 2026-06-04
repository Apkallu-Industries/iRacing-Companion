import React, { useState, useEffect } from "react";
import {
  Sliders,
  Maximize2,
  Sparkles,
  Volume2,
  Shield,
  Settings,
  Play,
  Pause,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface TelemetryInstrumentProps {
  title: string;
  mode?: "live" | "replay" | "compare";
  onModeChange?: (mode: "live" | "replay" | "compare") => void;
  onAiAnalyze?: () => void;
  aiLoading?: boolean;
  aiAdvice?: string | null;
  children: React.ReactNode;
  activeStatus?: string;
  activeStatusColor?: string;
}

export function TelemetryInstrument({
  title,
  mode = "live",
  onModeChange,
  onAiAnalyze,
  aiLoading = false,
  aiAdvice = null,
  children,
  activeStatus = "ACTIVE",
  activeStatusColor = "text-[#00D17F] border-[#00D17F]/30 bg-[#00D17F]/10",
}: TelemetryInstrumentProps) {
  const [showAi, setShowAi] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [highlighted, setHighlighted] = useState(false);

  useEffect(() => {
    const handleChannelClick = (e: Event) => {
      const channel = ((e as CustomEvent).detail?.channel || "").toLowerCase();
      let matched = false;

      const titleLower = title.toLowerCase();
      if (titleLower.includes("brake")) {
        matched = ["brake", "bias", "press", "tempc"].some((k) => channel.includes(k));
      } else if (titleLower.includes("hybrid") || titleLower.includes("ers")) {
        matched = ["ers", "soc", "mgu", "hybrid", "power", "charge"].some((k) =>
          channel.includes(k),
        );
      } else if (titleLower.includes("suspension") || titleLower.includes("chassis")) {
        matched = ["suspension", "damper", "ride", "pitch", "roll", "yaw", "accel", "heave"].some(
          (k) => channel.includes(k),
        );
      } else if (titleLower.includes("tire") || titleLower.includes("grip")) {
        matched = ["temp", "press", "wear", "tire", "grip"].some((k) => channel.includes(k));
      } else if (titleLower.includes("input") || titleLower.includes("control")) {
        matched = ["throttle", "steer", "clutch", "input"].some((k) => channel.includes(k));
      }

      if (matched) {
        setHighlighted(true);
        setShowAi(true);
        const timer = setTimeout(() => setHighlighted(false), 2500);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener("pitwall-contextual-channel", handleChannelClick);
    return () => window.removeEventListener("pitwall-contextual-channel", handleChannelClick);
  }, [title]);

  const toggleAi = () => {
    setShowAi(!showAi);
    if (!showAi && onAiAnalyze && !aiAdvice) {
      onAiAnalyze();
    }
  };

  const handleDetach = () => {
    let key = "inputs";
    const titleLower = title.toLowerCase();
    if (titleLower.includes("brake")) key = "brakes";
    else if (titleLower.includes("ers") || titleLower.includes("hybrid")) key = "ers";
    else if (titleLower.includes("suspension") || titleLower.includes("chassis")) key = "chassis";
    else if (titleLower.includes("tire") || titleLower.includes("grip")) key = "tires";

    const url = `/detached/${key}`;
    const w = window.open(url, `detached-${key}`, "width=520,height=400,resizable=yes");
    if (w) {
      toast.success(`Detached ${title} successfully. Window added to engineering array.`, {
        icon: "⚡",
        duration: 2500,
        style: {
          background: "#0B0F14",
          border: "1px solid #1C2430",
          color: "#fff",
          fontFamily: "monospace",
          fontSize: "10px",
        },
      });
    } else {
      toast.error("Multi-monitor detach blocked by browser window blocker.");
    }
  };

  return (
    <div
      className={`border bg-[#0B0F14] flex flex-col font-mono text-xs select-none transition-all duration-200 ${
        highlighted
          ? "border-[#FFB800] shadow-[0_0_15px_rgba(255,184,0,0.35)] ring-1 ring-[#FFB800]/40 scale-[1.01]"
          : "border-[#1C2430]"
      } ${
        expanded
          ? "fixed inset-4 z-50 bg-[#0B0F14]/95 backdrop-blur shadow-2xl"
          : "h-full min-h-[220px]"
      }`}
    >
      {/* Instrument Title Bar */}
      <div className="px-3 py-1.5 border-b border-[#1C2430] bg-[#11161D] flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-[#05070A] border border-[#1C2430] text-[#3B82F6]">
            <Sliders className="h-3 w-3" />
          </span>
          <span className="font-bold text-white uppercase tracking-wider text-[10px]">{title}</span>
          {activeStatus && (
            <span
              className={`text-[8px] font-bold tracking-widest px-1.5 py-0.5 border ${activeStatusColor}`}
            >
              {activeStatus}
            </span>
          )}
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5">
          {/* Mode Switcher */}
          {onModeChange && (
            <div className="flex border border-[#1C2430] bg-[#05070A] rounded-sm mr-1 overflow-hidden">
              {(["live", "replay", "compare"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => onModeChange(m)}
                  className={`px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-bold cursor-pointer ${
                    mode === m ? "bg-[#3B82F6] text-white" : "text-[#7A828C] hover:text-[#E2E4E8]"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}

          {/* AI Analysis Hook */}
          {onAiAnalyze && (
            <button
              onClick={toggleAi}
              className={`p-1 rounded border transition-colors cursor-pointer ${
                showAi
                  ? "border-[#8B5CF6]/50 bg-[#8B5CF6]/15 text-[#8B5CF6]"
                  : "border-[#1C2430] bg-[#05070A] text-[#7A828C] hover:text-white"
              }`}
              title="Toggle AI System Advisor"
            >
              <Sparkles className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Detach Window */}
          <button
            onClick={handleDetach}
            className="p-1 rounded border border-[#1C2430] bg-[#05070A] text-[#7A828C] hover:text-white transition-colors cursor-pointer"
            title="Detach instrument to external array"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>

          {/* Full-width Toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded border border-[#1C2430] bg-[#05070A] text-[#7A828C] hover:text-white transition-colors cursor-pointer"
            title={expanded ? "Restore down" : "Maximize view"}
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Instrument Body split with AI overlay */}
      <div className="flex-1 min-h-0 flex flex-col relative bg-[#05070A]">
        {/* Core Instrument Child Visualizer */}
        <div className="flex-1 min-h-0 relative">{children}</div>

        {/* Dynamic AI Advisor Panel overlay */}
        {showAi && (
          <div className="absolute inset-0 bg-[#0B0F14]/95 border-t border-[#1C2430] p-3 flex flex-col overflow-y-auto z-10 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-[#1C2430] pb-1.5 mb-2 font-mono uppercase">
              <span className="text-[#8B5CF6] font-black tracking-widest flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> telemetry system advice
              </span>
              <button
                onClick={() => setShowAi(false)}
                className="text-[#7A828C] hover:text-white text-[10px]"
              >
                [CLOSE]
              </button>
            </div>

            {aiLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-[#7A828C] font-mono py-8">
                <Loader2 className="h-5 w-5 animate-spin text-[#8B5CF6] mb-2" />
                <span>RESOLVING LOCAL COEFFICIENTS...</span>
              </div>
            ) : aiAdvice ? (
              <div className="space-y-2 select-text font-mono text-[10px] leading-relaxed">
                <div className="text-white whitespace-pre-wrap font-bold">{aiAdvice}</div>
                <div className="border-t border-[#1C2430]/60 pt-1.5 mt-2 flex items-center justify-between text-[#7A828C]">
                  <span className="uppercase text-[8px] font-bold">race engineer briefing</span>
                  <button
                    onClick={async () => {
                      try {
                        const { speak } = await import("@/lib/tts-client");
                        await speak(aiAdvice.replace(/[*#-]/g, ""));
                      } catch {
                        toast.error("TTS unavailable");
                      }
                    }}
                    className="flex items-center gap-1 text-[#3B82F6] hover:underline cursor-pointer"
                  >
                    <Volume2 className="h-3 w-3" /> AUDIO CALL
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-[#7A828C] font-mono text-center py-6">
                No active advisory generated. Click analyze to queue LLM.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
