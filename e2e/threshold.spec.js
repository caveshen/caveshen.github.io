// threshold.spec.js — the threshold cover: the title beat at a fresh
// load of /. Deliberately imports straight from '@playwright/test', not
// fixtures.js — every other spec's fixture pre-dismisses the cover so it can
// test the scene underneath; this file is the one place that needs the real,
// undismissed cover.
import { test, expect } from '@playwright/test';

// dismiss() hides the cover (not removed — Return to menu brings the same
// element back), so "gone" is asserted as computed display, the house
// pattern for state hidden by CSS rather than absence from the DOM.
function coverDisplay(page) {
  return page.locator('#threshold-cover').evaluate((el) => getComputedStyle(el).display);
}

test('fresh load: cover is present, duotone filter applied, photo served from srcset variants', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#threshold-cover')).toBeVisible();

  const img = page.locator('.cover-photo');
  await expect(img).toHaveAttribute('srcset', /night-640\.jpg/);
  await expect(img).toHaveAttribute('srcset', /night-2048\.jpg/);
  const filter = await img.evaluate((el) => getComputedStyle(el).filter);
  expect(filter).toContain('threshold-duotone');

  await expect(page.locator('h1.cover-name')).toHaveText('Caveshen Rajman');
  await expect(page.getByText('Problem solver, coffee enjoyer, 10x human')).toBeVisible();
});

test('New Game and Character Sheet are real controls: a <button> and a <a href="/sheet">', async ({ page }) => {
  await page.goto('/');
  expect(await page.locator('#cover-new-game').evaluate((el) => el.tagName)).toBe('BUTTON');
  await expect(page.locator('#cover-sheet')).toHaveAttribute('href', '/sheet');
});

test('menu tab order: New Game first, then Character Sheet', async ({ page, browserName }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('#cover-new-game')).toBeFocused();
  test.skip(browserName === 'webkit', 'WebKit does not Tab-focus <a> elements by default (platform behaviour, not a site bug)');
  await page.keyboard.press('Tab');
  await expect(page.locator('#cover-sheet')).toBeFocused();
});

test('Enter activates New Game', async ({ page }) => {
  await page.goto('/');
  await page.locator('#cover-new-game').focus();
  await page.keyboard.press('Enter');
  await expect.poll(() => coverDisplay(page)).toBe('none');
});

test('hotkey "1" dismisses the cover and sets the session flag', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('1');
  await expect.poll(() => coverDisplay(page)).toBe('none');
  expect(await page.evaluate(() => sessionStorage.getItem('thresholdDismissed'))).toBe('1');
});

test('hotkey "2" navigates to /sheet', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('2');
  await expect(page).toHaveURL('/sheet');
});

test('New Game (click) removes the cover, sets the flag, and frees the scene from inert', async ({ page }) => {
  await page.goto('/');
  await page.locator('#cover-new-game').click();
  await expect.poll(() => coverDisplay(page)).toBe('none');
  expect(await page.evaluate(() => sessionStorage.getItem('thresholdDismissed'))).toBe('1');
  await expect(page.locator('#scene-root')).not.toHaveAttribute('inert', '');
});

test('Character Sheet navigates to /sheet', async ({ page }) => {
  await page.goto('/');
  await page.locator('#cover-sheet').click();
  await expect(page).toHaveURL('/sheet');
});

// Frozen-state: a plain load with the flag pre-set, not a live wait on the dismissal.
test('a flagged load renders without the cover (computed display, not geometry)', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('thresholdDismissed', '1'));
  await page.goto('/');
  const display = await page.locator('#threshold-cover').evaluate((el) => getComputedStyle(el).display);
  expect(display).toBe('none');
});

test('sheet-return never replays the cover once New Game has been chosen', async ({ page }) => {
  await page.goto('/');
  await page.locator('#cover-new-game').click();
  await page.goto('/sheet');
  await page.locator('.back-link').click();
  await expect(page).toHaveURL('/');
  const display = await page.locator('#threshold-cover').evaluate((el) => getComputedStyle(el).display);
  expect(display).toBe('none');
});

