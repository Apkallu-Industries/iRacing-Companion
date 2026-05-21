/**
 * Hook to enrich local car-class classifications with community-published
 * mappings, and a helper to publish your own assignment.
 */
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { classifyCar, type CarClass } from "@/lib/fingerprint/carClass";
import {
  listCommunityCarClasses,
  upsertMyCarClass,
  voteCommunityItem,
} from "@/lib/community.functions";
import { CommunityBrowser, type CommunityRow } from "@/components/community/CommunityBrowser";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

type Mapping = { car: string; car_class: string; votes: number; id: string };

const OVERRIDE_KEY = "pitwall.carclass.overrides.v1";
function loadOverrides(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(OVERRIDE_KEY) || "{}");
  } catch {
    return {};
  }
}
function saveOverrides(o: Record<string, string>) {
  try {
    localStorage.setItem(OVERRIDE_KEY, JSON.stringify(o));
  } catch {}
}

/** Resolve car class using: local override → community top → built-in classifier. */
export function useCarClassResolver() {
  const list = useServerFn(listCommunityCarClasses);
  const { session } = useAuth();
  const [community, setCommunity] = useState<Record<string, string>>({});
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  useEffect(() => {
    setOverrides(loadOverrides());
    if (!session) return;
    list({ data: {} })
      .then((r) => {
        const map: Record<string, string> = {};
        for (const row of (r as { rows: Mapping[] }).rows || []) if (!map[row.car]) map[row.car] = row.car_class;
        setCommunity(map);
      })
      .catch(() => {});
  }, [list, session]);

  const resolve = (car: string): CarClass => {
    if (overrides[car]) return overrides[car] as CarClass;
    if (community[car]) return community[car] as CarClass;
    return classifyCar(car);
  };

  const setOverride = (car: string, cls: CarClass) => {
    const next = { ...overrides, [car]: cls };
    setOverrides(next);
    saveOverrides(next);
  };

  return { resolve, setOverride, hasCommunity: Object.keys(community).length > 0 };
}

export function CarClassCommunityButton({ car }: { car: string }) {
  const list = useServerFn(listCommunityCarClasses);
  const upsert = useServerFn(upsertMyCarClass);
  const vote = useServerFn(voteCommunityItem);
  const [open, setOpen] = useState(false);

  const loader = async (): Promise<CommunityRow[]> => {
    const out = await list({ data: { car } });
    return (out.rows || []).map((r) => ({
      id: r.id,
      user_id: r.user_id,
      votes: r.votes,
      title: `${r.car} → ${r.car_class}`,
      subtitle: new Date(r.updated_at).toLocaleDateString(),
      payload: r.car_class,
    }));
  };

  const onImport = (row: CommunityRow) => {
    const cls = row.payload as string;
    const overrides = loadOverrides();
    overrides[car] = cls;
    saveOverrides(overrides);
    setOpen(false);
    toast.success(`Set ${car} → ${cls}`);
  };

  const publishMine = async (cls: CarClass) => {
    await upsert({ data: { car, car_class: cls, published: true } });
    toast.success(`Published ${car} → ${cls} to community`);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-sm bg-zinc-900 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-300 hover:bg-zinc-800"
      >
        Community class
      </button>
      <CommunityBrowser
        open={open}
        title={`Community Class · ${car}`}
        loader={loader}
        onImport={onImport}
        onVote={async (r) => {
          const out = await vote({ data: { target_id: r.id, kind: "car_class" } });
          return { votes: out.votes };
        }}
        onClose={() => setOpen(false)}
      />
      {/* Tiny inline publish helper */}
      <button
        type="button"
        onClick={() => publishMine(classifyCar(car))}
        className="rounded-sm bg-emerald-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/30"
        title={`Publish auto-detected class (${classifyCar(car)}) to community`}
      >
        Share
      </button>
    </>
  );
}
