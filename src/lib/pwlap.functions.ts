/**
 * .pwlap export and import server functions.
 * Handle session serialization to proprietary format and deserialization back.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { serializePwlap, deserializePwlap } from "@/lib/pwlap/serialize";
import {
  getTelemetrySamplesCollection,
  getChannelsManifestCollection,
  getLapsCollection,
  getSessionsCollection,
  getDb,
  type TelemetrySample,
  type LapRecord,
  type ChannelsManifest,
  type SessionRecord,
} from "@/lib/mongodb.server";
import type { PwlapContent, PwlapExportOptions, PwlapGranularity } from "@/lib/pwlap/types";

export interface PwlapExportRecord {
  _id?: string;
  user_id: string;
  session_id: string;
  filename: string;
  granularity: PwlapGranularity;
  encrypted: boolean;
  signed: boolean;
  file_buffer: Uint8Array;
  file_size_bytes: number;
  created_at: Date;
  expires_at?: Date;
  download_count: number;
}
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

    // Get user's private key from DB if signing is requested
    if (data.sign) {
      const { data: keyRow } = await supabase
        .from("user_signing_keys")
        .select("private_key")
        .eq("user_id", userId)
        .single();
      if (keyRow?.private_key) {
        options.privateKey = new Uint8Array(Buffer.from(keyRow.private_key, "base64"));
      }
    }

    try {
      const pwlapBuffer = await serializePwlap(content, options);

      // Store export in MongoDB instead of Supabase Storage
      const filename = `${session.name || "export"}_${Date.now()}.pwlap`;
      const db = await getDb();
      const exportsCollection = db.collection("pwlap_exports");
      
      const exportRecord: PwlapExportRecord = {
        user_id: userId,
        session_id: data.sessionId,
        filename,
        granularity: data.granularity,
        encrypted: data.encrypt,
        signed: data.sign,
        file_buffer: new Uint8Array(pwlapBuffer),
        file_size_bytes: pwlapBuffer.byteLength,
        created_at: new Date(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        download_count: 0,
      };
      
      const result = await exportsCollection.insertOne(exportRecord as any);
      if (!result.insertedId) throw new Error("Failed to store .pwlap file");

      return {
        success: true,
        filename,
        exportId: result.insertedId.toString(),
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

      // Store telemetry samples in MongoDB if granularity=full
      if (pwlapFile.content.samples && pwlapFile.content.samples.length > 0) {
        try {
          const samplesCollection = await getTelemetrySamplesCollection();
          const sampleDocs = pwlapFile.content.samples.map((sample: any) => ({
            session_id: newSession.id,
            timestamp: sample.timestamp,
            lap_number: sample.lap_number || 0,
            channels: sample.channels,
          }));

          if (sampleDocs.length > 0) {
            await samplesCollection.insertMany(sampleDocs, { ordered: false });
          }
        } catch (e) {
          console.warn("Failed to store telemetry samples in MongoDB:", e);
        }
      }

      // Store laps in MongoDB if available
      if (pwlapFile.content.laps && pwlapFile.content.laps.length > 0) {
        try {
          const lapsCollection = await getLapsCollection();
          const lapDocs = pwlapFile.content.laps.map((lap: any) => ({
            session_id: newSession.id,
            ...lap,
          }));

          if (lapDocs.length > 0) {
            await lapsCollection.insertMany(lapDocs, { ordered: false });
          }
        } catch (e) {
          console.warn("Failed to store laps in MongoDB:", e);
        }
      }

      // Store channels manifest if available
      if (pwlapFile.content.channels_manifest && pwlapFile.content.channels_manifest.length > 0) {
        try {
          const manifestCollection = await getChannelsManifestCollection();
          // Map pwlap channel types (IBT_TYPE) to the ChannelsManifest expected types
          const mappedChannels = (pwlapFile.content.channels_manifest || []).map((c: any) => ({
            name: c.name,
            unit: c.unit,
            type: c.type === 1 ? "boolean" : "numeric",
            group: c.group,
          }));
          await manifestCollection.insertOne({
            session_id: newSession.id,
            channels: mappedChannels as any,
          });
        } catch (e) {
          console.warn("Failed to store channels manifest in MongoDB:", e);
        }
      }

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
  let channelsManifest: any[] = [];
  let laps: any[] = [];
  let samples: any[] = [];

  // Fetch channels manifest from MongoDB
  try {
    const manifestCollection = await getChannelsManifestCollection();
    const manifest = await manifestCollection.findOne({ session_id: sessionId });
    if (manifest) {
      channelsManifest = manifest.channels || [];
    }
  } catch (e) {
    console.warn("Failed to fetch channels manifest:", e);
  }

  // Fetch laps and calculate total duration if granularity >= "setup"
  if (granularity === "setup" || granularity === "full") {
    try {
      const lapsCollection = await getLapsCollection();
      const lapRecords = await lapsCollection
        .find({ session_id: sessionId })
        .sort({ lap_number: 1 })
        .toArray();

      laps = lapRecords.map((lap: LapRecord) => ({
        lap_number: lap.lap_number,
        duration_s: lap.duration_s,
        fuel_remaining_l: lap.fuel_remaining_l,
        track_temp_c: lap.track_temp_c,
        air_temp_c: lap.air_temp_c,
        consumed_fuel_l: lap.consumed_fuel_l,
      }));
    } catch (e) {
      console.warn("Failed to fetch laps:", e);
    }
  }

  // Fetch telemetry samples if granularity = "full"
  if (granularity === "full") {
    try {
      const samplesCollection = await getTelemetrySamplesCollection();
      const sampleRecords = await samplesCollection
        .find({ session_id: sessionId })
        .sort({ timestamp: 1 })
        .limit(100000) // Cap at 100k samples (~30min @ 30Hz)
        .toArray();

      samples = sampleRecords.map((sample: TelemetrySample) => ({
        timestamp: sample.timestamp,
        lap_number: sample.lap_number,
        channels: sample.channels,
      }));
    } catch (e) {
      console.warn("Failed to fetch telemetry samples:", e);
    }
  }

  // Calculate total duration from laps
  const totalDurationS = laps.reduce((sum, lap) => sum + lap.duration_s, 0);

  const content: PwlapContent = {
    version: 1,
    metadata: {
      track: sessionRow.track || "unknown",
      car: sessionRow.car || "unknown",
      recorded_at: sessionRow.recorded_at || new Date().toISOString(),
      duration_s: totalDurationS,
      lap_count: laps.length || sessionRow.lap_count || 0,
      best_lap_s: sessionRow.best_lap_s,
    },
    channels_manifest: channelsManifest,
    granularity,
    laps: granularity !== "metadata" ? laps : undefined,
    samples: granularity === "full" ? samples : undefined,
    setup: granularity !== "metadata" ? {} : undefined,
  };

  return content;
}
