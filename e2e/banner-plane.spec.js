// Ambient banner plane — e2e tests
// Uses Playwright's clock API to fast-forward the JS setTimeout chain
// deterministically rather than waiting real wall-clock minutes.
import { test, expect } from '@playwright/test';

// Forces a landscape viewport — several mobile/tablet projects default to
// portrait, where the plane is CSS-suppressed (see the dedicated portrait
// test below), which would make every other assertion here meaningless.
async function gotoAndFireFirstPass(page) {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.clock.install();
  await page.goto('/');
  await page.clock.fastForward(10_000);
}

test('a scheduled pass appears and animates while zoomed out', async ({ page }) => {
  await gotoAndFireFirstPass(page);
  const plane = page.locator('.banner-plane');
  await expect(plane).toBeAttached();
  await expect(plane).toContainText('MAVERICKS');
  const animationName = await plane.evaluate((el) => getComputedStyle(el).animationName);
  expect(animationName).toBe('plane-fly');
});

test('approaching before any pass has fired never shows a plane', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  await page.locator('#approach-prompt').click();
  await page.clock.fastForward(10_000);
  await expect(page.locator('.banner-plane')).toHaveCount(0);
});

test('an in-flight pass fades out on approach rather than freezing or vanishing', async ({ page }) => {
  await gotoAndFireFirstPass(page);
  const plane = page.locator('.banner-plane');
  await expect(plane).toBeAttached();
  await page.locator('#approach-prompt').click();
  await expect(plane).toHaveClass(/plane-fade-out/);
  // Checks the declared transition rather than sampling mid-flight — CSS transitions run
  // on the compositor and aren't faked by page.clock, so a wall-clock sleep here would
  // race the real 400ms window.
  await expect(plane).toHaveCSS('transition-duration', '0.4s');
  await expect(plane).toHaveCSS('transition-property', 'opacity');
  // transitionend (which drives removal) only fires for a transition that actually ran,
  // so reaching count 0 confirms the fade played out rather than freezing mid-sky.
  await expect(plane).toHaveCount(0);
});

test('no plane fires under prefers-reduced-motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await page.goto('/');
  await page.clock.fastForward(10_000);
  await expect(page.locator('.banner-plane')).toHaveCount(0);
});

test('a fired pass is not visible on a portrait viewport', async ({ page }) => {
  await gotoAndFireFirstPass(page); // landscape, so the pass actually fires
  await page.setViewportSize({ width: 390, height: 844 }); // then narrow to portrait
  // The element may still exist (JS doesn't check aspect ratio — CSS does),
  // but it must never actually be visible on the narrow tall scene.
  await expect(page.locator('.banner-plane')).not.toBeVisible();
});

test('the plane is pointer-events: none and never blocks the approach prompt', async ({ page }) => {
  await gotoAndFireFirstPass(page);
  await expect(page.locator('.banner-plane')).toHaveCSS('pointer-events', 'none');
  // Click through where the plane sits, confirming the scene beneath is still interactive.
  await page.locator('#approach-prompt').click();
  await expect(page.locator('.card')).toBeVisible();
});

test('no-JS: no plane element exists in the DOM', async ({ browser }) => {
  const ctx  = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('.banner-plane')).toHaveCount(0);
  await ctx.close();
});

// d30: click-to-crash easter egg.

