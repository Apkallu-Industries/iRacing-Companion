import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { N as useWorkbench } from "./router-D8VllJ-f.js";
import { e as exportCanvasAsPng } from "./SectorSpider-B2zpDSl9.js";
import { Eye, EyeOff, Download } from "lucide-react";
import "@tanstack/react-query";
import "@tanstack/react-router";
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
import "sonner";
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
function buildTrackGeometry(parsed) {
  const xy = parsed.trackXY;
  if (!xy) return null;
  const altCh =
    parsed.channels["Alt"] ?? parsed.channels["Altitude"] ?? parsed.channels["LapDistAlt"];
  const alt = altCh?.data;
  const cx = (xy.minX + xy.maxX) / 2;
  const cy = (xy.minY + xy.maxY) / 2;
  const span = Math.max(xy.maxX - xy.minX, xy.maxY - xy.minY) || 1;
  const scale = 100 / span;
  const n = xy.x.length;
  const step = Math.max(1, Math.floor(n / 4e3));
  const positions = [];
  let altMin = Infinity,
    altMax = -Infinity;
  if (alt) {
    for (let i = 0; i < n; i += step) {
      const a = alt[i];
      if (isFinite(a)) {
        if (a < altMin) altMin = a;
        if (a > altMax) altMax = a;
      }
    }
  }
  if (!isFinite(altMin)) {
    altMin = 0;
    altMax = 1;
  }
  const altRange = Math.max(0.5, altMax - altMin);
  const altScale = 12 / altRange;
  for (let i = 0; i < n; i += step) {
    const x = (xy.x[i] - cx) * scale;
    const z = -(xy.y[i] - cy) * scale;
    const y = alt ? (alt[i] - altMin) * altScale : 0;
    positions.push(x, y, z);
  }
  return {
    positions: new Float32Array(positions),
    step,
    scale,
    cx,
    cy,
    altMin,
    altScale,
    hasAlt: !!alt,
  };
}
function carPosition(parsed, geom, tick) {
  if (!geom || !parsed.trackXY) return [0, 0, 0];
  const xy = parsed.trackXY;
  const altCh =
    parsed.channels["Alt"] ?? parsed.channels["Altitude"] ?? parsed.channels["LapDistAlt"];
  const alt = altCh?.data;
  const i = Math.max(0, Math.min(xy.x.length - 1, tick));
  const x = (xy.x[i] - geom.cx) * geom.scale;
  const z = -(xy.y[i] - geom.cy) * geom.scale;
  const y = alt ? (alt[i] - geom.altMin) * geom.altScale : 0;
  return [x, y, z];
}
function CarMarker({ position, color }) {
  const ref = useRef(null);
  useFrame(() => {
    if (ref.current) ref.current.position.set(position[0], position[1] + 0.6, position[2]);
  });
  return /* @__PURE__ */ jsxs("mesh", {
    ref,
    children: [
      /* @__PURE__ */ jsx("coneGeometry", { args: [0.7, 1.6, 16] }),
      /* @__PURE__ */ jsx("meshStandardMaterial", {
        color,
        emissive: color,
        emissiveIntensity: 0.4,
      }),
    ],
  });
}
function TrackLine({ positions, color }) {
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);
  const material = useMemo(() => new THREE.LineBasicMaterial({ color }), [color]);
  const lineObj = useMemo(() => new THREE.Line(geom, material), [geom, material]);
  return /* @__PURE__ */ jsx("primitive", { object: lineObj });
}
function lapTickAt(parsed, lapNum, cursorTick) {
  if (lapNum == null) return cursorTick;
  const lap = parsed.laps.find((l) => l.lap === lapNum);
  if (!lap) return cursorTick;
  const pct = parsed.channels["LapDistPct"]?.data;
  if (!pct) return Math.min(lap.endTick, lap.startTick + (cursorTick - parsed.laps[0].startTick));
  const cursorPct = pct[Math.min(pct.length - 1, Math.max(0, cursorTick))];
  let bestT = lap.startTick;
  let bestD = Infinity;
  for (let t = lap.startTick; t <= lap.endTick; t += 4) {
    const d = Math.abs(pct[t] - cursorPct);
    if (d < bestD) {
      bestD = d;
      bestT = t;
    }
  }
  return bestT;
}
function ReplayThree({ parsed }) {
  const { cursorTick, refLap, cmpLap, setCursorTick } = useWorkbench();
  const [showGhost, setShowGhost] = useState(true);
  const containerRef = useRef(null);
  const geom = useMemo(() => buildTrackGeometry(parsed), [parsed]);
  if (!geom) {
    return /* @__PURE__ */ jsx("div", {
      className: "flex h-full items-center justify-center text-xs text-muted-foreground",
      children: "No position data available",
    });
  }
  const refTick = lapTickAt(parsed, refLap, cursorTick);
  const cmpTick = showGhost && cmpLap != null ? lapTickAt(parsed, cmpLap, cursorTick) : null;
  const refPos = carPosition(parsed, geom, refTick);
  const cmpPos = cmpTick != null ? carPosition(parsed, geom, cmpTick) : null;
  const refLapObj = refLap != null ? parsed.laps.find((l) => l.lap === refLap) : null;
  const sliderMin = refLapObj ? refLapObj.startTick : 0;
  const anyChannel = parsed.channelNames[0];
  const totalTicks = anyChannel ? parsed.channels[anyChannel].data.length : 0;
  const sliderMax = refLapObj ? refLapObj.endTick : Math.max(0, totalTicks - 1);
  const sliderVal = Math.max(sliderMin, Math.min(sliderMax, cursorTick));
  const handleExport = () => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (canvas) exportCanvasAsPng(canvas, "replay-3d.png");
  };
  return /* @__PURE__ */ jsxs("div", {
    className: "flex h-full flex-col",
    children: [
      /* @__PURE__ */ jsxs("div", {
        className:
          "hairline-b flex items-center justify-between gap-2 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground",
        children: [
          /* @__PURE__ */ jsxs("span", {
            children: ["3D Replay ", geom.hasAlt ? "· elevation" : "· flat (no alt channel)"],
          }),
          /* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-2",
            children: [
              cmpLap != null &&
                /* @__PURE__ */ jsxs("button", {
                  onClick: () => setShowGhost((g) => !g),
                  className: `flex h-5 items-center gap-1 rounded-sm border border-border px-1.5 text-[10px] uppercase ${showGhost ? "bg-primary text-primary-foreground" : "bg-rail text-muted-foreground hover:text-foreground"}`,
                  title: "Toggle ghost (compare lap)",
                  children: [
                    showGhost
                      ? /* @__PURE__ */ jsx(Eye, { className: "h-3 w-3" })
                      : /* @__PURE__ */ jsx(EyeOff, { className: "h-3 w-3" }),
                    " Ghost",
                  ],
                }),
              /* @__PURE__ */ jsxs("button", {
                onClick: handleExport,
                className:
                  "flex h-5 items-center gap-1 rounded-sm border border-border bg-rail px-1.5 text-[10px] uppercase text-muted-foreground hover:text-foreground",
                title: "Export PNG",
                children: [/* @__PURE__ */ jsx(Download, { className: "h-3 w-3" }), " PNG"],
              }),
            ],
          }),
        ],
      }),
      /* @__PURE__ */ jsx("div", {
        ref: containerRef,
        className: "min-h-0 flex-1",
        children: /* @__PURE__ */ jsx(Canvas, {
          camera: { position: [70, 50, 70], fov: 45 },
          dpr: [1, 1.5],
          gl: { preserveDrawingBuffer: true },
          children: /* @__PURE__ */ jsxs(Suspense, {
            fallback: null,
            children: [
              /* @__PURE__ */ jsx("color", { attach: "background", args: ["#16191d"] }),
              /* @__PURE__ */ jsx("fog", { attach: "fog", args: ["#16191d", 120, 260] }),
              /* @__PURE__ */ jsx("ambientLight", { intensity: 0.6 }),
              /* @__PURE__ */ jsx("directionalLight", { position: [40, 80, 30], intensity: 0.8 }),
              /* @__PURE__ */ jsx("gridHelper", {
                args: [200, 40, "#2a2f36", "#22262b"],
                position: [0, -0.01, 0],
              }),
              /* @__PURE__ */ jsx(TrackLine, { positions: geom.positions, color: "#7dd3fc" }),
              /* @__PURE__ */ jsx(CarMarker, { position: refPos, color: "#22d3ee" }),
              cmpPos && /* @__PURE__ */ jsx(CarMarker, { position: cmpPos, color: "#f59e0b" }),
              /* @__PURE__ */ jsx(OrbitControls, { enableDamping: true, makeDefault: true }),
            ],
          }),
        }),
      }),
      /* @__PURE__ */ jsxs("div", {
        className:
          "hairline-t flex items-center gap-2 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground",
        children: [
          /* @__PURE__ */ jsx("span", { className: "w-12", children: "Scrub" }),
          /* @__PURE__ */ jsx("input", {
            type: "range",
            min: sliderMin,
            max: sliderMax,
            value: sliderVal,
            onChange: (e) => setCursorTick(parseInt(e.target.value, 10)),
            className: "flex-1 accent-primary",
          }),
          /* @__PURE__ */ jsx("span", {
            className: "w-24 text-right tabular-nums",
            children: refLapObj
              ? `${(((sliderVal - sliderMin) / Math.max(1, sliderMax - sliderMin)) * 100).toFixed(0)}%`
              : `t=${sliderVal}`,
          }),
        ],
      }),
    ],
  });
}
export { ReplayThree };
