/**
 * persistenceService.js — Isolated Persistence Service Layer
 *
 * Governs MongoDB connection states, index heals, and tiered retention sweeps.
 */

const { MongoClient } = require("mongodb");
const { executeRetentionPolicy } = require("../retention");

class PersistenceService {
  constructor() {
    this.client = null;
    this.db = null;
    this.connected = false;
  }

  async initialize(mongoUri) {
    if (!mongoUri) {
      console.warn("[persistence-service] No MONGO_URI specified. Persistence disabled.");
      return false;
    }
    try {
      this.client = new MongoClient(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
      await this.client.connect();
      this.db = this.client.db("iracing_companion");
      this.connected = true;
      console.log("[persistence-service] Connected to MongoDB client.");
      
      // Run index healing and retention compaction asynchronously on initialization
      this.healIndexes().catch(err => console.error("[persistence-service] Index healing failure:", err));
      executeRetentionPolicy(this.db).catch(err => console.error("[persistence-service] Compaction sweep failure:", err));
      
      return true;
    } catch (e) {
      console.error(`[persistence-service] Database connection failed: ${e.message}`);
      return false;
    }
  }

  async healIndexes() {
    if (!this.connected) return;
    try {
      await this.db.collection("telemetry_sessions").createIndex({ user_id: 1, start_time: -1 });
      await this.db.collection("telemetry_samples").createIndex({ session_id: 1, timestamp: 1 });
      await this.db.collection("telemetry_samples").createIndex({ session_id: 1, lap_number: 1 });
      await this.db.collection("laps").createIndex({ session_id: 1, lap_number: 1 });
      await this.db.collection("scanner_events").createIndex({ session_id: 1, timestamp: -1 });
      await this.db.collection("setup_changes").createIndex({ session_id: 1, timestamp: -1 });
      await this.db.collection("session_notes").createIndex({ session_id: 1, lap_number: 1, timestamp: -1 });
      await this.db.collection("team_profiles").createIndex({ id: 1 }, { unique: true });
      await this.db.collection("engineering_notes").createIndex({ session_id: 1, timestamp: -1 });
      await this.db.collection("notebook_bookmarks").createIndex({ session_id: 1, lap_number: 1, timestamp: -1 });
      await this.db.collection("setup_snapshots").createIndex({ session_id: 1, lap_number: 1, timestamp: -1 });
      console.log("[persistence-service] Indexes healed successfully.");
    } catch (e) {
      console.warn(`[persistence-service] Index heal warning: ${e.message}`);
    }
  }

  async shutdown() {
    if (this.client) {
      await this.client.close();
      this.connected = false;
      console.log("[persistence-service] MongoDB closed successfully.");
    }
  }
}

module.exports = new PersistenceService();
