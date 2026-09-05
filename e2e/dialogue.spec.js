// dialogue.spec.js — streaming dialogue text: cadence, skip, and the a11y contract.
import { test, expect } from './fixtures.js';
import { assertNoIdentityMarkup, dialogueGround, approachPrompt, rectsIntersect, rectContains } from './geom.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

async function approach(page) {
  await approachPrompt(page);
}

// root -> experience is the shortest real navigation off the immediate-rendered
// root node, so it's the one path guaranteed to still be streaming ~400ms in.
async function startStream(page) {
  await approach(page);
  await page.locator('.choices button:not(.system)').first().click();
}

test('exactly one .speech element exists throughout a stream', async ({ page }) => {
  await startStream(page);
  await expect(page.locator('.speech-stream')).toBeVisible();
  await expect(page.locator('.speech')).toHaveCount(1);
});

test('screen-reader node (#speech) already holds the full line while the visual stream is mid-line', async ({ page }) => {
  await startStream(page);
  // Wait for the stream to have typed at least one character — toBeVisible on
  // .speech-stream fires before the first char, which is too early for this test.
  await expect(page.locator('.speech-stream span').first()).not.toBeEmpty();
  const speech = (await page.locator('#speech').textContent())?.trim();
  const shown = (await page.locator('.speech-stream span').first().textContent()) ?? '';
  expect(speech.length).toBeGreaterThan(0);
  expect(shown.length).toBeGreaterThan(0);
  expect(shown.length).toBeLessThan(speech.length);
  expect(speech.startsWith(shown)).toBe(true);
});

test('a click on the card mid-stream completes the line instantly and does not advance', async ({ page }) => {
  await startStream(page);
  await expect(page.locator('.speech-stream')).toBeVisible();
  const speechBefore = await page.locator('#speech').textContent();
  // Top-left padding corner: empty plaque background, never a stage/speech/choice
  // element — the .stage node itself is hidden on nodes with no stage direction.
  await page.locator('.card').click({ position: { x: 10, y: 10 } });
  await expect(page.locator('.speech-stream')).toHaveCount(0); // completed
  await expect(page.locator('#speech')).toHaveText(speechBefore ?? '');
  // Still the "experience" node — its single option goes back to root, not /sheet.
  await expect(page.locator('.choices button.system')).toHaveCount(0);
});

test('a keypress mid-stream completes the line instantly and does not activate the focused choice', async ({ page }) => {
  await startStream(page);
  await expect(page.locator('.speech-stream')).toBeVisible();
  const speechBefore = await page.locator('#speech').textContent();
  await page.keyboard.press('Enter'); // focused choice is "experience"'s single option
  await expect(page.locator('.speech-stream')).toHaveCount(0); // completed, not activated
  await expect(page.locator('#speech')).toHaveText(speechBefore ?? '');
  await expect(page.locator('.choices button.system')).toHaveCount(0);
});

test('a click on a choice mid-stream needs a second click to navigate', async ({ page }) => {
  await startStream(page);
  await expect(page.locator('.speech-stream')).toBeVisible();
  const speechBefore = await page.locator('#speech').textContent();
  const choice = page.locator('.choices button').first();
  await choice.click(); // swallowed — completes the stream, no navigation
  await expect(page.locator('.speech-stream')).toHaveCount(0);
  await expect(page.locator('#speech')).toHaveText(speechBefore ?? '');
  await choice.click(); // stream already complete — this one activates
  await expect(page.locator('#speech')).not.toHaveText(speechBefore ?? '');
});

test('Escape mid-stream still exits and returns focus to the prompt', async ({ page }) => {
  await startStream(page);
  await expect(page.locator('.speech-stream')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.card')).not.toBeVisible();
  // exit() refocuses the prompt ~1s later (the camera-settle delay, see
  // approach.spec.js) — toBeFocused()'s own retry/poll waits that out.
  await expect(page.locator('#approach-prompt')).toBeFocused();
});

test('dimmed choices are visually de-emphasised while streaming', async ({ page }) => {
  await startStream(page);
  await expect(page.locator('.speech-stream')).toBeVisible();
  const opacity = await page.locator('.choices').evaluate((el) => getComputedStyle(el).opacity);
  expect(parseFloat(opacity)).toBeLessThan(1);
  // Retry instead of a fixed sleep — the stream's real duration (several
  // seconds on the longer lines) varies by engine and by the line's length.
  await expect(page.locator('.choices')).toHaveCSS('opacity', '1', { timeout: 15000 });
});

test('reduced motion: the full line renders immediately, no stream node ever appears', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await startStream(page);
  await expect(page.locator('.speech-stream')).toHaveCount(0);
  const speech = (await page.locator('#speech').textContent())?.trim();
  expect(speech.length).toBeGreaterThan(0);
});

test('no avatar or nameplate markup renders', async ({ page }) => {
  await approach(page);
  await assertNoIdentityMarkup(page);
});

test('the dialogue ground holds the night register in both themes', async ({ page }) => {
  await approach(page);
  const night = await dialogueGround(page);
  await page.locator('#toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-time', 'day');
  expect(await dialogueGround(page)).toBe(night);
});

// ── The wheel ───────────────────────────────────────────────────────────────

const liBoxes = (page) => page.locator('.choices li').evaluateAll((els) => els.map((el) => {
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, width: r.width, height: r.height };
}));

test('every option sits on its own spoke: no two overlap, all inside the card', async ({ page }) => {
  await approach(page);
  await expect(page.locator('.card')).toHaveCSS('opacity', '1');
  const boxes = await liBoxes(page);
  expect(boxes.length).toBeGreaterThanOrEqual(3);
  const card = await page.locator('.card').boundingBox();
  for (let i = 0; i < boxes.length; i++) {
    expect(rectContains(card, boxes[i]), `option ${i + 1} inside the card`).toBe(true);
    for (let j = i + 1; j < boxes.length; j++) {
      expect(rectsIntersect(boxes[i], boxes[j]), `options ${i + 1} and ${j + 1} overlap`).toBe(false);
    }
  }
});

test('a fourth option takes the left of the ring; the first three fan the right', async ({ page }) => {
  const wide = await page.evaluate(() => matchMedia('(min-width: 761px) and (min-aspect-ratio: 4/5)').matches);
  test.skip(!wide, 'the wheel is a stack on narrow viewports');
  await approach(page);
  await expect(page.locator('.card')).toHaveCSS('opacity', '1');
  const boxes = await liBoxes(page);
  test.skip(boxes.length < 4, 'root has fewer than four options');
  const ring = await page.locator('.choices').boundingBox();
  const centreX = ring.x + ring.width / 2;
  for (let i = 0; i < 3; i++) expect(boxes[i].x, `option ${i + 1} right of centre`).toBeGreaterThan(centreX);
  expect(boxes[3].x + boxes[3].width, 'option 4 left of centre').toBeLessThan(centreX);
});

test('digit hotkeys pick the numbered option', async ({ page }) => {
  await approach(page);
  const before = await page.locator('#speech').textContent();
  await page.keyboard.press('2');
  await expect(page.locator('#speech')).not.toHaveText(before ?? '');
});

test('a digit mid-stream completes the line and does not pick', async ({ page }) => {
  await startStream(page);
  await expect(page.locator('.speech-stream')).toBeVisible();
  const speechBefore = await page.locator('#speech').textContent();
  await page.keyboard.press('1');
  await expect(page.locator('.speech-stream')).toHaveCount(0);
  await expect(page.locator('#speech')).toHaveText(speechBefore ?? '');
});
