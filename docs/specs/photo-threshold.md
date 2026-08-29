# The photo threshold

PRD item d43. Workshop rulings accepted by Caveshen 2026-08-27 at the
hybrid mock (`screenshots/view4f-hybrid.html`, rev 2). Test seams
confirmed by Caveshen 2026-08-27. Triage: ready-for-agent. New terms
for the glossary (CONTEXT.md), added as part of this delivery:
threshold cover, un-develop, sketch-materialise intro, film grain,
sea shimmer.

## Problem Statement

The site opens directly on the painted scene. The scene is good — the
d40 workshop proved it survives comparison with photographs of the real
view — but the arrival has no staging. The RPG grammar lives only in
the character sheet and the dialogue; the front door does not play
along. Caveshen's diagnosis: the site lacks a professional,
tongue-in-cheek register that would read well to a corporate visitor
and a games-industry visitor alike. The winners (sheet, dialogue) need
worldbuilding around them, not replacement.

## Solution

The site gains a title beat: the **threshold cover**. On load, the
visitor sees Caveshen's own night photograph of the massif, duotoned
into the night tokens. Over it: his name as the hero title in the
display face, the character-sheet tagline as the subtitle, and a
two-option menu — **New Game** (gold primary) and **Character Sheet**
(quiet secondary). "The Interview" stays the project's internal name
only; the document title is the owner's name alone (preview ruling
2026-08-29, superseding the earlier keep-it-in-the-title decision).
It appears in no heading.

Choosing New Game plays the **un-develop**: the title fades, the
photograph drains away, and beneath it the whole vector scene stands
as gold line-art for a breath — then the fills bloom in by depth, the
Badger last. The world the visitor chose to enter draws itself in.

The arrived scene lives. **Film grain** breathes over the whole frame
and **sea shimmer** moves the water. Both persist; they are the scene's
material, not intro effects. Pointer parallax was mocked and rejected —
too much.

The intro now does the d36 approach light's job of directing the eye.
The glow is removed. The approach prompt loses its gold treatment and
returns to plain white text; Caveshen may strike the prompt entirely at
preview.

## User Stories

1. As a visitor, I want the site to open on the night photograph with Caveshen's name over it, so that a real place and a real person greet me before the game does.
2. As a visitor, I want the photograph to wear the site's own night colours, so that it reads as designed, not pasted.
3. As a visitor, I want New Game to draw the world in — photo, then gold line-art, then paint — so that choosing to play feels like entering the fiction.
4. As a hiring manager in a hurry, I want Character Sheet to take me straight to the sheet, so that the theatre never costs me time.
5. As a visitor who has arrived, I want the scene as it is today plus grain and shimmer, so that the world feels made of material, not flat fills.
6. As a visitor who has arrived, I want the day/night toggle and every existing behaviour unchanged, so that the threshold adds and never breaks.
7. As a visitor returning from the sheet, I want to land in the scene and never see the cover replay, so that the threshold is a door and not a loop.
8. As a motion-sensitive visitor, I want no cover, no un-develop, and no animated grain or shimmer — the still scene directly — so that the page stays calm.
9. As a visitor without JavaScript, I want the page exactly as it is today, so that the cover's arrival costs me nothing.
10. As a keyboard user, I want the menu in the tab order with Enter and Space activation, and focus landing usefully after the un-develop, so that my route in is never worse than today's.
11. As a screen-reader user, I want the cover to read as name, tagline, and two options, so that the arrival is words to me.
12. As a touch visitor, I want both menu targets at 44px or better, so that the elegant type does not cost me accuracy.
13. As a visitor over the photograph, I want every line of text at AA contrast, so that the mood never costs legibility.
14. As a visitor on a slow connection, I want the photograph delivered small and modern (AVIF with fallback, sized variants), so that the first paint stays fast.
15. As Caveshen, I want the shipped photograph stripped of all metadata, so that no location or device detail of mine enters the public repo.

## Implementation Decisions

- **The photograph enters the repo** under the recorded law exception
  (owner-captured, treated into tokens, bounded role). Source: the
  night shot (`screenshots/cpt/20251125_200737.jpg`). Shipped asset:
  AVIF plus JPEG fallback in `public/`, sized variants via `srcset`,
  preloaded as the LCP. All EXIF/metadata stripped at asset build —
  GPS above all. Verification is a unit test on the shipped bytes,
  the same duty `pdftotext` performs for the CV.
- **Duotone by SVG filter**: desaturate, then `feComponentTransfer`
  table mapping into the night ladder — sky at the dark end,
  celestial gold at the light end. `tableValues` cannot read `var()`
  (the SVG-attribute gotcha); the values are authored from the token
  hexes and a unit test asserts they match `tokens.css`.
