// button-feel.spec.js — d37 §5: the dialogue plate idiom (rest state, ignition,
// ring, numeral) and its reduced-motion gating, plus the theme-toggle flip.
import { test, expect } from '@playwright/test';
import { approachPrompt } from './geom.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

async function approach(page) {
  await approachPrompt(page);
}

// getComputedStyle on an element's ::before/::after pseudo — used throughout
// to read generated content without depending on it being real DOM (the
// numeral and ✦ are aria-hidden by construction: pure CSS content, never in
// the a11y tree).
async function pseudoStyle(locator, pseudo, prop) {
  return locator.evaluate((el, [p, name]) => getComputedStyle(el, p)[name], [pseudo, prop]);
}

test('plates are quiet at rest: flat fill, dim rule, no star', async ({ page }) => {
  await approach(page);
  const choice = page.locator('.choices button').first();
  expect(await choice.evaluate((e) => getComputedStyle(e).backgroundColor))
    .toBe('rgba(236, 228, 212, 0.04)');
  expect(await pseudoStyle(choice, '::before', 'width')).toBe('2px');
  expect(await pseudoStyle(choice, '::before', 'backgroundColor')).toBe('rgb(217, 169, 78)');
  expect(await pseudoStyle(choice, '::before', 'opacity')).toBe('0.35');
  expect(await pseudoStyle(choice, '::after', 'opacity')).toBe('0');
});

test('plate ignites on hover: warm wash, bright wide rule, star fades in', async ({ page }) => {
  const pointerFine = await page.evaluate(() => matchMedia('(pointer: fine)').matches);
  test.skip(!pointerFine, 'hover is a desktop-pointer affordance');
  await approach(page);
  const choice = page.locator('.choices button').first();
  await choice.hover();
  expect(await choice.evaluate((e) => getComputedStyle(e).backgroundColor))
    .toBe('rgba(217, 169, 78, 0.1)');
  expect(await pseudoStyle(choice, '::before', 'width')).toBe('3px');
  expect(await pseudoStyle(choice, '::before', 'backgroundColor')).toBe('rgb(255, 196, 107)');
  expect(await pseudoStyle(choice, '::before', 'opacity')).toBe('1');
  expect(await pseudoStyle(choice, '::after', 'opacity')).toBe('1');
});

test('keyboard focus ignites the plate and rings gold-bright via kb-focus', async ({ page }) => {
  // A real Tab+Enter keyboard activation, not approach()'s mouse click —
  // dialogue.js's programmatic choice.focus() after a mouse click does not
  // itself satisfy :focus-visible (browsers key it off the input modality).
  await page.keyboard.press('Tab'); // theme toggle
  await page.keyboard.press('Tab'); // approach prompt
  await page.keyboard.press('Enter');
  const choice = page.locator('.choices button').first();
  await expect(choice).toBeFocused();
  expect(await pseudoStyle(choice, '::after', 'opacity')).toBe('1');
  const { color, width, offset } = await choice.evaluate((e) => {
    const cs = getComputedStyle(e);
    return { color: cs.outlineColor, width: cs.outlineWidth, offset: cs.outlineOffset };
  });
  expect(color).toBe('rgb(255, 196, 107)');
  expect(width).toBe('2px');
  expect(offset).toBe('2px');
});

test('each option leads with a mono roman numeral index', async ({ page }) => {
  await approach(page);
  const lis = page.locator('.choices li');
  expect(await pseudoStyle(lis.nth(0), '::before', 'content')).toContain('I');
  expect(await pseudoStyle(lis.nth(1), '::before', 'content')).toContain('II');
  const family = await pseudoStyle(lis.nth(0), '::before', 'fontFamily');
  expect(family.toLowerCase()).toContain('cascadia');
});

// The plate's own box is fixed by the card (display:block; width:100%) and
// nothing in the ignition moves layout — the rule widens at the plate edge
// and the star fades into reserved right padding. Measure where the label
// TEXT starts, via a Range over its text node, to prove it.
async function labelTextX(locator) {
  return locator.evaluate((el) => {
    const range = document.createRange();
    range.selectNodeContents(el.firstChild);
    return range.getClientRects()[0].x;
  });
}

test('ignition does not shift the label — both glyph slots are reserved padding', async ({ page }) => {
  const pointerFine = await page.evaluate(() => matchMedia('(pointer: fine)').matches);
  test.skip(!pointerFine, 'hover is a desktop-pointer affordance');
  await approach(page);
  // Let the card's entry transform settle — beforeX must be read after the
  // card has centred itself or the position is not the final layout position.
  await expect(page.locator('.card')).toHaveCSS('opacity', '1', { timeout: 5000 });
  await expect(page.locator('.card')).not.toHaveClass(/is-streaming/, { timeout: 5000 });
  const choice = page.locator('.choices button').first();
  const beforeX = await labelTextX(choice);
  await choice.hover();
  const afterX = await labelTextX(choice);
  expect(afterX).toBeCloseTo(beforeX, 0);
});

test('system options and End dialogue are ordinary plates — one style, same ignition', async ({ page }) => {
  await approach(page);
  // root's own choices already include a system option (the /sheet skip) —
  // no need to navigate anywhere.
  await expect(page.locator('.card')).not.toHaveClass(/is-streaming/, { timeout: 5000 });
  for (const selector of ['.choices button.system', '#end-dialogue']) {
    const el = page.locator(selector).first();
    await expect(el).toBeVisible();
    expect(await el.evaluate((e) => getComputedStyle(e).borderTopStyle)).toBe('none');
    expect(await el.evaluate((e) => getComputedStyle(e).backgroundColor))
      .toBe('rgba(236, 228, 212, 0.04)');
    await el.hover();
    expect(await el.evaluate((e) => getComputedStyle(e).backgroundColor))
      .toBe('rgba(217, 169, 78, 0.1)');
    expect(await pseudoStyle(el, '::after', 'opacity')).toBe('1');
    // Both buttons navigate/exit on a real click — release away from the
    // element so mouseup doesn't complete one and skip the loop's second half.
    await page.mouse.move(0, 0);
  }
});

// #approach-prompt is deliberately absent here — the approach-reveal ticket
// removed its box/border (floating shadowed text, not a boxed control); the
// dedicated no-box/no-border assertions live in approach.spec.js instead.
test('plates are sharp-cornered and borderless; the toggle keeps its 2px box', async ({ page }) => {
  await approach(page);
  const targets = ['.choices button', '#toggle'];
  for (const sel of targets) {
    const el = page.locator(sel).first();
    const { radius, width } = await el.evaluate((e) => {
      const cs = getComputedStyle(e);
      return { radius: cs.borderTopLeftRadius, width: cs.borderTopWidth };
    });
    expect(radius, sel).toBe('4px');
    expect(width, sel).toBe(sel === '.choices button' ? '0px' : '2px');
  }
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
