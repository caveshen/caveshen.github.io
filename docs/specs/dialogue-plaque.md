# Spec — dialogue box re-envisioning (the glass plaque)

PRD item d16 (§33b). Status: **ready for agent.** The design is settled;
the accepted mock lives uncommitted on the workshop branch and is the
visual reference for this build. Spec published 2026-08-10.

## Problem Statement

A visitor approaches a character in the scene — the Badger on the
landing page, the hooded figure on the 404 — and a dialogue card opens.
The card shows an avatar and a nameplate that name a third party: a
placeholder face and the word "Caveshen". But the speaker is the
character standing in the scene. The card contradicts the world it
sits in. It also looks like a generic web card (soft corners, opaque
surface, chip pill) inside a page whose every other control speaks a
game idiom. The visitor gets a mixed message about who is talking and
what kind of place this is.

## Solution

The card loses the avatar and the nameplate. Nothing on the card claims
a speaker; the scene already shows one. The card becomes a glass
plaque in the same material as the other in-scene controls (the
approach prompt, the fullscreen toggle, the footer chip), with an
etched inner frame — a hairline rule and four corner brackets — that
reads as game-UI framing. The scene stays visible through the glass.
One component serves both routes. Everything the card *does* —
streaming speech, option selection, stage directions, keyboard and
reduced-motion behaviour — survives unchanged.

## User Stories

1. As a visitor, I want the dialogue box to carry no name or portrait, so that the character in the scene is unambiguously the one speaking to me.
2. As a visitor, I want the scene to stay visible through the dialogue box, so that the conversation feels like it happens in the world, not over it.
3. As a visitor, I want the dialogue box to share the visual language of the other in-scene controls, so that the page reads as one coherent game surface.
4. As a visitor, I want a framed plaque rather than a bare panel, so that the box feels crafted and game-like without stealing attention from the speaker.
5. As a visitor reading by night, I want the text on the glass to remain clearly legible, so that I can read the dialogue comfortably against the dark scene.
6. As a visitor reading by day, I want the same legibility on the frosted day glass, so that theme choice never costs me readability.
7. As a visitor flipping the theme, I want the plaque to re-shade smoothly with the rest of the scene, so that the time-of-day illusion holds.
8. As a visitor, I want the character's speech to stream in as before, so that the conversation keeps its typewriter rhythm.
9. As a visitor, I want my option buttons to keep their caret-and-amber selection language, so that choosing a reply feels the same as it always has.
10. As a visitor, I want stage directions to stay visually distinct from speech (italic vs roman), so that I can tell narration from dialogue at a glance.
11. As a keyboard visitor, I want visible focus on every control inside the plaque, so that I can navigate the conversation without a mouse.
12. As a reduced-motion visitor, I want no new animation from the plaque, so that the page respects my setting.
13. As a screen-reader visitor, I want the speech live-region and option semantics unchanged, so that the conversation stays announced correctly.
14. As a no-JS visitor, I want the root dialogue content still rendered inside the plaque, so that the page degrades exactly as it did before.
15. As a phone visitor, I want the plaque to fit and scroll on short viewports as the card did, so that no layout ground is lost.
16. As a visitor to the 404 page, I want the same plaque around the hooded figure's dialogue, so that both routes speak one language.
17. As the site owner, I want the dead avatar component and its orphaned design tokens removed, so that the codebase carries no unused weight.
18. As the site owner, I want the contrast guarantees re-proven against the translucent surface, so that the glass never quietly breaks accessibility.
19. As the site owner, I want the full test suite green across the device matrix, so that the change deploys through the same gate as everything else.

## Implementation Decisions

- The head row (avatar + nameplate) leaves the dialogue card markup.
  The avatar component is deleted together with its single call site.
  No replacement identity element of any kind is added.
- The card adopts the shared glass material: by night a dark
  translucent surface (`rgba(10, 8, 22, 0.55)`) with a 2px
  cream-at-22% border; by day a frosted cream surface
  (`rgba(253, 251, 245, 0.65)`) with an ink-at-22% border; 4px corner
  radius; `backdrop-filter: blur(3px)`; no box-shadow. These are the
  exact values already used by the approach prompt and its siblings.
