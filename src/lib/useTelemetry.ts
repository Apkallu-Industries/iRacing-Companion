import { useEffect, useRef, useState } from "react";
import { DEFAULT_TELEMETRY, type Telemetry } from "./telemetry-types";

const WS_PORT = 3001;

function getBridgeUrl() {
  if (typeof window === "undefined") return `ws://localhost:${WS_PORT}`;
  const configuredUrl = new URLSearchParams(window.location.search).get("bridge");
  if (configuredUrl) return configuredUrl;
  const host = ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? window.location.hostname
    : "localhost";
  return `ws://${host}:${WS_PORT}`;
}

/**
 * Subscribes to a local iRacing bridge over WebSocket. Falls back to a smooth
 * simulator if the bridge isn't running so the dashboard is always alive.
 */
export function useTelemetry(): Telemetry {
  const [t, setT] = useState<Telemetry>(DEFAULT_TELEMETRY);
  const liveRef = useRef(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Live WS connection
  useEffect(() => {
    let ws: WebSocket | null = null;
    let retry: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const connect = () => {
      try {
        ws = new WebSocket(getBridgeUrl());
        wsRef.current = ws;
      } catch {
        retry = setTimeout(connect, 3000);
        return;
      }
      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data) as Partial<Telemetry>;
          liveRef.current = true;
          setT((prev) => ({ ...prev, ...data, connected: true, source: "live" }));
        } catch {
          /* ignore */
        }
      };
      ws.onclose = () => {
        wsRef.current = null;
        liveRef.current = false;
        setT((prev) => ({ ...prev, connected: false, source: "simulated" }));
        if (!cancelled) retry = setTimeout(connect, 3000);
      };
      ws.onerror = () => ws?.close();
    };
    connect();

    return () => {
      cancelled = true;
      if (retry) clearTimeout(retry);
      ws?.close();
      wsRef.current = null;
    };
  }, []);

  // Report approximate browser FPS to bridge for adaptive UI stream rate.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let frames = 0;
    let latestFps = 60;
    let report: ReturnType<typeof setInterval> | null = null;

    const loop = (now: number) => {
      frames += 1;
      const elapsed = now - last;
      if (elapsed >= 1000) {
        latestFps = (frames * 1000) / elapsed;
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    report = setInterval(() => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      try {
        ws.send(JSON.stringify({ type: "perf", fps: Math.round(latestFps) }));
      } catch {
        // ignore
      }
    }, 2000);

    return () => {
      cancelAnimationFrame(raf);
      if (report) clearInterval(report);
    };
  }, []);

  // Simulator (only when not live) — 30Hz updates
  useEffect(() => {
    const id = setInterval(() => {
      if (liveRef.current) return;
      const now = performance.now() / 1000;
      setT((prev) => {
        const throttle = clamp01(0.6 + 0.4 * Math.sin(now * 1.3));
        const brake = clamp01(Math.max(0, -Math.sin(now * 1.3)) * 0.7);
        const speed = 120 + 110 * (0.5 + 0.5 * Math.sin(now * 0.8));
        const rpm = 5500 + 4500 * throttle + 200 * Math.sin(now * 6);
        const gear = Math.max(1, Math.min(7, Math.round(2 + 4 * throttle)));
        return {
          ...prev,
          throttle,
          brake,
          clutch: 0,
          steeringDeg: 35 * Math.sin(now * 0.6),
          speedKph: Math.round(speed),
          rpm: Math.round(rpm),
          gear,
          gLat: 1.6 * Math.sin(now * 0.6),
          gLon: -1.2 * brake + 0.6 * throttle,
          deltaSec: 0.2 * Math.sin(now * 0.2),
          fuelRemainingL: Math.max(2, prev.fuelRemainingL - 0.002),
          latencyMs: 18 + Math.round(8 * Math.random()),
          tires: {
            fl: jitterTire(prev.tires.fl),
            fr: jitterTire(prev.tires.fr),
            rl: jitterTire(prev.tires.rl),
            rr: jitterTire(prev.tires.rr),
          },
        };
      });
    }, 1000 / 30);
    return () => clearInterval(id);
  }, []);

  return t;
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}
function jitterTire(t: Telemetry["tires"]["fl"]) {
  const tempC = t.tempC + (Math.random() - 0.5) * 0.6;
  return { ...t, tempC, state: tempC > 92 ? ("hot" as const) : tempC < 70 ? ("cold" as const) : ("ok" as const) };
}
