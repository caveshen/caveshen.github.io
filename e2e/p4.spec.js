// P4 — Landing v2: the approach — e2e tests
// Covers success criteria 2–8 and 10 (SC1 is unit-tested; SC9, SC11, SC12 are run-level checks).
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

// ── SC2: card hidden on load, prompt visible and named ────────────────────────

test('card not visible on load with JS', async ({ page }) => {
  await expect(page.locator('.card')).not.toBeVisible();
});

test('approach prompt visible on load and has accessible name containing PLACEHOLDER', async ({ page }) => {
  const prompt = page.locator('#approach-prompt');
  await expect(prompt).toBeVisible();
  // Accessible name comes from button text (PLACEHOLDER copy as required by PRD §2)
  await expect(prompt).toContainText('PLACEHOLDER');
});

// ── SC3: approaching shows card, applies camera transform, hides prompt ────────

test('approaching shows the card', async ({ page }) => {
  await page.locator('#approach-prompt').click();
  await expect(page.locator('.card')).toBeVisible();
});

test('approaching hides the prompt', async ({ page }) => {
  await page.locator('#approach-prompt').click();
  await expect(page.locator('#approach-prompt')).not.toBeVisible();
});

test('approaching applies a non-identity camera transform', async ({ page }) => {
  await page.locator('#approach-prompt').click();
  // Use el.style.transform (the JS-set target value, not the animated computed value).
  // getComputedStyle during an active transition returns the interpolated value at t≈0,
  // which is still identity — making the test flaky. The inline style is set synchronously.
  const transform = await page.locator('.camera').evaluate((el) => el.style.transform);
  expect(transform).not.toBe('');
  expect(transform).not.toBe('none');
});

// ── SC4: prompt reachable by Tab; activates with Enter and Space ──────────────

test('approach prompt is reachable by Tab from the toggle', async ({ page }) => {
  await page.keyboard.press('Tab'); // theme toggle
  await page.keyboard.press('Tab'); // approach prompt
  await expect(page.locator('#approach-prompt')).toBeFocused();
});

test('approach prompt activates with Enter', async ({ page }) => {
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('.card')).toBeVisible();
});

test('approach prompt activates with Space', async ({ page }) => {
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Space');
  await expect(page.locator('.card')).toBeVisible();
});

// ── SC5: focus lands on first dialogue option after approach ──────────────────

test('focus lands on first dialogue option after approaching', async ({ page }) => {
  await page.locator('#approach-prompt').click();
  await expect(page.locator('#choices button').first()).toBeFocused();
});

// ── SC6: exits restore state, prompt re-focused ───────────────────────────────

test('end-dialogue button hides card and restores prompt', async ({ page }) => {
  await page.locator('#approach-prompt').click();
  await page.locator('#end-dialogue').click();
  await expect(page.locator('.card')).not.toBeVisible();
  await expect(page.locator('#approach-prompt')).toBeVisible();
  await expect(page.locator('#approach-prompt')).toBeFocused();
});

test('end-dialogue button resets camera to identity', async ({ page }) => {
  await page.locator('#approach-prompt').click();
  await page.locator('#end-dialogue').click();
  // Check the inline style directly — exit() sets camera.style.transform = 'none'
  const transform = await page.locator('.camera').evaluate((el) => el.style.transform);
  expect(transform).toBe('none');
});

test('Escape exits dialogue and hides card', async ({ page }) => {
  await page.locator('#approach-prompt').click();
  await page.keyboard.press('Escape');
  await expect(page.locator('.card')).not.toBeVisible();
  await expect(page.locator('#approach-prompt')).toBeVisible();
});

test('Escape returns focus to approach prompt', async ({ page }) => {
  await page.locator('#approach-prompt').click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#approach-prompt')).toBeFocused();
});

// ── SC7: prefers-reduced-motion — camera jump-cuts (transition-duration 0s) ───

test('camera transition-duration is 0s under prefers-reduced-motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  const duration = await page.locator('.camera').evaluate((el) =>
    window.getComputedStyle(el).transitionDuration
  );
  expect(duration).toBe('0s');
});

// ── PRD §28: dialogue card fades in on approach, synced to the §21 zoom ───────

test('card has an opacity transition wired up (fades rather than pops)', async ({ page }) => {
  const { property, duration } = await page.locator('.card').evaluate((el) => {
    const cs = window.getComputedStyle(el);
    return { property: cs.transitionProperty, duration: cs.transitionDuration };
  });
  const props = property.split(', ');
  const idx = props.indexOf('opacity');
  expect(idx, `transitionProperty was "${property}"`).toBeGreaterThanOrEqual(0);
  expect(parseFloat(duration.split(', ')[idx])).toBeGreaterThan(0);
});

