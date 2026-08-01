// Renders docs/cv.html → public/cv.pdf via headless Edge.
// Run from the repo root: node docs/render-cv.js
import { chromium } from 'playwright-core';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage();
await page.goto(pathToFileURL(path.join(root, 'docs', 'cv.html')).href);
await page.pdf({
  path: path.join(root, 'public', 'cv.pdf'),
  format: 'A4',
  printBackground: false,
  // margins come from @page in cv.html
  preferCSSPageSize: true,
});
await browser.close();
console.log('rendered public/cv.pdf');
