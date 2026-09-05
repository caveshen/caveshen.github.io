// button-feel.spec.js — the HUD option idiom on the wheel: numbered caps at
// rest, gold ignition on hover, a holo ring only for keyboard arrivals; plus
// the theme-toggle flip and its reduced-motion gate.
import { test, expect } from './fixtures.js';
import { approachPrompt } from './geom.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

const GOLD_BRIGHT = 'rgb(255, 196, 107)';
const HOLO = 'rgb(111, 179, 232)';

// Settled ignition state, polled: the transition is a short micro-timing and
// a read straight after hover races it mid-flight.
async function ignition(locator) {
  return locator.evaluate((e) => {
    const cs = getComputedStyle(e);
    return { color: cs.color, border: cs.borderTopColor };
  });
}

test('options are numbered from 1 in a holo cap, matching the digit hotkeys', async ({ page }) => {
  await approachPrompt(page);
  const buttons = page.locator('.choices button');
  const n = await buttons.count();
  expect(n).toBeGreaterThanOrEqual(2);
  // Chromium reports the unresolved counter(); other engines the digit itself.
  const cap = (i) => buttons.nth(i).evaluate((e) => {
    const before = getComputedStyle(e, '::before');
    return { content: before.content, color: before.color };
  });
  const first = await cap(0);
  expect(first.content === '"1"' || first.content.includes('counter(plate)')).toBe(true);
  expect(first.color).toBe(HOLO);
  const second = await cap(1);
  expect(second.content === '"2"' || second.content.includes('counter(plate)')).toBe(true);
});

test('hover ignites an option: text and border go gold-bright', async ({ page }) => {
  const pointerFine = await page.evaluate(() => matchMedia('(pointer: fine)').matches);
  test.skip(!pointerFine, 'hover is a desktop-pointer affordance');
  await approachPrompt(page);
  // Option TWO: the first is script-focused after approach; rest is read where
  // neither hover nor focus lives.
  const choice = page.locator('.choices button').nth(1);
  const rest = await ignition(choice);
  expect(rest.color).not.toBe(GOLD_BRIGHT);
  await choice.hover();
  await expect.poll(() => ignition(choice)).toEqual({ color: GOLD_BRIGHT, border: GOLD_BRIGHT });
});

test('a mouse arrival shows no focus ring on the first option', async ({ page }) => {
  await approachPrompt(page);
  const choice = page.locator('.choices button').first();
  await expect(choice).toBeFocused();
  expect(await choice.evaluate((e) => getComputedStyle(e).outlineStyle)).toBe('none');
});

test('keyboard arrival lights the first option gold and rings it holo', async ({ page }) => {
  // A real Tab+Enter activation, not approachPrompt()'s mouse click: the ring
  // is gated on keyboard input (stage.js's kb-focus class).
  await page.keyboard.press('Tab'); // theme toggle
  await page.keyboard.press('Tab'); // approach prompt
  await page.keyboard.press('Enter');
  const choice = page.locator('.choices button').first();
  await expect(choice).toBeFocused();
  await expect.poll(() => ignition(choice)).toEqual({ color: GOLD_BRIGHT, border: GOLD_BRIGHT });
  const ring = await choice.evaluate((e) => {
    const cs = getComputedStyle(e);
    return { color: cs.outlineColor, width: cs.outlineWidth, offset: cs.outlineOffset };
  });
  expect(ring).toEqual({ color: HOLO, width: '1px', offset: '3px' });
});

// The option's box is fixed by its spoke and nothing in the ignition moves
// layout. Measure where the label TEXT starts, via a Range over its text
// node, to prove it.
async function labelTextX(locator) {
  return locator.evaluate((el) => {
    const range = document.createRange();
    range.selectNodeContents(el.firstChild);
    return range.getClientRects()[0].x;
  });
}

test('ignition does not shift the label', async ({ page }) => {
  const pointerFine = await page.evaluate(() => matchMedia('(pointer: fine)').matches);
  test.skip(!pointerFine, 'hover is a desktop-pointer affordance');
  await approachPrompt(page);
  await expect(page.locator('.card')).toHaveCSS('opacity', '1', { timeout: 5000 });
  const choice = page.locator('.choices button').nth(1);
  const beforeX = await labelTextX(choice);
  await choice.hover();
  const afterX = await labelTextX(choice);
  expect(afterX).toBeCloseTo(beforeX, 0);
});

test('the system option and Leave share the same ignition', async ({ page }) => {
  const pointerFine = await page.evaluate(() => matchMedia('(pointer: fine)').matches);
  test.skip(!pointerFine, 'hover is a desktop-pointer affordance');
  await approachPrompt(page);
  for (const selector of ['.choices button.system', '#end-dialogue']) {
    const el = page.locator(selector).first();
    await expect(el).toBeVisible();
    await el.hover();
    await expect.poll(async () => (await ignition(el)).color).toBe(GOLD_BRIGHT);
    // Both navigate or exit on a real click — release away from the element.
    await page.mouse.move(0, 0);
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
