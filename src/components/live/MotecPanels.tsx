import { useEffect, useMemo, useRef, useState } from "react";
import type { Sample } from "@/lib/useTelemetryBuffer";

type TraceKey = "speed" | "rpm" | "throttle" | "brake" | "steering" | "gLat" | "gLon";

export type SmoothingMode = "none" | "ma" | "lp";

interface TraceDef {
  key: TraceKey | "inputs" | "g";
  label: string;
  unit: string;
  yMin: number;
  yMax: number;
  colors: string[];
  // Which scalar fields make up this trace (parallel to colors).
  fields: Array<keyof Sample>;
  // Optional scaler (e.g. 0..1 → 0..100)
  scale?: number[];
  fmt?: (v: number) => string;
}

const TRACES: TraceDef[] = [
  {
    key: "speed",
    label: "SPEED",
    unit: "km/h",
    yMin: 0,
    yMax: 320,
    colors: ["#22d3ee"],
    fields: ["speed"],
    fmt: (v) => v.toFixed(1),
  },
  {
    key: "rpm",
    label: "RPM",
    unit: "rpm",
    yMin: 0,
    yMax: 12000,
    colors: ["#e5e5e5"],
    fields: ["rpm"],
    fmt: (v) => Math.round(v).toString(),
  },
  {
    key: "inputs",
    label: "THR / BRK",
    unit: "%",
    yMin: 0,
    yMax: 100,
    colors: ["#22c55e", "#ef4444"],
    fields: ["throttle", "brake"],
    scale: [100, 100],
    fmt: (v) => Math.round(v).toString(),
  },
  {
    key: "steering",
    label: "STEER",
    unit: "°",
    yMin: -180,
    yMax: 180,
    colors: ["#facc15"],
    fields: ["steering"],
    fmt: (v) => Math.round(v).toString(),
  },
  {
    key: "g",
    label: "G LAT / LON",
    unit: "G",
    yMin: -3,
    yMax: 3,
    colors: ["#f97316", "#38bdf8"],
    fields: ["gLat", "gLon"],
    fmt: (v) => v.toFixed(2),
  },
];

const ROW_H = 64;
const LABEL_W = 110;
const VAL_W = 78;

/* ───────── Smoothing ───────── */

function smoothSeries(values: number[], mode: SmoothingMode, window: number): number[] {
  if (mode === "none" || values.length === 0) return values;
  if (mode === "ma") {
    const n = Math.max(1, Math.floor(window));
    const out = new Array(values.length);
    let sum = 0;
    const q: number[] = [];
    for (let i = 0; i < values.length; i++) {
      q.push(values[i]);
      sum += values[i];
      if (q.length > n) sum -= q.shift()!;
      out[i] = sum / q.length;
    }
    return out;
  }
  // low-pass IIR; map window 1..20 → alpha 1..0.05
  const alpha = Math.min(1, Math.max(0.02, 1 / Math.max(1, window)));
  const out = new Array(values.length);
  out[0] = values[0];
  for (let i = 1; i < values.length; i++) {
    out[i] = out[i - 1] + alpha * (values[i] - out[i - 1]);
  }
  return out;
}

function getRawValue(s: Sample, field: keyof Sample, scale?: number): number {
  const v = s[field] as number;
  return scale ? v * scale : v;
}

/* ───────── Trace stack with draggable cursor + smoothing ───────── */

export interface CursorInfo {
  sample: Sample;
  /** Smoothed values keyed by trace label/field index, for the cursor x. */
  smoothed: Record<string, number>;
}

