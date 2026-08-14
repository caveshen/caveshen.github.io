import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveTheme } from '../scripts/dialogue.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const tokensCSS  = readFileSync(join(__dirname, '../styles/tokens.css'), 'utf8');
const indexAstro = readFileSync(join(__dirname, '../pages/index.astro'), 'utf8');

// ── Shared helpers ────────────────────────────────────────────────────────────

function extractVars(block) {
  return [...block.matchAll(/--[\w-]+(?=\s*:)/g)].map(m => m[0]);
}

function parseTokens(block) {
  const map = {};
  for (const [, name, value] of block.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    map['--' + name] = value.trim();
  }
  return map;
}

// ── tokens.css blocks ─────────────────────────────────────────────────────────

const tokensRootBlock = tokensCSS.match(/:root\s*\{([^}]+)\}/)?.[1] ?? '';
const tokensDayBlock  = tokensCSS.match(/:root\[data-time="day"\]\s*\{([^}]+)\}/)?.[1] ?? '';
const nightTokens     = parseTokens(tokensRootBlock);
const dayTokens       = parseTokens(tokensDayBlock);

// ── index.astro page-level style block ───────────────────────────────────────
// Tokens live in tokens.css now; this guards against new ones being added back
// to index.astro without a day override.
const pageStyle      = indexAstro.match(/<style[^>]*>([\s\S]*?)<\/style>/)?.[1] ?? '';
const pageRootBlock  = pageStyle.match(/:root\s*\{([^}]+)\}/)?.[1] ?? '';
const pageDayBlock   = pageStyle.match(/:root\[data-time="day"\]\s*\{([^}]+)\}/)?.[1] ?? '';

// Font and motion tokens are theme-neutral; no day override needed
const ALLOWLIST = ['--serif', '--mono', '--theme-transition'];

// ── Token parity ──────────────────────────────────────────────────────────────

describe('token parity', () => {
  it('every colour token in tokens.css :root has a [data-time="day"] override', () => {
    const tokensDayVars = extractVars(tokensDayBlock);
    for (const v of extractVars(tokensRootBlock)) {
      if (ALLOWLIST.includes(v)) continue;
      expect(tokensDayVars, `${v} missing day override in tokens.css`).toContain(v);
    }
  });

  it('every colour token in index.astro :root has a [data-time="day"] override', () => {
    const pageDayVars = extractVars(pageDayBlock);
    for (const v of extractVars(pageRootBlock)) {
      if (ALLOWLIST.includes(v)) continue;
      expect(pageDayVars, `${v} missing day override in index.astro`).toContain(v);
    }
  });

  it('--theme-transition is overridden to none under prefers-reduced-motion', () => {
    expect(tokensCSS).toContain('prefers-reduced-motion');
    expect(tokensCSS).toContain('--theme-transition: none');
  });
});

// ── WCAG AA contrast ──────────────────────────────────────────────────────────

function linearize(c) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
function luminance(rgb) {
  const [r, g, b] = rgb;
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}
function contrast(fgHex, bgRgb) {
  const l1 = luminance(hexToRgb(fgHex)), l2 = luminance(bgRgb);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}
// Standard "fg painted at alpha over an opaque bg" alpha compositing.
function compositeOver(fgRgb, alpha, bgRgb) {
  return fgRgb.map((c, i) => alpha * c + (1 - alpha) * bgRgb[i]);
}

// Values come from the parsed tokens — a token change is automatically re-checked.
// --bg (page background, still consumed by Base.astro/sheet.astro) is a real
// rendered surface, unlike the removed --card — these stay as direct checks.
describe('WCAG AA contrast (≥ 4.5:1) on --bg', () => {
  it.each([
    ['night option/bg', nightTokens['--option'], nightTokens['--bg']],
    ['night dim/bg',     nightTokens['--dim'],    nightTokens['--bg']],
    ['day option/bg',    dayTokens['--option'],   dayTokens['--bg']],
    ['day dim/bg',       dayTokens['--dim'],      dayTokens['--bg']],
  ])('%s: %s on %s', (_name, fg, bg) => {
    expect(fg, 'token value missing').toBeTruthy();
    expect(bg, 'token value missing').toBeTruthy();
    expect(contrast(fg, hexToRgb(bg))).toBeGreaterThanOrEqual(4.5);
  });
});

