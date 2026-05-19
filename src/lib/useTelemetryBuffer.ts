import { useEffect, useRef, useState } from "react";
import type { Telemetry } from "./telemetry-types";

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

/**
 * Rolling buffer of telemetry samples, MoTeC i2-style.
 * Keeps the last `windowMs` of frames at ~30Hz for trace + scatter rendering.
 */
export function useTelemetryBuffer(t: Telemetry, windowMs = 30_000, hz = 30): Sample[] {
  const bufRef = useRef<Sample[]>([]);
  const t0Ref = useRef<number | null>(null);
  const lastPushRef = useRef<number>(0);
  const [, force] = useState(0);

  useEffect(() => {
    const now = performance.now();
    if (t0Ref.current == null) t0Ref.current = now;
    const minInterval = 1000 / hz;
    if (now - lastPushRef.current < minInterval) return;
    lastPushRef.current = now;
    const s: Sample = {
      t: now - t0Ref.current,
      speed: t.speedKph,
      rpm: t.rpm,
      throttle: t.throttle,
      brake: t.brake,
      steering: t.steeringDeg,
      gLat: t.gLat,
      gLon: t.gLon,
    };
    const buf = bufRef.current;
    buf.push(s);
    const cutoff = s.t - windowMs;
    while (buf.length > 0 && buf[0].t < cutoff) buf.shift();
    // Trigger paint every push — components reading buffer rely on parent re-render
    force((n) => (n + 1) & 0xffff);
  }, [t, windowMs, hz]);

  return bufRef.current;
}
