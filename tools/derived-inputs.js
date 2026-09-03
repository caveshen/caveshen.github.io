// Input/output manifest for the freshness gate (tools/derived-images.json).
// Names every committed file whose change invalidates a derived image, the
// private gitignored source photos, the derived outputs, and a hash
// function. Shared by tools/render-og.js, tools/make-portrait.mjs, and the
// derived-images unit test.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function filesUnder(relDir) {
  const abs = path.join(root, relDir);
  return readdirSync(abs, { recursive: true })
    .filter((rel) => statSync(path.join(abs, rel)).isFile())
    .map((rel) => `${relDir}/${rel.split(path.sep).join('/')}`);
}

// The /og route's composition chain — see the spec's freshness gate section
// for the over-coverage rationale. badger-head.svg is a live asset
// (src/components/BadgerHead.astro) but feeds no derived image, so it is
// not an input here.
export const COMMITTED_INPUTS = [
  'src/pages/og.astro',
  ...filesUnder('src/components'),
  ...filesUnder('src/styles'),
].sort();

// Gitignored source photos that exist only on the owner's machine. CI and
// fresh clones never have these — the gate skips them where absent.
export const PRIVATE_INPUTS = [
  '.scratch/NAG_Badger.jpg',
  '.scratch/cavie-ref.jpg',
  'screenshots/cpt/20251125_200737.jpg',
].sort();

const THRESHOLD_WIDTHS = [640, 1024, 1536, 2048];
const GRAIN_TILE_COUNT = 1;

export const OUTPUTS = [
  'public/apple-touch-icon.png',
  'public/favicon-16.png',
  'public/favicon-32.png',
  'public/favicon.ico',
  'public/og-image.png',
  'public/sheet-portrait.png',
  ...THRESHOLD_WIDTHS.flatMap((w) => [`public/threshold/night-${w}.avif`, `public/threshold/night-${w}.jpg`]),
  ...Array.from({ length: GRAIN_TILE_COUNT }, (_, i) => `public/grain/grain-${i}.webp`),
].sort();

// Text inputs are hashed with CRLF normalized to LF: this checkout has
// core.autocrlf=true (CRLF on disk) but CI checks out LF, so a raw-byte hash
// would fail the gate on every CI run for every committed text file.
const TEXT_EXTENSIONS = new Set(['.svg', '.astro', '.css', '.js']);

export function hashFile(relPath) {
  const buf = readFileSync(path.join(root, relPath));
  const content = TEXT_EXTENSIONS.has(path.extname(relPath))
    ? buf.toString('utf8').replace(/\r\n/g, '\n')
    : buf;
  return createHash('sha256').update(content).digest('hex');
}

export const manifestPath = path.join(root, 'tools/derived-images.json');

function sorted(obj) {
  return Object.fromEntries(Object.keys(obj).sort().map((k) => [k, obj[k]]));
}

// Merges a script's own inputs/outputs into the shared manifest, leaving the
// other derive script's entries untouched, and writes back with sorted keys
// so re-renders don't churn the diff.
export function updateManifest({ inputs = {}, outputs = {} }) {
  const existing = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
  const merged = {
    inputs: sorted({ ...existing.inputs, ...inputs }),
    outputs: sorted({ ...existing.outputs, ...outputs }),
  };
  writeFileSync(manifestPath, JSON.stringify(merged, null, 2) + '\n');
}
