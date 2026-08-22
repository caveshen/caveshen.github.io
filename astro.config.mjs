// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://caveshen.github.io',
  integrations: [
    sitemap({
      // 404 page is not a real URL; /og is the OG-image composition source, unlinked
      filter: (page) => !page.includes('/404') && !page.includes('/og'),
    }),
  ],
});
