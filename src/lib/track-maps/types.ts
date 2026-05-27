export interface SectorDefinition {
  id: string;
  name: string;
  startPct: number; // 0.0 to 1.0
  endPct: number;   // 0.0 to 1.0
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
}
