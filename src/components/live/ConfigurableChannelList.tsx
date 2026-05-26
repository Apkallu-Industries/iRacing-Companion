import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import type { Telemetry } from "@/lib/telemetry-types";
import { compileMathExpression, evaluateCompiledMathExpression } from "@/lib/math/evaluator";
import { telemetryToMathContext } from "@/lib/math/context";
import {
  MathExpressionSchema,
  type MathExpression,
  validateMathExpressionSyntax,
} from "@/lib/math/schema";
import {
  buildRegistry,
  loadChannelPrefs,
  saveChannelPrefs,
  DEFAULT_CHANNEL_KEYS,
  type ChannelDef,
} from "./ChannelRegistry";
import { MiniTrace } from "@/components/ui/MiniTrace";
import {
  upsertMyChannelLayout,
  publishMyChannelLayout,
  listCommunityChannelLayouts,
  voteCommunityItem,
} from "@/lib/community.functions";
import { CommunityBrowser, type CommunityRow } from "@/components/community/CommunityBrowser";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useWorkbench } from "@/lib/store";
import { speakText } from "@/lib/tts.functions";

const MATH_PRESETS: Array<{
  name: string;
  key: string;
  expression: string;
  unit?: string;
  precision?: number;
  color?: string;
}> = [
  {
    name: "Brake-Throttle Overlap",
    key: "brake_throttle_overlap",
    expression: "min(brake,throttle)*100",
    unit: "%",
    precision: 1,
    color: "#f97316",
  },
  {
    name: "Steering Smoothness",
    key: "steering_smoothness",
    expression: "abs(steeringDeg)/max(speedKph,1)",
    unit: "deg/kmh",
    precision: 3,
    color: "#22d3ee",
  },
  {
    name: "Tyre Temp Spread Front",
    key: "tyre_temp_spread_front",
    expression: "abs(tires.fl.tempC-tires.fr.tempC)",
    unit: "C",
    precision: 1,
    color: "#fb923c",
  },
  {
    name: "Tyre Temp Spread Rear",
    key: "tyre_temp_spread_rear",
    expression: "abs(tires.rl.tempC-tires.rr.tempC)",
    unit: "C",
    precision: 1,
    color: "#f59e0b",
  },
  {
    name: "Tyre Press Spread Front",
    key: "tyre_press_spread_front",
    expression: "abs(tires.fl.pressureBar-tires.fr.pressureBar)",
    unit: "bar",
    precision: 3,
    color: "#a78bfa",
  },
  {
    name: "Tyre Press Spread Rear",
    key: "tyre_press_spread_rear",
    expression: "abs(tires.rl.pressureBar-tires.rr.pressureBar)",
    unit: "bar",
    precision: 3,
    color: "#8b5cf6",
  },
  {
    name: "Fuel Burn Proxy",
    key: "fuel_burn_proxy",
    expression: "max(0,100-lapsEstimated)",
    unit: "",
    precision: 2,
    color: "#34d399",
  },
];

/**
 * MoTeC-style configurable Channel List.
 *
 * - Maps every Telemetry field (plus dynamic `extras`) to a channel.
 * - User can pick which channels show and in what order via the Edit panel.
 * - Choice is persisted to localStorage so the layout follows the driver.
 */
