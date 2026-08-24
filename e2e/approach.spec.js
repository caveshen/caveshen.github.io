// The approach — e2e tests
import { test, expect } from '@playwright/test';
import {
  visibleRect, seekFrameTransition, expectRectClose,
  settledOpacity, approachPrompt, sampleAnimationAt,
  armFrameFreeze, sampleFrameTransition, waitFrameSettled,
} from './geom.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

// Same behaviour is shared code, so parity tests run on both routes.
const ROUTES = ['/', '/404'];

// Timing constants — must match stage.js's own (PROMPT_FADE_MS/PROMPT_LINGER_MS/
// EXIT_REFOCUS_MS). Kept here as plain numbers (not imported) since stage.js
// doesn't export them — a drift between the two would show up as a wrong
// clock.fastForward boundary failing, not a silent pass.
const PROMPT_FADE_MS = 500;
const PROMPT_LINGER_MS = 1000;
const EXIT_REFOCUS_MS = 1000;
// Must match stage.js's own LIGHT_ARM_MS/LIGHT_FADE_MS — see the note above.
const LIGHT_ARM_MS = 5000;
const LIGHT_FADE_MS = 500;
// The light's colour channel — present in the filter string while lit,
// absent once stood down. Checking the colour, not the exact blur-radius
// serialization, keeps this test stable across engines.
const LIGHT_COLOUR = '255, 215, 94';

test('card not visible on load with JS', async ({ page }) => {
  await expect(page.locator('.card')).not.toBeVisible();
});

for (const route of ROUTES) {
  test(`at rest the scene is clean — the prompt is invisible and inert — ${route}`, async ({ page }) => {
    await page.goto(route);
    const prompt = page.locator('#approach-prompt');
    // toBeVisible() alone would pass here even at opacity:0 (it doesn't check
    // opacity) — the actual "clean at rest" contract is the computed style.
    const style = await prompt.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { opacity: cs.opacity, pointerEvents: cs.pointerEvents };
    });
    expect(style.opacity).toBe('0');
    expect(style.pointerEvents).toBe('none');
  });
}

test('approach prompt has a non-empty accessible name, even hidden at rest', async ({ page }) => {
  const prompt = page.locator('#approach-prompt');
  // Checked via the accessibility tree (not raw textContent) so an
  // aria-label="" regression is caught too, not just missing button text.
  await expect(prompt).toHaveAccessibleName(/\S/);
});

test('the prompt is floating text — no box, border, or glass chrome', async ({ page }) => {
  const style = await page.locator('#approach-prompt').evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      borderStyle: cs.borderTopStyle,
      background: cs.backgroundColor,
      backdropFilter: cs.backdropFilter || cs.webkitBackdropFilter || '',
      textShadow: cs.textShadow,
    };
  });
  expect(style.borderStyle).toBe('none');
  expect(style.background).toBe('rgba(0, 0, 0, 0)');
  expect(style.backdropFilter === '' || style.backdropFilter === 'none').toBe(true);
  expect(style.textShadow).not.toBe('none'); // the shadow carries the AA contrast duty instead
});

test('the revealed prompt has a hit area at least 44px tall and 44px wide', async ({ page }) => {
  const prompt = page.locator('#approach-prompt');
  await page.locator('.js-character-hit:visible').first().hover();
  expect(await settledOpacity(prompt)).toBe(1);
  const box = await prompt.boundingBox();
  expect(box.height).toBeGreaterThanOrEqual(44);
  expect(box.width).toBeGreaterThanOrEqual(44);
});

test('the character hit surface has the pointer cursor', async ({ page }) => {
  const hit = page.locator('.js-character-hit:visible').first();
  const cursor = await hit.evaluate((el) => getComputedStyle(el).cursor);
  expect(cursor).toBe('pointer');
});

test('hovering the character reveals the prompt with a 500ms fade to full opacity', async ({ page }) => {
  const prompt = page.locator('#approach-prompt');
  await page.locator('.js-character-hit:visible').first().hover();
  const duration = await prompt.evaluate((el) => {
    const anim = el.getAnimations()[0];
    return anim?.effect.getComputedTiming().duration;
  });
  expect(duration).toBe(PROMPT_FADE_MS);
  expect(await settledOpacity(prompt)).toBe(1);
});

test('hovering the prompt itself keeps it visible — travelling from the character to it never loses it', async ({ page }) => {
  const prompt = page.locator('#approach-prompt');
  await page.locator('.js-character-hit:visible').first().hover();
  await prompt.hover(); // leaves the character, enters the prompt
  expect(await settledOpacity(prompt)).toBe(1);
});

test('linger: leaving both character and prompt holds the prompt for ~1s, then fades it out', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  const prompt = page.locator('#approach-prompt');

  await page.locator('.js-character-hit:visible').first().hover();
  expect(await settledOpacity(prompt)).toBe(1);

  // install() alone still lets Date/timers progress with real time — freeze
  // it here (a generous future point, computed Node-side so there's no page
  // round-trip for real time to sneak into) so the boundary checked below
  // isn't muddied by however long a slower project's steps take in real time.
  await page.clock.pauseAt(Date.now() + 60_000);

  // Move off both the character and the prompt — the linger timer starts.
  await page.mouse.move(0, 0);

  // Just short of the linger — the fade-out must not have started yet.
  await page.clock.fastForward(PROMPT_LINGER_MS - 50);
  const midOpacity = await prompt.evaluate((el) => parseFloat(getComputedStyle(el).opacity));
  expect(midOpacity).toBe(1);

  // Cross the linger boundary — hidePrompt() fires and starts the fade-out.
  await page.clock.fastForward(100);
  expect(await settledOpacity(prompt)).toBe(0);
});

// Deliberately real time, no page.clock — proves the linger's own setTimeout
// actually fires against the wall clock, not only against a virtual one. No
// click anywhere in this test: a pure hover-then-leave.
test('pure hover-away fades the prompt in real time — a stepped pointer path off both elements, no click', async ({ page }) => {
  const prompt = page.locator('#approach-prompt');
  await page.locator('.js-character-hit:visible').first().hover();
  expect(await settledOpacity(prompt)).toBe(1);

  // A real, stepped pointer path (not a teleport) off both the character and
  // the prompt, dispatching genuine intermediate pointermove events.
  await page.mouse.move(4, 4, { steps: 12 });

  await expect(async () => {
    expect(await settledOpacity(prompt)).toBe(0);
  }).toPass({ timeout: PROMPT_LINGER_MS + PROMPT_FADE_MS + 3000 });
});

test('a click on the character starts the dialogue directly, the same as activating the prompt', async ({ page }) => {
  const hit = page.locator('.js-character-hit:visible').first();
  await hit.click();
  await expect(page.locator('.card')).toBeVisible();
});

for (const route of ROUTES) {
  test(`after dialogue exit the scene starts clean again, with no leftover reveal state — ${route}`, async ({ page }) => {
    await page.clock.install();
    await page.clock.pauseAt(Date.now() + 60_000);
    await page.goto(route);
    const hit = page.locator('.js-character-hit:visible').first();
    const prompt = page.locator('#approach-prompt');

    await hit.click(); // direct approach — the character's own vector
    await page.locator('#end-dialogue').click();
    await page.clock.fastForward(EXIT_REFOCUS_MS + 100);
    await expect(prompt).toBeFocused(); // the delayed refocus

    // The camera has reset to identity, so the pointer (left resting where
    // "end dialogue" was clicked) may now sit over the repositioned
    // character — hover a fixed, always-present control well clear of the
    // character's generous hit padding (a screen-space coordinate risks
    // landing inside it on some viewports) so only focus (removed next) can
    // keep the prompt visible.
    await page.locator('#toggle').hover();

    // Move focus off the prompt with a real Tab — a leftover reveal state
    // would keep the prompt visible forever after this; a clean reset lets
    // it linger, then fade.
    await page.keyboard.press('Shift+Tab');
    await expect(prompt).not.toBeFocused();
    await page.clock.fastForward(PROMPT_LINGER_MS + 100);
    expect(await settledOpacity(prompt)).toBe(0);
  });
}

test('a single tap on the character approaches directly — no two-step, same as every other device', async ({ page }, testInfo) => {
  // .tap() needs a touch-capable context — gate on the project's static
  // hasTouch capability, same idiom button-feel.spec.js uses.
  test.skip(!testInfo.project.use.hasTouch, 'tap() requires a touch-capable project');
  const hit = page.locator('.js-character-hit:visible').first();
  await hit.tap();
  await expect(page.locator('.card')).toBeVisible();
});

test('reduced motion: a click on the character approaches instantly, no zoom transition', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  const hit = page.locator('.js-character-hit:visible').first();
  await hit.click();
  await expect(page.locator('.card')).toBeVisible();
});

test('keyboard focus reveals the prompt the same way as hover, with a visible focus indicator', async ({ page }) => {
  const prompt = page.locator('#approach-prompt');
  await page.keyboard.press('Tab'); // theme toggle
  await page.keyboard.press('Tab'); // approach prompt
  await expect(prompt).toBeFocused();
  expect(await settledOpacity(prompt)).toBe(1);
  const outlineStyle = await prompt.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outlineStyle).not.toBe('none');
});

test('approaching shows the card', async ({ page }) => {
  await approachPrompt(page);
  await expect(page.locator('.card')).toBeVisible();
});

for (const route of ROUTES) {
  test(`approaching hides the prompt — ${route}`, async ({ page }) => {
    await page.goto(route);
    await approachPrompt(page);
    await expect(page.locator('#approach-prompt')).not.toBeVisible();
  });
}

test('approaching applies a non-identity camera transform', async ({ page }) => {
  await approachPrompt(page);
  // el.style.transform is the JS-set target value; getComputedStyle mid-transition
  // returns the interpolated value at t≈0 (still identity), which would make this flaky.
  const transform = await page.locator('.camera').evaluate((el) => el.style.transform);
  expect(transform).not.toBe('');
  expect(transform).not.toBe('none');
});

for (const route of ROUTES) {
  test(`approach prompt is reachable by Tab from the toggle — ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.keyboard.press('Tab'); // theme toggle
    await page.keyboard.press('Tab'); // approach prompt
    await expect(page.locator('#approach-prompt')).toBeFocused();
  });

  test(`approach prompt activates with Enter — ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(page.locator('.card')).toBeVisible();
  });

  test(`approach prompt activates with Space — ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Space');
    await expect(page.locator('.card')).toBeVisible();
  });
}

for (const route of ROUTES) {
  test(`focus lands on first dialogue option after approaching — ${route}`, async ({ page }) => {
    await page.goto(route);
    await approachPrompt(page);
    await expect(page.locator('#choices button').first()).toBeFocused();
  });
}

// Focus manners: the first choice always receives focus on approach, but the
// visible highlight must track HOW focus arrived — a keyboard arrival keeps
// the ring (continuity); a pointer arrival must not look pre-selected. Native
// :focus-visible cannot make that distinction here: every engine matches it
// for a programmatic focus() redirect regardless of input modality, so the
// highlight gates on the kb-focus class stage.js sets from real key events.
test('keyboard arrival at the prompt shows the focus highlight on the first choice', async ({ page }) => {
  await page.keyboard.press('Tab'); // theme toggle
  await page.keyboard.press('Tab'); // approach prompt
  await page.keyboard.press('Enter');
  const firstChoice = page.locator('#choices button').first();
  await expect(firstChoice).toBeFocused();
  const outlineStyle = await firstChoice.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outlineStyle).not.toBe('none');
});

// A real page.mouse.click (not locator.focus(), which never carries pointer
// provenance) — the click lands on the character, not the choice button, so
// this also proves the highlight tracks input modality, not the click target.
test('a mouse click on the character (direct approach) shows no pre-selected highlight on the first choice', async ({ page }) => {
  const hit = page.locator('.js-character-hit:visible').first();
  const box = await hit.boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  const firstChoice = page.locator('#choices button').first();
  await expect(firstChoice).toBeFocused();
  const outlineStyle = await firstChoice.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outlineStyle).toBe('none');
});

for (const route of ROUTES) {
  test(`end-dialogue button hides the card; the prompt reappears and refocuses ~1s later — ${route}`, async ({ page }) => {
    await page.clock.install();
    // install() alone still lets Date/timers progress with real time — freeze
    // it here (a generous future point, computed Node-side so there's no page
    // round-trip for real time to sneak into) so the boundary checked below
    // isn't muddied by however long a slower project's steps take in real time.
    await page.clock.pauseAt(Date.now() + 60_000);
    await page.goto(route);
    await approachPrompt(page);
    await page.locator('#end-dialogue').click();
    await expect(page.locator('.card')).not.toBeVisible();

    const prompt = page.locator('#approach-prompt');
    // Immediately after exit: back in layout, but not yet focused or revealed —
    // nothing crosses the character while the camera settles.
    await expect(prompt).not.toBeFocused();
    expect(await prompt.evaluate((el) => getComputedStyle(el).opacity)).toBe('0');

    // Hovering the character mid-settle must not summon the prompt — the
    // camera-settle window suppresses reveals regardless of how the hover
    // happened (a real pointer move, or the dialogue card vanishing out from
    // under an already-stationary pointer).
    await page.locator('.js-character-hit:visible').first().hover();
    expect(await prompt.evaluate((el) => getComputedStyle(el).opacity)).toBe('0');

    // Just short of the delay — still not focused.
    await page.clock.fastForward(EXIT_REFOCUS_MS - 50);
    await expect(prompt).not.toBeFocused();

    // Crossing the delay — the delayed focus() fires, revealing the prompt
    // via the same path as hover.
    await page.clock.fastForward(100);
    await expect(prompt).toBeFocused();
    expect(await settledOpacity(prompt)).toBe(1);
  });

  test(`end-dialogue button resets camera to identity — ${route}`, async ({ page }) => {
    await page.goto(route);
    await approachPrompt(page);
    await page.locator('#end-dialogue').click();
    // Check the inline style directly — exit() sets camera.style.transform = 'none'
    const transform = await page.locator('.camera').evaluate((el) => el.style.transform);
    expect(transform).toBe('none');
  });

  test(`Escape exits dialogue and hides the card — ${route}`, async ({ page }) => {
    await page.goto(route);
    await approachPrompt(page);
    await page.keyboard.press('Escape');
    await expect(page.locator('.card')).not.toBeVisible();
  });

  test(`Escape: the prompt refocuses ~1s later, same as end-dialogue — ${route}`, async ({ page }) => {
    await page.clock.install();
    await page.goto(route);
    await approachPrompt(page);
    await page.keyboard.press('Escape');
    const prompt = page.locator('#approach-prompt');
    await expect(prompt).not.toBeFocused();
    await page.clock.fastForward(EXIT_REFOCUS_MS + 500);
    await expect(prompt).toBeFocused();
  });
}

test('reduced motion: exit refocuses the prompt immediately, no settle delay', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await approachPrompt(page);
  await page.locator('#end-dialogue').click();
  const prompt = page.locator('#approach-prompt');
  await expect(prompt).toBeFocused();
  expect(await prompt.evaluate((el) => parseFloat(getComputedStyle(el).opacity))).toBe(1);
});

test('reduced motion: hover reveal and linger fade-out are both instant', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  const prompt = page.locator('#approach-prompt');

  await page.locator('.js-character-hit:visible').first().hover();
  const duration = await prompt.evaluate((el) => el.getAnimations()[0]?.effect.getComputedTiming().duration);
  expect(duration).toBe(0);
  expect(await prompt.evaluate((el) => parseFloat(getComputedStyle(el).opacity))).toBe(1);

  await page.mouse.move(0, 0);
  expect(await settledOpacity(prompt)).toBe(0);
});

// The approach light — a steady edge-light on the character, done with a
// drop-shadow filter (never geometry). Frozen-state sampling throughout:
// a paused clock schedules the arm/re-arm timers, and sampleAnimationAt
// seeks the WAAPI filter animation to a chosen point instead of waiting on it.
for (const route of ROUTES) {
  test(`the approach light gathers on the character about 5s after load, as a drop-shadow filter — ${route}`, async ({ page }) => {
    await page.clock.install();
    await page.clock.pauseAt(Date.now() + 60_000);
    await page.goto(route);
    const character = page.locator('.js-character:visible').first();

    // Just short of the arm delay — the light must not have gathered yet.
    await page.clock.fastForward(LIGHT_ARM_MS - 50);
    const before = await sampleAnimationAt(character, LIGHT_FADE_MS);
    expect(before.filter).not.toContain(LIGHT_COLOUR);

    // Cross the arm delay — gatherLight() fires and starts the fade-in.
    await page.clock.fastForward(100);
    const after = await sampleAnimationAt(character, LIGHT_FADE_MS);
    expect(after.filter).toContain('drop-shadow');
    expect(after.filter).toContain(LIGHT_COLOUR);
  });
}

test('the approach light is a steady filter — it never pulses', async ({ page }) => {
  await page.clock.install();
  await page.clock.pauseAt(Date.now() + 60_000);
  await page.goto('/');
  await page.clock.fastForward(LIGHT_ARM_MS + 100);
  const character = page.locator('.js-character:visible').first();
  // Plain getAnimations() (no subtree) — targets .js-character directly, so
  // this can't pick up the Badger's own infinite sprite-swap animation from
  // a descendant .badger-image element (that one is legitimately infinite).
  const iterations = await character.evaluate((el) =>
    el.getAnimations().map((a) => a.effect.getComputedTiming().iterations)
  );
  expect(iterations.length).toBeGreaterThan(0);
  expect(iterations.every((i) => Number.isFinite(i))).toBe(true);
});

test('the approach light stands down on hover of the character', async ({ page }) => {
  await page.clock.install();
  await page.clock.pauseAt(Date.now() + 60_000);
  await page.goto('/');
  await page.clock.fastForward(LIGHT_ARM_MS + 100);
  const character = page.locator('.js-character:visible').first();
  expect((await sampleAnimationAt(character, LIGHT_FADE_MS)).filter).toContain(LIGHT_COLOUR);

  await page.locator('.js-character-hit:visible').first().hover();
  expect((await sampleAnimationAt(character, LIGHT_FADE_MS)).filter).not.toContain(LIGHT_COLOUR);
});

test('the approach light stands down on focus of the prompt', async ({ page }) => {
  await page.clock.install();
  await page.clock.pauseAt(Date.now() + 60_000);
  await page.goto('/');
  await page.clock.fastForward(LIGHT_ARM_MS + 100);
  const character = page.locator('.js-character:visible').first();
  expect((await sampleAnimationAt(character, LIGHT_FADE_MS)).filter).toContain(LIGHT_COLOUR);

  await page.keyboard.press('Tab'); // theme toggle
  await page.keyboard.press('Tab'); // approach prompt
  await expect(page.locator('#approach-prompt')).toBeFocused();
  expect((await sampleAnimationAt(character, LIGHT_FADE_MS)).filter).not.toContain(LIGHT_COLOUR);
});

test('the approach light stands down on click of the character, which also starts the dialogue', async ({ page }) => {
  await page.clock.install();
  await page.clock.pauseAt(Date.now() + 60_000);
  await page.goto('/');
  await page.clock.fastForward(LIGHT_ARM_MS + 100);
  const character = page.locator('.js-character:visible').first();
  expect((await sampleAnimationAt(character, LIGHT_FADE_MS)).filter).toContain(LIGHT_COLOUR);

  await page.locator('.js-character-hit:visible').first().click();
  expect((await sampleAnimationAt(character, LIGHT_FADE_MS)).filter).not.toContain(LIGHT_COLOUR);
});

test('engaging before the light arms cancels the gather — it never arrives late while still engaged', async ({ page }) => {
  await page.clock.install();
  await page.clock.pauseAt(Date.now() + 60_000);
  await page.goto('/');
  const character = page.locator('.js-character:visible').first();

  // Engage before the arm delay elapses, and stay engaged throughout.
  await page.locator('.js-character-hit:visible').first().hover();

  // Run the clock well past the original arm delay while still engaged — a
  // correctly-cancelled timer means the light still never gathers.
  await page.clock.fastForward(LIGHT_ARM_MS + 1000);
  expect((await sampleAnimationAt(character, LIGHT_FADE_MS)).filter).not.toContain(LIGHT_COLOUR);
});

// Engagement ending restarts the 5s idle countdown even with no dialogue involved.
test('the approach light gathers again once a hover ends, with no dialogue ever opening', async ({ page }) => {
  await page.clock.install();
  await page.clock.pauseAt(Date.now() + 60_000);
  await page.goto('/');
  const character = page.locator('.js-character:visible').first();

  await page.clock.fastForward(LIGHT_ARM_MS + 100);
  expect((await sampleAnimationAt(character, LIGHT_FADE_MS)).filter).toContain(LIGHT_COLOUR);

  await page.locator('.js-character-hit:visible').first().hover(); // stands the light down
  expect((await sampleAnimationAt(character, LIGHT_FADE_MS)).filter).not.toContain(LIGHT_COLOUR);

  await page.mouse.move(0, 0); // hover ends — idle begins again, the 5s countdown restarts

  // Just short of the restarted delay — still dark.
  await page.clock.fastForward(LIGHT_ARM_MS - 100);
  expect((await sampleAnimationAt(character, LIGHT_FADE_MS)).filter).not.toContain(LIGHT_COLOUR);

  // Cross it — the light gathers again.
  await page.clock.fastForward(150);
  expect((await sampleAnimationAt(character, LIGHT_FADE_MS)).filter).toContain(LIGHT_COLOUR);
});

for (const route of ROUTES) {
  test(`the approach light gathers again after dialogue close, once the refocused prompt is left too — ${route}`, async ({ page }) => {
    await page.clock.install();
    await page.clock.pauseAt(Date.now() + 60_000);
    await page.goto(route);
    const character = page.locator('.js-character:visible').first();

    await approachPrompt(page); // engages — the light stands down
    await page.locator('#end-dialogue').click();
    // The camera resets to identity, so the pointer (left resting where
    // "end dialogue" was clicked) may now sit over the repositioned
    // character — same defensive move the exit-refocus test makes, so a
    // stray hover can't stand a re-armed light straight back down.
    await page.locator('#toggle').hover();

    await page.clock.fastForward(EXIT_REFOCUS_MS + 50);
    await expect(page.locator('#approach-prompt')).toBeFocused();

    // The delayed refocus itself is still an engagement (prompt focused) —
    // not idle yet, so the light must not gather however long this runs.
    await page.clock.fastForward(LIGHT_ARM_MS + 500);
    expect((await sampleAnimationAt(character, LIGHT_FADE_MS)).filter).not.toContain(LIGHT_COLOUR);

    // Only once the visitor moves focus off the prompt does the scene
    // become idle and the 5s countdown start.
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('#approach-prompt')).not.toBeFocused();

    await page.clock.fastForward(LIGHT_ARM_MS - 100);
    expect((await sampleAnimationAt(character, LIGHT_FADE_MS)).filter).not.toContain(LIGHT_COLOUR);

    await page.clock.fastForward(150);
    expect((await sampleAnimationAt(character, LIGHT_FADE_MS)).filter).toContain(LIGHT_COLOUR);
  });
}

test('reduced motion: the light still gathers and stands down, with no fade duration', async ({ page }) => {
  await page.clock.install();
  await page.clock.pauseAt(Date.now() + 60_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const character = page.locator('.js-character:visible').first();

  await page.clock.fastForward(LIGHT_ARM_MS + 100);
  // Plain getAnimations() (no subtree) — the light's own animation targets
  // .js-character directly, so this can't pick up a Badger sprite-swap
  // animation from a descendant .badger-image element.
  const duration = await character.evaluate((el) =>
    el.getAnimations()[0]?.effect.getComputedTiming().duration
  );
  expect(duration).toBe(0);
  const lit = await character.evaluate((el) => getComputedStyle(el).filter);
  expect(lit).toContain(LIGHT_COLOUR);

  await page.locator('.js-character-hit:visible').first().hover();
  const stoodDown = await character.evaluate((el) => getComputedStyle(el).filter);
  expect(stoodDown).not.toContain(LIGHT_COLOUR);
});

test('the approach light reads in both themes', async ({ page }) => {
  await page.clock.install();
  await page.clock.pauseAt(Date.now() + 60_000);
  await page.goto('/');
  await page.locator('#toggle').click(); // day theme
  await page.clock.fastForward(LIGHT_ARM_MS + 100);
  const character = page.locator('.js-character:visible').first();
  expect((await sampleAnimationAt(character, LIGHT_FADE_MS)).filter).toContain(LIGHT_COLOUR);
});

// The light is a filter, never geometry — its bounding box must hold still
// while it gathers, same "click targets never animate their bounding box"
// contract the prompt and other stage controls keep.
test("the light's filter never moves the character's bounding box", async ({ page }) => {
  await page.clock.install();
  await page.clock.pauseAt(Date.now() + 60_000);
  await page.goto('/');
  const before = await visibleRect(page, '.js-character');
  await page.clock.fastForward(LIGHT_ARM_MS + 100);
  const after = await visibleRect(page, '.js-character');
  expectRectClose(after, before, 1);
});

test('camera transition-duration is 0s under prefers-reduced-motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  const duration = await page.locator('.camera').evaluate((el) =>
    window.getComputedStyle(el).transitionDuration
  );
  expect(duration).toBe('0s');
});

test('card has an opacity transition wired up (fades rather than pops)', async ({ page }) => {
  const { property, duration } = await page.locator('.card').evaluate((el) => {
    const cs = window.getComputedStyle(el);
    return { property: cs.transitionProperty, duration: cs.transitionDuration };
  });
  const props = property.split(', ');
  const idx = props.indexOf('opacity');
  expect(idx, `transitionProperty was "${property}"`).toBeGreaterThanOrEqual(0);
  expect(parseFloat(duration.split(', ')[idx])).toBeGreaterThan(0);
});

test('approaching fades the card in to full opacity', async ({ page }) => {
  await approachPrompt(page);
  await expect(page.locator('.card')).toHaveCSS('opacity', '1');
});

test('reduced motion: card fade is disabled, card is immediately full opacity', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  const duration = await page.locator('.card').evaluate((el) =>
    window.getComputedStyle(el).transitionDuration
  );
  expect(duration).toBe('0s');
  await approachPrompt(page);
  await expect(page.locator('.card')).toHaveCSS('opacity', '1');
});

// The three tests below sample the etched frame's --frame/--frame-faint
// custom-property transitions. A transition already running when you seek
// and pause it can have that seek land one frame late on a slow machine —
// harmless for a same/different comparison, but enough to break an exact
// near-zero threshold. armFrameFreeze() sidesteps this by freezing the
// transition the instant it's created (the freeze-at-birth idiom
// banner-plane.spec.js uses), before it has run a single frame, so every
// later seek lands on a stationary animation. The third test still settles
// in real time rather than via WAAPI pause — some engines don't reliably
// repaint a background-image driven by a paused custom-property transition —
// but it proves the frame's own transition finished directly, instead of
// inferring that from the unrelated opacity transition finishing.
test('approaching draws the etched frame in over the entrance window', async ({ page }) => {
  await armFrameFreeze(page);
  await approachPrompt(page);
  const start = await sampleFrameTransition(page, 0);
  const mid   = await sampleFrameTransition(page, 0.5);
  const end   = await sampleFrameTransition(page, 1);
  expect(start.outlineAlpha).toBeLessThan(0.01); // armed transparent by .card-entering
  expect(mid.outlineColor).not.toBe(start.outlineColor);
  expect(mid.outlineColor).not.toBe(end.outlineColor);
});

test('the frame also draws in under day theme, not just night', async ({ page }) => {
  await page.locator('#toggle').click();
  await armFrameFreeze(page);
  await approachPrompt(page);
  const start = await sampleFrameTransition(page, 0);
  expect(start.outlineAlpha).toBeLessThan(0.01);
});

test('resting frame colour is identical whether the entrance animates or not', async ({ page }) => {
  // Real-time settle, not WAAPI pause/seek — some engines don't reliably
  // repaint a background-image driven by a paused custom-property transition.
  // Waits on the frame's own transitionend, not on opacity finishing — opacity
  // finishing proves only the fade is done, not the colour transition.
  const settled = waitFrameSettled(page);
  const readCard = () => page.locator('.card').evaluate((el) => {
    const cs = getComputedStyle(el);
    return { outlineColor: cs.outlineColor, backgroundImage: cs.backgroundImage };
  });
  await approachPrompt(page);
  await settled;
  const animated = await readCard();

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  // The cursor is still parked over the pre-reload .js-character-hit's screen
  // position. The reload's fresh layout puts an element back at that exact
  // spot, so without a real move first, the browser sees no hover transition
  // to fire a fresh mouseenter for approachPrompt()'s hover() below.
  await page.mouse.move(0, 0);
  await approachPrompt(page);
  const reduced = await readCard();

  expect(animated.outlineColor).toBe(reduced.outlineColor);
  expect(animated.backgroundImage).toBe(reduced.backgroundImage);
});

test('reduced motion: the frame has no animation, its resting colour applies immediately', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await approachPrompt(page);
  const anims = await page.locator('.card').evaluate((el) =>
    el.getAnimations().filter((a) =>
      a.transitionProperty === '--frame' || a.transitionProperty === '--frame-faint'
    ).length
  );
  expect(anims).toBe(0);
  const outlineColor = await page.locator('.card').evaluate((el) => getComputedStyle(el).outlineColor);
  expect(outlineColor).not.toBe('rgba(0, 0, 0, 0)');
});

test('the frame reveal changes colour only — outline/bracket geometry and clickable boxes hold still', async ({ page }) => {
  await approachPrompt(page);
  const start = await seekFrameTransition(page, 0);
  const end   = await seekFrameTransition(page, 1);
  expect(end.outlineColor).not.toBe(start.outlineColor); // sanity: the frame did draw in
  expect(end.outlineWidth).toBe(start.outlineWidth);
  expect(end.outlineOffset).toBe(start.outlineOffset);
  expect(end.backgroundSize).toBe(start.backgroundSize);
  expect(end.backgroundPosition).toBe(start.backgroundPosition);
  expectRectClose(end.cardRect, start.cardRect);
  expectRectClose(end.btnRect, start.btnRect);
});

test('the corner brackets also draw in, not just the hairline', async ({ page }) => {
  // Real-time settle, not WAAPI pause/seek — some engines don't reliably
  // repaint a background-image driven by a paused custom-property transition.
  const before = await page.locator('.card').evaluate((el) => getComputedStyle(el).backgroundImage);
  await approachPrompt(page);
  await expect(page.locator('.card')).toHaveCSS('opacity', '1'); // settled: the frame shares this window
  const after = await page.locator('.card').evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(after).not.toBe(before);
});

for (const route of ROUTES) {
  test(`exiting mid-approach resets the fade so a re-approach fades in cleanly — ${route}`, async ({ page }) => {
    await page.goto(route);
    await approachPrompt(page);
    await page.keyboard.press('Escape');
    await approachPrompt(page);
    // Sampled right after the second click, before the fade delay elapses — if
    // exit() failed to reset the entering state, opacity would already be at 1 here.
    const opacity = await page.locator('.card').evaluate((el) => window.getComputedStyle(el).opacity);
    expect(parseFloat(opacity)).toBeLessThan(1);
    await expect(page.locator('.card')).toHaveCSS('opacity', '1');
  });
}

test('no-JS: card is fully opaque, not stuck at the fade\'s starting opacity', async ({ browser }) => {
  const ctx  = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('.card')).toHaveCSS('opacity', '1');
  await ctx.close();
});

test('no-JS: card is visible on load', async ({ browser }) => {
  const ctx  = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('.card')).toBeVisible();
  await ctx.close();
});

test('no-JS: /sheet link is reachable', async ({ browser }) => {
  const ctx  = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('a[href="/sheet"]')).toBeVisible();
  await ctx.close();
});

test('no-JS: end-dialogue button is not visible', async ({ browser }) => {
  const ctx  = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('#end-dialogue')).not.toBeVisible();
  await ctx.close();
});

test('the card stays fully on-screen on a short viewport', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 360 });
  await page.goto('/');
  await approachPrompt(page);
  await expect(async () => {
    const card = await page.locator('.card').boundingBox();
    const viewport = page.viewportSize();
    expect(card.x).toBeGreaterThanOrEqual(0);
    expect(card.y).toBeGreaterThanOrEqual(0);
    expect(card.x + card.width).toBeLessThanOrEqual(viewport.width);
    expect(card.y + card.height).toBeLessThanOrEqual(viewport.height);
  }).toPass();
});

// Table Mountain is authored once; each aspect variant only pans/scales the camera
// around it, never stretches it. getBBox() ignores ancestor transforms (including the
// camera pan/scale), so we measure post-transform with getBoundingClientRect() instead,
// at a viewport sized to force the target variant on.
// 600/254: baseline (y=352) overscans 6 units to y=358 for the d28 waterline-seam fix,
// so the polygon's own bbox height grew from 248 to 254 — see CityScape.astro.
const MOUNTAIN_RATIO = 2.3622;

async function mountainRatio(page, selector) {
  const box = await page.locator(selector).evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { width: r.width, height: r.height };
  });
  expect(box.height, 'Table Mountain rect has zero height — wrong/hidden scene variant selected').toBeGreaterThan(0);
  return box.width / box.height;
}

test('Table Mountain aspect ratio is 2.3622 in the standard view', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  const ratio = await mountainRatio(page, '.scene-standard .table-mountain');
  expect(ratio).toBeCloseTo(MOUNTAIN_RATIO, 3);
});

test('Table Mountain aspect ratio is 2.3622 in the wide view', async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1080 });
  await page.goto('/');
  const ratio = await mountainRatio(page, '.scene-wide .table-mountain');
  expect(ratio).toBeCloseTo(MOUNTAIN_RATIO, 3);
});

test('Table Mountain aspect ratio is 2.3622 in the tall view', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const ratio = await mountainRatio(page, '.scene-tall .table-mountain');
  expect(ratio).toBeCloseTo(MOUNTAIN_RATIO, 3);
});

// The district is drawn at world x < 0 (harbour end); none of the original geometry
// (mountains, city bowl) uses negative x, so a negative-x rect/polygon is a cheap,
// reliable proxy for its presence without depending on screen-space placement.

test('industrial district: the world group contains geometry west of x=0', async ({ page }) => {
  await page.goto('/');
  const hasNegativeX = await page.locator('.scene-standard .world').evaluate((worldEl) => {
    const rects = [...worldEl.querySelectorAll('rect')]
      .some((el) => parseFloat(el.getAttribute('x') ?? '0') < 0);
    const polys = [...worldEl.querySelectorAll('polygon')]
      .some((el) => (el.getAttribute('points') ?? '')
        .trim().split(/\s+/)
        .some((pair) => parseFloat(pair.split(',')[0]) < 0));
    return rects || polys;
  });
  expect(hasNegativeX).toBe(true);
});

test('each sea variant has at least 4 wave marks, visible in both day and night', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 }); // forces the standard variant on
  await page.goto('/');
  for (const variant of ['scene-standard', 'scene-wide', 'scene-tall']) {
    const count = await page.locator(`.${variant} .f-wave`).count();
    expect(count, `${variant} wave count`).toBeGreaterThanOrEqual(4);
  }
  // Confirm waves aren't gated behind night-only: visible by default, and after toggling to day.
  await expect(page.locator('.scene-standard .f-wave').first()).toBeVisible();
  await page.locator('#toggle').click();
  await expect(page.locator('.scene-standard .f-wave').first()).toBeVisible();
});

// Mirrors the negative-x test's world-space pattern rather than screen-space, but that
// test doesn't prove Devil's Peak exists on its own — only Lion's Head/Signal Hill are
// other standalone f-far polygons, and both sit right of and below Table Mountain's
// summit, so only a genuine Devil's Peak polygon can satisfy the check below.

// bg-layer holds mountains and city, fg-layer sea, ground and character.

const ROUTE_CHARACTERS = [
  { route: '/', characterClass: 'badger-figure', otherClass: 'hooded-figure' },
  { route: '/404', characterClass: 'hooded-figure', otherClass: 'badger-figure' },
];

for (const { route, characterClass, otherClass } of ROUTE_CHARACTERS) {
  test(`the ${characterClass} is present, the ${otherClass} is not — ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(route);
    await expect(page.locator(`.${characterClass}`)).toHaveCount(3);
    await expect(page.locator(`.${otherClass}`)).toHaveCount(0);
  });

  test(`each scene has a bg-layer (containing the mountain) and fg-layer (containing the sea and character) — ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 }); // forces the standard variant on
    await page.goto(route);
    for (const variant of ['scene-standard', 'scene-wide', 'scene-tall']) {
      await expect(page.locator(`.${variant} .bg-layer .table-mountain`)).toHaveCount(1);
      await expect(page.locator(`.${variant} .fg-layer .f-sea`)).toHaveCount(1);
      await expect(page.locator(`.${variant} .fg-layer .${characterClass}`)).toHaveCount(1);
    }
  });
}

// Reduced motion turns off the .camera (and .bg-layer) transition, so the
// dampened zoom applies instantly — a settled state with no timing wait needed.
test('approach dampens background growth relative to the foreground (parallax)', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 }); // forces the standard variant on
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const bgBefore = await visibleRect(page, '.table-mountain');
  const fgBefore = await visibleRect(page, '.js-character');
  await approachPrompt(page);
  const bgAfter = await visibleRect(page, '.table-mountain');
  const fgAfter = await visibleRect(page, '.js-character');
  const bgGrowth = bgAfter.height / bgBefore.height;
  const fgGrowth = fgAfter.height / fgBefore.height;
  expect(bgGrowth, `bg grew ${bgGrowth}x, fg grew ${fgGrowth}x`).toBeLessThan(fgGrowth);
  // The bg must track the damped curve, not merely grow "less" than the fg.
  expect(bgGrowth).toBeCloseTo(1 + (fgGrowth - 1) * 0.4, 1);
});

test("Devil's Peak: an f-far polygon apex sits above and left of Table Mountain's summit", async ({ page }) => {
  const found = await page.locator('.scene-standard .world').evaluate((worldEl) => {
    const parsePoints = (el) => el.getAttribute('points').trim().split(/\s+/)
      .map((pair) => pair.split(',').map(Number));

    const tmPoints = parsePoints(worldEl.querySelector('polygon.table-mountain'));
    const tmSummitY = Math.min(...tmPoints.map(([, y]) => y));
    const tmSummitX = tmPoints.find(([, y]) => y === tmSummitY)[0];

    const otherFarPolys = [...worldEl.querySelectorAll('polygon.f-far')]
      .filter((el) => !el.classList.contains('table-mountain'));

    return otherFarPolys.some((el) => parsePoints(el)
      .some(([x, y]) => y < tmSummitY && x < tmSummitX));
  });
  expect(found, "expected an f-far polygon (Devil's Peak) with a vertex higher and left of Table Mountain's summit").toBe(true);
});
