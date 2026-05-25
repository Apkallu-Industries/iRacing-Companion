import { useEffect, useState } from "react";
import {
  getBridgePerformanceMode,
  getBridgePerformanceSnapshot,
  setBridgePerformanceMode,
  type BridgePerformanceMode,
} from "@/lib/bridgePerformance";

export function BridgePerformanceSettings() {
  const [mode, setMode] = useState<BridgePerformanceMode>("balanced60");
  const [lastFps, setLastFps] = useState<number | null>(null);
  const [recommended, setRecommended] = useState<BridgePerformanceMode>("balanced60");

  useEffect(() => {
    const m = getBridgePerformanceMode();
    const snap = getBridgePerformanceSnapshot();
    setMode(m);
    if (snap) {
      setLastFps(snap.lastFps);
      setRecommended(snap.recommendedMode);
    }
  }, []);

  const onMode = (next: BridgePerformanceMode) => {
    setMode(next);
    setBridgePerformanceMode(next);
  };

  return (
    <div className="space-y-3 text-xs">
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onMode("stable30")}
          className={`rounded-sm border px-3 py-2 text-left ${mode === "stable30" ? "border-emerald-400 bg-emerald-500/10 text-emerald-200" : "border-zinc-800 bg-zinc-900 text-zinc-300"}`}
        >
          <div className="font-mono text-[11px] uppercase tracking-wider">Stable 30Hz</div>
          <div className="mt-1 text-[11px] text-zinc-400">
            Best for weaker clients and consistent delivery.
          </div>
        </button>
        <button
          type="button"
          onClick={() => onMode("balanced60")}
          className={`rounded-sm border px-3 py-2 text-left ${mode === "balanced60" ? "border-cyan-400 bg-cyan-500/10 text-cyan-200" : "border-zinc-800 bg-zinc-900 text-zinc-300"}`}
        >
          <div className="font-mono text-[11px] uppercase tracking-wider">Balanced 60Hz</div>
          <div className="mt-1 text-[11px] text-zinc-400">
            Smoother visuals with adaptive fallback to 30Hz.
          </div>
        </button>
      </div>

      <div className="rounded-sm border border-zinc-800 bg-zinc-900/50 p-2 text-[11px] text-zinc-400">
        Last measured client FPS: <span className="text-zinc-200">{lastFps ?? "n/a"}</span>
        {" · "}
        Recommended:{" "}
        <span className="text-zinc-200">
          {recommended === "stable30" ? "Stable 30Hz" : "Balanced 60Hz"}
        </span>
        <button
          type="button"
          onClick={() => onMode(recommended)}
          className="ml-2 rounded-sm bg-zinc-800 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-200 hover:bg-zinc-700"
        >
          Apply recommendation
        </button>
      </div>
    </div>
  );
}
