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
