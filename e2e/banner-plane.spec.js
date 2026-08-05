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
  const frame = await page.locator('.stage-frame').boundingBox();

  // The flight is a real (un-faked) CSS animation crossing from off-screen
  // left to off-screen right — wait in real time until it's actually over
  // the frame before clicking it (page.clock doesn't advance this, same
  // compositor-vs-fake-timers lesson as the fade-out test above).
  await expect.poll(async () => {
    const box = await plane.boundingBox();
    return box ? box.x > frame.x : false;
  }, { timeout: 8000 }).toBe(true);

  // d30 fix: crashPlane() bakes the in-flight position from .plane-hit's own
  // rect, sampled before .banner-rect/.banner-tow are reparented out — sample
  // either side of the click and allow only ordinary in-flight drift, not the
  // ~117px teleport a container-rect bake produces once the banner detaches.
  const preClickBox = await page.locator('.plane-hit').boundingBox();

  // force: true — the plane is still moving (continuously translating), so
  // Playwright's stability check would otherwise wait forever for it to stop.
  await page.locator('.plane-hit').click({ force: true });

  const postClickBox = await page.locator('.plane-hit').boundingBox();
  expect(Math.abs(postClickBox.x - preClickBox.x)).toBeLessThan(20);
  expect(Math.abs(postClickBox.y - preClickBox.y)).toBeLessThan(20);

  // Mechanism: the crash class is on immediately, driving a real (un-faked)
  // CSS animation — page.clock doesn't fast-forward it, same lesson as the
  // fade-out test above, so the rest of this test polls in real time.
  await expect(plane).toHaveClass(/crashing/);
  const animationName = await plane.evaluate((el) => getComputedStyle(el).animationName);
  expect(animationName).toBe('plane-crash');

  // Completion (waterline): once the dive settles, the plane holds a resting
  // position clearly below mid-frame — not a mid-animation opacity sample,
  // a settled post-animation position (animation-fill-mode: forwards).
  const waterlineY = frame.y + frame.height * 0.5;
  // Fixed short interval, not expect.poll's default growing backoff — the
  // dive settles at CRASH_MS (~1.1s) and a wide backoff step can overshoot
  // that window and time out having never sampled the settled position.
  await expect.poll(async () => (await plane.boundingBox())?.y, {
    timeout: 8000,
    intervals: [50],
  }).toBeGreaterThan(waterlineY);

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
