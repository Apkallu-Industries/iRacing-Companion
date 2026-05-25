/**
 * Encryption and key derivation for .pwlap files.
 * Uses SubtleCrypto (browser native) for AES-256-GCM and PBKDF2.
 */

/**
 * Derive a key from a password using PBKDF2.
 * Returns a key suitable for AES-256-GCM.
 */
export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordBuf = enc.encode(password);

  const baseKey = await crypto.subtle.importKey("raw", passwordBuf, "PBKDF2", false, ["deriveKey"]);

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as any,
      iterations: 100_000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false, // not extractable
    ["encrypt", "decrypt"],
  );
}

/**
 * Encrypt data with AES-256-GCM.
 *
 * Returns: {
 *   ciphertext: Uint8Array,
 *   tag: Uint8Array (16 bytes, included in ciphertext by SubtleCrypto)
 * }
 */
export async function encryptAES256GCM(
  data: Uint8Array,
  key: CryptoKey,
  iv: Uint8Array,
): Promise<Uint8Array> {
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as any },
    key,
    data as any,
  );
  return new Uint8Array(encrypted);
}

/**
 * Decrypt data with AES-256-GCM.
 *
 * Throws on decryption failure (wrong key/password/tampered data).
 */
export async function decryptAES256GCM(
  ciphertext: Uint8Array,
  key: CryptoKey,
  iv: Uint8Array,
): Promise<Uint8Array> {
  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as any },
      key,
      ciphertext as any,
    );
    return new Uint8Array(decrypted);
  } catch (e) {
    throw new Error(`AES-GCM decryption failed: ${e instanceof Error ? e.message : String(e)}`);
  }
}

/**
 * Generate a random salt (16 bytes).
 */
export function generateSalt(): Uint8Array {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return salt;
}
