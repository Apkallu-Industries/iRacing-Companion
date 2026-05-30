import { d as createServerRpc, b as createServerFn } from "./tanstack-Jo4b3tUQ.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-xZM3BZWQ.js";
import { s as supabaseAdmin } from "./client.server-Y-0AANJ4.js";
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
function makeToken() {
  const arr = new Uint8Array(18);
  crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
const MAX_SIGN_SECONDS = 60 * 60 * 24 * 7;
const createShareLink_createServerFn_handler = createServerRpc({
  id: "f631e086e864b55a802d3846676e9c76d6b0d78df3ae21524dfa509bbf1a00b3",
  name: "createShareLink",
  filename: "src/lib/share.functions.ts"
}, (opts) => createShareLink.__executeServer(opts));
const createShareLink = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  sessionId: z.string().uuid(),
  refLap: z.number().int().nullable().optional(),
  cmpLap: z.number().int().nullable().optional(),
  expiresInDays: z.number().int().min(1).max(365).nullable().optional()
}).parse(input)).handler(createShareLink_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: sess,
    error: sErr
  } = await supabase.from("telemetry_sessions").select("id").eq("id", data.sessionId).single();
  if (sErr || !sess) throw new Error("Session not found");
  const token = makeToken();
  const expiresAt = data.expiresInDays && data.expiresInDays > 0 ? new Date(Date.now() + data.expiresInDays * 864e5).toISOString() : null;
  const {
    error
  } = await supabase.from("shared_laps").insert({
    token,
    session_id: data.sessionId,
    user_id: userId,
    ref_lap: data.refLap ?? null,
    cmp_lap: data.cmpLap ?? null,
    expires_at: expiresAt
  });
  if (error) throw new Error(error.message);
  return {
    token,
    expiresAt
  };
});
const revokeShareLink_createServerFn_handler = createServerRpc({
  id: "fd2f68fb3471015b1d9ab8f139421cbbbc0df798ebba6872f1a3a0d195a1ca68",
  name: "revokeShareLink",
  filename: "src/lib/share.functions.ts"
}, (opts) => revokeShareLink.__executeServer(opts));
const revokeShareLink = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  token: z.string().min(8).max(64)
}).parse(input)).handler(revokeShareLink_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    error
  } = await supabase.from("shared_laps").update({
    revoked_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("token", data.token);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const refreshSharedSignedUrl_createServerFn_handler = createServerRpc({
  id: "b95e7b07455f66f56ce92478f1717625e1dccf570298bb4b01e5b9406af0ffbe",
  name: "refreshSharedSignedUrl",
  filename: "src/lib/share.functions.ts"
}, (opts) => refreshSharedSignedUrl.__executeServer(opts));
const refreshSharedSignedUrl = createServerFn({
  method: "POST"
}).inputValidator((input) => z.object({
  token: z.string().min(8).max(64)
}).parse(input)).handler(refreshSharedSignedUrl_createServerFn_handler, async ({
  data
}) => {
  const {
    data: share
  } = await supabaseAdmin.from("shared_laps").select("session_id, expires_at, revoked_at").eq("token", data.token).maybeSingle();
  if (!share) throw new Error("Share link not found");
  if (share.revoked_at) throw new Error("Share link revoked");
  if (share.expires_at && new Date(share.expires_at) < /* @__PURE__ */ new Date()) throw new Error("Share link expired");
  const {
    data: sess
  } = await supabaseAdmin.from("telemetry_sessions").select("storage_path").eq("id", share.session_id).single();
  if (!sess) throw new Error("Session not found");
  const ttl = signTtlSeconds(share.expires_at);
  const {
    data: signed,
    error
  } = await supabaseAdmin.storage.from("telemetry").createSignedUrl(sess.storage_path, ttl);
  if (error || !signed) throw new Error("Could not sign file URL");
  return {
    signedUrl: signed.signedUrl,
    ttl
  };
});
function signTtlSeconds(expiresAtIso) {
  if (!expiresAtIso) return MAX_SIGN_SECONDS;
  const remainingMs = new Date(expiresAtIso).getTime() - Date.now();
  if (remainingMs <= 0) return 60;
  return Math.min(MAX_SIGN_SECONDS, Math.max(60, Math.floor(remainingMs / 1e3)));
}
const getSharedLap_createServerFn_handler = createServerRpc({
  id: "036557a56b6495b1b5c08cc4f611f29aa4ea7b2c87e2456f85ff16ecf5121073",
  name: "getSharedLap",
  filename: "src/lib/share.functions.ts"
}, (opts) => getSharedLap.__executeServer(opts));
const getSharedLap = createServerFn({
  method: "GET"
}).inputValidator((input) => z.object({
  token: z.string().min(8).max(64)
}).parse(input)).handler(getSharedLap_createServerFn_handler, async ({
  data
}) => {
  const {
    data: share,
    error: shareErr
  } = await supabaseAdmin.from("shared_laps").select("id, session_id, ref_lap, cmp_lap, view_count, expires_at, revoked_at").eq("token", data.token).maybeSingle();
  if (shareErr) throw new Error(shareErr.message);
  if (!share) throw new Error("Share link not found");
  if (share.revoked_at) throw new Error("This share link has been revoked.");
  if (share.expires_at && new Date(share.expires_at) < /* @__PURE__ */ new Date()) throw new Error("This share link has expired.");
  const {
    data: sess,
    error: sErr
  } = await supabaseAdmin.from("telemetry_sessions").select("id, name, track, car, recorded_at, lap_count, best_lap_s, storage_path").eq("id", share.session_id).single();
  if (sErr || !sess) throw new Error("Session not found");
  const {
    data: signed,
    error: urlErr
  } = await supabaseAdmin.storage.from("telemetry").createSignedUrl(sess.storage_path, signTtlSeconds(share.expires_at));
  if (urlErr || !signed) throw new Error("Could not sign file URL");
  supabaseAdmin.from("shared_laps").update({
    view_count: share.view_count + 1
  }).eq("id", share.id).then(() => void 0);
  return {
    refLap: share.ref_lap,
    cmpLap: share.cmp_lap,
    expiresAt: share.expires_at,
    session: {
      id: sess.id,
      name: sess.name,
      track: sess.track,
      car: sess.car,
      recordedAt: sess.recorded_at,
      lapCount: sess.lap_count,
      bestLapS: sess.best_lap_s
    },
    signedUrl: signed.signedUrl
  };
});
export {
  createShareLink_createServerFn_handler,
  getSharedLap_createServerFn_handler,
  refreshSharedSignedUrl_createServerFn_handler,
  revokeShareLink_createServerFn_handler
};
