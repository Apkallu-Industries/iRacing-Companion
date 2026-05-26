/**
 * copy-bridge.js — Pre-package / pre-start sync script.
 *
 * Copies the canonical `local-bridge/` source into `desktop/bridge/`
 * so the Electron packager bundles the latest bridge code.
 *
 * Run automatically via:  npm run prepackage  or  npm run prestart
 * Run manually via:        npm run sync-bridge
 */

const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', '..', 'local-bridge');
const dest = path.join(__dirname, '..', 'bridge');

// Directories / files to skip during copy
const SKIP = new Set(['node_modules', '.git', 'dist', '.env']);

function copyRecursiveSync(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) {
    console.error('[copy-bridge] source does not exist:', srcDir);
    process.exit(1);
  }

  // Wipe destination so stale files don't accumulate
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
  }
  fs.mkdirSync(destDir, { recursive: true });

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    if (SKIP.has(entry.name)) continue;

    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyRecursiveSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  copyRecursiveSync(src, dest);
  // Count files for feedback
  const count = fs.readdirSync(dest, { recursive: true }).length;
  console.log(`[copy-bridge] ✅ Synced ${src} → ${dest} (${count} entries)`);
} catch (e) {
  console.error('[copy-bridge] ❌ Failed:', e.message);
  process.exit(1);
}
