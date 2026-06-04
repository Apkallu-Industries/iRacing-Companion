import { d as n, j as e } from "./react-core-hSJfnumv.js";
import { Z as F, b as y } from "./index-BF1LFLDu.js";
import {
  A as R,
  R as B,
  aM as M,
  W as z,
  ax as P,
  aV as W,
  aQ as O,
  at as $,
} from "./icons-UNkcvPbk.js";
import "./vendor-CUluG-o1.js";
import "./charts-DDN7mcLY.js";
import "./supabase-DZ6I_NU8.js";
import "./zustand-BHt0iSzh.js";
import "./radix-ui-BcE8c2tf.js";
function Y() {
  const s = F(),
    [c, m] = n.useState(""),
    [x, h] = n.useState(""),
    [p, b] = n.useState(""),
    [f, u] = n.useState(!1),
    [g, j] = n.useState(!1),
    [C, k] = n.useState(!0),
    [N, w] = n.useState(!1),
    [v, d] = n.useState(null);
  (n.useEffect(() => {
    if (typeof window < "u") {
      const t = new URLSearchParams(window.location.search),
        r = t.get("team") || t.get("teamCode");
      r && b(r.toUpperCase());
      const a = t.get("driverName");
      a && m(a);
      const l = t.get("iracingId");
      l && h(l);
    }
  }, []),
    n.useEffect(() => {
      const t = async () => {
        try {
          const a = await fetch("http://localhost:3001/api/driver/config").catch(() => null);
          if (a && a.ok) {
            j(!0);
            const l = await a.json();
            l.driverName &&
              !f &&
              (m(l.driverName), h(l.iracingId || ""), b(l.teamCode || ""), u(!0));
          } else j(!1);
        } catch {
          j(!1);
        } finally {
          k(!1);
        }
      };
      t();
      const r = setInterval(t, 3e3);
      return () => clearInterval(r);
    }, [f]));
  const A = async (t) => {
      if ((t.preventDefault(), !c.trim())) {
        d("Driver Name is required.");
        return;
      }
      if (!x.trim()) {
        d("iRacing ID is required.");
        return;
      }
      (w(!0), d(null));
      try {
        const r = await fetch("http://localhost:3001/api/driver/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            driverName: c.trim(),
            iracingId: x.trim(),
            teamCode: p.trim().toUpperCase(),
          }),
        }).catch(() => null);
        r && r.ok
          ? u(!0)
          : d("Failed to synchronize with local bridge. Is the local bridge server running?");
      } catch (r) {
        d(r.message || "An unexpected error occurred.");
      } finally {
        w(!1);
      }
    },
    S = async () => {
      u(!1);
    },
    _ = () => {
      const t = [],
        r = s.rpm || 0;
      s.rpmMax;
      const a = s.rpmShiftWarn || 8800,
        l = s.rpmShiftRedline || 9800,
        E = (l - a * 0.8) / 10;
      for (let i = 0; i < 10; i++) {
        const D = a * 0.8 + i * E,
          T = r >= D;
        let o = "bg-zinc-800/80";
        (T &&
          (r >= l
            ? (o = "bg-blue-500 shadow-[0_0_12px_#3b82f6] animate-pulse")
            : i >= 8
              ? (o = "bg-red-500 shadow-[0_0_10px_#ef4444]")
              : i >= 5
                ? (o = "bg-amber-500 shadow-[0_0_8px_#f59e0b]")
                : (o = "bg-emerald-500 shadow-[0_0_8px_#10b981]")),
          t.push(
            e.jsx(
              "div",
              { className: `h-3 rounded-full flex-1 transition-all duration-75 ${o}` },
              i,
            ),
          ));
      }
      return t;
    },
    I = (t) => (t < 60 ? "text-cyan-400" : t > 95 ? "text-red-400" : "text-emerald-400"),
    L = (t) =>
      t > 80
        ? "bg-emerald-500 shadow-[0_0_6px_#10b981]"
        : t > 45
          ? "bg-amber-500 shadow-[0_0_6px_#f59e0b]"
          : "bg-red-500 shadow-[0_0_6px_#ef4444]";
  return C
    ? e.jsxs("div", {
        className:
          "flex h-screen flex-col items-center justify-center bg-[#05070A] text-foreground font-mono",
        children: [
          e.jsx(R, { className: "h-8 w-8 text-primary animate-spin mb-3" }),
          e.jsx("span", {
            className: "text-xs uppercase tracking-widest text-muted-foreground animate-pulse",
            children: "Initializing cockpit telemetry...",
          }),
        ],
      })
    : e.jsxs("main", {
        className:
          "min-h-screen bg-[#05070A] text-[#E2E4E8] font-mono overflow-x-hidden relative flex flex-col justify-between selection:bg-primary/30",
        children: [
          e.jsx("div", {
            className:
              "absolute inset-0 bg-[linear-gradient(to_right,#11161D_1px,transparent_1px),linear-gradient(to_bottom,#11161D_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-[0.12] pointer-events-none z-0",
          }),
          e.jsxs("nav", {
            className:
              "border-b border-[#1C2430] bg-[#0B0F14]/90 backdrop-blur sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between z-10 select-none",
            children: [
              e.jsx(y, {
                to: "/",
                className: "flex flex-col",
                children: e.jsxs("div", {
                  className: "flex items-center gap-2",
                  children: [
                    e.jsx("span", {
                      className: "font-sans font-black italic tracking-tighter text-lg text-white",
                      children: "PIT WALL",
                    }),
                    e.jsx("span", {
                      className:
                        "text-[8px] font-mono tracking-widest text-[#7A828C] bg-[#11161D] px-1.5 py-0.5 border border-[#1C2430]",
                      children: "DRIVER HUD",
                    }),
                  ],
                }),
              }),
              e.jsxs("div", {
                className: "flex items-center gap-6",
                children: [
                  e.jsxs("div", {
                    className:
                      "hidden md:flex items-center gap-3 border border-[#1C2430] bg-[#11161D] px-3 py-1 text-[10px]",
                    children: [
                      e.jsx("span", {
                        className: "text-[#7A828C] font-bold",
                        children: "LOCAL BRIDGE",
                      }),
                      e.jsxs("span", {
                        className: `flex items-center gap-1.5 font-bold ${g ? "text-emerald-400" : "text-amber-400"}`,
                        children: [
                          e.jsx("span", {
                            className: `h-1.5 w-1.5 rounded-full ${g ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`,
                          }),
                          g ? "ONLINE (ws:3001)" : "OFFLINE",
                        ],
                      }),
                    ],
                  }),
                  e.jsx(y, {
                    to: "/",
                    className:
                      "text-xs text-[#7A828C] hover:text-white uppercase tracking-wider font-bold transition-all border border-[#1C2430] bg-[#11161D] px-3.5 py-1",
                    children: "Back",
                  }),
                ],
              }),
            ],
          }),
          e.jsx("div", {
            className:
              "flex-1 w-full max-w-none px-4 md:px-12 lg:px-16 py-8 flex flex-col justify-center items-center z-10 relative",
            children: f
              ? e.jsxs("div", {
                  className: "w-full space-y-6",
                  children: [
                    e.jsx("div", {
                      className:
                        "flex items-center gap-1.5 w-full bg-[#0B0F14] border border-[#1C2430] rounded-2xl p-2.5 shadow-xl shrink-0",
                      children: _(),
                    }),
                    e.jsxs("div", {
                      className:
                        "flex flex-col md:flex-row gap-4 items-stretch justify-between text-xs w-full",
                      children: [
                        e.jsxs("div", {
                          className:
                            "flex-1 bg-[#0B0F14] border border-[#1C2430] rounded-2xl p-4 flex items-center justify-between shadow-lg",
                          children: [
                            e.jsxs("div", {
                              children: [
                                e.jsx("span", {
                                  className:
                                    "text-[#7A828C] block uppercase text-[9px] tracking-widest",
                                  children: "Active Driver Profile",
                                }),
                                e.jsx("span", {
                                  className: "text-sm font-bold text-white uppercase",
                                  children: c,
                                }),
                              ],
                            }),
                            e.jsxs("div", {
                              className: "text-right",
                              children: [
                                e.jsx("span", {
                                  className:
                                    "text-[#7A828C] block uppercase text-[9px] tracking-widest",
                                  children: "iRacing ID",
                                }),
                                e.jsx("span", {
                                  className: "text-sm font-bold text-primary font-mono",
                                  children: x,
                                }),
                              ],
                            }),
                          ],
                        }),
                        p &&
                          e.jsxs("div", {
                            className:
                              "flex-1 bg-[#0B0F14] border border-[#1c2430] rounded-2xl p-4 flex items-center justify-between shadow-lg",
                            children: [
                              e.jsxs("div", {
                                children: [
                                  e.jsx("span", {
                                    className:
                                      "text-[#7A828C] block uppercase text-[9px] tracking-widest",
                                    children: "Paddock Sync Team",
                                  }),
                                  e.jsx("span", {
                                    className: "text-sm font-bold text-white font-mono uppercase",
                                    children: p,
                                  }),
                                ],
                              }),
                              e.jsx("span", {
                                className:
                                  "text-[8px] bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-full uppercase font-bold tracking-widest font-mono",
                                children: "CONNECTED",
                              }),
                            ],
                          }),
                        e.jsxs("div", {
                          className:
                            "flex-1 bg-[#0B0F14] border border-[#1c2430] rounded-2xl p-4 flex items-center justify-between shadow-lg",
                          children: [
                            e.jsxs("div", {
                              children: [
                                e.jsx("span", {
                                  className:
                                    "text-[#7A828C] block uppercase text-[9px] tracking-widest",
                                  children: "Current Session",
                                }),
                                e.jsx("span", {
                                  className:
                                    "text-sm font-bold text-white uppercase truncate max-w-[200px] block",
                                  children:
                                    s.session !== "SESSION — TRACK"
                                      ? s.session
                                      : "WAITTING FOR SIM...",
                                }),
                              ],
                            }),
                            e.jsx("span", {
                              className: `w-2.5 h-2.5 rounded-full shrink-0 shadow ${s.connected ? "bg-emerald-400 shadow-emerald-400" : "bg-amber-400 shadow-amber-400"}`,
                            }),
                          ],
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      className: "grid lg:grid-cols-12 gap-6 items-stretch w-full",
                      children: [
                        e.jsxs("div", {
                          className:
                            "lg:col-span-7 flex flex-col gap-6 justify-between items-stretch",
                          children: [
                            e.jsxs("div", {
                              className:
                                "border border-[#1C2430] bg-[#0B0F14] rounded-3xl p-8 flex-1 flex items-center justify-around shadow-2xl relative overflow-hidden min-h-[260px]",
                              children: [
                                e.jsx("div", {
                                  className:
                                    "absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[90px] pointer-events-none",
                                }),
                                e.jsxs("div", {
                                  className:
                                    "relative flex items-center justify-center h-48 w-48 bg-[#05070A]/60 border border-[#1C2430] rounded-full",
                                  children: [
                                    e.jsx("span", {
                                      className:
                                        "text-[132px] font-sans font-black italic tracking-tighter text-white select-none leading-none",
                                      children: s.gear === 0 ? "N" : s.gear === -1 ? "R" : s.gear,
                                    }),
                                    e.jsx("span", {
                                      className:
                                        "absolute bottom-4 font-mono text-[9px] uppercase tracking-widest text-[#7A828C]",
                                      children: "Gear",
                                    }),
                                  ],
                                }),
                                e.jsxs("div", {
                                  className:
                                    "flex flex-col justify-center gap-1.5 font-mono border-l border-[#1C2430] pl-10 flex-1",
                                  children: [
                                    e.jsxs("div", {
                                      children: [
                                        e.jsx("span", {
                                          className:
                                            "text-[#7A828C] uppercase text-[9px] tracking-widest block",
                                          children: "VELOCITY",
                                        }),
                                        e.jsxs("div", {
                                          className:
                                            "text-5xl font-sans font-black italic tracking-tighter text-white leading-none mt-1",
                                          children: [
                                            Math.round(s.speedKph),
                                            " ",
                                            e.jsx("span", {
                                              className: "text-xs not-italic text-[#7A828C]",
                                              children: "KPH",
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                    e.jsxs("div", {
                                      className: "mt-4",
                                      children: [
                                        e.jsx("span", {
                                          className:
                                            "text-[#7A828C] uppercase text-[9px] tracking-widest block",
                                          children: "ENGINE SPEED",
                                        }),
                                        e.jsxs("div", {
                                          className: "text-xl font-bold text-white mt-1",
                                          children: [
                                            Math.round(s.rpm),
                                            " ",
                                            e.jsx("span", {
                                              className: "text-[10px] font-normal text-[#7A828C]",
                                              children: "RPM",
                                            }),
                                          ],
                                        }),
                                        e.jsx("div", {
                                          className:
                                            "h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mt-1.5",
                                          children: e.jsx("div", {
                                            className: "h-full bg-primary",
                                            style: {
                                              width: `${Math.min(100, (s.rpm / (s.rpmMax || 11e3)) * 100)}%`,
                                            },
                                          }),
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            e.jsxs("div", {
                              className:
                                "border border-[#1C2430] bg-[#0B0F14] rounded-3xl p-6 shadow-xl",
                              children: [
                                e.jsx("h3", {
                                  className:
                                    "text-[10px] text-white uppercase font-bold tracking-wider mb-4",
                                  children: "Input Controls",
                                }),
                                e.jsxs("div", {
                                  className: "space-y-3",
                                  children: [
                                    e.jsxs("div", {
                                      className: "grid grid-cols-12 gap-3 items-center",
                                      children: [
                                        e.jsx("span", {
                                          className:
                                            "col-span-2 text-[#7A828C] text-[10px] font-bold",
                                          children: "THR",
                                        }),
                                        e.jsx("div", {
                                          className:
                                            "col-span-8 h-4 bg-zinc-850 border border-[#1C2430] rounded-lg overflow-hidden relative",
                                          children: e.jsx("div", {
                                            className:
                                              "h-full bg-emerald-500 shadow-[0_0_8px_#10b981]",
                                            style: { width: `${(s.throttle || 0) * 100}%` },
                                          }),
                                        }),
                                        e.jsxs("span", {
                                          className:
                                            "col-span-2 text-right text-xs font-bold text-white",
                                          children: [Math.round((s.throttle || 0) * 100), "%"],
                                        }),
                                      ],
                                    }),
                                    e.jsxs("div", {
                                      className: "grid grid-cols-12 gap-3 items-center",
                                      children: [
                                        e.jsx("span", {
                                          className:
                                            "col-span-2 text-[#7A828C] text-[10px] font-bold",
                                          children: "BRK",
                                        }),
                                        e.jsx("div", {
                                          className:
                                            "col-span-8 h-4 bg-zinc-850 border border-[#1C2430] rounded-lg overflow-hidden relative",
                                          children: e.jsx("div", {
                                            className: "h-full bg-red-500 shadow-[0_0_8px_#ef4444]",
                                            style: { width: `${(s.brake || 0) * 100}%` },
                                          }),
                                        }),
                                        e.jsxs("span", {
                                          className:
                                            "col-span-2 text-right text-xs font-bold text-white",
                                          children: [Math.round((s.brake || 0) * 100), "%"],
                                        }),
                                      ],
                                    }),
                                    e.jsxs("div", {
                                      className: "grid grid-cols-12 gap-3 items-center",
                                      children: [
                                        e.jsx("span", {
                                          className:
                                            "col-span-2 text-[#7A828C] text-[10px] font-bold",
                                          children: "CLU",
                                        }),
                                        e.jsx("div", {
                                          className:
                                            "col-span-8 h-4 bg-zinc-850 border border-[#1C2430] rounded-lg overflow-hidden relative",
                                          children: e.jsx("div", {
                                            className: "h-full bg-sky-500 shadow-[0_0_8px_#0ea5e9]",
                                            style: { width: `${(s.clutch || 0) * 100}%` },
                                          }),
                                        }),
                                        e.jsxs("span", {
                                          className:
                                            "col-span-2 text-right text-xs font-bold text-white",
                                          children: [Math.round((s.clutch || 0) * 100), "%"],
                                        }),
                                      ],
                                    }),
                                    e.jsxs("div", {
                                      className: "grid grid-cols-12 gap-3 items-center",
                                      children: [
                                        e.jsx("span", {
                                          className:
                                            "col-span-2 text-[#7A828C] text-[10px] font-bold",
                                          children: "STEER",
                                        }),
                                        e.jsxs("div", {
                                          className:
                                            "col-span-8 h-4 bg-zinc-850 border border-[#1C2430] rounded-lg overflow-hidden relative flex items-center justify-center",
                                          children: [
                                            e.jsx("div", {
                                              className:
                                                "absolute top-0 bottom-0 left-1/2 w-[1px] bg-zinc-700",
                                            }),
                                            e.jsx("div", {
                                              className:
                                                "absolute h-2 w-2 rounded-sm bg-cyan-400 shadow-[0_0_6px_#22d3ee]",
                                              style: {
                                                left: `calc(50% + ${Math.max(-50, Math.min(50, ((s.steeringDeg || 0) / 360) * 50))}% - 4px)`,
                                              },
                                            }),
                                          ],
                                        }),
                                        e.jsxs("span", {
                                          className:
                                            "col-span-2 text-right text-xs font-bold text-white",
                                          children: [Math.round(s.steeringDeg || 0), "°"],
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                        e.jsxs("div", {
                          className:
                            "lg:col-span-5 flex flex-col gap-6 justify-between items-stretch",
                          children: [
                            e.jsxs("div", {
                              className:
                                "border border-[#1C2430] bg-[#0B0F14] rounded-3xl p-6 shadow-xl space-y-4",
                              children: [
                                e.jsxs("div", {
                                  className:
                                    "flex justify-between items-center border-b border-[#1C2430] pb-2",
                                  children: [
                                    e.jsx("h3", {
                                      className:
                                        "text-[10px] text-white uppercase font-bold tracking-wider",
                                      children: "Sector Times",
                                    }),
                                    e.jsxs("div", {
                                      className: "flex items-center gap-3 text-[10px] font-bold",
                                      children: [
                                        e.jsxs("span", {
                                          className: "text-[#7A828C]",
                                          children: [
                                            "S1: ",
                                            e.jsx("span", {
                                              className: "text-white",
                                              children: s.sectors?.s1 || "--.---",
                                            }),
                                          ],
                                        }),
                                        e.jsxs("span", {
                                          className: "text-[#7A828C]",
                                          children: [
                                            "S2: ",
                                            e.jsx("span", {
                                              className: "text-white",
                                              children: s.sectors?.s2 || "--.---",
                                            }),
                                          ],
                                        }),
                                        e.jsxs("span", {
                                          className: "text-[#7A828C]",
                                          children: [
                                            "S3: ",
                                            e.jsx("span", {
                                              className: "text-white",
                                              children: s.sectors?.s3 || "--.---",
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                e.jsxs("div", {
                                  className: "grid grid-cols-2 gap-4",
                                  children: [
                                    e.jsxs("div", {
                                      children: [
                                        e.jsx("span", {
                                          className:
                                            "text-[#7A828C] text-[9px] tracking-widest uppercase block",
                                          children: "Last Lap",
                                        }),
                                        e.jsx("span", {
                                          className: "text-lg font-bold text-white",
                                          children: s.lastLap || "--:--.---",
                                        }),
                                      ],
                                    }),
                                    e.jsxs("div", {
                                      children: [
                                        e.jsx("span", {
                                          className:
                                            "text-[#7A828C] text-[9px] tracking-widest uppercase block",
                                          children: "Best Lap",
                                        }),
                                        e.jsx("span", {
                                          className: "text-lg font-bold text-emerald-400",
                                          children: s.bestLap || "--:--.---",
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                e.jsxs("div", {
                                  className: `p-4 rounded-2xl flex items-center justify-between border ${s.deltaSec >= 0 ? "bg-red-500/5 border-red-500/20 text-red-400" : "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"}`,
                                  children: [
                                    e.jsx("span", {
                                      className:
                                        "font-sans text-[10px] font-bold uppercase tracking-widest",
                                      children: "Lap Delta",
                                    }),
                                    e.jsxs("span", {
                                      className: "text-2xl font-bold tracking-wider font-mono",
                                      children: [
                                        s.deltaSec >= 0 ? "+" : "",
                                        s.deltaSec.toFixed(3),
                                        "s",
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            e.jsxs("div", {
                              className:
                                "border border-[#1C2430] bg-[#0B0F14] rounded-3xl p-6 shadow-xl",
                              children: [
                                e.jsx("h3", {
                                  className:
                                    "text-[10px] text-white uppercase font-bold tracking-wider mb-4 border-b border-[#1C2430] pb-2",
                                  children: "Tire Management",
                                }),
                                e.jsx("div", {
                                  className: "grid grid-cols-2 gap-4 font-mono text-[10px]",
                                  children: ["fl", "fr", "rl", "rr"].map((t) => {
                                    const r = s.tires?.[t];
                                    if (!r) return null;
                                    const a = t.toUpperCase();
                                    return e.jsxs(
                                      "div",
                                      {
                                        className:
                                          "bg-background border border-[#1C2430]/60 rounded-2xl p-3 space-y-1.5",
                                        children: [
                                          e.jsxs("div", {
                                            className: "flex items-center justify-between",
                                            children: [
                                              e.jsx("span", {
                                                className: "font-bold text-[#7A828C]",
                                                children: a,
                                              }),
                                              e.jsxs("span", {
                                                className: `font-bold ${I(r.tempC)}`,
                                                children: [Math.round(r.tempC), "°C"],
                                              }),
                                            ],
                                          }),
                                          e.jsxs("div", {
                                            className: "text-[11px] font-bold text-white",
                                            children: [r.pressureBar.toFixed(2), " bar"],
                                          }),
                                          e.jsx("div", {
                                            className:
                                              "h-1 w-full bg-zinc-800 rounded-full overflow-hidden mt-1",
                                            children: e.jsx("div", {
                                              className: `h-full ${L(r.estWearPct)}`,
                                              style: { width: `${r.estWearPct}%` },
                                            }),
                                          }),
                                          e.jsxs("div", {
                                            className:
                                              "text-[9px] text-[#7A828C] text-right font-bold",
                                            children: [Math.round(r.estWearPct), "% wear"],
                                          }),
                                        ],
                                      },
                                      t,
                                    );
                                  }),
                                }),
                              ],
                            }),
                            e.jsxs("div", {
                              className:
                                "border border-[#1C2430] bg-[#0B0F14] rounded-3xl p-6 shadow-xl grid grid-cols-2 gap-6",
                              children: [
                                e.jsxs("div", {
                                  children: [
                                    e.jsx("span", {
                                      className:
                                        "text-[#7A828C] text-[9px] tracking-widest block uppercase mb-1",
                                      children: "Fuel Remaining",
                                    }),
                                    e.jsxs("span", {
                                      className: "text-xl font-bold text-white font-mono",
                                      children: [
                                        s.fuelRemainingL.toFixed(1),
                                        " ",
                                        e.jsx("span", {
                                          className: "text-xs text-[#7A828C]",
                                          children: "L",
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                e.jsxs("div", {
                                  children: [
                                    e.jsx("span", {
                                      className:
                                        "text-[#7A828C] text-[9px] tracking-widest block uppercase mb-1",
                                      children: "Estimated Laps",
                                    }),
                                    e.jsxs("span", {
                                      className: "text-xl font-bold text-primary font-mono",
                                      children: [
                                        s.lapsEstimated.toFixed(1),
                                        " ",
                                        e.jsx("span", {
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
                    e.jsx("div", {
                      className: "flex justify-center pt-2",
                      children: e.jsx("button", {
                        onClick: S,
                        className:
                          "px-4 py-2 border border-[#1C2430] bg-[#0B0F14] text-[#7A828C] hover:text-white uppercase tracking-wider text-[9px] font-bold rounded-xl transition-all hover:bg-zinc-800 cursor-pointer",
                        children: "↺ Modify Driver Profile",
                      }),
                    }),
                  ],
                })
              : e.jsxs("div", {
                  className:
                    "w-full max-w-xl bg-[#0B0F14]/80 border border-[#1C2430] rounded-3xl p-8 shadow-2xl backdrop-blur-md relative overflow-hidden",
                  children: [
                    e.jsx("div", {
                      className:
                        "absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-[80px] pointer-events-none",
                    }),
                    e.jsxs("div", {
                      className: "flex items-center gap-3 mb-6 pb-4 border-b border-[#1C2430]",
                      children: [
                        e.jsx("div", {
                          className:
                            "p-2.5 bg-primary/10 border border-primary/20 text-primary rounded-2xl",
                          children: e.jsx(B, { className: "w-6 h-6" }),
                        }),
                        e.jsxs("div", {
                          children: [
                            e.jsx("h2", {
                              className: "text-sm font-bold uppercase tracking-widest text-white",
                              children: "Driver Cockpit Setup",
                            }),
                            e.jsx("p", {
                              className: "text-[10px] text-muted-foreground uppercase mt-0.5",
                              children: "Synchronize your active identity and team code",
                            }),
                          ],
                        }),
                      ],
                    }),
                    v &&
                      e.jsx("div", {
                        className:
                          "mb-5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-sans rounded-xl leading-relaxed",
                        children: v,
                      }),
                    e.jsxs("form", {
                      onSubmit: A,
                      className: "space-y-5 font-sans",
                      children: [
                        e.jsxs("div", {
                          className: "flex flex-col gap-1.5",
                          children: [
                            e.jsx("label", {
                              className:
                                "text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1",
                              children: "Full Driver Name",
                            }),
                            e.jsxs("div", {
                              className: "relative flex items-center",
                              children: [
                                e.jsx(M, {
                                  className: "absolute left-3.5 w-4 h-4 text-muted-foreground",
                                }),
                                e.jsx("input", {
                                  type: "text",
                                  required: !0,
                                  value: c,
                                  onChange: (t) => m(t.target.value),
                                  className:
                                    "w-full bg-background border border-[#1C2430] hover:border-[#7A828C]/40 focus:border-primary/80 focus:ring-1 focus:ring-primary/30 rounded-xl pl-11 pr-4 py-3 text-xs font-mono text-white transition-all outline-none",
                                  placeholder: "e.g. Danny M",
                                }),
                              ],
                            }),
                          ],
                        }),
                        e.jsxs("div", {
                          className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                          children: [
                            e.jsxs("div", {
                              className: "flex flex-col gap-1.5",
                              children: [
                                e.jsx("label", {
                                  className:
                                    "text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1",
                                  children: "iRacing Customer ID",
                                }),
                                e.jsxs("div", {
                                  className: "relative flex items-center",
                                  children: [
                                    e.jsx(z, {
                                      className: "absolute left-3.5 w-4 h-4 text-muted-foreground",
                                    }),
                                    e.jsx("input", {
                                      type: "text",
                                      required: !0,
                                      value: x,
                                      onChange: (t) => h(t.target.value),
                                      className:
                                        "w-full bg-background border border-[#1C2430] hover:border-[#7A828C]/40 focus:border-primary/80 focus:ring-1 focus:ring-primary/30 rounded-xl pl-11 pr-4 py-3 text-xs font-mono text-white transition-all outline-none",
                                      placeholder: "Find on Account page",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            e.jsxs("div", {
                              className: "flex flex-col gap-1.5",
                              children: [
                                e.jsx("label", {
                                  className:
                                    "text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1",
                                  children: "Team Code (Optional)",
                                }),
                                e.jsxs("div", {
                                  className: "relative flex items-center",
                                  children: [
                                    e.jsx(P, {
                                      className: "absolute left-3.5 w-4 h-4 text-muted-foreground",
                                    }),
                                    e.jsx("input", {
                                      type: "text",
                                      value: p,
                                      onChange: (t) => b(t.target.value.toUpperCase()),
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
                        e.jsxs("button", {
                          type: "submit",
                          disabled: N,
                          className:
                            "w-full py-3.5 bg-primary text-primary-foreground font-mono font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 cursor-pointer mt-3",
                          children: [
                            e.jsx(W, { className: "w-4 h-4" }),
                            N ? "Synchronizing details..." : "Sync & Enter Cockpit",
                          ],
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      className: "mt-8 pt-6 border-t border-[#1C2430] text-xs",
                      children: [
                        e.jsxs("h4", {
                          className: "text-white uppercase font-bold mb-3 flex items-center gap-2",
                          children: [
                            e.jsx(O, { className: "w-4 h-4 text-primary" }),
                            "How to connect your Local Bridge",
                          ],
                        }),
                        e.jsx("p", {
                          className: "text-muted-foreground text-[11px] leading-relaxed mb-4",
                          children:
                            "Drivers must run the telemetry bridge locally to grab and stream their live iRacing data. Download the bridge zip file, extract it, and execute in your command prompt:",
                        }),
                        e.jsx("pre", {
                          className:
                            "overflow-x-auto rounded border border-[#1C2430] bg-[#05070A] p-3.5 font-mono text-[10px] leading-relaxed text-emerald-400 w-full mb-3 select-all",
                          children: `cd C:\\PitWall\\bridge
npm install
npm start`,
                        }),
                        e.jsxs("div", {
                          className:
                            "flex items-center gap-2 p-3 bg-primary/5 border border-primary/10 text-muted-foreground rounded-xl leading-normal text-[11px] font-sans",
                          children: [
                            e.jsx($, { className: "w-4 h-4 text-primary shrink-0" }),
                            e.jsx("span", {
                              children:
                                "The bridge remains completely local on your PC. No credentials or external accounts are requested.",
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
          }),
          e.jsx("footer", {
            className:
              "border-t border-[#1C2430] bg-[#0B0F14]/50 py-4 px-6 text-[#7A828C] text-[8px] font-mono tracking-wider z-10 select-none",
            children: e.jsxs("div", {
              className:
                "mx-auto w-full max-w-none px-4 md:px-12 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-4",
              children: [
                e.jsx("span", {
                  className: "font-sans font-black italic tracking-tighter text-white",
                  children: "PIT WALL DRIVER STATION",
                }),
                e.jsx("span", {
                  children: "© 2026 PIT WALL WORKSTATION · ACTIVE LOCAL WS PIPELINE",
                }),
              ],
            }),
          }),
        ],
      });
}
export { Y as component };
