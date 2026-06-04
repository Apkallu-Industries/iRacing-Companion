import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { K as useTelemetry } from "./router-D8VllJ-f.js";
import { Activity, Gauge, User, Hash, Sliders, Zap, Wifi, ShieldCheck } from "lucide-react";
import "@tanstack/react-query";
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
import "sonner";
import "zustand";
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
function DriverBridgePage() {
  const t = useTelemetry();
  const [driverName, setDriverName] = useState("");
  const [iracingId, setIracingId] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  const [bridgeConnected, setBridgeConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const team = params.get("team") || params.get("teamCode");
      if (team) setTeamCode(team.toUpperCase());
      const name = params.get("driverName");
      if (name) setDriverName(name);
      const id = params.get("iracingId");
      if (id) setIracingId(id);
    }
  }, []);
  useEffect(() => {
    const checkBridge = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/driver/config").catch(() => null);
        if (res && res.ok) {
          setBridgeConnected(true);
          const config = await res.json();
          if (config.driverName && !isConfigured) {
            setDriverName(config.driverName);
            setIracingId(config.iracingId || "");
            setTeamCode(config.teamCode || "");
            setIsConfigured(true);
          }
        } else {
          setBridgeConnected(false);
        }
      } catch {
        setBridgeConnected(false);
      } finally {
        setLoading(false);
      }
    };
    checkBridge();
    const interval = setInterval(checkBridge, 3e3);
    return () => clearInterval(interval);
  }, [isConfigured]);
  const handleSyncSubmit = async (e) => {
    e.preventDefault();
    if (!driverName.trim()) {
      setErrorMsg("Driver Name is required.");
      return;
    }
    if (!iracingId.trim()) {
      setErrorMsg("iRacing ID is required.");
      return;
    }
    setSyncing(true);
    setErrorMsg(null);
    try {
      const res = await fetch("http://localhost:3001/api/driver/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          driverName: driverName.trim(),
          iracingId: iracingId.trim(),
          teamCode: teamCode.trim().toUpperCase(),
        }),
      }).catch(() => null);
      if (res && res.ok) {
        setIsConfigured(true);
      } else {
        setErrorMsg("Failed to synchronize with local bridge. Is the local bridge server running?");
      }
    } catch (err) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setSyncing(false);
    }
  };
  const handleResetConfig = async () => {
    setIsConfigured(false);
  };
  const getShiftLights = () => {
    const lights = [];
    const rpm = t.rpm || 0;
    t.rpmMax || 11e3;
    const rpmWarn = t.rpmShiftWarn || 8800;
    const rpmBlink = t.rpmShiftRedline || 9800;
    const range = rpmBlink - rpmWarn * 0.8;
    const step = range / 10;
    for (let i = 0; i < 10; i++) {
      const threshold = rpmWarn * 0.8 + i * step;
      const active = rpm >= threshold;
      let colorClass = "bg-zinc-800/80";
      if (active) {
        if (rpm >= rpmBlink) {
          colorClass = "bg-blue-500 shadow-[0_0_12px_#3b82f6] animate-pulse";
        } else if (i >= 8) {
          colorClass = "bg-red-500 shadow-[0_0_10px_#ef4444]";
        } else if (i >= 5) {
          colorClass = "bg-amber-500 shadow-[0_0_8px_#f59e0b]";
        } else {
          colorClass = "bg-emerald-500 shadow-[0_0_8px_#10b981]";
        }
      }
      lights.push(
        /* @__PURE__ */ jsx(
          "div",
          { className: `h-3 rounded-full flex-1 transition-all duration-75 ${colorClass}` },
          i,
        ),
      );
    }
    return lights;
  };
  const getTireTempColor = (tempC) => {
    if (tempC < 60) return "text-cyan-400";
    if (tempC > 95) return "text-red-400";
    return "text-emerald-400";
  };
  const getTireWearColor = (wearPct) => {
    if (wearPct > 80) return "bg-emerald-500 shadow-[0_0_6px_#10b981]";
    if (wearPct > 45) return "bg-amber-500 shadow-[0_0_6px_#f59e0b]";
    return "bg-red-500 shadow-[0_0_6px_#ef4444]";
  };
  if (loading) {
    return /* @__PURE__ */ jsxs("div", {
      className:
        "flex h-screen flex-col items-center justify-center bg-[#05070A] text-foreground font-mono",
      children: [
        /* @__PURE__ */ jsx(Activity, { className: "h-8 w-8 text-primary animate-spin mb-3" }),
        /* @__PURE__ */ jsx("span", {
          className: "text-xs uppercase tracking-widest text-muted-foreground animate-pulse",
          children: "Initializing cockpit telemetry...",
        }),
      ],
    });
  }
  return /* @__PURE__ */ jsxs("main", {
    className:
      "min-h-screen bg-[#05070A] text-[#E2E4E8] font-mono overflow-x-hidden relative flex flex-col justify-between selection:bg-primary/30",
    children: [
      /* @__PURE__ */ jsx("div", {
        className:
          "absolute inset-0 bg-[linear-gradient(to_right,#11161D_1px,transparent_1px),linear-gradient(to_bottom,#11161D_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-[0.12] pointer-events-none z-0",
      }),
      /* @__PURE__ */ jsxs("nav", {
        className:
          "border-b border-[#1C2430] bg-[#0B0F14]/90 backdrop-blur sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between z-10 select-none",
        children: [
          /* @__PURE__ */ jsx(Link, {
            to: "/",
            className: "flex flex-col",
            children: /* @__PURE__ */ jsxs("div", {
              className: "flex items-center gap-2",
              children: [
                /* @__PURE__ */ jsx("span", {
                  className: "font-sans font-black italic tracking-tighter text-lg text-white",
                  children: "PIT WALL",
                }),
                /* @__PURE__ */ jsx("span", {
                  className:
                    "text-[8px] font-mono tracking-widest text-[#7A828C] bg-[#11161D] px-1.5 py-0.5 border border-[#1C2430]",
                  children: "DRIVER HUD",
                }),
              ],
            }),
          }),
          /* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-6",
            children: [
              /* @__PURE__ */ jsxs("div", {
                className:
                  "hidden md:flex items-center gap-3 border border-[#1C2430] bg-[#11161D] px-3 py-1 text-[10px]",
                children: [
                  /* @__PURE__ */ jsx("span", {
                    className: "text-[#7A828C] font-bold",
                    children: "LOCAL BRIDGE",
                  }),
                  /* @__PURE__ */ jsxs("span", {
                    className: `flex items-center gap-1.5 font-bold ${bridgeConnected ? "text-emerald-400" : "text-amber-400"}`,
                    children: [
                      /* @__PURE__ */ jsx("span", {
                        className: `h-1.5 w-1.5 rounded-full ${bridgeConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`,
                      }),
                      bridgeConnected ? "ONLINE (ws:3001)" : "OFFLINE",
                    ],
                  }),
                ],
              }),
              /* @__PURE__ */ jsx(Link, {
                to: "/",
                className:
                  "text-xs text-[#7A828C] hover:text-white uppercase tracking-wider font-bold transition-all border border-[#1C2430] bg-[#11161D] px-3.5 py-1",
                children: "Back",
              }),
            ],
          }),
        ],
      }),
      /* @__PURE__ */ jsx("div", {
        className:
          "flex-1 w-full max-w-none px-4 md:px-12 lg:px-16 py-8 flex flex-col justify-center items-center z-10 relative",
        children: !isConfigured
          ? /* STATE A: WIZARD CONFIGURATION FORM */
            /* @__PURE__ */ jsxs("div", {
              className:
                "w-full max-w-xl bg-[#0B0F14]/80 border border-[#1C2430] rounded-3xl p-8 shadow-2xl backdrop-blur-md relative overflow-hidden",
              children: [
                /* @__PURE__ */ jsx("div", {
                  className:
                    "absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-[80px] pointer-events-none",
                }),
                /* @__PURE__ */ jsxs("div", {
                  className: "flex items-center gap-3 mb-6 pb-4 border-b border-[#1C2430]",
                  children: [
                    /* @__PURE__ */ jsx("div", {
                      className:
                        "p-2.5 bg-primary/10 border border-primary/20 text-primary rounded-2xl",
                      children: /* @__PURE__ */ jsx(Gauge, { className: "w-6 h-6" }),
                    }),
                    /* @__PURE__ */ jsxs("div", {
                      children: [
                        /* @__PURE__ */ jsx("h2", {
                          className: "text-sm font-bold uppercase tracking-widest text-white",
                          children: "Driver Cockpit Setup",
                        }),
                        /* @__PURE__ */ jsx("p", {
                          className: "text-[10px] text-muted-foreground uppercase mt-0.5",
                          children: "Synchronize your active identity and team code",
                        }),
                      ],
                    }),
                  ],
                }),
                errorMsg &&
                  /* @__PURE__ */ jsx("div", {
                    className:
                      "mb-5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-sans rounded-xl leading-relaxed",
                    children: errorMsg,
                  }),
                /* @__PURE__ */ jsxs("form", {
                  onSubmit: handleSyncSubmit,
                  className: "space-y-5 font-sans",
                  children: [
                    /* @__PURE__ */ jsxs("div", {
                      className: "flex flex-col gap-1.5",
                      children: [
                        /* @__PURE__ */ jsx("label", {
                          className:
                            "text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1",
                          children: "Full Driver Name",
                        }),
                        /* @__PURE__ */ jsxs("div", {
                          className: "relative flex items-center",
                          children: [
                            /* @__PURE__ */ jsx(User, {
                              className: "absolute left-3.5 w-4 h-4 text-muted-foreground",
                            }),
                            /* @__PURE__ */ jsx("input", {
                              type: "text",
                              required: true,
                              value: driverName,
                              onChange: (e) => setDriverName(e.target.value),
                              className:
                                "w-full bg-background border border-[#1C2430] hover:border-[#7A828C]/40 focus:border-primary/80 focus:ring-1 focus:ring-primary/30 rounded-xl pl-11 pr-4 py-3 text-xs font-mono text-white transition-all outline-none",
                              placeholder: "e.g. Danny M",
                            }),
                          ],
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxs("div", {
                      className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                      children: [
                        /* @__PURE__ */ jsxs("div", {
                          className: "flex flex-col gap-1.5",
                          children: [
                            /* @__PURE__ */ jsx("label", {
                              className:
                                "text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1",
                              children: "iRacing Customer ID",
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className: "relative flex items-center",
                              children: [
                                /* @__PURE__ */ jsx(Hash, {
                                  className: "absolute left-3.5 w-4 h-4 text-muted-foreground",
                                }),
                                /* @__PURE__ */ jsx("input", {
                                  type: "text",
                                  required: true,
                                  value: iracingId,
                                  onChange: (e) => setIracingId(e.target.value),
                                  className:
                                    "w-full bg-background border border-[#1C2430] hover:border-[#7A828C]/40 focus:border-primary/80 focus:ring-1 focus:ring-primary/30 rounded-xl pl-11 pr-4 py-3 text-xs font-mono text-white transition-all outline-none",
                                  placeholder: "Find on Account page",
                                }),
                              ],
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxs("div", {
                          className: "flex flex-col gap-1.5",
                          children: [
                            /* @__PURE__ */ jsx("label", {
                              className:
                                "text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1",
                              children: "Team Code (Optional)",
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className: "relative flex items-center",
                              children: [
                                /* @__PURE__ */ jsx(Sliders, {
                                  className: "absolute left-3.5 w-4 h-4 text-muted-foreground",
                                }),
                                /* @__PURE__ */ jsx("input", {
                                  type: "text",
                                  value: teamCode,
                                  onChange: (e) => setTeamCode(e.target.value.toUpperCase()),
                                  className:
                                    "w-full bg-background border border-[#1C2430] hover:border-[#7A828C]/40 focus:border-primary/80 focus:ring-1 focus:ring-primary/30 rounded-xl pl-11 pr-4 py-3 text-xs font-mono text-white transition-all outline-none uppercase",
                                  placeholder: "e.g. LE-MANS-2026",
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxs("button", {
                      type: "submit",
                      disabled: syncing,
                      className:
                        "w-full py-3.5 bg-primary text-primary-foreground font-mono font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 cursor-pointer mt-3",
                      children: [
                        /* @__PURE__ */ jsx(Zap, { className: "w-4 h-4" }),
                        syncing ? "Synchronizing details..." : "Sync & Enter Cockpit",
                      ],
                    }),
                  ],
                }),
                /* @__PURE__ */ jsxs("div", {
                  className: "mt-8 pt-6 border-t border-[#1C2430] text-xs",
                  children: [
                    /* @__PURE__ */ jsxs("h4", {
                      className: "text-white uppercase font-bold mb-3 flex items-center gap-2",
                      children: [
                        /* @__PURE__ */ jsx(Wifi, { className: "w-4 h-4 text-primary" }),
                        "How to connect your Local Bridge",
                      ],
                    }),
                    /* @__PURE__ */ jsx("p", {
                      className: "text-muted-foreground text-[11px] leading-relaxed mb-4",
                      children:
                        "Drivers must run the telemetry bridge locally to grab and stream their live iRacing data. Download the bridge zip file, extract it, and execute in your command prompt:",
                    }),
                    /* @__PURE__ */ jsx("pre", {
                      className:
                        "overflow-x-auto rounded border border-[#1C2430] bg-[#05070A] p-3.5 font-mono text-[10px] leading-relaxed text-emerald-400 w-full mb-3 select-all",
                      children: `cd C:\\PitWall\\bridge
npm install
npm start`,
                    }),
                    /* @__PURE__ */ jsxs("div", {
                      className:
                        "flex items-center gap-2 p-3 bg-primary/5 border border-primary/10 text-muted-foreground rounded-xl leading-normal text-[11px] font-sans",
                      children: [
                        /* @__PURE__ */ jsx(ShieldCheck, {
                          className: "w-4 h-4 text-primary shrink-0",
                        }),
                        /* @__PURE__ */ jsx("span", {
                          children:
                            "The bridge remains completely local on your PC. No credentials or external accounts are requested.",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            })
          : /* STATE B: SIMPLIFIED HIGH-PERFORMANCE COCKPIT HUD */
            /* @__PURE__ */ jsxs("div", {
              className: "w-full space-y-6",
              children: [
                /* @__PURE__ */ jsx("div", {
                  className:
                    "flex items-center gap-1.5 w-full bg-[#0B0F14] border border-[#1C2430] rounded-2xl p-2.5 shadow-xl shrink-0",
                  children: getShiftLights(),
                }),
                /* @__PURE__ */ jsxs("div", {
                  className:
                    "flex flex-col md:flex-row gap-4 items-stretch justify-between text-xs w-full",
                  children: [
                    /* @__PURE__ */ jsxs("div", {
                      className:
                        "flex-1 bg-[#0B0F14] border border-[#1C2430] rounded-2xl p-4 flex items-center justify-between shadow-lg",
                      children: [
                        /* @__PURE__ */ jsxs("div", {
                          children: [
                            /* @__PURE__ */ jsx("span", {
                              className:
                                "text-[#7A828C] block uppercase text-[9px] tracking-widest",
                              children: "Active Driver Profile",
                            }),
                            /* @__PURE__ */ jsx("span", {
                              className: "text-sm font-bold text-white uppercase",
                              children: driverName,
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxs("div", {
                          className: "text-right",
                          children: [
                            /* @__PURE__ */ jsx("span", {
                              className:
                                "text-[#7A828C] block uppercase text-[9px] tracking-widest",
                              children: "iRacing ID",
                            }),
                            /* @__PURE__ */ jsx("span", {
                              className: "text-sm font-bold text-primary font-mono",
                              children: iracingId,
                            }),
                          ],
                        }),
                      ],
                    }),
                    teamCode &&
                      /* @__PURE__ */ jsxs("div", {
                        className:
                          "flex-1 bg-[#0B0F14] border border-[#1c2430] rounded-2xl p-4 flex items-center justify-between shadow-lg",
                        children: [
                          /* @__PURE__ */ jsxs("div", {
                            children: [
                              /* @__PURE__ */ jsx("span", {
                                className:
                                  "text-[#7A828C] block uppercase text-[9px] tracking-widest",
                                children: "Paddock Sync Team",
                              }),
                              /* @__PURE__ */ jsx("span", {
                                className: "text-sm font-bold text-white font-mono uppercase",
                                children: teamCode,
                              }),
                            ],
                          }),
                          /* @__PURE__ */ jsx("span", {
                            className:
                              "text-[8px] bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-full uppercase font-bold tracking-widest font-mono",
                            children: "CONNECTED",
                          }),
                        ],
                      }),
                    /* @__PURE__ */ jsxs("div", {
                      className:
                        "flex-1 bg-[#0B0F14] border border-[#1c2430] rounded-2xl p-4 flex items-center justify-between shadow-lg",
                      children: [
                        /* @__PURE__ */ jsxs("div", {
                          children: [
                            /* @__PURE__ */ jsx("span", {
                              className:
                                "text-[#7A828C] block uppercase text-[9px] tracking-widest",
                              children: "Current Session",
                            }),
                            /* @__PURE__ */ jsx("span", {
                              className:
                                "text-sm font-bold text-white uppercase truncate max-w-[200px] block",
                              children:
                                t.session !== "SESSION — TRACK" ? t.session : "WAITTING FOR SIM...",
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsx("span", {
                          className: `w-2.5 h-2.5 rounded-full shrink-0 shadow ${t.connected ? "bg-emerald-400 shadow-emerald-400" : "bg-amber-400 shadow-amber-400"}`,
                        }),
                      ],
                    }),
                  ],
                }),
                /* @__PURE__ */ jsxs("div", {
                  className: "grid lg:grid-cols-12 gap-6 items-stretch w-full",
                  children: [
                    /* @__PURE__ */ jsxs("div", {
                      className: "lg:col-span-7 flex flex-col gap-6 justify-between items-stretch",
                      children: [
                        /* @__PURE__ */ jsxs("div", {
                          className:
                            "border border-[#1C2430] bg-[#0B0F14] rounded-3xl p-8 flex-1 flex items-center justify-around shadow-2xl relative overflow-hidden min-h-[260px]",
                          children: [
                            /* @__PURE__ */ jsx("div", {
                              className:
                                "absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[90px] pointer-events-none",
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className:
                                "relative flex items-center justify-center h-48 w-48 bg-[#05070A]/60 border border-[#1C2430] rounded-full",
                              children: [
                                /* @__PURE__ */ jsx("span", {
                                  className:
                                    "text-[132px] font-sans font-black italic tracking-tighter text-white select-none leading-none",
                                  children: t.gear === 0 ? "N" : t.gear === -1 ? "R" : t.gear,
                                }),
                                /* @__PURE__ */ jsx("span", {
                                  className:
                                    "absolute bottom-4 font-mono text-[9px] uppercase tracking-widest text-[#7A828C]",
                                  children: "Gear",
                                }),
                              ],
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className:
                                "flex flex-col justify-center gap-1.5 font-mono border-l border-[#1C2430] pl-10 flex-1",
                              children: [
                                /* @__PURE__ */ jsxs("div", {
                                  children: [
                                    /* @__PURE__ */ jsx("span", {
                                      className:
                                        "text-[#7A828C] uppercase text-[9px] tracking-widest block",
                                      children: "VELOCITY",
                                    }),
                                    /* @__PURE__ */ jsxs("div", {
                                      className:
                                        "text-5xl font-sans font-black italic tracking-tighter text-white leading-none mt-1",
                                      children: [
                                        Math.round(t.speedKph),
                                        " ",
                                        /* @__PURE__ */ jsx("span", {
                                          className: "text-xs not-italic text-[#7A828C]",
                                          children: "KPH",
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                /* @__PURE__ */ jsxs("div", {
                                  className: "mt-4",
                                  children: [
                                    /* @__PURE__ */ jsx("span", {
                                      className:
                                        "text-[#7A828C] uppercase text-[9px] tracking-widest block",
                                      children: "ENGINE SPEED",
                                    }),
                                    /* @__PURE__ */ jsxs("div", {
                                      className: "text-xl font-bold text-white mt-1",
                                      children: [
                                        Math.round(t.rpm),
                                        " ",
                                        /* @__PURE__ */ jsx("span", {
                                          className: "text-[10px] font-normal text-[#7A828C]",
                                          children: "RPM",
                                        }),
                                      ],
                                    }),
                                    /* @__PURE__ */ jsx("div", {
                                      className:
                                        "h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mt-1.5",
                                      children: /* @__PURE__ */ jsx("div", {
                                        className: "h-full bg-primary",
                                        style: {
                                          width: `${Math.min(100, (t.rpm / (t.rpmMax || 11e3)) * 100)}%`,
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
                            "border border-[#1C2430] bg-[#0B0F14] rounded-3xl p-6 shadow-xl",
                          children: [
                            /* @__PURE__ */ jsx("h3", {
                              className:
                                "text-[10px] text-white uppercase font-bold tracking-wider mb-4",
                              children: "Input Controls",
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className: "space-y-3",
                              children: [
                                /* @__PURE__ */ jsxs("div", {
                                  className: "grid grid-cols-12 gap-3 items-center",
                                  children: [
                                    /* @__PURE__ */ jsx("span", {
                                      className: "col-span-2 text-[#7A828C] text-[10px] font-bold",
                                      children: "THR",
                                    }),
                                    /* @__PURE__ */ jsx("div", {
                                      className:
                                        "col-span-8 h-4 bg-zinc-850 border border-[#1C2430] rounded-lg overflow-hidden relative",
                                      children: /* @__PURE__ */ jsx("div", {
                                        className: "h-full bg-emerald-500 shadow-[0_0_8px_#10b981]",
                                        style: {
                                          width: `${(t.throttle || 0) * 100}%`,
                                        },
                                      }),
                                    }),
                                    /* @__PURE__ */ jsxs("span", {
                                      className:
                                        "col-span-2 text-right text-xs font-bold text-white",
                                      children: [Math.round((t.throttle || 0) * 100), "%"],
                                    }),
                                  ],
                                }),
                                /* @__PURE__ */ jsxs("div", {
                                  className: "grid grid-cols-12 gap-3 items-center",
                                  children: [
                                    /* @__PURE__ */ jsx("span", {
                                      className: "col-span-2 text-[#7A828C] text-[10px] font-bold",
                                      children: "BRK",
                                    }),
                                    /* @__PURE__ */ jsx("div", {
                                      className:
                                        "col-span-8 h-4 bg-zinc-850 border border-[#1C2430] rounded-lg overflow-hidden relative",
                                      children: /* @__PURE__ */ jsx("div", {
                                        className: "h-full bg-red-500 shadow-[0_0_8px_#ef4444]",
                                        style: {
                                          width: `${(t.brake || 0) * 100}%`,
                                        },
                                      }),
                                    }),
                                    /* @__PURE__ */ jsxs("span", {
                                      className:
                                        "col-span-2 text-right text-xs font-bold text-white",
                                      children: [Math.round((t.brake || 0) * 100), "%"],
                                    }),
                                  ],
                                }),
                                /* @__PURE__ */ jsxs("div", {
                                  className: "grid grid-cols-12 gap-3 items-center",
                                  children: [
                                    /* @__PURE__ */ jsx("span", {
                                      className: "col-span-2 text-[#7A828C] text-[10px] font-bold",
                                      children: "CLU",
                                    }),
                                    /* @__PURE__ */ jsx("div", {
                                      className:
                                        "col-span-8 h-4 bg-zinc-850 border border-[#1C2430] rounded-lg overflow-hidden relative",
                                      children: /* @__PURE__ */ jsx("div", {
                                        className: "h-full bg-sky-500 shadow-[0_0_8px_#0ea5e9]",
                                        style: {
                                          width: `${(t.clutch || 0) * 100}%`,
                                        },
                                      }),
                                    }),
                                    /* @__PURE__ */ jsxs("span", {
                                      className:
                                        "col-span-2 text-right text-xs font-bold text-white",
                                      children: [Math.round((t.clutch || 0) * 100), "%"],
                                    }),
                                  ],
                                }),
                                /* @__PURE__ */ jsxs("div", {
                                  className: "grid grid-cols-12 gap-3 items-center",
                                  children: [
                                    /* @__PURE__ */ jsx("span", {
                                      className: "col-span-2 text-[#7A828C] text-[10px] font-bold",
                                      children: "STEER",
                                    }),
                                    /* @__PURE__ */ jsxs("div", {
                                      className:
                                        "col-span-8 h-4 bg-zinc-850 border border-[#1C2430] rounded-lg overflow-hidden relative flex items-center justify-center",
                                      children: [
                                        /* @__PURE__ */ jsx("div", {
                                          className:
                                            "absolute top-0 bottom-0 left-1/2 w-[1px] bg-zinc-700",
                                        }),
                                        /* @__PURE__ */ jsx("div", {
                                          className:
                                            "absolute h-2 w-2 rounded-sm bg-cyan-400 shadow-[0_0_6px_#22d3ee]",
                                          style: {
                                            left: `calc(50% + ${Math.max(-50, Math.min(50, ((t.steeringDeg || 0) / 360) * 50))}% - 4px)`,
                                          },
                                        }),
                                      ],
                                    }),
                                    /* @__PURE__ */ jsxs("span", {
                                      className:
                                        "col-span-2 text-right text-xs font-bold text-white",
                                      children: [Math.round(t.steeringDeg || 0), "°"],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxs("div", {
                      className: "lg:col-span-5 flex flex-col gap-6 justify-between items-stretch",
                      children: [
                        /* @__PURE__ */ jsxs("div", {
                          className:
                            "border border-[#1C2430] bg-[#0B0F14] rounded-3xl p-6 shadow-xl space-y-4",
                          children: [
                            /* @__PURE__ */ jsxs("div", {
                              className:
                                "flex justify-between items-center border-b border-[#1C2430] pb-2",
                              children: [
                                /* @__PURE__ */ jsx("h3", {
                                  className:
                                    "text-[10px] text-white uppercase font-bold tracking-wider",
                                  children: "Sector Times",
                                }),
                                /* @__PURE__ */ jsxs("div", {
                                  className: "flex items-center gap-3 text-[10px] font-bold",
                                  children: [
                                    /* @__PURE__ */ jsxs("span", {
                                      className: "text-[#7A828C]",
                                      children: [
                                        "S1: ",
                                        /* @__PURE__ */ jsx("span", {
                                          className: "text-white",
                                          children: t.sectors?.s1 || "--.---",
                                        }),
                                      ],
                                    }),
                                    /* @__PURE__ */ jsxs("span", {
                                      className: "text-[#7A828C]",
                                      children: [
                                        "S2: ",
                                        /* @__PURE__ */ jsx("span", {
                                          className: "text-white",
                                          children: t.sectors?.s2 || "--.---",
                                        }),
                                      ],
                                    }),
                                    /* @__PURE__ */ jsxs("span", {
                                      className: "text-[#7A828C]",
                                      children: [
                                        "S3: ",
                                        /* @__PURE__ */ jsx("span", {
                                          className: "text-white",
                                          children: t.sectors?.s3 || "--.---",
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className: "grid grid-cols-2 gap-4",
                              children: [
                                /* @__PURE__ */ jsxs("div", {
                                  children: [
                                    /* @__PURE__ */ jsx("span", {
                                      className:
                                        "text-[#7A828C] text-[9px] tracking-widest uppercase block",
                                      children: "Last Lap",
                                    }),
                                    /* @__PURE__ */ jsx("span", {
                                      className: "text-lg font-bold text-white",
                                      children: t.lastLap || "--:--.---",
                                    }),
                                  ],
                                }),
                                /* @__PURE__ */ jsxs("div", {
                                  children: [
                                    /* @__PURE__ */ jsx("span", {
                                      className:
                                        "text-[#7A828C] text-[9px] tracking-widest uppercase block",
                                      children: "Best Lap",
                                    }),
                                    /* @__PURE__ */ jsx("span", {
                                      className: "text-lg font-bold text-emerald-400",
                                      children: t.bestLap || "--:--.---",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className: `p-4 rounded-2xl flex items-center justify-between border ${t.deltaSec >= 0 ? "bg-red-500/5 border-red-500/20 text-red-400" : "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"}`,
                              children: [
                                /* @__PURE__ */ jsx("span", {
                                  className:
                                    "font-sans text-[10px] font-bold uppercase tracking-widest",
                                  children: "Lap Delta",
                                }),
                                /* @__PURE__ */ jsxs("span", {
                                  className: "text-2xl font-bold tracking-wider font-mono",
                                  children: [
                                    t.deltaSec >= 0 ? "+" : "",
                                    t.deltaSec.toFixed(3),
                                    "s",
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxs("div", {
                          className:
                            "border border-[#1C2430] bg-[#0B0F14] rounded-3xl p-6 shadow-xl",
                          children: [
                            /* @__PURE__ */ jsx("h3", {
                              className:
                                "text-[10px] text-white uppercase font-bold tracking-wider mb-4 border-b border-[#1C2430] pb-2",
                              children: "Tire Management",
                            }),
                            /* @__PURE__ */ jsx("div", {
                              className: "grid grid-cols-2 gap-4 font-mono text-[10px]",
                              children: ["fl", "fr", "rl", "rr"].map((corner) => {
                                const tire = t.tires?.[corner];
                                if (!tire) return null;
                                const label = corner.toUpperCase();
                                return /* @__PURE__ */ jsxs(
                                  "div",
                                  {
                                    className:
                                      "bg-background border border-[#1C2430]/60 rounded-2xl p-3 space-y-1.5",
                                    children: [
                                      /* @__PURE__ */ jsxs("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                          /* @__PURE__ */ jsx("span", {
                                            className: "font-bold text-[#7A828C]",
                                            children: label,
                                          }),
                                          /* @__PURE__ */ jsxs("span", {
                                            className: `font-bold ${getTireTempColor(tire.tempC)}`,
                                            children: [Math.round(tire.tempC), "°C"],
                                          }),
                                        ],
                                      }),
                                      /* @__PURE__ */ jsxs("div", {
                                        className: "text-[11px] font-bold text-white",
                                        children: [tire.pressureBar.toFixed(2), " bar"],
                                      }),
                                      /* @__PURE__ */ jsx("div", {
                                        className:
                                          "h-1 w-full bg-zinc-800 rounded-full overflow-hidden mt-1",
                                        children: /* @__PURE__ */ jsx("div", {
                                          className: `h-full ${getTireWearColor(tire.estWearPct)}`,
                                          style: {
                                            width: `${tire.estWearPct}%`,
                                          },
                                        }),
                                      }),
                                      /* @__PURE__ */ jsxs("div", {
                                        className: "text-[9px] text-[#7A828C] text-right font-bold",
                                        children: [Math.round(tire.estWearPct), "% wear"],
                                      }),
                                    ],
                                  },
                                  corner,
                                );
                              }),
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxs("div", {
                          className:
                            "border border-[#1C2430] bg-[#0B0F14] rounded-3xl p-6 shadow-xl grid grid-cols-2 gap-6",
                          children: [
                            /* @__PURE__ */ jsxs("div", {
                              children: [
                                /* @__PURE__ */ jsx("span", {
                                  className:
                                    "text-[#7A828C] text-[9px] tracking-widest block uppercase mb-1",
                                  children: "Fuel Remaining",
                                }),
                                /* @__PURE__ */ jsxs("span", {
                                  className: "text-xl font-bold text-white font-mono",
                                  children: [
                                    t.fuelRemainingL.toFixed(1),
                                    " ",
                                    /* @__PURE__ */ jsx("span", {
                                      className: "text-xs text-[#7A828C]",
                                      children: "L",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              children: [
                                /* @__PURE__ */ jsx("span", {
                                  className:
                                    "text-[#7A828C] text-[9px] tracking-widest block uppercase mb-1",
                                  children: "Estimated Laps",
                                }),
                                /* @__PURE__ */ jsxs("span", {
                                  className: "text-xl font-bold text-primary font-mono",
                                  children: [
                                    t.lapsEstimated.toFixed(1),
                                    " ",
                                    /* @__PURE__ */ jsx("span", {
                                      className: "text-xs text-[#7A828C]",
                                      children: "Laps",
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
                /* @__PURE__ */ jsx("div", {
                  className: "flex justify-center pt-2",
                  children: /* @__PURE__ */ jsx("button", {
                    onClick: handleResetConfig,
                    className:
                      "px-4 py-2 border border-[#1C2430] bg-[#0B0F14] text-[#7A828C] hover:text-white uppercase tracking-wider text-[9px] font-bold rounded-xl transition-all hover:bg-zinc-800 cursor-pointer",
                    children: "↺ Modify Driver Profile",
                  }),
                }),
              ],
            }),
      }),
      /* @__PURE__ */ jsx("footer", {
        className:
          "border-t border-[#1C2430] bg-[#0B0F14]/50 py-4 px-6 text-[#7A828C] text-[8px] font-mono tracking-wider z-10 select-none",
        children: /* @__PURE__ */ jsxs("div", {
          className:
            "mx-auto w-full max-w-none px-4 md:px-12 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-4",
          children: [
            /* @__PURE__ */ jsx("span", {
              className: "font-sans font-black italic tracking-tighter text-white",
              children: "PIT WALL DRIVER STATION",
            }),
            /* @__PURE__ */ jsx("span", {
              children: "© 2026 PIT WALL WORKSTATION · ACTIVE LOCAL WS PIPELINE",
            }),
          ],
        }),
      }),
    ],
  });
}
export { DriverBridgePage as component };
