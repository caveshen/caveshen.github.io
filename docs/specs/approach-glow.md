# The approach glow

PRD item d36. Workshop rulings accepted by Caveshen 2026-08-12. The
glossary (CONTEXT.md) defines the terms used here: approach glow,
approach hint, glass, plaque, stage voice.

## Problem Statement

A visitor meets a painted scene and a character — and then a
web-style button labelled "Approach the badger". The button belongs
to a website, not to the scene. It breaks the fiction the rest of
the page works to hold. RPGs mark an interactable character with an
indicator in the world; this site marks it with a form control.

## Solution

Replace the button with the **approach glow**: a soft radial light
that floats above the character. At rest it breathes slowly. On
hover or keyboard focus it brightens, and the **approach hint** — a
small glass chip that asks a stage-voice question — fades in beside
it. Activating the glow starts the dialogue exactly as the button
did. The light is the invitation; no permanent text remains.

## User Stories

1. As a visitor, I want an in-world light above the character, so that the invitation to approach belongs to the scene and not to a web page.
2. As a visitor, I want the glow to pulse gently at rest, so that I notice the character is interactable without being shouted at.
3. As a visitor, I want the glow to brighten when I hover it, so that I get feedback that it responds to me.
4. As a visitor, I want the approach hint to fade in on hover, so that I learn what the light does before I commit to a click.
5. As a visitor on the landing page, I want the hint to ask "approach the badger?", so that the invitation names the character I see.
6. As a visitor on the 404 page, I want the hint to ask "approach the stranger?", so that the lost-page mood carries into the invitation.
7. As a visitor, I want a click on the glow to start the dialogue, so that the interaction I was promised happens.
8. As a keyboard user, I want the glow in the tab order where the button was, so that my route to the dialogue does not change.
9. As a keyboard user, I want focus to brighten the glow and show the hint, so that focus and hover are the same conversation.
10. As a keyboard user, I want a visible focus indicator on the glow, so that I always know where I am.
11. As a keyboard user, I want Enter and Space to activate the glow, so that it behaves as the button it replaces.
12. As a keyboard user, I want focus to return to the glow when the dialogue ends, so that I am not dropped somewhere unexpected.
13. As a screen-reader user, I want the glow to carry the full question as its accessible name, so that the affordance is words to me even though it is light to sighted visitors.
14. As a touch user, I want a hit area no smaller than the button's, so that the smaller visual does not cost me accuracy.
15. As a motion-sensitive visitor, I want no pulse and no fades under reduced motion, so that the page stays still; the glow holds at mid-brightness and the hint appears instantly.
16. As a visitor in the day theme, I want the same amber light tuned to daylight, so that the mechanism is one thing and not two.
17. As a visitor ending a dialogue, I want the glow to fade back in as the camera settles, so that the scene recomposes as one motion.
18. As a visitor on a tiny viewport, I want the glow beside the character when there is no room above, so that it never overlaps the character or leaves the stage.
19. As a visitor resizing the window, I want the glow to keep its place above the character, so that the anchoring never visibly breaks.
20. As a visitor without JavaScript, I want the page to behave exactly as it does today, so that the glow's arrival costs me nothing.

## Implementation Decisions

- The glow is a real button element in the DOM, not an element inside
  the scene's SVG. It keeps native keyboard semantics and reuses the
  existing character-rect anchoring, its resize handling, and its
  beside-the-figure fallback for small viewports.
- The visual is a soft radial gradient — no hard edge — in the
  established amber interactive colour, both themes. Day uses a
  tighter halo than night. One mechanism; a distinct day treatment is
  a future escalation only if preview demands it.
- The rest pulse animates opacity and brightness only, on an inner
  layer, never on the activation target itself and never on
  geometry. (Two standing constraints: click targets hold still for
  actionability, and the scene never moves an interactable's box.)
- Hover and focus are one visual state: brighter glow plus the hint.
  A focus indicator distinct from the hover brightening remains
  visible for keyboard users.
- The approach hint is a small glass chip carrying the stage-voice
  question. Per route: "approach the badger?" and "approach the
  stranger?". These strings are Caveshen's accepted copy, not
  placeholders. The chip is not interactive.
- The invisible hit area keeps at least the 44px touch floor
  regardless of the glow's visible size.
- On dialogue exit the glow fades back in on the camera's settle
  rather than appearing instantly. Under reduced motion it appears
  instantly, as everything else does.
- The accessible name is the full per-route question string.
- The web button dies, and its glass recipe with it. The glass
  family survives in the plaque, the theme toggle, the footer — and
  now the hint chip.
- No self-announcing hint on page load. The pulse is the invitation.
- Starting values ship in code and Caveshen tunes them on preview,
  as the plaque's glass was tuned: glow size, halo radius, pulse
  period (accepted starting range 3–4 s), hint fade timing. The
  spec records the outcome when he rules.

## Testing Decisions

- Tests assert external behaviour at three existing seams: Playwright
  e2e against the built site, the composited-contrast arithmetic in
  the unit suite, and pure positioning helpers exported for unit
  tests. No new seams.
- **Frozen-state sampling is mandatory from the first test.** Any
  assertion about an animated value (pulse brightness, hint fade,
  return fade) samples only a paused animation at a chosen time or a
  provably finished state — never a live clock through a proxy wait.
  The plaque delivery shipped three skipped tests by violating this;
  this delivery ships zero.
- The approach hint's text gets contrast cells in the unit suite:
  stage-voice colour over the chip's glass composited over the
  worst-case scene backdrop, both themes, gating as the plaque's
  cells gate.
- The button's existing e2e subjects transfer to the glow: tab
  order, Enter and Space activation, focus restoration on both exit
  paths, staying inside the stage frame and clear of the character
  across the viewport matrix, and the beside-fallback at the forced
  tiny viewport.
- Every regression assertion proves it can fail: inject the defect,
  watch the test catch it, remove the injection. Prior art: the
  plaque and banner-plane suites.
- One matrix run per ticket. A flake pauses the work and gets
  eliminated at the root.

## Out of Scope

- Making the character's body clickable. New PRD item if wanted.
- The Badger head art (d35) and any change to dialogue content or
  the engine.
- A first-visit hint that announces itself unprompted. Ruled out;
  revisit only on evidence from real visitors.
- Any change to the exit affordance or the plaque.
- A distinct day-theme treatment (glint rather than glow) — the
  recorded escalation path, not part of this delivery.

## Further Notes

- This spec establishes **stage voice** as a term (the glossary
  entry landed with the workshop; the PRD's older sections say
  "stage direction" for the content type — both remain correct).
- The scout's anatomy of the button (markup, glass recipe, anchoring
  maths, exit path, reduced-motion habits) is in the session record;
  the worker should read the component and its script fresh rather
  than trust prose.
