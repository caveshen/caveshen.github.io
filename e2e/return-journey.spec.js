// return-journey.spec.js — /sheet → / return via cross-document view transition.
import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

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

// T1-criterion-1 end state: no overlay img, idle animation names and visibility restored.
// Auto-retrying assertions — holds in all engines whether or not the morph ran.
async function assertReturnEndState(page) {
  await expect(page.locator('body > img[src="/badger-up.png"]')).toHaveCount(0);
  await expect.poll(() =>
    page.locator('.badger-up').first().evaluate(el => getComputedStyle(el).animationName)
  ).toBe('badger-up');
  await expect.poll(() =>
    page.locator('.badger-up').first().evaluate(el => getComputedStyle(el).visibility)
  ).toBe('visible');
  await expect.poll(() =>
    page.locator('.badger-down').first().evaluate(el => getComputedStyle(el).animationName)
  ).toBe('badger-down');
}

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

  await assertReturnEndState(page);

  // / never sets arrived-by-morph.
  const hasMarker = await page.locator('html').evaluate(el => el.classList.contains('arrived-by-morph'));
  expect(hasMarker).toBe(false);

  // No console errors (filter the known-benign Chromium line).
  const unexpected = errors.filter((e) => e !== 'Transition was skipped');
  expect(unexpected).toEqual([]);
});

// Double round trip: / → /sheet → back link → / → /sheet → back link → /.
// After each return the T1 end state holds. This proves the duplicate-name defence:
// the second forward hand-off runs on a page the first return already touched,
// and the second return runs against whatever the forward hand-off left behind.
test('double round trip: back link end state holds after each of two returns', async ({ page }) => {
  const errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (err) => errors.push(err.message));

  await page.setViewportSize({ width: 1920, height: 1080 });

  // First round trip.
  await navigateToSheet(page);
  await page.locator('.back-link').click();
  await page.waitForURL('/');
  await page.waitForLoadState('domcontentloaded');
  await assertReturnEndState(page);

  // Second round trip — runs on the page the first return already cleaned up.
  await navigateToSheet(page);
  await page.locator('.back-link').click();
  await page.waitForURL('/');
  await page.waitForLoadState('domcontentloaded');
  await assertReturnEndState(page);

  const unexpected = errors.filter((e) => e !== 'Transition was skipped');
  expect(unexpected).toEqual([]);
});

// page.goBack() from /sheet returns to / with idle running, no overlay.
// The d32 goBack coverage in portrait-handoff.spec.js stays green beside this case.
test('page.goBack() from /sheet: / ends clean, no overlay, idle running', async ({ page }) => {
  const errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (err) => errors.push(err.message));

  await page.setViewportSize({ width: 1920, height: 1080 });
  await navigateToSheet(page);
  await page.goBack();
  await page.waitForURL('/');
  await page.waitForLoadState('domcontentloaded');
  await assertReturnEndState(page);

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

// Acceptance screenshots for Caveshen's eye: return arrival at 1920, night and day.
// desktop-1920 only — this is the sole Chromium project at exactly 1920px, where the morph fires.
// All other Chromium projects (pixel-8, desktop-1366, desktop-2560) and all non-Chromium engines are skipped.
// Written to the gitignored screenshots/ folder.
test('acceptance screenshots: return arrival at 1920 in night and day themes', async ({ page }) => {
  // ponytail: pin to desktop-1920 so only one project writes these files; pixel-8 and desktop-1366 are below the 1650px morph gate.
  test.skip(test.info().project.name !== 'desktop-1920', 'Acceptance screenshots captured on desktop-1920 only (1920px, morph fires)');

  mkdirSync('screenshots', { recursive: true });
  await page.setViewportSize({ width: 1920, height: 1080 });

  // Night (default — no time key in localStorage).
  await navigateToSheet(page);
  await page.locator('.back-link').click();
  await page.waitForURL('/');
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('body > img[src="/badger-up.png"]')).toHaveCount(0);
  await page.screenshot({ path: 'screenshots/return-arrival-night.png' });

  // Day: set theme in localStorage — persists across the cross-document navigation.
  await page.evaluate(() => localStorage.setItem('time', 'day'));
  await navigateToSheet(page);
  await page.locator('.back-link').click();
  await page.waitForURL('/');
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('body > img[src="/badger-up.png"]')).toHaveCount(0);
  await page.screenshot({ path: 'screenshots/return-arrival-day.png' });
});
