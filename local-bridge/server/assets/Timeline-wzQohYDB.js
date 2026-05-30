import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { N as useWorkbench } from "./router-BaRGcILm.js";
import { Pause, Play, Radio } from "lucide-react";
import "@tanstack/react-query";
import "@tanstack/react-router";
import "./charts-IpNGhCyp.js";
import "@supabase/supabase-js";
import "./tanstack-Jo4b3tUQ.js";
import "seroval";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
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
function Timeline({ parsed }) {
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
  const rafRef = useRef(null);
  const lastRef = useRef(null);
  useEffect(() => {
    if (!syncEnabled || !parsed) return;
    const st = parsed.channels["SessionTime"]?.data;
    if (!st) return;
    const sessionTimeSec = st[cursorTick];
    if (sessionTimeSec === void 0 || isNaN(sessionTimeSec)) return;
    const sn = parsed.channels["SessionNum"]?.data;
    const sessionNum = sn ? sn[cursorTick] : 0;
    const sessionTimeMS = Math.round(sessionTimeSec * 1e3);
    const timer = setTimeout(() => {
      fetch("http://localhost:3001/api/replay/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: "seek",
          sessionNum,
          sessionTimeMS
        })
      }).catch(() => {
      });
    }, 85);
    return () => clearTimeout(timer);
  }, [cursorTick, syncEnabled, parsed]);
  useEffect(() => {
    try {
      localStorage.setItem("pitwall.replaysync.enabled", String(syncEnabled));
    } catch {
    }
  }, [syncEnabled]);
  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastRef.current = null;
      return;
    }
    const step = (t) => {
      const last = lastRef.current ?? t;
      const dtMs = t - last;
      lastRef.current = t;
      const ticksAdv = dtMs / 1e3 * parsed.meta.tickRate * speed;
      const next = Math.min(total - 1, cursorTick + Math.max(1, Math.round(ticksAdv)));
      setCursorTick(next);
      if (next >= total - 1) setPlaying(false);
      else rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, speed]);
  return /* @__PURE__ */ jsxs("div", { className: "hairline-t flex items-center gap-3 bg-panel px-3 py-2", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setPlaying(!playing),
        className: "flex h-7 w-7 items-center justify-center rounded-sm bg-primary text-primary-foreground hover:opacity-90",
        children: playing ? /* @__PURE__ */ jsx(Pause, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(Play, { className: "h-3.5 w-3.5" })
      }
    ),
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setSyncEnabled(!syncEnabled),
        title: syncEnabled ? "Replay Sync: Active" : "Replay Sync: Disabled",
        className: `flex h-7 px-2.5 items-center justify-center gap-1.5 rounded-sm text-xs font-semibold tracking-wider transition-all ${syncEnabled ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)]" : "bg-muted/10 text-muted-foreground border border-border/50 hover:bg-muted/20"}`,
        children: [
          /* @__PURE__ */ jsx(Radio, { className: `h-3 w-3 ${syncEnabled ? "animate-pulse text-emerald-400" : ""}` }),
          /* @__PURE__ */ jsx("span", { children: "SIM SYNC" })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      "select",
      {
        value: speed,
        onChange: (e) => setSpeed(parseFloat(e.target.value)),
        className: "rounded-sm border border-border bg-rail px-2 py-1 font-mono text-xs",
        children: [0.25, 0.5, 1, 2, 4, 8].map((s) => /* @__PURE__ */ jsxs("option", { value: s, children: [
          s,
          "×"
        ] }, s))
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "range",
          min: 0,
          max: Math.max(0, total - 1),
          value: cursorTick,
          onChange: (e) => setCursorTick(parseInt(e.target.value, 10)),
          className: "w-full accent-[color:var(--primary)]"
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-x-0 top-1/2 h-2 -translate-y-1/2", children: parsed.laps.map((l) => /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute h-full w-px bg-muted-foreground opacity-50",
          style: { left: `${l.startTick / Math.max(1, total - 1) * 100}%` }
        },
        l.lap
      )) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "font-mono text-xs tabular-nums text-muted-foreground", children: (() => {
      const st = parsed.channels["SessionTime"]?.data;
      const t = st ? st[cursorTick] - st[0] : cursorTick / parsed.meta.tickRate;
      const lap = parsed.laps.find((l) => cursorTick >= l.startTick && cursorTick <= l.endTick);
      const m = Math.floor(t / 60);
      const s = (t - m * 60).toFixed(2).padStart(5, "0");
      return /* @__PURE__ */ jsxs(Fragment, { children: [
        lap ? `L${lap.lap} · ` : "",
        /* @__PURE__ */ jsxs("span", { className: "text-foreground", children: [
          m,
          ":",
          s
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "ml-2 opacity-60", children: [
          cursorTick,
          "/",
          total - 1
        ] })
      ] });
    })() })
  ] });
}
export {
  Timeline
};
