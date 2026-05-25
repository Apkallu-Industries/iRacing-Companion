import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { syncDesktopLaps } from "@/lib/community.functions";

/**
 * Polls the local Pit Wall bridge for cached offline laps and syncs
 * any unsynced ones to Lovable Cloud. Marks them synced locally after.
 */
const BRIDGE_BASE = "http://localhost:3001";
const SYNCED_KEY = "pitwall.lapsync.synced.v1";

function loadSynced(): Set<number> {
  try {
    return new Set(JSON.parse(localStorage.getItem(SYNCED_KEY) || "[]"));
  } catch {
    return new Set();
  }
}
function saveSynced(s: Set<number>) {
  try {
    localStorage.setItem(SYNCED_KEY, JSON.stringify(Array.from(s).slice(-2000)));
  } catch {}
}

export function DesktopLapSync() {
  const sync = useServerFn(syncDesktopLaps);
  const [status, setStatus] = useState<string>("idle");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let stop = false;
    const tick = async () => {
      try {
        const res = await fetch(`${BRIDGE_BASE}/api/laps?limit=500`, { cache: "no-store" });
        if (!res.ok) return;
        const body = (await res.json()) as {
          laps: Array<{
            ts: number;
            car?: string;
            track?: string;
            lapTimeS?: number;
            fuel?: number;
            sof?: number;
          }>;
        };
        const synced = loadSynced();
        const fresh = body.laps.filter(
          (l) => l.ts && !synced.has(l.ts) && l.lapTimeS && l.lapTimeS > 0 && l.car && l.track,
        );
        if (fresh.length === 0) {
          setStatus(`cached ${body.laps.length} · synced ${synced.size}`);
          setTotal(body.laps.length);
          return;
        }
        setStatus(`syncing ${fresh.length}…`);
        const out = await sync({
          data: {
            laps: fresh.map((l) => ({
              ts: l.ts,
              car: l.car ?? null,
              track: l.track ?? null,
              lapTimeS: l.lapTimeS!,
              fuel: l.fuel ?? null,
              sof: l.sof ?? null,
            })),
          },
        });
        if ("accepted" in out) {
          for (const ts of out.accepted) synced.add(ts);
          saveSynced(synced);
          // Tell the bridge to flag them synced in the on-disk JSONL.
          fetch(`${BRIDGE_BASE}/api/laps/mark-synced`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ timestamps: out.accepted }),
          }).catch(() => {});
          setStatus(`synced ${out.inserted} · total ${synced.size}`);
        }
      } catch {
        // bridge offline — that's expected on web-only
        if (!stop) setStatus("bridge offline");
      }
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [sync]);

  return (
    <div className="rounded-sm border border-zinc-900 bg-zinc-950 px-2 py-1.5 text-[10px]">
      <div className="flex items-center justify-between">
        <span className="uppercase tracking-[0.18em] text-zinc-500">Desktop Lap Sync</span>
        <span className="text-zinc-400 tabular-nums">{status}</span>
      </div>
      {total > 0 && (
        <div className="mt-0.5 text-[9px] text-zinc-600">
          Local laps from ~/.pitwall/laps.jsonl are pushed to Cloud every 60s.
        </div>
      )}
    </div>
  );
}
