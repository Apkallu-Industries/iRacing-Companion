/**
 * Pit Wall Telemetry Normalizer
 *
 * Stateless utility to map raw/heterogeneous simulator packets into
 * the strict CoreTelemetryV1 schema format with structured TelemetryValues.
 */

const { SCHEMA_VERSION } = require("./coreSchema.cjs");
const { resolveVehicleProfile } = require("./vehicleProfiles.cjs");

/**
 * Creates a standard TelemetryValue wrapper for measured channels.
 */
function measuredVal(value, simSource, origin = "iRacing", tickSource = 0, latency = 0) {
  const freshness = typeof latency === "number" && latency >= 0 ? latency : 0;
  return {
    value,
    confidence: 1.0,
    source: "measured",
    freshnessMs: freshness,
    provenance: {
      derivedFrom: null,
      simSource: simSource || null,
      origin: origin || "iRacing",
      tickSource: typeof tickSource === "number" ? tickSource : 0,
      latency: freshness
    }
  };
}

/**
 * Normalizes steering input. If the input steering is labeled as degrees (e.g. steeringDeg),
 * it converts it to radians. Otherwise assumes radians.
 */
function normalizeSteering(raw, origin, tickSource, latency) {
  const freshness = typeof latency === "number" && latency >= 0 ? latency : 0;
  if (typeof raw.steering === "number") {
    return measuredVal(raw.steering, "steering", origin, tickSource, latency);
  }
  if (typeof raw.SteeringWheelAngle === "number") {
    return measuredVal(raw.SteeringWheelAngle, "SteeringWheelAngle", origin, tickSource, latency);
  }
  if (typeof raw.steeringDeg === "number") {
    const val = (raw.steeringDeg * Math.PI) / 180;
    return {
      value: val,
      confidence: 1.0,
      source: "measured",
      freshnessMs: freshness,
      provenance: {
        derivedFrom: ["steeringDeg"],
        simSource: "steeringDeg",
        origin: origin || "iRacing",
        tickSource,
        latency
      }
    };
  }
  if (typeof raw.SteeringWheelAngleDeg === "number") {
    const val = (raw.SteeringWheelAngleDeg * Math.PI) / 180;
    return {
      value: val,
      confidence: 1.0,
      source: "measured",
      freshnessMs: freshness,
      provenance: {
        derivedFrom: ["SteeringWheelAngleDeg"],
        simSource: "SteeringWheelAngleDeg",
        origin: origin || "iRacing",
        tickSource,
        latency
      }
    };
  }
  return measuredVal(0, null, origin, tickSource, latency);
}

/**
 * Normalizes speed to meters per second (m/s).
 */
function normalizeSpeed(raw, origin, tickSource, latency) {
  const freshness = typeof latency === "number" && latency >= 0 ? latency : 0;
  if (typeof raw.Speed === "number") {
    return measuredVal(raw.Speed, "Speed", origin, tickSource, latency);
  }
  if (typeof raw.speed === "number") {
    return measuredVal(raw.speed, "speed", origin, tickSource, latency);
  }
  if (typeof raw.speedKph === "number") {
    return {
      value: raw.speedKph / 3.6,
      confidence: 1.0,
      source: "measured",
      freshnessMs: freshness,
      provenance: {
        derivedFrom: ["speedKph"],
        simSource: "speedKph",
        origin: origin || "iRacing",
        tickSource,
        latency
      }
    };
  }
  if (typeof raw.SpeedKph === "number") {
    return {
      value: raw.SpeedKph / 3.6,
      confidence: 1.0,
      source: "measured",
      freshnessMs: freshness,
      provenance: {
        derivedFrom: ["SpeedKph"],
        simSource: "SpeedKph",
        origin: origin || "iRacing",
        tickSource,
        latency
      }
    };
  }
  if (typeof raw.speedMph === "number") {
    return {
      value: raw.speedMph * 0.44704,
      confidence: 1.0,
      source: "measured",
      freshnessMs: freshness,
      provenance: {
        derivedFrom: ["speedMph"],
        simSource: "speedMph",
        origin: origin || "iRacing",
        tickSource,
        latency
      }
    };
  }
  return measuredVal(0, null, origin, tickSource, latency);
}

/**
 * Stateless normalizer. Maps a raw packet to a strict CoreTelemetryV1 schema frame.
 * All enqueued fields conform to TelemetryValue data structures.
 *
 * @param {any} raw Raw simulator packet
 * @returns {object} Strict CoreTelemetryV1 frame with TelemetryValue fields
 */
