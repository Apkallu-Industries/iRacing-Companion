export type BridgePerformanceMode = "stable30" | "balanced60";

export type BridgePerformanceSnapshot = {
  mode: BridgePerformanceMode;
  lastFps: number;
  recommendedMode: BridgePerformanceMode;
  sampledAt: string;
};

const MODE_KEY = "pitwall.bridge.performance.mode";
const SNAPSHOT_KEY = "pitwall.bridge.performance.snapshot";

export function getBridgePerformanceMode(): BridgePerformanceMode {
  if (typeof window === "undefined") return "balanced60";
  const raw = window.localStorage.getItem(MODE_KEY);
  return raw === "stable30" ? "stable30" : "balanced60";
}

export function setBridgePerformanceMode(mode: BridgePerformanceMode) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MODE_KEY, mode);
}

export function recommendModeFromFps(fps: number): BridgePerformanceMode {
  return fps < 50 ? "stable30" : "balanced60";
}

export function saveBridgePerformanceSnapshot(fps: number) {
  if (typeof window === "undefined") return;
  const mode = getBridgePerformanceMode();
  const payload: BridgePerformanceSnapshot = {
    mode,
    lastFps: Math.round(fps),
    recommendedMode: recommendModeFromFps(fps),
    sampledAt: new Date().toISOString(),
  };
  window.localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(payload));
}

export function getBridgePerformanceSnapshot(): BridgePerformanceSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SNAPSHOT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as BridgePerformanceSnapshot;
    if (!parsed || typeof parsed.lastFps !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}
