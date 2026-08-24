import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// The antenna beacon's placement is world-data, not render geometry: it must
// sit on the tallest CITY-BOWL building (x >= 40 — the harbour cranes stand
// taller by design and are exempt). Pinned against CityScape's source array.
const src = readFileSync(join(__dirname, '../components/CityScape.astro'), 'utf8');

const arrayBody = src.match(/const BUILDINGS[^=]*= \[([\s\S]*?)\];/)[1];
const entries = [...arrayBody.matchAll(/\[(-?\d+),\s*(-?\d+),\s*(\d+),\s*(\d+)\]/g)]
  .map((m) => ({ x: +m[1], y: +m[2], w: +m[3], h: +m[4] }));

describe('cityscape beacon placement', () => {
  it('parsed the building array', () => {
    expect(entries.length).toBeGreaterThan(15);
  });

  it('the beacon sits within the tallest city-bowl tower\'s x-span', () => {
    // City bowl = x >= 40 (harbour end sits left of it) AND w >= 20 (crane
    // hooks/cables are 3 wide, booms 110 wide but at negative x).
    const city = entries.filter((b) => b.x >= 40 && b.w >= 20);
    // tallest = highest roofline = smallest top y
    const tallest = city.reduce((a, b) => (b.y < a.y ? b : a));
    const beacon = src.match(/class="f-beacon[^"]*" cx="(\d+(?:\.\d+)?)" cy="(\d+(?:\.\d+)?)"/);
    expect(beacon).toBeTruthy();
    const cx = Number(beacon[1]);
    const cy = Number(beacon[2]);
    expect(cx).toBeGreaterThanOrEqual(tallest.x);
    expect(cx).toBeLessThanOrEqual(tallest.x + tallest.w);
    // the light floats just clear of the roofline
    expect(cy).toBeLessThan(tallest.y);
    expect(cy).toBeGreaterThan(tallest.y - 8);
  });
});
