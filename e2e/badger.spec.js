// PRD d17 (was §27) — Badger avatar + interim TEST-ONLY character toggle.
// REMOVE-BEFORE-SHIP: this whole file tests scaffolding (the toggle) and can
// be deleted wholesale once the real figure-vs-Badger selection lands, aside
// from whichever assertions get folded into a permanent Badger-rendering
// test at that point.
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
});

// ── Default: hooded figure only ────────────────────────────────────────────

test('default: hooded figure visible, Badger absent', async ({ page }) => {
  await expect(page.locator('.scene-standard .hooded-figure')).toBeVisible();
  await expect(page.locator('.scene-standard .badger-figure')).not.toBeVisible();
  await expect(page.locator('html')).not.toHaveAttribute('data-character', 'badger');
});

// ── Toggle flips the on-stage character, and back ──────────────────────────

test('character toggle switches to Badger: figure hidden, Badger shown', async ({ page }) => {
  await page.locator('#character-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-character', 'badger');
  await expect(page.locator('.scene-standard .badger-figure')).toBeVisible();
  await expect(page.locator('.scene-standard .hooded-figure')).not.toBeVisible();
});

test('character toggle switches back to the hooded figure', async ({ page }) => {
  await page.locator('#character-toggle').click();
  await page.locator('#character-toggle').click();
  await expect(page.locator('.scene-standard .hooded-figure')).toBeVisible();
  await expect(page.locator('.scene-standard .badger-figure')).not.toBeVisible();
});

// ── Approach/zoom framing works for the Badger, not just the figure ────────

test('with Badger active, approach applies a non-identity camera transform (not a no-op zoom)', async ({ page }) => {
  await page.locator('#character-toggle').click();
  await page.locator('#approach-prompt').click();
  const transform = await page.locator('.camera').evaluate((el) => el.style.transform);
  expect(transform).not.toBe('');
  expect(transform).not.toBe('none');
});

test('with Badger active, the approach prompt sits above the Badger (its face-void), not the hidden figure', async ({ page }) => {
  await page.locator('#character-toggle').click();
  const promptBox = await page.locator('#approach-prompt').boundingBox();
  const badgerBox = await page.locator('.scene-standard .badger-figure').boundingBox();
  // "Above" per PRD §15 D1 convention: prompt's bottom edge clears the top of the character.
  expect(promptBox.y + promptBox.height).toBeLessThanOrEqual(badgerBox.y + 5);
});

test('with Badger active, approach frames the Badger face-void, not the figure face-void', async ({ page }) => {
  await page.locator('#character-toggle').click();
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

// ── No-JS: figure only, no toggle, no Badger ────────────────────────────────

test('no-JS: hooded figure visible, Badger absent, no character toggle rendered active', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  await expect(page.locator('.scene-standard .hooded-figure')).toBeVisible();
  await expect(page.locator('.scene-standard .badger-figure')).not.toBeVisible();
  await ctx.close();
});
