import type { TrackMapDefinition } from "./types";
import { lemansMap } from "./lemans";
import { spaMap } from "./spa";
import { daytonaMap } from "./daytona";
import { nurburgringMap } from "./nurburgring";

export * from "./types";
export * from "./projection";

/**
 * Builds a smooth fallback oval spline representing general circuits
 */
function buildFallbackSpline(): [number, number][] {
  const spline: [number, number][] = [];
  const cx = 0.5;
  const cy = 0.5;
  const rx = 0.40;
  const ry = 0.30;
  // A beautiful rounded squircle/oval layout
  for (let i = 0; i < 40; i++) {
    const ang = (i / 40) * Math.PI * 2;
    // Add subtle wave deformation to look like a realistic motorsport road course
    const deformation = 1.0 + Math.sin(ang * 3) * 0.08; 
    spline.push([
      cx + Math.cos(ang) * rx * deformation,
      cy + Math.sin(ang) * ry * deformation,
    ]);
  }
  return spline;
}

const fallbackMap: TrackMapDefinition = {
  trackId: "generic_oval",
  displayName: "Circuit Layout Geometry",
  spline: buildFallbackSpline(),
  sectors: [
    { id: "S1", name: "Sector 1", startPct: 0, endPct: 0.33 },
    { id: "S2", name: "Sector 2", startPct: 0.33, endPct: 0.66 },
    { id: "S3", name: "Sector 3", startPct: 0.66, endPct: 1.0 },
  ],
};

/**
 * Resolves a telemetry track name to its prebuilt vector definition.
 * Falls back to a realistic generic road course loop if not recognized.
 */
export function getTrackMap(trackName?: string): TrackMapDefinition {
  if (!trackName) return fallbackMap;

  const lowerName = trackName.toLowerCase();

  if (lowerName.includes("mans") || lowerName.includes("sarthe") || lowerName.includes("sarthe")) {
    return lemansMap;
  }
  
  if (lowerName.includes("spa") || lowerName.includes("francorchamps") || lowerName.includes("belgium")) {
    return spaMap;
  }

  if (lowerName.includes("daytona")) {
    return daytonaMap;
  }

  if (lowerName.includes("nurburgring") || lowerName.includes("nürburgring") || lowerName.includes("nordschleife")) {
    return nurburgringMap;
  }

  // Graceful fallback with proper geometry
  return {
    ...fallbackMap,
    displayName: trackName || "Circuit Layout Geometry",
  };
}
