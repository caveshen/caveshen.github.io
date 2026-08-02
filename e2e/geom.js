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
