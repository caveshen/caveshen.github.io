// P4 — Landing v2: the approach — e2e tests
// Covers success criteria 2–8 and 10 (SC1 is unit-tested; SC9, SC11, SC12 are run-level checks).
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

// ── SC2: card hidden on load, prompt visible and named ────────────────────────

test('card not visible on load with JS', async ({ page }) => {
  await expect(page.locator('.card')).not.toBeVisible();
});

test('approach prompt visible on load and has accessible name containing PLACEHOLDER', async ({ page }) => {
  const prompt = page.locator('#approach-prompt');
  await expect(prompt).toBeVisible();
  // Accessible name comes from button text (PLACEHOLDER copy as required by PRD §2)
  await expect(prompt).toContainText('PLACEHOLDER');
});

// ── SC3: approaching shows card, applies camera transform, hides prompt ────────

test('approaching shows the card', async ({ page }) => {
  await page.locator('#approach-prompt').click();
  await expect(page.locator('.card')).toBeVisible();
});

test('approaching hides the prompt', async ({ page }) => {
  await page.locator('#approach-prompt').click();
  await expect(page.locator('#approach-prompt')).not.toBeVisible();
});

test('approaching applies a non-identity camera transform', async ({ page }) => {
  await page.locator('#approach-prompt').click();
  // Use el.style.transform (the JS-set target value, not the animated computed value).
  // getComputedStyle during an active transition returns the interpolated value at t≈0,
  // which is still identity — making the test flaky. The inline style is set synchronously.
  const transform = await page.locator('.camera').evaluate((el) => el.style.transform);
  expect(transform).not.toBe('');
  expect(transform).not.toBe('none');
});

// ── SC4: prompt reachable by Tab; activates with Enter and Space ──────────────

test('approach prompt is reachable by Tab from the toggle', async ({ page }) => {
  await page.keyboard.press('Tab'); // theme toggle
  await page.keyboard.press('Tab'); // approach prompt
  await expect(page.locator('#approach-prompt')).toBeFocused();
});

test('approach prompt activates with Enter', async ({ page }) => {
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('.card')).toBeVisible();
});

test('approach prompt activates with Space', async ({ page }) => {
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Space');
  await expect(page.locator('.card')).toBeVisible();
});

// ── SC5: focus lands on first dialogue option after approach ──────────────────

test('focus lands on first dialogue option after approaching', async ({ page }) => {
  await page.locator('#approach-prompt').click();
  await expect(page.locator('#choices button').first()).toBeFocused();
});

// ── SC6: exits restore state, prompt re-focused ───────────────────────────────

test('end-dialogue button hides card and restores prompt', async ({ page }) => {
  await page.locator('#approach-prompt').click();
  await page.locator('#end-dialogue').click();
  await expect(page.locator('.card')).not.toBeVisible();
  await expect(page.locator('#approach-prompt')).toBeVisible();
  await expect(page.locator('#approach-prompt')).toBeFocused();
});

test('end-dialogue button resets camera to identity', async ({ page }) => {
  await page.locator('#approach-prompt').click();
  await page.locator('#end-dialogue').click();
  // Check the inline style directly — exit() sets camera.style.transform = 'none'
  const transform = await page.locator('.camera').evaluate((el) => el.style.transform);
  expect(transform).toBe('none');
});

test('Escape exits dialogue and hides card', async ({ page }) => {
  await page.locator('#approach-prompt').click();
  await page.keyboard.press('Escape');
  await expect(page.locator('.card')).not.toBeVisible();
  await expect(page.locator('#approach-prompt')).toBeVisible();
});

test('Escape returns focus to approach prompt', async ({ page }) => {
  await page.locator('#approach-prompt').click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#approach-prompt')).toBeFocused();
});

// ── SC7: prefers-reduced-motion — camera jump-cuts (transition-duration 0s) ───

test('camera transition-duration is 0s under prefers-reduced-motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  const duration = await page.locator('.camera').evaluate((el) =>
    window.getComputedStyle(el).transitionDuration
  );
  expect(duration).toBe('0s');
});

// ── SC8: figure fills are theme-independent ───────────────────────────────────

test('figure fill colours are unchanged by day/night toggle', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  // Night is default — get fill of the jeans path (literal #2b2f3f, never themed)
  const getNightFill = () =>
    page.locator('.scene-standard .hooded-figure path').first()
      .getAttribute('fill');
  const nightFill = await getNightFill();
  await page.locator('#toggle').click(); // switch to day
  const dayFill = await page.locator('.scene-standard .hooded-figure path').first()
    .getAttribute('fill');
  expect(nightFill).toBe(dayFill);
  expect(nightFill).toBeTruthy(); // must have a literal colour, not null
});

// ── SC10: no-JS path — card visible, /sheet reachable ────────────────────────

test('no-JS: card is visible on load', async ({ browser }) => {
  const ctx  = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('.card')).toBeVisible();
  await ctx.close();
});

test('no-JS: /sheet link is reachable', async ({ browser }) => {
  const ctx  = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('a[href="/sheet"]')).toBeVisible();
  await ctx.close();
});
