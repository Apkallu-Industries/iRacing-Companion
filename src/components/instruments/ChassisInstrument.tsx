import React, { useEffect, useRef, useState } from "react";
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
  const [viewMode, setViewMode] = useState<"side" | "front">("side");

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

  // Render pitching/rolling vector silhouette on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Dark grid background
    ctx.strokeStyle = "rgba(28, 36, 48, 0.3)";
    ctx.lineWidth = 0.5;
    for (let x = 10; x < w; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 10; y < h; y += 12) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Ground reference line
    ctx.strokeStyle = "#1C2430";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(10, h - 20);
    ctx.lineTo(w - 10, h - 20);
    ctx.stroke();

    ctx.save();
    ctx.translate(w / 2, h / 2 - 10);

    const frWOffset = (frDeflect - 45) * 0.2;
    const flWOffset = (flDeflect - 45) * 0.2;
    const rrWOffset = (rrDeflect - 42) * 0.2;
    const rlWOffset = (rlDeflect - 42) * 0.2;

    if (viewMode === "side") {
      // ════════════════ SIDE VIEW MODE ════════════════
      
      // Apply pitch rotation
      const rotationRad = (pitchVal * Math.PI) / 180;
      ctx.rotate(rotationRad);

      // Draw internal wind-tunnel sub-chassis model components (Image 1 features)
      ctx.fillStyle = "rgba(122, 130, 140, 0.1)";
      ctx.strokeStyle = "rgba(122, 130, 140, 0.35)";
      ctx.lineWidth = 0.75;
      ctx.fillRect(-85, 12, 170, 3);
      ctx.strokeRect(-85, 12, 170, 3);

      // Internal compartments (balance weight boxes / test instrumentation)
      ctx.fillStyle = "rgba(59, 130, 246, 0.03)";
      ctx.fillRect(-35, -5, 70, 17);
      ctx.strokeRect(-35, -5, 70, 17);

      // Balance weights blocks (central core block in Image 1)
      ctx.fillStyle = "rgba(122, 130, 140, 0.2)";
      ctx.fillRect(-15, 2, 30, 10);
      ctx.strokeRect(-15, 2, 30, 10);

      // Draw the Transparent outer body shell (Le Mans Prototype testbed profile from Image 1)
      ctx.beginPath();
      ctx.moveTo(-85, 15);
      ctx.lineTo(-88, 5);
      ctx.lineTo(-80, 5);
      ctx.lineTo(-76, -15);
      ctx.lineTo(-58, -15);
      ctx.lineTo(-60, 5);
      ctx.lineTo(-26, 5);
      ctx.lineTo(-12, -26);
      ctx.lineTo(24, -26);
      ctx.lineTo(24, -31);
      ctx.lineTo(10, -31);
      ctx.lineTo(8, -26);
      ctx.lineTo(42, -5);
      ctx.lineTo(82, -5);
      ctx.lineTo(85, 12);
      ctx.lineTo(68, 12);
      ctx.arc(50, 12, 18, 0, Math.PI, true);
      ctx.lineTo(-22, 12);
      ctx.arc(-40, 12, 18, 0, Math.PI, true);
      ctx.closePath();

      const bodyGrad = ctx.createLinearGradient(0, -30, 0, 16);
      bodyGrad.addColorStop(0, "rgba(59, 130, 246, 0.05)");
      bodyGrad.addColorStop(1, "rgba(59, 130, 246, 0.15)");
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      ctx.strokeStyle = "rgba(59, 130, 246, 0.8)";
      ctx.lineWidth = 1.25;
      ctx.stroke();

      // Draw structural details matching Image 1
      ctx.strokeStyle = "rgba(122, 130, 140, 0.5)";
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(0, -26);
      ctx.lineTo(0, -50);
      ctx.stroke();

      ctx.fillStyle = "#00D17F";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(0, 6, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "rgba(122, 130, 140, 0.7)";
      ctx.font = "bold 5.5px monospace";
      ctx.fillText("PIVOT", 5, 8);

      ctx.strokeStyle = "rgba(251, 184, 0, 0.5)";
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      ctx.moveTo(35, 12);
      ctx.lineTo(35, -4);
      ctx.stroke();
      ctx.fillStyle = "#FFB800";
      ctx.fillRect(33, -5, 4, 1.2);

      ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
      ctx.strokeStyle = "rgba(59, 130, 246, 0.85)";
      ctx.lineWidth = 0.75;
      ctx.fillRect(-82, -18, 20, 3);
      ctx.strokeRect(-82, -18, 20, 3);
      ctx.fillStyle = "rgba(59, 130, 246, 0.75)";
      ctx.fillRect(-83, -20, 0.75, 7);
      ctx.fillRect(-61, -20, 0.75, 7);

      const frontNomX = 50; 
      const frontNomY = 12;
      const rearNomX = -40;
      const rearNomY = 12;

      const activeFrontY = frontNomY + frWOffset;
      const activeRearY = rearNomY + rrWOffset;

      // Front travel vector
      ctx.strokeStyle = "rgba(251, 184, 0, 0.35)";
      ctx.lineWidth = 0.75;
      ctx.setLineDash([1.5, 1.5]);
      ctx.beginPath();
      ctx.moveTo(frontNomX, frontNomY);
      ctx.lineTo(frontNomX, activeFrontY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = "rgba(251, 184, 0, 0.6)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(frontNomX - 4, frontNomY);
      ctx.lineTo(frontNomX + 4, frontNomY);
      ctx.moveTo(frontNomX, frontNomY - 4);
      ctx.lineTo(frontNomX, frontNomY + 4);
      ctx.stroke();

      const frTravelMm = (frDeflect - 45) * 0.8;
      ctx.fillStyle = frTravelMm >= 0 ? "#FFB800" : "#FF4D4D";
      ctx.font = "bold 6px monospace";
      ctx.fillText(
        `${frTravelMm >= 0 ? "+" : ""}${frTravelMm.toFixed(1)}mm`,
        frontNomX + 13,
        activeFrontY + 2
      );

      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(frontNomX, activeFrontY, 13, -Math.PI / 6, Math.PI / 6);
      ctx.stroke();

      // Rear travel vector
      ctx.strokeStyle = "rgba(139, 92, 246, 0.35)";
      ctx.lineWidth = 0.75;
      ctx.setLineDash([1.5, 1.5]);
      ctx.beginPath();
      ctx.moveTo(rearNomX, rearNomY);
      ctx.lineTo(rearNomX, activeRearY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = "rgba(139, 92, 246, 0.6)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(rearNomX - 4, rearNomY);
      ctx.lineTo(rearNomX + 4, rearNomY);
      ctx.moveTo(rearNomX, rearNomY - 4);
      ctx.lineTo(rearNomX, rearNomY + 4);
      ctx.stroke();

      const rrTravelMm = (rrDeflect - 42) * 0.8;
      ctx.fillStyle = rrTravelMm >= 0 ? "#8B5CF6" : "#FF4D4D";
      ctx.font = "bold 6px monospace";
      ctx.fillText(
        `${rrTravelMm >= 0 ? "+" : ""}${rrTravelMm.toFixed(1)}mm`,
        rearNomX - 31,
        activeRearY + 2
      );

      // Front Wheel Side View
      ctx.save();
      ctx.translate(frontNomX, activeFrontY);
      ctx.rotate((steer * Math.PI) / 180 * 0.2);
      ctx.fillStyle = "#090D14";
      ctx.strokeStyle = "#1C2430";
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(122, 130, 140, 0.25)";
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(6, 0);
      ctx.stroke();
      ctx.fillStyle = "#FFB800";
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Rear Wheel Side View
      ctx.save();
      ctx.translate(rearNomX, activeRearY);
      ctx.fillStyle = "#090D14";
      ctx.strokeStyle = "#1C2430";
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      ctx.arc(0, 0, 10.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(122, 130, 140, 0.25)";
      ctx.beginPath();
      ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(6.5, 0);
      ctx.stroke();
      ctx.fillStyle = "#8B5CF6";
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

    } else {
      // ════════════════ FRONT VIEW MODE ════════════════
      
      // Apply roll rotation
      const rotationRad = (rollVal * Math.PI) / 180;
      ctx.rotate(rotationRad);

      // Draw front sub-chassis floor bar (Image 1 features)
      ctx.fillStyle = "rgba(122, 130, 140, 0.1)";
      ctx.strokeStyle = "rgba(122, 130, 140, 0.35)";
      ctx.lineWidth = 0.75;
      ctx.fillRect(-70, 12, 140, 3);
      ctx.strokeRect(-70, 12, 140, 3);

      // Internal boxes from front perspective
      ctx.fillStyle = "rgba(59, 130, 246, 0.03)";
      ctx.fillRect(-22, -2, 44, 14);
      ctx.strokeRect(-22, -2, 44, 14);

      // Transparent body shell (Front profile view)
      ctx.beginPath();
      // Low wide splitter nose base
      ctx.moveTo(-75, 12);
      // Left wheel arch curve
      ctx.lineTo(-73, 5);
      ctx.lineTo(-58, 5);
      ctx.lineTo(-52, 12);
      // Up to front hood cowl
      ctx.lineTo(-24, 7);
      // Cockpit dome canopy center
      ctx.lineTo(-14, -26);
      // Air scoop top centered
      ctx.lineTo(-6, -26);
      ctx.lineTo(-6, -31);
      ctx.lineTo(6, -31);
      ctx.lineTo(6, -26);
      ctx.lineTo(14, -26);
      // Down right hood cowl
      ctx.lineTo(24, 7);
      // Right wheel arch curve
      ctx.lineTo(52, 12);
      ctx.lineTo(58, 5);
      ctx.lineTo(73, 5);
      ctx.lineTo(75, 12);
      ctx.closePath();

      const bodyGrad = ctx.createLinearGradient(0, -28, 0, 12);
      bodyGrad.addColorStop(0, "rgba(59, 130, 246, 0.05)");
      bodyGrad.addColorStop(1, "rgba(59, 130, 246, 0.15)");
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      ctx.strokeStyle = "rgba(59, 130, 246, 0.8)";
      ctx.lineWidth = 1.25;
      ctx.stroke();

      // Front balance pivot rod (vertical support strut matching Image 1)
      ctx.strokeStyle = "rgba(122, 130, 140, 0.5)";
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(0, -26);
      ctx.lineTo(0, -50);
      ctx.stroke();

      // Green central balance pivot dot
      ctx.fillStyle = "#00D17F";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(0, 6, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Left wheel nominal X: -45, Right wheel X: 45
      const leftNomX = -45;
      const rightNomX = 45;
      const wheelNomY = 12;

      const activeLeftY = wheelNomY + flWOffset;
      const activeRightY = wheelNomY + frWOffset;

      // Active travel vertical scale (Left Wheel - FL)
      ctx.strokeStyle = "rgba(251, 184, 0, 0.35)";
      ctx.lineWidth = 0.75;
      ctx.setLineDash([1.5, 1.5]);
      ctx.beginPath();
      ctx.moveTo(leftNomX, wheelNomY);
      ctx.lineTo(leftNomX, activeLeftY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = "rgba(251, 184, 0, 0.6)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(leftNomX - 4, wheelNomY);
      ctx.lineTo(leftNomX + 4, wheelNomY);
      ctx.moveTo(leftNomX, wheelNomY - 4);
      ctx.lineTo(leftNomX, wheelNomY + 4);
      ctx.stroke();

      const flTravelMm = (flDeflect - 45) * 0.8;
      ctx.fillStyle = flTravelMm >= 0 ? "#FFB800" : "#FF4D4D";
      ctx.font = "bold 6px monospace";
      ctx.fillText(
        `${flTravelMm >= 0 ? "+" : ""}${flTravelMm.toFixed(1)}mm`,
        leftNomX - 32,
        activeLeftY + 2
      );

      // Active travel vertical scale (Right Wheel - FR)
      ctx.strokeStyle = "rgba(251, 184, 0, 0.35)";
      ctx.lineWidth = 0.75;
      ctx.setLineDash([1.5, 1.5]);
      ctx.beginPath();
      ctx.moveTo(rightNomX, wheelNomY);
      ctx.lineTo(rightNomX, activeRightY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = "rgba(251, 184, 0, 0.6)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(rightNomX - 4, wheelNomY);
      ctx.lineTo(rightNomX + 4, wheelNomY);
      ctx.moveTo(rightNomX, wheelNomY - 4);
      ctx.lineTo(rightNomX, wheelNomY + 4);
      ctx.stroke();

      const frTravelMm = (frDeflect - 45) * 0.8;
      ctx.fillStyle = frTravelMm >= 0 ? "#FFB800" : "#FF4D4D";
      ctx.font = "bold 6px monospace";
      ctx.fillText(
        `${frTravelMm >= 0 ? "+" : ""}${frTravelMm.toFixed(1)}mm`,
        rightNomX + 13,
        activeRightY + 2
      );

      // Perspective skew visual for front wheels under active steering!
      const steerSkew = Math.sin((steer * Math.PI) / 180 * 0.12) * 0.35;

      // Left front wheel tire (FL)
      ctx.save();
      ctx.translate(leftNomX, activeLeftY);
      ctx.transform(1, 0, steerSkew, 1, 0, 0); // Active skew representing turning angle
      ctx.fillStyle = "#090D14";
      ctx.strokeStyle = "#1C2430";
      ctx.lineWidth = 0.75;
      // Front projection tire is flat (looking at the tread profile)
      ctx.fillRect(-6, -10, 12, 20);
      ctx.strokeRect(-6, -10, 12, 20);
      // Rim line
      ctx.strokeStyle = "rgba(122, 130, 140, 0.4)";
      ctx.beginPath();
      ctx.moveTo(0, -7);
      ctx.lineTo(0, 7);
      ctx.stroke();
      // Hub center marker
      ctx.fillStyle = "#FFB800";
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Right front wheel tire (FR)
      ctx.save();
      ctx.translate(rightNomX, activeRightY);
      ctx.transform(1, 0, steerSkew, 1, 0, 0); // Active skew
      ctx.fillStyle = "#090D14";
      ctx.strokeStyle = "#1C2430";
      ctx.lineWidth = 0.75;
      ctx.fillRect(-6, -10, 12, 20);
      ctx.strokeRect(-6, -10, 12, 20);
      ctx.strokeStyle = "rgba(122, 130, 140, 0.4)";
      ctx.beginPath();
      ctx.moveTo(0, -7);
      ctx.lineTo(0, 7);
      ctx.stroke();
      ctx.fillStyle = "#FFB800";
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }, [viewMode, pitchVal, rollVal, steer, frDeflect, flDeflect, rrDeflect, rlDeflect]);

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
            <div className="text-[10px] text-[#7A828C] border-b border-[#1C2430]/40 pb-1 uppercase font-bold tracking-wider flex justify-between items-center">
              <div className="flex gap-1 bg-[#0B0F14] border border-[#1C2430] rounded-sm overflow-hidden p-0.5 select-none">
                <button
                  type="button"
                  onClick={() => setViewMode("side")}
                  className={`px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-bold rounded-xs cursor-pointer ${
                    viewMode === "side" ? "bg-[#3B82F6] text-white" : "text-[#7A828C] hover:text-[#E2E4E8]"
                  }`}
                >
                  Side
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("front")}
                  className={`px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-bold rounded-xs cursor-pointer ${
                    viewMode === "front" ? "bg-[#3B82F6] text-white" : "text-[#7A828C] hover:text-[#E2E4E8]"
                  }`}
                >
                  Front
                </button>
              </div>
              <span className="text-[#3B82F6] tabular-nums">
                {viewMode === "side" ? `PITCH: ${pitchVal.toFixed(2)}°` : `ROLL: ${rollVal.toFixed(2)}°`}
              </span>
            </div>

            {/* Vector Silhouette Canvas */}
            <div className="flex-1 flex items-center justify-center py-2">
              <canvas ref={canvasRef} width={280} height={140} className="border border-[#1C2430] bg-[#0B0F14] rounded-sm w-full max-w-[280px]" />
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
