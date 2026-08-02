import { initEngine } from './dialogue.js';
import { computeCameraTransform } from './camera.js';

/**
 * Stage interaction — approach prompt, camera zoom, dialogue exit, ambient
 * banner plane, fullscreen toggle (PRD d25, was §30 D-10 one level up).
 * Extracted verbatim from index.astro's inline <script> — every DOM lookup
 * here is a generic selector (.js-character, .face-void, .camera,
 * .stage-frame, .card, #approach-prompt, #end-dialogue). Four values vary by
 * route overall — tree, characters, characterLabel, promptLabel — but the
 * other three are markup concerns Stage.astro resolves before this ever
 * runs; this script only ever touches the tree, so it's initStage's one
 * parameter.
 * TS type-cast syntax (valid only in Astro's own <script> processing) is
 * stripped here to match this folder's plain-JS style (see camera.js,
 * dialogue.js) — erased at build time either way, so no behaviour change.
 *
 * @param {object} tree - dialogue JSON (see src/data/dialogue.json)
 */
export function initStage(tree) {
  const speechEl    = document.getElementById('speech');
  const directionEl = document.getElementById('stage'); // the italic stage-direction text, not the stage-frame
  const choicesEl   = document.getElementById('choices');
  const card        = document.querySelector('.card');
  const camera      = document.querySelector('.camera');
  const stageFrame  = document.querySelector('.stage-frame');
  const approachBtn = document.getElementById('approach-prompt');
  const endDlgBtn   = document.getElementById('end-dialogue');

  // ── Dialogue engine ───────────────────────────────────────────────────────

  const render = initEngine(
    tree,
    { speechEl, stageEl: directionEl, choicesEl },
    (path) => { window.location.href = path; }
  );

  // Initial render is immediate — static content is already in place from SSR.
  render('root', true);

  // ── P4: progressive enhancement — reveal approach prompt ────────────────
  // PRD §15 D5: card ships with [hidden] in the markup so it is never painted
  // visible before this script runs. No assignment here; exit() re-arms it.
  // PRD §28: same reasoning — the fade's opacity:0 starting class is added
  // here in JS only, never as a static .card rule, so the no-JS card (which
  // never runs this script) stays fully visible.
  card.classList.add('card-entering');
  approachBtn.hidden = false;

  // Position the prompt near the visible figure's measured location in screen space.
  // PRD §15 D1: floats clear ABOVE the head with a gap (interaction-prompt
  // convention), centred on the figure, clamped inside the stage frame.
  function positionPrompt() {
    // PRD §27: .js-character is shared by the hooded figure and the Badger —
    // only the visible one has width>0, so this picks whichever is active.
    const figEl = [...document.querySelectorAll('.js-character')]
      .find((el) => el.getBoundingClientRect().width > 0);
    if (!figEl) return;
    const sf  = stageFrame.getBoundingClientRect();
    const fig = figEl.getBoundingClientRect();
    const GAP = 14; // clearance between the prompt and the head

    // Centre horizontally on the figure first — the button's available width
    // (and so its measured height, below) depends on this left offset.
    const left = (fig.left + fig.width / 2) - sf.left;
    approachBtn.style.left      = `${left}px`;
    approachBtn.style.right     = 'auto';
    approachBtn.style.bottom    = 'auto';
    approachBtn.style.transform = 'translateX(-50%)';

    // The button is already unhidden by now, so its real (measured) height is
    // available rather than a guess.
    const btnHeight = approachBtn.getBoundingClientRect().height;
    let top = (fig.top - sf.top) - GAP - btnHeight;
    if (top < 8) {
      // Not enough headroom above the head to clear it inside the frame —
      // sit beside the figure instead of pushing the prompt down onto it.
      top = Math.max(8, fig.top - sf.top);
      approachBtn.style.transform = 'none';
      // Reviewer follow-up 1b: this branch sets left/top directly (no
      // translateX centring to absorb an edge overrun), so both must be
      // clamped into the frame itself — a figure near the stage edge could
      // otherwise push the prompt out of .stage-frame on any side.
      const btnWidth  = approachBtn.getBoundingClientRect().width;
      const wantsLeft = (fig.right - sf.left) + GAP;
      const left      = Math.min(Math.max(8, wantsLeft), Math.max(8, sf.width - btnWidth - 8));
      approachBtn.style.left = `${left}px`;
      top = Math.min(top, Math.max(8, sf.height - btnHeight - 8));
    }
    approachBtn.style.top = `${top}px`;
  }
  positionPrompt();
  window.addEventListener('resize', positionPrompt, { passive: true });

  // ── Camera zoom ───────────────────────────────────────────────────────────

  // PRD §21: the shared 950ms/(0.16,1,.3,1) curve reads as a lurch-then-crawl
  // on entry (it's ~97% done by half its duration) but reads correctly on
  // exit (a fast departure that settles) — approved as-is, unchanged below.
  // Entry gets its own curve, set inline only for the zoom-in transition, so
  // it can differ from the exit without touching the shared CSS transition
  // (the exit's authoritative source, so it can never drift from "unchanged").
  // cubic-bezier(0.4, 0, 0.2, 1) is the Material "standard" ease-in-out — its
  // first control point has y=0, so the curve starts from true rest (no
  // first-frame jump) rather than the old curve's ~6x-speed launch.
  const ENTRY_TRANSITION = 'transform 550ms cubic-bezier(0.4, 0, 0.2, 1)';
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let approached = false;

  function approach() {
    if (approached) return;
    approached = true;

    // Inline transition override for the entry only (PRD §21). Under
    // reduced-motion we simply never set it, so the stylesheet's
    // `transition: none` applies unopposed — there is no cascade contest.
    // An inline style would outrank the media query and reinstate the zoom.
    if (!reducedMotion()) camera.style.transition = ENTRY_TRANSITION;

    // PRD §24: an in-flight banner plane bows out rather than freezing mid-sky.
    fadeOutPlane();

    // Show card, hide prompt
    card.hidden    = false;
    endDlgBtn.hidden = false;
    approachBtn.hidden = true;

    // PRD §28: fade the card in, synced with the zoom above. Force a style
    // flush before removing the entering class so the browser paints the
    // opacity:0 starting frame — without it, both style changes could
    // coalesce into one frame and the transition would never fire. Under
    // reduced-motion the flush is a harmless no-op (the CSS `transition: none`
    // catch-all makes the class removal instant), so no branch is needed.
    void card.offsetHeight; // force reflow
    card.classList.remove('card-entering');

    // Measure the visible character (figure or Badger — PRD §27) and compute
    // the camera transform. .js-character is shared by both; only the
    // visible one has width>0.
    const figEl = [...document.querySelectorAll('.js-character')]
      .find((el) => el.getBoundingClientRect().width > 0);
    if (figEl) {
      const sf  = stageFrame.getBoundingClientRect();
      const fig = figEl.getBoundingClientRect();
      const scale = 2.2;
      // PRD §15 D2: frame the face in the band between the top of the stage
      // and the top of the (already-visible) card, derived from the measured
      // card rather than a hard-coded constant, so the two cannot drift apart.
      // Reviewer follow-up 1a: pass the measured .face-void centre directly
      // as faceY, rather than relying on computeCameraTransform's built-in
      // 18%-down-the-figure heuristic — no correction term needed.
      const faceVoidEl = [...document.querySelectorAll('.face-void')]
        .find((el) => el.getBoundingClientRect().width > 0);
      const cardTop = card.getBoundingClientRect().top - sf.top;
      const faceTargetY = cardTop / 2;
      const faceY = faceVoidEl
        ? (faceVoidEl.getBoundingClientRect().top + faceVoidEl.getBoundingClientRect().height / 2) - sf.top
        : undefined;
      const { tx, ty } = computeCameraTransform({ stage: sf, figure: fig, scale, faceTargetY, faceY });
      camera.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    }

    // Focus the first dialogue option (SC5)
    const firstChoice = choicesEl.querySelector('button');
    firstChoice?.focus();
  }

  function exit() {
    if (!approached) return;
    approached = false;

    // Clear the entry's inline transition override — this restores the
    // stylesheet's own transition (unchanged, exit's authoritative source),
    // whether or not reduced-motion is active.
    camera.style.transition = '';

    // Restore state
    card.hidden    = true;
    // PRD §28 AC4: re-arm the fade's entering state so a later re-approach
    // fades in again instead of popping (a leftover opacity:1 from a prior
    // fade would otherwise carry over, and mid-fade this also snaps the
    // card's opacity/position cleanly back rather than leaving it stuck
    // half-faded — hidden takes over the same tick so nothing is visible).
    card.classList.add('card-entering');
    endDlgBtn.hidden = true;
    approachBtn.hidden = false;
    camera.style.transform = 'none';

    // Return focus to the approach prompt (SC6)
    approachBtn.focus();
  }

  // ── PRD §24: ambient banner plane ───────────────────────────────────────────
  // A rare flourish: a plane tows a "MAVERICKS" banner across the sky, only in
  // the zoomed-out full scene. Gating is a live approached/reducedMotion() check
  // at each scheduled tick (not a cancelled timer) — simplest way to guarantee
  // only one timer chain ever runs, since schedulePlane() always clears the
  // previous one before arming the next.
  const PLANE_FIRST_MS = 10_000;
  const PLANE_INTERVAL_MS = 120_000;
  const PLANE_JITTER_MS = 30_000; // ± around the interval — "not a metronome"
  const PLANE_FLIGHT_MS = 16_000; // knob: crossing speed
  let planeTimer;
  let planeEl = null;

  const nextPlaneDelay = () => PLANE_INTERVAL_MS + (Math.random() * 2 - 1) * PLANE_JITTER_MS;
  function schedulePlane(delay) {
    clearTimeout(planeTimer);
    planeTimer = setTimeout(flyPlane, delay);
  }

  function flyPlane() {
    // Re-checked live rather than at schedule time: approached()/reducedMotion()
    // can change during the wait, and this is the only gate that matters.
    if (approached || reducedMotion()) {
      schedulePlane(nextPlaneDelay());
      return;
    }
    const el = document.createElement('div');
    el.className = 'banner-plane';
    el.setAttribute('aria-hidden', 'true');
    el.style.animationDuration = `${PLANE_FLIGHT_MS}ms`;
    // Banner trails behind (left, since flight is left-to-right — PRD §24
    // RULED direction) with the plane leading on the right. Copy is
    // Caveshen's own ("MAVERICKS"), not placeholder — see PRD §24.
    el.innerHTML = `
      <span class="banner-rect">MAVERICKS</span>
      <span class="banner-tow"></span>
      <svg class="plane-icon" width="30" height="14" viewBox="0 0 30 14" aria-hidden="true">
        <path d="M0 6 H20 V8 H0 Z M20 5 L28 7 L20 9 Z M8 6 L16 0 L20 6 Z M8 8 L16 14 L20 8 Z" fill="currentColor" />
      </svg>`;
    el.addEventListener('animationend', endPlane);
    stageFrame.appendChild(el);
    planeEl = el;
  }

  // Natural end of a completed crossing: remove and reschedule.
  function endPlane() {
    planeEl?.remove();
    planeEl = null;
    schedulePlane(nextPlaneDelay());
  }

  // Interrupted by approach: fade rather than freeze or hard-cut (PRD §24
  // RULED). Detaches the animationend listener first so the still-running
  // flight animation can't also fire endPlane() once the fade has already
  // rescheduled — that would double-run the timer chain.
  function fadeOutPlane() {
    if (!planeEl) return;
    const el = planeEl;
    planeEl = null;
    el.removeEventListener('animationend', endPlane);
    el.addEventListener('transitionend', () => el.remove(), { once: true });
    el.classList.add('plane-fade-out');
    schedulePlane(nextPlaneDelay());
  }

  schedulePlane(PLANE_FIRST_MS);

  // ── Fullscreen toggle (PRD §18 / §17.2) ─────────────────────────────────────
  // Degrade honestly: only reveal the button if the API is actually usable —
  // an unhidden-but-dead button is worse than no button. The stage itself
  // (not <html>) is what goes fullscreen, so the approach prompt / card /
  // this button — all descendants of .stage-frame — stay visible and
  // operable while fullscreen (the Fullscreen API hides everything that
  // isn't a descendant of the fullscreened element).
  const fsBtn = document.getElementById('fullscreen-toggle');

  if (document.fullscreenEnabled) {
    fsBtn.hidden = false;

    // Four-corner brackets, hand-derived rather than swapping the whole SVG:
    // ENTER has each bracket's vertex AT the box corner, arms reaching in;
    // EXIT mirrors it — vertex pulled inward, arms reaching back out to the
    // same points — the standard expand/compress pairing.
    const ENTER_D = 'M4 9V4H9M15 4H20V9M20 15V20H15M9 20H4V15';
    const EXIT_D  = 'M4 9H9V4M20 9H15V4M20 15H15V20M4 15H9V20';
    const fsPath  = fsBtn.querySelector('path');

    function syncFullscreenButton() {
      const isFs = document.fullscreenElement === stageFrame;
      fsBtn.setAttribute('aria-label', isFs ? 'Exit fullscreen' : 'Enter fullscreen');
      fsPath.setAttribute('d', isFs ? EXIT_D : ENTER_D);
    }

    fsBtn.addEventListener('click', () => {
      if (document.fullscreenElement === stageFrame) {
        document.exitFullscreen();
      } else {
        // Refused/unavailable at click time (e.g. permission policy) — fail
        // quietly rather than an unhandled rejection; the button simply
        // stays in its current state, which fullscreenchange keeps honest.
        stageFrame.requestFullscreen().catch(() => {});
      }
    });

    // Must stay correct when the user leaves fullscreen via Escape rather
    // than the button — fullscreenchange covers both paths (PRD §18 AC2).
    document.addEventListener('fullscreenchange', syncFullscreenButton);
  }

  // ── Event wiring ─────────────────────────────────────────────────────────

  approachBtn.addEventListener('click', approach);
  endDlgBtn.addEventListener('click', exit);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && approached) {
      e.preventDefault();
      exit();
    }
  });
}
