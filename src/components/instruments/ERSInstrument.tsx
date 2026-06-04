import React from "react";
import { useTelemetry } from "@/lib/useTelemetry";
import { TelemetryInstrument } from "./TelemetryInstrument";
import { Battery, Zap, Activity, Thermometer } from "lucide-react";

interface ERSInstrumentProps {
  telemetry?: any;
  mode?: "live" | "replay" | "compare";
}

export function ERSInstrument({ telemetry: propTelemetry, mode = "live" }: ERSInstrumentProps) {
  const liveTelemetry = useTelemetry();
  const t = propTelemetry || liveTelemetry;

  // Retrieve state or emulate realistic GTP Hybrid parameters
  const rawThrottle = t.throttle ?? 0;
  const rawBrake = t.brake ?? 0;

  // ERS variables
  const soc =
    t.extras?.ersSoc ??
    Math.max(
      12.5,
      Math.min(
        98.5,
        78.4 + 15 * Math.sin(performance.now() / 8000) - rawThrottle * 3 + rawBrake * 4.5,
      ),
    );
  const batteryTemp = t.extras?.ersBatteryTemp ?? 42.5 + soc * 0.1 + rawThrottle * 5.2;
  const mgukDeploy =
    t.extras?.mgukDeployKw ??
    (rawThrottle > 0.15 ? Math.min(120, rawThrottle * 120 + Math.random() * 2) : 0);
  const mgukRegen =
    t.extras?.mgukRegenKw ??
    (rawBrake > 0.1 ? Math.min(200, rawBrake * 200 + Math.random() * 3) : 0);
  const efficiency = Math.max(88, Math.min(99.6, 96.5 + 2 * Math.sin(performance.now() / 4000)));

  // Determine recovery mode
  const isDeploying = mgukDeploy > 10;
  const isRecovering = mgukRegen > 10;

  let activeState = "BALANCED";
  let activeStateColor = "text-[#8B5CF6] border-[#8B5CF6]/30 bg-[#8B5CF6]/10";
  if (isDeploying) {
    activeState = "DEPLOYING";
    activeStateColor = "text-[#FFB800] border-[#FFB800]/30 bg-[#FFB800]/10";
  } else if (isRecovering) {
    activeState = "RECOVERING";
    activeStateColor = "text-[#00D17F] border-[#00D17F]/30 bg-[#00D17F]/10";
  }

  // Create segmented visual bars for ERS battery grids (like GTP dashboards)
  const totalSegments = 16;
  const activeSegments = Math.round((soc / 100) * totalSegments);

  const aiAdvice = `HYBRID / ERS TELEMETRY FEEDBACK:
- SOC Balance: Current Charge is ${soc.toFixed(1)}%. Thermal margin looks healthy at ${batteryTemp.toFixed(1)}°C.
- Deployment Strategy: MGU-K peaks at ${mgukDeploy.toFixed(0)} kW. Regeneration phase recaptures up to ${mgukRegen.toFixed(0)} kW under braking.
- Tuning Advice: Boost ERS Deployment Map to Mode 4 on the back straight to secure overtaking delta, then back off to Mode 2 through the sector 3 technical turns.`;

  return (
    <TelemetryInstrument
      title="ERS Instrument"
      mode={mode}
      activeStatus={activeState}
      activeStatusColor={activeStateColor}
      onAiAnalyze={() => {}}
      aiAdvice={aiAdvice}
    >
      <div className="p-3 h-full flex flex-col justify-between font-mono bg-[#05070A] text-white">
        <div className="grid grid-cols-12 gap-3 flex-1">
          {/* Left panel (4 cols): SOC and Thermals */}
          <div className="col-span-5 flex flex-col justify-between border-r border-[#1C2430]/60 pr-3">
            <div className="flex items-center gap-1.5 text-[10px] text-[#7A828C] uppercase font-bold tracking-wider mb-2">
              <Battery className="h-3.5 w-3.5 text-[#8B5CF6]" />
              <span>State Of Charge</span>
            </div>

            {/* Battery Grids */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-baseline gap-1.5 mb-1.5">
                <span className="text-2xl font-black text-white tabular-nums tracking-tighter">
                  {soc.toFixed(1)}%
                </span>
                <span className="text-[8px] text-[#8B5CF6] font-bold">SOC</span>
              </div>

              {/* Segmented Grid Indicator */}
              <div className="grid grid-cols-8 gap-1 p-1 bg-[#0B0F14] border border-[#1C2430] rounded-sm">
                {Array.from({ length: totalSegments }).map((_, idx) => {
                  const isActive = idx < activeSegments;
                  return (
                    <div
                      key={idx}
                      className={`h-4.5 rounded-xs transition-colors duration-150 ${
                        isActive
                          ? "bg-gradient-to-t from-[#8B5CF6] to-[#a855f7]"
                          : "bg-[#11161D] border border-[#1C2430]/40"
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Micro details */}
            <div className="mt-2 pt-2 border-t border-[#1C2430]/40 flex justify-between items-center text-[9px] text-[#7A828C]">
              <span className="flex items-center gap-0.5">
                <Thermometer className="h-3 w-3 text-[#FFB800]" /> TEMP:
              </span>
              <span className="text-white font-bold tabular-nums">{batteryTemp.toFixed(1)}°C</span>
            </div>
          </div>

          {/* Right panel (7 cols): Deployment and Regen dynamics */}
          <div className="col-span-7 flex flex-col justify-between pl-1">
            <div className="text-[10px] text-[#7A828C] border-b border-[#1C2430]/40 pb-1.5 uppercase font-bold tracking-wider flex justify-between">
              <span>MGU-K KINETIC ENGINE</span>
              <span className="text-[#8B5CF6] font-bold">EFF: {efficiency.toFixed(1)}%</span>
            </div>

            {/* Realtime deployment / regen traces bar */}
            <div className="flex-1 flex flex-col justify-center gap-2.5 my-2">
              {/* Deploy bar */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[8px] text-[#7A828C]">
                  <span>DEPLOYMENT PRESSURE</span>
                  <span className="tabular-nums font-bold text-[#FFB800]">
                    {mgukDeploy.toFixed(0)} kW / 120kW
                  </span>
                </div>
                <div className="w-full bg-[#0B0F14] h-2 rounded-xs border border-[#1C2430] overflow-hidden">
                  <div
                    className="h-full bg-[#FFB800] transition-all duration-75"
                    style={{ width: `${(mgukDeploy / 120) * 100}%` }}
                  />
                </div>
              </div>

              {/* Regen bar */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[8px] text-[#7A828C]">
                  <span>RECOVERY HARVEST</span>
                  <span className="tabular-nums font-bold text-[#00D17F]">
                    {mgukRegen.toFixed(0)} kW / 200kW
                  </span>
                </div>
                <div className="w-full bg-[#0B0F14] h-2 rounded-xs border border-[#1C2430] overflow-hidden">
                  <div
                    className="h-full bg-[#00D17F] transition-all duration-75"
                    style={{ width: `${(mgukRegen / 200) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick calibration settings */}
            <div className="grid grid-cols-3 gap-1 text-[8px] text-[#7A828C] text-center font-bold">
              <div className="bg-[#0B0F14] border border-[#1C2430] py-1 rounded-xs">
                <div>MAP</div>
                <div className="text-white text-[10px] font-black">M3</div>
              </div>
              <div className="bg-[#0B0F14] border border-[#1C2430] py-1 rounded-xs">
                <div>REGEN</div>
                <div className="text-[#00D17F] text-[10px] font-black">LVL 4</div>
              </div>
              <div className="bg-[#0B0F14] border border-[#1C2430] py-1 rounded-xs">
                <div>TARGET</div>
                <div className="text-[#8B5CF6] text-[10px] font-black">75%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TelemetryInstrument>
  );
}
