/**
 * Ed25519 signing for .pwlap files.
 * Uses SubtleCrypto if available, otherwise requires tweetnacl.js.
 */

/**
 * Sign data with Ed25519 private key.
 * Private key should be 32 bytes (seed).
 */
export async function signEd25519(
  data: Uint8Array,
  privateKeyBytes: Uint8Array
): Promise<Uint8Array> {
  // Try native SubtleCrypto (modern browsers)
  if (crypto.subtle && "sign" in crypto.subtle) {
    try {
      const key = await crypto.subtle.importKey("raw", privateKeyBytes as any, "Ed25519", false, [
        "sign",
      ]);
      const signature = await crypto.subtle.sign("Ed25519", key, data as any);
      return new Uint8Array(signature);
    } catch (e) {
      // Fall back to tweetnacl if available
    }
  }

  // Fallback: require tweetnacl (must be imported separately)
  throw new Error(
    "Ed25519 signing not supported by SubtleCrypto. Please add tweetnacl library or use a modern browser."
  );
}

/**
 * Verify Ed25519 signature.
 * Public key should be 32 bytes.
 */
export async function verifyEd25519(
  data: Uint8Array,
  publicKeyBytes: Uint8Array,
  signature: Uint8Array
): Promise<boolean> {
  // Try native SubtleCrypto (modern browsers)
  if (crypto.subtle && "verify" in crypto.subtle) {
    try {
      const key = await crypto.subtle.importKey("raw", publicKeyBytes as any, "Ed25519", false, [
        "verify",
      ]);
      return await crypto.subtle.verify("Ed25519", key, signature as any, data as any);
    } catch (e) {
      // Fall back to tweetnacl if available
    }
  }

  // Fallback: require tweetnacl (must be imported separately)
  throw new Error(
    "Ed25519 verification not supported by SubtleCrypto. Please add tweetnacl library or use a modern browser."
  );
}

/**
 * Generate a random Ed25519 keypair.
 * Returns { privateKey, publicKey } both as 32-byte Uint8Array.
 *
 * Note: This is a placeholder. Production implementations should use
 * a proper key generation library or SubtleCrypto when available.
 */
export async function generateEd25519Keypair(): Promise<{
  privateKey: Uint8Array;
  publicKey: Uint8Array;
}> {
  throw new Error(
    "Ed25519 key generation requires tweetnacl.js or use SubtleCrypto's generateKey() with Ed25519."
  );
}

/**
 * Extract public key from private key.
 * For Ed25519, the public key is derived from the private key.
 *
 * Requires tweetnacl.js or equivalent implementation.
 */
export function derivePublicKeyEd25519(privateKeyBytes: Uint8Array): Uint8Array {
  throw new Error(
    "Requires tweetnacl.js or equivalent Ed25519 implementation. Install with: npm install tweetnacl"
  );
}
