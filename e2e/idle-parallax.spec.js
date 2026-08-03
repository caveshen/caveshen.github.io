// Idle micro-parallax — pointer-driven background drift, desktop pointers only.
import { test, expect } from '@playwright/test';
import { visibleRect } from './geom.js';

test('resting pointer position drifts the background, never the foreground', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 }); // forces the standard variant on
  await page.goto('/');
  const pointerFine = await page.evaluate(() => matchMedia('(pointer: fine)').matches);

  const frame = await page.locator('.stage-frame').boundingBox();
  const bgBefore = await visibleRect(page, '.table-mountain');
  const fgBefore = await visibleRect(page, '.js-character');

  await page.mouse.move(frame.x + 10, frame.y + frame.height / 2);
  // .bg-layer's transform transition (tokens.css) is 950ms — give it time to settle
  // before sampling, or the drift would still be mid-interpolation.
  await page.waitForTimeout(1100);

  const bgAfter = await visibleRect(page, '.table-mountain');
  const fgAfter = await visibleRect(page, '.js-character');
  const bgDeltaX = Math.abs(bgAfter.x - bgBefore.x);
  const fgDeltaX = Math.abs(fgAfter.x - fgBefore.x);

  // True on every project regardless of pointer support: fg never drifts, bg never jumps far.
  expect(fgDeltaX).toBeLessThan(1);
  expect(bgDeltaX).toBeLessThan(20);

  // Only a fine pointer (desktop/mouse) attaches the drift listener at all.
  if (pointerFine) {
    expect(bgDeltaX).toBeGreaterThan(0.3);
  } else {
    expect(bgDeltaX).toBe(0);
  }
});

test('reduced motion disables the pointer drift entirely', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const frame = await page.locator('.stage-frame').boundingBox();
  const bgBefore = await visibleRect(page, '.table-mountain');

  await page.mouse.move(frame.x + 10, frame.y + frame.height / 2);
  await page.waitForTimeout(200);
  await page.mouse.move(frame.x + frame.width - 10, frame.y + frame.height / 2);
  await page.waitForTimeout(200);

  const bgAfter = await visibleRect(page, '.table-mountain');
  expect(Math.abs(bgAfter.x - bgBefore.x)).toBe(0);
});
