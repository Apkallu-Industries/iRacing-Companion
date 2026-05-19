/**
 * Pit Wall Lap (.pwlap) proprietary format types and constants.
 *
 * Format:
 *   - Fixed 256-byte header with metadata and flags
 *   - JSON content (optionally compressed and/or encrypted)
 *
 * Granularity levels:
 *   - metadata: ~5KB (track, car, driver, session info)
 *   - setup: ~50KB (metadata + setup sheet)
 *   - full: ~500MB+ (metadata + all telemetry samples + setup)
 */

export const PWLAP_MAGIC = "PWLAP\x00\x00\x00"; // 8 bytes
export const PWLAP_VERSION = 1;
export const PWLAP_HEADER_SIZE = 256;

/** Format flags (16-bit bitfield). */
export const PWLAP_FLAGS = {
  ENCRYPTED: 0x0001, // AES-256-GCM
  SIGNED: 0x0002, // Ed25519
  COMPRESSED: 0x0004, // Zstandard
  INCLUDE_PII: 0x0008, // Include driver name
} as const;

export type PwlapGranularity = "metadata" | "setup" | "full";

export interface PwlapChannelDescriptor {
  name: string;
  unit: string;
  type: number; // IBT_TYPE enum
  description: string;
  group?: string;
}

export interface PwlapMetadata {
  track: string;
  car: string;
  driver?: string;
  recorded_at: string; // ISO 8601
  duration_s: number;
  lap_count: number;
  best_lap_s?: number;
  session_info_yaml?: string;
}

export interface PwlapLap {
  lap_number: number;
  duration_s: number;
  fuel_remaining_l: number;
  track_temp_c: number;
  air_temp_c: number;
}

export interface PwlapSample {
  timestamp: string; // ISO 8601
  lap_number: number;
  channels: Record<string, { samples: number[]; min: number; max: number; avg: number }>;
}

export interface PwlapSetup {
  aero?: Record<string, any>;
  suspension?: Record<string, any>;
  brake?: Record<string, any>;
  gears?: Record<string, any>;
  diffs?: Record<string, any>;
  [key: string]: any;
}

export interface PwlapContent {
  version: number;
  metadata: PwlapMetadata;
  channels_manifest: PwlapChannelDescriptor[];
  granularity: PwlapGranularity;
  laps?: PwlapLap[];
  samples?: PwlapSample[];
  setup?: PwlapSetup;
}

export interface PwlapHeader {
  magic: string; // "PWLAP\x00\x00\x00"
  version: number;
  flags: number;
  iv_nonce?: Uint8Array; // 16 bytes if encrypted
  signature?: Uint8Array; // 64 bytes if signed
  granularity: number; // 0=metadata, 1=setup, 2=full
  created_at_ms: number; // uint64
  reserved: Uint8Array; // Padding to 256 bytes
}

export interface PwlapExportOptions {
  granularity: PwlapGranularity;
  encrypt?: boolean;
  password?: string;
  sign?: boolean;
  privateKey?: Uint8Array;
  includePii?: boolean;
  compress?: boolean;
}

export interface PwlapFile {
  header: PwlapHeader;
  content: PwlapContent;
  encrypted: boolean;
  signed: boolean;
  compressed: boolean;
  valid: boolean;
}
