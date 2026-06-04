import { d as t } from "./react-core-hSJfnumv.js";
const b = "http://localhost:1234",
  M = "http://localhost:11434",
  x = 3e4;
let n = { mode: "cloud", endpoint: null, modelName: null, probing: !1, lastProbeAt: 0 };
const C = new Set();
function A() {
  C.forEach((e) => e({ ...n }));
}
async function z() {
  try {
    let e = await fetch(`${b}/api/v1/models`, {
        signal: AbortSignal.timeout(1200),
        headers: { "Content-Type": "application/json" },
      }),
      s = !0;
    return (
      e.ok ||
        ((e = await fetch(`${b}/v1/models`, {
          signal: AbortSignal.timeout(1200),
          headers: { "Content-Type": "application/json" },
        })),
        (s = !1)),
      e.ok
        ? { ok: !0, model: (await e.json())?.data?.[0]?.id ?? null, isApiV1: s }
        : { ok: !1, model: null }
    );
  } catch {
    return { ok: !1, model: null };
  }
}
async function K() {
  try {
    const e = await fetch(`${M}/api/tags`, { signal: AbortSignal.timeout(1200) });
    return e.ok
      ? { ok: !0, model: (await e.json())?.models?.[0]?.name ?? null }
      : { ok: !1, model: null };
  } catch {
    return { ok: !1, model: null };
  }
}
async function p() {
  if (n.probing) return { ...n };
  ((n = { ...n, probing: !0 }), A());
  try {
    const e = await z();
    if (e.ok)
      return (
        (n = {
          mode: "lmstudio",
          endpoint: e.isApiV1 ? `${b}/api/v1/chat` : `${b}/v1/chat/completions`,
          modelName: e.model,
          probing: !1,
          lastProbeAt: Date.now(),
        }),
        A(),
        { ...n }
      );
    const s = await K();
    return s.ok
      ? ((n = {
          mode: "ollama",
          endpoint: `${M}/v1/chat/completions`,
          modelName: s.model,
          probing: !1,
          lastProbeAt: Date.now(),
        }),
        A(),
        { ...n })
      : ((n = {
          mode: "cloud",
          endpoint: null,
          modelName: null,
          probing: !1,
          lastProbeAt: Date.now(),
        }),
        A(),
        { ...n });
  } catch {
    return ((n = { ...n, probing: !1, lastProbeAt: Date.now() }), A(), { ...n });
  }
}
function oe() {
  const [e, s] = t.useState({ ...n });
  return (
    t.useEffect(() => {
      (C.add(s), Date.now() - n.lastProbeAt > 5e3 && p());
      const c = setInterval(() => {
        p();
      }, x);
      return () => {
        (C.delete(s), clearInterval(c));
      };
    }, []),
    { ...e, refresh: () => p() }
  );
}
function ne(e) {
  switch (e) {
    case "lmstudio":
      return "LM Studio";
    case "ollama":
      return "Ollama";
    case "cloud":
      return "Cloud · Gemini";
  }
}
const Y = "http://localhost:3001/health",
  Z = "http://localhost:3001/api/mongo/status",
  q = "https://generativelanguage.googleapis.com/",
  J = 2e3,
  R = 8e3;
