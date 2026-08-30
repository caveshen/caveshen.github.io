// Renders public/grain/grain-<n>.png — small seamless film-grain tiles that
// replace the live full-viewport feTurbulence filter (Stage.astro used to
// paint one directly). CI's software-rendered Linux WebKit re-rasterises a
// full-viewport feTurbulence filter on every paint at a cost Windows WebKit
// never shows locally; a repeating background-image tile is free at paint
// time. Each tile is a real render of the SAME filter recipe Stage.astro used
// to run live (baseFrequency/numOctaves/color matrix/component transfer
// unchanged) — only the filter's primitive subregion is pinned to exactly
// TILE×TILE with stitchTiles="stitch", which is what makes feTurbulence
// periodic at that size, so the tile repeats with no visible seam.
// Run from the repo root: node tools/build-grain-tiles.mjs
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashFile, updateManifest } from './derived-inputs.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const TILE = 240;
const SEEDS = [2, 9, 4, 13]; // subset of stage.js's old seed-cycling schedule

const html = (seed) => `<!doctype html><meta charset="utf-8">
<style>html,body{margin:0}</style>
<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}">
  <filter id="tile" x="0" y="0" width="${TILE}" height="${TILE}"
          filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${seed}"
      stitchTiles="stitch" x="0" y="0" width="${TILE}" height="${TILE}" result="noise" />
    <feColorMatrix in="noise" type="matrix"
      values="0.33 0.33 0.33 0 0
              0.33 0.33 0.33 0 0
              0.33 0.33 0.33 0 0
              0    0    0    1 0" result="mono" />
    <feComponentTransfer in="mono">
      <feFuncR type="linear" slope="3" intercept="-1" />
      <feFuncG type="linear" slope="3" intercept="-1" />
      <feFuncB type="linear" slope="3" intercept="-1" />
    </feComponentTransfer>
  </filter>
  <rect width="${TILE}" height="${TILE}" filter="url(#tile)" />
</svg>`;

mkdirSync(path.join(root, 'public/grain'), { recursive: true });

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: TILE, height: TILE } });

const outputs = {};
for (const [i, seed] of SEEDS.entries()) {
  await page.setContent(html(seed));
  const png = await page.locator('svg').screenshot();
  // webp, not png: this is high-entropy noise, so lossless PNG barely
  // compresses (~70KB/tile) while lossy webp at this quality is visually
  // identical at the overlay's 0.12 opacity and a fifth of the size.
  const outPath = `public/grain/grain-${i}.webp`;
  await sharp(png).greyscale().webp({ quality: 65 }).toFile(path.join(root, outPath));
  outputs[outPath] = hashFile(outPath);
}

await browser.close();

updateManifest({ outputs });
console.log(`wrote ${Object.keys(outputs).length} grain tiles + tools/derived-images.json`);
