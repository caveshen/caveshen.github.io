# Spec — the Badger head (favicon, social image, sheet portrait)

PRD item d35; d20 (PRD §32) folds in. Brief accepted by Caveshen
2026-08-17; the brief's decisions are settled and are restated here,
not re-argued. Status: **ready for tickets.**

Settled by the brief: a straight portrait bust — head and shoulders,
bare, no hood, helm, or costume; the badger's natural mask and stripes
carry the character. Sculpted SVG in the scene's idiom: flat fills via
CSS token classes, current palette. Three consumers: the favicon
(replacing the warm-disc mark — supersession of §30's disc decision is
already recorded), the social preview (d20), and `/sheet`.

## Open questions (defaults given; none block the build)

1. **View angle.** The brief allows three-quarter or front view.
   Recommended default: **three-quarter** — the mask stripes read as
   drawn character rather than a symmetric logo. Caveshen rules at the
   ticket-01 preview.
2. **Favicon backdrop.** Recommended default: **keep the rounded
   night-ink square** behind the head, as the warm disc had — the pale
   head needs a ground on light tab strips. Alternative: transparent
   background. Caveshen rules at the ticket-02 preview.
3. **OG time-of-day.** Recommended default: **night** — the site's
   default theme, and the register the retired moon mark set. A day
   variant is extra render surface with no consumer.
4. **The `/og` route ships in the deployed site** (unlinked, noindex,
   out of the sitemap). Recommended default: **ship it** — it costs
   nothing and gives Caveshen a live page to tune the composition on.
   Alternative: strip it from `dist` after build (more machinery, no
   gain).

## Problem Statement

The site has no drawn face. The favicon is a warm disc — a moon mark
that names the scene, not the character. The social image is a crop of
the landing page with the characters hidden: the lower third reads as
dead foreground and the title floats on it (§32). The character sheet
shows a portrait only on viewports wider than 1650px, and that
portrait is the full-body raster, not a face. The character the whole
site is built around has no head that can travel to the places the
full scene cannot go.

§32 also left a standing tension: the current OG image is derived from
the live site, so it can never lie — but it cannot be composed either.
A hand-authored poster would look deliberate and then drift, exactly
as the pre-§30 images did. Anything composed must carry a mechanism
that fails when it stops matching the live scene.

## Solution

One sculpted head, drawn once, consumed three times.

The head is authored as a single SVG source with token-class fills —
the same idiom as the skyline. A thin component inlines it wherever
the site needs it. A derive script bakes it into the standalone
raster and icon formats.

The OG image becomes a composed poster that cannot drift, in two
parts. First, the composition is authored **in the site**: a real
`/og` route places the real scene backdrop and the real head
component at 1200×630. The image is a screenshot of that route, so it
is made of the same components the visitor sees — a scene change
flows into the next render by construction. Second, a freshness gate
closes the remaining hole (a stale committed PNG): the derive script
records a hash manifest of every input file, and a unit test fails
whenever an input has changed since the last render. The suite goes
red until someone runs one command. Derived honesty and composed
control, both.

On `/sheet`, the head becomes the sheet's portrait: a framed panel in
the nameplate, visible at every viewport. The wide-viewport rail
portrait (the full-body raster with its cross-document morph) is not
touched.

## User Stories

1. As a visitor, I want the browser tab to show the badger's face, so that the tab names the character and not an abstract disc.
2. As a visitor with many tabs, I want the favicon readable at 16px, so that the mark survives real tab-strip sizes.
3. As a visitor sharing the site, I want the social card to show the character over the real scene, so that the link preview is an invitation, not a cropped landscape.
4. As the site owner, I want the social image composed from the live components, so that it can never show a scene the site does not have.
5. As the site owner, I want the test suite to fail when any derived image goes stale, so that scene changes can never silently drift from the images again.
6. As an iOS visitor saving the site, I want the home-screen icon to carry the head, so that all the marks agree.
7. As a visitor to the character sheet, I want a portrait of the character in the sheet's header, so that the sheet reads as a character sheet at every viewport width.
8. As a visitor flipping the theme, I want the head to hold its identity colours, so that the character never changes colour with the weather.
9. As a future maintainer recolouring the site, I want the head's colours driven from the token file, so that a palette change reaches the head without redrawing it.
10. As a reduced-motion or no-JS visitor, I want the head fully static and CSS-only, so that the new art costs nothing in motion or script.

## Implementation Decisions

### The head source and component

- The canonical drawing is one hand-authored SVG file:
  `src/assets/badger-head.svg`. Flat fills only, applied via CSS
  classes — **no `fill`/`stroke` presentation attributes carrying
  `var()`** (repo standing rule; `var()` does not resolve there). No
  rasters, no `<image>` elements, no filters.
