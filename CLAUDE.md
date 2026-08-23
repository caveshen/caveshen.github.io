# CLAUDE.md — operational notes for this repository

`docs/PRD.md` is the source of truth: vision, decisions, defects, and the work queue. 
Read it before starting; update it as part of the work, not after.
Note: Do not use it for tracking code changes, rather rely on the git history. 

## Standing rules

- **Branch per accepted PRD item** (`item/<slug>`): reviewer pass → commits on branch →
  local preview → Caveshen's approval → **squash**-merge to main = deploy. Each squash
  commit on main is a checkpoint in the project's progress, so PRs are chunky by
  design — batch small fixes into the branch already in flight rather than giving a
  one-line change its own PR.
- **Offer the local preview.** It is his gate, not a step to skip because the change
  looks visually inert. Say what there is to see; let him waive it.
- **One item at a time.** Don't one-shot the backlog — queue items in the PRD and pick
  up a single one on his explicit go.
- **Prose (amended 2026-08-22).** Caveshen is the site's voice and final
  editor. Claude drafts site copy freely; it ships once he passes it at
  preview. Dialogue trees are primarily his — draft nodes only when
  invited, as proposals, and expect any line to be struck or rewritten
  without ceremony. Unpassed copy carries a `PLACEHOLDER` marker.
- **No generated art.** Vectors and programmatic drawing only. Reference images are
  inspiration — never trace, ship, or commit them.
- **No PII.** `cv.pdf` strips phone and email; contact is LinkedIn + the site itself.
  Verify with `pdftotext` after any CV re-render.
- **Always follow TDD principles**: Vitest units + Playwright e2e across the device matrix. The suite gates CI deploy.
- **Three tracking layers, one job each. Never duplicate across them.**
  - *Git commits* record all changes. They are the durable account — if the PRD were
    deleted, the history survives and only the forward plan is lost.
  - *`docs/PRD.md`* manages the work: what is done, what is left. Not a changelog.
  - *Comments* explain code that isn't easy to understand, or illustrate a chosen
    direction. File headers state purpose simply, ≤100 characters as a guideline.

  Never put in a comment: PRD item numbers, rulings, rationale belonging in the PRD, or
  the history of deleted code. Never restate what the line below already says. Where a
  PRD step asks for a ruling to be cited in a comment, this rule wins — reword the step.
- **Never name a test file after a tracker ID.** Name it for what it tests. IDs get
  renumbered — that happened on 2026-07-27, leaving a file named for one item while a
  different item had taken that number. Subjects do not move. Current test files follow this:
  `not-found`, `card-flash`, `banner-plane`, `badger`, `badger-idle`, `approach`,
  `hygiene`, `interview`, `sheet`, `camera`, `dialogue`, `theme`. Renames should use
  `git mv` so blame survives.

## Commands

```sh
npm test            # Vitest units
npm run test:e2e    # Playwright, multi-engine device matrix
npm run build       # astro build
```

## Gotchas that will bite you

- **Never spawn `astro dev` as a server.** Astro 7 daemonises when stdin isn't a TTY —
  the parent exits and Playwright aborts with "exited early". Tests use
  `build && preview` (see the comment in `playwright.config.js`). Clear strays with
  `npx astro dev stop`.
- **Assert SVG invariants in screen space.** `getBBox()` returns local geometry and
  ignores the element's own transform *and* every ancestor transform — a shape test
  written against it passes under any camera stretch. Use
  `getBoundingClientRect()`, and prove the test fails before trusting it.
- **A regression test nobody has watched fail is untested.** Inject the defect, see red,
  then keep the test.
- **Eyeball the render.** Every composition defect on this project so far — figure
  occlusion, cropped skyline, a figure with no arms — passed a green suite and was found
  by looking at a screenshot. Geometry and overlap assertions are the intended fix; 
  golden-image baselines are ruled out.
- Screenshot recipe: write a `.mjs` into the repo root (so `node_modules` resolves),
  `playwright-core` with `channel: 'msedge'`, delete it afterwards; save output into the
  gitignored `screenshots/` folder.
- **e2e port conflict.** `playwright.config.js` sets `reuseExistingServer: false` and its
  `webServer` wants port 4321 — if an `astro dev` server is already squatting there, the
  whole matrix fails to start. Three separate agents rediscovered this the same day.
  Workaround: copy `playwright.config.js` to a temp config **at the repo root** (outside
  the repo it can't resolve `@playwright/test`), changing only `baseURL` and the
  `webServer` command/url to port 4322 (`npm run build && npx astro preview --port 4322`),
  run with `--config`, then delete the temp config — strays have been left behind more
  than once.
- **`var()` does not resolve in SVG presentation attributes.** `fill="var(--token)"` as a
  presentation attribute is unreliable and has already caused a bug. Every fill in the
  current scene is applied via a CSS class instead (`f-sky`, `f-near`, `f-far`, `f-sea`,
  `f-moon`, `f-crater`, `f-cel`, `f-wave`, `f-ground`, `f-rail`, `f-star`), defined in
  `src/styles/tokens.css`.
