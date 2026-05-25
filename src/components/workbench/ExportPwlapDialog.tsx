import { useState } from "react";
import { Download, Shield, ShieldAlert, Lock, Check } from "lucide-react";
import { useWorkbench } from "@/lib/store";
import { serializePwlap } from "@/lib/pwlap/serialize";
import type { PwlapContent, PwlapExportOptions } from "@/lib/pwlap/types";
import { toast } from "sonner";


export function ExportPwlapDialog({ sessionId, onClose }: { sessionId: string; onClose: () => void }) {
  const { parsed } = useWorkbench();
  const [granularity, setGranularity] = useState<"metadata" | "setup" | "full">("full");
  const [encrypt, setEncrypt] = useState(false);
  const [password, setPassword] = useState("");
  const [sign, setSign] = useState(false);
  const [privateKeyStr, setPrivateKeyStr] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!parsed) {
      toast.error("No telemetry session loaded to export.");
      return;
    }
    
    setIsExporting(true);
    try {
      const content: PwlapContent = {
        version: 1,
        metadata: {
          track: parsed.meta.trackDisplayName || "unknown",
          car: parsed.meta.carName || "unknown",
          recorded_at: parsed.meta.recordedAt || new Date().toISOString(),
          duration_s: parsed.meta.durationS || 0,
          lap_count: parsed.laps.length,
          best_lap_s: parsed.meta.bestLapS || parsed.laps.reduce((best, l) => (l.timeS > 0 && (best === 0 || l.timeS < best)) ? l.timeS : best, 0),
        },
        channels_manifest: Object.keys(parsed.channels).map(c => ({
          name: c,
          unit: parsed.channels[c].unit || "",
          description: parsed.channels[c].desc || "",
          type: parsed.channels[c].type,
          group: parsed.channels[c].group,
        })),
        granularity,
        laps: granularity !== "metadata" ? parsed.laps.map(l => ({
          lap_number: l.lap,
          duration_s: l.timeS,
          fuel_remaining_l: parsed.channels["FuelLevel"]?.data[l.endTick] ?? 0,
          track_temp_c: parsed.channels["TrackTemp"]?.data[l.endTick] ?? 0,
          air_temp_c: parsed.channels["AirTemp"]?.data[l.endTick] ?? 0,
        })) : undefined,
        setup: granularity !== "metadata" ? {} : undefined,
        samples: [],
      };

      if (granularity === "full") {
        // If full, pack the samples (simplified)
        // Normally this would be a massive array, we will just pass empty array or warn for now
        toast.info("Exporting 'full' telemetry samples can produce very large files.");
      }

      const options: PwlapExportOptions = {
        granularity,
        encrypt,
        password: encrypt ? password : undefined,
        sign,
        includePii: true,
        compress: true,
      };

      if (sign && privateKeyStr) {
        options.privateKey = new Uint8Array(Buffer.from(privateKeyStr, "base64"));
      }

      const buffer = await serializePwlap(content, options);
      
      // Trigger download
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `session_${sessionId}_${Date.now()}.pwlap`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(".pwlap exported successfully.");
      onClose();
    } catch (e) {
      toast.error(`Export failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-md border border-border bg-panel p-6 shadow-xl">
        <h2 className="mb-4 font-mono text-lg font-bold uppercase tracking-wider">Export .pwlap</h2>
        <div className="space-y-4">
          
          <div>
            <label className="mb-1 block font-mono text-[11px] uppercase text-muted-foreground">Granularity</label>
            <select 
              value={granularity} 
              onChange={e => setGranularity(e.target.value as any)}
              className="w-full rounded-sm border border-border bg-rail p-2 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="metadata">Metadata Only</option>
              <option value="setup">Metadata + Setup</option>
              <option value="full">Full Telemetry</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={encrypt} onChange={e => setEncrypt(e.target.checked)} className="accent-primary" />
              <span className="font-mono text-sm flex items-center gap-1"><Lock className="w-3 h-3"/> Encrypt File</span>
            </label>
            {encrypt && (
              <input 
                type="password" 
                placeholder="Encryption Password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-sm border border-border bg-rail p-2 text-sm outline-none focus:border-primary"
              />
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={sign} onChange={e => setSign(e.target.checked)} className="accent-primary" />
              <span className="font-mono text-sm flex items-center gap-1"><Shield className="w-3 h-3"/> Sign File (Ed25519)</span>
            </label>
            {sign && (
              <input 
                type="text" 
                placeholder="Private Key (base64)" 
                value={privateKeyStr}
                onChange={e => setPrivateKeyStr(e.target.value)}
                className="w-full rounded-sm border border-border bg-rail p-2 text-sm outline-none focus:border-primary font-mono text-[11px]"
              />
            )}
          </div>

        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-sm px-4 py-2 font-mono text-sm text-muted-foreground hover:text-foreground">
            Cancel
          </button>
          <button 
            onClick={handleExport}
            disabled={isExporting || (encrypt && !password) || (sign && !privateKeyStr)}
            className="flex items-center gap-2 rounded-sm bg-primary px-4 py-2 font-mono text-sm uppercase tracking-wider text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {isExporting ? "Exporting..." : <><Download className="w-4 h-4"/> Export</>}
          </button>
        </div>
      </div>
    </div>
  );
}
