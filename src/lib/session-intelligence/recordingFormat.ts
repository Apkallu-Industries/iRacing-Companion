/**
 * recordingFormat.ts — Portable Motorsport Stint Recording Format (.pwstint)
 *
 * Implements stint, event, snapshot, and telemetry sample compilation, compressing
 * packages into portable binary blobs using the pako deflate/inflate standard.
 */

import pako from "pako";
import { SessionSnapshot } from "./sessionSnapshot";

export interface StintPackage {
  session: {
    track: string;
    car: string;
    driver: string;
    startTime: string;
    lapCount: number;
    sampleCount: number;
  };
  samples: Array<{
    lapNumber: number;
    timestamp: string;
    channels: Record<string, number>;
  }>;
  events: Array<{
    timestamp: string;
    classification: string;
    severity: string;
    label: string;
    description: string;
  }>;
  snapshots: SessionSnapshot[];
  created_at: string;
  version: string;
}

/**
 * Packs stint attributes and compresses them into a portable binary buffer.
 */
export function exportStintPackage(
  session: StintPackage["session"],
  samples: StintPackage["samples"],
  events: StintPackage["events"],
  snapshots: SessionSnapshot[]
): Uint8Array {
  const payload: StintPackage = {
    session,
    samples,
    events,
    snapshots,
    created_at: new Date().toISOString(),
    version: "1.0.0"
  };

  const jsonString = JSON.stringify(payload);
  const byteArray = new TextEncoder().encode(jsonString);

  // Compress using high-efficiency deflate compression
  const compressed = pako.deflate(byteArray);
  return compressed;
}

/**
 * Inflates and decompresses a portable stint package binary file.
 */
export function importStintPackage(binaryData: Uint8Array): StintPackage {
  // Inflate compressed payload bytes
  const decompressed = pako.inflate(binaryData);
  const jsonString = new TextDecoder().decode(decompressed);

  const parsed = JSON.parse(jsonString) as StintPackage;
  if (!parsed.version) {
    throw new Error("Invalid .pwstint file format structure.");
  }

  return parsed;
}
