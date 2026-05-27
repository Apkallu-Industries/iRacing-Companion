/**
 * sessionSnapshot.ts — Deterministic Session Snapshot Subsystem
 *
 * Compiles and restores complete workspace telemetry coordinates, playheads,
 * active query states, focused laps, and visible traces.
 */

export interface SessionSnapshot {
  id: string;
  sessionId: string;
  timestamp: Date;
  playheadTick: number;
  focusedLap: number;
  activeObjectiveMode: string;
  zoomScale: number;
  visibleTraces: string[];
  activeQueryYaml: string;
  aiNarrativeCache: string;
  engineeringNotes: string;
}

class SessionSnapshotStore {
  private memoryCache: Map<string, SessionSnapshot> = new Map();

  /**
   * Compiles the active operational workspace parameters into a portable state object.
   */
  public compileSnapshot(
    sessionId: string,
    playheadTick: number,
    focusedLap: number,
    activeObjectiveMode: string,
    zoomScale: number,
    visibleTraces: string[],
    activeQueryYaml: string,
    aiNarrativeCache: string,
    engineeringNotes: string
  ): SessionSnapshot {
    const snapshot: SessionSnapshot = {
      id: `snap_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      sessionId,
      timestamp: new Date(),
      playheadTick,
      focusedLap,
      activeObjectiveMode,
      zoomScale,
      visibleTraces,
      activeQueryYaml,
      aiNarrativeCache,
      engineeringNotes
    };

    this.memoryCache.set(snapshot.id, snapshot);
    return snapshot;
  }

  /**
   * Fetches a session snapshot by its generated identifier
   */
  public getSnapshot(id: string): SessionSnapshot | null {
    return this.memoryCache.get(id) || null;
  }

  /**
   * Lists all cached snapshots matching the current session scope.
   */
  public getSnapshotsForSession(sessionId: string): SessionSnapshot[] {
    return Array.from(this.memoryCache.values())
      .filter((s) => s.sessionId === sessionId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Deletes a snapshot.
   */
  public removeSnapshot(id: string): boolean {
    return this.memoryCache.delete(id);
  }

  public clearAll() {
    this.memoryCache.clear();
  }
}

export const sessionSnapshotEngine = new SessionSnapshotStore();
