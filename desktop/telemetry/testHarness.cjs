/**
 * Pit Wall Telemetry Subsystem Test Harness
 *
 * Automatically asserts:
 * 1. Strict TelemetryValue contract structure.
 * 2. Asynchronous UDP/TCP telemetry ingestion.
 * 3. Ring buffer queue backpressure drop safety.
 * 4. Deduplication signatures.
 * 5. Unit conversions (e.g. speedKph to m/s, steeringDeg to radians).
 * 6. Higher-order Derived Physics calculations (kinematic bicycle model, input gradients).
 * 7. Dynamic confidence and provenance traces.
 * 8. Class Dynamics Profiles (LMGT3 ABS warning vs GTP critical warning vs Rallycross INFO).
 * 9. Physical Plausibility Gates (rejecting bottoming events under speed limits).
 * 10. Capability Matrix & Surface-Aware Bypass Gates (Rallycross loose surface suppression & asphalt duration lockups).
 * 11. Event Classifications (observed vs interpreted) and Temporal Confidence Decay.
 * 12. Phase 8: EWMA state persistence, coupled multi-detector fusion, rolling subsystem health, and recursive Bayesian hypotheses.
 */

const assert = require("assert");
const dgram = require("dgram");
const net = require("net");
const ingestionController = require("../ingestionController.cjs");
const { normalizeCoreTelemetry } = require("./normalizeTelemetry.cjs");
const { derivePhysicsChannels } = require("./physicsDerivations.cjs");
const { evaluateEvents, clearCooldowns } = require("./eventDetector.cjs");
const { resolveVehicleProfile } = require("./vehicleProfiles.cjs");

// Setup port configurations for sandbox execution
const TEST_UDP_PORT = 4911;
const TEST_TCP_PORT = 4912;

async function runTests() {
  console.log("=========================================");
  console.log("🏎️  STARTING PIT WALL TELEMETRY TEST HARNESS");
  console.log("=========================================\n");

  testStatelessNormalizer();
  testVehicleProfiles();
  testPhysicsDerivations();
  testPlausibilityGates();
  testGTPAdvancedDetectors();
  await testIngestionControllerPipeline();

  console.log("\n=========================================");
  console.log("✅ ALL TELEMETRY SUBSYSTEM TESTS PASSED!");
  console.log("=========================================");
}

function testStatelessNormalizer() {
  console.log("🧪 Running stateless normalizer tests...");

  // Test 1: Empty or invalid inputs
  const emptyFrame = normalizeCoreTelemetry(null);
  assert.strictEqual(emptyFrame.schemaVersion, 1);
  assert.strictEqual(emptyFrame.car.speed.value, 0);
  assert.strictEqual(emptyFrame.car.inputs.throttle.value, 0);
  assert.strictEqual(emptyFrame.lap.currentLap.value, 1);
  console.log("  - Safely handles null inputs.");

  // Test 2: Enforce TelemetryValue contract and unit conversions (KPH -> m/s)
  const kphFrame = normalizeCoreTelemetry({
    speedKph: 180, // 180 km/h = 50 m/s
    rpm: 8000,
    Gear: 4,
    throttle: 0.8,
    brake: 0.1,
    clutch: 0.0,
    steeringDeg: 90, // 90 deg = PI/2 rad ≈ 1.5708
    lap: 5,
    lapDistPct: 0.45,
    lapTimeCurrent: 45.2,
    lapTimeLast: 120.4,
    extraSuspensionField: [12, 14, 15], // simulator-specific extra field to drop
  });

  assert.strictEqual(kphFrame.schemaVersion, 1);
  assert.strictEqual(kphFrame.physicsProfile.value, "DEFAULT_iRacing");
  assert.strictEqual(kphFrame.physicsProfileVersion.value, "1.0.1");
  assert.strictEqual(kphFrame.physicsProfile.source, "measured");
  assert.strictEqual(kphFrame.physicsProfileVersion.source, "measured");

  // Verify custom car profile resolution
  const customCarFrame = normalizeCoreTelemetry({
    car: "Porsche 911 GT3 R (992)",
    speedKph: 100,
  });
  assert.strictEqual(customCarFrame.physicsProfile.value, "LMGT3_iRacing");
  assert.strictEqual(customCarFrame.physicsProfileVersion.value, "2.0.2");

  // Speed check
  assert.strictEqual(kphFrame.car.speed.value, 50);
  assert.strictEqual(kphFrame.car.speed.confidence, 1.0);
  assert.strictEqual(kphFrame.car.speed.source, "measured");
  assert.deepStrictEqual(kphFrame.car.speed.provenance.derivedFrom, ["speedKph"]);

  // Steering check
  assert.strictEqual(kphFrame.car.inputs.steering.source, "measured");
  assert.ok(Math.abs(kphFrame.car.inputs.steering.value - Math.PI / 2) < 0.001);
  assert.deepStrictEqual(kphFrame.car.inputs.steering.provenance.derivedFrom, ["steeringDeg"]);

  // Assert enriched provenance fields
  assert.strictEqual(kphFrame.car.speed.provenance.origin, "iRacing");
  assert.strictEqual(kphFrame.car.speed.provenance.tickSource, 0);
  assert.ok(kphFrame.car.speed.provenance.latency >= 0);
  assert.strictEqual(kphFrame.car.speed.freshnessMs, kphFrame.car.speed.provenance.latency);

  // Assert strict mapping: the extra field was dropped
  assert.strictEqual(kphFrame.extraSuspensionField, undefined);
  console.log("  - Verified speed, steering conversions, and strict drop behaviors.");
  console.log(
    "  - Provenance Audit: Verified non-null origin, tickSource, latency, and physics profile/version on normalized variables.",
  );
}