function a() {
  return Date.now();
}
async function Q() {
  const e = a();
  try {
    const s = await fetch(Y, { signal: AbortSignal.timeout(1500), cache: "no-store" }),
      c = a() - e;
    if (!s.ok) return { ok: !1, latencyMs: c };
    let l = {};
    try {
      l = await s.json();
    } catch {}
    return {
      ok: !0,
      latencyMs: c,
      iRacingConnected: !!(l.iRacingConnected ?? !1),
      assettoCorsaConnected: !!(l.assettoCorsaConnected ?? !1),
      activeGame: String(l.activeGame ?? "iracing"),
      version: String(l.version ?? ""),
    };
  } catch {
    return { ok: !1, latencyMs: a() - e };
  }
}
async function X() {
  const e = a();
  try {
    return (
      await fetch(q, {
        method: "HEAD",
        signal: AbortSignal.timeout(3e3),
        mode: "no-cors",
        cache: "no-store",
      }),
      { ok: !0, latencyMs: a() - e }
    );
  } catch {
    return { ok: !1, latencyMs: a() - e };
  }
}
function ee() {
  try {
    const e = "__pitwall_probe__";
    return (localStorage.setItem(e, "1"), localStorage.removeItem(e), !0);
  } catch {
    return !1;
  }
}
async function te() {
  try {
    const e = await fetch(Z, { signal: AbortSignal.timeout(1500), cache: "no-store" });
    return e.ok ? await e.json() : { connected: !1, sampleCount: 0, sessionId: null };
  } catch {
    return { connected: !1, sampleCount: 0, sessionId: null };
  }
}
const r = { status: "initializing", label: "INITIALIZING", detail: "Probing…" };
function se() {
  const [e, s] = t.useState({ ...r }),
    [c, l] = t.useState({ ...r }),
    [E, D] = t.useState({ ...r }),
    [h, N] = t.useState({ ...r }),
    [I, O] = t.useState({ ...r }),
    [T, B] = t.useState({ ...r }),
    [_, $] = t.useState({ ...r, aiMode: "cloud" }),
    [G, F] = t.useState("unknown"),
    [w, P] = t.useState(!1),
    [U, V] = t.useState(0),
    y = t.useRef(a()),
    d = t.useRef(null),
    v = t.useRef(!1),
    m = t.useCallback(() => {
      ((v.current = !0), P(!0), d.current && clearInterval(d.current));
    }, []),
    S = t.useCallback(async () => {
      V(a() - y.current);
      const i = ee();
      N({
        status: i ? "active" : "offline",
        label: i ? "ACTIVE" : "OFFLINE",
        detail: i
          ? "Local IndexedDB · .ibt / .pwlap file system ready"
          : "localStorage inaccessible — private mode?",
        lastCheckedAt: a(),
      });
      const L = typeof window < "u" && window.pitWallRuntime !== void 0;
      O({
        status: "active",
        label: L ? "WORKSTATION MODE" : "PORTABLE MODE",
        detail: L
          ? `Electron runtime · v${window.pitWallRuntime?.version ?? "—"}`
          : "Browser mode · cloud connectivity only",
        lastCheckedAt: a(),
      });
      const o = await Q(),
        k = o.ok ? (o.latencyMs < 500 ? "active" : "degraded") : "offline";
      if (
        (s({
          status: k,
          label: k === "active" ? "ACTIVE" : k === "degraded" ? "DEGRADED" : "OFFLINE",
          detail: o.ok
            ? `ws://localhost:3001 · ${o.latencyMs}ms${o.version ? ` · v${o.version}` : ""}`
            : "Bridge not reachable on port 3001 — start the local bridge",
          latencyMs: o.latencyMs,
          lastCheckedAt: a(),
        }),
        o.ok)
      ) {
        const W = o.activeGame ?? "iracing";
        l(
          W === "assettocorsa"
            ? {
                status: o.assettoCorsaConnected ? "active" : "degraded",
                label: o.assettoCorsaConnected ? "CONNECTED" : "STANDBY",
                detail: o.assettoCorsaConnected
                  ? "Assetto Corsa simulator telemetry stream active"
                  : "Bridge online — waiting for Assetto Corsa to launch",
                lastCheckedAt: a(),
              }
            : {
                status: o.iRacingConnected ? "active" : "degraded",
                label: o.iRacingConnected ? "CONNECTED" : "STANDBY",
                detail: o.iRacingConnected
                  ? "iRacing simulator telemetry stream active"
                  : "Bridge online — waiting for iRacing to launch",
                lastCheckedAt: a(),
              },
        );
      } else
        l({
          status: "offline",
          label: "OFFLINE",
          detail: "Cannot detect simulator — bridge must be running first",
          lastCheckedAt: a(),
        });
      if ((F(o.ok ? "workstation" : "portable"), o.ok))
        try {
          localStorage.setItem("pitwall_runtime_mode", "workstation");
        } catch {}
      const f = await X();
      D({
        status: f.ok ? "active" : "offline",
        label: f.ok ? "ONLINE" : "OFFLINE",
        detail: f.ok
          ? `Cloud LLM reachable · avg ${f.latencyMs}ms`
          : "Google AI APIs unreachable — check internet connection",
        latencyMs: f.latencyMs,
        lastCheckedAt: a(),
      });
      const g = await te();
      B({
        status: g.connected ? "active" : "offline",
        label: g.connected ? "RECORDING" : "OFFLINE",
        detail: g.connected
          ? `mongodb://localhost:27017 · ${g.sampleCount} samples · session ${g.sessionId?.slice(-6) ?? ""}`
          : "MongoDB not connected — telemetry recording disabled",
        lastCheckedAt: a(),
      });
      const u = await p();
      ($({
        status: u.mode !== "cloud" ? "active" : "offline",
        label:
          u.mode !== "cloud" ? (u.mode === "lmstudio" ? "LM STUDIO" : "OLLAMA") : "CLOUD FALLBACK",
        detail:
          u.mode !== "cloud"
            ? `Local inference · ${u.modelName ?? "model detected"}`
            : "No local AI server detected — using cloud Gemini",
        aiMode: u.mode,
        lastCheckedAt: a(),
      }),
        !v.current && a() - y.current >= R && m());
    }, [m]);
  t.useEffect(() => {
    (S(), (d.current = setInterval(S, J)));
    const i = setTimeout(() => {
      v.current || m();
    }, R + 500);
    return () => {
      (d.current && clearInterval(d.current), clearTimeout(i));
    };
  }, [S, m]);
  const j = [e, c, E, h, I].every((i) => i.status !== "initializing"),
    H =
      w ||
      (e.status === "active" && h.status === "active") ||
      (h.status === "active" && e.status === "offline");
  return {
    bridge: e,
    iracing: c,
    aiEngine: E,
    sessionStore: h,
    workstation: I,
    mongoDB: T,
    localAi: _,
    settled: j || w,
    ready: H,
    mode: G,
    elapsedMs: U,
    advance: m,
  };
}
export { se as a, ne as g, oe as u };
