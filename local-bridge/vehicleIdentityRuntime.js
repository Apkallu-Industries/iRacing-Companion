/**
 * vehicleIdentityRuntime.js — Persistent Vehicle Identity Runtime (Phase 15.2)
 *
 * THE SOLE AUTHORITY for mutating CarOperationalState.
 *
 * MUTATION INVARIANT: Only this module may write to CarOperationalState.
 * All downstream entities (React, Supabase, MongoDB, AI workers) are READ-ONLY
 * consumers of state projections emitted by this engine.
 *
 * Key capabilities:
 *   - Monotonic sequenceId (causal ordering authority)
 *   - SHA-256 stateHash (corruption + branch verification)
 *   - adaptationEpochId (UUID boundary per driver swap)
 *   - Stint continuity (tire life, fuel, lap counters across swaps)
 *   - Strategy context (undercut risk, window projection)
 *   - Event-sourced CarOperationalDelta log (persistent + in-memory ring)
 *   - MongoDB persistence to car_states, car_state_history, car_operational_deltas
 */

"use strict";

const crypto = require("crypto");

// ─── Schema version — bump on breaking CarOperationalState schema changes ──────
const SCHEMA_VERSION = 2;

// ─── Ring buffer limits ─────────────────────────────────────────────────────────
const DELTA_RING_LIMIT = 500;          // in-memory recent delta events
const HISTORY_INTERVAL_MS = 10_000;   // write car_state_history every 10 seconds

class VehicleIdentityRuntime {
  constructor() {
    this._sequenceId = 0;
    this._state = null;
    this._deltaRing = [];
    this._lastHistoryFlush = 0;
    this._snapshotIntervalTicks = 0;
  }

  // ─── Public: initialize state from scratch (called on first iRacing connect) ──

