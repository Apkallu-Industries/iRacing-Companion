/**
 * IntelligenceDashboard.tsx — Workstation Intelligence Dashboard UI
 *
 * Surfacing driver fingerprints, learned corner archetypes, predictive stability alerts,
 * setup correction weighting, and interactive strategy notebook logs.
 *
 * Strictly adheres to dense, industrial, and low-latency motorsport aesthetics.
 */

import { useState, useEffect } from "react";
import {
  Brain,
  User,
  ShieldAlert,
  Compass,
  TrendingUp,
  BookOpen,
  Plus,
  Bookmark,
  Activity,
  Award,
} from "lucide-react";
import {
  TEAM_PROFILES,
  type TeamKnowledgeProfile,
} from "@/lib/session-intelligence/profiles";
import {
  generateDriverFingerprint,
  type DriverFingerprint,
} from "@/lib/driver-model/driverFingerprint";
import { classifyCornerArchetype, type CornerArchetype } from "@/lib/driver-model/cornerArchetypeLearner";
import { predictNextTickInstability, type TelemetryTickFrame } from "@/lib/session-intelligence/predictiveEngine";
import { calculateSetupAdviceConfidence } from "@/lib/session-intelligence/setupConfidence";
import { toast } from "sonner";

interface IntelligenceDashboardProps {
  sessionId?: string;
  activeLap?: number;
  carClass?: string;
  trackName?: string;
}

