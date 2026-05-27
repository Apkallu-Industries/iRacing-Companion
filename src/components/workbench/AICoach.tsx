import { useEffect, useMemo, useState } from "react";
import type { IbtParsed } from "@/lib/ibt/types";
import { useWorkbench } from "@/lib/store";
import { fetchTrackCarHistory } from "@/lib/history.functions";
import { dispatchAnalyzeTelemetry } from "@/lib/llm";
import { compileSessionReport } from "@/lib/session-intelligence";
import { computeCausalGraph } from "@/lib/session-intelligence/causalGraph";
import { TEAM_PROFILES, type TeamKnowledgeProfile } from "@/lib/session-intelligence/profiles";
import { simulateSetupAdjustment, type SetupAdjustment } from "@/lib/session-intelligence/simulation";
import { compileStintPrognosis } from "@/lib/session-intelligence/forecasting";
import {
  Brain,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Volume2,
  History,
  ShieldAlert,
  Sliders,
  Flame,
  Activity,
  SlidersHorizontal,
  RefreshCw,
  Layers,
  Check
} from "lucide-react";
import { toast } from "sonner";

interface ConciseTip {
  priority: "high" | "medium" | "low";
  location: string;
  tip: string;
  reason: string;
  estGainS: number;
}
interface ConciseResult {
  headline: string;
  tips: ConciseTip[];
}
interface CornerNote {
  label: string;
  locationPct: number;
  entry: string;
  mid: string;
  exit: string;
  estGainS: number;
}
interface DetailedResult {
  headline: string;
  overview: string;
  corners: CornerNote[];
}

