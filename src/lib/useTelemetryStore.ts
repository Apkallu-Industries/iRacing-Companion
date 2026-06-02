import { create } from "zustand";
import { getBridgeClient } from "./bridgeDataClient";
import { DEFAULT_TELEMETRY, type Telemetry } from "./telemetry-types";
import { isForceLiveMode, allowSimulator } from "./runtimeConfig";
import { saveBridgePerformanceSnapshot } from "./bridgePerformance";

export interface Sample {
  t: number; // ms since first sample
  speed: number;
  rpm: number;
  throttle: number; // 0..1
  brake: number; // 0..1
  steering: number; // deg
  gLat: number;
  gLon: number;
}

interface TelemetryState {
  telemetry: Telemetry;
  setTelemetry: (t: Telemetry) => void;
}

// Fast Zustand state store for telemetry frames
export const useTelemetryStore = create<TelemetryState>((set) => ({
  telemetry: DEFAULT_TELEMETRY,
  setTelemetry: (t) => set({ telemetry: t }),
}));

// In-memory non-reactive buffer to hold full 60Hz samples precisely without React state churn
const samplesBuffer: Sample[] = [];
let t0: number | null = null;
let lastPushTime = 0;
const WINDOW_MS = 30_000;
const HZ = 60;

export function getSamples(): Sample[] {
  return samplesBuffer;
}

// Throttled hook to subscribe to samples at a lower update frequency (e.g. 20Hz / 50ms)
import { useState, useEffect } from "react";

export function useThrottledSamples(throttleMs = 50): Sample[] {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate((n) => (n + 1) & 0xffff);
    }, throttleMs);

    return () => clearInterval(interval);
  }, [throttleMs]);

  return samplesBuffer;
}

// Throttled hook to subscribe to the telemetry frame at a lower update frequency (e.g. 10Hz / 100ms)
export function useTelemetryThrottled(throttleMs = 100): Telemetry {
  const [t, setT] = useState<Telemetry>(useTelemetryStore.getState().telemetry);

  useEffect(() => {
    const interval = setInterval(() => {
      setT(useTelemetryStore.getState().telemetry);
    }, throttleMs);

    return () => clearInterval(interval);
  }, [throttleMs]);

  return t;
}

let isLive = false;

// Connect to bridge client and start background processing
if (typeof window !== "undefined") {
  const client = getBridgeClient();

  client.onTelemetry((data: any) => {
    isLive = true;
    useTelemetryStore.setState((prev) => {
      // Merge delta frames or full sync frames into active state
      const merged = {
        ...prev.telemetry,
        ...data,
        tires: data.tires
          ? {
              fl: { ...prev.telemetry.tires.fl, ...data.tires.fl },
              fr: { ...prev.telemetry.tires.fr, ...data.tires.fr },
              rl: { ...prev.telemetry.tires.rl, ...data.tires.rl },
              rr: { ...prev.telemetry.tires.rr, ...data.tires.rr },
            }
          : prev.telemetry.tires,
        extras: data.extras ? { ...prev.telemetry.extras, ...data.extras } : prev.telemetry.extras,
        connected: true,
        source: "live" as const,
      };

      // Accumulate samples at 60Hz in the raw in-memory array
      const now = performance.now();
      if (t0 == null) t0 = now;
      const minInterval = 1000 / HZ;
      if (now - lastPushTime >= minInterval) {
        lastPushTime = now;
        const s: Sample = {
          t: now - t0,
          speed: merged.speedKph,
          rpm: merged.rpm,
          throttle: merged.throttle,
          brake: merged.brake,
          steering: merged.steeringDeg,
          gLat: merged.gLat,
          gLon: merged.gLon,
        };
        samplesBuffer.push(s);
        const cutoff = s.t - WINDOW_MS;
        while (samplesBuffer.length > 0 && samplesBuffer[0].t < cutoff) {
          samplesBuffer.shift();
        }
      }

      return { telemetry: merged };
    });
  });

  client.on((event) => {
    if (event.type === "disconnect") {
      isLive = false;
      useTelemetryStore.setState((prev) => ({
        telemetry: { ...prev.telemetry, connected: false, source: "simulated" as const }
      }));
    } else if (event.type === "license" && event.data) {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("pitwall_bridge_license", JSON.stringify(event.data));
      }
    }
  });

  client.connect();

  // Client-side simulator fallback if bridge is not connected
  setInterval(() => {
    if (isLive || isForceLiveMode() || !allowSimulator()) return;

    const now = performance.now() / 1000;
    useTelemetryStore.setState((prev) => {
      const throttle = clamp01(0.6 + 0.4 * Math.sin(now * 1.3));
      const brake = clamp01(Math.max(0, -Math.sin(now * 1.3)) * 0.7);
      const speed = 120 + 110 * (0.5 + 0.5 * Math.sin(now * 0.8));
      const rpm = 5500 + 4500 * throttle + 200 * Math.sin(now * 6);
      const gear = Math.max(1, Math.min(7, Math.round(2 + 4 * throttle)));

      const simulatedTires = {
        fl: jitterTire(prev.telemetry.tires.fl),
        fr: jitterTire(prev.telemetry.tires.fr),
        rl: jitterTire(prev.telemetry.tires.rl),
        rr: jitterTire(prev.telemetry.tires.rr),
      };

      const merged = {
        ...prev.telemetry,
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
        fuelRemainingL: Math.max(2, prev.telemetry.fuelRemainingL - 0.002),
        latencyMs: 18 + Math.round(8 * Math.random()),
        tires: simulatedTires,
      };

      // Accumulate simulated samples at 60Hz
      const perfNow = performance.now();
      if (t0 == null) t0 = perfNow;
      const s: Sample = {
        t: perfNow - t0,
        speed: merged.speedKph,
        rpm: merged.rpm,
        throttle: merged.throttle,
        brake: merged.brake,
        steering: merged.steeringDeg,
        gLat: merged.gLat,
        gLon: merged.gLon,
      };
      samplesBuffer.push(s);
      const cutoff = s.t - WINDOW_MS;
      while (samplesBuffer.length > 0 && samplesBuffer[0].t < cutoff) {
        samplesBuffer.shift();
      }

      return { telemetry: merged };
    });
  }, 1000 / HZ);

  // Background FPS reporting loop
  let frames = 0;
  let lastTime = performance.now();
  let latestFps = 60;

  const fpsLoop = (now: number) => {
    frames += 1;
    const elapsed = now - lastTime;
    if (elapsed >= 1000) {
      latestFps = (frames * 1000) / elapsed;
      frames = 0;
      lastTime = now;
    }
    requestAnimationFrame(fpsLoop);
  };
  requestAnimationFrame(fpsLoop);

  setInterval(() => {
    try {
      getBridgeClient().reportFps(latestFps);
      saveBridgePerformanceSnapshot(latestFps);
    } catch {}
  }, 2000);
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