export function IntelligenceDashboard({
  sessionId = "current-session",
  activeLap = 1,
  carClass = "GT3 Class",
  trackName = "Spa-Francorchamps",
}: IntelligenceDashboardProps) {
  // --- States ---
  const [activeTab, setActiveTab] = useState<"driver" | "corners" | "predictive" | "setup" | "notebook">("driver");
  const [driverName, setDriverName] = useState("Dany M.");
  
  // Custom states for Notebook Strategy
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [notesList, setNotesList] = useState<Array<{ title: string; content: string; timestamp: string }>>([
    {
      title: "Monza Sector 2 Trail-Brake release adjustment",
      content: "Chassis bottoming transiently through Ascari. Increased front packers by +1 click, resolving stability lockup risk on entry trail.",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  // Mock baseline telemetry logs representing a stint for fingerprinting
  const mockBrakeMetrics = {
    peakBrakePressure: 0.82,
    averageBrakeGradient: 4.82,
    trailBrakeDurationSec: 1.54,
    releaseRate: 3.12,
    lockupTendencyIndex: 0.08,
  };

  const mockThrottleMetrics = {
    throttleExitGradient: 5.22,
    liftAndCoastDurationSec: 1.15,
    throttleOscillationFrequency: 2,
    correctionReactionTimeSec: 0.28,
  };

  const mockSteeringMetrics = {
    steeringVelocity: 1.48,
    microCorrectionFrequencyHz: 2.15,
    maxSteeringAngleRad: 1.12,
    steeringSmoothnessIndex: 91.5,
  };

  const mockConsistency = {
    lapTimeStandardDeviationSec: 0.124,
    apexSpeedStdDevMps: 0.42,
    brakeMarkersVarianceMeters: 0.85,
    throttleApplyVariancePct: 3.12,
    overallConsistencyScore: 92.4,
  };

  const fingerprint: DriverFingerprint = generateDriverFingerprint(
    "driver-01",
    driverName,
    carClass,
    trackName,
    mockBrakeMetrics,
    mockThrottleMetrics,
    mockSteeringMetrics,
    mockConsistency
  );

  // Corner archetypes mock list mapping track corners dynamically
  const learnedCorners = [
    { corner: "T1 (La Source)", apex: 62.4, latG: 1.12, trail: 1.45, shock: 42, exitStraight: 420 },
    { corner: "T2/T3 (Eau Rouge)", apex: 224.2, latG: 1.85, trail: 0.12, shock: 198, exitStraight: 850 },
    { corner: "T5 (Les Combes)", apex: 128.5, latG: 1.42, trail: 1.22, shock: 65, exitStraight: 280 },
    { corner: "T8 (Bruxelles)", apex: 88.4, latG: 1.25, trail: 1.84, shock: 54, exitStraight: 150 },
    { corner: "T15 (Stavelot)", apex: 184.2, latG: 1.72, trail: 0.42, shock: 88, exitStraight: 650 },
  ].map((c) => {
    const classification = classifyCornerArchetype(c.apex / 3.6, c.latG, c.trail, c.shock, c.exitStraight);
    return { ...c, ...classification };
  });

  // Simulated setup adjustments for confidence weighting
  const setupHistory = [
    { change_type: "Rear Rebound", notes: "stabilize exit traction, reduced oversteer slide, resolved entry bottoming" },
    { change_type: "Rear Rebound", notes: "improved exit rotation" },
    { change_type: "Rear Anti-Roll Bar", notes: "understeer sweep, compromised mid rotation" },
  ];

  const reboundConfidence = calculateSetupAdviceConfidence("Rear Rebound", setupHistory, "driver-01");
  const arbConfidence = calculateSetupAdviceConfidence("Rear Anti-Roll Bar", setupHistory, "driver-01");

  // Real-time predictive telemetry frame analysis simulator
  const [currBrake, setCurrBrake] = useState(0.85);
  const [currYaw, setCurrYaw] = useState(0.38);
  const [currSteer, setCurrSteer] = useState(-0.72);

  const prevTick: TelemetryTickFrame = {
    tick: 100,
    speedMps: 42.5,
    brake: currBrake - 0.1,
    throttle: 0.0,
    steeringWheelAngle: currSteer + 0.15,
    yawRate: currYaw - 0.1,
    pitch: -0.012,
    roll: 0.005,
    frontLeftDeflection: 45,
  };

  const currTick: TelemetryTickFrame = {
    tick: 101,
    speedMps: 41.2,
    brake: currBrake,
    throttle: 0.0,
    steeringWheelAngle: currSteer,
    yawRate: currYaw,
    pitch: -0.015,
    roll: 0.008,
    frontLeftDeflection: 58,
  };

  const prediction = predictNextTickInstability(currTick, prevTick);

  const addNote = () => {
    if (!noteTitle || !noteContent) return;
    setNotesList([
      {
        title: noteTitle,
        content: noteContent,
        timestamp: new Date().toLocaleTimeString(),
      },
      ...notesList,
    ]);
    setNoteTitle("");
    setNoteContent("");
    toast.success("Strategy Notebook note saved successfully.");
  };

  return (
    <div
      className="flex flex-col h-full font-mono text-[10px]"
      style={{ backgroundColor: "#07090E", color: "#E2E8F0" }}
    >
      {/* Workstation Tab Header */}
      <div
        className="flex items-center justify-between border-b"
        style={{ borderColor: "#1A202C", backgroundColor: "#0B0F19" }}
      >
        <div className="flex">
          {[
            { id: "driver", label: "DRIVER FINGERPRINT", icon: User },
            { id: "corners", label: "CORNER LEARNING", icon: Compass },
            { id: "predictive", label: "PREDICTIVE ENGINE", icon: ShieldAlert },
            { id: "setup", label: "SETUP CONFIDENCE", icon: TrendingUp },
            { id: "notebook", label: "STRATEGY NOTEBOOK", icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="flex items-center gap-1.5 px-4 py-2 border-r text-[9px] font-bold tracking-wider cursor-pointer hover:bg-[#131924]"
                style={{
                  borderColor: "#1A202C",
                  color: isSelected ? "#3B82F6" : "#718096",
                  borderBottom: isSelected ? "2px solid #3B82F6" : "2px solid transparent",
                  backgroundColor: isSelected ? "#0F1420" : "transparent",
                }}
              >
                <Icon className="h-3 w-3" />
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="px-4 text-[8px] text-[#718096]">
          RUNTIME STATUS: <span className="text-[#00D17F] font-bold">CALIBRATED</span>
        </div>
      </div>

      {/* Main Content Workspace */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "driver" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Signature Summary */}
            <div
              className="p-4 rounded-sm border"
              style={{ backgroundColor: "#0B0F19", borderColor: "#1A202C" }}
            >
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1A202C]">
                <span className="font-black text-[#3B82F6] tracking-widest text-[9px] uppercase">
                  METRIC IDENTIFIERS
                </span>
                <span
                  className="px-2 py-0.5 rounded-sm text-[8px] font-black tracking-widest"
                  style={{ backgroundColor: "#1A202C", color: "#00D17F" }}
                >
                  {fingerprint.driverClass}
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#718096]">DRIVER ID:</span>
                  <span className="text-white font-bold">{fingerprint.driverName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#718096]">COGNITION OVERALL RATING:</span>
                  <span className="text-[#3B82F6] font-bold tabular-nums">{fingerprint.overallRating}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#718096]">PACE VARIANCE (LAP SD):</span>
                  <span className="text-white font-bold tabular-nums">{fingerprint.consistency.lapTimeStandardDeviationSec}s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#718096]">APEX SPEED VARIABILITY:</span>
                  <span className="text-white font-bold tabular-nums">±{fingerprint.consistency.apexSpeedStdDevMps} m/s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#718096]">BRAKE MARKER DELTA:</span>
                  <span className="text-white font-bold tabular-nums">±{fingerprint.consistency.brakeMarkersVarianceMeters}m</span>
                </div>
              </div>

              <div className="mt-4 p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
                <span className="text-[8px] text-[#718096] uppercase font-bold tracking-wider block mb-1">
                  TACTICAL FOCUS TASKS
                </span>
                <ul className="list-disc pl-4 space-y-1 text-[#E2E8F0]">
                  {fingerprint.focusAreas.map((area, idx) => (
                    <li key={idx} className="leading-relaxed">{area}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Input Signatures Table */}
            <div
              className="p-4 rounded-sm border flex flex-col justify-between"
              style={{ backgroundColor: "#0B0F19", borderColor: "#1A202C" }}
            >
              <div>
                <div className="pb-2 border-b border-[#1A202C] mb-3">
                  <span className="font-black text-[#3B82F6] tracking-widest text-[9px] uppercase">
                    INPUT TELEMETRY RATINGS
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
                    <span className="text-[#718096] text-[8px] block uppercase font-bold">
                      Brake Decel Peak
                    </span>
                    <span className="text-white text-base font-bold tabular-nums">
                      {(fingerprint.brakeSignature.peakBrakePressure * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
                    <span className="text-[#718096] text-[8px] block uppercase font-bold">
                      Brake Decel Gradient
                    </span>
                    <span className="text-white text-base font-bold tabular-nums">
                      {fingerprint.brakeSignature.averageBrakeGradient} u/s
                    </span>
                  </div>
                  <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
                    <span className="text-[#718096] text-[8px] block uppercase font-bold">
                      Trailbrake Duration
                    </span>
                    <span className="text-white text-base font-bold tabular-nums">
                      {fingerprint.brakeSignature.trailBrakeDurationSec}s
                    </span>
                  </div>
                  <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
                    <span className="text-[#718096] text-[8px] block uppercase font-bold">
                      Steer Smoothness
                    </span>
                    <span className="text-[#00D17F] text-base font-bold tabular-nums">
                      {fingerprint.steeringSignature.steeringSmoothnessIndex}%
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="mt-4 p-2 text-center text-[8.5px] font-bold border rounded-sm"
                style={{ borderColor: "#1A202C", backgroundColor: "#131924", color: "#3B82F6" }}
              >
                PRO MOTORSPORT CALIBRATED COGNITIVE SUBSTRATE IN PLACE
              </div>
            </div>
          </div>
        )}

        {activeTab === "corners" && (
          <div
            className="p-4 rounded-sm border"
            style={{ backgroundColor: "#0B0F19", borderColor: "#1A202C" }}
          >
            <div className="pb-2 border-b border-[#1A202C] mb-3 flex items-center justify-between">
              <span className="font-black text-[#3B82F6] tracking-widest text-[9px] uppercase">
                LEARNED TRACK ARCHETYPES — {trackName.toUpperCase()}
              </span>
              <span className="text-[8px] text-[#718096]">SECTOR CLASSIFICATIONS</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[9px]">
                <thead>
                  <tr className="text-[#718096] border-b border-[#1A202C] uppercase">
                    <th className="py-2">Corner</th>
                    <th className="py-2">Apex (km/h)</th>
                    <th className="py-2">Lat Force (G)</th>
                    <th className="py-2">Archetype Class</th>
                    <th className="py-2">Confidence</th>
                    <th className="py-2">Analytical Grounding Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A202C]">
                  {learnedCorners.map((c, idx) => (
                    <tr key={idx} className="hover:bg-[#131924]">
                      <td className="py-2 text-white font-bold">{c.corner}</td>
                      <td className="py-2 tabular-nums">{c.apex.toFixed(1)}</td>
                      <td className="py-2 tabular-nums">{c.latG.toFixed(2)}</td>
                      <td className="py-2 font-bold">
                        <span
                          className="px-1.5 py-0.5 rounded-xs"
                          style={{
                            backgroundColor:
                              c.archetype === "HIGH_SPEED_AERO"
                                ? "rgba(59,130,246,0.15)"
                                : c.archetype === "SLOW_TRACTION"
                                ? "rgba(235,94,85,0.15)"
                                : "rgba(139,92,246,0.15)",
                            color:
                              c.archetype === "HIGH_SPEED_AERO"
                                ? "#3B82F6"
                                : c.archetype === "SLOW_TRACTION"
                                ? "#FF4D4D"
                                : "#8B5CF6",
                          }}
                        >
                          {c.archetype}
                        </span>
                      </td>
                      <td className="py-2 tabular-nums text-white font-bold">{(c.confidence * 100).toFixed(0)}%</td>
                      <td className="py-2 text-[#718096] leading-relaxed">{c.primarySignalReason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "predictive" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Input simulator controls */}
            <div
              className="p-4 rounded-sm border md:col-span-1"
              style={{ backgroundColor: "#0B0F19", borderColor: "#1A202C" }}
            >
              <div className="pb-2 border-b border-[#1A202C] mb-3">
                <span className="font-black text-[#3B82F6] tracking-widest text-[9px] uppercase">
                  TELEMETRY STIMULATOR
                </span>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[#718096] text-[8px] block uppercase font-bold mb-1">
                    Brake Pedal Load: {(currBrake * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={currBrake}
                    onChange={(e) => setCurrBrake(parseFloat(e.target.value))}
                    className="w-full bg-[#1A202C]"
                  />
                </div>

                <div>
                  <label className="text-[#718096] text-[8px] block uppercase font-bold mb-1">
                    Chassis Yaw Rate: {currYaw.toFixed(2)} rad/s
                  </label>
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.01"
                    value={currYaw}
                    onChange={(e) => setCurrYaw(parseFloat(e.target.value))}
                    className="w-full bg-[#1A202C]"
                  />
                </div>

                <div>
                  <label className="text-[#718096] text-[8px] block uppercase font-bold mb-1">
                    Steering Wheel Angle: {currSteer.toFixed(2)} rad
                  </label>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.01"
                    value={currSteer}
                    onChange={(e) => setCurrSteer(parseFloat(e.target.value))}
                    className="w-full bg-[#1A202C]"
                  />
                </div>
              </div>
            </div>

            {/* Prediction engine indicators */}
            <div
              className="p-4 rounded-sm border md:col-span-2 flex flex-col justify-between"
              style={{ backgroundColor: "#0B0F19", borderColor: "#1A202C" }}
            >
              <div>
                <div className="pb-2 border-b border-[#1A202C] mb-3 flex items-center justify-between">
                  <span className="font-black text-[#3B82F6] tracking-widest text-[9px] uppercase">
                    PREDICTIVE COGNITION FEEDBACK
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-sm text-[8px] font-black uppercase"
                    style={{
                      backgroundColor: prediction.isRiskHigh ? "rgba(255,77,77,0.15)" : "rgba(0,209,127,0.15)",
                      color: prediction.isRiskHigh ? "#FF4D4D" : "#00D17F",
                    }}
                  >
                    {prediction.isRiskHigh ? "CRITICAL RISK BREACH" : "STABILITY SECURED"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
                    <span className="text-[#718096] text-[8px] block uppercase font-bold">
                      Stability Break Probability
                    </span>
                    <span
                      className="text-lg font-black tabular-nums"
                      style={{ color: prediction.isRiskHigh ? "#FF4D4D" : "#E2E8F0" }}
                    >
                      {(prediction.instabilityProbability * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
                    <span className="text-[#718096] text-[8px] block uppercase font-bold">
                      Reaction Horizon
                    </span>
                    <span className="text-white text-lg font-bold tabular-nums">
                      {prediction.isRiskHigh ? `${prediction.predictionHorizonSec}s` : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
                  <span className="text-[#718096] text-[8px] block uppercase font-bold mb-1">
                    PRIMARY RISK FACTOR SIGNALS
                  </span>
                  <span className="text-white font-bold block mb-2">{prediction.primaryTriggerFactor}</span>
                  <span className="text-[#E2E8F0] block leading-relaxed">{prediction.recommendedCorrection}</span>
                </div>
              </div>

              <div className="text-[8px] text-[#718096] mt-4 uppercase tracking-widest text-center">
                CHASSIS VECTOR BREAK CALCULATION PROCESS RUNNING AT 60HZ
              </div>
            </div>
          </div>
        )}

        {activeTab === "setup" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className="p-4 rounded-sm border"
              style={{ backgroundColor: "#0B0F19", borderColor: "#1A202C" }}
            >
              <div className="pb-2 border-b border-[#1A202C] mb-3 flex items-center justify-between">
                <span className="font-black text-[#3B82F6] tracking-widest text-[9px] uppercase">
                  SETUP PREDICTION SUCCESS CURVE
                </span>
                <span className="text-[8px] text-[#718096]">REAR REBOUND DAMPING</span>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#718096]">HISTORICAL TRIAL SAMPLES:</span>
                  <span className="text-white font-bold tabular-nums">{reboundConfidence.totalHistoricalEvaluations} stints</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#718096]">CONVERGENCE CONFIDENCE INDEX:</span>
                  <span className="text-[#00D17F] font-black text-base tabular-nums">{reboundConfidence.confidenceRating}%</span>
                </div>
                <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
                  <span className="text-[#718096] text-[8px] block uppercase font-bold mb-1">
                    Historical Outcomes
                  </span>
                  <span className="text-white leading-relaxed">{reboundConfidence.observedImpactDescription}</span>
                </div>
                <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
                  <span className="text-[#718096] text-[8px] block uppercase font-bold mb-1">
                    Delta Step Limit Recommendation
                  </span>
                  <span className="text-white leading-relaxed">{reboundConfidence.recommendedDeltaLimit}</span>
                </div>
              </div>
            </div>

            <div
              className="p-4 rounded-sm border"
              style={{ backgroundColor: "#0B0F19", borderColor: "#1A202C" }}
            >
              <div className="pb-2 border-b border-[#1A202C] mb-3 flex items-center justify-between">
                <span className="font-black text-[#3B82F6] tracking-widest text-[9px] uppercase">
                  SETUP PREDICTION SUCCESS CURVE
                </span>
                <span className="text-[8px] text-[#718096]">REAR ANTI-ROLL BAR</span>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#718096]">HISTORICAL TRIAL SAMPLES:</span>
                  <span className="text-white font-bold tabular-nums">{arbConfidence.totalHistoricalEvaluations} stints</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#718096]">CONVERGENCE CONFIDENCE INDEX:</span>
                  <span className="text-[#3B82F6] font-black text-base tabular-nums">{arbConfidence.confidenceRating}%</span>
                </div>
                <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
                  <span className="text-[#718096] text-[8px] block uppercase font-bold mb-1">
                    Historical Outcomes
                  </span>
                  <span className="text-white leading-relaxed">{arbConfidence.observedImpactDescription}</span>
                </div>
                <div className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm">
                  <span className="text-[#718096] text-[8px] block uppercase font-bold mb-1">
                    Delta Step Limit Recommendation
                  </span>
                  <span className="text-white leading-relaxed">{arbConfidence.recommendedDeltaLimit}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "notebook" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            {/* Note taking input */}
            <div
              className="p-4 rounded-sm border md:col-span-1"
              style={{ backgroundColor: "#0B0F19", borderColor: "#1A202C" }}
            >
              <div className="pb-2 border-b border-[#1A202C] mb-3">
                <span className="font-black text-[#3B82F6] tracking-widest text-[9px] uppercase">
                  ADD STRATEGY LOG
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-[#718096] text-[8px] block uppercase font-bold mb-1">
                    Log/Bookmark Title
                  </label>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Monza Sector 3 Understeer sweep..."
                    className="w-full p-2 bg-[#07090E] border border-[#1A202C] rounded-sm text-[9px] font-mono text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>

                <div>
                  <label className="text-[#718096] text-[8px] block uppercase font-bold mb-1">
                    Engineering Narrative Notes
                  </label>
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Enter chassis deflection, tire growth, damper release feedback..."
                    rows={6}
                    className="w-full p-2 bg-[#07090E] border border-[#1A202C] rounded-sm text-[9px] font-mono text-white focus:outline-none focus:border-[#3B82F6] resize-none"
                  />
                </div>

                <button
                  onClick={addNote}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-sm bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold tracking-wider cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  SAVE NOTEBOOK LOG
                </button>
              </div>
            </div>

            {/* Stint logs list */}
            <div
              className="p-4 rounded-sm border md:col-span-2 flex flex-col"
              style={{ backgroundColor: "#0B0F19", borderColor: "#1A202C" }}
            >
              <div className="pb-2 border-b border-[#1A202C] mb-3 flex items-center justify-between">
                <span className="font-black text-[#3B82F6] tracking-widest text-[9px] uppercase">
                  PERSISTED COGNITIVE NOTEBOOK LOGS
                </span>
                <span className="text-[8px] text-[#718096]">SESSION STRATEGY STACK</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {notesList.map((note, idx) => (
                  <div
                    key={idx}
                    className="p-3 border border-[#1A202C] bg-[#07090E] rounded-sm font-mono text-[9px]"
                  >
                    <div className="flex items-center justify-between mb-1 pb-1 border-b border-[#1A202C]/50">
                      <span className="font-bold text-white uppercase">{note.title}</span>
                      <span className="text-[8px] text-[#718096] tabular-nums">{note.timestamp}</span>
                    </div>
                    <span className="text-[#E2E8F0] leading-relaxed block">{note.content}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
