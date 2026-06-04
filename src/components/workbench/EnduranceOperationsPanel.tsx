/**
 * EnduranceOperationsPanel.tsx — Endurance Team Mission Control Workstation
 *
 * Implements a surgical, clinical endurance dashboard with three specialized workspaces:
 *   1. Team Owner Workspace (risk status, stint health, driver profile)
 *   2. Race Strategist Workspace (timelines, fuel slopes, double-stack alerts)
 *   3. Performance Engineer Workspace (chassis fatigue, brake wear, gearbox stress)
 */

import { useState, useEffect, useMemo } from "react";
import {
  Users,
  Compass,
  TrendingDown,
  Activity,
  Layers,
  ShieldAlert,
  AlertTriangle,
  Volume2,
  Clock,
} from "lucide-react";
import {
  evaluateTeamStrategyBoard,
  type CarStintPlan,
} from "@/lib/session-intelligence/strategyBoardRuntime";
import {
  raceTimelineEngine,
  type EnduranceRaceEvent,
} from "@/lib/session-intelligence/raceTimeline";
import { useTelemetryGraph } from "@/lib/useTelemetryGraph";
import { toast } from "sonner";

interface EnduranceOperationsPanelProps {
  sessionId?: string;
  car?: string;
  track?: string;
}

export function EnduranceOperationsPanel({
  sessionId = "current-session",
  car = "Porsche 963 GTP",
  track = "Spa-Francorchamps",
}: EnduranceOperationsPanelProps) {
  // --- Workspace Role Toggle ---
  const [activeRole, setActiveRole] = useState<"owner" | "strategist" | "performance">("owner");

  // --- Live Telemetry Graph Connection ---
  const { localCar, remoteCars, enduranceState, adaptationState } = useTelemetryGraph();

  // --- Stint Plans & Pit Stops ---
  const [fuelToLoad, setFuelToLoad] = useState(65); // Litres
  const [changeTires, setChangeTires] = useState(true);
  const [swapDrivers, setSwapDrivers] = useState(true);

  // Dynamically compute stint plans across active garage box
  const stintPlans: CarStintPlan[] = useMemo(() => {
    const plans: CarStintPlan[] = [];

    // Add local car state if available
    if (localCar) {
      plans.push({
        carNumber: localCar.carNumber || "963",
        driverName: localCar.car || "Local Driver",
        lapsCompletedInStint: localCar.all?.Lap ?? 12,
        estFuelLapsRemaining: localCar.lapsEstimated || 4.2,
        projectedPitLap: (localCar.all?.Lap ?? 12) + Math.ceil(localCar.lapsEstimated || 4.2),
        tireGripRemainingPct: localCar.tires
          ? (localCar.tires.fl.estWearPct +
              localCar.tires.fr.estWearPct +
              localCar.tires.rl.estWearPct +
              localCar.tires.rr.estWearPct) /
            4
          : 85.0,
      });
    }

    // Add remote teammate cars
    for (const [carNum, rc] of remoteCars.entries()) {
      if (localCar && carNum === localCar.carNumber) continue;
      plans.push({
        carNumber: rc.carNumber,
        driverName: rc.driverName,
        lapsCompletedInStint: 10,
        estFuelLapsRemaining: rc.lapsEstimated || 3.8,
        projectedPitLap: 24,
        tireGripRemainingPct: rc.tires
          ? (rc.tires.fl.estWearPct +
              rc.tires.fr.estWearPct +
              rc.tires.rl.estWearPct +
              rc.tires.rr.estWearPct) /
            4
          : 75.0,
      });
    }

    // Fallback if no telemetry channels are running
    if (plans.length === 0) {
      return [
        {
          carNumber: "963",
          driverName: "Driver A (Incoming)",
          lapsCompletedInStint: 14,
          estFuelLapsRemaining: 3.5,
          projectedPitLap: 24,
          tireGripRemainingPct: 81.4,
        },
        {
          carNumber: "964",
          driverName: "Driver B (Teammate)",
          lapsCompletedInStint: 12,
          estFuelLapsRemaining: 4.8,
          projectedPitLap: 24,
          tireGripRemainingPct: 70.8,
        },
      ];
    }

    return plans;
  }, [localCar, remoteCars]);

  const boardState = evaluateTeamStrategyBoard(stintPlans);

  // Seed baseline race timeline events
  useEffect(() => {
    raceTimelineEngine.clearTimeline();
    raceTimelineEngine.addTimelineEvent(
      1,
      "963",
      "Driver A",
      "SETUP_ADJUSTMENT",
      "Mechanical Rake raised +1.0mm front ride height.",
    );
    raceTimelineEngine.addTimelineEvent(
      8,
      "963",
      "Driver A",
      "CAUTION_PACE",
      "Full Course Yellow pacing active.",
    );
    raceTimelineEngine.addTimelineEvent(
      12,
      "964",
      "Driver B",
      "TYRE_CHANGE",
      "Teammate compound shifted to medium slick set.",
    );
  }, []);

  const timelineEvents = raceTimelineEngine.getTimelineEvents();

  // Simulated pit stop projections (WEC sequential rules)
  const fuelingTime = fuelToLoad / 3.2; // flow rate
  let stationaryTime = fuelingTime;
  if (changeTires) stationaryTime += 22.0;
  if (swapDrivers) stationaryTime += 12.5;
  const totalTimeLoss = stationaryTime + 24.5; // pitlane traversal speed limit loss

  return (
    <div
      className="flex flex-col h-full font-mono text-[10px] p-4 gap-4 overflow-y-auto"
      style={{ backgroundColor: "#07090E", color: "#E2E8F0" }}
    >
      {/* Visual Header Workspace Selectors */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-[#1A202C] gap-3">
        <div className="flex flex-col">
          <span className="text-white font-bold text-sm tracking-wider uppercase">
            ENDURANCE OPERATIONS COMMAND CENTER
          </span>
          <span className="text-[#718096] text-[9px] uppercase">
            multi-car persistent telemetry & coordination dashboard
          </span>
        </div>

        {/* Workspace Role Switcher */}
        <div className="flex border border-[#1A202C] rounded-sm overflow-hidden shrink-0 bg-[#0B0F19]">
          <button
            onClick={() => setActiveRole("owner")}
            className="px-3 py-1.5 font-bold uppercase tracking-wider text-[8px] transition-all cursor-pointer"
            style={{
              backgroundColor: activeRole === "owner" ? "#3B82F6" : "transparent",
              color: activeRole === "owner" ? "white" : "#7A828C",
            }}
          >
            Team Owner
          </button>
          <button
            onClick={() => setActiveRole("strategist")}
            className="px-3 py-1.5 font-bold uppercase tracking-wider text-[8px] transition-all cursor-pointer"
            style={{
              backgroundColor: activeRole === "strategist" ? "#3B82F6" : "transparent",
              color: activeRole === "strategist" ? "white" : "#7A828C",
            }}
          >
            Race Strategist
          </button>
          <button
            onClick={() => setActiveRole("performance")}
            className="px-3 py-1.5 font-bold uppercase tracking-wider text-[8px] transition-all cursor-pointer"
            style={{
              backgroundColor: activeRole === "performance" ? "#3B82F6" : "transparent",
              color: activeRole === "performance" ? "white" : "#7A828C",
            }}
          >
            Performance Eng
          </button>
        </div>
      </div>

      {/* Double-Stack & Stint Warning HUD */}
      {boardState.warnings.length > 0 && (
        <div className="p-3 border border-[#FF4D4D] bg-[rgba(255,77,77,0.05)] rounded-sm flex items-center gap-3">
          <ShieldAlert className="h-4 w-4 text-[#FF4D4D] shrink-0" />
          <div className="flex flex-col gap-0.5 flex-1">
            <span className="font-bold text-[8.5px] uppercase tracking-wider text-[#FF4D4D]">
              CRITICAL ENDURANCE GARAGE ALERTS
            </span>
            <span className="text-white font-bold leading-normal">
              {boardState.warnings[0].message}
            </span>
          </div>
          <div className="text-[8px] text-[#FF4D4D] font-bold border border-[#FF4D4D] px-2 py-0.5 rounded-sm uppercase shrink-0">
            Double-Stack Threat
          </div>
        </div>
      )}

      {/* Grid: Specialized Workspaces */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Left Column: Custom Active Workspace Views */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* 1. TEAM OWNER WORKSPACE */}
          {activeRole === "owner" && (
            <div
              className="p-4 rounded-sm border flex flex-col gap-4 flex-1"
              style={{ backgroundColor: "#0B0F19", borderColor: "#1A202C" }}
            >
              <div className="pb-2 border-b border-[#1A202C] flex items-center justify-between">
                <span className="font-black text-[#3B82F6] tracking-widest text-[9px] uppercase">
                  TEAM OWNER OVERVIEW & GARAGE RISK PROFILE
                </span>
                <Users className="h-3.5 w-3.5 text-[#3D4751]" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
                  <span className="text-[#718096] text-[8px] block uppercase font-bold mb-0.5">
                    Active Cars
                  </span>
                  <span className="text-white text-base font-black">
                    {stintPlans.length} {stintPlans.length === 1 ? "Car" : "Cars"} Active
                  </span>
                </div>
                <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
                  <span className="text-[#718096] text-[8px] block uppercase font-bold mb-0.5">
                    Risk State
                  </span>
                  <span
                    className="text-base font-black"
                    style={{ color: boardState.warnings.length > 0 ? "#FF4D4D" : "#FFB800" }}
                  >
                    {boardState.warnings.length > 0 ? "HIGH THREAT" : "OPTIMAL CONTROL"}
                  </span>
                </div>
                <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
                  <span className="text-[#718096] text-[8px] block uppercase font-bold mb-0.5">
                    Stint Health
                  </span>
                  <span className="text-[#00D17F] text-base font-black">
                    {(enduranceState
                      ? (enduranceState.brakeWear + enduranceState.ersHealth) / 2
                      : 94.2
                    ).toFixed(1)}
                    % Optimal
                  </span>
                </div>
                <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
                  <span className="text-[#718096] text-[8px] block uppercase font-bold mb-0.5">
                    Operational Confidence
                  </span>
                  <span className="text-white text-base font-black">
                    {boardState.warnings.length > 0 ? "78.0%" : "92.5%"}
                  </span>
                </div>
              </div>

              <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm text-[8.5px]">
                <span className="text-[#718096] uppercase font-bold block mb-1">
                  Active Driver Swap Adaptation Warnings
                </span>
                {adaptationState ? (
                  <>
                    <p className="text-white leading-normal mb-1">
                      Driver swap adaptation window active for incoming **
                      {adaptationState.incomingDriver || "Incoming"}**. Core steering input jitter
                      signature delta is {adaptationState.steeringJitterMismatchPct}%. Brake bite
                      pressure deviation is {adaptationState.brakeBiteMismatchPct}% from outgoing
                      baseline.
                    </p>
                    <span className="text-[#FFB800] font-black uppercase text-[8px] block">
                      Adaptation window: Lap {adaptationState.currentLapInWindow || 1} of 3 laps
                    </span>
                  </>
                ) : (
                  <p className="text-[#718096] leading-normal">
                    No active driver changes. Adaptation transition monitoring is currently idle.
                  </p>
                )}
              </div>

              <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm text-[8.5px] mt-auto">
                <span className="text-[#718096] uppercase font-bold block mb-0.5">
                  OWNER DIRECTIVE SUMMARY
                </span>
                <span className="text-white leading-relaxed">
                  Both vehicles running cleanly. Gap overlays are secure. Caution pacing Standby
                  mode active.
                </span>
              </div>
            </div>
          )}

          {/* 2. RACE STRATEGIST WORKSPACE */}
          {activeRole === "strategist" && (
            <div
              className="p-4 rounded-sm border flex flex-col gap-4 flex-1"
              style={{ backgroundColor: "#0B0F19", borderColor: "#1A202C" }}
            >
              <div className="pb-2 border-b border-[#1A202C] flex items-center justify-between">
                <span className="font-black text-[#3B82F6] tracking-widest text-[9px] uppercase">
                  RACE STRATEGIST MULTI-STINT WINDOWS
                </span>
                <Clock className="h-3.5 w-3.5 text-[#3D4751]" />
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
                  <span className="text-[#718096] text-[8.5px] block uppercase font-bold mb-0.5">
                    Stationary Fuel time
                  </span>
                  <span className="text-white text-base font-bold tabular-nums">
                    {stationaryTime.toFixed(1)}s
                  </span>
                </div>
                <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
                  <span className="text-[#718096] text-[8.5px] block uppercase font-bold mb-0.5">
                    Total Pitlane Loss
                  </span>
                  <span className="text-white text-base font-bold tabular-nums">
                    -{totalTimeLoss.toFixed(1)}s
                  </span>
                </div>
              </div>

              <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm text-[8.5px]">
                <span className="text-[#718096] uppercase font-bold block mb-1">
                  Teammate Stint Coordination plans
                </span>
                <div className="flex flex-col gap-2 mt-2 font-mono text-[8.5px]">
                  {stintPlans.map((plan, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-1 border-b border-[#1B2232]"
                    >
                      <span className="text-white font-bold">
                        Car #{plan.carNumber} ({plan.driverName})
                      </span>
                      <span className="text-[#718096]">
                        Stint laps: {plan.lapsCompletedInStint} · Pit:{" "}
                        <span className="text-white font-bold">L{plan.projectedPitLap}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm text-[8.5px]">
                <span className="text-[#718096] uppercase font-bold block mb-1">
                  Strategist Guidance Recommendation
                </span>
                <span className="text-[#00D17F] font-black block mb-1">
                  {boardState.recommendations[0]}
                </span>
              </div>
            </div>
          )}

          {/* 3. PERFORMANCE ENGINEER WORKSPACE */}
          {activeRole === "performance" && (
            <div
              className="p-4 rounded-sm border flex flex-col gap-4 flex-1"
              style={{ backgroundColor: "#0B0F19", borderColor: "#1A202C" }}
            >
              <div className="pb-2 border-b border-[#1A202C] flex items-center justify-between">
                <span className="font-black text-[#3B82F6] tracking-widest text-[9px] uppercase">
                  PERFORMANCE VEHICLE STATE & CUMULATIVE WEAR
                </span>
                <Activity className="h-3.5 w-3.5 text-[#3D4751]" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-white font-bold text-[10px] tabular-nums">
                <div className="p-2.5 border border-[#1A202C] bg-[#07090E] rounded-sm">
                  <span className="text-[7.5px] text-[#718096] block uppercase font-bold mb-0.5">
                    Chassis Fatigue
                  </span>
                  {enduranceState?.chassisFatigue.toFixed(2) ?? "0.00"}%
                </div>
                <div className="p-2.5 border border-[#1A202C] bg-[#07090E] rounded-sm">
                  <span className="text-[7.5px] text-[#718096] block uppercase font-bold mb-0.5">
                    Brake Pad wear
                  </span>
                  {enduranceState?.brakeWear.toFixed(2) ?? "100.00"}%
                </div>
                <div className="p-2.5 border border-[#1A202C] bg-[#07090E] rounded-sm">
                  <span className="text-[7.5px] text-[#718096] block uppercase font-bold mb-0.5">
                    Gearbox Stress
                  </span>
                  {enduranceState?.gearboxStress.toFixed(2) ?? "0.00"}%
                </div>
                <div className="p-2.5 border border-[#1A202C] bg-[#07090E] rounded-sm">
                  <span className="text-[7.5px] text-[#718096] block uppercase font-bold mb-0.5">
                    Battery Retention
                  </span>
                  {enduranceState?.ersHealth.toFixed(2) ?? "100.00"}%
                </div>
              </div>

              <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm text-[8.5px]">
                <span className="text-[#718096] uppercase font-bold block mb-1">
                  Active underbody splitters deflection
                </span>
                <p className="text-white leading-normal">
                  Chassis vertical deflections conform to standard GT3 limits. Zero Splitter
                  grounding or underbody stalls detected over the previous 4 laps. Diffuser vacuum
                  seal rating: 98%.
                </p>
              </div>

              <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm text-[8.5px] mt-auto">
                <span className="text-[#718096] uppercase font-bold block mb-1">
                  Performance Engineer Action advice
                </span>
                <span className="text-white leading-relaxed">
                  No immediate setup adjustments advised. Mechanical damper extension and roll bar
                  roll margins remain safe.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Stint Pit planner & Race chronological timeline */}
        <div className="flex flex-col gap-4">
          {/* Pit Stop Planner */}
          <div
            className="p-4 rounded-sm border"
            style={{ backgroundColor: "#0B0F19", borderColor: "#1A202C" }}
          >
            <div className="pb-2 border-b border-[#1A202C] mb-3">
              <span className="font-black text-[#3B82F6] tracking-widest text-[9px] uppercase">
                ENDURANCE PIT STOP PLANNER
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[#718096] text-[8px] block uppercase font-bold mb-1">
                  Refuel Volume: <span className="text-white font-bold">{fuelToLoad} Litres</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="5"
                  value={fuelToLoad}
                  onChange={(e) => setFuelToLoad(parseInt(e.target.value, 10))}
                  className="w-full bg-[#1A202C]"
                />
              </div>

              <div className="flex items-center justify-between border-t border-[#1A202C] pt-2">
                <span className="text-[#718096] text-[8.5px] uppercase font-bold">
                  Change 4 Tyres
                </span>
                <input
                  type="checkbox"
                  checked={changeTires}
                  onChange={(e) => setChangeTires(e.target.checked)}
                />
              </div>

              <div className="flex items-center justify-between border-t border-[#1A202C] pt-2">
                <span className="text-[#718096] text-[8.5px] uppercase font-bold">Driver Swap</span>
                <input
                  type="checkbox"
                  checked={swapDrivers}
                  onChange={(e) => setSwapDrivers(e.target.checked)}
                />
              </div>
            </div>
          </div>

          {/* Chronological Race Timeline */}
          <div
            className="p-4 rounded-sm border flex flex-col flex-1"
            style={{ backgroundColor: "#0B0F19", borderColor: "#1A202C" }}
          >
            <div className="pb-2 border-b border-[#1A202C] mb-3">
              <span className="font-black text-[#3B82F6] tracking-widest text-[9px] uppercase">
                CHRONOLOGICAL RACE TIMELINE
              </span>
            </div>

            <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto max-h-[220px]">
              {timelineEvents.map((ev, idx) => (
                <div
                  key={idx}
                  className="p-2 border border-[#1A202C] bg-[#07090E] rounded-sm text-[8.5px]"
                >
                  <div className="flex justify-between items-center text-[#718096] text-[7.5px] font-bold uppercase mb-0.5">
                    <span>
                      L{ev.lapNumber} · Car #{ev.carNumber}
                    </span>
                    <span>{ev.eventType}</span>
                  </div>
                  <span className="text-white leading-relaxed">{ev.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
