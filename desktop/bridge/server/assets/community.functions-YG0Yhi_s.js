import { d as createServerRpc, b as createServerFn } from "../server.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-Cz-8T2yV.js";
import { M as MathExpressionSchema } from "./schema-BU1MXGgz.js";
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
const upsertMyGearRatios_createServerFn_handler = createServerRpc({
  id: "a9e884129245c896049675548db8c3263324534e7707c6a14a71b0ac924c5ec7",
  name: "upsertMyGearRatios",
  filename: "src/lib/community.functions.ts"
}, (opts) => upsertMyGearRatios.__executeServer(opts));
const upsertMyGearRatios = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  car: z.string().min(1).max(255),
  ratios: z.record(z.string(), z.object({
    ratio: z.number(),
    samples: z.number()
  }))
}).parse(input)).handler(upsertMyGearRatios_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("shared_gear_ratios").upsert({
    user_id: userId,
    car: data.car,
    ratios: data.ratios,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }, {
    onConflict: "user_id,car"
  });
  if (error) return {
    ok: false,
    error: error.message
  };
  return {
    ok: true
  };
});
const getMyGearRatios_createServerFn_handler = createServerRpc({
  id: "9e832443bf68dc1afd0906f77686b1ea8872ad09afcaa177d4f399a63b42e66a",
  name: "getMyGearRatios",
  filename: "src/lib/community.functions.ts"
}, (opts) => getMyGearRatios.__executeServer(opts));
const getMyGearRatios = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  car: z.string().min(1).max(255)
}).parse(input)).handler(getMyGearRatios_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: row
  } = await supabase.from("shared_gear_ratios").select("ratios, published, name").eq("user_id", userId).eq("car", data.car).maybeSingle();
  return {
    row: row ?? null
  };
});
const publishMyGearRatios_createServerFn_handler = createServerRpc({
  id: "27806ff807d7d8480171f4973109eb2bb2f01480e1fd2c4c7d3e9b351a157d43",
  name: "publishMyGearRatios",
  filename: "src/lib/community.functions.ts"
}, (opts) => publishMyGearRatios.__executeServer(opts));
const publishMyGearRatios = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  car: z.string().min(1).max(255),
  name: z.string().max(120).optional(),
  published: z.boolean()
}).parse(input)).handler(publishMyGearRatios_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("shared_gear_ratios").update({
    published: data.published,
    name: data.name ?? null
  }).eq("user_id", userId).eq("car", data.car);
  if (error) return {
    ok: false,
    error: error.message
  };
  return {
    ok: true
  };
});
const listCommunityGearRatios_createServerFn_handler = createServerRpc({
  id: "a933f1c90db2b411b6f804ed4c984c6e101ca06daaf62450a1ddebca103ad19a",
  name: "listCommunityGearRatios",
  filename: "src/lib/community.functions.ts"
}, (opts) => listCommunityGearRatios.__executeServer(opts));
const listCommunityGearRatios = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  car: z.string().min(1).max(255).optional()
}).parse(input)).handler(listCommunityGearRatios_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  let q = supabase.from("shared_gear_ratios").select("id, user_id, car, name, ratios, votes, updated_at").eq("published", true).order("votes", {
    ascending: false
  }).limit(50);
  if (data.car) q = q.eq("car", data.car);
  const {
    data: rows,
    error
  } = await q;
  if (error) return {
    rows: [],
    error: error.message
  };
  return {
    rows: rows ?? []
  };
});
const ChannelLayoutSchema = z.object({
  visible: z.array(z.string().max(120)).max(300),
  modeByKey: z.record(z.string().max(120), z.enum(["raw", "trace"])).optional(),
  mathExpressions: z.array(MathExpressionSchema).max(100).optional()
});
const upsertMyChannelLayout_createServerFn_handler = createServerRpc({
  id: "31bb52f01c1ca777a07f8b7d28b2d3eef0780ba57d6cb939fb6db52d68d3d10b",
  name: "upsertMyChannelLayout",
  filename: "src/lib/community.functions.ts"
}, (opts) => upsertMyChannelLayout.__executeServer(opts));
const upsertMyChannelLayout = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  name: z.string().min(1).max(120),
  layout: ChannelLayoutSchema
}).parse(input)).handler(upsertMyChannelLayout_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: existing
  } = await supabase.from("shared_channel_layouts").select("id").eq("user_id", userId).eq("name", data.name).maybeSingle();
  const payload = {
    user_id: userId,
    name: data.name,
    layout: data.layout
  };
  const {
    error
  } = existing ? await supabase.from("shared_channel_layouts").update(payload).eq("id", existing.id) : await supabase.from("shared_channel_layouts").insert(payload);
  if (error) return {
    ok: false,
    error: error.message
  };
  return {
    ok: true
  };
});
const getMyChannelLayout_createServerFn_handler = createServerRpc({
  id: "16e5998c5e349d45bf571ca307d98918f10fe195c5b6005d6285c65d7e7dfa88",
  name: "getMyChannelLayout",
  filename: "src/lib/community.functions.ts"
}, (opts) => getMyChannelLayout.__executeServer(opts));
const getMyChannelLayout = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  name: z.string().min(1).max(120).default("default")
}).parse(input)).handler(getMyChannelLayout_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: row
  } = await supabase.from("shared_channel_layouts").select("layout, published, name").eq("user_id", userId).eq("name", data.name).maybeSingle();
  return {
    row: row ?? null
  };
});
const publishMyChannelLayout_createServerFn_handler = createServerRpc({
  id: "a0267f99ea641dee7a11ee872b71ff1a19869f78cae83bc19cef292565f399f7",
  name: "publishMyChannelLayout",
  filename: "src/lib/community.functions.ts"
}, (opts) => publishMyChannelLayout.__executeServer(opts));
const publishMyChannelLayout = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  name: z.string().min(1).max(120),
  published: z.boolean()
}).parse(input)).handler(publishMyChannelLayout_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("shared_channel_layouts").update({
    published: data.published
  }).eq("user_id", userId).eq("name", data.name);
  if (error) return {
    ok: false,
    error: error.message
  };
  return {
    ok: true
  };
});
const listCommunityChannelLayouts_createServerFn_handler = createServerRpc({
  id: "21b7d4b9cd49310bbcedb32d65588f95c68176ba57a09f7d1beaef4723ebb413",
  name: "listCommunityChannelLayouts",
  filename: "src/lib/community.functions.ts"
}, (opts) => listCommunityChannelLayouts.__executeServer(opts));
const listCommunityChannelLayouts = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listCommunityChannelLayouts_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data: rows,
    error
  } = await supabase.from("shared_channel_layouts").select("id, user_id, name, layout, votes, updated_at").eq("published", true).order("votes", {
    ascending: false
  }).limit(50);
  if (error) return {
    rows: [],
    error: error.message
  };
  return {
    rows: rows ?? []
  };
});
const upsertMyCarClass_createServerFn_handler = createServerRpc({
  id: "86e46adc000ddd68d04e26f71b110afe4b4522c393e8871abd429fcbd9f4e008",
  name: "upsertMyCarClass",
  filename: "src/lib/community.functions.ts"
}, (opts) => upsertMyCarClass.__executeServer(opts));
const upsertMyCarClass = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  car: z.string().min(1).max(255),
  car_class: z.string().min(1).max(64),
  confidence: z.number().min(0).max(1).optional(),
  published: z.boolean().optional()
}).parse(input)).handler(upsertMyCarClass_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("shared_car_classes").upsert({
    user_id: userId,
    car: data.car,
    car_class: data.car_class,
    confidence: data.confidence ?? null,
    published: data.published ?? false,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }, {
    onConflict: "user_id,car"
  });
  if (error) return {
    ok: false,
    error: error.message
  };
  return {
    ok: true
  };
});
const listCommunityCarClasses_createServerFn_handler = createServerRpc({
  id: "68ae1d118973fcae6b72b9ffb357a8b7cf6c764622416c26643e0fa0ac5e4749",
  name: "listCommunityCarClasses",
  filename: "src/lib/community.functions.ts"
}, (opts) => listCommunityCarClasses.__executeServer(opts));
const listCommunityCarClasses = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  car: z.string().min(1).max(255).optional()
}).parse(input)).handler(listCommunityCarClasses_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  let q = supabase.from("shared_car_classes").select("id, user_id, car, car_class, votes, updated_at").eq("published", true).order("votes", {
    ascending: false
  }).limit(100);
  if (data.car) q = q.eq("car", data.car);
  const {
    data: rows,
    error
  } = await q;
  if (error) return {
    rows: [],
    error: error.message
  };
  return {
    rows: rows ?? []
  };
});
const VoteKind = z.enum(["gear_ratios", "channel_layout", "car_class"]);
const voteCommunityItem_createServerFn_handler = createServerRpc({
  id: "7a7081d7243c130f1807d297517e861177ea1df81e921aee7d538e61ccc05ea0",
  name: "voteCommunityItem",
  filename: "src/lib/community.functions.ts"
}, (opts) => voteCommunityItem.__executeServer(opts));
const voteCommunityItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  target_id: z.string().uuid(),
  kind: VoteKind
}).parse(input)).handler(voteCommunityItem_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: existing
  } = await supabase.from("community_votes").select("user_id").eq("user_id", userId).eq("target_id", data.target_id).eq("kind", data.kind).maybeSingle();
  if (existing) {
    await supabase.from("community_votes").delete().eq("user_id", userId).eq("target_id", data.target_id).eq("kind", data.kind);
  } else {
    await supabase.from("community_votes").insert({
      user_id: userId,
      target_id: data.target_id,
      kind: data.kind
    });
  }
  const {
    data: votes
  } = await supabase.rpc("set_community_votes", {
    _kind: data.kind,
    _target_id: data.target_id
  });
  return {
    ok: true,
    votes: votes ?? 0,
    voted: !existing
  };
});
const syncDesktopLaps_createServerFn_handler = createServerRpc({
  id: "abbba3ff862cf55481069f2003803c513de3794ce64b16ed9b1201afed0c3569",
  name: "syncDesktopLaps",
  filename: "src/lib/community.functions.ts"
}, (opts) => syncDesktopLaps.__executeServer(opts));
const syncDesktopLaps = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  laps: z.array(z.object({
    ts: z.number(),
    car: z.string().max(255).optional().nullable(),
    track: z.string().max(255).optional().nullable(),
    lapTimeS: z.number().positive(),
    fuel: z.number().optional().nullable(),
    sof: z.number().optional().nullable()
  })).min(1).max(500)
}).parse(input)).handler(syncDesktopLaps_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const rows = data.laps.filter((l) => l.car && l.track).map((l) => ({
    user_id: userId,
    car: l.car,
    track: l.track,
    lap_time_s: l.lapTimeS,
    fuel_used_l: l.fuel ?? null,
    recorded_at: new Date(l.ts).toISOString(),
    is_valid: true
  }));
  if (rows.length === 0) return {
    inserted: 0,
    accepted: []
  };
  const {
    error
  } = await supabase.from("live_lap_records").insert(rows);
  if (error) return {
    inserted: 0,
    error: error.message,
    accepted: []
  };
  return {
    inserted: rows.length,
    accepted: data.laps.map((l) => l.ts)
  };
});
export {
  getMyChannelLayout_createServerFn_handler,
  getMyGearRatios_createServerFn_handler,
  listCommunityCarClasses_createServerFn_handler,
  listCommunityChannelLayouts_createServerFn_handler,
  listCommunityGearRatios_createServerFn_handler,
  publishMyChannelLayout_createServerFn_handler,
  publishMyGearRatios_createServerFn_handler,
  syncDesktopLaps_createServerFn_handler,
  upsertMyCarClass_createServerFn_handler,
  upsertMyChannelLayout_createServerFn_handler,
  upsertMyGearRatios_createServerFn_handler,
  voteCommunityItem_createServerFn_handler
};
