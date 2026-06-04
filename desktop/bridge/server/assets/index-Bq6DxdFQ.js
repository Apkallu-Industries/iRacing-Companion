import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import {
  Gauge,
  LineChart,
  Cpu,
  Rocket,
  Sliders,
  ChevronRight,
  Users,
  Terminal,
  GraduationCap,
  BookOpen,
  Settings,
  LogIn,
  Database,
  Wifi,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import { J as useAuth, N as useWorkbench, C as supabase } from "./router-D8VllJ-f.js";
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
function LandingPage() {
  const { user } = useAuth();
  const [pulse, setPulse] = useState(true);
  const [bridgeConnected, setBridgeConnected] = useState(false);
  const [recentSessions, setRecentSessions] = useState([]);
  const activeGame = useWorkbench((state) => state.activeGame);
  const setActiveGame = useWorkbench((state) => state.setActiveGame);
  const handleGameSelect = async (game) => {
    setActiveGame(game);
    try {
      await fetch("http://localhost:3001/api/game/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          game,
        }),
      });
      console.log(`[Landing] Synergized bridge config for ${game}`);
    } catch (err) {
      console.warn("[Landing] Local bridge not reachable for game configuration update:", err);
    }
  };
  const isElectron =
    typeof window !== "undefined" &&
    (window.pitWallRuntime !== void 0 ||
      window.navigator.userAgent.toLowerCase().includes("electron"));
  const [manifest, setManifest] = useState(null);
  useEffect(() => {
    if (!isElectron) return;
    const fetchManifest = async () => {
      try {
        if (window.pitWallRuntime?.getRuntimeManifest) {
          const m = await window.pitWallRuntime.getRuntimeManifest();
          setManifest(m);
        }
      } catch (err) {
        console.warn("Failed to fetch manifest", err);
      }
    };
    fetchManifest();
    const interval = setInterval(fetchManifest, 3e3);
    return () => clearInterval(interval);
  }, [isElectron]);
  useEffect(() => {
    const checkBridge = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/license").catch(() => null);
        setBridgeConnected(res ? res.ok : false);
      } catch {
        setBridgeConnected(false);
      }
    };
    checkBridge();
    const interval = setInterval(checkBridge, 5e3);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (!user) return;
    const fetchRecent = async () => {
      const { data, error } = await supabase
        .from("telemetry_sessions")
        .select("*")
        .order("created_at", {
          ascending: false,
        })
        .limit(3);
      if (!error && data) {
        setRecentSessions(data);
      }
    };
    fetchRecent();
  }, [user]);
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((prev) => !prev);
    }, 1500);
    return () => clearInterval(interval);
  }, []);
  const openSettings = () => {
    document.getElementById("global-settings-trigger")?.click();
  };
  const fmtLapTime = (s) => {
    if (!s || s <= 0) return "--:--.---";
    const m = Math.floor(s / 60);
    const sec = (s - m * 60).toFixed(3);
    return `${m}:${sec.padStart(6, "0")}`;
  };
  const systemRam = manifest?.totalRamGb ? parseFloat(manifest.totalRamGb) : 16;
  const systemVram = manifest?.vramGb ? parseFloat(manifest.vramGb) : 0;
  let recommendedLlmName = "Cloud API Mode (OpenAI/Anthropic)";
  let recommendedLlmUrl = "#";
  let recommendedLlmLinkText = "Configure Cloud API →";
  let recommendedLlmDesc =
    "Local models smaller than 7B parameters lack native tool-use & strategic reasoning capabilities. Cloud Mode is recommended to prevent telemetry pipeline failures.";
  if (systemRam >= 64 && systemVram >= 16) {
    recommendedLlmName = "Qwen-2.5-72B-Instruct (Q4_K_M)";
    recommendedLlmUrl = "https://huggingface.co/lmstudio-community/Qwen2.5-72B-Instruct-GGUF";
    recommendedLlmLinkText = "Download GGUF →";
    recommendedLlmDesc =
      "Elite-tier offline strategy & tool use. Runs fully offline with 72B parameter reasoning using 48GB System RAM and 16GB VRAM.";
  } else if (systemRam >= 32 && systemVram >= 12) {
    recommendedLlmName = "Qwen-2.5-14B-Instruct (Q4_K_M)";
    recommendedLlmUrl = "https://huggingface.co/lmstudio-community/Qwen2.5-14B-Instruct-GGUF";
    recommendedLlmLinkText = "Download GGUF →";
    recommendedLlmDesc =
      "Perfect balance of speed and outstanding native tool-calling strategy. Fits comfortably inside 12GB VRAM.";
  } else if (systemRam >= 16 && systemVram >= 6) {
    recommendedLlmName = "Qwen-2.5-7B-Instruct (Q4_K_M)";
    recommendedLlmUrl = "https://huggingface.co/lmstudio-community/Qwen2.5-7B-Instruct-GGUF";
    recommendedLlmLinkText = "Download GGUF →";
    recommendedLlmDesc =
      "Extremely reliable tool-use and telemetry formatting for standard consumer rigs with >= 6GB VRAM.";
  }
  return /* @__PURE__ */ jsxs("main", {
    className:
      "min-h-screen bg-[#05070A] text-[#E2E4E8] font-mono selection:bg-[#3B82F6]/30 selection:text-white overflow-x-hidden relative flex flex-col justify-between",
    children: [
      /* @__PURE__ */ jsx("div", {
        className:
          "absolute inset-0 bg-[linear-gradient(to_right,#11161D_1px,transparent_1px),linear-gradient(to_bottom,#11161D_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-[0.15] pointer-events-none z-0",
      }),
      /* @__PURE__ */ jsxs("nav", {
        className:
          "border-b border-[#1C2430] bg-[#0B0F14]/90 backdrop-blur sticky top-0 z-50 px-6 py-2.5 flex items-center justify-between z-10 select-none",
        children: [
          /* @__PURE__ */ jsxs("div", {
            className: "flex flex-col",
            children: [
              /* @__PURE__ */ jsxs("div", {
                className: "flex items-center gap-2",
                children: [
                  /* @__PURE__ */ jsx("span", {
                    className: "font-sans font-black italic tracking-tighter text-lg text-white",
                    children: "PIT WALL",
                  }),
                  /* @__PURE__ */ jsx("span", {
                    className:
                      "text-[9px] font-mono tracking-widest text-[#7A828C] bg-[#11161D] px-2 py-0.5 border border-[#1C2430]",
                    children: "v2.10.4-LOCKED",
                  }),
                ],
              }),
              /* @__PURE__ */ jsx("span", {
                className:
                  "text-[8px] font-mono tracking-[0.25em] text-[#7A828C] font-bold uppercase mt-0.5",
                children: "MOTORSPORT TELEMETRY SYSTEM",
              }),
            ],
          }),
          /* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-6",
            children: [
              /* @__PURE__ */ jsxs("div", {
                className:
                  "hidden md:flex items-center gap-3 border border-[#1C2430] bg-[#11161D] px-3.5 py-1",
                children: [
                  /* @__PURE__ */ jsx("span", {
                    className:
                      "text-[8px] font-mono tracking-widest text-[#7A828C] font-bold uppercase",
                    children: "BRIDGE PORT",
                  }),
                  /* @__PURE__ */ jsx("span", {
                    className: "text-[9px] font-mono text-[#3B82F6] font-bold tracking-wider",
                    children: "ws://127.0.0.1:3001",
                  }),
                ],
              }),
              /* @__PURE__ */ jsxs("div", {
                className:
                  "border border-[#00D17F]/20 bg-[#00D17F]/5 px-3.5 py-1 flex items-center gap-2",
                children: [
                  /* @__PURE__ */ jsx("span", {
                    className:
                      "text-[8px] font-mono tracking-widest text-[#7A828C] uppercase font-bold",
                    children: "SYS STATUS",
                  }),
                  /* @__PURE__ */ jsxs("span", {
                    className: "flex items-center gap-1.5",
                    children: [
                      /* @__PURE__ */ jsx("span", {
                        className: `h-1.5 w-1.5 rounded-full bg-[#00D17F] shadow-[0_0_8px_#00D17F] ${pulse ? "animate-ping" : ""}`,
                      }),
                      /* @__PURE__ */ jsx("span", {
                        className: "text-[8px] font-mono text-[#00D17F] font-black tracking-widest",
                        children: "OPERATIONAL",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      /* @__PURE__ */ jsx("section", {
        className: "w-full max-w-none px-4 md:px-12 lg:px-16 pt-6 relative z-10 select-none",
        children: isElectron
          ? /* @__PURE__ */ jsxs("div", {
              className:
                "border border-[#1C2430] bg-[#0B0F14] overflow-hidden rounded-sm flex flex-col lg:flex-row items-stretch gap-6 p-6 md:p-8 relative",
              children: [
                /* @__PURE__ */ jsx("div", {
                  className:
                    "absolute top-0 right-0 w-80 h-80 bg-[#3B82F6] opacity-[0.06] rounded-full blur-[100px] pointer-events-none",
                }),
                /* @__PURE__ */ jsx("div", {
                  className:
                    "absolute bottom-0 left-0 w-80 h-80 bg-[#00D17F] opacity-[0.04] rounded-full blur-[100px] pointer-events-none",
                }),
                /* @__PURE__ */ jsxs("div", {
                  className: "flex-1 flex flex-col items-start justify-between gap-4",
                  children: [
                    /* @__PURE__ */ jsxs("div", {
                      className: "flex flex-col gap-2",
                      children: [
                        /* @__PURE__ */ jsxs("div", {
                          className: "flex items-center gap-2",
                          children: [
                            /* @__PURE__ */ jsx("span", {
                              className:
                                "text-[9px] font-mono tracking-widest text-[#3B82F6] bg-[#3B82F6]/10 border border-[#3B82F6]/20 px-2 py-0.5 font-bold uppercase",
                              children: "Workstation Active",
                            }),
                            /* @__PURE__ */ jsxs("span", {
                              className:
                                "text-[9px] font-mono tracking-widest text-[#7A828C] bg-[#11161D] px-2 py-0.5 border border-[#1C2430]",
                              children: ["Desktop Suite v", manifest?.appVersion ?? "1.2.3-alpha"],
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxs("h1", {
                          className:
                            "text-3xl font-extrabold tracking-tight text-white uppercase font-sans mt-1",
                          children: [
                            "Pit Wall ",
                            /* @__PURE__ */ jsx("span", {
                              className:
                                activeGame === "assettocorsa" ? "text-[#00D17F]" : "text-[#3B82F6]",
                              children: "Workstation",
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsx("p", {
                          className:
                            "text-[10px] text-[#7A828C] leading-relaxed uppercase max-w-lg mt-1",
                          children:
                            activeGame === "assettocorsa"
                              ? /* @__PURE__ */ jsxs(Fragment, {
                                  children: [
                                    "Race engineering command center. Streaming deterministic 60Hz live ",
                                    /* @__PURE__ */ jsx("span", {
                                      className: "text-[#00D17F]",
                                      children: "Assetto Corsa",
                                    }),
                                    " shared memory telemetry, processing observer loops, and running latent Bayesian chassis degradation estimators.",
                                  ],
                                })
                              : /* @__PURE__ */ jsxs(Fragment, {
                                  children: [
                                    "Race engineering command center. Streaming deterministic 60Hz live ",
                                    /* @__PURE__ */ jsx("span", {
                                      className: "text-[#3B82F6]",
                                      children: "iRacing",
                                    }),
                                    " telemetry, processing observer loops, and running latent Bayesian chassis degradation estimators.",
                                  ],
                                }),
                        }),
                        /* @__PURE__ */ jsxs("div", {
                          className:
                            "mt-3 border border-[#1C2430] bg-[#05070A]/80 p-1 flex items-center gap-1.5 rounded relative z-10 w-full max-w-[340px] shadow-inner select-none backdrop-blur-md",
                          children: [
                            /* @__PURE__ */ jsxs("button", {
                              type: "button",
                              onClick: () => handleGameSelect("iracing"),
                              className: `flex-1 py-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-center transition-all duration-300 rounded-sm flex items-center justify-center gap-2 ${activeGame === "iracing" ? "bg-[#3B82F6] text-white shadow-[0_0_15px_rgba(59,130,246,0.35)] scale-[1.02]" : "text-[#7A828C] hover:text-white hover:bg-[#11161D] bg-transparent"}`,
                              children: [
                                /* @__PURE__ */ jsx("span", {
                                  className: `h-1.5 w-1.5 rounded-full ${activeGame === "iracing" ? "bg-white animate-pulse" : "bg-[#7A828C]"}`,
                                }),
                                "iRacing Simulator",
                              ],
                            }),
                            /* @__PURE__ */ jsxs("button", {
                              type: "button",
                              onClick: () => handleGameSelect("assettocorsa"),
                              className: `flex-1 py-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-center transition-all duration-300 rounded-sm flex items-center justify-center gap-2 ${activeGame === "assettocorsa" ? "bg-[#00D17F] text-zinc-950 shadow-[0_0_15px_rgba(0,209,127,0.35)] scale-[1.02] font-black" : "text-[#7A828C] hover:text-white hover:bg-[#11161D] bg-transparent"}`,
                              children: [
                                /* @__PURE__ */ jsx("span", {
                                  className: `h-1.5 w-1.5 rounded-full ${activeGame === "assettocorsa" ? "bg-zinc-950 animate-pulse" : "bg-[#7A828C]"}`,
                                }),
                                "Assetto Corsa",
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxs("div", {
                      className: "mt-4 flex flex-wrap gap-3",
                      children: [
                        /* @__PURE__ */ jsxs(Link, {
                          to: "/live",
                          className:
                            "inline-flex items-center justify-center gap-2 rounded-sm bg-[#00D17F] hover:bg-[#00B86F] px-6 py-3 font-mono text-xs uppercase font-bold text-zinc-950 transition-all shadow-[0_0_20px_rgba(0,209,127,0.25)] hover:scale-105 cursor-pointer",
                          children: [
                            /* @__PURE__ */ jsx(Gauge, { className: "h-4 w-4" }),
                            "Launch Live Dashboard",
                          ],
                        }),
                        /* @__PURE__ */ jsxs(Link, {
                          to: "/sessions",
                          className:
                            "inline-flex items-center justify-center gap-2 rounded-sm border border-[#1C2430] bg-[#11161D] hover:bg-[#161C24] px-5 py-3 font-mono text-xs uppercase font-bold text-white transition-all cursor-pointer",
                          children: [
                            /* @__PURE__ */ jsx(LineChart, { className: "h-4 w-4 text-[#3B82F6]" }),
                            "Open Analysis Workbench",
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                /* @__PURE__ */ jsxs("div", {
                  className:
                    "hidden lg:block lg:w-[260px] xl:w-[320px] relative rounded-sm border border-[#1C2430] overflow-hidden bg-[#05070A] group shadow-xl flex-shrink-0",
                  children: [
                    /* @__PURE__ */ jsx("div", {
                      className:
                        "absolute inset-0 bg-gradient-to-tr from-[#3B82F6]/10 via-transparent to-[#00D17F]/10 opacity-30 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                    }),
                    /* @__PURE__ */ jsx("img", {
                      src: "/images/hero.png",
                      alt: "Pit Wall Workstation",
                      className:
                        "w-full h-full object-cover transform group-hover:scale-[1.02] transition-transform duration-500",
                    }),
                  ],
                }),
                /* @__PURE__ */ jsxs("div", {
                  className:
                    "flex-1 border border-[#1C2430] bg-[#05070A]/85 backdrop-blur-sm p-5 flex flex-col justify-between rounded-sm relative overflow-hidden group",
                  children: [
                    /* @__PURE__ */ jsx("div", {
                      className:
                        "absolute inset-0 bg-[linear-gradient(to_right,#11161D_1px,transparent_1px),linear-gradient(to_bottom,#11161D_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-20 pointer-events-none",
                    }),
                    /* @__PURE__ */ jsxs("div", {
                      className:
                        "relative z-10 flex items-center justify-between border-b border-[#1C2430] pb-2.5 mb-4",
                      children: [
                        /* @__PURE__ */ jsxs("span", {
                          className:
                            "text-[9px] font-mono tracking-widest text-[#7A828C] font-bold uppercase flex items-center gap-1.5",
                          children: [
                            /* @__PURE__ */ jsx(Cpu, { className: "h-3.5 w-3.5 text-[#3B82F6]" }),
                            "LOCAL HARDWARE & DAEMON STATUS",
                          ],
                        }),
                        /* @__PURE__ */ jsxs("span", {
                          className:
                            "text-[9px] font-mono text-[#00D17F] font-bold tracking-wider animate-pulse flex items-center gap-1",
                          children: [
                            /* @__PURE__ */ jsx("span", {
                              className: "h-1 w-1 bg-[#00D17F] rounded-full",
                            }),
                            "MONITORING",
                          ],
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxs("div", {
                      className:
                        "relative z-10 grid grid-cols-2 gap-4 text-[10px] uppercase font-bold tracking-wide",
                      children: [
                        /* @__PURE__ */ jsxs("div", {
                          className: "flex flex-col gap-1 border-r border-[#1C2430]/40 pr-2",
                          children: [
                            /* @__PURE__ */ jsx("span", {
                              className: "text-[#7A828C] text-[8px] font-mono tracking-wider",
                              children: "HOST CLIENT",
                            }),
                            /* @__PURE__ */ jsx("span", {
                              className:
                                "text-white truncate font-sans text-xs italic tracking-tight font-extrabold",
                              children: manifest?.hostname ?? "WORKSTATION-PC",
                            }),
                            /* @__PURE__ */ jsxs("span", {
                              className: "text-[#7A828C] text-[8px]",
                              children: [
                                "OS: ",
                                manifest?.platform ?? "win32",
                                " · ",
                                manifest?.arch ?? "x64",
                              ],
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxs("div", {
                          className: "flex flex-col gap-1 pl-2",
                          children: [
                            /* @__PURE__ */ jsx("span", {
                              className: "text-[#7A828C] text-[8px] font-mono tracking-wider",
                              children: "CPU CORES",
                            }),
                            /* @__PURE__ */ jsx("span", {
                              className: "text-white truncate text-xs font-mono",
                              children: manifest?.cpuModel
                                ? manifest.cpuModel.replace(/\(R\)|\(TM\)/g, "").trim()
                                : "Detecting...",
                            }),
                            /* @__PURE__ */ jsxs("span", {
                              className: "text-[#7A828C] text-[8px]",
                              children: ["LOGICAL CORES: ", manifest?.cpuCores ?? 8],
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxs("div", {
                          className:
                            "flex flex-col gap-1 border-r border-[#1C2430]/40 pr-2 pt-2 border-t border-[#1C2430]/40",
                          children: [
                            /* @__PURE__ */ jsx("span", {
                              className: "text-[#7A828C] text-[8px] font-mono tracking-wider",
                              children: "RAM ALLOCATION",
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className:
                                "flex items-center justify-between text-white text-xs font-mono",
                              children: [
                                /* @__PURE__ */ jsx("span", {
                                  children: manifest
                                    ? `${(manifest.totalRamGb - manifest.freeRamGb).toFixed(1)} GB`
                                    : "0.0 GB",
                                }),
                                /* @__PURE__ */ jsxs("span", {
                                  className: "text-[#7A828C]",
                                  children: ["/ ", manifest?.totalRamGb ?? "16.0", " GB"],
                                }),
                              ],
                            }),
                            /* @__PURE__ */ jsx("div", {
                              className:
                                "w-full bg-[#11161D] h-1 rounded-full overflow-hidden mt-0.5",
                              children: /* @__PURE__ */ jsx("div", {
                                className: "bg-[#3B82F6] h-full transition-all duration-500",
                                style: {
                                  width: manifest
                                    ? `${((manifest.totalRamGb - manifest.freeRamGb) / manifest.totalRamGb) * 100}%`
                                    : "30%",
                                },
                              }),
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxs("div", {
                          className: "flex flex-col gap-1 pl-2 pt-2 border-t border-[#1C2430]/40",
                          children: [
                            /* @__PURE__ */ jsx("span", {
                              className: "text-[#7A828C] text-[8px] font-mono tracking-wider",
                              children: "PCIe GPU & VRAM",
                            }),
                            /* @__PURE__ */ jsx("span", {
                              className:
                                "text-white truncate font-sans text-xs italic tracking-tight font-extrabold",
                              children: manifest?.gpuModel ?? "Detecting GPU...",
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className:
                                "flex items-center justify-between text-white text-[9px] font-mono",
                              children: [
                                /* @__PURE__ */ jsx("span", {
                                  className: "text-[#7A828C]",
                                  children: "VRAM:",
                                }),
                                /* @__PURE__ */ jsx("span", {
                                  className: "font-bold text-[#00D17F]",
                                  children: manifest?.vramGb
                                    ? `${parseFloat(manifest.vramGb).toFixed(1)} GB`
                                    : "0.0 GB",
                                }),
                              ],
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxs("div", {
                          className:
                            "flex flex-col gap-1 border-r border-[#1C2430]/40 pr-2 pt-2 border-t border-[#1C2430]/40",
                          children: [
                            /* @__PURE__ */ jsx("span", {
                              className: "text-[#7A828C] text-[8px] font-mono tracking-wider",
                              children: "SUPERVISOR DAEMONS",
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className: "flex flex-col gap-1 text-[9px] font-mono mt-0.5",
                              children: [
                                /* @__PURE__ */ jsxs("div", {
                                  className: "flex items-center justify-between",
                                  children: [
                                    /* @__PURE__ */ jsx("span", {
                                      className: "text-white",
                                      children: "MONGO DATABASE:",
                                    }),
                                    /* @__PURE__ */ jsx("span", {
                                      className:
                                        manifest?.mongoStatus === "active"
                                          ? "text-[#00D17F]"
                                          : "text-[#FF4D4D]",
                                      children:
                                        manifest?.mongoStatus === "active" ? "ACTIVE" : "INACTIVE",
                                    }),
                                  ],
                                }),
                                /* @__PURE__ */ jsxs("div", {
                                  className: "flex items-center justify-between",
                                  children: [
                                    /* @__PURE__ */ jsx("span", {
                                      className: "text-white",
                                      children: "CO-PILOT AI:",
                                    }),
                                    /* @__PURE__ */ jsx("span", {
                                      className: "text-[#3B82F6]",
                                      children: manifest?.aiMode
                                        ? String(manifest.aiMode).toUpperCase()
                                        : "CLOUD",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxs("div", {
                          className: "flex flex-col gap-1 pl-2 pt-2 border-t border-[#1C2430]/40",
                          children: [
                            /* @__PURE__ */ jsx("span", {
                              className: "text-[#7A828C] text-[8px] font-mono tracking-wider",
                              children: "RECOMMENDED LOCAL LLM",
                            }),
                            /* @__PURE__ */ jsx("span", {
                              className: "text-[#3B82F6] truncate text-xs font-mono font-bold",
                              children: recommendedLlmName,
                            }),
                            recommendedLlmUrl === "#"
                              ? /* @__PURE__ */ jsx("button", {
                                  onClick: openSettings,
                                  className:
                                    "text-[#00D17F] hover:underline text-[8px] tracking-wider uppercase font-bold mt-0.5 text-left bg-transparent border-none p-0 cursor-pointer",
                                  children: recommendedLlmLinkText,
                                })
                              : /* @__PURE__ */ jsx("a", {
                                  href: recommendedLlmUrl,
                                  target: "_blank",
                                  rel: "noopener noreferrer",
                                  className:
                                    "text-[#00D17F] hover:underline text-[8px] tracking-wider uppercase font-bold mt-0.5",
                                  children: recommendedLlmLinkText,
                                }),
                          ],
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxs("div", {
                      className:
                        "relative z-10 border-t border-[#1C2430]/40 pt-2 mt-3 text-[8.5px] font-mono text-[#7A828C] uppercase leading-relaxed flex flex-col gap-1.5",
                      children: [
                        /* @__PURE__ */ jsxs("div", {
                          children: [
                            /* @__PURE__ */ jsx("span", {
                              className: "text-[#FFB800] font-bold",
                              children: "Safe Model Guideline:",
                            }),
                            " ",
                            recommendedLlmDesc,
                          ],
                        }),
                        /* @__PURE__ */ jsxs("div", {
                          className:
                            "text-[8px] text-[#7A828C]/80 normal-case border-t border-[#1C2430]/25 pt-1.5 mt-0.5 font-sans leading-relaxed",
                          children: [
                            /* @__PURE__ */ jsx("span", {
                              className: "text-[#3B82F6] font-bold font-mono uppercase",
                              children: "Advanced Users:",
                            }),
                            " Advanced LLM users may find a better model. Just remember to update the model name you have currently loaded in LM Studio inside the LM Studio settings to match.",
                          ],
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxs("div", {
                      className:
                        "relative z-10 flex items-center justify-between border-t border-[#1C2430]/40 pt-3 mt-4 text-[9px] font-mono",
                      children: [
                        /* @__PURE__ */ jsxs("div", {
                          className: "flex items-center gap-4",
                          children: [
                            /* @__PURE__ */ jsxs("div", {
                              className: "flex items-center gap-1",
                              children: [
                                /* @__PURE__ */ jsx("span", {
                                  className: "text-[#7A828C]",
                                  children: "BRIDGE:",
                                }),
                                /* @__PURE__ */ jsx("span", {
                                  className:
                                    manifest?.bridgeStatus === "running"
                                      ? "text-[#00D17F]"
                                      : manifest?.bridgeStatus === "crashed"
                                        ? "text-[#FF4D4D]"
                                        : "text-[#FFB800]",
                                  children: manifest?.bridgeStatus
                                    ? String(manifest.bridgeStatus).toUpperCase()
                                    : "CONNECTING",
                                }),
                              ],
                            }),
                            /* @__PURE__ */ jsxs("div", {
                              className: "flex items-center gap-1",
                              children: [
                                /* @__PURE__ */ jsx("span", {
                                  className: "text-[#7A828C]",
                                  children: "UPTIME:",
                                }),
                                /* @__PURE__ */ jsx("span", {
                                  className: "text-white",
                                  children: manifest?.uptimeSec
                                    ? `${Math.floor(manifest.uptimeSec / 3600)}h ${Math.floor((manifest.uptimeSec % 3600) / 60)}m`
                                    : "0h 0m",
                                }),
                              ],
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsx("span", {
                          className: "text-[#7A828C] tracking-widest",
                          children: "PORT 3001 ACTIVE",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            })
          : /* @__PURE__ */ jsxs("div", {
              className:
                "border border-[#1C2430] bg-[#0B0F14] overflow-hidden rounded-sm flex flex-col md:flex-row items-center gap-6 p-6 md:p-8 relative",
              children: [
                /* @__PURE__ */ jsx("div", {
                  className:
                    "absolute top-0 right-0 w-80 h-80 bg-[#3B82F6] opacity-[0.06] rounded-full blur-[100px] pointer-events-none",
                }),
                /* @__PURE__ */ jsx("div", {
                  className:
                    "absolute bottom-0 left-0 w-80 h-80 bg-[#00D17F] opacity-[0.04] rounded-full blur-[100px] pointer-events-none",
                }),
                /* @__PURE__ */ jsxs("div", {
                  className: "flex-1 flex flex-col items-start gap-4",
                  children: [
                    /* @__PURE__ */ jsxs("div", {
                      className: "flex items-center gap-2",
                      children: [
                        /* @__PURE__ */ jsx("span", {
                          className:
                            "text-[9px] font-mono tracking-widest text-[#00D17F] bg-[#00D17F]/10 border border-[#00D17F]/20 px-2 py-0.5 font-bold uppercase",
                          children: "Now Live",
                        }),
                        /* @__PURE__ */ jsx("span", {
                          className:
                            "text-[9px] font-mono tracking-widest text-[#7A828C] bg-[#11161D] px-2 py-0.5 border border-[#1C2430]",
                          children: "Desktop Suite v1.2.0",
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxs("h1", {
                      className:
                        "text-3xl font-extrabold tracking-tight text-white uppercase font-sans",
                      children: [
                        "Enter the ",
                        /* @__PURE__ */ jsx("span", {
                          className:
                            activeGame === "assettocorsa" ? "text-[#00D17F]" : "text-[#3B82F6]",
                          children: "Pit Wall",
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsx("p", {
                      className: "text-[10px] text-[#7A828C] leading-relaxed uppercase max-w-lg",
                      children:
                        activeGame === "assettocorsa"
                          ? /* @__PURE__ */ jsxs(Fragment, {
                              children: [
                                "Stream high-fidelity 60Hz live ",
                                /* @__PURE__ */ jsx("span", {
                                  className: "text-[#00D17F]",
                                  children: "Assetto Corsa",
                                }),
                                " telemetry, evaluate AI strategy timelines, analyze driver consistency fingerprints, and configure dampers directly from the pit wall workstation.",
                              ],
                            })
                          : /* @__PURE__ */ jsxs(Fragment, {
                              children: [
                                "Stream high-fidelity 60Hz live ",
                                /* @__PURE__ */ jsx("span", {
                                  className: "text-[#3B82F6]",
                                  children: "iRacing",
                                }),
                                " telemetry, evaluate AI strategy timelines, analyze driver consistency fingerprints, and configure dampers directly from the pit wall workstation.",
                              ],
                            }),
                    }),
                    /* @__PURE__ */ jsxs("div", {
                      className:
                        "mt-1 mb-2 border border-[#1C2430] bg-[#05070A]/80 p-1 flex items-center gap-1.5 rounded relative z-10 w-full max-w-[340px] shadow-inner select-none backdrop-blur-md",
                      children: [
                        /* @__PURE__ */ jsxs("button", {
                          type: "button",
                          onClick: () => handleGameSelect("iracing"),
                          className: `flex-1 py-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-center transition-all duration-300 rounded-sm flex items-center justify-center gap-2 ${activeGame === "iracing" ? "bg-[#3B82F6] text-white shadow-[0_0_15px_rgba(59,130,246,0.35)] scale-[1.02]" : "text-[#7A828C] hover:text-white hover:bg-[#11161D] bg-transparent"}`,
                          children: [
                            /* @__PURE__ */ jsx("span", {
                              className: `h-1.5 w-1.5 rounded-full ${activeGame === "iracing" ? "bg-white animate-pulse" : "bg-[#7A828C]"}`,
                            }),
                            "iRacing Simulator",
                          ],
                        }),
                        /* @__PURE__ */ jsxs("button", {
                          type: "button",
                          onClick: () => handleGameSelect("assettocorsa"),
                          className: `flex-1 py-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-center transition-all duration-300 rounded-sm flex items-center justify-center gap-2 ${activeGame === "assettocorsa" ? "bg-[#00D17F] text-zinc-950 shadow-[0_0_15px_rgba(0,209,127,0.35)] scale-[1.02] font-black" : "text-[#7A828C] hover:text-white hover:bg-[#11161D] bg-transparent"}`,
                          children: [
                            /* @__PURE__ */ jsx("span", {
                              className: `h-1.5 w-1.5 rounded-full ${activeGame === "assettocorsa" ? "bg-zinc-950 animate-pulse" : "bg-[#7A828C]"}`,
                            }),
                            "Assetto Corsa",
                          ],
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxs("div", {
                      className: "mt-2 flex flex-wrap gap-3",
                      children: [
                        /* @__PURE__ */ jsxs(Link, {
                          to: "/live",
                          className:
                            "inline-flex items-center justify-center gap-2 rounded-sm bg-[#00D17F] hover:bg-[#00B86F] px-6 py-3 font-mono text-xs uppercase font-bold text-zinc-950 transition-all shadow-[0_0_20px_rgba(0,209,127,0.25)] hover:scale-105 cursor-pointer",
                          children: [
                            /* @__PURE__ */ jsx(Gauge, { className: "h-4 w-4" }),
                            "Enter Pit Wall",
                          ],
                        }),
                        /* @__PURE__ */ jsxs(Link, {
                          to: "/roadmap",
                          className:
                            "inline-flex items-center justify-center gap-2 rounded-sm border border-[#1C2430] bg-[#11161D] hover:bg-[#161C24] px-5 py-3 font-mono text-xs uppercase font-bold text-white transition-all cursor-pointer",
                          children: [
                            /* @__PURE__ */ jsx(Rocket, { className: "h-4 w-4" }),
                            "Get Desktop Installer",
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                /* @__PURE__ */ jsxs("div", {
                  className:
                    "flex-1 w-full max-w-[650px] relative rounded-sm border border-[#1C2430] overflow-hidden bg-[#05070A] group shadow-2xl",
                  children: [
                    /* @__PURE__ */ jsx("div", {
                      className:
                        "absolute inset-0 bg-gradient-to-tr from-[#3B82F6]/20 via-transparent to-[#00D17F]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                    }),
                    /* @__PURE__ */ jsx("img", {
                      src: "/images/hero.png",
                      alt: "Pit Wall Telemetry Dashboard",
                      className:
                        "w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-500",
                    }),
                  ],
                }),
              ],
            }),
      }),
      /* @__PURE__ */ jsx("section", {
        className: "flex-1 w-full max-w-none px-4 md:px-12 lg:px-16 py-6 relative z-10",
        children: /* @__PURE__ */ jsxs("div", {
          className: "flex flex-col gap-4 w-full",
          children: [
            /* @__PURE__ */ jsxs("div", {
              className:
                "border border-[#1C2430] bg-[#0B0F14] px-4 py-2 text-[10px] tracking-widest text-[#7A828C] uppercase font-black flex items-center gap-2",
              children: [
                /* @__PURE__ */ jsx(Sliders, { className: "h-3.5 w-3.5 text-[#3B82F6]" }),
                "Telemetry Workstation Console Panels",
              ],
            }),
            /* @__PURE__ */ jsxs("div", {
              className:
                "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 flex-1",
              children: [
                /* @__PURE__ */ jsxs(Link, {
                  to: "/live",
                  className:
                    "border border-[#1C2430] bg-[#11161D] hover:bg-[#161C24] hover:border-[#3B82F6]/50 p-4 transition-all duration-200 group flex flex-col justify-between cursor-pointer",
                  children: [
                    /* @__PURE__ */ jsxs("div", {
                      className: "flex items-center justify-between",
                      children: [
                        /* @__PURE__ */ jsx("span", {
                          className:
                            "p-1.5 rounded border border-[#1C2430] bg-[#0B0F14] text-[#3B82F6]",
                          children: /* @__PURE__ */ jsx(Gauge, { className: "h-5 w-5" }),
                        }),
                        /* @__PURE__ */ jsx("span", {
                          className: `text-[8px] font-bold tracking-widest px-2 py-0.5 border ${bridgeConnected ? "border-[#00D17F]/30 bg-[#00D17F]/10 text-[#00D17F]" : "border-[#7A828C]/30 bg-[#05070A] text-[#7A828C]"}`,
                          children: bridgeConnected ? "ACTIVE" : "SIM READY",
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxs("div", {
                      className: "mt-3",
                      children: [
                        /* @__PURE__ */ jsx("h3", {
                          className: "text-xs font-bold text-white tracking-widest uppercase mb-1",
                          children: "LIVE TELEMETRY COMMAND",
                        }),
                        /* @__PURE__ */ jsx("p", {
                          className: "text-[10px] text-[#7A828C] leading-snug uppercase",
                          children:
                            "Launch the 60Hz real-time telemetry center. Displays sector splits, ERS deployment, tyres, and rolling graphs.",
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxs("span", {
                      className:
                        "text-[9px] font-bold text-[#3B82F6] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 mt-2",
                      children: [
                        "RUN LIVE CONSOLE ",
                        /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3" }),
                      ],
                    }),
                  ],
                }),
                /* @__PURE__ */ jsxs(Link, {
                  to: "/team",
                  className:
                    "border border-[#1C2430] bg-[#11161D] hover:bg-[#161C24] hover:border-[#3B82F6]/50 p-4 transition-all duration-200 group flex flex-col justify-between cursor-pointer",
                  children: [
                    /* @__PURE__ */ jsxs("div", {
                      className: "flex items-center justify-between",
                      children: [
                        /* @__PURE__ */ jsx("span", {
                          className:
                            "p-1.5 rounded border border-[#1C2430] bg-[#0B0F14] text-[#3B82F6]",
                          children: /* @__PURE__ */ jsx(Users, { className: "h-5 w-5" }),
                        }),
                        /* @__PURE__ */ jsx("span", {
                          className:
                            "text-[8px] font-bold tracking-widest px-2 py-0.5 border border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#3B82F6]",
                          children: "MULTI-DRIVER",
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxs("div", {
                      className: "mt-3",
                      children: [
                        /* @__PURE__ */ jsx("h3", {
                          className: "text-xs font-bold text-white tracking-widest uppercase mb-1",
                          children: "TEAM STRATEGY COMMAND",
                        }),
                        /* @__PURE__ */ jsx("p", {
                          className: "text-[10px] text-[#7A828C] leading-snug uppercase",
                          children:
                            "Endurance Strategy Operations Center. Coordinate driver stints, compute Le Mans fuel plans, and analyze live team streams.",
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxs("span", {
                      className:
                        "text-[9px] font-bold text-[#3B82F6] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 mt-2",
                      children: [
                        "PLAN TEAM STRATEGY ",
                        /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3" }),
                      ],
                    }),
                  ],
                }),
                /* @__PURE__ */ jsxs(Link, {
                  to: "/sessions",
                  className:
                    "border border-[#1C2430] bg-[#11161D] hover:bg-[#161C24] hover:border-[#3B82F6]/50 p-4 transition-all duration-200 group flex flex-col justify-between cursor-pointer",
                  children: [
                    /* @__PURE__ */ jsxs("div", {
                      className: "flex items-center justify-between",
                      children: [
                        /* @__PURE__ */ jsx("span", {
                          className:
                            "p-1.5 rounded border border-[#1C2430] bg-[#0B0F14] text-[#3B82F6]",
                          children: /* @__PURE__ */ jsx(LineChart, { className: "h-5 w-5" }),
                        }),
                        /* @__PURE__ */ jsx("span", {
                          className:
                            "text-[8px] font-bold tracking-widest px-2 py-0.5 border border-[#1C2430] bg-[#05070A] text-[#7A828C]",
                          children: ".IBT PARSER",
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxs("div", {
                      className: "mt-3",
                      children: [
                        /* @__PURE__ */ jsx("h3", {
                          className: "text-xs font-bold text-white tracking-widest uppercase mb-1",
                          children: "ANALYSIS WORKBENCH",
                        }),
                        /* @__PURE__ */ jsx("p", {
                          className: "text-[10px] text-[#7A828C] leading-snug uppercase",
                          children:
                            "Analyze saved iRacing .ibt files. Stacked synchronized traces, G-G diagram, sector overlays, and math channels.",
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxs("span", {
                      className:
                        "text-[9px] font-bold text-[#3B82F6] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 mt-2",
                      children: [
                        "OPEN WORKBENCH ",
                        /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3" }),
                      ],
                    }),
                  ],
                }),
                /* @__PURE__ */ jsxs(Link, {
                  to: "/ai-engineer",
                  className:
                    "border border-[#1C2430] bg-[#11161D] hover:bg-[#161C24] hover:border-[#8B5CF6]/50 p-4 transition-all duration-200 group flex flex-col justify-between cursor-pointer",
                  children: [
                    /* @__PURE__ */ jsxs("div", {
                      className: "flex items-center justify-between",
                      children: [
                        /* @__PURE__ */ jsx("span", {
                          className:
                            "p-1.5 rounded border border-[#1C2430] bg-[#0B0F14] text-[#8B5CF6]",
                          children: /* @__PURE__ */ jsx(Terminal, { className: "h-5 w-5" }),
                        }),
                        /* @__PURE__ */ jsx("span", {
                          className:
                            "text-[8px] font-bold tracking-widest px-2 py-0.5 border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#8B5CF6]",
                          children: "Tactical AI",
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxs("div", {
                      className: "mt-3",
                      children: [
                        /* @__PURE__ */ jsx("h3", {
                          className: "text-xs font-bold text-white tracking-widest uppercase mb-1",
                          children: "AI ENGINEER TERMINAL",
                        }),
                        /* @__PURE__ */ jsx("p", {
                          className: "text-[10px] text-[#7A828C] leading-snug uppercase",
                          children:
                            "Motorsport-grade engineering console. Specific spring, damper, and tire pressure adjustments in race-team tone.",
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxs("span", {
                      className:
                        "text-[9px] font-bold text-[#8B5CF6] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 mt-2",
                      children: [
                        "BOOT TERMINAL ",
                        /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3" }),
                      ],
                    }),
                  ],
                }),
                /* @__PURE__ */ jsxs("a", {
                  href: "#onboarding-tutorial",
                  className:
                    "border border-[#1C2430] bg-[#11161D] hover:bg-[#161C24] p-4 transition-all duration-200 group flex flex-col justify-between cursor-pointer",
                  children: [
                    /* @__PURE__ */ jsxs("div", {
                      className: "flex items-center justify-between",
                      children: [
                        /* @__PURE__ */ jsx("span", {
                          className:
                            "p-1.5 rounded border border-[#1C2430] bg-[#0B0F14] text-[#FFB800]",
                          children: /* @__PURE__ */ jsx(GraduationCap, { className: "h-5 w-5" }),
                        }),
                        /* @__PURE__ */ jsx("span", {
                          className:
                            "text-[8px] font-bold tracking-widest px-2 py-0.5 border border-[#1C2430] bg-[#05070A] text-[#7A828C]",
                          children: "GUIDE",
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxs("div", {
                      className: "mt-3",
                      children: [
                        /* @__PURE__ */ jsx("h3", {
                          className: "text-xs font-bold text-white tracking-widest uppercase mb-1",
                          children: "INTERACTIVE TUTORIAL",
                        }),
                        /* @__PURE__ */ jsx("p", {
                          className: "text-[10px] text-[#7A828C] leading-snug uppercase",
                          children:
                            "Learn to seed driver fingerprints, parse local .olap/.blap logs, and configure local bridge port settings.",
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxs("span", {
                      className:
                        "text-[9px] font-bold text-[#FFB800] inline-flex items-center gap-1 mt-2",
                      children: [
                        "VIEW ONBOARDING GUIDE ",
                        /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3" }),
                      ],
                    }),
                  ],
                }),
                /* @__PURE__ */ jsxs(Link, {
                  to: "/how-it-works",
                  className:
                    "border border-[#1C2430] bg-[#11161D] hover:bg-[#161C24] p-4 transition-all duration-200 group flex flex-col justify-between cursor-pointer",
                  children: [
                    /* @__PURE__ */ jsxs("div", {
                      className: "flex items-center justify-between",
                      children: [
                        /* @__PURE__ */ jsx("span", {
                          className:
                            "p-1.5 rounded border border-[#1C2430] bg-[#0B0F14] text-[#E2E4E8]",
                          children: /* @__PURE__ */ jsx(BookOpen, { className: "h-5 w-5" }),
                        }),
                        /* @__PURE__ */ jsx("span", {
                          className:
                            "text-[8px] font-bold tracking-widest px-2 py-0.5 border border-[#1C2430] bg-[#05070A] text-[#7A828C]",
                          children: "DOCS",
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxs("div", {
                      className: "mt-3",
                      children: [
                        /* @__PURE__ */ jsx("h3", {
                          className: "text-xs font-bold text-white tracking-widest uppercase mb-1",
                          children: "TECHNICAL DOCUMENTATION",
                        }),
                        /* @__PURE__ */ jsx("p", {
                          className: "text-[10px] text-[#7A828C] leading-snug uppercase",
                          children:
                            "Complete manual explaining telemetry structures, math channel expressions, and sector delta algorithms.",
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxs("span", {
                      className:
                        "text-[9px] font-bold text-white inline-flex items-center gap-1 mt-2",
                      children: [
                        "READ MANUAL ",
                        /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3" }),
                      ],
                    }),
                  ],
                }),
                /* @__PURE__ */ jsxs(Link, {
                  to: "/roadmap",
                  className:
                    "border border-[#1C2430] bg-[#11161D] hover:bg-[#161C24] p-4 transition-all duration-200 group flex flex-col justify-between cursor-pointer",
                  children: [
                    /* @__PURE__ */ jsxs("div", {
                      className: "flex items-center justify-between",
                      children: [
                        /* @__PURE__ */ jsx("span", {
                          className:
                            "p-1.5 rounded border border-[#1C2430] bg-[#0B0F14] text-[#FF4D4D]",
                          children: /* @__PURE__ */ jsx(Rocket, { className: "h-5 w-5" }),
                        }),
                        /* @__PURE__ */ jsx("span", {
                          className:
                            "text-[8px] font-bold tracking-widest px-2 py-0.5 border border-[#1C2430] bg-[#05070A] text-[#7A828C]",
                          children: "TIMELINE",
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxs("div", {
                      className: "mt-3",
                      children: [
                        /* @__PURE__ */ jsx("h3", {
                          className: "text-xs font-bold text-white tracking-widest uppercase mb-1",
                          children: "DEVELOPMENT ROADMAP",
                        }),
                        /* @__PURE__ */ jsx("p", {
                          className: "text-[10px] text-[#7A828C] leading-snug uppercase",
                          children:
                            "Pit Wall development timeline. Check shipped milestones, active beta-testing status, and upcoming Monetization phases.",
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxs("span", {
                      className:
                        "text-[9px] font-bold text-[#FF4D4D] inline-flex items-center gap-1 mt-2",
                      children: [
                        "VIEW ROADMAP ",
                        /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3" }),
                      ],
                    }),
                  ],
                }),
                /* @__PURE__ */ jsxs("button", {
                  onClick: openSettings,
                  className:
                    "border border-[#1C2430] bg-[#11161D] hover:bg-[#161C24] p-4 transition-all duration-200 group flex flex-col justify-between text-left cursor-pointer",
                  children: [
                    /* @__PURE__ */ jsxs("div", {
                      className: "flex items-center justify-between",
                      children: [
                        /* @__PURE__ */ jsx("span", {
                          className:
                            "p-1.5 rounded border border-[#1C2430] bg-[#0B0F14] text-[#3B82F6]",
                          children: /* @__PURE__ */ jsx(Settings, { className: "h-5 w-5" }),
                        }),
                        /* @__PURE__ */ jsx("span", {
                          className:
                            "text-[8px] font-bold tracking-widest px-2 py-0.5 border border-[#1C2430] bg-[#05070A] text-[#7A828C]",
                          children: "Ctrl + ,",
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxs("div", {
                      className: "mt-3",
                      children: [
                        /* @__PURE__ */ jsx("h3", {
                          className: "text-xs font-bold text-white tracking-widest uppercase mb-1",
                          children: "SYSTEM SETTINGS",
                        }),
                        /* @__PURE__ */ jsx("p", {
                          className: "text-[10px] text-[#7A828C] leading-snug uppercase",
                          children:
                            "Configure local MongoDB directories, local LLM endpoints, and hardware ID license keys.",
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxs("span", {
                      className:
                        "text-[9px] font-bold text-[#3B82F6] inline-flex items-center gap-1 mt-2",
                      children: [
                        "OPEN PREFERENCES ",
                        /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3" }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            /* @__PURE__ */ jsxs("div", {
              className: "grid grid-cols-1 md:grid-cols-2 gap-4 mt-2",
              children: [
                /* @__PURE__ */ jsxs(Link, {
                  to: "/driver-bridge",
                  className:
                    "border border-[#1C2430] bg-[#00D17F]/5 hover:bg-[#00D17F]/10 hover:border-[#00D17F]/50 p-4 text-[10px] uppercase tracking-widest flex items-center justify-between border-dashed cursor-pointer",
                  children: [
                    /* @__PURE__ */ jsxs("span", {
                      className: "flex items-center gap-2 text-white font-bold",
                      children: [
                        /* @__PURE__ */ jsx(Gauge, { className: "h-4 w-4 text-[#00D17F]" }),
                        "DRIVER COCKPIT HUD GATEWAY",
                      ],
                    }),
                    /* @__PURE__ */ jsx("span", {
                      className: "text-[#00D17F] hover:underline font-bold",
                      children: "LAUNCH COCKPIT HUD →",
                    }),
                  ],
                }),
                /* @__PURE__ */ jsxs(Link, {
                  to: "/auth",
                  className:
                    "border border-[#1C2430] bg-[#0B0F14] hover:bg-[#11161D] p-4 text-[10px] uppercase tracking-widest flex items-center justify-between border-dashed cursor-pointer",
                  children: [
                    /* @__PURE__ */ jsxs("span", {
                      className: "flex items-center gap-2 text-white font-bold",
                      children: [
                        /* @__PURE__ */ jsx(LogIn, { className: "h-4 w-4 text-[#3B82F6]" }),
                        user ? "Active Account Profile Linked" : "ENGINEER LOGIN GATEWAY",
                      ],
                    }),
                    /* @__PURE__ */ jsx("span", {
                      className: "text-[#3B82F6] hover:underline",
                      children: user ? "View profile →" : "Sign in to save records →",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      }),
      user &&
        recentSessions.length > 0 &&
        /* @__PURE__ */ jsx("section", {
          className: "w-full max-w-none px-4 md:px-12 lg:px-16 py-2 z-10 select-none",
          children: /* @__PURE__ */ jsxs("div", {
            className: "border border-[#1C2430] bg-[#0B0F14] p-4",
            children: [
              /* @__PURE__ */ jsx("h3", {
                className:
                  "text-[9px] font-mono uppercase tracking-widest text-[#7A828C] border-b border-[#1C2430] pb-2 mb-3",
                children: "RECENTLY PARSED TELEMETRY LOGS (.IBT RECONSTRUCTION)",
              }),
              /* @__PURE__ */ jsx("div", {
                className: "grid gap-3 md:grid-cols-3",
                children: recentSessions.map((s) =>
                  /* @__PURE__ */ jsxs(
                    Link,
                    {
                      to: "/sessions/$id",
                      params: {
                        id: s.id,
                      },
                      className:
                        "border border-[#1C2430] bg-[#11161D] hover:bg-[#161C24] p-3 flex flex-col justify-between gap-2 hover:border-[#3B82F6]/50 cursor-pointer",
                      children: [
                        /* @__PURE__ */ jsxs("div", {
                          className: "flex items-start justify-between gap-1",
                          children: [
                            /* @__PURE__ */ jsx("span", {
                              className:
                                "text-[10px] font-bold text-white uppercase tracking-wider truncate max-w-[70%]",
                              children: s.track ?? "Spa-Francorchamps",
                            }),
                            /* @__PURE__ */ jsxs("span", {
                              className:
                                "text-[8px] border border-[#1C2430] px-1.5 py-0.5 text-[#7A828C]",
                              children: [s.tick_rate ?? "60", " Hz"],
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxs("span", {
                          className: "text-[9px] text-[#7A828C] truncate uppercase font-bold",
                          children: ["Car: ", s.car ?? "AMG GT3"],
                        }),
                        /* @__PURE__ */ jsxs("div", {
                          className:
                            "flex justify-between text-[9px] text-[#7A828C] border-t border-[#1C2430]/40 pt-1.5 font-bold",
                          children: [
                            /* @__PURE__ */ jsx("span", { children: "BEST LAP:" }),
                            /* @__PURE__ */ jsx("span", {
                              className: "text-[#00D17F] font-bold tracking-wider",
                              children: fmtLapTime(s.best_lap_s),
                            }),
                          ],
                        }),
                      ],
                    },
                    s.id,
                  ),
                ),
              }),
            ],
          }),
        }),
      /* @__PURE__ */ jsx("section", {
        id: "onboarding-tutorial",
        className: "w-full max-w-none px-4 md:px-12 lg:px-16 py-6 z-10 scroll-mt-14",
        children: isElectron
          ? /* @__PURE__ */ jsxs("div", {
              className: "border border-[#1C2430] bg-[#0B0F14] p-5",
              children: [
                /* @__PURE__ */ jsxs("div", {
                  className: "mb-4 text-left border-b border-[#1C2430] pb-3",
                  children: [
                    /* @__PURE__ */ jsx("span", {
                      className:
                        "font-mono text-[9px] uppercase tracking-[0.3em] text-[#00D17F] font-semibold",
                      children: "INFRASTRUCTURE CONSOLE",
                    }),
                    /* @__PURE__ */ jsx("h2", {
                      className: "text-base font-bold tracking-tight text-white uppercase mt-1",
                      children: "Local Telemetry supervisor daemon operations",
                    }),
                    /* @__PURE__ */ jsx("p", {
                      className: "mt-1 text-xs text-[#7A828C] leading-relaxed max-w-4xl",
                      children:
                        "The workstation local supervisor runs continuous process monitors and local RPC loops to communicate directly with your local iRacing WebSocket bridge and MongoDB telemetry store.",
                    }),
                  ],
                }),
                /* @__PURE__ */ jsxs("div", {
                  className: "grid gap-4 text-xs md:grid-cols-3 mb-5",
                  children: [
                    /* @__PURE__ */ jsxs("div", {
                      className:
                        "border border-[#1C2430] bg-[#11161D] p-4 flex flex-col justify-between gap-3",
                      children: [
                        /* @__PURE__ */ jsxs("div", {
                          className: "flex flex-col gap-1.5",
                          children: [
                            /* @__PURE__ */ jsxs("div", {
                              className:
                                "flex items-center gap-2 font-mono uppercase tracking-wider text-[#00D17F] font-bold",
                              children: [
                                /* @__PURE__ */ jsx(Database, { className: "h-4 w-4" }),
                                " Telemetry Database",
                              ],
                            }),
                            /* @__PURE__ */ jsx("p", {
                              className: "text-[#7A828C] text-[10px] leading-relaxed",
                              children:
                                "MongoDB stores indexed lap files, telemetry frames, and driver consistency fingerprints locally.",
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxs("div", {
                          className:
                            "flex items-center justify-between border-t border-[#1C2430]/40 pt-3",
                          children: [
                            /* @__PURE__ */ jsxs("span", {
                              className: "text-[9px] text-[#7A828C] font-mono",
                              children: [
                                "STATUS: ",
                                manifest?.mongoStatus === "active" ? "ACTIVE" : "OFFLINE",
                              ],
                            }),
                            /* @__PURE__ */ jsx("button", {
                              onClick: async () => {
                                if (window.pitWallRuntime?.ensureMongoDB) {
                                  await window.pitWallRuntime.ensureMongoDB();
                                }
                              },
                              disabled: manifest?.mongoStatus === "active",
                              className:
                                "border border-[#00D17F]/40 bg-[#00D17F]/10 hover:bg-[#00D17F]/20 text-[#00D17F] px-3 py-1 text-[9px] uppercase font-bold disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer",
                              children: "Start Daemon",
                            }),
                          ],
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxs("div", {
                      className:
                        "border border-[#1C2430] bg-[#11161D] p-4 flex flex-col justify-between gap-3",
                      children: [
                        /* @__PURE__ */ jsxs("div", {
                          className: "flex flex-col gap-1.5",
                          children: [
                            /* @__PURE__ */ jsxs("div", {
                              className:
                                "flex items-center gap-2 font-mono uppercase tracking-wider text-[#3B82F6] font-bold",
                              children: [
                                /* @__PURE__ */ jsx(Wifi, { className: "h-4 w-4" }),
                                " WebSocket Bridge",
                              ],
                            }),
                            /* @__PURE__ */ jsx("p", {
                              className: "text-[#7A828C] text-[10px] leading-relaxed",
                              children:
                                "iRacing memory broker. Captures live game frames at 60Hz and exposes them on localhost ws port 3001.",
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxs("div", {
                          className:
                            "flex items-center justify-between border-t border-[#1C2430]/40 pt-3",
                          children: [
                            /* @__PURE__ */ jsxs("span", {
                              className: "text-[9px] text-[#7A828C] font-mono",
                              children: [
                                "STATUS: ",
                                manifest?.bridgeStatus
                                  ? String(manifest.bridgeStatus).toUpperCase()
                                  : "STARTING",
                              ],
                            }),
                            /* @__PURE__ */ jsx("button", {
                              onClick: async () => {
                                if (window.pitWallRuntime?.restartBridge) {
                                  await window.pitWallRuntime.restartBridge();
                                }
                              },
                              className:
                                "border border-[#3B82F6]/40 bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 text-[#3B82F6] px-3 py-1 text-[9px] uppercase font-bold transition-colors cursor-pointer",
                              children: "Restart Bridge",
                            }),
                          ],
                        }),
                      ],
                    }),
                    /* @__PURE__ */ jsxs("div", {
                      className:
                        "border border-[#1C2430] bg-[#11161D] p-4 flex flex-col justify-between gap-3",
                      children: [
                        /* @__PURE__ */ jsxs("div", {
                          className: "flex flex-col gap-1.5",
                          children: [
                            /* @__PURE__ */ jsxs("div", {
                              className:
                                "flex items-center gap-2 font-mono uppercase tracking-wider text-[#8B5CF6] font-bold",
                              children: [
                                /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }),
                                " Co-Pilot AI Strategy",
                              ],
                            }),
                            /* @__PURE__ */ jsx("p", {
                              className: "text-[#7A828C] text-[10px] leading-relaxed",
                              children:
                                "Local LLM router. Probes local inference servers (Ollama, LM Studio) or falls back to cloud APIs.",
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxs("div", {
                          className:
                            "flex items-center justify-between border-t border-[#1C2430]/40 pt-3",
                          children: [
                            /* @__PURE__ */ jsxs("span", {
                              className: "text-[9px] text-[#7A828C] font-mono",
                              children: [
                                "MODE: ",
                                manifest?.aiMode ? String(manifest.aiMode).toUpperCase() : "CLOUD",
                              ],
                            }),
                            /* @__PURE__ */ jsx("button", {
                              onClick: async () => {
                                if (window.pitWallRuntime?.refreshAiMode) {
                                  await window.pitWallRuntime.refreshAiMode();
                                }
                              },
                              className:
                                "border border-[#8B5CF6]/40 bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 text-[#8B5CF6] px-3 py-1 text-[9px] uppercase font-bold transition-colors cursor-pointer",
                              children: "Re-Probe AI",
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                /* @__PURE__ */ jsxs("div", {
                  className: "border border-[#1C2430] bg-[#11161D] p-4 text-left",
                  children: [
                    /* @__PURE__ */ jsx("h3", {
                      className: "font-bold text-white text-xs uppercase mb-1",
                      children: "Supervisor Daemon API endpoints",
                    }),
                    /* @__PURE__ */ jsxs("p", {
                      className: "text-[10px] text-[#7A828C] mb-2 leading-relaxed",
                      children: [
                        "The background supervisor hosts a local HTTP + SSE telemetry server at port ",
                        /* @__PURE__ */ jsx("span", {
                          className: "font-mono text-white",
                          children: "17777",
                        }),
                        ". Users can fetch telemetry programmatically or subscribe to the Server-Sent Events stream.",
                      ],
                    }),
                    /* @__PURE__ */ jsx("pre", {
                      className:
                        "overflow-x-auto rounded border border-[#1C2430] bg-[#05070A] p-3.5 font-mono text-[10px] leading-relaxed text-[#00D17F] w-full",
                      children: `# Status Endpoint:
GET http://127.0.0.1:17777/supervisor/status

# SSE Live Telemetry Stream:
GET http://127.0.0.1:17777/telemetry/live`,
                    }),
                  ],
                }),
              ],
            })
          : /* @__PURE__ */ jsxs("div", {
              className: "border border-[#1C2430] bg-[#0B0F14] p-5",
              children: [
                /* @__PURE__ */ jsxs("div", {
                  className: "mb-4 text-left border-b border-[#1C2430] pb-3",
                  children: [
                    /* @__PURE__ */ jsx("span", {
                      className:
                        "font-mono text-[9px] uppercase tracking-[0.3em] text-[#FFB800] font-semibold",
                      children: "GETTING STARTED",
                    }),
                    /* @__PURE__ */ jsx("h2", {
                      className: "text-base font-bold tracking-tight text-white uppercase mt-1",
                      children:
                        activeGame === "assettocorsa"
                          ? "Establishing Assetto Corsa shared memory telemetry"
                          : "Establishing local iRacing telemetry bridge connection",
                    }),
                    /* @__PURE__ */ jsx("p", {
                      className: "mt-1 text-xs text-[#7A828C] leading-relaxed max-w-4xl",
                      children:
                        activeGame === "assettocorsa"
                          ? "The Pit Wall workstation reads rolling telemetry from original Assetto Corsa shared memory blocks. This is achieved by running the local bridge on the same Windows machine where the simulation is hosted."
                          : "The Pit Wall desktop workstation pulls rolling telemetry directly from iRacing's Shared Memory API. This is achieved by running the local bridge WebSocket broker on the same Windows machine where the simulation is hosted.",
                    }),
                  ],
                }),
                activeGame === "assettocorsa"
                  ? /* @__PURE__ */ jsxs("div", {
                      className: "grid gap-4 text-xs md:grid-cols-3 mb-5",
                      children: [
                        /* @__PURE__ */ jsxs("div", {
                          className:
                            "border border-[#1C2430] bg-[#11161D] p-4 flex flex-col gap-1.5",
                          children: [
                            /* @__PURE__ */ jsxs("div", {
                              className:
                                "flex items-center gap-2 font-mono uppercase tracking-wider text-[#00D17F] font-bold",
                              children: [
                                /* @__PURE__ */ jsx(ShieldCheck, { className: "h-4 w-4" }),
                                " 1. OS Requirements",
                              ],
                            }),
                            /* @__PURE__ */ jsxs("ul", {
                              className: "space-y-1 text-[#7A828C] text-[10px] leading-relaxed",
                              children: [
                                /* @__PURE__ */ jsx("li", {
                                  children: "• Windows 10 or 11 (Host machine)",
                                }),
                                /* @__PURE__ */ jsx("li", {
                                  children: "• Assetto Corsa (Original) simulator installed",
                                }),
                                /* @__PURE__ */ jsx("li", {
                                  children:
                                    "• Pre-installed .NET Framework 4.x (for ac-reader compilation)",
                                }),
                              ],
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxs("div", {
                          className:
                            "border border-[#1C2430] bg-[#11161D] p-4 flex flex-col gap-1.5",
                          children: [
                            /* @__PURE__ */ jsxs("div", {
                              className:
                                "flex items-center gap-2 font-mono uppercase tracking-wider text-[#FFB800] font-bold",
                              children: [
                                /* @__PURE__ */ jsx(Wifi, { className: "h-4 w-4" }),
                                " 2. Shared Memory Broker",
                              ],
                            }),
                            /* @__PURE__ */ jsxs("p", {
                              className: "text-[#7A828C] text-[10px] leading-relaxed",
                              children: [
                                "The bridge compiles and spawns a native ",
                                /* @__PURE__ */ jsx("span", {
                                  className: "text-white font-bold",
                                  children: "ac-reader.exe",
                                }),
                                " to map original AC shared memory blocks to unified WebSocket streams.",
                              ],
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxs("div", {
                          className:
                            "border border-[#1C2430] bg-[#11161D] p-4 flex flex-col gap-1.5",
                          children: [
                            /* @__PURE__ */ jsxs("div", {
                              className:
                                "flex items-center gap-2 font-mono uppercase tracking-wider text-[#8B5CF6] font-bold",
                              children: [
                                /* @__PURE__ */ jsx(Cpu, { className: "h-4 w-4" }),
                                " 3. Seamless Normalization",
                              ],
                            }),
                            /* @__PURE__ */ jsx("p", {
                              className: "text-[#7A828C] text-[10px] leading-relaxed",
                              children:
                                "All telemetry speeds, gear indexes, tire temperatures, and shock deflections are normalized to match the existing DDRE contracts perfectly.",
                            }),
                          ],
                        }),
                      ],
                    })
                  : /* @__PURE__ */ jsxs("div", {
                      className: "grid gap-4 text-xs md:grid-cols-3 mb-5",
                      children: [
                        /* @__PURE__ */ jsxs("div", {
                          className:
                            "border border-[#1C2430] bg-[#11161D] p-4 flex flex-col gap-1.5",
                          children: [
                            /* @__PURE__ */ jsxs("div", {
                              className:
                                "flex items-center gap-2 font-mono uppercase tracking-wider text-[#3B82F6] font-bold",
                              children: [
                                /* @__PURE__ */ jsx(ShieldCheck, { className: "h-4 w-4" }),
                                " 1. OS Requirements",
                              ],
                            }),
                            /* @__PURE__ */ jsxs("ul", {
                              className: "space-y-1 text-[#7A828C] text-[10px] leading-relaxed",
                              children: [
                                /* @__PURE__ */ jsx("li", {
                                  children: "• Windows 10 or 11 (Host machine)",
                                }),
                                /* @__PURE__ */ jsx("li", {
                                  children: "• iRacing active simulation running",
                                }),
                                /* @__PURE__ */ jsx("li", {
                                  children: "• Node.js 20 LTS or bun runtime installed",
                                }),
                              ],
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxs("div", {
                          className:
                            "border border-[#1C2430] bg-[#11161D] p-4 flex flex-col gap-1.5",
                          children: [
                            /* @__PURE__ */ jsxs("div", {
                              className:
                                "flex items-center gap-2 font-mono uppercase tracking-wider text-[#FFB800] font-bold",
                              children: [
                                /* @__PURE__ */ jsx(Wifi, { className: "h-4 w-4" }),
                                " 2. Port Allocation",
                              ],
                            }),
                            /* @__PURE__ */ jsxs("p", {
                              className: "text-[#7A828C] text-[10px] leading-relaxed",
                              children: [
                                "By default, the bridge opens a localhost listener on WebSocket port ",
                                /* @__PURE__ */ jsx("span", {
                                  className: "text-white font-bold",
                                  children: "3001",
                                }),
                                ". Make sure no other programs are currently running on port 3001.",
                              ],
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxs("div", {
                          className:
                            "border border-[#1C2430] bg-[#11161D] p-4 flex flex-col gap-1.5",
                          children: [
                            /* @__PURE__ */ jsxs("div", {
                              className:
                                "flex items-center gap-2 font-mono uppercase tracking-wider text-[#8B5CF6] font-bold",
                              children: [
                                /* @__PURE__ */ jsx(Cpu, { className: "h-4 w-4" }),
                                " 3. Local first",
                              ],
                            }),
                            /* @__PURE__ */ jsx("p", {
                              className: "text-[#7A828C] text-[10px] leading-relaxed",
                              children:
                                "All telemetry data is streamed locally. No external server packages are sent, keeping your strategy completely private and secure.",
                            }),
                          ],
                        }),
                      ],
                    }),
                /* @__PURE__ */ jsxs("div", {
                  className: "space-y-3",
                  children: [
                    /* @__PURE__ */ jsxs("div", {
                      className:
                        "border border-[#1C2430] bg-[#11161D] p-4 text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",
                      children: [
                        /* @__PURE__ */ jsxs("div", {
                          children: [
                            /* @__PURE__ */ jsx("h3", {
                              className: "font-bold text-white text-xs uppercase",
                              children: "Step A: Install Pit Wall Desktop",
                            }),
                            /* @__PURE__ */ jsxs("p", {
                              className: "text-[10px] text-[#7A828C] mt-0.5 leading-relaxed",
                              children: [
                                "The local bridge is bundled inside the Pit Wall Desktop installer. Download and run the installer — the bridge starts automatically when you launch the app. Place the app in ",
                                /* @__PURE__ */ jsx("span", {
                                  className: "font-mono text-white",
                                  children: "C:\\Program Files\\Pit Wall",
                                }),
                                " or your preferred location.",
                              ],
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsx(Link, {
                          to: "/roadmap",
                          className:
                            "inline-flex items-center justify-center gap-2 border border-[#3B82F6]/40 bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 px-4 py-2 text-[10px] uppercase font-bold text-[#3B82F6] transition-colors flex-shrink-0",
                          children: "Get Desktop App →",
                        }),
                      ],
                    }),
                    activeGame === "assettocorsa"
                      ? /* @__PURE__ */ jsxs("div", {
                          className: "border border-[#1C2430] bg-[#11161D] p-4 text-left",
                          children: [
                            /* @__PURE__ */ jsx("h3", {
                              className: "font-bold text-white text-xs uppercase mb-1",
                              children: "Step B: Launch and stream",
                            }),
                            /* @__PURE__ */ jsxs("p", {
                              className: "text-[10px] text-[#7A828C] mb-2 leading-relaxed",
                              children: [
                                "Toggle active game to Assetto Corsa. The bridge will dynamically compile ",
                                /* @__PURE__ */ jsx("span", {
                                  className: "font-mono text-white",
                                  children: "ac-reader.cs",
                                }),
                                " and listen for Assetto Corsa memory frames. Start AC and drive!",
                              ],
                            }),
                            /* @__PURE__ */ jsx("pre", {
                              className:
                                "overflow-x-auto rounded border border-[#1C2430] bg-[#05070A] p-3.5 font-mono text-[10px] leading-relaxed text-[#00D17F] w-full",
                              children: `# C# shared memory reader compiles automatically using built-in csc.exe.
# Stream mapped telemetry at 60Hz:
ws://127.0.0.1:3001`,
                            }),
                          ],
                        })
                      : /* @__PURE__ */ jsxs("div", {
                          className: "border border-[#1C2430] bg-[#11161D] p-4 text-left",
                          children: [
                            /* @__PURE__ */ jsx("h3", {
                              className: "font-bold text-white text-xs uppercase mb-1",
                              children: "Step B: Launch and connect",
                            }),
                            /* @__PURE__ */ jsxs("p", {
                              className: "text-[10px] text-[#7A828C] mb-2 leading-relaxed",
                              children: [
                                "Launch Pit Wall Desktop. The bridge starts automatically in the background on port ",
                                /* @__PURE__ */ jsx("span", {
                                  className: "font-mono text-white",
                                  children: "3001",
                                }),
                                ". Start iRacing and join a session — the Live Telemetry dashboard will connect instantly.",
                              ],
                            }),
                            /* @__PURE__ */ jsx("pre", {
                              className:
                                "overflow-x-auto rounded border border-[#1C2430] bg-[#05070A] p-3.5 font-mono text-[10px] leading-relaxed text-[#00D17F] w-full",
                              children: `# Bridge starts automatically — no commands needed.
# Verify connection at:
ws://127.0.0.1:3001`,
                            }),
                          ],
                        }),
                  ],
                }),
              ],
            }),
      }),
      /* @__PURE__ */ jsx("footer", {
        className:
          "border-t border-[#1C2430] bg-[#0B0F14]/50 py-4 px-6 text-[#7A828C] text-[9px] font-mono tracking-wider z-10 select-none",
        children: /* @__PURE__ */ jsxs("div", {
          className:
            "w-full max-w-none px-4 md:px-12 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-4",
          children: [
            /* @__PURE__ */ jsxs("div", {
              className: "flex flex-col items-center md:items-start",
              children: [
                /* @__PURE__ */ jsx("span", {
                  className: "font-sans font-black italic tracking-tighter text-white text-sm",
                  children: "PIT WALL COMMAND",
                }),
                /* @__PURE__ */ jsx("span", {
                  className: "text-[7px] tracking-[0.2em] uppercase font-bold text-[#7A828C]",
                  children: "ENDURANCE TELEMETRY & STRATEGY",
                }),
              ],
            }),
            /* @__PURE__ */ jsxs("div", {
              className:
                "flex flex-wrap justify-center items-center gap-x-4 text-[#7A828C] font-bold",
              children: [
                /* @__PURE__ */ jsx("span", { children: "ENGINEERING GRADE" }),
                /* @__PURE__ */ jsx("span", { children: "·" }),
                /* @__PURE__ */ jsx("span", { children: "LOCAL MEMORY ONLY" }),
                /* @__PURE__ */ jsx("span", { children: "·" }),
                /* @__PURE__ */ jsx("span", { children: "FAST TELEMETRY TRACING" }),
                /* @__PURE__ */ jsx("span", { children: "·" }),
                /* @__PURE__ */ jsx("span", { children: "AI STRATEGIST ACTIVE" }),
              ],
            }),
            /* @__PURE__ */ jsxs("div", {
              className: "flex items-center gap-3",
              children: [
                /* @__PURE__ */ jsx("span", { children: "© 2026 PIT WALL WORKSTATION" }),
                /* @__PURE__ */ jsx("div", {
                  className:
                    "h-5 w-7 border border-[#1C2430] bg-[#05070A] flex items-center justify-center text-[#7A828C] font-black italic text-[10px]",
                  children: "PW",
                }),
              ],
            }),
          ],
        }),
      }),
    ],
  });
}
export { LandingPage as component };
