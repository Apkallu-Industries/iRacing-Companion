/**
 * Serialization and deserialization for .pwlap files.
 * Handles header + content (optionally compressed + encrypted).
 */

import {
  deserializeHeader,
  serializeHeader,
  granularityToNum,
  numToGranularity,
  hasFlag,
  setFlag,
  generateIV,
} from "./format";
import { encryptAES256GCM, decryptAES256GCM, generateSalt, deriveKeyFromPassword } from "./encrypt";
import { signEd25519, verifyEd25519 } from "./sign";
import { PWLAP_FLAGS, PWLAP_HEADER_SIZE } from "./types";
import type { PwlapContent, PwlapHeader, PwlapExportOptions, PwlapFile } from "./types";

/**
 * Serialize a .pwlap file to ArrayBuffer.
 *
 * Process:
 * 1. Create JSON content
 * 2. Optionally compress (Zstandard or deflate)
 * 3. Optionally sign (compute signature over header + content)
 * 4. Optionally encrypt (AES-256-GCM)
 * 5. Assemble: header + content
 */
export async function serializePwlap(
  content: PwlapContent,
  options: PwlapExportOptions
): Promise<ArrayBuffer> {
  // Encode content to JSON
  let contentBytes: any = new TextEncoder().encode(JSON.stringify(content));

  // Compress if requested
  if (options.compress) {
    contentBytes = await compressContent(contentBytes);
  }

  // Create header
  let flags = 0;
  let iv: Uint8Array | undefined;
  let signature: Uint8Array | undefined;

  if (options.includePii) {
    flags = setFlag(flags, PWLAP_FLAGS.INCLUDE_PII);
  }

  if (options.compress) {
    flags = setFlag(flags, PWLAP_FLAGS.COMPRESSED);
  }

  // Signing happens before encryption (sign the content)
  if (options.sign && options.privateKey) {
    flags = setFlag(flags, PWLAP_FLAGS.SIGNED);
    signature = await signEd25519(contentBytes, options.privateKey);
  }

  // Encryption happens last (encrypt content + signature)
  if (options.encrypt && options.password) {
    flags = setFlag(flags, PWLAP_FLAGS.ENCRYPTED);
    iv = generateIV();

    const salt = generateSalt();
    const key = await deriveKeyFromPassword(options.password, salt);
    contentBytes = await encryptAES256GCM(contentBytes, key, iv);

    // Prepend salt to content (so decryption can derive the same key)
    contentBytes = concatBytes(salt, contentBytes);
  }

  const header: PwlapHeader = {
    magic: "PWLAP\x00\x00\x00",
    version: 1,
    flags,
    iv_nonce: iv,
    signature,
    granularity: granularityToNum(options.granularity),
    created_at_ms: Date.now(),
    reserved: new Uint8Array(256 - 103), // Padding
  };

  const headerBytes = serializeHeader(header);
  return concatBytes(headerBytes, contentBytes).buffer as ArrayBuffer;
}

/**
 * Deserialize a .pwlap file from ArrayBuffer.
 *
 * Process:
 * 1. Parse header
 * 2. Extract content
 * 3. Optionally decrypt (AES-256-GCM)
 * 4. Optionally decompress
 * 5. Parse JSON
 * 6. Optionally verify signature (if signed flag is set)
 */
export async function deserializePwlap(
  buffer: ArrayBuffer,
  password?: string,
  publicKey?: Uint8Array
): Promise<PwlapFile> {
  if (buffer.byteLength < PWLAP_HEADER_SIZE) {
    throw new Error("File too small for header");
  }

  const headerBuf = buffer.slice(0, PWLAP_HEADER_SIZE);
  let contentBuf: any = new Uint8Array(buffer.slice(PWLAP_HEADER_SIZE));

  let header: PwlapHeader;
  try {
    header = deserializeHeader(headerBuf);
  } catch (e) {
    throw new Error(`Failed to parse header: ${e instanceof Error ? e.message : String(e)}`);
  }

  let encrypted = hasFlag(header.flags, PWLAP_FLAGS.ENCRYPTED);
  let signed = hasFlag(header.flags, PWLAP_FLAGS.SIGNED);
  let compressed = hasFlag(header.flags, PWLAP_FLAGS.COMPRESSED);

  // Decrypt if needed
  if (encrypted) {
    if (!password) {
      throw new Error("File is encrypted but no password provided");
    }
    if (!header.iv_nonce) {
      throw new Error("Encrypted file missing IV");
    }

    // Extract salt from first 16 bytes of content
    const salt = contentBuf.slice(0, 16);
    const ciphertext = contentBuf.slice(16);

    const key = await deriveKeyFromPassword(password, salt);
    try {
      contentBuf = await decryptAES256GCM(ciphertext, key, header.iv_nonce);
    } catch (e) {
      throw new Error(`Decryption failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // Decompress if needed
  if (compressed) {
    contentBuf = await decompressContent(contentBuf);
  }

  // Keep original contentBuf for signature verification (before JSON parsing)
  const contentForSigVerif = contentBuf;

  // Verify signature if present
  if (signed && header.signature) {
    if (!publicKey) {
      console.warn("File is signed but no public key provided; skipping verification");
    } else {
      const valid = await verifyEd25519(contentForSigVerif, publicKey, header.signature);
      if (!valid) {
        throw new Error("Signature verification failed");
      }
    }
  }

  // Parse JSON
  let content: PwlapContent;
  try {
    const json = new TextDecoder().decode(contentBuf);
    content = JSON.parse(json);
  } catch (e) {
    throw new Error(`Failed to parse content: ${e instanceof Error ? e.message : String(e)}`);
  }

  return {
    header,
    content,
    encrypted,
    signed,
    compressed,
    valid: true,
  };
}

/** Concatenate multiple Uint8Arrays. */
function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const totalLen = arrays.reduce((sum, a) => sum + a.length, 0);
  const result = new Uint8Array(totalLen);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

/** Compress content using available method. */
async function compressContent(data: Uint8Array): Promise<Uint8Array> {
  // Try Zstandard if available (wasm module)
  if ((globalThis as any).zstd) {
    try {
      const compressed = (globalThis as any).zstd.compress(data);
      return new Uint8Array(compressed);
    } catch (e) {
      console.warn("Zstd compression failed, falling back");
    }
  }

  // Try pako (deflate) as fallback
  if ((globalThis as any).pako) {
    try {
      const compressed = (globalThis as any).pako.deflate(data);
      return new Uint8Array(compressed);
    } catch (e) {
      console.warn("Pako compression failed, skipping");
    }
  }

  // If no compression available, return uncompressed (warning: will set COMPRESSED flag falsely)
  console.warn("No compression library available; storing uncompressed");
  return data;
}

/** Decompress content using available method. */
async function decompressContent(data: Uint8Array): Promise<Uint8Array> {
  // Try Zstandard if available
  if ((globalThis as any).zstd) {
    try {
      const decompressed = (globalThis as any).zstd.decompress(data);
      return new Uint8Array(decompressed);
    } catch (e) {
      console.warn("Zstd decompression failed, trying pako");
    }
  }

  // Try pako (inflate) as fallback
  if ((globalThis as any).pako) {
    try {
      const decompressed = (globalThis as any).pako.inflate(data);
      return new Uint8Array(decompressed);
    } catch (e) {
      console.warn("Pako decompression failed");
    }
  }

  throw new Error("Unable to decompress content; no decompression library available");
}
