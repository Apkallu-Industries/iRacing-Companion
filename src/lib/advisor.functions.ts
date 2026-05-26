import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ADVISOR_SCHEMA, getAdvisorSystemPrompt, buildAdvisorUserMessage } from "./advisor.prompts";

/**
 * On-demand "Advisor" call. The driver presses a button after at least 3 laps
 * and asks for advice on either DRIVING STYLE (trail braking, throttle, etc.)
 * or CAR SETUP (balance, brake bias, tyre pressures). We send a compact
 * aggregate of the recent laps and ask the AI to return structured tips.
 *
 * No auth middleware: guests on the live dashboard can use this too.
 */

export type AdvisorMode = "style" | "setup";
export type TrackType = "road" | "oval";
export type CornerBias = "left" | "right" | "mixed";
export type Symptom =
  | "understeer_entry"
  | "understeer_apex"
  | "understeer_exit"
  | "oversteer_entry"
  | "oversteer_apex"
  | "oversteer_exit"
  | "brake_lockup_front"
  | "brake_lockup_rear"
  | "poor_traction_exit"
  | "snap_oversteer"
  | "tyres_overheating_front"
  | "tyres_overheating_rear"
  | "bouncy_over_curbs";

export interface LapAggregateInput {
  lapTimeS: number;
  maxBrakePct: number;
  maxThrottlePct: number;
  peakLatG: number;
  peakLonG: number;
  tireAvgC: number;
  fuelUsedL: number;
  isValid: boolean;
}

export interface AdvisorPayload {
  mode: AdvisorMode;
  track: string;
  car: string;
  trackType: TrackType;
  cornerBias: CornerBias;
  symptoms?: Symptom[];
  laps: LapAggregateInput[];
  pbS: number | null;
  conditions: { airTempC: number; trackTempC: number };
  setup: { brakeBias: number; diffMap: number };
  tires: {
    fl: { tempC: number; pressureBar: number };
    fr: { tempC: number; pressureBar: number };
    rl: { tempC: number; pressureBar: number };
    rr: { tempC: number; pressureBar: number };
  };
}

interface AdvisorTip {
  priority: "high" | "medium" | "low";
  area: string;
  tip: string;
  reason: string;
  citation?: string;
}

interface AdvisorResult {
  mode: AdvisorMode;
  headline: string;
  summary: string;
  tips: AdvisorTip[];
}

// Prompts and schemas extracted to advisor.prompts.ts

