# PRD — Caveshen Rajman, Personal Portfolio ("The Interview")

**Status:** v1.5 — reconciled 2026-07-25.

**`main`** — P0–P3, LIVE at https://caveshen.github.io (public repo
`caveshen/caveshen.github.io`; Pages via the test-gated Actions workflow;
criteria 8+9 verified in production). Serves the pre-landing-v2 site.

**`item/landing-v2-avatar`** — P4 + P5, **34 commits ahead of `main`, unmerged
and not deployed.** Suite: 60 unit + 1272 e2e, tri-engine (Chromium / WebKit /
Firefox). This is where all of §17–§29 lives. The `main` cutover is §23 and is
gated on Caveshen.

Copy is PLACEHOLDER by his explicit choice — iterating in public until his
words land. Accepted design reference: Sample C artifact
(claude.ai/code/artifact/4468f873-b55c-4d0e-a236-535aa5fb6d15, supersedes
0b8cd6e0); in-repo reference `docs/design-sample-c.html` — **note that this
reference now predates §20/§25/§26 and no longer matches the shipped scene.**
**Owner:** Caveshen (all writing/copy). **Orchestrator:** Claude (Fable 5).
See §14 for the amendments log.

### Status board — items §15 onward

Added 2026-07-25 after a reconciliation pass found nine sections whose headline
status contradicted their own bodies (typically "ACCEPTED — not yet built" atop
a section recording that it was built and accepted days earlier). **This table
is the index; the section is the detail.** When an item moves, move it here in
the same commit.

| § | Item | Status |
|---|------|--------|
| 15 | Known defects D1–D4 | ✅ all closed |
| 16 | Visual validation in e2e | 💭 intent only, never designed |
| 17 | Stage sizing → full-window default | ✅ built, accepted |
| 18 | Fullscreen button | ✅ built, accepted |
| 19 | Background/foreground | ◐ refactor built; **locking not built** |
| 20 | Wider world (industry + waves) | ✅ built, accepted |
| 21 | Camera zoom easing | ✅ built, accepted |
| 22 | Dialogue rework | ⏸ parked, no design |
| 23 | The "attic" + cutover | ⏸ noted, not scheduled |
| 24 | Ambient banner plane | ✅ built, accepted |
| 25 | Blue-black palette | ✅ built, accepted |
| 26 | Devil's Peak + Lion's Head | ✅ built, accepted |
| 27 | Badger avatar | ◐ built; **selection mechanism open, toggle is scaffold** |
| 28 | Dialogue fade-in | ✅ built, accepted |
| 29 | Badger two-frame idle | 📋 **STAGED — next up**, ready to build on his go |

Also open and not owned by any section above: **all copy** (§23 checklist item
1), and the **stale OG/touch-icon render** (§7 debt).

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
Implemented in the design reference (`docs/design-sample-c.html`).

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

