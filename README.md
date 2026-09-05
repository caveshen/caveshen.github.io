# caveshen.com

Caveshen Rajman's portfolio and CV, built as a videogame's menus: a title
screen over a night photograph of Cape Town, a vector promenade with a
character to talk to, and the CV as a character record. Astro, static,
deployed to Cloudflare Pages. The site is itself the portfolio piece.

See `docs/PRD.md` for what the site is and the work in flight,
`docs/STYLE_GUIDE.md` for the design language, and `docs/TEST-STRATEGY.md`
for how it is tested.

## Development

```sh
npm install
npm run dev        # localhost:4321
npm test           # unit suite
npm run test:e2e   # Playwright matrix
npm run build      # static output to dist/
```
