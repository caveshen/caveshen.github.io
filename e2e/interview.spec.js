import { test, expect } from '@playwright/test';
import { rectsIntersect, visibleRect, rectContains } from './geom.js';

test.beforeEach(async ({ page }) => {
  // Each test gets a fresh browser context (Playwright default), so localStorage is
  // already empty and needs no manual clearing.
  await page.goto('/');
});

test('night theme by default', async ({ page }) => {
  await expect(page.locator('html')).not.toHaveAttribute('data-time', 'day');
  // :visible filters to the active scene — hidden scene variants contain night-only too
  await expect(page.locator('.night-only:visible').first()).toBeVisible();
});

test('toggle switches to day theme', async ({ page }) => {
  await page.locator('#toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-time', 'day');
  // :visible filters to the active scene — hidden scene variants contain day-only too
  await expect(page.locator('.day-only:visible').first()).toBeVisible();
});

test('night-only elements hidden in day mode', async ({ page }) => {
  await page.locator('#toggle').click();
  await expect(page.locator('.night-only').first()).not.toBeVisible();
});

test('theme persists across reload', async ({ page }) => {
  await page.locator('#toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-time', 'day');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-time', 'day');
});

test('stored night choice survives system light-mode preference', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('time', 'night'));
  await page.emulateMedia({ colorScheme: 'light' });
  await page.reload();
  await expect(page.locator('html')).not.toHaveAttribute('data-time', 'day');
});

test('toggle is first in tab order and keyboard-operable', async ({ page }) => {
  await page.keyboard.press('Tab');
  await expect(page.locator('#toggle')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-time', 'day');
});

test('choice buttons are next in tab order after toggle', async ({ page }) => {
  await page.keyboard.press('Tab'); // toggle
  await page.keyboard.press('Tab'); // approach prompt
  await page.keyboard.press('Enter'); // approach — engine focuses first choice
  await expect(page.locator('#choices button').first()).toBeFocused();
});

test('full keyboard dialogue playthrough', async ({ page }) => {
  await page.keyboard.press('Tab'); // toggle
  await page.keyboard.press('Tab'); // approach prompt
  await page.keyboard.press('Enter'); // approach — engine focuses first choice
  await expect(page.locator('#choices button').first()).toBeFocused();

  const rootSpeech = await page.locator('#speech').textContent();
  // Root's line rendered instantly on card-open (never streamed), so this Enter
  // activates the focused choice directly.
  await page.keyboard.press('Enter');

  // Wait for apply() (speech change proves replaceChildren fired) — otherwise the focus
  // check below would race the 200ms fade.
  await expect(page.locator('#speech')).not.toHaveText(rootSpeech ?? '');

  // Fails if the auto-focus fix in dialogue.js is absent.
  await expect(page.locator('#choices button').first()).toBeFocused();

  // The new node's line is streaming now — a keypress mid-stream completes the
  // line, activation needs a completed line, so this Enter only completes it.
  const speechBeforeComplete = await page.locator('#speech').textContent();
  await page.keyboard.press('Enter');
  await expect(page.locator('#choices button.system')).toHaveCount(0);
  await expect(page.locator('#speech')).toHaveText(speechBeforeComplete ?? '');

  await page.keyboard.press('Enter'); // line is complete now — this one activates
  await expect(page.locator('#choices button.system')).toBeVisible();
});

test('focused buttons have visible outline', async ({ page }) => {
  await page.keyboard.press('Tab'); // focus toggle
  const outlineStyle = await page.evaluate(() =>
    window.getComputedStyle(document.activeElement).outlineStyle
  );
  expect(outlineStyle).not.toBe('none');
});

test('blink animation absent under prefers-reduced-motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  const animName = await page.locator('.avatar .eyes').evaluate(el =>
    window.getComputedStyle(el).animationName
  );
  expect(animName).toBe('none');
});

