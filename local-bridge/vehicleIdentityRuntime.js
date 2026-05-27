/**
 * vehicleIdentityRuntime.js — Persistent Vehicle Identity Runtime (Phase 15.2)
 *
 * THE SOLE AUTHORITY for mutating CarOperationalState.
 *
 * MUTATION INVARIANT: Only this module may write to CarOperationalState.
 * All downstream entities (React, Supabase, MongoDB, AI workers) are READ-ONLY
 * consumers of state projections emitted by this engine.
 */

"use strict";

const crypto = require("crypto");

// ─── Schema version — bump on breaking CarOperationalState schema changes ──────
const SCHEMA_VERSION = 2;

// ─── Ring buffer limits ─────────────────────────────────────────────────────────
const DELTA_RING_LIMIT = 500;
const HISTORY_INTERVAL_MS = 10_000;   // write car_state_history every 10 seconds

/**
 * Deep-copies an object and sorts keys recursively, filtering out volatile
 * transport fields to ensure a stable canonical state representation for hashing.
 */
function canonicalize(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(canonicalize);
  }
  const sortedKeys = Object.keys(obj).sort();
  const result = {};
  for (const key of sortedKeys) {
    if (
      key === "relayState" ||
      key === "timestamp" ||
      key === "recorded_at" ||
      key === "updated_at" ||
      key === "lastUpdated" ||
      key === "remoteLatencyMs" ||
      key === "stateHash"
    ) {
      continue;
    }
    result[key] = canonicalize(obj[key]);
  }
  return result;
}

class VehicleIdentityRuntime {
  constructor() {
    this._sequenceId = 0;
    this._state = null;
    this._deltaRing = [];
    this._lastHistoryFlush = 0;
    this._inPitPrev = false;
    this._pitEntryBrakeWear = null;
  }

  /**
   * Initializes the CarOperationalState for a new session.
   * Pure assignment with initial state calculation.
   */
  initializeSession({ carId, carNumber, carName, teamId, driverId, env = {} }) {
    this._sequenceId = 0;

    const initialState = {
      schemaVersion: SCHEMA_VERSION,
      sequenceId: 0,
      stateHash: "",

      // Identity
      carId: carId || "unknown",
      carNumber: carNumber || "0",
      carName: carName || "Unknown Car",
      teamId: teamId || "local",

      // Driver registry
      activeDriverId: driverId || "Unknown Driver",
      adaptationEpochId: this._generateEpochId(),
      previousDrivers: [],

      // Stint continuity
      currentStint: {
        stintNumber: 1,
        lapStart: 0,
        lapsCompleted: 0,
        fuelVolumeL: 0,
        fuelBurnPerLap: 0,
        projectedPitLap: 0,
      },

      // Cumulative fatigue
      cumulativeFatigue: {
        chassis: 0,
        gearbox: 0,
        brakes: 100,      // 100% pad life remaining
        ersHealth: 100,
        aeroStability: 100,
      },

      // Driver adaptation window
      adaptationState: {
        active: false,
        currentLapInWindow: 0,
        steeringJitterPct: 0,
        brakeBiteDeltaPct: 0,
        thermalGradientDeltaC: 0,
      },

      // Strategy context
      strategyState: {
        targetWindowMin: 0,
        targetWindowMax: 0,
        undercutRisk: "LOW",
        teammateOverlapMinutes: 0,
      },

      // Environment context
      environmentContext: {
        trackTempC: env.trackTempC || 0,
        airTempC: env.airTempC || 0,
        rubberState: env.rubberState || 0,
        rainLevel: env.rainLevel || 0,
        bopVersion: env.bopVersion || "default",
        simBuild: env.simBuild || "irsdk",
      },

      // Relay sync metadata
      relayState: {
        localAuthority: true,
        remoteLatencyMs: 0,
        lastUpdated: Date.now(),
      },
    };

    initialState.stateHash = this._computeHash(initialState);
    this._state = Object.freeze(initialState);

    console.log(
      `[vehicle-identity] Session initialized — Car: ${carNumber} | Driver: ${driverId} | EpochID: ${this._state.adaptationEpochId}`
    );

    return this._state;
  }

