/**
 * timeAuthority.ts — Monotonic Telemetry Timebase Authority
 *
 * Establishes a single authoritative reference playhead and monotonic clock
 * to eliminate timeline drift across independent channels and detached displays.
 */

export interface TimebaseStatus {
  isPlaying: boolean;
  currentTick: number;
  maxTicks: number;
  playbackSpeed: number; // e.g. 1.0, 2.0, 0.5
}

class TimebaseAuthority {
  private isPlaying = false;
  private currentTick = 0;
  private maxTicks = 0;
  private playbackSpeed = 1.0;
  private lastUpdateTimestamp = 0;
  private tickRateHz = 60;
  private tickListeners: Set<(tick: number) => void> = new Set();
  private stateListeners: Set<(status: TimebaseStatus) => void> = new Set();
  private intervalId: any = null;

  /**
   * Initializes playhead scope bounds.
   */
  public configure(maxTicks: number, tickRateHz = 60) {
    this.maxTicks = maxTicks;
    this.tickRateHz = tickRateHz;
    this.currentTick = 0;
    this.broadcastState();
  }

  public play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.lastUpdateTimestamp = performance.now();
    this.broadcastState();

    const dt = 1000 / this.tickRateHz;
    this.intervalId = setInterval(() => {
      this.tickStep();
    }, dt);
  }

  public pause() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.broadcastState();
  }

  public seek(tick: number) {
    this.currentTick = Math.max(0, Math.min(this.maxTicks - 1, tick));
    this.broadcastTick();
  }

  public setSpeed(speed: number) {
    this.playbackSpeed = Math.max(0.1, Math.min(10.0, speed));
    this.broadcastState();
  }

  private tickStep() {
    if (!this.isPlaying) return;

    const now = performance.now();
    const elapsedMs = now - this.lastUpdateTimestamp;
    this.lastUpdateTimestamp = now;

    // Convert elapsed real-world time to tick steps factored by playbackSpeed
    const idealTickStep = (elapsedMs / 1000) * this.tickRateHz * this.playbackSpeed;
    const steps = Math.round(idealTickStep);

    if (steps > 0) {
      this.currentTick += steps;
      if (this.currentTick >= this.maxTicks) {
        this.currentTick = this.maxTicks - 1;
        this.pause();
      }
      this.broadcastTick();
    }
  }

  public onTick(callback: (tick: number) => void): () => void {
    this.tickListeners.add(callback);
    return () => this.tickListeners.delete(callback);
  }

  public onStateChange(callback: (status: TimebaseStatus) => void): () => void {
    this.stateListeners.add(callback);
    callback(this.getStatus());
    return () => this.stateListeners.delete(callback);
  }

  public getStatus(): TimebaseStatus {
    return {
      isPlaying: this.isPlaying,
      currentTick: this.currentTick,
      maxTicks: this.maxTicks,
      playbackSpeed: this.playbackSpeed,
    };
  }

  private broadcastTick() {
    for (const cb of this.tickListeners) {
      cb(this.currentTick);
    }
  }

  private broadcastState() {
    const status = this.getStatus();
    for (const cb of this.stateListeners) {
      cb(status);
    }
  }

  public reset() {
    this.pause();
    this.currentTick = 0;
    this.maxTicks = 0;
    this.playbackSpeed = 1.0;
    this.tickListeners.clear();
    this.stateListeners.clear();
  }
}

export const timeAuthority = new TimebaseAuthority();
