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
const fetchTrackCarHistory_createServerFn_handler = createServerRpc({
  id: "ceb1da2412339a010c86cf3ecf77c3f4a412f494e3df16514997aba5cd89ec0c",
  name: "fetchTrackCarHistory",
  filename: "src/lib/history.functions.ts"
}, (opts) => fetchTrackCarHistory.__executeServer(opts));
const fetchTrackCarHistory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(fetchTrackCarHistory_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  let sessions = [];
  let livePb = null;
  let errorMsg = null;
  let usedLocal = false;
  try {
    const db = await connectToLocalDb();
    const sessDocs = await db.collection("telemetry_sessions").find({
      track: data.track,
      car: data.car,
      best_lap_s: {
        $ne: null
      }
    }).sort({
      recorded_at: -1
    }).limit(40).toArray();
    sessions = sessDocs.map((d) => ({
      ...d,
      id: d._id.toString()
    })).filter((r) => r.id !== data.excludeSessionId);
    const pbDocs = await db.collection("live_lap_records").find({
      track: data.track,
      car: data.car,
      is_valid: true
    }).sort({
      lap_time_s: 1
    }).limit(1).toArray();
    livePb = pbDocs.length ? pbDocs[0] : null;
    usedLocal = true;
  } catch (e) {
    console.warn("[LocalDB] Fallback to Supabase for History:", e);
  }
  if (!usedLocal) {
    const q = supabase.from("telemetry_sessions").select("id,name,track,car,recorded_at,best_lap_s,lap_count,duration_s,created_at").eq("track", data.track).eq("car", data.car).not("best_lap_s", "is", null).order("recorded_at", {
      ascending: false
    }).limit(40);
    const {
      data: rows,
      error: sErr
    } = await q;
    if (sErr) errorMsg = sErr.message;
    sessions = (rows ?? []).filter((r) => r.id !== data.excludeSessionId);
    const {
      data: sbLivePb
    } = await supabase.from("live_lap_records").select("lap_time_s, recorded_at").eq("track", data.track).eq("car", data.car).eq("is_valid", true).order("lap_time_s", {
      ascending: true
    }).limit(1).maybeSingle();
    livePb = sbLivePb;
  }
  if (errorMsg && sessions.length === 0 && !livePb) {
    return {
      error: errorMsg
    };
  }
  if (sessions.length === 0 && !livePb) {
    return {
      history: null
    };
  }
  const bests = sessions.map((s) => Number(s.best_lap_s)).filter((n) => Number.isFinite(n) && n > 0);
  let bestEverS = bests.length ? Math.min(...bests) : null;
  const livePbS = livePb ? Number(livePb.lap_time_s) : null;
  if (livePbS != null && Number.isFinite(livePbS) && livePbS > 0) {
    bestEverS = bestEverS != null ? Math.min(bestEverS, livePbS) : livePbS;
  }
  const recent = sessions.slice(0, 5);
  const recentBestS = recent.length ? Math.min(...recent.map((s) => Number(s.best_lap_s)).filter(Number.isFinite)) : null;
  const sortedAsc = [...sessions].sort((a, b) => new Date(a.recorded_at ?? a.created_at ?? 0).getTime() - new Date(b.recorded_at ?? b.created_at ?? 0).getTime());
  let trend = null;
  if (sortedAsc.length >= 4) {
    const half = Math.floor(sortedAsc.length / 2);
    const earlyBest = Math.min(...sortedAsc.slice(0, half).map((s) => Number(s.best_lap_s)).filter(Number.isFinite));
    const lateBest = Math.min(...sortedAsc.slice(half).map((s) => Number(s.best_lap_s)).filter(Number.isFinite));
    const delta = earlyBest - lateBest;
    if (Math.abs(delta) < 0.05) trend = "flat";
    else trend = delta > 0 ? "improving" : "regressing";
  }
  const fastest = [...sessions].filter((s) => Number.isFinite(Number(s.best_lap_s))).sort((a, b) => Number(a.best_lap_s) - Number(b.best_lap_s)).slice(0, 5).map((s) => ({
    sessionName: s.name,
    recordedAt: s.recorded_at,
    lapTimeS: +Number(s.best_lap_s).toFixed(3),
    bestLapS: +Number(s.best_lap_s).toFixed(3)
  }));
  if (livePbS != null && Number.isFinite(livePbS) && livePbS > 0) {
    const liveLap = {
      sessionName: "Live Session (PB)",
      recordedAt: livePb.recorded_at,
      lapTimeS: +livePbS.toFixed(3),
      bestLapS: +livePbS.toFixed(3)
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
      livePbS: livePbS != null ? +livePbS.toFixed(3) : null
    }
  };
});
const recordTelemetrySessionMeta_createServerFn_handler = createServerRpc({
  id: "8807bcd1e24885bea42a273b01c13bf580f36251214035049bde39937b793996",
  name: "recordTelemetrySessionMeta",
  filename: "src/lib/history.functions.ts"
}, (opts) => recordTelemetrySessionMeta.__executeServer(opts));
const recordTelemetrySessionMeta = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(recordTelemetrySessionMeta_createServerFn_handler, async ({
  data,
  context
}) => {
  let localId = null;
  const {
    fullDoc,
    ...metaOnly
  } = data;
  try {
    const db = await connectToLocalDb();
    const res = await db.collection("telemetry_sessions").insertOne({
      ...metaOnly,
      user_id: context.userId
    });
    localId = res.insertedId.toString();
    if (fullDoc) {
      await db.collection("telemetry_files").insertOne({
        session_id: localId,
        user_id: context.userId,
        doc: fullDoc,
        recorded_at: metaOnly.recorded_at || (/* @__PURE__ */ new Date()).toISOString()
      });
      console.log(`[LocalDB] Telemetry session data successfully written to MongoDB for session ${localId}`);
    }
  } catch (e) {
    console.warn("[LocalDB] Session meta record failed:", e);
  }
  try {
    const {
      data: row,
      error
    } = await context.supabase.from("telemetry_sessions").insert({
      user_id: context.userId,
      ...metaOnly
    }).select("id").single();
    if (error && !localId) throw error;
    return {
      ok: true,
      id: row?.id ?? localId
    };
  } catch (e) {
    if (localId) return {
      ok: true,
      id: localId
    };
    return {
      ok: false,
      error: String(e.message || e)
    };
  }
});
const fetchLocalTelemetryFile_createServerFn_handler = createServerRpc({
  id: "a1b0f3efc363c9d2100e82f3978763c576b3995969d90cf9b2d2dbf0d4e1fa81",
  name: "fetchLocalTelemetryFile",
  filename: "src/lib/history.functions.ts"
}, (opts) => fetchLocalTelemetryFile.__executeServer(opts));
const fetchLocalTelemetryFile = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(fetchLocalTelemetryFile_createServerFn_handler, async ({
  data,
  context
}) => {
  try {
    const db = await connectToLocalDb();
    const doc = await db.collection("telemetry_files").findOne({
      session_id: data.sessionId,
      user_id: context.userId
    });
    if (doc) {
      return {
        ok: true,
        doc: doc.doc
      };
    }
  } catch (e) {
    console.warn("[LocalDB] Failed fetching local telemetry from MongoDB:", e);
  }
  return {
    ok: false
  };
});
export {
  fetchLocalTelemetryFile_createServerFn_handler,
  fetchTrackCarHistory_createServerFn_handler,
  recordTelemetrySessionMeta_createServerFn_handler
};
