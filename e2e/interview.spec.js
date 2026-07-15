import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Each test gets a fresh browser context (Playwright default) so localStorage
  // is already empty — no need to clear it manually.
  await page.goto('/');
});

// ── Theme (criterion 5) ────────────────────────────────────────────────────────

test('night theme by default', async ({ page }) => {
  await expect(page.locator('html')).not.toHaveAttribute('data-time', 'day');
  await expect(page.locator('.night-only').first()).toBeVisible();
});

test('toggle switches to day theme', async ({ page }) => {
  await page.locator('#toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-time', 'day');
  await expect(page.locator('.day-only').first()).toBeVisible();
});

test('night-only elements hidden in day mode', async ({ page }) => {
  await page.locator('#toggle').click();
  // Night-only elements should not be visible
  await expect(page.locator('.night-only').first()).not.toBeVisible();
});

test('theme persists across reload', async ({ page }) => {
  await page.locator('#toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-time', 'day');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-time', 'day');
});

test('stored night choice survives system light-mode preference', async ({ page }) => {
  // Explicit night stored in localStorage
  await page.evaluate(() => localStorage.setItem('time', 'night'));
  await page.emulateMedia({ colorScheme: 'light' });
  await page.reload();
  // localStorage wins — stays night
  await expect(page.locator('html')).not.toHaveAttribute('data-time', 'day');
});

// ── Keyboard (criterion 2) ────────────────────────────────────────────────────

test('toggle is first in tab order and keyboard-operable', async ({ page }) => {
  await page.keyboard.press('Tab');
  await expect(page.locator('#toggle')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-time', 'day');
});

test('choice buttons are next in tab order after toggle', async ({ page }) => {
  await page.keyboard.press('Tab'); // toggle
  await page.keyboard.press('Tab'); // first choice button
  await expect(page.locator('#choices button').first()).toBeFocused();
});

test('full keyboard dialogue playthrough', async ({ page }) => {
  // Tab to first choice, activate it
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(page.locator('#choices button').first()).toBeFocused();

  const rootSpeech = await page.locator('#speech').textContent();
  await page.keyboard.press('Enter');

  // Wait for apply() to run (speech change proves replaceChildren has fired).
  // Without this wait the focus check below would race with the 200ms fade.
  await expect(page.locator('#speech')).not.toHaveText(rootSpeech ?? '');

  // Engine must auto-focus the first new button so keyboard users can continue.
  // This assertion FAILS if the focus fix in dialogue.js is absent.
  await expect(page.locator('#choices button').first()).toBeFocused();
  await page.keyboard.press('Enter');

  // Back at root — system button present
  await expect(page.locator('#choices button.system')).toBeVisible();
});

test('focused buttons have visible outline', async ({ page }) => {
  await page.keyboard.press('Tab'); // focus toggle
  const outlineStyle = await page.evaluate(() =>
    window.getComputedStyle(document.activeElement).outlineStyle
  );
  expect(outlineStyle).not.toBe('none');
});

// ── Reduced motion (criterion 3) ──────────────────────────────────────────────

test('blink animation absent under prefers-reduced-motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  const animName = await page.locator('.avatar .eyes').evaluate(el =>
    window.getComputedStyle(el).animationName
  );
  expect(animName).toBe('none');
});

test('dialogue content updates immediately under reduced-motion (no fade delay)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await page.locator('#choices button').first().click();
  // Opacity should be 1 immediately — no fade delay
  const opacity = await page.locator('#speech').evaluate(el =>
    parseFloat(window.getComputedStyle(el).opacity)
  );
  expect(opacity).toBeGreaterThan(0.9);
});

// ── Layout / overflow ─────────────────────────────────────────────────────────

test('no horizontal overflow', async ({ page }) => {
  const overflows = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(overflows).toBe(false);
});

// ── No-JS path ────────────────────────────────────────────────────────────────

test('root speech visible without JavaScript', async ({ browser }) => {
  const ctx  = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('#speech')).toBeVisible();
  await expect(page.locator('#speech')).toContainText('PLACEHOLDER');
  await ctx.close();
});

test('/sheet link present without JavaScript (noscript fallback)', async ({ browser }) => {
  const ctx  = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  // noscript content is rendered when JS disabled
  await expect(page.locator('a[href="/sheet"]')).toBeVisible();
  await ctx.close();
});
