import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Volume2, Zap, ShieldAlert, Gauge, AlertTriangle } from "lucide-react";
import type { Telemetry } from "@/lib/telemetry-types";
import { useAuth } from "@/lib/auth";
import { recordLiveLap, getPersonalBest } from "@/lib/liveLaps.functions";
import { dispatchLiveCoach } from "@/lib/llm";
import { speakText } from "@/lib/tts.functions";
import { decideTone, type RuleSummary, type Tone } from "@/lib/live/coachRules";
import { waitForStraight } from "@/lib/live/isInCorner";
import { useWorkbench } from "@/lib/store";
import { useTheme } from "@/lib/themeContext";

const COACH_DEBOUNCE_MS = 45_000;
const MIN_CONFIDENCE = 55;

interface RadioCall {
  tone: Tone;
  headline: string;
  detail: string;
  focus?: string;
}

import { useLapAggregate, type LapResult } from "@/lib/live/useLapAggregate";

function fmtLap(s: number | null | undefined): string {
  if (s == null || !isFinite(s)) return "--:--.---";
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  return `${m}:${r.toFixed(3).padStart(6, "0")}`;
}

const toneStyles: Record<
  Tone,
  { bg: string; ring: string; text: string; label: string; icon: typeof Zap }
> = {
  push: {
    bg: "bg-racing-green/15",
    ring: "ring-racing-green/60",
    text: "text-racing-green",
    label: "PUSH",
    icon: Zap,
  },
  hold: {
    bg: "bg-racing-orange/15",
    ring: "ring-racing-orange/60",
    text: "text-racing-orange",
    label: "HOLD",
    icon: Gauge,
  },
  warn: {
    bg: "bg-racing-red/15",
    ring: "ring-racing-red/60",
    text: "text-racing-red",
    label: "WARN",
    icon: ShieldAlert,
  },
};

