// geom.js — rect-geometry helpers shared across e2e specs.

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
