import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { importPwlapSession, validatePwlapFile } from "@/lib/pwlap.functions";

interface ImportPwlapButtonProps {
  onSuccess?: (sessionId: string) => void;
  className?: string;
}

export function ImportPwlapButton({ onSuccess, className = "" }: ImportPwlapButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordPrompt, setPasswordPrompt] = useState<{
    show: boolean;
    fileData: ArrayBuffer | null;
    password: string;
    isEncrypted: boolean;
  }>({ show: false, fileData: null, password: "", isEncrypted: false });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const fileData = await file.arrayBuffer();

      // Validate file first
      const validation = await (validatePwlapFile as any)({ fileData });

      if (!validation.valid) {
        throw new Error(validation.error || "Invalid .pwlap file");
      }

      // If encrypted, prompt for password
      if (validation.encrypted) {
        setPasswordPrompt({
          show: true,
          fileData,
          password: "",
          isEncrypted: true,
        });
        setLoading(false);
        return;
      }

      // Otherwise, import directly
      await performImport(fileData, undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to validate file");
      setLoading(false);
    }
  };

  const performImport = async (fileData: ArrayBuffer, password?: string) => {
    setLoading(true);
    try {
      const result = await (importPwlapSession as any)({
          fileData,
          password,
          verifySignature: false,
        });

      if (result.success) {
        onSuccess?.(result.sessionId);
        // Redirect to session view
        navigate({ to: `/sessions/${result.sessionId}` });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
      setPasswordPrompt({ show: false, fileData: null, password: "", isEncrypted: false });
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pwlap"
        onChange={handleFileSelect}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className={`px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 ${className}`}
      >
        {loading ? "Processing..." : "Import .PWLAP"}
      </button>

      {error && (
        <div className="mt-2 p-3 bg-rose-950 border border-rose-800 rounded text-sm text-rose-400">
          {error}
        </div>
      )}

      {/* Password prompt modal */}
      {passwordPrompt.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-zinc-100 mb-4">Enter Password</h3>
            <p className="text-sm text-zinc-400 mb-4">
              This .PWLAP file is encrypted. Enter the password to decrypt it.
            </p>

            <input
              type="password"
              value={passwordPrompt.password}
              onChange={(e) =>
                setPasswordPrompt((p) => ({ ...p, password: e.target.value }))
              }
              placeholder="Password"
              autoFocus
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-100 placeholder-zinc-600 mb-4"
              onKeyDown={(e) => {
                if (e.key === "Enter" && passwordPrompt.fileData) {
                  performImport(passwordPrompt.fileData, passwordPrompt.password);
                }
              }}
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() =>
                  setPasswordPrompt({ show: false, fileData: null, password: "", isEncrypted: false })
                }
                disabled={loading}
                className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (passwordPrompt.fileData) {
                    performImport(passwordPrompt.fileData, passwordPrompt.password);
                  }
                }}
                disabled={loading}
                className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? "Importing..." : "Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
