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
  >("cinema");

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
      <div className="relative h-full w-full flex flex-col items-center justify-center bg-zinc-950/95 text-center p-6 border border-zinc-900 rounded-sm overflow-hidden select-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-10 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center max-w-sm">
          <div className="size-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3 text-amber-400 text-sm shadow-[0_0_15px_rgba(245,158,11,0.05)] animate-pulse">
            🔒
          </div>
          <h3 className="font-mono uppercase text-[10px] tracking-widest text-zinc-200">
            Locked Analysis Sheet
          </h3>
          <p className="mt-2 font-mono text-[9px] text-zinc-500 leading-relaxed uppercase tracking-wider">
            This sheet is active in the premium <span className="text-zinc-300 font-semibold">{unlockingWorkspace}</span>.
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
        let buf: ArrayBuffer;

        // Gap 4: If we have the blob in memory, read it directly and don't download it from supabase
        if (pendingLocalBlob) {
          buf = await pendingLocalBlob.arrayBuffer();
          setProgress({ phase: "download", pct: 50, msg: "Reading from local memory" });
          setPendingLocalBlob(null); // clear it
        } else {
          const { data: blob, error: e2 } = await supabase.storage
            .from("telemetry")
            .download(row.storage_path);
          if (e2) throw e2;
          buf = await blob.arrayBuffer();
        }

        if (cancelled) return;
        const isPwlap = isPwlapPath(row.storage_path) || isPwlapPath(row.name);
        if (isPwlap) {
          setProgress({ phase: "parse", pct: 50, msg: "Decoding .pwlap recording" });
          const text = new TextDecoder().decode(buf);
          const doc = JSON.parse(text) as RecordingDoc;
          if (doc.format !== "pwlap") throw new Error("Not a Pit Wall recording (.pwlap)");
          const result = pwlapToParsed(doc);
          if (cancelled) return;
          setParsed(result);
          setProgress(null);
        } else {
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
    <div className="flex h-screen flex-col bg-background text-foreground">
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
                  <option key={w.key} value={w.key} className="bg-zinc-950 text-foreground font-mono uppercase text-[10px]">
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
          <div className="flex min-h-0 flex-1">
            <ChannelBrowser parsed={parsed} />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-hidden">
                <StackedTraces parsed={parsed} />
              </div>
              <Suspense
                fallback={
                  <div className="hairline-t px-3 py-2 font-mono text-[10px] uppercase text-muted-foreground">
                    Loading timeline...
                  </div>
                }
              >
                <LazyTimeline parsed={parsed} />
              </Suspense>
              <div className="hairline-t flex h-72 shrink-0">
                <div className="hairline-r w-1/2 bg-panel">
                  <TrackMap parsed={parsed} />
                </div>
                <div className="flex flex-1 flex-col bg-panel">
                  <div className="hairline-b flex items-center gap-px bg-border font-mono text-[11px] uppercase tracking-wider">
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
                      ] as const
                    ).map((t) => (
                      <button
                        key={t}
                        onClick={() => setBottomTab(t)}
                        className={`flex-1 px-3 py-1.5 text-left flex items-center justify-between border-r border-zinc-900/50 last:border-r-0 ${
                          bottomTab === t
                            ? "bg-panel text-foreground"
                            : "bg-rail text-muted-foreground hover:text-foreground"
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
                                                      : "Δ Setup"}
                        </span>
                        {!isTabUnlocked(t) && (
                          <span className="text-[9px] text-amber-500/70 ml-1">🔒</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="min-h-0 flex-1">
                    {bottomTab === "cinema" && renderPanelOrLock("cinema", (
                      <Suspense
                        fallback={
                          <div className="p-3 text-xs text-muted-foreground">Loading cinema...</div>
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
                          <div className="p-3 text-xs text-muted-foreground">
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
                  </div>
                </div>
              </div>
              <div className="hairline-t bg-bg p-3">
                <FingerprintDelta
                  track={sess?.track}
                  car={sess?.car}
                  thisLapS={sess?.best_lap_s != null ? Number(sess.best_lap_s) : null}
                />
              </div>
              <Suspense
                fallback={
                  <div className="hairline-t bg-bg p-3 font-mono text-[10px] uppercase text-muted-foreground">
                    Loading AI coach…
                  </div>
                }
              >
                <LazyAICoach parsed={parsed} track={sess?.track} car={sess?.car} sessionId={id} />
              </Suspense>
            </div>
          </div>
        </>
      )}
      {showExport && <ExportPwlapDialog sessionId={id} onClose={() => setShowExport(false)} />}
    </div>
  );
}
