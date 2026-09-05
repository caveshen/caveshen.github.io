// Build-generated llms.txt: a plain-text account of the site for agents that read one.
const BODY = `# Caveshen Rajman

Engineering Manager, Cape Town. Problem solver, coffee enjoyer, 10x human.

The site is built as a videogame: a title screen, a promenade scene with a
dialogue, and a character sheet at /sheet. The CV is at /cv.pdf.

## Contact

- LinkedIn: https://www.linkedin.com/in/caveshen
- GitHub: https://github.com/caveshen
`;

export function GET() {
  return new Response(BODY, { headers: { 'Content-Type': 'text/plain' } });
}
