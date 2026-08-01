// Greps src/ and public/ for PLACEHOLDER tokens.
// Emits ::warning:: annotations (never exits non-zero — warns, doesn't block).
// Run from repo root: node docs/placeholder-check.js
// Also exported for unit testing.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const EXTS = new Set(['.astro', '.js', '.json', '.css', '.html', '.txt', '.yml', '.yaml', '.md']);

export function findPlaceholderFiles(dirs) {
  const found = [];
  for (const dir of dirs) {
    _walk(dir, found);
  }
  return found;
}

function _walk(dir, found) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); }
  catch { return; }
  for (const entry of entries) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git' || entry.name === 'tests') continue;
      _walk(p, found);
    } else if (EXTS.has(extname(entry.name))) {
      try {
        if (readFileSync(p, 'utf8').includes('PLACEHOLDER')) found.push(p);
      } catch { /* skip unreadable files */ }
    }
  }
}

// CLI entry point
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = process.cwd();
  const files = findPlaceholderFiles([join(root, 'src'), join(root, 'public')]);
  for (const f of files) {
    // ponytail: GitHub Actions ::warning:: annotation — CI reads this line format
    console.log(`::warning file=${f}::PLACEHOLDER token found — replace before launch`);
  }
  if (files.length > 0) {
    console.log(`\n${files.length} file(s) contain PLACEHOLDER tokens. Replace all copy before launch.`);
  }
  // Always exit 0 — warns, never fails the build
  process.exit(0);
}
