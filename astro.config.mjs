// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://caveshen.github.io',
  integrations: [
    sitemap({
      // 404 page is not a real URL — exclude it from the sitemap
      filter: (page) => !page.includes('/404'),
    }),
  ],
});
