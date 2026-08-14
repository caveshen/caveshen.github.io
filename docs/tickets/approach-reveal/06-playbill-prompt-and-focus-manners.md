# 06 — The playbill prompt and focus manners

Spec: `docs/specs/approach-reveal.md` (PRD d36, second attempt —
see the preview rulings dated 2026-08-15 in Implementation
Decisions). Glossary: `CONTEXT.md`.

**What to build:** The prompt's accepted costume and two manners.
The prompt becomes the playbill treatment: the site's serif in
small caps with generous tracking, slightly larger and heavier,
anchored by a two-layer shadow. It sits 1px above the character's
head. And when a dialogue opens by mouse or tap, the first choice
no longer looks pre-selected — the focus highlight shows only for
keyboard arrivals.

**Blocked by:** 05 — Preview rulings: direct approach.

**Status:** done — built `877d6bd`, reviewer approved with two
comment nits, nits fixed in the closing commit. Matrix 2364/47/0.
Notable: native :focus-visible matches a programmatic focus()
redirect in every engine regardless of input modality, so the
highlight gates on a kb-focus modality class instead.

- [x] The prompt gap tuning value is 1px.
- [x] The prompt renders in the site's serif, small caps with
      generous tracking, slightly larger and heavier than the
      monospace pass. The string stays verbatim — small caps are a
      visual treatment, not a copy change.
- [x] The shadow is two layers: a tight dark anchor and a soft wide
      bloom. The composited contrast cells re-gate AA for the new
      treatment over the worst-case backdrop, both themes.
- [x] No box, border, or glass appears; the 44px hit floor holds;
      the prompt's geometry never animates.
- [x] The dialogue's first choice still receives focus when a
      dialogue opens. The focus highlight is visible after a
      keyboard arrival and not visible after a mouse or touch
      arrival — proven both ways in the e2e suite.
- [x] Reduced-motion behaviour is unchanged.
- [x] Every animated assertion samples a frozen or finished state.
- [x] Regression assertions prove they can fail: defect injected,
      caught, injection removed.
- [x] Full suite green in one matrix run. Zero flakes.
