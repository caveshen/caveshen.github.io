// The shipped threshold-cover photo variants carry no EXIF/GPS metadata.
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { hasExif } from '../../tools/check-exif.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const WIDTHS = [640, 1024, 1536, 2048];

// A 4x4 pixel is the smallest sharp will encode; keeps this test fast.
async function taggedJpeg() {
  return sharp({ create: { width: 4, height: 4, channels: 3, background: '#000' } })
    .withMetadata({ exif: { IFD0: { Make: 'test-camera' } } })
    .jpeg()
    .toBuffer();
}

describe('hasExif checker', () => {
  it('flags a buffer carrying EXIF (proves the check can fail)', async () => {
    expect(await hasExif(await taggedJpeg())).toBe(true);
  });

  it('clears once the buffer is re-encoded without metadata', async () => {
    const stripped = await sharp(await taggedJpeg()).jpeg().toBuffer();
    expect(await hasExif(stripped)).toBe(false);
  });
});

describe('threshold photo variants (public/threshold/)', () => {
  for (const width of WIDTHS) {
    for (const ext of ['jpg', 'avif']) {
      const file = `public/threshold/night-${width}.${ext}`;
      it(`${file} exists and carries no EXIF`, async () => {
        expect(existsSync(join(root, file)), `${file} missing — run node tools/build-threshold-photo.mjs`).toBe(true);
        expect(await hasExif(readFileSync(join(root, file)))).toBe(false);
      });
    }
  }

  it('the largest JPEG fallback stays a reasonable size (under 400KB)', () => {
    const file = join(root, 'public/threshold/night-2048.jpg');
    expect(existsSync(file)).toBe(true);
    expect(readFileSync(file).length).toBeLessThan(400 * 1024);
  });
});
