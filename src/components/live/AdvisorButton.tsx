import { useEffect, useRef, useState } from "react";
import {
  Lightbulb,
  Loader2,
  Wrench,
  Gauge,
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Telemetry } from "@/lib/telemetry-types";
import type { AdvisorMode, TrackType, CornerBias, Symptom } from "@/lib/advisor.functions";
import { dispatchAdvisorCall } from "@/lib/llm";

const MIN_LAPS = 3;

import { useLapAggregate, type LapResult } from "@/lib/live/useLapAggregate";

interface LapAgg extends LapResult {
  tires: Telemetry["tires"];
  brakeBias: number;
  diffMap: number;
  airTempC: number;
  trackTempC: number;
  /** Live extras snapshot at lap completion: yaw, shock, brake line press */
  liveExtras: {
    peakYawRateRads: number;
    peakShockFL: number;
    maxBrakeLinePressTotal: number;
  };
}

interface AdvisorResp {
  mode: AdvisorMode;
  headline: string;
  summary: string;
  tips: Array<{
    priority: "high" | "medium" | "low";
    area: string;
    tip: string;
    reason: string;
    citation?: string;
  }>;
}

const SYMPTOM_OPTIONS: Array<{
  id: Symptom;
  label: string;
  group: "balance" | "brakes" | "tyres" | "ride";
}> = [
  { id: "understeer_entry", label: "Understeer on entry", group: "balance" },
  { id: "understeer_apex", label: "Understeer mid-corner", group: "balance" },
  { id: "understeer_exit", label: "Understeer on exit", group: "balance" },
  { id: "oversteer_entry", label: "Oversteer on entry", group: "balance" },
  { id: "oversteer_apex", label: "Oversteer mid-corner", group: "balance" },
  { id: "oversteer_exit", label: "Oversteer on exit (power)", group: "balance" },
  { id: "snap_oversteer", label: "Snap oversteer", group: "balance" },
  { id: "brake_lockup_front", label: "Front brake lockup", group: "brakes" },
  { id: "brake_lockup_rear", label: "Rear brake lockup", group: "brakes" },
  { id: "poor_traction_exit", label: "Poor traction on exit", group: "brakes" },
  { id: "tyres_overheating_front", label: "Fronts overheating", group: "tyres" },
  { id: "tyres_overheating_rear", label: "Rears overheating", group: "tyres" },
  { id: "bouncy_over_curbs", label: "Bouncy over kerbs", group: "ride" },
];

