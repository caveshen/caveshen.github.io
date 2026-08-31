// Build-generated robots.txt: gated build (the live cover) allows all
// crawlers and names the sitemap; ungated build (the github.io preview)
// disallows all, so the preview never competes with the domain in search.
export function GET() {
  const gated = import.meta.env.GATED === '1';
  const body = gated
    ? `User-agent: *\nAllow: /\n\nSitemap: ${import.meta.env.SITE}/sitemap-index.xml\n`
    : `User-agent: *\nDisallow: /\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
}