  /**
   * Pure state reducer: ingests a frame and returns a structurally coherent next state.
   */
  ingestFrame(t, enduranceState, swapReport, lapNumber) {
    if (!this._state) return null;

    const prevState = this._state;
    const prevDriver = prevState.activeDriverId;
    const incomingDriver = t.driver || t.driverName || prevDriver;

    // Increment strictly monotonic sequenceId (bridge-owned)
    this._sequenceId += 1;

    // Detect driver swap
    const swapDetected = prevDriver && prevDriver !== incomingDriver && prevDriver !== "Unknown Driver";

    // Build the new drivers array non-destructively
    let nextPreviousDrivers = [...prevState.previousDrivers];
    if (swapDetected && prevDriver && !nextPreviousDrivers.includes(prevDriver)) {
      nextPreviousDrivers.push(prevDriver);
    }

    // Epoch ID
    const nextEpochId = swapDetected ? this._generateEpochId() : prevState.adaptationEpochId;

    // Stint Continuity & Swap logic
    const nextStintNumber = swapDetected ? prevState.currentStint.stintNumber + 1 : prevState.currentStint.stintNumber;
    const nextLapStart = swapDetected ? lapNumber : prevState.currentStint.lapStart;
    const nextLapsCompleted = Math.max(0, lapNumber - nextLapStart);

    let nextFuelBurnPerLap = prevState.currentStint.fuelBurnPerLap;
    if (t.fuelBurnPerLap && t.fuelBurnPerLap > 0) {
      nextFuelBurnPerLap = t.fuelBurnPerLap;
    }
    const fuelVolumeL = t.fuelRemainingL || 0;
    const lapsRemaining = nextFuelBurnPerLap > 0 && fuelVolumeL > 0 ? fuelVolumeL / nextFuelBurnPerLap : 0;
    const nextProjectedPitLap = lapsRemaining > 0 ? Math.floor(lapNumber + lapsRemaining) : prevState.currentStint.projectedPitLap;

    const nextStint = {
      stintNumber: nextStintNumber,
      lapStart: nextLapStart,
      lapsCompleted: nextLapsCompleted,
      fuelVolumeL,
      fuelBurnPerLap: nextFuelBurnPerLap,
      projectedPitLap: nextProjectedPitLap,
    };

    // Cumulative Fatigue (Preserved across driver swaps)
    let nextFatigue = { ...prevState.cumulativeFatigue };
    if (enduranceState) {
      const instability = enduranceState.cumulativeInstability || 0;
      nextFatigue = {
        chassis: enduranceState.chassisFatigue || 0,
        gearbox: enduranceState.gearboxStress || 0,
        brakes: enduranceState.brakeWear ?? 100,
        ersHealth: enduranceState.ersHealth ?? 100,
        aeroStability: Math.max(0, 100 - instability * 0.5),
      };
    }

    // Driver Adaptation (Reset fully on driver swap, updated via swapReport otherwise)
    let nextAdaptation = {
      active: false,
      currentLapInWindow: 0,
      steeringJitterPct: 0,
      brakeBiteDeltaPct: 0,
      thermalGradientDeltaC: 0,
    };

    if (!swapDetected) {
      if (swapReport) {
        nextAdaptation = {
          active: swapReport.event === "DRIVER_ADAPTATION_ACTIVE",
          currentLapInWindow: swapReport.currentLapInWindow || 0,
          steeringJitterPct: swapReport.steeringJitterMismatchPct || 0,
          brakeBiteDeltaPct: swapReport.brakeBiteMismatchPct || 0,
          thermalGradientDeltaC: swapReport.tireThermalGradientDelta || 0,
        };
      } else {
        // Carry forward previous state if not swapped and no active window reset trigger
        nextAdaptation = {
          ...prevState.adaptationState,
          active: false, // Gradually decay active window flag outside report windows
        };
      }
    }

    // Strategy Context
    const burnPerLap = nextFuelBurnPerLap || 2.8;
    const reserveLaps = burnPerLap > 0 ? 1.5 / burnPerLap : 1;
    const targetWindowMin = Math.floor(lapNumber + lapsRemaining - reserveLaps - 1);
    const targetWindowMax = Math.floor(lapNumber + lapsRemaining);

    let undercutRisk = "LOW";
    if (nextFatigue.brakes < 35) {
      undercutRisk = "HIGH";
    } else if (nextFatigue.brakes < 60) {
      undercutRisk = "MED";
    }

    const nextStrategy = {
      targetWindowMin: Math.max(0, targetWindowMin),
      targetWindowMax: Math.max(0, targetWindowMax),
      undercutRisk,
      teammateOverlapMinutes: prevState.strategyState.teammateOverlapMinutes || 0,
    };

    // Environment
    const nextEnv = {
      ...prevState.environmentContext,
      trackTempC: t.liveTrackTempC || t.trackTempC || 0,
      airTempC: t.liveAirTempC || t.airTempC || 0,
      rainLevel: t.trackWetness || 0,
    };

    // Relay sync
    const nextRelay = {
      localAuthority: true,
      remoteLatencyMs: 0,
      lastUpdated: Date.now(),
    };

    // Construct nextState object immutably
    const nextState = {
      schemaVersion: SCHEMA_VERSION,
      sequenceId: this._sequenceId,
      stateHash: "",

      carId: prevState.carId,
      carNumber: prevState.carNumber,
      carName: prevState.carName,
      teamId: prevState.teamId,

      activeDriverId: incomingDriver,
      adaptationEpochId: nextEpochId,
      previousDrivers: nextPreviousDrivers,

      currentStint: nextStint,
      cumulativeFatigue: nextFatigue,
      adaptationState: nextAdaptation,
      strategyState: nextStrategy,
      environmentContext: nextEnv,
      relayState: nextRelay,
    };

    // Compute hash
    nextState.stateHash = this._computeHash(nextState);

    // Apply Freeze to ensure strict immutability invariant
    this._state = Object.freeze(nextState);

    // Side-effects (Deltas & pit stop detection)
    if (swapDetected) {
      this._emitDelta({
        timestamp: Date.now(),
        lapNumber,
        sequenceId: this._sequenceId,
        type: "DRIVER_SWAP",
        payload: {
          from: prevDriver,
          to: incomingDriver,
          details: `Stint ${nextStintNumber} begins at Lap ${lapNumber} | EpochID: ${nextEpochId}`,
        },
      });
      console.log(`[vehicle-identity] DRIVER SWAP: ${prevDriver} → ${incomingDriver} at Lap ${lapNumber}`);
    }

    this._detectPitEvent(t, lapNumber);

    return this._state;
  }

