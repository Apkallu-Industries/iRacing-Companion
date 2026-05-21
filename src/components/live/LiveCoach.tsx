import { useCallback, useEffect, useRef, useState } from "react";
import { Brain, Loader2, Volume2, Zap, ShieldAlert, Gauge, AlertTriangle } from "lucide-react";
import type { Telemetry } from "@/lib/telemetry-types";
import { useAuth } from "@/lib/auth";
import { recordLiveLap, getPersonalBest } from "@/lib/liveLaps.functions";
import { liveCoach } from "@/lib/coach.functions";
import { speakText } from "@/lib/tts.functions";
import { decideTone, type RuleSummary, type Tone } from "@/lib/live/coachRules";

interface RadioCall {
  tone: Tone;
  headline: string;
  detail: string;
  focus?: string;
}

interface LapAggregate {
  startedAt: number;
  maxBrakePct: number;
  maxThrottlePct: number;
  peakLatG: number;
  peakLonG: number;
  tireSum: number;
  tireSamples: number;
  fuelAtStartL: number;
  bigGSpike: boolean;
}

function freshAggregate(now: number, fuelL: number): LapAggregate {
  return {
    startedAt: now,
    maxBrakePct: 0,
    maxThrottlePct: 0,
    peakLatG: 0,
    peakLonG: 0,
    tireSum: 0,
    tireSamples: 0,
    fuelAtStartL: fuelL,
    bigGSpike: false,
  };
}

/** Parse "M:SS.mmm" or "SS.mmm" into seconds. Returns null on bad input. */
function parseLapStr(s: string | null | undefined): number | null {
  if (!s || s === "--.---" || s === "--:--.---") return null;
  const m = /^(?:(\d+):)?(\d+(?:\.\d+)?)$/.exec(s.trim());
  if (!m) return null;
  const mins = m[1] ? parseInt(m[1], 10) : 0;
  const secs = parseFloat(m[2]);
  if (!isFinite(secs)) return null;
  return mins * 60 + secs;
}

function fmtLap(s: number | null | undefined): string {
  if (s == null || !isFinite(s)) return "--:--.---";
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  return `${m}:${r.toFixed(3).padStart(6, "0")}`;
}

const toneStyles: Record<Tone, { bg: string; ring: string; text: string; label: string; icon: typeof Zap }> = {
  push: { bg: "bg-racing-green/15", ring: "ring-racing-green/60", text: "text-racing-green", label: "PUSH", icon: Zap },
  hold: { bg: "bg-racing-orange/15", ring: "ring-racing-orange/60", text: "text-racing-orange", label: "HOLD", icon: Gauge },
  warn: { bg: "bg-racing-red/15", ring: "ring-racing-red/60", text: "text-racing-red", label: "WARN", icon: ShieldAlert },
};

