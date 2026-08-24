# Theme direction: the Dragon Age register

**Item:** d37. **Rulings taken:** 2026-08-22 workshop with Caveshen.
**Evidence base:** `.scratch/d37-theme-mock-v2.html` and
`.scratch/d37-sheet-mock.html` (gitignored workshop vehicles; the
rulings below are the durable record). This document is the build
contract. Where a value here conflicts with an older PRD section, this
document wins.

## 1. Concept

One idea carries the site: a place you stand in, at the edge of a real
city, at night. The register is grounded fantasy in the Dragon Age
mould: ink and parchment warmth, antique gold, weathered elegance.
Frosted glass stays, but it reads as modern fantasy material (the
Veilguard idiom), not science fiction. Mass Effect and retrowave were
considered and rejected; they conquer the scene instead of reconciling
with it.

The site keeps three voices, each with one job:

- **Cinzel** for display: nameplate, headings, ability scores, quest
  titles. Engraved inscriptional caps.
- **Cormorant Garamond** for prose: dialogue speech, stage directions,
  option labels, body copy, contact links.
- **Mono** (Cascadia Code stack) for data: captions, micro-labels,
  meta lines, chips that carry facts.

Nothing else uses Georgia. Fonts self-host at build via `@font-face`
subsets (OFL licence permits it). The mocks' Google Fonts link was a
workshop convenience, never a shipping decision.

## 2. Palette

Night tokens (replace the current values in `tokens.css`):

| Role | Token | Night value |
|---|---|---|
| Ground | `--bg` | `#0c1118` |
| Text | `--text` | `#ece4d4` |
| Dim text | `--dim` | `#9aa39b` |
| Interactive accent (the lavender) | `--option` / accent | `#8fb4d8` |
| House gold | new `--gold` | `#d9a94e` |
| Gold bright (hover/focus) | new `--gold-bright` | `#ffc46b` |
| Glass fill | `--glass-bg` (new token) | `rgba(14,16,22,.75)` |
| Glass border | `--glass-border` (new token) | `rgba(236,228,212,.18)` |
| Panel ground | `--panel-grad` | `linear-gradient(#1a1a17,#0a0b09)` |

Scene tokens follow the mock vignettes: sky `#0c1420` to `#1d2b33`,
moon bone `#e8e2d2`, sea slate-teal, mountain value ladder
(`#33414d` far, `#242f39` mid, `#161f27` near), windows candlelight
`#ffc46b`, parapet `#0a0e13`. Exact scene hexes may be tuned during
build; the value ramp order and warm-gold window colour are fixed.

Day palette: coastal blues over warm sand, per Caveshen's accepted
sketch (sky pale blue to cream horizon, sun warm gold `#e9b64f`,
mountains in umber steps, plain buildings). Day ink roles start as
candidates and pass through the contrast cells before they count:
text `#2b2723`, dim `#5d574b`, accent deepened, gold darkened toward
bronze for AA on pale grounds.

Guards that bind:

- The composited contrast cells gate AA for text over the scene in
  both themes. A new value passes the same cells or does not ship.
- Character identity colours never change with the toggle (`--head-dark`
  doctrine stands).
- The banner plane stays white by ruling; it is not theme-linked.
- The approach prompt ships light-on-dark in both themes (d36 ruling).

## 3. Scene

Both vignettes rebuild on the layered depth the mock established:
three-value mountain range with Table Mountain's flat top carrying the
near massif, moon seated inside a cloud bank with a soft halo, broken
glint column on the sea beneath it, mist band between ridges, clustered
stars with four-point sparkles at night; haled sun, umber mountains and
plain buildings by day.

