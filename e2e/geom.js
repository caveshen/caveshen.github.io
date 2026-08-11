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

// Explicit absence check for the identity markup the glass plaque replaced
// (avatar art + nameplate) — deletion of the markup is not itself a green e2e signal.
export async function assertNoIdentityMarkup(page) {
  await expect(page.locator('.card-head')).toHaveCount(0);
  await expect(page.locator('.avatar')).toHaveCount(0);
  await expect(page.locator('.name')).toHaveCount(0);
}

// Asserts the plaque's glass surface (translucent, blurred) and etched inner frame
// (hairline outline + eight corner-bracket gradient layers) render. Returns the
// resolved background-color so a caller can prove night and day differ.
export async function assertPlaqueGlass(page) {
  const style = await page.locator('.card').evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      backdropFilter:  cs.backdropFilter || cs.webkitBackdropFilter || '',
      backgroundColor: cs.backgroundColor,
      outlineStyle:    cs.outlineStyle,
      outlineOffset:   cs.outlineOffset,
      backgroundImage: cs.backgroundImage,
    };
  });
  expect(style.backdropFilter).toContain('blur');
  expect(style.outlineStyle).not.toBe('none');
  expect(parseFloat(style.outlineOffset)).toBeLessThan(0); // negative-offset hairline
  // Four corner brackets, two gradient arms each.
  expect((style.backgroundImage.match(/linear-gradient/g) ?? []).length).toBe(8);
  const alpha = parseFloat(style.backgroundColor.match(/,\s*([\d.]+)\)$/)?.[1] ?? '1');
  expect(alpha).toBeLessThan(1); // translucent — the scene must show through
  return style.backgroundColor;
}

// Seeks the card's etched-frame custom-property transitions (--frame/--frame-faint,
// Stage.astro) to a point in [0,1] of their active duration (0 = just-armed start
// value, 1 = settled), pausing every .card animation there — opacity/transform
// freeze at a fixed point too, so a diff between two samples is attributable to
// the frame's own colour change alone. WAAPI currentTime seeks a CSS transition
// directly, so real time never races. waitForFunction guards the first call
// against reading before the transition has actually started.
export async function seekFrameTransition(page, fraction) {
  await page.waitForFunction(() =>
    document.querySelector('.card').getAnimations()
      .some((a) => a.transitionProperty === '--frame'));
  return page.evaluate((fraction) => {
    const card = document.querySelector('.card');
    card.getAnimations().forEach((a) => {
      if (a.transitionProperty === '--frame' || a.transitionProperty === '--frame-faint') {
        const timing = a.effect.getComputedTiming();
        a.currentTime = (timing.delay ?? 0) + (timing.duration ?? 0) * fraction;
      }
      a.pause();
    });
    const cs   = getComputedStyle(card);
    const rect = (r) => r && { x: r.x, y: r.y, width: r.width, height: r.height };
    const btn  = card.querySelector('.choices button');
    // Engines disagree on the RGB channels a colour interpolation reports for
    // "transparent" (some report 0,0,0, some premultiply toward the other
    // endpoint's RGB) — alpha alone is the portable "not drawn yet" signal.
    const outlineAlpha = parseFloat(cs.outlineColor.match(/,\s*([\d.]+)\)$/)?.[1] ?? '1');
    return {
      outlineColor:      cs.outlineColor,
      outlineAlpha,
      backgroundImage:   cs.backgroundImage,
      outlineWidth:      cs.outlineWidth,
      outlineOffset:     cs.outlineOffset,
      backgroundSize:    cs.backgroundSize,
      backgroundPosition: cs.backgroundPosition,
      cardRect: rect(card.getBoundingClientRect()),
      btnRect:  btn && rect(btn.getBoundingClientRect()),
    };
  }, fraction);
}

// Compares two {x,y,width,height} rects with a small px tolerance — real
// engines can settle sub-pixel layout (dynamic-viewport-unit rounding, a
// focus-triggered scroll) between two samples with no size-affecting CSS
// change of their own between them.
export function expectRectClose(actual, expected, eps = 3) {
  for (const key of ['x', 'y', 'width', 'height']) {
    expect(Math.abs(actual[key] - expected[key]), `${key}: ${actual[key]} vs ${expected[key]}`)
      .toBeLessThan(eps);
  }
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
