import type { TrackMapDefinition } from "./types";
import { prepareTrackMap, type PreparedTrackMap } from "./runtime";
import { lemansMap } from "./lemans";
import { spaMap } from "./spa";
import { daytonaMap } from "./daytona";
import { nurburgringMap } from "./nurburgring";

export * from "./types";
export * from "./runtime";

// Pre-compile and prepare the static track splines at initialization
export const PREPARED_LEMANS = prepareTrackMap(lemansMap);
export const PREPARED_SPA = prepareTrackMap(spaMap);
export const PREPARED_DAYTONA = prepareTrackMap(daytonaMap);
export const PREPARED_NURBURGRING = prepareTrackMap(nurburgringMap);

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

const fallbackMapDef: TrackMapDefinition = {
  trackId: "generic_oval",
  displayName: "UNMAPPED CIRCUIT",
  spline: buildFallbackSpline(),
  sectors: [
    { id: "S1", name: "Sector 1", startPct: 0.0, lengthPct: 0.33 },
    { id: "S2", name: "Sector 2", startPct: 0.33, lengthPct: 0.33 },
    { id: "S3", name: "Sector 3", startPct: 0.66, lengthPct: 0.34 },
  ],
};

const PREPARED_FALLBACK = prepareTrackMap(fallbackMapDef);

/**
 * Resolves a telemetry track name to its prebuilt prepared vector definition.
 * Falls back to a realistic generic road course loop if not recognized.
 */
export function getTrackMap(trackName?: string): PreparedTrackMap {
  if (!trackName) return PREPARED_FALLBACK;

  const lowerName = trackName.toLowerCase();

  if (lowerName.includes("mans") || lowerName.includes("sarthe")) {
    return PREPARED_LEMANS;
  }
  
  if (lowerName.includes("spa") || lowerName.includes("francorchamps") || lowerName.includes("belgium")) {
    return PREPARED_SPA;
  }

  if (lowerName.includes("daytona")) {
    return PREPARED_DAYTONA;
  }

  if (lowerName.includes("nurburgring") || lowerName.includes("nürburgring") || lowerName.includes("nordschleife")) {
    return PREPARED_NURBURGRING;
  }

  // Graceful fallback with proper geometry and name injected
  return {
    ...PREPARED_FALLBACK,
    displayName: trackName || "UNMAPPED CIRCUIT",
  };
}
