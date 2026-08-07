// d24 — Badger portrait + menu-open choreography on /sheet.
import { test, expect } from '@playwright/test';
import { rectsIntersect } from './geom.js';

// Reads {delay, duration} in ms from an element's computed animation style.
async function timing(locator) {
  return locator.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      delay: parseFloat(cs.animationDelay) * 1000,
      duration: parseFloat(cs.animationDuration) * 1000,
      name: cs.animationName,
    };
  });
}

// Waits for the element's own CSS animations to reach their final state —
// otherwise a boundingBox() read racing the menu-open choreography can catch
// mid-animation (or the fill-mode-both pre-start) transform instead of the
// settled position. Not a sleep: resolves on the real Web Animations API
// completion signal.
async function settled(locator) {
  await locator.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
}

test('portrait is visible, overlaps neither the nameplate nor the sheet grid, is vertically centred on the grid, and gap-matches the grid gap at 1920', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/sheet');
  const portrait = page.locator('.sheet-portrait');
  await expect(portrait).toBeVisible();
  await settled(portrait);
  const portraitBox = await portrait.boundingBox();
  const nameplateBox = await page.locator('.nameplate').boundingBox();
  const grid = page.locator('.sheet-grid');
  const gridBox = await grid.boundingBox();
  const gridGap = await grid.evaluate((el) => parseFloat(getComputedStyle(el).columnGap));

  expect(rectsIntersect(portraitBox, nameplateBox)).toBe(false);
  expect(rectsIntersect(portraitBox, gridBox)).toBe(false);

  // Read from the DOM, not hardcoded pixel twins of the CSS — this still
  // means something if --portrait or .sheet-grid's own gap ever move.
  const portraitCenterY = portraitBox.y + portraitBox.height / 2;
  const gridCenterY = gridBox.y + gridBox.height / 2;
  expect(Math.abs(portraitCenterY - gridCenterY)).toBeLessThan(2);

  const gap = gridBox.x - (portraitBox.x + portraitBox.width);
  expect(Math.abs(gap - gridGap)).toBeLessThan(2);
});

test('portrait is hidden below the 1650px breakpoint, shown at and above it', async ({ page }) => {
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

test('menu-open choreography: every target fits the 500ms budget and delays are ordered', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/sheet');

  const nameplate = await timing(page.locator('.nameplate-inner'));
  const abilities = await timing(page.locator('.abilities-col'));
  const middle = await timing(page.locator('.middle-col'));
  const right = await timing(page.locator('.right-col'));
  const portrait = await timing(page.locator('.sheet-portrait'));
  const xpFill = await timing(page.locator('.xp-fill'));

  for (const beat of [nameplate, abilities, middle, right, portrait, xpFill]) {
    expect(beat.delay + beat.duration).toBeLessThanOrEqual(500);
  }
  expect(nameplate.delay).toBeLessThanOrEqual(abilities.delay);
  expect(abilities.delay).toBeLessThanOrEqual(middle.delay);
  expect(middle.delay).toBeLessThanOrEqual(right.delay);
  expect(right.delay).toBeLessThanOrEqual(portrait.delay);
  expect(portrait.delay).toBeLessThanOrEqual(xpFill.delay);
});

test('XP bar settles at 78% of its track', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/sheet');
  await expect.poll(async () => {
    const track = await page.locator('.xp-track').boundingBox();
    const fill = await page.locator('.xp-fill').boundingBox();
    return fill.width / track.width;
  }, { timeout: 3000 }).toBeGreaterThan(0.77);
  const track = await page.locator('.xp-track').boundingBox();
  const fill = await page.locator('.xp-fill').boundingBox();
  expect(fill.width / track.width).toBeLessThan(0.79);
});

test('prefers-reduced-motion: panels land in final state immediately, no motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/sheet');

  for (const sel of ['.nameplate-inner', '.abilities-col', '.middle-col', '.right-col']) {
    const el = page.locator(sel);
    const style = await el.evaluate((e) => {
      const cs = getComputedStyle(e);
      return { name: cs.animationName, opacity: cs.opacity, transform: cs.transform };
    });
    expect(style.name).toBe('none');
    expect(style.opacity).toBe('1');
    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(style.transform);
  }

  const track = await page.locator('.xp-track').boundingBox();
  const fill = await page.locator('.xp-fill').boundingBox();
  const ratio = fill.width / track.width;
  expect(ratio).toBeGreaterThan(0.77);
  expect(ratio).toBeLessThan(0.79);
});

test('prefers-reduced-motion: portrait has no animation but keeps its vertical-centring transform (not "none")', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/sheet');

  const portrait = page.locator('.sheet-portrait');
  const style = await portrait.evaluate((e) => {
    const cs = getComputedStyle(e);
    return { name: cs.animationName, transform: cs.transform };
  });
  expect(style.name).toBe('none');
  // translateY(-50%) is load-bearing (the vertical centring), not decorative
  // motion — reduced-motion must not zero it out, so it must NOT be 'none'.
  expect(style.transform).not.toBe('none');

  // Confirm it's still actually centred on .sheet-grid under reduced motion.
  const portraitBox = await portrait.boundingBox();
  const gridBox = await page.locator('.sheet-grid').boundingBox();
  const portraitCenterY = portraitBox.y + portraitBox.height / 2;
  const gridCenterY = gridBox.y + gridBox.height / 2;
  expect(Math.abs(portraitCenterY - gridCenterY)).toBeLessThan(2);
});
