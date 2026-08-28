// Threshold cover: the duotone filter's tableValues (authored as literals — var()
// does not resolve in SVG presentation attributes) must track tokens.css, and the
// cover's text must clear AA over the photo's worst-case (brightest) region.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const tokensCSS = readFileSync(join(__dirname, '../styles/tokens.css'), 'utf8');
const coverAstro = readFileSync(join(__dirname, '../components/ThresholdCover.astro'), 'utf8');

function parseTokens(block) {
  const map = {};
  for (const [, name, value] of block.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    map['--' + name] = value.trim();
  }
  return map;
}
const nightTokens = parseTokens(tokensCSS.match(/:root\s*\{([^}]+)\}/)?.[1] ?? '');

// ── Duotone tableValues track tokens.css ────────────────────────────────────

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
const round4 = (n) => Math.round(n * 10000) / 10000;
const toTable = (darkHex, lightHex) => {
  const dark = hexToRgb(darkHex), light = hexToRgb(lightHex);
  return [0, 1, 2].map((i) => [round4(dark[i] / 255), round4(light[i] / 255)]);
};

describe('duotone tableValues match tokens.css (--sky dark end, --celestial light end)', () => {
  const [expR, expG, expB] = toTable(nightTokens['--sky'], nightTokens['--celestial']);
  const funcs = [...coverAstro.matchAll(/feFunc([RGB])\s+type="table"\s+tableValues="([\d.\s]+)"/g)]
    .map((m) => [m[1], m[2].trim().split(/\s+/).map(Number)]);

  it('all three channel funcs are present', () => {
    expect(funcs.map((f) => f[0])).toEqual(['R', 'G', 'B']);
  });

  it.each([
    ['R', expR],
    ['G', expG],
    ['B', expB],
  ])('feFunc%s tableValues match --sky/--celestial to 4dp', (channel, expected) => {
    const found = funcs.find((f) => f[0] === channel)?.[1];
    expect(found, `feFunc${channel} tableValues missing`).toBeTruthy();
    expect(found[0]).toBeCloseTo(expected[0], 4);
    expect(found[1]).toBeCloseTo(expected[1], 4);
  });
});

// ── WCAG AA contrast over the photo's worst-case (brightest) region ────────
// The duotone's tableValues linearly interpolate between --sky (dark) and
// --celestial (light) — no output pixel can exceed --celestial, so it is the
// worst case for the cover's light text, everywhere the vignette doesn't
// additionally darken it. Name/tagline/menu text carry the same dark anchor
// text-shadow the approach prompt uses (Stage.astro) — full alpha, so it
// alone (not the photo) sets the effective backdrop, same modelling
// theme.test.js uses for the prompt. Values below must match
// ThresholdCover.astro's .cover-overline/.cover-name/.cover-tagline/
// .cover-btn-secondary rule.
function linearize(c) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}
function luminance([r, g, b]) {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}
function contrast(fgRgb, bgRgb) {
  const l1 = luminance(fgRgb), l2 = luminance(bgRgb);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}
function compositeOver(fgRgb, alpha, bgRgb) {
  return fgRgb.map((c, i) => alpha * c + (1 - alpha) * bgRgb[i]);
}

const SHADOW_RGB = [7, 6, 14]; // dark anchor shadow, same as .approach-prompt
const SHADOW_ALPHA = 1.0;
const TEXT_RGB = hexToRgb(nightTokens['--prompt-ink']); // white in both themes
const WORST_CASE_RGB = hexToRgb(nightTokens['--celestial']); // brightest possible duotone output

const effectiveBg = compositeOver(SHADOW_RGB, SHADOW_ALPHA, WORST_CASE_RGB);

describe("WCAG AA contrast (≥ 4.5:1) on the cover's text, worst-case (brightest) photo backdrop", () => {
  it.each([
    ['name (h1)', 'cover-name'],
    ['tagline', 'cover-tagline'],
    ['menu (Character Sheet)', 'cover-btn-secondary'],
  ])('%s clears AA', (_label, className) => {
    const rule = coverAstro.match(new RegExp(`\\.${className}[\\s\\S]*?\\{([^}]+)\\}`))?.[1] ?? '';
    expect(rule, `.${className} rule missing`).toBeTruthy();
    expect(contrast(TEXT_RGB, effectiveBg)).toBeGreaterThanOrEqual(4.5);
  });
});
