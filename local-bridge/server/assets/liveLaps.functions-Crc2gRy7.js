import { d as createServerRpc, b as createServerFn } from "../server.js";
import { r as requireSupabaseAuth } from "./auth-middleware-Cz-8T2yV.js";
import { c as connectToLocalDb } from "./db.local-BHO1WuOq.js";
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
const recordLiveLap_createServerFn_handler = createServerRpc({
  id: "5d696f5b7934058bc8738d1f2fd952d83aa4541bcd24aa52a66c843cc6db65e5",
  name: "recordLiveLap",
  filename: "src/lib/liveLaps.functions.ts"
}, (opts) => recordLiveLap.__executeServer(opts));
const recordLiveLap = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => {
  if (!data?.track || !data?.car) throw new Error("track and car required");
  if (typeof data.lapTimeS !== "number" || !isFinite(data.lapTimeS) || data.lapTimeS <= 5 || data.lapTimeS > 1800) {
    throw new Error("lapTimeS out of range");
  }
  return data;
}).handler(recordLiveLap_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const doc = {
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
    recorded_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  let localId = null;
  try {
    const db = await connectToLocalDb();
    const res = await db.collection("live_lap_records").insertOne(doc);
    localId = res.insertedId.toString();
  } catch (e) {
    console.warn("[LocalDB] Record failed or not available:", e);
  }
  const {
    data: row,
    error
  } = await supabase.from("live_lap_records").insert(doc).select("id").single();
  if (error && !localId) return {
    ok: false,
    error: error.message
  };
  return {
    ok: true,
    id: row?.id ?? localId
  };
});
const getPersonalBest_createServerFn_handler = createServerRpc({
  id: "84a6f6d08f7994fe77af22dcb19c019c2ed58ade8761ccfd8c8af0f6dd7a5a5f",
  name: "getPersonalBest",
  filename: "src/lib/liveLaps.functions.ts"
}, (opts) => getPersonalBest.__executeServer(opts));
const getPersonalBest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(getPersonalBest_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  let rows = null;
  let errorMsg = null;
  try {
    const db = await connectToLocalDb();
    rows = await db.collection("live_lap_records").find({
      track: data.track,
      car: data.car,
      is_valid: true
    }).sort({
      lap_time_s: 1
    }).limit(50).toArray();
  } catch (e) {
    const {
      data: sbRows,
      error
    } = await supabase.from("live_lap_records").select("lap_time_s, s1_s, s2_s, s3_s, recorded_at").eq("track", data.track).eq("car", data.car).eq("is_valid", true).order("lap_time_s", {
      ascending: true
    }).limit(50);
    rows = sbRows;
    if (error) errorMsg = error.message;
  }
  if (errorMsg && !rows) return {
    pb: null,
    sectorBests: null,
    count: 0,
    error: errorMsg
  };
  if (!rows || rows.length === 0) return {
    pb: null,
    sectorBests: null,
    count: 0
  };
  const pb = rows[0];
  const sectorBests = {
    s1: minOrNull(rows.map((r) => r.s1_s)),
    s2: minOrNull(rows.map((r) => r.s2_s)),
    s3: minOrNull(rows.map((r) => r.s3_s))
  };
  return {
    pb: {
      lapTimeS: pb.lap_time_s,
      s1S: pb.s1_s,
      s2S: pb.s2_s,
      s3S: pb.s3_s,
      recordedAt: pb.recorded_at
    },
    sectorBests,
    count: rows.length
  };
});
function minOrNull(xs) {
  const v = xs.filter((x) => typeof x === "number" && isFinite(x));
  return v.length ? Math.min(...v) : null;
}
export {
  getPersonalBest_createServerFn_handler,
  recordLiveLap_createServerFn_handler
};
