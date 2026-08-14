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
drifts into view: shadowy, floating text, not a boxed button. When
the pointer leaves, the prompt lingers for a moment, then fades. A
click or tap on the character pins the prompt in place. Activating
the prompt starts the dialogue exactly as the old button did. Once
the visitor engages, the light stands down — its invitation is
accepted.

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
11. As a visitor, I want a click or tap on the character to pin the prompt, so that I can summon it deliberately and it stays.
12. As a visitor, I want a second click on the character to do nothing, so that eagerness is never punished with a toggle-off.
13. As a touch visitor, I want a first tap to reveal the prompt and a second tap on the prompt to approach, so that I never launch the dialogue by accident.
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
  until hover, focus, or a pin reveals it.
- The prompt has no box, border, or glass chrome. It is text with a
  soft shadow treatment. The shadow carries the AA contrast duty the
  chip's glass used to carry. Generous spacing around the text; the
  invisible hit area keeps the 44px touch floor.
- The character gains a generous invisible hit surface — the figure's
  bounds plus comfortable padding — with the pointer cursor. The
  character itself is never focusable and never the activation
  target: it summons the prompt; only the prompt starts the dialogue.
- Summoning rules: hover over character or prompt reveals and holds
  the prompt. When hover leaves both, the prompt lingers one second,
  then fades. Click or tap on the character reveals and pins; only
  activating the prompt ends a pin; a second click on the character
  is a no-op. Pin semantics are provisional — Caveshen workshops
  them on live preview.
- The reveal fade starts at 500ms. The linger starts at one second.
  Both are tuning values.
- The approach light is a steady edge-light on the character,
  achieved with a filter, never with geometry. It arms about five
  seconds after page load and about five seconds after each dialogue
  close. It stands down when the visitor engages (hover, focus, or
  click). It never pulses — a continuous filter animation wastes GPU
  cycles for nothing.
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
- New e2e subjects: the light's arm delay and stand-down, the
  hover reveal, the linger, the pin, the touch two-step, the
  delayed refocus after exit, and reduced-motion variants of each.
- Every regression assertion proves it can fail: inject the defect,
  watch the test catch it, remove the injection.
- One matrix run per ticket. A flake pauses the work and gets
  eliminated at the root.
- The performance suite (report-only, baselined) runs before the
  first ticket and after the last; the delivery records the deltas.

## Out of Scope

- The character's body as an activation target — it summons, never
  starts the dialogue.
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
