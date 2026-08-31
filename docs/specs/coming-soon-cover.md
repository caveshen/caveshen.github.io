# Spec — d47: Coming-soon live cover

Status: accepted 2026-08-31. Grill concluded in-session; rulings recorded here and in `docs/PRD.md` §d47.

## Problem Statement

The domain caveshen.com sits idle while the site is built. The live site
is only at caveshen.github.io, and it shows everything — including parts
that are not finished (dialogue copy, the character sheet). Caveshen has
nothing polished to show on his own domain, and Cloudflare does no real
work.

## Solution

Go live on caveshen.com with the d43 threshold cover as the whole public
site. The visitor sees the night photograph, the name, the tagline, the
two menu buttons blurred and disabled, and an italic "Coming Soon" line
beneath them. Nothing else ships in that page. The full site stays
reachable at caveshen.github.io as a live, un-indexed preview, and stays
fully testable locally.

## User Stories

1. As a visitor to caveshen.com, I want to see a finished-looking cover page, so that the domain no longer looks abandoned.
2. As a visitor to caveshen.com, I want the menu buttons visibly present but blurred and disabled, so that I understand more is coming without being able to reach unfinished work.
3. As a visitor to caveshen.com, I want an italic "Coming Soon" line beneath the buttons, so that the gate reads as intent, not breakage.
4. As a visitor who follows a deep link (for example /sheet) on caveshen.com, I want to be redirected to the cover, so that I never land on a broken or unfinished page.
5. As a visitor with JavaScript disabled, I want to see the same static cover, so that the gate holds on every client.
6. As a visitor with reduced-motion preferences, I want to see the same static cover, so that the gate holds without motion and without special-casing.
7. As a keyboard or screen-reader user, I want the disabled buttons announced as disabled and skipped in the tab order, so that the gated page is honest to assistive tech.
8. As someone who receives a shared link to caveshen.com, I want the scene OG card and Caveshen's name in the unfurl, so that the share looks like a real site, not a stub.
9. As a search engine, I want caveshen.com indexable with a sitemap listing only the cover, so that the domain starts ageing without advertising gated routes.
10. As a search engine, I want the preview host marked noindex, so that the unfinished site never competes with caveshen.com in results.
11. As Caveshen, I want the existing github.io deploy untouched and ungated, so that I keep a live preview of every merge to main.
12. As Caveshen, I want a real one-line meta description on the cover (mine to strike at preview), so that the indexed page carries substance instead of a placeholder.
13. As Caveshen, I want a guided wizard for the Cloudflare steps only I can do (Pages project, custom domain, DNS, repo secrets), so that the cutover does not mean spelunking dashboards.
14. As the developer or an agent, I want local builds and the test suite to default to ungated, so that development and CI never fight the gate.
15. As the developer or an agent, I want a gated-build check in CI, so that a regression in the gate is caught before it deploys.
16. As the future d48 delivery, I want the gate to be one boolean with one redirect rule set, so that un-gating the sheet later is a small, clean change.

## Implementation Decisions

- **One gate, one boolean.** A single build-time environment variable —
  the repo's first — turns the gate on. Off is the default everywhere:
  local dev, CI tests, the github.io build. Only the Cloudflare deploy
  build sets it.
- **Gated page is cover-only.** With the gate on, the landing page
  renders only the threshold cover. No scene markup, no dialogue, no
  script-driven dismissal, no hotkeys. The cover component gains a gated
  mode: buttons blurred and disabled, the "Coming Soon" line, and the
  no-JS / reduced-motion / session-flag escape rules omitted. With the
  gate off, output is unchanged from today.
- **Hosting split (grill Q9a).** Cloudflare (Pages) serves caveshen.com
  with the gated build. The existing GitHub Pages workflow keeps
  deploying the ungated build to caveshen.github.io unchanged. No CNAME
  is added to GitHub Pages — the github.io host must keep serving.
- **Deep links (grill Q3).** The gated build emits an edge redirect rule
  set (Cloudflare Pages `_redirects` format, version-controlled in the
  build output): every route except the cover 302s to `/`. The ungated
  build emits none.
- **Per-build web posture (grill Q5, Q9).** The site URL becomes
  build-aware: the gated build uses https://caveshen.com for canonicals,
  OG URLs, and the sitemap; the ungated build keeps the github.io URL.
  Robots and llms text move from static files to build-generated output:
  gated = allow all, sitemap lists `/` only, llms text describes the
  cover only; ungated = noindex / disallow, since its only public home
  is the preview host.
- **Meta (grill Q6, Q12).** The scene OG card stays. The document title
  stays "Caveshen Rajman". The placeholder meta description is replaced
  with real copy. Draft, for Caveshen's pass at preview: "Engineering
  Manager. A character sheet, a hand-drawn world, and a conversation —
  coming soon." JSON-LD waits for d48.
- **Copy (grill Q7, Q11).** The line is exactly "Coming Soon", italic,
  beneath the buttons. It ships as real copy, no placeholder marker;
  Caveshen's sign-off happens at preview as ever.
- **Cutover (grill Q1).** In scope. Human-only steps — Cloudflare Pages
  project, custom domain attach, DNS records, API token and account ID
  as repo secrets — are wrapped in a guided wizard, run at delivery.
  The deploy workflow gains one job on main: build with the gate on,
  deploy to Cloudflare Pages.
- **d48 path (grill Q10).** No staged flag now. When the sheet is ready,
  d48 refactors the boolean and drops one redirect rule.

## Testing Decisions

- A good test asserts external behaviour at the highest seam: what a
  browser sees on the built site, never how the flag is wired.
- **Seam 1 (existing, unchanged): the Playwright e2e suite over the
  ungated build.** It runs exactly as today and proves the gate off is a
  no-op. No fixture changes.
- **Seam 2 (new, the only new one): a gated-build pass.** A separate
  Playwright config builds with the gate on and serves on the alternate
  port (the temp-config pattern already documented in CLAUDE.md), then
  asserts: the cover is present and static; no scene markup exists in
  the DOM; both buttons are disabled and blurred; the "Coming Soon" line
  renders italic; tab order skips the disabled controls; title, OG, and
  description are correct; and the no-JS path still shows the cover.
  Build-output facts (redirect rules present, robots/sitemap/llms
  content per posture) are asserted as dist-file checks, following the
  freshness-gate precedent.
- **CI:** the gated pass runs as one additional job (Chromium desktop
  only — the gate is markup, not rendering), alongside the sharded
  matrix. Hygiene assertions on meta/robots are updated where the
  posture changed.
- Prior art: the threshold e2e spec (cover behaviour), the hygiene e2e
  spec (meta/robots), the OG freshness gate (dist checks).
- Regression rule stands: every new assertion is watched to fail first.

## Out of Scope

- Un-gating the character sheet (d48).
- JSON-LD / structured data (deferred to d48).
- Any change to the scene, the un-develop choreography, or the ungated
  cover behaviour.
- The dynamic scene subsystem (d39), the Badger on the threshold (d45).
- Retiring the github.io preview or redirecting it to the domain.

## Further Notes

- The repo is public; the gate is presentation, not secrecy. Accepted at
  the grill.
- The preview host keeps serving old indexed links; noindex retires them
  from results over time. No redirect is wanted while it is the preview.
- The Cloudflare MCP servers in the session are unauthenticated; the
  wizard route needs no API access from the agent.
