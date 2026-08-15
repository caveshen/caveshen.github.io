# 07 — Land the tuning batch

Spec: `docs/specs/approach-reveal.md` (PRD d36, second attempt).
Glossary: `CONTEXT.md`.

**What to build:** Caveshen's live-preview tuning, accepted
2026-08-15 and committed as a draft with this ticket. The prompt
anchors to the character's face box instead of the raster bounding
box (the raster carries transparent headroom, so the old anchor
floated ~40px high). The accepted gap is 30px. The night shadow
gains a faint third glow layer. Day mode drops its dark-on-pale
variant and wears the night treatment: light text on dark shadows,
both themes. What remains is to make the tests tell the truth
about all of it.

**Blocked by:** 06 — The playbill prompt and focus manners.

**Status:** done — reviewer approved in one round.

- [x] The prompt's vertical anchor is the face box top; the gap
      tuning value is 30px. Position tests re-anchor accordingly
      and prove the anchor: a prompt anchored to the raster box
      (the injected defect) must fail them.
- [x] The night shadow is three layers (anchor, bloom, glow); the
      glow is a tuning value.
- [x] Day mode renders the prompt light-on-dark, same treatment as
      night. The day contrast cells are rewritten for the new
      pairing — light text and dark anchor composited over the
      worst-case day backdrop — gating at AA as before, not
      weakened.
- [x] The beside-fallback still clamps inside the frame at the
      forced tiny viewport with the new anchor.
- [x] Regression assertions prove they can fail: defect injected,
      caught, injection removed.
- [x] Full suite green in one matrix run. Zero flakes.
      Matrix: 2265 passed / 47 skipped / 0 failed across 8
      projects. Unit suite: 100/100.

Notes at close: the old overlap tests compared the prompt against
the raster bounding box, which carries invisible headroom above
the face. The face-box anchor legitimately occupies that band, so
the assertions now reference the face box — the same element the
anchor uses. The reviewer confirmed this tightens the check on
the vertical axis. The beside-fallback criterion is covered by
the existing clamp test, which exercises the new anchor through
the committed source. A stale day-pairing comment in the stage
component was corrected at close (reviewer prescribed).
