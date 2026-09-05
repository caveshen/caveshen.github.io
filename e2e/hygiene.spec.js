// Hygiene files (robots, llms, sitemap), the social card and icon links, meta posture.
// A local build has no SITE override, so it carries the live posture:
// indexable, allow all, caveshen.com URLs.
import { test, expect } from './fixtures.js';

// The social card and icon links, and that each linked file is really served.
async function expectSocialCard(page, request, path) {
  await page.goto(path);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /\S/);
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /\S/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(ogImage).toContain('og-image.png');
  const res = await request.get(new URL(ogImage).pathname);
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('image/png');
}

test('robots.txt allows all and names the sitemap (live posture)', async ({ request }) => {
  const res = await request.get('/robots.txt');
  const text = await res.text();
  expect(text).toContain('User-agent: *');
  expect(text).toContain('Allow: /');
  expect(text).toContain('Sitemap: https://caveshen.com/sitemap-index.xml');
});

test('GET /llms.txt returns 200', async ({ request }) => {
  const res = await request.get('/llms.txt');
  expect(res.status()).toBe(200);
});

test('sitemap-index.xml is served as XML and lists sitemap-0', async ({ request }) => {
  const res = await request.get('/sitemap-index.xml');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('xml');
  const text = await res.text();
  expect(text).toContain('<sitemapindex');
  expect(text).toContain('sitemap-0.xml');
});

test('/ carries a complete social card and the image is served', async ({ page, request }) => {
  await expectSocialCard(page, request, '/');
});

test('/sheet carries a complete social card and the image is served', async ({ page, request }) => {
  await expectSocialCard(page, request, '/sheet');
});

test('the apple-touch-icon is linked and served', async ({ page, request }) => {
  await page.goto('/');
  const href = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
  expect(href).toContain('apple-touch-icon');
  const res = await request.get(href);
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('image/png');
});

test('/ has the ruled meta description, character for character', async ({ page }) => {
  await page.goto('/');
  const desc = await page.locator('meta[name="description"]').getAttribute('content');
  expect(desc).toBe('Engineering Manager. Problem solver, coffee enjoyer, 10x human.');
});

test('/ carries no robots meta (indexable, live posture)', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
});

test('/ canonical and og:url use the domain', async ({ page }) => {
  await page.goto('/');
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
  expect(canonical).toBe('https://caveshen.com/');
  expect(ogUrl).toBe('https://caveshen.com/');
});

test('/sheet has <meta name="description">', async ({ page }) => {
  await page.goto('/sheet');
  const desc = await page.locator('meta[name="description"]').getAttribute('content');
  expect(desc).toBeTruthy();
  expect(desc.length).toBeGreaterThan(0);
});

test('/og carries noindex meta', async ({ page }) => {
  await page.goto('/og');
  const robots = await page.locator('meta[name="robots"]').getAttribute('content');
  expect(robots).toBe('noindex');
});
