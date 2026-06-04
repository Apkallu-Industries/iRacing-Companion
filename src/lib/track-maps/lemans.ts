import type { TrackMapDefinition } from "./types";

export const lemansMap: TrackMapDefinition = {
  trackId: "lemans",
  displayName: "Circuit des 24 Heures du Mans",
  orientation: {
    rotationDeg: -15, // Rotate slightly for optimal screen layout
    mirrorX: false,
  },
  spline: [
    [0.35, 0.15], // Start/Finish Line
    [0.35, 0.11], // Dunlop Straight
    [0.37, 0.06], // Dunlop curve entry
    [0.4, 0.04], // Dunlop apex
    [0.43, 0.05], // Dunlop Chicane exit
    [0.44, 0.09], // Dunlop Bridge
    [0.46, 0.12], // Esses Entry
    [0.48, 0.15], // Esses Left
    [0.51, 0.16], // Esses Right
    [0.54, 0.15], // Tertre Rouge apex
    [0.56, 0.17], // Mulsanne Straight start
    [0.59, 0.25],
    [0.61, 0.32],
    [0.63, 0.37], // Chicane 1 Entry (Playstation)
    [0.62, 0.39], // Chicane 1 Left
    [0.65, 0.4], // Chicane 1 Right
    [0.65, 0.43], // Playstation Straight
    [0.68, 0.51],
    [0.7, 0.58], // Chicane 2 Entry (Michelin)
    [0.69, 0.6], // Chicane 2 Right
    [0.72, 0.62], // Chicane 2 Left
    [0.72, 0.66], // Michelin Straight
    [0.76, 0.76],
    [0.79, 0.84],
    [0.81, 0.88], // Mulsanne Kink
    [0.82, 0.92], // Mulsanne Corner entry
    [0.8, 0.94], // Mulsanne Corner apex
    [0.76, 0.91], // Mulsanne Straight Exit
    [0.65, 0.89],
    [0.54, 0.87],
    [0.43, 0.86], // Indianapolis approach
    [0.34, 0.85], // Indianapolis Left entry
    [0.31, 0.89], // Indianapolis apex
    [0.28, 0.88], // Arnage approach
    [0.25, 0.84], // Arnage entry
    [0.23, 0.8], // Arnage apex
    [0.24, 0.74], // Arnage exit
    [0.23, 0.67], // Porsche Curves start
    [0.19, 0.61], // Curves Left
    [0.17, 0.55], // Curves Right
    [0.15, 0.49], // Curve Corvette
    [0.18, 0.43], // Porsche Curves exit
    [0.23, 0.38], // Maison Blanche
    [0.28, 0.32], // Ford Chicane entry
    [0.31, 0.25], // Ford Chicane Left
    [0.33, 0.2], // Ford Chicane Right
  ],
  sectors: [
    { id: "S1", name: "Sector 1 (Start to Chicane 1)", startPct: 0.0, lengthPct: 0.33 },
    { id: "S2", name: "Sector 2 (Chicane 1 to Mulsanne)", startPct: 0.33, lengthPct: 0.27 },
    { id: "S3", name: "Sector 3 (Mulsanne to Finish)", startPct: 0.6, lengthPct: 0.4 },
  ],
  corners: [
    { id: "T1", name: "Dunlop Chicane", pct: 0.08 },
    { id: "T2", name: "Tertre Rouge", pct: 0.22 },
    { id: "T3", name: "Mulsanne Corner", pct: 0.58 },
    { id: "T4", name: "Indianapolis", pct: 0.72 },
    { id: "T5", name: "Arnage", pct: 0.78 },
    { id: "T6", name: "Porsche Curves", pct: 0.88 },
  ],
  pitLane: {
    spline: [
      [0.28, 0.32], // Ford Chicane pit entrance divergence
      [0.31, 0.28], // Pit lane speed limit line
      [0.34, 0.22], // Parallel pit lane
      [0.34, 0.16], // Pit boxes/crew
      [0.34, 0.1], // Acceleration out lane
      [0.38, 0.05], // Main track rejoin (after Dunlop curve)
    ],
    mergePct: 0.08,
    exitPct: 0.96,
  },
};