export function TraceStack({
  samples,
  windowMs = 30_000,
  smoothing = "none",
  smoothWindow = 5,
  onCursorChange,
}: {
  samples: Sample[];
  windowMs?: number;
  smoothing?: SmoothingMode;
  smoothWindow?: number;
  onCursorChange?: (info: CursorInfo | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  // Cursor x in CSS px, relative to canvas. null = follow live edge.
  const [cursorX, setCursorX] = useState<number | null>(null);
  const draggingRef = useRef(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Dynamically observe container wrapper size for seamless high-contrast trace rendering
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  // Pre-compute smoothed series for each trace+field.
  const smoothed = useMemo(() => {
    const out: Record<string, number[]> = {};
    for (const trace of TRACES) {
      for (let si = 0; si < trace.fields.length; si++) {
        const raw = samples.map((s) => getRawValue(s, trace.fields[si], trace.scale?.[si]));
        out[`${trace.key}:${si}`] = smoothSeries(raw, smoothing, smoothWindow);
      }
    }
    return out;
  }, [samples, smoothing, smoothWindow]);

  // Find the sample index closest to a given cursor X position.
  const cursorIndex = useMemo(() => {
    if (samples.length === 0) return -1;
    const cssW = dimensions.width;
    const plotW = cssW - LABEL_W - VAL_W;
    if (cursorX == null || plotW <= 0) return samples.length - 1;
    const tEnd = samples[samples.length - 1].t;
    const tStart = tEnd - windowMs;
    const frac = Math.max(0, Math.min(1, (cursorX - LABEL_W) / plotW));
    const tTarget = tStart + frac * windowMs;
    // Binary search
    let lo = 0,
      hi = samples.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (samples[mid].t < tTarget) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }, [cursorX, samples, windowMs, dimensions.width]);

  // Notify parent of cursor sample.
  useEffect(() => {
    if (!onCursorChange) return;
    if (cursorIndex < 0 || cursorIndex >= samples.length) {
      onCursorChange(null);
      return;
    }
    const s = samples[cursorIndex];
    const sm: Record<string, number> = {};
    for (const trace of TRACES) {
      for (let si = 0; si < trace.fields.length; si++) {
        const arr = smoothed[`${trace.key}:${si}`];
        sm[`${trace.key}:${si}`] = arr?.[cursorIndex] ?? 0;
      }
    }
    onCursorChange({ sample: s, smoothed: sm });
  }, [cursorIndex, samples, smoothed, onCursorChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const dpr = window.devicePixelRatio || 1;

    // Scale traces to fill the available space dynamically
    const cssW = dimensions.width || wrap.clientWidth || 600;
    const cssH = dimensions.height || wrap.clientHeight || TRACES.length * ROW_H;
    const rowHeight = cssH / TRACES.length;

    if (canvas.width !== Math.floor(cssW * dpr) || canvas.height !== Math.floor(cssH * dpr)) {
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const plotX = LABEL_W;
    const plotW = cssW - LABEL_W - VAL_W;
    if (plotW <= 0) return;

    const tEnd = samples.length ? samples[samples.length - 1].t : 0;
    const tStart = tEnd - windowMs;

    ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.textBaseline = "middle";

    TRACES.forEach((trace, i) => {
      const y0 = i * rowHeight;
      const y1 = y0 + rowHeight;
      const padY = Math.max(4, rowHeight * 0.1); // responsive padding
      const plotYTop = y0 + padY;
      const plotYBot = y1 - padY;
      const plotH = plotYBot - plotYTop;

      ctx.fillStyle = i % 2 === 0 ? "#0a0a0a" : "#0d0d0d";
      ctx.fillRect(0, y0, cssW, rowHeight);
      ctx.fillStyle = "#171717";
      ctx.fillRect(0, y1 - 1, cssW, 1);

      ctx.fillStyle = "#525252";
      ctx.textAlign = "left";
      ctx.fillText(trace.label, 8, y0 + Math.min(14, rowHeight * 0.25));
      ctx.fillStyle = "#737373";
      ctx.fillText(trace.unit, 8, y1 - Math.min(12, rowHeight * 0.22));

      ctx.strokeStyle = "#1f1f1f";
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (trace.yMin < 0 && trace.yMax > 0) {
        const yMid = plotYTop + (plotH * (trace.yMax - 0)) / (trace.yMax - trace.yMin);
        ctx.moveTo(plotX, Math.round(yMid) + 0.5);
        ctx.lineTo(plotX + plotW, Math.round(yMid) + 0.5);
      }
      ctx.moveTo(plotX, plotYTop + 0.5);
      ctx.lineTo(plotX + plotW, plotYTop + 0.5);
      ctx.moveTo(plotX, plotYBot - 0.5);
      ctx.lineTo(plotX + plotW, plotYBot - 0.5);
      ctx.stroke();

      const valToY = (v: number) => {
        const f = (trace.yMax - v) / (trace.yMax - trace.yMin);
        return plotYTop + Math.max(0, Math.min(1, f)) * plotH;
      };
      const tToX = (t: number) => plotX + ((t - tStart) / windowMs) * plotW;

      for (let si = 0; si < trace.fields.length; si++) {
        const series = smoothed[`${trace.key}:${si}`];
        if (!series) continue;
        ctx.strokeStyle = trace.colors[si];
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        let started = false;
        for (let k = 0; k < samples.length; k++) {
          if (samples[k].t < tStart) continue;
          const x = tToX(samples[k].t);
          const y = valToY(series[k]);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Right-edge readout — value at cursor (or live if no cursor)
      const idx =
        cursorIndex >= 0 && cursorIndex < samples.length ? cursorIndex : samples.length - 1;
      if (idx >= 0) {
        ctx.textAlign = "right";
        for (let si = 0; si < trace.fields.length; si++) {
          const v = smoothed[`${trace.key}:${si}`]?.[idx] ?? 0;
          ctx.fillStyle = trace.colors[si];
          ctx.fillText(
            (trace.fmt ?? ((x) => x.toFixed(2)))(v),
            cssW - 8,
            y0 + Math.min(16, rowHeight * 0.28) + si * 14,
          );
        }
        ctx.textAlign = "left";
      }
    });

    // Live "now" cursor at right edge
    ctx.strokeStyle = "#262626";
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(plotX + plotW + 0.5, 0);
    ctx.lineTo(plotX + plotW + 0.5, cssH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draggable cursor
    if (cursorX != null && cursorX >= plotX && cursorX <= plotX + plotW) {
      ctx.strokeStyle = "#eab308";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.round(cursorX) + 0.5, 0);
      ctx.lineTo(Math.round(cursorX) + 0.5, cssH);
      ctx.stroke();
      // Time label at top
      if (cursorIndex >= 0 && cursorIndex < samples.length) {
        const dtFromEnd = (samples[samples.length - 1].t - samples[cursorIndex].t) / 1000;
        const label = `-${dtFromEnd.toFixed(2)}s`;
        ctx.fillStyle = "#eab308";
        ctx.font = "10px ui-monospace, monospace";
        ctx.textBaseline = "top";
        const tw = ctx.measureText(label).width + 8;
        const lx = Math.min(plotX + plotW - tw, Math.max(plotX, cursorX - tw / 2));
        ctx.fillRect(lx, 0, tw, 14);
        ctx.fillStyle = "#0a0a0a";
        ctx.textAlign = "center";
        ctx.fillText(label, lx + tw / 2, 2);
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
      }
    }
  }, [samples, windowMs, smoothed, cursorX, cursorIndex, dimensions]);

  const handlePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setCursorX(x);
  };

  return (
    <div
      ref={wrapRef}
      className="relative w-full h-full overflow-hidden rounded-sm border border-border bg-background touch-none"
      style={{ cursor: cursorX != null ? "ew-resize" : "crosshair" }}
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        draggingRef.current = true;
        handlePointer(e);
      }}
      onPointerMove={(e) => {
        if (draggingRef.current) handlePointer(e);
      }}
      onPointerUp={(e) => {
        draggingRef.current = false;
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      }}
      onPointerCancel={() => {
        draggingRef.current = false;
      }}
      onDoubleClick={() => setCursorX(null)}
      title="Drag to scrub · Double-click to release cursor"
    >
      <canvas ref={canvasRef} className="block" />
      {cursorX != null && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCursorX(null);
          }}
          className="absolute right-1 top-1 rounded-sm bg-muted/90 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-amber-400 hover:bg-accent"
        >
          Live
        </button>
      )}
    </div>
  );
}

