# 04 — Restore the touch floor

Spec: `docs/specs/approach-reveal.md` (PRD d36, second attempt).
Glossary: `CONTEXT.md`. Raised by final validation: the prompt's
hit area measures 41.2px tall. The old button's borders carried
4px of the 44px floor; the restyle removed the borders and kept
the padding, and no test guarded the floor.

**Blocked by:** 01 — The prompt reveals on hover.

**Status:** done (3a354fd)

- [x] The prompt's hit area is at least 44px tall and 44px wide in
      both engines at desktop and phone viewports.
- [x] A test in the e2e suite asserts the floor, with the usual
      defect-injection proof.
- [x] The style comment that claims the padding keeps the floor is
      corrected to state what actually keeps it.
- [x] The word "halo" (glossary avoid-list) is removed from the
      comments this delivery added in the stage component and the
      theme unit tests.
- [x] The word "chip" is removed from the spec's implementation
      decisions (same avoid-list duty the code was held to).
- [x] Full suite green in one matrix run. Zero flakes.
