const PWLAP_MAGIC = "PWLAP\0\0\0";
const PWLAP_VERSION = 1;
const PWLAP_HEADER_SIZE = 256;
const PWLAP_FLAGS = {
  ENCRYPTED: 1,
  // AES-256-GCM
  SIGNED: 2,
  // Ed25519
  COMPRESSED: 4,
  // Zstandard
  INCLUDE_PII: 8
  // Include driver name
};
function serializeHeader(header) {
  const buf = new Uint8Array(PWLAP_HEADER_SIZE);
  const view = new DataView(buf.buffer, buf.byteOffset);
  let offset = 0;
  const magicBuf = new TextEncoder().encode(PWLAP_MAGIC);
  buf.set(magicBuf, offset);
  offset += 8;
  view.setUint32(offset, PWLAP_VERSION, true);
  offset += 4;
  view.setUint16(offset, header.flags, true);
  offset += 2;
  if (header.iv_nonce) {
    buf.set(header.iv_nonce.slice(0, 16), offset);
  }
  offset += 16;
  if (header.signature) {
    buf.set(header.signature.slice(0, 64), offset);
  }
  offset += 64;
  view.setUint8(offset, header.granularity);
  offset += 1;
  const createdMsBig = BigInt(header.created_at_ms);
  view.setBigInt64(offset, createdMsBig, true);
  offset += 8;
  return buf;
}
function deserializeHeader(buf) {
  if (buf.byteLength < PWLAP_HEADER_SIZE) {
    throw new Error(`Header too small: ${buf.byteLength} < ${PWLAP_HEADER_SIZE}`);
  }
  const view = new DataView(buf, 0, PWLAP_HEADER_SIZE);
  const bytes = new Uint8Array(buf, 0, PWLAP_HEADER_SIZE);
  let offset = 0;
  const magicBytes = bytes.slice(offset, offset + 8);
  const magic = new TextDecoder().decode(magicBytes);
  if (magic !== PWLAP_MAGIC) {
    throw new Error(`Invalid magic: ${JSON.stringify(magic)}`);
  }
  offset += 8;
  const version = view.getUint32(offset, true);
  if (version !== PWLAP_VERSION) {
    throw new Error(`Unsupported version: ${version} (expected ${PWLAP_VERSION})`);
  }
  offset += 4;
  const flags = view.getUint16(offset, true);
  offset += 2;
  const iv_nonce = bytes.slice(offset, offset + 16);
  offset += 16;
  const signature = bytes.slice(offset, offset + 64);
  offset += 64;
  const granularity = view.getUint8(offset);
  offset += 1;
  const createdMsBig = view.getBigInt64(offset, true);
  const created_at_ms = Number(createdMsBig);
  offset += 8;
  const ivAllZeros = iv_nonce.every((b) => b === 0);
  const sigAllZeros = signature.every((b) => b === 0);
  return {
    magic,
    version,
    flags,
    iv_nonce: !ivAllZeros ? iv_nonce : void 0,
    signature: !sigAllZeros ? signature : void 0,
    granularity,
    created_at_ms,
    reserved: bytes.slice(offset)
  };
}
function hasFlag(flags, flag) {
  return (flags & flag) !== 0;
}
function setFlag(flags, flag) {
  return flags | flag;
}
function generateIV() {
  const iv = new Uint8Array(16);
  crypto.getRandomValues(iv);
  return iv;
}
function granularityToNum(g) {
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
async function deriveKeyFromPassword(password, salt) {
  const enc = new TextEncoder();
  const passwordBuf = enc.encode(password);
  const baseKey = await crypto.subtle.importKey("raw", passwordBuf, "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 1e5,
      hash: "SHA-256"
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    // not extractable
    ["encrypt", "decrypt"]
  );
}
async function encryptAES256GCM(data, key, iv) {
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );
  return new Uint8Array(encrypted);
}
function generateSalt() {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return salt;
}
async function signEd25519(data, privateKeyBytes) {
  if (crypto.subtle && "sign" in crypto.subtle) {
    try {
      const key = await crypto.subtle.importKey("raw", privateKeyBytes, "Ed25519", false, [
        "sign"
      ]);
      const signature = await crypto.subtle.sign("Ed25519", key, data);
      return new Uint8Array(signature);
    } catch (e) {
    }
  }
  throw new Error(
    "Ed25519 signing not supported by SubtleCrypto. Please add tweetnacl library or use a modern browser."
  );
}
async function serializePwlap(content, options) {
  let contentBytes = new TextEncoder().encode(JSON.stringify(content));
  {
    contentBytes = await compressContent(contentBytes);
  }
  let flags = 0;
  let iv;
  let signature;
  {
    flags = setFlag(flags, PWLAP_FLAGS.INCLUDE_PII);
  }
  {
    flags = setFlag(flags, PWLAP_FLAGS.COMPRESSED);
  }
  if (options.sign && options.privateKey) {
    flags = setFlag(flags, PWLAP_FLAGS.SIGNED);
    signature = await signEd25519(contentBytes, options.privateKey);
  }
  if (options.encrypt && options.password) {
    flags = setFlag(flags, PWLAP_FLAGS.ENCRYPTED);
    iv = generateIV();
    const salt = generateSalt();
    const key = await deriveKeyFromPassword(options.password, salt);
    contentBytes = await encryptAES256GCM(contentBytes, key, iv);
    contentBytes = concatBytes(salt, contentBytes);
  }
  const header = {
    flags,
    iv_nonce: iv,
    signature,
    granularity: granularityToNum(options.granularity),
    created_at_ms: Date.now()
  };
  const headerBytes = serializeHeader(header);
  return concatBytes(headerBytes, contentBytes).buffer;
}
async function deserializePwlap(buffer, password, publicKey) {
  if (buffer.byteLength < PWLAP_HEADER_SIZE) {
    throw new Error("File too small for header");
  }
  const headerBuf = buffer.slice(0, PWLAP_HEADER_SIZE);
  let contentBuf = new Uint8Array(buffer.slice(PWLAP_HEADER_SIZE));
  let header;
  try {
    header = deserializeHeader(headerBuf);
  } catch (e) {
    throw new Error(`Failed to parse header: ${e instanceof Error ? e.message : String(e)}`);
  }
  let encrypted = hasFlag(header.flags, PWLAP_FLAGS.ENCRYPTED);
  let signed = hasFlag(header.flags, PWLAP_FLAGS.SIGNED);
  let compressed = hasFlag(header.flags, PWLAP_FLAGS.COMPRESSED);
  if (encrypted) {
    {
      throw new Error("File is encrypted but no password provided");
    }
  }
  if (compressed) {
    contentBuf = await decompressContent(contentBuf);
  }
  if (signed && header.signature) {
    {
      console.warn("File is signed but no public key provided; skipping verification");
    }
  }
  let content;
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
    valid: true
  };
}
function concatBytes(...arrays) {
  const totalLen = arrays.reduce((sum, a) => sum + a.length, 0);
  const result = new Uint8Array(totalLen);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}
async function compressContent(data) {
  if (globalThis.zstd) {
    try {
      const compressed = globalThis.zstd.compress(data);
      return new Uint8Array(compressed);
    } catch (e) {
      console.warn("Zstd compression failed, falling back");
    }
  }
  if (globalThis.pako) {
    try {
      const compressed = globalThis.pako.deflate(data);
      return new Uint8Array(compressed);
    } catch (e) {
      console.warn("Pako compression failed, skipping");
    }
  }
  console.warn("No compression library available; storing uncompressed");
  return data;
}
async function decompressContent(data) {
  if (globalThis.zstd) {
    try {
      const decompressed = globalThis.zstd.decompress(data);
      return new Uint8Array(decompressed);
    } catch (e) {
      console.warn("Zstd decompression failed, trying pako");
    }
  }
  if (globalThis.pako) {
    try {
      const decompressed = globalThis.pako.inflate(data);
      return new Uint8Array(decompressed);
    } catch (e) {
      console.warn("Pako decompression failed");
    }
  }
  throw new Error("Unable to decompress content; no decompression library available");
}
export {
  deserializePwlap as d,
  serializePwlap as s
};
