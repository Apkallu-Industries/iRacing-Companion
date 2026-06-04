/**
 * StrategicIntelligenceTab.tsx — Tactical Race Strategy Cockpit Panel
 *
 * Integrates Stint State wear tracking, Session Objective toggles,
 * Strategy timeline crossovers, and Aero Wake dirty air calculators.
 *
 * Enforces highly serious, dense, clinical motorsport layouts.
 */

import { useState } from "react";
import {
  Zap,
  Shield,
  Flame,
  Activity,
  Compass,
  AlertTriangle,
  Layers,
  Sliders,
  Settings,
} from "lucide-react";
import {
  calculateStintState,
  type StintStateMetrics,
} from "@/lib/session-intelligence/stintStateEngine";
import {
  getObjectiveConstraints,
  type SessionObjectiveMode,
  OBJECTIVE_CONFIGS,
} from "@/lib/session-intelligence/objectiveModes";
import {
  calculateWakeDynamics,
  type WakeDynamicsMetrics,
} from "@/lib/session-intelligence/wakeModeling";
import {
  calculateStrategyTimeline,
  type StrategyForecast,
} from "@/lib/session-intelligence/strategyTimeline";
import {
  calculateSessionCorrelations,
  type TelemetryCorrelation,
} from "@/lib/session-intelligence/correlationEngine";

interface StrategicIntelligenceTabProps {
  sessionId?: string;
  activeLap?: number;
  track?: string;
  car?: string;
}

