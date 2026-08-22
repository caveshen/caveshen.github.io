// Renders public/sheet-portrait.png (256×256) — a duotone-treated crop of
// Caveshen's photo for the /sheet nameplate panel. Input is
// .scratch/cavie-ref.jpg (gitignored, local-only, never committed or
// shipped); the committed PNG output is the artifact. The treatment (crop,
// duotone, vignette) is sealed by Caveshen — do not retune without a new
// ruling. Run from the repo root: node docs/make-portrait.mjs
import { chromium } from 'playwright-core';
import { writeFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashFile, updateManifest } from './derived-inputs.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SIZE = 256;

const jpg = readFileSync(path.join(root, '.scratch/cavie-ref.jpg'));
const dataUri = `data:image/jpeg;base64,${jpg.toString('base64')}`;

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage();
await page.setViewportSize({ width: SIZE, height: SIZE });
await page.setContent(`<!doctype html>
<html><head><meta charset="utf-8"><style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: ${SIZE}px; height: ${SIZE}px; overflow: hidden; }
.frame { position: relative; width: ${SIZE}px; height: ${SIZE}px; overflow: hidden; }
.photo {
  display: block;
  width: 145%;
  height: 145%;
  margin-left: -22.5%;
  object-fit: cover;
  object-position: 50% 12%;
  filter: grayscale(1) contrast(1.12) brightness(1.06);
}
.duo-multiply, .duo-lighten { position: absolute; inset: 0; }
.duo-multiply { background: #e7e3cf; mix-blend-mode: multiply; }
.duo-lighten  { background: #0f1826; mix-blend-mode: lighten; }
.mask {
  position: absolute;
  inset: 0;
  -webkit-mask-image: radial-gradient(ellipse 68% 66% at 50% 42%, black 72%, transparent 100%);
  mask-image: radial-gradient(ellipse 68% 66% at 50% 42%, black 72%, transparent 100%);
}
</style></head><body>
<div class="frame">
  <div class="mask">
    <img class="photo" src="${dataUri}">
    <div class="duo-multiply"></div>
    <div class="duo-lighten"></div>
  </div>
</div>
</body></html>`);
await page.screenshot({
  path: path.join(root, 'public', 'sheet-portrait.png'),
  clip: { x: 0, y: 0, width: SIZE, height: SIZE },
  omitBackground: true,
});
await page.close();
await browser.close();
console.log('rendered public/sheet-portrait.png');

updateManifest({
  inputs: { '.scratch/cavie-ref.jpg': hashFile('.scratch/cavie-ref.jpg') },
  outputs: { 'public/sheet-portrait.png': hashFile('public/sheet-portrait.png') },
});
console.log('wrote docs/derived-images.json');
