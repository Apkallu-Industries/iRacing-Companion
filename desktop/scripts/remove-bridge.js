const fs = require("fs");
const path = require("path");

const dest = path.join(__dirname, "..", "bridge");
try {
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
    console.log("[remove-bridge] removed", dest);
  } else {
    console.log("[remove-bridge] nothing to remove");
  }
} catch (e) {
  console.error("[remove-bridge] failed:", e);
  process.exit(1);
}
