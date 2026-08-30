// scene.spec.js — the scene's own composition: ground, skyline, and paint order at the
// seams. Figure/character integrity lives with their subject (not-found.spec.js,
// badger.spec.js) — this file is only about the backdrop the characters stand in.
import { test, expect } from './fixtures.js';
import { sceneRects, paintsOver, rectsIntersect, rectContains } from './geom.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

// WebKit reports non-zero getBoundingClientRect for SVG inside display:none
// groups, so "hidden by theme" is asserted on computed display, not geometry.
// Some targets carry the night-only/day-only class themselves, others inherit
// the gate from an ancestor group — closest() covers both.
async function sceneDisplay(page, selector) {
  return page.evaluate((sel) => {
    const scene = [...document.querySelectorAll('.scene')].find((e) => e.getBoundingClientRect().width > 0);
    const el = scene.querySelector(sel);
    if (!el) return null;
    const gate = el.closest('.night-only, .day-only');
    return getComputedStyle(gate ?? el).display;
  }, selector);
}

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
const LANDFORM_SELECTORS = ['.f-far', '.f-mid', '.f-fringe', '.f-near', '.f-mtn-lit', '.f-mtn-shade'];

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

// d28 overscans every baseline-touching vertex 6 SVG units below the waterline
// (SEAM_MARGIN, CityScape.astro) so idle drift never opens a gap at the seam —
// land legitimately sits below sea.y now, never above it. Floating (above) stays
// pinned to the old ±1px; drowned (below) widens to the worst-case screen-space
// overscan: 6 units × 2560/1200 (desktop-2560's viewBox scale, the largest of
// the 8 projects) = 12.8px, rounded up.
const SEAM_OVERSCAN_PX = 13;