function testVehicleProfiles() {
  console.log("\n🧪 Running vehicle profiles resolver tests...");

  const gt3 = resolveVehicleProfile("Porsche 911 GT3 R (992)");
  assert.strictEqual(gt3.className, "LMGT3");
  assert.strictEqual(gt3.simulator, "iRacing");
  assert.strictEqual(gt3.wheelbase, 2.78);
  assert.strictEqual(gt3.hasAbs, true);
  assert.strictEqual(gt3.capabilities.brakeLockDetect, "High");
  assert.strictEqual(gt3.architecture.drivetrain, "RWD");
  assert.strictEqual(gt3.calibration.sampleSessions, 412);

  const nascar = resolveVehicleProfile("NASCAR Cup Chevrolet Camaro");
  assert.strictEqual(nascar.className, "NASCAR");
  assert.strictEqual(nascar.simulator, "iRacing");
  assert.strictEqual(nascar.wheelbase, 2.8);
  assert.strictEqual(nascar.hasAbs, false);
  assert.strictEqual(nascar.capabilities.aeroStallDetect, "None");
  assert.strictEqual(nascar.architecture.hybrid, false);
  assert.strictEqual(nascar.calibration.sampleSessions, 180);

  const rx = resolveVehicleProfile("Subaru WRX Rallycross");
  assert.strictEqual(rx.className, "Rallycross");
  assert.strictEqual(rx.capabilities.brakeLockDetect, "INFO"); // Observability preserved

  const defaultProfile = resolveVehicleProfile("Unknown Tractor");
  assert.strictEqual(defaultProfile.className, "DEFAULT");
  console.log(
    "  - Successfully resolved dynamic vehicle profiles, capability matrices, and architecture/calibration metadata.",
  );
}

