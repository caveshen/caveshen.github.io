// Renders public/og-image.png (1200×630) and the icon set: favicon-16.png
// (the canonical badger head), favicon-32.png (the badger champion),
// favicon.ico (16 head + 32 champion, for legacy/taskbar consumers), and
// apple-touch-icon.png (180×180 champion). Sized rasters only — no
// favicon.svg — so 16px and 32px browser contexts genuinely get different
// art. The OG image is a screenshot of the built site's real /og route
// (astro build → astro preview), which renders the real Scene component.
// The head assets bake src/assets/badger-head.svg's token-class fills to hex
// (read from tokens.css :root) over a night-ink backdrop. The champion
// assets process .scratch/NAG_Badger.jpg (gitignored, private source) into
// pixel art. Run from the repo root: node docs/render-og.js
import { chromium } from 'playwright-core';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { COMMITTED_INPUTS, OUTPUTS, hashFile, updateManifest } from './derived-inputs.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PORT = 4331;
const browser = await chromium.launch({ channel: 'msedge' });

// ── canonical head: baked to hex, over a night-ink rounded square ──────────
// bgHex/faviconSVG are reused below to render favicon-16.png and the 16px
// slot of favicon.ico — one bake, two consumers.
const tokensCSS = readFileSync(path.join(root, 'src/styles/tokens.css'), 'utf8');
const tokensRootBlock = tokensCSS.match(/:root\s*\{[\s\S]*?\n\}/)[0];
const hexOf = (varName) => {
  const m = tokensRootBlock.match(new RegExp(`${varName}:\\s*(#[0-9a-fA-F]{3,8})`));
  if (!m) throw new Error(`${varName} not found in tokens.css :root block`);
  return m[1];
};
const bgHex = hexOf('--bg');

const faviconSVG = (() => {
  const headSVG = readFileSync(path.join(root, 'src/assets/badger-head.svg'), 'utf8');

  // class → var(--x) mapping, read off tokens.css's own fill rules (the head
  // source carries no strokes) — not hand-maintained, so a new f-head-* class
  // picks up its colour for free.
  const classToVar = Object.fromEntries(
    [...tokensCSS.matchAll(/\.([\w-]+)\s*\{[^}]*fill\s*:\s*var\((--[\w-]+)\)/g)]
      .map((m) => [m[1], m[2]])
  );
  const bakedHead = headSVG
    .replace(/^<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .replace(/<!--[\s\S]*?-->/g, '') // comments describe the class idiom, false once baked to fill=
    .replace(/class="([\w-]+)"/g, (full, cls) => {
      const varName = classToVar[cls];
      if (!varName) throw new Error(`no tokens.css fill rule maps class ${cls} to a var()`);
      return `fill="${hexOf(varName)}"`;
    });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220">
  <rect width="200" height="220" rx="24" fill="${bgHex}"/>
${bakedHead}
</svg>
`;
})();

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

const { champion32, touch180 } = await (async () => {
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

    return { champion32: champ.toDataURL('image/png'), touch180: touch.toDataURL('image/png') };
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

// ── favicon-16.png + favicon.ico: 16px canonical head, 32px champion ───────
{
  const page = await browser.newPage();
  await page.setViewportSize({ width: 16, height: 16 });
  await page.setContent(`<!doctype html>
<html><head><meta charset="utf-8"><style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 16px; height: 16px; background: ${bgHex}; overflow: hidden; }
svg { display: block; width: 16px; height: 16px; }
</style></head><body>${faviconSVG}</body></html>`);
  const head16 = await page.screenshot({ clip: { x: 0, y: 0, width: 16, height: 16 } });
  await page.close();
  writeFileSync(path.join(root, 'public', 'favicon-16.png'), head16);
  console.log('rendered public/favicon-16.png');

  // ICO container (valid since Vista): ICONDIR + one ICONDIRENTRY per image.
  const images = [{ size: 16, png: head16 }, { size: 32, png: champ32 }];
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
console.log('wrote docs/derived-images.json');

await browser.close();
