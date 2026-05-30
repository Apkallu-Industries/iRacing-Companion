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
const https = require('https');

const src = path.join(__dirname, '..', '..', 'local-bridge');
const dest = path.join(__dirname, '..', 'bridge');

// Directories / files to skip during copy
const SKIP = new Set(['.git', 'dist', '.env', 'node_modules']);

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

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        file.close();
        fs.unlinkSync(destPath);
        downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        reject(new Error(`Failed to download: Status Code ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

async function ensureNodeExe() {
  const binDir = path.join(__dirname, '..', 'bin');
  const nodeExePath = path.join(binDir, 'node.exe');
  
  if (fs.existsSync(nodeExePath)) {
    console.log('[copy-bridge] ⚡ node.exe already exists in desktop/bin/ (cached).');
    return;
  }
  
  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }

  const nodeVersion = '24.13.0';
  const url = `https://nodejs.org/dist/v${nodeVersion}/win-x64/node.exe`;
  console.log(`[copy-bridge] 🌐 Downloading portable Node.js v${nodeVersion} for Windows x64 from ${url}...`);

  try {
    await downloadFile(url, nodeExePath);
    console.log('[copy-bridge] ✅ Successfully downloaded standard portable node.exe!');
  } catch (err) {
    console.warn(`[copy-bridge] ⚠️ Pure Node.js download failed: ${err.message}. Trying PowerShell fallback...`);
    try {
      const { execSync } = require('child_process');
      execSync(`powershell.exe -NoProfile -Command "Invoke-WebRequest -Uri '${url}' -OutFile '${nodeExePath}' -UseBasicParsing"`, { stdio: 'inherit' });
      console.log('[copy-bridge] ✅ Successfully downloaded portable node.exe via PowerShell fallback!');
    } catch (psErr) {
      console.error('[copy-bridge] ❌ Failed to download portable node.exe via all methods:', psErr.message);
      process.exit(1);
    }
  }
}

async function main() {
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

    // Ensure bridge dependencies are installed
    const bridgeNodeModules = path.join(dest, 'node_modules');
    const packageJsonPath = path.join(dest, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const hasNodeModules = fs.existsSync(bridgeNodeModules);
      const forceInstall = process.argv.includes('--force-install') || process.argv.includes('--prod') || !hasNodeModules;
      
      if (forceInstall) {
        console.log(`[copy-bridge] 📦 Installing production dependencies in ${dest}...`);
        const { execSync } = require('child_process');
        try {
          execSync('npm install --omit=dev --no-audit --no-fund', {
            cwd: dest,
            stdio: 'inherit',
            env: {
              ...process.env,
              npm_config_loglevel: 'error'
            }
          });
          console.log('[copy-bridge] ✅ Production dependencies installed successfully.');
        } catch (err) {
          console.error('[copy-bridge] ❌ Failed to install production dependencies:', err.message);
          process.exit(1);
        }
      } else {
        console.log('[copy-bridge] ⚡ Skipping bridge npm install (node_modules already present). Use --force-install to force.');
      }
    }

    // Ensure standard portable node.exe is downloaded and cached
    await ensureNodeExe();

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
}

main();
