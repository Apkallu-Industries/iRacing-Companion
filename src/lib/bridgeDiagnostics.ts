import { useEffect, useRef, useState } from "react";
import type { Telemetry } from "./telemetry-types";

export interface BridgeDiagnostics {
  clientFps: number;
  streamHzActual: number;
  streamHzTarget: number;
  droppedMessages: number;
  reconnectCount: number;
  lastMessageAt: number;
  connectionStatus: "connected" | "connecting" | "disconnected";
}

const DEFAULT_DIAGNOSTICS: BridgeDiagnostics = {
  clientFps: 0,
  streamHzActual: 0,
  streamHzTarget: 30,
  droppedMessages: 0,
  reconnectCount: 0,
  lastMessageAt: 0,
  connectionStatus: "disconnected",
};

export function useBridgeDiagnostics(t: Telemetry, connected: boolean): BridgeDiagnostics {
  const [diagnostics, setDiagnostics] = useState<BridgeDiagnostics>(DEFAULT_DIAGNOSTICS);
  const lastMessageRef = useRef<number>(Date.now());
  const messageTimesRef = useRef<number[]>([]);
  const lastLatencyRef = useRef<number>(0);

  // Update diagnostics when telemetry changes
  useEffect(() => {
    const now = Date.now();
    lastMessageRef.current = now;

    // Track message timestamps for stream Hz calculation
    const times = messageTimesRef.current;
    times.push(now);
    if (times.length > 60) times.shift();

    // Calculate actual stream Hz (messages per second)
    let streamHzActual = 0;
    if (times.length > 1) {
      const elapsed = times[times.length - 1] - times[0];
      if (elapsed > 0) {
        streamHzActual = ((times.length - 1) / elapsed) * 1000;
      }
    }

    // Extract latency if available in telemetry
    const latency = (t as any).latencyMs || lastLatencyRef.current;
    lastLatencyRef.current = latency;

    // Infer stream Hz target from latency or use default
    let streamHzTarget = 30;
    if (latency && latency < 25) streamHzTarget = 60;

    setDiagnostics((prev) => ({
      ...prev,
      streamHzActual: Math.round(streamHzActual * 10) / 10,
      streamHzTarget,
      lastMessageAt: now,
      connectionStatus: connected ? "connected" : "connecting",
    }));
  }, [t, connected]);

  // Track FPS from performance API (measured in MotecPanels or expose from useTelemetry)
  useEffect(() => {
    // FPS measurement via requestAnimationFrame
    let frameCount = 0;
    let lastTime = Date.now();
    let animFrameId: number;

    const measure = () => {
      frameCount++;
      const now = Date.now();
      if (now - lastTime >= 1000) {
        setDiagnostics((prev) => ({
          ...prev,
          clientFps: frameCount,
        }));
        frameCount = 0;
        lastTime = now;
      }
      animFrameId = requestAnimationFrame(measure);
    };

    animFrameId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(animFrameId);
  }, []);

  return diagnostics;
}
