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

// The button's own box is fixed by the card (display:block; width:100%)
// whether or not a caret shows — measuring it proves nothing. Measure where
// the label TEXT itself starts instead, via a Range over its text node.
async function labelTextX(locator) {
  return locator.evaluate((el) => {
    const range = document.createRange();
    range.selectNodeContents(el.firstChild);
    return range.getClientRects()[0].x;
  });
}

test('caret does not shift the label when it appears — gutter is reserved, not inserted', async ({ page }) => {
  const pointerFine = await page.evaluate(() => matchMedia('(pointer: fine)').matches);
  test.skip(!pointerFine, 'hover is a desktop-pointer affordance');
  await approach(page);
  const choice = page.locator('.choices button').first();
  const beforeX = await labelTextX(choice);
  await choice.hover();
  const afterX = await labelTextX(choice);
  expect(afterX).toBeCloseTo(beforeX, 0);
});

test('press state: :active resets the hover lift and presses further down', async ({ page }) => {
  // Screen-space boundingBox, not getComputedStyle('transform') — the
  // `transform` property does NOT bake in `translate` at the CSS OM level;
  // the two are independently-animatable properties that both affect the
  // painted position, and only the render (boundingBox) reflects their sum.
  await approach(page);
  // Let the card's own 550ms entry transform settle and wait out A2's stream
  // skip — mouse.down() below is a real pointerdown on the card, and either
  // still being in flight reflows/shifts the choices list under the button,
  // swamping the 2px press offset the assertions below are trying to isolate.
  await expect(page.locator('.card')).toHaveCSS('opacity', '1', { timeout: 5000 });
  await expect(page.locator('.card')).not.toHaveClass(/is-streaming/, { timeout: 5000 });
  const choice = page.locator('.choices button').first();
  await choice.hover();
  await page.waitForTimeout(150); // let the 0.12s hover-lift transition settle
  const hovered = await choice.boundingBox();
  await page.mouse.down();
  await page.waitForTimeout(150); // let the 0.12s transform/translate transition settle
  const pressed = await choice.boundingBox();
  await page.mouse.up();
  // :active resets the hover-lift transform and presses via the independent
  // `translate` property instead — hover -> press is a real ~2px travel,
  // not the two partially cancelling out.
  expect(pressed.y).toBeGreaterThan(hovered.y);
  expect(pressed.y - hovered.y).toBeGreaterThan(1);
});

// The build's minifier can fold `transform:none; translate:none` into a
// literal identity matrix rather than the string 'none' (observed:
// `transform:translate(0,0)`), so accept either serialization of "no offset".
function hasNoOffset(transformStr) {
  if (transformStr === 'none') return true;
  const m = transformStr.match(/^matrix\(([^)]+)\)$/);
  if (!m) return false;
  const [a, b, c, d, e, f] = m[1].split(',').map(Number);
  return a === 1 && b === 0 && c === 0 && d === 1 && e === 0 && f === 0;
}

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
  expect(hasNoOffset(await system.evaluate((el) => getComputedStyle(el).transform))).toBe(true);
  await page.mouse.down();
  await page.waitForTimeout(150);
  expect(hasNoOffset(await system.evaluate((el) => getComputedStyle(el).transform))).toBe(true); // no press lift either
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

// B6's bob animates .prompt-label, not #approach-prompt itself (see the CSS
// rule in Stage.astro for why).
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
  // Same animationstart-flag technique as the sibling test above, not a
  // getComputedStyle read after a fixed wait — reading late enough that the
  // (would-be) 220ms class-removal timeout has already fired would pass
  // vacuously even if the flip weren't actually gated.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await page.evaluate(() => {
    window.__flipName = null;
    document.getElementById('toggle').addEventListener('animationstart', (e) => {
      window.__flipName = e.animationName;
    });
  });
  await page.locator('#toggle').click();
  await page.waitForTimeout(300); // longer than the (would-be) 220ms flip
  expect(await page.evaluate(() => window.__flipName)).toBeNull();
});
