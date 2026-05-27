import type { IbtParsed } from "@/lib/ibt/types";
import { analyzeTires, type TireAnalysis } from "./tires";
import { analyzeDriver, type DriverAnalysis } from "./driver";
import { analyzeHybrid, type HybridAnalysis } from "./hybrid";
import { analyzeAero, type AeroAnalysis } from "./aero";
import { TEAM_PROFILES } from "./profiles";

export interface StintAnalysisReport {
  lapCount: number;
  theoreticalImprovementDelta: number; // e.g. 0.421
  primaryLimitation: string; // e.g. "Rear platform instability under braking"
  criticalFinding: string;
  driverConsistency: string;
  energyLossPct: number;
  setupAdvice: string;
  activeProfileId: "gt3" | "gtp" | "lemans";
  
  tires: TireAnalysis;
  driver: DriverAnalysis;
  hybrid: HybridAnalysis;
  aero: AeroAnalysis;
}

export function compileSessionReport(
  parsed: IbtParsed,
  profileId: "gt3" | "gtp" | "lemans" = "gt3"
): StintAnalysisReport {
  const tires = analyzeTires(parsed);
  const driver = analyzeDriver(parsed);
  const hybrid = analyzeHybrid(parsed);
  const aero = analyzeAero(parsed);

  const profile = TEAM_PROFILES[profileId];
  const lapCount = parsed.laps.length;

  // Bind active profile thermal windows to tire operating envelopes
  const lfTemp = parsed.channels["LFtempCL"]?.data ?? [];
  const rfTemp = parsed.channels["RFtempCL"]?.data ?? [];
  const lrTemp = parsed.channels["LRtempCL"]?.data ?? [];
  const rrTemp = parsed.channels["RRtempCL"]?.data ?? [];

  if (lfTemp.length > 0) {
    const countInRangeForProfile = (arr: Float32Array | number[]) => {
      if (arr.length === 0) return 100;
      const ok = Array.prototype.filter.call(
        arr,
        (t: number) => t >= profile.minOptimalTempC && t <= profile.maxOptimalTempC
      ).length;
      return Math.round((ok / arr.length) * 100);
    };

    tires.flOperatingPct = countInRangeForProfile(lfTemp);
    tires.frOperatingPct = countInRangeForProfile(rfTemp);
    tires.rlOperatingPct = countInRangeForProfile(lrTemp);
    tires.rrOperatingPct = countInRangeForProfile(rrTemp);
    tires.optimalFrictionWindowPct = Math.round(
      (tires.flOperatingPct + tires.frOperatingPct + tires.rlOperatingPct + tires.rrOperatingPct) / 4
    );
  }

  // Synthesize theoretical improvement delta based on driver inconsistency and energy waste
  const releaseScore = driver.releaseVariancePct;
  const wasteScore = hybrid.deploymentWastePct;
  const bottomings = aero.bottomingCount;

  // Dynamic physics sensitivity weights defined by vehicle profile
  const baseDelta = profileId === "gtp" ? 0.10 : profileId === "lemans" ? 0.08 : 0.15;
  const driverDecayFactor = releaseScore * 0.012;
  
  // GTP / LMDh prototypes weight energy waste and grounding stalls significantly higher!
  const energyLossWeight = profileId === "gtp" ? 0.055 : profileId === "lemans" ? 0.015 : 0.035;
  const aeroWeight = profileId === "gtp" ? 0.085 : profileId === "lemans" ? 0.025 : 0.045;

  const energyLossFactor = wasteScore * energyLossWeight;
  const aeroFactor = bottomings * aeroWeight;
  
  const theoreticalImprovementDelta = Number(
    Math.min(1.85, baseDelta + driverDecayFactor + energyLossFactor + aeroFactor).toFixed(3)
  );

  // Identify the Primary Physical Limitation dynamically
  let primaryLimitation = "Front-Right understeer thermal saturation";
  if (bottomings > 3) {
    primaryLimitation = profileId === "gtp" 
      ? "Prototype underbody diffuser flow seal stall grounding" 
      : "Splitter grounding & diffuser vacuum seal collapse";
  } else if (releaseScore > 15) {
    primaryLimitation = "Rear platform yaw instability under trail braking";
  } else if (wasteScore > 5.5) {
    primaryLimitation = "Rear tyre longitudinal exit traction slip";
  }

  // Critical Finding
  let criticalFinding = "";
  if (tires.thermalGrowthFR > 14) {
    criticalFinding = `FR tyre carcass reached ${tires.thermalGrowthFR.toFixed(1)}°C growth, shifting the balance outside optimal grip envelopes.`;
  } else if (bottomings > 0) {
    criticalFinding = `Platform ride height pitch bottomed out ${bottomings} times under high-speed downforce compression.`;
  } else {
    criticalFinding = "Carcass thermals and pressures stabilized with zero severe structural drifts.";
  }

  // Driver consistency summary
  const driverConsistency = `steer rate variance is at ${driver.steerSmoothnessPct}%, brake release profile drift: +${driver.releaseVariancePct}%`;

  // Setup recommendations mapped from profiles
  let setupAdvice = "";
  if (bottomings > 3) {
    setupAdvice = profile.heuristics.aeroAdvice;
  } else if (releaseScore > 15) {
    setupAdvice = profile.heuristics.oversteerAdvice;
  } else if (wasteScore > 5.5) {
    setupAdvice = profile.heuristics.understeerAdvice;
  } else {
    setupAdvice = "Maintain current mechanical suspension parameters. Focus on stabilizing trail-brake deceleration.";
  }

  return {
    lapCount,
    theoreticalImprovementDelta,
    primaryLimitation,
    criticalFinding,
    driverConsistency,
    energyLossPct: hybrid.deploymentWastePct,
    setupAdvice,
    activeProfileId: profileId,
    tires,
    driver,
    hybrid,
    aero,
  };
}
