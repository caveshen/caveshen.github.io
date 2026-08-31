import { defineConfig, devices } from '@playwright/test';

// Gated-build pass: builds with the GATED flag on and serves on the alternate
// port 4322 (the temp-config pattern in CLAUDE.md), so it can run alongside
// playwright.config.js's own dev server on 4321 without a port clash. The
// gate is markup, not rendering, so one desktop engine (branded Edge, same
// as playwright.config.js) is enough — no device matrix needed here.
export default defineConfig({
  testDir: './e2e',
  testMatch: 'gated-cover.spec.js',
  use: { baseURL: 'http://localhost:4322' },
  webServer: {
    // env (not a shell "GATED=1" prefix) sets the flag cross-platform —
    // Windows cmd.exe doesn't understand inline VAR=val syntax.
    command: 'npm run build && npm run preview -- --port 4322',
    url: 'http://localhost:4322',
    env: { GATED: '1' },
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: 'gated-desktop', use: { viewport: { width: 1920, height: 1080 }, channel: 'msedge' } },
  ],
});
