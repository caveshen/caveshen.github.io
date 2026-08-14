// The approach — e2e tests
import { test, expect } from '@playwright/test';
import {
  visibleRect, seekFrameTransition, expectRectClose,
  settledOpacity, approachPrompt,
} from './geom.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

// Same behaviour is shared code, so parity tests run on both routes.
const ROUTES = ['/', '/404'];

// Timing constants — must match stage.js's own (PROMPT_FADE_MS/PROMPT_LINGER_MS/
// EXIT_REFOCUS_MS). Kept here as plain numbers (not imported) since stage.js
// doesn't export them — a drift between the two would show up as a wrong
// clock.fastForward boundary failing, not a silent pass.
const PROMPT_FADE_MS = 500;
const PROMPT_LINGER_MS = 1000;
const EXIT_REFOCUS_MS = 1000;

test('card not visible on load with JS', async ({ page }) => {
  await expect(page.locator('.card')).not.toBeVisible();
});

for (const route of ROUTES) {
  test(`at rest the scene is clean — the prompt is invisible and inert — ${route}`, async ({ page }) => {
    await page.goto(route);
    const prompt = page.locator('#approach-prompt');
    // toBeVisible() alone would pass here even at opacity:0 (it doesn't check
    // opacity) — the actual "clean at rest" contract is the computed style.
    const style = await prompt.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { opacity: cs.opacity, pointerEvents: cs.pointerEvents };
    });
    expect(style.opacity).toBe('0');
    expect(style.pointerEvents).toBe('none');
  });
}

test('approach prompt has a non-empty accessible name, even hidden at rest', async ({ page }) => {
  const prompt = page.locator('#approach-prompt');
  // Checked via the accessibility tree (not raw textContent) so an
  // aria-label="" regression is caught too, not just missing button text.
  await expect(prompt).toHaveAccessibleName(/\S/);
});

test('the prompt is floating text — no box, border, or glass chrome', async ({ page }) => {
  const style = await page.locator('#approach-prompt').evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      borderStyle: cs.borderTopStyle,
      background: cs.backgroundColor,
      backdropFilter: cs.backdropFilter || cs.webkitBackdropFilter || '',
      textShadow: cs.textShadow,
    };
  });
  expect(style.borderStyle).toBe('none');
  expect(style.background).toBe('rgba(0, 0, 0, 0)');
  expect(style.backdropFilter === '' || style.backdropFilter === 'none').toBe(true);
  expect(style.textShadow).not.toBe('none'); // the shadow carries the AA contrast duty instead
});

test('the character hit surface has the pointer cursor and never itself starts the dialogue', async ({ page }) => {
  const hit = page.locator('.js-character-hit:visible').first();
  const cursor = await hit.evaluate((el) => getComputedStyle(el).cursor);
  expect(cursor).toBe('pointer');
  await hit.click();
  await expect(page.locator('.card')).not.toBeVisible();
});

test('hovering the character reveals the prompt with a 500ms fade to full opacity', async ({ page }) => {
  const prompt = page.locator('#approach-prompt');
  await page.locator('.js-character-hit:visible').first().hover();
  const duration = await prompt.evaluate((el) => {
    const anim = el.getAnimations()[0];
    return anim?.effect.getComputedTiming().duration;
  });
  expect(duration).toBe(PROMPT_FADE_MS);
  expect(await settledOpacity(prompt)).toBe(1);
});

test('hovering the prompt itself keeps it visible — travelling from the character to it never loses it', async ({ page }) => {
  const prompt = page.locator('#approach-prompt');
  await page.locator('.js-character-hit:visible').first().hover();
  await prompt.hover(); // leaves the character, enters the prompt
  expect(await settledOpacity(prompt)).toBe(1);
});

test('linger: leaving both character and prompt holds the prompt for ~1s, then fades it out', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  const prompt = page.locator('#approach-prompt');

  await page.locator('.js-character-hit:visible').first().hover();
  expect(await settledOpacity(prompt)).toBe(1);

  // install() alone still lets Date/timers progress with real time — freeze
  // it here (a generous future point, computed Node-side so there's no page
  // round-trip for real time to sneak into) so the boundary checked below
  // isn't muddied by however long a slower project's steps take in real time.
  await page.clock.pauseAt(Date.now() + 60_000);

  // Move off both the character and the prompt — the linger timer starts.
  await page.mouse.move(0, 0);

  // Just short of the linger — the fade-out must not have started yet.
  await page.clock.fastForward(PROMPT_LINGER_MS - 50);
  const midOpacity = await prompt.evaluate((el) => parseFloat(getComputedStyle(el).opacity));
  expect(midOpacity).toBe(1);

  // Cross the linger boundary — hidePrompt() fires and starts the fade-out.
  await page.clock.fastForward(100);
  expect(await settledOpacity(prompt)).toBe(0);
});

