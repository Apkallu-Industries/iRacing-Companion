import { useWorkbench } from "./store";
import { advisorCall } from "./advisor.functions";
import { analyzeTelemetry, liveCoach } from "./coach.functions";
import { ADVISOR_SCHEMA, getAdvisorSystemPrompt, buildAdvisorUserMessage } from "./advisor.prompts";
import { COACH_SCHEMA_CONCISE, COACH_SCHEMA_DETAILED, COACH_SYSTEM_PROMPT, buildCoachUserMessage, LIVE_COACH_SCHEMA, LIVE_COACH_SYSTEM, buildLiveCoachUserMessage } from "./coach.prompts";

/**
 * Executes a Local LLM call using the OpenAI /v1/chat/completions format.
 * This is compatible with LMStudio, Ollama, LlamaEdge/Lemonade, and HuggingFace TGI.
 */
export function resolveLLMUrl(baseUrl: string): string {
  let url = baseUrl.trim().replace(/\/$/, "");
  if (!url) return "http://localhost:1234/v1/chat/completions";
  
  // If the user already pasted the full endpoint, just use it
  if (url.endsWith("/chat/completions") || url.endsWith("/chat")) {
    return url;
  }
  
  // If they provided a base URL without /v1 or /api/v1 namespace, append /v1
  if (!url.includes("/v1") && !url.includes("/api/v1")) {
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
      { role: "user", content: user }
    ],
    temperature: 0.2,
    tools: [{ type: "function", function: schema }],
    tool_choice: { type: "function", function: { name: schema.name } }
  };

  const resp = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
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
  const { llmProvider } = useWorkbench.getState();
  
  if (llmProvider === "cloud") {
    return advisorCall({ data });
  }

  try {
    const system = getAdvisorSystemPrompt(data);
    const user = buildAdvisorUserMessage(data);
    const resultObj = await callLocalOpenAI(system, user, ADVISOR_SCHEMA);
    
    // The component expects { result: { mode, headline, summary, tips... } }
    if (!resultObj.tips || !Array.isArray(resultObj.tips)) {
      throw new Error("Invalid format from local LLM");
    }
    
    return {
      result: { mode: data.mode, ...resultObj },
      fallback: "local-llm"
    };
  } catch (err) {
    console.error("[Local LLM] Advisor failure:", err);
    // Returning error will show up in the UI
    return { error: err instanceof Error ? err.message : "Local LLM failed to respond correctly." };
  }
}

/** Wrapper for Coach analysis calls */
export async function dispatchAnalyzeTelemetry(data: { payload: any; detailed: boolean }): Promise<any> {
  const { llmProvider } = useWorkbench.getState();
  
  if (llmProvider === "cloud") {
    return analyzeTelemetry({ data });
  }

  try {
    const schema = data.detailed ? COACH_SCHEMA_DETAILED : COACH_SCHEMA_CONCISE;
    const user = buildCoachUserMessage(data.detailed, data.payload);
    
    const resultObj = await callLocalOpenAI(COACH_SYSTEM_PROMPT, user, schema);
    
    if (data.detailed && !Array.isArray(resultObj.corners)) throw new Error("Missing corners from local LLM");
    if (!data.detailed && !Array.isArray(resultObj.tips)) throw new Error("Missing tips from local LLM");

    return {
      result: resultObj,
      detailed: data.detailed,
      fallback: "local-llm"
    };
  } catch (err) {
    console.error("[Local LLM] Coach failure:", err);
    return { error: err instanceof Error ? err.message : "Local LLM failed to analyze telemetry." };
  }
}

/** Wrapper for Live Coach radio calls */
export async function dispatchLiveCoach(data: any): Promise<any> {
  const { llmProvider } = useWorkbench.getState();
  
  if (llmProvider === "cloud") {
    return liveCoach({ data }); // Cloud fallback via Lovable
  }

  try {
    const user = buildLiveCoachUserMessage(data);
    const resultObj = await callLocalOpenAI(LIVE_COACH_SYSTEM, user, LIVE_COACH_SCHEMA);
    
    // Force tone to match the rules layer (model can drift).
    resultObj.tone = data.summary?.tone || resultObj.tone;
    return { call: resultObj };
  } catch (err) {
    console.error("[Local LLM] Live Coach failure:", err);
    return { error: "Local model failed" };
  }
}

export async function testLLMConnection(baseUrl: string, modelId: string, apiKey?: string): Promise<{ success: boolean; message: string }> {
  try {
    const url = resolveLLMUrl(baseUrl);
    const payload = {
      model: modelId || "local-model",
      messages: [
        { role: "user", content: "Respond with exactly the word: 'Connected'." }
      ],
      max_tokens: 5,
      temperature: 0
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
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!resp.ok) {
      return { 
        success: false, 
        message: `HTTP Error ${resp.status}: ${resp.statusText}. Checked url: ${url}. Make sure CORS is enabled and the URL is correct.` 
      };
    }

    const data = await resp.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    
    if (reply) {
      return {
        success: true,
        message: `Connected successfully! Model replied: "${reply}"`
      };
    } else {
      return {
        success: true,
        message: "Connected to endpoint, but received an empty response content."
      };
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return {
        success: false,
        message: "Connection timed out after 10 seconds. Check if the model is currently loading or if the server is frozen."
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
      message: errorMsg
    };
  }
}
