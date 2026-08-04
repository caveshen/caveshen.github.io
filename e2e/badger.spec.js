// The Badger owns `/` — no selection mechanism, the route is the selector.
import { test, expect } from '@playwright/test';
import { sceneRects } from './geom.js';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
});

test('default: Badger visible, hooded figure absent', async ({ page }) => {
  await expect(page.locator('.scene-standard .badger-figure')).toBeVisible();
  await expect(page.locator('.scene-standard .hooded-figure')).not.toBeVisible();
});

test('approach applies a non-identity camera transform (not a no-op zoom)', async ({ page }) => {
  await page.locator('#approach-prompt').click();
  const transform = await page.locator('.camera').evaluate((el) => el.style.transform);
  expect(transform).not.toBe('');
  expect(transform).not.toBe('none');
});

test('the approach prompt sits above the Badger', async ({ page }) => {
  const promptBox = await page.locator('#approach-prompt').boundingBox();
  const badgerBox = await page.locator('.scene-standard .badger-figure').boundingBox();
  // "Above": prompt's bottom edge clears the top of the character.
  expect(promptBox.y + promptBox.height).toBeLessThanOrEqual(badgerBox.y + 5);
});

test('approach frames the Badger face-void', async ({ page }) => {
  await page.locator('#approach-prompt').click();
  // Non-zero box proves the camera math had a real anchor, not a hidden/zero-size one.
  const faceBox = await page.evaluate(() => {
    const el = [...document.querySelectorAll('.face-void')].find((e) => e.getBoundingClientRect().width > 0);
    const r = el.getBoundingClientRect();
    return { width: r.width, height: r.height };
  });
  expect(faceBox.width).toBeGreaterThan(0);
  expect(faceBox.height).toBeGreaterThan(0);
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
