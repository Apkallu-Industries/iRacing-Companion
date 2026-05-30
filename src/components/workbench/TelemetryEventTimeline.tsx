import React, { useEffect } from "react";
import { useTelemetryRuntimeStore, type TelemetryEvent } from "@/lib/telemetryRuntimeStore";
import { AlertTriangle, Zap, Activity, Shield, CheckCircle2, Trash } from "lucide-react";

export function TelemetryEventTimeline() {
  const { events, activeEvent, triggerEvent, addEvent } = useTelemetryRuntimeStore();

  // Only seed mock events when simulator allowance is enabled. In force-live mode we never seed.
  useEffect(() => {
    try {
      if (events.length === 0 && window && window.localStorage && window.localStorage.getItem("pitwall:allow_simulator") === "1") {
        addEvent({
          timestampSec: 12.5,
          label: "REAR LOCKUP DETECTED",
          category: "thermal",
          severity: "critical",
          description: "Rear axle slip exceeding 18% under heavy threshold braking at Turn 8 entry. Shift bias forward.",
          associatedChannels: ["Brake", "LFbrakeLinePress", "LRbrakeTemp"],
          cornerNumber: 8,
        });
        addEvent({
          timestampSec: 28.4,
          label: "ERS DEPLOYMENT SATURATION",
          category: "hybrid",
          severity: "warning",
          description: "MGU-K deploy saturated at 120kW for 5.2s. Potential state-of-charge exhaustion at back straight.",
          associatedChannels: ["EnergyStorePct", "MgukDeploykW"],
          cornerNumber: 11,
        });
        addEvent({
          timestampSec: 42.1,
          label: "THROTTLE INSTABILITY AT CORNER EXIT",
          category: "inputs",
          severity: "info",
          description: "Rapid throttle micro-pumping detected at Turn 3 exit. Steer smoothness rating dropped to 72%.",
          associatedChannels: ["Throttle", "SteeringWheelAngle"],
          cornerNumber: 3,
        });
        addEvent({
          timestampSec: 68.9,
          label: "CHASSIS REB COMPRESSION GROUNDING",
          category: "dynamics",
          severity: "warning",
          description: "Nose pitch rotation exceeding -1.8 deg. Splitter grounding threat detected under heavy heave load.",
          associatedChannels: ["LongAccel", "LatAccel", "pitch"],
          cornerNumber: 5,
        });
      }
    } catch (e) {
      // ignore
    }
  }, [events.length, addEvent]);

  const getCategoryIcon = (category: TelemetryEvent["category"]) => {
    switch (category) {
      case "thermal": return <AlertTriangle className="h-3.5 w-3.5 text-[#FF4D4D]" />;
      case "hybrid": return <Zap className="h-3.5 w-3.5 text-[#8B5CF6]" />;
      case "inputs": return <Activity className="h-3.5 w-3.5 text-[#00D17F]" />;
      case "dynamics": return <Shield className="h-3.5 w-3.5 text-[#3B82F6]" />;
    }
  };

  const getClassificationBadge = (event: TelemetryEvent) => {
    let text = "DIAGNOSTIC";
    let color = "text-[#7A828C] border-[#7A828C]/30 bg-[#7A828C]/10";
    
    if (event.category === "thermal") {
      text = "STABILITY";
      color = "text-[#FF4D4D] border-[#FF4D4D]/30 bg-[#FF4D4D]/10";
    } else if (event.category === "hybrid") {
      text = "HYBRID CORE";
      color = "text-[#8B5CF6] border-[#8B5CF6]/30 bg-[#8B5CF6]/10";
    } else if (event.category === "inputs") {
      text = "PERFORMANCE";
      color = "text-[#00D17F] border-[#00D17F]/30 bg-[#00D17F]/10";
    } else if (event.category === "dynamics") {
      text = "AERO PLATFORM";
      color = "text-[#3B82F6] border-[#3B82F6]/30 bg-[#3B82F6]/10";
    }
    
    return (
      <span className={`text-[7px] font-black tracking-widest px-1 py-0.5 border rounded-xs uppercase ${color}`}>
        {text}
      </span>
    );
  };

  const getSeverityStyles = (severity: TelemetryEvent["severity"]) => {
    switch (severity) {
      case "critical": return "border-l-2 border-l-[#FF4D4D] bg-[#FF4D4D]/5";
      case "warning": return "border-l-2 border-l-[#FFB800] bg-[#FFB800]/5";
      case "info": return "border-l-2 border-l-[#3B82F6] bg-[#3B82F6]/5";
    }
  };

  return (
    <div className="h-full flex flex-col font-mono text-xs bg-[#0B0F14] text-white border-t border-[#1C2430]">
      <div className="px-3 py-1.5 border-b border-[#1C2430] bg-[#11161D] flex items-center justify-between shrink-0 select-none">
        <span className="font-bold text-[9px] uppercase tracking-[0.25em] text-[#7A828C]">
          TACTICAL EVENT TIMELINE
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (events.length === 0) return;
              if (confirm("Clear all timeline events? This cannot be undone.")) {
                const { clearEvents } = useTelemetryRuntimeStore.getState();
                clearEvents();
              }
            }}
            title="Clear all events"
            className="text-[9px] px-2 py-1 bg-[#11161D]/60 border border-[#1C2430] rounded text-[#FFB800] hover:bg-[#11161D]"
          >
            Clear All
          </button>
          <span className="text-[7.5px] text-[#00D17F] font-black tracking-widest bg-[#00D17F]/10 px-1.5 py-0.5 border border-[#00D17F]/30 rounded">
            ANOMALY SCANNERS LIVE
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5 bg-[#05070A]">
        {events.map((event) => {
          const isActive = activeEvent?.id === event.id;
          return (
            <div
              key={event.id}
              onClick={() => triggerEvent(event)}
              className={`p-2 rounded-xs border transition-all duration-200 cursor-pointer ${getSeverityStyles(event.severity)} ${
                isActive
                  ? "border-[#FFB800] shadow-[0_0_10px_rgba(255,184,0,0.15)] scale-[1.005]"
                  : "border-[#1C2430] bg-[#0B0F14]/60 hover:border-[#263241] hover:bg-[#0B0F14]"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5">
                  {getCategoryIcon(event.category)}
                  <span className="font-black text-[9px] uppercase tracking-wider text-white">
                    {event.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {event.metadata?.confidence !== undefined && (
                    <span className="text-[7.5px] text-[#00D17F] font-black border border-[#00D17F]/30 bg-[#00D17F]/10 px-1 py-0.5 rounded-xs tabular-nums" title="Scanner Signal Certainty Score">
                      {(event.metadata.confidence * 100).toFixed(0)}% CERT
                    </span>
                  )}
                  {getClassificationBadge(event)}
                  <span className="text-[8px] text-[#7A828C] font-bold tabular-nums">
                    t = {event.timestampSec.toFixed(2)}s {event.cornerNumber ? `· T${event.cornerNumber}` : ""}
                  </span>
                  {/* Delete single event button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!confirm(`Delete event: ${event.label}?`)) return;
                      const { deleteEvent } = useTelemetryRuntimeStore.getState();
                      deleteEvent(event.id);
                    }}
                    title="Delete event"
                    className="ml-2 text-[#FF4D4D] hover:text-white"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-[8.5px] leading-relaxed text-[#7A828C] select-text">
                {event.description}
              </p>

              <div className="mt-1.5 pt-1 border-t border-[#1C2430]/40 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {event.associatedChannels.map((ch) => (
                    <span
                      key={ch}
                      className="text-[7.5px] px-1 py-0.5 bg-[#05070A] border border-[#1C2430] text-[#3B82F6] rounded-xs font-bold"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
                <span className={`text-[7px] font-black uppercase tracking-widest px-1 py-0.5 border rounded-xs ${
                  event.severity === "critical"
                    ? "text-[#FF4D4D] border-[#FF4D4D]/20 bg-[#FF4D4D]/5"
                    : event.severity === "warning"
                      ? "text-[#FFB800] border-[#FFB800]/20 bg-[#FFB800]/5"
                      : "text-[#3B82F6] border-[#3B82F6]/20 bg-[#3B82F6]/5"
                }`}>
                  {event.severity}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