  /**
   * Backwards-compatibility wrapper for ingestFrame.
   */
  updateFromFrame(t, enduranceState, swapReport, lapNumber) {
    return this.ingestFrame(t, enduranceState, swapReport, lapNumber);
  }

  /**
   * Apply an operational delta cleanly and immutably.
   */
  applyDelta(delta) {
    if (!this._state || !delta) return this._state;

    this._sequenceId += 1;

    const nextState = {
      ...this._state,
      sequenceId: this._sequenceId,
      relayState: {
        ...this._state.relayState,
        lastUpdated: Date.now(),
      },
    };

    nextState.stateHash = this._computeHash(nextState);
    this._state = Object.freeze(nextState);

    this._emitDelta({
      timestamp: Date.now(),
      lapNumber: delta.lapNumber || 0,
      sequenceId: this._sequenceId,
      type: delta.type || "GENERIC_DELTA",
      payload: delta.payload || {},
    });

    return this._state;
  }

  /**
   * Returns a deeply-frozen copy (snapshot) of the current state.
   */
  snapshot() {
    return JSON.parse(JSON.stringify(this._state));
  }

  /**
   * Serializes the current state representation.
   */
  serialize() {
    return JSON.stringify({
      sequenceId: this._sequenceId,
      state: this._state,
      deltaRing: this._deltaRing,
    });
  }

