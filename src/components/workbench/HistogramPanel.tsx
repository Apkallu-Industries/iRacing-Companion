import { useState, useMemo } from "react";
import { useWorkbench } from "@/lib/store";
import { computeHistogram } from "@/lib/histogramUtils";
import { evaluateMathExpressionForIbt } from "@/lib/math/evaluator";

export function HistogramPanel() {
  const { parsed, selectedChannels, mathExpressions, refLap } = useWorkbench();
  // Default to the first selected channel, or "Speed"
  const [channel, setChannel] = useState<string>(selectedChannels[0] || "Speed");
  const [binCount, setBinCount] = useState<number>(50);

  const dataArray = useMemo(() => {
    if (!parsed) return null;
    let ch = parsed.channels[channel];
    if (ch) return ch.data;

    const expr = mathExpressions.find((e) => e.name === channel);
    if (expr && expr.compiled) {
      return evaluateMathExpressionForIbt(expr.compiled, parsed);
    }
    return null;
  }, [parsed, channel, mathExpressions]);

  const histogram = useMemo(() => {
    if (!parsed || !dataArray) return null;

    let from = 0;
    let to = dataArray.length - 1;
    if (refLap != null) {
      const refLapObj = parsed.laps.find((l) => l.lap === refLap);
      if (refLapObj) {
        from = refLapObj.startTick;
        to = refLapObj.endTick;
      }
    }

    const values = new Float32Array(to - from + 1);
    for (let i = 0; i < values.length; i++) {
      values[i] = dataArray[from + i];
    }

    // Convert to regular array for histogramUtils
    return computeHistogram(Array.from(values), binCount);
  }, [parsed, dataArray, refLap, binCount]);

  if (!parsed) return null;

  const availableChannels = [...parsed.channelNames, ...mathExpressions.map((e) => e.name)].sort();

  return (
    <div className="flex flex-col h-full bg-panel p-4 hairline rounded-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-mono text-sm uppercase tracking-wider">Histogram</h3>
        <div className="flex gap-2">
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="rounded-sm border border-border bg-rail p-1 text-xs outline-none"
          >
            {availableChannels.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={binCount}
            onChange={(e) => setBinCount(Number(e.target.value))}
            className="rounded-sm border border-border bg-rail p-1 text-xs outline-none"
          >
            <option value={20}>20 Bins</option>
            <option value={50}>50 Bins</option>
            <option value={100}>100 Bins</option>
          </select>
        </div>
      </div>

      <div className="flex-1 flex items-end gap-1 overflow-hidden relative">
        {histogram ? (
          histogram.bins.map((bin, i) => {
            const maxCount = Math.max(...histogram.bins.map((b) => b.count));
            const heightPct = maxCount === 0 ? 0 : (bin.count / maxCount) * 100;
            return (
              <div
                key={i}
                className="flex-1 bg-primary/80 hover:bg-primary transition-all relative group"
                style={{ height: `${heightPct}%`, minHeight: "1px" }}
              >
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 bg-zinc-800 text-white text-[10px] p-1 rounded whitespace-nowrap">
                  {bin.label}: {bin.count} ({bin.percentage.toFixed(1)}%)
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-xs text-muted-foreground m-auto">No data</div>
        )}
      </div>

      {histogram && (
        <div className="mt-4 grid grid-cols-4 gap-2 text-[10px] font-mono text-muted-foreground border-t border-border pt-2">
          <div>
            Mean: <span className="text-foreground">{histogram.stats.mean.toFixed(2)}</span>
          </div>
          <div>
            Median: <span className="text-foreground">{histogram.stats.median.toFixed(2)}</span>
          </div>
          <div>
            StdDev: <span className="text-foreground">{histogram.stats.stdDev.toFixed(2)}</span>
          </div>
          <div>
            Count: <span className="text-foreground">{histogram.stats.count}</span>
          </div>
        </div>
      )}
    </div>
  );
}