function localFallback(payload: AdvisorPayload): AdvisorResult {
  const tips: AdvisorTip[] = [];
  const laps = payload.laps;
  const avgBrake = laps.reduce((a, l) => a + l.maxBrakePct, 0) / Math.max(1, laps.length);
  const avgThr = laps.reduce((a, l) => a + l.maxThrottlePct, 0) / Math.max(1, laps.length);
  const avgLat = laps.reduce((a, l) => a + l.peakLatG, 0) / Math.max(1, laps.length);
  const times = laps.map((l) => l.lapTimeS).filter((s) => s > 0);
  const spread = times.length ? Math.max(...times) - Math.min(...times) : 0;

  if (payload.mode === "style") {
    if (avgBrake < 85) {
      tips.push({
        priority: "high",
        area: "Trail braking",
        tip: "Push peak brake pressure up — work toward 90-100% in the threshold phase, then bleed off as you turn in.",
        reason: `Average peak brake across recent laps is only ${avgBrake.toFixed(0)}%, leaving stopping power on the table.`,
      });
    }
    if (avgThr < 97) {
      tips.push({
        priority: "medium",
        area: "Throttle application",
        tip: "Commit fully to throttle once the wheel starts unwinding — don't roll on past 90%.",
        reason: `Peak throttle averages ${avgThr.toFixed(0)}% — partial-load cruising costs straight-line speed.`,
      });
    }
    if (spread > 0.6) {
      tips.push({
        priority: "high",
        area: "Consistency",
        tip: "Lock in a repeatable reference for braking points before chasing more speed.",
        reason: `Lap-time spread across the last ${laps.length} laps is ${spread.toFixed(2)}s — too noisy to extract setup signal.`,
      });
    }
    tips.push({
      priority: "low",
      area: "Mid-corner balance",
      tip: "Hold steady minimum speed through the apex — measured at the limit it's faster than V-shaped lines.",
      reason: `Peak lateral g averages ${avgLat.toFixed(2)} — try to sustain that for longer rather than spiking it briefly.`,
    });
  } else {
    // Symptom-driven priority tips first (from wizard)
    const sym = payload.symptoms ?? [];
    const oval = payload.trackType === "oval";
    const sec = (road: string, ovalSec: string) => (oval ? ovalSec : road);
    if (
      sym.includes("understeer_entry") ||
      sym.includes("understeer_apex") ||
      sym.includes("understeer_exit")
    ) {
      tips.push({
        priority: "high",
        area: "Understeer — top-of-chart fix",
        tip: oval
          ? "Soften front ARB by 1 click (or stiffen rear ARB by 1)."
          : "Soften front ARB by 1 click (or stiffen rear ARB by 1).",
        reason:
          "Driver reports understeer — start with the highest-impact lever from the flowchart.",
        citation: sec("Road — General Understeer #1 (ARB)", "Oval — Push #1 (ARB)"),
      });
    }
    if (
      sym.includes("oversteer_entry") ||
      sym.includes("oversteer_apex") ||
      sym.includes("oversteer_exit") ||
      sym.includes("snap_oversteer")
    ) {
      tips.push({
        priority: "high",
        area: "Oversteer — top-of-chart fix",
        tip: "Stiffen front ARB by 1 click (or soften rear ARB by 1).",
        reason:
          "Driver reports oversteer — apply the highest-impact lever from the flowchart first.",
        citation: sec("Road — General Oversteer #1 (ARB)", "Oval — Loose #1 (ARB)"),
      });
    }
    if (sym.includes("brake_lockup_front")) {
      tips.push({
        priority: "high",
        area: "Brake bias",
        tip: `Move brake bias rearward by 0.5-1.0% (currently ${payload.setup.brakeBias.toFixed(1)}%).`,
        reason: "Fronts locking under braking — shift load to the rears.",
        citation: "eBook: Front-vs-Rear Temp Imbalance / Brake Bias",
      });
    }
    if (sym.includes("brake_lockup_rear")) {
      tips.push({
        priority: "high",
        area: "Brake bias",
        tip: `Move brake bias forward by 0.5-1.0% (currently ${payload.setup.brakeBias.toFixed(1)}%).`,
        reason: "Rears locking under braking — shift load to the fronts.",
        citation: "eBook: Front-vs-Rear Temp Imbalance / Brake Bias",
      });
    }
    if (sym.includes("poor_traction_exit")) {
      tips.push({
        priority: "medium",
        area: "Diff / rear compression",
        tip: "Reduce diff power-lock by 1 click, OR soften rear compression by 1 click.",
        reason: "Poor exit traction — let the rear axle settle and find grip on power.",
        citation: "eBook: Diff Rules + Damper Rules",
      });
    }
    if (sym.includes("bouncy_over_curbs")) {
      tips.push({
        priority: "low",
        area: "Fast dampers",
        tip: "Soften fast compression 1 click to soak the curb, then add 1 click of fast rebound if it bounces back.",
        reason: "Driver reports kerb-bounce — this is a fast-damper issue, not a balance one.",
        citation: "eBook: Damper Rules (fast bump/rebound)",
      });
    }

    const frontHot =
      sym.includes("tyres_overheating_front") ||
      payload.tires.fl.tempC + payload.tires.fr.tempC >
        payload.tires.rl.tempC + payload.tires.rr.tempC + 10;
    const rearHot =
      !frontHot &&
      (sym.includes("tyres_overheating_rear") ||
        payload.tires.rl.tempC + payload.tires.rr.tempC >
          payload.tires.fl.tempC + payload.tires.fr.tempC + 10);
    if (frontHot && !tips.some((x) => x.area === "Brake bias")) {
      tips.push({
        priority: "high",
        area: "Brake bias",
        tip: `Move brake bias rearward by 0.5-1.0% (currently ${payload.setup.brakeBias.toFixed(1)}%).`,
        reason: `Front tyres ${Math.round((payload.tires.fl.tempC + payload.tires.fr.tempC) / 2)}°C vs rears ${Math.round((payload.tires.rl.tempC + payload.tires.rr.tempC) / 2)}°C — fronts are doing more work.`,
        citation: "eBook: Front-vs-Rear Temp Imbalance",
      });
    }
    if (rearHot && !tips.some((x) => x.area === "Brake bias")) {
      tips.push({
        priority: "high",
        area: "Brake bias",
        tip: `Move brake bias forward by 0.5-1.0% (currently ${payload.setup.brakeBias.toFixed(1)}%).`,
        reason: `Rears ${Math.round((payload.tires.rl.tempC + payload.tires.rr.tempC) / 2)}°C vs fronts ${Math.round((payload.tires.fl.tempC + payload.tires.fr.tempC) / 2)}°C — rears overworked.`,
        citation: "eBook: Front-vs-Rear Temp Imbalance",
      });
    }
    const avgPress =
      (payload.tires.fl.pressureBar +
        payload.tires.fr.pressureBar +
        payload.tires.rl.pressureBar +
        payload.tires.rr.pressureBar) /
      4;
    if (avgPress > 1.95) {
      tips.push({
        priority: "medium",
        area: "Tyre pressures",
        tip: "Drop cold pressures by ~0.05 bar all round to reduce hot pressure.",
        reason: `Average hot pressure ${avgPress.toFixed(2)} bar — above the typical working window.`,
        citation: "eBook: Tyre Pressures",
      });
    } else if (avgPress < 1.75) {
      tips.push({
        priority: "medium",
        area: "Tyre pressures",
        tip: "Raise cold pressures by ~0.05 bar all round to bring hot pressure into window.",
        reason: `Average hot pressure ${avgPress.toFixed(2)} bar — sluggish response, vague steering.`,
        citation: "eBook: Tyre Pressures",
      });
    }
    if (avgLat > 2.0 && spread > 0.4) {
      tips.push({
        priority: "medium",
        area: "Anti-roll balance",
        tip: "Soften the end of the car the driver is fighting — start with one click and re-evaluate.",
        reason: `High lateral load (${avgLat.toFixed(2)}g) combined with ${spread.toFixed(2)}s lap spread suggests balance is on edge.`,
        citation: oval ? "Oval — Push/Loose #1 (ARB)" : "Road — Understeer/Oversteer #1 (ARB)",
      });
    }
    tips.push({
      priority: "low",
      area: "Diff mapping",
      tip: `Current diff map ${payload.setup.diffMap} — try ±1 click to bias rotation vs traction depending on driver complaint.`,
      reason:
        "Small diff changes are the cheapest balance lever once tyres and bias are dialled in.",
      citation: "eBook: Diff Rules",
    });
  }

  // Pad to 3
  while (tips.length < 3) {
    tips.push({
      priority: "low",
      area: payload.mode === "style" ? "Reference laps" : "Baseline check",
      tip:
        payload.mode === "style"
          ? "Bank 5 clean reference laps before changing anything else."
          : "Reset to baseline setup, then change one parameter at a time.",
      reason: "Insufficient signal yet — establish a stable baseline before iterating.",
    });
  }

  return {
    mode: payload.mode,
    headline:
      payload.mode === "style"
        ? "Driving-style read from your last laps"
        : "Setup read from your last laps",
    summary: `Based on ${laps.length} recent laps at ${payload.track} in ${payload.car}. Local analysis (AI unavailable).`,
    tips: tips.slice(0, 6),
  };
}

