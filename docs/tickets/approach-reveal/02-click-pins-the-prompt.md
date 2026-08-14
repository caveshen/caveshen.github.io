# 02 — A click on the character pins the prompt

Spec: `docs/specs/approach-reveal.md` (PRD d36, second attempt).
Glossary: `CONTEXT.md`.

**What to build:** A click or tap on the character reveals the
approach prompt and pins it — it no longer fades when hover leaves.
Only activating the prompt ends the pin. This gives touch visitors
the two-step for free: first tap summons, second tap (on the
prompt) approaches. Pin semantics are provisional; Caveshen
workshops them on live preview.

**Blocked by:** 01 — The prompt reveals on hover.

**Status:** done (20e676d)

- [x] A click or tap on the character reveals and pins the prompt;
      it does not fade while pinned.
- [x] A second click on the character is a no-op — never a
      toggle-off.
- [x] Clicking the character never starts the dialogue; only
      activating the prompt does, and that ends the pin.
- [x] After dialogue exit the cycle resets fully: no pin survives.
- [x] On touch, a first tap reveals and a second tap on the prompt
      approaches; the dialogue never launches from a single tap on
      the character.
- [x] Under reduced motion the pinned reveal is instant.
- [x] Every animated assertion samples a frozen or finished state.
- [x] Regression assertions prove they can fail: defect injected,
      caught, injection removed.
- [x] Full suite green in one matrix run. Zero flakes.
