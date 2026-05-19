import type { IbtParsed } from "@/lib/ibt/types";

export interface WorkbenchPerfStats {
  parseMs: number;
  fileSizeMb: number;
}

export function WorkbenchPerfHud({
  parsed,
  stats,
}: {
  parsed: IbtParsed;
  stats: WorkbenchPerfStats;
}) {
  const samples = parsed.meta.numTicks;
  const channels = parsed.channelNames.length;
  const laps = parsed.laps.length;

  return (
    <div className="fixed bottom-3 right-3 z-50 rounded-md border border-border bg-panel/95 px-3 py-2 font-mono text-[10px] text-muted-foreground shadow-lg backdrop-blur">
      <div className="mb-1 text-[9px] uppercase tracking-widest text-primary">Debug</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 tabular-nums">
        <span>parse</span>
        <span className="text-foreground">{stats.parseMs}ms</span>
        <span>file</span>
        <span className="text-foreground">{stats.fileSizeMb.toFixed(1)} MB</span>
        <span>samples</span>
        <span className="text-foreground">{samples.toLocaleString()}</span>
        <span>channels</span>
        <span className="text-foreground">{channels}</span>
        <span>laps</span>
        <span className="text-foreground">{laps}</span>
        <span>hz</span>
        <span className="text-foreground">{parsed.meta.tickRate}</span>
      </div>
    </div>
  );
}
