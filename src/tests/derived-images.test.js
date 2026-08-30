// Freshness gate: tools/derived-images.json hashes match recomputed hashes
// for every committed input, private input, and output image.
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { root, COMMITTED_INPUTS, PRIVATE_INPUTS, OUTPUTS, hashFile, manifestPath } from '../../tools/derived-inputs.js';

// sheet-portrait.png is derived by make-portrait.mjs; the threshold/ variants
// by build-threshold-photo.mjs; everything else by render-og.js. Point the
// failure message at the script that owns the file.
const commandFor = (file) => {
  if (file === 'public/sheet-portrait.png') return 'node tools/make-portrait.mjs';
  if (file.startsWith('public/threshold/')) return 'node tools/build-threshold-photo.mjs';
  if (file.startsWith('public/grain/')) return 'node tools/build-grain-tiles.mjs';
  return 'node tools/render-og.js';
};

describe('derived-images manifest', () => {
  it('exists', () => {
    expect(existsSync(manifestPath), 'no manifest — run `node tools/render-og.js`').toBe(true);
  });

  const manifest = existsSync(manifestPath)
    ? JSON.parse(readFileSync(manifestPath, 'utf8'))
    : { inputs: {}, outputs: {} };

  for (const file of COMMITTED_INPUTS) {
    it(`input ${file} matches the manifest`, () => {
      expect(
        hashFile(file),
        `${file} changed since the last render — run \`${commandFor(file)}\``
      ).toBe(manifest.inputs[file]);
    });
  }

  for (const file of PRIVATE_INPUTS) {
    const present = existsSync(path.join(root, file));
    it.skipIf(!present)(
      present
        ? `private input ${file} matches the manifest`
        : `private input ${file} is absent (CI/fresh clone) — skipping comparison`,
      () => {
        expect(
          hashFile(file),
          `${file} changed since the last render — run \`${commandFor(file)}\``
        ).toBe(manifest.inputs[file]);
      }
    );
  }

  for (const file of OUTPUTS) {
    it(`output ${file} matches the manifest`, () => {
      expect(existsSync(path.join(root, file)), `${file} is missing — run \`${commandFor(file)}\``).toBe(true);
      expect(
        hashFile(file),
        `${file} was altered by hand — re-render with \`${commandFor(file)}\``
      ).toBe(manifest.outputs[file]);
    });
  }
});
