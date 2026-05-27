import React from "react";
import { useTelemetry } from "@/lib/useTelemetry";
import { TelemetryInstrument } from "./TelemetryInstrument";
import { Flame, AlertTriangle } from "lucide-react";

interface BrakeInstrumentProps {
  telemetry?: any;
  mode?: "live" | "replay" | "compare";
}

export function BrakeInstrument({ telemetry: propTelemetry, mode = "live" }: BrakeInstrumentProps) {
  const liveTelemetry = useTelemetry();
  const t = propTelemetry || liveTelemetry;

  const flBrakeTemp = t.tires?.fl?.brakeTempC ?? 320;
  const frBrakeTemp = t.tires?.fr?.brakeTempC ?? 350;
  const rlBrakeTemp = t.tires?.rl?.brakeTempC ?? 310;
  const rrBrakeTemp = t.tires?.rr?.brakeTempC ?? 315;

  const flBrakePress = t.tires?.fl?.brakeLinePress ?? (t.brake * 65);
  const frBrakePress = t.tires?.fr?.brakeLinePress ?? (t.brake * 65);
  const rlBrakePress = t.tires?.rl?.brakeLinePress ?? (t.brake * 45);
  const rrBrakePress = t.tires?.rr?.brakeLinePress ?? (t.brake * 45);

  const brakeBias = t.brakeBias ?? 54.5;
  const rawBrake = t.brake ?? 0;

  // Detect lockups (if brake pressure is high, or brake is high and steering is locked)
  const isLockedUp = rawBrake > 0.85 && Math.abs(t.steeringDeg) > 45;
  const thresholdLimit = 82; // 82% threshold target

  // Thermal saturation color utility
  const getTempColor = (temp: number) => {
    if (temp > 450) return "text-[#FF4D4D] border-[#FF4D4D]";
    if (temp > 380) return "text-[#FFB800] border-[#FFB800]";
    return "text-[#00D17F] border-[#00D17F]/40";
  };

  const getBarColor = (temp: number) => {
    if (temp > 450) return "bg-[#FF4D4D]";
    if (temp > 380) return "bg-[#FFB800]";
    return "bg-[#00D17F]";
  };

  const aiAdvice = `BRAKE DIAGNOSTIC ANALYSIS (LAP ${t.connected ? "LATEST" : "REF"}):
- Peak Brake Pressure: ${(Math.max(flBrakePress, frBrakePress) * 1.2).toFixed(1)} bar.
- Thermal Saturation: Front brake temperatures peak at ${Math.max(flBrakeTemp, frBrakeTemp).toFixed(0)}°C on corner entry.
- Recommendation: Shift brake bias +0.5% forward if experiencing rear instability under trail braking at Turn 8. Maintain threshold pressure below ${thresholdLimit}% to avoid front lockups.`;

  return (
    <TelemetryInstrument
      title="Brake Instrument"
      mode={mode}
      activeStatus={isLockedUp ? "LOCKUP DETECTED" : "SYS ACTIVE"}
      activeStatusColor={isLockedUp ? "text-[#FF4D4D] border-[#FF4D4D]/40 bg-[#FF4D4D]/10" : "text-[#00D17F] border-[#00D17F]/30 bg-[#00D17F]/10"}
      onAiAnalyze={() => {}}
      aiAdvice={aiAdvice}
    >
      <div className="p-3 h-full flex flex-col justify-between font-mono bg-[#05070A] text-white">
        
        {/* Lockup Alert */}
        {isLockedUp && (
          <div className="absolute top-1 right-2 animate-pulse flex items-center gap-1 text-[#FF4D4D] bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 px-1.5 py-0.5 rounded text-[8px] font-black z-20">
            <AlertTriangle className="h-3 w-3" /> LOCKUP WARNING
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 flex-1">
          {/* Left Column: Localized Brake Stats */}
          <div className="flex flex-col justify-between border-r border-[#1C2430]/60 pr-3">
            <div className="text-[10px] text-[#7A828C] border-b border-[#1C2430]/40 pb-1 uppercase font-bold tracking-wider">
              Thermal & Pressure Hub
            </div>
            
            {/* Front Brakes */}
            <div className="grid grid-cols-2 gap-2 my-2">
              <div className={`p-1.5 border rounded-sm ${getTempColor(flBrakeTemp)} bg-[#0B0F14] flex flex-col`}>
                <span className="text-[8px] text-[#7A828C] font-bold">FL BRAKE</span>
                <span className="text-sm font-black tracking-tighter tabular-nums">{flBrakeTemp.toFixed(0)}°C</span>
                <div className="w-full bg-[#1C2430] h-1 rounded-full mt-1.5 overflow-hidden">
                  <div className={`h-full ${getBarColor(flBrakeTemp)}`} style={{ width: `${Math.min(100, (flBrakeTemp / 600) * 100)}%` }} />
                </div>
                <span className="text-[8px] text-white mt-1 tabular-nums">{(flBrakePress).toFixed(1)} Bar</span>
              </div>

              <div className={`p-1.5 border rounded-sm ${getTempColor(frBrakeTemp)} bg-[#0B0F14] flex flex-col`}>
                <span className="text-[8px] text-[#7A828C] font-bold">FR BRAKE</span>
                <span className="text-sm font-black tracking-tighter tabular-nums">{frBrakeTemp.toFixed(0)}°C</span>
                <div className="w-full bg-[#1C2430] h-1 rounded-full mt-1.5 overflow-hidden">
                  <div className={`h-full ${getBarColor(frBrakeTemp)}`} style={{ width: `${Math.min(100, (frBrakeTemp / 600) * 100)}%` }} />
                </div>
                <span className="text-[8px] text-white mt-1 tabular-nums">{(frBrakePress).toFixed(1)} Bar</span>
              </div>
            </div>

            {/* Rear Brakes */}
            <div className="grid grid-cols-2 gap-2">
              <div className={`p-1.5 border rounded-sm ${getTempColor(rlBrakeTemp)} bg-[#0B0F14] flex flex-col`}>
                <span className="text-[8px] text-[#7A828C] font-bold">RL BRAKE</span>
                <span className="text-sm font-black tracking-tighter tabular-nums">{rlBrakeTemp.toFixed(0)}°C</span>
                <div className="w-full bg-[#1C2430] h-1 rounded-full mt-1.5 overflow-hidden">
                  <div className={`h-full ${getBarColor(rlBrakeTemp)}`} style={{ width: `${Math.min(100, (rlBrakeTemp / 600) * 100)}%` }} />
                </div>
                <span className="text-[8px] text-white mt-1 tabular-nums">{(rlBrakePress).toFixed(1)} Bar</span>
              </div>

              <div className={`p-1.5 border rounded-sm ${getTempColor(rrBrakeTemp)} bg-[#0B0F14] flex flex-col`}>
                <span className="text-[8px] text-[#7A828C] font-bold">RR BRAKE</span>
                <span className="text-sm font-black tracking-tighter tabular-nums">{rrBrakeTemp.toFixed(0)}°C</span>
                <div className="w-full bg-[#1C2430] h-1 rounded-full mt-1.5 overflow-hidden">
                  <div className={`h-full ${getBarColor(rrBrakeTemp)}`} style={{ width: `${Math.min(100, (rrBrakeTemp / 600) * 100)}%` }} />
                </div>
                <span className="text-[8px] text-white mt-1 tabular-nums">{(rrBrakePress).toFixed(1)} Bar</span>
              </div>
            </div>
          </div>

          {/* Right Column: Threshold & Pressure Traces */}
          <div className="flex flex-col justify-between pl-1">
            <div className="text-[10px] text-[#7A828C] border-b border-[#1C2430]/40 pb-1.5 uppercase font-bold tracking-wider flex justify-between">
              <span>Brake Command Balance</span>
              <span className="text-[#3B82F6] tabular-nums">BIAS: {brakeBias.toFixed(1)}%</span>
            </div>

            {/* Threshold Brake Target visualization */}
            <div className="flex-1 flex flex-col justify-center gap-1.5 my-2.5">
              <div className="flex justify-between items-center text-[9px] text-[#7A828C]">
                <span>PRESSURE ENVELOPE</span>
                <span className="tabular-nums font-bold text-white">{(rawBrake * 100).toFixed(0)}%</span>
              </div>

              <div className="h-10 bg-[#0B0F14] border border-[#1C2430] rounded-sm p-1.5 relative overflow-hidden flex flex-col justify-center">
                {/* Active Pressure Bar */}
                <div className={`h-4 transition-all duration-75 rounded-sm ${isLockedUp ? "bg-[#FF4D4D]" : "bg-[#3B82F6]"}`} style={{ width: `${rawBrake * 100}%` }} />
                
                {/* Threshold brake line */}
                <div className="absolute top-0 bottom-0 border-l border-dashed border-[#FFB800] z-10" style={{ left: `${thresholdLimit}%` }} title="Target threshold line">
                  <span className="absolute top-0.5 left-1 text-[7px] text-[#FFB800] font-black tracking-widest bg-[#05070A] px-0.5 rounded">THR: {thresholdLimit}%</span>
                </div>
              </div>
            </div>

            {/* Micro stats bar */}
            <div className="grid grid-cols-2 gap-2 text-[9px] text-[#7A828C] bg-[#0B0F14] p-1.5 rounded-sm border border-[#1C2430]/60">
              <div className="flex flex-col">
                <span>F/R BIAS BAL</span>
                <span className="text-white font-bold tabular-nums">{brakeBias}% / {(100 - brakeBias).toFixed(1)}%</span>
              </div>
              <div className="flex flex-col">
                <span>PEAK FORCE</span>
                <span className="text-[#FF4D4D] font-bold tabular-nums">{(rawBrake * 80).toFixed(0)} kg</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </TelemetryInstrument>
  );
}
