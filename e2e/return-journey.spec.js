// return-journey.spec.js — /sheet → / return via cross-document view transition.
import { test, expect } from '@playwright/test';

// Navigate from / to /sheet via the dialogue system option.
async function navigateToSheet(page) {
  await page.goto('/');
  await page.locator('#approach-prompt').click();
  await page.locator('#choices button.system').click();
  await page.waitForURL('/sheet');
  // Cross-document VT can leave WebKit in a transient state where evaluate()
  // is rejected immediately after waitForURL resolves.
  await page.waitForLoadState('domcontentloaded');
}

// Execution evidence: pagereveal fires before first paint, so by domcontentloaded
// the class is present or it never will be. The API probe ('onpageswap' in window)
// is true on CI headless Chromium even when cross-document transitions don't execute.
const arrivedByMorph = (page) =>
  page.locator('html').evaluate(el => el.classList.contains('arrived-by-morph'));

// Full return: / → /sheet → back link → /. End-state assertions hold in all engines
// because after cleanup the DOM returns to baseline.
test('back link returns to / with idle running, no overlay, no arrived-by-morph', async ({ page }) => {
  const errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (err) => errors.push(err.message));

  await page.setViewportSize({ width: 1920, height: 1080 });
  await navigateToSheet(page);
  await page.locator('.back-link').click();
  await page.waitForURL('/');
  await page.waitForLoadState('domcontentloaded');

  // No overlay img remains (auto-retrying — covers both morph-ran and cleanup-done).
  await expect(page.locator('body > img[src="/badger-up.png"]')).toHaveCount(0);

  // / never sets arrived-by-morph.
  const hasMarker = await page.locator('html').evaluate(el => el.classList.contains('arrived-by-morph'));
  expect(hasMarker).toBe(false);

  // Idle is alive: CSS animation names and visibility restored (auto-retrying).
  await expect.poll(() =>
    page.locator('.badger-up').first().evaluate(el => getComputedStyle(el).animationName)
  ).toBe('badger-up');
  await expect.poll(() =>
    page.locator('.badger-up').first().evaluate(el => getComputedStyle(el).visibility)
  ).toBe('visible');
  await expect.poll(() =>
    page.locator('.badger-down').first().evaluate(el => getComputedStyle(el).animationName)
  ).toBe('badger-down');

  // No console errors (filter the known-benign Chromium line).
  const unexpected = errors.filter((e) => e !== 'Transition was skipped');
  expect(unexpected).toEqual([]);
});

// Reduced motion: no transition runs; no overlay is ever created; Badger holds up frame.
test('reduced motion: back link arrival is instant, no overlay, Badger holds up frame', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await navigateToSheet(page);
  await page.locator('.back-link').click();
  await page.waitForURL('/');
  await page.waitForLoadState('domcontentloaded');

  await expect(page.locator('body > img[src="/badger-up.png"]')).toHaveCount(0);

  // Reduced-motion final states per Badger.astro's stylesheet.
  const upStyle = await page.locator('.badger-up').first().evaluate(el => {
    const cs = getComputedStyle(el);
    return { animationName: cs.animationName, opacity: cs.opacity };
  });
  expect(upStyle.animationName).toBe('none');
  expect(upStyle.opacity).toBe('1');
  const downAnim = await page.locator('.badger-down').first().evaluate(
    el => getComputedStyle(el).animationName
  );
  expect(downAnim).toBe('none');
});

// At 1366 (below the 1650px width gate): back link lands correctly, no overlay, no errors.
test('at 1366 (below breakpoint): back link returns correctly, no overlay, no errors', async ({ page }) => {
  const errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (err) => errors.push(err.message));

  await page.setViewportSize({ width: 1366, height: 768 });
  await navigateToSheet(page);
  await page.locator('.back-link').click();
  await page.waitForURL('/');
  await page.waitForLoadState('domcontentloaded');

  await expect(page.locator('body > img[src="/badger-up.png"]')).toHaveCount(0);

  const unexpected = errors.filter((e) => e !== 'Transition was skipped');
  expect(unexpected).toEqual([]);
});
