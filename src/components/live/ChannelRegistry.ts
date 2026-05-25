import type { Telemetry } from "@/lib/telemetry-types";
import type { MathExpression } from "@/lib/math/schema";

export interface ChannelDef {
  key: string;
  label: string;
  unit: string;
  color: string;
  group: "Drive" | "Inputs" | "Forces" | "Tyres" | "Session" | "Setup" | "Env" | "Extras";
  read: (t: Telemetry) => string;
}

const fmt = {
  int: (v: number) => Math.round(v).toString(),
  k: (v: number) => Math.round(v).toLocaleString(),
  f1: (v: number) => v.toFixed(1),
  f2: (v: number) => v.toFixed(2),
  pct01: (v: number) => Math.round(v * 100).toString(),
  gear: (g: number) => (g === 0 ? "N" : g === -1 ? "R" : String(g)),
  bool: (v: boolean) => (v ? "ON" : "OFF"),
};

/** Every native Telemetry field exposed as a channel. */
export const STATIC_CHANNELS: ChannelDef[] = [
  // Drive
  { key: "speedKph", label: "SPEED", unit: "km/h", color: "#22d3ee", group: "Drive", read: (t) => fmt.int(t.speedKph) },
  { key: "rpm", label: "RPM", unit: "rpm", color: "#e5e5e5", group: "Drive", read: (t) => fmt.k(t.rpm) },
  { key: "rpmMax", label: "RPM MAX", unit: "rpm", color: "#737373", group: "Drive", read: (t) => fmt.k(t.rpmMax) },
  { key: "rpmShiftWarn", label: "SHIFT WARN", unit: "rpm", color: "#fbbf24", group: "Drive", read: (t) => fmt.k(t.rpmShiftWarn) },
  { key: "rpmShiftRedline", label: "REDLINE", unit: "rpm", color: "#f43f5e", group: "Drive", read: (t) => fmt.k(t.rpmShiftRedline) },
  { key: "gear", label: "GEAR", unit: "", color: "#fbbf24", group: "Drive", read: (t) => fmt.gear(t.gear) },
  // Inputs
  { key: "throttle", label: "THROTTLE", unit: "%", color: "#22c55e", group: "Inputs", read: (t) => fmt.pct01(t.throttle) },
  { key: "brake", label: "BRAKE", unit: "%", color: "#ef4444", group: "Inputs", read: (t) => fmt.pct01(t.brake) },
  { key: "clutch", label: "CLUTCH", unit: "%", color: "#60a5fa", group: "Inputs", read: (t) => fmt.pct01(t.clutch) },
  { key: "steeringDeg", label: "STEER", unit: "°", color: "#facc15", group: "Inputs", read: (t) => fmt.int(t.steeringDeg) },
  // Forces
  { key: "gLat", label: "G LAT", unit: "G", color: "#f97316", group: "Forces", read: (t) => fmt.f2(t.gLat) },
  { key: "gLon", label: "G LON", unit: "G", color: "#38bdf8", group: "Forces", read: (t) => fmt.f2(t.gLon) },
  // Tyres
  { key: "tires.fl.tempC", label: "FL TEMP", unit: "°C", color: "#fb923c", group: "Tyres", read: (t) => fmt.int(t.tires.fl.tempC) },
  { key: "tires.fr.tempC", label: "FR TEMP", unit: "°C", color: "#fb923c", group: "Tyres", read: (t) => fmt.int(t.tires.fr.tempC) },
  { key: "tires.rl.tempC", label: "RL TEMP", unit: "°C", color: "#fb923c", group: "Tyres", read: (t) => fmt.int(t.tires.rl.tempC) },
  { key: "tires.rr.tempC", label: "RR TEMP", unit: "°C", color: "#fb923c", group: "Tyres", read: (t) => fmt.int(t.tires.rr.tempC) },
  { key: "tires.fl.pressureBar", label: "FL PRESS", unit: "bar", color: "#a78bfa", group: "Tyres", read: (t) => fmt.f2(t.tires.fl.pressureBar) },
  { key: "tires.fr.pressureBar", label: "FR PRESS", unit: "bar", color: "#a78bfa", group: "Tyres", read: (t) => fmt.f2(t.tires.fr.pressureBar) },
  { key: "tires.rl.pressureBar", label: "RL PRESS", unit: "bar", color: "#a78bfa", group: "Tyres", read: (t) => fmt.f2(t.tires.rl.pressureBar) },
  { key: "tires.rr.pressureBar", label: "RR PRESS", unit: "bar", color: "#a78bfa", group: "Tyres", read: (t) => fmt.f2(t.tires.rr.pressureBar) },
  { key: "tires.fl.wearPct", label: "FL WEAR", unit: "%", color: "#10b981", group: "Tyres", read: (t) => fmt.int(t.tires.fl.wearPct) },
  { key: "tires.fr.wearPct", label: "FR WEAR", unit: "%", color: "#10b981", group: "Tyres", read: (t) => fmt.int(t.tires.fr.wearPct) },
  { key: "tires.rl.wearPct", label: "RL WEAR", unit: "%", color: "#10b981", group: "Tyres", read: (t) => fmt.int(t.tires.rl.wearPct) },
  { key: "tires.rr.wearPct", label: "RR WEAR", unit: "%", color: "#10b981", group: "Tyres", read: (t) => fmt.int(t.tires.rr.wearPct) },
  { key: "tires.fl.estWearPct", label: "FL EST. WEAR", unit: "%", color: "#34d399", group: "Tyres", read: (t) => fmt.f1(t.tires.fl.estWearPct) },
  { key: "tires.fr.estWearPct", label: "FR EST. WEAR", unit: "%", color: "#34d399", group: "Tyres", read: (t) => fmt.f1(t.tires.fr.estWearPct) },
  { key: "tires.rl.estWearPct", label: "RL EST. WEAR", unit: "%", color: "#34d399", group: "Tyres", read: (t) => fmt.f1(t.tires.rl.estWearPct) },
  { key: "tires.rr.estWearPct", label: "RR EST. WEAR", unit: "%", color: "#34d399", group: "Tyres", read: (t) => fmt.f1(t.tires.rr.estWearPct) },
  // Brakes
  { key: "tires.fl.brakeTempC", label: "FL BRAKE", unit: "C", color: "#f43f5e", group: "Tyres", read: (t) => fmt.int(t.tires.fl.brakeTempC) },
  { key: "tires.fr.brakeTempC", label: "FR BRAKE", unit: "C", color: "#f43f5e", group: "Tyres", read: (t) => fmt.int(t.tires.fr.brakeTempC) },
  { key: "tires.rl.brakeTempC", label: "RL BRAKE", unit: "C", color: "#f43f5e", group: "Tyres", read: (t) => fmt.int(t.tires.rl.brakeTempC) },
  { key: "tires.rr.brakeTempC", label: "RR BRAKE", unit: "C", color: "#f43f5e", group: "Tyres", read: (t) => fmt.int(t.tires.rr.brakeTempC) },
  { key: "tires.fl.brakeLinePress", label: "FL B.PRES", unit: "bar", color: "#fca5a5", group: "Tyres", read: (t) => fmt.f1(t.tires.fl.brakeLinePress) },
  { key: "tires.fr.brakeLinePress", label: "FR B.PRES", unit: "bar", color: "#fca5a5", group: "Tyres", read: (t) => fmt.f1(t.tires.fr.brakeLinePress) },
  { key: "tires.rl.brakeLinePress", label: "RL B.PRES", unit: "bar", color: "#fca5a5", group: "Tyres", read: (t) => fmt.f1(t.tires.rl.brakeLinePress) },
  { key: "tires.rr.brakeLinePress", label: "RR B.PRES", unit: "bar", color: "#fca5a5", group: "Tyres", read: (t) => fmt.f1(t.tires.rr.brakeLinePress) },
  // Session
  { key: "lastLap", label: "LAST LAP", unit: "", color: "#e5e5e5", group: "Session", read: (t) => t.lastLap },
  { key: "bestLap", label: "BEST LAP", unit: "", color: "#34d399", group: "Session", read: (t) => t.bestLap },
  { key: "deltaSec", label: "DELTA", unit: "s", color: "#facc15", group: "Session", read: (t) => `${t.deltaSec >= 0 ? "+" : ""}${t.deltaSec.toFixed(3)}` },
  { key: "sectors.s1", label: "S1", unit: "", color: "#a3a3a3", group: "Session", read: (t) => t.sectors.s1 ?? "--.---" },
  { key: "sectors.s2", label: "S2", unit: "", color: "#a3a3a3", group: "Session", read: (t) => t.sectors.s2 ?? "--.---" },
  { key: "sectors.s3", label: "S3", unit: "", color: "#a3a3a3", group: "Session", read: (t) => t.sectors.s3 ?? "--.---" },
  { key: "session", label: "SESSION", unit: "", color: "#737373", group: "Session", read: (t) => t.session },
  { key: "track", label: "TRACK", unit: "", color: "#737373", group: "Session", read: (t) => t.track },
  { key: "car", label: "CAR", unit: "", color: "#737373", group: "Session", read: (t) => t.car },
  { key: "carNumber", label: "CAR #", unit: "", color: "#737373", group: "Session", read: (t) => `#${t.carNumber}` },
  { key: "sdkVersion", label: "SDK", unit: "", color: "#737373", group: "Session", read: (t) => t.sdkVersion },
  { key: "latencyMs", label: "LATENCY", unit: "ms", color: "#a3a3a3", group: "Session", read: (t) => fmt.int(t.latencyMs) },
  { key: "safetyRating", label: "SR", unit: "", color: "#a3a3a3", group: "Session", read: (t) => fmt.f2(t.safetyRating) },
  { key: "sof", label: "SOF", unit: "", color: "#a3a3a3", group: "Session", read: (t) => t.sof.toLocaleString() },
  // Setup / strategy
  { key: "fuelRemainingL", label: "FUEL", unit: "L", color: "#fb923c", group: "Setup", read: (t) => fmt.f1(t.fuelRemainingL) },
  { key: "lapsEstimated", label: "LAPS EST", unit: "", color: "#a3a3a3", group: "Setup", read: (t) => fmt.f1(t.lapsEstimated) },
  { key: "brakeBias", label: "BBIAS", unit: "%", color: "#a3a3a3", group: "Setup", read: (t) => fmt.f1(t.brakeBias) },
  { key: "diffMap", label: "DIFF", unit: "", color: "#a3a3a3", group: "Setup", read: (t) => `M${t.diffMap}` },
  { key: "drsAvailable", label: "DRS", unit: "", color: "#22d3ee", group: "Setup", read: (t) => fmt.bool(t.drsAvailable) },
  // Env
  { key: "airTempC", label: "AIR", unit: "°C", color: "#7dd3fc", group: "Env", read: (t) => fmt.int(t.airTempC) },
  { key: "trackTempC", label: "TRACK", unit: "°C", color: "#fb923c", group: "Env", read: (t) => fmt.int(t.trackTempC) },
];

