// portrait-handoff — gate predicate unit tests.
// shouldHandoff is a pure function: all five gate conditions as explicit parameters.
import { describe, it, expect } from 'vitest';
import { shouldHandoff } from '../scripts/portrait-handoff.js';

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
