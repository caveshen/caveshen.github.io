// P3 Polish — integration tests (TDD: written before implementation)
import { test, expect } from '@playwright/test';

// ── 404 page ──────────────────────────────────────────────────────────────────

test('404 page: navigating to unknown route returns a page with home link', async ({ page }) => {
  await page.goto('/this-does-not-exist', { waitUntil: 'domcontentloaded' });
  // The page should exist (GitHub Pages / Astro serves 404.html)
  await expect(page.locator('a[href="/"]')).toBeVisible();
});

test('404 page: has PLACEHOLDER flavour text (not a blank error)', async ({ page }) => {
  await page.goto('/this-does-not-exist', { waitUntil: 'domcontentloaded' });
  const body = await page.textContent('body');
  expect(body).toContain('PLACEHOLDER');
});

test('404 page: readable with JS disabled', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/this-does-not-exist', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('a[href="/"]')).toBeVisible();
  await ctx.close();
});

// ── Hygiene files accessible ──────────────────────────────────────────────────

test('GET /robots.txt returns 200', async ({ request }) => {
  const res = await request.get('/robots.txt');
  expect(res.status()).toBe(200);
});

test('robots.txt is plain text with Allow and Sitemap', async ({ request }) => {
  const res = await request.get('/robots.txt');
  const text = await res.text();
  expect(text).toContain('User-agent: *');
  expect(text).toContain('Allow: /');
  expect(text).toContain('Sitemap:');
});

test('GET /llms.txt returns 200', async ({ request }) => {
  const res = await request.get('/llms.txt');
  expect(res.status()).toBe(200);
});

test('GET /sitemap-index.xml returns 200 with XML content-type', async ({ request }) => {
  const res = await request.get('/sitemap-index.xml');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('xml');
});

test('sitemap-index.xml is valid XML with <sitemapindex>', async ({ request }) => {
  const res = await request.get('/sitemap-index.xml');
  const text = await res.text();
  expect(text).toContain('<sitemapindex');
  expect(text).toContain('sitemap-0.xml');
});

// ── OG / meta tags on / ───────────────────────────────────────────────────────

test('/ has <meta name="description">', async ({ page }) => {
  await page.goto('/');
  const desc = await page.locator('meta[name="description"]').getAttribute('content');
  expect(desc).toBeTruthy();
  expect(desc.length).toBeGreaterThan(0);
});

test('/ has og:title meta', async ({ page }) => {
  await page.goto('/');
  const og = await page.locator('meta[property="og:title"]').getAttribute('content');
  expect(og).toBeTruthy();
});

test('/ has og:image meta pointing to og-image.png', async ({ page }) => {
  await page.goto('/');
  const og = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(og).toContain('og-image.png');
});

test('/ has og:description meta', async ({ page }) => {
  await page.goto('/');
  const og = await page.locator('meta[property="og:description"]').getAttribute('content');
  expect(og).toBeTruthy();
});

test('/ has twitter:card meta', async ({ page }) => {
  await page.goto('/');
  const tw = await page.locator('meta[name="twitter:card"]').getAttribute('content');
  expect(tw).toBe('summary_large_image');
});

test('/ has <link rel="apple-touch-icon">', async ({ page }) => {
  await page.goto('/');
  const link = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
  expect(link).toContain('apple-touch-icon');
});

// ── OG / meta tags on /sheet ──────────────────────────────────────────────────

test('/sheet has <meta name="description">', async ({ page }) => {
  await page.goto('/sheet');
  const desc = await page.locator('meta[name="description"]').getAttribute('content');
  expect(desc).toBeTruthy();
  expect(desc.length).toBeGreaterThan(0);
});

test('/sheet has og:title meta', async ({ page }) => {
  await page.goto('/sheet');
  const og = await page.locator('meta[property="og:title"]').getAttribute('content');
  expect(og).toBeTruthy();
});

test('/sheet has og:image meta', async ({ page }) => {
  await page.goto('/sheet');
  const og = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(og).toContain('og-image.png');
});

test('/sheet has twitter:card meta', async ({ page }) => {
  await page.goto('/sheet');
  const tw = await page.locator('meta[name="twitter:card"]').getAttribute('content');
  expect(tw).toBe('summary_large_image');
});

// ── OG image asset accessible ─────────────────────────────────────────────────

test('GET /og-image.png returns 200 with image/png content-type', async ({ request }) => {
  const res = await request.get('/og-image.png');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('image/png');
});

test('GET /apple-touch-icon.png returns 200 with image/png content-type', async ({ request }) => {
  const res = await request.get('/apple-touch-icon.png');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('image/png');
});
