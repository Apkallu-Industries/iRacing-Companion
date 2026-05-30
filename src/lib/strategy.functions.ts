import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export interface StrategyCallResult {
  alert: boolean;
  headline: string;
  detail: string;
  urgency: "low" | "high";
}

export function strategyCopilotStub() {
  return { error: "Strategy Copilot requires Local LLM configured in settings." };
}
