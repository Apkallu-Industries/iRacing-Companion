const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      "assets/tts-client-heJEKrcU.js",
      "assets/tts.functions-LY4Ks8GB.js",
      "assets/index-BF1LFLDu.js",
      "assets/react-core-hSJfnumv.js",
      "assets/vendor-CUluG-o1.js",
      "assets/charts-DDN7mcLY.js",
      "assets/supabase-DZ6I_NU8.js",
      "assets/zustand-BHt0iSzh.js",
      "assets/icons-UNkcvPbk.js",
      "assets/radix-ui-BcE8c2tf.js",
    ]),
) => i.map((i) => d[i]);
import { Z as X, a0 as U, _ as Z, C as Q, S as ee } from "./index-BF1LFLDu.js";
import { R as te, d as n, j as e } from "./react-core-hSJfnumv.js";
import { A as re } from "./AppHeader-CjQcEoTJ.js";
import { t as x } from "./vendor-CUluG-o1.js";
import { p as se } from "./setup-HNiGt18E.js";
import {
  aD as ae,
  a1 as G,
  aO as ne,
  ak as ie,
  an as le,
  ax as $,
  aT as oe,
  A as V,
  aJ as ce,
} from "./icons-UNkcvPbk.js";
import "./charts-DDN7mcLY.js";
import "./supabase-DZ6I_NU8.js";
import "./zustand-BHt0iSzh.js";
import "./radix-ui-BcE8c2tf.js";
import "./zod-Dtfr8j2K.js";
import "./tts.functions-LY4Ks8GB.js";
import "./BackButton-Doz18YZJ.js";
import "./useRuntimeStatus-CE4IlwRK.js";
function Re() {
  const a = X(),
    b = U((t) => t.parsed),
    T = te.useMemo(() => {
      if (!b?.meta?.sessionInfoYaml) return null;
      try {
        return se(b.meta.sessionInfoYaml);
      } catch {
        return null;
      }
    }, [b]),
    I = n.useRef(null),
    [f, j] = n.useState(""),
    [c, l] = n.useState(!1),
    [g, y] = n.useState(!1),
    [w, Y] = n.useState("AMG GT3 Evo"),
    [h, H] = n.useState("Spa-Francorchamps"),
    [C, E] = n.useState([
      {
        timestamp: "15:45:01",
        type: "SYSTEM",
        content: "PW-ENGINEER ENGINE: DETECTED HARDWARE PROTOCOL. LAUNCHING WORKSTATION CORE.",
      },
      {
        timestamp: "15:45:02",
        type: "SYSTEM",
        content: `TELEMETRY HANDSHAKE: ws://127.0.0.1:3001 ACTIVE (STATE: ${a.connected ? "REALTIME" : "SIMULATED"}).`,
      },
      {
        timestamp: "15:45:10",
        type: "STINT_ANALYSIS",
        content: "INITIATING SECTOR DATA INSPECTION FOR TURN 4 (EAU ROUGE / RAIDILLON ENTRY).",
      },
      {
        timestamp: "15:45:12",
        type: "OBSERVATION",
        content:
          "Rear instability detected under trail braking. Shock telemetry reports high rebound velocity mismatch in rear axle.",
      },
      {
        timestamp: "15:45:14",
        type: "RECOMMENDATION",
        content: `- Reduce rear rebound dampers 1 click
- Smooth brake pressure release ramp
- Shift throttle rotation point 2.5 meters earlier`,
      },
    ]),
    [_, k] = n.useState([
      {
        param: "COLD TIRE PRESSURES (PSI)",
        fl: "24.5",
        fr: "24.8",
        rl: "24.2",
        rr: "24.5",
        flDelta: "-0.5",
        frDelta: "-0.8",
        rlDelta: "+0.3",
        rrDelta: "+0.0",
        flStatus: "warn",
        frStatus: "warn",
        rlStatus: "adjust",
        rrStatus: "ok",
      },
      {
        param: "SPRING RATE (N/MM)",
        fl: "180",
        fr: "180",
        rl: "150",
        rr: "150",
        flDelta: "0",
        frDelta: "0",
        rlDelta: "-10",
        rrDelta: "-10",
        flStatus: "ok",
        frStatus: "ok",
        rlStatus: "adjust",
        rrStatus: "adjust",
      },
      {
        param: "DAMPER REBOUND (CLICKS)",
        fl: "12",
        fr: "12",
        rl: "10",
        rr: "10",
        flDelta: "+0",
        frDelta: "+0",
        rlDelta: "-1",
        rrDelta: "-1",
        flStatus: "ok",
        frStatus: "ok",
        rlStatus: "adjust",
        rrStatus: "adjust",
      },
      {
        param: "DAMPER BUMP (CLICKS)",
        fl: "8",
        fr: "8",
        rl: "6",
        rr: "6",
        flDelta: "+0",
        frDelta: "+0",
        rlDelta: "+0",
        rrDelta: "+0",
        flStatus: "ok",
        frStatus: "ok",
        rlStatus: "ok",
        rrStatus: "ok",
      },
      {
        param: "CAMBER DEGREES",
        fl: "-3.20",
        fr: "-3.15",
        rl: "-2.45",
        rr: "-2.40",
        flDelta: "+0.10",
        frDelta: "+0.10",
        rlDelta: "+0.00",
        rrDelta: "+0.00",
        flStatus: "adjust",
        frStatus: "adjust",
        rlStatus: "ok",
        rrStatus: "ok",
      },
    ]);
  (n.useEffect(() => {
    (a.car && Y(`${a.car} #${a.carNumber}`), a.track && H(a.track));
  }, [a.car, a.track, a.carNumber]),
    n.useEffect(() => {
      I.current?.scrollIntoView({ behavior: "smooth" });
    }, [C]));
  const N = (t) => {
      const r = new Date().toTimeString().split(" ")[0];
      E((i) => [...i, { timestamp: r, type: "SYSTEM", content: t }]);
    },
    s = (t, r) => {
      const i = new Date().toTimeString().split(" ")[0];
      E((d) => [...d, { timestamp: i, type: t, content: r }]);
    },
    v = () => {
      (l(!0),
        N(`STINT SYSTEM DISPATCH: ANALYZING LAST 5 RUNS ON ${h.toUpperCase()}...`),
        setTimeout(() => {
          (s("STINT_ANALYSIS", `LATERAL FORCE CORRELATION AT ${h.toUpperCase()} CORNER SPAN.`),
            s(
              "OBSERVATION",
              "Tire temperatures at FR axle peaking at 98.4°C. Severe slide energy on exit slip angles.",
            ),
            s(
              "RECOMMENDATION",
              `- Reduce tire pressures on FR by 0.8 psi
- Adjust brake bias forward 0.5% to decrease front slide loading
- Open ERS map deployment by 1 click`,
            ),
            l(!1),
            x.success("Sector stint analysis completed."));
        }, 1200));
    },
    M = () => {
      (l(!0),
        N("DAMPER MATH COMPILATION ROUTINE: RESOLVING SHOCK TRANSIENTS..."),
        setTimeout(() => {
          (s("STINT_ANALYSIS", "RESOLVED SUSPENSION HISTOGRAMS."),
            s(
              "OBSERVATION",
              "Over-stiffness detected over Turn 11 high curbs. Compression energy causing wheel hop.",
            ),
            s(
              "RECOMMENDATION",
              `- Soften front bump dampers by 2 clicks
- Increase rear rebound by 1 click to control pitch velocity`,
            ),
            k((t) =>
              t.map((r) =>
                r.param.includes("DAMPER BUMP")
                  ? { ...r, flDelta: "-2", frDelta: "-2", flStatus: "adjust", frStatus: "adjust" }
                  : r.param.includes("DAMPER REBOUND")
                    ? { ...r, rlDelta: "-2", rrDelta: "-2", rlStatus: "adjust", rrStatus: "adjust" }
                    : r,
              ),
            ),
            l(!1),
            x.success("Damper coefficients adjusted in matrix."));
        }, 1e3));
    },
    L = () => {
      (l(!0),
        N("THERMODYNAMIC TIRE WEAR REGIME: RESOLVING PRESSURE DEFICITS..."),
        setTimeout(() => {
          (s("STINT_ANALYSIS", "TIRE CARCASS EXPANSION COEFFICIENT RESOLUTION."),
            s(
              "OBSERVATION",
              "Rear right tire cold core pressure failing to reach active window target (active: 23.8, target: 24.5).",
            ),
            s(
              "RECOMMENDATION",
              `- Increase rear right cold pressure by 0.5 psi
- Decrease front left pressure by 0.3 psi to equalize wear footprint`,
            ),
            k((t) =>
              t.map((r) =>
                r.param.includes("COLD TIRE PRESSURES")
                  ? {
                      ...r,
                      flDelta: "-0.3",
                      rrDelta: "+0.5",
                      flStatus: "adjust",
                      rrStatus: "adjust",
                    }
                  : r,
              ),
            ),
            l(!1),
            x.success("Cold tire targets optimized."));
        }, 1100));
    },
    F = async (t) => {
      l(!0);
      try {
        if (t.toLowerCase() === "/stint") {
          v();
          return;
        }
        if (t.toLowerCase() === "/dampers") {
          M();
          return;
        }
        if (t.toLowerCase() === "/tires") {
          L();
          return;
        }
        if (t.toLowerCase() === "/reset") {
          (E([
            {
              timestamp: new Date().toTimeString().split(" ")[0],
              type: "SYSTEM",
              content: "PW-ENGINEER ENGINE: CONSOLE RESET COMPLETE.",
            },
          ]),
            l(!1));
          return;
        }
        const { llmBaseUrl: r, llmModelId: i, llmApiKey: d } = U.getState(),
          z = Q(r),
          P = { "Content-Type": "application/json" };
        d && (P.Authorization = `Bearer ${d}`);
        let R = "";
        T
          ? (R =
              `
Actual Parsed iRacing Setup Parameters:
` +
              Object.entries(T.flat).map(([B, p]) => `- ${B}: ${p}`).join(`
`))
          : (R = `
      - Damper status: Rebound Front 12 clicks, Bump Front 8 clicks, Rebound Rear 10 clicks, Bump Rear 6 clicks.
      - Cold tire pressure targets: FL 24.5, FR 24.8, RL 24.2, RR 24.5.`);
        const q = `You are a motorsport race engineer on the pit wall for a professional GT3/GTP race team.
      The driver has typed a command: "${t}".
      Current telemetry session state:
      - Track: ${h}
      - Car: ${w}
      - Speed: ${a.speedKph} kph
      - Active Sector bests: S1 ${a.sectors.s1 ?? "--.---"} | S2 ${a.sectors.s2 ?? "--.---"} | S3 ${a.sectors.s3 ?? "--.---"}
      ${R}
 
      === TRUSTED MOTORSPORT SETUP KNOWLEDGE ===
      Your mechanical recommendations, calculations, and stint analysis MUST be strictly and exclusively derived from the trusted guidelines, priority hierarchy, and chapters of Tim McArthur's book "Learn to setup your race car" and accompanying flowcharts detailed in the knowledge base below.
      
      Do NOT invent rules, parameters, or advice that contradicts or goes beyond this book. Every single recommendation must draw its authority strictly from the chapters on Weight, Springs, ARBs, Tire Pressures, Camber, Caster, Toe, Gearing, Dampers, Differential, and Aerodynamics of this text.
      
      KEY TEXTBOOK PRINCIPLES TO ENFORCE:
      - Tire Pressures as Springs: One pound (1 psi) of air pressure is equal to 15–25 lbs of spring rate. Re-balance corner springs after pressure moves.
      - Tire Temp Targets: Achieve uniform temperature across all three points of the tire (inner, middle, outer) *while in the corner* (middle optimized by pressure, inner/outer by camber).
      - Springs bottoming: Softest springs possible without bottoming the chassis on track or suspension on bump-stops/packers.
      - Weight loss: Consuming fuel loses rear weight at roughly 8 pounds for every gallon of fuel burned.
      - Dampers: Springs dictate *how much* weight is transferred; dampers dictate *how and when* that weight is transferred. Front compression dictates entry turn-in grip; rear rebound dictates entry braking connection (softer = more planted).
      - Differential: Power map is on-throttle; Coast map is off-throttle. High preload = sharp/twitchy, low preload = smooth/forgiving.
      - Antiroll Bars: Softer ARB on an end = more grip to that end. Pulls inside wheel up, reducing inside grip but keeping chassis level. Excellent tool to equalize left-to-right side tire temperatures.

      --- AUTHORITATIVE SETUP BIBLE ---
      ${ee}
      ==========================================
 
      Based on this telemetry, provide a professional, dense, and tactical motorsport engineering response.
      Use exactly this log layout format (do not use markdown paragraphs, use mechanical lists instead):
      [OBSERVATION] (Identify telemetry anomalies, instability, slide slip, damper spikes, tire overheating)
      [RECOMMENDATION] (List Spring/Damper/Tire pressure clicks or driving style tweaks explicitly, citing the specific textbook chapter/flowchart, e.g. "Tim McArthur Flowchart: Road Understeer #1 (ARB)" or "eBook: ch. TIRE PRESSURES")
 
      Be concise, technical, and authoritative. Speak like a pro-team engineer.`,
          A = await fetch(z, {
            method: "POST",
            headers: P,
            body: JSON.stringify({
              model: i || "local-model",
              messages: [{ role: "user", content: q }],
              temperature: 0.6,
            }),
          });
        if (A.ok) {
          const p = (await A.json()).choices?.[0]?.message?.content;
          if (p) {
            const J = p
              .split(
                `
`,
              )
              .filter((o) => o.trim() !== "");
            let m = "",
              u = "",
              D = !1,
              O = !1;
            for (const o of J)
              o.includes("[OBSERVATION]")
                ? ((D = !0), (O = !1), (m = o.replace("[OBSERVATION]", "").trim()))
                : o.includes("[RECOMMENDATION]")
                  ? ((D = !1), (O = !0), (u = o.replace("[RECOMMENDATION]", "").trim()))
                  : (D &&
                      (m +=
                        `
` + o),
                    O &&
                      (u +=
                        `
` + o));
            (m && s("OBSERVATION", m.trim()),
              u && s("RECOMMENDATION", u.trim()),
              !m && !u && s("RECOMMENDATION", p.trim()));
          }
        } else
          s(
            "RECOMMENDATION",
            `ENGINE PROTOCOL ECHO: UNABLE TO CONTACT SERVER (${A.status}).
PROPOSED TWEAK: Reduce ERS deployment by 2% to equalize thermal exit limits.`,
          );
      } catch (r) {
        (s("ERROR", `LLM OFFLINE: ${r.message}. ENGAGING LOCAL SIM MODE.`),
          s("OBSERVATION", "Mild understeer on apex throttle transitions."),
          s(
            "RECOMMENDATION",
            `- Soften front anti-roll bar 1 step
- Increase rear aerodynamic wing angle (+0.5°)`,
          ));
      } finally {
        l(!1);
      }
    },
    K = async (t) => {
      if ((t.preventDefault(), !f.trim() || c)) return;
      const r = f.trim();
      (j(""), s("SYSTEM", `> ENGINE_CMD: ${r}`), await F(r));
    };
  n.useEffect(() => {
    new URLSearchParams(window.location.search).get("analyzeSetup") === "true" &&
      (window.history.replaceState({}, document.title, window.location.pathname),
      (async () => {
        (N("PIT WALL COMMS PROTOCOL: AUTOMATIC VEHICLE SETUP HANDSHAKE INITIALIZED."),
          await new Promise((d) => setTimeout(d, 600)));
        const i = "Please analyze my parsed setup and suggest baseline handling optimizations.";
        (s("SYSTEM", `> ENGINE_CMD: ${i}`), await F(i));
      })());
  }, [T]);
  const W = async () => {
      if (g) return;
      const t = [...C].reverse().find((r) => r.type === "RECOMMENDATION");
      if (!t) {
        x.error("No recommendation found in log to read.");
        return;
      }
      y(!0);
      try {
        const { speak: r } = await Z(
          async () => {
            const { speak: i } = await import("./tts-client-heJEKrcU.js");
            return { speak: i };
          },
          __vite__mapDeps([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
        );
        await r(`Attention driver. Recommendation details: ${t.content}`);
      } catch {
        x.error("Text-to-Speech service unavailable.");
      } finally {
        y(!1);
      }
    },
    S = (t) =>
      t === "warn"
        ? "text-[#FF4D4D] font-bold"
        : t === "adjust"
          ? "text-[#00D17F] font-bold"
          : "text-[#7A828C]";
  return e.jsxs("div", {
    className: "flex h-screen flex-col bg-[#05070A] text-[#E2E4E8] font-mono select-none",
    children: [
      e.jsxs(re, {
        children: [
          e.jsx("span", {
            className: "font-mono text-xs uppercase tracking-wider text-[#7A828C]",
            children: "AI ENGINEER COMMAND",
          }),
          e.jsx("span", { className: "text-muted-foreground", children: "·" }),
          e.jsx("span", { className: "text-white font-bold", children: w }),
          e.jsx("span", { className: "text-muted-foreground", children: "·" }),
          e.jsx("span", {
            className: "text-white font-mono uppercase tracking-wider",
            children: h,
          }),
        ],
      }),
      e.jsxs("main", {
        className: "flex-1 min-h-0 w-full grid grid-cols-12 gap-0 border-t border-[#1C2430]",
        children: [
          e.jsxs("section", {
            className:
              "col-span-7 flex flex-col justify-between overflow-hidden border-r border-[#1C2430] bg-[#05070A]",
            children: [
              e.jsxs("div", {
                className:
                  "px-4 py-2 border-b border-[#1C2430] bg-[#0B0F14] text-[9px] uppercase tracking-widest text-[#7A828C] font-black flex items-center justify-between shrink-0",
                children: [
                  e.jsxs("span", {
                    className: "flex items-center gap-1.5",
                    children: [
                      e.jsx(ae, { className: "h-3.5 w-3.5 text-[#3B82F6]" }),
                      " Active Strategy Terminal Logs",
                    ],
                  }),
                  e.jsxs("div", {
                    className: "flex gap-2",
                    children: [
                      e.jsxs("button", {
                        onClick: W,
                        disabled: g,
                        className:
                          "flex items-center gap-1 border border-[#1C2430] bg-[#11161D] hover:bg-[#161C24] px-2 py-0.5 rounded text-[8px] tracking-wider text-white disabled:opacity-40",
                        children: [
                          g
                            ? e.jsx(G, { className: "h-2.5 w-2.5 animate-spin" })
                            : e.jsx(ne, { className: "h-2.5 w-2.5" }),
                          "SPEAK LAST",
                        ],
                      }),
                      e.jsxs("button", {
                        onClick: () => E([]),
                        className:
                          "flex items-center gap-1 border border-[#1C2430] bg-[#11161D] hover:bg-[#161C24] px-2 py-0.5 rounded text-[8px] tracking-wider text-white",
                        children: [e.jsx(ie, { className: "h-2.5 w-2.5" }), "RESET LOG"],
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs("div", {
                className:
                  "flex-1 min-h-0 overflow-y-auto p-4 space-y-3 font-mono text-[10px] leading-relaxed bg-[#05070A] select-text",
                children: [
                  C.map((t, r) =>
                    e.jsxs(
                      "div",
                      {
                        className: "flex items-start gap-2 animate-in fade-in-50 duration-200",
                        children: [
                          e.jsxs("span", {
                            className: "text-[#7A828C] shrink-0 font-bold",
                            children: ["[", t.timestamp, "]"],
                          }),
                          e.jsxs("span", {
                            className: `font-black shrink-0 ${t.type === "SYSTEM" ? "text-[#3B82F6]" : t.type === "STINT_ANALYSIS" ? "text-[#8B5CF6]" : t.type === "OBSERVATION" ? "text-[#FFB800]" : t.type === "RECOMMENDATION" ? "text-[#00D17F]" : "text-[#FF4D4D]"}`,
                            children: [t.type, ":"],
                          }),
                          e.jsx("span", {
                            className: "whitespace-pre-line text-white font-bold",
                            children: t.content,
                          }),
                        ],
                      },
                      r,
                    ),
                  ),
                  c &&
                    e.jsxs("div", {
                      className: "flex items-center gap-2 text-[#7A828C] animate-pulse",
                      children: [
                        e.jsx(G, { className: "h-3 w-3 animate-spin" }),
                        "ENGINE CALCULATING COUPLINGS...",
                      ],
                    }),
                  e.jsx("div", { ref: I }),
                ],
              }),
              e.jsxs("form", {
                onSubmit: K,
                className: "border-t border-[#1C2430] bg-[#0B0F14] p-3 flex gap-2 shrink-0",
                children: [
                  e.jsx("span", {
                    className: "text-[#3B82F6] font-black text-xs shrink-0 self-center pl-1",
                    children: "> ENGINE_CMD:",
                  }),
                  e.jsx("input", {
                    type: "text",
                    value: f,
                    onChange: (t) => j(t.target.value),
                    placeholder:
                      "Query vehicle setup or input preset: /stires, /dampers, /stint, /reset",
                    className:
                      "flex-1 bg-[#05070A] border border-[#1C2430] rounded-sm px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#3B82F6] font-bold",
                    disabled: c,
                  }),
                  e.jsxs("button", {
                    type: "submit",
                    disabled: c || !f.trim(),
                    className:
                      "border border-[#1C2430] bg-[#11161D] hover:bg-[#161C24] px-4 rounded-sm text-xs font-bold text-[#3B82F6] disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer",
                    children: [e.jsx(le, { className: "h-3 w-3" }), "SEND"],
                  }),
                ],
              }),
            ],
          }),
          e.jsxs("section", {
            className: "col-span-5 flex flex-col justify-between overflow-hidden bg-[#0B0F14]",
            children: [
              e.jsxs("div", {
                className:
                  "px-4 py-2 border-b border-[#1C2430] bg-[#0B0F14] text-[9px] uppercase tracking-widest text-[#7A828C] font-black flex items-center justify-between shrink-0",
                children: [
                  e.jsxs("span", {
                    className: "flex items-center gap-1.5",
                    children: [
                      e.jsx($, { className: "h-3.5 w-3.5 text-[#3B82F6]" }),
                      " Calibrated Dampers & Tires Matrix",
                    ],
                  }),
                  e.jsx("span", {
                    className:
                      "text-[8px] border border-[#1C2430] px-1.5 py-0.5 bg-[#05070A] text-[#7A828C]",
                    children: "4-CORNER MATRIX",
                  }),
                ],
              }),
              e.jsxs("div", {
                className:
                  "border-b border-[#1C2430]/60 bg-[#11161D] p-3 shrink-0 flex items-center justify-between",
                children: [
                  e.jsx("span", {
                    className: "text-[9px] uppercase font-bold text-[#7A828C]",
                    children: "Presets Quick Tweak:",
                  }),
                  e.jsxs("div", {
                    className: "flex gap-2",
                    children: [
                      e.jsxs("button", {
                        onClick: L,
                        disabled: c,
                        className:
                          "flex items-center gap-1 border border-[#1C2430] bg-[#0B0F14] hover:bg-[#161C24] px-2.5 py-1 text-[9px] font-bold text-white cursor-pointer",
                        children: [
                          e.jsx($, { className: "h-3 w-3 text-[#3B82F6]" }),
                          "TIRES PRESS",
                        ],
                      }),
                      e.jsxs("button", {
                        onClick: M,
                        disabled: c,
                        className:
                          "flex items-center gap-1 border border-[#1C2430] bg-[#0B0F14] hover:bg-[#161C24] px-2.5 py-1 text-[9px] font-bold text-white cursor-pointer",
                        children: [
                          e.jsx(oe, { className: "h-3 w-3 text-[#FFB800]" }),
                          "DAMPERS SHOCK",
                        ],
                      }),
                      e.jsxs("button", {
                        onClick: v,
                        disabled: c,
                        className:
                          "flex items-center gap-1 border border-[#1C2430] bg-[#0B0F14] hover:bg-[#161C24] px-2.5 py-1 text-[9px] font-bold text-[#00D17F] cursor-pointer",
                        children: [
                          e.jsx(V, { className: "h-3 w-3 text-[#00D17F]" }),
                          "STINT DETECT",
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "flex-1 min-h-0 overflow-y-auto p-4 select-text",
                children: [
                  e.jsx("div", {
                    className: "border border-[#1C2430] bg-[#05070A] overflow-hidden",
                    children: e.jsxs("table", {
                      className: "w-full font-mono text-[10px] text-left border-collapse",
                      children: [
                        e.jsx("thead", {
                          children: e.jsxs("tr", {
                            className:
                              "bg-[#11161D] border-b border-[#1C2430] text-[#7A828C] uppercase font-bold",
                            children: [
                              e.jsx("th", {
                                className: "p-2 border-r border-[#1C2430] w-[35%]",
                                children: "PARAMETER",
                              }),
                              e.jsx("th", {
                                className: "p-2 border-r border-[#1C2430] text-center w-[16.25%]",
                                children: "FL",
                              }),
                              e.jsx("th", {
                                className: "p-2 border-r border-[#1C2430] text-center w-[16.25%]",
                                children: "FR",
                              }),
                              e.jsx("th", {
                                className: "p-2 border-r border-[#1C2430] text-center w-[16.25%]",
                                children: "RL",
                              }),
                              e.jsx("th", {
                                className: "p-2 text-center w-[16.25%]",
                                children: "RR",
                              }),
                            ],
                          }),
                        }),
                        e.jsx("tbody", {
                          className: "divide-y divide-[#1C2430]",
                          children: _.map((t, r) =>
                            e.jsxs(
                              "tr",
                              {
                                className: "hover:bg-[#11161D]/45 font-bold",
                                children: [
                                  e.jsx("td", {
                                    className:
                                      "p-2 border-r border-[#1C2430] text-white font-bold text-[9px]",
                                    children: t.param,
                                  }),
                                  e.jsxs("td", {
                                    className:
                                      "p-2 border-r border-[#1C2430] text-center leading-normal",
                                    children: [
                                      e.jsx("div", { children: t.fl }),
                                      t.flDelta &&
                                        t.flDelta !== "+0" &&
                                        t.flDelta !== "0" &&
                                        e.jsxs("div", {
                                          className: `text-[8px] mt-0.5 ${S(t.flStatus)}`,
                                          children: ["(", t.flDelta, ")"],
                                        }),
                                    ],
                                  }),
                                  e.jsxs("td", {
                                    className:
                                      "p-2 border-r border-[#1C2430] text-center leading-normal",
                                    children: [
                                      e.jsx("div", { children: t.fr }),
                                      t.frDelta &&
                                        t.frDelta !== "+0" &&
                                        t.frDelta !== "0" &&
                                        e.jsxs("div", {
                                          className: `text-[8px] mt-0.5 ${S(t.frStatus)}`,
                                          children: ["(", t.frDelta, ")"],
                                        }),
                                    ],
                                  }),
                                  e.jsxs("td", {
                                    className:
                                      "p-2 border-r border-[#1C2430] text-center leading-normal",
                                    children: [
                                      e.jsx("div", { children: t.rl }),
                                      t.rlDelta &&
                                        t.rlDelta !== "+0" &&
                                        t.rlDelta !== "0" &&
                                        e.jsxs("div", {
                                          className: `text-[8px] mt-0.5 ${S(t.rlStatus)}`,
                                          children: ["(", t.rlDelta, ")"],
                                        }),
                                    ],
                                  }),
                                  e.jsxs("td", {
                                    className: "p-2 text-center leading-normal",
                                    children: [
                                      e.jsx("div", { children: t.rr }),
                                      t.rrDelta &&
                                        t.rrDelta !== "+0" &&
                                        t.rrDelta !== "0" &&
                                        e.jsxs("div", {
                                          className: `text-[8px] mt-0.5 ${S(t.rrStatus)}`,
                                          children: ["(", t.rrDelta, ")"],
                                        }),
                                    ],
                                  }),
                                ],
                              },
                              r,
                            ),
                          ),
                        }),
                      ],
                    }),
                  }),
                  e.jsxs("div", {
                    className:
                      "mt-4 border border-[#1C2430] bg-[#05070A] p-3 text-[10px] text-[#7A828C] leading-relaxed uppercase",
                    children: [
                      e.jsxs("h4", {
                        className: "font-bold text-white text-[9px] mb-1 flex items-center gap-1.5",
                        children: [
                          e.jsx(ce, { className: "h-3.5 w-3.5 text-[#FFB800]" }),
                          "active calibration guidelines",
                        ],
                      }),
                      e.jsxs("p", {
                        className: "mt-0.5",
                        children: [
                          "• Delta figures in ",
                          e.jsx("span", {
                            className: "text-[#00D17F] font-bold",
                            children: "green",
                          }),
                          " represent optimal recommended offsets resolved from rolling telemetry telemetry logs.",
                        ],
                      }),
                      e.jsxs("p", {
                        className: "mt-0.5",
                        children: [
                          "• Figures in ",
                          e.jsx("span", { className: "text-[#FF4D4D] font-bold", children: "red" }),
                          " represent variables triggering alert constraints during peak high lateral compression periods.",
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs("div", {
                className:
                  "border-t border-[#1C2430] bg-[#11161D] p-3 shrink-0 flex items-center justify-between text-[10px]",
                children: [
                  e.jsx("span", {
                    className: "text-[#7A828C] uppercase font-bold",
                    children: "ACTIVE TELEMETRY HOOK:",
                  }),
                  e.jsxs("span", {
                    className:
                      "text-[#00D17F] font-black tracking-wider flex items-center gap-1.5 animate-pulse",
                    children: [
                      e.jsx(V, { className: "h-3.5 w-3.5" }),
                      " 60Hz DIRECT RECEIVER FEEDING",
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      e.jsxs("footer", {
        className:
          "border-t border-[#1C2430] bg-[#0B0F14] px-4 py-2 text-[10px] uppercase text-[#7A828C] flex items-center justify-between select-none",
        children: [
          e.jsxs("span", {
            className: "flex items-center gap-2",
            children: [
              e.jsx("span", { className: "size-1.5 rounded-full bg-[#00D17F]" }),
              "TELEMETRY CONSOLE COUPLING ACTIVE",
            ],
          }),
          e.jsxs("div", {
            className: "flex gap-4 font-bold text-white",
            children: [
              e.jsxs("span", {
                children: [
                  "ERS: ",
                  e.jsx("span", { className: "text-[#8B5CF6]", children: "4.2MJ / 4.0MJ" }),
                ],
              }),
              e.jsxs("span", {
                children: [
                  "BBIAS: ",
                  e.jsxs("span", {
                    className: "text-[#00D17F]",
                    children: [a.brakeBias.toFixed(1), "%"],
                  }),
                ],
              }),
              e.jsxs("span", {
                children: ["SOF: ", e.jsx("span", { children: a.sof.toLocaleString() })],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
export { Re as component };
