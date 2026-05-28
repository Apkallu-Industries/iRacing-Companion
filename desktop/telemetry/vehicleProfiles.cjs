/**
 * Pit Wall Motorsport Vehicle Class Dynamic Profiles
 *
 * Defines class-specific vehicle boundaries, sensor thresholds, and aeromechanical
 * limits to guarantee real-world physical realism and eliminate AI reasoning drift.
 */

const VEHICLE_PROFILES = {
  LMGT3: {
    className: "LMGT3",
    simulator: "iRacing",
    physicsProfile: "LMGT3_iRacing",
    physicsProfileVersion: "2.0.2",
    wheelbase: 2.780,          // average GT3 wheelbase (m)
    steeringRatio: 14.5,       // ratio degrees steering to degrees wheels
    lockupThreshold: 0.85,     // wheel speed ratio to body speed below which is locking (with ABS)
    yawSensitivity: 1.0,       // scalar multiplier for yaw rate limits
    bottomOutVelThreshold: 0.12, // shock compression velocity limit (m/s)
    hasAbs: true,
    hasTractionControl: true,
    minAeroSpeedKph: 120.0,
    capabilities: {
      aeroStallDetect: "Medium",
      brakeLockDetect: "High",
      diffInstability: "Medium",
      rideHeightSensitivity: "Medium"
    },
    architecture: {
      drivetrain: "RWD",
      hybrid: false,
      abs: true,
      tc: true,
      aeroDependency: "Medium",
      suspensionStyle: "pushrod",
      tireCategory: "michelin_gt3"
    },
    calibration: {
      source: "empirical_iracing_gt3_analysis",
      sampleSessions: 412,
      lastValidated: "2026-05-28"
    }
  },
  GTP: {
    className: "GTP",
    simulator: "iRacing",
    physicsProfile: "GTP_iRacing",
    physicsProfileVersion: "2.0.2",
    wheelbase: 3.000,          // GTP / LMDh class wheelbase (m)
    steeringRatio: 12.0,
    lockupThreshold: 0.88,     // highly sensitive lockup limits (no ABS or custom race ABS)
    yawSensitivity: 1.5,       // highly responsive rotation
    bottomOutVelThreshold: 0.18, // extreme heave springs bottoming bounds
    hasAbs: false,
    hasTractionControl: true,
    minAeroSpeedKph: 160.0,
    capabilities: {
      aeroStallDetect: "Very High",
      brakeLockDetect: "Very High",
      diffInstability: "Very High",
      rideHeightSensitivity: "Extreme"
    },
    architecture: {
      drivetrain: "RWD",
      hybrid: true,
      abs: false,
      tc: true,
      aeroDependency: "Extreme",
      suspensionStyle: "pushrod",
      tireCategory: "michelin_hypercar"
    },
    calibration: {
      source: "empirical_iracing_gtp_analysis",
      sampleSessions: 320,
      lastValidated: "2026-05-28"
    }
  },
  LMP2: {
    className: "LMP2",
    simulator: "iRacing",
    physicsProfile: "LMP2_iRacing",
    physicsProfileVersion: "2.0.2",
    wheelbase: 3.015,          // LMP2 wheelbase (m)
    steeringRatio: 12.5,
    lockupThreshold: 0.86,
    yawSensitivity: 1.4,
    bottomOutVelThreshold: 0.16,
    hasAbs: false,
    hasTractionControl: true,
    minAeroSpeedKph: 150.0,
    capabilities: {
      aeroStallDetect: "High",
      brakeLockDetect: "High",
      diffInstability: "High",
      rideHeightSensitivity: "High"
    },
    architecture: {
      drivetrain: "RWD",
      hybrid: false,
      abs: false,
      tc: true,
      aeroDependency: "High",
      suspensionStyle: "pushrod",
      tireCategory: "michelin_lmp2"
    },
    calibration: {
      source: "empirical_iracing_lmp2_analysis",
      sampleSessions: 250,
      lastValidated: "2026-05-28"
    }
  },
  NASCAR: {
    className: "NASCAR",
    simulator: "iRacing",
    physicsProfile: "NASCAR_iRacing",
    physicsProfileVersion: "2.0.2",
    wheelbase: 2.800,          // Cup/Xfinity wheelbase (m)
    steeringRatio: 16.0,
    lockupThreshold: 0.78,     // massive locking tolerance (traditional steel brakes, lockups normal)
    yawSensitivity: 0.8,       // heavy rotation lag, entry slides expected
    bottomOutVelThreshold: 0.10,
    hasAbs: false,
    hasTractionControl: false,
    minAeroSpeedKph: 140.0,
    capabilities: {
      aeroStallDetect: "None",
      brakeLockDetect: "Low",
      diffInstability: "High",
      rideHeightSensitivity: "Low"
    },
    architecture: {
      drivetrain: "RWD",
      hybrid: false,
      abs: false,
      tc: false,
      aeroDependency: "Low",
      suspensionStyle: "double_wishbone",
      tireCategory: "goodyear_nascar"
    },
    calibration: {
      source: "empirical_iracing_nascar_analysis",
      sampleSessions: 180,
      lastValidated: "2026-05-28"
    }
  },
  F4: {
    className: "F4",
    simulator: "iRacing",
    physicsProfile: "F4_iRacing",
    physicsProfileVersion: "1.0.1",
    wheelbase: 2.750,
    steeringRatio: 13.5,
    lockupThreshold: 0.82,
    yawSensitivity: 1.2,
    bottomOutVelThreshold: 0.14,
    hasAbs: false,
    hasTractionControl: false,
    minAeroSpeedKph: 100.0,
    capabilities: {
      aeroStallDetect: "Low",
      brakeLockDetect: "Medium",
      diffInstability: "Medium",
      rideHeightSensitivity: "Medium"
    },
    architecture: {
      drivetrain: "RWD",
      hybrid: false,
      abs: false,
      tc: false,
      aeroDependency: "Low",
      suspensionStyle: "double_wishbone",
      tireCategory: "pirelli_f4"
    },
    calibration: {
      source: "empirical_iracing_f4_analysis",
      sampleSessions: 140,
      lastValidated: "2026-05-28"
    }
  },
  SF23: {
    className: "SF23",
    simulator: "iRacing",
    physicsProfile: "SF23_iRacing",
    physicsProfileVersion: "1.0.1",
    wheelbase: 2.950,          // Super Formula wheelbase (m)
    steeringRatio: 11.5,
    lockupThreshold: 0.88,
    yawSensitivity: 1.8,       // extreme rotation capability
    bottomOutVelThreshold: 0.20,
    hasAbs: false,
    hasTractionControl: false,
    minAeroSpeedKph: 180.0,
    capabilities: {
      aeroStallDetect: "Extreme",
      brakeLockDetect: "Very High",
      diffInstability: "High",
      rideHeightSensitivity: "Extreme"
    },
    architecture: {
      drivetrain: "RWD",
      hybrid: false,
      abs: false,
      tc: false,
      aeroDependency: "Extreme",
      suspensionStyle: "pushrod",
      tireCategory: "yokohama_sf"
    },
    calibration: {
      source: "empirical_iracing_sf23_analysis",
      sampleSessions: 160,
      lastValidated: "2026-05-28"
    }
  },
  Rallycross: {
    className: "Rallycross",
    simulator: "iRacing",
    physicsProfile: "Rallycross_iRacing",
    physicsProfileVersion: "1.1.1",
    wheelbase: 2.500,          // Short dirt wheelbase
    steeringRatio: 10.0,       // Ultra-fast steering
    lockupThreshold: 0.45,     // Set to 0.45 slipThreshold
    yawSensitivity: 2.5,       // Extreme sliding/yaw normal
    bottomOutVelThreshold: 0.25, // Soft suspension/jumps
    hasAbs: false,
    hasTractionControl: false,
    minAeroSpeedKph: 80.0,
    capabilities: {
      aeroStallDetect: "None",
      brakeLockDetect: "INFO", // Preserves observability with low severity
      diffInstability: "Very High",
      rideHeightSensitivity: "None"
    },
    detectors: {
      brakeLock: {
        enabled: true,
        severity: "INFO",
        slipThreshold: 0.45,
        minimumDurationMs: 220,
        suppressOnLooseSurface: true
      }
    },
    architecture: {
      drivetrain: "AWD",
      hybrid: false,
      abs: false,
      tc: false,
      aeroDependency: "None",
      suspensionStyle: "long_travel",
      tireCategory: "cooper_rx"
    },
    calibration: {
      source: "empirical_iracing_rx_analysis",
      sampleSessions: 95,
      lastValidated: "2026-05-28"
    }
  },
  Oval: {
    className: "Oval",
    simulator: "iRacing",
    physicsProfile: "Oval_iRacing",
    physicsProfileVersion: "1.0.1",
    wheelbase: 2.800,
    steeringRatio: 15.0,
    lockupThreshold: 0.80,
    yawSensitivity: 0.9,       // Heavy banking rotation lag
    bottomOutVelThreshold: 0.15,
    hasAbs: false,
    hasTractionControl: false,
    minAeroSpeedKph: 160.0,
    capabilities: {
      aeroStallDetect: "Medium",
      brakeLockDetect: "Low",
      diffInstability: "High",
      rideHeightSensitivity: "Low"
    },
    architecture: {
      drivetrain: "RWD",
      hybrid: false,
      abs: false,
      tc: false,
      aeroDependency: "Medium",
      suspensionStyle: "double_wishbone",
      tireCategory: "goodyear_nascar"
    },
    calibration: {
      source: "empirical_iracing_oval_analysis",
      sampleSessions: 110,
      lastValidated: "2026-05-28"
    }
  },
  DEFAULT: {
    className: "DEFAULT",
    simulator: "iRacing",
    physicsProfile: "DEFAULT_iRacing",
    physicsProfileVersion: "1.0.1",
    wheelbase: 2.800,
    steeringRatio: 14.0,
    lockupThreshold: 0.85,
    yawSensitivity: 1.0,
    bottomOutVelThreshold: 0.15,
    hasAbs: true,
    hasTractionControl: true,
    minAeroSpeedKph: 120.0,
    capabilities: {
      aeroStallDetect: "Medium",
      brakeLockDetect: "High",
      diffInstability: "Medium",
      rideHeightSensitivity: "Medium"
    },
    architecture: {
      drivetrain: "RWD",
      hybrid: false,
      abs: true,
      tc: true,
      aeroDependency: "Medium",
      suspensionStyle: "pushrod",
      tireCategory: "michelin_gt3"
    },
    calibration: {
      source: "empirical_default_analysis",
      sampleSessions: 100,
      lastValidated: "2026-05-28"
    }
  }
};

