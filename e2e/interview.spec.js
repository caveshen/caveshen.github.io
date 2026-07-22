import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Each test gets a fresh browser context (Playwright default) so localStorage
  // is already empty — no need to clear it manually.
  await page.goto('/');
});

// ── Theme (criterion 5) ────────────────────────────────────────────────────────

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
  // Night-only elements should not be visible
  await expect(page.locator('.night-only').first()).not.toBeVisible();
});

test('theme persists across reload', async ({ page }) => {
  await page.locator('#toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-time', 'day');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-time', 'day');
});

test('stored night choice survives system light-mode preference', async ({ page }) => {
  // Explicit night stored in localStorage
  await page.evaluate(() => localStorage.setItem('time', 'night'));
  await page.emulateMedia({ colorScheme: 'light' });
  await page.reload();
  // localStorage wins — stays night
  await expect(page.locator('html')).not.toHaveAttribute('data-time', 'day');
});

// ── Keyboard (criterion 2) ────────────────────────────────────────────────────

test('toggle is first in tab order and keyboard-operable', async ({ page }) => {
  await page.keyboard.press('Tab');
  await expect(page.locator('#toggle')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-time', 'day');
});

test('choice buttons are next in tab order after toggle', async ({ page }) => {
  // P4: toggle → approach prompt → approach → first choice (card hidden on load)
  await page.keyboard.press('Tab'); // toggle
  await page.keyboard.press('Tab'); // approach prompt
  await page.keyboard.press('Enter'); // approach — engine focuses first choice (SC5)
  await expect(page.locator('#choices button').first()).toBeFocused();
});

test('full keyboard dialogue playthrough', async ({ page }) => {
  // P4: approach first, then play through the dialogue by keyboard
  await page.keyboard.press('Tab'); // toggle
  await page.keyboard.press('Tab'); // approach prompt
  await page.keyboard.press('Enter'); // approach — engine focuses first choice (SC5)
  await expect(page.locator('#choices button').first()).toBeFocused();

  const rootSpeech = await page.locator('#speech').textContent();
  await page.keyboard.press('Enter');

  // Wait for apply() to run (speech change proves replaceChildren has fired).
  // Without this wait the focus check below would race with the 200ms fade.
  await expect(page.locator('#speech')).not.toHaveText(rootSpeech ?? '');

  // Engine must auto-focus the first new button so keyboard users can continue.
  // This assertion FAILS if the focus fix in dialogue.js is absent.
  await expect(page.locator('#choices button').first()).toBeFocused();
  await page.keyboard.press('Enter');

  // Back at root — system button present
  await expect(page.locator('#choices button.system')).toBeVisible();
});

test('focused buttons have visible outline', async ({ page }) => {
  await page.keyboard.press('Tab'); // focus toggle
  const outlineStyle = await page.evaluate(() =>
    window.getComputedStyle(document.activeElement).outlineStyle
  );
  expect(outlineStyle).not.toBe('none');
});

// ── Reduced motion (criterion 3) ──────────────────────────────────────────────

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
  // P4: approach first (card is hidden on load), then interact with choices
  await page.locator('#approach-prompt').click();
  await page.locator('#choices button').first().click();
  // Opacity should be 1 immediately — no fade delay
  const opacity = await page.locator('#speech').evaluate(el =>
    parseFloat(window.getComputedStyle(el).opacity)
  );
  expect(opacity).toBeGreaterThan(0.9);
});

// ── Layout / overflow ─────────────────────────────────────────────────────────

test('no horizontal overflow', async ({ page }) => {
  const overflows = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(overflows).toBe(false);
});

// ── No-JS path ────────────────────────────────────────────────────────────────

test('root speech visible without JavaScript', async ({ browser }) => {
  const ctx  = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('#speech')).toBeVisible();
  await expect(page.locator('#speech')).toContainText('PLACEHOLDER');
  await ctx.close();
});

