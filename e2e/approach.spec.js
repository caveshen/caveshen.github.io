// The approach — e2e tests
import { test, expect } from '@playwright/test';
import { visibleRect } from './geom.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

// Same behaviour is shared code, so parity tests run on both routes.
const ROUTES = ['/', '/404'];

test('card not visible on load with JS', async ({ page }) => {
  await expect(page.locator('.card')).not.toBeVisible();
});

test('approach prompt visible on load and has a non-empty accessible name', async ({ page }) => {
  const prompt = page.locator('#approach-prompt');
  await expect(prompt).toBeVisible();
  // Checked via the accessibility tree (not raw textContent) so an
  // aria-label="" regression is caught too, not just missing button text.
  await expect(prompt).toHaveAccessibleName(/\S/);
});

test('approaching shows the card', async ({ page }) => {
  await page.locator('#approach-prompt').click();
  await expect(page.locator('.card')).toBeVisible();
});

for (const route of ROUTES) {
  test(`approaching hides the prompt — ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.locator('#approach-prompt').click();
    await expect(page.locator('#approach-prompt')).not.toBeVisible();
  });
}

test('approaching applies a non-identity camera transform', async ({ page }) => {
  await page.locator('#approach-prompt').click();
  // el.style.transform is the JS-set target value; getComputedStyle mid-transition
  // returns the interpolated value at t≈0 (still identity), which would make this flaky.
  const transform = await page.locator('.camera').evaluate((el) => el.style.transform);
  expect(transform).not.toBe('');
  expect(transform).not.toBe('none');
});

for (const route of ROUTES) {
  test(`approach prompt is reachable by Tab from the toggle — ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.keyboard.press('Tab'); // theme toggle
    await page.keyboard.press('Tab'); // approach prompt
    await expect(page.locator('#approach-prompt')).toBeFocused();
  });

  test(`approach prompt activates with Enter — ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(page.locator('.card')).toBeVisible();
  });

  test(`approach prompt activates with Space — ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Space');
    await expect(page.locator('.card')).toBeVisible();
  });
}

for (const route of ROUTES) {
  test(`focus lands on first dialogue option after approaching — ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.locator('#approach-prompt').click();
    await expect(page.locator('#choices button').first()).toBeFocused();
  });
}

for (const route of ROUTES) {
  test(`end-dialogue button hides card and restores prompt — ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.locator('#approach-prompt').click();
    await page.locator('#end-dialogue').click();
    await expect(page.locator('.card')).not.toBeVisible();
    await expect(page.locator('#approach-prompt')).toBeVisible();
    await expect(page.locator('#approach-prompt')).toBeFocused();
  });

  test(`end-dialogue button resets camera to identity — ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.locator('#approach-prompt').click();
    await page.locator('#end-dialogue').click();
    // Check the inline style directly — exit() sets camera.style.transform = 'none'
    const transform = await page.locator('.camera').evaluate((el) => el.style.transform);
    expect(transform).toBe('none');
  });

  test(`Escape exits dialogue and hides card — ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.locator('#approach-prompt').click();
    await page.keyboard.press('Escape');
    await expect(page.locator('.card')).not.toBeVisible();
    await expect(page.locator('#approach-prompt')).toBeVisible();
  });

  test(`Escape returns focus to approach prompt — ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.locator('#approach-prompt').click();
    await page.keyboard.press('Escape');
    await expect(page.locator('#approach-prompt')).toBeFocused();
  });
}

test('camera transition-duration is 0s under prefers-reduced-motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  const duration = await page.locator('.camera').evaluate((el) =>
    window.getComputedStyle(el).transitionDuration
  );
  expect(duration).toBe('0s');
});

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

for (const route of ROUTES) {
  test(`exiting mid-approach resets the fade so a re-approach fades in cleanly — ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.locator('#approach-prompt').click();
    await page.keyboard.press('Escape');
    await page.locator('#approach-prompt').click();
    // Sampled right after the second click, before the fade delay elapses — if
    // exit() failed to reset the entering state, opacity would already be at 1 here.
    const opacity = await page.locator('.card').evaluate((el) => window.getComputedStyle(el).opacity);
    expect(parseFloat(opacity)).toBeLessThan(1);
    await expect(page.locator('.card')).toHaveCSS('opacity', '1');
  });
}

test('no-JS: card is fully opaque, not stuck at the fade\'s starting opacity', async ({ browser }) => {
  const ctx  = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('.card')).toHaveCSS('opacity', '1');
  await ctx.close();
});

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

