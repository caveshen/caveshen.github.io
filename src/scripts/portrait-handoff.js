// portrait-handoff.js — click-time hand-off for cross-document View Transitions.
// Overlays an HTML <img> of the Badger on his on-screen rect so the browser can
// morph it into the portrait seat on /sheet. No-op when any gate condition fails.

// Module-level refs so the pageshow cleanup can reach the elements created by
// a hand-off that happened before a same-session navigation.
let _overlay = null;
let _up      = null;
let _down    = null;

// Teardown exported so unit tests can drive it without a real BFCache restore.
// ponytail: always registered — cheap no-op on fresh loads where nothing was created.
export function cleanupHandoff(overlay, up, down) {
  if (!overlay) return;
  overlay.remove();
  up.style.animation   = '';
  up.style.opacity     = '';
  up.style.visibility  = '';
  down.style.animation  = '';
  down.style.opacity    = '';
  down.style.visibility = '';
}

window.addEventListener('pageshow', () => {
  cleanupHandoff(_overlay, _up, _down);
  _overlay = null;
  _up      = null;
  _down    = null;
});

// Pure gate predicate — all five conditions as explicit parameters so vitest
// can cover every branch without a DOM.
export function shouldHandoff(path, supported, width, reducedMotion, figurePresent) {
  return path === '/sheet' && supported && width >= 1650 && !reducedMotion && figurePresent;
}

export function maybeHandoff(path) {
  const supported     = 'onpageswap' in window;
  const width         = window.innerWidth;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Three scene variants exist — only the laid-out one has a non-zero rect.
  const figure = [...document.querySelectorAll('.badger-figure')]
    .find((el) => el.getBoundingClientRect().width > 0);
  const figurePresent = !!figure;

  if (!shouldHandoff(path, supported, width, reducedMotion, figurePresent)) return;

  _up   = figure.querySelector('.badger-up');
  _down = figure.querySelector('.badger-down');

  // Freeze the two-frame idle on the up frame.
  _up.style.animation   = 'none';
  _up.style.opacity     = '1';
  _down.style.animation = 'none';
  _down.style.opacity   = '0';

  // getBoundingClientRect includes the camera zoom — his true on-screen box.
  const rect   = _up.getBoundingClientRect();
  const filter = getComputedStyle(_up).filter;

  _overlay     = document.createElement('img');
  _overlay.src = '/badger-up.png';
  // Inline style string keeps the element self-contained; no class needed.
  _overlay.style.cssText =
    `position:fixed;top:${rect.top}px;left:${rect.left}px;` +
    `width:${rect.width}px;height:${rect.height}px;` +
    `filter:${filter};view-transition-name:character-portrait;` +
    `pointer-events:none;margin:0;padding:0;border:none;`;
  document.body.appendChild(_overlay);

  // Hide the SVG images so the root snapshot shows no second Badger.
  _up.style.visibility   = 'hidden';
  _down.style.visibility = 'hidden';
}
