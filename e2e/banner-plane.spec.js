// Ambient banner plane — e2e tests
// Uses Playwright's clock API to fast-forward the JS setTimeout chain
// deterministically rather than waiting real wall-clock minutes.
import { test, expect } from '@playwright/test';

// Forces a landscape viewport — several mobile/tablet projects default to
// portrait, where the plane is CSS-suppressed (see the dedicated portrait
// test below), which would make every other assertion here meaningless.
async function gotoAndFireFirstPass(page) {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.clock.install();
  await page.goto('/');
  await page.clock.fastForward(10_000);
}

// ── A pass can appear in the zoomed-out state ──────────────────────────────

test('a scheduled pass appears and animates while zoomed out', async ({ page }) => {
  await gotoAndFireFirstPass(page);
  const plane = page.locator('.banner-plane');
  await expect(plane).toBeAttached();
  await expect(plane).toContainText('MAVERICKS');
  const animationName = await plane.evaluate((el) => getComputedStyle(el).animationName);
  expect(animationName).toBe('plane-fly');
});

// ── Never present once approached; in-flight pass fades out on approach ───

test('approaching before any pass has fired never shows a plane', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  await page.locator('#approach-prompt').click();
  await page.clock.fastForward(10_000);
  await expect(page.locator('.banner-plane')).toHaveCount(0);
});

test('an in-flight pass fades out on approach rather than freezing or vanishing', async ({ page }) => {
  await gotoAndFireFirstPass(page);
  const plane = page.locator('.banner-plane');
  await expect(plane).toBeAttached();
  await page.locator('#approach-prompt').click();
  await expect(plane).toHaveClass(/plane-fade-out/);
  // Proves gradual (not a hard cut to invisible/removed) via the declared
  // transition rather than sampling a magic instant mid-flight — CSS
  // transitions run on the compositor and aren't faked by page.clock, so
  // a wall-clock sleep here races the real 400ms window.
  await expect(plane).toHaveCSS('transition-duration', '0.4s');
  await expect(plane).toHaveCSS('transition-property', 'opacity');
  // Fade completes and the element is cleaned up — proves it doesn't freeze
  // mid-sky forever either. transitionend (which drives this removal) only
  // fires for a transition that actually ran, so this also confirms the
  // fade genuinely played out rather than being a declared-but-inert rule.
  await expect(plane).toHaveCount(0);
});

// ── Absent under prefers-reduced-motion ────────────────────────────────────

test('no plane fires under prefers-reduced-motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await page.goto('/');
  await page.clock.fastForward(10_000);
  await expect(page.locator('.banner-plane')).toHaveCount(0);
});

// ── Suppressed on portrait ──────────────────────────────────────────────────

test('a fired pass is not visible on a portrait viewport', async ({ page }) => {
  await gotoAndFireFirstPass(page); // landscape, so the pass actually fires
  await page.setViewportSize({ width: 390, height: 844 }); // then narrow to portrait
  // The element may still exist (JS doesn't check aspect ratio — CSS does),
  // but it must never actually be visible on the narrow tall scene.
  await expect(page.locator('.banner-plane')).not.toBeVisible();
});

// ── pointer-events: none — never intercepts clicks ─────────────────────────

test('the plane is pointer-events: none and never blocks the approach prompt', async ({ page }) => {
  await gotoAndFireFirstPass(page);
  await expect(page.locator('.banner-plane')).toHaveCSS('pointer-events', 'none');
  // Prove it in practice too: click through where the plane sits and confirm
  // the scene beneath it is still interactive.
  await page.locator('#approach-prompt').click();
  await expect(page.locator('.card')).toBeVisible();
});

// ── no-JS: absent from the DOM ──────────────────────────────────────────────

test('no-JS: no plane element exists in the DOM', async ({ browser }) => {
  const ctx  = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('.banner-plane')).toHaveCount(0);
  await ctx.close();
});
