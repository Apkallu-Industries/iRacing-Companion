/**
 * RuntimeStatusMatrix — Pit Wall Workstation Boot Sequence
 *
 * The first thing an engineer sees when launching the desktop app.
 * Renders a professional "Runtime Environment Powering Up" splash
 * with per-service status rows, a raw log panel, and a "RUNTIME READY"
 * confirmation that transitions into the main workbench.
 *
 * Design principles:
 * - Monospace, dark, dense — matches the visual identity of the workbench
 * - No decorative animations — only functional state transitions
 * - Color is strictly semantic: green=active, amber=degraded, red=offline
 * - Auto-advances after 8s regardless of service state
 */

import { useEffect, useRef, useState } from "react";
import { useRuntimeStatus, type ServiceState, type ServiceStatus } from "@/hooks/useRuntimeStatus";
import {
  Activity,
  Wifi,
  Database,
  Cpu,
  Monitor,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

interface RuntimeStatusMatrixProps {
  /** Called when the user dismisses or the auto-advance timer fires */
  onReady: () => void;
}

// ─── Status styling helpers ──────────────────────────────────────────────────

function statusColor(status: ServiceStatus): string {
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

function statusBg(status: ServiceStatus): string {
  switch (status) {
    case "active":
      return "rgba(0,209,127,0.06)";
    case "degraded":
      return "rgba(255,184,0,0.06)";
    case "offline":
      return "rgba(255,77,77,0.06)";
    case "initializing":
      return "rgba(122,130,140,0.04)";
  }
}

function statusBorder(status: ServiceStatus): string {
  switch (status) {
    case "active":
      return "rgba(0,209,127,0.15)";
    case "degraded":
      return "rgba(255,184,0,0.15)";
    case "offline":
      return "rgba(255,77,77,0.15)";
    case "initializing":
      return "#1C2430";
  }
}

function StatusIcon({ status }: { status: ServiceStatus }) {
  const color = statusColor(status);
  const size = "h-3.5 w-3.5";
  if (status === "initializing")
    return <Loader2 className={`${size} animate-spin`} style={{ color }} />;
  if (status === "active") return <CheckCircle className={size} style={{ color }} />;
  if (status === "degraded") return <AlertTriangle className={size} style={{ color }} />;
  return <XCircle className={size} style={{ color }} />;
}

// ─── Service Row ─────────────────────────────────────────────────────────────

function ServiceRow({
  icon: Icon,
  name,
  service,
  isLast = false,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  name: string;
  service: ServiceState;
  isLast?: boolean;
}) {
  const color = statusColor(service.status);
  const bg = statusBg(service.status);
  const border = statusBorder(service.status);

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 font-mono transition-all duration-300"
      style={{
        backgroundColor: bg,
        borderLeft: `2px solid ${color}`,
        borderBottom: isLast ? "none" : "1px solid #1C2430",
      }}
    >
      {/* Service Icon */}
      <div
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border"
        style={{ borderColor: border, backgroundColor: "rgba(0,0,0,0.3)" }}
      >
        <Icon className="h-3.5 w-3.5" style={{ color }} />
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white">
            {name}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <StatusIcon status={service.status} />
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color }}>
              {service.label}
            </span>
            {service.latencyMs !== undefined && service.status !== "offline" && (
              <span className="text-[8px] text-[#7A828C] tabular-nums font-mono">
                {service.latencyMs}ms
              </span>
            )}
          </div>
        </div>
        <span className="text-[9px] leading-relaxed text-[#7A828C] truncate">{service.detail}</span>
      </div>
    </div>
  );
}

// ─── Boot Log ────────────────────────────────────────────────────────────────

interface LogEntry {
  t: number;
  text: string;
  level: "info" | "warn" | "ok" | "error";
}

