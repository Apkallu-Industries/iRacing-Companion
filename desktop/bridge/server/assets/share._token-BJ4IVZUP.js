import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { u as useServerFn } from "./tanstack-Jo4b3tUQ.js";
import { Activity } from "lucide-react";
import { R as Route, N as useWorkbench } from "./router-BaRGcILm.js";
import { p as parseIbtInWorker } from "./parseInWorker-XiXcG1jn.js";
import { T as TrackMap, P as PianoRoll, S as SectorSpider, g as getSharedLap, r as refreshSharedSignedUrl } from "./SectorSpider-BJK78UEG.js";
import { ReplayThree } from "./ReplayThree-Bv8RP5Yl.js";
import { Timeline } from "./Timeline-wzQohYDB.js";
import "seroval";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "@tanstack/react-query";
import "./charts-IpNGhCyp.js";
import "@supabase/supabase-js";
import "sonner";
import "zustand";
import "zustand/middleware";
import "zod";
import "./auth-middleware-xZM3BZWQ.js";
import "./schema-BU1MXGgz.js";
import "@radix-ui/react-dialog";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-tabs";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./client.server-Y-0AANJ4.js";
import "@react-three/fiber";
import "@react-three/drei";
import "three";
function SharedLapPage() {
  const {
    token
  } = Route.useParams();
  const fetchShare = useServerFn(getSharedLap);
  const refreshUrl = useServerFn(refreshSharedSignedUrl);
  const {
    parsed,
    setParsed,
    setRefLap,
    setCmpLap,
    refLap,
    cmpLap
  } = useWorkbench();
  const [meta, setMeta] = useState(null);
  const [tab, setTab] = useState("map");
  const [progress, setProgress] = useState({
    phase: "fetch",
    pct: 0
  });
  const [err, setErr] = useState(null);
  const signedUrlRef = useRef(null);
  useEffect(() => {
    let cancelled = false;
    setParsed(null);
    setProgress({
      phase: "fetch",
      pct: 0
    });
    (async () => {
      try {
        const share = await fetchShare({
          data: {
            token
          }
        });
        if (cancelled) return;
        setMeta(share.session);
        signedUrlRef.current = share.signedUrl;
        setProgress({
          phase: "download",
          pct: 5
        });
        const res = await fetch(share.signedUrl);
        if (!res.ok) throw new Error(`Download failed (${res.status})`);
        const buf = await res.arrayBuffer();
        if (cancelled) return;
        const result = await parseIbtInWorker(buf, (phase, pct) => {
          if (!cancelled) setProgress({
            phase,
            pct: 5 + Math.floor(pct * 0.95)
          });
        });
        if (cancelled) return;
        setParsed(result);
        if (share.refLap != null) setRefLap(share.refLap);
        if (share.cmpLap != null) setCmpLap(share.cmpLap);
        setProgress(null);
      } catch (e) {
        if (!cancelled) setErr(e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, fetchShare, setParsed, setRefLap, setCmpLap]);
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const r = await refreshUrl({
          data: {
            token
          }
        });
        signedUrlRef.current = r.signedUrl;
      } catch {
      }
    }, 50 * 60 * 1e3);
    return () => clearInterval(id);
  }, [token, refreshUrl]);
  return /* @__PURE__ */ jsxs("div", { className: "flex h-screen flex-col bg-background text-foreground", children: [
    /* @__PURE__ */ jsxs("header", { className: "hairline-b flex items-center justify-between gap-4 px-4 py-2.5", children: [
      /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-7 w-7 items-center justify-center rounded-sm bg-primary text-primary-foreground", children: /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsx("span", { className: "font-mono text-sm tracking-wider", children: "PIT WALL" }),
        /* @__PURE__ */ jsx("span", { className: "rounded-sm border border-border-strong px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground", children: "Shared lap · read-only" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 font-mono text-xs", children: [
        /* @__PURE__ */ jsx("span", { className: "uppercase tracking-wider", children: meta?.track ?? "…" }),
        meta?.car && /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
          "· ",
          meta.car
        ] }),
        refLap != null && /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
          "· Ref L",
          refLap
        ] }),
        cmpLap != null && /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
          "vs L",
          cmpLap
        ] })
      ] }),
      /* @__PURE__ */ jsx(Link, { to: "/auth", className: "rounded-sm bg-primary px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-primary-foreground hover:opacity-90", children: "Open your own" })
    ] }),
    err && /* @__PURE__ */ jsx("div", { className: "bg-destructive/20 px-3 py-2 text-sm text-destructive-foreground", children: err }),
    !parsed ? /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col items-center justify-center gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "font-mono text-xs uppercase tracking-wider text-muted-foreground", children: [
        progress?.phase ?? "loading",
        " · ",
        progress?.pct ?? 0,
        "%"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "h-1 w-72 overflow-hidden rounded-full bg-rail", children: /* @__PURE__ */ jsx("div", { className: "h-full bg-primary transition-all", style: {
        width: `${progress?.pct ?? 0}%`
      } }) })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "flex min-h-0 flex-1 flex-col", children: [
      /* @__PURE__ */ jsx("div", { className: "hairline-b flex items-center gap-px bg-border font-mono text-[11px] uppercase tracking-wider", children: ["map", "3d", "piano", "spider"].map((t) => /* @__PURE__ */ jsx("button", { onClick: () => setTab(t), className: `px-4 py-2 ${tab === t ? "bg-panel text-foreground" : "bg-rail text-muted-foreground hover:text-foreground"}`, children: t === "map" ? "Track Map" : t === "3d" ? "3D Replay" : t === "piano" ? "Piano Roll" : "Sector Spider" }, t)) }),
      /* @__PURE__ */ jsxs("div", { className: "min-h-0 flex-1 bg-panel", children: [
        tab === "map" && /* @__PURE__ */ jsx(TrackMap, { parsed }),
        tab === "3d" && /* @__PURE__ */ jsx(ReplayThree, { parsed }),
        tab === "piano" && /* @__PURE__ */ jsx(PianoRoll, { parsed }),
        tab === "spider" && /* @__PURE__ */ jsx(SectorSpider, { parsed })
      ] }),
      /* @__PURE__ */ jsx(Timeline, { parsed })
    ] })
  ] });
}
export {
  SharedLapPage as component
};
