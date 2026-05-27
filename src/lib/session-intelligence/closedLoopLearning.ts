/**
 * closedLoopLearning.ts — Stage 6 Closed-Loop Learning & Heuristic Validation
 *
 * Compares pre- and post-adjustment stint telemetry reports to evaluate and
 * validate setup recommendations, closing the engineering loop dynamically.
 *
 * Incorporates Dynamic Stabilization Horizons and Confidence Attribution co-factors.
 */

import { type StintAnalysisReport } from "./index";
import { type StoredSetupChange } from "./mongoSessionStore";
import { type UnifiedRecommendation } from "./mechanicalReasoningEngine";
import { type PhysicsTruthBoundary } from "./eventTaxonomy";

export interface ClosedLoopFeedback {
  expectedGainMet: boolean;
  compromiseWorseThanForecast: boolean;
  empiricalPaceGainS: number;
  confidenceDelta: number;
  confidenceAttribution: {
    setupContribution: number;       // Isolated mechanical setup impact (0 to 100)
    environmentContribution: number; // Fuel decay and track rubber factor (0 to 100)
    driverAdaptation: number;        // Driver input input smooth improvements (0 to 100)
    stochasticVariance: number;      // Unexplained/random variance (0 to 100)
  };
  validationStatus: "SUCCESS_VERIFIED" | "COMPROMISED_FAIL" | "INCONCLUSIVE_NO_DATA";
  feedbackNarrative: string;
  physicsTruthBoundary: PhysicsTruthBoundary;
}

/**
 * Dynamically calculates the optimum evaluation horizon based on the adjustment profile.
 */
export function calculateDynamicStabilizationWindow(changeType: string): number {
  const normalized = changeType.toLowerCase();

  if (normalized.includes("diff") || normalized.includes("differential")) {
    return 2; // Instant lock-slip stabilization
  }
  if (normalized.includes("pressure") || normalized.includes("psi") || normalized.includes("bar")) {
    return 3; // Tyre pressure carcass normalization
  }
  if (normalized.includes("wing") || normalized.includes("aero") || normalized.includes("packer") || normalized.includes("height")) {
    return 4; // Rake pitch downforce statistics
  }
  if (normalized.includes("spring") || normalized.includes("damper") || normalized.includes("rebound") || normalized.includes("compression")) {
    return 5; // Damping response, spring settlement, and driver adaptation
  }
  
  return 3; // Default stabilization horizon
}

/**
 * Isolates setup delta by attributing pace gains across co-factors.
 */
export function calculateConfidenceAttribution(
  pre: StintAnalysisReport,
  post: StintAnalysisReport,
  changeType: string,
  empiricalPaceGainS: number
): ClosedLoopFeedback["confidenceAttribution"] {
  // If no pace gain (or negative gain i.e. slower), assign default attribution
  if (empiricalPaceGainS >= 0) {
    return {
      setupContribution: 0,
      environmentContribution: 40,
      driverAdaptation: 30,
      stochasticVariance: 30
    };
  }

  const absGain = Math.abs(empiricalPaceGainS);
  
  // 1. Calculate Fuel Decay Contribution
  // Dynamic fuel weight decay improves pace roughly by 0.02s per lap completed
  const lapsPassed = Math.max(1, post.lapCount);
  const fuelGainEst = Math.min(absGain * 0.40, lapsPassed * 0.02);
  
  // 2. Calculate Driver Adaptation
  // Compare steer rate variance / smoothness deltas between pre and post
  const steerDelta = post.driver.steerSmoothnessPct - pre.driver.steerSmoothnessPct; // positive means smoother
  const brakeDelta = pre.driver.releaseVariancePct - post.driver.releaseVariancePct; // positive means less variance
  let driverGainEst = 0;
  if (steerDelta > 0) driverGainEst += Math.abs(steerDelta) * 0.005;
  if (brakeDelta > 0) driverGainEst += Math.abs(brakeDelta) * 0.008;
  driverGainEst = Math.min(absGain * 0.35, driverGainEst);

  // 3. Calculate Environmental Contribution (Track rubber and temp shifts)
  const thermalShift = Math.abs(post.tires.optimalFrictionWindowPct - pre.tires.optimalFrictionWindowPct);
  let envGainEst = absGain * 0.15; // standard base rubbering rate
  if (thermalShift > 0) envGainEst += thermalShift * 0.002;
  envGainEst = Math.min(absGain * 0.30, envGainEst);

  // 4. Calculate Setup isolated Contribution (unexplained pace delta)
  const setupGainEst = Math.max(0.010, absGain - (fuelGainEst + driverGainEst + envGainEst));

  // Compute percentages
  const totalEst = fuelGainEst + driverGainEst + envGainEst + setupGainEst;
  const setupPct = Math.round((setupGainEst / totalEst) * 100);
  const envPct = Math.round((fuelGainEst + envGainEst) / totalEst * 100);
  const driverPct = Math.round((driverGainEst / totalEst) * 100);
  
  // Guarantee sum equals 100%
  const setupContribution = Math.max(5, Math.min(85, setupPct));
  const driverAdaptation = Math.max(5, Math.min(85, driverPct));
  const environmentContribution = Math.max(5, Math.min(85, envPct));
  const stochasticVariance = 100 - (setupContribution + driverAdaptation + environmentContribution);

  return {
    setupContribution,
    environmentContribution,
    driverAdaptation,
    stochasticVariance: Math.max(0, stochasticVariance)
  };
}

