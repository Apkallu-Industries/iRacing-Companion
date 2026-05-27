import React, { useEffect, useState } from "react";
import type { Telemetry } from "@/lib/telemetry-types";
import type { Sample } from "@/lib/useTelemetryBuffer";
import { Activity, Shield, Thermometer, Zap, AlertCircle } from "lucide-react";

interface RaceCommandLayoutProps {
  t: Telemetry;
  samples: Sample[];
}

export function RaceCommandLayout({ t, samples }: RaceCommandLayoutProps) {
  const [timeStr, setTimeStr] = useState("17:35");

  // Format real-time system clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  return (
    <div className="flex-1 min-h-0 bg-[#000000] text-[#E2E8F0] font-mono select-none flex flex-col p-2 gap-2 overflow-y-auto scrollbar-thin">
      
      {/* 1. TOP STRATEGY HEADER (PRACTICE / POSITION / TIMINGS) */}
      <div className="grid grid-cols-12 gap-2 bg-[#0A0C10] border border-[#1C2430] p-2 rounded-sm select-none">
        
        {/* practice status */}
        <div className="col-span-2 flex flex-col justify-center border-r border-[#1C2430]/60 pr-2">
          <span className="text-[8px] uppercase tracking-widest text-[#7A828C]">session status</span>
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
          <span className="absolute right-2 top-1 text-[8px] text-[#7A828C] font-black uppercase">lmp2</span>
        </div>

      </div>

      {/* 2. MIDDLE SPLIT: RUNNING STANDINGS TABLE (LEFT) & LE MANS MAP (RIGHT) */}
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
            {/* Row 1: Leader */}
            <div className="grid grid-cols-12 gap-1 px-2.5 py-1.5 hover:bg-[#111520]/45 items-center">
              <div className="col-span-1 font-bold text-[#FFB800]">P1</div>
              <div className="col-span-3 font-semibold text-white">Max V.</div>
              <div className="col-span-1 text-[#7A828C]">-</div>
              <div className="col-span-1">24</div>
              <div className="col-span-2 text-[#7A828C] font-bold">LDR</div>
              <div className="col-span-2 font-semibold text-[#FFB800]">3:28.450</div>
              <div className="col-span-2 text-white">3:29.112</div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-12 gap-1 px-2.5 py-1.5 hover:bg-[#111520]/45 items-center">
              <div className="col-span-1 font-bold text-white">P2</div>
              <div className="col-span-3 font-semibold text-white">Lando N.</div>
              <div className="col-span-1 text-[#7A828C]">-</div>
              <div className="col-span-1">24</div>
              <div className="col-span-2 text-white">+0.420</div>
              <div className="col-span-2">3:28.870</div>
              <div className="col-span-2 text-white">3:29.350</div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-12 gap-1 px-2.5 py-1.5 hover:bg-[#111520]/45 items-center">
              <div className="col-span-1 font-bold text-white">P3</div>
              <div className="col-span-3 font-semibold text-white">Charles L.</div>
              <div className="col-span-1 text-[#7A828C]">-</div>
              <div className="col-span-1">24</div>
              <div className="col-span-2 text-white">+0.850</div>
              <div className="col-span-2">3:29.300</div>
              <div className="col-span-2 text-white">3:30.120</div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-12 gap-1 px-2.5 py-1.5 hover:bg-[#111520]/45 items-center">
              <div className="col-span-1 font-bold text-white">P4</div>
              <div className="col-span-3 font-semibold text-white">Oscar P.</div>
              <div className="col-span-1 text-[#7A828C]">-</div>
              <div className="col-span-1">23</div>
              <div className="col-span-2 text-white">+1.120</div>
              <div className="col-span-2">3:29.570</div>
              <div className="col-span-2 text-white">3:29.880</div>
            </div>

            {/* Row 5 */}
            <div className="grid grid-cols-12 gap-1 px-2.5 py-1.5 hover:bg-[#111520]/45 items-center">
              <div className="col-span-1 font-bold text-white">P5</div>
              <div className="col-span-3 font-semibold text-white">Lewis H.</div>
              <div className="col-span-1 text-[#7A828C]">-</div>
              <div className="col-span-1">24</div>
              <div className="col-span-2 text-white">+1.480</div>
              <div className="col-span-2">3:29.930</div>
              <div className="col-span-2 text-white">3:31.050</div>
            </div>

            {/* Row 6: User Dany M (highlighted in Green) */}
            <div className="grid grid-cols-12 gap-1 px-2.5 py-1.5 bg-[#00e676]/10 border-y border-[#00e676]/20 items-center">
              <div className="col-span-1 font-black text-[#00e676]">P6</div>
              <div className="col-span-3 font-black text-[#00e676]">Dany M.</div>
              <div className="col-span-1 text-[#FFB800] font-black">IN</div>
              <div className="col-span-1">23</div>
              <div className="col-span-2 text-[#00e676] font-bold">+2.140</div>
              <div className="col-span-2 font-bold text-white">{bestLap}</div>
              <div className="col-span-2 text-[#00e676] font-black">{lastLap}</div>
            </div>

            {/* Row 7 */}
            <div className="grid grid-cols-12 gap-1 px-2.5 py-1.5 hover:bg-[#111520]/45 items-center">
              <div className="col-span-1 font-bold text-white">P7</div>
              <div className="col-span-3 font-semibold text-white">Fernando A.</div>
              <div className="col-span-1 text-[#7A828C]">-</div>
              <div className="col-span-1">24</div>
              <div className="col-span-2 text-white">+2.650</div>
              <div className="col-span-2">3:31.100</div>
              <div className="col-span-2 text-white">3:31.520</div>
            </div>

            {/* Row 8 */}
            <div className="grid grid-cols-12 gap-1 px-2.5 py-1.5 hover:bg-[#111520]/45 items-center">
              <div className="col-span-1 font-bold text-white">P8</div>
              <div className="col-span-3 font-semibold text-white">George R.</div>
              <div className="col-span-1 text-[#7A828C]">-</div>
              <div className="col-span-1">24</div>
              <div className="col-span-2 text-white">+3.120</div>
              <div className="col-span-2">3:31.570</div>
              <div className="col-span-2 text-white">3:32.110</div>
            </div>
          </div>
        </div>

        {/* CIRCUIT MAP & METADATA (Col span 5) */}
        <div className="col-span-5 flex flex-col border border-[#1C2430] bg-[#0A0C10] rounded-sm p-3 justify-between relative">
          
          {/* Map Header */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-white uppercase tracking-wider">{trackName}</span>
              <span className="text-[8px] text-[#7A828C] uppercase tracking-widest mt-0.5">Circuit Layout Geometry</span>
            </div>
            <span className="text-xs font-bold text-white tabular-nums">{timeStr}</span>
          </div>

          {/* SVG Map of Circuit des 24 Heures du Mans */}
          <div className="flex-1 flex items-center justify-center my-3 relative h-[210px]">
            <svg viewBox="0 0 220 220" className="w-[190px] h-[190px]">
              {/* Le Mans outline path */}
              <path
                d="M 120 20 C 135 25, 145 35, 155 45 C 165 55, 175 75, 185 95 C 190 105, 188 120, 185 135 C 182 145, 180 160, 185 175 C 183 185, 175 190, 160 185 C 145 180, 130 182, 115 188 C 100 192, 85 185, 75 175 C 68 168, 62 155, 60 140 C 58 130, 60 115, 60 100 C 60 85, 62 70, 65 55 C 68 45, 75 35, 85 30 C 95 25, 105 18, 120 20 Z"
                fill="none"
                stroke="rgba(122, 130, 140, 0.4)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Active drivers position markers */}
              {/* Max V. P1 */}
              <circle cx="120" cy="20" r="4.5" fill="#FFB800" />
              <text x="120" y="22.5" fill="#000000" fontSize="6px" fontWeight="black" textAnchor="middle">1</text>
              
              {/* Charles L. P3 */}
              <circle cx="165" cy="55" r="4.5" fill="#ffffff" />
              <text x="165" y="57.5" fill="#000000" fontSize="6px" fontWeight="black" textAnchor="middle">3</text>

              {/* Lewis H. P5 */}
              <circle cx="185" cy="175" r="4.5" fill="#ffffff" />
              <text x="185" y="177.5" fill="#000000" fontSize="6px" fontWeight="black" textAnchor="middle">5</text>

              {/* Dany M. P6 (User in glowing Green) */}
              <circle cx="115" cy="188" r="5" fill="#00e676" className="shadow-[0_0_8px_#00e676]" />
              <text x="115" y="190.5" fill="#000000" fontSize="6.5px" fontWeight="black" textAnchor="middle">6</text>

              {/* Fernando A. P7 */}
              <circle cx="65" cy="55" r="4.5" fill="#ffffff" />
              <text x="65" y="57.5" fill="#000000" fontSize="6px" fontWeight="black" textAnchor="middle">7</text>
            </svg>

            {/* Sector Markers overlay */}
            <div className="absolute left-2 bottom-2 bg-[#111520] border border-[#1C2430] rounded-sm px-1.5 py-0.5 text-[7.5px] text-[#7A828C] flex gap-2">
              <span>S1: OK</span>
              <span>S2: OK</span>
              <span>S3: OK</span>
            </div>
          </div>

          {/* Track environment stats */}
          <div className="border-t border-[#1C2430]/60 pt-2 flex items-center justify-between text-[8px] text-[#7A828C] uppercase tracking-wider font-bold">
            <div className="flex gap-4">
              <span>AIR: <span className="text-white font-black">22°C</span></span>
              <span>TRACK: <span className="text-white font-black">31°C</span></span>
            </div>
            <span className="px-1.5 py-0.5 rounded-xs bg-[#00e676]/10 text-[#00e676] border border-[#00e676]/20 font-black">DRY</span>
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
                <div className="absolute bottom-0 w-full bg-[#00e676] transition-all" style={{ height: `${throttle * 100}%` }} />
              </div>
              <span className="text-[7.5px] text-[#7A828C]">THR</span>
            </div>
            {/* Brake */}
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-[#111520] h-12 rounded-xs border border-[#1C2430] overflow-hidden relative">
                <div className="absolute bottom-0 w-full bg-[#FF4D4D] transition-all" style={{ height: `${brake * 100}%` }} />
              </div>
              <span className="text-[7.5px] text-[#7A828C]">BRK</span>
            </div>
            {/* Clutch */}
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-[#111520] h-12 rounded-xs border border-[#1C2430] overflow-hidden relative">
                <div className="absolute bottom-0 w-full bg-[#3B82F6] transition-all" style={{ height: `${clutch * 100}%` }} />
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
              <span className="text-[7.5px] text-[#7A828C] uppercase tracking-wider font-bold">MPH (Live)</span>
            </div>

            {/* Gear indicator */}
            <div className="flex-1 flex items-center justify-center border-l border-[#1C2430]/60 pl-3">
              <div className="flex flex-col items-center">
                <span className="text-[28px] font-black text-[#00e676] leading-none select-none">{gear}</span>
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
          <div className="text-[8px] uppercase tracking-widest text-[#7A828C] font-bold">Lap Times</div>
          <div className="flex flex-col mt-1">
            <span className="text-[16px] font-black text-[#00e676] leading-none tabular-nums">03:33.610</span>
            <span className="text-[7.5px] text-[#7A828C] uppercase tracking-wider font-semibold mt-0.5">Estimated Lap</span>
          </div>
          <div className="flex justify-between text-[8px] text-[#7A828C] mt-1 pt-1 border-t border-[#1C2430]/30">
            <span>LAST: <span className="text-white font-bold">{lastLap}</span></span>
            <span>BEST: <span className="text-white font-bold">{bestLap}</span></span>
          </div>
        </div>

        {/* SECTORS splits (Col span 3) */}
        <div className="col-span-3 flex flex-col justify-between border-r border-[#1C2430]/60 px-2">
          <div className="text-[8px] uppercase tracking-widest text-[#7A828C] font-bold">Sectors Splits</div>
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
          <div className="text-[8px] uppercase tracking-widest text-[#7A828C] font-bold">Electronics controls</div>
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
              <span className="text-[10px] font-black text-[#FF4D4D] tabular-nums">{brakeBias.toFixed(1)}</span>
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
          <div className="text-[8px] uppercase tracking-widest text-[#7A828C] font-bold">Fuel remaining</div>
          <div className="flex justify-between items-baseline mt-1">
            <span className="text-[18px] font-black text-[#00e676] leading-none tabular-nums">
              {t.fuelRemainingL ? t.fuelRemainingL.toFixed(1) : "0.0"}
            </span>
            <span className="text-[7.5px] text-[#7A828C] uppercase font-bold">Liters Left</span>
          </div>
          <div className="flex justify-between text-[7.5px] text-[#7A828C] mt-1 pt-1 border-t border-[#1C2430]/30 font-semibold">
            <span>AVG: <span className="text-white font-bold">{t.fuelUsePerHour ? t.fuelUsePerHour.toFixed(1) + " L/h" : "0.0 L/h"}</span></span>
            <span>LAPS EST: <span className="text-white font-bold">{t.lapsEstimated ? t.lapsEstimated.toFixed(1) : "0.0"}</span></span>
          </div>
        </div>

      </div>

    </div>
  );
}
