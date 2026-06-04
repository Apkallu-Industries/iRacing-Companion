/**
 * StrategicSimulationTab.tsx — Tactical Stint Outcome & Branching decision Cockpit
 *
 * Exposes stint decision tree paths, pit lap simulators, multiclass catch radars,
 * and text-to-speech voice radio triggers.
 *
 * Adheres strictly to dense, surgical, monospace workstation layouts.
 */

import { useState } from "react";
import {
  Play,
  Volume2,
  TrendingUp,
  Compass,
  AlertTriangle,
  Layers,
  Database,
  Shield,
  HelpCircle,
} from "lucide-react";
import {
  simulateRaceOutcome,
  type SimulationOutcome,
} from "@/lib/session-intelligence/raceSimulationEngine";
import {
  evaluateStrategyTree,
  type StrategyDecisionNode,
} from "@/lib/session-intelligence/strategyTrees";
import {
  calculateWeatherGripImpact,
  type WeatherImpactMetrics,
} from "@/lib/session-intelligence/weatherEngine";
import {
  forecastTrafficIntersections,
  type TrafficIntersection,
} from "@/lib/session-intelligence/trafficPredictor";
import {
  arbitrateRecommendations,
  type ArbitratedRecommendation,
} from "@/lib/session-intelligence/recommendationArbitrator";
import { generateVoiceBrief } from "@/lib/session-intelligence/voiceOps";
import { toast } from "sonner";

interface StrategicSimulationTabProps {
  sessionId?: string;
  activeLap?: number;
  car?: string;
  track?: string;
}