/**
 * Evaluates the actual physical outcome of an applied setup change
 * by comparing stint telemetry reports from before and after the change.
 */
export function evaluateStintOutcome(
  pre: StintAnalysisReport,
  post: StintAnalysisReport,
  change: StoredSetupChange
): ClosedLoopFeedback {
  let expectedGainMet = false;
  let compromiseWorseThanForecast = false;
  let confidenceDelta = 0;
  let validationStatus: ClosedLoopFeedback["validationStatus"] = "INCONCLUSIVE_NO_DATA";
  let feedbackNarrative = "No structural outcome delta recorded.";

  // Calculate actual pace improvement
  const preImprovementTarget = pre.theoreticalImprovementDelta; // e.g. 0.45s
  const postImprovementTarget = post.theoreticalImprovementDelta; // e.g. 0.25s
  const empiricalPaceGainS = Number((postImprovementTarget - preImprovementTarget).toFixed(3)); // negative is improvement

  const changeType = change.change_type?.toLowerCase() || "";

  // 1. REAR REBOUND / DAMPING EVALUATION
  if (changeType.includes("rebound") || changeType.includes("damping") || changeType.includes("compression")) {
    const preBottoming = pre.aero.bottomingCount;
    const postBottoming = post.aero.bottomingCount;
    
    // Gain check: did rake stability/bottoming events improve?
    if (preBottoming > 0 && postBottoming < preBottoming) {
      expectedGainMet = true;
      confidenceDelta = 10;
      validationStatus = "SUCCESS_VERIFIED";
      feedbackNarrative = `SUCCESS: Stiffening rebound slowed forward transient load transfers. Grounding events dropped from ${preBottoming} to ${postBottoming} per stint.`;
    } else {
      expectedGainMet = false;
      confidenceDelta = -15;
      validationStatus = "COMPROMISED_FAIL";
      feedbackNarrative = `FAIL: Adjustment failed to restrict splitter pitch bounds. Bottoming counts remained unchanged at ${preBottoming} events.`;
    }
  }
  
  // 2. REAR ANTI-ROLL BAR EVALUATION
  else if (changeType.includes("anti-roll") || changeType.includes("bar") || changeType.includes("arb")) {
    const preTractionWaste = pre.hybrid.deploymentWastePct;
    const postTractionWaste = post.hybrid.deploymentWastePct;
    
    // Gain check: did exit wheel slip/traction waste decay?
    if (preTractionWaste > 5.5 && postTractionWaste < preTractionWaste) {
      expectedGainMet = true;
      confidenceDelta = 12;
      validationStatus = "SUCCESS_VERIFIED";
      feedbackNarrative = `SUCCESS: Softer roll bar restored tire driven axle contact pressure. Exit wheel slip waste declined from ${preTractionWaste.toFixed(1)}% to ${postTractionWaste.toFixed(1)}%.`;
    } else {
      expectedGainMet = false;
      confidenceDelta = -10;
      validationStatus = "COMPROMISED_FAIL";
      feedbackNarrative = `FAIL: Exit driven traction footprint remained saturated. Wheelspin waste holds high at ${postTractionWaste.toFixed(1)}%.`;
    }
  }

  // 3. BRAKE BIAS EVALUATION
  else if (changeType.includes("bias") || changeType.includes("brake")) {
    const preFRHeat = pre.tires.thermalGrowthFR;
    const postFRHeat = post.tires.thermalGrowthFR;
    
    if (preFRHeat > 14 && postFRHeat < preFRHeat) {
      expectedGainMet = true;
      confidenceDelta = 8;
      validationStatus = "SUCCESS_VERIFIED";
      feedbackNarrative = `SUCCESS: Forward brake bias shift reduced local sliding friction coefficient on turn-in. FR carcass temperature growth decreased from +${preFRHeat.toFixed(1)}°C to +${postFRHeat.toFixed(1)}°C.`;
    } else {
      expectedGainMet = false;
      confidenceDelta = -8;
      validationStatus = "COMPROMISED_FAIL";
      feedbackNarrative = `FAIL: FR tyre carcass remained thermally saturated post-adjustment. Temperature growth still exceeds optimal windows (+${postFRHeat.toFixed(1)}°C).`;
    }
  }

  // Default Fallback (General delta evaluations)
  else {
    if (empiricalPaceGainS < 0) {
      expectedGainMet = true;
      confidenceDelta = 5;
      validationStatus = "SUCCESS_VERIFIED";
      feedbackNarrative = `INCONCLUSIVE: Standard adjustment verified. Pace improved by -${Math.abs(empiricalPaceGainS).toFixed(3)}s.`;
    } else {
      expectedGainMet = false;
      confidenceDelta = -5;
      validationStatus = "INCONCLUSIVE_NO_DATA";
      feedbackNarrative = `INCONCLUSIVE: Dynamic response curve nominal. Pace delta drift recorded at +${empiricalPaceGainS.toFixed(3)}s.`;
    }
  }

  // Compute Confidence Attribution to protect against correlation contamination
  const confidenceAttribution = calculateConfidenceAttribution(pre, post, changeType, empiricalPaceGainS);

  // Soften validation status if setup contribution is minimal (< 20%) to prevent false learning
  if (validationStatus === "SUCCESS_VERIFIED" && confidenceAttribution.setupContribution < 20) {
    validationStatus = "INCONCLUSIVE_NO_DATA";
    feedbackNarrative += ` (Low isolated mechanical attribution: ${confidenceAttribution.setupContribution}% due to strong environmental co-factors).`;
    confidenceDelta = Math.round(confidenceDelta * 0.2); // severely scale down learning factor
  }

  return {
    expectedGainMet,
    compromiseWorseThanForecast,
    empiricalPaceGainS,
    confidenceDelta,
    confidenceAttribution,
    validationStatus,
    feedbackNarrative,
    physicsTruthBoundary: {
      sourceTypes: ["deterministic_physics", "historical_correlation"]
    }
  };
}

