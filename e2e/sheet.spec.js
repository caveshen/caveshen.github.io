import { test, expect } from '@playwright/test';

// ── No-JS / static content (criterion 1) ──────────────────────────────────────

test('/sheet renders complete CV content with JS disabled', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/sheet');

  // Roles (all four present — real title tokens, D&D quest-log heading format)
  await expect(page.getByRole('heading', { name: /Engineering Manager/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Senior Software Engineer/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Senior Software Developer/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Managing Editor.*EGMR/ })).toBeVisible();

  // Skills (exact: true to avoid partial matches; from D&D skill list)
  await expect(page.getByText('SQL Archaeology', { exact: true })).toBeVisible();
  await expect(page.getByText('Scope Wrangling', { exact: true })).toBeVisible();

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
  await expect(page.getByRole('heading', { name: /Engineering Manager/ })).toBeVisible();
  await ctx.close();
});

// ── Recruiter path (criterion 4) ─────────────────────────────────────────────

test('recruiter path: / → /sheet in 1 click via system option', async ({ page }) => {
  await page.goto('/');
  // P4: card is hidden on load — approach the figure to reveal dialogue choices
  await page.locator('#approach-prompt').click();
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

test('back link and download link both reachable by keyboard on /sheet (real Tab walk)', async ({ page, browserName }) => {
  // WebKit (Safari) does not Tab-focus <a> elements by default — only form controls.
  // This is a platform behaviour, not a site defect; skip rather than weaken the assertion.
  test.skip(browserName === 'webkit', 'WebKit does not Tab-focus <a> elements by default (platform behaviour, not a site bug)');
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

// ── D&D structure landmarks (new restyle) ─────────────────────────────────────

test('ability rail has six framed ability scores', async ({ page }) => {
  await page.goto('/sheet');
  const rail = page.locator('[aria-label="Ability scores"]');
  await expect(rail).toBeVisible();
  await expect(rail.locator('.ability')).toHaveCount(6);
});

test('spellbook section is visible', async ({ page }) => {
  await page.goto('/sheet');
  await expect(page.locator('[aria-labelledby="spellbook-caption"]')).toBeVisible();
});

test('Class & Level label is plain "Class & Level" and XP line carries years-in-tech', async ({ page }) => {
  await page.goto('/sheet');
  // "1 level = 1 year in tech" was removed from the label as too on-the-nose (round 2);
  // the XP bar line carries the years-in-tech meaning on its own.
  await expect(page.getByText('Class & Level', { exact: true })).toBeVisible();
  await expect(page.getByText(/11 years in tech/)).toBeVisible();
});

test('vitals row is absent from /sheet (explicitly cut per PRD §4)', async ({ page }) => {
  await page.goto('/sheet');
  const html = await page.content();
  expect(html).not.toContain('Armor Class');
});

test('Background field shows "Software Engineering"', async ({ page }) => {
  await page.goto('/sheet');
  await expect(page.getByText('Software Engineering', { exact: true })).toBeVisible();
});

test('spellbook: .NET / C# cantrip chip is visible', async ({ page }) => {
  await page.goto('/sheet');
  await expect(page.getByText('.NET / C#', { exact: true })).toBeVisible();
});

test('spellbook: Power BI Level 2 chip is visible', async ({ page }) => {
  await page.goto('/sheet');
  await expect(page.getByText('Power BI', { exact: true })).toBeVisible();
});

test('spellbook: casting-stat trio header is absent (round 2 cut)', async ({ page }) => {
  await page.goto('/sheet');
  const html = await page.content();
  expect(html).not.toContain('Save DC');
  expect(html).not.toContain('Attack Bonus');
});

// ── Round 3 content additions (2026-07-18) ────────────────────────────────────

test('quest log has EGMR side-quest heading', async ({ page }) => {
  await page.goto('/sheet');
  await expect(page.getByRole('heading', { name: /Managing Editor.*EGMR/ })).toBeVisible();
});

test('quest log has four quest articles', async ({ page }) => {
  await page.goto('/sheet');
  await expect(page.locator('.quest')).toHaveCount(4);
});

test('spellbook: Divination tier is visible with Cypress chip', async ({ page }) => {
  await page.goto('/sheet');
  await expect(page.getByText('Divination')).toBeVisible();
  await expect(page.getByText('Cypress', { exact: true })).toBeVisible();
});

test('name-box epithet is visible', async ({ page }) => {
  await page.goto('/sheet');
  await expect(page.getByText('Problem solver, coffee enjoyer, 10x human')).toBeVisible();
});

test('skills panel has Games Journalism row', async ({ page }) => {
  await page.goto('/sheet');
  await expect(page.getByText('Games Journalism', { exact: true })).toBeVisible();
});

// ── Layout alignment (Round 5) ───────────────────────────────────────────────

test('middle and right columns bottom-align at desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/sheet');
  const middleBox = await page.locator('.middle-col').boundingBox();
  const rightBox  = await page.locator('.right-col').boundingBox();
  const middleBottom = middleBox.y + middleBox.height;
  const rightBottom  = rightBox.y  + rightBox.height;
  expect(Math.abs(middleBottom - rightBottom)).toBeLessThanOrEqual(16);
});
