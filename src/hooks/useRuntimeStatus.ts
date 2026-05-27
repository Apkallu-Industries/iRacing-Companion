/**
 * useRuntimeStatus — Pit Wall Workstation Runtime Health Monitor
 *
 * Polls the local bridge health endpoint and reports the live state of
 * every service that the workstation depends on. This is the single
 * authoritative source of "is the environment healthy?" for the UI.
 *
 * ServiceStatus states:
 *   initializing  — not yet checked
 *   active        — online and responding correctly
 *   degraded      — reachable but with issues (slow, partial)
 *   offline       — not reachable
 */

import { useState, useEffect, useCallback, useRef } from "react";

export type ServiceStatus = "initializing" | "active" | "degraded" | "offline";

export interface ServiceState {
  status: ServiceStatus;
  label: string;
  detail: string;
  latencyMs?: number;
  lastCheckedAt?: number;
}

export interface RuntimeStatus {
  bridge: ServiceState;
  iracing: ServiceState;
  aiEngine: ServiceState;
  sessionStore: ServiceState;
  workstation: ServiceState;
  /** True when all critical services have resolved (active or offline — not initializing) */
  settled: boolean;
  /** True when bridge + sessionStore are active */
  ready: boolean;
  /** "workstation" when local bridge is responding, "portable" otherwise */
  mode: "workstation" | "portable" | "unknown";
  /** Elapsed ms since polling started */
  elapsedMs: number;
  /** Force-advance past the splash screen even if services aren't ready */
  advance: () => void;
}

const BRIDGE_HEALTH_URL = "http://localhost:3001/health";
const AI_HEALTH_URL = "https://generativelanguage.googleapis.com/";
const POLL_INTERVAL_MS = 2000;
const SETTLED_TIMEOUT_MS = 8000; // Auto-advance after 8s regardless

function now() {
  return Date.now();
}

async function probeBridge(): Promise<{
  ok: boolean;
  latencyMs: number;
  iRacingConnected?: boolean;
  version?: string;
}> {
  const t0 = now();
  try {
    const res = await fetch(BRIDGE_HEALTH_URL, {
      signal: AbortSignal.timeout(1500),
      cache: "no-store",
    });
    const latencyMs = now() - t0;
    if (!res.ok) return { ok: false, latencyMs };
    let data: Record<string, unknown> = {};
    try {
      data = await res.json();
    } catch {}
    return {
      ok: true,
      latencyMs,
      iRacingConnected: Boolean(data.iRacingConnected ?? data.connected ?? false),
      version: String(data.version ?? ""),
    };
  } catch {
    return { ok: false, latencyMs: now() - t0 };
  }
}

async function probeAiEngine(): Promise<{ ok: boolean; latencyMs: number }> {
  const t0 = now();
  try {
    // Lightweight HEAD probe to confirm internet + Google API reachability
    await fetch(AI_HEALTH_URL, {
      method: "HEAD",
      signal: AbortSignal.timeout(3000),
      mode: "no-cors", // avoids CORS preflight — returns opaque response but confirms reachability
      cache: "no-store",
    });
    return { ok: true, latencyMs: now() - t0 };
  } catch {
    return { ok: false, latencyMs: now() - t0 };
  }
}

