import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useRef, useCallback, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { A as AppHeader } from "./AppHeader-D6w9EARN.js";
import { Fingerprint, FolderUp, Download, Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { toast } from "sonner";
import { l as loadFingerprint, a as selectLapfiles, p as parseRaw, b as buildFingerprint, s as saveFingerprint, c as clearFingerprint } from "./compute-GEPYhqPD.js";
import { b as upsertFingerprint } from "./fingerprint.functions-YOm-UIzx.js";
import { J as useAuth, K as useTelemetry } from "./router-BaRGcILm.js";
import { f as formatLapTime } from "./parser-BLM9cHGX.js";
import { c as classifyCar } from "./carClass-Cyj-ZNEv.js";
import "zod";
import "@radix-ui/react-dialog";
import "class-variance-authority";
import "@radix-ui/react-scroll-area";
import "./tanstack-Jo4b3tUQ.js";
import "seroval";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./auth-middleware-xZM3BZWQ.js";
import "./tts.functions-C1mSSPGY.js";
import "./BackButton-D1X33uYM.js";
import "./useRuntimeStatus-RFAV9_LD.js";
import "@tanstack/react-query";
import "./charts-IpNGhCyp.js";
import "@supabase/supabase-js";
import "zustand";
import "zustand/middleware";
import "./schema-BU1MXGgz.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-tabs";
import "@radix-ui/react-slot";
import "./client.server-Y-0AANJ4.js";
const KEY = "apextrace.targets.v1";
function loadTargets() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function saveTargets(t) {
  try {
    localStorage.setItem(KEY, JSON.stringify(t));
  } catch {
  }
}
function pairKey(track, car) {
  return `${track}|${car}`;
}
function parseLapInput(s) {
  const t = s.trim();
  if (!t) return null;
  const m = t.match(/^(?:(\d+):)?(\d+(?:\.\d+)?)$/);
  if (!m) return null;
  const min = m[1] ? parseInt(m[1], 10) : 0;
  const sec = parseFloat(m[2]);
  const total = min * 60 + sec;
  return total >= 5 && total <= 1800 ? total : null;
}
function trendIcon(t) {
  if (t === "improving") return /* @__PURE__ */ jsx(TrendingUp, { className: "h-3 w-3 text-emerald-400" });
  if (t === "regressing") return /* @__PURE__ */ jsx(TrendingDown, { className: "h-3 w-3 text-rose-400" });
  if (t === "flat") return /* @__PURE__ */ jsx(Minus, { className: "h-3 w-3 text-muted-foreground" });
  return /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "—" });
}
function StatTile({
  label,
  value,
  sub
}) {
  return /* @__PURE__ */ jsxs("div", { className: "hairline rounded-md bg-panel p-3", children: [
    /* @__PURE__ */ jsx("div", { className: "font-mono text-[10px] uppercase tracking-wider text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("div", { className: "mt-1 font-mono text-2xl tabular-nums", children: value }),
    sub && /* @__PURE__ */ jsx("div", { className: "font-mono text-[10px] text-muted-foreground", children: sub })
  ] });
}
function scoreColor(score) {
  if (score >= 80) return "text-emerald-400";
  if (score >= 65) return "text-lime-400";
  if (score >= 50) return "text-amber-400";
  if (score >= 35) return "text-orange-400";
  return "text-rose-400";
}
function ClassScoreCard({
  c
}) {
  return /* @__PURE__ */ jsxs("div", { className: "hairline rounded-md bg-rail/30 p-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between", children: [
      /* @__PURE__ */ jsx("div", { className: "font-mono text-[12px] uppercase tracking-wider text-foreground", children: c.cls }),
      /* @__PURE__ */ jsx("div", { className: `font-mono text-2xl tabular-nums ${scoreColor(c.score)}`, children: c.score.toFixed(0) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-1 h-1 w-full overflow-hidden rounded-sm bg-rail", children: /* @__PURE__ */ jsx("div", { className: "h-full bg-primary transition-[width]", style: {
      width: `${Math.max(0, Math.min(100, c.score))}%`
    } }) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-2 grid grid-cols-3 gap-2 font-mono text-[10px] text-muted-foreground", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-muted-foreground/70", children: "Tracks" }),
        /* @__PURE__ */ jsx("div", { className: "text-foreground tabular-nums", children: c.tracks })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-muted-foreground/70", children: "Cars" }),
        /* @__PURE__ */ jsx("div", { className: "text-foreground tabular-nums", children: c.cars })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-muted-foreground/70", children: "Files" }),
        /* @__PURE__ */ jsx("div", { className: "text-foreground tabular-nums", children: c.totalFiles })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-muted-foreground/70", children: "Peak" }),
        /* @__PURE__ */ jsx("div", { className: "text-foreground tabular-nums", children: c.improvement != null ? `${(c.improvement * 100).toFixed(1)}%` : "—" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-muted-foreground/70", children: "σ" }),
        /* @__PURE__ */ jsx("div", { className: "text-foreground tabular-nums", children: c.sigma != null ? `${c.sigma.toFixed(2)}s` : "—" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "col-span-1", children: [
        /* @__PURE__ */ jsx("div", { className: "text-muted-foreground/70", children: "Best" }),
        /* @__PURE__ */ jsx("div", { className: "text-foreground tabular-nums", children: formatLapTime(c.bestPair.bestEverS) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-baseline justify-between font-mono text-[10px]", children: [
      /* @__PURE__ */ jsx("span", { className: "text-muted-foreground/70", children: "vs Target" }),
      /* @__PURE__ */ jsx("span", { className: "tabular-nums", children: c.wrPct != null ? /* @__PURE__ */ jsxs("span", { className: c.wrPct >= 99 ? "text-emerald-400" : c.wrPct >= 97 ? "text-lime-400" : c.wrPct >= 94 ? "text-amber-400" : "text-rose-400", children: [
        c.wrPct.toFixed(1),
        "%",
        /* @__PURE__ */ jsxs("span", { className: "ml-1 text-muted-foreground", children: [
          "(",
          c.targetsSet,
          " set)"
        ] })
      ] }) : /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "no targets" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-1 truncate font-mono text-[10px] text-muted-foreground", children: [
      c.bestPair.track,
      " · ",
      c.bestPair.car
    ] })
  ] });
}
function FingerprintPage() {
  const {
    user
  } = useAuth();
  const live = useTelemetry();
  const [fp, setFp] = useState(() => loadFingerprint());
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);
  const inputRef = useRef(null);
  const [targets, setTargets] = useState(() => loadTargets());
  const setTarget = useCallback((track, car, raw) => {
    setTargets((prev) => {
      const next = {
        ...prev
      };
      const k = pairKey(track, car);
      const parsed = parseLapInput(raw);
      if (parsed == null) delete next[k];
      else next[k] = parsed;
      saveTargets(next);
      return next;
    });
  }, []);
  const ingest = useCallback(async (files) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      const {
        selected,
        totalScanned
      } = selectLapfiles(files);
      if (selected.length === 0) {
        toast.error(`Scanned ${totalScanned} files but found no .olap/.blap/.plap files. Did you pick your iRacing 'lapfiles' folder?`);
        return;
      }
      setProgress({
        done: 0,
        total: selected.length,
        failed: 0
      });
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
          parsedAll.push({
            trackFolder: s.trackFolder,
            parsed
          });
        } catch {
          failed++;
        }
        if (i % 16 === 15) await new Promise((r) => setTimeout(r, 0));
        setProgress({
          done: i + 1,
          total: selected.length,
          failed
        });
      }
      if (parsedAll.length === 0) {
        toast.error("Found lapfiles but none could be parsed.");
        return;
      }
      const next = buildFingerprint(parsedAll);
      setFp(next);
      saveFingerprint(next);
      toast.success(`Fingerprint built from ${parsedAll.length} files across ${next.totalTracks} tracks${failed ? ` (${failed} skipped)` : ""}.`);
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
          const r = await upsertFingerprint({
            data: {
              pairs
            }
          });
          if (r.ok) toast.success(`Synced ${r.count ?? pairs.length} pairs to your account.`);
          else toast.error(`Sync failed: ${r.error}`);
        } catch (e) {
          toast.error(`Sync failed: ${e instanceof Error ? e.message : "unknown"}`);
        }
      } else {
        toast.message("Sign in to sync your fingerprint to the cloud and unlock live coaching.");
      }
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }, []);
  const onClear = useCallback(() => {
    clearFingerprint();
    setFp(null);
    toast.success("Fingerprint cleared.");
  }, []);
  const exportJson = useCallback(() => {
    if (!fp) return;
    const blob = new Blob([JSON.stringify(fp, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `driver-fingerprint-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [fp]);
  const sortedPairs = useMemo(() => fp ? [...fp.pairs].sort((a, b) => a.track.localeCompare(b.track) || a.car.localeCompare(b.car)) : [], [fp]);
  const classSummaries = useMemo(() => {
    if (!fp) return [];
    const buckets = /* @__PURE__ */ new Map();
    for (const p of fp.pairs) {
      const c = classifyCar(p.car);
      if (!buckets.has(c)) buckets.set(c, []);
      buckets.get(c).push(p);
    }
    const median = (xs) => {
      if (!xs.length) return 0;
      const s = [...xs].sort((a, b) => a - b);
      const m = Math.floor(s.length / 2);
      return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
    };
    const out = Array.from(buckets.entries()).map(([cls, ps]) => {
      const multi = ps.filter((p) => p.fileCount >= 2 && p.medianBestS > 0);
      const improvement = multi.length ? median(multi.map((p) => p.bestEverS / p.medianBestS)) : null;
      const sigma = multi.length ? median(multi.map((p) => p.bestStdevS)) : null;
      const tracks = new Set(ps.map((p) => p.track)).size;
      const cars = new Set(ps.map((p) => p.car)).size;
      const totalFiles = ps.reduce((a, b) => a + b.fileCount, 0);
      const impScore = improvement != null ? improvement * 100 : 50;
      const conScore = sigma != null ? Math.max(0, 100 - sigma * 100) : 50;
      const varScore = Math.min(100, tracks * 10 + cars * 5);
      const withTarget = ps.map((p) => ({
        p,
        t: targets[pairKey(p.track, p.car)]
      })).filter((x) => !!x.t && x.p.bestEverS > 0);
      const wrPct = withTarget.length ? median(withTarget.map((x) => Math.min(1, x.t / x.p.bestEverS) * 100)) : null;
      const wrScore = wrPct != null ? wrPct : 50;
      const score = +(0.4 * wrScore + 0.25 * impScore + 0.2 * conScore + 0.15 * varScore).toFixed(1);
      const bestPair = [...ps].sort((a, b) => a.bestEverS - b.bestEverS)[0];
      return {
        cls,
        pairs: ps.length,
        tracks,
        cars,
        totalFiles,
        improvement,
        sigma,
        wrPct,
        targetsSet: withTarget.length,
        score,
        bestPair
      };
    });
    return out.sort((a, b) => b.score - a.score);
  }, [fp, targets]);
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen flex-col bg-bg", children: [
    /* @__PURE__ */ jsxs(AppHeader, { children: [
      /* @__PURE__ */ jsx(Fingerprint, { className: "h-3.5 w-3.5" }),
      /* @__PURE__ */ jsx("span", { className: "font-mono uppercase tracking-wider", children: "Driver Fingerprint" }),
      /* @__PURE__ */ jsx(Link, { to: "/sessions", className: "ml-auto hover:text-foreground", children: "← Sessions" })
    ] }),
    live.connected && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 border-b border-border-strong bg-muted/50 px-4 py-1.5 font-mono text-[11px]", children: [
      /* @__PURE__ */ jsx("span", { className: "size-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" }),
      /* @__PURE__ */ jsx("span", { className: "font-bold text-emerald-400", children: "CURRENTLY DRIVING" }),
      /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "·" }),
      /* @__PURE__ */ jsx("span", { className: "text-foreground", children: live.car }),
      /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "@" }),
      /* @__PURE__ */ jsx("span", { className: "text-foreground", children: live.track }),
      fp && fp.pairs.some((p) => p.track.toLowerCase().includes(live.track.toLowerCase()) || live.track.toLowerCase().includes(p.track.toLowerCase())) ? /* @__PURE__ */ jsx("span", { className: "ml-2 rounded-sm bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-300 uppercase tracking-wider", children: "✓ Fingerprint available for this track" }) : /* @__PURE__ */ jsx("span", { className: "ml-2 rounded-sm bg-amber-500/15 px-1.5 py-0.5 text-[10px] text-amber-400 uppercase tracking-wider", children: "No baseline yet — upload lapfiles to build one" }),
      /* @__PURE__ */ jsxs("span", { className: "ml-auto text-muted-foreground", children: [
        live.fuelRemainingL.toFixed(1),
        "L · Lap Δ ",
        live.deltaSec >= 0 ? "+" : "",
        live.deltaSec.toFixed(3),
        "s"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: "w-full max-w-none px-4 md:px-12 lg:px-16 flex-1 space-y-4 p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "hairline rounded-md bg-panel p-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "font-mono text-base", children: "Build your baseline" }),
            /* @__PURE__ */ jsxs("p", { className: "mt-1 text-[12px] text-muted-foreground", children: [
              "Pick your",
              " ",
              /* @__PURE__ */ jsx("code", { className: "rounded-sm bg-rail px-1 font-mono text-[11px]", children: "Documents/iRacing/lapfiles" }),
              " ",
              "folder. We recursively scan every track sub-folder, parse all",
              " ",
              /* @__PURE__ */ jsx("code", { className: "font-mono text-[11px]", children: ".olap" }),
              " /",
              " ",
              /* @__PURE__ */ jsx("code", { className: "font-mono text-[11px]", children: ".blap" }),
              " /",
              " ",
              /* @__PURE__ */ jsx("code", { className: "font-mono text-[11px]", children: ".plap" }),
              " files in your browser, and build a per-track baseline. Nothing is uploaded."
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxs("button", { disabled: busy, onClick: () => inputRef.current?.click(), className: "flex h-9 items-center gap-2 rounded-sm border border-border bg-primary/15 px-3 font-mono text-[11px] uppercase tracking-wider text-foreground hover:bg-primary/25 disabled:opacity-50", children: [
              /* @__PURE__ */ jsx(FolderUp, { className: "h-3.5 w-3.5" }),
              fp ? "Rebuild from folder" : "Pick lapfiles folder"
            ] }),
            fp && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("button", { onClick: exportJson, className: "flex h-9 items-center gap-1.5 rounded-sm border border-border bg-rail px-2.5 font-mono text-[10px] uppercase text-muted-foreground hover:text-foreground", children: [
                /* @__PURE__ */ jsx(Download, { className: "h-3 w-3" }),
                " JSON"
              ] }),
              /* @__PURE__ */ jsxs("button", { onClick: onClear, className: "flex h-9 items-center gap-1.5 rounded-sm border border-border bg-rail px-2.5 font-mono text-[10px] uppercase text-muted-foreground hover:text-rose-400", children: [
                /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" }),
                " Clear"
              ] })
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
          ] })
        ] }),
        progress && /* @__PURE__ */ jsxs("div", { className: "mt-3 font-mono text-[11px] text-muted-foreground", children: [
          "Parsing ",
          progress.done,
          "/",
          progress.total,
          progress.failed > 0 && ` · ${progress.failed} skipped`,
          /* @__PURE__ */ jsx("div", { className: "mt-1 h-1 w-full overflow-hidden rounded-sm bg-rail", children: /* @__PURE__ */ jsx("div", { className: "h-full bg-primary transition-[width]", style: {
            width: `${progress.done / progress.total * 100}%`
          } }) })
        ] })
      ] }),
      !fp && !busy && /* @__PURE__ */ jsxs("div", { className: "hairline rounded-md bg-panel p-8 text-center", children: [
        /* @__PURE__ */ jsx(Fingerprint, { className: "mx-auto h-10 w-10 text-muted-foreground" }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 font-mono text-sm", children: "No fingerprint yet" }),
        /* @__PURE__ */ jsxs("p", { className: "mx-auto mt-2 max-w-md text-[12px] text-muted-foreground", children: [
          "Once you pick your lapfiles folder, every reference lap iRacing has saved (one per track / car combo) becomes part of your baseline. Later, when you upload an",
          " ",
          /* @__PURE__ */ jsx("code", { className: "font-mono text-[11px]", children: ".ibt" }),
          " for the same track + car, the workbench will compare it against this fingerprint to show progress."
        ] })
      ] }),
      fp && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-4", children: [
          /* @__PURE__ */ jsx(StatTile, { label: "Tracks", value: String(fp.totalTracks), sub: `${fp.totalFiles} reference files` }),
          /* @__PURE__ */ jsx(StatTile, { label: "Cars", value: String(fp.totalCars), sub: `${fp.pairs.length} track·car pairs` }),
          /* @__PURE__ */ jsx(StatTile, { label: "Self-improvement", value: fp.indices.selfImprovementIndex != null ? fp.indices.selfImprovementIndex.toFixed(4) : "—", sub: "best ÷ typical (1 = always at peak)" }),
          /* @__PURE__ */ jsx(StatTile, { label: "Consistency", value: fp.indices.consistencyIndexS != null ? `${fp.indices.consistencyIndexS.toFixed(3)} s` : "—", sub: "median best-lap σ across pairs" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-3", children: /* @__PURE__ */ jsxs("div", { className: "hairline rounded-md bg-panel p-3", children: [
          /* @__PURE__ */ jsx("div", { className: "font-mono text-[10px] uppercase tracking-wider text-muted-foreground", children: "Trajectory" }),
          fp.indices.trajectoryScore != null ? /* @__PURE__ */ jsxs("div", { className: "mt-1 font-mono text-sm", children: [
            fp.indices.trajectoryScore > 10 ? "Improving" : fp.indices.trajectoryScore < -10 ? "Regressing" : "Flat",
            " ",
            /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
              "(",
              fp.indices.trajectoryScore > 0 ? "+" : "",
              fp.indices.trajectoryScore,
              "% net)"
            ] })
          ] }) : /* @__PURE__ */ jsx("div", { className: "mt-1 text-[12px] text-muted-foreground", children: "Need at least 4 dated files per track for trend." })
        ] }) }),
        classSummaries.length > 0 && /* @__PURE__ */ jsxs("div", { className: "hairline rounded-md bg-panel", children: [
          /* @__PURE__ */ jsxs("div", { className: "hairline-b flex items-center justify-between px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground", children: [
            /* @__PURE__ */ jsx("span", { children: "Baseline score by car class" }),
            /* @__PURE__ */ jsxs("span", { children: [
              classSummaries.length,
              " classes"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3", children: classSummaries.map((c) => /* @__PURE__ */ jsx(ClassScoreCard, { c }, c.cls)) }),
          /* @__PURE__ */ jsx("div", { className: "hairline-t px-3 py-2 font-mono text-[10px] text-muted-foreground", children: "Score = 40 % WR-gap (target ÷ your best) · 25 % closeness-to-peak · 20 % consistency · 15 % variety. Set targets in the table below — paste from iRacing forums, friends' best laps, or league records." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "hairline rounded-md bg-panel", children: [
          /* @__PURE__ */ jsxs("div", { className: "hairline-b flex items-center justify-between px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground", children: [
            /* @__PURE__ */ jsx("span", { children: "Per track · car" }),
            /* @__PURE__ */ jsxs("span", { children: [
              sortedPairs.length,
              " pairs"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full border-collapse font-mono text-[11px]", children: [
            /* @__PURE__ */ jsx("thead", { className: "bg-rail/40 text-[10px] uppercase tracking-wider text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { className: "hairline-b", children: [
              /* @__PURE__ */ jsx("th", { className: "px-2 py-1.5 text-left", children: "Track" }),
              /* @__PURE__ */ jsx("th", { className: "px-2 py-1.5 text-left", children: "Car" }),
              /* @__PURE__ */ jsx("th", { className: "px-2 py-1.5 text-right", children: "Files" }),
              /* @__PURE__ */ jsx("th", { className: "px-2 py-1.5 text-right", children: "Length" }),
              /* @__PURE__ */ jsx("th", { className: "px-2 py-1.5 text-right", children: "Best" }),
              /* @__PURE__ */ jsx("th", { className: "px-2 py-1.5 text-right", children: "Median" }),
              /* @__PURE__ */ jsx("th", { className: "px-2 py-1.5 text-right", children: "σ" }),
              /* @__PURE__ */ jsx("th", { className: "px-2 py-1.5 text-right", children: "Target" }),
              /* @__PURE__ */ jsx("th", { className: "px-2 py-1.5 text-right", children: "Δ WR" }),
              /* @__PURE__ */ jsx("th", { className: "px-2 py-1.5 text-center", children: "Trend" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { children: sortedPairs.map((p, i) => {
              const t = targets[pairKey(p.track, p.car)];
              const gap = t ? p.bestEverS - t : null;
              const pct = t ? t / p.bestEverS * 100 : null;
              const isLiveMatch = live.connected && (p.track.toLowerCase().includes(live.track.toLowerCase()) || live.track.toLowerCase().includes(p.track.toLowerCase()));
              return /* @__PURE__ */ jsxs("tr", { className: `hairline-b hover:bg-accent/30 ${isLiveMatch ? "bg-emerald-500/5 ring-1 ring-inset ring-emerald-500/20" : ""}`, children: [
                /* @__PURE__ */ jsx("td", { className: "px-2 py-1 text-left", children: p.track }),
                /* @__PURE__ */ jsx("td", { className: "px-2 py-1 text-left text-muted-foreground", children: p.car }),
                /* @__PURE__ */ jsx("td", { className: "px-2 py-1 text-right tabular-nums", children: p.fileCount }),
                /* @__PURE__ */ jsx("td", { className: "px-2 py-1 text-right tabular-nums text-muted-foreground", children: p.trackLengthM > 0 ? /* @__PURE__ */ jsxs("span", { title: p.trackLengthKnown ? "Verified iRacing length" : "Approx — parsed from lapfile", children: [
                  (p.trackLengthM / 1e3).toFixed(2),
                  " km",
                  !p.trackLengthKnown && /* @__PURE__ */ jsx("span", { className: "ml-0.5 text-amber-400", children: "~" })
                ] }) : "—" }),
                /* @__PURE__ */ jsx("td", { className: "px-2 py-1 text-right tabular-nums", children: formatLapTime(p.bestEverS) }),
                /* @__PURE__ */ jsx("td", { className: "px-2 py-1 text-right tabular-nums text-muted-foreground", children: formatLapTime(p.medianBestS) }),
                /* @__PURE__ */ jsx("td", { className: "px-2 py-1 text-right tabular-nums text-muted-foreground", children: p.bestStdevS.toFixed(3) }),
                /* @__PURE__ */ jsx("td", { className: "px-2 py-1 text-right", children: /* @__PURE__ */ jsx("input", { type: "text", defaultValue: t ? formatLapTime(t) : "", placeholder: "1:23.456", onBlur: (e) => setTarget(p.track, p.car, e.target.value), onKeyDown: (e) => {
                  if (e.key === "Enter") e.target.blur();
                }, className: "w-20 rounded-sm border border-border bg-rail/50 px-1.5 py-0.5 text-right font-mono text-[11px] tabular-nums focus:border-primary focus:outline-none" }) }),
                /* @__PURE__ */ jsx("td", { className: "px-2 py-1 text-right tabular-nums", children: gap != null && pct != null ? /* @__PURE__ */ jsxs("span", { className: gap <= 0.05 ? "text-emerald-400" : gap <= 0.5 ? "text-lime-400" : gap <= 1.5 ? "text-amber-400" : "text-rose-400", children: [
                  gap > 0 ? "+" : "",
                  gap.toFixed(3),
                  "s",
                  /* @__PURE__ */ jsxs("span", { className: "ml-1 text-[10px] text-muted-foreground", children: [
                    "(",
                    pct.toFixed(1),
                    "%)"
                  ] })
                ] }) : /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "—" }) }),
                /* @__PURE__ */ jsx("td", { className: "px-2 py-1 text-center", children: trendIcon(p.trend) })
              ] }, i);
            }) })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
          "Generated ",
          new Date(fp.generatedAt).toLocaleString(),
          " · stored locally in your browser."
        ] })
      ] })
    ] })
  ] });
}
export {
  FingerprintPage as component
};