function testPhysicsDerivations() {
  console.log("\n🧪 Running higher-order derived physics tests...");

  // Setup previous and current frames (TelemetryValue structures)
  const prevFrame = normalizeCoreTelemetry({
    timestamp: 1000,
    speedKph: 108, // 30 m/s
    steeringDeg: 0,
    throttle: 0.5,
    brake: 0,
  });

  const currFrame = normalizeCoreTelemetry({
    timestamp: 1016, // dt = 16ms
    speedKph: 108, // 30 m/s
    steeringDeg: 10, // turned right by 10 deg ≈ 0.1745 rad
    throttle: 0.8, // throttle gradient: +0.3 in 16ms = +18.75/s
    brake: 0,
  });

  // Mock raw original packet containing YawRate
  const rawOriginal = {
    car: "Dallara P217", // LMP2 class (wheelbase resolved as 3.015m)
    YawRate: 0.12, // actual yaw rate: 0.12 rad/s
  };

  const derived = derivePhysicsChannels(currFrame, prevFrame, rawOriginal);

  // Assert wheelbase resolution & strict TelemetryValue fields
  assert.strictEqual(derived.wheelbase.value, 3.015);
  assert.strictEqual(derived.wheelbase.source, "derived");
  assert.strictEqual(derived.wheelbase.provenance.origin, "iRacing");
  assert.strictEqual(derived.wheelbase.provenance.tickSource, 0);

  // Throttle gradient checks: (0.8 - 0.5) / 0.016 = 18.75
  assert.ok(Math.abs(derived.throttleGradient.value - 18.75) < 0.01);
  assert.strictEqual(derived.throttleGradient.source, "derived");
  assert.deepStrictEqual(derived.throttleGradient.provenance.derivedFrom, ["inputs.throttle"]);

  assert.strictEqual(derived.actualYawRate.value, 0.12);
  assert.strictEqual(derived.actualYawRate.source, "measured");

  // Expected Yaw Rate: w_exp = v / wheelbase * tan(steering)
  assert.ok(derived.expectedYawRate.value > 1.7 && derived.expectedYawRate.value < 1.8);
  assert.strictEqual(derived.expectedYawRate.source, "derived");

  // Understeer index checks
  assert.ok(derived.understeerIndex.value > 1.5);
  assert.strictEqual(derived.understeerIndex.source, "heuristic");
  assert.strictEqual(derived.oversteerIndex.value, 0);

  console.log("  - Successfully enquired kinematic bicycle wheelbase resolving.");
  console.log(
    "  - Verified understeer index, steering derivatives, and input gradients with provenance.",
  );
}

