import { useEffect } from "react";
import { useWorkbench } from "@/lib/store";
import { useTelemetryStore } from "@/lib/useTelemetryStore";

/**
 * Syncs the live bridge's track/car/connected state into the global Zustand
 * store so any component (Workbench AICoach, Settings, etc.) can access it
 * regardless of which route is currently active.
 *
 * Highly optimized to subscribe only to sparse metadata fields, protecting the app
 * from high-frequency telemetry re-render churn.
 */
export function LiveBridgeSync() {
  const setLiveContext = useWorkbench((s) => s.setLiveContext);
  const track = useTelemetryStore((s) => s.telemetry.track);
  const car = useTelemetryStore((s) => s.telemetry.car);
  const connected = useTelemetryStore((s) => s.telemetry.connected);

  useEffect(() => {
    setLiveContext(track, car, connected);
  }, [track, car, connected, setLiveContext]);

  return null;
}
