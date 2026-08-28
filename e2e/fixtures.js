// fixtures.js — shared `test` for specs that assert scene behaviour, not the
// threshold cover itself. Every spec written before the cover shipped
// expects `/` to open directly on the scene; this fixture keeps that true by
// pre-arming the cover's session flag before each test's first navigation, so
// the cover (which otherwise renders on every fresh load — see
// ThresholdCover.astro) never appears. threshold.spec.js is the one file that
// must see the real, undismissed cover — it imports straight from
// '@playwright/test' instead of here.
import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => sessionStorage.setItem('thresholdDismissed', '1'));
    await use(page);
  },
});
export { expect };
