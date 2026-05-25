import { useState, useMemo, useRef, useEffect } from "react";
import { useWorkbench } from "@/lib/store";
import { evaluateMathExpressionForIbt } from "@/lib/math/evaluator";

export function XYScatterPanel() {
  const { parsed, selectedChannels, mathExpressions, refLap } = useWorkbench();
  const [xChannel, setXChannel] = useState<string>("LatAccel");
  const [yChannel, setYChannel] = useState<string>("LongAccel");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const availableChannels = useMemo(() => {
    if (!parsed) return [];
    return [...parsed.channelNames, ...mathExpressions.map((e) => e.name)].sort();
  }, [parsed, mathExpressions]);

  const xData = useMemo(() => {
    if (!parsed) return null;
    let ch = parsed.channels[xChannel];
    if (ch) return ch.data;
    const expr = mathExpressions.find((e) => e.name === xChannel);
    if (expr && expr.compiled) return evaluateMathExpressionForIbt(expr.compiled, parsed);
    return null;
  }, [parsed, xChannel, mathExpressions]);

  const yData = useMemo(() => {
    if (!parsed) return null;
    let ch = parsed.channels[yChannel];
    if (ch) return ch.data;
    const expr = mathExpressions.find((e) => e.name === yChannel);
    if (expr && expr.compiled) return evaluateMathExpressionForIbt(expr.compiled, parsed);
    return null;
  }, [parsed, yChannel, mathExpressions]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !parsed || !xData || !yData) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);

    let from = 0;
    let to = xData.length - 1;
    if (refLap != null) {
      const refLapObj = parsed.laps.find((l) => l.lap === refLap);
      if (refLapObj) {
        from = refLapObj.startTick;
        to = refLapObj.endTick;
      }
    }

    // Find bounds
    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;
    for (let i = from; i <= to; i++) {
      const x = xData[i];
      const y = yData[i];
      if (Number.isFinite(x) && Number.isFinite(y)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }

    if (minX === Infinity) return;

    // Add padding
    const padX = (maxX - minX) * 0.05 || 1;
    const padY = (maxY - minY) * 0.05 || 1;
    minX -= padX;
    maxX += padX;
    minY -= padY;
    maxY += padY;

    const rangeX = maxX - minX;
    const rangeY = maxY - minY;

    // Draw axes
    ctx.strokeStyle = "rgba(120,130,140,0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();

    // Y axis at X=0 if within range
    if (0 >= minX && 0 <= maxX) {
      const zx = ((0 - minX) / rangeX) * rect.width;
      ctx.moveTo(zx, 0);
      ctx.lineTo(zx, rect.height);
    }
    // X axis at Y=0 if within range
    if (0 >= minY && 0 <= maxY) {
      const zy = rect.height - ((0 - minY) / rangeY) * rect.height;
      ctx.moveTo(0, zy);
      ctx.lineTo(rect.width, zy);
    }
    ctx.stroke();

    // Draw points
    ctx.fillStyle = "rgba(var(--primary-rgb), 0.3)"; // using theme primary with opacity
    const primaryColor =
      getComputedStyle(document.body).getPropertyValue("--primary").trim() || "255, 60, 0";
    // We can just use a hardcoded fallback color
    ctx.fillStyle = "rgba(255, 100, 0, 0.2)";

    for (let i = from; i <= to; i++) {
      const x = xData[i];
      const y = yData[i];
      if (Number.isFinite(x) && Number.isFinite(y)) {
        const px = ((x - minX) / rangeX) * rect.width;
        const py = rect.height - ((y - minY) / rangeY) * rect.height;
        ctx.fillRect(px, py, 2, 2);
      }
    }

    // Draw labels
    ctx.fillStyle = "rgba(180,190,200,0.8)";
    ctx.font = "10px JetBrains Mono, monospace";
    ctx.fillText(`${minX.toFixed(1)}`, 2, rect.height - 2);
    ctx.fillText(`${maxX.toFixed(1)}`, rect.width - 30, rect.height - 2);
    ctx.fillText(`${maxY.toFixed(1)}`, 2, 10);
  }, [parsed, xData, yData, refLap]);

  if (!parsed) return null;

  return (
    <div className="flex flex-col h-full bg-panel p-4 hairline rounded-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-mono text-sm uppercase tracking-wider">XY Scatter</h3>
        <div className="flex gap-2 items-center">
          <label className="text-[10px] uppercase font-mono text-muted-foreground">X:</label>
          <select
            value={xChannel}
            onChange={(e) => setXChannel(e.target.value)}
            className="rounded-sm border border-border bg-rail p-1 text-xs outline-none max-w-[100px]"
          >
            {availableChannels.map((c) => (
              <option key={`x-${c}`} value={c}>
                {c}
              </option>
            ))}
          </select>
          <label className="text-[10px] uppercase font-mono text-muted-foreground ml-2">Y:</label>
          <select
            value={yChannel}
            onChange={(e) => setYChannel(e.target.value)}
            className="rounded-sm border border-border bg-rail p-1 text-xs outline-none max-w-[100px]"
          >
            {availableChannels.map((c) => (
              <option key={`y-${c}`} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 relative w-full h-full min-h-[150px]">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      </div>
    </div>
  );
}
