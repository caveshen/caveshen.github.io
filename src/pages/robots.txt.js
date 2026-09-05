// Build-generated robots.txt: the live host allows all crawlers and names the
// sitemap; a preview build (SITE override) disallows all.
export function GET() {
  const live = import.meta.env.SITE === 'https://caveshen.com';
  const body = live
    ? `User-agent: *\nAllow: /\n\nSitemap: ${import.meta.env.SITE}/sitemap-index.xml\n`
    : `User-agent: *\nDisallow: /\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
}