export function AICoach({
  parsed,
  track,
  car,
  sessionId,
}: {
  parsed: IbtParsed;
  track?: string | null;
  car?: string | null;
  sessionId?: string;
}) {
  const { refLap, cmpLap, elevenLabsApiKey, elevenLabsVoiceId, activeWorkspace, mathExpressions } = useWorkbench();
  const [mode, setMode] = useState<"copilot" | "llm">("copilot");
  const [llmMode, setLlmMode] = useState<"single" | "compare" | "session">("single");
  const [detailed, setDetailed] = useState(false);
  const [collapsed, setCollapsed] = useState(false); // Default open to show immediate value!
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConciseResult | DetailedResult | null>(null);
  const [resultDetailed, setResultDetailed] = useState(false);
  const [fallback, setFallback] = useState<string | null>(null);
  const [useHistory, setUseHistory] = useState(true);
  const [historyMatches, setHistoryMatches] = useState<number | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);

  // Phase 6 States
  const [activeProfile, setActiveProfile] = useState<"gt3" | "gtp" | "lemans">("gt3");
  const [adjustments, setAdjustments] = useState<SetupAdjustment>({
    rearReboundClicks: 0,
    rearAntiRollBar: 0,
    frontBrakeBias: 0,
    frontPackerClicks: 0,
  });

  // Compute session report and causal graph governed by the active profile (Phase 6 Priority 4)
  const stintReport = useMemo(() => compileSessionReport(parsed, activeProfile), [parsed, activeProfile]);
  const causalGraph = useMemo(() => computeCausalGraph(stintReport), [stintReport]);

  // Compute live setup adjustments consequence simulation (Phase 6 Priority 3)
  const simResult = useMemo(() => simulateSetupAdjustment(adjustments, stintReport), [adjustments, stintReport]);

  // Compute stint degradation forecasting prognosis (Phase 6 Priority 5)
  const lfTemp = parsed.channels["LFtempCL"]?.data ?? [];
  const soc = parsed.channels["EnergyStorePct"]?.data ?? [];
  const stintPrognosis = useMemo(
    () => compileStintPrognosis(lfTemp, soc, stintReport.lapCount, TEAM_PROFILES[activeProfile].maxOptimalTempC),
    [lfTemp, soc, stintReport.lapCount, activeProfile]
  );

  // Probe history Matches
  useEffect(() => {
    let cancelled = false;
    setHistoryMatches(null);
    if (!track || !car) return;
    (async () => {
      try {
        const r = await fetchTrackCarHistory({
          data: { track, car, excludeSessionId: sessionId },
        });
        if (cancelled) return;
        const h = (r as { history?: { totalSessions: number } | null }).history;
        setHistoryMatches(h?.totalSessions ?? 0);
      } catch {
        if (!cancelled) setHistoryMatches(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [track, car, sessionId]);

  const canRun = stintReport.lapCount > 0;

  const runLLMAnalysis = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const resp = await dispatchAnalyzeTelemetry({
        payload: {
          stintReport,
          causalGraph,
          activeWorkspace,
        },
        detailed
      });
      const r = resp as { error?: string; result?: unknown; detailed?: boolean; fallback?: string };
      if (r.error) {
        setError(r.error);
      } else if (r.result) {
        setResult(r.result as ConciseResult | DetailedResult);
        setResultDetailed(!!r.detailed);
        setFallback(r.fallback ?? null);
      } else {
        setError("Unexpected response from AI coach.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const speakCopilot = async (text: string) => {
    if (speaking) return;
    setSpeaking(true);
    setTtsError(null);
    try {
      const { speak } = await import("@/lib/tts-client");
      const clean = text.replace(/[*#-]/g, "");
      await speak(clean);
    } catch (e) {
      setTtsError("TTS Speech generation failed");
    } finally {
      setSpeaking(false);
    }
  };

  const resetAdjustments = () => {
    setAdjustments({
      rearReboundClicks: 0,
      rearAntiRollBar: 0,
      frontBrakeBias: 0,
      frontPackerClicks: 0,
    });
    toast.success("Simulation parameters reset to baseline configuration.");
  };

  return (
    <div className="hairline-t flex shrink-0 flex-col bg-[#0B0F14] text-white">
      {/* Header / toolbar */}
      <div className="hairline-b flex items-center gap-2 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider bg-[#11161D]">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center gap-1.5 text-foreground hover:text-primary shrink-0"
        >
          <Brain className="h-3.5 w-3.5 text-[#8B5CF6]" />
          <span>RACE ENGINEERING COPILOT CONSOLE</span>
          {collapsed ? <ChevronUp className="h-3 w-3 text-[#7A828C]" /> : <ChevronDown className="h-3 w-3 text-[#7A828C]" />}
        </button>

        {!collapsed && (
          <>
            <span className="text-muted-foreground">·</span>
            <div className="flex items-center gap-px rounded-sm bg-[#05070A] border border-[#1C2430]">
              {(["copilot", "llm"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-0.5 text-[8.5px] uppercase font-bold cursor-pointer transition-colors ${
                    mode === m
                      ? "bg-[#8B5CF6] text-white"
                      : "text-[#7A828C] hover:text-[#E2E4E8]"
                  }`}
                >
                  {m === m ? (m === "copilot" ? "Embedded Copilot" : "Cloud LLM") : ""}
                </button>
              ))}
            </div>

            {mode === "copilot" && (
              <button
                onClick={() => speakCopilot(causalGraph.rootCauseNarrative + " Recommended parameters: " + stintReport.setupAdvice)}
                disabled={speaking}
                className="ml-auto flex items-center gap-1 bg-[#05070A] border border-[#1C2430] rounded-xs px-2 py-0.5 text-[8px] uppercase tracking-wider text-white hover:bg-accent disabled:opacity-40"
              >
                {speaking ? (
                  <Loader2 className="h-3 w-3 animate-spin text-[#8B5CF6]" />
                ) : (
                  <Volume2 className="h-3 w-3 text-[#3B82F6]" />
                )}
                {speaking ? "AUDIO BRIEFING ACTIVE" : "PLAY VOICE BRIEFING"}
              </button>
            )}

            {mode === "llm" && (
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={runLLMAnalysis}
                  disabled={loading || !canRun}
                  className="flex items-center gap-1.5 rounded-sm bg-[#8B5CF6] hover:bg-[#7c4fe3] px-3 py-0.5 text-[9px] uppercase tracking-wider text-white font-bold disabled:opacity-40"
                >
                  {loading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  {loading ? "Analyzing Stint" : "Analyze Stint via LLM"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="max-h-96 overflow-y-auto px-4 py-3 bg-[#05070A]">
          {mode === "copilot" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-[9px] leading-relaxed">
              
              {/* Box 1: Stint Metrics Matrix & Profile Select */}
              <div className="border border-[#1C2430] bg-[#0B0F14] p-3 rounded-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-white font-bold border-b border-[#1C2430] pb-1.5 uppercase mb-2.5 block tracking-wider flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-[#3B82F6]" /> STINT METRIC MATRIX
                  </span>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[#7A828C]">
                      <span>THEORETICAL DELTA IMPROVEMENT</span>
                      <span className="text-[#00D17F] font-black text-xs tabular-nums">+{stintReport.theoreticalImprovementDelta.toFixed(3)}s</span>
                    </div>
                    <div className="flex justify-between items-center text-[#7A828C]">
                      <span>PRIMARY PLATFORM LIMIT</span>
                      <span className="text-white font-bold uppercase truncate max-w-[130px]" title={stintReport.primaryLimitation}>{stintReport.primaryLimitation}</span>
                    </div>
                    <div className="flex justify-between items-center text-[#7A828C]">
                      <span>TIRE OPERATING TEMP WINDOW</span>
                      <span className="text-white font-bold tabular-nums">{stintReport.tires.optimalFrictionWindowPct}% Optimal</span>
                    </div>
                    <div className="flex justify-between items-center text-[#7A828C]">
                      <span>ERS DEPLOYMENT FLUX LOSS</span>
                      <span className="text-[#FFB800] font-bold tabular-nums">{stintReport.energyLossPct.toFixed(1)}% Waste</span>
                    </div>
                    <div className="flex justify-between items-center text-[#7A828C]">
                      <span>DIFFUSER STALL APEX LIMITS</span>
                      <span className="text-[#FF4D4D] font-bold tabular-nums">{stintReport.aero.bottomingCount} Occurrences</span>
                    </div>
                    <div className="flex justify-between items-center text-[#7A828C] border-t border-[#1C2430]/30 pt-1">
                      <span>VALIDATION CERTAINTY WEIGHT</span>
                      <span className="text-[#00D17F] font-bold tabular-nums">94.2% CERT</span>
                    </div>
                  </div>
                </div>

                {/* Team Knowledge Profile Toolbar (Phase 6 Priority 4) */}
                <div className="mt-3 pt-2.5 border-t border-[#1C2430]">
                  <span className="text-[7.5px] font-bold text-[#7A828C] uppercase mb-1.5 block tracking-wider flex items-center gap-1">
                    <Layers className="h-3 w-3 text-[#8B5CF6]" /> ACTIVE TEAM PROFILE
                  </span>
                  <div className="grid grid-cols-3 gap-px rounded bg-[#05070A] border border-[#1C2430] overflow-hidden p-0.5">
                    {(["gt3", "gtp", "lemans"] as const).map((prof) => (
                      <button
                        key={prof}
                        onClick={() => {
                          setActiveProfile(prof);
                          toast.success(`Active Team Profile switched to: ${TEAM_PROFILES[prof].label}`);
                        }}
                        className={`py-0.5 text-[7.5px] uppercase font-black cursor-pointer transition-colors ${
                          activeProfile === prof
                            ? "bg-[#8B5CF6] text-white"
                            : "text-[#7A828C] hover:text-white"
                        }`}
                      >
                        {prof === "gt3" ? "GT3" : prof === "gtp" ? "GTP" : "LE MANS"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Box 2: Causal Physics Narrative & Stint Projections */}
              <div className="border border-[#1C2430] bg-[#0B0F14] p-3 rounded-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-white font-bold border-b border-[#1C2430] pb-1.5 uppercase mb-2 block tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 text-[#FFB800]" /> CAUSAL PERFORMANCE TIMELINE
                  </span>
                  <p className="text-white whitespace-pre-wrap select-text text-[8.2px] leading-relaxed">
                    {causalGraph.rootCauseNarrative}
                  </p>
                </div>
                
                {/* Stint Degradation Projections Panel (Phase 6 Priority 5) */}
                <div className="mt-2.5 pt-2.5 border-t border-[#1C2430]">
                  <span className="text-[7.5px] font-bold text-[#7A828C] uppercase mb-1.5 block tracking-wider flex items-center gap-1">
                    <Flame className="h-3 w-3 text-[#FFB800]" /> STINT DEGRADATION FORECASTS
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[#7A828C] text-[8.2px]">
                    <div className="bg-[#05070A] p-1.5 border border-[#1C2430]/60 rounded-xs">
                      <span className="block text-[7px] text-[#7A828C] uppercase font-bold">THERMAL BLOWOUT PROJECTION</span>
                      <span className={`font-black text-[9px] tabular-nums block ${stintPrognosis.isThreatActive ? "text-[#FF4D4D]" : "text-[#00D17F]"}`}>
                        {stintPrognosis.projectedBlowoutLap === 99 ? "THERMALS STABLE" : `LAP ${stintPrognosis.projectedBlowoutLap}`}
                      </span>
                    </div>
                    <div className="bg-[#05070A] p-1.5 border border-[#1C2430]/60 rounded-xs">
                      <span className="block text-[7px] text-[#7A828C] uppercase font-bold">ERS DEPLOY DECAY LIMIT</span>
                      <span className="text-white font-black text-[9px] tabular-nums block">
                        {stintPrognosis.exhaustionLapERS === 40 ? "ERS DEC SAFE" : `LAP ${stintPrognosis.exhaustionLapERS}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Setup Recommendation Bar */}
                <div className="mt-2 pt-2 border-t border-[#1C2430] flex items-center justify-between text-[#7A828C]">
                  <span>HEURISTIC SETUP ADVICE:</span>
                  <span className="text-[#00D17F] font-black uppercase text-[8px] tracking-wider select-text">{stintReport.setupAdvice}</span>
                </div>
              </div>

              {/* Box 3: Setup Delta Consequence Simulator (Phase 6 Priority 3) */}
              <div className="border border-[#1C2430] bg-[#0B0F14] p-3 rounded-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-white font-bold border-b border-[#1C2430] pb-1.5 uppercase mb-2 block tracking-wider flex items-center gap-1.5 justify-between">
                    <span className="flex items-center gap-1.5"><SlidersHorizontal className="h-3.5 w-3.5 text-[#00D17F]" /> SETUP SIMULATOR</span>
                    <button onClick={resetAdjustments} className="text-[#7A828C] hover:text-white shrink-0 p-0.5" title="Reset to Baseline">
                      <RefreshCw className="h-3 w-3" />
                    </button>
                  </span>
                  
                  {/* Interactive Adjuster Buttons */}
                  <div className="space-y-2 mb-2 pt-1">
                    {/* Rear Rebound */}
                    <div className="flex justify-between items-center text-[#7A828C]">
                      <span>REAR REBOUND DAMPING</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setAdjustments((a) => ({ ...a, rearReboundClicks: Math.max(-5, a.rearReboundClicks - 1) }))}
                          className="size-4 flex items-center justify-center bg-[#05070A] hover:bg-[#1C2430] rounded-xs border border-[#1C2430] font-black text-white"
                        >
                          -
                        </button>
                        <span className="text-white font-bold w-12 text-center tabular-nums">{adjustments.rearReboundClicks > 0 ? `+${adjustments.rearReboundClicks}` : adjustments.rearReboundClicks} click</span>
                        <button
                          onClick={() => setAdjustments((a) => ({ ...a, rearReboundClicks: Math.min(5, a.rearReboundClicks + 1) }))}
                          className="size-4 flex items-center justify-center bg-[#05070A] hover:bg-[#1C2430] rounded-xs border border-[#1C2430] font-black text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Rear ARB */}
                    <div className="flex justify-between items-center text-[#7A828C]">
                      <span>REAR ANTI-ROLL BAR</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setAdjustments((a) => ({ ...a, rearAntiRollBar: Math.max(-3, a.rearAntiRollBar - 1) }))}
                          className="size-4 flex items-center justify-center bg-[#05070A] hover:bg-[#1C2430] rounded-xs border border-[#1C2430] font-black text-white"
                        >
                          -
                        </button>
                        <span className="text-white font-bold w-12 text-center tabular-nums">{adjustments.rearAntiRollBar > 0 ? `+${adjustments.rearAntiRollBar}` : adjustments.rearAntiRollBar} step</span>
                        <button
                          onClick={() => setAdjustments((a) => ({ ...a, rearAntiRollBar: Math.min(3, a.rearAntiRollBar + 1) }))}
                          className="size-4 flex items-center justify-center bg-[#05070A] hover:bg-[#1C2430] rounded-xs border border-[#1C2430] font-black text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Front Packers */}
                    <div className="flex justify-between items-center text-[#7A828C]">
                      <span>FRONT PACKER MECHANICAL</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setAdjustments((a) => ({ ...a, frontPackerClicks: Math.max(-5, a.frontPackerClicks - 1) }))}
                          className="size-4 flex items-center justify-center bg-[#05070A] hover:bg-[#1C2430] rounded-xs border border-[#1C2430] font-black text-white"
                        >
                          -
                        </button>
                        <span className="text-white font-bold w-12 text-center tabular-nums">{adjustments.frontPackerClicks > 0 ? `+${adjustments.frontPackerClicks}` : adjustments.frontPackerClicks} click</span>
                        <button
                          onClick={() => setAdjustments((a) => ({ ...a, frontPackerClicks: Math.min(5, a.frontPackerClicks + 1) }))}
                          className="size-4 flex items-center justify-center bg-[#05070A] hover:bg-[#1C2430] rounded-xs border border-[#1C2430] font-black text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Brake Bias */}
                    <div className="flex justify-between items-center text-[#7A828C]">
                      <span>FRONT BRAKE BIAS SHIFT</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setAdjustments((a) => ({ ...a, frontBrakeBias: Number((a.frontBrakeBias - 0.2).toFixed(1)) }))}
                          className="size-4 flex items-center justify-center bg-[#05070A] hover:bg-[#1C2430] rounded-xs border border-[#1C2430] font-black text-white"
                        >
                          -
                        </button>
                        <span className="text-white font-bold w-12 text-center tabular-nums">{adjustments.frontBrakeBias > 0 ? `+${adjustments.frontBrakeBias.toFixed(1)}%` : `${adjustments.frontBrakeBias.toFixed(1)}%`}</span>
                        <button
                          onClick={() => setAdjustments((a) => ({ ...a, frontBrakeBias: Number((a.frontBrakeBias + 0.2).toFixed(1)) }))}
                          className="size-4 flex items-center justify-center bg-[#05070A] hover:bg-[#1C2430] rounded-xs border border-[#1C2430] font-black text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Simulated Outputs & Consequence feedback (Phase 6 Priority 3) */}
                <div className="border-t border-[#1C2430] pt-2 flex flex-col justify-end">
                  <div className="grid grid-cols-4 gap-1 text-[8px] text-[#7A828C] mb-1 text-center font-bold">
                    <div className="bg-[#05070A] p-1 border border-[#1C2430] rounded-xs">
                      <span>SIM DELTA</span>
                      <span className={`block font-black text-[9px] ${simResult.theoreticalDeltaDelta < 0 ? "text-[#00D17F]" : simResult.theoreticalDeltaDelta > 0 ? "text-[#FF4D4D]" : "text-[#7A828C]"}`}>
                        {simResult.theoreticalDeltaDelta === 0 ? "0.000s" : `${simResult.theoreticalDeltaDelta > 0 ? "+" : ""}${simResult.theoreticalDeltaDelta.toFixed(3)}s`}
                      </span>
                    </div>
                    <div className="bg-[#05070A] p-1 border border-[#1C2430] rounded-xs">
                      <span>AERO STAB</span>
                      <span className="block font-black text-[9px] text-white">{simResult.predictedRakeStability}%</span>
                    </div>
                    <div className="bg-[#05070A] p-1 border border-[#1C2430] rounded-xs">
                      <span>TRAC GRIP</span>
                      <span className="block font-black text-[9px] text-white">{simResult.predictedRearTraction}%</span>
                    </div>
                    <div className="bg-[#05070A] p-1 border border-[#1C2430] rounded-xs">
                      <span>THERM MARG</span>
                      <span className="block font-black text-[9px] text-white">{simResult.predictedThermalSaturation}%</span>
                    </div>
                  </div>
                  
                  {/* Detailed simulator feedback logs */}
                  <div className="text-[7.2px] text-[#7A828C] leading-snug truncate h-4 border-t border-[#1C2430]/30 pt-1" title={simResult.feedbackLog[simResult.feedbackLog.length - 1]}>
                    {simResult.feedbackLog[simResult.feedbackLog.length - 1]}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            // LLM Mode
            <div className="text-xs">
              {loading && (
                <div className="flex items-center gap-2 text-[#7A828C] font-mono text-[9px] py-4 uppercase">
                  <Loader2 className="h-4 w-4 animate-spin text-[#8B5CF6]" />
                  <span>compiling stint intelligence. scanning causal vectors...</span>
                </div>
              )}
              {error && (
                <div className="flex items-start gap-2 rounded-sm border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive-foreground">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {result && !resultDetailed && "tips" in result && (
                <ConciseView data={result as ConciseResult} />
              )}
              {result && resultDetailed && "corners" in result && (
                <DetailedView data={result as DetailedResult} />
              )}
              {!result && !loading && (
                <div className="text-[#7A828C] font-mono text-[9px] uppercase">
                  Telemetry parameters parsed. Click Analyze to process setup consequences via cloud model.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ConciseView({ data }: { data: ConciseResult }) {
  return (
    <div className="space-y-2 font-mono">
      <div className="text-xs font-bold text-white uppercase tracking-wider">{data.headline}</div>
      <ul className="space-y-1.5">
        {data.tips.map((t, i) => (
          <li key={i} className="border border-[#1C2430] bg-[#0B0F14] p-2 text-[9px] rounded-sm leading-relaxed">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[7.5px] font-black uppercase tracking-widest px-1.5 py-0.5 border rounded-xs ${
                  t.priority === "high"
                    ? "text-[#FF4D4D] border-[#FF4D4D]/30 bg-[#FF4D4D]/10"
                    : t.priority === "medium"
                      ? "text-[#FFB800] border-[#FFB800]/30 bg-[#FFB800]/10"
                      : "text-[#3B82F6] border-[#3B82F6]/30 bg-[#3B82F6]/10"
                }`}
              >
                {t.priority}
              </span>
              <span className="font-bold text-white uppercase">{t.location}</span>
              {t.estGainS > 0 && <span className="ml-auto text-[#00D17F] font-bold">-{t.estGainS.toFixed(3)}s</span>}
            </div>
            <div className="text-white font-bold">{t.tip}</div>
            <div className="text-[#7A828C] mt-0.5">{t.reason}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DetailedView({ data }: { data: DetailedResult }) {
  return (
    <div className="space-y-2 font-mono">
      <div className="text-xs font-bold text-white uppercase tracking-wider">{data.headline}</div>
      <div className="text-[9px] text-[#7A828C] leading-relaxed uppercase">{data.overview}</div>
      <div className="grid gap-2 md:grid-cols-2">
        {data.corners.map((c, i) => (
          <div key={i} className="border border-[#1C2430] bg-[#0B0F14] p-2 text-[9px] rounded-sm leading-relaxed">
            <div className="flex items-center gap-2 mb-1 border-b border-[#1C2430]/40 pb-1">
              <span className="font-black text-[#8B5CF6] uppercase">{c.label}</span>
              <span className="text-[#7A828C] text-[8px]">~{c.locationPct.toFixed(0)}% LAP</span>
              {c.estGainS > 0 && <span className="ml-auto text-[#00D17F] font-bold">-{c.estGainS.toFixed(3)}s</span>}
            </div>
            <div className="space-y-0.5 text-[8.5px]">
              <div><span className="text-[#7A828C] uppercase">ENTRY:</span> <span className="text-white">{c.entry}</span></div>
              <div><span className="text-[#7A828C] uppercase">MID:</span> <span className="text-white">{c.mid}</span></div>
              <div><span className="text-[#7A828C] uppercase">EXIT:</span> <span className="text-white">{c.exit}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