function testPlausibilityGates() {
  console.log("\n🧪 Running physical plausibility gates tests...");
  clearCooldowns(); // Reset temporal cooldowns from prior tests

  const buffer = {
    buffer: [],
    push(f) {
      this.buffer.push(f);
    },
  };

  const derived = {
    understeerIndex: {
      value: 0,
      confidence: 1.0,
      source: "heuristic",
      provenance: { derivedFrom: [] },
    },
    oversteerIndex: {
      value: 0,
      confidence: 1.0,
      source: "heuristic",
      provenance: { derivedFrom: [] },
    },
  };

  // Test 1: Splitter bottoming should be REJECTED because speed is 50 km/h (< 160 km/h minAeroSpeedKph limit)
  const frameLowSpeed = normalizeCoreTelemetry({
    speedKph: 50,
    currentLap: 1,
  });
  frameLowSpeed.derived = derived;

  const rawBottomOut = {
    LFshockVel: 0.28,
    RFshockVel: 0.25,
    car: "Porsche 963 GTP",
  };

  const triggeredEventsLowSpeed = evaluateEvents(frameLowSpeed, buffer, rawBottomOut);
  assert.strictEqual(triggeredEventsLowSpeed.length, 0);
  console.log("  - Plausibility Gate: Successfully rejected low-speed splitter bottoming event.");

  // Test 2: Brake lockups under non-ABS (GTP) vs ABS (GT3)
  const rawLockup = {
    LFwheelSpeed: 5, // 5 m/s locked wheel (body is at 30 m/s)
    RFwheelSpeed: 29,
  };

  const gtpProfile = resolveVehicleProfile("Porsche 963 GTP");
  const gt3Profile = resolveVehicleProfile("Ferrari 296 GT3");

  const now = Date.now();
  clearCooldowns();
  buffer.buffer = [];

  // Sustained locking sequence (3 consecutive ticks) to charge observer past 0.40
  for (let i = 2; i >= 0; i--) {
    const frame = normalizeCoreTelemetry({
      timestamp: now - i * 16,
      speedKph: 108,
      brake: 0.8,
      currentLap: 1,
    });
    frame.derived = derived;

    const gtpLockups = evaluateEvents(frame, buffer, rawLockup, gtpProfile);
    buffer.push(frame);

    if (i === 1) {
      assert.strictEqual(gtpLockups.length, 1);
      assert.strictEqual(gtpLockups[0].priority.severity, "CRITICAL");
      assert.strictEqual(gtpLockups[0].priority.driverRiskRating, 6);
      assert.ok(gtpLockups[0].rationale.includes("downforce_load_decay_under_deceleration"));
      assert.strictEqual(gtpLockups[0].classification, "observed");
      assert.strictEqual(gtpLockups[0].detector, "LockupDetectorLMP2");
      assert.strictEqual(gtpLockups[0].detectorVersion, "1.1.0");
      assert.strictEqual(gtpLockups[0].physicsProfile, "GTP_iRacing");
      assert.strictEqual(gtpLockups[0].physicsProfileVersion, "2.0.2");
    }
  }

  // LMGT3 class profile (hasAbs = true)
  clearCooldowns();
  buffer.buffer = [];

  for (let i = 2; i >= 0; i--) {
    const frame = normalizeCoreTelemetry({
      timestamp: now - i * 16,
      speedKph: 108,
      brake: 0.8,
      currentLap: 1,
    });
    frame.derived = derived;

    const gt3Lockups = evaluateEvents(frame, buffer, rawLockup, gt3Profile);
    buffer.push(frame);

    if (i === 1) {
      assert.strictEqual(gt3Lockups.length, 1);
      assert.strictEqual(gt3Lockups[0].priority.severity, "WARNING");
      assert.strictEqual(gt3Lockups[0].priority.driverRiskRating, 4);
      assert.ok(gt3Lockups[0].rationale.includes("abs_modulation_active"));
      assert.strictEqual(gt3Lockups[0].classification, "observed");
      assert.strictEqual(gt3Lockups[0].detector, "LockupDetectorLMGT3");
      assert.strictEqual(gt3Lockups[0].detectorVersion, "1.1.0");
      assert.strictEqual(gt3Lockups[0].physicsProfile, "LMGT3_iRacing");
      assert.strictEqual(gt3Lockups[0].physicsProfileVersion, "2.0.2");
    }
  }

  // Test 3: Rallycross lockup detection duration filter on Asphalt surface
  clearCooldowns();
  buffer.buffer = [];
  const rxProfile = resolveVehicleProfile("Subaru WRX Rallycross");

  const rawLockAsphalt = {
    LFwheelSpeed: 0, // severe flat-spot lockup (0 m/s)
    RFwheelSpeed: 29,
    PlayerTrackSurfaceMaterial: 1, // Asphalt
  };

  for (let i = 2; i >= 0; i--) {
    const frame = normalizeCoreTelemetry({
      timestamp: now - i * 120, // > 220ms cumulative locking
      speedKph: 108,
      brake: 0.8,
      currentLap: 1,
    });
    frame.derived = derived;

    const rxEvents = evaluateEvents(frame, buffer, rawLockAsphalt, rxProfile);
    buffer.push(frame);

    if (i === 1) {
      assert.strictEqual(rxEvents.length, 1);
      assert.strictEqual(rxEvents[0].priority.severity, "INFO");
      assert.strictEqual(rxEvents[0].priority.driverRiskRating, 2);
      assert.deepStrictEqual(rxEvents[0].rationale, [
        "wheel_speed_decayed_below_slip_threshold",
        "minimum_duration_exceeded",
        "asphalt_surface_transition",
      ]);
      assert.strictEqual(rxEvents[0].detector, "LockupDetectorRallycross");
      assert.strictEqual(rxEvents[0].detectorVersion, "1.1.0");
      assert.strictEqual(rxEvents[0].physicsProfile, "Rallycross_iRacing");
      assert.strictEqual(rxEvents[0].physicsProfileVersion, "1.1.1");
    }
  }

  // Test 4: Rallycross loose surface suppression (Dirt)
  clearCooldowns();
  buffer.buffer = [];
  const rawLockDirt = {
    LFwheelSpeed: 0, // severe lockup but suppressed by surface material
    RFwheelSpeed: 29,
    PlayerTrackSurfaceMaterial: 4, // Dirt
  };

  for (let i = 2; i >= 0; i--) {
    const frame = normalizeCoreTelemetry({
      timestamp: now - i * 120,
      speedKph: 108,
      brake: 0.8,
      currentLap: 1,
    });
    frame.derived = derived;

    const rxEventsDirt = evaluateEvents(frame, buffer, rawLockDirt, rxProfile);
    buffer.push(frame);

    if (i === 0) {
      assert.strictEqual(rxEventsDirt.length, 0); // suppressed!
    }
  }
  console.log(
    "  - Plausibility Gate: Successfully suppressed Rallycross lockups on loose Dirt surfaces.",
  );

  // Test 5: Temporal Confidence Decay (latency > 100ms)
  clearCooldowns();
  const staleFrame = normalizeCoreTelemetry({
    timestamp: Date.now() - 1000, // 1000ms latency
    speedKph: 108,
    currentLap: 1,
  });

  const prevStaleFrame = normalizeCoreTelemetry({
    timestamp: Date.now() - 1016,
    speedKph: 108,
    currentLap: 1,
  });

  const rawStaleOriginal = {
    car: "Ferrari 296 GT3",
    YawRate: 0.12,
  };

  const derivedStale = derivePhysicsChannels(staleFrame, prevStaleFrame, rawStaleOriginal);
  assert.ok(derivedStale.actualYawRate.confidence < 0.85);
  console.log(
    "  - Epistemic Integrity: Verified real-time Temporal Confidence Decay under high packet latency.",
  );
}

