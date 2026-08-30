# Style Guide — the site's design language, in one place

This is a reference, not a changelog. Every value here is a snapshot read
from source on 2026-08-30. Where a file is the source of truth, this guide
says so — check that file if a value looks wrong.

## 1. Typography

Fonts load in `src/layouts/Base.astro` via `@fontsource`:

- `Cinzel` (600, 700) — the display face.
- `Cormorant Garamond` (500, 600, 500-italic) — the serif face.
- `Cascadia Code` — the mono face, system font, no `@fontsource` import.

Three CSS variables carry them (`src/styles/tokens.css`):

| Token | Stack | Used for |
|---|---|---|
| `--display` | `"Cinzel", "Times New Roman", serif` | Titles: the cover name (`ThresholdCover.astro`), the sheet's name box `h1` and section heads, quest headings (`sheet.astro`). |
| `--serif` | `"Cormorant Garamond", "Times New Roman", serif` | Body text: `Base.astro`'s `body`, the cover tagline (italic), dialogue text (`Stage.astro`), the sheet's epithet (italic) and id-field values. |
| `--mono` | `"Cascadia Code", ui-monospace, Consolas, monospace` | UI controls: buttons, hotkey hints, small-caps labels and captions, the theme toggle, feat marks, panel captions. |

**Type scale in use** (sizes as found in CSS; not an exhaustive list, the
common steps):

- Hero/cover name: `clamp(2rem, 6vw, 3.5rem)`, `--display`, letter-spacing
  `0.06em` (`ThresholdCover.astro`).
- Sheet name box `h1`: `clamp(1.8rem, 4vw, 2.4rem)`, `--display`, weight 600
  (`sheet.astro`).
- Quest heading: `1rem`, `--display`, weight 700 (`sheet.astro`).
- Section head: `1rem`, `--display`, weight 600, letter-spacing `0.06em`
  (`sheet.astro`).
- Body/dialogue text: browser default size on `--serif` (no explicit
  `font-size` on `body`; dialogue and prose inherit it).
- Small caption/label text: `0.52rem`–`0.64rem`, `--mono`, often uppercase
  with wide letter-spacing (`0.14em`–`0.18em`) — the sheet's field labels,
  player caption, panel caption.
- UI buttons: `0.85rem`–`0.95rem`, `--mono` or `--serif`, weight 600
  (cover buttons, approach prompt, fullscreen toggle).

Source of truth: grep `var(--display)`, `var(--serif)`, `var(--mono)` in
`src/pages/sheet.astro`, `src/components/Stage.astro`,
`src/components/ThresholdCover.astro`, `src/components/ThemeToggle.astro`.

## 2. Colour palette

**`src/styles/tokens.css` is the source of truth.** The values below are a
snapshot; always check the file for the current number.

Tokens are declared once in `:root` (night, the default theme) and
overridden in `:root[data-time="day"]` where the theme differs. A token with
no day entry (for example `--head-dark`, `--beacon`) holds the same value in
both themes by design — see §33b's identity/lighting doctrine below.

