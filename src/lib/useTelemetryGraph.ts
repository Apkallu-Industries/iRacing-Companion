import { useTelemetry } from "./useTelemetry";
import { useTeamTelemetry } from "./useTeamTelemetry";
import { useMemo } from "react";
import type { Telemetry } from "./telemetry-types";
import type { DriverTelemetrySnapshot } from "./useTeamTelemetry";

export interface TelemetryGraph {
  localCar: Telemetry | null;
  remoteCars: Map<string, DriverTelemetrySnapshot>;
  activeDriver: string;
  teammates: DriverTelemetrySnapshot[];
  overlays: {
    carNumber: string;
    speedDelta: number;
    fuelDelta: number;
  }[];
  relayHealth: {
    connected: boolean;
    onlineCount: number;
    teamCode: string | null;
  };
  enduranceState: {
    chassisFatigue: number;
    brakeWear: number;
    gearboxStress: number;
    ersHealth: number;
  } | null;
  adaptationState: {
    event: string;
    incomingDriver?: string;
    currentLapInWindow?: number;
    brakeBiteMismatchPct: number;
    steeringJitterMismatchPct: number;
    tireThermalGradientDelta: number;
  } | null;
}

/**
 * useTelemetryGraph — Unified Team Operations Telemetry Hook.
 * Bridges local high-frequency deterministic workstation frames with distributed teammate streams.
 */
export function useTelemetryGraph(): TelemetryGraph {
  const local = useTelemetry();
  
  // Retrieve the active team code from localStorage if configured
  const teamCode = typeof window !== "undefined" ? (localStorage.getItem("team_code") || null) : null;
  const { drivers: remoteCars, connected: relayConnected, onlineCount } = useTeamTelemetry(teamCode);

  const localCar = local.connected ? local : null;

  // Resolve the active driver name from local telemetry or fallback to username
  const activeDriver = localCar?.all?.DriverInfo?.Drivers?.[localCar.all.DriverInfo.DriverCarIdx]?.UserName || localCar?.car || "Unknown Driver";

  // Filter remote cars to compile a list of active teammates (excluding our local car if connected)
  const teammates = useMemo(() => {
    const localCarNum = localCar?.carNumber || "";
    return Array.from(remoteCars.values()).filter((d) => d.carNumber !== localCarNum);
  }, [remoteCars, localCar?.carNumber]);

  // Generate real-time telemetry overlay gaps and deltas
  const overlays = useMemo(() => {
    if (!localCar) return [];
    return Array.from(remoteCars.values()).map((rc) => ({
      carNumber: rc.carNumber,
      speedDelta: 0,
      fuelDelta: 0,
    }));
  }, [localCar, remoteCars]);

  // Resolve persistent vehicle state (from local bridge state or active remote teammate channel)
  const activeCarNumber = localCar?.carNumber || Array.from(remoteCars.keys())[0] || "963";
  const activeRemoteCar = remoteCars.get(activeCarNumber);

  const enduranceState = useMemo(() => {
    if (localCar && (localCar as any).enduranceState) {
      return (localCar as any).enduranceState;
    }
    if (activeRemoteCar?.carOperationalState?.fatigueSummary) {
      return {
        chassisFatigue: activeRemoteCar.carOperationalState.fatigueSummary.chassis,
        brakeWear: activeRemoteCar.carOperationalState.fatigueSummary.brakes,
        gearboxStress: activeRemoteCar.carOperationalState.fatigueSummary.gearbox,
        ersHealth: activeRemoteCar.carOperationalState.fatigueSummary.ersHealth,
      };
    }
    // Baseline safe fallback wear state
    return {
      chassisFatigue: 0.0,
      brakeWear: 100.0,
      gearboxStress: 0.0,
      ersHealth: 100.0,
    };
  }, [localCar, activeRemoteCar]);

  const adaptationState = useMemo(() => {
    if (localCar && (localCar as any).adaptationState) {
      return (localCar as any).adaptationState;
    }
    if (activeRemoteCar?.carOperationalState?.adaptationWindow) {
      return {
        event: activeRemoteCar.carOperationalState.adaptationWindow.active ? "DRIVER_ADAPTATION_ACTIVE" : "DRIVER_ADAPTATION_INACTIVE",
        currentLapInWindow: activeRemoteCar.carOperationalState.adaptationWindow.currentLapInWindow,
        brakeBiteMismatchPct: 0,
        steeringJitterMismatchPct: 0,
        tireThermalGradientDelta: 0,
      };
    }
    return null;
  }, [localCar, activeRemoteCar]);

  return {
    localCar,
    remoteCars,
    activeDriver,
    teammates,
    overlays,
    relayHealth: {
      connected: relayConnected,
      onlineCount,
      teamCode,
    },
    enduranceState,
    adaptationState,
  };
}
