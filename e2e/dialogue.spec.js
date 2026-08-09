// dialogue.spec.js — streaming dialogue text: cadence, skip, and the a11y contract.
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

async function approach(page) {
  await page.locator('#approach-prompt').click();
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
  await page.locator('.card-head').click(); // anywhere on the card, not a choice
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
  const choice = page.locator('.choices button').first();
  await choice.click(); // swallowed — completes the stream, no navigation
  await expect(page.locator('.choices button.system')).toHaveCount(0);
  await choice.click(); // stream already complete — this one activates
  await expect(page.locator('.choices button.system')).toBeVisible();
});

test('Escape mid-stream still exits and returns focus to the prompt', async ({ page }) => {
  await startStream(page);
  await expect(page.locator('.speech-stream')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.card')).not.toBeVisible();
  await expect(page.locator('#approach-prompt')).toBeFocused();
});

test('dimmed choices are visually de-emphasised while streaming', async ({ page }) => {
  await startStream(page);
  await expect(page.locator('.speech-stream')).toBeVisible();
  const opacity = await page.locator('.choices').evaluate((el) => getComputedStyle(el).opacity);
  expect(parseFloat(opacity)).toBeLessThan(1);
  // Retry instead of a fixed sleep — the stream's real duration (~2.2s on this
  // line) varies enough by engine that a flat wait flaked on WebKit.
  await expect(page.locator('.choices')).toHaveCSS('opacity', '1', { timeout: 5000 });
});

test('reduced motion: the full line renders immediately, no stream node ever appears', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await startStream(page);
  await expect(page.locator('.speech-stream')).toHaveCount(0);
  const speech = (await page.locator('#speech').textContent())?.trim();
  expect(speech.length).toBeGreaterThan(0);
});
