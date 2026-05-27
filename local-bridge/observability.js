/**
 * observability.js — Real-Time Telemetry Self-Observability & Health Engine
 *
 * Tracks, logs, and profiles the performance of the workstation itself, monitoring
 * event loop lag, WebSocket throughput, database query times, and GC activities.
 */

class ObservabilityEngine {
  constructor() {
    this.wsBytesSent = 0;
    this.wsBytesReceived = 0;
    this.frameDropCount = 0;
    this.lastLoopTime = Date.now();
    this.eventLoopLagMs = 0;
    this.queryLatencySamples = [];
    this.activeWorkersCpu = 0;

    // Run active loop lag checker
    this.startLoopLagChecker();
  }

  startLoopLagChecker() {
    setInterval(() => {
      const now = Date.now();
      const delay = now - this.lastLoopTime - 1000;
      this.eventLoopLagMs = Math.max(0, delay);
      this.lastLoopTime = now;
    }, 1000);
  }

  recordWsTransmission(bytes, isSent = true) {
    if (isSent) {
      this.wsBytesSent += bytes;
    } else {
      this.wsBytesReceived += bytes;
    }
  }

  recordFrameDrop() {
    this.frameDropCount++;
  }

  recordQueryLatency(ms) {
    this.queryLatencySamples.push(ms);
    if (this.queryLatencySamples.length > 50) {
      this.queryLatencySamples.shift();
    }
  }

  getMetrics() {
    const mem = process.memoryUsage();
    
    // Average query planner execution latency
    let avgQueryMs = 0;
    if (this.queryLatencySamples.length > 0) {
      avgQueryMs = this.queryLatencySamples.reduce((a, b) => a + b, 0) / this.queryLatencySamples.length;
    }

    return {
      eventLoopLagMs: this.eventLoopLagMs,
      wsThroughputBytesPerSec: this.wsBytesSent,
      droppedFrames: this.frameDropCount,
      queryPlannerAvgLatencyMs: Number(avgQueryMs.toFixed(2)),
      heapUsedMb: Number((mem.heapUsed / 1024 / 1024).toFixed(1)),
      heapTotalMb: Number((mem.heapTotal / 1024 / 1024).toFixed(1)),
      externalMemoryMb: Number((mem.external / 1024 / 1024).toFixed(1)),
      observabilityState: "ACTIVE"
    };
  }

  resetThroughputCounters() {
    this.wsBytesSent = 0;
    this.wsBytesReceived = 0;
  }
}

// Reset counters every second for accurate throughput per sec readings
const tracker = new ObservabilityEngine();
setInterval(() => {
  tracker.resetThroughputCounters();
}, 1000);

module.exports = tracker;
