import { useEffect, useRef, useState } from "react";
import type { IbtParsed } from "@/lib/ibt/types";
import { useWorkbench } from "@/lib/store";
import { Play, Pause, Radio } from "lucide-react";

export function Timeline({ parsed }: { parsed: IbtParsed }) {
  const { cursorTick, setCursorTick, playing, setPlaying, speed, setSpeed } = useWorkbench();
  const [syncEnabled, setSyncEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem("pitwall.replaysync.enabled");
      return stored !== "false";
    } catch {
      return true;
    }
  });

  const total = parsed.meta.numTicks;
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  // Debounced Replay Sync Effect
  useEffect(() => {
    if (!syncEnabled || !parsed) return;

    const st = parsed.channels["SessionTime"]?.data;
    if (!st) return;

    const sessionTimeSec = st[cursorTick];
    if (sessionTimeSec === undefined || isNaN(sessionTimeSec)) return;

    const sn = parsed.channels["SessionNum"]?.data;
    const sessionNum = sn ? sn[cursorTick] : 0;

    // Convert to milliseconds
    const sessionTimeMS = Math.round(sessionTimeSec * 1000);

    const timer = setTimeout(() => {
      fetch("http://localhost:3001/api/replay/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: "seek",
          sessionNum,
          sessionTimeMS,
        }),
      }).catch(() => {
        // Silent catch for bridge offline / unreachable cases
      });
    }, 85);

    return () => clearTimeout(timer);
  }, [cursorTick, syncEnabled, parsed]);

  // Persist sync state
  useEffect(() => {
    try {
      localStorage.setItem("pitwall.replaysync.enabled", String(syncEnabled));
    } catch {}
  }, [syncEnabled]);

  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastRef.current = null;
      return;
    }
    const step = (t: number) => {
      const last = lastRef.current ?? t;
      const dtMs = t - last;
      lastRef.current = t;
      const ticksAdv = (dtMs / 1000) * parsed.meta.tickRate * speed;
      const next = Math.min(total - 1, cursorTick + Math.max(1, Math.round(ticksAdv)));
      setCursorTick(next);
      if (next >= total - 1) setPlaying(false);
      else rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, speed]);

  return (
    <div className="hairline-t flex items-center gap-3 bg-panel px-3 py-2">
      <button
        onClick={() => setPlaying(!playing)}
        className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary text-primary-foreground hover:opacity-90"
      >
        {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
      </button>
      <button
        onClick={() => setSyncEnabled(!syncEnabled)}
        title={syncEnabled ? "Replay Sync: Active" : "Replay Sync: Disabled"}
        className={`flex h-7 px-2.5 items-center justify-center gap-1.5 rounded-sm text-xs font-semibold tracking-wider transition-all ${
          syncEnabled
            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)]"
            : "bg-muted/10 text-muted-foreground border border-border/50 hover:bg-muted/20"
        }`}
      >
        <Radio className={`h-3 w-3 ${syncEnabled ? "animate-pulse text-emerald-400" : ""}`} />
        <span>SIM SYNC</span>
      </button>
      <select
        value={speed}
        onChange={(e) => setSpeed(parseFloat(e.target.value))}
        className="rounded-sm border border-border bg-rail px-2 py-1 font-mono text-xs"
      >
        {[0.25, 0.5, 1, 2, 4, 8].map((s) => (
          <option key={s} value={s}>
            {s}×
          </option>
        ))}
      </select>
      <div className="relative flex-1">
        <input
          type="range"
          min={0}
          max={Math.max(0, total - 1)}
          value={cursorTick}
          onChange={(e) => setCursorTick(parseInt(e.target.value, 10))}
          className="w-full accent-[color:var(--primary)]"
        />
        {/* Lap markers */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-2 -translate-y-1/2">
          {parsed.laps.map((l) => (
            <div
              key={l.lap}
              className="absolute h-full w-px bg-muted-foreground opacity-50"
              style={{ left: `${(l.startTick / Math.max(1, total - 1)) * 100}%` }}
            />
          ))}
        </div>
      </div>
      <div className="font-mono text-xs tabular-nums text-muted-foreground">
        {(() => {
          const st = parsed.channels["SessionTime"]?.data;
          const t = st ? st[cursorTick] - st[0] : cursorTick / parsed.meta.tickRate;
          const lap = parsed.laps.find((l) => cursorTick >= l.startTick && cursorTick <= l.endTick);
          const m = Math.floor(t / 60);
          const s = (t - m * 60).toFixed(2).padStart(5, "0");
          return (
            <>
              {lap ? `L${lap.lap} · ` : ""}
              <span className="text-foreground">
                {m}:{s}
              </span>
              <span className="ml-2 opacity-60">
                {cursorTick}/{total - 1}
              </span>
            </>
          );
        })()}
      </div>
    </div>
  );
}
