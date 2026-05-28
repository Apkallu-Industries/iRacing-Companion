/**
 * src/lib/session-intelligence/hashAdapter.ts
 *
 * Authoritative Cryptographic Adapter for Pit Wall.
 * Enforces native SHA-256 platform-independent hashing using SubtleCrypto in
 * modern browser/worker contexts, falling back to Node's native crypto module.
 */

export async function sha256(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);

  // 1. Try native Web Crypto API (Supported in browsers, Cloudflare Workers, Node 19+)
  if (typeof globalThis !== "undefined" && globalThis.crypto?.subtle?.digest) {
    const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  // 2. Fallback to Node.js native crypto module (For older Node runtimes)
  try {
    const cryptoModule = await import("crypto");
    if (cryptoModule && cryptoModule.createHash) {
      return cryptoModule.createHash("sha256").update(str).digest("hex");
    }
  } catch (e) {
    // Suppress dynamic import warnings/errors in client-side Vite builds
  }

  throw new Error("No authoritative cryptographic hash engine found in this runtime environment.");
}