**Geography correction (Caveshen's ruling):** the view faces south.
The city sits across the water from the viewer. The ocean lies west,
where the sun sets and where the moon descends after nightfall.
Composition places sea, city and range accordingly.

All fills stay CSS classes, never `var()` presentation attributes
(the standing SVG rule). No generated raster art.

## 4. Moon phase (ruled into d37)

At night the moon shows today's real phase. Computation is pure date
arithmetic against a known new-moon epoch and the 29.53-day synodic
month; there is no network call. The shadow draws programmatically
over the existing moon disc (one ellipse sweep covers all eight named
phases). Unit tests pin known dates to expected phases. Reduced motion
is unaffected: the phase is static per load.

Live weather was parked as d39 and is out of scope here.

## 5. Dialogue plates

One uniform option plate replaces every button style on the plaque:

- Full-width, radius 4px, background `rgba(236,228,212,.04)`.
- A left gold rule at 35% opacity, 2px wide.
- Label in Cormorant Garamond, preceded by a small mono roman numeral
  index in dim gold.
- Hover and focus-within: plate warms to `rgba(217,169,78,.10)`, the
  rule ignites bright gold and widens to 3px, text brightens, a `✦`
  glyph fades in at the right end.
- Keyboard focus: 2px solid `--gold-bright`, offset 2px.

The dashed system-option variant dies. Navigation exits render as
ordinary options; the engine's `"kind": "system"` data field survives
for authoring but carries no visual difference unless Caveshen later
asks for one.

## 6. Interaction grammar

Three hover verbs, used everywhere:

1. **Primary action** (at most one filled element per page): solid
   house gold pill, ink text, lifts 1px on hover. Download button on
   `/sheet`; nothing else fills.
2. **Standard interactive**: quiet surface; hover turns border and
   text to gold-bright with a faint warm wash (back-link, HUD chips,
   spell chips if ever interactive).
3. **Dialogue option**: the plate ignition in section 5.

Focus: one ring everywhere, gold-bright, 2px, offset 2px. The stage's
`.kb-focus` gating exists because WebKit bit us once (PRD, P4); the
migration to native `:focus-visible` happens only after a red-green
proven parity check on the real WebKit projects. Until then the goal
is uniform appearance, however triggered.

Corner brackets promote from the plaque to the house frame motif:
portrait frames, the plaque, and any glass artifact wears the etched
L-brackets at 55% gold opacity.

Radius scale, three steps and nothing else: `--r-sharp: 4px` (dialogue
artifacts, plates, portrait frame), `--r-panel: 10px` (paper panels),
`--r-pill: 999px` (controls, pills, chips). Today's 5px badges, 12px
tiles and 2px banner rect fold into these.

Motion tokens replace literals: `--t-micro` (~150ms ease) for hovers
and lifts, the existing 0.4s theme crossfade, and one cinematic curve
(the expo-out camera cubic-bezier) defined once. Every animation keeps
its reduced-motion off switch.

## 7. Character sheet

`/sheet` reworks from 5E trade-dress to codex register. Structure via
hairline rules and negative space, not boxed panels. Content sections
keep their RPG metaphors:

- Nameplate as title page (Cinzel between hairlines, Cormorant
  epithet), portrait beside it in a bracketed frame wearing the
  retuned parchment-over-ink duotone (recipe sealed 2026-08-22;
  renderer output `screenshots/sheet-portrait-da.png` pending port).
- Identity strip with hairline separators; XP bar in house gold.
- Ability rail: Cinzel scores, mono labels, modifier pills straddling
  tile bottoms.
- Tech stack tiers renamed: Specialisations · Core Craft (.NET/C#,
  SQL, JavaScript), Frameworks · Practised (VueJS, React, Angular,
  GraphQL, Spring), Passives · Always On (Git, Azure, AWS, Power BI).
  Placement is provisional copy under the amended authorship law.
- Skills keep dots; expertise burns gold-bright.
- Quest log and Features & Traits as ruled entries led by ✦ marks.
- Captions stay below panels in tracked mono uppercase.

## 8. Copy

The authorship law amended 2026-08-22 applies: Claude drafts, Caveshen
passes at preview, unpassed copy carries `PLACEHOLDER`. All copy in
this item follows the unslop standard: no em dashes, plain words,
active voice, specific facts, varied rhythm.

## 9. Success criteria

1. Both routes (`/`, `/404`) and `/sheet` render on the new token set
   with zero literal colour values outside `tokens.css` and the
   documented scene classes.
2. Contrast cells pass WCAG AA in both themes; the suite proves it.
3. Token parity holds: every night token has a day override or an
   explicit allowlist entry.
4. The moon renders the correct phase for three pinned dates in unit
   tests, including a new-moon and a full-moon case.
5. One focus treatment appears site-wide; keyboard playthrough of the
   full dialogue passes on all eight matrix projects.
6. Lighthouse accessibility and performance stay at 95 or better on
   `/` and `/sheet`.
7. Fonts ship self-hosted; no third-party font request remains.
8. Caveshen eyeballs both routes and the sheet at desktop and mobile
   widths before merge (the standing preview gate).

## 10. Build shape

Suggested ticket order, each through the usual worker-reviewer loop:

1. Tokens and fonts: new token set, radius/motion tokens, self-hosted
   `@font-face`, type role swap. Byte-visible change begins here.
2. Landing plaque and plates: option plate redesign, brackets motif.
3. HUD and interaction grammar: chips, focus unification, hover verbs.
4. Scene rebuild, night and day, with corrected geography.
5. Moon phase subsystem with its tests.
6. Sheet codex rework with the retuned portrait.
7. Cleanup: retire dead styles, recount suite, true up the PRD.
