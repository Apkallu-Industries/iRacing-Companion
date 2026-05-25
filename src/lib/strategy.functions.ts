import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export interface StrategyCallResult {
  alert: boolean;
  headline: string;
  detail: string;
  urgency: "low" | "high";
}

export const strategyCopilot = createServerFn({ method: "POST" })
  .inputValidator(z.any())
  .handler(async ({ data }): Promise<{ call?: StrategyCallResult; error?: string }> => {
    // This is a cloud fallback stub in case local LLM is missing, but strategy copilot
    // is entirely designed for local LLM usage. We will just return a no-op if cloud is hit.
    console.log("[strategyCopilot] cloud hit (should be local LLM)", data);
    return { error: "Strategy Copilot requires Local LLM configured in settings." };
  });
