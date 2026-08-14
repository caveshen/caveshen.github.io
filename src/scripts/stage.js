import { initEngine } from './dialogue.js';
import { computeCameraTransform } from './camera.js';
import { maybeHandoff } from './portrait-handoff.js';

// Module-scope so computeNextPlaneDelay (exported pure fn) can reference them.
const PLANE_INTERVAL_MS = 120_000;
const PLANE_JITTER_MS   = 30_000; // ± around the interval — not a metronome

// Pure: clamp the "beside" prompt position when there is not enough headroom above.
// All lengths are frame-relative px (subtract sf.top/sf.left before passing).
export function clampPromptBeside({ figTop, figRight, sfWidth, sfHeight, btnWidth, btnHeight, gap }) {
  const top      = Math.max(8, figTop);
  const wantsLeft = figRight + gap;
  const left     = Math.min(Math.max(8, wantsLeft), Math.max(8, sfWidth - btnWidth - 8));
  return { left, top: Math.min(top, Math.max(8, sfHeight - btnHeight - 8)) };
}

// Pure: approach-zoom scale, clamped to [1.3, 2.2].
// SAFETY_PX absorbs subpixel rounding so the face never lands flush on the card edge.
export function computeApproachScale(cardTop, faceRect) {
  const SAFETY_PX = 6;
  return faceRect && faceRect.height > 0
    ? Math.min(2.2, Math.max(1.3, (cardTop - SAFETY_PX) / faceRect.height))
    : 2.2;
}

