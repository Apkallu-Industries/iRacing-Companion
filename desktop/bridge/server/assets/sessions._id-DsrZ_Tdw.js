import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useRef, useEffect, Suspense, lazy } from "react";
import { N as useWorkbench, x as resolveLLMUrl, j as cn, k as colorForChannel, a as DEFAULT_CHANNELS, b as Route, J as useAuth, K as useTelemetry, C as supabase, W as WORKSPACES } from "./router-D8VllJ-f.js";
import { p as parseIbtInWorker } from "./parseInWorker-XiXcG1jn.js";
import { M as MiniTrace, d as evaluateMathExpressionForIbt, a as computeHistogram, l as loadChannelPrefs, f as fetchLocalTelemetryFile, T as TelemetryEventTimeline } from "./histogramUtils-BD74-wnA.js";
import { A as AppHeader } from "./AppHeader-B_iAqR4F.js";
import { Lock, Shield, Download, Wrench, Thermometer, Wind, CloudRain, Bot, GripVertical, Search, Star, ChevronDown, ChevronRight, EyeOff, Eye, Trophy, Flag, Zap, MapPin, ShieldAlert, ShieldCheck, TrendingDown, TrendingUp, Sparkles, Loader2, GitCompare, Flame, Share2, Check, Copy, Trash2, Fingerprint, Minus } from "lucide-react";
import { s as serializePwlap } from "./serialize-BAIrJMZ9.js";
import { toast } from "sonner";
import { Panel, Group as Group$1, Separator } from "react-resizable-panels";
import { u as useTelemetryRuntimeStore, b as broadcastTelemetryFrame, W as WORKSPACE_PRESETS, T as TELEMETRY_INSTRUMENTS } from "./registry-CA38QAmy.js";
import uPlot from "uplot";
import { c as createShareLink, a as revokeShareLink, T as TrackMap, P as PianoRoll, S as SectorSpider } from "./SectorSpider-B2zpDSl9.js";
import { p as parseCarSetup, d as diffSetups } from "./setup-CA-YNL5H.js";
import { b as createServerFn, e as createSsrRpc, u as useServerFn } from "../server.js";
import { r as requireSupabaseAuth } from "./auth-middleware-Cz-8T2yV.js";
import { g as getFingerprintForPair } from "./fingerprint.functions-64RahZZ8.js";
import { c as classifyCar } from "./carClass-Cyj-ZNEv.js";
function statsOf(data) {
  let min = Infinity, max = -Infinity, sum = 0, n = 0;
  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    if (!Number.isFinite(v)) continue;
    if (v < min) min = v;
    if (v > max) max = v;
    sum += v;
    n++;
  }
  return {
    min: isFinite(min) ? min : 0,
    max: isFinite(max) ? max : 0,
    avg: n ? sum / n : 0
  };
}
function channelFromArray(name, unit, group, desc, arr) {
  const data = new Float32Array(arr.length);
  for (let i = 0; i < arr.length; i++) data[i] = arr[i];
  const { min, max, avg } = statsOf(data);
  return { name, unit, desc, type: 4, data, min, max, avg, group };
}
function inferGroup(name) {
  const n = name.toLowerCase();
  if (/(throttle|brake|clutch|steer|handbrake|driver)/.test(n)) return "Driver Inputs";
  if (/(speed|velocity|accel|yaw|pitch|roll|gear|rpm|enginerpm|track)/.test(n)) return "Vehicle";
  if (/(fuel|engine|oil|water|coolant|mgu|battery|kers|drs|boost|manifold)/.test(n))
    return "Engine";
  if (/(tire|tyre|temp|press|carcass|tread|wear|cf|cm|cl|lf|rf|lr|rr)/.test(n) && /(temp|press|wear|tread|cold|carcass)/.test(n))
    return "Tires";
  if (/(shock|spring|ride|damper|susp|arb|height|defl)/.test(n)) return "Suspension";
  if (/(session|lap|race|incident|flag|pit|track|surface|sector)/.test(n)) return "Session";
  if (/(weather|wind|air|track(temp|surface|wetness|usage)|humidity|skies|fog|precip)/.test(n))
    return "Environment";
  if (/(cpu|fps|frame|gpu|mem|latency|ping)/.test(n)) return "System";
  return "Other";
}
function parsedFromV2(doc) {
  const numTicks = doc.t.length;
  const channels = {};
  for (const [name, col] of Object.entries(doc.channels)) {
    const grp = inferGroup(name) || col.group;
    channels[name] = channelFromArray(name, col.unit, grp, name, col.data);
  }
  const sessionTime = new Float32Array(numTicks);
  for (let i = 0; i < numTicks; i++) sessionTime[i] = doc.t[i];
  channels["SessionTime"] = {
    name: "SessionTime",
    unit: "s",
    desc: "Session time",
    type: 4,
    data: sessionTime,
    min: 0,
    max: doc.durationS,
    avg: doc.durationS / 2,
    group: "Timing"
  };
  if (!channels["LapDistPct"]) {
    const lapDistPct = new Float32Array(numTicks);
    for (let i = 0; i < numTicks; i++) lapDistPct[i] = numTicks > 1 ? i / (numTicks - 1) : 0;
    channels["LapDistPct"] = {
      name: "LapDistPct",
      unit: "",
      desc: "Lap distance (synthetic)",
      type: 4,
      data: lapDistPct,
      min: 0,
      max: 1,
      avg: 0.5,
      group: "Timing"
    };
  }
  let trackXY;
  const vxCh = channels["VelocityX"];
  const vyCh = channels["VelocityY"];
  const yawCh = channels["Yaw"] || channels["YawNorth"];
  if (vxCh && vyCh && yawCh && numTicks > 1) {
    const x = new Float32Array(numTicks);
    const y = new Float32Array(numTicks);
    let px = 0, py = 0;
    const tickRate = doc.sampleRate || 60;
    const dt = 1 / Math.max(1, tickRate);
    let minX = 0, maxX = 0, minY = 0, maxY = 0;
    for (let t = 0; t < numTicks; t++) {
      const yaw = yawCh.data[t];
      const vx = vxCh.data[t];
      const vy = vyCh.data[t];
      const cs = Math.cos(yaw), sn = Math.sin(yaw);
      const wx = vx * cs - vy * sn;
      const wy = vx * sn + vy * cs;
      px += wx * dt;
      py += wy * dt;
      x[t] = px;
      y[t] = py;
      if (px < minX) minX = px;
      else if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      else if (py > maxY) maxY = py;
    }
    trackXY = { x, y, minX, maxX, minY, maxY };
  }
  let laps = [];
  const lapCh = channels["Lap"];
  if (lapCh && numTicks > 0) {
    let curLap = lapCh.data[0];
    let curStart = 0;
    for (let t = 1; t < numTicks; t++) {
      const v = lapCh.data[t];
      if (v !== curLap) {
        laps.push({
          lap: curLap,
          startTick: curStart,
          endTick: t - 1,
          timeS: sessionTime[t - 1] - sessionTime[curStart]
        });
        curLap = v;
        curStart = t;
      }
    }
    laps.push({
      lap: curLap,
      startTick: curStart,
      endTick: numTicks - 1,
      timeS: sessionTime[numTicks - 1] - sessionTime[curStart]
    });
  } else {
    laps = numTicks > 0 ? [{ lap: 1, startTick: 0, endTick: numTicks - 1, timeS: doc.bestLapS ?? doc.durationS }] : [];
  }
  return {
    meta: {
      ver: 2,
      tickRate: doc.sampleRate || 60,
      numVars: Object.keys(channels).length,
      numTicks,
      durationS: doc.durationS,
      bufLen: 0,
      trackName: doc.track,
      trackDisplayName: doc.track,
      carName: doc.car,
      driverName: void 0,
      recordedAt: doc.startedAt,
      bestLapS: doc.bestLapS ?? void 0,
      sessionInfoYaml: void 0
    },
    channels,
    channelNames: Object.keys(channels),
    laps,
    trackXY
  };
}
function parsedFromV1(doc) {
  const t = doc.samples.map((s) => s.t);
  const v2 = {
    track: doc.track,
    car: doc.car,
    startedAt: doc.startedAt,
    durationS: doc.durationS,
    sampleRate: doc.sampleRate,
    bestLapS: doc.bestLapS,
    source: doc.source,
    t,
    channels: {
      Speed: { unit: "m/s", group: "Velocity", data: doc.samples.map((s) => s.spd / 3.6) },
      SpeedKph: { unit: "kph", group: "Velocity", data: doc.samples.map((s) => s.spd) },
      RPM: { unit: "rpm", group: "Engine", data: doc.samples.map((s) => s.rpm) },
      Gear: { unit: "", group: "Engine", data: doc.samples.map((s) => s.gear) },
      Throttle: { unit: "%", group: "Driver", data: doc.samples.map((s) => s.thr) },
      Brake: { unit: "%", group: "Driver", data: doc.samples.map((s) => s.brk) },
      Clutch: { unit: "%", group: "Driver", data: doc.samples.map((s) => s.clu) },
      SteeringWheelAngle: {
        unit: "rad",
        group: "Driver",
        data: doc.samples.map((s) => s.str * Math.PI / 180)
      },
      LatAccel: { unit: "m/s^2", group: "Forces", data: doc.samples.map((s) => s.gLat * 9.81) },
      LongAccel: { unit: "m/s^2", group: "Forces", data: doc.samples.map((s) => s.gLon * 9.81) },
      FuelLevel: { unit: "L", group: "Fuel", data: doc.samples.map((s) => s.fuel) },
      LapDelta: { unit: "s", group: "Timing", data: doc.samples.map((s) => s.delta) }
    }
  };
  return parsedFromV2(v2);
}
function pwlapToParsed(doc) {
  if (doc.version === 2) return parsedFromV2(doc);
  return parsedFromV1(doc);
}
function isPwlapPath(pathOrName) {
  if (!pathOrName) return false;
  return pathOrName.toLowerCase().endsWith(".pwlap");
}
function ExportPwlapDialog({
  sessionId,
  onClose
}) {
  const { parsed } = useWorkbench();
  const [granularity, setGranularity] = useState("full");
  const [encrypt, setEncrypt] = useState(false);
  const [password, setPassword] = useState("");
  const [sign, setSign] = useState(false);
  const [privateKeyStr, setPrivateKeyStr] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const handleExport = async () => {
    if (!parsed) {
      toast.error("No telemetry session loaded to export.");
      return;
    }
    setIsExporting(true);
    try {
      const content = {
        version: 1,
        metadata: {
          track: parsed.meta.trackDisplayName || "unknown",
          car: parsed.meta.carName || "unknown",
          recorded_at: parsed.meta.recordedAt || (/* @__PURE__ */ new Date()).toISOString(),
          duration_s: parsed.meta.durationS || 0,
          lap_count: parsed.laps.length,
          best_lap_s: parsed.meta.bestLapS || parsed.laps.reduce(
            (best, l) => l.timeS > 0 && (best === 0 || l.timeS < best) ? l.timeS : best,
            0
          )
        },
        channels_manifest: Object.keys(parsed.channels).map((c) => ({
          name: c,
          unit: parsed.channels[c].unit || "",
          description: parsed.channels[c].desc || "",
          type: parsed.channels[c].type,
          group: parsed.channels[c].group
        })),
        granularity,
        laps: granularity !== "metadata" ? parsed.laps.map((l) => ({
          lap_number: l.lap,
          duration_s: l.timeS,
          fuel_remaining_l: parsed.channels["FuelLevel"]?.data[l.endTick] ?? 0,
          track_temp_c: parsed.channels["TrackTemp"]?.data[l.endTick] ?? 0,
          air_temp_c: parsed.channels["AirTemp"]?.data[l.endTick] ?? 0
        })) : void 0,
        setup: granularity !== "metadata" ? {} : void 0,
        samples: []
      };
      if (granularity === "full") {
        toast.info("Exporting 'full' telemetry samples can produce very large files.");
      }
      const options = {
        granularity,
        encrypt,
        password: encrypt ? password : void 0,
        sign,
        includePii: true,
        compress: true
      };
      if (sign && privateKeyStr) {
        options.privateKey = new Uint8Array(Buffer.from(privateKeyStr, "base64"));
      }
      const buffer = await serializePwlap(content, options);
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `session_${sessionId}_${Date.now()}.pwlap`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(".pwlap exported successfully.");
      onClose();
    } catch (e) {
      toast.error(`Export failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsExporting(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md rounded-md border border-border bg-panel p-6 shadow-xl", children: [
    /* @__PURE__ */ jsx("h2", { className: "mb-4 font-mono text-lg font-bold uppercase tracking-wider", children: "Export .pwlap" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "mb-1 block font-mono text-[11px] uppercase text-muted-foreground", children: "Granularity" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: granularity,
            onChange: (e) => setGranularity(e.target.value),
            className: "w-full rounded-sm border border-border bg-rail p-2 text-sm text-foreground outline-none focus:border-primary",
            children: [
              /* @__PURE__ */ jsx("option", { value: "metadata", children: "Metadata Only" }),
              /* @__PURE__ */ jsx("option", { value: "setup", children: "Metadata + Setup" }),
              /* @__PURE__ */ jsx("option", { value: "full", children: "Full Telemetry" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: encrypt,
              onChange: (e) => setEncrypt(e.target.checked),
              className: "accent-primary"
            }
          ),
          /* @__PURE__ */ jsxs("span", { className: "font-mono text-sm flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(Lock, { className: "w-3 h-3" }),
            " Encrypt File"
          ] })
        ] }),
        encrypt && /* @__PURE__ */ jsx(
          "input",
          {
            type: "password",
            placeholder: "Encryption Password",
            value: password,
            onChange: (e) => setPassword(e.target.value),
            className: "w-full rounded-sm border border-border bg-rail p-2 text-sm outline-none focus:border-primary"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: sign,
              onChange: (e) => setSign(e.target.checked),
              className: "accent-primary"
            }
          ),
          /* @__PURE__ */ jsxs("span", { className: "font-mono text-sm flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(Shield, { className: "w-3 h-3" }),
            " Sign File (Ed25519)"
          ] })
        ] }),
        sign && /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Private Key (base64)",
            value: privateKeyStr,
            onChange: (e) => setPrivateKeyStr(e.target.value),
            className: "w-full rounded-sm border border-border bg-rail p-2 text-sm outline-none focus:border-primary font-mono text-[11px]"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex justify-end gap-3", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          className: "rounded-sm px-4 py-2 font-mono text-sm text-muted-foreground hover:text-foreground",
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleExport,
          disabled: isExporting || encrypt && !password || sign && !privateKeyStr,
          className: "flex items-center gap-2 rounded-sm bg-primary px-4 py-2 font-mono text-sm uppercase tracking-wider text-primary-foreground hover:opacity-90 disabled:opacity-50",
          children: isExporting ? "Exporting..." : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Download, { className: "w-4 h-4" }),
            " Export"
          ] })
        }
      )
    ] })
  ] }) });
}
function SetupCopilot({ t }) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const askSetupEngineer = async () => {
    setLoading(true);
    setResponse("");
    try {
      const trackState = t.trackWetness > 0.5 ? "wet" : t.trackWetness > 0.1 ? "damp" : "dry";
      const prompt = `You are an expert, professional race engineer in motorsports. 
The driver is currently driving the ${t.car} at ${t.track}.
Here is the current environmental data:
- Live Air Temperature: ${t.liveAirTempC.toFixed(1)}°C
- Live Track Temperature: ${t.liveTrackTempC.toFixed(1)}°C
- Air Density: ${t.airDensity.toFixed(2)} kg/m³
- Wind Speed: ${t.windVel.toFixed(1)} m/s (Direction: ${t.windDir.toFixed(2)} rad)
- Track State: ${trackState}

Based on this specific car, track, and environmental conditions, what setup adjustments should the driver make? Consider aerodynamics, tire pressures, brake ducts, and gearing. Be concise but specific.`;
      const { llmBaseUrl, llmModelId, llmApiKey } = useWorkbench.getState();
      const url = resolveLLMUrl(llmBaseUrl);
      const headers = { "Content-Type": "application/json" };
      if (llmApiKey) {
        headers["Authorization"] = `Bearer ${llmApiKey}`;
      }
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: llmModelId || "local-model",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          stream: true
        })
      });
      if (!res.ok) {
        throw new Error(`Failed to connect to local LLM (${res.status} ${res.statusText}).`);
      }
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((l) => l.trim() !== "");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace("data: ", "");
              if (dataStr === "[DONE]") return;
              try {
                const data = JSON.parse(dataStr);
                const token = data.choices?.[0]?.delta?.content;
                if (token) {
                  setResponse((prev) => (prev || "") + token);
                }
              } catch (e) {
              }
            }
          }
        }
      }
    } catch (e) {
      const { llmBaseUrl } = useWorkbench.getState();
      setResponse(
        "Error asking Setup Copilot: " + e.message + `

Make sure your local LLM server is running at "${llmBaseUrl}" and CORS is enabled (e.g. OLLAMA_ORIGINS="*" for Ollama, or --cors parameter for other systems).`
      );
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "bg-muted/60 backdrop-blur-md rounded-xl p-4 border border-border-strong shadow-2xl mt-4", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
      /* @__PURE__ */ jsx("div", { className: "p-2 bg-blue-500/20 rounded-lg", children: /* @__PURE__ */ jsx(Wrench, { className: "w-5 h-5 text-blue-400" }) }),
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-white tracking-wide", children: "AI Setup Engineer" })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-accent/50 p-3 rounded-lg border border-zinc-700/50 flex flex-col", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground mb-1 flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(Thermometer, { className: "w-3 h-3" }),
          " Air / Track Temp"
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "text-sm font-medium text-white", children: [
          t.liveAirTempC.toFixed(1),
          "°C / ",
          t.liveTrackTempC.toFixed(1),
          "°C"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-accent/50 p-3 rounded-lg border border-zinc-700/50 flex flex-col", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground mb-1 flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(Wind, { className: "w-3 h-3" }),
          " Wind / Aero"
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "text-sm font-medium text-white", children: [
          t.windVel.toFixed(1),
          " m/s | ",
          t.airDensity.toFixed(2),
          " kg/m³"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-accent/50 p-3 rounded-lg border border-zinc-700/50 flex flex-col", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground mb-1 flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(CloudRain, { className: "w-3 h-3" }),
          " Track State"
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-white", children: t.trackWetness > 0.5 ? "Wet" : t.trackWetness > 0.1 ? "Damp" : "Dry" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-accent/50 p-3 rounded-lg border border-zinc-700/50 flex flex-col", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground mb-1 flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(Bot, { className: "w-3 h-3" }),
          " Context"
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "text-sm font-medium text-white truncate", title: t.car, children: [
          t.car,
          " @ ",
          t.track
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: askSetupEngineer,
        disabled: loading,
        className: "w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-lg",
        children: loading ? /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Bot, { className: "w-5 h-5" }),
          /* @__PURE__ */ jsx("span", { children: "Ask AI for Setup Advice" })
        ] })
      }
    ),
    response && /* @__PURE__ */ jsx("div", { className: "mt-4 p-4 bg-background/80 rounded-lg border border-border-strong text-sm text-foreground leading-relaxed font-mono whitespace-pre-wrap max-h-96 overflow-y-auto", children: response })
  ] });
}
const ResizablePanelGroup$1 = ({ className, ...props }) => /* @__PURE__ */ jsx(
  Group$1,
  {
    className: cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className),
    ...props
  }
);
const ResizablePanel = Panel;
const ResizableHandle = ({
  withHandle,
  className,
  ...props
}) => /* @__PURE__ */ jsx(
  Separator,
  {
    className: cn(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
      className
    ),
    ...props,
    children: withHandle && /* @__PURE__ */ jsx("div", { className: "z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border", children: /* @__PURE__ */ jsx(GripVertical, { className: "h-2.5 w-2.5" }) })
  }
);
function calculateScannerCertainty(parsed, channelNames, startTick, endTick) {
  if (endTick <= startTick) return 0.5;
  let sumCertainty = 0;
  let activeChannels = 0;
  channelNames.forEach((name) => {
    const ch = parsed.channels[name];
    if (!ch) return;
    activeChannels++;
    const slice = ch.data.slice(startTick, endTick);
    if (slice.length === 0) return;
    const avg = Array.from(slice).reduce((a, b) => a + b, 0) / slice.length;
    const sqDiff = Array.from(slice).reduce((a, b) => a + Math.pow(b - avg, 2), 0);
    const stdDev = Math.sqrt(sqDiff / slice.length);
    const max = Math.max(...Array.from(slice));
    const min = Math.min(...Array.from(slice));
    const range = max - min;
    let channelCertainty = 0.85;
    if (range > 0 && stdDev > 0) {
      const snr = 20 * Math.log10(range / (stdDev + 1e-3));
      if (snr < 6) {
        channelCertainty = 0.45;
      } else if (snr > 18) {
        channelCertainty = 0.98;
      } else {
        channelCertainty = 0.5 + snr / 18 * 0.48;
      }
    }
    sumCertainty += channelCertainty;
  });
  return activeChannels > 0 ? Number((sumCertainty / activeChannels).toFixed(3)) : 0.82;
}
const DECLARATIVE_RULES = [
  {
    name: "CRITICAL BRAKE LOCKUP",
    classification: "STABILITY",
    category: "thermal",
    severity: "critical",
    channels: ["Brake", "Speed", "SteeringWheelAngle"],
    conditions: [
      { channel: "Brake", operator: ">", value: 0.82 },
      { channel: "Speed", operator: ">", value: 13.8 },
      // >50 km/h
      { channel: "SteeringWheelAngle", operator: ">", value: 0.7 }
      // >40 degrees
    ],
    durationSec: 0.15,
    cornerNumber: 8,
    descriptionTemplate: "Front axle brake pressure exceeded 82% threshold target under heavy deceleration. Wheel speed lockup and front load transfer collapse entry traction footprint."
  },
  {
    name: "DRIVEN AXLE WHEELSPIN",
    classification: "PERFORMANCE",
    category: "inputs",
    severity: "warning",
    channels: ["Throttle", "Speed", "LFspeed", "LRspeed"],
    conditions: [
      { channel: "Throttle", operator: ">", value: 0.7 },
      { channel: "Speed", operator: ">", value: 11.1 },
      // >40 km/h
      { channel: "LFspeed", operator: "mismatch", value: 0.12 }
    ],
    durationSec: 0.15,
    cornerNumber: 3,
    descriptionTemplate: "Driven rear wheel speeds mismatched by more than 12% under heavy exit throttle re-application. Rear footprint slip threshold breached."
  },
  {
    name: "CHASSIS ROTATIONAL COMPRESSION",
    classification: "AERO PLATFORM",
    category: "dynamics",
    severity: "warning",
    channels: ["pitch"],
    conditions: [
      { channel: "pitch", operator: "<", value: -0.018 }
    ],
    durationSec: 0.1,
    cornerNumber: 5,
    descriptionTemplate: "Dynamic ride height pitch collapses forward, triggering splitter bottoming under downforce heave. Diffuser seal compromised transiently."
  },
  {
    name: "ERS DEPLOYMENT SATURATION",
    classification: "HYBRID CORE",
    category: "hybrid",
    severity: "info",
    channels: ["MgukDeploykW"],
    conditions: [
      { channel: "MgukDeploykW", operator: ">", value: 115 }
    ],
    durationSec: 3.5,
    cornerNumber: 11,
    descriptionTemplate: "MGU-K deploy torque remained saturated at peak output (>115 kW). State-of-charge energy reserves declining on straightaway."
  }
];
function evaluateCondition(parsed, cond, tick) {
  const ch = parsed.channels[cond.channel];
  if (!ch) return false;
  const val = ch.data[tick];
  switch (cond.operator) {
    case ">":
      return val > cond.value;
    case "<":
      return val < cond.value;
    case "==":
      return val === cond.value;
    case "!=":
      return val !== cond.value;
    case "mismatch": {
      const lf = parsed.channels["LFspeed"]?.data[tick] ?? 0;
      const lr = parsed.channels["LRspeed"]?.data[tick] ?? 0;
      return Math.abs(lf - lr) > lf * cond.value;
    }
    default:
      return false;
  }
}
function compileAndRunDSL(parsed, rules = DECLARATIVE_RULES) {
  const events = [];
  const sessionTime = parsed.channels["SessionTime"]?.data;
  if (!sessionTime) return events;
  const validLaps = parsed.laps.filter((l) => l.endTick - l.startTick > 100 && l.timeS > 10);
  if (validLaps.length === 0) return events;
  const bestLap = [...validLaps].sort((a, b) => a.timeS - b.timeS)[0];
  const startTick = bestLap.startTick;
  const endTick = bestLap.endTick;
  rules.forEach((rule) => {
    let activeStart = null;
    const occurrences = [];
    for (let t = startTick; t < endTick; t++) {
      const allMet = rule.conditions.every((cond) => evaluateCondition(parsed, cond, t));
      if (allMet) {
        if (activeStart === null) activeStart = t;
      } else {
        if (activeStart !== null) {
          const duration = sessionTime[t] - sessionTime[activeStart];
          if (duration > rule.durationSec) {
            occurrences.push({ start: activeStart, end: t });
          }
          activeStart = null;
        }
      }
    }
    if (activeStart !== null) {
      occurrences.push({ start: activeStart, end: endTick - 1 });
    }
    const clusters = [];
    occurrences.forEach((occ) => {
      if (clusters.length === 0) {
        clusters.push([occ]);
      } else {
        const lastCluster = clusters[clusters.length - 1];
        const lastOcc = lastCluster[lastCluster.length - 1];
        const gap = sessionTime[occ.start] - sessionTime[lastOcc.end];
        if (gap < 4.5) {
          lastCluster.push(occ);
        } else {
          clusters.push([occ]);
        }
      }
    });
    clusters.forEach((cluster) => {
      const firstOcc = cluster[0];
      const count = cluster.length;
      const tSec = sessionTime[firstOcc.start];
      const label = count > 1 ? `REPEATED ${rule.name}` : rule.name;
      const textPrefix = count > 1 ? `[${rule.classification} INSIGHT] Repeated events (${count} occurrences) flagged. ` : `[${rule.classification} CRITICAL] `;
      const corner = tSec < 20 ? 8 : tSec < 45 ? 11 : tSec < 60 ? 3 : 5;
      const certainty = calculateScannerCertainty(
        parsed,
        rule.channels,
        firstOcc.start,
        cluster[cluster.length - 1].end
      );
      events.push({
        timestampSec: Number(tSec.toFixed(2)),
        label,
        category: rule.category,
        severity: rule.severity,
        description: `${textPrefix}${rule.descriptionTemplate}`,
        associatedChannels: rule.channels,
        cornerNumber: corner,
        metadata: { confidence: certainty }
      });
    });
  });
  return events.sort((a, b) => a.timestampSec - b.timestampSec);
}
function scanTelemetrySession(parsed) {
  return compileAndRunDSL(parsed);
}
const BRIDGE_BASE = "http://localhost:3001";
async function bridgePost(path, body) {
  try {
    const res = await fetch(`${BRIDGE_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5e3)
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
async function saveEvents(events) {
  const result = await bridgePost("/api/events", { events });
  return !!result?.success;
}
const CHANNEL_CATALOG = [
  // Driver inputs
  { name: "Throttle", group: "Driver Inputs", desc: "Throttle pedal 0–1", essential: true },
  { name: "Brake", group: "Driver Inputs", desc: "Brake pedal 0–1", essential: true },
  { name: "Clutch", group: "Driver Inputs", desc: "Clutch pedal 0–1 (1 = engaged)" },
  {
    name: "SteeringWheelAngle",
    group: "Driver Inputs",
    desc: "Steering angle, radians (+ left)",
    essential: true
  },
  { name: "SteeringWheelAngleMax", group: "Driver Inputs", desc: "Max steering lock (rad)" },
  { name: "SteeringWheelTorque", group: "Driver Inputs", desc: "Wheel torque feedback (Nm)" },
  { name: "SteeringWheelPctTorque", group: "Driver Inputs", desc: "Wheel torque % of max" },
  {
    name: "SteeringWheelPctTorqueSign",
    group: "Driver Inputs",
    desc: "Signed torque % (sign = direction)"
  },
  { name: "SteeringWheelPctIntensity", group: "Driver Inputs", desc: "FFB intensity %" },
  { name: "SteeringWheelPctSmoothing", group: "Driver Inputs", desc: "FFB smoothing %" },
  { name: "SteeringWheelPctDamper", group: "Driver Inputs", desc: "FFB damper %" },
  { name: "SteeringWheelLimiter", group: "Driver Inputs", desc: "Wheel torque clipping flag" },
  { name: "SteeringWheelMaxForceNm", group: "Driver Inputs", desc: "FFB strength setting (Nm)" },
  { name: "SteeringWheelPeakForceNm", group: "Driver Inputs", desc: "Peak torque seen (Nm)" },
  { name: "SteeringWheelUseLinear", group: "Driver Inputs", desc: "Linear FFB mode flag" },
  { name: "HandbrakeRaw", group: "Driver Inputs", desc: "Raw handbrake input 0–1" },
  { name: "BrakeABSactive", group: "Driver Inputs", desc: "ABS active flag" },
  { name: "ThrottleRaw", group: "Driver Inputs", desc: "Raw throttle input 0–1" },
  { name: "ClutchRaw", group: "Driver Inputs", desc: "Raw clutch input 0–1" },
  { name: "dcStarter", group: "Driver Inputs", desc: "Starter button" },
  { name: "dcPitSpeedLimiterToggle", group: "Driver Inputs", desc: "Pit speed limiter toggle" },
  { name: "dcLaunchRPM", group: "Driver Inputs", desc: "Launch RPM setting" },
  { name: "dcTractionControl", group: "Driver Inputs", desc: "Traction control setting" },
  { name: "dcTractionControl2", group: "Driver Inputs", desc: "Traction control 2 setting" },
  { name: "dcABS", group: "Driver Inputs", desc: "ABS setting" },
  { name: "dcAntiRollFront", group: "Driver Inputs", desc: "Front anti-roll bar setting" },
  { name: "dcAntiRollRear", group: "Driver Inputs", desc: "Rear anti-roll bar setting" },
  { name: "dcDiffEntry", group: "Driver Inputs", desc: "Diff entry setting" },
  { name: "dcDiffMiddle", group: "Driver Inputs", desc: "Diff middle setting" },
  { name: "dcDiffExit", group: "Driver Inputs", desc: "Diff exit setting" },
  { name: "dcThrottleShape", group: "Driver Inputs", desc: "Throttle map setting" },
  { name: "dcEnginePower", group: "Driver Inputs", desc: "Engine power map" },
  { name: "dcMGUKDeployMode", group: "Driver Inputs", desc: "MGU-K deploy mode" },
  { name: "dcMGUKDeployFixed", group: "Driver Inputs", desc: "MGU-K fixed deploy" },
  { name: "dcMGUKRegenGain", group: "Driver Inputs", desc: "MGU-K regen gain" },
  // Vehicle
  { name: "Speed", group: "Vehicle", desc: "Ground speed (m/s)", essential: true },
  { name: "RPM", group: "Vehicle", desc: "Engine RPM", essential: true },
  { name: "Gear", group: "Vehicle", desc: "Current gear", essential: true },
  { name: "VelocityX", group: "Vehicle", desc: "Body-frame longitudinal velocity (m/s)" },
  { name: "VelocityY", group: "Vehicle", desc: "Body-frame lateral velocity (m/s)" },
  { name: "VelocityZ", group: "Vehicle", desc: "Body-frame vertical velocity (m/s)" },
  { name: "YawRate", group: "Vehicle", desc: "Yaw rate (rad/s)" },
  { name: "RollRate", group: "Vehicle", desc: "Roll rate (rad/s)" },
  { name: "PitchRate", group: "Vehicle", desc: "Pitch rate (rad/s)" },
  { name: "LatAccel", group: "Vehicle", desc: "Lateral g (corner load)", essential: true },
  { name: "LongAccel", group: "Vehicle", desc: "Longitudinal g (brake/accel)", essential: true },
  { name: "VertAccel", group: "Vehicle", desc: "Vertical g (bumps/curbs)" },
  { name: "Roll", group: "Vehicle", desc: "Body roll angle (rad)" },
  { name: "Pitch", group: "Vehicle", desc: "Body pitch angle (rad)" },
  { name: "Yaw", group: "Vehicle", desc: "Yaw heading (rad)" },
  { name: "YawNorth", group: "Vehicle", desc: "Heading vs north (rad)" },
  { name: "Alt", group: "Vehicle", desc: "Altitude (m)" },
  { name: "Lat", group: "Vehicle", desc: "Latitude (deg)" },
  { name: "Lon", group: "Vehicle", desc: "Longitude (deg)" },
  { name: "ShiftIndicatorPct", group: "Vehicle", desc: "Shift light indicator (0–1)" },
  { name: "ShiftPowerPct", group: "Vehicle", desc: "Power band % at current RPM" },
  { name: "ShiftGrindRPM", group: "Vehicle", desc: "RPM at which gear grinds" },
  // Session / lap
  { name: "Lap", group: "Session", desc: "Current lap number", essential: true },
  { name: "LapDistPct", group: "Session", desc: "Lap progress 0–1", essential: true },
  { name: "LapDist", group: "Session", desc: "Lap distance (m)" },
  { name: "LapCurrentLapTime", group: "Session", desc: "Elapsed time on current lap (s)" },
  { name: "LapLastLapTime", group: "Session", desc: "Previous completed lap time (s)" },
  { name: "LapBestLapTime", group: "Session", desc: "Session best lap time (s)" },
  { name: "LapDeltaToBestLap", group: "Session", desc: "Δ vs personal best lap (s)" },
  { name: "LapDeltaToBestLap_DD", group: "Session", desc: "Δ-best derivative (s/s)" },
  { name: "LapDeltaToOptimalLap", group: "Session", desc: "Δ vs optimal lap (s)" },
  { name: "LapDeltaToSessionBestLap", group: "Session", desc: "Δ vs session best (s)" },
  { name: "LapDeltaToSessionLastlLap", group: "Session", desc: "Δ vs session last lap (s)" },
  { name: "LapDeltaToSessionOptimalLap", group: "Session", desc: "Δ vs session optimal (s)" },
  { name: "LapLasNLapSeq", group: "Session", desc: "Last N laps sequence id" },
  { name: "LapLastNLapTime", group: "Session", desc: "Last N-lap average (s)" },
  { name: "LapBestNLapLap", group: "Session", desc: "Lap of best N-lap stint" },
  { name: "LapBestNLapTime", group: "Session", desc: "Best N-lap average (s)" },
  { name: "LapCompleted", group: "Session", desc: "Laps completed counter" },
  { name: "RaceLaps", group: "Session", desc: "Race laps counter" },
  { name: "SessionTime", group: "Session", desc: "Session clock (s)" },
  { name: "SessionTick", group: "Session", desc: "Session tick counter" },
  { name: "SessionNum", group: "Session", desc: "Session number" },
  { name: "SessionState", group: "Session", desc: "Session state enum" },
  { name: "SessionUniqueID", group: "Session", desc: "Unique session id" },
  { name: "SessionFlags", group: "Session", desc: "Active session flags bitmap" },
  { name: "SessionLapsRemain", group: "Session", desc: "Laps remaining" },
  { name: "SessionLapsRemainEx", group: "Session", desc: "Laps remaining (incl. current)" },
  { name: "SessionLapsTotal", group: "Session", desc: "Total laps in session" },
  { name: "SessionTimeRemain", group: "Session", desc: "Time remaining (s)" },
  { name: "SessionTimeTotal", group: "Session", desc: "Total session time (s)" },
  { name: "SessionTimeOfDay", group: "Session", desc: "Sim time of day (s)" },
  { name: "PlayerCarMyIncidentCount", group: "Session", desc: "Driver's incident count" },
  { name: "PlayerCarTeamIncidentCount", group: "Session", desc: "Team incident count" },
  { name: "PlayerCarDriverIncidentCount", group: "Session", desc: "Current driver incident count" },
  { name: "PlayerCarPosition", group: "Session", desc: "Race position" },
  { name: "PlayerCarClassPosition", group: "Session", desc: "Class position" },
  { name: "PlayerCarPowerAdjust", group: "Session", desc: "BoP power adjust %" },
  { name: "PlayerCarWeightPenalty", group: "Session", desc: "BoP weight penalty (kg)" },
  { name: "PlayerCarTowTime", group: "Session", desc: "Tow time remaining (s)" },
  { name: "OnPitRoad", group: "Session", desc: "On pit road flag" },
  { name: "PitsOpen", group: "Session", desc: "Pit lane open flag" },
  { name: "PitstopActive", group: "Session", desc: "Pit stop in progress" },
  { name: "PitRepairLeft", group: "Session", desc: "Repair time left (s)" },
  { name: "PitOptRepairLeft", group: "Session", desc: "Optional repair time left (s)" },
  { name: "PitSvFlags", group: "Session", desc: "Pit service flags bitmap" },
  { name: "PitSvFuel", group: "Session", desc: "Pit service fuel target (L)" },
  { name: "PitSvLFP", group: "Session", desc: "Pit service LF pressure (kPa)" },
  { name: "PitSvRFP", group: "Session", desc: "Pit service RF pressure (kPa)" },
  { name: "PitSvLRP", group: "Session", desc: "Pit service LR pressure (kPa)" },
  { name: "PitSvRRP", group: "Session", desc: "Pit service RR pressure (kPa)" },
  { name: "IsOnTrack", group: "Session", desc: "Driver on-track flag" },
  { name: "IsOnTrackCar", group: "Session", desc: "Car on-track flag" },
  { name: "IsInGarage", group: "Session", desc: "In garage flag" },
  { name: "IsReplayPlaying", group: "Session", desc: "Replay active flag" },
  { name: "ReplayFrameNum", group: "Session", desc: "Replay frame index" },
  { name: "ReplayFrameNumEnd", group: "Session", desc: "Replay last frame index" },
  { name: "ReplayPlaySpeed", group: "Session", desc: "Replay playback speed" },
  { name: "ReplayPlaySlowMotion", group: "Session", desc: "Replay slow-mo flag" },
  { name: "ReplaySessionNum", group: "Session", desc: "Replay session id" },
  { name: "ReplaySessionTime", group: "Session", desc: "Replay session time (s)" },
  // Engine / fuel
  { name: "FuelLevel", group: "Engine", desc: "Fuel remaining (L)", essential: true },
  { name: "FuelLevelPct", group: "Engine", desc: "Fuel remaining % of tank" },
  { name: "FuelUsePerHour", group: "Engine", desc: "Instantaneous fuel use (kg/hr)" },
  { name: "FuelPress", group: "Engine", desc: "Fuel rail pressure (bar)" },
  { name: "OilTemp", group: "Engine", desc: "Engine oil temp (°C)" },
  { name: "OilPress", group: "Engine", desc: "Engine oil pressure (bar)" },
  { name: "OilLevel", group: "Engine", desc: "Engine oil level (L)" },
  { name: "WaterTemp", group: "Engine", desc: "Coolant temp (°C)" },
  { name: "WaterLevel", group: "Engine", desc: "Coolant level (L)" },
  { name: "ManifoldPress", group: "Engine", desc: "Intake manifold pressure (bar)" },
  { name: "Voltage", group: "Engine", desc: "Battery voltage (V)" },
  { name: "EngineWarnings", group: "Engine", desc: "Engine warning flag bitmap" },
  { name: "PowerMGU_K", group: "Engine", desc: "MGU-K power (W)" },
  { name: "PowerMGU_H", group: "Engine", desc: "MGU-H power (W)" },
  { name: "EnergyBatteryToMGU_KLap", group: "Engine", desc: "Battery→MGU-K energy this lap (J)" },
  { name: "EnergyERSBatteryPct", group: "Engine", desc: "ERS battery state of charge %" },
  { name: "DRS_Status", group: "Engine", desc: "DRS state enum" },
  { name: "P2P_Count", group: "Engine", desc: "Push-to-pass uses left" },
  { name: "P2P_Status", group: "Engine", desc: "Push-to-pass active" },
  // Tyres
  { name: "LFtempCM", group: "Tyres", desc: "LF carcass middle temp (°C)" },
  { name: "LFtempCL", group: "Tyres", desc: "LF carcass inner temp (°C)" },
  { name: "LFtempCR", group: "Tyres", desc: "LF carcass outer temp (°C)" },
  { name: "RFtempCM", group: "Tyres", desc: "RF carcass middle temp (°C)" },
  { name: "RFtempCL", group: "Tyres", desc: "RF carcass inner temp (°C)" },
  { name: "RFtempCR", group: "Tyres", desc: "RF carcass outer temp (°C)" },
  { name: "LRtempCM", group: "Tyres", desc: "LR carcass middle temp (°C)" },
  { name: "LRtempCL", group: "Tyres", desc: "LR carcass inner temp (°C)" },
  { name: "LRtempCR", group: "Tyres", desc: "LR carcass outer temp (°C)" },
  { name: "RRtempCM", group: "Tyres", desc: "RR carcass middle temp (°C)" },
  { name: "RRtempCL", group: "Tyres", desc: "RR carcass inner temp (°C)" },
  { name: "RRtempCR", group: "Tyres", desc: "RR carcass outer temp (°C)" },
  { name: "LFpressure", group: "Tyres", desc: "LF cold pressure (kPa)" },
  { name: "RFpressure", group: "Tyres", desc: "RF cold pressure (kPa)" },
  { name: "LRpressure", group: "Tyres", desc: "LR cold pressure (kPa)" },
  { name: "RRpressure", group: "Tyres", desc: "RR cold pressure (kPa)" },
  { name: "LFwearM", group: "Tyres", desc: "LF tread wear middle %" },
  { name: "LFwearL", group: "Tyres", desc: "LF tread wear inner %" },
  { name: "LFwearR", group: "Tyres", desc: "LF tread wear outer %" },
  { name: "RFwearM", group: "Tyres", desc: "RF tread wear middle %" },
  { name: "RFwearL", group: "Tyres", desc: "RF tread wear inner %" },
  { name: "RFwearR", group: "Tyres", desc: "RF tread wear outer %" },
  { name: "LRwearM", group: "Tyres", desc: "LR tread wear middle %" },
  { name: "LRwearL", group: "Tyres", desc: "LR tread wear inner %" },
  { name: "LRwearR", group: "Tyres", desc: "LR tread wear outer %" },
  { name: "RRwearM", group: "Tyres", desc: "RR tread wear middle %" },
  { name: "RRwearL", group: "Tyres", desc: "RR tread wear inner %" },
  { name: "RRwearR", group: "Tyres", desc: "RR tread wear outer %" },
  { name: "LFspeed", group: "Tyres", desc: "LF wheel ground speed (m/s)" },
  { name: "RFspeed", group: "Tyres", desc: "RF wheel ground speed (m/s)" },
  { name: "LRspeed", group: "Tyres", desc: "LR wheel ground speed (m/s)" },
  { name: "RRspeed", group: "Tyres", desc: "RR wheel ground speed (m/s)" },
  // Brakes
  { name: "BrakeRaw", group: "Brakes", desc: "Raw brake input 0–1" },
  { name: "dcBrakeBias", group: "Brakes", desc: "Brake bias % front" },
  { name: "LFbrakeLinePress", group: "Brakes", desc: "LF brake line pressure (bar)" },
  { name: "RFbrakeLinePress", group: "Brakes", desc: "RF brake line pressure (bar)" },
  { name: "LRbrakeLinePress", group: "Brakes", desc: "LR brake line pressure (bar)" },
  { name: "RRbrakeLinePress", group: "Brakes", desc: "RR brake line pressure (bar)" },
  { name: "LFbrakeTemp", group: "Brakes", desc: "LF brake disc temp (°C)" },
  { name: "RFbrakeTemp", group: "Brakes", desc: "RF brake disc temp (°C)" },
  { name: "LRbrakeTemp", group: "Brakes", desc: "LR brake disc temp (°C)" },
  { name: "RRbrakeTemp", group: "Brakes", desc: "RR brake disc temp (°C)" },
  // Suspension
  { name: "LFshockDefl", group: "Suspension", desc: "LF damper deflection (m)" },
  { name: "RFshockDefl", group: "Suspension", desc: "RF damper deflection (m)" },
  { name: "LRshockDefl", group: "Suspension", desc: "LR damper deflection (m)" },
  { name: "RRshockDefl", group: "Suspension", desc: "RR damper deflection (m)" },
  { name: "LFshockVel", group: "Suspension", desc: "LF damper velocity (m/s)" },
  { name: "RFshockVel", group: "Suspension", desc: "RF damper velocity (m/s)" },
  { name: "LRshockVel", group: "Suspension", desc: "LR damper velocity (m/s)" },
  { name: "RRshockVel", group: "Suspension", desc: "RR damper velocity (m/s)" },
  { name: "LFrideHeight", group: "Suspension", desc: "LF ride height (m)" },
  { name: "RFrideHeight", group: "Suspension", desc: "RF ride height (m)" },
  { name: "LRrideHeight", group: "Suspension", desc: "LR ride height (m)" },
  { name: "RRrideHeight", group: "Suspension", desc: "RR ride height (m)" },
  { name: "CFshockDefl", group: "Suspension", desc: "Centre damper deflection (m)" },
  { name: "CRshockDefl", group: "Suspension", desc: "Centre rear damper deflection (m)" },
  { name: "LFshockDefl_ST", group: "Suspension", desc: "LF damper defl (sub-tick)" },
  { name: "RFshockDefl_ST", group: "Suspension", desc: "RF damper defl (sub-tick)" },
  // Environment
  { name: "TrackTempCrew", group: "Environment", desc: "Track surface temp (°C)" },
  { name: "AirTemp", group: "Environment", desc: "Ambient air temp (°C)" },
  { name: "AirPressure", group: "Environment", desc: "Ambient air pressure (Hg)" },
  { name: "AirDensity", group: "Environment", desc: "Air density (kg/m³)" },
  { name: "RelativeHumidity", group: "Environment", desc: "Relative humidity (0–1)" },
  { name: "WindVel", group: "Environment", desc: "Wind speed (m/s)" },
  { name: "WindDir", group: "Environment", desc: "Wind direction (rad)" },
  { name: "Skies", group: "Environment", desc: "Sky cover (0=clear, 3=overcast)" },
  { name: "FogLevel", group: "Environment", desc: "Fog density (0–1)" },
  { name: "TrackWetness", group: "Environment", desc: "Track wetness enum" },
  { name: "Precipitation", group: "Environment", desc: "Precipitation rate" },
  { name: "SolarAltitude", group: "Environment", desc: "Sun altitude (rad)" },
  { name: "SolarAzimuth", group: "Environment", desc: "Sun azimuth (rad)" }
];
const BY_NAME = new Map(CHANNEL_CATALOG.map((c) => [c.name, c]));
function catalogEntry(name) {
  return BY_NAME.get(name) ?? null;
}
const ESSENTIAL_CHANNELS = CHANNEL_CATALOG.filter((c) => c.essential).map(
  (c) => c.name
);
const GROUP_DESCRIPTIONS = {
  Essentials: "Pinned high-signal channels — start here.",
  "Driver Inputs": "Pedals, wheel, FFB, in-car adjusters.",
  Vehicle: "Body motion: speed, accel, attitude, GPS.",
  Session: "Lap, session clock, flags, replay, pit state.",
  Engine: "Powertrain: fuel, oil, water, ERS, DRS.",
  Tyres: "Per-corner temps, pressures, wear, wheel speeds.",
  Brakes: "Pedal, bias, line pressures, disc temps.",
  Suspension: "Damper deflection/velocity, ride heights.",
  Environment: "Track + weather conditions."
};
function ChannelBrowser({ parsed }) {
  const { selectedChannels, toggleChannel, setChannels, cursorTick } = useWorkbench();
  const [q, setQ] = useState("");
  const [essentialsOnly, setEssentialsOnly] = useState(false);
  const [open, setOpen] = useState({
    "Driver Inputs": true,
    Vehicle: true
  });
  const [traceMode, setTraceMode] = useState({});
  const windowFrames = useMemo(() => {
    return Math.max(120, Math.floor((parsed.meta.tickRate || 60) * 3.5));
  }, [parsed.meta.tickRate]);
  const grouped = useMemo(() => {
    const groups = {};
    const matches = (n) => !q || n.toLowerCase().includes(q.toLowerCase());
    const essentials = ESSENTIAL_CHANNELS.filter((n) => parsed.channels[n] && matches(n));
    if (essentials.length) groups["Essentials"] = essentials;
    if (essentialsOnly) {
      return groups;
    }
    for (const name of parsed.channelNames) {
      if (!matches(name)) continue;
      const cat = catalogEntry(name);
      const g = cat?.group ?? parsed.channels[name].group;
      (groups[g] ??= []).push(name);
    }
    const ordered = {};
    if (groups["Essentials"]) ordered["Essentials"] = groups["Essentials"];
    Object.keys(groups).filter((g) => g !== "Essentials").sort().forEach((g) => ordered[g] = groups[g]);
    return ordered;
  }, [parsed, q, essentialsOnly]);
  const totalShown = useMemo(
    () => Object.values(grouped).reduce((a, b) => a + b.length, 0),
    [grouped]
  );
  const toggleGroupAll = (items) => {
    const allOn = items.every((n) => selectedChannels.includes(n));
    if (allOn) {
      setChannels(selectedChannels.filter((n) => !items.includes(n)));
    } else {
      const next = [...selectedChannels];
      for (const n of items) if (!next.includes(n)) next.push(n);
      setChannels(next);
    }
  };
  return /* @__PURE__ */ jsxs("aside", { className: "hairline-r flex h-full w-72 flex-col bg-rail", children: [
    /* @__PURE__ */ jsxs("div", { className: "hairline-b p-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            value: q,
            onChange: (e) => setQ(e.target.value),
            placeholder: `Search ${parsed.channelNames.length} channels…`,
            className: "w-full rounded-sm border border-border bg-panel py-1.5 pl-7 pr-2 text-xs outline-none focus:border-primary"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground", children: [
        /* @__PURE__ */ jsxs("span", { children: [
          totalShown,
          " shown · ",
          selectedChannels.length,
          " on"
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setEssentialsOnly((v) => !v),
            className: `flex items-center gap-1 rounded-sm border px-1.5 py-0.5 ${essentialsOnly ? "border-primary text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`,
            title: "Show only ATLAS-style essentials",
            children: [
              /* @__PURE__ */ jsx(Star, { className: "h-2.5 w-2.5" }),
              " Essentials"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto font-mono text-[11px]", children: [
      Object.entries(grouped).map(([g, items]) => {
        const isOpen = open[g] ?? !!q;
        const onCount = items.filter((n) => selectedChannels.includes(n)).length;
        const allOn = onCount === items.length && items.length > 0;
        return /* @__PURE__ */ jsxs("div", { className: "hairline-b", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex w-full items-center gap-1 px-2 py-1.5 uppercase tracking-wider text-muted-foreground hover:bg-accent", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setOpen({ ...open, [g]: !isOpen }),
                className: "flex flex-1 items-center gap-1 text-left",
                title: GROUP_DESCRIPTIONS[g] ?? g,
                children: [
                  isOpen ? /* @__PURE__ */ jsx(ChevronDown, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3" }),
                  g,
                  /* @__PURE__ */ jsx("span", { className: "ml-1 text-[10px] normal-case tracking-normal text-muted-foreground/70", children: onCount > 0 ? `${onCount}/${items.length}` : items.length })
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => toggleGroupAll(items),
                className: "rounded-sm p-0.5 text-muted-foreground hover:text-foreground",
                title: allOn ? "Hide all in group" : "Show all in group",
                children: allOn ? /* @__PURE__ */ jsx(EyeOff, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(Eye, { className: "h-3 w-3" })
              }
            )
          ] }),
          isOpen && GROUP_DESCRIPTIONS[g] && /* @__PURE__ */ jsx("div", { className: "px-2 pb-1 text-[10px] normal-case tracking-normal text-muted-foreground/70", children: GROUP_DESCRIPTIONS[g] }),
          isOpen && /* @__PURE__ */ jsx("ul", { children: items.map((name) => {
            const ch = parsed.channels[name];
            const sel = selectedChannels.includes(name);
            const v = ch.data[cursorTick] ?? 0;
            const cat = catalogEntry(name);
            return /* @__PURE__ */ jsxs("li", { className: "flex items-center w-full group", children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => {
                    toggleChannel(name);
                    window.dispatchEvent(new CustomEvent("pitwall-contextual-channel", { detail: { channel: name } }));
                  },
                  title: cat?.desc ?? ch.desc ?? name,
                  className: `flex flex-1 items-center gap-2 px-2 py-1 text-left hover:bg-accent group/btn ${sel ? "bg-accent/60" : ""}`,
                  children: [
                    /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: "inline-block h-2 w-2 rounded-full",
                        style: {
                          background: sel ? colorForChannel(name) : "transparent",
                          outline: "1px solid var(--border-strong)"
                        }
                      }
                    ),
                    /* @__PURE__ */ jsx("span", { className: "truncate group-hover/btn:text-zinc-300 transition-colors", children: name })
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "ml-auto flex items-center shrink-0 cursor-pointer pl-2 hover:bg-zinc-800/50 rounded transition-colors group/val",
                  onClick: (e) => {
                    e.stopPropagation();
                    setTraceMode((m) => ({ ...m, [name]: !m[name] }));
                  },
                  title: `Click to show ${traceMode[name] ? "RAW" : "TRACE"}`,
                  children: traceMode[name] ? /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsx(
                      MiniTrace,
                      {
                        values: Array.from(
                          ch.data.slice(
                            Math.max(0, cursorTick - windowFrames),
                            cursorTick + 1
                          )
                        ),
                        color: colorForChannel(name)
                      }
                    ),
                    /* @__PURE__ */ jsx("span", { className: "text-[7px] uppercase tracking-wider text-zinc-600 opacity-0 group-hover/val:opacity-100 transition-opacity select-none", children: "trc" })
                  ] }) : /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxs("span", { className: "tabular-nums text-muted-foreground w-16 text-right", children: [
                      Number.isFinite(v) ? v.toFixed(2) : "—",
                      ch.unit ? /* @__PURE__ */ jsx("span", { className: "text-[9px] text-zinc-600 ml-0.5", children: ch.unit }) : ""
                    ] }),
                    /* @__PURE__ */ jsx("span", { className: "text-[7px] uppercase tracking-wider text-zinc-600 opacity-0 group-hover/val:opacity-100 transition-opacity select-none w-4", children: "raw" })
                  ] })
                }
              )
            ] }, name);
          }) })
        ] }, g);
      }),
      totalShown === 0 && /* @__PURE__ */ jsx("div", { className: "px-3 py-6 text-center text-[11px] text-muted-foreground", children: "No channels match." })
    ] })
  ] });
}
function resolveColor(varName) {
  const probe = document.createElement("div");
  probe.style.color = colorForChannel(varName);
  document.body.appendChild(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c;
}
function StackedTraces({ parsed }) {
  const { selectedChannels, cursorTick, setCursorTick, refLap, cmpLap } = useWorkbench();
  const containerRef = useRef(null);
  const plotsRef = useRef([]);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = "";
    plotsRef.current.forEach((p) => p.destroy());
    plotsRef.current = [];
    const sessionTime = parsed.channels["SessionTime"]?.data;
    if (!sessionTime) return;
    const refLapObj = refLap != null ? parsed.laps.find((l) => l.lap === refLap) : null;
    const cmpLapObj = cmpLap != null ? parsed.laps.find((l) => l.lap === cmpLap) : null;
    let from = 0, to = sessionTime.length - 1;
    if (refLapObj) {
      from = refLapObj.startTick;
      to = refLapObj.endTick;
    }
    const xs = new Float64Array(to - from + 1);
    for (let i = 0; i < xs.length; i++) xs[i] = sessionTime[from + i] - sessionTime[from];
    selectedChannels.forEach((name) => {
      const ch = parsed.channels[name];
      if (!ch) return;
      const ys = new Float64Array(xs.length);
      for (let i = 0; i < xs.length; i++) ys[i] = ch.data[from + i];
      const series = [
        {},
        {
          label: name,
          stroke: resolveColor(name),
          width: 1.25,
          points: { show: false }
        }
      ];
      const data = [Array.from(xs), Array.from(ys)];
      if (cmpLapObj && cmpLapObj.lap !== refLapObj?.lap) {
        const cmpLen = Math.min(xs.length, cmpLapObj.endTick - cmpLapObj.startTick + 1);
        const ys2 = new Float64Array(xs.length);
        for (let i = 0; i < xs.length; i++) {
          ys2[i] = i < cmpLen ? ch.data[cmpLapObj.startTick + i] : NaN;
        }
        series.push({
          label: `${name} (cmp)`,
          stroke: resolveColor(name),
          width: 1,
          dash: [4, 3],
          points: { show: false }
        });
        data.push(Array.from(ys2));
      }
      const wrap = document.createElement("div");
      wrap.className = "hairline-b bg-panel";
      container.appendChild(wrap);
      const opts = {
        width: container.clientWidth,
        height: 110,
        padding: [6, 12, 6, 6],
        cursor: {
          drag: { x: false, y: false },
          sync: { key: "wb", setSeries: false }
        },
        legend: { show: false },
        scales: { x: { time: false } },
        axes: [
          {
            stroke: "rgba(180,190,200,0.5)",
            grid: { stroke: "rgba(120,130,140,0.12)", width: 1 },
            ticks: { stroke: "rgba(120,130,140,0.2)" },
            font: "10px JetBrains Mono, monospace",
            size: 22
          },
          {
            stroke: "rgba(180,190,200,0.5)",
            grid: { stroke: "rgba(120,130,140,0.1)", width: 1 },
            ticks: { stroke: "rgba(120,130,140,0.2)" },
            font: "10px JetBrains Mono, monospace",
            size: 50
          }
        ],
        series,
        hooks: {
          draw: [
            (u) => {
              const ctx = u.ctx;
              const sessionTime2 = parsed.channels["SessionTime"]?.data;
              if (!sessionTime2) return;
              const valData = parsed.channels[name]?.data;
              if (!valData) return;
              let shadeStart = null;
              let shadeType = null;
              const getShadeColorAndLabel = (type) => {
                switch (type) {
                  case "lockup":
                    return { color: "rgba(255, 77, 77, 0.2)", border: "#FF4D4D", label: "LOCKUP DETECTED" };
                  case "threshold":
                    return { color: "rgba(255, 184, 0, 0.12)", border: "#FFB800", label: "THRESHOLD ZONE" };
                  case "wheelspin":
                    return { color: "rgba(245, 158, 11, 0.15)", border: "#F59E0B", label: "WHEELSPIN REGION" };
                  case "bottoming":
                    return { color: "rgba(139, 92, 246, 0.15)", border: "#8B5CF6", label: "CHASSIS REB COMPRESSION" };
                  case "hybrid_deploy":
                    return { color: "rgba(139, 92, 246, 0.08)", border: "#8B5CF6", label: "MGU-K DEPLOY" };
                  case "hybrid_regen":
                    return { color: "rgba(0, 209, 127, 0.08)", border: "#00D17F", label: "MGU-K REGEN" };
                  default:
                    return { color: "rgba(0,0,0,0)", border: "transparent", label: "" };
                }
              };
              const drawZone = (startIdx, endIdx, type) => {
                const startX = Math.round(u.valToPos(sessionTime2[from + startIdx] - sessionTime2[from], "x"));
                const endX = Math.round(u.valToPos(sessionTime2[from + endIdx] - sessionTime2[from], "x"));
                const { color, border, label } = getShadeColorAndLabel(type);
                ctx.fillStyle = color;
                ctx.fillRect(startX, u.bbox.top, endX - startX, u.bbox.height);
                ctx.strokeStyle = border;
                ctx.lineWidth = 1.25;
                ctx.beginPath();
                ctx.moveTo(startX, u.bbox.top);
                ctx.lineTo(startX, u.bbox.top + u.bbox.height);
                ctx.moveTo(endX, u.bbox.top);
                ctx.lineTo(endX, u.bbox.top + u.bbox.height);
                ctx.stroke();
                ctx.fillStyle = border;
                ctx.font = "bold 8px IBM Plex Sans, monospace";
                ctx.fillText(label, startX + 4, u.bbox.top + 10);
              };
              for (let i = 0; i < xs.length; i++) {
                const tick = from + i;
                let activeShade = null;
                if (name === "Brake" || name.toLowerCase().includes("brakelinepress")) {
                  const brakeVal = parsed.channels["Brake"]?.data[tick] ?? 0;
                  const steering = parsed.channels["SteeringWheelAngle"]?.data[tick] ?? 0;
                  if (brakeVal > 0.82 && Math.abs(steering * 57.3) > 40) {
                    activeShade = "lockup";
                  } else if (brakeVal > 0.8) {
                    activeShade = "threshold";
                  }
                } else if (name === "Speed" || name.toLowerCase().includes("wheel") || name.toLowerCase().includes("speed")) {
                  const lfSpeed = parsed.channels["LFspeed"]?.data[tick] ?? 0;
                  const lrSpeed = parsed.channels["LRspeed"]?.data[tick] ?? 0;
                  const throttle = parsed.channels["Throttle"]?.data[tick] ?? 0;
                  if (throttle > 0.8 && Math.abs(lfSpeed - lrSpeed) > lfSpeed * 0.12) {
                    activeShade = "wheelspin";
                  }
                } else if (name.toLowerCase().includes("ers") || name.toLowerCase().includes("mgu") || name === "EnergyStorePct" || name === "EnergyStoreTemp") {
                  const deploy = parsed.channels["MgukDeploykW"]?.data[tick] ?? 0;
                  const regen = parsed.channels["MgukRegenkW"]?.data[tick] ?? 0;
                  if (deploy > 105) {
                    activeShade = "hybrid_deploy";
                  } else if (regen > 105) {
                    activeShade = "hybrid_regen";
                  }
                } else if (name.toLowerCase().includes("ride") || name.toLowerCase().includes("damper") || name === "pitch" || name.toLowerCase().includes("accel")) {
                  const pitchVal = parsed.channels["pitch"]?.data[tick] ?? 0;
                  if (pitchVal < -0.018) {
                    activeShade = "bottoming";
                  }
                }
                if (activeShade !== shadeType) {
                  if (shadeStart !== null && shadeType) {
                    drawZone(shadeStart, i - 1, shadeType);
                  }
                  shadeStart = activeShade ? i : null;
                  shadeType = activeShade;
                }
              }
              if (shadeStart !== null && shadeType) {
                drawZone(shadeStart, xs.length - 1, shadeType);
              }
              const events = useTelemetryRuntimeStore.getState().events;
              events.forEach((ev) => {
                const eventX = Math.round(u.valToPos(ev.timestampSec - sessionTime2[from], "x"));
                if (eventX >= u.bbox.left && eventX <= u.bbox.left + u.bbox.width) {
                  ctx.strokeStyle = ev.severity === "critical" ? "#FF4D4D" : ev.severity === "warning" ? "#FFB800" : "#3B82F6";
                  ctx.lineWidth = 1;
                  ctx.setLineDash([3, 3]);
                  ctx.beginPath();
                  ctx.moveTo(eventX, u.bbox.top);
                  ctx.lineTo(eventX, u.bbox.top + u.bbox.height);
                  ctx.stroke();
                  ctx.setLineDash([]);
                  ctx.fillStyle = ev.severity === "critical" ? "#FF4D4D" : ev.severity === "warning" ? "#FFB800" : "#3B82F6";
                  ctx.beginPath();
                  ctx.moveTo(eventX - 4, u.bbox.top);
                  ctx.lineTo(eventX + 4, u.bbox.top);
                  ctx.lineTo(eventX, u.bbox.top + 6);
                  ctx.fill();
                }
              });
              const corners = [
                { turn: 8, start: 10, apex: 12.5, end: 15 },
                { turn: 11, start: 26, apex: 28.4, end: 31 },
                { turn: 3, start: 40, apex: 42.1, end: 45 },
                { turn: 5, start: 66, apex: 68.9, end: 71 }
              ];
              corners.forEach((c) => {
                const sX = Math.round(u.valToPos(c.start, "x"));
                const aX = Math.round(u.valToPos(c.apex, "x"));
                const eX = Math.round(u.valToPos(c.end, "x"));
                if (sX >= u.bbox.left && eX <= u.bbox.left + u.bbox.width) {
                  ctx.fillStyle = "rgba(59, 130, 246, 0.05)";
                  ctx.fillRect(sX, u.bbox.top + u.bbox.height - 10, aX - sX, 10);
                  ctx.strokeStyle = "rgba(59, 130, 246, 0.15)";
                  ctx.lineWidth = 0.75;
                  ctx.strokeRect(sX, u.bbox.top + u.bbox.height - 10, aX - sX, 10);
                  ctx.fillStyle = "rgba(0, 209, 127, 0.05)";
                  ctx.fillRect(aX, u.bbox.top + u.bbox.height - 10, eX - aX, 10);
                  ctx.strokeStyle = "rgba(0, 209, 127, 0.15)";
                  ctx.lineWidth = 0.75;
                  ctx.strokeRect(aX, u.bbox.top + u.bbox.height - 10, eX - aX, 10);
                  ctx.fillStyle = "#FFB800";
                  ctx.fillRect(aX - 1, u.bbox.top + u.bbox.height - 10, 2, 10);
                  ctx.fillStyle = "#7A828C";
                  ctx.font = "bold 6.5px monospace";
                  ctx.fillText(`T${c.turn} EN`, sX + 2, u.bbox.top + u.bbox.height - 2.5);
                  ctx.fillText(`T${c.turn} EX`, aX + 2, u.bbox.top + u.bbox.height - 2.5);
                }
              });
            }
          ],
          setCursor: [
            (u) => {
              const idx = u.cursor.idx;
              if (idx != null) setCursorTick(from + idx);
            }
          ],
          init: [
            (u) => {
              u.over.addEventListener("dblclick", () => {
                const xVal = u.posToVal(u.cursor.left || 0, "x");
                const sessionTime2 = parsed.channels["SessionTime"]?.data;
                if (!sessionTime2) return;
                const timeOffset = sessionTime2[from];
                const clickTime = xVal + timeOffset;
                const events = useTelemetryRuntimeStore.getState().events;
                const closest = events.find((ev) => Math.abs(ev.timestampSec - clickTime) < 1.5);
                if (closest) {
                  useTelemetryRuntimeStore.getState().triggerEvent(closest);
                  toast.success(`Scrubbed playhead to dynamic incident: ${closest.label}`);
                }
              });
            }
          ]
        }
      };
      const header = document.createElement("div");
      header.className = "flex items-center justify-between px-3 py-1 hairline-b text-[11px] font-mono uppercase tracking-wider";
      const nameSpan = document.createElement("span");
      nameSpan.style.color = resolveColor(name);
      nameSpan.textContent = name;
      const statsSpan = document.createElement("span");
      statsSpan.className = "text-muted-foreground";
      statsSpan.textContent = `${ch.unit || ""} · min ${ch.min.toFixed(2)} · max ${ch.max.toFixed(2)} · avg ${ch.avg.toFixed(2)}`;
      header.appendChild(nameSpan);
      header.appendChild(statsSpan);
      wrap.appendChild(header);
      const plotEl = document.createElement("div");
      wrap.appendChild(plotEl);
      const plot = new uPlot(opts, data, plotEl);
      plotsRef.current.push(plot);
    });
    const onResize = () => {
      const w = container.clientWidth;
      plotsRef.current.forEach((p) => p.setSize({ width: w, height: 110 }));
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      plotsRef.current.forEach((p) => p.destroy());
      plotsRef.current = [];
    };
  }, [parsed, selectedChannels, refLap, cmpLap, setCursorTick]);
  useEffect(() => {
    const sessionTime = parsed.channels["SessionTime"]?.data;
    if (!sessionTime) return;
    const refLapObj = refLap != null ? parsed.laps.find((l) => l.lap === refLap) : null;
    const from = refLapObj ? refLapObj.startTick : 0;
    const idx = cursorTick - from;
    plotsRef.current.forEach((p) => {
      if (idx >= 0 && idx < p.data[0].length) {
        const left = p.valToPos(p.data[0][idx], "x");
        p.setCursor({ left, top: 50 }, false);
      }
    });
  }, [cursorTick, parsed, refLap]);
  if (selectedChannels.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center text-sm text-muted-foreground", children: "Select channels from the left rail to plot." });
  }
  return /* @__PURE__ */ jsx("div", { ref: containerRef, className: "h-full overflow-y-auto" });
}
function LiveReadout({ parsed }) {
  const { cursorTick } = useWorkbench();
  const items = DEFAULT_CHANNELS.filter((n) => n in parsed.channels);
  const sessionTime = parsed.channels["SessionTime"]?.data[cursorTick] ?? 0;
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col", children: [
    /* @__PURE__ */ jsxs("div", { className: "hairline-b flex items-center justify-between px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground", children: [
      /* @__PURE__ */ jsx("span", { children: "Readout" }),
      /* @__PURE__ */ jsxs("span", { className: "tabular-nums text-foreground", children: [
        "t = ",
        sessionTime.toFixed(3),
        " s"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid flex-1 grid-cols-2 gap-px bg-border p-px", children: items.map((name) => {
      const ch = parsed.channels[name];
      const v = ch.data[cursorTick];
      const pct = ch.max > ch.min ? (v - ch.min) / (ch.max - ch.min) * 100 : 0;
      return /* @__PURE__ */ jsxs("div", { className: "bg-panel p-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground", children: [
          /* @__PURE__ */ jsx("span", { style: { color: colorForChannel(name) }, children: name }),
          /* @__PURE__ */ jsx("span", { children: ch.unit })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-1 font-mono text-2xl tabular-nums", children: Number.isFinite(v) ? v.toFixed(2) : "—" }),
        /* @__PURE__ */ jsx("div", { className: "mt-1 h-1 overflow-hidden rounded-full bg-rail", children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "h-full",
            style: { width: `${pct}%`, background: colorForChannel(name) }
          }
        ) })
      ] }, name);
    }) })
  ] });
}
const NUM_SECTORS = 3;
function formatLap(t) {
  if (!isFinite(t) || t <= 0) return "—";
  const m = Math.floor(t / 60);
  const s = t - m * 60;
  return m > 0 ? `${m}:${s.toFixed(3).padStart(6, "0")}` : s.toFixed(3);
}
function formatSec(t) {
  if (t == null || !isFinite(t) || t <= 0) return "—";
  return t.toFixed(3);
}
function LapList({ parsed }) {
  const { refLap, cmpLap, setRefLap, setCmpLap, setCursorTick } = useWorkbench();
  const rows = useMemo(() => {
    const sessionTime = parsed.channels["SessionTime"]?.data;
    const lapDistPct = parsed.channels["LapDistPct"]?.data;
    if (!sessionTime) return [];
    return parsed.laps.map((l) => {
      const sectors = new Array(NUM_SECTORS).fill(null);
      const valid = l.endTick - l.startTick > 30 && l.timeS > 5;
      if (lapDistPct && valid) {
        const boundaries = [];
        for (let s = 1; s < NUM_SECTORS; s++) {
          const target = s / NUM_SECTORS;
          let foundTick = null;
          for (let t = l.startTick + 1; t <= l.endTick; t++) {
            const prev = lapDistPct[t - 1];
            const cur = lapDistPct[t];
            if (cur >= prev && prev <= target && cur >= target) {
              foundTick = t;
              break;
            }
          }
          if (foundTick != null) boundaries.push(foundTick);
        }
        if (boundaries.length === NUM_SECTORS - 1) {
          const ticks = [l.startTick, ...boundaries, l.endTick];
          for (let s = 0; s < NUM_SECTORS; s++) {
            sectors[s] = sessionTime[ticks[s + 1]] - sessionTime[ticks[s]];
          }
        }
      }
      return {
        lap: l.lap,
        startTick: l.startTick,
        endTick: l.endTick,
        timeS: l.timeS,
        sectors,
        valid
      };
    });
  }, [parsed]);
  const { bestLapNumber, bestSectors, theoreticalBest } = useMemo(() => {
    let bestLapNumber2 = null;
    let bestLapT = Infinity;
    const bestSectors2 = new Array(NUM_SECTORS).fill(null);
    for (const r of rows) {
      if (!r.valid) continue;
      if (r.timeS < bestLapT) {
        bestLapT = r.timeS;
        bestLapNumber2 = r.lap;
      }
      for (let s = 0; s < NUM_SECTORS; s++) {
        const v = r.sectors[s];
        if (v != null && (bestSectors2[s] == null || v < bestSectors2[s])) {
          bestSectors2[s] = v;
        }
      }
    }
    const theoreticalBest2 = bestSectors2.every((s) => s != null) ? bestSectors2.reduce((a, b) => a + b, 0) : null;
    return { bestLapNumber: bestLapNumber2, bestSectors: bestSectors2, theoreticalBest: theoreticalBest2 };
  }, [rows]);
  if (rows.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center text-xs text-muted-foreground", children: "No laps detected" });
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col", children: [
    /* @__PURE__ */ jsxs("div", { className: "hairline-b flex items-center justify-between px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground", children: [
      /* @__PURE__ */ jsxs("span", { children: [
        "Laps · ",
        rows.length
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-3", children: [
        bestLapNumber != null && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-primary", children: [
          /* @__PURE__ */ jsx(Trophy, { className: "h-3 w-3" }),
          "Best L",
          bestLapNumber
        ] }),
        theoreticalBest != null && /* @__PURE__ */ jsxs("span", { title: "Theoretical best from fastest sectors", children: [
          "Theo ",
          formatLap(theoreticalBest)
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "min-h-0 flex-1 overflow-y-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full border-collapse font-mono text-[11px]", children: [
      /* @__PURE__ */ jsx("thead", { className: "sticky top-0 bg-panel text-[10px] uppercase tracking-wider text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { className: "hairline-b", children: [
        /* @__PURE__ */ jsx("th", { className: "px-2 py-1 text-left", children: "Lap" }),
        Array.from({ length: NUM_SECTORS }, (_, i) => /* @__PURE__ */ jsxs("th", { className: "px-2 py-1 text-right", children: [
          "S",
          i + 1
        ] }, i)),
        /* @__PURE__ */ jsx("th", { className: "px-2 py-1 text-right", children: "Time" }),
        /* @__PURE__ */ jsx("th", { className: "px-2 py-1 text-center", children: "Δ Best" }),
        /* @__PURE__ */ jsx("th", { className: "px-2 py-1 text-center", children: "Set" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: rows.map((r) => {
        const isBest = r.lap === bestLapNumber;
        const isRef = refLap === r.lap;
        const isCmp = cmpLap === r.lap;
        const delta = bestLapNumber != null && r.valid ? r.timeS - (rows.find((x) => x.lap === bestLapNumber)?.timeS ?? r.timeS) : null;
        return /* @__PURE__ */ jsxs(
          "tr",
          {
            onClick: () => setCursorTick(r.startTick),
            className: `hairline-b cursor-pointer transition-colors hover:bg-accent/40 ${isBest ? "bg-primary/10" : ""} ${isRef ? "ring-1 ring-inset ring-primary" : ""}`,
            children: [
              /* @__PURE__ */ jsx("td", { className: "px-2 py-1 text-left", children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
                isBest && /* @__PURE__ */ jsx(Trophy, { className: "h-3 w-3 text-primary" }),
                !r.valid && /* @__PURE__ */ jsx(Flag, { className: "h-3 w-3 text-muted-foreground" }),
                r.lap
              ] }) }),
              r.sectors.map((sec, i) => {
                const isPersonalBestSec = sec != null && bestSectors[i] === sec;
                return /* @__PURE__ */ jsx(
                  "td",
                  {
                    className: `px-2 py-1 text-right tabular-nums ${isPersonalBestSec ? "font-semibold text-fuchsia-400" : ""}`,
                    children: formatSec(sec)
                  },
                  i
                );
              }),
              /* @__PURE__ */ jsx(
                "td",
                {
                  className: `px-2 py-1 text-right tabular-nums ${isBest ? "font-semibold text-primary" : ""}`,
                  children: r.valid ? formatLap(r.timeS) : "—"
                }
              ),
              /* @__PURE__ */ jsx("td", { className: "px-2 py-1 text-center tabular-nums text-muted-foreground", children: delta != null && delta > 0 ? `+${delta.toFixed(3)}` : delta === 0 ? "—" : "" }),
              /* @__PURE__ */ jsx("td", { className: "px-2 py-1 text-center", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-1", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setRefLap(isRef ? null : r.lap),
                    className: `rounded-sm border px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${isRef ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-accent"}`,
                    title: "Set as reference lap",
                    children: "Ref"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setCmpLap(isCmp ? null : r.lap),
                    className: `rounded-sm border px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${isCmp ? "border-foreground bg-foreground text-background" : "border-border hover:bg-accent"}`,
                    title: "Set as compare lap",
                    children: "Cmp"
                  }
                )
              ] }) })
            ]
          },
          r.lap
        );
      }) })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "hairline-t flex items-center gap-3 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground", children: [
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-sm bg-primary/40" }),
        " Best lap"
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-sm bg-fuchsia-400" }),
        " Best sector"
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx(Flag, { className: "h-3 w-3" }),
        " In/out lap"
      ] })
    ] })
  ] });
}
function GGDiagram({ parsed }) {
  const { refLap, cmpLap } = useWorkbench();
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const [size, setSize] = useState({ w: 320, h: 320 });
  const lat = parsed.channels["LatAccel"]?.data;
  const lon = parsed.channels["LongAccel"]?.data;
  const G2 = 9.80665;
  const { points, refRange, cmpRange, peakLat, peakAccel, peakBrake, envelope } = useMemo(() => {
    if (!lat || !lon) {
      return {
        points: null,
        refRange: null,
        cmpRange: null,
        peakLat: 0,
        peakAccel: 0,
        peakBrake: 0,
        envelope: null
      };
    }
    let r0 = 0;
    let r1 = lat.length;
    let cr = null;
    if (refLap != null) {
      const l = parsed.laps.find((x) => x.lap === refLap);
      if (l) {
        r0 = l.startTick;
        r1 = l.endTick;
      }
    }
    if (cmpLap != null) {
      const l = parsed.laps.find((x) => x.lap === cmpLap);
      if (l) cr = [l.startTick, l.endTick];
    }
    const len = r1 - r0;
    const pts = new Float32Array(len * 2);
    let pLat = 0;
    let pAcc = 0;
    let pBrk = 0;
    for (let i = 0; i < len; i++) {
      const x = lat[r0 + i] / G2;
      const y = lon[r0 + i] / G2;
      pts[i * 2] = x;
      pts[i * 2 + 1] = y;
      const ax = Math.abs(x);
      if (ax > pLat) pLat = ax;
      if (y > pAcc) pAcc = y;
      if (-y > pBrk) pBrk = -y;
    }
    const BINS2 = 36;
    const env = new Float32Array(BINS2);
    for (let i = 0; i < len; i++) {
      const x = pts[i * 2];
      const y = pts[i * 2 + 1];
      const r = Math.hypot(x, y);
      if (r < 0.05) continue;
      let ang = Math.atan2(y, x);
      if (ang < 0) ang += Math.PI * 2;
      const b = Math.min(BINS2 - 1, Math.floor(ang / (Math.PI * 2) * BINS2));
      if (r > env[b]) env[b] = r;
    }
    return {
      points: pts,
      refRange: [r0, r1],
      cmpRange: cr,
      peakLat: pLat,
      peakAccel: pAcc,
      peakBrake: pBrk,
      envelope: env
    };
  }, [lat, lon, parsed.laps, refLap, cmpLap]);
  const cmpPoints = useMemo(() => {
    if (!lat || !lon || !cmpRange) return null;
    const [a, b] = cmpRange;
    const len = b - a;
    const pts = new Float32Array(len * 2);
    for (let i = 0; i < len; i++) {
      pts[i * 2] = lat[a + i] / G2;
      pts[i * 2 + 1] = lon[a + i] / G2;
    }
    return pts;
  }, [lat, lon, cmpRange]);
  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      const s = Math.max(160, Math.min(r.width, r.height));
      setSize({ w: s, h: s });
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = size.w * dpr;
    c.height = size.h * dpr;
    const ctx = c.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.w, size.h);
    const cx = size.w / 2;
    const cy = size.h / 2;
    const maxG = Math.max(2, Math.ceil(Math.max(peakLat, peakAccel, peakBrake) + 0.25));
    const scale = (Math.min(size.w, size.h) / 2 - 16) / maxG;
    ctx.strokeStyle = "rgba(120,130,140,0.18)";
    ctx.lineWidth = 1;
    ctx.font = "10px JetBrains Mono, monospace";
    ctx.fillStyle = "rgba(180,190,200,0.5)";
    for (let g = 1; g <= maxG; g++) {
      ctx.beginPath();
      ctx.arc(cx, cy, g * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillText(`${g}g`, cx + 2, cy - g * scale - 2);
    }
    ctx.strokeStyle = "rgba(120,130,140,0.25)";
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(size.w, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, size.h);
    ctx.stroke();
    ctx.fillStyle = "rgba(140,150,160,0.55)";
    ctx.fillText("Accel", cx + 4, 12);
    ctx.fillText("Brake", cx + 4, size.h - 4);
    ctx.fillText("← Left", 4, cy - 4);
    ctx.textAlign = "right";
    ctx.fillText("Right →", size.w - 4, cy - 4);
    ctx.textAlign = "left";
    if (cmpPoints) {
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      for (let i = 0; i < cmpPoints.length; i += 2) {
        const x = cx + cmpPoints[i] * scale;
        const y = cy - cmpPoints[i + 1] * scale;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    if (points) {
      ctx.fillStyle = "rgba(56,189,248,0.55)";
      for (let i = 0; i < points.length; i += 2) {
        const x = cx + points[i] * scale;
        const y = cy - points[i + 1] * scale;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    if (envelope && envelope.length) {
      ctx.strokeStyle = "rgba(244,114,182,0.85)";
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      let started = false;
      for (let b = 0; b <= envelope.length; b++) {
        const idx = b % envelope.length;
        const r = envelope[idx];
        if (r < 0.1) continue;
        const ang = idx / envelope.length * Math.PI * 2;
        const x = cx + Math.cos(ang) * r * scale;
        const y = cy - Math.sin(ang) * r * scale;
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();
    }
  }, [points, cmpPoints, envelope, peakLat, peakAccel, peakBrake, size]);
  if (!lat || !lon) {
    return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col items-center justify-center gap-1 px-4 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "font-mono text-[11px] uppercase tracking-wider text-muted-foreground", children: "g-g unavailable" }),
      /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
        "This .ibt has no ",
        /* @__PURE__ */ jsx("span", { className: "font-mono", children: "LatAccel" }),
        " /",
        " ",
        /* @__PURE__ */ jsx("span", { className: "font-mono", children: "LongAccel" }),
        " channels."
      ] })
    ] });
  }
  const combined = Math.hypot(peakLat, Math.max(peakAccel, peakBrake));
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col", children: [
    /* @__PURE__ */ jsxs("div", { className: "hairline-b flex items-center justify-between gap-3 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground", children: [
      /* @__PURE__ */ jsxs("span", { children: [
        "Friction circle",
        refLap != null ? ` · L${refLap}` : " · all laps"
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxs("span", { children: [
          /* @__PURE__ */ jsxs("span", { className: "text-foreground", children: [
            peakLat.toFixed(2),
            "g"
          ] }),
          " lat"
        ] }),
        /* @__PURE__ */ jsxs("span", { children: [
          /* @__PURE__ */ jsxs("span", { className: "text-foreground", children: [
            peakAccel.toFixed(2),
            "g"
          ] }),
          " accel"
        ] }),
        /* @__PURE__ */ jsxs("span", { children: [
          /* @__PURE__ */ jsxs("span", { className: "text-foreground", children: [
            peakBrake.toFixed(2),
            "g"
          ] }),
          " brake"
        ] }),
        /* @__PURE__ */ jsxs("span", { children: [
          /* @__PURE__ */ jsxs("span", { className: "text-foreground", children: [
            combined.toFixed(2),
            "g"
          ] }),
          " combined"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { ref: wrapRef, className: "flex min-h-0 flex-1 items-center justify-center", children: /* @__PURE__ */ jsx("canvas", { ref: canvasRef, style: { width: size.w, height: size.h } }) }),
    /* @__PURE__ */ jsxs("div", { className: "hairline-t flex items-center gap-3 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground", children: [
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-sky-400" }),
        " Ref"
      ] }),
      cmpLap != null && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-white/40" }),
        " Cmp L",
        cmpLap
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-pink-400" }),
        " Grip envelope"
      ] })
    ] })
  ] });
}
const NUM_SEGMENTS = 20;
function fmt(t) {
  if (!isFinite(t) || t <= 0) return "—";
  const m = Math.floor(t / 60);
  const s = t - m * 60;
  return m > 0 ? `${m}:${s.toFixed(3).padStart(6, "0")}` : s.toFixed(3);
}
function OptimalLap({ parsed }) {
  const { setRefLap, setCursorTick } = useWorkbench();
  const result = useMemo(() => {
    const sessionTime = parsed.channels["SessionTime"]?.data;
    const lapDistPct = parsed.channels["LapDistPct"]?.data;
    if (!sessionTime || !lapDistPct || parsed.laps.length === 0) return null;
    const perLap2 = [];
    for (const l of parsed.laps) {
      if (l.endTick - l.startTick < 60 || l.timeS < 5) continue;
      const boundaries = [l.startTick];
      for (let s = 1; s < NUM_SEGMENTS; s++) {
        const target = s / NUM_SEGMENTS;
        let foundTick = null;
        for (let t = l.startTick + 1; t <= l.endTick; t++) {
          const prev = lapDistPct[t - 1];
          const cur = lapDistPct[t];
          if (cur >= prev && prev <= target && cur >= target) {
            foundTick = t;
            break;
          }
        }
        if (foundTick != null) boundaries.push(foundTick);
        else boundaries.push(NaN);
      }
      boundaries.push(l.endTick);
      const times = new Array(NUM_SEGMENTS).fill(null);
      for (let s = 0; s < NUM_SEGMENTS; s++) {
        const a = boundaries[s];
        const b = boundaries[s + 1];
        if (!isFinite(a) || !isFinite(b) || b <= a) continue;
        const dt = sessionTime[b] - sessionTime[a];
        if (dt > 0 && dt < l.timeS) times[s] = dt;
      }
      perLap2.push({ lap: l.lap, times, total: l.timeS });
    }
    if (perLap2.length === 0) return null;
    const bestSeg2 = new Array(
      NUM_SEGMENTS
    ).fill(null);
    for (const row of perLap2) {
      const lap = parsed.laps.find((x) => x.lap === row.lap);
      for (let s = 0; s < NUM_SEGMENTS; s++) {
        const t = row.times[s];
        if (t == null) continue;
        if (!bestSeg2[s] || t < bestSeg2[s].time) {
          bestSeg2[s] = { time: t, lap: row.lap, startTick: lap.startTick };
        }
      }
    }
    const totals = perLap2.map((p) => p.total);
    const bestActual2 = Math.min(...totals);
    const bestActualLap2 = perLap2.find((p) => p.total === bestActual2).lap;
    const allCovered = bestSeg2.every((b) => b != null);
    const optimal2 = allCovered ? bestSeg2.reduce((a, b) => a + b.time, 0) : null;
    const gap2 = optimal2 != null ? bestActual2 - optimal2 : null;
    return { perLap: perLap2, bestSeg: bestSeg2, bestActual: bestActual2, bestActualLap: bestActualLap2, optimal: optimal2, gap: gap2 };
  }, [parsed]);
  if (!result) {
    return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col items-center justify-center gap-1 px-4 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "font-mono text-[11px] uppercase tracking-wider text-muted-foreground", children: "Optimal lap unavailable" }),
      /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
        "Need ",
        /* @__PURE__ */ jsx("span", { className: "font-mono", children: "SessionTime" }),
        " +",
        " ",
        /* @__PURE__ */ jsx("span", { className: "font-mono", children: "LapDistPct" }),
        " + at least one valid lap."
      ] })
    ] });
  }
  const { bestSeg, bestActual, bestActualLap, optimal, gap, perLap } = result;
  const contributors = /* @__PURE__ */ new Map();
  for (const b of bestSeg) {
    if (!b) continue;
    contributors.set(b.lap, (contributors.get(b.lap) ?? 0) + 1);
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col", children: [
    /* @__PURE__ */ jsxs("div", { className: "hairline-b flex items-center justify-between gap-3 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground", children: [
      /* @__PURE__ */ jsxs("span", { children: [
        "Optimal lap · ",
        NUM_SEGMENTS,
        " micro-sectors"
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(Trophy, { className: "h-3 w-3 text-primary" }),
          "Best L",
          bestActualLap,
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-foreground", children: fmt(bestActual) })
        ] }),
        optimal != null && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(Zap, { className: "h-3 w-3 text-fuchsia-400" }),
          "Optimal ",
          /* @__PURE__ */ jsx("span", { className: "text-foreground", children: fmt(optimal) })
        ] }),
        gap != null && /* @__PURE__ */ jsxs("span", { children: [
          "Gap",
          " ",
          /* @__PURE__ */ jsx("span", { className: gap > 1e-3 ? "text-fuchsia-400" : "text-foreground", children: gap > 0 ? `−${gap.toFixed(3)}` : "0.000" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "px-3 py-2", children: [
      /* @__PURE__ */ jsx("div", { className: "hairline flex h-6 w-full overflow-hidden rounded-sm bg-rail", children: bestSeg.map((b, i) => {
        if (!b) {
          return /* @__PURE__ */ jsx(
            "div",
            {
              className: "h-full flex-1 border-r border-border/40 bg-muted/30",
              title: `Segment ${i + 1}: no data`
            },
            i
          );
        }
        return /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              setRefLap(b.lap);
              setCursorTick(b.startTick);
            },
            className: "group h-full flex-1 border-r border-border/40 bg-primary/40 transition-colors hover:bg-primary",
            title: `Segment ${i + 1} · L${b.lap} · ${b.time.toFixed(3)}s`
          },
          i
        );
      }) }),
      /* @__PURE__ */ jsxs("div", { className: "mt-1 flex justify-between font-mono text-[9px] text-muted-foreground", children: [
        /* @__PURE__ */ jsx("span", { children: "0%" }),
        /* @__PURE__ */ jsx("span", { children: "50%" }),
        /* @__PURE__ */ jsx("span", { children: "100%" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "hairline-t min-h-0 flex-1 overflow-y-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full border-collapse font-mono text-[11px]", children: [
      /* @__PURE__ */ jsx("thead", { className: "sticky top-0 bg-panel text-[10px] uppercase tracking-wider text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { className: "hairline-b", children: [
        /* @__PURE__ */ jsx("th", { className: "px-2 py-1 text-left", children: "Seg" }),
        /* @__PURE__ */ jsx("th", { className: "px-2 py-1 text-left", children: "Range" }),
        /* @__PURE__ */ jsx("th", { className: "px-2 py-1 text-right", children: "Best" }),
        /* @__PURE__ */ jsx("th", { className: "px-2 py-1 text-center", children: "Lap" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: bestSeg.map((b, i) => {
        const lo = (i / NUM_SEGMENTS * 100).toFixed(0);
        const hi = ((i + 1) / NUM_SEGMENTS * 100).toFixed(0);
        return /* @__PURE__ */ jsxs(
          "tr",
          {
            className: "hairline-b cursor-pointer hover:bg-accent/40",
            onClick: () => b && (setRefLap(b.lap), setCursorTick(b.startTick)),
            children: [
              /* @__PURE__ */ jsx("td", { className: "px-2 py-1 text-left text-muted-foreground", children: i + 1 }),
              /* @__PURE__ */ jsxs("td", { className: "px-2 py-1 text-left text-muted-foreground", children: [
                lo,
                "–",
                hi,
                "%"
              ] }),
              /* @__PURE__ */ jsx("td", { className: "px-2 py-1 text-right tabular-nums", children: b ? b.time.toFixed(3) : "—" }),
              /* @__PURE__ */ jsx("td", { className: "px-2 py-1 text-center tabular-nums", children: b ? `L${b.lap}` : "—" })
            ]
          },
          i
        );
      }) })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "hairline-t flex items-center gap-3 px-3 py-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground", children: [
      /* @__PURE__ */ jsxs("span", { children: [
        contributors.size,
        " of ",
        perLap.length,
        " laps contribute"
      ] }),
      /* @__PURE__ */ jsx("span", { className: "text-[9px] normal-case tracking-normal", children: "Click any segment to jump the cursor and set that lap as reference." })
    ] })
  ] });
}
const BRAKE_ON = 0.18;
const BRAKE_OFF = 0.08;
const MIN_ZONE_TICKS = 8;
function findBrakeZones(brake, lapDistPct, lap) {
  const out = [];
  let inZone = false;
  let startPct = 0;
  for (let t = lap.startTick; t <= lap.endTick; t++) {
    const b = brake[t] ?? 0;
    const p = lapDistPct[t];
    if (!isFinite(p)) continue;
    if (!inZone && b > BRAKE_ON) {
      inZone = true;
      startPct = p;
    } else if (inZone && b < BRAKE_OFF) {
      const endPct = p;
      if (endPct > startPct && endPct - startPct > 5e-3) {
        out.push({
          startPct,
          endPct,
          windowEndPct: Math.min(1, endPct + 0.04)
        });
      }
      inZone = false;
    }
  }
  return out.filter((z) => {
    let count = 0;
    for (let t = lap.startTick; t <= lap.endTick; t++) {
      const p = lapDistPct[t];
      if (p >= z.startPct && p <= z.endPct) count++;
      if (count > MIN_ZONE_TICKS) return true;
    }
    return false;
  });
}
function statsForBand(parsed, lap, startPct, endPct) {
  const sessionTime = parsed.channels["SessionTime"]?.data;
  const lapDistPct = parsed.channels["LapDistPct"]?.data;
  const speed = parsed.channels["Speed"]?.data;
  const brake = parsed.channels["Brake"]?.data;
  const throttle = parsed.channels["Throttle"]?.data;
  if (!sessionTime || !lapDistPct || !speed || !brake || !throttle) return null;
  let tStart = -1;
  let tEnd = -1;
  for (let t = lap.startTick + 1; t <= lap.endTick; t++) {
    const prev = lapDistPct[t - 1];
    const cur = lapDistPct[t];
    if (cur < prev) continue;
    if (tStart < 0 && prev <= startPct && cur >= startPct) tStart = t;
    if (tStart >= 0 && prev <= endPct && cur >= endPct) {
      tEnd = t;
      break;
    }
  }
  if (tStart < 0 || tEnd < 0 || tEnd <= tStart) return null;
  let minSpeed = Infinity;
  let peakBrake = 0;
  let releasePct = null;
  let throttleOnPct = null;
  let exitSpeed = speed[tEnd];
  let sampleCount = 0;
  for (let t = tStart; t <= tEnd; t++) {
    const s = speed[t];
    if (s < minSpeed) minSpeed = s;
    const b = brake[t];
    if (b > peakBrake) peakBrake = b;
    if (releasePct == null && b < BRAKE_OFF && t > tStart + 2) {
      releasePct = lapDistPct[t];
    }
    if (throttleOnPct == null && throttle[t] > 0.5) {
      throttleOnPct = lapDistPct[t];
    }
    sampleCount++;
  }
  return {
    lap: lap.lap,
    durationS: sessionTime[tEnd] - sessionTime[tStart],
    brakeReleasePct: releasePct,
    brakePeak: peakBrake,
    apexMinSpeed: minSpeed === Infinity ? 0 : minSpeed,
    throttleOnPct,
    exitSpeed,
    sampleCount,
    spanPct: lapDistPct[tEnd] - lapDistPct[tStart]
  };
}
function fmtMeters(deltaPct, trackLengthKm) {
  if (!trackLengthKm) return `${(deltaPct * 100).toFixed(2)}%`;
  const m = deltaPct * trackLengthKm * 1e3;
  return `${m >= 0 ? "+" : ""}${m.toFixed(1)} m`;
}
const MIN_CONFIDENCE_SHOW = 0.35;
const LOW_CONFIDENCE_FLAG = 0.6;
function computeConfidence(ref, best, zoneSpanPct, gainS) {
  const reasons = [];
  const density = Math.min(1, Math.min(ref.sampleCount, best.sampleCount) / 60);
  if (density < 0.5) reasons.push("sparse samples");
  const refCov = zoneSpanPct > 0 ? Math.min(1, ref.spanPct / zoneSpanPct) : 0;
  const bestCov = zoneSpanPct > 0 ? Math.min(1, best.spanPct / zoneSpanPct) : 0;
  const coverage = Math.min(refCov, bestCov);
  if (coverage < 0.7) reasons.push("partial band coverage");
  const noiseFloor = 0.02;
  const signal = Math.min(1, Math.abs(gainS) / (noiseFloor * 5));
  if (signal < 0.4) reasons.push("gain near noise floor");
  const score = +(0.4 * density + 0.4 * coverage + 0.2 * signal).toFixed(2);
  return { score, reasons };
}
function Counterfactuals({ parsed }) {
  const { refLap, setRefLap, setCmpLap, setCursorTick } = useWorkbench();
  const speedUnit = parsed.channels["Speed"]?.unit ?? "m/s";
  const trackLengthKm = parsed.meta.trackLengthKm;
  const analysis = useMemo(() => {
    const brake = parsed.channels["Brake"]?.data;
    const lapDistPct = parsed.channels["LapDistPct"]?.data;
    if (!brake || !lapDistPct || parsed.laps.length < 2) return null;
    const ref2 = (refLap != null ? parsed.laps.find((l) => l.lap === refLap) : null) ?? parsed.laps.reduce((a, b) => b.timeS > 0 && b.timeS < a.timeS ? b : a, parsed.laps[0]);
    if (!ref2) return null;
    const zones = findBrakeZones(brake, lapDistPct, ref2);
    if (zones.length === 0) return { ref: ref2, items: [], hidden: 0 };
    const items2 = zones.map((z, idx) => {
      const refStats = statsForBand(parsed, ref2, z.startPct, z.windowEndPct);
      if (!refStats) return null;
      let best = null;
      for (const other of parsed.laps) {
        if (other.lap === ref2.lap) continue;
        if (other.timeS < 5) continue;
        const s = statsForBand(parsed, other, z.startPct, z.windowEndPct);
        if (!s) continue;
        if (!best || s.durationS < best.durationS) best = s;
      }
      if (!best) return null;
      const gainS = refStats.durationS - best.durationS;
      let jumpTick = ref2.startTick;
      for (let t = ref2.startTick + 1; t <= ref2.endTick; t++) {
        if (lapDistPct[t - 1] <= z.startPct && lapDistPct[t] >= z.startPct) {
          jumpTick = t;
          break;
        }
      }
      const zoneSpanPct = z.windowEndPct - z.startPct;
      const { score: confidence, reasons } = computeConfidence(
        refStats,
        best,
        zoneSpanPct,
        gainS
      );
      return { idx, zone: z, refStats, best, gainS, jumpTick, confidence, reasons };
    }).filter((x) => x !== null);
    const visible = items2.filter((i) => i.confidence >= MIN_CONFIDENCE_SHOW);
    const hidden2 = items2.length - visible.length;
    visible.sort((a, b) => b.gainS * b.confidence - a.gainS * a.confidence);
    return { ref: ref2, items: visible, hidden: hidden2 };
  }, [parsed, refLap]);
  if (!analysis) {
    return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col items-center justify-center gap-1 px-4 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "font-mono text-[11px] uppercase tracking-wider text-muted-foreground", children: "Counterfactuals unavailable" }),
      /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
        "Need ",
        /* @__PURE__ */ jsx("span", { className: "font-mono", children: "Brake" }),
        ", ",
        /* @__PURE__ */ jsx("span", { className: "font-mono", children: "Speed" }),
        ",",
        " ",
        /* @__PURE__ */ jsx("span", { className: "font-mono", children: "LapDistPct" }),
        " and at least 2 valid laps."
      ] })
    ] });
  }
  const { ref, items, hidden } = analysis;
  const totalGain = items.filter((i) => i.gainS > 0 && i.confidence >= LOW_CONFIDENCE_FLAG).reduce((a, b) => a + b.gainS, 0);
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col", children: [
    /* @__PURE__ */ jsxs("div", { className: "hairline-b flex items-center justify-between gap-3 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground", children: [
      /* @__PURE__ */ jsxs("span", { children: [
        "What-if · Ref L",
        ref.lap,
        " · ",
        items.length,
        " zones",
        hidden > 0 && /* @__PURE__ */ jsxs("span", { className: "ml-1 text-amber-400/70", children: [
          "(+",
          hidden,
          " hidden, low confidence)"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("span", { children: [
        "Realisable gain ",
        /* @__PURE__ */ jsxs("span", { className: "text-fuchsia-400", children: [
          "−",
          totalGain.toFixed(3),
          "s"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "min-h-0 flex-1 overflow-y-auto", children: items.length === 0 ? /* @__PURE__ */ jsx("div", { className: "px-3 py-4 text-[11px] text-muted-foreground", children: "No brake zones detected on the reference lap." }) : items.map((it) => {
      const refRel = it.refStats.brakeReleasePct;
      const bestRel = it.best.brakeReleasePct;
      const releaseDeltaPct = refRel != null && bestRel != null ? bestRel - refRel : null;
      const refTOn = it.refStats.throttleOnPct;
      const bestTOn = it.best.throttleOnPct;
      const throttleDeltaPct = refTOn != null && bestTOn != null ? bestTOn - refTOn : null;
      const speedDelta = it.best.apexMinSpeed - it.refStats.apexMinSpeed;
      const exitDelta = it.best.exitSpeed - it.refStats.exitSpeed;
      const slower = it.gainS > 5e-3;
      const lowConf = it.confidence < LOW_CONFIDENCE_FLAG;
      return /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => {
            setCmpLap(it.best.lap);
            setCursorTick(it.jumpTick);
          },
          className: "hairline-b group flex w-full flex-col gap-1 px-3 py-2 text-left transition-colors hover:bg-accent/40",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 font-mono text-[11px]", children: [
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 text-foreground", children: [
                /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3 text-muted-foreground" }),
                "Zone ",
                it.idx + 1,
                " ·",
                " ",
                /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
                  (it.zone.startPct * 100).toFixed(1),
                  "–",
                  (it.zone.endPct * 100).toFixed(1),
                  "%"
                ] }),
                /* @__PURE__ */ jsxs(
                  "span",
                  {
                    title: lowConf ? `Low confidence${it.reasons.length ? `: ${it.reasons.join(", ")}` : ""}` : "High confidence",
                    className: `ml-1 inline-flex items-center gap-0.5 rounded px-1 py-px text-[9px] uppercase tracking-wider ${lowConf ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/10 text-emerald-400"}`,
                    children: [
                      lowConf ? /* @__PURE__ */ jsx(ShieldAlert, { className: "h-2.5 w-2.5" }) : /* @__PURE__ */ jsx(ShieldCheck, { className: "h-2.5 w-2.5" }),
                      Math.round(it.confidence * 100),
                      "%"
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs(
                "span",
                {
                  className: `flex items-center gap-1 ${slower ? "text-fuchsia-400" : "text-muted-foreground"}`,
                  children: [
                    slower ? /* @__PURE__ */ jsx(TrendingDown, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(TrendingUp, { className: "h-3 w-3" }),
                    slower ? `−${it.gainS.toFixed(3)}s vs L${it.best.lap}` : "Already optimal here"
                  ]
                }
              )
            ] }),
            lowConf && it.reasons.length > 0 && /* @__PURE__ */ jsxs("div", { className: "pl-4 font-mono text-[10px] text-amber-400/80", children: [
              "Flagged: ",
              it.reasons.join(" · ")
            ] }),
            slower && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-x-4 gap-y-0.5 pl-4 font-mono text-[10px] text-muted-foreground", children: [
              releaseDeltaPct != null && /* @__PURE__ */ jsxs("div", { children: [
                "Brake release",
                " ",
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: releaseDeltaPct > 0 ? "text-foreground" : "text-amber-400",
                    children: fmtMeters(releaseDeltaPct, trackLengthKm)
                  }
                ),
                " ",
                releaseDeltaPct > 0 ? "later" : "earlier"
              ] }),
              throttleDeltaPct != null && /* @__PURE__ */ jsxs("div", { children: [
                "Throttle on",
                " ",
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: throttleDeltaPct < 0 ? "text-foreground" : "text-amber-400",
                    children: fmtMeters(-throttleDeltaPct, trackLengthKm)
                  }
                ),
                " ",
                throttleDeltaPct < 0 ? "earlier" : "later"
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                "Apex min",
                " ",
                /* @__PURE__ */ jsxs("span", { className: speedDelta > 0 ? "text-foreground" : "text-amber-400", children: [
                  speedDelta >= 0 ? "+" : "",
                  speedDelta.toFixed(1),
                  " ",
                  speedUnit
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                "Exit speed",
                " ",
                /* @__PURE__ */ jsxs("span", { className: exitDelta > 0 ? "text-foreground" : "text-amber-400", children: [
                  exitDelta >= 0 ? "+" : "",
                  exitDelta.toFixed(1),
                  " ",
                  speedUnit
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                "Peak brake",
                " ",
                /* @__PURE__ */ jsxs("span", { className: "text-foreground", children: [
                  (it.refStats.brakePeak * 100).toFixed(0),
                  "% →",
                  " ",
                  (it.best.brakePeak * 100).toFixed(0),
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                "Band time",
                " ",
                /* @__PURE__ */ jsxs("span", { className: "text-foreground", children: [
                  it.refStats.durationS.toFixed(3),
                  "s → ",
                  it.best.durationS.toFixed(3),
                  "s"
                ] })
              ] })
            ] })
          ]
        },
        it.idx
      );
    }) }),
    /* @__PURE__ */ jsx("div", { className: "hairline-t px-3 py-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground", children: "Click a zone to load the faster lap as comparison and jump the cursor. All deltas measured." })
  ] });
}
const G$1 = 9.80665;
const BINS = 10;
function BrakeBias({ parsed }) {
  const { refLap } = useWorkbench();
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [size, setSize] = useState({ w: 320, h: 220 });
  const brake = parsed.channels["Brake"]?.data;
  const lon = parsed.channels["LongAccel"]?.data;
  const biasCh = parsed.channels["dcBrakeBias"]?.data;
  const result = useMemo(() => {
    if (!brake || !lon) return null;
    let r0 = 0;
    let r1 = brake.length;
    if (refLap != null) {
      const l = parsed.laps.find((x) => x.lap === refLap);
      if (l) {
        r0 = l.startTick;
        r1 = l.endTick;
      }
    }
    const buckets = Array.from({ length: BINS }, () => []);
    let peak = 0;
    let nBraking = 0;
    for (let t = r0; t < r1; t++) {
      const b = brake[t];
      if (b < 0.05) continue;
      const decelG = -lon[t] / G$1;
      if (!isFinite(decelG) || decelG < 0) continue;
      nBraking++;
      const bi = Math.min(BINS - 1, Math.floor(b * BINS));
      buckets[bi].push(decelG);
      if (b >= 0.9 && decelG > peak) peak = decelG;
    }
    const medians = buckets.map((arr) => {
      if (arr.length < 4) return null;
      const s = arr.slice().sort((a, b) => a - b);
      return s[Math.floor(s.length / 2)];
    });
    const pts = [];
    medians.forEach((m, i) => {
      if (m != null) pts.push({ x: (i + 0.5) / BINS, y: m });
    });
    let slope = 0;
    let intercept = 0;
    let r2 = 0;
    if (pts.length >= 3) {
      const n = pts.length;
      const sx = pts.reduce((a, p) => a + p.x, 0);
      const sy = pts.reduce((a, p) => a + p.y, 0);
      const sxy = pts.reduce((a, p) => a + p.x * p.y, 0);
      const sxx = pts.reduce((a, p) => a + p.x * p.x, 0);
      slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
      intercept = (sy - slope * sx) / n;
      const ymean = sy / n;
      let ssr = 0;
      let sst = 0;
      for (const p of pts) {
        const yhat = slope * p.x + intercept;
        ssr += (p.y - yhat) ** 2;
        sst += (p.y - ymean) ** 2;
      }
      r2 = sst > 0 ? Math.max(0, 1 - ssr / sst) : 0;
    }
    let bias = null;
    if (biasCh) {
      let mn = Infinity, mx = -Infinity, sm = 0, c = 0;
      for (let t = r0; t < r1; t++) {
        const v = biasCh[t];
        if (!isFinite(v)) continue;
        if (v < mn) mn = v;
        if (v > mx) mx = v;
        sm += v;
        c++;
      }
      if (c > 0)
        bias = { min: mn, max: mx, avg: sm / c, cur: biasCh[Math.min(biasCh.length - 1, r0)] };
    }
    return {
      medians,
      counts: buckets.map((b) => b.length),
      peak,
      nBraking,
      slope,
      intercept,
      r2,
      bias
    };
  }, [brake, lon, biasCh, parsed.laps, refLap]);
  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((e) => {
      const r = e[0].contentRect;
      setSize({ w: Math.max(220, r.width), h: Math.max(160, r.height) });
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c || !result) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = size.w * dpr;
    c.height = size.h * dpr;
    const ctx = c.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.w, size.h);
    const padL = 36, padR = 12, padT = 10, padB = 22;
    const W = size.w - padL - padR, H = size.h - padT - padB;
    const yMax = Math.max(1.5, Math.ceil((result.peak || 1) + 0.25));
    ctx.strokeStyle = "rgba(120,130,140,0.18)";
    ctx.fillStyle = "rgba(160,170,180,0.55)";
    ctx.font = "10px JetBrains Mono, monospace";
    for (let g = 0; g <= yMax; g += 0.5) {
      const y = padT + H - g / yMax * H;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + W, y);
      ctx.stroke();
      ctx.fillText(`${g.toFixed(1)}g`, 4, y + 3);
    }
    for (let i = 0; i <= BINS; i++) {
      const x = padL + i / BINS * W;
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padT + H);
      ctx.stroke();
    }
    ctx.fillText("0%", padL, size.h - 6);
    ctx.fillText("100%", padL + W - 26, size.h - 6);
    result.medians.forEach((m, i) => {
      if (m == null) return;
      const bw = W / BINS;
      const x = padL + i * bw + 2;
      const h = m / yMax * H;
      ctx.fillStyle = "rgba(56,189,248,0.7)";
      ctx.fillRect(x, padT + H - h, bw - 4, h);
    });
    if (result.r2 > 0) {
      ctx.strokeStyle = "rgba(244,114,182,0.9)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const y0 = result.intercept;
      const y1 = result.slope * 1 + result.intercept;
      ctx.moveTo(padL, padT + H - Math.max(0, Math.min(yMax, y0)) / yMax * H);
      ctx.lineTo(padL + W, padT + H - Math.max(0, Math.min(yMax, y1)) / yMax * H);
      ctx.stroke();
    }
  }, [result, size]);
  if (!brake || !lon) {
    return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col items-center justify-center gap-1 px-4 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "font-mono text-[11px] uppercase tracking-wider text-muted-foreground", children: "Brake analysis unavailable" }),
      /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
        "Need ",
        /* @__PURE__ */ jsx("span", { className: "font-mono", children: "Brake" }),
        " +",
        " ",
        /* @__PURE__ */ jsx("span", { className: "font-mono", children: "LongAccel" }),
        " channels."
      ] })
    ] });
  }
  if (!result || result.nBraking < 30) {
    return /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center font-mono text-[11px] text-muted-foreground", children: "Not enough braking samples in this lap." });
  }
  const linearityLabel = result.r2 >= 0.9 ? "linear" : result.r2 >= 0.7 ? "fair" : "noisy";
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col", children: [
    /* @__PURE__ */ jsxs("div", { className: "hairline-b flex items-center justify-between gap-3 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground", children: [
      /* @__PURE__ */ jsxs("span", { children: [
        "Brake response",
        refLap != null ? ` · L${refLap}` : " · all laps"
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxs("span", { children: [
          /* @__PURE__ */ jsxs("span", { className: "text-foreground", children: [
            result.peak.toFixed(2),
            "g"
          ] }),
          " peak"
        ] }),
        /* @__PURE__ */ jsxs("span", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-foreground", children: result.slope.toFixed(2) }),
          " g/100%"
        ] }),
        /* @__PURE__ */ jsxs("span", { children: [
          "R² ",
          /* @__PURE__ */ jsx("span", { className: "text-foreground", children: result.r2.toFixed(2) }),
          " ·",
          " ",
          linearityLabel
        ] }),
        result.bias && /* @__PURE__ */ jsxs("span", { children: [
          "Bias ",
          /* @__PURE__ */ jsxs("span", { className: "text-foreground", children: [
            (result.bias.avg * 100).toFixed(1),
            "%F"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { ref: wrapRef, className: "min-h-0 flex-1", children: /* @__PURE__ */ jsx("canvas", { ref: canvasRef, style: { width: size.w, height: size.h } }) }),
    /* @__PURE__ */ jsxs("div", { className: "hairline-t px-3 py-1 font-mono text-[10px] text-muted-foreground", children: [
      /* @__PURE__ */ jsx("span", { className: "uppercase tracking-wider", children: "X: brake pedal · Y: deceleration (g, median per 10% bin)" }),
      result.bias && /* @__PURE__ */ jsxs("span", { className: "ml-3", children: [
        "dcBrakeBias range ",
        (result.bias.min * 100).toFixed(1),
        "–",
        (result.bias.max * 100).toFixed(1),
        "% front"
      ] })
    ] })
  ] });
}
const G = 9.80665;
function SlipAngle({ parsed }) {
  const { refLap, cmpLap } = useWorkbench();
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [size, setSize] = useState({ w: 360, h: 280 });
  const vx = parsed.channels["VelocityX"]?.data;
  const vy = parsed.channels["VelocityY"]?.data;
  const lat = parsed.channels["LatAccel"]?.data;
  const steer = parsed.channels["SteeringWheelAngle"]?.data;
  const speedCh = parsed.channels["Speed"]?.data;
  const result = useMemo(() => {
    if (!vx || !vy || !lat) return null;
    function buildRange(a, b) {
      const len = b - a;
      const beta = new Float32Array(len);
      const ay = new Float32Array(len);
      const steerArr = steer ? new Float32Array(len) : null;
      let n = 0;
      let peakBeta = 0;
      for (let i = 0; i < len; i++) {
        const t = a + i;
        const fwd = vx[t];
        const sd = vy[t];
        const sp = speedCh ? speedCh[t] : Math.hypot(fwd, sd);
        if (sp < 8) continue;
        const b1 = Math.atan2(sd, Math.max(0.1, fwd)) * (180 / Math.PI);
        beta[n] = b1;
        ay[n] = lat[t] / G;
        if (steerArr && steer) steerArr[n] = steer[t] * (180 / Math.PI);
        if (Math.abs(b1) > peakBeta) peakBeta = Math.abs(b1);
        n++;
      }
      return {
        beta: beta.subarray(0, n),
        ay: ay.subarray(0, n),
        steer: steerArr ? steerArr.subarray(0, n) : null,
        peakBeta,
        n
      };
    }
    let r0 = 0, r1 = vx.length;
    if (refLap != null) {
      const l = parsed.laps.find((x) => x.lap === refLap);
      if (l) {
        r0 = l.startTick;
        r1 = l.endTick;
      }
    }
    const ref = buildRange(r0, r1);
    let cmp = null;
    if (cmpLap != null) {
      const l = parsed.laps.find((x) => x.lap === cmpLap);
      if (l) cmp = buildRange(l.startTick, l.endTick);
    }
    let leftSum = 0, leftN = 0, rightSum = 0, rightN = 0;
    for (let i = 0; i < ref.n; i++) {
      const a = ref.ay[i];
      if (a > 0.6) {
        leftSum += ref.beta[i];
        leftN++;
      } else if (a < -0.6) {
        rightSum += ref.beta[i];
        rightN++;
      }
    }
    const leftBeta = leftN ? leftSum / leftN : 0;
    const rightBeta = rightN ? rightSum / rightN : 0;
    const balanceLeft = leftN ? leftBeta : null;
    const balanceRight = rightN ? -rightBeta : null;
    const overall = balanceLeft != null && balanceRight != null ? (balanceLeft + balanceRight) / 2 : balanceLeft ?? balanceRight ?? 0;
    return { ref, cmp, balanceLeft, balanceRight, overall };
  }, [vx, vy, lat, steer, speedCh, parsed.laps, refLap, cmpLap]);
  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((e) => {
      const r = e[0].contentRect;
      setSize({ w: Math.max(240, r.width), h: Math.max(160, r.height) });
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c || !result) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = size.w * dpr;
    c.height = size.h * dpr;
    const ctx = c.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.w, size.h);
    const padL = 36, padR = 12, padT = 10, padB = 22;
    const W = size.w - padL - padR, H = size.h - padT - padB;
    const peak = Math.max(
      2,
      Math.ceil(Math.max(result.ref.peakBeta, result.cmp?.peakBeta ?? 0) + 0.5)
    );
    const ayMax = 3;
    const xToPx = (ay) => padL + (ay + ayMax) / (2 * ayMax) * W;
    const yToPx = (beta) => padT + H - (beta + peak) / (2 * peak) * H;
    ctx.strokeStyle = "rgba(120,130,140,0.18)";
    ctx.fillStyle = "rgba(160,170,180,0.55)";
    ctx.font = "10px JetBrains Mono, monospace";
    for (let g = -ayMax; g <= ayMax; g++) {
      const x = xToPx(g);
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padT + H);
      ctx.stroke();
      if (g !== 0) ctx.fillText(`${g}g`, x - 6, size.h - 6);
    }
    const step = peak <= 4 ? 1 : 2;
    for (let b = -peak; b <= peak; b += step) {
      const y = yToPx(b);
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + W, y);
      ctx.stroke();
      ctx.fillText(`${b}°`, 4, y + 3);
    }
    ctx.strokeStyle = "rgba(120,130,140,0.45)";
    ctx.beginPath();
    ctx.moveTo(xToPx(0), padT);
    ctx.lineTo(xToPx(0), padT + H);
    ctx.moveTo(padL, yToPx(0));
    ctx.lineTo(padL + W, yToPx(0));
    ctx.stroke();
    if (result.cmp) {
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      for (let i = 0; i < result.cmp.n; i++) {
        ctx.fillRect(xToPx(result.cmp.ay[i]), yToPx(result.cmp.beta[i]), 1, 1);
      }
    }
    ctx.fillStyle = "rgba(56,189,248,0.55)";
    for (let i = 0; i < result.ref.n; i++) {
      ctx.fillRect(xToPx(result.ref.ay[i]), yToPx(result.ref.beta[i]), 1, 1);
    }
    if (result.balanceLeft != null) {
      ctx.fillStyle = "rgba(244,114,182,0.95)";
      const x = xToPx(0.8);
      const y = yToPx(result.balanceLeft);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    if (result.balanceRight != null) {
      ctx.fillStyle = "rgba(244,114,182,0.95)";
      const x = xToPx(-0.8);
      const y = yToPx(-result.balanceRight);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [result, size]);
  if (!vx || !vy || !lat) {
    return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col items-center justify-center gap-1 px-4 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "font-mono text-[11px] uppercase tracking-wider text-muted-foreground", children: "Slip angle unavailable" }),
      /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
        "Need ",
        /* @__PURE__ */ jsx("span", { className: "font-mono", children: "VelocityX" }),
        ",",
        " ",
        /* @__PURE__ */ jsx("span", { className: "font-mono", children: "VelocityY" }),
        ", ",
        /* @__PURE__ */ jsx("span", { className: "font-mono", children: "LatAccel" }),
        "."
      ] })
    ] });
  }
  if (!result || result.ref.n < 30) {
    return /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center font-mono text-[11px] text-muted-foreground", children: "Not enough cornering samples." });
  }
  const balanceWord = Math.abs(result.overall) < 0.5 ? "neutral" : result.overall > 0 ? "loose (oversteer)" : "tight (understeer)";
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col", children: [
    /* @__PURE__ */ jsxs("div", { className: "hairline-b flex items-center justify-between gap-3 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground", children: [
      /* @__PURE__ */ jsxs("span", { children: [
        "Body slip β · atan2(Vy, Vx)",
        refLap != null ? ` · L${refLap}` : ""
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxs("span", { children: [
          "Peak ",
          /* @__PURE__ */ jsxs("span", { className: "text-foreground", children: [
            result.ref.peakBeta.toFixed(1),
            "°"
          ] })
        ] }),
        result.balanceLeft != null && /* @__PURE__ */ jsxs("span", { children: [
          "L: ",
          /* @__PURE__ */ jsxs("span", { className: "text-foreground", children: [
            result.balanceLeft.toFixed(2),
            "°"
          ] })
        ] }),
        result.balanceRight != null && /* @__PURE__ */ jsxs("span", { children: [
          "R: ",
          /* @__PURE__ */ jsxs("span", { className: "text-foreground", children: [
            (-result.balanceRight).toFixed(2),
            "°"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("span", { children: [
          "Balance ",
          /* @__PURE__ */ jsx("span", { className: "text-foreground", children: balanceWord })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { ref: wrapRef, className: "min-h-0 flex-1", children: /* @__PURE__ */ jsx("canvas", { ref: canvasRef, style: { width: size.w, height: size.h } }) }),
    /* @__PURE__ */ jsx("div", { className: "hairline-t px-3 py-1 font-mono text-[10px] text-muted-foreground", children: /* @__PURE__ */ jsx("span", { className: "uppercase tracking-wider", children: "X: LatAccel · Y: body slip β · pink dot = mean β at >0.6g" }) })
  ] });
}
function HistogramPanel() {
  const { parsed, selectedChannels, mathExpressions, refLap } = useWorkbench();
  const [channel, setChannel] = useState(selectedChannels[0] || "Speed");
  const [binCount, setBinCount] = useState(50);
  const dataArray = useMemo(() => {
    if (!parsed) return null;
    let ch = parsed.channels[channel];
    if (ch) return ch.data;
    const expr = mathExpressions.find((e) => e.name === channel);
    if (expr && expr.compiled) {
      return evaluateMathExpressionForIbt(expr.compiled, parsed);
    }
    return null;
  }, [parsed, channel, mathExpressions]);
  const histogram = useMemo(() => {
    if (!parsed || !dataArray) return null;
    let from = 0;
    let to = dataArray.length - 1;
    if (refLap != null) {
      const refLapObj = parsed.laps.find((l) => l.lap === refLap);
      if (refLapObj) {
        from = refLapObj.startTick;
        to = refLapObj.endTick;
      }
    }
    const values = new Float32Array(to - from + 1);
    for (let i = 0; i < values.length; i++) {
      values[i] = dataArray[from + i];
    }
    return computeHistogram(Array.from(values), binCount);
  }, [parsed, dataArray, refLap, binCount]);
  if (!parsed) return null;
  const availableChannels = [...parsed.channelNames, ...mathExpressions.map((e) => e.name)].sort();
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full bg-panel p-4 hairline rounded-sm", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-mono text-sm uppercase tracking-wider", children: "Histogram" }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          "select",
          {
            value: channel,
            onChange: (e) => setChannel(e.target.value),
            className: "rounded-sm border border-border bg-rail p-1 text-xs outline-none",
            children: availableChannels.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: c }, c))
          }
        ),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: binCount,
            onChange: (e) => setBinCount(Number(e.target.value)),
            className: "rounded-sm border border-border bg-rail p-1 text-xs outline-none",
            children: [
              /* @__PURE__ */ jsx("option", { value: 20, children: "20 Bins" }),
              /* @__PURE__ */ jsx("option", { value: 50, children: "50 Bins" }),
              /* @__PURE__ */ jsx("option", { value: 100, children: "100 Bins" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 flex items-end gap-1 overflow-hidden relative", children: histogram ? histogram.bins.map((bin, i) => {
      const maxCount = Math.max(...histogram.bins.map((b) => b.count));
      const heightPct = maxCount === 0 ? 0 : bin.count / maxCount * 100;
      return /* @__PURE__ */ jsx(
        "div",
        {
          className: "flex-1 bg-primary/80 hover:bg-primary transition-all relative group",
          style: { height: `${heightPct}%`, minHeight: "1px" },
          children: /* @__PURE__ */ jsxs("div", { className: "absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 bg-zinc-800 text-white text-[10px] p-1 rounded whitespace-nowrap", children: [
            bin.label,
            ": ",
            bin.count,
            " (",
            bin.percentage.toFixed(1),
            "%)"
          ] })
        },
        i
      );
    }) : /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground m-auto", children: "No data" }) }),
    histogram && /* @__PURE__ */ jsxs("div", { className: "mt-4 grid grid-cols-4 gap-2 text-[10px] font-mono text-muted-foreground border-t border-border pt-2", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        "Mean: ",
        /* @__PURE__ */ jsx("span", { className: "text-foreground", children: histogram.stats.mean.toFixed(2) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        "Median: ",
        /* @__PURE__ */ jsx("span", { className: "text-foreground", children: histogram.stats.median.toFixed(2) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        "StdDev: ",
        /* @__PURE__ */ jsx("span", { className: "text-foreground", children: histogram.stats.stdDev.toFixed(2) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        "Count: ",
        /* @__PURE__ */ jsx("span", { className: "text-foreground", children: histogram.stats.count })
      ] })
    ] })
  ] });
}
function XYScatterPanel() {
  const { parsed, selectedChannels, mathExpressions, refLap } = useWorkbench();
  const [xChannel, setXChannel] = useState("LatAccel");
  const [yChannel, setYChannel] = useState("LongAccel");
  const canvasRef = useRef(null);
  const availableChannels = useMemo(() => {
    if (!parsed) return [];
    return [...parsed.channelNames, ...mathExpressions.map((e) => e.name)].sort();
  }, [parsed, mathExpressions]);
  const xData = useMemo(() => {
    if (!parsed) return null;
    let ch = parsed.channels[xChannel];
    if (ch) return ch.data;
    const expr = mathExpressions.find((e) => e.name === xChannel);
    if (expr && expr.compiled) return evaluateMathExpressionForIbt(expr.compiled, parsed);
    return null;
  }, [parsed, xChannel, mathExpressions]);
  const yData = useMemo(() => {
    if (!parsed) return null;
    let ch = parsed.channels[yChannel];
    if (ch) return ch.data;
    const expr = mathExpressions.find((e) => e.name === yChannel);
    if (expr && expr.compiled) return evaluateMathExpressionForIbt(expr.compiled, parsed);
    return null;
  }, [parsed, yChannel, mathExpressions]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !parsed || !xData || !yData) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);
    let from = 0;
    let to = xData.length - 1;
    if (refLap != null) {
      const refLapObj = parsed.laps.find((l) => l.lap === refLap);
      if (refLapObj) {
        from = refLapObj.startTick;
        to = refLapObj.endTick;
      }
    }
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    for (let i = from; i <= to; i++) {
      const x = xData[i];
      const y = yData[i];
      if (Number.isFinite(x) && Number.isFinite(y)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    if (minX === Infinity) return;
    const padX = (maxX - minX) * 0.05 || 1;
    const padY = (maxY - minY) * 0.05 || 1;
    minX -= padX;
    maxX += padX;
    minY -= padY;
    maxY += padY;
    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    ctx.strokeStyle = "rgba(120,130,140,0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (0 >= minX && 0 <= maxX) {
      const zx = (0 - minX) / rangeX * rect.width;
      ctx.moveTo(zx, 0);
      ctx.lineTo(zx, rect.height);
    }
    if (0 >= minY && 0 <= maxY) {
      const zy = rect.height - (0 - minY) / rangeY * rect.height;
      ctx.moveTo(0, zy);
      ctx.lineTo(rect.width, zy);
    }
    ctx.stroke();
    ctx.fillStyle = "rgba(var(--primary-rgb), 0.3)";
    getComputedStyle(document.body).getPropertyValue("--primary").trim() || "255, 60, 0";
    ctx.fillStyle = "rgba(255, 100, 0, 0.2)";
    for (let i = from; i <= to; i++) {
      const x = xData[i];
      const y = yData[i];
      if (Number.isFinite(x) && Number.isFinite(y)) {
        const px = (x - minX) / rangeX * rect.width;
        const py = rect.height - (y - minY) / rangeY * rect.height;
        ctx.fillRect(px, py, 2, 2);
      }
    }
    ctx.fillStyle = "rgba(180,190,200,0.8)";
    ctx.font = "10px JetBrains Mono, monospace";
    ctx.fillText(`${minX.toFixed(1)}`, 2, rect.height - 2);
    ctx.fillText(`${maxX.toFixed(1)}`, rect.width - 30, rect.height - 2);
    ctx.fillText(`${maxY.toFixed(1)}`, 2, 10);
  }, [parsed, xData, yData, refLap]);
  if (!parsed) return null;
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full bg-panel p-4 hairline rounded-sm", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-mono text-sm uppercase tracking-wider", children: "XY Scatter" }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 items-center", children: [
        /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase font-mono text-muted-foreground", children: "X:" }),
        /* @__PURE__ */ jsx(
          "select",
          {
            value: xChannel,
            onChange: (e) => setXChannel(e.target.value),
            className: "rounded-sm border border-border bg-rail p-1 text-xs outline-none max-w-[100px]",
            children: availableChannels.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: c }, `x-${c}`))
          }
        ),
        /* @__PURE__ */ jsx("label", { className: "text-[10px] uppercase font-mono text-muted-foreground ml-2", children: "Y:" }),
        /* @__PURE__ */ jsx(
          "select",
          {
            value: yChannel,
            onChange: (e) => setYChannel(e.target.value),
            className: "rounded-sm border border-border bg-rail p-1 text-xs outline-none max-w-[100px]",
            children: availableChannels.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: c }, `y-${c}`))
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 relative w-full h-full min-h-[150px]", children: /* @__PURE__ */ jsx("canvas", { ref: canvasRef, className: "absolute inset-0 w-full h-full block" }) })
  ] });
}
const NUM_RE = /^(-?\d+(?:\.\d+)?)(?:\s*([a-zA-Z%°"'/]+))?$/;
function isNumeric(v) {
  return NUM_RE.test(v) || /^-?\d+\/\d+/.test(v);
}
function groupOrder(name) {
  const order = [
    "Chassis",
    "TiresAero",
    "Tires",
    "Aero",
    "Drivetrain",
    "Brakes",
    "Dampers",
    "InCarDials"
  ];
  const i = order.indexOf(name);
  return i < 0 ? 99 : i;
}
function Row({ k, v }) {
  const numeric = isNumeric(v);
  return /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-3 py-0.5 font-mono text-[11px]", children: [
    /* @__PURE__ */ jsx("span", { className: "truncate text-muted-foreground", children: k }),
    /* @__PURE__ */ jsx("span", { className: numeric ? "tabular-nums text-foreground" : "text-foreground", children: v })
  ] });
}
function Group({
  name,
  node,
  depth,
  filter,
  defaultOpen
}) {
  const [open, setOpen] = useState(defaultOpen);
  const entries = Object.entries(node);
  const matches = (k, v) => {
    if (!filter) return true;
    if (k.toLowerCase().includes(filter)) return true;
    if (typeof v === "string") return v.toLowerCase().includes(filter);
    return Object.entries(v).some(([kk, vv]) => matches(kk, vv));
  };
  const visible = entries.filter(([k, v]) => matches(k, v));
  if (visible.length === 0) return null;
  const isOpen = open || filter.length > 0;
  return /* @__PURE__ */ jsxs("div", { className: depth === 0 ? "hairline-b" : "", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setOpen((o) => !o),
        className: `flex w-full items-center gap-1 px-3 py-1 text-left font-mono text-[11px] uppercase tracking-wider hover:bg-accent ${depth === 0 ? "bg-rail text-foreground" : "text-muted-foreground"}`,
        style: { paddingLeft: 12 + depth * 12 },
        children: [
          isOpen ? /* @__PURE__ */ jsx(ChevronDown, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3" }),
          name,
          /* @__PURE__ */ jsx("span", { className: "ml-auto text-muted-foreground/70", children: visible.length })
        ]
      }
    ),
    isOpen && /* @__PURE__ */ jsx("div", { className: "px-3 pb-1", style: { paddingLeft: 24 + depth * 12 }, children: visible.map(
      ([k, v]) => typeof v === "string" ? /* @__PURE__ */ jsx(Row, { k, v }, k) : /* @__PURE__ */ jsx(
        Group,
        {
          name: k,
          node: v,
          depth: depth + 1,
          filter,
          defaultOpen: depth < 1
        },
        k
      )
    ) })
  ] });
}
function SetupSheet({ parsed }) {
  const [filter, setFilter] = useState("");
  const setup = useMemo(
    () => parsed.meta.sessionInfoYaml ? parseCarSetup(parsed.meta.sessionInfoYaml) : null,
    [parsed.meta.sessionInfoYaml]
  );
  if (!setup) {
    return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col items-center justify-center gap-2 px-4 text-center", children: [
      /* @__PURE__ */ jsx(Wrench, { className: "h-5 w-5 text-muted-foreground" }),
      /* @__PURE__ */ jsx("div", { className: "font-mono text-xs uppercase tracking-wider text-muted-foreground", children: "No setup data in this .ibt" }),
      /* @__PURE__ */ jsx("p", { className: "max-w-sm font-mono text-[11px] text-muted-foreground/80", children: "iRacing only embeds car setup when telemetry is recorded from the garage/in-car. Re-record after exiting the garage and the CarSetup block will appear here." })
    ] });
  }
  const groups = Object.entries(setup.tree).sort(([a], [b]) => groupOrder(a) - groupOrder(b));
  const f = filter.trim().toLowerCase();
  const totalParams = Object.keys(setup.flat).length;
  const handleAskAI = () => {
    window.location.href = "/ai-engineer?analyzeSetup=true";
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full min-h-0 flex-col bg-panel", children: [
    /* @__PURE__ */ jsxs("div", { className: "hairline-b flex items-center gap-2 px-3 py-1.5", children: [
      /* @__PURE__ */ jsx(Wrench, { className: "h-3.5 w-3.5 text-primary" }),
      /* @__PURE__ */ jsx("span", { className: "font-mono text-[11px] uppercase tracking-wider", children: "Car Setup" }),
      /* @__PURE__ */ jsxs("span", { className: "font-mono text-[10px] text-muted-foreground", children: [
        totalParams,
        " params",
        setup.updateCount != null ? ` · update #${setup.updateCount}` : ""
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: handleAskAI,
          className: "ml-auto flex items-center gap-1.5 border border-border hover:bg-[#1E293B] hover:text-white bg-[#0F172A] text-slate-200 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-mono shrink-0 transition-colors cursor-pointer",
          children: [
            /* @__PURE__ */ jsx(Sparkles, { className: "h-3 w-3 text-[#3B82F6] animate-pulse" }),
            "Ask AI"
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 rounded-sm border border-border bg-rail px-2", children: [
        /* @__PURE__ */ jsx(Search, { className: "h-3 w-3 text-muted-foreground" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            value: filter,
            onChange: (e) => setFilter(e.target.value),
            placeholder: "Filter…",
            className: "h-6 w-40 bg-transparent font-mono text-[11px] outline-none placeholder:text-muted-foreground/60"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "min-h-0 flex-1 overflow-y-auto", children: groups.map(
      ([name, node]) => typeof node === "string" ? /* @__PURE__ */ jsx("div", { className: "px-3 py-1", children: /* @__PURE__ */ jsx(Row, { k: name, v: node }) }, name) : /* @__PURE__ */ jsx(Group, { name, node, depth: 0, filter: f, defaultOpen: true }, name)
    ) })
  ] });
}
const fetchPbSetup = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(createSsrRpc("75199b150805fb72a14c66751c7500a682a5a04342742f76fe0b1b9c97f6f36d"));
function fmtDelta$1(d) {
  if (!d.numericDelta) return null;
  const { value, unit } = d.numericDelta;
  if (!Number.isFinite(value) || value === 0) return null;
  const sign = value > 0 ? "+" : "";
  const abs = Math.abs(value);
  const precision = abs >= 10 ? 1 : abs >= 1 ? 2 : 3;
  return `${sign}${value.toFixed(precision)}${unit ? ` ${unit}` : ""}`;
}
const TOP_N = 10;
function deltaMagnitude(d) {
  if (!d.numericDelta) return 0;
  const v = Math.abs(d.numericDelta.value);
  if (!Number.isFinite(v) || v === 0) return 0;
  const aMatch = d.a?.match(/-?\d+(?:\.\d+)?/);
  const base = aMatch ? Math.abs(parseFloat(aMatch[0])) : 0;
  return base > 1e-6 ? v / base : v;
}
function groupOf(path) {
  const i = path.indexOf(".");
  return i < 0 ? "Other" : path.slice(0, i);
}
const GROUP_ORDER = [
  "Chassis",
  "TiresAero",
  "Tires",
  "Aero",
  "Drivetrain",
  "Brakes",
  "Dampers",
  "InCarDials"
];
function groupRank(g) {
  const i = GROUP_ORDER.indexOf(g);
  return i < 0 ? 99 : i;
}
function SetupDiff({
  parsed,
  track,
  car,
  sessionId
}) {
  const [pb, setPb] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const current = useMemo(
    () => parsed.meta.sessionInfoYaml ? parseCarSetup(parsed.meta.sessionInfoYaml) : null,
    [parsed.meta.sessionInfoYaml]
  );
  useEffect(() => {
    if (!track || !car) return;
    let cancelled = false;
    setLoading(true);
    setErr(null);
    fetchPbSetup({ data: { track, car, excludeSessionId: sessionId } }).then((res) => {
      if (cancelled) return;
      if ("error" in res && res.error) setErr(res.error);
      else setPb(("pb" in res ? res.pb : null) ?? null);
    }).catch((e) => !cancelled && setErr(e.message)).finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [track, car, sessionId]);
  const pbParsed = useMemo(() => pb ? parseCarSetup(pb.setupYaml) : null, [pb]);
  const diffs = useMemo(
    () => current && pbParsed ? diffSetups(pbParsed, current) : [],
    [current, pbParsed]
  );
  const topPaths = useMemo(() => {
    const ranked = diffs.filter((d) => d.numericDelta && d.numericDelta.value !== 0).map((d) => ({ path: d.path, mag: deltaMagnitude(d) })).sort((a, b) => b.mag - a.mag).slice(0, TOP_N);
    return new Set(ranked.map((r) => r.path));
  }, [diffs]);
  const grouped = useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    for (const d of diffs) {
      const g = groupOf(d.path);
      const arr = m.get(g);
      if (arr) arr.push(d);
      else m.set(g, [d]);
    }
    return [...m.entries()].sort(([a], [b]) => groupRank(a) - groupRank(b));
  }, [diffs]);
  const [collapsed, setCollapsed] = useState(/* @__PURE__ */ new Set());
  const toggleGroup = (g) => setCollapsed((prev) => {
    const next = new Set(prev);
    if (next.has(g)) next.delete(g);
    else next.add(g);
    return next;
  });
  const allCollapsed = grouped.length > 0 && grouped.every(([g]) => collapsed.has(g));
  const toggleAll = () => setCollapsed(allCollapsed ? /* @__PURE__ */ new Set() : new Set(grouped.map(([g]) => g)));
  if (!current) {
    return /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center px-4 text-center font-mono text-[11px] text-muted-foreground", children: "No setup data in this .ibt — record from the garage to capture CarSetup." });
  }
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "flex h-full items-center justify-center gap-2 font-mono text-[11px] text-muted-foreground", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin" }),
      " Loading PB setup…"
    ] });
  }
  if (err) {
    return /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center px-4 text-center font-mono text-[11px] text-destructive", children: err });
  }
  if (!pb || !pbParsed) {
    return /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center px-4 text-center font-mono text-[11px] text-muted-foreground", children: "No prior PB session with setup found for this car/track." });
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full min-h-0 flex-col bg-panel", children: [
    /* @__PURE__ */ jsxs("div", { className: "hairline-b flex items-center gap-2 px-3 py-1.5", children: [
      /* @__PURE__ */ jsx(GitCompare, { className: "h-3.5 w-3.5 text-primary" }),
      /* @__PURE__ */ jsx("span", { className: "font-mono text-[11px] uppercase tracking-wider", children: "Setup Diff" }),
      /* @__PURE__ */ jsxs("span", { className: "font-mono text-[10px] text-muted-foreground", children: [
        "vs PB · ",
        pb.name,
        pb.bestLapS != null ? ` · ${pb.bestLapS.toFixed(3)}s` : "",
        " · ",
        diffs.length,
        " changes"
      ] }),
      diffs.length > 0 && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: toggleAll,
          className: "ml-auto rounded-sm border border-border bg-rail px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:bg-accent hover:text-foreground",
          children: allCollapsed ? "Expand all" : "Collapse all"
        }
      )
    ] }),
    diffs.length === 0 ? /* @__PURE__ */ jsx("div", { className: "flex flex-1 items-center justify-center font-mono text-[11px] text-muted-foreground", children: "Setup identical to PB." }) : /* @__PURE__ */ jsx("div", { className: "min-h-0 flex-1 overflow-y-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full font-mono text-[11px]", children: [
      /* @__PURE__ */ jsx("thead", { className: "sticky top-0 bg-rail text-[10px] uppercase tracking-wider text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "px-3 py-1 text-left font-normal", children: "Parameter" }),
        /* @__PURE__ */ jsx("th", { className: "px-2 py-1 text-right font-normal", children: "PB" }),
        /* @__PURE__ */ jsx("th", { className: "px-2 py-1 text-right font-normal", children: "Current" }),
        /* @__PURE__ */ jsx("th", { className: "px-3 py-1 text-right font-normal", children: "Δ" })
      ] }) }),
      grouped.map(([group, rows]) => /* @__PURE__ */ jsxs("tbody", { children: [
        /* @__PURE__ */ jsx("tr", { className: "bg-rail/60", children: /* @__PURE__ */ jsx("td", { colSpan: 4, className: "p-0", children: /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => toggleGroup(group),
            className: "flex w-full items-center gap-1 px-3 py-1 text-left text-[10px] uppercase tracking-wider text-muted-foreground hover:bg-accent hover:text-foreground",
            children: [
              collapsed.has(group) ? /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "h-3 w-3" }),
              group,
              /* @__PURE__ */ jsx("span", { className: "ml-2 text-muted-foreground/60", children: rows.length }),
              rows.some((d) => topPaths.has(d.path)) && /* @__PURE__ */ jsx(Flame, { className: "ml-1 h-3 w-3 text-primary" })
            ]
          }
        ) }) }),
        !collapsed.has(group) && rows.map((d) => {
          const delta = fmtDelta$1(d);
          const isTop = topPaths.has(d.path);
          const shortPath = d.path.startsWith(group + ".") ? d.path.slice(group.length + 1) : d.path;
          return /* @__PURE__ */ jsxs(
            "tr",
            {
              className: `hairline-b hover:bg-accent/40 ${isTop ? "bg-primary/5" : ""}`,
              children: [
                /* @__PURE__ */ jsx("td", { className: "truncate px-3 py-0.5 text-muted-foreground", title: d.path, children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
                  isTop && /* @__PURE__ */ jsx(Flame, { className: "h-3 w-3 text-primary", "aria-label": "Top delta" }),
                  /* @__PURE__ */ jsx("span", { className: isTop ? "text-foreground" : "", children: shortPath })
                ] }) }),
                /* @__PURE__ */ jsx("td", { className: "px-2 py-0.5 text-right tabular-nums text-foreground/70", children: d.a ?? "—" }),
                /* @__PURE__ */ jsx("td", { className: "px-2 py-0.5 text-right tabular-nums text-foreground", children: d.b ?? "—" }),
                /* @__PURE__ */ jsx(
                  "td",
                  {
                    className: `px-3 py-0.5 text-right tabular-nums ${isTop ? "font-semibold" : ""} ${delta ? delta.startsWith("+") ? "text-[var(--ch-throttle)]" : "text-[var(--ch-brake)]" : "text-muted-foreground"}`,
                    children: delta ?? "—"
                  }
                )
              ]
            },
            d.path
          );
        })
      ] }, group))
    ] }) })
  ] });
}
const EXPIRY_OPTIONS = [
  { label: "1 day", days: 1 },
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "Never", days: null }
];
function ShareButton({ sessionId }) {
  const { refLap, cmpLap } = useWorkbench();
  const create = useServerFn(createShareLink);
  const revoke = useServerFn(revokeShareLink);
  const [url, setUrl] = useState(null);
  const [token, setToken] = useState(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expiryDays, setExpiryDays] = useState(7);
  const handle = async () => {
    setBusy(true);
    try {
      const { token: token2 } = await create({
        data: {
          sessionId,
          refLap: refLap ?? null,
          cmpLap: cmpLap ?? null,
          expiresInDays: expiryDays
        }
      });
      const u = `${window.location.origin}/share/${token2}`;
      setUrl(u);
      setToken(token2);
      try {
        await navigator.clipboard.writeText(u);
        setCopied(true);
        toast.success("Share link copied");
        setTimeout(() => setCopied(false), 1500);
      } catch {
        toast.success("Share link created");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  const copyAgain = async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Copied");
    setTimeout(() => setCopied(false), 1500);
  };
  const handleRevoke = async () => {
    if (!token) return;
    setBusy(true);
    try {
      await revoke({ data: { token } });
      setUrl(null);
      setToken(null);
      toast.success("Link revoked. Anyone with the URL will get a 404.");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
    /* @__PURE__ */ jsx(
      "select",
      {
        value: expiryDays ?? "",
        onChange: (e) => setExpiryDays(e.target.value === "" ? null : parseInt(e.target.value, 10)),
        className: "h-6 rounded-sm border border-border bg-rail px-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground",
        title: "Link expiration",
        children: EXPIRY_OPTIONS.map((o) => /* @__PURE__ */ jsx("option", { value: o.days ?? "", children: o.label }, o.label))
      }
    ),
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: handle,
        disabled: busy,
        className: "flex h-6 items-center gap-1 rounded-sm border border-border bg-rail px-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground disabled:opacity-50",
        title: "Create a public read-only link to this lap",
        children: [
          /* @__PURE__ */ jsx(Share2, { className: "h-3 w-3" }),
          " ",
          busy ? "…" : "Share"
        ]
      }
    ),
    url && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: copyAgain,
          className: "flex h-6 items-center gap-1 rounded-sm border border-border bg-panel px-2 font-mono text-[10px] text-foreground hover:bg-accent",
          title: url,
          children: [
            copied ? /* @__PURE__ */ jsx(Check, { className: "h-3 w-3 text-primary" }) : /* @__PURE__ */ jsx(Copy, { className: "h-3 w-3" }),
            /* @__PURE__ */ jsx("span", { className: "max-w-[180px] truncate", children: url.replace(/^https?:\/\//, "") })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: handleRevoke,
          disabled: busy,
          className: "flex h-6 items-center gap-1 rounded-sm border border-destructive/50 bg-rail px-2 font-mono text-[10px] uppercase tracking-wider text-destructive hover:bg-destructive/10 disabled:opacity-50",
          title: "Revoke this link — copies of the URL will stop working immediately",
          children: [
            /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" }),
            " Revoke"
          ]
        }
      )
    ] })
  ] });
}
function findCorners(parsed, lapNum) {
  const lap = parsed.laps.find((l) => l.lap === lapNum);
  if (!lap) return null;
  const speed = parsed.channels["Speed"]?.data;
  const pct = parsed.channels["LapDistPct"]?.data;
  if (!speed || !pct) return null;
  const N = lap.endTick - lap.startTick + 1;
  if (N < 60) return null;
  const win = Math.max(5, Math.floor(N / 400));
  const sm = new Float32Array(N);
  let acc = 0;
  for (let i2 = 0; i2 < N; i2++) {
    acc += speed[lap.startTick + i2];
    if (i2 >= win) acc -= speed[lap.startTick + i2 - win];
    sm[i2] = acc / Math.min(i2 + 1, win);
  }
  const corners = [];
  let lastMaxV = sm[0];
  let lastMaxI = 0;
  let i = 1;
  while (i < N - 1) {
    while (i < N - 1 && sm[i + 1] <= sm[i]) i++;
    const minI = i;
    const minV = sm[i];
    let j = i;
    while (j < N - 1 && sm[j + 1] >= sm[j]) j++;
    const nextMaxV = sm[j];
    const prominence = Math.min(lastMaxV, nextMaxV) - minV;
    if (prominence > 8 && minV < 60) {
      corners.push({
        idx: corners.length + 1,
        pct: pct[lap.startTick + minI],
        startTick: lap.startTick + lastMaxI,
        apexTick: lap.startTick + minI,
        apexSpeed: minV,
        entrySpeed: lastMaxV
      });
    }
    lastMaxI = j;
    lastMaxV = nextMaxV;
    i = j + 1;
  }
  return corners;
}
function sampleSpeedAtPct(parsed, lapNum, target) {
  const lap = parsed.laps.find((l) => l.lap === lapNum);
  if (!lap) return null;
  const speed = parsed.channels["Speed"]?.data;
  const pct = parsed.channels["LapDistPct"]?.data;
  if (!speed || !pct) return null;
  const lo = target - 0.015;
  const hi = target + 0.015;
  let vmin = Infinity;
  for (let t = lap.startTick; t <= lap.endTick; t++) {
    const p = pct[t];
    if (p >= lo && p <= hi && speed[t] < vmin) vmin = speed[t];
  }
  return isFinite(vmin) ? vmin : null;
}
function MinCornerSpeed({ parsed }) {
  const { refLap, cmpLap, setCursorTick } = useWorkbench();
  const [units, setUnits] = useState("kmh");
  const [sortBy, setSortBy] = useState("order");
  const corners = useMemo(
    () => refLap != null ? findCorners(parsed, refLap) : null,
    [parsed, refLap]
  );
  const cmpVals = useMemo(() => {
    if (!corners || cmpLap == null) return null;
    return corners.map((c) => sampleSpeedAtPct(parsed, cmpLap, c.pct));
  }, [parsed, corners, cmpLap]);
  const bestVals = useMemo(() => {
    if (!corners) return null;
    return corners.map((c) => {
      let best = -Infinity;
      for (const l of parsed.laps) {
        const v = sampleSpeedAtPct(parsed, l.lap, c.pct);
        if (v != null && v > best) best = v;
      }
      return isFinite(best) ? best : null;
    });
  }, [parsed, corners]);
  if (refLap == null) {
    return /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center text-xs text-muted-foreground", children: "Pick a reference lap to detect corners." });
  }
  if (!corners || corners.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center text-xs text-muted-foreground", children: "No corners detected (need Speed + LapDistPct)." });
  }
  const factor = units === "kmh" ? 3.6 : 2.23694;
  const unitLabel = units === "kmh" ? "km/h" : "mph";
  const maxApex = Math.max(...corners.map((c) => c.apexSpeed));
  const rows = corners.map((c, i) => {
    const cmpV = cmpVals?.[i] ?? null;
    const bestV = bestVals?.[i] ?? null;
    const deltaCmp = cmpV != null ? (cmpV - c.apexSpeed) * factor : null;
    const deltaBest = bestV != null ? (bestV - c.apexSpeed) * factor : null;
    return { c, i, cmpV, bestV, deltaCmp, deltaBest };
  });
  if (sortBy === "delta" && cmpLap != null) {
    rows.sort((a, b) => Math.abs(b.deltaCmp ?? 0) - Math.abs(a.deltaCmp ?? 0));
  } else if (sortBy === "apex") {
    rows.sort((a, b) => a.c.apexSpeed - b.c.apexSpeed);
  }
  const cmpDeltas = rows.map((r) => r.deltaCmp).filter((v) => v != null);
  const totalGain = cmpDeltas.filter((d) => d > 0).reduce((a, b) => a + b, 0);
  const totalLoss = cmpDeltas.filter((d) => d < 0).reduce((a, b) => a + b, 0);
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col", children: [
    /* @__PURE__ */ jsxs("div", { className: "hairline-b flex items-center justify-between px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground", children: [
      /* @__PURE__ */ jsxs("span", { children: [
        "Min-corner-speed · ",
        corners.length,
        " turns · ref L",
        refLap
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        cmpLap != null && /* @__PURE__ */ jsxs("span", { children: [
          "cmp L",
          cmpLap,
          " ",
          /* @__PURE__ */ jsxs("span", { className: "text-emerald-400", children: [
            "+",
            totalGain.toFixed(0)
          ] }),
          "/",
          /* @__PURE__ */ jsx("span", { className: "text-fuchsia-400", children: totalLoss.toFixed(0) }),
          " ",
          unitLabel
        ] }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: sortBy,
            onChange: (e) => setSortBy(e.target.value),
            className: "rounded-sm border border-border bg-rail px-1 py-0.5 text-[10px]",
            title: "Sort",
            children: [
              /* @__PURE__ */ jsx("option", { value: "order", children: "Order" }),
              /* @__PURE__ */ jsx("option", { value: "apex", children: "Slowest apex" }),
              cmpLap != null && /* @__PURE__ */ jsx("option", { value: "delta", children: "|Δ cmp|" })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setUnits(units === "kmh" ? "mph" : "kmh"),
            className: "rounded-sm border border-border px-1.5 py-0.5 text-[10px] hover:text-foreground",
            children: unitLabel
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "min-h-0 flex-1 overflow-y-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full border-collapse font-mono text-[11px]", children: [
      /* @__PURE__ */ jsx("thead", { className: "sticky top-0 bg-panel text-[10px] uppercase tracking-wider text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { className: "hairline-b", children: [
        /* @__PURE__ */ jsx("th", { className: "px-2 py-1 text-left", children: "Turn" }),
        /* @__PURE__ */ jsx("th", { className: "px-2 py-1 text-right", children: "Pos" }),
        /* @__PURE__ */ jsx("th", { className: "px-2 py-1 text-right", children: "Entry" }),
        /* @__PURE__ */ jsx("th", { className: "px-2 py-1 text-right", children: "Apex" }),
        /* @__PURE__ */ jsx("th", { className: "px-2 py-1", children: "Apex bar" }),
        /* @__PURE__ */ jsx("th", { className: "px-2 py-1 text-right", title: "Best apex seen across all laps", children: "PB" }),
        /* @__PURE__ */ jsx("th", { className: "px-2 py-1 text-right", title: "Apex vs PB (negative = leaving time)", children: "Δ PB" }),
        cmpLap != null && /* @__PURE__ */ jsx("th", { className: "px-2 py-1 text-right", children: "Δ cmp" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: rows.map(({ c, i, bestV, deltaBest, deltaCmp }) => {
        const w = c.apexSpeed / maxApex * 100;
        return /* @__PURE__ */ jsxs(
          "tr",
          {
            className: "hairline-b cursor-pointer hover:bg-accent/40",
            onClick: () => setCursorTick(c.apexTick),
            title: `Apex tick ${c.apexTick} · entry tick ${c.startTick}`,
            children: [
              /* @__PURE__ */ jsxs("td", { className: "px-2 py-1 text-left", children: [
                "T",
                c.idx
              ] }),
              /* @__PURE__ */ jsxs("td", { className: "px-2 py-1 text-right text-muted-foreground tabular-nums", children: [
                (c.pct * 100).toFixed(1),
                "%"
              ] }),
              /* @__PURE__ */ jsx("td", { className: "px-2 py-1 text-right tabular-nums text-muted-foreground", children: (c.entrySpeed * factor).toFixed(0) }),
              /* @__PURE__ */ jsx("td", { className: "px-2 py-1 text-right tabular-nums", children: (c.apexSpeed * factor).toFixed(0) }),
              /* @__PURE__ */ jsx("td", { className: "px-2 py-1", children: /* @__PURE__ */ jsx("div", { className: "h-2 w-full rounded-sm bg-rail", children: /* @__PURE__ */ jsx("div", { className: "h-full rounded-sm bg-primary/70", style: { width: `${w}%` } }) }) }),
              /* @__PURE__ */ jsx("td", { className: "px-2 py-1 text-right tabular-nums text-muted-foreground", children: bestV != null ? (bestV * factor).toFixed(0) : "—" }),
              /* @__PURE__ */ jsx(
                "td",
                {
                  className: `px-2 py-1 text-right tabular-nums ${deltaBest == null ? "text-muted-foreground" : deltaBest > 1 ? "text-fuchsia-400" : "text-foreground"}`,
                  title: "km/h slower than the best apex seen",
                  children: deltaBest == null ? "—" : `+${deltaBest.toFixed(1)}`
                }
              ),
              cmpLap != null && /* @__PURE__ */ jsx(
                "td",
                {
                  className: `px-2 py-1 text-right tabular-nums ${deltaCmp == null ? "text-muted-foreground" : deltaCmp > 0.5 ? "text-emerald-400" : deltaCmp < -0.5 ? "text-fuchsia-400" : "text-foreground"}`,
                  children: deltaCmp == null ? "—" : `${deltaCmp > 0 ? "+" : ""}${deltaCmp.toFixed(1)}`
                }
              )
            ]
          },
          c.idx
        );
      }) })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "hairline-t px-3 py-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground", children: "Click a row to jump the cursor. Δ PB shows km/h left on the table at each apex." })
  ] });
}
const SEGMENT_OPTIONS = [10, 20, 30, 50];
function segmentTimes(parsed, lapNum, n) {
  const lap = parsed.laps.find((l) => l.lap === lapNum);
  if (!lap) return null;
  const sessionTime = parsed.channels["SessionTime"]?.data;
  const pct = parsed.channels["LapDistPct"]?.data;
  if (!sessionTime || !pct) return null;
  const boundaries = [lap.startTick];
  for (let s = 1; s < n; s++) {
    const target = s / n;
    let found = null;
    for (let t = lap.startTick + 1; t <= lap.endTick; t++) {
      const prev = pct[t - 1];
      const cur = pct[t];
      if (cur >= prev && prev <= target && cur >= target) {
        found = t;
        break;
      }
    }
    boundaries.push(found ?? NaN);
  }
  boundaries.push(lap.endTick);
  const times = [];
  for (let s = 0; s < n; s++) {
    const a = boundaries[s];
    const b = boundaries[s + 1];
    if (!isFinite(a) || !isFinite(b) || b <= a) {
      times.push(NaN);
    } else {
      times.push(sessionTime[b] - sessionTime[a]);
    }
  }
  return { times, ticks: boundaries };
}
function TimeLossWaterfall({ parsed }) {
  const { refLap, cmpLap, setCursorTick } = useWorkbench();
  const [n, setN] = useState(30);
  const data = useMemo(() => {
    if (refLap == null || cmpLap == null) return null;
    const ref = segmentTimes(parsed, refLap, n);
    const cmp = segmentTimes(parsed, cmpLap, n);
    if (!ref || !cmp) return null;
    const deltas2 = [];
    let cum = 0;
    const cumulative2 = [];
    for (let i = 0; i < n; i++) {
      const d = cmp.times[i] - ref.times[i];
      deltas2.push(d);
      if (isFinite(d)) cum += d;
      cumulative2.push(cum);
    }
    return { deltas: deltas2, cumulative: cumulative2, cmpTicks: cmp.ticks, refTicks: ref.ticks };
  }, [parsed, refLap, cmpLap, n]);
  if (refLap == null || cmpLap == null) {
    return /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center px-4 text-center text-xs text-muted-foreground", children: "Pick a reference lap and a compare lap to see the time-loss waterfall." });
  }
  if (!data) {
    return /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center text-xs text-muted-foreground", children: "Need SessionTime + LapDistPct." });
  }
  const { deltas, cumulative, cmpTicks } = data;
  const peak = Math.max(1e-3, ...deltas.map((d) => Math.abs(d)).filter((v) => isFinite(v)));
  const cumPeak = Math.max(1e-3, ...cumulative.map((v) => Math.abs(v)));
  const total = cumulative[cumulative.length - 1];
  const finite = deltas.map((d, i) => ({ d, i })).filter((r) => isFinite(r.d));
  const worst = finite.length ? finite.reduce((a, b) => b.d > a.d ? b : a) : null;
  const best = finite.length ? finite.reduce((a, b) => b.d < a.d ? b : a) : null;
  const W = 800;
  const H = 220;
  const PAD_L = 36;
  const PAD_R = 12;
  const PAD_T = 12;
  const PAD_B = 24;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;
  const colW = innerW / n;
  const yMid = PAD_T + innerH / 2;
  const cumLine = cumulative.map((v, i) => {
    const x = PAD_L + (i + 0.5) * colW;
    const y = yMid - v / cumPeak * (innerH / 2);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col", children: [
    /* @__PURE__ */ jsxs("div", { className: "hairline-b flex items-center justify-between px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground", children: [
      /* @__PURE__ */ jsxs("span", { children: [
        "Time loss · cmp L",
        cmpLap,
        " vs ref L",
        refLap
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        worst && /* @__PURE__ */ jsxs("span", { title: `Worst: seg ${worst.i + 1}`, children: [
          "Worst",
          " ",
          /* @__PURE__ */ jsxs("span", { className: "text-fuchsia-400", children: [
            worst.d > 0 ? "+" : "",
            worst.d.toFixed(3),
            "s"
          ] })
        ] }),
        best && /* @__PURE__ */ jsxs("span", { title: `Best: seg ${best.i + 1}`, children: [
          "Best",
          " ",
          /* @__PURE__ */ jsxs("span", { className: "text-emerald-400", children: [
            best.d > 0 ? "+" : "",
            best.d.toFixed(3),
            "s"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("span", { children: [
          "Total",
          " ",
          /* @__PURE__ */ jsxs(
            "span",
            {
              className: total > 0.01 ? "text-fuchsia-400" : total < -0.01 ? "text-emerald-400" : "text-foreground",
              children: [
                total > 0 ? "+" : "",
                total.toFixed(3),
                "s"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "select",
          {
            value: n,
            onChange: (e) => setN(parseInt(e.target.value, 10)),
            className: "rounded-sm border border-border bg-rail px-1 py-0.5 text-[10px]",
            title: "Segments",
            children: SEGMENT_OPTIONS.map((o) => /* @__PURE__ */ jsxs("option", { value: o, children: [
              o,
              " seg"
            ] }, o))
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "min-h-0 flex-1 overflow-auto p-2", children: [
      /* @__PURE__ */ jsxs("svg", { viewBox: `0 0 ${W} ${H}`, className: "block h-auto w-full", children: [
        /* @__PURE__ */ jsx(
          "line",
          {
            x1: PAD_L,
            x2: W - PAD_R,
            y1: yMid,
            y2: yMid,
            stroke: "var(--border-strong)",
            strokeWidth: 0.5
          }
        ),
        /* @__PURE__ */ jsxs(
          "text",
          {
            x: PAD_L - 4,
            y: PAD_T + 4,
            fontSize: 9,
            textAnchor: "end",
            fill: "var(--muted-foreground)",
            fontFamily: "monospace",
            children: [
              "+",
              peak.toFixed(2),
              "s"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "text",
          {
            x: PAD_L - 4,
            y: H - PAD_B + 0,
            fontSize: 9,
            textAnchor: "end",
            fill: "var(--muted-foreground)",
            fontFamily: "monospace",
            children: [
              "−",
              peak.toFixed(2),
              "s"
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "text",
          {
            x: PAD_L - 4,
            y: yMid + 3,
            fontSize: 9,
            textAnchor: "end",
            fill: "var(--muted-foreground)",
            fontFamily: "monospace",
            children: "0"
          }
        ),
        deltas.map((d, i) => {
          if (!isFinite(d)) return null;
          const x = PAD_L + i * colW + 1;
          const w = Math.max(1, colW - 2);
          const h = Math.abs(d) / peak * (innerH / 2);
          const y = d >= 0 ? yMid : yMid - h;
          const fill = d > 0 ? "var(--ch-brake)" : "var(--ch-throttle)";
          const isWorst = worst?.i === i;
          const tick = cmpTicks[i];
          return /* @__PURE__ */ jsx(
            "g",
            {
              style: { cursor: "pointer" },
              onClick: () => isFinite(tick) && setCursorTick(tick),
              children: /* @__PURE__ */ jsx(
                "rect",
                {
                  x,
                  y,
                  width: w,
                  height: Math.max(0.5, h),
                  fill,
                  fillOpacity: isWorst ? 0.9 : 0.55,
                  stroke: isWorst ? fill : "none",
                  strokeWidth: isWorst ? 1 : 0,
                  children: /* @__PURE__ */ jsx("title", { children: `Seg ${i + 1} (${(i / n * 100).toFixed(0)}–${((i + 1) / n * 100).toFixed(0)}%): ${d > 0 ? "+" : ""}${d.toFixed(3)}s — click to jump cursor` })
                }
              )
            },
            i
          );
        }),
        /* @__PURE__ */ jsx("path", { d: cumLine, fill: "none", stroke: "var(--primary)", strokeWidth: 1.5 }),
        [0, 25, 50, 75, 100].map((p) => /* @__PURE__ */ jsxs(
          "text",
          {
            x: PAD_L + p / 100 * innerW,
            y: H - 6,
            fontSize: 9,
            textAnchor: "middle",
            fontFamily: "monospace",
            fill: "var(--muted-foreground)",
            children: [
              p,
              "%"
            ]
          },
          p
        ))
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center gap-4 px-1 font-mono text-[10px] text-muted-foreground", children: [
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(
            "span",
            {
              className: "inline-block h-2 w-3",
              style: { background: "var(--ch-brake)", opacity: 0.7 }
            }
          ),
          "Lost vs ref"
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(
            "span",
            {
              className: "inline-block h-2 w-3",
              style: { background: "var(--ch-throttle)", opacity: 0.7 }
            }
          ),
          "Gained vs ref"
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx("span", { className: "inline-block h-0.5 w-3", style: { background: "var(--primary)" } }),
          "Cumulative Δ"
        ] }),
        /* @__PURE__ */ jsx("span", { className: "ml-auto", children: "Click a bar to jump the cursor." })
      ] })
    ] })
  ] });
}
function fmtLap(s) {
  if (s == null || !isFinite(s)) return "—";
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  return `${m}:${r.toFixed(3).padStart(6, "0")}`;
}
function fmtDelta(d) {
  if (d == null || !isFinite(d)) return "—";
  const sign = d > 0 ? "+" : "";
  return `${sign}${d.toFixed(3)}s`;
}
function deltaColor(d) {
  if (d == null) return "text-zinc-400";
  if (d < -0.05) return "text-emerald-400";
  if (d > 0.05) return "text-rose-400";
  return "text-zinc-200";
}
function FingerprintDelta({ track, car, thisLapS, thisSectors }) {
  const [fp, setFp] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!track || !car) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const r = await getFingerprintForPair({ data: { track, car } });
        if (!cancelled) setFp(r.fp);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [track, car]);
  const pb = fp?.best_ever_s ?? null;
  const opt = fp?.optimal_ever_s ?? null;
  const dPb = thisLapS != null && pb != null ? +(thisLapS - pb).toFixed(3) : null;
  const dOpt = thisLapS != null && opt != null ? +(thisLapS - opt).toFixed(3) : null;
  return /* @__PURE__ */ jsxs("div", { className: "hairline rounded-md bg-panel p-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(Fingerprint, { className: "h-3.5 w-3.5 text-primary" }),
      /* @__PURE__ */ jsx("div", { className: "font-mono text-[10px] uppercase tracking-wider text-muted-foreground", children: "Fingerprint Delta" }),
      fp && /* @__PURE__ */ jsxs("div", { className: "ml-auto font-mono text-[10px] text-muted-foreground", children: [
        classifyCar(fp.car),
        " · ",
        fp.track
      ] })
    ] }),
    !track || !car ? /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground", children: "Session has no track/car metadata." }) : loading ? /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground", children: "Looking up your baseline…" }) : !fp ? /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
      "No fingerprint match for this pair.",
      " ",
      /* @__PURE__ */ jsx(Link, { to: "/fingerprint", className: "text-primary underline", children: "Build your fingerprint" }),
      " ",
      "to compare against your all-time PB."
    ] }) : /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 gap-2 font-mono text-[11px]", children: [
      /* @__PURE__ */ jsx(Cell, { label: "This best", value: fmtLap(thisLapS ?? null) }),
      /* @__PURE__ */ jsx(
        Cell,
        {
          label: "All-time PB",
          value: fmtLap(pb),
          sub: dPb != null ? fmtDelta(dPb) : void 0,
          subClass: deltaColor(dPb),
          icon: dPb
        }
      ),
      /* @__PURE__ */ jsx(
        Cell,
        {
          label: "Optimal",
          value: fmtLap(opt),
          sub: dOpt != null ? fmtDelta(dOpt) : void 0,
          subClass: deltaColor(dOpt),
          icon: dOpt
        }
      ),
      /* @__PURE__ */ jsx(
        Cell,
        {
          label: "Sectors vs best",
          value: thisSectors && fp.best_per_sector && fp.best_per_sector.length ? thisSectors.map(
            (s, i) => fp.best_per_sector && fp.best_per_sector[i] != null ? (s - fp.best_per_sector[i]).toFixed(2) : "—"
          ).join(" / ") : "—"
        }
      )
    ] })
  ] });
}
function Cell({
  label,
  value,
  sub,
  subClass,
  icon
}) {
  const Icon = icon == null ? Minus : icon < -0.05 ? TrendingDown : icon > 0.05 ? TrendingUp : Minus;
  return /* @__PURE__ */ jsxs("div", { className: "rounded-sm bg-rail px-2 py-1.5", children: [
    /* @__PURE__ */ jsx("div", { className: "text-[9px] uppercase tracking-widest text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("div", { className: "tabular-nums text-zinc-100", children: value }),
    sub && /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-1 text-[10px] tabular-nums ${subClass ?? ""}`, children: [
      /* @__PURE__ */ jsx(Icon, { className: "h-3 w-3" }),
      sub
    ] })
  ] });
}
const ResizablePanelGroup = ResizablePanelGroup$1;
const LazyAICoach = lazy(() => import("./AICoach-m6RwSGi7.js").then((m) => ({
  default: m.AICoach
})));
const LazyTimeline = lazy(() => import("./Timeline-CZTaAxWk.js").then((m) => ({
  default: m.Timeline
})));
const LazyReplayThree = lazy(() => import("./ReplayThree-Cbj-PYIC.js").then((m) => ({
  default: m.ReplayThree
})));
const LazyCinemaPlayback = lazy(() => import("./CinemaPlayback-CF6vIu8Y.js").then((m) => ({
  default: m.CinemaPlayback
})));
function WorkbenchPage() {
  const {
    id
  } = Route.useParams();
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const {
    parsed,
    setParsed,
    refLap,
    cmpLap,
    setRefLap,
    setCmpLap,
    pendingLocalBlob,
    setPendingLocalBlob,
    setMathExpressions,
    activeWorkspace,
    setActiveWorkspace,
    cursorTick
  } = useWorkbench();
  const [sess, setSess] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [progress, setProgress] = useState({
    phase: "fetch",
    pct: 0
  });
  const [err, setErr] = useState(null);
  const [bottomTab, setBottomTab] = useState("cinema");
  const activePreset = useTelemetryRuntimeStore((s) => s.activePreset);
  const setActivePreset = useTelemetryRuntimeStore((s) => s.setActivePreset);
  const focusMode = useTelemetryRuntimeStore((s) => s.focusMode);
  const setFocusMode = useTelemetryRuntimeStore((s) => s.setFocusMode);
  const live = useTelemetry();
  useEffect(() => {
    const handleChannelClick = (e) => {
      const channel = (e.detail?.channel || "").toLowerCase();
      if (["brake", "bias", "press", "tempc"].some((k) => channel.includes(k))) {
        setActivePreset("gt3");
        setBottomTab("instruments");
      } else if (["ers", "soc", "mgu", "hybrid", "power", "charge"].some((k) => channel.includes(k))) {
        setActivePreset("gtp");
        setBottomTab("instruments");
      } else if (["suspension", "damper", "ride", "pitch", "roll", "yaw", "accel", "heave"].some((k) => channel.includes(k))) {
        setActivePreset("aero");
        setBottomTab("instruments");
      } else if (["throttle", "steer", "clutch", "input"].some((k) => channel.includes(k))) {
        setActivePreset("coach");
        setBottomTab("instruments");
      }
    };
    window.addEventListener("pitwall-contextual-channel", handleChannelClick);
    return () => window.removeEventListener("pitwall-contextual-channel", handleChannelClick);
  }, []);
  const setStoreCursorTick = useTelemetryRuntimeStore((s) => s.setCursorTick);
  const storeCursorTick = useTelemetryRuntimeStore((s) => s.cursorTick);
  const {
    setCursorTick
  } = useWorkbench();
  useEffect(() => {
    let rAFId;
    if (cursorTick !== storeCursorTick) {
      rAFId = requestAnimationFrame(() => {
        setStoreCursorTick(cursorTick);
      });
    }
    return () => cancelAnimationFrame(rAFId);
  }, [cursorTick, storeCursorTick, setStoreCursorTick]);
  useEffect(() => {
    let rAFId;
    if (storeCursorTick !== cursorTick) {
      rAFId = requestAnimationFrame(() => {
        setCursorTick(storeCursorTick);
      });
    }
    return () => cancelAnimationFrame(rAFId);
  }, [storeCursorTick, cursorTick, setCursorTick]);
  useEffect(() => {
    if (!parsed) return;
    const rAFId = requestAnimationFrame(() => {
      const frame = getReplayTelemetry(parsed, cursorTick);
      broadcastTelemetryFrame(frame);
    });
    return () => cancelAnimationFrame(rAFId);
  }, [cursorTick, parsed]);
  useEffect(() => {
    if (parsed) {
      const {
        clearEvents,
        addEvent
      } = useTelemetryRuntimeStore.getState();
      clearEvents();
      const scanned = scanTelemetrySession(parsed);
      if (scanned.length > 0) {
        scanned.forEach((ev) => addEvent(ev));
        try {
          const track = parsed.meta.trackDisplayName || parsed.meta.trackName || "unknown";
          const car = parsed.meta.carName || "unknown";
          const recordedAt = parsed.meta.recordedAt ? new Date(parsed.meta.recordedAt) : /* @__PURE__ */ new Date();
          const dbEvents = scanned.map((ev) => {
            const classificationMap = {
              thermal: "STABILITY",
              inputs: "PERFORMANCE",
              dynamics: "AERO PLATFORM",
              hybrid: "HYBRID CORE"
            };
            const tick = Math.round(ev.timestampSec * 60);
            const matchedLap = parsed.laps.find((l) => tick >= l.startTick && tick <= l.endTick);
            const lapNumber = matchedLap ? matchedLap.lap : 1;
            return {
              session_id: id,
              timestamp: new Date(recordedAt.getTime() + ev.timestampSec * 1e3).toISOString(),
              track,
              car,
              category: ev.category,
              classification: classificationMap[ev.category] || "STABILITY",
              severity: ev.severity,
              label: ev.label,
              description: ev.description,
              cornerNumber: ev.cornerNumber,
              lapNumber,
              metadata: ev.metadata ? {
                confidence: ev.metadata.confidence
              } : void 0
            };
          });
          saveEvents(dbEvents).catch((err2) => {
            console.warn("Failed to sync scanned events to MongoDB:", err2);
          });
        } catch (e) {
          console.warn("Error preparing scanner events for sync:", e);
        }
      } else {
        addEvent({
          timestampSec: 12.5,
          label: "FRONT AXLE LOCKUP DETECTED",
          category: "thermal",
          severity: "critical",
          description: "Front tire slip exceeding 18% under heavy threshold braking at Turn 8 entry. Shift brake bias +0.5% forward.",
          associatedChannels: ["Brake", "LFbrakeLinePress", "SteeringWheelAngle"],
          cornerNumber: 8
        });
        addEvent({
          timestampSec: 28.4,
          label: "ERS DEPLOYMENT SATURATION",
          category: "hybrid",
          severity: "warning",
          description: "MGU-K deployment saturated at max kW limit of 120kW for 5.2 seconds on back straightway.",
          associatedChannels: ["MgukDeploykW", "EnergyStorePct"],
          cornerNumber: 11
        });
        addEvent({
          timestampSec: 42.1,
          label: "EXIT THROTTLE UNSTABILITY",
          category: "inputs",
          severity: "info",
          description: "Throttle micro-pumping exit anomaly. Steer smoothness dropped to 72% rating at Turn 3 exit.",
          associatedChannels: ["Throttle", "SteeringWheelAngle"],
          cornerNumber: 3
        });
        addEvent({
          timestampSec: 68.9,
          label: "CHASSIS ROTATIONAL COMPRESSION",
          category: "dynamics",
          severity: "warning",
          description: "Rotational chassis pitch exceeds limits under massive heave load at Turn 5 compression apex.",
          associatedChannels: ["pitch", "LatAccel", "LongAccel"],
          cornerNumber: 5
        });
      }
    }
  }, [parsed]);
  const getReplayTelemetry = (parsedData, tick) => {
    const getVal = (name, fallback = 0) => parsedData.channels[name]?.data[tick] ?? fallback;
    const throttle = getVal("Throttle");
    const brake = getVal("Brake");
    const clutch = getVal("Clutch");
    const speedKph = getVal("Speed", getVal("speed")) * 3.6;
    const gear = getVal("Gear", 1);
    const rpm = getVal("RPM", getVal("rpm"));
    const steeringDeg = getVal("SteeringWheelAngle", getVal("steering")) * 57.2958;
    return {
      connected: false,
      source: "replay",
      session: parsedData.meta.sessionType || "REPLAY ANALYSIS",
      track: parsedData.meta.trackName || "UNKNOWN TRACK",
      car: parsedData.meta.carName || "PROTOTYPE CAR",
      carNumber: "44",
      gear,
      speedKph: Math.round(speedKph > 0 ? speedKph : getVal("Speed", 180)),
      rpm: Math.round(rpm),
      rpmMax: parsedData.channels["RPM"]?.max ?? 11e3,
      rpmShiftWarn: (parsedData.channels["RPM"]?.max ?? 11e3) * 0.85,
      rpmShiftRedline: (parsedData.channels["RPM"]?.max ?? 11e3) * 0.95,
      throttle,
      brake,
      clutch,
      steeringDeg: steeringDeg || getVal("SteeringWheelAngle", 0),
      brakeBias: getVal("dcBrakeBias", 54.5),
      gLat: getVal("LatAccel", 0),
      gLon: getVal("LongAccel", 0),
      tires: {
        fl: {
          tempC: getVal("LFtempCL", 80),
          pressureBar: getVal("LFpress", 1.8),
          wearPct: Math.round(getVal("LFwearL", 98) * 100),
          estWearPct: Math.round(getVal("LFwearL", 98) * 100),
          brakeTempC: getVal("LFbrakeTemp", 320),
          brakeLinePress: getVal("LFbrakeLinePress", brake * 65),
          state: "ok"
        },
        fr: {
          tempC: getVal("RFtempCL", 82),
          pressureBar: getVal("RFpress", 1.82),
          wearPct: Math.round(getVal("RFwearL", 98) * 100),
          estWearPct: Math.round(getVal("RFwearL", 98) * 100),
          brakeTempC: getVal("RFbrakeTemp", 325),
          brakeLinePress: getVal("RFbrakeLinePress", brake * 65),
          state: "ok"
        },
        rl: {
          tempC: getVal("LRtempCL", 84),
          pressureBar: getVal("LRpress", 1.84),
          wearPct: Math.round(getVal("LRwearL", 97) * 100),
          estWearPct: Math.round(getVal("LRwearL", 97) * 100),
          brakeTempC: getVal("LRbrakeTemp", 310),
          brakeLinePress: getVal("LRbrakeLinePress", brake * 45),
          state: "ok"
        },
        rr: {
          tempC: getVal("RRtempCL", 86),
          pressureBar: getVal("RRpress", 1.86),
          wearPct: Math.round(getVal("RRwearL", 96) * 100),
          estWearPct: Math.round(getVal("RRwearL", 96) * 100),
          brakeTempC: getVal("RRbrakeTemp", 315),
          brakeLinePress: getVal("RRbrakeLinePress", brake * 45),
          state: "ok"
        }
      },
      extras: {
        ersSoc: getVal("EnergyStorePct", 75),
        ersBatteryTemp: getVal("EnergyStoreTemp", 42.5),
        mgukDeployKw: getVal("MgukDeploykW", throttle * 120),
        mgukRegenKw: getVal("MgukRegenkW", brake * 200)
      }
    };
  };
  const config = WORKSPACES[activeWorkspace ?? "lite"];
  const isTabUnlocked = (tabKey) => {
    const isProTab = ["replay3d", "piano", "spider"].includes(tabKey);
    try {
      const cachedLicStr = typeof localStorage !== "undefined" ? localStorage.getItem("pitwall_bridge_license") : null;
      if (cachedLicStr) {
        const cachedLic = JSON.parse(cachedLicStr);
        if (cachedLic && cachedLic.valid) {
          if (cachedLic.tier === "pro") return true;
          if (cachedLic.tier === "plus" && !isProTab) return true;
        }
      }
    } catch (e) {
    }
    return config.activeTabs.includes(tabKey);
  };
  const renderPanelOrLock = (tabKey, children) => {
    if (isTabUnlocked(tabKey)) {
      return children;
    }
    let unlockingWorkspace = "iRacing Plus Workbook";
    let unlockingTier = "Plus";
    if (["replay3d", "piano", "spider"].includes(tabKey)) {
      unlockingWorkspace = "iRacing Plus Real-Time Workbook";
      unlockingTier = "Pro";
    }
    return /* @__PURE__ */ jsxs("div", { className: "relative h-full w-full flex flex-col items-center justify-center bg-background/95 text-center p-6 border border-border rounded-sm overflow-hidden select-none", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-10 pointer-events-none" }),
      /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex flex-col items-center max-w-sm", children: [
        /* @__PURE__ */ jsx("div", { className: "size-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3 text-amber-400 text-sm shadow-[0_0_15px_rgba(245,158,11,0.05)] animate-pulse", children: "🔒" }),
        /* @__PURE__ */ jsx("h3", { className: "font-mono uppercase text-[10px] tracking-widest text-foreground", children: "Locked Analysis Sheet" }),
        /* @__PURE__ */ jsxs("p", { className: "mt-2 font-mono text-[9px] text-muted-foreground leading-relaxed uppercase tracking-wider", children: [
          "This sheet is active in the premium ",
          /* @__PURE__ */ jsx("span", { className: "text-foreground font-semibold", children: unlockingWorkspace }),
          "."
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 flex gap-2", children: /* @__PURE__ */ jsxs("button", { onClick: () => setActiveWorkspace(tabKey === "replay3d" || tabKey === "piano" || tabKey === "spider" ? "realtime" : "plus"), className: "rounded-sm bg-amber-500 hover:bg-amber-400 px-3 py-1 font-mono text-[9px] uppercase font-semibold text-zinc-950 transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)] hover:scale-105 cursor-pointer", children: [
          "Unlock ",
          unlockingTier,
          " Workspace"
        ] }) })
      ] })
    ] });
  };
  useEffect(() => {
    if (loading) return;
    if (!user && !pendingLocalBlob) {
      setProgress(null);
      return;
    }
    let cancelled = false;
    setParsed(null);
    setProgress({
      phase: "fetch",
      pct: 0
    });
    const prefs = loadChannelPrefs();
    setMathExpressions(prefs.mathExpressions || []);
    (async () => {
      try {
        let row;
        if (!user && pendingLocalBlob) {
          row = {
            name: "Guest Session.pwlap",
            storage_path: "Guest Session.pwlap"
          };
        } else {
          try {
            const {
              data: fetchRow,
              error: e1
            } = await supabase.from("telemetry_sessions").select("*").eq("id", id).single();
            if (e1) throw e1;
            row = fetchRow;
            if (!cancelled) setSess(row);
          } catch (e) {
            if (pendingLocalBlob) {
              row = {
                name: "Live Recording.pwlap",
                storage_path: "Live Recording.pwlap"
              };
            } else {
              throw e;
            }
          }
        }
        if (cancelled) return;
        setProgress({
          phase: "download",
          pct: 5
        });
        let buf = null;
        let localDoc = null;
        if (pendingLocalBlob) {
          buf = await pendingLocalBlob.arrayBuffer();
          setProgress({
            phase: "download",
            pct: 50,
            msg: "Reading from local memory"
          });
          setPendingLocalBlob(null);
        } else {
          try {
            setProgress({
              phase: "download",
              pct: 15,
              msg: "Checking Local MongoDB"
            });
            const localRes = await fetchLocalTelemetryFile({
              data: {
                sessionId: id
              }
            });
            if (localRes && localRes.ok && localRes.doc) {
              localDoc = localRes.doc;
              setProgress({
                phase: "download",
                pct: 50,
                msg: "Loaded from Local MongoDB"
              });
            }
          } catch (e) {
            console.warn("[LocalDB] Local session fetch failed, falling back to cloud storage:", e);
          }
          if (!localDoc) {
            setProgress({
              phase: "download",
              pct: 20,
              msg: "Downloading from Pit Wall Cloud Storage"
            });
            const {
              data: blob,
              error: e2
            } = await supabase.storage.from("telemetry").download(row.storage_path);
            if (e2) throw e2;
            buf = await blob.arrayBuffer();
          }
        }
        if (cancelled) return;
        const isPwlap = isPwlapPath(row.storage_path) || isPwlapPath(row.name);
        if (isPwlap) {
          setProgress({
            phase: "parse",
            pct: 50,
            msg: "Decoding .pwlap recording"
          });
          let doc;
          if (localDoc) {
            doc = localDoc;
          } else if (buf) {
            const text = new TextDecoder().decode(buf);
            doc = JSON.parse(text);
          } else {
            throw new Error("No telemetry data retrieved");
          }
          if (doc.format !== "pwlap") throw new Error("Not a Pit Wall recording (.pwlap)");
          const result = pwlapToParsed(doc);
          if (cancelled) return;
          setParsed(result);
          setProgress(null);
        } else {
          if (!buf) throw new Error("No .ibt data downloaded");
          const result = await parseIbtInWorker(buf, (phase, pct, msg) => {
            if (!cancelled) setProgress({
              phase,
              pct: 5 + Math.floor(pct * 0.95),
              msg
            });
          });
          if (cancelled) return;
          setParsed(result);
          setProgress(null);
        }
      } catch (e) {
        if (!cancelled) {
          const m = e.message;
          setErr(m);
          toast.error(m);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, setParsed, user, loading]);
  if (!loading && !user && !parsed && !err && !progress) {
    return /* @__PURE__ */ jsx("div", { className: "flex h-screen flex-col items-center justify-center gap-4 bg-background text-foreground", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold", children: "Saved sessions are sign-in only" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "This workbench loads telemetry stored in your account. As a guest you can still analyze .ibt files locally in the Lab, or open the live dashboard." }),
      /* @__PURE__ */ jsxs("div", { className: "mt-5 flex justify-center gap-2", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => navigate({
          to: "/auth"
        }), className: "rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90", children: "Sign in" }),
        /* @__PURE__ */ jsx("button", { onClick: () => navigate({
          to: "/lab/lapfile"
        }), className: "rounded-sm border border-border bg-panel px-4 py-2 text-sm hover:bg-accent", children: "Open Lab" }),
        /* @__PURE__ */ jsx("button", { onClick: () => navigate({
          to: "/live"
        }), className: "rounded-sm border border-border bg-panel px-4 py-2 text-sm hover:bg-accent", children: "Live" })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: `flex h-screen flex-col bg-background text-foreground workspace-focus-${focusMode}`, children: [
    /* @__PURE__ */ jsxs(AppHeader, { children: [
      /* @__PURE__ */ jsx("span", { className: "font-mono uppercase tracking-wider", children: sess?.track ?? "…" }),
      /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "·" }),
      /* @__PURE__ */ jsx("span", { children: sess?.car ?? "" }),
      parsed && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "·" }),
        (() => {
          const valid = parsed.laps.filter((l) => l.endTick - l.startTick > 30 && l.timeS > 5).slice().sort((a, b) => a.timeS - b.timeS);
          const invalid = parsed.laps.filter((l) => !(l.endTick - l.startTick > 30 && l.timeS > 5));
          const renderOpts = /* @__PURE__ */ jsxs(Fragment, { children: [
            valid.map((l, i) => /* @__PURE__ */ jsxs("option", { value: l.lap, children: [
              i === 0 ? "★ " : "",
              "Lap ",
              l.lap,
              " · ",
              l.timeS.toFixed(3),
              "s",
              i === 0 ? " (best)" : ""
            ] }, `v${l.lap}`)),
            invalid.length > 0 && /* @__PURE__ */ jsx("option", { disabled: true, children: "──────────" }),
            invalid.map((l) => /* @__PURE__ */ jsxs("option", { value: l.lap, children: [
              "Lap ",
              l.lap,
              " · in/out"
            ] }, `i${l.lap}`))
          ] });
          return /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Lap" }),
              /* @__PURE__ */ jsxs("select", { value: refLap ?? "", onChange: (e) => setRefLap(e.target.value === "" ? null : parseInt(e.target.value, 10)), className: "rounded-sm border border-border bg-rail px-2 py-0.5 font-mono text-xs", children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "All" }),
                renderOpts
              ] })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "vs" }),
              /* @__PURE__ */ jsxs("select", { value: cmpLap ?? "", onChange: (e) => setCmpLap(e.target.value === "" ? null : parseInt(e.target.value, 10)), className: "rounded-sm border border-border bg-rail px-2 py-0.5 font-mono text-xs", children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "—" }),
                renderOpts
              ] })
            ] })
          ] });
        })(),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 bg-panel border border-border rounded-sm px-2 py-0.5 ml-1 select-none", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[9px] text-muted-foreground uppercase font-mono tracking-wider", children: "Profile" }),
          /* @__PURE__ */ jsx("select", { value: activeWorkspace, onChange: (e) => setActiveWorkspace(e.target.value), className: "bg-transparent text-foreground border-none font-mono text-[10px] uppercase tracking-wider focus:outline-none cursor-pointer pr-1", children: Object.values(WORKSPACES).map((w) => /* @__PURE__ */ jsx("option", { value: w.key, className: "bg-background text-foreground font-mono uppercase text-[10px]", children: w.name }, w.key)) })
        ] }),
        /* @__PURE__ */ jsx(ShareButton, { sessionId: id }),
        /* @__PURE__ */ jsx("button", { onClick: () => setShowExport(true), className: "rounded-sm border border-border bg-panel px-3 py-1 font-mono text-[10px] uppercase tracking-wider hover:bg-accent flex items-center gap-1.5", children: "Export .pwlap" })
      ] })
    ] }),
    live.connected && /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-3 px-4 py-1.5 text-[11px] font-mono border-b ${sess?.track && live.track && live.track.toLowerCase().includes(sess.track.toLowerCase()) ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" : "bg-muted/60 border-border-strong text-muted-foreground"}`, children: [
      /* @__PURE__ */ jsx("span", { className: "size-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" }),
      /* @__PURE__ */ jsx("span", { className: "font-bold text-emerald-400", children: "BRIDGE LIVE" }),
      /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "·" }),
      /* @__PURE__ */ jsx("span", { children: live.track }),
      /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "·" }),
      /* @__PURE__ */ jsx("span", { children: live.car }),
      sess?.track && live.track && live.track.toLowerCase().includes(sess.track.toLowerCase()) && /* @__PURE__ */ jsx("span", { className: "ml-2 rounded-sm bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-300 uppercase tracking-wider", children: "⚡ Same track as this session" }),
      /* @__PURE__ */ jsxs("span", { className: "ml-auto text-muted-foreground", children: [
        live.speedKph,
        " kph · G",
        live.gear,
        " · ",
        live.fuelRemainingL.toFixed(1),
        "L fuel"
      ] })
    ] }),
    err && /* @__PURE__ */ jsx("div", { className: "bg-destructive/20 px-3 py-2 text-sm text-destructive-foreground", children: err }),
    !parsed ? /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col items-center justify-center gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "font-mono text-xs uppercase tracking-wider text-muted-foreground", children: [
        progress?.phase ?? "loading",
        " · ",
        progress?.pct ?? 0,
        "%"
      ] }),
      progress?.msg && /* @__PURE__ */ jsx("div", { className: "font-mono text-[11px] text-muted-foreground", children: progress.msg }),
      /* @__PURE__ */ jsx("div", { className: "h-1 w-72 overflow-hidden rounded-full bg-rail", children: /* @__PURE__ */ jsx("div", { className: "h-full bg-primary transition-all", style: {
        width: `${progress?.pct ?? 0}%`
      } }) }),
      (progress?.pct ?? 0) >= 90 && /* @__PURE__ */ jsx("div", { className: "max-w-sm text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80", children: "Large .ibt files can sit at ~95% for a while as channels are indexed. This is normal — keep this tab open." })
    ] }) : /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("div", { className: "flex-1 min-h-0 bg-[#05070A] flex flex-col", children: /* @__PURE__ */ jsxs(ResizablePanelGroup, { direction: "horizontal", children: [
      /* @__PURE__ */ jsx(ResizablePanel, { defaultSize: 16, minSize: 10, maxSize: 25, children: /* @__PURE__ */ jsxs("div", { className: "h-full flex flex-col overflow-hidden border-r border-[#1C2430] bg-[#0B0F14]", children: [
        /* @__PURE__ */ jsx("div", { className: "px-3 py-2 border-b border-[#1C2430] text-[9px] font-mono tracking-widest text-[#7A828C] uppercase font-bold shrink-0 bg-[#11161D]", children: "channel browser" }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 min-h-0 overflow-y-auto", children: /* @__PURE__ */ jsx(ChannelBrowser, { parsed }) })
      ] }) }),
      /* @__PURE__ */ jsx(ResizableHandle, {}),
      /* @__PURE__ */ jsx(ResizablePanel, { defaultSize: 54, minSize: 40, children: /* @__PURE__ */ jsxs("div", { className: "h-full flex flex-col overflow-hidden bg-[#05070A]", children: [
        /* @__PURE__ */ jsxs("div", { className: "px-3 py-2 border-b border-[#1C2430] text-[9px] font-mono tracking-widest text-[#7A828C] uppercase font-bold shrink-0 bg-[#0B0F14] flex justify-between items-center select-none", children: [
          /* @__PURE__ */ jsx("span", { children: "rolling traces · synchronized telemetry" }),
          /* @__PURE__ */ jsx("span", { className: "text-[8px] text-[#3B82F6] font-bold", children: "MoTeC PRO WORKSPACE" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 min-h-0 overflow-hidden p-1 bg-[#05070A]", children: /* @__PURE__ */ jsx(StackedTraces, { parsed }) }),
        /* @__PURE__ */ jsx("div", { className: "shrink-0 bg-[#0B0F14] border-t border-[#1C2430]", children: /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx("div", { className: "px-3 py-1.5 font-mono text-[9px] uppercase text-[#7A828C]", children: "Loading timeline..." }), children: /* @__PURE__ */ jsx(LazyTimeline, { parsed }) }) }),
        /* @__PURE__ */ jsx("div", { className: "shrink-0 bg-[#0B0F14] border-t border-[#1C2430] p-2.5", children: /* @__PURE__ */ jsx(FingerprintDelta, { track: sess?.track, car: sess?.car, thisLapS: sess?.best_lap_s != null ? Number(sess.best_lap_s) : null }) })
      ] }) }),
      /* @__PURE__ */ jsx(ResizableHandle, {}),
      /* @__PURE__ */ jsx(ResizablePanel, { defaultSize: 30, minSize: 20, children: /* @__PURE__ */ jsxs(ResizablePanelGroup, { direction: "vertical", children: [
        /* @__PURE__ */ jsx(ResizablePanel, { defaultSize: 35, minSize: 25, children: /* @__PURE__ */ jsxs("div", { className: "h-full flex flex-col overflow-hidden bg-[#05070A]", children: [
          /* @__PURE__ */ jsx("div", { className: "px-3 py-1.5 border-b border-[#1C2430] text-[9px] font-mono tracking-widest text-[#7A828C] uppercase font-bold shrink-0 bg-[#11161D] select-none", children: "track map geometry" }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 min-h-0 bg-[#05070A] border-b border-[#1C2430]/40", children: /* @__PURE__ */ jsx(TrackMap, { parsed }) })
        ] }) }),
        /* @__PURE__ */ jsx(ResizableHandle, {}),
        /* @__PURE__ */ jsx(ResizablePanel, { defaultSize: 65, minSize: 40, children: /* @__PURE__ */ jsxs("div", { className: "h-full flex flex-col overflow-hidden bg-[#0B0F14]", children: [
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-px bg-[#1C2430] font-mono text-[9px] uppercase tracking-wider shrink-0 overflow-x-auto select-none", children: ["cinema", "readout", "laps", "gg", "histogram", "scatter", "optimal", "whatif", "apex", "waterfall", "brake", "slip", "replay3d", "piano", "spider", "setup", "setupdiff", "instruments", "timeline", ...live.connected ? ["setupcopilot"] : []].map((t) => /* @__PURE__ */ jsxs("button", { onClick: () => setBottomTab(t), className: `px-2.5 py-1.5 text-left flex items-center justify-between border-r border-[#1C2430] last:border-r-0 shrink-0 font-bold ${bottomTab === t ? "bg-[#0B0F14] text-white" : "bg-[#11161D] text-[#7A828C] hover:text-[#E2E4E8]"}`, children: [
            /* @__PURE__ */ jsx("span", { className: "truncate", children: t === "cinema" ? "Cinema" : t === "readout" ? "Readout" : t === "laps" ? `Laps` : t === "gg" ? "g-g" : t === "optimal" ? "Optimal" : t === "whatif" ? "What-if" : t === "apex" ? "Apex" : t === "waterfall" ? "Waterfall" : t === "brake" ? "Brake" : t === "slip" ? "Slip" : t === "replay3d" ? "3D" : t === "piano" ? "Piano" : t === "spider" ? "Spider" : t === "setup" ? "Setup" : t === "setupcopilot" ? "⚡ Setup AI" : t === "instruments" ? "Instruments" : t === "timeline" ? "Timeline" : "Δ Setup" }),
            !isTabUnlocked(t) && /* @__PURE__ */ jsx("span", { className: "text-[8px] text-[#FFB800] ml-1", children: "🔒" })
          ] }, t)) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-h-0 bg-[#05070A] overflow-y-auto", children: [
            bottomTab === "cinema" && renderPanelOrLock("cinema", /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx("div", { className: "p-3 text-[10px] font-mono text-[#7A828C]", children: "Loading cinema..." }), children: /* @__PURE__ */ jsx(LazyCinemaPlayback, { parsed }) })),
            bottomTab === "readout" && renderPanelOrLock("readout", /* @__PURE__ */ jsx(LiveReadout, { parsed })),
            bottomTab === "laps" && renderPanelOrLock("laps", /* @__PURE__ */ jsx(LapList, { parsed })),
            bottomTab === "gg" && renderPanelOrLock("gg", /* @__PURE__ */ jsx(GGDiagram, { parsed })),
            bottomTab === "histogram" && renderPanelOrLock("histogram", /* @__PURE__ */ jsx(HistogramPanel, {})),
            bottomTab === "scatter" && renderPanelOrLock("scatter", /* @__PURE__ */ jsx(XYScatterPanel, {})),
            bottomTab === "optimal" && renderPanelOrLock("optimal", /* @__PURE__ */ jsx(OptimalLap, { parsed })),
            bottomTab === "whatif" && renderPanelOrLock("whatif", /* @__PURE__ */ jsx(Counterfactuals, { parsed })),
            bottomTab === "apex" && renderPanelOrLock("apex", /* @__PURE__ */ jsx(MinCornerSpeed, { parsed })),
            bottomTab === "waterfall" && renderPanelOrLock("waterfall", /* @__PURE__ */ jsx(TimeLossWaterfall, { parsed })),
            bottomTab === "brake" && renderPanelOrLock("brake", /* @__PURE__ */ jsx(BrakeBias, { parsed })),
            bottomTab === "slip" && renderPanelOrLock("slip", /* @__PURE__ */ jsx(SlipAngle, { parsed })),
            bottomTab === "replay3d" && renderPanelOrLock("replay3d", /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx("div", { className: "p-3 text-[10px] font-mono text-[#7A828C]", children: "Loading 3D replay..." }), children: /* @__PURE__ */ jsx(LazyReplayThree, { parsed }) })),
            bottomTab === "piano" && renderPanelOrLock("piano", /* @__PURE__ */ jsx(PianoRoll, { parsed })),
            bottomTab === "spider" && renderPanelOrLock("spider", /* @__PURE__ */ jsx(SectorSpider, { parsed })),
            bottomTab === "setup" && renderPanelOrLock("setup", /* @__PURE__ */ jsx(SetupSheet, { parsed })),
            bottomTab === "setupdiff" && renderPanelOrLock("setupdiff", /* @__PURE__ */ jsx(SetupDiff, { parsed, track: sess?.track, car: sess?.car, sessionId: id })),
            bottomTab === "setupcopilot" && live.connected && /* @__PURE__ */ jsx("div", { className: "h-full overflow-y-auto p-2", children: /* @__PURE__ */ jsx(SetupCopilot, { t: live }) }),
            bottomTab === "instruments" && /* @__PURE__ */ jsxs("div", { className: "h-full flex flex-col font-mono bg-[#05070A] text-white", children: [
              /* @__PURE__ */ jsxs("div", { className: "bg-[#11161D] border-b border-[#1C2430] px-3 py-2 flex items-center justify-between select-none", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold tracking-[0.2em] text-[#7A828C] uppercase", children: "WORKSPACE:" }),
                  /* @__PURE__ */ jsx("div", { className: "flex bg-[#05070A] border border-[#1C2430] rounded-sm overflow-hidden", children: Object.keys(WORKSPACE_PRESETS).map((key) => {
                    const isActive = activePreset === key;
                    return /* @__PURE__ */ jsx("button", { onClick: () => setActivePreset(key), className: `px-3 py-1 text-[9px] uppercase tracking-wider font-bold cursor-pointer ${isActive ? "bg-[#8B5CF6] text-white" : "text-[#7A828C] hover:text-[#E2E4E8]"}`, children: WORKSPACE_PRESETS[key].name }, key);
                  }) }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 ml-4 border-l border-[#1C2430] pl-4", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold tracking-[0.2em] text-[#7A828C] uppercase shrink-0", children: "FOCUS MODE:" }),
                    /* @__PURE__ */ jsx("div", { className: "flex bg-[#05070A] border border-[#1C2430] rounded-sm overflow-hidden", children: [{
                      key: "none",
                      label: "OFF"
                    }, {
                      key: "brakes",
                      label: "BRAKES"
                    }, {
                      key: "ers",
                      label: "ERS"
                    }, {
                      key: "chassis",
                      label: "CHASSIS"
                    }, {
                      key: "tires",
                      label: "TIRES"
                    }, {
                      key: "inputs",
                      label: "INPUTS"
                    }].map(({
                      key,
                      label
                    }) => {
                      const isActive = focusMode === key;
                      return /* @__PURE__ */ jsx("button", { onClick: () => setFocusMode(key), className: `px-2 py-0.5 text-[8.5px] uppercase font-bold cursor-pointer transition-colors ${isActive ? "bg-[#3B82F6] text-white" : "text-[#7A828C] hover:text-[#E2E4E8]"}`, children: label }, key);
                    }) })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("span", { className: "text-[8px] text-[#7A828C] font-bold uppercase truncate max-w-[280px] hidden lg:inline", children: WORKSPACE_PRESETS[activePreset].description })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "flex-1 p-1.5 overflow-y-auto bg-[#05070A]", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-2", children: WORKSPACE_PRESETS[activePreset].instruments.map((instrumentKey) => {
                const InstrumentComponent = TELEMETRY_INSTRUMENTS[instrumentKey];
                return /* @__PURE__ */ jsx("div", { className: "min-h-[260px] border border-[#1C2430] bg-[#0B0F14] rounded-sm", children: /* @__PURE__ */ jsx(InstrumentComponent, { telemetry: getReplayTelemetry(parsed, cursorTick), mode: "replay" }) }, instrumentKey);
              }) }) })
            ] }),
            bottomTab === "timeline" && /* @__PURE__ */ jsx("div", { className: "h-full bg-[#05070A] overflow-y-auto", children: /* @__PURE__ */ jsx(TelemetryEventTimeline, {}) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "shrink-0 border-t border-[#1C2430] bg-[#0B0F14]", children: /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx("div", { className: "p-3 font-mono text-[9px] uppercase text-[#7A828C]", children: "Loading AI coach…" }), children: /* @__PURE__ */ jsx(LazyAICoach, { parsed, track: sess?.track, car: sess?.car, sessionId: id }) }) })
        ] }) })
      ] }) })
    ] }) }) }),
    showExport && /* @__PURE__ */ jsx(ExportPwlapDialog, { sessionId: id, onClose: () => setShowExport(false) })
  ] });
}
const sessions_$id = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  component: WorkbenchPage
}, Symbol.toStringTag, { value: "Module" }));
export {
  catalogEntry as c,
  sessions_$id as s
};