| Token | Night | Day | Role |
|---|---|---|---|
| `--bg` | `#0c1118` | `#e7f0f5` | Page background |
| `--sky` | `#0c1420` | `#cfe0f0` | Scene sky fill |
| `--sky-horizon` | `#1d2b33` | `#dde9f5` | Sky-to-mountain gradient stop |
| `--mountain` | `#161f27` | `#5d4633` | Near mountain / city fill |
| `--mountain-mid` | `#242f39` | `#8a6d52` | Foothill step |
| `--mountain-far` | `#33414d` | `#a98d6f` | Far mountain |
| `--mountain-fringe` | `#46545e` | `#c2ab8e` | Furthest warehouse fringe |
| `--mountain-lit` / `--mountain-shade` | `#3e4c58` / `#293540` | `#b89a79` / `#9b8266` | Massif lit/shade facets |
| `--building-shade` | `#0d1218` | `#463424` | Building side-face |
| `--sea` | `#1f3036` | `#86b8d0` | Sea fill |
| `--wave` | `#3d5a60` | `#a8d4cf` | Sea foam (lighter tint of `--sea`, kept distinct from `--moon`) |
| `--celestial` | `#ffc46b` | `#e9b64f` | Candlelight windows and stars at night; the sun disc by day |
| `--moon` | `#e8e2d2` | `#e7e3cf` | Moon disc (pale in both themes; hidden by day) |
| `--crater` | `#ccc5b2` | `#cbc6ae` | Moon craters; the champion icon's tile ground |
| `--moon-shade` | `#131a23` | `#cfe0f0` | Unlit side of the moon |
| `--cloud-bank` | `#232f38` | `#fdfbf5` | Moon's cloud bank |
| `--mist` | `#4a5a66` | `#dde9f5` | Ridge-junction mist |
| `--sail` | `#f2ede1` | `#f2ede1` | Day sails on the bay |
| `--beacon` | `#c0392b` | `#c0392b` | Tallest tower's antenna light |
| `--ground` / `--ground-near` | `#0b0e12` / `#05070a` | `#33403c` / `#1f2c28` | Foreground ground plane, near falloff |
| `--rail` | `#0a0e13` | `#7b93ac` | Standing-parapet rail (stroke) |
| `--mote` / `--mote-op` | `#d8c9a0` / `.30` | `#5f7068` / `.28` | Ambient wind motes |
| `--head-dark` | `#0f1826` | *(none)* | Badger head mask stripes and nose — identity colour, holds in both themes |
| `--text` | `#ece4d4` | `#2b2723` | Body text |
| `--stage` | `#7f9490` | `#4c5f5c` | Stage-direction text |
| `--option` | `#8fb4d8` | `#3e5d85` | Dialogue option text |
| `--dim` | `#9aa39b` | `#5d574b` | Muted/secondary text |
| `--gold` / `--gold-bright` | `#d9a94e` / `#ffc46b` | `#6f5620` / `#57431a` | House gold — rules, marks, fills; "bright" is the hover/focus step (day flips the ink weight for AA — see comment in `tokens.css`) |
| `--hairline` | `rgba(217,169,78,.35)` | `rgba(111,86,32,.35)` | Divider lines |
| `--glass-bg` / `--glass-border` | `rgba(14,16,22,.75)` / `rgba(236,228,212,.18)` | `rgba(253,251,245,.81)` / `rgba(43,39,35,.20)` | Glass-panel overlay chrome |

Other tokens (`--card-edge`, `--btn-hover-*`, `--chip-text`,
`--btn-primary-ink`, `--plate-hover-text`, `--prompt-ink`, `--panel-grad`,
`--sheet-bg`) exist for one specific UI surface each — see the comment
directly above each declaration in `tokens.css` for its role.

## 3. The fill-class system (`f-*`)