/**
 * Resolves the active vehicle dynamics profile from the simulator car string name.
 *
 * @param {string} carName Active vehicle name
 * @returns {object} Vehicle profile configuration
 */
function resolveVehicleProfile(carName) {
  if (!carName || typeof carName !== "string") return VEHICLE_PROFILES.DEFAULT;
  const name = carName.toLowerCase();

  if (name.includes("gt3") || name.includes("lmgt3") || name.includes("porsche 911 gt3") || name.includes("audi r8 gt3") || name.includes("m4 gt3") || name.includes("amg gt3")) {
    return VEHICLE_PROFILES.LMGT3;
  }
  if (name.includes("gtp") || name.includes("lmdh") || name.includes("bmw m hybrid") || name.includes("porsche 963") || name.includes("cadillac v-series")) {
    return VEHICLE_PROFILES.GTP;
  }
  if (name.includes("lmp2") || name.includes("dallara p217") || name.includes("oreca")) {
    return VEHICLE_PROFILES.LMP2;
  }
  if (name.includes("nascar") || name.includes("cup") || name.includes("xfinity") || name.includes("stockcar")) {
    return VEHICLE_PROFILES.NASCAR;
  }
  if (name.includes("f4") || name.includes("ir-04")) {
    return VEHICLE_PROFILES.F4;
  }
  if (name.includes("sf23") || name.includes("super formula")) {
    return VEHICLE_PROFILES.SF23;
  }
  if (name.includes("rx") || name.includes("rallycross") || name.includes("lites") || name.includes("grx")) {
    return VEHICLE_PROFILES.Rallycross;
  }
  if (name.includes("oval") || name.includes("superspeedway") || name.includes("silver crown") || name.includes("indycar oval")) {
    return VEHICLE_PROFILES.Oval;
  }

  // Fallbacks by broad matching keywords
  if (name.includes("formula") || name.includes("gp") || name.includes("indy")) {
    return VEHICLE_PROFILES.LMP2; // LMP2-like dynamics for open-wheelers
  }
  
  return VEHICLE_PROFILES.DEFAULT;
}

module.exports = {
  VEHICLE_PROFILES,
  resolveVehicleProfile
};
