/**
 * replayService.js — Isolated Replay and Scrub Synchronization Layer
 *
 * Exposes low-latency timeline sync indexes, predictive pre-fetching pointers,
 * and virtual frame ring coordinate resolvers.
 */

class ReplayService {
  constructor(capacity = 20000) {
    this.capacity = capacity;
    this.ringBuffer = new Array(capacity);
    this.tickMap = new Map();
    this.ringIndex = 0;
    this.currentTick = 0;
  }

  cacheFrame(tick, frame) {
    const oldFrame = this.ringBuffer[this.ringIndex];
    if (oldFrame) {
      this.tickMap.delete(oldFrame.tick);
    }

    const cached = { tick, ...frame };
    this.ringBuffer[this.ringIndex] = cached;
    this.tickMap.set(tick, this.ringIndex);

    this.ringIndex = (this.ringIndex + 1) % this.capacity;
  }

  getFrame(tick) {
    const idx = this.tickMap.get(tick);
    return idx !== undefined ? this.ringBuffer[idx] : null;
  }

  syncTimelineCursor(tick) {
    this.currentTick = tick;
    return this.currentTick;
  }

  purgeCache() {
    this.ringBuffer.fill(null);
    this.tickMap.clear();
    this.ringIndex = 0;
    this.currentTick = 0;
  }
}

module.exports = new ReplayService();