/** Build the full registry — static fields plus any runtime `extras` keys. */
export function buildRegistry(t: Telemetry): ChannelDef[] {
  const extras: ChannelDef[] = Object.keys(t.extras ?? {}).map((k) => ({
    key: `extras.${k}`,
    label: k.toUpperCase(),
    unit: "",
    color: "#c084fc",
    group: "Extras" as const,
    read: (tt) => {
      const v = tt.extras?.[k];
      if (typeof v !== "number") return "—";
      return Math.abs(v) >= 100 ? Math.round(v).toString() : v.toFixed(2);
    },
  }));
  return [...STATIC_CHANNELS, ...extras];
}

/* ───────── Persistence ───────── */

const STORAGE_KEY = "pitwall.channels.v2";
const DEFAULT_KEYS = [
  "speedKph", "rpm", "gear", "throttle", "brake", "clutch", "steeringDeg",
  "gLat", "gLon", "fuelRemainingL", "lapsEstimated", "brakeBias",
  "tires.fl.tempC", "tires.fr.tempC", "tires.rl.tempC", "tires.rr.tempC",
  "tires.fl.brakeTempC", "tires.fr.brakeTempC", "tires.rl.brakeTempC", "tires.rr.brakeTempC",
  "tires.fl.brakeLinePress", "tires.fr.brakeLinePress", "tires.rl.brakeLinePress", "tires.rr.brakeLinePress",
  "tires.fl.wearPct", "tires.fr.wearPct", "tires.rl.wearPct", "tires.rr.wearPct",
  "tires.fl.estWearPct", "tires.fr.estWearPct", "tires.rl.estWearPct", "tires.rr.estWearPct"
];

export interface ChannelPrefs {
  visible: string[]; // ordered
  modeByKey?: Record<string, "raw" | "trace">;
  mathExpressions?: MathExpression[];
}

export function loadChannelPrefs(): ChannelPrefs {
  if (typeof window === "undefined") return { visible: DEFAULT_KEYS, modeByKey: {}, mathExpressions: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { visible: DEFAULT_KEYS, modeByKey: {}, mathExpressions: [] };
    const parsed = JSON.parse(raw) as ChannelPrefs;
    if (!Array.isArray(parsed.visible) || parsed.visible.length === 0) {
      return { visible: DEFAULT_KEYS, modeByKey: {}, mathExpressions: [] };
    }
    return {
      visible: parsed.visible,
      modeByKey: parsed.modeByKey ?? {},
      mathExpressions: parsed.mathExpressions ?? [],
    };
  } catch {
    return { visible: DEFAULT_KEYS, modeByKey: {}, mathExpressions: [] };
  }
}

export function saveChannelPrefs(prefs: ChannelPrefs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* quota / private mode — ignore */
  }
}

export const DEFAULT_CHANNEL_KEYS = DEFAULT_KEYS;




