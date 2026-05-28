/**
 * Pit Wall Temporal Semantic Event Detection Engine
 *
 * Implements Phase 8:
 * - Stateful persistence gates evaluating rolling persisted confidences (Ct >= 0.40)
 * - Class-aware, capabilities-bounded physical bypass gates
 * - High-order Bayesian latent fault alerts (FLOOR_DAMAGE_ALERT, TIRE_DEGRADATION_ALERT)
 * - Backward-compatible stateless fallback wrapper
 */

const crypto = require("crypto");
const { resolveVehicleProfile } = require("./vehicleProfiles.cjs");

// Standard Event Type Enum matching ontology/events/schema.json
const RaceEventType = {
  ENTRY_OVER_ROTATION: "ENTRY_OVER_ROTATION",
  EXIT_UNDERSTEER: "EXIT_UNDERSTEER",
  AERO_BOTTOM_OUT: "AERO_BOTTOM_OUT",
  BRAKE_LOCK_FRONT_LEFT: "BRAKE_LOCK_FRONT_LEFT",
  BRAKE_LOCK_FRONT_RIGHT: "BRAKE_LOCK_FRONT_RIGHT",
  REAR_TRACTION_COLLAPSE: "REAR_TRACTION_COLLAPSE",
  DIRTY_AIR_PUSH: "DIRTY_AIR_PUSH",
  THERMAL_REAR_OVERLOAD: "THERMAL_REAR_OVERLOAD",
  HIGH_SPEED_HEAVE_SPIKE: "HIGH_SPEED_HEAVE_SPIKE",
  AERO_PLATFORM_OSCILLATION: "AERO_PLATFORM_OSCILLATION",
  DIFFUSER_STALL: "DIFFUSER_STALL",
  BRAKE_MIGRATION_ROTATION: "BRAKE_MIGRATION_ROTATION",
  HYBRID_DEPLOYMENT_SURGE: "HYBRID_DEPLOYMENT_SURGE",
  FLOOR_DAMAGE_ALERT: "FLOOR_DAMAGE_ALERT",
  TIRE_DEGRADATION_ALERT: "TIRE_DEGRADATION_ALERT"
};

// Cooldown buffer (ms) to prevent event flickering / spamming
const EVENT_COOLDOWN_MS = 1500;
const activeCooldowns = new Map();

/**
 * Generates a unique event identifier, prefixed with 'evt_'.
 */
function generateEventId() {
  return `evt_${crypto.randomBytes(8).toString("hex")}`;
}

/**
 * Checks if a specific event type is currently on cooldown.
 */
function checkAndSetCooldown(type) {
  const now = Date.now();
  if (activeCooldowns.has(type)) {
    if (now - activeCooldowns.get(type) < EVENT_COOLDOWN_MS) {
      return true;
    }
  }
  activeCooldowns.set(type, now);
  return false;
}

/**
 * Computes source-weighted confidence based on event mathematically.
 */
function getSourceWeightedConfidence(baseConfidence, sourceTypes) {
  if (!Array.isArray(sourceTypes) || sourceTypes.length === 0) return baseConfidence;
  
  let compoundWeight = 1.0;
  for (const source of sourceTypes) {
    let trustWeight = 1.0;
    if (source === "measured" || source === "deterministic_physics") {
      trustWeight = 0.95;
    } else if (source === "derived" || source === "historical_correlation") {
      trustWeight = 0.90;
    } else if (source === "behavioral_model" || source === "probabilistic_projection") {
      trustWeight = 0.70;
    } else if (source === "ai") {
      trustWeight = 0.50;
    }
    compoundWeight = Math.min(compoundWeight, trustWeight);
  }
  
  return Number((baseConfidence * compoundWeight).toFixed(4));
}

/**
 * Class-aware lockup triggers
 */
