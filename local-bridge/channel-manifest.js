/**
 * Channel manifest builder for Pit Wall.
 * Extracts channel metadata from irsdk-node and creates a manifest
 * that matches the .ibt parser's expectations.
 */

const IBT_TYPE = {
  Char: 0,
  Bool: 1,
  Int: 2,
  Bitfield: 3,
  Float: 4,
  Double: 5,
};

/**
 * Build a channels manifest from raw irsdk telemetry data.
 * Returns an array of channel descriptors suitable for MongoDB storage.
 */
function buildChannelsManifest(rawTelemetry) {
  const manifest = [];
  const seen = new Set();

  if (!rawTelemetry || typeof rawTelemetry !== "object") {
    return manifest;
  }

  for (const [key, variable] of Object.entries(rawTelemetry)) {
    if (!key || !variable || typeof variable !== "object") continue;

    const value = variable.value !== undefined ? variable.value : variable;

    if (Array.isArray(value)) {
      // Explode arrays into individual channels: Name_0, Name_1, etc.
      // Cap at 64 (covers CarIdx channels for up to 64 cars)
      const count = Math.min(value.length, 64);
      for (let i = 0; i < count; i++) {
        const elementKey = `${key}_${i}`;
        if (!seen.has(elementKey)) {
          seen.add(elementKey);
          const type = inferType(value[i]);
          manifest.push({
            name: elementKey,
            type: type,
            unit: inferUnit(key),
            description: `${key}[${i}]`,
            group: inferGroup(key),
          });
        }
      }
    } else {
      // Scalar channel
      if (!seen.has(key)) {
        seen.add(key);
        const type = inferType(value);
        manifest.push({
          name: key,
          type: type,
          unit: inferUnit(key),
          description: key,
          group: inferGroup(key),
        });
      }
    }
  }

  return manifest;
}

/**
 * Infer IBT type from JavaScript value.
 */
function inferType(value) {
  if (typeof value === "boolean") return IBT_TYPE.Bool;
  if (typeof value === "number") {
    if (Number.isInteger(value)) return IBT_TYPE.Int;
    return IBT_TYPE.Float; // Treat all floats as Float32 (safe for iRacing)
  }
  return IBT_TYPE.Float; // Default to Float
}

/**
 * Infer unit string from channel name.
 */
function inferUnit(name) {
  const n = name.toLowerCase();
  if (/speed|velocity|speedms/i.test(n)) return "m/s";
  if (/rpm|enginerpm/i.test(n)) return "rpm";
  if (/temp|tempf|tempc/i.test(n)) return n.includes("f") ? "°F" : "°C";
  if (/pressure|press|kpa|psi/i.test(n)) return n.includes("psi") ? "psi" : "kPa";
  if (/(throttle|brake|clutch|steer)/i.test(n)) return n.includes("angle") ? "deg" : "%";
  if (/gear/i.test(n)) return "gear";
  if (/fuel/i.test(n)) return "L";
  if (/accel|g|lat|lon/i.test(n)) return "G";
  if (/time|duration/i.test(n)) return "s";
  if (/distance/i.test(n)) return "m";
  if (/angle|yaw|pitch|roll/i.test(n)) return "rad";
  return "";
}

/**
 * Infer telemetry group from channel name.
 */
function inferGroup(name) {
  const n = name.toLowerCase();
  if (/(throttle|brake|clutch|steer|handbrake|driver)/i.test(n)) return "Driver Inputs";
  if (/(speed|velocity|accel|yaw|pitch|roll|gear|rpm|enginerpm|track)/i.test(n)) return "Vehicle";
  if (/(fuel|engine|oil|water|coolant|mgu|battery|kers|drs|boost|manifold)/i.test(n))
    return "Engine";
  if (
    /(tire|tyre|temp|press|carcass|tread|wear|cf|cm|cl|lf|rf|lr|rr)/i.test(n) &&
    /(temp|press|wear|tread|cold|carcass)/i.test(n)
  )
    return "Tires";
  if (/(shock|spring|ride|damper|susp|arb|height|defl)/i.test(n)) return "Suspension";
  if (/(session|lap|race|incident|flag|pit|track|surface|sector)/i.test(n)) return "Session";
  if (/(weather|wind|air|track(temp|surface|wetness|usage)|humidity|skies|fog|precip)/i.test(n))
    return "Environment";
  if (/(cpu|fps|frame|gpu|mem|latency|ping)/i.test(n)) return "System";
  return "Other";
}

/**
 * Flatten telemetry data to numeric/boolean only.
 * Returns a flat object with scalar values (arrays exploded to Name_0, Name_1, ...).
 */
function flattenTelemetry(raw) {
  const result = {};

  if (!raw || typeof raw !== "object") {
    return result;
  }

  for (const [key, variable] of Object.entries(raw)) {
    if (!key || !variable || typeof variable !== "object") continue;

    const value = variable.value !== undefined ? variable.value : variable;

    if (Array.isArray(value)) {
      // Explode arrays
      const count = Math.min(value.length, 64);
      for (let i = 0; i < count; i++) {
        const val = value[i];
        if (typeof val === "number" && Number.isFinite(val)) {
          result[`${key}_${i}`] = val;
        } else if (typeof val === "boolean") {
          result[`${key}_${i}`] = val ? 1 : 0;
        }
      }
    } else if (typeof value === "number" && Number.isFinite(value)) {
      result[key] = value;
    } else if (typeof value === "boolean") {
      result[key] = value ? 1 : 0;
    }
  }

  return result;
}

module.exports = {
  buildChannelsManifest,
  flattenTelemetry,
  inferType,
  inferUnit,
  inferGroup,
  IBT_TYPE,
};