test('dialogue content updates immediately under reduced-motion (no fade delay)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await page.locator('#approach-prompt').click();
  await page.locator('#choices button').first().click();
  const opacity = await page.locator('#speech').evaluate(el =>
    parseFloat(window.getComputedStyle(el).opacity)
  );
  expect(opacity).toBeGreaterThan(0.9);
});

test('no horizontal overflow', async ({ page }) => {
  const overflows = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(overflows).toBe(false);
});

test('root speech visible without JavaScript', async ({ browser }) => {
  const ctx  = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('#speech')).toBeVisible();
  const speech = ((await page.locator('#speech').textContent()) ?? '').trim();
  expect(speech.length).toBeGreaterThan(0);
  await ctx.close();
});

test('/sheet link present without JavaScript (noscript fallback)', async ({ browser }) => {
  const ctx  = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('a[href="/sheet"]')).toBeVisible();
  await ctx.close();
});

test('ultra-wide (2560×1080) shows scene-wide only', async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1080 });
  await page.goto('/');
  await expect(page.locator('.scene-wide')).toBeVisible();
  await expect(page.locator('.scene-standard')).not.toBeVisible();
  await expect(page.locator('.scene-tall')).not.toBeVisible();
});

test('portrait phone (390×844) shows scene-tall, card overlays the scene', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.scene-tall')).toBeVisible();
  await expect(page.locator('.scene-standard')).not.toBeVisible();
  await expect(page.locator('.scene-wide')).not.toBeVisible();
  const sceneBound = await page.locator('.scene-tall').boundingBox();
  // Card is an in-scene overlay (RPG dialogue box), not a block below the scene.
  await page.locator('#approach-prompt').click();
  const card = page.locator('.card');
  await expect(card).toBeVisible();
  const cardBound = await card.boundingBox();
  expect(cardBound.y).toBeLessThan(sceneBound.y + sceneBound.height);
  expect(cardBound.y + cardBound.height).toBeGreaterThan(sceneBound.y);
  expect(cardBound.width).toBeGreaterThan(0);
  expect(cardBound.height).toBeGreaterThan(0);
});

test('portrait tablet (768×1024) shows scene-tall, card overlays the scene', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/');
  await expect(page.locator('.scene-tall')).toBeVisible();
  await expect(page.locator('.scene-standard')).not.toBeVisible();
  const sceneBound = await page.locator('.scene-tall').boundingBox();
  await page.locator('#approach-prompt').click();
  const card = page.locator('.card');
  await expect(card).toBeVisible();
  const cardBound = await card.boundingBox();
  expect(cardBound.y).toBeLessThan(sceneBound.y + sceneBound.height);
  expect(cardBound.y + cardBound.height).toBeGreaterThan(sceneBound.y);
  expect(cardBound.width).toBeGreaterThan(0);
  expect(cardBound.height).toBeGreaterThan(0);
});

test('standard desktop (1920×1080) shows scene-standard only', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  await expect(page.locator('.scene-standard')).toBeVisible();
  await expect(page.locator('.scene-wide')).not.toBeVisible();
  await expect(page.locator('.scene-tall')).not.toBeVisible();
});

test('night/day toggle swaps elements in the visible scene', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  // Night is default — moon group inside scene-standard is visible
  const nightEl = page.locator('.scene-standard .night-only').first();
  await expect(nightEl).toBeVisible();
  await page.locator('#toggle').click();
  await expect(nightEl).not.toBeVisible();
});

