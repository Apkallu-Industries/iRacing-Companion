import { useMemo, useRef, useEffect, useState } from "react";
import { computeHistogram, type HistogramData, type HistogramBin } from "@/lib/histogramUtils";
import type { Sample } from "@/lib/useTelemetryBuffer";
import { STATIC_CHANNELS } from "./ChannelRegistry";

interface HistogramWidgetProps {
  samples: Sample[];
  selectedChannelKey?: string;
}

export function HistogramWidget({
  samples,
  selectedChannelKey = "throttle",
}: HistogramWidgetProps) {
  const [binCount, setBinCount] = useState(15);
  const [hoveredBin, setHoveredBin] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Extract channel data from samples
  const channelData = useMemo(() => {
    return samples.map((s) => {
      if (selectedChannelKey === "throttle") return s.throttle;
      if (selectedChannelKey === "brake") return s.brake;
      if (selectedChannelKey === "steering") return Math.abs(s.steering);
      if (selectedChannelKey === "speed") return s.speed;
      if (selectedChannelKey === "rpm") return s.rpm;
      if (selectedChannelKey === "gLat") return Math.abs(s.gLat);
      if (selectedChannelKey === "gLon") return Math.abs(s.gLon);
      return s.throttle; // default
    });
  }, [samples, selectedChannelKey]);

  // Compute histogram
  const histogram = useMemo(() => {
    return computeHistogram(channelData, binCount);
  }, [channelData, binCount]);

  // Find channel label and unit
  const channel = STATIC_CHANNELS.find((c) => c.key === selectedChannelKey);
  const label = channel?.label || selectedChannelKey;
  const unit = channel?.unit || "";

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || histogram.bins.length === 0) return;

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
    const padding = 40;
    const graphW = w - padding * 2;
    const graphH = h - padding * 2;
    const binWidth = graphW / histogram.bins.length;
    const maxCount = Math.max(...histogram.bins.map((b) => b.count), 1);

    // Draw bars
    for (let i = 0; i < histogram.bins.length; i++) {
      const bin = histogram.bins[i];
      const barH = (bin.count / maxCount) * graphH;
      const x = padding + i * binWidth + 2;
      const y = padding + graphH - barH;

      // Color: highlight hovered bin
      const isHovered = hoveredBin === i;
      ctx.fillStyle = isHovered
        ? channel?.color || "#22d3ee"
        : adjustBrightness(channel?.color || "#22d3ee", 0.6);

      ctx.fillRect(x, y, binWidth - 4, barH);

      // Hovered bin label
      if (isHovered && bin.count > 0) {
        ctx.fillStyle = "#fff";
        ctx.font = "11px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`${bin.count}`, x + binWidth / 2 - 2, y - 5);
      }
    }

    // Draw axes
    ctx.strokeStyle = "#3f3f46";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, padding + graphH);
    ctx.lineTo(padding + graphW, padding + graphH);
    ctx.stroke();

    // Y-axis labels
    ctx.fillStyle = "#a1a1aa";
    ctx.font = "10px monospace";
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const y = padding + graphH - (i * graphH) / 4;
      const val = Math.round((i * maxCount) / 4);
      ctx.fillText(val.toString(), padding - 8, y + 3);
    }
  }, [histogram, hoveredBin, channel?.color]);

  // Mouse tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const w = wrap.clientWidth;
    const binCount = histogram.bins.length;
    const binWidth = (w - 80) / binCount;
    const binIdx = Math.floor((x - 40) / binWidth);

    setHoveredBin(binIdx >= 0 && binIdx < binCount ? binIdx : null);
  };

  const handleMouseLeave = () => {
    setHoveredBin(null);
  };

  return (
    <div className="flex flex-col h-full bg-background border border-border-strong rounded overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border-strong bg-panel-2 flex items-center justify-between flex-shrink-0">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {label} Distribution
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[10px] text-muted-foreground">Bins:</label>
          <input
            type="range"
            min="5"
            max="50"
            value={binCount}
            onChange={(e) => setBinCount(parseInt(e.target.value))}
            className="w-20 h-1"
          />
          <span className="text-[10px] text-muted-foreground w-5">{binCount}</span>
        </div>
      </div>

      {/* Canvas */}
      <div ref={wrapRef} className="flex-1 min-h-0 overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="block cursor-crosshair"
        />
      </div>

      {/* Stats Footer */}
      <div className="px-3 py-2 border-t border-border-strong bg-panel-2 flex-shrink-0 grid grid-cols-3 gap-2 text-[10px]">
        <StatRow label="Mean" value={histogram.stats.mean} unit={unit} />
        <StatRow label="Median" value={histogram.stats.median} unit={unit} />
        <StatRow label="Std Dev" value={histogram.stats.stdDev} unit={unit} />
        <StatRow label="Min" value={histogram.stats.min} unit={unit} />
        <StatRow label="Max" value={histogram.stats.max} unit={unit} />
        <StatRow label="Samples" value={histogram.stats.count} unit="" />
      </div>
    </div>
  );
}

function StatRow({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="flex justify-between items-baseline gap-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">
        {value.toFixed(1)}
        <span className="text-[9px] text-muted-foreground ml-0.5">{unit}</span>
      </span>
    </div>
  );
}

function adjustBrightness(hex: string, factor: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, Math.floor((num >> 16) * factor)));
  const g = Math.max(0, Math.min(255, Math.floor(((num >> 8) & 0x00ff) * factor)));
  const b = Math.max(0, Math.min(255, Math.floor((num & 0x0000ff) * factor)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
