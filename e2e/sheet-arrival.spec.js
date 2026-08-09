// sheet-arrival.spec.js — /sheet arrival via cross-document view transition.
import { test, expect } from '@playwright/test';
import { rectsIntersect } from './geom.js';

// Navigate from / to /sheet via the dialogue system option.
async function navigateToSheet(page) {
  await page.goto('/');
  await page.locator('#approach-prompt').click();
  await page.locator('#choices button.system').click();
  await page.waitForURL('/sheet');
  // Explicit load-state wait: cross-document VT can leave WebKit in a transient
  // state where evaluate() is rejected immediately after waitForURL resolves.
  await page.waitForLoadState('domcontentloaded');
}

// Execution evidence: pagereveal fires before first paint, so by domcontentloaded
// the class is present or it never will be. The API probe ('onpageswap' in window)
// is true on CI headless Chromium even when the GPU compositor does not execute
// cross-document transitions, causing false positives.
const arrivedByMorph = (page) =>
  page.locator('html').evaluate(el => el.classList.contains('arrived-by-morph'));

// Supported engine: arrived-by-morph is set and portrait slide-in is suppressed; unsupported engine: no marker.
test('click-through: supported engine sets arrived-by-morph and suppresses portrait slide-in; unsupported does not', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await navigateToSheet(page);
  const supported = await arrivedByMorph(page);

  if (supported) {
    // Portrait animation suppressed; vertical-centring transform is translateY(-50%).
    const style = await page.locator('.sheet-portrait').evaluate((el) => {
      const cs = getComputedStyle(el);
      // Parse the Y translation from the computed matrix (6th value in matrix(a,b,c,d,tx,ty)).
      const match = cs.transform.match(/matrix\([^,]+,[^,]+,[^,]+,[^,]+,[^,]+,([^)]+)\)/);
      const actualTy = match ? parseFloat(match[1]) : null;
      // Expected: -50% of border-box height; getBoundingClientRect gives sub-pixel border-box height.
      const expectedTy = -(el.getBoundingClientRect().height / 2);
      return { animName: cs.animationName, actualTy, expectedTy };
    });
    expect(style.animName).toBe('none');
    expect(style.actualTy).not.toBeNull();
    // toBeCloseTo with 1 decimal digit — within 0.05px — catches any non-translateY(-50%) transform.
    expect(style.actualTy).toBeCloseTo(style.expectedTy, 1);
  } else {
    // No marker, full choreography including portrait slide-in plays on unsupported path.
    expect(supported).toBe(false);
    const animName = await page.locator('.sheet-portrait').evaluate((el) => getComputedStyle(el).animationName);
    expect(animName).toBe('portrait-slide-in');
    // Full menu-open choreography runs: other animated elements are not suppressed.
    const menuAnimName = await page.locator('.nameplate-inner').evaluate((el) => getComputedStyle(el).animationName);
    expect(menuAnimName).not.toBe('none');
    const xpAnim = await page.locator('.xp-fill').evaluate((el) => getComputedStyle(el).animationName);
    expect(xpAnim, '.xp-fill animates in unsupported path').not.toBe('none');
  }
});

// Portrait geometry (centring and gap) is correct on morph arrival in a supported engine.
test('click-through: portrait geometry is correct on arrival (supported engine)', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await navigateToSheet(page);
  if (!(await arrivedByMorph(page))) return;

  const portrait = page.locator('.sheet-portrait');
  // arrived-by-morph suppresses the slide-in (animation: none), so there is
  // nothing to wait for — portrait is already at its settled position.
  const portraitBox = await portrait.boundingBox();
  const nameplateBox = await page.locator('.nameplate').boundingBox();
  const grid = page.locator('.sheet-grid');
  const gridBox = await grid.boundingBox();
  const gridGap = await grid.evaluate((el) => parseFloat(getComputedStyle(el).columnGap));

  expect(rectsIntersect(portraitBox, nameplateBox)).toBe(false);
  expect(rectsIntersect(portraitBox, gridBox)).toBe(false);
  const portraitCenterY = portraitBox.y + portraitBox.height / 2;
  const gridCenterY = gridBox.y + gridBox.height / 2;
  expect(Math.abs(portraitCenterY - gridCenterY)).toBeLessThan(2);
  const gap = gridBox.x - (portraitBox.x + portraitBox.width);
  expect(Math.abs(gap - gridGap)).toBeLessThan(2);
});

