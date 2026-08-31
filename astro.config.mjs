// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// The repo's one build-time flag (see src/layouts/Base.astro). Config runs as
// a plain Node module before Vite/Astro exist, so read process.env here, not
// import.meta.env.
const GATED = process.env.GATED === '1';
const site = GATED ? 'https://caveshen.com' : 'https://caveshen.github.io';

// Cloudflare Pages edge redirect: every route but the live cover 302s home.
// Gated build only — the github.io preview emits none.
const redirects = {
  name: 'gated-redirects',
  hooks: {
    'astro:build:done': ({ dir }) => {
      if (!GATED) return;
      const rules = ['/sheet / 302', '/og / 302', '/404 / 302'].join('\n') + '\n';
      writeFileSync(fileURLToPath(new URL('_redirects', dir)), rules);
    },
  },
};

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [
    sitemap({
      // Gated build: sitemap lists the live cover only. Ungated build: every
      // real page, minus the 404 page (not a real URL) and /og (the OG-image
      // composition source, unlinked).
      filter: (page) =>
        GATED ? page === `${site}/` : !page.includes('/404') && !page.includes('/og'),
    }),
    redirects,
  ],
});