export function StrategicSimulationTab({
  sessionId = "current-session",
  activeLap = 12,
  car = "Ferrari 296 GT3",
  track = "Spa-Francorchamps",
}: StrategicSimulationTabProps) {
  // --- States ---
  const [pitLap, setPitLap] = useState(22);
  const [tireGrip, setTireGrip] = useState(82.4);
  const [fuelLaps, setFuelLaps] = useState(12.5);
  const [activeObjective, setActiveObjective] = useState<
    "RACE_STINT" | "FUEL_SAVE" | "QUALIFYING_ATTACK" | "SAFETY_CAR"
  >("RACE_STINT");
  const [rainIntensity, setRainIntensity] = useState(0); // 0 to 100
  const [rubberLevel, setRubberLevel] = useState(80);

  // 1. Run stint outcome simulation
  const sim: SimulationOutcome = simulateRaceOutcome(
    pitLap,
    activeLap,
    tireGrip,
    fuelLaps,
    24.5, // pit stops penalty
  );

  // 2. Evaluate active strategy decision tree
  const tree: StrategyDecisionNode = evaluateStrategyTree(
    tireGrip,
    fuelLaps,
    sim.trafficEmergenceGapSec,
    activeObjective,
  );

  // 3. Compute weather evolutions
  const weather: WeatherImpactMetrics = calculateWeatherGripImpact(
    18.5, // ambient
    21.2, // track
    rainIntensity,
    rubberLevel,
  );

  // 4. Multiclass traffic radar
  const traffic: TrafficIntersection[] = forecastTrafficIntersections(
    42.8, // speed mps
    1.15, // time gap ahead
    32.4, // track pos pct
  );

  // 5. Arbitrate recommendations
  const arbitration: ArbitratedRecommendation = arbitrateRecommendations(
    activeObjective === "SAFETY_CAR"
      ? "SAFETY_CAR"
      : activeObjective === "FUEL_SAVE"
        ? "FUEL_SAVE"
        : activeObjective === "QUALIFYING_ATTACK"
          ? "QUALIFYING_ATTACK"
          : "RACE_STINT",
    tireGrip < 78.0,
    true, // stability risk high simulating slide correction
    fuelLaps < 1.0,
    sim.totalTimeDeltaSec < -2.0,
  );

  // Trigger professional trackside engineering radio call
  const playRadioCall = () => {
    let briefType:
      | "THERMAL_RUNAWAY"
      | "TRAFFIC_CATCH"
      | "CROSSOVER_REACHED"
      | "FUEL_CRITICAL"
      | "STABILITY_BREAK" = "STABILITY_BREAK";
    let payloadValue: string | number = "T-eight";

    if (fuelLaps < 1.5) {
      briefType = "FUEL_CRITICAL";
      payloadValue = fuelLaps.toFixed(1);
    } else if (rainIntensity > 30) {
      briefType = "CROSSOVER_REACHED";
      payloadValue = "Rain Wet Crossover";
    } else if (traffic.length > 0) {
      briefType = "TRAFFIC_CATCH";
      payloadValue = traffic[0].estimatedIntersectionSec.toFixed(0);
    } else if (tireGrip < 75.0) {
      briefType = "THERMAL_RUNAWAY";
      payloadValue = 4;
    }

    const callout = generateVoiceBrief(briefType, payloadValue, true);
    toast.info(`ENGINEERING RADIO: "${callout.briefText}"`);
  };

  return (
    <div
      className="flex flex-col h-full font-mono text-[10px] p-4 gap-4 overflow-y-auto"
      style={{ backgroundColor: "#07090E", color: "#E2E8F0" }}
    >
      {/* Visual Header HUD with Arbitrated Recommendation */}
      <div
        className="p-3 border rounded-sm flex items-center justify-between gap-4"
        style={{
          borderColor: arbitration.actionToken === "BOX_IMMEDIATE" ? "#FF4D4D" : "#1A202C",
          backgroundColor:
            arbitration.actionToken === "BOX_IMMEDIATE" ? "rgba(255,77,77,0.05)" : "#0B0F19",
        }}
      >
        <div className="flex items-center gap-2">
          <Shield
            className="h-4 w-4 shrink-0"
            style={{
              color:
                arbitration.actionToken === "BOX_IMMEDIATE"
                  ? "#FF4D4D"
                  : arbitration.actionToken === "ADJUST_SETUP"
                    ? "#FFB800"
                    : "#00D17F",
            }}
          />
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-[9px] uppercase tracking-wider text-[#718096]">
              REAL-TIME ENGINEERING ARBITRATION
            </span>
            <span className="text-white font-bold leading-relaxed">{arbitration.rationale}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-right shrink-0">
          <span className="text-[8px] text-[#718096] uppercase font-bold block">Confidence</span>
          <span
            className="text-base font-black tabular-nums"
            style={{
              color:
                arbitration.confidenceIndex > 85
                  ? "#00D17F"
                  : arbitration.confidenceIndex > 70
                    ? "#FFB800"
                    : "#FF4D4D",
            }}
          >
            {arbitration.confidenceIndex}%
          </span>
        </div>
      </div>

      {/* Row 1: Decision tree HUD & Weather Crossover */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Adaptive strategy tree */}
        <div
          className="p-4 rounded-sm border md:col-span-1"
          style={{ backgroundColor: "#0B0F19", borderColor: "#1A202C" }}
        >
          <div className="pb-2 border-b border-[#1A202C] mb-3 flex items-center justify-between">
            <span className="font-black text-[#3B82F6] tracking-widest text-[9px] uppercase">
              ACTIVE STRATEGY BRANCH
            </span>
            <Database className="h-3.5 w-3.5 text-[#3D4751]" />
          </div>

          <div className="flex flex-col gap-3">
            <div className="p-2 border border-[#1A202C] bg-[#07090E] rounded-sm text-[8.5px]">
              <span className="text-[#718096] uppercase font-bold block mb-0.5">
                CONDITION TRIGGER MATCHED
              </span>
              <span className="text-white leading-relaxed">{tree.conditionMet}</span>
            </div>

            <div className="p-2 border border-[#1A202C] bg-[#07090E] rounded-sm text-[8.5px]">
              <span className="text-[#718096] uppercase font-bold block mb-0.5">
                RECOMMENDED BRANCH ACTION
              </span>
              <span className="text-[#00D17F] font-black block mb-1">{tree.recommendedAction}</span>
              <span className="text-[#718096] text-[8px] uppercase block">
                Branch Confidence: {tree.probabilityWeightPct}%
              </span>
            </div>

            <div className="p-2 border border-[#1A202C] bg-[#07090E] rounded-sm text-[8.5px]">
              <span className="text-[#718096] uppercase font-bold block mb-0.5">
                ALTERNATIVE STRATEGY: {tree.alternativeBranchName.toUpperCase()}
              </span>
              <span className="text-[#E2E8F0] leading-relaxed block">
                {tree.alternativeBranchNarrative}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic weather evolution engine */}
        <div
          className="p-4 rounded-sm border md:col-span-2"
          style={{ backgroundColor: "#0B0F19", borderColor: "#1A202C" }}
        >
          <div className="pb-2 border-b border-[#1A202C] mb-3 flex items-center justify-between">
            <span className="font-black text-[#3B82F6] tracking-widest text-[9px] uppercase">
              WEATHER EVOLUTION & GRIP CALCULATION
            </span>
            <span className="text-[8px] text-[#718096]">TRACK FRICTION MULTIPLIER</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
              <span className="text-[#718096] text-[8px] block uppercase font-bold mb-0.5">
                Grip Coeff
              </span>
              <span className="text-white text-base font-bold tabular-nums">
                {weather.globalFrictionGripCoeff}x
              </span>
            </div>
            <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
              <span className="text-[#718096] text-[8px] block uppercase font-bold mb-0.5">
                Rain Core Cooling
              </span>
              <span className="text-white text-base font-bold tabular-nums">
                -{weather.rainThermalCoolingOffset}°C/lap
              </span>
            </div>
            <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
              <span className="text-[#718096] text-[8px] block uppercase font-bold mb-0.5">
                Crossover Probability
              </span>
              <span
                className="text-base font-black tabular-nums"
                style={{ color: weather.crossoverViabilityPct > 50 ? "#FF4D4D" : "#00D17F" }}
              >
                {weather.crossoverViabilityPct}%
              </span>
            </div>
          </div>

          <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm text-[8.5px] mb-4">
            <span className="text-[#718096] uppercase font-bold block mb-1">
              Active Environment Compound Recommendation
            </span>
            <span className="text-[#3B82F6] font-black block mb-1">
              {weather.optimalTireCompound}
            </span>
            <span className="text-white leading-relaxed">{weather.verdictDescription}</span>
          </div>

          <div>
            <label className="text-[#718096] text-[8px] block uppercase font-bold mb-1">
              Rain Intensity Simulator: {rainIntensity}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={rainIntensity}
              onChange={(e) => setRainIntensity(parseInt(e.target.value, 10))}
              className="w-full bg-[#1A202C]"
            />
          </div>
        </div>
      </div>

      {/* Row 2: Pit stop lap simulator slider and finishing deltas */}
      <div
        className="p-4 rounded-sm border"
        style={{ backgroundColor: "#0B0F19", borderColor: "#1A202C" }}
      >
        <div className="pb-2 border-b border-[#1A202C] mb-3 flex items-center justify-between">
          <span className="font-black text-[#3B82F6] tracking-widest text-[9px] uppercase">
            RACE OUTCOME PIT-LAP DECISION SIMULATOR
          </span>
          <span className="text-[8px] text-[#718096]">FINISHING TIME DELTAS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
            <span className="text-[#718096] text-[8px] block uppercase font-bold mb-0.5">
              Finishing time Delta
            </span>
            <span
              className="text-base font-black tabular-nums"
              style={{ color: sim.totalTimeDeltaSec < 0 ? "#00D17F" : "#FF4D4D" }}
            >
              {sim.totalTimeDeltaSec < 0 ? "" : "+"}
              {sim.totalTimeDeltaSec.toFixed(2)}s
            </span>
          </div>
          <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
            <span className="text-[#718096] text-[8px] block uppercase font-bold mb-0.5">
              Undercut Success rate
            </span>
            <span className="text-white text-base font-bold tabular-nums">
              {sim.undercutViabilityPct}%
            </span>
          </div>
          <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
            <span className="text-[#718096] text-[8px] block uppercase font-bold mb-0.5">
              Fuel conservation target
            </span>
            <span className="text-white text-base font-bold tabular-nums">
              {sim.fuelSaveTargetL} L/lap
            </span>
          </div>
        </div>

        <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm text-[8.5px] mb-4">
          <span className="text-[#718096] uppercase font-bold block mb-1">
            Stint Trajectory Simulation Verdict
          </span>
          <span className="text-white leading-relaxed">{sim.verdictNarrative}</span>
        </div>

        <div>
          <label className="text-[#718096] text-[8px] block uppercase font-bold mb-1">
            Simulate Pitting on Lap: <span className="text-[#3B82F6] font-bold">Lap {pitLap}</span>{" "}
            (Baseline Optimal: L24)
          </label>
          <input
            type="range"
            min="18"
            max="30"
            step="1"
            value={pitLap}
            onChange={(e) => setPitLap(parseInt(e.target.value, 10))}
            className="w-full bg-[#1A202C]"
          />
        </div>
      </div>

      {/* Row 3: Multiclass catch radar & Voice Operations Briefing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Multiclass radar list */}
        <div
          className="p-4 rounded-sm border md:col-span-2"
          style={{ backgroundColor: "#0B0F19", borderColor: "#1A202C" }}
        >
          <div className="pb-2 border-b border-[#1A202C] mb-3 flex items-center justify-between">
            <span className="font-black text-[#3B82F6] tracking-widest text-[9px] uppercase">
              MULTICLASS TRAFFIC CONVERGENCE RADAR
            </span>
            <span className="text-[8px] text-[#718096]">prototype GT catch points</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[9px]">
              <thead>
                <tr className="text-[#718096] border-b border-[#1A202C] uppercase">
                  <th className="py-2">Vehicle</th>
                  <th className="py-2">Ahead (m)</th>
                  <th className="py-2">Closing (m/s)</th>
                  <th className="py-2">Catch corner</th>
                  <th className="py-2">Wake Wash Exposure</th>
                  <th className="py-2">Overtake ERS map advice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A202C]">
                {traffic.map((c, idx) => (
                  <tr key={idx} className="hover:bg-[#131924]">
                    <td className="py-2 text-white font-bold">
                      {c.leadingCarNumber} ({c.leadingCarClass})
                    </td>
                    <td className="py-2 tabular-nums">{c.distanceAheadM}m</td>
                    <td className="py-2 tabular-nums">{c.closingSpeedMps}</td>
                    <td className="py-2 font-bold text-[#FFB800]">
                      T{c.catchCornerNumber} ({c.estimatedIntersectionSec}s)
                    </td>
                    <td className="py-2 tabular-nums text-[#FF4D4D] font-bold">
                      {c.dirtyAirWashExposureSec}s
                    </td>
                    <td className="py-2 text-[#718096] leading-relaxed">
                      {c.passErsMapRecommendation}
                    </td>
                  </tr>
                ))}
                {traffic.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-[#718096] text-center">
                      No traffic blocks predicted within 25 seconds window.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Voice brief callout trigger */}
        <div
          className="p-4 rounded-sm border md:col-span-1 flex flex-col justify-between"
          style={{ backgroundColor: "#0B0F19", borderColor: "#1A202C" }}
        >
          <div>
            <div className="pb-2 border-b border-[#1A202C] mb-3">
              <span className="font-black text-[#3B82F6] tracking-widest text-[9px] uppercase">
                TRACKSIDE RADIO OPERATIONS
              </span>
            </div>

            <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm text-[8.5px] leading-relaxed">
              <span className="text-[#718096] uppercase font-bold block mb-1">
                Verbal Radio Briefing
              </span>
              <p className="text-white italic">
                "Short. Operational. Dense. Click below to synthesize the clinical trackside radio
                callout."
              </p>
            </div>
          </div>

          <button
            onClick={playRadioCall}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-sm bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold tracking-wider cursor-pointer"
          >
            <Volume2 className="h-4 w-4" />
            SYNTHESIZE RADIO BRIEF
          </button>
        </div>
      </div>
    </div>
  );
}
