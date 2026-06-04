import type { TrackMapDefinition } from "./types";

export const spaMap: TrackMapDefinition = {
  trackId: "spa",
  displayName: "Circuit de Spa-Francorchamps",
  orientation: {
    rotationDeg: 0,
    mirrorX: false,
  },
  spline: [
    [0.16, 0.72], // Start/Finish Line
    [0.14, 0.69], // Approach to La Source
    [0.11, 0.66], // La Source apex (Hairpin)
    [0.15, 0.68], // Downhill straight towards Eau Rouge
    [0.21, 0.73],
    [0.24, 0.77],
    [0.28, 0.8], // Eau Rouge compression
    [0.29, 0.76], // Raidillon Left
    [0.28, 0.71], // Raidillon Right climb
    [0.31, 0.63], // Kemmel Straight start
    [0.39, 0.51],
    [0.48, 0.39],
    [0.57, 0.27],
    [0.67, 0.14], // Kemmel Straight end
    [0.72, 0.11], // Les Combes entry
    [0.75, 0.12], // Les Combes Right
    [0.76, 0.16], // Les Combes Left
    [0.78, 0.21], // Malmedy apex
    [0.75, 0.26], // Downhill to Bruxelles
    [0.71, 0.32], // Bruxelles entry
    [0.67, 0.37], // Bruxelles Hairpin apex
    [0.69, 0.43], // Speaker's Corner entry
    [0.74, 0.47], // Speaker's Corner apex
    [0.71, 0.52], // Speaker's Corner exit
    [0.61, 0.56], // Double Gauche entry (Pouhon)
    [0.51, 0.58], // Pouhon First Apex
    [0.45, 0.63], // Pouhon Second Apex
    [0.46, 0.69], // Pouhon exit
    [0.5, 0.73], // Fagnes approach
    [0.55, 0.75], // Fagnes Right
    [0.59, 0.78], // Fagnes Left
    [0.63, 0.82], // Campus apex
    [0.68, 0.87], // Stavelot entry
    [0.71, 0.9], // Stavelot Apex
    [0.67, 0.92], // Stavelot exit
    [0.58, 0.89], // Courbe Paul Frère
    [0.48, 0.85], // Blanchimont entry
    [0.38, 0.82], // Blanchimont 1
    [0.28, 0.78], // Blanchimont 2
    [0.2, 0.75], // Bus Stop Chicane approach
    [0.17, 0.76], // Bus Stop Right
    [0.18, 0.74], // Bus Stop Left
  ],
  sectors: [
    { id: "S1", name: "Sector 1 (Start to Kemmel End)", startPct: 0.0, lengthPct: 0.35 },
    { id: "S2", name: "Sector 2 (Les Combes to Stavelot)", startPct: 0.35, lengthPct: 0.43 },
    { id: "S3", name: "Sector 3 (Blanchimont to Finish)", startPct: 0.78, lengthPct: 0.22 },
  ],
  corners: [
    { id: "T1", name: "La Source", pct: 0.05 },
    { id: "T2", name: "Eau Rouge / Raidillon", pct: 0.16 },
    { id: "T3", name: "Les Combes", pct: 0.38 },
    { id: "T4", name: "Bruxelles", pct: 0.48 },
    { id: "T5", name: "Pouhon", pct: 0.62 },
    { id: "T6", name: "Fagnes", pct: 0.72 },
    { id: "T7", name: "Blanchimont", pct: 0.88 },
    { id: "T8", name: "Bus Stop Chicane", pct: 0.96 },
  ],
  pitLane: {
    spline: [
      [0.2, 0.75], // Exits before Bus Stop chicane
      [0.17, 0.72], // Speed limit marker
      [0.15, 0.7], // Parallel crew wall
      [0.13, 0.68], // Parallel pits
      [0.14, 0.65], // Acceleration lane
      [0.18, 0.68], // Merges after La Source hairpin
    ],
    mergePct: 0.08,
    exitPct: 0.95,
  },
};
