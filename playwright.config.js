import { defineConfig, devices } from '@playwright/test';

const ci = !!process.env.CI;
// Local: use installed Edge (no browser download needed). CI: bundled Chromium.
// ponytail: channel spread omitted in CI so Playwright uses its installed chromium
const ch = ci ? {} : { channel: 'msedge' };

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://localhost:4321' },
  webServer: {
    command: ci ? 'npm run build && npm run preview' : 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !ci,
    timeout: 120_000,
  },
  projects: [
    { name: 'iphone-se',    use: { ...devices['iPhone SE'],     ...ch } },
    { name: 'iphone-15pro', use: { ...devices['iPhone 15 Pro'], ...ch } },
    // ponytail: Pixel 7 ≈ Pixel 8 form factor; update when PW adds a Pixel 8 descriptor
    { name: 'pixel-8',      use: { ...devices['Pixel 7'],       ...ch } },
    { name: 'ipad',         use: { ...devices['iPad (gen 7)'],  ...ch } },
    { name: 'desktop-1366', use: { viewport: { width: 1366, height: 768  }, ...ch } },
    { name: 'desktop-1920', use: { viewport: { width: 1920, height: 1080 }, ...ch } },
    { name: 'desktop-2560', use: { viewport: { width: 2560, height: 1440 }, ...ch } },
  ],
});
