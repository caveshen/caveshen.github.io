// portrait-journey.spec.js — full cross-page journey from / through dialogue to /sheet.
import { test, expect } from '@playwright/test';
import { rectsIntersect } from './geom.js';

// Navigate from / through the system dialogue option to /sheet.
async function journey(page) {
  await page.goto('/');
  await page.locator('#approach-prompt').click();
  await page.locator('#choices button.system').click();
  await page.waitForURL('/sheet');
  // Cross-document VT can leave WebKit in a transient state where evaluate()
  // is rejected immediately after waitForURL resolves — mirror the explicit
  // domcontentloaded wait used in sheet-arrival.spec.js.
  await page.waitForLoadState('domcontentloaded');
}

// Does the current page's engine support cross-document view transitions?
async function supportsVT(page) {
  return page.evaluate(() => 'onpageswap' in window);
}

// Full journey, 1920: both branches assert real state; neither is vacuous.
test('full journey at 1920: supported engine arrives with marker + suppressed portrait + settled portrait geometry; unsupported gets full choreography', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await journey(page);
  const supported = await supportsVT(page);

  if (supported) {
    // Marker set before first paint by the pagereveal handler.
    await expect(page.locator('html')).toHaveClass(/arrived-by-morph/);

    // Portrait animation suppressed; translateY(-50%) vertical-centring is intact.
    const portrait = page.locator('.sheet-portrait');
    const portraitStyle = await portrait.evaluate((el) => {
      const cs = getComputedStyle(el);
      const match = cs.transform.match(/matrix\([^,]+,[^,]+,[^,]+,[^,]+,[^,]+,([^)]+)\)/);
      return {
        animName: cs.animationName,
        actualTy: match ? parseFloat(match[1]) : null,
        expectedTy: -(el.getBoundingClientRect().height / 2),
      };
    });
    expect(portraitStyle.animName).toBe('none');
    expect(portraitStyle.actualTy).not.toBeNull();
    // Within 0.05px of the expected translateY(-50%) value.
    expect(portraitStyle.actualTy).toBeCloseTo(portraitStyle.expectedTy, 1);

    // Settled portrait centring and gap geometry: no intersection with nameplate or grid,
    // portrait vertically centred on grid, gap matches grid column-gap.
    // ponytail: settled() WAAPI helper is intentionally omitted — .sheet-portrait, .nameplate, and .sheet-grid do not animate on morph arrival (portrait animation is suppressed; only inner children animate and they do not reflow these containers).
    const portraitBox = await portrait.boundingBox();
    const nameplateBox = await page.locator('.nameplate').boundingBox();
    const grid = page.locator('.sheet-grid');
    const gridBox = await grid.boundingBox();
    const gridGap = await grid.evaluate((el) => parseFloat(getComputedStyle(el).columnGap));
    expect(rectsIntersect(portraitBox, nameplateBox)).toBe(false);
    expect(rectsIntersect(portraitBox, gridBox)).toBe(false);
    expect(
      Math.abs((portraitBox.y + portraitBox.height / 2) - (gridBox.y + gridBox.height / 2))
    ).toBeLessThan(2);
    expect(
      Math.abs((gridBox.x - (portraitBox.x + portraitBox.width)) - gridGap)
    ).toBeLessThan(2);

    // Only portrait slide-in is suppressed; all other menu-open animations still run.
    for (const sel of ['.nameplate-inner', '.abilities-col', '.middle-col', '.right-col', '.xp-fill']) {
      const animName = await page.locator(sel).evaluate((el) => getComputedStyle(el).animationName);
      expect(animName, `${sel} keeps its animation`).not.toBe('none');
    }
  } else {
    // Unsupported: no marker; portrait plays its slide-in; full choreography runs.
    const hasMarker = await page.locator('html').evaluate((el) => el.classList.contains('arrived-by-morph'));
    expect(hasMarker).toBe(false);

    const portraitAnim = await page.locator('.sheet-portrait').evaluate(
      (el) => getComputedStyle(el).animationName
    );
    expect(portraitAnim).toBe('portrait-slide-in');

    // At least two other menu-open elements also animate — full choreography, not just portrait.
    const nameplateAnim = await page.locator('.nameplate-inner').evaluate(
      (el) => getComputedStyle(el).animationName
    );
    const xpAnim = await page.locator('.xp-fill').evaluate(
      (el) => getComputedStyle(el).animationName
    );
    expect(nameplateAnim, '.nameplate-inner animates in unsupported path').not.toBe('none');
    expect(xpAnim, '.xp-fill animates in unsupported path').not.toBe('none');
  }
});

// Below the 1650px breakpoint .sheet-portrait is display:none; the journey must
// still complete correctly and produce no errors from our code. The marker may
// be set (the root cross-fade is still a transition) — that is acceptable because
// the suppressed element is not displayed at this width.
test('at 1366 (below breakpoint): journey completes, .sheet-portrait is hidden, no console errors', async ({ page }) => {
  const errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (err) => errors.push(err.message));

  await page.setViewportSize({ width: 1366, height: 768 });
  await journey(page);

  // Portrait seat does not exist at this width; it must be hidden, not broken.
  await expect(page.locator('.sheet-portrait')).toBeHidden();

  // "Transition was skipped" is a Chromium-internal message that fires when
  // .sheet-portrait img carries view-transition-name but is display:none at
  // this width. It is a browser-level consequence of the named-element CSS,
  // not an error from our code — filter it so only unexpected errors fail.
  const unexpected = errors.filter((e) => e !== 'Transition was skipped');
  expect(unexpected).toEqual([]);
});