// The sky is gradiented (a url() reference), not a flat fill, and stays a
// gradient after the theme toggle re-themes its stops.
test('sky fill is a gradient reference, not a flat colour, in both themes', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  const skyFill = () => page.locator('.scene-standard .f-sky').evaluate((el) => getComputedStyle(el).fill);
  expect(await skyFill()).toMatch(/^url\(/);
  await page.locator('#toggle').click();
  expect(await skyFill()).toMatch(/^url\(/);
});

// Near buildings, far mountains, and the warehouse fringe are three visibly
// distinct tones (not two-tone bands), in both themes.
test('near, far, and fringe silhouettes are three pairwise-distinct tones, in both themes', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  const fills = () => page.evaluate(() => {
    const sel = (cls) => getComputedStyle(document.querySelector(`.scene-standard ${cls}`)).fill;
    return [sel('.f-near'), sel('.f-far'), sel('.f-fringe')];
  });
  expect(new Set(await fills()).size).toBe(3);
  await page.locator('#toggle').click();
  expect(new Set(await fills()).size).toBe(3);
});

// Each building has a darker side-face strip, distinct from its own front-face
// fill, in both themes — regression-prone since both are generated from the
// same BUILDINGS entry rather than authored separately.
test('building side-face fill is distinct from the front-face fill, in both themes', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  const fills = () => page.evaluate(() => {
    const sel = (cls) => getComputedStyle(document.querySelector(`.scene-standard ${cls}`)).fill;
    return [sel('.f-near'), sel('.f-bld-shade')];
  });
  const [front, shade] = await fills();
  expect(shade).not.toBe(front);
  await page.locator('#toggle').click();
  const [frontDay, shadeDay] = await fills();
  expect(shadeDay).not.toBe(frontDay);
});

// Regression guard: the post shadow's night opacity was once folded down to an
// imperceptible 0.088 — invisible against the near-black night ground.
test('rail post shadow opacity clears a visibility floor, in both themes', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  const opacity = () => page.locator('.scene-standard .f-rail-shadow ellipse').first()
    .evaluate((el) => parseFloat(getComputedStyle(el).opacity));
  expect(await opacity()).toBeGreaterThanOrEqual(0.25);
  await page.locator('#toggle').click();
  expect(await opacity()).toBeGreaterThanOrEqual(0.25);
});

test('no horizontal overflow at ultra-wide (2560×1080)', async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1080 });
  await page.goto('/');
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(overflow).toBe(false);
});

