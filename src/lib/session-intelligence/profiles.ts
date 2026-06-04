export interface TeamKnowledgeProfile {
  id: "gt3" | "gtp" | "lemans";
  label: string;
  subClass: string;
  minOptimalTempC: number;
  maxOptimalTempC: number;
  criticalPitchLimitRad: number;
  wheelspinMismatchLimitPct: number;
  primaryFocus: string;
  scannerSensitivities: {
    brakeThreshold: number;
    durationSec: number;
  };
  heuristics: {
    oversteerAdvice: string;
    understeerAdvice: string;
    aeroAdvice: string;
  };
  physicsModels: {
    tireThermalGrowthRatio: number;
    aeroVacuumSensitivity: number; // pitch sensitivity index
    brakeMigrationRatio: number;
    ersWeightingFactor: number;
  };
}

export const TEAM_PROFILES: Record<"gt3" | "gtp" | "lemans", TeamKnowledgeProfile> = {
  gt3: {
    id: "gt3",
    label: "GT3 Category Profile",
    subClass: "GT3 Grand Touring / Sprint-Enduro Class",
    minOptimalTempC: 75,
    maxOptimalTempC: 95,
    criticalPitchLimitRad: -0.015,
    wheelspinMismatchLimitPct: 0.12, // 12% speed diff limit
    primaryFocus:
      "Tyre core carcass thermal growth, trail-brake release profiles, and mechanical bias migration.",
    scannerSensitivities: {
      brakeThreshold: 0.82,
      durationSec: 0.15,
    },
    heuristics: {
      oversteerAdvice:
        "Soften rear anti-roll bar or raise front packer high-speed compression damping.",
      understeerAdvice:
        "Shift initial brake bias forward, soften front spring rates, or lower front ride height.",
      aeroAdvice:
        "Raise packers high-speed compression compression damping to slow deceleration pitch rake.",
    },
    physicsModels: {
      tireThermalGrowthRatio: 1.15,
      aeroVacuumSensitivity: 0.45,
      brakeMigrationRatio: 0.62,
      ersWeightingFactor: 0.0,
    },
  },
  gtp: {
    id: "gtp",
    label: "GTP/LMDh Hybrid Profile",
    subClass: "Le Mans Daytona Hybrid / Prototype Class",
    minOptimalTempC: 85,
    maxOptimalTempC: 110,
    criticalPitchLimitRad: -0.009, // Prototypes are extremely low and pitch-sensitive!
    wheelspinMismatchLimitPct: 0.08, // 8% limit due to advanced MGU-K deploy
    primaryFocus:
      "Hybrid battery SoC decay curves, underbody diffuser vacuum flow seal compression, and straightaway kW deploy sweeps.",
    scannerSensitivities: {
      brakeThreshold: 0.78,
      durationSec: 0.1,
    },
    heuristics: {
      oversteerAdvice:
        "Soften rear rebound dampers to anchor the diffuser downforce seal under driven exit torque.",
      understeerAdvice:
        "Recalibrate MGU-K exit harvest parameters to mitigate tire braking load transfer.",
      aeroAdvice:
        "Increase packer mechanical packer stops by +1.5mm to restrict high-speed splitter Grounding.",
    },
    physicsModels: {
      tireThermalGrowthRatio: 1.35,
      aeroVacuumSensitivity: 0.92,
      brakeMigrationRatio: 0.78,
      ersWeightingFactor: 0.88,
    },
  },
  lemans: {
    id: "lemans",
    label: "Low-Drag Le Mans Profile",
    subClass: "Low-Downforce straightaway efficiency setting",
    minOptimalTempC: 70,
    maxOptimalTempC: 90,
    criticalPitchLimitRad: -0.018,
    wheelspinMismatchLimitPct: 0.14,
    primaryFocus:
      "Aerodynamic lift-and-coast fuel burn efficiency, straightaway top-speed decay, and drag coefficient profiles.",
    scannerSensitivities: {
      brakeThreshold: 0.85,
      durationSec: 0.2,
    },
    heuristics: {
      oversteerAdvice: "Slide wing angle to maximize rear horizontal flow drag profile recovery.",
      understeerAdvice: "Raise mechanical rake by raising rear ride heights +1.0mm.",
      aeroAdvice:
        "Optimize splitter endplates and adjust wing trim levels to preserve top-speed vector coefficients.",
    },
    physicsModels: {
      tireThermalGrowthRatio: 1.05,
      aeroVacuumSensitivity: 0.35,
      brakeMigrationRatio: 0.55,
      ersWeightingFactor: 0.12,
    },
  },
};

import { useState, useEffect } from "react";
import { fetchTeamProfiles } from "./mongoSessionStore";

export function useDynamicTeamProfiles() {
  const [profiles, setProfiles] = useState<Record<string, TeamKnowledgeProfile>>(TEAM_PROFILES);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const dbProfiles = await fetchTeamProfiles();
      if (dbProfiles && dbProfiles.length > 0) {
        const mapped = {} as Record<string, TeamKnowledgeProfile>;
        dbProfiles.forEach((p) => {
          mapped[p.id] = p;
        });
        // merge defaults with db values
        setProfiles({ ...TEAM_PROFILES, ...mapped });
      } else {
        setProfiles(TEAM_PROFILES);
      }
    } catch {
      setProfiles(TEAM_PROFILES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { profiles, loading, refresh };
}
