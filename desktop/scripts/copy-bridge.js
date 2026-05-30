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
    // Wipe the bridge public dir before copying so stale files are removed
    copyRecursiveSync(viteClient, bridgePublic, true);
  } else {
    console.warn(`[copy-bridge] ⚠️ UI client not found at ${viteClient}.`);
  }

  if (fs.existsSync(viteServer)) {
    console.log(`[copy-bridge] Syncing UI server from ${viteServer} to ${bridgeServer}`);
    // Wipe the bridge server dir before copying to avoid leftover files
    copyRecursiveSync(viteServer, bridgeServer, true);
    
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
  // Copy installer hero image into desktop assets so NSIS can use it as header
  try {
    const repoHero = path.join(__dirname, '..', '..', 'public', 'images', 'hero.png');
    const installerAssets = path.join(__dirname, '..', 'assets');
    if (fs.existsSync(repoHero)) {
      if (!fs.existsSync(installerAssets)) fs.mkdirSync(installerAssets, { recursive: true });
      fs.copyFileSync(repoHero, path.join(installerAssets, 'hero.png'));
      console.log('[copy-bridge] ✅ Copied installer hero image to desktop/assets/hero.png');
    } else {
      console.warn('[copy-bridge] ⚠️ repo hero.png not found at', repoHero);
    }
  } catch (err) {
    console.warn('[copy-bridge] Failed to copy installer hero image:', err.message);
  }
} catch (e) {
  console.error('[copy-bridge] ❌ Failed:', e.message);
  process.exit(1);
}