test('/sheet link present without JavaScript (noscript fallback)', async ({ browser }) => {
  const ctx  = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  // noscript content is rendered when JS disabled
  await expect(page.locator('a[href="/sheet"]')).toBeVisible();
  await ctx.close();
});

// ── Aspect-ratio scene variants (PRD §3) ─────────────────────────────────────

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
  // P4 restage: card is an in-scene overlay (RPG dialogue box), not a block
  // below the scene — approach to reveal it, then assert it overlaps the
  // scene's bounds and is readable (visible, non-zero size).
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
  // P4 restage: card is an in-scene overlay — approach, then assert overlap.
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

test('no horizontal overflow at ultra-wide (2560×1080)', async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1080 });
  await page.goto('/');
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(overflow).toBe(false);
});

// ── PRD §15 D1/D2 — known-defect regression tests ─────────────────────────────

// Rect-intersection helper, local to this spec (ponytail: shared by both tests
// below, not worth a module for two call sites).
function rectsIntersect(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x &&
         a.y < b.y + b.height && a.y + a.height > b.y;
}

function rectContains(outer, inner) {
  return inner.x >= outer.x && inner.y >= outer.y &&
         inner.x + inner.width  <= outer.x + outer.width &&
         inner.y + inner.height <= outer.y + outer.height;
}

// Several .hooded-figure / .face-void copies exist (one per scene variant) —
// only the one in the visible scene has a non-zero box. Mirrors the lookup
// index.astro's own script already does.
async function visibleRect(page, selector) {
  return page.evaluate((sel) => {
    const el = [...document.querySelectorAll(sel)].find((e) => e.getBoundingClientRect().width > 0);
    const r  = el.getBoundingClientRect();
    return { x: r.left, y: r.top, width: r.width, height: r.height };
  }, selector);
}

