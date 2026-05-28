/**
 * carStateRuntime.js — Persistent Car State Wear & Fatigue Engine
 *
 * Tracks, calculates, and persists cumulative mechanical wear, shock stresses,
 * brake decay, and gearbox fatigue values over multi-hour endurance events.
 */

class CarStateEngine {
  constructor() {
    this.resetState();
  }

  resetState() {
    this.chassisFatigue = 0.0;    // 0.0 to 100.0% (percentage fatigue)
    this.brakeWear = 100.0;       // 100.0% down to 0.0% pad life remaining
    this.gearboxStress = 0.0;     // 0.0 to 100.0% stress loading
    this.ersHealth = 100.0;       // battery cell capacity retention %
    this.cumulativeInstability = 0;
    this.lastTick = 0;
  }

  /**
   * Updates cumulative car state metrics for a single frame.
   * @param {object} t live mapped telemetry frame
   * @param {number} dt elapsed tick step (seconds)
   */
  updateCarState(t, dt = 1 / 60) {
    if (!t) return;
    this.lastTick = t.tick || this.lastTick + 1;

    // 1. Chassis Fatigue
    // Vertical G-loads and splitter grounding bottoming events build micro-fracture fatigue
    const gForces = Math.sqrt(Math.pow(t.gLat || 0, 2) + Math.pow(t.gLon || 0, 2));
    if (gForces > 2.5) {
      this.chassisFatigue += (gForces - 2.5) * 0.004 * dt;
    }
    if (t.all?.LFshockDefl > 0.042 || t.all?.RFshockDefl > 0.042) {
      // Splitter striking / shock bottoming
      this.chassisFatigue += 0.015 * dt;
    }

    // 2. Brake Wear
    // Brakes degrade under high pedal pressure factored by pad carcass temperature
    const brakeInput = t.brake || 0;
    const estBrakeTemp = t.liveTrackTempC * 2.5 + (brakeInput * 450); // estimated pad heat
    if (brakeInput > 0.15 && estBrakeTemp > 500) {
      this.brakeWear -= brakeInput * (estBrakeTemp / 500.0) * 0.0018 * dt;
    }

    // 3. Gearbox Stress
    // Mismatch downshifts or over-rev spikes increase gearbox stress levels
    const rpm = t.rpm || 5000;
    const rpmRedline = t.rpmShiftRedline || 9500;
    if (rpm > rpmRedline) {
      this.gearboxStress += (rpm - rpmRedline) * 0.005 * dt;
    }

    // 4. MGU-K battery capacity decay (cell degradation)
    const erskW = t.all?.MgukDeploykW || 0;
    if (erskW > 100.0) {
      this.ersHealth -= (erskW / 100.0) * 0.00015 * dt;
    }

    // Clamp within operational bounds
    this.chassisFatigue = Math.min(100.0, Number(this.chassisFatigue.toFixed(3)));
    this.brakeWear = Math.max(0.0, Number(this.brakeWear.toFixed(3)));
    this.gearboxStress = Math.min(100.0, Number(this.gearboxStress.toFixed(3)));
    this.ersHealth = Math.max(50.0, Number(this.ersHealth.toFixed(3)));
  }

  getCurrentState() {
    return {
      chassisFatigue: this.chassisFatigue,
      brakeWear: this.brakeWear,
      gearboxStress: this.gearboxStress,
      ersHealth: this.ersHealth,
      cumulativeInstability: this.cumulativeInstability,
      lastTick: this.lastTick
    };
  }

  /**
   * Persists the active car wear state document into MongoDB.
   * @param {object} db MongoClient database reference
   * @param {string} sessionId active database session ID
   * @param {string} carNumber active car namespace
   */
  async persistState(db, sessionId, carNumber) {
    if (!db) return;
    try {
      const { ObjectId } = require("mongodb");
      const sid = ObjectId.isValid(sessionId) ? new ObjectId(sessionId) : sessionId;
      await db.collection("car_states").updateOne(
        { session_id: sid, car_number: carNumber },
        {
          $set: {
            timestamp: new Date(),
            chassis_fatigue: this.chassisFatigue,
            brake_wear: this.brakeWear,
            gearbox_stress: this.gearboxStress,
            ers_health: this.ersHealth,
            last_tick: this.lastTick
          }
        },
        { upsert: true }
      );
    } catch (e) {
      console.warn(`[car-state] Persist state failure: ${e.message}`);
    }
  }
}

module.exports = new CarStateEngine();
