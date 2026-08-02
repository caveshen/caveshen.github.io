// Renders public/og-image.png (1200×630), public/apple-touch-icon.png (180×180)
// and public/favicon.ico (32×32) derived from the night scene and moon mark.
// The OG image is rendered from the real built site (astro build → astro preview,
// same as e2e/playwright.config.js's webServer) so it can never drift from the
// scene, unlike a hand-copied inline SVG. The two icon blocks below render from
// small inline snippets — they draw the moon *mark*, a deliberately different
// (warm) palette from the scene, so there's no "real source" to
// point at for them; pattern mirrors docs/render-cv.js, which also targets a
// real source file.
// Run from the repo root: node docs/render-og.js
import { chromium } from 'playwright-core';
import { writeFileSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PORT = 4331;
const browser = await chromium.launch({ channel: 'msedge' });

// ── OG image: 1200×630, real scene, rendered off the built site ────────────
{
  spawnSync('npx', ['astro', 'build'], { cwd: root, stdio: 'inherit', shell: true });

  const preview = spawn('npx', ['astro', 'preview', '--port', String(PORT)], {
    cwd: root,
    shell: true,
  });
  const url = `http://localhost:${PORT}/`;
  for (let i = 0; ; i++) {
    try { await fetch(url); break; } catch {
      if (i > 50) throw new Error(`astro preview never came up on ${url}`);
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.goto(url);
  await page.addStyleTag({
    content: `
      /* CAMERA.std is the standard variant; at a bare 1200×630 viewport the
         min-aspect-ratio:15/8 query would otherwise select scene-wide instead. */
      .scene-standard { display: block !important; }
      .scene-wide, .scene-tall { display: none !important; }
      /* Scenery only (Caveshen's ruling): no characters, no UI chrome. */
      .js-character, .card, #approach-prompt, #toggle, #fullscreen-toggle,
      .banner-plane, .page-foot { display: none !important; }
    `,
  });
  await page.evaluate(() => {
    const t = document.createElement('div');
    t.textContent = 'CAVESHEN RAJMAN';
    t.style.cssText = 'position:fixed; left:0; top:570px; width:1200px; text-align:center;' +
      'font-family:Georgia, serif; font-size:22px; color:#e9e2cf; opacity:0.7; letter-spacing:0.1em;';
    document.body.appendChild(t);
  });
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

// ── apple-touch-icon: 180×180, moon mark ─────────────────────────────────────
{
  const page = await browser.newPage();
  await page.setViewportSize({ width: 180, height: 180 });
  await page.setContent(`<!doctype html>
<html><head><meta charset="utf-8"><style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 180px; height: 180px; background: #0f1826; overflow: hidden; }
svg { display: block; width: 180px; height: 180px; }
</style></head><body>
<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
  <rect width="180" height="180" rx="36" fill="#0f1826"/>
  <circle cx="90" cy="90" r="62" fill="#ffd75e"/>
  <circle cx="68" cy="74" r="12" fill="#e6b944"/>
  <circle cx="104" cy="102" r="9"  fill="#e6b944"/>
</svg>
</body></html>`);
  await page.screenshot({
    path: path.join(root, 'public', 'apple-touch-icon.png'),
    clip: { x: 0, y: 0, width: 180, height: 180 },
  });
  await page.close();
  console.log('rendered public/apple-touch-icon.png');
}

// ── favicon.ico: 32×32 moon mark (PNG-in-ICO container) ──────────────────────
{
  const page = await browser.newPage();
  await page.setViewportSize({ width: 32, height: 32 });
  // Same markup as public/favicon.svg
  await page.setContent(`<!doctype html>
<html><head><meta charset="utf-8"><style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 32px; height: 32px; background: #0f1826; overflow: hidden; }
svg { display: block; width: 32px; height: 32px; }
</style></head><body>
<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="6" fill="#0f1826"/>
  <circle cx="16" cy="16" r="11" fill="#ffd75e"/>
  <circle cx="12" cy="13" r="2.2" fill="#e6b944"/>
  <circle cx="18.5" cy="18" r="1.6" fill="#e6b944"/>
</svg>
</body></html>`);
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