// Only portrait slide-in is suppressed on morph arrival; nameplate, columns, and XP bar keep their animations.
test('click-through: nameplate, columns, and XP bar keep their animation names on morph arrival', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await navigateToSheet(page);
  if (!(await arrivedByMorph(page))) return;

  for (const sel of ['.nameplate-inner', '.abilities-col', '.middle-col', '.right-col', '.xp-fill']) {
    const animName = await page.locator(sel).evaluate((el) => getComputedStyle(el).animationName);
    expect(animName, `${sel} animation name`).not.toBe('none');
  }
});

// Direct navigation never sets the arrived-by-morph marker; portrait plays its slide-in animation.
test('direct goto /sheet: no arrived-by-morph marker; portrait plays portrait-slide-in', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/sheet');
  const hasMarker = await arrivedByMorph(page);
  expect(hasMarker).toBe(false);
  const animName = await page.locator('.sheet-portrait').evaluate((el) => getComputedStyle(el).animationName);
  expect(animName).toBe('portrait-slide-in');
});

// Reduced motion: click-through is instant with no marker; final layout states are correct immediately.
test('reduced motion: click-through is instant with no arrived-by-morph and final layout state intact', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await navigateToSheet(page);

  // No transition ran so no marker should be set.
  const hasMarker = await arrivedByMorph(page);
  expect(hasMarker).toBe(false);

  // Reduced-motion final states: panels land immediately with no animation.
  for (const sel of ['.nameplate-inner', '.abilities-col', '.middle-col', '.right-col']) {
    const style = await page.locator(sel).evaluate((el) => {
      const cs = getComputedStyle(el);
      return { name: cs.animationName, opacity: cs.opacity, transform: cs.transform };
    });
    expect(style.name, `${sel} animationName`).toBe('none');
    expect(style.opacity, `${sel} opacity`).toBe('1');
    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)'], `${sel} transform`).toContain(style.transform);
  }

  // Portrait: no animation, vertical-centring transform intact.
  const portraitStyle = await page.locator('.sheet-portrait').evaluate((el) => {
    const cs = getComputedStyle(el);
    return { name: cs.animationName, transform: cs.transform };
  });
  expect(portraitStyle.name).toBe('none');
  expect(portraitStyle.transform).not.toBe('none');
});

// Dialogue-entry at 1366 (below the 1650px breakpoint): journey completes,
// .sheet-portrait is hidden, and no console errors from our code.
test('dialogue-entry at 1366 (below breakpoint): portrait hidden, no console errors', async ({ page }) => {
  const errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (err) => errors.push(err.message));

  await page.setViewportSize({ width: 1366, height: 768 });
  await navigateToSheet(page);

  await expect(page.locator('.sheet-portrait')).toBeHidden();

  // "Transition was skipped" is benign on Chromium when .sheet-portrait img carries
  // view-transition-name but is display:none at this width.
  const unexpected = errors.filter((e) => e !== 'Transition was skipped');
  expect(unexpected).toEqual([]);
});

// /404 has no @view-transition opt-in in its stylesheets.
test('/404 has no @view-transition opt-in in its stylesheets', async ({ page }) => {
  await page.goto('/404');
  const hasVT = await page.evaluate(() => {
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.cssText && rule.cssText.includes('@view-transition')) return true;
        }
      } catch (e) { /* cross-origin or inaccessible sheet */ }
    }
    return false;
  });
  expect(hasVT).toBe(false);
});
