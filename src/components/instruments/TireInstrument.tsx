import React, { useEffect, useRef } from "react";
import { useTelemetry } from "@/lib/useTelemetry";
import { TelemetryInstrument } from "./TelemetryInstrument";
import { Gauge, Shield } from "lucide-react";

interface TireInstrumentProps {
  telemetry?: any;
  mode?: "live" | "replay" | "compare";
}

export function TireInstrument({ telemetry: propTelemetry, mode = "live" }: TireInstrumentProps) {
  const liveTelemetry = useTelemetry(mode === "live" && !propTelemetry);
  const t = propTelemetry || liveTelemetry;

  const flTemp = t.tires?.fl?.tempC ?? 82;
  const frTemp = t.tires?.fr?.tempC ?? 94;
  const rlTemp = t.tires?.rl?.tempC ?? 84;
  const rrTemp = t.tires?.rr?.tempC ?? 88;

  const flPress = t.tires?.fl?.pressureBar ?? 1.84;
  const frPress = t.tires?.fr?.pressureBar ?? 1.92;
  const rlPress = t.tires?.rl?.pressureBar ?? 1.88;
  const rrPress = t.tires?.rr?.pressureBar ?? 1.9;

  const flWear = t.tires?.fl?.wearPct ?? 98;
  const frWear = t.tires?.fr?.wearPct ?? 94;
  const rlWear = t.tires?.rl?.wearPct ?? 97;
  const rrWear = t.tires?.rr?.wearPct ?? 96;

  const gLat = t.gLat ?? 0;
  const gLon = t.gLon ?? 0;

  const ggCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Helper: map a carcass temp to a background color color block
  const getThermalBg = (temp: number) => {
    if (temp < 70) return "bg-blue-950/40 border-blue-500 text-[#3B82F6]"; // cold
    if (temp > 95) return "bg-red-950/40 border-red-500 text-[#FF4D4D]"; // hot
    return "bg-emerald-950/20 border-emerald-500 text-[#00D17F]"; // ok
  };

  const getThermalLabel = (temp: number) => {
    if (temp < 70) return "COLD";
    if (temp > 95) return "OVERHEAT";
    return "OPTIMAL";
  };

  // Render a compact micro G-G diagram inside this instrument
  useEffect(() => {
    const canvas = ggCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const scale = (w / 2 - 8) / 3; // 3G max scale

    // Background circle lines
    ctx.strokeStyle = "#1C2430";
    ctx.lineWidth = 0.5;

    // 1G, 2G, 3G rings
    for (let r = 1; r <= 3; r++) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Axes lines
    ctx.beginPath();
    ctx.moveTo(cx, 2);
    ctx.lineTo(cx, h - 2);
    ctx.moveTo(2, cy);
    ctx.lineTo(w - 2, cy);
    ctx.stroke();

    // Plot G-G position (current lateral and longitudinal Gs)
    const px = cx + gLat * scale;
    const py = cy - gLon * scale;

    ctx.fillStyle = "#00D17F";
    ctx.shadowBlur = 4;
    ctx.shadowColor = "#00D17F";
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Restore context shadows
    ctx.shadowBlur = 0;
  }, [gLat, gLon]);

  const aiAdvice = `THERMAL TIRE CRITERIA BRIEFING (LAP ${t.connected ? "LATEST" : "REF"}):
- Tyre Deflection Delta: FR tire experiencing heavy load saturation at Turn 10, thermal growth reaches ${frTemp.toFixed(1)}°C.
- Pressure Growth: LF: ${(flPress - 1.6).toFixed(2)} bar growth, RR: ${(rrPress - 1.6).toFixed(2)} bar growth. Cold targets look properly optimized.
- Recommendations: Adjust front-right camber -0.2° to distribute load more evenly and flatten outer-edge temperature growth peaks.`;

  return (
    <TelemetryInstrument
      title="Tire Instrument"
      mode={mode}
      activeStatus={frTemp > 95 ? "THERMAL OVERHEAT" : "THERMAL OPTIMAL"}
      activeStatusColor={
        frTemp > 95
          ? "text-[#FF4D4D] border-[#FF4D4D]/40 bg-[#FF4D4D]/10"
          : "text-[#00D17F] border-[#00D17F]/30 bg-[#00D17F]/10"
      }
      onAiAnalyze={() => {}}
      aiAdvice={aiAdvice}
    >
      <div className="p-3 h-full flex flex-col justify-between font-mono bg-[#05070A] text-white">
        <div className="grid grid-cols-12 gap-3 flex-1">
          {/* Left panel (7 cols): Tire carcass thermal grid */}
          <div className="col-span-8 flex flex-col justify-between border-r border-[#1C2430]/60 pr-3">
            <div className="text-[10px] text-[#7A828C] border-b border-[#1C2430]/40 pb-1.5 uppercase font-bold tracking-wider">
              Carcass Thermals & Pressures
            </div>

            {/* Tire Grid FL/FR/RL/RR */}
            <div className="grid grid-cols-2 gap-2 flex-1 my-2">
              {/* FL */}
              <div
                className={`p-1.5 border rounded-sm ${getThermalBg(flTemp)} flex flex-col justify-between`}
              >
                <div className="flex justify-between text-[7px] font-black">
                  <span>FL TIRE</span>
                  <span>{getThermalLabel(flTemp)}</span>
                </div>
                <div className="text-sm font-black tracking-tight text-white tabular-nums">
                  {flTemp.toFixed(0)}°C
                </div>
                <div className="flex justify-between text-[8px] text-[#7A828C]">
                  <span className="text-white font-bold">{flPress.toFixed(2)} Bar</span>
                  <span>{flWear}% LIFE</span>
                </div>
              </div>

              {/* FR */}
              <div
                className={`p-1.5 border rounded-sm ${getThermalBg(frTemp)} flex flex-col justify-between`}
              >
                <div className="flex justify-between text-[7px] font-black">
                  <span>FR TIRE</span>
                  <span>{getThermalLabel(frTemp)}</span>
                </div>
                <div className="text-sm font-black tracking-tight text-white tabular-nums">
                  {frTemp.toFixed(0)}°C
                </div>
                <div className="flex justify-between text-[8px] text-[#7A828C]">
                  <span className="text-white font-bold">{frPress.toFixed(2)} Bar</span>
                  <span>{frWear}% LIFE</span>
                </div>
              </div>

              {/* RL */}
              <div
                className={`p-1.5 border rounded-sm ${getThermalBg(rlTemp)} flex flex-col justify-between`}
              >
                <div className="flex justify-between text-[7px] font-black">
                  <span>RL TIRE</span>
                  <span>{getThermalLabel(rlTemp)}</span>
                </div>
                <div className="text-sm font-black tracking-tight text-white tabular-nums">
                  {rlTemp.toFixed(0)}°C
                </div>
                <div className="flex justify-between text-[8px] text-[#7A828C]">
                  <span className="text-white font-bold">{rlPress.toFixed(2)} Bar</span>
                  <span>{rlWear}% LIFE</span>
                </div>
              </div>

              {/* RR */}
              <div
                className={`p-1.5 border rounded-sm ${getThermalBg(rrTemp)} flex flex-col justify-between`}
              >
                <div className="flex justify-between text-[7px] font-black">
                  <span>RR TIRE</span>
                  <span>{getThermalLabel(rrTemp)}</span>
                </div>
                <div className="text-sm font-black tracking-tight text-white tabular-nums">
                  {rrTemp.toFixed(0)}°C
                </div>
                <div className="flex justify-between text-[8px] text-[#7A828C]">
                  <span className="text-white font-bold">{rrPress.toFixed(2)} Bar</span>
                  <span>{rrWear}% LIFE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel (5 cols): Grip circle and slip angles */}
          <div className="col-span-4 flex flex-col justify-between pl-1">
            <div className="text-[10px] text-[#7A828C] border-b border-[#1C2430]/40 pb-1.5 uppercase font-bold tracking-wider text-center">
              G-G Grip Circle
            </div>

            {/* G-G Diagram Canvas wrapper */}
            <div className="flex-1 flex items-center justify-center my-2">
              <canvas
                ref={ggCanvasRef}
                width={80}
                height={80}
                className="bg-[#0B0F14] border border-[#1C2430] rounded-full"
              />
            </div>

            {/* Slip stats */}
            <div className="text-center bg-[#0B0F14] border border-[#1C2430] py-1 rounded-sm text-[8px] text-[#7A828C]">
              <span>PEAK G: </span>
              <span className="text-white font-black tabular-nums">
                {Math.sqrt(gLat * gLat + gLon * gLon).toFixed(2)}G
              </span>
            </div>
          </div>
        </div>
      </div>
    </TelemetryInstrument>
  );
}
