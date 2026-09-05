// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SITE overrides the canonical host for a preview deploy (preview.caveshen.com).
const site = process.env.SITE ?? 'https://caveshen.com';

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [
    sitemap({
      // Every real page, minus the 404 page (not a real URL) and /og (the
      // OG-image composition source, unlinked).
      filter: (page) => !page.includes('/404') && !page.includes('/og'),
    }),
  ],
});
