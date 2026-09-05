// Theme tokens: every colour has a day override, every text role clears WCAG
// AA over its worst-case backdrop, and no font is fetched from a CDN.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const tokensCSS = readFileSync(join(__dirname, '../styles/tokens.css'), 'utf8');

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

const rootBlock  = tokensCSS.match(/:root\s*\{([^}]+)\}/)?.[1] ?? '';
const dayBlock   = tokensCSS.match(/:root\[data-time="day"\]\s*\{([^}]+)\}/)?.[1] ?? '';
// The HUD surfaces (dialogue, chips, prompts) pin their own tokens so they
// hold the night register in both themes.
const hudBlock   = tokensCSS.match(/\.card,[^{]*\{([^}]+)\}/)?.[1] ?? '';
const nightTokens = parseTokens(rootBlock);
const dayTokens   = parseTokens(dayBlock);
const hudTokens   = parseTokens(hudBlock);

// Font, motion, radius, and character-identity tokens are theme-neutral.
const ALLOWLIST = [
  '--serif', '--display', '--mono', '--hud',
  '--theme-transition', '--t-micro', '--ease-camera',
  '--r-sharp', '--r-panel', '--r-pill',
];

describe('token parity', () => {
  it('every colour token in :root has a [data-time="day"] override', () => {
    const dayVars = extractVars(dayBlock);
    for (const v of extractVars(rootBlock)) {
      if (ALLOWLIST.includes(v)) continue;
      expect(dayVars, `${v} missing day override in tokens.css`).toContain(v);
    }
  });

  it('--theme-transition is overridden to none under prefers-reduced-motion', () => {
    expect(tokensCSS).toContain('prefers-reduced-motion');
    expect(tokensCSS).toContain('--theme-transition: none');
  });

  it('the HUD block pins the text, gold and holo roles', () => {
    for (const v of ['--text', '--dim', '--gold', '--gold-bright', '--holo', '--btn-primary-ink']) {
      expect(hudTokens[v], `${v} missing from the HUD block`).toBeTruthy();
    }
  });
});

// ── WCAG AA contrast maths ──────────────────────────────────────────────────

function linearize(c) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
function luminance([r, g, b]) {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}
function contrast(fgRgb, bgRgb) {
  const l1 = luminance(fgRgb), l2 = luminance(bgRgb);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}
// Standard "fg painted at alpha over an opaque bg" alpha compositing.
function compositeOver(fgRgb, alpha, bgRgb) {
  return fgRgb.map((c, i) => alpha * c + (1 - alpha) * bgRgb[i]);
}
const AA = 4.5;

describe('WCAG AA on the page background (--bg)', () => {
  it.each([
    ['night dim/bg', nightTokens['--dim'], nightTokens['--bg']],
    ['day dim/bg',   dayTokens['--dim'],   dayTokens['--bg']],
  ])('%s', (_name, fg, bg) => {
    expect(fg, 'token value missing').toBeTruthy();
    expect(bg, 'token value missing').toBeTruthy();
    expect(contrast(hexToRgb(fg), hexToRgb(bg))).toBeGreaterThanOrEqual(AA);
  });
});

// The dialogue option (.choices button, Stage.astro) is a dark translucent
// chip over the world, which is bright by day. Worst case: the chip composited
// over the day ground. The rgb/alpha below must match the chip's background
// in Stage.astro. Its text roles come from the HUD block.
const CHIP_RGB = [6, 10, 18];
const CHIP_ALPHA = 0.82;
const chipOverDay   = compositeOver(CHIP_RGB, CHIP_ALPHA, hexToRgb(dayTokens['--ground-near']));
const chipOverNight = compositeOver(CHIP_RGB, CHIP_ALPHA, hexToRgb(nightTokens['--rail']));

describe('WCAG AA on a dialogue option, worst-case composited backdrop', () => {
  it.each([
    ['option text, day world',    hudTokens['--text'],        chipOverDay],
    ['system option, day world',  hudTokens['--holo'],        chipOverDay],
    ['lit option, day world',     hudTokens['--gold-bright'], chipOverDay],
    ['option text, night world',  hudTokens['--text'],        chipOverNight],
    ['system option, night world', hudTokens['--holo'],       chipOverNight],
  ])('%s', (_name, fg, bg) => {
    expect(fg, 'token value missing').toBeTruthy();
    expect(contrast(hexToRgb(fg), bg)).toBeGreaterThanOrEqual(AA);
  });
});

// Spoken text and the approach prompt float over the scene with a dark
// anchor text-shadow carrying the contrast duty. The shadow's rgb must match
// Stage.astro; its full-alpha layer sets the effective backdrop, so the sky
// (the brightest region under the prompt) is the worst case.
const SHADOW_RGB = [7, 6, 14];
const skyNight = compositeOver(SHADOW_RGB, 1, hexToRgb(nightTokens['--sky']));
const skyDay   = compositeOver(SHADOW_RGB, 1, hexToRgb(dayTokens['--sky']));

describe('WCAG AA on shadowed text over the scene', () => {
  it.each([
    ['night prompt',       nightTokens['--prompt-ink'], skyNight],
    ['day prompt',         dayTokens['--prompt-ink'],   skyDay],
    ['speech (HUD text)',  hudTokens['--text'],         skyDay],
    ['stage direction',    hudTokens['--stage'],        skyDay],
    ['speaker name',       hudTokens['--gold-bright'],  skyDay],
  ])('%s', (_name, fg, bg) => {
    expect(fg, 'token value missing').toBeTruthy();
    expect(contrast(hexToRgb(fg), bg)).toBeGreaterThanOrEqual(AA);
  });
});

// The filled gold control (download button) carries --btn-primary-ink on
// --gold at rest and --gold-bright on hover.
describe('WCAG AA on the filled gold control', () => {
  it.each([
    ['night ink/gold',        nightTokens['--btn-primary-ink'], nightTokens['--gold']],
    ['night ink/gold-bright', nightTokens['--btn-primary-ink'], nightTokens['--gold-bright']],
    ['day ink/gold',          dayTokens['--btn-primary-ink'],   dayTokens['--gold']],
    ['day ink/gold-bright',   dayTokens['--btn-primary-ink'],   dayTokens['--gold-bright']],
    ['HUD ink/gold-bright',   hudTokens['--btn-primary-ink'],   hudTokens['--gold-bright']],
  ])('%s', (_name, fg, bg) => {
    expect(fg, 'token value missing').toBeTruthy();
    expect(bg, 'token value missing').toBeTruthy();
    expect(contrast(hexToRgb(fg), hexToRgb(bg))).toBeGreaterThanOrEqual(AA);
  });
});

describe('self-hosted fonts', () => {
  it('no third-party font URL appears anywhere in src/', () => {
    const fontCdn = /fonts\.(googleapis|gstatic)\.com|use\.typekit\.net|cloud\.typography/i;
    const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]
    );
    for (const file of walk(join(__dirname, '..'))) {
      expect(readFileSync(file, 'utf8'), `${file} references a font CDN`).not.toMatch(fontCdn);
    }
  });
});