- **No generated or traced art.** The commissioned rasters
  (`public/badger-up.png` / `badger-down.png`) are inspiration only —
  never imported, traced, or auto-vectorised. The geometry is written
  by hand at hand scale: tens of paths, not thousands of points. The
  reviewer checks this.
- `src/components/BadgerHead.astro` is the single consumer interface:
  it inlines the SVG source (raw import) and takes no props beyond an
  optional class. Sizing is the caller's business via CSS. Two page
  consumers (`/sheet`, `/og`) plus the derive script justify the
  component.

### Palette and theme

- Fills use the current palette only — no new colour values. Prefer
  existing classes and tokens (`f-moon` / `f-crater` for the pale
  regions is the expected fit). Where a region needs a colour with no
  existing class, add an `f-head-*` class in `src/styles/tokens.css`
  whose value is a current palette colour (the night ink `#0f1826` is
  the expected dark).
- **The head never re-shades with the theme.** This is the recorded
  identity/lighting doctrine (PRD §33b): characters hold their
  identity colours; environment shades. Head classes are defined once
  in `:root` with no day override — the same pattern the moon already
  uses. A d37 recolour edits tokens.css and the head inherits it.

### Deliverables — formats and sizes

All four derived files are emitted by `docs/render-og.js` (the
existing derive script, extended — same file, history preserved):

- **`public/favicon.svg`** — the head over the night-ink rounded
  square (Open question 2), with **baked hex fills**. Browsers fetch
  a favicon standalone; site CSS never applies, so classes cannot
  colour it. The script parses the needed custom-property values out
  of `src/styles/tokens.css` (they are machine-regular `--name: #hex`
  lines) and substitutes class → `fill` — the SVG source stays the
  single drawing, and a recolour flows through on re-render. No
  hand-maintained second copy of the head, and no hand-maintained
  colour table in the script.
- **`public/favicon.ico`** — regenerated from the same baked markup
  at 32×32, using the script's existing PNG-in-ICO container code.
  Single size, as today.
- **`public/apple-touch-icon.png`** — 180×180, the head on a
  full-bleed night-ink square (iOS applies its own corner mask).
- **`public/og-image.png`** — 1200×630, a screenshot of the built
  `/og` route (below).
- **16px legibility is a hard requirement** for the favicon. Default:
  one drawing serves all sizes. Only if the ticket-02 preview proves
  the full head illegible at 16px may the source carry a simplified
  small-size group — and that group lives in the same source file, so
  the freshness gate still covers it.

### The OG route and the honesty mechanism

- `src/pages/og.astro` is a real route: the scene backdrop via the
  real `Scene` component, the head via `BadgerHead`, and the accepted
  title line ("CAVESHEN RAJMAN", carried verbatim from the current
  render script — his accepted copy, not new prose) as route markup.
  Any new copy on the route is `PLACEHOLDER`.
- `Scene.astro`'s `character` prop becomes optional (renders no
  character when absent). This is §32's "framing authored in the
  scene" middle ground: the OG camera and layout are source files,
  previewable and reviewable, not script-side CSS injection.
- The route is unlinked, passes `noindex` to `Base`, and is excluded
  from the sitemap (the config already excludes the 404 the same
  way). It ships (Open question 4).
- `docs/render-og.js` re-points its OG block at `/og` and deletes the
  style-injection and title-injection hacks. It emulates reduced
  motion before the screenshot so the city-light glimmer cannot vary
  the pixels between renders. A fresh browser profile has no stored
  theme, so the route renders night by default; the script relies on
  that.
- **The freshness gate.** A small shared module
  (`docs/derived-inputs.js`) names the input set — every file under
  `src/components/` and `src/styles/`, plus `src/pages/og.astro` and
  `src/assets/badger-head.svg` — and the four output files, with one
  hash function. The derive script writes
  `docs/derived-images.json`: a SHA-256 per input and per output. A
  unit test recomputes every hash and fails on any mismatch, naming
  the fix in its message: `node docs/render-og.js`. Hashing the whole
  component and style directories is deliberate over-coverage: an
  unrelated component edit forces a needless re-render (one command),
  but no scene-touching file can ever be missing from the list. Output
  hashes catch a hand-edited or corrupt PNG the same way.
- Golden-image pixel comparison stays ruled out. The gate compares
  file hashes of committed artefacts against a committed manifest —
  deterministic, no renderer in the test, no tolerance windows.

### `/sheet` placement

