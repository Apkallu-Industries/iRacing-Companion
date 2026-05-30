import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { Settings, Cpu, Mic, Database, Palette } from "lucide-react";
import { A as AppHeader, L as LLMSettings, V as VoiceSettings, a as LocalDbSettings, T as ThemeEditor } from "./AppHeader-B_iAqR4F.js";
import { M as useTheme, L as LAYOUT_PROFILES, P as PRESETS, D as DARK_THEME, o as getBridgePerformanceMode, p as getBridgePerformanceSnapshot, A as setBridgePerformanceMode } from "./router-D8VllJ-f.js";
import { useState, useEffect } from "react";
import "zod";
import "@radix-ui/react-dialog";
import "class-variance-authority";
import "@radix-ui/react-scroll-area";
import "../server.js";
import "seroval";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./auth-middleware-Cz-8T2yV.js";
import "sonner";
import "./tts.functions-CbCKt0n5.js";
import "./BackButton-D1X33uYM.js";
import "./useRuntimeStatus-C58D6jGD.js";
import "@tanstack/react-query";
import "./charts-IpNGhCyp.js";
import "@supabase/supabase-js";
import "zustand";
import "zustand/middleware";
import "./schema-BU1MXGgz.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-tabs";
import "@radix-ui/react-slot";
import "./client.server-Y-0AANJ4.js";
function LayoutStylePicker() {
  const { layout, setLayout, setTheme } = useTheme();
  return /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-2", children: LAYOUT_PROFILES.map((p) => {
    const active = layout === p.id;
    const matchingPreset = PRESETS.find((pr) => pr.id === p.id);
    return /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => {
          setLayout(p.id);
          if (matchingPreset) setTheme(matchingPreset.theme);
          else setTheme(DARK_THEME);
        },
        className: `relative flex items-center gap-3 text-left rounded-sm border px-3 py-2.5 text-xs transition-all ${active ? "border-primary bg-primary/10 ring-1 ring-primary/30" : "border-border bg-panel-2 hover:border-primary/50 hover:bg-accent/30"}`,
        children: [
          /* @__PURE__ */ jsx("span", { className: "flex h-9 w-9 flex-shrink-0 flex-wrap overflow-hidden rounded-sm border border-border shadow-sm", children: p.swatches.map((c, i) => /* @__PURE__ */ jsx(
            "span",
            {
              className: "block",
              style: { background: c, width: "50%", height: "50%" }
            },
            i
          )) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("div", { className: "font-mono font-bold text-[11px] leading-tight truncate text-foreground", children: p.label }),
            /* @__PURE__ */ jsx("div", { className: "text-[9px] text-muted-foreground mt-0.5 leading-tight", children: p.subtitle }),
            /* @__PURE__ */ jsx("div", { className: "text-[9px] text-muted-foreground mt-1 leading-snug line-clamp-2 hidden sm:block", children: p.description })
          ] }),
          active && /* @__PURE__ */ jsx("span", { className: "text-[8px] font-bold text-primary uppercase tracking-widest flex-shrink-0 bg-primary/10 px-1.5 py-0.5 rounded-sm", children: "Active" })
        ]
      },
      p.id
    );
  }) });
}
function BridgePerformanceSettings() {
  const [mode, setMode] = useState("balanced60");
  const [lastFps, setLastFps] = useState(null);
  const [recommended, setRecommended] = useState("balanced60");
  useEffect(() => {
    const m = getBridgePerformanceMode();
    const snap = getBridgePerformanceSnapshot();
    setMode(m);
    if (snap) {
      setLastFps(snap.lastFps);
      setRecommended(snap.recommendedMode);
    }
  }, []);
  const onMode = (next) => {
    setMode(next);
    setBridgePerformanceMode(next);
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-xs", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid gap-2 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => onMode("stable30"),
          className: `rounded-sm border px-3 py-2 text-left ${mode === "stable30" ? "border-emerald-400 bg-emerald-500/10 text-emerald-200" : "border-border-strong bg-muted text-foreground"}`,
          children: [
            /* @__PURE__ */ jsx("div", { className: "font-mono text-[11px] uppercase tracking-wider", children: "Stable 30Hz" }),
            /* @__PURE__ */ jsx("div", { className: "mt-1 text-[11px] text-muted-foreground", children: "Best for weaker clients and consistent delivery." })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => onMode("balanced60"),
          className: `rounded-sm border px-3 py-2 text-left ${mode === "balanced60" ? "border-cyan-400 bg-cyan-500/10 text-cyan-200" : "border-border-strong bg-muted text-foreground"}`,
          children: [
            /* @__PURE__ */ jsx("div", { className: "font-mono text-[11px] uppercase tracking-wider", children: "Balanced 60Hz" }),
            /* @__PURE__ */ jsx("div", { className: "mt-1 text-[11px] text-muted-foreground", children: "Smoother visuals with adaptive fallback to 30Hz." })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-sm border border-border-strong bg-muted/50 p-2 text-[11px] text-muted-foreground", children: [
      "Last measured client FPS: ",
      /* @__PURE__ */ jsx("span", { className: "text-foreground", children: lastFps ?? "n/a" }),
      " · ",
      "Recommended:",
      " ",
      /* @__PURE__ */ jsx("span", { className: "text-foreground", children: recommended === "stable30" ? "Stable 30Hz" : "Balanced 60Hz" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => onMode(recommended),
          className: "ml-2 rounded-sm bg-accent px-2 py-0.5 text-[10px] uppercase tracking-wider text-foreground hover:bg-zinc-700",
          children: "Apply recommendation"
        }
      )
    ] })
  ] });
}
function SettingsPage() {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxs(AppHeader, { children: [
      /* @__PURE__ */ jsx("span", { className: "font-mono uppercase tracking-wider", children: "Settings" }),
      /* @__PURE__ */ jsx(Link, { to: "/sessions", className: "ml-3 text-muted-foreground hover:text-foreground", children: "Sessions" }),
      /* @__PURE__ */ jsx(Link, { to: "/live", className: "ml-3 text-muted-foreground hover:text-foreground", children: "Live" })
    ] }),
    /* @__PURE__ */ jsx("main", { className: "w-full max-w-none px-4 md:px-12 lg:px-16 p-6", children: /* @__PURE__ */ jsxs("div", { className: "hairline rounded-sm bg-panel p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-primary-foreground", children: /* @__PURE__ */ jsx(Settings, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "font-mono text-sm uppercase tracking-wider", children: "System Settings" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Manage your local AI provider and verify MongoDB connectivity for offline telemetry storage." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 grid gap-3 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "hairline rounded-sm bg-rail p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-wider", children: [
            /* @__PURE__ */ jsx(Cpu, { className: "h-3.5 w-3.5" }),
            " AI Provider"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mb-3 text-xs text-muted-foreground", children: "Choose cloud or local LLM backends and set your local host URL/model." }),
          /* @__PURE__ */ jsx(LLMSettings, { inline: true })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "hairline rounded-sm bg-rail p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-wider", children: [
            /* @__PURE__ */ jsx(Mic, { className: "h-3.5 w-3.5" }),
            " Voice"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mb-3 text-xs text-muted-foreground", children: "Set ElevenLabs API key and preferred voice ID for spoken coach feedback." }),
          /* @__PURE__ */ jsx(VoiceSettings, { inline: true })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "hairline rounded-sm bg-rail p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-wider", children: [
            /* @__PURE__ */ jsx(Database, { className: "h-3.5 w-3.5" }),
            " Local Database"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mb-3 text-xs text-muted-foreground", children: "Test MongoDB connection status and manage local browser file cache." }),
          /* @__PURE__ */ jsx(LocalDbSettings, {})
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "hairline rounded-sm bg-rail p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-wider", children: [
            /* @__PURE__ */ jsx(Palette, { className: "h-3.5 w-3.5" }),
            " Appearance"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mb-3 text-xs text-muted-foreground", children: "Pick a UI style — this changes the layout, color theme, and dashboard widgets. The F1 style unlocks the full F1 telemetry dashboard on the Live page." }),
          /* @__PURE__ */ jsx(LayoutStylePicker, {}),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 pt-3 border-t border-border", children: [
            /* @__PURE__ */ jsx("p", { className: "mb-2 text-[10px] text-muted-foreground uppercase tracking-wider", children: "Fine-tune individual color tokens" }),
            /* @__PURE__ */ jsx(ThemeEditor, {})
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "hairline rounded-sm bg-rail p-4 sm:col-span-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-wider", children: [
            /* @__PURE__ */ jsx(Cpu, { className: "h-3.5 w-3.5" }),
            " Live Performance"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mb-3 text-xs text-muted-foreground", children: "Choose bridge streaming profile. Stable uses 30Hz UI updates; Balanced uses 60Hz with adaptive fallback." }),
          /* @__PURE__ */ jsx(BridgePerformanceSettings, {})
        ] })
      ] })
    ] }) })
  ] });
}
export {
  SettingsPage as component
};
