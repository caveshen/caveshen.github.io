import { describe, it, expect } from 'vitest';
import { moonPhase, shadowPath } from '../scripts/moonphase.js';

// USNO reference instants (UTC). Sector-name assertions are robust to the
// synodic-month approximation; fraction assertions carry a real tolerance.
const NEW_MOON = new Date('2024-01-11T11:57:00Z');
const FIRST_QUARTER = new Date('2024-01-18T03:53:00Z');
const FULL_MOON = new Date('2024-01-25T17:54:00Z');
const EPOCH = new Date('2000-01-06T18:14:00Z');

describe('moonPhase', () => {
  it('calls the epoch instant a new moon', () => {
    expect(moonPhase(EPOCH).name).toBe('new');
  });

  it('reads the Jan 2024 new moon as new and unlit', () => {
    const p = moonPhase(NEW_MOON);
    expect(p.name).toBe('new');
    expect(p.fraction).toBeLessThan(0.08);
  });

  it('reads the Jan 2024 full moon as full and lit', () => {
    const p = moonPhase(FULL_MOON);
    expect(p.name).toBe('full');
    expect(p.fraction).toBeGreaterThan(0.92);
  });

  it('reads the Jan 2024 first quarter as a waxing half', () => {
    const p = moonPhase(FIRST_QUARTER);
    expect(p.name).toBe('first quarter');
    expect(p.waxing).toBe(true);
    expect(p.fraction).toBeGreaterThan(0.42);
    expect(p.fraction).toBeLessThan(0.58);
  });

  it('returns eight distinct names across one synodic month', () => {
    const names = new Set();
    for (let d = 0; d < 30; d++) {
      const t = new Date(NEW_MOON.getTime() + d * 24 * 3600 * 1000);
      names.add(moonPhase(t).name);
    }
    expect(names.size).toBe(8);
  });
});

describe('shadowPath', () => {
  const R = 47.5;

  it('covers the whole disc at new moon', () => {
    const d = shadowPath(0, R);
    expect(d).toContain(`A ${R},${R}`);
    expect(d).toContain('Z');
  });

  it('is empty at full moon', () => {
    expect(shadowPath(0.5, R)).toBe('');
  });

  it('has a straight terminator at first quarter (rx collapses to 0)', () => {
    const d = shadowPath(0.25, R);
    expect(d).toMatch(new RegExp(`A 0(\\.0*)?,${R}`));
  });

  it('mirrors the terminator to the other limb when waning', () => {
    const sweeps = (s) => [...s.matchAll(/A [\d.]+,[\d.]+ 0 0 (\d)/g)].map((m) => +m[1]);
    // northern-hemisphere convention: waxing shadow hugs the left limb
    // (sweep 0), waning the right (sweep 1); crescent terminators bow outward
    // with the same sweep as their limb
    const wax = shadowPath(0.15, R);
    const wan = shadowPath(0.85, R);
    expect(sweeps(wax)).toEqual([0, 0]);
    expect(sweeps(wan)).toEqual([1, 1]);
  });
});
