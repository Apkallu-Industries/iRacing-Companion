/**
 * useTeamTelemetry — Supabase Realtime subscriber for multi-driver team telemetry.
 *
 * Subscribes to the shared team channel and returns a live map of
 * carNumber → DriverTelemetrySnapshot, updated at ~2Hz per driver.
 *
 * Usage:
 *   const { drivers, connected } = useTeamTelemetry("LE-MANS-2026-A");
 *
 * Each driver's bridge publishes to this channel via teamRelay.js.
 * Drivers who haven't sent in >30s are marked as offline.
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

export interface DriverTelemetrySnapshot {
  /** Unique key — the car number string e.g. "44" */
  carNumber: string;
  driverName: string;
  carName: string;

  // Lap
  lastLapSec: number;
  lastLap: string;
  bestLap: string;
  deltaSec: number;

  // Fuel
  fuelRemainingL: number;
  fuelBurnPerLap: number;
  lapsEstimated: number;

  // Tires
  tires: {
    fl: TireCornerSnapshot;
    fr: TireCornerSnapshot;
    rl: TireCornerSnapshot;
    rr: TireCornerSnapshot;
  } | null;

  // Motion
  speedKph: number;
  gear: number;
  rpm: number;

  // Environment
  trackTempC: number;
  trackWetness: number;

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
  // Staleness ticker — marks drivers offline after 30s silence
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

    // Clean up any existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const ch = supabase.channel(channelName, {
      config: { broadcast: { ack: false } },
    });

    ch.on(
      "broadcast",
      { event: "telemetry" },
      ({ payload }: { payload: Omit<DriverTelemetrySnapshot, "isOnline" | "staleness"> }) => {
        if (!payload?.carNumber) return;
        setDrivers((prev) => {
          const next = new Map(prev);
          next.set(payload.carNumber, {
            ...payload,
            isOnline: true,
            staleness: 0,
          });
          return next;
        });
      }
    );

    ch.subscribe((status: "SUBSCRIBED" | "CHANNEL_ERROR" | "TIMED_OUT" | "CLOSED") => {
      setConnected(status === "SUBSCRIBED");
    });

    channelRef.current = ch;

    // Staleness ticker — run every 5s
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
