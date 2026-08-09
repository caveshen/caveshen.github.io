// return-journey.spec.js — /sheet → / return via cross-document view transition.
import { test, expect } from '@playwright/test';

// Navigate from / to /sheet via the dialogue system option.
async function navigateToSheet(page) {
  await page.goto('/');
  await page.locator('#approach-prompt').click();
  await page.locator('#choices button.system').click();
  await page.waitForURL('/sheet');
  // Cross-document VT can leave WebKit in a transient state where subsequent
  // interactions fail immediately after waitForURL resolves.
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('.back-link')).toBeVisible();
}

// Return end state: no overlay img, idle animation names and visibility restored.
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
// After each return the end state holds. This proves the duplicate-name defence:
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

// Regression guard: the overlay image must be decoded at pagereveal time so the
// ::view-transition-new snapshot is opaque from frame one.
//
// Root cause: without the preload the overlay img.src fetch starts INSIDE the
// pagereveal handler — after the parse-time window — so the image is still being
// decoded when the VT snapshot is taken, producing a transparent Badger flash.
// With the preload the fetch fires at HTML-parse time and the image is already in
// the decoded memory cache by the time pagereveal runs.
//
// Red proof (structural): remove the <link rel="preload"> from index.astro →
//   locator count drops to 0 → first assertion fails immediately.
// Red proof (timing, manual): add a page.route interceptor with a delay long
//   enough to surface the race (e.g. 100 ms on this stack, where DCL fires in
//   <100 ms) and rerun; decoded=false proves the window exists.
// The decode assertion self-gates on execution evidence: if pagereveal did not fire
//   (VT unsupported in this engine), window.__badgerOverlayDecoded is null and the
//   check is skipped. No project-name branch needed or used here.
test('overlay image is decoded at pagereveal time — image-decode flash guard', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });

  // Structural assertion: the preload link must be present in the page head.
  // This is the deterministic red/green — absent the link, count = 0 → fail.
  await page.goto('/');
  await expect(page.locator('link[rel="preload"][as="image"][href="/badger-up.png"]')).toHaveCount(1);

  // Execution-evidence assertion: the image must already be decoded at pagereveal time.
  // In un-throttled preview conditions the preload (T ≈ 5 ms) completes well before
  // DOMContentLoaded/pagereveal (T ≈ 50–80 ms on this stack). Without the preload
  // the overlay fetch starts at pagereveal and complete=false at that instant.
  await page.locator('#approach-prompt').click();
  await page.locator('#choices button.system').click();
  await page.waitForURL('/sheet');
  await page.waitForLoadState('domcontentloaded');

  await expect(page.locator('.back-link')).toBeVisible();
  await page.locator('.back-link').click();
  await page.waitForURL('/');
  await page.waitForLoadState('domcontentloaded');

  const decoded = await page.evaluate(() => window.__badgerOverlayDecoded ?? null);
  // null = pagereveal did not fire (VT unsupported in this engine) — not a failure.
  if (decoded === null) return;
  expect(decoded).toBe(true);
});

