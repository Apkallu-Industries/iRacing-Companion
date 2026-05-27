import type { TrackMapDefinition } from "./types";

export const daytonaMap: TrackMapDefinition = {
  trackId: "daytona",
  displayName: "Daytona International Speedway - Road Course",
  spline: [
    [0.50, 0.85], // Start/Finish Line (Tri-oval)
    [0.60, 0.82], // Tri-oval banking
    [0.72, 0.77], // Front stretch straight
    [0.82, 0.70], // Oval Turn 1 banking entry
    [0.83, 0.68], // Infield road course divergence (Left hander)
    [0.78, 0.64], // Horseshoe bend approach
    [0.72, 0.60], // Horseshoe (Right hairpin)
    [0.76, 0.55], // Short straight in infield
    [0.79, 0.48], // Turn 3 Left
    [0.74, 0.42], // Turn 4 Right
    [0.66, 0.38], // Turn 5 Left loop
    [0.58, 0.35], // Infield hairpin approach
    [0.50, 0.33], // Infield Hairpin apex (Turn 6)
    [0.44, 0.38], // Acceleration out of infield
    [0.38, 0.44], // Oval Turn 2 bank re-entry
    [0.30, 0.46], // High banking oval turn 2
    [0.22, 0.44],
    [0.18, 0.38], // Oval back straight start
    [0.22, 0.30],
    [0.28, 0.22],
    [0.36, 0.18], // Back straightaway
    [0.46, 0.18], // Bus Stop (Le Mans Chicane) entry
    [0.48, 0.14], // Bus Stop Right
    [0.52, 0.14], // Bus Stop Left
    [0.54, 0.18], // Bus Stop exit back to straight
    [0.64, 0.18],
    [0.74, 0.19], // Oval Turn 3 banking approach
    [0.84, 0.22], // High banking oval Turn 3
    [0.89, 0.30],
    [0.90, 0.42],
    [0.86, 0.54], // High banking oval Turn 4
    [0.78, 0.66],
    [0.68, 0.74], // Oval exit towards front stretch
    [0.58, 0.80],
  ],
  sectors: [
    { id: "S1", name: "Sector 1 (Start to Infield Exit)", startPct: 0, endPct: 0.42 },
    { id: "S2", name: "Sector 2 (Oval 2 to Bus Stop)", startPct: 0.42, endPct: 0.75 },
    { id: "S3", name: "Sector 3 (Oval 4 to Finish)", startPct: 0.75, endPct: 1.0 },
  ],
  corners: [
    { id: "T1", name: "Infield Turn 1", pct: 0.12 },
    { id: "T2", name: "The Horseshoe", pct: 0.18 },
    { id: "T3", name: "Infield Hairpin", pct: 0.34 },
    { id: "T4", name: "Oval Turn 2", pct: 0.46 },
    { id: "T5", name: "Bus Stop Chicane", pct: 0.68 },
    { id: "T6", name: "Oval Turn 3/4", pct: 0.84 },
  ],
};
