import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// The dialogue wheel (Stage.astro): options sit on spokes around a ring, the
// first three on the right and any more on the left, and collapse to a stack
// on narrow screens. These tests parse the component's style block so the
// presentation contract is pinned without a browser.
const __dirname = dirname(fileURLToPath(import.meta.url));
const stageAstro = readFileSync(join(__dirname, '../components/Stage.astro'), 'utf8');
const styleBlock = stageAstro.match(/<style is:global[^>]*>([\s\S]*?)<\/style>/)?.[1] ?? '';

function ruleBody(selectorPattern) {
  return styleBlock.match(selectorPattern)?.[1] ?? '';
}

describe('dialogue wheel', () => {
  it('the ring is drawn once, by the list itself, in holo blue', () => {
    const ring = ruleBody(/\.choices::before\s*\{([^}]+)\}/);
    expect(ring).toContain('border-radius: 50%');
    expect(ring).toContain('var(--holo-dim)');
    expect(ring, 'the ring is decoration, never a target').toContain('pointer-events: none');
  });

  it('options are placed on spokes from --i and --n with cos()/sin()', () => {
    const li = ruleBody(/\.choices li\s*\{([^}]+)\}/);
    expect(li).toMatch(/--a:\s*calc\(/);
    expect(li).toContain('cos(var(--a))');
    expect(li).toContain('sin(var(--a))');
    expect(li).toContain('var(--i, 0)');
    expect(li).toContain('var(--n, 1)');
  });

  it('a fourth option and beyond mirror to the left side', () => {
    const left = ruleBody(/\.choices li:nth-child\(n\+4\)\s*\{([^}]+)\}/);
    expect(left).toContain('180deg');
    expect(left).toContain('text-align: right');
  });

  it('every option carries its slot number as a HUD cap, in the HUD face', () => {
    expect(styleBlock).toMatch(/counter-reset:\s*plate/);
    expect(styleBlock).toMatch(/counter-increment:\s*plate/);
    expect(styleBlock).toMatch(/content:\s*counter\(plate\)/);
    const base = ruleBody(/\.choices button,\s*\.end-dialogue\s*\{([^}]+)\}/);
    expect(base).toContain('var(--hud)');
  });

  it('hover and keyboard focus turn an option gold', () => {
    const ignite = styleBlock.match(/\.choices button:hover,[\s\S]*?\{([^}]+)\}/)?.[1] ?? '';
    expect(ignite).toContain('var(--gold-bright)');
    const ring = ruleBody(/:root\.kb-focus \.choices button:focus\s*\{([^}]+)\}/);
    expect(ring).toContain('outline: 1px solid var(--holo)');
    expect(ring).toContain('outline-offset: 3px');
  });

  it('the system option speaks in the system colour', () => {
    expect(ruleBody(/\.choices button\.system\s*\{([^}]+)\}/)).toContain('var(--holo)');
  });

  it('narrow screens stack the options and drop the ring', () => {
    const narrow = styleBlock.match(/@media \(max-width: 760px\), \(max-aspect-ratio: 4\/5\)\s*\{([\s\S]*?)\n {2}\}/)?.[1] ?? '';
    expect(narrow).toContain('flex-direction: column');
    expect(narrow).toContain('.choices::before, .choices::after, .choices li::after { display: none; }');
  });

  it('reduced motion drops the option transitions', () => {
    const reduceBlocks = [...styleBlock.matchAll(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n {2}\}/g)].map(m => m[1]).join('\n');
    expect(reduceBlocks).toMatch(/\.choices button[^{]*\{ *transition: none/);
  });
});

describe('quest marker', () => {
  it('bobs on its own group, in gold, and hides once the dialogue opens', () => {
    expect(ruleBody(/\.quest-marker-bob\s*\{([^}]+)\}/)).toContain('animation: marker-bob');
    expect(ruleBody(/\.f-marker\s*\{([^}]+)\}/)).toContain('var(--gold-bright)');
    expect(styleBlock).toContain('.stage-frame.approached .quest-marker { display: none; }');
  });

  it('holds still under reduced motion', () => {
    const reduceBlocks = [...styleBlock.matchAll(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n {2}\}/g)].map(m => m[1]).join('\n');
    expect(reduceBlocks).toContain('.quest-marker-bob { animation: none; }');
  });
});
