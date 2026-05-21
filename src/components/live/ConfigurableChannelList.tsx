import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import type { Telemetry } from "@/lib/telemetry-types";
import {
  buildRegistry,
  loadChannelPrefs,
  saveChannelPrefs,
  DEFAULT_CHANNEL_KEYS,
  type ChannelDef,
} from "./ChannelRegistry";
import {
  upsertMyChannelLayout,
  publishMyChannelLayout,
  listCommunityChannelLayouts,
  voteCommunityItem,
} from "@/lib/community.functions";
import { CommunityBrowser, type CommunityRow } from "@/components/community/CommunityBrowser";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

/**
 * MoTeC-style configurable Channel List.
 *
 * - Maps every Telemetry field (plus dynamic `extras`) to a channel.
 * - User can pick which channels show and in what order via the Edit panel.
 * - Choice is persisted to localStorage so the layout follows the driver.
 */
export function ConfigurableChannelList({ t }: { t: Telemetry }) {
  const registry = useMemo(() => buildRegistry(t), [t]);
  const byKey = useMemo(() => new Map(registry.map((c) => [c.key, c])), [registry]);

  const [visibleKeys, setVisibleKeys] = useState<string[]>(DEFAULT_CHANNEL_KEYS);
  const [editing, setEditing] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);

  const { session } = useAuth();
  const upsertCloud = useServerFn(upsertMyChannelLayout);
  const publishCloud = useServerFn(publishMyChannelLayout);
  const listCloud = useServerFn(listCommunityChannelLayouts);
  const voteCloud = useServerFn(voteCommunityItem);

  useEffect(() => {
    const prefs = loadChannelPrefs();
    setVisibleKeys(prefs.visible);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveChannelPrefs({ visible: visibleKeys });
    if (!session) return;
    // Debounced cloud sync.
    const id = setTimeout(() => {
      upsertCloud({ data: { name: "default", layout: { visible: visibleKeys } } }).catch(() => {});
    }, 1500);
    return () => clearTimeout(id);
  }, [visibleKeys, hydrated, upsertCloud, session]);

  const publish = async () => {
    await upsertCloud({ data: { name: "default", layout: { visible: visibleKeys } } });
    const out = await publishCloud({ data: { name: "default", published: true } });
    if ("ok" in out && out.ok) toast.success("Channel layout published to community.");
    else toast.error("Publish failed.");
  };

  const onImport = (row: CommunityRow) => {
    const layout = row.payload as { visible: string[] };
    if (!Array.isArray(layout?.visible)) return;
    setVisibleKeys(layout.visible);
    setBrowseOpen(false);
    toast.success(`Imported layout with ${layout.visible.length} channels.`);
  };

  const loadRows = useCallback(async (): Promise<CommunityRow[]> => {
    const out = await listCloud();
    return (out.rows || []).map((r) => ({
      id: r.id,
      user_id: r.user_id,
      votes: r.votes,
      title: r.name,
      subtitle: `${(r.layout as { visible: string[] })?.visible?.length ?? 0} channels · ${new Date(r.updated_at).toLocaleDateString()}`,
      payload: r.layout,
    }));
  }, [listCloud]);

  const onVote = async (row: CommunityRow) => {
    const out = await voteCloud({ data: { target_id: row.id, kind: "channel_layout" } });
    return { votes: out.votes };
  };

  const visibleChannels = visibleKeys
    .map((k) => byKey.get(k))
    .filter((c): c is ChannelDef => Boolean(c));

  return (
    <div className="rounded-sm border border-zinc-900 bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-900 px-2 py-1.5">
        <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Channels</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] tabular-nums text-zinc-600">
            {visibleChannels.length}/{registry.length}
          </span>
          <button
            type="button"
            onClick={() => setBrowseOpen(true)}
            className="rounded-sm bg-zinc-900 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-zinc-300 hover:bg-zinc-800"
            title="Browse community channel layouts"
          >
            browse
          </button>
          <button
            type="button"
            onClick={publish}
            className="rounded-sm bg-emerald-500/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/30"
            title="Publish your channel layout to the community"
          >
            publish
          </button>
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className={`rounded-sm px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${
              editing
                ? "bg-amber-500/20 text-amber-300"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {editing ? "Done" : "Edit"}
          </button>
        </div>
      </div>

      {!editing ? (
        <ul className="divide-y divide-zinc-900">
          {visibleChannels.map((c) => (
            <li key={c.key} className="flex items-center gap-2 px-2 py-1 text-[11px]">
              <span className="size-1.5 rounded-full" style={{ background: c.color }} />
              <span className="w-24 truncate text-zinc-500" title={c.key}>
                {c.label}
              </span>
              <span className="ml-auto truncate tabular-nums text-zinc-100">{c.read(t)}</span>
              <span className="w-8 text-right text-[9px] text-zinc-600">{c.unit}</span>
            </li>
          ))}
          {visibleChannels.length === 0 && (
            <li className="px-2 py-3 text-center text-[10px] text-zinc-600">
              No channels selected · tap Edit
            </li>
          )}
        </ul>
      ) : (
        <EditPanel
          registry={registry}
          visibleKeys={visibleKeys}
          onChange={setVisibleKeys}
        />
      )}
      <CommunityBrowser
        open={browseOpen}
        title="Community Channel Layouts"
        loader={loadRows}
        onImport={onImport}
        onVote={onVote}
        onClose={() => setBrowseOpen(false)}
      />
    </div>
  );
}

function EditPanel({
  registry,
  visibleKeys,
  onChange,
}: {
  registry: ChannelDef[];
  visibleKeys: string[];
  onChange: (keys: string[]) => void;
}) {
  const visibleSet = new Set(visibleKeys);
  const groups = useMemo(() => {
    const map = new Map<string, ChannelDef[]>();
    for (const c of registry) {
      const arr = map.get(c.group) ?? [];
      arr.push(c);
      map.set(c.group, arr);
    }
    return Array.from(map.entries());
  }, [registry]);

  const toggle = (key: string) => {
    if (visibleSet.has(key)) onChange(visibleKeys.filter((k) => k !== key));
    else onChange([...visibleKeys, key]);
  };

  const move = (key: string, dir: -1 | 1) => {
    const i = visibleKeys.indexOf(key);
    if (i < 0) return;
    const j = i + dir;
    if (j < 0 || j >= visibleKeys.length) return;
    const next = visibleKeys.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="max-h-[480px] overflow-y-auto">
      {/* Active / ordered list */}
      <div className="border-b border-zinc-900 px-2 py-1.5 text-[9px] uppercase tracking-wider text-zinc-500">
        Active order
      </div>
      <ul className="divide-y divide-zinc-900">
        {visibleKeys.map((key, idx) => {
          const c = registry.find((r) => r.key === key);
          if (!c) return null;
          return (
            <li key={key} className="flex items-center gap-1 px-2 py-1 text-[11px]">
              <span className="size-1.5 rounded-full" style={{ background: c.color }} />
              <span className="w-24 truncate text-zinc-300">{c.label}</span>
              <span className="ml-auto flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => move(key, -1)}
                  disabled={idx === 0}
                  className="rounded-sm bg-zinc-900 px-1 py-0.5 text-zinc-400 disabled:opacity-30 hover:text-zinc-100"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(key, 1)}
                  disabled={idx === visibleKeys.length - 1}
                  className="rounded-sm bg-zinc-900 px-1 py-0.5 text-zinc-400 disabled:opacity-30 hover:text-zinc-100"
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => toggle(key)}
                  className="rounded-sm bg-rose-500/20 px-1.5 py-0.5 text-rose-300 hover:bg-rose-500/30"
                  aria-label="Remove"
                >
                  ×
                </button>
              </span>
            </li>
          );
        })}
      </ul>

      {/* Available channels by group */}
      {groups.map(([group, items]) => {
        const inactive = items.filter((c) => !visibleSet.has(c.key));
        if (inactive.length === 0) return null;
        return (
          <div key={group}>
            <div className="border-y border-zinc-900 bg-zinc-900/30 px-2 py-1 text-[9px] uppercase tracking-wider text-zinc-500">
              {group}
            </div>
            <ul className="divide-y divide-zinc-900">
              {inactive.map((c) => (
                <li key={c.key} className="flex items-center gap-2 px-2 py-1 text-[11px]">
                  <span className="size-1.5 rounded-full opacity-60" style={{ background: c.color }} />
                  <span className="truncate text-zinc-400" title={c.key}>
                    {c.label}
                  </span>
                  <span className="ml-auto text-[9px] text-zinc-600">{c.unit}</span>
                  <button
                    type="button"
                    onClick={() => toggle(c.key)}
                    className="rounded-sm bg-emerald-500/20 px-1.5 py-0.5 text-[9px] uppercase text-emerald-300 hover:bg-emerald-500/30"
                  >
                    Add
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      <div className="flex items-center justify-between gap-2 border-t border-zinc-900 px-2 py-2 text-[9px] uppercase tracking-wider">
        <button
          type="button"
          onClick={() => onChange(DEFAULT_CHANNEL_KEYS)}
          className="rounded-sm bg-zinc-900 px-2 py-1 text-zinc-400 hover:text-zinc-100"
        >
          Reset defaults
        </button>
        <button
          type="button"
          onClick={() => onChange([])}
          className="rounded-sm bg-zinc-900 px-2 py-1 text-zinc-400 hover:text-zinc-100"
        >
          Clear all
        </button>
        <button
          type="button"
          onClick={() => onChange(registry.map((c) => c.key))}
          className="rounded-sm bg-zinc-900 px-2 py-1 text-zinc-400 hover:text-zinc-100"
        >
          Add all
        </button>
      </div>
    </div>
  );
}