// Pure: next plane delay — base interval with ± jitter. rand is injectable for tests.
export function computeNextPlaneDelay(rand = Math.random) {
  return PLANE_INTERVAL_MS + (rand() * 2 - 1) * PLANE_JITTER_MS;
}

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

  // Focus manners: the choices highlight (Stage.astro's `:root.kb-focus`
  // gate) shows only for keyboard arrivals. Native :focus-visible does NOT
  // suppress the ring when script redirects focus to a different element
  // than the one a pointer event targeted — approach() below focuses the
  // first choice after a click/tap on the character or the prompt, which is
  // exactly that redirect, and every engine shows the ring for it regardless
  // of input modality. Tracked explicitly instead. Capture phase so it
  // always runs, even if a handler further down stops propagation.
  document.addEventListener('keydown', () => document.documentElement.classList.add('kb-focus'), true);
  document.addEventListener('pointerdown', () => document.documentElement.classList.remove('kb-focus'), true);

  const render = initEngine(
    tree,
    { speechEl, stageEl: directionEl, choicesEl, cardEl: card },
    (path) => { maybeHandoff(path); window.location.href = path; }
  );

  // Initial render is immediate — static content is already in place from SSR.
  render('root', true);

  // Card starts [hidden] in markup so no-JS visitors never see it; this script
  // (progressive enhancement) unhides it and adds the entering-fade class here,
  // never as a static .card rule, so a no-JS card stays fully visible.
  card.classList.add('card-entering');
  approachBtn.hidden = false;

  // Clears above the head with a gap, centred on the figure, clamped inside the stage frame.
  // PROMPT_HEAD_GAP_PX is a tuning value.
  const PROMPT_HEAD_GAP_PX = 1;
  function positionPrompt() {
    const figEl = visibleOne('.js-character');
    if (!figEl) return;
    const sf  = stageFrame.getBoundingClientRect();
    const fig = figEl.getBoundingClientRect();

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
    let top = (fig.top - sf.top) - PROMPT_HEAD_GAP_PX - btnHeight;
    if (top < 8) {
      // Not enough headroom above the head to clear it inside the frame —
      // sit beside the figure instead of pushing the prompt down onto it.
      approachBtn.style.transform = 'none';
      // No translateX centring to absorb an edge overrun here, so left/top
      // must be clamped into the frame — a figure near the edge could
      // otherwise push the prompt out of .stage-frame.
      const btnWidth = approachBtn.getBoundingClientRect().width;
      const { left: clampedLeft, top: clampedTop } = clampPromptBeside({
        figTop: fig.top - sf.top, figRight: fig.right - sf.left,
        sfWidth: sf.width, sfHeight: sf.height, btnWidth, btnHeight, gap: PROMPT_HEAD_GAP_PX,
      });
      approachBtn.style.left = `${clampedLeft}px`;
      top = clampedTop;
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

  // Approach-reveal: the prompt starts invisible (opacity:0/pointer-events:none,
  // Stage.astro) and fades in on hover (character or prompt) or focus, lingers
  // briefly once the pointer leaves both, then fades back out. Enter/Space
  // activation needs no wiring here — the browser fires a native click on a
  // focused <button>, which approach() below is already listening for.
  const PROMPT_FADE_MS   = 500;  // reveal/departure fade
  const PROMPT_LINGER_MS = 1000; // grace period after hover leaves before fading out
  const EXIT_REFOCUS_MS  = 1000; // dialogue-exit refocus delay, matches the camera settle

  // Approach light: a steady edge-light on the character, done with a
  // drop-shadow filter, never geometry (see PRD/spec — a free-floating glow
  // was rejected; this one lives directly on .js-character). Gathers after
  // LIGHT_ARM_MS of scene idleness, always — not only after load and
  // dialogue close. refreshIdleTimer() below is the
  // single call site: it stands the light down while engaged (hover over
  // character or prompt, prompt focused, or dialogue open) and (re)arms the
  // gather timer the moment the scene returns to idle, so any engagement
  // ending restarts the 5s countdown fresh. WAAPI fade in, fade out, no loop
  // — it never pulses. duration is zeroed under reduced motion so it still
  // appears/departs, just without the fade; the arm delay itself is
  // untouched (matches PROMPT_FADE_MS's own reduced-motion handling).
  const LIGHT_ARM_MS  = 5000; // delay before the light gathers — tuning value
  const LIGHT_FADE_MS = 500;  // gather/stand-down fade, matches the prompt's own — tuning value
  const LIGHT_OFF = 'drop-shadow(0 0 0px transparent)';
  const LIGHT_ON  = 'drop-shadow(0 0 10px rgba(255, 215, 94, 0.65))'; // warm, reads on both themes — tuning value

  let lightTimer = null;
  let lightAnim = null;

  function armLight() {
    clearTimeout(lightTimer);
    lightTimer = setTimeout(gatherLight, LIGHT_ARM_MS);
  }

  // Animates FROM the character's current computed filter (not a hardcoded
  // constant) — same reasoning as fadePromptTo's `from` read below: standing
  // down a light that never gathered must not flash it on first. Cancels any
  // running fade before starting a new one, same overlap rule as the prompt's.
  function animateLightTo(target) {
    const el = visibleOne('.js-character');
    if (!el) return;
    const from = getComputedStyle(el).filter;
    lightAnim?.cancel();
    lightAnim = el.animate(
      [{ filter: from === 'none' ? LIGHT_OFF : from }, { filter: target }],
      { duration: reducedMotion() ? 0 : LIGHT_FADE_MS, fill: 'forwards' }
    );
  }

  function gatherLight() {
    animateLightTo(LIGHT_ON);
  }

  // Also cancels any pending arm timer — engaging before the light has even
  // gathered must stop it arriving late, not just fade a light that's already lit.
  function standDownLight() {
    clearTimeout(lightTimer);
    animateLightTo(LIGHT_OFF);
  }

  let promptAnim = null;
  let lingerTimer = null;
  let overCharacter = false;
  let overPrompt = false;
  let promptFocused = false;
  // True from exit() until the delayed refocus fires — a stray hover on the
  // character (e.g. the pointer already resting where the dialogue card sat,
  // now revealed once the card hides) must not summon the prompt during the
  // camera settle: "nothing crosses the character" is the contract, not just
  // "nothing pops on its own."
  let settling = false;

  // Idle means: no hover over character or prompt, prompt unfocused, no
  // dialogue open, and not mid-settle. Called on every engagement-state
  // change (hover/focus toggles, approach, exit); stands the light down
  // while engaged, (re)arms the gather timer the instant idle begins.
  function refreshIdleTimer() {
    if (overCharacter || overPrompt || promptFocused || approached || settling) {
      standDownLight();
    } else {
      armLight();
    }
  }

  // Cancels any running fade and starts a new one from the CURRENT rendered
  // opacity (read before cancelling) — overlapping WAAPI fades on the same
  // property composite wrongly if the prior one isn't cancelled first.
  function fadePromptTo(target, ms) {
    const from = parseFloat(getComputedStyle(approachBtn).opacity);
    promptAnim?.cancel();
    promptAnim = approachBtn.animate(
      [{ opacity: from }, { opacity: target }],
      { duration: ms, fill: 'forwards' }
    );
    return promptAnim;
  }

  function showPrompt() {
    clearTimeout(lingerTimer);
    approachBtn.style.pointerEvents = 'auto';
    fadePromptTo(1, reducedMotion() ? 0 : PROMPT_FADE_MS);
  }

  function hidePrompt() {
    const anim = fadePromptTo(0, reducedMotion() ? 0 : PROMPT_FADE_MS);
    // Only the fade that actually finishes should disable pointer-events — a
    // reveal that supersedes this one cancels it, rejecting `finished` instead.
    anim.finished.then(() => { approachBtn.style.pointerEvents = 'none'; }, () => {});
  }

  // Shows immediately whenever any hover/focus source is active; once every
  // source has left, lingers before fading out — never fades while hovered
  // or focused, and hovering the prompt itself (travelling from the
  // character to it) keeps it visible the same way. refreshIdleTimer() rides
  // along on every call — the same hover/focus sources that reveal the
  // prompt also stand the light down, and losing them restarts the idle count.
  function updatePromptVisibility() {
    if (settling) return;
    if (overCharacter || overPrompt || promptFocused) {
      showPrompt();
    } else {
      clearTimeout(lingerTimer);
      lingerTimer = setTimeout(hidePrompt, reducedMotion() ? 0 : PROMPT_LINGER_MS);
    }
    refreshIdleTimer();
  }

  // Every scene variant carries its own copy of the character (three total,
  // two display:none) — attach to all; only the visible one ever receives
  // real pointer events. A click or tap on the hit surface starts the
  // dialogue directly, the same as activating the prompt; the character
  // stays unfocusable, so the prompt remains the keyboard/screen-reader vector.
  document.querySelectorAll('.js-character-hit').forEach((hitEl) => {
    hitEl.addEventListener('pointerenter', () => { overCharacter = true; updatePromptVisibility(); });
    hitEl.addEventListener('pointerleave', () => { overCharacter = false; updatePromptVisibility(); });
    // A click or tap starts the dialogue directly — the same path activating
    // the prompt uses (approach() below no-ops if already approached).
    hitEl.addEventListener('click', approach);
  });
  approachBtn.addEventListener('pointerenter', () => { overPrompt = true; updatePromptVisibility(); });
  approachBtn.addEventListener('pointerleave', () => { overPrompt = false; updatePromptVisibility(); });
  approachBtn.addEventListener('focus', () => { promptFocused = true; updatePromptVisibility(); });
  approachBtn.addEventListener('blur', () => { promptFocused = false; updatePromptVisibility(); });

  let approached = false;

  function approach() {
    if (approached) return;
    approached = true;

    // The prompt is about to be fully hidden for the whole dialogue — drop
    // any pending linger and hover/focus state so a stray timer can't fire
    // (or a stale flag mis-fire the next reveal) while it's gone.
    clearTimeout(lingerTimer);
    promptAnim?.cancel();
    overCharacter = overPrompt = promptFocused = false;
    approachBtn.style.pointerEvents = 'none';
    refreshIdleTimer(); // approached is now true — stands the light down even on a direct character click

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
      // faceTargetY = mid-point between stage top and the measured card top
      // (so the two can't drift apart); faceY = measured .face-void centre
      // (no correction term needed against camera.js's default heuristic).
      const faceVoidEl = visibleOne('.face-void');
      const cardTop = card.getBoundingClientRect().top - sf.top;
      const faceTargetY = cardTop / 2;
      const faceRect = faceVoidEl ? faceVoidEl.getBoundingClientRect() : undefined;
      const faceY = faceRect ? (faceRect.top + faceRect.height / 2) - sf.top : undefined;
      // Zoom scale hardcoded to 2.2 overshoots on short viewports — the face
      // never shrinks with the viewport (Scene.astro's slice crop), so a
      // fixed scale can zoom it past the headroom Stage.astro's cap leaves
      // above the card. SAFETY_PX absorbs subpixel/layout-timing rounding so
      // the scaled face doesn't land flush against the card's edge. Floor of
      // 1.3 matches the smallest zoom that still reads as "zoomed in".
      const scale = computeApproachScale(cardTop, faceRect);
      const { tx, ty } = computeCameraTransform({ stage: sf, figure: fig, scale, faceTargetY, faceY });
      camera.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
      // Feeds .bg-layer's counter-scale (tokens.css).
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

    // The prompt goes back into layout but stays visually hidden (its rest
    // state — opacity:0/pointer-events:none) through the camera settle;
    // nothing crosses the character in that window, including a hover that
    // only lands there because the card just vanished out from under a
    // stationary pointer — settling (above) blocks any reveal until the
    // delayed focus() call below clears it. Focusing it after EXIT_REFOCUS_MS
    // reveals it via the same path as hover, restoring keyboard continuity.
    // Reduced motion: no settle to wait for.
    settling = true;
    clearTimeout(lingerTimer);
    promptAnim?.cancel();
    overCharacter = overPrompt = promptFocused = false;
    approachBtn.style.pointerEvents = 'none';
    approachBtn.hidden = false;
    camera.style.transform = 'none';
    camera.style.removeProperty('--cam-scale');
    refreshIdleTimer(); // still settling — the light stays off through the camera settle

    const refocus = () => {
      settling = false;
      // Dispatches focus synchronously, which reveals the prompt and (via
      // refreshIdleTimer()) keeps the light stood down — the prompt is
      // focused, so the scene isn't idle yet. The light only gathers once
      // the visitor moves focus away and the scene is truly at rest.
      approachBtn.focus();
    };
    if (reducedMotion()) {
      refocus();
    } else {
      setTimeout(refocus, EXIT_REFOCUS_MS);
    }
  }

  // A plane tows a "MAVERICKS" banner across the sky, zoomed-out scene only.
  // Gating is a live approached/reducedMotion() check at each scheduled tick
  // (not a cancelled timer) — schedulePlane() always clears the previous one
  // before arming the next, so only one timer chain ever runs.
  const PLANE_FIRST_MS = 10_000;
  const PLANE_FLIGHT_MS = 16_000; // knob: crossing speed
  // d30: click-to-crash easter egg — sputter + spiral dive is one continuous
  // animation (CRASH_MS); the detached banner falls on its own, independent
  // arc (BANNER_FALL_MS); SEA_FRACTION matches Scene.astro's sea.y/height
  // for the standard/wide variants the plane is limited to.
  const CRASH_MS = 1100;
  const BANNER_FALL_MS = 900;
  const SEA_FRACTION = 0.64;
  let planeTimer;
  let planeEl = null;

  const nextPlaneDelay = computeNextPlaneDelay; // ponytail: alias; no-arg call uses Math.random default
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
      <span class="plane-hit">
        <svg class="plane-icon" width="30" height="14" viewBox="0 0 30 14" aria-hidden="true">
          <path d="M0 6 H20 V8 H0 Z M20 5 L28 7 L20 9 Z M8 6 L16 0 L20 6 Z M8 8 L16 14 L20 8 Z" fill="currentColor" />
        </svg>
      </span>`;
    el.addEventListener('animationend', endPlane);
    // d30: .plane-hit is the padded hitbox (pointer + touch both — 'click'
    // covers a tap too), scoped inside .banner-plane's aria-hidden so it
    // never surfaces in the a11y tree, same as the plane itself today.
    el.querySelector('.plane-hit').addEventListener('click', () => crashPlane(el));
    stageFrame.appendChild(el);
    planeEl = el;
  }

  function endPlane() {
    planeEl?.remove();
    planeEl = null;
    schedulePlane(nextPlaneDelay());
  }

  // d30: click-to-crash. Freezes the flight where it was clicked (baking the
  // in-flight translateX into `left` so switching animation-name doesn't
  // snap it back to the start), detaches the banner into its own sibling so
  // it can flutter down on a slower, independent arc, then lets the
  // `.crashing` class (higher specificity than the base `.banner-plane`
  // rule) take over the transform with the spiral-dive keyframes.
  function crashPlane(el) {
    if (el.classList.contains('crashing') || el.classList.contains('plane-fade-out')) return; // already going down, or leaving
    el.removeEventListener('animationend', endPlane);
    planeEl = null; // so a mid-crash approach() finds nothing to fade out
    schedulePlane(nextPlaneDelay());

    const frame    = stageFrame.getBoundingClientRect();
    const hitEl    = el.querySelector('.plane-hit');
    const bannerEl = el.querySelector('.banner-rect');
    // el's own rect spans banner+tow+hitbox today but shrinks to just the
    // hitbox once detached.append() below pulls banner-rect/banner-tow out —
    // and hitEl sits flex-centred inside that taller box, not flush with
    // bannerEl. Sample each node's own rect before anything moves, or the
    // bake below pins the wrong element's old position and it visibly jumps.
    const hitRect    = hitEl.getBoundingClientRect();
    const bannerRect = bannerEl.getBoundingClientRect();
    const x = hitRect.left - frame.left;
    const y = hitRect.top  - frame.top;
    const bx = bannerRect.left - frame.left;
    const by = bannerRect.top  - frame.top;
    el.style.left = `${x}px`;
    el.style.transform = 'none';
    el.style.animationDuration = `${CRASH_MS}ms`;

    // The sea's rendered top depends on preserveAspectRatio's slice crop, which
    // SEA_FRACTION (a viewBox fraction) doesn't account for — read .f-sea's
    // live rect instead, falling back to the constant only if it's missing.
    const seaEl  = visibleOne('.f-sea');
    const seaTop = seaEl ? seaEl.getBoundingClientRect().top - frame.top : frame.height * SEA_FRACTION;

    const diveY = seaTop - y;
    el.style.setProperty('--dive-y', `${diveY}px`);

    const detached = document.createElement('div');
    detached.className = 'banner-detached';
    detached.setAttribute('aria-hidden', 'true'); // sibling of el, not a descendant — doesn't inherit el's
    detached.style.left = `${bx}px`;
    detached.style.top  = `${by}px`;
    detached.style.animationDuration = `${BANNER_FALL_MS}ms`;
    detached.style.setProperty('--dive-y', `${seaTop - by}px`);
    detached.append(bannerEl, el.querySelector('.banner-tow'));
    stageFrame.appendChild(detached);
    detached.addEventListener('animationend', () => detached.remove(), { once: true });

    el.classList.add('crashing');
    el.addEventListener('animationend', splashPlane, { once: true });
  }

  // Splash reuses the scene's f-wave idiom (Scene.astro/tokens.css) — a small
  // var(--wave)-coloured bar — plus a brief expanding ripple, then removes
  // the plane. Runs after crashPlane()'s dive settles, so the plane sits at
  // its below-the-waterline resting spot for this whole phase.
  function splashPlane(e) {
    const el = e.currentTarget;
    const splash = document.createElement('div');
    splash.className = 'plane-splash';
    splash.setAttribute('aria-hidden', 'true'); // sibling of el, not a descendant — doesn't inherit el's
    splash.style.left = el.style.left;
    const frame = stageFrame.getBoundingClientRect();
    const seaEl = visibleOne('.f-sea');
    splash.style.top = seaEl
      ? `${seaEl.getBoundingClientRect().top - frame.top}px`
      : `${frame.height * SEA_FRACTION}px`;
    stageFrame.appendChild(splash);
    splash.addEventListener('animationend', (ev) => {
      if (ev.animationName !== 'splash-ripple') return; // ignore the earlier pop
      splash.remove();
      el.remove();
    });
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
  armLight();

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
    const DRIFT_MAX = 1; // px (SVG user units) at the stage's edge — a faint cue, not a distraction
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
