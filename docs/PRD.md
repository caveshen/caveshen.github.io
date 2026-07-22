# PRD — Caveshen Rajman, Personal Portfolio ("The Interview")

**Status:** v1.4 — updated 2026-07-19. **P0–P3 complete and LIVE at
https://caveshen.github.io** (public repo `caveshen/caveshen.github.io`;
Pages via the test-gated Actions workflow; criteria 8+9 verified in
production). Test matrix is tri-engine (Chromium / WebKit / Firefox,
47 unit + 600 e2e); CV shows the rolled-up single Derivco entry. Copy is
PLACEHOLDER by his explicit choice — iterating in public until his words
land. Accepted design reference:
Sample C artifact (claude.ai/code/artifact/4468f873-b55c-4d0e-a236-535aa5fb6d15,
supersedes 0b8cd6e0); in-repo reference `docs/design-sample-c.html`.
**Owner:** Caveshen (all writing/copy). **Orchestrator:** Claude (Fable 5).
See §14 for the amendments log.

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
      in both themes; `/` keeps the Sample C lavender.
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

## 15. Known defects (open)

Logged 2026-07-22, found by screenshot review of the landing-v2 port on
`item/landing-v2-avatar` **after** the suite went green (757 passed / 3
pre-existing skips). All three are invisible to the tests — they are
composition faults, not logic faults. Deferred by Caveshen's ruling to a
following session; the port itself is sound and ships as-is.

### D1 — The approach prompt renders on top of the figure's hood

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

### D2 — The dialogue card occludes the face after the camera zoom

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

### D3 — Ultra-wide leaves the bottom half of the page empty

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
**ACCEPTED — not yet built.** Comparison that produced the ruling:
https://claude.ai/code/artifact/0ec6a101-aee8-4f1f-b35a-3217715f6417

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

**Shipped as a toggle "for now"** — Caveshen's framing, meaning the default
presentation is not being replaced, and the toggle is the safe way to live
with the mode before deciding whether it becomes the default.

### Acceptance criteria

1. At ≥ 15/8 aspect the stage grows beyond 1200px, limited by available
   height, and never introduces vertical page scroll.
2. Standard and portrait variants render byte-identically to before at their
   existing breakpoints — this change is invisible outside ultra-wide.
3. A control switches the stage between framed and full-window. State
   persists across reloads, in the manner of the existing theme toggle.
4. In full-window mode the scene crops via `slice` and is never stretched:
   the Table Mountain screen-space aspect invariant (§13) still holds.
5. No horizontal page overflow in any mode at any tested viewport.
6. Keyboard-operable with a visible focus ring; honours
   `prefers-reduced-motion` on any size transition.

### Status 2026-07-22

- **17.1 — BUILT** on `item/landing-v2-avatar`. The reserve subtracted from
  the viewport height is **120px**, measured rather than estimated: 16px
  stage-frame top margin + 32px footer top margin + 28px footer height + 40px
  footer bottom margin = 116px, rounded up. The 100px used in the accepted
  prototype was wrong and left a 16px scrollbar at 2560×1080.
- **17.2 — NOT BUILT.** Blocked on the §18 open question below; building it
  first risks building the same control twice and discarding one.

### Open questions

- Does the full-window toggle survive as a permanent control, or is it a
  staging post to making full-window the default? Caveshen has deliberately
  not decided.
- **It may be the same control as §18.** See that section.

---

## 18. Fullscreen toggle button

Requested by Caveshen 2026-07-22. **ACCEPTED — not yet built.**

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
**ACCEPTED IN PRINCIPLE — implementation blocked on §20.** Prototype:
https://claude.ai/code/artifact/f23b9a5b-81f3-4356-a5d1-0ea9f7c15fbc

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
**ACCEPTED — to be workshopped. Explicitly open to creative exploration**
("we can workshop and/or get creative with this one as well").

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

---

## 21. Camera zoom easing — the approach lurches

Reported by Caveshen 2026-07-22 from live play. **ACCEPTED — not yet built.**

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
