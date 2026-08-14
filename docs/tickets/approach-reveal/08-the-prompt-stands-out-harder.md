# 08 — The prompt stands out harder

Spec: `docs/specs/approach-reveal.md` (PRD d36, second attempt).
Glossary: `CONTEXT.md`.

**What to build:** Caveshen's open preview note (2026-08-15): the
prompt text is still swallowed a little by the background — day
mode especially. The candidate levers, one or a blend: slightly
more glow, slightly more shadow, or harder letter edges. This is a
live-tasting ticket: draft variants on the preview, Caveshen picks,
then the accepted values land with reconciled contrast cells.

**Blocked by:** 07 — Land the tuning batch.

**Status:** ready-for-agent (tasting with Caveshen; do not start
unattended)

- [ ] Caveshen accepts a treatment on live preview.
- [ ] The accepted values ship as tuning values; the contrast
      cells reflect them and still gate at AA, not weakened.
- [ ] Both themes hold the accepted legibility; the 404 inherits
      it through the shared component.
- [ ] Regression assertions prove they can fail where assertions
      change.
- [ ] Full suite green in one matrix run. Zero flakes.
