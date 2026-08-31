// gated-cover.spec.js — the GATED build: the landing page as a static
// terminus. Runs against playwright.gated.config.js's own server (GATED=1,
// port 4322), never the default config. desktop only — the gate is markup,
// not rendering.
import { test, expect } from '@playwright/test';

test('gated build: cover only, no scene/dialogue/dismissal script in the payload', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#threshold-cover')).toBeVisible();
  expect(await page.locator('#scene-root').count()).toBe(0);

  const html = await page.content();
  expect(html).not.toContain('id="return-to-menu"');
  expect(html).not.toContain('thresholdDismissed');
  expect(html).not.toContain('initStage');
});

test('both menu buttons are disabled and blurred', async ({ page }) => {
  await page.goto('/');
  const newGame = page.locator('#cover-new-game');
  const sheet = page.locator('#cover-sheet');

  await expect(newGame).toBeDisabled();
  await expect(sheet).toBeDisabled();
  expect(await sheet.evaluate((el) => el.tagName)).toBe('BUTTON'); // an <a> cannot be disabled

  expect(await newGame.evaluate((el) => getComputedStyle(el).filter)).toContain('blur');
  expect(await sheet.evaluate((el) => getComputedStyle(el).filter)).toContain('blur');
});

test('keyboard tab order skips the disabled buttons', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('#cover-new-game')).not.toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#cover-sheet')).not.toBeFocused();
});

test('the italic "Coming Soon" line renders beneath the buttons', async ({ page }) => {
  await page.goto('/');
  const line = page.getByText('Coming Soon');
  await expect(line).toBeVisible();
  expect(await line.evaluate((el) => getComputedStyle(el).fontStyle)).toBe('italic');
});

test('no-JS and reduced motion: the gated page shows the identical static cover', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('#threshold-cover')).toBeVisible();
  await expect(page.getByText('Coming Soon')).toBeVisible();
  await ctx.close();
});
