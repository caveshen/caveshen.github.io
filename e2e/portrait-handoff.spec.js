// portrait-handoff — hand-off module behaviour on /.
// Covers T2 success criteria: no spurious overlay, navigation intact, cleanup after goBack.
import { test, expect } from '@playwright/test';

// Approaches and clicks the system button to navigate to /sheet.
// Returns whether the engine supports cross-document View Transitions.
async function clickThroughToSheet(page) {
  await page.locator('#approach-prompt').click();
  await expect(page.locator('#choices button.system')).toBeVisible();
  await Promise.all([
    page.waitForURL('/sheet'),
    page.locator('#choices button.system').click(),
  ]);
  return page.evaluate(() => 'onpageswap' in window);
}

test('no overlay img exists on / before any navigation', async ({ page }) => {
  await page.goto('/');
  const overlayCount = await page.evaluate(() =>
    [...document.querySelectorAll('body > img')].filter(
      (el) => el.style.viewTransitionName === 'character-portrait'
    ).length
  );
  expect(overlayCount).toBe(0);
});

test('click-through lands on /sheet in every project — navigation not broken', async ({ page }) => {
  await page.goto('/');
  await clickThroughToSheet(page);
  expect(page.url()).toContain('/sheet');
});

test('no overlay after goBack; idle animation restored in supported engines', async ({ page }) => {
  await page.goto('/');

  const supported = await page.evaluate(() => 'onpageswap' in window);
  const vp        = page.viewportSize();
  const wide      = vp !== null && vp.width >= 1650;

  await clickThroughToSheet(page);
  await page.goBack();
  await expect(page).toHaveURL('/');

  // No overlay element should exist (cleaned up by pageshow, or never created).
  const overlayCount = await page.evaluate(() =>
    [...document.querySelectorAll('body > img')].filter(
      (el) => el.style.viewTransitionName === 'character-portrait'
    ).length
  );
  expect(overlayCount).toBe(0);

  // When the hand-off ran, the freeze styles must be cleared so the idle runs again.
  if (supported && wide) {
    await expect.poll(async () => {
      return page.evaluate(() => {
        const el = [...document.querySelectorAll('.badger-up')]
          .find((e) => e.getBoundingClientRect().width > 0);
        return el ? getComputedStyle(el).animationName : null;
      });
    }, { timeout: 2000 }).not.toBe('none');
  }
});
