import { lazy, Suspense } from "react";
import type { IbtParsed } from "@/lib/ibt/types";
import type { Tables } from "@/integrations/supabase/types";
import { LapList } from "@/components/workbench/LapList";
import { LiveReadout } from "@/components/workbench/LiveReadout";
import { MinCornerSpeed } from "@/components/workbench/MinCornerSpeed";
import { BrakeBias } from "@/components/workbench/BrakeBias";
import { SlipAngle } from "@/components/workbench/SlipAngle";
import { PianoRoll } from "@/components/workbench/PianoRoll";
import { SetupSheet } from "@/components/workbench/SetupSheet";

const CinemaPlayback = lazy(() =>
  import("@/components/workbench/CinemaPlayback").then((m) => ({ default: m.CinemaPlayback })),
);
const GGDiagram = lazy(() =>
  import("@/components/workbench/GGDiagram").then((m) => ({ default: m.GGDiagram })),
);
const OptimalLap = lazy(() =>
  import("@/components/workbench/OptimalLap").then((m) => ({ default: m.OptimalLap })),
);
const Counterfactuals = lazy(() =>
  import("@/components/workbench/Counterfactuals").then((m) => ({ default: m.Counterfactuals })),
);
const ReplayThree = lazy(() =>
  import("@/components/workbench/ReplayThree").then((m) => ({ default: m.ReplayThree })),
);
const SectorSpider = lazy(() =>
  import("@/components/workbench/SectorSpider").then((m) => ({ default: m.SectorSpider })),
);
const TimeLossWaterfall = lazy(() =>
  import("@/components/workbench/TimeLossWaterfall").then((m) => ({ default: m.TimeLossWaterfall })),
);
const SetupDiff = lazy(() =>
  import("@/components/workbench/SetupDiff").then((m) => ({ default: m.SetupDiff })),
);
const StintAnalysis = lazy(() =>
  import("@/components/workbench/StintAnalysis").then((m) => ({ default: m.StintAnalysis })),
);

export type WorkbenchBottomTab =
  | "cinema"
  | "readout"
  | "laps"
  | "stint"
  | "gg"
  | "optimal"
  | "whatif"
  | "apex"
  | "waterfall"
  | "brake"
  | "slip"
  | "replay3d"
  | "piano"
  | "spider"
  | "setup"
  | "setupdiff";

function PaneFallback({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
      Loading {label}…
    </div>
  );
}

export function WorkbenchBottomPane({
  tab,
  parsed,
  sess,
  sessionId,
}: {
  tab: WorkbenchBottomTab;
  parsed: IbtParsed;
  sess: Tables<"telemetry_sessions"> | null;
  sessionId: string;
}) {
  switch (tab) {
    case "readout":
      return <LiveReadout parsed={parsed} />;
    case "laps":
      return <LapList parsed={parsed} />;
    case "apex":
      return <MinCornerSpeed parsed={parsed} />;
    case "brake":
      return <BrakeBias parsed={parsed} />;
    case "slip":
      return <SlipAngle parsed={parsed} />;
    case "piano":
      return <PianoRoll parsed={parsed} />;
    case "setup":
      return <SetupSheet parsed={parsed} />;
    case "cinema":
      return (
        <Suspense fallback={<PaneFallback label="cinema" />}>
          <CinemaPlayback parsed={parsed} />
        </Suspense>
      );
    case "gg":
      return (
        <Suspense fallback={<PaneFallback label="g-g" />}>
          <GGDiagram parsed={parsed} />
        </Suspense>
      );
    case "optimal":
      return (
        <Suspense fallback={<PaneFallback label="optimal" />}>
          <OptimalLap parsed={parsed} />
        </Suspense>
      );
    case "whatif":
      return (
        <Suspense fallback={<PaneFallback label="what-if" />}>
          <Counterfactuals parsed={parsed} />
        </Suspense>
      );
    case "waterfall":
      return (
        <Suspense fallback={<PaneFallback label="waterfall" />}>
          <TimeLossWaterfall parsed={parsed} />
        </Suspense>
      );
    case "replay3d":
      return (
        <Suspense fallback={<PaneFallback label="3d replay" />}>
          <ReplayThree parsed={parsed} />
        </Suspense>
      );
    case "spider":
      return (
        <Suspense fallback={<PaneFallback label="sector spider" />}>
          <SectorSpider parsed={parsed} />
        </Suspense>
      );
    case "setupdiff":
      return (
        <Suspense fallback={<PaneFallback label="setup diff" />}>
          <SetupDiff parsed={parsed} track={sess?.track} car={sess?.car} sessionId={sessionId} />
        </Suspense>
      );
    case "stint":
      return (
        <Suspense fallback={<PaneFallback label="stint" />}>
          <StintAnalysis parsed={parsed} />
        </Suspense>
      );
    default:
      return null;
  }
}

export const BOTTOM_TAB_LABELS: Record<WorkbenchBottomTab, string> = {
  cinema: "Cinema",
  readout: "Readout",
  laps: "Laps",
  stint: "Stint",
  gg: "g-g",
  optimal: "Optimal",
  whatif: "What-if",
  apex: "Apex",
  waterfall: "Waterfall",
  brake: "Brake",
  slip: "Slip",
  replay3d: "3D",
  piano: "Piano",
  spider: "Spider",
  setup: "Setup",
  setupdiff: "Δ Setup",
};