export function ConfigurableChannelList({ t }: { t: Telemetry }) {
  const baseRegistry = useMemo(() => buildRegistry(t), [t]);
  const [mathExpressions, setMathExpressions] = useState<MathExpression[]>([]);
  const { elevenLabsApiKey, elevenLabsVoiceId } = useWorkbench();
  const lastAlertTimes = useRef<Record<string, number>>({});
  const enabledMathExpressions = useMemo(
    () => mathExpressions.filter((m) => m.enabled && (m.scope === "live" || m.scope === "both")),
    [mathExpressions],
  );
  const compiledMath = useMemo(
    () =>
      enabledMathExpressions.map((m) => {
        const compiled = compileMathExpression(m.expression);
        return { expression: m, compiled };
      }),
    [enabledMathExpressions],
  );
  const mathValues = useMemo(() => {
    const ctx = telemetryToMathContext(t);
    const out: Record<string, number> = {};
    for (const item of compiledMath) {
      if (!item.compiled.ok) continue;
      const value = evaluateCompiledMathExpression(item.compiled.compiled, ctx);
      if (value.ok) out[item.expression.id] = value.value;
    }
    return out;
  }, [compiledMath, t]);

  useEffect(() => {
    for (const item of compiledMath) {
      const m = item.expression;
      if (!m.speechAlertEnabled || !m.speechAlertText) continue;

      const val = mathValues[m.id];
      const threshold = m.speechAlertThreshold ?? 0.5;

      if (Number.isFinite(val) && val > threshold) {
        const now = Date.now();
        const lastTime = lastAlertTimes.current[m.id] || 0;
        const cooldown = (m.speechAlertDebounceS ?? 15) * 1000;

        if (now - lastTime > cooldown) {
          lastAlertTimes.current[m.id] = now;

          speakText({
            data: {
              text: m.speechAlertText,
              apiKey: elevenLabsApiKey,
              voiceId: elevenLabsVoiceId,
            },
          })
            .then((resp) => {
              if (resp && resp.audioBase64) {
                const audio = new Audio(
                  `data:${resp.mime ?? "audio/mpeg"};base64,${resp.audioBase64}`,
                );
                audio.play().catch(() => {});
              }
            })
            .catch(() => {});
        }
      }
    }
  }, [mathValues, compiledMath, elevenLabsApiKey, elevenLabsVoiceId]);

  const mathRegistry = useMemo<ChannelDef[]>(() => {
    const seen = new Set<string>();
    return enabledMathExpressions.map((m, i) => {
      const dedupe = seen.has(m.key);
      seen.add(m.key);
      const channelKey = dedupe ? `math.${m.key}_${i + 1}` : `math.${m.key}`;
      return {
        key: channelKey,
        label: m.name.toUpperCase(),
        unit: m.unit ?? "",
        color: m.color ?? "#22d3ee",
        group: "Extras",
        read: () => {
          const v = mathValues[m.id];
          if (!Number.isFinite(v)) return "—";
          const p = Math.max(0, Math.min(6, m.precision ?? 2));
          return v.toFixed(p);
        },
      };
    });
  }, [enabledMathExpressions, mathValues]);
  const mathNumericByChannelKey = useMemo(() => {
    const seen = new Set<string>();
    const out: Record<string, number> = {};
    for (let i = 0; i < enabledMathExpressions.length; i += 1) {
      const m = enabledMathExpressions[i];
      const dedupe = seen.has(m.key);
      seen.add(m.key);
      const channelKey = dedupe ? `math.${m.key}_${i + 1}` : `math.${m.key}`;
      const v = mathValues[m.id];
      if (Number.isFinite(v)) out[channelKey] = v;
    }
    return out;
  }, [enabledMathExpressions, mathValues]);
  const registry = useMemo(() => [...baseRegistry, ...mathRegistry], [baseRegistry, mathRegistry]);
  const byKey = useMemo(() => new Map(registry.map((c) => [c.key, c])), [registry]);

  const [visibleKeys, setVisibleKeys] = useState<string[]>(DEFAULT_CHANNEL_KEYS);
  const [editing, setEditing] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [modeByKey, setModeByKey] = useState<Record<string, "raw" | "trace">>({});
  const [publishing, setPublishing] = useState(false);
  const historyRef = useRef<Record<string, number[]>>({});

  const { session } = useAuth();
  const upsertCloud = useServerFn(upsertMyChannelLayout);
  const publishCloud = useServerFn(publishMyChannelLayout);
  const listCloud = useServerFn(listCommunityChannelLayouts);
  const voteCloud = useServerFn(voteCommunityItem);

  useEffect(() => {
    const prefs = loadChannelPrefs();
    setVisibleKeys(prefs.visible);
    setModeByKey(prefs.modeByKey ?? {});
    setMathExpressions(
      (prefs.mathExpressions ?? []).filter((m) => MathExpressionSchema.safeParse(m).success),
    );
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveChannelPrefs({ visible: visibleKeys, modeByKey, mathExpressions });
    if (!session) return;
    // Debounced cloud sync.
    const id = setTimeout(() => {
      upsertCloud({
        data: { name: "default", layout: { visible: visibleKeys, modeByKey, mathExpressions } },
      }).catch(() => {});
    }, 1500);
    return () => clearTimeout(id);
  }, [visibleKeys, modeByKey, mathExpressions, hydrated, upsertCloud, session]);

  const publish = async () => {
    if (!session) {
      toast.error("Sign in to publish your workspace.");
      return;
    }
    setPublishing(true);
    try {
      await upsertCloud({
        data: { name: "default", layout: { visible: visibleKeys, modeByKey, mathExpressions } },
      });
      const out = await publishCloud({ data: { name: "default", published: true } });
      if ("ok" in out && out.ok) toast.success("Workspace published to community.");
      else toast.error("Publish failed.");
    } catch (e: any) {
      toast.error(e?.message ?? "Publish failed.");
    } finally {
      setPublishing(false);
    }
  };

  const onImport = (row: CommunityRow) => {
    const layout = row.payload as {
      visible: string[];
      modeByKey?: Record<string, "raw" | "trace">;
      mathExpressions?: MathExpression[];
    };
    if (!Array.isArray(layout?.visible)) return;
    setVisibleKeys(layout.visible);
    setModeByKey(layout.modeByKey ?? {});
    setMathExpressions(
      (layout.mathExpressions ?? []).filter((m) => MathExpressionSchema.safeParse(m).success),
    );
    setBrowseOpen(false);
    toast.success(`Imported layout with ${layout.visible.length} channels.`);
  };

  const loadRows = useCallback(async (): Promise<CommunityRow[]> => {
    const out = await listCloud();
    return (out.rows || []).map((r: any) => ({
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

  const toggleMode = useCallback((key: string) => {
    setModeByKey((m) => ({ ...m, [key]: m[key] === "trace" ? "raw" : "trace" }));
  }, []);

  useEffect(() => {
    const next: Record<string, number[]> = {};
    for (const c of visibleChannels) {
      const key = c.key;
      const prev = historyRef.current[key] ?? [];
      const n = getNumericValue(t, key, mathNumericByChannelKey);
      next[key] = Number.isFinite(n) ? [...prev.slice(-719), n] : prev.slice(-719);
    }
    historyRef.current = next;
  }, [t, visibleChannels, mathNumericByChannelKey]);

  return (
    <div className="rounded-sm border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border px-2 py-1.5">
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Channels</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] tabular-nums text-muted-foreground">
            {visibleChannels.length}/{registry.length}
          </span>
          <button
            type="button"
            onClick={() => setBrowseOpen(true)}
            className="rounded-sm bg-muted px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-foreground hover:bg-accent"
            title="Browse community channel layouts"
          >
            browse
          </button>
          <button
            type="button"
            onClick={publish}
            disabled={!session || publishing}
            className="rounded-sm bg-emerald-500/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/30"
            title={
              session
                ? "Publish your channel layout to the community"
                : "Sign in to publish workspace"
            }
          >
            {publishing ? "publishing..." : "publish workspace"}
          </button>
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className={`rounded-sm px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${
              editing
                ? "bg-amber-500/20 text-amber-300"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {editing ? "Done" : "Edit"}
          </button>
        </div>
      </div>

      {!editing ? (
        <ul className="divide-y divide-border">
          {visibleChannels.map((c) => {
            const isTrace = modeByKey[c.key] === "trace";
            return (
              <li
                key={c.key}
                className="flex items-center gap-2 px-2 py-1 text-[11px] cursor-pointer hover:bg-muted/60 transition-colors group"
                onClick={() => toggleMode(c.key)}
                title={`Click to switch to ${isTrace ? "RAW" : "TRACE"} view`}
              >
                <span
                  className="size-1.5 rounded-full ring-1 ring-transparent group-hover:ring-current transition-all"
                  style={{ background: c.color, color: c.color }}
                />
                <span
                  className="w-24 truncate text-muted-foreground group-hover:text-muted-foreground transition-colors"
                  title={c.key}
                >
                  {c.label}
                </span>
                {isTrace ? (
                  <span className="ml-auto flex items-center gap-1.5">
                    <MiniTrace values={historyRef.current[c.key] ?? []} color={c.color} />
                    <span className="text-[7px] uppercase tracking-wider text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity select-none">
                      trc
                    </span>
                  </span>
                ) : (
                  <span className="ml-auto flex items-center gap-1.5">
                    <span className="truncate tabular-nums text-foreground">{c.read(t)}</span>
                    <span className="text-[7px] uppercase tracking-wider text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity select-none">
                      raw
                    </span>
                  </span>
                )}
                <span className="w-8 text-right text-[9px] text-muted-foreground">{c.unit}</span>
              </li>
            );
          })}
          {visibleChannels.length === 0 && (
            <li className="px-2 py-3 text-center text-[10px] text-muted-foreground">
              No channels selected · tap Edit
            </li>
          )}
        </ul>
      ) : (
        <EditPanel
          registry={registry}
          visibleKeys={visibleKeys}
          modeByKey={modeByKey}
          mathExpressions={mathExpressions}
          onChange={setVisibleKeys}
          onSetMode={(key, mode) => setModeByKey((m) => ({ ...m, [key]: mode }))}
          onSetMathExpressions={setMathExpressions}
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
  modeByKey,
  mathExpressions,
  onChange,
  onSetMode,
  onSetMathExpressions,
}: {
  registry: ChannelDef[];
  visibleKeys: string[];
  modeByKey: Record<string, "raw" | "trace">;
  mathExpressions: MathExpression[];
  onChange: (keys: string[]) => void;
  onSetMode: (key: string, mode: "raw" | "trace") => void;
  onSetMathExpressions: (expressions: MathExpression[]) => void;
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
  const addExpression = () => {
    const now = new Date().toISOString();
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}`;
    onSetMathExpressions([
      ...mathExpressions,
      {
        id,
        name: `Derived ${mathExpressions.length + 1}`,
        key: `derived_${mathExpressions.length + 1}`,
        expression: "speedKph",
        unit: "",
        precision: 2,
        color: "#22d3ee",
        enabled: true,
        scope: "both",
        speechAlertEnabled: false,
        speechAlertThreshold: 0.5,
        speechAlertText: "",
        speechAlertDebounceS: 15,
        created_at: now,
        updated_at: now,
      },
    ]);
  };
  const addPresets = () => {
    const now = new Date().toISOString();
    const existing = new Set(mathExpressions.map((m) => m.key));
    const additions = MATH_PRESETS.filter((p) => !existing.has(p.key)).map((p) => ({
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${p.key}`,
      name: p.name,
      key: p.key,
      expression: p.expression,
      unit: p.unit ?? "",
      precision: p.precision ?? 2,
      color: p.color ?? "#22d3ee",
      enabled: true,
      scope: "both" as const,
      speechAlertEnabled: false,
      speechAlertThreshold: 0.5,
      speechAlertText: "",
      speechAlertDebounceS: 15,
      created_at: now,
      updated_at: now,
    }));
    if (additions.length === 0) {
      toast.message("Math presets already installed.");
      return;
    }
    onSetMathExpressions([...mathExpressions, ...additions]);
    onChange([...visibleKeys, ...additions.map((m) => `math.${m.key}`)]);
    toast.success(`Added ${additions.length} math presets.`);
  };
  const updateExpression = (id: string, patch: Partial<MathExpression>) => {
    const now = new Date().toISOString();
    onSetMathExpressions(
      mathExpressions.map((m) => (m.id === id ? { ...m, ...patch, updated_at: now } : m)),
    );
  };
  const removeExpression = (id: string) => {
    const target = mathExpressions.find((m) => m.id === id);
    onSetMathExpressions(mathExpressions.filter((m) => m.id !== id));
    if (!target) return;
    onChange(
      visibleKeys.filter((k) => k !== `math.${target.key}` && !k.startsWith(`math.${target.key}_`)),
    );
  };

  return (
    <div className="max-h-[480px] overflow-y-auto">
      {/* Active / ordered list */}
      <div className="border-b border-border px-2 py-1.5 text-[9px] uppercase tracking-wider text-muted-foreground">
        Active order
      </div>
      <ul className="divide-y divide-border">
        {visibleKeys.map((key, idx) => {
          const c = registry.find((r) => r.key === key);
          if (!c) return null;
          return (
            <li key={key} className="flex items-center gap-1 px-2 py-1 text-[11px]">
              <span className="size-1.5 rounded-full" style={{ background: c.color }} />
              <span className="w-24 truncate text-foreground">{c.label}</span>
              <span className="ml-auto flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => move(key, -1)}
                  disabled={idx === 0}
                  className="rounded-sm bg-muted px-1 py-0.5 text-muted-foreground disabled:opacity-30 hover:text-foreground"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(key, 1)}
                  disabled={idx === visibleKeys.length - 1}
                  className="rounded-sm bg-muted px-1 py-0.5 text-muted-foreground disabled:opacity-30 hover:text-foreground"
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
                <button
                  type="button"
                  onClick={() => onSetMode(key, modeByKey[key] === "trace" ? "raw" : "trace")}
                  className="rounded-sm bg-cyan-500/20 px-1.5 py-0.5 text-cyan-300 hover:bg-cyan-500/30"
                  aria-label="Toggle display mode"
                  title="Toggle RAW / Trace"
                >
                  {modeByKey[key] === "trace" ? "Trace" : "Raw"}
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
            <div className="border-y border-border bg-muted/30 px-2 py-1 text-[9px] uppercase tracking-wider text-muted-foreground">
              {group}
            </div>
            <ul className="divide-y divide-border">
              {inactive.map((c) => (
                <li key={c.key} className="flex items-center gap-2 px-2 py-1 text-[11px]">
                  <span
                    className="size-1.5 rounded-full opacity-60"
                    style={{ background: c.color }}
                  />
                  <span className="truncate text-muted-foreground" title={c.key}>
                    {c.label}
                  </span>
                  <span className="ml-auto text-[9px] text-muted-foreground">{c.unit}</span>
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
      <div className="border-y border-border bg-muted/30 px-2 py-1 text-[9px] uppercase tracking-wider text-muted-foreground">
        Math
      </div>
      <div className="space-y-2 px-2 py-2">
        {mathExpressions.map((m) => {
          const syntax = validateMathExpressionSyntax(m.expression);
          const compiled = compileMathExpression(m.expression);
          const valid = syntax.ok && compiled.ok;
          return (
            <div key={m.id} className="rounded-sm border border-border bg-background p-2">
              <div className="mb-1 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={m.enabled}
                  onChange={(e) => updateExpression(m.id, { enabled: e.target.checked })}
                />
                <input
                  value={m.name}
                  onChange={(e) => updateExpression(m.id, { name: e.target.value })}
                  className="min-w-0 flex-1 rounded-sm border border-border-strong bg-muted px-1.5 py-1 text-[11px] text-foreground"
                  placeholder="Name"
                />
                <button
                  type="button"
                  onClick={() => removeExpression(m.id)}
                  className="rounded-sm bg-rose-500/20 px-1.5 py-0.5 text-[10px] text-rose-300 hover:bg-rose-500/30"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <input
                  value={m.key}
                  onChange={(e) => updateExpression(m.id, { key: e.target.value })}
                  className="rounded-sm border border-border-strong bg-muted px-1.5 py-1 text-[10px] text-foreground"
                  placeholder="key (snake_case)"
                />
                <input
                  value={m.unit ?? ""}
                  onChange={(e) => updateExpression(m.id, { unit: e.target.value })}
                  className="rounded-sm border border-border-strong bg-muted px-1.5 py-1 text-[10px] text-foreground"
                  placeholder="unit"
                />
                <input
                  value={m.expression}
                  onChange={(e) => updateExpression(m.id, { expression: e.target.value })}
                  className="col-span-2 rounded-sm border border-border-strong bg-muted px-1.5 py-1 text-[10px] text-foreground"
                  placeholder="expression"
                />
              </div>
              <div className="mt-2 border-t border-border pt-2 space-y-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={m.speechAlertEnabled ?? false}
                    onChange={(e) =>
                      updateExpression(m.id, { speechAlertEnabled: e.target.checked })
                    }
                    className="accent-cyan-500 h-3.5 w-3.5"
                  />
                  <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                    Vocal Alert Enable
                  </span>
                </label>
                {(m.speechAlertEnabled ?? false) && (
                  <div className="grid grid-cols-2 gap-1 bg-muted/20 p-1.5 rounded-sm border border-border/50">
                    <div className="col-span-2 space-y-1">
                      <span className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground">
                        Alert Speech Text
                      </span>
                      <input
                        value={m.speechAlertText ?? ""}
                        onChange={(e) =>
                          updateExpression(m.id, { speechAlertText: e.target.value })
                        }
                        className="w-full rounded-sm border border-border-strong bg-muted px-1.5 py-1 text-[10px] text-foreground"
                        placeholder="e.g. Stop overlapping brake and throttle!"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground">
                        Trigger Threshold
                      </span>
                      <input
                        type="number"
                        step="any"
                        value={m.speechAlertThreshold ?? ""}
                        onChange={(e) =>
                          updateExpression(m.id, {
                            speechAlertThreshold:
                              e.target.value === "" ? undefined : parseFloat(e.target.value),
                          })
                        }
                        className="w-full rounded-sm border border-border-strong bg-muted px-1.5 py-1 text-[10px] text-foreground"
                        placeholder="e.g. 1.2"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground">
                        Cooldown (sec)
                      </span>
                      <input
                        type="number"
                        min="1"
                        max="3600"
                        value={m.speechAlertDebounceS ?? ""}
                        onChange={(e) =>
                          updateExpression(m.id, {
                            speechAlertDebounceS:
                              e.target.value === "" ? undefined : parseInt(e.target.value, 10),
                          })
                        }
                        className="w-full rounded-sm border border-border-strong bg-muted px-1.5 py-1 text-[10px] text-foreground"
                        placeholder="e.g. 15"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-1 text-[9px] text-muted-foreground">
                {valid
                  ? "Valid expression."
                  : (syntax.error ?? (!compiled.ok ? compiled.error : "Invalid expression."))}
              </div>
            </div>
          );
        })}
        <button
          type="button"
          onClick={addExpression}
          className="rounded-sm bg-cyan-500/20 px-2 py-1 text-[9px] uppercase tracking-wider text-cyan-300 hover:bg-cyan-500/30"
        >
          Add derived channel
        </button>
        <button
          type="button"
          onClick={addPresets}
          className="ml-2 rounded-sm bg-emerald-500/20 px-2 py-1 text-[9px] uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/30"
        >
          Install presets
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border px-2 py-2 text-[9px] uppercase tracking-wider">
        <button
          type="button"
          onClick={() => onChange(DEFAULT_CHANNEL_KEYS)}
          className="rounded-sm bg-muted px-2 py-1 text-muted-foreground hover:text-foreground"
        >
          Reset defaults
        </button>
        <button
          type="button"
          onClick={() => onChange([])}
          className="rounded-sm bg-muted px-2 py-1 text-muted-foreground hover:text-foreground"
        >
          Clear all
        </button>
        <button
          type="button"
          onClick={() => onChange(registry.map((c) => c.key))}
          className="rounded-sm bg-muted px-2 py-1 text-muted-foreground hover:text-foreground"
        >
          Add all
        </button>
      </div>
    </div>
  );
}

function getNumericValue(t: Telemetry, key: string, mathValues: Record<string, number>): number {
  if (key.startsWith("math.")) {
    return typeof mathValues[key] === "number" ? mathValues[key] : Number.NaN;
  }
  if (key.startsWith("extras.")) {
    const v = t.extras?.[key.slice(7)];
    return typeof v === "number" ? v : Number.NaN;
  }
  const parts = key.split(".");
  let cur: any = t;
  for (const p of parts) cur = cur?.[p];
  return typeof cur === "number" ? cur : Number.NaN;
}
