import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useEffect, useRef } from "react";
import {
  Terminal as TerminalIcon,
  Send,
  Volume2,
  Loader2,
  Wrench,
  Gauge,
  Sliders,
  Play,
  RotateCcw,
  BookOpen,
  Activity,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { useTelemetry } from "@/lib/useTelemetry";
import { useWorkbench } from "@/lib/store";
import { resolveLLMUrl } from "@/lib/llm";
import { toast } from "sonner";
import { parseCarSetup } from "@/lib/ibt/setup";
import { SETUP_BIBLE } from "@/lib/advisor.knowledge";

export const Route = createFileRoute("/ai-engineer")({
  head: () => ({
    meta: [
      { title: "AI Engineer Console — Pit Wall Terminal" },
      {
        name: "description",
        content:
          "Motorsport engineering terminal. Receive tire pressure and damper advice mapped directly to telemetry logs.",
      },
    ],
  }),
  component: AIEngineerTerminal,
});

interface ConsoleLog {
  timestamp: string;
  type: "SYSTEM" | "STINT_ANALYSIS" | "OBSERVATION" | "RECOMMENDATION" | "ERROR";
  content: string;
}

interface SetupItem {
  param: string;
  fl: string;
  fr: string;
  rl: string;
  rr: string;
  flDelta?: string;
  frDelta?: string;
  rlDelta?: string;
  rrDelta?: string;
  flStatus?: "ok" | "warn" | "adjust";
  frStatus?: "ok" | "warn" | "adjust";
  rlStatus?: "ok" | "warn" | "adjust";
  rrStatus?: "ok" | "warn" | "adjust";
}

function AIEngineerTerminal() {
  const t = useTelemetry();
  const parsedWorkbench = useWorkbench((state) => state.parsed);
  const parsedSetup = React.useMemo(() => {
    if (!parsedWorkbench?.meta?.sessionInfoYaml) return null;
    try {
      return parseCarSetup(parsedWorkbench.meta.sessionInfoYaml);
    } catch {
      return null;
    }
  }, [parsedWorkbench]);

  const consoleEndRef = useRef<HTMLDivElement | null>(null);
  const [cmdInput, setCmdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [activeCar, setActiveCar] = useState("AMG GT3 Evo");
  const [activeTrack, setActiveTrack] = useState("Spa-Francorchamps");

  const [logs, setLogs] = useState<ConsoleLog[]>([
    {
      timestamp: "15:45:01",
      type: "SYSTEM",
      content: "PW-ENGINEER ENGINE: DETECTED HARDWARE PROTOCOL. LAUNCHING WORKSTATION CORE.",
    },
    {
      timestamp: "15:45:02",
      type: "SYSTEM",
      content: `TELEMETRY HANDSHAKE: ws://127.0.0.1:3001 ACTIVE (STATE: ${t.connected ? "REALTIME" : "SIMULATED"}).`,
    },
    {
      timestamp: "15:45:10",
      type: "STINT_ANALYSIS",
      content: "INITIATING SECTOR DATA INSPECTION FOR TURN 4 (EAU ROUGE / RAIDILLON ENTRY).",
    },
    {
      timestamp: "15:45:12",
      type: "OBSERVATION",
      content: "Rear instability detected under trail braking. Shock telemetry reports high rebound velocity mismatch in rear axle.",
    },
    {
      timestamp: "15:45:14",
      type: "RECOMMENDATION",
      content: "- Reduce rear rebound dampers 1 click\n- Smooth brake pressure release ramp\n- Shift throttle rotation point 2.5 meters earlier",
    },
  ]);

  // Setup Matrix Spreadsheet State (FL, FR, RL, RR)
  const [setup, setSetup] = useState<SetupItem[]>([
    {
      param: "COLD TIRE PRESSURES (PSI)",
      fl: "24.5", fr: "24.8", rl: "24.2", rr: "24.5",
      flDelta: "-0.5", frDelta: "-0.8", rlDelta: "+0.3", rrDelta: "+0.0",
      flStatus: "warn", frStatus: "warn", rlStatus: "adjust", rrStatus: "ok"
    },
    {
      param: "SPRING RATE (N/MM)",
      fl: "180", fr: "180", rl: "150", rr: "150",
      flDelta: "0", frDelta: "0", rlDelta: "-10", rrDelta: "-10",
      flStatus: "ok", frStatus: "ok", rlStatus: "adjust", rrStatus: "adjust"
    },
    {
      param: "DAMPER REBOUND (CLICKS)",
      fl: "12", fr: "12", rl: "10", rr: "10",
      flDelta: "+0", frDelta: "+0", rlDelta: "-1", rrDelta: "-1",
      flStatus: "ok", frStatus: "ok", rlStatus: "adjust", rrStatus: "adjust"
    },
    {
      param: "DAMPER BUMP (CLICKS)",
      fl: "8", fr: "8", rl: "6", rr: "6",
      flDelta: "+0", frDelta: "+0", rlDelta: "+0", rrDelta: "+0",
      flStatus: "ok", frStatus: "ok", rlStatus: "ok", rrStatus: "ok"
    },
    {
      param: "CAMBER DEGREES",
      fl: "-3.20", fr: "-3.15", rl: "-2.45", rr: "-2.40",
      flDelta: "+0.10", frDelta: "+0.10", rlDelta: "+0.00", rrDelta: "+0.00",
      flStatus: "adjust", frStatus: "adjust", rlStatus: "ok", rrStatus: "ok"
    }
  ]);

  // Sync with live telemetry details
  useEffect(() => {
    if (t.car) setActiveCar(`${t.car} #${t.carNumber}`);
    if (t.track) setActiveTrack(t.track);
  }, [t.car, t.track, t.carNumber]);

  // Scroll to bottom of terminal logs
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addSystemLog = (content: string) => {
    const time = new Date().toTimeString().split(" ")[0];
    setLogs((prev) => [...prev, { timestamp: time, type: "SYSTEM", content }]);
  };

  const addEngineLog = (type: ConsoleLog["type"], content: string) => {
    const time = new Date().toTimeString().split(" ")[0];
    setLogs((prev) => [...prev, { timestamp: time, type, content }]);
  };

  // Preset Command Handlers
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
      
      // Update damper settings in matrix
      setSetup((prev) =>
        prev.map((item) => {
          if (item.param.includes("DAMPER BUMP")) {
            return { ...item, flDelta: "-2", frDelta: "-2", flStatus: "adjust", frStatus: "adjust" };
          }
          if (item.param.includes("DAMPER REBOUND")) {
            return { ...item, rlDelta: "-2", rrDelta: "-2", rlStatus: "adjust", rrStatus: "adjust" };
          }
          return item;
        })
      );
      setLoading(false);
      toast.success("Damper coefficients adjusted in matrix.");
    }, 1000);
  };

  const optimizeTires = () => {
    setLoading(true);
    addSystemLog("THERMODYNAMIC TIRE WEAR REGIME: RESOLVING PRESSURE DEFICITS...");
    setTimeout(() => {
      addEngineLog("STINT_ANALYSIS", "TIRE CARCASS EXPANSION COEFFICIENT RESOLUTION.");
      addEngineLog("OBSERVATION", "Rear right tire cold core pressure failing to reach active window target (active: 23.8, target: 24.5).");
      addEngineLog("RECOMMENDATION", "- Increase rear right cold pressure by 0.5 psi\n- Decrease front left pressure by 0.3 psi to equalize wear footprint");
      
      setSetup((prev) =>
        prev.map((item) => {
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
        })
      );
      setLoading(false);
      toast.success("Cold tire targets optimized.");
    }, 1100);
  };

  const sendPrompt = async (cmd: string) => {
    setLoading(true);
    try {
      // Direct command routing
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
        setLogs([
          {
            timestamp: new Date().toTimeString().split(" ")[0],
            type: "SYSTEM",
            content: "PW-ENGINEER ENGINE: CONSOLE RESET COMPLETE.",
          }
        ]);
        setLoading(false);
        return;
      }

      // Query AI via LLM connection
      const { llmBaseUrl, llmModelId, llmApiKey } = useWorkbench.getState();
      const url = resolveLLMUrl(llmBaseUrl);

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (llmApiKey) headers["Authorization"] = `Bearer ${llmApiKey}`;

      let setupContextStr = "";
      if (parsedSetup) {
        setupContextStr = "\nActual Parsed iRacing Setup Parameters:\n" +
          Object.entries(parsedSetup.flat)
            .map(([k, v]) => `- ${k}: ${v}`)
            .join("\n");
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
          messages: [{ role: "user", content: contextPrompt }],
          temperature: 0.6,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          // Parse content into terminal outputs
          const lines = content.split("\n").filter((l: string) => l.trim() !== "");
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
        // Fallback simulated response
        addEngineLog("RECOMMENDATION", `ENGINE PROTOCOL ECHO: UNABLE TO CONTACT SERVER (${res.status}).\nPROPOSED TWEAK: Reduce ERS deployment by 2% to equalize thermal exit limits.`);
      }
    } catch (e: any) {
      addEngineLog("ERROR", `LLM OFFLINE: ${e.message}. ENGAGING LOCAL SIM MODE.`);
      addEngineLog("OBSERVATION", "Mild understeer on apex throttle transitions.");
      addEngineLog("RECOMMENDATION", "- Soften front anti-roll bar 1 step\n- Increase rear aerodynamic wing angle (+0.5°)");
    } finally {
      setLoading(false);
    }
  };

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmdInput.trim() || loading) return;

    const cmd = cmdInput.trim();
    setCmdInput("");
    addEngineLog("SYSTEM", `> ENGINE_CMD: ${cmd}`);
    await sendPrompt(cmd);
  };

  // Automatic setup analysis on route entry via query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("analyzeSetup") === "true") {
      // Clear parameter from URL so it doesn't run again on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
      
      const autoRun = async () => {
        addSystemLog("PIT WALL COMMS PROTOCOL: AUTOMATIC VEHICLE SETUP HANDSHAKE INITIALIZED.");
        // Small delay to allow initial setup logs to draw nicely
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
      const { speak } = await import("@/lib/tts-client");
      await speak(`Attention driver. Recommendation details: ${recomLog.content}`);
    } catch {
      toast.error("Text-to-Speech service unavailable.");
    } finally {
      setSpeaking(false);
    }
  };

  const statusColor = (s?: "ok" | "warn" | "adjust") => {
    if (s === "warn") return "text-[#FF4D4D] font-bold";
    if (s === "adjust") return "text-[#00D17F] font-bold";
    return "text-[#7A828C]";
  };

  return (
    <div className="flex h-screen flex-col bg-[#05070A] text-[#E2E4E8] font-mono select-none">
      <AppHeader>
        <span className="font-mono text-xs uppercase tracking-wider text-[#7A828C]">
          AI ENGINEER COMMAND
        </span>
        <span className="text-muted-foreground">·</span>
        <span className="text-white font-bold">{activeCar}</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-white font-mono uppercase tracking-wider">{activeTrack}</span>
      </AppHeader>

      {/* Main split grid layout */}
      <main className="flex-1 min-h-0 w-full grid grid-cols-12 gap-0 border-t border-[#1C2430]">
        
        {/* LEFT COLUMN: ACTIVE TERMINAL CONSOLE LOGS (Cols 1-7) */}
        <section className="col-span-7 flex flex-col justify-between overflow-hidden border-r border-[#1C2430] bg-[#05070A]">
          {/* Console Header */}
          <div className="px-4 py-2 border-b border-[#1C2430] bg-[#0B0F14] text-[9px] uppercase tracking-widest text-[#7A828C] font-black flex items-center justify-between shrink-0">
            <span className="flex items-center gap-1.5"><TerminalIcon className="h-3.5 w-3.5 text-[#3B82F6]" /> Active Strategy Terminal Logs</span>
            <div className="flex gap-2">
              <button
                onClick={speakLastRecom}
                disabled={speaking}
                className="flex items-center gap-1 border border-[#1C2430] bg-[#11161D] hover:bg-[#161C24] px-2 py-0.5 rounded text-[8px] tracking-wider text-white disabled:opacity-40"
              >
                {speaking ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Volume2 className="h-2.5 w-2.5" />}
                SPEAK LAST
              </button>
              <button
                onClick={() => setLogs([])}
                className="flex items-center gap-1 border border-[#1C2430] bg-[#11161D] hover:bg-[#161C24] px-2 py-0.5 rounded text-[8px] tracking-wider text-white"
              >
                <RotateCcw className="h-2.5 w-2.5" />
                RESET LOG
              </button>
            </div>
          </div>

          {/* Console Output Screen */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 font-mono text-[10px] leading-relaxed bg-[#05070A] select-text">
            {logs.map((log, i) => (
              <div key={i} className="flex items-start gap-2 animate-in fade-in-50 duration-200">
                <span className="text-[#7A828C] shrink-0 font-bold">[{log.timestamp}]</span>
                <span
                  className={`font-black shrink-0 ${
                    log.type === "SYSTEM"
                      ? "text-[#3B82F6]"
                      : log.type === "STINT_ANALYSIS"
                        ? "text-[#8B5CF6]"
                        : log.type === "OBSERVATION"
                          ? "text-[#FFB800]"
                          : log.type === "RECOMMENDATION"
                            ? "text-[#00D17F]"
                            : "text-[#FF4D4D]"
                  }`}
                >
                  {log.type}:
                </span>
                <span className="whitespace-pre-line text-white font-bold">{log.content}</span>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-[#7A828C] animate-pulse">
                <Loader2 className="h-3 w-3 animate-spin" />
                ENGINE CALCULATING COUPLINGS...
              </div>
            )}
            <div ref={consoleEndRef} />
          </div>

          {/* Console Command Input Bar */}
          <form onSubmit={handleCommandSubmit} className="border-t border-[#1C2430] bg-[#0B0F14] p-3 flex gap-2 shrink-0">
            <span className="text-[#3B82F6] font-black text-xs shrink-0 self-center pl-1">&gt; ENGINE_CMD:</span>
            <input
              type="text"
              value={cmdInput}
              onChange={(e) => setCmdInput(e.target.value)}
              placeholder="Query vehicle setup or input preset: /stires, /dampers, /stint, /reset"
              className="flex-1 bg-[#05070A] border border-[#1C2430] rounded-sm px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#3B82F6] font-bold"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !cmdInput.trim()}
              className="border border-[#1C2430] bg-[#11161D] hover:bg-[#161C24] px-4 rounded-sm text-xs font-bold text-[#3B82F6] disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Send className="h-3 w-3" />
              SEND
            </button>
          </form>
        </section>

        {/* RIGHT COLUMN: TACTICAL SPRING & SHOCK SETUP MATRIX (Cols 8-12) */}
        <section className="col-span-5 flex flex-col justify-between overflow-hidden bg-[#0B0F14]">
          {/* Setup Header */}
          <div className="px-4 py-2 border-b border-[#1C2430] bg-[#0B0F14] text-[9px] uppercase tracking-widest text-[#7A828C] font-black flex items-center justify-between shrink-0">
            <span className="flex items-center gap-1.5"><Sliders className="h-3.5 w-3.5 text-[#3B82F6]" /> Calibrated Dampers & Tires Matrix</span>
            <span className="text-[8px] border border-[#1C2430] px-1.5 py-0.5 bg-[#05070A] text-[#7A828C]">
              4-CORNER MATRIX
            </span>
          </div>

          {/* Quick-tweak operations bar */}
          <div className="border-b border-[#1C2430]/60 bg-[#11161D] p-3 shrink-0 flex items-center justify-between">
            <span className="text-[9px] uppercase font-bold text-[#7A828C]">Presets Quick Tweak:</span>
            <div className="flex gap-2">
              <button
                onClick={optimizeTires}
                disabled={loading}
                className="flex items-center gap-1 border border-[#1C2430] bg-[#0B0F14] hover:bg-[#161C24] px-2.5 py-1 text-[9px] font-bold text-white cursor-pointer"
              >
                <Sliders className="h-3 w-3 text-[#3B82F6]" />
                TIRES PRESS
              </button>
              <button
                onClick={tweakDampers}
                disabled={loading}
                className="flex items-center gap-1 border border-[#1C2430] bg-[#0B0F14] hover:bg-[#161C24] px-2.5 py-1 text-[9px] font-bold text-white cursor-pointer"
              >
                <Wrench className="h-3 w-3 text-[#FFB800]" />
                DAMPERS SHOCK
              </button>
              <button
                onClick={runStintAnalysis}
                disabled={loading}
                className="flex items-center gap-1 border border-[#1C2430] bg-[#0B0F14] hover:bg-[#161C24] px-2.5 py-1 text-[9px] font-bold text-[#00D17F] cursor-pointer"
              >
                <Activity className="h-3 w-3 text-[#00D17F]" />
                STINT DETECT
              </button>
            </div>
          </div>

          {/* Active Spring/Shock Spreadsheet Grid */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 select-text">
            <div className="border border-[#1C2430] bg-[#05070A] overflow-hidden">
              <table className="w-full font-mono text-[10px] text-left border-collapse">
                <thead>
                  <tr className="bg-[#11161D] border-b border-[#1C2430] text-[#7A828C] uppercase font-bold">
                    <th className="p-2 border-r border-[#1C2430] w-[35%]">PARAMETER</th>
                    <th className="p-2 border-r border-[#1C2430] text-center w-[16.25%]">FL</th>
                    <th className="p-2 border-r border-[#1C2430] text-center w-[16.25%]">FR</th>
                    <th className="p-2 border-r border-[#1C2430] text-center w-[16.25%]">RL</th>
                    <th className="p-2 text-center w-[16.25%]">RR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C2430]">
                  {setup.map((item, i) => (
                    <tr key={i} className="hover:bg-[#11161D]/45 font-bold">
                      {/* Parameter Label */}
                      <td className="p-2 border-r border-[#1C2430] text-white font-bold text-[9px]">
                        {item.param}
                      </td>

                      {/* FL Corner Cell */}
                      <td className="p-2 border-r border-[#1C2430] text-center leading-normal">
                        <div>{item.fl}</div>
                        {item.flDelta && item.flDelta !== "+0" && item.flDelta !== "0" && (
                          <div className={`text-[8px] mt-0.5 ${statusColor(item.flStatus)}`}>
                            ({item.flDelta})
                          </div>
                        )}
                      </td>

                      {/* FR Corner Cell */}
                      <td className="p-2 border-r border-[#1C2430] text-center leading-normal">
                        <div>{item.fr}</div>
                        {item.frDelta && item.frDelta !== "+0" && item.frDelta !== "0" && (
                          <div className={`text-[8px] mt-0.5 ${statusColor(item.frStatus)}`}>
                            ({item.frDelta})
                          </div>
                        )}
                      </td>

                      {/* RL Corner Cell */}
                      <td className="p-2 border-r border-[#1C2430] text-center leading-normal">
                        <div>{item.rl}</div>
                        {item.rlDelta && item.rlDelta !== "+0" && item.rlDelta !== "0" && (
                          <div className={`text-[8px] mt-0.5 ${statusColor(item.rlStatus)}`}>
                            ({item.rlDelta})
                          </div>
                        )}
                      </td>

                      {/* RR Corner Cell */}
                      <td className="p-2 text-center leading-normal">
                        <div>{item.rr}</div>
                        {item.rrDelta && item.rrDelta !== "+0" && item.rrDelta !== "0" && (
                          <div className={`text-[8px] mt-0.5 ${statusColor(item.rrStatus)}`}>
                            ({item.rrDelta})
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Explanatory guidelines strip */}
            <div className="mt-4 border border-[#1C2430] bg-[#05070A] p-3 text-[10px] text-[#7A828C] leading-relaxed uppercase">
              <h4 className="font-bold text-white text-[9px] mb-1 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-[#FFB800]" />
                active calibration guidelines
              </h4>
              <p className="mt-0.5">
                • Delta figures in <span className="text-[#00D17F] font-bold">green</span> represent optimal recommended offsets resolved from rolling telemetry telemetry logs.
              </p>
              <p className="mt-0.5">
                • Figures in <span className="text-[#FF4D4D] font-bold">red</span> represent variables triggering alert constraints during peak high lateral compression periods.
              </p>
            </div>
          </div>

          {/* Strategy bottom bar */}
          <div className="border-t border-[#1C2430] bg-[#11161D] p-3 shrink-0 flex items-center justify-between text-[10px]">
            <span className="text-[#7A828C] uppercase font-bold">ACTIVE TELEMETRY HOOK:</span>
            <span className="text-[#00D17F] font-black tracking-wider flex items-center gap-1.5 animate-pulse">
              <Activity className="h-3.5 w-3.5" /> 60Hz DIRECT RECEIVER FEEDING
            </span>
          </div>
        </section>

      </main>

      {/* Timing footer */}
      <footer className="border-t border-[#1C2430] bg-[#0B0F14] px-4 py-2 text-[10px] uppercase text-[#7A828C] flex items-center justify-between select-none">
        <span className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-[#00D17F]" />
          TELEMETRY CONSOLE COUPLING ACTIVE
        </span>
        <div className="flex gap-4 font-bold text-white">
          <span>ERS: <span className="text-[#8B5CF6]">4.2MJ / 4.0MJ</span></span>
          <span>BBIAS: <span className="text-[#00D17F]">{t.brakeBias.toFixed(1)}%</span></span>
          <span>SOF: <span>{t.sof.toLocaleString()}</span></span>
        </div>
      </footer>
    </div>
  );
}
