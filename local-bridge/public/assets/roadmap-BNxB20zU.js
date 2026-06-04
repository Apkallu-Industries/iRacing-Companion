import { j as e } from "./react-core-hSJfnumv.js";
import { b as r } from "./index-BF1LFLDu.js";
import { A as w } from "./AppHeader-CjQcEoTJ.js";
import {
  p as v,
  n as j,
  u as N,
  aj as y,
  aQ as p,
  i as k,
  $ as u,
  E as h,
  ar as S,
  D as o,
  M as A,
  a5 as g,
  f as x,
  e as b,
  T as L,
  h as C,
  aV as f,
  aq as M,
  c as P,
  ab as n,
  aC as D,
  aN as R,
  w as I,
  x as B,
} from "./icons-UNkcvPbk.js";
import "./vendor-CUluG-o1.js";
import "./charts-DDN7mcLY.js";
import "./supabase-DZ6I_NU8.js";
import "./zustand-BHt0iSzh.js";
import "./radix-ui-BcE8c2tf.js";
import "./zod-Dtfr8j2K.js";
import "./tts.functions-LY4Ks8GB.js";
import "./BackButton-Doz18YZJ.js";
import "./useRuntimeStatus-CE4IlwRK.js";
const i = [
  {
    label: "Phase 1 — Foundation",
    slug: "phase1",
    color: "text-racing-green",
    items: [
      {
        id: "live-bridge",
        label: "Live WebSocket Bridge",
        done: !0,
        icon: e.jsx(p, { className: "h-4 w-4" }),
        desc: "Local Node.js bridge reads iRacing Shared Memory API and streams 60 Hz telemetry to the browser over WebSocket.",
      },
      {
        id: "live-dashboard",
        label: "Live Telemetry Dashboard",
        done: !0,
        icon: e.jsx(k, { className: "h-4 w-4" }),
        desc: "Real-time display of gear, RPM, speed, lap delta, sector times, tire temps, G-force and fuel.",
      },
      {
        id: "ibt-workbench",
        label: ".ibt Lap Workbench",
        done: !0,
        icon: e.jsx(u, { className: "h-4 w-4" }),
        desc: "MoTeC-style stacked trace viewer, channel browser, GG diagram and track map for uploaded .ibt files.",
      },
      {
        id: "session-library",
        label: "Session Library",
        done: !0,
        icon: e.jsx(h, { className: "h-4 w-4" }),
        desc: "Cloud-synced library of every uploaded .ibt file with track/car metadata, best lap and file size.",
      },
      {
        id: "auth",
        label: "Authentication (Supabase)",
        done: !0,
        icon: e.jsx(S, { className: "h-4 w-4" }),
        desc: "Email/password sign-in with Supabase Auth, row-level security on all telemetry tables.",
      },
      {
        id: "pwlap",
        label: "Live Session Recording (.pwlap)",
        done: !0,
        icon: e.jsx(o, { className: "h-4 w-4" }),
        desc: "Record any live session directly in the browser as a .pwlap file and save it to the library or download it.",
      },
      {
        id: "fingerprint",
        label: "Driver Fingerprint",
        done: !0,
        icon: e.jsx(A, { className: "h-4 w-4" }),
        desc: "Parse your entire iRacing lapfiles folder locally in the browser to build a PB per track/car fingerprint.",
      },
      {
        id: "track-map",
        label: "Interactive Track Map",
        done: !0,
        icon: e.jsx(g, { className: "h-4 w-4" }),
        desc: "SVG track map rendered from telemetry X/Y position data with lap overlay and sector highlighting.",
      },
    ],
  },
  {
    label: "Phase 2 — AI & Analysis",
    slug: "phase2",
    color: "text-racing-cyan",
    items: [
      {
        id: "ai-coach",
        label: "AI Radio Coach (Live)",
        done: !0,
        icon: e.jsx(x, { className: "h-4 w-4" }),
        desc: "GPT-powered radio call after every lap with PUSH / HOLD / WARN tone determined by telemetry rules engine.",
      },
      {
        id: "ai-advisor",
        label: "Setup Advisor Button",
        done: !0,
        icon: e.jsx(b, { className: "h-4 w-4" }),
        desc: "On-demand AI analysis of car setup based on tire temps, brake bias and G-force telemetry from current session.",
      },
      {
        id: "llm-dispatch",
        label: "Multi-Provider LLM Client",
        done: !0,
        icon: e.jsx(o, { className: "h-4 w-4" }),
        desc: "Client-side dispatcher routing AI calls to OpenAI, Anthropic, or any local Ollama / LM Studio endpoint.",
      },
      {
        id: "lap-aggregate",
        label: "Unified Lap Aggregation Hook",
        done: !0,
        icon: e.jsx(L, { className: "h-4 w-4" }),
        desc: "Shared useLapAggregate hook consumed by LiveCoach and AdvisorButton to avoid redundant 60 Hz processing.",
      },
      {
        id: "history-merge",
        label: "Live PB ↔ Workbench History Merge",
        done: !0,
        icon: e.jsx(C, { className: "h-4 w-4" }),
        desc: "Live lap records integrate into the Workbench AI coach context, giving it historical track/car PB data.",
      },
      {
        id: "sector-analysis",
        label: "Sector Analysis Panel",
        done: !0,
        icon: e.jsx(f, { className: "h-4 w-4" }),
        desc: "Per-sector time comparison across laps with optimal lap computation and gap visualisation.",
      },
      {
        id: "sharing",
        label: "Shareable Lap Links",
        done: !0,
        icon: e.jsx(M, { className: "h-4 w-4" }),
        desc: "Generate a shareable token link to a specific lap comparison that expires after 7 days.",
      },
      {
        id: "tts",
        label: "Text-to-Speech Radio",
        done: !0,
        icon: e.jsx(P, { className: "h-4 w-4" }),
        desc: "AI coach calls read aloud via ElevenLabs or browser TTS with auto-speak toggle.",
      },
    ],
  },
  {
    label: "Phase 3 — Infrastructure",
    slug: "phase3",
    color: "text-racing-orange",
    items: [
      {
        id: "mongo-local",
        label: "Local MongoDB Integration",
        done: !0,
        icon: e.jsx(h, { className: "h-4 w-4" }),
        desc: "Dual-write architecture: lap records and sessions write to local MongoDB first, then sync to Supabase cloud. Schema validated with bsonType validators.",
      },
      {
        id: "in-memory-save",
        label: "In-Memory Session Transfer (Gap 4)",
        done: !0,
        icon: e.jsx(f, { className: "h-4 w-4" }),
        desc: "pendingLocalBlob in Zustand store passes recorded .pwlap directly to the Workbench without re-downloading from cloud.",
      },
      {
        id: "livebridgesync",
        label: "Live Bridge Global Sync",
        done: !0,
        icon: e.jsx(p, { className: "h-4 w-4" }),
        desc: "LiveBridgeSync mounts at root and pushes track/car/connection status to global Zustand store for access everywhere.",
      },
      {
        id: "desktopalpsync",
        label: "DesktopLap Sync",
        done: !0,
        icon: e.jsx(n, { className: "h-4 w-4" }),
        desc: "Polls the local bridge for completed lap records and merges them into the global workbench state.",
      },
      {
        id: "help-system",
        label: "Onboarding Help System",
        done: !0,
        icon: e.jsx(D, { className: "h-4 w-4" }),
        desc: "Stepped guided tour modal auto-triggers for first-time visitors with persistent ? button on every page.",
      },
      {
        id: "roadmap",
        label: "Dev Roadmap (this page)",
        done: !0,
        icon: e.jsx(y, { className: "h-4 w-4" }),
        desc: "Public roadmap tracking completed milestones and upcoming features across all phases.",
      },
      {
        id: "admin",
        label: "Admin Panel & Beta Tester System",
        done: !0,
        icon: e.jsx(R, { className: "h-4 w-4" }),
        desc: "Admin panel to promote registered users to beta_tester or admin roles, enabling free access for testers during paid rollout.",
      },
    ],
  },
  {
    label: "Phase 5 — Coach Dave Vision",
    slug: "phase5",
    color: "text-purple-400",
    items: [
      {
        id: "coach-dave-voice",
        label: "Coach Dave — Full AI Voice Engineer",
        done: !1,
        icon: e.jsx(x, { className: "h-4 w-4" }),
        desc: "A persistent AI 'race engineer' persona with memory of your full season, track history and car preferences — speaks after every lap, flags trends over weeks.",
        phase: "2027",
      },
      {
        id: "mongo-sync",
        label: "Cross-Device MongoDB Cloud Sync",
        done: !1,
        icon: e.jsx(I, { className: "h-4 w-4" }),
        desc: "Optional sync service: your local MongoDB pushes delta records to a central aggregation cluster for backup and multi-device access.",
        phase: "2027",
      },
      {
        id: "corner-analytics",
        label: "Corner-by-Corner Analytics",
        done: !0,
        icon: e.jsx(g, { className: "h-4 w-4" }),
        desc: "Automatic corner identification from track map + telemetry with per-corner speed, brake point and entry consistency scoring.",
      },
      {
        id: "ai-race-strategy",
        label: "AI Race Strategy Engine",
        done: !0,
        icon: e.jsx(b, { className: "h-4 w-4" }),
        desc: "Multi-stint fuel / tire strategy calculator powered by LLM given session conditions, pitting window, and opponent gaps.",
      },
      {
        id: "telemetry-compare",
        label: "Multi-Driver Telemetry Overlay",
        done: !1,
        icon: e.jsx(u, { className: "h-4 w-4" }),
        desc: "Load two .ibt files from different drivers on the same track and overlay their traces with delta annotations.",
        phase: "2027",
      },
      {
        id: "setup-ml",
        label: "ML Setup Recommender",
        done: !0,
        icon: e.jsx(o, { className: "h-4 w-4" }),
        desc: "Train on community setups + outcomes and recommend car setup changes based on your telemetry and driving style.",
      },
      {
        id: "native-app",
        label: "Native Desktop App (Electron / Tauri)",
        done: !0,
        icon: e.jsx(n, { className: "h-4 w-4" }),
        desc: "Pit Wall Desktop v1.2.0 ships the full suite — live bridge, workbench, AI coach — as a single Windows NSIS installer.",
      },
      {
        id: "mobile-companion",
        label: "Mobile Pit Wall (iOS / Android)",
        done: !1,
        icon: e.jsx(n, { className: "h-4 w-4" }),
        desc: "Dedicated mobile app as a second screen: live delta, engineer radio, tire status, fuel — all on your phone or tablet.",
        phase: "Future",
      },
      {
        id: "iracing-oauth",
        label: "iRacing OAuth — Official Integration",
        done: !1,
        icon: e.jsx(B, { className: "h-4 w-4" }),
        desc: "Official iRacing Data API OAuth so sessions auto-import race results, iRating, safety rating and SR incidents.",
        phase: "Future",
      },
    ],
  },
];
function Y() {
  const t = i.flatMap((s) => s.items).filter((s) => s.done).length,
    l = i.flatMap((s) => s.items).length,
    d = Math.round((t / l) * 100);
  return e.jsxs("div", {
    className: "min-h-screen bg-background text-foreground",
    children: [
      e.jsxs(w, {
        children: [
          e.jsx("span", { className: "font-mono uppercase tracking-wider", children: "Roadmap" }),
          e.jsx(r, {
            to: "/sessions",
            className: "ml-3 text-muted-foreground hover:text-foreground text-xs",
            children: "Sessions",
          }),
          e.jsx(r, {
            to: "/live",
            className: "ml-3 text-muted-foreground hover:text-foreground text-xs",
            children: "Live",
          }),
        ],
      }),
      e.jsxs("main", {
        className: "w-full max-w-none px-4 md:px-12 lg:px-16 py-12",
        children: [
          e.jsxs("div", {
            className: "mb-12 text-center",
            children: [
              e.jsx("p", {
                className:
                  "mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground",
                children: "Development Progress",
              }),
              e.jsx("h1", {
                className: "text-4xl font-bold tracking-tight",
                children: "Pit Wall Roadmap",
              }),
              e.jsx("p", {
                className: "mt-3 text-muted-foreground max-w-xl mx-auto",
                children:
                  "From a live telemetry bridge to a full AI race engineer suite. Here's what we've shipped and where we're heading.",
              }),
              e.jsxs("div", {
                className: "mt-8 mx-auto max-w-sm",
                children: [
                  e.jsxs("div", {
                    className: "flex justify-between text-xs text-muted-foreground mb-2",
                    children: [
                      e.jsxs("span", { children: [t, " shipped"] }),
                      e.jsxs("span", {
                        className: "font-mono font-bold text-primary",
                        children: [d, "%"],
                      }),
                      e.jsxs("span", { children: [l - t, " to go"] }),
                    ],
                  }),
                  e.jsx("div", {
                    className: "h-2 w-full rounded-full bg-rail overflow-hidden",
                    children: e.jsx("div", {
                      className:
                        "h-full rounded-full bg-gradient-to-r from-racing-green to-primary transition-all duration-1000",
                      style: { width: `${d}%` },
                    }),
                  }),
                ],
              }),
            ],
          }),
          e.jsx("div", {
            className: "space-y-12",
            children: i.map((s) => {
              const c = s.items.filter((a) => a.done).length,
                m = s.items.length;
              return e.jsxs(
                "section",
                {
                  children: [
                    e.jsxs("div", {
                      className: "mb-5 flex items-center gap-4",
                      children: [
                        e.jsxs("div", {
                          children: [
                            e.jsx("h2", {
                              className: `text-lg font-bold ${s.color}`,
                              children: s.label,
                            }),
                            e.jsxs("p", {
                              className: "text-xs text-muted-foreground mt-0.5",
                              children: [c, "/", m, " complete"],
                            }),
                          ],
                        }),
                        e.jsx("div", {
                          className:
                            "ml-auto flex-1 max-w-32 h-1 rounded-full bg-rail overflow-hidden",
                          children: e.jsx("div", {
                            className: "h-full rounded-full bg-current opacity-60 transition-all",
                            style: { width: `${(c / m) * 100}%`, color: "currentColor" },
                          }),
                        }),
                      ],
                    }),
                    e.jsx("div", {
                      className: "space-y-2",
                      children: s.items.map((a) =>
                        e.jsxs(
                          "div",
                          {
                            className: `flex items-start gap-4 rounded-lg border px-4 py-3.5 transition-colors ${a.done ? "border-racing-green/20 bg-racing-green/5" : "border-border bg-panel"}`,
                            children: [
                              e.jsx("div", {
                                className: `mt-0.5 shrink-0 ${a.done ? "text-racing-green" : "text-muted-foreground/40"}`,
                                children: a.done
                                  ? e.jsx(v, { className: "h-5 w-5" })
                                  : e.jsx(j, { className: "h-5 w-5" }),
                              }),
                              e.jsx("div", {
                                className: `mt-0.5 shrink-0 ${a.done ? "text-racing-green/70" : "text-muted-foreground/40"}`,
                                children: a.icon,
                              }),
                              e.jsxs("div", {
                                className: "flex-1 min-w-0",
                                children: [
                                  e.jsxs("div", {
                                    className: "flex items-center gap-2 flex-wrap",
                                    children: [
                                      e.jsx("span", {
                                        className: `text-sm font-semibold ${a.done ? "text-foreground" : "text-muted-foreground"}`,
                                        children: a.label,
                                      }),
                                      a.done &&
                                        e.jsx("span", {
                                          className:
                                            "rounded-full bg-racing-green/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-racing-green",
                                          children: "Shipped",
                                        }),
                                      a.beta &&
                                        e.jsx("span", {
                                          className:
                                            "rounded-full bg-racing-orange/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-racing-orange",
                                          children: "Beta",
                                        }),
                                      !a.done &&
                                        a.phase &&
                                        e.jsxs("span", {
                                          className:
                                            "flex items-center gap-1 rounded-full border border-border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground",
                                          children: [
                                            e.jsx(N, { className: "h-2.5 w-2.5" }),
                                            " ",
                                            a.phase,
                                          ],
                                        }),
                                    ],
                                  }),
                                  e.jsx("p", {
                                    className:
                                      "mt-0.5 text-xs text-muted-foreground leading-relaxed",
                                    children: a.desc,
                                  }),
                                ],
                              }),
                            ],
                          },
                          a.id,
                        ),
                      ),
                    }),
                  ],
                },
                s.slug,
              );
            }),
          }),
          e.jsxs("div", {
            className:
              "mt-16 rounded-xl border border-primary/20 bg-primary/5 px-6 py-8 text-center",
            children: [
              e.jsx(y, { className: "mx-auto h-8 w-8 text-primary mb-3" }),
              e.jsx("h2", {
                className: "font-bold text-lg",
                children: "Want to shape what comes next?",
              }),
              e.jsx("p", {
                className: "mt-2 text-sm text-muted-foreground max-w-md mx-auto",
                children:
                  "Sign up and become a beta tester. You'll get early access to every new feature before it goes public — for free, forever, as long as you're helping us build.",
              }),
              e.jsxs("div", {
                className: "mt-5 flex justify-center gap-3",
                children: [
                  e.jsx(r, {
                    to: "/auth",
                    className:
                      "rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90",
                    children: "Sign up for beta access",
                  }),
                  e.jsx(r, {
                    to: "/live",
                    className:
                      "rounded-md border border-border bg-panel px-5 py-2.5 text-sm font-medium hover:bg-accent",
                    children: "Try it now →",
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
export { Y as component };
