import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { u as useTelemetryRuntimeStore, T as TELEMETRY_INSTRUMENTS } from "./registry-CA38QAmy.js";
import { c as Route, K as useTelemetry } from "./router-D8VllJ-f.js";
import { Sliders, Wifi, Clock, Zap, Flame, Compass } from "lucide-react";
import "zustand";
import "sonner";
import "@tanstack/react-query";
import "@tanstack/react-router";
import "./charts-IpNGhCyp.js";
import "@supabase/supabase-js";
import "../server.js";
import "seroval";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "zustand/middleware";
import "zod";
import "./auth-middleware-Cz-8T2yV.js";
import "./schema-BU1MXGgz.js";
import "@radix-ui/react-dialog";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-tabs";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./client.server-Y-0AANJ4.js";
function DetachedInstrumentPage() {
  const { instrument } = Route.useParams();
  const liveTelemetry = useTelemetry();
  const [mode, setMode] = useState("replay");
  const cursorTick = useTelemetryRuntimeStore((s) => s.cursorTick);
  const focusMode = useTelemetryRuntimeStore((s) => s.focusMode);
  const detachedTelemetryFrame = useTelemetryRuntimeStore((s) => s.detachedTelemetryFrame);
  useEffect(() => {
    if (liveTelemetry && liveTelemetry.connected) {
      setMode("live");
    } else {
      setMode("replay");
    }
  }, [liveTelemetry?.connected]);
  const t = mode === "live" ? liveTelemetry : detachedTelemetryFrame;
  if (instrument === "timing")
    return /* @__PURE__ */ jsx(TimingMonitorScreen, { t, mode, cursorTick });
  if (instrument === "hybrid")
    return /* @__PURE__ */ jsx(HybridMonitorScreen, { t, mode, cursorTick });
  if (instrument === "tires") return /* @__PURE__ */ jsx(TireWallScreen, { t, mode, cursorTick });
  if (instrument === "strategy")
    return /* @__PURE__ */ jsx(StrategyScreen, { t, mode, cursorTick });
  const instrumentKey = instrument;
  const InstrumentComponent = TELEMETRY_INSTRUMENTS[instrumentKey];
  if (!InstrumentComponent) {
    return /* @__PURE__ */ jsxs("div", {
      className:
        "h-screen w-screen flex flex-col items-center justify-center bg-[#05070A] font-mono text-[10px] text-[#FF4D4D] p-6 border border-[#FF4D4D]/20",
      children: [
        /* @__PURE__ */ jsx(Sliders, { className: "h-6 w-6 mb-2 animate-bounce" }),
        /* @__PURE__ */ jsx("span", {
          className: "font-bold tracking-widest uppercase",
          children: "INVALID MONITOR IDENTIFIER",
        }),
        /* @__PURE__ */ jsxs("span", {
          className: "text-[#7A828C] mt-1 text-[8px]",
          children: ['ID: "', instrument, '" NOT REGISTERED IN WORKSTATION CORE.'],
        }),
      ],
    });
  }
  return /* @__PURE__ */ jsxs("div", {
    className: `h-screen w-screen bg-[#05070A] p-2 flex flex-col overflow-hidden select-none workspace-focus-${focusMode}`,
    children: [
      /* @__PURE__ */ jsxs("div", {
        className:
          "px-3 py-1.5 border border-[#1C2430] bg-[#11161D] rounded-sm flex items-center justify-between text-[8px] font-mono text-[#7A828C] mb-1.5 uppercase tracking-wider shrink-0 select-none",
        children: [
          /* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-1.5 font-bold",
            children: [
              /* @__PURE__ */ jsx("span", { className: "size-1 rounded-full bg-[#3B82F6]" }),
              /* @__PURE__ */ jsx("span", { className: "text-white", children: "DETACHED ARRAY" }),
              /* @__PURE__ */ jsx("span", { children: "·" }),
              /* @__PURE__ */ jsxs("span", {
                children: [
                  "INSTRUMENT: ",
                  /* @__PURE__ */ jsx("span", {
                    className: "text-[#3B82F6]",
                    children: instrument,
                  }),
                ],
              }),
            ],
          }),
          /* @__PURE__ */ jsx("div", {
            className: "flex items-center gap-3",
            children:
              mode === "live"
                ? /* @__PURE__ */ jsxs("div", {
                    className: "flex items-center gap-1 text-[#00D17F] font-black",
                    children: [
                      /* @__PURE__ */ jsx(Wifi, { className: "h-3 w-3 animate-pulse" }),
                      " LIVE STREAM",
                    ],
                  })
                : /* @__PURE__ */ jsxs("div", {
                    className: "flex items-center gap-1 text-[#FFB800] font-black",
                    children: [
                      /* @__PURE__ */ jsx(Sliders, { className: "h-3 w-3" }),
                      " REPLAY TICK: ",
                      /* @__PURE__ */ jsx("span", {
                        className: "text-white tabular-nums",
                        children: cursorTick,
                      }),
                    ],
                  }),
          }),
        ],
      }),
      /* @__PURE__ */ jsx("div", {
        className: "flex-1 min-h-0 border border-[#1C2430] bg-[#0B0F14] rounded-sm overflow-hidden",
        children: t
          ? /* @__PURE__ */ jsx(InstrumentComponent, {
              telemetry: t,
              mode: mode === "live" ? "live" : "replay",
            })
          : /* @__PURE__ */ jsx(AwaitingSyncPlaceholder, { cursorTick }),
      }),
    ],
  });
}
function TimingMonitorScreen({ t, mode, cursorTick }) {
  return /* @__PURE__ */ jsxs("div", {
    className:
      "h-screen w-screen bg-[#05070A] p-3 flex flex-col font-mono text-[9px] text-[#7A828C] select-none",
    children: [
      /* @__PURE__ */ jsxs("div", {
        className:
          "px-3 py-2 border border-[#1C2430] bg-[#11161D] rounded-sm flex items-center justify-between shrink-0 mb-3 select-none",
        children: [
          /* @__PURE__ */ jsxs("span", {
            className: "font-bold text-white tracking-widest uppercase flex items-center gap-1.5",
            children: [
              /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5 text-[#3B82F6]" }),
              " TIMING & LAP MONITOR",
            ],
          }),
          /* @__PURE__ */ jsx("span", {
            className: "text-white font-bold uppercase shrink-0",
            children: "PIT WALL COMMAND ENGINE",
          }),
        ],
      }),
      /* @__PURE__ */ jsxs("div", {
        className: "flex-1 min-h-0 grid grid-cols-3 gap-3",
        children: [
          /* @__PURE__ */ jsxs("div", {
            className:
              "col-span-2 border border-[#1C2430] bg-[#0B0F14] p-3 rounded-sm flex flex-col overflow-hidden",
            children: [
              /* @__PURE__ */ jsx("span", {
                className:
                  "text-[10px] text-white font-bold border-b border-[#1C2430] pb-1.5 uppercase mb-2",
                children: "STINT SECTOR MATRIX",
              }),
              /* @__PURE__ */ jsxs("div", {
                className: "flex-1 overflow-y-auto space-y-1",
                children: [
                  /* @__PURE__ */ jsxs("div", {
                    className:
                      "grid grid-cols-5 text-[#7A828C] font-bold border-b border-[#1C2430]/60 pb-1 uppercase text-[8px]",
                    children: [
                      /* @__PURE__ */ jsx("span", { children: "LAP" }),
                      /* @__PURE__ */ jsx("span", { children: "SECTOR 1" }),
                      /* @__PURE__ */ jsx("span", { children: "SECTOR 2" }),
                      /* @__PURE__ */ jsx("span", { children: "SECTOR 3" }),
                      /* @__PURE__ */ jsx("span", { children: "LAP TIME" }),
                    ],
                  }),
                  [
                    {
                      lap: 1,
                      s1: "24.120",
                      s2: "32.188",
                      s3: "28.944",
                      time: "1:25.252",
                      diff: "+0.142",
                    },
                    {
                      lap: 2,
                      s1: "23.955",
                      s2: "32.012",
                      s3: "28.720",
                      time: "1:24.687",
                      diff: "-0.423",
                    },
                    {
                      lap: 3,
                      s1: "23.840",
                      s2: "31.954",
                      s3: "28.611",
                      time: "1:24.405",
                      diff: "-0.282",
                    },
                    {
                      lap: 4,
                      s1: "23.910",
                      s2: "32.088",
                      s3: "28.752",
                      time: "1:24.750",
                      diff: "+0.345",
                    },
                  ].map((r) =>
                    /* @__PURE__ */ jsxs(
                      "div",
                      {
                        className:
                          "grid grid-cols-5 border-b border-[#1C2430]/20 py-1 tabular-nums text-white",
                        children: [
                          /* @__PURE__ */ jsxs("span", {
                            className: "font-bold text-[#7A828C]",
                            children: ["L", r.lap],
                          }),
                          /* @__PURE__ */ jsxs("span", { children: [r.s1, "s"] }),
                          /* @__PURE__ */ jsxs("span", { children: [r.s2, "s"] }),
                          /* @__PURE__ */ jsxs("span", { children: [r.s3, "s"] }),
                          /* @__PURE__ */ jsx("span", {
                            className: "font-black text-[#00D17F]",
                            children: r.time,
                          }),
                        ],
                      },
                      r.lap,
                    ),
                  ),
                ],
              }),
            ],
          }),
          /* @__PURE__ */ jsxs("div", {
            className:
              "border border-[#1C2430] bg-[#0B0F14] p-3 rounded-sm flex flex-col justify-between",
            children: [
              /* @__PURE__ */ jsxs("div", {
                children: [
                  /* @__PURE__ */ jsx("span", {
                    className:
                      "text-[10px] text-white font-bold border-b border-[#1C2430] pb-1.5 uppercase mb-3 block",
                    children: "STINT PROJECTIONS",
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "space-y-3",
                    children: [
                      /* @__PURE__ */ jsxs("div", {
                        className:
                          "flex justify-between items-center bg-[#05070A] p-2 border border-[#1C2430]/60 rounded-xs",
                        children: [
                          /* @__PURE__ */ jsx("span", { children: "ESTIMATED FUEL BURN" }),
                          /* @__PURE__ */ jsx("span", {
                            className: "text-white font-bold text-sm",
                            children: "3.42 L / LAP",
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className:
                          "flex justify-between items-center bg-[#05070A] p-2 border border-[#1C2430]/60 rounded-xs",
                        children: [
                          /* @__PURE__ */ jsx("span", { children: "REMAINING FUEL CAPACITY" }),
                          /* @__PURE__ */ jsxs("span", {
                            className: "text-[#FFB800] font-black text-sm",
                            children: [
                              t?.fuelRemainingL ? t.fuelRemainingL.toFixed(1) : "38.5",
                              " L",
                            ],
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className:
                          "flex justify-between items-center bg-[#05070A] p-2 border border-[#1C2430]/60 rounded-xs",
                        children: [
                          /* @__PURE__ */ jsx("span", { children: "THEORETICAL LAPS TO PIT" }),
                          /* @__PURE__ */ jsx("span", {
                            className: "text-[#00D17F] font-black text-sm",
                            children: "11 Laps",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              /* @__PURE__ */ jsxs("div", {
                className: "border-t border-[#1C2430] pt-2 mt-2",
                children: [
                  /* @__PURE__ */ jsx("span", {
                    className: "text-[8px] text-[#7A828C] block uppercase font-bold mb-1",
                    children: "active coordinate playhead",
                  }),
                  /* @__PURE__ */ jsxs("span", {
                    className: "text-white text-xs font-black tabular-nums",
                    children: [cursorTick, " ticks"],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function HybridMonitorScreen({ t, mode, cursorTick }) {
  const soc = t?.extras?.ersSoc ?? 75;
  const deploy = t?.extras?.mgukDeployKw ?? 0;
  const regen = t?.extras?.mgukRegenKw ?? 0;
  return /* @__PURE__ */ jsxs("div", {
    className:
      "h-screen w-screen bg-[#05070A] p-3 flex flex-col font-mono text-[9px] text-[#7A828C] select-none",
    children: [
      /* @__PURE__ */ jsxs("div", {
        className:
          "px-3 py-2 border border-[#1C2430] bg-[#11161D] rounded-sm flex items-center justify-between shrink-0 mb-3 select-none",
        children: [
          /* @__PURE__ */ jsxs("span", {
            className: "font-bold text-white tracking-widest uppercase flex items-center gap-1.5",
            children: [
              /* @__PURE__ */ jsx(Zap, { className: "h-3.5 w-3.5 text-[#8B5CF6]" }),
              " HYBRID ENERGY MONITOR",
            ],
          }),
          /* @__PURE__ */ jsx("span", {
            className: "text-white font-bold uppercase shrink-0",
            children: "PIT WALL HYBRID SYS",
          }),
        ],
      }),
      /* @__PURE__ */ jsxs("div", {
        className: "flex-1 min-h-0 grid grid-cols-2 gap-3",
        children: [
          /* @__PURE__ */ jsxs("div", {
            className:
              "border border-[#1C2430] bg-[#0B0F14] p-4 rounded-sm flex flex-col justify-between",
            children: [
              /* @__PURE__ */ jsxs("div", {
                children: [
                  /* @__PURE__ */ jsx("span", {
                    className:
                      "text-[10px] text-white font-bold border-b border-[#1C2430] pb-1.5 uppercase mb-3 block",
                    children: "STATE-OF-CHARGE (SoC)",
                  }),
                  /* @__PURE__ */ jsx("div", {
                    className:
                      "grid grid-cols-16 gap-1 bg-[#05070A] p-3 rounded-sm border border-[#1C2430] mb-4",
                    children: Array.from({
                      length: 16,
                    }).map((_, i) => {
                      const filled = (i / 16) * 100 < soc;
                      return /* @__PURE__ */ jsx(
                        "div",
                        {
                          className: `h-12 rounded-xs border transition-all duration-300 ${filled ? "bg-[#8B5CF6] border-[#8B5CF6]/40 shadow-[0_0_8px_rgba(139,92,246,0.3)]" : "bg-[#0B0F14] border-[#1C2430]"}`,
                        },
                        i,
                      );
                    }),
                  }),
                ],
              }),
              /* @__PURE__ */ jsxs("div", {
                className: "flex justify-between items-end",
                children: [
                  /* @__PURE__ */ jsxs("div", {
                    children: [
                      /* @__PURE__ */ jsx("span", {
                        className: "text-[8px] text-[#7A828C] block uppercase font-bold",
                        children: "ers battery capacity",
                      }),
                      /* @__PURE__ */ jsxs("span", {
                        className: "text-white text-xl font-black tabular-nums",
                        children: [soc.toFixed(1), "%"],
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsx("span", {
                    className:
                      "text-[8px] text-[#8B5CF6] border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-2 py-0.5 rounded font-black tracking-widest uppercase",
                    children: "mgu-k active",
                  }),
                ],
              }),
            ],
          }),
          /* @__PURE__ */ jsxs("div", {
            className:
              "border border-[#1C2430] bg-[#0B0F14] p-4 rounded-sm flex flex-col justify-between",
            children: [
              /* @__PURE__ */ jsxs("div", {
                children: [
                  /* @__PURE__ */ jsx("span", {
                    className:
                      "text-[10px] text-white font-bold border-b border-[#1C2430] pb-1.5 uppercase mb-3 block",
                    children: "ENERGY BALANCE FLUX",
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "space-y-4",
                    children: [
                      /* @__PURE__ */ jsxs("div", {
                        children: [
                          /* @__PURE__ */ jsxs("div", {
                            className:
                              "flex justify-between items-center text-[8px] font-bold text-[#7A828C] mb-1",
                            children: [
                              /* @__PURE__ */ jsx("span", { children: "MGU-K KINETIC DISCHARGE" }),
                              /* @__PURE__ */ jsxs("span", {
                                className: "text-white tabular-nums",
                                children: [deploy.toFixed(0), " kW"],
                              }),
                            ],
                          }),
                          /* @__PURE__ */ jsx("div", {
                            className: "h-6 bg-[#05070A] border border-[#1C2430] rounded-sm p-1",
                            children: /* @__PURE__ */ jsx("div", {
                              className:
                                "h-full rounded-xs bg-[#8B5CF6] transition-all duration-100",
                              style: {
                                width: `${Math.min(100, (deploy / 120) * 100)}%`,
                              },
                            }),
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        children: [
                          /* @__PURE__ */ jsxs("div", {
                            className:
                              "flex justify-between items-center text-[8px] font-bold text-[#7A828C] mb-1",
                            children: [
                              /* @__PURE__ */ jsx("span", { children: "MGU-K KINETIC HARVEST" }),
                              /* @__PURE__ */ jsxs("span", {
                                className: "text-white tabular-nums",
                                children: [regen.toFixed(0), " kW"],
                              }),
                            ],
                          }),
                          /* @__PURE__ */ jsx("div", {
                            className: "h-6 bg-[#05070A] border border-[#1C2430] rounded-sm p-1",
                            children: /* @__PURE__ */ jsx("div", {
                              className:
                                "h-full rounded-xs bg-[#00D17F] transition-all duration-100",
                              style: {
                                width: `${Math.min(100, (regen / 200) * 100)}%`,
                              },
                            }),
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              /* @__PURE__ */ jsxs("div", {
                className:
                  "grid grid-cols-2 gap-2 text-[8px] text-[#7A828C] mt-4 border-t border-[#1C2430] pt-3",
                children: [
                  /* @__PURE__ */ jsxs("div", {
                    children: [
                      /* @__PURE__ */ jsx("span", { children: "BATTERY TEMP" }),
                      /* @__PURE__ */ jsxs("span", {
                        className: "text-white font-bold text-sm block tabular-nums",
                        children: [
                          t?.extras?.ersBatteryTemp ? t.extras.ersBatteryTemp.toFixed(1) : "42.5",
                          "°C",
                        ],
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    children: [
                      /* @__PURE__ */ jsx("span", { children: "DEPLOY EFFICIENCY" }),
                      /* @__PURE__ */ jsx("span", {
                        className: "text-[#00D17F] font-bold text-sm block",
                        children: "93.8%",
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
  });
}
function TireWallScreen({ t, mode, cursorTick }) {
  const flTemp = t?.tires?.fl?.tempC ?? 80;
  const frTemp = t?.tires?.fr?.tempC ?? 82;
  const rlTemp = t?.tires?.rl?.tempC ?? 84;
  const rrTemp = t?.tires?.rr?.tempC ?? 86;
  const flPSI = t?.tires?.fl?.pressureBar ?? 1.8;
  const frPSI = t?.tires?.fr?.pressureBar ?? 1.82;
  const gLat = t?.gLat ?? 0;
  const gLon = t?.gLon ?? 0;
  const getHeatStyles = (temp) => {
    if (temp > 92) return "border-l-2 border-l-[#FF4D4D] bg-[#FF4D4D]/5 text-[#FF4D4D]";
    if (temp > 85) return "border-l-2 border-l-[#FFB800] bg-[#FFB800]/5 text-[#FFB800]";
    return "border-l-2 border-l-[#00D17F] bg-[#00D17F]/5 text-[#00D17F]";
  };
  return /* @__PURE__ */ jsxs("div", {
    className:
      "h-screen w-screen bg-[#05070A] p-3 flex flex-col font-mono text-[9px] text-[#7A828C] select-none",
    children: [
      /* @__PURE__ */ jsxs("div", {
        className:
          "px-3 py-2 border border-[#1C2430] bg-[#11161D] rounded-sm flex items-center justify-between shrink-0 mb-3 select-none",
        children: [
          /* @__PURE__ */ jsxs("span", {
            className: "font-bold text-white tracking-widest uppercase flex items-center gap-1.5",
            children: [
              /* @__PURE__ */ jsx(Flame, { className: "h-3.5 w-3.5 text-[#FFB800]" }),
              " TIRE OPERATING PORTFOLIO",
            ],
          }),
          /* @__PURE__ */ jsx("span", {
            className: "text-white font-bold uppercase shrink-0",
            children: "PIT WALL TIRE WALL",
          }),
        ],
      }),
      /* @__PURE__ */ jsxs("div", {
        className: "flex-1 min-h-0 grid grid-cols-3 gap-3",
        children: [
          /* @__PURE__ */ jsxs("div", {
            className: "col-span-2 grid grid-cols-2 gap-3",
            children: [
              /* @__PURE__ */ jsxs("div", {
                className: `border border-[#1C2430] rounded-sm p-3 flex flex-col justify-between ${getHeatStyles(flTemp)}`,
                children: [
                  /* @__PURE__ */ jsx("span", {
                    className: "font-bold text-[8px] tracking-wider text-white",
                    children: "FRONT LEFT CARCASS",
                  }),
                  /* @__PURE__ */ jsxs("span", {
                    className: "text-2xl font-black tracking-tighter tabular-nums",
                    children: [flTemp.toFixed(1), "°C"],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className:
                      "flex justify-between items-center text-[#7A828C] border-t border-[#1C2430]/20 pt-1 text-[8px]",
                    children: [
                      /* @__PURE__ */ jsx("span", { children: "PRESSURE" }),
                      /* @__PURE__ */ jsxs("span", {
                        className: "text-white font-bold",
                        children: [(flPSI * 14.5038).toFixed(1), " PSI"],
                      }),
                    ],
                  }),
                ],
              }),
              /* @__PURE__ */ jsxs("div", {
                className: `border border-[#1C2430] rounded-sm p-3 flex flex-col justify-between ${getHeatStyles(frTemp)}`,
                children: [
                  /* @__PURE__ */ jsx("span", {
                    className: "font-bold text-[8px] tracking-wider text-white",
                    children: "FRONT RIGHT CARCASS",
                  }),
                  /* @__PURE__ */ jsxs("span", {
                    className: "text-2xl font-black tracking-tighter tabular-nums",
                    children: [frTemp.toFixed(1), "°C"],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className:
                      "flex justify-between items-center text-[#7A828C] border-t border-[#1C2430]/20 pt-1 text-[8px]",
                    children: [
                      /* @__PURE__ */ jsx("span", { children: "PRESSURE" }),
                      /* @__PURE__ */ jsxs("span", {
                        className: "text-white font-bold",
                        children: [(frPSI * 14.5038).toFixed(1), " PSI"],
                      }),
                    ],
                  }),
                ],
              }),
              /* @__PURE__ */ jsxs("div", {
                className: `border border-[#1C2430] rounded-sm p-3 flex flex-col justify-between ${getHeatStyles(rlTemp)}`,
                children: [
                  /* @__PURE__ */ jsx("span", {
                    className: "font-bold text-[8px] tracking-wider text-white",
                    children: "REAR LEFT CARCASS",
                  }),
                  /* @__PURE__ */ jsxs("span", {
                    className: "text-2xl font-black tracking-tighter tabular-nums",
                    children: [rlTemp.toFixed(1), "°C"],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className:
                      "flex justify-between items-center text-[#7A828C] border-t border-[#1C2430]/20 pt-1 text-[8px]",
                    children: [
                      /* @__PURE__ */ jsx("span", { children: "PRESSURE" }),
                      /* @__PURE__ */ jsxs("span", {
                        className: "text-white font-bold",
                        children: [
                          (t?.tires?.rl?.pressureBar * 14.5038 || 26.5).toFixed(1),
                          " PSI",
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              /* @__PURE__ */ jsxs("div", {
                className: `border border-[#1C2430] rounded-sm p-3 flex flex-col justify-between ${getHeatStyles(rrTemp)}`,
                children: [
                  /* @__PURE__ */ jsx("span", {
                    className: "font-bold text-[8px] tracking-wider text-white",
                    children: "REAR RIGHT CARCASS",
                  }),
                  /* @__PURE__ */ jsxs("span", {
                    className: "text-2xl font-black tracking-tighter tabular-nums",
                    children: [rrTemp.toFixed(1), "°C"],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className:
                      "flex justify-between items-center text-[#7A828C] border-t border-[#1C2430]/20 pt-1 text-[8px]",
                    children: [
                      /* @__PURE__ */ jsx("span", { children: "PRESSURE" }),
                      /* @__PURE__ */ jsxs("span", {
                        className: "text-white font-bold",
                        children: [
                          (t?.tires?.rr?.pressureBar * 14.5038 || 26.8).toFixed(1),
                          " PSI",
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          /* @__PURE__ */ jsxs("div", {
            className:
              "border border-[#1C2430] bg-[#0B0F14] p-3 rounded-sm flex flex-col justify-between items-center",
            children: [
              /* @__PURE__ */ jsx("span", {
                className:
                  "text-[10px] text-white font-bold border-b border-[#1C2430] pb-1.5 uppercase mb-3 block w-full text-center",
                children: "G-G GRAPHICS",
              }),
              /* @__PURE__ */ jsxs("div", {
                className:
                  "size-36 border border-[#1C2430] rounded-full relative flex items-center justify-center bg-[#05070A]",
                children: [
                  /* @__PURE__ */ jsx("div", {
                    className: "absolute inset-0 border-l border-dashed border-[#1C2430] left-1/2",
                  }),
                  /* @__PURE__ */ jsx("div", {
                    className: "absolute inset-0 border-t border-dashed border-[#1C2430] top-1/2",
                  }),
                  /* @__PURE__ */ jsx("div", {
                    className:
                      "absolute size-2 rounded-full bg-[#FFB800] shadow-[0_0_8px_#FFB800] transition-all duration-75",
                    style: {
                      left: `${50 + gLat * 18}%`,
                      top: `${50 - gLon * 18}%`,
                    },
                  }),
                ],
              }),
              /* @__PURE__ */ jsxs("div", {
                className:
                  "w-full border-t border-[#1C2430] pt-2 mt-2 flex justify-between text-[8px]",
                children: [
                  /* @__PURE__ */ jsxs("span", {
                    children: [
                      "LAT G: ",
                      /* @__PURE__ */ jsx("span", {
                        className: "text-white font-bold",
                        children: gLat.toFixed(2),
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("span", {
                    children: [
                      "LON G: ",
                      /* @__PURE__ */ jsx("span", {
                        className: "text-white font-bold",
                        children: gLon.toFixed(2),
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
  });
}
function StrategyScreen({ t, mode, cursorTick }) {
  return /* @__PURE__ */ jsxs("div", {
    className:
      "h-screen w-screen bg-[#05070A] p-3 flex flex-col font-mono text-[9px] text-[#7A828C] select-none",
    children: [
      /* @__PURE__ */ jsxs("div", {
        className:
          "px-3 py-2 border border-[#1C2430] bg-[#11161D] rounded-sm flex items-center justify-between shrink-0 mb-3 select-none",
        children: [
          /* @__PURE__ */ jsxs("span", {
            className: "font-bold text-white tracking-widest uppercase flex items-center gap-1.5",
            children: [
              /* @__PURE__ */ jsx(Compass, { className: "h-3.5 w-3.5 text-[#00D17F]" }),
              " TACTICAL STRATEGY WINDOW",
            ],
          }),
          /* @__PURE__ */ jsx("span", {
            className: "text-white font-bold uppercase shrink-0",
            children: "PIT WALL STRATEGY",
          }),
        ],
      }),
      /* @__PURE__ */ jsxs("div", {
        className: "flex-1 min-h-0 grid grid-cols-2 gap-3",
        children: [
          /* @__PURE__ */ jsxs("div", {
            className:
              "border border-[#1C2430] bg-[#0B0F14] p-4 rounded-sm flex flex-col justify-between",
            children: [
              /* @__PURE__ */ jsxs("div", {
                children: [
                  /* @__PURE__ */ jsx("span", {
                    className:
                      "text-[10px] text-white font-bold border-b border-[#1C2430] pb-1.5 uppercase mb-3 block",
                    children: "PIT WINDOW ESTIMATION",
                  }),
                  /* @__PURE__ */ jsx("p", {
                    className: "leading-relaxed mb-4 text-[8.5px]",
                    children:
                      "Platform estimates optimal under-cut pit targets between Laps 14 and 17 based on average tire deg calculations of 1.4% traction loss per lap.",
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "space-y-2",
                    children: [
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex justify-between items-center text-white",
                        children: [
                          /* @__PURE__ */ jsx("span", { children: "PIT OPEN WINDOW" }),
                          /* @__PURE__ */ jsx("span", {
                            className: "font-bold",
                            children: "LAP 14",
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex justify-between items-center text-white",
                        children: [
                          /* @__PURE__ */ jsx("span", { children: "PIT OPTIMAL APEX" }),
                          /* @__PURE__ */ jsx("span", {
                            className: "font-bold text-[#00D17F]",
                            children: "LAP 16",
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex justify-between items-center text-white",
                        children: [
                          /* @__PURE__ */ jsx("span", { children: "PIT CLOSE WINDOW" }),
                          /* @__PURE__ */ jsx("span", {
                            className: "font-bold",
                            children: "LAP 18",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              /* @__PURE__ */ jsx("span", {
                className:
                  "text-[7.5px] text-[#00D17F] border border-[#00D17F]/30 bg-[#00D17F]/10 px-2 py-0.5 rounded font-black tracking-widest uppercase self-start",
                children: "optimal pace buffer active",
              }),
            ],
          }),
          /* @__PURE__ */ jsxs("div", {
            className:
              "border border-[#1C2430] bg-[#0B0F14] p-4 rounded-sm flex flex-col justify-between",
            children: [
              /* @__PURE__ */ jsxs("div", {
                children: [
                  /* @__PURE__ */ jsx("span", {
                    className:
                      "text-[10px] text-white font-bold border-b border-[#1C2430] pb-1.5 uppercase mb-3 block",
                    children: "SAFETY CAR LIFT-AND-COAST MODELER",
                  }),
                  /* @__PURE__ */ jsx("p", {
                    className: "leading-relaxed mb-4 text-[8.5px]",
                    children:
                      "Activating fuel saving delta limits. Under yellow flag safety car constraints, lift-and-coast targets reduce fuel flow by 1.8 L / LAP.",
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "space-y-2",
                    children: [
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex justify-between items-center",
                        children: [
                          /* @__PURE__ */ jsx("span", { children: "NOMINAL STINT FUEL LIMIT" }),
                          /* @__PURE__ */ jsx("span", {
                            className: "text-white font-bold",
                            children: "25 Laps",
                          }),
                        ],
                      }),
                      /* @__PURE__ */ jsxs("div", {
                        className: "flex justify-between items-center text-[#00D17F]",
                        children: [
                          /* @__PURE__ */ jsx("span", { children: "SAFETY CAR STINT EXTENSION" }),
                          /* @__PURE__ */ jsx("span", {
                            className: "font-bold",
                            children: "+6 Laps available",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              /* @__PURE__ */ jsxs("div", {
                className:
                  "flex justify-between items-center border-t border-[#1C2430] pt-2 text-[8px] text-[#7A828C]",
                children: [
                  /* @__PURE__ */ jsx("span", { children: "STINT STRETCH TARGET" }),
                  /* @__PURE__ */ jsx("span", {
                    className: "text-white font-bold",
                    children: "L31 MAX",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function AwaitingSyncPlaceholder({ cursorTick }) {
  return /* @__PURE__ */ jsxs("div", {
    className:
      "h-full w-full flex flex-col items-center justify-center text-center p-8 text-[#7A828C] font-mono text-[9px] relative",
    children: [
      /* @__PURE__ */ jsx("div", {
        className:
          "absolute inset-0 bg-[linear-gradient(to_right,#1C2430_1px,transparent_1px),linear-gradient(to_bottom,#1C2430_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-[0.03] pointer-events-none",
      }),
      /* @__PURE__ */ jsxs("div", {
        className: "relative z-10 flex flex-col items-center max-w-xs animate-pulse",
        children: [
          /* @__PURE__ */ jsx(Sliders, { className: "h-5 w-5 text-[#7A828C] mb-2" }),
          /* @__PURE__ */ jsx("span", {
            className: "font-bold tracking-widest text-white uppercase text-[10px]",
            children: "AWAITING SYSTEM SYNCHRONIZATION",
          }),
          /* @__PURE__ */ jsx("p", {
            className: "mt-2 leading-relaxed text-[8px] uppercase tracking-wider",
            children:
              "Replay frame data is dispatched dynamically by the master workbench. Drag or scrub the telemetry playhead to synchronize visual command monitors.",
          }),
          /* @__PURE__ */ jsxs("span", {
            className: "mt-2 text-[#7A828C] text-[8px]",
            children: ["TICK: ", cursorTick],
          }),
        ],
      }),
    ],
  });
}
export { DetachedInstrumentPage as component };
