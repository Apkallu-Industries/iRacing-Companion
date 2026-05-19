import { useState, useEffect } from "react";
import { Download, Terminal, Wifi, Play, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { startBridge, getBridgeStatus } from "@/lib/bridge.functions";
import { toast } from "sonner";

export function BridgeInstall() {
  const [running, setRunning] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkStatus = async () => {
    try {
      const res = await getBridgeStatus();
      setRunning(res.running);
    } catch {
      setRunning(false);
    } finally {
      setChecking(false);
    }
  };

  const handleStart = async () => {
    setLaunching(true);
    try {
      const res = await startBridge();
      if (res.success) {
        setRunning(true);
        toast.success(res.message || "Bridge started successfully.");
      } else {
        toast.error(res.error || "Failed to start local bridge.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to contact backend server.");
    } finally {
      setLaunching(false);
    }
  };

  useEffect(() => {
    checkStatus();
    // Poll every 3 seconds to see if it's running/started
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-lg bg-zinc-925 ring-1 ring-racing-orange/40 p-5">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Wifi className={`h-4 w-4 ${running ? "text-emerald-400" : "text-racing-orange"}`} />
          <h2 className="text-[11px] uppercase tracking-[0.2em] font-medium font-mono text-zinc-300">
            {running ? "Bridge Active — Awaiting iRacing" : "Bridge Offline"}
          </h2>
        </div>
        {!checking && (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono uppercase font-semibold ${
            running ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30" : "bg-racing-orange/10 text-racing-orange ring-1 ring-racing-orange/30"
          }`}>
            {running ? "Active" : "Stopped"}
          </span>
        )}
      </div>

      <p className="text-xs text-zinc-300 leading-relaxed font-sans mb-5">
        Pit Wall connects to iRacing using a local WebSocket server that reads simulator data on{" "}
        <code className="font-mono text-[11px] bg-zinc-900 px-1 rounded text-primary">ws://localhost:3001</code>.
      </p>

      {/* Action panel */}
      <div className="rounded-md bg-zinc-900/60 ring-1 ring-zinc-800 p-4 space-y-4">
        {running ? (
          <div className="space-y-3">
            <div className="flex items-start gap-2.5 text-xs text-emerald-400 font-sans">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-zinc-100">Local Bridge is running!</div>
                <p className="text-zinc-400 text-[11px] mt-0.5">
                  Start your iRacing simulator and enter a practice or race session. Data will stream automatically.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-2.5 text-xs text-zinc-400 font-sans">
              <AlertCircle className="h-4 w-4 text-racing-orange shrink-0 mt-0.5" />
              <div>
                <p className="text-zinc-300 font-mono text-[11px] uppercase tracking-wider">Start Bridge locally</p>
                <p className="text-zinc-400 text-[11px] mt-0.5">
                  Launch the background WebSocket service directly from this companion app to establish a stable stream.
                </p>
              </div>
            </div>
            
            <button
              onClick={handleStart}
              disabled={launching}
              className="flex w-full items-center justify-center gap-2 rounded bg-primary py-2.5 text-xs font-mono font-medium uppercase tracking-wider text-primary-foreground hover:opacity-95 disabled:opacity-50 transition-opacity"
            >
              {launching ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Starting Bridge service...
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Run Local Bridge
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Help links fallback */}
      <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
        <span>Need a standalone build?</span>
        <div className="flex gap-3">
          <a
            href="/downloads/pit-wall-desktop-win-x64.zip"
            className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
          >
            <Download className="h-3 w-3" /> Desktop App
          </a>
          <a
            href="/downloads/pit-wall-bridge.zip"
            className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
          >
            <Terminal className="h-3 w-3" /> CLI Zip
          </a>
        </div>
      </div>
    </div>
  );
}
