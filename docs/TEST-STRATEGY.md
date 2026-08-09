# Test strategy

Approved by Caveshen, 2026-08-09. This is the canonical reference for how
this repo tests. The PRD (§d34) tracks the execution work that brought the
suite in line with it; this document outlives that work.

**Goal, one sentence:** both test levels are fast, deterministic, and
consistent — solitary unit tests for the modules we built, Playwright for
the user-visible contract plus honest performance signals — and every
test that does not protect the site is expunged.

## The two levels

### Unit tests

- Home: vitest, `src/tests/*.test.js`, run by `npm test`.
- Style: classical and solitary. A unit test exercises one module we
  built (`src/scripts/*`) through its own interface. No browser, no
  network, no expectation beyond the module's contract.
- Budget: the whole unit run stays under 15 seconds.
- A test that needs no browser does not get one. Pure logic reached only
  through e2e gets extracted into a testable function and tested here.

### Integration tests

Playwright verifies the user-visible contract only: look and feel, and
functionality. A spec earns its place when its failure means a user sees
something wrong.

Rules:

- **One journey per arrival mode.** Do not re-walk the same journey in a
  second spec for a different entry point unless the entry point itself
  is the contract.
- **No implementation trivia.** Animation-delay ordering, internal
  timing budgets, and property proxies are not user contracts. If a
  cheap stylesheet or unit assertion covers the intent, use that.
- **No copied blocks.** Shared geometry and assertion blocks live in
  `e2e/geom.js` (or a sibling helper), never copy-pasted between specs.
- **Artifact generation is not a test.** Screenshot capture for human
  acceptance lives in standalone scripts under `scripts/`, run ad hoc,
  never in the CI matrix.

## Determinism laws

Won at cost during the d32/d33 view-transition work; they bind all new
tests:

- **Branch on execution evidence, never capability claims.** Gate on
  what actually happened in the page (e.g. the `arrived-by-morph`
  marker), never on API probes (`'onpageswap' in window`) and never on
  the Playwright project name.
- **Read a marker once per journey.** Re-reads race the engine.
- **No fixed sleeps.** Use event or state waits, auto-retrying
  assertions, WAAPI settle helpers, or `page.clock`.
- **Pause, act, resume** for moving click targets (the banner-plane
  idiom): pause the animation, real click, resume — never force-click
  past a moving target.
- **Console filters name exact strings** (e.g. the benign Chromium
  "Transition was skipped" line), never patterns broad enough to hide a
  real error.

## CI browser policy

CI and local both run branded Edge (`channel: 'msedge'`) for the
Chromium-family projects. Ruled by Caveshen 2026-08-09.

Why: the suite must test the browser users actually run. Playwright's
bundled Chromium diverges from branded builds in ways that cost real
time (its compositor freezes `requestAnimationFrame` after a skipped
cross-document view transition — three CI rounds were lost to it), and
it guards a user population of zero. The accepted trade: the CI browser
now floats on Microsoft's release cadence, so a red CI can mean "Edge
moved" — that is news we want, since a breaking Edge update hits real
visitors too.

Firefox and WebKit projects stay on Playwright's bundled builds.

## Performance testing

The wish is site performance including GPU and CPU. It splits into what
CI can honestly measure and what it cannot.

**In CI (report-only until baselines prove themselves, then blocking):**

- Core Web Vitals via `PerformanceObserver` injection on `/` and
  `/sheet`: LCP and CLS. INP only as a synthetic proxy.
- CDP `Performance.getMetrics`: JS heap size, layout and style-recalc
  counts, TaskDuration. TaskDuration plus layout counts are the CPU
  signal.
- Trace-based timings and event counts.
- Assertion rule: compare against baselines recorded in the repo; fail
  only on a regression delta outside a generous tolerance. Never assert
  absolute budgets. Baselines are re-recorded deliberately, never
  auto-updated. The perf suite runs on one desktop project only.

**Never in CI:** GPU utilisation, FPS, paint smoothness, absolute
wall-clock budgets. The runners render in software on shared throttled
hosts — a GPU number there measures the runner, not the site.

**Locally (ad hoc):** the GPU/FPS harness (`scripts/`, headed Edge, real
GPU) samples frame rate during the idle scene, dialogue, and both
morphs; reports long animation frames and dropped frames; and runs the
hidden-compute checklist — animations still running while the page is
hidden or the element is offscreen/occluded. Output is a human-readable
report for Caveshen's judgement; no assertions, no gate.

## House rules that also bind tests

- Name a test after what it tests, never after a tracker ID.
- New tests that guard something must be seen failing for the right
  reason first (prove red).
- A deliberate shortcut carries a `ponytail:` comment naming its ceiling.
