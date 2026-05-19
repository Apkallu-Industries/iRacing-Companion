import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import type { Sample } from "@/lib/useTelemetryBuffer";
import type { Telemetry } from "@/lib/telemetry-types";
import {
  upsertMyGearRatios,
  publishMyGearRatios,
  listCommunityGearRatios,
  voteCommunityItem,
} from "@/lib/community.functions";
import { CommunityBrowser, type CommunityRow } from "@/components/community/CommunityBrowser";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

/**
 * Gear Ratio Advisor — MoTeC-styled panel.
 *
 * Continuously estimates the effective ratio (RPM per kph) for each gear
 * from live samples, then:
 *   - shows per-gear ratio + sample count + confidence
 *   - estimates RPM-after-upshift (RPM * nextRatio / currentRatio)
 *   - flags shift NOW when rpm crosses the shift-warn threshold
 *   - suggests gap closure between adjacent ratios (too close / too wide)
 *
 * Ratios persist in localStorage keyed by car so they survive reloads.
 * Inspired by Apkallu-Industries/ratio-guide-pro.
 */

type GearStats = {
  ratio: number; // rpm per kph (engine rpm / road speed)
  samples: number;
};

type RatioCache = Record<number, GearStats>;
const STORAGE_KEY = "pitwall.gearratios.v1";
const MIN_SPEED_KPH = 30; // ignore noisy low-speed samples
const MIN_RPM = 1500;
const ALPHA = 0.05; // EMA blend for ratio refinement

function loadCache(): Record<string, RatioCache> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveCache(c: Record<string, RatioCache>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  } catch {}
}

