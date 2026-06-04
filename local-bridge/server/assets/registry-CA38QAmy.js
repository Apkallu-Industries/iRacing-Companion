import { create } from "zustand";
import { jsxs, jsx } from "react/jsx-runtime";
import { K as useTelemetry } from "./router-D8VllJ-f.js";
import { useState, useEffect, useRef } from "react";
import {
  Sliders,
  Sparkles,
  ExternalLink,
  Maximize2,
  Loader2,
  Volume2,
  AlertTriangle,
  Battery,
  Thermometer,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
const useTelemetryRuntimeStore = create((set, get) => ({
  cursorTick: 0,
  activeLap: null,
  playbackSpeed: 1,
  isPlaying: false,
  activePreset: "gt3",
  selectedInstrument: null,
  events: [],
  activeEvent: null,
  focusMode: "none",
  detachedTelemetryFrame: null,
  setCursorTick: (tick) => set({ cursorTick: tick }),
  setActiveLap: (lap) => set({ activeLap: lap }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setActivePreset: (preset) => set({ activePreset: preset }),
  selectInstrument: (instrument) => set({ selectedInstrument: instrument }),
  addEvent: (event) =>
    set((state) => ({
      events: [...state.events, { ...event, id: crypto.randomUUID() }],
    })),
  triggerEvent: (event) => {
    set({ activeEvent: event, cursorTick: Math.round(event.timestampSec * 60) });
    if (event.category === "inputs") {
      set({ activePreset: "coach", selectedInstrument: "inputs", focusMode: "inputs" });
    } else if (event.category === "thermal") {
      set({ activePreset: "gt3", selectedInstrument: "tires", focusMode: "brakes" });
    } else if (event.category === "hybrid") {
      set({ activePreset: "gtp", selectedInstrument: "ers", focusMode: "ers" });
    } else if (event.category === "dynamics") {
      set({ activePreset: "aero", selectedInstrument: "chassis", focusMode: "chassis" });
    }
  },
  clearEvents: () => set({ events: [], activeEvent: null }),
  setFocusMode: (mode) => set({ focusMode: mode }),
  setDetachedTelemetryFrame: (frame) => set({ detachedTelemetryFrame: frame }),
}));
const syncBC = typeof window !== "undefined" ? new BroadcastChannel("pitwall-runtime-sync") : null;
let isIncomingSync = false;
if (syncBC) {
  syncBC.onmessage = (event) => {
    const { type, payload } = event.data;
    if (type === "SYNC_STATE") {
      isIncomingSync = true;
      const state = useTelemetryRuntimeStore.getState();
      const updates = {};
      if (payload.cursorTick !== void 0 && payload.cursorTick !== state.cursorTick) {
        updates.cursorTick = payload.cursorTick;
      }
      if (payload.activeLap !== void 0 && payload.activeLap !== state.activeLap) {
        updates.activeLap = payload.activeLap;
      }
      if (payload.activePreset !== void 0 && payload.activePreset !== state.activePreset) {
        updates.activePreset = payload.activePreset;
      }
      if (
        payload.selectedInstrument !== void 0 &&
        payload.selectedInstrument !== state.selectedInstrument
      ) {
        updates.selectedInstrument = payload.selectedInstrument;
      }
      if (payload.focusMode !== void 0 && payload.focusMode !== state.focusMode) {
        updates.focusMode = payload.focusMode;
      }
      if (payload.isPlaying !== void 0 && payload.isPlaying !== state.isPlaying) {
        updates.isPlaying = payload.isPlaying;
      }
      if (Object.keys(updates).length > 0) {
        useTelemetryRuntimeStore.setState(updates);
      }
      isIncomingSync = false;
    } else if (type === "REPLAY_FRAME") {
      useTelemetryRuntimeStore.setState({ detachedTelemetryFrame: payload });
    }
  };
  useTelemetryRuntimeStore.subscribe((state) => {
    if (isIncomingSync) return;
    syncBC.postMessage({
      type: "SYNC_STATE",
      payload: {
        cursorTick: state.cursorTick,
        activeLap: state.activeLap,
        activePreset: state.activePreset,
        selectedInstrument: state.selectedInstrument,
        focusMode: state.focusMode,
        isPlaying: state.isPlaying,
      },
    });
  });
}
function broadcastTelemetryFrame(frame) {
  if (syncBC && !isIncomingSync) {
    syncBC.postMessage({
      type: "REPLAY_FRAME",
      payload: frame,
    });
  }
}
function TelemetryInstrument({
  title,
  mode = "live",
  onModeChange,
  onAiAnalyze,
  aiLoading = false,
  aiAdvice = null,
  children,
  activeStatus = "ACTIVE",
  activeStatusColor = "text-[#00D17F] border-[#00D17F]/30 bg-[#00D17F]/10",
}) {
  const [showAi, setShowAi] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [highlighted, setHighlighted] = useState(false);
  useEffect(() => {
    const handleChannelClick = (e) => {
      const channel = (e.detail?.channel || "").toLowerCase();
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
  return /* @__PURE__ */ jsxs("div", {
    className: `border bg-[#0B0F14] flex flex-col font-mono text-xs select-none transition-all duration-200 ${highlighted ? "border-[#FFB800] shadow-[0_0_15px_rgba(255,184,0,0.35)] ring-1 ring-[#FFB800]/40 scale-[1.01]" : "border-[#1C2430]"} ${expanded ? "fixed inset-4 z-50 bg-[#0B0F14]/95 backdrop-blur shadow-2xl" : "h-full min-h-[220px]"}`,
    children: [
      /* @__PURE__ */ jsxs("div", {
        className:
          "px-3 py-1.5 border-b border-[#1C2430] bg-[#11161D] flex items-center justify-between shrink-0 select-none",
        children: [
          /* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-2",
            children: [
              /* @__PURE__ */ jsx("span", {
                className: "p-1 rounded bg-[#05070A] border border-[#1C2430] text-[#3B82F6]",
                children: /* @__PURE__ */ jsx(Sliders, { className: "h-3 w-3" }),
              }),
              /* @__PURE__ */ jsx("span", {
                className: "font-bold text-white uppercase tracking-wider text-[10px]",
                children: title,
              }),
              activeStatus &&
                /* @__PURE__ */ jsx("span", {
                  className: `text-[8px] font-bold tracking-widest px-1.5 py-0.5 border ${activeStatusColor}`,
                  children: activeStatus,
                }),
            ],
          }),
          /* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-1.5",
            children: [
              onModeChange &&
                /* @__PURE__ */ jsx("div", {
                  className:
                    "flex border border-[#1C2430] bg-[#05070A] rounded-sm mr-1 overflow-hidden",
                  children: ["live", "replay", "compare"].map((m) =>
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => onModeChange(m),
                        className: `px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-bold cursor-pointer ${mode === m ? "bg-[#3B82F6] text-white" : "text-[#7A828C] hover:text-[#E2E4E8]"}`,
                        children: m,
                      },
                      m,
                    ),
                  ),
                }),
              onAiAnalyze &&
                /* @__PURE__ */ jsx("button", {
                  onClick: toggleAi,
                  className: `p-1 rounded border transition-colors cursor-pointer ${showAi ? "border-[#8B5CF6]/50 bg-[#8B5CF6]/15 text-[#8B5CF6]" : "border-[#1C2430] bg-[#05070A] text-[#7A828C] hover:text-white"}`,
                  title: "Toggle AI System Advisor",
                  children: /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5" }),
                }),
              /* @__PURE__ */ jsx("button", {
                onClick: handleDetach,
                className:
                  "p-1 rounded border border-[#1C2430] bg-[#05070A] text-[#7A828C] hover:text-white transition-colors cursor-pointer",
                title: "Detach instrument to external array",
                children: /* @__PURE__ */ jsx(ExternalLink, { className: "h-3.5 w-3.5" }),
              }),
              /* @__PURE__ */ jsx("button", {
                onClick: () => setExpanded(!expanded),
                className:
                  "p-1 rounded border border-[#1C2430] bg-[#05070A] text-[#7A828C] hover:text-white transition-colors cursor-pointer",
                title: expanded ? "Restore down" : "Maximize view",
                children: /* @__PURE__ */ jsx(Maximize2, { className: "h-3.5 w-3.5" }),
              }),
            ],
          }),
        ],
      }),
      /* @__PURE__ */ jsxs("div", {
        className: "flex-1 min-h-0 flex flex-col relative bg-[#05070A]",
        children: [
          /* @__PURE__ */ jsx("div", { className: "flex-1 min-h-0 relative", children }),
          showAi &&
            /* @__PURE__ */ jsxs("div", {
              className:
                "absolute inset-0 bg-[#0B0F14]/95 border-t border-[#1C2430] p-3 flex flex-col overflow-y-auto z-10 font-sans text-xs",
              children: [
                /* @__PURE__ */ jsxs("div", {
                  className:
                    "flex items-center justify-between border-b border-[#1C2430] pb-1.5 mb-2 font-mono uppercase",
                  children: [
                    /* @__PURE__ */ jsxs("span", {
                      className:
                        "text-[#8B5CF6] font-black tracking-widest flex items-center gap-1",
                      children: [
                        /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5" }),
                        " telemetry system advice",
                      ],
                    }),
                    /* @__PURE__ */ jsx("button", {
                      onClick: () => setShowAi(false),
                      className: "text-[#7A828C] hover:text-white text-[10px]",
                      children: "[CLOSE]",
                    }),
                  ],
                }),
                aiLoading
                  ? /* @__PURE__ */ jsxs("div", {
                      className:
                        "flex-1 flex flex-col items-center justify-center text-[#7A828C] font-mono py-8",
                      children: [
                        /* @__PURE__ */ jsx(Loader2, {
                          className: "h-5 w-5 animate-spin text-[#8B5CF6] mb-2",
                        }),
                        /* @__PURE__ */ jsx("span", {
                          children: "RESOLVING LOCAL COEFFICIENTS...",
                        }),
                      ],
                    })
                  : aiAdvice
                    ? /* @__PURE__ */ jsxs("div", {
                        className: "space-y-2 select-text font-mono text-[10px] leading-relaxed",
                        children: [
                          /* @__PURE__ */ jsx("div", {
                            className: "text-white whitespace-pre-wrap font-bold",
                            children: aiAdvice,
                          }),
                          /* @__PURE__ */ jsxs("div", {
                            className:
                              "border-t border-[#1C2430]/60 pt-1.5 mt-2 flex items-center justify-between text-[#7A828C]",
                            children: [
                              /* @__PURE__ */ jsx("span", {
                                className: "uppercase text-[8px] font-bold",
                                children: "race engineer briefing",
                              }),
                              /* @__PURE__ */ jsxs("button", {
                                onClick: async () => {
                                  try {
                                    const { speak } = await import("./tts-client-D74KVeiv.js");
                                    await speak(aiAdvice.replace(/[*#-]/g, ""));
                                  } catch {
                                    toast.error("TTS unavailable");
                                  }
                                },
                                className:
                                  "flex items-center gap-1 text-[#3B82F6] hover:underline cursor-pointer",
                                children: [
                                  /* @__PURE__ */ jsx(Volume2, { className: "h-3 w-3" }),
                                  " AUDIO CALL",
                                ],
                              }),
                            ],
                          }),
                        ],
                      })
                    : /* @__PURE__ */ jsx("div", {
                        className: "text-[#7A828C] font-mono text-center py-6",
                        children: "No active advisory generated. Click analyze to queue LLM.",
                      }),
              ],
            }),
        ],
      }),
    ],
  });
}
function BrakeInstrument({ telemetry: propTelemetry, mode = "live" }) {
  const liveTelemetry = useTelemetry();
  const t = propTelemetry || liveTelemetry;
  const flBrakeTemp = t.tires?.fl?.brakeTempC ?? 320;
  const frBrakeTemp = t.tires?.fr?.brakeTempC ?? 350;
  const rlBrakeTemp = t.tires?.rl?.brakeTempC ?? 310;
  const rrBrakeTemp = t.tires?.rr?.brakeTempC ?? 315;
  const flBrakePress = t.tires?.fl?.brakeLinePress ?? t.brake * 65;
  const frBrakePress = t.tires?.fr?.brakeLinePress ?? t.brake * 65;
  const rlBrakePress = t.tires?.rl?.brakeLinePress ?? t.brake * 45;
  const rrBrakePress = t.tires?.rr?.brakeLinePress ?? t.brake * 45;
  const brakeBias = t.brakeBias ?? 54.5;
  const rawBrake = t.brake ?? 0;
  const isLockedUp = rawBrake > 0.85 && Math.abs(t.steeringDeg) > 45;
  const thresholdLimit = 82;
  const getTempColor = (temp) => {
    if (temp > 450) return "text-[#FF4D4D] border-[#FF4D4D]";
    if (temp > 380) return "text-[#FFB800] border-[#FFB800]";
    return "text-[#00D17F] border-[#00D17F]/40";
  };
  const getBarColor = (temp) => {
    if (temp > 450) return "bg-[#FF4D4D]";
    if (temp > 380) return "bg-[#FFB800]";
    return "bg-[#00D17F]";
  };
  const aiAdvice = `BRAKE DIAGNOSTIC ANALYSIS (LAP ${t.connected ? "LATEST" : "REF"}):
- Peak Brake Pressure: ${(Math.max(flBrakePress, frBrakePress) * 1.2).toFixed(1)} bar.
- Thermal Saturation: Front brake temperatures peak at ${Math.max(flBrakeTemp, frBrakeTemp).toFixed(0)}°C on corner entry.
- Recommendation: Shift brake bias +0.5% forward if experiencing rear instability under trail braking at Turn 8. Maintain threshold pressure below ${thresholdLimit}% to avoid front lockups.`;
  return /* @__PURE__ */ jsx(TelemetryInstrument, {
    title: "Brake Instrument",
    mode,
    activeStatus: isLockedUp ? "LOCKUP DETECTED" : "SYS ACTIVE",
    activeStatusColor: isLockedUp
      ? "text-[#FF4D4D] border-[#FF4D4D]/40 bg-[#FF4D4D]/10"
      : "text-[#00D17F] border-[#00D17F]/30 bg-[#00D17F]/10",
    onAiAnalyze: () => {},
    aiAdvice,
    children: /* @__PURE__ */ jsxs("div", {
      className: "p-3 h-full flex flex-col justify-between font-mono bg-[#05070A] text-white",
      children: [
        isLockedUp &&
          /* @__PURE__ */ jsxs("div", {
            className:
              "absolute top-1 right-2 animate-pulse flex items-center gap-1 text-[#FF4D4D] bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 px-1.5 py-0.5 rounded text-[8px] font-black z-20",
            children: [
              /* @__PURE__ */ jsx(AlertTriangle, { className: "h-3 w-3" }),
              " LOCKUP WARNING",
            ],
          }),
        /* @__PURE__ */ jsxs("div", {
          className: "grid grid-cols-2 gap-4 flex-1",
          children: [
            /* @__PURE__ */ jsxs("div", {
              className: "flex flex-col justify-between border-r border-[#1C2430]/60 pr-3",
              children: [
                /* @__PURE__ */ jsx("div", {
                  className:
                    "text-[10px] text-[#7A828C] border-b border-[#1C2430]/40 pb-1 uppercase font-bold tracking-wider",
                  children: "Thermal & Pressure Hub",
                }),
                /* @__PURE__ */ jsxs("div", {
                  className: "grid grid-cols-2 gap-2 my-2",
                  children: [
                    /* @__PURE__ */ jsxs("div", {
                      className: `p-1.5 border rounded-sm ${getTempColor(flBrakeTemp)} bg-[#0B0F14] flex flex-col`,
                      children: [
                        /* @__PURE__ */ jsx("span", {
                          className: "text-[8px] text-[#7A828C] font-bold",
                          children: "FL BRAKE",
                        }),
                        /* @__PURE__ */ jsxs("span", {
                          className: "text-sm font-black tracking-tighter tabular-nums",
                          children: [flBrakeTemp.toFixed(0), "°C"],
                        }),
                        /* @__PURE__ */ jsx("div", {
                          className: "w-full bg-[#1C2430] h-1 rounded-full mt-1.5 overflow-hidden",
                          children: /* @__PURE__ */ jsx("div", {
                            className: `h-full ${getBarColor(flBrakeTemp)}`,
                            style: { width: `${Math.min(100, (flBrakeTemp / 600) * 100)}%` },
                          }),
                        }),
                        /* @__PURE__ */ jsxs("span", {
                          className: "text-[8px] text-white mt-1 tabular-nums",
                          children: [flBrakePress.toFixed(1), " Bar"],
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxs("div", {
                      className: `p-1.5 border rounded-sm ${getTempColor(frBrakeTemp)} bg-[#0B0F14] flex flex-col`,
                      children: [
                        /* @__PURE__ */ jsx("span", {
                          className: "text-[8px] text-[#7A828C] font-bold",
                          children: "FR BRAKE",
                        }),
                        /* @__PURE__ */ jsxs("span", {
                          className: "text-sm font-black tracking-tighter tabular-nums",
                          children: [frBrakeTemp.toFixed(0), "°C"],
                        }),
                        /* @__PURE__ */ jsx("div", {
                          className: "w-full bg-[#1C2430] h-1 rounded-full mt-1.5 overflow-hidden",
                          children: /* @__PURE__ */ jsx("div", {
                            className: `h-full ${getBarColor(frBrakeTemp)}`,
                            style: { width: `${Math.min(100, (frBrakeTemp / 600) * 100)}%` },
                          }),
                        }),
                        /* @__PURE__ */ jsxs("span", {
                          className: "text-[8px] text-white mt-1 tabular-nums",
                          children: [frBrakePress.toFixed(1), " Bar"],
                        }),
                      ],
                    }),
                  ],
                }),
                /* @__PURE__ */ jsxs("div", {
                  className: "grid grid-cols-2 gap-2",
                  children: [
                    /* @__PURE__ */ jsxs("div", {
                      className: `p-1.5 border rounded-sm ${getTempColor(rlBrakeTemp)} bg-[#0B0F14] flex flex-col`,
                      children: [
                        /* @__PURE__ */ jsx("span", {
                          className: "text-[8px] text-[#7A828C] font-bold",
                          children: "RL BRAKE",
                        }),
                        /* @__PURE__ */ jsxs("span", {
                          className: "text-sm font-black tracking-tighter tabular-nums",
                          children: [rlBrakeTemp.toFixed(0), "°C"],
                        }),
                        /* @__PURE__ */ jsx("div", {
                          className: "w-full bg-[#1C2430] h-1 rounded-full mt-1.5 overflow-hidden",
                          children: /* @__PURE__ */ jsx("div", {
                            className: `h-full ${getBarColor(rlBrakeTemp)}`,
                            style: { width: `${Math.min(100, (rlBrakeTemp / 600) * 100)}%` },
                          }),
                        }),
                        /* @__PURE__ */ jsxs("span", {
                          className: "text-[8px] text-white mt-1 tabular-nums",
                          children: [rlBrakePress.toFixed(1), " Bar"],
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxs("div", {
                      className: `p-1.5 border rounded-sm ${getTempColor(rrBrakeTemp)} bg-[#0B0F14] flex flex-col`,
                      children: [
                        /* @__PURE__ */ jsx("span", {
                          className: "text-[8px] text-[#7A828C] font-bold",
                          children: "RR BRAKE",
                        }),
                        /* @__PURE__ */ jsxs("span", {
                          className: "text-sm font-black tracking-tighter tabular-nums",
                          children: [rrBrakeTemp.toFixed(0), "°C"],
                        }),
                        /* @__PURE__ */ jsx("div", {
                          className: "w-full bg-[#1C2430] h-1 rounded-full mt-1.5 overflow-hidden",
                          children: /* @__PURE__ */ jsx("div", {
                            className: `h-full ${getBarColor(rrBrakeTemp)}`,
                            style: { width: `${Math.min(100, (rrBrakeTemp / 600) * 100)}%` },
                          }),
                        }),
                        /* @__PURE__ */ jsxs("span", {
                          className: "text-[8px] text-white mt-1 tabular-nums",
                          children: [rrBrakePress.toFixed(1), " Bar"],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            /* @__PURE__ */ jsxs("div", {
              className: "flex flex-col justify-between pl-1",
              children: [
                /* @__PURE__ */ jsxs("div", {
                  className:
                    "text-[10px] text-[#7A828C] border-b border-[#1C2430]/40 pb-1.5 uppercase font-bold tracking-wider flex justify-between",
                  children: [
                    /* @__PURE__ */ jsx("span", { children: "Brake Command Balance" }),
                    /* @__PURE__ */ jsxs("span", {
                      className: "text-[#3B82F6] tabular-nums",
                      children: ["BIAS: ", brakeBias.toFixed(1), "%"],
                    }),
                  ],
                }),
                /* @__PURE__ */ jsxs("div", {
                  className: "flex-1 flex flex-col justify-center gap-1.5 my-2.5",
                  children: [
                    /* @__PURE__ */ jsxs("div", {
                      className: "flex justify-between items-center text-[9px] text-[#7A828C]",
                      children: [
                        /* @__PURE__ */ jsx("span", { children: "PRESSURE ENVELOPE" }),
                        /* @__PURE__ */ jsxs("span", {
                          className: "tabular-nums font-bold text-white",
                          children: [(rawBrake * 100).toFixed(0), "%"],
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxs("div", {
                      className:
                        "h-10 bg-[#0B0F14] border border-[#1C2430] rounded-sm p-1.5 relative overflow-hidden flex flex-col justify-center",
                      children: [
                        /* @__PURE__ */ jsx("div", {
                          className: `h-4 transition-all duration-75 rounded-sm ${isLockedUp ? "bg-[#FF4D4D]" : "bg-[#3B82F6]"}`,
                          style: { width: `${rawBrake * 100}%` },
                        }),
                        /* @__PURE__ */ jsx("div", {
                          className:
                            "absolute top-0 bottom-0 border-l border-dashed border-[#FFB800] z-10",
                          style: { left: `${thresholdLimit}%` },
                          title: "Target threshold line",
                          children: /* @__PURE__ */ jsxs("span", {
                            className:
                              "absolute top-0.5 left-1 text-[7px] text-[#FFB800] font-black tracking-widest bg-[#05070A] px-0.5 rounded",
                            children: ["THR: ", thresholdLimit, "%"],
                          }),
                        }),
                      ],
                    }),
                  ],
                }),
                /* @__PURE__ */ jsxs("div", {
                  className:
                    "grid grid-cols-2 gap-2 text-[9px] text-[#7A828C] bg-[#0B0F14] p-1.5 rounded-sm border border-[#1C2430]/60",
                  children: [
                    /* @__PURE__ */ jsxs("div", {
                      className: "flex flex-col",
                      children: [
                        /* @__PURE__ */ jsx("span", { children: "F/R BIAS BAL" }),
                        /* @__PURE__ */ jsxs("span", {
                          className: "text-white font-bold tabular-nums",
                          children: [brakeBias, "% / ", (100 - brakeBias).toFixed(1), "%"],
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxs("div", {
                      className: "flex flex-col",
                      children: [
                        /* @__PURE__ */ jsx("span", { children: "PEAK FORCE" }),
                        /* @__PURE__ */ jsxs("span", {
                          className: "text-[#FF4D4D] font-bold tabular-nums",
                          children: [(rawBrake * 80).toFixed(0), " kg"],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  });
}
function ERSInstrument({ telemetry: propTelemetry, mode = "live" }) {
  const liveTelemetry = useTelemetry();
  const t = propTelemetry || liveTelemetry;
  const rawThrottle = t.throttle ?? 0;
  const rawBrake = t.brake ?? 0;
  const soc =
    t.extras?.ersSoc ??
    Math.max(
      12.5,
      Math.min(
        98.5,
        78.4 + 15 * Math.sin(performance.now() / 8e3) - rawThrottle * 3 + rawBrake * 4.5,
      ),
    );
  const batteryTemp = t.extras?.ersBatteryTemp ?? 42.5 + soc * 0.1 + rawThrottle * 5.2;
  const mgukDeploy =
    t.extras?.mgukDeployKw ??
    (rawThrottle > 0.15 ? Math.min(120, rawThrottle * 120 + Math.random() * 2) : 0);
  const mgukRegen =
    t.extras?.mgukRegenKw ??
    (rawBrake > 0.1 ? Math.min(200, rawBrake * 200 + Math.random() * 3) : 0);
  const efficiency = Math.max(88, Math.min(99.6, 96.5 + 2 * Math.sin(performance.now() / 4e3)));
  const isDeploying = mgukDeploy > 10;
  const isRecovering = mgukRegen > 10;
  let activeState = "BALANCED";
  let activeStateColor = "text-[#8B5CF6] border-[#8B5CF6]/30 bg-[#8B5CF6]/10";
  if (isDeploying) {
    activeState = "DEPLOYING";
    activeStateColor = "text-[#FFB800] border-[#FFB800]/30 bg-[#FFB800]/10";
  } else if (isRecovering) {
    activeState = "RECOVERING";
    activeStateColor = "text-[#00D17F] border-[#00D17F]/30 bg-[#00D17F]/10";
  }
  const totalSegments = 16;
  const activeSegments = Math.round((soc / 100) * totalSegments);
  const aiAdvice = `HYBRID / ERS TELEMETRY FEEDBACK:
- SOC Balance: Current Charge is ${soc.toFixed(1)}%. Thermal margin looks healthy at ${batteryTemp.toFixed(1)}°C.
- Deployment Strategy: MGU-K peaks at ${mgukDeploy.toFixed(0)} kW. Regeneration phase recaptures up to ${mgukRegen.toFixed(0)} kW under braking.
- Tuning Advice: Boost ERS Deployment Map to Mode 4 on the back straight to secure overtaking delta, then back off to Mode 2 through the sector 3 technical turns.`;
  return /* @__PURE__ */ jsx(TelemetryInstrument, {
    title: "ERS Instrument",
    mode,
    activeStatus: activeState,
    activeStatusColor: activeStateColor,
    onAiAnalyze: () => {},
    aiAdvice,
    children: /* @__PURE__ */ jsx("div", {
      className: "p-3 h-full flex flex-col justify-between font-mono bg-[#05070A] text-white",
      children: /* @__PURE__ */ jsxs("div", {
        className: "grid grid-cols-12 gap-3 flex-1",
        children: [
          /* @__PURE__ */ jsxs("div", {
            className: "col-span-5 flex flex-col justify-between border-r border-[#1C2430]/60 pr-3",
            children: [
              /* @__PURE__ */ jsxs("div", {
                className:
                  "flex items-center gap-1.5 text-[10px] text-[#7A828C] uppercase font-bold tracking-wider mb-2",
                children: [
                  /* @__PURE__ */ jsx(Battery, { className: "h-3.5 w-3.5 text-[#8B5CF6]" }),
                  /* @__PURE__ */ jsx("span", { children: "State Of Charge" }),
                ],
              }),
              /* @__PURE__ */ jsxs("div", {
                className: "flex-1 flex flex-col justify-center",
                children: [
                  /* @__PURE__ */ jsxs("div", {
                    className: "flex items-baseline gap-1.5 mb-1.5",
                    children: [
                      /* @__PURE__ */ jsxs("span", {
                        className: "text-2xl font-black text-white tabular-nums tracking-tighter",
                        children: [soc.toFixed(1), "%"],
                      }),
                      /* @__PURE__ */ jsx("span", {
                        className: "text-[8px] text-[#8B5CF6] font-bold",
                        children: "SOC",
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsx("div", {
                    className:
                      "grid grid-cols-8 gap-1 p-1 bg-[#0B0F14] border border-[#1C2430] rounded-sm",
                    children: Array.from({ length: totalSegments }).map((_, idx) => {
                      const isActive = idx < activeSegments;
                      return /* @__PURE__ */ jsx(
                        "div",
                        {
                          className: `h-4.5 rounded-xs transition-colors duration-150 ${isActive ? "bg-gradient-to-t from-[#8B5CF6] to-[#a855f7]" : "bg-[#11161D] border border-[#1C2430]/40"}`,
                        },
                        idx,
                      );
                    }),
                  }),
                ],
              }),
              /* @__PURE__ */ jsxs("div", {
                className:
                  "mt-2 pt-2 border-t border-[#1C2430]/40 flex justify-between items-center text-[9px] text-[#7A828C]",
                children: [
                  /* @__PURE__ */ jsxs("span", {
                    className: "flex items-center gap-0.5",
                    children: [
                      /* @__PURE__ */ jsx(Thermometer, { className: "h-3 w-3 text-[#FFB800]" }),
                      " TEMP:",
                    ],
                  }),
                  /* @__PURE__ */ jsxs("span", {
                    className: "text-white font-bold tabular-nums",
                    children: [batteryTemp.toFixed(1), "°C"],
                  }),
                ],
              }),
            ],
          }),
          /* @__PURE__ */ jsxs("div", {
            className: "col-span-7 flex flex-col justify-between pl-1",
            children: [
              /* @__PURE__ */ jsxs("div", {
                className:
                  "text-[10px] text-[#7A828C] border-b border-[#1C2430]/40 pb-1.5 uppercase font-bold tracking-wider flex justify-between",
                children: [
                  /* @__PURE__ */ jsx("span", { children: "MGU-K KINETIC ENGINE" }),
                  /* @__PURE__ */ jsxs("span", {
                    className: "text-[#8B5CF6] font-bold",
                    children: ["EFF: ", efficiency.toFixed(1), "%"],
                  }),
                ],
              }),
              /* @__PURE__ */ jsxs("div", {
                className: "flex-1 flex flex-col justify-center gap-2.5 my-2",
                children: [
                  /* @__PURE__ */ jsxs("div", {
                    className: "flex flex-col gap-1",
                    children: [
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex justify-between items-center text-[8px] text-[#7A828C]",
                        children: [
                          /* @__PURE__ */ jsx("span", { children: "DEPLOYMENT PRESSURE" }),
                          /* @__PURE__ */ jsxs("span", {
                            className: "tabular-nums font-bold text-[#FFB800]",
                            children: [mgukDeploy.toFixed(0), " kW / 120kW"],
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsx("div", {
                        className:
                          "w-full bg-[#0B0F14] h-2 rounded-xs border border-[#1C2430] overflow-hidden",
                        children: /* @__PURE__ */ jsx("div", {
                          className: "h-full bg-[#FFB800] transition-all duration-75",
                          style: { width: `${(mgukDeploy / 120) * 100}%` },
                        }),
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "flex flex-col gap-1",
                    children: [
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex justify-between items-center text-[8px] text-[#7A828C]",
                        children: [
                          /* @__PURE__ */ jsx("span", { children: "RECOVERY HARVEST" }),
                          /* @__PURE__ */ jsxs("span", {
                            className: "tabular-nums font-bold text-[#00D17F]",
                            children: [mgukRegen.toFixed(0), " kW / 200kW"],
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsx("div", {
                        className:
                          "w-full bg-[#0B0F14] h-2 rounded-xs border border-[#1C2430] overflow-hidden",
                        children: /* @__PURE__ */ jsx("div", {
                          className: "h-full bg-[#00D17F] transition-all duration-75",
                          style: { width: `${(mgukRegen / 200) * 100}%` },
                        }),
                      }),
                    ],
                  }),
                ],
              }),
              /* @__PURE__ */ jsxs("div", {
                className: "grid grid-cols-3 gap-1 text-[8px] text-[#7A828C] text-center font-bold",
                children: [
                  /* @__PURE__ */ jsxs("div", {
                    className: "bg-[#0B0F14] border border-[#1C2430] py-1 rounded-xs",
                    children: [
                      /* @__PURE__ */ jsx("div", { children: "MAP" }),
                      /* @__PURE__ */ jsx("div", {
                        className: "text-white text-[10px] font-black",
                        children: "M3",
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "bg-[#0B0F14] border border-[#1C2430] py-1 rounded-xs",
                    children: [
                      /* @__PURE__ */ jsx("div", { children: "REGEN" }),
                      /* @__PURE__ */ jsx("div", {
                        className: "text-[#00D17F] text-[10px] font-black",
                        children: "LVL 4",
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "bg-[#0B0F14] border border-[#1C2430] py-1 rounded-xs",
                    children: [
                      /* @__PURE__ */ jsx("div", { children: "TARGET" }),
                      /* @__PURE__ */ jsx("div", {
                        className: "text-[#8B5CF6] text-[10px] font-black",
                        children: "75%",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    }),
  });
}
const CAR_PROFILES = {
  gt3: {
    name: "GT3 Grand Touring",
    badge: "GT3 CLASS",
    headOnUrl: "/images/GT3-Head-ON.png",
    sideOnUrl: "/images/GT3-Side-ON.png",
    frontWheelX: -56,
    // Facing left, so front wheel is on negative x-axis
    rearWheelX: 54,
    // Rear wheel is on positive x-axis
    wheelY: 11.5,
    // Wheel center Y
    wheelScale: 11,
    carImageScale: 220,
    yOffset: 3.5,
    // Shift down to rest perfectly on the ground
    frontViewWheelX: 45,
    frontViewWheelY: 11.5,
    frontViewTireWidth: 13,
    frontViewTireHeight: 22,
  },
  gtp: {
    name: "GTP Prototype / LMDh",
    badge: "GTP PROTOTYPE",
    headOnUrl: "/images/GTP-Head-ON.png",
    sideOnUrl: "/images/GTP-Side-ON.png",
    frontWheelX: -61,
    // Facing left, so front wheel is on negative x-axis
    rearWheelX: 59,
    // Rear wheel is on positive x-axis
    wheelY: 11.5,
    // Wheel center Y
    wheelScale: 11.5,
    carImageScale: 225,
    yOffset: 2.5,
    // Shift down to rest perfectly on the ground
    frontViewWheelX: 47,
    frontViewWheelY: 11.5,
    frontViewTireWidth: 14,
    frontViewTireHeight: 23,
  },
  nascar: {
    name: "NASCAR Cup Stock Car",
    badge: "NASCAR CUP",
    headOnUrl: "/images/NASCAR-Head-ON.png",
    sideOnUrl: "/images/NASCAR-Side-ON.png",
    frontWheelX: -54,
    // Facing left, so front wheel is on negative x-axis
    rearWheelX: 52,
    // Rear wheel is on positive x-axis
    wheelY: 11.5,
    // Wheel center Y
    wheelScale: 11.5,
    carImageScale: 218,
    yOffset: 3,
    // Shift down to rest perfectly on the ground
    frontViewWheelX: 44,
    frontViewWheelY: 11.5,
    frontViewTireWidth: 14,
    frontViewTireHeight: 23,
  },
  nascar_truck: {
    name: "NASCAR Craftsman Truck",
    badge: "NASCAR TRUCK",
    headOnUrl: "/images/NASCAR Truck-Head-ON.png",
    sideOnUrl: "/images/NASCAR Truck-Side-ON.png",
    frontWheelX: -53,
    // Facing left, so front wheel is on negative x-axis
    rearWheelX: 51,
    // Rear wheel is on positive x-axis
    wheelY: 11.5,
    // Wheel center Y
    wheelScale: 12,
    carImageScale: 215,
    yOffset: 3,
    // Shift down to rest perfectly on the ground
    frontViewWheelX: 43,
    frontViewWheelY: 11.5,
    frontViewTireWidth: 14,
    frontViewTireHeight: 23,
  },
  openwheeler: {
    name: "Open Wheeler Formula",
    badge: "OPEN WHEELER",
    headOnUrl: "/images/OPEN-Wheeler-Head-ON.png",
    sideOnUrl: "/images/OPEN-Wheeler-Side-ON.png",
    frontWheelX: -64,
    // Facing left, so front wheel is on negative x-axis
    rearWheelX: 61,
    // Rear wheel is on positive x-axis
    wheelY: 11.5,
    // Wheel center Y
    wheelScale: 11.5,
    carImageScale: 228,
    yOffset: 2.5,
    // Shift down to rest perfectly on the ground
    frontViewWheelX: 52,
    frontViewWheelY: 11.5,
    frontViewTireWidth: 14,
    frontViewTireHeight: 23,
  },
};
function ChassisInstrument({ telemetry: propTelemetry, mode = "live" }) {
  const liveTelemetry = useTelemetry();
  const t = propTelemetry || liveTelemetry;
  const canvasRef = useRef(null);
  const [viewMode, setViewMode] = useState("side");
  const [overlayMode, setOverlayMode] = useState("rotate-car");
  const [loadedProfiles, setLoadedProfiles] = useState({});
  const [profilesLoaded, setProfilesLoaded] = useState(false);
  useEffect(() => {
    const keys = Object.keys(CAR_PROFILES);
    let loadedCount = 0;
    const totalToLoad = keys.length * 2;
    const newLoadedProfiles = {};
    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === totalToLoad) {
        setLoadedProfiles(newLoadedProfiles);
        setProfilesLoaded(true);
      }
    };
    keys.forEach((key) => {
      const profile2 = CAR_PROFILES[key];
      const sideImg = new Image();
      sideImg.src = profile2.sideOnUrl;
      sideImg.onload = () => {
        if (!newLoadedProfiles[key]) {
          newLoadedProfiles[key] = {};
        }
        newLoadedProfiles[key].side = sideImg;
        checkAllLoaded();
      };
      sideImg.onerror = () => {
        console.warn(`Failed to load side image for ${key}, fallback will be used`);
        checkAllLoaded();
      };
      const frontImg = new Image();
      frontImg.src = profile2.headOnUrl;
      frontImg.onload = () => {
        if (!newLoadedProfiles[key]) {
          newLoadedProfiles[key] = {};
        }
        newLoadedProfiles[key].front = frontImg;
        checkAllLoaded();
      };
      frontImg.onerror = () => {
        console.warn(`Failed to load front image for ${key}, fallback will be used`);
        checkAllLoaded();
      };
    });
  }, []);
  t.speedKph ?? 180;
  const steer = t.steeringDeg ?? 0;
  const gLat = t.gLat ?? 0;
  const gLon = t.gLon ?? 0;
  const throttle = t.throttle ?? 0;
  const brake = t.brake ?? 0;
  const pitchVal = -gLon * 1.8;
  const rollVal = gLat * 2.2;
  const baseFl = 45 + brake * 18 - throttle * 8 - gLat * 12;
  const baseFr = 45 + brake * 18 - throttle * 8 + gLat * 12;
  const baseRl = 42 - brake * 10 + throttle * 22 - gLat * 8;
  const baseRr = 42 - brake * 10 + throttle * 22 + gLat * 8;
  const flDeflect = Math.max(5, Math.min(95, baseFl + Math.sin(performance.now() / 80) * 1.5));
  const frDeflect = Math.max(5, Math.min(95, baseFr + Math.sin(performance.now() / 90) * 1.5));
  const rlDeflect = Math.max(5, Math.min(95, baseRl + Math.cos(performance.now() / 85) * 1.2));
  const rrDeflect = Math.max(5, Math.min(95, baseRr + Math.cos(performance.now() / 95) * 1.2));
  const carName = (t.car || "").toUpperCase();
  let activeClass = "gt3";
  if (
    carName.includes("GTP") ||
    carName.includes("LMDH") ||
    carName.includes("PROTOTYPE") ||
    carName.includes("DALLARA P217") ||
    carName.includes("P217") ||
    carName.includes("HPD") ||
    carName.includes("DP")
  ) {
    activeClass = "gtp";
  } else if (
    carName.includes("TRUCK") ||
    carName.includes("SILVERADO") ||
    carName.includes("TUNDRA") ||
    carName.includes("F150") ||
    carName.includes("NASCAR TRUCK")
  ) {
    activeClass = "nascar_truck";
  } else if (
    carName.includes("NASCAR") ||
    carName.includes("CUP") ||
    carName.includes("STOCKCAR") ||
    carName.includes("GEN6") ||
    carName.includes("NEXTGEN")
  ) {
    activeClass = "nascar";
  } else if (
    carName.includes("F1") ||
    carName.includes("FORMULA") ||
    carName.includes("INDY") ||
    carName.includes("IR18") ||
    carName.includes("OPEN") ||
    carName.includes("WHEELER") ||
    carName.includes("GP") ||
    carName.includes("DALLARA F3") ||
    carName.includes("DALLARA IR") ||
    carName.includes("SKIP BARBER")
  ) {
    activeClass = "openwheeler";
  } else {
    activeClass = "gt3";
  }
  const profile = CAR_PROFILES[activeClass] || CAR_PROFILES.gt3;
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(28, 36, 48, 0.3)";
    ctx.lineWidth = 0.5;
    for (let x = 10; x < w; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 10; y < h; y += 12) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.save();
    ctx.translate(w / 2, h / 2 - 8);
    const frWOffset = (frDeflect - 45) * 0.2;
    const flWOffset = (flDeflect - 45) * 0.2;
    const rrWOffset = (rrDeflect - 42) * 0.2;
    const deflectionAngle = viewMode === "side" ? pitchVal : rollVal;
    const rotationRad = (deflectionAngle * Math.PI) / 180;
    const carRot = overlayMode === "rotate-car" ? rotationRad : 0;
    const dialRot = overlayMode === "rotate-dial" ? -rotationRad : 0;
    ctx.save();
    ctx.rotate(dialRot);
    ctx.strokeStyle = "rgba(0, 209, 127, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 15, 23);
    ctx.lineTo(w / 2 - 15, 23);
    ctx.stroke();
    ctx.strokeStyle = "rgba(59, 130, 246, 0.2)";
    ctx.lineWidth = 0.75;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 15, 0);
    ctx.lineTo(w / 2 - 15, 0);
    ctx.stroke();
    ctx.setLineDash([]);
    const R = 135;
    ctx.strokeStyle = "rgba(122, 130, 140, 0.35)";
    ctx.lineWidth = 0.75;
    for (let deg = -15; deg <= 15; deg += 1) {
      const rad = (deg * Math.PI) / 180;
      const isMajor = deg % 5 === 0;
      const tickLen = isMajor ? 7 : 3.5;
      ctx.strokeStyle = isMajor ? "rgba(122, 130, 140, 0.5)" : "rgba(122, 130, 140, 0.25)";
      ctx.beginPath();
      ctx.moveTo(R * Math.cos(rad), R * Math.sin(rad));
      ctx.lineTo((R - tickLen) * Math.cos(rad), (R - tickLen) * Math.sin(rad));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-R * Math.cos(rad), -R * Math.sin(rad));
      ctx.lineTo(-(R - tickLen) * Math.cos(rad), -(R - tickLen) * Math.sin(rad));
      ctx.stroke();
      if (isMajor) {
        ctx.fillStyle = "rgba(122, 130, 140, 0.85)";
        ctx.font = "bold 5.5px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const labelR = R - 13;
        const sign = deg >= 0 ? "+" : "";
        ctx.fillText(`${sign}${deg}°`, labelR * Math.cos(rad), labelR * Math.sin(rad));
        ctx.fillText(`${sign}${deg}°`, -labelR * Math.cos(rad), -labelR * Math.sin(rad));
      }
    }
    ctx.restore();
    if (Math.abs(deflectionAngle) > 0.02) {
      ctx.save();
      const wedgeEnd = overlayMode === "rotate-car" ? rotationRad : -rotationRad;
      ctx.fillStyle = "rgba(239, 68, 68, 0.15)";
      ctx.strokeStyle = "rgba(239, 68, 68, 0.45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 110, 0, wedgeEnd, deflectionAngle < 0);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 110, Math.PI, Math.PI + wedgeEnd, deflectionAngle >= 0);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      const labelRad = wedgeEnd / 2;
      const labelX = 90 * Math.cos(labelRad);
      const labelY = 90 * Math.sin(labelRad);
      ctx.fillStyle = "#FF4D4D";
      ctx.font = "bold 7px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        `${deflectionAngle > 0 ? "+" : ""}${deflectionAngle.toFixed(2)}°`,
        labelX,
        labelY,
      );
      ctx.restore();
    }
    ctx.save();
    ctx.rotate(carRot);
    const activeProfileImages = loadedProfiles[activeClass];
    const hasImage =
      activeProfileImages &&
      activeProfileImages.side &&
      activeProfileImages.front &&
      profilesLoaded;
    const img = viewMode === "side" ? activeProfileImages?.side : activeProfileImages?.front;
    if (hasImage && img && img.complete && img.naturalWidth > 0) {
      const aspect = img.naturalWidth / img.naturalHeight;
      const imgW = profile.carImageScale;
      const imgH = imgW / aspect;
      ctx.drawImage(img, -imgW / 2, -imgH / 2 + profile.yOffset, imgW, imgH);
    }
    if (viewMode === "side") {
      const frontNomX = profile.frontWheelX;
      const frontNomY = profile.wheelY;
      const rearNomX = profile.rearWheelX;
      const rearNomY = profile.wheelY;
      const activeFrontY = frontNomY + frWOffset;
      const activeRearY = rearNomY + rrWOffset;
      ctx.strokeStyle = "rgba(251, 184, 0, 0.4)";
      ctx.lineWidth = 0.75;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(frontNomX, frontNomY);
      ctx.lineTo(frontNomX, activeFrontY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = "rgba(251, 184, 0, 0.65)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(frontNomX - 5, frontNomY);
      ctx.lineTo(frontNomX + 5, frontNomY);
      ctx.moveTo(frontNomX, frontNomY - 5);
      ctx.lineTo(frontNomX, frontNomY + 5);
      ctx.stroke();
      const frTravelMm = (frDeflect - 45) * 0.8;
      ctx.fillStyle = frTravelMm >= 0 ? "#FFB800" : "#FF4D4D";
      ctx.font = "bold 6.5px monospace";
      ctx.fillText(
        `${frTravelMm >= 0 ? "+" : ""}${frTravelMm.toFixed(1)}mm`,
        frontNomX - 35,
        // Position on the left (front of nose)
        activeFrontY + 2,
      );
      ctx.strokeStyle = "rgba(139, 92, 246, 0.4)";
      ctx.lineWidth = 0.75;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(rearNomX, rearNomY);
      ctx.lineTo(rearNomX, activeRearY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = "rgba(139, 92, 246, 0.65)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(rearNomX - 5, rearNomY);
      ctx.lineTo(rearNomX + 5, rearNomY);
      ctx.moveTo(rearNomX, rearNomY - 5);
      ctx.lineTo(rearNomX, rearNomY + 5);
      ctx.stroke();
      const rrTravelMm = (rrDeflect - 42) * 0.8;
      ctx.fillStyle = rrTravelMm >= 0 ? "#8B5CF6" : "#FF4D4D";
      ctx.font = "bold 6.5px monospace";
      ctx.fillText(
        `${rrTravelMm >= 0 ? "+" : ""}${rrTravelMm.toFixed(1)}mm`,
        rearNomX + 15,
        // Position on the right (behind rear wing)
        activeRearY + 2,
      );
      ctx.save();
      ctx.translate(frontNomX, activeFrontY);
      ctx.rotate(((steer * Math.PI) / 180) * 0.2);
      ctx.fillStyle = "rgba(9, 13, 20, 0.55)";
      ctx.strokeStyle = "rgba(251, 184, 0, 0.85)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, profile.wheelScale, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(profile.wheelScale * 0.6, 0);
      ctx.stroke();
      ctx.fillStyle = "#FFB800";
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.translate(rearNomX, activeRearY);
      ctx.fillStyle = "rgba(9, 13, 20, 0.55)";
      ctx.strokeStyle = "rgba(139, 92, 246, 0.85)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, profile.wheelScale + 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo((profile.wheelScale + 0.5) * 0.6, 0);
      ctx.stroke();
      ctx.fillStyle = "#8B5CF6";
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = "#00D17F";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(0, 6, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(122, 130, 140, 0.8)";
      ctx.font = "bold 6px monospace";
      ctx.fillText("PIVOT", 6, 8);
    } else {
      const leftNomX = -profile.frontViewWheelX;
      const rightNomX = profile.frontViewWheelX;
      const wheelNomY = profile.frontViewWheelY;
      const activeLeftY = wheelNomY + flWOffset;
      const activeRightY = wheelNomY + frWOffset;
      ctx.strokeStyle = "rgba(251, 184, 0, 0.4)";
      ctx.lineWidth = 0.75;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(leftNomX, wheelNomY);
      ctx.lineTo(leftNomX, activeLeftY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = "rgba(251, 184, 0, 0.65)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(leftNomX - 5, wheelNomY);
      ctx.lineTo(leftNomX + 5, wheelNomY);
      ctx.moveTo(leftNomX, wheelNomY - 5);
      ctx.lineTo(leftNomX, wheelNomY + 5);
      ctx.stroke();
      const flTravelMm = (flDeflect - 45) * 0.8;
      ctx.fillStyle = flTravelMm >= 0 ? "#FFB800" : "#FF4D4D";
      ctx.font = "bold 6.5px monospace";
      ctx.fillText(
        `${flTravelMm >= 0 ? "+" : ""}${flTravelMm.toFixed(1)}mm`,
        leftNomX - 35,
        activeLeftY + 2,
      );
      ctx.strokeStyle = "rgba(251, 184, 0, 0.4)";
      ctx.lineWidth = 0.75;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(rightNomX, wheelNomY);
      ctx.lineTo(rightNomX, activeRightY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = "rgba(251, 184, 0, 0.65)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(rightNomX - 5, wheelNomY);
      ctx.lineTo(rightNomX + 5, wheelNomY);
      ctx.moveTo(rightNomX, wheelNomY - 5);
      ctx.lineTo(rightNomX, wheelNomY + 5);
      ctx.stroke();
      const frTravelMm = (frDeflect - 45) * 0.8;
      ctx.fillStyle = frTravelMm >= 0 ? "#FFB800" : "#FF4D4D";
      ctx.font = "bold 6.5px monospace";
      ctx.fillText(
        `${frTravelMm >= 0 ? "+" : ""}${frTravelMm.toFixed(1)}mm`,
        rightNomX + 15,
        activeRightY + 2,
      );
      const steerSkew = Math.sin(((steer * Math.PI) / 180) * 0.12) * 0.35;
      ctx.save();
      ctx.translate(leftNomX, activeLeftY);
      ctx.transform(1, 0, steerSkew, 1, 0, 0);
      ctx.fillStyle = "rgba(9, 13, 20, 0.55)";
      ctx.strokeStyle = "rgba(251, 184, 0, 0.85)";
      ctx.lineWidth = 1;
      ctx.fillRect(
        -profile.frontViewTireWidth / 2,
        -profile.frontViewTireHeight / 2,
        profile.frontViewTireWidth,
        profile.frontViewTireHeight,
      );
      ctx.strokeRect(
        -profile.frontViewTireWidth / 2,
        -profile.frontViewTireHeight / 2,
        profile.frontViewTireWidth,
        profile.frontViewTireHeight,
      );
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.beginPath();
      ctx.moveTo(0, -profile.frontViewTireHeight * 0.35);
      ctx.lineTo(0, profile.frontViewTireHeight * 0.35);
      ctx.stroke();
      ctx.fillStyle = "#FFB800";
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.translate(rightNomX, activeRightY);
      ctx.transform(1, 0, steerSkew, 1, 0, 0);
      ctx.fillStyle = "rgba(9, 13, 20, 0.55)";
      ctx.strokeStyle = "rgba(251, 184, 0, 0.85)";
      ctx.lineWidth = 1;
      ctx.fillRect(
        -profile.frontViewTireWidth / 2,
        -profile.frontViewTireHeight / 2,
        profile.frontViewTireWidth,
        profile.frontViewTireHeight,
      );
      ctx.strokeRect(
        -profile.frontViewTireWidth / 2,
        -profile.frontViewTireHeight / 2,
        profile.frontViewTireWidth,
        profile.frontViewTireHeight,
      );
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.beginPath();
      ctx.moveTo(0, -profile.frontViewTireHeight * 0.35);
      ctx.lineTo(0, profile.frontViewTireHeight * 0.35);
      ctx.stroke();
      ctx.fillStyle = "#FFB800";
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = "#00D17F";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(0, 6, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    if (!hasImage) {
      ctx.fillStyle = "rgba(122, 130, 140, 0.1)";
      ctx.strokeStyle = "rgba(122, 130, 140, 0.35)";
      ctx.lineWidth = 0.75;
      if (viewMode === "side") {
        ctx.fillRect(-85, 12, 170, 3);
        ctx.strokeRect(-85, 12, 170, 3);
        ctx.fillStyle = "rgba(59, 130, 246, 0.03)";
        ctx.fillRect(-35, -5, 70, 17);
        ctx.strokeRect(-35, -5, 70, 17);
        ctx.fillStyle = "rgba(122, 130, 140, 0.2)";
        ctx.fillRect(-15, 2, 30, 10);
        ctx.strokeRect(-15, 2, 30, 10);
        ctx.beginPath();
        ctx.moveTo(-85, 15);
        ctx.lineTo(-88, 5);
        ctx.lineTo(-80, 5);
        ctx.lineTo(-76, -15);
        ctx.lineTo(-58, -15);
        ctx.lineTo(-60, 5);
        ctx.lineTo(-26, 5);
        ctx.lineTo(-12, -26);
        ctx.lineTo(24, -26);
        ctx.lineTo(24, -31);
        ctx.lineTo(10, -31);
        ctx.lineTo(8, -26);
        ctx.lineTo(42, -5);
        ctx.lineTo(82, -5);
        ctx.lineTo(85, 12);
        ctx.lineTo(68, 12);
        ctx.arc(50, 12, 18, 0, Math.PI, true);
        ctx.lineTo(-22, 12);
        ctx.arc(-40, 12, 18, 0, Math.PI, true);
        ctx.closePath();
        const bodyGrad = ctx.createLinearGradient(0, -30, 0, 16);
        bodyGrad.addColorStop(0, "rgba(59, 130, 246, 0.05)");
        bodyGrad.addColorStop(1, "rgba(59, 130, 246, 0.15)");
        ctx.fillStyle = bodyGrad;
        ctx.fill();
        ctx.strokeStyle = "rgba(59, 130, 246, 0.8)";
        ctx.lineWidth = 1.25;
        ctx.stroke();
        ctx.strokeStyle = "rgba(122, 130, 140, 0.5)";
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.moveTo(0, -26);
        ctx.lineTo(0, -50);
        ctx.stroke();
        ctx.strokeStyle = "rgba(251, 184, 0, 0.5)";
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.moveTo(35, 12);
        ctx.lineTo(35, -4);
        ctx.stroke();
        ctx.fillStyle = "#FFB800";
        ctx.fillRect(33, -5, 4, 1.2);
        ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
        ctx.strokeStyle = "rgba(59, 130, 246, 0.85)";
        ctx.lineWidth = 0.75;
        ctx.fillRect(-82, -18, 20, 3);
        ctx.strokeRect(-82, -18, 20, 3);
        ctx.fillStyle = "rgba(59, 130, 246, 0.75)";
        ctx.fillRect(-83, -20, 0.75, 7);
        ctx.fillRect(-61, -20, 0.75, 7);
      } else {
        ctx.fillRect(-70, 12, 140, 3);
        ctx.strokeRect(-70, 12, 140, 3);
        ctx.fillStyle = "rgba(59, 130, 246, 0.03)";
        ctx.fillRect(-22, -2, 44, 14);
        ctx.strokeRect(-22, -2, 44, 14);
        ctx.beginPath();
        ctx.moveTo(-75, 12);
        ctx.lineTo(-73, 5);
        ctx.lineTo(-58, 5);
        ctx.lineTo(-52, 12);
        ctx.lineTo(-24, 7);
        ctx.lineTo(-14, -26);
        ctx.lineTo(-6, -26);
        ctx.lineTo(-6, -31);
        ctx.lineTo(6, -31);
        ctx.lineTo(6, -26);
        ctx.lineTo(14, -26);
        ctx.lineTo(24, 7);
        ctx.lineTo(52, 12);
        ctx.lineTo(58, 5);
        ctx.lineTo(73, 5);
        ctx.lineTo(75, 12);
        ctx.closePath();
        const bodyGrad = ctx.createLinearGradient(0, -28, 0, 12);
        bodyGrad.addColorStop(0, "rgba(59, 130, 246, 0.05)");
        bodyGrad.addColorStop(1, "rgba(59, 130, 246, 0.15)");
        ctx.fillStyle = bodyGrad;
        ctx.fill();
        ctx.strokeStyle = "rgba(59, 130, 246, 0.8)";
        ctx.lineWidth = 1.25;
        ctx.stroke();
        ctx.strokeStyle = "rgba(122, 130, 140, 0.5)";
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.moveTo(0, -26);
        ctx.lineTo(0, -50);
        ctx.stroke();
      }
    }
    ctx.restore();
    ctx.restore();
  }, [
    viewMode,
    overlayMode,
    loadedProfiles,
    profilesLoaded,
    activeClass,
    pitchVal,
    rollVal,
    steer,
    frDeflect,
    flDeflect,
    rrDeflect,
    rlDeflect,
  ]);
  const aiAdvice = `SUSPENSION & AERO WORKBENCH BRIEFING:
- Aerodynamic Platform: Rake dynamic angle: ${(pitchVal * 0.2).toFixed(3)} deg. Pitch stability is high under peak braking forces.
- High-Speed Compression: Rear dampers show peak speed of ${Math.max(rlDeflect, rrDeflect).toFixed(0)} mm/s. Front travel peaks at ${Math.max(flDeflect, frDeflect).toFixed(1)}% of total stroke.
- Tuning Recommendation: Add +1 click of front bump stiffness to suppress splitter grounding during threshold braking.`;
  return /* @__PURE__ */ jsx(TelemetryInstrument, {
    title: "Chassis Instrument",
    mode,
    activeStatus: "AERO STABLE",
    activeStatusColor: "text-[#3B82F6] border-[#3B82F6]/30 bg-[#3B82F6]/10",
    onAiAnalyze: () => {},
    aiAdvice,
    children: /* @__PURE__ */ jsx("div", {
      className: "p-3 h-full flex flex-col justify-between font-mono bg-[#05070A] text-white",
      children: /* @__PURE__ */ jsxs("div", {
        className: "grid grid-cols-12 gap-3 flex-1",
        children: [
          /* @__PURE__ */ jsxs("div", {
            className: "col-span-7 flex flex-col justify-between border-r border-[#1C2430]/60 pr-3",
            children: [
              /* @__PURE__ */ jsxs("div", {
                className:
                  "text-[10px] text-[#7A828C] border-b border-[#1C2430]/40 pb-1 uppercase font-bold tracking-wider flex justify-between items-center",
                children: [
                  /* @__PURE__ */ jsxs("div", {
                    className: "flex items-center gap-1.5",
                    children: [
                      /* @__PURE__ */ jsxs("div", {
                        className:
                          "flex gap-1 bg-[#0B0F14] border border-[#1C2430] rounded-sm overflow-hidden p-0.5 select-none",
                        children: [
                          /* @__PURE__ */ jsx("button", {
                            type: "button",
                            onClick: () => setViewMode("side"),
                            className: `px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-bold rounded-xs cursor-pointer ${viewMode === "side" ? "bg-[#3B82F6] text-white" : "text-[#7A828C] hover:text-[#E2E4E8]"}`,
                            children: "Side",
                          }),
                          /* @__PURE__ */ jsx("button", {
                            type: "button",
                            onClick: () => setViewMode("front"),
                            className: `px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-bold rounded-xs cursor-pointer ${viewMode === "front" ? "bg-[#3B82F6] text-white" : "text-[#7A828C] hover:text-[#E2E4E8]"}`,
                            children: "Front",
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className:
                          "flex gap-1 bg-[#0B0F14] border border-[#1C2430] rounded-sm overflow-hidden p-0.5 select-none",
                        children: [
                          /* @__PURE__ */ jsx("button", {
                            type: "button",
                            onClick: () => setOverlayMode("rotate-car"),
                            className: `px-1.5 py-0.5 text-[7px] uppercase tracking-wider font-bold rounded-xs cursor-pointer ${overlayMode === "rotate-car" ? "bg-[#8B5CF6] text-white" : "text-[#7A828C] hover:text-[#E2E4E8]"}`,
                            title: "Rotate car relative to fixed protractor",
                            children: "Rot Car",
                          }),
                          /* @__PURE__ */ jsx("button", {
                            type: "button",
                            onClick: () => setOverlayMode("rotate-dial"),
                            className: `px-1.5 py-0.5 text-[7px] uppercase tracking-wider font-bold rounded-xs cursor-pointer ${overlayMode === "rotate-dial" ? "bg-[#8B5CF6] text-white" : "text-[#7A828C] hover:text-[#E2E4E8]"}`,
                            title: "Rotate dial relative to static car",
                            children: "Rot Dial",
                          }),
                        ],
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "flex items-center gap-1.5 shrink-0",
                    children: [
                      /* @__PURE__ */ jsx("span", {
                        className:
                          "text-[7.5px] px-1 py-0.5 border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-xs font-bold leading-none select-none uppercase shrink-0",
                        children: profile.badge,
                      }),
                      /* @__PURE__ */ jsx("span", {
                        className: "text-[#3B82F6] tabular-nums font-bold",
                        children:
                          viewMode === "side"
                            ? `PITCH: ${pitchVal.toFixed(2)}°`
                            : `ROLL: ${rollVal.toFixed(2)}°`,
                      }),
                    ],
                  }),
                ],
              }),
              /* @__PURE__ */ jsx("div", {
                className: "flex-1 flex items-center justify-center py-2 w-full",
                children: /* @__PURE__ */ jsx("canvas", {
                  ref: canvasRef,
                  width: 380,
                  height: 175,
                  className:
                    "border border-[#1C2430] bg-[#0B0F14] rounded-sm w-full h-auto max-h-[175px]",
                }),
              }),
              /* @__PURE__ */ jsxs("div", {
                className: "grid grid-cols-2 gap-2 text-[9px] text-[#7A828C]",
                children: [
                  /* @__PURE__ */ jsxs("div", {
                    className:
                      "flex justify-between items-center bg-[#0B0F14] border border-[#1C2430]/60 px-1.5 py-0.5 rounded-sm",
                    children: [
                      /* @__PURE__ */ jsx("span", { children: "ROLL" }),
                      /* @__PURE__ */ jsxs("span", {
                        className: "text-white font-bold tabular-nums",
                        children: [rollVal.toFixed(2), "°"],
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className:
                      "flex justify-between items-center bg-[#0B0F14] border border-[#1C2430]/60 px-1.5 py-0.5 rounded-sm",
                    children: [
                      /* @__PURE__ */ jsx("span", { children: "HEAVE" }),
                      /* @__PURE__ */ jsxs("span", {
                        className: "text-[#00D17F] font-bold tabular-nums",
                        children: [(Math.max(0, -gLon) * 1.5).toFixed(1), "mm"],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          /* @__PURE__ */ jsxs("div", {
            className: "col-span-5 flex flex-col justify-between pl-1",
            children: [
              /* @__PURE__ */ jsx("div", {
                className:
                  "text-[10px] text-[#7A828C] border-b border-[#1C2430]/40 pb-1.5 uppercase font-bold tracking-wider",
                children: "Damper Stroke Deflection",
              }),
              /* @__PURE__ */ jsxs("div", {
                className: "flex-1 flex flex-col justify-center gap-2.5 my-2",
                children: [
                  /* @__PURE__ */ jsxs("div", {
                    className: "space-y-1",
                    children: [
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex justify-between text-[8px] text-[#7A828C]",
                        children: [
                          /* @__PURE__ */ jsx("span", { children: "FRONT INST TRAVEL (FL/FR)" }),
                          /* @__PURE__ */ jsxs("span", {
                            className: "text-white tabular-nums font-bold",
                            children: [flDeflect.toFixed(0), "% / ", frDeflect.toFixed(0), "%"],
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex gap-2",
                        children: [
                          /* @__PURE__ */ jsx("div", {
                            className:
                              "flex-1 bg-[#0B0F14] h-2 rounded-xs border border-[#1C2430] overflow-hidden",
                            children: /* @__PURE__ */ jsx("div", {
                              className: "h-full bg-[#3B82F6]",
                              style: { width: `${flDeflect}%` },
                            }),
                          }),
                          /* @__PURE__ */ jsx("div", {
                            className:
                              "flex-1 bg-[#0B0F14] h-2 rounded-xs border border-[#1C2430] overflow-hidden",
                            children: /* @__PURE__ */ jsx("div", {
                              className: "h-full bg-[#3B82F6]",
                              style: { width: `${frDeflect}%` },
                            }),
                          }),
                        ],
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "space-y-1",
                    children: [
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex justify-between text-[8px] text-[#7A828C]",
                        children: [
                          /* @__PURE__ */ jsx("span", { children: "REAR INST TRAVEL (RL/RR)" }),
                          /* @__PURE__ */ jsxs("span", {
                            className: "text-white tabular-nums font-bold",
                            children: [rlDeflect.toFixed(0), "% / ", rrDeflect.toFixed(0), "%"],
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex gap-2",
                        children: [
                          /* @__PURE__ */ jsx("div", {
                            className:
                              "flex-1 bg-[#0B0F14] h-2 rounded-xs border border-[#1C2430] overflow-hidden",
                            children: /* @__PURE__ */ jsx("div", {
                              className: "h-full bg-[#8B5CF6]",
                              style: { width: `${rlDeflect}%` },
                            }),
                          }),
                          /* @__PURE__ */ jsx("div", {
                            className:
                              "flex-1 bg-[#0B0F14] h-2 rounded-xs border border-[#1C2430] overflow-hidden",
                            children: /* @__PURE__ */ jsx("div", {
                              className: "h-full bg-[#8B5CF6]",
                              style: { width: `${rrDeflect}%` },
                            }),
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              /* @__PURE__ */ jsxs("div", {
                className: "grid grid-cols-2 gap-1.5 text-[8px] text-[#7A828C]",
                children: [
                  /* @__PURE__ */ jsxs("div", {
                    className:
                      "flex justify-between bg-[#0B0F14] border border-[#1C2430] px-1.5 py-0.5 rounded-sm",
                    children: [
                      /* @__PURE__ */ jsx("span", { children: "F BUMP CLICKS" }),
                      /* @__PURE__ */ jsx("span", {
                        className: "text-[#FFB800] font-black",
                        children: "+14 C",
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className:
                      "flex justify-between bg-[#0B0F14] border border-[#1C2430] px-1.5 py-0.5 rounded-sm",
                    children: [
                      /* @__PURE__ */ jsx("span", { children: "R REBOUND CLICKS" }),
                      /* @__PURE__ */ jsx("span", {
                        className: "text-[#8B5CF6] font-black",
                        children: "+18 C",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    }),
  });
}
function TireInstrument({ telemetry: propTelemetry, mode = "live" }) {
  const liveTelemetry = useTelemetry();
  const t = propTelemetry || liveTelemetry;
  const flTemp = t.tires?.fl?.tempC ?? 82;
  const frTemp = t.tires?.fr?.tempC ?? 94;
  const rlTemp = t.tires?.rl?.tempC ?? 84;
  const rrTemp = t.tires?.rr?.tempC ?? 88;
  const flPress = t.tires?.fl?.pressureBar ?? 1.84;
  const frPress = t.tires?.fr?.pressureBar ?? 1.92;
  const rlPress = t.tires?.rl?.pressureBar ?? 1.88;
  const rrPress = t.tires?.rr?.pressureBar ?? 1.9;
  const flWear = t.tires?.fl?.wearPct ?? 98;
  const frWear = t.tires?.fr?.wearPct ?? 94;
  const rlWear = t.tires?.rl?.wearPct ?? 97;
  const rrWear = t.tires?.rr?.wearPct ?? 96;
  const gLat = t.gLat ?? 0;
  const gLon = t.gLon ?? 0;
  const ggCanvasRef = useRef(null);
  const getThermalBg = (temp) => {
    if (temp < 70) return "bg-blue-950/40 border-blue-500 text-[#3B82F6]";
    if (temp > 95) return "bg-red-950/40 border-red-500 text-[#FF4D4D]";
    return "bg-emerald-950/20 border-emerald-500 text-[#00D17F]";
  };
  const getThermalLabel = (temp) => {
    if (temp < 70) return "COLD";
    if (temp > 95) return "OVERHEAT";
    return "OPTIMAL";
  };
  useEffect(() => {
    const canvas = ggCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2;
    const scale = (w / 2 - 8) / 3;
    ctx.strokeStyle = "#1C2430";
    ctx.lineWidth = 0.5;
    for (let r = 1; r <= 3; r++) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(cx, 2);
    ctx.lineTo(cx, h - 2);
    ctx.moveTo(2, cy);
    ctx.lineTo(w - 2, cy);
    ctx.stroke();
    const px = cx + gLat * scale;
    const py = cy - gLon * scale;
    ctx.fillStyle = "#00D17F";
    ctx.shadowBlur = 4;
    ctx.shadowColor = "#00D17F";
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [gLat, gLon]);
  const aiAdvice = `THERMAL TIRE CRITERIA BRIEFING (LAP ${t.connected ? "LATEST" : "REF"}):
- Tyre Deflection Delta: FR tire experiencing heavy load saturation at Turn 10, thermal growth reaches ${frTemp.toFixed(1)}°C.
- Pressure Growth: LF: ${(flPress - 1.6).toFixed(2)} bar growth, RR: ${(rrPress - 1.6).toFixed(2)} bar growth. Cold targets look properly optimized.
- Recommendations: Adjust front-right camber -0.2° to distribute load more evenly and flatten outer-edge temperature growth peaks.`;
  return /* @__PURE__ */ jsx(TelemetryInstrument, {
    title: "Tire Instrument",
    mode,
    activeStatus: frTemp > 95 ? "THERMAL OVERHEAT" : "THERMAL OPTIMAL",
    activeStatusColor:
      frTemp > 95
        ? "text-[#FF4D4D] border-[#FF4D4D]/40 bg-[#FF4D4D]/10"
        : "text-[#00D17F] border-[#00D17F]/30 bg-[#00D17F]/10",
    onAiAnalyze: () => {},
    aiAdvice,
    children: /* @__PURE__ */ jsx("div", {
      className: "p-3 h-full flex flex-col justify-between font-mono bg-[#05070A] text-white",
      children: /* @__PURE__ */ jsxs("div", {
        className: "grid grid-cols-12 gap-3 flex-1",
        children: [
          /* @__PURE__ */ jsxs("div", {
            className: "col-span-8 flex flex-col justify-between border-r border-[#1C2430]/60 pr-3",
            children: [
              /* @__PURE__ */ jsx("div", {
                className:
                  "text-[10px] text-[#7A828C] border-b border-[#1C2430]/40 pb-1.5 uppercase font-bold tracking-wider",
                children: "Carcass Thermals & Pressures",
              }),
              /* @__PURE__ */ jsxs("div", {
                className: "grid grid-cols-2 gap-2 flex-1 my-2",
                children: [
                  /* @__PURE__ */ jsxs("div", {
                    className: `p-1.5 border rounded-sm ${getThermalBg(flTemp)} flex flex-col justify-between`,
                    children: [
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex justify-between text-[7px] font-black",
                        children: [
                          /* @__PURE__ */ jsx("span", { children: "FL TIRE" }),
                          /* @__PURE__ */ jsx("span", { children: getThermalLabel(flTemp) }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className: "text-sm font-black tracking-tight text-white tabular-nums",
                        children: [flTemp.toFixed(0), "°C"],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex justify-between text-[8px] text-[#7A828C]",
                        children: [
                          /* @__PURE__ */ jsxs("span", {
                            className: "text-white font-bold",
                            children: [flPress.toFixed(2), " Bar"],
                          }),
                          /* @__PURE__ */ jsxs("span", { children: [flWear, "% LIFE"] }),
                        ],
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: `p-1.5 border rounded-sm ${getThermalBg(frTemp)} flex flex-col justify-between`,
                    children: [
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex justify-between text-[7px] font-black",
                        children: [
                          /* @__PURE__ */ jsx("span", { children: "FR TIRE" }),
                          /* @__PURE__ */ jsx("span", { children: getThermalLabel(frTemp) }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className: "text-sm font-black tracking-tight text-white tabular-nums",
                        children: [frTemp.toFixed(0), "°C"],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex justify-between text-[8px] text-[#7A828C]",
                        children: [
                          /* @__PURE__ */ jsxs("span", {
                            className: "text-white font-bold",
                            children: [frPress.toFixed(2), " Bar"],
                          }),
                          /* @__PURE__ */ jsxs("span", { children: [frWear, "% LIFE"] }),
                        ],
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: `p-1.5 border rounded-sm ${getThermalBg(rlTemp)} flex flex-col justify-between`,
                    children: [
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex justify-between text-[7px] font-black",
                        children: [
                          /* @__PURE__ */ jsx("span", { children: "RL TIRE" }),
                          /* @__PURE__ */ jsx("span", { children: getThermalLabel(rlTemp) }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className: "text-sm font-black tracking-tight text-white tabular-nums",
                        children: [rlTemp.toFixed(0), "°C"],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex justify-between text-[8px] text-[#7A828C]",
                        children: [
                          /* @__PURE__ */ jsxs("span", {
                            className: "text-white font-bold",
                            children: [rlPress.toFixed(2), " Bar"],
                          }),
                          /* @__PURE__ */ jsxs("span", { children: [rlWear, "% LIFE"] }),
                        ],
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: `p-1.5 border rounded-sm ${getThermalBg(rrTemp)} flex flex-col justify-between`,
                    children: [
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex justify-between text-[7px] font-black",
                        children: [
                          /* @__PURE__ */ jsx("span", { children: "RR TIRE" }),
                          /* @__PURE__ */ jsx("span", { children: getThermalLabel(rrTemp) }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className: "text-sm font-black tracking-tight text-white tabular-nums",
                        children: [rrTemp.toFixed(0), "°C"],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex justify-between text-[8px] text-[#7A828C]",
                        children: [
                          /* @__PURE__ */ jsxs("span", {
                            className: "text-white font-bold",
                            children: [rrPress.toFixed(2), " Bar"],
                          }),
                          /* @__PURE__ */ jsxs("span", { children: [rrWear, "% LIFE"] }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          /* @__PURE__ */ jsxs("div", {
            className: "col-span-4 flex flex-col justify-between pl-1",
            children: [
              /* @__PURE__ */ jsx("div", {
                className:
                  "text-[10px] text-[#7A828C] border-b border-[#1C2430]/40 pb-1.5 uppercase font-bold tracking-wider text-center",
                children: "G-G Grip Circle",
              }),
              /* @__PURE__ */ jsx("div", {
                className: "flex-1 flex items-center justify-center my-2",
                children: /* @__PURE__ */ jsx("canvas", {
                  ref: ggCanvasRef,
                  width: 80,
                  height: 80,
                  className: "bg-[#0B0F14] border border-[#1C2430] rounded-full",
                }),
              }),
              /* @__PURE__ */ jsxs("div", {
                className:
                  "text-center bg-[#0B0F14] border border-[#1C2430] py-1 rounded-sm text-[8px] text-[#7A828C]",
                children: [
                  /* @__PURE__ */ jsx("span", { children: "PEAK G: " }),
                  /* @__PURE__ */ jsxs("span", {
                    className: "text-white font-black tabular-nums",
                    children: [Math.sqrt(gLat * gLat + gLon * gLon).toFixed(2), "G"],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    }),
  });
}
function DriverInputsInstrument({ telemetry: propTelemetry, mode = "live" }) {
  const liveTelemetry = useTelemetry();
  const t = propTelemetry || liveTelemetry;
  const throttle = t.throttle ?? 0;
  const brake = t.brake ?? 0;
  const clutch = t.clutch ?? 0;
  const steer = t.steeringDeg ?? 0;
  const [smoothnessScore, setSmoothnessScore] = useState(94);
  const [prevSteer, setPrevSteer] = useState(0);
  useEffect(() => {
    const delta = Math.abs(steer - prevSteer);
    setPrevSteer(steer);
    if (delta > 3) {
      setSmoothnessScore((prev) => Math.max(68, Math.min(99, prev - 1.5)));
    } else {
      setSmoothnessScore((prev) => Math.min(98.5, prev + 0.1));
    }
  }, [steer]);
  const aiAdvice = `DRIVER INPUTS & SMOOTHNESS ANALYSIS:
- Throttle Application: Initial throttle pickup is smooth, but full load application is 15% too rapid on exit of Turn 4, triggering brief traction control engagement.
- Brake Release Profile: Brake trail release curve is excellent. Steering micro-corrections are kept low, yielding a high Smoothness rating of ${smoothnessScore.toFixed(0)}%.
- Strategic Coaching: Try to slow down hands under initial corner rotation to carry more mid-corner entry momentum.`;
  return /* @__PURE__ */ jsx(TelemetryInstrument, {
    title: "Driver Inputs Instrument",
    mode,
    activeStatus: smoothnessScore > 85 ? "INPUTSMOOTH" : "AGRESSIVEINPUT",
    activeStatusColor:
      smoothnessScore > 85
        ? "text-[#00D17F] border-[#00D17F]/30 bg-[#00D17F]/10"
        : "text-[#FFB800] border-[#FFB800]/30 bg-[#FFB800]/10",
    onAiAnalyze: () => {},
    aiAdvice,
    children: /* @__PURE__ */ jsx("div", {
      className: "p-3 h-full flex flex-col justify-between font-mono bg-[#05070A] text-white",
      children: /* @__PURE__ */ jsxs("div", {
        className: "grid grid-cols-12 gap-4 flex-1",
        children: [
          /* @__PURE__ */ jsxs("div", {
            className: "col-span-7 flex flex-col justify-between border-r border-[#1C2430]/60 pr-3",
            children: [
              /* @__PURE__ */ jsx("div", {
                className:
                  "text-[10px] text-[#7A828C] border-b border-[#1C2430]/40 pb-1.5 uppercase font-bold tracking-wider mb-2",
                children: "Linear Pedal Command Stack",
              }),
              /* @__PURE__ */ jsxs("div", {
                className: "flex-1 flex flex-col justify-center gap-2",
                children: [
                  /* @__PURE__ */ jsxs("div", {
                    className: "space-y-1",
                    children: [
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex justify-between text-[8px] text-[#7A828C]",
                        children: [
                          /* @__PURE__ */ jsx("span", { children: "THROTTLE INPUT" }),
                          /* @__PURE__ */ jsxs("span", {
                            className: "text-[#00D17F] font-bold tabular-nums",
                            children: [(throttle * 100).toFixed(0), "%"],
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsx("div", {
                        className:
                          "w-full bg-[#0B0F14] h-2.5 rounded-xs border border-[#1C2430] overflow-hidden",
                        children: /* @__PURE__ */ jsx("div", {
                          className:
                            "h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-75",
                          style: { width: `${throttle * 100}%` },
                        }),
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "space-y-1",
                    children: [
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex justify-between text-[8px] text-[#7A828C]",
                        children: [
                          /* @__PURE__ */ jsx("span", { children: "BRAKE INPUT" }),
                          /* @__PURE__ */ jsxs("span", {
                            className: "text-[#FF4D4D] font-bold tabular-nums",
                            children: [(brake * 100).toFixed(0), "%"],
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsx("div", {
                        className:
                          "w-full bg-[#0B0F14] h-2.5 rounded-xs border border-[#1C2430] overflow-hidden",
                        children: /* @__PURE__ */ jsx("div", {
                          className:
                            "h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-75",
                          style: { width: `${brake * 100}%` },
                        }),
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "space-y-1",
                    children: [
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex justify-between text-[8px] text-[#7A828C]",
                        children: [
                          /* @__PURE__ */ jsx("span", { children: "CLUTCH INPUT" }),
                          /* @__PURE__ */ jsxs("span", {
                            className: "text-[#3B82F6] font-bold tabular-nums",
                            children: [(clutch * 100).toFixed(0), "%"],
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsx("div", {
                        className:
                          "w-full bg-[#0B0F14] h-2 rounded-xs border border-[#1C2430] overflow-hidden",
                        children: /* @__PURE__ */ jsx("div", {
                          className: "h-full bg-blue-500 transition-all duration-75",
                          style: { width: `${clutch * 100}%` },
                        }),
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          /* @__PURE__ */ jsxs("div", {
            className: "col-span-5 flex flex-col justify-between pl-1",
            children: [
              /* @__PURE__ */ jsx("div", {
                className:
                  "text-[10px] text-[#7A828C] border-b border-[#1C2430]/40 pb-1.5 uppercase font-bold tracking-wider",
                children: "Steering & Smoothness",
              }),
              /* @__PURE__ */ jsx("div", {
                className: "flex-1 flex flex-col items-center justify-center my-1.5",
                children: /* @__PURE__ */ jsxs("div", {
                  className:
                    "relative h-12 w-12 border-2 border-dashed border-[#1C2430] rounded-full flex items-center justify-center",
                  children: [
                    /* @__PURE__ */ jsx("div", {
                      className:
                        "absolute h-10 w-1 border-t-4 border-b-4 border-[#FFB800] rounded transition-transform duration-75",
                      style: { transform: `rotate(${steer}deg)` },
                    }),
                    /* @__PURE__ */ jsxs("span", {
                      className:
                        "absolute -bottom-4 text-[7px] text-[#FFB800] bg-[#05070A] border border-[#1C2430]/80 px-1 rounded tabular-nums font-bold",
                      children: [steer.toFixed(0), "°"],
                    }),
                  ],
                }),
              }),
              /* @__PURE__ */ jsxs("div", {
                className:
                  "mt-1 pt-1.5 border-t border-[#1C2430]/40 flex justify-between items-center text-[9px] text-[#7A828C]",
                children: [
                  /* @__PURE__ */ jsx("span", { children: "SMOOTHNESS" }),
                  /* @__PURE__ */ jsxs("span", {
                    className: "text-[#00D17F] font-bold tabular-nums flex items-center gap-0.5",
                    children: [
                      /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3" }),
                      smoothnessScore.toFixed(0),
                      "%",
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    }),
  });
}
const TELEMETRY_INSTRUMENTS = {
  brakes: BrakeInstrument,
  ers: ERSInstrument,
  chassis: ChassisInstrument,
  tires: TireInstrument,
  inputs: DriverInputsInstrument,
};
const WORKSPACE_PRESETS = {
  gt3: {
    name: "GT3 Race Engineer",
    description:
      "Focuses on brake balance targets, tire thermal wear growth, and critical strategic command modules.",
    instruments: ["brakes", "tires", "inputs"],
  },
  gtp: {
    name: "GTP Hybrid Command",
    description:
      "Focuses on ERS Purple battery cells, kinetic deployment mapping, and mechanical suspension stability.",
    instruments: ["ers", "brakes", "chassis"],
  },
  coach: {
    name: "Driver Coach Workstation",
    description:
      "Prioritizes pedal linear traces, micro-steer dial tracking, and lateral G-G circle slip limits.",
    instruments: ["inputs", "tires", "chassis"],
  },
  aero: {
    name: "Aero Platform Engineer",
    description:
      "Aero compression histograms, dynamic chassis pitching, and recovery harvest curves.",
    instruments: ["chassis", "tires", "ers"],
  },
};
export {
  TELEMETRY_INSTRUMENTS as T,
  WORKSPACE_PRESETS as W,
  broadcastTelemetryFrame as b,
  useTelemetryRuntimeStore as u,
};
