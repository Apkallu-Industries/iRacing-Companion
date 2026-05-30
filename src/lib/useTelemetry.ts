import { useEffect, useRef, useState } from "react";
import { getBridgeClient } from "./bridgeDataClient";
import { DEFAULT_TELEMETRY, type Telemetry } from "./telemetry-types";
import { saveBridgePerformanceSnapshot } from "./bridgePerformance";
import { isForceLiveMode, allowSimulator } from "./runtimeConfig";

/**
 * Hook: Subscribe to live bridge telemetry.
 *
 * This is the PRIMARY consumer hook for the Bridge Data Client (single source of truth).
 * Returns current Telemetry state; automatically reconnects if bridge is offline.
 * Falls back to simulated data when bridge isn't available.
 */
export function useTelemetry(): Telemetry {
  const [t, setT] = useState<Telemetry>(DEFAULT_TELEMETRY);
  const liveRef = useRef(false);
  const clientRef = useRef(getBridgeClient());

  // Live WS connection via Bridge Data Client
  useEffect(() => {
    const client = clientRef.current;
    const unsubscribeTelemetry = client.onTelemetry((data) => {
      liveRef.current = true;
      setT((prev) => ({ ...prev, ...data, connected: true, source: "live" }));
    });
    const unsubscribeDisconnect = client.on((event) => {
      if (event.type === "disconnect") {
        liveRef.current = false;
        setT((prev) => ({ ...prev, connected: false, source: "simulated" }));
      } else if (event.type === "license" && event.data) {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("pitwall_bridge_license", JSON.stringify(event.data));
        }
      }
    });
    const cleanup = client.connect();
    return () => {
      unsubscribeTelemetry();
      unsubscribeDisconnect();
      cleanup();
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
      const client = clientRef.current;
      try {
        client.reportFps(latestFps);
        saveBridgePerformanceSnapshot(latestFps);
      } catch {
        // ignore
      }
    }, 2000);

    return () => {
      cancelAnimationFrame(raf);
      if (report) clearInterval(report);
    };
  }, []);

  // Simulator (only when not live) — 60Hz updates
  useEffect(() => {
    // Only enable the client-side simulator if explicitly allowed and force-live is not set.
    if (isForceLiveMode() || !allowSimulator()) return;
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
    }, 1000 / 60);
    return () => clearInterval(id);
  }, []);

  return t;
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}
function jitterTire(t: Telemetry["tires"]["fl"]) {
  const tempC = t.tempC + (Math.random() - 0.5) * 0.6;
  return {
    ...t,
    tempC,
    state: tempC > 92 ? ("hot" as const) : tempC < 70 ? ("cold" as const) : ("ok" as const),
  };
}
