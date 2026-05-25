import React, { useState } from "react";
import { Telemetry } from "@/lib/telemetry-types";
import { Bot, Wrench, Wind, Thermometer, CloudRain } from "lucide-react";
import { useWorkbench } from "@/lib/store";
import { resolveLLMUrl } from "@/lib/llm";

export function SetupCopilot({ t }: { t: Telemetry }) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const askSetupEngineer = async () => {
    setLoading(true);
    setResponse("");
    try {
      // Build the prompt from telemetry
      const trackState = t.trackWetness > 0.5 ? "wet" : t.trackWetness > 0.1 ? "damp" : "dry";
      const prompt = `You are an expert, professional race engineer in motorsports. 
The driver is currently driving the ${t.car} at ${t.track}.
Here is the current environmental data:
- Live Air Temperature: ${t.liveAirTempC.toFixed(1)}°C
- Live Track Temperature: ${t.liveTrackTempC.toFixed(1)}°C
- Air Density: ${t.airDensity.toFixed(2)} kg/m³
- Wind Speed: ${t.windVel.toFixed(1)} m/s (Direction: ${t.windDir.toFixed(2)} rad)
- Track State: ${trackState}

Based on this specific car, track, and environmental conditions, what setup adjustments should the driver make? Consider aerodynamics, tire pressures, brake ducts, and gearing. Be concise but specific.`;

      // Fetch dynamic LLM configurations from store
      const { llmBaseUrl, llmModelId, llmApiKey } = useWorkbench.getState();
      const url = resolveLLMUrl(llmBaseUrl);

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (llmApiKey) {
        headers["Authorization"] = `Bearer ${llmApiKey}`;
      }

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: llmModelId || "local-model",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          stream: true,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to connect to local LLM (${res.status} ${res.statusText}).`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((l) => l.trim() !== "");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace("data: ", "");
              if (dataStr === "[DONE]") return;
              try {
                const data = JSON.parse(dataStr);
                const token = data.choices?.[0]?.delta?.content;
                if (token) {
                  setResponse((prev) => (prev || "") + token);
                }
              } catch (e) {
                // Ignore parse errors on incomplete chunks
              }
            }
          }
        }
      }
    } catch (e: any) {
      const { llmBaseUrl } = useWorkbench.getState();
      setResponse(
        "Error asking Setup Copilot: " +
          e.message +
          `\n\nMake sure your local LLM server is running at "${llmBaseUrl}" and CORS is enabled (e.g. OLLAMA_ORIGINS="*" for Ollama, or --cors parameter for other systems).`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900/60 backdrop-blur-md rounded-xl p-4 border border-zinc-800 shadow-2xl mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Wrench className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">AI Setup Engineer</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50 flex flex-col">
          <span className="text-xs text-zinc-400 mb-1 flex items-center gap-1">
            <Thermometer className="w-3 h-3" /> Air / Track Temp
          </span>
          <span className="text-sm font-medium text-white">
            {t.liveAirTempC.toFixed(1)}°C / {t.liveTrackTempC.toFixed(1)}°C
          </span>
        </div>
        <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50 flex flex-col">
          <span className="text-xs text-zinc-400 mb-1 flex items-center gap-1">
            <Wind className="w-3 h-3" /> Wind / Aero
          </span>
          <span className="text-sm font-medium text-white">
            {t.windVel.toFixed(1)} m/s | {t.airDensity.toFixed(2)} kg/m³
          </span>
        </div>
        <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50 flex flex-col">
          <span className="text-xs text-zinc-400 mb-1 flex items-center gap-1">
            <CloudRain className="w-3 h-3" /> Track State
          </span>
          <span className="text-sm font-medium text-white">
            {t.trackWetness > 0.5 ? "Wet" : t.trackWetness > 0.1 ? "Damp" : "Dry"}
          </span>
        </div>
        <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50 flex flex-col">
          <span className="text-xs text-zinc-400 mb-1 flex items-center gap-1">
            <Bot className="w-3 h-3" /> Context
          </span>
          <span className="text-sm font-medium text-white truncate" title={t.car}>
            {t.car} @ {t.track}
          </span>
        </div>
      </div>

      <button
        onClick={askSetupEngineer}
        disabled={loading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-lg"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          <>
            <Bot className="w-5 h-5" />
            <span>Ask AI for Setup Advice</span>
          </>
        )}
      </button>

      {response && (
        <div className="mt-4 p-4 bg-zinc-950/80 rounded-lg border border-zinc-800 text-sm text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
          {response}
        </div>
      )}
    </div>
  );
}
