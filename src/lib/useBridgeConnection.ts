import { useCallback, useEffect, useState } from "react";
import { getBridgeStatus } from "@/lib/bridge.functions";

const WS_PORT = 3001;

export function getBridgeWsUrl(): string {
  if (typeof window === "undefined") return `ws://localhost:${WS_PORT}`;
  const configured = new URLSearchParams(window.location.search).get("bridge");
  if (configured) return configured;
  const host = ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? window.location.hostname
    : "localhost";
  return `ws://${host}:${WS_PORT}`;
}

/** Probe whether the bridge WebSocket accepts connections (port 3001). */
export function probeBridgeWebSocket(timeoutMs = 2500): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof WebSocket === "undefined") {
      resolve(false);
      return;
    }
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        ws.close();
      } catch {
        /* ignore */
      }
      resolve(ok);
    };
    let ws: WebSocket;
    try {
      ws = new WebSocket(getBridgeWsUrl());
    } catch {
      finish(false);
      return;
    }
    const timer = setTimeout(() => finish(false), timeoutMs);
    ws.onopen = () => finish(true);
    ws.onerror = () => finish(false);
  });
}

export interface BridgeConnectionState {
  /** Node bridge process reported running via server function */
  serviceRunning: boolean;
  /** ws://host:3001 accepts a connection */
  wsReachable: boolean;
  /** iRacing is streaming telemetry (from useTelemetry) */
  iracingLive: boolean;
  checking: boolean;
  refresh: () => void;
}

/**
 * Tracks bridge setup progress for the 3-step onboarding checklist.
 * `iracingLive` should come from telemetry.connected when on /live.
 */
export function useBridgeConnection(iracingLive = false, pollMs = 3000): BridgeConnectionState {
  const [serviceRunning, setServiceRunning] = useState(false);
  const [wsReachable, setWsReachable] = useState(false);
  const [checking, setChecking] = useState(true);

  const refresh = useCallback(async () => {
    setChecking(true);
    const [status, wsOk] = await Promise.all([
      getBridgeStatus()
        .then((r) => r.running)
        .catch(() => false),
      probeBridgeWebSocket(),
    ]);
    setServiceRunning(status);
    setWsReachable(wsOk);
    setChecking(false);
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, pollMs);
    return () => clearInterval(id);
  }, [refresh, pollMs]);

  return {
    serviceRunning,
    wsReachable: wsReachable || serviceRunning,
    iracingLive,
    checking,
    refresh,
  };
}