- **Cover markup**: the name is the page's `<h1>`. The tagline is the
  sheet's accepted copy, verbatim: "Problem solver, coffee enjoyer,
  10x human". New Game is a real `<button>`; Character Sheet is a
  real `<a href="/sheet">` — it navigates, so it is a link. The
  numerals I and II are diegetic hotkey marks; the keys "1" and "2"
  actually work. The italic overline above the title ships as
  `PLACEHOLDER` copy for Caveshen.
- **The un-develop**, starting values from the mock, all tunable at
  preview: title fades 0.4s; photograph drains 1.3s; at ~1.0s the
  sketch state releases and fills bloom 1.1s, staggered by depth
  (sky 0s, world 0.18s, foreground 0.36s), the Badger fading last
  (0.5s delay). The line-art ink is the token gold. The scene is
  pre-armed under the opaque cover: fills at zero, strokes on — via
  CSS classes, per the fill-class law.
- **Film grain**: a full-frame SVG turbulence overlay at low plain
  opacity (~0.12) with a contrast-pushed speckle and a stepped seed
  animation. Plain opacity, never a blend mode — two independent
  mock implementations both found `mix-blend-mode` crushes grain to
  invisibility against this palette.
- **Sea shimmer**: turbulence displacement on the sea and wave
  classes with the vertical channel flattened to a constant —
  horizontal-only displacement, so the horizon seam cannot tear.
  Scale breathes ~5–12 over ~7s.
- **Cover suppression**: choosing New Game sets a session flag; while
  the flag stands, `/` renders without the cover. Arrival from the
  sheet (the return morph) must never replay it.
- **The glow retires.** The d36 approach light and its idle-arm
  machinery are removed. The approach prompt keeps its behaviour,
  anchoring, and shadow legibility duty, but its text is plain white
  in both themes — no gold hand-off. Caveshen rules at preview
  whether the prompt survives at all.
- **Reduced motion**: the cover does not render; no intro, no
  animated grain or shimmer (static grain is acceptable); the still
  scene directly. **No JS**: the cover is hidden by `noscript`; the
  existing no-JS path stands whole.
- Scene geometry does not change. This is one unit of work: cover,
  un-develop, grain, shimmer, glow removal.

## Testing Decisions

- Tests assert external behaviour at the existing seams only:
  Playwright e2e against the built site, and the Vitest unit suite
  for contrast cells, token parity, and asset-byte checks. No new
  seams are mandated; if the worker finds a pure helper worth
  extracting (the un-develop sequencer is the plausible candidate),
  it may export it for unit tests (seams confirmed 2026-08-27).
- E2e file named for the subject: `threshold` (never a tracker ID).
  Unit coverage beside it as the seams fall out.
- Subjects: cover present at fresh load with the duotone filter
  applied; menu tab order, Enter/Space, and the 1/2 hotkeys; New Game
  removes the cover and the scene arrives (frozen-state sampling —
  paused animation or finished state, never a live-clock wait);
  Character Sheet navigates; the session flag suppresses the cover;
  sheet-return never replays it; reduced-motion renders no cover and
  a still scene; the noscript gate hides the cover with JS off.
- Screen-space assertions per the house gotchas:
  `getBoundingClientRect()` over `getBBox()`; hidden-by-state proven
  via computed `display` on the gate, never via collapsed boxes
  (WebKit).
- Contrast cells in the unit suite: title, tagline, and menu text
  composited over the photograph's worst-case region, gating as the
  plaque's cells gate.
- Unit tests: duotone `tableValues` match the token hexes; the
  shipped photo bytes carry no EXIF/GPS markers.
- Every regression assertion proves it can fail: inject the defect,
  see red, remove the injection.
- The performance suite (report-only, baselined) runs before the
  first ticket and after the last; the delivery records the deltas,
  with the photo's LCP cost called out. Lighthouse ≥95 stands.

## Out of Scope

- The in-scene HUD chrome from the workshop's View 1 (quest plate,
  achievement toast, save glyph, speaker nameplate) — a future item.
- A day cover, scene moments, the scene clock, scene-as-data — lapsed
  with d40; separate re-raise if wanted.
- Dialogue content and engine changes; the sheet.
- Cloudflare lazy-loading or caching for the photo — deferred by
  ruling, revisit after delivery.
- Any copy beyond the name and the accepted tagline — the overline
  and any new strings ship `PLACEHOLDER`.

## Further Notes

- Mock lineage: three-view round (game-UI chrome, photo-as-artifact,
  materiality), worker and Fable versions of each, then the accepted
  hybrid `view4f-hybrid.html` rev 2 with renders `view4f-*.png`. All
  gitignored. The mock's values are the starting values.
- The un-develop's middle frame — the whole world as gold wireframe —
  is the item's signature. Guard its legibility when tuning; it must
  hold alone for a beat before the fills come.
- Two traps already paid for, recorded so no worker rediscovers them:
  blend-mode grain invisibility, and vertical-displacement horizon
  tearing at the sea seam.
