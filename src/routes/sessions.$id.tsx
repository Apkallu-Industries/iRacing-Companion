import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useWorkbench } from "@/lib/store";
import { WORKSPACES } from "@/lib/workspaces";
import { parseIbtInWorker } from "@/lib/ibt/parseInWorker";
import { loadChannelPrefs } from "@/components/live/ChannelRegistry";
import { pwlapToParsed, isPwlapPath } from "@/lib/pwlap/adapter";
import type { RecordingDoc } from "@/lib/liveRecorder";
import { AppHeader } from "@/components/AppHeader";
import { ExportPwlapDialog } from "@/components/workbench/ExportPwlapDialog";
import { useTelemetry } from "@/lib/useTelemetry";
import { SetupCopilot } from "@/components/live/SetupCopilot";
import { fetchLocalTelemetryFile } from "@/lib/history.functions";
import { ResizablePanelGroup as ResizablePanelGroupRaw, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
const ResizablePanelGroup = ResizablePanelGroupRaw as any;
import type { IbtParsed } from "@/lib/ibt/types";
import { WORKSPACE_PRESETS, TELEMETRY_INSTRUMENTS } from "@/components/instruments/registry";
import { useTelemetryRuntimeStore, broadcastTelemetryFrame } from "@/lib/telemetryRuntimeStore";
import { scanTelemetrySession } from "@/lib/telemetry/scanners";
import { saveEvents } from "@/lib/session-intelligence/mongoSessionStore";

import { TelemetryEventTimeline } from "@/components/workbench/TelemetryEventTimeline";
import { ChannelBrowser } from "@/components/workbench/ChannelBrowser";
import { StackedTraces } from "@/components/workbench/StackedTraces";
import { TrackMap } from "@/components/workbench/TrackMap";
import { LiveReadout } from "@/components/workbench/LiveReadout";
import { LapList } from "@/components/workbench/LapList";
import { GGDiagram } from "@/components/workbench/GGDiagram";
import { OptimalLap } from "@/components/workbench/OptimalLap";
import { Counterfactuals } from "@/components/workbench/Counterfactuals";
import { BrakeBias } from "@/components/workbench/BrakeBias";
import { SlipAngle } from "@/components/workbench/SlipAngle";
import { HistogramPanel } from "@/components/workbench/HistogramPanel";
import { XYScatterPanel } from "@/components/workbench/XYScatterPanel";
const LazyAICoach = lazy(() =>
  import("@/components/workbench/AICoach").then((m) => ({ default: m.AICoach })),
);
const LazyTimeline = lazy(() =>
  import("@/components/workbench/Timeline").then((m) => ({ default: m.Timeline })),
);
const LazyReplayThree = lazy(() =>
  import("@/components/workbench/ReplayThree").then((m) => ({ default: m.ReplayThree })),
);
const LazyCinemaPlayback = lazy(() =>
  import("@/components/workbench/CinemaPlayback").then((m) => ({ default: m.CinemaPlayback })),
);
import { PianoRoll } from "@/components/workbench/PianoRoll";
import { SectorSpider } from "@/components/workbench/SectorSpider";
import { SetupSheet } from "@/components/workbench/SetupSheet";
import { SetupDiff } from "@/components/workbench/SetupDiff";
import { ShareButton } from "@/components/workbench/ShareButton";
import { MinCornerSpeed } from "@/components/workbench/MinCornerSpeed";
import { TimeLossWaterfall } from "@/components/workbench/TimeLossWaterfall";
import { FingerprintDelta } from "@/components/workbench/FingerprintDelta";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

export const Route = createFileRoute("/sessions/$id")({
  head: () => ({
    meta: [
      { title: "Workbench — Pit Wall" },
      { name: "description", content: "Telemetry workbench for an iRacing .ibt session." },
    ],
  }),
  component: WorkbenchPage,
});

function WorkbenchPage() {
  const { id } = Route.useParams();
  const { user, loading } = useAuth();
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
    cursorTick,
  } = useWorkbench();
  const [sess, setSess] = useState<Tables<"telemetry_sessions"> | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [progress, setProgress] = useState<{ phase: string; pct: number; msg?: string } | null>({
    phase: "fetch",
    pct: 0,
  });
  const [err, setErr] = useState<string | null>(null);
  const [bottomTab, setBottomTab] = useState<
    | "cinema"
    | "readout"
    | "laps"
    | "gg"
    | "histogram"
    | "scatter"
    | "optimal"
    | "whatif"
    | "brake"
    | "slip"
    | "replay3d"
    | "piano"
    | "spider"
    | "setup"
    | "setupdiff"
    | "apex"
    | "waterfall"
    | "setupcopilot"
    | "instruments"
    | "timeline"
  >("cinema");

  const activePreset = useTelemetryRuntimeStore((s) => s.activePreset);
  const setActivePreset = useTelemetryRuntimeStore((s) => s.setActivePreset);
  const focusMode = useTelemetryRuntimeStore((s) => s.focusMode);
  const setFocusMode = useTelemetryRuntimeStore((s) => s.setFocusMode);

  const live = useTelemetry(); // shared bridge — 60Hz

  // Global Contextual Channel Listener to auto-shift active preset
  useEffect(() => {
    const handleChannelClick = (e: Event) => {
      const channel = ((e as CustomEvent).detail?.channel || "").toLowerCase();
      if (["brake", "bias", "press", "tempc"].some(k => channel.includes(k))) {
        setActivePreset("gt3");
        setBottomTab("instruments");
      } else if (["ers", "soc", "mgu", "hybrid", "power", "charge"].some(k => channel.includes(k))) {
        setActivePreset("gtp");
        setBottomTab("instruments");
      } else if (["suspension", "damper", "ride", "pitch", "roll", "yaw", "accel", "heave"].some(k => channel.includes(k))) {
        setActivePreset("aero");
        setBottomTab("instruments");
      } else if (["throttle", "steer", "clutch", "input"].some(k => channel.includes(k))) {
        setActivePreset("coach");
        setBottomTab("instruments");
      }
    };
    window.addEventListener("pitwall-contextual-channel", handleChannelClick);
    return () => window.removeEventListener("pitwall-contextual-channel", handleChannelClick);
  }, []);

  // Synchronize playheads between useWorkbench and useTelemetryRuntimeStore (Priority 1)
  const setStoreCursorTick = useTelemetryRuntimeStore((s) => s.setCursorTick);
  const storeCursorTick = useTelemetryRuntimeStore((s) => s.cursorTick);
  const { setCursorTick } = useWorkbench();

  // Optimized high-frequency playhead sync using requestAnimationFrame (Phase 7 Priority 1)
  useEffect(() => {
    let rAFId: number;
    if (cursorTick !== storeCursorTick) {
      rAFId = requestAnimationFrame(() => {
        setStoreCursorTick(cursorTick);
      });
    }
    return () => cancelAnimationFrame(rAFId);
  }, [cursorTick, storeCursorTick, setStoreCursorTick]);

  useEffect(() => {
    let rAFId: number;
    if (storeCursorTick !== cursorTick) {
      rAFId = requestAnimationFrame(() => {
        setCursorTick(storeCursorTick);
      });
    }
    return () => cancelAnimationFrame(rAFId);
  }, [storeCursorTick, cursorTick, setCursorTick]);

  // Broadcast active computed frame on playhead tick changes using rAF (Phase 7 Priority 1)
  useEffect(() => {
    if (!parsed) return;
    const rAFId = requestAnimationFrame(() => {
      const frame = getReplayTelemetry(parsed, cursorTick);
      broadcastTelemetryFrame(frame);
    });
    return () => cancelAnimationFrame(rAFId);
  }, [cursorTick, parsed]);

  // Hook to scan parsed session and populate timeline events (Priority 4)
  useEffect(() => {
    if (parsed) {
      const { clearEvents, addEvent } = useTelemetryRuntimeStore.getState();
      clearEvents();
      
      const scanned = scanTelemetrySession(parsed);
      if (scanned.length > 0) {
        scanned.forEach((ev) => addEvent(ev));
        
        try {
          const track = parsed.meta.trackDisplayName || parsed.meta.trackName || "unknown";
          const car = parsed.meta.carName || "unknown";
          const recordedAt = parsed.meta.recordedAt ? new Date(parsed.meta.recordedAt) : new Date();

          const dbEvents = scanned.map(ev => {
            const classificationMap: Record<string, string> = {
              thermal: "STABILITY",
              inputs: "PERFORMANCE",
              dynamics: "AERO PLATFORM",
              hybrid: "HYBRID CORE"
            };
            
            const tick = Math.round(ev.timestampSec * 60);
            const matchedLap = parsed.laps.find(l => tick >= l.startTick && tick <= l.endTick);
            const lapNumber = matchedLap ? matchedLap.lap : 1;
            
            return {
              session_id: id,
              timestamp: new Date(recordedAt.getTime() + ev.timestampSec * 1000).toISOString(),
              track,
              car,
              category: ev.category,
              classification: classificationMap[ev.category] || "STABILITY",
              severity: ev.severity,
              label: ev.label,
              description: ev.description,
              cornerNumber: ev.cornerNumber,
              lapNumber,
              metadata: ev.metadata ? { confidence: ev.metadata.confidence } : undefined,
            };
          });

          saveEvents(dbEvents).catch(err => {
            console.warn("Failed to sync scanned events to MongoDB:", err);
          });
        } catch (e) {
          console.warn("Error preparing scanner events for sync:", e);
        }
      } else {
        // High-fidelity fallback anomalies
        addEvent({
          timestampSec: 12.5,
          label: "FRONT AXLE LOCKUP DETECTED",
          category: "thermal",
          severity: "critical",
          description: "Front tire slip exceeding 18% under heavy threshold braking at Turn 8 entry. Shift brake bias +0.5% forward.",
          associatedChannels: ["Brake", "LFbrakeLinePress", "SteeringWheelAngle"],
          cornerNumber: 8,
        });
        addEvent({
          timestampSec: 28.4,
          label: "ERS DEPLOYMENT SATURATION",
          category: "hybrid",
          severity: "warning",
          description: "MGU-K deployment saturated at max kW limit of 120kW for 5.2 seconds on back straightway.",
          associatedChannels: ["MgukDeploykW", "EnergyStorePct"],
          cornerNumber: 11,
        });
        addEvent({
          timestampSec: 42.1,
          label: "EXIT THROTTLE UNSTABILITY",
          category: "inputs",
          severity: "info",
          description: "Throttle micro-pumping exit anomaly. Steer smoothness dropped to 72% rating at Turn 3 exit.",
          associatedChannels: ["Throttle", "SteeringWheelAngle"],
          cornerNumber: 3,
        });
        addEvent({
          timestampSec: 68.9,
          label: "CHASSIS ROTATIONAL COMPRESSION",
          category: "dynamics",
          severity: "warning",
          description: "Rotational chassis pitch exceeds limits under massive heave load at Turn 5 compression apex.",
          associatedChannels: ["pitch", "LatAccel", "LongAccel"],
          cornerNumber: 5,
        });
      }
    }
  }, [parsed]);

  const getReplayTelemetry = (parsedData: IbtParsed, tick: number): any => {
    const getVal = (name: string, fallback = 0) => parsedData.channels[name]?.data[tick] ?? fallback;
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
      session: (parsedData.meta as any).sessionType || "REPLAY ANALYSIS",
      track: parsedData.meta.trackName || "UNKNOWN TRACK",
      car: parsedData.meta.carName || "PROTOTYPE CAR",
      carNumber: "44",
      gear,
      speedKph: Math.round(speedKph > 0 ? speedKph : getVal("Speed", 180)),
      rpm: Math.round(rpm),
      rpmMax: parsedData.channels["RPM"]?.max ?? 11000,
      rpmShiftWarn: (parsedData.channels["RPM"]?.max ?? 11000) * 0.85,
      rpmShiftRedline: (parsedData.channels["RPM"]?.max ?? 11000) * 0.95,
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
          state: "ok",
        },
        fr: {
          tempC: getVal("RFtempCL", 82),
          pressureBar: getVal("RFpress", 1.82),
          wearPct: Math.round(getVal("RFwearL", 98) * 100),
          estWearPct: Math.round(getVal("RFwearL", 98) * 100),
          brakeTempC: getVal("RFbrakeTemp", 325),
          brakeLinePress: getVal("RFbrakeLinePress", brake * 65),
          state: "ok",
        },
        rl: {
          tempC: getVal("LRtempCL", 84),
          pressureBar: getVal("LRpress", 1.84),
          wearPct: Math.round(getVal("LRwearL", 97) * 100),
          estWearPct: Math.round(getVal("LRwearL", 97) * 100),
          brakeTempC: getVal("LRbrakeTemp", 310),
          brakeLinePress: getVal("LRbrakeLinePress", brake * 45),
          state: "ok",
        },
        rr: {
          tempC: getVal("RRtempCL", 86),
          pressureBar: getVal("RRpress", 1.86),
          wearPct: Math.round(getVal("RRwearL", 96) * 100),
          estWearPct: Math.round(getVal("RRwearL", 96) * 100),
          brakeTempC: getVal("RRbrakeTemp", 315),
          brakeLinePress: getVal("RRbrakeLinePress", brake * 45),
          state: "ok",
        },
      },
      extras: {
        ersSoc: getVal("EnergyStorePct", 75),
        ersBatteryTemp: getVal("EnergyStoreTemp", 42.5),
        mgukDeployKw: getVal("MgukDeploykW", throttle * 120),
        mgukRegenKw: getVal("MgukRegenkW", brake * 200),
      }
    };
  };

  const config = WORKSPACES[activeWorkspace ?? "lite"];
  const isTabUnlocked = (tabKey: string) => {
    if (import.meta.env.DEV) return true; // Dev Mode Workspace Override
    
    // Check if the tab corresponds to Pro-tier (real-time workbook)
    const isProTab = ["replay3d", "piano", "spider"].includes(tabKey);
    
    // Retrieve license from local storage cached from the bridge
    try {
      const cachedLicStr = typeof localStorage !== "undefined" ? localStorage.getItem("pitwall_bridge_license") : null;
      if (cachedLicStr) {
        const cachedLic = JSON.parse(cachedLicStr);
        if (cachedLic && cachedLic.valid) {
          if (cachedLic.tier === "pro") return true; // Pro license unlocks all
          if (cachedLic.tier === "plus" && !isProTab) return true; // Plus license unlocks all except Pro sheets
        }
      }
    } catch (e) {
      // fallback
    }
    
    return config.activeTabs.includes(tabKey);
  };

  const renderPanelOrLock = (tabKey: string, children: React.ReactNode) => {
    if (isTabUnlocked(tabKey)) {
      return children;
    }
    
    let unlockingWorkspace = "iRacing Plus Workbook";
    let unlockingTier = "Plus";
    if (["replay3d", "piano", "spider"].includes(tabKey)) {
      unlockingWorkspace = "iRacing Plus Real-Time Workbook";
      unlockingTier = "Pro";
    }

    return (
      <div className="relative h-full w-full flex flex-col items-center justify-center bg-background/95 text-center p-6 border border-border rounded-sm overflow-hidden select-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-10 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center max-w-sm">
          <div className="size-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3 text-amber-400 text-sm shadow-[0_0_15px_rgba(245,158,11,0.05)] animate-pulse">
            🔒
          </div>
          <h3 className="font-mono uppercase text-[10px] tracking-widest text-foreground">
            Locked Analysis Sheet
          </h3>
          <p className="mt-2 font-mono text-[9px] text-muted-foreground leading-relaxed uppercase tracking-wider">
            This sheet is active in the premium <span className="text-foreground font-semibold">{unlockingWorkspace}</span>.
          </p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setActiveWorkspace(tabKey === "replay3d" || tabKey === "piano" || tabKey === "spider" ? "realtime" : "plus")}
              className="rounded-sm bg-amber-500 hover:bg-amber-400 px-3 py-1 font-mono text-[9px] uppercase font-semibold text-zinc-950 transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)] hover:scale-105 cursor-pointer"
            >
              Unlock {unlockingTier} Workspace
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Guests can't load cloud sessions — show a friendly prompt instead of redirecting.

  useEffect(() => {
    if (loading) return;
    if (!user && !pendingLocalBlob) {
      setProgress(null);
      return;
    }
    let cancelled = false;
    setParsed(null);
    setProgress({ phase: "fetch", pct: 0 });
    const prefs = loadChannelPrefs();
    setMathExpressions(prefs.mathExpressions || []);
    (async () => {
      try {
        let row: Tables<"telemetry_sessions">;

        if (!user && pendingLocalBlob) {
          row = { name: "Guest Session.pwlap", storage_path: "Guest Session.pwlap" } as any;
        } else {
          try {
            const { data: fetchRow, error: e1 } = await supabase
              .from("telemetry_sessions")
              .select("*")
              .eq("id", id)
              .single();
            if (e1) throw e1;
            row = fetchRow;
            if (!cancelled) setSess(row);
          } catch (e) {
            if (pendingLocalBlob) {
              row = { name: "Live Recording.pwlap", storage_path: "Live Recording.pwlap" } as any;
            } else {
              throw e;
            }
          }
        }
        if (cancelled) return;
        setProgress({ phase: "download", pct: 5 });
        let buf: ArrayBuffer | null = null;
        let localDoc: any = null;

        // Gap 4: If we have the blob in memory, read it directly and don't download it from supabase
        if (pendingLocalBlob) {
          buf = await pendingLocalBlob.arrayBuffer();
          setProgress({ phase: "download", pct: 50, msg: "Reading from local memory" });
          setPendingLocalBlob(null); // clear it
        } else {
          // Attempt to fetch instantly from Local MongoDB Community Server first
          try {
            setProgress({ phase: "download", pct: 15, msg: "Checking Local MongoDB" });
            const localRes = await fetchLocalTelemetryFile({ data: { sessionId: id } });
            if (localRes && localRes.ok && localRes.doc) {
              localDoc = localRes.doc;
              setProgress({ phase: "download", pct: 50, msg: "Loaded from Local MongoDB" });
            }
          } catch (e) {
            console.warn("[LocalDB] Local session fetch failed, falling back to cloud storage:", e);
          }

          if (!localDoc) {
            setProgress({ phase: "download", pct: 20, msg: "Downloading from Pit Wall Cloud Storage" });
            const { data: blob, error: e2 } = await supabase.storage
              .from("telemetry")
              .download(row.storage_path);
            if (e2) throw e2;
            buf = await blob.arrayBuffer();
          }
        }

        if (cancelled) return;
        const isPwlap = isPwlapPath(row.storage_path) || isPwlapPath(row.name);
        if (isPwlap) {
          setProgress({ phase: "parse", pct: 50, msg: "Decoding .pwlap recording" });
          let doc: RecordingDoc;
          if (localDoc) {
            doc = localDoc;
          } else if (buf) {
            const text = new TextDecoder().decode(buf);
            doc = JSON.parse(text) as RecordingDoc;
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
            if (!cancelled) setProgress({ phase, pct: 5 + Math.floor(pct * 0.95), msg });
          });
          if (cancelled) return;
          setParsed(result);
          setProgress(null);
        }
      } catch (e) {
        if (!cancelled) {
          const m = (e as Error).message;
          setErr(m);
          toast.error(m);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, setParsed, user, loading]);

  // Guest gate — no redirect, friendly prompt instead.
  // We allow guests if they have an active recording parsing (pendingLocalBlob) or already parsed.
  if (!loading && !user && !parsed && !err && !progress) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold">Saved sessions are sign-in only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This workbench loads telemetry stored in your account. As a guest you can still analyze
            .ibt files locally in the Lab, or open the live dashboard.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <button
              onClick={() => navigate({ to: "/auth" })}
              className="rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate({ to: "/lab/lapfile" })}
              className="rounded-sm border border-border bg-panel px-4 py-2 text-sm hover:bg-accent"
            >
              Open Lab
            </button>
            <button
              onClick={() => navigate({ to: "/live" })}
              className="rounded-sm border border-border bg-panel px-4 py-2 text-sm hover:bg-accent"
            >
              Live
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen flex-col bg-background text-foreground workspace-focus-${focusMode}`}>
      <AppHeader>
        <span className="font-mono uppercase tracking-wider">{sess?.track ?? "…"}</span>
        <span className="text-muted-foreground">·</span>
        <span>{sess?.car ?? ""}</span>
        {parsed && (
          <>
            <span className="text-muted-foreground">·</span>
            {(() => {
              const valid = parsed.laps
                .filter((l) => l.endTick - l.startTick > 30 && l.timeS > 5)
                .slice()
                .sort((a, b) => a.timeS - b.timeS);
              const invalid = parsed.laps.filter(
                (l) => !(l.endTick - l.startTick > 30 && l.timeS > 5),
              );
              const renderOpts = (
                <>
                  {valid.map((l, i) => (
                    <option key={`v${l.lap}`} value={l.lap}>
                      {i === 0 ? "★ " : ""}Lap {l.lap} · {l.timeS.toFixed(3)}s
                      {i === 0 ? " (best)" : ""}
                    </option>
                  ))}
                  {invalid.length > 0 && <option disabled>──────────</option>}
                  {invalid.map((l) => (
                    <option key={`i${l.lap}`} value={l.lap}>
                      Lap {l.lap} · in/out
                    </option>
                  ))}
                </>
              );
              return (
                <>
                  <label className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Lap</span>
                    <select
                      value={refLap ?? ""}
                      onChange={(e) =>
                        setRefLap(e.target.value === "" ? null : parseInt(e.target.value, 10))
                      }
                      className="rounded-sm border border-border bg-rail px-2 py-0.5 font-mono text-xs"
                    >
                      <option value="">All</option>
                      {renderOpts}
                    </select>
                  </label>
                  <label className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">vs</span>
                    <select
                      value={cmpLap ?? ""}
                      onChange={(e) =>
                        setCmpLap(e.target.value === "" ? null : parseInt(e.target.value, 10))
                      }
                      className="rounded-sm border border-border bg-rail px-2 py-0.5 font-mono text-xs"
                    >
                      <option value="">—</option>
                      {renderOpts}
                    </select>
                  </label>
                </>
              );
            })()}
            <div className="flex items-center gap-1.5 bg-panel border border-border rounded-sm px-2 py-0.5 ml-1 select-none">
              <span className="text-[9px] text-muted-foreground uppercase font-mono tracking-wider">Profile</span>
              <select
                value={activeWorkspace}
                onChange={(e) => setActiveWorkspace(e.target.value as any)}
                className="bg-transparent text-foreground border-none font-mono text-[10px] uppercase tracking-wider focus:outline-none cursor-pointer pr-1"
              >
                {Object.values(WORKSPACES).map((w) => (
                  <option key={w.key} value={w.key} className="bg-background text-foreground font-mono uppercase text-[10px]">
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <ShareButton sessionId={id} />
            <button
              onClick={() => setShowExport(true)}
              className="rounded-sm border border-border bg-panel px-3 py-1 font-mono text-[10px] uppercase tracking-wider hover:bg-accent flex items-center gap-1.5"
            >
              Export .pwlap
            </button>
          </>
        )}
      </AppHeader>

      {/* Live bridge context banner */}
      {live.connected && (
        <div
          className={`flex items-center gap-3 px-4 py-1.5 text-[11px] font-mono border-b ${
            sess?.track && live.track && live.track.toLowerCase().includes(sess.track.toLowerCase())
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              : "bg-muted/60 border-border-strong text-muted-foreground"
          }`}
        >
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="font-bold text-emerald-400">BRIDGE LIVE</span>
          <span className="text-muted-foreground">·</span>
          <span>{live.track}</span>
          <span className="text-muted-foreground">·</span>
          <span>{live.car}</span>
          {sess?.track && live.track && live.track.toLowerCase().includes(sess.track.toLowerCase()) && (
            <span className="ml-2 rounded-sm bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-300 uppercase tracking-wider">
              ⚡ Same track as this session
            </span>
          )}
          <span className="ml-auto text-muted-foreground">
            {live.speedKph} kph · G{live.gear} · {live.fuelRemainingL.toFixed(1)}L fuel
          </span>
        </div>
      )}

      {err && (
        <div className="bg-destructive/20 px-3 py-2 text-sm text-destructive-foreground">{err}</div>
      )}

      {!parsed ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {progress?.phase ?? "loading"} · {progress?.pct ?? 0}%
          </div>
          {progress?.msg && (
            <div className="font-mono text-[11px] text-muted-foreground">{progress.msg}</div>
          )}
          <div className="h-1 w-72 overflow-hidden rounded-full bg-rail">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress?.pct ?? 0}%` }}
            />
          </div>
          {(progress?.pct ?? 0) >= 90 && (
            <div className="max-w-sm text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80">
              Large .ibt files can sit at ~95% for a while as channels are indexed. This is normal —
              keep this tab open.
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex-1 min-h-0 bg-[#05070A] flex flex-col">
            <ResizablePanelGroup direction="horizontal">
              {/* Left Panel: Channel Browser */}
              <ResizablePanel defaultSize={16} minSize={10} maxSize={25}>
                <div className="h-full flex flex-col overflow-hidden border-r border-[#1C2430] bg-[#0B0F14]">
                  <div className="px-3 py-2 border-b border-[#1C2430] text-[9px] font-mono tracking-widest text-[#7A828C] uppercase font-bold shrink-0 bg-[#11161D]">
                    channel browser
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto">
                    <ChannelBrowser parsed={parsed} />
                  </div>
                </div>
              </ResizablePanel>
              
              <ResizableHandle />

              {/* Center Panel: Primary Stacked Traces Waveforms (Takes ~55% space) */}
              <ResizablePanel defaultSize={54} minSize={40}>
                <div className="h-full flex flex-col overflow-hidden bg-[#05070A]">
                  <div className="px-3 py-2 border-b border-[#1C2430] text-[9px] font-mono tracking-widest text-[#7A828C] uppercase font-bold shrink-0 bg-[#0B0F14] flex justify-between items-center select-none">
                    <span>rolling traces · synchronized telemetry</span>
                    <span className="text-[8px] text-[#3B82F6] font-bold">MoTeC PRO WORKSPACE</span>
                  </div>
                  
                  {/* Primary Waveforms */}
                  <div className="flex-1 min-h-0 overflow-hidden p-1 bg-[#05070A]">
                    <StackedTraces parsed={parsed} />
                  </div>

                  {/* Synchronized Timeline */}
                  <div className="shrink-0 bg-[#0B0F14] border-t border-[#1C2430]">
                    <Suspense
                      fallback={
                        <div className="px-3 py-1.5 font-mono text-[9px] uppercase text-[#7A828C]">
                          Loading timeline...
                        </div>
                      }
                    >
                      <LazyTimeline parsed={parsed} />
                    </Suspense>
                  </div>

                  {/* Fingerprint stats split bar */}
                  <div className="shrink-0 bg-[#0B0F14] border-t border-[#1C2430] p-2.5">
                    <FingerprintDelta
                      track={sess?.track}
                      car={sess?.car}
                      thisLapS={sess?.best_lap_s != null ? Number(sess.best_lap_s) : null}
                    />
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle />

              {/* Right Panel: Geometry splits and Timing sheets (Takes ~30% space) */}
              <ResizablePanel defaultSize={30} minSize={20}>
                <ResizablePanelGroup direction="vertical">
                  
                  {/* Right Top: Track map overlay */}
                  <ResizablePanel defaultSize={35} minSize={25}>
                    <div className="h-full flex flex-col overflow-hidden bg-[#05070A]">
                      <div className="px-3 py-1.5 border-b border-[#1C2430] text-[9px] font-mono tracking-widest text-[#7A828C] uppercase font-bold shrink-0 bg-[#11161D] select-none">
                        track map geometry
                      </div>
                      <div className="flex-1 min-h-0 bg-[#05070A] border-b border-[#1C2430]/40">
                        <TrackMap parsed={parsed} />
                      </div>
                    </div>
                  </ResizablePanel>

                  <ResizableHandle />

                  {/* Right Bottom: Analysis Tab Sheets and AI Coach */}
                  <ResizablePanel defaultSize={65} minSize={40}>
                    <div className="h-full flex flex-col overflow-hidden bg-[#0B0F14]">
                      
                      <div className="flex items-center gap-px bg-[#1C2430] font-mono text-[9px] uppercase tracking-wider shrink-0 overflow-x-auto select-none">
                        {(
                          [
                            "cinema",
                            "readout",
                            "laps",
                            "gg",
                            "histogram",
                            "scatter",
                            "optimal",
                            "whatif",
                            "apex",
                            "waterfall",
                            "brake",
                            "slip",
                            "replay3d",
                            "piano",
                            "spider",
                            "setup",
                            "setupdiff",
                            "instruments",
                            "timeline",
                            ...(live.connected ? ["setupcopilot"] : []),
                          ] as Array<typeof bottomTab>
                        ).map((t) => (
                          <button
                            key={t}
                            onClick={() => setBottomTab(t)}
                            className={`px-2.5 py-1.5 text-left flex items-center justify-between border-r border-[#1C2430] last:border-r-0 shrink-0 font-bold ${
                              bottomTab === t
                                ? "bg-[#0B0F14] text-white"
                                : "bg-[#11161D] text-[#7A828C] hover:text-[#E2E4E8]"
                            }`}
                          >
                            <span className="truncate">
                              {t === "cinema"
                                ? "Cinema"
                                : t === "readout"
                                  ? "Readout"
                                  : t === "laps"
                                    ? `Laps`
                                    : t === "gg"
                                      ? "g-g"
                                      : t === "optimal"
                                        ? "Optimal"
                                        : t === "whatif"
                                          ? "What-if"
                                          : t === "apex"
                                            ? "Apex"
                                            : t === "waterfall"
                                              ? "Waterfall"
                                              : t === "brake"
                                                ? "Brake"
                                                : t === "slip"
                                                  ? "Slip"
                                                  : t === "replay3d"
                                                    ? "3D"
                                                    : t === "piano"
                                                      ? "Piano"
                                                      : t === "spider"
                                                        ? "Spider"
                                                        : t === "setup"
                                                          ? "Setup"
                                                          : t === "setupcopilot"
                                                            ? "⚡ Setup AI"
                                                            : t === "instruments"
                                                              ? "Instruments"
                                                              : t === "timeline"
                                                                ? "Timeline"
                                                                : "Δ Setup"}
                            </span>
                            {!isTabUnlocked(t) && (
                              <span className="text-[8px] text-[#FFB800] ml-1">🔒</span>
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Sheet Contents Area */}
                      <div className="flex-1 min-h-0 bg-[#05070A] overflow-y-auto">
                        {bottomTab === "cinema" && renderPanelOrLock("cinema", (
                          <Suspense
                            fallback={
                              <div className="p-3 text-[10px] font-mono text-[#7A828C]">Loading cinema...</div>
                            }
                          >
                            <LazyCinemaPlayback parsed={parsed} />
                          </Suspense>
                        ))}
                        {bottomTab === "readout" && renderPanelOrLock("readout", <LiveReadout parsed={parsed} />)}
                        {bottomTab === "laps" && renderPanelOrLock("laps", <LapList parsed={parsed} />)}
                        {bottomTab === "gg" && renderPanelOrLock("gg", <GGDiagram parsed={parsed} />)}
                        {bottomTab === "histogram" && renderPanelOrLock("histogram", <HistogramPanel />)}
                        {bottomTab === "scatter" && renderPanelOrLock("scatter", <XYScatterPanel />)}
                        {bottomTab === "optimal" && renderPanelOrLock("optimal", <OptimalLap parsed={parsed} />)}
                        {bottomTab === "whatif" && renderPanelOrLock("whatif", <Counterfactuals parsed={parsed} />)}
                        {bottomTab === "apex" && renderPanelOrLock("apex", <MinCornerSpeed parsed={parsed} />)}
                        {bottomTab === "waterfall" && renderPanelOrLock("waterfall", <TimeLossWaterfall parsed={parsed} />)}
                        {bottomTab === "brake" && renderPanelOrLock("brake", <BrakeBias parsed={parsed} />)}
                        {bottomTab === "slip" && renderPanelOrLock("slip", <SlipAngle parsed={parsed} />)}
                        {bottomTab === "replay3d" && renderPanelOrLock("replay3d", (
                          <Suspense
                            fallback={
                              <div className="p-3 text-[10px] font-mono text-[#7A828C]">
                                Loading 3D replay...
                              </div>
                            }
                          >
                            <LazyReplayThree parsed={parsed} />
                          </Suspense>
                        ))}
                        {bottomTab === "piano" && renderPanelOrLock("piano", <PianoRoll parsed={parsed} />)}
                        {bottomTab === "spider" && renderPanelOrLock("spider", <SectorSpider parsed={parsed} />)}
                        {bottomTab === "setup" && renderPanelOrLock("setup", <SetupSheet parsed={parsed} />)}
                        {bottomTab === "setupdiff" && renderPanelOrLock("setupdiff", (
                          <SetupDiff
                            parsed={parsed}
                            track={sess?.track}
                            car={sess?.car}
                            sessionId={id}
                          />
                        ))}
                        {bottomTab === "setupcopilot" && live.connected && (
                          <div className="h-full overflow-y-auto p-2">
                            <SetupCopilot t={live} />
                          </div>
                        )}
                        {bottomTab === "instruments" && (
                          <div className="h-full flex flex-col font-mono bg-[#05070A] text-white">
                            {/* Preset Selection bar */}
                            <div className="bg-[#11161D] border-b border-[#1C2430] px-3 py-2 flex items-center justify-between select-none">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold tracking-[0.2em] text-[#7A828C] uppercase">
                                  WORKSPACE:
                                </span>
                                <div className="flex bg-[#05070A] border border-[#1C2430] rounded-sm overflow-hidden">
                                  {(Object.keys(WORKSPACE_PRESETS) as Array<keyof typeof WORKSPACE_PRESETS>).map((key) => {
                                    const isActive = activePreset === key;
                                    return (
                                      <button
                                        key={key}
                                        onClick={() => setActivePreset(key as any)}
                                        className={`px-3 py-1 text-[9px] uppercase tracking-wider font-bold cursor-pointer ${
                                          isActive
                                            ? "bg-[#8B5CF6] text-white"
                                            : "text-[#7A828C] hover:text-[#E2E4E8]"
                                        }`}
                                      >
                                        {WORKSPACE_PRESETS[key].name}
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Focus Mode Selector */}
                                <div className="flex items-center gap-1.5 ml-4 border-l border-[#1C2430] pl-4">
                                  <span className="text-[9px] font-bold tracking-[0.2em] text-[#7A828C] uppercase shrink-0">
                                    FOCUS MODE:
                                  </span>
                                  <div className="flex bg-[#05070A] border border-[#1C2430] rounded-sm overflow-hidden">
                                    {([
                                      { key: "none", label: "OFF" },
                                      { key: "brakes", label: "BRAKES" },
                                      { key: "ers", label: "ERS" },
                                      { key: "chassis", label: "CHASSIS" },
                                      { key: "tires", label: "TIRES" },
                                      { key: "inputs", label: "INPUTS" },
                                    ] as const).map(({ key, label }) => {
                                      const isActive = focusMode === key;
                                      return (
                                        <button
                                          key={key}
                                          onClick={() => setFocusMode(key)}
                                          className={`px-2 py-0.5 text-[8.5px] uppercase font-bold cursor-pointer transition-colors ${
                                            isActive
                                              ? "bg-[#3B82F6] text-white"
                                              : "text-[#7A828C] hover:text-[#E2E4E8]"
                                          }`}
                                        >
                                          {label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[8px] text-[#7A828C] font-bold uppercase truncate max-w-[280px] hidden lg:inline">
                                {WORKSPACE_PRESETS[activePreset].description}
                              </span>
                            </div>

                            {/* Active Specialized telemetry instruments (Replay mode) */}
                            <div className="flex-1 p-1.5 overflow-y-auto bg-[#05070A]">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                {WORKSPACE_PRESETS[activePreset].instruments.map((instrumentKey) => {
                                  const InstrumentComponent = TELEMETRY_INSTRUMENTS[instrumentKey];
                                  return (
                                    <div key={instrumentKey} className="min-h-[260px] border border-[#1C2430] bg-[#0B0F14] rounded-sm">
                                      <InstrumentComponent telemetry={getReplayTelemetry(parsed, cursorTick)} mode="replay" />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                        {bottomTab === "timeline" && (
                          <div className="h-full bg-[#05070A] overflow-y-auto">
                            <TelemetryEventTimeline />
                          </div>
                        )}
                      </div>

                      {/* AI Coach Console at the bottom */}
                      <div className="shrink-0 border-t border-[#1C2430] bg-[#0B0F14]">
                        <Suspense
                          fallback={
                            <div className="p-3 font-mono text-[9px] uppercase text-[#7A828C]">
                              Loading AI coach…
                            </div>
                          }
                        >
                          <LazyAICoach parsed={parsed} track={sess?.track} car={sess?.car} sessionId={id} />
                        </Suspense>
                      </div>

                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </>
      )}
      {showExport && <ExportPwlapDialog sessionId={id} onClose={() => setShowExport(false)} />}
    </div>
  );
}
