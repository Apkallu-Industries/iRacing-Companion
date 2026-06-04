import { d as i, j as e } from "./react-core-hSJfnumv.js";
import { U as b } from "./index-BF1LFLDu.js";
import { a as j } from "./useRuntimeStatus-CE4IlwRK.js";
import {
  A as p,
  aQ as w,
  D as v,
  E as y,
  aa as E,
  ah as C,
  b as k,
  a1 as R,
  q as I,
  aJ as T,
  t as A,
} from "./icons-UNkcvPbk.js";
import "./vendor-CUluG-o1.js";
import "./charts-DDN7mcLY.js";
import "./supabase-DZ6I_NU8.js";
import "./zustand-BHt0iSzh.js";
import "./radix-ui-BcE8c2tf.js";
function f(s) {
  switch (s) {
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
function m(s) {
  switch (s) {
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
function g(s) {
  switch (s) {
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
function h({ status: s }) {
  const t = f(s),
    a = "h-3.5 w-3.5";
  return s === "initializing"
    ? e.jsx(R, { className: `${a} animate-spin`, style: { color: t } })
    : s === "active"
      ? e.jsx(I, { className: a, style: { color: t } })
      : s === "degraded"
        ? e.jsx(T, { className: a, style: { color: t } })
        : e.jsx(A, { className: a, style: { color: t } });
}
function x({ icon: s, name: t, service: a, isLast: n = !1 }) {
  const r = f(a.status),
    l = m(a.status),
    d = g(a.status);
  return e.jsxs("div", {
    className: "flex items-start gap-3 px-4 py-3 font-mono transition-all duration-300",
    style: {
      backgroundColor: l,
      borderLeft: `2px solid ${r}`,
      borderBottom: n ? "none" : "1px solid #1C2430",
    },
    children: [
      e.jsx("div", {
        className: "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border",
        style: { borderColor: d, backgroundColor: "rgba(0,0,0,0.3)" },
        children: e.jsx(s, { className: "h-3.5 w-3.5", style: { color: r } }),
      }),
      e.jsxs("div", {
        className: "flex min-w-0 flex-1 flex-col gap-0.5",
        children: [
          e.jsxs("div", {
            className: "flex items-center justify-between gap-4",
            children: [
              e.jsx("span", {
                className: "text-[10px] font-bold uppercase tracking-[0.18em] text-white",
                children: t,
              }),
              e.jsxs("div", {
                className: "flex items-center gap-1.5 shrink-0",
                children: [
                  e.jsx(h, { status: a.status }),
                  e.jsx("span", {
                    className: "text-[9px] font-black uppercase tracking-widest",
                    style: { color: r },
                    children: a.label,
                  }),
                  a.latencyMs !== void 0 &&
                    a.status !== "offline" &&
                    e.jsxs("span", {
                      className: "text-[8px] text-[#7A828C] tabular-nums font-mono",
                      children: [a.latencyMs, "ms"],
                    }),
                ],
              }),
            ],
          }),
          e.jsx("span", {
            className: "text-[9px] leading-relaxed text-[#7A828C] truncate",
            children: a.detail,
          }),
        ],
      }),
    ],
  });
}
function S(s) {
  const [t, a] = i.useState([
      { t: 0, text: "PIT WALL RUNTIME ENVIRONMENT INITIALIZING...", level: "info" },
      { t: 80, text: "Scanning local service registry...", level: "info" },
    ]),
    n = i.useRef(new Set()),
    r = (l, d = "info") => {
      n.current.has(l) ||
        (n.current.add(l), a((c) => [...c.slice(-19), { t: Date.now(), text: l, level: d }]));
    };
  return (
    i.useEffect(() => {
      (s.bridge.status === "active" && r("✓ Bridge daemon online — ws://localhost:3001", "ok"),
        s.bridge.status === "degraded" && r("⚠ Bridge responding with elevated latency", "warn"),
        s.bridge.status === "offline" &&
          r("✕ Bridge offline — run local-bridge/server.js", "error"));
    }, [s.bridge.status]),
    i.useEffect(() => {
      (s.iracing.status === "active" && r("✓ iRacing simulator telemetry stream active", "ok"),
        s.iracing.status === "degraded" &&
          r("⚠ Bridge connected — waiting for iRacing launch", "warn"),
        s.iracing.status === "offline" &&
          r("  iRacing not detected (bridge required first)", "info"));
    }, [s.iracing.status]),
    i.useEffect(() => {
      (s.sessionStore.status === "active" &&
        r("✓ Session store initialized — IndexedDB ready", "ok"),
        s.sessionStore.status === "offline" &&
          r("✕ Session store inaccessible — check browser storage permissions", "error"));
    }, [s.sessionStore.status]),
    i.useEffect(() => {
      (s.aiEngine.status === "active" && r("✓ AI engine reachable — cloud LLM online", "ok"),
        s.aiEngine.status === "offline" &&
          r("⚠ AI engine offline — check internet connectivity", "warn"));
    }, [s.aiEngine.status]),
    i.useEffect(() => {
      (s.mode === "workstation" && r("✓ WORKSTATION MODE — local bridge providing telemetry", "ok"),
        s.mode === "portable" && r("  PORTABLE MODE — running without local bridge", "info"));
    }, [s.mode]),
    i.useEffect(() => {
      s.ready && r("━━━━ RUNTIME ENVIRONMENT READY ━━━━", "ok");
    }, [s.ready]),
    t
  );
}
function B({ onReady: s }) {
  const t = j(),
    a = S(t),
    n = i.useRef(null),
    [r, l] = i.useState(!1);
  (i.useEffect(() => {
    n.current?.scrollIntoView({ behavior: "smooth" });
  }, [a]),
    i.useEffect(() => {
      if (t.settled) {
        const o = setTimeout(() => l(!0), 200);
        return () => clearTimeout(o);
      }
    }, [t.settled]),
    i.useEffect(() => {
      if (t.ready && t.settled) {
        const o = setTimeout(s, 1200);
        return () => clearTimeout(o);
      }
    }, [t.ready, t.settled, s]));
  const d = (t.elapsedMs / 1e3).toFixed(1),
    c = t.settled
      ? t.ready
        ? "active"
        : [t.bridge, t.iracing].some((o) => o.status === "offline")
          ? "degraded"
          : "active"
      : "initializing";
  return e.jsxs("div", {
    className: "flex h-screen w-screen flex-col overflow-hidden font-mono select-none",
    style: { backgroundColor: "#030508" },
    children: [
      e.jsxs("div", {
        className: "flex items-center justify-between px-6 py-3 shrink-0",
        style: { borderBottom: "1px solid #1C2430", backgroundColor: "#0B0F14" },
        children: [
          e.jsxs("div", {
            className: "flex items-center gap-3",
            children: [
              e.jsx("div", {
                className: "flex h-7 w-7 items-center justify-center rounded-sm",
                style: { backgroundColor: "#3B82F6" },
                children: e.jsx(p, { className: "h-4 w-4 text-white" }),
              }),
              e.jsxs("div", {
                className: "flex flex-col",
                children: [
                  e.jsx("span", {
                    className: "text-[11px] font-black uppercase tracking-[0.25em] text-white",
                    children: "PIT WALL WORKSTATION",
                  }),
                  e.jsx("span", {
                    className: "text-[8px] uppercase tracking-widest text-[#7A828C]",
                    children: "RUNTIME ENVIRONMENT MATRIX",
                  }),
                ],
              }),
            ],
          }),
          e.jsxs("div", {
            className: "flex items-center gap-4",
            children: [
              e.jsxs("span", {
                className: "text-[9px] text-[#7A828C] tabular-nums",
                children: ["T+", d, "s"],
              }),
              e.jsxs("div", {
                className:
                  "flex items-center gap-1.5 rounded-sm px-2 py-1 text-[9px] font-bold uppercase tracking-widest",
                style: { color: f(c), backgroundColor: m(c), border: `1px solid ${g(c)}` },
                children: [
                  e.jsx(h, { status: c }),
                  c === "initializing" ? "POWERING UP" : t.mode.toUpperCase() + " MODE",
                ],
              }),
            ],
          }),
        ],
      }),
      e.jsxs("div", {
        className: "flex flex-1 min-h-0 gap-0",
        children: [
          e.jsxs("div", {
            className: "flex flex-col border-r border-[#1C2430]",
            style: { width: "55%" },
            children: [
              e.jsx("div", {
                className:
                  "px-4 py-2 text-[8px] font-bold uppercase tracking-[0.3em] text-[#7A828C] shrink-0",
                style: { borderBottom: "1px solid #1C2430", backgroundColor: "#0B0F14" },
                children: "SERVICE STATUS MATRIX",
              }),
              e.jsxs("div", {
                className: "flex flex-col flex-1",
                children: [
                  e.jsx(x, { icon: w, name: "LOCAL BRIDGE", service: t.bridge }),
                  e.jsx(x, { icon: p, name: "iRACING SIMULATOR", service: t.iracing }),
                  e.jsx(x, { icon: v, name: "AI ENGINE", service: t.aiEngine }),
                  e.jsx(x, { icon: y, name: "SESSION STORE", service: t.sessionStore }),
                  e.jsx(x, {
                    icon: E,
                    name: "WORKSTATION RUNTIME",
                    service: t.workstation,
                    isLast: !0,
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "px-4 py-3 shrink-0 flex items-center justify-between",
                style: { borderTop: "1px solid #1C2430", backgroundColor: "#0B0F14" },
                children: [
                  e.jsxs("div", {
                    className: "flex flex-col gap-0.5",
                    children: [
                      e.jsx("span", {
                        className: "text-[8px] uppercase tracking-widest text-[#7A828C]",
                        children: "DEPLOYMENT MODE",
                      }),
                      e.jsx("span", {
                        className: "text-[11px] font-black uppercase tracking-wider text-white",
                        children:
                          t.mode === "workstation"
                            ? "WORKSTATION — Local Bridge Active"
                            : t.mode === "portable"
                              ? "PORTABLE — Browser / Cloud Mode"
                              : "DETECTING…",
                      }),
                    ],
                  }),
                  e.jsxs("button", {
                    onClick: () => window.location.reload(),
                    className:
                      "flex items-center gap-1.5 rounded-sm px-2 py-1 text-[8px] font-bold uppercase tracking-widest text-[#7A828C] hover:text-white transition-colors",
                    style: { border: "1px solid #1C2430" },
                    children: [e.jsx(C, { className: "h-3 w-3" }), "Re-probe"],
                  }),
                ],
              }),
            ],
          }),
          e.jsxs("div", {
            className: "flex flex-col flex-1 min-w-0",
            children: [
              e.jsx("div", {
                className:
                  "px-4 py-2 text-[8px] font-bold uppercase tracking-[0.3em] text-[#7A828C] shrink-0",
                style: { borderBottom: "1px solid #1C2430", backgroundColor: "#0B0F14" },
                children: "RUNTIME LOG",
              }),
              e.jsxs("div", {
                className: "flex-1 overflow-y-auto px-4 py-3 space-y-0.5",
                style: { backgroundColor: "#030508" },
                children: [
                  a.map((o, u) => {
                    const N =
                      o.level === "ok"
                        ? "#00D17F"
                        : o.level === "warn"
                          ? "#FFB800"
                          : o.level === "error"
                            ? "#FF4D4D"
                            : "#7A828C";
                    return e.jsxs(
                      "div",
                      {
                        className: "flex items-start gap-2 text-[9px]",
                        children: [
                          e.jsx("span", {
                            className: "shrink-0 tabular-nums text-[#3D4751] text-[8px]",
                            children: String(u).padStart(3, "0"),
                          }),
                          e.jsx("span", {
                            style: { color: N },
                            className: "leading-relaxed",
                            children: o.text,
                          }),
                        ],
                      },
                      u,
                    );
                  }),
                  e.jsx("div", { ref: n }),
                ],
              }),
              !t.settled &&
                e.jsx("div", {
                  className: "px-4 py-2 shrink-0",
                  style: { borderTop: "1px solid #1C2430" },
                  children: e.jsx("span", {
                    className: "text-[9px] text-[#3B82F6] animate-pulse",
                    children: "▌",
                  }),
                }),
            ],
          }),
        ],
      }),
      e.jsxs("div", {
        className: "shrink-0 flex items-center justify-between px-6 py-3",
        style: {
          borderTop: "1px solid #1C2430",
          backgroundColor: r ? "rgba(0,209,127,0.05)" : "#0B0F14",
          transition: "background-color 0.4s ease",
        },
        children: [
          e.jsxs("div", {
            className: "flex flex-col gap-0.5",
            children: [
              r
                ? e.jsx("span", {
                    className: "text-[10px] font-black uppercase tracking-[0.2em] text-[#00D17F]",
                    children: "✓ RUNTIME ENVIRONMENT READY — LAUNCHING WORKBENCH",
                  })
                : e.jsx("span", {
                    className: "text-[9px] text-[#7A828C] uppercase tracking-widest",
                    children: "PROBING SERVICES…",
                  }),
              e.jsx("span", {
                className: "text-[8px] text-[#3D4751]",
                children:
                  t.mode === "workstation"
                    ? "Full workstation mode — local telemetry bridge active"
                    : "Portable mode — analysis tools available without live telemetry",
              }),
            ],
          }),
          e.jsxs("button", {
            id: "runtime-enter-workbench",
            onClick: s,
            className:
              "flex items-center gap-2 rounded-sm px-4 py-2 text-[9px] font-bold uppercase tracking-widest transition-all hover:opacity-80 active:scale-95",
            style: { backgroundColor: r ? "#00D17F" : "#1C2430", color: r ? "#030508" : "#7A828C" },
            children: [r ? "ENTER WORKBENCH" : "SKIP", e.jsx(k, { className: "h-3.5 w-3.5" })],
          }),
        ],
      }),
    ],
  });
}
function z() {
  const s = b(),
    [t, a] = i.useState(!1);
  i.useEffect(() => {
    a(!0);
  }, []);
  const n = typeof window < "u" && window.navigator.userAgent.toLowerCase().includes("electron");
  if (
    (i.useEffect(() => {
      t && !n && s({ to: "/", replace: !0 });
    }, [t, n, s]),
    !t)
  )
    return e.jsx("div", {
      className:
        "flex h-screen w-screen items-center justify-center font-mono text-[10px] text-[#7A828C] select-none",
      style: { backgroundColor: "#030508" },
      children: e.jsx("span", { className: "animate-pulse", children: "INITIALIZING…" }),
    });
  if (!n)
    return e.jsx("div", {
      className:
        "flex h-screen w-screen items-center justify-center font-mono text-[10px] text-[#7A828C] select-none",
      style: { backgroundColor: "#030508" },
      children: e.jsx("span", { className: "animate-pulse", children: "REDIRECTING…" }),
    });
  const r = () => {
    s({ to: "/", replace: !0 });
  };
  return e.jsx(B, { onReady: r });
}
export { z as component };