function normalizeCoreTelemetry(raw) {
  if (!raw || typeof raw !== "object") {
    return createDefaultFrame();
  }

  // 1. Session Metadata
  const timestamp = Number(raw.timestamp ?? raw.ts ?? Date.now());
  const sessionTime = Number(raw.sessionTime ?? raw.SessionTime ?? raw.st ?? 0);
  const frameNumber = Number(raw.frameNumber ?? raw.SessionTick ?? raw.tick ?? raw.frame ?? 0);

  // 1b. Physics Profile Metadata
  const carName = raw.car ?? raw.Car ?? "default";
  const profile = resolveVehicleProfile(carName);
  const physicsProfile = profile.physicsProfile || "DEFAULT_iRacing";
  const physicsProfileVersion = profile.physicsProfileVersion || "1.0.0";

  // 2. Dynamic Provenance Indicators
  const origin = raw.simulator ?? raw.Simulator ?? "iRacing";
  const tickSource = frameNumber;
  const latency = Math.max(0, Date.now() - timestamp);

  // 3. Car state & inputs mapping
  const speedVal = normalizeSpeed(raw, origin, tickSource, latency);
  const rpm = Number(raw.rpm ?? raw.RPM ?? raw.Rpm ?? 0);
  const gear = Number(raw.gear ?? raw.Gear ?? 0);

  // Inputs
  const throttle = Number(raw.throttle ?? raw.Throttle ?? raw.throttleRaw ?? 0);
  const brake = Number(raw.brake ?? raw.Brake ?? raw.brakeRaw ?? 0);
  const clutch = Number(raw.clutch ?? raw.Clutch ?? 0);
  const steeringVal = normalizeSteering(raw, origin, tickSource, latency);

  // 4. Lap & timing
  const currentLap = Number(raw.currentLap ?? raw.Lap ?? raw.lap ?? 1);
  const lapDistPct = Number(raw.lapDistPct ?? raw.LapDistPct ?? 0);
  const lapTimeCurrent = Number(raw.lapTimeCurrent ?? raw.LapCurrentLapTime ?? raw.lapCurrentLapTime ?? 0);
  const lapTimeLast = Number(raw.lapTimeLast ?? raw.LapLastLapTime ?? raw.lapLastLapTimeSec ?? raw.lapLastLapTime ?? 0);

  return {
    schemaVersion: SCHEMA_VERSION,
    timestamp: measuredVal(timestamp, "timestamp", origin, tickSource, latency),
    sessionTime: measuredVal(sessionTime, "sessionTime", origin, tickSource, latency),
    frameNumber: measuredVal(frameNumber, "frameNumber", origin, tickSource, latency),
    physicsProfile: measuredVal(physicsProfile, "car", origin, tickSource, latency),
    physicsProfileVersion: measuredVal(physicsProfileVersion, "car", origin, tickSource, latency),
    car: {
      speed: speedVal,
      rpm: measuredVal(rpm, raw.RPM ? "RPM" : "rpm", origin, tickSource, latency),
      gear: measuredVal(gear, raw.Gear ? "Gear" : "gear", origin, tickSource, latency),
      inputs: {
        throttle: measuredVal(throttle, raw.Throttle ? "Throttle" : "throttle", origin, tickSource, latency),
        brake: measuredVal(brake, raw.Brake ? "Brake" : "brake", origin, tickSource, latency),
        clutch: measuredVal(clutch, raw.Clutch ? "Clutch" : "clutch", origin, tickSource, latency),
        steering: steeringVal
      }
    },
    lap: {
      currentLap: measuredVal(currentLap, raw.Lap ? "Lap" : "currentLap", origin, tickSource, latency),
      lapDistPct: measuredVal(lapDistPct, raw.LapDistPct ? "LapDistPct" : "lapDistPct", origin, tickSource, latency),
      lapTimeCurrent: measuredVal(lapTimeCurrent, raw.LapCurrentLapTime ? "LapCurrentLapTime" : "lapTimeCurrent", origin, tickSource, latency),
      lapTimeLast: measuredVal(lapTimeLast, raw.LapLastLapTime ? "LapLastLapTime" : "lapTimeLast", origin, tickSource, latency)
    }
  };
}

/**
 * Returns a zero-state clean CoreTelemetryV1 frame.
 */
function createDefaultFrame() {
  const ts = Date.now();
  return {
    schemaVersion: SCHEMA_VERSION,
    timestamp: measuredVal(ts, null, "iRacing", 0, 0),
    sessionTime: measuredVal(0, null, "iRacing", 0, 0),
    frameNumber: measuredVal(0, null, "iRacing", 0, 0),
    physicsProfile: measuredVal("DEFAULT_iRacing", null, "iRacing", 0, 0),
    physicsProfileVersion: measuredVal("1.0.0", null, "iRacing", 0, 0),
    car: {
      speed: measuredVal(0, null, "iRacing", 0, 0),
      rpm: measuredVal(0, null, "iRacing", 0, 0),
      gear: measuredVal(0, null, "iRacing", 0, 0),
      inputs: {
        throttle: measuredVal(0, null, "iRacing", 0, 0),
        brake: measuredVal(0, null, "iRacing", 0, 0),
        clutch: measuredVal(0, null, "iRacing", 0, 0),
        steering: measuredVal(0, null, "iRacing", 0, 0)
      }
    },
    lap: {
      currentLap: measuredVal(1, null, "iRacing", 0, 0),
      lapDistPct: measuredVal(0, null, "iRacing", 0, 0),
      lapTimeCurrent: measuredVal(0, null, "iRacing", 0, 0),
      lapTimeLast: measuredVal(0, null, "iRacing", 0, 0)
    },
    estimation: {
      rollingConfidence: {},
      fusionSignals: {},
      subsystemHealth: {
        aeroPlatform: measuredVal(1.0, null, "iRacing", 0, 0),
        rearStability: measuredVal(1.0, null, "iRacing", 0, 0),
        brakeMigration: measuredVal(1.0, null, "iRacing", 0, 0),
        hybridDeployment: measuredVal(1.0, null, "iRacing", 0, 0)
      },
      hypotheses: {
        floorDamage: measuredVal(0.05, null, "iRacing", 0, 0),
        diffuserChoking: measuredVal(0.01, null, "iRacing", 0, 0),
        tireDegradation: measuredVal(0.05, null, "iRacing", 0, 0),
        brakeOverheating: measuredVal(0.01, null, "iRacing", 0, 0)
      }
    }
  };
}

module.exports = {
  normalizeCoreTelemetry,
  createDefaultFrame,
  measuredVal
};