- The head becomes the sheet's portrait: a new framed panel inside
  the nameplate, following the existing panel convention (border,
  `panel-caption` below; caption text is `PLACEHOLDER`). It is
  decorative — `aria-hidden="true"`, like the rail portrait.
- It is visible at **every** matrix viewport. Exact geometry (column
  order in `.nameplate-inner`, size, stacking under 640px) is tuned
  at preview; the contract is: visible, unclipped, overlapping
  nothing.
- **The rail portrait is untouched.** `.sheet-portrait` (≥1650px, the
  full-body raster, `view-transition-name: character-portrait`) keeps
  its raster and its morph. Rationale: it is the moving half of the
  cross-document morph with the in-scene raster badger — swapping it
  for a bust would break that continuity — and it is invisible to
  most visitors anyway. The head panel is additive.

## Testing Decisions

- Existing seams only: Vitest units for file-level and pure-logic
  checks, Playwright e2e over the built site for the user-visible
  contract, per `docs/TEST-STRATEGY.md`. No new seams.
- SVG geometry assertions in e2e use screen space
  (`getBoundingClientRect()`), never `getBBox()` (repo standing
  rule).
- Unit subjects, named for what they test:
  - `badger-head` — every class used in the head source has a rule in
    tokens.css; no `var()` in presentation attributes; no raster or
    `<image>` reference in the source; head classes carry no day
    override.
  - `derived-images` — the freshness gate: manifest hashes match
    recomputed hashes for all inputs and outputs.
  - `hygiene` (rework) — the favicon assertions stop naming the warm
    disc's colours and assert the head's colours instead, with
    expected hex values read from tokens.css rather than hard-coded.
- e2e subjects:
  - `sheet` (extend) — the head panel renders on `/sheet` across the
    matrix; its rect is inside the viewport and intersects neither
    the name box nor the id grid; existing `sheet-portrait` and
    `portrait-handoff` specs stay green and unmodified.
  - `hygiene` (existing) — OG meta, icon links, and 200 responses
    already covered; paths do not change. Add one assertion: `/og`
    carries the noindex meta.
- Every new regression assertion is proven red first: inject the
  defect, watch it fail, remove the injection. For `derived-images`
  the proof is: touch an input file after rendering, watch the test
  fail, re-render.
- **Eyeball the render — mandatory per ticket.** Every composition
  defect this project has shipped passed a green suite and was caught
  by a screenshot. Each visual ticket ends with screenshots (repo
  recipe: `.mjs` at the repo root, `playwright-core` with
  `channel: 'msedge'`, output to the gitignored `screenshots/`,
  script deleted after) and a local preview offered to Caveshen.
- One matrix run per ticket; zero flake tolerance; mind the port-4321
  workaround and never spawn `astro dev` as a server (repo gotchas).

## Tickets

Serial, one worker per ticket, on `item/badger-head`. Ticket 01 is
the art gate: Caveshen's preview acceptance of the head unblocks the
rest.

### 01 — the head source and component

Sculpt `src/assets/badger-head.svg`; add `BadgerHead.astro`; add any
needed `f-head-*` classes to tokens.css (current palette values only,
`:root` only).

- Step: write the `badger-head` unit spec first (classes resolve, no
  `var()` presentation attributes, no rasters, no day overrides) →
  verify: red before the source exists, green after.
- Step: sculpt the head, three-quarter view (Open question 1) →
  verify: unit spec green; `npm test` green.
- Step: screenshot the head standalone at 512, 64, 32, and 16 px →
  verify: eyeball — reads as a badger bust at 512, still reads at 16.
- Step: offer Caveshen the preview → verify: his acceptance recorded;
  view-angle ruling captured in this spec.

Done when: unit spec green, screenshots eyeballed, Caveshen accepts
the head.

### 02 — the favicon set

Extend `docs/render-og.js`: bake the head (class → hex from
tokens.css) into `public/favicon.svg`; regenerate `favicon.ico`
(32×32, existing ICO container) and `apple-touch-icon.png` (180×180)
from the baked markup. Rework the `hygiene` favicon unit assertions.

- Step: rework the hygiene favicon tests to assert the head's colours
  sourced from tokens.css → verify: red against the warm disc, green
  after the new favicon lands.
- Step: implement baking and regeneration; run the script → verify:
  the three icon files change on disk; `npm test` green.
- Step: screenshot the favicon at 16 and 32 px and the touch icon at
  180 → verify: eyeball at real tab size; offer Caveshen the preview
  (backdrop ruling, Open question 2).

Done when: all three icon files carry the head, hygiene units green,
16px legibility accepted by Caveshen.

### 03 — the OG route and image

