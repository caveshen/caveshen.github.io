import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveTheme } from '../scripts/dialogue.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const tokensCSS  = readFileSync(join(__dirname, '../styles/tokens.css'), 'utf8');
const indexAstro = readFileSync(join(__dirname, '../pages/index.astro'), 'utf8');
const stageAstro = readFileSync(join(__dirname, '../components/Stage.astro'), 'utf8');

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

// Font, motion, radius, and character-identity tokens are theme-neutral; no day override needed
const ALLOWLIST = [
  '--serif', '--display', '--mono',
  '--theme-transition', '--t-micro', '--ease-camera',
  '--r-sharp', '--r-panel', '--r-pill',
  '--head-dark',
];

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
// --ground-near. Both parse from the tokens so a scene retune re-checks here.
// Blur is not modelled — it averages, so the un-blurred extreme is already the
// bound. The alphas below must match .card in Stage.astro (the glass literals
// move onto --glass-bg/--glass-border with the plaque redesign), and must stay
// strictly below 1 — the e2e suite asserts the glass is translucent. Day alpha
// (0.81) is a design-picked value that can't clear AA alone — day --stage/
// --dim/--option/--gold roles are darkened to close the gap instead.
const GLASS_NIGHT_RGB = [10, 8, 22];   // .card night background, Stage.astro
const GLASS_NIGHT_ALPHA = 0.75;
const GLASS_DAY_RGB = [253, 251, 245]; // .card day background, Stage.astro
const GLASS_DAY_ALPHA = 0.81;
const SCENE_NIGHT_WORST = hexToRgb(nightTokens['--rail']);       // --rail (night)
const SCENE_DAY_WORST   = hexToRgb(dayTokens['--ground-near']);  // --ground-near (day)

const plaqueBgNight = compositeOver(GLASS_NIGHT_RGB, GLASS_NIGHT_ALPHA, SCENE_NIGHT_WORST);
const plaqueBgDay   = compositeOver(GLASS_DAY_RGB, GLASS_DAY_ALPHA, SCENE_DAY_WORST);

