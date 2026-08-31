// gated-cover.spec.js — the GATED build: the landing page as a static
// terminus. Runs against playwright.gated.config.js's own server (GATED=1,
// port 4322), never the default config. desktop only — the gate is markup,
// not rendering.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const distDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const dist = (rel) => readFileSync(path.join(distDir, rel), 'utf8');

test('gated build: cover only, no scene/dialogue/dismissal script in the payload', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#threshold-cover')).toBeVisible();
  expect(await page.locator('#scene-root').count()).toBe(0);

  const html = await page.content();
  expect(html).not.toContain('id="return-to-menu"');
  expect(html).not.toContain('thresholdDismissed');
  expect(html).not.toContain('initStage');
});

test('both menu buttons are disabled and blurred', async ({ page }) => {
  await page.goto('/');
  const newGame = page.locator('#cover-new-game');
  const sheet = page.locator('#cover-sheet');

  await expect(newGame).toBeDisabled();
  await expect(sheet).toBeDisabled();
  expect(await sheet.evaluate((el) => el.tagName)).toBe('BUTTON'); // an <a> cannot be disabled

  expect(await newGame.evaluate((el) => getComputedStyle(el).filter)).toContain('blur');
  expect(await sheet.evaluate((el) => getComputedStyle(el).filter)).toContain('blur');
});

test('keyboard tab order skips the disabled buttons', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('#cover-new-game')).not.toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#cover-sheet')).not.toBeFocused();
});

test('the italic "Coming Soon" line renders beneath the buttons', async ({ page }) => {
  await page.goto('/');
  const line = page.getByText('Coming Soon');
  await expect(line).toBeVisible();
  expect(await line.evaluate((el) => getComputedStyle(el).fontStyle)).toBe('italic');
});

test('no-JS and reduced motion: the gated page shows the identical static cover', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('#threshold-cover')).toBeVisible();
  await expect(page.getByText('Coming Soon')).toBeVisible();
  await ctx.close();
});

test('title, OG, and description are correct, and the page is indexable', async ({ page }) => {
  await page.goto('/');
  const desc = await page.locator('meta[name="description"]').getAttribute('content');
  expect(desc).toBe('Engineering Manager. Problem solver, coffee enjoyer, 10x human.');
  expect(await page.title()).toBe('Caveshen Rajman');
  expect(await page.locator('meta[name="robots"]').count()).toBe(0);
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
  const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(canonical).toBe('https://caveshen.com/');
  expect(ogUrl).toBe('https://caveshen.com/');
  expect(ogImage).toBe('https://caveshen.com/og-image.png');
});

// Build-output facts: astro preview never honours Cloudflare's edge
// _redirects, so these read the built dist/ files this config just produced.
test('dist: robots.txt allows all and names the caveshen.com sitemap', () => {
  const text = dist('robots.txt');
  expect(text).toContain('User-agent: *');
  expect(text).toContain('Allow: /');
  expect(text).toContain('Sitemap: https://caveshen.com/sitemap-index.xml');
});

test('dist: sitemap lists the cover only, not /sheet', () => {
  const text = dist('sitemap-0.xml');
  expect(text).toContain('https://caveshen.com/');
  expect(text).not.toContain('/sheet');
});

test('dist: llms.txt describes the cover, not the full site', () => {
  const text = dist('llms.txt');
  expect(text).toContain('coming soon');
  expect(text).toContain('caveshen.com');
});

test('dist: _redirects sends non-cover routes to / with a 302', () => {
  const text = dist('_redirects');
  expect(text).toContain('/sheet / 302');
  expect(text).toContain('/og / 302');
  expect(text).toContain('/404 / 302');
});

test('dist: 404.html is cover-only, no scene/dialogue in the payload', () => {
  // Checked against <body> only: the page's own <head> title/description
  // stay untouched by this gate (out of scope here), so they keep their
  // pre-existing PLACEHOLDER text regardless.
  const body = dist('404.html').split('<body')[1];
  expect(body).not.toContain('id="stage"');
  expect(body).not.toContain('PLACEHOLDER');
  expect(body).toContain('id="threshold-cover"');
});
