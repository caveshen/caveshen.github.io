// P3 Polish — unit tests (TDD: written before implementation)
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

// ── Favicon SVG is night-scene derived ────────────────────────────────────────

describe('favicon.svg', () => {
  it('contains the celestial night colour (#ffd75e)', () => {
    const content = readFileSync(join(root, 'public/favicon.svg'), 'utf8');
    // The celestial token is #ffd75e — the moon in the night scene
    expect(content.toLowerCase()).toContain('ffd75e');
  });

  it('contains the night background colour (#14121f)', () => {
    const content = readFileSync(join(root, 'public/favicon.svg'), 'utf8');
    expect(content.toLowerCase()).toContain('14121f');
  });
});

// ── 404 page source ───────────────────────────────────────────────────────────

describe('404 page', () => {
  it('src/pages/404.astro exists', () => {
    expect(existsSync(join(root, 'src/pages/404.astro'))).toBe(true);
  });

  it('404.astro links back to / (home)', () => {
    const source = readFileSync(join(root, 'src/pages/404.astro'), 'utf8');
    expect(source).toContain('href="/"');
  });

  it('404.astro has PLACEHOLDER flavour line', () => {
    const source = readFileSync(join(root, 'src/pages/404.astro'), 'utf8');
    expect(source).toContain('PLACEHOLDER');
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
