import { useState, useEffect, useRef, useCallback } from "react";
const LMSTUDIO_BASE = "http://localhost:1234";
const OLLAMA_BASE = "http://localhost:11434";
const PROBE_INTERVAL_MS = 3e4;
let state = {
  mode: "cloud",
  endpoint: null,
  modelName: null,
  probing: false,
  lastProbeAt: 0,
};
const listeners = /* @__PURE__ */ new Set();
function notify() {
  listeners.forEach((cb) => cb({ ...state }));
}
async function probeLmStudio() {
  try {
    let res = await fetch(`${LMSTUDIO_BASE}/api/v1/models`, {
      signal: AbortSignal.timeout(1200),
      headers: { "Content-Type": "application/json" },
    });
    let isApiV1 = true;
    if (!res.ok) {
      res = await fetch(`${LMSTUDIO_BASE}/v1/models`, {
        signal: AbortSignal.timeout(1200),
        headers: { "Content-Type": "application/json" },
      });
      isApiV1 = false;
    }
    if (!res.ok) return { ok: false, model: null };
    const data = await res.json();
    const model = data?.data?.[0]?.id ?? null;
    return { ok: true, model, isApiV1 };
  } catch {
    return { ok: false, model: null };
  }
}
async function probeOllama() {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, {
      signal: AbortSignal.timeout(1200),
    });
    if (!res.ok) return { ok: false, model: null };
    const data = await res.json();
    const model = data?.models?.[0]?.name ?? null;
    return { ok: true, model };
  } catch {
    return { ok: false, model: null };
  }
}
async function probeLocalAi() {
  if (state.probing) return { ...state };
  state = { ...state, probing: true };
  notify();
  try {
    const lmResult = await probeLmStudio();
    if (lmResult.ok) {
      state = {
        mode: "lmstudio",
        endpoint: lmResult.isApiV1
          ? `${LMSTUDIO_BASE}/api/v1/chat`
          : `${LMSTUDIO_BASE}/v1/chat/completions`,
        modelName: lmResult.model,
        probing: false,
        lastProbeAt: Date.now(),
      };
      notify();
      return { ...state };
    }
    const ollamaResult = await probeOllama();
    if (ollamaResult.ok) {
      state = {
        mode: "ollama",
        endpoint: `${OLLAMA_BASE}/v1/chat/completions`,
        modelName: ollamaResult.model,
        probing: false,
        lastProbeAt: Date.now(),
      };
      notify();
      return { ...state };
    }
    state = {
      mode: "cloud",
      endpoint: null,
      modelName: null,
      probing: false,
      lastProbeAt: Date.now(),
    };
    notify();
    return { ...state };
  } catch {
    state = { ...state, probing: false, lastProbeAt: Date.now() };
    notify();
    return { ...state };
  }
}
function useLocalAiRouter() {
  const [s, setS] = useState({ ...state });
  useEffect(() => {
    listeners.add(setS);
    if (Date.now() - state.lastProbeAt > 5e3) {
      probeLocalAi();
    }
    const interval = setInterval(() => {
      probeLocalAi();
    }, PROBE_INTERVAL_MS);
    return () => {
      listeners.delete(setS);
      clearInterval(interval);
    };
  }, []);
  return { ...s, refresh: () => probeLocalAi() };
}
function getAiModeLabel(mode) {
  switch (mode) {
    case "lmstudio":
      return "LM Studio";
    case "ollama":
      return "Ollama";
    case "cloud":
      return "Cloud · Gemini";
  }
}
const BRIDGE_HEALTH_URL = "http://localhost:3001/health";
const BRIDGE_MONGO_URL = "http://localhost:3001/api/mongo/status";
const AI_HEALTH_URL = "https://generativelanguage.googleapis.com/";
const POLL_INTERVAL_MS = 2e3;
const SETTLED_TIMEOUT_MS = 8e3;
function now() {
  return Date.now();
}
async function probeBridge() {
  const t0 = now();
  try {
    const res = await fetch(BRIDGE_HEALTH_URL, {
      signal: AbortSignal.timeout(1500),
      cache: "no-store",
    });
    const latencyMs = now() - t0;
    if (!res.ok) return { ok: false, latencyMs };
    let data = {};
    try {
      data = await res.json();
    } catch {}
    return {
      ok: true,
      latencyMs,
      iRacingConnected: Boolean(data.iRacingConnected ?? false),
      assettoCorsaConnected: Boolean(data.assettoCorsaConnected ?? false),
      activeGame: String(data.activeGame ?? "iracing"),
      version: String(data.version ?? ""),
    };
  } catch {
    return { ok: false, latencyMs: now() - t0 };
  }
}
async function probeAiEngine() {
  const t0 = now();
  try {
    await fetch(AI_HEALTH_URL, {
      method: "HEAD",
      signal: AbortSignal.timeout(3e3),
      mode: "no-cors",
      // avoids CORS preflight — returns opaque response but confirms reachability
      cache: "no-store",
    });
    return { ok: true, latencyMs: now() - t0 };
  } catch {
    return { ok: false, latencyMs: now() - t0 };
  }
}
function checkSessionStore() {
  try {
    const key = "__pitwall_probe__";
    localStorage.setItem(key, "1");
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
async function probeMongoDB() {
  try {
    const res = await fetch(BRIDGE_MONGO_URL, {
      signal: AbortSignal.timeout(1500),
      cache: "no-store",
    });
    if (!res.ok) return { connected: false, sampleCount: 0, sessionId: null };
    const data = await res.json();
    return data;
  } catch {
    return { connected: false, sampleCount: 0, sessionId: null };
  }
}
const INITIAL_SERVICE = {
  status: "initializing",
  label: "INITIALIZING",
  detail: "Probing…",
};
function useRuntimeStatus() {
  const [bridge, setBridge] = useState({ ...INITIAL_SERVICE });
  const [iracing, setIRacing] = useState({ ...INITIAL_SERVICE });
  const [aiEngine, setAiEngine] = useState({ ...INITIAL_SERVICE });
  const [sessionStore, setSessionStore] = useState({ ...INITIAL_SERVICE });
  const [workstation, setWorkstation] = useState({ ...INITIAL_SERVICE });
  const [mongoDB, setMongoDB] = useState({ ...INITIAL_SERVICE });
  const [localAi, setLocalAi] = useState({ ...INITIAL_SERVICE, aiMode: "cloud" });
  const [mode, setMode] = useState("unknown");
  const [advanced, setAdvanced] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startedAt = useRef(now());
  const pollingRef = useRef(null);
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
    const storeOk = checkSessionStore();
    setSessionStore({
      status: storeOk ? "active" : "offline",
      label: storeOk ? "ACTIVE" : "OFFLINE",
      detail: storeOk
        ? "Local IndexedDB · .ibt / .pwlap file system ready"
        : "localStorage inaccessible — private mode?",
      lastCheckedAt: now(),
    });
    const isElectron = typeof window !== "undefined" && window.pitWallRuntime !== void 0;
    setWorkstation({
      status: "active",
      label: isElectron ? "WORKSTATION MODE" : "PORTABLE MODE",
      detail: isElectron
        ? `Electron runtime · v${window.pitWallRuntime?.version ?? "—"}`
        : "Browser mode · cloud connectivity only",
      lastCheckedAt: now(),
    });
    const bridgeResult = await probeBridge();
    const bridgeStatus = bridgeResult.ok
      ? bridgeResult.latencyMs < 500
        ? "active"
        : "degraded"
      : "offline";
    setBridge({
      status: bridgeStatus,
      label:
        bridgeStatus === "active" ? "ACTIVE" : bridgeStatus === "degraded" ? "DEGRADED" : "OFFLINE",
      detail: bridgeResult.ok
        ? `ws://localhost:3001 · ${bridgeResult.latencyMs}ms${bridgeResult.version ? ` · v${bridgeResult.version}` : ""}`
        : "Bridge not reachable on port 3001 — start the local bridge",
      latencyMs: bridgeResult.latencyMs,
      lastCheckedAt: now(),
    });
    if (bridgeResult.ok) {
      const activeGame = bridgeResult.activeGame ?? "iracing";
      if (activeGame === "assettocorsa") {
        setIRacing({
          status: bridgeResult.assettoCorsaConnected ? "active" : "degraded",
          label: bridgeResult.assettoCorsaConnected ? "CONNECTED" : "STANDBY",
          detail: bridgeResult.assettoCorsaConnected
            ? "Assetto Corsa simulator telemetry stream active"
            : "Bridge online — waiting for Assetto Corsa to launch",
          lastCheckedAt: now(),
        });
      } else {
        setIRacing({
          status: bridgeResult.iRacingConnected ? "active" : "degraded",
          label: bridgeResult.iRacingConnected ? "CONNECTED" : "STANDBY",
          detail: bridgeResult.iRacingConnected
            ? "iRacing simulator telemetry stream active"
            : "Bridge online — waiting for iRacing to launch",
          lastCheckedAt: now(),
        });
      }
    } else {
      setIRacing({
        status: "offline",
        label: "OFFLINE",
        detail: "Cannot detect simulator — bridge must be running first",
        lastCheckedAt: now(),
      });
    }
    setMode(bridgeResult.ok ? "workstation" : "portable");
    if (bridgeResult.ok) {
      try {
        localStorage.setItem("pitwall_runtime_mode", "workstation");
      } catch {}
    }
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
    const mongoResult = await probeMongoDB();
    setMongoDB({
      status: mongoResult.connected ? "active" : "offline",
      label: mongoResult.connected ? "RECORDING" : "OFFLINE",
      detail: mongoResult.connected
        ? `mongodb://localhost:27017 · ${mongoResult.sampleCount} samples · session ${mongoResult.sessionId?.slice(-6) ?? ""}`
        : "MongoDB not connected — telemetry recording disabled",
      lastCheckedAt: now(),
    });
    const aiRouterState = await probeLocalAi();
    setLocalAi({
      status: aiRouterState.mode !== "cloud" ? "active" : "offline",
      label:
        aiRouterState.mode !== "cloud"
          ? aiRouterState.mode === "lmstudio"
            ? "LM STUDIO"
            : "OLLAMA"
          : "CLOUD FALLBACK",
      detail:
        aiRouterState.mode !== "cloud"
          ? `Local inference · ${aiRouterState.modelName ?? "model detected"}`
          : "No local AI server detected — using cloud Gemini",
      aiMode: aiRouterState.mode,
      lastCheckedAt: now(),
    });
    if (!advancedRef.current && now() - startedAt.current >= SETTLED_TIMEOUT_MS) {
      advance();
    }
  }, [advance]);
  useEffect(() => {
    runChecks();
    pollingRef.current = setInterval(runChecks, POLL_INTERVAL_MS);
    const timeout = setTimeout(() => {
      if (!advancedRef.current) advance();
    }, SETTLED_TIMEOUT_MS + 500);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      clearTimeout(timeout);
    };
  }, [runChecks, advance]);
  const allSettled = [bridge, iracing, aiEngine, sessionStore, workstation].every(
    (s) => s.status !== "initializing",
  );
  const ready =
    advanced ||
    (bridge.status === "active" && sessionStore.status === "active") ||
    (sessionStore.status === "active" && bridge.status === "offline");
  return {
    bridge,
    iracing,
    aiEngine,
    sessionStore,
    workstation,
    mongoDB,
    localAi,
    settled: allSettled || advanced,
    ready,
    mode,
    elapsedMs,
    advance,
  };
}
export { useRuntimeStatus as a, getAiModeLabel as g, useLocalAiRouter as u };
