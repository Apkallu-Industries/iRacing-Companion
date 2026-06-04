import { d as createServerRpc, b as createServerFn } from "../server.js";
import { r as requireSupabaseAuth } from "./auth-middleware-Cz-8T2yV.js";
import "react/jsx-runtime";
import "seroval";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
import "@tanstack/react-router";
import "@tanstack/react-router/ssr/server";
const upsertFingerprint_createServerFn_handler = createServerRpc(
  {
    id: "4e3fddf18e57875d3935a51a331aca3c3da1d3c7a9c2c29cbb33ce6299dc94cb",
    name: "upsertFingerprint",
    filename: "src/lib/fingerprint.functions.ts",
  },
  (opts) => upsertFingerprint.__executeServer(opts),
);
const upsertFingerprint = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => {
    if (!data?.pairs || !Array.isArray(data.pairs)) throw new Error("pairs required");
    if (data.pairs.length > 5e3) throw new Error("too many pairs");
    return data;
  })
  .handler(upsertFingerprint_createServerFn_handler, async ({ data, context }) => {
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
        updated_at: /* @__PURE__ */ new Date().toISOString(),
      }));
    if (rows.length === 0)
      return {
        ok: true,
        count: 0,
      };
    const { error } = await supabase.from("driver_fingerprint").upsert(rows, {
      onConflict: "user_id,track,car",
    });
    if (error)
      return {
        ok: false,
        error: error.message,
      };
    return {
      ok: true,
      count: rows.length,
    };
  });
const getFingerprintForPair_createServerFn_handler = createServerRpc(
  {
    id: "eca09a9ce4600909cbdd71ef659e9b741d36bab6ad45478e094416d1db662d95",
    name: "getFingerprintForPair",
    filename: "src/lib/fingerprint.functions.ts",
  },
  (opts) => getFingerprintForPair.__executeServer(opts),
);
const getFingerprintForPair = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => data)
  .handler(getFingerprintForPair_createServerFn_handler, async ({ data, context }) => {
    const { supabase } = context;
    const t = data.track.toLowerCase().trim();
    const c = data.car.toLowerCase().trim();
    const { data: exact } = await supabase
      .from("driver_fingerprint")
      .select("*")
      .ilike("track", data.track)
      .ilike("car", data.car)
      .limit(1)
      .maybeSingle();
    if (exact)
      return {
        fp: exact,
      };
    const { data: rows } = await supabase
      .from("driver_fingerprint")
      .select("*")
      .ilike("track", `%${data.track}%`)
      .limit(20);
    const match = (rows ?? []).find(
      (r) => r.track.toLowerCase().includes(t) && r.car.toLowerCase().includes(c),
    );
    return {
      fp: match ?? null,
    };
  });
const getLastSessionForPair_createServerFn_handler = createServerRpc(
  {
    id: "e75b3ebf429fee7020c779a2e9b76dc2affe3f854abd5837eb27ecf4d803f71c",
    name: "getLastSessionForPair",
    filename: "src/lib/fingerprint.functions.ts",
  },
  (opts) => getLastSessionForPair.__executeServer(opts),
);
const getLastSessionForPair = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => data)
  .handler(getLastSessionForPair_createServerFn_handler, async ({ data, context }) => {
    const { supabase } = context;
    const { data: rows } = await supabase
      .from("telemetry_sessions")
      .select("id,name,recorded_at,best_lap_s,track,car,storage_path,fingerprint_delta")
      .ilike("track", `%${data.track}%`)
      .ilike("car", `%${data.car}%`)
      .order("recorded_at", {
        ascending: false,
        nullsFirst: false,
      })
      .limit(1);
    return {
      session: rows?.[0] ?? null,
    };
  });
const hasAnyFingerprint_createServerFn_handler = createServerRpc(
  {
    id: "b5484388ab4b2cd6a53164ac8e150abae7cadd0ff4b5adcf4687ef27a6f2dd7d",
    name: "hasAnyFingerprint",
    filename: "src/lib/fingerprint.functions.ts",
  },
  (opts) => hasAnyFingerprint.__executeServer(opts),
);
const hasAnyFingerprint = createServerFn({
  method: "GET",
})
  .middleware([requireSupabaseAuth])
  .handler(hasAnyFingerprint_createServerFn_handler, async ({ context }) => {
    const { supabase } = context;
    const { count } = await supabase.from("driver_fingerprint").select("user_id", {
      count: "exact",
      head: true,
    });
    return {
      count: count ?? 0,
    };
  });
const updateSessionFingerprintDelta_createServerFn_handler = createServerRpc(
  {
    id: "6e51eeb531637ef52eb546fc0b0f2f93bd0941191072fdc7841f63ef520e47b1",
    name: "updateSessionFingerprintDelta",
    filename: "src/lib/fingerprint.functions.ts",
  },
  (opts) => updateSessionFingerprintDelta.__executeServer(opts),
);
const updateSessionFingerprintDelta = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => data)
  .handler(updateSessionFingerprintDelta_createServerFn_handler, async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("telemetry_sessions")
      .update({
        fingerprint_delta: data.delta,
      })
      .eq("id", data.sessionId);
    if (error)
      return {
        ok: false,
        error: error.message,
      };
    return {
      ok: true,
    };
  });
export {
  getFingerprintForPair_createServerFn_handler,
  getLastSessionForPair_createServerFn_handler,
  hasAnyFingerprint_createServerFn_handler,
  updateSessionFingerprintDelta_createServerFn_handler,
  upsertFingerprint_createServerFn_handler,
};