test('approaching fades the card in to full opacity', async ({ page }) => {
  await page.locator('#approach-prompt').click();
  await expect(page.locator('.card')).toHaveCSS('opacity', '1');
});

test('reduced motion: card fade is disabled, card is immediately full opacity', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  const duration = await page.locator('.card').evaluate((el) =>
    window.getComputedStyle(el).transitionDuration
  );
  expect(duration).toBe('0s');
  await page.locator('#approach-prompt').click();
  await expect(page.locator('.card')).toHaveCSS('opacity', '1');
});

test('exiting mid-approach resets the fade so a re-approach fades in cleanly (PRD §28 AC4)', async ({ page }) => {
  await page.locator('#approach-prompt').click();
  await page.keyboard.press('Escape');
  await page.locator('#approach-prompt').click();
  // Sampled immediately after the second click, before the fade's transition
  // delay elapses — if exit() failed to reset the entering state, the card
  // would already be sitting at full opacity here (no fade left to observe).
  const opacity = await page.locator('.card').evaluate((el) => window.getComputedStyle(el).opacity);
  expect(parseFloat(opacity)).toBeLessThan(1);
  await expect(page.locator('.card')).toHaveCSS('opacity', '1');
});

test('no-JS: card is fully opaque, not stuck at the fade\'s starting opacity', async ({ browser }) => {
  const ctx  = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('.card')).toHaveCSS('opacity', '1');
  await ctx.close();
});

// ── SC8: figure fills are theme-independent ───────────────────────────────────

test('figure fill colours are unchanged by day/night toggle', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  // Night is default — get fill of the jeans path (literal #2b2f3f, never themed)
  const getNightFill = () =>
    page.locator('.scene-standard .hooded-figure path').first()
      .getAttribute('fill');
  const nightFill = await getNightFill();
  await page.locator('#toggle').click(); // switch to day
  const dayFill = await page.locator('.scene-standard .hooded-figure path').first()
    .getAttribute('fill');
  expect(nightFill).toBe(dayFill);
  expect(nightFill).toBeTruthy(); // must have a literal colour, not null
});

// ── SC10: no-JS path — card visible, /sheet reachable ────────────────────────

test('no-JS: card is visible on load', async ({ browser }) => {
  const ctx  = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('.card')).toBeVisible();
  await ctx.close();
});

test('no-JS: /sheet link is reachable', async ({ browser }) => {
  const ctx  = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('a[href="/sheet"]')).toBeVisible();
  await ctx.close();
});

// ── PRD §15 D4: [hidden] must actually hide #end-dialogue with no JS ──────────

test('no-JS: end-dialogue button is not visible', async ({ browser }) => {
  const ctx  = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('#end-dialogue')).not.toBeVisible();
  await ctx.close();
});

// ── Regression: one world, three cameras (PRD §14) ─────────────────────────
// Table Mountain is authored once in CityScape.astro; each aspect variant only
// pans/scales the camera around it, never stretches it. getBBox() reads the
// polygon's own LOCAL geometry — it ignores the element's own transform and
// every ancestor transform (including the .world camera pan/scale), so it
// can't see a stretch applied there. We must measure in screen space, post-
// transform: getBoundingClientRect() on the visible variant, at a viewport
// sized to force that variant on (same pattern as the aspect-variant tests
// in interview.spec.js). A zero-height rect (wrong/hidden variant selected)
// fails loudly rather than skating through as a false pass.
const MOUNTAIN_RATIO = 2.4194;

async function mountainRatio(page, selector) {
  const box = await page.locator(selector).evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { width: r.width, height: r.height };
  });
  expect(box.height, 'Table Mountain rect has zero height — wrong/hidden scene variant selected').toBeGreaterThan(0);
  return box.width / box.height;
}

test('Table Mountain aspect ratio is 2.4194 in the standard view', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  const ratio = await mountainRatio(page, '.scene-standard .table-mountain');
  expect(ratio).toBeCloseTo(MOUNTAIN_RATIO, 3);
});

test('Table Mountain aspect ratio is 2.4194 in the wide view', async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1080 });
  await page.goto('/');
  const ratio = await mountainRatio(page, '.scene-wide .table-mountain');
  expect(ratio).toBeCloseTo(MOUNTAIN_RATIO, 3);
});

