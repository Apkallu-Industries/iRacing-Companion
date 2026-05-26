/**
 * iRacing Companion License Key Generator
 * 
 * Usage:
 *   node local-bridge/keygen.js --hwid=B3F2A79C4E0B615F --tier=pro --expires=2029-12-31
 * 
 * Options:
 *   --hwid     The 16-character Hardware ID of the target PC (Required)
 *   --tier     The license tier: "plus" or "pro" (Default: "pro")
 *   --expires  Expiration date in YYYY-MM-DD or "never" (Default: "never")
 */

const licensing = require("./licensing");

// Simple argument parser
const args = {};
process.argv.slice(2).forEach(arg => {
  if (arg.startsWith("--")) {
    const [key, val] = arg.split("=");
    args[key.slice(2)] = val;
  }
});

const hwid = args.hwid;
const tier = args.tier || "pro";
const expires = args.expires || "never";

if (!hwid) {
  console.error("\x1b[31mError: --hwid is required.\x1b[0m");
  console.log("\nUsage:");
  console.log("  node local-bridge/keygen.js --hwid=<16-CHAR-HEX-HWID> [--tier=pro|plus] [--expires=YYYY-MM-DD|never]\n");
  console.log("Example:");
  console.log("  node local-bridge/keygen.js --hwid=B3F2A79C4E0B615F --tier=pro --expires=2030-01-01\n");
  process.exit(1);
}

if (!["plus", "pro"].includes(tier)) {
  console.error(`\x1b[31mError: Tier must be either "plus" or "pro". Received: "${tier}".\x1b[0m`);
  process.exit(1);
}

try {
  const key = licensing.generateLicenseKey(hwid.toUpperCase().trim(), tier, expires);
  
  console.log("\x1b[32m\n=== LICENSE KEY GENERATED SUCCESSFULLY ===\x1b[0m");
  console.log(`\x1b[36mTarget HWID:\x1b[0m   ${hwid.toUpperCase()}`);
  console.log(`\x1b[36mLicense Tier:\x1b[0m  ${tier.toUpperCase()}`);
  console.log(`\x1b[36mExpiration:\x1b[0m    ${expires}`);
  console.log("\x1b[35m------------------------------------------\x1b[0m");
  console.log("\x1b[33mLicense Key:\x1b[0m");
  console.log(key);
  console.log("\x1b[35m------------------------------------------\x1b[0m");
  console.log("\x1b[32mProvide this full license key to the user.\x1b[0m\n");
} catch (err) {
  console.error("\x1b[31mGeneration failed:\x1b[0m", err);
}
