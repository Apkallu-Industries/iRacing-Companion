/**
 * Cryptographic licensing & Hardware ID (HWID) utility for the local iRacing bridge.
 */

const { execSync } = require("child_process");
const crypto = require("crypto");
const os = require("os");

const MASTER_SECRET = "iracing_companion_secret_2026";

/**
 * Computes a unique and anonymous Hardware ID (HWID) for this machine.
 * Queries Windows baseboard or product UUID first, falling back to a hash of CPU + MAC addresses.
 */
function getHWID() {
  let raw = "";
  if (process.platform === "win32") {
    try {
      raw = execSync('powershell -Command "(Get-CimInstance Win32_ComputerSystemProduct).UUID"', { encoding: "utf8" }).trim();
    } catch (e) {
      try {
        const out = execSync("wmic csproduct get uuid", { encoding: "utf8" });
        const lines = out.split("\n").map(l => l.trim()).filter(Boolean);
        if (lines.length > 1) {
          raw = lines[1];
        }
      } catch (e2) {
        // Fallback
      }
    }
  }
  
  // If windows queries failed or not running on Windows
  if (!raw || raw.includes("FFFFFFFF") || raw.includes("00000000")) {
    const interfaces = os.networkInterfaces();
    const macs = [];
    for (const name of Object.keys(interfaces)) {
      for (const net of interfaces[name] || []) {
        if (net.mac && net.mac !== "00:00:00:00:00:00" && !net.internal) {
          macs.push(net.mac);
        }
      }
    }
    macs.sort();
    raw = `${os.hostname()}-${os.arch()}-${macs.join("-")}`;
  }

  // Create a clean, beautiful 16-character hex code from the hash
  return crypto.createHash("sha256").update(raw).digest("hex").substring(0, 16).toUpperCase();
}

/**
 * Returns a cryptographically signed license key string.
 */
function signPayload(payload) {
  const dataStr = JSON.stringify({
    hwid: payload.hwid,
    tier: payload.tier,
    expires: payload.expires
  });
  return crypto.createHmac("sha256", MASTER_SECRET).update(dataStr).digest("hex").substring(0, 16).toUpperCase();
}

/**
 * Generates a signed license key string.
 */
function generateLicenseKey(hwid, tier, expires) {
  const payload = { hwid, tier, expires };
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64");
  const signature = signPayload(payload);
  return `${payloadBase64}.${signature}`;
}

/**
 * Validates a license key.
 */
function validateLicenseKey(key) {
  if (!key || typeof key !== "string") {
    return { valid: false, error: "License key is missing or invalid." };
  }
  const parts = key.split(".");
  if (parts.length !== 2) {
    return { valid: false, error: "Invalid license key format." };
  }
  try {
    const [payloadBase64, signature] = parts;
    const payloadStr = Buffer.from(payloadBase64, "base64").toString("utf8");
    const payload = JSON.parse(payloadStr);

    if (!payload.hwid || !payload.tier || !payload.expires) {
      return { valid: false, error: "Malformed license key payload." };
    }

    // Verify cryptographic signature
    const expectedSignature = signPayload(payload);
    if (signature !== expectedSignature) {
      return { valid: false, error: "License key signature check failed (tampered key)." };
    }

    // Verify HWID
    const currentHwid = getHWID();
    if (payload.hwid !== currentHwid) {
      return { valid: false, error: `License locked to HWID: ${payload.hwid}. This PC is: ${currentHwid}.` };
    }

    // Verify Expiration
    if (payload.expires !== "never") {
      const expiryDate = new Date(payload.expires);
      if (isNaN(expiryDate.getTime())) {
        return { valid: false, error: "Invalid license expiration date format." };
      }
      if (expiryDate < new Date()) {
        return { valid: false, error: `License expired on ${payload.expires}.` };
      }
    }

    return {
      valid: true,
      tier: payload.tier,
      expires: payload.expires,
      hwid: payload.hwid
    };
  } catch (e) {
    return { valid: false, error: `Parsing error: ${e.message}` };
  }
}

module.exports = {
  getHWID,
  generateLicenseKey,
  validateLicenseKey
};