test('sheet-return never replays the cover when Character Sheet was chosen first', async ({ page }) => {
  await page.goto('/');
  await page.locator('#cover-sheet').click();
  await expect(page).toHaveURL('/sheet');
  await page.locator('.back-link').click();
  await expect(page).toHaveURL('/');
  const display = await page.locator('#threshold-cover').evaluate((el) => getComputedStyle(el).display);
  expect(display).toBe('none');
});

test('reduced motion: the cover does not render, and the scene renders at resting fills directly (no intro state)', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/');
  const display = await page.locator('#threshold-cover').evaluate((el) => getComputedStyle(el).display);
  expect(display).toBe('none');
  await expect(page.locator('#scene-root')).not.toHaveAttribute('inert', '');
  await expect(page.locator('#scene-root')).not.toHaveClass(/pre-armed/);
  const fillOpacity = await page.locator('.scene-standard .f-sky')
    .evaluate((el) => getComputedStyle(el).fillOpacity);
  expect(fillOpacity).toBe('1');
  await ctx.close();
});

// ── The un-develop ───────────────────────────────────────────────────────────
// Frozen-state sampling throughout: no test here waits on a live clock.
// The pre-armed check reads a static style (no transition has run yet); the
// stagger check reads the declared transition-delay (a fact, not a moving
// animation frame); the "after" check polls a real end condition (Playwright's
// own auto-retry), not a guessed sleep.

test('scene under the cover is pre-armed as line-art before New Game: fills zero, gold strokes on', async ({ page }) => {
  await page.goto('/');
  const sky = page.locator('.scene-standard > .f-sky');
  await expect(sky).toHaveCSS('fill-opacity', '0');
  // --gold read live off the page, not a second hardcoded hex — stroke's
  // computed rgb must contain the same three channel values.
  const [strokeRgb, goldHex] = await Promise.all([
    sky.evaluate((el) => getComputedStyle(el).stroke),
    page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--gold').trim()),
  ]);
  const goldChannels = [1, 3, 5].map((i) => parseInt(goldHex.slice(i, i + 2), 16));
  expect(strokeRgb).toContain(goldChannels.join(', '));

  // A foreground and a world shape too, not just the sky.
  const ground = page.locator('.scene-standard .fg-layer .f-ground');
  await expect(ground).toHaveCSS('fill-opacity', '0');
  const nearBuilding = page.locator('.scene-standard .bg-layer .f-near').first();
  await expect(nearBuilding).toHaveCSS('fill-opacity', '0');

  // The rail-shadow blobs are dark fills too — they must go with the rest,
  // not sit on top of the wireframe.
  const railShadow = page.locator('.scene-standard .fg-layer .f-rail-shadow');
  await expect(railShadow).toHaveCSS('fill-opacity', '0');
});

test('New Game plays the un-develop: title gone, photo drained, fills bloomed, Badger present', async ({ page }) => {
  await page.goto('/');
  await page.locator('#cover-new-game').click();

  // Provably finished: polls for the real end condition, not a fixed wait.
  // The full sequence (bloom-start + badger stagger + bloom duration) runs
  // past Playwright's 5s default poll, so these get a wider one explicitly.
  await expect.poll(() => coverDisplay(page), { timeout: 8000 }).toBe('none');
  const sky = page.locator('.scene-standard > .f-sky');
  await expect(sky).toHaveCSS('fill-opacity', '1', { timeout: 8000 });
  const ground = page.locator('.scene-standard .fg-layer .f-ground');
  await expect(ground).toHaveCSS('fill-opacity', '1', { timeout: 8000 });
  const badger = page.locator('.scene-standard .js-character');
  await expect(badger).toHaveCSS('opacity', '1', { timeout: 8000 });
});

test('depth stagger: sky, world, foreground and Badger bloom-delays increase in that order', async ({ page }) => {
  await page.goto('/');
  await page.locator('#cover-new-game').click();
  // Frozen: reads the declared transition-delay, not a live animation frame.
  const delay = (sel) => page.locator(sel).first()
    .evaluate((el) => parseFloat(getComputedStyle(el).transitionDelay));
  const sky = await delay('.scene-standard > .f-sky');
  const world = await delay('.scene-standard .bg-layer .f-far');
  const foreground = await delay('.scene-standard .fg-layer .f-ground');
  const badger = await delay('.scene-standard .js-character');
  expect(sky).toBeLessThan(world);
  expect(world).toBeLessThan(foreground);
  expect(foreground).toBeLessThan(badger);
});