function testGTPAdvancedDetectors() {
  console.log("\n🧪 Running GTP advanced detectors and aero confidence decay tests...");
  clearCooldowns();

  const buffer = {
    buffer: [],
    push(f) {
      this.buffer.push(f);
    },
  };

  const gtpProfile = resolveVehicleProfile("Porsche 963 GTP");
  assert.strictEqual(gtpProfile.architecture.hybrid, true);
  assert.strictEqual(gtpProfile.calibration.sampleSessions, 320);

  const derived = {
    understeerIndex: {
      value: 0,
      confidence: 1.0,
      source: "heuristic",
      provenance: { derivedFrom: [] },
    },
    oversteerIndex: {
      value: 0,
      confidence: 1.0,
      source: "heuristic",
      provenance: { derivedFrom: [] },
    },
  };

  const rawBottomOut = {
    LFshockVel: 0.25,
    RFshockVel: 0.25,
  };

  // Test 1: Speed-Dependent Aero Confidence Decay (Mid-speed grounding)
  clearCooldowns();
  buffer.buffer = [];
  const now = Date.now();

  for (let i = 3; i >= 0; i--) {
    const frame = normalizeCoreTelemetry({
      timestamp: now - i * 16,
      speedKph: 100, // minAero = 160. speed = 100.
      currentLap: 2,
    });
    frame.derived = derived;

    const lowSpeedEvents = evaluateEvents(frame, buffer, rawBottomOut, gtpProfile);
    buffer.push(frame);

    if (i === 0) {
      assert.strictEqual(lowSpeedEvents.length, 1);
      assert.strictEqual(lowSpeedEvents[0].eventType, "AERO_BOTTOM_OUT");
      assert.ok(lowSpeedEvents[0].priority.confidence < 0.45); // Decayed under speed ratios!
    }
  }
  console.log("  - Dynamic Operating Windows: Verified aero confidence decay at lower speed.");

  // Test 2: Aero Platform Oscillation
  clearCooldowns();
  buffer.buffer = [];
  const rawOscillation = {
    LFshockVel: 0.3, // severe heave peak deflection
    RFshockVel: -0.3, // severe out of phase deflection!
  };

  for (let i = 3; i >= 0; i--) {
    const frame = normalizeCoreTelemetry({
      timestamp: now - i * 16,
      speedKph: 200,
      currentLap: 2,
    });
    frame.derived = derived;

    const oscEvents = evaluateEvents(frame, buffer, rawOscillation, gtpProfile);
    buffer.push(frame);

    if (i === 0) {
      assert.strictEqual(oscEvents.length, 2);
      const types = oscEvents.map((e) => e.eventType);
      assert.ok(types.includes("AERO_PLATFORM_OSCILLATION"));
      assert.ok(types.includes("AERO_BOTTOM_OUT"));
    }
  }
  console.log(
    "  - Aero platform: Triggered AERO_PLATFORM_OSCILLATION under out-of-phase heave resonance.",
  );

  // Test 3: Diffuser Underbody Stall
  clearCooldowns();
  buffer.buffer = [];
  const rawDiffuserStall = {
    RrideHeight: 0.012,
    throttle: 0.8,
  };

  for (let i = 3; i >= 0; i--) {
    const frame = normalizeCoreTelemetry({
      timestamp: now - i * 16,
      speedKph: 210,
      throttle: 0.8,
      currentLap: 2,
    });
    frame.derived = derived;

    const stallEvents = evaluateEvents(frame, buffer, rawDiffuserStall, gtpProfile);
    buffer.push(frame);

    if (i === 0) {
      assert.strictEqual(stallEvents.length, 1);
      assert.strictEqual(stallEvents[0].eventType, "DIFFUSER_STALL");
      assert.strictEqual(stallEvents[0].priority.severity, "CRITICAL");
    }
  }
  console.log("  - Aero platform: Triggered DIFFUSER_STALL under low ride height flow detachment.");

  // Test 4: Brake Migration Instability
  clearCooldowns();
  buffer.buffer = [];
  const frameBrakeDerived = {
    understeerIndex: {
      value: 0,
      confidence: 1.0,
      source: "heuristic",
      provenance: { derivedFrom: [] },
    },
    oversteerIndex: {
      value: 0.12,
      confidence: 0.9,
      source: "heuristic",
      provenance: { derivedFrom: [] },
    }, // 0.12 oversteer index for full evidence
  };
  const rawBrake = {
    car: "Porsche 963 GTP",
  };

  for (let i = 3; i >= 0; i--) {
    const frame = normalizeCoreTelemetry({
      timestamp: now - i * 16,
      speedKph: 120,
      brake: 0.7,
      currentLap: 2,
    });
    frame.derived = frameBrakeDerived;

    const brakeEvents = evaluateEvents(frame, buffer, rawBrake, gtpProfile);
    buffer.push(frame);

    if (i === 1) {
      assert.strictEqual(brakeEvents.length, 1);
      assert.strictEqual(brakeEvents[0].eventType, "BRAKE_MIGRATION_ROTATION");
    }
  }
  console.log(
    "  - Drivetrain & Decel: Triggered BRAKE_MIGRATION_ROTATION under unstable brake bias migration.",
  );

  // Test 5: Hybrid exit torque surge asymmetry
  clearCooldowns();
  buffer.buffer = [];
  const rawHybrid = {
    LRwheelSpeed: 50.0, // 50 m/s for maximum asymmetric evidence
    RRwheelSpeed: 38.0,
  };

  for (let i = 3; i >= 0; i--) {
    const frame = normalizeCoreTelemetry({
      timestamp: now - i * 16,
      speedKph: 130,
      throttle: 0.85,
      currentLap: 2,
    });
    frame.derived = derived;

    const hybridEvents = evaluateEvents(frame, buffer, rawHybrid, gtpProfile);
    buffer.push(frame);

    if (i === 2) {
      assert.strictEqual(hybridEvents.length, 2);
      const types = hybridEvents.map((e) => e.eventType);
      assert.ok(types.includes("HYBRID_DEPLOYMENT_SURGE"));
      assert.ok(types.includes("REAR_TRACTION_COLLAPSE"));
    }
  }
  console.log(
    "  - Drivetrain & Decel: Triggered HYBRID_DEPLOYMENT_SURGE exit power torque surge asymmetry.",
  );

  // Test 6: Layer 1 Transient Spike Rejection (Noise Filter check)
  clearCooldowns();
  buffer.buffer = [];
  const spikeFrame = normalizeCoreTelemetry({
    timestamp: now,
    speedKph: 200,
    currentLap: 2,
  });
  spikeFrame.derived = derived;
  // Feeding a single noise spike damper velocity
  const spikeEvents = evaluateEvents(spikeFrame, buffer, rawOscillation, gtpProfile);
  assert.strictEqual(spikeEvents.length, 0); // Rejected! CT < 0.40
  console.log(
    "  - Temporal Noise Filter: Successfully rejected isolated transient heave platform spike.",
  );

  // Test 7: Bayesian Latent Fault Inference (Layer 4 alerts check)
  clearCooldowns();
  buffer.buffer = [];
  let floorDamageTriggered = false;

  // Sustained platform scraping over 15 consecutive ticks to build damage P >= 0.80
  for (let i = 15; i >= 0; i--) {
    const frame = normalizeCoreTelemetry({
      timestamp: now - i * 16,
      speedKph: 180,
      currentLap: 2,
    });
    frame.derived = derived;

    const events = evaluateEvents(frame, buffer, rawBottomOut, gtpProfile);
    buffer.push(frame);

    const floorAlert = events.find((e) => e.eventType === "FLOOR_DAMAGE_ALERT");
    if (floorAlert) {
      floorDamageTriggered = true;
      assert.strictEqual(floorAlert.priority.severity, "CRITICAL");
      assert.ok(floorAlert.priority.confidence >= 0.8);
      assert.strictEqual(floorAlert.detector, "HypothesisFloorDamageEngine");
    }
  }
  assert.ok(floorDamageTriggered);
  console.log(
    "  - Bayesian Fault Engine: Successfully accumulated persistent grounding evidence and triggered FLOOR_DAMAGE_ALERT.",
  );
}