test('clicking the plane mid-flight crashes it, ending below the waterline, then removes it', async ({ page }) => {
  await gotoAndFireFirstPass(page);
  const plane = page.locator('.banner-plane');
  await expect(plane).toBeAttached();

  // d30 fix: crashPlane() bakes the in-flight position from .plane-hit's own
  // rect, sampled before .banner-rect/.banner-tow are reparented out. Sample
  // both rects either side of the click and compare their drift in lockstep
  // (below) — that's what actually guards the fix now.
  const sampleRects = () => page.evaluate(() => {
    const r = (el) => el && { x: el.getBoundingClientRect().x, y: el.getBoundingClientRect().y };
    return {
      hit: r(document.querySelector('.plane-hit')),
      banner: r(document.querySelector('.banner-rect')),
    };
  });

  // Seek to mid-flight so the plane is over the frame, then pause for a stationary click.
  // WAAPI currentTime seeks a CSS animation directly — page.clock does not advance compositor animations.
  // Safe to pause: crashPlane() reads live rects at click time regardless of play state, and
  // .crashing's CSS override starts a fresh plane-crash animation on class-add.
  await plane.evaluate((el) => {
    el.getAnimations({ subtree: true }).forEach((a) => {
      const dur = a.effect && a.effect.getComputedTiming().duration;
      if (typeof dur === 'number') a.currentTime = dur * 0.5;
      a.pause();
    });
  });
  const pre = await sampleRects();
  await page.locator('.plane-hit').click();
  const post = await sampleRects();
  await plane.evaluate((el) => el.getAnimations({ subtree: true }).forEach((a) => a.play()));
  // hitDeltaX/Y feed the lockstep comparison below — not asserted directly.
  const hitDeltaX = post.hit.x - pre.hit.x;
  const hitDeltaY = post.hit.y - pre.hit.y;

  // .banner-rect is the node that actually gets reparented into .banner-detached.
  // Both nodes ride the same pre-click flight, so ordinary click-delay drift,
  // whatever it turns out to be, moves plane-hit and banner-rect by roughly
  // the same amount — a tight bar on the banner's raw delta would just
  // re-measure that shared drift. Compare how far each moved instead:
  // in lockstep under the fix (each baked from its own rect), diverging
  // under the bug (detached.style.left/top pinned to the hitbox's position,
  // losing the fixed banner-to-hitbox offset — the ~11px hop).
  const bannerDeltaX = post.banner.x - pre.banner.x;
  const bannerDeltaY = post.banner.y - pre.banner.y;
  expect(Math.abs(bannerDeltaX - hitDeltaX)).toBeLessThan(3);
  expect(Math.abs(bannerDeltaY - hitDeltaY)).toBeLessThan(3);

  // Mechanism: the crash class is on immediately, driving a real (un-faked)
  // CSS animation — page.clock doesn't fast-forward it, same lesson as the
  // fade-out test above, so the rest of this test polls in real time.
  await expect(plane).toHaveClass(/crashing/);
  const animationName = await plane.evaluate((el) => getComputedStyle(el).animationName);
  expect(animationName).toBe('plane-crash');

  // Completion (waterline): --dive-y is the dive's computed TARGET, baked
  // into the plane's inline style synchronously inside crashPlane() (stage.js)
  // — before the animation (or the click handler) even returns — so read it
  // straight from the source instead of polling the animating element for a
  // "settled" frame. Two CI-only failures came from doing the latter: on a
  // slow host the poll can land mid-dive (not yet settled — a false negative
  // on a correct crash), or land after splashPlane()'s later removal, where
  // boundingBox() waits forever (the Firefox timeout this replaced). Neither
  // risk applies to a value set before the dive starts.
  // Still a real regression guard: --dive-y is computed from .f-sea's live
  // rect the same way seaBox is below (crashPlane's seaTop falls back to a
  // hardcoded SEA_FRACTION only if .f-sea is missing), so a regression to
  // that fallback still produces a wrong number here — just read from the
  // source instead of from rendered pixels. post.hit.y stands in for the
  // pre-dive baseline: crashPlane bakes --dive-y from the hitbox's own rect
  // at click time, which is the same instant post.hit was sampled above.
  const diveY = await plane.evaluate((el) => parseFloat(el.style.getPropertyValue('--dive-y')));
  const seaBox = await page.locator('.f-sea:visible').first().boundingBox();
  const expectedDiveY = seaBox.y - post.hit.y;
  expect(Math.abs(diveY - expectedDiveY)).toBeLessThan(20);

  // Completion (removal): the plane element itself is ultimately gone.
  await expect(plane).toHaveCount(0);
});

test('reduced-motion: no plane, so no crash hitbox or listener either', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await page.goto('/');
  await page.clock.fastForward(10_000);
  await expect(page.locator('.banner-plane')).toHaveCount(0);
  await expect(page.locator('.plane-hit')).toHaveCount(0);
});