test('Table Mountain aspect ratio is 2.4194 in the tall view', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const ratio = await mountainRatio(page, '.scene-tall .table-mountain');
  expect(ratio).toBeCloseTo(MOUNTAIN_RATIO, 3);
});

// ── PRD §20: industrial district west of the mountain foot ────────────────
// The district is drawn at world x < 0 (harbour end); none of the original
// geometry (mountains, city bowl) uses negative x. Presence of a negative-x
// rect/polygon in the world group is a cheap, reliable proxy that bites if
// the port is reverted, without depending on exact screen-space placement.

test('industrial district: the world group contains geometry west of x=0', async ({ page }) => {
  await page.goto('/');
  const hasNegativeX = await page.locator('.scene-standard .world').evaluate((worldEl) => {
    const rects = [...worldEl.querySelectorAll('rect')]
      .some((el) => parseFloat(el.getAttribute('x') ?? '0') < 0);
    const polys = [...worldEl.querySelectorAll('polygon')]
      .some((el) => (el.getAttribute('points') ?? '')
        .trim().split(/\s+/)
        .some((pair) => parseFloat(pair.split(',')[0]) < 0));
    return rects || polys;
  });
  expect(hasNegativeX).toBe(true);
});

// ── PRD §20 added scope: sea wave marks ────────────────────────────────────

test('each sea variant has at least 4 wave marks, visible in both day and night', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 }); // forces the standard variant on
  await page.goto('/');
  for (const variant of ['scene-standard', 'scene-wide', 'scene-tall']) {
    const count = await page.locator(`.${variant} .f-wave`).count();
    expect(count, `${variant} wave count`).toBeGreaterThanOrEqual(4);
  }
  // Night is default (PRD §3) — confirm waves are visible without toggling first,
  // then toggle to day and confirm they stay visible (not gated behind night-only).
  await expect(page.locator('.scene-standard .f-wave').first()).toBeVisible();
  await page.locator('#toggle').click();
  await expect(page.locator('.scene-standard .f-wave').first()).toBeVisible();
});

// ── PRD §26: Devil's Peak + softened Lion's Head ───────────────────────────
// World geometry is authored once (local SVG coordinate space); the "west of
// x=0" test above proves the same point in the same way, so we mirror that
// pattern rather than measuring screen-space post-camera-transform.
// The §20 negative-x test already passes via the industrial district and
// does NOT prove Devil's Peak exists — this test specifically bites if the
// new polygon is removed: only Lion's Head/Signal Hill remain as other
// standalone f-far polygons, and both sit to the right of and below Table
// Mountain's summit, so neither can satisfy the check below.

// ── PRD §19 refactor: bg-layer/fg-layer seam ────────────────────────────────
// Pure structural refactor (no visual change) — separates background
// (mountains/city) from foreground (sea, ground, character) in the DOM so
// the scene can be controlled independently later. Asserts the seam exists
// and holds, so a future edit can't silently flatten it back together.

test('each scene has a bg-layer (containing the mountain) and fg-layer (containing the sea and character)', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 }); // forces the standard variant on
  await page.goto('/');
  for (const variant of ['scene-standard', 'scene-wide', 'scene-tall']) {
    await expect(page.locator(`.${variant} .bg-layer .table-mountain`)).toHaveCount(1);
    await expect(page.locator(`.${variant} .fg-layer .f-sea`)).toHaveCount(1);
    await expect(page.locator(`.${variant} .fg-layer .hooded-figure`)).toHaveCount(1);
  }
});

test("Devil's Peak: an f-far polygon apex sits above and left of Table Mountain's summit", async ({ page }) => {
  const found = await page.locator('.scene-standard .world').evaluate((worldEl) => {
    const parsePoints = (el) => el.getAttribute('points').trim().split(/\s+/)
      .map((pair) => pair.split(',').map(Number));

    const tmPoints = parsePoints(worldEl.querySelector('polygon.table-mountain'));
    const tmSummitY = Math.min(...tmPoints.map(([, y]) => y));
    const tmSummitX = tmPoints.find(([, y]) => y === tmSummitY)[0];

    const otherFarPolys = [...worldEl.querySelectorAll('polygon.f-far')]
      .filter((el) => !el.classList.contains('table-mountain'));

    return otherFarPolys.some((el) => parsePoints(el)
      .some(([x, y]) => y < tmSummitY && x < tmSummitX));
  });
  expect(found, "expected an f-far polygon (Devil's Peak) with a vertex higher and left of Table Mountain's summit").toBe(true);
});
