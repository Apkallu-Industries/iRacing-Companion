/**
 * RuntimeMonitor — Pit Wall Workstation Service Health Panel
 *
 * A compact popover mounted in AppHeader showing the live state of every
 * runtime service. Gives engineers instant operational awareness without
 * needing the system tray or a separate settings page.
 *
 * Rendered only in Electron context (when window.pitWallRuntime exists)
 * and in any browser context as a "degraded info" read-only view.
 */

import { useState, useRef, useEffect } from "react";
import { useRuntimeStatus, type ServiceStatus } from "@/hooks/useRuntimeStatus";
import {
  Wifi,
  Activity,
  Cpu,
  Database,
  Monitor,
  RefreshCw,
  ExternalLink,
  X,
  ChevronDown,
  Brain,
  PlayCircle,
} from "lucide-react";

// ─── Status helpers ──────────────────────────────────────────────────────────

function statusDotColor(status: ServiceStatus): string {
  switch (status) {
    case "active":
      return "#00D17F";
    case "degraded":
      return "#FFB800";
    case "offline":
      return "#FF4D4D";
    case "initializing":
      return "#7A828C";
  }
}

function statusLabel(status: ServiceStatus): string {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "degraded":
      return "DEGRADED";
    case "offline":
      return "OFFLINE";
    case "initializing":
      return "INIT…";
  }
}

// ─── Overall health dot (compact, for the header) ───────────────────────────

function overallStatus(statuses: ServiceStatus[]): ServiceStatus {
  if (statuses.some((s) => s === "initializing")) return "initializing";
  if (statuses.some((s) => s === "offline" || s === "degraded")) return "degraded";
  return "active";
}

// ─── Service Row ─────────────────────────────────────────────────────────────