export function GearAdvisor({ t, samples }: { t: Telemetry; samples: Sample[] }) {
  const carKey = t.car || "unknown";
  const cacheRef = useRef<Record<string, RatioCache>>({});
  const ratiosRef = useRef<RatioCache>({});
  const [browseOpen, setBrowseOpen] = useState(false);
  const [, force] = useState(0);

  const { session } = useAuth();
  const upsertCloud = useServerFn(upsertMyGearRatios);
  const publishCloud = useServerFn(publishMyGearRatios);
  const listCloud = useServerFn(listCommunityGearRatios);
  const voteCloud = useServerFn(voteCommunityItem);

  // Hydrate from storage once.
  useEffect(() => {
    cacheRef.current = loadCache();
    ratiosRef.current = cacheRef.current[carKey] || {};
  }, [carKey]);

  // Debounced cloud upsert whenever local ratios change meaningfully.
  const lastSyncRef = useRef(0);
  const syncToCloud = useCallback(() => {
    if (!session) return;
    if (!carKey || carKey === "unknown") return;
    if (Object.keys(ratiosRef.current).length === 0) return;
    const now = Date.now();
    if (now - lastSyncRef.current < 15_000) return;
    lastSyncRef.current = now;
    const ratios: Record<string, { ratio: number; samples: number }> = {};
    for (const [g, v] of Object.entries(ratiosRef.current)) ratios[g] = { ratio: v.ratio, samples: v.samples };
    upsertCloud({ data: { car: carKey, ratios } }).catch(() => {});
  }, [carKey, upsertCloud, session]);

  // Continuously refine ratios from the live telemetry.
  useEffect(() => {
    const gear = Math.round(t.gear || 0);
    const speed = t.speedKph || 0;
    const rpm = t.rpm || 0;
    if (gear < 1 || speed < MIN_SPEED_KPH || rpm < MIN_RPM) return;
    // Only refine when throttle is held (steady state) to avoid clutch slip.
    if ((t.throttle || 0) < 0.5) return;
    const r = rpm / speed;
    const prev = ratiosRef.current[gear];
    const next: GearStats = prev
      ? { ratio: prev.ratio * (1 - ALPHA) + r * ALPHA, samples: prev.samples + 1 }
      : { ratio: r, samples: 1 };
    ratiosRef.current = { ...ratiosRef.current, [gear]: next };
    cacheRef.current = { ...cacheRef.current, [carKey]: ratiosRef.current };
    // Throttle writes — every 30th sample is plenty.
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
    const warn = t.rpmShiftWarn || t.rpmMax * 0.9 || 9000;
    const red = t.rpmShiftRedline || t.rpmMax || 10000;

    const cur = ratios[gear];
    const nxt = ratios[gear + 1];
    const prv = ratios[gear - 1];

    let rpmAfterUp: number | null = null;
    let rpmAfterDown: number | null = null;
    if (cur && nxt && speed > 0) rpmAfterUp = (rpm * nxt.ratio) / cur.ratio;
    if (cur && prv && speed > 0) rpmAfterDown = (rpm * prv.ratio) / cur.ratio;

    let action: { label: string; tone: "rose" | "amber" | "emerald" | "zinc"; detail: string } = {
      label: "HOLD",
      tone: "zinc",
      detail: "in range",
    };
    if (rpm >= red) {
      action = { label: "SHIFT ↑", tone: "rose", detail: "redline" };
    } else if (rpm >= warn) {
      action = {
        label: "SHIFT ↑",
        tone: "amber",
        detail: rpmAfterUp ? `→ ${Math.round(rpmAfterUp)} rpm` : "warn zone",
      };
    } else if (rpmAfterDown && rpmAfterDown < red && rpm < warn * 0.55 && gear > 1) {
      action = {
        label: "SHIFT ↓",
        tone: "emerald",
        detail: `→ ${Math.round(rpmAfterDown)} rpm`,
      };
    }

    // Gap analysis between adjacent ratios for setup advice.
    const gaps: { from: number; to: number; pct: number }[] = [];
    const gearsKnown = Object.keys(ratios)
      .map(Number)
      .filter((g) => g >= 1)
      .sort((a, b) => a - b);
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
    if (!carKey || carKey === "unknown") return;
    // Make sure cloud has the latest before flipping the flag.
    const ratios: Record<string, { ratio: number; samples: number }> = {};
    for (const [g, v] of Object.entries(ratiosRef.current)) ratios[g] = { ratio: v.ratio, samples: v.samples };
    if (Object.keys(ratios).length === 0) {
      toast.error("No learned ratios to publish yet — drive a few laps first.");
      return;
    }
    await upsertCloud({ data: { car: carKey, ratios } });
    const out = await publishCloud({ data: { car: carKey, name: carKey, published: true } });
    if ("ok" in out && out.ok) toast.success(`Published gear ratios for ${carKey} to community.`);
    else toast.error("Publish failed.");
  };

  const onImport = (row: CommunityRow) => {
    const incoming = row.payload as Record<string, { ratio: number; samples: number }>;
    const next: RatioCache = {};
    for (const [g, v] of Object.entries(incoming)) next[Number(g)] = { ratio: v.ratio, samples: v.samples };
    ratiosRef.current = next;
    cacheRef.current = { ...cacheRef.current, [carKey]: next };
    saveCache(cacheRef.current);
    setBrowseOpen(false);
    force((x) => x + 1);
    toast.success(`Imported ${Object.keys(next).length} gears from community.`);
  };

  const loadRows = useCallback(async (): Promise<CommunityRow[]> => {
    const out = await listCloud({ data: { car: carKey } });
    return (out.rows || []).map((r: any) => ({
      id: r.id,
      user_id: r.user_id,
      votes: r.votes,
      title: r.name || r.car,
      subtitle: `${Object.keys((r.ratios as object) || {}).length} gears · ${new Date(r.updated_at).toLocaleDateString()}`,
      payload: r.ratios,
    }));
  }, [carKey, listCloud]);

  const onVote = async (row: CommunityRow) => {
    const out = await voteCloud({ data: { target_id: row.id, kind: "gear_ratios" } });
    return { votes: out.votes };
  };

  const allGears = Array.from({ length: 8 }, (_, i) => i + 1);
  const toneClass: Record<string, string> = {
    rose: "text-rose-400",
    amber: "text-amber-400",
    emerald: "text-emerald-400",
    zinc: "text-zinc-300",
  };

  return (
    <div className="rounded-sm border border-zinc-900 bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-900 px-2 py-1.5">
        <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          Gear Ratio Advisor
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setBrowseOpen(true)}
            className="rounded-sm bg-zinc-900 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-zinc-300 hover:bg-zinc-800"
            title="Browse community gear ratios for this car"
          >
            browse
          </button>
          <button
            onClick={publish}
            className="rounded-sm bg-emerald-500/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/30"
            title="Publish your learned ratios to the community"
          >
            publish
          </button>
          <button
            onClick={resetCar}
            className="text-[9px] uppercase tracking-wider text-zinc-600 hover:text-zinc-300"
            title="Clear learned ratios for this car"
          >
            reset
          </button>
        </div>
      </div>

      {/* Action header */}
      <div className="flex items-baseline justify-between gap-2 border-b border-zinc-900 px-2 py-2">
        <div>
          <div className="text-[9px] uppercase tracking-wider text-zinc-500">Action</div>
          <div className={`text-lg tabular-nums ${toneClass[advice.action.tone]}`}>
            {advice.action.label}
          </div>
          <div className="text-[9px] text-zinc-600">{advice.action.detail}</div>
        </div>
        <div className="text-right">
          <div className="text-[9px] uppercase tracking-wider text-zinc-500">Gear · RPM</div>
          <div className="text-lg tabular-nums text-zinc-200">
            {advice.gear || "—"}
            <span className="text-zinc-600"> · </span>
            {Math.round(advice.rpm)}
          </div>
          <div className="text-[9px] text-zinc-600">
            warn {Math.round(advice.warn)} · red {Math.round(advice.red)}
          </div>
        </div>
      </div>

      {/* Per-gear ratio table */}
      <div className="grid grid-cols-8 gap-px bg-zinc-900 text-[10px]">
        {allGears.map((g) => {
          const s = advice.ratios[g];
          const isCurrent = g === advice.gear;
          return (
            <div
              key={g}
              className={`bg-zinc-950 p-1.5 text-center ${
                isCurrent ? "ring-1 ring-inset ring-amber-500/60" : ""
              }`}
            >
              <div className="text-[9px] uppercase text-zinc-500">G{g}</div>
              <div
                className={`tabular-nums ${
                  s ? (isCurrent ? "text-amber-300" : "text-zinc-300") : "text-zinc-700"
                }`}
              >
                {s ? s.ratio.toFixed(2) : "—"}
              </div>
              <div className="text-[8px] text-zinc-600 tabular-nums">{s ? s.samples : 0}</div>
            </div>
          );
        })}
      </div>

      {/* Shift previews + gap advice */}
      <div className="grid grid-cols-2 gap-px bg-zinc-900 text-[11px]">
        <div className="bg-zinc-950 p-2">
          <div className="text-[9px] uppercase tracking-wider text-zinc-500">After ↑shift</div>
          <div className="tabular-nums text-zinc-300">
            {advice.rpmAfterUp ? `${Math.round(advice.rpmAfterUp)} rpm` : "—"}
          </div>
          <div className="text-[9px] text-zinc-600">
            drop{" "}
            {advice.rpmAfterUp
              ? `${Math.round(advice.rpm - advice.rpmAfterUp)}`
              : "—"}
          </div>
        </div>
        <div className="bg-zinc-950 p-2">
          <div className="text-[9px] uppercase tracking-wider text-zinc-500">After ↓shift</div>
          <div className="tabular-nums text-zinc-300">
            {advice.rpmAfterDown ? `${Math.round(advice.rpmAfterDown)} rpm` : "—"}
          </div>
          <div className="text-[9px] text-zinc-600">
            rise{" "}
            {advice.rpmAfterDown
              ? `+${Math.round(advice.rpmAfterDown - advice.rpm)}`
              : "—"}
          </div>
        </div>
      </div>

      {advice.gaps.length > 0 && (
        <div className="border-t border-zinc-900 px-2 py-1.5">
          <div className="text-[9px] uppercase tracking-wider text-zinc-500 mb-1">
            Ratio Gaps
          </div>
          <div className="grid grid-cols-1 gap-0.5 text-[10px] tabular-nums">
            {advice.gaps.map((g) => {
              const tag =
                g.pct < 12 ? "tight" : g.pct > 28 ? "wide" : "ok";
              const tagColor =
                tag === "tight"
                  ? "text-sky-400"
                  : tag === "wide"
                  ? "text-rose-400"
                  : "text-emerald-400";
              return (
                <div
                  key={`${g.from}-${g.to}`}
                  className="flex items-baseline justify-between"
                >
                  <span className="text-zinc-500">
                    G{g.from}→G{g.to}
                  </span>
                  <span className="text-zinc-300">{g.pct.toFixed(1)}%</span>
                  <span className={`uppercase text-[9px] ${tagColor}`}>{tag}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <CommunityBrowser
        open={browseOpen}
        title={`Community Gear Ratios · ${carKey}`}
        loader={loadRows}
        onImport={onImport}
        onVote={onVote}
        onClose={() => setBrowseOpen(false)}
      />
    </div>
  );
}
