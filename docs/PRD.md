# PRD — Caveshen Rajman, Personal Portfolio ("The Interview")

**Status:** v2.3 — d11, d12, d17 and d25 are built on
`item/character-per-route` (`26a6ddb`). Both routes now render one shared
`Stage` over one shared `Scene`; only the character, the route and the dialogue
tree differ. See the status board.

**Numbering (2026-07-28):** the `§`/`D-` dual numbering is retired going
forward, at Caveshen's request — it was confusing and hard to type. Only
*outstanding* work carries a number from here, and it is `d1`, `d2`, …
(never `§`). Closed and accepted work keeps its historical `§` heading
unchanged; nothing old is renumbered or deleted. Every `d` item's own
heading or board row names its previous identity (e.g. "was §30 D-4") so
old cross-references and commit messages stay resolvable.

**`main`** — LIVE at https://caveshen.github.io (public repo
`caveshen/caveshen.github.io`; Pages via the test-gated Actions workflow).
**It serves landing v2**: PR #1 merged 2026-07-28 and carried P4+P5 across, and
every item since (d12 as #2, d25 as #3) merges into it. Suite: tri-engine
(Chromium / WebKit / Firefox) — see §13 for current counts.

**`item/character-per-route`** — d17, built (`26a6ddb`), **unmerged**, awaiting
Caveshen's look on local dev.

Copy is PLACEHOLDER by his explicit choice — iterating in public until his
words land. Accepted design reference: Sample C artifact
(claude.ai/code/artifact/4468f873-b55c-4d0e-a236-535aa5fb6d15, supersedes
0b8cd6e0). The in-repo mirror `docs/design-sample-c.html` was **deleted
2026-07-27** on Caveshen's authorisation — it predated §20/§25/§26, no longer
matched the shipped scene, and the interactive 404 (d1) now carries that design
forward as a living page. It is in git history if ever needed.
**Owner:** Caveshen (all writing/copy). **Orchestrator:** Claude (Fable 5).
See §14 for the amendments log.

### Status board — `d` items (outstanding work only)

Added 2026-07-25 after a reconciliation pass found nine sections whose headline
status contradicted their own bodies (typically "ACCEPTED — not yet built" atop
a section recording that it was built and accepted days earlier). **This table
is the index; the section is the detail.** When an item moves, move it here in
the same commit. Renumbered 2026-07-28 to `d` numbers (see the note under
Status above) — **closed items drop off this board entirely**; they remain in
the document body under their original `§` headings as history.

| d | Item | Was | Status |
|---|---|---|---|
| d1 | The interactive 404 | §30 D-4 | ✅ built & reviewer-approved 2026-07-27, awaiting Caveshen's visual sign-off |
| d2 | Card avatar extraction | §33a | ✅ built & reviewer-approved 2026-07-27, awaiting sign-off |
| d3 | 404 backdrop re-anchor (moon lost above ~2.1 AR) | §30 D-15 | ✅ built & accepted 2026-07-27 — viewBox 1200→1900 |
| d4 | 404 day clouds | §30 D-11 | ✅ built 2026-07-27 — two `.day-only` rects, offset to d3's camera |
| d5 | Card geometry test (pins the centred/on-screen criterion) | §30 D-14 | ✅ built 2026-07-27 — 3 tests × 8 projects, red-green proven |
| d6 | CI pipeline | *new* | ✅ built 2026-07-30 |
| d7 | Test strategy — PRD-focused assertions | *new* | ✅ built 2026-07-30 — ten assertions decoupled, not nine |
| d8 | Dev-only gate | §31 (first slice) + §30 D-6 | ❌ DISCARDED 2026-07-31 — toggles stay visible in prod |
| d9 | The `main` cutover | §23 | ✅ done 2026-07-28 — PR #1 merged; `main` serves landing v2 and later items merge into it. What is left is d21's copy, which is not a cutover gate |
| d10 | Fixed-sleep timing races | §30 D-8 | ✅ fixed 2026-07-29 — caught by CI, 3 of 4 sleeps removed |
| d11 | Card CSS authored twice (~90 lines) | §30 D-9 | ✅ closed 2026-08-02 `26a6ddb` — `NotFound.astro` deleted; verify: `grep -rl "\.choices button" src/` finds `Stage.astro` and nothing else |
| d12 | Shared scene component (`Scene.astro`) | §30 D-10 | ✅ built 2026-08-01 — `e96ecc8`, landed on the mainline as `672a988` (#2) |
| d13 | `Avatar.astro` uses `is:global` needlessly | §30 D-12 | ✅ built 2026-08-02 — scoped in `646754b`; verify: `grep -n "is:global" src/components/Avatar.astro` is empty |
| d14 | `not-found.spec.js` coupled to placeholder copy | §30 D-13 | ✅ closed by construction — verify: `grep -rn "toContainText('404')" e2e/` is empty |
| d15 | Admin page | §31 (remainder) | 🎨 IN DESIGN, no go-ahead |
| d16 | Card avatar art refinement | §33b | 🎨 IN DESIGN, brief outstanding |
| d17 | One character per route — Badger on `/`, hooded figure on `/404`; 1:1 **in interaction, not just scenery**; the toggle dies | §27 (remainder) | ✅ built 2026-08-02 `26a6ddb` — awaiting Caveshen's local-dev sign-off |
| d18 | Visual validation in e2e | §16 | ✅ must-haves built on `item/visual-validation`, reviewer-approved; nice-to-haves N1–N4 built (N1–N3 + N4's first case on `test/d18-nice-to-haves`, N4's face/card case fixed and committed on `fix/face-card-occlusion`) (see §16 status) — awaiting Caveshen's go to PR |
| d19 | Dialogue rework | §22 | ⏸ parked |
| d20 | Social preview imagery | §32 | ⏸ unscheduled |
| d21 | All copy | §23 checklist item 1 | Caveshen's alone; every `PLACEHOLDER` stands |
| d22 | Standardise test filenames — descriptive, not tracker IDs | *new* | ✅ built 2026-07-27 — 8 renames, counts unmoved |
| d23 | Hosted site — `caveshen.com` + Cloudflare | *new* | ✅ hosting live 2026-08-05 — zone active, HTTPS posture set; cutover (records + site link) deferred |
| d24 | The Badger on `/sheet` — character-select framing, outside the scene | *new* | ✅ merged 2026-08-08 (PR #16, `a9dcb39`), deploy green |
| d25 | Shared stage component — extracting the approach interaction | *new* | ✅ built 2026-08-02 — `1254dad`, landed on the mainline as `732f5a6` (#3); pure refactor, byte-identical `dist/index.html`, zero `e2e/` files modified |
| d26 | Cleanup sweep — four of five items built, one closed as not-debt | *new* | ✅ built 2026-08-02 — `daaafb9`; item 5 closed, replaced by lossless PNG recompression in `3f322ae` |
| d27 | CI: tag pushes fire the deploy workflow | *new* | ✅ built 2026-08-02 — `daaafb9` |
| d28 | Cityscape depth — staged parallax/gradient pass against the "flat" read | *new* | ✅ ACCEPTED 2026-08-04 (all stages + follow-ups, /code-review findings fixed, drift final at 1 unit) — PR open, awaiting merge |
| d29 | Comment sweep — repo-wide | *new* | ✅ merged to main (PR #7) |
| d30 | Easter egg — the banner plane crashes when clicked | *new* | 🔧 in build 2026-08-06 — go given, banner-copy follow-up deliberately skipped |
| d31 | Game-feel UI pass — streaming dialogue text + one selection idiom for every button | *new* | ✅ ACCEPTED 2026-08-04 (Parts A+B) — PR open from `item/game-feel-ui` |
| d32 | Scene→sheet transition — the Badger travels from the scene to his portrait seat | *new* | ✅ MERGED 2026-08-09 (PR #17, `dc9de23`) |
| d33 | Sheet→scene return — the Badger travels back from his portrait seat | *new* | 🚧 IN BUILD 2026-08-09 (§d33) |

**Convention set by d22 (2026-07-27): name a test after what it tests, never
after a tracker ID.** Tracker IDs get renumbered — that is exactly what happened
today, leaving `d5.spec.js` (a closed §15 defect) colliding with PRD item d5.
Subjects don't move. Caveshen's ruling: *"We're introducing technical debt if we
preserve old naming that becomes ambiguous to future endeavours."* Renames used
`git mv` so blame survives. Corollary, and the reason this is recorded here
rather than left as done-and-dusted: **the tracker must never constrain the
code** — the misnamed file had been left alone precisely *because* the PRD
referenced it, which is backwards.

d1, d3–d5, d6–d8, d10–d14, d17, d18, d23–d26 are written up as their own
`## dN` sections (§30's old D-4/D-6/D-8/D-9…D-13 subsections moved there, not
duplicated — see the note at each old location). d2, d9, d15, d16, d19–d21
have no separate `d` section: their detail still lives at the `§` heading
named in "Was", which is unchanged. **§7's OG/touch-icon debt is closed** —
see §30 D-2 (built 2026-07-26).

## 1. Purpose

A personal portfolio that is itself the portfolio piece: an interactive,
adventure-game-styled CV demonstrating narrative, design, and engineering
skill in one artifact.

Priority of audiences:
1. **Games-industry visitors** (calling card / self-expression) — play the dialogue.
2. **Recruiters/tech contacts** (secondary) — reach the plain CV in seconds.

## 2. Non-negotiables

- Must **not look AI-generated**. Design is locked to Sample C; deviations go
  through Caveshen.
- **Caveshen owns all copy** — site text and dialogue trees. Build ships with
  clearly marked placeholders (`PLACEHOLDER` token in source) until he replaces them.
- **Semantic HTML first.** Full CV content readable without JavaScript; the
  dialogue is progressive enhancement.
- **Accessibility floor:** fully keyboard-playable, visible focus, honoured
  `prefers-reduced-motion`, WCAG AA contrast in both themes.
- **Draft before deploy:** Caveshen reviews on local dev; deploy only on his
  approval. Clarified 2026-07-16 (pre-remote workflow, Caveshen OK'd): local
  commits proceed freely after the reviewer pass; **his approval gates push
  and deploy**. He may harden this to "gate commits on my review" at any time.
- **Recovery, not rollback (ruled 2026-07-27, standing rule):** never run
  `git revert`, unless explicitly asked. Caveshen: *"rollback in this case
  would be a best-attempt to deploy from a previous commit-hash, or a
  re-deploy, in which case 'rollback' as a term is not the true meaning and
  so the functionality is not needed. This is meant to be a project repo
  anyway, not a productionised SaaS."* Recovery means redeploying an earlier
  commit hash — nothing more. General principle: do not fit production-SaaS
  operational machinery (marker branches, rollback runbooks) to a project
  repo. Decided, not open.
- **Branch per PRD item (adopted 2026-07-19, post-launch):** `main` is
  production — every push deploys. Work on an accepted PRD item happens on
  its own branch (`item/<slug>`); commits land there after the reviewer
  pass; local preview + Caveshen's approval happen on the branch; merge to
  `main` (regular merge, history preserved) only when the item is done —
  the merge IS the deploy. CI runs the test job on pull requests;
  build/deploy remain main-only. Pragmatic exception: docs/PRD notes and
  trivial repo chores may commit straight to main at Caveshen's discretion.
- **TDD:** every phase starts from failing tests (see §13); the reviewer
  checks tests exist and pass before any commit.

## 3. Visual identity (locked — Sample C)

> **Reconciliation note 2026-07-25.** This section is the *original* Sample C
> lock and is kept as the historical record. Three later items have moved
> parts of it on `item/landing-v2-avatar`; read them as the current truth:
> - **Palette table below — SUPERSEDED by §25.** The night ground tokens are no
>   longer violet. `tokens.css` is the live source; the table records where the
>   scene started, not what it renders.
> - **`meet` / "the artwork never crops" — SUPERSEDED by §17.2.** Every scene
>   SVG is `xMidYMax slice` and the stage fills the window, cropping sky/sea
>   by design. The no-stretch invariant is untouched.
> - **"The trio only… nothing beyond either end" — SUPERSEDED by §20 + §26.**
>   The world now runs to world-x ≈ −295 (industrial district) and the chain is
>   a quartet (Devil's Peak added). "Nothing beyond either end" was a statement
>   about the 1750-unit standard viewBox; the world is wider than that viewBox
>   now and the cameras pan across it.

Concept: flat-vector Cape Town scene above a narrative-game dialogue card.

Scene composition (locked 2026-07-14 from Caveshen's skyline reference —
`E:\Users\Cavie\Downloads\2a84c08fd24fcaa421661c6643d02538.jpg`, a commercial
decal used as **inspiration only**: never ship, trace, or commit it):
- Far layer: Table Mountain (flat-topped massif, left/centre), Lion's Head
  (peak) and Signal Hill (low ridge) to the right.
- Foreground: city-bowl building silhouettes.
- Night: **lit windows in the buildings** (celestial yellow, varying opacity)
  are the city lights; sea strip with moonlight glints. Day: plain buildings,
  sun, clouds.
Originally prototyped in `docs/design-sample-c.html` (deleted 2026-07-27 — see
the header note); the shipped implementation is `src/pages/index.astro` and, for
the 404, `src/pages/404.astro`.

Responsive scene (2026-07-15): `preserveAspectRatio="xMidYMax meet"` plus a
sky/sea gradient on the scene element, so the artwork never crops and the
backdrop runs to the viewport edges at any width (the original `slice` cropped
moon/stars/mountain-tops on wide screens). Card sits below the scene on ≤680px.
**P1 stretch — art-directed aspect variants (SHIPPED 2026-07-16):** three
compositions swapped via aspect-ratio media queries — standard 1200×400
(default), wide 2400×400 panorama at ≥15/8, tall 600×800 portrait re-crop at
≤4/5 (card forced below the scene) — with the meet+gradient treatment as the
universal fallback between them.

**Skyline direction (Caveshen, 2026-07-16, from the decal):** the range is the
trio only — Table Mountain (long flat rectangle) → Lion's Head (sharp
triangle) → Signal Hill (soft small ellipse) — trailing off to the right of
the buildings, under the moon/sun, with **nothing beyond either end**; every
landform closes inside the artwork (no viewBox-edge cliffs).

**Signature feature: the theme toggle is the time of day.**
Dark (default) = night: stars, moon, sea glints, city-bowl lights.
Light = day: sun, clouds. 0.4s crossfade; none under reduced motion.

Original night tokens were violet; superseded by §25 — `tokens.css` is the
live source.

Type: **Georgia** (speech/prose), **Cascadia Code / ui-monospace** (options,
labels, chrome). Micro-signatures to keep: blinking avatar (abstract
placeholder until real art exists), SCUMM-style option hover (lavender → yellow).

## 4. Sitemap

- `/` — **The Interview.** Scene + dialogue card. Root node offers topic
  options plus the system option "Skip the chat — open the character sheet".
- `/sheet` — **The Character Sheet.** Fully static CV, styled after the D&D 5E
  character sheet's *anatomy* (official WotC sheet used as structural
  inspiration only — no traced artwork or trade dress) in the Sample C palette.
  **Direction committed 2026-07-18 from the workshop mock**
  (claude.ai/code/artifact/952df112-1dfe-4e27-86ca-b8dc3bd030a7); Caveshen
  wants it a touch (~15%) quieter than the mock, and workshopping continues:
  - Nameplate banner: character name; **Class & Level** = "Engineering
    Manager 11", label just "Class & Level" — round 2 (2026-07-18): the
    "1 level = 1 year in tech" label was too obvious/tasteless; the XP-bar
    line ("Experience — 11 years in tech · levelling since 2015") carries
    the meaning on its own. Background = **"Software Engineering"** (round 2;
    replaced "Tester → Senior Engineer"). Home Region; Alignment.
    NO multiclassing field — the narrative-design journey hasn't begun;
    surface that ambition in the dialogue trees instead.
  - Ability rail: six framed scores with modifiers (People / Tech / Product /
    Delivery / Narrative / Strategy). Kept; wording tweaks are Caveshen's.
  - Spellbook — Tech Stack (round 2, simplified to his real stack from the
    approved CV, docs/cv.html — facts, not invented): drop the casting-stat
    trio header (noise); three tiers with slot pips —
    Cantrips (at will): .NET / C#, SQL, JavaScript, Git;
    Level 1: VueJS, React, Angular, GraphQL, Spring;
    Level 2: Azure, AWS, Power BI. His list to tune further.
  - Layout (round 2): the three columns must bottom-align at desktop width —
    distribute vertical space in the ability rail and middle column so their
    bottom edges meet the right column's (no ragged column ends).
  - Skills panel with proficiency dots (expertise/proficient/learning).
    Kept for now — Caveshen undecided, still under workshop.
  - Backstory — Quest Log (roles: Derivco CPT EM ← Entelect ← Derivco Durban)
    and Features & Traits (degree, certs, training). Both locked keep.
  - The Quartet (Traits / Ideals / Bonds / Flaws): keep — Caveshen writes it.
  - CUT from the shipped page (still prototyping in mocks): the vitals row
    (AC / Initiative / Speed) — he finds it out of place; it stays on the
    workshop list, not on the site.
  - Panel convention: bordered cards, small-caps mono caption BELOW the panel
    (the 5E signature), proficiency dots, framed ability scores.
  - Unchanged invariants: **"Download Character Sheet"** button → `/cv.pdf`;
    "Back to the interview" link → `/` (plain anchor, no JS); contact =
    LinkedIn + GitHub links only, no email (spam caution); fully static.
  - **As accepted (rounds 1–7, 2026-07-18/19):** ink-wash `--panel-grad`
    (plum sinking to black at the panel base); night goes AMOLED blue/black,
    day a cool coastal blue; both themes purple-free (`/` matches too, per
    §25); the Quartet is CUT from the page (resurrect from git `0f8ec09` if
    wanted back); height alignment scoped to the middle column only (its
    last panel grows to meet the right column's natural bottom); the
    round-3 spacing scale (panel padding, grid/list gaps, prose line-height)
    stands.
    - GATES RESOLVED 2026-07-19: **EM start = May 2025.** Convention set
      by Caveshen: each Backstory entry shows the HIGHEST role achieved in
      that tenure — so the sheet's Derivco Cape Town entry stays
      "Engineering Manager, June 2024 – Present" (no SDET line, no sheet
      change). The CV (cv.html/cv.pdf) DOES split it: EM May 2025–Present
      plus its own "Senior Software Development Engineer in Test, Level 1,
      June 2024 – May 2025" entry (wording adapted from his authored
      LinkedIn text; his review before push). **Second degree: excluded
      everywhere** — the 2008–2011 BSc CompSci was discontinued; only the
      2014 BCom appears (already the case; no change).
  - Workshop list (open): ability-rail wording (his); vitals-row rework; his
    copy for quartet/alignment/flavour lines. Round-2 verdicts: skills panel
    LIKED; spellbook liked, simplified.
- `404` — one flavour line + link home (nice-to-have).

## 5. Dialogue tree (content model)

JSON, authored/edited directly by Caveshen (proven shape from the samples):

```json
{
  "root": {
    "stage": "optional italic scene direction",
    "speech": "the spoken line",
    "options": [
      { "label": "Tell me about your experience.", "to": "experience" },
      { "label": "Skip the chat — open the character sheet", "to": "/sheet", "kind": "system" }
    ]
  }
}
```

- `to` is a node id, or a path (navigation) when it starts with `/`.
- Restart-to-start is an authoring convention, not code: any option with
  `"to": "root"` returns to the opening node (kept in-fiction, typically as a
  `"kind": "system"` option).
- Scale: the engine walks an arbitrary graph — 20+ nodes, branches, loops all
  fine with zero code changes. JSON is bundled at build time; the graph tests
  (§13) validate every `to` target on each run. Soft UI ceiling: ~5–6 options
  per node before the card gets tall on mobile.
- v1 is a plain stateless tree. Unlockable topics / visited flags are v2.
- Engine: vanilla JS island (~60 lines as built, `src/scripts/dialogue.js`).
  No framework needed for text swap + buttons; revisit only if v2 state demands it.

## 6. Tech

- **Astro**, static output. Dialogue engine as the only scripted island.
- Dialogue JSON in `src/data/`; design tokens as CSS custom properties.
- Theme: night default; toggle persists via `localStorage`; day/night scene
  swap driven by `data-time` attribute + token overrides (as in Sample C).
- Hosting: GitHub repo under Caveshen's profile → GitHub Pages via the
  official Astro deploy action. Later (out of scope now): purchased domain +
  **personal** Cloudflare account (not the DWL one).
- No CMS, no analytics, no cookies in v1.

## 7. Assets

- `public/cv.pdf` — ATS-friendly, professional, PII-stripped CV derived from
  `CV-CaveshenRajman-2025-v2.pdf`. Claude drafts; Caveshen approves.
  PII (resolved 2026-07-14): phone **and email stripped**; location stays generic
  ("Cape Town, South Africa"); contact lines = LinkedIn URL + site URL.
  ✅ Approved & shipped 2026-07-16 (a55db94): source `docs/cv.html`, rendered
  via `node docs/render-cv.js` (headless Edge print-to-PDF); PII verified on
  the text layer with pdftotext before commit.
- Scene + avatar SVGs (from Sample C, refined). Real avatar art optional, later.
- Favicons/OG image derived from the night scene. ✅ P3 (2026-07-17):
  `public/favicon.svg` (moon mark), `apple-touch-icon.png` (180×180) and
  `og-image.png` (1200×630) rendered from an inline night-scene SVG via
  `docs/render-og.js`. Re-run that script if the scene changes materially.
  - Re-rendered off the real built site since §30 D-2 (2026-07-26); no longer
    drifts.

## 8. Success criteria (verifiable)

1. With JavaScript disabled, a visitor can reach and read the complete CV
   content (`/sheet` is fully static; `/` carries a working no-JS path to it).
2. Entire dialogue playable by keyboard alone; focus visible throughout.
3. `prefers-reduced-motion`: no blink, crossfade, or translate animations.
4. Recruiter path: landing → character sheet ≤ 2 clicks; → PDF ≤ 3 clicks.
5. Theme: night by default, toggle swaps full scene correctly, choice persists
   across reloads.
6. Lighthouse ≥ 95 accessibility and performance on `/` and `/sheet`.
7. CI check greps for `PLACEHOLDER`; the build warns until all copy is
   Caveshen's.
8. Push to `main` → GitHub Action builds and deploys to GitHub Pages.
9. Full test suite (§13, unit + integration) runs in CI on every push and
   **blocks the deploy on failure**.

## 9. Build phases (worker tasks; reviewer pass before each commit)

TDD applies from P1 onward: each phase begins with failing tests for its
scope (§13) and ends with them green. Test scaffolding (Vitest + Playwright
config, device matrix) lands with P1.

- **P0 — Scaffold: ✅ 2026-07-15.** Astro project, tokens, base layout, deploy
  action. ("Deploys to Pages" deferred with the push decision — the workflow
  exists and is CI-gated, unexercised until the remote is created.)
  **That parenthetical is long obsolete** (corrected 2026-07-25): the remote
  exists, `main` is live at https://caveshen.github.io, and the test-gated
  deploy workflow has run green on every push to `main` — last on 2026-07-20.
  **Success criterion 8 is verified in production.** What has *not* happened is
  a `main` deploy carrying any of the P5 work; `main` still serves the
  pre-landing-v2 site, unmerged and not deployed. So the workflow is proven;
  the cutover is a content change, not a first flight.
- **P1 — The Interview: ✅ 2026-07-16 (4ab79eb; stretch 8c7e5c6).** Scene SVG
  (night+day), dialogue card, JSON-driven engine island, theme toggle with
  persistence, aspect-ratio compositions. Criteria 2, 3, 5.
- **P2 — Character Sheet: ✅ 2026-07-16 (36d80c8; back link e8f524d).**
  `/sheet` static page, `cv.pdf` asset, download + contact links. Criteria 1, 4.
- **P3 — Polish: ✅ 2026-07-17.** 404 page, meta/OG + Twitter tags (per-page
  descriptions), night-scene favicon plus rendered apple-touch-icon & OG PNGs
  (`docs/render-og.js`, same headless-Edge pipeline as the CV), warn-only
  PLACEHOLDER CI check (`docs/placeholder-check.js`), and the §12 hygiene files
  (robots.txt, llms.txt, `@astrojs/sitemap`). Lighthouse **100/100/100/100** on
  `/` and `/sheet`. En route it caught a real WCAG AA failure — the `--dim`
  token in both themes — now fixed and guarded by contrast assertions.
  Criteria 6, 7 met. (Worker→reviewer loop; reviewer trimmed an unused
  `lighthouse` dep and a placeholder-scanner blind spot before commit.)

- **P4 — Landing v2: the approach (item/landing-v2-avatar).** Accepted for
  build 2026-07-21. The page opens on the scene with a hooded figure standing
  in it; the conversation starts only when the visitor approaches. Placeholder
  figure per the converged mock (§14, 2026-07-21) — no real character art.

  **Rulings taken 2026-07-21 (Caveshen):**
  - *No scene art change.* The locked Sample C composition is untouched. The
    figure is a nearer-to-camera foreground silhouette **cropped by the frame's
    bottom edge**, standing on the picture plane; the sea strip reads as
    distant water behind them. (The alternative — adding a promenade band and
    railing to give them ground — was declined.)
  - *Diegetic interaction prompt, not a hitbox.* Rather than a pixel-accurate
    click target on the SVG (awkward for keyboard; WebKit's focus behaviour
    already bit us on the test matrix), a real HTML `<button>` styled as a
    **videogame NPC interaction prompt** sits near the figure and starts the
    dialogue. Keyboard-native by construction, and more videogame besides.

  **Shape:**
  - `HoodedFigure.astro` — the figure authored **once**, rendered into all
    three scene SVGs (standard / wide / tall) at variant-appropriate
    transforms. Living inside the artwork's coordinate space gives exact
    alignment under `meet` letterboxing for free. Fills are literal and
    theme-independent; classes, not IDs, so three copies can coexist.
  - Camera: `.stage-frame` (overflow hidden) wrapping `.camera`, which takes
    `transform: translate() scale()` computed in JS from the *visible* figure's
    measured rect (head-and-shoulders framing), expo-out
    `cubic-bezier(0.16, 1, 0.3, 1)`. Compositor-only, per research #1.
  - Dialogue card hidden until approach — **by a class JS adds on init**, never
    by default CSS, so the no-JS path keeps working exactly as today.
  - Three exits: an on-screen "End dialogue" control, Escape, and any dialogue
    option Caveshen later writes back out. No new dialogue nodes invented here.

  **Success criteria (verifiable):**

  Criteria 1–8, 10–12 met and covered by the suite (see git for the list).

  9. All 47 unit tests and all existing e2e tests still pass. **Amended
     2026-07-21** — the original wording ("unmodified") was wrong and the
     worker correctly escalated rather than quietly editing around it: five
     tests in `e2e/interview.spec.js` encode the *old* contract, that the
     dialogue is already underway on load (`choice buttons are next in tab
     order after toggle`; `full keyboard dialogue playthrough`; `dialogue
     content updates immediately under reduced-motion`; and the two portrait
     `card below scene` bounding-box tests). That is precisely what P4
     overturns. Caveshen ruled: **re-point those five at the new journey** —
     each first approaches the figure, then asserts exactly what it asserted
     before. Assertions may be *extended* with the approach step; none may be
     weakened, deleted, or have its expectation relaxed. Every other test
     stays untouched.

  **Non-goals:** real character art; any change to the locked scene
  composition; new dialogue nodes (Caveshen's copy); sound.

  **P4 shipped**, and then kept going. Everything from §17 onward happened on
  this same branch *after* P4's own criteria were met, item by item, rather
  than as a new numbered phase — which is why the phase list appeared to stop
  here. Two of P4's non-goals were subsequently and deliberately overturned by
  Caveshen: real character art (§27's Badger) and changes to the locked scene
  composition (§20, §25, §26). Recorded so the overturn is visible rather than
  looking like drift.

- **P5 — Landing v2 continued (`item/landing-v2-avatar`), 2026-07-22 → 07-24.**
  Not planned as a phase; assembled from items §17–§29 as Caveshen raised and
  ruled on them. Roll-up of what shipped, each worker→reviewer→commit:
  §15 D1/D2/D4 fixes · §17.1 → §17.1a → §17.2 full-window stage · §18
  fullscreen button · §19 background/foreground refactor (seams only) · §20
  wider world (industrial district + waves) · §21 zoom easing split · §24
  banner plane · §25 blue-black palette · §26 Devil's Peak + softened Lion's
  Head · §27 Badger + TEST-ONLY toggle · §28 dialogue fade-in.
  Unmerged. **Nothing is on `main`.**

Parallel, non-worker: ~~Claude drafts the ATS CV~~ (✅ approved & rendered
2026-07-16 — see §7); Caveshen writes the real dialogue script and sheet copy.

## 10. Out of scope (deferred, recorded so they don't creep back in silently)

- "Recruit" CTA / contact form (site is static — needs a form service or a small
  Worker; workshop later with spam resistance, e.g. Turnstile). Until then,
  contact = LinkedIn.
- Unlockable dialogue topics / visited-state flags.
- Additional scenes ("The Study" point-and-click room), sound, commissioned art.
- Custom domain + Cloudflare setup.

## 11. Open questions — RESOLVED 2026-07-14

1. Repo: **`caveshen.github.io`** (root-path Pages), working copy at
   `E:\Dev\caveshen.github.io`.
2. PDF PII: phone **and email** stripped; generic location kept; contact =
   LinkedIn URL + site URL.
3. Dialogue authoring: **direct JSON**. No compiler unless writing volume
   demands it.

## 12. Site & repo hygiene (added 2026-07-14)

- **README.md** — P0, stub linking to this PRD.
- **CONTRIBUTING.md** — deliberately skipped: solo personal site, nobody
  contributes. Add only if that ever changes.
- **LICENSE** — none by default = all rights reserved, which is correct for a
  personal portfolio (his words, his art). Revisit only if code is meant to be
  reusable by others.
- **robots.txt** (`public/robots.txt`) — allow crawling by default (scraping
  the *content* is welcome); points at the sitemap. Optionally disallow
  known-noisy scrapers if spam becomes real rather than hypothetical.
- **llms.txt** (`public/llms.txt`) — curated plain-text summary of who
  Caveshen is and what the site contains, so AI crawlers ingest the intended
  story rather than reverse-engineering it. Copy owned by Caveshen.
- **sitemap.xml** — `@astrojs/sitemap` integration. ✅ P3: generates
  `sitemap-index.xml` + `sitemap-0.xml` (`/` and `/sheet` only; 404 filtered
  out); `site` = `https://caveshen.github.io`. robots.txt + llms.txt shipped
  alongside (llms.txt body is PLACEHOLDER — Caveshen's copy).
- **Honesty note (see also §13 CI):** the repo must be public *for now* — free GitHub Pages
  requires it — so the implementation is visible by design; robots.txt cannot
  hide source code. At the domain + Cloudflare cutover, the repo **can** go
  private (Cloudflare Pages builds from private repos on the free tier) if
  Caveshen chooses. Until then the mitigation is discipline: no secrets, no
  PII, no draft copy beyond marked placeholders ever committed. Anything
  sensitive lives outside the repo.

## 13. Testing strategy (TDD — added 2026-07-14)

Written test-first per phase; the whole suite becomes the CI gate (criterion 9)
and later ports unchanged to the Cloudflare pipeline.

**Unit tests (Vitest)** — positive *and* negative cases throughout:
- *Solitary* (pure logic, no DOM/collaborators): dialogue-engine node
  resolution (valid id → node; unknown id → explicit error), option `to`
  handling (node id vs `/path` navigation), theme state logic (stored "day" →
  day; anything else → night default).
- *Social* (modules together, DOM via happy-dom/jsdom): engine + real JSON
  data renders root; clicking an option swaps speech and options; system
  options carry their class; `aria-live` region updated.

**Dialogue-tree flow tests** (data-level, run against the real JSON):
- Schema valid (every node has `speech` and ≥1 option; option fields well-formed).
- Graph checks: every `to` target resolves (node or path); every node
  reachable from `root`; no dead ends (a node with no way back or out); the
  character-sheet escape option present on `root`.

**Theme validation:**
- Token parity: every `:root` custom property has a `data-time="day"`
  override or is on an explicit shared-tokens allowlist.
- Contrast: text/option colours vs their grounds meet WCAG AA in both themes
  (computed check, not eyeball).
- `--theme-transition` resolves to `none` under `prefers-reduced-motion`.

**Integration tests (Playwright):**
- Device matrix via Playwright descriptors — mobile: iPhone SE (small),
  iPhone 15 Pro, Pixel 8, iPad; desktop: 1366×768, 1920×1080, 2560×1440.
- Touch/gesture: tap on dialogue options and theme toggle in mobile emulation
  (touch enabled); scroll behaviour on small viewports; no horizontal overflow
  at any matrix size.
- Keyboard-only full dialogue playthrough with visible focus assertions.
- Theme: night by default, toggle swaps scene (night-only/day-only elements),
  choice persists across reload; `prefers-color-scheme` does not override the
  stored choice.
- Reduced-motion emulation: no blink/crossfade animations running.
- JS-disabled context: `/sheet` fully readable; `/` offers a working no-JS
  path to it.
- Recruiter path: landing → sheet ≤ 2 clicks; → PDF link ≤ 3.

**CI wiring:** test job added to the deploy workflow ahead of the build job
(`needs:` chain) — any failure fails the push and blocks deploy. Playwright
browsers cached. Simple pass/fail for now; richer reporting only if ever needed.

**As-built amendments (2026-07-16):**
- The four mobile/tablet matrix entries run **emulated Chromium** (viewport,
  touch, UA), not real WebKit — device descriptors are pinned to
  `browserName: 'chromium'` so the local Edge channel works. Known ceiling,
  noted in `playwright.config.js`; real WebKit coverage is a future upgrade.
  **Upgrade accepted 2026-07-19 (item/webkit-matrix):** unpin the Apple
  device descriptors (iPhone SE, iPhone 15 Pro, iPad) to real Playwright
  WebKit; Pixel 8 stays Chromium (faithful to Android). WebKit installs
  via `npx playwright install` locally and `--with-deps` in CI. Desktop
  projects stay on the msedge channel locally / chromium in CI.
- Playwright `webServer` uses **build + preview in every environment** with
  `reuseExistingServer: false`: Astro 7's `dev` daemonizes when spawned
  without a TTY (Playwright reads the parent exit as failure), and reuse once
  silently served a stale build to the suite. Consequence: port 4321 must be
  free when the e2e suite runs — an inspection preview and a test run cannot
  share it. Unit tests (Vitest) need no server at all.
- Suite size as of e8f524d: 31 unit, 287 e2e (41 tests × 7 projects).
- Suite size as of P3 (2026-07-17): **47 unit, 427 e2e** (61 tests × 7 projects).
- P3 added a night-scene favicon/OG render pipeline (`docs/render-og.js`), a
  warn-only PLACEHOLDER scanner (`docs/placeholder-check.js`, skips
  `node_modules`/`dist`/`.git`/`tests` so it goes quiet once all real copy
  lands), and `@astrojs/sitemap`. The dialogue tree also gained a worked
  two-level branching example under `games` (commit 8cebfc4, still all
  PLACEHOLDER) so the authoring shape is visible.
- Suite size as of character-sheet workshop rounds 3–7 and subsequent fixes
  (2026-07-18/19): **47 unit, 525 e2e** (75 tests × 7 projects). Three
  tests are conditionally skipped on real WebKit (one per Apple project):
  `back link and download link both reachable by keyboard on /sheet` —
  WebKit (Safari) does not Tab-focus `<a>` elements by default; this is a
  documented platform behaviour, not a site defect; skip is guarded by a
  `test.skip(browserName === 'webkit', …)` with an explanatory comment.
  item/webkit-matrix verified 2026-07-19: all 3 Apple projects running real
  WebKit, suite 522 passed / 3 skipped / 0 failed; no product bugs found.
- Suite size as of the tri-engine merges (2026-07-19, items webkit-matrix +
  firefox-desktop): **47 unit, 600 e2e** (75 tests × 8 projects). Engines:
  Chromium (three desktops + Pixel 8), real WebKit (iPhone SE, iPhone 15 Pro,
  iPad), Firefox (one desktop project — Playwright's Firefox cannot emulate
  mobile). Firefox needed no engine-conditionals; the only skips remain the
  three WebKit keyboard guards above. CI installs all three engines
  (`--with-deps chromium webkit firefox`); deploys now run ~5 minutes.
  Known infrastructure flake (pre-existing, unfixed by choice): back-to-back
  local e2e runs can race on the port-4321 handover between preview servers —
  re-run rather than patch.
- **Suite size as of 2026-07-25** (`item/landing-v2-avatar`, 34 commits ahead
  of `main`): **60 unit, 1272 e2e** (159 test bodies × 8 projects). Unit run
  verified green at this count; the intermediate figures quoted in §20
  (56/1013) and in §9 P4 criterion 9 (47) are earlier snapshots, left in place
  as dated records. **Do not treat any number in this document as current —
  count it.** See `e2e/` for the current file list. Note that `badger.spec.js`
  (7 tests) covers the `INTERIM-TOGGLE` scaffold, which now ships (see d8) —
  **d17 deletes that scaffold and moves this count**; recount when it lands.
- **Suite size as of 2026-07-27** (§30 D-4, the interactive 404): **65 unit,
  1369 e2e** (7 skipped, 0 failed) — tri-engine. Supersedes the 2026-07-25
  figures above.
- **Badger-count recount 2026-08-01** (asked for by the d17 draft, done against
  the files at `2157118`, not inferred): `e2e/badger.spec.js` holds **7 test
  bodies** — the 2026-07-25 figure above is still correct, not stale. d17 takes
  that file to **5** (two toggle tests deleted, two inverted, three keep their
  assertions minus the toggle click) and *adds* bodies to `e2e/not-found.spec.js`
  (per-route character presence, the migrated theme-independence assertion, the
  `/404` bg/fg seam, and the card-occlusion test ruled in 2026-08-01). The net is
  **not predictable from this note — count it when d17 lands** and write the new
  totals here as a dated line. 65/1369 remains the last *measured* pair and stays
  the baseline until then.
- **Suite size as of d12 (2026-08-01, `e96ecc8`): 65 unit, 1400 e2e** — 1393
  passed, 7 skipped, 0 failed, tri-engine across 8 projects, **zero files under
  `e2e/` modified** (that was d12's pure-refactor proof). Supersedes 65/1369.
- **d17's first pass (2026-08-01, `92546f8`, WIP): 65 unit, 1401 passed / 7
  skipped / 8 failed** — the 8 being one card-occlusion test across all 8
  projects. **Not a valid line to carry forward**: the pass was ruled against
  and is being reworked. d17's second amendment moves the counts again (the
  `/404` approach tests are new, and one assertion is superseded by ruling) —
  **recount and record a fresh dated line when the rework lands.**
  The +31 over 1369 is **pre-existing suite growth unrelated to d12** — the
  refactor added no tests and edited none. Fresh evidence for the rule above:
  **do not treat any number in this document as current — count it.**
- **Suite size as of d25 (2026-08-02, `1254dad`): 65 unit, 1400 e2e** — 1393
  passed, 7 skipped, 0 failed, tri-engine across 8 projects, **zero files under
  `e2e/` modified**. Identical to the d12 line by design: d25 was a pure
  refactor, so an unmoved count *is* the proof. Supersedes nothing — it
  re-confirms 65/1400. d17's rework still moves both numbers; **recount then.**
- **Suite size as of d17 (2026-08-02, `26a6ddb`): 65 unit, 1520 e2e** — 1513
  passed, 7 skipped, 0 failed, tri-engine across 8 projects. The +88 over d25 is
  11 new or route-duplicated test bodies × 8 projects: `/404` gained the approach
  behaviours, and `approach.spec.js` now runs its parity assertions over both
  routes. Supersedes 65/1400.
- **No snapshot baselines exist in the repo** — verified 2026-07-25, no
  `*-snapshots/` directory anywhere. The throwaway baselines used to prove
  §19's refactor was pixel-identical were deleted after use, as intended.
  §16's "no artefact that grows with test coverage" constraint still holds.

## 14. Amendments log

- **2026-07-21 — RESTAGED SCENE ACCEPTED (mock approved, ready to port).**
  Caveshen accepted the restage after four workshop rounds. This entry is the
  specification the port implements. Reference mock (NOT in the repo, and it
  should not be committed — it is a workshop vehicle, as Sample C and the
  character sheet were):
  - Published: `https://claude.ai/code/artifact/a564f7f9-3d59-4f78-97a1-a55bdf42545e`
    — readable with WebFetch from any session.
  - Editable source, if it survives on disk:
    `C:\Users\Cavie\AppData\Local\Temp\claude\C--Users-Cavie\b2e294ca-13ea-483d-a0ca-da9ab5379b2f\scratchpad\scene-restage-mock.html`
    (scratchpads are per-session but have persisted across sessions before —
    the earlier avatar mock was still readable days later). **If that path is
    gone, fetch the published artifact rather than redesigning from scratch.**
    The figure's own markup also lives in `src/components/HoodedFigure.astro`,
    which is committed and is the safer source for the character itself.

  **Architecture — ONE WORLD, THREE CAMERAS (his ruling, and it fixed a real
  bug).** The three shipped aspects were not merely framed differently: they
  were three separately hand-drawn Table Mountains, carrying three different
  vertical stretches (1.35 / 1.4 / 1.25). The mountain was changing *shape*
  between viewports. His instruction — "resize for the camera/perspective, but
  not resize the background itself… a mountain does not shift when we change
  our aspect ratio" — is now the rule:
  - The landforms, city bowl and lit windows are authored **once**, at one set
    of coordinates, baseline `y=352` (the shipped scene's own baseline).
  - Each aspect applies **pan and uniform scale only. Never a stretch.**
    Standard is the base:

    | View | Camera transform |
    |---|---|
    | Standard (1200×750) | `translate(0,128)` |
    | Wide 21:9 (1750×750) | `translate(280,128)` |
    | Tall / mobile (600×1067) | `translate(-20,262) scale(0.62)` |

  - Verification for the port: Table Mountain's bounding-box width÷height must
    measure **2.4194 in all three views**. This is a testable invariant — assert
    it rather than eyeballing it.
  - **Foreground may differ per view** (his words): sea, promenade, railing and
    the figure's placement/scale are per-aspect. Standard and Wide share a
    camera height, so they share foreground y-values and figure scale (1.2);
    Tall steps back (figure 1.3, deeper water).

  **Art changes ruled:**
  - Lion's Head moved **65 left** (gap to Table Mountain 120 → 55); Signal Hill
    follows **40 left** so the chain stays linked.
  - The city **breathes left**, five shorter/sparser buildings wrapping around
    Table Mountain's foot — reads as the bowl curving around the massif.
  - Sky elements (moon, sun, stars, clouds) stay **per-aspect** — locked to the
    land they pan off-frame in portrait — but the **moon's radius is locked** in
    every view (it was 54 in portrait, i.e. it was changing size). **The lock
    holds; the value moved 46 → 47.5 on 2026-08-01** — five percent under the
    sun's 50, ruled in d12. Still one radius everywhere.
  - Moon is **pale and cratered** (`--moon:#e7e3cf`, `--crater:#cbc6ae`), and
    the sea glints pale with it. The **sun stays warm gold** — a pale sun is
    wrong and the day sky reads better against it.
  - Railing rebuilt as a **standing parapet** (top rail, mid rail, posts
    crossing the waterline), semi-foreground: in front of the water, behind the
    figure. The earlier flat version "looked like road linings".
  - **The figure has arms.** Sleeve panels on each flank plus armhole seams —
    the seam is what makes an arm read as an arm — and ribbed cuffs angling
    inward. Drawn **before** the pocket in paint order so the pocket overlaps
    the cuffs and the hands read as tucked in. (The approved figure had none:
    it survived four workshop rounds, a full build and a reviewer pass without
    anyone noticing.)

  **Ambient life (all of it stops under `prefers-reduced-motion`):**
  - **Window glimmer, night only.** Each lit window keeps the base opacity the
    artwork gave it, held in `--o`; the animation only ever dips *below* it
    (to ~45%), on its own duration (4.5–11s) and a negative delay so nothing
    pulses in unison. In the port Astro emits `--o`/`--t`/`--d` inline, so this
    stays **CSS-only with no JavaScript** — it must work with JS disabled.
  - **Motes on the breeze**, deliberately placed **outside the camera group**
    so the wind keeps a constant speed when the camera pushes in.
  - Drawstring sway, unchanged.

  **Layout:** the stage fills the frame and the **dialogue card is an in-scene
  overlay** (RPG dialogue box), not a block below the scene. This is what kills
  the "page collapses below the fold" defect from the first P4 attempt.

  **§3 AMENDED.** §3's skyline direction requires every landform to close
  inside the artwork with "no viewBox-edge cliffs". That rule was written when
  each aspect was hand-composed and **cannot hold under a locked world**: a
  3.2:1 world does not fit a 9:16 frame without either cropping or shrinking
  the mountain to a smudge. Caveshen ruled **crop**, sacrificing **Signal Hill**
  (the low soft one) at the portrait right edge. The rule still stands for
  Standard and Wide.

- **2026-07-21 — SCENE RESTAGE RULED (supersedes the P4 staging).** The first
  P4 build put the figure into the shipped Sample C composition and it did not
  work: the figure read as "a postbox on stilts" standing on the sea, and with
  the card hidden the page collapsed into empty background. Caveshen's
  diagnosis, and it is the right one: Sample C was composed as a **letterbox
  strip you look at, with a card underneath** (`clamp(220px, 38vh, 380px)`),
  whereas the workshopped mock was composed as **a place you stand in**. A
  character who walks up and talks to you needs the second. Grafting a person
  into a 3:1 vista strip was never going to hold.

  **Ruling — Sample C's *content*, the mock's *staging*:**
  - Cape Town **survives**. The trio (Table Mountain, Lion's Head, Signal Hill)
    and the city bowl carry over, as do the palette and the time-of-day toggle.
    The alternative — adopting the mock's backdrop wholesale — was rejected:
    that backdrop was a twenty-minute throwaway stand-in with no landforms, and
    taking it literally would have deleted Cape Town from the portfolio.
  - Restaged into the mock's format: a **full-height stage** rather than a
    strip, a **foreground ground plane** for the figure to stand on, figure at
    human scale, camera zoom. This **reverses the "no scene art change" ruling**
    taken earlier the same day — the promenade band Caveshen declined becomes
    the natural answer once the composition is open for renovation.
  - **All three aspect variants stay**: standard (most users), wide 21:9, tall
    portrait (mobile). Each gets restaged; none is collapsed or deleted.
  - The current Sample C strip composition goes on the **backburner, not the
    bin** — Caveshen expects it back "with a vengeance" for a different scene
    serving a different purpose elsewhere on the site. Do not delete it.

  **Process:** workshop the restaged scene as a throwaway artifact mock FIRST,
  as Sample C and the character sheet both were, then port on approval. The
  interaction layer already built (`da579cd` — figure component, camera maths,
  approach/exit wiring, tests) is composition-agnostic and carries forward
  unchanged; only the backdrop and page layout are in scope.

- **2026-07-21 — LANDING v2 ACCEPTED FOR BUILD (P4, item/landing-v2-avatar).**
  Caveshen gave the go to build the workshopped mock for real. Full item spec,
  rulings and success criteria in §9 (P4). Two decisions taken today: the
  locked scene art is **not** touched (figure cropped at the frame's bottom
  edge rather than gaining a promenade to stand on), and the interaction is a
  **videogame-style NPC prompt button** near the figure rather than a hitbox on
  the SVG — his suggestion, and better than either option offered: it is
  keyboard-native, engine-safe, and reads as a game affordance. Also noted
  while reading the code: the real page is *three* art-directed scene SVGs, not
  the mock's single stage, so the figure is authored once as an Astro component
  and rendered into each.

- **2026-07-21 — LANDING v2 PLACEHOLDER: MOCK CONVERGED (agreed look, still
  mock-only).** After several workshop rounds on the artifact mock, the
  placeholder avatar and its interaction are settled — ready to become a real
  build item whenever Caveshen gives the go (nothing in the repo yet). Agreed:
  - **Figure:** hooded modern hoodie (hip-length, ribbed hem/cuffs, hands in
    the kangaroo pocket, jeans), a proper cowl with the head recessed inside
    and the **face an empty shadow void** — Caveshen ruled **Empty** over a
    Rembrandt-lit "shadowed face" alternative we prototyped (the drawn-feature
    "hint" was rejected as too joke-y). Theme-independent colours (slate hoodie,
    dark outline for day-sky AA, warm city-glow rim light); the character never
    changes with the toggle.
  - **Interaction:** click the figure → CSS `transform` cutscene zoom
    (JS-computed head-and-shoulders framing, expo-out ease) → dialogue card;
    exits via an on-screen "End dialogue" control + an "End the conversation"
    option + Escape; reduced-motion jump-cuts. Light ambient wind (drawstring
    flutter + drifting motes).
  - **Moon:** pale/cratered (not the warm disc, which read as a night sun).
  - Reference mock (not in repo): artifact c94fe4ea-7e97-4fac-8403-e8469df78f9e.
    The scene backdrop there is a quick stand-in, NOT the real Sample C
    composition. Next: turn this into a branched build item on Caveshen's go.

- **2026-07-19 (evening) — LANDING v2: HOODED PLACEHOLDER AVATAR (direction
  set; mock in progress).** Research (`docs/research-avatar-scene.md`, commit
  a0cbd07) confirmed the avatar art is the critical-path blocker. To unblock
  the *interaction* build (click → zoom → dialogue, theme isolation,
  reduced-motion, keyboard, Playwright coverage) without waiting on final
  character art, Caveshen chose a **faceless placeholder** — treated as a
  genuine design candidate, not mere scaffolding (it may well become
  permanent). Register RULED: **modern hoodie** — a contemporary
  developer-at-night figure lit by the city glow, hood up, face in shadow
  (grounds the character in Caveshen himself; no face to draw = ~1h of path
  work vs 4–16h). Rejected alternatives: adventurer's cloak (too fantasy),
  neutral graphic hood (says too little). Technical approach follows research
  #1: the avatar is its own flat-vector SVG layered over the scene (theme
  isolation free), zoom via CSS `transform: scale()` (compositor-only) with
  expo-out easing, reduced-motion = jump cut, and a dark outline stroke so
  the hood survives the day sky (WCAG AA). **Immediate step (authorised):**
  a standalone **artifact mock** (not committed to the repo — same vehicle as
  the Sample C and D&D-sheet workshops) showing the hooded figure at scene
  scale + close-up scale, in both day and night lighting, to judge the look
  and how "faceless" holds up under the camera push. No PRD build item and no
  repo code until the mock is workshopped and the look is accepted.

- **2026-07-19 (evening) — LANDING PAGE v2 AMBITION (Caveshen's direction,
  research first).** The current `/` opens as if the dialogue is already
  underway. The new ambition: the page opens on a **scene containing a
  human-like avatar** the visitor can interact with — clicking the avatar
  **zooms the camera into them, Elder Scrolls Oblivion cutscene style**, and
  only then do the dialogue options appear. Constraints, his words:
  - The avatar **survives the light/dark toggle unchanged** — the toggle
    remains time-of-day and *lighting* (scene mood), never the character.
  - Styled graphically **like a scene in a videogame**.
  - **No generated assets** — vectors and other programmatic methods only
    (in keeping with the existing hand-built SVG scene work).
  This is NOT accepted for build yet. Next step, explicitly authorised:
  **research** what modern browsers can do graphically under these
  constraints (SVG/CSS/canvas/WebGL animation, camera-zoom techniques,
  programmatic character rendering), findings to land in the repo for
  workshopping. Design and build follow only after the research is
  reviewed and the approach is accepted item-by-item.

- **2026-07-19 (afternoon) — QUEUE ITEMS 1–3 SHIPPED.** All three technical
  items from the evening-close queue landed today, each through the full
  branch → worker → reviewer → Caveshen's merge approval loop:
  1. **item/webkit-matrix** merged (`0927fa4`) — Apple devices on real
     WebKit, deploy green.
  2. **item/cv-rollup** merged (`6850a6c`) — single Derivco entry with the
     promotion bullet; live cv.pdf verified serving the new render.
  3. **item/firefox-desktop** merged (`25ca087`) — picked up same-day on
     Caveshen's go (he tests in Firefox himself); tri-engine matrix,
     deploy green.
  The queue now holds only the human items: Caveshen's copy (in progress,
  his side) and his interview play-through feedback, plus the parked
  vitals-row and Quartet ideas. Merged `item/*` branches retained locally
  for archaeology.

- **2026-07-19 (morning) — TRI-ENGINE RULING.** WebKit proceeds for the three
  Apple device projects; Firefox deferred as its own later item
  (`item/firefox-desktop`), picked up after WebKit merges.

- **2026-07-19 — CV ROLLUP RULING (item/cv-rollup).** Caveshen ruled: the
  two split Derivco Cape Town entries (EM May 2025–Present + Senior SDET L1
  June 2024–May 2025) roll up into one, matching the document's highest-
  role-per-tenure convention already used throughout the CV. Heading becomes
  "Software Engineering Manager"; tenure spans the full June 2024–Present;
  first bullet records the progression ("Joined as Senior SDET (Level 1);
  promoted to Engineering Manager in May 2025"); the EM body text and bullets
  are kept verbatim; the SDET body is dropped entirely — same pattern as the
  Derivco Durban entry (Production Tester detail absent, Technical Lead
  content kept). The character sheet already follows the same convention and
  is unchanged.

- **2026-07-19 (evening close) — WORK QUEUE.** Session ended deliberately;
  pick these up in order of appetite, one at a time, branch-per-item:
  1. **Caveshen's copy — IN PROGRESS (his side).** Dialogue JSON, sheet
     copy, llms.txt, meta descriptions, 404 line. Claude nags gently.
  2. **Interview page feedback — his play-through impressions** open the
     main-page workshop; items branch as accepted.
  3. Parked as before: vitals-row rework; the Quartet (backburner).
  Node-version action bumps are DONE (73f8b5f, CI green).

- **2026-07-19 (later):** Character sheet PARKED in its accepted state after
  workshop rounds 1–7 (D&D anatomy, AMOLED blue/black night + sky/parchment
  day, purple-free both themes, quartet cut, columns aligned). Remaining
  sheet work is content only: Caveshen's copy (alignment, flavour lines,
  spell/skill tuning) + the parked vitals-row idea. Focus returns to `/`
  (the Interview) — his notes incoming. Push conversation opened and RULED
  (2026-07-19): auth via his `gh_pat` env var (classic PAT, repo+workflow —
  no gh login needed; account is CaV1E). His decisions: **rename CaV1E →
  caveshen** in GitHub settings (his action; keeps repos/PAT, unclaimed name
  verified free), then Claude creates `caveshen.github.io`, pushes, and
  **enables Pages — live immediately with PLACEHOLDER copy**, iterating in
  public. Never print the PAT; map it per-command (`GH_TOKEN="$gh_pat"`).
- **2026-07-19 — LAUNCH.** Account renamed CaV1E → caveshen. Git identity
  fixed: global config + all 34 commits rewritten to
  `Caveshen Rajman <25897311+caveshen@users.noreply.github.com>` (the old
  Entelect work email never reached the public remote). Repo
  `caveshen/caveshen.github.io` created; main pushed; Pages source set to
  the Actions workflow (the auto-enabled legacy build was superseded — its
  one failed run is expected debris). First deploy GREEN: tests → build →
  deploy in 2m23s; `/`, `/sheet/`, `/cv.pdf` all serving. The PLACEHOLDER
  CI check annotates 6 files, as designed, until Caveshen's copy lands.

- **2026-07-16:** P0–P2 complete (see §9 for commits). Sample C artifact
  superseded → 4468f873. Skyline "trio" direction locked (§3). CV approved &
  rendered (§7). /sheet gains back-to-interview link (§4). Pre-remote commit
  workflow clarified (§2). Dialogue restart convention + scale notes (§5).
- **2026-07-17:** Dialogue tree gains a worked branching example (8cebfc4).
  **P3 complete** (§9): 404, meta/OG, night-scene favicon + OG/apple-touch
  PNGs, warn-only PLACEHOLDER check, robots/llms/sitemap; Lighthouse
  100/100/100/100; `--dim` WCAG AA fix. Suite now 47 unit / 427 e2e (§13).
  Restart convention confirmed by Caveshen (in-fiction `"to": "root"`).
  Post-review once-over caught a stale scaffold `favicon.ico` (Astro logo) —
  replaced with a 32×32 moon-mark ICO, generated by `docs/render-og.js`.
- **2026-07-18:** D&D character-sheet workshop round 1: direction committed
  from the mock (artifact 952df112), full decisions in §4. Notables: level =
  years in tech (blatantly), no multiclassing (dialogue-tree material
  instead), Background "Tester → Senior Engineer", vitals row cut from the
  site but kept on the workshop list, quartet kept (his copy). Restyle
  proceeds; workshopping continues at ~15% less noise.
  **Restyle shipped same day** (worker→reviewer loop; reviewer caught
  unmarked invented flavour, two lost real job titles, a loosened test
  assertion, and a dropped `<main>` landmark — all fixed). Suite now
  47 unit / 462 e2e (66 × 7).
  **Round 4 shipped:** stretch mechanism removed, Quartet to middle column,
  alignment test retired. Natural bottoms at 1366px: rail 805 / right 986 /
  middle 1186 — no interior voids; real copy will shift the balance.
  **Workshop round 2 (same day, from the live preview):** drop the
  "1 level = 1 year" label (too on-the-nose; XP bar carries it);
  Background → "Software Engineering"; spellbook simplified to the real
  CV stack, casting-stat trio dropped; columns must bottom-align; skills
  panel verdict: LIKED. Details in §4.
  Still pending: D&D-style character-sheet workshop (Caveshen brings
  examples); Caveshen writes the real dialogue JSON + sheet copy; push
  decision (create the public `caveshen.github.io` remote).

---

## 15. Known defects — ALL CLOSED (log kept)

Logged 2026-07-22, found by screenshot review of the landing-v2 port on
`item/landing-v2-avatar` **after** the suite went green (757 passed / 3
pre-existing skips). All three were invisible to the tests — they are
composition faults, not logic faults. Deferred by Caveshen's ruling to a
following session; the port itself was sound and shipped as-is.

**Status roll-up 2026-07-25 — nothing in this section is open.** D1 and D2
fixed in `babf3f3`; D3 closed as a design ruling into §17/§19; D4 fixed in
`7eced29`. The heading said "(open)" for three days after the last of them
closed — corrected here. Each entry below now carries its own outcome; the
symptom/cause text is kept because it is the reasoning that produced §16.

### D1 — The approach prompt renders on top of the figure's hood — FIXED (2026-07-22, `babf3f3`)

**Symptom:** the "Approach the hooded figure" button sits across the
character's head in all three aspect variants, not beside or above it.
**Cause:** `src/pages/index.astro`, `positionPrompt()` — the button is
centred on the figure's measured bounding box at `fig.height * 0.1` from
its top, which is precisely where the head is. Carried forward unchanged
from the pre-restage build.
**Why the tests miss it:** every assertion checks the button is present,
focusable and clickable. None checks it does not overlap the figure.
**Fixed:** as proposed — `positionPrompt()` in `src/pages/index.astro` centres
the prompt on the figure and floats it `GAP = 14px` clear above the measured
head, with a beside-the-figure fallback (clamped on all four sides) when there
is no headroom. Guarded by `e2e/interview.spec.js` — "approach prompt does not
overlap the figure", parametrised across viewports. Later extended by §27: the
element is found via the shared `.js-character` class, so the prompt tracks
whichever character is on stage.

### D2 — The dialogue card occludes the face after the camera zoom — FIXED (2026-07-22, `babf3f3`)

**Symptom:** approaching zooms to frame the face, then the card covers it.
Only the crown of the hood remains visible above the card.
**Cause:** `src/scripts/camera.js` frames the face at `stage.height * 0.32`;
the in-scene card (five choice buttons tall) begins at roughly 28% of stage
height. The two were specified independently and were never checked against
each other.
**Why the tests miss it:** the camera tests assert the transform is
non-identity and numerically correct; the card tests assert visibility and
focus order. Neither compares their geometry.
**Fixed:** the stronger of the two options was taken — the constant is *gone*.
`faceTargetY` is now `cardTop / 2`, derived from the card's measured rect at
approach time, so the framing band is defined as "between the top of the stage
and the top of the card" and the two cannot drift apart again. `faceY` is the
measured `.face-void` centre passed in directly, so
`computeCameraTransform`'s 18%-down heuristic no longer applies on this path
(the heuristic remains as the documented default when `faceY` is omitted, and
is still unit-tested). §27 reuses both lookups for the Badger.

### D3 — Ultra-wide leaves the bottom half of the page empty — CLOSED as a ruling (2026-07-22)

**Symptom:** at 2560×1080 the scene occupies ~47% of the viewport width and
the lower half of the page is bare background.
**Cause:** `src/pages/index.astro` — `.stage-frame { max-width: 1200px }`
applies to every variant, so the 21:9 scene cannot use the width its own
`1750 / 750` aspect-ratio was authored for. Standard and portrait are
unaffected.
**Status: RULED 2026-07-22 — Option 2 accepted.** Caveshen reviewed three
rendered options at 2560×1080 (the built site with runtime CSS overrides;
nothing in the repo was changed to produce them) and chose to lift the cap
for the wide variant only, limiting width by available height instead so the
stage grows in both directions. Implementation, the further full-window
option and the perspective consequences are carried into §17 and §19; this
entry closes as a design ruling, not a defect fix.

Recorded for the record, because it changes how the other two options should
be read if this is ever revisited: the flaw in the shipped layout was **not**
the 1200px cap. It was that `.stage-frame` is top-aligned, so all the unused
height collects in one slab below it. Centring the frame vertically makes
the identical cap read as a deliberate letterbox rather than an unfinished
page. That variant was rejected in favour of Option 2, but it is the correct
fallback if the full-bleed direction is ever reversed.

### D4 — "End dialogue" button shows on the no-JS path — FIXED (2026-07-23)

**Symptom:** with JavaScript disabled, the `#end-dialogue` button renders
visibly inside the (no-JS-visible) card, despite carrying the `hidden`
attribute — a dead control the visitor cannot use.
**Cause:** `src/pages/index.astro` — `.end-dialogue { display: block }` is an
author-origin rule that overrides the user-agent `[hidden] { display: none }`
regardless of specificity, so the `hidden` attribute is defeated. Its own
comment claims "with JS off this stays hidden"; it does not. Pre-existing,
not introduced by any recent work.
**Found:** by the reviewer of the §17.1a/§18 build (2026-07-23), which fixed
the *identical* cascade bug two rules away on `.fullscreen-toggle`
(`.fullscreen-toggle[hidden] { display: none }`). Flagged, deliberately NOT
fixed in that diff — out of its scope, and pre-existing.
**Proposed fix:** the same one-liner —
`.end-dialogue[hidden] { display: none; }`. Trivial, but it is Caveshen's call
whether to fold it into the next branch that touches this file or take it
standalone. Add a no-JS assertion that `#end-dialogue` is not visible.
**Fixed:** applied verbatim, mirroring `.fullscreen-toggle[hidden]` exactly.
`e2e/approach.spec.js` — "no-JS: end-dialogue button is not visible" — proven red
before the fix, green after.

### D5 — The dialogue card flashes on page load — FIXED (2026-07-26)

**Reported by Caveshen**, watching a real cold load: *"on page load there's a
split-second where an empty dialogue renders… centre-bottom of the screen and
disappears after 500ms probably."*

**Reproduced and measured 2026-07-26**, not inferred. It does not appear on a
warm headless load — the init script wins the race against first paint — so it
was reproduced by throttling the CPU 20×, which is what a real cold load does to
script execution. Under throttle, `.card` paints at t≈987ms with the `hidden`
attribute **absent**, `display: block`, `opacity: 1`, height 250px at y=792.
Centre-bottom, exactly as reported.

**Root cause — a consequence of the progressive-enhancement design, not a
mistake in it.** `<main class="card">` ships **visible** in the markup so the
page works with JavaScript disabled (the §9 P3 rule, and the reason D4 exists).
`index.astro:840` then sets `card.hidden = true` during init. Between first paint
and script execution the card is therefore genuinely on screen. On a fast warm
load the gap is invisible; on a cold load it is a clear flash.

This is the same class of problem as D4 — the no-JS path leaking into the JS
path — but in the time dimension rather than the DOM.

**Intended fix (native, no new JS):** ship the card hidden at first paint, and
restore the no-JS path with `<noscript>` — exactly the platform feature for
this; it needs no script and cannot itself flash.

**Do not solve this with an inline head script** setting a `js` class. It works,
but it adds a render-blocking script and a second source of truth for a state
`<noscript>` already expresses.

**Must not regress:** the existing no-JS assertions, D4's fix, and the §28
`.card-entering` fade.

**FIXED 2026-07-26 exactly as specified.** `<main class="card" hidden>` plus
`<noscript><style>.card[hidden] { display: block; }</style></noscript>`
immediately before it. The PRD's assumption held: `.card` carries no
author-origin `display`, so the UA `[hidden]` rule applied cleanly and no
`.card[hidden]` reassertion was needed.

`card.hidden = true` at init was **removed**, not kept. With `hidden` in the
markup it set an attribute that was already set; the re-arm that matters is the
`card.hidden = true` in `exit()`, untouched.

**Proven red before green**, which mattered here: the defect does not reproduce
on a warm headless load — the init script wins the race against first paint — so
it survived a 1309-test suite unnoticed. `e2e/card-flash.spec.js` reproduces it by
throttling the CPU 20x via CDP, navigating with `waitUntil: 'commit'`, and
sampling `.card` from `document_start`. It failed on the old code and passes on
the new. Independently re-confirmed by the orchestrator: zero painted frames
under the same throttle that previously showed the card at t~987ms.

**Known limit of the guard:** CDP throttling is Chromium-only, so this test runs
on 4 of the 8 projects and skips on WebKit and Firefox. The defect is
engine-independent, so this is accepted — but the regression guard is narrower
than the rest of the suite.

---

## 16. Proposed item — visual validation in e2e (NOT ACCEPTED, intent only)

**Superseded 2026-08-03 by `## d18`**, which turns the intent below into a
buildable spec. This section is kept as the reasoning that produced it.

Raised by Caveshen 2026-07-22. **Recorded as intent only — no design, no
research, no build.** Work starts fresh in a later session, on his go.

### The problem

The test suite cannot see composition faults. It has now missed them four
separate times on this project, most recently §15 D1/D2/D3 — all three found
by a human looking at screenshots *after* 757 tests went green. The suite
guards logic (does it render, is it focusable, does the transform apply);
nothing guards whether the result looks right. Every composition fault so
far has been caught by eye, and eyes do not run in CI.

### The constraint (this is the interesting part)

The standard answer — golden-image / snapshot testing, e.g. Playwright's
`toHaveScreenshot()` — is **explicitly rejected**. Caveshen's requirement:
no solution whose disk footprint grows with test coverage. Baseline images
across an 8-project tri-engine matrix, re-baselined on every deliberate art
change, would commit a churning binary blob to the repo permanently. The ad
hoc screenshot passes used during the landing-v2 workshop are the same
problem in manual form and are not to become routine.

### Working hypothesis (to evaluate, NOT a decision)

Assert **geometry and relationships**, not pixels. All three §15 defects are
statements about boxes: does the prompt's rect intersect the figure's; does
the card cover the point the camera framed; does the scene fill the viewport
it was authored for. The Table Mountain 2.4194 invariant is already this
shape and, once corrected to screen space, it works. Costs no disk, is
deterministic across engines, and fails with a number a human can read.

Open for the session that takes this on: whether geometric invariants cover
enough of the risk on their own, or whether something cheap and lossy (a
perceptual hash, a coarse checksum) earns its place alongside them. Neither
is decided.

### Acceptance shape

Whatever is chosen must catch a re-introduction of §15 D1 and D2, run in the
existing CI matrix without a meaningful time penalty, and add no artefact to
the repo that grows as tests are added.

---

## 17. Stage sizing — full-bleed wide, and a full-window toggle

Raised and accepted by Caveshen 2026-07-22, out of the §15 D3 ruling.
**BUILT AND ACCEPTED.** 17.1 built 2026-07-22, 17.1a built 2026-07-23, then
both superseded by 17.2 (built 2026-07-24, seen live and accepted by Caveshen
2026-07-24: "it's already looking MUCH better"). Comparison that produced the
original ruling:
https://claude.ai/code/artifact/0ec6a101-aee8-4f1f-b35a-3217715f6417

**Read this section back-to-front.** It records three passes at the same
problem, each superseding the last, and 17.2's "RULED — default" block is the
one that describes what ships. 17.1 and 17.1a below are kept because they
explain *why* the answer moved, and because 17.1a's height-limited fit is the
correct fallback if full-window is ever reversed.

### 17.1 Wide variant goes full-bleed (the D3 ruling)

`.stage-frame`'s `max-width: 1200px` stops applying to the 21:9 variant. The
stage instead grows until it runs out of *height*, which is the real
constraint: at 1750/750 a 2560px-wide stage would need 1097px of height, and
a 1080px viewport has not got it. Measured outcome of the accepted prototype
at 2560×1080 was a 2287×980 stage — 89% of viewport width, 91% of its height,
against 47%/48% as shipped.

Standard and portrait variants are **unaffected**. Their caps stay.

### 17.1a Standard variant gets the same treatment — SUPERSEDES the line above

Raised by Caveshen 2026-07-23 from live play on a 1990×1120 window: the scene
sat in a 1200px strip along the top, "stretching to neither height nor width…
just randomly placed somewhere in screen space." **The original scoping of
17.1 to the wide variant only was wrong** — it left the most common desktop
case, ordinary 16:9, in exactly the D3 state 17.1 was meant to fix.

Cause: the 1.875 aspect breakpoint that triggers full-bleed is above 16:9
(1.778), so every standard 1920×1080-class window falls into the *standard*
variant, which still carries the 1200px cap **and** is top-aligned — so the
horizontal slack shows as side margins and the vertical slack pools at the
bottom. Measured: at 1990×1120 the stage was 1200×750, 60% of viewport width.

Fix (prototyped and measured at his own window size): the standard variant
takes the same height-limited `max-width` as the wide one, and the page
centres it vertically so leftover space splits evenly rather than pooling
below. Measured outcomes: 1990×1120 → 1600×1000 (80% width); 1920×1080 →
1536×960 (80%); 2560×1440 → 2112×1320 (83%). No page scroll at any of them.

Known and accepted limit: a 1.6-aspect standard world in a 16:9 window is
height-bound, so it cannot reach 100% width without cropping — the side
margins are the scene keeping its proportions. Edge-to-edge is the §17.2 /
§18 fullscreen story, not this.

**Status 2026-07-23 — ACCEPTED, TO BUILD.** Caveshen approved the prototype
at his own window size and told us to build it. The height-limited `max-width`
extends to the standard variant and the page centres the stage vertically.
Acceptance: standard-variant stage width ≥ 80% of viewport on a 16:9 window,
vertically centred, no page scroll; portrait untouched; the wide variant and
the Table Mountain invariant unchanged.

Open follow-up, NOT decided (Caveshen 2026-07-23: "leave it as an open
question to be decided later"): whether the wide-variant breakpoint should
drop below 16:9 so common desktops get the panorama instead of the standard
composition. Deferred until §20's wider world exists, since it changes what
"wide" even shows.

### 17.2 The stage may claim the whole window (new)

Caveshen's addition, and it goes further than 17.1: he wants the option of
the stage occupying 100% of the window — *explicitly accepting that this
swallows the scene*, i.e. that the SVG will crop rather than fit. His words:
"I still want this even if it swallows the scene."

This is already structurally available. Every scene SVG carries
`preserveAspectRatio="xMidYMax slice"` — `slice` crops the overflow instead
of letterboxing it, so a stage sized to arbitrary dimensions renders a
correctly-proportioned *crop* of the world rather than a distorted stretch.
No new rendering strategy is required; only the sizing rule changes.

~~**Shipped as a toggle "for now"**~~ — **SUPERSEDED twice.** First by §18's
"one control" ruling (no separate size toggle ships), then by the
"RULED — default" block below (full-window is the default, not a mode). There
is no framed/full-window toggle and there never was one in the tree.

### Acceptance criteria

Criteria 1–3 superseded by 17.2 + §18 (no toggle, every aspect fills the
window). 4 and 5 stand and are tested; 6 moved to §18.

Added by the "RULED — default" block and met: site chrome overlays the
full-bleed stage without occluding the figure, card or prompt (tested at all
four aspects), and the bottom-anchored crop trims sky/sea rather than the
subject.

### Status 2026-07-22

- **17.1 — BUILT** on `item/landing-v2-avatar`. The reserve subtracted from
  the viewport height is **120px**, measured rather than estimated: 16px
  stage-frame top margin + 32px footer top margin + 28px footer height + 40px
  footer bottom margin = 116px, rounded up. The 100px used in the accepted
  prototype was wrong and left a 16px scrollbar at 2560×1080.
- **17.2 — BUILT** 2026-07-24 on `item/landing-v2-avatar` per the "RULED —
  default" block below. `.stage-frame` is now `width:100%; height:100svh`
  (no cap, no centring); the §17.1a fit/centre rules and their tests were
  removed as corrections. Site chrome overlays the full-bleed stage — the
  footer became a fixed top-left glass chip (it can't sit below a full-height
  frame), mirroring the theme toggle's top-right corner. Crop guard verified:
  bottom-anchored `xMidYMax` trims sky/sea, never the figure/card, at ultrawide
  and portrait. Chrome-non-overlap tested at all four aspects. ~~Awaiting
  Caveshen's live look~~ — **looked at and accepted 2026-07-24** ("it's already
  looking MUCH better"). §17 is closed.

### RULED 2026-07-23 — default (not a toggle)

Caveshen: fill-the-window is the **default** sizing behaviour, not a toggle.
It **supersedes §17.1a's height-limited fit + vertical centring** on `/`: the
stage fills 100% of the viewport at any size and the selected variant is
cropped via `slice` (never distorted). The three-camera variant swap by width
cut-off (§14) is unchanged.

Implementation notes:
- Site chrome (footer, time toggle, the §18 fullscreen button) now overlays a
  full-bleed stage rather than sitting below it. Exact placement is implementer
  discretion — flag the result for his look.
- Guard the crop: keep the figure and dialogue card within the safe centre so
  extreme window aspects crop sky/sea, not the subject. "Swallows the scene"
  is accepted, but clipping the figure/card is not the goal.
- §17.1a's now-superseded fit/centre tests are expected to be replaced, as the
  earlier §17.1a corrections were — document each removal as a correction, not
  a weakening.

---

## 18. Fullscreen toggle button

Requested by Caveshen 2026-07-22. **BUILT AND ACCEPTED 2026-07-23** (`14f121c`).
Caveshen 2026-07-23: "the fullscreen button introduced as 18 is its own thing
and works perfectly, and I have already accepted that." All six acceptance
criteria below are met and covered by the suite. Nothing open here.

A floating button, **bottom-right of the screen**, carrying the standard
fullscreen glyph (the four-corner brackets), toggling the browser's
Fullscreen API on the stage.

### Acceptance criteria

1. Button is present, visible against both night and day grounds, and does
   not occlude the figure, the card, or the approach prompt in any of the
   three aspect variants — asserted geometrically, per §16's hypothesis.
2. Calls `requestFullscreen()` / `exitFullscreen()`; the glyph reflects
   current state, and the control stays correct when the user leaves
   fullscreen by pressing Escape rather than by clicking the button.
3. Degrades honestly: where the API is unavailable or refused, the button is
   absent rather than present-and-dead.
4. Keyboard reachable with a visible focus ring; correctly labelled for
   screen readers, with the label changing with state.
5. No-JS path: the button does not appear at all (it cannot function), and
   nothing else on the page shifts because of its absence.

### Open question — is this one control or two?

§17.2 (stage claims the whole *window*) and §18 (stage claims the whole
*screen*) are different mechanisms but arguably one user intention: "give me
more scene". Two floating controls that both make the picture bigger is a
worse interface than one. Three ways to resolve it, undecided:

- Keep both, distinct affordances (a size toggle and a fullscreen button).
- One button that goes full-window on click, fullscreen on a modifier or a
  second click.
- Fullscreen only, and let §17.2's full-window mode *be* what fullscreen
  does — simplest, and probably the laziest thing that works.

### RULED 2026-07-22 — one control

Caveshen: "agree with your leaning, that's fine, if I feel differently later
we can change it up."

**There is one button, and it is fullscreen.** §17.2's full-window mode is
what fullscreen *does* — the stage claiming the whole screen is the single
behaviour, reached by the single control. No separate size toggle ships.

Consequences for §17.2, which stands but narrows:
- The persistence criterion (17.2 acceptance 3, "state persists across
  reloads") is **dropped**. Browsers do not allow fullscreen to be entered
  without a user gesture, so a persisted preference could not be honoured on
  load, and a control that silently forgets is worse than one that never
  claimed to remember.
- The crop behaviour, the no-stretch guarantee and the Table Mountain
  invariant (17.2 acceptance 4) all still apply — they are properties of the
  stage at any size, not of how it got there.

Reversible by design: if the two behaviours later want separating, the
full-window sizing rule is independent of the Fullscreen API call and can be
given its own control without rework.

---

## 19. Locked background layer (perspective consistency)

Raised by Caveshen 2026-07-22 as "one twist" on the §15 D3 ruling.
**SPLIT IN TWO. The refactor half is BUILT (2026-07-24, `2a3298a`); the
locking behaviour is WITHDRAWN — see CLOSED below.** Prototype:
https://claude.ai/code/artifact/f23b9a5b-81f3-4356-a5d1-0ea9f7c15fbc

### CLOSED 2026-07-26 — locking WITHDRAWN, section complete

Caveshen: *"the original goal was simply to split the background and foreground
elements so that the background could remain relatively static when adjusting
to different aspect ratios, but I feel we have achieved a very happy
middle-ground with our current branch, so this is no longer necessary."*

So §19 ends at the structural refactor. The differential transform, the
waterline anchor, the `k = S_REF / (s · cameraScale)` factor and the unruled
`Math.min(1, …)` clamp are all **withdrawn, not deferred** — the wider world
(§20) and the camera easing (§21) between them closed the perceptual gap the
lock was meant to close, and the clamp's own measured failure at 390×844
(mountains entirely cropped) means the remedy cost more identity than the
problem did.

The `bg-layer` / `fg-layer` seams and their guard test **stay**. They cost
nothing, they change no pixels, and they are the cheap option value if scene
control is ever wanted again. Everything below this block is preserved as
**historical design record only** — do not build from it without a fresh
ruling.

### REFRAMED 2026-07-24 — build as a pure structural refactor (no visual change) — BUILT 2026-07-24

**Status: BUILT** — `bg-layer`/`fg-layer` seams added to all three scenes;
pixel-identical (0-diff) across every variant/theme/state; a seam test guards
it; no existing test changed. The clamp/locking design below stays unbuilt,
for later.

Caveshen, after seeing §20 + §17.2 live: the *locking behaviour* (the
differential background/foreground transform + the clamp below) is **NOT built
now**. Instead, do the refactor half only — **separate background from
foreground in the DOM so the scene can be controlled independently later**,
while changing **nothing** about how it currently looks. His words: "a
refactoring exercise that does not change up the looks but rather separates
'background' from 'foreground' to allow for greater scene control later."

Scope of the refactor:
- Per scene SVG, wrap the seam elements in two named groups — `bg-layer`
  (stars, moon/sun, `<CityScape>`/`.world`) and `fg-layer` (sea, moon
  reflection, waves, ground, rail, figure, Badger) — leaving the sky fill rect
  as the untransformed always-cover base before them. Paint order preserved
  exactly.
- **No differential transform applied.** Both layers render exactly as today;
  the groups are transparent seams for future use.
- Success = **pixel-identical** output across all three variants, day/night,
  approached and not, figure and Badger (verify by before/after screenshot
  diff, since geometry tests won't catch paint changes). All existing tests
  stay green and unchanged.

The clamp/scale-factor machinery below is preserved as the design for the
*eventual* locking change, if we ever choose to apply a differential transform
to `bg-layer`; it is out of scope for this refactor.

The withdrawn locking design (differential bg/fg transform, waterline anchor,
`k = S_REF/(s·cameraScale)`, the `Math.min(1,…)` clamp and the measured
390×844 failure) is in git history at c3fc5cd~1. Do not build from it without
a fresh ruling.

---

## 20. A wider world — extending the cityscape

Raised by Caveshen 2026-07-22 on seeing the §19 prototype: the background
city "needs to be MUCH larger / widespread… extend it across the entire
scene in widescreen and then let it naturally adjust to the other views".
**BUILT AND ACCEPTED.** Direction accepted 2026-07-23 after two prototype
rounds, ported to `CityScape.astro` the same day (`67e3c67`), waves included,
and seen live and accepted by Caveshen 2026-07-24. Section closed; the
workshop record below is kept because §19's locking design leans on it.

### Scope to workshop

- **How wide.** Wide enough that a locked background still fills a 2560px
  stage, with margin for wider displays. Implies an authored span
  meaningfully beyond 1750 units.
- **What extends — RULED 2026-07-22.** The mountain chain **stays exactly as
  it is**. Table Mountain, Lion's Head and Signal Hill are the scene's
  identity and are not to be repeated, extended or redrawn. The world grows
  **asymmetrically**:
  - **Left** — the city continues past the existing bowl and turns
    **industrial**. Caveshen: "it is an industrial area around that part of
    town." This is the half that gains new vocabulary, not just more of the
    same rectangles.
  - **Right** — **open water**. Caveshen: "the right of the scene can just be
    water because that's the natural coastline of the city." Nothing is
    built out to the right; the sea is the answer to the empty flank, and it
    is a truthful one rather than a filler.

  This is a better answer than the symmetric extension originally sketched
  here, and not only aesthetically: it halves the drawing work, it means the
  right-hand reveal costs nothing but sea, and it makes the composition
  asymmetric in a way that reads as a real place rather than a repeating
  backdrop.

- **Industrial vocabulary — DECIDED 2026-07-23.** A blend of the working
  harbour and the warehouse fringe, **≈67% harbour / 33% warehouse by mass**,
  laid out as a **gradient across the left flank** rather than mixed evenly:
  - **Nearest the existing city bowl (the harbour end, ~2/3):** gantry /
    portal cranes, stacked shipping containers, a moored ship silhouette.
    Taller and more active; the crane arms reaching right toward the open
    water tie the industrial left to the sea on the right.
  - **Tapering off toward the far-left edge (the warehouse fringe, ~1/3):**
    low pitched-roof sheds, water towers, short stacks, poles and wires.
    Lower, more horizontal, quiet — the edge of town thinning out.
  - The warehouse share concentrates at the leftmost side and **tapers**, so
    the density falls away at the frame edge rather than ending on a hard
    wall of buildings.

  Constraints on the drawing: everything reads as a **flat silhouette at the
  same detail level as the existing plain-rectangle city** — simple geometry,
  no gradients or fine detail, nothing that out-details its neighbours.
  Container stacks read by their stepped rectangular stacking, not by colour;
  keep the silhouette monochrome to match the city language. Lit windows are
  permitted via the existing CSS-only glimmer, but **sparingly** — industry
  is darker than the city bowl.
- **Depth.** §19 flags the absent depth cue. A wider world is the natural
  moment to introduce one — a haze band, a second further-back building
  layer at lower contrast — which would also buy headroom for the figure's
  scale growth.
- **Density and rhythm.** The existing 21 buildings and 24 lit windows are
  hand-placed with deliberate irregularity. Extension must not become a
  visibly tiled repeat.

### Constraints that still bind

- Authored **once** in `CityScape.astro` and rendered into all three scenes;
  cameras pan and scale uniformly, never stretch (§3, as refined by §19).
- The lit-window glimmer stays CSS-only, emitted inline at build time, and
  keeps working with JavaScript disabled.
- Fills come from CSS classes, never SVG presentation attributes — `var()`
  does not resolve in those.
- More SVG nodes cost render time on the mobile matrix; watch it, since
  Lighthouse ≥ 95 performance is success criterion 6.

### Acceptance criteria

1. At 2560×1080 with the §19 lock applied, the **left** flank is filled to
   the stage edge by city and industry — no bare sky wedge on that side. The
   **right** flank is open water by design, and a horizon that runs clean to
   the edge is the pass condition there, not a failure.
2. Standard and portrait remain compositionally sound; the mountain chain is
   still legible and uncropped on a 390px-wide phone.
3. The Table Mountain screen-space aspect invariant (§13) still passes in all
   three variants — proof the world was widened, not stretched.
4. Lighthouse performance on `/` stays ≥ 95 on the mobile profile.
5. The extension reads as hand-placed: no detectable tiling period in the
   building rhythm or the window scatter.

### Method

Same loop that settled §15 D3 and §19, which has now worked twice: prototype
as a runtime override against the built site, screenshot all three aspects,
Caveshen rules, *then* it enters the repo. Nothing is drawn into
`CityScape.astro` before he has seen it.

### Status 2026-07-23 — DIRECTION ACCEPTED; ready for real implementation

Two prototype passes (harbour cranes + tapering warehouse fringe; then a
lightest-touch pass that boosted the container stacks so they read at night
and dropped the ship that would not read). Caveshen: "Yes, we leave it there."
No further prototype rounds.

The prototype's exact drawing is preserved as the base for the real build —
it is not to be re-drawn from scratch. Reference (throwaway worktree deleted;
this copy is authoritative for the geometry):
`scratchpad/s20-cityscape-reference.astro` in the session scratchpad. The real
implementation ports those ~32 elements (industrial district at world
x ≈ −295 to 34, camera/viewBox unchanged) into `CityScape.astro`, **test-first
and on a clean base once §17.1a/§18 have committed** — not on top of the
in-flight stage-sizing work.

**Ported 2026-07-23.** `CityScape.astro` now matches the reference verbatim;
world spans x ≈ −295..1150. Waves added in all three scene variants (below).
New e2e regression tests (industrial district geometry west of x=0; ≥4
`.f-wave` marks per variant) pass, each proved to fail on revert; full unit
(56) and e2e (1013) suites plus `npm run build` all green. ~~Awaiting
Caveshen's live review.~~ **Reviewed live and accepted 2026-07-24.**

### Added scope — wave elements in the water (Caveshen 2026-07-23)

"A few more 'wave' elements in the water would complete this backdrop." Add a
small number of subtle wave marks to the sea surface — short horizontal
strokes in the sea's own silhouette language, sparse, monochrome, matching
the existing moon-reflection marks rather than out-detailing them. Applies to
the sea in **all three scene variants**, not only the wide one (the sea is
foreground per §19, so it is unaffected by the background lock). Keep it
cheap — a handful of static marks, no per-element animation — against success
criterion 6. Folded into the §20 implementation so the sea is drawn once,
complete; Caveshen sees it in the real build rather than a further prototype.

**Done.** 6 static `.f-wave` marks per variant (rx=1.5, opacity 0.09–0.16 —
subordinate to the moon reflections), new `--wave` token in `tokens.css`
(sea-tinted, distinct from `--moon`'s pale cream), always visible (not
`night-only`), fills via CSS class per the no-presentation-attribute rule.

---

## 21. Camera zoom easing — the approach lurches

Reported by Caveshen 2026-07-22 from live play. **BUILT AND ACCEPTED
2026-07-23** — entry `550ms cubic-bezier(0.4, 0, 0.2, 1)`, exit untouched. See
"Status 2026-07-23 — ACCEPTED" at the foot of this section; the values are
final and the merge caveat is lifted. Nothing open here.

### Symptom, in his words

"It zooms in a little INSTANTLY and then continues the zoom, which is less
dramatic and more sudden… I want the zoom-in to be fully animated/rendered
and the speed can certainly be modified to be faster on zoom-in and slower on
zoom-out (zoom-out is actually perfect)."

### Cause — measured, not suspected

`src/pages/index.astro:276` — `.camera { transition: transform 950ms
cubic-bezier(0.16, 1, 0.3, 1); }`. That curve leaves the origin at roughly
6× speed. Against the 950ms duration it resolves to:

| Elapsed | Zoom completed |
|---------|----------------|
| 19ms (~1 frame at 60Hz) | 12.0% |
| 48ms | 28.1% |
| 95ms | 49.4% |
| 190ms | 75.2% |
| 475ms (half the duration) | 97.2% |

The animation is perceptually over in about 200ms and then spends its
remaining 750ms traversing the last few percent. The "instant jump" is the
first frame landing 12% in; the "continues" is the long imperceptible crawl.
Nothing is dropping frames — the easing is doing exactly what it was told.

The same curve is used for the exit, where it reads correctly: a fast
departure that settles is a natural retreat. **This is why one shared
transition cannot serve both directions.**

### Direction

Split the easing by direction. The entry wants a curve that actually starts
from rest so the zoom is legible as motion; the exit keeps today's behaviour,
which he has explicitly approved.

**Ambiguity to resolve with Caveshen before building:** he asks for "faster on
zoom-in and slower on zoom-out" while also saying "zoom-out is actually
perfect". Read literally those conflict. Working interpretation, to confirm:
the exit is not to be touched, and "faster" for the entry means a shorter
overall duration once the first-frame lurch is gone — not merely
redistributing the same 950ms.

### Acceptance criteria

1. Entering the zoom, no single frame advances the transform more than a
   small fraction of the total; the motion reads as continuous from rest.
2. Entry and exit have independent durations and curves.
3. Exit behaviour is unchanged from what ships today — verified by eye
   against the current build, since it is approved as-is.
4. `prefers-reduced-motion: reduce` continues to skip the transition
   entirely (`index.astro:278–280` already does this; it must not regress).
5. Interrupting an in-flight zoom — approach then Escape before it settles —
   leaves the camera in a coherent state, with no stuck or doubled transform.
6. The existing camera unit tests (§13) still pass untouched: this is a
   presentation change and the transform maths must not move.

### Note for whoever takes it

Easing is a felt quality and the suite cannot judge it — criterion 1 is
measurable, but "dramatic" is not. This wants a look before it commits, in
the manner of §16.

The "faster in / slower out" vs "zoom-out is perfect" ambiguity was never put
to him; the working interpretation (exit untouchable, faster = shorter entry)
was applied and accepted. A one-line change if he meant otherwise.

### Status 2026-07-23 — ACCEPTED

Caveshen looked at the entry live: "the zoom is better… accept the zoom speed
here." 550ms / `cubic-bezier(0.4, 0, 0.2, 1)` is final for the entry, exit
unchanged. The values are no longer provisional; the merge caveat above is
lifted for §21 specifically.

He noticed a separate thing while looking, logged as §22: the dialogue *text*
swaps instantly while the camera eases, which reads oddly. That is not this
item — the zoom is settled.

---

## 22. Dialogue presentation — text is instant, to be workshopped

Noticed by Caveshen 2026-07-23 while reviewing the §21 zoom: with the camera
now easing in smoothly, the dialogue **text** swapping instantly stands out —
"the dialogue itself though is instant, which looks *interesting* in the
scene." His framing: **to be workshopped, not fixed now.** "We definitely
need to rework the dialogue soon, but for now it's fine just to note this."

**ACCEPTED AS A PARKED ITEM — no work, no design.** Recorded so it is not
lost, and because it is a symptom of a larger intent he has flagged more than
once: the dialogue system wants a proper pass, not a one-line tween.

What "instant" means concretely, for whoever picks this up: `apply()` in the
dialogue engine replaces the speech and choice nodes in a single synchronous
`replaceChildren`, with only the existing 200ms opacity crossfade (skipped
under reduced motion). Against a 550ms camera ease the text is fully swapped
before the camera has travelled a third of the way, so it reads as a hard cut
inside a moving shot.

This is deliberately left open. It is entangled with the larger "rework the
dialogue" intent and should be taken as part of that, not pre-empted by a
typewriter effect bolted onto the current engine. When it is picked up it
wants a look, in the manner of §16 and §21 — pacing is felt, not asserted.

---

## 23. ~~Preserving the current main landing — the "attic"~~ → **the `main` cutover**

Raised by Caveshen 2026-07-23, tied to the eventual `main` cutover. Two
concerns: switchover discipline, and archival.

### RULED 2026-07-26 — **the archival half is WITHDRAWN. §23 is the cutover.**

> "Once our interactive 404 is up, we can replace what's in `main` with
> confidence."

The attic existed to guarantee the original landing survived the overwrite. The
interactive 404 (§30 D-4) now carries that design forward **as a living page**,
built from git and reusing the v2 scene — which is a better outcome than a frozen
reference folder that bit-rots (the very risk this section flagged as open).

So: **no `src/attic/`, no `/attic` route, no archive folder.** The retired
palette and the original markup survive in git history, which is sufficient
precisely *because* nothing depends on resurrecting them.

**§23 now has one job — the cutover — and one prerequisite: the interactive 404
ships first.** Everything below is retained as historical record of the archival
design; do not build from it.

Historical: the archive design (reference folder, `/attic` route,
lossless-preservation clause) is superseded — see git history.

### Pre-cutover checklist (assembled 2026-07-25)

Several sections say "must be done before the cutover" and none of them said
it in the same place. This is that place. None of it is scheduled; it is the
gate, not a plan.

**Blocking — the site is wrong without these:**
1. **All copy is Caveshen's.** Every `PLACEHOLDER` is his to replace:
   `src/data/dialogue.json` (all 6 nodes — every `stage`, `speech` and option
   `label`), the approach prompt and end-dialogue button labels, the page-foot
   attribution, the meta descriptions on `/` and in `Base.astro`, the 404
   flavour line, the About section of `public/llms.txt`, and the remaining
   `/sheet` fields (alignment, quest-log company names and flavour lines,
   education/training). The CI scanner is warn-only by design (§9 P3) — it will
   not stop a placeholder shipping.
2. ~~**Remove the §27 TEST-ONLY character toggle.** Full extent listed in §27;
   `e2e/badger.spec.js` goes with it. Grep `REMOVE-BEFORE-SHIP` must return
   nothing.~~ **STRUCK 2026-07-31** — the toggles now stay by decision; see
   **d8**.
3. ~~**Archive the old landing.**~~ **STRUCK 2026-07-28** — this checklist item
   was never updated when the RULED block above withdrew the archive entirely
   on 2026-07-26. Left standing it would block the cutover on cancelled work.
   The interactive 404 (d1) carries the old landing's design forward instead;
   there is nothing left to archive.

**Should be done, won't break the page:**
4. **OG and touch icons** — already re-rendered off the real built site
   (§30 D-2, 2026-07-26); nothing further needed here.
5. **Optimise the Badger rasters** to displayed size — **now `## d26` item 7**
   (moved out of §27 2026-08-02). Not blocking; both frames resize together.
6. **Watch the first deploy anyway.** d6 rewrote `.github/workflows/deploy.yml`
   2026-07-30; its `main` path has never executed (both runs since correctly
   skipped build/deploy, so the `github.ref == 'refs/heads/main'` gate has
   never evaluated true) — the merge is the first time it fires. Budget the CI
   time and look at the deployed page, not just the green tick. Suite is now
   1400 e2e tests across 8 projects (1393 pass, 7 skip).

---

## 24. Ambient banner plane

Requested by Caveshen 2026-07-23. **BUILT 2026-07-24** (feel approved by
Caveshen; reviewer: approve). A small flourish: a plane crosses the sky towing
an advertising banner, the kind that drones along a coastline on a summer
afternoon.

### Behaviour

- A plane silhouette flies across the scene towing a banner behind it.
- **Banner copy:** black banner, white text reading **"MAVERICKS"**. This is
  Caveshen's own intended copy, **not** a placeholder — it is exempt from the
  `PLACEHOLDER` rule, which governs only copy the assistant invents. Do not
  change it or tokenise it.
- **Detail fallback (his steer):** if legible white-on-black lettering cannot
  be made to read at this silhouette scale, **implied detail is acceptable** —
  a banner shape with suggested text (rhythmic marks, a soft blur) rather than
  crisp glyphs. Preferred: legible "MAVERICKS". Acceptable: it reads as a
  lettered banner without the word being sharp.

### Timing

- First pass at **~10 seconds** after load.
- Thereafter roughly **every ~2 minutes**, at **randomised** intervals (not a
  metronome — "random times… ~2 mins or so"). Jitter the interval around the
  2-minute centre.

### Gating — only in the zoomed-out full scene

- Appears **only while the scene is zoomed out and dialogue has not been
  initiated** — i.e. the `approached === false` state, before the camera zoom.
  Once the visitor approaches and the camera zooms in, no plane.
- If a pass is in flight when the visitor approaches, it should bow out
  gracefully rather than freeze mid-sky — decide at build time (finish the
  pass off-screen, or fade). Not specified by Caveshen; flag for his look.

### Constraints and rulings (Caveshen "go" 2026-07-24 — the open points below taken with delegated discretion)

- Purely decorative: `pointer-events: none`, never intercepts interaction,
  never shifts layout. JS-driven timing; absent on the no-JS path is fine.
- **Reduced motion — RULED: no plane.** Under `prefers-reduced-motion: reduce`
  it does not fly at all (not static-shown).
- Cheap: one transform-animated element on an occasional timer; must not cost
  render budget against success criterion 6 (Lighthouse ≥ 95).
- **Aspect — RULED: standard + wide only, not portrait.** The horizontal
  fly-through reads oddly on the narrow tall scene, so it's suppressed there.
- **Direction — RULED: left-to-right**, leaning into the harbour side of §20.
- **Approach mid-flight — RULED: fade out** (not finish-off-screen), matching
  the §21/§28 fade language rather than freezing or a hard cut.

### Note

Like §16 / §21 / §22, the *feel* — speed, altitude, how often it truly wants
to appear — is not something the suite can judge. This wants a look before it
ships. The suite can assert the gating (never present once approached, absent
under reduced motion) and that it does not intercept pointer events.

---

## 25. Palette — from violet night to the sheet's blue-black

Requested by Caveshen 2026-07-23 on the §20 review. **BUILT AND ACCEPTED
2026-07-24** (`2ddc259`; favicon follow-up `05ce607`). Caveshen on the
prototype: "love your proposals, let's commit to that palette." Both themes
shipped — night blue-black, day cool-coastal-blue, warm gold/cream accents
kept. Contrast re-verified (5.67–8.22:1, all AA). "Move away from the purple
hues and colour-match to our character sheet blue-black styling."

### What this is

The landing scene's **night** theme leans violet across its ground tokens
(`tokens.css`): `--bg`/`--sky` `#14121f`, `--mountain` `#262138`,
`--mountain-far` `#3a3457`, `--card` `#1e1a2e`, `--card-edge` `#2e2946`,
`--option` `#a48fd8`, `--option-border`, `--avatar-ring` `#a48fd8`, `--dim`
`#9b93b8`, `--rail` `#474163`. The character sheet (`/sheet`) already lives in
a colder **blue-black**: `--panel-grad linear-gradient(#121a2e → #0a0e1a)`,
`--sheet-bg` nebular blue glows on near-black `#07090f`. This item pulls the
landing into that same family so the two pages read as **one site**, not two
palettes.

### Scope

- Retune the night-theme ground tokens listed above from violet toward
  navy-sinking-into-black, keyed off the sheet's existing values rather than
  invented afresh.
- The **warm accents** — `--celestial`/`--moon` gold, `--text` cream — are the
  deliberate counterpoint to the cold ground; the ask was specifically about
  the *purple*, so these are probably kept. Confirm on the look.
- Because the §20 industrial district and the city bowl draw with
  `--mountain`/`--mountain-far`, this reskin recolours them for free — one
  token move, whole scene.

### Constraints

- WCAG AA is documented on `--dim` and `--option` (≥4.5:1 on both `--card` and
  `--bg`); every new value must preserve it — re-verify contrast after the
  shift, don't assume.
- Token-value change only; fills stay in their CSS classes, no structural
  churn. Theme transition and reduced-motion untouched.

### Acceptance criteria

1. The landing night palette sits in the same blue-black family as `/sheet`;
   no violet cast remains where he flagged it.
2. `--dim` and `--option` contrast ratios still pass AA on both surfaces.
3. Day theme handled per his ruling (see open point).

### Method

Visual — wants a look (§16). Prototype token values as a runtime override
against the built site, screenshot night (and day if touched), he rules, then
into `tokens.css`.

### Direction 2026-07-23 — day theme (assistant's proposal, pending his look)

Caveshen delegated the day-theme call ("open to suggestions… from you").
Proposal, to be shown in the prototype beside the night reskin: shift the day
theme off teal/sage to a **cool coastal blue** mirroring `/sheet`'s day
(`#d7e9f4 → #e7f0f5`) — pale sky-blue ground, cool slate-blue mountains, a
clearer blue sea — while **keeping the warm gold sun** (`--celestial`
`#f2b544`). This gives day/night symmetry: a warm celestial body (sun / moon)
over a cool ground in both themes. Warm cream `--text` and the cream `--card`
are kept for legibility and warmth.

### Decided

- Warm gold/cream accents (`--celestial`, `--moon`, `--text`) are **kept** in
  both themes as the deliberate warm counterpoint to the cool ground.

### ~~Open (his look)~~ — CLOSED 2026-07-24

Signed off on the prototype ("love your proposals, let's commit to that
palette") and shipped in `2ddc259`. Night is blue-black, day took the proposed
cool-coastal-blue, warm accents kept. `src/tests/theme.test.js` re-verifies
every contrast pair against the live token values, so the AA guarantee moves
with the tokens rather than being asserted once.

**One consequence went unnoticed at the time and is now logged in §7:** the
palette move orphaned `docs/render-og.js`, which still renders the OG and
apple-touch images from the retired violet values. `public/favicon.svg` was
hand-patched to the new `--bg` (`05ce607`) but its *generator* was not.

---

## 26. Normalising the mountains — Devil's Peak + soften Lion's Head

Requested by Caveshen 2026-07-23 ("I have been asked to add Devil's Peak… and
to soften the top of Lion's Head"). **BUILT AND ACCEPTED 2026-07-24**
(`789c692`, after one rejected pass — see the as-built block at the foot).

### What this is

Two edits to the authored skyline in `CityScape.astro`:

1. **Add Devil's Peak** — the fourth massif of the Table Mountain group, not
   currently drawn.
2. **Soften Lion's Head** — its apex is a sharp point today (polygon apex
   `803,149` between shoulders `785,201` / `825,201`). Round or blunt it.

### Placement note — confirm on the look

The scene reads with the **coastline on the right** (Signal Hill descending to
the §20 water). Devil's Peak conventionally sits at the eastern/inland end —
the **left** of Table Mountain in this orientation. That is the same flank
§20 filled with the industrial harbour (world-x ≈ −295…34). Mountains are
`f-far` (behind); industry is `f-near` (front) — so Devil's Peak would rise
**behind** the cranes, which is geographically right (the peak inland, the
harbour at the shore). Its base and scale must clear the cranes without
fighting them. Placement is not fixed; his call on the look.

### Constraints that bind

- **Table Mountain itself is the identity silhouette** and its §13 screen-space
  aspect invariant must still pass **unchanged** — do not touch its polygon.
  Devil's Peak is a NEW polygon; softening Lion's Head touches only Lion's
  Head's polygon.
- Authored once, rendered into all three cameras (§14) — pan/scale only, never
  stretch.
- Same flat `f-far` silhouette language and detail level; nothing that
  out-details its neighbours.
- Must stay legible and uncropped on a 390px portrait (§20 criterion 2 extends
  here).

### Acceptance criteria

1. Devil's Peak present and reads as part of the chain in all three variants.
2. Lion's Head apex visibly softened.
3. The Table Mountain aspect invariant (§13) still passes unchanged — proof the
   edit was additive/local, not a re-stretch.
4. Portrait still shows the full chain uncropped at 390px.

### Method

Visual — prototype, screenshot the three aspects, he rules, then repo.

### RULED 2026-07-23

- **Soft = rounded, still pointed.** Lion's Head's apex should read as a
  rounded edge rather than a sharp peak, but stay **quite pointed** — round the
  tip, do not flatten it into a cap.
- **Devil's Peak placement accepted:** left flank, rising behind the §20
  harbour as `f-far`, per the placement note above. Exact height/position
  settled on the prototype look.

### AS BUILT 2026-07-24 — the geometry, and the one rejected pass

Recorded because these are hand-tuned numbers that a future edit could undo
without noticing, and because the first attempt failed in an instructive way.

**Rejected v1.** The Lion's Head softening was applied by *replacing* the
polygon rather than blunting its tip, which destroyed the body: Caveshen saw
"a random triangle in the air where I suspect Lion's Head was MEANT to be."
The lesson is the one §26's own constraints already stated — softening touches
only the apex vertices, never the shoulders or base.

**Rejected v2 (`crop-dp-v3`).** Devil's Peak descended at roughly 45° into a
saddle that dropped *below* Table Mountain's plateau. His steer: "instead of
that 45 degree line down from Devil's Peak, look for a 15 degree line towards
Table Mountain, just enough to indicate a peak but not so much that it dips
below Table Mountain."

**Accepted (`CityScape.astro`).** Approved as "You nailed it king".
- **Devil's Peak** — a NEW polygon, `points="-80,352 70,93 200,124 240,352"`.
  Apex at `y=93` sits genuinely above Table Mountain's `y=104` plateau, as
  asked. The descent from apex to `200,124` is the shallow saddle; the
  crossover lands at Table Mountain's plateau shoulder (`y≈120`) so the saddle
  never dips below it. **Painted FIRST**, before Table Mountain, so Table
  Mountain's own polygon overlaps and masks the right-flank descent — that
  paint order is load-bearing, not incidental.
- **Lion's Head** — softened in place, apex only:
  `points="695,352 785,201 795,156 803,151 811,156 825,201 915,352"`. The old
  single sharp apex `803,149` becomes three vertices (`795,156` / `803,151` /
  `811,156`), reading as a rounded edge while staying "quite pointed" per the
  ruling. Shoulders and base are untouched.
- **Table Mountain — not touched**, as constrained. Still
  `40,352 130,187 190,120 230,109 300,104 480,106 540,114 585,167 640,352`,
  and its §13 screen-space aspect invariant still passes unchanged.
- Lion's Head and Signal Hill were also *translated* left (65 and 40 units) to
  close the gap the wider world opened; that is a placement change, not a
  reshaping.

Guarded by a Devil's Peak regression test in `e2e/approach.spec.js`, proved to fail
on revert. A screenshot-timing trap was found while testing and is worth
knowing: `transition: fill 0.4s` on the mountains means a screenshot taken too
soon catches them mid-theme-fade — the test waits 500ms.

---

## 27. A second character — the Badger avatar

Requested by Caveshen 2026-07-23. **BUILT 2026-07-24** as the approved
scene-matched Badger plus the interim TEST-ONLY toggle (see below); the real
figure-vs-Badger selection mechanism remains open. A secondary option for the
on-stage character: alongside the current hooded figure, his commissioned
**Badger** avatar (his identity across most sites), selectable "depending on
who I decide is the subject being spoken to."

### Rights — this one ships

The Badger is **commissioned, paid for, full rights** (his words). It is **not**
the inspiration-only decal (`2a84c08…jpg`, which is never to be shipped or
traced) — the Badger may enter the repo and ship. Source:
`E:\Internet Downloads\Downloaded Pictures\BadgerUP.png` (front-facing cartoon
badger, ~55 KB). Bring it into the repo as a tracked asset during
implementation.

### The design question this item exists to answer

The scene is flat monochrome silhouettes; the hooded figure is authored SVG.
The Badger is a detailed, shaded cartoon **raster**. Dropped in as-is it risks
out-detailing the whole world — the exact failure mode §20 kept guarding
against. Two directions to prototype and choose between:

- **As-authored** — place the Badger as a full-colour/detailed foreground
  character, accepting it as a deliberate focal contrast against the flat scene.
- **Scene-matched** — reduce it toward the scene's silhouette/tonal language so
  it belongs to the world.

Caveshen: "try fitting it into the scene **accordingly**" — the "accordingly"
is precisely this call, and it is resolved with a look, not in the abstract.

### Mechanism

- A selector for which character occupies the stage — hooded figure vs Badger
  — chosen by **content/subject**, not by the visitor. Likely a prop/config
  value (site-wide, or per-dialogue if the subject varies by conversation).
  Keep it simple; no visitor-facing toggle UI unless he asks.
- The two characters differ in silhouette and size, so everything measured off
  the figure must adapt for the Badger: the approach-prompt placement (D1/D2 —
  today 13 px above the hooded head, measured off `.face-void`), the camera
  face-target (§13 `faceTargetY`/`faceY`), and the zoom framing (§21). The
  Badger needs its own equivalent anchor, not the figure's.

### Constraints

- A raster will **not** theme like the SVG (it won't recolour night/day).
  Decide its day/night treatment — two assets, a CSS filter, or accept it sits
  constant. Flag on the look.
- Accessibility: the character carries a functional `aria-label`/`role` like the
  current figure (functional labels are exempt from the `PLACEHOLDER` rule).
- Perf: one raster is cheap, but size/optimise it for its displayed dimensions
  rather than shipping the full-res PNG (success criterion 6). Confirm nothing
  identifying is baked into the committed filename/metadata (no-PII rule).

### Acceptance criteria

1. ~~Both characters selectable~~ **PARTIAL** — the scene renders coherently
   with either (✅), but "selectable" is currently satisfied only by the
   TEST-ONLY toggle below. The real mechanism is open.
   **RESOLVED 2026-08-01 by d17:** "selectable" is answered by the *route*,
   not by a control — each page renders exactly one character and there is no
   selection mechanism to build.
2. **MET.** Prompt placement, camera face-target and zoom framing are computed
   from whichever character is on stage: `positionPrompt()` and the camera both
   query the shared `.js-character` class and pick the one with `width > 0`,
   and framing reads that character's own `.face-void`. The Badger carries its
   own marker, so nothing is measured off the figure.
3. **MET.** Day = as-is under the scene-matched filter; night = additionally
   darkened. Applied via CSS filter on the raster.

### Method

Visual — wants a look. Prototype the two fitting directions above, he rules,
then repo.

### RULED 2026-07-23

- **Show both.** Prototype **both** fitting directions — as-authored and
  scene-matched — for his choice; neither is pre-selected.
- **Day/night (assistant discretion, granted):** day = the Badger **as-is**;
  night = the Badger with **subtle shadowing / darkening** over it.
- **Still open (resolved when built for real, not needed for the prototype):**
  what drives the selection — a single site-wide subject vs per-dialogue.

### Interim selection — TEST-ONLY toggle (Caveshen 2026-07-24)

Caveshen hasn't settled the real subject-selection mechanism ("I genuinely
don't know at the moment"). **For now:** a temporary toggle button beside the
day/night toggle flips the on-stage character between the hooded figure and the
Badger, purely for testing. **This button MUST be removed before shipping** —
it is scaffolding, not the final mechanism; the real figure-vs-Badger selection
(site-wide vs per-conversation) stays open and is decided later.

What is REAL and stays (the approved visual): the Badger asset in-repo (from
`BadgerUP.png`, full rights, committed under a neutral name), a self-contained
Badger component, the **scene-matched** treatment (`grayscale(1)
contrast(1.05) brightness(.95)`; night additionally `brightness(.7)`) and the
ground drop-shadow lifted from the hooded figure. Only the visible toggle
button and the "render both, switch by a UI control" wiring are throwaway.

Replacement safety: the scaffold carries a greppable `INTERIM-TOGGLE` marker
and a `ponytail:` note so `/ponytail-debt` tracks it. **It now ships** — d8
discarded the dev-only gate 2026-07-31 and §23's checklist item 2 is struck;
it stays until d17 lands. The Badger's approach/zoom framing
reuses the existing `.face-void` mechanism (the Badger carries its own face
marker) so the camera frames whichever character is active.

**Scaffold extent:** grep `INTERIM-TOGGLE` in `src/pages/index.astro`;
plus all of `e2e/badger.spec.js`. Default with no JS and no `data-character`
attribute is the hooded figure, and the toggle deliberately does **not**
persist to localStorage — it is scaffolding.

**CLOSED 2026-08-01 — see `## d17`.** Caveshen ruled one character per route:
the Badger owns `/`, the hooded figure owns `/404`. The scaffold is **deleted,
not replaced** — there is no selection mechanism to build.

### Open, carried from this section into §29 / the cutover

Three things the build did not close, recorded so they are not lost:

1. ~~**The real selection mechanism** (site-wide subject vs per-dialogue) — still
   Caveshen's call. Everything else here ships; this is the only reason the
   toggle exists.~~ **CLOSED 2026-08-01 by d17 — neither. The route selects,
   and the toggle is deleted rather than replaced.**
2. ~~**The perf constraint above is UNMET.** `public/badger.png` is the full
   500×500 source displayed at ~200px.~~ **MOVED 2026-08-02 to `## d26` item
   7.** It is byte debt with no design question attached, and d26 is where byte
   debt is collected. Filenames, for anyone following the old text: the assets
   are `public/badger-up.png` and `public/badger-down.png`.
3. ~~**The approach prompt's copy is figure-specific.** It reads "PLACEHOLDER:
   Approach the hooded figure" regardless of who is on stage.~~ **CLOSED
   2026-08-02 by d17.** Caveshen supplied both lines as final copy, one per
   route — `Approach the badger` and `Approach the hooded figure?`. See d17's
   Copy ruling; the question mark is deliberate and byte-exact.
4. **The accessibility constraint was met differently than written.** The
   constraint says the character carries a functional `aria-label`/`role` like
   the figure; the Badger's was **deliberately removed**. Reason: the scene
   SVG carries `role="img"` with its own label, which makes it a single atomic
   accessible object and *prunes* nested labels — a label on the Badger would
   have been dead weight, and two labelled characters inside one `role="img"`
   is incoherent besides. The character is inert to assistive tech by design;
   the dialogue carries the meaning. Recorded as a deviation, not a defect.

---

## 28. Dialogue fade-in on zoom

Requested by Caveshen 2026-07-23. **BUILT (2026-07-23, `7eced29`) — seen live
and accepted 2026-07-24**, in the same preview that closed §17.2 and §24. "A
tiny fade-in when the zoom-in happens after the hovering button is clicked."

**Implementation:** `.card`'s existing transition list gains
`opacity 380ms ease 170ms, transform 380ms ease 170ms` (170ms delay + 380ms
duration lands at 550ms, syncing the fade's end with the §21 zoom's end). A
JS-only `.card-entering` class (`opacity: 0; transform: translateX(-50%)
translateY(6px)`) supplies the starting state — added at init alongside the
existing `card.hidden = true`, and re-armed by `exit()` — never a static
`.card` rule, so the no-JS card (which never runs this script) stays fully
visible per the progressive-enhancement trap. `approach()` removes the class
after a forced reflow (`card.offsetHeight`) so the opacity:0 frame actually
paints before the transition fires; under reduced motion it removes the
class synchronously with no reflow, so no frame is ever painted with it
applied (transition is also `none` there, via the existing catch-all
reduced-motion block, which already covers `.card`). Tests added in
`e2e/approach.spec.js`, each proven to bite on a targeted revert.

### What this is

Today the dialogue card appears **instantly** on approach — flagged under §22
("dialogue is instant… to be workshopped"). This is a small, self-contained
down-payment on that: on approach, as the camera zooms in (§21 entry, 550 ms),
the dialogue **fades in** gently instead of popping. Emphasis on **tiny** — a
soft reveal, not a slow curtain.

### Scope

- An opacity transition (optionally a few-px rise) on the dialogue card,
  triggered by the same approach that already fires the §21 zoom.
- Timed **with or just trailing** the zoom so the card arrives as the camera
  settles rather than competing with it — exact offset decided on the look.
- Down-payment only; the broader §22 dialogue rework (sequenced/typewriter
  reveal, etc.) remains its own item.

### Constraints

- `prefers-reduced-motion: reduce` — no fade; the card appears immediately,
  consistent with §21's reduced-motion skip.
- No-JS path unaffected — the card is already visible without JS; this only
  touches the JS approach flow.
- Cheap: a CSS transition on one element, no new timers beyond what approach
  already runs.

### Acceptance criteria

1. On approach, the dialogue fades in over a short duration rather than
   appearing instantly.
2. Under reduced motion, no fade — immediate.
3. No-JS behaviour unchanged.
4. Interrupt (approach then Escape mid-zoom) leaves no half-faded stuck card
   (mirrors §21 criterion 5).

### Method

Feel — a quick look to confirm "tiny" reads right, but small enough to also
assert in the suite (opacity transition present on approach; absent under
reduced motion).

---

## 29. Badger two-frame idle animation

Requested by Caveshen 2026-07-24. **BUILT AND ACCEPTED 2026-07-26** (see the
as-built block at the foot). Give the §27 Badger a simple, characterful idle by
animating between two commissioned frames — arms up and arms down.

### What this is

- **Two frames**, both full rights, both 500×500 (same canvas as the shipped
  up frame, so they register — only the arms move):
  - **up** — the current asset (`public/badger.png`, from `BadgerUP.png`).
  - **down** — new asset (from `E:\Internet Downloads\Downloaded Pictures\BadgerDown.png`),
    to enter the repo under a neutral name alongside the up frame.
- Alternate the two to produce a gentle looping idle (arms bobbing up/down) —
  a two-frame sprite swap, **just the two frames for now**.
- **Future (noted, NOT now):** interpolate in-between frames (tweening) for a
  smoother motion. Explicitly out of scope for the first build — two frames
  only, per "for now, let's keep to just two".

### Scope / constraints

- Only relevant when the Badger is the active character (§27); the hooded
  figure is unaffected.
- Both frames carry the §27 scene-matched treatment (grayscale/contrast,
  darker at night) and the same ground shadow — the swap must not make the
  filter or shadow jump.
- Registration: both frames are 500×500 with the body/feet in the same place;
  confirm on a look that only the arms move and the feet/shadow stay planted
  (no vertical jump between frames).
- **Honours `prefers-reduced-motion`:** under reduced motion, no animation —
  hold a single static frame (up).
- Cheap: a two-frame swap on a timer / CSS steps animation, no per-pixel work,
  no new dependency; must not threaten Lighthouse ≥95 (criterion 6).
- No-JS: a single static frame is fine (as today).

### Open points (feel — his look)

- **Cadence** — how fast the two frames alternate (a slow ~0.6–1s bob vs a
  quicker wave). Feel call on a look. **Still open** — see the staging block.
- ~~**Naming**~~ — **DECIDED (implementer's discretion, as granted):** rename
  `public/badger.png` → `badger-up.png` alongside `badger-down.png`. The two
  frames are equal citizens now; leaving one called `badger.png` would imply a
  primacy that stops being true the moment the idle runs. One-line change in
  `Badger.astro`, and `src/tests/hygiene.test.js` does not reference the filename.

### STAGED 2026-07-25 — registration measured, not eyeballed

Staged 2026-07-25: frames measured 500×500, feet planted to 1px, head sits 23px
lower in the down frame (a ~10px bob at display size — read as breathing, not a
broken swap, which is why cadence mattered). Recommended 800ms; it held.

### Method

Prototype/screenshot both frames composited, confirm registration and cadence
on a look before it enters the repo — like §16, the *feel* isn't suite-judgeable
(the suite can assert both frames exist and that reduced-motion holds a single
frame).

---

### AS BUILT — 2026-07-26

Built, reviewed on local dev by Caveshen, accepted. **Cadence stayed at 800ms**
per frame (1.6s cycle) — the staged recommendation held on the look.

- `public/badger.png` renamed to `public/badger-up.png`; `badger-down.png` added
  from the commissioned second frame. XMP checked on both: Adobe Photoshop tool,
  dates and edit history, **no PII**.
- Two stacked `<image>` elements, swapped by a CSS `steps(1, end)` keyframe pair
  — a hard cut, no cross-fade. **CSS only, so it works with JavaScript
  disabled**, asserted by test rather than assumed.
- One constant: `--badger-cadence: 800ms` on `:root` in `Badger.astro`; the
  animation duration derives from it as `calc(var(--badger-cadence) * 2)`.
- `prefers-reduced-motion: reduce` holds the up frame with `animation: none`.
- Shadow and filter are shared by both frames, so neither jumps.

**Raster left alone, deliberately.** §27's open point assumed the 500x500 source
was oversized for a ~200px display. Measured: 200 SVG units × the figure's scale
× the viewBox ratio is ≈384 CSS px at 1920 wide, and ≈1024 device px at 2560
with HiDPI. The source is correct and mildly *under*-sized on large high-DPI
displays. **The right answer
to "optimise this" was "don't"** — §27 open point 2 is closed on that basis.

Tests: 5 unit + 5 e2e (frames served, reduced-motion holds one frame, and the
no-JS animation assertion). Suite 1309 passed / 3 skipped at the time of landing.

**One defect found in review, and it was not the code.** Caveshen reported the
Badger going invisible for half of every cycle. The opacity swap measured
correct; the dev server he was given had been started before the second frame
existed and served `/badger-down.png` as a 404, so the swap was faithfully
revealing a missing image. Restarting the server fixed it. **When a bug report
contradicts a passing test, check what the browser is actually being served
before suspecting the code.**

---

## 30. Technical debt ledger

Assembled 2026-07-26 at Caveshen's request ("let's clean up the house"), from a
read-only sweep of all 31 source files plus `/ponytail-audit` and
`/ponytail-debt`. Items are **independently schedulable** — one per session, any
order — except where marked BLOCKED.

**Headline: there is no dead code.** Every component, script export, token,
`public/` asset and npm dependency is referenced. Nothing to delete outright.
What the codebase has is a single recurring disease: **something authored once,
then copied by hand.** Every item below is a case of it.

### Method note — the ledger grep under-reports

`/ponytail-debt` greps for `ponytail:` at the *start* of a comment. Four markers
are embedded mid-comment and were silently dropped, including the three that
constitute the §27 scaffold — the largest single deletion in the tree. **Grep the
bare token, not the comment prefix.** True count: 15 markers, 9 with no trigger.

Only two markers name a trigger that has actually fired: `render-og.js:17`
(fired four times, unnoticed each time) and `playwright.config.js:27`.

---

### D-1 — Extract the sky and foreground layers (LARGE, highest value)

`src/pages/index.astro` triplicated the sky/foreground layers (moon, sun,
clouds, stars, sea, glints) across three scene copies, hand-copied and
drift-prone. The fix: extract to components taking per-variant props, as
`CityScape.astro` already does for the world.

**AS BUILT 2026-07-26 — and the headline estimate was wrong.** Only the moon
glyph was genuinely triplicated. Extracted to `Moon.astro` (craters now offsets
from the moon's centre) plus a `CELESTIAL` constant, since moon and sun share a
centre per variant and each variant wrote that pair twice.

**Net cost: about +22 lines, not the ~85 saved this item originally claimed.**
`index.astro` is +16/−18; `Moon.astro` is 24 lines. The value is drift-proofing,
not line reduction — the same trade §14 made, at a similar price. Recorded so the
ledger is not read as a size argument.

**A `Cloud.astro` was built and reverted the same day.** The audit described the
day clouds as "triplicated". They are not — they are seven distinct rects at
seven distinct positions that merely share a fill. The extraction produced a
six-prop wrapper around a single `<rect>`, which is the `yagni:` "wrapper that
only delegates" this ledger exists to remove. **Lesson: verify that something is
genuinely authored twice before extracting it.** The audit's framing was taken on
trust and should not have been.

Stars, sea strip and glints were left duplicated deliberately — they differ per
variant by design (§14 permits foreground divergence).

Verified: pixel-identical render across all three variants in both themes; full
tri-engine suite 1269 passed / 3 skipped.

### D-2 — Rebuild `render-og.js` off the real scene — ✅ BUILT & ACCEPTED 2026-07-26

`docs/render-og.js:21-92` inlines a hand-maintained copy of the scene. It has
fallen behind on **every** scene change since it was written — §14 positions
(Lion's Head 65px, Signal Hill 40px), §20's harbour (absent entirely), §25's
palette, §26's Devil's Peak. Four for four. Its own header claims "Pattern
mirrors `docs/render-cv.js`" — it does not: `render-cv.js` does
`page.goto(pathToFileURL(docs/cv.html))`, rendering a real source file. The
correct pattern has been one file away the whole time.

**Caveshen's ruling 2026-07-26:**
- Camera: reuse `CAMERA.std` (viewBox 1200×750 vs OG frame 1200×630 — near enough)
- Keep the "CAVESHEN RAJMAN" title overlay, composited on
- **Scenery only** — no figure, no Badger. "The OG should read as a place, not a
  scene mid-dialogue."

Side benefit: §20's harbour finally appears in the OG image.

Note: the interim palette/geometry patch (uncommitted as of 2026-07-26) makes the
shipped assets correct *today*. This item supersedes it structurally.

**Do not remove** the hand-built ICO container header (`render-og.js:147-159`).
Node ships no ICO writer; a dependency would be the worse trade.

~70 lines saved. Independent.

### D-3 — Give the hooded figure a day/night treatment — ✅ BUILT & ACCEPTED 2026-07-26

`HoodedFigure.astro` has **zero** day/night hooks and 14 hard-coded hex fills.
`Badger.astro` dims at night. The two characters occupying the same slot behave
differently.

Worse, `Badger.astro:43` justifies its own filter by saying a raster "can't
recolour like the SVG figure's literal-hex fills" — describing a capability the
figure has never actually used. The comment documents an intention that was never
built.

**Caveshen's ruling 2026-07-26: option (b) — build it.** Mechanism (filter to
match the Badger, vs tokenising the fills) is open; it is a look question and
wants his eye on the result, not a decision in the abstract.

Independent.

### D-4 — moved to **d1** (the interactive 404); see the status board and
`## d1` near the end of this document for the full record, including its
follow-ups d3/d4/d5.

### D-5 — `playwright.config.js:27` → `devices['Pixel 8']` — ✅ DONE 2026-07-26

The `ponytail:` comment says "update when PW adds a Pixel 8 descriptor."
Verified 2026-07-26: `Pixel 8`, `Pixel 8 Pro` and `Pixel 8a` all ship in the
installed `@playwright/test`. One-line swap. Independent. Do this first.

### D-6 — moved to **d8** (dev-only gate); see the status board and `## d8`
near the end of this document.

### D-7 — `docs/research-avatar-scene.md` records a recommendation that wasn't built — ✅ DONE 2026-07-26

`:329-343` recommends "#1 — separate SVG avatar, isolated from the scene." What
shipped is its own second-ranked option: `HoodedFigure` as a `<g>` inside each
scene SVG. Nothing depends on the doc being current.

**Annotate, don't rewrite** — it is a dated research artefact and correctly
records what was thought at the time. One dated line noting what was actually
built is sufficient.

---

### D-8 — moved to **d10** (`banner-plane.spec.js` timing race); see the status board
and `## d10` near the end of this document.

---

### D-9 … D-13 — moved to **d11–d14** (D-11/clouds moved to **d4**); see the
status board and `## d11–d14` / `## d1` (d4 nests there) near the end of this
document.

---

### Decisions recorded — no action required

**Icon moon stays the warm disc (RULED 2026-07-26, option b).** `favicon.svg`,
`apple-touch-icon.png` and `favicon.ico` draw `#ffd75e`/`#e6b944`; the scene's
moon has been the pale `--moon`/`--crater` since the P4 restage. This divergence
is **deliberate**: the icon is branding, not scene furniture, and a cream disc on
dark blue has markedly less punch at 32×32. `src/tests/hygiene.test.js` pins `ffd75e`
and should stay pinned. `favicon.svg:5`'s `ponytail:` comment already pointed
this way. **Recorded so it is not "fixed" later by mistake.**

**~~`AGENTS.md` and `CLAUDE.md` stay twins (RULED 2026-07-26)~~ — SUPERSEDED
2026-08-01: `AGENTS.md` is a pointer to `CLAUDE.md`.** The twins ruling reasoned
that two copies of a short instructions file is the cheapest way to serve both
conventions, and that a pointer risks an agent that will not follow it.

**Why it was reversed.** The ruling was never implemented and nothing enforced
it — no test, no CI check. `AGENTS.md` kept the Astro CLI boilerplate it was
scaffolded with (committed unread in `17dc448`), so the two files were never
byte-identical, and the boilerplate told agents *"use `astro dev --background`"*
while `CLAUDE.md` says **never** spawn `astro dev` (it daemonises and Playwright
aborts). Two instruction files that drift are worse than one plus a signpost.
`CLAUDE.md` is now the single source; `AGENTS.md` points at it and holds nothing
else. **Recorded so the twins approach is not re-attempted without an enforcing
test.**

---

### Explicitly not cut

- The hand-built ICO header (`render-og.js:147-159`) — no stdlib alternative.
- `camera.js` / `dialogue.js` as single-export modules — they exist to be
  unit-testable, which is earning its keep.
- All five npm dependencies are used.
- The nine no-trigger `ponytail:` markers are mostly benign rationale notes (the
  `matchMedia` guard, the pointer-events explanation) and should stay.
- `camera.js`'s optional `faceTargetY`/`faceY` params look like dead back-compat,
  but `src/tests/camera.test.js:17,27,37` deliberately call the function
  without them to exercise the defaults. **Do not delete them.** (Flagged by
  the 2026-07-31 code review — exactly the kind of thing a future cleanup
  would get wrong.)

### Ledger total

`net: ~-550 lines, -0 deps` — revised down from an initial ~-650 once D-1 turned
out to cost lines rather than save them. Most of the remaining figure is D-4
(391) and D-6 (~110), both of which are gated on decisions rather than effort.

**Amended 2026-07-27.** D-4's deletion is now authorised and unblocked, but the
net figure for it is **misleading**: the 391 lines come off, while the interactive
404 that replaces the mock adds a page, a component and a dialogue tree. **D-4 is
net line-positive.** It was always a drift-and-duplication item — a mock carrying
a hand-rolled copy of the engine and of `ThemeToggle` — not a size item. D-6
remains gated on §31, and **D-8 is a correctness item with no line argument at
all.** Which is the point the paragraph below already makes.

**Treat line counts here as the weakest argument for any item.** The real case
for every one of these is that something is authored twice and will drift; D-1
proved the size estimate can be badly wrong while the drift argument still holds.

---

### §30 build log — 2026-07-26

All five actionable items built and verified the same day. Full tri-engine suite
green after each (1269 passed / 3 skipped). Nothing in this ledger required a
new dependency.

**D-2 as built.** `file://` on the build output was tried first (to mirror
`render-cv.js` exactly) and **genuinely fails**: Astro emits root-absolute asset
paths that 404 outside a server root, and the module `<script>` is blocked by
CORS under `origin: null`. So the script now runs `astro build` → `astro preview`
→ `goto`. **It is no longer standalone** — that is the real cost of killing the
drift, and it is worth naming. It is also now Windows-coupled (`taskkill` to
reap the preview's process tree; `preview.kill()` only kills the shell wrapper).
Carries a `ponytail:` marker with the upgrade path.

Two things worth knowing:
- **A quirk in the `CAMERA.std` ruling:** at a bare 1200×630 viewport the media
  query selects the **wide** variant (the aspect ratio crosses `15/8`), so the
  script force-shows `.scene-standard`. The OG is therefore not literally "the
  page at 1200×630" — it is an override to honour the ruling.
- It also hides the §27 toggle pill and the page-foot chip, which were not in
  the brief but are plainly UI chrome.

**Accepted as-is by Caveshen, with a known trade recorded:** the composition is
worse than the hand-made poster it replaced. The bottom quarter is dead dark
foreground (where the figure normally stands), the title sits on it, and the
harbour crane is bisected at the left edge. His call: *"I'm fine to accept this
for now."* **The crop is the obvious future improvement** — shift the clip up,
pull the left edge off the crane. Correctness was the goal; composition was the
price.

**D-3 as built.** One CSS rule on `.hooded-figure`, mirroring `Badger.astro`'s
selector pattern. The 14 literal fills were deliberately **not** tokenised —
fourteen edits to achieve what one filter achieves is the over-engineering this
ledger exists to remove, and a single value retunes in seconds.

Shipped at `brightness(0.7)`, reviewed on local dev, **accepted at `0.8`** —
`0.7` cost the hood its edge against the sky and dulled the drawstrings.
`Badger.astro:43`'s comment, which claimed the figure recolours (it never did),
corrected to describe what actually happens.

Verified the filter does not leak into the scene: `.hooded-figure` wraps only the
figure's `<g>`, and an untouched build drifts up to 137 per pixel over 3.5s from
ambient animation alone — comfortably more than the background variance observed.
**Method note: the markup answered this in one grep; two pixel-diff experiments
were run first. Read the code before building the laboratory.**

---

## 31. Admin page (dev-only)

Raised by Caveshen 2026-07-26, in answer to the §27 selection question. Rather
than choosing a figure-vs-Badger mechanism, he re-framed it:

> "I suspect we'll need an admin mode for the site to help with toggling stuff.
> For now, let's scope it to dev mode so it doesn't show up in the hosted/prod
> version. Same buttons along the top-right, and we can hide them all — so in
> other words even the day/night toggle."

### What this is

A cluster of development affordances in the **top-right**, present when running
locally and **absent from the production build**. The §27 character toggle stops
being scaffolding-to-delete (§30 D-6) and becomes the first inhabitant.

### Consequences

- **§27's selection mechanism is deferred, not decided.** The toggle survives as
  a dev affordance. A real user-facing mechanism remains an open question.
- **§30 D-6 is re-scoped** from deletion to gating.
- The ship test changes from *"`grep REMOVE-BEFORE-SHIP` returns nothing"* to
  *"the production build contains no admin controls"* — which needs a real test,
  since a build-time gate that silently fails is worse than a visible toggle.

### RULED 2026-07-26 — the button goes, the feature stays

Asked whether the day/night toggle really disappears in production, given §3
makes it a signature feature. Caveshen:

> "Yes that's what I'm saying — keep the day/night toggle for dev mode, hide for
> production (along with the other button toggles we will add), but of course
> keep all of the functionality, as it could be very cool to make it interactive
> so that a dialogue option triggers the day/night cycle instead."

So the concern was misplaced. **The theme system is not being removed — its
trigger is being relocated**, from a piece of UI chrome to a narrative beat.

Three consequences, and the third is the point:

1. The toggle **button** is dev-only, alongside the §27 character toggle and
   whatever else joins the cluster.
2. **All theme functionality is preserved intact** — tokens, `data-time`, the
   `night-only`/`day-only` classes, `resolveTheme`, and every test that covers
   them. Nothing about the mechanism changes; only who can reach it.
3. **The intended replacement trigger is a dialogue option.** Choosing a line
   turns day to night. That is a better version of the feature than a button in
   the corner — the time of day becomes something the visitor *causes* rather
   than something they toggle.

**Point 3 is an idea, not yet a commitment** ("could be very cool"), recorded so
it is not lost. It needs no special provision in point 1: the dev build keeps the
button and the whole mechanism, and production only *hides the button*. The code
behind it is untouched either way, so a dialogue trigger can be wired up later
with nothing to unpick.

### Not yet designed

No mechanism chosen. `import.meta.env.DEV` is the obvious Astro-native gate and
costs nothing, but that decision belongs with the build, not here.

---

### SCOPE GIVEN 2026-07-26 — **IN DESIGN, no go-ahead**

Caveshen widened this considerably. §31 was "hide some buttons in production";
he has now described an **authoring mode for the site's content**. His words,
condensed:

> "Realistically what we need is a mode that configures the configurable parts
> of the site."

**A. Dialogue trees — fully editable.** Add, edit, remove and **re-order**
dialogue flows.

**B. Dialogue → action mapping.** A dialogue option can fire an action. The
actions themselves are **module-based and authored by us in code** — admin mode
never configures them, it only **exposes the available set as selectable
options** for a trigger. (The §31 RULED note above already names the first
candidate: a dialogue option that turns day to night.)

**C. Character sheet — every section editable, and it syncs to the CV.** Adding,
editing or removing work history, or changing a title, must update **both** the
character sheet **and** the ATS-friendly CV page. One edit, two renderings.

**C.1 — not one record rendered twice.** Refined by Caveshen 2026-07-26:

> "A CV can contain A LOT more details, but the character sheet contains more
> like 'headlines' or summarised versions — so perhaps a grouping of these?"

So the relationship is **projection, not mirroring**. The CV is the fuller
record; the sheet shows headline or summarised forms of the same underlying
entries. A naive shared object rendered by two templates does not express that —
the sheet is not the CV with fewer CSS rules.

Open, and **for `/wayfinder` to resolve** — recorded so the questions survive:

- Is the summary a **separate authored field** per entry (a role carries both a
  long description and a headline), or **derived** from the detail? Authored
  costs discipline; derived costs fidelity.
- What is the unit of "grouping"? Per entry, per section, or a named view
  ("sheet" / "cv") that selects fields?
- Which side is the source of truth when they disagree?
- Does anything appear on the sheet that has **no** CV counterpart — the
  game-flavoured framing (stats, traits, class) may be sheet-only by nature.

**Today's state, for whoever picks this up:** `src/pages/sheet.astro` and
`docs/cv.html` (which renders `public/cv.pdf`) are authored entirely separately.
There is no shared data file — `src/data/` holds only `dialogue.json`. This is
the same authored-once-copied-by-hand disease §30 exists to treat, and it is
already live in the repo, independent of whether an admin page is ever built.

**No code.** Constraints noted; design deferred.

His own caveat, recorded verbatim because it is the crux:

> "All of this may be extremely overkill, since I could just work with you on
> editing the site directly — either way I own the source code and can do this."

**Status: IN DESIGN.** Scope captured, **not approved, not scheduled.** Caveshen
is considering whether this warrants a `/wayfinder` exercise rather than a
straight build.

#### The open question this scope must answer first

**Today** this is a static site on GitHub Pages: no server, no database, so an
authoring mode has nowhere to write. Every version of A/B/C above is easy in the
browser and hard at the point of *persistence*.

**But "today" is the operative word,** and the PRD already says so — §6 names
the purchased domain + **personal** Cloudflare account as the later hosting
target, §10 lists "Custom domain + Cloudflare setup" as out of scope *for now*,
§12 notes the repo can go private at that cutover, and §13 says the suite "later
ports unchanged to the Cloudflare pipeline". §10 already anticipates a small
Worker for the contact form. Caveshen, 2026-07-26: *"the GitHub static page is a
TODAY thing… this may become a hosted site — I am considering Cloudflare + some
domain host. It would be a much much much later thing."*

So persistence is **not a wall, it is a dependency** — and the standing
constraint is the ordering:

- **Admin mode must not be the thing that forces the migration.** If the design
  concludes "this needs a Worker and a KV store", that is a finding to hand to
  the hosting decision, not a licence to bring the hosting decision forward.
- Anything achievable under today's constraints — export-a-JSON-file, edit-in-
  browser-then-paste-into-the-repo, or simply better-structured source data —
  can proceed on its own merit.
- The wider question ("what *is* the platform?") outranks this section and is
  not §31's to answer.

Recorded as a question, not a recommendation.

Nothing about C is blocked by it, incidentally: a **single source of truth for
CV data, rendered twice**, is worth having whether or not an editor ever exists
— today the character sheet and the CV page are authored separately, which is
precisely the "authored once, copied by hand" disease §30 was opened to treat.

#### RULED 2026-07-26 — one section, not two

A split was proposed (gate here, authoring mode elsewhere). **Rejected.**
Caveshen:

> "No, it's one job — you are taking me very literally. I am now explicitly
> saying, this IS the scope of an admin page, and my first mention of this was
> the toggle buttons."

So §31 is **the admin page**, whole. The dev-only toggle cluster was never a
separate feature — it was the first thing that happened to need one. Read the
RULED note above in that light: the gate is §31's **first inhabitant**, not its
definition.

This is a scoping ruling, not a sequencing one: the gate remains individually
buildable as §31's first slice, so **§30 D-6 and the §23 cutover are not held
hostage** to the authoring design.

---

## 32. Social preview imagery — creative pass

Raised by Caveshen 2026-07-26, on seeing the rebuilt OG image (§30 D-2):

> "We should actually workshop those images as well later — I would much rather
> have creative control over those images. Accept for now, PRD item for later."

### What this is

`public/og-image.png` (1200×630) and `public/apple-touch-icon.png` (180×180) are
currently **derived automatically** from the live scene. §30 D-2 made that
derivation faithful, which killed four years' worth of silent drift — but
faithful is not the same as composed.

The current OG is a crop of a page designed to hold a character in its lower
third. With characters stripped for the social card, that space reads as dead
foreground, the title sits on it, and the harbour crane is bisected at the left
edge.

### The tension to resolve — this is the actual design question

Automatic derivation and creative control pull in opposite directions:

- **Derived** (today) — can never again show a scene the site does not have.
  That property was expensive to win and should not be given back casually.
- **Composed** — looks deliberate, but reintroduces exactly the drift §30 D-2
  spent the day eliminating.

**A hand-authored poster is not an acceptable answer on its own** — that is
precisely what was just retired, and it drifted on all four scene changes.
Anything composed needs a mechanism that keeps it honest.

Middle grounds worth exploring when this is picked up: tune the crop and camera
of the derived render; add an OG-specific camera to `index.astro` alongside the
existing three so the framing is authored *in the scene* rather than beside it;
or compose from the real components at an OG-specific layout.

### Constraints

- **Art assets are Caveshen's** (standing rule). No generated artwork. Sculpt in
  SVG and web elements, or he supplies it.
- Must survive a scene change without human intervention, or carry a test that
  fails when it stops matching.
- Also covers `apple-touch-icon.png`. **Not** `favicon.svg` / `favicon.ico` —
  those are the warm-disc brand mark, deliberately divergent (see §30's recorded
  decisions), and are out of scope here.

### Status

⏸ **NOTED, not scheduled.** Current images accepted as-is in the meantime.

---

## 33. The card avatar — extract, then refine

Raised by Caveshen 2026-07-26, answering §30 D-4's "does the 404 get characters?"

> "No characters, but there is that avatar drawn in there, and in a prior PRD
> version I noted wanting to go edit that avatar — I still want that, and I
> suspect it would become its own component that exists across dialogues,
> perhaps even as part of the dialogue engine itself."

### Which avatar this is

**Not** the hooded figure (§14) and **not** the Badger (§27). This is the small
blinking portrait in the dialogue card's head — 64×64, abstract, sitting beside
the name. §3 lists it as a micro-signature to keep: *"blinking avatar (abstract
placeholder until real art exists)"*. §7 already noted *"real avatar art
optional, later"*; this section is that "later", now with scope.

### Extraction — justified today, not speculative

The same 11-line SVG is authored **twice right now**: `main:index.astro:209` and
`src/pages/index.astro:260`, byte-identical. The 404 (§30 D-4) makes it three.
That is precisely the authored-once-copied-by-hand disease §30 exists to treat,
and unlike the `Cloud.astro` misfire it is **verified duplication**, not
inferred. It also carries live CSS: the `.eyes` blink animation, a
`prefers-reduced-motion` opt-out, and `--avatar-ring` / `--hair` tokens.

Extract to an Astro component alongside `Badger.astro` and `HoodedFigure.astro`.

#### CORRECTED 2026-07-27 — the count is cross-branch, and it doesn't change the call

Re-verified before building. On `item/landing-v2-avatar` the avatar is authored
**once**, at `src/pages/index.astro:259`. The second copy is on `main`, a
different branch — and `main`'s copy is deleted by the §23 cutover. So "authored
twice right now" counts a copy already scheduled for demolition; on the branch
that survives, today's count is **one**.

The justification is therefore **not** existing duplication. It is that **D-4 is
next and fully specified** and needs this avatar. Extracting first means the 404
consumes a component; extracting after means hand-copying the SVG a third time
and then unpicking three copies. Same decision, sounder footing — recorded so
the §30 ledger isn't resting on evidence that won't survive the cutover.

#### SEQUENCING RULED 2026-07-27 — extraction first, ahead of D-4

Caveshen's go, 2026-07-27, on the **extraction half only**. §33 splits in
delivery, not in scope:

- **33a — extraction.** ✅ authorised. Pure refactor: no visual change, no
  behavioural change. Blink cadence, theme transitions and the reduced-motion
  opt-out preserved verbatim; suite stays green.
- **33b — art refinement.** ⏸ still IN DESIGN, needs a brief. No generated art;
  SVG sculpting only.

### "Perhaps part of the dialogue engine itself" — RECOMMENDED AGAINST, not ruled

`src/scripts/dialogue.js` is logic: pure functions plus `initEngine`. The avatar
is presentation. Putting artwork inside the engine welds the two together and
gives the engine a reason to change that has nothing to do with dialogue.

The recommendation, if per-node portraits are ever wanted: **the tree names the
speaker, the engine passes the value through, the component decides what to
draw.** The engine stays ignorant of art; the avatar stays a component. That
delivers "an avatar that exists across dialogues" without the weld.

**Caveshen's call. Recorded as a recommendation only.**

### Refining the art

Standing rule applies: **no generated art assets.** The current avatar is
sculpted SVG, so refining it in SVG is in bounds; anything else Caveshen
supplies. Direction not yet given — "I still want that" establishes intent, not
a brief.

### Status

✅ **33a extraction BUILT & REVIEWER-APPROVED 2026-07-27.** `Avatar.astro`, no
props (one caller at the time; the 404 became the second within the hour).
`index.astro` net −22 lines, rendering byte-identical. Pending Caveshen's visual
review; **not committed**. One follow-up logged as **d13** (was §30 D-12,
`is:global` where scoped would do).

🎨 **33b art refinement remains IN DESIGN** — awaiting Caveshen's brief. No
generated art; SVG sculpting only.

---

## Outstanding work — `d` items

Sections below are the live counterparts of the status board's `d` numbers.
Each carries a "was" link note to its previous `§`/`D-` identity. These
sections **moved here from `§30`'s nested `D-n` subsections** (their old
locations now hold a one-line pointer, so nothing is duplicated); `d6`–`d8`
are new. `d2`, `d9`, `d15`, `d16`, `d18`–`d21` are not repeated here — their
detail still lives at the `§` heading named on the board, unchanged.

## d1. The interactive 404 (was §30 D-4)

> **DISPOSAL AUTHORISED 2026-07-27.** Caveshen: *"You can retire design-sample-c
> completely, once 404 'proper' is ready, even immediately before any reviews, as
> we can always refine the 404 going forward with design-sample-c deleted
> forever. I'm at peace with that."*
>
> This resolves the ambiguity in "retired once the 404 exists" below: **"exists"
> means built, not reviewed and not merged.** The file is deleted as soon as the
> 404 lands on this branch. It is **not** a rollback source — git history is.
> Refinement of the 404 proceeds without it.

391 lines. Nothing imports it. Carried the retired violet palette, a hand-rolled
duplicate of the `dialogue.js` engine (`:320-391`), a duplicate of
`ThemeToggle.astro`'s logic (`:381-388`), and a `ponytail:` comment citing
"Samples A and B" — files that no longer exist.

**Entangled with §23** (the attic / interactive-404 question). Note the
distinction that matters: this is the *design mock*. The thing §23 preserves is
the built `main` landing. They are not the same artefact and must not be
conflated.

**d1 is independent of §23** (the dependency inverted — see REFRAMED below).
The 404 takes the built `main` landing's design, restyled to current tokens;
`design-sample-c.html` retires on delivery.

**Caveshen 2026-07-26:** *"Recall I wanted that mock for the 404 page, if that's
done then we can retire it."*

**RESOLVED 2026-07-26.** Asked which artefact the 404 gets — the mock, or the
built `main` landing. Caveshen:

> "The 404 page should get exactly the landing page that is on main today, ie.
> the sample-c with a simple dialogue screen in the middle (although, with our
> new CSS / styling, instead of the old purple-based theme)."

### REFRAMED 2026-07-26 — the 404 is its own component; **d1 no longer depends on §23**

Caveshen:

> "I don't even think you need §23's archive — you can get it off the git diff
> since it's currently on main, and then hook it into the 404 page as its own
> component, so we inherit themes and styles, but can build a second, separate
> dialogue tree in its own json file with its own dialogue options. Realistically
> it's a fancy 404 page that takes the same design as the currently-deployed
> version of the site from main, but as its own component entirely. We can still
> re-purpose the scene we built for the background. We can still apply themes,
> day/night toggles, all other styling."

**The dependency inverts.** The old ordering was §23 archives the landing → the
404 mounts the archive → the mock retires. The landing is on `main` *right now*
and git is a perfectly good source for a one-time lift (`git show
main:src/pages/index.astro`, 414 lines). Nothing needs archiving first, so
**d1 is unblocked and buildable independently of §23.**

Shape:

- A **component of its own**, mounted in `src/pages/404.astro` (which today is a
  minimal card, 79 lines, and is replaced).
- **Layout** takes the currently-deployed `main` landing's design — the simple
  always-present dialogue card centred over the backdrop.
- **Background reuses the v2 scene we built** — not `main`'s older inline SVG.
- **Themes, day/night, tokens and all other styling are inherited**, not
  re-authored. The retired violet does not come with it (already ruled).
- **Its own dialogue tree, in its own JSON file**, with its own options —
  separate from `src/data/dialogue.json`.
- On delivery, `docs/design-sample-c.html` retires, per the ruling above.

**This costs nothing in the dialogue engine.** `src/scripts/dialogue.js` already
exposes `initEngine(tree, els, navigate, opts)` — the tree is *already* a
parameter. A second data file needs **no engine change**, which is the whole
reason this is cheap. Do not fork the engine.

**One trap, flagged rather than claimed:** `main`'s `index.astro` paints via
`fill="var(--token)"` presentation attributes. §14 established that this pattern
does not hold in v2, and every fill moved to CSS classes. Taking the v2 scene
rather than `main`'s sidesteps most of it — but **any markup lifted verbatim
from `main` must be re-checked against the class-based fill convention** before
it is trusted to theme.

#### ANSWERED 2026-07-26 — all six, plus the §23 consequence

1. **Camera — simpler than `/`.** Caveshen: *"the view is simpler, as it's a
   centralised dialogue, so as long as the page transforms so that the dialogue
   remains central and does not bleed out of screen, we are solid."* So the
   three-camera apparatus of §14 is **not** a requirement here. The success
   criterion is behavioural, not structural: **the dialogue stays centred and
   fully on-screen at every viewport.** How the background is framed behind it is
   an implementation choice, not a spec.

   **Not reversed, but overtaken 2026-08-01 (d17 + d12).** The 404 does gain the
   landing's three aspect-ratio variants — not because this criterion changed
   (it is still behavioural, and the card still simply has to stay centred and
   on-screen) but because the scene becomes a **shared component** and both
   routes render from it. `src/pages/404.astro`'s own comment anticipated
   exactly this: *"If this page ever needs the tri-variant rig, take it from
   index.astro rather than growing this one."* That is what happens. The waiver
   stands — nothing here *required* the rig, and nothing here forbids it.

   **SUPERSEDED IN ITS VERTICAL HALF 2026-08-02 (d17).** The criterion now
   reads **horizontally centred and fully on-screen, bottom-anchored**, exactly
   as `/`'s card is — the card does not appear at all until the visitor
   approaches. **d5's three geometry tests were re-aimed, not relaxed:** they
   approach first, and every X-centre and on-screen assertion survives verbatim.
2. **~~No characters — no hooded figure, no Badger.~~ — SUPERSEDED 2026-08-01
   by d17: the 404 gets the hooded figure.**

   **Why it was reversed.** d17 makes the route the character selector: one
   character per page, no selection UI at all. `/` keeps the Badger; the
   hooded figure moves here. So "no characters" becomes "exactly one
   character, and it is not the landing's". ~~The reasoning behind the original
   answer still holds where it was aimed — this page has no approach step and
   no camera zoom (answers 1 and 3, both untouched), so the figure here is
   scenery that happens to be a person, not an interactive NPC.~~

   **STRUCK 2026-08-02 (d17, second amendment).** The 404 **does** have an
   approach step and **does** have a camera zoom. The figure there is **an
   interactive NPC**. The phrase *"scenery that happens to be a person"* is
   dead everywhere it appears and must not be reintroduced.

   **Recorded so nobody re-derives "the 404 is scenery-only"** from this list
   or from the header comment. Unchanged from the original answer: **the card
   avatar comes with it**, and Caveshen wants it refined and extracted. See
   **§33**, raised for it.
3. ~~**Interaction — confirmed.** No approach step, no camera zoom. You land
   and the dialogue is simply there.~~ — **SUPERSEDED 2026-08-02 by d17's
   second amendment.** Caveshen ruled the 404 1:1 with the landing in
   *interaction*, not merely scenery: *"Essentially the 404 dialogue does not
   automatically spin up, but is triggered."* There **is** an approach step
   and there **is** a camera zoom. See d17.
4. **Options navigate, via actions.** Caveshen: *"dialogue options would do the
   navigation, so we would need them to fire actions. For now, we can simply
   have a static option to 'return home' and have it route to `/`."* So: **a
   static "return home" option routing to `/` is enough for this build** —
   `isPath()` already supports it and no new mechanism is needed. The general
   dialogue→action mapping remains **§31 B**, and this is its first real use
   case, not its implementation.
5. **Dev chrome inherited.** The day/night toggle is wanted. The Badger button
   will do nothing on this page — *"that's fine for dev mode"* — so no
   per-page suppression is required.
6. **`noindex` agreed.** For the avoidance of doubt, the ask was a one-line
   `<meta name="robots" content="noindex">` so search engines don't index the
   error page itself. Agreed, and it ships with this build.

#### RULED — §23's archive is dissolved

> "Yes to your final question — once our interactive 404 is up, we can replace
> what's in `main` with confidence."

So the attic is **not needed**. The 404 carries the old landing's design forward
as a living page, which is what the archive existed to guarantee. **§23 reduces
to the `main` cutover alone**, and it now has a prerequisite: the interactive 404
ships first. Recorded in §23.

### CLARIFIED 2026-07-27 — answer 4 was a placeholder, not a ceiling

Caveshen, on being asked whether a micro-tree exceeded his own ruling:

> "When I said 'a single static return home would do' what I meant was 'as
> placeholder until I can add more dialogue' — so your argument is accepted.
> 2–3 node micro-tree that I can customise accordingly."

**Answer 4 above must not be read as a design minimum.** It set the floor for
*mechanism* (no action registry needed — `isPath()` suffices), never a limit on
*content*. The build therefore ships a **2–3 node tree** whose shape Caveshen
can extend. Mechanism ruling stands unchanged: still no action registry, still
§31 B's first use case rather than its implementation.

### DESIGN RULED 2026-07-27 — the 404 is in-world; `404` is a stage direction

Design pass run under `/frontend-design` at Caveshen's request ("a bit more
character, even if it's a 404 page"), constrained by §2 — **the visual language
is locked to Sample C and was not up for reinvention.** No new palette, no new
typefaces, no new layout system. Character comes from concept and structure.

**Thesis:** the 404 is not an error page wearing the site's clothes. It is the
same interview, in which the visitor has opened a door that isn't in the script.

**Signature — the `404` renders as the stage direction, not as a display
number.** The card already separates three voices, and the separation is
load-bearing:

| Slot | Role | Existing use |
|---|---|---|
| `.stage` | the narrator | italic, `--stage` |
| `.speech` | the character | Caveshen's line |
| `.choices button.system` | the machine, out-of-fiction | main's "skip the chat" |

A missing page is a **fact about the world**, not something Caveshen says — so
it belongs in `.stage`. The way out is a `.system` option, which the design
language already marks as out-of-fiction. Every element of the signature is
**inherited vocabulary, not invented decoration**; this is why it can carry
character without violating §2.

**Explicitly not added: any new motion.** The scene already carries waves, the
banner plane and the avatar blink. §28's existing fade-in is inherited and
nothing further is introduced.

**Status: ✅ BUILT & REVIEWER-APPROVED 2026-07-27** — pending Caveshen's visual
review on local dev; **not committed, not pushed**. Copy remains `PLACEHOLDER`
and Caveshen's.

Delivered: `src/pages/404.astro` (rewritten), `src/components/NotFound.astro`,
`src/data/dialogue-404.json` (3 nodes), `e2e/not-found.spec.js`, `noindex` as a
`Base.astro` prop, and the shared scene rules promoted to `tokens.css`.
`docs/design-sample-c.html` **deleted** on Caveshen's explicit authorisation.

Two review rounds. Round 1 returned `request-changes` on five items — including
a real visual defect (`f-ground` omitted, so the sea floated on sky with a hard
seam at ~78% height, glaring in day theme) and three tests that passed while
guarding nothing. All five fixed; round 2 **approved**, seam confirmed gone by
screenshot in both themes.

Suite: **65 unit, 1369 e2e passed / 7 skipped / 0 failed**, build green. The +8
over the 1361 baseline is the new `noindex` assertion across all 8 device
projects.

#### PLANNER CONFIRMATION 2026-07-27 — criteria met

All six ANSWERED rulings, all four DESIGN RULED signature clauses, and §33a's
pure-refactor claim confirmed conformant. §33a verified byte-identical in the
served output. Four follow-ups logged as **d11–d14** (was §30 D-9…D-13, minus
D-11 which moved to **d4** below); two more raised as **d5** and **d3** below.

### d5. Card geometry test — pins the centred/on-screen criterion (was §30 D-14)

Measured across 13 viewports in both Chromium and WebKit: 26/26 in-viewport and
centred to sub-pixel — holds by construction (`width: min(600px, 88%)` and
`max-height: calc(100svh - 2rem)` both resolve against the fixed element's
containing block). But `e2e/not-found.spec.js` has no geometry assertion —
`toBeVisible()` passes even for an off-screen element, and the 8-project matrix
never exceeds 16:9. **Fix: ~8 lines** — assert `.card`'s `boundingBox()` sits
inside `viewportSize()` and centres to within a pixel, plus a landscape-phone
and an ultrawide case.

**RULED 2026-07-27 — build it now.** Caveshen: *"for 3, let's dispatch a worker
now."* Dispatched alongside d4 and d3.

**Status: ✅ built 2026-07-27 — 3 tests × 8 projects, red-green proven.**

### d4. 404 day clouds (was §30 D-11)

`index.astro` puts two cloud rects inside `.day-only`; `404.astro` has only the
sun, and nothing records that as deliberate. The day scene reads emptier for it.
**RULED 2026-07-27 — fix it, not debt.** Caveshen: *"you can do the two-line fix
for the clouds as well."* Port the two `.day-only` cloud rects from
`index.astro`'s scene-standard variant.

**Status: ✅ built 2026-07-27 — two `.day-only` rects, offset to d3's camera.**

### d3. 404 backdrop re-anchor — moon lost above ~2.1 AR (was §30 D-15)

Measured:

| Viewport | AR | Moon | Skyline |
|---|---|---|---|
| 2560×1440 | 1.78 | visible | visible |
| 852×393 (landscape phone) | 2.17 | top cut 66px | — |
| 3440×1440 | 2.39 | **fully cropped** | summit cut 45px |
| 3840×1080 | 3.56 | **fully cropped** | summit cut 578px |

`xMidYMax slice` anchors to the ground, so the sky is what gets sacrificed —
within ruling #1's waiver, but a moonless 404 on wide screens is a visual
consequence Caveshen should judge rather than inherit.

#### BUILT & ACCEPTED 2026-07-27 — the world got wider, not lower

**The literal instruction was geometrically impossible.** At 32:9 a 1200-wide
viewBox exposes only ~337 vertical units, while the moon-to-shoreline gap in the
artwork is ~376. Panning the *same-width* viewBox cannot close that gap — both
ends of it move together. The worker's first attempt (trimming the viewBox
origin) was caught doing nothing by its own Playwright measurement, because
`slice` keys off the viewBox's absolute bottom edge, `minY + height`.

**What shipped:** viewBox width **1200 → 1900** — 700 units of flat sky/sea/
ground either side, no new art — plus the 125-unit downward camera shift the
ruling actually asked for. Camera and celestial re-centred +375 to stay composed.
Widening works by *reducing the scale factor*: at 1900 wide, a 3840×1080 viewport
exposes ~534 vertical units instead of ~337, and moon and ground both fit.

| Viewport | AR | Moon in frame | Bottom-centre pixel |
|---|---|---|---|
| 3840×1080 | 3.56 | ✅ | `f-ground` |
| 3440×1440 | 2.39 | ✅ | `f-ground` |
| 852×393 | 2.17 | ✅ | `f-ground` |
| 2560×1440 | 1.78 | ✅ | `f-ground` |
| 1366×768 | 1.78 | ✅ | `f-ground` |
| 390×844 (portrait) | 0.46 | ❌ | `f-ground` |
| 320×320 | 1.00 | ❌ | `f-ground` |

**Ground reaches the bottom edge at every viewport — sky is never exposed
beneath the sea.** Portrait and 320×320 still hide the moon; that is a
*horizontal*-crop limitation the original 1200-wide design failed too, not a
regression from this change.

**Accepted by Caveshen 2026-07-27** on local review: *"Happy with 1, you can keep
as-is."* Side effect he accepted with it: wide viewports now reveal more of the
already-authored industrial district (§20 art, nothing new drawn).

**Recorded against the orchestrator, not the worker:** the escalation from "shift
the scene down" to "widen the world" was forced by a constraint the *brief*
added — *the ground must reach the bottom edge at every viewport* — which
Caveshen never asked for. His instruction was that the bottom should fall away.
Re-anchoring alone would have satisfied him with a far smaller diff, at the cost
of the shoreline on ultrawide. **Lesson: a brief that hardens a constraint the
principal did not set will buy a bigger change than the ruling required.**

**RULED 2026-07-27 — re-anchor the crop; do not add a second camera.** Caveshen:

> "Perhaps behind the dialogue let's move the scene down slightly (so, the
> bottom-side section falls away) so then the moon becomes a non-issue."

Re-anchoring spends the crop on the ground band instead of the sky. **Why this
beats a second camera:** one attribute change, not a media query plus a second
camera variant. **Constraint:** the ground/sea must still reach the bottom edge
at 16:9 and in portrait — must never expose sky beneath the sea (the exact
defect round 1 fixed via `f-ground`).

**Status: ✅ built & accepted 2026-07-27 — viewBox 1200→1900.**

---

## d6. CI pipeline

Built 2026-07-30 in `.github/workflows/deploy.yml`.

- **Branch pushes** — light check: unit tests + the `desktop-1920` project
  only (175 e2e, ~30s local). Driven by the `LIGHT` env expression.
- **Pull requests** — the full tri-engine matrix, all 8 projects.
- **Build + deploy** — `main` only, gated on `github.ref`, not on event name.

**Why the full matrix must run on the PR, not after the merge:** CI is Linux
with bundled Chromium / WebKit / Firefox; local runs use the **msedge**
channel. The unknown is engine *and* platform together, which a light check
cannot exercise. A PR is the only place that runs before the deploy.

`concurrency` is now per-ref with `cancel-in-progress` on branches; the Pages
group stays on the deploy job so a slow test run cannot hold it.

**Status: ✅ built. Verified: the light command passes 175/175 locally; the
full matrix is proven by PR #1.**

---

## d7. Test strategy — PRD-focused assertions

*New — raised and diagnosed 2026-07-27, not yet built.*

Caveshen's diagnosis: *"our tests feel relatively more dev-oriented rather than
functionality-oriented (or, PRD-focused)."*

### Three symptoms found 2026-07-27, one root cause

Asserting implementation instead of the PRD's stated criteria:

1. `src/tests/hygiene.test.js`'s flavour-line test passed off a
   `<meta name="description">` tag rather than the copy it claimed to guard —
   every line of dialogue could have been deleted and it stayed green.
2. `e2e/not-found.spec.js` used `toBeVisible()` as a stand-in for "on screen"; it
   passes for an element parked 4000px outside the viewport (see d5, which
   fixes this specific instance).
3. **Nine assertions hard-code the literal string `PLACEHOLDER` as expected
   page content:** `e2e/not-found.spec.js:48,58,59`, `e2e/interview.spec.js:134`,
   `e2e/hygiene.spec.js:18`, `e2e/approach.spec.js:19`, `src/tests/dialogue.test.js:126,137`,
   `src/tests/hygiene.test.js:74`. The scanner `docs/placeholder-check.js` is
   correct and needs no change; the bite is the inverse — **the day
   Caveshen's real copy lands, these nine go red and block the deploy, and he
   is debugging his own prose.**

### Direction

Fix the nine `PLACEHOLDER`-literal assertions to assert **structure** instead —
non-empty accessible name, speech element has text, option count ≥ 1 — **before**
the real copy exists, so the tests stay green through the copy landing rather
than the moment it does.

### Built 2026-07-30, corrected 2026-07-31 after review

**The count was ten, not nine.** Review caught a tenth coupled assertion the
original grep for the literal string `PLACEHOLDER` could not find:
`e2e/not-found.spec.js` (then :62) asserted `.stage` contained the substring
`'404'` — a literal from `dialogue-404.json`'s `root.stage` prose, not the
`PLACEHOLDER` token. Same failure mode (copy lands, test goes red), invisible
to a `PLACEHOLDER`-only grep because the coupling was to a different
substring of the same prose. **Lesson: grepping for `PLACEHOLDER` finds
today's instances, not the pattern — any hard-coded fragment of not-yet-final
copy is a candidate, regardless of what that fragment says.** Fixed by
deleting the `toContainText('404')` line; the existing `.not-found-code`
count-0 check next to it is the load-bearing half of "404 is narrated, not
displayed as a big number" and needed no change. No copy-stable positive
replacement was added — "contains 404" cannot be asserted without
re-coupling to prose that may not literally contain those digits once
Caveshen's real copy lands.

All ten rewritten to assert trimmed non-empty text, an accessible name, an
inequality, or option count ≥ 1 — never the `PLACEHOLDER` literal or any
other prose substring. Line numbers below are current (post-fix):

- `e2e/approach.spec.js:20` — `#approach-prompt` has a non-empty accessible
  name, via `toHaveAccessibleName(/\S/)` (checks the a11y tree, not raw
  `textContent`, so an `aria-label=""` regression is also caught).
- `e2e/hygiene.spec.js:18` — 404 page's `.speech` element has non-empty text.
- `e2e/interview.spec.js:135` — `#speech` has non-empty text, no-JS path.
- `e2e/not-found.spec.js:62-65` — the digit-coupled `toContainText('404')`
  removed; `.not-found-code` count-0 check retained as-is.
- `e2e/not-found.spec.js:95-96` — after advancing a node, the first
  `.choices` button has non-empty text AND differs from the root option that
  was clicked (catches stale root buttons left in place, not just emptiness).
- `e2e/not-found.spec.js:107,109` — no-JS `.stage` and `.speech` each have
  non-empty text.
- `src/tests/dialogue.test.js:126,137` — `speechEl.textContent` is non-empty
  after initial render and after a click-through, respectively.
- `src/tests/hygiene.test.js:74-75` — `dialogue-404.json` parsed and checked
  structurally: `root.speech` non-empty, `root.options.length ≥ 1`.

Red-green proof: each assertion's guarded field (button text, node `speech`/
`stage`, an option `label`, or `options`) was temporarily blanked/emptied in
source, the specific test run to confirm it failed on the intended line, then
restored and re-run to confirm green. Repeated for all ten (the F1 fix is a
deletion with no new assertion, so nothing to red-green there beyond
confirming the suite is still green without it). Final `git diff` touched
only the six test files plus this PRD entry — zero source changes.

Full suites clean: `npm test` 65/65; `npm run test:e2e` 1393 passed / 7
skipped (1400 discovered), exit 0.

**Status: ✅ built 2026-07-30, review fixes applied 2026-07-31.**

---

## d8. Dev-only gate — DISCARDED (was §31 first slice + §30 D-6)

§31's **first slice** would have been `import.meta.env.DEV` gating for the §27
toggle scaffold, re-scoped 2026-07-26 from outright deletion into a dev-only
admin control. **Discarded below before it was built — no gate of any kind.**

### RULED 2026-07-31 — no dev-only gate; all toggle buttons stay visible in production

Caveshen: *"since this is causing more issues than it's worth, let's just keep
all the toggle buttons present always ... I will re-think my dev-only approach
here."*

**Reason, recorded so the same approach isn't re-attempted:**
`playwright.config.js:16` serves e2e from a **production build** (`npm run
build && npm run preview`), so `import.meta.env.DEV` is `false` under test.
Gating the toggles would have made `e2e/badger.spec.js` (7 tests × 8 projects)
plus four theme-toggle-dependent tests (`approach.spec.js:48`,
`interview.spec.js:424`, `sheet.spec.js:172,183`) fail against the prod build —
a test-strategy rewrite for no user-visible gain.

**Consequences:**
- **d15** (§31's admin page) stays IN DESIGN — this ruling doesn't touch it.
- **d17** (§27's selection mechanism) stays open and deferred — nothing here
  decides it.
- The `REMOVE-BEFORE-SHIP` markers were renamed to **`INTERIM-TOGGLE`**
  2026-07-31 (comment text only, 9 sites) — the old token named a deletion
  that is no longer happening, while the extent is still worth keeping
  greppable.

**Status: ❌ DISCARDED 2026-07-31 — no dev-only gate, toggles stay visible in production.**

---

## d10. Fixed-sleep timing races in the suite (was §30 D-8)

### FIXED 2026-07-29 — found by CI, exactly as predicted

Raised as debt on 2026-07-27 with the note that *"a test that fails one run in
two is a test that will eventually fail your deploy gate."* It did so on the
branch's **first ever CI run** (PR #1), two failures on the Linux runner:

```
banner-plane.spec.js:48   expect(midOpacity).toBeLessThan(1)   Expected: < 1
```

**One correction to the original diagnosis.** It predicted the 150ms sleep would
*overshoot* the 400ms fade and sample opacity at 0. It failed at the other end —
opacity still `1`, the transition not yet visibly started on a loaded runner. The
mechanism was right, the direction was not: a wall-clock sleep racing an
animation fails **whichever way the machine drifts**, which is the stronger
argument for removing it.

**The fix.** The mid-flight sample is gone. The fade is now proved by its
*declared* transition (`transition-property: opacity`, `transition-duration:
0.4s`) plus completion via the existing `toHaveCount(0)` — and that completion is
load-bearing, because removal is driven by `transitionend`, which only fires for
a transition that actually ran. A hard cut fails the declared assertions; an
inert rule never reaches count zero. **Strictly stronger than what it replaced**,
satisfying P4 criterion 9's "extended, never weakened".

Of the four sleeps: one removed outright, two (`interview.spec.js`,
`not-found.spec.js`) converted to `expect(...).toPass()` retried observations,
and **one retained deliberately** — `interview.spec.js`'s 100ms, which
*interrupts* a 550ms transition rather than waiting for it. It must fire early;
its 450ms of slack runs in the safe direction. Removing it would have broken a
test that needs its timing.

Verified: **1393 passed / 7 skipped / 0 failed**, reconciling to the full 1400
discovered.

**Local greenness is not evidence.** This was green 1393 times on
msedge/Windows while genuinely broken, and died on first contact with Linux. That
is the case for d6's PR gate, in one sentence.

> **Scope broadened 2026-07-27.** Originally one flaky test; it is a *pattern*.
> Four fixed sleeps exist: `banner-plane.spec.js:45` (150ms — the original
> flake, samples a magic instant inside a 400ms transition and **is** racy),
> `interview.spec.js:687` (100ms), `interview.spec.js:689` (700ms) and
> `not-found.spec.js:26` (700ms, added by d5).
>
> **The two 700ms sleeps are a different, milder class**: they wait for a 550ms
> transition to *finish* before asserting a settled value, rather than sampling
> mid-flight. Waiting past an animation is far safer than sampling within one —
> but the margin is 150ms, and under a loaded eight-project matrix that is the
> same shape of assumption the original flake made. `expect().toPass()` or
> `expect.poll` retries the assertion instead of guessing a duration, and would
> remove the guess entirely.
>
> The d5 sleep was **not** invented — it reuses `interview.spec.js:689`'s
> existing idiom, so it is consistent with the codebase rather than novel debt.
> Recorded because that idiom is itself the thing d10 exists to remove. Fix all
> four together, or none.

Caught during the §33a extraction run: `e2e/banner-plane.spec.js:37` — *"an in-flight
pass fades out on approach rather than freezing or vanishing"* — failed once on
`desktop-1920`, then passed green when re-run in isolation. Unrelated to the
avatar; the extraction is not the cause. Caveshen's ruling, 2026-07-27:
**flaky tests are not tolerated**, so it is on the ledger rather than in
someone's memory.

### Root cause — a real race, not mystery flake

The plane fades via `index.astro:573` — `transition: opacity 400ms ease` — and
`fadeOutPlane()` (`:1028-1037`) removes the element on `transitionend`. The test
asserts the fade is *gradual* by sampling a magic instant:

```js
await page.waitForTimeout(150);
const midOpacity = await plane.evaluate((el) => parseFloat(getComputedStyle(el).opacity));
expect(midOpacity).toBeGreaterThan(0);
expect(midOpacity).toBeLessThan(1);
```

The helper calls `page.clock.install()`, which fakes the page's timers — but a
**CSS transition is driven by the compositor and is not faked by it**. So the
150ms sleep is real wall-clock racing a real 400ms window, leaving **250ms of
slack**. Overshoot it and one of two things happens: opacity has already reached
`0` and `toBeGreaterThan(0)` fails, or `transitionend` has fired, the element is
removed, and the `evaluate` has nothing to run against. Losing 250ms to
scheduling latency across an eight-project matrix is entirely ordinary — this
will recur, and it currently sits on the deploy gate.

### Direction (not yet built)

The assertion's *intent* is sound: prove the plane fades rather than hard-cutting
to invisible. The **timing sample is the wrong instrument for that intent**.
Provable without a race:

- assert the declared transition (`transition-duration` is `400ms`, property is
  `opacity`) plus the `plane-fade-out` class — a hard cut would have neither; then
- assert completion via the existing `await expect(plane).toHaveCount(0)`.

If a genuinely observed mid-fade value is still wanted, `expect.poll` for a
value strictly inside `(0, 1)` replaces a fixed sleep with a retried
observation. **Do not "fix" this by lengthening the sleep or the transition** —
that widens the window without removing the race, and couples a test to a design
value §24 ruled on.

**Scope:** one test in one file. No source change — `index.astro` is behaving
correctly and is not on trial here.

**Status: ⏳.**

---

## d11–d14. The 404's follow-up debt (was §30 D-9…D-13)

Four items surfaced by the review passes on d1 and deliberately excluded from
that build to keep its diff surgical. None was a defect. Three are now closed.

### d11 — the card vocabulary was authored twice — ✅ CLOSED 2026-08-02 (`26a6ddb`)

`NotFound.astro` is deleted and `/404` renders `<Stage>`, so the card vocabulary
is authored **once**. Verify: `grep -rl "\.choices button" src/` finds
`src/components/Stage.astro` and nothing else.

**The obvious fix was rejected, and it is still tempting — do not take it.**
Promoting the card rules to `tokens.css` would *create* a hazard rather than
remove one: `tokens.css` loads on every page, so shared `.card` descendants
would sit ahead of any page-local `.card` override. `tokens.css` is a token file
plus SVG fill utilities; a component's CSS is a different kind of thing.

### d12 — the shared scene component — ✅ BUILT 2026-08-01 (`e96ecc8` → `672a988`)

`src/components/Scene.astro` holds the scene once, keyed by
`variant: 'standard' | 'wide' | 'tall'`, with `viewBox` **derived** from the
variant's `width`/`height`. Placement comes from the variant's `fig` table, so
**nothing is hand-tuned at a call site** — which is exactly what makes the
card-occlusion test worth having.

### RULED 2026-08-01 — the moon matches the sun; the ultrawide fix is REVERSED

An earlier attempt moved the wide variant's moon to `cy 310` so it survived
3840×1080. Caveshen viewed it and ruled the other way:

> "From the looks of things we just moved the moon downwards vertically. The
> sun is in the better position, and should override here. The moon in dark
> mode must try to match the sun's position in light mode. That is my ruling.
> We should also try to make the moon slightly smaller than the sun, by a
> factor of maybe 5%. … my resolution is 3440x1440 and the sun is just fine, so
> I don't feel a need to cater for 3840x1080."

- The moon's `cx`/`cy` match `bab4639` **exactly in all three variants**.
  **`moonCy` does not exist**: moon and sun read one shared `celestial` slot, so
  §30 D-1's shared-slot rule is intact. **The moon's y is not in play — nothing
  here is licence to move it.**
- What shipped instead: the moon's radius **46 → 47.5**, five percent under the
  sun's 50, with `Moon.astro`'s craters scaled by the same ratio. Both routes
  inherit it through the shared component.
- **The ultrawide loss is ACCEPTED, not outstanding.** Above roughly **AR 3.16**
  both bodies leave the visible band. Caveshen has seen it and declined to cater
  for it. **3440×1440 renders correctly. Do not reopen this as a bug.**

**Do not "fix" this either:** the duplicated `sea` / `ground` / `rail` values
across the standard and wide variants are separate literals **deliberately** —
they match because the camera height matches (§14), and deduplicating three
fields across two of three variants costs more machinery than it saves.

### d13 — `Avatar.astro` uses `is:global` where scoped would do — ✅ BUILT 2026-08-02 (`646754b`)

Every element its rules target lives inside the component, so Astro's scoped
default works identically. As written it published a global `@keyframes blink`
to every page rendering an avatar. It was chosen to match
`Badger.astro`/`HoodedFigure.astro`, which genuinely need `is:global` (they
render as `<g>` fragments into a parent SVG). Avatar does not.

**Status: ✅ BUILT** — scoped as a rider on d29's comment sweep, verified in the
built CSS rather than by intent: all four rules emit as
`.avatar[data-astro-cid-u5m3xj5o] …`, and all 7 avatar elements carry that
attribute on both pages that render one. Nothing creates avatar markup from JS,
so nothing needed to stay global.

### d14 — the 404 test coupled to placeholder prose — ✅ CLOSED by construction

The `toContainText('404')` assertion no longer exists anywhere in `e2e/`; the
surviving check is the negative one — no `.not-found-code` element — which no
copy can break. **Residue for d21:** nothing in the suite forces the stage
direction to keep the digits "404", so Caveshen's copy is unconstrained.

**Status (d11–d14): all four closed.**

---

## d17. One character per route — the Badger owns `/`, the hooded figure owns `/404` — ✅ BUILT

**✅ BUILT 2026-08-02, `26a6ddb` on `item/character-per-route`. `git show 26a6ddb`
is the authority and records the build in full; this section keeps only what
future work must not re-litigate.**

### RULED 2026-08-01 — there is no selection mechanism; the route *is* the selector

- **`/` — the Badger. `/404` — the hooded figure.** Neither page renders the
  other's character at all.
- **Same scene, same stage, different character, different dialogue tree.** The
  trees were already separate (`dialogue.json` / `dialogue-404.json`); no engine
  change, no data change.
- **Discovery is passive and deliberately unsignposted.** Caveshen: *"No no no
  it will be for users to find, we simply present it."* **Anything that
  advertises the 404 character contradicts this ruling** — no link, no hint, no
  hidden control, ever.

The `INTERIM-TOGGLE` scaffold was **deleted, not replaced**. §27's open point 1
closed with it.

### RULED 2026-08-02 — 1:1 means INTERACTION parity, not scenery parity

The first pass (`92546f8`, WIP, never merged) gave `/404` the shared scene but
kept d1's centred, visible-on-load card. Placement comes from `Scene.astro`'s
`fig` table, which was authored for a **bottom-anchored** card — so at 1920×1080
the figure's face sat fully inside the centred card. Caveshen ruled:

> "Yeah so this is a revert and refactor, we want to give the hooded figure the
> same 'approach' hover over them, and then have the dialogue spin-up similarly
> to how it does on the main landing page, hence my saying 1:1 earlier... so,
> functionality-wise it's the same except for the hooded figure and the
> different dialogue tree (when I write it of course). ... Essentially the 404
> dialogue does not automatically spin up, but is triggered."

Clause by clause, so none of it is reopened:

1. **The `/404` dialogue never auto-spins-up.** The card ships hidden, exactly
   as `/`'s does. No script on that page may reveal it without a user action.
2. **The hooded figure has the same approach affordance the Badger has** —
   prompt, camera zoom, bottom-anchored card, `#end-dialogue`, `Escape` exit.
3. **The only differences between the two routes are the character, the route
   and the tree.**
4. **The occlusion failure was fixed by the design change, NOT by weakening the
   test.** The test was catching a card that **should not exist in that form**.
   Once the card is bottom-anchored and only appears after the camera has framed
   the face in the band above it, the collision cannot occur.
5. *"Revert and refactor"* meant a rework in code. **`git revert` is never run
   here** — see §2.

**This supersedes d1's ANSWERED 2 and 3 outright, and ANSWERED 1 in its vertical
half** — all three are annotated in place at d1. The phrase *"scenery that
happens to be a person"* is **dead**: the figure on `/404` is an interactive NPC.
**Do not re-derive "the 404 is scenery-only"** from any older text or comment.

### The card-occlusion test — kept and re-aimed, NOT neutered

Placement on `/404` still comes from `Scene.astro`'s shared `fig` table, so a
collision can still arrive as a **silent side effect of someone editing
`Scene.astro` for the landing's sake**. That is why Caveshen ruled the test in,
and it survives the design change. Its pre-approach form was replaced by the
post-approach, D2-shaped check — mirroring `interview.spec.js`'s *"face clears
the dialogue card after approach"*, at two viewports under
`reducedMotion: 'reduce'` — which is **strictly stronger**: it exercises the
camera maths as well as the static placement. **Proven red against `92546f8`'s
build.** Recorded at this length so nobody reads the diff and concludes a
failing test was quietly narrowed.

### The card's height cap — a root-cause fix worth not undoing

The card is anchored at `bottom: 3.5%`, so **any height cap measures from that
line, not from 100%**: `calc(96.5svh - 1rem)` keeps the top a fixed 1rem clear at
any viewport height. The deleted `NotFound.astro` carried `max-height` +
`overflow-y` for its centred card; losing them regressed `/404` at 360×360, and
they are restored on `Stage.astro`'s card and corrected for the anchor. Both
routes are pinned by a short-viewport test. **A cap written against `100svh`
here is wrong by the height of the anchor.**

### Copy — RULED, both lines final, both his

| Route | Button copy — exact |
|---|---|
| `/` | `Approach the badger` |
| `/404` | `Approach the hooded figure?` |

**The `/404` string ends in a question mark, and that punctuation is part of the
string.** Caveshen was queried on it specifically and confirmed it **twice**. The
asymmetry is deliberate: neither line is a placeholder, neither carries a
`PLACEHOLDER:` prefix. **Any diff that drops the `?`, adds one to `/`'s line, or
"normalises" either string is wrong and must be sent back.** Every other
`PLACEHOLDER` stands verbatim; **d21** owns every remaining string.

### Constraints this item hands forward

- **`Scene.astro`'s `characters` array is now speculative generality** — both
  callers pass exactly one component. Narrowing it is a real simplification and
  it belongs to **d26**, not to a passing edit.
- The card CSS must stay `is:global` — see d25's trap, which d17 inherited.
- **The byte deltas and the Lighthouse question live in d26.** The `/404` growth
  is accepted, measured, and **not a bug**.

**Status: ✅ BUILT — awaiting Caveshen's look on local dev: both routes, both
themes, before and after approach, per §2's draft-before-deploy rule.**

---

## d18. Visual validation in e2e (was §16)

**STATUS 2026-08-03: must-haves M1–M5 built and reviewer-approved** on
`item/visual-validation` (branched from `item/cityscape-depth`; `e9ba66f`,
`9c2a8d5`). All five proven red via the named injections, then green; the
open summit question resolved itself — no crop exists on any of the 8
projects, so no scoping was needed. One judgment call, reviewer-verified
against the actual geometry: M4's no-gap chain is scoped to the mountain
massif classes only (wider selectors are vacuous — aggregate group bboxes
span the gap). The figure classes edit is render-identical (built output
gains only the 15 inert class strings). Suite 1609 passed / 7 skipped / 0
failed; flake gate `--repeat-each=2` exactly double, 0 flaky. Awaiting
Caveshen's go to PR; nice-to-haves N1–N4 stay deferred until d28 signs off.

**STATUS 2026-08-06: nice-to-haves N1–N4 all built.** N1–N3 built on
`test/d18-nice-to-haves`: halo centring, facets inside the massif, seams on
the promenade, all proven red via their named injections then green after
revert. N4's "approach prompt does not overlap the figure" native-viewport
copy is built and green on all 8 projects there too. N4's "face clears the
dialogue card" native-viewport copy was genuinely red on `iphone-se` and
`iphone-15pro`'s real device viewports at the time (the zoomed face
overlapped the card's top edge by ~20-40px there) — a real gap the existing
390×844 stand-in didn't have enough headroom to catch, so it shipped
uncommitted rather than weakened. It's since been fixed and committed on
`fix/face-card-occlusion` — see the Resolved block below. Full matrix: 1813
passed / 19 skipped / 0 failed; flake gate `--repeat-each=2` exactly double
(3626/38), 0 flaky. Vitest: 70/70.

Specced 2026-08-03 against the scene as it stands on `item/cityscape-depth`
(d28 Stages 1–3 and 5a–5e: parallax layers, sky/far/ground gradients, mountain
facets, building side-faces, celestial halos, paving seams). §16 recorded the
intent and left the approach open; **this section closes it**: assert
screen-space geometry and relationships, keep golden images ruled out, and
build nothing perceptual (no hash, no checksum — the hypothesis §16 left open
is declined; it buys a second failure mode for defects the boxes already
catch).

### Decisions taken, so the build does not re-litigate them

- **Screen space only.** `getBoundingClientRect()`, never `getBBox()` — the
  CLAUDE.md gotcha, and the reason the Table Mountain invariant works.
- **No hit-testing.** `document.elementFromPoint`/`elementsFromPoint` is the
  obvious "what is painted here" probe and **cannot be used here**:
  `Stage.astro:105` sets `pointer-events: none` on `.stage-frame`, so every
  scene shape is invisible to a hit test. Layer order is asserted from **DOM
  order** instead (SVG paint order *is* document order) paired with a rect
  overlap, so the assertion still means something visually.
- **Boxes, chosen where a box is exact.** A polygon's bbox over-reports its
  painted area at the corners. Every invariant below keys off an edge, a
  baseline or an x-projection — quantities a bbox reports exactly — not off
  area or containment of arbitrary points.
- **One new spec file.** New `e2e/scene.spec.js` (subject: the scene's
  composition). Extended: `e2e/geom.js`, `e2e/not-found.spec.js` (the hooded
  figure's own tests already live there), `e2e/badger.spec.js`. No framework,
  no new dependency, no visual-diff service, no file named after this item.
- **Matrix breadth comes from the projects, not from `setViewportSize`.** The
  invariants that must hold *everywhere* are written with no viewport call, so
  they run at all eight projects' native viewports. Only tests that must force
  a particular scene variant set a viewport, per the existing idiom.
- **Scene geometry is asserted on `/` only.** Both routes render the same
  `Scene.astro`; only the character differs, and `approach.spec.js` already
  proves the per-route layer structure. Running the scene probes twice doubles
  the cost for nothing. Figure invariants are per character, so they follow
  their character's route.

### What the suite already covers — do not rebuild it

| Already guarded | Where |
|---|---|
| Table Mountain aspect 2.4194 (no stretch) in all three variants + 1200×1400 | `approach.spec.js:225-244`, `interview.spec.js:334` |
| Card fully on-screen and centred, 3 viewports | `not-found.spec.js:27-56`, `approach.spec.js:196` |
| Face clears the card after approach, both routes | `not-found.spec.js:141`, `interview.spec.js:409-417` |
| Prompt does not overlap the figure; prompt stays inside the frame | `interview.spec.js:251-274`, `badger.spec.js:21` |
| Figure and card not clipped by the crop, 2 extreme aspects | `interview.spec.js:353` |
| Fullscreen button clears figure/prompt/card/toggle/foot | `interview.spec.js:377-479` |
| Stage-frame fills 100% of the viewport, no overflow, 4 aspects | `interview.spec.js:289-317` |
| Correct variant selected per aspect | `interview.spec.js:129-177`, `not-found.spec.js:114` |
| Parallax damping (bg grows 0.4× the fg's growth) | `approach.spec.js:310` |
| bg-layer holds the mountain, fg-layer holds sea + character | `approach.spec.js:297` |
| Sky is a gradient; near/far/fringe are three distinct tones; side-face ≠ front-face — both themes | `interview.spec.js:191-229` |
| Devil's Peak exists above-left of the summit; district exists west of x=0; ≥4 waves per variant | `approach.spec.js:250-342` |

The gap is **inside** the figure, and **between** the scene's own parts. Those
are the only two places the invariants below go.

### The markup debt this item must pay (the one source edit)

The "figure with no arms" class is **unassertable today**: the hooded figure's
sleeve, leg and torso paths carry no class, so no selector can name them
(`HoodedFigure.astro:20-36`). Five `class=` attributes are added — `fig-torso`
(hoodie body), `fig-arm` ×2 (sleeve panels), `fig-leg` ×2 (jeans) — and nothing
else changes: no fills, no geometry, no CSS rules. `.face-void` is already
classed. **Alternatives considered and rejected:** silhouette-width probing
(the arms sit inside the torso's own x-span, so a missing arm does not move the
figure's bbox — it would never go red), and child-count assertions (goes red
for any art edit, green for the wrong deletion).

The Badger has no equivalent: it is two rasters (`Badger.astro:25-26`), so part
integrity is not available. Its analogue is M2.

### Must-have invariants (ranked — build in this order)

Each names its assertion, its viewport/theme scope, and the injection that must
be watched fail first. Injections are **temporary local source edits, reverted
before commit** — never left in the test.

**M1 — Figure part integrity (the "no arms" class).** `.fig-arm` and `.fig-leg`
each have count 2 and a non-zero screen rect; every part intersects
`.fig-torso`'s rect (attached, not floating); one arm's centre-x is left of the
torso centre and the other right (catches both arms collapsing to one side);
`.face-void` is non-zero and lies inside the torso's x-span. Route `/404`
(the hooded figure), all project viewports, default theme.
*Red by:* deleting one sleeve path from `HoodedFigure.astro`.

**M2 — Character raster integrity (the silently-blank-character class).** Every
`<image>` in the built page resolves — collect `href` values from the DOM and
`request.get()` each, expect 200 (idiom already used in `hygiene.spec.js:27`) —
and both `.badger-image` frames have equal, non-zero screen rects whose w/h
matches the authored 1:1 within 1%. Route `/`, all project viewports.
*Why it earns must-have:* a broken `href` still renders a box, so `.badger-figure`
keeps a non-zero rect and today's whole suite stays green over an empty stage.
*Red by:* renaming the `badger-up.png` href to a missing file.

**M3 — Ground reaches the frame's bottom edge, full width.** `.f-ground`'s
screen rect satisfies `left ≤ 0`, `right ≥ viewport.width`, and
`bottom ≥ viewport.height - 1`. All project viewports, no `setViewportSize`,
default theme. This pins d3's accepted contract — *"ground reaches the bottom
edge at every viewport — sky is never exposed beneath the sea"* — which is
currently recorded and untested.
*Red by:* halving `ground.height` in `Scene.astro`'s standard variant.

**M4 — Skyline integrity.** Three assertions over the screen rects of the
visible scene's landform/city shapes (`.f-far`, `.f-fringe`, `.f-near`,
`.f-mtn-lit`, `.f-mtn-shade`):
1. *No gap in the chain.* Sorted by `left`, each next rect starts at or before
   the running maximum `right` — no full-height sky column between adjacent
   silhouettes. This is exactly the defect d28 Stage 5a closed by hand (Table
   Mountain ended at world x=640, Lion's Head began at 695), so it is a live
   regression guard, not a hypothetical.
2. *Everything meets the water.* The maximum `bottom` across those shapes
   equals `.f-sea`'s `top` within 1px, and no shape's `bottom` exceeds it by
   more than 1px — the authored "the city and the mountains end exactly where
   the water begins" contract from d28's diagnosis. Catches both a floating
   skyline and a drowned one.
3. *Summit in frame.* The minimum `top` across those shapes is `≥ 0` — the
   skyline is not cropped off the top of the frame (d3's "summit cut 45px").
All project viewports, default theme.
*Red by:* (1) deleting the Kloof Nek polygon; (2) shifting `sea.y` down 20
units; (3) raising Table Mountain's apex 200 units.
**Build note:** measure assertion 3 across all eight projects *before* pinning
it. If a project crops the summit today, that is a finding for Caveshen — raise
it, do not weaken the invariant to fit. See open questions.

**M5 — Layer sanity at the seams (guards d28's depth work).** For each pair, the
rects overlap **and** the painter is later in document order: sea over the
landform bases at the waterline; promenade (`.f-ground`) over the sea; the
character over the railing (`.f-rail`). Route `/`, all project viewports.
*Red by:* moving `<rect class="f-sea">` above `<g class="bg-layer">` in
`Scene.astro`.

### Nice-to-have — explicitly deferrable, do not build without a separate go

- **N1 — Halo centring.** Each `.f-sun-glow`/`.f-moon-glow` rect contains its
  disc's rect and shares its centre within 1px, in its own theme (day/night).
  Guards 5b against a halo drifting off its disc.
  **Build note:** the sun disc's selector is `circle.f-cel`, not the bare
  `.f-cel` — that class is also worn by CityScape's night-only lit-windows
  `<g>` (`tokens.css:185-189` already documents and guards this same
  collision), so an unscoped selector would match two elements.
- **N2 — Facets stay inside their massif.** `.f-mtn-lit`/`.f-mtn-shade` rects sit
  inside `.table-mountain`'s x-span and share its baseline.
  **Build note:** scoped to `.table-mountain ~ .f-mtn-shade` /
  `.table-mountain ~ .f-mtn-lit` (general-sibling combinator) — Devil's Peak
  reuses the same two facet classes for its own polygons, which sit outside
  Table Mountain's x-span by design; the sibling scope picks out only the
  pair authored after `.table-mountain` in `CityScape.astro`.
- **N3 — Seams stay on the promenade.** Every `.f-seam` line's rect is contained
  in `.f-ground`'s rect (no seams painted over the water).
- **N4 — Matrix breadth for the existing occlusion tests.** One unparameterised
  copy of "prompt clears the figure" and "face clears the card", run at the
  projects' native viewports rather than three hand-picked sizes.
  **Build note:** only "prompt clears the figure" shipped. "Face clears the
  card" is genuinely red on `iphone-se`/`iphone-15pro`'s real viewports — a
  finding, not a scoping fix — so it was left out rather than weakened. See
  the open question below.

N1–N4 are cheap but guard art that is one review away from changing again.

### Shared helpers — extend `e2e/geom.js`, do not fork it

- `sceneRects(page, selector)` — screen rects of every match **inside the
  visible scene variant** (find the `.scene` with a non-zero rect, query within
  it). Generalises the existing `visibleRect`'s one-element lookup; `visibleRect`
  stays as is, its callers untouched.
- `paintsOver(page, aSel, bSel)` — `compareDocumentPosition` inside the visible
  scene: does A paint after B.
- `rectContains(outer, inner)` — already written twice
  (`interview.spec.js:240`); move it here and import it there rather than
  landing a third copy.

### Steps

1. Extend `e2e/geom.js` with `sceneRects`, `paintsOver`, `rectContains`; import
   `rectContains` in `interview.spec.js` and delete its local copy. →
   *verify:* `npm run test:e2e -- interview.spec.js` green, count unchanged.
2. Add the five `class=` attributes to `HoodedFigure.astro`. →
   *verify:* `npm run build` clean; `git diff --stat` shows one file, five lines.
3. M1 in `not-found.spec.js`. → *verify:* injection (delete a sleeve path) red,
   revert, green — on at least two projects.
4. M2 in `badger.spec.js`. → *verify:* injection (bad href) red, revert, green.
5. M3 + M4 in a new `e2e/scene.spec.js`. → *verify:* each of the four
   injections red one at a time, revert, green; record the measured summit
   margin per project before pinning M4.3.
6. M5 in `e2e/scene.spec.js`. → *verify:* injection (sea moved above `bg-layer`)
   red, revert, green.
7. Full matrix. → *verify:* `npm run test:e2e` — 0 failed, skips still 7,
   passed count up by the new tests × 8 projects.
8. Flake gate. → *verify:* `npm run test:e2e -- --repeat-each=2` — 0 failed, 0
   flaky. (If runtime makes that impractical, a second plain full run is the
   floor; say which was run.) Both use the temp-config port workaround in
   CLAUDE.md when a dev server is squatting on 4321.
9. Update this section's status line and the board row.

### Success criteria — "done" means all of these

1. M1–M5 implemented; no golden image, no new dependency, no new npm script, no
   file named after a tracker ID.
2. Every must-have invariant **watched fail** against its named injection and
   pass after the revert — recorded per invariant in the commit message or this
   section, one line each.
3. `git status` clean of injections: `grep -rn "fig-arm" src/` finds exactly the
   two sleeve paths; the scene renders identically to before (the only source
   diff is five `class=` attributes).
4. Full matrix green: `npm run test:e2e` → 0 failed, environment-dependent skips.
5. Zero flake: the repeat run above reports 0 flaky.
6. Vitest untouched and green (`npm test`, 70/70).
7. Suite runtime has not grown by more than ~10% — these are rect reads on an
   already-loaded page; anything larger means a test is waiting on something it
   should not.

### Open questions for Caveshen

1. **M4.3 (summit in frame) may already be false somewhere on the matrix** —
   d3 recorded that portrait crops the moon by design. If the measurement finds
   a project that crops the *summit*, is that a defect to fix or an accepted
   limitation to record as an exception?
2. **The five `class=` attributes on `HoodedFigure.astro`** are a test-driven
   edit to locked art markup. Confirmed acceptable? Without them the "no arms"
   class stays untestable and M1 is dropped.
3. **Sequencing against d28.** M4 and M5 pin geometry that d28 Stage 4 (idle
   parallax) and any later ground-plane pass would move. Build d18 now and
   accept that Stage 4 updates two invariants, or hold d18 until d28 closes?
   Recommendation: build now — the invariants are the point of d28's review
   loop, and a test that needs updating is telling you the composition moved.
4. **N4 finding: the zoomed face overlaps the dialogue card on `iphone-se`
   and `iphone-15pro`'s real viewports** (approach.spec.js-style camera zoom,
   `interview.spec.js`'s "face clears the dialogue card" assertion). The
   existing hand-picked 390×844 stand-in has enough headroom to miss it. Is
   this a defect to fix (more headroom in the zoom/camera math at short
   viewports) or an accepted limitation? The matching test was left
   uncommitted rather than weakened — see N4's build note above.

**Resolved (Caveshen, 2026-08-06): real defect, fixed — shape A+B from the
investigation brief.** Worth recording so nobody re-derives it from the
devices' marketing spec sheet again: Playwright's *actual* native viewports
here are `iphone-se` 320×568 and `iphone-15pro` 393×659, not 375×667/393×852
— real measured overlap was +42.3px and +24.0px respectively. Fixed on
`fix/face-card-occlusion` by capping the card's `max-height` so headroom
above it can't collapse to a sliver at all tested phone viewports
(`Stage.astro`) and clamping the camera's zoom scale to whatever that
headroom actually fits (`stage.js`, was hardcoded to 2.2) — A alone can't
rescue `iphone-se` (nothing fits a 16px gap), B alone can't force headroom to
exist, together they close both. Accepted cost: the cap now binds on
`iphone-15pro` too, trimming ~11px off the card's natural height there — it
didn't need to trim before. N4's withheld third case is now committed
(`e2e/interview.spec.js`'s "face clears the dialogue card after approach —
native viewport") and green at both native viewports, ~3px clearance, 0 flake
over repeat runs.

**Status: ✅ must-haves + N1–N4 built — see the STATUS notes above and the
resolution just above. PR #14 open against main, not yet merged.**

---

## d23. Hosted site — domain + Cloudflare

Post-merge work. Caveshen and Claude do it together in a later session. Not
designed yet — no architecture, no DNS records, no plan here.

**Prerequisites — MET (Caveshen, 2026-08-02):** the Cloudflare account is set
up; the API token is issued and **stored outside this repository**; the domain
**`caveshen.com`** is reserved.

**The token must never enter this repo. The repo is public.** Not in `.env`, not
in a config file, not in a test fixture, not in a commit message, not in this
document. If a build ever needs it, it arrives as a CI secret.

**What a custom domain touches — a note for when d23 starts, not work to
schedule now.** Discovering these late is the failure mode this note exists to
prevent:

- a `CNAME` file in the repo, and GitHub Pages' custom-domain setting;
- anywhere the site hardcodes its own URL — the social-preview meta tags and
  `docs/render-og.js` are the likely candidates. **Grep before assuming those
  are the only two.**

**Status: ✅ hosting live 2026-08-05 — zone ACTIVE, awaiting cutover.**
Caveshen switched NameSilo's nameservers to the assigned pair 2026-08-05;
the zone went active minutes later and the Universal cert
(`caveshen.com` + `*.caveshen.com`) entered validation, which self-completes.
Remaining d23 work is the cutover itself (records + CNAME file + Pages custom
domain + hardcoded-URL grep), deliberately deferred. Discovery below kept,
so it isn't re-derived: the domain is registered at **NameSilo** (transfer-
locked; old NS parked at webway.host, served nothing). The token is
**account-owned** (`/user/tokens/verify` reports it invalid — verify
account-owned tokens against the account endpoint instead); Caveshen widened
it with zone-create 2026-08-04. Zone `e6637ca173198a7d7c8e9f72b61851ae`
created on the Free plan, assigned NS **bryce / sreeni .ns.cloudflare.com**.
Pre-set while pending: Always Use HTTPS on, min TLS 1.2, automatic HTTPS
rewrites on. **Next: Caveshen points NameSilo's nameservers at that pair**;
on activation the Universal cert auto-issues. No DNS records exist yet, by
design — linking the actual site (CNAME file, Pages custom domain, hardcoded
URLs per the note above) is deliberately deferred to cutover.



---

## d24. The Badger on the character sheet — character-select framing

### 🎨 DESIGN BRIEF 2026-08-07 — written, **awaiting Caveshen's explicit go**

**No build starts on this section until Caveshen says go.** The brief below is
scoped and testable; it is not permission.

Caveshen's original instruction, which the brief serves:

> Add the Badger to the left side of the character sheet, similarly animated
> but completely out of the 'scene' we've built — more similar to character
> pages/menus in videogames where the character is displayed alongside their
> stats sheet. It sorts out our art considerations for that page nicely, so no
> more avatar required there.

### Standing constraints — carried forward, not up for re-litigation

- **Out of the scene, deliberately.** No `viewBox`, no `CityScape`, no sky, no
  promenade. `/sheet` has no scene and does not get one. This is a portrait in
  a menu, not a third camera.
- **No generated art.** Standing rule. The Badger raster already exists
  (`public/badger-up.png` / `badger-down.png`, commissioned, full rights, §27);
  anything beyond it is Caveshen's to supply. Reference screenshots under
  `screenshots/character-sheet-games/` are gitignored inspiration only — never
  committed, never traced.
- **§2 still binds.** The visual language is locked to Sample C and is not up
  for reinvention. `frontend-design` may be consulted inside that lock.
- **d16 is NOT retired by this.** d16 (§33b, card-avatar art refinement) governs
  the **dialogue-card avatar on `/` and `/404`** and keeps that remit in full.
  *"No more avatar required there"* means **on `/sheet`**, and `/sheet` was never
  in d16's remit. Recorded because the two are easy to conflate.
- **Purely additive — there is nothing to strip.** Verified: `Avatar.astro`
  renders in exactly one place, `src/components/Stage.astro`, which both routes
  use. **It is not on `/sheet` today.** *"Sorts out our art considerations for
  that page"* is about what the page will no longer need, not about what is
  there now.

### The design — settled with Caveshen 2026-08-07

Decided, not proposed. Each item below closes a question the earlier draft of
this section had left open.

1. **Static portrait — `badger-up.png` only.** No idle animation on this page,
   and `badger-down.png` never loads here. The reasoning, so nobody "restores"
   the idle later: on `/` the character is *live in a scene*; `/sheet` is a
   *document about the character*, and a menu portrait holds its pose. This
   supersedes the earlier "animated similarly" reading and the 2026-08-02 d28
   cross-reference note, which assumed an idle would exist here.
2. **`🔄 REVISED 2026-08-08`: no edge-bleed.** The figure renders whole — the
   original "oversized, bottom-left edge-bleed, paw/hip cropped" reading is
   **superseded**; see *Placement — revised 2026-08-08* below. Still never
   crops the head or torso (that constraint didn't need bleed to hold).
3. **It lives in the rail left of the centred wrap and never overlaps sheet
   content.** Below the width where that rail can no longer hold it, it is
   `display: none` — one rule, which also satisfies the settled "hide it on
   phones" decision without a second breakpoint.
4. **`🔄 REVISED 2026-08-08`: one touch, no new art — the caption.** A caption
   in the page's existing `.panel-caption` convention (mono, uppercase,
   letterspaced, `var(--stage)`), **below** the figure per the convention's own
   rule — the bend that put it over the figure's base is rescinded now the
   bleed that forced it is gone. **The ground-shadow is dropped** — see
   *Placement — revised 2026-08-08*. **No vignette.** Caption wording is
   `PLACEHOLDER` per the copy rule (d21).
5. **Decorative.** `aria-hidden="true"` on the wrapper, `alt=""` on the image.
   The nameplate already announces the character; the portrait adds nothing a
   screen reader needs, and the caption is flavour, not information.
6. **Plain `<img>`, no SVG machinery.** `Badger.astro` renders as an SVG `<g>`
   fragment and **stays on the stage** — it is not reused, not extracted, not
   wrapped in a host `<svg>` for this. `/sheet` gets one `<img>` pointing at the
   existing PNG.
7. **A menu-open entrance** — the page-life beat, in scope (see *Choreography*).
8. **Out of scope, rejected on the record:** fake game-menu chrome (invented tab
   strips, controller-button prompts); any portrait animation; vignettes;
   scroll-triggered or ambient effects. **After the menu-open, the page is
   still.**

**Precondition — checked, not assumed: `badger-up.png` is genuinely
transparent.** PNG colour type 6 (RGBA), 500×500, all four corners at alpha 0,
44% of pixels opaque; drawn content occupies x 33–466, y 32–488. There is no
white matte, so nothing blocks the build. Recorded so the worker does not
re-derive it — and so that if this ever changes, a matte is a **blocker to
raise**, never something to paper over with generated art.

### Layout — grounded in `src/pages/sheet.astro`

`main.sheet-wrap` is `max-width: 1080px; margin: 0 auto; padding: 1.75rem
1.25rem 4rem`. `.sheet-grid` (the three-column body — abilities rail, middle
col, right col) sits inside it with `gap: 1.4rem`. At viewport width `W ≥
1080` the rail from the left viewport edge to `.sheet-grid`'s own left edge is
`(W − 1080)/2 + 1.25rem` — the centring margin plus the wrap's left padding.

### Placement — revised 2026-08-08

Caveshen, from the first pair of screenshots (d24-full-colour.png,
d24-grayscale.png): the bottom-left edge-bleed reads too far from the sheet
and too low. Revised instruction — closer to the sheet, higher: (a)
**vertically centred** on `.sheet-grid`'s own height; (b) **right-shifted**
so the gap between the figure's right edge and `.sheet-grid`'s left edge
**equals `.sheet-grid`'s own `gap: 1.4rem`** — the portrait reads as a fourth
column sitting beside the three, same rhythm.

**Implementation is a native-CSS win, not more arithmetic.** Rather than
computing a pixel offset that *approximates* `.sheet-grid`'s gap (what a
`position: fixed` wrapper would have forced), `.sheet-portrait` moves inside
`.sheet-grid` as its last child, `.sheet-grid` gets `position: relative`, and
the portrait is `position: absolute` against it:

```
right: calc(100% + 1.4rem);   /* right edge sits exactly one grid-gap left of .sheet-grid */
top: 50%;
transform: translateY(-50%);  /* centred on .sheet-grid's own height */
```

An absolutely-positioned grid child is pulled out of grid placement entirely
(CSS Grid §, standard behaviour) — no `grid-column` needed, and the gap now
**can't drift out of sync** with `.sheet-grid`'s own `gap` value the way a
hand-computed pixel offset could. Both the "reads as a fourth column" ask and
the "exact gap" ask fall out of this for free.

Consequence: `.sheet-portrait` no longer needs `.nameplate` as an exclusion
zone by construction — it can only ever collide with `.nameplate` if the
figure is taller than `.sheet-grid` itself pushes it above `.sheet-grid`'s own
top edge, which the sizing below prevents. It can never overlap `.sheet-grid`
at all: the gap is structural, not computed.

**Sizing.** No bleed now, so *box width = visible width* — the `/0.8`
bleed-inflation term is gone entirely. Available width, before caps:

```
S = (100vw − 1080px)/2 + 1.25rem [wrap's left padding] − 1.4rem [grid gap] − 1rem [outer margin from the browser edge]
  = (100vw − 1080px)/2 − 1.15rem
```

Capped two ways — width, so ultrawide screens get a portrait and not a
billboard; height, because a vertically-centred figure (unlike a
bottom-anchored one) can now be tall enough to matter on a short viewport, and
the asset is close to square so width and height track together:

```
--portrait: min(480px, calc((100vw - 1080px) / 2 - 1.15rem), calc(100vh - 8rem));
```

| W | `S` (uncapped) | actual (after caps) |
|---|---|---|
| 1650 | 266.6px | 266.6px |
| 1920 | 401.6px | 401.6px |
| 2560 | 721.6px | 480px (width-capped) |

Verified against the live build at 1920×1080: measured gap 22.39px (1.4rem =
22.4px, the ~0.01px is subpixel rounding), measured vertical-centre delta
0px, measured box width 401.59px — the arithmetic and the render agree.

**Breakpoint — re-derived, moved off 1600px.** The old 1600px threshold was
sized for the *bled* box (of which only 80% was visible); at that same 1600px
the new, un-bled formula gives `S = (1600−1080)/2 − 1.15rem = 241.6px`, face
width `0.42 × 241.6 ≈ 101px` — **under** the ~105px sticker-vs-portrait floor
this section already established (`Badger.astro`'s `.face-void` puts the face
at 29%–71% of the image's own width, so face width is a flat 42% of `S`
regardless of bleed). Solving `0.42S ≥ 105` gives `S ≥ 250px`, which needs
`W ≥ 1080 + 2×(250 + 1.15rem) ≈ 1617px`. **New breakpoint: `@media
(min-width: 1650px)`** — a round number with a comfortable margin over that
floor (`S = 266.6px` at 1650, face `≈112px`), and it still clears the
softer "twice the 118px ability rail" (240px) heuristic from the original
design. **Target screens are 1920 wide** (Caveshen's own machines) — 1650
leaves 270px of headroom below that, and at 1920 itself `S = 401.6px`, a
substantial portrait, well under the 480px cap. The Playwright-matrix free
coverage still holds at the new threshold: **shown** on `desktop-1920` and
`desktop-2560`; **hidden** on `desktop-1366`, `desktop-firefox` (1280),
`ipad`, and all three phones.

**Composition.**

- Wrapper: last child of `.sheet-grid`; `position: absolute; top: 50%; right:
  calc(100% + 1.4rem); width: var(--portrait); pointer-events: none;
  transform: translateY(-50%)`. `.sheet-grid` gets `position: relative` so it
  is the containing block. `pointer-events: none` guarantees the (still
  decorative) figure can never intercept a click.
- **Ground-shadow: dropped, 2026-08-08.** A vertically-centred, floating
  figure has no ground plane for a contact shadow to sit on — keeping it would
  have read as a shadow cast on nothing. The CSS was one `::before` rule with
  a day/night alpha split; trivial to re-add if a future placement re-grounds
  the figure. Judged from the recentred screenshot, not a test.
- **Caption: back to the plain `.panel-caption` convention**, below the
  figure — no bend, no compensating `padding-left`, no `margin-bottom` pull on
  the image. Both existed only to serve the edge-bleed; removing the bleed
  removes the need for either.
- **Filter treatment: full colour — FINAL, 2026-08-08.** See *Open questions*.
  No `filter` declared at all now (the single-switch scaffolding for a
  grayscale alternative is removed along with the pending-decision framing —
  there is no longer a decision pending).
- **Class-name trap:** do not reuse `.badger-up`, `.badger-down` or
  `.badger-image`. `Badger.astro`'s styles are `is:global` and bind the
  two-frame idle animation to those names; `e2e/badger-idle.spec.js` queries
  them on `/`. Use a distinct namespace, e.g. `.sheet-portrait`.
- **Skipped deliberately:** a `<picture>` element to spare phones the 43KB
  download. `/sheet` is reached from `/`, which already served the same file,
  so it is normally a cache hit; 43KB does not justify the markup. Add one only
  if a real budget is ever set.

### Choreography — the menu-open

CSS only. `animation-delay` staggering with `animation-fill-mode: both`; **no
JS**, so it works in a JS-disabled context unchanged. Panels rise 10px and fade
in; the portrait slides in from the left, landing at its (revised, 2026-08-08)
vertically-centred position; the XP bar fills last. Timing table unchanged by
the placement revision.

| beat | target | delay | duration | ends |
|---|---|---|---|---|
| 1 | `.nameplate-inner` | 0ms | 180ms | 180ms |
| 2 | `.abilities-col` | 70ms | 180ms | 250ms |
| 3 | `.middle-col`, `.right-col` | 140ms | 180ms | 320ms |
| 4 | `.sheet-portrait` (translateX −40% → 0) | 200ms | 240ms | 440ms |
| 5 | `.xp-fill` (width 0 → 78%) | 260ms | 220ms | 480ms |

Beat 1 targets `.nameplate-inner`, not `.nameplate` — `.sheet-nav`'s
back/download links stay static from frame one, which also sidesteps a
reproducible Playwright actionability race against an animating ancestor,
found while building against the existing no-JS `/sheet` test (predates the
2026-08-08 placement revision). `.sheet-portrait`'s resting position now
carries a real `transform: translateY(-50%)` (the vertical centring, not
motion), so the slide-in keyframes are `translateY(-50%) translateX(-40%)` →
`translateY(-50%) translateX(0)` — both parts in both keyframes, since a
second `transform` declaration would replace rather than compose.

**The whole sequence ends at 480ms, under the 500ms budget**, and no element
starts later than 260ms — readability is never gated on the animation.
`.sheet-foot` is not animated; it is below the fold and adding it buys nothing.

`.xp-fill`'s 78% currently appears once, as a literal. Animating it would make
it appear three times (base rule, keyframe end, reduced-motion reset), so lift
it to `--xp: 78%` on `.xp-fill` and reference that in all three. Animate
`width`, not `transform: scaleX()` — scaleX distorts the pill's `border-radius`
and, worse, leaves the computed width at 78% throughout, so a test could not
tell a working bar from a broken one.

**`prefers-reduced-motion: reduce`: no motion at all.** Four of the five
targets reset to `animation: none; opacity: 1; transform: none`. `.sheet-portrait`
resets to `animation: none; transform: translateY(-50%)` instead of `none` —
its transform isn't decorative motion, it's the vertical-centring itself, so
zeroing it would mis-place the figure under reduced motion. The XP bar is
full (`width: var(--xp)`) from the first frame.

**Watch out:** Playwright's `toBeVisible()` passes at `opacity: 0`. The existing
`/sheet` tests therefore cannot catch a choreography that never finishes. The
new tests below must assert final state explicitly.

### Success criteria — done means all of these

1. `/sheet` renders one `<img src="/badger-up.png">` inside an
   `aria-hidden="true"` wrapper with `alt=""`. **`badger-down` appears nowhere
   in the page source.** No `<svg>` is added to `/sheet`; `Badger.astro` is not
   imported there and is not modified.
2. At **1920** and **2560** the portrait is visible, and its bounding box
   intersects neither `.nameplate` nor `.sheet-grid`.
3. At **1650** the portrait is visible; below **1650** it is `display: none`
   (`toBeHidden()`) — `🔄 REVISED 2026-08-08`, breakpoint moved from 1600px,
   see *Placement — revised 2026-08-08* for the re-derivation.
4. `🔄 REVISED 2026-08-08`: **vertically centred and gap-matched, not
   edge-bled.** At 1920 (and 2560), read live from the DOM rather than
   hardcoded pixel twins of the CSS: the portrait's vertical centre matches
   `.sheet-grid`'s vertical centre within a small tolerance, and the gap
   between the portrait's right edge and `.sheet-grid`'s left edge matches
   `.sheet-grid`'s own computed `gap` within a small tolerance.
5. The declared choreography fits its budget: for every animated target,
   `animation-delay + animation-duration ≤ 500ms`, and the delays are ordered
   nameplate-inner ≤ abilities ≤ columns ≤ portrait ≤ xp-fill.
6. The XP bar settles at 78% of its track (± 1%).
7. Under `prefers-reduced-motion: reduce`, `.nameplate-inner`, `.abilities-col`,
   `.middle-col`, `.right-col` report `animation-name: none`, `opacity: 1`, no
   transform; `.sheet-portrait` reports `animation-name: none` and
   `transform: translateY(-50%)` (not "no transform" — see the choreography
   note above); the XP bar is at 78% from the first frame.
8. No horizontal overflow at 1366 / 1920 / 2560 (the existing 2560 test is the
   guard).
9. **Every existing test stays green, and no existing `e2e/` file is modified
   except to add coverage.** In particular `e2e/badger-idle.spec.js` (which
   asserts the two-frame idle on `/`) is untouched and unaffected.
10. Both themes and both time-of-day settings look right — the portrait reads
    correctly against the AMOLED night ground and the parchment day ground.
    Caveshen's eye, not a test. (No ground-shadow to check any more — dropped
    2026-08-08.)

### Tests

New file `e2e/sheet-portrait.spec.js` (named for its subject, per d22 — never
after a tracker ID). It drives viewport width with `page.setViewportSize()`
rather than relying on project geometry, matching the convention already used
in `e2e/sheet.spec.js`. `rectsIntersect` from `e2e/geom.js` is the existing
helper for criterion 2 — reuse it, do not write another.

Cover: (a) visible and non-overlapping at 1920; (b) hidden below 1650, shown
at 1650; (c) vertical-centre and gap-match tolerance at 1920, both read from
the DOM (`.sheet-grid`'s own `getBoundingClientRect()` and computed `gap`) —
not hardcoded pixel twins of the CSS, so the test still means something if the
CSS constants move; (d) `badger-down` absent from the source; (e) the declared
timing budget and delay ordering, read from computed style — **no
`waitForTimeout`, no fixed sleeps** (d10's rule); (f) reduced-motion final
state, including `.sheet-portrait`'s `translateY(-50%)`; (g) the XP bar
reaching 78%, via `expect.poll`, not a sleep.

Red-green proven per d18's discipline: each assertion must fail before the
feature exists.

### Estimate and branch

Small and additive — one markup block plus a CSS block in `sheet.astro`, one
new spec file. Under half a day. Branch `feat/sheet-portrait`.

### Open questions — answered 2026-08-07, GO given

1. **Breakpoint: `1600px` confirmed 2026-08-07 — `🔄 SUPERSEDED 2026-08-08`,
   now `1650px`.** See *Placement — revised 2026-08-08* for the re-derivation;
   the underlying reasoning (Caveshen's own screens are 1920 wide, comfortably
   clear of the floor) still holds, only the number moved because the
   bottom-left-bleed geometry it was computed against is gone. The declined-
   for-now "minimal variant" YAGNI call is unaffected.
2. **The caption-over-toes bend — ACCEPTED 2026-08-07, `🔄 RESCINDED
   2026-08-08`.** Forced by the edge-bleed; the bleed is gone, so the caption
   is back to the plain "below the figure" `.panel-caption` convention.
3. **Grayscale vs full colour — `✅ FINAL 2026-08-08: full colour.`** Decided
   from the side-by-side screenshots (d24-full-colour.png,
   d24-grayscale.png, both gitignored, not committed). The single-CSS-filter-
   switch scaffolding for a future grayscale alternative is removed along
   with the pending-decision framing — there's no decision left pending, and
   a config knob for a value that's now fixed is speculative scope.
4. **Caption wording — `PLACEHOLDER`**, per the standing copy convention (d21).
   Unchanged.

**Status: ✅ GO given 2026-08-07, built; placement revised 2026-08-08 per
Caveshen's review of the first screenshots — see *Placement — revised
2026-08-08* above. Branch `feat/sheet-portrait`, PR #16.**

---

## d25. The shared stage — extracting the approach interaction — ✅ BUILT

**✅ BUILT 2026-08-02, `1254dad` on `item/approach-extraction`, landed on the
mainline as `732f5a6` (#3). `git show 1254dad` is the authority; this section
keeps only what future work must not re-litigate.**

**What it is: d12 one level up.** d12 extracted the *scene* so both routes render
the same backdrop from one source; d25 extracted the *stage* — the frame, the
camera, the approach prompt and the dialogue card — so both routes render the
same interaction from one source. Two new files, no new pattern:
`src/components/Stage.astro` and `src/scripts/stage.js` (`initStage(tree)`),
joining `camera.js` and `dialogue.js` in a folder that already existed.
`index.astro` went 895 lines to 106.

**Props: `tree`, `characters`, `characterLabel?`, `promptLabel`** — the values
that genuinely vary by route. **The per-route `noscript` note is a `<slot />`,
not a fifth prop**, because it is markup, not a value. The first pass shipped
`tree` alone and was corrected after review; all four props are load-bearing.

**Why the *whole* script moved, not a hand-picked subset:** it makes
"functionally identical" true **by construction** rather than by matching a
checklist, and it dissolves the otherwise-open question *"how far does 1:1 go —
does `/404` get the wind motes? the fullscreen button? the MAVERICKS plane?"* The
answer is **yes to all of it**, because they arrive together. A subset was also
not cheaper: the script dereferences `document.getElementById('fullscreen-toggle')`
unguarded, so splitting would have meant null guards existing only to support a
partial adoption nobody asked for.

### Non-negotiable trap — the card CSS must stay `is:global`

`src/scripts/dialogue.js` **creates the dialogue option buttons at runtime**.
Astro's *scoped* styles work by attaching a build-time hash attribute to elements
Astro renders; runtime-created elements never receive it. A scoped `<style>` in
`Stage.astro` would compile, build green, pass every structural test — and
**silently unstyle every dialogue option on both routes. No test catches this.**

### The proof, and why it was worth its own item

Built `dist/index.html` **byte-identical** to the pre-refactor baseline
(`672a988`), normalising comments and scoped-id hashes only; **zero files under
`e2e/` modified**; full tri-engine suite green at an unmoved 65 / 1393-passed.
**The unmoved count is the proof** — a pure refactor that needed a test edited
would not have been pure. This is the sequencing Caveshen approved twice
(d12 → d17, then d25 → d17): extract first, change behaviour second, so a
regression on `/` can be localised to one commit instead of argued about.

**Status: ✅ BUILT & PROVEN — d17 is built on top of it.**

---

## d26. Cleanup sweep — ✅ BUILT, four of five (was "the holding pen")

**✅ BUILT 2026-08-02, `daaafb9` on `item/refactor-plan`. `git show daaafb9` is
the authority; this section keeps only what future work must not re-litigate.**

### Landed — four items, as scoped

1. `Scene.astro`'s `characters` prop narrowed to a single `character` prop.
   Both callers (`index.astro`, `404.astro`) already passed exactly one — the
   array existed only for the `INTERIM-TOGGLE` scaffold, which d17 deleted.
2. `visibleOne(selector)` extracted in `src/scripts/stage.js` (`:7`),
   replacing three inline copies of the same pattern. **The comment fix
   landed with it:** the old comments at `:54`/`:139` claimed the filter
   picks between the hooded figure and the Badger; since d17 there is one
   character per route, so it selects among the **three scene variants**.
   They were actively misleading, not merely stale.
3. `rectsIntersect`/`visibleRect` moved to `e2e/geom.js`, imported by both
   spec files that had copies. `rectContains` stays in
   `e2e/interview.spec.js` — it only ever had one home.
4. The character-swapped seam tests fold into a `ROUTE_CHARACTERS` loop
   (`e2e/approach.spec.js:334`). **Decision recorded, so it isn't re-litigated
   as an oversight:** the "all three scene variants present" test stays
   **unlooped** — it doesn't depend on the character, so looping it would
   raise the suite count without adding signal.

### Item 5 — CLOSED as not-debt (standing ruling — the trap is subtle, do not re-open it from the SVG markup alone)

**Resizing the badger PNGs was wrong, and the error was in this sweep's own
brief.** The rendered footprint is 200 SVG units × the figure's own scale (1.2
standard, 1.3 tall) × the viewBox-to-viewport ratio: ≈**384 CSS px** at 1920,
768 device px at 2×, and ≈**1024 device px** at 2560 wide on a 2× display.
500×500 is correct for that range and, at the top of it, arguably a little
under-provisioned.

`Badger.astro`'s own header had this wrong too — it omitted `fig.scale`, giving
320 and 852 — and the first version of this ruling repeated those figures. Both
are corrected. The conclusion never changed; only the margin, which widened.

**The trap, spelled out so nobody re-derives the wrong answer from the same
file:** `Badger.astro` sets `<image width="200">` — an SVG-unit attribute
inside a 1200-unit viewBox, not a CSS pixel size. Read on its own (as this
sweep's brief did), `200` looks like "200px on screen"; it is not — it is 200
of 1200 SVG units, scaled by the viewport's CSS-to-SVG ratio and then again
by device pixel ratio. The real number is three lines above it, in the same
file's own comment. **Resizing the source to 200×200 would have degraded
exactly the displays that show the Badger best.**

The worker refused this item and flagged the conflict rather than guessing —
correctly.

**What shipped instead** (`3f322ae`, same branch, next commit): lossless
recompression. `badger-up.png` 56,242 → 42,900 B, `badger-down.png` 55,455 →
41,268 B — about a quarter off each, **27.5 KB total**. Both stay 500×500 and
are **pixel-identical** to what they replace, proved by decoding old and new
to raw RGBA and diffing the buffers, not taken on the encoder's word. A
palette encode was tried and discarded — it quantised, and the buffers didn't
match.

**Ruling: closed. Do not re-open a resize on the strength of the
`width="200"` attribute alone — read the viewBox/DPI maths in `Badger.astro`'s
own header first.**

### Byte numbers to sweep against — do not re-open these as bugs

| File | Measured at | Value |
|---|---|---|
| `dist/index.html` | `672a988` (pre-d17 baseline; d25 byte-identical to it) | 60,986 |
| `dist/index.html` | `26a6ddb` (d17) | 45,664 |
| `dist/404.html` | `672a988` | 18,752 |
| `dist/404.html` | `26a6ddb` (d17) | 58,344 |

`/` lost ~15KB when the second character left the page that matters. `/404`
gained ~40KB: three scene variants plus the stage chrome, where it previously
carried one hand-authored scene and no approach machinery. **Caveshen has seen
the `/404` growth and accepted it** as the price of the 1:1 ruling.

**Easy to misread, so stated plainly:** hidden SVG subtrees are parsed and held
in memory, but they are **not laid out and not painted**. The effect is **parse
time and bytes, not raster work.** Do not claim a rendering win or loss from any
of this, in either direction.

**No Lighthouse tooling exists in this repo** (verified across `package.json`,
`.github/workflows/` and `docs/`). Any "Lighthouse ≥ 95" claim anywhere in this
document is **a manual browser check with a recorded date and method, or it is
not claimed.** It is not a suite gate, and adding tooling is its own decision.

**Status: ✅ BUILT — four of five, `daaafb9` (+ `3f322ae` for the honest version
of item 5). vitest 65/65; Playwright 1521 passed / 7 skipped / 0 failed — the
+8 over d17's 1513 baseline is one genuinely new test across eight projects.**

---

## d27. CI: tag pushes fire the deploy workflow — ✅ BUILT

**✅ BUILT 2026-08-02, `daaafb9` on `item/refactor-plan`.**
`.github/workflows/deploy.yml`'s bare `push:` trigger — which matched tag
pushes, and fired a full deploy against known-red superseded code when the
archive tag `archive/d17-first-pass` was pushed — gained
`tags-ignore: ['**']`. Confirmed in the shipped file: branch pushes and pull
requests are unaffected, and the `main` gate on the `build`/`deploy` jobs is
untouched.

**Status: ✅ BUILT.**

---

## d28. Cityscape depth — a staged pass against the "flat" read

Raised 2026-08-02. Caveshen: *"the scene looks good but it's a bit flat, not
as '3d'... more like a novice's attempt at a moving website."* Each stage below
is its own small, reversible commit, reviewed on local dev before the next
stage starts (§2's draft-before-deploy rule) — a sequence of reactions, not
one reveal, per his own framing of this as a moving target.

**Guiding inspiration (Caveshen, 2026-08-02): the *Oblivion* post-tutorial
dungeon exit** — grassy knoll overlooking Lake Rumare, bright sunny day, the
Imperial City receding into hazy distance. This governs the *whole* pass, not
just the later ground-plane idea: the target is bright, sunlit, atmospheric
depth (far things paler, sunk toward the sky's tone), and it should steer the
gradient and distance-tone choices in Stages 2–3 in particular. Reference
only — never traced, shipped, or committed.

**STATUS 2026-08-03: Stages 1–3 built and approved** on `item/cityscape-depth`
(Caveshen on preview: *"I do like this... a step in the right direction...
keep all of this!"*). Stage 5 raised from that same review — see below.
- Stage 1 (`3527cca`, approved): `.bg-layer` counter-scales against the camera
  (`own = damped/cam`, damp 0.4, one `--parallax-damp` knob in `tokens.css`),
  anchored at the shared waterline (`y=480` in all three variants) so the
  coastline seam holds during the zoom.
- Stage 2 (`fc987b3`): sky + far-mountain gradients, `<defs>` per Scene with
  variant-suffixed ids (duplicate-id/WebKit safety); both gradients bottom out
  on one shared `--sky-horizon` token so they read as a single haze. Stops are
  CSS-classed per the `var()` gotcha, and crossfade on theme toggle.
- Stage 3 (`97207d2`): third distance tone `--mountain-fringe` on the
  warehouse fringe (`f-fringe`), a flat fill blended further toward the sky.
All tests proven red then green; suite 1545 passed / 7 skipped / 0 failed.
Stage 4 (idle parallax) still gated on its own go.
Also rode along with Stage 1: gitignored `screenshots/` folder is now the
standing home for all screenshots (recipe updated in `CLAUDE.md`).

### Stage 5 — texture & detail pass (Caveshen's review of Stages 1–3, 2026-08-03)

His notes, verbatim in spirit: more "texture" on the promenade/road surface;
the sun could use glow/bloom, the moon the same but slightly less; the
mountains still look VERY flat, the buildings as well; the strange sky gap
between Table Mountain and Lion's Head; Devil's Peak's peak should come down
~2px. Direction confirmed — build on Stages 1–3, don't rework them.

**STATUS 2026-08-03: 5a–5e built and APPROVED on preview** (*"You smashed
it!"*). His same review raised Stage 6 below and gave Stage 4 its go.
Commits in order: `d7ae68b` (5a: Kloof Nek saddle polygon closes the gap,
Devil's Peak apex −2 units; approach-spec proxy test verified still sound),
`5e08020` (5b: radial halos, sun 0.35 opacity / moon 0.18 ≈ half), `93e19ae`
(5c: lit/shade facets on Table Mountain + Devil's Peak only — the other
massifs stay flat so they don't fight the haze), `a0fda99` (5d: generated
left-edge side-face strip per building, min(4, w×0.3), verified clear of all
windows), `8e6f353` (5e: paving seams every 70 units + ground depth gradient,
darker toward the viewer), `989443c` (regression test: side-face ≠ front-face
fill, both themes, proven red first). Suite: build clean, vitest 65/65,
Playwright **1553 passed / 7 skipped / 0 failed**. Verification note: the
worker's night screenshot had silently captured a 404 page — night was
re-captured and verified by the orchestrator before this status was written.

Sub-items, each its own small commit, in this order (geometry first — it's
the cheapest and the facets must be cut against final ridgelines):

- **5a. Geometry corrections** — close (or at least soften) the sky gap
  between Table Mountain's massif and Lion's Head by raising the saddle;
  lower Devil's Peak's apex ~2 SVG units. Check the approach-spec's Devil's
  Peak proxy test before and after.
- **5b. Celestial glow** — radial-gradient halo behind the sun; the moon gets
  the same at roughly half strength. `radialGradient`, not `feGaussianBlur`
  (deterministic cross-engine, cheaper). Variant-suffixed ids, CSS-classed
  stops — same discipline Stage 2 established.
- **5c. Mountain form** — subtle lit/shade facets (vector polygons, ≤2 extra
  tones per massif) with the light source matching the celestial disc's
  screen position; the flat-silhouette aesthetic must survive, so facets are
  form-hints, not rendering.
- **5d. Building form** — a darker side-face per building with one consistent
  light direction, so the blocks read as volumes instead of rectangles.
- **5e. Promenade texture** — paving seams/expansion joints at low opacity
  plus a subtle depth gradient on the ground plane; texture that reads at a
  glance as surface, not pattern.

### Diagnosis — grounded in the current code, four contributors

1. **No parallax, anywhere.** `stage.js`'s `approach()` (`:161`) sets one
   `transform: translate() scale()` on the single `.camera` div
   (`Stage.astro:31`), which wraps all three `Scene` SVGs whole — background
   and foreground zoom by the identical factor. `Scene.astro` already splits
   `bg-layer` (`:106`) from `fg-layer` (`:121`), but **neither class has a
   single CSS or JS rule attached anywhere in the repo** (`grep -rn
   "bg-layer\|fg-layer" src/` returns only those two markup lines). It is an
   unused seam, not a missing one — the split already exists; nothing reads
   it yet.
2. **Flat fills, no gradients, anywhere.** `grep -rn "linearGradient\|
   radialGradient\|feGaussianBlur\|<defs" src/` returns nothing. Every
   shape — sky, both mountain tones, sea, ground, buildings — is one solid
   `fill`. Depth-via-value (real atmospheric perspective: shapes fade toward
   the sky's own tone as they recede) is approximated by exactly **two**
   hard-edged tones (`--mountain` / `--mountain-far`, `tokens.css:5-6`), not
   a graduated falloff.
3. **Occlusion is correct, and is not the problem — worth saying so it isn't
   "fixed" by accident.** Paint order in `CityScape.astro` is already sky →
   stars/moon → Devil's Peak → Table Mountain → Lion's Head → Signal Hill →
   warehouse fringe → buildings → windows: the right depth order. The
   flatness lives inside each layer (one flat colour), not in the layering.
4. **No ground plane under the mountains or buildings — they meet the sea,
   not land.** Checked directly: `CityScape.astro`'s landforms and building
   `rect`s all share one baseline, local `y=352` (Table Mountain's polygon,
   the `BUILDINGS` array). `Scene.astro` applies each variant's camera
   translate/scale to that baseline, and in **all three variants** it lands
   within a pixel of the sea rect's own top edge — standard/wide:
   `translate(_,128)` puts `y=352` at screen `y=480`, exactly `sea.y`;
   tall: `translate(-20,262) scale(0.62)` puts it at `y≈480.2` against
   `sea.y=480`. That is not a coincidence of rounding, it is the authored
   contract: **the city and the mountains are drawn to end exactly where
   the water begins, with no beach, shelf or hillside between them.** The
   one true ground plane in the scene — the `f-ground` rect, `Scene.astro`
   `:130` — sits *in front of* the sea (e.g. standard `y=600`, below
   `sea.y=480` + `height=120`), and is the foreground promenade the figure
   stands on, not a base the city sits on. **Caveshen's read is correct,
   and sharper than "no gradient": the mountains and buildings are not
   resting on anything — they terminate directly into open water on a
   hard line**, which is exactly why they read as stacked cutouts rather
   than objects occupying a place.

**Not a contributor, don't touch:** the "one world, three cameras" pan/scale-
only rule (§14) is correct and load-bearing — it fixed a real shape-drift bug
and stays exactly as is.

### Noted for later — a ground plane under the city (not scheduled)

Caveshen, on seeing the code confirm the above: a land/coastline plane the
mountains and city could sit on is a real, larger step up in depth — he cited
*Oblivion*'s sewer-exit vista (grassy knoll, water, the Imperial City receding
into a bright hazy distance) for the **quality** he's after, not a literal
scene to copy. **Cited for reference only — never traced, shipped, or
committed; any media he supplies stays out of this repo.** Same standing
constraint as everything else here: vectors and programmatic drawing only,
no generated art.

**Not scheduled — his words, "for now, note it, we'll revisit later."** The
four stages above are unchanged and stand as approved; this is not a fifth
stage and does not restage the path. If a ground/coastline plane is worked
later it is a real design pass in its own right (new geometry, not a CSS
tweak) and deserves its own `d` item when he's ready — left unopened here.

### Staged path — cheapest and highest-value first, each independently reactable

- **Stage 1 — parallax on the existing zoom (near-free).** `stage.js` already
  computes `tx`/`ty`/`scale` for the approach zoom. Expose the scale as a CSS
  custom property on `.camera` (`--cam-scale`; tx/ty were exposed too at
  first, then dropped as unused on review 2026-08-03) alongside the inline
  `transform`, then give `.bg-layer` its own counter-scale rule — a
  **dampened** version of the same zoom, so the mountains lag the foreground
  on approach. As built, the sky rect sits deliberately OUTSIDE `.bg-layer`
  and zooms at full camera rate: a full-bleed gradient lagging the crop
  would expose its own edges. No new assets, no new dependency, reuses
  numbers already computed.
- **Stage 2 — sky and mountain gradients (cheap, SVG-only).** A vertical
  `linearGradient` on `.f-sky` and a horizon-fade on `.f-far` so the far
  mountains sink toward the sky tone rather than hard-cutting to it. Zero new
  assets — gradients are vector, defined once in `<defs>`, reused across all
  three variants. **Estimate: under a day.**
- **Stage 3 — a graduated distance tone.** Replace the binary
  `--mountain`/`--mountain-far` swap with a third, paler step for the
  warehouse-fringe cluster (already the furthest-west `f-far` group) so
  silhouette weight visibly recedes instead of banding in two flat steps.
  **Estimate: a few hours; rides with Stage 2.**
- **Stage 4 — idle-state micro-parallax. GO given 2026-08-03.**
  Extends Stage 1's technique from "on approach" to "always on," desktop
  only, `prefers-reduced-motion` respected — following the precedent already
  set by the wind motes (`Stage.astro:41-49`, deliberately kept outside
  `.camera` so they hold a constant speed under the zoom). The codebase
  already treats "moves independently of the camera" as a known pattern.
  Pointer-driven, rAF-throttled, and it must yield to the approach zoom
  (suspend or damp while the card is open) rather than fight the camera.

### Stage 6 — the "ray-tracing pass" (Caveshen's Stage-5 review, 2026-08-03)

His notes: the promenade fixtures could use shadowing to match the Badger's —
sharper in day, softer/less pronounced at night; and the day sun's edges
should be less sharp, more blurred, to convey the strength of its shine.
Physically these are one observation: a strong point light means bloom at the
source and crisp contact shadows beneath objects; dim diffuse light means
neither. Ruling (orchestrator, design): fixtures get **contact shadows in the
Badger's own idiom** — the ellipse at the base — not directional cast
shadows, which would fight the flat-vector world.

- **6a. Fixture contact shadows** — base ellipses under the promenade
  fixtures (the rail posts; anything else standing on the ground plane),
  matching `Badger.astro`'s existing shadow form. Theme-differentiated via
  tokens: day = smaller/denser (sharp light), night = wider/fainter (diffuse
  light). Generated alongside the posts, not hand-placed.
- **6b. Sun edge softening** — the sun disc's own fill becomes a radial
  gradient: solid core holding `--celestial`, softening over the outer edge
  band into the existing halo, so disc and bloom read as one source. The moon
  keeps her crisp edge (his ask was the sun; the moon's halo already sits at
  half strength). Same `radialGradient`/variant-id/CSS-stop discipline as
  Stages 2 and 5b.

**STATUS 2026-08-03: Stages 4 and 6 APPROVED — d28 complete, pre-PR review
in flight.** 6a/6b were "overwhelmingly a yes" as built; Stage 4's drift was
too strong at 6 units and was softened to 2.5 (`2898c5b`), then accepted.
Commits: `e84d0f3` (Stage 4: pointer-driven drift, originally 6 SVG units,
window-listener since the frame is pointer-events:none, rAF-coalesced,
reduced-motion re-checked live, drift zeroed in the same frame as approach so
it rides the mirrored 550ms transition), `dc7cf24` (6a: shadows generated
from the same rail-post array — night rx16 wide/faint, day rx10 tight/dense
(effective opacities 0.088/0.18: the stated 0.22/0.45 × a folded 0.4 alpha),
differentiated by CSS rule + the `data-time` switch rather than tokens; Badger's
own shadow untouched), `14d52c1` (6b: sun core solid to 0.81 fading to edge,
radius 50→62 compensated so the perceived disc size holds; moon untouched,
selector scoped to `circle.f-cel`), `681b2e0` (reviewer nit fixes — the
worker ran its own reviewer pass mid-flight). New idle-parallax e2e test
proven red then green. Suite: build clean, vitest 65/65, Playwright
**1569 passed / 7 skipped / 0 failed**.

Two further preview notes from Caveshen, 2026-08-03, both accepted:

- **Waterline seam vs idle drift.** DONE — `0a19db4`: every baseline vertex
  and generated rect extended 6 units below the waterline (`SEAM_MARGIN`,
  applied only where a shape's bottom sat exactly on the baseline); facets
  moved with their parents; edge audit found 15–150+ units of side overscan
  already present. Gap proven red first (a real 3.5px rip at max drift), then
  green. Table Mountain's bbox ratio legitimately changed 2.4194 → 2.3622;
  both spec literals retargeted (not weakened). **NOTES for the d18 merge:**
  `item/visual-validation`'s M4 "land bottom == sea top ±1px" tolerance must
  widen to cover the 6-unit overscan, and any `2.4194` ratio literal on that
  branch must become `2.3622`.
- **The banner plane is always white.** DONE — `424d9b3`: `color: #fff` +
  faint drop-shadow (day-sky legibility; naturally inert at night).
  **Standing ruling (2026-08-03): the towed banner itself is black with
  white text, ALWAYS — never themed.** It already sets its own colours
  locally; keep it that way.

**6a follow-up (Caveshen, 2026-08-03, from a preview crop): the railing still
reads shadowless.** DONE — `a25cc30`: ellipse opacity 0.088→0.55 night /
0.18→0.75 day, plus a full-width shadow band 2 units below the posts' foot
line; visibility-floor test proven red against the old faint values. Suite
1577 passed / 7 skipped / 0 failed. Two causes: the night post-shadow's effective opacity
(0.088) is invisible on the dark ground, and the horizontal rail run casts
nothing at all. Fix: raise the shadow opacities until they read at a glance
in both themes (day stays denser than night, per the original ruling), and
give the rail run itself a grounded presence — likely a faint continuous
shadow band under the bottom rail, same contact-shadow idiom, subtle enough
to stay surface rather than effect. Screenshot-verified in both themes, with
a crop matching his.

**`three.js` stays explicitly out of scope for all of the above** (his
ruling), noted only as where it would eventually replace this whole layer if
the vector approach hits a ceiling — that is its own future item, with its
own new-dependency conversation, not part of d28.

**Tradeoff, stated plainly:** Stages 1-3 cost nothing measurable in bytes
(CSS/gradients, no new requests, no new dependency) and nothing in redundancy
(Stage 1 reuses numbers `stage.js` already computes) — a straight win on
performance, no-bloat and fun-to-interact-with at once, no conflict to
adjudicate. Stage 4 is the one worth a second look before building: it runs
on every frame/scroll tick, so it is the one place performance and "fun"
could pull apart if done carelessly — throttle it.

### The Badger on `/sheet`, and whether it shares technique

d24 (still DESIGN STAGE, no go) is **not** part of this depth work — it is
explicitly "out of the scene... no viewBox, no CityScape" by its own text.
The only thing worth carrying across is the **idiom**, not a technique: d24's
eventual brief should reuse the CSS-only, `prefers-reduced-motion`-gated,
hard-cut `steps()` pattern already proven by `Badger.astro`'s two-frame idle
(`--badger-cadence`, `:63-77`) rather than invent a second animation
contract. No parallax or gradient work belongs there — a menu portrait has no
depth to fake. (Cross-referenced at d24 itself.) [Note 2026-08-08: d24 has since shipped a STATIC portrait — decision 1, 2026-08-07; the idle-idiom recommendation above is superseded.]

**Status: ✅ merged to main (PR #8) — all stages built stage-by-stage on
preview and accepted 2026-08-04; the STATUS blocks above are the record.**

---

## d29. Comment sweep — repo-wide

**STATUS: ✅ merged to main (PR #7).** Branch `item/comment-sweep` also carried
the fix for the deploy trigger d27 broke, d13 (`Avatar.astro` scoped, verified
in built CSS), and two standing rules now in `CLAUDE.md`.

Pass 1 (`02d16cd`) removed the tracker citations. Pass 2 (`03eba87`) read
every comment in every file and cut what the code already says: 664 lines out,
256 in, net −408, comment-only (verified mechanically — no code line changed).
Headline: `camera.js` 24/35 → 3/14, `stage.js` 113/313 → 53/250,
`Badger.astro` header 25 lines → 9. Kept: `ponytail:` markers, SVG path-data
labels (the only decode key for opaque coordinates), and genuine constraints
(raster units, `steps(1,end)`, the 404-narrated-not-displayed guard, the
`astro dev` daemonisation warning). Build clean, vitest 65/65, Playwright
1521 passed / 7 skipped / 0 failed.

---

Split out of d26 2026-08-02 (second pass, Caveshen's ruling): judgement-heavy
work does not belong beside d26's mechanical dedupe — mixing the two is how a
clean sweep turns into an argument, and it would wreck d26's bisectability.

Per CLAUDE.md's tracking rule (commits record changes, the PRD manages the
work, comments explain code — nothing tracked twice). `grep -rn "PRD \|§"
src/ e2e/ docs/` — measured 2026-08-02: **116 matches across 25 files**,
heaviest in `e2e/interview.spec.js`, `src/components/Stage.astro`,
`src/scripts/stage.js`.

**Judgment per line, not a blind strip:** a comment explaining *why*
non-obvious code is the way it is stays; the tracker citation and any
history of deleted code goes. Flag anything ambiguous rather than guessing.

---

## d30. Easter egg — the banner plane crashes when clicked

Proposed by Caveshen 2026-08-03, his own words: *"What if we click on the
plane as it flies past, and the plane crashes???"* Deliberate scope-creep,
owned as such. **🔧 in build — go given 2026-08-06.** The sketch below is the
reasoning trail; success criteria are pinned immediately after it.

Sketch (cartoon physics, never grim — the register is slapstick):

1. **Hit target**: the plane is small and moving; wrap it in an invisible
   padded hitbox (≥44px effective) so clicking it is a game, not a test of
   aim. Pointer and touch both.
2. **The crash**: on click — a sputter (two or three tilt oscillations), then
   a spiral dive toward the sea, the banner detaching to flutter down
   separately; a small splash at entry reusing the existing wave idiom, brief
   ripple, gone. Total under ~2s so it never upstages the interview.
3. **Respawn**: the scheduler already flies the plane on a jittered interval
   (`PLANE_JITTER_MS`) — the next scheduled flight simply happens, unbothered.
   Optionally the banner text changes for the flight after a crash (one cheeky
   PLACEHOLDER line, Caveshen's to write, per the copy rule).
4. **Discipline**: CSS/vanilla JS only, no new deps, no sound (the site has
   none). `prefers-reduced-motion`: no crash animation — the existing rule
   already suppresses the flight itself, so the hitbox never exists there.
   No-JS: the plane is JS-flown already; nothing to do.
5. **Tests**: click mid-flight → crash class appears and the plane leaves the
   viewport below the waterline; reduced-motion → no listener. Screen-space,
   proven red first, per d18's discipline.

Estimate: under a day. Built on `feat/plane-crash`.

### Success criteria (distilled from the sketch, go 2026-08-06)

1. An invisible padded hitbox (≥44px effective) sits over the plane while it
   flies, pointer and touch both; it never exists under
   `prefers-reduced-motion: reduce` (the flight itself is already suppressed
   there — verified, not just assumed).
2. Click: sputter (2–3 tilt oscillations) → spiral dive toward the sea → the
   banner detaches and flutters down on its own, separate arc → a small
   splash reusing the scene's `f-wave` colour/shape idiom → brief ripple,
   gone. Total under ~2s.
3. Respawn is free: the existing jittered scheduler (`PLANE_JITTER_MS`) just
   flies the next plane. **The optional post-crash banner-text change is
   deliberately not built** — that copy is Caveshen's to write later, per the
   copy rule (§23 checklist item 1 / d21).
4. CSS/vanilla JS only, no new dependencies, no sound. No-JS needs no change
   (the plane is JS-flown already).
5. `e2e/banner-plane.spec.js` gains: (a) click mid-flight → crash class
   appears and the plane ends up below the waterline, then is ultimately
   removed from the DOM; (b) reduced-motion → no plane, so no listener/hitbox
   either. Existing banner-plane tests stay green, unchanged.

**CI-only fix, 2026-08-06.** The waterline assertion in (a) passed 72/72 on
local Windows (three runs) but failed on CI: iphone-se off by 59px, and
desktop-firefox timed out inside `boundingBox()`. Root cause was the
assertion itself, not the crash — it polled the plane's live position after a
`waitForTimeout`, racing a real animation on a slower host (iphone-se sampled
mid-dive; firefox's sample landed after splashPlane()'s later removal, where
`boundingBox()` waits forever). Fixed by reading `--dive-y`, the dive's
computed target, straight from the plane's inline style right after the click
resolves — it's baked synchronously in `crashPlane()` before the animation
starts, so there's nothing to race. Re-verified regression power by
reinjecting both proven bugs locally: the SEA_FRACTION fallback still failed
red on all 8 projects (~43px, matching the original bug's magnitude), and the
untouched banner/hitbox differential still failed red on the detached-rect
bug (~117px).

---
## d31. Game-feel UI pass — streaming dialogue text and a selection idiom

**🎨 DESIGN BRIEF 2026-08-03 — resolved 2026-08-04, both parts built.** The
proposals and veto-points below are the reasoning trail; see the status block
at the end of this section for what shipped. Branch: `item/game-feel-ui`.

Caveshen, raising it:

> the buttons are quite static and feel more like a website button than a
> "game"-y button … why doesn't the text stream, why does it immediately load,
> it's so static and boring … perhaps a streaming character-set like an in-game
> dialogue, where you can skip the streaming with a mouse tap to instantly
> complete the stream. Hopefully not too much to hand-craft here.

Two parts, independently shippable and independently vetoable. **A** is the
typewriter; **B** is the button language. Neither depends on the other.

---

### Part A — streaming dialogue text

#### A1. Cadence — **28 ms/char, with a punctuation beat.** *Propose.*

**Because** 28 ms is ≈36 chars/s, mid-band for the genre (RPGs sit at 20–40 ms)
and slow enough that the eye reads *with* the stream rather than chasing it.
Today's placeholder lines run 70–190 chars, so a line takes 2.0–5.3 s — the
skip is what makes that acceptable, not the cadence.

The beat is the classic trick and it is three lines: **+180 ms after `.`
`!` `?`, +90 ms after `,` `;` `:` `—`.** It is most of what separates "typing"
from "speaking", and it costs nothing to remove.

**Veto-points:** the 28; the two beat values; the beat at all. One constant
`STREAM_MS` and one small `PAUSE` map in `dialogue.js`, no CSS, no data.

**Deliberately skipped:** adaptive speed by line length, a settings toggle, a
"hold to fast-forward". The skip already covers a reader in a hurry, and
Caveshen owns the copy, so he owns line length. Add if his real copy runs long.

#### A2. Skip — **any click, tap or keypress on the card completes the current line. It never advances past it.** *Propose.*

| State | Input | Result |
|---|---|---|
| streaming | click/tap anywhere on the card (including on a choice) | line completes instantly; **the click is swallowed** — no choice is taken |
| streaming | Enter / Space / any character key | line completes instantly; **no activation** |
| streaming | Tab / Shift+Tab | normal focus movement, stream keeps running |
| streaming | Escape | exits the dialogue (existing behaviour, always) |
| complete | click on a choice | takes the choice — normal |
| complete | Enter / Space on the focused choice | takes the choice — normal |
| complete | Escape | exits — normal |

Mechanically: one **capture-phase** `pointerdown` + `keydown` listener on
`.card` that, while streaming, calls `complete()` then
`stopPropagation()`/`preventDefault()`. Escape and Tab are exempted by key
check — **the Escape exemption is load-bearing**: `stage.js` listens for
Escape on `document` in the bubble phase, so swallowing keydown at the card
would silently kill the exit contract that `approach.spec.js` pins on both
routes.

**The one real cost, stated plainly:** a keyboard or screen-reader user who
already has the full line (A4) must press Enter twice — once to complete,
once to choose. **The alternative** is exempting Enter/Space from the swallow
so keyboard activation always activates (the next line's render supersedes the
stream anyway, so nothing breaks). That is arguably kinder and is *less* code.
**Recommended anyway: keys complete**, because he asked for "keypress" and
because mouse and keyboard sharing one rule is the whole point of Part B.
**Veto-point:** flip this and Enter/Space activate straight through.

#### A3. Choices during the stream — **rendered immediately, dimmed, inert.** *Propose.*

**Because** the focus contract demands it: `approach.spec.js` asserts the first
choice is focused the moment the card opens, on both routes. "Appear on
complete" means either that test breaks or focus has to be stolen mid-line —
and it makes the card grow under the reader's eyes. Dimmed costs nothing and
the buttons stay where they will be.

Dim by `opacity: .55` on the `<ul>` while `.card.is-streaming`. **WCAG note:**
this is a transient, non-interactive state (every activation is swallowed by
A2), which is the disabled-control carve-out, not a contrast regression — and
the settled state, which is what AA is measured on, is untouched.

**Veto-point:** he may want them to fade *in* on completion for drama. That is
buildable, but it costs a focus re-target and a card that changes height
mid-line; say so and it gets specced properly rather than bolted on.

#### A4. Hard constraints — not negotiable, encode them

1. **`prefers-reduced-motion: reduce` → no stream at all.** Full text, instantly.
   Reuses the `reduced` flag `initEngine` already computes for the 200 ms fade —
   **no new mechanism**, one more `if` on the existing branch.
2. **Screen readers get the whole line immediately. The stream is visual-only.**
   `#speech` stays the live-region node and keeps receiving the complete line in
   **one** mutation, exactly as today; the stream runs in a *separate*,
   `aria-hidden="true"` node **outside** `[aria-live]`. Per-character mutation
   inside a live region is the failure mode this avoids — most screen readers
   re-announce on every subtree mutation, which would turn one line into sixty
   interruptions.
3. **`#speech` is visually swapped out, never `display:none`d.** Use the
   clip-rect visually-hidden idiom while streaming (`position:absolute;
   clip-path: inset(50%)`) — `display:none` and `visibility:hidden` both remove
   the node from the a11y tree and kill the announcement outright.
4. **At completion the DOM returns to exactly today's shape** — stream node
   removed, `#speech` unhidden with the full text. The steady state, which is
   what every existing test and screenshot samples, is unchanged by
   construction.
5. **Layout must not reflow per character.** The stream node holds the *whole*
   line at all times, split into `<span>` shown + `<span class="pending">`
   with `visibility: hidden` on the tail. The glyphs keep their boxes, so the
   line wraps once and never re-wraps. This is the reason not to append text
   node by node.
6. **No-JS path is untouched.** `#speech` is server-rendered with the full line
   and no stream node is ever created. `interview.spec.js`'s two no-JS
   assertions must stay green without edit.
7. **The 200 ms fade composes, it does not fight.** The stream starts *inside*
   `apply()`, after the fade lands — old line fades out, new line types in.
   The stream node is created fresh per line, so it needs no fade of its own.
8. **The focus contract is unchanged.** Focus still lands on the first choice
   the instant the card opens and after each choice, streaming or not.

##### The trap that will bite: `.speech` must stay a single element

`e2e/hygiene.spec.js:15` and `e2e/not-found.spec.js:80,83` locate **`.speech`
by class**, not `#speech`. Playwright's strict mode throws the moment a second
`.speech` exists in the DOM — even transiently, even on a page the test was not
looking at. **The stream node must carry its own class** (`.speech-stream`),
with the shared typography expressed as `.speech, .speech-stream { … }`. Also
match `min-height: 3.2em` and the `.speech` font-size on it, or the card will
jump by a line at the swap.

##### The other trap: card CSS stays `is:global`

d25's standing ruling. `dialogue.js` creates the choice buttons at runtime, so
Astro's scoped-style hash never reaches them. Anything new here — the stream
node's CSS, the dim state, every one of Part B's selectors — goes in
`Stage.astro`'s `is:global` block. It compiles, builds green and passes every
test while silently unstyling the whole card if it does not.

#### A5. Implementation sketch — one reveal function, one skip handler

All of it in `src/scripts/dialogue.js`, ~30 lines, **no library, no
per-line hand-crafting** (his last sentence; nothing about this touches the
dialogue JSON):

- `initEngine`'s `els` argument gains **`cardEl`** (optional) and its options
  gain **`streamMs`** (default 28, so tests do not sleep for seconds).
  The return stays the bare `render` function — `stage.js` changes by one added
  key, the vitest `mkEngine` helper by none.
- `stream(text)` — sets `#speech`, hides it, builds the two spans, starts one
  timer, returns nothing. Module-level `complete` holds the current line's
  finisher (`null` when idle) — that *is* the "am I streaming?" state.
- `complete()` — fill the shown span, clear the pending span, clear the timer,
  swap `#speech` back, drop `.is-streaming`, `complete = null`.
- The capture listener is attached once, at init, and no-ops when
  `complete === null`.
- `reduced || immediate` skips the whole path, as it already does for the fade.

**Veto-point:** giving the engine a `cardEl` widens its DOM remit. It already
creates buttons and manages focus, so this is a difference of degree; the
alternative is exporting `skip()` and wiring the listener in `stage.js`, which
splits one behaviour across two files.

#### A6. Tests — red first, every one

New (unit, happy-dom, `src/tests/dialogue.test.js`): mid-stream the visible
text is a **strict prefix** and shorter than the line, while `#speech` already
holds the line in full; `complete()` fills the line and clears the streaming
state; `reducedMotion: true` never creates a stream node.

New (e2e): click on the card mid-stream completes the line and **does not
advance the node** (speech and choices unchanged after the click); click on a
*choice* mid-stream needs a second click to navigate; Escape mid-stream still
exits and returns focus to the prompt; reduced-motion shows the full line
immediately after approach; exactly **one** `.speech` element exists at every
point of a stream.

Unchanged and must stay green **without edits**: `approach.spec.js`'s
focus-after-approach and Escape contracts on both routes, `interview.spec.js`'s
no-JS assertions, `not-found.spec.js`'s speech-changes assertion,
`hygiene.spec.js`'s `.speech` read.

**2026-08-04:** this section originally also listed `interview.spec.js`'s full
keyboard playthrough as needing no edit — that missed that the A2 ruling below
(keys complete a mid-stream line rather than activating it) changes what a
keyboard playthrough of that test's exact path has to do. Retargeted to the
new contract instead of exempted from it.

**Estimate: under a day.**

---

### Part B — game-feel buttons

Today every control is the same pill: `border-radius: 999px`, mono, 1.5 px
border, hover/focus swaps colour and border to `--btn-hover-*`. Choices add a
`translateY(-1px)` lift. It is tidy, coherent, and it is a website. The pass
below adds a **selection idiom** — the thing an RPG menu has and a web page
does not — across the approach prompt, the dialogue choices, the system
options, End dialogue and the theme toggle.

#### B1. A selection caret — **`▸` (U+25B8), on `:hover` AND `:focus-visible`.** *Propose. Highest payoff for the least code.*

**Because** one glyph does the whole job: it makes mouse hover and keyboard
focus speak the same language (a cursor pointing at the selected row), it is
unmistakably a menu, and it is native to the mono face already in use.

- `::before` on every selectable control, in a **permanently reserved gutter**
  (`1.25ch`), `opacity: 0 → 1`. Reserved, so nothing shifts when it appears —
  a caret that reflows the row is worse than no caret.
- **No motion on it.** No bounce, no slide-in, per the reduced-motion floor;
  the existing `transition: none` blocks already cover the fade.
- Colour follows the hover state's `--btn-hover-text` (choices) /
  `--stage` (system), so it inherits both themes for free.

**Veto-points:** the glyph (`▸` vs `»` vs `❯` vs `>`); whether it also shows
on `:active`; the gutter width.

#### B2. A press state — **`:active { translate: 0 1px; }`, everywhere.** *Propose.*

**Because** nothing on this site currently responds to being pressed, and a
1 px push is the cheapest possible "it is a physical thing". Choices already
lift 1 px on hover, so hover → press is a 2 px travel: a real click.

**Translate, not transform** — `.approach-prompt` carries a JS-set
`transform: translateX(-50%)` from `positionPrompt()`, and a `transform` in CSS
would blow it away and fling the prompt sideways. The independent `translate`
property composes with it. (Same trap as B6.)

**No scale.** On a full-width pill a scale reads as a wobble, not a press.
**Veto-point:** whether the hover lift survives at all — press-only is also
coherent.

#### B3. The box — **pills become 4 px-radius rectangles with a 2 px border.** *Propose, and this is the one to argue about.*

**Because** the pill is the single most "web form" thing on the page.
A near-square, thicker-bordered row is the JRPG menu box, and it costs two
property changes.

**This is a deliberate deviation from Sample C's pill language (§2), which is
why it is a proposal and not a plan.** Cheap fallback if he says no: keep the
pills and take the game-feel from B1 + B2 + B4 alone — those three carry most
of it.

**Rejected alternative, recorded so nobody re-proposes it:** notched corners
via `clip-path`. `clip-path` clips the `outline` too, so every
`:focus-visible` ring on the site would vanish — a straight breach of §2's
accessibility floor. Workarounds exist (wrapper elements, box-shadow rings);
none is worth it for a corner cut.

#### B4. Hover fill — **give night a real one.** *Propose.*

`--btn-hover-bg` is `transparent` at night and a solid amber by day, so the two
themes do not behave alike: day fills the row, night only recolours the text.
Propose `--btn-hover-bg: rgba(255, 215, 94, .10)` at night — a wash that reads
as "this row is selected" without touching the AA-checked foreground colours.
**Veto-point:** he may prefer night's restraint, in which case day should
arguably lose its fill instead, for parity.

#### B5. System options stay distinct — **one language, two weights.** *Propose.*

End dialogue and the `/sheet` link are chrome, not conversation, and they half
say so already (dashed border, `--dim`, 0.82 rem). Make it deliberate: they
**take the same caret** (one selection language, so a keyboard user is never
confused about what is selected) but get **neither the hover fill nor the press
lift** — border and text highlight only, as today. Conversation reacts; chrome
acknowledges.

**Rides along, cheap:** `.end-dialogue` duplicates `.choices button.system`'s
rule block in the same file (`Stage.astro`) — this pass should merge them into
one selector rather than author the new properties a third time. It is the
same class of debt d11 closed.

**Veto-point:** give system options no caret at all and let the caret mean
"this is dialogue".

#### B6. The approach prompt — **a slow idle bob.** *Propose.*

**Because** this is the one control that is asking to be interacted with, and a
prompt that never moves is exactly the "static" complaint. 2 px, 2.4 s
ease-in-out, infinite. Off under `prefers-reduced-motion` (which the file
already does for its transition).

**Same trap as B2:** animate the independent `translate` property, never
`transform` — `positionPrompt()` owns this element's `transform` at runtime and
sets it twice, differently, depending on whether the figure has headroom.

**Also in scope, and grounded:** the prompt is ~26 px tall
(0.35 rem padding, 0.75 rem font). **That is well under the 44 px touch
target** on the one control a phone visitor must hit first. Bump the padding.
The fullscreen toggle is 40 px — near enough to mention, optional to fix.

**Veto-point:** the bob at all; he may want the prompt dead still and the
game-feel purely from the caret.

#### B7. The theme toggle — **join the HUD, then flip.** *Propose.*

It is the odd one out: `.page-foot` and `.fullscreen-toggle` are translucent
glass chips with `backdrop-filter`, and the theme toggle sits in the opposite
corner in solid `--card`. **Unify it onto the glass treatment** — four lines,
and the three corner elements finally read as one HUD instead of two chrome
styles.

The diegetic touch: on click, the ☀/☾ glyph does **one 180° `rotateY` flip**
(220 ms) as the theme crossfades — turning the sky over. `syncLabel()` already
rewrites the glyph, so the flip just needs a class toggled around it. Off under
reduced-motion.

**Veto-point:** the flip; or the glass unification on its own if he likes the
toggle's current weight.

#### B8. Constraints on all of Part B

Pure CSS wherever it can be (only B7's flip needs a JS class toggle);
`:hover` and `:focus-visible` **always** styled together, no exceptions;
`prefers-reduced-motion` kills every new transition and animation; touch
targets only grow; both themes checked against the `--dim` AA bar noted in
`tokens.css`; **zero new dependencies**; and every new selector lives in
`Stage.astro`'s `is:global` block (see A4's second trap).

**Estimate: under a day.**

---

### What does NOT change

- **The dialogue engine's flow.** Node graph, `render(id, immediate)`,
  `resolveNode`/`isPath`/`resolveTheme`, the JSON schema. Part A adds a
  reveal function; it does not restructure the engine, and it touches no data.
- **The focus contract.** First choice focused on approach and after every
  choice; Escape returns focus to the prompt. Pinned on both routes.
- **The no-JS path.** Full speech server-rendered, card visible, `/sheet`
  reachable, End dialogue hidden. Not one byte.
- **The reduced-motion patterns.** The existing `reduced` flag and the existing
  `@media (prefers-reduced-motion: reduce)` blocks are the mechanism; this pass
  adds entries to them and invents nothing.
- **The 200 ms fade and the card's entry transition.** Untouched; the stream
  starts after the fade lands.
- **The camera, the scene, the parallax, the plane.** Out of scope entirely.
- **All copy stays `PLACEHOLDER`** (§2). Nothing in this item writes, edits or
  reflows a single visible word — including the banner, the prompt label and
  every choice label. The typewriter renders whatever string it is handed.

### Success criteria — what "done" means

1. Every new behaviour has a test **proven red before it is made green**: the
   stream reveals progressively, the skip completes without advancing, a
   choice needs a second click, reduced-motion is instant, the live region
   holds the full line from the first frame, exactly one `.speech` exists
   throughout.
2. **The full matrix is green** — vitest and tri-engine Playwright — with
   **only additive** counts against the baseline recorded in d26
   (vitest 65/65; Playwright 1521 passed / 7 skipped / 0 failed). Any test
   *modified* rather than added must be justified in the PR; the existing
   focus, Escape and no-JS specs should need no edit at all.
3. **Both themes screenshot-verified** at 1920×1080 and 390×844: idle, hover,
   `:focus-visible`, `:active`, mid-stream and settled.
4. Keyboard parity proven by hand as well as by test — every state a mouse can
   reach, a keyboard reaches, with a visible ring.
5. Caveshen has seen it on local dev and said yes (§2, draft-before-deploy).

### Open questions — RESOLVED (Caveshen, 2026-08-04: "happy to accept your
recommendations and we can dig deeper into them after")

1. **A first, then B** — two commits, reacted to separately.
2. **Keys complete the stream** mid-line; activation requires a completed line.
3. **B3 accepted** — pills become 4px-radius rectangles with the 2px border.
4. **B6 accepted** — the slow idle bob, reduced-motion gated as proposed.

**Part A — accepted 2026-08-04.** Caveshen, on preview: "Yeah, this is great!
I love it."

**Part B — built 2026-08-04, on `item/game-feel-ui`.** B1–B8 as recommended
above, plus two deviations forced by real constraints hit during the build:

- **B1 caret**: added to the approach prompt, dialogue choices (regular +
  system), and End dialogue. **Not** added to the theme toggle — B7 gives it
  its own diegetic device (the flip) instead, and never asks for a caret.
- **B2 press**: `:active { translate: 0 1px }` on the approach prompt, choices,
  and theme toggle. Choices' `:active` also resets the hover-lift `transform`
  (not just adds to it) — otherwise the -1px lift and +1px press cancel to a
  1px net travel instead of the PRD's "hover -> press is a 2px travel".
  System options and End dialogue get neither (B5).
- **B3 box**: 4px radius, 2px border on the approach prompt, choices, End
  dialogue, and theme toggle.
- **B4**: night's `--btn-hover-bg` is now `rgba(255, 215, 94, .10)`.
- **B5**: `.choices button.system` and `.end-dialogue` share their hover/caret
  rules; merged per the "rides along" note.
- **B6 idle bob — deviation.** The bob animates an inner `<span
  class="prompt-label">` wrapping the button's text, not the button itself.
  An infinite CSS animation directly on `#approach-prompt` makes its
  `getBoundingClientRect()` change every frame, which permanently fails
  Playwright's click-actionability "stable" check — proven empirically, it
  broke every existing spec that clicks the approach prompt (approach.spec.js,
  badger.spec.js, dialogue.spec.js, interview.spec.js, and more). The button's
  own box now stays static (what positionPrompt() measures and what click
  stability polls); only the label visibly bobs. Same "it moves" effect Caveshen
  asked for, zero risk to the click contract. Also bumped the prompt's vertical
  padding for the 44px touch target, as the PRD suggested.
- **B7 theme toggle — deviation.** Glass-HUD background + B3's box + the 180°
  rotateY flip on click, as specced. The flip's CSS (`.toggle-icon`,
  `.toggle.flipping .toggle-icon`, `@keyframes toggle-flip`) lives in a
  *second*, `is:global` `<style>` block in ThemeToggle.astro, not the scoped
  one — `syncLabel()` rewrites the toggle's `innerHTML` on load and on every
  click, so the glyph span it creates never carries Astro's scoped-style hash.
  Same trap A4 flagged for dialogue.js's card elements, just in a component
  Part A never touched.
- **B8**: confirmed — pure CSS bar the flip's class toggle, `is:global` where
  JS-created elements need it, reduced-motion kills every new transition and
  animation, touch targets only grew.

New coverage: `e2e/button-feel.spec.js` (caret on hover/focus-visible, press
state incl. system's no-lift carve-out, box shape, idle-bob and flip
reduced-motion gating). Full matrix: vitest 70/70, Playwright 1727 passed /
17 skipped / 0 failed — additive only, no existing spec edited.

**Review pass (f970df0 → 20e6b33 → tidy-up), approved.** Two things worth
remembering, not just fixing:
- CSS generated content participates in accessible-name computation — a caret
  glyph needs the alt-text form (`content: '▸' / '';`) to stay out of it.
- The build's minifier folds the independent `translate` property into
  `transform` (e.g. `transform:none; translate:0 1px` → `transform:
  translateY(1px)`), so any carve-out that needs to neutralise a press/hover
  offset must reset `transform`, not `translate` — resetting only `translate`
  silently stops working once that folding happens.

Full matrix, final state: vitest 70/70, Playwright 1727 passed / 17 skipped /
0 failed.

**Part B — accepted 2026-08-04.** Caveshen, on preview: "Yeah looks fantastic
… I LOVE the idle bob on the text." (He'd considered bobbing the button itself;
the label-only bob covered it.) d31 complete.

**CI-only fix, 2026-08-05.** Two button-feel.spec.js tests passed on local
Windows WebKit but failed on CI's Linux WebKit (mobile projects only, one
failure each, iphone-se and iphone-15pro respectively — both were simply
ungated). Press-state's hover-then-press premise doesn't hold on touch, now
gated on the project's static `hasTouch` (chosen because a static value
can't diverge between hosts). The flip test's `animationstart` failed to
fire once on iphone-15pro; root cause unconfirmed — plausibly the 220ms
cleanup timeout cancelling the animation before a stalled worker's first
frame, not confirmed as an engine-semantics issue. Fixed with the canonical
remove/reflow/add restart idiom, which is defensive regardless of cause and
also fixes a real rapid-double-click bug the old add-only code had (inside
the 220ms window `flipping` was already present, so a bare `classList.add()`
was a no-op).

**Durable simplification, actioned 2026-08-06:** `syncLabel()` no longer
recreates `.toggle-icon` via `innerHTML`; it mutates the existing span's
`textContent`/glyph and its adjacent label text node in place, plus the
button's `aria-label`. The span is never rebuilt, so it keeps Astro's
scoped-style hash — confirmed empirically in the `dist` build
(`.toggle-icon[data-astro-cid-l6lhmie6]`) — and the second `is:global` style
block (the scoped-hash trap A4 flagged) folded back into the normal scoped
`<style>` block. The flip-restart idiom
(`remove('flipping'); void offsetWidth; add('flipping')`) is unchanged — it
independently fixes the rapid-double-click no-op regardless of this
refactor. Full matrix: Playwright 1813 passed / 19 skipped / 0 failed,
unchanged from the branch baseline.

---

## d32. Scene→sheet transition — the Badger travels to his portrait seat

### 🚧 IN BUILD — go given 2026-08-08 ("happy for your recommendations - go for it")

All three open questions were ruled in favour of the brief's recommendations —
see *Rulings* at the end of this section.

**The idea (Caveshen's), captured 2026-08-08:** when the dialogue option on `/`
that leads to the character sheet is clicked, the scene Badger travels from his
position in the scene to his d24 portrait seat on `/sheet`. The rest of the
scene fades out, the sheet fades in through its menu-open choreography, the
idle animation dies into the static portrait, and lighting gets a consistency
pass across night/day.

### Goal

When the "open the character sheet" system option on `/` is clicked in a
browser that supports cross-document View Transitions, the scene Badger
travels from his on-screen position (zoom included) to his d24 portrait seat
on `/sheet`. He comes into full colour on the way — the scene-filter-to-colour
crossfade is a deliberate beat, not a defect. The scene fades out under him.
The sheet plays its existing menu-open choreography, except the portrait
slide-in, which the morph replaces. Everywhere else, the site behaves exactly
as it does today.

### Non-goals

No Astro `ClientRouter` — ever, for this item. No change to the stage, camera,
dialogue, or plane-crash logic beyond one call added inside the navigate
callback in `src/scripts/stage.js`. No reverse morph on `/sheet` → `/`. `/404`
does not opt in and is untouched. No new art — `badger-up.png` is the only
asset. No morph below 1650px (the portrait seat does not exist there — see
*Design*, decided on the record). No change to d24's shipped geometry, timing
table, or reduced-motion behaviour on direct visits to `/sheet`.

**Scope honesty (from the consult):** this touches `/` as well as `/sheet`,
and it is bigger than d24's own build. It carries its own tickets, criteria,
and test story.

### Feasibility consult (frontend-design, 2026-08-08) — settled rulings

These facts are settled. Do not re-derive them; do not contradict them.

- **Mechanism: cross-document View Transitions** (`@view-transition`,
  `pageswap`/`pagereveal`), NOT Astro's client router. The router would force
  every script on `/` (stage, camera, plane crash) to survive soft page-swaps
  — a retrofit across the most battle-tested code for a cosmetic gain.
  Native transitions are pure progressive enhancement.
- **The fallback is already built:** browsers without support (Firefox,
  older Safari) get a normal navigation into d24's menu-open choreography.
  The floor is finished; this item only layers on top.
- **The SVG wrinkle:** browsers won't snapshot-morph SVG sub-elements, and
  the scene Badger is a `<g>` in the stage viewBox. Solve by hand-off at
  click time: freeze the idle on the up-frame, overlay an HTML `<img>` of
  `badger-up.png` on his exact on-screen rect, give the overlay the
  `view-transition-name`. Same art, invisible seam — and it produces the
  "animation dies into the static image" beat for free.
- **Lighting/colour:** the stage renders him under its scene filter; the d24
  portrait is full colour. The morph crossfades the two — he comes into
  colour as he takes his seat. Lean in; the "lighting pass" then shrinks to
  tuning the crossfade against both themes.
- **Choreography gating:** arriving via the transition suppresses the
  portrait's slide-in (the morph replaces it); direct visits to `/sheet`
  keep the current entrance. `prefers-reduced-motion`: instant, as
  everywhere.
- **Scope honesty:** touches `/` as well as `/sheet`; needs its own success
  criteria and test story. Bigger than d24's build itself.

### Design

Vocabulary for this section: the **hand-off** is the click-time work on `/`
(freeze the idle, place the overlay). The **morph** is the named-pair view
transition itself. The **arrival marker** is a class the `pagereveal` handler
sets on `<html>` on `/sheet` when a transition is active.

1. **Page opt-in.** Both `/` and `/sheet` declare
   `@view-transition { navigation: auto; }` in their own page style blocks
   (`is:global`, matching the repo's existing page-style idiom). Never in
   `Base.astro` — `/404` must not opt in. **Requirement:** under
   `prefers-reduced-motion: reduce` the swap is instant, with no transition.
   Recommended mechanism: wrap the at-rule in
   `@media (prefers-reduced-motion: no-preference)`. The worker must verify
   that the wrapped at-rule really gates in Chromium; if it does not, use a
   `pageswap` listener that calls `viewTransition.skipTransition()` when
   reduced motion matches. The requirement binds; the mechanism does not.
2. **The shared name.** `view-transition-name: character-portrait`. It appears
   in exactly two places: CSS on `.sheet-portrait img` in `sheet.astro`, and
   JS on the overlay in the hand-off module. Fixed here so the two build
   tickets do not depend on each other for the string.
3. **The hand-off module.** New file `src/scripts/portrait-handoff.js` — a
   deep module behind one function, `maybeHandoff(path)`. `stage.js` calls it
   once, inside the existing navigate callback, before
   `window.location.href = path`. That one line is the only edit to the
   battle-tested `/` scripts. The module is a no-op unless every gate holds:
   - `path` is `/sheet`;
   - the engine supports cross-document View Transitions — detect
     `'onpageswap' in window`, NOT `document.startViewTransition` (that only
     proves same-document support);
   - the viewport matches `(min-width: 1650px)` — the portrait's own
     breakpoint;
   - `prefers-reduced-motion` does not match;
   - a laid-out `.badger-figure` exists (`/404`'s hooded figure never
     qualifies, and its tree has no `/sheet` option anyway).

   The gate decision is a pure exported predicate so vitest can cover it
   without a DOM.
4. **What the hand-off does when the gates hold.** Freeze the idle on the up
   frame with inline styles on the two SVG `<image>` elements
   (`animation: none`; opacity 1 on `.badger-up`, 0 on `.badger-down`). Read
   the visible `.badger-up` element's `getBoundingClientRect()` — it already
   includes the camera zoom, so the rect is his true on-screen box even
   mid-dialogue at scale 2.2. Append one `position: fixed` `<img
   src="/badger-up.png">` to `document.body` at that rect. Copy the scene
   image's computed `filter` onto it, so the old snapshot carries the scene
   look and the morph's crossfade lands on full colour. Give it
   `view-transition-name: character-portrait` and `pointer-events: none`.
   Then hide the two SVG `<image>` elements (`visibility: hidden`) so the
   root snapshot does not show a second Badger under the travelling one. The
   ground-shadow ellipse is left alone — it fades out with the scene, which
   reads as the shadow staying on the ground. Then navigation proceeds as
   today.
5. **Stranded hand-off cleanup.** The module registers a `pageshow` listener
   on `/`. When the page is restored (back/forward cache), it removes the
   overlay and clears the inline freeze styles, so the idle runs again. On a
   fresh load there is nothing to clean; the listener is cheap and always
   registered.
6. **Arrival on `/sheet`.** A tiny `is:inline` head script registers
   `pagereveal`. When `event.viewTransition` is truthy it sets the arrival
   marker (class `arrived-by-morph`) on `<html>` — `pagereveal` fires before
   first paint, so there is no flash of the wrong state. One CSS rule: under
   the marker, `.sheet-portrait { animation: none; }`. The base
   `transform: translateY(-50%)` remains in force, so the d24 geometry is
   untouched; the fill-mode pre-start never paints because the animation is
   gone entirely. All other menu-open beats (nameplate, columns, XP bar)
   still run — the morph replaces only the slide-in.
7. **Morph tuning.** `::view-transition-group(character-portrait)
   { animation-duration: 400ms; }` as the starting value — inside the sub-500ms
   feel budget d24 set for the page. This is a preview-tuning knob, not a
   contract. The colour beat needs no code: old snapshot filtered, new
   element full colour, default cross-blend between them.
8. **Below 1650px — decided here, on the record.** The Badger does not
   travel; there is no seat to travel to (`.sheet-portrait` is
   `display: none`). The hand-off gates out. Supporting browsers still get
   the page-level default cross-fade from the opt-in — subtle and harmless.
   Unsupported browsers get today's plain navigation.
9. **Return trip `/sheet` → `/`.** No reverse morph. With both pages opted
   in, supporting browsers get the default root cross-fade on the back link;
   the portrait's unmatched name makes it fade out in place, which is the
   default and acceptable. See *Open questions* if Caveshen wants the return
   plain instead.

### Tickets

Each ticket is sized for one worker, one spawn. Never name a file, class, or
comment after the tracker ID.

**T1 — `/sheet` arrival + page opt-ins.** Files: `sheet.astro` (opt-in
at-rule, `view-transition-name` on `.sheet-portrait img`, `pagereveal` head
script, arrival-marker suppression rule, morph duration rule) and
`index.astro` (opt-in at-rule only — style, no script). Includes its e2e
coverage (below). No dependency; can start first or in parallel with T2.
T1 alone is shippable: without the hand-off the supported path is a plain
root cross-fade with the slide-in suppressed and the portrait faded in by
the morph machinery's default entry — correct, just not yet the travel.

**T2 — the hand-off on `/`.** Files: new `src/scripts/portrait-handoff.js`;
one-line call added in `stage.js`'s navigate callback; vitest unit tests for
the gate predicate in `src/tests/`; its e2e coverage (below). No code
dependency on T1 (the shared name is fixed in this brief), so T1 and T2 can
run in parallel. Zero other edits to `/` scripts.

**T3 — the joined journey: cross-page e2e + acceptance evidence.** Depends on
T1 and T2 both merged. New spec file named for its subject (suggested:
`e2e/portrait-journey.spec.js`) covering the full matrix below, plus
screenshots at 1920 for both themes and both times of day for Caveshen's
acceptance (the d24 criterion-10 precedent: the seam and the colour beat are
judged by his eye, not by pixels in CI).

### Per-ticket success criteria — test-shaped where possible

Workers use `/tdd` where criteria are test-shaped. Repo test rules bind: no
`waitForTimeout`, no fixed sleeps; reuse the `settled()` WAAPI helper and
`e2e/geom.js`; auto-retrying assertions (`toHaveClass`, `expect.poll`) for
anything that settles. **Branch tests on execution evidence, not the API probe.**
After `domcontentloaded` settles, read whether `<html>` has `arrived-by-morph`;
branch on that. CI headless Chromium exposes `onpageswap` but does not execute
cross-document transitions, so `'onpageswap' in window` gives false positives
in tests. Production code (`portrait-handoff.js`) correctly still gates setup
on `'onpageswap' in window` — that is a separate concern. Never branch tests on
the Playwright project name — WebKit support can drift under us and the tests
must keep meaning something when it does.

**T1 done means:**

1. When `arrived-by-morph` is set on `<html>` after navigation: goto `/`,
   click `#approach-prompt`, click `#choices button.system`, land on `/sheet`;
   `<html>` has `arrived-by-morph`; `.sheet-portrait` computed `animation-name`
   is `none` and its computed transform is still the translateY(-50%) matrix;
   the d24 centred/gap geometry assertions hold on arrival.
2. Same arrival: `.nameplate-inner`, `.abilities-col`, `.middle-col`,
   `.right-col`, `.xp-fill` keep their d24 animation names — only the
   slide-in is suppressed.
3. Direct `goto('/sheet')` in the same engine: no `arrived-by-morph`;
   `.sheet-portrait` computed `animation-name` is `portrait-slide-in`.
4. When `arrived-by-morph` is absent after navigation: the same click-through
   lands on `/sheet` with no marker and the full d24 choreography, slide-in
   included.
5. Reduced motion (emulated), supported engine: click-through arrives
   instantly with no marker (no transition ran), and the existing d24
   reduced-motion final-state assertions hold on arrival.
6. `/404` has no `@view-transition` opt-in (assert by scanning
   `document.styleSheets` on `/404`, or the built page source).
7. `e2e/sheet-portrait.spec.js` and every other existing spec file are
   unmodified and green.

**T2 done means:**

1. Vitest: the gate predicate returns false when any one of {path not
   `/sheet`, unsupported, width below 1650, reduced motion} holds, and true
   when all gates pass.
2. On `/` with no navigation: no overlay `<img>` exists; the idle runs
   (`e2e/badger-idle.spec.js` untouched and green).
3. The click-through lands on `/sheet` in every project — navigation is
   never broken by the hook, supported or not.
4. Supported engine, 1920: journey to `/sheet`, then `page.goBack()`; on `/`
   there is no overlay element and `.badger-up`'s computed `animation-name`
   is the idle keyframe again (not `none`) — cleanup holds with or without
   the back/forward cache.
5. `git diff` on `stage.js` shows only the single navigate-callback call;
   no other `/` script file is touched.
6. Full matrix green; no existing spec file modified.

**T3 done means:**

1. The journey spec runs across the whole project matrix, branching on
   runtime support: supported → marker + suppression + settled d24 geometry;
   unsupported → no marker + full choreography. Both branches assert real
   state; neither branch is vacuous.
2. At 1366 (below the breakpoint), supported engine: click-through arrives
   correctly, `.sheet-portrait` is hidden as today, no console errors — the
   marker may be set (root cross-fade is a transition) and that is fine
   because the suppressed element is not displayed.
3. Screenshots at 1920: night + day, both themes' grounds, captured for
   Caveshen's acceptance pass.
4. Full matrix numbers reported (the d24 convention: passed / skipped /
   failed).

### Item-level success criteria — done means all of these

1. Supported browser at ≥1650px: the Badger morphs from his on-screen scene
   position (zoom included) into the portrait seat, coming into full colour
   on the way; the slide-in is suppressed; the rest of the menu-open
   choreography plays.
2. Unsupported browser: behaviour is today's, unchanged — plain navigation
   into the full d24 choreography, no errors.
3. Direct visits to `/sheet` are unchanged in every browser.
4. Reduced motion: instant, everywhere, no transition.
5. Below 1650px: no Badger travel; the page is correct.
6. Back to `/`: the scene is alive — idle running, no stranded overlay.
7. Every existing test file is unmodified and green; new coverage is
   additive only.
8. Caveshen's eye on local preview: the hand-off seam is invisible, and the
   into-colour beat reads well against both themes and both times of day.
   (This is the residue of the original "lighting consistency pass".)

### Risks

- **CI headless Chromium vs cross-document transitions.** The morph should
  run headless, but if the supported-branch assertions flake on CI, the
  worker escalates to the foreman — never silently weakens the branch into a
  vacuous test.
- **WebKit support drift.** Playwright's WebKit may gain (or already have)
  `onpageswap`. Runtime branching absorbs either state; no test hardcodes
  which engine sits on which side.
- **The `pagereveal` head script runs before paint.** Keep it tiny; a throw
  there only means no marker (the fallback look), but it must stay
  error-free for the hygiene suite.
- **Back/forward cache stranding** is a real bug path (frozen idle plus a
  leftover overlay on `/`); the `pageshow` cleanup and its e2e test exist
  precisely for it.

### Rulings (Caveshen, 2026-08-08 — recommendations accepted as-is)

1. **Return trip:** accept the free whole-page cross-fade on `/sheet` → `/`.
   No extra `pageswap` gate.
   *Superseded by §d33 (2026-08-08): Caveshen now wants the reverse morph.
   This ruling stands until d33 ships; d32 ships as-is first.*
2. **Scene exit weight:** ship the default root cross-fade; judge on preview.
   Bespoke exit only if the preview demands it.
3. **Morph duration:** open at 400ms; Caveshen turns the knob at acceptance.

**Status: ✅ MERGED 2026-08-09 (PR #17, `dc9de23`) — criterion 8 passed on
Caveshen’s Edge preview (“very cool and very accepted”).
Item-level criteria 1–7 are confirmed against the
code and tests on `feat/scene-sheet-morph`. The full matrix is green
(1997 passed, 19 skipped, 0 failed; vitest 80/80). Four 1920 screenshots
wait in the gitignored `screenshots/` folder. Push/PR held until Caveshen
releases them after the preview.**

Two deviations from the Design text were found at validation. Both are
accepted and recorded here:

1. The width gate reads `window.innerWidth >= 1650`, not
   `matchMedia('(min-width: 1650px)')`. Both measure the same layout
   viewport in the engines we ship to, and the 1650 boundary has a unit
   test. Near-zero risk.
2. At 1366px, Chromium logs a benign "Transition was skipped" console
   line. It is a browser-internal effect of `view-transition-name` on a
   `display: none` element, not an error in our code. The journey test
   filters that exact string only and still fails on any other console
   error.

- **T1 — `/sheet` arrival + page opt-ins:** done. Reviewer approved.
- **T2 — the hand-off on `/`:** done. Reviewer approved.
- **T3 — joined journey + acceptance evidence:** done. Reviewer approved.

## d33. Sheet→scene return — the Badger travels back from his portrait seat

### 🚧 IN BUILD 2026-08-09 — go given; d32 merged first

**The ruling (Caveshen's, 2026-08-08):** the return journey gets the d32
treatment. When the "← Back to the interview" link on `/sheet` is clicked,
the Badger travels from his portrait seat back to his position in the
landing scene. This supersedes d32's ruling #1 (the plain cross-fade
return) — but only when this item ships. d32 ships as-is first, and this
item builds on top of the merged d32 code.

### Goal

When the back link on `/sheet` is clicked in a browser that supports
cross-document View Transitions, at ≥1650px, the Badger morphs from the
portrait seat to his position in the scene on `/`. He goes out of full
colour into the scene filter on the way — the reverse of d32's colour beat.
The scene idle resumes with no visible jump. Everywhere else, the site
behaves exactly as it does after d32.

### Non-goals

No Astro `ClientRouter` — d32's standing rule holds. No change to d32's
forward journey: `sheet.astro`'s arrival script, `portrait-handoff.js`,
`stage.js`, and the forward tests stay exactly as merged. No new art. No
morph below 1650px. `/404` stays untouched. No departure code on `/sheet` —
the sheet needs none (see *Asymmetries*).

### The reverse is not a mirror — settled asymmetries

d32's consult facts still bind: same mechanism (cross-document View
Transitions), same shared name (`character-portrait`), same SVG wrinkle.
But the work lands in different places. These asymmetries are settled; do
not re-derive them.

- **The source side needs no work.** d32 builds the morph source at click
  time because the scene Badger is an SVG `<g>`. The reverse starts from
  `.sheet-portrait img` — a plain HTML `<img>` that already carries
  `view-transition-name: character-portrait`. The browser snapshots it on
  `pageswap` with no help. The `/sheet` departure creates no overlay and
  freezes nothing, so it also needs no `pageshow` cleanup. Zero code on
  `/sheet`.
- **All the work is on the target side.** `/` must give the browser a named
  element to land on, and the scene Badger `<g>` cannot carry the name. So
  `/` gets a `pagereveal`-time **arrival hand-off**: an overlay `<img>` at
  the scene Badger's on-screen rect, as the morph target, removed when the
  transition finishes.
- **Colour runs the other way.** The seat is full colour; the scene is
  filtered. The arrival overlay carries the computed scene filter (the same
  copy the forward hand-off does), so the default cross-blend takes him out
  of colour as he travels.
- **`/` needs no arrival marker.** The landing page has no entrance
  choreography to suppress. `arrived-by-morph` stays a `/sheet`-only term;
  `/` never sets it, and no differently-named marker replaces it.
- **The camera state on arrival varies.** A fresh load of `/` has the
  default camera. A back/forward-cache restore can be mid-dialogue, zoomed.
  Both cases resolve the same way: read the rect from the live DOM at
  `pagereveal` time — `getBoundingClientRect` includes whatever transform
  is in force, exactly as the forward hand-off relies on.

### Design

Vocabulary: d32's terms bind (**hand-off**, **morph**, **arrival marker**).
One new term: the **arrival hand-off** — the `pagereveal`-time work on `/`
that builds the morph target. (d32's hand-off builds the morph *source* at
click time on the old page; the arrival hand-off builds the *target* on the
new page, before first paint.)

1. **Departure side: zero code on `/sheet`.** The named `.sheet-portrait
   img` and the page opt-in already exist from d32. Nothing is added,
   changed, or cleaned up on the sheet.
2. **The arrival hand-off on `/`.** An `is:inline` head script in
   `index.astro` registers `pagereveal` — the same idiom as `sheet.astro`'s
   marker script; inline registration is the only way to guarantee the
   listener exists before the event can fire. When the gates (design 3)
   hold, the handler runs synchronously, in this order:
   - remove any stranded element that carries an inline
     `view-transition-name: character-portrait` (a forward-hand-off overlay
     can survive into a back/forward-cache-restored `/`; two live elements
     with one name make the browser skip the whole transition);
   - find the laid-out `.badger-figure` (the one with a non-zero rect —
     three scene variants exist, one is displayed; the same trick
     `maybeHandoff` uses);
   - read `.badger-up`'s `getBoundingClientRect()` and computed `filter`;
   - append one `position: fixed` `<img src="/badger-up.png">` to
     `document.body` at that rect, with the copied filter,
     `view-transition-name: character-portrait`, and
     `pointer-events: none`;
   - hide the two SVG `<image>` elements (`visibility: hidden`) so the new
     root snapshot shows no second Badger under the arriving one.

   **Timing, stated on the record:** `pagereveal` fires before the first
   paint, and the document is fully parsed at that point;
   `getBoundingClientRect` forces synchronous layout, so the rect read is
   correct without waiting a frame. The requirement binds, the mechanism
   note does not — the overlay must sit on the Badger's true laid-out rect
   and must exist before the browser captures the new state, which happens
   right after the `pagereveal` handlers return. A `requestAnimationFrame`
   deferral can never satisfy this (a frame later is after the capture); if
   a worker finds the synchronous read wrong in Chromium, escalate to the
   foreman.
3. **Gates.** Three conditions, all required:
   - `event.viewTransition` is truthy. This one check covers engine
     support, the page opt-in, and reduced motion — the `@view-transition`
     at-rule is gated under `prefers-reduced-motion: no-preference` on both
     pages, so no transition object exists when reduced motion is on.
   - `window.innerWidth >= 1650` — the same comparator d32's validation
     recorded. The gate lives on the *departure* condition even though it
     is read on `/`: the seat only exists at ≥1650 on `/sheet`, and the
     window width does not change across a navigation, so the arriving
     width proves whether an old snapshot exists. Below 1650 there is
     nothing to morph *from*; a solo named overlay would fade in on its
     own, which reads worse than the free root cross-fade. The scene
     Badger exists at all widths, but that is not the deciding side.
   - a laid-out `.badger-figure` exists.

   **Deviation from d32's module shape, on the record:** the gate is one
   boolean expression inside an inline script — no exported predicate, no
   vitest. A separate module cannot reliably register `pagereveal` in time,
   and d32's module ceremony for three conditions fails the simplicity
   rule. The e2e matrix covers every gate.
4. **Overlay lift and idle resume.** On `event.viewTransition.finished` —
   chained with `.finally(...)`, because `finished` rejects when a
   transition is skipped and the cleanup must run either way — the handler:
   removes the overlay; clears `visibility` on both SVG `<image>` elements;
   restarts both idle animations from time zero (set `animation: 'none'`,
   force one reflow, clear the inline style). Both idle keyframes start on
   the up frame, and the overlay shows the up frame, so the lift is
   seamless: no jump, no double Badger, no half-cycle offset.
5. **Duration knob.** Add `::view-transition-group(character-portrait)
   { animation-duration: 400ms; }` to `index.astro`'s style block. The
   group animates on the *arriving* page, so `sheet.astro`'s copy of this
   rule does not govern the return. Open at whatever value d32's acceptance
   settles; Caveshen turns the knob at preview, as with d32 ruling #3.
6. **History traversals — decided here, pending ruling.** Both pages opt
   in, so the browser Back button from `/sheet` fires the same
   cross-document transition, and the arrival hand-off runs for it too.
   Recommended: keep it — it is the same journey and costs nothing. If
   Caveshen wants the morph on link clicks only,
   `navigation.activation.navigationType` distinguishes `traverse` from
   `push` and can gate it. See *Open questions*.
7. **Below the gates.** Below 1650px: no travel; supporting browsers keep
   the free root cross-fade from the opt-in. Unsupported browsers: today's
   plain navigation. Reduced motion: instant swap, no transition. All
   exactly as d32 design 8.

### Tickets

Each ticket is sized for one worker, one spawn. Never name a file, class,
or comment after the tracker ID.

**T1 — the arrival hand-off on `/`.** Files: `index.astro` only — the
inline head script and the duration rule. Plus its e2e coverage in a new
spec file named for its subject (suggested: `e2e/return-journey.spec.js`).
No dependency; starts first.

**T2 — the round trip: e2e + acceptance evidence.** Depends on T1. Extends
the return spec (new in this item, so extending it does not break the
untouched-specs rule) with the round-trip and Back-button cases, and
captures screenshots for Caveshen's acceptance.

### Per-ticket success criteria — test-shaped where possible

Repo test rules bind, as in d32: no `waitForTimeout`, no fixed sleeps;
auto-retrying assertions (`expect.poll`, `toHaveClass`) for anything that
settles; branch on runtime feature detection (`'onpageswap' in window`,
read via `page.evaluate`), never on the Playwright project name; reuse the
journey spec's exact-string console filter ("Transition was skipped") where
that benign Chromium line appears.

**T1 done means:**

1. Supported engine, 1920: journey `/` → `/sheet` (the d32 click path),
   click `.back-link`, land on `/`; then, with auto-retrying assertions: no
   overlay `<img>` remains in the DOM; `.badger-up`'s computed
   `animation-name` is `badger-up` and its computed `visibility` is
   `visible`; `.badger-down`'s `animation-name` is `badger-down`. The idle
   is alive.
2. Same arrival: `<html>` on `/` has no `arrived-by-morph` class; no
   console errors beyond the filtered string.
3. Unsupported engine: the same click path lands on `/` with the idle
   running, no overlay ever created, no errors.
4. Reduced motion (emulated), supported engine: the back-link arrival is
   instant; no overlay exists; the Badger holds the up frame per the
   existing reduced-motion behaviour.
5. At 1366, supported engine: the back link lands correctly; no overlay;
   error-clean under the same filter.
6. `git diff` shows `index.astro` as the only changed source file.
7. Every pre-d33 spec file is unmodified and green; the vitest suite is
   untouched and green.

**T2 done means:**

1. Supported engine, 1920: a double round trip (`/` → `/sheet` → back link
   → `/` → `/sheet` → back link → `/`); after each return, the T1-1 end
   state holds. This proves the duplicate-name defence: the second forward
   hand-off runs on a page the first return already touched, and the
   second return runs against whatever the forward hand-off left behind.
2. Supported engine, 1920: journey to `/sheet`, then `page.goBack()`; `/`
   ends clean — no overlay, idle running — with or without the
   back/forward cache. d32's existing `goBack` coverage stays green beside
   it.
3. Screenshots at 1920, night and day, both themes' grounds, captured on
   the return for Caveshen's acceptance pass (the d24 criterion-10
   precedent: the seam and the colour beat are judged by his eye).
4. Full matrix numbers reported (passed / skipped / failed).

### Item-level success criteria — done means all of these

1. Supported browser at ≥1650px: the back link morphs the Badger from the
   portrait seat to his scene position, and he goes out of full colour into
   the scene filter on the way.
2. The scene is alive on arrival: the idle resumes on the up frame with no
   jump, no double Badger, and no stranded overlay.
3. The d32 forward journey is unchanged: its files untouched, its tests
   green.
4. Unsupported browsers, reduced motion, and widths below 1650px behave
   exactly as they do after d32 — no regressions, no errors.
5. Browser Back from `/sheet` behaves per the ruling on open question 1,
   and always ends clean.
6. Every pre-d33 test file is unmodified and green; new coverage is
   additive; the full matrix is green.
7. Caveshen's eye on local preview: the arrival seam (overlay lift into
   the running idle) is invisible, and the out-of-colour beat reads well
   against both themes and both times of day.

### Risks

- **Duplicate names skip the transition.** A stranded forward overlay on a
  restored `/` shares the name with the arrival overlay; the browser then
  skips the morph. The remove-stranded step in design 2 exists for this;
  T2 criterion 1 proves it.
- **Event ordering on cache restores** (`pageshow` cleanup vs `pagereveal`
  capture) is not something to depend on. The remove-stranded step makes
  the order irrelevant.
- **`finished` rejects on skipped transitions.** The `.finally` cleanup in
  design 4 exists for this; without it the scene Badger stays hidden
  forever.
- **The inline head script must stay error-free.** The hygiene suite
  watches the console. A throw costs only the morph (the fallback look),
  but it must never log.
- **Headless CI vs the supported branch:** as in d32 — if supported-branch
  assertions flake on CI, the worker escalates to the foreman; never
  silently weaken a branch into a vacuous test.

### Open questions — RESOLVED (Caveshen, 2026-08-09)

1. **The browser Back button.** RULED: keep it — Back from `/sheet` morphs
   the Badger home, same as the link click. Zero extra code; design 6
   stands as written.

**Later idea (raised 2026-08-09, not in scope):** a dialogue option on
`/sheet` for the return to the main page — the sheet speaks the way the
scene does. Not briefed; revisit after d33 ships.

**Status: 🟢 GO GIVEN 2026-08-09 — build sequenced after PR #17 (d32)
merges. Do not start while d32 is open.**