// ── WCAG AA contrast on the glass plaque ───────────────────────────────────────
// The plaque (.card, Stage.astro) is translucent, so effective contrast depends
// on the scene behind it, not a flat token. Worst case: the glass composited
// over the most extreme colour in the ground/sea/rail band — the region the
// plaque overlaps once the camera zooms in on the character (the plaque sits
// below the zoomed face; sky/moon/city sit above the head and never reach
// behind it). Night: the band's brightest fill, --rail. Day: its darkest,
// --ground-near. Blur is not modelled — it averages, so the un-blurred extreme
// is already the bound.
// The alphas below must match .card in Stage.astro, and must stay strictly
// below 1 — the e2e suite asserts the glass is translucent. Day alpha (0.81)
// is a design-picked value that can't clear AA alone — day --stage/--dim/
// --option (tokens.css) are darkened, same hue, to close the gap instead.
const GLASS_NIGHT_RGB = [10, 8, 22];   // .card night background, Stage.astro
const GLASS_NIGHT_ALPHA = 0.75;
const GLASS_DAY_RGB = [253, 251, 245]; // .card day background, Stage.astro
const GLASS_DAY_ALPHA = 0.81;
const SCENE_NIGHT_WORST = hexToRgb('2c3850'); // --rail (night)
const SCENE_DAY_WORST   = hexToRgb('1f2c28'); // --ground-near (day)

const plaqueBgNight = compositeOver(GLASS_NIGHT_RGB, GLASS_NIGHT_ALPHA, SCENE_NIGHT_WORST);
const plaqueBgDay   = compositeOver(GLASS_DAY_RGB, GLASS_DAY_ALPHA, SCENE_DAY_WORST);

describe('WCAG AA contrast (≥ 4.5:1) on the plaque, worst-case composited backdrop', () => {
  it.each([
    ['night speech',          nightTokens['--text'],   plaqueBgNight],
    ['night stage direction', nightTokens['--stage'],  plaqueBgNight],
    ['night dim/system',      nightTokens['--dim'],    plaqueBgNight],
    ['night option',          nightTokens['--option'], plaqueBgNight],
    ['day speech',            dayTokens['--text'],     plaqueBgDay],
    ['day stage direction',   dayTokens['--stage'],    plaqueBgDay],
    ['day dim/system',        dayTokens['--dim'],      plaqueBgDay],
    ['day option',            dayTokens['--option'],   plaqueBgDay],
  ])('%s', (_name, fg, bg) => {
    expect(fg, 'token value missing').toBeTruthy();
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });
});

// ── WCAG AA contrast on the approach prompt's shadowed text ───────────────────
// The approach prompt (.approach-prompt, Stage.astro) dropped the plaque's
// glass for floating text with a text-shadow — the shadow now carries the AA
// contrast duty the glass used to carry. Same composited-arithmetic pattern
// as the plaque above, but for text+shadow over the open scene rather than
// glass over the ground/sea/rail band: the prompt sits above the character's
// head, which is mostly sky, so the sky is the worst-case backdrop here —
// gated explicitly since a light-on-light (or dark-on-dark) mismatch would
// show up there first. The rgba/alpha values below must match .approach-
// prompt's text-shadow in Stage.astro; only the stronger (0.9-alpha) shadow
// layer is modelled — the fainter blur layer only adds contrast, never removes it.
const PROMPT_SHADOW_NIGHT_RGB = [10, 8, 22];    // dark shadow behind the light night --text
const PROMPT_SHADOW_DAY_RGB   = [253, 251, 245]; // pale shadow behind the dark day --text
const PROMPT_SHADOW_ALPHA = 0.9;
const SKY_NIGHT = hexToRgb(nightTokens['--sky']);
const SKY_DAY   = hexToRgb(dayTokens['--sky']);

const promptBgNight = compositeOver(PROMPT_SHADOW_NIGHT_RGB, PROMPT_SHADOW_ALPHA, SKY_NIGHT);
const promptBgDay   = compositeOver(PROMPT_SHADOW_DAY_RGB, PROMPT_SHADOW_ALPHA, SKY_DAY);

describe('WCAG AA contrast (≥ 4.5:1) on the approach prompt, worst-case (sky) composited backdrop', () => {
  it.each([
    ['night prompt text', nightTokens['--text'], promptBgNight],
    ['day prompt text',   dayTokens['--text'],   promptBgDay],
  ])('%s', (_name, fg, bg) => {
    expect(fg, 'token value missing').toBeTruthy();
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });
});

// ── Theme logic ───────────────────────────────────────────────────────────────

describe('resolveTheme', () => {
  it('"day" → day',  () => expect(resolveTheme('day')).toBe('day'));
  it('null → night', () => expect(resolveTheme(null)).toBe('night'));
  it('garbage → night', () => expect(resolveTheme('anything')).toBe('night'));
});