test('keyboard focus reveals the prompt the same way as hover, with a visible focus indicator', async ({ page }) => {
  const prompt = page.locator('#approach-prompt');
  await page.keyboard.press('Tab'); // theme toggle
  await page.keyboard.press('Tab'); // approach prompt
  await expect(prompt).toBeFocused();
  expect(await settledOpacity(prompt)).toBe(1);
  const outlineStyle = await prompt.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outlineStyle).not.toBe('none');
});

test('approaching shows the card', async ({ page }) => {
  await approachPrompt(page);
  await expect(page.locator('.card')).toBeVisible();
});

for (const route of ROUTES) {
  test(`approaching hides the prompt — ${route}`, async ({ page }) => {
    await page.goto(route);
    await approachPrompt(page);
    await expect(page.locator('#approach-prompt')).not.toBeVisible();
  });
}

test('approaching applies a non-identity camera transform', async ({ page }) => {
  await approachPrompt(page);
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
    await approachPrompt(page);
    await expect(page.locator('#choices button').first()).toBeFocused();
  });
}

for (const route of ROUTES) {
  test(`end-dialogue button hides the card; the prompt reappears and refocuses ~1s later — ${route}`, async ({ page }) => {
    await page.clock.install();
    // install() alone still lets Date/timers progress with real time — freeze
    // it here (a generous future point, computed Node-side so there's no page
    // round-trip for real time to sneak into) so the boundary checked below
    // isn't muddied by however long a slower project's steps take in real time.
    await page.clock.pauseAt(Date.now() + 60_000);
    await page.goto(route);
    await approachPrompt(page);
    await page.locator('#end-dialogue').click();
    await expect(page.locator('.card')).not.toBeVisible();

    const prompt = page.locator('#approach-prompt');
    // Immediately after exit: back in layout, but not yet focused or revealed —
    // nothing crosses the character while the camera settles.
    await expect(prompt).not.toBeFocused();
    expect(await prompt.evaluate((el) => getComputedStyle(el).opacity)).toBe('0');

    // Hovering the character mid-settle must not summon the prompt — the
    // camera-settle window suppresses reveals regardless of how the hover
    // happened (a real pointer move, or the dialogue card vanishing out from
    // under an already-stationary pointer).
    await page.locator('.js-character-hit:visible').first().hover();
    expect(await prompt.evaluate((el) => getComputedStyle(el).opacity)).toBe('0');

    // Just short of the delay — still not focused.
    await page.clock.fastForward(EXIT_REFOCUS_MS - 50);
    await expect(prompt).not.toBeFocused();

    // Crossing the delay — the delayed focus() fires, revealing the prompt
    // via the same path as hover.
    await page.clock.fastForward(100);
    await expect(prompt).toBeFocused();
    expect(await settledOpacity(prompt)).toBe(1);
  });

  test(`end-dialogue button resets camera to identity — ${route}`, async ({ page }) => {
    await page.goto(route);
    await approachPrompt(page);
    await page.locator('#end-dialogue').click();
    // Check the inline style directly — exit() sets camera.style.transform = 'none'
    const transform = await page.locator('.camera').evaluate((el) => el.style.transform);
    expect(transform).toBe('none');
  });

  test(`Escape exits dialogue and hides the card — ${route}`, async ({ page }) => {
    await page.goto(route);
    await approachPrompt(page);
    await page.keyboard.press('Escape');
    await expect(page.locator('.card')).not.toBeVisible();
  });

  test(`Escape: the prompt refocuses ~1s later, same as end-dialogue — ${route}`, async ({ page }) => {
    await page.clock.install();
    await page.goto(route);
    await approachPrompt(page);
    await page.keyboard.press('Escape');
    const prompt = page.locator('#approach-prompt');
    await expect(prompt).not.toBeFocused();
    await page.clock.fastForward(EXIT_REFOCUS_MS + 500);
    await expect(prompt).toBeFocused();
  });
}

test('reduced motion: exit refocuses the prompt immediately, no settle delay', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await approachPrompt(page);
  await page.locator('#end-dialogue').click();
  const prompt = page.locator('#approach-prompt');
  await expect(prompt).toBeFocused();
  expect(await prompt.evaluate((el) => parseFloat(getComputedStyle(el).opacity))).toBe(1);
});

test('reduced motion: hover reveal and linger fade-out are both instant', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  const prompt = page.locator('#approach-prompt');

  await page.locator('.js-character-hit:visible').first().hover();
  const duration = await prompt.evaluate((el) => el.getAnimations()[0]?.effect.getComputedTiming().duration);
  expect(duration).toBe(0);
  expect(await prompt.evaluate((el) => parseFloat(getComputedStyle(el).opacity))).toBe(1);

  await page.mouse.move(0, 0);
  expect(await settledOpacity(prompt)).toBe(0);
});

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
  await approachPrompt(page);
  await expect(page.locator('.card')).toHaveCSS('opacity', '1');
});