SVG shapes never take a fill or stroke straight off a token:
`fill="var(--sky)"` as a presentation attribute does not resolve reliably
across engines (see CLAUDE.md's gotchas). Instead every themeable shape
carries a CSS class — `f-sky`, `f-near`, `f-far`, `f-sea`, `f-moon`,
`f-crater`, `f-cel`, `f-wave`, `f-ground`, `f-rail`, `f-head-dark`, and more —
each defined once in `tokens.css` as `.f-x { fill: var(--x); }` (or
`stroke:` for line marks like `.f-rail`). A shape gets its colour, and its
theme swap, purely by wearing the right class.

New SVG art in this codebase must follow the same rule: add a class, not a
`var()` fill attribute.

## 4. Framing and iconography conventions

**Rounded-square icon framing.** The 16px favicon bakes the badger head onto
a rounded-square night-ink backdrop (`rx="24"` on a 200×220 canvas — see the
`faviconSVG` template in `tools/render-og.js`).

**The pixel champion's tile-with-dark-figure treatment.** At 32px and up
(`public/favicon-32.png`, `public/apple-touch-icon.png`, the 32px slot of
`public/favicon.ico`) the icon is a hand-pixelled 32×32 "champion" processed
from a private source photo: background flood-filled to the `--crater` tile
colour, the figure classified to `--head-dark` (ink) or `--moon` (cream) by
luminance. The apple-touch-icon is this same 32×32 art scaled 5× with
nearest-neighbour, centred on a full-bleed `--crater` ground. See
`tools/render-og.js` for the exact recipe. (d44 is mid-flight retuning the
16px slot at time of writing — check `docs/PRD.md` §d44 for the current
state before assuming this section is final.)

**The OG image.** `public/og-image.png` (1200×630) is a screenshot of the
real `/og` route — the pure night scene, no head, no title text. It is
derived, not hand-composed, so it can never drift from the live scene. A
freshness gate (`tools/derived-images.json`, checked by the
`derived-images` unit test) fails the suite if any input changes without a
re-render.

**Portrait treatment.** Two distinct portraits exist, both on `/sheet`:

- The **head panel** (`.head-panel`, 138px, every viewport): a bracketed
  codex-plate frame — a hairline border, sharp radius, four gold corner
  brackets — around `public/sheet-portrait.png`, a duotone-treated crop of
  Caveshen's own photo (see §5's owner-photo exception).
- The **rail portrait** (`.sheet-portrait`, ≥1650px only): the full-body
  raster Badger, sharing a cross-document `view-transition-name` morph with
  the in-scene character. Untouched by the head-panel work; do not confuse
  the two.

## 5. Standing laws

- **Vectors and programmatic drawing only.** No generated art. Reference
  images are inspiration — never traced, shipped, or committed. See
  `CLAUDE.md` and `docs/specs/badger-head.md` ("no generated or traced
  art... geometry is written by hand at hand scale").
- **Recorded exception: owner-captured photographs.** Caveshen's own
  photographs, treated into the site's tokens, may ship in bounded roles
  (the sheet portrait, the pixel champion's source). This does not open the
  door to third-party reference images — see `docs/PRD.md` §d35/d44 for the
  exact wording of each exception.
- **AA contrast over photographs.** Any text set over a photograph or photo
  treatment must clear WCAG AA. The threshold cover and the approach prompt
  do this with a dark anchor text-shadow rather than a background chip —
  see `src/tests/threshold.test.js` and the comment above `.cover-name` in
  `ThresholdCover.astro`.
- **No PII.** `cv.pdf` carries no phone or email; contact is LinkedIn and the
  site itself. Verify with `pdftotext` after any CV re-render.

## 6. Motion notes

**Reduced-motion policy.** Under `prefers-reduced-motion: reduce`:

- The threshold cover's intro (title fade, photo drain, fill bloom) does not
  play — the visitor lands on the still vector scene directly.
- The cover's animated grain and shimmer do not play.
- `.scene` fill/stroke transitions, the camera zoom (`.bg-layer`), the
  city-light glimmer, and button hover transitions all drop to `none`.

Every one of these is a `@media (prefers-reduced-motion: reduce)` block
beside the rule it disables — `tokens.css` and `ThresholdCover.astro` carry
most of them.

**The WebKit performance rule.** Software-rendered WebKit (CI runners, weak
Apple devices) pays a disproportionate per-paint cost for SMIL `<animate>`
on filter attributes and for large live `feTurbulence` regions — enough to
blow click timeouts across the whole e2e suite while Chromium and Firefox
stay fast. This codebase avoids both:

- Stepped filter values are driven from a JS timer, not `<animate>`.
- Film grain is four pre-rendered seamless tiles (`public/grain/grain-*.webp`,
  built by `tools/build-grain-tiles.mjs`), cycled by a timer, instead of a
  live full-viewport `feTurbulence` filter.

See the CLAUDE.md gotcha dated 2026-08-30 for the measured before/after (a
25-minute WebKit kill fell to 6–10 minutes green on this change alone).
