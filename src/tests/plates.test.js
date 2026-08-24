import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// d37 §5 contract: one uniform dialogue plate replaces every option button
// style on the plaque (.card, Stage.astro). These tests parse the component's
// style block so the presentation contract is pinned without a browser.
const __dirname = dirname(fileURLToPath(import.meta.url));
const stageAstro = readFileSync(join(__dirname, '../components/Stage.astro'), 'utf8');
// The component also ships a tiny <style> inside <noscript>; only the global
// block carries the plate contract.
const styleBlock = stageAstro.match(/<style is:global[^>]*>([\s\S]*?)<\/style>/)?.[1] ?? '';

function ruleBody(selectorPattern) {
  return styleBlock.match(selectorPattern)?.[1] ?? '';
}

describe('dialogue plates (theme-direction §5)', () => {
  it('the dashed system variant is gone entirely', () => {
    expect(styleBlock).not.toContain('dashed');
    expect(styleBlock).not.toContain('.system');
  });

  it('plates are serif-labelled, sharp-cornered and quietly filled', () => {
    const base = ruleBody(/\.choices button,\s*\.end-dialogue\s*\{([^}]+)\}/);
    expect(base, 'plate label font').toContain('var(--serif)');
    expect(base, 'plate radius').toContain('var(--r-sharp)');
    expect(base, 'plate rest fill').toContain('rgba(236, 228, 212, 0.04)');
    expect(base, 'no border on a plate').toContain('border: none');
  });

  it('each option carries a mono roman numeral index before its label', () => {
    expect(styleBlock).toMatch(/counter-reset:\s*plate/);
    expect(styleBlock).toMatch(/counter-increment:\s*plate/);
    expect(styleBlock).toMatch(/content:\s*counter\(plate,\s*upper-roman\)/);
    const numeral = ruleBody(/\.choices li::before\s*\{([^}]+)\}/);
    expect(numeral, 'numeral face').toContain('var(--mono)');
    expect(numeral, 'numeral colour').toContain('var(--gold)');
  });

  it('a left gold rule sits on every plate and ignites bright and wide', () => {
    const restRule = ruleBody(/\.choices button::before,\s*\.end-dialogue::before\s*\{([^}]+)\}/);
    expect(restRule).toContain('width: 2px');
    expect(restRule).toContain('var(--gold)');
    const ignited = styleBlock.match(
      /\.choices button:hover::before[\s\S]*?\{([^}]+)\}/
    )?.[1] ?? '';
    expect(ignited, 'rule widens').toContain('width: 3px');
    expect(ignited, 'rule ignites bright').toContain('var(--gold-bright)');
  });

  it('hover/focus ignition warms the plate and fades in the ✦ glyph', () => {
    const ignite = styleBlock.match(
      /\.choices button:hover,[\s\S]*?\{\s*color:[^}]+\}/
    )?.[0] ?? '';
    expect(ignite, 'warm wash').toContain('rgba(217, 169, 78, 0.10)');
    expect(styleBlock).toMatch(/\.choices button::after[\s\S]{0,400}?content:\s*'✦'/);
    const starShow = styleBlock.match(
      /\.choices button:hover::after[\s\S]*?\{([^}]+)\}/
    )?.[1] ?? '';
    expect(starShow, 'star fades in').toContain('opacity: 1');
  });

  it('ignition text comes from the shared token — no component literal', () => {
    expect(stageAstro).not.toContain('#f6efe0');
    const ignite = styleBlock.match(
      /\.choices button:hover,[\s\S]*?\{\s*color:[^}]+\}/
    )?.[0] ?? '';
    expect(ignite).toContain('var(--plate-hover-text)');
  });

  it('keyboard focus keeps the kb-focus gate with a gold-bright 2px offset ring', () => {
    const ring = styleBlock.match(
      /:root\.kb-focus \.choices button:focus\s*\{([^}]+)\}/
    )?.[1] ?? '';
    expect(ring).toContain('outline: 2px solid var(--gold-bright)');
    expect(ring).toContain('outline-offset: 2px');
  });

  it('reduced motion kills the plate and pseudo transitions', () => {
    const reduceBlocks = [...styleBlock.matchAll(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n {2}\}/g)].map(m => m[1]).join('\n');
    expect(reduceBlocks).toContain('.choices button::before');
    expect(reduceBlocks).toContain('.end-dialogue::after');
  });
});

describe('plaque corner brackets (theme-direction §6)', () => {
  it('night brackets sit at 55% house gold', () => {
    const card = ruleBody(/\n  \.card\s*\{([^}]+)\}/);
    expect(card).toMatch(/--frame:\s*rgba\(217, 169, 78, 0\.55\)/);
  });

  it('day brackets sit at 55% day gold (bronze)', () => {
    const dayCard = ruleBody(/\[data-time="day"\] \.card\s*\{([^}]+)\}/);
    expect(dayCard).toMatch(/--frame:\s*rgba\(111, 86, 32, 0\.55\)/);
  });
});
