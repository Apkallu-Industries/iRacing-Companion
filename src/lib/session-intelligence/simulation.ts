import type { StintAnalysisReport } from "./index";

export interface SetupAdjustment {
  rearReboundClicks: number; // e.g. +1, -2
  rearAntiRollBar: number; // e.g. +1, -1
  frontBrakeBias: number; // e.g. +0.5, -0.2
  frontPackerClicks: number; // e.g. +1, -1
}

export interface SimulationResult {
  theoreticalDeltaDelta: number; // e.g. -0.145s (negative is improvement)
  predictedRakeStability: number; // percentage (0-100)
  predictedRearTraction: number; // percentage (0-100)
  predictedThermalSaturation: number; // percentage (0-100)
  feedbackLog: string[];
}

/**
 * Simulates the physical vehicle dynamics consequences of making mechanical setup adjustments
 * by applying sensitivity equations to a stint's baseline analysis parameters.
 */
export function simulateSetupAdjustment(
  adj: SetupAdjustment,
  base: StintAnalysisReport,
): SimulationResult {
  const feedbackLog: string[] = [];

  // Calculate baseline metrics (0 to 100 rating scale)
  let baseRakeStability = Math.max(20, Math.min(98, 100 - base.aero.bottomingCount * 12));
  let baseRearTraction = Math.max(30, Math.min(98, 100 - base.hybrid.deploymentWastePct * 8));
  let baseThermalSaturation = Math.max(
    25,
    Math.min(98, 100 - (base.tires.thermalGrowthFR - 10) * 6),
  );

  // Initialize delta updates
  let deltaTime = 0;
  let rakeStabilityChange = 0;
  let rearTractionChange = 0;
  let thermalSaturationChange = 0;

  // 1. REAR REBOUND DAMPING CLICK SENSITIVITY
  if (adj.rearReboundClicks !== 0) {
    const clicks = adj.rearReboundClicks;
    if (clicks > 0) {
      // Stiffening rear rebound slows rear axle weight unloading on corner entry
      rakeStabilityChange += clicks * 3.5;
      rearTractionChange += clicks * 1.5;
      deltaTime -= clicks * 0.045; // gains time due to stable trail release
      feedbackLog.push(
        `STIFFEN REAR REBOUND (+${clicks} clicks): Slows rear axle vertical load transfer rate on trail brake entry, raising rake stability by +${(clicks * 3.5).toFixed(1)}% and optimizing transient diffuser flow.`,
      );
    } else {
      // Softening rear rebound causes nose pitch oscillations
      rakeStabilityChange += clicks * 5.0;
      deltaTime -= clicks * 0.02; // minor time penalty
      feedbackLog.push(
        `SOFTEN REAR REBOUND (${clicks} clicks): Speeds rear extension, causing transient rake pitch oscillations under deceleration (-${Math.abs(clicks * 5).toFixed(1)}% stability).`,
      );
    }
  }

  // 2. REAR ANTI-ROLL BAR STIFFNESS SENSITIVITY
  if (adj.rearAntiRollBar !== 0) {
    const bar = adj.rearAntiRollBar;
    if (bar < 0) {
      // Softening rear anti-roll bar expands exit traction contact patch
      rearTractionChange += Math.abs(bar) * 6.5;
      thermalSaturationChange += Math.abs(bar) * 2.0;
      deltaTime -= Math.abs(bar) * 0.065; // gains exit speed
      feedbackLog.push(
        `SOFTEN REAR ANTI-ROLL BAR (${bar} steps): Expands exit tyre footprint contact patch, reducing exit longitudinal driven wheel slip (+${(Math.abs(bar) * 6.5).toFixed(1)}% exit traction).`,
      );
    } else {
      // Stiffening roll bar causes rapid driven slip overloading
      rearTractionChange -= bar * 7.0;
      thermalSaturationChange -= bar * 3.0;
      deltaTime += bar * 0.05;
      feedbackLog.push(
        `STIFFEN REAR ANTI-ROLL BAR (+${bar} steps): Saturation bounds of driven tyre lateral stiffness breached. Increases exit longitudinal wheelspin frequency.`,
      );
    }
  }

  // 3. FRONT BRAKE BIAS MIGRATION
  if (adj.frontBrakeBias !== 0) {
    const bias = adj.frontBrakeBias;
    if (bias > 0) {
      // Shifting bias forward reduces front-entry lockup threshold risks
      thermalSaturationChange += bias * 8.0;
      deltaTime -= bias * 0.055;
      feedbackLog.push(
        `SHIFT BRAKE BIAS FORWARD (+${bias.toFixed(1)}%): Decreases front axle local tyre sliding friction probability. Reduces peak carcass thermal growth rate on corner deceleration.`,
      );
    } else {
      // Shifting bias backward triggers rear locked sliding rotation
      rakeStabilityChange -= Math.abs(bias) * 6.0;
      deltaTime += Math.abs(bias) * 0.07;
      feedbackLog.push(
        `SHIFT BRAKE BIAS BACKWARD (${bias.toFixed(1)}%): Exposes rear axle lockup threat during entry lateral loading. Destabilizes transient yaw rates.`,
      );
    }
  }

  // 4. FRONT PACKER HEAVE COMPRESSION damping
  if (adj.frontPackerClicks !== 0) {
    const packers = adj.frontPackerClicks;
    if (packers > 0) {
      // More packer packer clicks blocks bottoming collapse
      rakeStabilityChange += packers * 8.5;
      deltaTime -= packers * 0.075;
      feedbackLog.push(
        `RAISE FRONT PACKERS (+${packers} clicks): Restricts dynamic suspension displacement bounds. Prevents splitter grounding bottoming under downforce heave, securing diffuser seal integrity (+${(packers * 8.5).toFixed(1)}% aero stability).`,
      );
    } else {
      rakeStabilityChange += packers * 9.0;
      deltaTime -= packers * 0.03;
      feedbackLog.push(
        `LOWER FRONT PACKERS (${packers} clicks): Allows nose pitch bounds expansion, increasing diffuser seal stall grounding events.`,
      );
    }
  }

  // Add default log if no adjustments are made
  if (feedbackLog.length === 0) {
    feedbackLog.push(
      "No setup adjustments applied. Simulated vehicle dynamics feedback conforms to stint baseline parameters.",
    );
  }

  return {
    theoreticalDeltaDelta: Number(deltaTime.toFixed(3)),
    predictedRakeStability: Math.max(
      10,
      Math.min(99, Math.round(baseRakeStability + rakeStabilityChange)),
    ),
    predictedRearTraction: Math.max(
      10,
      Math.min(99, Math.round(baseRearTraction + rearTractionChange)),
    ),
    predictedThermalSaturation: Math.max(
      10,
      Math.min(99, Math.round(baseThermalSaturation + thermalSaturationChange)),
    ),
    feedbackLog,
  };
}