  /**
   * Initialize the CarOperationalState for a new session.
   * Must be called before any updateFromFrame() calls.
   *
   * @param {object} opts
   * @param {string} opts.carId      - iRacing CarIdx string (e.g. "963")
   * @param {string} opts.carNumber  - Race number (e.g. "04")
   * @param {string} opts.carName    - Visual name (e.g. "Porsche 963 GTP")
   * @param {string} opts.teamId     - Team Code (e.g. "PITWALL-X8F2")
   * @param {string} opts.driverId   - Initial driver name
   * @param {object} opts.env        - Environment context (track temps, BOP, etc.)
   */
  initializeSession({ carId, carNumber, carName, teamId, driverId, env = {} }) {
    this._sequenceId = 0;

    this._state = {
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

      // Cumulative fatigue (sourced from carStateRuntime sub-calculations)
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

    // Seal with initial hash
    this._state.stateHash = this._computeHash(this._state);

    console.log(
      `[vehicle-identity] Session initialized — Car: ${carNumber} | Driver: ${driverId} | EpochID: ${this._state.adaptationEpochId}`
    );

    return this._state;
  }

  // ─── Public: frame-level update (called every 60Hz tick) ──────────────────────

  /**
   * Absorbs a mapped telemetry frame and the endurance/swap sub-states
   * to produce the next CarOperationalState.
   *
   * ONLY this method writes to this._state.
   *
   * @param {object} t               - Mapped telemetry frame (from mapTelemetry())
   * @param {object} enduranceState  - Output of carStateRuntime.getCurrentState()
   * @param {object} swapReport      - Output of driverSwapContinuity.detectSwapAndTrackAdaptation()
   * @param {number} lapNumber       - Current lap number
   */
  updateFromFrame(t, enduranceState, swapReport, lapNumber) {
    if (!this._state) return null;

    const prevDriver = this._state.activeDriverId;
    const incomingDriver = t.driver || t.driverName || prevDriver;

    // ── Driver Swap Detection ────────────────────────────────────────────────
    const swapDetected = prevDriver && prevDriver !== incomingDriver && prevDriver !== "Unknown Driver";
    if (swapDetected) {
      this._handleDriverSwap(prevDriver, incomingDriver, lapNumber, t);
    }

    // ── Advance sequence ─────────────────────────────────────────────────────
    this._sequenceId += 1;
    this._state.sequenceId = this._sequenceId;

    // ── Update active driver ─────────────────────────────────────────────────
    this._state.activeDriverId = incomingDriver;

    // ── Stint continuity ─────────────────────────────────────────────────────
    const stintLap = lapNumber - this._state.currentStint.lapStart;
    this._state.currentStint.lapsCompleted = Math.max(0, stintLap);
    this._state.currentStint.fuelVolumeL = t.fuelRemainingL || 0;

    if (t.fuelBurnPerLap && t.fuelBurnPerLap > 0) {
      this._state.currentStint.fuelBurnPerLap = t.fuelBurnPerLap;
    }
    if (this._state.currentStint.fuelBurnPerLap > 0 && this._state.currentStint.fuelVolumeL > 0) {
      const lapsRemaining = this._state.currentStint.fuelVolumeL / this._state.currentStint.fuelBurnPerLap;
      this._state.currentStint.projectedPitLap = Math.floor(lapNumber + lapsRemaining);
    }

    // ── Cumulative fatigue (absorb from carStateRuntime sub-engine) ──────────
    if (enduranceState) {
      this._state.cumulativeFatigue.chassis = enduranceState.chassisFatigue || 0;
      this._state.cumulativeFatigue.gearbox = enduranceState.gearboxStress || 0;
      this._state.cumulativeFatigue.brakes  = enduranceState.brakeWear ?? 100;
      this._state.cumulativeFatigue.ersHealth = enduranceState.ersHealth ?? 100;

      // Aero stability approximation: inverse of cumulative instability count
      const instability = enduranceState.cumulativeInstability || 0;
      this._state.cumulativeFatigue.aeroStability = Math.max(0, 100 - instability * 0.5);
    }

    // ── Adaptation state (absorb from driverSwapContinuity sub-engine) ───────
    if (swapReport) {
      this._state.adaptationState = {
        active: swapReport.event === "DRIVER_ADAPTATION_ACTIVE",
        currentLapInWindow: swapReport.currentLapInWindow || 0,
        steeringJitterPct: swapReport.steeringJitterMismatchPct || 0,
        brakeBiteDeltaPct: swapReport.brakeBiteMismatchPct || 0,
        thermalGradientDeltaC: swapReport.tireThermalGradientDelta || 0,
      };
    } else if (!swapDetected) {
      // Outside adaptation windows, gradually decay active flag
      this._state.adaptationState.active = false;
    }

    // ── Strategy context ─────────────────────────────────────────────────────
    this._updateStrategyContext(t, lapNumber);

    // ── Environment context ──────────────────────────────────────────────────
    this._state.environmentContext.trackTempC = t.liveTrackTempC || t.trackTempC || 0;
    this._state.environmentContext.airTempC   = t.liveAirTempC   || t.airTempC   || 0;
    this._state.environmentContext.rainLevel  = t.trackWetness   || 0;

    // ── Relay sync metadata ──────────────────────────────────────────────────
    this._state.relayState.lastUpdated = Date.now();

    // ── Pit stop detection (tire reset on stationary + pit surface) ───────────
    this._detectPitEvent(t, lapNumber);

    // ── Compute state hash (SHA-256 of deterministic core fields) ────────────
    this._state.stateHash = this._computeHash(this._state);

    return this._state;
  }

  // ─── Public: getters ──────────────────────────────────────────────────────────

  /**
   * Returns the current read-only snapshot of CarOperationalState.
   * Callers MUST NOT mutate the returned object.
   */
  getState() {
    return this._state;
  }

  /**
   * Returns the compressed relay digest for Supabase broadcasting.
   * Strips raw physics arrays and dense intermediate channels.
   */
  getRelayDigest() {
    if (!this._state) return null;

    return {
      schemaVersion: this._state.schemaVersion,
      sequenceId: this._state.sequenceId,
      stateHash: this._state.stateHash,
      carId: this._state.carId,
      carNumber: this._state.carNumber,
      carName: this._state.carName,
      teamId: this._state.teamId,
      activeDriverId: this._state.activeDriverId,
      adaptationEpochId: this._state.adaptationEpochId,
      previousDrivers: this._state.previousDrivers,
      currentStint: this._state.currentStint,
      cumulativeFatigue: this._state.cumulativeFatigue,
      adaptationState: this._state.adaptationState,
      strategyState: this._state.strategyState,
      relayState: this._state.relayState,
      // environment stripped of simBuild/bopVersion for bandwidth
      environmentContext: {
        trackTempC: this._state.environmentContext.trackTempC,
        airTempC: this._state.environmentContext.airTempC,
        rainLevel: this._state.environmentContext.rainLevel,
      },
    };
  }

  /**
   * Returns the most recent delta events (in-memory ring).
   */
  getRecentDeltas(limit = 20) {
    return this._deltaRing.slice(-limit);
  }

  // ─── Public: MongoDB persistence ──────────────────────────────────────────────

  /**
   * Persists the current CarOperationalState snapshot to MongoDB car_states.
   * Also writes a timestamped entry to car_state_history every 10 seconds.
   */
  async persistSnapshot(db, sessionId) {
    if (!db || !this._state) return;

    const now = Date.now();
    const stateDoc = this._buildPersistenceDoc(sessionId, this._state);

    try {
      // Upsert the active car_states document
      await db.collection("car_states").updateOne(
        { session_id: stateDoc.session_id, car_number: this._state.carNumber },
        { $set: stateDoc },
        { upsert: true }
      );

      // Write history snapshot at 10-second intervals (not 60Hz)
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

  /**
   * Writes all pending delta events from the in-memory ring to MongoDB.
   */
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

  // ─── Private: driver swap handler ─────────────────────────────────────────────

  _handleDriverSwap(outgoing, incoming, lapNumber, t) {
    console.log(
      `[vehicle-identity] DRIVER SWAP: ${outgoing} → ${incoming} at Lap ${lapNumber}`
    );

    // Register outgoing driver in history
    if (outgoing && !this._state.previousDrivers.includes(outgoing)) {
      this._state.previousDrivers.push(outgoing);
    }

    // Generate new adaptation epoch boundary
    this._state.adaptationEpochId = this._generateEpochId();

    // Advance stint counter
    const newStintNumber = this._state.currentStint.stintNumber + 1;
    this._state.currentStint = {
      stintNumber: newStintNumber,
      lapStart: lapNumber,
      lapsCompleted: 0,
      fuelVolumeL: t.fuelRemainingL || 0,
      fuelBurnPerLap: this._state.currentStint.fuelBurnPerLap, // carry forward burn rate
      projectedPitLap: this._state.currentStint.projectedPitLap,
    };

    // Emit delta event
    this._emitDelta({
      timestamp: Date.now(),
      lapNumber,
      sequenceId: this._sequenceId,
      type: "DRIVER_SWAP",
      payload: {
        from: outgoing,
        to: incoming,
        details: `Stint ${newStintNumber} begins at Lap ${lapNumber} | EpochID: ${this._state.adaptationEpochId}`,
      },
    });
  }

  // ─── Private: pit detection ────────────────────────────────────────────────────

  _detectPitEvent(t, lapNumber) {
    // iRacing PlayerTrackSurface === 1 means pit stall stationary
    const inPit = t.all?.PlayerTrackSurface === 1 && (t.speedKph || 0) < 1;

    if (inPit && !this._inPitPrev) {
      // Entered pit stall
      this._emitDelta({
        timestamp: Date.now(),
        lapNumber,
        sequenceId: this._sequenceId,
        type: "FUEL_REFUEL",
        payload: {
          from: `${this._state.currentStint.fuelVolumeL.toFixed(1)}L (entry)`,
          details: "Pit stall entry detected",
        },
      });
    }

    if (!inPit && this._inPitPrev) {
      // Exiting pit — detect tire reset (wear reset indicates new set)
      const brakeWearAfter = this._state.cumulativeFatigue.brakes;
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

    this._pitEntryBrakeWear = inPit ? this._state.cumulativeFatigue.brakes : this._pitEntryBrakeWear;
    this._inPitPrev = inPit;
  }

  // ─── Private: strategy context updater ────────────────────────────────────────

  _updateStrategyContext(t, lapNumber) {
    const burnPerLap = this._state.currentStint.fuelBurnPerLap || 2.8;
    const fuelRemaining = t.fuelRemainingL || 0;
    const lapsRemaining = burnPerLap > 0 ? fuelRemaining / burnPerLap : 0;

    // Reserve window: 1.5L safety reserve
    const reserveLaps = burnPerLap > 0 ? 1.5 / burnPerLap : 1;
    this._state.strategyState.targetWindowMin = Math.floor(lapNumber + lapsRemaining - reserveLaps - 1);
    this._state.strategyState.targetWindowMax = Math.floor(lapNumber + lapsRemaining);

    // Undercut risk heuristic: based on tire wear level
    const brakeWear = this._state.cumulativeFatigue.brakes;
    if (brakeWear < 35) {
      this._state.strategyState.undercutRisk = "HIGH";
    } else if (brakeWear < 60) {
      this._state.strategyState.undercutRisk = "MED";
    } else {
      this._state.strategyState.undercutRisk = "LOW";
    }
  }

  // ─── Private: delta ring emitter ──────────────────────────────────────────────

  _emitDelta(delta) {
    this._deltaRing.push(delta);
    if (this._deltaRing.length > DELTA_RING_LIMIT) {
      this._deltaRing.shift();
    }
  }

  // ─── Private: SHA-256 state hash ──────────────────────────────────────────────

  _computeHash(state) {
    const hashable = {
      sequenceId: state.sequenceId,
      carId: state.carId,
      activeDriverId: state.activeDriverId,
      adaptationEpochId: state.adaptationEpochId,
      stintNumber: state.currentStint?.stintNumber,
      lapsCompleted: state.currentStint?.lapsCompleted,
      brakes: state.cumulativeFatigue?.brakes,
      chassis: state.cumulativeFatigue?.chassis,
    };
    return crypto
      .createHash("sha256")
      .update(JSON.stringify(hashable))
      .digest("hex")
      .slice(0, 16); // 64-bit prefix is sufficient for integrity checks
  }

  // ─── Private: adaptation epoch UUID generator ─────────────────────────────────

  _generateEpochId() {
    return crypto.randomUUID
      ? crypto.randomUUID()
      : crypto.randomBytes(16).toString("hex");
  }

  // ─── Private: build MongoDB persistence doc ───────────────────────────────────

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
