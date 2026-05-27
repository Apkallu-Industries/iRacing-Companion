/**
 * objectiveModes.ts — Tactical Session Objective Modes Configuration
 *
 * Exposes core configs adjusting scanner sensitivities, ERS deployments,
 * fuel conservation targets, and cognitive narrative briefing tones.
 */

export type SessionObjectiveMode =
  | "QUALIFYING_ATTACK"
  | "RACE_STINT"
  | "FUEL_SAVE"
  | "SAFETY_CAR"
  | "OUTLAP"
  | "TIRE_WARMUP"
  | "DEFENSIVE_TRAFFIC";

export interface ObjectiveConstraints {
  modeName: string;
  wheelspinSensitivityCoeff: number; // multiplier (lower = triggers scanner more easily)
  brakeLockupThreshold: number;      // base brake threshold before warning
  ersDeployWeightFactor: number;     // torque deploy multiplier limits
  fuelTargetPerLapL: number;         // target fuel burn constraint
  aiNarrativeTone: string;
}

export const OBJECTIVE_CONFIGS: Record<SessionObjectiveMode, ObjectiveConstraints> = {
  QUALIFYING_ATTACK: {
    modeName: "Qualifying Hotlap Attack",
    wheelspinSensitivityCoeff: 0.70, // highly sensitive, warn about minor wheel slips
    brakeLockupThreshold: 0.85,      // push braking targets to maximum footprint threshold
    ersDeployWeightFactor: 1.15,     // maximize hybrid discharge straightaway Torques
    fuelTargetPerLapL: 5.5,          // ignore consumption, maximize energy
    aiNarrativeTone: "aggressive, performance-hyperfocused, emphasizing peak tire grip vectors and deceleration precision",
  },
  RACE_STINT: {
    modeName: "Standard Race Stint",
    wheelspinSensitivityCoeff: 1.0,
    brakeLockupThreshold: 0.80,
    ersDeployWeightFactor: 1.0,
    fuelTargetPerLapL: 3.65,
    aiNarrativeTone: "restrained, structural, focusing on carcass thermal conservation and pace variance consistency",
  },
  FUEL_SAVE: {
    modeName: "Strategic Lift-and-Coast Fuel Conservation",
    wheelspinSensitivityCoeff: 1.3,  // tolerate more exit slippage if momentum is preserved
    brakeLockupThreshold: 0.72,      // softer entry deceleration, maximize coasting
    ersDeployWeightFactor: 0.85,     // detune battery straightaway sweeps to prolong SoC reserves
    fuelTargetPerLapL: 3.0,          // target severe lift-and-coast consumption levels
    aiNarrativeTone: "conservation-focused, calculating exact lift-and-coast points and hybrid efficiency decays",
  },
  SAFETY_CAR: {
    modeName: "Safety Car Pace & Heat Conservation",
    wheelspinSensitivityCoeff: 1.5,
    brakeLockupThreshold: 0.60,
    ersDeployWeightFactor: 0.50,
    fuelTargetPerLapL: 1.2,
    aiNarrativeTone: "thermal-focused, advising on brake drag surface sweeps to preserve tire carcass temperatures",
  },
  OUTLAP: {
    modeName: "Outlap Surface Scuffing",
    wheelspinSensitivityCoeff: 1.2,
    brakeLockupThreshold: 0.70,
    ersDeployWeightFactor: 0.90,
    fuelTargetPerLapL: 3.8,
    aiNarrativeTone: "surface scuffing focus, highlighting tire pressure growth thresholds and brake drum heats",
  },
  TIRE_WARMUP: {
    modeName: "Carcass Core Thermal Induction",
    wheelspinSensitivityCoeff: 0.90,
    brakeLockupThreshold: 0.75,
    ersDeployWeightFactor: 0.95,
    fuelTargetPerLapL: 4.0,
    aiNarrativeTone: "thermal-building focus, analyzing steering load sweeps to accelerate carcass expansion",
  },
  DEFENSIVE_TRAFFIC: {
    modeName: "Defensive Traffic Positioning",
    wheelspinSensitivityCoeff: 0.85,
    brakeLockupThreshold: 0.78,
    ersDeployWeightFactor: 1.10, // high deploy prioritization to defend straightaways
    fuelTargetPerLapL: 3.5,
    aiNarrativeTone: "defensive, highlighting aerodynamic wash boundaries and cooling degradation velocities",
  },
};

/**
 * Returns specific tactical objective constraints for a given mode.
 */
export function getObjectiveConstraints(mode: SessionObjectiveMode): ObjectiveConstraints {
  return OBJECTIVE_CONFIGS[mode] || OBJECTIVE_CONFIGS.RACE_STINT;
}
