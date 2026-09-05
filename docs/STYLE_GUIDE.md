# Style guide — the site's design language

Rewritten 2026-09-05 for the videogame-menus design. A reference, not a
changelog. `src/styles/tokens.css` is the source of truth for every
value; this page names the roles and the rules.

## 1. The register

The site is a videogame's menus over Cape Town. Two inspirations, one
language: Dragon Age's fantasy weight (serif, gold, hand-drawn world) and
Mass Effect's HUD (holo blue, brackets, readouts, hotkeys). Each view
leans one way while sharing the palette:

- **Title screen** (`ThresholdCover.astro`): the night photograph, a
  main-menu column with numbered hotkeys, corner brackets, a scan sweep
  and a coordinates readout. Sci-fi leaning.
- **The promenade** (`Stage.astro` and the scene): the vector world, a
  quest marker over the character, an area title on arrival, an
  interact prompt, and a dialogue wheel. Fantasy world, sci-fi HUD.
- **The character record** (`sheet.astro`): the CV as a character menu.
  Attributes with gauges, a five-school skill tree, a quest log, a codex.
  Always night: menus have no time of day.

## 2. Type roles

Three faces, loaded from `@fontsource` in `Base.astro`, carried by three
tokens. Every text element belongs to exactly one role.

| Token | Face | Role |
|---|---|---|
| `--display` | Cinzel 600/700 | Names and titles: the cover name, the record's `h1`, section heads, quest titles, attribute scores, the area name. |
| `--hud` | Rajdhani 500/600/700 | The system's voice: menus, hotkey caps, labels, stats, readouts, tabs, the speaker name, option text. Uppercase with wide tracking. |
| `--serif` | Cormorant Garamond 500/600/italic | Spoken and read text: dialogue lines, stage directions, taglines, quest prose, codex entries, skill-node labels. |

`--mono` (Cascadia Code) remains only for the banner-plane text.

## 3. Colour roles

Two accents, one rule each:

- **Gold is the player's attention.** `--gold` for rules and marks;
  `--gold-bright` for the thing that is lit: the active menu row, a
  hovered option, the quest marker, the filled download control, a
  mastered skill node.
- **Holo blue is the system's voice.** `--holo` for readouts, labels,
  captions, the focus ring, the system option, the hotkey caps at rest;
  `--holo-dim` for hairlines and rings.

Night is the default. The world (sky, mountains, sea, ground) has a day
override under `:root[data-time="day"]`; gold darkens to bronze there
for AA on pale ground, and holo deepens. **The HUD holds the night
register in both themes**: the trailing block in `tokens.css` pins
`--text`, `--dim`, `--gold`, `--gold-bright`, `--holo`, `--navy` and the
control ink on `.card`, `.toggle`, `.fullscreen-toggle`,
`.return-to-menu`, `.approach-prompt`, `.area-title` and
`.quest-marker`, so a day world still gets a night HUD.

Key night values (check the file):

| Token | Night | Role |
|---|---|---|
| `--bg` | `#060a12` | Page ground |
| `--navy` | `#0e1a2e` | Panel and icon ground |
| `--sky` | `#0a1428` | Scene sky; the tone map's darkest stop |
| `--celestial` | `#ffc46b` | Windows and stars; the tone map's lightest stop |
| `--text` | `#ece4d4` | Bone: body and option text |
| `--dim` | `#9aa8b8` | Secondary text |
| `--stage` | `#8aa0b8` | Stage directions |
| `--gold` / `--gold-bright` | `#d9a94e` / `#ffc46b` | Attention, rest and lit |
| `--holo` / `--holo-dim` | `#6fb3e8` / 35% | System voice, hairlines |
| `--prompt-ink` | `#ffffff` | Text floated over the scene or the photo |
| `--btn-primary-ink` | `#060a12` | Ink on a filled gold control |

Text over the photograph or the open scene carries a dark anchor
`text-shadow` (`rgb(7, 6, 14)` at full alpha) instead of a chip; the
contrast maths in `theme.test.js` and `threshold.test.js` model that
shadow as the backdrop.

## 4. Surfaces and controls

- **Menus and options** are `--hud` text with a small cap holding the
  hotkey or slot number: holo at rest, gold-bright when lit. Lit means
  text and border go `--gold-bright` with a faint warm wash. No pills,
  no rounded chips; corners are square or cut (`clip-path`) on filled
  controls.
- **Panels** on the record are navy-to-ink gradients with a `--holo-dim`
  hairline and cut corners.
- **The one filled control** is the download button: `--gold` ground,
  `--btn-primary-ink` text, brightens to `--gold-bright`.
- **Focus** is one ring site-wide: `outline: 1px solid var(--holo)`,
  `outline-offset: 3px`. On the wheel the ring shows only for keyboard
  arrivals (`:root.kb-focus`), because a pointer arrival also focuses
  the first option by script.
- **The wheel** places options on spokes around a `--holo-dim` ring with
  a gold diamond hub: the first three on the right, any more mirrored
  on the left. Under 760px, or portrait, it is a stack.

## 5. SVG fills

`var()` does not resolve in SVG presentation attributes. Every themed
shape wears a class, `f-sky`, `f-near`, `f-sea`, `f-marker` and so on,
each defined once in `tokens.css` as `.f-x { fill: var(--x); }`. New art
adds a class, never a `fill="var()"` attribute.

## 6. Identity

- **The mark** is a gold diamond on navy: a `--gold` outline, a navy
  ring, a `--gold-bright` fill. It is the quest marker, the wheel's hub,
  the level badge, and the favicon at 16, 32 and 180, each cut as vector
  for its size by `tools/render-og.js`.
- **The social card** (`public/og-image.png`) is a screenshot of the
  title screen via the `/og` route. Derived, never hand-composed; the
  freshness gate (`tools/derived-images.json`) fails the unit suite if
  an input changes without a re-render.
- **The Badger** is the raster two-frame idle in the scene, and his
  portrait travels to the record's companion seat at 1650px and up via a
  cross-document view transition. The pixel champion, Caveshen's own
  hand-pixelled 32×32, is parked at `public/pixel-champion.png`,
  unlinked, for a use he will decide.
- **The head portrait** on the record is a duotone treatment of
  Caveshen's own photograph (`tools/make-portrait.mjs`).

## 7. Standing laws

- Vectors and programmatic drawing only. No generated or traced art.
  The two exceptions are Caveshen's own photographs, treated into the
  tokens: the cover and the head portrait.
- Text over a photograph or the open scene clears WCAG AA via the
  anchor shadow; the unit suite proves it from the tokens.
- No PII. `cv.pdf` carries no phone or email.
- Copy is Caveshen's voice; shipped or struck, no placeholder marker.

## 8. Motion

- Under `prefers-reduced-motion: reduce`: no cover intro (the visitor
  lands on the still scene), no scan sweep or HUD fade, no marker bob,
  no camera zoom, no streaming text, no wheel transitions, no wind.
  Each is a media block beside the rule it disables.
- Software WebKit pays dearly for SMIL on filter attributes and live
  `feTurbulence`. Stepped values come from a JS timer; the grain is one
  pre-rendered tile.
- Timing tokens: `--t-micro` (150ms) for control feedback, `--ease-camera`
  for the approach, the `--undevelop-*` block for the cover's hand-off
  into the world.
