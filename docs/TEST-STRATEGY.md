# Test strategy

Rewritten 2026-09-05 with the videogame-menus cutover. One sentence: unit
tests for the modules we built, Playwright for what a visitor can see and
do, and nothing that restates a stylesheet.

## Two levels

**Unit (vitest, `src/tests/*.test.js`, `npm test`).** Solitary tests of
our own modules through their interfaces: the dialogue engine and tree
schema, the camera and stage maths, the moon phase, the portrait hand-off
gate. Two kinds of file-reading test are allowed because they guard
things a browser cannot: the WCAG AA contrast maths over the design tokens
(`theme.test.js`, `threshold.test.js`), and the derived-images freshness
gate. Whole run under 15 seconds.

**Integration (Playwright, `e2e/*.spec.js`, `npm run test:e2e`).** A spec
earns its place when its failure means a visitor sees or feels something
wrong. Composition is asserted as geometry in screen space, never as a
golden image.

## The three questions

Every test answers all three or it goes:

1. Does it guard a behaviour a visitor can meet?
2. Would a real regression turn it red?
3. Does another test already cover it?

What that removed on 2026-09-05, so nobody re-adds it:

- Unit tests that parse a component's CSS and assert literal values back
  (`dialogue-wheel`, the interaction grammar and type roles in `theme`,
  the bezier evaluator that tested its own copied constants). The
  stylesheet is the contract; the e2e suite checks the rendered result.
- Existence checks for files the e2e suite already fetches with a 200.
- Route-parity loops. `/` and `/404` share `stage.js`; the loops doubled
  every prompt, exit and hotkey test for no second signal. `/404` keeps
  only what differs: its figure, its tree, its way home.
- Forced-viewport copies of tests the matrix already runs natively at that
  size. A forced viewport stays only where it pins a breakpoint edge or a
  size no project has (the 240×280 prompt fallback, 1200×1400).
- Animation-delay ordering, transition-property proxies and other
  implementation trivia.
- The report-only performance suite. Its baselines were recorded on the
  old front and nobody read the report. Performance is checked ad hoc
  with Lighthouse against the live site.

## Determinism laws

- Branch on execution evidence (the `arrived-by-morph` marker), never on
  API probes or the project name.
- No fixed sleeps. Event waits, auto-retrying assertions, WAAPI seeks, or
  `page.clock`. The two `waitForTimeout` calls in `scene-material` are the
  proof that no timer exists; they are the exception, named here.
- Pause, act, resume for moving click targets.
- Console filters name exact strings.
- A test that flakes once is fixed at the root or removed. There is no
  tolerated failure.
- A new guard is seen failing first: inject the defect, watch red, keep.

## The matrix and its cost

Projects: iphone-15pro, ipad, pixel-8, desktop-1920, desktop-2560,
desktop-firefox. Chromium-family projects run branded Edge, which is
preinstalled on the runners; WebKit and Firefox use Playwright's builds.

The matrix runs on pull requests only. The working branch's push job runs
the unit suite and deploys the preview. Last full PR run before the
prune: the slowest shard took 13 minutes and the run about 14 minutes
wall-clock, roughly 70 runner-minutes across eight shards. The pruned
suite on six shards is expected near 45 runner-minutes; re-measure at
the cutover PR and update this line.

## House rules that bind tests

- Name a test file after what it tests, never after a tracker ID. Rename
  with `git mv`.
- Shared geometry helpers live in `e2e/geom.js`.
- Screenshots for human acceptance are ad hoc scripts, never in CI.