Make `Scene.astro`'s `character` prop optional. Build
`src/pages/og.astro` (backdrop + head + carried title line; noindex;
sitemap-excluded; unlinked). Re-point the script's OG block at `/og`,
delete the injection hacks, add reduced-motion emulation, re-render
`og-image.png`.

- Step: add the `/og` noindex assertion to the e2e `hygiene` spec →
  verify: red before the route exists, green after.
- Step: build the route and re-render → verify: full e2e matrix
  green, including untouched existing hygiene OG checks; the sitemap
  omits `/og`.
- Step: screenshot `og-image.png` and the live `/og` route → verify:
  eyeball at 1200×630 — head unclipped, title legible, no dead
  foreground; offer Caveshen the preview (composition tuning).

Done when: `og-image.png` is a screenshot of `/og`, matrix green,
composition accepted by Caveshen.

### 04 — the sheet portrait panel

Add the head panel to the `/sheet` nameplate (panel convention,
`PLACEHOLDER` caption, `aria-hidden`). Rail portrait untouched.

- Step: extend the e2e `sheet` spec — panel visible across the
  matrix, screen-space rect inside the viewport, no intersection
  with the name box or id grid → verify: red before the panel,
  green after; prove one geometry assertion red by injection.
- Step: run the full matrix → verify: `sheet-portrait` and
  `portrait-handoff` specs pass unmodified.
- Step: screenshot `/sheet` at the matrix widths, both themes →
  verify: eyeball — no clipping, no overlap, identity colours held
  in day; offer Caveshen the preview.

Done when: the panel shows at every viewport, matrix green, preview
accepted.

### 05 — the freshness gate

Add `docs/derived-inputs.js` (input/output list + hash function);
make `docs/render-og.js` write `docs/derived-images.json`; add the
`derived-images` unit test.

- Step: write the test first → verify: red (no manifest), green
  after a render.
- Step: prove the gate → verify: touch one scene component after
  rendering, test fails naming `node docs/render-og.js`; touch
  `og-image.png`, test fails; re-render, green.
- Step: run `npm test` → verify: whole unit run still under the
  15-second budget.

Done when: the gate is proven red on both a stale input and a
tampered output, and the suite is green on a fresh render.

## Success Criteria — done means

1. `public/favicon.svg`, `favicon.ico`, and `apple-touch-icon.png`
   all carry the head; the warm disc is gone from `public/`.
2. The favicon reads at 16px — accepted by Caveshen at preview.
3. `public/og-image.png` (1200×630) is a screenshot of the built
   `/og` route, which is composed from the real `Scene` and
   `BadgerHead` components.
4. The `derived-images` unit test fails when any input file changes
   after the last render, or when any output file is altered by
   hand — proven red once each way.
5. The head appears on `/sheet` at every matrix viewport; the rail
   portrait and its morph are byte-for-byte untouched.
6. Every fill in the head source is applied via a CSS class; no
   `var()` sits in any SVG presentation attribute.
7. The head holds its identity colours in both themes.
8. No generated or traced art; no raster inside the head source.
9. All copy introduced by this work is `PLACEHOLDER` except the
   carried title line; no PII in any output.
10. Vitest and the full Playwright matrix are green; every new
    regression assertion has been seen failing for the right reason.

## Out of Scope

- Any change to the in-scene raster Badger, its two-frame idle, or
  the approach interaction (d36 — delivered).
- The rail portrait and the cross-document portrait morph.
- Theme or palette changes (d37) — the head consumes tokens; it does
  not add colours.
- Dialogue content, the engine, and all site copy.
- A day-time OG variant, favicon dark-mode variants, or multi-size
  ICO — none has a consumer today.
- Moving image generation into CI. The derive script stays a
  hand-run command; the freshness gate makes forgetting it a red
  suite, which is enough.

## Further Notes

- On delivery, the PRD is updated as part of the work: §32 closes
  (mechanism recorded), the d20 and d35 queue rows move, and §30's
  ledger gains the favicon supersession note.
- CONTEXT.md gains one term with this delivery: **the Badger head** —
  the character's portrait bust, the site's mark. _Avoid_: avatar,
  logo, icon art.
- The choice "hash manifest over build-time CI generation" and
  "compose in a real route over script-side injection" are the two
  decisions a future reader will question; this spec and PRD §32 are
  their record. If image generation ever moves into CI, the `/og`
  route and the derive script are already the right shape for it —
  the gate is what becomes redundant, not the composition.
- The derive script keeps its name (`render-og.js`) although it now
  renders the full derived-image set — renaming buys nothing and
  costs history. Its header comment is updated to match.
