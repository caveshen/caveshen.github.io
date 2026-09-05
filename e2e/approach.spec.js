// The approach — e2e tests
import { test, expect } from './fixtures.js';
import { visibleRect, settledOpacity, approachPrompt } from './geom.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

// Timing constants — must match stage.js's own (PROMPT_FADE_MS/PROMPT_LINGER_MS/
// EXIT_REFOCUS_MS). Kept here as plain numbers (not imported) since stage.js
// doesn't export them — a drift between the two would show up as a wrong
// clock.fastForward boundary failing, not a silent pass.
const PROMPT_LINGER_MS = 1000;
const EXIT_REFOCUS_MS = 1000;

test('card not visible on load with JS', async ({ page }) => {
  await expect(page.locator('.card')).not.toBeVisible();
});

test('at rest the scene is clean — the prompt is invisible and inert', async ({ page }) => {
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

test('the revealed prompt has a hit area at least 44px tall and 44px wide', async ({ page }) => {
  const prompt = page.locator('#approach-prompt');
  await page.locator('.js-character-hit:visible').first().hover();
  expect(await settledOpacity(prompt)).toBe(1);
  const box = await prompt.boundingBox();
  expect(box.height).toBeGreaterThanOrEqual(44);
  expect(box.width).toBeGreaterThanOrEqual(44);
});

test('the revealed prompt is plain white in both themes', async ({ page }) => {
  const prompt = page.locator('#approach-prompt');
  await page.locator('.js-character-hit:visible').first().hover();
  expect(await prompt.evaluate((el) => getComputedStyle(el).color)).toBe('rgb(255, 255, 255)');

  await page.locator('#toggle').click(); // day theme
  await page.locator('.js-character-hit:visible').first().hover();
  expect(await prompt.evaluate((el) => getComputedStyle(el).color)).toBe('rgb(255, 255, 255)');
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

test('a click on the character starts the dialogue directly, the same as activating the prompt', async ({ page }) => {
  const hit = page.locator('.js-character-hit:visible').first();
  await hit.click();
  await expect(page.locator('.card')).toBeVisible();
});

test('after dialogue exit the scene starts clean again, with no leftover reveal state', async ({ page }) => {
    await page.clock.install();
    await page.clock.pauseAt(Date.now() + 60_000);
    await page.goto('/');
    const hit = page.locator('.js-character-hit:visible').first();
    const prompt = page.locator('#approach-prompt');

    await hit.click(); // direct approach — the character's own vector
    await page.locator('#end-dialogue').click();
    await page.clock.fastForward(EXIT_REFOCUS_MS + 100);
    await expect(prompt).toBeFocused(); // the delayed refocus

    // The camera has reset to identity, so the pointer (left resting where
    // "end dialogue" was clicked) may now sit over the repositioned
    // character — hover a fixed, always-present control well clear of the
    // character's generous hit padding (a screen-space coordinate risks
    // landing inside it on some viewports) so only focus (removed next) can
    // keep the prompt visible.
    await page.locator('#toggle').hover();

    // Move focus off the prompt with a real Tab — a leftover reveal state
    // would keep the prompt visible forever after this; a clean reset lets
    // it linger, then fade.
    await page.keyboard.press('Shift+Tab');
    await expect(prompt).not.toBeFocused();
    await page.clock.fastForward(PROMPT_LINGER_MS + 100);
    expect(await settledOpacity(prompt)).toBe(0);
});

test('a single tap on the character approaches directly — no two-step, same as every other device', async ({ page }, testInfo) => {
  // .tap() needs a touch-capable context — gate on the project's static
  // hasTouch capability, same idiom button-feel.spec.js uses.
  test.skip(!testInfo.project.use.hasTouch, 'tap() requires a touch-capable project');
  const hit = page.locator('.js-character-hit:visible').first();
  await hit.tap();
  await expect(page.locator('.card')).toBeVisible();
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

test('approaching hides the prompt', async ({ page }) => {
  await approachPrompt(page);
  await expect(page.locator('#approach-prompt')).not.toBeVisible();
});

test('approaching applies a non-identity camera transform', async ({ page }) => {
  await approachPrompt(page);
  // el.style.transform is the JS-set target value; getComputedStyle mid-transition
  // returns the interpolated value at t≈0 (still identity), which would make this flaky.
  const transform = await page.locator('.camera').evaluate((el) => el.style.transform);
  expect(transform).not.toBe('');
  expect(transform).not.toBe('none');
});

test('approach prompt is reachable by Tab from the toggle and activates with Enter', async ({ page }) => {
  await page.keyboard.press('Tab'); // theme toggle
  await page.keyboard.press('Tab'); // approach prompt
  await expect(page.locator('#approach-prompt')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('.card')).toBeVisible();
  await expect(page.locator('#choices button').first()).toBeFocused();
});

test('end-dialogue button hides the card; the prompt reappears and refocuses ~1s later', async ({ page }) => {
    await page.clock.install();
    // install() alone still lets Date/timers progress with real time — freeze
    // it here (a generous future point, computed Node-side so there's no page
    // round-trip for real time to sneak into) so the boundary checked below
    // isn't muddied by however long a slower project's steps take in real time.
    await page.clock.pauseAt(Date.now() + 60_000);
    await page.goto('/');
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

test('end-dialogue button resets camera to identity', async ({ page }) => {
  await approachPrompt(page);
  await page.locator('#end-dialogue').click();
  // Check the inline style directly — exit() sets camera.style.transform = 'none'
  const transform = await page.locator('.camera').evaluate((el) => el.style.transform);
  expect(transform).toBe('none');
});

test('Escape exits dialogue and hides the card', async ({ page }) => {
  await approachPrompt(page);
  await page.keyboard.press('Escape');
  await expect(page.locator('.card')).not.toBeVisible();
});

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

// ── Quest marker, area title, E hotkey ──────────────────────────────────
// The HUD's "someone to talk to" sign and the region name both leave once
// the dialogue is open; E is the same verb as the prompt.

// Only the laid-out scene variant's marker counts (the other two sit in
// display:none copies) — read computed display, never a collapsed rect
// (WebKit keeps last-laid-out boxes for SVG inside display:none).
const markerStyle = (page) => page.evaluate(() => {
  const scene = [...document.querySelectorAll('.scene')].find((e) => e.getBoundingClientRect().width > 0);
  const marker = scene.querySelector('.quest-marker');
  return {
    display: getComputedStyle(marker).display,
    bob: getComputedStyle(marker.querySelector('.quest-marker-bob')).animationName,
  };
});

// Both routes: each figure draws its own marker.
for (const route of ['/', '/404']) {
  test(`the quest marker bobs over the character at rest and hides on approach — ${route}`, async ({ page }) => {
    await page.goto(route);
    const rest = await markerStyle(page);
    expect(rest.display).not.toBe('none');
    expect(rest.bob).toBe('marker-bob');
    await approachPrompt(page);
    expect((await markerStyle(page)).display).toBe('none');
    await page.keyboard.press('Escape');
    await expect.poll(async () => (await markerStyle(page)).display).not.toBe('none');
  });
}

test('reduced motion: the quest marker stands still', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  expect((await markerStyle(page)).bob).toBe('none');
});

test('the area title plays once on arrival and is gone once the dialogue opens', async ({ page }) => {
  const title = page.locator('#area-title');
  await expect(title).toHaveClass(/play/);
  const anim = await title.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { name: cs.animationName, count: cs.animationIterationCount };
  });
  expect(anim.name).toBe('area-reveal');
  expect(anim.count).toBe('1');
  await approachPrompt(page);
  expect(await title.evaluate((el) => getComputedStyle(el).display)).toBe('none');
});

test('E approaches from the keyboard, the same as the prompt', async ({ page }) => {
  await page.keyboard.press('e');
  await expect(page.locator('.card')).toBeVisible();
  await expect(page.locator('#choices button').first()).toBeFocused();
});

test('exiting mid-approach resets the fade so a re-approach fades in cleanly', async ({ page }) => {
  await approachPrompt(page);
  await page.keyboard.press('Escape');
  await approachPrompt(page);
  // Sampled right after the second click, before the fade delay elapses — if
  // exit() failed to reset the entering state, opacity would already be at 1 here.
  const opacity = await page.locator('.card').evaluate((el) => window.getComputedStyle(el).opacity);
  expect(parseFloat(opacity)).toBeLessThan(1);
  await expect(page.locator('.card')).toHaveCSS('opacity', '1');
});

test('no-JS: the card stands open and opaque with the root line, no Leave button', async ({ browser }) => {
  const ctx  = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('.card')).toBeVisible();
  await expect(page.locator('.card')).toHaveCSS('opacity', '1');
  expect(((await page.locator('#speech').textContent()) ?? '').trim().length).toBeGreaterThan(0);
  await expect(page.locator('#end-dialogue')).not.toBeVisible();
  await ctx.close();
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

test('Table Mountain aspect ratio is 2.3622 in the standard view', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  const ratio = await mountainRatio(page, '.scene-standard .table-mountain');
  expect(ratio).toBeCloseTo(MOUNTAIN_RATIO, 3);
});

test('Table Mountain aspect ratio is 2.3622 in the wide view', async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1080 });
  await page.goto('/');
  const ratio = await mountainRatio(page, '.scene-wide .table-mountain');
  expect(ratio).toBeCloseTo(MOUNTAIN_RATIO, 3);
});

test('Table Mountain aspect ratio is 2.3622 in the tall view', async ({ page }) => {
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
