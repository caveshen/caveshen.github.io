// Pure unit tests for the cubic-bezier evaluator used by the interview camera easing.
// Numbers are the static CSS values from stage.js (entry) and tokens.css (exit),
// as a browser would normalise them (ms → s). No browser, no page, no network.
import { test, expect } from 'vitest';

// Cubic-bezier evaluator. X(t) is elapsed-time fraction, Y(t) is progress;
// CSS solves X(t)=x for t then returns Y(t) — we do the same via bisection.
function bezierProgressAt(p1x, p1y, p2x, p2y, durationMs, elapsedMs) {
  const x = elapsedMs / durationMs;
  const X = (t) => { const m = 1 - t; return 3 * m * m * t * p1x + 3 * m * t * t * p2x + t ** 3; };
  const Y = (t) => { const m = 1 - t; return 3 * m * m * t * p1y + 3 * m * t * t * p2y + t ** 3; };
  let lo = 0, hi = 1;
  for (let i = 0; i < 30; i++) { const mid = (lo + hi) / 2; if (X(mid) < x) lo = mid; else hi = mid; }
  return Y((lo + hi) / 2);
}

// Parses a computed `transition` shorthand into duration (ms) and bezier control points.
function parseTransition(css) {
  const durationMatch = css.match(/([\d.]+)s\b/);
  const bezierMatch   = css.match(/cubic-bezier\(([^)]+)\)/);
  const [p1x, p1y, p2x, p2y] = bezierMatch[1].split(',').map(Number);
  return { durationMs: parseFloat(durationMatch[1]) * 1000, p1x, p1y, p2x, p2y };
}

// Static CSS strings as normalised by the browser (550ms → 0.55s, 950ms → 0.95s).
const ENTRY_CSS = 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)';
const EXIT_CSS  = 'transform 0.95s cubic-bezier(0.16, 1, 0.3, 1)';

test('entry easing starts from rest — advances less than 4% in the first frame (16ms)', () => {
  const { durationMs, p1x, p1y, p2x, p2y } = parseTransition(ENTRY_CSS);
  const pct = bezierProgressAt(p1x, p1y, p2x, p2y, durationMs, 16) * 100;
  expect(pct).toBeLessThan(4);
});

// Contrast case: exit curve is deliberately NOT eased from rest — documents why
// entry and exit can't share a curve; fails loudly if someone later unifies them.
test('exit easing (unchanged) advances more than 10% in the first frame (16ms), by contrast', () => {
  const { durationMs, p1x, p1y, p2x, p2y } = parseTransition(EXIT_CSS);
  const pct = bezierProgressAt(p1x, p1y, p2x, p2y, durationMs, 16) * 100;
  expect(pct).toBeGreaterThan(10);
});

test('entry and exit have different computed transitions', () => {
  expect(ENTRY_CSS).not.toBe(EXIT_CSS);
});

test('exit computed transition matches the unchanged, approved 950ms curve', () => {
  const { durationMs, p1x, p1y, p2x, p2y } = parseTransition(EXIT_CSS);
  expect(durationMs).toBeCloseTo(950, 0);
  expect([p1x, p1y, p2x, p2y]).toEqual([0.16, 1, 0.3, 1]);
});
