import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { N as useWorkbench } from "./router-D8VllJ-f.js";
import {
  RotateCcw,
  X,
  Settings,
  SkipBack,
  Rewind,
  Pause,
  Play,
  FastForward,
  SkipForward,
} from "lucide-react";
import { c as catalogEntry } from "./sessions._id-DsrZ_Tdw.js";
import "@tanstack/react-query";
import "@tanstack/react-router";
import "./charts-IpNGhCyp.js";
import "@supabase/supabase-js";
import "../server.js";
import "seroval";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "sonner";
import "zustand";
import "zustand/middleware";
import "zod";
import "./auth-middleware-Cz-8T2yV.js";
import "./schema-BU1MXGgz.js";
import "@radix-ui/react-dialog";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-tabs";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./client.server-Y-0AANJ4.js";
import "./parseInWorker-XiXcG1jn.js";
import "./histogramUtils-BD74-wnA.js";
import "./registry-CA38QAmy.js";
import "./AppHeader-B_iAqR4F.js";
import "@radix-ui/react-scroll-area";
import "./tts.functions-CbCKt0n5.js";
import "./BackButton-D1X33uYM.js";
import "./useRuntimeStatus-C58D6jGD.js";
import "./serialize-BAIrJMZ9.js";
import "react-resizable-panels";
import "uplot";
import "./SectorSpider-B2zpDSl9.js";
import "./setup-CA-YNL5H.js";
import "./fingerprint.functions-64RahZZ8.js";
import "./carClass-Cyj-ZNEv.js";
const HUD_DEFAULTS = {
  speed: "Speed",
  rpm: "RPM",
  gear: "Gear",
  throttle: "Throttle",
  brake: "Brake",
  clutch: "Clutch",
  steer: "SteeringWheelAngle",
  steerMax: "SteeringWheelAngleMax",
  latG: "LatAccel",
  longG: "LongAccel",
  fuel: "FuelLevel",
  lapPct: "LapDistPct",
  lapTime: "LapCurrentLapTime",
};
const STORAGE_KEY = "apextrace.hud.v1";
function readPrefs() {
  if (typeof window === "undefined") return { config: HUD_DEFAULTS, speedUnit: "kmh" };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { config: HUD_DEFAULTS, speedUnit: "kmh" };
    const parsed = JSON.parse(raw);
    return {
      config: { ...HUD_DEFAULTS, ...(parsed.config ?? {}) },
      speedUnit: parsed.speedUnit ?? "kmh",
    };
  } catch {
    return { config: HUD_DEFAULTS, speedUnit: "kmh" };
  }
}
function writePrefs(p) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {}
}
const EVT = "apextrace:hud-change";
function useHudPrefs() {
  const [prefs, setPrefs] = useState(() => readPrefs());
  useEffect(() => {
    const onChange = () => setPrefs(readPrefs());
    window.addEventListener(EVT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  const update = (next) => {
    writePrefs(next);
    setPrefs(next);
    window.dispatchEvent(new CustomEvent(EVT));
  };
  const reset = () => update({ config: HUD_DEFAULTS, speedUnit: "kmh" });
  return [prefs, update, reset];
}
const HUD_SLOT_LABELS = {
  speed: { label: "Speed", hint: "Big centre digit (m/s — converted to km/h or mph)" },
  rpm: { label: "RPM", hint: "Drives the arc + redline colour" },
  gear: { label: "Gear", hint: "Centre digit / N / R" },
  throttle: { label: "Throttle", hint: "Green pedal bar (0–1)" },
  brake: { label: "Brake", hint: "Red pedal bar (0–1)" },
  clutch: { label: "Clutch", hint: "Third pedal bar (0–1)" },
  steer: { label: "Steering angle", hint: "Wheel rotation (radians)" },
  steerMax: { label: "Steering max", hint: "Lock used to scale wheel rotation" },
  latG: { label: "Lateral G", hint: "Horizontal axis of the G-dot (m/s²)" },
  longG: { label: "Longitudinal G", hint: "Vertical axis of the G-dot (m/s²)" },
  fuel: { label: "Fuel level", hint: "Bottom-right read-out (L)" },
  lapPct: { label: "Lap progress", hint: "0–1, drives the lap arc" },
  lapTime: { label: "Lap time", hint: "Elapsed time on current lap (s)" },
};
function HudSettings({ parsed, onClose }) {
  const [prefs, setPrefs, reset] = useHudPrefs();
  const channelNames = useMemo(
    () => [...parsed.channelNames].sort((a, b) => a.localeCompare(b)),
    [parsed.channelNames],
  );
  const update = (slot, value) =>
    setPrefs({ ...prefs, config: { ...prefs.config, [slot]: value } });
  return /* @__PURE__ */ jsx("div", {
    className:
      "absolute inset-0 z-20 flex items-stretch justify-end bg-background/60 backdrop-blur-sm",
    children: /* @__PURE__ */ jsxs("div", {
      className: "hairline-l flex h-full w-[420px] max-w-full flex-col bg-panel shadow-xl",
      role: "dialog",
      "aria-label": "HUD settings",
      children: [
        /* @__PURE__ */ jsxs("div", {
          className:
            "hairline-b flex items-center justify-between px-3 py-2 font-mono text-[11px] uppercase tracking-wider",
          children: [
            /* @__PURE__ */ jsx("span", { children: "HUD layout" }),
            /* @__PURE__ */ jsxs("div", {
              className: "flex items-center gap-1",
              children: [
                /* @__PURE__ */ jsxs("button", {
                  onClick: reset,
                  className:
                    "flex items-center gap-1 rounded-sm border border-border px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground",
                  title: "Restore defaults",
                  children: [/* @__PURE__ */ jsx(RotateCcw, { className: "h-3 w-3" }), " Reset"],
                }),
                /* @__PURE__ */ jsx("button", {
                  onClick: onClose,
                  className:
                    "flex h-6 w-6 items-center justify-center rounded-sm text-muted-foreground hover:bg-rail hover:text-foreground",
                  "aria-label": "Close",
                  children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" }),
                }),
              ],
            }),
          ],
        }),
        /* @__PURE__ */ jsxs("div", {
          className:
            "hairline-b flex items-center justify-between gap-3 px-3 py-2 font-mono text-[11px]",
          children: [
            /* @__PURE__ */ jsx("span", {
              className: "text-muted-foreground",
              children: "Speed unit",
            }),
            /* @__PURE__ */ jsx("div", {
              className: "flex gap-px overflow-hidden rounded-sm border border-border",
              children: ["kmh", "mph", "ms"].map((u) =>
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setPrefs({ ...prefs, speedUnit: u }),
                    className: `px-2 py-0.5 text-[10px] uppercase ${prefs.speedUnit === u ? "bg-primary text-primary-foreground" : "bg-rail text-muted-foreground hover:text-foreground"}`,
                    children: u === "kmh" ? "km/h" : u === "mph" ? "mph" : "m/s",
                  },
                  u,
                ),
              ),
            }),
          ],
        }),
        /* @__PURE__ */ jsx("div", {
          className: "min-h-0 flex-1 overflow-y-auto p-2",
          children: /* @__PURE__ */ jsx("div", {
            className: "grid grid-cols-1 gap-2",
            children: Object.keys(HUD_SLOT_LABELS).map((slot) => {
              const meta = HUD_SLOT_LABELS[slot];
              const value = prefs.config[slot];
              const present = !value || value in parsed.channels;
              const cat = value ? catalogEntry(value) : null;
              const ch = value ? parsed.channels[value] : void 0;
              return /* @__PURE__ */ jsxs(
                "label",
                {
                  className: "hairline rounded-sm bg-rail/40 p-2 font-mono text-[11px]",
                  children: [
                    /* @__PURE__ */ jsxs("div", {
                      className: "flex items-center justify-between",
                      children: [
                        /* @__PURE__ */ jsx("span", {
                          className: "uppercase tracking-wider text-muted-foreground",
                          children: meta.label,
                        }),
                        !present &&
                          /* @__PURE__ */ jsx("span", {
                            className:
                              "rounded-sm bg-destructive/20 px-1.5 py-0.5 text-[9px] uppercase text-destructive-foreground",
                            children: "not in file",
                          }),
                      ],
                    }),
                    /* @__PURE__ */ jsxs("select", {
                      value,
                      onChange: (e) => update(slot, e.target.value),
                      className:
                        "mt-1 w-full rounded-sm border border-border bg-panel px-2 py-1 text-[11px] outline-none focus:border-primary",
                      children: [
                        /* @__PURE__ */ jsx("option", { value: "", children: "— none —" }),
                        channelNames.map((n) =>
                          /* @__PURE__ */ jsx("option", { value: n, children: n }, n),
                        ),
                      ],
                    }),
                    /* @__PURE__ */ jsxs("div", {
                      className:
                        "mt-1 text-[10px] normal-case tracking-normal text-muted-foreground",
                      children: [
                        meta.hint,
                        ch &&
                          /* @__PURE__ */ jsxs(Fragment, {
                            children: [
                              " ",
                              "· range ",
                              ch.min.toFixed(2),
                              "–",
                              ch.max.toFixed(2),
                              ch.unit ? ` ${ch.unit}` : "",
                            ],
                          }),
                        cat &&
                          cat.desc !== meta.hint &&
                          /* @__PURE__ */ jsxs(Fragment, {
                            children: [
                              /* @__PURE__ */ jsx("br", {}),
                              /* @__PURE__ */ jsx("span", {
                                className: "text-muted-foreground/80",
                                children: cat.desc,
                              }),
                            ],
                          }),
                      ],
                    }),
                  ],
                },
                slot,
              );
            }),
          }),
        }),
        /* @__PURE__ */ jsx("div", {
          className: "hairline-t px-3 py-2 font-mono text-[10px] text-muted-foreground",
          children: "Layout saves automatically to this browser.",
        }),
      ],
    }),
  });
}
function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}
function fmtTime(s) {
  if (!isFinite(s) || s < 0) return "—";
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  return m > 0 ? `${m}:${r.toFixed(2).padStart(5, "0")}` : r.toFixed(2);
}
function WidgetInfo({ items }) {
  return /* @__PURE__ */ jsx("div", {
    className:
      "pointer-events-none absolute right-1.5 top-1.5 z-10 min-w-[160px] rounded-sm border border-border bg-panel/95 p-1.5 font-mono text-[10px] opacity-0 shadow-lg backdrop-blur-sm transition-opacity duration-100 group-hover:opacity-100",
    children: items.map((it) =>
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: "flex items-baseline justify-between gap-2 py-0.5",
          children: [
            /* @__PURE__ */ jsx("span", {
              className: "uppercase tracking-wider text-muted-foreground",
              children: it.label,
            }),
            /* @__PURE__ */ jsxs("span", {
              className: "flex flex-col items-end leading-tight",
              children: [
                /* @__PURE__ */ jsx("span", {
                  className: "tabular-nums text-foreground",
                  children:
                    it.value == null || !isFinite(it.value)
                      ? "—"
                      : (it.fmt ? it.fmt(it.value) : it.value.toFixed(2)) +
                        (it.unit ? ` ${it.unit}` : ""),
                }),
                /* @__PURE__ */ jsx("span", {
                  className: "text-[9px] text-muted-foreground/80",
                  children: it.channel || "—",
                }),
              ],
            }),
          ],
        },
        it.label,
      ),
    ),
  });
}
function CinemaPlayback({ parsed }) {
  const { cursorTick, setCursorTick, playing, setPlaying, speed, setSpeed, refLap } =
    useWorkbench();
  const [prefs] = useHudPrefs();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const total = parsed.meta.numTicks;
  const currentLap = useMemo(() => {
    return (
      parsed.laps.find((l) => cursorTick >= l.startTick && cursorTick <= l.endTick) ??
      parsed.laps[0]
    );
  }, [parsed.laps, cursorTick]);
  const ch = parsed.channels;
  const v = (slotName) => (slotName && ch[slotName] ? ch[slotName].data[cursorTick] : void 0);
  const cfg = prefs.config;
  const speedRaw = v(cfg.speed) ?? 0;
  const speedFactor = prefs.speedUnit === "kmh" ? 3.6 : prefs.speedUnit === "mph" ? 2.23694 : 1;
  const speedDisplay = speedRaw * speedFactor;
  const speedUnitLabel =
    prefs.speedUnit === "kmh" ? "KM/H" : prefs.speedUnit === "mph" ? "MPH" : "M/S";
  const rpm = v(cfg.rpm) ?? 0;
  const rpmMax = ch[cfg.rpm]?.max ?? 9e3;
  const gear = Math.round(v(cfg.gear) ?? 0);
  const throttle = clamp01(v(cfg.throttle) ?? 0);
  const brake = clamp01(v(cfg.brake) ?? 0);
  const clutch = clamp01(v(cfg.clutch) ?? 0);
  const steerRad = v(cfg.steer) ?? 0;
  const steerMax = v(cfg.steerMax) ?? Math.max(Math.PI, ch[cfg.steer]?.max ?? Math.PI);
  const latG = (v(cfg.latG) ?? 0) / 9.81;
  const longG = (v(cfg.longG) ?? 0) / 9.81;
  const lapTime = v(cfg.lapTime) ?? 0;
  const lapPct = clamp01(v(cfg.lapPct) ?? 0);
  const fuelL = v(cfg.fuel);
  const lapNum = currentLap?.lap ?? 0;
  const unitOf = (slot) => (slot && ch[slot] ? ch[slot].unit : void 0);
  const rpmFrac = clamp01(rpm / Math.max(1, rpmMax));
  const arcStart = -210;
  const arcEnd = 30;
  const arcSpan = arcEnd - arcStart;
  const arcAngle = arcStart + arcSpan * rpmFrac;
  const polar = (r, deg, cx = 100, cy = 100) => {
    const a = (deg * Math.PI) / 180;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  };
  const arcPath = (() => {
    const r = 78;
    const [sx, sy] = polar(r, arcStart);
    const [ex, ey] = polar(r, arcAngle);
    const large = arcAngle - arcStart > 180 ? 1 : 0;
    return `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`;
  })();
  const arcBgPath = (() => {
    const r = 78;
    const [sx, sy] = polar(r, arcStart);
    const [ex, ey] = polar(r, arcEnd);
    return `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${r} ${r} 0 1 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`;
  })();
  const steerDeg = -Math.max(-360, Math.min(360, (steerRad / Math.max(0.1, steerMax)) * 180));
  const progPath = (() => {
    const r = 46;
    const sx = 50;
    const sy = 50 - r;
    const ang = -90 + 360 * lapPct;
    const [ex, ey] = polar(r, ang, 50, 50);
    if (lapPct <= 1e-3) return "";
    const large = lapPct > 0.5 ? 1 : 0;
    return `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`;
  })();
  const G_RANGE = 2.5;
  const gDotX = 50 + clamp01((latG + G_RANGE) / (2 * G_RANGE)) * 100 - 50;
  const gDotY = 50 - clamp01((longG + G_RANGE) / (2 * G_RANGE)) * 100 + 50;
  const stepTick = (delta) => setCursorTick(Math.max(0, Math.min(total - 1, cursorTick + delta)));
  const jumpToLap = (which) => {
    const here = parsed.laps.findIndex((l) => l.lap === currentLap?.lap);
    if (here < 0) return;
    const target =
      which === "prev"
        ? parsed.laps[Math.max(0, here - 1)]
        : parsed.laps[Math.min(parsed.laps.length - 1, here + 1)];
    setCursorTick(target.startTick);
  };
  return /* @__PURE__ */ jsxs("div", {
    className:
      "flex h-full flex-col bg-[radial-gradient(ellipse_at_center,_color-mix(in_oklab,var(--panel)_92%,var(--primary))_0%,var(--panel)_70%)]",
    children: [
      /* @__PURE__ */ jsxs("div", {
        className:
          "hairline-b flex items-center justify-between gap-3 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground",
        children: [
          /* @__PURE__ */ jsxs("span", {
            children: ["Cinema · L", lapNum, refLap === lapNum ? " · ref" : ""],
          }),
          /* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-2",
            children: [
              /* @__PURE__ */ jsx("span", {
                className: "tabular-nums",
                children: fmtTime(lapTime),
              }),
              /* @__PURE__ */ jsxs("button", {
                onClick: () => setSettingsOpen(true),
                className:
                  "flex h-5 items-center gap-1 rounded-sm border border-border px-1.5 text-[10px] hover:text-foreground",
                title: "Customize HUD",
                children: [/* @__PURE__ */ jsx(Settings, { className: "h-3 w-3" }), " Layout"],
              }),
            ],
          }),
        ],
      }),
      /* @__PURE__ */ jsxs("div", {
        className:
          "grid min-h-0 flex-1 grid-cols-[1.2fr_1fr_1fr] gap-px overflow-hidden bg-border/40",
        children: [
          /* @__PURE__ */ jsxs("div", {
            className: "group relative flex items-center justify-center bg-panel",
            children: [
              /* @__PURE__ */ jsx(WidgetInfo, {
                items: [
                  {
                    label: "Speed",
                    channel: cfg.speed,
                    value: speedDisplay,
                    unit: speedUnitLabel.toLowerCase(),
                    fmt: (x) => x.toFixed(1),
                  },
                  {
                    label: "RPM",
                    channel: cfg.rpm,
                    value: rpm,
                    unit: "rpm",
                    fmt: (x) => x.toFixed(0),
                  },
                  {
                    label: "Gear",
                    channel: cfg.gear,
                    value: gear,
                    fmt: (x) => (x === 0 ? "N" : x === -1 ? "R" : String(x)),
                  },
                ],
              }),
              /* @__PURE__ */ jsxs("svg", {
                viewBox: "0 0 200 200",
                className: "h-full w-full max-h-[280px] p-2",
                children: [
                  /* @__PURE__ */ jsx("path", {
                    d: arcBgPath,
                    fill: "none",
                    stroke: "var(--border-strong)",
                    strokeWidth: 6,
                    strokeLinecap: "round",
                    opacity: 0.5,
                  }),
                  /* @__PURE__ */ jsx("path", {
                    d: arcPath,
                    fill: "none",
                    stroke: rpmFrac > 0.92 ? "var(--ch-brake)" : "var(--primary)",
                    strokeWidth: 6,
                    strokeLinecap: "round",
                    style: { transition: "stroke 60ms linear" },
                  }),
                  Array.from({ length: 11 }).map((_, i) => {
                    const t = i / 10;
                    const ang = arcStart + arcSpan * t;
                    const [x1, y1] = polar(72, ang);
                    const [x2, y2] = polar(82, ang);
                    return /* @__PURE__ */ jsx(
                      "line",
                      {
                        x1,
                        y1,
                        x2,
                        y2,
                        stroke: "var(--muted-foreground)",
                        strokeWidth: i % 2 === 0 ? 1.2 : 0.5,
                        opacity: 0.7,
                      },
                      i,
                    );
                  }),
                  /* @__PURE__ */ jsx("text", {
                    x: 100,
                    y: 88,
                    textAnchor: "middle",
                    fontSize: 56,
                    fontFamily: "monospace",
                    fontWeight: 700,
                    fill: "var(--foreground)",
                    children: gear === 0 ? "N" : gear === -1 ? "R" : gear,
                  }),
                  /* @__PURE__ */ jsx("text", {
                    x: 100,
                    y: 120,
                    textAnchor: "middle",
                    fontSize: 36,
                    fontFamily: "monospace",
                    fontWeight: 700,
                    fill: "var(--foreground)",
                    className: "tabular-nums",
                    children: speedDisplay.toFixed(0),
                  }),
                  /* @__PURE__ */ jsx("text", {
                    x: 100,
                    y: 138,
                    textAnchor: "middle",
                    fontSize: 10,
                    fontFamily: "monospace",
                    fill: "var(--muted-foreground)",
                    children: speedUnitLabel,
                  }),
                  /* @__PURE__ */ jsxs("text", {
                    x: 100,
                    y: 172,
                    textAnchor: "middle",
                    fontSize: 11,
                    fontFamily: "monospace",
                    fill: "var(--muted-foreground)",
                    className: "tabular-nums",
                    children: [Math.round(rpm), " RPM"],
                  }),
                ],
              }),
            ],
          }),
          /* @__PURE__ */ jsxs("div", {
            className:
              "group relative flex flex-col items-center justify-center gap-3 bg-panel p-3",
            children: [
              /* @__PURE__ */ jsx(WidgetInfo, {
                items: [
                  {
                    label: "Steer",
                    channel: cfg.steer,
                    value: (steerRad * 180) / Math.PI,
                    unit: "°",
                    fmt: (x) => x.toFixed(0),
                  },
                  {
                    label: "Throttle",
                    channel: cfg.throttle,
                    value: throttle * 100,
                    unit: "%",
                    fmt: (x) => x.toFixed(0),
                  },
                  {
                    label: "Brake",
                    channel: cfg.brake,
                    value: brake * 100,
                    unit: "%",
                    fmt: (x) => x.toFixed(0),
                  },
                  {
                    label: "Clutch",
                    channel: cfg.clutch,
                    value: clutch * 100,
                    unit: "%",
                    fmt: (x) => x.toFixed(0),
                  },
                ],
              }),
              /* @__PURE__ */ jsxs("svg", {
                viewBox: "0 0 120 120",
                className: "h-32 w-32",
                children: [
                  /* @__PURE__ */ jsxs("g", {
                    style: {
                      transform: `rotate(${steerDeg}deg)`,
                      transformOrigin: "60px 60px",
                      transition: "transform 50ms linear",
                    },
                    children: [
                      /* @__PURE__ */ jsx("circle", {
                        cx: 60,
                        cy: 60,
                        r: 48,
                        fill: "none",
                        stroke: "var(--border-strong)",
                        strokeWidth: 3,
                      }),
                      /* @__PURE__ */ jsx("circle", {
                        cx: 60,
                        cy: 60,
                        r: 8,
                        fill: "var(--primary)",
                      }),
                      /* @__PURE__ */ jsx("line", {
                        x1: 60,
                        y1: 12,
                        x2: 60,
                        y2: 28,
                        stroke: "var(--primary)",
                        strokeWidth: 3,
                        strokeLinecap: "round",
                      }),
                      /* @__PURE__ */ jsx("line", {
                        x1: 12,
                        y1: 60,
                        x2: 108,
                        y2: 60,
                        stroke: "var(--primary)",
                        strokeWidth: 3,
                        strokeLinecap: "round",
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("text", {
                    x: 60,
                    y: 114,
                    textAnchor: "middle",
                    fontSize: 9,
                    fontFamily: "monospace",
                    fill: "var(--muted-foreground)",
                    className: "tabular-nums",
                    children: [((steerRad * 180) / Math.PI).toFixed(0), "°"],
                  }),
                ],
              }),
              /* @__PURE__ */ jsx("div", {
                className: "flex w-full items-end justify-center gap-2",
                children: [
                  { k: "T", v: throttle, color: "var(--ch-throttle)" },
                  { k: "B", v: brake, color: "var(--ch-brake)" },
                  { k: "C", v: clutch, color: "var(--ch-default)" },
                ].map((p) =>
                  /* @__PURE__ */ jsxs(
                    "div",
                    {
                      className: "flex flex-col items-center gap-1",
                      children: [
                        /* @__PURE__ */ jsx("div", {
                          className: "relative h-24 w-5 overflow-hidden rounded-sm bg-rail",
                          children: /* @__PURE__ */ jsx("div", {
                            className: "absolute inset-x-0 bottom-0",
                            style: {
                              height: `${p.v * 100}%`,
                              background: p.color,
                              transition: "height 50ms linear",
                            },
                          }),
                        }),
                        /* @__PURE__ */ jsx("span", {
                          className: "font-mono text-[10px] text-muted-foreground",
                          children: p.k,
                        }),
                        /* @__PURE__ */ jsx("span", {
                          className: "font-mono text-[10px] tabular-nums text-foreground",
                          children: Math.round(p.v * 100),
                        }),
                      ],
                    },
                    p.k,
                  ),
                ),
              }),
            ],
          }),
          /* @__PURE__ */ jsxs("div", {
            className:
              "group relative flex flex-col items-center justify-center gap-2 bg-panel p-3",
            children: [
              /* @__PURE__ */ jsx(WidgetInfo, {
                items: [
                  {
                    label: "Lat G",
                    channel: cfg.latG,
                    value: latG,
                    unit: "g",
                    fmt: (x) => (x >= 0 ? "+" : "") + x.toFixed(2),
                  },
                  {
                    label: "Long G",
                    channel: cfg.longG,
                    value: longG,
                    unit: "g",
                    fmt: (x) => (x >= 0 ? "+" : "") + x.toFixed(2),
                  },
                  {
                    label: "Lap %",
                    channel: cfg.lapPct,
                    value: lapPct * 100,
                    unit: "%",
                    fmt: (x) => x.toFixed(1),
                  },
                  {
                    label: "Fuel",
                    channel: cfg.fuel,
                    value: fuelL,
                    unit: unitOf(cfg.fuel) || "L",
                    fmt: (x) => x.toFixed(2),
                  },
                  {
                    label: "Lap time",
                    channel: cfg.lapTime,
                    value: lapTime,
                    unit: "s",
                    fmt: (x) => fmtTime(x),
                  },
                ],
              }),
              /* @__PURE__ */ jsx("div", {
                className: "relative",
                children: /* @__PURE__ */ jsxs("svg", {
                  viewBox: "0 0 100 100",
                  className: "h-32 w-32",
                  children: [
                    /* @__PURE__ */ jsx("circle", {
                      cx: 50,
                      cy: 50,
                      r: 48,
                      fill: "none",
                      stroke: "var(--border-strong)",
                      strokeWidth: 1,
                    }),
                    [0.5, 1, 1.5, 2].map((g) =>
                      /* @__PURE__ */ jsx(
                        "circle",
                        {
                          cx: 50,
                          cy: 50,
                          r: (g / G_RANGE) * 50,
                          fill: "none",
                          stroke: "var(--border)",
                          strokeWidth: 0.4,
                          opacity: 0.7,
                        },
                        g,
                      ),
                    ),
                    /* @__PURE__ */ jsx("line", {
                      x1: 50,
                      y1: 2,
                      x2: 50,
                      y2: 98,
                      stroke: "var(--border)",
                      strokeWidth: 0.4,
                    }),
                    /* @__PURE__ */ jsx("line", {
                      x1: 2,
                      y1: 50,
                      x2: 98,
                      y2: 50,
                      stroke: "var(--border)",
                      strokeWidth: 0.4,
                    }),
                    /* @__PURE__ */ jsx("circle", {
                      cx: gDotX,
                      cy: gDotY,
                      r: 3.5,
                      fill: "var(--primary)",
                      style: { transition: "all 60ms linear" },
                    }),
                    /* @__PURE__ */ jsx("text", {
                      x: 50,
                      y: 10,
                      textAnchor: "middle",
                      fontSize: 6,
                      fontFamily: "monospace",
                      fill: "var(--muted-foreground)",
                      children: "ACCEL",
                    }),
                    /* @__PURE__ */ jsx("text", {
                      x: 50,
                      y: 96,
                      textAnchor: "middle",
                      fontSize: 6,
                      fontFamily: "monospace",
                      fill: "var(--muted-foreground)",
                      children: "BRAKE",
                    }),
                  ],
                }),
              }),
              /* @__PURE__ */ jsxs("div", {
                className: "grid w-full grid-cols-2 gap-2 font-mono text-[10px]",
                children: [
                  /* @__PURE__ */ jsxs("div", {
                    className: "flex items-center justify-between rounded-sm bg-rail px-2 py-1",
                    children: [
                      /* @__PURE__ */ jsx("span", {
                        className: "text-muted-foreground",
                        children: "LAT",
                      }),
                      /* @__PURE__ */ jsxs("span", {
                        className: "tabular-nums",
                        children: [latG >= 0 ? "+" : "", latG.toFixed(2), "g"],
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "flex items-center justify-between rounded-sm bg-rail px-2 py-1",
                    children: [
                      /* @__PURE__ */ jsx("span", {
                        className: "text-muted-foreground",
                        children: "LONG",
                      }),
                      /* @__PURE__ */ jsxs("span", {
                        className: "tabular-nums",
                        children: [longG >= 0 ? "+" : "", longG.toFixed(2), "g"],
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "flex items-center justify-between rounded-sm bg-rail px-2 py-1",
                    children: [
                      /* @__PURE__ */ jsx("span", {
                        className: "text-muted-foreground",
                        children: "PCT",
                      }),
                      /* @__PURE__ */ jsxs("span", {
                        className: "tabular-nums",
                        children: [(lapPct * 100).toFixed(1), "%"],
                      }),
                    ],
                  }),
                  /* @__PURE__ */ jsxs("div", {
                    className: "flex items-center justify-between rounded-sm bg-rail px-2 py-1",
                    children: [
                      /* @__PURE__ */ jsx("span", {
                        className: "text-muted-foreground",
                        children: "FUEL",
                      }),
                      /* @__PURE__ */ jsx("span", {
                        className: "tabular-nums",
                        children: fuelL != null ? `${fuelL.toFixed(1)}L` : "—",
                      }),
                    ],
                  }),
                ],
              }),
              /* @__PURE__ */ jsxs("svg", {
                viewBox: "0 0 100 100",
                className: "h-12 w-12",
                children: [
                  /* @__PURE__ */ jsx("circle", {
                    cx: 50,
                    cy: 50,
                    r: 46,
                    fill: "none",
                    stroke: "var(--border-strong)",
                    strokeWidth: 3,
                  }),
                  progPath &&
                    /* @__PURE__ */ jsx("path", {
                      d: progPath,
                      fill: "none",
                      stroke: "var(--primary)",
                      strokeWidth: 4,
                      strokeLinecap: "round",
                    }),
                  /* @__PURE__ */ jsx("text", {
                    x: 50,
                    y: 56,
                    textAnchor: "middle",
                    fontSize: 20,
                    fontFamily: "monospace",
                    fontWeight: 700,
                    fill: "var(--foreground)",
                    children: Math.round(lapPct * 100),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      /* @__PURE__ */ jsxs("div", {
        className: "hairline-t flex items-center gap-2 bg-panel px-3 py-2",
        children: [
          /* @__PURE__ */ jsx("button", {
            onClick: () => jumpToLap("prev"),
            className:
              "flex h-7 w-7 items-center justify-center rounded-sm border border-border text-muted-foreground hover:text-foreground",
            title: "Previous lap",
            children: /* @__PURE__ */ jsx(SkipBack, { className: "h-3.5 w-3.5" }),
          }),
          /* @__PURE__ */ jsx("button", {
            onClick: () => stepTick(-Math.round(parsed.meta.tickRate)),
            className:
              "flex h-7 w-7 items-center justify-center rounded-sm border border-border text-muted-foreground hover:text-foreground",
            title: "−1s",
            children: /* @__PURE__ */ jsx(Rewind, { className: "h-3.5 w-3.5" }),
          }),
          /* @__PURE__ */ jsx("button", {
            onClick: () => setPlaying(!playing),
            className:
              "flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-primary-foreground hover:opacity-90",
            children: playing
              ? /* @__PURE__ */ jsx(Pause, { className: "h-4 w-4" })
              : /* @__PURE__ */ jsx(Play, { className: "h-4 w-4" }),
          }),
          /* @__PURE__ */ jsx("button", {
            onClick: () => stepTick(Math.round(parsed.meta.tickRate)),
            className:
              "flex h-7 w-7 items-center justify-center rounded-sm border border-border text-muted-foreground hover:text-foreground",
            title: "+1s",
            children: /* @__PURE__ */ jsx(FastForward, { className: "h-3.5 w-3.5" }),
          }),
          /* @__PURE__ */ jsx("button", {
            onClick: () => jumpToLap("next"),
            className:
              "flex h-7 w-7 items-center justify-center rounded-sm border border-border text-muted-foreground hover:text-foreground",
            title: "Next lap",
            children: /* @__PURE__ */ jsx(SkipForward, { className: "h-3.5 w-3.5" }),
          }),
          /* @__PURE__ */ jsx("select", {
            value: speed,
            onChange: (e) => setSpeed(parseFloat(e.target.value)),
            className: "rounded-sm border border-border bg-rail px-2 py-1 font-mono text-xs",
            title: "Playback speed",
            children: [0.25, 0.5, 1, 2, 4, 8].map((s) =>
              /* @__PURE__ */ jsxs("option", { value: s, children: [s, "×"] }, s),
            ),
          }),
          /* @__PURE__ */ jsx("input", {
            type: "range",
            min: 0,
            max: Math.max(0, total - 1),
            value: cursorTick,
            onChange: (e) => setCursorTick(parseInt(e.target.value, 10)),
            className: "flex-1 accent-[color:var(--primary)]",
          }),
          /* @__PURE__ */ jsxs("div", {
            className: "font-mono text-[10px] tabular-nums text-muted-foreground",
            children: [
              fmtTime(cursorTick / parsed.meta.tickRate),
              " /",
              " ",
              fmtTime((total - 1) / parsed.meta.tickRate),
            ],
          }),
        ],
      }),
      settingsOpen &&
        /* @__PURE__ */ jsx(HudSettings, { parsed, onClose: () => setSettingsOpen(false) }),
    ],
  });
}
export { CinemaPlayback };