function triggerLockupLF(lfSpeed, speed, current, profile, lapNumber, sectorNumber, events, rawOriginal, persistedConf) {
  const latency = current.timestamp.provenance?.latency || 0;
  
  if (profile.className === "Rallycross") {
    // Check surface type material dirt bypass
    const surface = rawOriginal.PlayerTrackSurfaceMaterial;
    const isLoose = surface === 4 || surface === 5 || surface === 6 || surface === 3;
    if (isLoose) return;

    if (!checkAndSetCooldown(RaceEventType.BRAKE_LOCK_FRONT_LEFT)) {
      events.push(createTelemetryEvent({
        current,
        eventType: RaceEventType.BRAKE_LOCK_FRONT_LEFT,
        lapNumber,
        sectorNumber,
        severity: "INFO",
        confidence: persistedConf,
        lapTimeImpactS: 0.10,
        driverRiskRating: 2,
        triggerChannel: "LFwheelSpeed",
        triggerValue: lfSpeed,
        narrativeDescription: `Rallycross Front Left wheel locking enquired: sustained slip duration exceeds 220ms limit on asphalt transition.`,
        sourceTypes: ["deterministic_physics"],
        rationale: ["wheel_speed_decayed_below_slip_threshold", "minimum_duration_exceeded", "asphalt_surface_transition"],
        classification: "observed",
        latency,
        profile,
        detector: "LockupDetectorRallycross",
        detectorVersion: "1.1.0"
      }));
    }
  } else if (profile.className === "LMGT3") {
    if (!checkAndSetCooldown(RaceEventType.BRAKE_LOCK_FRONT_LEFT)) {
      events.push(createTelemetryEvent({
        current,
        eventType: RaceEventType.BRAKE_LOCK_FRONT_LEFT,
        lapNumber,
        sectorNumber,
        severity: "WARNING",
        confidence: persistedConf,
        lapTimeImpactS: 0.25,
        driverRiskRating: 4,
        triggerChannel: "LFwheelSpeed",
        triggerValue: lfSpeed,
        narrativeDescription: `Front Left wheel lockup moderated by ABS on [LMGT3] platform: wheel speed decayed to ${(lfSpeed * 3.6).toFixed(1)} km/h under brake pressure.`,
        sourceTypes: ["deterministic_physics"],
        rationale: ["wheel_speed_decayed_below_chassis_speed", "brake_pressure_applied", "abs_modulation_active"],
        classification: "observed",
        latency,
        profile,
        detector: "LockupDetectorLMGT3",
        detectorVersion: "1.1.0"
      }));
    }
  } else if (profile.className === "NASCAR") {
    if (!checkAndSetCooldown(RaceEventType.BRAKE_LOCK_FRONT_LEFT)) {
      events.push(createTelemetryEvent({
        current,
        eventType: RaceEventType.BRAKE_LOCK_FRONT_LEFT,
        lapNumber,
        sectorNumber,
        severity: "CRITICAL",
        confidence: persistedConf,
        lapTimeImpactS: 0.45,
        driverRiskRating: 7,
        triggerChannel: "LFwheelSpeed",
        triggerValue: lfSpeed,
        narrativeDescription: `Severe Front Left flat-spot lockup on [NASCAR] platform (No ABS): wheel speed dropped to ${(lfSpeed * 3.6).toFixed(1)} km/h under raw pedal pressure.`,
        sourceTypes: ["deterministic_physics"],
        rationale: ["wheel_speed_decayed_below_chassis_speed", "raw_brake_pedal_exceeded_grip_limit", "absence_of_abs"],
        classification: "observed",
        latency,
        profile,
        detector: "LockupDetectorNASCAR",
        detectorVersion: "1.1.0"
      }));
    }
  } else if (profile.className === "LMP2" || profile.className === "GTP" || profile.className === "SF23") {
    if (!checkAndSetCooldown(RaceEventType.BRAKE_LOCK_FRONT_LEFT)) {
      events.push(createTelemetryEvent({
        current,
        eventType: RaceEventType.BRAKE_LOCK_FRONT_LEFT,
        lapNumber,
        sectorNumber,
        severity: "CRITICAL",
        confidence: persistedConf,
        lapTimeImpactS: 0.40,
        driverRiskRating: 6,
        triggerChannel: "LFwheelSpeed",
        triggerValue: lfSpeed,
        narrativeDescription: `High-downforce Front Left axle lockup on [${profile.className}] prototype (No ABS): wheel speed dropped to ${(lfSpeed * 3.6).toFixed(1)} km/h during aero load decay.`,
        sourceTypes: ["deterministic_physics"],
        rationale: ["wheel_speed_decayed_below_chassis_speed", "downforce_load_decay_under_deceleration", "absence_of_abs"],
        classification: "observed",
        latency,
        profile,
        detector: "LockupDetectorLMP2",
        detectorVersion: "1.1.0"
      }));
    }
  } else {
    // Default Lockup Trigger
    const severity = profile.hasAbs ? "WARNING" : "CRITICAL";
    const risk = profile.hasAbs ? 4 : 7;
    if (!checkAndSetCooldown(RaceEventType.BRAKE_LOCK_FRONT_LEFT)) {
      events.push(createTelemetryEvent({
        current,
        eventType: RaceEventType.BRAKE_LOCK_FRONT_LEFT,
        lapNumber,
        sectorNumber,
        severity,
        confidence: persistedConf,
        lapTimeImpactS: 0.35,
        driverRiskRating: risk,
        triggerChannel: "LFwheelSpeed",
        triggerValue: lfSpeed,
        narrativeDescription: `Front Left wheel lockup enquired on [${profile.className}] platform: wheel speed decayed to ${(lfSpeed * 3.6).toFixed(1)} km/h under brake pressure.`,
        sourceTypes: ["deterministic_physics"],
        rationale: ["wheel_speed_decayed_below_chassis_speed", "brake_pressure_applied"],
        classification: "observed",
        latency,
        profile,
        detector: "LockupDetectorDefault",
        detectorVersion: "1.0.0"
      }));
    }
  }
}

