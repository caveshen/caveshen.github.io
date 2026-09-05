// Renders public/og-image.png (1200×630, a screenshot of the built site's
// /og route: the title screen) and the icon set: favicon-16.png,
// favicon-32.png, apple-touch-icon.png (180) and favicon.ico (16 + 32). The
// icon is the gold diamond on navy, cut as vector per size so the 16 keeps a
// clean navy ring between the outline and the fill. Colours come from
// tokens.css. Run from the repo root: node tools/render-og.js
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { writeFileSync, readFileSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { COMMITTED_INPUTS, OUTPUTS, hashFile, updateManifest } from './derived-inputs.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PORT = 4331;

const tokensCSS = readFileSync(path.join(root, 'src/styles/tokens.css'), 'utf8');
const tokensRootBlock = tokensCSS.match(/:root\s*\{[\s\S]*?\n\}/)[0];
const hexOf = (varName) => {
  const m = tokensRootBlock.match(new RegExp(`${varName}:\\s*(#[0-9a-fA-F]{3,8})`));
  if (!m) throw new Error(`${varName} not found in tokens.css :root block`);
  return m[1];
};
const NAVY = hexOf('--navy');
const GOLD = hexOf('--gold');
const GOLD_BRIGHT = hexOf('--gold-bright');

// ── The diamond, per size ───────────────────────────────────────────────────
// pad: outline inset from the edge; stroke: outline width; inner: half-width
// of the filled diamond. The gap between outline and fill is the navy ring.
function diamondSvg(size, { pad, stroke, inner }) {
  const c = size / 2;
  const o = c - pad;
  const points = (h) => `${c},${c - h} ${c + h},${c} ${c},${c + h} ${c - h},${c}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${NAVY}"/>
  <polygon points="${points(o)}" fill="none" stroke="${GOLD}" stroke-width="${stroke}"/>
  <polygon points="${points(inner)}" fill="${GOLD_BRIGHT}"/>
</svg>`;
}
const png = (size, geometry) => sharp(Buffer.from(diamondSvg(size, geometry))).png().toBuffer();

const fav16 = await png(16, { pad: 1, stroke: 1, inner: 3.5 });
const fav32 = await png(32, { pad: 2, stroke: 1.5, inner: 8 });
const touch180 = await png(180, { pad: 14, stroke: 6, inner: 48 });

writeFileSync(path.join(root, 'public', 'favicon-16.png'), fav16);
writeFileSync(path.join(root, 'public', 'favicon-32.png'), fav32);
writeFileSync(path.join(root, 'public', 'apple-touch-icon.png'), touch180);
console.log('rendered favicon-16.png, favicon-32.png, apple-touch-icon.png');

// ICO container: ICONDIR + one ICONDIRENTRY per PNG image.
{
  const images = [{ size: 16, png: fav16 }, { size: 32, png: fav32 }];
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, png }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size, 0);
    entry.writeUInt8(size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });
  writeFileSync(path.join(root, 'public', 'favicon.ico'), Buffer.concat([header, ...entries, ...images.map((i) => i.png)]));
  console.log('rendered public/favicon.ico');
}

// ── OG image: the title screen at 1200×630 ──────────────────────────────────
{
  spawnSync('npx', ['astro', 'build'], { cwd: root, stdio: 'inherit', shell: true });
  const preview = spawn('npx', ['astro', 'preview', '--port', String(PORT)], { cwd: root, shell: true });
  const url = `http://localhost:${PORT}/og`;
  for (let i = 0; ; i++) {
    try { await fetch(url); break; } catch {
      if (i > 50) throw new Error(`astro preview never came up on ${url}`);
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.goto(url, { waitUntil: 'networkidle' });
  // The cover's entrance animations (scan sweep, HUD fade-in) run once;
  // wait them out so the card is the settled screen.
  await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))));
  await page.screenshot({
    path: path.join(root, 'public', 'og-image.png'),
    clip: { x: 0, y: 0, width: 1200, height: 630 },
  });
  await browser.close();
  // preview.kill() only kills the shell wrapper; taskkill /t walks the tree.
  // ponytail: Windows-only, run by hand on this box; branch on process.platform if that changes.
  spawnSync('taskkill', ['/pid', String(preview.pid), '/t', '/f']);
  console.log('rendered public/og-image.png');
}

// ── freshness gate manifest ─────────────────────────────────────────────────
updateManifest({
  inputs: Object.fromEntries(COMMITTED_INPUTS.map((f) => [f, hashFile(f)])),
  outputs: Object.fromEntries(
    OUTPUTS.filter((f) => f !== 'public/sheet-portrait.png').map((f) => [f, hashFile(f)])
  ),
});
console.log('wrote tools/derived-images.json');
