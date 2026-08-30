// Renders public/og-image.png (1200×630) and the icon set: favicon-16.png
// (the champion, smoothly downscaled to 16px), favicon-32.png (the champion
// at native size), favicon.ico (both sizes, for legacy/taskbar consumers),
// and apple-touch-icon.png (180×180 champion). Sized rasters only — no
// favicon.svg. The OG image is a screenshot of the built site's real /og
// route (astro build → astro preview), which renders the real Scene
// component. The champion assets process .scratch/NAG_Badger.jpg (gitignored,
// private source) into pixel art at 32×32, then every other size (16, 180)
// is derived from that same canvas in-process — one source of truth. Run
// from the repo root: node tools/render-og.js
import { chromium } from 'playwright-core';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { COMMITTED_INPUTS, OUTPUTS, hashFile, updateManifest } from './derived-inputs.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PORT = 4331;
const browser = await chromium.launch({ channel: 'msedge' });

// tokens.css :root hex lookup — feeds the champion's ink/cream/tile palette.
const tokensCSS = readFileSync(path.join(root, 'src/styles/tokens.css'), 'utf8');
const tokensRootBlock = tokensCSS.match(/:root\s*\{[\s\S]*?\n\}/)[0];
const hexOf = (varName) => {
  const m = tokensRootBlock.match(new RegExp(`${varName}:\\s*(#[0-9a-fA-F]{3,8})`));
  if (!m) throw new Error(`${varName} not found in tokens.css :root block`);
  return m[1];
};

// ── champion: 32×32 pixel art processed from the private source photo ──────
// Recipe: flood-fill the near-white background from the edges to the crater
// tile colour, then classify every remaining pixel by luminance (dark → ink,
// pale → cream, mid-tones/JPEG fuzz → tile), then snap stray cream specks
// with no cream neighbour to their surrounding colour. All canvas work runs
// in the browser (playwright-core is already a dependency here) so no image
// library is needed.
const TILE = hexOf('--crater');
const INK = hexOf('--head-dark');
const CREAM = hexOf('--moon');
const jpgPath = path.join(root, '.scratch', 'NAG_Badger.jpg');
if (!existsSync(jpgPath)) {
  throw new Error(`${jpgPath} is missing — the private 32×32 champion source lives only in the repo owner's gitignored .scratch folder; ask Caveshen for it`);
}
const jpgDataURL = `data:image/jpeg;base64,${readFileSync(jpgPath).toString('base64')}`;

const { champion32, touch180, favicon16 } = await (async () => {
  const page = await browser.newPage();
  const result = await page.evaluate(async ({ jpgDataURL, TILE, INK, CREAM }) => {
    const img = new Image();
    img.src = jpgDataURL;
    await img.decode();

    const src = document.createElement('canvas');
    src.width = 32;
    src.height = 32;
    const sctx = src.getContext('2d');
    sctx.drawImage(img, 0, 0, 32, 32);
    const { data } = sctx.getImageData(0, 0, 32, 32);
    const luminance = (i) => 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

    // flood-fill the background: near-white pixels connected to an edge
    const isBg = new Uint8Array(32 * 32);
    const stack = [];
    for (let x = 0; x < 32; x++) stack.push([x, 0], [x, 31]);
    for (let y = 0; y < 32; y++) stack.push([0, y], [31, y]);
    while (stack.length) {
      const [x, y] = stack.pop();
      if (x < 0 || y < 0 || x >= 32 || y >= 32) continue;
      const idx = y * 32 + x;
      if (isBg[idx] || luminance(idx * 4) <= 185) continue;
      isBg[idx] = 1;
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    // classify every remaining pixel by luminance
    const grid = new Array(32 * 32);
    for (let idx = 0; idx < 32 * 32; idx++) {
      if (isBg[idx]) { grid[idx] = TILE; continue; }
      const l = luminance(idx * 4);
      grid[idx] = l < 110 ? INK : l > 190 ? CREAM : TILE;
    }

    // snap isolated cream specks (arm-tip JPEG fuzz) to their surrounding colour
    const at = (x, y) => (x < 0 || y < 0 || x >= 32 || y >= 32) ? null : grid[y * 32 + x];
    const neighbours = (x, y) => [
      at(x - 1, y - 1), at(x, y - 1), at(x + 1, y - 1),
      at(x - 1, y), at(x + 1, y),
      at(x - 1, y + 1), at(x, y + 1), at(x + 1, y + 1),
    ].filter(Boolean);
    const snaps = [];
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        if (grid[y * 32 + x] !== CREAM) continue;
        const ns = neighbours(x, y);
        if (ns.includes(CREAM)) continue;
        const counts = {};
        for (const c of ns) counts[c] = (counts[c] || 0) + 1;
        snaps.push([x, y, Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]]);
      }
    }
    for (const [x, y, c] of snaps) grid[y * 32 + x] = c;

    const champ = document.createElement('canvas');
    champ.width = 32;
    champ.height = 32;
    const cctx = champ.getContext('2d');
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        cctx.fillStyle = grid[y * 32 + x];
        cctx.fillRect(x, y, 1, 1);
      }
    }

    // 180×180 apple-touch: nearest-neighbour 5× (160×160) centred on tile ground
    const touch = document.createElement('canvas');
    touch.width = 180;
    touch.height = 180;
    const tctx = touch.getContext('2d');
    tctx.imageSmoothingEnabled = false;
    tctx.fillStyle = TILE;
    tctx.fillRect(0, 0, 180, 180);
    tctx.drawImage(champ, 0, 0, 32, 32, 10, 10, 160, 160);

    // 16×16 favicon slot: a smooth (bilinear, browser high-quality) 50%
    // downscale of the champion — the same mark at every size.
    const fav = document.createElement('canvas');
    fav.width = 16;
    fav.height = 16;
    const fctx = fav.getContext('2d');
    fctx.imageSmoothingEnabled = true;
    fctx.imageSmoothingQuality = 'high';
    fctx.drawImage(champ, 0, 0, 16, 16);

    return {
      champion32: champ.toDataURL('image/png'),
      touch180: touch.toDataURL('image/png'),
      favicon16: fav.toDataURL('image/png'),
    };
  }, { jpgDataURL, TILE, INK, CREAM });
  await page.close();
  return result;
})();

