import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      results.push(file);
    }
  });
  return results;
}

const allFiles = [...walk('src'), ...walk('public'), 'ROADMAP.md', 'CurrentState.MD'];
let changed = 0;

for (const f of allFiles) {
  if (f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.md') || f.endsWith('.json') || f.endsWith('.webmanifest')) {
    try {
      const content = fs.readFileSync(f, 'utf8');
      if (content.includes('ApexTrace')) {
        const newContent = content.replace(/ApexTrace/g, 'Pit Wall');
        fs.writeFileSync(f, newContent, 'utf8');
        console.log(`Replaced in ${f}`);
        changed++;
      }
    } catch (e) {
      console.error(`Error reading ${f}`, e.message);
    }
  }
}

console.log(`Done. Changed ${changed} files.`);