function triggerLockupRF(rfSpeed, speed, current, profile, lapNumber, sectorNumber, events, rawOriginal, persistedConf) {
  const latency = current.timestamp.provenance?.latency || 0;
  
  if (profile.className === "Rallycross") {
    const surface = rawOriginal.PlayerTrackSurfaceMaterial;
    const isLoose = surface === 4 || surface === 5 || surface === 6 || surface === 3;
    if (isLoose) return;

    if (!checkAndSetCooldown(RaceEventType.BRAKE_LOCK_FRONT_RIGHT)) {
      events.push(createTelemetryEvent({
        current,
        eventType: RaceEventType.BRAKE_LOCK_FRONT_RIGHT,
        lapNumber,
        sectorNumber,
        severity: "INFO",
        confidence: persistedConf,
        lapTimeImpactS: 0.10,
        driverRiskRating: 2,
        triggerChannel: "RFwheelSpeed",
        triggerValue: rfSpeed,
        narrativeDescription: `Rallycross Front Right wheel locking enquired: sustained slip duration exceeds 220ms limit on asphalt transition.`,
        sourceTypes: ["deterministic_physics"],
        rationale: ["wheel_speed_decayed_below_slip_threshold", "minimum_duration_exceeded", "asphalt_surface_transition"],
        classification: "observed",
        latency,
        profile,
        detector: "LockupDetectorRallycross",
        detectorVersion: "1.1.0"
      }));
    }
  } else if (profile.className === "LMGT3") {
    if (!checkAndSetCooldown(RaceEventType.BRAKE_LOCK_FRONT_RIGHT)) {
      events.push(createTelemetryEvent({
        current,
        eventType: RaceEventType.BRAKE_LOCK_FRONT_RIGHT,
        lapNumber,
        sectorNumber,
        severity: "WARNING",
        confidence: persistedConf,
        lapTimeImpactS: 0.25,
        driverRiskRating: 4,
        triggerChannel: "RFwheelSpeed",
        triggerValue: rfSpeed,
        narrativeDescription: `Front Right wheel lockup moderated by ABS on [LMGT3] platform: wheel speed decayed to ${(rfSpeed * 3.6).toFixed(1)} km/h under brake pressure.`,
        sourceTypes: ["deterministic_physics"],
        rationale: ["wheel_speed_decayed_below_chassis_speed", "brake_pressure_applied", "abs_modulation_active"],
        classification: "observed",
        latency,
        profile,
        detector: "LockupDetectorLMGT3",
        detectorVersion: "1.1.0"
      }));
    }
  } else if (profile.className === "NASCAR") {
    if (!checkAndSetCooldown(RaceEventType.BRAKE_LOCK_FRONT_RIGHT)) {
      events.push(createTelemetryEvent({
        current,
        eventType: RaceEventType.BRAKE_LOCK_FRONT_RIGHT,
        lapNumber,
        sectorNumber,
        severity: "CRITICAL",
        confidence: persistedConf,
        lapTimeImpactS: 0.45,
        driverRiskRating: 7,
        triggerChannel: "RFwheelSpeed",
        triggerValue: rfSpeed,
        narrativeDescription: `Severe Front Right flat-spot lockup on [NASCAR] platform (No ABS): wheel speed dropped to ${(rfSpeed * 3.6).toFixed(1)} km/h under raw pedal pressure.`,
        sourceTypes: ["deterministic_physics"],
        rationale: ["wheel_speed_decayed_below_chassis_speed", "raw_brake_pedal_exceeded_grip_limit", "absence_of_abs"],
        classification: "observed",
        latency,
        profile,
        detector: "LockupDetectorNASCAR",
        detectorVersion: "1.1.0"
      }));
    }
  } else if (profile.className === "LMP2" || profile.className === "GTP" || profile.className === "SF23") {
    if (!checkAndSetCooldown(RaceEventType.BRAKE_LOCK_FRONT_RIGHT)) {
      events.push(createTelemetryEvent({
        current,
        eventType: RaceEventType.BRAKE_LOCK_FRONT_RIGHT,
        lapNumber,
        sectorNumber,
        severity: "CRITICAL",
        confidence: persistedConf,
        lapTimeImpactS: 0.40,
        driverRiskRating: 6,
        triggerChannel: "RFwheelSpeed",
        triggerValue: rfSpeed,
        narrativeDescription: `High-downforce Front Right axle lockup on [${profile.className}] prototype (No ABS): wheel speed dropped to ${(rfSpeed * 3.6).toFixed(1)} km/h during aero load decay.`,
        sourceTypes: ["deterministic_physics"],
        rationale: ["wheel_speed_decayed_below_chassis_speed", "downforce_load_decay_under_deceleration", "absence_of_abs"],
        classification: "observed",
        latency,
        profile,
        detector: "LockupDetectorLMP2",
        detectorVersion: "1.1.0"
      }));
    }
  } else {
    const severity = profile.hasAbs ? "WARNING" : "CRITICAL";
    const risk = profile.hasAbs ? 4 : 7;
    if (!checkAndSetCooldown(RaceEventType.BRAKE_LOCK_FRONT_RIGHT)) {
      events.push(createTelemetryEvent({
        current,
        eventType: RaceEventType.BRAKE_LOCK_FRONT_RIGHT,
        lapNumber,
        sectorNumber,
        severity,
        confidence: persistedConf,
        lapTimeImpactS: 0.35,
        driverRiskRating: risk,
        triggerChannel: "RFwheelSpeed",
        triggerValue: rfSpeed,
        narrativeDescription: `Front Right wheel lockup enquired on [${profile.className}] platform: wheel speed decayed to ${(rfSpeed * 3.6).toFixed(1)} km/h under brake pressure.`,
        sourceTypes: ["deterministic_physics"],
        rationale: ["wheel_speed_decayed_below_chassis_speed", "brake_pressure_applied"],
        classification: "observed",
        latency,
        profile,
        detector: "LockupDetectorDefault",
        detectorVersion: "1.0.0"
      }));
    }
  }
}

