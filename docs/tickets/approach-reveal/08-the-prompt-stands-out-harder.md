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

**Status:** done — reviewer approved in one round.

- [x] Caveshen accepts a treatment on live preview.
      Accepted from a four-way tasting (current, more glow, more
      shadow, harder edges): "more shadow" — anchor at full
      opacity and 3px blur, bloom widened to 14px at 0.85, glow
      unchanged. The gap moved 30px to 35px in the same session.
- [x] The accepted values ship as tuning values; the contrast
      cells reflect them and still gate at AA, not weakened.
- [x] Both themes hold the accepted legibility; the 404 inherits
      it through the shared component. The prompt styles live in
      one shared global block, so the routes cannot diverge; the
      rendered-shadow assertion runs on the home route, and the
      route loop covers the prompt's behaviour on both routes.
- [x] Regression assertions prove they can fail where assertions
      change. Gap reverted to 30 failed the gap test; anchor
      softened to 0.5 failed the day contrast cell at 3.634.
- [x] Full suite green in one matrix run. Zero flakes.
      Matrix: 2265 passed / 47 skipped / 0 failed across 8
      projects. Unit suite: 100/100.
