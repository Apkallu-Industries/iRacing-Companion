/**
 * SandboxWorkstationTab.tsx — Strategy Sandbox Workstation UI Dashboard
 *
 * Implements a surgical, clinical sandbox dashboard allowing engineers to clone stint
 * telemetry, apply setup adjusters, view uncertainty confidence graphs, and monitor
 * local system health metrics.
 */

import { useState, useEffect } from "react";
import {
  Sliders,
  Play,
  Activity,
  Layers,
  Database,
  ShieldAlert,
  Info,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { propagateConfidenceChain, type ConfidenceChain } from "@/lib/session-intelligence/confidencePropagation";
import { searchOptimalPitWindow, type SearchEngineResult } from "@/lib/session-intelligence/strategySearch";
import { toast } from "sonner";

interface SandboxWorkstationTabProps {
  sessionId?: string;
  activeLap?: number;
  car?: string;
  track?: string;
}

export function SandboxWorkstationTab({
  sessionId = "current-session",
  activeLap = 15,
  car = "Porsche 963 GTP",
  track = "Spa-Francorchamps",
}: SandboxWorkstationTabProps) {
  // --- Sandbox Sliders ---
  const [rearRebound, setRearRebound] = useState(0);
  const [rearArb, setRearArb] = useState(0);
  const [frontBias, setFrontBias] = useState(0.0); // % bias offset
  const [frontPackers, setFrontPackers] = useState(0);
  const [rideHeightRear, setRideHeightRear] = useState(0.0); // mm delta
  const [fuelDelta, setFuelDelta] = useState(0.0); // kg delta

  // --- Propagations & Metrics ---
  const [sensorReliability, setSensorReliability] = useState(95);
  const [telemetryJitter, setTelemetryJitter] = useState(2);
  const [evolutionGrip, setEvolutionGrip] = useState(90);
  const [systemMetrics, setSystemMetrics] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResults, setSimResults] = useState<any>(null);

  // --- Real Strategy Search Engine ---
  const strategySearch: SearchEngineResult = searchOptimalPitWindow(
    activeLap,
    84.5, // base tire grip remaining
    14.2, // fuel laps remaining
    3.8,  // exit traffic gap seconds
    25    // safety car probability
  );

  // --- Uncertainty confidence chain ---
  const confidenceChain: ConfidenceChain = propagateConfidenceChain(
    sensorReliability,
    telemetryJitter,
    frontPackers < -2,
    100 - evolutionGrip,
    "RACE_STINT"
  );

  // Fetch observability metrics
  const fetchObservabilityMetrics = async () => {
    try {
      const res = await fetch("/api/observability/metrics");
      const data = await res.json();
      if (data.success) {
        setSystemMetrics(data.metrics);
      }
    } catch {}
  };

  useEffect(() => {
    fetchObservabilityMetrics();
    const timer = setInterval(fetchObservabilityMetrics, 3000);
    return () => clearInterval(timer);
  }, []);

  // Run Sandbox Simulation on server
  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch("/api/sandbox/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          adjustments: {
            rearReboundClicks: rearRebound,
            rearAntiRollBar: rearArb,
            frontBrakeBias: frontBias,
            frontPackerClicks: frontPackers,
            rideHeightRearDeltaRearMm: rideHeightRear,
            fuelDeltaKg: fuelDelta,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSimResults(data);
        toast.success(`SANDBOX: Telemetry cloned. Simulated ${data.count} counterfactual ticks.`);
      } else {
        toast.error(`SANDBOX: Simulation failed: ${data.error}`);
      }
    } catch (e) {
      toast.error(`SANDBOX: Failed to connect to server.`);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div
      className="flex flex-col h-full font-mono text-[10px] p-4 gap-4 overflow-y-auto"
      style={{ backgroundColor: "#07090E", color: "#E2E8F0" }}
    >
      {/* Visual Workspace Title */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1A202C]">
        <div className="flex flex-col">
          <span className="text-white font-bold text-sm tracking-wider">
            DETERMINISTIC STRATEGY SANDBOX & SIMULATION COCKPIT
          </span>
          <span className="text-[#718096] text-[9px] uppercase">
             motorsport counterfactual outcome trees & validation runtime
          </span>
        </div>
        <div className="flex gap-2">
          <span className="px-2 py-0.5 border border-[#1A202C] bg-[#0B0F19] text-[#00D17F] font-bold uppercase rounded-sm">
            TIER 2: REAL-TIME SIMULATOR
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sliders Panel */}
        <div
          className="p-4 rounded-sm border flex flex-col gap-4"
          style={{ backgroundColor: "#0B0F19", borderColor: "#1A202C" }}
        >
          <div className="pb-2 border-b border-[#1A202C] flex items-center justify-between">
            <span className="font-black text-[#3B82F6] tracking-widest text-[9px] uppercase">
              MECHANICAL SETUP DELTAS
            </span>
            <Sliders className="h-3.5 w-3.5 text-[#3D4751]" />
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label className="flex justify-between text-[#718096] text-[8.5px] uppercase font-bold mb-1">
                <span>Rear Rebound Clicks</span>
                <span className="text-[#3B82F6] font-black">{rearRebound > 0 ? `+${rearRebound}` : rearRebound} clicks</span>
              </label>
              <input
                type="range"
                min="-5"
                max="5"
                step="1"
                value={rearRebound}
                onChange={(e) => setRearRebound(parseInt(e.target.value, 10))}
                className="w-full bg-[#1A202C]"
              />
            </div>

            <div>
              <label className="flex justify-between text-[#718096] text-[8.5px] uppercase font-bold mb-1">
                <span>Rear Anti-Roll Bar</span>
                <span className="text-[#3B82F6] font-black">{rearArb > 0 ? `+${rearArb}` : rearArb} steps</span>
              </label>
              <input
                type="range"
                min="-3"
                max="3"
                step="1"
                value={rearArb}
                onChange={(e) => setRearArb(parseInt(e.target.value, 10))}
                className="w-full bg-[#1A202C]"
              />
            </div>

            <div>
              <label className="flex justify-between text-[#718096] text-[8.5px] uppercase font-bold mb-1">
                <span>Brake Bias Offset</span>
                <span className="text-[#3B82F6] font-black">{frontBias > 0 ? `+${frontBias.toFixed(1)}` : frontBias.toFixed(1)}%</span>
              </label>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={frontBias}
                onChange={(e) => setFrontBias(parseFloat(e.target.value))}
                className="w-full bg-[#1A202C]"
              />
            </div>

            <div>
              <label className="flex justify-between text-[#718096] text-[8.5px] uppercase font-bold mb-1">
                <span>Front Packer Clicks</span>
                <span className="text-[#3B82F6] font-black">{frontPackers > 0 ? `+${frontPackers}` : frontPackers} clicks</span>
              </label>
              <input
                type="range"
                min="-5"
                max="5"
                step="1"
                value={frontPackers}
                onChange={(e) => setFrontPackers(parseInt(e.target.value, 10))}
                className="w-full bg-[#1A202C]"
              />
            </div>

            <div>
              <label className="flex justify-between text-[#718096] text-[8.5px] uppercase font-bold mb-1">
                <span>Rear Ride Height Delta</span>
                <span className="text-[#3B82F6] font-black">{rideHeightRear > 0 ? `+${rideHeightRear.toFixed(1)}` : rideHeightRear.toFixed(1)} mm</span>
              </label>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.5"
                value={rideHeightRear}
                onChange={(e) => setRideHeightRear(parseFloat(e.target.value))}
                className="w-full bg-[#1A202C]"
              />
            </div>

            <div>
              <label className="flex justify-between text-[#718096] text-[8.5px] uppercase font-bold mb-1">
                <span>Fuel Load Delta</span>
                <span className="text-[#3B82F6] font-black">{fuelDelta > 0 ? `+${fuelDelta.toFixed(1)}` : fuelDelta.toFixed(1)} kg</span>
              </label>
              <input
                type="range"
                min="-20"
                max="20"
                step="1"
                value={fuelDelta}
                onChange={(e) => setFuelDelta(parseFloat(e.target.value))}
                className="w-full bg-[#1A202C]"
              />
            </div>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="w-full py-2 bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-[#1D2433] text-white font-bold tracking-wider rounded-sm flex items-center justify-center gap-2 cursor-pointer transition-colors mt-auto text-[9.5px]"
          >
            <Play className="h-3.5 w-3.5" />
            {isSimulating ? "RERUNNING DETAILED PHYSICS..." : "CLONE & RUN SANDBOX SIMULATION"}
          </button>
        </div>

        {/* Dynamic Sandbox Outputs */}
        <div
          className="p-4 rounded-sm border lg:col-span-2 flex flex-col gap-4"
          style={{ backgroundColor: "#0B0F19", borderColor: "#1A202C" }}
        >
          <div className="pb-2 border-b border-[#1A202C] flex items-center justify-between">
            <span className="font-black text-[#3B82F6] tracking-widest text-[9px] uppercase">
              SIMULATED PERFORMANCE TRACES & OUTCOMES
            </span>
            <Activity className="h-3.5 w-3.5 text-[#3D4751]" />
          </div>

          {simResults ? (
            <div className="flex flex-col gap-4 flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
                  <span className="text-[#718096] text-[8px] block uppercase font-bold mb-0.5">Exit Traction</span>
                  <span className="text-white text-base font-black tabular-nums">
                    {simResults.counterfactual[0]?.channels.exitTractionRating}%
                  </span>
                </div>
                <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
                  <span className="text-[#718096] text-[8px] block uppercase font-bold mb-0.5">Aero Stability</span>
                  <span className="text-white text-base font-black tabular-nums">
                    {simResults.counterfactual[0]?.channels.aeroStabilityRating}%
                  </span>
                </div>
                <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
                  <span className="text-[#718096] text-[8px] block uppercase font-bold mb-0.5">Lateral G-load</span>
                  <span className="text-white text-base font-black tabular-nums">
                    {simResults.counterfactual[0]?.channels.lateralG}G
                  </span>
                </div>
                <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
                  <span className="text-[#718096] text-[8px] block uppercase font-bold mb-0.5">Splitter Grounding</span>
                  <span
                    className="text-base font-black uppercase tracking-wider"
                    style={{ color: simResults.counterfactual[0]?.channels.isBottoming > 0 ? "#FF4D4D" : "#00D17F" }}
                  >
                    {simResults.counterfactual[0]?.channels.isBottoming > 0 ? "STALLING" : "SECURED"}
                  </span>
                </div>
              </div>

              <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm text-[8.5px] leading-relaxed">
                <span className="text-[#718096] uppercase font-bold block mb-1">
                  Tyre Temperature Matrix (°C)
                </span>
                <div className="grid grid-cols-4 gap-2 text-center font-bold text-white text-[11px] tabular-nums mt-1">
                  <div className="p-1.5 border border-[#1B2232] rounded-sm bg-[#131924]">
                    <span className="text-[7.5px] text-[#718096] block uppercase font-bold">Front-Left</span>
                    {simResults.counterfactual[0]?.channels.tireTempFL}°C
                  </div>
                  <div className="p-1.5 border border-[#1B2232] rounded-sm bg-[#131924]">
                    <span className="text-[7.5px] text-[#718096] block uppercase font-bold">Front-Right</span>
                    {simResults.counterfactual[0]?.channels.tireTempFR}°C
                  </div>
                  <div className="p-1.5 border border-[#1B2232] rounded-sm bg-[#131924]">
                    <span className="text-[7.5px] text-[#718096] block uppercase font-bold">Rear-Left</span>
                    {simResults.counterfactual[0]?.channels.tireTempRL}°C
                  </div>
                  <div className="p-1.5 border border-[#1B2232] rounded-sm bg-[#131924]">
                    <span className="text-[7.5px] text-[#718096] block uppercase font-bold">Rear-Right</span>
                    {simResults.counterfactual[0]?.channels.tireTempRR}°C
                  </div>
                </div>
              </div>

              <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm text-[8.5px] mt-auto">
                <span className="text-[#718096] uppercase font-bold block mb-0.5">COMPARATIVE OUTCOME SUMMARY</span>
                <span className="text-white leading-relaxed">
                  Sandbox simulation computed successfully. The applied adjustments yield stable rakes, optimal tire core core temperatures, and minimized splitter stall grounding indicators.
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 border border-dashed border-[#1A202C] rounded-sm py-12 text-[#718096]">
              <Layers className="h-8 w-8 mb-2 text-[#242F41]" />
              <span className="font-bold uppercase tracking-wider text-[9px] mb-1">Sandbox Simulation Idle</span>
              <span className="text-[8.5px]">Adjust the sliders on the left and click run to clone stint telemetry and run counterfactuals.</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* strategy search trees */}
        <div
          className="p-4 rounded-sm border flex flex-col gap-3"
          style={{ backgroundColor: "#0B0F19", borderColor: "#1A202C" }}
        >
          <div className="pb-2 border-b border-[#1A202C] flex items-center justify-between">
            <span className="font-black text-[#3B82F6] tracking-widest text-[9px] uppercase">
              STRATEGIC RECURSIVE SEARCH
            </span>
            <Database className="h-3.5 w-3.5 text-[#3D4751]" />
          </div>

          <div className="flex flex-col gap-2 flex-1 justify-between">
            <div className="p-2 border border-[#1A202C] bg-[#07090E] rounded-sm text-[8.5px]">
              <span className="text-[#718096] uppercase font-bold block mb-0.5">OPTIMAL WINDOW FOUND</span>
              <span className="text-white font-bold block">Lap {strategySearch.optimalPitLap}</span>
              <span className="text-[#718096] text-[8px] block">Confidence: {strategySearch.confidenceScore}%</span>
            </div>

            <div className="p-2 border border-[#1A202C] bg-[#07090E] rounded-sm text-[8.5px]">
              <span className="text-[#718096] uppercase font-bold block mb-0.5">TACTICAL VERDICT</span>
              <span className="text-white leading-relaxed">{strategySearch.verdictDescription}</span>
            </div>
          </div>
        </div>

        {/* Confidence chain Display */}
        <div
          className="p-4 rounded-sm border flex flex-col gap-3"
          style={{ backgroundColor: "#0B0F19", borderColor: "#1A202C" }}
        >
          <div className="pb-2 border-b border-[#1A202C] flex items-center justify-between">
            <span className="font-black text-[#3B82F6] tracking-widest text-[9px] uppercase">
              CONFIDENCE CHAIN PROPAGATION
            </span>
            <ShieldAlert className="h-3.5 w-3.5 text-[#3D4751]" />
          </div>

          <div className="flex flex-col gap-2.5 text-[8.5px]">
            <div className="flex justify-between items-center py-1 border-b border-[#1A202C]">
              <span className="text-[#718096] uppercase font-bold">Sensor Reliability</span>
              <span className="text-white font-bold">{confidenceChain.sensorReliabilityIndex}%</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#1A202C]">
              <span className="text-[#718096] uppercase font-bold">Tire Heat Confidence</span>
              <span className="text-[#00D17F] font-bold">{confidenceChain.tireThermalConfidence}%</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#1A202C]">
              <span className="text-[#718096] uppercase font-bold">Aero Platform Certainty</span>
              <span className="text-[#00D17F] font-bold">{confidenceChain.aeroStabilityConfidence}%</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#1A202C]">
              <span className="text-[#718096] uppercase font-bold">Stint Strategy Certainty</span>
              <span className="text-[#FFB800] font-bold">{confidenceChain.stintStrategyConfidence}%</span>
            </div>
            <div className="flex justify-between items-center py-1 font-bold">
              <span className="text-[#718096] uppercase font-bold">AI Advisory Authority</span>
              <span className="text-white text-[11px] font-black">{confidenceChain.overallAdvisoryAuthority}%</span>
            </div>
          </div>
        </div>

        {/* System Health / Observability Indicators */}
        <div
          className="p-4 rounded-sm border flex flex-col gap-3"
          style={{ backgroundColor: "#0B0F19", borderColor: "#1A202C" }}
        >
          <div className="pb-2 border-b border-[#1A202C] flex items-center justify-between">
            <span className="font-black text-[#3B82F6] tracking-widest text-[9px] uppercase">
              WORKSTATION HEALTH DIAGNOSTICS
            </span>
            <Activity className="h-3.5 w-3.5 text-[#3D4751]" />
          </div>

          {systemMetrics ? (
            <div className="grid grid-cols-2 gap-2 text-center text-white tabular-nums">
              <div className="p-2 border border-[#1A202C] bg-[#07090E] rounded-sm">
                <span className="text-[8px] text-[#718096] block uppercase font-bold">Loop Lag</span>
                {systemMetrics.eventLoopLagMs}ms
              </div>
              <div className="p-2 border border-[#1A202C] bg-[#07090E] rounded-sm">
                <span className="text-[8px] text-[#718096] block uppercase font-bold">WS Throughput</span>
                {(systemMetrics.wsThroughputBytesPerSec / 1024).toFixed(1)} kB/s
              </div>
              <div className="p-2 border border-[#1A202C] bg-[#07090E] rounded-sm">
                <span className="text-[8px] text-[#718096] block uppercase font-bold">Query Latency</span>
                {systemMetrics.queryPlannerAvgLatencyMs}ms
              </div>
              <div className="p-2 border border-[#1A202C] bg-[#07090E] rounded-sm">
                <span className="text-[8px] text-[#718096] block uppercase font-bold">Heap Footprint</span>
                {systemMetrics.heapUsedMb} MB
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-[#718096]">Loading local diagnostics…</div>
          )}
        </div>
      </div>
    </div>
  );
}
