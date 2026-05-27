/**
 * runtimeBus.js — Decoupled Runtime Event Bus Layer
 *
 * Physically decouples telemetry ingestion, database persistence, replay buffering,
 * stability forecasting, and visual transport layers using event-driven contracts.
 */

class RuntimeBus {
  constructor() {
    this.listeners = new Map();
    this.backlog = new Map();
    this.backlogLimit = 100; // retain last 100 ticks or messages
    this.replayMode = false;
    this.eventLog = [];
  }

  /**
   * Register a subscriber for a specific event contract.
   * Plays back cached backlog for late-subscribers immediately upon attachment.
   */
  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Replay backlog to ensure state synchronization (late attachment protection)
    const cached = this.backlog.get(event);
    if (cached && cached.length > 0) {
      for (const payload of cached) {
        try {
          callback(payload);
        } catch (err) {
          console.error(`[event-bus] Error in backlog dispatch for ${event}:`, err.message);
        }
      }
    }

    return () => this.unsubscribe(event, callback);
  }

  /**
   * De-registers a callback listener.
   */
  unsubscribe(event, callback) {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(callback);
    }
  }

  /**
   * Publishes an event contract with priority ordering support.
   */
  publish(event, payload, priority = false) {
    if (this.replayMode) {
      this.eventLog.push({ event, payload, timestamp: Date.now() });
    }

    // Maintain bounded backlog cache
    if (!this.backlog.has(event)) {
      this.backlog.set(event, []);
    }
    const cached = this.backlog.get(event);
    cached.push(payload);
    if (cached.length > this.backlogLimit) {
      cached.shift();
    }

    const set = this.listeners.get(event);
    if (!set || set.size === 0) return;

    // Dispatches either directly or schedules high priority dispatches immediately
    const invoke = () => {
      for (const callback of set) {
        try {
          callback(payload);
        } catch (err) {
          console.error(`[event-bus] Callback exception during ${event} dispatch:`, err.message);
        }
      }
    };

    if (priority) {
      // Execute synchronously
      invoke();
    } else {
      // Schedule to prevent starvation of high-frequency ingestion
      setImmediate(invoke);
    }
  }

  enableReplayLogging() {
    this.replayMode = true;
    this.eventLog = [];
  }

  disableReplayLogging() {
    this.replayMode = false;
  }

  getEventLog() {
    return this.eventLog;
  }

  clearBacklog() {
    this.backlog.clear();
    this.eventLog = [];
  }
}

// Singleton instances preserve states across imports
module.exports = new RuntimeBus();
