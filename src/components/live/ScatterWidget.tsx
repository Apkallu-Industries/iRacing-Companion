import { useMemo, useRef, useEffect, useState } from "react";
import {
  prepareScatterData,
  calculateGridDensity,
  calculateScatterMetrics,
  type ScatterPoint,
  type DensityMode,
} from "@/lib/scatterUtils";
import type { Sample } from "@/lib/useTelemetryBuffer";
import { STATIC_CHANNELS } from "./ChannelRegistry";

interface ScatterWidgetProps {
  samples: Sample[];
  xChannelKey?: string;
  yChannelKey?: string;
}

const CHANNEL_KEYS = ["speed", "rpm", "throttle", "brake", "steering", "gLat", "gLon"];

export function ScatterWidget({
  samples,
  xChannelKey = "throttle",
  yChannelKey = "brake",
}: ScatterWidgetProps) {
  const [xChannel, setXChannel] = useState(xChannelKey);
  const [yChannel, setYChannel] = useState(yChannelKey);
  const [densityMode, setDensityMode] = useState<DensityMode>("grid");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Prepare scatter data
  const scatterData = useMemo(() => {
    return prepareScatterData(samples, xChannel, yChannel);
  }, [samples, xChannel, yChannel]);

  // Calculate metrics
  const metrics = useMemo(() => {
    return calculateScatterMetrics(scatterData);
  }, [scatterData]);

  // Calculate density
  const density = useMemo(() => {
    if (densityMode === "none") return null;
    return calculateGridDensity(scatterData, 20);
  }, [scatterData, densityMode]);

  // Get channel info
  const xChannelInfo = STATIC_CHANNELS.find((c) => c.key === xChannel);
  const yChannelInfo = STATIC_CHANNELS.find((c) => c.key === yChannel);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || scatterData.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Clear
    ctx.fillStyle = "#18181b";
    ctx.fillRect(0, 0, w, h);

    // Dimensions
    const padding = 50;
    const graphW = w - padding * 2;
    const graphH = h - padding * 2;

    // Draw grid
    ctx.strokeStyle = "#27272a";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const x = padding + (i * graphW) / 4;
      const y = padding + (i * graphH) / 4;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, padding + graphH);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + graphW, y);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = "#52525b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, padding + graphH);
    ctx.lineTo(padding + graphW, padding + graphH);
    ctx.stroke();

    // Draw density heatmap if enabled
    if (density && densityMode === "grid") {
      const maxDensity = Math.max(...density.values(), 1);
      for (const [key, count] of density.entries()) {
        const [binX, binY] = key.split(",").map(Number);
        const cellW = graphW / 20;
        const cellH = graphH / 20;
        const x = padding + binX * cellW;
        const y = padding + graphH - (binY + 1) * cellH;

        const intensity = count / maxDensity;
        const hue = 240 - intensity * 60; // Blue to red
        const sat = 100;
        const light = 40 + intensity * 20;
        ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
        ctx.fillRect(x, y, cellW, cellH);
      }
    }

    // Draw points
    const rangeX = metrics.maxX - metrics.minX || 1;
    const rangeY = metrics.maxY - metrics.minY || 1;

    for (let i = 0; i < scatterData.length; i++) {
      const point = scatterData[i];
      const px = padding + ((point.x - metrics.minX) / rangeX) * graphW;
      const py = padding + graphH - ((point.y - metrics.minY) / rangeY) * graphH;

      // Fade older points
      const alpha = 0.3 + (point.age || 0) * 0.7;
      ctx.fillStyle = `rgba(34, 211, 238, ${alpha})`;
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Highlight latest point
    if (scatterData.length > 0) {
      const latest = scatterData[scatterData.length - 1];
      const px = padding + ((latest.x - metrics.minX) / rangeX) * graphW;
      const py = padding + graphH - ((latest.y - metrics.minY) / rangeY) * graphH;

      ctx.strokeStyle = "#22d3ee";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Axis labels
    ctx.fillStyle = "#a1a1aa";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    // X-axis labels
    for (let i = 0; i <= 4; i++) {
      const x = padding + (i * graphW) / 4;
      const val = metrics.minX + (i * (metrics.maxX - metrics.minX)) / 4;
      ctx.fillText(val.toFixed(1), x, padding + graphH + 8);
    }

    // Y-axis labels
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let i = 0; i <= 4; i++) {
      const y = padding + graphH - (i * graphH) / 4;
      const val = metrics.minY + (i * (metrics.maxY - metrics.minY)) / 4;
      ctx.fillText(val.toFixed(1), padding - 8, y);
    }
  }, [scatterData, density, densityMode, metrics]);

  return (
    <div className="flex flex-col h-full bg-background border border-border-strong rounded overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border-strong bg-panel-2 flex-shrink-0">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
          XY Scatter Plot
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <label className="text-muted-foreground">X:</label>
          <select
            value={xChannel}
            onChange={(e) => setXChannel(e.target.value)}
            className="bg-accent text-foreground px-2 py-0.5 rounded text-[9px] border border-zinc-700"
          >
            {CHANNEL_KEYS.map((k) => (
              <option key={k} value={k}>
                {STATIC_CHANNELS.find((c) => c.key === k)?.label || k}
              </option>
            ))}
          </select>

          <label className="text-muted-foreground ml-2">Y:</label>
          <select
            value={yChannel}
            onChange={(e) => setYChannel(e.target.value)}
            className="bg-accent text-foreground px-2 py-0.5 rounded text-[9px] border border-zinc-700"
          >
            {CHANNEL_KEYS.map((k) => (
              <option key={k} value={k}>
                {STATIC_CHANNELS.find((c) => c.key === k)?.label || k}
              </option>
            ))}
          </select>

          <label className="text-muted-foreground ml-2">Density:</label>
          <select
            value={densityMode}
            onChange={(e) => setDensityMode(e.target.value as DensityMode)}
            className="bg-accent text-foreground px-2 py-0.5 rounded text-[9px] border border-zinc-700"
          >
            <option value="none">Off</option>
            <option value="grid">Grid</option>
          </select>
        </div>
      </div>

      {/* Canvas */}
      <div ref={wrapRef} className="flex-1 min-h-0 overflow-hidden">
        <canvas ref={canvasRef} className="block w-full h-full" />
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-border-strong bg-panel-2 flex-shrink-0 text-[10px]">
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Correlation: <span className="text-foreground">{metrics.correlation.toFixed(2)}</span>
          </span>
          <span className="text-muted-foreground">
            Points: <span className="text-foreground">{scatterData.length}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
