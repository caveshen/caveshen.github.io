// scene-material.spec.js — the scene's persistent material: film grain (a
// pre-rendered tile) and sea shimmer (an SVG filter). Both live outside the
// day/night crossfade — this file only covers those two effects and their
// reduced-motion behaviour, not scene geometry (scene.spec.js) or theme
// switching (theme.test.js).
import { test, expect } from './fixtures.js';
import { visibleSceneHandle } from './geom.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

async function grainState(page) {
  return page.evaluate(() => {
    const overlay = document.querySelector('.grain-overlay');
    const cs = getComputedStyle(overlay);
    const rect = overlay.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      opacity: parseFloat(cs.opacity),
      blend: cs.mixBlendMode,
      backgroundImage: cs.backgroundImage,
    };
  });
}

async function seaWaveFilter(page) {
  const scene = await visibleSceneHandle(page);
  return page.evaluate((scene) => {
    const sea = scene.querySelector('.f-sea');
    const wave = scene.querySelector('.f-wave');
    const ground = scene.querySelector('.f-ground');
    return {
      sea: getComputedStyle(sea).filter,
      wave: getComputedStyle(wave).filter,
      ground: getComputedStyle(ground).filter,
    };
  }, scene);
}

test('grain overlay covers the full frame in both themes, at low plain opacity, never a blend mode', async ({ page }) => {
  const viewport = page.viewportSize();
  const night = await grainState(page);
  expect(night.width).toBeGreaterThanOrEqual(viewport.width - 1);
  expect(night.height).toBeGreaterThanOrEqual(viewport.height - 1);
  expect(night.opacity).toBeGreaterThan(0.05);
  expect(night.opacity).toBeLessThan(0.2);
  expect(night.blend).toBe('normal');
  expect(night.backgroundImage).toContain('grain-');

  await page.locator('#toggle').click();
  const day = await grainState(page);
  expect(day.width).toBeGreaterThanOrEqual(viewport.width - 1);
  expect(day.height).toBeGreaterThanOrEqual(viewport.height - 1);
  expect(day.opacity).toBeGreaterThan(0.05);
  expect(day.opacity).toBeLessThan(0.2);
  expect(day.blend).toBe('normal');
});

test('grain overlay steps its background tile on a discrete schedule', async ({ page }) => {
  const overlay = page.locator('.grain-overlay');
  const before = await overlay.evaluate((el) => getComputedStyle(el).backgroundImage);
  // Driven by stage.js on a 1.4s timer cycling pre-rendered tiles
  // (tools/build-grain-tiles.mjs) — the background-image is the only
  // observable proof of the schedule.
  await expect(async () => {
    const after = await overlay.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(after).not.toBe(before);
    expect(after).toContain('grain-');
  }).toPass({ timeout: 3000 });
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
});

test('shimmer scale steps a 5-to-12-to-5 ramp on a discrete schedule, not a SMIL animate', async ({ page }) => {
  const map = page.locator('#sea-shimmer-scale');
  await expect(map.locator('animate')).toHaveCount(0);
  const before = await map.getAttribute('scale');
  // Driven by stage.js on a timer (not SMIL — see Stage.astro's comment),
  // so the attribute itself is the only observable proof of the schedule.
  await expect(async () => {
    const after = await map.getAttribute('scale');
    expect(after).not.toBe(before);
    expect(parseFloat(after)).toBeGreaterThanOrEqual(5);
    expect(parseFloat(after)).toBeLessThanOrEqual(12);
  }).toPass({ timeout: 1000 });
});

test('reduced motion: grain stops animating (one pinned tile) and shimmer motion stops entirely', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();

  // stage.js's tile-cycling timer is guarded off under reduced motion — the
  // CSS default tile (grain-0) stays pinned, not just unused.
  const overlay = page.locator('.grain-overlay');
  const tileAtStart = await overlay.evaluate((el) => getComputedStyle(el).backgroundImage);
  await page.waitForTimeout(1600);
  expect(await overlay.evaluate((el) => getComputedStyle(el).backgroundImage)).toBe(tileAtStart);

  const filters = await seaWaveFilter(page);
  expect(filters.sea).toBe('none');
  expect(filters.wave).toBe('none');

  // stage.js's shimmer-scale timer is guarded off under reduced motion too —
  // not just unused, since CSS never references #sea-shimmer here either.
  const map = page.locator('#sea-shimmer-scale');
  const scaleAtStart = await map.getAttribute('scale');
  await page.waitForTimeout(300);
  expect(await map.getAttribute('scale')).toBe(scaleAtStart);
});
