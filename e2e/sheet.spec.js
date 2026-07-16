import { test, expect } from '@playwright/test';

// ── No-JS / static content (criterion 1) ──────────────────────────────────────

test('/sheet renders complete CV content with JS disabled', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/sheet');

  // Roles (all three present)
  await expect(page.getByRole('heading', { name: 'Software Engineering Manager' })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Senior Software Engineer/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Senior Software Developer/ })).toBeVisible();

  // Skills (exact: true to avoid case-insensitive partial match with role bullets)
  await expect(page.getByText('Stakeholder Management', { exact: true })).toBeVisible();
  await expect(page.getByText('Azure', { exact: true })).toBeVisible();

  // Education
  await expect(page.getByText(/Bachelor of Commerce/)).toBeVisible();
  await expect(page.getByText(/ISTQB/)).toBeVisible();

  // Back link present and navigates to / without JS
  await expect(page.locator('a[href="/"]')).toBeVisible();
  await page.locator('a[href="/"]').click();
  await expect(page).toHaveURL('/');

  await ctx.close();
});

// ── No-JS path from / (criterion 1 — second half) ────────────────────────────

test('no-JS: / noscript link navigates to /sheet with real content', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  // The <noscript> block on index.astro provides 'Open the character sheet →'
  const noscriptLink = page.locator('a[href="/sheet"]');
  await expect(noscriptLink).toBeVisible();
  await noscriptLink.click();
  await expect(page).toHaveURL('/sheet');
  await expect(page.getByRole('heading', { name: 'Software Engineering Manager' })).toBeVisible();
  await ctx.close();
});

// ── Recruiter path (criterion 4) ─────────────────────────────────────────────

test('recruiter path: / → /sheet in 1 click via system option', async ({ page }) => {
  await page.goto('/');
  // Dialogue engine renders the system option (JS required; page uses JS by default)
  await expect(page.locator('#choices button.system')).toBeVisible();
  await page.locator('#choices button.system').click();
  await expect(page).toHaveURL('/sheet');
});

test('/sheet has a download link pointing to /cv.pdf', async ({ page }) => {
  await page.goto('/sheet');
  await expect(page.locator('a[href="/cv.pdf"]')).toBeVisible();
});

test('GET /cv.pdf returns 200 with content-type application/pdf', async ({ request }) => {
  const response = await request.get('/cv.pdf');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/pdf');
});

// ── Contact links / privacy ───────────────────────────────────────────────────

test('back link to / is present and navigates to /', async ({ page }) => {
  await page.goto('/sheet');
  const back = page.locator('a[href="/"]');
  await expect(back).toBeVisible();
  await back.click();
  await expect(page).toHaveURL('/');
});

test('LinkedIn link has exact href', async ({ page }) => {
  await page.goto('/sheet');
  await expect(page.locator('a[href="https://www.linkedin.com/in/caveshen"]')).toBeVisible();
});

test('GitHub link has exact href', async ({ page }) => {
  await page.goto('/sheet');
  await expect(page.locator('a[href="https://github.com/caveshen"]')).toBeVisible();
});

test('page source contains no mailto: and no email-shaped text', async ({ page }) => {
  await page.goto('/sheet');
  const html = await page.content();
  expect(html).not.toContain('mailto:');
  // Simple @ pattern catches bare addresses; anchored to word boundaries
  expect(html).not.toMatch(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
});

// ── Keyboard (criterion 2) ────────────────────────────────────────────────────

test('toggle is first in tab order on /sheet', async ({ page }) => {
  await page.goto('/sheet');
  await page.keyboard.press('Tab');
  await expect(page.locator('#toggle')).toBeFocused();
});

test('toggle operable by keyboard on /sheet', async ({ page }) => {
  await page.goto('/sheet');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-time', 'day');
});

test('toggle has visible focus outline on /sheet', async ({ page }) => {
  await page.goto('/sheet');
  await page.locator('#toggle').focus();
  const outline = await page.evaluate(() =>
    window.getComputedStyle(document.activeElement).outlineStyle
  );
  expect(outline).not.toBe('none');
});

test('back link and download link both reachable by keyboard on /sheet (real Tab walk)', async ({ page }) => {
  await page.goto('/sheet');
  // Walk forward through tab stops — back link ("/") and download link ("/cv.pdf")
  // must both appear within 10 Tabs. Tab keypresses cannot be spoofed by .focus().
  let foundBack = false, foundDownload = false;
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('Tab');
    const href = await page.evaluate(() => document.activeElement?.getAttribute('href'));
    if (href === '/') foundBack = true;
    if (href === '/cv.pdf') { foundDownload = true; break; }
  }
  expect(foundBack, 'back link not reached via Tab').toBe(true);
  expect(foundDownload, 'download link not reached via Tab').toBe(true);
  await expect(page.locator('a[href="/cv.pdf"]')).toBeFocused();
});

test('download link has visible focus outline', async ({ page }) => {
  await page.goto('/sheet');
  await page.locator('a[href="/cv.pdf"]').focus();
  const outline = await page.evaluate(() =>
    window.getComputedStyle(document.activeElement).outlineStyle
  );
  expect(outline).not.toBe('none');
});

test('contact links have visible focus outline', async ({ page }) => {
  await page.goto('/sheet');
  await page.locator('a[href="https://www.linkedin.com/in/caveshen"]').focus();
  const outline = await page.evaluate(() =>
    window.getComputedStyle(document.activeElement).outlineStyle
  );
  expect(outline).not.toBe('none');
});

// ── Theme (criterion 5) ────────────────────────────────────────────────────────

test('night theme by default on /sheet', async ({ page }) => {
  await page.goto('/sheet');
  await expect(page.locator('html')).not.toHaveAttribute('data-time', 'day');
});

test('toggle swaps theme on /sheet', async ({ page }) => {
  await page.goto('/sheet');
  await page.locator('#toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-time', 'day');
});

test('theme toggled on /sheet persists across page reload, toggle label updated by syncLabel', async ({ page }) => {
  await page.goto('/sheet');
  await page.locator('#toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-time', 'day');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-time', 'day');
  // syncLabel() must fire on load and update the aria-label to reflect day mode.
  // This assertion FAILS if syncLabel() is removed from ThemeToggle.astro.
  await expect(page.locator('#toggle')).toHaveAttribute('aria-label', 'Switch to night mode');
});

test('theme toggled on /sheet persists when navigating to /', async ({ page }) => {
  await page.goto('/sheet');
  await page.locator('#toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-time', 'day');
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-time', 'day');
});

// ── Layout / overflow ─────────────────────────────────────────────────────────

test('no horizontal overflow on /sheet at 390px width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/sheet');
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(overflow).toBe(false);
});

test('no horizontal overflow on /sheet at 2560px width', async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1440 });
  await page.goto('/sheet');
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(overflow).toBe(false);
});
