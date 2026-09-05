// Hygiene: the favicon set is complete and linked at the sizes it is cut for.
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const base = readFileSync(join(root, 'src/layouts/Base.astro'), 'utf8');

describe('favicon set', () => {
  it.each([16, 32])('favicon-%ipx exists and Base.astro links it at that size', (size) => {
    expect(existsSync(join(root, `public/favicon-${size}.png`))).toBe(true);
    expect(base).toMatch(new RegExp(
      `<link[^>]*href="/favicon-${size}\\.png"[^>]*sizes="${size}x${size}"|<link[^>]*sizes="${size}x${size}"[^>]*href="/favicon-${size}\\.png"`
    ));
  });

  it('favicon.ico carries a 16px and a 32px entry', () => {
    const buf = readFileSync(join(root, 'public/favicon.ico'));
    expect(buf.readUInt16LE(4)).toBe(2);
    const sizes = [0, 1].map((i) => buf.readUInt8(6 + i * 16));
    expect(sizes.sort()).toEqual([16, 32]);
  });

  it('apple-touch-icon.png exists and is linked', () => {
    expect(existsSync(join(root, 'public/apple-touch-icon.png'))).toBe(true);
    expect(base).toContain('rel="apple-touch-icon"');
  });
});
