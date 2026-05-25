import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { connectToLocalDb } from "@/lib/db.local";

export const fetchTrackCarHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { track: string; car: string; excludeSessionId?: string }) => data,
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    let sessions: any[] = [];
    let livePb: any = null;
    let errorMsg: string | null = null;
    let usedLocal = false;

    // ── 1. Attempt to fetch from Local MongoDB ──
    try {
      const db = await connectToLocalDb();

      const sessDocs = await db.collection("telemetry_sessions")
        .find({ track: data.track, car: data.car, best_lap_s: { $ne: null } })
        .sort({ recorded_at: -1 })
        .limit(40)
        .toArray();

      sessions = sessDocs
        .map((d: any) => ({ ...d, id: d._id.toString() }))
        .filter((r: any) => r.id !== data.excludeSessionId);

      const pbDocs = await db.collection("live_lap_records")
        .find({ track: data.track, car: data.car, is_valid: true })
        .sort({ lap_time_s: 1 })
        .limit(1)
        .toArray();
      livePb = pbDocs.length ? pbDocs[0] : null;

      usedLocal = true;
    } catch (e) {
      console.warn("[LocalDB] Fallback to Supabase for History:", e);
    }

    // ── 2. Fallback to Cloud Supabase if Local DB is unavailable ──
    if (!usedLocal) {
      const q = supabase
        .from("telemetry_sessions")
        .select(
          "id,name,track,car,recorded_at,best_lap_s,lap_count,duration_s,created_at",
        )
        .eq("track", data.track)
        .eq("car", data.car)
        .not("best_lap_s", "is", null)
        .order("recorded_at", { ascending: false })
        .limit(40);

      const { data: rows, error: sErr } = await q;
      if (sErr) errorMsg = sErr.message;
      sessions = (rows ?? []).filter((r: any) => r.id !== data.excludeSessionId);

      const { data: sbLivePb } = await supabase
        .from("live_lap_records")
        .select("lap_time_s, recorded_at")
        .eq("track", data.track)
        .eq("car", data.car)
        .eq("is_valid", true)
        .order("lap_time_s", { ascending: true })
        .limit(1)
        .maybeSingle();

      livePb = sbLivePb;
    }

    if (errorMsg && sessions.length === 0 && !livePb) {
      return { error: errorMsg } as const;
    }

    if (sessions.length === 0 && !livePb) {
      return { history: null } as const;
    }

    const bests = sessions
      .map((s) => Number(s.best_lap_s))
      .filter((n) => Number.isFinite(n) && n > 0);
    let bestEverS = bests.length ? Math.min(...bests) : null;

    // Merge the live PB if it's faster than any session best
    const livePbS = livePb ? Number(livePb.lap_time_s) : null;
    if (livePbS != null && Number.isFinite(livePbS) && livePbS > 0) {
      bestEverS = bestEverS != null ? Math.min(bestEverS, livePbS) : livePbS;
    }

    // Recent = up to 5 most recent (already sorted desc by recorded_at)
    const recent = sessions.slice(0, 5);
    const recentBestS = recent.length
      ? Math.min(...recent.map((s) => Number(s.best_lap_s)).filter(Number.isFinite))
      : null;
    // Trend: compare oldest 5 vs newest 5 best laps
    const sortedAsc = [...sessions].sort(
      (a, b) =>
        new Date(a.recorded_at ?? a.created_at ?? 0).getTime() -
        new Date(b.recorded_at ?? b.created_at ?? 0).getTime(),
    );
    let trend: "improving" | "regressing" | "flat" | null = null;
    if (sortedAsc.length >= 4) {
      const half = Math.floor(sortedAsc.length / 2);
      const earlyBest = Math.min(
        ...sortedAsc.slice(0, half).map((s) => Number(s.best_lap_s)).filter(Number.isFinite),
      );
      const lateBest = Math.min(
        ...sortedAsc.slice(half).map((s) => Number(s.best_lap_s)).filter(Number.isFinite),
      );
      const delta = earlyBest - lateBest;
      if (Math.abs(delta) < 0.05) trend = "flat";
      else trend = delta > 0 ? "improving" : "regressing";
    }
    // Top 5 fastest laps across history (merge live PB into pool)
    const fastest = [...sessions]
      .filter((s) => Number.isFinite(Number(s.best_lap_s)))
      .sort((a, b) => Number(a.best_lap_s) - Number(b.best_lap_s))
      .slice(0, 5)
      .map((s) => ({
        sessionName: s.name,
        recordedAt: s.recorded_at,
        lapTimeS: +Number(s.best_lap_s).toFixed(3),
        bestLapS: +Number(s.best_lap_s).toFixed(3),
      }));

    // Inject live PB if it would make the top 5
    if (livePbS != null && Number.isFinite(livePbS) && livePbS > 0) {
      const liveLap = {
        sessionName: "Live Session (PB)",
        recordedAt: livePb!.recorded_at as string | null,
        lapTimeS: +livePbS.toFixed(3),
        bestLapS: +livePbS.toFixed(3),
      };
      const insertIdx = fastest.findIndex((l) => l.lapTimeS > livePbS);
      if (insertIdx >= 0) {
        fastest.splice(insertIdx, 0, liveLap);
        if (fastest.length > 5) fastest.pop();
      } else if (fastest.length < 5) {
        fastest.push(liveLap);
      }
    }

    return {
      history: {
        track: data.track,
        car: data.car,
        totalSessions: sessions.length,
        bestEverS: bestEverS != null ? +bestEverS.toFixed(3) : null,
        recentBestS: recentBestS != null ? +recentBestS.toFixed(3) : null,
        laps: fastest,
        trend,
        livePbS: livePbS != null ? +livePbS.toFixed(3) : null,
      },
    } as const;
  }); export const recordTelemetrySessionMeta = createServerFn({ method: "POST" })
    .middleware([requireSupabaseAuth])
    .inputValidator((data: any) => data)
    .handler(async ({ data, context }) => {
      let localId = null;

      // 1. Write to Local DB first
      try {
        const db = await connectToLocalDb();
        const res = await db.collection("telemetry_sessions").insertOne({
          ...data,
          user_id: context.userId,
        });
        localId = res.insertedId.toString();
      } catch (e) {
        console.warn("[LocalDB] Session meta record failed:", e);
      }

      // 2. Sync to Cloud Supabase
      try {
        const { data: row, error } = await context.supabase
          .from("telemetry_sessions")
          .insert({
            user_id: context.userId,
            ...data
          })
          .select("id")
          .single();

        if (error && !localId) throw error;
        return { ok: true, id: row?.id ?? localId };
      } catch (e) {
        if (localId) return { ok: true, id: localId };
        return { ok: false, error: String((e as Error).message || e) };
      }
    });