test('no-JS: the cover is hidden and today\'s page (with its own noscript link) stands untouched', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('#threshold-cover')).toBeHidden();
  // Scoped to Stage's own noscript link — the cover ships a second, now-hidden
  // a[href="/sheet"] of its own (#cover-sheet), which would make a bare
  // a[href="/sheet"] locator ambiguous.
  await expect(page.locator('.noscript-note a[href="/sheet"]')).toBeVisible();
  await expect(page.locator('#return-to-menu')).toBeHidden();
  await ctx.close();
});

// ── Return to menu ──────────────────────────────────────────────────────────
// Ships hidden and only appears once JS has decided the cover isn't showing
// (fresh dismissal or a flagged load); clicking it clears the flag, restores
// the cover, and re-arms the scene for a full replay of the un-develop.

test('Return to menu appears once New Game has dismissed the cover', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#return-to-menu')).toBeHidden();
  await page.locator('#cover-new-game').click();
  await expect(page.locator('#return-to-menu')).toBeVisible();
});

test('Return to menu appears on a flagged load', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('thresholdDismissed', '1'));
  await page.goto('/');
  await expect(page.locator('#return-to-menu')).toBeVisible();
});

// Authored ahead of #scene-root (near the cover it belongs to), but the
// script moves it to the end of <body> so it tabs after the toggle and scene
// rather than queueing ahead of them whenever the cover is suppressed.
test('Return to menu is moved to the end of <body>, so it tabs last', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('thresholdDismissed', '1'));
  await page.goto('/');
  const lastId = await page.evaluate(() => document.body.lastElementChild?.id);
  expect(lastId).toBe('return-to-menu');
});

test('Return to menu restores the cover and clears the session flag', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('thresholdDismissed', '1'));
  await page.goto('/');
  await page.locator('#return-to-menu').click();

  await expect.poll(() => coverDisplay(page)).not.toBe('none');
  expect(await page.evaluate(() => sessionStorage.getItem('thresholdDismissed'))).toBeNull();
  await expect(page.locator('#return-to-menu')).toBeHidden();
});

test('after Return to menu, New Game replays the full pre-arm', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('thresholdDismissed', '1'));
  await page.goto('/');
  await page.locator('#return-to-menu').click();

  // Frozen-state, same check the original pre-arm test makes: fills at
  // zero, ready for New Game to bloom them in again.
  const sky = page.locator('.scene-standard > .f-sky');
  await expect(sky).toHaveCSS('fill-opacity', '0');
});

test('reduced motion: Return to menu restores the cover instantly, and a further New Game skips the staged bloom', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('#return-to-menu')).toBeVisible();

  await page.locator('#return-to-menu').click();
  await expect.poll(() => coverDisplay(page)).not.toBe('none');

  await page.locator('#cover-new-game').click();
  await expect.poll(() => coverDisplay(page)).toBe('none');
  const fillOpacity = await page.locator('.scene-standard .f-sky')
    .evaluate((el) => getComputedStyle(el).fillOpacity);
  expect(fillOpacity).toBe('1');
  await ctx.close();
});

// ── The menu's other two entries, and the hand-off to the area title ────────

test('Download CV and LinkedIn are real links, with hotkeys 3 and 4 on the menu', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#cover-cv')).toHaveAttribute('href', '/cv.pdf');
  await expect(page.locator('#cover-linkedin')).toHaveAttribute('href', 'https://www.linkedin.com/in/caveshen');
  await expect(page.locator('.cover-menu kbd')).toHaveText(['1', '2', '3', '4']);
});

test('New Game hands over to the area title, delayed behind the bloom', async ({ page }) => {
  await page.goto('/');
  await page.locator('#cover-new-game').click();
  const title = page.locator('#area-title');
  await expect(title).toHaveClass(/play/);
  await expect(title).toHaveClass(/from-cover/);
  // Frozen: the declared delay, not a live frame.
  const delay = await title.evaluate((el) => parseFloat(getComputedStyle(el).animationDelay));
  expect(delay).toBeGreaterThan(0);
});