export function StrategicIntelligenceTab({
  sessionId = "current-session",
  activeLap = 12,
  track = "Spa-Francorchamps",
  car = "Ferrari 296 GT3",
}: StrategicIntelligenceTabProps) {
  // --- States ---
  const [activeMode, setActiveMode] = useState<SessionObjectiveMode>("RACE_STINT");
  const [ambientTemp, setAmbientTemp] = useState(19.0); // cool conditions triggering correlation trap!
  const [rearRebound, setRearRebound] = useState(4); // >3 ticks rebound triggering Spa trap!
  const [timeGap, setTimeGap] = useState(0.85); // trailing <1.8s triggering active wake modeling!
  const [pitstopPenalty, setPitstopPenalty] = useState(24.5);

  const objective = getObjectiveConstraints(activeMode);

  // 1. Stint state metrics
  const mockSpeedMps = [42.1, 41.5, 43.2, 42.8];
  const mockTireTemps = [88.5, 89.2, 91.0, 92.4];
  const mockBrakeTemps = [450, 480, 520, 560];
  const mockSoCPct = [82, 78, 74, 70];
  const stintState = calculateStintState(
    activeLap,
    mockSpeedMps,
    32.4, // fuel level remaining
    mockTireTemps,
    mockBrakeTemps,
    mockSoCPct,
  );

  // 2. Wake dynamics
  const wakeDynamics = calculateWakeDynamics(
    timeGap,
    42.8, // current speed mps
    1.42, // steering rate
    0.35, // yaw rate
    92.0, // coolant temp
  );

  // 3. Strategy timeline forecast
  const strategyForecast = calculateStrategyTimeline(
    activeLap,
    stintState.tireGripPct,
    stintState.fuelLapsRemaining,
    ambientTemp,
    pitstopPenalty,
  );

  // 4. Institutional knowledge correlations
  const mockHistoricalChanges = [
    {
      change_type: "Rear Rebound",
      parameter: "> 3 ticks",
      notes: "Spa cool ambient rebound damping instability in T8",
    },
  ];
  const mockHistoricalEvents = [{ track: "Spa-Francorchamps", car, severity: "critical" }];
  const correlation = calculateSessionCorrelations(
    track,
    car,
    rearRebound,
    ambientTemp,
    activeLap,
    mockHistoricalChanges,
    mockHistoricalEvents,
  );

  return (
    <div
      className="flex flex-col h-full font-mono text-[10px] p-4 gap-4 overflow-y-auto"
      style={{ backgroundColor: "#07090E", color: "#E2E8F0" }}
    >
      {/* Dynamic Handling Correlation Alarm Panel */}
      {correlation.correlationFound && (
        <div
          className="p-3 border border-[#FF4D4D] rounded-sm flex items-start gap-2.5"
          style={{ backgroundColor: "rgba(255,77,77,0.06)" }}
        >
          <AlertTriangle className="h-4 w-4 text-[#FF4D4D] shrink-0 mt-0.5" />
          <div className="flex-1 flex flex-col gap-0.5">
            <span className="font-bold text-[#FF4D4D] uppercase text-[9px] tracking-wider">
              {correlation.title}
            </span>
            <p className="text-[8.5px] leading-relaxed text-[#E2E8F0]">
              {correlation.narrativeDescription}
            </p>
            <div className="text-[8px] text-[#FFB800] mt-1.5 font-bold uppercase tracking-wider">
              PRE-EMPTIVE STRATEGY COMMAND: {correlation.recommendedPreemptiveDelta}
            </div>
          </div>
        </div>
      )}

      {/* Row 1: Objective Selector & Stint Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Objective Mode Selection */}
        <div
          className="p-4 rounded-sm border md:col-span-1 flex flex-col justify-between"
          style={{ backgroundColor: "#0B0F19", borderColor: "#1A202C" }}
        >
          <div>
            <div className="pb-2 border-b border-[#1A202C] mb-3 flex items-center justify-between">
              <span className="font-black text-[#3B82F6] tracking-widest text-[9px] uppercase">
                SESSION OBJECTIVE
              </span>
              <Sliders className="h-3.5 w-3.5 text-[#3D4751]" />
            </div>

            <div className="flex flex-col gap-1.5">
              {(["QUALIFYING_ATTACK", "RACE_STINT", "FUEL_SAVE"] as const).map((mode) => {
                const isSelected = activeMode === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => setActiveMode(mode)}
                    className="w-full text-left py-2 px-3 border rounded-sm font-bold transition-all cursor-pointer hover:bg-[#131924]"
                    style={{
                      borderColor: isSelected ? "#3B82F6" : "#1A202C",
                      backgroundColor: isSelected ? "#0F1420" : "#07090E",
                      color: isSelected ? "#3B82F6" : "#718096",
                    }}
                  >
                    {mode.replace("_", " ")}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 p-2.5 border border-[#1A202C] bg-[#07090E] rounded-sm text-[8.5px] leading-relaxed">
            <span className="text-[#718096] uppercase font-bold block mb-1">
              Active Constraints:
            </span>
            <div className="flex flex-col gap-1">
              <span>
                ● Wheelspin sens:{" "}
                <span className="text-white font-bold">{objective.wheelspinSensitivityCoeff}x</span>
              </span>
              <span>
                ● Brake threshold:{" "}
                <span className="text-white font-bold">
                  {(objective.brakeLockupThreshold * 100).toFixed(0)}%
                </span>
              </span>
              <span>
                ● AI Narrative:{" "}
                <span className="text-white font-bold">{objective.aiNarrativeTone}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Stint wear state engine matrix */}
        <div
          className="p-4 rounded-sm border md:col-span-2"
          style={{ backgroundColor: "#0B0F19", borderColor: "#1A202C" }}
        >
          <div className="pb-2 border-b border-[#1A202C] mb-3 flex items-center justify-between">
            <span className="font-black text-[#3B82F6] tracking-widest text-[9px] uppercase">
              STINT STATE DEGRADATION METRICS
            </span>
            <Activity className="h-3.5 w-3.5 text-[#3D4751]" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
              <span className="text-[#718096] text-[8px] block uppercase font-bold mb-0.5">
                Tire Grip Limit
              </span>
              <span className="text-white text-base font-bold tabular-nums">
                {stintState.tireGripPct}%
              </span>
            </div>
            <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
              <span className="text-[#718096] text-[8px] block uppercase font-bold mb-0.5">
                Average Fuel Burn
              </span>
              <span className="text-white text-base font-bold tabular-nums">
                {stintState.fuelBurnPerLapL} L/lap
              </span>
            </div>
            <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
              <span className="text-[#718096] text-[8px] block uppercase font-bold mb-0.5">
                Laps on Fuel Remaining
              </span>
              <span className="text-[#00D17F] text-base font-bold tabular-nums">
                {stintState.fuelLapsRemaining} laps
              </span>
            </div>
            <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
              <span className="text-[#718096] text-[8px] block uppercase font-bold mb-0.5">
                Thermal Saturation
              </span>
              <span className="text-white text-base font-bold tabular-nums">
                {(stintState.thermalSaturationIndex * 100).toFixed(0)}%
              </span>
            </div>
            <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
              <span className="text-[#718096] text-[8px] block uppercase font-bold mb-0.5">
                Brake Fatigue Fade
              </span>
              <span className="text-white text-base font-bold tabular-nums">
                {(stintState.brakeFatigueIndex * 100).toFixed(0)}%
              </span>
            </div>
            <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
              <span className="text-[#718096] text-[8px] block uppercase font-bold mb-0.5">
                ERS Depletion rate
              </span>
              <span className="text-white text-base font-bold tabular-nums">
                {stintState.ersDepletionRatePct}% SoC/Straight
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Strategy Timeline HUD */}
      <div
        className="p-4 rounded-sm border"
        style={{ backgroundColor: "#0B0F19", borderColor: "#1A202C" }}
      >
        <div className="pb-2 border-b border-[#1A202C] mb-3 flex items-center justify-between">
          <span className="font-black text-[#3B82F6] tracking-widest text-[9px] uppercase">
            STRATEGY COUPLING AND WINDOW FORECASTING
          </span>
          <span className="text-[8px] text-[#718096]">TIMELINE WINDOW MILESTONES</span>
        </div>

        <div className="flex flex-col gap-2.5">
          {strategyForecast.milestones.map((ms, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 px-3 py-2 border rounded-sm font-mono text-[9px]"
              style={{
                borderColor: "#1A202C",
                backgroundColor:
                  ms.severity === "critical"
                    ? "rgba(255,77,77,0.04)"
                    : ms.severity === "warning"
                      ? "rgba(255,184,0,0.04)"
                      : "transparent",
              }}
            >
              <span
                className="w-16 shrink-0 font-black text-center py-0.5 rounded-sm tracking-wider uppercase"
                style={{
                  backgroundColor:
                    ms.severity === "critical"
                      ? "rgba(255,77,77,0.15)"
                      : ms.severity === "warning"
                        ? "rgba(255,184,0,0.15)"
                        : "rgba(59,130,246,0.15)",
                  color:
                    ms.severity === "critical"
                      ? "#FF4D4D"
                      : ms.severity === "warning"
                        ? "#FFB800"
                        : "#3B82F6",
                }}
              >
                Lap {ms.lapNumber}
              </span>
              <span className="w-28 shrink-0 font-bold uppercase tracking-wider text-white">
                {ms.milestoneType}
              </span>
              <span className="flex-1 text-[#E2E8F0] leading-relaxed">{ms.narrative}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: Aero Wake Diagnostics & Simulator controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Simulator controls */}
        <div
          className="p-4 rounded-sm border md:col-span-1"
          style={{ backgroundColor: "#0B0F19", borderColor: "#1A202C" }}
        >
          <div className="pb-2 border-b border-[#1A202C] mb-3">
            <span className="font-black text-[#3B82F6] tracking-widest text-[9px] uppercase">
              TRAFFIC STIMULATOR
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[#718096] text-[8px] block uppercase font-bold mb-1">
                Ambient Air Temp: {ambientTemp.toFixed(1)}°C
              </label>
              <input
                type="range"
                min="10"
                max="40"
                step="0.5"
                value={ambientTemp}
                onChange={(e) => setAmbientTemp(parseFloat(e.target.value))}
                className="w-full bg-[#1A202C]"
              />
            </div>

            <div>
              <label className="text-[#718096] text-[8px] block uppercase font-bold mb-1">
                Rear Rebound Click: +{rearRebound} clicks
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={rearRebound}
                onChange={(e) => setRearRebound(parseInt(e.target.value, 10))}
                className="w-full bg-[#1A202C]"
              />
            </div>

            <div>
              <label className="text-[#718096] text-[8px] block uppercase font-bold mb-1">
                Traffic Distance Gap: {timeGap.toFixed(2)}s
              </label>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.05"
                value={timeGap}
                onChange={(e) => setTimeGap(parseFloat(e.target.value))}
                className="w-full bg-[#1A202C]"
              />
            </div>
          </div>
        </div>

        {/* Wake diagnostics indicator */}
        <div
          className="p-4 rounded-sm border md:col-span-2 flex flex-col justify-between"
          style={{ backgroundColor: "#0B0F19", borderColor: "#1A202C" }}
        >
          <div>
            <div className="pb-2 border-b border-[#1A202C] mb-3 flex items-center justify-between">
              <span className="font-black text-[#3B82F6] tracking-widest text-[9px] uppercase">
                AERO WAKE & COOLING DIAGNOSTICS
              </span>
              <span
                className="px-2 py-0.5 rounded-sm text-[8px] font-black uppercase"
                style={{
                  backgroundColor: wakeDynamics.inWake
                    ? "rgba(255,184,0,0.15)"
                    : "rgba(113,128,150,0.15)",
                  color: wakeDynamics.inWake ? "#FFB800" : "#718096",
                }}
              >
                {wakeDynamics.inWake ? "DIRTY AIR DETECTED" : "CLEAN VEHICLE VECTOR"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
                <span className="text-[#718096] text-[8px] block uppercase font-bold">
                  Downforce Splitter Wash Loss
                </span>
                <span
                  className="text-lg font-black tabular-nums"
                  style={{ color: wakeDynamics.inWake ? "#FF4D4D" : "#E2E8F0" }}
                >
                  {wakeDynamics.aeroWashPct}%
                </span>
              </div>
              <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
                <span className="text-[#718096] text-[8px] block uppercase font-bold">
                  Cooling radiator load impact
                </span>
                <span
                  className="text-white text-lg font-bold tabular-nums"
                  style={{ color: wakeDynamics.coolingLoadImpactPct > 20 ? "#FFB800" : "#E2E8F0" }}
                >
                  +{wakeDynamics.coolingLoadImpactPct}%
                </span>
              </div>
            </div>

            <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
              <span className="text-[#718096] text-[8px] block uppercase font-bold mb-1">
                Defensive Energy Deploy Override
              </span>
              <span className="text-[#E2E8F0] leading-relaxed block font-bold">
                {wakeDynamics.defensiveErsMapRecommendation}
              </span>
            </div>
          </div>

          <div className="text-[8px] text-[#718096] mt-4 uppercase tracking-widest text-center">
            DIRTY AIR FLOW INTERPRETATION LOOP RUNNING AT 60HZ
          </div>
        </div>
      </div>
    </div>
  );
}
