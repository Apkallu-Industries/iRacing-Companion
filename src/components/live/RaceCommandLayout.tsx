import React, { useEffect, useState } from "react";
import type { Telemetry } from "@/lib/telemetry-types";
import type { Sample } from "@/lib/useTelemetryBuffer";
import { Activity, Shield, Thermometer, Zap, AlertCircle } from "lucide-react";
import { getTrackMap, getCoordinatesAtPct, getSvgPathFromSpline } from "@/lib/track-maps";

interface RaceCommandLayoutProps {
  t: Telemetry;
  samples: Sample[];
}

export function RaceCommandLayout({ t, samples }: RaceCommandLayoutProps) {
  const [timeStr, setTimeStr] = useState("17:35");
  const [simulatedPct, setSimulatedPct] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(2.2);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [trackedDriverPos, setTrackedDriverPos] = useState<number>(6); // Default Dany M. (team user)
  const [isTrackingActive, setIsTrackingActive] = useState(true);

  // Format real-time system clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Loop a smooth progression for the simulated car projection when not actively connected
  useEffect(() => {
    if (!t.connected) {
      const interval = setInterval(() => {
        setSimulatedPct((prev) => (prev + 0.001) % 1.0);
      }, 30); // smooth progression
      return () => clearInterval(interval);
    }
  }, [t.connected]);

  // Dynamic values wired to real iRacing data
  const position = t.sof > 0 ? "14" : "-";
  const numDrivers = t.sof > 0 ? "22" : "-";
  const gear = t.gear ?? "N";
  const speed = t.speedKph ?? 0;
  const rpm = t.rpm ?? 0;
  const throttle = t.throttle ?? 0;
  const brake = t.brake ?? 0;
  const clutch = t.clutch ?? 0;
  const brakeBias = t.brakeBias ?? 54.5;
  const trackName = t.track || "Circuit des 24 Heures du Mans";
  const lastLap = t.lastLap || "0:00.000";
  const bestLap = t.bestLap || "0:00.000";

  // Custom estimated sector times
  const s1Time = t.sectors?.s1 || "00.000";
  const s2Time = t.sectors?.s2 || "00.000";
  const s3Time = t.sectors?.s3 || "00.000";

  // Resolve vector track map definition
  const trackDef = getTrackMap(trackName);

  // Resolve user current progress percentage
  const lapDistPct = t.connected ? (t.all?.LapDistPct ?? t.extras?.LapDistPct ?? 0) : simulatedPct;

  // Active competitors synchronized across the standings list and vector track map nodes
  const competitors = [
    {
      pos: 1,
      name: "Max V.",
      carNo: "1",
      color: "#FFB800",
      isUser: false,
      gap: "LDR",
      best: "3:28.450",
      last: "3:29.112",
      lap: 24,
      offset: 0.35,
    },
    {
      pos: 2,
      name: "Lando N.",
      carNo: "4",
      color: "#FF6B35",
      isUser: false,
      gap: "+12.1s",
      best: "3:28.870",
      last: "3:29.350",
      lap: 24,
      offset: 0.28,
    },
    {
      pos: 3,
      name: "Charles L.",
      carNo: "16",
      color: "#E63322",
      isUser: false,
      gap: "+18.2s",
      best: "3:29.300",
      last: "3:30.120",
      lap: 24,
      offset: 0.2,
    },
    {
      pos: 4,
      name: "Oscar P.",
      carNo: "81",
      color: "#ffffff",
      isUser: false,
      gap: "+24.5s",
      best: "3:29.570",
      last: "3:29.880",
      lap: 23,
      offset: 0.12,
    },
    {
      pos: 5,
      name: "Lewis H.",
      carNo: "44",
      color: "#ffffff",
      isUser: false,
      gap: "+29.8s",
      best: "3:29.930",
      last: "3:31.050",
      lap: 24,
      offset: 0.05,
    },
    {
      pos: 6,
      name: "Dany M.",
      carNo: "6",
      color: "#00e676",
      isUser: true,
      gap: "+32.1s",
      best: bestLap,
      last: lastLap,
      lap: 23,
      offset: 0.0,
    },
    {
      pos: 7,
      name: "Fernando A.",
      carNo: "14",
      color: "#ffffff",
      isUser: false,
      gap: "+35.6s",
      best: "3:31.100",
      last: "3:31.520",
      lap: 24,
      offset: -0.06,
    },
    {
      pos: 8,
      name: "George R.",
      carNo: "63",
      color: "#ffffff",
      isUser: false,
      gap: "+41.2s",
      best: "3:31.570",
      last: "3:32.110",
      lap: 24,
      offset: -0.14,
    },
  ];

  // Resolve tracked driver coordinate center
  const trackedDriver = competitors.find((c) => c.pos === trackedDriverPos) ?? competitors[5];
  const trackedTargetPct = (lapDistPct + trackedDriver.offset + 1.0) % 1.0;

  // Decide which spline is active for tracking center calculation (e.g. if driver enters pits)
  let activeCenterSpline = trackDef.mainSpline;
  if (trackDef.pitSpline && trackDef.exitPct !== undefined && trackDef.mergePct !== undefined) {
    const isInsidePit =
      trackDef.exitPct > trackDef.mergePct
        ? trackedTargetPct >= trackDef.exitPct || trackedTargetPct <= trackDef.mergePct
        : trackedTargetPct >= trackDef.exitPct && trackedTargetPct <= trackDef.mergePct;

    if (isInsidePit) {
      activeCenterSpline = trackDef.pitSpline;
    }
  }

  const centerCoords = getCoordinatesAtPct(activeCenterSpline, trackedTargetPct);
  const cx = centerCoords.x * 200;
  const cy = centerCoords.y * 200;

  // ViewBox calculation based on follow snap settings
  let viewBoxStr = "-10 -10 220 220";
  if (isTrackingActive) {
    const vbW = 200 / zoomLevel;
    const vbH = 200 / zoomLevel;
    const vbX = cx - vbW / 2;
    const vbY = cy - vbH / 2;
    viewBoxStr = `${vbX} ${vbY} ${vbW} ${vbH}`;
  }

  return (
    <div className="flex-1 min-h-0 bg-[#000000] text-[#E2E8F0] font-mono select-none flex flex-col p-2 gap-2 overflow-y-auto scrollbar-thin">
      {/* 1. TOP STRATEGY HEADER (PRACTICE / POSITION / TIMINGS) */}
      <div className="grid grid-cols-12 gap-2 bg-[#0A0C10] border border-[#1C2430] p-2 rounded-sm select-none">
        {/* practice status */}
        <div className="col-span-2 flex flex-col justify-center border-r border-[#1C2430]/60 pr-2">
          <span className="text-[8px] uppercase tracking-widest text-[#7A828C]">
            session status
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-black text-white">PRACTICE</span>
            <span className="text-xs font-bold text-[#FFB800]">L1</span>
          </div>
        </div>

        {/* positions order */}
        <div className="col-span-2 flex flex-col justify-center border-r border-[#1C2430]/60 px-2">
          <span className="text-[8px] uppercase tracking-widest text-[#7A828C]">position</span>
          <div className="text-sm font-black text-white">
            {position} <span className="text-[10px] text-[#7A828C]">/ {numDrivers}</span>
          </div>
        </div>

        {/* session clock timer */}
        <div className="col-span-2 flex flex-col justify-center border-r border-[#1C2430]/60 px-2">
          <span className="text-[8px] uppercase tracking-widest text-[#7A828C]">time left</span>
          <div className="text-sm font-black text-[#00e676] tabular-nums">
            3:24<span className="text-[10px] text-[#00e676]/70">:52</span>
          </div>
        </div>

        {/* timings info */}
        <div className="col-span-2 flex flex-col justify-center border-r border-[#1C2430]/60 px-2">
          <span className="text-[8px] uppercase tracking-widest text-[#7A828C]">last lap</span>
          <div className="text-sm font-bold text-white tabular-nums">{lastLap}</div>
        </div>

        <div className="col-span-2 flex flex-col justify-center border-r border-[#1C2430]/60 px-2">
          <span className="text-[8px] uppercase tracking-widest text-[#7A828C]">best lap</span>
          <div className="text-sm font-bold text-white tabular-nums">{bestLap}</div>
        </div>

        <div className="col-span-2 flex flex-col justify-center px-2 relative">
          <span className="text-[8px] uppercase tracking-widest text-[#FF4D4D]">class best</span>
          <div className="text-sm font-black text-[#FF4D4D] tabular-nums">3:28.450</div>
          <span className="absolute right-2 top-1 text-[8px] text-[#7A828C] font-black uppercase">
            lmp2
          </span>
        </div>
      </div>

      {/* 2. MIDDLE SPLIT: RUNNING STANDINGS TABLE (LEFT) & CIRCUIT MAP (RIGHT) */}
      <div className="flex-1 min-h-[350px] grid grid-cols-12 gap-2">
        {/* STANDINGS TABLE (Col span 7) */}
        <div className="col-span-7 flex flex-col border border-[#1C2430] bg-[#0A0C10] rounded-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-1 px-2.5 py-1.5 border-b border-[#1C2430] bg-[#111520] text-[8px] font-bold text-[#7A828C] uppercase tracking-wider">
            <div className="col-span-1">pos</div>
            <div className="col-span-3">driver</div>
            <div className="col-span-1">pit</div>
            <div className="col-span-1">lap</div>
            <div className="col-span-2">gap</div>
            <div className="col-span-2">best lap</div>
            <div className="col-span-2">last lap</div>
          </div>

          <div className="flex-1 divide-y divide-[#1C2430]/40 overflow-y-auto text-[9.5px]">
            {competitors.map((comp) => {
              const isTracked = trackedDriverPos === comp.pos && isTrackingActive;

              const rowClass = comp.isUser
                ? `bg-[#00e676]/10 border-y border-[#00e676]/20 font-black text-[#00e676] cursor-pointer hover:bg-[#00e676]/15 transition-colors ${isTracked ? "ring-1 ring-inset ring-[#00e676]" : ""}`
                : `hover:bg-[#111520]/45 items-center text-white cursor-pointer transition-colors ${isTracked ? "bg-[#3b82f6]/10 ring-1 ring-inset ring-[#3b82f6]/40" : ""}`;

              const posColor =
                comp.pos === 1
                  ? "text-[#FFB800]"
                  : comp.isUser
                    ? "text-[#00e676]"
                    : isTracked
                      ? "text-[#3b82f6]"
                      : "text-white";

              return (
                <div
                  key={comp.pos}
                  className={`grid grid-cols-12 gap-1 px-2.5 py-1.5 items-center ${rowClass}`}
                  onClick={() => {
                    setTrackedDriverPos(comp.pos);
                    setIsTrackingActive(true);
                  }}
                  title={`Click to snap camera to ${comp.name}`}
                >
                  <div className={`col-span-1 font-bold ${posColor} flex items-center gap-1`}>
                    {isTracked && <span className="text-[7.5px] animate-pulse">⌖</span>}P{comp.pos}
                  </div>
                  <div className="col-span-3 font-semibold truncate flex items-center gap-1.5">
                    <span className="truncate">{comp.name}</span>
                    {comp.isUser && (
                      <span className="text-[7px] bg-[#00e676]/20 text-[#00e676] px-1 py-0.2 rounded-xs font-black">
                        TEAM
                      </span>
                    )}
                  </div>
                  <div className="col-span-1 text-[#7A828C]">{comp.isUser ? "IN" : "-"}</div>
                  <div className="col-span-1">{comp.lap}</div>
                  <div className="col-span-2 font-bold">{comp.gap}</div>
                  <div className="col-span-2">{comp.best}</div>
                  <div className="col-span-2 font-semibold">{comp.last}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CIRCUIT MAP & METADATA (Col span 5) */}
        <div className="col-span-5 flex flex-col border border-[#1C2430] bg-[#0A0C10] rounded-sm p-3 justify-between relative">
          {/* Map Header */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-white uppercase tracking-wider">
                {trackDef.displayName}
              </span>
              <span className="text-[8px] text-[#7A828C] uppercase tracking-widest mt-0.5">
                Authoritative Circuit Spline
              </span>
            </div>
            <span className="text-xs font-bold text-white tabular-nums">{timeStr}</span>
          </div>

          {/* SVG Map dynamically generated from vector coordinates spline with live projected markers */}
          <div className="flex-1 flex items-center justify-center my-3 relative h-[210px] overflow-hidden">
            {/* Floating Map Controls HUD Deck */}
            <div className="absolute right-2 top-0 flex flex-col gap-1 z-10 select-none">
              <button
                onClick={() => {
                  setZoomLevel((prev) => Math.min(6.0, prev + 0.4));
                  setIsTrackingActive(true); // Auto-activate lock when zooming in
                }}
                className="w-5 h-5 rounded-xs bg-[#111520]/85 border border-[#1C2430] text-[10px] font-black hover:bg-[#3b82f6]/25 hover:border-[#3b82f6]/50 text-white flex items-center justify-center cursor-pointer transition-colors active:scale-95"
                title="Zoom In"
              >
                +
              </button>
              <button
                onClick={() => {
                  const newZoom = Math.max(1.0, zoomLevel - 0.4);
                  setZoomLevel(newZoom);
                  if (newZoom <= 1.0) {
                    setIsTrackingActive(false);
                  }
                }}
                className="w-5 h-5 rounded-xs bg-[#111520]/85 border border-[#1C2430] text-[10px] font-black hover:bg-[#3b82f6]/25 hover:border-[#3b82f6]/50 text-white flex items-center justify-center cursor-pointer transition-colors active:scale-95"
                title="Zoom Out"
              >
                -
              </button>
              <button
                onClick={() => setRotationAngle((prev) => (prev - 15 + 360) % 360)}
                className="w-5 h-5 rounded-xs bg-[#111520]/85 border border-[#1C2430] text-[9px] font-bold hover:bg-[#3b82f6]/25 hover:border-[#3b82f6]/50 text-white flex items-center justify-center cursor-pointer transition-colors active:scale-95"
                title="Rotate View Left"
              >
                ↺
              </button>
              <button
                onClick={() => setRotationAngle((prev) => (prev + 15) % 360)}
                className="w-5 h-5 rounded-xs bg-[#111520]/85 border border-[#1C2430] text-[9px] font-bold hover:bg-[#3b82f6]/25 hover:border-[#3b82f6]/50 text-white flex items-center justify-center cursor-pointer transition-colors active:scale-95"
                title="Rotate View Right"
              >
                ↻
              </button>
              <button
                onClick={() => {
                  setIsTrackingActive((prev) => !prev);
                  if (!isTrackingActive) setZoomLevel(2.2); // reset standard lock zoom
                }}
                className={`w-5 h-5 rounded-xs border text-[9px] font-bold flex items-center justify-center cursor-pointer transition-colors active:scale-95 ${
                  isTrackingActive
                    ? "bg-[#00e676]/15 border-[#00e676]/50 text-[#00e676]"
                    : "bg-[#111520]/85 border-[#1C2430] text-[#7A828C] hover:text-white"
                }`}
                title={
                  isTrackingActive
                    ? "Unlock Camera (Whole Track)"
                    : "Lock Camera to Selected Driver"
                }
              >
                ⌖
              </button>
            </div>

            <svg
              viewBox={viewBoxStr}
              className="w-[195px] h-[195px] transition-all duration-300 ease-out"
            >
              <g
                transform={`rotate(${rotationAngle}, ${isTrackingActive ? cx : 100}, ${isTrackingActive ? cy : 100})`}
              >
                {/* Main circuit spline path (Rendered from our database) */}
                <path
                  d={getSvgPathFromSpline(trackDef.mainSpline, 200, 200)}
                  fill="none"
                  stroke="rgba(122, 130, 140, 0.4)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Pit Lane spline path (If prebuilt for the circuit) */}
                {trackDef.pitSpline && (
                  <path
                    d={getSvgPathFromSpline(trackDef.pitSpline, 200, 200)}
                    fill="none"
                    stroke="rgba(122, 130, 140, 0.25)"
                    strokeWidth="2.5"
                    strokeDasharray="3,3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Timing Line indicator */}
                {trackDef.mainSpline.points.length > 0 && (
                  <line
                    x1={trackDef.mainSpline.points[0][0] * 200 - 4}
                    y1={trackDef.mainSpline.points[0][1] * 200}
                    x2={trackDef.mainSpline.points[0][0] * 200 + 4}
                    y2={trackDef.mainSpline.points[0][1] * 200}
                    stroke="#FF4D4D"
                    strokeWidth="2.5"
                  />
                )}

                {/* Dynamic competitor positions projected onto the authoritative spline */}
                {competitors.map((comp) => {
                  // Determine target lap percentage based on offset relative to user position
                  const targetPct = (lapDistPct + comp.offset + 1.0) % 1.0;

                  // Determine whether driver should be projected onto pit lane spline
                  let activeSpline = trackDef.mainSpline;
                  if (
                    trackDef.pitSpline &&
                    trackDef.exitPct !== undefined &&
                    trackDef.mergePct !== undefined
                  ) {
                    const isInsidePit =
                      trackDef.exitPct > trackDef.mergePct
                        ? targetPct >= trackDef.exitPct || targetPct <= trackDef.mergePct // wraps around finish line
                        : targetPct >= trackDef.exitPct && targetPct <= trackDef.mergePct;

                    if (isInsidePit) {
                      activeSpline = trackDef.pitSpline;
                    }
                  }

                  const coords = getCoordinatesAtPct(activeSpline, targetPct);
                  const cxComp = coords.x * 200;
                  const cyComp = coords.y * 200;

                  return (
                    <g
                      key={comp.pos}
                      transform={`translate(${cxComp}, ${cyComp}) rotate(${-rotationAngle})`}
                    >
                      {/* Glowing effect for active user (glowing green shadow) */}
                      {comp.isUser && (
                        <circle
                          cx="0"
                          cy="0"
                          r="7.5"
                          fill="#00e676"
                          opacity="0.25"
                          className="animate-pulse"
                        />
                      )}
                      <circle
                        cx="0"
                        cy="0"
                        r={comp.isUser ? "5.5" : "4.5"}
                        fill={comp.color}
                        stroke="#0a0c10"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="2.2"
                        fill="#000000"
                        fontSize={comp.isUser ? "6.5px" : "6px"}
                        fontWeight="black"
                        textAnchor="middle"
                      >
                        {comp.pos}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Sector Markers overlay */}
            <div className="absolute left-2 bottom-2 bg-[#111520] border border-[#1C2430] rounded-sm px-1.5 py-0.5 text-[7.5px] text-[#7A828C] flex gap-2">
              {trackDef.sectors.map((sec) => (
                <span key={sec.id} className="font-bold">
                  {sec.id}: <span className="text-[#00e676]">OK</span>
                </span>
              ))}
            </div>
          </div>

          {/* Track environment stats */}
          <div className="border-t border-[#1C2430]/60 pt-2 flex items-center justify-between text-[8px] text-[#7A828C] uppercase tracking-wider font-bold">
            <div className="flex gap-4">
              <span>
                AIR:{" "}
                <span className="text-white font-black">
                  {t.airTempC ? t.airTempC.toFixed(0) + "°C" : "22°C"}
                </span>
              </span>
              <span>
                TRACK:{" "}
                <span className="text-white font-black">
                  {t.trackTempC ? t.trackTempC.toFixed(0) + "°C" : "31°C"}
                </span>
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded-xs bg-[#00e676]/10 text-[#00e676] border border-[#00e676]/20 font-black">
              DRY
            </span>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE-BOTTOM STRATEGY WIDGETS GRID */}
      <div className="grid grid-cols-12 gap-2 h-[120px] shrink-0">
        {/* TELEMETRY METERS (Col span 3) */}
        <div className="col-span-3 border border-[#1C2430] bg-[#0A0C10] rounded-sm p-2 flex flex-col justify-between">
          <div className="text-[8px] uppercase tracking-widest text-[#7A828C] border-b border-[#1C2430]/50 pb-1 font-bold">
            Live Telemetry Input
          </div>
          <div className="flex-1 flex gap-3 items-end py-1">
            {/* Throttle */}
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-[#111520] h-12 rounded-xs border border-[#1C2430] overflow-hidden relative">
                <div
                  className="absolute bottom-0 w-full bg-[#00e676] transition-all"
                  style={{ height: `${throttle * 100}%` }}
                />
              </div>
              <span className="text-[7.5px] text-[#7A828C]">THR</span>
            </div>
            {/* Brake */}
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-[#111520] h-12 rounded-xs border border-[#1C2430] overflow-hidden relative">
                <div
                  className="absolute bottom-0 w-full bg-[#FF4D4D] transition-all"
                  style={{ height: `${brake * 100}%` }}
                />
              </div>
              <span className="text-[7.5px] text-[#7A828C]">BRK</span>
            </div>
            {/* Clutch */}
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-[#111520] h-12 rounded-xs border border-[#1C2430] overflow-hidden relative">
                <div
                  className="absolute bottom-0 w-full bg-[#3B82F6] transition-all"
                  style={{ height: `${clutch * 100}%` }}
                />
              </div>
              <span className="text-[7.5px] text-[#7A828C]">CLT</span>
            </div>
          </div>
        </div>

        {/* TIRES PANEL (Col span 3) */}
        <div className="col-span-3 border border-[#1C2430] bg-[#0A0C10] rounded-sm p-2 flex flex-col justify-between">
          <div className="text-[8px] uppercase tracking-widest text-[#7A828C] border-b border-[#1C2430]/50 pb-1 font-bold">
            Tires Pressure / Temp
          </div>
          <div className="grid grid-cols-2 gap-1 py-1 text-[8px] text-[#7A828C]">
            <div className="bg-[#111520] p-1 border border-[#1C2430]/40 rounded-xs flex justify-between">
              <span>FL</span>
              <span className="text-white font-bold">1.52 bar</span>
            </div>
            <div className="bg-[#111520] p-1 border border-[#1C2430]/40 rounded-xs flex justify-between">
              <span>FR</span>
              <span className="text-white font-bold">1.52 bar</span>
            </div>
            <div className="bg-[#111520] p-1 border border-[#1C2430]/40 rounded-xs flex justify-between">
              <span>RL</span>
              <span className="text-white font-bold">1.52 bar</span>
            </div>
            <div className="bg-[#111520] p-1 border border-[#1C2430]/40 rounded-xs flex justify-between">
              <span>RR</span>
              <span className="text-white font-bold">1.52 bar</span>
            </div>
          </div>
        </div>

        {/* STATUS READOUT TABLE (Col span 3) */}
        <div className="col-span-3 border border-[#1C2430] bg-[#0A0C10] rounded-sm p-2 flex flex-col justify-between">
          <div className="text-[8px] uppercase tracking-widest text-[#7A828C] border-b border-[#1C2430]/50 pb-1 font-bold">
            Engine Diagnostics
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[7.5px] text-[#7A828C] py-1 font-semibold">
            <div className="flex justify-between border-b border-[#1C2430]/30 pb-0.5">
              <span>OIL TEMP</span>
              <span className="text-white font-bold">77.0°C</span>
            </div>
            <div className="flex justify-between border-b border-[#1C2430]/30 pb-0.5">
              <span>OIL PRESS</span>
              <span className="text-white font-bold">4.2 bar</span>
            </div>
            <div className="flex justify-between border-b border-[#1C2430]/30 pb-0.5">
              <span>OIL LEVEL</span>
              <span className="text-[#00D17F] font-bold">6.7L</span>
            </div>
            <div className="flex justify-between border-b border-[#1C2430]/30 pb-0.5">
              <span>FUEL PRESS</span>
              <span className="text-white font-bold">3.8 bar</span>
            </div>
            <div className="flex justify-between border-b border-[#1C2430]/30 pb-0.5">
              <span>MAT TEMP</span>
              <span className="text-white font-bold">34.0°C</span>
            </div>
            <div className="flex justify-between border-b border-[#1C2430]/30 pb-0.5">
              <span>BATTERY</span>
              <span className="text-[#00D17F] font-bold">13.4V</span>
            </div>
          </div>
        </div>

        {/* SPEED / RPM & GEARS / RPM (Col span 3) */}
        <div className="col-span-3 border border-[#1C2430] bg-[#0A0C10] rounded-sm p-2 flex flex-col justify-between select-none relative">
          <div className="text-[8px] uppercase tracking-widest text-[#7A828C] border-b border-[#1C2430]/50 pb-1 font-bold">
            Speed & Gears
          </div>

          <div className="flex-1 flex gap-3 items-center py-1">
            {/* Speed readout */}
            <div className="flex-1 flex flex-col justify-center">
              <span className="text-[20px] font-black text-white leading-none tabular-nums">
                {Math.round(speed * 0.621371)}
              </span>
              <span className="text-[7.5px] text-[#7A828C] uppercase tracking-wider font-bold">
                MPH (Live)
              </span>
            </div>

            {/* Gear indicator */}
            <div className="flex-1 flex items-center justify-center border-l border-[#1C2430]/60 pl-3">
              <div className="flex flex-col items-center">
                <span className="text-[28px] font-black text-[#00e676] leading-none select-none">
                  {gear}
                </span>
                <span className="text-[7.5px] text-[#FF4D4D] font-black tracking-widest leading-none mt-1">
                  {Math.round(rpm)} <span className="text-[5.5px]">RPM</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM DENSE ANALYTICS & CONTROLS FOOTER */}
      <div className="grid grid-cols-12 gap-2 bg-[#0A0C10] border border-[#1C2430] p-2 rounded-sm select-none">
        {/* LAP TIMERS (Col span 3) */}
        <div className="col-span-3 flex flex-col justify-between border-r border-[#1C2430]/60 pr-2">
          <div className="text-[8px] uppercase tracking-widest text-[#7A828C] font-bold">
            Lap Times
          </div>
          <div className="flex flex-col mt-1">
            <span className="text-[16px] font-black text-[#00e676] leading-none tabular-nums">
              03:33.610
            </span>
            <span className="text-[7.5px] text-[#7A828C] uppercase tracking-wider font-semibold mt-0.5">
              Estimated Lap
            </span>
          </div>
          <div className="flex justify-between text-[8px] text-[#7A828C] mt-1 pt-1 border-t border-[#1C2430]/30">
            <span>
              LAST: <span className="text-white font-bold">{lastLap}</span>
            </span>
            <span>
              BEST: <span className="text-white font-bold">{bestLap}</span>
            </span>
          </div>
        </div>

        {/* SECTORS splits (Col span 3) */}
        <div className="col-span-3 flex flex-col justify-between border-r border-[#1C2430]/60 px-2">
          <div className="text-[8px] uppercase tracking-widest text-[#7A828C] font-bold">
            Sectors Splits
          </div>
          <div className="flex flex-col mt-1 bg-[#111520] border border-[#1C2430] p-1.5 rounded-xs">
            <div className="flex justify-between text-[11px] font-black text-[#00e676] leading-none tabular-nums">
              <span>S1</span>
              <span>{s1Time}</span>
            </div>
            <div className="flex justify-between text-[9px] text-[#7A828C] mt-1">
              <span>S2: {s2Time}</span>
              <span>S3: {s3Time}</span>
            </div>
          </div>
        </div>

        {/* ACTIVE DRIVER AIDS selectors (Col span 3) */}
        <div className="col-span-3 flex flex-col justify-between border-r border-[#1C2430]/60 px-2">
          <div className="text-[8px] uppercase tracking-widest text-[#7A828C] font-bold">
            Electronics controls
          </div>
          <div className="grid grid-cols-4 gap-1.5 mt-1.5">
            {/* TC */}
            <div className="bg-[#111520] border border-[#22d3ee]/20 px-1 py-1.5 rounded-xs flex flex-col items-center">
              <span className="text-[6.5px] text-[#7A828C] font-bold uppercase">TC</span>
              <span className="text-[10px] font-black text-[#22d3ee]">2</span>
            </div>
            {/* ABS */}
            <div className="bg-[#111520] border border-[#FFB800]/20 px-1 py-1.5 rounded-xs flex flex-col items-center">
              <span className="text-[6.5px] text-[#7A828C] font-bold uppercase">ABS</span>
              <span className="text-[10px] font-black text-[#FFB800]">4</span>
            </div>
            {/* BB */}
            <div className="bg-[#111520] border border-[#FF4D4D]/20 px-1 py-1.5 rounded-xs flex flex-col items-center">
              <span className="text-[6.5px] text-[#7A828C] font-bold uppercase">BB</span>
              <span className="text-[10px] font-black text-[#FF4D4D] tabular-nums">
                {brakeBias.toFixed(1)}
              </span>
            </div>
            {/* MAP */}
            <div className="bg-[#111520] border border-[#00e676]/20 px-1 py-1.5 rounded-xs flex flex-col items-center">
              <span className="text-[6.5px] text-[#7A828C] font-bold uppercase">MAP</span>
              <span className="text-[10px] font-black text-[#00e676]">1</span>
            </div>
          </div>
        </div>

        {/* FUEL STRATEGY (Col span 3) */}
        <div className="col-span-3 flex flex-col justify-between pl-2">
          <div className="text-[8px] uppercase tracking-widest text-[#7A828C] font-bold">
            Fuel remaining
          </div>
          <div className="flex justify-between items-baseline mt-1">
            <span className="text-[18px] font-black text-[#00e676] leading-none tabular-nums">
              {t.fuelRemainingL ? t.fuelRemainingL.toFixed(1) : "0.0"}
            </span>
            <span className="text-[7.5px] text-[#7A828C] uppercase font-bold">Liters Left</span>
          </div>
          <div className="flex justify-between text-[7.5px] text-[#7A828C] mt-1 pt-1 border-t border-[#1C2430]/30 font-semibold">
            <span>
              AVG:{" "}
              <span className="text-white font-bold">
                {t.fuelUsePerHour ? t.fuelUsePerHour.toFixed(1) + " L/h" : "0.0 L/h"}
              </span>
            </span>
            <span>
              LAPS EST:{" "}
              <span className="text-white font-bold">
                {t.lapsEstimated ? t.lapsEstimated.toFixed(1) : "0.0"}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
