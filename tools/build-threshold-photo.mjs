// Renders public/threshold/night-<width>.{avif,jpg} — sized srcset variants
// of the threshold cover's night photograph, all metadata stripped (GPS
// above all). Input is screenshots/cpt/20251125_200737.jpg (gitignored,
// local-only, never modified or committed — see docs/specs/photo-threshold.md).
// sharp drops source metadata by default (no withMetadata() call); .rotate()
// bakes in the EXIF orientation as pixels before that tag is dropped.
// Run from the repo root: node tools/build-threshold-photo.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashFile, updateManifest } from './derived-inputs.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SOURCE = 'screenshots/cpt/20251125_200737.jpg';
const WIDTHS = [640, 1024, 1536, 2048];

mkdirSync(path.join(root, 'public/threshold'), { recursive: true });

const outputs = {};
for (const width of WIDTHS) {
  const source = sharp(path.join(root, SOURCE)).rotate().resize({ width });

  const avifPath = `public/threshold/night-${width}.avif`;
  await source.clone().avif({ quality: 55 }).toFile(path.join(root, avifPath));
  outputs[avifPath] = hashFile(avifPath);

  const jpgPath = `public/threshold/night-${width}.jpg`;
  await source.clone().jpeg({ quality: 78, mozjpeg: true }).toFile(path.join(root, jpgPath));
  outputs[jpgPath] = hashFile(jpgPath);
}

updateManifest({
  inputs: { [SOURCE]: hashFile(SOURCE) },
  outputs,
});
console.log(`wrote ${Object.keys(outputs).length} threshold variants + tools/derived-images.json`);