for (const vp of [
  { name: 'wide (2560×1080)',     width: 2560, height: 1080 },
  { name: 'standard (1920×1080)', width: 1920, height: 1080 },
  { name: 'tall (390×844)',       width: 390,  height: 844  },
]) {
  test(`approach prompt does not overlap the figure — ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/');
    const promptBox = await page.locator('#approach-prompt').boundingBox();
    const figureBox = await visibleRect(page, '.js-character');
    const frameBox  = await page.locator('.stage-frame').boundingBox();
    expect(rectsIntersect(promptBox, figureBox)).toBe(false);
    // The clamp must not push the prompt out of the scene.
    expect(rectContains(frameBox, promptBox)).toBe(true);
  });
}

// positionPrompt()'s beside-the-figure fallback (the "not enough headroom above the
// head" branch) sets top but never clamps left/right, so it could leave .stage-frame.
// At 240×280 the standard-variant stage-frame is small enough (it's always exactly the
// full-bleed viewport) that headroom is less than the gap + button height, forcing the
// fallback branch — so this test only holds if that clamp keeps working.
test('beside-the-figure fallback keeps the prompt inside the stage frame — forced narrow viewport (240×280)', async ({ page }) => {
  await page.setViewportSize({ width: 240, height: 280 });
  await page.goto('/');
  const promptBox = await page.locator('#approach-prompt').boundingBox();
  const frameBox  = await page.locator('.stage-frame').boundingBox();
  expect(rectContains(frameBox, promptBox)).toBe(true);
});

// Full-window is the DEFAULT, not a toggle: the stage-frame is always exactly
// the viewport's width AND height, at every aspect. Each scene's own
// preserveAspectRatio="xMidYMax slice" crops rather than stretches to fit
// whatever box that is — proved below, and separately by the Table Mountain
// 2.4194 invariant in approach.spec.js.

const FULL_WINDOW_VIEWPORTS = [
  { name: 'ultra-wide (2560×1080)',    width: 2560, height: 1080 },
  { name: 'standard (1920×1080)',      width: 1920, height: 1080 },
  { name: 'tall window (1200×1400)',   width: 1200, height: 1400 },
  { name: 'portrait (390×844)',        width: 390,  height: 844  },
];

for (const vp of FULL_WINDOW_VIEWPORTS) {
  test(`stage-frame fills 100% of the viewport — ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/');
    const box = await page.locator('.stage-frame').boundingBox();
    expect(box.width).toBeCloseTo(vp.width, 0);
    expect(box.height).toBeCloseTo(vp.height, 0);
  });

  test(`no horizontal page overflow — ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/');
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(overflow).toBe(false);
  });
}

test('ultra-wide (2560×1080) has no page scroll, vertical or horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1080 });
  await page.goto('/');
  const overflow = await page.evaluate(() => ({
    v: document.documentElement.scrollHeight > document.documentElement.clientHeight,
    h: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  expect(overflow.v).toBe(false);
  expect(overflow.h).toBe(false);
});

// 1200×1400 (aspect 0.857) is above the tall breakpoint's 4/5=0.8 cut-off, so it must
// still select the standard variant, not tall — worth confirming since full-bleed
// sizing makes this viewport's crop look nothing like the scene's own 1200×750 aspect.
test('tall window (1200×1400) still selects scene-standard, not scene-tall', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 1400 });
  await page.goto('/');
  await expect(page.locator('.scene-standard')).toBeVisible();
  await expect(page.locator('.scene-wide')).not.toBeVisible();
  await expect(page.locator('.scene-tall')).not.toBeVisible();
});

// The one representative viewport not already covered by approach.spec.js's checks:
// 1200×1400 puts the standard scene (1200×750, aspect 1.6) inside a box of aspect 0.857,
// about as far from its own aspect as this task's viewports get — a ratio that still
// comes out at 2.3622 here is good proof the fill crops rather than stretches.
test('Table Mountain aspect ratio (2.3622) still holds at 1200×1400', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 1400 });
  await page.goto('/');
  const box = await page.locator('.scene-standard .table-mountain').evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { width: r.width, height: r.height };
  });
  expect(box.height).toBeGreaterThan(0);
  expect(box.width / box.height).toBeCloseTo(2.3622, 3);
});

// Re-prove the figure and dialogue card survive full-bleed cropping at the two most
// extreme tested aspects. xMidYMax anchoring crops sky/sea off the top (never the
// bottom-anchored foreground) and centres horizontal cropping on the authored world's
// midpoint, where the figure already sits.
for (const vp of [
  { name: 'ultra-wide (2560×1080)', width: 2560, height: 1080 },
  { name: 'portrait (390×844)',     width: 390,  height: 844  },
]) {
  test(`figure and dialogue card are not clipped by the crop — ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/');
    const viewport = { x: 0, y: 0, width: vp.width, height: vp.height };
    const figureBox = await visibleRect(page, '.js-character');
    expect(rectContains(viewport, figureBox)).toBe(true);

    await page.locator('#approach-prompt').click();
    const cardBox = await page.locator('.card').boundingBox();
    expect(rectContains(viewport, cardBox)).toBe(true);
  });
}

