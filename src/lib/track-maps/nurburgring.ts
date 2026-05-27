import type { TrackMapDefinition } from "./types";

export const nurburgringMap: TrackMapDefinition = {
  trackId: "nurburgring",
  displayName: "Nürburgring GP-Strecke",
  spline: [
    [0.48, 0.20], // Start/Finish Line
    [0.38, 0.20], // Start straight
    [0.28, 0.20], // Castrol S approach
    [0.21, 0.22], // Castrol S Turn 1 (Right)
    [0.18, 0.27], // Castrol S Turn 2 (Left)
    [0.19, 0.33], // Mercedes Arena entry
    [0.23, 0.37], // Arena Right loop
    [0.28, 0.36], // Arena Left exit
    [0.25, 0.42], // Valvoline Curve approach
    [0.22, 0.48], // Valvoline Hairpin entry
    [0.20, 0.54], // Valvoline Hairpin apex
    [0.24, 0.58], // Valvoline Hairpin exit
    [0.32, 0.59], // Ford Curve entry
    [0.39, 0.60], // Ford Curve apex (Right sweeper)
    [0.44, 0.65], // Downhill to Dunlop Hairpin
    [0.50, 0.73],
    [0.54, 0.81], // Dunlop entry
    [0.59, 0.84], // Dunlop Hairpin Apex (Bottom loop)
    [0.63, 0.80], // Dunlop exit
    [0.64, 0.72], // Audi S approach
    [0.66, 0.64], // Schumacher S (Left sweep)
    [0.72, 0.57], // Schumacher S (Right climb)
    [0.76, 0.51], // Kumho Curve approach
    [0.82, 0.45], // Kumho Curve entry
    [0.86, 0.39], // Kumho Curve apex
    [0.83, 0.33], // Kumho Curve exit
    [0.78, 0.29], // Bit Curve entry (Left sweeper)
    [0.72, 0.27], // Bit Curve apex
    [0.66, 0.28], // Bit Curve exit
    [0.61, 0.26], // Coca-Cola Chicane entry
    [0.57, 0.28], // Coca-Cola Chicane Left
    [0.54, 0.24], // Coca-Cola Chicane Right
    [0.52, 0.21], // Coca-Cola Chicane exit back to straight
  ],
  sectors: [
    { id: "S1", name: "Sector 1 (Start to Valvoline)", startPct: 0, endPct: 0.34 },
    { id: "S2", name: "Sector 2 (Valvoline to Schumacher S)", startPct: 0.34, endPct: 0.66 },
    { id: "S3", name: "Sector 3 (Schumacher S to Finish)", startPct: 0.66, endPct: 1.0 },
  ],
  corners: [
    { id: "T1", name: "Castrol S", pct: 0.11 },
    { id: "T2", name: "Valvoline Hairpin", pct: 0.32 },
    { id: "T3", name: "Ford Curve", pct: 0.42 },
    { id: "T4", name: "Dunlop Hairpin", pct: 0.54 },
    { id: "T5", name: "Schumacher S", pct: 0.68 },
    { id: "T6", name: "Coca-Cola Chicane", pct: 0.94 },
  ],
};
