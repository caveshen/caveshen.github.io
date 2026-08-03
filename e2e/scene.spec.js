// scene.spec.js — the scene's own composition: ground, skyline, and paint order at the
// seams. Figure/character integrity lives with their subject (not-found.spec.js,
// badger.spec.js) — this file is only about the backdrop the characters stand in.
import { test, expect } from '@playwright/test';
import { sceneRects, paintsOver, rectsIntersect } from './geom.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('ground reaches the frame bottom edge, full width', async ({ page }) => {
  const viewport = page.viewportSize();
  const [ground] = await sceneRects(page, '.f-ground');
  expect(ground.x).toBeLessThanOrEqual(0);
  expect(ground.x + ground.width).toBeGreaterThanOrEqual(viewport.width);
  expect(ground.y + ground.height).toBeGreaterThanOrEqual(viewport.height - 1);
});

// Landform/city shapes. .f-fringe and .f-near are groups wrapping many rects (sheds,
// cranes, containers, buildings) with real gaps between them by design — a city
// skyline isn't a solid wall — so they're read as one aggregate footprint per group,
// which is exact for the min-top/max-bottom checks below.
const LANDFORM_SELECTORS = ['.f-far', '.f-fringe', '.f-near', '.f-mtn-lit', '.f-mtn-shade'];

async function landformRects(page) {
  const groups = await Promise.all(LANDFORM_SELECTORS.map((sel) => sceneRects(page, sel)));
  return groups.flat();
}

// The chain check is scoped to the mountain massif only (.f-far/.f-mtn-lit/.f-mtn-shade
// are always individual polygons, never a wrapping group) — the continuous silhouette
// the Kloof Nek defect broke. Widening it to .f-near/.f-fringe either goes vacuous (their
// aggregate footprint already spans past any mountain-sized gap) or flags the buildings'
// and sheds' own intentional street-level gaps as defects.
const MOUNTAIN_SELECTORS = ['.f-far', '.f-mtn-lit', '.f-mtn-shade'];

async function mountainRects(page) {
  const groups = await Promise.all(MOUNTAIN_SELECTORS.map((sel) => sceneRects(page, sel)));
  return groups.flat();
}

test('skyline has no gap in the mountain chain', async ({ page }) => {
  const rects = (await mountainRects(page)).sort((a, b) => a.x - b.x);
  let runningRight = rects[0].x + rects[0].width;
  for (const r of rects.slice(1)) {
    expect(r.x).toBeLessThanOrEqual(runningRight);
    runningRight = Math.max(runningRight, r.x + r.width);
  }
});

test('skyline meets the water exactly — not floating, not drowned', async ({ page }) => {
  const rects = await landformRects(page);
  const [sea] = await sceneRects(page, '.f-sea');
  const maxBottom = Math.max(...rects.map((r) => r.y + r.height));
  expect(Math.abs(maxBottom - sea.y)).toBeLessThanOrEqual(1);
  for (const r of rects) expect(r.y + r.height).toBeLessThanOrEqual(sea.y + 1);
});

test('skyline summit is not cropped off the top of the frame', async ({ page }) => {
  const rects = await landformRects(page);
  const minTop = Math.min(...rects.map((r) => r.y));
  expect(minTop).toBeGreaterThanOrEqual(0);
});

test('layer order at the seams: sea over landform, ground over sea, character over rail', async ({ page }) => {
  const [sea] = await sceneRects(page, '.f-sea');
  const [ground] = await sceneRects(page, '.f-ground');
  const [rail] = await sceneRects(page, '.f-rail');
  const [character] = await sceneRects(page, '.js-character');
  const rects = await landformRects(page);
  const landformBottom = Math.max(...rects.map((r) => r.y + r.height));

  // The seams are authored to meet exactly (see the "meets the water" test above), so a
  // strict rect-intersection would flicker on sub-pixel rounding — 1px touch counts.
  expect(landformBottom).toBeGreaterThanOrEqual(sea.y - 1);
  expect(await paintsOver(page, '.f-sea', '.f-far')).toBe(true);

  expect(ground.y).toBeLessThanOrEqual(sea.y + sea.height + 1);
  expect(await paintsOver(page, '.f-ground', '.f-sea')).toBe(true);

  expect(rectsIntersect(character, rail)).toBe(true);
  expect(await paintsOver(page, '.js-character', '.f-rail')).toBe(true);
});