// Run at all four tested aspects, not just 1920×1080: the fullscreen button relocates to
// top:4rem under the portrait (max-aspect-ratio:4/5) override, so the corners it can
// collide with genuinely differ by aspect.
for (const vp of [
  { name: '1920×1080',           width: 1920, height: 1080 },
  { name: 'ultra-wide 2560×1080', width: 2560, height: 1080 },
  { name: 'tall 1200×1400',       width: 1200, height: 1400 },
  { name: 'portrait 390×844',     width: 390,  height: 844  },
]) {
  test(`theme toggle, footer, and fullscreen button do not overlap each other — ${vp.name}`, async ({ page }) => {
    await forceFullscreenEnabled(page);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/');
    const toggleBox = await page.locator('#toggle').boundingBox();
    const footBox   = await page.locator('.page-foot').boundingBox();
    const fsBox     = await page.locator('#fullscreen-toggle').boundingBox();
    expect(rectsIntersect(toggleBox, footBox)).toBe(false);
    expect(rectsIntersect(toggleBox, fsBox)).toBe(false);
    expect(rectsIntersect(footBox, fsBox)).toBe(false);
  });
}

test.describe('no page scroll at 1920×1080 and 2560×1440', () => {
  for (const vp of [{ width: 1920, height: 1080 }, { width: 2560, height: 1440 }]) {
    test(`${vp.width}×${vp.height}`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto('/');
      const overflow = await page.evaluate(() => ({
        v: document.documentElement.scrollHeight > document.documentElement.clientHeight,
        h: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      }));
      expect(overflow.v).toBe(false);
      expect(overflow.h).toBe(false);
    });
  }
});

