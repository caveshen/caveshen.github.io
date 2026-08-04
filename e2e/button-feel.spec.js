// button-feel.spec.js — d31 Part B: the selection idiom (caret, press, box,
// idle bob, theme-toggle flip) and its reduced-motion gating.
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

async function approach(page) {
  await page.locator('#approach-prompt').click();
}

// getComputedStyle on an element's ::before pseudo — used throughout to read
// the caret without depending on it being real DOM (it's aria-hidden by
// construction: pure CSS generated content, never in the a11y tree).
async function beforeStyle(locator, prop) {
  return locator.evaluate((el, p) => getComputedStyle(el, '::before')[p], prop);
}

test('caret is reserved but invisible at rest, and appears on hover', async ({ page }) => {
  // Hover is a desktop-pointer affordance (same gate idle-parallax.spec.js
  // uses) — touch projects have no hover state, and some even resolve
  // :focus-visible differently for a touch-triggered programmatic focus, so
  // "invisible before any interaction" doesn't hold there either.
  const pointerFine = await page.evaluate(() => matchMedia('(pointer: fine)').matches);
  test.skip(!pointerFine, 'hover is a desktop-pointer affordance');
  await approach(page);
  const choice = page.locator('.choices button').first();
  expect(await beforeStyle(choice, 'opacity')).toBe('0');
  await choice.hover();
  expect(await beforeStyle(choice, 'opacity')).toBe('1');
});

test('caret appears on focus-visible via keyboard, matching hover', async ({ page }) => {
  // A real Tab+Enter keyboard activation, not approach()'s mouse click —
  // dialogue.js's programmatic choice.focus() after a mouse click does not
  // itself satisfy :focus-visible (browsers key it off the input modality).
  await page.keyboard.press('Tab'); // theme toggle
  await page.keyboard.press('Tab'); // approach prompt
  await page.keyboard.press('Enter');
  const choice = page.locator('.choices button').first();
  await expect(choice).toBeFocused();
  expect(await beforeStyle(choice, 'opacity')).toBe('1');
});

test('caret does not shift the label when it appears — gutter is reserved, not inserted', async ({ page }) => {
  const pointerFine = await page.evaluate(() => matchMedia('(pointer: fine)').matches);
  test.skip(!pointerFine, 'hover is a desktop-pointer affordance');
  await approach(page);
  const choice = page.locator('.choices button').first();
  const before = await choice.boundingBox();
  await choice.hover();
  const after = await choice.boundingBox();
  expect(after.x).toBeCloseTo(before.x, 0);
  expect(after.width).toBeCloseTo(before.width, 0);
});

// getComputedStyle().transform reports the fully-combined matrix (transform +
// translate baked together), so read the matrix's y-translation (its 6th,
// "f", component) rather than expecting a literal 'none'.
function translateY(matrixStr) {
  const m = matrixStr.match(/matrix\(([^)]+)\)/);
  return m ? Number(m[1].split(',')[5]) : 0;
}

test('press state: :active resets the hover lift and presses via translate', async ({ page }) => {
  await approach(page);
  const choice = page.locator('.choices button').first();
  await choice.hover();
  await page.waitForTimeout(150); // let the 0.12s hover-lift transition settle
  const hoverY = translateY(await choice.evaluate((el) => getComputedStyle(el).transform));
  expect(hoverY).toBeLessThan(0); // hover's 1px lift (transform: translateY(-1px))
  await page.mouse.down();
  await page.waitForTimeout(150); // let the 0.12s transform/translate transition settle
  const pressY = translateY(await choice.evaluate((el) => getComputedStyle(el).transform));
  await page.mouse.up();
  // :active resets the hover-lift transform and presses via the independent
  // `translate` property instead — hover -> press is a real ~2px travel
  // (screen space, via the combined matrix), not the two partially
  // cancelling out.
  expect(pressY).toBeGreaterThan(hoverY);
  expect(pressY - hoverY).toBeGreaterThan(1);
});

test('system options and End dialogue get the caret but no hover lift or press', async ({ page }) => {
  await approach(page);
  // root's own choices already include a system option (the /sheet skip) —
  // no need to navigate anywhere, which also sidesteps A2's mid-stream
  // click-swallow (a click here would otherwise just complete the line).
  await expect(page.locator('.card')).not.toHaveClass(/is-streaming/, { timeout: 5000 });
  const system = page.locator('.choices button.system').first();
  await expect(system).toBeVisible();
  await system.hover();
  expect(await beforeStyle(system, 'opacity')).toBe('1'); // same caret language
  expect(await system.evaluate((el) => getComputedStyle(el).transform)).toBe('none');
  await page.mouse.down();
  await page.waitForTimeout(150);
  expect(await system.evaluate((el) => getComputedStyle(el).transform)).toBe('none'); // no press lift either
  await page.mouse.up();
});

test('boxes are square-cornered rectangles with a 2px border, not pills', async ({ page }) => {
  await approach(page);
  const targets = ['#approach-prompt', '.choices button', '#toggle'];
  for (const sel of targets) {
    const el = page.locator(sel).first();
    const { radius, width } = await el.evaluate((e) => {
      const cs = getComputedStyle(e);
      return { radius: cs.borderTopLeftRadius, width: cs.borderTopWidth };
    });
    expect(radius, sel).toBe('4px');
    expect(width, sel).toBe('2px');
  }
});

// B6's bob animates .prompt-label, not #approach-prompt itself — the button
// stays geometrically static so Playwright's click actionability (which
// requires the CLICKED element's own box to hold still) never fights it.
test('idle bob: prompt label animates while idle, off under reduced motion', async ({ page }) => {
  const animName = await page.locator('.prompt-label').evaluate(
    (el) => getComputedStyle(el).animationName
  );
  expect(animName).not.toBe('none');
});

test("idle bob doesn't stop the approach prompt itself from being clickable", async ({ page }) => {
  await approach(page);
  await expect(page.locator('.card')).toBeVisible();
});

test('reduced motion: idle bob is off', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  const animName = await page.locator('.prompt-label').evaluate(
    (el) => getComputedStyle(el).animationName
  );
  expect(animName).toBe('none');
});

test('theme toggle: click plays the flip', async ({ page }) => {
  // Poll a flag set by a real animationstart listener rather than reading
  // getComputedStyle right after click() — the flip is only 220ms and a
  // straight read raced the class removal on a slow CI run.
  await page.evaluate(() => {
    window.__flipName = null;
    document.getElementById('toggle').addEventListener('animationstart', (e) => {
      window.__flipName = e.animationName;
    });
  });
  await page.locator('#toggle').click();
  await expect.poll(() => page.evaluate(() => window.__flipName)).toBe('toggle-flip');
});

test('reduced motion: theme toggle flip is off', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  const toggle = page.locator('#toggle');
  await toggle.click();
  const animName = await toggle.evaluate(
    (el) => getComputedStyle(el.querySelector('.toggle-icon')).animationName
  );
  expect(animName).toBe('none');
});
