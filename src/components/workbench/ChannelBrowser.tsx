import { useMemo, useState } from "react";
import type { IbtParsed } from "@/lib/ibt/types";
import { useWorkbench, colorForChannel } from "@/lib/store";
import { Search, ChevronRight, ChevronDown, Star, Eye, EyeOff } from "lucide-react";
import { catalogEntry, ESSENTIAL_CHANNELS, GROUP_DESCRIPTIONS } from "@/lib/ibt/channelCatalog";
import { MiniTrace } from "@/components/ui/MiniTrace";

export function ChannelBrowser({ parsed }: { parsed: IbtParsed }) {
  const { selectedChannels, toggleChannel, setChannels, cursorTick } = useWorkbench();
  const [q, setQ] = useState("");
  const [essentialsOnly, setEssentialsOnly] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({
    "Driver Inputs": true,
    Vehicle: true,
  });
  const [traceMode, setTraceMode] = useState<Record<string, boolean>>({});

  const windowFrames = useMemo(() => {
    // Keep ~3.5 seconds of data for traces based on the file's tick rate (e.g. 60Hz or 360Hz)
    return Math.max(120, Math.floor((parsed.meta.tickRate || 60) * 3.5));
  }, [parsed.meta.tickRate]);

  const grouped = useMemo(() => {
    const groups: Record<string, string[]> = {};
    const matches = (n: string) => !q || n.toLowerCase().includes(q.toLowerCase());
    // Essentials pinned section: catalog-ordered, only channels actually present.
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
    // Stable order: Essentials first, then alphabetic.
    const ordered: Record<string, string[]> = {};
    if (groups["Essentials"]) ordered["Essentials"] = groups["Essentials"];
    Object.keys(groups)
      .filter((g) => g !== "Essentials")
      .sort()
      .forEach((g) => (ordered[g] = groups[g]));
    return ordered;
  }, [parsed, q, essentialsOnly]);

  const totalShown = useMemo(
    () => Object.values(grouped).reduce((a, b) => a + b.length, 0),
    [grouped],
  );

  const toggleGroupAll = (items: string[]) => {
    const allOn = items.every((n) => selectedChannels.includes(n));
    if (allOn) {
      setChannels(selectedChannels.filter((n) => !items.includes(n)));
    } else {
      const next = [...selectedChannels];
      for (const n of items) if (!next.includes(n)) next.push(n);
      setChannels(next);
    }
  };

  return (
    <aside className="hairline-r flex h-full w-72 flex-col bg-rail">
      <div className="hairline-b p-2">
        <div className="relative">
          <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${parsed.channelNames.length} channels…`}
            className="w-full rounded-sm border border-border bg-panel py-1.5 pl-7 pr-2 text-xs outline-none focus:border-primary"
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>
            {totalShown} shown · {selectedChannels.length} on
          </span>
          <button
            onClick={() => setEssentialsOnly((v) => !v)}
            className={`flex items-center gap-1 rounded-sm border px-1.5 py-0.5 ${
              essentialsOnly
                ? "border-primary text-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
            title="Show only ATLAS-style essentials"
          >
            <Star className="h-2.5 w-2.5" /> Essentials
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto font-mono text-[11px]">
        {Object.entries(grouped).map(([g, items]) => {
          const isOpen = open[g] ?? !!q;
          const onCount = items.filter((n) => selectedChannels.includes(n)).length;
          const allOn = onCount === items.length && items.length > 0;
          return (
            <div key={g} className="hairline-b">
              <div className="flex w-full items-center gap-1 px-2 py-1.5 uppercase tracking-wider text-muted-foreground hover:bg-accent">
                <button
                  onClick={() => setOpen({ ...open, [g]: !isOpen })}
                  className="flex flex-1 items-center gap-1 text-left"
                  title={GROUP_DESCRIPTIONS[g] ?? g}
                >
                  {isOpen ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                  {g}
                  <span className="ml-1 text-[10px] normal-case tracking-normal text-muted-foreground/70">
                    {onCount > 0 ? `${onCount}/${items.length}` : items.length}
                  </span>
                </button>
                <button
                  onClick={() => toggleGroupAll(items)}
                  className="rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
                  title={allOn ? "Hide all in group" : "Show all in group"}
                >
                  {allOn ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </button>
              </div>
              {isOpen && GROUP_DESCRIPTIONS[g] && (
                <div className="px-2 pb-1 text-[10px] normal-case tracking-normal text-muted-foreground/70">
                  {GROUP_DESCRIPTIONS[g]}
                </div>
              )}
              {isOpen && (
                <ul>
                  {items.map((name) => {
                    const ch = parsed.channels[name];
                    const sel = selectedChannels.includes(name);
                    const v = ch.data[cursorTick] ?? 0;
                    const cat = catalogEntry(name);
                    return (
                      <li key={name} className="flex items-center w-full group">
                        <button
                          onClick={() => toggleChannel(name)}
                          title={cat?.desc ?? ch.desc ?? name}
                          className={`flex flex-1 items-center gap-2 px-2 py-1 text-left hover:bg-accent group/btn ${sel ? "bg-accent/60" : ""}`}
                        >
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{
                              background: sel ? colorForChannel(name) : "transparent",
                              outline: "1px solid var(--border-strong)",
                            }}
                          />
                          <span className="truncate group-hover/btn:text-zinc-300 transition-colors">
                            {name}
                          </span>
                        </button>

                        {/* Value / Trace toggle area */}
                        <div
                          className="ml-auto flex items-center shrink-0 cursor-pointer pl-2 hover:bg-zinc-800/50 rounded transition-colors group/val"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTraceMode((m) => ({ ...m, [name]: !m[name] }));
                          }}
                          title={`Click to show ${traceMode[name] ? "RAW" : "TRACE"}`}
                        >
                          {traceMode[name] ? (
                            <span className="flex items-center gap-1.5">
                              <MiniTrace
                                values={Array.from(
                                  ch.data.slice(
                                    Math.max(0, cursorTick - windowFrames),
                                    cursorTick + 1,
                                  ),
                                )}
                                color={colorForChannel(name)}
                              />
                              <span className="text-[7px] uppercase tracking-wider text-zinc-600 opacity-0 group-hover/val:opacity-100 transition-opacity select-none">
                                trc
                              </span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <span className="tabular-nums text-muted-foreground w-16 text-right">
                                {Number.isFinite(v) ? v.toFixed(2) : "—"}
                                {ch.unit ? (
                                  <span className="text-[9px] text-zinc-600 ml-0.5">{ch.unit}</span>
                                ) : (
                                  ""
                                )}
                              </span>
                              <span className="text-[7px] uppercase tracking-wider text-zinc-600 opacity-0 group-hover/val:opacity-100 transition-opacity select-none w-4">
                                raw
                              </span>
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
        {totalShown === 0 && (
          <div className="px-3 py-6 text-center text-[11px] text-muted-foreground">
            No channels match.
          </div>
        )}
      </div>
    </aside>
  );
}
