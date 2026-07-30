// PRD d1 (was §30 D-4) — the interactive 404: same interview, a door that
// isn't in the script. `404` renders as the stage direction (.stage), not a
// display number; the way out is a kind:"system" option routing home via
// isPath().
// Formerly e2e/d4.spec.js — renamed to stop colliding with PRD item d4 (404
// day clouds); this file actually covers d1 plus d5's geometry assertions.
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/404');
});

// ── Page responds, card renders ─────────────────────────────────────────────

test('404 responds and renders the dialogue card', async ({ page }) => {
  await expect(page.locator('.card')).toBeVisible();
  await expect(page.locator('.name')).toHaveText('Caveshen');
});

// ── Geometry: ruling #1's actual criterion, pinned (PRD d5, was §30 D-14) ──
// toBeVisible() only checks a non-empty box — an element parked off-screen
// still passes it. This asserts what ruling #1 actually promises: the card
// sits fully inside the viewport and stays centred, to the pixel.

async function expectCardCentredAndOnScreen(page) {
  // Retry instead of guessing when the entrance transition (550ms) has
  // settled (PRD d10) — a fixed sleep here races the real transition.
  await expect(async () => {
    const card = await page.locator('.card').boundingBox();
    const viewport = page.viewportSize();
    expect(card).not.toBeNull();
    expect(card.x).toBeGreaterThanOrEqual(0);
    expect(card.y).toBeGreaterThanOrEqual(0);
    expect(card.x + card.width).toBeLessThanOrEqual(viewport.width);
    expect(card.y + card.height).toBeLessThanOrEqual(viewport.height);
    const cardCentreX = card.x + card.width / 2;
    expect(Math.abs(cardCentreX - viewport.width / 2)).toBeLessThanOrEqual(1);
    const cardCentreY = card.y + card.height / 2;
    expect(Math.abs(cardCentreY - viewport.height / 2)).toBeLessThanOrEqual(1);
  }).toPass();
}

test('the card is centred and fully on-screen', async ({ page }) => {
  await expectCardCentredAndOnScreen(page);
});

test('the card is centred and fully on-screen on a short viewport', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 360 });
  await expectCardCentredAndOnScreen(page);
});

test('the card is centred and fully on-screen on an ultrawide desktop', async ({ page }) => {
  await page.setViewportSize({ width: 3440, height: 1440 });
  await expectCardCentredAndOnScreen(page);
});

// ── Signature: the 404 fact lives in .stage, not a display number ──────────

test('the 404 code is not rendered as a display number', async ({ page }) => {
  const stage = page.locator('.stage');
  await expect(stage).toBeVisible();
  // The old placeholder page's display number is gone — no separate element
  // for it. (A toContainText('404') check used to sit here too, but that
  // couples the assertion to root.stage's prose — the same failure mode d7
  // exists to eliminate, just via a substring rather than the PLACEHOLDER
  // literal. "404 is narrated, not displayed" has no copy-stable positive
  // check available; this negative check is the load-bearing half.)
  await expect(page.locator('.not-found-code')).toHaveCount(0);
});

// ── noindex ships (PRD d1 ANSWERED 6, was §30 D-4) ──────────────────────────

test('the 404 page is noindex', async ({ page }) => {
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
});

// ── The system option routes home ───────────────────────────────────────────

test('the system option routes to /', async ({ page }) => {
  await page.locator('.choices button.system').first().click();
  await page.waitForURL('/');
  await expect(page).toHaveURL('/');
});

// ── A dialogue option advances a node ───────────────────────────────────────

test('a non-system option advances to the next node', async ({ page }) => {
  const speechBefore = await page.locator('.speech').textContent();
  const optionBefore = await page.locator('.choices button:not(.system)').first().textContent();
  await page.locator('.choices button:not(.system)').first().click();
  await expect(page.locator('.speech')).not.toHaveText(speechBefore ?? '');
  // The deeper node's own options are now on offer: non-empty, and different
  // from the root option just clicked (catches stale root buttons left in place).
  const optionText = ((await page.locator('.choices button').first().textContent()) ?? '').trim();
  expect(optionText.length).toBeGreaterThan(0);
  expect(optionText).not.toBe((optionBefore ?? '').trim());
});

// ── No-JS: root content is server-rendered ──────────────────────────────────

test('no-JS: root stage and speech render, card is visible', async ({ browser }) => {
  const ctx  = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/404');
  await expect(page.locator('.card')).toBeVisible();
  const stage = ((await page.locator('.stage').textContent()) ?? '').trim();
  expect(stage.length).toBeGreaterThan(0);
  const speech = ((await page.locator('.speech').textContent()) ?? '').trim();
  expect(speech.length).toBeGreaterThan(0);
  await expect(page.locator('a[href="/"]')).toBeVisible();
  await ctx.close();
});

// ── Reduced motion: no new animation is introduced ──────────────────────────

test('reduced motion: card and scene transitions are instant, no new animation added', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  const cardDuration = await page.locator('.card').evaluate((el) =>
    window.getComputedStyle(el).transitionDuration
  );
  expect(cardDuration).toBe('0s');
  await expect(page.locator('.card')).toHaveCSS('opacity', '1');
});
