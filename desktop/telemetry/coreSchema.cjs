/**
 * Canonical CoreTelemetryV1 Schema
 *
 * Defines the strict, motorsport-grade context API contract.
 * Every telemetry channel consists of a structured TelemetryValue:
 * {
 *   value: <primitive>,
 *   confidence: number (0.0 to 1.0),
 *   source: "measured" | "derived" | "heuristic" | "ai",
 *   freshnessMs: number,
 *   provenance: {
 *     derivedFrom: Array<string> | null,
 *     simSource: string | null,
 *     origin: string | null,
 *     tickSource: number | null,
 *     latency: number | null
 *   }
 * }
 */

const SCHEMA_VERSION = 1;

const CoreTelemetryV1 = {
  schemaVersion: SCHEMA_VERSION,
  fields: {
    timestamp: "TelemetryValue<number>", // Epoch timestamp in milliseconds
    sessionTime: "TelemetryValue<number>", // Time in seconds since session start
    frameNumber: "TelemetryValue<number>", // Monotonically increasing tick/frame count
    physicsProfile: "TelemetryValue<string>", // Active vehicle dynamics physics profile
    physicsProfileVersion: "TelemetryValue<string>", // Semantic version of active physics profile

    car: {
      speed: "TelemetryValue<number>", // Meters per second (m/s)
      rpm: "TelemetryValue<number>", // Engine RPM
      gear: "TelemetryValue<number>", // Gear (-1 = Reverse, 0 = Neutral, 1+ = Forward)
      inputs: {
        throttle: "TelemetryValue<number>", // 0.0 to 1.0
        brake: "TelemetryValue<number>", // 0.0 to 1.0
        clutch: "TelemetryValue<number>", // 0.0 to 1.0
        steering: "TelemetryValue<number>", // Steering wheel angle in radians
      },
    },

    lap: {
      currentLap: "TelemetryValue<number>", // Current lap number
      lapDistPct: "TelemetryValue<number>", // Progress around track (0.0 to 1.0)
      lapTimeCurrent: "TelemetryValue<number>", // Time elapsed in current lap (seconds)
      lapTimeLast: "TelemetryValue<number>", // Completed time of previous lap (seconds)
    },

    // Derived engineering channels (Phase 2)
    derived: {
      wheelbase: "TelemetryValue<number>",
      steeringVelocity: "TelemetryValue<number>",
      throttleGradient: "TelemetryValue<number>",
      brakeGradient: "TelemetryValue<number>",
      actualYawRate: "TelemetryValue<number>",
      expectedYawRate: "TelemetryValue<number>",
      understeerIndex: "TelemetryValue<number>",
      oversteerIndex: "TelemetryValue<number>",
    },

    // Stateful continuous observers (Phase 8)
    estimation: {
      rollingConfidence: "Record<string, TelemetryValue<number>>",
      fusionSignals: "Record<string, TelemetryValue<number>>",
      subsystemHealth: "Record<string, TelemetryValue<number>>",
      hypotheses: "Record<string, TelemetryValue<number>>",
    },
  },
};

module.exports = {
  SCHEMA_VERSION,
  CoreTelemetryV1,
};