export function LiveCoach({ t }: { t: Telemetry }) {
  const { user } = useAuth();
  const [call, setCall] = useState<RadioCall | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [pb, setPb] = useState<{ lapTimeS: number; s1S: number | null; s2S: number | null; s3S: number | null } | null>(null);
  const [sectorBests, setSectorBests] = useState<{ s1: number | null; s2: number | null; s3: number | null } | null>(null);
  const [pbCount, setPbCount] = useState(0);
  const [validLapsThisSession, setValidLapsThisSession] = useState(0);

  // Per-lap aggregate accumulated tick-by-tick
  const aggRef = useRef<LapAggregate>(freshAggregate(performance.now(), t.fuelRemainingL));
  // Track the lastLap string so we detect new lap completions
  const lastLapStrRef = useRef<string>(t.lastLap);
  // Streak of consecutive PBs in this session
  const pbStreakRef = useRef(0);
  // Recent deltas vs PB (per lap) for trend detection
  const recentDeltasRef = useRef<number[]>([]);

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

  // Tick-by-tick aggregation
  useEffect(() => {
    const agg = aggRef.current;
    agg.maxBrakePct = Math.max(agg.maxBrakePct, t.brake * 100);
    agg.maxThrottlePct = Math.max(agg.maxThrottlePct, t.throttle * 100);
    agg.peakLatG = Math.max(agg.peakLatG, Math.abs(t.gLat));
    agg.peakLonG = Math.max(agg.peakLonG, Math.abs(t.gLon));
    const tAvg = (t.tires.fl.tempC + t.tires.fr.tempC + t.tires.rl.tempC + t.tires.rr.tempC) / 4;
    agg.tireSum += tAvg;
    agg.tireSamples += 1;
    if (Math.abs(t.gLat) > 2.5 || Math.abs(t.gLon) > 2.5) agg.bigGSpike = true;
  }, [t.brake, t.throttle, t.gLat, t.gLon, t.tires]);

  const handleLapComplete = useCallback(
    async (lapTimeS: number) => {
      const agg = aggRef.current;
      const s1S = parseLapStr(t.sectors.s1);
      const s2NetS = parseLapStr(t.sectors.s2);
      // sectors.s2 in this UI represents the cumulative time at the end of S2 (e.g. "1:02.115").
      // Derive split: s2 = cumulative - s1.
      const s2S = s1S != null && s2NetS != null && s2NetS > s1S ? +(s2NetS - s1S).toFixed(3) : null;
      const s3S = s2NetS != null && s2NetS < lapTimeS ? +(lapTimeS - s2NetS).toFixed(3) : null;

      const tireAvg = agg.tireSamples > 0 ? agg.tireSum / agg.tireSamples : 0;
      const fuelUsed = Math.max(0, agg.fuelAtStartL - t.fuelRemainingL);
      const fuelLapsRemaining = fuelUsed > 0.01 ? t.fuelRemainingL / fuelUsed : 99;
      // Heuristic for a valid lap: time is sensible, no huge g-spike, sectors line up.
      const isValid = !agg.bigGSpike && lapTimeS > 20 && lapTimeS < 600;

      if (isValid) setValidLapsThisSession((n) => n + 1);

      const prevPbS = pb?.lapTimeS ?? null;
      const newPb = prevPbS == null || (isValid && lapTimeS < prevPbS);
      const newStreak = newPb ? pbStreakRef.current + 1 : 0;
      pbStreakRef.current = newStreak;

      const deltaToPb = prevPbS != null ? +(lapTimeS - prevPbS).toFixed(3) : null;
      if (deltaToPb != null && isValid) {
        recentDeltasRef.current = [...recentDeltasRef.current, deltaToPb].slice(-5);
      }

      // Build the rules summary
      const summary: RuleSummary = decideTone({
        lap: {
          lapTimeS,
          s1S,
          s2S,
          s3S,
          maxBrakePct: agg.maxBrakePct,
          maxThrottlePct: agg.maxThrottlePct,
          peakLatG: agg.peakLatG,
          peakLonG: agg.peakLonG,
          tireAvgC: tireAvg,
          fuelLapsRemaining,
          isValid,
        },
        pbS: prevPbS,
        sectorBests,
        pbStreak: newStreak,
        recentDeltas: recentDeltasRef.current,
      });

      // Reset aggregate immediately for the next lap
      aggRef.current = freshAggregate(performance.now(), t.fuelRemainingL);

      // Persist (signed-in only, valid laps only)
      if (user && isValid) {
        try {
          await recordLiveLap({
            data: {
              track: t.track,
              car: t.car,
              lapTimeS,
              s1S,
              s2S,
              s3S,
              maxBrakePct: agg.maxBrakePct,
              maxThrottlePct: agg.maxThrottlePct,
              peakLatG: agg.peakLatG,
              peakLonG: agg.peakLonG,
              tireAvgC: tireAvg,
              fuelUsedL: fuelUsed,
              isValid,
            },
          });
          // Refresh PB if we just beat it
          if (newPb) {
            setPb({ lapTimeS, s1S, s2S, s3S });
            setPbCount((c) => c + 1);
          }
        } catch {
          /* non-fatal */
        }
      } else if (!user && newPb) {
        // Session-only PB for anonymous users
        setPb({ lapTimeS, s1S, s2S, s3S });
      }

      // Call the AI to phrase it
      setLoading(true);
      setError(null);
      try {
        const resp = (await liveCoach({
          data: {
            summary,
            context: {
              track: t.track,
              car: t.car,
              lapTimeS,
              pbS: prevPbS,
              pbStreak: newStreak,
            },
          },
        })) as { call?: RadioCall; error?: string; fallback?: string };
        if (resp.error) {
          setError(resp.error);
        } else if (resp.call) {
          setCall(resp.call);
          if (autoSpeak || resp.call.tone === "warn") {
            speakCall(resp.call);
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Coach unavailable");
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t.track, t.car, t.sectors.s1, t.sectors.s2, t.fuelRemainingL, pb, sectorBests, user, autoSpeak],
  );

  // Detect lap completion (lastLap string changes to a parseable value)
  useEffect(() => {
    if (t.lastLap === lastLapStrRef.current) return;
    const prev = lastLapStrRef.current;
    lastLapStrRef.current = t.lastLap;
    // Skip the very first value (initial mount) — only react to real transitions.
    if (prev === t.lastLap) return;
    const lapTimeS = parseLapStr(t.lastLap);
    if (lapTimeS == null) return;
    void handleLapComplete(lapTimeS);
  }, [t.lastLap, handleLapComplete]);

  const speakCall = async (c: RadioCall) => {
    if (speaking) return;
    setSpeaking(true);
    try {
      const text = c.focus ? `${c.headline}. ${c.detail}. Focus: ${c.focus}.` : `${c.headline}. ${c.detail}.`;
      const resp = (await speakText({ data: { text } })) as { audioBase64?: string; mime?: string; error?: string };
      if (!resp.audioBase64) {
        setSpeaking(false);
        return;
      }
      const audio = new Audio(`data:${resp.mime ?? "audio/mpeg"};base64,${resp.audioBase64}`);
      audio.onended = () => setSpeaking(false);
      audio.onerror = () => setSpeaking(false);
      await audio.play();
    } catch {
      setSpeaking(false);
    }
  };

  const tone = call?.tone ?? "hold";
  const style = toneStyles[tone];
  const ToneIcon = style.icon;

  return (
    <div className={`bg-zinc-925 ring-1 ${call ? style.ring : "ring-white/5"} rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-zinc-300 font-medium">
          <Brain className="h-3.5 w-3.5 text-racing-cyan" />
          AI Race Engineer
        </h2>
        <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-400">
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
        <div className="rounded-md bg-zinc-900/50 p-3 text-center text-xs text-zinc-400">
          {user
            ? "Complete a lap on the bridge and I'll start coaching."
            : "Coaching active in session-only mode. Sign in to keep your personal bests."}
        </div>
      )}
      {loading && (
        <div className="flex items-center gap-2 rounded-md bg-zinc-900/50 p-3 text-xs text-zinc-400">
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
            {pb && (
              <span className="font-mono text-[10px] text-zinc-400">
                Δ {t.deltaSec >= 0 ? "+" : ""}
                {t.deltaSec.toFixed(3)}s
              </span>
            )}
            <button
              onClick={() => speakCall(call)}
              disabled={speaking}
              className="ml-auto flex items-center gap-1 rounded-sm bg-black/30 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-200 hover:bg-black/50 disabled:opacity-40"
            >
              {speaking ? <Loader2 className="h-3 w-3 animate-spin" /> : <Volume2 className="h-3 w-3" />}
              {speaking ? "Speaking" : "Speak"}
            </button>
          </div>
          <div className={`text-lg font-semibold leading-tight ${style.text}`}>{call.headline}</div>
          <div className="mt-1 text-xs text-zinc-200">{call.detail}</div>
          {call.focus && (
            <div className="mt-1.5 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Next-lap focus → <span className="text-zinc-100">{call.focus}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PbCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-sm bg-zinc-900/50 px-2 py-1">
      <div className="text-[9px] uppercase tracking-widest text-zinc-500">{label}</div>
      <div className={`tabular-nums ${highlight ? "text-racing-green" : "text-zinc-200"}`}>{value}</div>
    </div>
  );
}
