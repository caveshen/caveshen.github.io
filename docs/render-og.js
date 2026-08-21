// Renders public/og-image.png (1200×630), public/favicon.svg/.ico (32×32) and
// public/apple-touch-icon.png (180×180). The OG image is a screenshot of the
// built site's real /og route (astro build → astro preview), which renders
// the real Scene component. The icon blocks bake src/assets/badger-head.svg's
// token-class fills to hex (read from tokens.css :root) over a night-ink
// backdrop. Run from the repo root: node docs/render-og.js
import { chromium } from 'playwright-core';
import { writeFileSync, readFileSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PORT = 4331;
const browser = await chromium.launch({ channel: 'msedge' });

// ── favicon.svg: badger head baked to hex, over a night-ink rounded square ──
// bgHex/faviconSVG are reused below to render favicon.ico and apple-touch-icon.png
// — one bake, three consumers.
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
writeFileSync(path.join(root, 'public', 'favicon.svg'), faviconSVG);
console.log('rendered public/favicon.svg');

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

// ── apple-touch-icon: 180×180, baked badger head ─────────────────────────────
// iOS applies its own corner mask, so this is full-bleed (no rounding needed
// beyond the favicon.svg backdrop's own rx). preserveAspectRatio's default
// (xMidYMid meet) letterboxes the 200×220 source into the 180×180 square;
// the letterbox is invisible because the page background matches the backdrop.
{
  const page = await browser.newPage();
  await page.setViewportSize({ width: 180, height: 180 });
  await page.setContent(`<!doctype html>
<html><head><meta charset="utf-8"><style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 180px; height: 180px; background: ${bgHex}; overflow: hidden; }
svg { display: block; width: 180px; height: 180px; }
</style></head><body>${faviconSVG}</body></html>`);
  await page.screenshot({
    path: path.join(root, 'public', 'apple-touch-icon.png'),
    clip: { x: 0, y: 0, width: 180, height: 180 },
  });
  await page.close();
  console.log('rendered public/apple-touch-icon.png');
}

// ── favicon.ico: 32×32 baked badger head (PNG-in-ICO container) ─────────────
{
  const page = await browser.newPage();
  await page.setViewportSize({ width: 32, height: 32 });
  await page.setContent(`<!doctype html>
<html><head><meta charset="utf-8"><style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 32px; height: 32px; background: ${bgHex}; overflow: hidden; }
svg { display: block; width: 32px; height: 32px; }
</style></head><body>${faviconSVG}</body></html>`);
  const png = await page.screenshot({ clip: { x: 0, y: 0, width: 32, height: 32 } });
  await page.close();
  // ICO container around the PNG (valid since Vista): ICONDIR + one ICONDIRENTRY.
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0);           // reserved
  header.writeUInt16LE(1, 2);           // type: icon
  header.writeUInt16LE(1, 4);           // image count
  header.writeUInt8(32, 6);             // width
  header.writeUInt8(32, 7);             // height
  header.writeUInt8(0, 8);              // palette colours
  header.writeUInt8(0, 9);              // reserved
  header.writeUInt16LE(1, 10);          // colour planes
  header.writeUInt16LE(32, 12);         // bits per pixel
  header.writeUInt32LE(png.length, 14); // image data size
  header.writeUInt32LE(22, 18);         // image data offset
  writeFileSync(path.join(root, 'public', 'favicon.ico'), Buffer.concat([header, png]));
  console.log('rendered public/favicon.ico');
}

await browser.close();
