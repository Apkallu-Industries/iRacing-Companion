import { useState } from "react";
import { exportSessionAsPwlap } from "@/lib/pwlap.functions";
import type { PwlapGranularity } from "@/lib/pwlap/types";

interface ExportPwlapDialogProps {
  sessionId: string;
  sessionName?: string;
  onClose: () => void;
  onSuccess?: (filename: string, url: string) => void;
}

export function ExportPwlapDialog({
  sessionId,
  sessionName = "export",
  onClose,
  onSuccess,
}: ExportPwlapDialogProps) {
  const [granularity, setGranularity] = useState<PwlapGranularity>("full");
  const [encrypt, setEncrypt] = useState(false);
  const [password, setPassword] = useState("");
  const [sign, setSign] = useState(false);
  const [includePii, setIncludePii] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setError(null);

    try {
      if (encrypt && !password) {
        throw new Error("Password required for encrypted export");
      }

      const result = await exportSessionAsPwlap({
        sessionId,
        granularity,
        encrypt,
        password: encrypt ? password : undefined,
        sign,
        includePii,
      });

      if (result.success) {
        onSuccess?.(result.filename, result.signedUrl);
        // Trigger download
        const link = document.createElement("a");
        link.href = result.signedUrl;
        link.download = result.filename;
        link.click();
        onClose();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold text-zinc-100 mb-4">Export Session as .PWLAP</h2>

        <div className="space-y-4">
          {/* Granularity */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Data Granularity</label>
            <select
              value={granularity}
              onChange={(e) => setGranularity(e.target.value as PwlapGranularity)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-100"
            >
              <option value="metadata">Metadata only (~5 KB)</option>
              <option value="setup">With setup sheet (~50 KB)</option>
              <option value="full">Full telemetry (~500 MB per 30min)</option>
            </select>
            <p className="text-xs text-zinc-500 mt-1">
              Choose how much data to include in the export.
            </p>
          </div>

          {/* Encryption */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={encrypt}
                onChange={(e) => setEncrypt(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-zinc-300">Encrypt with password (AES-256-GCM)</span>
            </label>
            {encrypt && (
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-100 placeholder-zinc-600"
              />
            )}
          </div>

          {/* Signing */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sign}
              onChange={(e) => setSign(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-zinc-300">Sign with Ed25519</span>
          </label>

          {/* Include PII */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includePii}
              onChange={(e) => setIncludePii(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-zinc-300">Include driver name (PII)</span>
          </label>

          {/* Error */}
          {error && <div className="text-sm text-rose-400 bg-rose-950 p-2 rounded">{error}</div>}

          {/* Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? "Exporting..." : "Export"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
