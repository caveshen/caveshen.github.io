// The Badger owns `/` — no selection mechanism, the route is the selector.
import { test, expect } from './fixtures.js';
import { sceneRects, visibleRect } from './geom.js';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
});

test('default: Badger visible, hooded figure absent', async ({ page }) => {
  await expect(page.locator('.scene-standard .badger-figure')).toBeVisible();
  await expect(page.locator('.scene-standard .hooded-figure')).not.toBeVisible();
});

// The prompt anchors to the face box top, not the raster group's own top — the
// raster carries transparent headroom above the drawn head, so a check against
// the raster box (.badger-figure) cannot prove the anchor: the raster's own
// top sits well above the face box, so a prompt anchored to the raster would
// still read as "above" it. Only a face-box-relative gap check catches that.
test('the approach prompt clears the face box with a 50px gap', async ({ page }) => {
  const promptBox = await page.locator('#approach-prompt').boundingBox();
  const faceBox   = await visibleRect(page, '.face-void');
  const gap = faceBox.y - (promptBox.y + promptBox.height);
  expect(Math.abs(gap - 50)).toBeLessThan(2);
});

// A broken href still paints a box (the <image> element itself has a size), so
// .badger-figure's own rect stays non-zero and the rest of the suite stays green
// over an empty stage — the request check is the only thing that catches it.
test('badger raster images resolve, and both idle frames are equal, non-zero, and 1:1', async ({ page, request }) => {
  const hrefs = await page.evaluate(() => [...document.querySelectorAll('image')].map((img) => img.getAttribute('href')));
  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of new Set(hrefs)) {
    const res = await request.get(href);
    expect(res.status()).toBe(200);
  }

  const [up, down] = await sceneRects(page, '.badger-image');
  expect(up.width).toBeGreaterThan(0);
  expect(up.height).toBeGreaterThan(0);
  expect(up.width).toBeCloseTo(down.width, 0);
  expect(up.height).toBeCloseTo(down.height, 0);
  expect(Math.abs(up.width / up.height - 1)).toBeLessThan(0.01);
});

test('no-JS: Badger visible, hooded figure absent', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  await expect(page.locator('.scene-standard .badger-figure')).toBeVisible();
  await expect(page.locator('.scene-standard .hooded-figure')).not.toBeVisible();
  await ctx.close();
});
