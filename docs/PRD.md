# PRD — caveshen.com

The source of truth for what the site is, the laws it keeps, and the
work still open. Rewritten as current truth on 2026-09-05 with the
videogame-menus cutover (d52). The pre-cutover PRD, 6,900 lines of
decisions and defects from 2026-07 to 2026-09, is `docs/HISTORY.md`;
git history records every change. This file is not a changelog.

## 1. Purpose

A personal portfolio that is itself the portfolio piece: an interactive
CV styled as a videogame's menus, showing narrative, design and
engineering skill in one artifact.

Audiences, in order:

1. Games-industry visitors: play the title screen and the dialogue.
2. Recruiters and tech contacts: reach the plain CV in two clicks.

## 2. The three views

**The title screen** (`/`, `ThresholdCover.astro`). Caveshen's own night
photograph of Cape Town, toned into the night tokens by a four-stop SVG
tone map, under a main-menu column: name, role, tagline, then New Game,
Character Sheet, Download CV, LinkedIn with hotkeys 1 to 4. Corner
brackets, a one-time scan sweep, a coordinates readout. New Game plays
the un-develop: the menu fades, the photo drains, and the vector world
blooms in by depth underneath. The cover is hidden, not removed; Esc or
the Main menu button brings it back. A session flag skips it on return
visits within the session; reduced motion and no-JS skip it outright.

**The promenade** (`/`, `Stage.astro` and the scene). The vector Cape
Town: three aspect variants of one authored world, the sea shimmer, the
wind, the grain, the banner plane. The Badger stands on the rail with a
quest marker bobbing over him; the area title names the place once on
arrival. Hovering, focusing or pressing E reveals the interact prompt;
activating it, clicking the Badger, or E opens the dialogue: the camera
pushes in on his face, the subtitle streams, and the options sit on a
wheel with numbered caps. Digits pick, Esc leaves. The system option
opens the character sheet, and at 1650px and up the Badger travels to
his companion seat there by cross-document view transition, and back.
A day theme turns the world over; the HUD holds night. `/404` is the
same stage with a hooded figure and its own short tree.

**The character record** (`/sheet`, `sheet.astro`). The CV as a
character menu, always night: a sticky menu bar (back to the promenade,
four section tabs, the filled Download CV button), the identity block
with the head portrait, level badge, id fields and XP bar, six
attributes with gauges, a five-school skill tree (a horizontally
scrolling SVG on phones), the quest log with objectives, the codex, and
a footer with LinkedIn, GitHub and the CV. The whole record reads
top to bottom without JavaScript. A schema.org Person rides in the head.

`/cv.pdf` is the plain, ATS-friendly CV rendered from `docs/cv.html`.

## 3. Standing laws

- **Copy is Caveshen's voice.** Claude drafts freely; a line ships once
  he passes it at preview and is his to strike without ceremony.
  Dialogue trees are primarily his. Shipped or struck; no placeholder
  marker.
- **No generated or traced art.** Vectors and programmatic drawing
  only. Two recorded exceptions, both Caveshen's own photographs treated
  into the tokens: the cover photograph and the head portrait. The pixel
  champion (his own hand-pixelled 32×32) is parked in the repo, unlinked.
- **Semantic HTML first.** The CV and the root dialogue line render
  without JavaScript; everything animated is progressive enhancement.
- **Accessibility floor.** Keyboard-playable end to end, one visible
  focus ring, `prefers-reduced-motion` honoured everywhere, WCAG AA on
  every text role in both themes, proved by the unit suite from the
  tokens.
- **No PII.** `cv.pdf` carries no phone or email; contact is LinkedIn
  and the site. Verify with `pdftotext` after any CV re-render.
- **Design language** lives in `docs/STYLE_GUIDE.md`: three type roles
  (Cinzel titles, Rajdhani HUD, Cormorant speech), gold for the player's
  attention, holo blue for the system's voice, HUD holds night.
- **Tests** follow `docs/TEST-STRATEGY.md`: units for our modules and the
  contrast maths, Playwright for what a visitor can meet, nothing that
  restates a stylesheet. A new guard is watched failing first.
