/**
 * Bridge Data Client — Unified interface to the local iRacing bridge.
 *
 * This is the CANONICAL and SINGLE SOURCE OF TRUTH for all telemetry data.
 * All UI components, hooks, and features consume data exclusively through this client.
 *
 * The bridge runs at ws://localhost:3001 (or configurable via query param).
 * It reads from iRacing's Shared Memory API at 30 Hz and broadcasts the telemetry stream.
 */

import type { Telemetry } from "./telemetry-types";

/**
 * Configuration for the bridge connection.
 * Can be overridden via query params (?bridge=ws://custom-ip:3001)
 */
export interface BridgeConfig {
  wsUrl: string;
  maxReconnectAttempts?: number;
  reconnectDelayMs?: number;
}

/**
 * Bridge client lifecycle events.
 */
export type BridgeEvent = {
  type: "connect" | "disconnect" | "error" | "telemetry" | "license";
  data?: unknown;
};

/**
 * Unified Bridge Data Client.
 * Manages a single WebSocket connection to the local iRacing bridge.
 * Exposes telemetry as a stream; consumers should use hooks (useTelemetry, useTelemetryBuffer).
 *
 * @example
 * // Typically used via React hook (useTelemetry), not directly:
 * const telemetry = useTelemetry();
 *
 * // Direct usage is for testing / advanced scenarios:
 * const client = new BridgeDataClient({ wsUrl: 'ws://localhost:3001' });
 * client.onTelemetry((t) => console.log(t));
 * client.connect();
 */
export class BridgeDataClient {
  private wsUrl: string;
  private reconnectDelayMs: number;
  private maxReconnectAttempts: number;
  private ws: WebSocket | null = null;
  private isConnected = false;
  private reconnectCount = 0;
  private listeners: Array<(event: BridgeEvent) => void> = [];
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: BridgeConfig) {
    this.wsUrl = config.wsUrl;
    this.reconnectDelayMs = config.reconnectDelayMs ?? 3000;
    this.maxReconnectAttempts = config.maxReconnectAttempts ?? Infinity;
  }

  /**
   * Connect to the bridge. Auto-reconnects on failure.
   * Returns a cleanup function (call to disconnect).
   */
  connect(): () => void {
    const doConnect = () => {
      if (this.reconnectCount >= this.maxReconnectAttempts) {
        this.emit({
          type: "error",
          data: new Error(
            `Bridge: max reconnect attempts (${this.maxReconnectAttempts}) reached`,
          ),
        });
        return;
      }

      try {
        this.ws = new WebSocket(this.wsUrl);
        this.ws.onopen = () => {
          this.isConnected = true;
          this.reconnectCount = 0;
          this.emit({ type: "connect" });
        };
        this.ws.onmessage = (ev) => {
          try {
                const data = JSON.parse(ev.data);
                // Runtime events forwarded from bridge (analytical warnings, strategy updates)
                if (data && data.type === "runtime_event") {
                  this.emit({ type: "event", data: { event: data.event, payload: data.payload } });
                  return;
                }
                if (data && data.type === "license") {
                  this.emit({ type: "license", data });
                } else {
              // Unpack multi-car namespace envelope if present, else fallback to legacy direct frame
              let normalized = data;
              if (data && typeof data === "object" && "payload" in data && typeof data.payload === "object") {
                normalized = {
                  ...data.payload,
                  __meta: {
                    carId: data.carId,
                    teamId: data.teamId,
                    driverId: data.driverId,
                  },
                };
              }
              this.emit({ type: "telemetry", data: normalized as Partial<Telemetry> });
            }
          } catch (e) {
            this.emit({ type: "error", data: e });
          }
        };
        this.ws.onerror = (err) => {
          this.emit({ type: "error", data: err });
        };
        this.ws.onclose = () => {
          this.isConnected = false;
          this.emit({ type: "disconnect" });
          this.scheduleReconnect(doConnect);
        };
      } catch (e) {
        this.emit({ type: "error", data: e });
        this.scheduleReconnect(doConnect);
      }
    };

    doConnect();
    return () => this.disconnect();
  }

  private scheduleReconnect(fn: () => void) {
    if (this.reconnectCount >= this.maxReconnectAttempts) return;
    this.reconnectCount++;
    this.reconnectTimer = setTimeout(fn, this.reconnectDelayMs);
  }

  /**
   * Disconnect and stop reconnecting.
   */
  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) this.ws.close();
    this.ws = null;
    this.isConnected = false;
    this.reconnectCount = 0;
  }

  /**
   * Send FPS metrics to the bridge (for adaptive streaming).
   */
  reportFps(fps: number) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    try {
      this.ws.send(JSON.stringify({ type: "perf", fps: Math.round(fps) }));
    } catch {}
  }

  /**
   * Subscribe to bridge events.
   */
  on(listener: (event: BridgeEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Subscribe to telemetry updates only.
   */
  onTelemetry(callback: (telemetry: Telemetry) => void): () => void {
    return this.on((event) => {
      if (event.type === "telemetry" && event.data) {
        callback(event.data as Telemetry);
      }
    });
  }

  /**
   * Is the bridge currently connected?
   */
  getConnected(): boolean {
    return this.isConnected;
  }

  private emit(event: BridgeEvent) {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (e) {
        console.error("[BridgeDataClient] listener error:", e);
      }
    }
  }
}

/**
 * Get the bridge URL (respecting query param overrides).
 * Defaults to ws://localhost:3001 or ws://<host>:3001 if on localhost.
 */
export function getBridgeUrl(): string {
  if (typeof window === "undefined") return "ws://localhost:3001";
  const configuredUrl = new URLSearchParams(window.location.search).get("bridge");
  if (configuredUrl) return configuredUrl;
  const host = ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? window.location.hostname
    : "localhost";
  return `ws://${host}:3001`;
}

/**
 * Singleton instance. Import and use via hooks (useTelemetry).
 */
let singletonClient: BridgeDataClient | null = null;

/**
 * Get or create the singleton bridge client.
 * Prefer useTelemetry() hook in React components.
 */
export function getBridgeClient(): BridgeDataClient {
  if (!singletonClient) {
    singletonClient = new BridgeDataClient({ wsUrl: getBridgeUrl() });
  }
  return singletonClient;
}
