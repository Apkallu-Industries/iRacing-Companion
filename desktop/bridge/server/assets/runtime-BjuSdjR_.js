import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { a as useRuntimeStatus } from "./useRuntimeStatus-RFAV9_LD.js";
import { Activity, Wifi, Cpu, Database, Monitor, RefreshCw, ArrowRight, Loader2, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
function statusColor(status) {
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
function statusBg(status) {
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
function statusBorder(status) {
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
function StatusIcon({ status }) {
  const color = statusColor(status);
  const size = "h-3.5 w-3.5";
  if (status === "initializing") return /* @__PURE__ */ jsx(Loader2, { className: `${size} animate-spin`, style: { color } });
  if (status === "active") return /* @__PURE__ */ jsx(CheckCircle, { className: size, style: { color } });
  if (status === "degraded") return /* @__PURE__ */ jsx(AlertTriangle, { className: size, style: { color } });
  return /* @__PURE__ */ jsx(XCircle, { className: size, style: { color } });
}
function ServiceRow({
  icon: Icon,
  name,
  service,
  isLast = false
}) {
  const color = statusColor(service.status);
  const bg = statusBg(service.status);
  const border = statusBorder(service.status);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "flex items-start gap-3 px-4 py-3 font-mono transition-all duration-300",
      style: {
        backgroundColor: bg,
        borderLeft: `2px solid ${color}`,
        borderBottom: isLast ? "none" : "1px solid #1C2430"
      },
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border",
            style: { borderColor: border, backgroundColor: "rgba(0,0,0,0.3)" },
            children: /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5", style: { color } })
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 flex-1 flex-col gap-0.5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold uppercase tracking-[0.18em] text-white", children: name }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 shrink-0", children: [
              /* @__PURE__ */ jsx(StatusIcon, { status: service.status }),
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: "text-[9px] font-black uppercase tracking-widest",
                  style: { color },
                  children: service.label
                }
              ),
              service.latencyMs !== void 0 && service.status !== "offline" && /* @__PURE__ */ jsxs("span", { className: "text-[8px] text-[#7A828C] tabular-nums font-mono", children: [
                service.latencyMs,
                "ms"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-[9px] leading-relaxed text-[#7A828C] truncate", children: service.detail })
        ] })
      ]
    }
  );
}
function useBootLog(status) {
  const [log, setLog] = useState([
    { t: 0, text: "PIT WALL RUNTIME ENVIRONMENT INITIALIZING...", level: "info" },
    { t: 80, text: "Scanning local service registry...", level: "info" }
  ]);
  const appendedRef = useRef(/* @__PURE__ */ new Set());
  const push = (text, level = "info") => {
    if (appendedRef.current.has(text)) return;
    appendedRef.current.add(text);
    setLog((prev) => [...prev.slice(-19), { t: Date.now(), text, level }]);
  };
  useEffect(() => {
    if (status.bridge.status === "active") push("✓ Bridge daemon online — ws://localhost:3001", "ok");
    if (status.bridge.status === "degraded") push("⚠ Bridge responding with elevated latency", "warn");
    if (status.bridge.status === "offline") push("✕ Bridge offline — run local-bridge/server.js", "error");
  }, [status.bridge.status]);
  useEffect(() => {
    if (status.iracing.status === "active") push("✓ iRacing simulator telemetry stream active", "ok");
    if (status.iracing.status === "degraded") push("⚠ Bridge connected — waiting for iRacing launch", "warn");
    if (status.iracing.status === "offline") push("  iRacing not detected (bridge required first)", "info");
  }, [status.iracing.status]);
  useEffect(() => {
    if (status.sessionStore.status === "active") push("✓ Session store initialized — IndexedDB ready", "ok");
    if (status.sessionStore.status === "offline") push("✕ Session store inaccessible — check browser storage permissions", "error");
  }, [status.sessionStore.status]);
  useEffect(() => {
    if (status.aiEngine.status === "active") push("✓ AI engine reachable — cloud LLM online", "ok");
    if (status.aiEngine.status === "offline") push("⚠ AI engine offline — check internet connectivity", "warn");
  }, [status.aiEngine.status]);
  useEffect(() => {
    if (status.mode === "workstation") push("✓ WORKSTATION MODE — local bridge providing telemetry", "ok");
    if (status.mode === "portable") push("  PORTABLE MODE — running without local bridge", "info");
  }, [status.mode]);
  useEffect(() => {
    if (status.ready) push("━━━━ RUNTIME ENVIRONMENT READY ━━━━", "ok");
  }, [status.ready]);
  return log;
}
function RuntimeStatusMatrix({ onReady }) {
  const status = useRuntimeStatus();
  const log = useBootLog(status);
  const logEndRef = useRef(null);
  const [showReadyBanner, setShowReadyBanner] = useState(false);
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);
  useEffect(() => {
    if (status.settled) {
      const t = setTimeout(() => setShowReadyBanner(true), 200);
      return () => clearTimeout(t);
    }
  }, [status.settled]);
  useEffect(() => {
    if (status.ready && status.settled) {
      const t = setTimeout(onReady, 1200);
      return () => clearTimeout(t);
    }
  }, [status.ready, status.settled, onReady]);
  const elapsedSec = (status.elapsedMs / 1e3).toFixed(1);
  const overallStatus = !status.settled ? "initializing" : status.ready ? "active" : [status.bridge, status.iracing].some((s) => s.status === "offline") ? "degraded" : "active";
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "flex h-screen w-screen flex-col overflow-hidden font-mono select-none",
      style: { backgroundColor: "#030508" },
      children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-center justify-between px-6 py-3 shrink-0",
            style: { borderBottom: "1px solid #1C2430", backgroundColor: "#0B0F14" },
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "flex h-7 w-7 items-center justify-center rounded-sm",
                    style: { backgroundColor: "#3B82F6" },
                    children: /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4 text-white" })
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[11px] font-black uppercase tracking-[0.25em] text-white", children: "PIT WALL WORKSTATION" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[8px] uppercase tracking-widest text-[#7A828C]", children: "RUNTIME ENVIRONMENT MATRIX" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsxs("span", { className: "text-[9px] text-[#7A828C] tabular-nums", children: [
                  "T+",
                  elapsedSec,
                  "s"
                ] }),
                /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: "flex items-center gap-1.5 rounded-sm px-2 py-1 text-[9px] font-bold uppercase tracking-widest",
                    style: {
                      color: statusColor(overallStatus),
                      backgroundColor: statusBg(overallStatus),
                      border: `1px solid ${statusBorder(overallStatus)}`
                    },
                    children: [
                      /* @__PURE__ */ jsx(StatusIcon, { status: overallStatus }),
                      overallStatus === "initializing" ? "POWERING UP" : status.mode.toUpperCase() + " MODE"
                    ]
                  }
                )
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-1 min-h-0 gap-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col border-r border-[#1C2430]", style: { width: "55%" }, children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "px-4 py-2 text-[8px] font-bold uppercase tracking-[0.3em] text-[#7A828C] shrink-0",
                style: { borderBottom: "1px solid #1C2430", backgroundColor: "#0B0F14" },
                children: "SERVICE STATUS MATRIX"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col flex-1", children: [
              /* @__PURE__ */ jsx(
                ServiceRow,
                {
                  icon: Wifi,
                  name: "LOCAL BRIDGE",
                  service: status.bridge
                }
              ),
              /* @__PURE__ */ jsx(
                ServiceRow,
                {
                  icon: Activity,
                  name: "iRACING SIMULATOR",
                  service: status.iracing
                }
              ),
              /* @__PURE__ */ jsx(
                ServiceRow,
                {
                  icon: Cpu,
                  name: "AI ENGINE",
                  service: status.aiEngine
                }
              ),
              /* @__PURE__ */ jsx(
                ServiceRow,
                {
                  icon: Database,
                  name: "SESSION STORE",
                  service: status.sessionStore
                }
              ),
              /* @__PURE__ */ jsx(
                ServiceRow,
                {
                  icon: Monitor,
                  name: "WORKSTATION RUNTIME",
                  service: status.workstation,
                  isLast: true
                }
              )
            ] }),
            /* @__PURE__ */ jsxs(
              "div",
              {
                className: "px-4 py-3 shrink-0 flex items-center justify-between",
                style: { borderTop: "1px solid #1C2430", backgroundColor: "#0B0F14" },
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-0.5", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-[8px] uppercase tracking-widest text-[#7A828C]", children: "DEPLOYMENT MODE" }),
                    /* @__PURE__ */ jsx("span", { className: "text-[11px] font-black uppercase tracking-wider text-white", children: status.mode === "workstation" ? "WORKSTATION — Local Bridge Active" : status.mode === "portable" ? "PORTABLE — Browser / Cloud Mode" : "DETECTING…" })
                  ] }),
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => window.location.reload(),
                      className: "flex items-center gap-1.5 rounded-sm px-2 py-1 text-[8px] font-bold uppercase tracking-widest text-[#7A828C] hover:text-white transition-colors",
                      style: { border: "1px solid #1C2430" },
                      children: [
                        /* @__PURE__ */ jsx(RefreshCw, { className: "h-3 w-3" }),
                        "Re-probe"
                      ]
                    }
                  )
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "px-4 py-2 text-[8px] font-bold uppercase tracking-[0.3em] text-[#7A828C] shrink-0",
                style: { borderBottom: "1px solid #1C2430", backgroundColor: "#0B0F14" },
                children: "RUNTIME LOG"
              }
            ),
            /* @__PURE__ */ jsxs(
              "div",
              {
                className: "flex-1 overflow-y-auto px-4 py-3 space-y-0.5",
                style: { backgroundColor: "#030508" },
                children: [
                  log.map((entry, i) => {
                    const color = entry.level === "ok" ? "#00D17F" : entry.level === "warn" ? "#FFB800" : entry.level === "error" ? "#FF4D4D" : "#7A828C";
                    return /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 text-[9px]", children: [
                      /* @__PURE__ */ jsx("span", { className: "shrink-0 tabular-nums text-[#3D4751] text-[8px]", children: String(i).padStart(3, "0") }),
                      /* @__PURE__ */ jsx("span", { style: { color }, className: "leading-relaxed", children: entry.text })
                    ] }, i);
                  }),
                  /* @__PURE__ */ jsx("div", { ref: logEndRef })
                ]
              }
            ),
            !status.settled && /* @__PURE__ */ jsx("div", { className: "px-4 py-2 shrink-0", style: { borderTop: "1px solid #1C2430" }, children: /* @__PURE__ */ jsx("span", { className: "text-[9px] text-[#3B82F6] animate-pulse", children: "▌" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "shrink-0 flex items-center justify-between px-6 py-3",
            style: {
              borderTop: "1px solid #1C2430",
              backgroundColor: showReadyBanner ? "rgba(0,209,127,0.05)" : "#0B0F14",
              transition: "background-color 0.4s ease"
            },
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-0.5", children: [
                showReadyBanner ? /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black uppercase tracking-[0.2em] text-[#00D17F]", children: "✓ RUNTIME ENVIRONMENT READY — LAUNCHING WORKBENCH" }) : /* @__PURE__ */ jsx("span", { className: "text-[9px] text-[#7A828C] uppercase tracking-widest", children: "PROBING SERVICES…" }),
                /* @__PURE__ */ jsx("span", { className: "text-[8px] text-[#3D4751]", children: status.mode === "workstation" ? "Full workstation mode — local telemetry bridge active" : "Portable mode — analysis tools available without live telemetry" })
              ] }),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  id: "runtime-enter-workbench",
                  onClick: onReady,
                  className: "flex items-center gap-2 rounded-sm px-4 py-2 text-[9px] font-bold uppercase tracking-widest transition-all hover:opacity-80 active:scale-95",
                  style: {
                    backgroundColor: showReadyBanner ? "#00D17F" : "#1C2430",
                    color: showReadyBanner ? "#030508" : "#7A828C"
                  },
                  children: [
                    showReadyBanner ? "ENTER WORKBENCH" : "SKIP",
                    /* @__PURE__ */ jsx(ArrowRight, { className: "h-3.5 w-3.5" })
                  ]
                }
              )
            ]
          }
        )
      ]
    }
  );
}
function RuntimePage() {
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const isElectron = typeof window !== "undefined" && window.navigator.userAgent.toLowerCase().includes("electron");
  useEffect(() => {
    if (isMounted && !isElectron) {
      navigate({
        to: "/",
        replace: true
      });
    }
  }, [isMounted, isElectron, navigate]);
  if (!isMounted) {
    return /* @__PURE__ */ jsx("div", { className: "flex h-screen w-screen items-center justify-center font-mono text-[10px] text-[#7A828C] select-none", style: {
      backgroundColor: "#030508"
    }, children: /* @__PURE__ */ jsx("span", { className: "animate-pulse", children: "INITIALIZING…" }) });
  }
  if (!isElectron) {
    return /* @__PURE__ */ jsx("div", { className: "flex h-screen w-screen items-center justify-center font-mono text-[10px] text-[#7A828C] select-none", style: {
      backgroundColor: "#030508"
    }, children: /* @__PURE__ */ jsx("span", { className: "animate-pulse", children: "REDIRECTING…" }) });
  }
  const handleReady = () => {
    navigate({
      to: "/",
      replace: true
    });
  };
  return /* @__PURE__ */ jsx(RuntimeStatusMatrix, { onReady: handleReady });
}
export {
  RuntimePage as component
};