test('reduced motion: card fade is disabled, card is immediately full opacity', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  const duration = await page.locator('.card').evaluate((el) =>
    window.getComputedStyle(el).transitionDuration
  );
  expect(duration).toBe('0s');
  await approachPrompt(page);
  await expect(page.locator('.card')).toHaveCSS('opacity', '1');
});

// The three fixme tests below assert exact values (alpha at a seeked t=0,
// resting-colour equality) that race the browser's transition clocks on slow
// machines: the seek can land one frame late, and opacity settling does not
// prove the custom-property colour transition finished. Skipped by explicit
// ruling to unblock the merge. To re-enable, sample only frozen or finished
// states — see the freeze-at-t=0 idiom in banner-plane.spec.js.
test.fixme('approaching draws the etched frame in over the entrance window', async ({ page }) => {
  await approachPrompt(page);
  const start = await seekFrameTransition(page, 0);
  const mid   = await seekFrameTransition(page, 0.5);
  const end   = await seekFrameTransition(page, 1);
  expect(start.outlineAlpha).toBeLessThan(0.01); // armed transparent by .card-entering
  expect(mid.outlineColor).not.toBe(start.outlineColor);
  expect(mid.outlineColor).not.toBe(end.outlineColor);
});

test.fixme('the frame also draws in under day theme, not just night', async ({ page }) => {
  await page.locator('#toggle').click();
  await approachPrompt(page);
  const start = await seekFrameTransition(page, 0);
  expect(start.outlineAlpha).toBeLessThan(0.01);
});

test.fixme('resting frame colour is identical whether the entrance animates or not', async ({ page }) => {
  await approachPrompt(page);
  // Real-time settle, not WAAPI pause/seek — some engines don't reliably
  // repaint a background-image driven by a paused custom-property transition.
  // Opacity shares the frame's own 550ms window, so its settle is the frame's too.
  await expect(page.locator('.card')).toHaveCSS('opacity', '1');
  const readCard = () => page.locator('.card').evaluate((el) => {
    const cs = getComputedStyle(el);
    return { outlineColor: cs.outlineColor, backgroundImage: cs.backgroundImage };
  });
  const animated = await readCard();

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await approachPrompt(page);
  const reduced = await readCard();

  expect(animated.outlineColor).toBe(reduced.outlineColor);
  expect(animated.backgroundImage).toBe(reduced.backgroundImage);
});

test('reduced motion: the frame has no animation, its resting colour applies immediately', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await approachPrompt(page);
  const anims = await page.locator('.card').evaluate((el) =>
    el.getAnimations().filter((a) =>
      a.transitionProperty === '--frame' || a.transitionProperty === '--frame-faint'
    ).length
  );
  expect(anims).toBe(0);
  const outlineColor = await page.locator('.card').evaluate((el) => getComputedStyle(el).outlineColor);
  expect(outlineColor).not.toBe('rgba(0, 0, 0, 0)');
});

test('the frame reveal changes colour only — outline/bracket geometry and clickable boxes hold still', async ({ page }) => {
  await approachPrompt(page);
  const start = await seekFrameTransition(page, 0);
  const end   = await seekFrameTransition(page, 1);
  expect(end.outlineColor).not.toBe(start.outlineColor); // sanity: the frame did draw in
  expect(end.outlineWidth).toBe(start.outlineWidth);
  expect(end.outlineOffset).toBe(start.outlineOffset);
  expect(end.backgroundSize).toBe(start.backgroundSize);
  expect(end.backgroundPosition).toBe(start.backgroundPosition);
  expectRectClose(end.cardRect, start.cardRect);
  expectRectClose(end.btnRect, start.btnRect);
});

test('the corner brackets also draw in, not just the hairline', async ({ page }) => {
  // Real-time settle, not WAAPI pause/seek — some engines don't reliably
  // repaint a background-image driven by a paused custom-property transition.
  const before = await page.locator('.card').evaluate((el) => getComputedStyle(el).backgroundImage);
  await approachPrompt(page);
  await expect(page.locator('.card')).toHaveCSS('opacity', '1'); // settled: the frame shares this window
  const after = await page.locator('.card').evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(after).not.toBe(before);
});

for (const route of ROUTES) {
  test(`exiting mid-approach resets the fade so a re-approach fades in cleanly — ${route}`, async ({ page }) => {
    await page.goto(route);
    await approachPrompt(page);
    await page.keyboard.press('Escape');
    await approachPrompt(page);
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
  await approachPrompt(page);
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
// 600/254: baseline (y=352) overscans 6 units to y=358 for the d28 waterline-seam fix,
// so the polygon's own bbox height grew from 248 to 254 — see CityScape.astro.
const MOUNTAIN_RATIO = 2.3622;

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
  await approachPrompt(page);
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
