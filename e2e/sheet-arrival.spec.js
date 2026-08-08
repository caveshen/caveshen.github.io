// sheet-arrival.spec.js — /sheet arrival via cross-document view transition.
import { test, expect } from '@playwright/test';
import { rectsIntersect } from './geom.js';

// Settled() waits for an element's own CSS animations to finish.
// Pattern mirrors sheet-portrait.spec.js so both files share the same idiom.
async function settled(locator) {
  await locator.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
}

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

// Does this page's engine support cross-document view transitions?
async function supportsVT(page) {
  return page.evaluate(() => 'onpageswap' in window);
}

// Criteria 1 and 4 — marker and suppression in supported engine; no marker in unsupported.
test('click-through: supported engine sets arrived-by-morph and suppresses portrait slide-in; unsupported does not', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await navigateToSheet(page);
  const supported = await supportsVT(page);

  if (supported) {
    // Criterion 1: marker set before first paint.
    await expect(page.locator('html')).toHaveClass(/arrived-by-morph/);

    // Portrait animation suppressed; translateY(-50%) vertical-centring transform intact.
    const style = await page.locator('.sheet-portrait').evaluate((el) => {
      const cs = getComputedStyle(el);
      return { animName: cs.animationName, transform: cs.transform };
    });
    expect(style.animName).toBe('none');
    expect(style.transform).not.toBe('none');
    expect(style.transform).not.toBe('matrix(1, 0, 0, 1, 0, 0)');
  } else {
    // Criterion 4: no marker, full slide-in plays.
    const hasMarker = await page.locator('html').evaluate((el) => el.classList.contains('arrived-by-morph'));
    expect(hasMarker).toBe(false);
    const animName = await page.locator('.sheet-portrait').evaluate((el) => getComputedStyle(el).animationName);
    expect(animName).toBe('portrait-slide-in');
  }
});

// Criterion 1 (continued) — d24 centred/gap geometry holds on arrival in supported engine.
test('click-through: portrait geometry is correct on arrival (supported engine)', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await navigateToSheet(page);
  if (!(await supportsVT(page))) return;

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

// Criterion 2 — only portrait slide-in is suppressed; other choreography runs.
test('click-through: nameplate, columns, and XP bar keep their animation names on morph arrival', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await navigateToSheet(page);
  if (!(await supportsVT(page))) return;

  for (const sel of ['.nameplate-inner', '.abilities-col', '.middle-col', '.right-col', '.xp-fill']) {
    const animName = await page.locator(sel).evaluate((el) => getComputedStyle(el).animationName);
    expect(animName, `${sel} animation name`).not.toBe('none');
  }
});

// Criterion 3 — direct goto never sets the marker.
test('direct goto /sheet: no arrived-by-morph marker; portrait plays portrait-slide-in', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/sheet');
  const hasMarker = await page.locator('html').evaluate((el) => el.classList.contains('arrived-by-morph'));
  expect(hasMarker).toBe(false);
  const animName = await page.locator('.sheet-portrait').evaluate((el) => getComputedStyle(el).animationName);
  expect(animName).toBe('portrait-slide-in');
});

// Criterion 5 — reduced motion: no marker, instant swap, d24 final states hold.
test('reduced motion: click-through is instant with no arrived-by-morph and d24 final state intact', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await navigateToSheet(page);

  // No transition ran so no marker should be set.
  const hasMarker = await page.locator('html').evaluate((el) => el.classList.contains('arrived-by-morph'));
  expect(hasMarker).toBe(false);

  // d24 reduced-motion final states: panels land immediately with no animation.
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

// Criterion 6 — /404 has no @view-transition opt-in.
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
