# PRD — Caveshen Rajman, Personal Portfolio ("The Interview")

**Status:** Draft v1 — 2026-07-14. Accepted design reference: Sample C artifact
(claude.ai/code/artifact/0b8cd6e0-9bca-4184-bce4-5505fe622121).
**Owner:** Caveshen (all writing/copy). **Orchestrator:** Claude (Fable 5).
**Move this file into the repo as `docs/PRD.md` once the repo exists.**

## 1. Purpose

A personal portfolio that is itself the portfolio piece: an interactive,
adventure-game-styled CV demonstrating narrative, design, and engineering
skill in one artifact.

Priority of audiences:
1. **Games-industry visitors** (calling card / self-expression) — play the dialogue.
2. **Recruiters/tech contacts** (secondary) — reach the plain CV in seconds.

## 2. Non-negotiables

- Must **not look AI-generated**. Design is locked to Sample C; deviations go
  through Caveshen.
- **Caveshen owns all copy** — site text and dialogue trees. Build ships with
  clearly marked placeholders (`PLACEHOLDER` token in source) until he replaces them.
- **Semantic HTML first.** Full CV content readable without JavaScript; the
  dialogue is progressive enhancement.
- **Accessibility floor:** fully keyboard-playable, visible focus, honoured
  `prefers-reduced-motion`, WCAG AA contrast in both themes.
- **Draft before deploy:** Caveshen reviews on local dev; deploy only on his approval.

## 3. Visual identity (locked — Sample C)

Concept: flat-vector Cape Town scene (Lion's Head, Table Mountain, Devil's
Peak, sea) above a narrative-game dialogue card.

**Signature feature: the theme toggle is the time of day.**
Dark (default) = night: stars, moon, sea glints, city-bowl lights.
Light = day: sun, clouds. 0.4s crossfade; none under reduced motion.

| Token | Night (default) | Day |
|---|---|---|
| bg | `#14121f` | `#e9f0ee` |
| scene sky | `#14121f` | `#cfe6e3` |
| mountain / far | `#262138` / `#3a3457` | `#46615c` / `#6f938d` |
| sea | `#223240` | `#7fb5b0` |
| celestial (moon/sun) | `#ffd75e` | `#f2b544` |
| card | `#1e1a2e` | `#fdfbf5` |
| text | `#e9e2cf` | `#253038` |
| stage direction | `#7d95a0` | `#5d7470` |
| option (SCUMM lavender) | `#a48fd8` | `#4d3f80` |
| hover (verb-line yellow) | `#ffd75e` | `#f2b544` (filled) |

Type: **Georgia** (speech/prose), **Cascadia Code / ui-monospace** (options,
labels, chrome). Micro-signatures to keep: blinking avatar (abstract
placeholder until real art exists), SCUMM-style option hover (lavender → yellow).

## 4. Sitemap

- `/` — **The Interview.** Scene + dialogue card. Root node offers topic
  options plus the system option "Skip the chat — open the character sheet".
- `/sheet` — **The Character Sheet.** RPG-flavoured, fully static CV:
  - Class header (e.g. Engineering Manager, multiclassing Narrative Design) — his copy.
  - Skill groups: People / Product / Tech.
  - Quest log: roles from the CV (Derivco EM ← Entelect ← Derivco Durban).
  - Achievements: education, certs, training.
  - **"Download Character Sheet"** button → `/cv.pdf` (repo asset).
  - Contact: LinkedIn + GitHub links. No email on the page (spam caution).
- `404` — one flavour line + link home (nice-to-have).

## 5. Dialogue tree (content model)

JSON, authored/edited directly by Caveshen (proven shape from the samples):

```json
{
  "root": {
    "stage": "optional italic scene direction",
    "speech": "the spoken line",
    "options": [
      { "label": "Tell me about your experience.", "to": "experience" },
      { "label": "Skip the chat — open the character sheet", "to": "/sheet", "kind": "system" }
    ]
  }
}
```

- `to` is a node id, or a path (navigation) when it starts with `/`.
- v1 is a plain stateless tree. Unlockable topics / visited flags are v2.
- Engine: vanilla JS island (~40 lines, as in the samples). No framework
  needed for text swap + buttons; revisit only if v2 state demands it.

## 6. Tech

- **Astro**, static output. Dialogue engine as the only scripted island.
- Dialogue JSON in `src/data/`; design tokens as CSS custom properties.
- Theme: night default; toggle persists via `localStorage`; day/night scene
  swap driven by `data-time` attribute + token overrides (as in Sample C).
