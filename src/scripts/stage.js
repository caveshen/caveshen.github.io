import { initEngine } from './dialogue.js';
import { computeCameraTransform } from './camera.js';

// Two of Scene.astro's three variants are display:none at any given viewport
// (only one matches the aspect-ratio media query) — this picks the laid-out one.
const visibleOne = (selector) =>
  [...document.querySelectorAll(selector)].find((el) => el.getBoundingClientRect().width > 0);

// Stage interaction — approach prompt, camera zoom, dialogue exit, banner plane, fullscreen toggle.
export function initStage(tree) {
  const speechEl    = document.getElementById('speech');
  const directionEl = document.getElementById('stage'); // the italic stage-direction text, not the stage-frame
  const choicesEl   = document.getElementById('choices');
  const card        = document.querySelector('.card');
  const camera      = document.querySelector('.camera');
  const stageFrame  = document.querySelector('.stage-frame');
  const approachBtn = document.getElementById('approach-prompt');
  const endDlgBtn   = document.getElementById('end-dialogue');
  const bgLayers    = document.querySelectorAll('.bg-layer'); // parallax counter-transform target, one per scene variant

  const render = initEngine(
    tree,
    { speechEl, stageEl: directionEl, choicesEl },
    (path) => { window.location.href = path; }
  );

  // Initial render is immediate — static content is already in place from SSR.
  render('root', true);

  // Card starts [hidden] in markup so no-JS visitors never see it; this script
  // (progressive enhancement) unhides it and adds the entering-fade class here,
  // never as a static .card rule, so a no-JS card stays fully visible.
  card.classList.add('card-entering');
  approachBtn.hidden = false;

  // Clears above the head with a gap, centred on the figure, clamped inside the stage frame.
  function positionPrompt() {
    const figEl = visibleOne('.js-character');
    if (!figEl) return;
    const sf  = stageFrame.getBoundingClientRect();
    const fig = figEl.getBoundingClientRect();
    const GAP = 14; // clearance between the prompt and the head

    // Centre horizontally first — the button's available width (and so its
    // measured height, below) depends on this left offset.
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
      // No translateX centring to absorb an edge overrun here, so left/top
      // must be clamped into the frame — a figure near the edge could
      // otherwise push the prompt out of .stage-frame.
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

  // Entry uses its own inline curve rather than the shared CSS transition (the
  // exit's authoritative, unchanged source) because the shared curve reads as a
  // lurch-then-crawl on entry; cubic-bezier(0.4,0,0.2,1) starts from true rest,
  // avoiding a first-frame jump.
  const ENTRY_TRANSITION = 'transform 550ms cubic-bezier(0.4, 0, 0.2, 1)';
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let approached = false;

  function approach() {
    if (approached) return;
    approached = true;

    // Only set the inline override outside reduced-motion, so the stylesheet's
    // `transition: none` applies unopposed there (an inline style would
    // outrank the media query and reinstate the zoom). bg-layer mirrors it so
    // the parallax counter-scale doesn't shear against the camera mid-zoom.
    if (!reducedMotion()) {
      camera.style.transition = ENTRY_TRANSITION;
      bgLayers.forEach((el) => { el.style.transition = ENTRY_TRANSITION; });
    }

    fadeOutPlane();

    card.hidden    = false;
    endDlgBtn.hidden = false;
    approachBtn.hidden = true;

    // Force a style flush before removing the entering class so the browser
    // paints the opacity:0 starting frame first — otherwise both style changes
    // could coalesce into one frame and the transition would never fire.
    void card.offsetHeight; // force reflow
    card.classList.remove('card-entering');

    const figEl = visibleOne('.js-character');
    if (figEl) {
      const sf  = stageFrame.getBoundingClientRect();
      const fig = figEl.getBoundingClientRect();
      const scale = 2.2;
      // faceTargetY = mid-point between stage top and the measured card top
      // (so the two can't drift apart); faceY = measured .face-void centre
      // (no correction term needed against camera.js's default heuristic).
      const faceVoidEl = visibleOne('.face-void');
      const cardTop = card.getBoundingClientRect().top - sf.top;
      const faceTargetY = cardTop / 2;
      const faceY = faceVoidEl
        ? (faceVoidEl.getBoundingClientRect().top + faceVoidEl.getBoundingClientRect().height / 2) - sf.top
        : undefined;
      const { tx, ty } = computeCameraTransform({ stage: sf, figure: fig, scale, faceTargetY, faceY });
      camera.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
      // Exposed for .bg-layer's counter-scale (tokens.css); tx/ty are exposed
      // alongside scale for parity even though only scale feeds that rule today.
      camera.style.setProperty('--cam-tx', tx);
      camera.style.setProperty('--cam-ty', ty);
      camera.style.setProperty('--cam-scale', scale);
      // Zero the idle drift here too, not just on the next pointermove — otherwise
      // a stale drift offset would ride the whole zoom untouched if the user never
      // moves the mouse again after clicking approach. Set on .camera alongside
      // --cam-scale so it rides the same inline transition just applied above.
      camera.style.setProperty('--drift-x', '0px');
      camera.style.setProperty('--drift-y', '0px');
    }

    const firstChoice = choicesEl.querySelector('button');
    firstChoice?.focus();
  }

  function exit() {
    if (!approached) return;
    approached = false;

    // Clears the entry's inline override so the stylesheet's own transition
    // (unchanged, exit's authoritative source) applies regardless of reduced-motion.
    camera.style.transition = '';
    bgLayers.forEach((el) => { el.style.transition = ''; });

    card.hidden    = true;
    // Re-arm the entering class so a later re-approach fades in again instead
    // of popping; also snaps a mid-fade card cleanly back rather than leaving
    // it stuck half-faded, since hidden takes over the same tick.
    card.classList.add('card-entering');
    endDlgBtn.hidden = true;
    approachBtn.hidden = false;
    camera.style.transform = 'none';
    camera.style.removeProperty('--cam-tx');
    camera.style.removeProperty('--cam-ty');
    camera.style.removeProperty('--cam-scale');

    approachBtn.focus();
  }

  // A plane tows a "MAVERICKS" banner across the sky, zoomed-out scene only.
  // Gating is a live approached/reducedMotion() check at each scheduled tick
  // (not a cancelled timer) — schedulePlane() always clears the previous one
  // before arming the next, so only one timer chain ever runs.
  const PLANE_FIRST_MS = 10_000;
  const PLANE_INTERVAL_MS = 120_000;
  const PLANE_JITTER_MS = 30_000; // ± around the interval — not a metronome
  const PLANE_FLIGHT_MS = 16_000; // knob: crossing speed
  let planeTimer;
  let planeEl = null;

  const nextPlaneDelay = () => PLANE_INTERVAL_MS + (Math.random() * 2 - 1) * PLANE_JITTER_MS;
  function schedulePlane(delay) {
    clearTimeout(planeTimer);
    planeTimer = setTimeout(flyPlane, delay);
  }

  function flyPlane() {
    if (approached || reducedMotion()) {
      schedulePlane(nextPlaneDelay());
      return;
    }
    const el = document.createElement('div');
    el.className = 'banner-plane';
    el.setAttribute('aria-hidden', 'true');
    el.style.animationDuration = `${PLANE_FLIGHT_MS}ms`;
    // "MAVERICKS" is Caveshen's real copy, not a placeholder.
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

  function endPlane() {
    planeEl?.remove();
    planeEl = null;
    schedulePlane(nextPlaneDelay());
  }

  // Interrupted by approach: fade rather than freeze or hard-cut. Detaches the
  // animationend listener first so the still-running flight can't also fire
  // endPlane() after the fade has already rescheduled (would double-run the timer).
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

  // Only reveal the button if the API is actually usable — an unhidden-but-dead
  // button is worse than no button. The stage itself (not <html>) goes
  // fullscreen, so the prompt/card/this button — all its descendants — stay
  // visible and operable (the Fullscreen API hides non-descendants).
  const fsBtn = document.getElementById('fullscreen-toggle');

  if (document.fullscreenEnabled) {
    fsBtn.hidden = false;

    // Four-corner brackets, hand-derived: ENTER has each vertex at the box
    // corner with arms reaching in; EXIT mirrors it (vertex pulled inward,
    // arms reaching back out) — the standard expand/compress pairing.
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
        // Fail quietly on refusal (e.g. permission policy) rather than an
        // unhandled rejection; fullscreenchange keeps the button state honest.
        stageFrame.requestFullscreen().catch(() => {});
      }
    });

    // Covers leaving fullscreen via Escape as well as the button.
    document.addEventListener('fullscreenchange', syncFullscreenButton);
  }

  // Idle micro-parallax: --drift-x/-y are set on .camera and inherit down to every
  // .bg-layer child (one write covers all three Scene variants), nudging them a few
  // px opposite the pointer as if lagging behind the viewer's own head movement.
  // Fine-pointer only, checked once here — touch devices never attach the listener at all.
  if (window.matchMedia('(pointer: fine)').matches) {
    const DRIFT_MAX = 6; // px (SVG user units) at the stage's edge — a faint cue, not a distraction
    let lastX = 0, lastY = 0, driftScheduled = false;

    function updateDrift() {
      driftScheduled = false;
      if (reducedMotion()) {
        camera.style.removeProperty('--drift-x');
        camera.style.removeProperty('--drift-y');
        return;
      }
      if (approached) {
        camera.style.setProperty('--drift-x', '0px');
        camera.style.setProperty('--drift-y', '0px');
        return;
      }
      const sf = stageFrame.getBoundingClientRect();
      const nx = Math.max(-1, Math.min(1, ((lastX - sf.left) - sf.width / 2) / (sf.width / 2)));
      const ny = Math.max(-1, Math.min(1, ((lastY - sf.top) - sf.height / 2) / (sf.height / 2)));
      camera.style.setProperty('--drift-x', `${(-nx * DRIFT_MAX).toFixed(2)}px`);
      camera.style.setProperty('--drift-y', `${(-ny * DRIFT_MAX).toFixed(2)}px`);
    }

    // stageFrame itself is pointer-events:none (Stage.astro) so it never receives
    // hover events over the empty scene — window does, and clientX/Y stay valid
    // since the frame always fills the viewport.
    window.addEventListener('pointermove', (e) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (driftScheduled) return;
      driftScheduled = true;
      requestAnimationFrame(updateDrift);
    }, { passive: true });
  }

  approachBtn.addEventListener('click', approach);
  endDlgBtn.addEventListener('click', exit);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && approached) {
      e.preventDefault();
      exit();
    }
  });
}