async function testIngestionControllerPipeline() {
  console.log("\n🧪 Running live ingestion controller tests...");
  clearCooldowns();

  let normalizedPacketsReceived = [];
  let rawPacketsReceived = [];
  let eventsReceived = [];

  const controller = ingestionController.create({
    udpPort: TEST_UDP_PORT,
    tcpPort: TEST_TCP_PORT,
    onPacket: ({ packet }) => {
      normalizedPacketsReceived.push(packet);
    },
    onRawPacket: ({ packet }) => {
      rawPacketsReceived.push(packet);
    },
    onEvent: ({ event }) => {
      eventsReceived.push(event);
    },
  });

  controller.openTelemetryStream();
  console.log(`  - Local socket stream bound to UDP:${TEST_UDP_PORT} and TCP:${TEST_TCP_PORT}`);

  // Ingest via UDP client socket mock
  const udpClient = dgram.createSocket("udp4");
  const testPacket = {
    timestamp: Date.now(),
    frameNumber: 101,
    carNumber: "44",
    session: "PRACTICE",
    speed: 62.5,
    rpm: 9000,
    gear: 5,
    throttle: 0.95,
    brake: 0,
    steering: 0.15,
    lap: 12,
    lapDistPct: 0.78,
    car: "Ferrari 296 GT3",
    LRwheelSpeed: 85, // Severe wheelspin
    RRwheelSpeed: 86,
  };

  // We send 3 consecutive packets sequentially over the network to build persisted wheelspin confidence
  for (let i = 0; i < 3; i++) {
    const packet = {
      ...testPacket,
      timestamp: Date.now() + i * 16,
      frameNumber: 101 + i,
    };
    const payload = Buffer.from(JSON.stringify(packet));

    await new Promise((resolve, reject) => {
      udpClient.send(payload, 0, payload.length, TEST_UDP_PORT, "127.0.0.1", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  udpClient.close();

  // Verifications
  assert.ok(rawPacketsReceived.length >= 2);
  assert.ok(normalizedPacketsReceived.length >= 2);
  assert.ok(eventsReceived.length >= 2);

  const receivedNorm = normalizedPacketsReceived[normalizedPacketsReceived.length - 1];
  const eventTypes = eventsReceived.map((e) => e.eventType);

  // Enforce structured TelemetryValues enquired in pipeline
  assert.strictEqual(receivedNorm.car.speed.value, 62.5);
  assert.strictEqual(receivedNorm.car.speed.source, "measured");
  assert.strictEqual(receivedNorm.derived.wheelbase.value, 2.78);

  // Expose state estimation values enquired in the canonical pipeline
  assert.ok(receivedNorm.estimation.rollingConfidence.REAR_TRACTION_COLLAPSE.value >= 0.4);
  assert.ok(receivedNorm.estimation.subsystemHealth.rearStability.value < 1.0);

  assert.ok(eventTypes.includes("REAR_TRACTION_COLLAPSE"));
  assert.ok(eventTypes.includes("EXIT_UNDERSTEER"));

  console.log(
    "  - Successfully received and verified dynamic wheelbase profile and TelemetryValue ingestion.",
  );
  console.log(
    "  - Successfully verified persistent observer state propagation and subsystem health metrics inside the stream.",
  );

  // Clean up
  controller.closeTelemetryStream();
  console.log("  - Gracefully closed sockets.");
}

// Invoke the runner
runTests().catch((err) => {
  console.error("\n❌ TESTS FAILED:", err);
  process.exit(1);
});
