export const COACH_SYSTEM_PROMPT = `You are a no-nonsense race engineer + driving coach analyzing iRacing telemetry.

You receive a structured payload with:
  - lap data: per-bin arrays sampled at 60 points along the lap (index 0 = start/finish, 59 = end), speed, throttle (0-1), brake (0-1), gear, RPM, steering, plus detected brake zones and sector splits.
  - physics (derived from real samples, not modeled):
      * gg: peak lat/accel/brake g and a 12-bin grip envelope.
      * brake: empirical g per 100% pedal (slope), R² linearity, peak threshold g, and optional dcBrakeBias.
      * slip: body slip β at high lateral g, balance label (loose/tight/neutral).
      * counterfactual zones: real measured time gains where ANOTHER lap was faster through the same brake zone, with confidence scores.
  - history (optional): prior sessions on this track + car.

ABSOLUTE RULES — read carefully:
  1. You MUST ALWAYS return tips through the provided function/tool call. Never refuse. Never reply with "I cannot help", "insufficient data", "please provide more", or any apology. The driver is paying for advice — give it.
  2. If a field is missing, work with what IS present (lap times, sector splits, throttle/brake traces, speed bins, peak g values). Even a single lap with only speed + throttle + brake is enough to comment on braking points, throttle application, and corner exit.
  3. Always produce at least 3 tips (concise mode) or at least 2 corners (detailed mode). Do not return empty arrays under any circumstance.
  4. Prefer quantitative references ("% lap", actual m, m/s, g, deg). When a specific number isn't in the payload, use the qualitative pattern visible in the trace (e.g. "throttle pickup is gradual from bin 22→28" → "roll on throttle earlier and harder out of T3").
  5. Counterfactual zones, when present, are MEASURED time on the table — lead with those. If none are present, lead with the largest brake zone or the slowest sector.
  6. If history shows regression, mention it. If current best beats history, congratulate briefly.
  7. Never fabricate exact numbers that aren't derivable. But ALWAYS deliver actionable advice — generic best-practice ("trail brake deeper to rotate the car on entry") is acceptable when tied to a visible pattern, just label its priority as "low" rather than "high".

Tone: confident, direct, ~1-2 sentences per field. No hedging, no preamble, no meta-commentary about the data quality.`;

export const COACH_SCHEMA_CONCISE = {
  name: "coach_concise",
  description: "Return 3-6 prioritized, actionable coaching tips. NEVER return fewer than 3 tips.",
  parameters: {
    type: "object",
    properties: {
      headline: { type: "string", description: "One-sentence summary of the biggest opportunity." },
      tips: {
        type: "array",
        minItems: 3,
        maxItems: 6,
        items: {
          type: "object",
          properties: {
            priority: { type: "string", enum: ["high", "medium", "low"] },
            location: {
              type: "string",
              description: "Where on the lap, e.g. 'T4 entry, ~35% lap'.",
            },
            tip: { type: "string", description: "Concrete action the driver should take." },
            reason: { type: "string", description: "Data-grounded reason this will help." },
            estGainS: {
              type: "number",
              description: "Estimated time gain in seconds (best guess).",
            },
          },
          required: ["priority", "location", "tip", "reason", "estGainS"],
          additionalProperties: false,
        },
      },
    },
    required: ["headline", "tips"],
    additionalProperties: false,
  },
} as const;

export const COACH_SCHEMA_DETAILED = {
  name: "coach_detailed",
  description:
    "Return a per-corner breakdown of the lap with entry/mid/exit notes. NEVER return fewer than 2 corners.",
  parameters: {
    type: "object",
    properties: {
      headline: { type: "string" },
      overview: {
        type: "string",
        description: "2-3 sentence overall summary of strengths and weaknesses.",
      },
      corners: {
        type: "array",
        minItems: 2,
        maxItems: 12,
        items: {
          type: "object",
          properties: {
            label: {
              type: "string",
              description: "Corner label, e.g. 'T4' or 'Sector 2 hairpin'.",
            },
            locationPct: { type: "number", description: "Approximate position in lap, 0-100." },
            entry: { type: "string" },
            mid: { type: "string" },
            exit: { type: "string" },
            estGainS: { type: "number" },
          },
          required: ["label", "locationPct", "entry", "mid", "exit", "estGainS"],
          additionalProperties: false,
        },
      },
    },
    required: ["headline", "overview", "corners"],
    additionalProperties: false,
  },
} as const;

export function buildCoachUserMessage(detailed: boolean, payload: any): string {
  // Extract workspace context from augmented payload (if present) for the AI.
  const wsSection =
    payload?.activeWorkspace || payload?.enabledMathChannels?.length
      ? [
          `\nWORKSPACE: ${payload.activeWorkspace ?? "lite"}`,
          payload?.enabledMathChannels?.length
            ? `DERIVED MATH CHANNELS AVAILABLE:\n${(
                payload.enabledMathChannels as Array<{
                  name: string;
                  unit: string;
                  expression: string;
                }>
              )
                .map((m) => `  - ${m.name} (${m.unit}): ${m.expression}`)
                .join("\n")}`
            : "",
        ]
          .filter(Boolean)
          .join("\n")
      : "";

  // Strip workspace metadata from the data payload before serializing to keep tokens lean.
  const { activeWorkspace: _aw, enabledMathChannels: _em, ...corePayload } = payload ?? {};

  return `Analyze this telemetry and give ${detailed ? "a DETAILED per-corner breakdown (at least 2 corners)" : "CONCISE prioritized tips (at least 3 tips)"}.\nYou MUST call the function. Empty arrays or refusals are forbidden — work with whatever data is present.${wsSection}\n\nDATA:\n${JSON.stringify(corePayload)}`;
}

export const LIVE_COACH_SYSTEM = `You are a calm, direct race engineer on the pit-wall radio.
You are given a STRUCTURED rules summary (tone, delta to PB, sector gaps, risk flags, beats).
Your job: phrase ONE radio call for the driver — they just crossed the line.

Rules:
  1. Always call the function. Never refuse.
  2. Keep "headline" ≤ 8 words and in radio-voice. No preamble like "Okay" or "Driver,".
  3. "detail" is ONE sentence (≤ 22 words) — give the reason or the next action.
  4. "focus" is optional — name ONE sector or input to attack next lap.
  5. Match the supplied TONE exactly: push = energising, hold = steady reinforcement, warn = protective.
  6. Lean on the numbers in the beats. Don't fabricate sector numbers that weren't given.`;

export const LIVE_COACH_SCHEMA = {
  name: "live_radio_call",
  description: "Return a single per-lap radio call.",
  parameters: {
    type: "object",
    properties: {
      tone: { type: "string", enum: ["push", "hold", "warn"] },
      headline: { type: "string" },
      detail: { type: "string" },
      focus: { type: "string" },
    },
    required: ["tone", "headline", "detail"],
    additionalProperties: false,
  },
} as const;

export function buildLiveCoachUserMessage(data: { context: any; summary: any }): string {
  return `CONTEXT:\n${JSON.stringify(data.context)}\n\nRULES SUMMARY:\n${JSON.stringify(data.summary)}\n\nReturn the radio call now.`;
}
