/**
 * Dialogue engine — pure functions + DOM renderer.
 * resolveNode / isPath / resolveTheme are exported for unit tests.
 */

export function resolveNode(tree, id) {
  const node = tree[id];
  if (!node) throw new Error(`Unknown dialogue node: "${id}"`);
  return node;
}

export function isPath(to) {
  return typeof to === 'string' && to.startsWith('/');
}

export function resolveTheme(stored) {
  return stored === 'day' ? 'day' : 'night';
}

const STREAM_MS = 28;
// The beat after punctuation — what separates "typing" from "speaking".
const PAUSE_MS = { '.': 180, '!': 180, '?': 180, ',': 90, ';': 90, ':': 90, '—': 90 };

/**
 * Wire up the dialogue engine to DOM elements.
 * Returns render(id, immediate?) — call with 'root' to start.
 */
export function initEngine(tree, { speechEl, stageEl, choicesEl, cardEl }, navigate, { reducedMotion, streamMs = STREAM_MS } = {}) {
  // ponytail: guard matchMedia for test environments (happy-dom / node)
  const reduced = reducedMotion ??
    (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);

  // Non-null while a line is streaming — doubles as the "am I streaming?" flag,
  // and IS the finisher the skip listener and a natural stream end both call.
  let complete = null;

  // Reveals `text` into a second, aria-hidden node kept OUTSIDE the [aria-live]
  // wrapper (a sibling of it, not of #speech) — #speech itself already holds the
  // full line by the time this runs, so a screen reader is never touched by it.
  function stream(text) {
    const streamEl = document.createElement('p');
    streamEl.className = 'speech-stream';
    streamEl.setAttribute('aria-hidden', 'true');
    const shown = document.createElement('span');
    const pending = document.createElement('span');
    pending.className = 'pending';
    pending.textContent = text;
    streamEl.append(shown, pending);
    speechEl.parentElement.insertAdjacentElement('afterend', streamEl);
    speechEl.classList.add('speech-clip');
    cardEl?.classList.add('is-streaming');

    let i = 0;
    let timer;
    const tick = () => {
      i++;
      shown.textContent = text.slice(0, i);
      pending.textContent = text.slice(i);
      if (i >= text.length) { complete(); return; }
      timer = setTimeout(tick, streamMs + (PAUSE_MS[text[i - 1]] ?? 0));
    };

    complete = () => {
      clearTimeout(timer);
      streamEl.remove();
      speechEl.classList.remove('speech-clip');
      cardEl?.classList.remove('is-streaming');
      complete = null;
    };
    timer = setTimeout(tick, streamMs);
  }

  function render(id, immediate = false) {
    const node = resolveNode(tree, id);
    const apply = () => {
      speechEl.textContent = node.speech;
      stageEl.style.display = node.stage ? '' : 'none';
      if (node.stage) stageEl.textContent = node.stage;
      choicesEl.replaceChildren(...node.options.map(opt => {
        const li = document.createElement('li');
        const b = document.createElement('button');
        b.textContent = opt.label;
        if (opt.kind) b.className = opt.kind;
        b.addEventListener('click', () => {
          if (isPath(opt.to)) navigate(opt.to);
          else render(opt.to);
        });
        li.appendChild(b);
        return li;
      }));
      speechEl.style.opacity = '1';
      // Focus first new button so users don't lose their place — not on
      // initial render, to avoid stealing focus on page load.
      if (!immediate) choicesEl.querySelector('button')?.focus();
      if (!reduced && !immediate) stream(node.speech);
    };
    if (reduced || immediate) { apply(); return; }
    speechEl.style.opacity = '0';
    setTimeout(apply, 200);
  }

  // Capture phase, on the card — fires before the target (a choice button)
  // sees the event, so preventDefault() here reliably suppresses the click a
  // pointerdown would otherwise generate. Escape and Tab pass through:
  // Escape is stage.js's exit contract, Tab is ordinary focus movement.
  cardEl?.addEventListener('pointerdown', skip, true);
  cardEl?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Tab') return;
    skip(e);
  }, true);

  function skip(e) {
    if (!complete) return;
    e.preventDefault();
    e.stopPropagation();
    complete();
  }

  return render;
}
