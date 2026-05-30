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
const SKIP = new Set(['.git', 'dist', '.env']);

function copyRecursiveSync(srcDir, destDir, isRoot = false) {
  if (!fs.existsSync(srcDir)) {
    console.error('[copy-bridge] source does not exist:', srcDir);
    process.exit(1);
  }

  // Wipe destination so stale files don't accumulate
  if (fs.existsSync(destDir) && isRoot) {
    fs.rmSync(destDir, { recursive: true, force: true });
  }
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    if (isRoot && SKIP.has(entry.name)) continue;

    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyRecursiveSync(srcPath, destPath, false);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  const viteClient = path.join(__dirname, '..', '..', 'dist', 'client');
  const viteServer = path.join(__dirname, '..', '..', 'dist', 'server');
  const bridgePublic = path.join(src, 'public');
  const bridgeServer = path.join(src, 'server');
  
  if (fs.existsSync(viteClient)) {
    console.log(`[copy-bridge] Syncing UI client from ${viteClient} to ${bridgePublic}`);
    copyRecursiveSync(viteClient, bridgePublic);
  } else {
    console.warn(`[copy-bridge] ⚠️ UI client not found at ${viteClient}.`);
  }

  if (fs.existsSync(viteServer)) {
    console.log(`[copy-bridge] Syncing UI server from ${viteServer} to ${bridgeServer}`);
    copyRecursiveSync(viteServer, bridgeServer);
    
    // Write package.json declaring this folder as containing ES Modules
    try {
      fs.writeFileSync(
        path.join(bridgeServer, 'package.json'),
        JSON.stringify({ type: 'module' }, null, 2),
        'utf8'
      );
      console.log(`[copy-bridge] ✅ Wrote ${path.join(bridgeServer, 'package.json')} with type: module`);
    } catch (err) {
      console.error(`[copy-bridge] ❌ Failed to write server package.json:`, err.message);
    }
  } else {
    console.warn(`[copy-bridge] ⚠️ UI server not found at ${viteServer}.`);
  }

  copyRecursiveSync(src, dest, true);
  // Count files for feedback
  const count = fs.readdirSync(dest, { recursive: true }).length;
  console.log(`[copy-bridge] ✅ Synced ${src} → ${dest} (${count} entries)`);
} catch (e) {
  console.error('[copy-bridge] ❌ Failed:', e.message);
  process.exit(1);
}
