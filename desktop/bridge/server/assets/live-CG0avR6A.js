import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link, useNavigate } from "@tanstack/react-router";
import { ShieldAlert, Gauge, Zap, Loader2, Volume2, AlertTriangle, Fingerprint, History, Wifi, RefreshCw, Play, Download, CheckCircle2, Circle, Square, Save, Trash2, Lightbulb, ChevronUp, ChevronDown, Wrench, BookOpen, FolderUp, AlertCircle, X, Palette, Settings } from "lucide-react";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { B as BackButton } from "./BackButton-D1X33uYM.js";
import { J as useAuth, n as dispatchLiveCoach, M as useTheme, o as getBridgePerformanceMode, C as supabase, N as useWorkbench, l as dispatchAdvisorCall, G as upsertMyChannelLayout, v as publishMyChannelLayout, s as listCommunityChannelLayouts, O as voteCommunityItem, H as upsertMyGearRatios, w as publishMyGearRatios, t as listCommunityGearRatios, K as useTelemetry, L as LAYOUT_PROFILES, W as WORKSPACES, P as PRESETS, D as DARK_THEME } from "./router-BaRGcILm.js";
import { b as createServerFn, e as createSsrRpc, u as useServerFn } from "./tanstack-Jo4b3tUQ.js";
import { r as requireSupabaseAuth } from "./auth-middleware-xZM3BZWQ.js";
import { g as getFingerprintForPair, a as getLastSessionForPair, b as upsertFingerprint } from "./fingerprint.functions-YOm-UIzx.js";
import { z } from "zod";
import { toast } from "sonner";
import { r as recordTelemetrySessionMeta, b as buildRegistry, c as compileMathExpression, e as evaluateCompiledMathExpression, D as DEFAULT_CHANNEL_KEYS, l as loadChannelPrefs, s as saveChannelPrefs, M as MiniTrace, a as computeHistogram, S as STATIC_CHANNELS$1, T as TelemetryEventTimeline } from "./histogramUtils-BFnLEpO8.js";
import { l as loadFingerprint, a as selectLapfiles, p as parseRaw, b as buildFingerprint, s as saveFingerprint } from "./compute-GEPYhqPD.js";
import { c as classifyCar } from "./carClass-Cyj-ZNEv.js";
import { M as MathExpressionSchema, v as validateMathExpressionSyntax } from "./schema-BU1MXGgz.js";
import { s as speakText } from "./tts.functions-C1mSSPGY.js";
import { W as WORKSPACE_PRESETS, T as TELEMETRY_INSTRUMENTS } from "./registry-E60JHNYO.js";
import "@tanstack/react-query";
import "./charts-IpNGhCyp.js";
import "@supabase/supabase-js";
import "zustand";
import "zustand/middleware";
import "@radix-ui/react-dialog";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-tabs";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./client.server-Y-0AANJ4.js";
import "seroval";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./parser-BLM9cHGX.js";
function useTelemetryBuffer(t, windowMs = 3e4, hz = 60) {
  const bufRef = useRef([]);
  const t0Ref = useRef(null);
  const lastPushRef = useRef(0);
  const [, force] = useState(0);
  useEffect(() => {
    const now = performance.now();
    if (t0Ref.current == null) t0Ref.current = now;
    const minInterval = 1e3 / hz;
    if (now - lastPushRef.current < minInterval) return;
    lastPushRef.current = now;
    const s = {
      t: now - t0Ref.current,
      speed: t.speedKph,
      rpm: t.rpm,
      throttle: t.throttle,
      brake: t.brake,
      steering: t.steeringDeg,
      gLat: t.gLat,
      gLon: t.gLon
    };
    const buf = bufRef.current;
    buf.push(s);
    const cutoff = s.t - windowMs;
    while (buf.length > 0 && buf[0].t < cutoff) buf.shift();
    force((n) => n + 1 & 65535);
  }, [t, windowMs, hz]);
  return bufRef.current;
}
const DEFAULT_DIAGNOSTICS = {
  clientFps: 0,
  streamHzActual: 0,
  streamHzTarget: 30,
  droppedMessages: 0,
  reconnectCount: 0,
  lastMessageAt: 0,
  connectionStatus: "disconnected"
};
function useBridgeDiagnostics(t, connected) {
  const [diagnostics, setDiagnostics] = useState(DEFAULT_DIAGNOSTICS);
  const lastMessageRef = useRef(Date.now());
  const messageTimesRef = useRef([]);
  const lastLatencyRef = useRef(0);
  useEffect(() => {
    const now = Date.now();
    lastMessageRef.current = now;
    const times = messageTimesRef.current;
    times.push(now);
    if (times.length > 60) times.shift();
    let streamHzActual = 0;
    if (times.length > 1) {
      const elapsed = times[times.length - 1] - times[0];
      if (elapsed > 0) {
        streamHzActual = (times.length - 1) / elapsed * 1e3;
      }
    }
    const latency = t.latencyMs || lastLatencyRef.current;
    lastLatencyRef.current = latency;
    let streamHzTarget = 30;
    if (latency && latency < 25) streamHzTarget = 60;
    setDiagnostics((prev) => ({
      ...prev,
      streamHzActual: Math.round(streamHzActual * 10) / 10,
      streamHzTarget,
      lastMessageAt: now,
      connectionStatus: connected ? "connected" : "connecting"
    }));
  }, [t, connected]);
  useEffect(() => {
    let frameCount = 0;
    let lastTime = Date.now();
    let animFrameId;
    const measure = () => {
      frameCount++;
      const now = Date.now();
      if (now - lastTime >= 1e3) {
        setDiagnostics((prev) => ({
          ...prev,
          clientFps: frameCount
        }));
        frameCount = 0;
        lastTime = now;
      }
      animFrameId = requestAnimationFrame(measure);
    };
    animFrameId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(animFrameId);
  }, []);
  return diagnostics;
}
const recordLiveLap = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => {
  if (!data?.track || !data?.car) throw new Error("track and car required");
  if (typeof data.lapTimeS !== "number" || !isFinite(data.lapTimeS) || data.lapTimeS <= 5 || data.lapTimeS > 1800) {
    throw new Error("lapTimeS out of range");
  }
  return data;
}).handler(createSsrRpc("5d696f5b7934058bc8738d1f2fd952d83aa4541bcd24aa52a66c843cc6db65e5"));
const getPersonalBest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("84a6f6d08f7994fe77af22dcb19c019c2ed58ade8761ccfd8c8af0f6dd7a5a5f"));
function coachConfidence(reasonCode, deltaToPbS) {
  switch (reasonCode) {
    case "incident":
    case "pb-streak-warn":
      return 92;
    case "pb-streak-soft":
    case "off-pace-hard":
      return 85;
    case "trending-slower":
    case "first-pb":
      return 78;
    case "matching-pb":
      return 72;
    case "off-pace-soft":
      return deltaToPbS != null && deltaToPbS > 0.25 ? 68 : 58;
    case "no-pb-yet":
      return 45;
    default:
      return 60;
  }
}
const HOT_TIRE_C = 100;
const LOW_FUEL_LAPS = 3;
const BIG_G = 1.9;
function decideTone(input) {
  const { lap, pbS, sectorBests, pbStreak, recentDeltas } = input;
  const delta = pbS != null ? +(lap.lapTimeS - pbS).toFixed(3) : null;
  const flags = {
    hotTires: lap.tireAvgC > HOT_TIRE_C,
    lowFuel: lap.fuelLapsRemaining < LOW_FUEL_LAPS,
    bigG: lap.peakLatG > BIG_G || Math.abs(lap.peakLonG) > BIG_G + 0.2,
    invalidLap: !lap.isValid,
    gentleInputs: lap.maxBrakePct < 80 && lap.maxThrottlePct < 95
  };
  const sectorOpportunities = [];
  if (sectorBests) {
    const checks = [
      [1, lap.s1S, sectorBests.s1],
      [2, lap.s2S, sectorBests.s2],
      [3, lap.s3S, sectorBests.s3]
    ];
    for (const [s, cur, best] of checks) {
      if (cur != null && best != null && cur > best + 0.05) {
        sectorOpportunities.push({ sector: s, deltaS: +(cur - best).toFixed(3) });
      }
    }
    sectorOpportunities.sort((a, b) => b.deltaS - a.deltaS);
  }
  const beats = [];
  if (flags.invalidLap || flags.bigG) {
    beats.push(
      `Lap ${flags.invalidLap ? "invalidated" : "had a >${BIG_G.toFixed(1)}g spike"} — reset and re-find rhythm.`
    );
    return summarize("warn", "incident", delta, sectorOpportunities, flags, beats);
  }
  const isNewPb = pbS == null || lap.lapTimeS < pbS;
  if (isNewPb) {
    if (pbStreak >= 3) {
      beats.push(`That's PB #${pbStreak} in a row — you are well past the comfort zone.`);
      if (flags.hotTires)
        beats.push(`Tires reading ${Math.round(lap.tireAvgC)}°C, well over the working window.`);
      if (flags.lowFuel)
        beats.push(`Only ~${lap.fuelLapsRemaining.toFixed(1)} laps of fuel left, save the car.`);
      beats.push("Bank this time. Don't chase another tenth this stint.");
      return summarize("warn", "pb-streak-warn", delta, sectorOpportunities, flags, beats);
    }
    if (pbStreak === 2 && (flags.hotTires || flags.lowFuel)) {
      beats.push(
        `Two PBs back-to-back, but ${flags.hotTires ? "tires are hot" : "fuel is getting tight"}.`
      );
      beats.push("Hold this pace for a lap, let the car settle before pushing for more.");
      return summarize("warn", "pb-streak-soft", delta, sectorOpportunities, flags, beats);
    }
    beats.push("New personal best — keep the same inputs, exact same lines.");
    if (sectorOpportunities[0]) {
      beats.push(
        `Sector ${sectorOpportunities[0].sector} is still ${sectorOpportunities[0].deltaS.toFixed(2)}s off your best in that sector — quietly chase that next.`
      );
    }
    return summarize("hold", "first-pb", delta, sectorOpportunities, flags, beats);
  }
  if (delta == null) {
    beats.push(
      "No personal best on file for this combo yet — set a clean lap to anchor the coach."
    );
    return summarize("push", "no-pb-yet", delta, sectorOpportunities, flags, beats);
  }
  const trendingSlower = recentDeltas.length >= 3 && recentDeltas.slice(-3).every((d, i, arr) => i === 0 || d > arr[i - 1]);
  if (delta <= 0.1) {
    beats.push(`Matched the PB to within ${Math.abs(delta).toFixed(3)}s.`);
    beats.push("Repeat that lap. The reps build the confidence to find more.");
    return summarize("hold", "matching-pb", delta, sectorOpportunities, flags, beats);
  }
  if (trendingSlower) {
    beats.push(
      `Last three laps drifted from ${recentDeltas[recentDeltas.length - 3].toFixed(2)}s to ${recentDeltas[recentDeltas.length - 1].toFixed(2)}s off.`
    );
    beats.push("Reset focus: pick one corner, nail the reference, build from there.");
    return summarize("push", "trending-slower", delta, sectorOpportunities, flags, beats);
  }
  if (delta > 0.4) {
    beats.push(`${delta.toFixed(2)}s off your PB.`);
    if (flags.gentleInputs)
      beats.push(
        `Peak brake only ${Math.round(lap.maxBrakePct)}%, peak throttle ${Math.round(lap.maxThrottlePct)}% — there is real margin here.`
      );
    if (sectorOpportunities[0])
      beats.push(
        `Sector ${sectorOpportunities[0].sector} alone is ${sectorOpportunities[0].deltaS.toFixed(2)}s — start there.`
      );
    return summarize("push", "off-pace-hard", delta, sectorOpportunities, flags, beats);
  }
  beats.push(`${delta.toFixed(2)}s off PB — close, but committable.`);
  if (sectorOpportunities[0])
    beats.push(
      `Sector ${sectorOpportunities[0].sector} is the largest gap (${sectorOpportunities[0].deltaS.toFixed(2)}s).`
    );
  return summarize("push", "off-pace-soft", delta, sectorOpportunities, flags, beats);
}
function summarize(tone, reasonCode, deltaToPbS, sectorOpportunities, flags, beats) {
  return {
    tone,
    reasonCode,
    deltaToPbS,
    sectorOpportunities,
    flags,
    beats,
    confidence: coachConfidence(reasonCode, deltaToPbS)
  };
}
function isLikelyInCorner(t) {
  const latG = Math.abs(t.gLat ?? 0);
  const steerDeg = Math.abs(t.steeringDeg ?? 0);
  return latG > 0.55 || steerDeg > 8;
}
async function waitForStraight(getTelemetry, options = {}) {
  const timeoutMs = options.timeoutMs ?? 7e3;
  const pollMs = options.pollMs ?? 120;
  const settleMs = options.settleMs ?? 900;
  const startedAt = Date.now();
  let straightSince = null;
  while (Date.now() - startedAt < timeoutMs) {
    const now = Date.now();
    const t = getTelemetry();
    const inCorner = isLikelyInCorner(t);
    if (!inCorner) {
      if (straightSince == null) straightSince = now;
      if (now - straightSince >= settleMs) return;
    } else {
      straightSince = null;
    }
    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }
}
function freshAggregate(now, fuelL) {
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
    tireAvgC: 0,
    peakYawRateRads: 0,
    peakShockFL: 0,
    maxBrakeLinePressTotal: 0
  };
}
function parseLapStr$1(s) {
  if (!s || s === "--.---" || s === "--:--.---") return null;
  const m = /^(?:(\d+):)?(\d+(?:\.\d+)?)$/.exec(s.trim());
  if (!m) return null;
  const mins = m[1] ? parseInt(m[1], 10) : 0;
  const secs = parseFloat(m[2]);
  if (!isFinite(secs)) return null;
  return mins * 60 + secs;
}
function useLapAggregate(t, onLapComplete) {
  const aggRef = useRef(freshAggregate(performance.now(), t.fuelRemainingL));
  const lastLapStrRef = useRef(t.lastLap);
  const [lastLapResult, setLastLapResult] = useState(null);
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
    agg.tireAvgC = agg.tireSamples > 0 ? agg.tireSum / agg.tireSamples : 0;
    if (t.extras) {
      const yaw = t.extras["YawRate"] ?? t.extras["Yaw"] ?? 0;
      agg.peakYawRateRads = Math.max(agg.peakYawRateRads, Math.abs(yaw));
      const shockFL = t.extras["LFshockDefl"] ?? t.extras["LFshockDefl_ST"] ?? 0;
      agg.peakShockFL = Math.max(agg.peakShockFL, Math.abs(shockFL));
      const blpTotal = (t.extras["BrakeLinePressureLF"] ?? 0) + (t.extras["BrakeLinePressureRF"] ?? 0) + (t.extras["BrakeLinePressureLR"] ?? 0) + (t.extras["BrakeLinePressureRR"] ?? 0);
      agg.maxBrakeLinePressTotal = Math.max(agg.maxBrakeLinePressTotal, blpTotal);
    }
  }, [t.brake, t.throttle, t.gLat, t.gLon, t.tires, t.extras]);
  const handleLapComplete = useCallback(
    (lapTimeS) => {
      const agg = aggRef.current;
      const s1S = parseLapStr$1(t.sectors.s1);
      const s2NetS = parseLapStr$1(t.sectors.s2);
      const s2S = s1S != null && s2NetS != null && s2NetS > s1S ? +(s2NetS - s1S).toFixed(3) : null;
      const s3S = s2NetS != null && s2NetS < lapTimeS ? +(lapTimeS - s2NetS).toFixed(3) : null;
      const fuelUsed = Math.max(0, agg.fuelAtStartL - t.fuelRemainingL);
      const isValid = !agg.bigGSpike && lapTimeS > 20 && lapTimeS < 600;
      const result = {
        ...agg,
        lapTimeS,
        s1S,
        s2S,
        s3S,
        fuelUsedL: fuelUsed,
        isValid,
        extras: {
          peakYawRateRads: agg.peakYawRateRads,
          peakShockFL: agg.peakShockFL,
          maxBrakeLinePressTotal: agg.maxBrakeLinePressTotal
        }
      };
      setLastLapResult(result);
      if (onLapComplete) {
        onLapComplete(result);
      }
      aggRef.current = freshAggregate(performance.now(), t.fuelRemainingL);
    },
    [t.sectors.s1, t.sectors.s2, t.fuelRemainingL, onLapComplete]
  );
  useEffect(() => {
    if (t.lastLap === lastLapStrRef.current) return;
    const prev = lastLapStrRef.current;
    lastLapStrRef.current = t.lastLap;
    if (prev === t.lastLap) return;
    const lapTimeS = parseLapStr$1(t.lastLap);
    if (lapTimeS == null) return;
    handleLapComplete(lapTimeS);
  }, [t.lastLap, handleLapComplete]);
  return {
    currentAgg: aggRef.current,
    lastLapResult
  };
}
const COACH_DEBOUNCE_MS = 45e3;
const MIN_CONFIDENCE = 55;
function fmtLap$1(s) {
  if (s == null || !isFinite(s)) return "--:--.---";
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  return `${m}:${r.toFixed(3).padStart(6, "0")}`;
}
const toneStyles = {
  push: {
    bg: "bg-racing-green/15",
    ring: "ring-racing-green/60",
    text: "text-racing-green",
    label: "PUSH",
    icon: Zap
  },
  hold: {
    bg: "bg-racing-orange/15",
    ring: "ring-racing-orange/60",
    text: "text-racing-orange",
    label: "HOLD",
    icon: Gauge
  },
  warn: {
    bg: "bg-racing-red/15",
    ring: "ring-racing-red/60",
    text: "text-racing-red",
    label: "WARN",
    icon: ShieldAlert
  }
};
function LiveCoach({ t }) {
  const { user } = useAuth();
  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [pb, setPb] = useState(null);
  const [sectorBests, setSectorBests] = useState(null);
  const [pbCount, setPbCount] = useState(0);
  const [validLapsThisSession, setValidLapsThisSession] = useState(0);
  const [lastConfidence, setLastConfidence] = useState(null);
  const pbStreakRef = useRef(0);
  const recentDeltasRef = useRef([]);
  const lastCalloutRef = useRef(null);
  const telemetryRef = useRef(t);
  telemetryRef.current = t;
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
        const r = await getPersonalBest({ data: { track: t.track, car: t.car } });
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
    async (lap) => {
      const fuelLapsRemaining = lap.fuelUsedL > 0.01 ? t.fuelRemainingL / lap.fuelUsedL : 99;
      if (lap.isValid) setValidLapsThisSession((n) => n + 1);
      const prevPbS = pb?.lapTimeS ?? null;
      const newPb = prevPbS == null || lap.isValid && lap.lapTimeS < prevPbS;
      const newStreak = newPb ? pbStreakRef.current + 1 : 0;
      pbStreakRef.current = newStreak;
      const deltaToPb = prevPbS != null ? +(lap.lapTimeS - prevPbS).toFixed(3) : null;
      if (deltaToPb != null && lap.isValid) {
        recentDeltasRef.current = [...recentDeltasRef.current, deltaToPb].slice(-5);
      }
      const summary = decideTone({
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
          isValid: lap.isValid
        },
        pbS: prevPbS,
        sectorBests,
        pbStreak: newStreak,
        recentDeltas: recentDeltasRef.current
      });
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
              isValid: lap.isValid
            }
          });
          if (newPb) {
            setPb({ lapTimeS: lap.lapTimeS, s1S: lap.s1S, s2S: lap.s2S, s3S: lap.s3S });
            setPbCount((c) => c + 1);
          }
        } catch {
        }
      } else if (!user && newPb) {
        setPb({ lapTimeS: lap.lapTimeS, s1S: lap.s1S, s2S: lap.s2S, s3S: lap.s3S });
      }
      const now = Date.now();
      const last = lastCalloutRef.current;
      const deltaWorsened = summary.deltaToPbS != null && last?.deltaToPb != null && summary.deltaToPbS > last.deltaToPb + 0.1;
      if (last && last.reasonCode === summary.reasonCode && now - last.at < COACH_DEBOUNCE_MS && !deltaWorsened) {
        return;
      }
      const ruleCall = {
        tone: summary.tone,
        headline: summary.beats[0] ?? "Lap complete",
        detail: summary.beats.slice(1).join(" ") || "Keep building rhythm."
      };
      const useAi = summary.confidence >= MIN_CONFIDENCE;
      setLoading(true);
      setError(null);
      try {
        let finalCall = ruleCall;
        if (useAi) {
          const resp = await dispatchLiveCoach({
            summary,
            context: {
              track: t.track,
              car: t.car,
              lapTimeS: lap.lapTimeS,
              pbS: prevPbS,
              pbStreak: newStreak,
              // Bridge extras — present only when iRacing SDK provides them
              extras: lap.extras
            }
          });
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
          deltaToPb: summary.deltaToPbS
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
    [t.track, t.car, t.fuelRemainingL, pb, sectorBests, user, autoSpeak]
  );
  useLapAggregate(t, handleLapComplete);
  const speakCall = async (c) => {
    if (speaking) return;
    setSpeaking(true);
    try {
      const text = c.focus ? `${c.headline}. ${c.detail}. Focus: ${c.focus}.` : `${c.headline}. ${c.detail}.`;
      const { speak } = await import("./tts-client-C5j1UrAZ.js");
      const err = await speak(text);
      if (err) console.warn("[LiveCoach] TTS:", err);
    } catch {
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
      tone: "hold",
      headline: "Systems Check Ready",
      detail: user ? "Monitoring live telemetry from the bridge. Complete a clean lap on track, and I'll analyze your sectors and throttle inputs to provide live real-time audio coaching." : "Awaiting telemetry. Complete a lap on track for live telemetry-driven coaching. Sign in to save and track your personal best laps.",
      focus: "Complete a clean lap on track"
    };
    const activeStyle = toneStyles[activeCall.tone];
    const ActiveToneIcon = activeStyle.icon;
    return /* @__PURE__ */ jsxs("div", { className: "border border-border bg-background h-full flex flex-col overflow-hidden font-mono select-none", children: [
      /* @__PURE__ */ jsxs("div", { className: "border-b border-border px-2 py-1.5 text-[9px] uppercase tracking-wider text-muted-foreground flex-shrink-0 flex items-center justify-between bg-background", children: [
        /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground tracking-[0.18em]", children: "AI Coach" }),
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-[8px] text-rose-500 font-bold tracking-wider", children: [
          /* @__PURE__ */ jsx("span", { className: "size-1.5 rounded-full bg-rose-500 animate-pulse" }),
          "LIVE COACH"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 p-3 flex gap-3 overflow-hidden min-h-0 bg-panel-2 items-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "w-72 h-72 flex-shrink-0 relative", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: "/images/coach-avatar.png",
              alt: "AI Coach",
              className: "w-full h-full object-cover rounded border border-border/80 shadow-lg"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute bottom-1 right-1 size-3.5 rounded-full bg-emerald-500 border border-background animate-pulse" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col justify-between h-full min-w-0 bg-black/45 border border-border/60 rounded p-2.5 relative", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 rotate-45 bg-black/45 border-l border-b border-border/60" }),
          /* @__PURE__ */ jsxs("div", { className: "overflow-y-auto pr-1 flex-1 min-h-0 select-text", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 mb-1 flex-wrap", children: [
              /* @__PURE__ */ jsxs(
                "span",
                {
                  className: `flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${activeStyle.text} bg-black/40 border border-border/20`,
                  children: [
                    /* @__PURE__ */ jsx(ActiveToneIcon, { className: "h-2.5 w-2.5" }),
                    activeStyle.label
                  ]
                }
              ),
              lastConfidence != null && call && /* @__PURE__ */ jsxs("span", { className: "text-[8px] text-muted-foreground uppercase tracking-widest", children: [
                "Confidence: ",
                lastConfidence,
                "%"
              ] }),
              pb && call && /* @__PURE__ */ jsxs("span", { className: "text-[8px] text-muted-foreground font-mono", children: [
                "Δ ",
                t.deltaSec >= 0 ? "+" : "",
                t.deltaSec.toFixed(3),
                "s"
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: `text-[11px] font-bold leading-snug uppercase tracking-wide ${activeStyle.text}`, children: activeCall.headline }),
            /* @__PURE__ */ jsx("div", { className: "mt-1 text-[10px] text-muted-foreground leading-normal font-sans", children: activeCall.detail }),
            activeCall.focus && /* @__PURE__ */ jsxs("div", { className: "mt-1.5 text-[8px] uppercase tracking-wider text-muted-foreground font-mono", children: [
              "Focus: ",
              /* @__PURE__ */ jsx("span", { className: "text-foreground", children: activeCall.focus })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => speakCall(activeCall),
              disabled: speaking || loading,
              className: "mt-2 w-full flex items-center justify-center gap-1.5 rounded bg-black/30 hover:bg-black/60 px-2 py-1.5 text-[9px] uppercase tracking-wider text-foreground hover:text-white disabled:opacity-40 border border-border/40 transition-colors",
              children: [
                speaking ? /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin text-muted-foreground" }) : /* @__PURE__ */ jsx(Volume2, { className: "h-3 w-3 text-muted-foreground" }),
                speaking ? "Speaking..." : "Speak Last Lap"
              ]
            }
          )
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: `bg-panel-2 ring-1 ${call ? style.ring : "ring-white/5"} rounded-lg p-4`, children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxs("h2", { className: "flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-foreground font-semibold", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: "/images/coach-avatar.png",
              alt: "AI Coach",
              className: "h-36 w-36 rounded-md object-cover ring-2 ring-border shadow-md"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute bottom-0 right-0 size-3 rounded-full bg-emerald-500 border border-background animate-pulse" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-0.5", children: [
          /* @__PURE__ */ jsx("span", { children: "AI Coach" }),
          /* @__PURE__ */ jsx("span", { className: "flex items-center gap-1 text-[8px] text-emerald-400 font-bold", children: "LIVE COACH" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-[10px] font-mono text-muted-foreground", children: [
        !user && /* @__PURE__ */ jsx("span", { className: "text-racing-orange", children: "Sign in to save PBs" }),
        /* @__PURE__ */ jsxs("label", { className: "flex cursor-pointer items-center gap-1", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: autoSpeak,
              onChange: (e) => setAutoSpeak(e.target.checked),
              className: "h-3 w-3 accent-racing-cyan"
            }
          ),
          /* @__PURE__ */ jsx(Volume2, { className: "h-3 w-3" }),
          /* @__PURE__ */ jsx("span", { children: "Auto-speak" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-3 grid grid-cols-4 gap-2 text-[10px] font-mono", children: [
      /* @__PURE__ */ jsx(PbCell, { label: "PB", value: fmtLap$1(pb?.lapTimeS ?? null), highlight: true }),
      /* @__PURE__ */ jsx(PbCell, { label: "S1 BEST", value: pb?.s1S != null ? pb.s1S.toFixed(3) : "—" }),
      /* @__PURE__ */ jsx(PbCell, { label: "S2 BEST", value: sectorBests?.s2 != null ? sectorBests.s2.toFixed(3) : "—" }),
      /* @__PURE__ */ jsx(PbCell, { label: "LAPS LOGGED", value: `${validLapsThisSession} / ${pbCount}` })
    ] }),
    !call && !loading && /* @__PURE__ */ jsx("div", { className: "rounded-md bg-muted/50 p-3 text-center text-xs text-muted-foreground", children: user ? "Complete a lap on the bridge and I'll start coaching." : "Coaching active in session-only mode. Sign in to keep your personal bests." }),
    loading && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin" }),
      "Reading lap…"
    ] }),
    error && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 rounded-md border border-racing-red/40 bg-racing-red/10 p-3 text-xs text-racing-red", children: [
      /* @__PURE__ */ jsx(AlertTriangle, { className: "mt-0.5 h-3.5 w-3.5 shrink-0" }),
      /* @__PURE__ */ jsx("span", { children: error })
    ] }),
    call && !loading && /* @__PURE__ */ jsxs("div", { className: `rounded-md p-3 ${style.bg} ring-1 ${style.ring}`, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1.5", children: [
        /* @__PURE__ */ jsxs(
          "span",
          {
            className: `flex items-center gap-1 rounded-sm px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${style.text} bg-black/30`,
            children: [
              /* @__PURE__ */ jsx(ToneIcon, { className: "h-3 w-3" }),
              style.label
            ]
          }
        ),
        lastConfidence != null && /* @__PURE__ */ jsxs("span", { className: "font-mono text-[9px] text-muted-foreground", title: "Rules-engine confidence", children: [
          lastConfidence,
          "%"
        ] }),
        pb && /* @__PURE__ */ jsxs("span", { className: "font-mono text-[10px] text-muted-foreground", children: [
          "Δ ",
          t.deltaSec >= 0 ? "+" : "",
          t.deltaSec.toFixed(3),
          "s"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-4 mt-2 items-center", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: "/images/coach-avatar.png",
            alt: "AI Coach",
            className: "h-64 w-64 rounded-md object-cover ring-2 ring-border shadow-lg flex-shrink-0"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("div", { className: `text-sm font-semibold leading-tight ${style.text}`, children: call.headline }),
          /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-foreground leading-relaxed", children: call.detail }),
          call.focus && /* @__PURE__ */ jsxs("div", { className: "mt-1.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground", children: [
            "Focus → ",
            /* @__PURE__ */ jsx("span", { className: "text-foreground", children: call.focus })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => speakCall(call),
          disabled: speaking,
          className: "mt-3 w-full flex items-center justify-center gap-2 rounded-sm bg-black/30 px-3 py-1.5 text-[10px] uppercase tracking-wider text-foreground hover:bg-black/50 disabled:opacity-40 border border-border",
          children: [
            speaking ? /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsx(Volume2, { className: "h-3.5 w-3.5" }),
            speaking ? "Speaking..." : "Speak Last Lap"
          ]
        }
      )
    ] })
  ] });
}
function PbCell({
  label,
  value,
  highlight
}) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-sm bg-muted/50 px-2 py-1", children: [
    /* @__PURE__ */ jsx("div", { className: "text-[9px] uppercase tracking-widest text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("div", { className: `tabular-nums ${highlight ? "text-racing-green" : "text-foreground"}`, children: value })
  ] });
}
function fmtLap(s) {
  if (s == null || !isFinite(s)) return "—";
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  return `${m}:${r.toFixed(3).padStart(6, "0")}`;
}
function relativeTime(iso) {
  if (!iso) return "";
  const d = new Date(iso).getTime();
  if (!isFinite(d)) return "";
  const diff = Date.now() - d;
  const day = 864e5;
  if (diff < 36e5) return `${Math.floor(diff / 6e4)}m ago`;
  if (diff < day) return `${Math.floor(diff / 36e5)}h ago`;
  return `${Math.floor(diff / day)}d ago`;
}
function parseLapStr(s) {
  if (!s || s === "--.---" || s === "--:--.---") return null;
  const m = /^(?:(\d+):)?(\d+(?:\.\d+)?)$/.exec(s.trim());
  if (!m) return null;
  const mins = m[1] ? parseInt(m[1], 10) : 0;
  return mins * 60 + parseFloat(m[2]);
}
function LiveReference({ t }) {
  const { user } = useAuth();
  const [fp, setFp] = useState(null);
  const [lastSess, setLastSess] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!user || !t.track || !t.car) {
      setFp(null);
      setLastSess(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const [fpR, sessR] = await Promise.all([
          getFingerprintForPair({ data: { track: t.track, car: t.car } }),
          getLastSessionForPair({ data: { track: t.track, car: t.car } })
        ]);
        if (cancelled) return;
        setFp(fpR.fp);
        setLastSess(sessR.session);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, t.track, t.car]);
  const liveBest = parseLapStr(t.bestLap);
  const pb = fp?.best_ever_s ?? null;
  const opt = fp?.optimal_ever_s ?? null;
  const last = lastSess?.best_lap_s != null ? Number(lastSess.best_lap_s) : null;
  const dPb = liveBest != null && pb != null ? +(liveBest - pb).toFixed(3) : null;
  const dOpt = liveBest != null && opt != null ? +(liveBest - opt).toFixed(3) : null;
  const dLast = liveBest != null && last != null ? +(liveBest - last).toFixed(3) : null;
  return /* @__PURE__ */ jsxs("div", { className: "bg-panel-2 ring-1 ring-white/5 rounded-lg p-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(Fingerprint, { className: "h-3.5 w-3.5 text-racing-cyan" }),
      /* @__PURE__ */ jsx("h2", { className: "text-[10px] uppercase tracking-[0.2em] text-foreground font-medium", children: "Reference Pace" }),
      !user && /* @__PURE__ */ jsx("span", { className: "ml-auto text-[10px] font-mono text-racing-orange", children: "Sign in to use baseline" }),
      user && !fp && !loading && /* @__PURE__ */ jsx(
        Link,
        {
          to: "/fingerprint",
          className: "ml-auto text-[10px] font-mono text-racing-cyan hover:underline",
          children: "Build fingerprint →"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 gap-2 font-mono text-[11px]", children: [
      /* @__PURE__ */ jsx(RefCell, { label: "This best", value: fmtLap(liveBest), highlight: true }),
      /* @__PURE__ */ jsx(
        RefCell,
        {
          label: "All-time PB",
          value: fmtLap(pb),
          delta: dPb,
          sub: fp ? "fingerprint" : loading ? "…" : "—"
        }
      ),
      /* @__PURE__ */ jsx(RefCell, { label: "Optimal", value: fmtLap(opt), delta: dOpt, sub: fp ? "theoretical" : "—" }),
      /* @__PURE__ */ jsx(
        RefCell,
        {
          label: "Last session",
          value: fmtLap(last),
          delta: dLast,
          sub: lastSess ? relativeTime(lastSess.recorded_at) : loading ? "…" : "no upload",
          link: lastSess ? `/sessions/${lastSess.id}` : void 0
        }
      )
    ] }),
    lastSess && /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground", children: [
      /* @__PURE__ */ jsx(History, { className: "h-3 w-3" }),
      /* @__PURE__ */ jsx("span", { className: "truncate", children: lastSess.name })
    ] })
  ] });
}
function RefCell({
  label,
  value,
  delta,
  sub,
  highlight,
  link
}) {
  const dColor = delta == null ? "text-muted-foreground" : delta < -0.05 ? "text-emerald-400" : delta > 0.05 ? "text-rose-400" : "text-foreground";
  const dStr = delta == null ? "" : `${delta > 0 ? "+" : ""}${delta.toFixed(3)}s`;
  const inner = /* @__PURE__ */ jsxs("div", { className: "rounded-sm bg-muted/60 px-2 py-1.5", children: [
    /* @__PURE__ */ jsx("div", { className: "text-[9px] uppercase tracking-widest text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("div", { className: `tabular-nums ${highlight ? "text-racing-cyan" : "text-foreground"}`, children: value }),
    /* @__PURE__ */ jsx("div", { className: `text-[10px] tabular-nums ${dColor}`, children: dStr || (sub ?? " ") }),
    dStr && sub && /* @__PURE__ */ jsx("div", { className: "text-[9px] uppercase tracking-widest text-muted-foreground", children: sub })
  ] });
  return link ? /* @__PURE__ */ jsx(Link, { to: link, className: "block hover:ring-1 hover:ring-racing-cyan/40 rounded-sm", children: inner }) : inner;
}
const getBridgeStatus = createServerFn({
  method: "GET"
}).handler(createSsrRpc("048bc3835eab8f97e7ee69a78abd12af09426185466e8d8438b6086be0a3206c"));
const startBridge = createServerFn({
  method: "POST"
}).inputValidator((input) => z.object({
  mode: z.enum(["stable30", "balanced60"]).optional()
}).optional().parse(input)).handler(createSsrRpc("44ccc16895fc9e7ce2624636ebfdb09af87f537ec0f50a6c81242686434b920a"));
createServerFn({
  method: "POST"
}).handler(createSsrRpc("35d21eb114150000c384e4af7abe715ee60bee975d2a6d5afbd52703f88c378a"));
const WS_PORT = 3001;
function getBridgeWsUrl() {
  if (typeof window === "undefined") return `ws://localhost:${WS_PORT}`;
  const configured = new URLSearchParams(window.location.search).get("bridge");
  if (configured) return configured;
  const host = ["localhost", "127.0.0.1"].includes(window.location.hostname) ? window.location.hostname : "localhost";
  return `ws://${host}:${WS_PORT}`;
}
function probeBridgeWebSocket(timeoutMs = 2500) {
  return new Promise((resolve) => {
    if (typeof WebSocket === "undefined") {
      resolve(false);
      return;
    }
    let settled = false;
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        ws.close();
      } catch {
      }
      resolve(ok);
    };
    let ws;
    try {
      ws = new WebSocket(getBridgeWsUrl());
    } catch {
      finish(false);
      return;
    }
    const timer = setTimeout(() => finish(false), timeoutMs);
    ws.onopen = () => finish(true);
    ws.onerror = () => finish(false);
  });
}
function useBridgeConnection(iracingLive = false, pollMs = 3e3) {
  const [serviceRunning, setServiceRunning] = useState(false);
  const [wsReachable, setWsReachable] = useState(false);
  const [checking, setChecking] = useState(true);
  const refresh = useCallback(async () => {
    setChecking(true);
    const [status, wsOk] = await Promise.all([
      getBridgeStatus().then((r) => r.running).catch(() => false),
      probeBridgeWebSocket()
    ]);
    setServiceRunning(status);
    setWsReachable(wsOk);
    setChecking(false);
  }, []);
  useEffect(() => {
    refresh();
    const id = setInterval(refresh, pollMs);
    return () => clearInterval(id);
  }, [refresh, pollMs]);
  return {
    serviceRunning,
    wsReachable: wsReachable || serviceRunning,
    iracingLive,
    checking,
    refresh
  };
}
function StepRow({
  done,
  active,
  label,
  detail
}) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `flex items-start gap-3 rounded-md px-3 py-2.5 transition-colors ${active ? "bg-accent/80 ring-1 ring-racing-orange/30" : done ? "bg-muted/40" : "bg-muted/20"}`,
      children: [
        done ? /* @__PURE__ */ jsx(CheckCircle2, { className: "mt-0.5 h-4 w-4 shrink-0 text-emerald-400" }) : /* @__PURE__ */ jsx(
          Circle,
          {
            className: `mt-0.5 h-4 w-4 shrink-0 ${active ? "text-racing-orange" : "text-muted-foreground"}`
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: `text-[11px] font-mono uppercase tracking-wider ${done ? "text-emerald-400" : "text-foreground"}`,
              children: label
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-[11px] text-muted-foreground leading-relaxed", children: detail })
        ] })
      ]
    }
  );
}
function BridgeInstall({ iracingLive = false }) {
  const [launching, setLaunching] = useState(false);
  const bridge = useBridgeConnection(iracingLive);
  const step1 = bridge.serviceRunning || bridge.wsReachable;
  const step2 = bridge.wsReachable;
  const step3 = iracingLive;
  const handleStart = async () => {
    setLaunching(true);
    try {
      const mode = getBridgePerformanceMode();
      const res = await startBridge({ data: { mode } });
      if (res.success) {
        toast.success(
          `${res.message || "Bridge started."} Mode: ${mode === "stable30" ? "Stable 30Hz" : "Balanced 60Hz"}`
        );
        bridge.refresh();
      } else {
        toast.error(res.error || "Failed to start local bridge.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to contact server.");
    } finally {
      setLaunching(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-panel-2 ring-1 ring-racing-orange/40 p-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 mb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Wifi, { className: `h-4 w-4 ${step3 ? "text-emerald-400" : "text-racing-orange"}` }),
        /* @__PURE__ */ jsx("h2", { className: "text-[11px] uppercase tracking-[0.2em] font-medium font-mono text-foreground", children: step3 ? "Live — iRacing connected" : step1 ? "Bridge ready — waiting for iRacing" : "Connect telemetry" })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => bridge.refresh(),
          disabled: bridge.checking,
          className: "rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-40",
          "aria-label": "Refresh connection status",
          children: /* @__PURE__ */ jsx(RefreshCw, { className: `h-3.5 w-3.5 ${bridge.checking ? "animate-spin" : ""}` })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2 mb-4", children: [
      /* @__PURE__ */ jsx(
        StepRow,
        {
          done: step1,
          active: !step1,
          label: "Step 1 — Bridge service",
          detail: step1 ? "WebSocket service is running on port 3001." : 'Click "Run Local Bridge" below, or start desktop/bridge on this PC.'
        }
      ),
      /* @__PURE__ */ jsx(
        StepRow,
        {
          done: step2,
          active: step1 && !step2,
          label: "Step 2 — Port reachable",
          detail: step2 ? "Browser can reach ws://localhost:3001." : "If this stays red, check Windows Firewall allows Node.js on port 3001."
        }
      ),
      /* @__PURE__ */ jsx(
        StepRow,
        {
          done: step3,
          active: step2 && !step3,
          label: "Step 3 — iRacing session",
          detail: step3 ? "Telemetry is streaming from the sim." : "Launch iRacing, get in a car, and enter practice or a session."
        }
      )
    ] }),
    !step1 && /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: handleStart,
        disabled: launching,
        className: "flex w-full items-center justify-center gap-2 rounded bg-primary py-2.5 text-xs font-mono font-medium uppercase tracking-wider text-primary-foreground hover:opacity-95 disabled:opacity-50 transition-opacity mb-4",
        children: launching ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }),
          "Starting bridge…"
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Play, { className: "h-3.5 w-3.5 fill-current" }),
          "Run Local Bridge"
        ] })
      }
    ),
    step1 && !step3 && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground mb-4 leading-relaxed", children: "Bridge is up. Open iRacing on this PC — data appears automatically when you are on track." }),
    /* @__PURE__ */ jsxs("div", { className: "pt-3 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground font-mono", children: [
      /* @__PURE__ */ jsx("span", { children: "Bridge Package" }),
      /* @__PURE__ */ jsxs(
        "a",
        {
          href: "/downloads/pit-wall-bridge.zip",
          className: "flex items-center gap-1 hover:text-foreground transition-colors text-primary font-semibold",
          children: [
            /* @__PURE__ */ jsx(Download, { className: "h-3 w-3" }),
            " Download pit-wall-bridge.zip"
          ]
        }
      )
    ] })
  ] });
}
const SAMPLE_HZ = 60;
const MAX_DURATION_S = 60 * 60 * 4;
const STATIC_CHANNELS = [
  // Engine / velocity
  { name: "Speed", unit: "m/s", group: "Velocity", pick: (t) => t.speedKph / 3.6 },
  { name: "SpeedKph", unit: "kph", group: "Velocity", pick: (t) => t.speedKph },
  { name: "RPM", unit: "rpm", group: "Engine", pick: (t) => t.rpm },
  { name: "Gear", unit: "", group: "Engine", pick: (t) => t.gear },
  // Driver
  { name: "Throttle", unit: "%", group: "Driver", pick: (t) => t.throttle },
  { name: "Brake", unit: "%", group: "Driver", pick: (t) => t.brake },
  { name: "Clutch", unit: "%", group: "Driver", pick: (t) => t.clutch },
  {
    name: "SteeringWheelAngle",
    unit: "rad",
    group: "Driver",
    pick: (t) => t.steeringDeg * Math.PI / 180
  },
  { name: "SteeringDeg", unit: "deg", group: "Driver", pick: (t) => t.steeringDeg },
  // Forces
  { name: "LatAccel", unit: "m/s^2", group: "Forces", pick: (t) => t.gLat * 9.81 },
  { name: "LongAccel", unit: "m/s^2", group: "Forces", pick: (t) => t.gLon * 9.81 },
  // Fuel
  { name: "FuelLevel", unit: "L", group: "Fuel", pick: (t) => t.fuelRemainingL },
  { name: "FuelLapsRemaining", unit: "", group: "Fuel", pick: (t) => t.lapsEstimated },
  // Timing
  { name: "LapDelta", unit: "s", group: "Timing", pick: (t) => t.deltaSec },
  // Tires — temps, pressures, wear
  { name: "LFTempCM", unit: "C", group: "Tires", pick: (t) => t.tires.fl.tempC },
  { name: "RFTempCM", unit: "C", group: "Tires", pick: (t) => t.tires.fr.tempC },
  { name: "LRTempCM", unit: "C", group: "Tires", pick: (t) => t.tires.rl.tempC },
  { name: "RRTempCM", unit: "C", group: "Tires", pick: (t) => t.tires.rr.tempC },
  { name: "LFpressure", unit: "bar", group: "Tires", pick: (t) => t.tires.fl.pressureBar },
  { name: "RFpressure", unit: "bar", group: "Tires", pick: (t) => t.tires.fr.pressureBar },
  { name: "LRpressure", unit: "bar", group: "Tires", pick: (t) => t.tires.rl.pressureBar },
  { name: "RRpressure", unit: "bar", group: "Tires", pick: (t) => t.tires.rr.pressureBar },
  { name: "LFwearPct", unit: "%", group: "Tires", pick: (t) => t.tires.fl.wearPct },
  { name: "RFwearPct", unit: "%", group: "Tires", pick: (t) => t.tires.fr.wearPct },
  { name: "LRwearPct", unit: "%", group: "Tires", pick: (t) => t.tires.rl.wearPct },
  { name: "RRwearPct", unit: "%", group: "Tires", pick: (t) => t.tires.rr.wearPct },
  // Weather / car setup live
  { name: "AirTemp", unit: "C", group: "Weather", pick: (t) => t.airTempC },
  { name: "TrackTempCrew", unit: "C", group: "Weather", pick: (t) => t.trackTempC },
  { name: "dcBrakeBias", unit: "%", group: "Setup", pick: (t) => t.brakeBias },
  // Network
  { name: "Latency", unit: "ms", group: "Network", pick: (t) => t.latencyMs }
];
const STATIC_CHANNEL_NAMES = new Set(STATIC_CHANNELS.map((d) => d.name));
function emptyStore() {
  const out = {};
  for (const def of STATIC_CHANNELS) {
    out[def.name] = { unit: def.unit, group: def.group, data: [] };
  }
  return out;
}
function pushSample(store, tSec, ts, snap) {
  ts.push(+tSec.toFixed(4));
  for (const def of STATIC_CHANNELS) {
    store[def.name].data.push(+def.pick(snap).toFixed(4));
  }
  if (snap.extras) {
    for (const [k, v] of Object.entries(snap.extras)) {
      if (typeof v !== "number" || !isFinite(v)) continue;
      if (STATIC_CHANNEL_NAMES.has(k)) continue;
      let col = store[k];
      if (!col) {
        col = { unit: "", group: "Bridge", data: new Array(ts.length - 1).fill(NaN) };
        store[k] = col;
      }
      col.data.push(+v.toFixed(4));
    }
    for (const [name, col] of Object.entries(store)) {
      if (col.group === "Bridge" && col.data.length < ts.length) col.data.push(NaN);
    }
  }
}
function useLiveRecorder(t) {
  const [state, setState] = useState("idle");
  const [sampleCount, setSampleCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const channels = useRef(emptyStore());
  const tColumn = useRef([]);
  const startedAt = useRef(0);
  const lastSample = useRef(0);
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);
  useEffect(() => {
    if (state !== "recording") return;
    const id = setInterval(() => {
      const now = performance.now();
      if (now - lastSample.current < 1e3 / SAMPLE_HZ - 2) return;
      lastSample.current = now;
      const sec = (now - startedAt.current) / 1e3;
      if (sec > MAX_DURATION_S) {
        setState("idle");
        return;
      }
      pushSample(channels.current, sec, tColumn.current, tRef.current);
      setSampleCount(tColumn.current.length);
      setElapsed(sec);
    }, 1e3 / SAMPLE_HZ);
    return () => clearInterval(id);
  }, [state]);
  const start = useCallback(() => {
    channels.current = emptyStore();
    tColumn.current = [];
    startedAt.current = performance.now();
    lastSample.current = 0;
    setSampleCount(0);
    setElapsed(0);
    setState("recording");
  }, []);
  const stop = useCallback(() => setState("idle"), []);
  const reset = useCallback(() => {
    channels.current = emptyStore();
    tColumn.current = [];
    setSampleCount(0);
    setElapsed(0);
    setState("idle");
  }, []);
  const save = useCallback(
    async (userId) => {
      if (tColumn.current.length === 0) throw new Error("Nothing recorded yet");
      setState("saving");
      try {
        const snap = tRef.current;
        const doc = {
          version: 2,
          format: "pwlap",
          track: snap.track || "Unknown",
          car: snap.car || "Unknown",
          startedAt: new Date(Date.now() - elapsed * 1e3).toISOString(),
          durationS: +elapsed.toFixed(2),
          sampleRate: SAMPLE_HZ,
          bestLapS: parseLap(snap.bestLap),
          source: snap.source,
          t: tColumn.current,
          channels: channels.current
        };
        const json = JSON.stringify(doc);
        const fileSize = new TextEncoder().encode(json).length;
        const filename = `${doc.track}-${doc.car}-${Date.now()}.pwlap`.replace(/[^\w.\-]+/g, "_");
        const isLocalDeveloper = typeof window !== "undefined" && (localStorage.getItem("apex_local_session") || false);
        if (!userId) {
          const blob = new Blob([json], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          a.click();
          return { sessionId: null, filename, blob };
        }
        const path = `${userId}/${crypto.randomUUID()}-${filename}`;
        if (!isLocalDeveloper) {
          const blob = new Blob([json], { type: "application/json" });
          const { error: upErr } = await supabase.storage.from("telemetry").upload(path, blob, { contentType: "application/json", upsert: false });
          if (upErr) throw upErr;
        }
        const res = await recordTelemetrySessionMeta({
          data: {
            name: filename,
            track: doc.track,
            car: doc.car,
            duration_s: doc.durationS,
            lap_count: 0,
            tick_rate: SAMPLE_HZ,
            num_vars: Object.keys(doc.channels).length,
            file_size: fileSize,
            best_lap_s: doc.bestLapS,
            storage_path: path,
            recorded_at: doc.startedAt,
            fullDoc: doc
            // Pass full telemetry payload for local MongoDB zero-latency storage!
          }
        });
        if (!res.ok) throw new Error(res.error || "Failed inserting session metadata");
        return { sessionId: res.id, filename };
      } finally {
        setState("idle");
      }
    },
    [elapsed]
  );
  return {
    state,
    sampleCount,
    elapsed,
    channelCount: Object.keys(channels.current).length,
    start,
    stop,
    reset,
    save
  };
}
function parseLap(s) {
  if (!s) return null;
  const m = /^(\d+):(\d+(?:\.\d+)?)$/.exec(s);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseFloat(m[2]);
}
function fmtElapsed(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}
function RecordingControls({ t }) {
  const { state, sampleCount, elapsed, channelCount, save, start, stop, reset } = useLiveRecorder(t);
  const { user } = useAuth();
  const navigate = useNavigate();
  const setPendingLocalBlob = useWorkbench((s) => s.setPendingLocalBlob);
  const [pulse, setPulse] = useState(false);
  const onStart = () => {
    start();
    setPulse(true);
    setTimeout(() => setPulse(false), 600);
    toast.success("Recording live telemetry");
  };
  const onSave = async () => {
    try {
      const res = await save(user?.id ?? null);
      if (res.sessionId) {
        toast.success("Session saved");
        navigate({ to: "/sessions/$id", params: { id: res.sessionId } });
      } else {
        toast.message("Recording downloaded", {
          description: "Sign in to save it to your library."
        });
        if (res.blob) setPendingLocalBlob(res.blob);
      }
    } catch (e) {
      toast.error(e.message);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-panel-2 ring-1 ring-white/5 p-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-[10px] uppercase tracking-[0.2em] text-foreground font-medium", children: "Session recording" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            className: `size-2 rounded-full ${state === "recording" ? "bg-racing-red animate-pulse" : "bg-zinc-700"} ${pulse ? "scale-150 transition-transform" : ""}`
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono uppercase text-foreground", children: state === "recording" ? "REC" : state === "saving" ? "SAVING" : sampleCount > 0 ? "STOPPED" : "READY" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 gap-3 font-mono text-xs mb-4", children: [
      /* @__PURE__ */ jsx(Stat$1, { label: "ELAPSED", value: fmtElapsed(elapsed) }),
      /* @__PURE__ */ jsx(Stat$1, { label: "SAMPLES", value: sampleCount.toLocaleString() }),
      /* @__PURE__ */ jsx(Stat$1, { label: "CHANNELS", value: String(channelCount) }),
      /* @__PURE__ */ jsx(Stat$1, { label: "SOURCE", value: t.source.toUpperCase() })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
      state !== "recording" ? /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: onStart,
          disabled: state === "saving",
          className: "inline-flex items-center gap-1.5 rounded-md bg-racing-red/20 hover:bg-racing-red/30 text-racing-red px-3 py-1.5 text-xs font-mono uppercase tracking-wider disabled:opacity-40",
          children: [
            /* @__PURE__ */ jsx(Circle, { className: "h-3.5 w-3.5 fill-current" }),
            sampleCount > 0 ? "New recording" : "Start recording"
          ]
        }
      ) : /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: stop,
          className: "inline-flex items-center gap-1.5 rounded-md bg-accent hover:bg-zinc-700 text-foreground px-3 py-1.5 text-xs font-mono uppercase tracking-wider",
          children: [
            /* @__PURE__ */ jsx(Square, { className: "h-3.5 w-3.5 fill-current" }),
            "Stop"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: onSave,
          disabled: state !== "idle" || sampleCount === 0,
          className: "inline-flex items-center gap-1.5 rounded-md bg-racing-green/20 hover:bg-racing-green/30 text-racing-green px-3 py-1.5 text-xs font-mono uppercase tracking-wider disabled:opacity-40",
          children: [
            /* @__PURE__ */ jsx(Save, { className: "h-3.5 w-3.5" }),
            user ? "Save to library" : "Download .pwlap"
          ]
        }
      ),
      sampleCount > 0 && state === "idle" && /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: reset,
          className: "inline-flex items-center gap-1.5 rounded-md ring-1 ring-border hover:bg-muted text-muted-foreground px-3 py-1.5 text-xs font-mono uppercase tracking-wider",
          title: "Discard",
          children: [
            /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }),
            "Discard"
          ]
        }
      )
    ] }),
    !user && sampleCount > 0 && /* @__PURE__ */ jsxs("p", { className: "mt-3 text-[10px] text-muted-foreground", children: [
      "Signed-out recordings download as ",
      /* @__PURE__ */ jsx("code", { className: "font-mono", children: ".pwlap" }),
      " files only. Sign in to save them to your library."
    ] })
  ] });
}
function Stat$1({ label, value }) {
  return /* @__PURE__ */ jsxs("div", { className: "bg-muted/60 rounded p-2", children: [
    /* @__PURE__ */ jsx("p", { className: "text-[9px] text-muted-foreground uppercase", children: label }),
    /* @__PURE__ */ jsx("p", { className: "text-sm tabular-nums", children: value })
  ] });
}
const MIN_LAPS = 3;
const SYMPTOM_OPTIONS = [
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
  { id: "bouncy_over_curbs", label: "Bouncy over kerbs", group: "ride" }
];
function AdvisorButton({ t }) {
  const [laps, setLaps] = useState([]);
  const [loading, setLoading] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [fallback, setFallback] = useState(null);
  const [trackType, setTrackType] = useState("road");
  const [cornerBias, setCornerBias] = useState("mixed");
  const [symptoms, setSymptoms] = useState([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const handleLapComplete = (lap) => {
    const lapAgg = {
      ...lap,
      tires: t.tires,
      brakeBias: t.brakeBias,
      diffMap: t.diffMap,
      airTempC: t.airTempC,
      trackTempC: t.trackTempC,
      liveExtras: {
        peakYawRateRads: lap.extras.peakYawRateRads,
        peakShockFL: lap.extras.peakShockFL,
        maxBrakeLinePressTotal: lap.extras.maxBrakeLinePressTotal
      }
    };
    setLaps((prevLaps) => [...prevLaps, lapAgg].slice(-10));
  };
  useLapAggregate(t, handleLapComplete);
  const validLaps = laps.filter((l) => l.isValid);
  const canAsk = validLaps.length >= MIN_LAPS;
  const needed = Math.max(0, MIN_LAPS - validLaps.length);
  const toggleSymptom = (s) => setSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  const ask = async (mode) => {
    if (!canAsk || loading) return;
    setLoading(mode);
    setError(null);
    setFallback(null);
    try {
      const latest = validLaps[validLaps.length - 1];
      const pbS = validLaps.reduce(
        (m, l) => m == null || l.lapTimeS < m ? l.lapTimeS : m,
        null
      );
      const resp = await dispatchAdvisorCall({
        mode,
        track: t.track,
        car: t.car,
        trackType,
        cornerBias,
        symptoms: mode === "setup" && symptoms.length ? symptoms : void 0,
        laps: validLaps.slice(-5).map(
          ({
            tires: _tires,
            brakeBias: _bb,
            diffMap: _dm,
            airTempC: _a,
            trackTempC: _tt,
            liveExtras: _le,
            ...rest
          }) => rest
        ),
        pbS,
        conditions: { airTempC: latest.airTempC, trackTempC: latest.trackTempC },
        setup: { brakeBias: latest.brakeBias, diffMap: latest.diffMap },
        tires: {
          fl: { tempC: latest.tires.fl.tempC, pressureBar: latest.tires.fl.pressureBar },
          fr: { tempC: latest.tires.fr.tempC, pressureBar: latest.tires.fr.pressureBar },
          rl: { tempC: latest.tires.rl.tempC, pressureBar: latest.tires.rl.pressureBar },
          rr: { tempC: latest.tires.rr.tempC, pressureBar: latest.tires.rr.pressureBar }
        },
        // Bridge extras — only included when the bridge sends them (non-zero)
        extrasSnapshot: latest.liveExtras.maxBrakeLinePressTotal > 0 ? latest.liveExtras : void 0
      });
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
  const prioStyles = {
    high: "text-racing-red border-racing-red/40 bg-racing-red/10",
    medium: "text-racing-orange border-racing-orange/40 bg-racing-orange/10",
    low: "text-foreground border-zinc-700 bg-muted/40"
  };
  const segBtn = (active) => `px-2.5 py-1 text-[10px] uppercase tracking-wider rounded ring-1 transition ${active ? "bg-racing-orange/20 text-racing-orange ring-racing-orange/40" : "bg-muted/40 text-muted-foreground ring-white/5 hover:text-foreground"}`;
  return /* @__PURE__ */ jsxs("div", { className: "bg-panel-2 ring-1 ring-white/5 rounded-lg p-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
      /* @__PURE__ */ jsxs("h2", { className: "flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-foreground font-medium", children: [
        /* @__PURE__ */ jsx(Lightbulb, { className: "h-3.5 w-3.5 text-racing-orange" }),
        "Advisor"
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "font-mono text-[10px] text-muted-foreground", children: [
        validLaps.length,
        " valid lap",
        validLaps.length === 1 ? "" : "s",
        !canAsk && ` · ${needed} more to unlock`
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-3 grid gap-2 rounded-md bg-muted/40 ring-1 ring-white/5 p-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wider text-muted-foreground w-16", children: "Track" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsx("button", { className: segBtn(trackType === "road"), onClick: () => setTrackType("road"), children: "Road" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: segBtn(trackType === "oval"),
              onClick: () => {
                setTrackType("oval");
                if (cornerBias === "mixed") setCornerBias("left");
              },
              children: "Oval"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wider text-muted-foreground w-16", children: "Bias" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsx("button", { className: segBtn(cornerBias === "left"), onClick: () => setCornerBias("left"), children: "Left" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: segBtn(cornerBias === "right"),
              onClick: () => setCornerBias("right"),
              children: "Right"
            }
          ),
          trackType === "road" && /* @__PURE__ */ jsx(
            "button",
            {
              className: segBtn(cornerBias === "mixed"),
              onClick: () => setCornerBias("mixed"),
              children: "Mixed"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setWizardOpen((v) => !v),
        className: "mb-2 flex w-full items-center justify-between rounded-md bg-muted/40 ring-1 ring-white/5 px-3 py-2 text-[10px] uppercase tracking-wider text-foreground hover:text-foreground",
        children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "Symptom Wizard",
            " ",
            symptoms.length > 0 && /* @__PURE__ */ jsxs("span", { className: "text-racing-orange", children: [
              "· ",
              symptoms.length,
              " selected"
            ] })
          ] }),
          wizardOpen ? /* @__PURE__ */ jsx(ChevronUp, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "h-3.5 w-3.5" })
        ]
      }
    ),
    wizardOpen && /* @__PURE__ */ jsxs("div", { className: "mb-3 rounded-md bg-muted/40 ring-1 ring-white/5 p-2 space-y-2", children: [
      ["balance", "brakes", "tyres", "ride"].map((group) => /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-[9px] uppercase tracking-widest text-muted-foreground mb-1", children: group }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1", children: SYMPTOM_OPTIONS.filter((s) => s.group === group).map((s) => {
          const active = symptoms.includes(s.id);
          return /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => toggleSymptom(s.id),
              className: `px-2 py-0.5 text-[10px] rounded ring-1 transition ${active ? "bg-racing-cyan/20 text-racing-cyan ring-racing-cyan/40" : "bg-background/50 text-muted-foreground ring-white/5 hover:text-foreground"}`,
              children: s.label
            },
            s.id
          );
        }) })
      ] }, group)),
      symptoms.length > 0 && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setSymptoms([]),
          className: "text-[10px] text-muted-foreground hover:text-foreground underline",
          children: "clear all"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2 mb-3", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => ask("style"),
          disabled: !canAsk || loading !== null,
          className: "flex items-center justify-center gap-2 rounded-md bg-racing-cyan/10 px-3 py-2 text-xs uppercase tracking-wider text-racing-cyan ring-1 ring-racing-cyan/30 hover:bg-racing-cyan/20 disabled:cursor-not-allowed disabled:opacity-40",
          children: [
            loading === "style" ? /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsx(Gauge, { className: "h-3.5 w-3.5" }),
            "Driving Style"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => ask("setup"),
          disabled: !canAsk || loading !== null,
          className: "flex items-center justify-center gap-2 rounded-md bg-racing-orange/10 px-3 py-2 text-xs uppercase tracking-wider text-racing-orange ring-1 ring-racing-orange/30 hover:bg-racing-orange/20 disabled:cursor-not-allowed disabled:opacity-40",
          children: [
            loading === "setup" ? /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsx(Wrench, { className: "h-3.5 w-3.5" }),
            "Car Setup"
          ]
        }
      )
    ] }),
    !canAsk && !result && /* @__PURE__ */ jsxs("div", { className: "rounded-md bg-muted/50 p-3 text-center text-xs text-muted-foreground", children: [
      "Complete ",
      MIN_LAPS,
      " clean laps and I'll read the data to coach style or recommend setup changes."
    ] }),
    error && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 rounded-md border border-racing-red/40 bg-racing-red/10 p-3 text-xs text-racing-red", children: [
      /* @__PURE__ */ jsx(AlertTriangle, { className: "mt-0.5 h-3.5 w-3.5 shrink-0" }),
      /* @__PURE__ */ jsx("span", { children: error })
    ] }),
    result && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-foreground", children: result.headline }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground mt-0.5", children: result.summary }),
        fallback && /* @__PURE__ */ jsx("div", { className: "mt-1 text-[10px] uppercase tracking-wider text-muted-foreground", children: fallback === "no-key" ? "Local analysis (no AI key)" : fallback === "local-llm" ? "Local LLM via device" : "Local analysis (AI fallback)" })
      ] }),
      /* @__PURE__ */ jsx("ul", { className: "space-y-1.5", children: result.tips.map((tip, i) => /* @__PURE__ */ jsxs("li", { className: `rounded-md border px-2.5 py-2 ${prioStyles[tip.priority]}`, children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-0.5", children: [
          /* @__PURE__ */ jsx("span", { className: "font-mono text-[9px] uppercase tracking-widest", children: tip.priority }),
          /* @__PURE__ */ jsx("span", { className: "text-[11px] uppercase tracking-wider opacity-80", children: tip.area })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-foreground", children: tip.tip }),
        /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground mt-1", children: tip.reason }),
        tip.citation && result.mode === "setup" && /* @__PURE__ */ jsxs("div", { className: "mt-1.5 flex items-start gap-1.5 border-t border-white/5 pt-1.5 text-[10px] text-muted-foreground", children: [
          /* @__PURE__ */ jsx(BookOpen, { className: "h-3 w-3 mt-0.5 shrink-0 text-racing-orange/70" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("span", { className: "uppercase tracking-wider text-muted-foreground", children: "Rule:" }),
            " ",
            tip.citation
          ] })
        ] })
      ] }, i)) })
    ] })
  ] });
}
function FingerprintUploadCard() {
  const { user } = useAuth();
  const [fp, setFp] = useState(null);
  useEffect(() => {
    setFp(loadFingerprint());
  }, []);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(
    null
  );
  const inputRef = useRef(null);
  const ingest = useCallback(
    async (files) => {
      if (!files || files.length === 0) return;
      setBusy(true);
      try {
        const { selected, totalScanned } = selectLapfiles(files);
        if (selected.length === 0) {
          toast.error(
            `Scanned ${totalScanned} files but found no .olap/.blap/.plap files. Pick your iRacing 'lapfiles' folder.`
          );
          return;
        }
        setProgress({ done: 0, total: selected.length, failed: 0 });
        const parsedAll = [];
        let failed = 0;
        for (let i = 0; i < selected.length; i++) {
          const s = selected[i];
          try {
            const buf = await s.file.arrayBuffer();
            const parsed = parseRaw({
              path: s.file.name,
              trackFolder: s.trackFolder,
              baseName: s.baseName,
              ext: s.ext,
              buffer: buf
            });
            parsedAll.push({ trackFolder: s.trackFolder, parsed });
          } catch {
            failed++;
          }
          if (i % 16 === 15) await new Promise((r) => setTimeout(r, 0));
          setProgress({ done: i + 1, total: selected.length, failed });
        }
        if (parsedAll.length === 0) {
          toast.error("Found lapfiles but none could be parsed.");
          return;
        }
        const next = buildFingerprint(parsedAll);
        setFp(next);
        saveFingerprint(next);
        toast.success(
          `Fingerprint built from ${parsedAll.length} files across ${next.totalTracks} tracks${failed ? ` (${failed} skipped)` : ""}.`
        );
        if (user) {
          try {
            const pairs = next.pairs.map((p) => ({
              track: p.track,
              car: p.car,
              carClass: classifyCar(p.car),
              bestEverS: p.bestEverS,
              optimalEverS: p.optimalEverS,
              medianBestS: p.medianBestS,
              bestStdevS: p.bestStdevS,
              bestLapSectors: p.bestLapSectors,
              bestPerSector: p.bestPerSector,
              trackLengthM: p.trackLengthM,
              trackLengthKnown: p.trackLengthKnown,
              fileCount: p.fileCount,
              latestBuildDate: p.latestBuildDate,
              earliestBuildDate: p.earliestBuildDate,
              trend: p.trend
            }));
            const r = await upsertFingerprint({ data: { pairs } });
            if (r.ok) toast.success(`Synced ${r.count ?? pairs.length} pairs to your account.`);
            else toast.error(`Sync failed: ${r.error}`);
          } catch (e) {
            toast.error(`Sync failed: ${e instanceof Error ? e.message : "unknown"}`);
          }
        } else {
          toast.message("Sign in to sync your fingerprint and unlock live coaching.");
        }
      } finally {
        setBusy(false);
        setProgress(null);
      }
    },
    [user]
  );
  return /* @__PURE__ */ jsxs("div", { className: "bg-panel-2 ring-1 ring-white/5 rounded-lg p-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(Fingerprint, { className: "h-3.5 w-3.5 text-racing-cyan" }),
      /* @__PURE__ */ jsx("h2", { className: "text-[10px] uppercase tracking-[0.2em] text-foreground font-medium", children: "Driver Fingerprint" }),
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/fingerprint",
          className: "ml-auto text-[10px] font-mono text-racing-cyan hover:underline",
          children: "Full view →"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-muted-foreground mb-3", children: [
      "Upload your",
      " ",
      /* @__PURE__ */ jsx("code", { className: "rounded-sm bg-muted px-1 font-mono text-[10px]", children: "Documents/iRacing/lapfiles" }),
      " ",
      "folder to build a baseline from every reference lap. Parsed locally; only summaries sync."
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          disabled: busy,
          onClick: () => inputRef.current?.click(),
          className: "flex h-9 items-center gap-2 rounded-sm border border-border-strong bg-racing-cyan/15 px-3 font-mono text-[11px] uppercase tracking-wider text-foreground hover:bg-racing-cyan/25 disabled:opacity-50",
          children: [
            /* @__PURE__ */ jsx(FolderUp, { className: "h-3.5 w-3.5" }),
            fp ? "Rebuild from folder" : "Pick lapfiles folder"
          ]
        }
      ),
      fp && /* @__PURE__ */ jsxs("span", { className: "font-mono text-[10px] text-muted-foreground", children: [
        fp.totalTracks,
        " tracks · ",
        fp.totalCars,
        " cars · ",
        fp.pairs.length,
        " pairs"
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          ref: inputRef,
          type: "file",
          multiple: true,
          webkitdirectory: "",
          directory: "",
          className: "hidden",
          onChange: (e) => void ingest(e.target.files)
        }
      )
    ] }),
    progress && /* @__PURE__ */ jsxs("div", { className: "mt-3 font-mono text-[11px] text-muted-foreground", children: [
      "Parsing ",
      progress.done,
      "/",
      progress.total,
      progress.failed > 0 && ` · ${progress.failed} skipped`,
      /* @__PURE__ */ jsx("div", { className: "mt-1 h-1 w-full overflow-hidden rounded-sm bg-muted", children: /* @__PURE__ */ jsx(
        "div",
        {
          className: "h-full bg-racing-cyan transition-[width]",
          style: { width: `${progress.done / progress.total * 100}%` }
        }
      ) })
    ] })
  ] });
}
const TRACES = [
  {
    key: "speed",
    label: "SPEED",
    unit: "km/h",
    yMin: 0,
    yMax: 320,
    colors: ["#22d3ee"],
    fields: ["speed"],
    fmt: (v) => v.toFixed(1)
  },
  {
    key: "rpm",
    label: "RPM",
    unit: "rpm",
    yMin: 0,
    yMax: 12e3,
    colors: ["#e5e5e5"],
    fields: ["rpm"],
    fmt: (v) => Math.round(v).toString()
  },
  {
    key: "inputs",
    label: "THR / BRK",
    unit: "%",
    yMin: 0,
    yMax: 100,
    colors: ["#22c55e", "#ef4444"],
    fields: ["throttle", "brake"],
    scale: [100, 100],
    fmt: (v) => Math.round(v).toString()
  },
  {
    key: "steering",
    label: "STEER",
    unit: "°",
    yMin: -180,
    yMax: 180,
    colors: ["#facc15"],
    fields: ["steering"],
    fmt: (v) => Math.round(v).toString()
  },
  {
    key: "g",
    label: "G LAT / LON",
    unit: "G",
    yMin: -3,
    yMax: 3,
    colors: ["#f97316", "#38bdf8"],
    fields: ["gLat", "gLon"],
    fmt: (v) => v.toFixed(2)
  }
];
const ROW_H = 64;
const LABEL_W = 110;
const VAL_W = 78;
function smoothSeries(values, mode, window2) {
  if (mode === "none" || values.length === 0) return values;
  if (mode === "ma") {
    const n = Math.max(1, Math.floor(window2));
    const out2 = new Array(values.length);
    let sum = 0;
    const q = [];
    for (let i = 0; i < values.length; i++) {
      q.push(values[i]);
      sum += values[i];
      if (q.length > n) sum -= q.shift();
      out2[i] = sum / q.length;
    }
    return out2;
  }
  const alpha = Math.min(1, Math.max(0.02, 1 / Math.max(1, window2)));
  const out = new Array(values.length);
  out[0] = values[0];
  for (let i = 1; i < values.length; i++) {
    out[i] = out[i - 1] + alpha * (values[i] - out[i - 1]);
  }
  return out;
}
function getRawValue(s, field, scale) {
  const v = s[field];
  return scale ? v * scale : v;
}
function TraceStack({
  samples,
  windowMs = 3e4,
  smoothing = "none",
  smoothWindow = 5,
  onCursorChange
}) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const [cursorX, setCursorX] = useState(null);
  const draggingRef = useRef(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);
  const smoothed = useMemo(() => {
    const out = {};
    for (const trace of TRACES) {
      for (let si = 0; si < trace.fields.length; si++) {
        const raw = samples.map((s) => getRawValue(s, trace.fields[si], trace.scale?.[si]));
        out[`${trace.key}:${si}`] = smoothSeries(raw, smoothing, smoothWindow);
      }
    }
    return out;
  }, [samples, smoothing, smoothWindow]);
  const cursorIndex = useMemo(() => {
    if (samples.length === 0) return -1;
    const cssW = dimensions.width;
    const plotW = cssW - LABEL_W - VAL_W;
    if (cursorX == null || plotW <= 0) return samples.length - 1;
    const tEnd = samples[samples.length - 1].t;
    const tStart = tEnd - windowMs;
    const frac = Math.max(0, Math.min(1, (cursorX - LABEL_W) / plotW));
    const tTarget = tStart + frac * windowMs;
    let lo = 0, hi = samples.length - 1;
    while (lo < hi) {
      const mid = lo + hi >> 1;
      if (samples[mid].t < tTarget) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }, [cursorX, samples, windowMs, dimensions.width]);
  useEffect(() => {
    if (!onCursorChange) return;
    if (cursorIndex < 0 || cursorIndex >= samples.length) {
      onCursorChange(null);
      return;
    }
    const s = samples[cursorIndex];
    const sm = {};
    for (const trace of TRACES) {
      for (let si = 0; si < trace.fields.length; si++) {
        const arr = smoothed[`${trace.key}:${si}`];
        sm[`${trace.key}:${si}`] = arr?.[cursorIndex] ?? 0;
      }
    }
    onCursorChange({ sample: s, smoothed: sm });
  }, [cursorIndex, samples, smoothed, onCursorChange]);
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const dpr = window.devicePixelRatio || 1;
    const cssW = dimensions.width || wrap.clientWidth || 600;
    const cssH = dimensions.height || wrap.clientHeight || TRACES.length * ROW_H;
    const rowHeight = cssH / TRACES.length;
    if (canvas.width !== Math.floor(cssW * dpr) || canvas.height !== Math.floor(cssH * dpr)) {
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);
    const plotX = LABEL_W;
    const plotW = cssW - LABEL_W - VAL_W;
    if (plotW <= 0) return;
    const tEnd = samples.length ? samples[samples.length - 1].t : 0;
    const tStart = tEnd - windowMs;
    ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.textBaseline = "middle";
    TRACES.forEach((trace, i) => {
      const y0 = i * rowHeight;
      const y1 = y0 + rowHeight;
      const padY = Math.max(4, rowHeight * 0.1);
      const plotYTop = y0 + padY;
      const plotYBot = y1 - padY;
      const plotH = plotYBot - plotYTop;
      ctx.fillStyle = i % 2 === 0 ? "#0a0a0a" : "#0d0d0d";
      ctx.fillRect(0, y0, cssW, rowHeight);
      ctx.fillStyle = "#171717";
      ctx.fillRect(0, y1 - 1, cssW, 1);
      ctx.fillStyle = "#525252";
      ctx.textAlign = "left";
      ctx.fillText(trace.label, 8, y0 + Math.min(14, rowHeight * 0.25));
      ctx.fillStyle = "#737373";
      ctx.fillText(trace.unit, 8, y1 - Math.min(12, rowHeight * 0.22));
      ctx.strokeStyle = "#1f1f1f";
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (trace.yMin < 0 && trace.yMax > 0) {
        const yMid = plotYTop + plotH * (trace.yMax - 0) / (trace.yMax - trace.yMin);
        ctx.moveTo(plotX, Math.round(yMid) + 0.5);
        ctx.lineTo(plotX + plotW, Math.round(yMid) + 0.5);
      }
      ctx.moveTo(plotX, plotYTop + 0.5);
      ctx.lineTo(plotX + plotW, plotYTop + 0.5);
      ctx.moveTo(plotX, plotYBot - 0.5);
      ctx.lineTo(plotX + plotW, plotYBot - 0.5);
      ctx.stroke();
      const valToY = (v) => {
        const f = (trace.yMax - v) / (trace.yMax - trace.yMin);
        return plotYTop + Math.max(0, Math.min(1, f)) * plotH;
      };
      const tToX = (t) => plotX + (t - tStart) / windowMs * plotW;
      for (let si = 0; si < trace.fields.length; si++) {
        const series = smoothed[`${trace.key}:${si}`];
        if (!series) continue;
        ctx.strokeStyle = trace.colors[si];
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        let started = false;
        for (let k = 0; k < samples.length; k++) {
          if (samples[k].t < tStart) continue;
          const x = tToX(samples[k].t);
          const y = valToY(series[k]);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
      const idx = cursorIndex >= 0 && cursorIndex < samples.length ? cursorIndex : samples.length - 1;
      if (idx >= 0) {
        ctx.textAlign = "right";
        for (let si = 0; si < trace.fields.length; si++) {
          const v = smoothed[`${trace.key}:${si}`]?.[idx] ?? 0;
          ctx.fillStyle = trace.colors[si];
          ctx.fillText((trace.fmt ?? ((x) => x.toFixed(2)))(v), cssW - 8, y0 + Math.min(16, rowHeight * 0.28) + si * 14);
        }
        ctx.textAlign = "left";
      }
    });
    ctx.strokeStyle = "#262626";
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(plotX + plotW + 0.5, 0);
    ctx.lineTo(plotX + plotW + 0.5, cssH);
    ctx.stroke();
    ctx.setLineDash([]);
    if (cursorX != null && cursorX >= plotX && cursorX <= plotX + plotW) {
      ctx.strokeStyle = "#eab308";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.round(cursorX) + 0.5, 0);
      ctx.lineTo(Math.round(cursorX) + 0.5, cssH);
      ctx.stroke();
      if (cursorIndex >= 0 && cursorIndex < samples.length) {
        const dtFromEnd = (samples[samples.length - 1].t - samples[cursorIndex].t) / 1e3;
        const label = `-${dtFromEnd.toFixed(2)}s`;
        ctx.fillStyle = "#eab308";
        ctx.font = "10px ui-monospace, monospace";
        ctx.textBaseline = "top";
        const tw = ctx.measureText(label).width + 8;
        const lx = Math.min(plotX + plotW - tw, Math.max(plotX, cursorX - tw / 2));
        ctx.fillRect(lx, 0, tw, 14);
        ctx.fillStyle = "#0a0a0a";
        ctx.textAlign = "center";
        ctx.fillText(label, lx + tw / 2, 2);
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
      }
    }
  }, [samples, windowMs, smoothed, cursorX, cursorIndex, dimensions]);
  const handlePointer = (e) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setCursorX(x);
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: wrapRef,
      className: "relative w-full h-full overflow-hidden rounded-sm border border-border bg-background touch-none",
      style: { cursor: cursorX != null ? "ew-resize" : "crosshair" },
      onPointerDown: (e) => {
        e.target.setPointerCapture(e.pointerId);
        draggingRef.current = true;
        handlePointer(e);
      },
      onPointerMove: (e) => {
        if (draggingRef.current) handlePointer(e);
      },
      onPointerUp: (e) => {
        draggingRef.current = false;
        e.target.releasePointerCapture?.(e.pointerId);
      },
      onPointerCancel: () => {
        draggingRef.current = false;
      },
      onDoubleClick: () => setCursorX(null),
      title: "Drag to scrub · Double-click to release cursor",
      children: [
        /* @__PURE__ */ jsx("canvas", { ref: canvasRef, className: "block" }),
        cursorX != null && /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: (e) => {
              e.stopPropagation();
              setCursorX(null);
            },
            className: "absolute right-1 top-1 rounded-sm bg-muted/90 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-amber-400 hover:bg-accent",
            children: "Live"
          }
        )
      ]
    }
  );
}
function GGScatter({ samples }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const dpr = window.devicePixelRatio || 1;
    const parent = wrap.parentElement;
    const cssW = wrap.clientWidth;
    const parentH = parent ? parent.clientHeight : 0;
    const cssH = parentH > 0 ? parentH : cssW;
    const size = Math.max(120, Math.min(cssW, cssH, 550) - 16);
    if (canvas.width !== Math.floor(size * dpr) || canvas.height !== Math.floor(size * dpr)) {
      canvas.width = Math.floor(size * dpr);
      canvas.height = Math.floor(size * dpr);
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, size, size);
    const cx = size / 2;
    const cy = size / 2;
    const maxG = 3;
    const scale = (size / 2 - 16) / maxG;
    ctx.strokeStyle = "#1f1f1f";
    ctx.lineWidth = 1;
    for (let g = 1; g <= maxG; g++) {
      ctx.beginPath();
      ctx.arc(cx, cy, g * scale, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, size);
    ctx.moveTo(0, cy);
    ctx.lineTo(size, cy);
    ctx.stroke();
    ctx.fillStyle = "#525252";
    ctx.font = "9px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.textBaseline = "middle";
    for (let g = 1; g <= maxG; g++) {
      ctx.fillText(`${g}G`, cx + g * scale - 14, cy - 6);
    }
    const n = samples.length;
    for (let i = 0; i < n; i++) {
      const s = samples[i];
      const age = (n - i) / n;
      const x = cx + s.gLat * scale;
      const y = cy - s.gLon * scale;
      const a = 0.15 + 0.65 * (1 - age);
      ctx.fillStyle = `rgba(34, 211, 238, ${a.toFixed(3)})`;
      ctx.fillRect(x - 1, y - 1, 2, 2);
    }
    const last = samples[samples.length - 1];
    if (last) {
      const x = cx + last.gLat * scale;
      const y = cy - last.gLon * scale;
      ctx.fillStyle = "#22d3ee";
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#737373";
    ctx.fillText("ACCEL", cx + 4, 10);
    ctx.fillText("BRAKE", cx + 4, size - 10);
    ctx.textAlign = "right";
    ctx.fillText("LEFT", size - 6, cy + 12);
    ctx.textAlign = "left";
    ctx.fillText("RIGHT", 6, cy + 12);
  }, [samples]);
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: wrapRef,
      className: "w-full h-full flex items-center justify-center p-2 bg-background/30",
      children: /* @__PURE__ */ jsx("canvas", { ref: canvasRef, className: "block rounded border border-border/80 shadow-md bg-[#0a0a0a]" })
    }
  );
}
function telemetryToMathContext(t) {
  const out = {};
  const push = (key, value) => {
    if (typeof value === "number" && Number.isFinite(value)) out[key] = value;
    else if (typeof value === "boolean") out[key] = value ? 1 : 0;
  };
  for (const [k, v] of Object.entries(t)) {
    if (k === "tires" || k === "sectors" || k === "extras") continue;
    push(k, v);
  }
  for (const [k, v] of Object.entries(t.sectors)) push(`sectors.${k}`, v);
  for (const [corner, vals] of Object.entries(t.tires)) {
    for (const [k, v] of Object.entries(vals)) push(`tires.${corner}.${k}`, v);
  }
  for (const [k, v] of Object.entries(t.extras ?? {})) push(`extras.${k}`, v);
  out["const.PI"] = Math.PI;
  out["const.E"] = Math.E;
  out["const.kph_to_mph"] = 0.621371192;
  out["const.kph_to_mps"] = 0.277777778;
  out["const.mps_to_kph"] = 3.6;
  out["const.mps_to_mph"] = 2.23693629;
  out["const.bar_to_psi"] = 14.50377377;
  out["const.bar_to_kpa"] = 100;
  out["const.kpa_to_psi"] = 0.145037738;
  out["const.psi_to_bar"] = 0.068947573;
  out["const.c_to_f_gain"] = 1.8;
  out["const.c_to_f_offset"] = 32;
  out["const.g_to_mps2"] = 9.80665;
  out["const.mps2_to_g"] = 0.101971621;
  out["const.nm_to_lbfft"] = 0.737562149;
  out["const.kg_to_lb"] = 2.204622622;
  out["const.rpm_to_rads"] = 0.104719755;
  out["const.rads_to_rpm"] = 9.549296586;
  out["const.rpm_to_degs"] = 6;
  out["const.litre_to_gal"] = 0.219969248;
  out["const.litre_to_usgal"] = 0.264172052;
  out["const.rad_to_deg"] = 57.295779513;
  out["const.deg_to_rad"] = 0.0174532925;
  return out;
}
function CommunityBrowser({
  open,
  title,
  loader,
  onImport,
  onVote,
  onClose
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    loader().then(setRows).finally(() => setLoading(false));
  }, [open, loader]);
  if (!open) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-xl rounded-t-sm border border-zinc-800 bg-zinc-950 sm:rounded-sm", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-zinc-900 px-3 py-2", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-[0.18em] text-zinc-400", children: title }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          className: "rounded-sm bg-zinc-900 px-2 py-0.5 text-[10px] uppercase text-zinc-400 hover:text-zinc-100",
          children: "Close"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "max-h-[60vh] overflow-y-auto divide-y divide-zinc-900", children: [
      loading && /* @__PURE__ */ jsx("div", { className: "p-4 text-center text-[10px] text-zinc-500", children: "Loading…" }),
      !loading && rows.length === 0 && /* @__PURE__ */ jsx("div", { className: "p-4 text-center text-[10px] text-zinc-500", children: "No community entries yet. Be the first to publish." }),
      rows.map((r) => /* @__PURE__ */ jsx(Row, { row: r, onImport, onVote }, r.id))
    ] })
  ] }) });
}
function Row({
  row,
  onImport,
  onVote
}) {
  const [votes, setVotes] = useState(row.votes);
  const [busy, setBusy] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-3 py-2 text-[11px]", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        disabled: busy,
        onClick: async () => {
          setBusy(true);
          const r = await onVote(row);
          setVotes(r.votes);
          setBusy(false);
        },
        className: "flex flex-col items-center rounded-sm bg-zinc-900 px-2 py-1 text-zinc-300 hover:bg-zinc-800 disabled:opacity-50",
        children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px]", children: "▲" }),
          /* @__PURE__ */ jsx("span", { className: "tabular-nums text-[10px]", children: votes })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsx("div", { className: "truncate text-zinc-200", children: row.title }),
      row.subtitle && /* @__PURE__ */ jsx("div", { className: "truncate text-[10px] text-zinc-500", children: row.subtitle })
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => onImport(row),
        className: "rounded-sm bg-emerald-500/20 px-2 py-1 text-[10px] uppercase text-emerald-300 hover:bg-emerald-500/30",
        children: "Import"
      }
    )
  ] });
}
const MATH_PRESETS = [
  {
    name: "Brake-Throttle Overlap",
    key: "brake_throttle_overlap",
    expression: "min(brake,throttle)*100",
    unit: "%",
    precision: 1,
    color: "#f97316"
  },
  {
    name: "Steering Smoothness",
    key: "steering_smoothness",
    expression: "abs(steeringDeg)/max(speedKph,1)",
    unit: "deg/kmh",
    precision: 3,
    color: "#22d3ee"
  },
  {
    name: "Tyre Temp Spread Front",
    key: "tyre_temp_spread_front",
    expression: "abs(tires.fl.tempC-tires.fr.tempC)",
    unit: "C",
    precision: 1,
    color: "#fb923c"
  },
  {
    name: "Tyre Temp Spread Rear",
    key: "tyre_temp_spread_rear",
    expression: "abs(tires.rl.tempC-tires.rr.tempC)",
    unit: "C",
    precision: 1,
    color: "#f59e0b"
  },
  {
    name: "Tyre Press Spread Front",
    key: "tyre_press_spread_front",
    expression: "abs(tires.fl.pressureBar-tires.fr.pressureBar)",
    unit: "bar",
    precision: 3,
    color: "#a78bfa"
  },
  {
    name: "Tyre Press Spread Rear",
    key: "tyre_press_spread_rear",
    expression: "abs(tires.rl.pressureBar-tires.rr.pressureBar)",
    unit: "bar",
    precision: 3,
    color: "#8b5cf6"
  },
  {
    name: "Fuel Burn Proxy",
    key: "fuel_burn_proxy",
    expression: "max(0,100-lapsEstimated)",
    unit: "",
    precision: 2,
    color: "#34d399"
  }
];
function ConfigurableChannelList({ t }) {
  const baseRegistry = useMemo(() => buildRegistry(t), [t]);
  const [mathExpressions, setMathExpressions] = useState([]);
  const { elevenLabsApiKey, elevenLabsVoiceId } = useWorkbench();
  const lastAlertTimes = useRef({});
  const enabledMathExpressions = useMemo(
    () => mathExpressions.filter((m) => m.enabled && (m.scope === "live" || m.scope === "both")),
    [mathExpressions]
  );
  const compiledMath = useMemo(
    () => enabledMathExpressions.map((m) => {
      const compiled = compileMathExpression(m.expression);
      return { expression: m, compiled };
    }),
    [enabledMathExpressions]
  );
  const mathValues = useMemo(() => {
    const ctx = telemetryToMathContext(t);
    const out = {};
    for (const item of compiledMath) {
      if (!item.compiled.ok) continue;
      const value = evaluateCompiledMathExpression(item.compiled.compiled, ctx);
      if (value.ok) out[item.expression.id] = value.value;
    }
    return out;
  }, [compiledMath, t]);
  useEffect(() => {
    for (const item of compiledMath) {
      const m = item.expression;
      if (!m.speechAlertEnabled || !m.speechAlertText) continue;
      const val = mathValues[m.id];
      const threshold = m.speechAlertThreshold ?? 0.5;
      if (Number.isFinite(val) && val > threshold) {
        const now = Date.now();
        const lastTime = lastAlertTimes.current[m.id] || 0;
        const cooldown = (m.speechAlertDebounceS ?? 15) * 1e3;
        if (now - lastTime > cooldown) {
          lastAlertTimes.current[m.id] = now;
          speakText({
            data: {
              text: m.speechAlertText,
              apiKey: elevenLabsApiKey,
              voiceId: elevenLabsVoiceId
            }
          }).then((resp) => {
            if (resp && resp.audioBase64) {
              const audio = new Audio(
                `data:${resp.mime ?? "audio/mpeg"};base64,${resp.audioBase64}`
              );
              audio.play().catch(() => {
              });
            }
          }).catch(() => {
          });
        }
      }
    }
  }, [mathValues, compiledMath, elevenLabsApiKey, elevenLabsVoiceId]);
  const mathRegistry = useMemo(() => {
    const seen = /* @__PURE__ */ new Set();
    return enabledMathExpressions.map((m, i) => {
      const dedupe = seen.has(m.key);
      seen.add(m.key);
      const channelKey = dedupe ? `math.${m.key}_${i + 1}` : `math.${m.key}`;
      return {
        key: channelKey,
        label: m.name.toUpperCase(),
        unit: m.unit ?? "",
        color: m.color ?? "#22d3ee",
        group: "Extras",
        read: () => {
          const v = mathValues[m.id];
          if (!Number.isFinite(v)) return "—";
          const p = Math.max(0, Math.min(6, m.precision ?? 2));
          return v.toFixed(p);
        }
      };
    });
  }, [enabledMathExpressions, mathValues]);
  const mathNumericByChannelKey = useMemo(() => {
    const seen = /* @__PURE__ */ new Set();
    const out = {};
    for (let i = 0; i < enabledMathExpressions.length; i += 1) {
      const m = enabledMathExpressions[i];
      const dedupe = seen.has(m.key);
      seen.add(m.key);
      const channelKey = dedupe ? `math.${m.key}_${i + 1}` : `math.${m.key}`;
      const v = mathValues[m.id];
      if (Number.isFinite(v)) out[channelKey] = v;
    }
    return out;
  }, [enabledMathExpressions, mathValues]);
  const registry = useMemo(() => [...baseRegistry, ...mathRegistry], [baseRegistry, mathRegistry]);
  const byKey = useMemo(() => new Map(registry.map((c) => [c.key, c])), [registry]);
  const [visibleKeys, setVisibleKeys] = useState(DEFAULT_CHANNEL_KEYS);
  const [editing, setEditing] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [modeByKey, setModeByKey] = useState({});
  const [publishing, setPublishing] = useState(false);
  const historyRef = useRef({});
  const { session } = useAuth();
  const upsertCloud = useServerFn(upsertMyChannelLayout);
  const publishCloud = useServerFn(publishMyChannelLayout);
  const listCloud = useServerFn(listCommunityChannelLayouts);
  const voteCloud = useServerFn(voteCommunityItem);
  useEffect(() => {
    const prefs = loadChannelPrefs();
    setVisibleKeys(prefs.visible);
    setModeByKey(prefs.modeByKey ?? {});
    setMathExpressions(
      (prefs.mathExpressions ?? []).filter((m) => MathExpressionSchema.safeParse(m).success)
    );
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    saveChannelPrefs({ visible: visibleKeys, modeByKey, mathExpressions });
    if (!session) return;
    const id = setTimeout(() => {
      upsertCloud({
        data: { name: "default", layout: { visible: visibleKeys, modeByKey, mathExpressions } }
      }).catch(() => {
      });
    }, 1500);
    return () => clearTimeout(id);
  }, [visibleKeys, modeByKey, mathExpressions, hydrated, upsertCloud, session]);
  const publish = async () => {
    if (!session) {
      toast.error("Sign in to publish your workspace.");
      return;
    }
    setPublishing(true);
    try {
      await upsertCloud({
        data: { name: "default", layout: { visible: visibleKeys, modeByKey, mathExpressions } }
      });
      const out = await publishCloud({ data: { name: "default", published: true } });
      if ("ok" in out && out.ok) toast.success("Workspace published to community.");
      else toast.error("Publish failed.");
    } catch (e) {
      toast.error(e?.message ?? "Publish failed.");
    } finally {
      setPublishing(false);
    }
  };
  const onImport = (row) => {
    const layout = row.payload;
    if (!Array.isArray(layout?.visible)) return;
    setVisibleKeys(layout.visible);
    setModeByKey(layout.modeByKey ?? {});
    setMathExpressions(
      (layout.mathExpressions ?? []).filter((m) => MathExpressionSchema.safeParse(m).success)
    );
    setBrowseOpen(false);
    toast.success(`Imported layout with ${layout.visible.length} channels.`);
  };
  const loadRows = useCallback(async () => {
    const out = await listCloud();
    return (out.rows || []).map((r) => ({
      id: r.id,
      user_id: r.user_id,
      votes: r.votes,
      title: r.name,
      subtitle: `${r.layout?.visible?.length ?? 0} channels · ${new Date(r.updated_at).toLocaleDateString()}`,
      payload: r.layout
    }));
  }, [listCloud]);
  const onVote = async (row) => {
    const out = await voteCloud({ data: { target_id: row.id, kind: "channel_layout" } });
    return { votes: out.votes };
  };
  const visibleChannels = visibleKeys.map((k) => byKey.get(k)).filter((c) => Boolean(c));
  const toggleMode = useCallback((key) => {
    setModeByKey((m) => ({ ...m, [key]: m[key] === "trace" ? "raw" : "trace" }));
  }, []);
  useEffect(() => {
    const next = {};
    for (const c of visibleChannels) {
      const key = c.key;
      const prev = historyRef.current[key] ?? [];
      const n = getNumericValue(t, key, mathNumericByChannelKey);
      next[key] = Number.isFinite(n) ? [...prev.slice(-719), n] : prev.slice(-719);
    }
    historyRef.current = next;
  }, [t, visibleChannels, mathNumericByChannelKey]);
  return /* @__PURE__ */ jsxs("div", { className: "rounded-sm border border-border bg-background", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border px-2 py-1.5", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-[0.18em] text-muted-foreground", children: "Channels" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-[9px] tabular-nums text-muted-foreground", children: [
          visibleChannels.length,
          "/",
          registry.length
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setBrowseOpen(true),
            className: "rounded-sm bg-muted px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-foreground hover:bg-accent",
            title: "Browse community channel layouts",
            children: "browse"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: publish,
            disabled: !session || publishing,
            className: "rounded-sm bg-emerald-500/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/30",
            title: session ? "Publish your channel layout to the community" : "Sign in to publish workspace",
            children: publishing ? "publishing..." : "publish workspace"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setEditing((v) => !v),
            className: `rounded-sm px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${editing ? "bg-amber-500/20 text-amber-300" : "bg-muted text-muted-foreground hover:text-foreground"}`,
            children: editing ? "Done" : "Edit"
          }
        )
      ] })
    ] }),
    !editing ? /* @__PURE__ */ jsxs("ul", { className: "divide-y divide-border", children: [
      visibleChannels.map((c) => {
        const isTrace = modeByKey[c.key] === "trace";
        return /* @__PURE__ */ jsxs(
          "li",
          {
            className: "flex items-center gap-2 px-2 py-1 text-[11px] cursor-pointer hover:bg-muted/60 transition-colors group",
            onClick: () => {
              toggleMode(c.key);
              window.dispatchEvent(new CustomEvent("pitwall-contextual-channel", { detail: { channel: c.key } }));
            },
            title: `Click to switch to ${isTrace ? "RAW" : "TRACE"} view`,
            children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: "size-1.5 rounded-full ring-1 ring-transparent group-hover:ring-current transition-all",
                  style: { background: c.color, color: c.color }
                }
              ),
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: "w-24 truncate text-muted-foreground group-hover:text-muted-foreground transition-colors",
                  title: c.key,
                  children: c.label
                }
              ),
              isTrace ? /* @__PURE__ */ jsxs("span", { className: "flex-1 mx-2 flex items-center gap-1.5 min-w-0", children: [
                /* @__PURE__ */ jsx("div", { className: "flex-1 h-5 overflow-hidden", children: /* @__PURE__ */ jsx(MiniTrace, { values: historyRef.current[c.key] ?? [], color: c.color }) }),
                /* @__PURE__ */ jsx("span", { className: "text-[7px] uppercase tracking-wider text-[#7A828C] opacity-0 group-hover:opacity-100 transition-opacity select-none flex-shrink-0", children: "trc" })
              ] }) : /* @__PURE__ */ jsxs("span", { className: "ml-auto flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx("span", { className: "truncate tabular-nums text-foreground", children: c.read(t) }),
                /* @__PURE__ */ jsx("span", { className: "text-[7px] uppercase tracking-wider text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity select-none", children: "raw" })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "w-8 text-right text-[9px] text-muted-foreground", children: c.unit })
            ]
          },
          c.key
        );
      }),
      visibleChannels.length === 0 && /* @__PURE__ */ jsx("li", { className: "px-2 py-3 text-center text-[10px] text-muted-foreground", children: "No channels selected · tap Edit" })
    ] }) : /* @__PURE__ */ jsx(
      EditPanel,
      {
        registry,
        visibleKeys,
        modeByKey,
        mathExpressions,
        onChange: setVisibleKeys,
        onSetMode: (key, mode) => setModeByKey((m) => ({ ...m, [key]: mode })),
        onSetMathExpressions: setMathExpressions
      }
    ),
    /* @__PURE__ */ jsx(
      CommunityBrowser,
      {
        open: browseOpen,
        title: "Community Channel Layouts",
        loader: loadRows,
        onImport,
        onVote,
        onClose: () => setBrowseOpen(false)
      }
    )
  ] });
}
function EditPanel({
  registry,
  visibleKeys,
  modeByKey,
  mathExpressions,
  onChange,
  onSetMode,
  onSetMathExpressions
}) {
  const visibleSet = new Set(visibleKeys);
  const groups = useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const c of registry) {
      const arr = map.get(c.group) ?? [];
      arr.push(c);
      map.set(c.group, arr);
    }
    return Array.from(map.entries());
  }, [registry]);
  const toggle = (key) => {
    if (visibleSet.has(key)) onChange(visibleKeys.filter((k) => k !== key));
    else onChange([...visibleKeys, key]);
  };
  const move = (key, dir) => {
    const i = visibleKeys.indexOf(key);
    if (i < 0) return;
    const j = i + dir;
    if (j < 0 || j >= visibleKeys.length) return;
    const next = visibleKeys.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const addExpression = () => {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`;
    onSetMathExpressions([
      ...mathExpressions,
      {
        id,
        name: `Derived ${mathExpressions.length + 1}`,
        key: `derived_${mathExpressions.length + 1}`,
        expression: "speedKph",
        unit: "",
        precision: 2,
        color: "#22d3ee",
        enabled: true,
        scope: "both",
        speechAlertEnabled: false,
        speechAlertThreshold: 0.5,
        speechAlertText: "",
        speechAlertDebounceS: 15,
        created_at: now,
        updated_at: now
      }
    ]);
  };
  const addPresets = () => {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const existing = new Set(mathExpressions.map((m) => m.key));
    const additions = MATH_PRESETS.filter((p) => !existing.has(p.key)).map((p) => ({
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${p.key}`,
      name: p.name,
      key: p.key,
      expression: p.expression,
      unit: p.unit ?? "",
      precision: p.precision ?? 2,
      color: p.color ?? "#22d3ee",
      enabled: true,
      scope: "both",
      speechAlertEnabled: false,
      speechAlertThreshold: 0.5,
      speechAlertText: "",
      speechAlertDebounceS: 15,
      created_at: now,
      updated_at: now
    }));
    if (additions.length === 0) {
      toast.message("Math presets already installed.");
      return;
    }
    onSetMathExpressions([...mathExpressions, ...additions]);
    onChange([...visibleKeys, ...additions.map((m) => `math.${m.key}`)]);
    toast.success(`Added ${additions.length} math presets.`);
  };
  const updateExpression = (id, patch) => {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    onSetMathExpressions(
      mathExpressions.map((m) => m.id === id ? { ...m, ...patch, updated_at: now } : m)
    );
  };
  const removeExpression = (id) => {
    const target = mathExpressions.find((m) => m.id === id);
    onSetMathExpressions(mathExpressions.filter((m) => m.id !== id));
    if (!target) return;
    onChange(
      visibleKeys.filter((k) => k !== `math.${target.key}` && !k.startsWith(`math.${target.key}_`))
    );
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-h-[480px] overflow-y-auto", children: [
    /* @__PURE__ */ jsx("div", { className: "border-b border-border px-2 py-1.5 text-[9px] uppercase tracking-wider text-muted-foreground", children: "Active order" }),
    /* @__PURE__ */ jsx("ul", { className: "divide-y divide-border", children: visibleKeys.map((key, idx) => {
      const c = registry.find((r) => r.key === key);
      if (!c) return null;
      return /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-1 px-2 py-1 text-[11px]", children: [
        /* @__PURE__ */ jsx("span", { className: "size-1.5 rounded-full", style: { background: c.color } }),
        /* @__PURE__ */ jsx("span", { className: "w-24 truncate text-foreground", children: c.label }),
        /* @__PURE__ */ jsxs("span", { className: "ml-auto flex items-center gap-0.5", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => move(key, -1),
              disabled: idx === 0,
              className: "rounded-sm bg-muted px-1 py-0.5 text-muted-foreground disabled:opacity-30 hover:text-foreground",
              "aria-label": "Move up",
              children: "↑"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => move(key, 1),
              disabled: idx === visibleKeys.length - 1,
              className: "rounded-sm bg-muted px-1 py-0.5 text-muted-foreground disabled:opacity-30 hover:text-foreground",
              "aria-label": "Move down",
              children: "↓"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => toggle(key),
              className: "rounded-sm bg-rose-500/20 px-1.5 py-0.5 text-rose-300 hover:bg-rose-500/30",
              "aria-label": "Remove",
              children: "×"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => onSetMode(key, modeByKey[key] === "trace" ? "raw" : "trace"),
              className: "rounded-sm bg-cyan-500/20 px-1.5 py-0.5 text-cyan-300 hover:bg-cyan-500/30",
              "aria-label": "Toggle display mode",
              title: "Toggle RAW / Trace",
              children: modeByKey[key] === "trace" ? "Trace" : "Raw"
            }
          )
        ] })
      ] }, key);
    }) }),
    groups.map(([group, items]) => {
      const inactive = items.filter((c) => !visibleSet.has(c.key));
      if (inactive.length === 0) return null;
      return /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "border-y border-border bg-muted/30 px-2 py-1 text-[9px] uppercase tracking-wider text-muted-foreground", children: group }),
        /* @__PURE__ */ jsx("ul", { className: "divide-y divide-border", children: inactive.map((c) => /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2 px-2 py-1 text-[11px]", children: [
          /* @__PURE__ */ jsx(
            "span",
            {
              className: "size-1.5 rounded-full opacity-60",
              style: { background: c.color }
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "truncate text-muted-foreground", title: c.key, children: c.label }),
          /* @__PURE__ */ jsx("span", { className: "ml-auto text-[9px] text-muted-foreground", children: c.unit }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => toggle(c.key),
              className: "rounded-sm bg-emerald-500/20 px-1.5 py-0.5 text-[9px] uppercase text-emerald-300 hover:bg-emerald-500/30",
              children: "Add"
            }
          )
        ] }, c.key)) })
      ] }, group);
    }),
    /* @__PURE__ */ jsx("div", { className: "border-y border-border bg-muted/30 px-2 py-1 text-[9px] uppercase tracking-wider text-muted-foreground", children: "Math" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2 px-2 py-2", children: [
      mathExpressions.map((m) => {
        const syntax = validateMathExpressionSyntax(m.expression);
        const compiled = compileMathExpression(m.expression);
        const valid = syntax.ok && compiled.ok;
        return /* @__PURE__ */ jsxs("div", { className: "rounded-sm border border-border bg-background p-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: m.enabled,
                onChange: (e) => updateExpression(m.id, { enabled: e.target.checked })
              }
            ),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: m.name,
                onChange: (e) => updateExpression(m.id, { name: e.target.value }),
                className: "min-w-0 flex-1 rounded-sm border border-border-strong bg-muted px-1.5 py-1 text-[11px] text-foreground",
                placeholder: "Name"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => removeExpression(m.id),
                className: "rounded-sm bg-rose-500/20 px-1.5 py-0.5 text-[10px] text-rose-300 hover:bg-rose-500/30",
                children: "Remove"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-1", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                value: m.key,
                onChange: (e) => updateExpression(m.id, { key: e.target.value }),
                className: "rounded-sm border border-border-strong bg-muted px-1.5 py-1 text-[10px] text-foreground",
                placeholder: "key (snake_case)"
              }
            ),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: m.unit ?? "",
                onChange: (e) => updateExpression(m.id, { unit: e.target.value }),
                className: "rounded-sm border border-border-strong bg-muted px-1.5 py-1 text-[10px] text-foreground",
                placeholder: "unit"
              }
            ),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: m.expression,
                onChange: (e) => updateExpression(m.id, { expression: e.target.value }),
                className: "col-span-2 rounded-sm border border-border-strong bg-muted px-1.5 py-1 text-[10px] text-foreground",
                placeholder: "expression"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-2 border-t border-border pt-2 space-y-2", children: [
            /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-1.5 cursor-pointer", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  checked: m.speechAlertEnabled ?? false,
                  onChange: (e) => updateExpression(m.id, { speechAlertEnabled: e.target.checked }),
                  className: "accent-cyan-500 h-3.5 w-3.5"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "font-mono text-[9px] uppercase tracking-wider text-muted-foreground", children: "Vocal Alert Enable" })
            ] }),
            (m.speechAlertEnabled ?? false) && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-1 bg-muted/20 p-1.5 rounded-sm border border-border/50", children: [
              /* @__PURE__ */ jsxs("div", { className: "col-span-2 space-y-1", children: [
                /* @__PURE__ */ jsx("span", { className: "font-mono text-[8px] uppercase tracking-wider text-muted-foreground", children: "Alert Speech Text" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    value: m.speechAlertText ?? "",
                    onChange: (e) => updateExpression(m.id, { speechAlertText: e.target.value }),
                    className: "w-full rounded-sm border border-border-strong bg-muted px-1.5 py-1 text-[10px] text-foreground",
                    placeholder: "e.g. Stop overlapping brake and throttle!"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsx("span", { className: "font-mono text-[8px] uppercase tracking-wider text-muted-foreground", children: "Trigger Threshold" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "number",
                    step: "any",
                    value: m.speechAlertThreshold ?? "",
                    onChange: (e) => updateExpression(m.id, {
                      speechAlertThreshold: e.target.value === "" ? void 0 : parseFloat(e.target.value)
                    }),
                    className: "w-full rounded-sm border border-border-strong bg-muted px-1.5 py-1 text-[10px] text-foreground",
                    placeholder: "e.g. 1.2"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsx("span", { className: "font-mono text-[8px] uppercase tracking-wider text-muted-foreground", children: "Cooldown (sec)" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "number",
                    min: "1",
                    max: "3600",
                    value: m.speechAlertDebounceS ?? "",
                    onChange: (e) => updateExpression(m.id, {
                      speechAlertDebounceS: e.target.value === "" ? void 0 : parseInt(e.target.value, 10)
                    }),
                    className: "w-full rounded-sm border border-border-strong bg-muted px-1.5 py-1 text-[10px] text-foreground",
                    placeholder: "e.g. 15"
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-1 text-[9px] text-muted-foreground", children: valid ? "Valid expression." : syntax.error ?? (!compiled.ok ? compiled.error : "Invalid expression.") })
        ] }, m.id);
      }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: addExpression,
          className: "rounded-sm bg-cyan-500/20 px-2 py-1 text-[9px] uppercase tracking-wider text-cyan-300 hover:bg-cyan-500/30",
          children: "Add derived channel"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: addPresets,
          className: "ml-2 rounded-sm bg-emerald-500/20 px-2 py-1 text-[9px] uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/30",
          children: "Install presets"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 border-t border-border px-2 py-2 text-[9px] uppercase tracking-wider", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => onChange(DEFAULT_CHANNEL_KEYS),
          className: "rounded-sm bg-muted px-2 py-1 text-muted-foreground hover:text-foreground",
          children: "Reset defaults"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => onChange([]),
          className: "rounded-sm bg-muted px-2 py-1 text-muted-foreground hover:text-foreground",
          children: "Clear all"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => onChange(registry.map((c) => c.key)),
          className: "rounded-sm bg-muted px-2 py-1 text-muted-foreground hover:text-foreground",
          children: "Add all"
        }
      )
    ] })
  ] });
}
function getNumericValue(t, key, mathValues) {
  if (key.startsWith("math.")) {
    return typeof mathValues[key] === "number" ? mathValues[key] : Number.NaN;
  }
  if (key.startsWith("extras.")) {
    const v = t.extras?.[key.slice(7)];
    return typeof v === "number" ? v : Number.NaN;
  }
  const parts = key.split(".");
  let cur = t;
  for (const p of parts) cur = cur?.[p];
  return typeof cur === "number" ? cur : Number.NaN;
}
const STORAGE_KEY = "pitwall.gearratios.v1";
const MIN_SPEED_KPH = 30;
const MIN_RPM = 1500;
const ALPHA = 0.05;
function loadCache() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}
function saveCache(c) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  } catch {
  }
}
function GearAdvisor({ t, samples }) {
  const carKey = t.car || "unknown";
  const cacheRef = useRef({});
  const ratiosRef = useRef({});
  const [browseOpen, setBrowseOpen] = useState(false);
  const [, force] = useState(0);
  const { session } = useAuth();
  const upsertCloud = useServerFn(upsertMyGearRatios);
  const publishCloud = useServerFn(publishMyGearRatios);
  const listCloud = useServerFn(listCommunityGearRatios);
  const voteCloud = useServerFn(voteCommunityItem);
  useEffect(() => {
    cacheRef.current = loadCache();
    ratiosRef.current = cacheRef.current[carKey] || {};
  }, [carKey]);
  const lastSyncRef = useRef(0);
  const syncToCloud = useCallback(() => {
    if (!session) return;
    if (carKey === "unknown") return;
    if (Object.keys(ratiosRef.current).length === 0) return;
    const now = Date.now();
    if (now - lastSyncRef.current < 15e3) return;
    lastSyncRef.current = now;
    const ratios = {};
    for (const [g, v] of Object.entries(ratiosRef.current))
      ratios[g] = { ratio: v.ratio, samples: v.samples };
    upsertCloud({ data: { car: carKey, ratios } }).catch(() => {
    });
  }, [carKey, upsertCloud, session]);
  useEffect(() => {
    const gear = Math.round(t.gear || 0);
    const speed = t.speedKph || 0;
    const rpm = t.rpm || 0;
    if (gear < 1 || speed < MIN_SPEED_KPH || rpm < MIN_RPM) return;
    if ((t.throttle || 0) < 0.5) return;
    const r = rpm / speed;
    const prev = ratiosRef.current[gear];
    const next = prev ? { ratio: prev.ratio * (1 - ALPHA) + r * ALPHA, samples: prev.samples + 1 } : { ratio: r, samples: 1 };
    ratiosRef.current = { ...ratiosRef.current, [gear]: next };
    cacheRef.current = { ...cacheRef.current, [carKey]: ratiosRef.current };
    if (next.samples % 30 === 0) {
      saveCache(cacheRef.current);
      syncToCloud();
    }
  }, [t.gear, t.speedKph, t.rpm, t.throttle, carKey, syncToCloud]);
  const advice = useMemo(() => {
    const ratios = ratiosRef.current;
    const gear = Math.round(t.gear || 0);
    const rpm = t.rpm || 0;
    const speed = t.speedKph || 0;
    const warn = t.rpmShiftWarn || t.rpmMax * 0.9 || 9e3;
    const red = t.rpmShiftRedline || t.rpmMax || 1e4;
    const cur = ratios[gear];
    const nxt = ratios[gear + 1];
    const prv = ratios[gear - 1];
    let rpmAfterUp = null;
    let rpmAfterDown = null;
    if (cur && nxt && speed > 0) rpmAfterUp = rpm * nxt.ratio / cur.ratio;
    if (cur && prv && speed > 0) rpmAfterDown = rpm * prv.ratio / cur.ratio;
    let action = {
      label: "HOLD",
      tone: "zinc",
      detail: "in range"
    };
    if (rpm >= red) {
      action = { label: "SHIFT ↑", tone: "rose", detail: "redline" };
    } else if (rpm >= warn) {
      action = {
        label: "SHIFT ↑",
        tone: "amber",
        detail: rpmAfterUp ? `→ ${Math.round(rpmAfterUp)} rpm` : "warn zone"
      };
    } else if (rpmAfterDown && rpmAfterDown < red && rpm < warn * 0.55 && gear > 1) {
      action = {
        label: "SHIFT ↓",
        tone: "emerald",
        detail: `→ ${Math.round(rpmAfterDown)} rpm`
      };
    }
    const gaps = [];
    const gearsKnown = Object.keys(ratios).map(Number).filter((g) => g >= 1).sort((a, b) => a - b);
    for (let i = 0; i < gearsKnown.length - 1; i++) {
      const a = ratios[gearsKnown[i]].ratio;
      const b = ratios[gearsKnown[i + 1]].ratio;
      if (a && b) gaps.push({ from: gearsKnown[i], to: gearsKnown[i + 1], pct: (1 - b / a) * 100 });
    }
    return { gear, rpm, warn, red, cur, nxt, prv, rpmAfterUp, rpmAfterDown, action, gaps, ratios };
  }, [t.gear, t.rpm, t.speedKph, t.rpmShiftWarn, t.rpmShiftRedline, t.rpmMax, samples.length]);
  const resetCar = () => {
    delete cacheRef.current[carKey];
    ratiosRef.current = {};
    saveCache(cacheRef.current);
    force((x) => x + 1);
  };
  const publish = async () => {
    if (carKey === "unknown") return;
    const ratios = {};
    for (const [g, v] of Object.entries(ratiosRef.current))
      ratios[g] = { ratio: v.ratio, samples: v.samples };
    if (Object.keys(ratios).length === 0) {
      toast.error("No learned ratios to publish yet — drive a few laps first.");
      return;
    }
    await upsertCloud({ data: { car: carKey, ratios } });
    const out = await publishCloud({ data: { car: carKey, name: carKey, published: true } });
    if ("ok" in out && out.ok) toast.success(`Published gear ratios for ${carKey} to community.`);
    else toast.error("Publish failed.");
  };
  const onImport = (row) => {
    const incoming = row.payload;
    const next = {};
    for (const [g, v] of Object.entries(incoming))
      next[Number(g)] = { ratio: v.ratio, samples: v.samples };
    ratiosRef.current = next;
    cacheRef.current = { ...cacheRef.current, [carKey]: next };
    saveCache(cacheRef.current);
    setBrowseOpen(false);
    force((x) => x + 1);
    toast.success(`Imported ${Object.keys(next).length} gears from community.`);
  };
  const loadRows = useCallback(async () => {
    const out = await listCloud({ data: { car: carKey } });
    return (out.rows || []).map((r) => ({
      id: r.id,
      user_id: r.user_id,
      votes: r.votes,
      title: r.name || r.car,
      subtitle: `${Object.keys(r.ratios || {}).length} gears · ${new Date(r.updated_at).toLocaleDateString()}`,
      payload: r.ratios
    }));
  }, [carKey, listCloud]);
  const onVote = async (row) => {
    const out = await voteCloud({ data: { target_id: row.id, kind: "gear_ratios" } });
    return { votes: out.votes };
  };
  const allGears = Array.from({ length: 8 }, (_, i) => i + 1);
  const toneClass = {
    rose: "text-rose-400",
    amber: "text-amber-400",
    emerald: "text-emerald-400",
    zinc: "text-foreground"
  };
  return /* @__PURE__ */ jsxs("div", { className: "rounded-sm border border-border bg-background", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border px-2 py-1.5", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-[0.18em] text-muted-foreground", children: "Gear Ratio Advisor" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setBrowseOpen(true),
            className: "rounded-sm bg-muted px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-foreground hover:bg-accent",
            title: "Browse community gear ratios for this car",
            children: "browse"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: publish,
            className: "rounded-sm bg-emerald-500/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/30",
            title: "Publish your learned ratios to the community",
            children: "publish"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: resetCar,
            className: "text-[9px] uppercase tracking-wider text-muted-foreground hover:text-foreground",
            title: "Clear learned ratios for this car",
            children: "reset"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-2 border-b border-border px-2 py-2", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-[9px] uppercase tracking-wider text-muted-foreground", children: "Action" }),
        /* @__PURE__ */ jsx("div", { className: `text-lg tabular-nums ${toneClass[advice.action.tone]}`, children: advice.action.label }),
        /* @__PURE__ */ jsx("div", { className: "text-[9px] text-muted-foreground", children: advice.action.detail })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[9px] uppercase tracking-wider text-muted-foreground", children: "Gear · RPM" }),
        /* @__PURE__ */ jsxs("div", { className: "text-lg tabular-nums text-foreground", children: [
          advice.gear || "—",
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: " · " }),
          Math.round(advice.rpm)
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-[9px] text-muted-foreground", children: [
          "warn ",
          Math.round(advice.warn),
          " · red ",
          Math.round(advice.red)
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-8 gap-px bg-muted text-[10px]", children: allGears.map((g) => {
      const s = advice.ratios[g];
      const isCurrent = g === advice.gear;
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: `bg-background p-1.5 text-center ${isCurrent ? "ring-1 ring-inset ring-amber-500/60" : ""}`,
          children: [
            /* @__PURE__ */ jsxs("div", { className: "text-[9px] uppercase text-muted-foreground", children: [
              "G",
              g
            ] }),
            /* @__PURE__ */ jsx(
              "div",
              {
                className: `tabular-nums ${s ? isCurrent ? "text-amber-300" : "text-foreground" : "text-muted-foreground"}`,
                children: s ? s.ratio.toFixed(2) : "—"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "text-[8px] text-muted-foreground tabular-nums", children: s ? s.samples : 0 })
          ]
        },
        g
      );
    }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-px bg-muted text-[11px]", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-background p-2", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[9px] uppercase tracking-wider text-muted-foreground", children: "After ↑shift" }),
        /* @__PURE__ */ jsx("div", { className: "tabular-nums text-foreground", children: advice.rpmAfterUp ? `${Math.round(advice.rpmAfterUp)} rpm` : "—" }),
        /* @__PURE__ */ jsxs("div", { className: "text-[9px] text-muted-foreground", children: [
          "drop ",
          advice.rpmAfterUp ? `${Math.round(advice.rpm - advice.rpmAfterUp)}` : "—"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-background p-2", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[9px] uppercase tracking-wider text-muted-foreground", children: "After ↓shift" }),
        /* @__PURE__ */ jsx("div", { className: "tabular-nums text-foreground", children: advice.rpmAfterDown ? `${Math.round(advice.rpmAfterDown)} rpm` : "—" }),
        /* @__PURE__ */ jsxs("div", { className: "text-[9px] text-muted-foreground", children: [
          "rise ",
          advice.rpmAfterDown ? `+${Math.round(advice.rpmAfterDown - advice.rpm)}` : "—"
        ] })
      ] })
    ] }),
    advice.gaps.length > 0 && /* @__PURE__ */ jsxs("div", { className: "border-t border-border px-2 py-1.5", children: [
      /* @__PURE__ */ jsx("div", { className: "text-[9px] uppercase tracking-wider text-muted-foreground mb-1", children: "Ratio Gaps" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-0.5 text-[10px] tabular-nums", children: advice.gaps.map((g) => {
        const tag = g.pct < 12 ? "tight" : g.pct > 28 ? "wide" : "ok";
        const tagColor = tag === "tight" ? "text-sky-400" : tag === "wide" ? "text-rose-400" : "text-emerald-400";
        return /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
            "G",
            g.from,
            "→G",
            g.to
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-foreground", children: [
            g.pct.toFixed(1),
            "%"
          ] }),
          /* @__PURE__ */ jsx("span", { className: `uppercase text-[9px] ${tagColor}`, children: tag })
        ] }, `${g.from}-${g.to}`);
      }) })
    ] }),
    /* @__PURE__ */ jsx(
      CommunityBrowser,
      {
        open: browseOpen,
        title: `Community Gear Ratios · ${carKey}`,
        loader: loadRows,
        onImport,
        onVote,
        onClose: () => setBrowseOpen(false)
      }
    )
  ] });
}
const DISMISS_KEY = "pit-wall:bridge-banner-dismissed";
function BridgeConnectionBanner({ t }) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => typeof sessionStorage !== "undefined" && sessionStorage.getItem(DISMISS_KEY) === "1"
  );
  const bridge = useBridgeConnection(t.connected);
  useEffect(() => {
    if (t.connected || dismissed) {
      setShow(false);
      return;
    }
    const timer = setTimeout(() => setShow(true), 6e4);
    return () => clearTimeout(timer);
  }, [t.connected, dismissed]);
  if (!show || t.connected) return null;
  const portBlocked = !bridge.wsReachable && !bridge.serviceRunning;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "mx-2 mb-2 flex items-start gap-3 rounded-md border border-racing-orange/40 bg-racing-orange/10 px-3 py-2.5 text-xs text-foreground",
      role: "alert",
      children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "mt-0.5 h-4 w-4 shrink-0 text-racing-orange" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-1", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-foreground", children: "Still no telemetry after 60 seconds" }),
          portBlocked ? /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground leading-relaxed", children: [
            "Port",
            " ",
            /* @__PURE__ */ jsx("code", { className: "rounded bg-muted px-1 font-mono text-[11px] text-primary", children: "3001" }),
            " ",
            "is not reachable. Start the bridge below, then allow Node.js through Windows Firewall if prompted."
          ] }) : /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: "The bridge looks up, but iRacing is not sending data yet. Launch iRacing, get in a car, and start a practice or race session." }),
          /* @__PURE__ */ jsxs("p", { className: "font-mono text-[10px] text-muted-foreground", children: [
            "Test in browser:",
            " ",
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "http://localhost:3001",
                className: "text-primary hover:underline",
                target: "_blank",
                rel: "noreferrer",
                children: "http://localhost:3001"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            "aria-label": "Dismiss",
            className: "shrink-0 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground",
            onClick: () => {
              sessionStorage.setItem(DISMISS_KEY, "1");
              setDismissed(true);
              setShow(false);
            },
            children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" })
          }
        )
      ]
    }
  );
}
function DiagnosticsPanel({ diagnostics }) {
  const fpsStatus = getFpsStatus(diagnostics.clientFps);
  const streamStatus = getStreamStatus(diagnostics.streamHzActual, diagnostics.streamHzTarget);
  const overallHealth = [fpsStatus, streamStatus].every((s) => s === "good") ? "good" : [fpsStatus, streamStatus].some((s) => s === "critical") ? "critical" : "warning";
  const statusColor = {
    good: "text-emerald-500",
    warning: "text-amber-500",
    critical: "text-rose-500"
  }[overallHealth];
  const statusDot = {
    good: "bg-emerald-500",
    warning: "bg-amber-500",
    critical: "bg-rose-500"
  }[overallHealth];
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `fixed bottom-4 right-4 bg-background border border-border-strong rounded font-mono text-[11px] select-text ${statusColor}`,
      style: { width: "180px" },
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-2 py-1 border-b border-border-strong bg-panel-2", children: [
          /* @__PURE__ */ jsx("div", { className: `w-2 h-2 rounded-full ${statusDot}` }),
          /* @__PURE__ */ jsx("span", { className: "uppercase tracking-wider text-muted-foreground", children: "Diagnostics" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-0.5 p-2", children: [
          /* @__PURE__ */ jsx(MetricRow, { label: "FPS", value: diagnostics.clientFps, unit: "/ 60", status: fpsStatus }),
          /* @__PURE__ */ jsx(
            MetricRow,
            {
              label: "Stream",
              value: `${diagnostics.streamHzActual.toFixed(1)} / ${diagnostics.streamHzTarget}`,
              unit: "Hz",
              status: streamStatus
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "text-muted-foreground text-[10px] mt-1 pt-1 border-t border-border-strong", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { children: "Status" }),
            /* @__PURE__ */ jsx("span", { className: "text-foreground", children: diagnostics.connectionStatus })
          ] }) })
        ] })
      ]
    }
  );
}
function MetricRow({ label, value, unit, status }) {
  const statusColor = {
    good: "text-emerald-400",
    warning: "text-amber-400",
    critical: "text-rose-400",
    undefined: "text-foreground"
  }[status ?? "undefined"];
  return /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between", children: [
    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxs("span", { className: statusColor, children: [
      typeof value === "string" ? value : Math.round(value),
      /* @__PURE__ */ jsx("span", { className: "text-[9px] text-muted-foreground ml-0.5", children: unit })
    ] })
  ] });
}
function getFpsStatus(fps) {
  if (fps >= 55) return "good";
  if (fps >= 45) return "warning";
  return "critical";
}
function getStreamStatus(actual, target) {
  const diff = Math.abs(actual - target);
  if (diff <= 1) return "good";
  if (diff <= 2) return "warning";
  return "critical";
}
function HistogramWidget({
  samples,
  selectedChannelKey = "throttle"
}) {
  const [binCount, setBinCount] = useState(15);
  const [hoveredBin, setHoveredBin] = useState(null);
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const channelData = useMemo(() => {
    return samples.map((s) => {
      if (selectedChannelKey === "throttle") return s.throttle;
      if (selectedChannelKey === "brake") return s.brake;
      if (selectedChannelKey === "steering") return Math.abs(s.steering);
      if (selectedChannelKey === "speed") return s.speed;
      if (selectedChannelKey === "rpm") return s.rpm;
      if (selectedChannelKey === "gLat") return Math.abs(s.gLat);
      if (selectedChannelKey === "gLon") return Math.abs(s.gLon);
      return s.throttle;
    });
  }, [samples, selectedChannelKey]);
  const histogram = useMemo(() => {
    return computeHistogram(channelData, binCount);
  }, [channelData, binCount]);
  const channel = STATIC_CHANNELS$1.find((c) => c.key === selectedChannelKey);
  const label = channel?.label || selectedChannelKey;
  const unit = channel?.unit || "";
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || histogram.bins.length === 0) return;
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#18181b";
    ctx.fillRect(0, 0, w, h);
    const padding = 40;
    const graphW = w - padding * 2;
    const graphH = h - padding * 2;
    const binWidth = graphW / histogram.bins.length;
    const maxCount = Math.max(...histogram.bins.map((b) => b.count), 1);
    for (let i = 0; i < histogram.bins.length; i++) {
      const bin = histogram.bins[i];
      const barH = bin.count / maxCount * graphH;
      const x = padding + i * binWidth + 2;
      const y = padding + graphH - barH;
      const isHovered = hoveredBin === i;
      ctx.fillStyle = isHovered ? channel?.color || "#22d3ee" : adjustBrightness(channel?.color || "#22d3ee", 0.6);
      ctx.fillRect(x, y, binWidth - 4, barH);
      if (isHovered && bin.count > 0) {
        ctx.fillStyle = "#fff";
        ctx.font = "11px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`${bin.count}`, x + binWidth / 2 - 2, y - 5);
      }
    }
    ctx.strokeStyle = "#3f3f46";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, padding + graphH);
    ctx.lineTo(padding + graphW, padding + graphH);
    ctx.stroke();
    ctx.fillStyle = "#a1a1aa";
    ctx.font = "10px monospace";
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const y = padding + graphH - i * graphH / 4;
      const val = Math.round(i * maxCount / 4);
      ctx.fillText(val.toString(), padding - 8, y + 3);
    }
  }, [histogram, hoveredBin, channel?.color]);
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const w = wrap.clientWidth;
    const binCount2 = histogram.bins.length;
    const binWidth = (w - 80) / binCount2;
    const binIdx = Math.floor((x - 40) / binWidth);
    setHoveredBin(binIdx >= 0 && binIdx < binCount2 ? binIdx : null);
  };
  const handleMouseLeave = () => {
    setHoveredBin(null);
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full bg-background border border-border-strong rounded overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "px-3 py-2 border-b border-border-strong bg-panel-2 flex items-center justify-between flex-shrink-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-[11px] uppercase tracking-wider text-muted-foreground", children: [
        label,
        " Distribution"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("label", { className: "text-[10px] text-muted-foreground", children: "Bins:" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            min: "5",
            max: "50",
            value: binCount,
            onChange: (e) => setBinCount(parseInt(e.target.value)),
            className: "w-20 h-1"
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground w-5", children: binCount })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { ref: wrapRef, className: "flex-1 min-h-0 overflow-hidden", children: /* @__PURE__ */ jsx(
      "canvas",
      {
        ref: canvasRef,
        onMouseMove: handleMouseMove,
        onMouseLeave: handleMouseLeave,
        className: "block cursor-crosshair"
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "px-3 py-2 border-t border-border-strong bg-panel-2 flex-shrink-0 grid grid-cols-3 gap-2 text-[10px]", children: [
      /* @__PURE__ */ jsx(StatRow, { label: "Mean", value: histogram.stats.mean, unit }),
      /* @__PURE__ */ jsx(StatRow, { label: "Median", value: histogram.stats.median, unit }),
      /* @__PURE__ */ jsx(StatRow, { label: "Std Dev", value: histogram.stats.stdDev, unit }),
      /* @__PURE__ */ jsx(StatRow, { label: "Min", value: histogram.stats.min, unit }),
      /* @__PURE__ */ jsx(StatRow, { label: "Max", value: histogram.stats.max, unit }),
      /* @__PURE__ */ jsx(StatRow, { label: "Samples", value: histogram.stats.count, unit: "" })
    ] })
  ] });
}
function StatRow({ label, value, unit }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-baseline gap-1", children: [
    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxs("span", { className: "text-foreground", children: [
      value.toFixed(1),
      /* @__PURE__ */ jsx("span", { className: "text-[9px] text-muted-foreground ml-0.5", children: unit })
    ] })
  ] });
}
function adjustBrightness(hex, factor) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, Math.floor((num >> 16) * factor)));
  const g = Math.max(0, Math.min(255, Math.floor((num >> 8 & 255) * factor)));
  const b = Math.max(0, Math.min(255, Math.floor((num & 255) * factor)));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, "0")}`;
}
function prepareScatterData(samples, xKey, yKey) {
  const points = [];
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    const x = s[xKey];
    const y = s[yKey];
    if (Number.isFinite(x) && Number.isFinite(y)) {
      points.push({
        x,
        y,
        age: (samples.length - i) / samples.length,
        // 0 (old) to 1 (new)
        time: i
      });
    }
  }
  return points;
}
function calculateGridDensity(points, gridSize = 20) {
  if (points.length === 0) return /* @__PURE__ */ new Map();
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const density = /* @__PURE__ */ new Map();
  for (const p of points) {
    const binX = Math.floor((p.x - minX) / rangeX * gridSize);
    const binY = Math.floor((p.y - minY) / rangeY * gridSize);
    const key = `${binX},${binY}`;
    density.set(key, (density.get(key) || 0) + 1);
  }
  return density;
}
function calculateScatterMetrics(points) {
  if (points.length === 0) {
    return {
      correlation: 0,
      minX: 0,
      maxX: 1,
      minY: 0,
      maxY: 1
    };
  }
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const meanX = xs.reduce((a, b) => a + b) / xs.length;
  const meanY = ys.reduce((a, b) => a + b) / ys.length;
  let numerator = 0;
  let sumSqX = 0;
  let sumSqY = 0;
  for (let i = 0; i < points.length; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    numerator += dx * dy;
    sumSqX += dx * dx;
    sumSqY += dy * dy;
  }
  const correlation = sumSqX * sumSqY > 0 ? numerator / Math.sqrt(sumSqX * sumSqY) : 0;
  return {
    correlation: Math.max(-1, Math.min(1, correlation)),
    minX,
    maxX,
    minY,
    maxY
  };
}
const CHANNEL_KEYS = ["speed", "rpm", "throttle", "brake", "steering", "gLat", "gLon"];
function ScatterWidget({
  samples,
  xChannelKey = "throttle",
  yChannelKey = "brake"
}) {
  const [xChannel, setXChannel] = useState(xChannelKey);
  const [yChannel, setYChannel] = useState(yChannelKey);
  const [densityMode, setDensityMode] = useState("grid");
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const scatterData = useMemo(() => {
    return prepareScatterData(samples, xChannel, yChannel);
  }, [samples, xChannel, yChannel]);
  const metrics = useMemo(() => {
    return calculateScatterMetrics(scatterData);
  }, [scatterData]);
  const density = useMemo(() => {
    if (densityMode === "none") return null;
    return calculateGridDensity(scatterData, 20);
  }, [scatterData, densityMode]);
  STATIC_CHANNELS$1.find((c) => c.key === xChannel);
  STATIC_CHANNELS$1.find((c) => c.key === yChannel);
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || scatterData.length === 0) return;
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#18181b";
    ctx.fillRect(0, 0, w, h);
    const padding = 50;
    const graphW = w - padding * 2;
    const graphH = h - padding * 2;
    ctx.strokeStyle = "#27272a";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const x = padding + i * graphW / 4;
      const y = padding + i * graphH / 4;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, padding + graphH);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + graphW, y);
      ctx.stroke();
    }
    ctx.strokeStyle = "#52525b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, padding + graphH);
    ctx.lineTo(padding + graphW, padding + graphH);
    ctx.stroke();
    if (density && densityMode === "grid") {
      const maxDensity = Math.max(...density.values(), 1);
      for (const [key, count] of density.entries()) {
        const [binX, binY] = key.split(",").map(Number);
        const cellW = graphW / 20;
        const cellH = graphH / 20;
        const x = padding + binX * cellW;
        const y = padding + graphH - (binY + 1) * cellH;
        const intensity = count / maxDensity;
        const hue = 240 - intensity * 60;
        const sat = 100;
        const light = 40 + intensity * 20;
        ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
        ctx.fillRect(x, y, cellW, cellH);
      }
    }
    const rangeX = metrics.maxX - metrics.minX || 1;
    const rangeY = metrics.maxY - metrics.minY || 1;
    for (let i = 0; i < scatterData.length; i++) {
      const point = scatterData[i];
      const px = padding + (point.x - metrics.minX) / rangeX * graphW;
      const py = padding + graphH - (point.y - metrics.minY) / rangeY * graphH;
      const alpha = 0.3 + (point.age || 0) * 0.7;
      ctx.fillStyle = `rgba(34, 211, 238, ${alpha})`;
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    if (scatterData.length > 0) {
      const latest = scatterData[scatterData.length - 1];
      const px = padding + (latest.x - metrics.minX) / rangeX * graphW;
      const py = padding + graphH - (latest.y - metrics.minY) / rangeY * graphH;
      ctx.strokeStyle = "#22d3ee";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "#a1a1aa";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let i = 0; i <= 4; i++) {
      const x = padding + i * graphW / 4;
      const val = metrics.minX + i * (metrics.maxX - metrics.minX) / 4;
      ctx.fillText(val.toFixed(1), x, padding + graphH + 8);
    }
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let i = 0; i <= 4; i++) {
      const y = padding + graphH - i * graphH / 4;
      const val = metrics.minY + i * (metrics.maxY - metrics.minY) / 4;
      ctx.fillText(val.toFixed(1), padding - 8, y);
    }
  }, [scatterData, density, densityMode, metrics]);
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full bg-background border border-border-strong rounded overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "px-3 py-2 border-b border-border-strong bg-panel-2 flex-shrink-0", children: [
      /* @__PURE__ */ jsx("div", { className: "text-[11px] uppercase tracking-wider text-muted-foreground mb-2", children: "XY Scatter Plot" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-[10px]", children: [
        /* @__PURE__ */ jsx("label", { className: "text-muted-foreground", children: "X:" }),
        /* @__PURE__ */ jsx(
          "select",
          {
            value: xChannel,
            onChange: (e) => setXChannel(e.target.value),
            className: "bg-accent text-foreground px-2 py-0.5 rounded text-[9px] border border-zinc-700",
            children: CHANNEL_KEYS.map((k) => /* @__PURE__ */ jsx("option", { value: k, children: STATIC_CHANNELS$1.find((c) => c.key === k)?.label || k }, k))
          }
        ),
        /* @__PURE__ */ jsx("label", { className: "text-muted-foreground ml-2", children: "Y:" }),
        /* @__PURE__ */ jsx(
          "select",
          {
            value: yChannel,
            onChange: (e) => setYChannel(e.target.value),
            className: "bg-accent text-foreground px-2 py-0.5 rounded text-[9px] border border-zinc-700",
            children: CHANNEL_KEYS.map((k) => /* @__PURE__ */ jsx("option", { value: k, children: STATIC_CHANNELS$1.find((c) => c.key === k)?.label || k }, k))
          }
        ),
        /* @__PURE__ */ jsx("label", { className: "text-muted-foreground ml-2", children: "Density:" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: densityMode,
            onChange: (e) => setDensityMode(e.target.value),
            className: "bg-accent text-foreground px-2 py-0.5 rounded text-[9px] border border-zinc-700",
            children: [
              /* @__PURE__ */ jsx("option", { value: "none", children: "Off" }),
              /* @__PURE__ */ jsx("option", { value: "grid", children: "Grid" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { ref: wrapRef, className: "flex-1 min-h-0 overflow-hidden", children: /* @__PURE__ */ jsx("canvas", { ref: canvasRef, className: "block w-full h-full" }) }),
    /* @__PURE__ */ jsx("div", { className: "px-3 py-2 border-t border-border-strong bg-panel-2 flex-shrink-0 text-[10px]", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
      /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
        "Correlation: ",
        /* @__PURE__ */ jsx("span", { className: "text-foreground", children: metrics.correlation.toFixed(2) })
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
        "Points: ",
        /* @__PURE__ */ jsx("span", { className: "text-foreground", children: scatterData.length })
      ] })
    ] }) })
  ] });
}
function LapMetricsTable({ samples }) {
  const [sortBy, setSortBy] = useState("lapNumber");
  const [sortOrder, setSortOrder] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("all");
  const lapMetrics = useMemo(() => {
    if (samples.length === 0) return [];
    const lapsCount = Math.max(1, Math.floor(samples.length / 240));
    const laps = [];
    for (let lap = 0; lap < lapsCount; lap++) {
      const startIdx = lap * 120;
      const endIdx = Math.min(startIdx + 120, samples.length);
      const lapSamples = samples.slice(startIdx, endIdx);
      if (lapSamples.length === 0) continue;
      const speeds = lapSamples.map((s) => s.speed);
      const gLats = lapSamples.map((s) => Math.abs(s.gLat));
      const gLons = lapSamples.map((s) => s.gLon);
      const lapTime = (lapSamples[lapSamples.length - 1].t - lapSamples[0].t) / 1e3;
      const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
      const maxGLat = Math.max(...gLats);
      const maxGLon = Math.max(...gLons);
      const minGLon = Math.min(...gLons);
      const sectorLen = Math.floor(lapSamples.length / 3);
      const s1Time = sectorLen > 0 ? (lapSamples[sectorLen - 1].t - lapSamples[0].t) / 1e3 : null;
      const s2Time = sectorLen * 2 > 0 ? (lapSamples[Math.min(sectorLen * 2 - 1, lapSamples.length - 1)].t - lapSamples[sectorLen].t) / 1e3 : null;
      const s3Time = sectorLen * 2 < lapSamples.length ? (lapSamples[lapSamples.length - 1].t - lapSamples[Math.min(sectorLen * 2, lapSamples.length - 1)].t) / 1e3 : null;
      laps.push({
        lapNumber: lap + 1,
        lapTime,
        sector1: s1Time,
        sector2: s2Time,
        sector3: s3Time,
        avgSpeed,
        maxGLat,
        maxGLon,
        minGLon,
        fuelAtEnd: Math.random() * 20 + 10,
        // Mock fuel
        status: lap === lapsCount - 1 ? "in-progress" : "complete"
      });
    }
    return laps;
  }, [samples]);
  const filtered = useMemo(() => {
    let result = lapMetrics;
    if (statusFilter !== "all") {
      result = result.filter((l) => l.status === statusFilter);
    }
    result.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      let cmp = 0;
      if (typeof aVal === "number") {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal).localeCompare(String(bVal));
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });
    return result;
  }, [lapMetrics, sortBy, sortOrder, statusFilter]);
  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full bg-background border border-border-strong rounded overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "px-3 py-2 border-b border-border-strong bg-panel-2 flex-shrink-0", children: [
      /* @__PURE__ */ jsx("div", { className: "text-[11px] uppercase tracking-wider text-muted-foreground mb-2", children: "Lap Metrics" }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 text-[10px]", children: [
        /* @__PURE__ */ jsx("label", { className: "text-muted-foreground", children: "Status:" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: statusFilter,
            onChange: (e) => setStatusFilter(e.target.value),
            className: "bg-accent text-foreground px-2 py-0.5 rounded text-[9px] border border-zinc-700",
            children: [
              /* @__PURE__ */ jsx("option", { value: "all", children: "All" }),
              /* @__PURE__ */ jsx("option", { value: "complete", children: "Complete" }),
              /* @__PURE__ */ jsx("option", { value: "in-progress", children: "In Progress" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-h-0 overflow-auto", children: [
      /* @__PURE__ */ jsxs("table", { className: "w-full text-[10px] border-collapse", children: [
        /* @__PURE__ */ jsx("thead", { className: "sticky top-0 bg-panel-2 border-b border-border-strong", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx(
            HeaderCell,
            {
              label: "Lap",
              onSort: () => handleSort("lapNumber"),
              active: sortBy === "lapNumber",
              order: sortOrder
            }
          ),
          /* @__PURE__ */ jsx(
            HeaderCell,
            {
              label: "Time",
              onSort: () => handleSort("lapTime"),
              active: sortBy === "lapTime",
              order: sortOrder
            }
          ),
          /* @__PURE__ */ jsx(
            HeaderCell,
            {
              label: "S1",
              onSort: () => handleSort("sector1"),
              active: sortBy === "sector1",
              order: sortOrder
            }
          ),
          /* @__PURE__ */ jsx(
            HeaderCell,
            {
              label: "S2",
              onSort: () => handleSort("sector2"),
              active: sortBy === "sector2",
              order: sortOrder
            }
          ),
          /* @__PURE__ */ jsx(
            HeaderCell,
            {
              label: "S3",
              onSort: () => handleSort("sector3"),
              active: sortBy === "sector3",
              order: sortOrder
            }
          ),
          /* @__PURE__ */ jsx(
            HeaderCell,
            {
              label: "Avg Spd",
              onSort: () => handleSort("avgSpeed"),
              active: sortBy === "avgSpeed",
              order: sortOrder
            }
          ),
          /* @__PURE__ */ jsx(
            HeaderCell,
            {
              label: "Max G Lat",
              onSort: () => handleSort("maxGLat"),
              active: sortBy === "maxGLat",
              order: sortOrder
            }
          ),
          /* @__PURE__ */ jsx(
            HeaderCell,
            {
              label: "Max G Lon",
              onSort: () => handleSort("maxGLon"),
              active: sortBy === "maxGLon",
              order: sortOrder
            }
          )
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: filtered.map((lap) => /* @__PURE__ */ jsxs(
          "tr",
          {
            className: "border-b border-border-strong hover:bg-muted transition-colors",
            children: [
              /* @__PURE__ */ jsx(Cell, { value: lap.lapNumber, status: lap.status }),
              /* @__PURE__ */ jsx(Cell, { value: lap.lapTime?.toFixed(2), unit: "s" }),
              /* @__PURE__ */ jsx(Cell, { value: lap.sector1?.toFixed(2), unit: "s" }),
              /* @__PURE__ */ jsx(Cell, { value: lap.sector2?.toFixed(2), unit: "s" }),
              /* @__PURE__ */ jsx(Cell, { value: lap.sector3?.toFixed(2), unit: "s" }),
              /* @__PURE__ */ jsx(Cell, { value: lap.avgSpeed.toFixed(0), unit: "kph" }),
              /* @__PURE__ */ jsx(Cell, { value: lap.maxGLat.toFixed(2), unit: "G" }),
              /* @__PURE__ */ jsx(Cell, { value: lap.maxGLon.toFixed(2), unit: "G" })
            ]
          },
          lap.lapNumber
        )) })
      ] }),
      filtered.length === 0 && /* @__PURE__ */ jsx("div", { className: "p-4 text-center text-muted-foreground text-[10px]", children: "No laps yet" })
    ] })
  ] });
}
function HeaderCell({
  label,
  onSort,
  active,
  order
}) {
  return /* @__PURE__ */ jsx(
    "th",
    {
      onClick: onSort,
      className: `px-2 py-1 text-left cursor-pointer font-normal ${active ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground"}`,
      children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
        label,
        active && /* @__PURE__ */ jsx("span", { className: "text-[8px]", children: order === "asc" ? "↑" : "↓" })
      ] })
    }
  );
}
function Cell({
  value,
  unit,
  status
}) {
  const textColor = status === "in-progress" ? "text-emerald-400" : status === "complete" ? "text-foreground" : "text-muted-foreground";
  return /* @__PURE__ */ jsx("td", { className: `px-2 py-1 text-right tabular-nums ${textColor}`, children: value != null ? /* @__PURE__ */ jsxs(Fragment, { children: [
    value,
    unit && /* @__PURE__ */ jsx("span", { className: "text-[9px] text-muted-foreground ml-0.5", children: unit })
  ] }) : "—" });
}
function TabedAnalysisPanel({ samples, ggScatterComponent }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "gg", label: "G-G" },
    { id: "histogram", label: "Histogram" },
    { id: "scatter", label: "Scatter" },
    { id: "metrics", label: "Metrics" }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full bg-background border border-border-strong rounded overflow-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "flex gap-0 border-b border-border-strong bg-panel-2 flex-shrink-0 overflow-x-auto", children: tabs.map((tab) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setActiveTab(tab.id),
        className: `px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold border-b-2 transition-colors ${activeTab === tab.id ? "text-cyan-300 border-cyan-400 font-black bg-accent/20" : "text-muted-foreground border-transparent hover:text-foreground hover:bg-accent/10"}`,
        children: tab.label
      },
      tab.id
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-h-0 overflow-hidden", children: [
      activeTab === "dashboard" && /* @__PURE__ */ jsxs("div", { className: "w-full h-full flex flex-col gap-2 overflow-y-auto p-2 bg-[#05070A] scrollbar-thin", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-shrink-0 bg-[#0B0F14] border border-[#1C2430] rounded p-1", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[9px] uppercase tracking-[0.2em] font-bold text-[#8B5CF6] mb-1 px-1", children: "G-G Acceleration Vector" }),
          /* @__PURE__ */ jsx("div", { className: "h-[240px]", children: ggScatterComponent })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-shrink-0 bg-[#0B0F14] border border-[#1C2430] rounded p-1", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[9px] uppercase tracking-[0.2em] font-bold text-[#8B5CF6] mb-1 px-1", children: "Live Throttle / Brake Scatter" }),
          /* @__PURE__ */ jsx("div", { className: "h-[240px]", children: /* @__PURE__ */ jsx(ScatterWidget, { samples, xChannelKey: "throttle", yChannelKey: "brake" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-shrink-0 bg-[#0B0F14] border border-[#1C2430] rounded p-1", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[9px] uppercase tracking-[0.2em] font-bold text-[#8B5CF6] mb-1 px-1", children: "Live Throttle Input Distribution" }),
          /* @__PURE__ */ jsx("div", { className: "h-[240px]", children: /* @__PURE__ */ jsx(HistogramWidget, { samples, selectedChannelKey: "throttle" }) })
        ] })
      ] }),
      activeTab === "gg" && /* @__PURE__ */ jsx("div", { className: "w-full h-full", children: ggScatterComponent }),
      activeTab === "histogram" && /* @__PURE__ */ jsx(HistogramWidget, { samples, selectedChannelKey: "throttle" }),
      activeTab === "scatter" && /* @__PURE__ */ jsx(ScatterWidget, { samples, xChannelKey: "throttle", yChannelKey: "brake" }),
      activeTab === "metrics" && /* @__PURE__ */ jsx(LapMetricsTable, { samples })
    ] })
  ] });
}
function F1SpeedGauge({ t }) {
  const speed = Math.round(t.speedKph);
  const maxSpeed = 340;
  const pct = Math.min(1, speed / maxSpeed);
  const startAngle = 150;
  const sweep = 240;
  const endAngle = startAngle + sweep * pct;
  const r = 54;
  const cx = 64;
  const cy = 64;
  const polarToCart = (deg) => ({
    x: cx + r * Math.cos(deg * Math.PI / 180),
    y: cy + r * Math.sin(deg * Math.PI / 180)
  });
  const bgStart = polarToCart(startAngle);
  const bgEnd = polarToCart(startAngle + sweep);
  const arcEnd = polarToCart(endAngle);
  const largeArcBg = 1;
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  const bgPath = `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 ${largeArcBg} 1 ${bgEnd.x} ${bgEnd.y}`;
  const arcPath = pct > 1e-3 ? `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 ${largeArc} 1 ${arcEnd.x} ${arcEnd.y}` : "";
  const arcColor = speed > 280 ? "var(--destructive)" : speed > 200 ? "#ffb300" : "var(--ch-throttle)";
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-0.5", children: [
    /* @__PURE__ */ jsx("div", { className: "text-[9px] uppercase tracking-wider text-muted-foreground", children: "Speed" }),
    /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 128 128", className: "w-full max-w-[160px]", "aria-label": `Speed: ${speed} KM/H`, children: [
      /* @__PURE__ */ jsx("path", { d: bgPath, fill: "none", stroke: "var(--border)", strokeWidth: "6", strokeLinecap: "round" }),
      arcPath && /* @__PURE__ */ jsx("path", { d: arcPath, fill: "none", stroke: arcColor, strokeWidth: "6", strokeLinecap: "round" }),
      /* @__PURE__ */ jsx(
        "text",
        {
          x: cx,
          y: cy - 2,
          textAnchor: "middle",
          dominantBaseline: "central",
          className: "fill-foreground",
          style: { fontSize: "32px", fontFamily: "var(--font-mono)", fontWeight: 700 },
          children: speed
        }
      ),
      /* @__PURE__ */ jsx(
        "text",
        {
          x: cx,
          y: cy + 20,
          textAnchor: "middle",
          className: "fill-muted-foreground",
          style: { fontSize: "9px", fontFamily: "var(--font-mono)", letterSpacing: "0.1em" },
          children: "KM/H"
        }
      )
    ] })
  ] });
}
function F1LapHero({ t }) {
  const deltaStr = `${t.deltaSec >= 0 ? "+" : ""}${t.deltaSec.toFixed(3)}`;
  const deltaColor = t.deltaSec < 0 ? "text-emerald-400" : "text-rose-400";
  return /* @__PURE__ */ jsxs("div", { className: "border-b border-border px-3 py-2", children: [
    /* @__PURE__ */ jsx("div", { className: "text-[9px] uppercase tracking-wider text-muted-foreground mb-1", children: "Current Lap" }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between", children: [
      /* @__PURE__ */ jsx("span", { className: "font-mono text-[28px] font-bold leading-none text-foreground tabular-nums", children: t.lastLap || "—:——.———" }),
      /* @__PURE__ */ jsx("span", { className: `font-mono text-[18px] font-bold tabular-nums ${deltaColor}`, children: deltaStr })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-2 grid grid-cols-3 gap-2 text-[10px]", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-muted-foreground uppercase tracking-wider text-[8px]", children: "Best Lap" }),
        /* @__PURE__ */ jsx("div", { className: "font-mono tabular-nums text-foreground", children: t.bestLap || "—:——.———" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-muted-foreground uppercase tracking-wider text-[8px]", children: "Last Lap" }),
        /* @__PURE__ */ jsx("div", { className: "font-mono tabular-nums text-foreground", children: t.lastLap || "—:——.———" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-muted-foreground uppercase tracking-wider text-[8px]", children: "Predicted" }),
        /* @__PURE__ */ jsx("div", { className: "font-mono tabular-nums text-foreground", children: t.lapLastLapTimeSec > 0 ? formatLapTime(t.lapLastLapTimeSec + t.deltaSec) : "—:——.———" })
      ] })
    ] })
  ] });
}
function formatLapTime(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—:——.———";
  const mins = Math.floor(seconds / 60);
  const secs = seconds - mins * 60;
  return `${mins}:${secs.toFixed(3).padStart(6, "0")}`;
}
function F1SectorTable({ t }) {
  const rows = [
    { label: "S1", key: "s1", idx: 1 },
    { label: "S2", key: "s2", idx: 2 },
    { label: "S3", key: "s3", idx: 3 }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "border-b border-border px-3 py-2", children: [
    /* @__PURE__ */ jsx("div", { className: "text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5", children: "Sectors" }),
    /* @__PURE__ */ jsx("div", { className: "space-y-1", children: rows.map(({ label, key, idx }) => {
      const time = t.sectors[key];
      const isBest = t.sectors.bestSector === idx;
      const delta = time && isBest ? -Math.random() * 0.3 : time ? Math.random() * 0.5 : null;
      const deltaStr = delta !== null ? `${delta < 0 ? "" : "+"}${delta.toFixed(3)}` : "";
      const deltaColor = delta !== null && delta < 0 ? "text-emerald-400" : "text-rose-400";
      return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[24px_1fr_1fr] items-center gap-1 text-[11px]", children: [
        /* @__PURE__ */ jsx("span", { className: "font-mono text-muted-foreground", children: label }),
        /* @__PURE__ */ jsx("span", { className: "font-mono tabular-nums text-foreground text-right", children: time ?? "—.———" }),
        /* @__PURE__ */ jsx("span", { className: `font-mono tabular-nums text-right text-[10px] ${time ? deltaColor : "text-muted-foreground"}`, children: deltaStr || "—" })
      ] }, key);
    }) })
  ] });
}
function F1TyreDisplay({ t }) {
  const corners = [
    { key: "fl", label: "FL", gridPos: "col-start-1 row-start-1" },
    { key: "fr", label: "FR", gridPos: "col-start-3 row-start-1" },
    { key: "rl", label: "RL", gridPos: "col-start-1 row-start-2" },
    { key: "rr", label: "RR", gridPos: "col-start-3 row-start-2" }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "border border-border bg-background", children: [
    /* @__PURE__ */ jsx("div", { className: "border-b border-border px-2 py-1.5 text-[9px] uppercase tracking-wider text-muted-foreground", children: "Tyre Temp (°C)" }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[1fr_auto_1fr] grid-rows-2 items-center gap-y-2 px-3 py-3", children: [
      corners.map(({ key, label, gridPos }) => {
        const temp = Math.round(t.tires[key].tempC);
        const color = tempColor(temp);
        return /* @__PURE__ */ jsxs("div", { className: `${gridPos} text-center`, children: [
          /* @__PURE__ */ jsx("div", { className: `font-mono text-[22px] font-bold tabular-nums leading-none ${color}`, children: temp }),
          /* @__PURE__ */ jsx("div", { className: "text-[9px] text-muted-foreground mt-0.5", children: label })
        ] }, key);
      }),
      /* @__PURE__ */ jsx("div", { className: "col-start-2 row-span-2 flex items-center justify-center px-2", children: /* @__PURE__ */ jsx(CarSilhouette, {}) })
    ] })
  ] });
}
function tempColor(temp) {
  if (temp > 105) return "text-rose-400";
  if (temp > 95) return "text-amber-400";
  if (temp < 60) return "text-sky-400";
  return "text-foreground";
}
function CarSilhouette() {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 40 80", className: "w-10 h-20 opacity-30", fill: "none", stroke: "currentColor", strokeWidth: "1", children: [
    /* @__PURE__ */ jsx("path", { d: "M12 8 L12 4 Q12 2 14 2 L26 2 Q28 2 28 4 L28 8", className: "stroke-muted-foreground" }),
    /* @__PURE__ */ jsx("rect", { x: "10", y: "8", width: "20", height: "50", rx: "4", className: "stroke-muted-foreground" }),
    /* @__PURE__ */ jsx("path", { d: "M12 58 L12 72 Q12 76 16 76 L24 76 Q28 76 28 72 L28 58", className: "stroke-muted-foreground" }),
    /* @__PURE__ */ jsx("rect", { x: "4", y: "2", width: "6", height: "10", rx: "1", className: "stroke-muted-foreground fill-muted-foreground/20" }),
    /* @__PURE__ */ jsx("rect", { x: "30", y: "2", width: "6", height: "10", rx: "1", className: "stroke-muted-foreground fill-muted-foreground/20" }),
    /* @__PURE__ */ jsx("rect", { x: "4", y: "66", width: "6", height: "10", rx: "1", className: "stroke-muted-foreground fill-muted-foreground/20" }),
    /* @__PURE__ */ jsx("rect", { x: "30", y: "66", width: "6", height: "10", rx: "1", className: "stroke-muted-foreground fill-muted-foreground/20" }),
    /* @__PURE__ */ jsx("ellipse", { cx: "20", cy: "28", rx: "5", ry: "8", className: "stroke-muted-foreground" })
  ] });
}
function F1QuickStats({ t }) {
  return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 gap-px bg-border", children: [
    /* @__PURE__ */ jsx(Stat, { label: "Throttle", value: `${Math.round(t.throttle * 100)}%` }),
    /* @__PURE__ */ jsx(Stat, { label: "Brake", value: `${Math.round(t.brake * 100)}%` }),
    /* @__PURE__ */ jsx(
      Stat,
      {
        label: "DRS",
        value: t.drsAvailable ? "OPEN" : "OFF",
        valueColor: t.drsAvailable ? "text-emerald-400" : "text-muted-foreground"
      }
    ),
    /* @__PURE__ */ jsx(Stat, { label: "Fuel", value: `${t.fuelRemainingL.toFixed(1)} L` })
  ] });
}
function Stat({
  label,
  value,
  valueColor = "text-foreground"
}) {
  return /* @__PURE__ */ jsxs("div", { className: "bg-background px-2 py-1.5 text-center", children: [
    /* @__PURE__ */ jsx("div", { className: "text-[8px] uppercase tracking-wider text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("div", { className: `font-mono text-[12px] font-bold tabular-nums ${valueColor}`, children: value })
  ] });
}
function F1SectorComparison({ t }) {
  const s1 = t.sectors.s1;
  const s2 = t.sectors.s2;
  const s3 = t.sectors.s3;
  const bestS1 = s1 ? (parseFloat(s1) - 0.1 - Math.random() * 0.2).toFixed(3) : null;
  const bestS2 = s2 ? (parseFloat(s2) - 0.1 - Math.random() * 0.3).toFixed(3) : null;
  const bestS3 = s3 ? (parseFloat(s3) + 0.05 - Math.random() * 0.1).toFixed(3) : null;
  const deltaS1 = s1 && bestS1 ? parseFloat(s1) - parseFloat(bestS1) : null;
  const deltaS2 = s2 && bestS2 ? parseFloat(s2) - parseFloat(bestS2) : null;
  const deltaS3 = s3 && bestS3 ? parseFloat(s3) - parseFloat(bestS3) : null;
  const totalThis = t.lastLap;
  const totalBest = t.bestLap;
  const totalDelta = t.deltaSec;
  const fmtDelta = (d) => {
    if (d === null) return "—";
    return `${d < 0 ? "" : "+"}${d.toFixed(3)}`;
  };
  const deltaColor = (d) => d === null ? "text-muted-foreground" : d < 0 ? "text-emerald-400" : "text-rose-400";
  return /* @__PURE__ */ jsxs("div", { className: "border border-border bg-background h-full flex flex-col", children: [
    /* @__PURE__ */ jsx("div", { className: "border-b border-border px-2 py-1.5 text-[9px] uppercase tracking-wider text-muted-foreground flex-shrink-0", children: "Sector Comparison" }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-[10px] font-mono", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border text-muted-foreground", children: [
        /* @__PURE__ */ jsx("th", { className: "px-2 py-1 text-left font-normal" }),
        /* @__PURE__ */ jsx("th", { className: "px-2 py-1 text-right font-normal", children: "S1" }),
        /* @__PURE__ */ jsx("th", { className: "px-2 py-1 text-right font-normal", children: "S2" }),
        /* @__PURE__ */ jsx("th", { className: "px-2 py-1 text-right font-normal", children: "S3" }),
        /* @__PURE__ */ jsx("th", { className: "px-2 py-1 text-right font-normal", children: "LAP" })
      ] }) }),
      /* @__PURE__ */ jsxs("tbody", { children: [
        /* @__PURE__ */ jsxs("tr", { className: "border-b border-border", children: [
          /* @__PURE__ */ jsx("td", { className: "px-2 py-1.5 text-muted-foreground text-[9px] uppercase", children: "This Lap" }),
          /* @__PURE__ */ jsx("td", { className: "px-2 py-1.5 text-right tabular-nums text-foreground", children: s1 ?? "—" }),
          /* @__PURE__ */ jsx("td", { className: "px-2 py-1.5 text-right tabular-nums text-foreground", children: s2 ?? "—" }),
          /* @__PURE__ */ jsx("td", { className: "px-2 py-1.5 text-right tabular-nums text-foreground", children: s3 ?? "—" }),
          /* @__PURE__ */ jsx("td", { className: "px-2 py-1.5 text-right tabular-nums text-foreground", children: totalThis || "—" })
        ] }),
        /* @__PURE__ */ jsxs("tr", { className: "border-b border-border", children: [
          /* @__PURE__ */ jsx("td", { className: "px-2 py-1.5 text-muted-foreground text-[9px] uppercase", children: "Best Lap" }),
          /* @__PURE__ */ jsx("td", { className: "px-2 py-1.5 text-right tabular-nums text-foreground", children: bestS1 ?? "—" }),
          /* @__PURE__ */ jsx("td", { className: "px-2 py-1.5 text-right tabular-nums text-foreground", children: bestS2 ?? "—" }),
          /* @__PURE__ */ jsx("td", { className: "px-2 py-1.5 text-right tabular-nums text-foreground", children: bestS3 ?? "—" }),
          /* @__PURE__ */ jsx("td", { className: "px-2 py-1.5 text-right tabular-nums text-foreground", children: totalBest || "—" })
        ] }),
        /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("td", { className: "px-2 py-1.5 text-muted-foreground text-[9px] uppercase", children: "Delta" }),
          /* @__PURE__ */ jsx("td", { className: `px-2 py-1.5 text-right tabular-nums ${deltaColor(deltaS1)}`, children: fmtDelta(deltaS1) }),
          /* @__PURE__ */ jsx("td", { className: `px-2 py-1.5 text-right tabular-nums ${deltaColor(deltaS2)}`, children: fmtDelta(deltaS2) }),
          /* @__PURE__ */ jsx("td", { className: `px-2 py-1.5 text-right tabular-nums ${deltaColor(deltaS3)}`, children: fmtDelta(deltaS3) }),
          /* @__PURE__ */ jsx("td", { className: `px-2 py-1.5 text-right tabular-nums font-bold ${totalDelta < 0 ? "text-emerald-400" : "text-rose-400"}`, children: fmtDelta(totalDelta) })
        ] })
      ] })
    ] }) })
  ] });
}
function transformPoint(p, rotationDeg = 0, mirrorX = false) {
  let x = p[0];
  let y = p[1];
  if (mirrorX) {
    x = 1 - x;
  }
  if (rotationDeg !== 0) {
    const rad = rotationDeg * Math.PI / 180;
    const dx = x - 0.5;
    const dy = y - 0.5;
    const rx = dx * Math.cos(rad) - dy * Math.sin(rad);
    const ry = dx * Math.sin(rad) + dy * Math.cos(rad);
    x = rx + 0.5;
    y = ry + 0.5;
  }
  return [x, y];
}
function prepareSpline(rawPoints, rotationDeg = 0, mirrorX = false) {
  if (!rawPoints || rawPoints.length === 0) {
    return { points: [], cumulativeLengths: [], totalLength: 0 };
  }
  const points = rawPoints.map((p) => transformPoint(p, rotationDeg, mirrorX));
  const n = points.length;
  const cumulativeLengths = new Array(n + 1);
  cumulativeLengths[0] = 0;
  let currentDist = 0;
  for (let i = 0; i < n; i++) {
    const p0 = points[i];
    const p1 = points[(i + 1) % n];
    const dx = p1[0] - p0[0];
    const dy = p1[1] - p0[1];
    const segmentLength = Math.sqrt(dx * dx + dy * dy);
    currentDist += segmentLength;
    cumulativeLengths[i + 1] = currentDist;
  }
  return {
    points,
    cumulativeLengths,
    totalLength: currentDist
  };
}
function prepareTrackMap(def) {
  const rotation = def.orientation?.rotationDeg ?? 0;
  const mirror = def.orientation?.mirrorX ?? false;
  return {
    trackId: def.trackId,
    displayName: def.displayName,
    mainSpline: prepareSpline(def.spline, rotation, mirror),
    sectors: def.sectors,
    corners: def.corners,
    pitSpline: def.pitLane ? prepareSpline(def.pitLane.spline, rotation, mirror) : void 0,
    mergePct: def.pitLane?.mergePct,
    exitPct: def.pitLane?.exitPct
  };
}
function getCoordinatesAtPct(prepared, pct) {
  const { points, cumulativeLengths, totalLength } = prepared;
  if (!points || points.length === 0) return { x: 0.5, y: 0.5 };
  let p = (pct % 1 + 1) % 1;
  const targetDistance = p * totalLength;
  let i = 0;
  while (i < points.length - 1 && cumulativeLengths[i + 1] < targetDistance) {
    i++;
  }
  const p0 = points[i];
  const p1 = points[(i + 1) % points.length];
  const dist0 = cumulativeLengths[i];
  const dist1 = cumulativeLengths[i + 1];
  const segmentLength = dist1 - dist0;
  const f = segmentLength > 0 ? (targetDistance - dist0) / segmentLength : 0;
  return {
    x: p0[0] * (1 - f) + p1[0] * f,
    y: p0[1] * (1 - f) + p1[1] * f
  };
}
function getSvgPathFromSpline(prepared, width, height) {
  const { points } = prepared;
  if (!points || points.length === 0) return "";
  let d = `M ${points[0][0] * width} ${points[0][1] * height}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i][0] * width} ${points[i][1] * height}`;
  }
  d += " Z";
  return d;
}
const lemansMap = {
  trackId: "lemans",
  displayName: "Circuit des 24 Heures du Mans",
  orientation: {
    rotationDeg: -15,
    // Rotate slightly for optimal screen layout
    mirrorX: false
  },
  spline: [
    [0.35, 0.15],
    // Start/Finish Line
    [0.35, 0.11],
    // Dunlop Straight
    [0.37, 0.06],
    // Dunlop curve entry
    [0.4, 0.04],
    // Dunlop apex
    [0.43, 0.05],
    // Dunlop Chicane exit
    [0.44, 0.09],
    // Dunlop Bridge
    [0.46, 0.12],
    // Esses Entry
    [0.48, 0.15],
    // Esses Left
    [0.51, 0.16],
    // Esses Right
    [0.54, 0.15],
    // Tertre Rouge apex
    [0.56, 0.17],
    // Mulsanne Straight start
    [0.59, 0.25],
    [0.61, 0.32],
    [0.63, 0.37],
    // Chicane 1 Entry (Playstation)
    [0.62, 0.39],
    // Chicane 1 Left
    [0.65, 0.4],
    // Chicane 1 Right
    [0.65, 0.43],
    // Playstation Straight
    [0.68, 0.51],
    [0.7, 0.58],
    // Chicane 2 Entry (Michelin)
    [0.69, 0.6],
    // Chicane 2 Right
    [0.72, 0.62],
    // Chicane 2 Left
    [0.72, 0.66],
    // Michelin Straight
    [0.76, 0.76],
    [0.79, 0.84],
    [0.81, 0.88],
    // Mulsanne Kink
    [0.82, 0.92],
    // Mulsanne Corner entry
    [0.8, 0.94],
    // Mulsanne Corner apex
    [0.76, 0.91],
    // Mulsanne Straight Exit
    [0.65, 0.89],
    [0.54, 0.87],
    [0.43, 0.86],
    // Indianapolis approach
    [0.34, 0.85],
    // Indianapolis Left entry
    [0.31, 0.89],
    // Indianapolis apex
    [0.28, 0.88],
    // Arnage approach
    [0.25, 0.84],
    // Arnage entry
    [0.23, 0.8],
    // Arnage apex
    [0.24, 0.74],
    // Arnage exit
    [0.23, 0.67],
    // Porsche Curves start
    [0.19, 0.61],
    // Curves Left
    [0.17, 0.55],
    // Curves Right
    [0.15, 0.49],
    // Curve Corvette
    [0.18, 0.43],
    // Porsche Curves exit
    [0.23, 0.38],
    // Maison Blanche
    [0.28, 0.32],
    // Ford Chicane entry
    [0.31, 0.25],
    // Ford Chicane Left
    [0.33, 0.2]
    // Ford Chicane Right
  ],
  sectors: [
    { id: "S1", name: "Sector 1 (Start to Chicane 1)", startPct: 0, lengthPct: 0.33 },
    { id: "S2", name: "Sector 2 (Chicane 1 to Mulsanne)", startPct: 0.33, lengthPct: 0.27 },
    { id: "S3", name: "Sector 3 (Mulsanne to Finish)", startPct: 0.6, lengthPct: 0.4 }
  ],
  corners: [
    { id: "T1", name: "Dunlop Chicane", pct: 0.08 },
    { id: "T2", name: "Tertre Rouge", pct: 0.22 },
    { id: "T3", name: "Mulsanne Corner", pct: 0.58 },
    { id: "T4", name: "Indianapolis", pct: 0.72 },
    { id: "T5", name: "Arnage", pct: 0.78 },
    { id: "T6", name: "Porsche Curves", pct: 0.88 }
  ],
  pitLane: {
    spline: [
      [0.28, 0.32],
      // Ford Chicane pit entrance divergence
      [0.31, 0.28],
      // Pit lane speed limit line
      [0.34, 0.22],
      // Parallel pit lane
      [0.34, 0.16],
      // Pit boxes/crew
      [0.34, 0.1],
      // Acceleration out lane
      [0.38, 0.05]
      // Main track rejoin (after Dunlop curve)
    ],
    mergePct: 0.08,
    exitPct: 0.96
  }
};
const spaMap = {
  trackId: "spa",
  displayName: "Circuit de Spa-Francorchamps",
  orientation: {
    rotationDeg: 0,
    mirrorX: false
  },
  spline: [
    [0.16, 0.72],
    // Start/Finish Line
    [0.14, 0.69],
    // Approach to La Source
    [0.11, 0.66],
    // La Source apex (Hairpin)
    [0.15, 0.68],
    // Downhill straight towards Eau Rouge
    [0.21, 0.73],
    [0.24, 0.77],
    [0.28, 0.8],
    // Eau Rouge compression
    [0.29, 0.76],
    // Raidillon Left
    [0.28, 0.71],
    // Raidillon Right climb
    [0.31, 0.63],
    // Kemmel Straight start
    [0.39, 0.51],
    [0.48, 0.39],
    [0.57, 0.27],
    [0.67, 0.14],
    // Kemmel Straight end
    [0.72, 0.11],
    // Les Combes entry
    [0.75, 0.12],
    // Les Combes Right
    [0.76, 0.16],
    // Les Combes Left
    [0.78, 0.21],
    // Malmedy apex
    [0.75, 0.26],
    // Downhill to Bruxelles
    [0.71, 0.32],
    // Bruxelles entry
    [0.67, 0.37],
    // Bruxelles Hairpin apex
    [0.69, 0.43],
    // Speaker's Corner entry
    [0.74, 0.47],
    // Speaker's Corner apex
    [0.71, 0.52],
    // Speaker's Corner exit
    [0.61, 0.56],
    // Double Gauche entry (Pouhon)
    [0.51, 0.58],
    // Pouhon First Apex
    [0.45, 0.63],
    // Pouhon Second Apex
    [0.46, 0.69],
    // Pouhon exit
    [0.5, 0.73],
    // Fagnes approach
    [0.55, 0.75],
    // Fagnes Right
    [0.59, 0.78],
    // Fagnes Left
    [0.63, 0.82],
    // Campus apex
    [0.68, 0.87],
    // Stavelot entry
    [0.71, 0.9],
    // Stavelot Apex
    [0.67, 0.92],
    // Stavelot exit
    [0.58, 0.89],
    // Courbe Paul Frère
    [0.48, 0.85],
    // Blanchimont entry
    [0.38, 0.82],
    // Blanchimont 1
    [0.28, 0.78],
    // Blanchimont 2
    [0.2, 0.75],
    // Bus Stop Chicane approach
    [0.17, 0.76],
    // Bus Stop Right
    [0.18, 0.74]
    // Bus Stop Left
  ],
  sectors: [
    { id: "S1", name: "Sector 1 (Start to Kemmel End)", startPct: 0, lengthPct: 0.35 },
    { id: "S2", name: "Sector 2 (Les Combes to Stavelot)", startPct: 0.35, lengthPct: 0.43 },
    { id: "S3", name: "Sector 3 (Blanchimont to Finish)", startPct: 0.78, lengthPct: 0.22 }
  ],
  corners: [
    { id: "T1", name: "La Source", pct: 0.05 },
    { id: "T2", name: "Eau Rouge / Raidillon", pct: 0.16 },
    { id: "T3", name: "Les Combes", pct: 0.38 },
    { id: "T4", name: "Bruxelles", pct: 0.48 },
    { id: "T5", name: "Pouhon", pct: 0.62 },
    { id: "T6", name: "Fagnes", pct: 0.72 },
    { id: "T7", name: "Blanchimont", pct: 0.88 },
    { id: "T8", name: "Bus Stop Chicane", pct: 0.96 }
  ],
  pitLane: {
    spline: [
      [0.2, 0.75],
      // Exits before Bus Stop chicane
      [0.17, 0.72],
      // Speed limit marker
      [0.15, 0.7],
      // Parallel crew wall
      [0.13, 0.68],
      // Parallel pits
      [0.14, 0.65],
      // Acceleration lane
      [0.18, 0.68]
      // Merges after La Source hairpin
    ],
    mergePct: 0.08,
    exitPct: 0.95
  }
};
const daytonaMap = {
  trackId: "daytona",
  displayName: "Daytona International Speedway - Road Course",
  orientation: {
    rotationDeg: 0,
    mirrorX: false
  },
  spline: [
    [0.5, 0.85],
    // Start/Finish Line (Tri-oval)
    [0.6, 0.82],
    // Tri-oval banking
    [0.72, 0.77],
    // Front stretch straight
    [0.82, 0.7],
    // Oval Turn 1 banking entry
    [0.83, 0.68],
    // Infield road course divergence (Left hander)
    [0.78, 0.64],
    // Horseshoe bend approach
    [0.72, 0.6],
    // Horseshoe (Right hairpin)
    [0.76, 0.55],
    // Short straight in infield
    [0.79, 0.48],
    // Turn 3 Left
    [0.74, 0.42],
    // Turn 4 Right
    [0.66, 0.38],
    // Turn 5 Left loop
    [0.58, 0.35],
    // Infield hairpin approach
    [0.5, 0.33],
    // Infield Hairpin apex (Turn 6)
    [0.44, 0.38],
    // Acceleration out of infield
    [0.38, 0.44],
    // Oval Turn 2 bank re-entry
    [0.3, 0.46],
    // High banking oval turn 2
    [0.22, 0.44],
    [0.18, 0.38],
    // Oval back straight start
    [0.22, 0.3],
    [0.28, 0.22],
    [0.36, 0.18],
    // Back straightaway
    [0.46, 0.18],
    // Bus Stop (Le Mans Chicane) entry
    [0.48, 0.14],
    // Bus Stop Right
    [0.52, 0.14],
    // Bus Stop Left
    [0.54, 0.18],
    // Bus Stop exit back to straight
    [0.64, 0.18],
    [0.74, 0.19],
    // Oval Turn 3 banking approach
    [0.84, 0.22],
    // High banking oval Turn 3
    [0.89, 0.3],
    [0.9, 0.42],
    [0.86, 0.54],
    // High banking oval Turn 4
    [0.78, 0.66],
    [0.68, 0.74],
    // Oval exit towards front stretch
    [0.58, 0.8]
  ],
  sectors: [
    { id: "S1", name: "Sector 1 (Start to Infield Exit)", startPct: 0, lengthPct: 0.42 },
    { id: "S2", name: "Sector 2 (Oval 2 to Bus Stop)", startPct: 0.42, lengthPct: 0.33 },
    { id: "S3", name: "Sector 3 (Oval 4 to Finish)", startPct: 0.75, lengthPct: 0.25 }
  ],
  corners: [
    { id: "T1", name: "Infield Turn 1", pct: 0.12 },
    { id: "T2", name: "The Horseshoe", pct: 0.18 },
    { id: "T3", name: "Infield Hairpin", pct: 0.34 },
    { id: "T4", name: "Oval Turn 2", pct: 0.46 },
    { id: "T5", name: "Bus Stop Chicane", pct: 0.68 },
    { id: "T6", name: "Oval Turn 3/4", pct: 0.84 }
  ],
  pitLane: {
    spline: [
      [0.68, 0.74],
      // Oval exit pit entrance
      [0.64, 0.76],
      // Speed limit line
      [0.58, 0.8],
      // Pit boxes parallel tri-oval
      [0.54, 0.82],
      // Exit lane
      [0.6, 0.82],
      // Exit acceleration
      [0.72, 0.77]
      // Main track rejoin at turn 1
    ],
    mergePct: 0.08,
    exitPct: 0.92
  }
};
const nurburgringMap = {
  trackId: "nurburgring",
  displayName: "Nürburgring GP-Strecke",
  orientation: {
    rotationDeg: 0,
    mirrorX: false
  },
  spline: [
    [0.48, 0.2],
    // Start/Finish Line
    [0.38, 0.2],
    // Start straight
    [0.28, 0.2],
    // Castrol S approach
    [0.21, 0.22],
    // Castrol S Turn 1 (Right)
    [0.18, 0.27],
    // Castrol S Turn 2 (Left)
    [0.19, 0.33],
    // Mercedes Arena entry
    [0.23, 0.37],
    // Arena Right loop
    [0.28, 0.36],
    // Arena Left exit
    [0.25, 0.42],
    // Valvoline Curve approach
    [0.22, 0.48],
    // Valvoline Hairpin entry
    [0.2, 0.54],
    // Valvoline Hairpin apex
    [0.24, 0.58],
    // Valvoline Hairpin exit
    [0.32, 0.59],
    // Ford Curve entry
    [0.39, 0.6],
    // Ford Curve apex (Right sweeper)
    [0.44, 0.65],
    // Downhill to Dunlop Hairpin
    [0.5, 0.73],
    [0.54, 0.81],
    // Dunlop entry
    [0.59, 0.84],
    // Dunlop Hairpin Apex (Bottom loop)
    [0.63, 0.8],
    // Dunlop exit
    [0.64, 0.72],
    // Audi S approach
    [0.66, 0.64],
    // Schumacher S (Left sweep)
    [0.72, 0.57],
    // Schumacher S (Right climb)
    [0.76, 0.51],
    // Kumho Curve approach
    [0.82, 0.45],
    // Kumho Curve entry
    [0.86, 0.39],
    // Kumho Curve apex
    [0.83, 0.33],
    // Kumho Curve exit
    [0.78, 0.29],
    // Bit Curve entry (Left sweeper)
    [0.72, 0.27],
    // Bit Curve apex
    [0.66, 0.28],
    // Bit Curve exit
    [0.61, 0.26],
    // Coca-Cola Chicane entry
    [0.57, 0.28],
    // Coca-Cola Chicane Left
    [0.54, 0.24],
    // Coca-Cola Chicane Right
    [0.52, 0.21]
    // Coca-Cola Chicane exit back to straight
  ],
  sectors: [
    { id: "S1", name: "Sector 1 (Start to Valvoline)", startPct: 0, lengthPct: 0.34 },
    { id: "S2", name: "Sector 2 (Valvoline to Schumacher S)", startPct: 0.34, lengthPct: 0.32 },
    { id: "S3", name: "Sector 3 (Schumacher S to Finish)", startPct: 0.66, lengthPct: 0.34 }
  ],
  corners: [
    { id: "T1", name: "Castrol S", pct: 0.11 },
    { id: "T2", name: "Valvoline Hairpin", pct: 0.32 },
    { id: "T3", name: "Ford Curve", pct: 0.42 },
    { id: "T4", name: "Dunlop Hairpin", pct: 0.54 },
    { id: "T5", name: "Schumacher S", pct: 0.68 },
    { id: "T6", name: "Coca-Cola Chicane", pct: 0.94 }
  ],
  pitLane: {
    spline: [
      [0.61, 0.26],
      // Coca-Cola chicane entry
      [0.57, 0.28],
      // Speed limit sign
      [0.52, 0.21],
      // Crew speed limit lane
      [0.48, 0.2],
      // Parallel pit lane
      [0.38, 0.2],
      // Exit acceleration
      [0.28, 0.2]
      // Rejoin start straight
    ],
    mergePct: 0.08,
    exitPct: 0.96
  }
};
const PREPARED_LEMANS = prepareTrackMap(lemansMap);
const PREPARED_SPA = prepareTrackMap(spaMap);
const PREPARED_DAYTONA = prepareTrackMap(daytonaMap);
const PREPARED_NURBURGRING = prepareTrackMap(nurburgringMap);
function buildFallbackSpline() {
  const spline = [];
  const cx = 0.5;
  const cy = 0.5;
  const rx = 0.4;
  const ry = 0.3;
  for (let i = 0; i < 40; i++) {
    const ang = i / 40 * Math.PI * 2;
    const deformation = 1 + Math.sin(ang * 3) * 0.08;
    spline.push([
      cx + Math.cos(ang) * rx * deformation,
      cy + Math.sin(ang) * ry * deformation
    ]);
  }
  return spline;
}
const fallbackMapDef = {
  trackId: "generic_oval",
  displayName: "UNMAPPED CIRCUIT",
  spline: buildFallbackSpline(),
  sectors: [
    { id: "S1", name: "Sector 1", startPct: 0, lengthPct: 0.33 },
    { id: "S2", name: "Sector 2", startPct: 0.33, lengthPct: 0.33 },
    { id: "S3", name: "Sector 3", startPct: 0.66, lengthPct: 0.34 }
  ]
};
const PREPARED_FALLBACK = prepareTrackMap(fallbackMapDef);
function getTrackMap(trackName) {
  const lowerName = trackName.toLowerCase();
  if (lowerName.includes("mans") || lowerName.includes("sarthe")) {
    return PREPARED_LEMANS;
  }
  if (lowerName.includes("spa") || lowerName.includes("francorchamps") || lowerName.includes("belgium")) {
    return PREPARED_SPA;
  }
  if (lowerName.includes("daytona")) {
    return PREPARED_DAYTONA;
  }
  if (lowerName.includes("nurburgring") || lowerName.includes("nürburgring") || lowerName.includes("nordschleife")) {
    return PREPARED_NURBURGRING;
  }
  return {
    ...PREPARED_FALLBACK,
    displayName: trackName
  };
}
function RaceCommandLayout({ t, samples }) {
  const [timeStr, setTimeStr] = useState("17:35");
  const [simulatedPct, setSimulatedPct] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(2.2);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [trackedDriverPos, setTrackedDriverPos] = useState(6);
  const [isTrackingActive, setIsTrackingActive] = useState(true);
  useEffect(() => {
    const timer = setInterval(() => {
      const now = /* @__PURE__ */ new Date();
      setTimeStr(now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    }, 1e3);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!t.connected) {
      const interval = setInterval(() => {
        setSimulatedPct((prev) => (prev + 1e-3) % 1);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [t.connected]);
  const position = t.sof > 0 ? "14" : "-";
  const numDrivers = t.sof > 0 ? "22" : "-";
  const gear = t.gear ?? "N";
  const speed = t.speedKph ?? 0;
  const rpm = t.rpm ?? 0;
  const throttle = t.throttle ?? 0;
  const brake = t.brake ?? 0;
  const clutch = t.clutch ?? 0;
  const brakeBias = t.brakeBias ?? 54.5;
  const trackName = t.track || "Circuit des 24 Heures du Mans";
  const lastLap = t.lastLap || "0:00.000";
  const bestLap = t.bestLap || "0:00.000";
  const s1Time = t.sectors?.s1 || "00.000";
  const s2Time = t.sectors?.s2 || "00.000";
  const s3Time = t.sectors?.s3 || "00.000";
  const trackDef = getTrackMap(trackName);
  const lapDistPct = t.connected ? t.all?.LapDistPct ?? t.extras?.LapDistPct ?? 0 : simulatedPct;
  const competitors = [
    { pos: 1, name: "Max V.", carNo: "1", color: "#FFB800", isUser: false, gap: "LDR", best: "3:28.450", last: "3:29.112", lap: 24, offset: 0.35 },
    { pos: 2, name: "Lando N.", carNo: "4", color: "#FF6B35", isUser: false, gap: "+12.1s", best: "3:28.870", last: "3:29.350", lap: 24, offset: 0.28 },
    { pos: 3, name: "Charles L.", carNo: "16", color: "#E63322", isUser: false, gap: "+18.2s", best: "3:29.300", last: "3:30.120", lap: 24, offset: 0.2 },
    { pos: 4, name: "Oscar P.", carNo: "81", color: "#ffffff", isUser: false, gap: "+24.5s", best: "3:29.570", last: "3:29.880", lap: 23, offset: 0.12 },
    { pos: 5, name: "Lewis H.", carNo: "44", color: "#ffffff", isUser: false, gap: "+29.8s", best: "3:29.930", last: "3:31.050", lap: 24, offset: 0.05 },
    { pos: 6, name: "Dany M.", carNo: "6", color: "#00e676", isUser: true, gap: "+32.1s", best: bestLap, last: lastLap, lap: 23, offset: 0 },
    { pos: 7, name: "Fernando A.", carNo: "14", color: "#ffffff", isUser: false, gap: "+35.6s", best: "3:31.100", last: "3:31.520", lap: 24, offset: -0.06 },
    { pos: 8, name: "George R.", carNo: "63", color: "#ffffff", isUser: false, gap: "+41.2s", best: "3:31.570", last: "3:32.110", lap: 24, offset: -0.14 }
  ];
  const trackedDriver = competitors.find((c) => c.pos === trackedDriverPos) ?? competitors[5];
  const trackedTargetPct = (lapDistPct + trackedDriver.offset + 1) % 1;
  let activeCenterSpline = trackDef.mainSpline;
  if (trackDef.pitSpline && trackDef.exitPct !== void 0 && trackDef.mergePct !== void 0) {
    const isInsidePit = trackDef.exitPct > trackDef.mergePct ? trackedTargetPct >= trackDef.exitPct || trackedTargetPct <= trackDef.mergePct : trackedTargetPct >= trackDef.exitPct && trackedTargetPct <= trackDef.mergePct;
    if (isInsidePit) {
      activeCenterSpline = trackDef.pitSpline;
    }
  }
  const centerCoords = getCoordinatesAtPct(activeCenterSpline, trackedTargetPct);
  const cx = centerCoords.x * 200;
  const cy = centerCoords.y * 200;
  let viewBoxStr = "-10 -10 220 220";
  if (isTrackingActive) {
    const vbW = 200 / zoomLevel;
    const vbH = 200 / zoomLevel;
    const vbX = cx - vbW / 2;
    const vbY = cy - vbH / 2;
    viewBoxStr = `${vbX} ${vbY} ${vbW} ${vbH}`;
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex-1 min-h-0 bg-[#000000] text-[#E2E8F0] font-mono select-none flex flex-col p-2 gap-2 overflow-y-auto scrollbar-thin", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 gap-2 bg-[#0A0C10] border border-[#1C2430] p-2 rounded-sm select-none", children: [
      /* @__PURE__ */ jsxs("div", { className: "col-span-2 flex flex-col justify-center border-r border-[#1C2430]/60 pr-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[8px] uppercase tracking-widest text-[#7A828C]", children: "session status" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm font-black text-white", children: "PRACTICE" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-[#FFB800]", children: "L1" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "col-span-2 flex flex-col justify-center border-r border-[#1C2430]/60 px-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[8px] uppercase tracking-widest text-[#7A828C]", children: "position" }),
        /* @__PURE__ */ jsxs("div", { className: "text-sm font-black text-white", children: [
          position,
          " ",
          /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-[#7A828C]", children: [
            "/ ",
            numDrivers
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "col-span-2 flex flex-col justify-center border-r border-[#1C2430]/60 px-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[8px] uppercase tracking-widest text-[#7A828C]", children: "time left" }),
        /* @__PURE__ */ jsxs("div", { className: "text-sm font-black text-[#00e676] tabular-nums", children: [
          "3:24",
          /* @__PURE__ */ jsx("span", { className: "text-[10px] text-[#00e676]/70", children: ":52" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "col-span-2 flex flex-col justify-center border-r border-[#1C2430]/60 px-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[8px] uppercase tracking-widest text-[#7A828C]", children: "last lap" }),
        /* @__PURE__ */ jsx("div", { className: "text-sm font-bold text-white tabular-nums", children: lastLap })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "col-span-2 flex flex-col justify-center border-r border-[#1C2430]/60 px-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[8px] uppercase tracking-widest text-[#7A828C]", children: "best lap" }),
        /* @__PURE__ */ jsx("div", { className: "text-sm font-bold text-white tabular-nums", children: bestLap })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "col-span-2 flex flex-col justify-center px-2 relative", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[8px] uppercase tracking-widest text-[#FF4D4D]", children: "class best" }),
        /* @__PURE__ */ jsx("div", { className: "text-sm font-black text-[#FF4D4D] tabular-nums", children: "3:28.450" }),
        /* @__PURE__ */ jsx("span", { className: "absolute right-2 top-1 text-[8px] text-[#7A828C] font-black uppercase", children: "lmp2" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-h-[350px] grid grid-cols-12 gap-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "col-span-7 flex flex-col border border-[#1C2430] bg-[#0A0C10] rounded-sm overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 gap-1 px-2.5 py-1.5 border-b border-[#1C2430] bg-[#111520] text-[8px] font-bold text-[#7A828C] uppercase tracking-wider", children: [
          /* @__PURE__ */ jsx("div", { className: "col-span-1", children: "pos" }),
          /* @__PURE__ */ jsx("div", { className: "col-span-3", children: "driver" }),
          /* @__PURE__ */ jsx("div", { className: "col-span-1", children: "pit" }),
          /* @__PURE__ */ jsx("div", { className: "col-span-1", children: "lap" }),
          /* @__PURE__ */ jsx("div", { className: "col-span-2", children: "gap" }),
          /* @__PURE__ */ jsx("div", { className: "col-span-2", children: "best lap" }),
          /* @__PURE__ */ jsx("div", { className: "col-span-2", children: "last lap" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 divide-y divide-[#1C2430]/40 overflow-y-auto text-[9.5px]", children: competitors.map((comp) => {
          const isTracked = trackedDriverPos === comp.pos && isTrackingActive;
          const rowClass = comp.isUser ? `bg-[#00e676]/10 border-y border-[#00e676]/20 font-black text-[#00e676] cursor-pointer hover:bg-[#00e676]/15 transition-colors ${isTracked ? "ring-1 ring-inset ring-[#00e676]" : ""}` : `hover:bg-[#111520]/45 items-center text-white cursor-pointer transition-colors ${isTracked ? "bg-[#3b82f6]/10 ring-1 ring-inset ring-[#3b82f6]/40" : ""}`;
          const posColor = comp.pos === 1 ? "text-[#FFB800]" : comp.isUser ? "text-[#00e676]" : isTracked ? "text-[#3b82f6]" : "text-white";
          return /* @__PURE__ */ jsxs(
            "div",
            {
              className: `grid grid-cols-12 gap-1 px-2.5 py-1.5 items-center ${rowClass}`,
              onClick: () => {
                setTrackedDriverPos(comp.pos);
                setIsTrackingActive(true);
              },
              title: `Click to snap camera to ${comp.name}`,
              children: [
                /* @__PURE__ */ jsxs("div", { className: `col-span-1 font-bold ${posColor} flex items-center gap-1`, children: [
                  isTracked && /* @__PURE__ */ jsx("span", { className: "text-[7.5px] animate-pulse", children: "⌖" }),
                  "P",
                  comp.pos
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "col-span-3 font-semibold truncate flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx("span", { className: "truncate", children: comp.name }),
                  comp.isUser && /* @__PURE__ */ jsx("span", { className: "text-[7px] bg-[#00e676]/20 text-[#00e676] px-1 py-0.2 rounded-xs font-black", children: "TEAM" })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "col-span-1 text-[#7A828C]", children: comp.isUser ? "IN" : "-" }),
                /* @__PURE__ */ jsx("div", { className: "col-span-1", children: comp.lap }),
                /* @__PURE__ */ jsx("div", { className: "col-span-2 font-bold", children: comp.gap }),
                /* @__PURE__ */ jsx("div", { className: "col-span-2", children: comp.best }),
                /* @__PURE__ */ jsx("div", { className: "col-span-2 font-semibold", children: comp.last })
              ]
            },
            comp.pos
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "col-span-5 flex flex-col border border-[#1C2430] bg-[#0A0C10] rounded-sm p-3 justify-between relative", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[11px] font-black text-white uppercase tracking-wider", children: trackDef.displayName }),
            /* @__PURE__ */ jsx("span", { className: "text-[8px] text-[#7A828C] uppercase tracking-widest mt-0.5", children: "Authoritative Circuit Spline" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-white tabular-nums", children: timeStr })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 flex items-center justify-center my-3 relative h-[210px] overflow-hidden", children: [
          /* @__PURE__ */ jsxs("div", { className: "absolute right-2 top-0 flex flex-col gap-1 z-10 select-none", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  setZoomLevel((prev) => Math.min(6, prev + 0.4));
                  setIsTrackingActive(true);
                },
                className: "w-5 h-5 rounded-xs bg-[#111520]/85 border border-[#1C2430] text-[10px] font-black hover:bg-[#3b82f6]/25 hover:border-[#3b82f6]/50 text-white flex items-center justify-center cursor-pointer transition-colors active:scale-95",
                title: "Zoom In",
                children: "+"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  const newZoom = Math.max(1, zoomLevel - 0.4);
                  setZoomLevel(newZoom);
                  if (newZoom <= 1) {
                    setIsTrackingActive(false);
                  }
                },
                className: "w-5 h-5 rounded-xs bg-[#111520]/85 border border-[#1C2430] text-[10px] font-black hover:bg-[#3b82f6]/25 hover:border-[#3b82f6]/50 text-white flex items-center justify-center cursor-pointer transition-colors active:scale-95",
                title: "Zoom Out",
                children: "-"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setRotationAngle((prev) => (prev - 15 + 360) % 360),
                className: "w-5 h-5 rounded-xs bg-[#111520]/85 border border-[#1C2430] text-[9px] font-bold hover:bg-[#3b82f6]/25 hover:border-[#3b82f6]/50 text-white flex items-center justify-center cursor-pointer transition-colors active:scale-95",
                title: "Rotate View Left",
                children: "↺"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setRotationAngle((prev) => (prev + 15) % 360),
                className: "w-5 h-5 rounded-xs bg-[#111520]/85 border border-[#1C2430] text-[9px] font-bold hover:bg-[#3b82f6]/25 hover:border-[#3b82f6]/50 text-white flex items-center justify-center cursor-pointer transition-colors active:scale-95",
                title: "Rotate View Right",
                children: "↻"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  setIsTrackingActive((prev) => !prev);
                  if (!isTrackingActive) setZoomLevel(2.2);
                },
                className: `w-5 h-5 rounded-xs border text-[9px] font-bold flex items-center justify-center cursor-pointer transition-colors active:scale-95 ${isTrackingActive ? "bg-[#00e676]/15 border-[#00e676]/50 text-[#00e676]" : "bg-[#111520]/85 border-[#1C2430] text-[#7A828C] hover:text-white"}`,
                title: isTrackingActive ? "Unlock Camera (Whole Track)" : "Lock Camera to Selected Driver",
                children: "⌖"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("svg", { viewBox: viewBoxStr, className: "w-[195px] h-[195px] transition-all duration-300 ease-out", children: /* @__PURE__ */ jsxs("g", { transform: `rotate(${rotationAngle}, ${isTrackingActive ? cx : 100}, ${isTrackingActive ? cy : 100})`, children: [
            /* @__PURE__ */ jsx(
              "path",
              {
                d: getSvgPathFromSpline(trackDef.mainSpline, 200, 200),
                fill: "none",
                stroke: "rgba(122, 130, 140, 0.4)",
                strokeWidth: "4",
                strokeLinecap: "round",
                strokeLinejoin: "round"
              }
            ),
            trackDef.pitSpline && /* @__PURE__ */ jsx(
              "path",
              {
                d: getSvgPathFromSpline(trackDef.pitSpline, 200, 200),
                fill: "none",
                stroke: "rgba(122, 130, 140, 0.25)",
                strokeWidth: "2.5",
                strokeDasharray: "3,3",
                strokeLinecap: "round",
                strokeLinejoin: "round"
              }
            ),
            trackDef.mainSpline.points.length > 0 && /* @__PURE__ */ jsx(
              "line",
              {
                x1: trackDef.mainSpline.points[0][0] * 200 - 4,
                y1: trackDef.mainSpline.points[0][1] * 200,
                x2: trackDef.mainSpline.points[0][0] * 200 + 4,
                y2: trackDef.mainSpline.points[0][1] * 200,
                stroke: "#FF4D4D",
                strokeWidth: "2.5"
              }
            ),
            competitors.map((comp) => {
              const targetPct = (lapDistPct + comp.offset + 1) % 1;
              let activeSpline = trackDef.mainSpline;
              if (trackDef.pitSpline && trackDef.exitPct !== void 0 && trackDef.mergePct !== void 0) {
                const isInsidePit = trackDef.exitPct > trackDef.mergePct ? targetPct >= trackDef.exitPct || targetPct <= trackDef.mergePct : targetPct >= trackDef.exitPct && targetPct <= trackDef.mergePct;
                if (isInsidePit) {
                  activeSpline = trackDef.pitSpline;
                }
              }
              const coords = getCoordinatesAtPct(activeSpline, targetPct);
              const cxComp = coords.x * 200;
              const cyComp = coords.y * 200;
              return /* @__PURE__ */ jsxs("g", { transform: `translate(${cxComp}, ${cyComp}) rotate(${-rotationAngle})`, children: [
                comp.isUser && /* @__PURE__ */ jsx("circle", { cx: "0", cy: "0", r: "7.5", fill: "#00e676", opacity: "0.25", className: "animate-pulse" }),
                /* @__PURE__ */ jsx(
                  "circle",
                  {
                    cx: "0",
                    cy: "0",
                    r: comp.isUser ? "5.5" : "4.5",
                    fill: comp.color,
                    stroke: "#0a0c10",
                    strokeWidth: "1"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "text",
                  {
                    x: "0",
                    y: "2.2",
                    fill: "#000000",
                    fontSize: comp.isUser ? "6.5px" : "6px",
                    fontWeight: "black",
                    textAnchor: "middle",
                    children: comp.pos
                  }
                )
              ] }, comp.pos);
            })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "absolute left-2 bottom-2 bg-[#111520] border border-[#1C2430] rounded-sm px-1.5 py-0.5 text-[7.5px] text-[#7A828C] flex gap-2", children: trackDef.sectors.map((sec) => /* @__PURE__ */ jsxs("span", { className: "font-bold", children: [
            sec.id,
            ": ",
            /* @__PURE__ */ jsx("span", { className: "text-[#00e676]", children: "OK" })
          ] }, sec.id)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border-t border-[#1C2430]/60 pt-2 flex items-center justify-between text-[8px] text-[#7A828C] uppercase tracking-wider font-bold", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              "AIR: ",
              /* @__PURE__ */ jsx("span", { className: "text-white font-black", children: t.airTempC ? t.airTempC.toFixed(0) + "°C" : "22°C" })
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              "TRACK: ",
              /* @__PURE__ */ jsx("span", { className: "text-white font-black", children: t.trackTempC ? t.trackTempC.toFixed(0) + "°C" : "31°C" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "px-1.5 py-0.5 rounded-xs bg-[#00e676]/10 text-[#00e676] border border-[#00e676]/20 font-black", children: "DRY" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 gap-2 h-[120px] shrink-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "col-span-3 border border-[#1C2430] bg-[#0A0C10] rounded-sm p-2 flex flex-col justify-between", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[8px] uppercase tracking-widest text-[#7A828C] border-b border-[#1C2430]/50 pb-1 font-bold", children: "Live Telemetry Input" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 flex gap-3 items-end py-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col items-center gap-1", children: [
            /* @__PURE__ */ jsx("div", { className: "w-full bg-[#111520] h-12 rounded-xs border border-[#1C2430] overflow-hidden relative", children: /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 w-full bg-[#00e676] transition-all", style: { height: `${throttle * 100}%` } }) }),
            /* @__PURE__ */ jsx("span", { className: "text-[7.5px] text-[#7A828C]", children: "THR" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col items-center gap-1", children: [
            /* @__PURE__ */ jsx("div", { className: "w-full bg-[#111520] h-12 rounded-xs border border-[#1C2430] overflow-hidden relative", children: /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 w-full bg-[#FF4D4D] transition-all", style: { height: `${brake * 100}%` } }) }),
            /* @__PURE__ */ jsx("span", { className: "text-[7.5px] text-[#7A828C]", children: "BRK" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col items-center gap-1", children: [
            /* @__PURE__ */ jsx("div", { className: "w-full bg-[#111520] h-12 rounded-xs border border-[#1C2430] overflow-hidden relative", children: /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 w-full bg-[#3B82F6] transition-all", style: { height: `${clutch * 100}%` } }) }),
            /* @__PURE__ */ jsx("span", { className: "text-[7.5px] text-[#7A828C]", children: "CLT" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "col-span-3 border border-[#1C2430] bg-[#0A0C10] rounded-sm p-2 flex flex-col justify-between", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[8px] uppercase tracking-widest text-[#7A828C] border-b border-[#1C2430]/50 pb-1 font-bold", children: "Tires Pressure / Temp" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-1 py-1 text-[8px] text-[#7A828C]", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-[#111520] p-1 border border-[#1C2430]/40 rounded-xs flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { children: "FL" }),
            /* @__PURE__ */ jsx("span", { className: "text-white font-bold", children: "1.52 bar" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-[#111520] p-1 border border-[#1C2430]/40 rounded-xs flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { children: "FR" }),
            /* @__PURE__ */ jsx("span", { className: "text-white font-bold", children: "1.52 bar" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-[#111520] p-1 border border-[#1C2430]/40 rounded-xs flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { children: "RL" }),
            /* @__PURE__ */ jsx("span", { className: "text-white font-bold", children: "1.52 bar" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-[#111520] p-1 border border-[#1C2430]/40 rounded-xs flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { children: "RR" }),
            /* @__PURE__ */ jsx("span", { className: "text-white font-bold", children: "1.52 bar" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "col-span-3 border border-[#1C2430] bg-[#0A0C10] rounded-sm p-2 flex flex-col justify-between", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[8px] uppercase tracking-widest text-[#7A828C] border-b border-[#1C2430]/50 pb-1 font-bold", children: "Engine Diagnostics" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-x-3 gap-y-1 text-[7.5px] text-[#7A828C] py-1 font-semibold", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-b border-[#1C2430]/30 pb-0.5", children: [
            /* @__PURE__ */ jsx("span", { children: "OIL TEMP" }),
            /* @__PURE__ */ jsx("span", { className: "text-white font-bold", children: "77.0°C" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-b border-[#1C2430]/30 pb-0.5", children: [
            /* @__PURE__ */ jsx("span", { children: "OIL PRESS" }),
            /* @__PURE__ */ jsx("span", { className: "text-white font-bold", children: "4.2 bar" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-b border-[#1C2430]/30 pb-0.5", children: [
            /* @__PURE__ */ jsx("span", { children: "OIL LEVEL" }),
            /* @__PURE__ */ jsx("span", { className: "text-[#00D17F] font-bold", children: "6.7L" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-b border-[#1C2430]/30 pb-0.5", children: [
            /* @__PURE__ */ jsx("span", { children: "FUEL PRESS" }),
            /* @__PURE__ */ jsx("span", { className: "text-white font-bold", children: "3.8 bar" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-b border-[#1C2430]/30 pb-0.5", children: [
            /* @__PURE__ */ jsx("span", { children: "MAT TEMP" }),
            /* @__PURE__ */ jsx("span", { className: "text-white font-bold", children: "34.0°C" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-b border-[#1C2430]/30 pb-0.5", children: [
            /* @__PURE__ */ jsx("span", { children: "BATTERY" }),
            /* @__PURE__ */ jsx("span", { className: "text-[#00D17F] font-bold", children: "13.4V" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "col-span-3 border border-[#1C2430] bg-[#0A0C10] rounded-sm p-2 flex flex-col justify-between select-none relative", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[8px] uppercase tracking-widest text-[#7A828C] border-b border-[#1C2430]/50 pb-1 font-bold", children: "Speed & Gears" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 flex gap-3 items-center py-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col justify-center", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[20px] font-black text-white leading-none tabular-nums", children: Math.round(speed * 0.621371) }),
            /* @__PURE__ */ jsx("span", { className: "text-[7.5px] text-[#7A828C] uppercase tracking-wider font-bold", children: "MPH (Live)" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 flex items-center justify-center border-l border-[#1C2430]/60 pl-3", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[28px] font-black text-[#00e676] leading-none select-none", children: gear }),
            /* @__PURE__ */ jsxs("span", { className: "text-[7.5px] text-[#FF4D4D] font-black tracking-widest leading-none mt-1", children: [
              Math.round(rpm),
              " ",
              /* @__PURE__ */ jsx("span", { className: "text-[5.5px]", children: "RPM" })
            ] })
          ] }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 gap-2 bg-[#0A0C10] border border-[#1C2430] p-2 rounded-sm select-none", children: [
      /* @__PURE__ */ jsxs("div", { className: "col-span-3 flex flex-col justify-between border-r border-[#1C2430]/60 pr-2", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[8px] uppercase tracking-widest text-[#7A828C] font-bold", children: "Lap Times" }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col mt-1", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[16px] font-black text-[#00e676] leading-none tabular-nums", children: "03:33.610" }),
          /* @__PURE__ */ jsx("span", { className: "text-[7.5px] text-[#7A828C] uppercase tracking-wider font-semibold mt-0.5", children: "Estimated Lap" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[8px] text-[#7A828C] mt-1 pt-1 border-t border-[#1C2430]/30", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "LAST: ",
            /* @__PURE__ */ jsx("span", { className: "text-white font-bold", children: lastLap })
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            "BEST: ",
            /* @__PURE__ */ jsx("span", { className: "text-white font-bold", children: bestLap })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "col-span-3 flex flex-col justify-between border-r border-[#1C2430]/60 px-2", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[8px] uppercase tracking-widest text-[#7A828C] font-bold", children: "Sectors Splits" }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col mt-1 bg-[#111520] border border-[#1C2430] p-1.5 rounded-xs", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[11px] font-black text-[#00e676] leading-none tabular-nums", children: [
            /* @__PURE__ */ jsx("span", { children: "S1" }),
            /* @__PURE__ */ jsx("span", { children: s1Time })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[9px] text-[#7A828C] mt-1", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              "S2: ",
              s2Time
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              "S3: ",
              s3Time
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "col-span-3 flex flex-col justify-between border-r border-[#1C2430]/60 px-2", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[8px] uppercase tracking-widest text-[#7A828C] font-bold", children: "Electronics controls" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 gap-1.5 mt-1.5", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-[#111520] border border-[#22d3ee]/20 px-1 py-1.5 rounded-xs flex flex-col items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[6.5px] text-[#7A828C] font-bold uppercase", children: "TC" }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-[#22d3ee]", children: "2" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-[#111520] border border-[#FFB800]/20 px-1 py-1.5 rounded-xs flex flex-col items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[6.5px] text-[#7A828C] font-bold uppercase", children: "ABS" }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-[#FFB800]", children: "4" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-[#111520] border border-[#FF4D4D]/20 px-1 py-1.5 rounded-xs flex flex-col items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[6.5px] text-[#7A828C] font-bold uppercase", children: "BB" }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-[#FF4D4D] tabular-nums", children: brakeBias.toFixed(1) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-[#111520] border border-[#00e676]/20 px-1 py-1.5 rounded-xs flex flex-col items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[6.5px] text-[#7A828C] font-bold uppercase", children: "MAP" }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-[#00e676]", children: "1" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "col-span-3 flex flex-col justify-between pl-2", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[8px] uppercase tracking-widest text-[#7A828C] font-bold", children: "Fuel remaining" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-baseline mt-1", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[18px] font-black text-[#00e676] leading-none tabular-nums", children: t.fuelRemainingL ? t.fuelRemainingL.toFixed(1) : "0.0" }),
          /* @__PURE__ */ jsx("span", { className: "text-[7.5px] text-[#7A828C] uppercase font-bold", children: "Liters Left" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[7.5px] text-[#7A828C] mt-1 pt-1 border-t border-[#1C2430]/30 font-semibold", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "AVG: ",
            /* @__PURE__ */ jsx("span", { className: "text-white font-bold", children: t.fuelUsePerHour ? t.fuelUsePerHour.toFixed(1) + " L/h" : "0.0 L/h" })
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            "LAPS EST: ",
            /* @__PURE__ */ jsx("span", { className: "text-white font-bold", children: t.lapsEstimated ? t.lapsEstimated.toFixed(1) : "0.0" })
          ] })
        ] })
      ] })
    ] })
  ] });
}
function Dashboard() {
  const t = useTelemetry();
  const samples = useTelemetryBuffer(t, 3e4, 60);
  const diagnostics = useBridgeDiagnostics(t, t.connected);
  const [smoothing, setSmoothing] = useState("none");
  const [smoothWindow, setSmoothWindow] = useState(5);
  const [cursor, setCursor] = useState(null);
  const [debugMode, setDebugMode] = useState(false);
  const handleCursor = useCallback((c) => setCursor(c), []);
  const {
    layout
  } = useTheme();
  const isF1Layout = layout === "f1";
  const isRaceCommand = layout === "racecommand";
  const [activePreset, setActivePreset] = useState("gt3");
  useEffect(() => {
    const handleChannelClick = (e) => {
      const channel = (e.detail?.channel || "").toLowerCase();
      if (["brake", "bias", "press", "tempc"].some((k) => channel.includes(k))) {
        setActivePreset("gt3");
      } else if (["ers", "soc", "mgu", "hybrid", "power", "charge"].some((k) => channel.includes(k))) {
        setActivePreset("gtp");
      } else if (["suspension", "damper", "ride", "pitch", "roll", "yaw", "accel", "heave"].some((k) => channel.includes(k))) {
        setActivePreset("aero");
      } else if (["throttle", "steer", "clutch", "input"].some((k) => channel.includes(k))) {
        setActivePreset("coach");
      }
    };
    window.addEventListener("pitwall-contextual-channel", handleChannelClick);
    return () => window.removeEventListener("pitwall-contextual-channel", handleChannelClick);
  }, []);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "D") {
        e.preventDefault();
        setDebugMode((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasDebug = Array.from(params.entries()).some(([key, val]) => key.trim() === "debug" && val.trim() === "1");
    if (hasDebug) {
      setDebugMode(true);
    }
  }, []);
  return /* @__PURE__ */ jsxs("main", { className: "min-h-screen bg-background text-foreground font-mono p-0 select-none flex flex-col overflow-hidden", children: [
    /* @__PURE__ */ jsx(TopBar, { t }),
    /* @__PURE__ */ jsx(BridgeConnectionBanner, { t }),
    /* @__PURE__ */ jsx(RpmBar, { rpm: t.rpm, warn: t.rpmShiftWarn, red: t.rpmShiftRedline, max: t.rpmMax }),
    isRaceCommand ? /* @__PURE__ */ jsx(RaceCommandLayout, { t, samples }) : isF1Layout ? (
      /* ═══════════════ F1 LAYOUT ═══════════════ */
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-h-0 grid grid-cols-12 gap-0", children: [
          /* @__PURE__ */ jsxs("section", { className: "col-span-3 flex flex-col overflow-hidden border-r border-border", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 border-b border-border px-3 py-1.5 text-[10px] flex-shrink-0", children: [
              /* @__PURE__ */ jsx("span", { className: "uppercase tracking-wider text-muted-foreground", children: "Live Telemetry" }),
              /* @__PURE__ */ jsx("span", { className: `size-1.5 rounded-full ${t.connected ? "bg-emerald-500" : "bg-amber-500"}` }),
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: t.connected ? "Connected" : "Simulated" }),
              t.connected && /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground ml-auto", children: [
                t.latencyMs,
                "ms"
              ] })
            ] }),
            /* @__PURE__ */ jsx(F1LapHero, { t }),
            /* @__PURE__ */ jsx(F1SectorTable, { t }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col items-center justify-center border-b border-border px-3 py-2", children: [
              /* @__PURE__ */ jsx(F1SpeedGauge, { t }),
              /* @__PURE__ */ jsxs("div", { className: "mt-1 text-center", children: [
                /* @__PURE__ */ jsx("div", { className: "text-[9px] uppercase tracking-wider text-muted-foreground", children: "Gear" }),
                /* @__PURE__ */ jsx("div", { className: "font-mono text-[32px] font-bold leading-none text-foreground", children: t.gear })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx(F1QuickStats, { t }) })
          ] }),
          /* @__PURE__ */ jsxs("section", { className: "col-span-6 flex flex-col overflow-hidden border-r border-border", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-2 py-1 border-b border-border flex-shrink-0 bg-panel-2", children: [
              /* @__PURE__ */ jsx(PanelHeader, { title: "Time Trace", right: cursor ? `cursor t=${(cursor.sample.t / 1e3).toFixed(2)}s` : "Last 30s · 60Hz" }),
              /* @__PURE__ */ jsx(FilterControls, { mode: smoothing, window: smoothWindow, onMode: setSmoothing, onWindow: setSmoothWindow })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex-1 min-h-0 overflow-hidden", children: /* @__PURE__ */ jsx(TraceStack, { samples, smoothing, smoothWindow, onCursorChange: handleCursor }) })
          ] }),
          /* @__PURE__ */ jsxs("section", { className: "col-span-3 flex flex-col overflow-hidden", children: [
            /* @__PURE__ */ jsxs("div", { className: "border-b border-border px-2 py-1.5 flex-shrink-0", children: [
              /* @__PURE__ */ jsx("div", { className: "text-[9px] uppercase tracking-wider text-muted-foreground", children: "Track Map" }),
              /* @__PURE__ */ jsx("div", { className: "h-28 flex items-center justify-center text-muted-foreground text-[10px] opacity-50", children: t.track || "No track data" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex-1 min-h-0 overflow-hidden border-b border-border", children: /* @__PURE__ */ jsx(GGScatterPanel, { samples }) }),
            /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx(F1TyreDisplay, { t }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border-t border-border grid grid-cols-12 gap-0 flex-shrink-0", style: {
          height: "180px"
        }, children: [
          /* @__PURE__ */ jsx("div", { className: "col-span-8 border-r border-border overflow-hidden", children: /* @__PURE__ */ jsx(F1SectorComparison, { t }) }),
          /* @__PURE__ */ jsx("div", { className: "col-span-4 overflow-auto", children: /* @__PURE__ */ jsx(LiveCoach, { t }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border-t border-border bg-background p-2 grid grid-cols-12 gap-2 text-xs flex-shrink-0", children: [
          /* @__PURE__ */ jsx("div", { className: "col-span-12 lg:col-span-2 flex flex-col justify-between", children: t.connected ? /* @__PURE__ */ jsx(RecordingControls, { t }) : /* @__PURE__ */ jsx(BridgeInstall, { iracingLive: t.connected }) }),
          /* @__PURE__ */ jsx("div", { className: "col-span-12 md:col-span-6 lg:col-span-3 flex flex-col justify-between", children: /* @__PURE__ */ jsx(GearAdvisor, { t, samples }) }),
          /* @__PURE__ */ jsx("div", { className: "col-span-12 md:col-span-6 lg:col-span-3 flex flex-col justify-between", children: /* @__PURE__ */ jsx(AdvisorButton, { t }) }),
          /* @__PURE__ */ jsx("div", { className: "col-span-12 md:col-span-6 lg:col-span-2 flex flex-col justify-between", children: /* @__PURE__ */ jsx(LiveReference, { t }) }),
          /* @__PURE__ */ jsx("div", { className: "col-span-12 md:col-span-6 lg:col-span-2 flex flex-col justify-between relative", children: /* @__PURE__ */ jsx(FingerprintUploadCard, {}) })
        ] })
      ] })
    ) : (
      /* ═══════════════ MOTORSPORT WORKSTATION DEFAULT LAYOUT ═══════════════ */
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-h-0 grid grid-cols-12 gap-0 bg-[#05070A]", children: [
          /* @__PURE__ */ jsxs("section", { className: "col-span-3 flex flex-col overflow-hidden border-r border-[#1C2430] bg-[#0B0F14] select-none", children: [
            /* @__PURE__ */ jsxs("div", { className: "border-b border-[#1C2430] px-3 py-2 flex items-center justify-between bg-[#11161D] shrink-0", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[9px] font-mono font-bold tracking-[0.25em] text-[#7A828C] uppercase", children: "OPERATIONS PANEL" }),
              /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-[#00D17F] shadow-[0_0_6px_#00D17F]" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex-1 min-h-0 overflow-y-auto border-b border-[#1C2430]", children: /* @__PURE__ */ jsx(ConfigurableChannelList, { t }) }),
            /* @__PURE__ */ jsx("div", { className: "border-b border-[#1C2430] bg-[#0B0F14]", children: /* @__PURE__ */ jsx(SectorPanel, { t }) }),
            /* @__PURE__ */ jsx("div", { className: "flex-1 min-h-0 overflow-y-auto bg-[#0B0F14]", children: /* @__PURE__ */ jsx(TirePanel, { t }) })
          ] }),
          /* @__PURE__ */ jsxs("section", { className: "col-span-6 flex flex-col overflow-hidden border-r border-[#1C2430] bg-[#05070A]", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-3 py-1.5 border-b border-[#1C2430] shrink-0 bg-[#0B0F14]", children: [
              /* @__PURE__ */ jsx(PanelHeader, { title: "rolling stacked channel traces", right: cursor ? `cursor delta t=${(cursor.sample.t / 1e3).toFixed(3)}s` : "last 30s @ 60hz stream" }),
              /* @__PURE__ */ jsx(FilterControls, { mode: smoothing, window: smoothWindow, onMode: setSmoothing, onWindow: setSmoothWindow })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex-1 min-h-0 overflow-hidden bg-[#05070A] p-1", children: /* @__PURE__ */ jsx(TraceStack, { samples, smoothing, smoothWindow, onCursorChange: handleCursor }) }),
            /* @__PURE__ */ jsxs("div", { className: "border-t border-[#1C2430] bg-[#11161D] px-3 py-1.5 flex items-center justify-between shrink-0 select-none", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold tracking-[0.2em] text-[#7A828C] uppercase", children: "ACTIVE WORKSPACE ENVIRONMENT:" }),
                /* @__PURE__ */ jsx("div", { className: "flex bg-[#05070A] border border-[#1C2430] rounded-sm overflow-hidden", children: Object.keys(WORKSPACE_PRESETS).map((key) => {
                  const isActive = activePreset === key;
                  return /* @__PURE__ */ jsx("button", { onClick: () => setActivePreset(key), className: `px-2 py-0.5 text-[8px] uppercase tracking-wider font-bold cursor-pointer ${isActive ? "bg-[#8B5CF6] text-white" : "text-[#7A828C] hover:text-[#E2E4E8]"}`, children: WORKSPACE_PRESETS[key].name }, key);
                }) })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "text-[7.5px] text-[#7A828C] font-bold uppercase truncate max-w-[200px] hidden md:inline", children: WORKSPACE_PRESETS[activePreset].description })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "border-t border-[#1C2430] bg-[#05070A] p-1 h-[270px] shrink-0 overflow-y-auto", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-1 h-full min-h-[220px]", children: WORKSPACE_PRESETS[activePreset].instruments.map((instrumentKey) => {
              const InstrumentComponent = TELEMETRY_INSTRUMENTS[instrumentKey];
              return /* @__PURE__ */ jsx("div", { className: "h-full", children: /* @__PURE__ */ jsx(InstrumentComponent, { telemetry: t, mode: "live" }) }, instrumentKey);
            }) }) })
          ] }),
          /* @__PURE__ */ jsxs("section", { className: "col-span-3 flex flex-col overflow-hidden bg-[#0B0F14]", children: [
            /* @__PURE__ */ jsxs("div", { className: "border-b border-[#1C2430] px-3 py-2 flex items-center justify-between bg-[#11161D] shrink-0", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[9px] font-mono font-bold tracking-[0.25em] text-[#8B5CF6] uppercase", children: "COACH STRATEGY NET" }),
              /* @__PURE__ */ jsx("span", { className: "text-[8px] font-mono font-black text-[#8B5CF6] tracking-widest", children: "AI ACTIVE" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex-1 min-h-0 overflow-hidden border-b border-[#1C2430]", children: /* @__PURE__ */ jsx(TabedAnalysisPanel, { samples, ggScatterComponent: /* @__PURE__ */ jsx(GGScatterPanel, { samples }) }) }),
            /* @__PURE__ */ jsx("div", { className: "h-[200px] shrink-0 border-b border-[#1C2430]", children: /* @__PURE__ */ jsx(TelemetryEventTimeline, {}) }),
            /* @__PURE__ */ jsx("div", { className: "h-[320px] shrink-0 bg-[#0B0F14] overflow-y-auto border-t border-[#1C2430]/40", children: /* @__PURE__ */ jsx(LiveCoach, { t }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border-t border-[#1C2430] bg-[#0B0F14] p-2 grid grid-cols-12 gap-2 text-[10px] uppercase font-mono tracking-wider shrink-0 select-none", children: [
          /* @__PURE__ */ jsx("div", { className: "col-span-12 lg:col-span-3 flex flex-col justify-between pr-2", children: t.connected ? /* @__PURE__ */ jsx(RecordingControls, { t }) : /* @__PURE__ */ jsx(BridgeInstall, { iracingLive: t.connected }) }),
          /* @__PURE__ */ jsxs("div", { className: "col-span-12 lg:col-span-4 flex flex-col gap-2 border-l border-[#1C2430]/60 pl-2", children: [
            /* @__PURE__ */ jsx(GearAdvisor, { t, samples }),
            /* @__PURE__ */ jsx(LiveReference, { t })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "col-span-12 lg:col-span-5 flex flex-col gap-2 border-l border-[#1C2430]/60 pl-2 relative", children: [
            /* @__PURE__ */ jsx(AdvisorButton, { t }),
            /* @__PURE__ */ jsx(FingerprintUploadCard, {})
          ] })
        ] })
      ] })
    ),
    /* @__PURE__ */ jsx(FooterBar, { t }),
    debugMode && /* @__PURE__ */ jsx(DiagnosticsPanel, { diagnostics })
  ] });
}
function TopBar({
  t
}) {
  const {
    activeWorkspace,
    setActiveWorkspace
  } = useWorkbench();
  const {
    layout,
    setLayout,
    setTheme
  } = useTheme();
  LAYOUT_PROFILES.find((p) => p.id === layout);
  const handleLayoutChange = (id) => {
    setLayout(id);
    const preset = PRESETS.find((p) => p.id === id);
    if (preset) setTheme(preset.theme);
    else setTheme(DARK_THEME);
  };
  return /* @__PURE__ */ jsxs("header", { className: "flex items-center gap-3 border-b border-border pb-2 text-[11px] uppercase tracking-wider", children: [
    /* @__PURE__ */ jsx(BackButton, {}),
    /* @__PURE__ */ jsx("span", { className: "rounded-sm bg-muted px-2 py-1 text-muted-foreground", children: "Pit Wall i2" }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 bg-muted border border-border-strong rounded-sm px-2 py-0.5 ml-1 select-none text-[10px] text-muted-foreground", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[9px] text-muted-foreground uppercase font-mono tracking-wider", children: "Profile" }),
      /* @__PURE__ */ jsx("select", { value: activeWorkspace, onChange: (e) => setActiveWorkspace(e.target.value), className: "bg-transparent text-foreground border-none font-mono text-[10px] uppercase tracking-wider focus:outline-none cursor-pointer pr-1", children: Object.values(WORKSPACES).map((w) => /* @__PURE__ */ jsx("option", { value: w.key, className: "bg-background text-foreground font-mono uppercase text-[10px]", children: w.name }, w.key)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 bg-muted border border-border-strong rounded-sm px-2 py-0.5 select-none text-[10px] text-muted-foreground", children: [
      /* @__PURE__ */ jsx(Palette, { className: "h-3 w-3 text-primary" }),
      /* @__PURE__ */ jsx("span", { className: "text-[9px] text-muted-foreground uppercase font-mono tracking-wider", children: "Style" }),
      /* @__PURE__ */ jsx("select", { value: layout, onChange: (e) => handleLayoutChange(e.target.value), className: "bg-transparent text-foreground border-none font-mono text-[10px] uppercase tracking-wider focus:outline-none cursor-pointer pr-1", children: LAYOUT_PROFILES.map((p) => /* @__PURE__ */ jsx("option", { value: p.id, className: "bg-background text-foreground font-mono uppercase text-[10px]", children: p.label }, p.id)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-muted-foreground", children: [
      /* @__PURE__ */ jsx(Field, { label: "Session", value: t.session }),
      /* @__PURE__ */ jsx(Field, { label: "Track", value: t.track }),
      /* @__PURE__ */ jsx(Field, { label: "Car", value: `${t.car} #${t.carNumber}` })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "ml-auto flex items-center gap-3 text-muted-foreground", children: [
      /* @__PURE__ */ jsx(Field, { label: "Best", value: t.bestLap, mono: true, valueClass: "text-emerald-400" }),
      /* @__PURE__ */ jsx(Field, { label: "Last", value: t.lastLap, mono: true }),
      /* @__PURE__ */ jsx(Field, { label: "Δ", value: `${t.deltaSec >= 0 ? "+" : ""}${t.deltaSec.toFixed(3)}`, mono: true, valueClass: t.deltaSec < 0 ? "text-emerald-400" : "text-rose-400" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 rounded-sm bg-muted px-2 py-1", children: [
        /* @__PURE__ */ jsx("span", { className: `size-1.5 rounded-full ${t.connected ? "bg-emerald-500" : "bg-amber-500"}` }),
        /* @__PURE__ */ jsx("span", { className: "text-[10px]", children: t.connected ? `${t.sdkVersion} · ${t.latencyMs}ms` : "Simulated" })
      ] }),
      /* @__PURE__ */ jsx(Link, { to: "/settings", className: "flex h-6 w-6 items-center justify-center rounded-sm bg-muted border border-border-strong text-muted-foreground hover:text-primary hover:border-primary/50 transition-all hover:scale-110 group cursor-pointer", title: "Settings", children: /* @__PURE__ */ jsx(Settings, { className: "h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-90 text-muted-foreground group-hover:text-primary" }) })
    ] })
  ] });
}
function Field({
  label,
  value,
  mono,
  valueClass = ""
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-1.5", children: [
    /* @__PURE__ */ jsx("span", { className: "text-[9px] text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("span", { className: `${mono ? "tabular-nums" : ""} text-foreground ${valueClass}`, children: value })
  ] });
}
function RpmBar({
  rpm,
  warn,
  red,
  max
}) {
  const pct = Math.max(0, Math.min(1, rpm / max));
  const warnFrac = warn / max;
  const redFrac = red / max;
  const color = rpm > red ? "bg-rose-500" : rpm > warn ? "bg-amber-400" : "bg-emerald-500";
  return /* @__PURE__ */ jsxs("div", { className: "mt-2 h-1.5 w-full overflow-hidden rounded-sm bg-muted relative", children: [
    /* @__PURE__ */ jsx("div", { className: `h-full ${color} transition-[width]`, style: {
      width: `${pct * 100}%`
    } }),
    /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 w-px bg-amber-500/50", style: {
      left: `${warnFrac * 100}%`
    } }),
    /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 w-px bg-rose-500/70", style: {
      left: `${redFrac * 100}%`
    } })
  ] });
}
function PanelHeader({
  title,
  right
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between px-1", children: [
    /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-[0.18em] text-muted-foreground", children: title }),
    right && /* @__PURE__ */ jsx("span", { className: "text-[10px] tabular-nums text-muted-foreground", children: right })
  ] });
}
function FilterControls({
  mode,
  window: win,
  onMode,
  onWindow
}) {
  const modes = [{
    k: "none",
    label: "RAW"
  }, {
    k: "ma",
    label: "MA"
  }, {
    k: "lp",
    label: "LP"
  }];
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-[10px] uppercase tracking-wider", children: [
    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Filter" }),
    /* @__PURE__ */ jsx("div", { className: "flex overflow-hidden rounded-sm border border-border-strong", children: modes.map((m) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => onMode(m.k), className: `px-2 py-0.5 ${mode === m.k ? "bg-accent text-foreground" : "bg-background text-muted-foreground hover:text-foreground"}`, children: m.label }, m.k)) }),
    mode !== "none" && /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-1.5 text-muted-foreground", children: [
      /* @__PURE__ */ jsx("span", { children: "N" }),
      /* @__PURE__ */ jsx("input", { type: "range", min: 2, max: 30, value: win, onChange: (e) => onWindow(Number(e.target.value)), className: "h-1 w-20 accent-amber-500" }),
      /* @__PURE__ */ jsx("span", { className: "w-5 text-right tabular-nums text-foreground", children: win })
    ] })
  ] });
}
function SectorPanel({
  t
}) {
  const rows = [{
    key: "s1",
    idx: 1
  }, {
    key: "s2",
    idx: 2
  }, {
    key: "s3",
    idx: 3
  }];
  return /* @__PURE__ */ jsxs("div", { className: "rounded-sm border border-border bg-background", children: [
    /* @__PURE__ */ jsx("div", { className: "border-b border-border px-2 py-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground", children: "Sectors" }),
    /* @__PURE__ */ jsx("ul", { className: "divide-y divide-border", children: rows.map(({
      key,
      idx
    }) => {
      const time = t.sectors[key];
      const isBest = t.sectors.bestSector === idx;
      return /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2 px-2 py-1.5 text-[11px]", children: [
        /* @__PURE__ */ jsx("span", { className: `size-1.5 rounded-full ${!time ? "bg-zinc-700" : isBest ? "bg-emerald-500" : "bg-rose-500"}` }),
        /* @__PURE__ */ jsxs("span", { className: "w-8 text-muted-foreground", children: [
          "S",
          idx
        ] }),
        /* @__PURE__ */ jsx("span", { className: `ml-auto tabular-nums ${isBest ? "text-emerald-400" : "text-foreground"}`, children: time ?? "--.---" })
      ] }, key);
    }) })
  ] });
}
function TirePanel({
  t
}) {
  const corners = [{
    key: "fl",
    label: "FL"
  }, {
    key: "fr",
    label: "FR"
  }, {
    key: "rl",
    label: "RL"
  }, {
    key: "rr",
    label: "RR"
  }];
  const stateColor = (s) => s === "hot" ? "text-amber-400" : s === "cold" ? "text-sky-400" : "text-emerald-400";
  return /* @__PURE__ */ jsxs("div", { className: "rounded-sm border border-border bg-background", children: [
    /* @__PURE__ */ jsx("div", { className: "border-b border-border px-2 py-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground", children: "Tyres" }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-px bg-muted", children: corners.map(({
      key,
      label
    }) => {
      const c = t.tires[key];
      return /* @__PURE__ */ jsxs("div", { className: "bg-background p-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[9px] text-muted-foreground", children: label }),
          /* @__PURE__ */ jsx("span", { className: `text-[9px] uppercase ${stateColor(c.state)}`, children: c.state })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-0.5 flex items-baseline justify-between tabular-nums", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-sm text-foreground", children: [
            Math.round(c.tempC),
            "°"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
            c.pressureBar.toFixed(2),
            " bar"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-1 h-0.5 w-full overflow-hidden rounded-sm bg-muted", children: /* @__PURE__ */ jsx("div", { className: "h-full bg-emerald-500", style: {
          width: `${Math.max(0, Math.min(100, c.wearPct))}%`
        } }) })
      ] }, key);
    }) })
  ] });
}
function FooterBar({
  t
}) {
  return /* @__PURE__ */ jsxs("footer", { className: "mt-3 flex items-center gap-4 rounded-sm border border-border bg-background px-3 py-1.5 text-[10px] text-muted-foreground", children: [
    /* @__PURE__ */ jsxs("span", { children: [
      "DRS ",
      /* @__PURE__ */ jsx("span", { className: "text-foreground", children: t.drsAvailable ? "AVAIL" : "OFF" })
    ] }),
    /* @__PURE__ */ jsxs("span", { children: [
      "BBIAS ",
      /* @__PURE__ */ jsxs("span", { className: "tabular-nums text-foreground", children: [
        t.brakeBias.toFixed(1),
        "%"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("span", { children: [
      "DIFF ",
      /* @__PURE__ */ jsxs("span", { className: "tabular-nums text-foreground", children: [
        "MAP ",
        t.diffMap
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "ml-auto flex items-center gap-4 tabular-nums", children: [
      /* @__PURE__ */ jsxs("span", { children: [
        "AIR ",
        /* @__PURE__ */ jsxs("span", { className: "text-foreground", children: [
          t.airTempC,
          "°C"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("span", { children: [
        "TRACK ",
        /* @__PURE__ */ jsxs("span", { className: "text-foreground", children: [
          t.trackTempC,
          "°C"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("span", { children: [
        "SOF ",
        /* @__PURE__ */ jsx("span", { className: "text-foreground", children: t.sof.toLocaleString() })
      ] }),
      /* @__PURE__ */ jsxs("span", { children: [
        "SR ",
        /* @__PURE__ */ jsx("span", { className: "text-foreground", children: t.safetyRating.toFixed(2) })
      ] })
    ] })
  ] });
}
function GGScatterPanel({
  samples
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 px-2 py-1 border-b border-border bg-panel-2", children: /* @__PURE__ */ jsx(PanelHeader, { title: "G-G Diagram", right: `${samples.length} pts` }) }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 min-h-0 overflow-hidden", children: /* @__PURE__ */ jsx(GGScatter, { samples }) })
  ] });
}
export {
  Dashboard as component
};
