/**
 * Local AI Router — Pit Wall Workstation
 *
 * Routes AI inference requests to the best available backend:
 *   1. LM Studio   → http://localhost:1234/v1/chat/completions
 *   2. Ollama      → http://localhost:11434/v1/chat/completions
 *   3. Cloud Gemini → existing cloud endpoint (fallback)
 *
 * Both LM Studio and Ollama implement the OpenAI-compatible chat completions
 * API, so the same HTTP call pattern works for both local backends.
 *
 * The router re-probes every 30 seconds so the UI updates automatically
 * when engineers start or stop their local model server.
 */

export type AiMode = "lmstudio" | "ollama" | "cloud";

export interface AiRouterState {
  mode: AiMode;
  endpoint: string | null;
  modelName: string | null;
  probing: boolean;
  lastProbeAt: number;
}

const LMSTUDIO_BASE = "http://localhost:1234";
const OLLAMA_BASE   = "http://localhost:11434";
const PROBE_INTERVAL_MS = 30_000;

// ─── Singleton state ──────────────────────────────────────────────────────────

let state: AiRouterState = {
  mode:        "cloud",
  endpoint:    null,
  modelName:   null,
  probing:     false,
  lastProbeAt: 0,
};

const listeners = new Set<(s: AiRouterState) => void>();

function notify() {
  listeners.forEach((cb) => cb({ ...state }));
}

// ─── Probe functions ──────────────────────────────────────────────────────────

async function probeLmStudio(): Promise<{ ok: boolean; model: string | null; isApiV1?: boolean }> {
  try {
    // 1. Try new v0.4.0+ /api/v1/models first
    let res = await fetch(`${LMSTUDIO_BASE}/api/v1/models`, {
      signal: AbortSignal.timeout(1200),
      headers: { "Content-Type": "application/json" },
    });
    let isApiV1 = true;

    // 2. Fall back to older /v1/models if 404/failure
    if (!res.ok) {
      res = await fetch(`${LMSTUDIO_BASE}/v1/models`, {
        signal: AbortSignal.timeout(1200),
        headers: { "Content-Type": "application/json" },
      });
      isApiV1 = false;
    }

    if (!res.ok) return { ok: false, model: null };
    const data = await res.json() as { data?: { id: string }[] };
    const model = data?.data?.[0]?.id ?? null;
    return { ok: true, model, isApiV1 };
  } catch {
    return { ok: false, model: null };
  }
}

async function probeOllama(): Promise<{ ok: boolean; model: string | null }> {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, {
      signal: AbortSignal.timeout(1200),
    });
    if (!res.ok) return { ok: false, model: null };
    const data = await res.json() as { models?: { name: string }[] };
    const model = data?.models?.[0]?.name ?? null;
    return { ok: true, model };
  } catch {
    return { ok: false, model: null };
  }
}

// ─── Core probe ──────────────────────────────────────────────────────────────

export async function probeLocalAi(): Promise<AiRouterState> {
  if (state.probing) return { ...state };
  state = { ...state, probing: true };
  notify();

  try {
    // LM Studio first
    const lmResult = await probeLmStudio();
    if (lmResult.ok) {
      state = {
        mode:        "lmstudio",
        endpoint:    lmResult.isApiV1
          ? `${LMSTUDIO_BASE}/api/v1/chat`
          : `${LMSTUDIO_BASE}/v1/chat/completions`,
        modelName:   lmResult.model,
        probing:     false,
        lastProbeAt: Date.now(),
      };
      notify();
      return { ...state };
    }

    // Ollama second
    const ollamaResult = await probeOllama();
    if (ollamaResult.ok) {
      state = {
        mode:        "ollama",
        endpoint:    `${OLLAMA_BASE}/v1/chat/completions`,
        modelName:   ollamaResult.model,
        probing:     false,
        lastProbeAt: Date.now(),
      };
      notify();
      return { ...state };
    }

    // Cloud fallback
    state = {
      mode:        "cloud",
      endpoint:    null,
      modelName:   null,
      probing:     false,
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

// ─── Completion function ──────────────────────────────────────────────────────

export interface CompletionOptions {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

/**
 * Complete a prompt using the best available AI backend.
 * Falls back to cloud if local inference is unavailable.
 * For cloud inference, returns null and the caller should use the existing
 * Gemini/dispatchAnalyzeTelemetry pipeline.
 */
export async function completeLocal(
  prompt: string,
  options: CompletionOptions = {}
): Promise<string | null> {
  const { mode, endpoint } = state;
  if (mode === "cloud" || !endpoint) return null; // caller handles cloud

  try {
    const body = {
      model:       state.modelName ?? "default",
      messages: [
        ...(options.systemPrompt
          ? [{ role: "system", content: options.systemPrompt }]
          : []),
        { role: "user", content: prompt },
      ],
      max_tokens:  options.maxTokens  ?? 512,
      temperature: options.temperature ?? 0.2,
      stream:      false,
    };

    const res = await fetch(endpoint, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
      signal:  AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      console.warn(`[localAi] ${mode} returned ${res.status} — falling back to cloud`);
      return null;
    }

    const data = await res.json() as {
      choices?: { message?: { content?: string } }[];
    };
    return data?.choices?.[0]?.message?.content ?? null;

  } catch (err) {
    console.warn(`[localAi] ${mode} request failed:`, err);
    return null;
  }
}

// ─── React hook ──────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

export function useLocalAiRouter(): AiRouterState & { refresh: () => void } {
  const [s, setS] = useState<AiRouterState>({ ...state });

  useEffect(() => {
    // Subscribe to state updates
    listeners.add(setS);

    // Initial probe
    if (Date.now() - state.lastProbeAt > 5000) {
      probeLocalAi();
    }

    // Periodic re-probe
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

// ─── Singleton accessors ──────────────────────────────────────────────────────

export function getAiRouterState(): AiRouterState {
  return { ...state };
}

export function getAiModeLabel(mode: AiMode): string {
  switch (mode) {
    case "lmstudio": return "LM Studio";
    case "ollama":   return "Ollama";
    case "cloud":    return "Cloud · Gemini";
  }
}
