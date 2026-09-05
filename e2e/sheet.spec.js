// sheet.spec.js — the character record: content, links, keyboard reach, the
// always-night register, the attributes, the skill tree, the quest log.
import { test, expect } from './fixtures.js';
import { approachPrompt } from './geom.js';

test('/sheet renders the whole record with JS disabled', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/sheet');

  // Real title tokens, styled as quest headings.
  await expect(page.getByRole('heading', { name: 'Engineering Manager' })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Senior Software Engineer/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Senior Software Developer/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Managing Editor' })).toBeVisible();

  await expect(page.locator('.skill-tree')).toContainText('.NET and C#');
  await expect(page.locator('.codex')).toContainText('Bachelor of Commerce');
  await expect(page.locator('.codex')).toContainText('ISTQB');

  await expect(page.locator('.back-link')).toBeVisible();
  await page.locator('.back-link').click();
  await expect(page).toHaveURL('/');

  await ctx.close();
});

test('no-JS: / noscript link navigates to /sheet with real content', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  // Provided by the <noscript> block in index.astro (Stage's own noscript-note).
  // Scoped: the threshold cover ships a second, now-hidden a[href="/sheet"] of
  // its own (#cover-sheet), which would make a bare a[href="/sheet"] ambiguous.
  const noscriptLink = page.locator('.noscript-note a[href="/sheet"]');
  await expect(noscriptLink).toBeVisible();
  await noscriptLink.click();
  await expect(page).toHaveURL('/sheet');
  await expect(page.getByRole('heading', { name: 'Engineering Manager' })).toBeVisible();
  await ctx.close();
});

test('recruiter path: / → /sheet in 1 click via system option', async ({ page }) => {
  await page.goto('/');
  await approachPrompt(page);
  await expect(page.locator('#choices button.system')).toBeVisible();
  await page.locator('#choices button.system').click();
  await expect(page).toHaveURL('/sheet');
});

test('the menu bar and the footer both carry a /cv.pdf link', async ({ page }) => {
  await page.goto('/sheet');
  await expect(page.locator('.download-btn')).toHaveAttribute('href', '/cv.pdf');
  await expect(page.locator('.download-btn')).toBeVisible();
  await expect(page.locator('.sheet-foot a[href="/cv.pdf"]')).toBeVisible();
});

test('GET /cv.pdf returns 200 with content-type application/pdf', async ({ request }) => {
  const response = await request.get('/cv.pdf');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/pdf');
});

test('back link to / is present and navigates to /', async ({ page }) => {
  await page.goto('/sheet');
  const back = page.locator('.back-link');
  await expect(back).toHaveAttribute('href', '/');
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

// ── Keyboard reach ─────────────────────────────────────────────────────────

test('back link is first in tab order on /sheet', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'WebKit does not Tab-focus <a> elements by default (platform behaviour, not a site bug)');
  await page.goto('/sheet');
  await page.keyboard.press('Tab');
  await expect(page.locator('.back-link')).toBeFocused();
});

test('back link and download button both reachable by keyboard on /sheet (real Tab walk)', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'WebKit does not Tab-focus <a> elements by default (platform behaviour, not a site bug)');
  await page.goto('/sheet');
  let foundBack = false, foundDownload = false;
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('Tab');
    const href = await page.evaluate(() => document.activeElement?.getAttribute('href'));
    if (href === '/') foundBack = true;
    if (href === '/cv.pdf') { foundDownload = true; break; }
  }
  expect(foundBack, 'back link not reached via Tab').toBe(true);
  expect(foundDownload, 'download button not reached via Tab').toBe(true);
  await expect(page.locator('.download-btn')).toBeFocused();
});

for (const [name, selector] of [
  ['download button', '.download-btn'],
  ['back link', '.back-link'],
  ['contact link', 'a[href="https://www.linkedin.com/in/caveshen"]'],
]) {
  test(`${name} has a visible focus outline`, async ({ page }) => {
    await page.goto('/sheet');
    await page.locator(selector).focus();
    const outline = await page.evaluate(() =>
      window.getComputedStyle(document.activeElement).outlineStyle
    );
    expect(outline).not.toBe('none');
  });
}

// ── The record holds the night register ────────────────────────────────────

