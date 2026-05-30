import { jsxs, jsx } from "react/jsx-runtime";
import React__default, { useRef, useState, useEffect } from "react";
import { Terminal, Loader2, Volume2, RotateCcw, Send, Sliders, Wrench, Activity, AlertTriangle } from "lucide-react";
import { A as AppHeader } from "./AppHeader-B_iAqR4F.js";
import { K as useTelemetry, N as useWorkbench, x as resolveLLMUrl, S as SETUP_BIBLE } from "./router-D8VllJ-f.js";
import { toast } from "sonner";
import { p as parseCarSetup } from "./setup-CA-YNL5H.js";
import "@tanstack/react-router";
import "zod";
import "@radix-ui/react-dialog";
import "class-variance-authority";
import "@radix-ui/react-scroll-area";
import "../server.js";
import "seroval";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./auth-middleware-Cz-8T2yV.js";
import "./tts.functions-CbCKt0n5.js";
import "./BackButton-D1X33uYM.js";
import "./useRuntimeStatus-C58D6jGD.js";
import "@tanstack/react-query";
import "./charts-IpNGhCyp.js";
import "@supabase/supabase-js";
import "zustand";
import "zustand/middleware";
import "./schema-BU1MXGgz.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-tabs";
import "@radix-ui/react-slot";
import "./client.server-Y-0AANJ4.js";
function AIEngineerTerminal() {
  const t = useTelemetry();
  const parsedWorkbench = useWorkbench((state) => state.parsed);
  const parsedSetup = React__default.useMemo(() => {
    if (!parsedWorkbench?.meta?.sessionInfoYaml) return null;
    try {
      return parseCarSetup(parsedWorkbench.meta.sessionInfoYaml);
    } catch {
      return null;
    }
  }, [parsedWorkbench]);
  const consoleEndRef = useRef(null);
  const [cmdInput, setCmdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [activeCar, setActiveCar] = useState("AMG GT3 Evo");
  const [activeTrack, setActiveTrack] = useState("Spa-Francorchamps");
  const [logs, setLogs] = useState([{
    timestamp: "15:45:01",
    type: "SYSTEM",
    content: "PW-ENGINEER ENGINE: DETECTED HARDWARE PROTOCOL. LAUNCHING WORKSTATION CORE."
  }, {
    timestamp: "15:45:02",
    type: "SYSTEM",
    content: `TELEMETRY HANDSHAKE: ws://127.0.0.1:3001 ACTIVE (STATE: ${t.connected ? "REALTIME" : "SIMULATED"}).`
  }, {
    timestamp: "15:45:10",
    type: "STINT_ANALYSIS",
    content: "INITIATING SECTOR DATA INSPECTION FOR TURN 4 (EAU ROUGE / RAIDILLON ENTRY)."
  }, {
    timestamp: "15:45:12",
    type: "OBSERVATION",
    content: "Rear instability detected under trail braking. Shock telemetry reports high rebound velocity mismatch in rear axle."
  }, {
    timestamp: "15:45:14",
    type: "RECOMMENDATION",
    content: "- Reduce rear rebound dampers 1 click\n- Smooth brake pressure release ramp\n- Shift throttle rotation point 2.5 meters earlier"
  }]);
  const [setup, setSetup] = useState([{
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
    rrStatus: "ok"
  }, {
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
    rrStatus: "adjust"
  }, {
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
    rrStatus: "adjust"
  }, {
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
    rrStatus: "ok"
  }, {
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
    rrStatus: "ok"
  }]);
  useEffect(() => {
    if (t.car) setActiveCar(`${t.car} #${t.carNumber}`);
    if (t.track) setActiveTrack(t.track);
  }, [t.car, t.track, t.carNumber]);
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [logs]);
  const addSystemLog = (content) => {
    const time = (/* @__PURE__ */ new Date()).toTimeString().split(" ")[0];
    setLogs((prev) => [...prev, {
      timestamp: time,
      type: "SYSTEM",
      content
    }]);
  };
  const addEngineLog = (type, content) => {
    const time = (/* @__PURE__ */ new Date()).toTimeString().split(" ")[0];
    setLogs((prev) => [...prev, {
      timestamp: time,
      type,
      content
    }]);
  };
  const runStintAnalysis = () => {
    setLoading(true);
    addSystemLog(`STINT SYSTEM DISPATCH: ANALYZING LAST 5 RUNS ON ${activeTrack.toUpperCase()}...`);
    setTimeout(() => {
      addEngineLog("STINT_ANALYSIS", `LATERAL FORCE CORRELATION AT ${activeTrack.toUpperCase()} CORNER SPAN.`);
      addEngineLog("OBSERVATION", "Tire temperatures at FR axle peaking at 98.4°C. Severe slide energy on exit slip angles.");
      addEngineLog("RECOMMENDATION", "- Reduce tire pressures on FR by 0.8 psi\n- Adjust brake bias forward 0.5% to decrease front slide loading\n- Open ERS map deployment by 1 click");
      setLoading(false);
      toast.success("Sector stint analysis completed.");
    }, 1200);
  };
  const tweakDampers = () => {
    setLoading(true);
    addSystemLog("DAMPER MATH COMPILATION ROUTINE: RESOLVING SHOCK TRANSIENTS...");
    setTimeout(() => {
      addEngineLog("STINT_ANALYSIS", "RESOLVED SUSPENSION HISTOGRAMS.");
      addEngineLog("OBSERVATION", "Over-stiffness detected over Turn 11 high curbs. Compression energy causing wheel hop.");
      addEngineLog("RECOMMENDATION", "- Soften front bump dampers by 2 clicks\n- Increase rear rebound by 1 click to control pitch velocity");
      setSetup((prev) => prev.map((item) => {
        if (item.param.includes("DAMPER BUMP")) {
          return {
            ...item,
            flDelta: "-2",
            frDelta: "-2",
            flStatus: "adjust",
            frStatus: "adjust"
          };
        }
        if (item.param.includes("DAMPER REBOUND")) {
          return {
            ...item,
            rlDelta: "-2",
            rrDelta: "-2",
            rlStatus: "adjust",
            rrStatus: "adjust"
          };
        }
        return item;
      }));
      setLoading(false);
      toast.success("Damper coefficients adjusted in matrix.");
    }, 1e3);
  };
  const optimizeTires = () => {
    setLoading(true);
    addSystemLog("THERMODYNAMIC TIRE WEAR REGIME: RESOLVING PRESSURE DEFICITS...");
    setTimeout(() => {
      addEngineLog("STINT_ANALYSIS", "TIRE CARCASS EXPANSION COEFFICIENT RESOLUTION.");
      addEngineLog("OBSERVATION", "Rear right tire cold core pressure failing to reach active window target (active: 23.8, target: 24.5).");
      addEngineLog("RECOMMENDATION", "- Increase rear right cold pressure by 0.5 psi\n- Decrease front left pressure by 0.3 psi to equalize wear footprint");
      setSetup((prev) => prev.map((item) => {
        if (item.param.includes("COLD TIRE PRESSURES")) {
          return {
            ...item,
            flDelta: "-0.3",
            rrDelta: "+0.5",
            flStatus: "adjust",
            rrStatus: "adjust"
          };
        }
        return item;
      }));
      setLoading(false);
      toast.success("Cold tire targets optimized.");
    }, 1100);
  };
  const sendPrompt = async (cmd) => {
    setLoading(true);
    try {
      if (cmd.toLowerCase() === "/stint") {
        runStintAnalysis();
        return;
      }
      if (cmd.toLowerCase() === "/dampers") {
        tweakDampers();
        return;
      }
      if (cmd.toLowerCase() === "/tires") {
        optimizeTires();
        return;
      }
      if (cmd.toLowerCase() === "/reset") {
        setLogs([{
          timestamp: (/* @__PURE__ */ new Date()).toTimeString().split(" ")[0],
          type: "SYSTEM",
          content: "PW-ENGINEER ENGINE: CONSOLE RESET COMPLETE."
        }]);
        setLoading(false);
        return;
      }
      const {
        llmBaseUrl,
        llmModelId,
        llmApiKey
      } = useWorkbench.getState();
      const url = resolveLLMUrl(llmBaseUrl);
      const headers = {
        "Content-Type": "application/json"
      };
      if (llmApiKey) headers["Authorization"] = `Bearer ${llmApiKey}`;
      let setupContextStr = "";
      if (parsedSetup) {
        setupContextStr = "\nActual Parsed iRacing Setup Parameters:\n" + Object.entries(parsedSetup.flat).map(([k, v]) => `- ${k}: ${v}`).join("\n");
      } else {
        setupContextStr = `
      - Damper status: Rebound Front 12 clicks, Bump Front 8 clicks, Rebound Rear 10 clicks, Bump Rear 6 clicks.
      - Cold tire pressure targets: FL 24.5, FR 24.8, RL 24.2, RR 24.5.`;
      }
      const contextPrompt = `You are a motorsport race engineer on the pit wall for a professional GT3/GTP race team.
      The driver has typed a command: "${cmd}".
      Current telemetry session state:
      - Track: ${activeTrack}
      - Car: ${activeCar}
      - Speed: ${t.speedKph} kph
      - Active Sector bests: S1 ${t.sectors.s1 ?? "--.---"} | S2 ${t.sectors.s2 ?? "--.---"} | S3 ${t.sectors.s3 ?? "--.---"}
      ${setupContextStr}
 
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
      ${SETUP_BIBLE}
      ==========================================
 
      Based on this telemetry, provide a professional, dense, and tactical motorsport engineering response.
      Use exactly this log layout format (do not use markdown paragraphs, use mechanical lists instead):
      [OBSERVATION] (Identify telemetry anomalies, instability, slide slip, damper spikes, tire overheating)
      [RECOMMENDATION] (List Spring/Damper/Tire pressure clicks or driving style tweaks explicitly, citing the specific textbook chapter/flowchart, e.g. "Tim McArthur Flowchart: Road Understeer #1 (ARB)" or "eBook: ch. TIRE PRESSURES")
 
      Be concise, technical, and authoritative. Speak like a pro-team engineer.`;
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: llmModelId || "local-model",
          messages: [{
            role: "user",
            content: contextPrompt
          }],
          temperature: 0.6
        })
      });
      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const lines = content.split("\n").filter((l) => l.trim() !== "");
          let obs = "";
          let recs = "";
          let readingObs = false;
          let readingRecs = false;
          for (const line of lines) {
            if (line.includes("[OBSERVATION]")) {
              readingObs = true;
              readingRecs = false;
              obs = line.replace("[OBSERVATION]", "").trim();
            } else if (line.includes("[RECOMMENDATION]")) {
              readingObs = false;
              readingRecs = true;
              recs = line.replace("[RECOMMENDATION]", "").trim();
            } else {
              if (readingObs) obs += "\n" + line;
              if (readingRecs) recs += "\n" + line;
            }
          }
          if (obs) addEngineLog("OBSERVATION", obs.trim());
          if (recs) addEngineLog("RECOMMENDATION", recs.trim());
          if (!obs && !recs) addEngineLog("RECOMMENDATION", content.trim());
        }
      } else {
        addEngineLog("RECOMMENDATION", `ENGINE PROTOCOL ECHO: UNABLE TO CONTACT SERVER (${res.status}).
PROPOSED TWEAK: Reduce ERS deployment by 2% to equalize thermal exit limits.`);
      }
    } catch (e) {
      addEngineLog("ERROR", `LLM OFFLINE: ${e.message}. ENGAGING LOCAL SIM MODE.`);
      addEngineLog("OBSERVATION", "Mild understeer on apex throttle transitions.");
      addEngineLog("RECOMMENDATION", "- Soften front anti-roll bar 1 step\n- Increase rear aerodynamic wing angle (+0.5°)");
    } finally {
      setLoading(false);
    }
  };
  const handleCommandSubmit = async (e) => {
    e.preventDefault();
    if (!cmdInput.trim() || loading) return;
    const cmd = cmdInput.trim();
    setCmdInput("");
    addEngineLog("SYSTEM", `> ENGINE_CMD: ${cmd}`);
    await sendPrompt(cmd);
  };
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("analyzeSetup") === "true") {
      window.history.replaceState({}, document.title, window.location.pathname);
      const autoRun = async () => {
        addSystemLog("PIT WALL COMMS PROTOCOL: AUTOMATIC VEHICLE SETUP HANDSHAKE INITIALIZED.");
        await new Promise((resolve) => setTimeout(resolve, 600));
        const autoCmd = "Please analyze my parsed setup and suggest baseline handling optimizations.";
        addEngineLog("SYSTEM", `> ENGINE_CMD: ${autoCmd}`);
        await sendPrompt(autoCmd);
      };
      autoRun();
    }
  }, [parsedSetup]);
  const speakLastRecom = async () => {
    if (speaking) return;
    const recomLog = [...logs].reverse().find((l) => l.type === "RECOMMENDATION");
    if (!recomLog) {
      toast.error("No recommendation found in log to read.");
      return;
    }
    setSpeaking(true);
    try {
      const {
        speak
      } = await import("./tts-client-D74KVeiv.js");
      await speak(`Attention driver. Recommendation details: ${recomLog.content}`);
    } catch {
      toast.error("Text-to-Speech service unavailable.");
    } finally {
      setSpeaking(false);
    }
  };
  const statusColor = (s) => {
    if (s === "warn") return "text-[#FF4D4D] font-bold";
    if (s === "adjust") return "text-[#00D17F] font-bold";
    return "text-[#7A828C]";
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex h-screen flex-col bg-[#05070A] text-[#E2E4E8] font-mono select-none", children: [
    /* @__PURE__ */ jsxs(AppHeader, { children: [
      /* @__PURE__ */ jsx("span", { className: "font-mono text-xs uppercase tracking-wider text-[#7A828C]", children: "AI ENGINEER COMMAND" }),
      /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "·" }),
      /* @__PURE__ */ jsx("span", { className: "text-white font-bold", children: activeCar }),
      /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "·" }),
      /* @__PURE__ */ jsx("span", { className: "text-white font-mono uppercase tracking-wider", children: activeTrack })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: "flex-1 min-h-0 w-full grid grid-cols-12 gap-0 border-t border-[#1C2430]", children: [
      /* @__PURE__ */ jsxs("section", { className: "col-span-7 flex flex-col justify-between overflow-hidden border-r border-[#1C2430] bg-[#05070A]", children: [
        /* @__PURE__ */ jsxs("div", { className: "px-4 py-2 border-b border-[#1C2430] bg-[#0B0F14] text-[9px] uppercase tracking-widest text-[#7A828C] font-black flex items-center justify-between shrink-0", children: [
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(Terminal, { className: "h-3.5 w-3.5 text-[#3B82F6]" }),
            " Active Strategy Terminal Logs"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxs("button", { onClick: speakLastRecom, disabled: speaking, className: "flex items-center gap-1 border border-[#1C2430] bg-[#11161D] hover:bg-[#161C24] px-2 py-0.5 rounded text-[8px] tracking-wider text-white disabled:opacity-40", children: [
              speaking ? /* @__PURE__ */ jsx(Loader2, { className: "h-2.5 w-2.5 animate-spin" }) : /* @__PURE__ */ jsx(Volume2, { className: "h-2.5 w-2.5" }),
              "SPEAK LAST"
            ] }),
            /* @__PURE__ */ jsxs("button", { onClick: () => setLogs([]), className: "flex items-center gap-1 border border-[#1C2430] bg-[#11161D] hover:bg-[#161C24] px-2 py-0.5 rounded text-[8px] tracking-wider text-white", children: [
              /* @__PURE__ */ jsx(RotateCcw, { className: "h-2.5 w-2.5" }),
              "RESET LOG"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-h-0 overflow-y-auto p-4 space-y-3 font-mono text-[10px] leading-relaxed bg-[#05070A] select-text", children: [
          logs.map((log, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 animate-in fade-in-50 duration-200", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-[#7A828C] shrink-0 font-bold", children: [
              "[",
              log.timestamp,
              "]"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: `font-black shrink-0 ${log.type === "SYSTEM" ? "text-[#3B82F6]" : log.type === "STINT_ANALYSIS" ? "text-[#8B5CF6]" : log.type === "OBSERVATION" ? "text-[#FFB800]" : log.type === "RECOMMENDATION" ? "text-[#00D17F]" : "text-[#FF4D4D]"}`, children: [
              log.type,
              ":"
            ] }),
            /* @__PURE__ */ jsx("span", { className: "whitespace-pre-line text-white font-bold", children: log.content })
          ] }, i)),
          loading && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-[#7A828C] animate-pulse", children: [
            /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin" }),
            "ENGINE CALCULATING COUPLINGS..."
          ] }),
          /* @__PURE__ */ jsx("div", { ref: consoleEndRef })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleCommandSubmit, className: "border-t border-[#1C2430] bg-[#0B0F14] p-3 flex gap-2 shrink-0", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[#3B82F6] font-black text-xs shrink-0 self-center pl-1", children: "> ENGINE_CMD:" }),
          /* @__PURE__ */ jsx("input", { type: "text", value: cmdInput, onChange: (e) => setCmdInput(e.target.value), placeholder: "Query vehicle setup or input preset: /stires, /dampers, /stint, /reset", className: "flex-1 bg-[#05070A] border border-[#1C2430] rounded-sm px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#3B82F6] font-bold", disabled: loading }),
          /* @__PURE__ */ jsxs("button", { type: "submit", disabled: loading || !cmdInput.trim(), className: "border border-[#1C2430] bg-[#11161D] hover:bg-[#161C24] px-4 rounded-sm text-xs font-bold text-[#3B82F6] disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer", children: [
            /* @__PURE__ */ jsx(Send, { className: "h-3 w-3" }),
            "SEND"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "col-span-5 flex flex-col justify-between overflow-hidden bg-[#0B0F14]", children: [
        /* @__PURE__ */ jsxs("div", { className: "px-4 py-2 border-b border-[#1C2430] bg-[#0B0F14] text-[9px] uppercase tracking-widest text-[#7A828C] font-black flex items-center justify-between shrink-0", children: [
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(Sliders, { className: "h-3.5 w-3.5 text-[#3B82F6]" }),
            " Calibrated Dampers & Tires Matrix"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-[8px] border border-[#1C2430] px-1.5 py-0.5 bg-[#05070A] text-[#7A828C]", children: "4-CORNER MATRIX" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border-b border-[#1C2430]/60 bg-[#11161D] p-3 shrink-0 flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[9px] uppercase font-bold text-[#7A828C]", children: "Presets Quick Tweak:" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxs("button", { onClick: optimizeTires, disabled: loading, className: "flex items-center gap-1 border border-[#1C2430] bg-[#0B0F14] hover:bg-[#161C24] px-2.5 py-1 text-[9px] font-bold text-white cursor-pointer", children: [
              /* @__PURE__ */ jsx(Sliders, { className: "h-3 w-3 text-[#3B82F6]" }),
              "TIRES PRESS"
            ] }),
            /* @__PURE__ */ jsxs("button", { onClick: tweakDampers, disabled: loading, className: "flex items-center gap-1 border border-[#1C2430] bg-[#0B0F14] hover:bg-[#161C24] px-2.5 py-1 text-[9px] font-bold text-white cursor-pointer", children: [
              /* @__PURE__ */ jsx(Wrench, { className: "h-3 w-3 text-[#FFB800]" }),
              "DAMPERS SHOCK"
            ] }),
            /* @__PURE__ */ jsxs("button", { onClick: runStintAnalysis, disabled: loading, className: "flex items-center gap-1 border border-[#1C2430] bg-[#0B0F14] hover:bg-[#161C24] px-2.5 py-1 text-[9px] font-bold text-[#00D17F] cursor-pointer", children: [
              /* @__PURE__ */ jsx(Activity, { className: "h-3 w-3 text-[#00D17F]" }),
              "STINT DETECT"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-h-0 overflow-y-auto p-4 select-text", children: [
          /* @__PURE__ */ jsx("div", { className: "border border-[#1C2430] bg-[#05070A] overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "w-full font-mono text-[10px] text-left border-collapse", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-[#11161D] border-b border-[#1C2430] text-[#7A828C] uppercase font-bold", children: [
              /* @__PURE__ */ jsx("th", { className: "p-2 border-r border-[#1C2430] w-[35%]", children: "PARAMETER" }),
              /* @__PURE__ */ jsx("th", { className: "p-2 border-r border-[#1C2430] text-center w-[16.25%]", children: "FL" }),
              /* @__PURE__ */ jsx("th", { className: "p-2 border-r border-[#1C2430] text-center w-[16.25%]", children: "FR" }),
              /* @__PURE__ */ jsx("th", { className: "p-2 border-r border-[#1C2430] text-center w-[16.25%]", children: "RL" }),
              /* @__PURE__ */ jsx("th", { className: "p-2 text-center w-[16.25%]", children: "RR" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-[#1C2430]", children: setup.map((item, i) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-[#11161D]/45 font-bold", children: [
              /* @__PURE__ */ jsx("td", { className: "p-2 border-r border-[#1C2430] text-white font-bold text-[9px]", children: item.param }),
              /* @__PURE__ */ jsxs("td", { className: "p-2 border-r border-[#1C2430] text-center leading-normal", children: [
                /* @__PURE__ */ jsx("div", { children: item.fl }),
                item.flDelta && item.flDelta !== "+0" && item.flDelta !== "0" && /* @__PURE__ */ jsxs("div", { className: `text-[8px] mt-0.5 ${statusColor(item.flStatus)}`, children: [
                  "(",
                  item.flDelta,
                  ")"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("td", { className: "p-2 border-r border-[#1C2430] text-center leading-normal", children: [
                /* @__PURE__ */ jsx("div", { children: item.fr }),
                item.frDelta && item.frDelta !== "+0" && item.frDelta !== "0" && /* @__PURE__ */ jsxs("div", { className: `text-[8px] mt-0.5 ${statusColor(item.frStatus)}`, children: [
                  "(",
                  item.frDelta,
                  ")"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("td", { className: "p-2 border-r border-[#1C2430] text-center leading-normal", children: [
                /* @__PURE__ */ jsx("div", { children: item.rl }),
                item.rlDelta && item.rlDelta !== "+0" && item.rlDelta !== "0" && /* @__PURE__ */ jsxs("div", { className: `text-[8px] mt-0.5 ${statusColor(item.rlStatus)}`, children: [
                  "(",
                  item.rlDelta,
                  ")"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("td", { className: "p-2 text-center leading-normal", children: [
                /* @__PURE__ */ jsx("div", { children: item.rr }),
                item.rrDelta && item.rrDelta !== "+0" && item.rrDelta !== "0" && /* @__PURE__ */ jsxs("div", { className: `text-[8px] mt-0.5 ${statusColor(item.rrStatus)}`, children: [
                  "(",
                  item.rrDelta,
                  ")"
                ] })
              ] })
            ] }, i)) })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 border border-[#1C2430] bg-[#05070A] p-3 text-[10px] text-[#7A828C] leading-relaxed uppercase", children: [
            /* @__PURE__ */ jsxs("h4", { className: "font-bold text-white text-[9px] mb-1 flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(AlertTriangle, { className: "h-3.5 w-3.5 text-[#FFB800]" }),
              "active calibration guidelines"
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "mt-0.5", children: [
              "• Delta figures in ",
              /* @__PURE__ */ jsx("span", { className: "text-[#00D17F] font-bold", children: "green" }),
              " represent optimal recommended offsets resolved from rolling telemetry telemetry logs."
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "mt-0.5", children: [
              "• Figures in ",
              /* @__PURE__ */ jsx("span", { className: "text-[#FF4D4D] font-bold", children: "red" }),
              " represent variables triggering alert constraints during peak high lateral compression periods."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border-t border-[#1C2430] bg-[#11161D] p-3 shrink-0 flex items-center justify-between text-[10px]", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[#7A828C] uppercase font-bold", children: "ACTIVE TELEMETRY HOOK:" }),
          /* @__PURE__ */ jsxs("span", { className: "text-[#00D17F] font-black tracking-wider flex items-center gap-1.5 animate-pulse", children: [
            /* @__PURE__ */ jsx(Activity, { className: "h-3.5 w-3.5" }),
            " 60Hz DIRECT RECEIVER FEEDING"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("footer", { className: "border-t border-[#1C2430] bg-[#0B0F14] px-4 py-2 text-[10px] uppercase text-[#7A828C] flex items-center justify-between select-none", children: [
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "size-1.5 rounded-full bg-[#00D17F]" }),
        "TELEMETRY CONSOLE COUPLING ACTIVE"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-4 font-bold text-white", children: [
        /* @__PURE__ */ jsxs("span", { children: [
          "ERS: ",
          /* @__PURE__ */ jsx("span", { className: "text-[#8B5CF6]", children: "4.2MJ / 4.0MJ" })
        ] }),
        /* @__PURE__ */ jsxs("span", { children: [
          "BBIAS: ",
          /* @__PURE__ */ jsxs("span", { className: "text-[#00D17F]", children: [
            t.brakeBias.toFixed(1),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("span", { children: [
          "SOF: ",
          /* @__PURE__ */ jsx("span", { children: t.sof.toLocaleString() })
        ] })
      ] })
    ] })
  ] });
}
export {
  AIEngineerTerminal as component
};
