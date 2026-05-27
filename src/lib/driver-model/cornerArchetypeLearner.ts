/**
 * cornerArchetypeLearner.ts — Corner Archetype Learning Engine
 *
 * Automatically categorizes track sectors dynamically based on apex speeds,
 * lateral acceleration parameters, brake-release signatures, and vertical shock forces.
 */

export type CornerArchetype =
  | "SLOW_TRACTION"
  | "MEDIUM_ROTATION"
  | "HIGH_SPEED_AERO"
  | "BRAKE_RELEASE"
  | "HYBRID_DEPLOY"
  | "COMPRESSION_ZONE";

export interface ArchetypeClassification {
  archetype: CornerArchetype;
  confidence: number; // 0.0 to 1.0
  primarySignalReason: string;
}

/**
 * Learns the archetype classification for a specific corner window.
 * @param apexSpeedMps speed minimum at apex (m/s)
 * @param peakLateralG peak lateral acceleration in Gs
 * @param trailBrakeSec trail braking duration (seconds)
 * @param peakShockVelocityMax vertical shock deflection rates (mm/s or normalized deflection delta)
 * @param straightawayLengthAfter distance of straight track after corner exit (meters)
 */
export function classifyCornerArchetype(
  apexSpeedMps: number,
  peakLateralG: number,
  trailBrakeSec: number,
  peakShockVelocityMax: number,
  straightawayLengthAfter: number
): ArchetypeClassification {
  const apexSpeedKmH = apexSpeedMps * 3.6;

  // 1. COMPRESSION_ZONE check: High vertical suspension compression (e.g. Eau Rouge dip)
  if (peakShockVelocityMax > 150) {
    return {
      archetype: "COMPRESSION_ZONE",
      confidence: 0.90,
      primarySignalReason: `Vertical shock deflection velocity reached ${peakShockVelocityMax} mm/s, indicating major mechanical compression.`,
    };
  }

  // 2. HIGH_SPEED_AERO check: fast sweeps where downforce, ride height and ground clearances matter
  if (apexSpeedKmH > 140 && peakLateralG > 1.6) {
    const confidence = Math.min(1.0, 0.6 + (peakLateralG - 1.6) * 0.4);
    return {
      archetype: "HIGH_SPEED_AERO",
      confidence: parseFloat(confidence.toFixed(2)),
      primarySignalReason: `Apex velocity of ${apexSpeedKmH.toFixed(0)} km/h under ${peakLateralG.toFixed(1)}G lateral load places severe demands on underbody downforce.`,
    };
  }

  // 3. HYBRID_DEPLOY check: exit leading onto major straightaways (> 350 meters)
  if (straightawayLengthAfter > 350 && apexSpeedKmH > 60) {
    return {
      archetype: "HYBRID_DEPLOY",
      confidence: 0.85,
      primarySignalReason: `Exit feeds onto a ${straightawayLengthAfter.toFixed(0)}m straight, maximizing ERS deployment efficiency and straightaway SoC decay.`,
    };
  }

  // 4. SLOW_TRACTION check: slow corners requiring patience on throttle re-application
  if (apexSpeedKmH < 75) {
    const confidence = Math.min(1.0, 0.5 + (75 - apexSpeedKmH) * 0.01);
    return {
      archetype: "SLOW_TRACTION",
      confidence: parseFloat(confidence.toFixed(2)),
      primarySignalReason: `Low speed apex (${apexSpeedKmH.toFixed(0)} km/h) makes exit highly throttle-limited, raising traction slip risks.`,
    };
  }

  // 5. BRAKE_RELEASE check: entry trail-brake dominated rotation corners
  if (trailBrakeSec > 1.2 && peakLateralG < 1.3) {
    return {
      archetype: "BRAKE_RELEASE",
      confidence: 0.80,
      primarySignalReason: `Extended trail-braking phase (${trailBrakeSec.toFixed(1)}s) requires high brake-release blending to pivot chassis footprint.`,
    };
  }

  // 6. Fallback: MEDIUM_ROTATION mid-speed corners
  return {
    archetype: "MEDIUM_ROTATION",
    confidence: 0.75,
    primarySignalReason: `Medium velocity apex (${apexSpeedKmH.toFixed(0)} km/h) requires coordinated mechanical steering rotation and roll stabilization.`,
  };
}
