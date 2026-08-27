// scene-material.spec.js — the scene's persistent material (d43): film grain and
// sea shimmer. Both live outside the day/night crossfade — this file only covers
// the two SVG filter effects and their reduced-motion behaviour, not scene geometry
// (scene.spec.js) or theme switching (theme.test.js).
import { test, expect } from '@playwright/test';
import { sceneRects } from './geom.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

async function grainState(page) {
  return page.evaluate(() => {
    const overlay = document.querySelector('.grain-overlay');
    const speckle = document.querySelector('.grain-speckle');
    const cs = getComputedStyle(overlay);
    const rect = overlay.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      opacity: parseFloat(cs.opacity),
      blend: cs.mixBlendMode,
      filter: getComputedStyle(speckle).filter,
    };
  });
}

async function seaWaveFilter(page) {
  return page.evaluate(() => {
    const scene = [...document.querySelectorAll('.scene')].find((e) => e.getBoundingClientRect().width > 0);
    const sea = scene.querySelector('.f-sea');
    const wave = scene.querySelector('.f-wave');
    const ground = scene.querySelector('.f-ground');
    return {
      sea: getComputedStyle(sea).filter,
      wave: getComputedStyle(wave).filter,
      ground: getComputedStyle(ground).filter,
    };
  });
}

test('grain overlay covers the full frame in both themes, at low plain opacity, never a blend mode', async ({ page }) => {
  const viewport = page.viewportSize();
  const night = await grainState(page);
  expect(night.width).toBeGreaterThanOrEqual(viewport.width - 1);
  expect(night.height).toBeGreaterThanOrEqual(viewport.height - 1);
  expect(night.opacity).toBeGreaterThan(0.05);
  expect(night.opacity).toBeLessThan(0.2);
  expect(night.blend).toBe('normal');
  expect(night.filter).toContain('film-grain');

  await page.locator('#toggle').click();
  const day = await grainState(page);
  expect(day.width).toBeGreaterThanOrEqual(viewport.width - 1);
  expect(day.height).toBeGreaterThanOrEqual(viewport.height - 1);
  expect(day.opacity).toBeGreaterThan(0.05);
  expect(day.opacity).toBeLessThan(0.2);
  expect(day.blend).toBe('normal');
});

test('grain speckle is contrast-pushed and steps its seed on a discrete schedule', async ({ page }) => {
  const grain = page.locator('#film-grain');
  await expect(grain.locator('feTurbulence')).toHaveCount(1);
  const seedAnim = grain.locator('feTurbulence > animate[attributeName="seed"]');
  await expect(seedAnim).toHaveAttribute('calcMode', 'discrete');
  // Contrast push: feComponentTransfer steepens the curve (slope > 1) rather than
  // passing the turbulence through untouched.
  const slope = await grain.locator('feFuncR').getAttribute('slope');
  expect(parseFloat(slope)).toBeGreaterThan(1);
});

test('sea shimmer applies to the sea and wave fills only', async ({ page }) => {
  const filters = await seaWaveFilter(page);
  expect(filters.sea).toContain('sea-shimmer');
  expect(filters.wave).toContain('sea-shimmer');
  expect(filters.ground).not.toContain('sea-shimmer');
});

test('shimmer displacement is structurally horizontal-only — the vertical channel is flattened to a constant', async ({ page }) => {
  const shimmer = page.locator('#sea-shimmer');
  const map = shimmer.locator('feDisplacementMap');
  await expect(map).toHaveAttribute('xChannelSelector', 'R');
  await expect(map).toHaveAttribute('yChannelSelector', 'G');
  // The G row of the colour matrix (5 numbers starting at index 5) must be a flat
  // constant (0 0 0 0 0.5) — no term reads the noise, so G can never vary.
  const values = await shimmer.locator('feColorMatrix').getAttribute('values');
  const nums = values.trim().split(/\s+/).map(Number);
  const gRow = nums.slice(5, 10);
  expect(gRow).toEqual([0, 0, 0, 0, 0.5]);

  const scaleAnim = map.locator('animate[attributeName="scale"]');
  await expect(scaleAnim).toHaveAttribute('values', '5;12;5');
  await expect(scaleAnim).toHaveAttribute('dur', '7s');
});

test('shimmer never tears the horizon seam — the sea still meets the landform exactly', async ({ page }) => {
  // Same seam contract scene.spec.js proves for the un-shimmered case — reasserted
  // here with the shimmer filter live, since a vertical leak in the displacement
  // would show up as this seam breaking apart.
  const [sea] = await sceneRects(page, '.f-sea');
  const [ground] = await sceneRects(page, '.f-ground');
  expect(ground.y).toBeLessThanOrEqual(sea.y + sea.height + 1);
  expect(ground.y).toBeGreaterThanOrEqual(sea.y + sea.height - 13);
});

test('reduced motion: grain stops animating (static filter, no seed animate) and shimmer motion stops entirely', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();

  const grain = await grainState(page);
  expect(grain.filter).toContain('film-grain-static');
  await expect(page.locator('#film-grain-static feTurbulence > animate')).toHaveCount(0);

  const filters = await seaWaveFilter(page);
  expect(filters.sea).toBe('none');
  expect(filters.wave).toBe('none');
});
