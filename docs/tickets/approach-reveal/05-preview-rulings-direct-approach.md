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

**Status:** done — built `8099d20`, reviewer approved with comment
nits, nits fixed `c25bb81`. Matrix 2249/47/0. The hover-away linger
was proven already correct in real time; the stuck prompt was the
pin. The idle re-arm fix resolved a genuine defect (the light went
dark forever after any hover that ended without a dialogue).

- [x] A click or tap anywhere on the character's hit surface starts
      the dialogue, exactly as activating the prompt does. The pin
      behaviour is removed, with its tests.
- [x] The prompt anchors just above the character's head, close to
      it. The gap is a clearly named tuning value.
- [x] Pure hover-away is proven in a test: reveal by hover, move
      the pointer off both character and prompt, and the prompt
      fades after the linger. If real-time behaviour is broken, fix
      the root cause.
- [x] The light gathers after ~5s of scene idleness in every case:
      after load, after dialogue close, and after any engagement
      ends. Idle means no hover over character or prompt, the
      prompt unfocused, no dialogue open.
- [x] The light still stands down on engagement, and reduced-motion
      semantics are unchanged: instant transitions, everything
      still appears.
- [x] Every animated assertion samples a frozen or finished state.
- [x] Regression assertions prove they can fail: defect injected,
      caught, injection removed.
- [x] Full suite green in one matrix run. Zero flakes.
