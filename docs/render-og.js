// Renders public/og-image.png (1200×630), public/apple-touch-icon.png (180×180)
// and public/favicon.ico (32×32) derived from the night scene and moon mark.
// Pattern mirrors docs/render-cv.js — playwright-core + msedge channel.
// Run from the repo root: node docs/render-og.js
import { chromium } from 'playwright-core';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const browser = await chromium.launch({ channel: 'msedge' });

// ── OG image: 1200×630, night scene ─────────────────────────────────────────
{
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 630 });
  // ponytail: scene SVG inlined here so the render script is self-contained
  // (no dependency on the Astro build output). Ceiling: must be kept in sync
  // with index.astro scene-standard; a shared SVG source file would be cleaner
  // if the scene ever changes.
  await page.setContent(`<!doctype html>
<html><head><meta charset="utf-8"><style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; background: #14121f; overflow: hidden; }
svg { display: block; width: 1200px; height: 630px; }
</style></head><body>
<svg viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <!-- Sky fill -->
  <rect width="1200" height="630" fill="#14121f"/>
  <!-- Stars -->
  <g fill="#e9e2cf">
    <circle cx="95"   cy="70"  r="1.6" opacity="0.8"/>
    <circle cx="240"  cy="120" r="1.2" opacity="0.5"/>
    <circle cx="410"  cy="55"  r="1.4" opacity="0.7"/>
    <circle cx="560"  cy="105" r="1.1" opacity="0.45"/>
    <circle cx="700"  cy="45"  r="1.5" opacity="0.75"/>
    <circle cx="1050" cy="60"  r="1.3" opacity="0.6"/>
    <circle cx="1150" cy="140" r="1.1" opacity="0.4"/>
    <circle cx="320"  cy="160" r="1.0" opacity="0.35"/>
  </g>
  <!-- Moon -->
  <circle cx="930" cy="120" r="54" fill="#ffd75e"/>
  <circle cx="914" cy="106" r="8"  fill="#e6b944"/>
  <circle cx="948" cy="134" r="6"  fill="#e6b944"/>
  <!-- Cape Town landforms: Table Mountain, Lion's Head, Signal Hill -->
  <polygon fill="#3a3457" points="40,530 130,390 190,340 230,330 300,326 480,328 540,334 585,373 640,530"/>
  <polygon fill="#3a3457" points="760,530 850,398 868,360 890,398 980,530"/>
  <polygon fill="#3a3457" points="890,530 932,494 984,468 1040,459 1096,468 1148,494 1190,530"/>
  <!-- City buildings -->
  <g fill="#262138">
    <rect x="190" y="440" width="34" height="90"/>
    <rect x="232" y="460" width="26" height="70"/>
    <rect x="266" y="424" width="40" height="106"/>
    <rect x="314" y="470" width="28" height="60"/>
    <rect x="350" y="436" width="36" height="94"/>
    <rect x="394" y="478" width="24" height="52"/>
    <rect x="426" y="416" width="44" height="114"/>
    <rect x="478" y="454" width="30" height="76"/>
    <rect x="516" y="432" width="38" height="98"/>
    <rect x="562" y="474" width="26" height="56"/>
    <rect x="596" y="444" width="42" height="86"/>
    <rect x="646" y="464" width="30" height="66"/>
    <rect x="684" y="430" width="36" height="100"/>
    <rect x="728" y="476" width="26" height="54"/>
    <rect x="766" y="468" width="32" height="62"/>
    <rect x="806" y="482" width="24" height="48"/>
  </g>
  <!-- Lit windows -->
  <g fill="#ffd75e">
    <rect x="198" y="452" width="4" height="5" opacity="0.85"/>
    <rect x="212" y="474" width="4" height="5" opacity="0.55"/>
    <rect x="274" y="436" width="4" height="5" opacity="0.9"/>
    <rect x="290" y="462" width="4" height="5" opacity="0.6"/>
    <rect x="358" y="448" width="4" height="5" opacity="0.8"/>
    <rect x="436" y="428" width="4" height="5" opacity="0.9"/>
    <rect x="452" y="454" width="4" height="5" opacity="0.65"/>
    <rect x="524" y="444" width="4" height="5" opacity="0.85"/>
    <rect x="606" y="456" width="4" height="5" opacity="0.8"/>
    <rect x="692" y="442" width="4" height="5" opacity="0.85"/>
  </g>
  <!-- Sea strip -->
  <rect y="530" width="1200" height="100" fill="#223240"/>
  <!-- Moonlight glints -->
  <rect x="900" y="548" width="60" height="3" rx="1.5" fill="#ffd75e" opacity="0.35"/>
  <rect x="915" y="562" width="34" height="3" rx="1.5" fill="#ffd75e" opacity="0.2"/>
  <!-- Site title text overlay -->
  <text x="600" y="600" text-anchor="middle" font-family="Georgia, serif"
        font-size="22" fill="#e9e2cf" opacity="0.7" letter-spacing="0.1em">
    CAVESHEN RAJMAN
  </text>
</svg>
</body></html>`);
  await page.screenshot({
    path: path.join(root, 'public', 'og-image.png'),
    clip: { x: 0, y: 0, width: 1200, height: 630 },
  });
  await page.close();
  console.log('rendered public/og-image.png');
}

// ── apple-touch-icon: 180×180, moon mark ─────────────────────────────────────
{
  const page = await browser.newPage();
  await page.setViewportSize({ width: 180, height: 180 });
  await page.setContent(`<!doctype html>
<html><head><meta charset="utf-8"><style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 180px; height: 180px; background: #14121f; overflow: hidden; }
svg { display: block; width: 180px; height: 180px; }
</style></head><body>
<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
  <rect width="180" height="180" rx="36" fill="#14121f"/>
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
body { width: 32px; height: 32px; background: #14121f; overflow: hidden; }
svg { display: block; width: 32px; height: 32px; }
</style></head><body>
<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="6" fill="#14121f"/>
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