const AdvisorPayloadSchema = z.object({
  mode: z.enum(["style", "setup"]),
  track: z.string().min(1).max(255),
  car: z.string().min(1).max(255),
  trackType: z.enum(["road", "oval"]),
  cornerBias: z.enum(["left", "right", "mixed"]),
  symptoms: z
    .array(
      z.enum([
        "understeer_entry",
        "understeer_apex",
        "understeer_exit",
        "oversteer_entry",
        "oversteer_apex",
        "oversteer_exit",
        "brake_lockup_front",
        "brake_lockup_rear",
        "poor_traction_exit",
        "snap_oversteer",
        "tyres_overheating_front",
        "tyres_overheating_rear",
        "bouncy_over_curbs",
      ]),
    )
    .max(20)
    .optional(),
  laps: z
    .array(
      z.object({
        lapTimeS: z.number(),
        maxBrakePct: z.number(),
        maxThrottlePct: z.number(),
        peakLatG: z.number(),
        peakLonG: z.number(),
        tireAvgC: z.number(),
        fuelUsedL: z.number(),
        isValid: z.boolean(),
      }),
    )
    .min(1)
    .max(60),
  pbS: z.number().nullable(),
  conditions: z.object({ airTempC: z.number(), trackTempC: z.number() }),
  setup: z.object({ brakeBias: z.number(), diffMap: z.number() }),
  tires: z.object({
    fl: z.object({ tempC: z.number(), pressureBar: z.number() }),
    fr: z.object({ tempC: z.number(), pressureBar: z.number() }),
    rl: z.object({ tempC: z.number(), pressureBar: z.number() }),
    rr: z.object({ tempC: z.number(), pressureBar: z.number() }),
  }),
});

