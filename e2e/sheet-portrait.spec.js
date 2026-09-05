// d24 — Badger portrait + menu-open choreography on /sheet.
import { test, expect } from '@playwright/test';
import { assertPortraitGeometry, assertPortraitNoAnim } from './geom.js';

// Waits for the element's own CSS animations to reach their final state —
// otherwise a boundingBox() read racing the menu-open choreography can catch
// mid-animation (or the fill-mode-both pre-start) transform instead of the
// settled position. Not a sleep: resolves on the real Web Animations API
// completion signal.
async function settled(locator) {
  await locator.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
}

for (const width of [1920, 2560]) {
  test(`portrait is visible, clear of the record, vertically centred on it, one rem to its left at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1080 });
    await page.goto('/sheet');
    const portrait = page.locator('.sheet-portrait');
    await expect(portrait).toBeVisible();
    await settled(portrait);
    await assertPortraitGeometry(page, portrait);
  });
}

test('hidden at 1366, below the breakpoint', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/sheet');
  await expect(page.locator('.sheet-portrait')).toBeHidden();
});

test('breakpoint boundary: hidden at 1649px, visible at 1650px', async ({ page }) => {
  await page.setViewportSize({ width: 1649, height: 900 });
  await page.goto('/sheet');
  await expect(page.locator('.sheet-portrait')).toBeHidden();

  await page.setViewportSize({ width: 1650, height: 900 });
  await expect(page.locator('.sheet-portrait')).toBeVisible();
});

test('badger-down never appears in the /sheet source', async ({ page }) => {
  await page.goto('/sheet');
  const html = await page.content();
  expect(html).not.toContain('badger-down');
});

// The fill's declared --xp is Caveshen's number; the bar must settle on it.
async function xpTarget(page) {
  return page.locator('.xp-fill').evaluate((el) => parseFloat(getComputedStyle(el).getPropertyValue('--xp')) / 100);
}
async function xpRatio(page) {
  const track = await page.locator('.xp-track').boundingBox();
  const fill = await page.locator('.xp-fill').boundingBox();
  return fill.width / track.width;
}

test('XP bar settles at its declared --xp', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/sheet');
  const target = await xpTarget(page);
  expect(target).toBeGreaterThan(0);
  await expect.poll(() => xpRatio(page), { timeout: 3000 }).toBeCloseTo(target, 2);
});

test('prefers-reduced-motion: panels land in final state immediately, no motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/sheet');

  for (const sel of ['.character', '.abilities', '.quests', '.codex']) {
    const el = page.locator(sel);
    const style = await el.evaluate((e) => {
      const cs = getComputedStyle(e);
      return { name: cs.animationName, opacity: cs.opacity, transform: cs.transform };
    });
    expect(style.name).toBe('none');
    expect(style.opacity).toBe('1');
    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(style.transform);
  }

  expect(await xpRatio(page)).toBeCloseTo(await xpTarget(page), 2);
});

test('prefers-reduced-motion: portrait has no animation but keeps its vertical-centring transform (not "none")', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1920, height: 1080 });

  // Clock pin — see the assertPortraitNoAnim precondition in geom.js.
  await page.clock.install({ time: 0 });

  await page.goto('/sheet');

  // 100ms of virtual time stays inside the animation's 200ms delay, so a
  // wrongly running slide-in still holds its from-keyframe offset here.
  await page.clock.runFor(100);

  const portrait = page.locator('.sheet-portrait');
  await assertPortraitNoAnim(portrait);

  // Confirm it's still actually centred on the record under reduced motion.
  const portraitBox = await portrait.boundingBox();
  const recordBox = await page.locator('.record').boundingBox();
  const portraitCenterY = portraitBox.y + portraitBox.height / 2;
  const recordCenterY = recordBox.y + recordBox.height / 2;
  expect(Math.abs(portraitCenterY - recordCenterY)).toBeLessThan(2);
});
