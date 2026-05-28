/**
 * Pit Wall Temporal State Estimation & Motorsport Belief Engine
 *
 * Implements Phase 8:
 * - Layer 1: Stateful EWMA confidence persistence observer
 * - Layer 2: Composable multi-detector fusion engine (coupled instabilities)
 * - Layer 3: Subsystem rolling health models
 * - Layer 4: Recursive Bayesian latent fault hypothesis engine
 */

class TemporalStateEstimator {
  constructor() {
    this.reset();
  }

  /**
   * Resets all persistent states and Bayesian priors back to starting conditions.
   */
  reset() {
    // Layer 1: Persisted rolling confidence state (EWMA)
    this.persistedConfidence = {
      AERO_BOTTOM_OUT: 0.0,
      AERO_PLATFORM_OSCILLATION: 0.0,
      DIFFUSER_STALL: 0.0,
      BRAKE_LOCK_FRONT_LEFT: 0.0,
      BRAKE_LOCK_FRONT_RIGHT: 0.0,
      REAR_TRACTION_COLLAPSE: 0.0,
      ENTRY_OVER_ROTATION: 0.0,
      EXIT_UNDERSTEER: 0.0,
      BRAKE_MIGRATION_ROTATION: 0.0,
      HYBRID_DEPLOYMENT_SURGE: 0.0
    };

    // Layer 2: Fusion signals
    this.fusionSignals = {
      coupledAeroInstability: 0.0,
      coupledEntryInstability: 0.0,
      coupledTractionInstability: 0.0
    };

    // Layer 3: Subsystem Health Models (1.0 = pristine health, decays under anomalies)
    this.subsystemHealth = {
      aeroPlatform: 1.0,
      rearStability: 1.0,
      brakeMigration: 1.0,
      hybridDeployment: 1.0
    };

    // Layer 4: Bayesian Latent Fault Hypotheses (probabilities 0.0 to 1.0)
    this.hypotheses = {
      floorDamage: 0.05,       // Prior probability of structural wear/damage
      diffuserChoking: 0.01,   // Prior probability of severe dynamic pressure choking
      tireDegradation: 0.05,   // Prior probability of grip decay
      brakeOverheating: 0.01   // Prior probability of friction loss / glazed pads
    };
  }

  /**
   * Performs recursive Bayesian probability updates.
   */
  _bayesianUpdate(prior, z, pEvidenceGivenFault, pEvidenceGivenNoFault) {
    const numerator = pEvidenceGivenFault * prior;
    const denominator = numerator + pEvidenceGivenNoFault * (1.0 - prior);
    return denominator > 0 ? Math.max(0.0, Math.min(1.0, numerator / denominator)) : prior;
  }

