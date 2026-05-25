import { useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";
import type { Telemetry } from "@/lib/telemetry-types";
import { useBridgeConnection } from "@/lib/useBridgeConnection";

const DISMISS_KEY = "pit-wall:bridge-banner-dismissed";

/**
 * On /live, if still no iRacing telemetry after 60s, show an actionable firewall hint.
 */
export function BridgeConnectionBanner({ t }: { t: Telemetry }) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => typeof sessionStorage !== "undefined" && sessionStorage.getItem(DISMISS_KEY) === "1",
  );
  const bridge = useBridgeConnection(t.connected);

  useEffect(() => {
    if (t.connected || dismissed) {
      setShow(false);
      return;
    }
    const timer = setTimeout(() => setShow(true), 60_000);
    return () => clearTimeout(timer);
  }, [t.connected, dismissed]);

  if (!show || t.connected) return null;

  const portBlocked = !bridge.wsReachable && !bridge.serviceRunning;

  return (
    <div
      className="mx-2 mb-2 flex items-start gap-3 rounded-md border border-racing-orange/40 bg-racing-orange/10 px-3 py-2.5 text-xs text-zinc-200"
      role="alert"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-racing-orange" />
      <div className="flex-1 space-y-1">
        <p className="font-semibold text-zinc-100">Still no telemetry after 60 seconds</p>
        {portBlocked ? (
          <p className="text-zinc-400 leading-relaxed">
            Port{" "}
            <code className="rounded bg-zinc-900 px-1 font-mono text-[11px] text-primary">
              3001
            </code>{" "}
            is not reachable. Start the bridge below, then allow Node.js through Windows Firewall if
            prompted.
          </p>
        ) : (
          <p className="text-zinc-400 leading-relaxed">
            The bridge looks up, but iRacing is not sending data yet. Launch iRacing, get in a car,
            and start a practice or race session.
          </p>
        )}
        <p className="font-mono text-[10px] text-zinc-500">
          Test in browser:{" "}
          <a
            href="http://localhost:3001"
            className="text-primary hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            http://localhost:3001
          </a>
        </p>
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        className="shrink-0 rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
        onClick={() => {
          sessionStorage.setItem(DISMISS_KEY, "1");
          setDismissed(true);
          setShow(false);
        }}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