- Hosting: GitHub repo under Caveshen's profile → GitHub Pages via the
  official Astro deploy action. Later (out of scope now): purchased domain +
  **personal** Cloudflare account (not the DWL one).
- No CMS, no analytics, no cookies in v1.

## 7. Assets

- `public/cv.pdf` — ATS-friendly, professional, PII-stripped CV derived from
  `CV-CaveshenRajman-2025-v2.pdf`. Claude drafts; Caveshen approves.
  PII (resolved 2026-07-14): phone **and email stripped**; location stays generic
  ("Cape Town, South Africa"); contact lines = LinkedIn URL + site URL.
- Scene + avatar SVGs (from Sample C, refined). Real avatar art optional, later.
- Favicons/OG image derived from the night scene.

## 8. Success criteria (verifiable)

1. With JavaScript disabled, a visitor can reach and read the complete CV
   content (`/sheet` is fully static; `/` carries a working no-JS path to it).
2. Entire dialogue playable by keyboard alone; focus visible throughout.
3. `prefers-reduced-motion`: no blink, crossfade, or translate animations.
4. Recruiter path: landing → character sheet ≤ 2 clicks; → PDF ≤ 3 clicks.
5. Theme: night by default, toggle swaps full scene correctly, choice persists
   across reloads.
6. Lighthouse ≥ 95 accessibility and performance on `/` and `/sheet`.
7. CI check greps for `PLACEHOLDER`; the build warns until all copy is
   Caveshen's.
8. Push to `main` → GitHub Action builds and deploys to GitHub Pages.

## 9. Build phases (worker tasks; reviewer pass before each commit)

- **P0 — Scaffold:** Astro project, tokens, base layout, deploy action. Success: blank
  site deploys to Pages.
- **P1 — The Interview:** scene SVG (night+day), dialogue card, JSON-driven
  engine island, theme toggle with persistence. Success: criteria 2, 3, 5.
- **P2 — Character Sheet:** `/sheet` static page, `cv.pdf` asset, download +
  contact links. Success: criteria 1, 4.
- **P3 — Polish:** 404, meta/OG tags, favicons, Lighthouse pass, placeholder
  CI check, and the §12 hygiene files (robots.txt, llms.txt, sitemap).
  Success: criteria 6, 7.

Parallel, non-worker: Claude drafts the ATS CV; Caveshen writes the real
dialogue script and sheet copy.

## 10. Out of scope (deferred, recorded so they don't creep back in silently)

- "Recruit" CTA / contact form (site is static — needs a form service or a small
  Worker; workshop later with spam resistance, e.g. Turnstile). Until then,
  contact = LinkedIn.
- Unlockable dialogue topics / visited-state flags.
- Additional scenes ("The Study" point-and-click room), sound, commissioned art.
- Custom domain + Cloudflare setup.

## 11. Open questions — RESOLVED 2026-07-14

1. Repo: **`caveshen.github.io`** (root-path Pages), working copy at
   `E:\Dev\caveshen.github.io`.
2. PDF PII: phone **and email** stripped; generic location kept; contact =
   LinkedIn URL + site URL.
3. Dialogue authoring: **direct JSON**. No compiler unless writing volume
   demands it.

## 12. Site & repo hygiene (added 2026-07-14)

- **README.md** — P0, stub linking to this PRD.
- **CONTRIBUTING.md** — deliberately skipped: solo personal site, nobody
  contributes. Add only if that ever changes.
- **LICENSE** — none by default = all rights reserved, which is correct for a
  personal portfolio (his words, his art). Revisit only if code is meant to be
  reusable by others.
- **robots.txt** (`public/robots.txt`) — allow crawling by default (scraping
  the *content* is welcome); points at the sitemap. Optionally disallow
  known-noisy scrapers if spam becomes real rather than hypothetical.
- **llms.txt** (`public/llms.txt`) — curated plain-text summary of who
  Caveshen is and what the site contains, so AI crawlers ingest the intended
  story rather than reverse-engineering it. Copy owned by Caveshen.
- **sitemap.xml** — `@astrojs/sitemap` integration at P3.
- **Honesty note:** the repo must be public for free GitHub Pages, so the
  *implementation* is visible by design — robots.txt cannot hide source code.
  Mitigation is simply discipline: no secrets, no PII, no draft copy beyond
  marked placeholders ever committed. Anything sensitive lives outside the repo.
