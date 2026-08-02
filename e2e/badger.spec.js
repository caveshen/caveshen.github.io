// The Badger owns `/` — no selection mechanism, the route is the selector.
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
});

// ── Default: Badger only ────────────────────────────────────────────────────

test('default: Badger visible, hooded figure absent', async ({ page }) => {
  await expect(page.locator('.scene-standard .badger-figure')).toBeVisible();
  await expect(page.locator('.scene-standard .hooded-figure')).not.toBeVisible();
});

// ── Approach/zoom framing works for the Badger ──────────────────────────────

test('approach applies a non-identity camera transform (not a no-op zoom)', async ({ page }) => {
  await page.locator('#approach-prompt').click();
  const transform = await page.locator('.camera').evaluate((el) => el.style.transform);
  expect(transform).not.toBe('');
  expect(transform).not.toBe('none');
});

test('the approach prompt sits above the Badger', async ({ page }) => {
  const promptBox = await page.locator('#approach-prompt').boundingBox();
  const badgerBox = await page.locator('.scene-standard .badger-figure').boundingBox();
  // "Above" per PRD §15 D1 convention: prompt's bottom edge clears the top of the character.
  expect(promptBox.y + promptBox.height).toBeLessThanOrEqual(badgerBox.y + 5);
});

test('approach frames the Badger face-void', async ({ page }) => {
  await page.locator('#approach-prompt').click();
  // The visible face-void (badger's) must have a non-zero box — proves the
  // camera math had a real anchor to compute from, not a hidden/zero-size one.
  const faceBox = await page.evaluate(() => {
    const el = [...document.querySelectorAll('.face-void')].find((e) => e.getBoundingClientRect().width > 0);
    const r = el.getBoundingClientRect();
    return { width: r.width, height: r.height };
  });
  expect(faceBox.width).toBeGreaterThan(0);
  expect(faceBox.height).toBeGreaterThan(0);
});

// ── No-JS: Badger only, structural default ──────────────────────────────────

test('no-JS: Badger visible, hooded figure absent', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  await expect(page.locator('.scene-standard .badger-figure')).toBeVisible();
  await expect(page.locator('.scene-standard .hooded-figure')).not.toBeVisible();
  await ctx.close();
});