| Token | Night (default) | Day |
|---|---|---|
| bg | `#14121f` | `#e9f0ee` |
| scene sky | `#14121f` | `#cfe6e3` |
| mountain / far | `#262138` / `#3a3457` | `#46615c` / `#6f938d` |
| sea | `#223240` | `#7fb5b0` |
| celestial (moon/sun) | `#ffd75e` | `#f2b544` |
| card | `#1e1a2e` | `#fdfbf5` |
| text | `#e9e2cf` | `#253038` |
| stage direction | `#7d95a0` | `#5d7470` |
| option (SCUMM lavender) | `#a48fd8` | `#4d3f80` |
| hover (verb-line yellow) | `#ffd75e` | `#f2b544` (filled) |

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
  - **Round 3 (2026-07-18, approved "go for it"):**
    - Tiles: kill the flat "LLM purple" — panel surfaces become an ink-wash
      gradient sinking the plum into black at the base (new sheet-scoped
      token `--panel-grad`; night ≈ #1c1830→#151220, day = parchment wash).
      The `/` dialogue card keeps plain `--card` unless Caveshen extends it.
    - Spacing: one notch up across the sheet (panel padding, grid/list gaps,
      prose line-height) so content fills the stretched panels.
    - Content from his LinkedIn dump (facts, PII-scrubbed — the dump's email
      never enters the repo):
      · Quest log gains a side quest: Managing Editor — EGMR
        (Feb 2011 – Dec 2015), flavour line PLACEHOLDER.
      · Spellbook gains a Divination tier (the school of finding hidden
        truths = his QA arsenal): Cypress, Selenium, K6, NUnit, XUnit,
        WebDriverIO.
      · Name box gains his own authored epithet under the name:
        "Problem solver, coffee enjoyer, 10x human" (his words from
        LinkedIn — not invented, no PLACEHOLDER needed).
      · Skills panel gains Games Journalism (proficient, Narrative).
    - **Round 4 (2026-07-18):** colour APPROVED (ink-wash stays). Page still
      slightly long/busy. Forced bottom-alignment REMOVED by design: the
      ability rail returns to natural height (no space-between stretch), and
      panels no longer flex-grow. Balance comes from content instead —
      **The Quartet moves to the middle column** (Skills → Spellbook →
      Quartet); right column = Quest Log → Features & Traits. Columns end at
      natural height, approximately matched by this redistribution. The
      measured bottom-alignment e2e test is retired with the mechanism.
      Round-3 spacing scale stays. Still workshopping.
    - **Round 5 (2026-07-18): The Quartet is CUT** — removed from the page
      (markup + CSS; resurrect from git history at 0f8ec09 if he changes his
      mind — backburner, not banished). Height-alignment returns, scoped:
      only the MIDDLE column's last panel grows so the middle bottom meets
      the right column's (right is naturally longest — fine); the ability
      rail stays natural height. Middle = Skills → Spellbook; right =
      Quest Log → Features & Traits.
    - **Round 6 (2026-07-19): a splash of blue — nebular.** Sheet-scoped
      background token `--sheet-bg`: night = deep plum-black base with two
      soft radial blue/violet nebula glows; day = pale daytime-sky blue
      wash mirroring the interview scene's day sky. `--panel-grad` night
      stops shift a few degrees from plum toward blue-violet. Accents
      (lavender/celestial), text tokens, and `/` untouched.
    - **Round 7 (2026-07-19): night goes AMOLED blue/black.** The purple
      tiles are retired in night mode: sheet night tokens tone-shift to
      darker blues on near-black — `--sheet-bg` = faint blue nebula glows
      on a near-black base; `--panel-grad` = dark blue sinking to black;
      page-scoped night overrides for `--card-edge`, `--dim`, and `--bg`
      (bluer edge, blue-grey dim, black-blue grounds) with day values
      reset untouched. Day mode APPROVED as of round 6 — unchanged.
      Accents (lavender/celestial) unchanged pending his reaction.
      Follow-up same day: the lavender read as leftover purple — night
      `--option`/`--option-border` also page-scoped to a soft azure
      (#8fb3e6) so skill mods, tier heads, dots, chips, and the toggle
      join the blue family. Celestial yellow stays. Day untouched.
      And the same for day (his call, same day): NO purple in light mode
      either — day `--option`/`--option-border` page-scoped to a deep sky
      blue (#2e5c96, AA on the cream panels). The sheet is now purple-free
      in both themes; `/` keeps the Sample C lavender. **(No longer true —
      §25 pulled `/` into the same blue-black family on 2026-07-24; the whole
      site is purple-free now.)**
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
  - **DEBT, logged 2026-07-25 — the scene HAS changed materially and these
    have not been re-rendered.** §20 (industrial district), §25 (blue-black
    palette) and §26 (Devil's Peak) all landed after P3. `docs/render-og.js`
    still hard-codes the *old* violet palette (`#14121f`, `#262138`), so
    `og-image.png` and `apple-touch-icon.png` show the retired scene. Worse,
    `public/favicon.svg` was hand-patched to the new `--bg` (`#0f1826`,
    commit 05ce607) while the generator was not — **re-running
    `docs/render-og.js` as it stands would silently revert the favicon.**
    Fix is one job: retune the generator's inline SVG to the current
    `tokens.css` night values (and, if wanted, the new skyline), re-render all
    three, verify the favicon still matches its unit test in
    `src/tests/p3.test.js`. Not urgent — it is invisible until the site is
    shared as a link — but it must happen before the §23 cutover.

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
  pre-landing-v2 site, 34 commits behind. So the workflow is proven; the
  cutover is a content change, not a first flight.
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
  1. Unit: the camera-transform maths is a pure exported function with tests
     (stage rect + figure rect + scale → translate), so it isn't only e2e-covered.
  2. On load with JS: card not visible; the approach prompt is visible and has
     an accessible name.
  3. Approaching shows the card, applies a non-identity camera transform, and
     hides the prompt.
  4. The prompt is reachable by Tab and activates with both Enter and Space.
  5. After approach, focus lands on the first dialogue option.
  6. "End dialogue" and Escape each return to the wide shot: card hidden,
     transform back to none, prompt visible **and focused**.
  7. Under `prefers-reduced-motion: reduce` the camera jump-cuts (transition
     duration 0s).
  8. Toggling day↔night leaves the figure's computed fills **unchanged**
     (the character never changes with the theme — §14 ambition).
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
  10. No-JS: card visible and the `/sheet` path still reachable (criterion 1).
  11. Lighthouse holds 100/100/100/100 on `/`.
  12. No new dependencies, no generated assets, no PII; invented copy carries
      `PLACEHOLDER`.

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
  34 commits, unmerged. **Nothing is on `main`.**

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
  count it.** Six e2e files: `interview.spec.js`, `p4.spec.js`,
  `sheet.spec.js`, `p3.spec.js`, `p24.spec.js`, `p27.spec.js`. Note that
  `p27.spec.js` (6 tests) is REMOVE-BEFORE-SHIP scaffolding and the count drops
  when it goes.
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
    land they pan off-frame in portrait — but the **moon's radius is locked at
    46** in every view (it was 54 in portrait, i.e. it was changing size).
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

- **2026-07-19 — FIREFOX DESKTOP PICKED UP.** Caveshen gave the go on
  `item/firefox-desktop` today — cross-browser coverage ahead of the
  upcoming main-page workshopping, and he tests in Firefox himself.
  One desktop project only (Playwright's Firefox cannot emulate mobile);
  ~5 lines of config, `firefox` added to the CI install step, ~75 extra
  test runs.

- **2026-07-19 (morning) — TRI-ENGINE RULING.** Caveshen accepted the
  engine-coverage advice: **WebKit proceeds** (queue item 1 resumes — the
  three Apple device projects move to real WebKit, since every iOS browser
  is WebKit and the current descriptors only emulate viewport/UA on
  Chromium). **Firefox is DEFERRED** as its own later item
  (`item/firefox-desktop`): weak audience case (low desktop share, standards-
  clean static site) and Playwright's Firefox cannot emulate mobile, so it
  would be one desktop project only — ~5 lines of config plus adding
  `firefox` to the CI install step, ~75 extra test runs. Pick it up after
  WebKit merges, if appetite allows.

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
  1. **item/webkit-matrix — IN PROGRESS, PAUSED.** Branch exists; WIP
     commit `eba2a52` ("UNVERIFIED, do not merge") has the config/workflow/
     spec edits but the full suite was NOT re-run against them. Resume:
     free port 4321, `npx playwright test` (expect 525; 3 Apple projects on
     real WebKit), fix honestly, reviewer pass, his approval, merge.
  2. **CV consistency roll-up — AWAITING CAVESHEN'S VERDICT.** Claude's
     recommendation on the table: collapse the SDET split back into one
     entry "Software Engineering Manager, Derivco, June 2024 – Present"
     plus a bullet "Joined as Senior SDET (Level 1); promoted to
     Engineering Manager in May 2025" — consistent with the other squashed
     entries, honest against LinkedIn. On his go: branch, edit cv.html,
     re-render cv.pdf, PII re-verify.
  3. **Caveshen's copy — IN PROGRESS (his side).** Dialogue JSON, sheet
     copy, llms.txt, meta descriptions, 404 line. Claude nags gently.
  4. **Interview page feedback — his play-through impressions** open the
     main-page workshop; items branch as accepted.
  5. Parked as before: vitals-row rework; the Quartet (backburner).
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

- **2026-07-19 — item/webkit-matrix VERIFIED.** Full e2e suite ran on
  real WebKit (iPhone SE, iPhone 15 Pro, iPad) plus Chromium (Pixel 8,
  3 desktops): 525 tests, 522 passed, 3 skipped, 0 failed. The 3 skips
  are the keyboard Tab-walk test on the 3 Apple WebKit projects (WebKit
  does not Tab-focus `<a>` by default — platform behaviour, skip is
  engine-guarded with a comment). No product bugs found; no assertions
  were loosened. One back-to-back-run race condition observed (og-image
  content-type on iphone-se, passes in isolation and in clean runs) —
  pre-existing infrastructure behaviour, not introduced by this item.
  PRD §13 as-built updated with current suite size (75 × 7 = 525).

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
**Proposed fix:** float the prompt clear above the head with a gap (game
interaction-prompt convention), clamped so it cannot leave the stage frame
on the tall variant. Add an assertion that the prompt's bounding box does
not intersect the figure's.
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
**Proposed fix:** raise the framing constant so the head clears the card's
top edge. The constant is unit-tested in `src/tests/camera.test.js` — that
test moves with it (extended, never weakened, per §9 P4 criterion 9).
Consider deriving the constant from the measured card height rather than
hard-coding it, so it cannot drift apart again.
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
`e2e/p4.spec.js` — "no-JS: end-dialogue button is not visible" — proven red
before the fix, green after.

---

## 16. Proposed item — visual validation in e2e (NOT ACCEPTED, intent only)

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

Written against the toggle framing above; annotated where the later rulings
moved them.

1. ~~At ≥ 15/8 aspect the stage grows beyond 1200px, limited by available
   height, and never introduces vertical page scroll.~~ **SUPERSEDED** — the
   stage fills the window at *every* aspect, not only ≥ 15/8. The no-page-scroll
   half still binds and is tested.
2. ~~Standard and portrait variants render byte-identically to before at their
   existing breakpoints — this change is invisible outside ultra-wide.~~
   **SUPERSEDED by 17.1a, then 17.2** — every variant changed, deliberately.
3. ~~A control switches the stage between framed and full-window. State
   persists across reloads.~~ **DROPPED** — §18 ruled one control (fullscreen),
   and 17.2 became the default, so there is nothing to toggle or persist.
4. **STANDS.** The scene crops via `slice` and is never stretched: the Table
   Mountain screen-space aspect invariant (§13) still holds. ✅
5. **STANDS.** No horizontal page overflow at any tested viewport. ✅
6. **MOVED to §18** — it was only ever about the toggle's own control, and the
   fullscreen button carries these requirements now. ✅ there.

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

### Clarified intent — Caveshen 2026-07-23

The §18 overlap is **resolved: §17.2 and §18 are independent.** §18 (the
fullscreen button) is its own accepted, shipped control and is not touched by
§17.2. §17.2 is purely the *windowed* sizing behaviour: "the scene stretches
to fit the window regardless of the size, and then transitions between the
three scenes according to the width cut-offs."

"Stretches to fit" means **fill the window, cropping via `slice`** — not a
non-uniform distortion. The three-camera system (§14) already selects the
correctly-proportioned variant per width cut-off and scales it uniformly; in
full-window mode the selected variant fills the viewport and the overflow is
cropped, so the mountains never squash. This is the mechanism already
described above — the clarification only confirms the intent and separates it
from §18.

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
locking behaviour is NOT BUILT and remains open** — see the REFRAMED block
immediately below, which is the current status. (The earlier headline,
"blocked on §20", is superseded: §20 shipped, and Caveshen then chose to take
only the structural half.) Prototype:
https://claude.ai/code/artifact/f23b9a5b-81f3-4356-a5d1-0ea9f7c15fbc

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

### The intent, in his words

The background — mountains and buildings — "must persist in screen space…
perspective should not vary that much based on aspect ratio". The foreground
may scale freely with the stage ("essentially, zoom-in-zoom-out").

### Why this is right, and bigger than ultra-wide

The problem it fixes is already shipped and is worst on **mobile**, not on
ultra-wide. The tall camera carries `scale(0.62)`, so Table Mountain is
genuinely 38% smaller on a phone than on a desktop — same mountain, different
apparent distance, for no reason but the viewport's shape. Locking the
background makes the skyline a stable identity across all three aspects and
demotes the aspect ratio to deciding only *how much of the world you see*.

### The mechanism (prototyped, measured, works)

- **The seam follows paint order.** Foreground is the sky fill (which must
  always cover), and everything painted from `.f-sea` onward: sea, moon
  reflection, ground, railing, figure. Background is everything before it:
  stars, moon/sun, and `.world` (mountains, buildings, lit windows). The
  existing `CityScape.astro` `.world` group is *already* exactly the
  mountains-and-buildings layer, so the split needs no re-authoring.
- **The anchor is the waterline.** The world's base (`y=352`) lands on
  `y=480` under all three cameras, so scaling the background about that point
  keeps the city's feet on the water at every size.
- **The reference is desktop as it looks today** — 1 screen pixel per world
  unit, i.e. the standard scene at its 1200px cap. Standard is therefore
  unchanged by definition.
- Scale factor `k = S_REF / (s · cameraScale)`, where `s` is the scene's
  measured px-per-unit. Measured: 0.766 at 2560×1080 wide, 1.002 at standard
  (i.e. unchanged), 2.494 at 390×844 tall.

### The measured failure, and the proposed clamp — NOT RULED

At 390×844 a locked background must magnify 2.494×, and a 390px frame can
then show only 27% of the world's width. In the prototype Table Mountain,
Lion's Head and Signal Hill are **all cropped away entirely** — the entire
visual identity of the scene is lost and only anonymous building tops remain.

Proposed, not accepted: clamp the factor with `Math.min(1, …)` so the lock
may only ever *shrink* the background, never magnify it. Ultra-wide gets the
intended behaviour, standard is untouched, portrait keeps its authored
pull-back and keeps its mountain.

**§20 may make the clamp unnecessary at the wide end** and it must be
re-evaluated once the world is wider — hence this section is blocked on that
one, not built alongside it.

### Known consequence to art-direct, not to test away

With the background locked and the foreground scaling, the figure grows
relative to the skyline — roughly 1.3× at 2560×1080. There is no atmospheric
depth cue in the scene (no haze, no overlap, no converging ground plane), so
past some ratio the figure stops reading as *nearer the camera* and starts
reading as *enormous*. The parapet railing is the only element arguing for
depth, and it is in the scaling layer. Either accept a bounded scale range or
introduce a real depth cue; this is a drawing decision, not a code one.

### Relationship to §3

This **refines, and does not repeal, "one world, three cameras"**. There is
still exactly one authored world and no variant ever stretches it. What
changes is that the world now has two depth layers with independent scale
rules, both uniform. Any future change must preserve the no-stretch
invariant, which §13's Table Mountain screen-space test already guards.

---

## 20. A wider world — extending the cityscape

Raised by Caveshen 2026-07-22 on seeing the §19 prototype: the background
city "needs to be MUCH larger / widespread… extend it across the entire
scene in widescreen and then let it naturally adjust to the other views".
**BUILT AND ACCEPTED.** Direction accepted 2026-07-23 after two prototype
rounds, ported to `CityScape.astro` the same day (`67e3c67`), waves included,
and seen live and accepted by Caveshen 2026-07-24. Section closed; the
workshop record below is kept because §19's locking design leans on it.

### Why this is the load-bearing item of the three

It is not a polish pass; §19 depends on it. A locked background is a
statement that a larger stage **reveals more world** rather than magnifying
it — which only holds while there is more world to reveal. The city currently
spans x 40–1150 of a 1750-wide scene, so the ultra-wide prototype ran out of
city and filled the difference with empty sky. That emptiness was read as a
flaw in locking; it is actually a flaw in the world's extent. Widen the world
and the lock stops being a trade-off and simply becomes correct.

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

One acceptance criterion below is **not yet exercised**, and honestly so:
criterion 1 is written "at 2560×1080 **with the §19 lock applied**", and the
lock was not built (§19 took the refactor half only). The left flank fills
correctly under the current unlocked cameras; whether it fills under a locked
background is untested and re-enters scope only if §19's locking is ever built.

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

### Status 2026-07-22 — BUILT, values PROVISIONAL

Implemented on `item/landing-v2-avatar` while Caveshen was away, on his
instruction to work through the items that did not need him. Entry is
`550ms cubic-bezier(0.4, 0, 0.2, 1)`; the exit is untouched, and is left that
way structurally rather than by copying its values — `exit()` clears the
inline override so the original CSS rule remains the single source of the
exit transition and cannot drift.

Two things above were **not** resolved before building, and are recorded here
rather than quietly closed:

1. The "faster on zoom-in / slower on zoom-out" against "zoom-out is actually
   perfect" ambiguity was never put to Caveshen. The working interpretation
   was applied: the exit is untouchable, and "faster" means a shorter entry.
   If he meant the exit should genuinely slow, that is a one-line change.
2. The promised visual look has not happened. Criterion 1 is objectively
   satisfied — first-frame advance drops from 12.0% to under 4%, asserted in
   the suite — so the *lurch* is provably gone. Whether 550ms feels
   **dramatic** is unjudged.

The numbers are therefore provisional and expected to move. This must not be
merged to `main` before Caveshen has looked at the entry animation.

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

## 23. Preserving the current main landing — the "attic"

Raised by Caveshen 2026-07-23, tied to the eventual `main` cutover. Two
concerns: switchover discipline, and archival.

### Switchover

When `item/landing-v2-avatar` merges to `main` it replaces the current
landing — the original **Sample C** scene with the simpler dialogue over the
Cape Town backdrop, the first thing built on this project. That original is a
finished, working page and **must not be lost to the overwrite.** Git history
is not sufficient: Caveshen wants it kept as a live, resurrectable reference
in the tree, not an archaeology dig through old commits.

### Archival

Before or as part of the cutover, lift the original landing's assets — its
scene SVG / components, its dialogue data, its page — into a self-contained
reference folder. **Not named "Sample C view"** (his explicit steer); pick
something that reads as an archive or reference. Candidates, undecided:
`src/reference/`, `src/attic/`, or an unlisted `/attic` route. It stays
buildable so it can be resurrected wholesale, not as dead text.

### Candidate destination — an interactive 404

Astro's not-found page is `src/pages/404.astro`. Wiring the preserved scene
there would give the archive a home and make the 404 itself a small
interactive scene. Caveshen: "An interactive 404 seems like something nobody
has done before." **Not decided** — the archive stands on its own regardless
of whether, or where, it is later mounted. Other future pages are equally
open.

### Status

**NOTED, not scheduled.** No work until Caveshen calls it, and likely
sequenced around the real `main` cutover — itself gated on his approval and a
local preview per the branch rule. It is recorded now so the cutover cannot
silently destroy the old scene.

### Constraints and one open question

- Preservation is lossless: the archived scene renders identically to today's
  `main` landing when resurrected.
- Same repo rules apply to the archived assets: no PII, no email, copy stays
  `PLACEHOLDER` until it is Caveshen's.
- **Open:** kept buildable, the archive can bit-rot silently as shared tokens
  and layouts move under it. Either keep it in the build/test path enough to
  catch that, or explicitly freeze it as excluded reference — decide when it
  is built, not now.

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
2. **Remove the §27 TEST-ONLY character toggle.** Full extent listed in §27;
   `e2e/p27.spec.js` goes with it. Grep `REMOVE-BEFORE-SHIP` must return
   nothing.
3. **Archive the old landing** — the actual subject of this section.

**Should be done, won't break the page:**
4. **Re-render the OG and touch icons** from the current palette (§7 debt) —
   and fix `docs/render-og.js` first, or it reverts the favicon.
5. **Optimise the Badger raster(s)** to displayed size (§27 open point 2) —
   cheapest done alongside §29, which adds the second frame.
6. **Watch the first deploy anyway.** The workflow itself is proven (green on
   every push to `main` through 2026-07-20), so this is not a first flight —
   but it will be the first time it builds the landing-v2 tree, and the suite
   it gates is now 1272 e2e tests across three engines. Budget the CI time and
   look at the deployed page, not just the green tick.

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

Guarded by a Devil's Peak regression test in `e2e/p4.spec.js`, proved to fail
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

Removal safety: the scaffold carries a greppable `REMOVE-BEFORE-SHIP` marker
and a `ponytail:` note so `/ponytail-debt` tracks it; §23's cutover checklist
must not ship with the toggle present. The Badger's approach/zoom framing
reuses the existing `.face-void` mechanism (the Badger carries its own face
marker) so the camera frames whichever character is active.

**Scaffold extent, verified 2026-07-25** (so removal is a checklist, not a
hunt). `REMOVE-BEFORE-SHIP` appears at `src/pages/index.astro` lines 5
(import), 110 / 172 / 230 (the three `<Badger>` render calls, one per scene
variant), 310–318 (the button and its deletion instructions), 332 (script
close) and 340–365 (the `[data-character]` visibility CSS and button styling).
`e2e/p27.spec.js` is marked REMOVE-BEFORE-SHIP in its entirety (6 tests).
Default with no JS and no `data-character` attribute is the hooded figure, and
the toggle deliberately does **not** persist to localStorage — it is scaffolding.

### Open, carried from this section into §29 / the cutover

Three things the build did not close, recorded so they are not lost:

1. **The real selection mechanism** (site-wide subject vs per-dialogue) — still
   Caveshen's call. Everything else here ships; this is the only reason the
   toggle exists.
2. **The perf constraint above is UNMET.** `public/badger.png` is the full
   500×500 source displayed at ~200px. `Badger.astro`'s own comment admits the
   deferral. It has not measurably threatened criterion 6 (Lighthouse ≥ 95),
   but it is a knowingly-unoptimised asset and §29 is about to add a second
   one — resize both together, once, rather than twice.
3. **The approach prompt's copy is figure-specific.** It reads "PLACEHOLDER:
   Approach the hooded figure" regardless of who is on stage, so with the
   Badger active it names the wrong character. Acceptance criterion 2 covered
   *placement*, not the label. It is placeholder copy either way, so it
   resolves when Caveshen writes the real line — but whoever writes it should
   know the string may need to vary by character, or be written neutrally.
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
`e2e/p4.spec.js`, each proven to bite on a targeted revert.

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

Requested by Caveshen 2026-07-24. **ACCEPTED — not yet built.** Give the §27
Badger a simple, characterful idle by animating between two commissioned
frames — arms up and arms down.

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
  `Badger.astro`, and `src/tests/p3.test.js` does not reference the filename.

### STAGED 2026-07-25 — registration measured, not eyeballed

§29's own scope demanded confirmation that "only the arms move and the
feet/shadow stay planted (no vertical jump between frames)". Measured rather
than guessed: both PNGs decoded to a canvas, ink bounding box computed per
frame (ink = opaque and not near-white). Both are 500×500 as promised.

| Edge | up | down | delta |
|---|---|---|---|
| top (ears) | 32 | 55 | **+23** |
| bottom (feet) | 488 | 489 | **+1** |
| left | 33 | 62 | +29 |
| right | 466 | 436 | −30 |

**The feet are planted.** A 1px delta at the bottom edge is imperceptible and,
crucially, means the ground shadow will not jump — the single failure mode the
scope named. Registration passes where it has to.

**The arms narrow by 59px**, symmetrically (+29 left, −30 right). Exactly the
intended difference: horizontal-out becomes angled-down.

**But the head sits 23px lower in the down frame** — the figure is 22px shorter
overall, all of it lost at the top. That is ~5% of the badger's height, and at
the shipped display size (~200px) it lands as a **~10px head bob**.

This is flagged, not fixed. It is very likely *correct* — a body settling as
the arms come down is a squash-and-stretch cue and reads as breathing rather
than as a broken sprite swap; a rigid two-frame arm swap with a perfectly
static head would look more mechanical, not less. But it means the two frames
are not the pure arm-only swap the section assumed when it was drafted, and
**cadence now matters more than it did**: a 10px head bob at a slow ~0.9s is a
gentle breath, while the same bob at ~0.3s is a jitter. The two open points are
therefore coupled, and the cadence call cannot be made from the stills.

**Recommended starting point for the look: ~800ms per frame** (1.6s full
cycle), which reads as an idle breath rather than a wave. Trivially retuned —
it wants to be one named constant, not a magic number.

**Ready to build on his go.** No blockers. Order: bring `BadgerDown.png` into
`public/` under a neutral name (PII/metadata check as `badger.png` had), rename
the up frame, swap frames on a timer or CSS `steps()` animation honouring
`prefers-reduced-motion` (hold the up frame), keep both under the §27
scene-matched filter and the shared ground shadow so neither jumps. Then a look
at the motion, and expect the cadence constant to move.

### Method

Prototype/screenshot both frames composited, confirm registration and cadence
on a look before it enters the repo — like §16, the *feel* isn't suite-judgeable
(the suite can assert both frames exist and that reduced-motion holds a single
frame).
