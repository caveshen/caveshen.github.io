// Badger two-frame idle animation.
import { test, expect } from '@playwright/test';

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

test('reduced-motion: down frame has no animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const animName = await page.evaluate(() => {
    const el = document.querySelector('.badger-down');
    return el ? getComputedStyle(el).animationName : null;
  });
  expect(animName).toBe('none');
});

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

// Fails if someone later replaces the CSS animation with a JS timer.
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
