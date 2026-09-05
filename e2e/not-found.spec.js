// not-found.spec.js — the interactive 404: a door that isn't in the script.
import { test, expect } from '@playwright/test';
import { rectsIntersect, visibleRect, sceneRects, dialogueGround, approachPrompt } from './geom.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/404');
});

async function approach(page) {
  await approachPrompt(page);
}

test('approaching the hooded figure shows the dialogue card', async ({ page }) => {
  await approach(page);
  await expect(page.locator('.card')).toBeVisible();
});

test('the dialogue ground holds the night register in both themes', async ({ page }) => {
  await approach(page);
  const night = await dialogueGround(page);
  await page.locator('#toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-time', 'day');
  expect(await dialogueGround(page)).toBe(night);
});

// toBeVisible() only checks a non-empty box — an element parked off-screen still passes
// it — so this asserts the card sits fully inside the viewport and stays horizontally
// centred.

async function expectCardCentredAndOnScreen(page) {
  await approach(page);
  // Retry instead of guessing when the 550ms entrance transition has settled — a fixed
  // sleep here would race the real transition.
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

test('the 404 code is not rendered as a display number', async ({ page }) => {
  await approach(page);
  const stage = page.locator('.stage');
  await expect(stage).toBeVisible();
  // 404 is narrated, not displayed, so there's no copy-stable positive text to assert —
  // this negative check (no display-number element) is the load-bearing half.
  await expect(page.locator('.not-found-code')).toHaveCount(0);
});

test('the 404 page is noindex', async ({ page }) => {
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
});

test('the system option routes to /', async ({ page }) => {
  await approach(page);
  await page.locator('.choices button.system').first().click();
  await page.waitForURL('/');
  await expect(page).toHaveURL('/');
});

test('a non-system option advances to the next node', async ({ page }) => {
  await approach(page);
  const speechBefore = await page.locator('.speech').textContent();
  const optionBefore = await page.locator('.choices button:not(.system)').first().textContent();
  await page.locator('.choices button:not(.system)').first().click();
  await expect(page.locator('.speech')).not.toHaveText(speechBefore ?? '');
  // Must differ from the root option just clicked — catches stale root buttons left in place.
  const optionText = ((await page.locator('.choices button').first().textContent()) ?? '').trim();
  expect(optionText.length).toBeGreaterThan(0);
  expect(optionText).not.toBe((optionBefore ?? '').trim());
});

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

test('all three scene variants are present, exactly once each', async ({ page }) => {
  await expect(page.locator('.scene-standard')).toHaveCount(1);
  await expect(page.locator('.scene-wide')).toHaveCount(1);
  await expect(page.locator('.scene-tall')).toHaveCount(1);
});

// Stays with the hooded figure, not the Badger on `/` — the Badger's fill is deliberately theme-dependent.
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

// Placement comes from Scene.astro's shared fig table, so a collision here would
// otherwise arrive as a silent side effect of an unrelated edit.
for (const vp of [
  { name: 'standard (1920×1080)', width: 1920, height: 1080 },
  { name: 'tall (390×844)',       width: 390,  height: 844  },
]) {
  test(`face clears the dialogue card after approach — ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    // Reduced motion turns off the .camera transition, so the transform applies
    // instantly — a settled state with no timing wait needed.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/404');
    await approach(page);
    const cardBox = await page.locator('.card').boundingBox();
    const faceBox = await visibleRect(page, '.face-void');
    expect(rectsIntersect(faceBox, cardBox)).toBe(false);
  });
}

// A missing sleeve/leg leaves the torso's own bbox unchanged, so a silhouette-width
// check would never go red — parts must be checked individually.
test('arms and legs are present, attached to the torso, and not both on one side', async ({ page }) => {
  const arms = await sceneRects(page, '.fig-arm');
  const legs = await sceneRects(page, '.fig-leg');
  const [torso] = await sceneRects(page, '.fig-torso');
  const faceVoid = await visibleRect(page, '.face-void');

  expect(arms.length).toBe(2);
  expect(legs.length).toBe(2);
  for (const part of [...arms, ...legs]) {
    expect(part.width).toBeGreaterThan(0);
    expect(part.height).toBeGreaterThan(0);
    expect(rectsIntersect(part, torso)).toBe(true);
  }

  const torsoCentreX = torso.x + torso.width / 2;
  const armCentres = arms.map((a) => a.x + a.width / 2).sort((a, b) => a - b);
  expect(armCentres[0]).toBeLessThan(torsoCentreX);
  expect(armCentres[1]).toBeGreaterThan(torsoCentreX);

  expect(faceVoid.width).toBeGreaterThan(0);
  expect(faceVoid.height).toBeGreaterThan(0);
  expect(faceVoid.x).toBeGreaterThanOrEqual(torso.x);
  expect(faceVoid.x + faceVoid.width).toBeLessThanOrEqual(torso.x + torso.width);
});
