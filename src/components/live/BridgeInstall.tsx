import { useState } from "react";
import {
  Download,
  Terminal,
  Wifi,
  Play,
  Loader2,
  CheckCircle2,
  Circle,
  RefreshCw,
} from "lucide-react";
import { startBridge } from "@/lib/bridge.functions";
import { useBridgeConnection } from "@/lib/useBridgeConnection";
import { toast } from "sonner";
import { getBridgePerformanceMode } from "@/lib/bridgePerformance";

interface BridgeInstallProps {
  /** True when iRacing is streaming telemetry (from useTelemetry). */
  iracingLive?: boolean;
}

function StepRow({
  done,
  active,
  label,
  detail,
}: {
  done: boolean;
  active: boolean;
  label: string;
  detail: string;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-md px-3 py-2.5 transition-colors ${
        active
          ? "bg-accent/80 ring-1 ring-racing-orange/30"
          : done
            ? "bg-muted/40"
            : "bg-muted/20"
      }`}
    >
      {done ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
      ) : (
        <Circle
          className={`mt-0.5 h-4 w-4 shrink-0 ${active ? "text-racing-orange" : "text-muted-foreground"}`}
        />
      )}
      <div>
        <div
          className={`text-[11px] font-mono uppercase tracking-wider ${done ? "text-emerald-400" : "text-foreground"}`}
        >
          {label}
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}

export function BridgeInstall({ iracingLive = false }: BridgeInstallProps) {
  const [launching, setLaunching] = useState(false);
  const bridge = useBridgeConnection(iracingLive);

  const step1 = bridge.serviceRunning || bridge.wsReachable;
  const step2 = bridge.wsReachable;
  const step3 = iracingLive;

  const handleStart = async () => {
    setLaunching(true);
    try {
      const mode = getBridgePerformanceMode();
      const res = await startBridge({ data: { mode } });
      if (res.success) {
        toast.success(
          `${res.message || "Bridge started."} Mode: ${mode === "stable30" ? "Stable 30Hz" : "Balanced 60Hz"}`,
        );
        bridge.refresh();
      } else {
        toast.error(res.error || "Failed to start local bridge.");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to contact server.");
    } finally {
      setLaunching(false);
    }
  };

  return (
    <div className="rounded-lg bg-panel-2 ring-1 ring-racing-orange/40 p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Wifi className={`h-4 w-4 ${step3 ? "text-emerald-400" : "text-racing-orange"}`} />
          <h2 className="text-[11px] uppercase tracking-[0.2em] font-medium font-mono text-foreground">
            {step3
              ? "Live — iRacing connected"
              : step1
                ? "Bridge ready — waiting for iRacing"
                : "Connect telemetry"}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => bridge.refresh()}
          disabled={bridge.checking}
          className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-40"
          aria-label="Refresh connection status"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${bridge.checking ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <StepRow
          done={step1}
          active={!step1}
          label="Step 1 — Bridge service"
          detail={
            step1
              ? "WebSocket service is running on port 3001."
              : 'Click "Run Local Bridge" below, or start desktop/bridge on this PC.'
          }
        />
        <StepRow
          done={step2}
          active={step1 && !step2}
          label="Step 2 — Port reachable"
          detail={
            step2
              ? "Browser can reach ws://localhost:3001."
              : "If this stays red, check Windows Firewall allows Node.js on port 3001."
          }
        />
        <StepRow
          done={step3}
          active={step2 && !step3}
          label="Step 3 — iRacing session"
          detail={
            step3
              ? "Telemetry is streaming from the sim."
              : "Launch iRacing, get in a car, and enter practice or a session."
          }
        />
      </div>

      {!step1 && (
        <button
          type="button"
          onClick={handleStart}
          disabled={launching}
          className="flex w-full items-center justify-center gap-2 rounded bg-primary py-2.5 text-xs font-mono font-medium uppercase tracking-wider text-primary-foreground hover:opacity-95 disabled:opacity-50 transition-opacity mb-4"
        >
          {launching ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Starting bridge…
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current" />
              Run Local Bridge
            </>
          )}
        </button>
      )}

      {step1 && !step3 && (
        <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">
          Bridge is up. Open iRacing on this PC — data appears automatically when you are on track.
        </p>
      )}

      <div className="pt-3 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground font-mono">
        <span>Bridge Package</span>
        <a
          href="/downloads/pit-wall-bridge.zip"
          className="flex items-center gap-1 hover:text-foreground transition-colors text-primary font-semibold"
        >
          <Download className="h-3 w-3" /> Download pit-wall-bridge.zip
        </a>
      </div>
    </div>
  );
}
