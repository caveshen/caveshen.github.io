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

// ── Favicon: sized rasters only — head at 16px, champion at 32px ───────────

describe('favicon.svg absence (regression guard: sized rasters only)', () => {
  it('is not shipped in public/', () => {
    expect(existsSync(join(root, 'public/favicon.svg'))).toBe(false);
  });

  it('is not linked from Base.astro', () => {
    const src = readFileSync(join(root, 'src/layouts/Base.astro'), 'utf8');
    expect(src).not.toContain('favicon.svg');
  });
});

describe('favicon-16.png (canonical head, 16px slot)', () => {
  it('exists', () => {
    expect(existsSync(join(root, 'public/favicon-16.png'))).toBe(true);
  });

  it('Base.astro links it at sizes="16x16"', () => {
    const src = readFileSync(join(root, 'src/layouts/Base.astro'), 'utf8');
    expect(src).toMatch(/<link[^>]*href="\/favicon-16\.png"[^>]*sizes="16x16"|<link[^>]*sizes="16x16"[^>]*href="\/favicon-16\.png"/);
  });
});

describe('favicon-32.png (champion, 32px slot)', () => {
  it('exists', () => {
    expect(existsSync(join(root, 'public/favicon-32.png'))).toBe(true);
  });

  it('Base.astro links it at sizes="32x32"', () => {
    const src = readFileSync(join(root, 'src/layouts/Base.astro'), 'utf8');
    expect(src).toMatch(/<link[^>]*href="\/favicon-32\.png"[^>]*sizes="32x32"|<link[^>]*sizes="32x32"[^>]*href="\/favicon-32\.png"/);
  });
});

describe('favicon.ico (multi-size: 16 head + 32 champion)', () => {
  const buf = readFileSync(join(root, 'public/favicon.ico'));

  it('declares two images', () => {
    expect(buf.readUInt16LE(4)).toBe(2);
  });

  it('carries a 16px entry and a 32px entry', () => {
    const sizes = [0, 1].map((i) => buf.readUInt8(6 + i * 16));
    expect(sizes.sort()).toEqual([16, 32]);
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
    const { findPlaceholderFiles } = await import('../../tools/placeholder-check.js');
    const tmp = join(tmpdir(), 'ph-test-' + Date.now());
    mkdirSync(tmp, { recursive: true });
    writeFileSync(join(tmp, 'test.astro'), 'hello PLACEHOLDER world');
    const result = findPlaceholderFiles([tmp]);
    expect(result.length).toBe(1);
    rmSync(tmp, { recursive: true });
  });

  it('returns empty array for files without PLACEHOLDER', async () => {
    const { findPlaceholderFiles } = await import('../../tools/placeholder-check.js');
    const tmp = join(tmpdir(), 'ph-test2-' + Date.now());
    mkdirSync(tmp, { recursive: true });
    writeFileSync(join(tmp, 'test.astro'), 'hello world, all copy is finalized');
    const result = findPlaceholderFiles([tmp]);
    expect(result.length).toBe(0);
    rmSync(tmp, { recursive: true });
  });

  it('returns empty array for empty directory', async () => {
    const { findPlaceholderFiles } = await import('../../tools/placeholder-check.js');
    const tmp = join(tmpdir(), 'ph-test3-' + Date.now());
    mkdirSync(tmp, { recursive: true });
    const result = findPlaceholderFiles([tmp]);
    expect(result.length).toBe(0);
    rmSync(tmp, { recursive: true });
  });
});
