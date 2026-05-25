import { useEffect } from "react";
import type { Telemetry } from "@/lib/telemetry-types";
import { useWorkbench } from "@/lib/store";

/**
 * Syncs the live bridge's track/car/connected state into the global Zustand
 * store so any component (Workbench AICoach, Settings, etc.) can access it
 * regardless of which route is currently active.
 *
 * Mount this once at the app root scope.
 */
export function LiveBridgeSync({ t }: { t: Telemetry }) {
  const setLiveContext = useWorkbench((s) => s.setLiveContext);

  useEffect(() => {
    setLiveContext(t.track, t.car, t.connected);
  }, [t.track, t.car, t.connected, setLiveContext]);

  return null;
}