function MonitorRow({
  label,
  icon: Icon,
  status,
  detail,
  latencyMs,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  status: ServiceStatus;
  detail: string;
  latencyMs?: number;
}) {
  const color = statusDotColor(status);

  return (
    <div
      className="flex items-start gap-2.5 px-3 py-2"
      style={{ borderBottom: "1px solid #1C2430" }}
    >
      <Icon className="h-3 w-3 mt-0.5 shrink-0" style={{ color: "#7A828C" }} />
      <div className="flex flex-col flex-1 min-w-0 gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white">
            {label}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className="size-1.5 rounded-full shrink-0"
              style={{
                backgroundColor: color,
                boxShadow: status === "active" ? `0 0 4px ${color}` : "none",
              }}
            />
            <span className="text-[8px] font-black uppercase tracking-widest" style={{ color }}>
              {statusLabel(status)}
            </span>
            {latencyMs !== undefined && status !== "offline" && (
              <span className="text-[8px] text-[#3D4751] tabular-nums">{latencyMs}ms</span>
            )}
          </div>
        </div>
        <span className="text-[8px] text-[#7A828C] truncate leading-tight">{detail}</span>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function RuntimeMonitor() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const status = useRuntimeStatus();

  const health = overallStatus([status.bridge.status, status.sessionStore.status]);

  const dotColor = statusDotColor(health);
  const isElectron = typeof window !== "undefined" && (window as any).pitWallRuntime !== undefined;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Actions
  const handleRestartBridge = async () => {
    if (isElectron && (window as any).pitWallRuntime?.restartBridge) {
      await (window as any).pitWallRuntime.restartBridge();
    } else {
      window.open("http://localhost:3001", "_blank");
    }
  };

  const handleEnsureMongoDB = async () => {
    if (isElectron && (window as any).pitWallRuntime?.ensureMongoDB) {
      await (window as any).pitWallRuntime.ensureMongoDB();
    }
  };

  const handleRefreshAiMode = async () => {
    if (isElectron && (window as any).pitWallRuntime?.refreshAiMode) {
      await (window as any).pitWallRuntime.refreshAiMode();
    }
  };

  const handleOpenDetached = (type: string) => {
    const url = `${window.location.origin}/detached/${type}`;
    if (isElectron && (window as any).pitWallRuntime?.openInstrumentWindow) {
      (window as any).pitWallRuntime.openInstrumentWindow(type, url);
    } else {
      window.open(url, "_blank", "width=900,height=600");
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      {/* ── Header Trigger ─────────────────────────────────────────────────── */}
      <button
        ref={triggerRef}
        id="runtime-monitor-trigger"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 rounded-sm px-2 py-1 transition-all hover:bg-accent"
        title="Runtime Monitor — click to view workstation service health"
      >
        {/* Pulsing health dot */}
        <span
          className="size-1.5 rounded-full shrink-0"
          style={{
            backgroundColor: dotColor,
            boxShadow:
              health === "active"
                ? `0 0 5px ${dotColor}`
                : health === "degraded"
                  ? `0 0 4px ${dotColor}`
                  : "none",
            animation: health === "initializing" ? "pulse 1.5s infinite" : "none",
          }}
        />
        <span
          className="font-mono text-[9px] uppercase tracking-widest font-bold"
          style={{ color: dotColor }}
        >
          {health === "initializing" ? "INIT" : status.mode === "workstation" ? "WKSTN" : "PRTBL"}
        </span>
        <ChevronDown
          className="h-3 w-3 text-muted-foreground transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>

      {/* ── Popover Panel ──────────────────────────────────────────────────── */}
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full z-50 mt-1.5 overflow-hidden rounded-sm font-mono shadow-2xl"
          style={{
            width: "360px",
            backgroundColor: "#0B0F14",
            border: "1px solid #1C2430",
            boxShadow: "0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px #1C2430",
          }}
        >
          {/* Panel Header */}
          <div
            className="flex items-center justify-between px-3 py-2 shrink-0"
            style={{ borderBottom: "1px solid #1C2430", backgroundColor: "#11161D" }}
          >
            <div className="flex items-center gap-2">
              <Monitor className="h-3 w-3 text-[#3B82F6]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-white">
                RUNTIME MONITOR
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[8px] text-[#7A828C] tabular-nums">
                {(status.elapsedMs / 1000).toFixed(0)}s uptime
              </span>
              <button
                onClick={() => setOpen(false)}
                className="rounded p-0.5 text-[#7A828C] hover:text-white transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Service Rows */}
          <MonitorRow
            label="LOCAL BRIDGE"
            icon={Wifi}
            status={status.bridge.status}
            detail={status.bridge.detail}
            latencyMs={status.bridge.latencyMs}
          />
          <MonitorRow
            label="iRACING SIMULATOR"
            icon={Activity}
            status={status.iracing.status}
            detail={status.iracing.detail}
          />
          <MonitorRow
            label="MONGODB"
            icon={Database}
            status={status.mongoDB.status}
            detail={status.mongoDB.detail}
          />
          <MonitorRow
            label="LOCAL AI"
            icon={Brain}
            status={status.localAi.status}
            detail={status.localAi.detail}
          />
          <MonitorRow
            label="CLOUD AI ENGINE"
            icon={Cpu}
            status={status.aiEngine.status}
            detail={status.aiEngine.detail}
            latencyMs={status.aiEngine.latencyMs}
          />
          <MonitorRow
            label="SESSION STORE"
            icon={Database}
            status={status.sessionStore.status}
            detail={status.sessionStore.detail}
          />
          <MonitorRow
            label="WORKSTATION"
            icon={Monitor}
            status={status.workstation.status}
            detail={status.workstation.detail}
          />

          {/* Actions */}
          <div
            className="px-3 py-2.5 flex flex-col gap-2"
            style={{ borderTop: "1px solid #1C2430", backgroundColor: "#080C10" }}
          >
            {/* Quick launch instrument windows */}
            <div>
              <span className="text-[7.5px] text-[#7A828C] uppercase tracking-widest font-bold block mb-1.5">
                LAUNCH DETACHED MONITOR
              </span>
              <div className="flex flex-wrap gap-1">
                {[
                  { id: "timing", label: "TIMING" },
                  { id: "tires", label: "TIRE WALL" },
                  { id: "hybrid", label: "HYBRID" },
                  { id: "strategy", label: "STRATEGY" },
                ].map((m) => (
                  <button
                    key={m.id}
                    id={`launch-monitor-${m.id}`}
                    onClick={() => handleOpenDetached(m.id)}
                    className="flex items-center gap-1 rounded-sm px-2 py-1 text-[8px] font-bold uppercase tracking-wider transition-colors hover:opacity-80"
                    style={{
                      backgroundColor: "#1C2430",
                      color: "#E2E4E8",
                      border: "1px solid #263241",
                    }}
                  >
                    <ExternalLink className="h-2.5 w-2.5 text-[#7A828C]" />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bridge + MongoDB + AI controls */}
            <div
              className="flex flex-wrap items-center gap-1.5 pt-1"
              style={{ borderTop: "1px solid #1C2430" }}
            >
              <button
                id="runtime-restart-bridge"
                onClick={handleRestartBridge}
                className="flex items-center gap-1.5 rounded-sm px-2 py-1 text-[8px] font-bold uppercase tracking-wider transition-all hover:opacity-80"
                style={{
                  backgroundColor: "#1C2430",
                  color: "#7A828C",
                  border: "1px solid #263241",
                }}
              >
                <RefreshCw className="h-2.5 w-2.5" />
                Bridge
              </button>
              {isElectron && (
                <>
                  <button
                    id="runtime-ensure-mongodb"
                    onClick={handleEnsureMongoDB}
                    className="flex items-center gap-1.5 rounded-sm px-2 py-1 text-[8px] font-bold uppercase tracking-wider transition-all hover:opacity-80"
                    style={{
                      backgroundColor: "#1C2430",
                      color: "#7A828C",
                      border: "1px solid #263241",
                    }}
                  >
                    <PlayCircle className="h-2.5 w-2.5" />
                    Start MongoDB
                  </button>
                  <button
                    id="runtime-refresh-ai"
                    onClick={handleRefreshAiMode}
                    className="flex items-center gap-1.5 rounded-sm px-2 py-1 text-[8px] font-bold uppercase tracking-wider transition-all hover:opacity-80"
                    style={{
                      backgroundColor: "#1C2430",
                      color: "#7A828C",
                      border: "1px solid #263241",
                    }}
                  >
                    <Brain className="h-2.5 w-2.5" />
                    Probe AI
                  </button>
                </>
              )}
              <span className="text-[7.5px] text-[#3D4751] uppercase tracking-widest ml-auto">
                {isElectron ? "ELECTRON RUNTIME" : "BROWSER RUNTIME"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
