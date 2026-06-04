/**
 * useTeamTelemetry — Supabase Realtime subscriber for multi-driver team telemetry.
 *
 * Subscribes to the shared team channel and returns a live map of
 * carNumber → DriverTelemetrySnapshot, updated at ~2Hz per driver.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ───────────────────────────────────────────────────

export interface TireCornerSnapshot {
  tempC: number;
  pressureBar: number;
  wearPct: number;
  estWearPct: number;
  brakeTempC: number;
  state: "cold" | "ok" | "hot";
}

export interface CarOperationalDigest {
  sequenceId: number;
  carId: string;
  activeDriver: string;
  projectedPitLap: number;
  fatigueSummary: {
    chassis: number;
    gearbox: number;
    brakes: number;
    ersHealth: number;
    aeroStability: number;
  };
  adaptationWindow: {
    active: boolean;
    currentLapInWindow: number;
  };
  strategyRisk: "LOW" | "MED" | "HIGH";
  alerts: string[];
}

export interface DriverTelemetrySnapshot {
  /** Unique key — the car number string e.g. "44" */
  carNumber: string;
  carName: string;
  driverName: string;

  // Advisory operational state from authoritative bridge
  carOperationalState?: Partial<CarOperationalDigest>;

  // Advisory fallback/legacy fields for frontend component compatibility
  lastLapSec: number;
  lastLap: string;
  bestLap: string;
  deltaSec: number;
  fuelRemainingL: number;
  fuelBurnPerLap: number;
  lapsEstimated: number;
  tires: {
    fl: TireCornerSnapshot;
    fr: TireCornerSnapshot;
    rl: TireCornerSnapshot;
    rr: TireCornerSnapshot;
  } | null;
  speedKph: number;
  gear: number;
  rpm: number;
  trackTempC: number;
  trackWetness: number;

  enduranceState?: {
    chassisFatigue: number;
    brakeWear: number;
    gearboxStress: number;
    ersHealth: number;
  } | null;

  adaptationState?: {
    event: string;
    incomingDriver?: string;
    currentLapInWindow?: number;
    brakeBiteMismatchPct: number;
    steeringJitterMismatchPct: number;
    tireThermalGradientDelta: number;
  } | null;

  // Meta
  timestamp: number;
  publishCount: number;
  /** true if we received a packet within the last 30s */
  isOnline: boolean;
  /** ms since last packet */
  staleness: number;
}

export interface UseTeamTelemetryResult {
  /** Map of carNumber → latest snapshot */
  drivers: Map<string, DriverTelemetrySnapshot>;
  /** Whether the Realtime channel is subscribed */
  connected: boolean;
  teamCode: string | null;
  driverCount: number;
  onlineCount: number;
}

const STALE_THRESHOLD_MS = 30_000; // 30s without a packet = offline

// ─── Hook ────────────────────────────────────────────────────