export function LiveCoach({ t }: { t: Telemetry }) {
  const { user } = useAuth();
  const [call, setCall] = useState<RadioCall | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [pb, setPb] = useState<{
    lapTimeS: number;
    s1S: number | null;
    s2S: number | null;
    s3S: number | null;
  } | null>(null);
  const [sectorBests, setSectorBests] = useState<{
    s1: number | null;
    s2: number | null;
    s3: number | null;
  } | null>(null);
  const [pbCount, setPbCount] = useState(0);
  const [validLapsThisSession, setValidLapsThisSession] = useState(0);
  const [lastConfidence, setLastConfidence] = useState<number | null>(null);

  // Streak of consecutive PBs in this session
  const pbStreakRef = useRef(0);
  // Recent deltas vs PB (per lap) for trend detection
  const recentDeltasRef = useRef<number[]>([]);
  const lastCalloutRef = useRef<{
    reasonCode: string;
    at: number;
    deltaToPb: number | null;
  } | null>(null);
  const telemetryRef = useRef(t);
  telemetryRef.current = t;

  // Load PB whenever track/car changes (and user is signed in)
  useEffect(() => {
    if (!user || !t.track || !t.car) {
      setPb(null);
      setSectorBests(null);
      setPbCount(0);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const r = (await getPersonalBest({ data: { track: t.track, car: t.car } })) as {
          pb: typeof pb;
          sectorBests: typeof sectorBests;
          count: number;
        };
        if (cancelled) return;
        setPb(r.pb);
        setSectorBests(r.sectorBests);
        setPbCount(r.count);
      } catch {
        if (!cancelled) {
          setPb(null);
          setSectorBests(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, t.track, t.car]);

  const handleLapComplete = useCallback(
    async (lap: LapResult) => {
      const fuelLapsRemaining = lap.fuelUsedL > 0.01 ? t.fuelRemainingL / lap.fuelUsedL : 99;

      if (lap.isValid) setValidLapsThisSession((n) => n + 1);

      const prevPbS = pb?.lapTimeS ?? null;
      const newPb = prevPbS == null || (lap.isValid && lap.lapTimeS < prevPbS);
      const newStreak = newPb ? pbStreakRef.current + 1 : 0;
      pbStreakRef.current = newStreak;

      const deltaToPb = prevPbS != null ? +(lap.lapTimeS - prevPbS).toFixed(3) : null;
      if (deltaToPb != null && lap.isValid) {
        recentDeltasRef.current = [...recentDeltasRef.current, deltaToPb].slice(-5);
      }

      // Build the rules summary
      const summary: RuleSummary = decideTone({
        lap: {
          lapTimeS: lap.lapTimeS,
          s1S: lap.s1S,
          s2S: lap.s2S,
          s3S: lap.s3S,
          maxBrakePct: lap.maxBrakePct,
          maxThrottlePct: lap.maxThrottlePct,
          peakLatG: lap.peakLatG,
          peakLonG: lap.peakLonG,
          tireAvgC: lap.tireAvgC,
          fuelLapsRemaining,
          isValid: lap.isValid,
        },
        pbS: prevPbS,
        sectorBests,
        pbStreak: newStreak,
        recentDeltas: recentDeltasRef.current,
      });

      // Persist (signed-in only, valid laps only)
      if (user && lap.isValid) {
        try {
          await recordLiveLap({
            data: {
              track: t.track,
              car: t.car,
              lapTimeS: lap.lapTimeS,
              s1S: lap.s1S,
              s2S: lap.s2S,
              s3S: lap.s3S,
              maxBrakePct: lap.maxBrakePct,
              maxThrottlePct: lap.maxThrottlePct,
              peakLatG: lap.peakLatG,
              peakLonG: lap.peakLonG,
              tireAvgC: lap.tireAvgC,
              fuelUsedL: lap.fuelUsedL,
              isValid: lap.isValid,
            },
          });
          // Refresh PB if we just beat it
          if (newPb) {
            setPb({ lapTimeS: lap.lapTimeS, s1S: lap.s1S, s2S: lap.s2S, s3S: lap.s3S });
            setPbCount((c) => c + 1);
          }
        } catch {
          /* non-fatal */
        }
      } else if (!user && newPb) {
        // Session-only PB for anonymous users
        setPb({ lapTimeS: lap.lapTimeS, s1S: lap.s1S, s2S: lap.s2S, s3S: lap.s3S });
      }

      const now = Date.now();
      const last = lastCalloutRef.current;
      const deltaWorsened =
        summary.deltaToPbS != null &&
        last?.deltaToPb != null &&
        summary.deltaToPbS > last.deltaToPb + 0.1;
      if (
        last &&
        last.reasonCode === summary.reasonCode &&
        now - last.at < COACH_DEBOUNCE_MS &&
        !deltaWorsened
      ) {
        return;
      }

      const ruleCall: RadioCall = {
        tone: summary.tone,
        headline: summary.beats[0] ?? "Lap complete",
        detail: summary.beats.slice(1).join(" ") || "Keep building rhythm.",
      };

      const useAi = summary.confidence >= MIN_CONFIDENCE;

      setLoading(true);
      setError(null);
      try {
        let finalCall = ruleCall;
        if (useAi) {
          const resp = (await dispatchLiveCoach({
            summary,
            context: {
              track: t.track,
              car: t.car,
              lapTimeS: lap.lapTimeS,
              pbS: prevPbS,
              pbStreak: newStreak,
              // Bridge extras — present only when iRacing SDK provides them
              extras: lap.extras,
            },
          })) as { call?: RadioCall; error?: string };
          if (resp.error) {
            setError(resp.error);
          } else if (resp.call) {
            finalCall = resp.call;
          }
        }

        setCall(finalCall);
        setLastConfidence(summary.confidence);
        lastCalloutRef.current = {
          reasonCode: summary.reasonCode,
          at: now,
          deltaToPb: summary.deltaToPbS,
        };

        if (autoSpeak || finalCall.tone === "warn") {
          await waitForStraight(() => telemetryRef.current);
          speakCall(finalCall);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Coach unavailable");
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t.track, t.car, t.fuelRemainingL, pb, sectorBests, user, autoSpeak],
  );

  useLapAggregate(t, handleLapComplete);

  const speakCall = async (c: RadioCall) => {
    if (speaking) return;
    setSpeaking(true);
    try {
      const text = c.focus
        ? `${c.headline}. ${c.detail}. Focus: ${c.focus}.`
        : `${c.headline}. ${c.detail}.`;
      const { speak } = await import("@/lib/tts-client");
      const err = await speak(text);
      if (err) console.warn("[LiveCoach] TTS:", err);
    } catch {
      // non-fatal
    } finally {
      setSpeaking(false);
    }
  };

  const { layout } = useTheme();
  const isF1 = layout === "f1";

  const tone = call?.tone ?? "hold";
  const style = toneStyles[tone];
  const ToneIcon = style.icon;

  if (isF1) {
    const activeCall = call || {
      tone: "hold" as Tone,
      headline: "Systems Check Ready",
      detail: user
        ? "Monitoring live telemetry from the bridge. Complete a clean lap on track, and I'll analyze your sectors and throttle inputs to provide live real-time audio coaching."
        : "Awaiting telemetry. Complete a lap on track for live telemetry-driven coaching. Sign in to save and track your personal best laps.",
      focus: "Complete a clean lap on track",
    };
    const activeStyle = toneStyles[activeCall.tone];
    const ActiveToneIcon = activeStyle.icon;

    return (
      <div className="border border-border bg-background h-full flex flex-col overflow-hidden font-mono select-none">
        {/* Header bar matching F1 styling */}
        <div className="border-b border-border px-2 py-1.5 text-[9px] uppercase tracking-wider text-muted-foreground flex-shrink-0 flex items-center justify-between bg-background">
          <span className="font-semibold text-foreground tracking-[0.18em]">AI Coach</span>
          <span className="flex items-center gap-1 text-[8px] text-rose-500 font-bold tracking-wider">
            <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
            LIVE COACH
          </span>
        </div>

        {/* Body grid */}
        <div className="flex-1 p-3 flex gap-3 overflow-hidden min-h-0 bg-panel-2 items-center">
          {/* Large Avatar of Coach */}
          <div className="w-72 h-72 flex-shrink-0 relative">
            <img
              src="/images/coach-avatar.png"
              alt="AI Coach"
              className="w-full h-full object-cover rounded border border-border/80 shadow-lg"
            />
            {/* Pulsing indicator in corner of avatar showing active state */}
            <span className="absolute bottom-1 right-1 size-3.5 rounded-full bg-emerald-500 border border-background animate-pulse" />
          </div>

          {/* Coach Message Bubble */}
          <div className="flex-1 flex flex-col justify-between h-full min-w-0 bg-black/45 border border-border/60 rounded p-2.5 relative">
            {/* Bubble pointer pointing left to avatar */}
            <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 rotate-45 bg-black/45 border-l border-b border-border/60" />

            <div className="overflow-y-auto pr-1 flex-1 min-h-0 select-text">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span
                  className={`flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${activeStyle.text} bg-black/40 border border-border/20`}
                >
                  <ActiveToneIcon className="h-2.5 w-2.5" />
                  {activeStyle.label}
                </span>
                {lastConfidence != null && call && (
                  <span className="text-[8px] text-muted-foreground uppercase tracking-widest">
                    Confidence: {lastConfidence}%
                  </span>
                )}
                {pb && call && (
                  <span className="text-[8px] text-muted-foreground font-mono">
                    Δ {t.deltaSec >= 0 ? "+" : ""}
                    {t.deltaSec.toFixed(3)}s
                  </span>
                )}
              </div>
              <div
                className={`text-[11px] font-bold leading-snug uppercase tracking-wide ${activeStyle.text}`}
              >
                {activeCall.headline}
              </div>
              <div className="mt-1 text-[10px] text-muted-foreground leading-normal font-sans">
                {activeCall.detail}
              </div>
              {activeCall.focus && (
                <div className="mt-1.5 text-[8px] uppercase tracking-wider text-muted-foreground font-mono">
                  Focus: <span className="text-foreground">{activeCall.focus}</span>
                </div>
              )}
            </div>

            {/* Speak button inside the bubble at bottom */}
            <button
              onClick={() => speakCall(activeCall)}
              disabled={speaking || loading}
              className="mt-2 w-full flex items-center justify-center gap-1.5 rounded bg-black/30 hover:bg-black/60 px-2 py-1.5 text-[9px] uppercase tracking-wider text-foreground hover:text-white disabled:opacity-40 border border-border/40 transition-colors"
            >
              {speaking ? (
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              ) : (
                <Volume2 className="h-3 w-3 text-muted-foreground" />
              )}
              {speaking ? "Speaking..." : "Speak Last Lap"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-panel-2 ring-1 ${call ? style.ring : "ring-white/5"} rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-foreground font-semibold">
          <div className="relative">
            <img
              src="/images/coach-avatar.png"
              alt="AI Coach"
              className="h-36 w-36 rounded-md object-cover ring-2 ring-border shadow-md"
            />
            <span className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-500 border border-background animate-pulse" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span>AI Coach</span>
            <span className="flex items-center gap-1 text-[8px] text-emerald-400 font-bold">
              LIVE COACH
            </span>
          </div>
        </h2>
        <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
          {!user && <span className="text-racing-orange">Sign in to save PBs</span>}
          <label className="flex cursor-pointer items-center gap-1">
            <input
              type="checkbox"
              checked={autoSpeak}
              onChange={(e) => setAutoSpeak(e.target.checked)}
              className="h-3 w-3 accent-racing-cyan"
            />
            <Volume2 className="h-3 w-3" />
            <span>Auto-speak</span>
          </label>
        </div>
      </div>

      {/* PB context strip */}
      <div className="mb-3 grid grid-cols-4 gap-2 text-[10px] font-mono">
        <PbCell label="PB" value={fmtLap(pb?.lapTimeS ?? null)} highlight />
        <PbCell label="S1 BEST" value={pb?.s1S != null ? pb.s1S.toFixed(3) : "—"} />
        <PbCell label="S2 BEST" value={sectorBests?.s2 != null ? sectorBests.s2.toFixed(3) : "—"} />
        <PbCell label="LAPS LOGGED" value={`${validLapsThisSession} / ${pbCount}`} />
      </div>

      {/* Radio call */}
      {!call && !loading && (
        <div className="rounded-md bg-muted/50 p-3 text-center text-xs text-muted-foreground">
          {user
            ? "Complete a lap on the bridge and I'll start coaching."
            : "Coaching active in session-only mode. Sign in to keep your personal bests."}
        </div>
      )}
      {loading && (
        <div className="flex items-center gap-2 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Reading lap…
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 rounded-md border border-racing-red/40 bg-racing-red/10 p-3 text-xs text-racing-red">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {call && !loading && (
        <div className={`rounded-md p-3 ${style.bg} ring-1 ${style.ring}`}>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`flex items-center gap-1 rounded-sm px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${style.text} bg-black/30`}
            >
              <ToneIcon className="h-3 w-3" />
              {style.label}
            </span>
            {lastConfidence != null && (
              <span
                className="font-mono text-[9px] text-muted-foreground"
                title="Rules-engine confidence"
              >
                {lastConfidence}%
              </span>
            )}
            {pb && (
              <span className="font-mono text-[10px] text-muted-foreground">
                Δ {t.deltaSec >= 0 ? "+" : ""}
                {t.deltaSec.toFixed(3)}s
              </span>
            )}
          </div>
          {/* Avatar + message layout (F1 reference style) */}
          <div className="flex gap-4 mt-2 items-center">
            <img
              src="/images/coach-avatar.png"
              alt="AI Coach"
              className="h-64 w-64 rounded-md object-cover ring-2 ring-border shadow-lg flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-semibold leading-tight ${style.text}`}>
                {call.headline}
              </div>
              <div className="mt-1 text-xs text-foreground leading-relaxed">{call.detail}</div>
              {call.focus && (
                <div className="mt-1.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  Focus → <span className="text-foreground">{call.focus}</span>
                </div>
              )}
            </div>
          </div>
          {/* Speak button (full width, bottom) */}
          <button
            onClick={() => speakCall(call)}
            disabled={speaking}
            className="mt-3 w-full flex items-center justify-center gap-2 rounded-sm bg-black/30 px-3 py-1.5 text-[10px] uppercase tracking-wider text-foreground hover:bg-black/50 disabled:opacity-40 border border-border"
          >
            {speaking ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Volume2 className="h-3.5 w-3.5" />
            )}
            {speaking ? "Speaking..." : "Speak Last Lap"}
          </button>
        </div>
      )}
    </div>
  );
}

function PbCell({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-sm bg-muted/50 px-2 py-1">
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`tabular-nums ${highlight ? "text-racing-green" : "text-foreground"}`}>
        {value}
      </div>
    </div>
  );
}