/* ───────── G-G unchanged ───────── */

export function GGScatter({ samples }: { samples: Sample[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const dpr = window.devicePixelRatio || 1;

    const parent = wrap.parentElement;
    const cssW = wrap.clientWidth;
    const parentH = parent ? parent.clientHeight : 0;

    // Keep the diagram square, scale to fit parents, but limit to 550px max for professional proportions.
    const cssH = parentH > 0 ? parentH : cssW;
    const size = Math.max(120, Math.min(cssW, cssH, 550) - 16);

    if (canvas.width !== Math.floor(size * dpr) || canvas.height !== Math.floor(size * dpr)) {
      canvas.width = Math.floor(size * dpr);
      canvas.height = Math.floor(size * dpr);
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const maxG = 3;
    const scale = (size / 2 - 16) / maxG;

    ctx.strokeStyle = "#1f1f1f";
    ctx.lineWidth = 1;
    for (let g = 1; g <= maxG; g++) {
      ctx.beginPath();
      ctx.arc(cx, cy, g * scale, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, size);
    ctx.moveTo(0, cy);
    ctx.lineTo(size, cy);
    ctx.stroke();

    ctx.fillStyle = "#525252";
    ctx.font = "9px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.textBaseline = "middle";
    for (let g = 1; g <= maxG; g++) {
      ctx.fillText(`${g}G`, cx + g * scale - 14, cy - 6);
    }

    const n = samples.length;
    for (let i = 0; i < n; i++) {
      const s = samples[i];
      const age = (n - i) / n;
      const x = cx + s.gLat * scale;
      const y = cy - s.gLon * scale;
      const a = 0.15 + 0.65 * (1 - age);
      ctx.fillStyle = `rgba(34, 211, 238, ${a.toFixed(3)})`;
      ctx.fillRect(x - 1, y - 1, 2, 2);
    }

    const last = samples[samples.length - 1];
    if (last) {
      const x = cx + last.gLat * scale;
      const y = cy - last.gLon * scale;
      ctx.fillStyle = "#22d3ee";
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#737373";
    ctx.fillText("ACCEL", cx + 4, 10);
    ctx.fillText("BRAKE", cx + 4, size - 10);
    ctx.textAlign = "right";
    ctx.fillText("LEFT", size - 6, cy + 12);
    ctx.textAlign = "left";
    ctx.fillText("RIGHT", 6, cy + 12);
  }, [samples]);

  return (
    <div
      ref={wrapRef}
      className="w-full h-full flex items-center justify-center p-2 bg-background/30"
    >
      <canvas
        ref={canvasRef}
        className="block rounded border border-border/80 shadow-md bg-[#0a0a0a]"
      />
    </div>
  );
}