const champ32 = Buffer.from(champion32.split(',')[1], 'base64');
writeFileSync(path.join(root, 'public', 'favicon-32.png'), champ32);
console.log('rendered public/favicon-32.png');

// ── OG image: 1200×630, screenshot of the built site's real /og route ──────
{
  spawnSync('npx', ['astro', 'build'], { cwd: root, stdio: 'inherit', shell: true });

  const preview = spawn('npx', ['astro', 'preview', '--port', String(PORT)], {
    cwd: root,
    shell: true,
  });
  const url = `http://localhost:${PORT}/og`;
  for (let i = 0; ; i++) {
    try { await fetch(url); break; } catch {
      if (i > 50) throw new Error(`astro preview never came up on ${url}`);
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  // reducedMotion emulation freezes the city-light glimmer (tokens.css gates
  // it under prefers-reduced-motion: reduce) so repeated renders are byte-identical.
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.goto(url);
  await page.screenshot({
    path: path.join(root, 'public', 'og-image.png'),
    clip: { x: 0, y: 0, width: 1200, height: 630 },
  });
  await page.close();
  // preview.kill() only kills the shell wrapper, not the astro/node
  // grandchildren it spawned — taskkill /t walks the whole process tree.
  // ponytail: Windows-only. This script is run by hand on a Windows box and is
  // not in CI or package.json, so a cross-platform kill isn't earning its keep.
  // Upgrade path: if this ever runs on Linux/macOS or in CI, branch on
  // process.platform and use process.kill(-pid) there.
  spawnSync('taskkill', ['/pid', String(preview.pid), '/t', '/f']);
  console.log('rendered public/og-image.png');
}

// ── apple-touch-icon: 180×180 champion, straight off the processed canvas ──
{
  writeFileSync(path.join(root, 'public', 'apple-touch-icon.png'), Buffer.from(touch180.split(',')[1], 'base64'));
  console.log('rendered public/apple-touch-icon.png');
}

// ── favicon-16.png + favicon.ico: 16px + 32px, both the champion ───────────
{
  const fav16 = Buffer.from(favicon16.split(',')[1], 'base64');
  writeFileSync(path.join(root, 'public', 'favicon-16.png'), fav16);
  console.log('rendered public/favicon-16.png');

  // ICO container (valid since Vista): ICONDIR + one ICONDIRENTRY per image.
  const images = [{ size: 16, png: fav16 }, { size: 32, png: champ32 }];
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);          // reserved
  header.writeUInt16LE(1, 2);          // type: icon
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, png }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size, 0);           // width
    entry.writeUInt8(size, 1);           // height
    entry.writeUInt16LE(1, 4);           // colour planes
    entry.writeUInt16LE(32, 6);          // bits per pixel
    entry.writeUInt32LE(png.length, 8);  // image data size
    entry.writeUInt32LE(offset, 12);     // image data offset
    offset += png.length;
    return entry;
  });
  writeFileSync(
    path.join(root, 'public', 'favicon.ico'),
    Buffer.concat([header, ...entries, ...images.map((i) => i.png)])
  );
  console.log('rendered public/favicon.ico');
}

// ── freshness gate manifest ─────────────────────────────────────────────────
updateManifest({
  inputs: Object.fromEntries(
    [...COMMITTED_INPUTS, '.scratch/NAG_Badger.jpg'].map((f) => [f, hashFile(f)])
  ),
  outputs: Object.fromEntries(
    OUTPUTS.filter((f) => f !== 'public/sheet-portrait.png').map((f) => [f, hashFile(f)])
  ),
});
console.log('wrote tools/derived-images.json');

await browser.close();
