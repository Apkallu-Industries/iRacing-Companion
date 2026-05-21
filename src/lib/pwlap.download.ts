/**
 * Retrieve a previously exported .pwlap file by ID.
 * Used to download exports that were stored in MongoDB.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getDb } from "@/lib/mongodb.server";

export const downloadPwlapExport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        exportId: z.string(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }: { data: any; context: any }) => {
    const { userId } = context;

    try {
      const db = await getDb();
      const exportsCollection = db.collection("pwlap_exports");
      const { ObjectId } = await import("mongodb");
      
      const export_ = await exportsCollection.findOne({
        _id: new ObjectId(data.exportId),
        user_id: userId, // Verify ownership
      });

      if (!export_) throw new Error("Export not found or access denied");

      // Increment download count
      await exportsCollection.updateOne(
        { _id: new ObjectId(data.exportId) },
        { $set: { download_count: (export_.download_count || 0) + 1 } }
      );

      return {
        success: true,
        filename: export_.filename,
        fileBuffer: Buffer.from(export_.file_buffer).toString("base64"),
        size: export_.file_size_bytes,
      };
    } catch (e) {
      throw new Error(`Download failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  });
