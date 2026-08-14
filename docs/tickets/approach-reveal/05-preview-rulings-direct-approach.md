# 05 — Preview rulings: direct approach and the idle light

Spec: `docs/specs/approach-reveal.md` (PRD d36, second attempt —
see the preview rulings dated 2026-08-14 in Implementation
Decisions). Glossary: `CONTEXT.md`.

**What to build:** Caveshen's preview rulings. A click or tap on
the character now starts the dialogue directly — the pin is
removed. The prompt sits closer to the character's head. The
approach light gathers after about five seconds of scene idleness,
always — not only after load and dialogue close. Also verify the
hover-away linger works in real time (Caveshen saw the prompt stay
on screen; the pin may explain it, but prove pure hover-away fades).

**Blocked by:** 04 — Restore the touch floor.

**Status:** ready-for-agent

- [ ] A click or tap anywhere on the character's hit surface starts
      the dialogue, exactly as activating the prompt does. The pin
      behaviour is removed, with its tests.
- [ ] The prompt anchors just above the character's head, close to
      it. The gap is a clearly named tuning value.
- [ ] Pure hover-away is proven in a test: reveal by hover, move
      the pointer off both character and prompt, and the prompt
      fades after the linger. If real-time behaviour is broken, fix
      the root cause.
- [ ] The light gathers after ~5s of scene idleness in every case:
      after load, after dialogue close, and after any engagement
      ends. Idle means no hover over character or prompt, the
      prompt unfocused, no dialogue open.
- [ ] The light still stands down on engagement, and reduced-motion
      semantics are unchanged: instant transitions, everything
      still appears.
- [ ] Every animated assertion samples a frozen or finished state.
- [ ] Regression assertions prove they can fail: defect injected,
      caught, injection removed.
- [ ] Full suite green in one matrix run. Zero flakes.