export const advisorCall = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => AdvisorPayloadSchema.parse(data) as AdvisorPayload)
  .handler(
    async ({
      data,
    }): Promise<{ result: AdvisorResult; fallback?: "no-key" | "local" } | { error: string }> => {
      if (!data.laps || data.laps.length < 3) {
        return { error: "Need at least 3 completed laps to give meaningful advice." };
      }
      const apiKey = process.env.LOVABLE_API_KEY;
      if (!apiKey) {
        return { result: localFallback(data), fallback: "no-key" };
      }
      // wsCtx and extrasSnapshot are injected by llm.ts for the cloud path
      const { wsCtx, extrasSnapshot, ...coreData } = data as any;
      const userMsg = buildAdvisorUserMessage({ ...coreData, wsCtx, extrasSnapshot });
      try {
        const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-pro",
            messages: [
              { role: "system", content: getAdvisorSystemPrompt(coreData) },
              { role: "user", content: userMsg },
            ],
            tools: [{ type: "function", function: ADVISOR_SCHEMA }],
            tool_choice: { type: "function", function: { name: ADVISOR_SCHEMA.name } },
          }),
        });
        if (resp.status === 429) return { error: "Rate limit hit — try again in a moment." };
        if (resp.status === 402)
          return { error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." };
        if (!resp.ok) return { result: localFallback(data), fallback: "local" };
        const json = await resp.json();
        const args = json?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
        if (!args) return { result: localFallback(data), fallback: "local" };
        try {
          const obj = JSON.parse(args);
          if (!Array.isArray(obj?.tips) || obj.tips.length === 0) {
            return { result: localFallback(data), fallback: "local" };
          }
          return { result: { mode: data.mode, ...obj } as AdvisorResult };
        } catch {
          return { result: localFallback(data), fallback: "local" };
        }
      } catch (e) {
        console.error("[advisor] failed", e);
        return { result: localFallback(data), fallback: "local" };
      }
    },
  );
