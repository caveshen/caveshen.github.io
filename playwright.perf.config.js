import { defineConfig } from '@playwright/test';
import base from './playwright.config.js';

// The perf suite lives under its own config so the functional matrix
// (`playwright test` with the main config) can never pick it up. If it
// shared the main config, CI's Integration step would run the perf specs
// outside the isolated perf step and a harness fault could block deploy.
export default defineConfig({
  ...base,
  projects: [
    // One desktop Edge run only — see docs/TEST-STRATEGY.md, Performance testing.
    { name: 'perf', testMatch: ['**/*.perf.js'], use: { viewport: { width: 1920, height: 1080 }, channel: 'msedge' } },
  ],
});