// D1 — approach prompt must clear the figure's head, in all three aspect variants.
for (const vp of [
  { name: 'wide (2560×1080)',     width: 2560, height: 1080 },
  { name: 'standard (1920×1080)', width: 1920, height: 1080 },
  { name: 'tall (390×844)',       width: 390,  height: 844  },
]) {
  test(`approach prompt does not overlap the figure — ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/');
    const promptBox = await page.locator('#approach-prompt').boundingBox();
    const figureBox = await visibleRect(page, '.hooded-figure');
    const frameBox  = await page.locator('.stage-frame').boundingBox();
    expect(rectsIntersect(promptBox, figureBox)).toBe(false);
    // The clamp must not push the prompt out of the scene.
    expect(rectContains(frameBox, promptBox)).toBe(true);
  });
}

// Reviewer follow-up 1b — positionPrompt()'s beside-the-figure fallback (the
// "not enough headroom above the head" branch) sets top but never clamped
// left/right, so it could leave .stage-frame. At 240×280 the standard-variant
// stage-frame is small enough (150px tall) that the headroom above the head
// is less than the gap + button height, forcing the fallback branch — proven
// by the same overlap check above still holding at this size.
// PRD §17.1a: height was raised from 160 to 280 — under the new height-limited
// max-width formula, 160px of viewport height is mostly eaten by the 120px
// reserve, producing a degenerate ~64px-wide frame that's smaller than the
// prompt button itself (a frame no real window would ever present at this
// aspect). 280px keeps the same 240×150 frame this test was written against,
// by staying in the width-bound branch of the formula (100% < height-formula).
test('beside-the-figure fallback keeps the prompt inside the stage frame — forced narrow viewport (240×280)', async ({ page }) => {
  await page.setViewportSize({ width: 240, height: 280 });
  await page.goto('/');
  const promptBox = await page.locator('#approach-prompt').boundingBox();
  const frameBox  = await page.locator('.stage-frame').boundingBox();
  expect(rectContains(frameBox, promptBox)).toBe(true);
});

// ── PRD §17.1 — wide variant goes full-bleed ─────────────────────────────────
// The 1200px cap stops applying at the 21:9 breakpoint; the stage grows until
// limited by available height instead, so it never exceeds the viewport.

test('ultra-wide (2560×1080) stage-frame grows beyond 1200px, bounded by viewport height', async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1080 });
  await page.goto('/');
  const box = await page.locator('.stage-frame').boundingBox();
  expect(box.width).toBeGreaterThan(1400); // meaningfully greater than the 1200px cap
  expect(box.height).toBeLessThanOrEqual(1080);
});

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

// PRD §17.1a SUPERSEDES the test that used to live here ("standard desktop
// stage-frame geometry is unchanged", asserting 1200×750). That baseline was
// captured for §17.1, which scoped the height-limited fit to the wide variant
// only — §17.1a rules that scoping wrong: it left ordinary 16:9 desktops in
// exactly the top-strip state §17.1 was meant to fix. The standard variant's
// geometry is *supposed* to change now; the tests below assert the new,
// accepted target instead of the old one.

test('portrait phone (390×844) stage-frame geometry is unchanged', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const box = await page.locator('.stage-frame').boundingBox();
  expect(box.width).toBeCloseTo(390, 0);
  expect(box.height).toBeCloseTo(693.5, 0);
});

// Wide variant (2560×1080) baseline, captured from the §17.1-built code
// before §17.1a — the wide variant is explicitly out of scope for §17.1a and
// must render byte-identically.
test('wide (2560×1080) stage-frame geometry is unchanged by §17.1a', async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1080 });
  await page.goto('/');
  const box = await page.locator('.stage-frame').boundingBox();
  expect(box.width).toBeCloseTo(2240, 0);
  expect(box.height).toBeCloseTo(960, 0);
});

// ── PRD §17.1a — standard variant gets the height-limited fit too ───────────

test('standard desktop (1920×1080) stage-frame is ≥80% of viewport width', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  const box = await page.locator('.stage-frame').boundingBox();
  expect(box.width).toBeGreaterThanOrEqual(1920 * 0.8);
});

// The old top-aligned layout let ALL slack pool below the footer — at
// 1920×1080 under the old 1200px cap that was ~214px of dead space between
// the footer and the viewport bottom. The height-limited max-width mostly
// closes that gap by itself (the stage grows to use the freed budget); the
// centring is what accounts for whatever small remainder is left, splitting
// it instead of dumping it all below. Assert the pooled gap stays small
// (bounded well under the old ~214px) rather than exact pixel symmetry
// between two edges that carry different fixed margins (stage-frame's 1rem
// top vs the footer's own 2.5rem bottom) by design.
test('standard desktop (1920×1080) has no dead space pooled below the footer', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  const gapBelowFooter = await page.evaluate(() => {
    const foot = document.querySelector('.page-foot').getBoundingClientRect();
    return window.innerHeight - foot.bottom;
  });
  expect(gapBelowFooter).toBeLessThan(60);
});

// §17.1a centring guard. At 16:9 the height-limited fit already fills almost
// the whole height, so centring only nudges the frame a few px and no test can
// tell it from top-aligned there (that gap is why this test exists). Centring
// is only *measurable* when the standard-aspect frame leaves real vertical
// slack — i.e. a tall-but-still-standard window. At 1200×1400 the frame is
// 750 tall in 1400px: centred splits the ~590px slack ≈283 above / ≈307 below;
// top-aligned would be 16 above / ≈574 below. Assert the split is roughly even
// — this FAILS (558px asymmetry) the moment the centring rule is removed.
test('standard-aspect frame is vertically centred when the window leaves slack', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 1400 }); // aspect 0.857 → standard variant
  await page.goto('/');
  await expect(page.locator('.scene-standard')).toBeVisible();
  const { gapAbove, gapBelowFooter } = await page.evaluate(() => {
    const f = document.querySelector('.stage-frame').getBoundingClientRect();
    const foot = document.querySelector('.page-foot').getBoundingClientRect();
    return { gapAbove: f.top, gapBelowFooter: window.innerHeight - foot.bottom };
  });
  // Both gaps are large (proves it's not top-aligned) and near-symmetric.
  expect(gapAbove).toBeGreaterThan(150);
  expect(Math.abs(gapAbove - gapBelowFooter)).toBeLessThan(80);
});

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

// D2 — the zoomed face must clear the dialogue card that overlays it.
for (const vp of [
  { name: 'standard (1920×1080)', width: 1920, height: 1080 },
  { name: 'tall (390×844)',       width: 390,  height: 844  },
]) {
  test(`face clears the dialogue card after approach — ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    // Reduced motion turns off the .camera transition (see index.astro CSS),
    // so the transform applies instantly — a settled state with no timing wait.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.locator('#approach-prompt').click();
    const cardBox = await page.locator('.card').boundingBox();
    const faceBox = await visibleRect(page, '.face-void');
    expect(rectsIntersect(faceBox, cardBox)).toBe(false);
  });
}

