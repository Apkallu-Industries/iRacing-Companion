import { useEffect, useState } from "react";

const WS_PORT = 3001;

function getBridgeUrl() {
  if (typeof window === "undefined") return `ws://localhost:${WS_PORT}`;
  const configured = new URLSearchParams(window.location.search).get("bridge");
  if (configured) return configured;
  const host = ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? window.location.hostname
    : "localhost";
  return `ws://${host}:${WS_PORT}`;
}

/**
 * Lightweight bridge-presence probe. Opens a WebSocket to the local bridge
 * and flips `connected` true once any message arrives. No simulator, no
 * sample retention — safe to mount globally (e.g. in AppHeader) so users
 * can see at a glance whether their local iRacing bridge is alive while
 * working in any workspace (.ibt sessions, fingerprint, lab, etc.).
 */
export function useBridgeStatus(): { connected: boolean } {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let retry: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const connect = () => {
      try {
        ws = new WebSocket(getBridgeUrl());
      } catch {
        retry = setTimeout(connect, 5000);
        return;
      }
      ws.onmessage = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        if (!cancelled) retry = setTimeout(connect, 5000);
      };
      ws.onerror = () => ws?.close();
    };
    connect();

    return () => {
      cancelled = true;
      if (retry) clearTimeout(retry);
      ws?.close();
    };
  }, []);

  return { connected };
}
