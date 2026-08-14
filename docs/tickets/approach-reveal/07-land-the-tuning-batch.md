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

**Status:** in progress — draft code landed with this ticket;
test reconciliation and the matrix gate remain.

- [ ] The prompt's vertical anchor is the face box top; the gap
      tuning value is 30px. Position tests re-anchor accordingly
      and prove the anchor: a prompt anchored to the raster box
      (the injected defect) must fail them.
- [ ] The night shadow is three layers (anchor, bloom, glow); the
      glow is a tuning value.
- [ ] Day mode renders the prompt light-on-dark, same treatment as
      night. The day contrast cells are rewritten for the new
      pairing — light text and dark anchor composited over the
      worst-case day backdrop — gating at AA as before, not
      weakened.
- [ ] The beside-fallback still clamps inside the frame at the
      forced tiny viewport with the new anchor.
- [ ] Regression assertions prove they can fail: defect injected,
      caught, injection removed.
- [ ] Full suite green in one matrix run. Zero flakes.
