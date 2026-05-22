import type { Telemetry } from "@/lib/telemetry-types";

export type MathContext = Record<string, number>;

/**
 * Flatten Telemetry into a numeric context map for Math v1 expressions.
 * Non-numeric leaf fields are excluded.
 */
export function telemetryToMathContext(t: Telemetry): MathContext {
  const out: MathContext = {};

  const push = (key: string, value: unknown) => {
    if (typeof value === "number" && Number.isFinite(value)) out[key] = value;
    else if (typeof value === "boolean") out[key] = value ? 1 : 0;
  };

  // Top-level scalar channels
  for (const [k, v] of Object.entries(t)) {
    if (k === "tires" || k === "sectors" || k === "extras") continue;
    push(k, v);
  }

  // Nested channels
  for (const [k, v] of Object.entries(t.sectors)) push(`sectors.${k}`, v);
  for (const [corner, vals] of Object.entries(t.tires)) {
    for (const [k, v] of Object.entries(vals)) push(`tires.${corner}.${k}`, v);
  }
  for (const [k, v] of Object.entries(t.extras ?? {})) push(`extras.${k}`, v);

  return out;
}
