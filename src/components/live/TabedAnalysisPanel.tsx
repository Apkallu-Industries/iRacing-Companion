import { useState } from "react";
import type { Sample } from "@/lib/useTelemetryBuffer";
import { HistogramWidget } from "./HistogramWidget";
import { ScatterWidget } from "./ScatterWidget";
import { LapMetricsTable } from "./LapMetricsTable";

interface TabedAnalysisPanelProps {
  samples: Sample[];
  ggScatterComponent: React.ReactNode;
}

type TabId = "dashboard" | "gg" | "histogram" | "scatter" | "metrics";

export function TabedAnalysisPanel({ samples, ggScatterComponent }: TabedAnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  const tabs: { id: TabId; label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "gg", label: "G-G" },
    { id: "histogram", label: "Histogram" },
    { id: "scatter", label: "Scatter" },
    { id: "metrics", label: "Metrics" },
  ];

  return (
    <div className="flex flex-col h-full bg-background border border-border-strong rounded overflow-hidden">
      {/* Tabs */}
      <div className="flex gap-0 border-b border-border-strong bg-panel-2 flex-shrink-0 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold border-b-2 transition-colors ${
              activeTab === tab.id
                ? "text-cyan-300 border-cyan-400 font-black bg-accent/20"
                : "text-muted-foreground border-transparent hover:text-foreground hover:bg-accent/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === "dashboard" && (
          <div className="w-full h-full flex flex-col gap-2 overflow-y-auto p-2 bg-[#05070A] scrollbar-thin">
            <div className="flex-shrink-0 bg-[#0B0F14] border border-[#1C2430] rounded p-1">
              <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#8B5CF6] mb-1 px-1">
                G-G Acceleration Vector
              </div>
              <div className="h-[240px]">
                {ggScatterComponent}
              </div>
            </div>
            <div className="flex-shrink-0 bg-[#0B0F14] border border-[#1C2430] rounded p-1">
              <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#8B5CF6] mb-1 px-1">
                Live Throttle / Brake Scatter
              </div>
              <div className="h-[240px]">
                <ScatterWidget samples={samples} xChannelKey="throttle" yChannelKey="brake" />
              </div>
            </div>
            <div className="flex-shrink-0 bg-[#0B0F14] border border-[#1C2430] rounded p-1">
              <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#8B5CF6] mb-1 px-1">
                Live Throttle Input Distribution
              </div>
              <div className="h-[240px]">
                <HistogramWidget samples={samples} selectedChannelKey="throttle" />
              </div>
            </div>
          </div>
        )}
        {activeTab === "gg" && <div className="w-full h-full">{ggScatterComponent}</div>}
        {activeTab === "histogram" && (
          <HistogramWidget samples={samples} selectedChannelKey="throttle" />
        )}
        {activeTab === "scatter" && (
          <ScatterWidget samples={samples} xChannelKey="throttle" yChannelKey="brake" />
        )}
        {activeTab === "metrics" && <LapMetricsTable samples={samples} />}
      </div>
    </div>
  );
}