/**
 * Evaluates the telemetry ring buffer for anomalous physical patterns and
 * returns enqueued events, strictly checking class boundaries and state persistence.
 *
 * @param {object} current Normalized CoreTelemetryV1 frame
 * @param {object} ringBuffer The sliding window TelemetryRingBuffer instance
 * @param {object} rawOriginal Original raw packet from simulator
 * @param {object|null} vehicleProfile Dynamic vehicle class profile configuration
 * @returns {Array<object>} Array of triggered TelemetryEvent objects
 */
function evaluateEvents(current, ringBuffer, rawOriginal = {}, vehicleProfile = null) {
  const events = [];
  const lapNumber = current.lap.currentLap.value;
  const speed = current.car.speed.value; // m/s
  const derived = current.derived || {};

  const profile = vehicleProfile || resolveVehicleProfile(rawOriginal?.car ?? rawOriginal?.Car ?? "default");
  const sectorNumber = Number(rawOriginal.SectorNum ?? rawOriginal.sector ?? 1);
  const latency = current.timestamp.provenance?.latency || 0;

  // Resolve Capability Gates
  const capabilities = profile.capabilities || {
    aeroStallDetect: "Medium",
    brakeLockDetect: "High",
    diffInstability: "Medium",
    rideHeightSensitivity: "Medium"
  };

  // ==========================================
  // STATE ESTIMATION ACCELERATOR ADAPTER
  // If the frame has no estimation block (stateless fallback), update it locally!
  // ==========================================
  if (!current.estimation) {
    const TemporalStateEstimator = require("./temporalStateEstimator.cjs");
    const tempObserver = new TemporalStateEstimator();
    
    // Feed previous frame if exists in buffer to charge EWMA observer correctly
    const prevFrame = ringBuffer && ringBuffer.buffer && ringBuffer.buffer.length > 0 
      ? ringBuffer.buffer[ringBuffer.buffer.length - 1] 
      : null;
    
    if (prevFrame && prevFrame.estimation) {
      // Sync past state
      for (const k in tempObserver.persistedConfidence) {
        tempObserver.persistedConfidence[k] = prevFrame.estimation.rollingConfidence[k]?.value || 0;
      }
      for (const k in tempObserver.fusionSignals) {
        tempObserver.fusionSignals[k] = prevFrame.estimation.fusionSignals[k]?.value || 0;
      }
      for (const k in tempObserver.subsystemHealth) {
        tempObserver.subsystemHealth[k] = prevFrame.estimation.subsystemHealth[k]?.value || 0.0;
      }
      for (const k in tempObserver.hypotheses) {
        tempObserver.hypotheses[k] = prevFrame.estimation.hypotheses[k]?.value || 0.0;
      }
    }
    
    current.estimation = tempObserver.update(current, rawOriginal, profile);
  }

  const estimation = current.estimation;
  const persistedConf = estimation.rollingConfidence;

  // Retrieve state observer confidences
  const C_bottom_out = persistedConf.AERO_BOTTOM_OUT?.value || 0.0;
  const C_oscillation = persistedConf.AERO_PLATFORM_OSCILLATION?.value || 0.0;
  const C_stall = persistedConf.DIFFUSER_STALL?.value || 0.0;
  const C_lock_fl = persistedConf.BRAKE_LOCK_FRONT_LEFT?.value || 0.0;
  const C_lock_fr = persistedConf.BRAKE_LOCK_FRONT_RIGHT?.value || 0.0;
  const C_traction = persistedConf.REAR_TRACTION_COLLAPSE?.value || 0.0;
  const C_over_rotation = persistedConf.ENTRY_OVER_ROTATION?.value || 0.0;
  const C_understeer = persistedConf.EXIT_UNDERSTEER?.value || 0.0;
  const C_brake_migration = persistedConf.BRAKE_MIGRATION_ROTATION?.value || 0.0;
  const C_hybrid = persistedConf.HYBRID_DEPLOYMENT_SURGE?.value || 0.0;

  const rearHeight = rawOriginal.RrideHeight ?? (rawOriginal.rearRideHeight ? rawOriginal.rearRideHeight / 1000 : 0);

  // ==========================================
  // STATEFUL SEMANTIC TRIGGERS (Ct >= 0.40 Persistence Gate)
  // ==========================================

  // 1. BRAKE AXLE LOCKUPS (Front Left / Front Right)
  if (capabilities.brakeLockDetect !== "None") {
    const lfSpeed = rawOriginal.LFwheelSpeed ?? rawOriginal.lfSpeed;
    const rfSpeed = rawOriginal.RFwheelSpeed ?? rawOriginal.rfSpeed;

    if (C_lock_fl >= 0.40 && lfSpeed !== undefined) {
      triggerLockupLF(lfSpeed, speed, current, profile, lapNumber, sectorNumber, events, rawOriginal, C_lock_fl);
    }
    if (C_lock_fr >= 0.40 && rfSpeed !== undefined) {
      triggerLockupRF(rfSpeed, speed, current, profile, lapNumber, sectorNumber, events, rawOriginal, C_lock_fr);
    }
  }

  // 2. REAR AXLE TRACTION COLLAPSE
  if (capabilities.diffInstability !== "None" && C_traction >= 0.40) {
    const lrSpeed = rawOriginal.LRwheelSpeed ?? rawOriginal.lrSpeed;
    const rrSpeed = rawOriginal.RRwheelSpeed ?? rawOriginal.rrSpeed;
    const avgRearSpeed = lrSpeed !== undefined && rrSpeed !== undefined ? (lrSpeed + rrSpeed) / 2 : speed;

    if (!checkAndSetCooldown(RaceEventType.REAR_TRACTION_COLLAPSE)) {
      events.push(createTelemetryEvent({
        current,
        eventType: RaceEventType.REAR_TRACTION_COLLAPSE,
        lapNumber,
        sectorNumber,
        severity: "ADVISORY",
        confidence: C_traction,
        lapTimeImpactS: 0.25,
        driverRiskRating: profile.hasTractionControl ? 3 : 6,
        triggerChannel: "LRwheelSpeed",
        triggerValue: avgRearSpeed,
        narrativeDescription: `Rear driven-axle wheelspin enquired on [${profile.className}] platform: rolling persisted axle slip of ${(C_traction * 100).toFixed(1)}% exceeds TC thresholds.`,
        sourceTypes: ["deterministic_physics"],
        rationale: ["rear_driven_wheels_exceeded_chassis_velocity", "throttle_input_applied", "tc_saturation"],
        classification: "observed",
        latency,
        profile,
        detector: "RearTractionCollapseDetector",
        detectorVersion: "1.0.0"
      }));
    }
  }

  // 3. UNDERBODY AERO BOTTOM OUT
  if (capabilities.aeroStallDetect !== "None" && C_bottom_out >= 0.40) {
    const lfShockVel = Math.abs(rawOriginal.LFshockVel ?? rawOriginal.lfShockVel ?? 0);
    const rfShockVel = Math.abs(rawOriginal.RFshockVel ?? rawOriginal.rfShockVel ?? 0);
    const maxShockVel = Math.max(lfShockVel, rfShockVel);

    if (!checkAndSetCooldown(RaceEventType.AERO_BOTTOM_OUT)) {
      events.push(createTelemetryEvent({
        current,
        eventType: RaceEventType.AERO_BOTTOM_OUT,
        lapNumber,
        sectorNumber,
        severity: "WARNING",
        confidence: C_bottom_out,
        lapTimeImpactS: 0.15,
        driverRiskRating: 5,
        triggerChannel: "LFshockVel",
        triggerValue: maxShockVel,
        narrativeDescription: `Aerodynamic platform grounding enquired on [${profile.className}] underbody: sustained vertical damper deflection of ${(C_bottom_out * 100).toFixed(1)}% confidence exceeds aero limits.`,
        sourceTypes: ["deterministic_physics"],
        rationale: ["vertical_damper_velocity_exceeded_threshold", "high_speed_aerodynamic_load_compression"],
        classification: "observed",
        latency,
        profile,
        speed,
        detector: "AeroBottomOutDetector",
        detectorVersion: "1.0.0"
      }));
    }
  }

  // 4. CORNER ENTRY SNAP OVER-ROTATION (Decel snaps)
  if (C_over_rotation >= 0.40 && derived.oversteerIndex) {
    const oIndexVal = derived.oversteerIndex.value;
    if (!checkAndSetCooldown(RaceEventType.ENTRY_OVER_ROTATION)) {
      events.push(createTelemetryEvent({
        current,
        eventType: RaceEventType.ENTRY_OVER_ROTATION,
        lapNumber,
        sectorNumber,
        severity: "WARNING",
        confidence: C_over_rotation,
        lapTimeImpactS: 0.40,
        driverRiskRating: profile.className === "NASCAR" ? 4 : 6,
        triggerChannel: "oversteerIndex",
        triggerValue: oIndexVal,
        narrativeDescription: `Decel snap over-rotation enquired during corner entry on [${profile.className}] axle: actual yaw rate exceeds kinematically expected path with ${(C_over_rotation * 100).toFixed(1)}% persistent confidence.`,
        sourceTypes: ["deterministic_physics", "behavioral_model"],
        rationale: ["actual_yaw_rate_exceeded_kinematic_expectation", "abrupt_brake_release_gradient", "rear_tire_slip_angle_spike"],
        classification: "interpreted",
        latency,
        profile,
        detector: "DecelSnapOversteerDetector",
        detectorVersion: "1.0.0"
      }));
    }
  }

  // 5. EXIT LATERAL UNDERSTEER PUSH
  if (C_understeer >= 0.40 && derived.understeerIndex) {
    const uIndexVal = derived.understeerIndex.value;
    if (!checkAndSetCooldown(RaceEventType.EXIT_UNDERSTEER)) {
      events.push(createTelemetryEvent({
        current,
        eventType: RaceEventType.EXIT_UNDERSTEER,
        lapNumber,
        sectorNumber,
        severity: "ADVISORY",
        confidence: C_understeer,
        lapTimeImpactS: 0.30,
        driverRiskRating: 2,
        triggerChannel: "understeerIndex",
        triggerValue: uIndexVal,
        narrativeDescription: `Exit lateral understeer push enquired on [${profile.className}] front axle: turning rate falls short of kinematic bicycle path with ${(C_understeer * 100).toFixed(1)}% persistent confidence.`,
        sourceTypes: ["deterministic_physics"],
        rationale: ["actual_yaw_rate_falls_short_of_kinematic_path", "throttle_exit_acceleration_slip"],
        classification: "interpreted",
        latency,
        profile,
        detector: "ExitUndersteerDetector",
        detectorVersion: "1.0.0"
      }));
    }
  }

  // 6. GTP / HYPERCAR ADVANCED ANOMALIES
  if (capabilities.aeroStallDetect === "Very High" || capabilities.aeroStallDetect === "Extreme") {
    // 6a. Aero Platform Oscillation (Porpoising)
    if (C_oscillation >= 0.40) {
      const lfShockVel = Math.abs(rawOriginal.LFshockVel ?? rawOriginal.lfShockVel ?? 0);
      const rfShockVel = Math.abs(rawOriginal.RFshockVel ?? rawOriginal.rfShockVel ?? 0);
      if (!checkAndSetCooldown(RaceEventType.AERO_PLATFORM_OSCILLATION)) {
        events.push(createTelemetryEvent({
          current,
          eventType: RaceEventType.AERO_PLATFORM_OSCILLATION,
          lapNumber,
          sectorNumber,
          severity: "WARNING",
          confidence: C_oscillation,
          lapTimeImpactS: 0.20,
          driverRiskRating: 4,
          triggerChannel: "LFshockVel",
          triggerValue: Math.max(lfShockVel, rfShockVel),
          narrativeDescription: `High-speed aerodynamic heave resonance enquired on [${profile.className}] platform: out-of-phase damper oscillations registered at ${(C_oscillation * 100).toFixed(1)}% persistence.`,
          sourceTypes: ["deterministic_physics"],
          rationale: ["high_speed_aerodynamic_pitch_resonance", "out_of_phase_damper_deflection", "aero_heave_packers_saturated"],
          classification: "observed",
          latency,
          profile,
          speed,
          detector: "AeroPlatformOscillationDetector",
          detectorVersion: "1.0.0"
        }));
      }
    }

    // 6b. Diffuser Stall
    if (C_stall >= 0.40) {
      if (!checkAndSetCooldown(RaceEventType.DIFFUSER_STALL)) {
        events.push(createTelemetryEvent({
          current,
          eventType: RaceEventType.DIFFUSER_STALL,
          lapNumber,
          sectorNumber,
          severity: "CRITICAL",
          confidence: C_stall,
          lapTimeImpactS: 0.60,
          driverRiskRating: 6,
          triggerChannel: "RrideHeight",
          triggerValue: rearHeight,
          narrativeDescription: `Diffuser underbody vacuum stall enquired on [${profile.className}]: sustained flow detachment at ${(C_stall * 100).toFixed(1)}% confidence under acceleration.`,
          sourceTypes: ["deterministic_physics"],
          rationale: ["rear_ride_height_below_stall_limit", "venturi_pressure_seal_ruptured", "underbody_aerodynamic_choking"],
          classification: "observed",
          latency,
          profile,
          speed,
          detector: "DiffuserStallDetector",
          detectorVersion: "1.0.0"
        }));
      }
    }
  }

  // 6c. Brake Migration Corner Entry snapping
  if (profile.architecture?.abs === false && C_brake_migration >= 0.40 && derived.oversteerIndex) {
    if (!checkAndSetCooldown(RaceEventType.BRAKE_MIGRATION_ROTATION)) {
      events.push(createTelemetryEvent({
        current,
        eventType: RaceEventType.BRAKE_MIGRATION_ROTATION,
        lapNumber,
        sectorNumber,
        severity: "WARNING",
        confidence: C_brake_migration,
        lapTimeImpactS: 0.35,
        driverRiskRating: 5,
        triggerChannel: "oversteerIndex",
        triggerValue: derived.oversteerIndex.value,
        narrativeDescription: `Unstable corner entry over-rotation enquired under prototype brake migration: oversteer index at ${(C_brake_migration * 100).toFixed(1)}% persistent confidence.`,
        sourceTypes: ["deterministic_physics", "behavioral_model"],
        rationale: ["heavy_trail_braking_deceleration", "brake_bias_migration_limits_exceeded", "front_axle_contact_patch_saturation"],
        classification: "interpreted",
        latency,
        profile,
        detector: "BrakeMigrationRotationDetector",
        detectorVersion: "1.0.0"
      }));
    }
  }

  // 6d. Hybrid exit axle speed torque surge
  if (profile.architecture?.hybrid === true && C_hybrid >= 0.40) {
    const lrSpeed = rawOriginal.LRwheelSpeed ?? rawOriginal.lrSpeed;
    const rrSpeed = rawOriginal.RRwheelSpeed ?? rawOriginal.rrSpeed;
    const diff = lrSpeed !== undefined && rrSpeed !== undefined ? Math.abs(lrSpeed - rrSpeed) : 0;
    if (!checkAndSetCooldown(RaceEventType.HYBRID_DEPLOYMENT_SURGE)) {
      events.push(createTelemetryEvent({
        current,
        eventType: RaceEventType.HYBRID_DEPLOYMENT_SURGE,
        lapNumber,
        sectorNumber,
        severity: "WARNING",
        confidence: C_hybrid,
        lapTimeImpactS: 0.30,
        driverRiskRating: 4,
        triggerChannel: "LRwheelSpeed",
        triggerValue: diff,
        narrativeDescription: `Hybrid dynamic exit torque surge enquired on [${profile.className}] axle: rear wheel speed asymmetry exceeds constraints at ${(C_hybrid * 100).toFixed(1)}% persistent confidence.`,
        sourceTypes: ["deterministic_physics"],
        rationale: ["hybrid_torque_fill_onset", "driven_wheel_speed_differential_asymmetry", "exit_traction_limit_exceeded"],
        classification: "observed",
        latency,
        profile,
        detector: "HybridTorqueAsymmetryDetector",
        detectorVersion: "1.0.0"
      }));
    }
  }

  // ==========================================
  // HIGH-ORDER BAYESIAN SEMANTIC TRIGGERS
  // ==========================================

  // A. Bayesian Underbody Floor Damage Alert
  const floorDamageProb = estimation.hypotheses.floorDamage.value;
  if (floorDamageProb >= 0.80) {
    if (!checkAndSetCooldown(RaceEventType.FLOOR_DAMAGE_ALERT)) {
      events.push(createTelemetryEvent({
        current,
        eventType: RaceEventType.FLOOR_DAMAGE_ALERT,
        lapNumber,
        sectorNumber,
        severity: "CRITICAL",
        confidence: floorDamageProb,
        lapTimeImpactS: 0.50,
        driverRiskRating: 8,
        triggerChannel: "hypotheses.floorDamage",
        triggerValue: floorDamageProb,
        narrativeDescription: `CRITICAL VEHICLE SYSTEM ALERT: Aerodynamic floor/underbody damage enquired with ${(floorDamageProb * 100).toFixed(1)}% Bayesian probability. Dynamic vertical deflection and coupled resonance indicate structural floor choking.`,
        sourceTypes: ["probabilistic_projection", "historical_correlation"],
        rationale: ["bayesian_latent_fault_inference", "sustained_underbody_impacts", "coupled_platform_resonance"],
        classification: "interpreted",
        latency,
        profile,
        detector: "HypothesisFloorDamageEngine",
        detectorVersion: "1.0.0"
      }));
    }
  }

  // B. Bayesian Tire Degradation Alert
  const tireDegradationProb = estimation.hypotheses.tireDegradation.value;
  if (tireDegradationProb >= 0.75) {
    if (!checkAndSetCooldown(RaceEventType.TIRE_DEGRADATION_ALERT)) {
      events.push(createTelemetryEvent({
        current,
        eventType: RaceEventType.TIRE_DEGRADATION_ALERT,
        lapNumber,
        sectorNumber,
        severity: "WARNING",
        confidence: tireDegradationProb,
        lapTimeImpactS: 0.40,
        driverRiskRating: 5,
        triggerChannel: "hypotheses.tireDegradation",
        triggerValue: tireDegradationProb,
        narrativeDescription: `WARNING STRATEGIST SIGNAL: Significant tire degradation enquired with ${(tireDegradationProb * 100).toFixed(1)}% Bayesian probability. Cumulative rear driven slip energy and handling slides indicate compound adhesion decay.`,
        sourceTypes: ["probabilistic_projection", "historical_correlation"],
        rationale: ["bayesian_latent_fault_inference", "cumulative_axle_slip_energy", "lateral_adhesion_decay"],
        classification: "interpreted",
        latency,
        profile,
        detector: "HypothesisTireDegradationEngine",
        detectorVersion: "1.0.0"
      }));
    }
  }

  return events;
}

