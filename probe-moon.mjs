import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto('http://127.0.0.1:4322/', { waitUntil: 'networkidle' });
await page.waitForTimeout(300);
const moon = await page.locator('.scene-scene, .scene').filter({ hasNot: page.locator('nothing') }).first();
const box = await page.evaluate(() => {
  const m = document.querySelector('.scene:not([style*="display: none"]) circle.f-moon');
  const r = m.getBoundingClientRect();
  return { x: r.x, y: r.y, width: r.width, height: r.height };
});
const pad = 40;
await page.screenshot({
  path: 'screenshots/d37-05-moon-closeup.png',
  clip: { x: box.x - pad, y: box.y - pad, width: box.width + pad * 2, height: box.height + pad * 2 },
});
await browser.close();
console.log('closeup saved');
