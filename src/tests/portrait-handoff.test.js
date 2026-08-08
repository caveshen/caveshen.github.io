// portrait-handoff — gate predicate and cleanup unit tests.
import { describe, it, expect } from 'vitest';
import { shouldHandoff, cleanupHandoff } from '../scripts/portrait-handoff.js';

describe('shouldHandoff', () => {
  it('returns true when all gates pass', () => {
    expect(shouldHandoff('/sheet', true, 1920, false, true)).toBe(true);
  });

  it('returns false when path is not /sheet', () => {
    expect(shouldHandoff('/', true, 1920, false, true)).toBe(false);
    expect(shouldHandoff('/other', true, 1920, false, true)).toBe(false);
    expect(shouldHandoff('', true, 1920, false, true)).toBe(false);
  });

  it('returns false when cross-document View Transitions are unsupported', () => {
    expect(shouldHandoff('/sheet', false, 1920, false, true)).toBe(false);
  });

  it('returns false when viewport width is below 1650', () => {
    expect(shouldHandoff('/sheet', true, 1649, false, true)).toBe(false);
    expect(shouldHandoff('/sheet', true, 1366, false, true)).toBe(false);
    expect(shouldHandoff('/sheet', true, 0, false, true)).toBe(false);
  });

  it('returns true at exactly 1650px (breakpoint boundary)', () => {
    expect(shouldHandoff('/sheet', true, 1650, false, true)).toBe(true);
  });

  it('returns false when reduced motion is active', () => {
    expect(shouldHandoff('/sheet', true, 1920, true, true)).toBe(false);
  });

  it('returns false when no figure is present', () => {
    expect(shouldHandoff('/sheet', true, 1920, false, false)).toBe(false);
  });

  it('returns false when multiple gates fail simultaneously', () => {
    expect(shouldHandoff('/', false, 1000, true, false)).toBe(false);
  });
});

describe('cleanupHandoff', () => {
  function makeImg(parent) {
    const img = document.createElement('img');
    parent.appendChild(img);
    return img;
  }

  function makeEl(tagName) {
    const el = document.createElement(tagName);
    el.style.animation  = 'none';
    el.style.opacity    = '0';
    el.style.visibility = 'hidden';
    return el;
  }

  it('removes the overlay element and clears freeze styles on both images', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const overlay = makeImg(container);
    const up      = makeEl('img');
    const down    = makeEl('img');

    cleanupHandoff(overlay, up, down);

    expect(overlay.parentNode).toBeNull();
    expect(up.style.animation).toBe('');
    expect(up.style.opacity).toBe('');
    expect(up.style.visibility).toBe('');
    expect(down.style.animation).toBe('');
    expect(down.style.opacity).toBe('');
    expect(down.style.visibility).toBe('');

    document.body.removeChild(container);
  });

  it('no-ops when overlay is null', () => {
    // Must not throw.
    expect(() => cleanupHandoff(null, null, null)).not.toThrow();
  });
});
