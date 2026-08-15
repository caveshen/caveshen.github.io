# The approach reveal

PRD item d36, second attempt. Grilling rulings accepted by Caveshen
2026-08-14. Triage: ready-for-agent. The glossary (CONTEXT.md)
defines the terms used here: approach light, approach prompt, glass,
plaque, stage voice.

## Problem Statement

A visitor meets a painted scene and a character — and a permanent
web-style button labelled "Approach the badger". The button belongs
to a website, not to the scene. The first attempt to fix this
replaced the button with a free-floating glow above the character.
On preview it read as a strange ball of light, not an invitation.
Caveshen rejected it. The scene still needs a clean rest state and
an in-world way to invite the approach.

## Solution

At rest the scene is clean: no button, no glow. About five seconds
after the page loads, the **approach light** — a soft, steady
edge-light — gathers around the character. It marks the character
as approachable without adding an object to the scene.

When the visitor hovers the character, the **approach prompt**
drifts into view just above the character's head: shadowy, floating
text, not a boxed button. When the pointer leaves, the prompt
lingers for a moment, then fades. Activating the prompt starts the
dialogue exactly as the old button did — and a click or tap on the
character starts it too, as a second vector. Once the visitor
engages, the light stands down; it gathers again whenever the scene
has been idle for a few seconds.

## User Stories

1. As a visitor, I want the scene clean at rest, so that the painting greets me before any interface does.
2. As a visitor, I want the approach light to gather around the character a few seconds after the page loads, so that I notice the character is approachable without being shouted at.
3. As a visitor, I want the light steady rather than pulsing, so that the scene stays calm and my device stays cool.
4. As a visitor, I want the cursor to change over the character, so that I learn the character is alive before anything appears.
5. As a visitor, I want hovering the character to reveal the approach prompt, so that the invitation answers my curiosity.
6. As a visitor, I want the prompt to look like text that drifted into existence, so that it reads as the scene speaking and not as a form control.
7. As a visitor on the landing page, I want the prompt to say "Approach the badger", so that the invitation names the character I see.
8. As a visitor on the 404 page, I want the prompt to say "Approach the hooded figure?", so that the lost-page mood carries into the invitation.
9. As a visitor, I want the prompt to linger after my pointer leaves, so that I have time to act on it.
10. As a visitor, I want hovering the prompt itself to keep it visible, so that travelling from character to prompt never loses it.
11. As a visitor, I want a click or tap on the character to start the dialogue directly, so that the character is a door and not only a doorbell.
12. As a visitor, I want the light to gather again after the scene has been idle a few seconds, so that the invitation always returns when I hesitate.
13. As a touch visitor, I want a single tap on the character to approach, so that the same rule holds on every device.
14. As a touch visitor, I want the prompt's hit area no smaller than 44px, so that the soft visual does not cost me accuracy.
15. As a keyboard user, I want the prompt in the tab order where the button was, so that my route to the dialogue does not change.
16. As a keyboard user, I want focus to reveal the prompt, so that focus and hover are the same conversation.
17. As a keyboard user, I want a visible focus indicator on the prompt, so that I always know where I am.
18. As a keyboard user, I want Enter and Space to activate the prompt, so that it behaves as the button it descends from.
19. As a keyboard user, I want focus to return to the prompt shortly after the dialogue ends, so that I keep my place without text dragging across the settling scene.
20. As a screen-reader user, I want the prompt to carry its full text as its accessible name, so that the affordance is words to me.
21. As a visitor ending a dialogue, I want the scene to return to its clean rest state and the light to gather again a few seconds later, so that the cycle reads the same as arrival.
22. As a motion-sensitive visitor, I want no fades under reduced motion, so that the page stays still; the light and the prompt appear and depart instantly, but both still appear.
23. As a visitor in either theme, I want the prompt's text readable over the scene, so that the soft look never costs legibility.
24. As a visitor on a tiny viewport, I want the prompt beside the character when there is no room above, so that it never covers the character.
25. As a visitor resizing the window, I want the prompt to keep its place near the character, so that the anchoring never visibly breaks.
26. As a visitor without JavaScript, I want the page to behave exactly as it does today, so that the reveal's arrival costs me nothing.

## Implementation Decisions

- The approach prompt remains a real button element with the
  existing anchoring, resize handling, and beside-the-character
  fallback. It is always in the tab order. It is visually hidden
  until hover or focus reveals it.
- The prompt has no box, border, or glass chrome. It is text with a
  shadow treatment. The shadow carries the AA contrast duty the
  old button's glass used to carry. Generous spacing around the text; the
  invisible hit area keeps the 44px touch floor.
- The prompt's costume is the playbill treatment (preview ruling
  2026-08-15: the first pass, small monospace, read as scrawny and
  loose in the scene): the site's serif in small caps with generous
  tracking, slightly larger and heavier than the first pass, set
  like a line from a theatre programme. The shadow is three layers —
  a tight dark anchor for legibility, a soft wide bloom that lifts
  the text off the scene, and a faint wider glow in the text's own
  colour that helps the line read against a bright sky (preview
  ruling 2026-08-15). Day mode still read as swallowed by the scene
  on a later live tasting; the strongest of four shadow treatments
  was accepted (preview ruling 2026-08-15): the anchor layer
  hardened to full opacity at a tighter 3px blur, and the bloom
  layer widened to a 14px blur at 0.85 opacity. The glow layer is
  unchanged. The prompt is deliberately not the stage voice: the
  invitation is its own register. All values are tuning values.