test('night by default on /sheet, and no theme toggle', async ({ page }) => {
  await page.goto('/sheet');
  await expect(page.locator('html')).not.toHaveAttribute('data-time', 'day');
  await expect(page.locator('#toggle')).toHaveCount(0);
});

test('a stored day choice does not reach /sheet — menus have no time of day', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('time', 'day'));
  await page.goto('/sheet');
  await expect(page.locator('html')).not.toHaveAttribute('data-time', 'day');
  // The world still honours it.
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-time', 'day');
});

// ── Layout ─────────────────────────────────────────────────────────────────

for (const vp of [{ width: 390, height: 844 }, { width: 2560, height: 1440 }]) {
  test(`no horizontal overflow on /sheet at ${vp.width}px width`, async ({ page }) => {
    await page.setViewportSize(vp);
    await page.goto('/sheet');
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(overflow).toBe(false);
  });
}

test('the skill tree scrolls sideways at phone width instead of squashing', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/sheet');
  const scroll = await page.locator('.tree-scroll').evaluate((el) => ({
    scrollWidth: el.scrollWidth, clientWidth: el.clientWidth,
    overflowX: getComputedStyle(el).overflowX,
  }));
  expect(scroll.overflowX).toBe('auto');
  expect(scroll.scrollWidth).toBeGreaterThan(scroll.clientWidth);
});

// ── Content ────────────────────────────────────────────────────────────────

test('identity: name, class, epithet, level and the four id fields', async ({ page }) => {
  await page.goto('/sheet');
  await expect(page.locator('#character-name')).toHaveText('Caveshen Rajman');
  await expect(page.locator('.class-line')).toHaveText('Engineering Manager');
  await expect(page.locator('.epithet')).toHaveText('Problem solver, coffee enjoyer, 10x human');
  await expect(page.locator('.level-badge')).toContainText('11');
  await expect(page.locator('.id-fields dt')).toHaveText(['Origin', 'Base', 'Background', 'Faction']);
  await expect(page.locator('.xp-label')).toContainText('11 years');
});

test('six attributes, each with a score out of 20 and a lit gauge', async ({ page }) => {
  await page.goto('/sheet');
  const attrs = page.locator('.attributes .attribute');
  await expect(attrs).toHaveCount(6);
  const scores = await attrs.locator('.attr-score').allTextContents();
  for (const s of scores) {
    const n = Number(s);
    expect(n).toBeGreaterThanOrEqual(1);
    expect(n).toBeLessThanOrEqual(20);
  }
  // The gauge fill is a dash on the arc: a lit length, never the full circle.
  const dash = await attrs.first().locator('.gauge-fill').getAttribute('stroke-dasharray');
  expect(parseFloat(dash)).toBeGreaterThan(0);
});

test('skill tree: five schools, every node ranked 1 to 3 with a label', async ({ page }) => {
  await page.goto('/sheet');
  await expect(page.locator('.skill-tree .school')).toHaveCount(5);
  await expect(page.locator('.skill-tree .school-name')).toHaveText([
    'Engineering', 'Frameworks', 'Cloud and tooling', 'Quality', 'Leadership',
  ]);
  const nodes = page.locator('.skill-tree .node');
  expect(await nodes.count()).toBeGreaterThan(15);
  const ranks = await nodes.locator('.node-rank').allTextContents();
  for (const r of ranks) expect(['1', '2', '3']).toContain(r);
  const labels = await nodes.locator('.node-label').allTextContents();
  for (const l of labels) expect(l.trim().length).toBeGreaterThan(0);
});

test('quest log: four quests, one active with an open objective', async ({ page }) => {
  await page.goto('/sheet');
  await expect(page.locator('.quest')).toHaveCount(4);
  await expect(page.locator('.quest.active')).toHaveCount(1);
  await expect(page.locator('.quest.active h4')).toHaveText('Engineering Manager');
  await expect(page.locator('.quest.active .objectives li.open')).toHaveCount(1);
  await expect(page.locator('.quest', { hasText: 'Managing Editor' })).toContainText('EGMR');
});

test('codex lists five entries, each dated', async ({ page }) => {
  await page.goto('/sheet');
  const entries = page.locator('.codex-list li');
  await expect(entries).toHaveCount(5);
  const years = await entries.locator('.codex-year').allTextContents();
  for (const y of years) expect(y).toMatch(/^\d{4}$/);
});
