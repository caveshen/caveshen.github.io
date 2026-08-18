// Badger head SVG source: token-class fills, no var() in presentation
// attributes, no raster/<image>, no day-theme override (identity colours
// hold across themes).
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../..');
const svgPath = join(root, 'src/assets/badger-head.svg');
const tokensCSS = readFileSync(join(root, 'src/styles/tokens.css'), 'utf8');

describe('badger-head.svg', () => {
  it('exists', () => {
    expect(existsSync(svgPath)).toBe(true);
  });

  const svg = existsSync(svgPath) ? readFileSync(svgPath, 'utf8') : '';

  it('has no var() inside fill/stroke presentation attributes', () => {
    const offenders = [...svg.matchAll(/\b(fill|stroke)="[^"]*var\([^"]*"/g)];
    expect(offenders.map((m) => m[0])).toEqual([]);
  });

  it('has no raster or <image> reference', () => {
    expect(svg).not.toMatch(/<image/i);
    expect(svg).not.toMatch(/\.(png|jpe?g|gif|webp)/i);
  });

  it('every class used in the source has a fill/stroke rule in tokens.css', () => {
    const classNames = new Set(
      [...svg.matchAll(/class="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/))
    );
    expect(classNames.size).toBeGreaterThan(0);
    for (const name of classNames) {
      const rule = new RegExp(`\\.${name}\\s*\\{[^}]*(fill|stroke)\\s*:`);
      expect(rule.test(tokensCSS), `.${name} has no fill/stroke rule in tokens.css`).toBe(true);
    }
  });

  it('head-specific classes (f-head-*) carry no [data-time="day"] override', () => {
    const classNames = new Set(
      [...svg.matchAll(/class="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/))
    );
    const headClasses = [...classNames].filter((c) => c.startsWith('f-head-'));
    const dayBlock = tokensCSS.match(/:root\[data-time="day"\]\s*\{[\s\S]*?\n\}/)?.[0] ?? '';
    for (const name of headClasses) {
      expect(dayBlock.includes(`.${name}`), `.${name} must not appear in the day override block`).toBe(false);
      // also guard against a standalone day-scoped rule for the class anywhere in the file
      expect(
        new RegExp(`:root\\[data-time="day"\\][^{]*\\.${name}\\b`).test(tokensCSS),
        `.${name} must not be re-shaded by a day selector`
      ).toBe(false);
    }
  });
});
