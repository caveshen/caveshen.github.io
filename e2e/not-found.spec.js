// not-found.spec.js — the interactive 404: a door that isn't in the script.
import { test, expect } from '@playwright/test';
import { rectsIntersect, visibleRect } from './geom.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/404');
});

async function approach(page) {
  await page.locator('#approach-prompt').click();
}

// ── Card hidden on load, shown on approach ──────────────────────────────────

test('card not visible on load with JS', async ({ page }) => {
  await expect(page.locator('.card')).not.toBeVisible();
});

test('approaching the hooded figure shows the dialogue card', async ({ page }) => {
  await approach(page);
  await expect(page.locator('.card')).toBeVisible();
  await expect(page.locator('.name')).toHaveText('Caveshen');
});

// ── Geometry: on-screen and centred, to the pixel ───────────────────────────
// toBeVisible() only checks a non-empty box — an element parked off-screen
// still passes it. This asserts the card sits fully inside the viewport and
// stays horizontally centred.

async function expectCardCentredAndOnScreen(page) {
  await approach(page);
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
  await approach(page);
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
  await approach(page);
  await page.locator('.choices button.system').first().click();
  await page.waitForURL('/');
  await expect(page).toHaveURL('/');
});

// ── A dialogue option advances a node ───────────────────────────────────────

test('a non-system option advances to the next node', async ({ page }) => {
  await approach(page);
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

// ── No-JS: root content is server-rendered, card visible via noscript ───────

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
  await approach(page);
  const cardDuration = await page.locator('.card').evaluate((el) =>
    window.getComputedStyle(el).transitionDuration
  );
  expect(cardDuration).toBe('0s');
  await expect(page.locator('.card')).toHaveCSS('opacity', '1');
});

// ── Structural parity: variants ──────────────────────────────────────────────
// Figure-presence and bg/fg-seam are character-swapped clones of approach.spec.js's
// checks for `/` — parameterised there over {route, characterClass}. Variant
// count doesn't depend on the character, so it stays here, unduplicated.

test('all three scene variants are present, exactly once each', async ({ page }) => {
  await expect(page.locator('.scene-standard')).toHaveCount(1);
  await expect(page.locator('.scene-wide')).toHaveCount(1);
  await expect(page.locator('.scene-tall')).toHaveCount(1);
});

// Can't re-point at the Badger on `/` — it's deliberately theme-dependent,
// so this test stays with the figure.
test('figure fill colours are unchanged by day/night toggle', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
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

// The zoomed face must clear the dialogue card that overlays it. Placement
// comes from Scene.astro's shared fig table, so a collision here would
// otherwise arrive as a silent side effect of an unrelated edit.
for (const vp of [
  { name: 'standard (1920×1080)', width: 1920, height: 1080 },
  { name: 'tall (390×844)',       width: 390,  height: 844  },
]) {
  test(`face clears the dialogue card after approach — ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    // Reduced motion turns off the .camera transition, so the transform
    // applies instantly — a settled state with no timing wait.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/404');
    await approach(page);
    const cardBox = await page.locator('.card').boundingBox();
    const faceBox = await visibleRect(page, '.face-void');
    expect(rectsIntersect(faceBox, cardBox)).toBe(false);
  });
}
