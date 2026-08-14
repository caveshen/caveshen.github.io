# 03 — The approach light

Spec: `docs/specs/approach-reveal.md` (PRD d36, second attempt).
Glossary: `CONTEXT.md`.

**What to build:** The approach light — a soft, steady edge-light —
gathers around the character about five seconds after page load,
marking them as approachable. It stands down once the visitor
engages (hover, focus, or click) and gathers again about five
seconds after each dialogue close.

**Blocked by:** 01 — The prompt reveals on hover. Independent of 02.

**Status:** done (b84ea42)

- [x] The light gathers around the character about 5s after page
      load, as a steady edge-light: filter only, never geometry,
      never pulsing.
- [x] It stands down when the visitor engages: hover, focus, or
      click.
- [x] It gathers again about 5s after each dialogue close.
- [x] Under reduced motion it appears and departs instantly — but
      still appears.
- [x] It reads correctly in both themes, and the 404 page behaves
      identically.
- [x] Every animated assertion samples a frozen or finished state,
      never a live clock through a proxy wait.
- [x] Regression assertions prove they can fail: defect injected,
      caught, injection removed.
- [x] Full suite green in one matrix run. Zero flakes.
