# PRD — Caveshen Rajman, Personal Portfolio ("The Interview")

**Status:** v1.2 — updated 2026-07-17. **P0–P3 complete** (local commits only;
no remote yet — push awaits Caveshen's call). Accepted design reference:
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

## 14. Amendments log

- **2026-07-19 (later):** Character sheet PARKED in its accepted state after
  workshop rounds 1–7 (D&D anatomy, AMOLED blue/black night + sky/parchment
  day, purple-free both themes, quartet cut, columns aligned). Remaining
  sheet work is content only: Caveshen's copy (alignment, flavour lines,
  spell/skill tuning) + the parked vitals-row idea. Focus returns to `/`
  (the Interview) — his notes incoming. Push conversation opened: gh CLI
  not yet authenticated; awaiting `gh auth login` + his call on enabling
  Pages (site would go live with PLACEHOLDER copy until his words land).

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