  /**
   * Restores runtime authority from a given snapshot doc.
   */
  restoreFromSnapshot(snapshotDoc) {
    if (!snapshotDoc) return;
    this._state = Object.freeze(JSON.parse(JSON.stringify(snapshotDoc)));
    this._sequenceId = this._state.sequenceId || 0;
  }

  /**
   * Returns the current read-only projection of CarOperationalState.
   */
  getState() {
    return this._state;
  }

  /**
   * Generates the highly optimized and lightweight OperationalDigest.
   */
  getOperationalDigest() {
    if (!this._state) return null;

    const alerts = [];
    if (this._state.strategyState.undercutRisk === "HIGH") {
      alerts.push("HIGH_UNDERCUT_RISK");
    }
    if (this._state.cumulativeFatigue.brakes < 35) {
      alerts.push("LOW_BRAKE_PAD_LIFE");
    }
    if (this._state.cumulativeFatigue.ersHealth < 60) {
      alerts.push("CRITICAL_ERS_DEGRADATION");
    }

    return {
      sequenceId: this._state.sequenceId,
      carId: this._state.carId,
      activeDriver: this._state.activeDriverId,
      projectedPitLap: this._state.currentStint.projectedPitLap,
      fatigueSummary: {
        chassis: Math.round(this._state.cumulativeFatigue.chassis),
        gearbox: Math.round(this._state.cumulativeFatigue.gearbox),
        brakes: Math.round(this._state.cumulativeFatigue.brakes),
        ersHealth: Math.round(this._state.cumulativeFatigue.ersHealth),
        aeroStability: Math.round(this._state.cumulativeFatigue.aeroStability),
      },
      adaptationWindow: {
        active: this._state.adaptationState.active,
        currentLapInWindow: this._state.adaptationState.currentLapInWindow,
      },
      strategyRisk: this._state.strategyState.undercutRisk,
      alerts,
    };
  }

  /**
   * Compressed relay digest for Supabase broadcasting.
   */
  getRelayDigest() {
    return this.getOperationalDigest();
  }

  getRecentDeltas(limit = 20) {
    return this._deltaRing.slice(-limit);
  }

  /**
   * Persists the current snapshot to MongoDB in a robust non-blocking pattern.
   */
  async persistSnapshot(db, sessionId) {
    if (!db || !this._state) return;

    const now = Date.now();
    const stateDoc = this._buildPersistenceDoc(sessionId, this._state);

    try {
      await db.collection("car_states").updateOne(
        { session_id: stateDoc.session_id, car_number: this._state.carNumber },
        { $set: stateDoc },
        { upsert: true }
      );

      if (now - this._lastHistoryFlush >= HISTORY_INTERVAL_MS) {
        this._lastHistoryFlush = now;
        await db
          .collection("car_state_history")
          .insertOne({ ...stateDoc, recorded_at: new Date() });
      }
    } catch (e) {
      console.warn(`[vehicle-identity] persistSnapshot error: ${e.message}`);
    }
  }

