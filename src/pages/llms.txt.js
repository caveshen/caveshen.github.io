// Build-generated llms.txt: gated build describes the live cover only;
// ungated build flags itself as the unindexed preview, not the real site.
const GATED_BODY = `# Caveshen Rajman

Engineering Manager. Problem solver, coffee enjoyer, 10x human.

This is the live cover for caveshen.com. The full interactive site is
coming soon.

## Contact

- LinkedIn: https://www.linkedin.com/in/caveshen
- GitHub: https://github.com/caveshen
`;

const UNGATED_BODY = `# Caveshen Rajman — preview build

This is a development preview, not the indexed production site. Content
changes without notice. The live site is at https://caveshen.com.
`;

export function GET() {
  const gated = import.meta.env.GATED === '1';
  return new Response(gated ? GATED_BODY : UNGATED_BODY, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