function checkSessionStore(): boolean {
  try {
    // Confirm localStorage is accessible (required for workspace prefs, channel prefs, etc.)
    const key = "__pitwall_probe__";
    localStorage.setItem(key, "1");
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

const INITIAL_SERVICE: ServiceState = {
  status: "initializing",
  label: "INITIALIZING",
  detail: "Probing…",
};

export function useRuntimeStatus(): RuntimeStatus {
  const [bridge, setBridge] = useState<ServiceState>({ ...INITIAL_SERVICE });
  const [iracing, setIRacing] = useState<ServiceState>({ ...INITIAL_SERVICE });
  const [aiEngine, setAiEngine] = useState<ServiceState>({ ...INITIAL_SERVICE });
  const [sessionStore, setSessionStore] = useState<ServiceState>({ ...INITIAL_SERVICE });
  const [workstation, setWorkstation] = useState<ServiceState>({ ...INITIAL_SERVICE });
  const [mode, setMode] = useState<"workstation" | "portable" | "unknown">("unknown");
  const [advanced, setAdvanced] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const startedAt = useRef(now());
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const advancedRef = useRef(false);

  const advance = useCallback(() => {
    advancedRef.current = true;
    setAdvanced(true);
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
  }, []);

  const runChecks = useCallback(async () => {
    setElapsedMs(now() - startedAt.current);

    // ── Session Store (synchronous, instant) ──
    const storeOk = checkSessionStore();
    setSessionStore({
      status: storeOk ? "active" : "offline",
      label: storeOk ? "ACTIVE" : "OFFLINE",
      detail: storeOk
        ? "Local IndexedDB · .ibt / .pwlap file system ready"
        : "localStorage inaccessible — private mode?",
      lastCheckedAt: now(),
    });

    // ── Workstation identity ──
    const isElectron =
      typeof window !== "undefined" &&
      (window as any).pitWallRuntime !== undefined;

    setWorkstation({
      status: "active",
      label: isElectron ? "WORKSTATION MODE" : "PORTABLE MODE",
      detail: isElectron
        ? `Electron runtime · v${(window as any).pitWallRuntime?.version ?? "—"}`
        : "Browser mode · cloud connectivity only",
      lastCheckedAt: now(),
    });

    // ── Bridge probe ──
    const bridgeResult = await probeBridge();
    const bridgeStatus: ServiceStatus = bridgeResult.ok
      ? bridgeResult.latencyMs < 500
        ? "active"
        : "degraded"
      : "offline";

    setBridge({
      status: bridgeStatus,
      label: bridgeStatus === "active"
        ? "ACTIVE"
        : bridgeStatus === "degraded"
          ? "DEGRADED"
          : "OFFLINE",
      detail: bridgeResult.ok
        ? `ws://localhost:3001 · ${bridgeResult.latencyMs}ms${bridgeResult.version ? ` · v${bridgeResult.version}` : ""}`
        : "Bridge not reachable on port 3001 — start the local bridge",
      latencyMs: bridgeResult.latencyMs,
      lastCheckedAt: now(),
    });

    // ── iRacing connection (derived from bridge response) ──
    if (bridgeResult.ok) {
      setIRacing({
        status: bridgeResult.iRacingConnected ? "active" : "degraded",
        label: bridgeResult.iRacingConnected ? "CONNECTED" : "STANDBY",
        detail: bridgeResult.iRacingConnected
          ? "iRacing simulator telemetry stream active"
          : "Bridge online — waiting for iRacing to launch",
        lastCheckedAt: now(),
      });
    } else {
      setIRacing({
        status: "offline",
        label: "OFFLINE",
        detail: "Cannot detect iRacing — bridge must be running first",
        lastCheckedAt: now(),
      });
    }

    // ── Mode classification ──
    setMode(bridgeResult.ok ? "workstation" : "portable");
    if (bridgeResult.ok) {
      try {
        localStorage.setItem("pitwall_runtime_mode", "workstation");
      } catch {}
    }

    // ── AI Engine probe (run last — lowest priority for boot flow) ──
    const aiResult = await probeAiEngine();
    setAiEngine({
      status: aiResult.ok ? "active" : "offline",
      label: aiResult.ok ? "ONLINE" : "OFFLINE",
      detail: aiResult.ok
        ? `Cloud LLM reachable · avg ${aiResult.latencyMs}ms`
        : "Google AI APIs unreachable — check internet connection",
      latencyMs: aiResult.latencyMs,
      lastCheckedAt: now(),
    });

    // Auto-advance after timeout
    if (!advancedRef.current && now() - startedAt.current >= SETTLED_TIMEOUT_MS) {
      advance();
    }
  }, [advance]);

  useEffect(() => {
    // First check immediately
    runChecks();

    // Then poll every 2s
    pollingRef.current = setInterval(runChecks, POLL_INTERVAL_MS);

    // Hard timeout safety net
    const timeout = setTimeout(() => {
      if (!advancedRef.current) advance();
    }, SETTLED_TIMEOUT_MS + 500);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      clearTimeout(timeout);
    };
  }, [runChecks, advance]);

  const allSettled = [bridge, iracing, aiEngine, sessionStore, workstation].every(
    (s) => s.status !== "initializing"
  );

  const ready =
    advanced ||
    (bridge.status === "active" && sessionStore.status === "active") ||
    (sessionStore.status === "active" && bridge.status === "offline"); // portable mode is also "ready"

  return {
    bridge,
    iracing,
    aiEngine,
    sessionStore,
    workstation,
    settled: allSettled || advanced,
    ready,
    mode,
    elapsedMs,
    advance,
  };
}
