import React, { useEffect, useRef } from "react";
import { useTelemetry } from "@/lib/useTelemetry";
import { TelemetryInstrument } from "./TelemetryInstrument";
import { Activity, Sliders, ChevronUp, ChevronDown } from "lucide-react";

interface ChassisInstrumentProps {
  telemetry?: any;
  mode?: "live" | "replay" | "compare";
}

export function ChassisInstrument({ telemetry: propTelemetry, mode = "live" }: ChassisInstrumentProps) {
  const liveTelemetry = useTelemetry();
  const t = propTelemetry || liveTelemetry;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Extract or calculate pitch, roll, and shock deflections
  const speed = t.speedKph ?? 180;
  const steer = t.steeringDeg ?? 0;
  const gLat = t.gLat ?? 0;
  const gLon = t.gLon ?? 0;
  const throttle = t.throttle ?? 0;
  const brake = t.brake ?? 0;

  // Real-time pitches and rolls
  const pitchVal = -gLon * 1.8; // degrees pitch nose down
  const rollVal = gLat * 2.2;   // degrees roll right

  // Four-corner shock deflections (0 = fully extended, 100 = bump stop)
  const baseFl = 45 + (brake * 18) - (throttle * 8) - (gLat * 12);
  const baseFr = 45 + (brake * 18) - (throttle * 8) + (gLat * 12);
  const baseRl = 42 - (brake * 10) + (throttle * 22) - (gLat * 8);
  const baseRr = 42 - (brake * 10) + (throttle * 22) + (gLat * 8);

  const flDeflect = Math.max(5, Math.min(95, baseFl + Math.sin(performance.now() / 80) * 1.5));
  const frDeflect = Math.max(5, Math.min(95, baseFr + Math.sin(performance.now() / 90) * 1.5));
  const rlDeflect = Math.max(5, Math.min(95, baseRl + Math.cos(performance.now() / 85) * 1.2));
  const rrDeflect = Math.max(5, Math.min(95, baseRr + Math.cos(performance.now() / 95) * 1.2));

  // Render pitching vector silhouette on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Dark grid background
    ctx.strokeStyle = "#1C2430/40";
    ctx.lineWidth = 0.5;
    for (let x = 10; x < w; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 10; y < h; y += 15) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Ground reference line
    ctx.strokeStyle = "#263241";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, h - 14);
    ctx.lineTo(w - 10, h - 14);
    ctx.stroke();

    // Draw pitching prototype car body
    ctx.save();
    ctx.translate(w / 2, h / 2 - 4);
    
    // Apply pitch rotation
    const rotationRad = (pitchVal * Math.PI) / 180;
    ctx.rotate(rotationRad);

    // Car silhouette coordinates (relative to center)
    // Front is to the right
    ctx.fillStyle = "#11161D";
    ctx.strokeStyle = "#3B82F6";
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    // rear diffuser
    ctx.moveTo(-50, 10);
    ctx.lineTo(-52, -2);
    // wing
    ctx.lineTo(-45, -2);
    ctx.lineTo(-44, -14);
    ctx.lineTo(-32, -14);
    ctx.lineTo(-34, -2);
    // roofline
    ctx.lineTo(-12, -18);
    ctx.lineTo(14, -18);
    ctx.lineTo(24, -2);
    // hood
    ctx.lineTo(44, -2);
    // splitter nose
    ctx.lineTo(48, 8);
    ctx.lineTo(10, 10);
    // front wheel bay
    ctx.lineTo(0, 10);
    ctx.lineTo(-15, 10);
    // rear wheel bay
    ctx.lineTo(-35, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Wheels (representing suspension deflection)
    ctx.fillStyle = "#FFB800";
    // Front wheel offset by deflection
    const frWOffset = (frDeflect - 45) * 0.08;
    ctx.beginPath();
    ctx.arc(28, 10 + frWOffset, 6, 0, Math.PI * 2);
    ctx.fill();

    // Rear wheel offset by deflection
    const rrWOffset = (rrDeflect - 42) * 0.08;
    ctx.beginPath();
    ctx.arc(-24, 10 + rrWOffset, 6.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }, [pitchVal, frDeflect, rrDeflect]);

  const aiAdvice = `SUSPENSION & AERO WORKBENCH BRIEFING:
- Aerodynamic Platform: Rake dynamic angle: ${(pitchVal * 0.2).toFixed(3)} deg. Pitch stability is high under peak braking forces.
- High-Speed Compression: Rear dampers show peak speed of ${Math.max(rlDeflect, rrDeflect).toFixed(0)} mm/s. Front travel peaks at ${Math.max(flDeflect, frDeflect).toFixed(1)}% of total stroke.
- Tuning Recommendation: Add +1 click of front bump stiffness to suppress splitter grounding during threshold braking.`;

  return (
    <TelemetryInstrument
      title="Chassis Instrument"
      mode={mode}
      activeStatus="AERO STABLE"
      activeStatusColor="text-[#3B82F6] border-[#3B82F6]/30 bg-[#3B82F6]/10"
      onAiAnalyze={() => {}}
      aiAdvice={aiAdvice}
    >
      <div className="p-3 h-full flex flex-col justify-between font-mono bg-[#05070A] text-white">
        <div className="grid grid-cols-12 gap-3 flex-1">
          
          {/* Left panel: Car Silhouette & pitch/roll telemetry */}
          <div className="col-span-6 flex flex-col justify-between border-r border-[#1C2430]/60 pr-3">
            <div className="text-[10px] text-[#7A828C] border-b border-[#1C2430]/40 pb-1 uppercase font-bold tracking-wider flex justify-between">
              <span>Platform Dynamics</span>
              <span className="text-[#3B82F6] tabular-nums">PITCH: {pitchVal.toFixed(2)}°</span>
            </div>

            {/* Vector Silhouette Canvas */}
            <div className="flex-1 flex items-center justify-center py-2">
              <canvas ref={canvasRef} width={140} height={70} className="border border-[#1C2430] bg-[#0B0F14] rounded-sm" />
            </div>

            {/* Platform stats */}
            <div className="grid grid-cols-2 gap-2 text-[9px] text-[#7A828C]">
              <div className="flex justify-between items-center bg-[#0B0F14] border border-[#1C2430]/60 px-1.5 py-0.5 rounded-sm">
                <span>ROLL</span>
                <span className="text-white font-bold tabular-nums">{rollVal.toFixed(2)}°</span>
              </div>
              <div className="flex justify-between items-center bg-[#0B0F14] border border-[#1C2430]/60 px-1.5 py-0.5 rounded-sm">
                <span>HEAVE</span>
                <span className="text-[#00D17F] font-bold tabular-nums">{(Math.max(0, -gLon) * 1.5).toFixed(1)}mm</span>
              </div>
            </div>
          </div>

          {/* Right panel: Damper Deflection Histograms */}
          <div className="col-span-6 flex flex-col justify-between pl-1">
            <div className="text-[10px] text-[#7A828C] border-b border-[#1C2430]/40 pb-1.5 uppercase font-bold tracking-wider">
              Damper Stroke Deflection
            </div>

            {/* Front & Rear Deflection Bars */}
            <div className="flex-1 flex flex-col justify-center gap-2.5 my-2">
              {/* Front suspension */}
              <div className="space-y-1">
                <div className="flex justify-between text-[8px] text-[#7A828C]">
                  <span>FRONT INST TRAVEL (FL/FR)</span>
                  <span className="text-white tabular-nums font-bold">{flDeflect.toFixed(0)}% / {frDeflect.toFixed(0)}%</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-[#0B0F14] h-2 rounded-xs border border-[#1C2430] overflow-hidden">
                    <div className="h-full bg-[#3B82F6]" style={{ width: `${flDeflect}%` }} />
                  </div>
                  <div className="flex-1 bg-[#0B0F14] h-2 rounded-xs border border-[#1C2430] overflow-hidden">
                    <div className="h-full bg-[#3B82F6]" style={{ width: `${frDeflect}%` }} />
                  </div>
                </div>
              </div>

              {/* Rear suspension */}
              <div className="space-y-1">
                <div className="flex justify-between text-[8px] text-[#7A828C]">
                  <span>REAR INST TRAVEL (RL/RR)</span>
                  <span className="text-white tabular-nums font-bold">{rlDeflect.toFixed(0)}% / {rrDeflect.toFixed(0)}%</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-[#0B0F14] h-2 rounded-xs border border-[#1C2430] overflow-hidden">
                    <div className="h-full bg-[#8B5CF6]" style={{ width: `${rlDeflect}%` }} />
                  </div>
                  <div className="flex-1 bg-[#0B0F14] h-2 rounded-xs border border-[#1C2430] overflow-hidden">
                    <div className="h-full bg-[#8B5CF6]" style={{ width: `${rrDeflect}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Click adjustments */}
            <div className="grid grid-cols-2 gap-1.5 text-[8px] text-[#7A828C]">
              <div className="flex justify-between bg-[#0B0F14] border border-[#1C2430] px-1.5 py-0.5 rounded-sm">
                <span>F BUMP CLICKS</span>
                <span className="text-[#FFB800] font-black">+14 C</span>
              </div>
              <div className="flex justify-between bg-[#0B0F14] border border-[#1C2430] px-1.5 py-0.5 rounded-sm">
                <span>R REBOUND CLICKS</span>
                <span className="text-[#8B5CF6] font-black">+18 C</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </TelemetryInstrument>
  );
}