test('no-JS: end-dialogue button is not visible', async ({ browser }) => {
  const ctx  = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('#end-dialogue')).not.toBeVisible();
  await ctx.close();
});

test('the card stays fully on-screen on a short viewport', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 360 });
  await page.goto('/');
  await page.locator('#approach-prompt').click();
  await expect(async () => {
    const card = await page.locator('.card').boundingBox();
    const viewport = page.viewportSize();
    expect(card.x).toBeGreaterThanOrEqual(0);
    expect(card.y).toBeGreaterThanOrEqual(0);
    expect(card.x + card.width).toBeLessThanOrEqual(viewport.width);
    expect(card.y + card.height).toBeLessThanOrEqual(viewport.height);
  }).toPass();
});

// Table Mountain is authored once; each aspect variant only pans/scales the camera
// around it, never stretches it. getBBox() ignores ancestor transforms (including the
// camera pan/scale), so we measure post-transform with getBoundingClientRect() instead,
// at a viewport sized to force the target variant on.
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

// The district is drawn at world x < 0 (harbour end); none of the original geometry
// (mountains, city bowl) uses negative x, so a negative-x rect/polygon is a cheap,
// reliable proxy for its presence without depending on screen-space placement.

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

test('each sea variant has at least 4 wave marks, visible in both day and night', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 }); // forces the standard variant on
  await page.goto('/');
  for (const variant of ['scene-standard', 'scene-wide', 'scene-tall']) {
    const count = await page.locator(`.${variant} .f-wave`).count();
    expect(count, `${variant} wave count`).toBeGreaterThanOrEqual(4);
  }
  // Confirm waves aren't gated behind night-only: visible by default, and after toggling to day.
  await expect(page.locator('.scene-standard .f-wave').first()).toBeVisible();
  await page.locator('#toggle').click();
  await expect(page.locator('.scene-standard .f-wave').first()).toBeVisible();
});

// Mirrors the negative-x test's world-space pattern rather than screen-space, but that
// test doesn't prove Devil's Peak exists on its own — only Lion's Head/Signal Hill are
// other standalone f-far polygons, and both sit right of and below Table Mountain's
// summit, so only a genuine Devil's Peak polygon can satisfy the check below.

// bg-layer holds mountains and city, fg-layer sea, ground and character.

const ROUTE_CHARACTERS = [
  { route: '/', characterClass: 'badger-figure', otherClass: 'hooded-figure' },
  { route: '/404', characterClass: 'hooded-figure', otherClass: 'badger-figure' },
];

for (const { route, characterClass, otherClass } of ROUTE_CHARACTERS) {
  test(`the ${characterClass} is present, the ${otherClass} is not — ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(route);
    await expect(page.locator(`.${characterClass}`)).toHaveCount(3);
    await expect(page.locator(`.${otherClass}`)).toHaveCount(0);
  });

  test(`each scene has a bg-layer (containing the mountain) and fg-layer (containing the sea and character) — ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 }); // forces the standard variant on
    await page.goto(route);
    for (const variant of ['scene-standard', 'scene-wide', 'scene-tall']) {
      await expect(page.locator(`.${variant} .bg-layer .table-mountain`)).toHaveCount(1);
      await expect(page.locator(`.${variant} .fg-layer .f-sea`)).toHaveCount(1);
      await expect(page.locator(`.${variant} .fg-layer .${characterClass}`)).toHaveCount(1);
    }
  });
}

// Reduced motion turns off the .camera (and .bg-layer) transition, so the
// dampened zoom applies instantly — a settled state with no timing wait needed.
test('approach dampens background growth relative to the foreground (parallax)', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 }); // forces the standard variant on
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const bgBefore = await visibleRect(page, '.table-mountain');
  const fgBefore = await visibleRect(page, '.js-character');
  await page.locator('#approach-prompt').click();
  const bgAfter = await visibleRect(page, '.table-mountain');
  const fgAfter = await visibleRect(page, '.js-character');
  const bgGrowth = bgAfter.height / bgBefore.height;
  const fgGrowth = fgAfter.height / fgBefore.height;
  expect(bgGrowth, `bg grew ${bgGrowth}x, fg grew ${fgGrowth}x`).toBeLessThan(fgGrowth);
  // The bg must track the damped curve, not merely grow "less" than the fg.
  expect(bgGrowth).toBeCloseTo(1 + (fgGrowth - 1) * 0.4, 1);
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