- A final live tuning session (preview ruling 2026-08-15) reworked
  the shadow to six layers. The prompt now carries the approach
  light's own gold: on reveal the light fades from the character,
  and the prompt's text glows in the same gold, a three-stop bloom,
  so the light reads as moving from the character to the prompt.
  The dark layers deepened to a charcoal pocket (a dark anchor on
  top, then a dense dark layer plus a wider dark skirt beneath the
  gold) — the earlier grey wash read too weak behind the gold. All
  values remain tuning values.
- The prompt is light-on-dark in both themes (preview ruling
  2026-08-15): day mode dropped its dark-text, pale-shadow variant,
  which read as swallowed by the bright day sky. Day now wears the
  same light text and dark shadow as night.
- The dialogue's first choice receives focus when a dialogue opens,
  so keyboard users can proceed at once. The focus highlight shows
  only for keyboard arrivals; a pointer entry shows no pre-selected
  choice (preview ruling 2026-08-15: the highlight leaked to mouse
  clicks and read as an unintended pre-selection).
- The character gains a generous invisible hit surface — the figure's
  bounds plus comfortable padding — with the pointer cursor. The
  character is never focusable, but a click or tap on it starts the
  dialogue directly (preview ruling 2026-08-14; this replaced the
  earlier pin behaviour — the pin punished the visitor by leaving
  the prompt stranded on screen). The prompt remains the keyboard
  and screen-reader vector.
- Summoning rules: hover over character or prompt reveals and holds
  the prompt. When hover leaves both, the prompt lingers one second,
  then fades.
- The prompt anchors to the top of the character's face box, not
  the raster bounding box — the raster carries transparent headroom
  above the drawn head, so anchoring to it floated the prompt too
  high (preview ruling 2026-08-15). The gap above the face box is
  50px (preview rulings 2026-08-14 and 2026-08-15: 14px, then 6px,
  then 1px all read as too high or too close, then 30px, then 35px
  for a touch more air above the character; a final live tuning
  session, preview ruling 2026-08-15, moved the gap from 35px to
  50px, the accepted value, superseding 35px). The gap is a tuning
  value.
- The reveal fade starts at 500ms. The linger starts at one second.
  Both are tuning values.
- The approach light is a steady edge-light on the character,
  achieved with a filter, never with geometry. It gathers whenever
  the scene has been idle for about five seconds — after load,
  after dialogue close, and after any engagement ends (preview
  ruling 2026-08-14: always return on idle, not only after load
  and close). Idle means: no hover over character or prompt, the
  prompt unfocused, no dialogue open. It stands down when the
  visitor engages (hover, focus, or click). It never pulses — a
  continuous filter animation wastes GPU cycles for nothing.
- On dialogue exit everything resets: prompt hidden, light re-armed
  on its timer. The prompt is re-focused about one second after
  exit, so keyboard continuity survives without text crossing the
  character during the camera settle.
- The prompt strings are today's strings, verbatim: "Approach the
  badger" and "Approach the hooded figure?". The capitalisation and
  the punctuation asymmetry are Caveshen's accepted copy, not drift.
- Reduced motion: every fade and linger becomes instant, but both
  the light and the prompt still appear — they are information, not
  decoration.
- All timing and visual values ship as starting values; Caveshen
  tunes on preview, as the glass was tuned. The spec records the
  outcomes when he rules.
- The glossary retires "approach glow" and "approach hint" and
  gains "approach light" and "approach prompt" as part of this
  delivery.

## Testing Decisions

- Tests assert external behaviour at the existing seams only:
  Playwright e2e against the built site, composited-contrast
  arithmetic in the unit suite, and pure helpers exported for unit
  tests where the worker finds them worth extracting. No new seams.
- **Frozen-state sampling is mandatory from the first test.** Any
  assertion about an animated value samples a paused animation at a
  chosen time or a provably finished state — never a live clock
  through a proxy wait. The first attempt built helpers for exactly
  this; they return with this delivery.
- The prompt's text treatment gets contrast cells in the unit
  suite: text plus shadow composited over the worst-case scene
  backdrop, both themes, gating as the plaque's cells gate.
- The old button's e2e subjects transfer: tab order, Enter and
  Space activation, focus restoration on both exit paths, staying
  inside the stage frame across the viewport matrix, and the
  beside-fallback at the forced tiny viewport.
- New e2e subjects: the light's idle-arm delay and stand-down, the
  hover reveal, the linger, the direct approach from a character
  click, the delayed refocus after exit, and reduced-motion
  variants of each.
- Every regression assertion proves it can fail: inject the defect,
  watch the test catch it, remove the injection.
- One matrix run per ticket. A flake pauses the work and gets
  eliminated at the root.
- The performance suite (report-only, baselined) runs before the
  first ticket and after the last; the delivery records the deltas.

## Out of Scope

- The Badger head art (d35) and any change to dialogue content or
  the engine.
- Any change to the exit affordance or the plaque.
- A first-visit hint that announces itself unprompted.
- Copy changes — the strings ship verbatim; copy is d21's business.
- Automated performance assertions — the perf suite stays
  report-only; Caveshen eyeballs frame timings on preview.

## Further Notes

- This spec supersedes "The approach glow" (first attempt, workshop
  2026-08-12). It was rejected at preview 2026-08-14 and never
  merged. The lesson the rejection bought: a free-floating light
  reads as an object in the scene demanding its own explanation;
  light attached to the character reads as meaning. Invitations
  belong on the character.
- Timing rulings that survived the first attempt and carry here:
  nothing appears over the character while the camera settles
  (~1s), and reveals are fades, never pops — except under reduced
  motion, where everything is instant.