  /**
   * Updates the continuous state observer for a single tick frame.
   * Calculates continuous instantaneous evidence and updates the rolling state blocks.
   *
   * @param {object} current Normalized CoreTelemetryV1 frame (with current.derived)
   * @param {object} rawOriginal Raw packet from the simulator
   * @param {object} profile Resolved vehicle profile
   * @returns {object} Highly-structured estimation block wrapped in TelemetryValue contracts
   */
  update(current, rawOriginal = {}, profile = {}) {
    const speed = current.car.speed.value; // m/s
    const derived = current.derived || {};

    const origin = current.timestamp.provenance?.origin || "iRacing";
    const tickSource = current.frameNumber.value || 0;
    const latency = current.timestamp.provenance?.latency || 0;

    // Helper to generate a standardized TelemetryValue inside the estimation block
    function estVal(val, confidence = 1.0, derivedFrom = []) {
      return {
        value: Number(val.toFixed(6)),
        confidence: Number(confidence.toFixed(4)),
        source: "derived",
        freshnessMs: latency,
        provenance: {
          derivedFrom,
          simSource: null,
          origin,
          tickSource,
          latency
        }
      };
    }

    // ==========================================
    // LAYER 1: INSTANTANEOUS PHYSICAL EVIDENCE (E_t)
    // ==========================================

    // 1. Aero Bottoming Evidence
    let E_bottom_out = 0.0;
    const bottomOutThreshold = profile.bottomOutVelThreshold || 0.15;
    const isAeroSpeedGate = (speed * 3.6) > ((profile.minAeroSpeedKph || 120.0) * 0.6);
    if (isAeroSpeedGate) {
      const lfShockVel = Math.abs(rawOriginal.LFshockVel ?? rawOriginal.lfShockVel ?? 0);
      const rfShockVel = Math.abs(rawOriginal.RFshockVel ?? rawOriginal.rfShockVel ?? 0);
      const maxShock = Math.max(lfShockVel, rfShockVel);
      // Continuous ramp-up starting from 50% of threshold
      const activeRange = bottomOutThreshold * 0.5;
      if (maxShock > activeRange) {
        E_bottom_out = Math.min(1.0, (maxShock - activeRange) / activeRange);
      }
    }

    // 2. Aero Platform Oscillation Evidence
    let E_oscillation = 0.0;
    if (speed * 3.6 > 160.0) {
      const lfRaw = rawOriginal.LFshockVel ?? rawOriginal.lfShockVel ?? 0;
      const rfRaw = rawOriginal.RFshockVel ?? rawOriginal.rfShockVel ?? 0;
      const lfShockVel = Math.abs(lfRaw);
      const rfShockVel = Math.abs(rfRaw);
      const isOutofPhase = lfRaw * rfRaw < 0;
      if (isOutofPhase && lfShockVel > 0.15 && rfShockVel > 0.15) {
        E_oscillation = Math.min(1.0, Math.max(lfShockVel, rfShockVel) / 0.30);
      }
    }

    // 3. Diffuser Underbody Stall Evidence
    let E_stall = 0.0;
    const rearHeight = rawOriginal.RrideHeight ?? (rawOriginal.rearRideHeight ? rawOriginal.rearRideHeight / 1000 : undefined);
    if (speed * 3.6 > 160.0 && rearHeight !== undefined && current.car.inputs.throttle.value > 0.50) {
      // Rear ride height collapsing below 25mm down to 12mm
      if (rearHeight < 0.025) {
        E_stall = Math.min(1.0, Math.max(0.0, (0.025 - rearHeight) / (0.025 - 0.012)));
      }
    }

    // 4 & 5. Brake Lock Evidence (LF & RF Axel Slip)
    let E_lock_lf = 0.0;
    let E_lock_rf = 0.0;
    const isBrakeGate = speed > 1.38 && current.car.inputs.brake.value > 0.10;
    if (isBrakeGate) {
      const lfSpeed = rawOriginal.LFwheelSpeed ?? rawOriginal.lfSpeed;
      const rfSpeed = rawOriginal.RFwheelSpeed ?? rawOriginal.rfSpeed;
      const lockThreshold = speed * (profile.lockupThreshold || 0.85);

      if (lfSpeed !== undefined && lfSpeed < lockThreshold) {
        E_lock_lf = Math.min(1.0, 1.0 - (lfSpeed / lockThreshold));
      }
      if (rfSpeed !== undefined && rfSpeed < lockThreshold) {
        E_lock_rf = Math.min(1.0, 1.0 - (rfSpeed / lockThreshold));
      }
    }

    // 6. Rear Traction Collapse Evidence (Wheelspin axle slip)
    let E_traction = 0.0;
    const isThrottleGate = speed > 1.38 && current.car.inputs.throttle.value > 0.10;
    if (isThrottleGate) {
      const lrSpeed = rawOriginal.LRwheelSpeed ?? rawOriginal.lrSpeed;
      const rrSpeed = rawOriginal.RRwheelSpeed ?? rawOriginal.rrSpeed;
      if (lrSpeed !== undefined && rrSpeed !== undefined) {
        const avgRear = (lrSpeed + rrSpeed) / 2;
        const spinTolerance = profile.className === "NASCAR" ? 1.15 : 1.12;
        const limitSpeed = speed * spinTolerance;
        if (avgRear > limitSpeed) {
          // Normalize axle slip gradient past limits
          E_traction = Math.min(1.0, (avgRear - limitSpeed) / (speed * (spinTolerance - 1.0)));
        }
      }
    }

    // 7. Decel Turn-In Over-Rotation Evidence
    let E_over_rotation = 0.0;
    const isDecelSnapGate = speed > 10.0 && Math.abs(current.car.inputs.steering.value) > 0.02 && current.car.inputs.brake.value > 0.05;
    if (isDecelSnapGate && derived.oversteerIndex) {
      const oIndex = derived.oversteerIndex.value;
      const oversteerLimit = profile.className === "NASCAR" ? 0.18 : 0.10;
      if (oIndex > oversteerLimit) {
        E_over_rotation = Math.min(1.0, (oIndex - oversteerLimit) / oversteerLimit);
      }
    }

    // 8. Exit Understeer Evidence
    let E_understeer = 0.0;
    const isExitPushGate = speed > 10.0 && Math.abs(current.car.inputs.steering.value) > 0.02 && current.car.inputs.throttle.value > 0.30;
    if (isExitPushGate && derived.understeerIndex) {
      const uIndex = derived.understeerIndex.value;
      const understeerLimit = profile.className === "NASCAR" ? 0.16 : 0.12;
      if (uIndex > understeerLimit) {
        E_understeer = Math.min(1.0, (uIndex - understeerLimit) / understeerLimit);
      }
    }

    // 9. Brake Migration Corner Entry over-rotation
    let E_brake_migration = 0.0;
    const isBrakeMigrationGate = speed > 15.0 && current.car.inputs.brake.value > 0.60;
    if (isBrakeMigrationGate && derived.oversteerIndex) {
      const oIndex = derived.oversteerIndex.value;
      if (oIndex > 0.06) {
        E_brake_migration = Math.min(1.0, (oIndex - 0.06) / 0.06);
      }
    }

    // 10. Hybrid Axis Asymmetry
    let E_hybrid = 0.0;
    if (speed > 15.0 && current.car.inputs.throttle.value > 0.60) {
      const lrSpeed = rawOriginal.LRwheelSpeed ?? rawOriginal.lrSpeed;
      const rrSpeed = rawOriginal.RRwheelSpeed ?? rawOriginal.rrSpeed;
      if (lrSpeed !== undefined && rrSpeed !== undefined) {
        const diff = Math.abs(lrSpeed - rrSpeed);
        if (diff > 4.5) {
          E_hybrid = Math.min(1.0, (diff - 4.5) / 4.5);
        }
      }
    }

    // ==========================================
    // LAYER 1: EWMA SMOOTHING AND TEMPORAL DECAY
    // ==========================================
    const alphaMap = {
      AERO_BOTTOM_OUT: 0.85,
      AERO_PLATFORM_OSCILLATION: 0.85,
      DIFFUSER_STALL: 0.85,
      BRAKE_LOCK_FRONT_LEFT: 0.70,
      BRAKE_LOCK_FRONT_RIGHT: 0.70,
      REAR_TRACTION_COLLAPSE: 0.70,
      ENTRY_OVER_ROTATION: 0.80,
      EXIT_UNDERSTEER: 0.80,
      BRAKE_MIGRATION_ROTATION: 0.80,
      HYBRID_DEPLOYMENT_SURGE: 0.75
    };

    const evidenceMap = {
      AERO_BOTTOM_OUT: E_bottom_out,
      AERO_PLATFORM_OSCILLATION: E_oscillation,
      DIFFUSER_STALL: E_stall,
      BRAKE_LOCK_FRONT_LEFT: E_lock_lf,
      BRAKE_LOCK_FRONT_RIGHT: E_lock_rf,
      REAR_TRACTION_COLLAPSE: E_traction,
      ENTRY_OVER_ROTATION: E_over_rotation,
      EXIT_UNDERSTEER: E_understeer,
      BRAKE_MIGRATION_ROTATION: E_brake_migration,
      HYBRID_DEPLOYMENT_SURGE: E_hybrid
    };

    // Calculate EWMA per detector
    for (const key in this.persistedConfidence) {
      const alpha = alphaMap[key] || 0.80;
      const ev = evidenceMap[key] || 0.0;
      this.persistedConfidence[key] = (alpha * this.persistedConfidence[key]) + ((1 - alpha) * ev);
      this.persistedConfidence[key] = Math.max(0.0, Math.min(1.0, this.persistedConfidence[key]));
    }

    // ==========================================
    // LAYER 2: MULTI-DETECTOR FUSION ENGINE
    // ==========================================
    const C_bottom_out = this.persistedConfidence.AERO_BOTTOM_OUT;
    const C_heave = this.persistedConfidence.AERO_PLATFORM_OSCILLATION;
    const C_stall = this.persistedConfidence.DIFFUSER_STALL;
    const C_lock_lf = this.persistedConfidence.BRAKE_LOCK_FRONT_LEFT;
    const C_lock_rf = this.persistedConfidence.BRAKE_LOCK_FRONT_RIGHT;
    const C_traction = this.persistedConfidence.REAR_TRACTION_COLLAPSE;
    const C_over_steer = this.persistedConfidence.ENTRY_OVER_ROTATION;
    const C_under_steer = this.persistedConfidence.EXIT_UNDERSTEER;
    const C_brake_migration = this.persistedConfidence.BRAKE_MIGRATION_ROTATION;
    const C_hybrid_surge = this.persistedConfidence.HYBRID_DEPLOYMENT_SURGE;

    // 1. Coupled Aero Platform Instability
    const I_aero = (0.4 * C_heave) + (0.4 * C_stall) + (0.2 * (C_heave * C_stall));
    this.fusionSignals.coupledAeroInstability = Math.min(1.0, I_aero);

    // 2. Coupled Corner Entry Instability
    const I_entry = (0.5 * C_brake_migration) + (0.5 * C_over_steer) + (0.3 * (C_brake_migration * C_over_steer));
    this.fusionSignals.coupledEntryInstability = Math.min(1.0, I_entry);

    // 3. Coupled Driven Axle Instability (wheelspin + power deployment asymmetry)
    const I_traction = (0.5 * C_traction) + (0.5 * C_hybrid_surge) + (0.3 * (C_traction * C_hybrid_surge));
    this.fusionSignals.coupledTractionInstability = Math.min(1.0, I_traction);

    // ==========================================
    // LAYER 3: SUBSYSTEM HEALTH MODELS
    // ==========================================

    // 1. Aero Platform Health (slow wear recovery, β = 0.95)
    const aeroDecline = Math.max(C_bottom_out, this.fusionSignals.coupledAeroInstability);
    this.subsystemHealth.aeroPlatform = (0.95 * this.subsystemHealth.aeroPlatform) + (0.05 * (1.0 - aeroDecline));
    this.subsystemHealth.aeroPlatform = Math.max(0.0, Math.min(1.0, this.subsystemHealth.aeroPlatform));

    // 2. Rear Stability Health (faster slip recovery, β = 0.90)
    const rearDecline = Math.max(C_traction, this.fusionSignals.coupledTractionInstability);
    this.subsystemHealth.rearStability = (0.90 * this.subsystemHealth.rearStability) + (0.10 * (1.0 - rearDecline));
    this.subsystemHealth.rearStability = Math.max(0.0, Math.min(1.0, this.subsystemHealth.rearStability));

    // 3. Brake Migration Stability (β = 0.92)
    const brakeDecline = Math.max(C_lock_lf, C_lock_rf, this.fusionSignals.coupledEntryInstability);
    this.subsystemHealth.brakeMigration = (0.92 * this.subsystemHealth.brakeMigration) + (0.08 * (1.0 - brakeDecline));
    this.subsystemHealth.brakeMigration = Math.max(0.0, Math.min(1.0, this.subsystemHealth.brakeMigration));

    // 4. Hybrid Deployment Integrity (β = 0.95)
    this.subsystemHealth.hybridDeployment = (0.95 * this.subsystemHealth.hybridDeployment) + (0.05 * (1.0 - C_hybrid_surge));
    this.subsystemHealth.hybridDeployment = Math.max(0.0, Math.min(1.0, this.subsystemHealth.hybridDeployment));

    // ==========================================
    // LAYER 4: BAYESIAN LATENT FAULT HYPOTHESIS ENGINE
    // ==========================================

    // 1. Floor Damage Probability: Permanent structural damage (very slow non-reversible decay)
    const z_floor = Math.max(C_bottom_out, this.fusionSignals.coupledAeroInstability);
    if (z_floor > 0.15) {
      // High evidence under bottoming/instability (Likelihood: P(z|Damage) = 0.85, P(z|noDamage) = 0.15)
      this.hypotheses.floorDamage = this._bayesianUpdate(this.hypotheses.floorDamage, z_floor, 0.85, 0.15);
    } else {
      // Slow structural leak decay
      this.hypotheses.floorDamage = (0.9995 * this.hypotheses.floorDamage) + (0.0005 * 0.05);
    }

    // 2. Diffuser Choking Probability: Dynamic pressure sealing decay (recovers immediately if load decreases)
    const z_stall = C_stall;
    if (z_stall > 0.20) {
      this.hypotheses.diffuserChoking = this._bayesianUpdate(this.hypotheses.diffuserChoking, z_stall, 0.90, 0.10);
    } else {
      // Fast dynamic decay
      this.hypotheses.diffuserChoking = 0.80 * this.hypotheses.diffuserChoking;
    }

    // 3. Tire Degradation Likelihood: Permanent mechanical wear (no active decay back to baseline)
    const z_tire = (0.4 * C_traction) + (0.3 * C_under_steer) + (0.3 * C_over_steer);
    if (z_tire > 0.10) {
      this.hypotheses.tireDegradation = this._bayesianUpdate(this.hypotheses.tireDegradation, z_tire, 0.75, 0.25);
    } else {
      // Tire grip doesn't magically recover during a stint
      this.hypotheses.tireDegradation = (0.9998 * this.hypotheses.tireDegradation) + (0.0002 * 0.05);
    }

    // 4. Brake Overheating Likelihood: Dynamic friction fading (cools down slowly over straights)
    const z_brake = Math.max(C_lock_lf, C_lock_rf, C_brake_migration);
    if (z_brake > 0.25) {
      this.hypotheses.brakeOverheating = this._bayesianUpdate(this.hypotheses.brakeOverheating, z_brake, 0.80, 0.20);
    } else {
      // Decay back to cold prior
      this.hypotheses.brakeOverheating = (0.98 * this.hypotheses.brakeOverheating) + (0.02 * 0.01);
    }

    // ==========================================
    // RETURNING STRUCTURED CANONICAL ESTIMATION BLOCK
    // ==========================================
    return {
      rollingConfidence: {
        AERO_BOTTOM_OUT: estVal(this.persistedConfidence.AERO_BOTTOM_OUT, 1.0, ["LFshockVel", "RFshockVel"]),
        AERO_PLATFORM_OSCILLATION: estVal(this.persistedConfidence.AERO_PLATFORM_OSCILLATION, 1.0, ["LFshockVel", "RFshockVel"]),
        DIFFUSER_STALL: estVal(this.persistedConfidence.DIFFUSER_STALL, 1.0, ["RrideHeight", "throttle"]),
        BRAKE_LOCK_FRONT_LEFT: estVal(this.persistedConfidence.BRAKE_LOCK_FRONT_LEFT, 1.0, ["LFwheelSpeed", "speed", "brake"]),
        BRAKE_LOCK_FRONT_RIGHT: estVal(this.persistedConfidence.BRAKE_LOCK_FRONT_RIGHT, 1.0, ["RFwheelSpeed", "speed", "brake"]),
        REAR_TRACTION_COLLAPSE: estVal(this.persistedConfidence.REAR_TRACTION_COLLAPSE, 1.0, ["LRwheelSpeed", "RRwheelSpeed", "speed", "throttle"]),
        ENTRY_OVER_ROTATION: estVal(this.persistedConfidence.ENTRY_OVER_ROTATION, 1.0, ["derived.oversteerIndex", "speed", "steering", "brake"]),
        EXIT_UNDERSTEER: estVal(this.persistedConfidence.EXIT_UNDERSTEER, 1.0, ["derived.understeerIndex", "speed", "steering", "throttle"]),
        BRAKE_MIGRATION_ROTATION: estVal(this.persistedConfidence.BRAKE_MIGRATION_ROTATION, 1.0, ["derived.oversteerIndex", "speed", "brake"]),
        HYBRID_DEPLOYMENT_SURGE: estVal(this.persistedConfidence.HYBRID_DEPLOYMENT_SURGE, 1.0, ["LRwheelSpeed", "RRwheelSpeed", "speed", "throttle"])
      },
      fusionSignals: {
        coupledAeroInstability: estVal(this.fusionSignals.coupledAeroInstability, 0.90, ["rollingConfidence.AERO_PLATFORM_OSCILLATION", "rollingConfidence.DIFFUSER_STALL"]),
        coupledEntryInstability: estVal(this.fusionSignals.coupledEntryInstability, 0.90, ["rollingConfidence.BRAKE_MIGRATION_ROTATION", "rollingConfidence.ENTRY_OVER_ROTATION"]),
        coupledTractionInstability: estVal(this.fusionSignals.coupledTractionInstability, 0.90, ["rollingConfidence.REAR_TRACTION_COLLAPSE", "rollingConfidence.HYBRID_DEPLOYMENT_SURGE"])
      },
      subsystemHealth: {
        aeroPlatform: estVal(this.subsystemHealth.aeroPlatform, 0.95, ["rollingConfidence.AERO_BOTTOM_OUT", "fusionSignals.coupledAeroInstability"]),
        rearStability: estVal(this.subsystemHealth.rearStability, 0.90, ["rollingConfidence.REAR_TRACTION_COLLAPSE", "fusionSignals.coupledTractionInstability"]),
        brakeMigration: estVal(this.subsystemHealth.brakeMigration, 0.92, ["rollingConfidence.BRAKE_LOCK_FRONT_LEFT", "rollingConfidence.BRAKE_LOCK_FRONT_RIGHT", "fusionSignals.coupledEntryInstability"]),
        hybridDeployment: estVal(this.subsystemHealth.hybridDeployment, 0.95, ["rollingConfidence.HYBRID_DEPLOYMENT_SURGE"])
      },
      hypotheses: {
        floorDamage: estVal(this.hypotheses.floorDamage, 0.85, ["rollingConfidence.AERO_BOTTOM_OUT", "fusionSignals.coupledAeroInstability"]),
        diffuserChoking: estVal(this.hypotheses.diffuserChoking, 0.80, ["rollingConfidence.DIFFUSER_STALL"]),
        tireDegradation: estVal(this.hypotheses.tireDegradation, 0.70, ["rollingConfidence.REAR_TRACTION_COLLAPSE", "rollingConfidence.EXIT_UNDERSTEER", "rollingConfidence.ENTRY_OVER_ROTATION"]),
        brakeOverheating: estVal(this.hypotheses.brakeOverheating, 0.80, ["rollingConfidence.BRAKE_LOCK_FRONT_LEFT", "rollingConfidence.BRAKE_LOCK_FRONT_RIGHT", "rollingConfidence.BRAKE_MIGRATION_ROTATION"])
      }
    };
  }
}

module.exports = TemporalStateEstimator;
