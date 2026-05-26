import { useEffect, useRef, useState, useCallback } from "react";
import { Radar, Loader2, Volume2, ShieldAlert } from "lucide-react";
import type { Telemetry } from "@/lib/telemetry-types";
import { useAuth } from "@/lib/auth";
import { dispatchStrategyCopilot } from "@/lib/llm";
import type { StrategyCallResult } from "@/lib/strategy.functions";

export function LiveStrategy({ t }: { t: Telemetry }) {
  const { user } = useAuth();
  const [call, setCall] = useState<StrategyCallResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  const lastLapRef = useRef<string>(t.lastLap);

  const evaluateStrategy = useCallback(async () => {
    if (!t.competitors || t.competitors.length === 0 || t.myCarIdx === undefined) return;

    setLoading(true);
    try {
      const myPos = t.competitors.find((c) => c.carIdx === t.myCarIdx)?.pos ?? 0;

      const payload = {
        player: {
          position: myPos,
          lapTimeS: t.lastLap,
          fuelRemainingL: t.fuelRemainingL,
          fuelLapsEstimated: t.lapsEstimated,
          tires: t.tires,
        },
        competitors: t.competitors,
      };

      const resp = await dispatchStrategyCopilot(payload);
      if (resp.call) {
        setCall(resp.call);
        if (resp.call.alert && autoSpeak) {
          speakCall(resp.call);
        }
      }
    } catch (e) {
      console.error("Strategy Copilot error:", e);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.competitors, t.myCarIdx, t.lastLap, t.fuelRemainingL, t.lapsEstimated, t.tires, autoSpeak]);

  // Hook into lap completion
  useEffect(() => {
    if (t.lastLap !== lastLapRef.current && t.lastLap !== "--:--.---") {
      lastLapRef.current = t.lastLap;
      evaluateStrategy();
    }
  }, [t.lastLap, evaluateStrategy]);

  const speakCall = async (c: StrategyCallResult) => {
    if (speaking) return;
    setSpeaking(true);
    try {
      const text = `${c.headline}. ${c.detail}`;
      const { speak } = await import("@/lib/tts-client");
      const err = await speak(text);
      if (err) console.warn("[LiveStrategy] TTS:", err);
    } catch {
      // non-fatal
    } finally {
      setSpeaking(false);
    }
  };

  const isAlert = call?.alert;
  const isHigh = call?.urgency === "high";

  return (
    <div
      className={`bg-zinc-925 ring-1 ${isAlert ? (isHigh ? "ring-racing-red/60" : "ring-racing-orange/60") : "ring-white/5"} rounded-lg p-4`}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-zinc-300 font-medium">
          <Radar className="h-3.5 w-3.5 text-racing-orange" />
          AI Strategist
        </h2>
        <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-400">
          <label className="flex cursor-pointer items-center gap-1">
            <input
              type="checkbox"
              checked={autoSpeak}
              onChange={(e) => setAutoSpeak(e.target.checked)}
              className="h-3 w-3 accent-racing-orange"
            />
            <Volume2 className="h-3 w-3" />
            <span>Auto-speak</span>
          </label>
        </div>
      </div>

      {!call && !loading && (
        <div className="rounded-md bg-zinc-900/50 p-3 text-center text-xs text-zinc-400">
          Awaiting strategic window...
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 rounded-md bg-zinc-900/50 p-3 text-xs text-zinc-400">
          <Loader2 className="h-3 w-3 animate-spin" />
          Evaluating strategy…
        </div>
      )}

      {call && !loading && (
        <div
          className={`rounded-md p-3 ${isAlert ? (isHigh ? "bg-racing-red/15" : "bg-racing-orange/15") : "bg-zinc-900/50"}`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            {isAlert && (
              <span
                className={`flex items-center gap-1 rounded-sm px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${isHigh ? "text-racing-red" : "text-racing-orange"} bg-black/30`}
              >
                <ShieldAlert className="h-3 w-3" />
                {isHigh ? "URGENT" : "ALERT"}
              </span>
            )}
            <button
              onClick={() => speakCall(call)}
              disabled={speaking}
              className="ml-auto flex items-center gap-1 rounded-sm bg-black/30 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-200 hover:bg-black/50 disabled:opacity-40"
            >
              {speaking ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Volume2 className="h-3 w-3" />
              )}
              {speaking ? "Speaking" : "Speak"}
            </button>
          </div>
          <div
            className={`text-lg font-semibold leading-tight ${isAlert ? (isHigh ? "text-racing-red" : "text-racing-orange") : "text-zinc-300"}`}
          >
            {call.headline}
          </div>
          <div className="mt-1 text-xs text-zinc-200">{call.detail}</div>
        </div>
      )}
    </div>
  );
}
