import { defineConfig, devices } from '@playwright/test';

const ci = !!process.env.CI;
// Local: use installed Edge for Chromium projects (no browser download needed). CI: bundled Chromium.
// ponytail: channel spread omitted in CI so Playwright uses its installed chromium.
// Apple device projects use real WebKit everywhere — channel is chromium-only, never applied to webkit.
const ch = ci ? {} : { channel: 'msedge' };

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://localhost:4321' },
  webServer: {
    // astro 7 `dev` daemonizes when stdin isn't a TTY — the spawned parent exits and
    // Playwright aborts with "exited early". build+preview stays foreground everywhere.
    // reuseExistingServer stays false so a stale preview can never serve old code to tests.
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    // Apple devices: real WebKit — no channel spread (channel: 'msedge' is chromium-only).
    { name: 'iphone-se',    use: { ...devices['iPhone SE'],     browserName: 'webkit' } },
    { name: 'iphone-15pro', use: { ...devices['iPhone 15 Pro'], browserName: 'webkit' } },
    { name: 'ipad',         use: { ...devices['iPad (gen 7)'],  browserName: 'webkit' } },
    // Pixel 8: Chromium emulation (faithful to Android). ch = msedge locally, bundled chromium in CI.
    // ponytail: Pixel 7 ≈ Pixel 8 form factor; update when PW adds a Pixel 8 descriptor
    { name: 'pixel-8',      use: { ...devices['Pixel 7'],       ...ch } },
    { name: 'desktop-1366', use: { viewport: { width: 1366, height: 768  }, ...ch } },
    { name: 'desktop-1920', use: { viewport: { width: 1920, height: 1080 }, ...ch } },
    { name: 'desktop-2560', use: { viewport: { width: 2560, height: 1440 }, ...ch } },
  ],
});
