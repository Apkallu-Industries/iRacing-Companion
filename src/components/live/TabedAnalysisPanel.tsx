import { useState } from "react";
import type { Sample } from "@/lib/useTelemetryBuffer";
import { HistogramWidget } from "./HistogramWidget";
import { ScatterWidget } from "./ScatterWidget";
import { LapMetricsTable } from "./LapMetricsTable";

interface TabedAnalysisPanelProps {
  samples: Sample[];
  ggScatterComponent: React.ReactNode;
}

type TabId = "gg" | "histogram" | "scatter" | "metrics";

export function TabedAnalysisPanel({ samples, ggScatterComponent }: TabedAnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("gg");

  const tabs: { id: TabId; label: string }[] = [
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
            className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "text-cyan-300 border-cyan-400"
                : "text-muted-foreground border-transparent hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
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