- **Branch per item, squash-merge to main is the deploy.** One item at a
  time on Caveshen's go. Local preview is his gate. Recovery means
  redeploying an earlier commit; never `git revert` unless asked.
- **Never name a test file after a tracker ID.** Subjects do not move;
  numbers do.

## 4. Platform

- Astro 7, static output. `npm test` (vitest), `npm run test:e2e`
  (Playwright), `npm run build`.
- Hosting: Cloudflare Pages project `caveshen-com` at caveshen.com,
  deployed by `deploy-cloudflare` on every push to main. The Cloudflare
  zone and DNS are Caveshen's; the API token lives only in the repo
  secrets. GitHub Pages is retired.
- CI (`.github/workflows/deploy.yml`): ready pull requests run the
  six-project matrix (iphone-15pro, ipad, pixel-8, desktop-1920,
  desktop-2560, desktop-firefox); a push to main runs the unit suite and
  deploys; docs-only changes run nothing. The working branch's push job
  deploys preview.caveshen.com until the cutover.
- Canonical host is `https://caveshen.com`; a `SITE` build override
  (the preview) is noindex and robots-disallowed.
- Derived images (the icon set, the social card, the head portrait, the
  cover photo variants, the grain tile) are rendered by the scripts in
  `tools/` and guarded by the freshness gate in `tools/derived-images.json`.

## 5. Work in flight

### d52. Videogame-menus cutover — ACCEPTED 2026-09-05, in progress

On 2026-09-04 Caveshen asked Fable 5.1, working alone, to redesign all
three views as videogame menus: Dragon Age and Mass Effect register, blue
and gold, prior rulings set aside. The result landed on
`item/videogame-menus`, shipped to preview.caveshen.com, and was
approved with its dialogue. The branch is the working branch; it
replaces the site in main at the cutover.

Rulings: the redesign is the target and nothing from the old front is
kept for its own sake; Fable does the work in the main thread; favicon
is the gold diamond on navy at every size; the generated SVG Badger head
retires; the pixel champion is parked; pixel-8 stays in the matrix;
d48 (sheet goes live) and d51 (repo private, CI trimmed) are absorbed.

Tickets, in order (plan in the local `.scratch/cutover-plan.md`):

| # | Ticket | State |
|---|---|---|
| 1 | Retire the gated front and the placeholder tooling | done, `c1fddba` |
| 2 | Re-pin the e2e suite to the new design | done, `6de4f61` |
| 3 | Suite once-over: relevance, tautology, cost | done, `9917788` |
| 4 | CI to the d51 rulings | done, `3269f9c` |
| 5 | Identity and meta: diamond icons, title-screen card, JSON-LD | done, `1638c84` |
| 6 | Docs: this PRD, the style guide, the test strategy, CLAUDE.md | done |
| 7 | Caveshen's copy pass at preview | open |
| 8 | Cutover: PR to main, matrix green, squash-merge, live checks, then remove the preview job and project, delete the `preview` DNS record, disable GitHub Pages, flip the repo private | open |

## 6. Queue

Parked ideas, each waiting on Caveshen's go. None is in scope for d52.

- **d38. Dialogue speaker portrait.** A rounder, warmer Badger portrait
  beside the subtitle. Basis: `screenshots/badger-dialogue.svg`, his own
  vectors, gitignored until adapted. Scope and placement go to a spec
  at pickup.
- **d39. Dynamic scene.** The night moon shows the real lunar phase
  (`src/scripts/moonphase.js` already computes it); day reflects live
  Cape Town weather via Open-Meteo, cached, clear-sky fallback, mocked
  in CI. Weather needs a runtime ruling first.
- **d45. The Badger on the title screen.** Render him on the cover so he
  is the continuity into both views, and decide whether the cover and
  the world are separate history entries so Back returns to the menu.
  Touches the un-develop and the view-transition machinery; needs a
  grill.
- **d50. Night blacks.** The grain tile's normal blend at 0.12 lifts the
  darkest areas. Candidates: a `multiply` blend or a darker tile. Needs
  a preview.

## 7. Defects

None open. A defect is raised here with the observation and the
preview it was seen at; it closes with the commit that fixed it.
