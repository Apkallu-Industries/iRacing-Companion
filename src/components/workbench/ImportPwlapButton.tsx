import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { deserializePwlap } from "@/lib/pwlap/serialize";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export function ImportPwlapButton() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pwlap")) {
      toast.error("Please choose a .pwlap file");
      return;
    }
    if (!user) {
      toast.error("You must be signed in to import .pwlap sessions.");
      return;
    }

    setBusy(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Decrypt/decompress
      const pwlapFile = await deserializePwlap(arrayBuffer); // Prompts for password if encrypted? Let's just try without password first. If it fails due to password, we'd need a prompt.
      
      if (!pwlapFile.valid) throw new Error("Invalid .pwlap file");

      // We need to upload this session as a regular session!
      // But we can't fully recreate the .ibt file on the server.
      // So we just save the metadata and store the .pwlap file instead of .ibt.
      
      // 1. Upload .pwlap file to 'telemetry' bucket (or pwlap_exports, but telemetry bucket is what sessions.$id expects)
      const storagePath = `${user.id}/${crypto.randomUUID()}_imported.pwlap`;
      
      const { error: uploadErr } = await supabase.storage
        .from("telemetry")
        .upload(storagePath, file);
        
      if (uploadErr) throw new Error("Failed to upload .pwlap file to storage: " + uploadErr.message);

      // 2. Create session record
      const { data: newSession, error: createErr } = await supabase
        .from("telemetry_sessions")
        .insert({
          user_id: user.id,
          name: `Imported: ${pwlapFile.content.metadata.track}/${pwlapFile.content.metadata.car}`,
          track: pwlapFile.content.metadata.track,
          car: pwlapFile.content.metadata.car,
          recorded_at: pwlapFile.content.metadata.recorded_at,
          lap_count: pwlapFile.content.metadata.lap_count,
          best_lap_s: pwlapFile.content.metadata.best_lap_s,
          duration_s: pwlapFile.content.metadata.duration_s,
          storage_path: storagePath,
          source: "pwlap_import",
          file_size: file.size,
        })
        .select("id")
        .single();

      if (createErr || !newSession) {
        throw new Error("Failed to create session record: " + (createErr?.message || "Unknown error"));
      }

      toast.success("Successfully imported .pwlap session.");
      navigate({ to: "/sessions/$id", params: { id: newSession.id } });

    } catch (e: any) {
      toast.error(`Import failed: ${e.message}`);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <>
      <button 
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        className="flex items-center gap-2 rounded-sm border border-border bg-rail px-4 py-2 font-mono text-sm uppercase tracking-wider text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
      >
        <Upload className="h-4 w-4" /> {busy ? "Importing..." : "Import .pwlap"}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".pwlap"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
    </>
  );
}
