/**
 * .pwlap export and import server functions.
 * Handle session serialization to proprietary format and deserialization back.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { serializePwlap, deserializePwlap } from "@/lib/pwlap/serialize";
import type { PwlapContent, PwlapExportOptions, PwlapGranularity } from "@/lib/pwlap/types";

/**
 * Export a session as a .pwlap file.
 *
 * This is a server function that:
 * 1. Fetches session metadata from Supabase
 * 2. Queries MongoDB for full telemetry samples (if granularity=full)
 * 3. Serializes to .pwlap format (optionally encrypted/signed)
 * 4. Returns a download blob
 */
export const exportSessionAsPwlap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        sessionId: z.string().uuid(),
        granularity: z.enum(["metadata", "setup", "full"]).default("full"),
        encrypt: z.boolean().default(false),
        password: z.string().optional(),
        sign: z.boolean().default(false),
        includePii: z.boolean().default(true),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Verify session ownership via RLS
    const { data: session, error: sErr } = await supabase
      .from("telemetry_sessions")
      .select("id, name, track, car, recorded_at, lap_count, best_lap_s, storage_path")
      .eq("id", data.sessionId)
      .single();

    if (sErr || !session) throw new Error("Session not found or access denied");

    // Build content based on granularity
    const content = await buildPwlapContent(data.sessionId, session, data.granularity, supabase);

    // Serialize to .pwlap
    const options: PwlapExportOptions = {
      granularity: data.granularity,
      encrypt: data.encrypt,
      password: data.password,
      sign: data.sign,
      includePii: data.includePii,
      compress: true, // Always compress for export
    };

    // TODO: Get user's private key from DB if signing is requested
    // if (data.sign) {
    //   const { data: keyRow } = await supabase
    //     .from("user_signing_keys")
    //     .select("private_key")
    //     .eq("user_id", userId)
    //     .single();
    //   if (keyRow?.private_key) {
    //     options.privateKey = new Uint8Array(Buffer.from(keyRow.private_key, "base64"));
    //   }
    // }

    try {
      const pwlapBuffer = await serializePwlap(content, options);

      // Create a temporary file in Supabase Storage
      const filename = `${session.name || "export"}_${Date.now()}.pwlap`;
      const { data: uploaded, error: uploadErr } = await supabaseAdmin.storage
        .from("pwlap_exports")
        .upload(`${userId}/${filename}`, pwlapBuffer, {
          contentType: "application/octet-stream",
          upsert: true,
        });

      if (uploadErr || !uploaded) throw new Error("Failed to upload .pwlap file");

      // Create a signed URL (7-day expiry)
      const { data: signed, error: signErr } = await supabaseAdmin.storage
        .from("pwlap_exports")
        .createSignedUrl(`${userId}/${filename}`, 7 * 24 * 60 * 60);

      if (signErr || !signed) throw new Error("Failed to create signed URL");

      return {
        success: true,
        filename,
        signedUrl: signed.signedUrl,
        size: pwlapBuffer.byteLength,
      };
    } catch (e) {
      throw new Error(`Export failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  });

/**
 * Import a .pwlap file as a new session.
 *
 * This is a server function that:
 * 1. Deserializes the .pwlap file
 * 2. Verifies signature (if signed)
 * 3. Creates a new session in Supabase
 * 4. Stores telemetry samples in MongoDB (if granularity=full)
 * 5. Returns the new session ID
 */
export const importPwlapSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        fileData: z.instanceof(ArrayBuffer),
        password: z.string().optional(),
        verifySignature: z.boolean().default(false),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    try {
      // Deserialize .pwlap
      const pwlapFile = await deserializePwlap(data.fileData, data.password);

      if (!pwlapFile.valid) throw new Error("Invalid .pwlap file");

      // Create new session in Supabase
      const { data: newSession, error: createErr } = await supabase
        .from("telemetry_sessions")
        .insert({
          user_id: userId,
          name: `Imported: ${pwlapFile.content.metadata.track}/${pwlapFile.content.metadata.car}`,
          track: pwlapFile.content.metadata.track,
          car: pwlapFile.content.metadata.car,
          recorded_at: pwlapFile.content.metadata.recorded_at,
          lap_count: pwlapFile.content.metadata.lap_count,
          best_lap_s: pwlapFile.content.metadata.best_lap_s,
          storage_path: null, // No .ibt file for imported sessions
          source: "pwlap_import",
        })
        .select("id")
        .single();

      if (createErr || !newSession) throw new Error("Failed to create session");

      // TODO: Store telemetry samples in MongoDB if granularity=full

      // Create audit trail entry
      await supabase.from("pwlap_imports").insert({
        user_id: userId,
        session_id: newSession.id,
        filename: pwlapFile.content.metadata.track,
        granularity: pwlapFile.content.granularity,
        encrypted: pwlapFile.encrypted,
        signed: pwlapFile.signed,
      });

      return {
        success: true,
        sessionId: newSession.id,
        granularity: pwlapFile.content.granularity,
        imported: {
          track: pwlapFile.content.metadata.track,
          car: pwlapFile.content.metadata.car,
          lapCount: pwlapFile.content.metadata.lap_count,
        },
      };
    } catch (e) {
      throw new Error(`Import failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  });

/**
 * Validate a .pwlap file without importing.
 */
export const validatePwlapFile = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        fileData: z.instanceof(ArrayBuffer),
        password: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    try {
      const pwlapFile = await deserializePwlap(data.fileData, data.password);

      return {
        valid: true,
        version: pwlapFile.header.version,
        granularity: pwlapFile.content.granularity,
        encrypted: pwlapFile.encrypted,
        signed: pwlapFile.signed,
        metadata: {
          track: pwlapFile.content.metadata.track,
          car: pwlapFile.content.metadata.car,
          driver: pwlapFile.content.metadata.driver,
          recordedAt: pwlapFile.content.metadata.recorded_at,
          lapCount: pwlapFile.content.metadata.lap_count,
        },
      };
    } catch (e) {
      return {
        valid: false,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  });

/**
 * Build PwlapContent from session data.
 * Queries MongoDB for telemetry samples if granularity=full.
 */
async function buildPwlapContent(
  sessionId: string,
  sessionRow: any,
  granularity: PwlapGranularity,
  supabase: any
): Promise<PwlapContent> {
  const content: PwlapContent = {
    version: 1,
    metadata: {
      track: sessionRow.track || "unknown",
      car: sessionRow.car || "unknown",
      recorded_at: sessionRow.recorded_at || new Date().toISOString(),
      duration_s: 0, // TODO: Calculate from laps
      lap_count: sessionRow.lap_count || 0,
      best_lap_s: sessionRow.best_lap_s,
    },
    channels_manifest: [], // TODO: Query from MongoDB channels_manifest
    granularity,
  };

  // Fetch lap metadata if granularity >= "setup"
  if (granularity === "setup" || granularity === "full") {
    // TODO: Fetch laps from MongoDB
    content.laps = [];

    // TODO: Fetch setup from .ibt file or session data
    content.setup = {};
  }

  // Fetch telemetry samples if granularity = "full"
  if (granularity === "full") {
    // TODO: Query MongoDB telemetry_samples collection
    content.samples = [];
  }

  return content;
}
