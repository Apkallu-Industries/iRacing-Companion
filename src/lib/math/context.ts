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

  // Global units database and mathematical constants
  out["const.PI"] = Math.PI;
  out["const.E"] = Math.E;
  out["const.kph_to_mph"] = 0.621371192;
  out["const.kph_to_mps"] = 0.277777778;
  out["const.mps_to_kph"] = 3.6;
  out["const.mps_to_mph"] = 2.23693629;
  out["const.bar_to_psi"] = 14.50377377;
  out["const.bar_to_kpa"] = 100.0;
  out["const.kpa_to_psi"] = 0.145037738;
  out["const.psi_to_bar"] = 0.068947573;
  out["const.c_to_f_gain"] = 1.8;
  out["const.c_to_f_offset"] = 32.0;
  out["const.g_to_mps2"] = 9.80665;
  out["const.mps2_to_g"] = 0.101971621;
  out["const.nm_to_lbfft"] = 0.737562149;
  out["const.kg_to_lb"] = 2.204622622;
  out["const.rpm_to_rads"] = 0.104719755;
  out["const.rads_to_rpm"] = 9.549296586;
  out["const.rpm_to_degs"] = 6.0;
  out["const.litre_to_gal"] = 0.219969248;
  out["const.litre_to_usgal"] = 0.264172052;
  out["const.rad_to_deg"] = 57.295779513;
  out["const.deg_to_rad"] = 0.0174532925;

  return out;
}