describe('WCAG AA contrast (≥ 4.5:1) on the plaque, worst-case composited backdrop', () => {
  it.each([
    ['night speech',          nightTokens['--text'],        plaqueBgNight],
    ['night stage direction', nightTokens['--stage'],       plaqueBgNight],
    ['night dim/system',      nightTokens['--dim'],         plaqueBgNight],
    ['night option',          nightTokens['--option'],      plaqueBgNight],
    ['night gold',            nightTokens['--gold'],        plaqueBgNight],
    ['night gold-bright',     nightTokens['--gold-bright'], plaqueBgNight],
    ['day speech',            dayTokens['--text'],          plaqueBgDay],
    ['day stage direction',   dayTokens['--stage'],         plaqueBgDay],
    ['day dim/system',        dayTokens['--dim'],           plaqueBgDay],
    ['day option',            dayTokens['--option'],        plaqueBgDay],
    ['day gold',              dayTokens['--gold'],          plaqueBgDay],
    ['day gold-bright',       dayTokens['--gold-bright'],   plaqueBgDay],
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
// show up there first. The prompt is light-on-dark in both themes now (day
// dropped its pale-shadow, dark-text variant, which read as swallowed by the
// bright sky) — the rgb/alpha values below must match .approach-prompt's
// text-shadow anchor layer in Stage.astro; only the strongest (full-alpha)
// layer is modelled, the gold bloom and dark-pocket layers only add
// contrast, never remove it. Day's foreground rides the --prompt-ink token
// (light in both themes), not dayTokens['--text'] (dark).
const PROMPT_SHADOW_RGB   = [7, 6, 14]; // dark anchor shadow, both themes
const PROMPT_SHADOW_ALPHA = 1.0;
const PROMPT_TEXT_DAY     = dayTokens['--prompt-ink']; // tokens.css, consumed by Stage.astro
const SKY_NIGHT = hexToRgb(nightTokens['--sky']);
const SKY_DAY   = hexToRgb(dayTokens['--sky']);

const promptBgNight = compositeOver(PROMPT_SHADOW_RGB, PROMPT_SHADOW_ALPHA, SKY_NIGHT);
const promptBgDay   = compositeOver(PROMPT_SHADOW_RGB, PROMPT_SHADOW_ALPHA, SKY_DAY);

describe('WCAG AA contrast (≥ 4.5:1) on the approach prompt, worst-case (sky) composited backdrop', () => {
  it.each([
    ['night prompt text', nightTokens['--text'], promptBgNight],
    ['day prompt text',   PROMPT_TEXT_DAY,       promptBgDay],
  ])('%s', (_name, fg, bg) => {
    expect(fg, 'token value missing').toBeTruthy();
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });
});

// ── WCAG AA contrast on the primary action pill ──────────────────────────────
// The download button (d37 §6, primary verb) fills with --gold and brightens
// to --gold-bright on hover; --btn-primary-ink rides on top in both states.
// Night uses dark ink; day's bronze gold is too close to dark ink (~2:1), so
// the day token flips light — both states are checked here so a retune of any
// of the three tokens re-proves the pair.
describe('WCAG AA contrast (≥ 4.5:1) on the primary action pill', () => {
  it.each([
    ['night ink/gold',        nightTokens['--btn-primary-ink'], nightTokens['--gold']],
    ['night ink/gold-bright', nightTokens['--btn-primary-ink'], nightTokens['--gold-bright']],
    ['day ink/gold',          dayTokens['--btn-primary-ink'],   dayTokens['--gold']],
    ['day ink/gold-bright',   dayTokens['--btn-primary-ink'],   dayTokens['--gold-bright']],
  ])('%s', (_name, fgHex, bgHex) => {
    expect(fgHex, 'token value missing').toBeTruthy();
    expect(bgHex, 'token value missing').toBeTruthy();
    expect(contrast(fgHex, hexToRgb(bgHex))).toBeGreaterThanOrEqual(4.5);
  });
});

// ── Approach prompt text-shadow layer count ────────────────────────────────────
// The night rule (the first .approach-prompt block; the day override is a
// separate, later selector) carries six text-shadow layers: a dark anchor,
// a three-stop gold bloom in the approach light's own colour, and a dark
// pocket (a dense inner layer plus an outer skirt). Counting rgba(/rgb(
// occurrences in the raw declaration catches a layer being dropped without
// depending on exact blur/offset numbers.
describe('approach prompt text-shadow', () => {
  it('the night rule carries six shadow layers (anchor, gold bloom x3, dark pocket x2)', () => {
    const rule = stageAstro.match(/\.approach-prompt\s*\{([^}]+)\}/)?.[1] ?? '';
    const shadow = rule.match(/text-shadow:\s*([^;]+);/)?.[1] ?? '';
    expect(shadow, 'text-shadow declaration missing').toBeTruthy();
    const layers = shadow.match(/rgba?\(/g) ?? [];
    expect(layers.length).toBe(6);
  });
});

// ── Self-hosted fonts & type roles ────────────────────────────────────────

describe('self-hosted fonts', () => {
  const baseAstro = readFileSync(join(__dirname, '../layouts/Base.astro'), 'utf8');

  it('Base.astro imports @fontsource Cinzel 600/700 and Cormorant Garamond 500/600/italic-500', () => {
    for (const imp of [
      '@fontsource/cinzel/600.css',
      '@fontsource/cinzel/700.css',
      '@fontsource/cormorant-garamond/500.css',
      '@fontsource/cormorant-garamond/600.css',
      '@fontsource/cormorant-garamond/500-italic.css',
    ]) expect(baseAstro, `${imp} import missing`).toContain(imp);
  });

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

describe('type roles', () => {
  it('--serif is the Cormorant stack and --display is the Cinzel stack', () => {
    expect(nightTokens['--serif']).toContain('Cormorant Garamond');
    expect(nightTokens['--display']).toContain('Cinzel');
  });

  it('display roles (nameplate, ability scores, quest titles) consume --display', () => {
    const sheet = readFileSync(join(__dirname, '../pages/sheet.astro'), 'utf8');
    for (const sel of ['.name-box h1', '.ab-score', '.quest h3']) {
      const escaped = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      expect(sheet, `${sel} does not use var(--display)`).toMatch(
        new RegExp(`${escaped}\\s*\\{[^}]*var\\(--display\\)`)
      );
    }
  });
});

// ── Interaction grammar (§6): three hover verbs, one ring ─────────────────────

describe('interaction grammar (theme-direction §6)', () => {
  const sheetAstro  = readFileSync(join(__dirname, '../pages/sheet.astro'), 'utf8');
  const toggleAstro = readFileSync(join(__dirname, '../components/ThemeToggle.astro'), 'utf8');

  it('the download button is the primary verb: gold pill, ink text, bright lift', () => {
    const btn = sheetAstro.match(/\.download-btn\s*\{([^}]+)\}/)?.[1] ?? '';
    expect(btn, 'filled with house gold').toContain('background: var(--gold)');
    expect(btn, 'pill radius').toContain('border-radius: var(--r-pill)');
    expect(btn, 'ink text').toContain('color: var(--btn-primary-ink)');
    const hover = sheetAstro.match(/\.download-btn:hover[\s\S]*?\{([^}]+)\}/)?.[1] ?? '';
    expect(hover, 'brightens on hover').toContain('background: var(--gold-bright)');
    expect(hover, 'lifts 1px').toContain('-1px');
  });

  it('the back-link takes the standard verb — no dashed idiom survives', () => {
    expect(sheetAstro.match(/\.back-link\s*\{([^}]+)\}/)?.[1]).not.toContain('dashed');
    const hover = sheetAstro.match(/\.back-link:hover[\s\S]*?\{([^}]+)\}/)?.[1] ?? '';
    expect(hover).toContain('var(--btn-hover-text)');
    expect(hover).toContain('var(--btn-hover-border)');
    expect(hover).toContain('var(--btn-hover-bg)');
  });

  // One focus treatment site-wide. A selector may appear in several rules
  // (hover/focus shares one block); at least one rule per site must carry
  // the house ring.
  const ringSites = [
    ['theme toggle',     toggleAstro, '.toggle:focus-visible'],
    ['approach prompt',  stageAstro,  '.approach-prompt:focus-visible'],
    ['fullscreen chip',  stageAstro,  '.fullscreen-toggle:focus-visible'],
    ['sheet back-link',  sheetAstro,  '.back-link:focus-visible'],
    ['download button',  sheetAstro,  '.download-btn:focus-visible'],
    ['contact links',    sheetAstro,  '.contact-link:focus-visible'],
  ];
  it.each(ringSites)('the %s focus ring is gold-bright, 2px, offset 2px', (_name, src, sel) => {
    const escaped = sel.replace(/[.*+?${}()|[\]\\]/g, '\\$&');
    const bodies = [...src.matchAll(new RegExp(`${escaped}\\s*\\{([^}]+)\\}`, 'g'))].map(m => m[1]);
    expect(bodies.some(b =>
      b.includes('outline: 2px solid var(--gold-bright)') &&
      b.includes('outline-offset: 2px')
    )).toBe(true);
  });
});

// ── Theme logic ───────────────────────────────────────────────────────────────

describe('resolveTheme', () => {
  it('"day" → day',  () => expect(resolveTheme('day')).toBe('day'));
  it('null → night', () => expect(resolveTheme(null)).toBe('night'));
  it('garbage → night', () => expect(resolveTheme('anything')).toBe('night'));
});
