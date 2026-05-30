import { d as createServerRpc, b as createServerFn } from "./tanstack-Jo4b3tUQ.js";
import { z } from "zod";
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
const listSharedThemes_createServerFn_handler = createServerRpc({
  id: "0bf9149e7d3d3f432048904f8dc8012a28053653a146e63cedd7525167633e7c",
  name: "listSharedThemes",
  filename: "src/lib/themes.functions.ts"
}, (opts) => listSharedThemes.__executeServer(opts));
const listSharedThemes = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listSharedThemes_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data,
    error
  } = await supabase.from("shared_themes").select("id, user_id, name, description, theme, created_at").order("created_at", {
    ascending: false
  }).limit(100);
  if (error) return {
    themes: [],
    error: error.message
  };
  return {
    themes: data ?? []
  };
});
const publishTheme_createServerFn_handler = createServerRpc({
  id: "fe7b7e8995170e4c9364af2abb9483c2bbf388aa4d14f84d0b0bd4726603076d",
  name: "publishTheme",
  filename: "src/lib/themes.functions.ts"
}, (opts) => publishTheme.__executeServer(opts));
const publishTheme = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(z.object({
  name: z.string().min(1).max(60),
  description: z.string().max(280).optional().nullable(),
  theme: z.record(z.string(), z.string())
}).parse).handler(publishTheme_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: row,
    error
  } = await supabase.from("shared_themes").insert({
    user_id: userId,
    name: data.name,
    description: data.description ?? null,
    theme: data.theme
  }).select("id").single();
  if (error) return {
    ok: false,
    error: error.message
  };
  return {
    ok: true,
    id: row.id
  };
});
const deleteSharedTheme_createServerFn_handler = createServerRpc({
  id: "496bb534cc3f11ad626ccae3a00bab7fc06e1efaf76e505a293d9a9366ef0fd3",
  name: "deleteSharedTheme",
  filename: "src/lib/themes.functions.ts"
}, (opts) => deleteSharedTheme.__executeServer(opts));
const deleteSharedTheme = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(z.object({
  id: z.string().uuid()
}).parse).handler(deleteSharedTheme_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    error
  } = await supabase.from("shared_themes").delete().eq("id", data.id);
  if (error) return {
    ok: false,
    error: error.message
  };
  return {
    ok: true
  };
});
export {
  deleteSharedTheme_createServerFn_handler,
  listSharedThemes_createServerFn_handler,
  publishTheme_createServerFn_handler
};
