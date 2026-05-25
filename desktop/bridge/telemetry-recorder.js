/**
 * Pit Wall telemetry recorder for MongoDB.
 * Captures live IRSDK telemetry at 30Hz and stores to MongoDB with full channel fidelity.
 *
 * Collections:
 *   - sessions: one per bridge session
 *   - telemetry_samples: per-second aggregated samples (30 samples → min/max/avg)
 *   - laps: per-completed lap metadata
 */

const { MongoClient } = require("mongodb");

class TelemetryRecorder {
  constructor(mongoUri, userId, sessionInfo) {
    this.mongoUri = mongoUri;
    this.userId = userId;
    this.sessionInfo = sessionInfo;
    this.client = null;
    this.db = null;
    this.sessionId = null;
    this.sampleBuffer = [];
    this.lastFlushTime = Date.now();
    this.lastLapNum = 0;
    this.recordedLaps = new Set();
  }

  async connect() {
    if (!this.mongoUri || this.mongoUri === "undefined" || this.mongoUri === "null") {
      console.warn("[recorder] MongoDB URI not set; telemetry recording disabled");
      return false;
    }
    try {
      this.client = new MongoClient(this.mongoUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
      await this.client.connect();
      this.db = this.client.db("iracing_companion");
      await this.ensureIndexes();
      console.log("[recorder] Connected to MongoDB");
      return true;
    } catch (e) {
      console.warn(`[recorder] MongoDB connection failed: ${e.message}`);
      return false;
    }
  }

  async ensureIndexes() {
    try {
      await this.db.collection("telemetry_sessions").createIndex({ user_id: 1, start_time: -1 });
      await this.db.collection("telemetry_samples").createIndex({ session_id: 1, timestamp: 1 });
      await this.db.collection("telemetry_samples").createIndex({ session_id: 1, lap_number: 1 });
      await this.db.collection("laps").createIndex({ session_id: 1, lap_number: 1 });
    } catch (e) {
      console.warn(`[recorder] Index creation failed: ${e.message}`);
    }
  }

  async startSession(channelsManifest) {
    if (!this.db) return null;
    try {
      const session = await this.db.collection("telemetry_sessions").insertOne({
        bridge_id: generateId(),
        user_id: this.userId || "unknown",
        start_time: new Date(),
        end_time: null,
        track: this.sessionInfo?.track || "unknown",
        car: this.sessionInfo?.car || "unknown",
        driver: this.sessionInfo?.driver || "unknown",
        session_info_yaml: this.sessionInfo?.sessionInfoYaml || "",
        channels_manifest: channelsManifest,
        sample_count: 0,
        lap_count: 0,
      });
      this.sessionId = session.insertedId;
      console.log(`[recorder] Started session: ${this.sessionId}`);
      return this.sessionId;
    } catch (e) {
      console.warn(`[recorder] Start session failed: ${e.message}`);
      return null;
    }
  }

  /**
   * Record a single telemetry sample (called at 30Hz).
   * Buffer samples, flush every second with aggregated min/max/avg.
   */
  recordSample(telemetryData, lapNumber) {
    if (!this.sessionId) return;

    this.sampleBuffer.push({
      timestamp: new Date(),
      lap_number: lapNumber,
      data: telemetryData,
    });

    this.lastLapNum = lapNumber;

    // Flush every 1000ms
    const now = Date.now();
    if (now - this.lastFlushTime >= 1000) {
      this.flushSamples();
      this.lastFlushTime = now;
    }
  }

  flushSamples() {
    if (this.sampleBuffer.length === 0) return;
    if (!this.db) return;

    try {
      // Aggregate 30 samples into min/max/avg per channel
      const aggregated = this.aggregateSamples(this.sampleBuffer);

      this.db
        .collection("telemetry_samples")
        .insertOne({
          session_id: this.sessionId,
          timestamp: aggregated.timestamp,
          lap_number: aggregated.lap_number,
          channels: aggregated.channels,
        })
        .catch((e) => console.warn(`[recorder] Insert sample failed: ${e.message}`));

      this.sampleBuffer = [];
    } catch (e) {
      console.warn(`[recorder] Flush failed: ${e.message}`);
    }
  }

  aggregateSamples(samples) {
    const aggregated = {};
    if (samples.length === 0) return { timestamp: new Date(), lap_number: 0, channels: {} };

    const firstSample = samples[0];
    const lastSample = samples[samples.length - 1];

    // Iterate over all keys in the first sample's data
    for (const key of Object.keys(firstSample.data)) {
      const values = [];
      for (const sample of samples) {
        const val = sample.data[key];
        if (typeof val === "number" && Number.isFinite(val)) {
          values.push(val);
        }
      }

      if (values.length > 0) {
        const min = Math.min(...values);
        const max = Math.max(...values);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        aggregated[key] = {
          samples: values,
          min: parseFloat(min.toFixed(3)),
          max: parseFloat(max.toFixed(3)),
          avg: parseFloat(avg.toFixed(3)),
        };
      }
    }

    return {
      timestamp: lastSample.timestamp,
      lap_number: lastSample.lap_number,
      channels: aggregated,
    };
  }

  /**
   * Call when a lap completes to record lap metadata.
   */
  async recordLap(lapNumber, duration_s, fuel_remaining_l, track_temp_c, air_temp_c) {
    if (!this.sessionId || !this.db) return;
    if (this.recordedLaps.has(lapNumber)) return; // Don't double-record

    try {
      this.recordedLaps.add(lapNumber);
      await this.db.collection("laps").insertOne({
        session_id: this.sessionId,
        lap_number: lapNumber,
        duration_s: parseFloat(duration_s.toFixed(3)),
        fuel_remaining_l: parseFloat(fuel_remaining_l.toFixed(3)),
        track_temp_c: parseFloat(track_temp_c.toFixed(1)),
        air_temp_c: parseFloat(air_temp_c.toFixed(1)),
        recorded_at: new Date(),
      });
      console.log(`[recorder] Lap ${lapNumber} recorded: ${duration_s.toFixed(2)}s`);
    } catch (e) {
      console.warn(`[recorder] Record lap failed: ${e.message}`);
    }
  }

  async endSession() {
    if (!this.sessionId || !this.db) return;

    try {
      this.flushSamples(); // Final flush
      const sampleCount = await this.db
        .collection("telemetry_samples")
        .countDocuments({ session_id: this.sessionId });
      const lapCount = await this.db
        .collection("laps")
        .countDocuments({ session_id: this.sessionId });

      await this.db.collection("telemetry_sessions").updateOne(
        { _id: this.sessionId },
        {
          $set: {
            end_time: new Date(),
            sample_count: sampleCount,
            lap_count: lapCount,
          },
        },
      );
      console.log(`[recorder] Session ended: ${sampleCount} samples, ${lapCount} laps`);
    } catch (e) {
      console.warn(`[recorder] End session failed: ${e.message}`);
    }
  }

  async close() {
    await this.endSession();
    if (this.client) {
      await this.client.close();
      console.log("[recorder] MongoDB disconnected");
    }
  }
}

function generateId() {
  const buf = new Uint8Array(12);
  for (let i = 0; i < 12; i++) {
    buf[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}

module.exports = { TelemetryRecorder };
