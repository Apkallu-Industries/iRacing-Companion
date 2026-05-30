import { b as createServerFn, e as createSsrRpc } from "../server.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-Cz-8T2yV.js";
import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useRef, useCallback, useMemo } from "react";
import { N as useWorkbench } from "./router-D8VllJ-f.js";
import { Download, Activity, Flame, Waves, GitCompare, Minus, Plus, Maximize2 } from "lucide-react";
const createShareLink = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  sessionId: z.string().uuid(),
  refLap: z.number().int().nullable().optional(),
  cmpLap: z.number().int().nullable().optional(),
  expiresInDays: z.number().int().min(1).max(365).nullable().optional()
}).parse(input)).handler(createSsrRpc("f631e086e864b55a802d3846676e9c76d6b0d78df3ae21524dfa509bbf1a00b3"));
const revokeShareLink = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  token: z.string().min(8).max(64)
}).parse(input)).handler(createSsrRpc("fd2f68fb3471015b1d9ab8f139421cbbbc0df798ebba6872f1a3a0d195a1ca68"));
const refreshSharedSignedUrl = createServerFn({
  method: "POST"
}).inputValidator((input) => z.object({
  token: z.string().min(8).max(64)
}).parse(input)).handler(createSsrRpc("b95e7b07455f66f56ce92478f1717625e1dccf570298bb4b01e5b9406af0ffbe"));
const getSharedLap = createServerFn({
  method: "GET"
}).inputValidator((input) => z.object({
  token: z.string().min(8).max(64)
}).parse(input)).handler(createSsrRpc("036557a56b6495b1b5c08cc4f611f29aa4ea7b2c87e2456f85ff16ecf5121073"));
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1e3);
}
function inlineCssVars(svg) {
  const clone = svg.cloneNode(true);
  const computed = getComputedStyle(svg);
  const all = clone.querySelectorAll("*");
  const fixAttr = (el, attr) => {
    const v = el.getAttribute(attr);
    if (!v || !v.includes("var(")) return;
    const m = v.match(/var\((--[a-zA-Z0-9-]+)\)/);
    if (!m) return;
    const resolved = computed.getPropertyValue(m[1]).trim();
    if (resolved) el.setAttribute(attr, v.replace(m[0], resolved));
  };
  const bg = computed.getPropertyValue("--background").trim() || "#1a1d21";
  clone.setAttribute("style", `background:${bg}`);
  for (const el of [clone, ...Array.from(all)]) {
    fixAttr(el, "fill");
    fixAttr(el, "stroke");
  }
  if (!clone.getAttribute("xmlns")) clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  return new XMLSerializer().serializeToString(clone);
}
function exportSvgAsSvg(svg, filename) {
  const xml = inlineCssVars(svg);
  downloadBlob(new Blob([xml], { type: "image/svg+xml;charset=utf-8" }), filename);
}
async function exportSvgAsPng(svg, filename, scale = 2) {
  const xml = inlineCssVars(svg);
  const vb = svg.viewBox.baseVal;
  const w = vb && vb.width ? vb.width : svg.clientWidth || 800;
  const h = vb && vb.height ? vb.height : svg.clientHeight || 600;
  const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("svg load failed"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    const ctx = canvas.getContext("2d");
    const bg = getComputedStyle(svg).getPropertyValue("--background").trim() || "#1a1d21";
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    await new Promise(
      (resolve) => canvas.toBlob((b) => {
        if (b) downloadBlob(b, filename);
        resolve();
      }, "image/png")
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
function exportCanvasAsPng(canvas, filename) {
  canvas.toBlob((b) => {
    if (b) downloadBlob(b, filename);
  }, "image/png");
}
async function exportSvgGroupAsPng(svgs, filename, scale = 2, gap = 16) {
  if (svgs.length === 0) return;
  const items = svgs.map((s) => {
    const vb = s.viewBox.baseVal;
    const w = vb && vb.width ? vb.width : s.clientWidth || 300;
    const h = vb && vb.height ? vb.height : s.clientHeight || 300;
    return { svg: s, w, h, xml: inlineCssVars(s) };
  });
  const totalW = items.reduce((a, it) => a + it.w, 0) + gap * (items.length - 1);
  const maxH = items.reduce((a, it) => Math.max(a, it.h), 0);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(totalW * scale);
  canvas.height = Math.round(maxH * scale);
  const ctx = canvas.getContext("2d");
  const bg = getComputedStyle(svgs[0]).getPropertyValue("--background").trim() || "#1a1d21";
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  let xCursor = 0;
  for (const it of items) {
    const blob = new Blob([it.xml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    try {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("svg load failed"));
        img.src = url;
      });
      ctx.drawImage(img, xCursor * scale, 0, it.w * scale, it.h * scale);
    } finally {
      URL.revokeObjectURL(url);
    }
    xCursor += it.w + gap;
  }
  await new Promise(
    (resolve) => canvas.toBlob((b) => {
      if (b) downloadBlob(b, filename);
      resolve();
    }, "image/png")
  );
}
function ExportButton({ getSvg, getCanvas, filenameBase, allowSvg = true }) {
  const [open, setOpen] = useState(false);
  const handlePng = async () => {
    setOpen(false);
    if (getSvg) {
      const el = getSvg();
      if (el) await exportSvgAsPng(el, `${filenameBase}.png`);
    } else if (getCanvas) {
      const el = getCanvas();
      if (el) exportCanvasAsPng(el, `${filenameBase}.png`);
    }
  };
  const handleSvg = () => {
    setOpen(false);
    if (!getSvg) return;
    const el = getSvg();
    if (el) exportSvgAsSvg(el, `${filenameBase}.svg`);
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setOpen((o) => !o),
        className: "flex h-5 items-center gap-1 rounded-sm border border-border bg-rail px-1.5 font-mono text-[10px] uppercase text-muted-foreground hover:text-foreground",
        title: "Export view",
        children: [
          /* @__PURE__ */ jsx(Download, { className: "h-3 w-3" }),
          " Export"
        ]
      }
    ),
    open && /* @__PURE__ */ jsxs("div", { className: "absolute right-0 top-6 z-30 flex flex-col rounded-sm border border-border bg-panel py-1 shadow-lg", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handlePng,
          className: "px-3 py-1 text-left font-mono text-[11px] hover:bg-accent",
          children: "PNG"
        }
      ),
      allowSvg && getSvg && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleSvg,
          className: "px-3 py-1 text-left font-mono text-[11px] hover:bg-accent",
          children: "SVG"
        }
      )
    ] })
  ] });
}
const W = 400;
const H = 260;
const PAD = 16;
const NUM_SAMPLES = 600;
const NUM_SECTORS$1 = 3;
function buildLapsByDist(parsed, channelName) {
  const xy = parsed.trackXY;
  const lapDistPct = parsed.channels["LapDistPct"]?.data;
  if (!xy || !lapDistPct) return null;
  const channelData = channelName !== "none" && channelName !== "DeltaT" ? parsed.channels[channelName]?.data : void 0;
  const sessionTime = parsed.channels["SessionTime"]?.data;
  const speedData = parsed.channels["Speed"]?.data;
  const laps = [];
  let cMin = Infinity;
  let cMax = -Infinity;
  for (const lap of parsed.laps) {
    if (lap.endTick - lap.startTick < 60) continue;
    const x = new Float32Array(NUM_SAMPLES);
    const y = new Float32Array(NUM_SAMPLES);
    const wantC = !!channelData || channelName === "DeltaT";
    const c = new Float32Array(wantC ? NUM_SAMPLES : 0);
    const st = new Float32Array(sessionTime ? NUM_SAMPLES : 0);
    const speed = new Float32Array(speedData ? NUM_SAMPLES : 0);
    const samples = [];
    for (let t = lap.startTick; t <= lap.endTick; t++) {
      const p = lapDistPct[t];
      if (!isFinite(p)) continue;
      if (samples.length === 0 || p >= samples[samples.length - 1].pct - 0.05) {
        samples.push({ pct: Math.min(1, Math.max(0, p)), t });
      }
    }
    if (samples.length < 30) continue;
    let j = 0;
    for (let i = 0; i < NUM_SAMPLES; i++) {
      const target = i / (NUM_SAMPLES - 1);
      while (j < samples.length - 2 && samples[j + 1].pct < target) j++;
      const a = samples[j];
      const b = samples[j + 1] ?? a;
      const span = b.pct - a.pct;
      const f = span > 0 ? (target - a.pct) / span : 0;
      const ti = a.t + (b.t - a.t) * f;
      const t0 = Math.floor(ti);
      const t1 = Math.min(xy.x.length - 1, t0 + 1);
      const ff = ti - t0;
      x[i] = xy.x[t0] * (1 - ff) + xy.x[t1] * ff;
      y[i] = xy.y[t0] * (1 - ff) + xy.y[t1] * ff;
      if (channelData) {
        const v = channelData[t0] * (1 - ff) + channelData[t1] * ff;
        c[i] = v;
        if (v < cMin) cMin = v;
        if (v > cMax) cMax = v;
      }
      if (sessionTime) {
        st[i] = sessionTime[t0] * (1 - ff) + sessionTime[t1] * ff;
      }
      if (speedData) {
        speed[i] = speedData[t0] * (1 - ff) + speedData[t1] * ff;
      }
    }
    const x0 = x[0], y0 = y[0];
    for (let i = 0; i < NUM_SAMPLES; i++) {
      x[i] -= x0;
      y[i] -= y0;
    }
    laps.push({ x, y, c, lap: lap.lap, timeS: lap.timeS, st, speed });
  }
  if (!isFinite(cMin)) cMin = 0;
  if (!isFinite(cMax)) cMax = 1;
  if (cMin === cMax) cMax = cMin + 1;
  return { laps, cMin, cMax };
}
function closeLoop(x, y) {
  const n = x.length;
  const dx = x[n - 1] - x[0];
  const dy = y[n - 1] - y[0];
  const ox = new Float32Array(n);
  const oy = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const f = i / (n - 1);
    ox[i] = x[i] - dx * f;
    oy[i] = y[i] - dy * f;
  }
  return { x: ox, y: oy };
}
function averageLaps(laps) {
  if (laps.length === 0) return null;
  const n = laps[0].x.length;
  const ax = new Float32Array(n);
  const ay = new Float32Array(n);
  const ac = new Float32Array(n);
  const hasC = laps[0].c.length === n;
  const hasSpeed = laps[0].speed && laps[0].speed.length === n;
  const aspeed = new Float32Array(hasSpeed ? n : 0);
  let count = 0;
  const closedLaps = [];
  for (const lap of laps) {
    const closed = closeLoop(lap.x, lap.y);
    closedLaps.push(closed);
    for (let i = 0; i < n; i++) {
      ax[i] += closed.x[i];
      ay[i] += closed.y[i];
      if (hasC) ac[i] += lap.c[i];
      if (hasSpeed) aspeed[i] += lap.speed[i];
    }
    count++;
  }
  for (let i = 0; i < n; i++) {
    ax[i] /= count;
    ay[i] /= count;
    if (hasC) ac[i] /= count;
    if (hasSpeed) aspeed[i] /= count;
  }
  const spread = new Float32Array(n);
  const meanDev = new Float32Array(n);
  const meanHead = new Float32Array(n);
  const avgAng = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    avgAng[i] = Math.atan2(ay[j] - ay[i], ax[j] - ax[i]);
  }
  for (let i = 0; i < n; i++) {
    let sumSq = 0;
    let sumAbs = 0;
    let sumHead = 0;
    const tx = Math.cos(avgAng[i]);
    const ty = Math.sin(avgAng[i]);
    for (let k = 0; k < closedLaps.length; k++) {
      const lx = closedLaps[k].x[i] - ax[i];
      const ly = closedLaps[k].y[i] - ay[i];
      const perp = lx * -ty + ly * tx;
      sumSq += perp * perp;
      sumAbs += Math.abs(perp);
      const j = (i + 1) % n;
      const ang = Math.atan2(
        closedLaps[k].y[j] - closedLaps[k].y[i],
        closedLaps[k].x[j] - closedLaps[k].x[i]
      );
      let dh = ang - avgAng[i];
      while (dh > Math.PI) dh -= Math.PI * 2;
      while (dh < -Math.PI) dh += Math.PI * 2;
      sumHead += Math.abs(dh);
    }
    spread[i] = Math.sqrt(sumSq / closedLaps.length);
    meanDev[i] = sumAbs / closedLaps.length;
    meanHead[i] = sumHead / closedLaps.length;
  }
  return { x: ax, y: ay, c: ac, spread, meanDev, meanHead, speed: aspeed };
}
function lapSectorTimes(lap) {
  if (lap.st.length !== lap.x.length) return [null, null, null];
  const n = lap.st.length;
  const t0 = lap.st[0];
  const tMid1 = lap.st[Math.floor(n / 3)];
  const tMid2 = lap.st[Math.floor(2 * n / 3)];
  const tEnd = lap.st[n - 1];
  return [tMid1 - t0, tMid2 - tMid1, tEnd - tMid2];
}
function diffColor(t) {
  const c = Math.max(-1, Math.min(1, t));
  if (c >= 0) {
    return `oklch(${0.55 - c * 0.1} ${0.04 + c * 0.2} ${30})`;
  }
  const m = -c;
  return `oklch(${0.55 + m * 0.1} ${0.04 + m * 0.2} ${145})`;
}
function rampColor(channel, t) {
  const clamp = Math.min(1, Math.max(0, t));
  switch (channel) {
    case "Throttle":
      return `oklch(${0.25 + clamp * 0.55} ${0.05 + clamp * 0.18} 145)`;
    case "Brake":
      return `oklch(${0.4 + clamp * 0.4} ${0.02 + clamp * 0.22} 25)`;
    case "Speed":
      return `oklch(${0.45 + clamp * 0.4} ${0.18} ${250 - clamp * 200})`;
    case "RPM":
      return `oklch(${0.4 + clamp * 0.45} 0.18 ${60 - clamp * 30})`;
    case "Gear":
      return `oklch(${0.55 + clamp * 0.25} 0.16 ${200 + clamp * 100})`;
    case "DeltaT":
      return diffColor((clamp - 0.5) * 2);
    default:
      return "var(--ch-default)";
  }
}
function TrackMap({ parsed }) {
  const {
    cursorTick,
    refLap,
    cmpLap,
    mapMode,
    mapColorBy,
    setMapMode,
    setMapColorBy,
    showSectorHeat,
    showTrackBands,
    showDeviation,
    setShowSectorHeat,
    setShowTrackBands,
    setShowDeviation,
    mapThicknessBySpeed,
    setMapThicknessBySpeed
  } = useWorkbench();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef(
    null
  );
  const svgRef = useRef(null);
  const [activePan, setActivePan] = useState(false);
  const [activeZoom, setActiveZoom] = useState(false);
  const targetZoomRef = useRef(1);
  const targetPanRef = useRef({ x: 0, y: 0 });
  const animRef = useRef(null);
  const clampZoom = (z2) => Math.min(20, Math.max(1, z2));
  const clampPan = useCallback((p, currentZoom) => {
    const currentVbW = W / currentZoom;
    const currentVbH = H / currentZoom;
    const maxX = (W - currentVbW) / 2;
    const maxY = (H - currentVbH) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, p.x)),
      y: Math.max(-maxY, Math.min(maxY, p.y))
    };
  }, []);
  const animateTo = useCallback((nz, np, instant = false) => {
    const clampedZ = clampZoom(nz);
    const clampedP = clampPan(np, clampedZ);
    targetZoomRef.current = clampedZ;
    targetPanRef.current = clampedP;
    if (instant) {
      if (animRef.current !== null) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
      setZoom(clampedZ);
      setPan(clampedP);
      return;
    }
    if (animRef.current !== null) return;
    const tick = () => {
      let zDone = false;
      let pDone = false;
      setZoom((currentZ) => {
        const diffZ = targetZoomRef.current - currentZ;
        if (Math.abs(diffZ) < 1e-3) {
          zDone = true;
          return targetZoomRef.current;
        }
        return currentZ + diffZ * 0.25;
      });
      setPan((currentP) => {
        const diffX = targetPanRef.current.x - currentP.x;
        const diffY = targetPanRef.current.y - currentP.y;
        if (Math.abs(diffX) < 0.01 && Math.abs(diffY) < 0.01) {
          pDone = true;
          return targetPanRef.current;
        }
        return {
          x: currentP.x + diffX * 0.25,
          y: currentP.y + diffY * 0.25
        };
      });
      if (!zDone || !pDone) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        animRef.current = null;
      }
    };
    animRef.current = requestAnimationFrame(tick);
  }, [clampPan]);
  const reset = useCallback(() => {
    animateTo(1, { x: 0, y: 0 }, false);
  }, [animateTo]);
  const xy = parsed.trackXY;
  const built = useMemo(() => {
    if (!xy) return null;
    if (mapMode === "drift") {
      return {
        kind: "drift",
        bounds: { minX: xy.minX, maxX: xy.maxX, minY: xy.minY, maxY: xy.maxY }
      };
    }
    const lapsBuilt = buildLapsByDist(parsed, mapColorBy);
    if (!lapsBuilt || lapsBuilt.laps.length === 0) return null;
    if (mapColorBy === "DeltaT") {
      const ref = lapsBuilt.laps.find((l) => l.lap === refLap) ?? lapsBuilt.laps[0];
      if (ref && ref.st.length === ref.x.length) {
        let dMin = Infinity, dMax = -Infinity;
        const t0Ref = ref.st[0];
        for (const lap of lapsBuilt.laps) {
          if (lap.st.length !== lap.x.length || lap.c.length !== lap.x.length) continue;
          const t0Lap = lap.st[0];
          for (let i = 0; i < lap.x.length; i++) {
            const lapDt = lap.st[i] - t0Lap;
            const refDt = ref.st[i] - t0Ref;
            const d = lapDt - refDt;
            lap.c[i] = d;
            if (d < dMin) dMin = d;
            if (d > dMax) dMax = d;
          }
        }
        const m = Math.max(Math.abs(dMin), Math.abs(dMax), 0.05);
        lapsBuilt.cMin = -m;
        lapsBuilt.cMax = m;
      }
    }
    if (mapMode === "averaged") {
      const avg = averageLaps(lapsBuilt.laps);
      if (!avg) return null;
      let minX2 = Infinity, maxX2 = -Infinity, minY2 = Infinity, maxY2 = -Infinity;
      for (let i = 0; i < avg.x.length; i++) {
        if (avg.x[i] < minX2) minX2 = avg.x[i];
        if (avg.x[i] > maxX2) maxX2 = avg.x[i];
        if (avg.y[i] < minY2) minY2 = avg.y[i];
        if (avg.y[i] > maxY2) maxY2 = avg.y[i];
      }
      return {
        kind: "averaged",
        avg,
        laps: lapsBuilt.laps,
        bounds: { minX: minX2, maxX: maxX2, minY: minY2, maxY: maxY2 },
        cMin: lapsBuilt.cMin,
        cMax: lapsBuilt.cMax
      };
    }
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const closed = lapsBuilt.laps.map((l) => {
      const c = closeLoop(l.x, l.y);
      for (let i = 0; i < c.x.length; i++) {
        if (c.x[i] < minX) minX = c.x[i];
        if (c.x[i] > maxX) maxX = c.x[i];
        if (c.y[i] < minY) minY = c.y[i];
        if (c.y[i] > maxY) maxY = c.y[i];
      }
      return { x: c.x, y: c.y, c: l.c, lap: l.lap, timeS: l.timeS, st: l.st, speed: l.speed };
    });
    return {
      kind: "aligned",
      laps: closed,
      bounds: { minX, maxX, minY, maxY },
      cMin: lapsBuilt.cMin,
      cMax: lapsBuilt.cMax
    };
  }, [parsed, xy, mapMode, mapColorBy, refLap]);
  const projection = useMemo(() => {
    if (!built) return null;
    const { minX, maxX, minY, maxY } = built.bounds;
    const sx = (W - 2 * PAD) / Math.max(1, maxX - minX);
    const sy = (H - 2 * PAD) / Math.max(1, maxY - minY);
    const s = Math.min(sx, sy);
    return {
      px: (vx) => PAD + (vx - minX) * s,
      py: (vy) => H - PAD - (vy - minY) * s
    };
  }, [built]);
  const outlinePath = useMemo(() => {
    if (!xy || !projection) return "";
    const sx = (W - 2 * PAD) / Math.max(1, xy.maxX - xy.minX);
    const sy = (H - 2 * PAD) / Math.max(1, xy.maxY - xy.minY);
    const s = Math.min(sx, sy);
    const px = (i) => PAD + (xy.x[i] - xy.minX) * s;
    const py = (i) => H - PAD - (xy.y[i] - xy.minY) * s;
    const step = Math.max(1, Math.floor(xy.x.length / 1500));
    let d = `M ${px(0)} ${py(0)}`;
    for (let i = step; i < xy.x.length; i += step) d += ` L ${px(i)} ${py(i)}`;
    return d;
  }, [xy, projection]);
  const buildColoredSegments = useCallback(
    (x, y, c, cMin, cMax, speed, speedMin, speedMax) => {
      if (!projection) return [];
      const segs = [];
      const step = Math.max(1, Math.floor(x.length / 250));
      const sRange = (speedMax ?? 0) - (speedMin ?? 0);
      for (let i = 0; i < x.length - step; i += step) {
        const x0 = projection.px(x[i]);
        const y0 = projection.py(y[i]);
        const x1 = projection.px(x[i + step]);
        const y1 = projection.py(y[i + step]);
        const v = c.length ? (c[i] + c[i + step]) / 2 : 0;
        const t = (v - cMin) / Math.max(1e-6, cMax - cMin);
        let w = 1;
        if (speed && speed.length && sRange > 0) {
          const sv = (speed[i] + speed[i + step]) / 2;
          const sn = Math.max(0, Math.min(1, (sv - (speedMin ?? 0)) / sRange));
          w = 0.6 + sn * 1.2;
        }
        segs.push({ d: `M ${x0} ${y0} L ${x1} ${y1}`, color: rampColor(mapColorBy, t), w });
      }
      return segs;
    },
    [projection, mapColorBy]
  );
  if (!xy || !built || !projection) {
    return /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center text-xs text-muted-foreground", children: "No position data available" });
  }
  const dotIdx = Math.min(cursorTick, xy.x.length - 1);
  const sxOut = (W - 2 * PAD) / Math.max(1, xy.maxX - xy.minX);
  const syOut = (H - 2 * PAD) / Math.max(1, xy.maxY - xy.minY);
  const sOut = Math.min(sxOut, syOut);
  const dotX = PAD + (xy.x[dotIdx] - xy.minX) * sOut;
  const dotY = H - PAD - (xy.y[dotIdx] - xy.minY) * sOut;
  let foreground = null;
  if (built.kind === "drift") {
    const lapPath = (lapNum) => {
      if (lapNum == null) return null;
      const lap = parsed.laps.find((l) => l.lap === lapNum);
      if (!lap) return null;
      const step = Math.max(1, Math.floor(xy.x.length / 1500));
      let d = `M ${PAD + (xy.x[lap.startTick] - xy.minX) * sOut} ${H - PAD - (xy.y[lap.startTick] - xy.minY) * sOut}`;
      for (let i = lap.startTick + 1; i <= lap.endTick; i += step) {
        d += ` L ${PAD + (xy.x[i] - xy.minX) * sOut} ${H - PAD - (xy.y[i] - xy.minY) * sOut}`;
      }
      return d;
    };
    const refD = lapPath(refLap);
    const cmpD = lapPath(cmpLap);
    foreground = /* @__PURE__ */ jsxs(Fragment, { children: [
      refD && /* @__PURE__ */ jsx("path", { d: refD, fill: "none", stroke: "var(--ch-speed)", strokeWidth: 1.5 / zoom }),
      cmpD && /* @__PURE__ */ jsx(
        "path",
        {
          d: cmpD,
          fill: "none",
          stroke: "var(--ch-throttle)",
          strokeWidth: 1.5 / zoom,
          strokeDasharray: `${3 / zoom},${3 / zoom}`
        }
      )
    ] });
  } else if (built.kind === "aligned") {
    const refLapBuilt = built.laps.find((l) => l.lap === refLap) ?? built.laps[0];
    foreground = /* @__PURE__ */ jsxs(Fragment, { children: [
      built.laps.map((l) => {
        if (l.lap === refLapBuilt.lap) return null;
        let d = `M ${projection.px(l.x[0])} ${projection.py(l.y[0])}`;
        for (let i = 1; i < l.x.length; i++)
          d += ` L ${projection.px(l.x[i])} ${projection.py(l.y[i])}`;
        return /* @__PURE__ */ jsx(
          "path",
          {
            d,
            fill: "none",
            stroke: "var(--border-strong)",
            strokeWidth: 0.6 / zoom,
            opacity: 0.35
          },
          l.lap
        );
      }),
      mapColorBy === "none" ? /* @__PURE__ */ jsx(
        "path",
        {
          d: (() => {
            let d = `M ${projection.px(refLapBuilt.x[0])} ${projection.py(refLapBuilt.y[0])}`;
            for (let i = 1; i < refLapBuilt.x.length; i++)
              d += ` L ${projection.px(refLapBuilt.x[i])} ${projection.py(refLapBuilt.y[i])}`;
            return d;
          })(),
          fill: "none",
          stroke: "var(--ch-speed)",
          strokeWidth: 2 / zoom
        }
      ) : (() => {
        const sp = mapThicknessBySpeed ? refLapBuilt.speed : void 0;
        let smin = 0, smax = 0;
        if (sp && sp.length) {
          smin = Infinity;
          smax = -Infinity;
          for (let i = 0; i < sp.length; i++) {
            if (sp[i] < smin) smin = sp[i];
            if (sp[i] > smax) smax = sp[i];
          }
        }
        return buildColoredSegments(
          refLapBuilt.x,
          refLapBuilt.y,
          refLapBuilt.c,
          built.cMin,
          built.cMax,
          sp,
          smin,
          smax
        ).map((s, i) => /* @__PURE__ */ jsx(
          "path",
          {
            d: s.d,
            fill: "none",
            stroke: s.color,
            strokeWidth: 2.4 * s.w / zoom,
            strokeLinecap: "round"
          },
          i
        ));
      })()
    ] });
  } else {
    const { avg } = built;
    foreground = mapColorBy === "none" ? /* @__PURE__ */ jsx(
      "path",
      {
        d: (() => {
          let d = `M ${projection.px(avg.x[0])} ${projection.py(avg.y[0])}`;
          for (let i = 1; i < avg.x.length; i++)
            d += ` L ${projection.px(avg.x[i])} ${projection.py(avg.y[i])}`;
          return d;
        })(),
        fill: "none",
        stroke: "var(--primary)",
        strokeWidth: 2.4 / zoom
      }
    ) : (() => {
      const sp = mapThicknessBySpeed ? avg.speed : void 0;
      let smin = 0, smax = 0;
      if (sp && sp.length) {
        smin = Infinity;
        smax = -Infinity;
        for (let i = 0; i < sp.length; i++) {
          if (sp[i] < smin) smin = sp[i];
          if (sp[i] > smax) smax = sp[i];
        }
      }
      return buildColoredSegments(
        avg.x,
        avg.y,
        avg.c,
        built.cMin,
        built.cMax,
        sp,
        smin,
        smax
      ).map((s, i) => /* @__PURE__ */ jsx(
        "path",
        {
          d: s.d,
          fill: "none",
          stroke: s.color,
          strokeWidth: 2.8 * s.w / zoom,
          strokeLinecap: "round"
        },
        i
      ));
    })();
  }
  const vbW = W / zoom;
  const vbH = H / zoom;
  const vbX = (W - vbW) / 2 + pan.x;
  const vbY = (H - vbH) / 2 + pan.y;
  const onWheel = (e) => {
    if (!(e.buttons & 1)) return;
    e.preventDefault();
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const currentTargZ = targetZoomRef.current;
    const currentTargP = targetPanRef.current;
    const targVbW = W / currentTargZ;
    const targVbH = H / currentTargZ;
    const targVbX = (W - targVbW) / 2 + currentTargP.x;
    const targVbY = (H - targVbH) / 2 + currentTargP.y;
    const mx = targVbX + (e.clientX - rect.left) / rect.width * targVbW;
    const my = targVbY + (e.clientY - rect.top) / rect.height * targVbH;
    const factor = e.deltaY < 0 ? 1.2 : 1 / 1.2;
    const newZoom = clampZoom(currentTargZ * factor);
    if (newZoom === currentTargZ) return;
    setActiveZoom(true);
    if (newZoom === 1) {
      animateTo(1, { x: 0, y: 0 }, false);
    } else {
      const newVbW = W / newZoom;
      const newVbH = H / newZoom;
      const newVbX = mx - (e.clientX - rect.left) / rect.width * newVbW;
      const newVbY = my - (e.clientY - rect.top) / rect.height * newVbH;
      const newPan = { x: newVbX - (W - newVbW) / 2, y: newVbY - (H - newVbH) / 2 };
      animateTo(newZoom, newPan, false);
    }
  };
  const onPointerDown = (e) => {
    if (e.buttons === 3) {
      e.preventDefault();
      if (zoom <= 1) return;
      setActivePan(true);
      setActiveZoom(false);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (err) {
      }
      dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
    } else if (e.buttons & 1) {
      setActiveZoom(true);
      setActivePan(false);
    }
  };
  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (e.buttons === 3) {
      setActivePan(true);
      setActiveZoom(false);
    } else if (e.buttons & 1) {
      setActiveZoom(true);
      setActivePan(false);
    } else {
      setActivePan(false);
      setActiveZoom(false);
    }
    if (!d) return;
    if (e.buttons !== 3) {
      dragRef.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {
      }
      return;
    }
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const dx = (e.clientX - d.startX) / rect.width * vbW;
    const dy = (e.clientY - d.startY) / rect.height * vbH;
    animateTo(zoom, { x: d.panX - dx, y: d.panY - dy }, true);
  };
  const onPointerUp = (e) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {
    }
    dragRef.current = null;
    setActivePan(false);
    setActiveZoom(false);
  };
  const zoomBy = (factor) => {
    const nz = clampZoom(zoom * factor);
    if (nz === 1) {
      animateTo(1, { x: 0, y: 0 }, false);
    } else {
      animateTo(nz, pan, false);
    }
  };
  const colorChannel = mapColorBy !== "none" && mapColorBy !== "DeltaT" ? parsed.channels[mapColorBy] : void 0;
  const sectorOverlay = useMemo(() => {
    if (!showSectorHeat || built.kind === "drift" || !projection) return null;
    const lapsForSec = built.kind === "averaged" ? built.laps : built.laps;
    if (!lapsForSec || lapsForSec.length === 0) return null;
    const allTimes = lapsForSec.map(lapSectorTimes);
    const best = new Array(NUM_SECTORS$1).fill(Infinity);
    for (const ts of allTimes) {
      for (let s = 0; s < NUM_SECTORS$1; s++) {
        const v = ts[s];
        if (v != null && isFinite(v) && v > 0 && v < best[s]) best[s] = v;
      }
    }
    const refLapBuilt = built.kind === "averaged" ? null : built.laps.find((l) => l.lap === refLap) ?? built.laps[0];
    const path = built.kind === "averaged" ? built.avg : refLapBuilt;
    const refTimes = built.kind === "averaged" ? best : lapSectorTimes(refLapBuilt);
    const deltas = refTimes.map(
      (t, i) => t == null || !isFinite(best[i]) ? null : t - best[i]
    );
    const NORM = 0.5;
    const n = path.x.length;
    const segs = [];
    for (let s = 0; s < NUM_SECTORS$1; s++) {
      const i0 = Math.floor(s * n / NUM_SECTORS$1);
      const i1 = Math.floor((s + 1) * n / NUM_SECTORS$1);
      const d_ = deltas[s];
      if (d_ == null) continue;
      const t = Math.max(-1, Math.min(1, d_ / NORM));
      let d = `M ${projection.px(path.x[i0])} ${projection.py(path.y[i0])}`;
      for (let i = i0 + 1; i < i1; i++) {
        d += ` L ${projection.px(path.x[i])} ${projection.py(path.y[i])}`;
      }
      segs.push({ d, color: diffColor(t), sector: s });
    }
    return { segs, deltas, best };
  }, [showSectorHeat, built, projection, refLap]);
  const bandPath = useMemo(() => {
    if (!showTrackBands || built.kind !== "averaged" || !projection) return null;
    const { avg } = built;
    const n = avg.x.length;
    const innerL = [];
    const outerR = [];
    const SIGMAS = 1.2;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const tx = avg.x[j] - avg.x[i];
      const ty = avg.y[j] - avg.y[i];
      const len = Math.hypot(tx, ty) || 1;
      const nx = -ty / len;
      const ny = tx / len;
      const off = avg.spread[i] * SIGMAS;
      innerL.push({ x: avg.x[i] + nx * off, y: avg.y[i] + ny * off });
      outerR.push({ x: avg.x[i] - nx * off, y: avg.y[i] - ny * off });
    }
    let d = `M ${projection.px(innerL[0].x)} ${projection.py(innerL[0].y)}`;
    for (let i = 1; i < n; i++)
      d += ` L ${projection.px(innerL[i].x)} ${projection.py(innerL[i].y)}`;
    for (let i = n - 1; i >= 0; i--)
      d += ` L ${projection.px(outerR[i].x)} ${projection.py(outerR[i].y)}`;
    d += " Z";
    return d;
  }, [showTrackBands, built, projection]);
  const deviationOverlay = useMemo(() => {
    if (!showDeviation || built.kind !== "averaged" || !projection) return null;
    const { avg } = built;
    const n = avg.x.length;
    let maxDev = 0;
    for (let i = 0; i < n; i++) if (avg.meanDev[i] > maxDev) maxDev = avg.meanDev[i];
    const NORM = Math.max(0.5, maxDev);
    const segs = [];
    const step = Math.max(1, Math.floor(n / 250));
    for (let i = 0; i < n - step; i += step) {
      const t = avg.meanDev[i] / NORM;
      const color = `oklch(${0.7 - t * 0.2} ${0.05 + t * 0.25} 330)`;
      const d = `M ${projection.px(avg.x[i])} ${projection.py(avg.y[i])} L ${projection.px(avg.x[i + step])} ${projection.py(avg.y[i + step])}`;
      segs.push({ d, color });
    }
    let sumDev = 0, sumHead = 0;
    for (let i = 0; i < n; i++) {
      sumDev += avg.meanDev[i];
      sumHead += avg.meanHead[i];
    }
    return {
      segs,
      meanDev: sumDev / n,
      meanHeadDeg: sumHead / n * (180 / Math.PI),
      maxDev
    };
  }, [showDeviation, built, projection]);
  const sectorMarkers = useMemo(() => {
    if (!showSectorHeat || built.kind === "drift" || !projection) return null;
    const path = built.kind === "averaged" ? built.avg : built.laps.find((l) => l.lap === refLap) ?? built.laps[0];
    const n = path.x.length;
    const marks = [];
    for (let s = 0; s < NUM_SECTORS$1; s++) {
      const i = Math.floor(s * n / NUM_SECTORS$1);
      marks.push({
        cx: projection.px(path.x[i]),
        cy: projection.py(path.y[i]),
        label: `S${s + 1}`
      });
    }
    return marks;
  }, [showSectorHeat, built, projection, refLap]);
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col", children: [
    /* @__PURE__ */ jsxs("div", { className: "hairline-b flex flex-wrap items-center justify-between gap-2 px-3 py-1.5", children: [
      /* @__PURE__ */ jsxs("span", { className: "font-mono text-[11px] uppercase tracking-wider text-muted-foreground", children: [
        "Track · ",
        parsed.meta.trackDisplayName ?? parsed.meta.trackName ?? ""
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-px overflow-hidden rounded-sm border border-border", children: ["drift", "aligned", "averaged"].map((m) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setMapMode(m),
            className: `px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${mapMode === m ? "bg-primary text-primary-foreground" : "bg-rail text-muted-foreground hover:text-foreground"}`,
            title: m === "drift" ? "Raw integrated path" : m === "aligned" ? "Per-lap aligned overlay" : "Averaged stable racing line",
            children: m
          },
          m
        )) }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: mapColorBy,
            onChange: (e) => setMapColorBy(e.target.value),
            className: "rounded-sm border border-border bg-rail px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
            title: "Color racing line by channel",
            children: [
              /* @__PURE__ */ jsx("option", { value: "none", children: "No color" }),
              /* @__PURE__ */ jsx("option", { value: "Throttle", children: "Throttle" }),
              /* @__PURE__ */ jsx("option", { value: "Brake", children: "Brake" }),
              /* @__PURE__ */ jsx("option", { value: "Speed", children: "Speed" }),
              /* @__PURE__ */ jsx("option", { value: "RPM", children: "RPM" }),
              /* @__PURE__ */ jsx("option", { value: "Gear", children: "Gear" }),
              /* @__PURE__ */ jsx("option", { value: "DeltaT", children: "Δt vs ref" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-px overflow-hidden rounded-sm border border-border", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setMapThicknessBySpeed(!mapThicknessBySpeed),
              className: `flex h-5 items-center gap-1 px-1.5 font-mono text-[10px] uppercase ${mapThicknessBySpeed ? "bg-primary text-primary-foreground" : "bg-rail text-muted-foreground hover:text-foreground"}`,
              title: "Line thickness driven by speed",
              children: [
                /* @__PURE__ */ jsx(Activity, { className: "h-3 w-3" }),
                " Thick"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setShowSectorHeat(!showSectorHeat),
              className: `flex h-5 items-center gap-1 px-1.5 font-mono text-[10px] uppercase ${showSectorHeat ? "bg-primary text-primary-foreground" : "bg-rail text-muted-foreground hover:text-foreground"}`,
              title: "Sector heatmap: gain / loss vs fastest sector",
              children: [
                /* @__PURE__ */ jsx(Flame, { className: "h-3 w-3" }),
                " Heat"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setShowTrackBands(!showTrackBands),
              disabled: mapMode !== "averaged",
              className: `flex h-5 items-center gap-1 px-1.5 font-mono text-[10px] uppercase disabled:opacity-40 ${showTrackBands ? "bg-primary text-primary-foreground" : "bg-rail text-muted-foreground hover:text-foreground"}`,
              title: "Track-width bands estimated from lap-to-lap spread (averaged mode)",
              children: [
                /* @__PURE__ */ jsx(Waves, { className: "h-3 w-3" }),
                " Band"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setShowDeviation(!showDeviation),
              disabled: mapMode !== "averaged",
              className: `flex h-5 items-center gap-1 px-1.5 font-mono text-[10px] uppercase disabled:opacity-40 ${showDeviation ? "bg-primary text-primary-foreground" : "bg-rail text-muted-foreground hover:text-foreground"}`,
              title: "Deviation: average XY distance & heading error vs averaged line",
              children: [
                /* @__PURE__ */ jsx(GitCompare, { className: "h-3 w-3" }),
                " Dev"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "mr-1 font-mono text-[10px] tabular-nums text-muted-foreground", children: [
          zoom.toFixed(1),
          "×"
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => zoomBy(1 / 1.5),
            className: "flex h-5 w-5 items-center justify-center rounded-sm border border-border hover:bg-accent disabled:opacity-40",
            disabled: zoom <= 1,
            title: "Zoom out",
            children: /* @__PURE__ */ jsx(Minus, { className: "h-3 w-3" })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => zoomBy(1.5),
            className: "flex h-5 w-5 items-center justify-center rounded-sm border border-border hover:bg-accent disabled:opacity-40",
            disabled: zoom >= 20,
            title: "Zoom in",
            children: /* @__PURE__ */ jsx(Plus, { className: "h-3 w-3" })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: reset,
            className: "flex h-5 w-5 items-center justify-center rounded-sm border border-border hover:bg-accent",
            title: "Reset view",
            children: /* @__PURE__ */ jsx(Maximize2, { className: "h-3 w-3" })
          }
        ),
        /* @__PURE__ */ jsx(ExportButton, { getSvg: () => svgRef.current, filenameBase: "track-map" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "min-h-0 flex-1 overflow-hidden p-2 relative", children: [
      zoom > 1 && /* @__PURE__ */ jsxs("div", { className: "absolute top-4 left-4 pointer-events-none bg-black/85 border border-[#FFB800]/30 px-2 py-1 font-mono text-[8px] text-white space-y-0.5 rounded-none uppercase z-30 tracking-wider shadow-lg", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-4", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[#FFB800] font-bold", children: "SYSTEM MAP TRACKER" }),
          /* @__PURE__ */ jsxs("span", { className: "text-white font-black", children: [
            zoom.toFixed(2),
            "X"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-4 text-[7px] text-[#7a828c]", children: [
          /* @__PURE__ */ jsx("span", { children: "PAN COORDINATES:" }),
          /* @__PURE__ */ jsxs("span", { className: "font-bold text-white", children: [
            "X: ",
            pan.x.toFixed(1),
            " | Y: ",
            pan.y.toFixed(1)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        "svg",
        {
          ref: svgRef,
          viewBox: `${vbX} ${vbY} ${vbW} ${vbH}`,
          preserveAspectRatio: "xMidYMid meet",
          className: "block h-full w-full touch-none select-none",
          style: {
            cursor: activePan ? "grabbing" : activeZoom ? "crosshair" : zoom > 1 ? "grab" : "default"
          },
          onWheel,
          onPointerDown,
          onPointerMove,
          onPointerUp,
          onPointerCancel: onPointerUp,
          onDoubleClick: reset,
          onContextMenu: (e) => e.preventDefault(),
          children: [
            mapMode !== "averaged" && /* @__PURE__ */ jsx(
              "path",
              {
                d: outlinePath,
                fill: "none",
                stroke: "var(--border-strong)",
                strokeWidth: 1 / zoom,
                opacity: mapMode === "drift" ? 0.5 : 0.18
              }
            ),
            foreground,
            bandPath && /* @__PURE__ */ jsx(
              "path",
              {
                d: bandPath,
                fill: "var(--primary)",
                fillOpacity: 0.08,
                stroke: "var(--primary)",
                strokeOpacity: 0.25,
                strokeWidth: 0.6 / zoom
              }
            ),
            sectorOverlay && sectorOverlay.segs.map((s) => /* @__PURE__ */ jsx(
              "path",
              {
                d: s.d,
                fill: "none",
                stroke: s.color,
                strokeWidth: 4 / zoom,
                strokeLinecap: "round",
                opacity: 0.85
              },
              s.sector
            )),
            sectorMarkers && sectorMarkers.map((m, i) => /* @__PURE__ */ jsxs("g", { children: [
              /* @__PURE__ */ jsx(
                "circle",
                {
                  cx: m.cx,
                  cy: m.cy,
                  r: 3 / zoom,
                  fill: "var(--background)",
                  stroke: "var(--foreground)",
                  strokeWidth: 1 / zoom
                }
              ),
              /* @__PURE__ */ jsx(
                "text",
                {
                  x: m.cx + 5 / zoom,
                  y: m.cy - 5 / zoom,
                  fontSize: 9 / zoom,
                  fill: "var(--foreground)",
                  fontFamily: "monospace",
                  children: m.label
                }
              )
            ] }, i)),
            deviationOverlay && deviationOverlay.segs.map((s, i) => /* @__PURE__ */ jsx(
              "path",
              {
                d: s.d,
                fill: "none",
                stroke: s.color,
                strokeWidth: 2 / zoom,
                strokeLinecap: "round"
              },
              `dev-${i}`
            )),
            /* @__PURE__ */ jsx(
              "circle",
              {
                cx: dotX,
                cy: dotY,
                r: 5 / zoom,
                fill: "var(--primary)",
                stroke: "white",
                strokeWidth: 1.5 / zoom
              }
            )
          ]
        }
      )
    ] }),
    sectorOverlay && /* @__PURE__ */ jsxs("div", { className: "hairline-t flex items-center gap-3 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground", children: [
      /* @__PURE__ */ jsx("span", { children: "Sectors Δ" }),
      sectorOverlay.deltas.map((d, i) => /* @__PURE__ */ jsxs(
        "span",
        {
          className: "tabular-nums",
          style: {
            color: d == null ? void 0 : diffColor(Math.max(-1, Math.min(1, d / 0.5)))
          },
          children: [
            "S",
            i + 1,
            " ",
            d == null ? "—" : (d >= 0 ? "+" : "") + d.toFixed(3) + "s"
          ]
        },
        i
      )),
      /* @__PURE__ */ jsx("span", { className: "ml-auto text-[9px]", children: "vs best sector" })
    ] }),
    deviationOverlay && /* @__PURE__ */ jsxs("div", { className: "hairline-t flex items-center gap-3 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground", children: [
      /* @__PURE__ */ jsx("span", { children: "Dev avg" }),
      /* @__PURE__ */ jsxs("span", { className: "tabular-nums", children: [
        deviationOverlay.meanDev.toFixed(2),
        " m"
      ] }),
      /* @__PURE__ */ jsx("span", { children: "· max" }),
      /* @__PURE__ */ jsxs("span", { className: "tabular-nums", children: [
        deviationOverlay.maxDev.toFixed(2),
        " m"
      ] }),
      /* @__PURE__ */ jsx("span", { children: "· heading" }),
      /* @__PURE__ */ jsxs("span", { className: "tabular-nums", children: [
        deviationOverlay.meanHeadDeg.toFixed(2),
        "°"
      ] })
    ] }),
    mapColorBy !== "none" && built.kind !== "drift" && (colorChannel || mapColorBy === "DeltaT") && /* @__PURE__ */ jsxs("div", { className: "hairline-t flex items-center gap-2 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground", children: [
      /* @__PURE__ */ jsx("span", { children: mapColorBy === "DeltaT" ? "Δt vs ref" : mapColorBy }),
      /* @__PURE__ */ jsx("span", { className: "tabular-nums", children: mapColorBy === "DeltaT" ? `${built.cMin.toFixed(2)}s` : built.cMin.toFixed(1) }),
      /* @__PURE__ */ jsx(
        "span",
        {
          className: "h-1.5 flex-1 rounded-full",
          style: {
            background: `linear-gradient(to right, ${rampColor(mapColorBy, 0)}, ${rampColor(mapColorBy, 0.5)}, ${rampColor(mapColorBy, 1)})`
          }
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "tabular-nums", children: mapColorBy === "DeltaT" ? `+${built.cMax.toFixed(2)}s` : built.cMax.toFixed(1) }),
      colorChannel?.unit && /* @__PURE__ */ jsx("span", { children: colorChannel.unit })
    ] })
  ] });
}
const NUM_BINS = 600;
function buildStrips(parsed) {
  const pct = parsed.channels["LapDistPct"]?.data;
  const thrCh = parsed.channels["Throttle"]?.data;
  const brkCh = parsed.channels["Brake"]?.data;
  if (!pct || !thrCh || !brkCh) return [];
  const strips = [];
  for (const lap of parsed.laps) {
    if (lap.endTick - lap.startTick < 60) continue;
    const thr = new Float32Array(NUM_BINS);
    const brk = new Float32Array(NUM_BINS);
    const counts = new Uint16Array(NUM_BINS);
    for (let t = lap.startTick; t <= lap.endTick; t++) {
      const p = pct[t];
      if (!isFinite(p)) continue;
      const bin = Math.min(NUM_BINS - 1, Math.max(0, Math.floor(p * NUM_BINS)));
      thr[bin] += thrCh[t];
      brk[bin] += brkCh[t];
      counts[bin]++;
    }
    for (let i = 0; i < NUM_BINS; i++) {
      const c = counts[i] || 1;
      thr[i] = Math.max(0, Math.min(1, thr[i] / c));
      brk[i] = Math.max(0, Math.min(1, brk[i] / c));
    }
    strips.push({ lap: lap.lap, timeS: lap.timeS, thr, brk });
  }
  return strips;
}
function PianoRoll({ parsed }) {
  const { refLap } = useWorkbench();
  const [maxLaps, setMaxLaps] = useState(8);
  const svgRef = useRef(null);
  const strips = useMemo(() => buildStrips(parsed), [parsed]);
  const visible = strips.slice(0, maxLaps);
  if (visible.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center text-xs text-muted-foreground", children: "Need Throttle, Brake, and LapDistPct channels" });
  }
  const W2 = 800;
  const ROW_H = 28;
  const GAP = 4;
  const LABEL_W = 64;
  const PLOT_W = W2 - LABEL_W;
  const H2 = visible.length * (ROW_H + GAP) + 18;
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col", children: [
    /* @__PURE__ */ jsxs("div", { className: "hairline-b flex items-center justify-between px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground", children: [
      /* @__PURE__ */ jsx("span", { children: "Piano Roll · pedals across distance" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-1.5 text-[10px]", children: [
          /* @__PURE__ */ jsx("span", { children: "Laps" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              value: maxLaps,
              onChange: (e) => setMaxLaps(parseInt(e.target.value, 10)),
              className: "rounded-sm border border-border bg-rail px-1.5 py-0.5 font-mono",
              children: [4, 6, 8, 12, 20].map((n) => /* @__PURE__ */ jsx("option", { value: n, children: n }, n))
            }
          )
        ] }),
        /* @__PURE__ */ jsx(ExportButton, { getSvg: () => svgRef.current, filenameBase: "piano-roll" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "min-h-0 flex-1 overflow-auto p-2", children: /* @__PURE__ */ jsxs(
      "svg",
      {
        ref: svgRef,
        viewBox: `0 0 ${W2} ${H2}`,
        className: "block w-full",
        preserveAspectRatio: "xMidYMin meet",
        children: [
          [1 / 3, 2 / 3].map((p) => /* @__PURE__ */ jsx(
            "line",
            {
              x1: LABEL_W + PLOT_W * p,
              y1: 0,
              x2: LABEL_W + PLOT_W * p,
              y2: H2 - 18,
              stroke: "var(--border-strong)",
              strokeDasharray: "2,3",
              strokeWidth: 0.5
            },
            p
          )),
          visible.map((s, idx) => {
            const y = idx * (ROW_H + GAP);
            const isRef = s.lap === refLap;
            return /* @__PURE__ */ jsxs("g", { children: [
              /* @__PURE__ */ jsxs(
                "text",
                {
                  x: 4,
                  y: y + ROW_H / 2 + 3,
                  fontSize: 10,
                  fontFamily: "monospace",
                  fill: isRef ? "var(--primary)" : "var(--muted-foreground)",
                  children: [
                    "L",
                    s.lap,
                    " ",
                    s.timeS.toFixed(2),
                    "s"
                  ]
                }
              ),
              /* @__PURE__ */ jsx("rect", { x: LABEL_W, y, width: PLOT_W, height: ROW_H, fill: "var(--rail)" }),
              Array.from(s.thr).map((v, i) => {
                if (v < 0.02) return null;
                const bw = PLOT_W / NUM_BINS;
                const h = v * ROW_H / 2;
                return /* @__PURE__ */ jsx(
                  "rect",
                  {
                    x: LABEL_W + i * bw,
                    y: y + ROW_H / 2 - h,
                    width: bw + 0.4,
                    height: h,
                    fill: "var(--ch-throttle)",
                    opacity: 0.85
                  },
                  `t${i}`
                );
              }),
              Array.from(s.brk).map((v, i) => {
                if (v < 0.02) return null;
                const bw = PLOT_W / NUM_BINS;
                const h = v * ROW_H / 2;
                return /* @__PURE__ */ jsx(
                  "rect",
                  {
                    x: LABEL_W + i * bw,
                    y: y + ROW_H / 2,
                    width: bw + 0.4,
                    height: h,
                    fill: "var(--ch-brake)",
                    opacity: 0.85
                  },
                  `b${i}`
                );
              }),
              /* @__PURE__ */ jsx(
                "line",
                {
                  x1: LABEL_W,
                  y1: y + ROW_H / 2,
                  x2: LABEL_W + PLOT_W,
                  y2: y + ROW_H / 2,
                  stroke: "var(--border)",
                  strokeWidth: 0.5
                }
              )
            ] }, s.lap);
          }),
          /* @__PURE__ */ jsx(
            "text",
            {
              x: LABEL_W,
              y: H2 - 4,
              fontSize: 9,
              fontFamily: "monospace",
              fill: "var(--muted-foreground)",
              children: "Start"
            }
          ),
          /* @__PURE__ */ jsx(
            "text",
            {
              x: LABEL_W + PLOT_W / 3 - 8,
              y: H2 - 4,
              fontSize: 9,
              fontFamily: "monospace",
              fill: "var(--muted-foreground)",
              children: "S2"
            }
          ),
          /* @__PURE__ */ jsx(
            "text",
            {
              x: LABEL_W + 2 * PLOT_W / 3 - 8,
              y: H2 - 4,
              fontSize: 9,
              fontFamily: "monospace",
              fill: "var(--muted-foreground)",
              children: "S3"
            }
          ),
          /* @__PURE__ */ jsx(
            "text",
            {
              x: LABEL_W + PLOT_W - 24,
              y: H2 - 4,
              fontSize: 9,
              fontFamily: "monospace",
              fill: "var(--muted-foreground)",
              children: "Finish"
            }
          )
        ]
      }
    ) })
  ] });
}
const NUM_SECTORS = 3;
function lapSectorMetrics(parsed, lapNum) {
  const lap = parsed.laps.find((l) => l.lap === lapNum);
  if (!lap) return null;
  const pct = parsed.channels["LapDistPct"]?.data;
  const speed = parsed.channels["Speed"]?.data;
  const thr = parsed.channels["Throttle"]?.data;
  const brk = parsed.channels["Brake"]?.data;
  const longG = parsed.channels["LongAccel"]?.data;
  const steer = parsed.channels["SteeringWheelAngle"]?.data;
  if (!pct || !speed) return null;
  const out = [];
  for (let s = 0; s < NUM_SECTORS; s++) {
    const lo = s / NUM_SECTORS;
    const hi = (s + 1) / NUM_SECTORS;
    let entry = NaN, exit = NaN, vmin = Infinity;
    let peakBrakeG = 0;
    let thrOn = 0, thrTotal = 0;
    const steerVals = [];
    for (let t = lap.startTick; t <= lap.endTick; t++) {
      const p = pct[t];
      if (!isFinite(p) || p < lo || p >= hi) continue;
      const v = speed[t];
      if (isFinite(v)) {
        if (isNaN(entry)) entry = v;
        exit = v;
        if (v < vmin) vmin = v;
      }
      if (longG && brk && brk[t] > 0.05) {
        const g = Math.abs(longG[t]);
        if (g > peakBrakeG) peakBrakeG = g;
      }
      if (thr) {
        thrTotal++;
        if (thr[t] > 0.5) thrOn++;
      }
      if (steer) steerVals.push(steer[t]);
    }
    let smooth = 1;
    if (steerVals.length > 4) {
      let sumSq = 0;
      for (let i = 1; i < steerVals.length; i++) {
        const d = steerVals[i] - steerVals[i - 1];
        sumSq += d * d;
      }
      const rms = Math.sqrt(sumSq / (steerVals.length - 1));
      smooth = Math.max(0, Math.min(1, 1 - rms / 0.05));
    }
    out.push({
      entrySpeed: isFinite(entry) ? entry : 0,
      minSpeed: isFinite(vmin) ? vmin : 0,
      exitSpeed: isFinite(exit) ? exit : 0,
      brakeG: peakBrakeG,
      throttleOnPct: thrTotal > 0 ? thrOn / thrTotal : 0,
      steerSmoothness: smooth
    });
  }
  return out;
}
const AXES = [
  { key: "entrySpeed", label: "Entry V" },
  { key: "minSpeed", label: "Min V" },
  { key: "exitSpeed", label: "Exit V" },
  { key: "brakeG", label: "Brake G" },
  { key: "throttleOnPct", label: "Thr On" },
  { key: "steerSmoothness", label: "Smooth" }
];
function normalize(value, axis, scale) {
  return scale[axis] > 0 ? Math.max(0, Math.min(1, value / scale[axis])) : 0;
}
function SectorSpider({ parsed }) {
  const { refLap, cmpLap } = useWorkbench();
  const containerRef = useRef(null);
  const ref = useMemo(
    () => refLap != null ? lapSectorMetrics(parsed, refLap) : null,
    [parsed, refLap]
  );
  const cmp = useMemo(
    () => cmpLap != null ? lapSectorMetrics(parsed, cmpLap) : null,
    [parsed, cmpLap]
  );
  if (!ref) {
    return /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center text-xs text-muted-foreground", children: "Pick a reference lap" });
  }
  const scale = {};
  for (const a of AXES) {
    let m = 0;
    for (const set of [ref, cmp].filter(Boolean)) {
      for (const sec of set) {
        const v = sec[a.key];
        if (v > m) m = v;
      }
    }
    scale[a.key] = m || 1;
  }
  const W2 = 280;
  const cx = W2 / 2;
  const cy = W2 / 2;
  const R = W2 / 2 - 28;
  const polygonForSector = (m) => {
    return AXES.map((a, i) => {
      const v = normalize(m[a.key], a.key, scale);
      const ang = -Math.PI / 2 + i * 2 * Math.PI / AXES.length;
      return [cx + Math.cos(ang) * R * v, cy + Math.sin(ang) * R * v];
    });
  };
  const sectorColors = ["var(--ch-speed)", "var(--ch-throttle)", "var(--ch-brake)"];
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col", children: [
    /* @__PURE__ */ jsxs("div", { className: "hairline-b flex items-center justify-between px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground", children: [
      /* @__PURE__ */ jsx("span", { children: "Sector Spider" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-[10px]", children: [
          "ref L",
          refLap,
          cmpLap != null && ` · cmp L${cmpLap} (dashed)`
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
              const svgs = containerRef.current ? Array.from(containerRef.current.querySelectorAll("svg")) : [];
              if (svgs.length) exportSvgGroupAsPng(svgs, "sector-spider.png");
            },
            className: "flex h-5 items-center gap-1 rounded-sm border border-border bg-rail px-1.5 font-mono text-[10px] uppercase text-muted-foreground hover:text-foreground",
            title: "Export PNG",
            children: [
              /* @__PURE__ */ jsx(Download, { className: "h-3 w-3" }),
              " PNG"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { ref: containerRef, className: "min-h-0 flex-1 overflow-auto p-2", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-2", children: ref.map((sec, sIdx) => {
      const refPts = polygonForSector(sec);
      const cmpPts = cmp?.[sIdx] ? polygonForSector(cmp[sIdx]) : null;
      return /* @__PURE__ */ jsxs("div", { className: "hairline rounded-sm bg-rail/40 p-1", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground", children: [
          "Sector ",
          sIdx + 1
        ] }),
        /* @__PURE__ */ jsxs("svg", { viewBox: `0 0 ${W2} ${W2}`, className: "block h-auto w-full", children: [
          [0.25, 0.5, 0.75, 1].map((r) => /* @__PURE__ */ jsx(
            "polygon",
            {
              points: AXES.map((_, i) => {
                const ang = -Math.PI / 2 + i * 2 * Math.PI / AXES.length;
                return `${cx + Math.cos(ang) * R * r},${cy + Math.sin(ang) * R * r}`;
              }).join(" "),
              fill: "none",
              stroke: "var(--border)",
              strokeWidth: 0.5,
              opacity: 0.6
            },
            r
          )),
          AXES.map((a, i) => {
            const ang = -Math.PI / 2 + i * 2 * Math.PI / AXES.length;
            const lx = cx + Math.cos(ang) * (R + 14);
            const ly = cy + Math.sin(ang) * (R + 14);
            return /* @__PURE__ */ jsxs("g", { children: [
              /* @__PURE__ */ jsx(
                "line",
                {
                  x1: cx,
                  y1: cy,
                  x2: cx + Math.cos(ang) * R,
                  y2: cy + Math.sin(ang) * R,
                  stroke: "var(--border-strong)",
                  strokeWidth: 0.5,
                  opacity: 0.5
                }
              ),
              /* @__PURE__ */ jsx(
                "text",
                {
                  x: lx,
                  y: ly,
                  fontSize: 9,
                  textAnchor: "middle",
                  dominantBaseline: "middle",
                  fontFamily: "monospace",
                  fill: "var(--muted-foreground)",
                  children: a.label
                }
              )
            ] }, a.key);
          }),
          /* @__PURE__ */ jsx(
            "polygon",
            {
              points: refPts.map((p) => p.join(",")).join(" "),
              fill: sectorColors[sIdx],
              fillOpacity: 0.18,
              stroke: sectorColors[sIdx],
              strokeWidth: 1.5
            }
          ),
          cmpPts && /* @__PURE__ */ jsx(
            "polygon",
            {
              points: cmpPts.map((p) => p.join(",")).join(" "),
              fill: "var(--ch-throttle)",
              fillOpacity: 0.08,
              stroke: "var(--ch-throttle)",
              strokeWidth: 1.2,
              strokeDasharray: "3,3"
            }
          )
        ] })
      ] }, sIdx);
    }) }) })
  ] });
}
export {
  PianoRoll as P,
  SectorSpider as S,
  TrackMap as T,
  revokeShareLink as a,
  createShareLink as c,
  exportCanvasAsPng as e,
  getSharedLap as g,
  refreshSharedSignedUrl as r
};
