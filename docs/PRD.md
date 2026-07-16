# PRD — Caveshen Rajman, Personal Portfolio ("The Interview")

**Status:** v1.1 — updated 2026-07-16. **P0–P2 complete** (local commits only;
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
- `/sheet` — **The Character Sheet.** RPG-flavoured, fully static CV:
  - Class header (e.g. Engineering Manager, multiclassing Narrative Design) — his copy.
  - Skill groups: People / Product / Tech.
  - Quest log: roles from the CV (Derivco EM ← Entelect ← Derivco Durban).
  - Achievements: education, certs, training.
  - **"Download Character Sheet"** button → `/cv.pdf` (repo asset).
  - "Back to the interview" link → `/` (plain anchor, no JS; added 2026-07-16).
  - Contact: LinkedIn + GitHub links. No email on the page (spam caution).
  - v-next (2026-07-16, pending workshop): restyle closer to a D&D character
    sheet — Caveshen to supply examples and per-section direction first.
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
- Favicons/OG image derived from the night scene.

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
- **P3 — Polish:** 404, meta/OG tags, favicons, Lighthouse pass, placeholder
  CI check, and the §12 hygiene files (robots.txt, llms.txt, sitemap).
  Success: criteria 6, 7.

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
- **sitemap.xml** — `@astrojs/sitemap` integration at P3.
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

## 14. Amendments log

- **2026-07-16:** P0–P2 complete (see §9 for commits). Sample C artifact
  superseded → 4468f873. Skyline "trio" direction locked (§3). CV approved &
  rendered (§7). /sheet gains back-to-interview link (§4). Pre-remote commit
  workflow clarified (§2). Dialogue restart convention + scale notes (§5).
  Pending next session: D&D-style character-sheet workshop (Caveshen brings
  examples); Caveshen's dialogue JSON; P3; push decision.
