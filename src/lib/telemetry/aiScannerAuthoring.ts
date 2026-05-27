/**
 * aiScannerAuthoring.ts — AI Telemetry Scanner Generator
 *
 * Converts natural language descriptions of telemetry anomalies
 * into fully-formed DSLRule JSON configurations, executed locally
 * via LM Studio or Ollama (with Cloud Gemini fallback).
 */

import { completeLocal } from "../ai/localAiRouter";
import type { DSLRule } from "./dsl";

const SYSTEM_PROMPT = `
You are a professional Formula 1 and WEC race engineering telemetry systems programmer.
You specialize in writing declarative scanners in YAML/JSON that detect physical chassis, tyre, hybrid, or ERS infractions.

Convert the race engineer's natural language request into a single valid JSON object representing a Pit Wall Telemetry Scanner DSL Rule.
The JSON object must strictly conform to this TypeScript schema:

interface DSLRuleCondition {
  channel: string; // The telemetry channel name (e.g. Brake, Speed, pitch, LFspeed, LRspeed, MgukDeploykW, Throttle, YawRate, ShockDeflectionFL)
  operator: ">" | "<" | "==" | "!=" | "mismatch";
  value: number; // The numeric threshold value (speed values are in m/s, angular values in radians)
}

interface DSLRule {
  name: string; // Dynamic uppercase short title of the rule, e.g. "REAR FLUID DISSIPATION HEAVE"
  classification: "STABILITY" | "PERFORMANCE" | "AERO PLATFORM" | "HYBRID CORE";
  category: "thermal" | "dynamics" | "hybrid" | "inputs";
  severity: "info" | "warning" | "critical";
  channels: string[]; // List of channels used in conditions
  conditions: DSLRuleCondition[];
  durationSec: number; // Threshold duration for anomaly detection (e.g. 0.15s, 0.2s)
  cornerNumber?: number; // Estimated corner number if specific, otherwise omit
  descriptionTemplate: string; // Engineering narrative explanation of the anomaly using advanced motorsport dynamics terminology
}

OUTPUT FORMAT: Return ONLY the raw JSON string. Do NOT wrap it in markdown code blocks like \`\`\`json. Do not include any explanation before or after the JSON.
`;

/**
 * Generate a telemetry scanner DSL rule from a natural language request.
 */
export async function generateScannerRule(
  prompt: string
): Promise<DSLRule | null> {
  const systemPrompt = SYSTEM_PROMPT.trim();
  
  // Try local first
  const result = await completeLocal(prompt, {
    systemPrompt,
    maxTokens: 512,
    temperature: 0.15,
  });

  if (!result) {
    // If local AI is offline, return a fallback template rule to ensure determinism
    console.warn("[aiScannerAuthoring] Local AI unavailable or refused; returning template rule.");
    return getFallbackRule(prompt);
  }

  try {
    const cleaned = result.trim().replace(/^```json|```$/g, "").trim();
    const rule = JSON.parse(cleaned) as DSLRule;
    if (rule && rule.name && Array.isArray(rule.conditions) && rule.conditions.length > 0) {
      const validation = validateDSLRule(rule);
      if (validation.valid) {
        return rule;
      } else {
        console.warn(`[aiScannerAuthoring] Generated rule failed sandbox checks: ${validation.reason}`);
      }
    }
    return getFallbackRule(prompt);
  } catch (e) {
    console.error("[aiScannerAuthoring] Failed to parse generated scanner rule JSON:", e, result);
    return getFallbackRule(prompt);
  }
}

const VALID_CHANNELS = new Set([
  "Brake", "Throttle", "Speed", "pitch", "roll", 
  "LFspeed", "LRspeed", "LFtempCL", "MgukDeploykW", 
  "EnergyStorePct", "YawRate", "ShockDeflectionFL"
]);

const VALID_OPERATORS = new Set([">", "<", "==", "!=", "mismatch"]);
const VALID_CLASSIFICATIONS = new Set(["STABILITY", "PERFORMANCE", "AERO PLATFORM", "HYBRID CORE"]);
const VALID_CATEGORIES = new Set(["thermal", "dynamics", "hybrid", "inputs"]);
const VALID_SEVERITIES = new Set(["info", "warning", "critical"]);

export function validateDSLRule(rule: DSLRule): { valid: boolean; reason?: string } {
  if (!VALID_CLASSIFICATIONS.has(rule.classification)) {
    return { valid: false, reason: `Invalid classification: ${rule.classification}` };
  }
  if (!VALID_CATEGORIES.has(rule.category)) {
    return { valid: false, reason: `Invalid category: ${rule.category}` };
  }
  if (!VALID_SEVERITIES.has(rule.severity)) {
    return { valid: false, reason: `Invalid severity: ${rule.severity}` };
  }
  if (rule.durationSec < 0.01 || rule.durationSec > 10.0) {
    return { valid: false, reason: `Duration out of bounds: ${rule.durationSec}s` };
  }
  
  for (const cond of rule.conditions) {
    if (!VALID_CHANNELS.has(cond.channel)) {
      return { valid: false, reason: `Unvalidated channel name: ${cond.channel}` };
    }
    if (!VALID_OPERATORS.has(cond.operator)) {
      return { valid: false, reason: `Invalid operator: ${cond.operator}` };
    }
  }

  return { valid: true };
}

function getFallbackRule(prompt: string): DSLRule {
  const isBrake = /brake|lockup|stop/i.test(prompt);
  const isAero = /pitch|roll|aero|splitter|packer|bottom/i.test(prompt);
  const isErs = /hybrid|mgu|energy|ers|battery/i.test(prompt);

  if (isBrake) {
    return {
      name: "DYNAMIC BRAKING LOAD FLUIDITY",
      classification: "STABILITY",
      category: "thermal",
      severity: "warning",
      channels: ["Brake", "Speed"],
      conditions: [
        { channel: "Brake", operator: ">", value: 0.75 },
        { channel: "Speed", operator: ">", value: 15.0 }
      ],
      durationSec: 0.2,
      descriptionTemplate: "Braking pressure exceeded 75% threshold under high-speed deceleration. Potential transient locking risk."
    };
  }

  if (isAero) {
    return {
      name: "CHASSIS VACUUM SEAL HEAVE",
      classification: "AERO PLATFORM",
      category: "dynamics",
      severity: "warning",
      channels: ["pitch"],
      conditions: [
        { channel: "pitch", operator: "<", value: -0.012 }
      ],
      durationSec: 0.1,
      descriptionTemplate: "Splitter pitch compression exceeded ground threshold, risking splitter grounding and vacuum seal loss."
    };
  }

  if (isErs) {
    return {
      name: "MGU-K THERMAL ENERGY SATURATION",
      classification: "HYBRID CORE",
      category: "hybrid",
      severity: "info",
      channels: ["MgukDeploykW"],
      conditions: [
        { channel: "MgukDeploykW", operator: ">", value: 110.0 }
      ],
      durationSec: 2.0,
      descriptionTemplate: "Energy store deployment remained saturated at peak output limits (>110 kW) on straightaway."
    };
  }

  // General fallback
  return {
    name: "CUSTOM ANOMALY DETECTOR",
    classification: "PERFORMANCE",
    category: "inputs",
    severity: "info",
    channels: ["Throttle", "Speed"],
    conditions: [
      { channel: "Throttle", operator: ">", value: 0.9 },
      { channel: "Speed", operator: ">", value: 10.0 }
    ],
    durationSec: 0.15,
    descriptionTemplate: "Telemetry trigger detected based on custom inputs and velocity parameters."
  };
}