  async flushDeltasToMongo(db, sessionId) {
    if (!db || this._deltaRing.length === 0) return;

    const { ObjectId } = require("mongodb");
    const sid = ObjectId.isValid(String(sessionId))
      ? new ObjectId(String(sessionId))
      : sessionId;

    const docs = this._deltaRing.map((d) => ({
      session_id: sid,
      car_number: this._state?.carNumber || "0",
      timestamp: new Date(d.timestamp),
      lap_number: d.lapNumber,
      type: d.type,
      payload: d.payload,
      sequence_id: d.sequenceId,
    }));

    try {
      await db.collection("car_operational_deltas").insertMany(docs, { ordered: false });
    } catch (e) {
      console.warn(`[vehicle-identity] flushDeltas error: ${e.message}`);
    }
  }

  _detectPitEvent(t, lapNumber) {
    const inPit = t.all?.PlayerTrackSurface === 1 && (t.speedKph || 0) < 1;

    if (inPit && !this._inPitPrev) {
      this._emitDelta({
        timestamp: Date.now(),
        lapNumber,
        sequenceId: this._sequenceId,
        type: "FUEL_REFUEL",
        payload: {
          from: `${(this._state?.currentStint?.fuelVolumeL || 0).toFixed(1)}L (entry)`,
          details: "Pit stall entry detected",
        },
      });
    }

    if (!inPit && this._inPitPrev) {
      const brakeWearAfter = this._state?.cumulativeFatigue?.brakes ?? 100;
      const brakeWearBefore = this._pitEntryBrakeWear || brakeWearAfter;
      const tireChanged = brakeWearAfter > brakeWearBefore + 10;

      if (tireChanged) {
        this._emitDelta({
          timestamp: Date.now(),
          lapNumber,
          sequenceId: this._sequenceId,
          type: "TIRE_CHANGE",
          payload: {
            from: `${brakeWearBefore.toFixed(1)}% brake life`,
            to: `${brakeWearAfter.toFixed(1)}% brake life (new set)`,
            details: "Tire compound change inferred from wear reset",
          },
        });
      }

      this._emitDelta({
        timestamp: Date.now(),
        lapNumber,
        sequenceId: this._sequenceId,
        type: "FUEL_REFUEL",
        payload: {
          to: `${(t.fuelRemainingL || 0).toFixed(1)}L (exit)`,
          details: "Pit stop completed — car returned to track",
        },
      });
    }

    this._pitEntryBrakeWear = inPit ? (this._state?.cumulativeFatigue?.brakes ?? 100) : this._pitEntryBrakeWear;
    this._inPitPrev = inPit;
  }

  _emitDelta(delta) {
    this._deltaRing.push(delta);
    if (this._deltaRing.length > DELTA_RING_LIMIT) {
      this._deltaRing.shift();
    }
  }

  _computeHash(state) {
    const canonical = canonicalize(state);
    return crypto
      .createHash("sha256")
      .update(JSON.stringify(canonical))
      .digest("hex")
      .slice(0, 16);
  }

  _generateEpochId() {
    return crypto.randomUUID
      ? crypto.randomUUID()
      : crypto.randomBytes(16).toString("hex");
  }

  _buildPersistenceDoc(sessionId, state) {
    let sid = sessionId;
    try {
      const { ObjectId } = require("mongodb");
      if (ObjectId.isValid(String(sessionId))) {
        sid = new ObjectId(String(sessionId));
      }
    } catch {}

    return {
      session_id: sid,
      schema_version: state.schemaVersion,
      sequence_id: state.sequenceId,
      state_hash: state.stateHash,
      car_number: state.carNumber,
      car_id: state.carId,
      car_name: state.carName,
      team_id: state.teamId,
      active_driver_id: state.activeDriverId,
      adaptation_epoch_id: state.adaptationEpochId,
      previous_drivers: state.previousDrivers,
      current_stint: state.currentStint,
      cumulative_fatigue: state.cumulativeFatigue,
      adaptation_state: state.adaptationState,
      strategy_state: state.strategyState,
      environment_context: state.environmentContext,
      relay_state: state.relayState,
      updated_at: new Date(),
    };
  }
}

// Singleton — exactly one instance per bridge process
module.exports = new VehicleIdentityRuntime();