/**
 * Factory to compile a standard TelemetryEvent object conforming to ontology schemas.
 */
function createTelemetryEvent(opts) {
  const current = opts.current;
  const sourceTypes = opts.sourceTypes || ["deterministic_physics"];
  const baseConfidence = opts.confidence ?? 0.90;
  
  // Epistemic coherence: If the frame's estimation block records rolling confidence, use it!
  const eventPersistedConf = current?.estimation?.rollingConfidence?.[opts.eventType]?.value;
  let weightedConfidence = typeof eventPersistedConf === "number" ? eventPersistedConf : getSourceWeightedConfidence(baseConfidence, sourceTypes);

  // High-order Bayesian probability mapping backstop
  if (opts.eventType === RaceEventType.FLOOR_DAMAGE_ALERT && current?.estimation?.hypotheses?.floorDamage) {
    weightedConfidence = current.estimation.hypotheses.floorDamage.value;
  }
  if (opts.eventType === RaceEventType.TIRE_DEGRADATION_ALERT && current?.estimation?.hypotheses?.tireDegradation) {
    weightedConfidence = current.estimation.hypotheses.tireDegradation.value;
  }

  // Temporal Confidence Decay for events:
  // If the frame's latency is high, degrade event confidence.
  const latency = typeof opts.latency === "number" ? opts.latency : 0;
  if (latency > 100) {
    weightedConfidence = weightedConfidence * Math.max(0, 1 - (latency - 100) / 1000);
  }

  // Dynamic Speed-Dependent Operating Windows for Aerodynamics
  const isAeroEvent = opts.eventType === RaceEventType.AERO_BOTTOM_OUT ||
                      opts.eventType === RaceEventType.AERO_PLATFORM_OSCILLATION ||
                      opts.eventType === RaceEventType.DIFFUSER_STALL;

  if (isAeroEvent && opts.profile && typeof opts.speed === "number") {
    const minAeroSpeedMs = (opts.profile.minAeroSpeedKph || 120.0) / 3.6;
    if (opts.speed < minAeroSpeedMs) {
      const speedRatio = Math.min(1.0, Math.max(0, opts.speed) / minAeroSpeedMs);
      const scale = 0.2 + 0.8 * Math.pow(speedRatio, 2);
      weightedConfidence = weightedConfidence * scale;
    }
  }

  return {
    id: generateEventId(),
    timestamp: new Date().toISOString(),
    lapNumber: opts.lapNumber,
    sectorNumber: opts.sectorNumber,
    eventType: opts.eventType,
    priority: {
      severity: opts.severity,
      confidence: Number(weightedConfidence.toFixed(4)),
      persistence: 1,
      lapTimeImpactS: opts.lapTimeImpactS,
      driverRiskRating: opts.driverRiskRating
    },
    triggerChannel: opts.triggerChannel,
    triggerValue: Number(opts.triggerValue.toFixed(4)),
    narrativeDescription: opts.narrativeDescription,
    physicsTruthBoundary: {
      sourceTypes: sourceTypes
    },
    rationale: opts.rationale || [],
    classification: opts.classification || "observed",
    detector: opts.detector || "LockupDetectorDefault",
    detectorVersion: opts.detectorVersion || "1.0.0",
    physicsProfile: opts.profile?.physicsProfile || opts.physicsProfile || "DEFAULT_iRacing",
    physicsProfileVersion: opts.profile?.physicsProfileVersion || opts.physicsProfileVersion || "1.0.0"
  };
}

function clearCooldowns() {
  activeCooldowns.clear();
}

module.exports = {
  evaluateEvents,
  RaceEventType,
  clearCooldowns
};
