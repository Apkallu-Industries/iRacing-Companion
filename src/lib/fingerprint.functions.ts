import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface FingerprintPairInput {
  track: string;
  car: string;
  carClass?: string | null;
  bestEverS: number;
  optimalEverS?: number | null;
  medianBestS?: number | null;
  bestStdevS?: number | null;
  bestLapSectors?: number[];
  bestPerSector?: number[];
  trackLengthM?: number | null;
  trackLengthKnown?: boolean;
  fileCount?: number;
  latestBuildDate?: string | null;
  earliestBuildDate?: string | null;
  trend?: "improving" | "regressing" | "flat" | null;
}

export const upsertFingerprint = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { pairs: FingerprintPairInput[] }) => {
    if (!data?.pairs || !Array.isArray(data.pairs)) throw new Error("pairs required");
    if (data.pairs.length > 5000) throw new Error("too many pairs");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const rows = data.pairs
      .filter((p) => p.track && p.car && isFinite(p.bestEverS) && p.bestEverS > 0)
      .map((p) => ({
        user_id: userId,
        track: p.track,
        car: p.car,
        car_class: p.carClass ?? null,
        best_ever_s: p.bestEverS,
        optimal_ever_s: p.optimalEverS ?? null,
        median_best_s: p.medianBestS ?? null,
        best_stdev_s: p.bestStdevS ?? null,
        best_lap_sectors: p.bestLapSectors ?? [],
        best_per_sector: p.bestPerSector ?? [],
        track_length_m: p.trackLengthM ?? null,
        track_length_known: p.trackLengthKnown ?? false,
        file_count: p.fileCount ?? 1,
        latest_build_date: p.latestBuildDate ?? null,
        earliest_build_date: p.earliestBuildDate ?? null,
        trend: p.trend ?? null,
        updated_at: new Date().toISOString(),
      }));
    if (rows.length === 0) return { ok: true as const, count: 0 };
    const { error } = await supabase
      .from("driver_fingerprint")
      .upsert(rows, { onConflict: "user_id,track,car" });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, count: rows.length };
  });

export const getFingerprintForPair = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { track: string; car: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const t = data.track.toLowerCase().trim();
    const c = data.car.toLowerCase().trim();
    // Exact match first, fallback to ilike contains.
    const { data: exact } = await supabase
      .from("driver_fingerprint")
      .select("*")
      .ilike("track", data.track)
      .ilike("car", data.car)
      .limit(1)
      .maybeSingle();
    if (exact) return { fp: exact };
    const { data: rows } = await supabase
      .from("driver_fingerprint")
      .select("*")
      .ilike("track", `%${data.track}%`)
      .limit(20);
    const match = (rows ?? []).find(
      (r: any) =>
        (r.track as string).toLowerCase().includes(t) &&
        (r.car as string).toLowerCase().includes(c),
    );
    return { fp: match ?? null };
  });

export const getLastSessionForPair = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { track: string; car: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: rows } = await supabase
      .from("telemetry_sessions")
      .select("id,name,recorded_at,best_lap_s,track,car,storage_path,fingerprint_delta")
      .ilike("track", `%${data.track}%`)
      .ilike("car", `%${data.car}%`)
      .order("recorded_at", { ascending: false, nullsFirst: false })
      .limit(1);
    return { session: rows?.[0] ?? null };
  });

export const hasAnyFingerprint = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { count } = await supabase
      .from("driver_fingerprint")
      .select("user_id", { count: "exact", head: true });
    return { count: count ?? 0 };
  });

export const updateSessionFingerprintDelta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { sessionId: string; delta: Record<string, unknown> | null }) => data,
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("telemetry_sessions")
      .update({ fingerprint_delta: data.delta as never })
      .eq("id", data.sessionId);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });
