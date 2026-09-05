// geom.js — rect-geometry helpers shared across e2e specs.
import { expect } from '@playwright/test';

export function rectsIntersect(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x &&
         a.y < b.y + b.height && a.y + a.height > b.y;
}

// Several .js-character / .face-void copies exist (one per scene variant) —
// only the one in the visible scene has a non-zero box. Mirrors the lookup
// stage.js's own visibleOne() does.
export async function visibleRect(page, selector) {
  return page.evaluate((sel) => {
    const el = [...document.querySelectorAll(sel)].find((e) => e.getBoundingClientRect().width > 0);
    const r  = el.getBoundingClientRect();
    return { x: r.left, y: r.top, width: r.width, height: r.height };
  }, selector);
}

// Screen rects of every element matching selector inside the currently visible
// .scene variant (the other two copies sit in the DOM with a zero-size rect).
export async function sceneRects(page, selector) {
  return page.evaluate((sel) => {
    const scene = [...document.querySelectorAll('.scene')].find((e) => e.getBoundingClientRect().width > 0);
    return [...scene.querySelectorAll(sel)].map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left, y: r.top, width: r.width, height: r.height };
    });
  }, selector);
}

// Live handle to the visible .scene copy (only one has a non-zero box) — for
// callers that need to read more than a rect off it (e.g. computed style on
// its children), where sceneRects's plain-value return isn't enough.
export async function visibleSceneHandle(page) {
  return page.evaluateHandle(() =>
    [...document.querySelectorAll('.scene')].find((e) => e.getBoundingClientRect().width > 0));
}

// Does A paint after B (later in document order = drawn on top), scoped to the
// visible scene variant. SVG paint order is document order.
export async function paintsOver(page, aSel, bSel) {
  return page.evaluate(([aSel, bSel]) => {
    const scene = [...document.querySelectorAll('.scene')].find((e) => e.getBoundingClientRect().width > 0);
    const a = scene.querySelector(aSel);
    const b = scene.querySelector(bSel);
    return !!(b.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_FOLLOWING);
  }, [aSel, bSel]);
}

export function rectContains(outer, inner) {
  return inner.x >= outer.x && inner.y >= outer.y &&
         inner.x + inner.width  <= outer.x + outer.width &&
         inner.y + inner.height <= outer.y + outer.height;
}

// Asserts the companion portrait's geometry against the record: no overlap,
// vertically centred on it, and one rem of gap to its left edge
// (sheet.astro's `right: calc(100% + 1rem)`). Read from the DOM, not
// hardcoded pixel twins — holds if --portrait or the record width ever move.
export async function assertPortraitGeometry(page, portrait) {
  const portraitBox = await portrait.boundingBox();
  const recordBox   = await page.locator('.record').boundingBox();
  const rem = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
  expect(rectsIntersect(portraitBox, recordBox)).toBe(false);
  const portraitCenterY = portraitBox.y + portraitBox.height / 2;
  const recordCenterY   = recordBox.y + recordBox.height / 2;
  expect(Math.abs(portraitCenterY - recordCenterY)).toBeLessThan(2);
  const gap = recordBox.x - (portraitBox.x + portraitBox.width);
  expect(Math.abs(gap - rem)).toBeLessThan(2);
}

// The dialogue's ground: a soft dark radial gradient behind the subtitle and
// the wheel, no plaque. Returns the background-image so a caller can prove
// the HUD holds the night register in both themes.
export async function dialogueGround(page) {
  const bg = await page.locator('.card').evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(bg).toContain('radial-gradient');
  return bg;
}

// Frozen-state sampling: pauses an element's own animation(s) at the settled
// (finished) value and reads the resulting opacity, rather than racing real
// time — the house idiom for animated-value assertions (WAAPI seek, never a
// proxy wait). Shared by the approach-prompt's reveal/linger fade tests.
export async function settledOpacity(locator) {
  return locator.evaluate((el) => {
    el.getAnimations().forEach((a) => {
      const timing = a.effect.getComputedTiming();
      a.currentTime = (timing.delay ?? 0) + (timing.duration ?? 0);
      a.pause();
    });
    return parseFloat(getComputedStyle(el).opacity);
  });
}

// Reveals the approach prompt by hovering the visible character's hit
// surface, then clicks it. The prompt starts pointer-events:none (approach-
// reveal), so a direct click without this hover first is never actionable —
// shared by every spec that needs to get past the prompt to the dialogue.
export async function approachPrompt(page) {
  await page.locator('.js-character-hit:visible').first().hover();
  await page.locator('#approach-prompt').click();
}

// Resolves when the .bg-layer transform transition settles after a mouse move,
// or immediately when drift will not fire (coarse pointer or reduced motion).
// Call BEFORE the mouse move so the transitionend listener is registered first.
export async function waitBgSettle(page) {
  return page.evaluate(() => new Promise(r => {
    if (!matchMedia('(pointer: fine)').matches ||
        matchMedia('(prefers-reduced-motion: reduce)').matches) {
      r();
      return;
    }
    const el = document.querySelector('.bg-layer');
    el.addEventListener('transitionend', (e) => { if (e.target === el) r(); });
  }));
}

// Asserts the portrait is suppressed: tx≈0 (slide-in not running) and Y=-50% centring intact.
// Precondition: page.clock.install({ time: 0 }) must be called before navigation at the call site,
// and virtual time must stay inside the animation's 200ms delay when this runs. In that window,
// portrait-slide-in (fill-mode:both) holds its from-keyframe translateX(-40%), so a correctly
// gated portrait reads tx=0 and an unsuppressed one reads tx≈-40% and fails the assertion.
export async function assertPortraitNoAnim(locator) {
  const geom = await locator.evaluate((el) => {
    const m = new DOMMatrix(getComputedStyle(el).transform);
    return { tx: m.m41, ty: m.m42, halfH: el.getBoundingClientRect().height / 2 };
  });
  expect(Math.abs(geom.tx)).toBeLessThan(1);
  // translateY(-50%) does the vertical centring. It must survive animation suppression.
  expect(geom.ty).toBeCloseTo(-geom.halfH, 1);
}