- **Glass density amendment (ruled by Caveshen, 2026-08-11).** The
  base alphas above are the shared material's resting values, not the
  plaque's. On the ticket-01 preview, Caveshen judged the night glass
  too thin — text was swallowed by the scene. The plaque's night alpha
  is 0.75 (the approach prompt's hover density). The computed AA
  worst case then showed day dim and option text failing at 0.65; day
  moved to 0.88. Finally, day stage directions could not reach 4.5:1
  even at 0.88, and Caveshen ruled the resolution: **the day glass
  densifies to the minimum alpha that clears AA for every text
  category (~0.965–0.97)**, accepting the loss of day translucency
  rather than touching any text colour. The dial stays the glass
  alpha, and the glass stays technically translucent (alpha < 1) so
  the plaque remains part of the glass family and its e2e assertions.
  Night keeps 0.75 — every night category passes there with margin.
- The etched inner frame (from the accepted mock, which encodes this
  more precisely than prose): a 1px hairline 8px inside the border,
  drawn as a negative-offset `outline` (legal because the card is
  never focusable), plus four corner brackets with 14px arms drawn as
  `background-image` layers. Both are driven by two locally scoped
  custom properties — `--frame` (50% alpha) and `--frame-faint`
  (18%) — cream by night, ink by day. Default background attachment
  keeps the brackets pinned while the card's content scrolls.
- The day theme override must set `background-color` (the longhand),
  never the `background` shorthand — the shorthand wipes the bracket
  layers.
- Orphaned tokens are removed with the avatar: the avatar ring, the
  hair colour, and the chip background. The chip *text* token stays —
  the character sheet's download button still consumes it.
- The identity/lighting doctrine (PRD §33b): the plaque is
  environment, so the theme pass shades it like the rest of the scene.
  Character identity colours never toggle.
- One component serves both routes; no route-specific plaque variants.
- Nice-to-have, separately ticketed, cut first under pressure: the
  etched frame draws itself during the card's existing 550ms entrance
  window. Disabled under reduced motion. The plaque at rest is
  identical whether or not this ships.
- Copy is untouched. Every PLACEHOLDER stands. No generated art, no
  raster assets, nothing outside the §2 visual lock.

## Testing Decisions

- **Single seam: the existing Playwright e2e suite over the built
  site** (build + preview, full device matrix, both routes, both
  themes). No new seams; Vitest units are untouched because the
  dialogue engine does not change.
- A good test here asserts external behaviour: what renders, geometry
  in screen space (`getBoundingClientRect`, never `getBBox`), computed
  styles, and interaction outcomes. No implementation-detail
  assertions; no golden-image baselines (ruled out in this repo).
- Two existing touchpoints reference the dead head row and must be
  reworked: the dialogue test that clicks the head row as a neutral
  card region (click a different neutral region), and the
  reduced-motion test that asserts the avatar blink is absent (moot
  once the avatar is gone; the assertion leaves with it).
- New assertions: the head row and avatar are absent on both routes;
  the plaque surface and frame render on both routes and both themes.
- **AA re-verification is a hard criterion.** Former contrast checks
  validated text against an opaque surface. The glass makes effective
  contrast depend on the scene behind the card. Verify text and
  control colours against the worst-case effective background
  (glass composited over the scene) in both themes and at zoom,
  deterministically —
  the scene is static SVG, so worst-case backdrops are computable, and
  the suite has zero flake tolerance. If AA fails, the dial is the
  glass alpha (the approach prompt's hover densities, 0.75 night /
  0.88 day, are the next stop), not the text colours. Where those
  stops still fail, the ruling above applies: the alpha rises to the
  minimum value that clears AA, capped strictly below 1. All eight
  theme × text-category checks gate the suite — no documented gaps.
- Prior art: the existing `dialogue`, `interview`, and `theme` e2e
  specs; `docs/TEST-STRATEGY.md` is canonical for suite conventions.
  Every new or reworked regression assertion follows the repo rule:
  inject the defect, watch it fail, then keep it.

## Out of Scope

- The Badger head art and any avatar/portrait revival (PRD §d35 —
  favicon, social previews, character sheet art).
- Dialogue tree content or structure changes (PRD d19), and all site
  copy (Caveshen's, with PLACEHOLDERs standing).
- Any change to the scene artwork, palette, or composition (§2 lock).
- The character sheet page, except confirming its download button
  keeps its token.
- Social preview images (d20).

## Further Notes

- The vision ruling behind the restraint: the site's grammar is
  diegetic — flair belongs to behaviour and time, not ornament; the
  box stays quiet so the on-screen speaker keeps the stage. Recorded
  in PRD §33b.
- Build hygiene from the repo's standing gotchas: never spawn
  `astro dev` as a server (it daemonises; tests use build + preview);
  clear strays before the matrix runs; mind the port-4321 conflict
  workaround in the repo notes.
- The accepted mock is the reference implementation for the visual
  result. Reproduce it; do not guess past it.
