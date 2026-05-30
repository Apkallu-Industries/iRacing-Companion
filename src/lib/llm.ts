import { useWorkbench } from "./store";
import { WORKSPACES } from "./workspaces";
import { localAdvisorFallback } from "./advisor.functions";
import { localCoachFallbackConcise, localLiveCoachFallback } from "./coach.functions";
import { strategyCopilotStub, type StrategyCallResult } from "./strategy.functions";
import {
  STRATEGY_SCHEMA,
  STRATEGY_SYSTEM_PROMPT,
  buildStrategyUserMessage,
} from "./strategy.prompts";
import { ADVISOR_SCHEMA, getAdvisorSystemPrompt, buildAdvisorUserMessage } from "./advisor.prompts";
import {
  COACH_SCHEMA_CONCISE,
  COACH_SCHEMA_DETAILED,
  COACH_SYSTEM_PROMPT,
  buildCoachUserMessage,
  LIVE_COACH_SCHEMA,
  LIVE_COACH_SYSTEM,
  buildLiveCoachUserMessage,
} from "./coach.prompts";

/**
 * Builds a compact workspace context string for injection into AI system prompts.
 * Tells the model which workspace tier is active and which derived math channels exist.
 */
function buildWorkspaceContext(): string {
  const { activeWorkspace, mathExpressions } = useWorkbench.getState();
  const ws = WORKSPACES[activeWorkspace];
  if (!ws) return "";

  const enabledMath = mathExpressions
    .filter((m) => m.enabled)
    .map((m) => `${m.name} (${m.unit}): ${m.expression}`)
    .join("\n  - ");

  return [
    `\n\n--- ACTIVE WORKSPACE CONTEXT ---`,
    `Workspace Tier: ${ws.name} (${ws.tier})`,
    `Default Channels: ${ws.defaultChannels.join(", ")}`,
    enabledMath
      ? `Enabled Math Channels (derived, pre-computed per sample):\n  - ${enabledMath}`
      : `No additional math channels active.`,
    `--- END WORKSPACE CONTEXT ---`,
  ].join("\n");
}


/**
 * Executes a Local LLM call using the OpenAI /v1/chat/completions format.
 * This is compatible with LMStudio, Ollama, LlamaEdge/Lemonade, and HuggingFace TGI.
 */
export function resolveLLMUrl(baseUrl: string): string {
  let url = baseUrl.trim().replace(/\/$/, "");
  if (!url) return "http://localhost:1234/api/v1/chat";

  // If the user already pasted a full endpoint, just use it
  if (
    url.endsWith("/chat/completions") ||
    url.endsWith("/chat") ||
    url.endsWith("/v1/chat")
  ) {
    return url;
  }

  // Handle LM Studio v0.4+ /api/v1/chat completions endpoint
  if (url.includes("/api")) {
    if (!url.includes("/v1")) {
      url = `${url}/v1`;
    }
    return `${url}/chat`;
  }

  // Handle Ollama and standard /v1/chat/completions endpoints
  if (!url.includes("/v1")) {
    url = `${url}/v1`;
  }

  return `${url}/chat/completions`;
}

async function callLocalOpenAI(system: string, user: string, schema: any): Promise<any> {
  const { llmBaseUrl, llmModelId, llmApiKey } = useWorkbench.getState();
  const url = resolveLLMUrl(llmBaseUrl);

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (llmApiKey) {
    headers["Authorization"] = `Bearer ${llmApiKey}`;
  }

  const payload = {
    model: llmModelId || "local-model",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.2,
    tools: [{ type: "function", function: schema }],
    tool_choice: { type: "function", function: { name: schema.name } },
  };

  const resp = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    throw new Error(`Local LLM Error: ${resp.status} ${resp.statusText}`);
  }

  const json = await resp.json();
  const argsStr = json?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;

  if (!argsStr) {
    // Some local models might fail to use tool_calls and just return JSON string in content
    const content = json?.choices?.[0]?.message?.content;
    if (content) {
      // attempt to parse if it's pure JSON
      const innerMatch = content.match(/{.*}/s);
      if (innerMatch) {
        return JSON.parse(innerMatch[0]);
      }
    }
    throw new Error("Local LLM did not return the expected tool call arguments.");
  }

  return JSON.parse(argsStr);
}

/** Wrapper for Advisor calls that checks if we should route to Local LLM or Cloud */
export async function dispatchAdvisorCall(data: any): Promise<any> {
  const wsCtx = buildWorkspaceContext();

  try {
    const system = getAdvisorSystemPrompt(data) + wsCtx;
    const user = buildAdvisorUserMessage({ ...data, wsCtx });
    const resultObj = await callLocalOpenAI(system, user, ADVISOR_SCHEMA);

    if (!resultObj.tips || !Array.isArray(resultObj.tips)) {
      throw new Error("Invalid format from local LLM");
    }

    return {
      result: { mode: data.mode, ...resultObj },
      fallback: "local-llm",
    };
  } catch (err) {
    console.error("[Local LLM] Advisor failure:", err);
    return { result: localAdvisorFallback(data), fallback: "local" };
  }
}

