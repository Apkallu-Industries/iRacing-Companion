import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { MathExpressionSchema } from "@/lib/math/schema";

/* ───────────────────────────── Gear Ratios ───────────────────────────── */

export const upsertMyGearRatios = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        car: z.string().min(1).max(255),
        ratios: z.record(z.string(), z.object({ ratio: z.number(), samples: z.number() })),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("shared_gear_ratios").upsert(
      {
        user_id: userId,
        car: data.car,
        ratios: data.ratios,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,car" },
    );
    if (error) return { ok: false, error: error.message } as const;
    return { ok: true } as const;
  });

export const getMyGearRatios = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ car: z.string().min(1).max(255) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row } = await supabase
      .from("shared_gear_ratios")
      .select("ratios, published, name")
      .eq("user_id", userId)
      .eq("car", data.car)
      .maybeSingle();
    return { row: row ?? null } as const;
  });

export const publishMyGearRatios = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        car: z.string().min(1).max(255),
        name: z.string().max(120).optional(),
        published: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("shared_gear_ratios")
      .update({ published: data.published, name: data.name ?? null })
      .eq("user_id", userId)
      .eq("car", data.car);
    if (error) return { ok: false, error: error.message } as const;
    return { ok: true } as const;
  });

export const listCommunityGearRatios = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ car: z.string().min(1).max(255).optional() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let q = supabase
      .from("shared_gear_ratios")
      .select("id, user_id, car, name, ratios, votes, updated_at")
      .eq("published", true)
      .order("votes", { ascending: false })
      .limit(50);
    if (data.car) q = q.eq("car", data.car);
    const { data: rows, error } = await q;
    if (error) return { rows: [], error: error.message } as const;
    return { rows: rows ?? [] } as const;
  });

/* ─────────────────────────── Channel Layouts ─────────────────────────── */
const ChannelLayoutSchema = z.object({
  visible: z.array(z.string().max(120)).max(300),
  modeByKey: z.record(z.string().max(120), z.enum(["raw", "trace"])).optional(),
  mathExpressions: z.array(MathExpressionSchema).max(100).optional(),
});

export const upsertMyChannelLayout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        name: z.string().min(1).max(120),
        layout: ChannelLayoutSchema,
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Single "current" layout per user = name "default". Multiple named layouts also supported.
    const { data: existing } = await supabase
      .from("shared_channel_layouts")
      .select("id")
      .eq("user_id", userId)
      .eq("name", data.name)
      .maybeSingle();
    const payload = { user_id: userId, name: data.name, layout: data.layout };
    const { error } = existing
      ? await supabase.from("shared_channel_layouts").update(payload).eq("id", existing.id)
      : await supabase.from("shared_channel_layouts").insert(payload);
    if (error) return { ok: false, error: error.message } as const;
    return { ok: true } as const;
  });

export const getMyChannelLayout = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ name: z.string().min(1).max(120).default("default") }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row } = await supabase
      .from("shared_channel_layouts")
      .select("layout, published, name")
      .eq("user_id", userId)
      .eq("name", data.name)
      .maybeSingle();
    return { row: row ?? null } as const;
  });

export const publishMyChannelLayout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ name: z.string().min(1).max(120), published: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("shared_channel_layouts")
      .update({ published: data.published })
      .eq("user_id", userId)
      .eq("name", data.name);
    if (error) return { ok: false, error: error.message } as const;
    return { ok: true } as const;
  });

export const listCommunityChannelLayouts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("shared_channel_layouts")
      .select("id, user_id, name, layout, votes, updated_at")
      .eq("published", true)
      .order("votes", { ascending: false })
      .limit(50);
    if (error) return { rows: [], error: error.message } as const;
    return { rows: rows ?? [] } as const;
  });

/* ─────────────────────────── Car Classes ─────────────────────────── */

export const upsertMyCarClass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        car: z.string().min(1).max(255),
        car_class: z.string().min(1).max(64),
        confidence: z.number().min(0).max(1).optional(),
        published: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("shared_car_classes").upsert(
      {
        user_id: userId,
        car: data.car,
        car_class: data.car_class,
        confidence: data.confidence ?? null,
        published: data.published ?? false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,car" },
    );
    if (error) return { ok: false, error: error.message } as const;
    return { ok: true } as const;
  });

export const listCommunityCarClasses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ car: z.string().min(1).max(255).optional() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let q = supabase
      .from("shared_car_classes")
      .select("id, user_id, car, car_class, votes, updated_at")
      .eq("published", true)
      .order("votes", { ascending: false })
      .limit(100);
    if (data.car) q = q.eq("car", data.car);
    const { data: rows, error } = await q;
    if (error) return { rows: [], error: error.message } as const;
    return { rows: rows ?? [] } as const;
  });

/* ─────────────────────────── Voting ─────────────────────────── */

const VoteKind = z.enum(["gear_ratios", "channel_layout", "car_class"]);
const tableForKind = {
  gear_ratios: "shared_gear_ratios",
  channel_layout: "shared_channel_layouts",
  car_class: "shared_car_classes",
} as const;

export const voteCommunityItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ target_id: z.string().uuid(), kind: VoteKind }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Toggle: if vote exists, remove it; else add it. Then recount.
    const { data: existing } = await supabase
      .from("community_votes")
      .select("user_id")
      .eq("user_id", userId)
      .eq("target_id", data.target_id)
      .eq("kind", data.kind)
      .maybeSingle();
    if (existing) {
      await supabase
        .from("community_votes")
        .delete()
        .eq("user_id", userId)
        .eq("target_id", data.target_id)
        .eq("kind", data.kind);
    } else {
      await supabase
        .from("community_votes")
        .insert({ user_id: userId, target_id: data.target_id, kind: data.kind });
    }
    const { data: votes } = await supabase.rpc("set_community_votes", {
      _kind: data.kind,
      _target_id: data.target_id,
    });
    return { ok: true, votes: votes ?? 0, voted: !existing } as const;
  });

/* ───────────────────── Desktop offline lap sync ───────────────────── */

export const syncDesktopLaps = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        laps: z
          .array(
            z.object({
              ts: z.number(),
              car: z.string().max(255).optional().nullable(),
              track: z.string().max(255).optional().nullable(),
              lapTimeS: z.number().positive(),
              fuel: z.number().optional().nullable(),
              sof: z.number().optional().nullable(),
            }),
          )
          .min(1)
          .max(500),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const rows = data.laps
      .filter((l) => l.car && l.track)
      .map((l) => ({
        user_id: userId,
        car: l.car!,
        track: l.track!,
        lap_time_s: l.lapTimeS,
        fuel_used_l: l.fuel ?? null,
        recorded_at: new Date(l.ts).toISOString(),
        is_valid: true,
      }));
    if (rows.length === 0) return { inserted: 0, accepted: [] as number[] } as const;
    const { error } = await supabase.from("live_lap_records").insert(rows);
    if (error) return { inserted: 0, error: error.message, accepted: [] as number[] } as const;
    return { inserted: rows.length, accepted: data.laps.map((l) => l.ts) } as const;
  });
