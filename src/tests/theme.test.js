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

/** Returns { '--name': 'value', ... } for all custom properties in a CSS block */
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
// Extended tokens were moved to tokens.css (P2). This block guards against
// new tokens being accidentally added back to index.astro without day overrides.
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
function luminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}
function contrast(fg, bg) {
  const l1 = luminance(fg), l2 = luminance(bg);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

// Values come from the parsed tokens — a token change is automatically re-checked.
describe('WCAG AA contrast (≥ 4.5:1)', () => {
  it.each([
    ['night text',   nightTokens['--text'],   nightTokens['--card']],
    ['night option', nightTokens['--option'], nightTokens['--card']],
    ['night stage',  nightTokens['--stage'],  nightTokens['--card']],
    ['day text',     dayTokens['--text'],     dayTokens['--card']],
    ['day option',   dayTokens['--option'],   dayTokens['--card']],
    ['day stage',    dayTokens['--stage'],    dayTokens['--card']],
  ])('%s: %s on %s', (_name, fg, bg) => {
    expect(fg, 'token value missing').toBeTruthy();
    expect(bg, 'token value missing').toBeTruthy();
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });
});

// ── Theme logic ───────────────────────────────────────────────────────────────

describe('resolveTheme', () => {
  it('"day" → day',  () => expect(resolveTheme('day')).toBe('day'));
  it('null → night', () => expect(resolveTheme(null)).toBe('night'));
  it('garbage → night', () => expect(resolveTheme('anything')).toBe('night'));
});
