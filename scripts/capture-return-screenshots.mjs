// capture-return-screenshots.mjs — ad-hoc acceptance screenshots for the return journey.
// Not part of CI or the Playwright test matrix. Run locally, on demand.
//
// Usage:
//   1. Build and start the preview server: npm run build && npm run preview
//   2. node scripts/capture-return-screenshots.mjs
//
// Writes:
//   screenshots/return-arrival-night.png
//   screenshots/return-arrival-day.png
//
// ponytail: no CLI args, no config, no server lifecycle — start the preview server separately.

import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:4321';

async function navigateToSheet(page) {
  await page.goto(BASE + '/');
  await page.locator('#approach-prompt').click();
  await page.locator('#choices button.system').click();
  await page.waitForURL(BASE + '/sheet');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('.back-link').waitFor({ state: 'visible' });
}

// ponytail: headed so the screenshot captures real compositor output; swap to headless:true if that causes issues.
const browser = await chromium.launch({ channel: 'msedge', headless: false });
const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await context.newPage();

mkdirSync('screenshots', { recursive: true });

// Night (default — no time key in localStorage).
await navigateToSheet(page);
await page.locator('.back-link').click();
await page.waitForURL(BASE + '/');
await page.waitForLoadState('domcontentloaded');
// Wait for overlay to clear before shooting.
await page.waitForFunction(() => !document.querySelector('body > img[src="/badger-up.png"]'));
await page.screenshot({ path: 'screenshots/return-arrival-night.png' });
console.log('Written: screenshots/return-arrival-night.png');

// Day: set theme in localStorage — persists across the cross-document navigation.
await page.evaluate(() => localStorage.setItem('time', 'day'));
await navigateToSheet(page);
await page.locator('.back-link').click();
await page.waitForURL(BASE + '/');
await page.waitForLoadState('domcontentloaded');
await page.waitForFunction(() => !document.querySelector('body > img[src="/badger-up.png"]'));
await page.screenshot({ path: 'screenshots/return-arrival-day.png' });
console.log('Written: screenshots/return-arrival-day.png');

await browser.close();
