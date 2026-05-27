import { useEffect, useRef } from "react";
import uPlot from "uplot";
import type { IbtParsed } from "@/lib/ibt/types";
import { useWorkbench, colorForChannel } from "@/lib/store";

function resolveColor(varName: string): string {
  // turn "var(--ch-speed)" into computed color
  const probe = document.createElement("div");
  probe.style.color = colorForChannel(varName);
  document.body.appendChild(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c;
}

export function StackedTraces({ parsed }: { parsed: IbtParsed }) {
  const { selectedChannels, cursorTick, setCursorTick, refLap, cmpLap } = useWorkbench();
  const containerRef = useRef<HTMLDivElement>(null);
  const plotsRef = useRef<uPlot[]>([]);

  // Build x-axis (session time)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = "";
    plotsRef.current.forEach((p) => p.destroy());
    plotsRef.current = [];

    const sessionTime = parsed.channels["SessionTime"]?.data;
    if (!sessionTime) return;

    const refLapObj = refLap != null ? parsed.laps.find((l) => l.lap === refLap) : null;
    const cmpLapObj = cmpLap != null ? parsed.laps.find((l) => l.lap === cmpLap) : null;

    // Pick range: full session by default, or current lap if a refLap is set
    let from = 0,
      to = sessionTime.length - 1;
    if (refLapObj) {
      from = refLapObj.startTick;
      to = refLapObj.endTick;
    }

    const xs = new Float64Array(to - from + 1);
    for (let i = 0; i < xs.length; i++) xs[i] = sessionTime[from + i] - sessionTime[from];

    selectedChannels.forEach((name) => {
      const ch = parsed.channels[name];
      if (!ch) return;

      const ys = new Float64Array(xs.length);
      for (let i = 0; i < xs.length; i++) ys[i] = ch.data[from + i];

      const series: uPlot.Series[] = [
        {},
        {
          label: name,
          stroke: resolveColor(name),
          width: 1.25,
          points: { show: false },
        },
      ];
      const data: uPlot.AlignedData = [Array.from(xs), Array.from(ys)];

      // Compare lap overlay
      if (cmpLapObj && cmpLapObj.lap !== refLapObj?.lap) {
        const cmpLen = Math.min(xs.length, cmpLapObj.endTick - cmpLapObj.startTick + 1);
        const ys2 = new Float64Array(xs.length);
        for (let i = 0; i < xs.length; i++) {
          ys2[i] = i < cmpLen ? ch.data[cmpLapObj.startTick + i] : NaN;
        }
        series.push({
          label: `${name} (cmp)`,
          stroke: resolveColor(name),
          width: 1,
          dash: [4, 3],
          points: { show: false },
        });
        data.push(Array.from(ys2));
      }

      const wrap = document.createElement("div");
      wrap.className = "hairline-b bg-panel";
      container.appendChild(wrap);

      const opts: uPlot.Options = {
        width: container.clientWidth,
        height: 110,
        padding: [6, 12, 6, 6],
        cursor: {
          drag: { x: false, y: false },
          sync: { key: "wb", setSeries: false },
        },
        legend: { show: false },
        scales: { x: { time: false } },
        axes: [
          {
            stroke: "rgba(180,190,200,0.5)",
            grid: { stroke: "rgba(120,130,140,0.12)", width: 1 },
            ticks: { stroke: "rgba(120,130,140,0.2)" },
            font: "10px JetBrains Mono, monospace",
            size: 22,
          },
          {
            stroke: "rgba(180,190,200,0.5)",
            grid: { stroke: "rgba(120,130,140,0.1)", width: 1 },
            ticks: { stroke: "rgba(120,130,140,0.2)" },
            font: "10px JetBrains Mono, monospace",
            size: 50,
          },
        ],
        series,
        hooks: {
          draw: [
            (u) => {
              const ctx = u.ctx;
              const sessionTime = parsed.channels["SessionTime"]?.data;
              if (!sessionTime) return;

              const refLapObj = refLap != null ? parsed.laps.find((l) => l.lap === refLap) : null;
              const fromIdx = refLapObj ? refLapObj.startTick : 0;
              const toIdx = refLapObj ? refLapObj.endTick : sessionTime.length - 1;

              const valData = parsed.channels[name]?.data;
              if (!valData) return;

              let shadeStart: number | null = null;
              let shadeType: "lockup" | "threshold" | "wheelspin" | "bottoming" | "hybrid_deploy" | "hybrid_regen" | null = null;

              const getShadeColorAndLabel = (type: typeof shadeType) => {
                switch (type) {
                  case "lockup":
                    return { color: "rgba(255, 77, 77, 0.2)", border: "#FF4D4D", label: "LOCKUP DETECTED" };
                  case "threshold":
                    return { color: "rgba(255, 184, 0, 0.12)", border: "#FFB800", label: "THRESHOLD ZONE" };
                  case "wheelspin":
                    return { color: "rgba(245, 158, 11, 0.15)", border: "#F59E0B", label: "WHEELSPIN REGION" };
                  case "bottoming":
                    return { color: "rgba(139, 92, 246, 0.15)", border: "#8B5CF6", label: "CHASSIS REB COMPRESSION" };
                  case "hybrid_deploy":
                    return { color: "rgba(139, 92, 246, 0.08)", border: "#8B5CF6", label: "MGU-K DEPLOY" };
                  case "hybrid_regen":
                    return { color: "rgba(0, 209, 127, 0.08)", border: "#00D17F", label: "MGU-K REGEN" };
                  default:
                    return { color: "rgba(0,0,0,0)", border: "transparent", label: "" };
                }
              };

              const drawZone = (startIdx: number, endIdx: number, type: typeof shadeType) => {
                const startX = Math.round(u.valToPos(sessionTime[fromIdx + startIdx] - sessionTime[fromIdx], "x"));
                const endX = Math.round(u.valToPos(sessionTime[fromIdx + endIdx] - sessionTime[fromIdx], "x"));
                const { color, border, label } = getShadeColorAndLabel(type);

                // Paint background rectangle in the chart plot bounds
                ctx.fillStyle = color;
                ctx.fillRect(startX, u.bbox.top, endX - startX, u.bbox.height);

                // Surgical vertical tick boundaries
                ctx.strokeStyle = border;
                ctx.lineWidth = 1.25;
                ctx.beginPath();
                ctx.moveTo(startX, u.bbox.top);
                ctx.lineTo(startX, u.bbox.top + u.bbox.height);
                ctx.moveTo(endX, u.bbox.top);
                ctx.lineTo(endX, u.bbox.top + u.bbox.height);
                ctx.stroke();

                // Clean monospace label overlay
                ctx.fillStyle = border;
                ctx.font = "bold 8px IBM Plex Sans, monospace";
                ctx.fillText(label, startX + 4, u.bbox.top + 10);
              };

              for (let i = 0; i < xs.length; i++) {
                const tick = fromIdx + i;
                let activeShade: typeof shadeType = null;

                if (name === "Brake" || name.toLowerCase().includes("brakelinepress")) {
                  const brakeVal = parsed.channels["Brake"]?.data[tick] ?? 0;
                  const steering = parsed.channels["SteeringWheelAngle"]?.data[tick] ?? 0;
                  if (brakeVal > 0.82 && Math.abs(steering * 57.3) > 40) {
                    activeShade = "lockup";
                  } else if (brakeVal > 0.80) {
                    activeShade = "threshold";
                  }
                } else if (name === "Speed" || name.toLowerCase().includes("wheel") || name.toLowerCase().includes("speed")) {
                  const lfSpeed = parsed.channels["LFspeed"]?.data[tick] ?? 0;
                  const lrSpeed = parsed.channels["LRspeed"]?.data[tick] ?? 0;
                  const throttle = parsed.channels["Throttle"]?.data[tick] ?? 0;
                  if (throttle > 0.80 && Math.abs(lfSpeed - lrSpeed) > (lfSpeed * 0.12)) {
                    activeShade = "wheelspin";
                  }
                } else if (name.toLowerCase().includes("ers") || name.toLowerCase().includes("mgu") || name === "EnergyStorePct" || name === "EnergyStoreTemp") {
                  const deploy = parsed.channels["MgukDeploykW"]?.data[tick] ?? 0;
                  const regen = parsed.channels["MgukRegenkW"]?.data[tick] ?? 0;
                  if (deploy > 105) {
                    activeShade = "hybrid_deploy";
                  } else if (regen > 105) {
                    activeShade = "hybrid_regen";
                  }
                } else if (name.toLowerCase().includes("ride") || name.toLowerCase().includes("damper") || name === "pitch" || name.toLowerCase().includes("accel")) {
                  const pitchVal = parsed.channels["pitch"]?.data[tick] ?? 0;
                  if (pitchVal < -0.018) {
                    activeShade = "bottoming";
                  }
                }

                if (activeShade !== shadeType) {
                  if (shadeStart !== null && shadeType) {
                    drawZone(shadeStart, i - 1, shadeType);
                  }
                  shadeStart = activeShade ? i : null;
                  shadeType = activeShade;
                }
              }

              if (shadeStart !== null && shadeType) {
                drawZone(shadeStart, xs.length - 1, shadeType);
              }
            },
          ],
          setCursor: [
            (u) => {
              const idx = u.cursor.idx;
              if (idx != null) setCursorTick(fromIdx + idx);
            },
          ],
        },
      };

      // Header label — build via DOM APIs to avoid HTML injection from .ibt metadata
      const header = document.createElement("div");
      header.className =
        "flex items-center justify-between px-3 py-1 hairline-b text-[11px] font-mono uppercase tracking-wider";
      const nameSpan = document.createElement("span");
      nameSpan.style.color = resolveColor(name);
      nameSpan.textContent = name;
      const statsSpan = document.createElement("span");
      statsSpan.className = "text-muted-foreground";
      statsSpan.textContent = `${ch.unit || ""} · min ${ch.min.toFixed(2)} · max ${ch.max.toFixed(2)} · avg ${ch.avg.toFixed(2)}`;
      header.appendChild(nameSpan);
      header.appendChild(statsSpan);
      wrap.appendChild(header);

      const plotEl = document.createElement("div");
      wrap.appendChild(plotEl);
      const plot = new uPlot(opts, data, plotEl);
      plotsRef.current.push(plot);
    });

    const onResize = () => {
      const w = container.clientWidth;
      plotsRef.current.forEach((p) => p.setSize({ width: w, height: 110 }));
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      plotsRef.current.forEach((p) => p.destroy());
      plotsRef.current = [];
    };
  }, [parsed, selectedChannels, refLap, cmpLap, setCursorTick]);

  // Move cursor on plots when cursorTick changes (e.g. from scrubber)
  useEffect(() => {
    const sessionTime = parsed.channels["SessionTime"]?.data;
    if (!sessionTime) return;
    const refLapObj = refLap != null ? parsed.laps.find((l) => l.lap === refLap) : null;
    const from = refLapObj ? refLapObj.startTick : 0;
    const idx = cursorTick - from;
    plotsRef.current.forEach((p) => {
      if (idx >= 0 && idx < p.data[0].length) {
        const left = p.valToPos(p.data[0][idx] as number, "x");
        p.setCursor({ left, top: 50 }, false);
      }
    });
  }, [cursorTick, parsed, refLap]);

  if (selectedChannels.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Select channels from the left rail to plot.
      </div>
    );
  }

  return <div ref={containerRef} className="h-full overflow-y-auto" />;
}