function useBootLog(status: ReturnType<typeof useRuntimeStatus>): LogEntry[] {
  const [log, setLog] = useState<LogEntry[]>([
    { t: 0, text: "PIT WALL RUNTIME ENVIRONMENT INITIALIZING...", level: "info" },
    { t: 80, text: "Scanning local service registry...", level: "info" },
  ]);
  const appendedRef = useRef<Set<string>>(new Set());

  const push = (text: string, level: LogEntry["level"] = "info") => {
    if (appendedRef.current.has(text)) return;
    appendedRef.current.add(text);
    setLog((prev) => [...prev.slice(-19), { t: Date.now(), text, level }]);
  };

  useEffect(() => {
    if (status.bridge.status === "active")
      push("✓ Bridge daemon online — ws://localhost:3001", "ok");
    if (status.bridge.status === "degraded")
      push("⚠ Bridge responding with elevated latency", "warn");
    if (status.bridge.status === "offline")
      push("✕ Bridge offline — run local-bridge/server.js", "error");
  }, [status.bridge.status]);

  useEffect(() => {
    if (status.iracing.status === "active")
      push("✓ iRacing simulator telemetry stream active", "ok");
    if (status.iracing.status === "degraded")
      push("⚠ Bridge connected — waiting for iRacing launch", "warn");
    if (status.iracing.status === "offline")
      push("  iRacing not detected (bridge required first)", "info");
  }, [status.iracing.status]);

  useEffect(() => {
    if (status.sessionStore.status === "active")
      push("✓ Session store initialized — IndexedDB ready", "ok");
    if (status.sessionStore.status === "offline")
      push("✕ Session store inaccessible — check browser storage permissions", "error");
  }, [status.sessionStore.status]);

  useEffect(() => {
    if (status.aiEngine.status === "active") push("✓ AI engine reachable — cloud LLM online", "ok");
    if (status.aiEngine.status === "offline")
      push("⚠ AI engine offline — check internet connectivity", "warn");
  }, [status.aiEngine.status]);

  useEffect(() => {
    if (status.mode === "workstation")
      push("✓ WORKSTATION MODE — local bridge providing telemetry", "ok");
    if (status.mode === "portable") push("  PORTABLE MODE — running without local bridge", "info");
  }, [status.mode]);

  useEffect(() => {
    if (status.ready) push("━━━━ RUNTIME ENVIRONMENT READY ━━━━", "ok");
  }, [status.ready]);

  return log;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function RuntimeStatusMatrix({ onReady }: RuntimeStatusMatrixProps) {
  const status = useRuntimeStatus();
  const log = useBootLog(status);
  const logEndRef = useRef<HTMLDivElement>(null);
  const [showReadyBanner, setShowReadyBanner] = useState(false);

  // Auto-scroll log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  // Show "READY" banner once settled
  useEffect(() => {
    if (status.settled) {
      const t = setTimeout(() => setShowReadyBanner(true), 200);
      return () => clearTimeout(t);
    }
  }, [status.settled]);

  // Auto-advance once ready
  useEffect(() => {
    if (status.ready && status.settled) {
      const t = setTimeout(onReady, 1200); // Brief dwell so user can read
      return () => clearTimeout(t);
    }
  }, [status.ready, status.settled, onReady]);

  const elapsedSec = (status.elapsedMs / 1000).toFixed(1);
  const overallStatus: ServiceStatus = !status.settled
    ? "initializing"
    : status.ready
      ? "active"
      : [status.bridge, status.iracing].some((s) => s.status === "offline")
        ? "degraded"
        : "active";

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden font-mono select-none"
      style={{ backgroundColor: "#030508" }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-6 py-3 shrink-0"
        style={{ borderBottom: "1px solid #1C2430", backgroundColor: "#0B0F14" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-sm"
            style={{ backgroundColor: "#3B82F6" }}
          >
            <Activity className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-white">
              PIT WALL WORKSTATION
            </span>
            <span className="text-[8px] uppercase tracking-widest text-[#7A828C]">
              RUNTIME ENVIRONMENT MATRIX
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[9px] text-[#7A828C] tabular-nums">T+{elapsedSec}s</span>
          <div
            className="flex items-center gap-1.5 rounded-sm px-2 py-1 text-[9px] font-bold uppercase tracking-widest"
            style={{
              color: statusColor(overallStatus),
              backgroundColor: statusBg(overallStatus),
              border: `1px solid ${statusBorder(overallStatus)}`,
            }}
          >
            <StatusIcon status={overallStatus} />
            {overallStatus === "initializing" ? "POWERING UP" : status.mode.toUpperCase() + " MODE"}
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 gap-0">
        {/* Left: Service Matrix */}
        <div className="flex flex-col border-r border-[#1C2430]" style={{ width: "55%" }}>
          {/* Section header */}
          <div
            className="px-4 py-2 text-[8px] font-bold uppercase tracking-[0.3em] text-[#7A828C] shrink-0"
            style={{ borderBottom: "1px solid #1C2430", backgroundColor: "#0B0F14" }}
          >
            SERVICE STATUS MATRIX
          </div>

          {/* Service rows */}
          <div className="flex flex-col flex-1">
            <ServiceRow icon={Wifi} name="LOCAL BRIDGE" service={status.bridge} />
            <ServiceRow icon={Activity} name="iRACING SIMULATOR" service={status.iracing} />
            <ServiceRow icon={Cpu} name="AI ENGINE" service={status.aiEngine} />
            <ServiceRow icon={Database} name="SESSION STORE" service={status.sessionStore} />
            <ServiceRow
              icon={Monitor}
              name="WORKSTATION RUNTIME"
              service={status.workstation}
              isLast
            />
          </div>

          {/* Mode indicator */}
          <div
            className="px-4 py-3 shrink-0 flex items-center justify-between"
            style={{ borderTop: "1px solid #1C2430", backgroundColor: "#0B0F14" }}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-[8px] uppercase tracking-widest text-[#7A828C]">
                DEPLOYMENT MODE
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-white">
                {status.mode === "workstation"
                  ? "WORKSTATION — Local Bridge Active"
                  : status.mode === "portable"
                    ? "PORTABLE — Browser / Cloud Mode"
                    : "DETECTING…"}
              </span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-1.5 rounded-sm px-2 py-1 text-[8px] font-bold uppercase tracking-widest text-[#7A828C] hover:text-white transition-colors"
              style={{ border: "1px solid #1C2430" }}
            >
              <RefreshCw className="h-3 w-3" />
              Re-probe
            </button>
          </div>
        </div>

        {/* Right: Boot log */}
        <div className="flex flex-col flex-1 min-w-0">
          <div
            className="px-4 py-2 text-[8px] font-bold uppercase tracking-[0.3em] text-[#7A828C] shrink-0"
            style={{ borderBottom: "1px solid #1C2430", backgroundColor: "#0B0F14" }}
          >
            RUNTIME LOG
          </div>

          <div
            className="flex-1 overflow-y-auto px-4 py-3 space-y-0.5"
            style={{ backgroundColor: "#030508" }}
          >
            {log.map((entry, i) => {
              const color =
                entry.level === "ok"
                  ? "#00D17F"
                  : entry.level === "warn"
                    ? "#FFB800"
                    : entry.level === "error"
                      ? "#FF4D4D"
                      : "#7A828C";
              return (
                <div key={i} className="flex items-start gap-2 text-[9px]">
                  <span className="shrink-0 tabular-nums text-[#3D4751] text-[8px]">
                    {String(i).padStart(3, "0")}
                  </span>
                  <span style={{ color }} className="leading-relaxed">
                    {entry.text}
                  </span>
                </div>
              );
            })}
            <div ref={logEndRef} />
          </div>

          {/* Cursor blink */}
          {!status.settled && (
            <div className="px-4 py-2 shrink-0" style={{ borderTop: "1px solid #1C2430" }}>
              <span className="text-[9px] text-[#3B82F6] animate-pulse">▌</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Ready Banner ────────────────────────────────────────────────────── */}
      <div
        className="shrink-0 flex items-center justify-between px-6 py-3"
        style={{
          borderTop: "1px solid #1C2430",
          backgroundColor: showReadyBanner ? "rgba(0,209,127,0.05)" : "#0B0F14",
          transition: "background-color 0.4s ease",
        }}
      >
        <div className="flex flex-col gap-0.5">
          {showReadyBanner ? (
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00D17F]">
              ✓ RUNTIME ENVIRONMENT READY — LAUNCHING WORKBENCH
            </span>
          ) : (
            <span className="text-[9px] text-[#7A828C] uppercase tracking-widest">
              PROBING SERVICES…
            </span>
          )}
          <span className="text-[8px] text-[#3D4751]">
            {status.mode === "workstation"
              ? "Full workstation mode — local telemetry bridge active"
              : "Portable mode — analysis tools available without live telemetry"}
          </span>
        </div>

        <button
          id="runtime-enter-workbench"
          onClick={onReady}
          className="flex items-center gap-2 rounded-sm px-4 py-2 text-[9px] font-bold uppercase tracking-widest transition-all hover:opacity-80 active:scale-95"
          style={{
            backgroundColor: showReadyBanner ? "#00D17F" : "#1C2430",
            color: showReadyBanner ? "#030508" : "#7A828C",
          }}
        >
          {showReadyBanner ? "ENTER WORKBENCH" : "SKIP"}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
