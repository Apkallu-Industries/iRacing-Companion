import { SETUP_BIBLE } from "./advisor.knowledge";
import type { AdvisorMode, TrackType, CornerBias, Symptom, LapAggregateInput } from "./advisor.functions";

export const ADVISOR_SCHEMA = {
    name: "advisor_response",
    description: "Return prioritized advice tied to the supplied lap aggregates.",
    parameters: {
        type: "object",
        properties: {
            headline: { type: "string", description: "≤10 word punchy summary." },
            summary: { type: "string", description: "2-3 sentence overview." },
            tips: {
                type: "array",
                minItems: 3,
                maxItems: 6,
                items: {
                    type: "object",
                    properties: {
                        priority: { type: "string", enum: ["high", "medium", "low"] },
                        area: { type: "string", description: "e.g. 'Trail braking', 'Brake bias', 'Front pressures'." },
                        tip: { type: "string", description: "Concrete action the driver should take." },
                        reason: { type: "string", description: "Data-grounded reason this will help." },
                        citation: { type: "string", description: "Which Setup Bible rule/flowchart section this came from, e.g. 'Road — General Understeer #1 (ARB)' or 'eBook: Tyre Pressures'. Required for setup mode." },
                    },
                    required: ["priority", "area", "tip", "reason"],
                    additionalProperties: false,
                },
            },
        },
        required: ["headline", "summary", "tips"],
        additionalProperties: false,
    },
} as const;

export function getAdvisorSystemPrompt(payload: {
    mode: AdvisorMode;
    trackType: TrackType;
    cornerBias: CornerBias;
    symptoms?: Symptom[];
}): string {
    if (payload.mode === "style") {
        return `You are a senior driver coach. Analyse the supplied per-lap aggregates and give DRIVING-STYLE advice (trail braking, throttle application, corner exit, racing line, consistency). Do NOT recommend setup changes — focus purely on what the driver does with the inputs. Be specific, reference the numbers, never refuse. Always call the function with 3-6 tips. The "citation" field is OPTIONAL for driving-style tips.`;
    }
    const scope =
        payload.trackType === "oval"
            ? `This is an OVAL (predominantly ${payload.cornerBias === "right" ? "right-hand" : "left-hand"} corners). Use ONLY the OVAL sections of the Setup Bible — IGNORE the road-racing flowcharts. Inside = ${payload.cornerBias === "right" ? "RIGHT" : "LEFT"}, outside = ${payload.cornerBias === "right" ? "LEFT" : "RIGHT"}.`
            : `This is a ROAD course (${payload.cornerBias === "mixed" ? "mixed left + right corners" : payload.cornerBias === "right" ? "right-hand bias" : "left-hand bias"}). Use ONLY the ROAD-RACING sections of the Setup Bible — IGNORE the oval flowcharts.`;
    const wiz = payload.symptoms?.length
        ? `\nDRIVER-REPORTED SYMPTOMS (treat as ground truth, prioritise these over data inference): ${payload.symptoms.join(", ")}.`
        : "";
    return `You are a senior race engineer. Your ONLY source of setup truth is the SETUP BIBLE below — every recommendation MUST be derivable from one of its rules. Do not invent rules that contradict it. Do NOT coach driving inputs.

${scope}${wiz}

Workflow on every call:
  1. Read the lap aggregates, tyre temps/pressures, conditions, and current setup.
  2. Decide whether the dominant symptom is UNDERSTEER, OVERSTEER, a TYRE-TEMP imbalance, a DAMPER/transition problem, or a DIFF/AERO issue. If the driver reported symptoms, those win.
  3. Pick the HIGHEST-IMPACT rule from the relevant flowchart (top of the list wins). Use lower-impact rules only for fine-tuning tips.
  4. For each tip you MUST populate the "citation" field with the exact Bible section + rule number you applied, e.g. "Road — General Understeer #1 (ARB)", "Oval — Loose #3 (Spoiler)", "eBook: Tyre Pressures", "eBook: Damper Rules". No citation = invalid tip.
  5. Each tip body includes: (a) symptom from the data, (b) the rule paraphrased, (c) the concrete change in the driver's units (clicks, %, psi/bar). End with "Re-check tyre temps after this change." where applicable.
  6. Change ONE major thing at a time — never stack two opposing fixes in the same tip.

Be specific, reference the numbers, never refuse. Always call the function with 3-6 tips.

=========== SETUP BIBLE (authoritative) ===========
${SETUP_BIBLE}
===================================================`;
}

export function buildAdvisorUserMessage(data: {
    mode: AdvisorMode;
    track: string;
    trackType: TrackType;
    cornerBias: CornerBias;
    car: string;
    pbS: number | null;
    symptoms?: Symptom[];
    conditions: any;
    setup: any;
    tires: any;
    laps: LapAggregateInput[];
}): string {
    return `MODE: ${data.mode.toUpperCase()}\nTRACK: ${data.track} (${data.trackType}, bias=${data.cornerBias})\nCAR: ${data.car}\nPB: ${data.pbS ?? "none"}\nSYMPTOMS: ${data.symptoms?.join(", ") || "(none reported — infer from data)"}\nCONDITIONS: ${JSON.stringify(data.conditions)}\nSETUP: ${JSON.stringify(data.setup)}\nTIRES: ${JSON.stringify(data.tires)}\nLAPS: ${JSON.stringify(data.laps)}\n\nCall the function with 3-6 prioritized ${data.mode === "style" ? "driving-style" : "setup"} tips. Reference the numbers.${data.mode === "setup" ? " Every tip MUST include a citation from the Setup Bible." : ""}`;
}