/** Wrapper for Coach analysis calls */
export async function dispatchAnalyzeTelemetry(data: {
  payload: any;
  detailed: boolean;
}): Promise<any> {
  const wsCtx = buildWorkspaceContext();

  try {
    const schema = data.detailed ? COACH_SCHEMA_DETAILED : COACH_SCHEMA_CONCISE;
    const user = buildCoachUserMessage(data.detailed, data.payload);

    const resultObj = await callLocalOpenAI(COACH_SYSTEM_PROMPT + wsCtx, user, schema);

    if (data.detailed && !Array.isArray(resultObj.corners))
      throw new Error("Missing corners from local LLM");
    if (!data.detailed && !Array.isArray(resultObj.tips))
      throw new Error("Missing tips from local LLM");

    return {
      result: resultObj,
      detailed: data.detailed,
      fallback: "local-llm",
    };
  } catch (err) {
    console.error("[Local LLM] Coach failure:", err);
    return {
      result: localCoachFallbackConcise(data.payload, data.detailed),
      detailed: data.detailed,
      fallback: "local",
    };
  }
}

/** Wrapper for Live Coach radio calls */
export async function dispatchLiveCoach(data: any): Promise<any> {
  const { llmProvider } = useWorkbench.getState();
  const wsCtx = buildWorkspaceContext();

  // Enrich context with any available bridge extras (non-zero values only)
  const extrasCtx = data.context?.extras;
  const enrichedContext = {
    ...data.context,
    ...(extrasCtx && extrasCtx.peakYawRateRads > 0
      ? {
          extras: {
            peakYawRateRads: extrasCtx.peakYawRateRads,
            peakShockFL: extrasCtx.peakShockFL,
            maxBrakeLinePressTotal: extrasCtx.maxBrakeLinePressTotal,
          },
        }
      : {}),
  };
  const enrichedData = { ...data, context: enrichedContext };

  try {
    const user = buildLiveCoachUserMessage(enrichedData);
    const resultObj = await callLocalOpenAI(LIVE_COACH_SYSTEM + wsCtx, user, LIVE_COACH_SCHEMA);

    // Force tone to match the rules layer (model can drift).
    resultObj.tone = data.summary?.tone || resultObj.tone;
    return { call: resultObj };
  } catch (err) {
    console.error("[Local LLM] Live Coach failure:", err);
    return { call: localLiveCoachFallback(data.summary), fallback: "net" };
  }
}

export async function testLLMConnection(
  baseUrl: string,
  modelId: string,
  apiKey?: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const url = resolveLLMUrl(baseUrl);
    const payload = {
      model: modelId || "local-model",
      messages: [{ role: "user", content: "Respond with exactly the word: 'Connected'." }],
      max_tokens: 5,
      temperature: 0,
    };

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const resp = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!resp.ok) {
      return {
        success: false,
        message: `HTTP Error ${resp.status}: ${resp.statusText}. Checked url: ${url}. Make sure CORS is enabled and the URL is correct.`,
      };
    }

    const data = await resp.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (reply) {
      return {
        success: true,
        message: `Connected successfully! Model replied: "${reply}"`,
      };
    } else {
      return {
        success: true,
        message: "Connected to endpoint, but received an empty response content.",
      };
    }
  } catch (err: any) {
    if (err.name === "AbortError") {
      return {
        success: false,
        message:
          "Connection timed out after 10 seconds. Check if the model is currently loading or if the server is frozen.",
      };
    }

    let errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes("Failed to fetch") || errorMsg.includes("NetworkError")) {
      errorMsg = `Connection failed. Make sure:
1. The local LLM server at "${baseUrl}" is running.
2. CORS is enabled (e.g. OLLAMA_ORIGINS="*" for Ollama, or --cors parameter for other systems).
3. Your firewall isn't blocking the connection.`;
    }
    return {
      success: false,
      message: errorMsg,
    };
  }
}

/** Wrapper for Live Strategy calls */
export async function dispatchStrategyCopilot(
  data: any,
): Promise<{ call?: StrategyCallResult; error?: string }> {
  try {
    const user = buildStrategyUserMessage(data.player, data.competitors);
    const resultObj = await callLocalOpenAI(STRATEGY_SYSTEM_PROMPT, user, STRATEGY_SCHEMA);
    return { call: resultObj as StrategyCallResult };
  } catch (err: any) {
    console.error("[Local LLM] Live Strategy failure:", err);
    return { error: err.message };
  }
}
