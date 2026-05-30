import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef, useCallback, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { A as AppHeader } from "./AppHeader-B_iAqR4F.js";
import { FileText, Upload, Download } from "lucide-react";
import { p as parseLapfile, a as liveryColors, f as formatLapTime, l as lapfileToJSON } from "./parser-BLM9cHGX.js";
import { toast } from "sonner";
import "./router-D8VllJ-f.js";
import "@tanstack/react-query";
import "./charts-IpNGhCyp.js";
import "@supabase/supabase-js";
import "../server.js";
import "seroval";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "zustand";
import "zustand/middleware";
import "zod";
import "./auth-middleware-Cz-8T2yV.js";
import "./schema-BU1MXGgz.js";
import "@radix-ui/react-dialog";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-tabs";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./client.server-Y-0AANJ4.js";
import "@radix-ui/react-scroll-area";
import "./tts.functions-CbCKt0n5.js";
import "./BackButton-D1X33uYM.js";
import "./useRuntimeStatus-C58D6jGD.js";
function ColorSwatch({
  hex
}) {
  const valid = /^[0-9a-fA-F]{6}$/.test(hex);
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 font-mono text-[10px]", children: [
    /* @__PURE__ */ jsx("span", { className: "hairline inline-block h-3.5 w-3.5 rounded-sm", style: {
      background: valid ? `#${hex}` : "transparent"
    } }),
    /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
      "#",
      hex || "------"
    ] })
  ] });
}
function ChannelSpark({
  values,
  color
}) {
  const W = 360, H = 36;
  const path = useMemo(() => {
    if (values.length === 0) return "";
    let mn = Infinity, mx = -Infinity;
    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      if (Number.isFinite(v)) {
        if (v < mn) mn = v;
        if (v > mx) mx = v;
      }
    }
    if (!Number.isFinite(mn)) return "";
    const span = mx - mn || 1;
    const step = W / Math.max(1, values.length - 1);
    let d = "";
    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      const x = i * step;
      const y = H - (v - mn) / span * H;
      d += i === 0 ? `M${x.toFixed(1)} ${y.toFixed(1)}` : ` L${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return d;
  }, [values]);
  return /* @__PURE__ */ jsxs("svg", { viewBox: `0 0 ${W} ${H}`, className: "block w-full", preserveAspectRatio: "none", children: [
    /* @__PURE__ */ jsx("rect", { width: W, height: H, fill: "var(--rail)" }),
    /* @__PURE__ */ jsx("path", { d: path, fill: "none", stroke: color, strokeWidth: 1, vectorEffect: "non-scaling-stroke" })
  ] });
}
const CHANNEL_COLORS = ["var(--ch-speed)", "var(--ch-throttle)", "var(--ch-brake)", "var(--ch-rpm)", "var(--ch-gear)", "var(--ch-steer)", "var(--primary)", "var(--ch-throttle)"];
function LapfileCard({
  file
}) {
  const {
    parsed
  } = file;
  const colors = liveryColors(parsed);
  const exportJson = () => {
    const json = JSON.stringify(lapfileToJSON(parsed), null, 2);
    const blob = new Blob([json], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file.name.replace(/\.[a-z]+$/i, "")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return /* @__PURE__ */ jsxs("div", { className: "hairline rounded-md bg-panel", children: [
    /* @__PURE__ */ jsxs("div", { className: "hairline-b flex items-center justify-between gap-2 px-3 py-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx("div", { className: "truncate font-mono text-xs", children: file.name }),
        /* @__PURE__ */ jsxs("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: [
          parsed.header.magic,
          " v",
          parsed.header.version,
          " · ",
          parsed.header.trackName,
          " ·",
          " ",
          parsed.header.carShortName
        ] })
      ] }),
      /* @__PURE__ */ jsxs("button", { onClick: exportJson, className: "flex h-7 items-center gap-1.5 rounded-sm border border-border bg-rail px-2 font-mono text-[10px] uppercase text-muted-foreground hover:text-foreground", children: [
        /* @__PURE__ */ jsx(Download, { className: "h-3 w-3" }),
        "JSON"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-3 p-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: "Driver" }),
        /* @__PURE__ */ jsx("div", { className: "font-mono text-sm", children: parsed.header.driverName }),
        /* @__PURE__ */ jsxs("div", { className: "font-mono text-[10px] text-muted-foreground", children: [
          "custId ",
          parsed.header.custId,
          " · ",
          parsed.header.shortName,
          " · ",
          parsed.header.initials
        ] }),
        parsed.header.ghostDriverName && /* @__PURE__ */ jsxs("div", { className: "font-mono text-[10px] text-muted-foreground", children: [
          "ghost: ",
          parsed.header.ghostDriverName
        ] }),
        /* @__PURE__ */ jsx("div", { className: "pt-2 text-[10px] uppercase tracking-wider text-muted-foreground", children: "Season / week" }),
        /* @__PURE__ */ jsxs("div", { className: "font-mono text-xs", children: [
          "S",
          parsed.header.season,
          " W",
          parsed.header.weekOrSeries
        ] }),
        /* @__PURE__ */ jsx("div", { className: "pt-2 text-[10px] uppercase tracking-wider text-muted-foreground", children: "Build dates" }),
        /* @__PURE__ */ jsx("div", { className: "font-mono text-[10px] text-muted-foreground", children: parsed.header.buildDates.join(" · ") || "—" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: "Best lap" }),
        /* @__PURE__ */ jsx("div", { className: "font-mono text-2xl tabular-nums", children: formatLapTime(parsed.summary.bestLapS) }),
        parsed.summary.sectorTimesS.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex gap-2 font-mono text-[10px] text-muted-foreground", children: parsed.summary.sectorTimesS.map((t, i) => /* @__PURE__ */ jsxs("span", { children: [
          "S",
          i + 1,
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-foreground", children: formatLapTime(t) })
        ] }, i)) }),
        /* @__PURE__ */ jsx("div", { className: "pt-2 text-[10px] uppercase tracking-wider text-muted-foreground", children: "Track" }),
        /* @__PURE__ */ jsxs("div", { className: "font-mono text-xs", children: [
          parsed.header.trackName,
          /* @__PURE__ */ jsxs("span", { className: "ml-2 text-muted-foreground", children: [
            parsed.summary.trackLengthM.toFixed(1),
            " m"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "pt-2 text-[10px] uppercase tracking-wider text-muted-foreground", children: "Channels" }),
        /* @__PURE__ */ jsxs("div", { className: "font-mono text-xs", children: [
          parsed.summary.numChannels,
          " × ",
          parsed.summary.numBins,
          " bins"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: "Livery colors" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-1 grid grid-cols-2 gap-2 sm:grid-cols-4", children: [
          /* @__PURE__ */ jsx(ColorSwatch, { hex: colors.license }),
          colors.helmet.map((h, i) => /* @__PURE__ */ jsx(ColorSwatch, { hex: h }, `h${i}`)),
          colors.suit.map((h, i) => /* @__PURE__ */ jsx(ColorSwatch, { hex: h }, `s${i}`))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: "Channel traces" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-1 grid gap-2", children: [
          parsed.channels.map((c, i) => /* @__PURE__ */ jsxs("div", { className: "hairline rounded-sm bg-bg p-1.5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between font-mono text-[10px]", children: [
              /* @__PURE__ */ jsx("span", { style: {
                color: CHANNEL_COLORS[i % CHANNEL_COLORS.length]
              }, children: c.label }),
              /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground tabular-nums", children: [
                "min ",
                c.min.toFixed(2),
                " · max ",
                c.max.toFixed(2),
                " · μ ",
                c.mean.toFixed(2),
                " ",
                c.unit
              ] })
            ] }),
            /* @__PURE__ */ jsx(ChannelSpark, { values: c.values, color: CHANNEL_COLORS[i % CHANNEL_COLORS.length] })
          ] }, i)),
          parsed.channels.length === 0 && /* @__PURE__ */ jsx("div", { className: "px-2 py-3 text-center font-mono text-[10px] text-muted-foreground", children: "No channels decoded." })
        ] })
      ] })
    ] })
  ] });
}
function LapfileLab() {
  const [files, setFiles] = useState([]);
  const inputRef = useRef(null);
  const handleFiles = useCallback(async (fileList) => {
    if (!fileList) return;
    const next = [];
    for (const f of Array.from(fileList)) {
      try {
        const buf = await f.arrayBuffer();
        const parsed = parseLapfile(buf);
        next.push({
          name: f.name,
          parsed
        });
      } catch (e) {
        toast.error(`${f.name}: ${e.message}`);
      }
    }
    if (next.length) {
      setFiles((prev) => [...next, ...prev]);
      toast.success(`Loaded ${next.length} file${next.length === 1 ? "" : "s"}`);
    }
  }, []);
  const onDrop = useCallback((e) => {
    e.preventDefault();
    void handleFiles(e.dataTransfer.files);
  }, [handleFiles]);
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen flex-col bg-bg", children: [
    /* @__PURE__ */ jsxs(AppHeader, { children: [
      /* @__PURE__ */ jsx(FileText, { className: "h-3.5 w-3.5" }),
      /* @__PURE__ */ jsx("span", { className: "font-mono uppercase tracking-wider", children: "Lapfile Lab" }),
      /* @__PURE__ */ jsx(Link, { to: "/sessions", className: "ml-auto hover:text-foreground", children: "← Sessions" })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: "w-full max-w-none px-4 md:px-12 lg:px-16 flex-1 space-y-4 p-4", children: [
      /* @__PURE__ */ jsxs("div", { onDragOver: (e) => e.preventDefault(), onDrop, onClick: () => inputRef.current?.click(), className: "hairline cursor-pointer rounded-md border-dashed bg-panel p-8 text-center transition-colors hover:bg-accent", children: [
        /* @__PURE__ */ jsx(Upload, { className: "mx-auto h-6 w-6 text-muted-foreground" }),
        /* @__PURE__ */ jsx("div", { className: "mt-2 font-mono text-xs uppercase tracking-wider", children: "Drop .olap / .blap / .plap / .olapta / .blapta / .plapta files" }),
        /* @__PURE__ */ jsx("div", { className: "mt-1 text-[10px] text-muted-foreground", children: "Parsed entirely in your browser — nothing uploaded." }),
        /* @__PURE__ */ jsx("input", { ref: inputRef, type: "file", multiple: true, accept: ".olap,.blap,.plap,.olapta,.blapta,.plapta", className: "hidden", onChange: (e) => void handleFiles(e.target.files) })
      ] }),
      files.length > 0 && /* @__PURE__ */ jsx("div", { className: "space-y-3", children: files.map((f, i) => /* @__PURE__ */ jsx(LapfileCard, { file: f }, `${f.name}-${i}`)) })
    ] })
  ] });
}
export {
  LapfileLab as component
};
