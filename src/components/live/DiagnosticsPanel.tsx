import type { BridgeDiagnostics } from "@/lib/bridgeDiagnostics";

interface DiagnosticsPanelProps {
  diagnostics: BridgeDiagnostics;
}

export function DiagnosticsPanel({ diagnostics }: DiagnosticsPanelProps) {
  const fpsStatus = getFpsStatus(diagnostics.clientFps);
  const streamStatus = getStreamStatus(diagnostics.streamHzActual, diagnostics.streamHzTarget);
  const overallHealth = [fpsStatus, streamStatus].every((s) => s === "good")
    ? "good"
    : [fpsStatus, streamStatus].some((s) => s === "critical")
      ? "critical"
      : "warning";

  const statusColor = {
    good: "text-emerald-500",
    warning: "text-amber-500",
    critical: "text-rose-500",
  }[overallHealth];

  const statusDot = {
    good: "bg-emerald-500",
    warning: "bg-amber-500",
    critical: "bg-rose-500",
  }[overallHealth];

  return (
    <div
      className={`fixed bottom-4 right-4 bg-background border border-border-strong rounded font-mono text-[11px] select-text ${statusColor}`}
      style={{ width: "180px" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-2 py-1 border-b border-border-strong bg-panel-2">
        <div className={`w-2 h-2 rounded-full ${statusDot}`} />
        <span className="uppercase tracking-wider text-muted-foreground">Diagnostics</span>
      </div>

      {/* Content */}
      <div className="space-y-0.5 p-2">
        <MetricRow label="FPS" value={diagnostics.clientFps} unit="/ 60" status={fpsStatus} />
        <MetricRow
          label="Stream"
          value={`${diagnostics.streamHzActual.toFixed(1)} / ${diagnostics.streamHzTarget}`}
          unit="Hz"
          status={streamStatus}
        />
        <div className="text-muted-foreground text-[10px] mt-1 pt-1 border-t border-border-strong">
          <div className="flex justify-between">
            <span>Status</span>
            <span className="text-foreground">{diagnostics.connectionStatus}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricRowProps {
  label: string;
  value: number | string;
  unit?: string;
  status?: "good" | "warning" | "critical";
}

function MetricRow({ label, value, unit, status }: MetricRowProps) {
  const statusColor = {
    good: "text-emerald-400",
    warning: "text-amber-400",
    critical: "text-rose-400",
    undefined: "text-foreground",
  }[status ?? "undefined"];

  return (
    <div className="flex items-baseline justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={statusColor}>
        {typeof value === "string" ? value : Math.round(value as number)}
        <span className="text-[9px] text-muted-foreground ml-0.5">{unit}</span>
      </span>
    </div>
  );
}

function getFpsStatus(fps: number): "good" | "warning" | "critical" {
  if (fps >= 55) return "good";
  if (fps >= 45) return "warning";
  return "critical";
}

function getStreamStatus(actual: number, target: number): "good" | "warning" | "critical" {
  const diff = Math.abs(actual - target);
  if (diff <= 1) return "good";
  if (diff <= 2) return "warning";
  return "critical";
}
