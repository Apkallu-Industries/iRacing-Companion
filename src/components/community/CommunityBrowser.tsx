import { useEffect, useState } from "react";

/**
 * Generic MoTeC-styled drawer that lists community items with vote + import.
 * Used by gear ratios, channel layouts, and car classes.
 */
export type CommunityRow = {
  id: string;
  user_id: string;
  votes: number;
  title: string;
  subtitle?: string;
  payload: unknown;
};

export function CommunityBrowser({
  open,
  title,
  loader,
  onImport,
  onVote,
  onClose,
}: {
  open: boolean;
  title: string;
  loader: () => Promise<CommunityRow[]>;
  onImport: (row: CommunityRow) => void;
  onVote: (row: CommunityRow) => Promise<{ votes: number }>;
  onClose: () => void;
}) {
  const [rows, setRows] = useState<CommunityRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    loader()
      .then(setRows)
      .finally(() => setLoading(false));
  }, [open, loader]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center">
      <div className="w-full max-w-xl rounded-t-sm border border-zinc-800 bg-zinc-950 sm:rounded-sm">
        <div className="flex items-center justify-between border-b border-zinc-900 px-3 py-2">
          <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-400">{title}</span>
          <button
            onClick={onClose}
            className="rounded-sm bg-zinc-900 px-2 py-0.5 text-[10px] uppercase text-zinc-400 hover:text-zinc-100"
          >
            Close
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-zinc-900">
          {loading && <div className="p-4 text-center text-[10px] text-zinc-500">Loading…</div>}
          {!loading && rows.length === 0 && (
            <div className="p-4 text-center text-[10px] text-zinc-500">
              No community entries yet. Be the first to publish.
            </div>
          )}
          {rows.map((r) => (
            <Row key={r.id} row={r} onImport={onImport} onVote={onVote} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({
  row,
  onImport,
  onVote,
}: {
  row: CommunityRow;
  onImport: (r: CommunityRow) => void;
  onVote: (r: CommunityRow) => Promise<{ votes: number }>;
}) {
  const [votes, setVotes] = useState(row.votes);
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex items-center gap-3 px-3 py-2 text-[11px]">
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          const r = await onVote(row);
          setVotes(r.votes);
          setBusy(false);
        }}
        className="flex flex-col items-center rounded-sm bg-zinc-900 px-2 py-1 text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
      >
        <span className="text-[10px]">▲</span>
        <span className="tabular-nums text-[10px]">{votes}</span>
      </button>
      <div className="flex-1 min-w-0">
        <div className="truncate text-zinc-200">{row.title}</div>
        {row.subtitle && <div className="truncate text-[10px] text-zinc-500">{row.subtitle}</div>}
      </div>
      <button
        type="button"
        onClick={() => onImport(row)}
        className="rounded-sm bg-emerald-500/20 px-2 py-1 text-[10px] uppercase text-emerald-300 hover:bg-emerald-500/30"
      >
        Import
      </button>
    </div>
  );
}
