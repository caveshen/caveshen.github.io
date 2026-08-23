// Throwaway d37-04 evidence harness: captures night+day per aspect variant
// and live-checks the new scene elements plus the locked mountain ratio.
import { chromium } from 'playwright-core';

const BASE = 'http://127.0.0.1:4322/';
const VIEWS = {
  standard: { width: 1920, height: 1080 },
  wide: { width: 2560, height: 1080 },
  tall: { width: 390, height: 844 },
};

const browser = await chromium.launch({ channel: 'msedge' });
const report = {};
for (const [name, viewport] of Object.entries(VIEWS)) {
  const page = await browser.newPage({ viewport });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  report[name] = {};
  for (const theme of ['night', 'day']) {
    if (theme === 'day') {
      await page.click('#toggle');
      await page.waitForTimeout(700);
    }
    await page.screenshot({ path: `screenshots/d37-04-${name}-${theme}.png` });
    report[name][theme] = await page.evaluate((variant) => {
      const scene = document.querySelector(`.scene-${variant}`);
      const vis = scene && scene.getBoundingClientRect().width > 0;
      const r = (el) => { const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, width: b.width, height: b.height }; };
      const tm = scene.querySelector('.table-mountain');
      const ratio = tm ? +(r(tm).width / r(tm).height).toFixed(3) : null;
      const inter = (a, b) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
      const moon = scene.querySelector('circle.f-moon');
      const mr = moon ? r(moon) : null;
      const sea = r(scene.querySelector('.f-sea'));
      const banks = [...scene.querySelectorAll('.f-cloudbank rect')].map(r);
      const dashes = [...scene.querySelectorAll('.f-sea ~ .f-moon rect')].map(r);
      const sparks = [...scene.querySelectorAll('.f-sparkle path')].map(r);
      const mists = [...scene.querySelectorAll('.f-mist rect')].map(r);
      const dot = [...scene.querySelectorAll('.f-warn-dot')].map(r).find((d) => d.width > 0);
      const nearRects = [...scene.querySelectorAll('.f-near rect')].map(r);
      const tallest = nearRects.reduce((a, x) => (x.y < a.y ? x : a), { y: Infinity, x: 0, width: 0 });
      const sails = [...scene.querySelectorAll('.f-sail polygon')].map(r);
      return {
        visibleScene: vis,
        mountainRatio: ratio,
        bankSeatsMoon: banks.some((b) => inter(b, mr) && b.y > mr.y + mr.height / 2),
        glintCount: dashes.length,
        glintOnSeaAligned: dashes.every((d) => d.y >= sea.y - 1 && d.y + d.height <= sea.y + sea.height + 1 && Math.abs(d.x + d.width / 2 - (mr.x + mr.width / 2)) <= 45),
        sparkleCount: sparks.filter((s) => s.width > 0).length,
        mistBands: mists.filter((m) => m.width > 0).length,
        warnDotAboveTallest: !!dot && dot.y + dot.height <= tallest.y + 2,
        sailCount: sails.filter((s) => s.width > 0).length,
        sailsOnSea: sails.filter((s) => s.width > 0).every((s) => inter(s, sea)),
      };
    }, name);
  }
  await page.close();
}
await browser.close();
console.log(JSON.stringify(report, null, 2));
