const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', '..', 'local-bridge');
const dest = path.join(__dirname, '..', 'bridge');

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) {
    console.error('[copy-bridge] source does not exist:', src);
    process.exit(1);
  }
  try {
    if (fs.existsSync(dest)) {
      fs.rmSync(dest, { recursive: true, force: true });
    }
    // Use fs.cpSync when available
    if (fs.cpSync) {
      fs.cpSync(src, dest, { recursive: true });
    } else {
      // Fallback: manual copy
      fs.mkdirSync(dest, { recursive: true });
      const entries = fs.readdirSync(src, { withFileTypes: true });
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) copyRecursiveSync(srcPath, destPath);
        else fs.copyFileSync(srcPath, destPath);
      }
    }
    console.log('[copy-bridge] copied', src, '->', dest);
  } catch (e) {
    console.error('[copy-bridge] failed:', e);
    process.exit(1);
  }
}

copyRecursiveSync(src, dest);
