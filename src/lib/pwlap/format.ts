/**
 * .pwlap header parsing and serialization.
 * Fixed 256-byte header for efficient metadata extraction.
 */

import {
  PWLAP_MAGIC,
  PWLAP_VERSION,
  PWLAP_HEADER_SIZE,
  PWLAP_FLAGS,
  type PwlapHeader,
} from "./types";

/** Write header to a 256-byte buffer. */
export function serializeHeader(header: PwlapHeader): Uint8Array {
  const buf = new Uint8Array(PWLAP_HEADER_SIZE);
  const view = new DataView(buf.buffer, buf.byteOffset);

  let offset = 0;

  // Magic (8 bytes)
  const magicBuf = new TextEncoder().encode(PWLAP_MAGIC);
  buf.set(magicBuf, offset);
  offset += 8;

  // Version (4 bytes)
  view.setUint32(offset, PWLAP_VERSION, true);
  offset += 4;

  // Flags (2 bytes)
  view.setUint16(offset, header.flags, true);
  offset += 2;

  // IV/Nonce (16 bytes) - zero if not encrypted
  if (header.iv_nonce) {
    buf.set(header.iv_nonce.slice(0, 16), offset);
  }
  offset += 16;

  // Signature (64 bytes) - zero if not signed
  if (header.signature) {
    buf.set(header.signature.slice(0, 64), offset);
  }
  offset += 64;

  // Granularity (1 byte)
  view.setUint8(offset, header.granularity);
  offset += 1;

  // Created at (8 bytes, uint64 ms since epoch)
  // JavaScript number can safely represent up to 2^53-1
  const createdMsBig = BigInt(header.created_at_ms);
  view.setBigInt64(offset, createdMsBig, true);
  offset += 8;

  // Reserved (pad to 256 bytes)
  // offset should be at 8+4+2+16+64+1+8 = 103, so 256-103 = 153 bytes reserved

  return buf;
}

/** Parse a 256-byte header from buffer. */
export function deserializeHeader(buf: ArrayBuffer): PwlapHeader {
  if (buf.byteLength < PWLAP_HEADER_SIZE) {
    throw new Error(`Header too small: ${buf.byteLength} < ${PWLAP_HEADER_SIZE}`);
  }

  const view = new DataView(buf, 0, PWLAP_HEADER_SIZE);
  const bytes = new Uint8Array(buf, 0, PWLAP_HEADER_SIZE);

  let offset = 0;

  // Magic (8 bytes)
  const magicBytes = bytes.slice(offset, offset + 8);
  const magic = new TextDecoder().decode(magicBytes);
  if (magic !== PWLAP_MAGIC) {
    throw new Error(`Invalid magic: ${JSON.stringify(magic)}`);
  }
  offset += 8;

  // Version (4 bytes)
  const version = view.getUint32(offset, true);
  if (version !== PWLAP_VERSION) {
    throw new Error(`Unsupported version: ${version} (expected ${PWLAP_VERSION})`);
  }
  offset += 4;

  // Flags (2 bytes)
  const flags = view.getUint16(offset, true);
  offset += 2;

  // IV/Nonce (16 bytes)
  const iv_nonce = bytes.slice(offset, offset + 16);
  offset += 16;

  // Signature (64 bytes)
  const signature = bytes.slice(offset, offset + 64);
  offset += 64;

  // Granularity (1 byte)
  const granularity = view.getUint8(offset);
  offset += 1;

  // Created at (8 bytes)
  const createdMsBig = view.getBigInt64(offset, true);
  const created_at_ms = Number(createdMsBig);
  offset += 8;

  // Check if IV/signature are all zeros (not set)
  const ivAllZeros = iv_nonce.every((b) => b === 0);
  const sigAllZeros = signature.every((b) => b === 0);

  return {
    magic,
    version,
    flags,
    iv_nonce: !ivAllZeros ? iv_nonce : undefined,
    signature: !sigAllZeros ? signature : undefined,
    granularity,
    created_at_ms,
    reserved: bytes.slice(offset),
  };
}

/** Check if a file has a specific flag set. */
export function hasFlag(flags: number, flag: number): boolean {
  return (flags & flag) !== 0;
}

/** Set a flag in the flags bitfield. */
export function setFlag(flags: number, flag: number): number {
  return flags | flag;
}

/** Generate a random 16-byte IV. */
export function generateIV(): Uint8Array {
  const iv = new Uint8Array(16);
  crypto.getRandomValues(iv);
  return iv;
}

/** Map granularity string to number. */
export function granularityToNum(g: "metadata" | "setup" | "full"): number {
  switch (g) {
    case "metadata":
      return 0;
    case "setup":
      return 1;
    case "full":
      return 2;
    default:
      return 0;
  }
}

/** Map granularity number to string. */
export function numToGranularity(n: number): "metadata" | "setup" | "full" {
  switch (n) {
    case 0:
      return "metadata";
    case 1:
      return "setup";
    case 2:
      return "full";
    default:
      return "metadata";
  }
}
