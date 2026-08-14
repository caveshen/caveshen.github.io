# 01 — The prompt reveals on hover

Spec: `docs/specs/approach-reveal.md` (PRD d36, second attempt).
Glossary: `CONTEXT.md`.

**What to build:** The pivot's core. At rest the scene is clean — no
permanent button. The character gains a generous invisible hit
surface and the pointer cursor. Hovering the character (or the
prompt itself) reveals the approach prompt: floating shadowed text,
not a boxed control. When hover leaves both, the prompt lingers
about one second, then fades. Keyboard focus reveals it the same
way. On dialogue exit the prompt hides and is re-focused about one
second later, after the camera settles.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] At rest no prompt is visible; the scene is clean.
- [ ] The character has a generous hit surface with the pointer
      cursor. The character is never focusable and never starts the
      dialogue.
- [ ] Hovering the character or the prompt reveals the prompt with a
      fade (starting value 500ms). When hover leaves both, the
      prompt lingers (starting value 1s), then fades out.
- [ ] The prompt stays in the tab order. Focus reveals it; blur
      starts the linger; the focus indicator is visible; Enter and
      Space activate it.
- [ ] The prompt is floating shadowed text: no box, border, or
      glass. Generous spacing. The hit area keeps the 44px floor.
      The strings are today's, verbatim: "Approach the badger" and
      "Approach the hooded figure?". The accessible name is the
      full text.
- [ ] The text treatment carries AA contrast in both themes, gated
      by composited contrast cells over the worst-case backdrop.
- [ ] On dialogue exit the prompt hides, then receives focus about
      one second later. Nothing crosses the character during the
      camera settle.
- [ ] Under reduced motion the reveal and departure are instant;
      the prompt still appears.
- [ ] The 404 page behaves identically through the shared component.
- [ ] Every animated assertion samples a frozen or finished state,
      never a live clock through a proxy wait.
- [ ] Regression assertions prove they can fail: defect injected,
      caught, injection removed.
- [ ] Full suite green in one matrix run. Zero flakes.
