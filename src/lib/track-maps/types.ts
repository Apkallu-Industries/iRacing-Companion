export interface SectorDefinition {
  id: string;
  name: string;
  startPct: number; // 0.0 to 1.0
  lengthPct: number; // 0.0 to 1.0 (handles wraparounds seamlessly, e.g. start 0.95, length 0.10)
}

export interface CornerDefinition {
  id: string;
  name: string;
  pct: number; // 0.0 to 1.0
}

export interface TrackMapDefinition {
  trackId: string;
  displayName: string;
  spline: [number, number][]; // Prebuilt normalized 2D coordinate spline nodes
  sectors: SectorDefinition[];
  corners?: CornerDefinition[];
  orientation?: {
    rotationDeg?: number; // Rotate around center (0.5, 0.5)
    mirrorX?: boolean; // Mirror horizontally
  };
  pitLane?: {
    spline: [number, number][];
    mergePct: number; // Lap pct where pit lane joins main track
    exitPct: number; // Lap pct where pit lane leaves main track
  };
}