export function useTeamTelemetry(teamCode: string | null): UseTeamTelemetryResult {
  const [drivers, setDrivers] = useState<Map<string, DriverTelemetrySnapshot>>(new Map());
  const [connected, setConnected] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const stalenessRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateStaleness = useCallback(() => {
    setDrivers((prev) => {
      const now = Date.now();
      const next = new Map(prev);
      for (const [key, snap] of next) {
        const staleness = now - snap.timestamp;
        next.set(key, { ...snap, staleness, isOnline: staleness < STALE_THRESHOLD_MS });
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!teamCode) {
      setDrivers(new Map());
      setConnected(false);
      return;
    }

    const channelName = `team:${teamCode}`;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const ch = supabase.channel(channelName, {
      config: { broadcast: { ack: false } },
    });

    ch.on("broadcast", { event: "telemetry" }, ({ payload }: { payload: any }) => {
      if (!payload?.carNumber) return;

      // Perform smart mapping from carOperationalState to legacy top-level properties
      const opState = payload.carOperationalState as CarOperationalDigest | undefined;
      const activeDriver = opState?.activeDriver || "Unknown Driver";
      const brakesWear = opState?.fatigueSummary?.brakes ?? 100;

      const mappedTeammate: DriverTelemetrySnapshot = {
        carNumber: payload.carNumber,
        carName: payload.carName || "Unknown Car",
        driverName: activeDriver,
        carOperationalState: opState,

        // Populated advisory legacy fields from OperationalDigest where possible
        lastLapSec: 0,
        lastLap: "--:--.---",
        bestLap: "--:--.---",
        deltaSec: 0,
        fuelRemainingL: 0,
        fuelBurnPerLap: 0,
        lapsEstimated: opState?.projectedPitLap ? Math.max(0, opState.projectedPitLap) : 0,
        speedKph: 0,
        gear: 0,
        rpm: 0,
        trackTempC: 0,
        trackWetness: 0,

        tires: opState?.fatigueSummary
          ? {
              fl: {
                tempC: 80,
                pressureBar: 2.0,
                wearPct: brakesWear,
                estWearPct: brakesWear,
                brakeTempC: 300,
                state: "ok",
              },
              fr: {
                tempC: 80,
                pressureBar: 2.0,
                wearPct: brakesWear,
                estWearPct: brakesWear,
                brakeTempC: 300,
                state: "ok",
              },
              rl: {
                tempC: 80,
                pressureBar: 2.0,
                wearPct: brakesWear,
                estWearPct: brakesWear,
                brakeTempC: 300,
                state: "ok",
              },
              rr: {
                tempC: 80,
                pressureBar: 2.0,
                wearPct: brakesWear,
                estWearPct: brakesWear,
                brakeTempC: 300,
                state: "ok",
              },
            }
          : null,

        enduranceState: opState?.fatigueSummary
          ? {
              chassisFatigue: opState.fatigueSummary.chassis,
              brakeWear: opState.fatigueSummary.brakes,
              gearboxStress: opState.fatigueSummary.gearbox,
              ersHealth: opState.fatigueSummary.ersHealth,
            }
          : null,

        adaptationState: opState?.adaptationWindow
          ? {
              event: opState.adaptationWindow.active
                ? "DRIVER_ADAPTATION_ACTIVE"
                : "DRIVER_ADAPTATION_INACTIVE",
              incomingDriver: activeDriver,
              currentLapInWindow: opState.adaptationWindow.currentLapInWindow,
              brakeBiteMismatchPct: 0,
              steeringJitterMismatchPct: 0,
              tireThermalGradientDelta: 0,
            }
          : null,

        timestamp: payload.timestamp || Date.now(),
        publishCount: payload.publishCount || 1,
        isOnline: true,
        staleness: 0,
      };

      setDrivers((prev) => {
        const existing = prev.get(payload.carNumber);
        if (existing) {
          const existingSeq = existing.carOperationalState?.sequenceId ?? 0;
          const incomingSeq = mappedTeammate.carOperationalState?.sequenceId ?? 0;
          const existingTs = existing.timestamp ?? 0;
          const incomingTs = mappedTeammate.timestamp ?? 0;

          // Reject out-of-order or duplicate stale sequences under network packet storms
          if (
            incomingSeq < existingSeq ||
            (incomingSeq === existingSeq && incomingTs <= existingTs)
          ) {
            console.warn(
              `[telemetry-sync] Discarded out-of-order/stale packet: Car ${payload.carNumber} | Inbound Seq: ${incomingSeq} (Existing: ${existingSeq}) | Inbound Ts: ${incomingTs} (Existing: ${existingTs})`,
            );
            return prev;
          }
        }

        const next = new Map(prev);
        next.set(payload.carNumber, mappedTeammate);
        return next;
      });
    });

    ch.subscribe((status: "SUBSCRIBED" | "CHANNEL_ERROR" | "TIMED_OUT" | "CLOSED") => {
      setConnected(status === "SUBSCRIBED");
    });

    channelRef.current = ch;
    stalenessRef.current = setInterval(updateStaleness, 5_000);

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (stalenessRef.current) {
        clearInterval(stalenessRef.current);
        stalenessRef.current = null;
      }
      setConnected(false);
    };
  }, [teamCode, updateStaleness]);

  const driverList = Array.from(drivers.values());
  return {
    drivers,
    connected,
    teamCode,
    driverCount: drivers.size,
    onlineCount: driverList.filter((d) => d.isOnline).length,
  };
}
