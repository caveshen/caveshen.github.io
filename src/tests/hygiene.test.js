// Hygiene checks: static files, favicon, 404 page, badger assets, PLACEHOLDER scanner (TDD).
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../..');

// ── Hygiene static files ──────────────────────────────────────────────────────

describe('public hygiene files', () => {
  it('robots.txt exists', () => {
    expect(existsSync(join(root, 'public/robots.txt'))).toBe(true);
  });

  it('robots.txt points at sitemap', () => {
    const content = readFileSync(join(root, 'public/robots.txt'), 'utf8');
    expect(content).toContain('Sitemap:');
  });

  it('robots.txt allows all crawlers', () => {
    const content = readFileSync(join(root, 'public/robots.txt'), 'utf8');
    expect(content).toContain('User-agent: *');
    expect(content).toContain('Allow: /');
  });

  it('llms.txt exists', () => {
    expect(existsSync(join(root, 'public/llms.txt'))).toBe(true);
  });

  it('apple-touch-icon.png exists', () => {
    expect(existsSync(join(root, 'public/apple-touch-icon.png'))).toBe(true);
  });

  it('og-image.png exists', () => {
    expect(existsSync(join(root, 'public/og-image.png'))).toBe(true);
  });
});

// ── Favicon SVG carries the baked badger head ───────────────────────────────

describe('favicon.svg', () => {
  const tokensCSS = readFileSync(join(root, 'src/styles/tokens.css'), 'utf8');
  const rootBlock = tokensCSS.match(/:root\s*\{[\s\S]*?\n\}/)[0];
  const hexOf = (varName) =>
    rootBlock.match(new RegExp(`${varName}:\\s*(#[0-9a-fA-F]{3,8})`))[1].toLowerCase().slice(1);
  const content = readFileSync(join(root, 'public/favicon.svg'), 'utf8').toLowerCase();

  it('contains the head pale colour (--moon, from tokens.css)', () => {
    expect(content).toContain(hexOf('--moon'));
  });

  it('contains the head dark colour in at least two distinct fills (--head-dark, not just the backdrop)', () => {
    // --head-dark equals --bg, so a single hit could be only the backdrop rect.
    // The bands/nose/inner-ears must bake to it too, or this passes on a broken bake.
    const hex = hexOf('--head-dark');
    const fills = [...content.matchAll(new RegExp(`fill="#${hex}"`, 'g'))];
    expect(fills.length).toBeGreaterThanOrEqual(2);
  });

  it('does not contain the retired warm-disc colour (#ffd75e)', () => {
    expect(content).not.toContain('ffd75e');
  });

  it('has no var() in any presentation attribute (browsers fetch it standalone)', () => {
    const offenders = [...content.matchAll(/\b(fill|stroke)="[^"]*var\([^"]*"/g)];
    expect(offenders.map((m) => m[0])).toEqual([]);
  });
});

// ── 404 page source ───────────────────────────────────────────────────────────

describe('404 page', () => {
  it('src/pages/404.astro exists', () => {
    expect(existsSync(join(root, 'src/pages/404.astro'))).toBe(true);
  });

  it('404.astro links back to / (home)', () => {
    const page = readFileSync(join(root, 'src/pages/404.astro'), 'utf8');
    expect(page).toContain('href="/"');
  });

  it('dialogue-404.json root node has a non-empty speech line and at least one option', () => {
    // The flavour copy moved out of 404.astro into its own dialogue tree.
    const tree = JSON.parse(readFileSync(join(root, 'src/data/dialogue-404.json'), 'utf8'));
    expect(tree.root.speech.trim().length).toBeGreaterThan(0);
    expect(tree.root.options.length).toBeGreaterThanOrEqual(1);
  });
});

// ── Badger two-frame idle ─────────────────────────────────────────────────

describe('badger idle frames', () => {
  it('badger-up.png exists', () => {
    expect(existsSync(join(root, 'public/badger-up.png'))).toBe(true);
  });

  it('badger-down.png exists', () => {
    expect(existsSync(join(root, 'public/badger-down.png'))).toBe(true);
  });

  it('Badger.astro references /badger-up.png', () => {
    const src = readFileSync(join(root, 'src/components/Badger.astro'), 'utf8');
    expect(src).toContain('/badger-up.png');
  });

  it('Badger.astro references /badger-down.png', () => {
    const src = readFileSync(join(root, 'src/components/Badger.astro'), 'utf8');
    expect(src).toContain('/badger-down.png');
  });

  it('Badger.astro has prefers-reduced-motion rule holding the up frame', () => {
    const src = readFileSync(join(root, 'src/components/Badger.astro'), 'utf8');
    expect(src).toContain('prefers-reduced-motion: reduce');
    // down frame must be zeroed out under reduced motion
    expect(src).toMatch(/prefers-reduced-motion[\s\S]*\.badger-down[\s\S]*opacity:\s*0/);
  });
});

// ── PLACEHOLDER checker ───────────────────────────────────────────────────────

describe('placeholder-check', () => {
  it('finds PLACEHOLDER in files that contain it', async () => {
    const { findPlaceholderFiles } = await import('../../docs/placeholder-check.js');
    const tmp = join(tmpdir(), 'ph-test-' + Date.now());
    mkdirSync(tmp, { recursive: true });
    writeFileSync(join(tmp, 'test.astro'), 'hello PLACEHOLDER world');
    const result = findPlaceholderFiles([tmp]);
    expect(result.length).toBe(1);
    rmSync(tmp, { recursive: true });
  });

  it('returns empty array for files without PLACEHOLDER', async () => {
    const { findPlaceholderFiles } = await import('../../docs/placeholder-check.js');
    const tmp = join(tmpdir(), 'ph-test2-' + Date.now());
    mkdirSync(tmp, { recursive: true });
    writeFileSync(join(tmp, 'test.astro'), 'hello world, all copy is finalized');
    const result = findPlaceholderFiles([tmp]);
    expect(result.length).toBe(0);
    rmSync(tmp, { recursive: true });
  });

  it('returns empty array for empty directory', async () => {
    const { findPlaceholderFiles } = await import('../../docs/placeholder-check.js');
    const tmp = join(tmpdir(), 'ph-test3-' + Date.now());
    mkdirSync(tmp, { recursive: true });
    const result = findPlaceholderFiles([tmp]);
    expect(result.length).toBe(0);
    rmSync(tmp, { recursive: true });
  });
});
