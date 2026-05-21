import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface LiveLapInput {
  track: string;
  car: string;
  lapTimeS: number;
  s1S?: number | null;
  s2S?: number | null;
  s3S?: number | null;
  maxBrakePct?: number | null;
  maxThrottlePct?: number | null;
  peakLatG?: number | null;
  peakLonG?: number | null;
  tireAvgC?: number | null;
  fuelUsedL?: number | null;
  isValid?: boolean;
}

export const recordLiveLap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: LiveLapInput) => {
    if (!data?.track || !data?.car) throw new Error("track and car required");
    if (typeof data.lapTimeS !== "number" || !isFinite(data.lapTimeS) || data.lapTimeS <= 5 || data.lapTimeS > 1800) {
      throw new Error("lapTimeS out of range");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("live_lap_records")
      .insert({
        user_id: userId,
        track: data.track,
        car: data.car,
        lap_time_s: data.lapTimeS,
        s1_s: data.s1S ?? null,
        s2_s: data.s2S ?? null,
        s3_s: data.s3S ?? null,
        max_brake_pct: data.maxBrakePct ?? null,
        max_throttle_pct: data.maxThrottlePct ?? null,
        peak_lat_g: data.peakLatG ?? null,
        peak_lon_g: data.peakLonG ?? null,
        tire_avg_c: data.tireAvgC ?? null,
        fuel_used_l: data.fuelUsedL ?? null,
        is_valid: data.isValid ?? true,
      })
      .select("id")
      .single();
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, id: row.id };
  });

export const getPersonalBest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { track: string; car: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("live_lap_records")
      .select("lap_time_s, s1_s, s2_s, s3_s, recorded_at")
      .eq("track", data.track)
      .eq("car", data.car)
      .eq("is_valid", true)
      .order("lap_time_s", { ascending: true })
      .limit(50);
    if (error) return { pb: null, sectorBests: null, count: 0, error: error.message };
    if (!rows || rows.length === 0) return { pb: null, sectorBests: null, count: 0 };
    const pb = rows[0];
    const sectorBests = {
      s1: minOrNull(rows.map((r) => r.s1_s as number | null)),
      s2: minOrNull(rows.map((r) => r.s2_s as number | null)),
      s3: minOrNull(rows.map((r) => r.s3_s as number | null)),
    };
    return {
      pb: {
        lapTimeS: pb.lap_time_s as number,
        s1S: pb.s1_s as number | null,
        s2S: pb.s2_s as number | null,
        s3S: pb.s3_s as number | null,
        recordedAt: pb.recorded_at as string,
      },
      sectorBests,
      count: rows.length,
    };
  });

function minOrNull(xs: (number | null)[]): number | null {
  const v = xs.filter((x): x is number => typeof x === "number" && isFinite(x));
  return v.length ? Math.min(...v) : null;
}