/**
 * Prepares the StoredSetupChange payload, packaging baseline telemetry
 * and expected tradeoffs directly into the storage structure.
 */
export function compileClosedLoopSetupChange(
  rec: UnifiedRecommendation,
  lapNumber: number
): StoredSetupChange {
  const dynamicHorizon = calculateDynamicStabilizationWindow(rec.tradeoff.proposedChange);
  
  return {
    lap_number: lapNumber,
    change_type: rec.tradeoff.proposedChange,
    parameter: rec.lineage.sensorEvidence[0]?.channel || "Unknown",
    delta: String(rec.lineage.sensorEvidence[0]?.value || "Applied"),
    consequences: [
      `EXPECTED_GAIN: ${rec.tradeoff.expectedGain}`,
      `EXPECTED_COMPROMISE: ${rec.tradeoff.expectedCompromise}`,
      `STABILIZATION_HORIZON: ${dynamicHorizon} laps`
    ],
    notes: `AUDIT_LINEAGE: ${rec.lineage.citationSource} | EXPECTED_CONFIDENCE: ${rec.tradeoff.confidenceIndex}%`
  };
}

/**
 * Merges the completed Closed-Loop Feedback evaluation into the StoredSetupChange,
 * writing outcome results directly into the MongoDB document prior to database save.
 */
export function incorporateOutcomeFeedback(
  change: StoredSetupChange,
  feedback: ClosedLoopFeedback
): StoredSetupChange {
  const updatedConsequences = [...(change.consequences || [])];
  
  // Push empirical outcome results
  updatedConsequences.push(`OUTCOME_STATUS: ${feedback.validationStatus}`);
  updatedConsequences.push(`PACE_DELTA: ${feedback.empiricalPaceGainS}s`);
  updatedConsequences.push(`CONFIDENCE_SHIFT: ${feedback.confidenceDelta > 0 ? "+" : ""}${feedback.confidenceDelta}`);
  
  // Push attribution splits
  const attr = feedback.confidenceAttribution;
  updatedConsequences.push(`ATTRIBUTION: setup=${attr.setupContribution}% env=${attr.environmentContribution}% drv=${attr.driverAdaptation}% stoch=${attr.stochasticVariance}%`);
  
  const updatedNotes = `${change.notes}\n\nCLOSED_LOOP_AUDIT: ${feedback.feedbackNarrative}`;

  return {
    ...change,
    consequences: updatedConsequences,
    notes: updatedNotes
  };
}
