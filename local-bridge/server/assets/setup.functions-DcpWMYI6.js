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
const fetchPbSetup_createServerFn_handler = createServerRpc({
  id: "75199b150805fb72a14c66751c7500a682a5a04342742f76fe0b1b9c97f6f36d",
  name: "fetchPbSetup",
  filename: "src/lib/setup.functions.ts"
}, (opts) => fetchPbSetup.__executeServer(opts));
const fetchPbSetup = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(fetchPbSetup_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data: rows,
    error
  } = await supabase.from("telemetry_sessions").select("id,name,recorded_at,best_lap_s,setup_yaml").eq("track", data.track).eq("car", data.car).not("best_lap_s", "is", null).not("setup_yaml", "is", null).order("best_lap_s", {
    ascending: true
  }).limit(10);
  if (error) return {
    error: error.message
  };
  const candidates = (rows ?? []).filter((r) => r.id !== data.excludeSessionId && r.setup_yaml);
  if (candidates.length === 0) return {
    pb: null
  };
  const pb = candidates[0];
  return {
    pb: {
      sessionId: pb.id,
      name: pb.name,
      recordedAt: pb.recorded_at,
      bestLapS: pb.best_lap_s ? +Number(pb.best_lap_s).toFixed(3) : null,
      setupYaml: pb.setup_yaml
    }
  };
});
export {
  fetchPbSetup_createServerFn_handler
};