// ── PRD §18 — fullscreen toggle button ───────────────────────────────────────
// Real OS fullscreen is unreliable/vacuous in a headless matrix (PRD's own
// testing note), so these assert what's deterministic: presence/position/
// labelling, geometric non-occlusion, the click→requestFullscreen wiring
// (stubbed), the fullscreenchange→label/glyph sync (simulated, not real
// fullscreen), honest degradation, and the no-JS path.

// These tests force fullscreenEnabled=true up front — real support varies by
// engine/platform (notably WebKit on iOS-style devices, honestly absent
// there per the dedicated degrade test below), and the button's own
// position/focusability/non-occlusion are independent of that, so they
// should hold across the whole matrix rather than only where the platform
// happens to support the real API.
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
  // "Bottom-right of the screen" — measured against .stage-frame, not the
  // raw viewport: the button lives inside .stage-frame (it must, to stay
  // visible/operable once real fullscreen is entered — see the markup
  // comment), and outside fullscreen the frame is ~80% of viewport width by
  // design (PRD §17.1a), not edge-to-edge. Its corner IS the screen's corner
  // the moment fullscreen is actually entered.
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

// Non-occlusion (§16 hypothesis, geometrically assertable) across all three
// aspect variants, against whichever of {approach prompt, card} is on screen.
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
    const figureBox = await visibleRect(page, '.hooded-figure');
    expect(rectsIntersect(btnBox, figureBox)).toBe(false);
    const promptBox = await page.locator('#approach-prompt').boundingBox();
    expect(rectsIntersect(btnBox, promptBox)).toBe(false);

    await page.locator('#approach-prompt').click();
    const cardBox = await page.locator('.card').boundingBox();
    expect(rectsIntersect(btnBox, cardBox)).toBe(false);
  });
}

test('clicking the fullscreen button calls requestFullscreen on the stage', async ({ page }) => {
  // Stub before any page script runs. fullscreenEnabled is also forced true
  // here — real support varies by engine/platform (notably WebKit on iOS-
  // style devices, which the matrix includes and which honestly degrades,
  // per its own dedicated test below) — this test is only about the click
  // wiring, so it shouldn't depend on a given project's real API support.
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
  // No real OS fullscreen involved: document.fullscreenElement is stubbed to
  // a settable flag, and fullscreenchange is dispatched by hand. This proves
  // the *handler*, independent of whether the browser can truly go
  // fullscreen headless — and covers leaving via Escape (which never calls
  // the button's own click handler, only fires the event).
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

// ── PRD §21 — camera zoom easing, split by direction ──────────────────────────

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

// Contrast case: the exit curve is approved as-is and deliberately NOT eased
// from rest (a fast departure that settles reads as a natural retreat). This
// documents *why* entry and exit can't share a curve — it fails loudly if
// someone later "simplifies" by unifying them.
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
  // Interrupt before the (550ms) entry transition settles.
  await page.waitForTimeout(100);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(700); // let any in-flight transition finish settling
  const transform = await page.locator('.camera').evaluate((el) => getComputedStyle(el).transform);
  // 'none' is the exited state's target — a single coherent value, not stuck
  // mid-transition and not some doubled/compounded matrix.
  expect(transform).toBe('none');
});
