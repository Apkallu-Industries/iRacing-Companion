import { d as createServerRpc, b as createServerFn } from "./tanstack-Jo4b3tUQ.js";
import { r as requireSupabaseAuth } from "./auth-middleware-xZM3BZWQ.js";
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
async function requireAdmin(supabase, userId) {
  const {
    data,
    error
  } = await supabase.from("user_roles").select("role").eq("user_id", userId).single();
  if (error || data?.role !== "admin") {
    throw new Error("Unauthorized: admin access required");
  }
}
const adminListUsers_createServerFn_handler = createServerRpc({
  id: "35cf6cc28f61c798a570ec39672552de8ed250f60706565e25b34a66f0c5b240",
  name: "adminListUsers",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminListUsers.__executeServer(opts));
const adminListUsers = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(adminListUsers_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await requireAdmin(supabase, userId);
  const {
    data: roles
  } = await supabase.from("user_roles").select("user_id, role");
  const {
    data: sessions
  } = await supabase.from("telemetry_sessions").select("user_id");
  let authUsers = [];
  try {
    const resp = await supabase.auth.admin.listUsers({
      perPage: 500
    });
    authUsers = resp.data?.users ?? [];
  } catch {
  }
  const roleMap = new Map((roles ?? []).map((r) => [r.user_id, r.role]));
  const sessionCounts = /* @__PURE__ */ new Map();
  for (const s of sessions ?? []) {
    sessionCounts.set(s.user_id, (sessionCounts.get(s.user_id) ?? 0) + 1);
  }
  const users = authUsers.map((u) => ({
    id: u.id,
    email: u.email ?? "(no email)",
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
    role: roleMap.get(u.id) ?? "user",
    session_count: sessionCounts.get(u.id) ?? 0
  }));
  const order = ["admin", "beta_tester", "user"];
  users.sort((a, b) => {
    const ri = order.indexOf(a.role) - order.indexOf(b.role);
    if (ri !== 0) return ri;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  return {
    users
  };
});
const adminSetRole_createServerFn_handler = createServerRpc({
  id: "154da85bc7e5915df5164155bbb68a97441082079312d44aab513dabc82f59c3",
  name: "adminSetRole",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminSetRole.__executeServer(opts));
const adminSetRole = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => {
  if (!data.targetUserId) throw new Error("targetUserId required");
  if (!["user", "beta_tester", "admin"].includes(data.role)) throw new Error("invalid role");
  return data;
}).handler(adminSetRole_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await requireAdmin(supabase, userId);
  if (data.targetUserId === userId && data.role !== "admin") {
    throw new Error("You cannot demote yourself from admin");
  }
  const {
    error
  } = await supabase.from("user_roles").upsert({
    user_id: data.targetUserId,
    role: data.role,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }, {
    onConflict: "user_id"
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const getMyRole_createServerFn_handler = createServerRpc({
  id: "e2507865c01468809aa67f84f243facd748d53ebf53d1a04baa0f86f26aed510",
  name: "getMyRole",
  filename: "src/lib/admin.functions.ts"
}, (opts) => getMyRole.__executeServer(opts));
const getMyRole = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(getMyRole_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data
  } = await supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle();
  return {
    role: data?.role ?? "user"
  };
});
export {
  adminListUsers_createServerFn_handler,
  adminSetRole_createServerFn_handler,
  getMyRole_createServerFn_handler
};