// The zoomed face must clear the dialogue card that overlays it.
for (const vp of [
  { name: 'standard (1920×1080)', width: 1920, height: 1080 },
  { name: 'tall (390×844)',       width: 390,  height: 844  },
]) {
  test(`face clears the dialogue card after approach — ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    // Reduced motion turns off the .camera transition, so the transform applies
    // instantly — a settled state with no timing wait needed.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.locator('#approach-prompt').click();
    const cardBox = await page.locator('.card').boundingBox();
    const faceBox = await visibleRect(page, '.face-void');
    expect(rectsIntersect(faceBox, cardBox)).toBe(false);
  });
}

// Real OS fullscreen is unreliable/vacuous in a headless matrix, so these tests assert
// what's deterministic: presence/position/labelling, geometric non-occlusion, the
// click→requestFullscreen wiring (stubbed), the fullscreenchange→label/glyph sync
// (simulated, not real fullscreen), honest degradation, and the no-JS path.

// fullscreenEnabled is forced true up front since real support varies by engine/platform
// (WebKit on iOS-style devices honestly degrades — see the dedicated test below); the
// button's own position/focusability/non-occlusion don't depend on that.
async function forceFullscreenEnabled(page) {
  await page.addInitScript(() => {
    Object.defineProperty(document, 'fullscreenEnabled', { get: () => true });
  });
}

test('fullscreen button is present, near the bottom-right corner, with an accessible label', async ({ page }) => {
  await forceFullscreenEnabled(page);
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  const btn = page.locator('#fullscreen-toggle');
  await expect(btn).toBeVisible();
  await expect(btn).toHaveAttribute('aria-label', 'Enter fullscreen');
  const box   = await btn.boundingBox();
  // Measured against .stage-frame, not the raw viewport — the button must live inside
  // .stage-frame to stay visible/operable once real fullscreen is entered, and the frame
  // is full-bleed by default too, so its corner already IS the viewport's corner.
  const frame = await page.locator('.stage-frame').boundingBox();
  expect(box.x + box.width).toBeGreaterThan(frame.x + frame.width - 100);
  expect(box.y + box.height).toBeGreaterThan(frame.y + frame.height - 100);
});

test('fullscreen button is keyboard-focusable with a visible outline', async ({ page }) => {
  await forceFullscreenEnabled(page);
  await page.goto('/');
  await page.locator('#fullscreen-toggle').focus();
  await expect(page.locator('#fullscreen-toggle')).toBeFocused();
  const outlineStyle = await page.evaluate(() =>
    window.getComputedStyle(document.activeElement).outlineStyle
  );
  expect(outlineStyle).not.toBe('none');
});

for (const vp of [
  { name: 'wide (2560×1080)',     width: 2560, height: 1080 },
  { name: 'standard (1920×1080)', width: 1920, height: 1080 },
  { name: 'tall (390×844)',       width: 390,  height: 844  },
]) {
  test(`fullscreen button does not overlap the figure, prompt, or card — ${vp.name}`, async ({ page }) => {
    await forceFullscreenEnabled(page);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/');
    const btnBox = await page.locator('#fullscreen-toggle').boundingBox();
    const figureBox = await visibleRect(page, '.js-character');
    expect(rectsIntersect(btnBox, figureBox)).toBe(false);
    const promptBox = await page.locator('#approach-prompt').boundingBox();
    expect(rectsIntersect(btnBox, promptBox)).toBe(false);

    await page.locator('#approach-prompt').click();
    const cardBox = await page.locator('.card').boundingBox();
    expect(rectsIntersect(btnBox, cardBox)).toBe(false);
  });
}

test('clicking the fullscreen button calls requestFullscreen on the stage', async ({ page }) => {
  // Stubbed before any page script runs — this test is only about the click wiring, not
  // real platform support.
  await page.addInitScript(() => {
    window.__rfCalls = 0;
    Object.defineProperty(document, 'fullscreenEnabled', { get: () => true });
    Element.prototype.requestFullscreen = function () {
      window.__rfCalls += 1;
      return Promise.resolve();
    };
  });
  await page.goto('/');
  await page.locator('#fullscreen-toggle').click();
  const calls = await page.evaluate(() => window.__rfCalls);
  expect(calls).toBe(1);
});

test('a simulated fullscreenchange event flips the glyph and aria-label — including the Escape path', async ({ page }) => {
  // document.fullscreenElement is stubbed to a settable flag and fullscreenchange is
  // dispatched by hand — proves the *handler* independent of real headless fullscreen
  // support, and covers leaving via Escape (which never calls the button's own handler).
  await page.addInitScript(() => {
    window.__fsEl = null;
    Object.defineProperty(document, 'fullscreenEnabled', { get: () => true });
    Object.defineProperty(document, 'fullscreenElement', { get: () => window.__fsEl });
  });
  await page.goto('/');
  const btn = page.locator('#fullscreen-toggle');
  await expect(btn).toHaveAttribute('aria-label', 'Enter fullscreen');

  await page.evaluate(() => {
    window.__fsEl = document.querySelector('.stage-frame');
    document.dispatchEvent(new Event('fullscreenchange'));
  });
  await expect(btn).toHaveAttribute('aria-label', 'Exit fullscreen');

  await page.evaluate(() => {
    window.__fsEl = null; // simulates Escape, not a click on our button
    document.dispatchEvent(new Event('fullscreenchange'));
  });
  await expect(btn).toHaveAttribute('aria-label', 'Enter fullscreen');
});

test('fullscreenEnabled=false: the button is never revealed', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(document, 'fullscreenEnabled', { get: () => false });
  });
  await page.goto('/');
  await expect(page.locator('#fullscreen-toggle')).not.toBeVisible();
});

test('no-JS: fullscreen button is absent', async ({ browser }) => {
  const ctx  = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('#fullscreen-toggle')).not.toBeVisible();
  await ctx.close();
});

// Cubic-bezier evaluator, local to this spec (test-only — the shipped code
// never needs to evaluate its own curve, only apply it via CSS). X(t) is the
// elapsed-time fraction, Y(t) is progress; CSS solves X(t)=x for t then
// returns Y(t), so we do the same via bisection on the monotonic X(t).
function bezierProgressAt(p1x, p1y, p2x, p2y, durationMs, elapsedMs) {
  const x = elapsedMs / durationMs;
  const X = (t) => { const m = 1 - t; return 3 * m * m * t * p1x + 3 * m * t * t * p2x + t ** 3; };
  const Y = (t) => { const m = 1 - t; return 3 * m * m * t * p1y + 3 * m * t * t * p2y + t ** 3; };
  let lo = 0, hi = 1;
  // 30 halvings takes the interval below 1e-9 — far past what a percentage
  // threshold needs, and past float64's useful precision here anyway.
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (X(mid) < x) lo = mid; else hi = mid;
  }
  return Y((lo + hi) / 2);
}

// Parses a computed `transition` shorthand (e.g. "transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)")
// into duration (ms) and the four bezier control-point numbers.
function parseTransition(css) {
  const durationMatch = css.match(/([\d.]+)s\b/);
  const bezierMatch   = css.match(/cubic-bezier\(([^)]+)\)/);
  const [p1x, p1y, p2x, p2y] = bezierMatch[1].split(',').map(Number);
  return { durationMs: parseFloat(durationMatch[1]) * 1000, p1x, p1y, p2x, p2y };
}

async function computedTransition(page, approached) {
  if (approached) await page.locator('#approach-prompt').click();
  else await page.locator('#end-dialogue').click();
  return page.locator('.camera').evaluate((el) => getComputedStyle(el).transition);
}

test('entry easing starts from rest — advances less than 4% in the first frame (16ms)', async ({ page }) => {
  const css = await computedTransition(page, true);
  const { durationMs, p1x, p1y, p2x, p2y } = parseTransition(css);
  const pct = bezierProgressAt(p1x, p1y, p2x, p2y, durationMs, 16) * 100;
  expect(pct).toBeLessThan(4);
});

// Contrast case: the exit curve is deliberately NOT eased from rest (a fast departure
// that settles reads as a natural retreat) — documents *why* entry and exit can't share
// a curve, so it fails loudly if someone later "simplifies" by unifying them.
test('exit easing (unchanged) advances more than 10% in the first frame (16ms), by contrast', async ({ page }) => {
  await page.locator('#approach-prompt').click();
  const css = await computedTransition(page, false);
  const { durationMs, p1x, p1y, p2x, p2y } = parseTransition(css);
  const pct = bezierProgressAt(p1x, p1y, p2x, p2y, durationMs, 16) * 100;
  expect(pct).toBeGreaterThan(10);
});

test('entry and exit have different computed transitions', async ({ page }) => {
  const entryCss = await computedTransition(page, true);
  const exitCss  = await computedTransition(page, false);
  expect(entryCss).not.toBe(exitCss);
});

test('exit computed transition matches the unchanged, approved 950ms curve', async ({ page }) => {
  await page.locator('#approach-prompt').click();
  const css = await computedTransition(page, false);
  const { durationMs, p1x, p1y, p2x, p2y } = parseTransition(css);
  expect(durationMs).toBeCloseTo(950, 0);
  expect([p1x, p1y, p2x, p2y]).toEqual([0.16, 1, 0.3, 1]);
});

test('prefers-reduced-motion skips the camera transition entirely, entry and exit', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await page.locator('#approach-prompt').click();
  const entryTransition = await page.locator('.camera').evaluate((el) => getComputedStyle(el).transitionDuration);
  expect(entryTransition).toBe('0s');
  await page.locator('#end-dialogue').click();
  const exitTransition = await page.locator('.camera').evaluate((el) => getComputedStyle(el).transitionDuration);
  expect(exitTransition).toBe('0s');
});

test('Escape mid-zoom leaves the camera coherent — no stuck or doubled transform', async ({ page }) => {
  await page.locator('#approach-prompt').click();
  // Interrupt before the 550ms entry transition settles — 100ms leaves 450ms of slack
  // before it would complete on its own.
  await page.waitForTimeout(100);
  await page.keyboard.press('Escape');
  // Retry instead of guessing a settle duration — 'none' is the exited state's target,
  // a single coherent value rather than stuck mid-transition or doubled/compounded.
  await expect(async () => {
    const transform = await page.locator('.camera').evaluate((el) => getComputedStyle(el).transform);
    expect(transform).toBe('none');
  }).toPass();
});