test('skyline meets the water exactly — not floating, not drowned beyond the seam overscan', async ({ page }) => {
  const rects = await landformRects(page);
  const [sea] = await sceneRects(page, '.f-sea');
  const maxBottom = Math.max(...rects.map((r) => r.y + r.height));
  expect(maxBottom - sea.y).toBeGreaterThanOrEqual(-1);
  expect(maxBottom - sea.y).toBeLessThanOrEqual(SEAM_OVERSCAN_PX);
  for (const r of rects) expect(r.y + r.height).toBeLessThanOrEqual(sea.y + SEAM_OVERSCAN_PX);
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

// N1: the halo (radial glow) must stay centred on its own disc, in both themes — a wide
// but off-centre halo would look like a lighting bug that plain containment wouldn't catch.
//
// Both disc selectors are element-scoped (circle, not the bare class): `.f-cel` is also the
// class of the night-only lit-windows group (CityScape.astro:103), and `.f-moon` is also the
// class of the night-only moon group (Scene.astro:168) — the same collisions tokens.css
// already documents and guards against with its own `circle.f-cel` selector.
async function haloCentred(page, discSel, glowSel) {
  const centre = (r) => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 });
  const [disc] = await sceneRects(page, discSel);
  const [glow] = await sceneRects(page, glowSel);
  expect(rectContains(glow, disc)).toBe(true);
  const discC = centre(disc), glowC = centre(glow);
  expect(Math.abs(discC.x - glowC.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(discC.y - glowC.y)).toBeLessThanOrEqual(1);
}

test('halo is centred on its disc, in both themes', async ({ page }) => {
  await haloCentred(page, 'circle.f-moon', '.f-moon-glow');
  await page.locator('#toggle').click();
  await haloCentred(page, 'circle.f-cel', '.f-sun-glow');
});

// N2: Table Mountain's own lit/shade facets must stay inside its own x-span and share its
// baseline. Devil's Peak reuses the same .f-mtn-lit/.f-mtn-shade classes for its own facets
// (CityScape.astro), so an unscoped selector would also catch Devil's Peak's facets — genuinely
// outside Table Mountain's x-span by design, not a defect. General-sibling scoping to "after
// .table-mountain in sibling order" picks out only Table Mountain's own pair.
test("mountain facets sit inside Table Mountain's own x-span and share its baseline", async ({ page }) => {
  const [tm] = await sceneRects(page, '.table-mountain');
  const shadeFacets = await sceneRects(page, '.table-mountain ~ .f-mtn-shade');
  const litFacets = await sceneRects(page, '.table-mountain ~ .f-mtn-lit');
  expect(shadeFacets).toHaveLength(1);
  expect(litFacets).toHaveLength(1);
  // Sub-pixel float noise (getBoundingClientRect can differ from the containing rect by a
  // few 1e-5 px depending on engine) needs a hairline allowance — the x-span check isn't
  // otherwise tolerant of it like the ≥1px checks elsewhere in this file.
  const FLOAT_EPSILON = 0.01;
  for (const facet of [...shadeFacets, ...litFacets]) {
    expect(facet.x).toBeGreaterThanOrEqual(tm.x - FLOAT_EPSILON);
    expect(facet.x + facet.width).toBeLessThanOrEqual(tm.x + tm.width + FLOAT_EPSILON);
    // Baseline tolerance mirrors the "meets the water" test above — same seam, same overscan.
    expect(Math.abs((facet.y + facet.height) - (tm.y + tm.height))).toBeLessThanOrEqual(SEAM_OVERSCAN_PX);
  }
});

// N3: every paving-seam line must stay inside the ground it's painted on.
test('seam lines stay inside the ground', async ({ page }) => {
  const [ground] = await sceneRects(page, '.f-ground');
  const seamLines = await sceneRects(page, '.f-seam line');
  expect(seamLines.length).toBeGreaterThan(0);
  // Sub-pixel float noise allowance, same as N2's x-span check above.
  const FLOAT_EPSILON = 0.01;
  for (const line of seamLines) {
    expect(
      line.x >= ground.x - FLOAT_EPSILON &&
      line.y >= ground.y - FLOAT_EPSILON &&
      line.x + line.width  <= ground.x + ground.width  + FLOAT_EPSILON &&
      line.y + line.height <= ground.y + ground.height + FLOAT_EPSILON
    ).toBe(true);
  }
});

// ── d37 scene rebuild ─────────────────────────────────────────────────────────
// The mock-vignette elements (cloud bank, glint column, sparkles, mist, sails,
// warning dot) plus their night-only/day-only gating. Zero-width rects are the
// hidden-theme signal: display:none on a night-only/day-only group collapses
// its descendants' boxes, same mechanism visibleRect/sceneRects rely on.

test('the moon sits inside its cloud bank at night', async ({ page }) => {
  const [moon] = await sceneRects(page, 'circle.f-moon');
  const banks = await sceneRects(page, '.f-cloudbank rect');
  expect(banks.length).toBeGreaterThanOrEqual(2);
  // Seated: at least one band crosses the disc's lower half...
  const moonCy = moon.y + moon.height / 2;
  expect(banks.some((b) => rectsIntersect(b, moon) && b.y > moonCy)).toBe(true);
  // ...and every band stays horizontally over the disc's x-span.
  for (const b of banks) {
    expect(b.x + b.width / 2).toBeGreaterThan(moon.x);
    expect(b.x + b.width / 2).toBeLessThan(moon.x + moon.width);
  }
  await page.locator('#toggle').click();
  expect(await sceneDisplay(page, '.f-cloudbank')).toBe('none');
});

test('the glint column breaks beneath the moon, on the sea only', async ({ page }) => {
  const [moon] = await sceneRects(page, 'circle.f-moon');
  const [sea] = await sceneRects(page, '.f-sea');
  const dashes = await sceneRects(page, '.f-sea ~ .f-moon rect');
  expect(dashes.length).toBeGreaterThanOrEqual(5);
  const moonCx = moon.x + moon.width / 2;
  for (const d of dashes) {
    expect(d.y).toBeGreaterThanOrEqual(sea.y);
    expect(d.y + d.height).toBeLessThanOrEqual(sea.y + sea.height);
    expect(Math.abs(d.x + d.width / 2 - moonCx)).toBeLessThanOrEqual(45);
  }
  // Broken: the dashes must not form one solid run — at least one gap.
  const sorted = [...dashes].sort((a, b) => a.y - b.y);
  const gaps = sorted.slice(1).map((d, i) => d.y - (sorted[i].y + sorted[i].height));
  expect(Math.max(...gaps)).toBeGreaterThan(0.5);
  await page.locator('#toggle').click();
  expect(await sceneDisplay(page, '.f-sea ~ .f-moon')).toBe('none');
});

test('sparkle marks render at night and vanish by day', async ({ page }) => {
  const sparkles = await sceneRects(page, '.f-sparkle path');
  expect(sparkles.length).toBeGreaterThanOrEqual(3);
  expect(sparkles.every((s) => s.width > 0)).toBe(true);
  await page.locator('#toggle').click();
  expect(await sceneDisplay(page, '.f-sparkle')).toBe('none');
});

test('the mist band veils the ridges at night and lifts by day', async ({ page }) => {
  const mists = await sceneRects(page, '.f-mist rect');
  expect(mists.length).toBeGreaterThan(0);
  const rects = await mountainRects(page);
  const chainLeft = Math.min(...rects.map((r) => r.x));
  const chainRight = Math.max(...rects.map((r) => r.x + r.width));
  for (const m of mists) {
    expect(m.x).toBeLessThan(chainRight);
    expect(m.x + m.width).toBeGreaterThan(chainLeft);
  }
  await page.locator('#toggle').click();
  expect(await sceneDisplay(page, '.f-mist')).toBe('none');
});

test('two sails cross the bay by day only', async ({ page }) => {
  const [sea] = await sceneRects(page, '.f-sea');
  expect(await sceneDisplay(page, '.f-sail')).toBe('none');
  await page.locator('#toggle').click();
  const sails = await sceneRects(page, '.f-sail polygon');
  expect(sails).toHaveLength(2);
  for (const s of sails) {
    expect(rectsIntersect(s, sea)).toBe(true);
    // A sail is a tall triangle, never a flattened sliver.
    expect(s.height).toBeGreaterThan(s.width);
  }
});

test('an antenna beacon rides just above its tower roof at night', async ({ page }) => {
  const dot = (await sceneRects(page, '.f-beacon')).find((d) => d.width > 0);
  expect(dot).toBeTruthy();
  // The beacon marks one landmark tower: the block under its own x-span, with
  // the light just clear of the roofline. "Tallest of the city bowl" is data,
  // pinned in src/tests/cityscape-beacon.test.js — screen space across three
  // cameras is the wrong place to litigate it.
  const cityBlocks = (await sceneRects(page, '.f-near rect')).filter((r) => r.width > 0);
  const cx = dot.x + dot.width / 2;
  const tower = cityBlocks.find((r) => cx >= r.x && cx <= r.x + r.width);
  expect(tower).toBeTruthy();
  expect(dot.y + dot.height).toBeLessThanOrEqual(tower.y + 2);
  await page.locator('#toggle').click();
  expect(await sceneDisplay(page, '.f-beacon')).toBe('none');
});