export function AdvisorButton({ t }: { t: Telemetry }) {
  const [laps, setLaps] = useState<LapAgg[]>([]);
  const [loading, setLoading] = useState<AdvisorMode | null>(null);
  const [result, setResult] = useState<AdvisorResp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fallback, setFallback] = useState<"no-key" | "local" | "local-llm" | null>(null);

  const [trackType, setTrackType] = useState<TrackType>("road");
  const [cornerBias, setCornerBias] = useState<CornerBias>("mixed");
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [wizardOpen, setWizardOpen] = useState(false);

  const handleLapComplete = (lap: LapResult) => {
    const lapAgg: LapAgg = {
      ...lap,
      tires: t.tires,
      brakeBias: t.brakeBias,
      diffMap: t.diffMap,
      airTempC: t.airTempC,
      trackTempC: t.trackTempC,
      liveExtras: {
        peakYawRateRads: lap.extras.peakYawRateRads,
        peakShockFL: lap.extras.peakShockFL,
        maxBrakeLinePressTotal: lap.extras.maxBrakeLinePressTotal,
      },
    };
    setLaps((prevLaps) => [...prevLaps, lapAgg].slice(-10));
  };

  useLapAggregate(t, handleLapComplete);

  const validLaps = laps.filter((l) => l.isValid);
  const canAsk = validLaps.length >= MIN_LAPS;
  const needed = Math.max(0, MIN_LAPS - validLaps.length);

  const toggleSymptom = (s: Symptom) =>
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const ask = async (mode: AdvisorMode) => {
    if (!canAsk || loading) return;
    setLoading(mode);
    setError(null);
    setFallback(null);
    try {
      const latest = validLaps[validLaps.length - 1];
      const pbS = validLaps.reduce<number | null>(
        (m, l) => (m == null || l.lapTimeS < m ? l.lapTimeS : m),
        null,
      );
      const resp = (await dispatchAdvisorCall({
        mode,
        track: t.track,
        car: t.car,
        trackType,
        cornerBias,
        symptoms: mode === "setup" && symptoms.length ? symptoms : undefined,
        laps: validLaps
          .slice(-5)
          .map(
            ({
              tires: _tires,
              brakeBias: _bb,
              diffMap: _dm,
              airTempC: _a,
              trackTempC: _tt,
              liveExtras: _le,
              ...rest
            }) => rest,
          ),
        pbS,
        conditions: { airTempC: latest.airTempC, trackTempC: latest.trackTempC },
        setup: { brakeBias: latest.brakeBias, diffMap: latest.diffMap },
        tires: {
          fl: { tempC: latest.tires.fl.tempC, pressureBar: latest.tires.fl.pressureBar },
          fr: { tempC: latest.tires.fr.tempC, pressureBar: latest.tires.fr.pressureBar },
          rl: { tempC: latest.tires.rl.tempC, pressureBar: latest.tires.rl.pressureBar },
          rr: { tempC: latest.tires.rr.tempC, pressureBar: latest.tires.rr.pressureBar },
        },
        // Bridge extras — only included when the bridge sends them (non-zero)
        extrasSnapshot: latest.liveExtras.maxBrakeLinePressTotal > 0 ? latest.liveExtras : undefined,
      })) as { result?: AdvisorResp; error?: string; fallback?: "no-key" | "local" | "local-llm" };
      if (resp.error) {
        setError(resp.error);
      } else if (resp.result) {
        setResult(resp.result);
        setFallback(resp.fallback ?? null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Advisor unavailable");
    } finally {
      setLoading(null);
    }
  };

  const prioStyles: Record<"high" | "medium" | "low", string> = {
    high: "text-racing-red border-racing-red/40 bg-racing-red/10",
    medium: "text-racing-orange border-racing-orange/40 bg-racing-orange/10",
    low: "text-foreground border-zinc-700 bg-muted/40",
  };

  const segBtn = (active: boolean) =>
    `px-2.5 py-1 text-[10px] uppercase tracking-wider rounded ring-1 transition ${
      active
        ? "bg-racing-orange/20 text-racing-orange ring-racing-orange/40"
        : "bg-muted/40 text-muted-foreground ring-white/5 hover:text-foreground"
    }`;

  return (
    <div className="bg-panel-2 ring-1 ring-white/5 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-foreground font-medium">
          <Lightbulb className="h-3.5 w-3.5 text-racing-orange" />
          Advisor
        </h2>
        <span className="font-mono text-[10px] text-muted-foreground">
          {validLaps.length} valid lap{validLaps.length === 1 ? "" : "s"}
          {!canAsk && ` · ${needed} more to unlock`}
        </span>
      </div>

      {/* Track type + bias selector */}
      <div className="mb-3 grid gap-2 rounded-md bg-muted/40 ring-1 ring-white/5 p-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground w-16">Track</span>
          <div className="flex gap-1">
            <button className={segBtn(trackType === "road")} onClick={() => setTrackType("road")}>
              Road
            </button>
            <button
              className={segBtn(trackType === "oval")}
              onClick={() => {
                setTrackType("oval");
                if (cornerBias === "mixed") setCornerBias("left");
              }}
            >
              Oval
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground w-16">Bias</span>
          <div className="flex gap-1">
            <button className={segBtn(cornerBias === "left")} onClick={() => setCornerBias("left")}>
              Left
            </button>
            <button
              className={segBtn(cornerBias === "right")}
              onClick={() => setCornerBias("right")}
            >
              Right
            </button>
            {trackType === "road" && (
              <button
                className={segBtn(cornerBias === "mixed")}
                onClick={() => setCornerBias("mixed")}
              >
                Mixed
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Symptom wizard */}
      <button
        onClick={() => setWizardOpen((v) => !v)}
        className="mb-2 flex w-full items-center justify-between rounded-md bg-muted/40 ring-1 ring-white/5 px-3 py-2 text-[10px] uppercase tracking-wider text-foreground hover:text-foreground"
      >
        <span>
          Symptom Wizard{" "}
          {symptoms.length > 0 && (
            <span className="text-racing-orange">· {symptoms.length} selected</span>
          )}
        </span>
        {wizardOpen ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </button>
      {wizardOpen && (
        <div className="mb-3 rounded-md bg-muted/40 ring-1 ring-white/5 p-2 space-y-2">
          {(["balance", "brakes", "tyres", "ride"] as const).map((group) => (
            <div key={group}>
              <div className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">{group}</div>
              <div className="flex flex-wrap gap-1">
                {SYMPTOM_OPTIONS.filter((s) => s.group === group).map((s) => {
                  const active = symptoms.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleSymptom(s.id)}
                      className={`px-2 py-0.5 text-[10px] rounded ring-1 transition ${
                        active
                          ? "bg-racing-cyan/20 text-racing-cyan ring-racing-cyan/40"
                          : "bg-background/50 text-muted-foreground ring-white/5 hover:text-foreground"
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {symptoms.length > 0 && (
            <button
              onClick={() => setSymptoms([])}
              className="text-[10px] text-muted-foreground hover:text-foreground underline"
            >
              clear all
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          onClick={() => ask("style")}
          disabled={!canAsk || loading !== null}
          className="flex items-center justify-center gap-2 rounded-md bg-racing-cyan/10 px-3 py-2 text-xs uppercase tracking-wider text-racing-cyan ring-1 ring-racing-cyan/30 hover:bg-racing-cyan/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading === "style" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Gauge className="h-3.5 w-3.5" />
          )}
          Driving Style
        </button>
        <button
          onClick={() => ask("setup")}
          disabled={!canAsk || loading !== null}
          className="flex items-center justify-center gap-2 rounded-md bg-racing-orange/10 px-3 py-2 text-xs uppercase tracking-wider text-racing-orange ring-1 ring-racing-orange/30 hover:bg-racing-orange/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading === "setup" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Wrench className="h-3.5 w-3.5" />
          )}
          Car Setup
        </button>
      </div>

      {!canAsk && !result && (
        <div className="rounded-md bg-muted/50 p-3 text-center text-xs text-muted-foreground">
          Complete {MIN_LAPS} clean laps and I'll read the data to coach style or recommend setup
          changes.
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-racing-red/40 bg-racing-red/10 p-3 text-xs text-racing-red">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="space-y-2">
          <div>
            <div className="text-sm font-semibold text-foreground">{result.headline}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{result.summary}</div>
            {fallback && (
              <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                {fallback === "no-key"
                  ? "Local analysis (no AI key)"
                  : fallback === "local-llm"
                    ? "Local LLM via device"
                    : "Local analysis (AI fallback)"}
              </div>
            )}
          </div>
          <ul className="space-y-1.5">
            {result.tips.map((tip, i) => (
              <li key={i} className={`rounded-md border px-2.5 py-2 ${prioStyles[tip.priority]}`}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-[9px] uppercase tracking-widest">
                    {tip.priority}
                  </span>
                  <span className="text-[11px] uppercase tracking-wider opacity-80">
                    {tip.area}
                  </span>
                </div>
                <div className="text-xs text-foreground">{tip.tip}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{tip.reason}</div>
                {tip.citation && result.mode === "setup" && (
                  <div className="mt-1.5 flex items-start gap-1.5 border-t border-white/5 pt-1.5 text-[10px] text-muted-foreground">
                    <BookOpen className="h-3 w-3 mt-0.5 shrink-0 text-racing-orange/70" />
                    <span>
                      <span className="uppercase tracking-wider text-muted-foreground">Rule:</span>{" "}
                      {tip.citation}
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
