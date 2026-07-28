// PRD §29 — Badger two-frame idle animation.
// Covers the two suite-checkable assertions from the method note:
//   1. Both frame images are served (HTTP 200, non-zero content).
//   2. Under prefers-reduced-motion: reduce, the down frame has no animation.
import { test, expect } from '@playwright/test';

// Both frame assets are served correctly
test('badger-up.png is served', async ({ request }) => {
  const res = await request.get('/badger-up.png');
  expect(res.status()).toBe(200);
  const body = await res.body();
  expect(body.length).toBeGreaterThan(0);
});

test('badger-down.png is served', async ({ request }) => {
  const res = await request.get('/badger-down.png');
  expect(res.status()).toBe(200);
  const body = await res.body();
  expect(body.length).toBeGreaterThan(0);
});

// Under reduced motion, the down frame has animation: none (up frame is the static hold)
test('reduced-motion: down frame has no animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const animName = await page.evaluate(() => {
    const el = document.querySelector('.badger-down');
    return el ? getComputedStyle(el).animationName : null;
  });
  // 'none' is the computed value when animation: none is applied
  expect(animName).toBe('none');
});

// Under reduced motion, the up frame is statically visible (opacity 1, no animation)
test('reduced-motion: up frame is static at opacity 1', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const { animName, opacity } = await page.evaluate(() => {
    const el = document.querySelector('.badger-up');
    const s = el ? getComputedStyle(el) : null;
    return s ? { animName: s.animationName, opacity: s.opacity } : {};
  });
  expect(animName).toBe('none');
  expect(opacity).toBe('1');
});

// No-JS: CSS idle animation still runs — both frames present and animating.
// Fails if someone later replaces the CSS approach with a JS timer.
test('no-JS: both frames present and CSS animation is active', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  const result = await page.evaluate(() => {
    const up   = document.querySelector('.badger-up');
    const down = document.querySelector('.badger-down');
    return {
      upAnim:   up   ? getComputedStyle(up).animationName   : null,
      downAnim: down ? getComputedStyle(down).animationName : null,
    };
  });
  expect(result.upAnim).not.toBe('none');
  expect(result.downAnim).not.toBe('none');
  await ctx.close();
});
