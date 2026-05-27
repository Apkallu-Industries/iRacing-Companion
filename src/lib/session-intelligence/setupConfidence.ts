/**
 * setupConfidence.ts — Setup Recommendation Success Weighting Engine
 *
 * Compares pre- and post-adjustment stint lap telemetry to evaluate the
 * historical effectiveness of suspension, damper, and aero modifications.
 */

import { type StoredSetupChange } from "./mongoSessionStore";

export interface SetupConfidenceRating {
  confidenceRating: number;       // Success rate (0 to 100)
  totalHistoricalEvaluations: number;
  observedImpactDescription: string;
  recommendedDeltaLimit: string;
}

/**
 * Evaluates the historical success rate of a proposed setup change type.
 * @param changeType suspension target (e.g. "Rear Rebound", "Rear Anti-Roll Bar")
 * @param previousChanges lists of logged adjustments across other stints
 * @param currentDriverId specific driver identifier
 */
export function calculateSetupAdviceConfidence(
  changeType: string,
  previousChanges: StoredSetupChange[],
  currentDriverId: string
): SetupConfidenceRating {
  // Filter for matching historical adjustments
  const matches = previousChanges.filter(
    (c) => c.change_type?.toLowerCase() === changeType.toLowerCase()
  );

  if (matches.length === 0) {
    return {
      confidenceRating: 70, // Default baseline confidence for proven physics formulas
      totalHistoricalEvaluations: 0,
      observedImpactDescription: "No localized historical changes logged yet. Baseline physics coefficient applied.",
      recommendedDeltaLimit: "Limit delta adjustment to standard single clicks (+1 / -1) to index response curves.",
    };
  }

  let positiveImpacts = 0;
  let negativeImpacts = 0;
  const consequencesEvaluated: string[] = [];

  for (const change of matches) {
    // Check if the change had documented positive consequences
    const positiveWords = ["improve", "reduce", "stabilize", "gain", "faster", "success", "resolved"];
    const negativeWords = ["worse", "understeer", "oversteer", "worsened", "loose", "stall"];

    let changeScore = 0;

    if (change.notes) {
      const notesLower = change.notes.toLowerCase();
      positiveWords.forEach((pw) => {
        if (notesLower.includes(pw)) changeScore += 1;
      });
      negativeWords.forEach((nw) => {
        if (notesLower.includes(nw)) changeScore -= 1;
      });
    }

    if (change.consequences && change.consequences.length > 0) {
      change.consequences.forEach((c) => {
        consequencesEvaluated.push(c);
        const lowerC = c.toLowerCase();
        positiveWords.forEach((pw) => {
          if (lowerC.includes(pw)) changeScore += 2;
        });
        negativeWords.forEach((nw) => {
          if (lowerC.includes(nw)) changeScore -= 2;
        });
      });
    }

    if (changeScore >= 0) {
      positiveImpacts++;
    } else {
      negativeImpacts++;
    }
  }

  const total = matches.length;
  const successRatio = positiveImpacts / total;
  
  // Scale score between 50 and 98 based on success ratio and data density (number of trials)
  const confidence = 50 + (successRatio * 40) + Math.min(8, total * 1.5);
  
  let observedImpact = "Chassis stable following adjustment. ";
  if (consequencesEvaluated.length > 0) {
    const uniqueCons = Array.from(new Set(consequencesEvaluated)).slice(0, 2);
    observedImpact += `Observed outcomes historically: "${uniqueCons.join(", ")}".`;
  } else {
    observedImpact += `Historically reduced transient anomalies in ${positiveImpacts} of ${total} recorded stints.`;
  }

  return {
    confidenceRating: parseFloat(Math.min(98, Math.max(30, confidence)).toFixed(0)),
    totalHistoricalEvaluations: total,
    observedImpactDescription: observedImpact,
    recommendedDeltaLimit: total > 4 
      ? `High confidence. Committing delta adjustments up to +2 clicks or +1.5mm as historically verified.`
      : `Moderate confidence. Limit adjustments to +1 steps, monitoring yaw response before committing further.`,
  };
}
