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

// Asserts the portrait's geometry against the nameplate and sheet-grid:
// no overlap, vertically centred on the grid, and gap matches the grid's column-gap.
// Read from the DOM, not hardcoded pixel twins — holds if --portrait or grid gap ever move.
export async function assertPortraitGeometry(page, portrait) {
  const portraitBox  = await portrait.boundingBox();
  const nameplateBox = await page.locator('.nameplate').boundingBox();
  const grid         = page.locator('.sheet-grid');
  const gridBox      = await grid.boundingBox();
  const gridGap      = await grid.evaluate((el) => parseFloat(getComputedStyle(el).columnGap));
  expect(rectsIntersect(portraitBox, nameplateBox)).toBe(false);
  expect(rectsIntersect(portraitBox, gridBox)).toBe(false);
  const portraitCenterY = portraitBox.y + portraitBox.height / 2;
  const gridCenterY     = gridBox.y + gridBox.height / 2;
  expect(Math.abs(portraitCenterY - gridCenterY)).toBeLessThan(2);
  const gap = gridBox.x - (portraitBox.x + portraitBox.width);
  expect(Math.abs(gap - gridGap)).toBeLessThan(2);
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

// Asserts the portrait is suppressed at virtual t=0: tx≈0 (slide-in not running) and Y=-50% centring intact.
// Precondition: page.clock.install({ time: 0 }) must be called before navigation at the call site.
// At t=0, portrait-slide-in (fill-mode:both, 200ms delay) holds its from-keyframe: translateX(-40%).
// A correctly gated animation reads tx=0; an unsuppressed one reads tx≈-40% and fails the assertion.
export async function assertPortraitNoAnim(locator) {
  const geom = await locator.evaluate((el) => {
    const m = new DOMMatrix(getComputedStyle(el).transform);
    return { tx: m.m41, ty: m.m42, halfH: el.getBoundingClientRect().height / 2 };
  });
  // clock.install freezes the CSS animation timeline at t=0. An unsuppressed portrait-slide-in
  // holds its from-keyframe (tx≈-40%) and fails here; a gated animation reads tx=0 and passes.
  expect(Math.abs(geom.tx)).toBeLessThan(1);
  // translateY(-50%) is load-bearing — vertical centring must survive animation suppression.
  expect(geom.ty).toBeCloseTo(-geom.halfH, 1);
}
