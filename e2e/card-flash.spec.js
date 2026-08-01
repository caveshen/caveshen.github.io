// PRD §15 D5 — card flash on cold load
// .card ships without [hidden] so it is display:block at first paint; the init
// script sets card.hidden = true only after JS runs (module scripts are deferred).
// On a warm load the gap is invisible; on a cold load it is a visible flash.
//
// Test strategy: addInitScript installs a rAF loop at document_start (before any
// page scripts). The loop records whether .card is ever rendered visible. CPU is
// throttled 20× via CDP so script execution lags first paint by enough to catch
// the flash. CDP is Chromium-only; the test skips on WebKit and Firefox.
import { test, expect } from '@playwright/test';

test('D5: card never painted visible before JS hides it (cold-load flash)', async ({ browser, browserName }) => {
  test.skip(browserName !== 'chromium', 'Emulation.setCPUThrottlingRate requires Chromium');

  const ctx  = await browser.newContext();
  const page = await ctx.newPage();

  // Poll every animation frame from document_start — before any page scripts.
  // Records true if .card is ever rendered with display != none, non-zero opacity,
  // and non-trivial height (the three conditions that constitute "on screen").
  await page.addInitScript(() => {
    window.__cardFlashed = false;
    const poll = () => {
      const card = document.querySelector('.card');
      if (card) {
        const s = getComputedStyle(card);
        const r = card.getBoundingClientRect();
        if (s.display !== 'none' && parseFloat(s.opacity) > 0.01 && r.height > 1) {
          window.__cardFlashed = true;
        }
      }
      requestAnimationFrame(poll);
    };
    requestAnimationFrame(poll);
  });

  // Throttle CPU 20× so module script execution lags well behind first paint.
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 20 });

  // waitUntil:'load' ensures the init script has definitely run by the time we
  // sample — so __cardFlashed captures the full pre-init window.
  await page.goto('/', { waitUntil: 'load' });

  // Reset throttle before evaluate so the read is not itself throttled.
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });

  const flashed = await page.evaluate(() => window.__cardFlashed);
  await ctx.close();

  expect(flashed).toBe(false);
});
