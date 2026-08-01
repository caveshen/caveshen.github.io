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

/** stored "day" → "day"; anything else (null, garbage, "night") → "night" */
export function resolveTheme(stored) {
  return stored === 'day' ? 'day' : 'night';
}

/**
 * Wire up the dialogue engine to DOM elements.
 * Returns render(id, immediate?) — call with 'root' to start.
 * @param {object} tree - dialogue JSON
 * @param {{ speechEl: Element, stageEl: Element, choicesEl: Element }} els
 * @param {(path: string) => void} navigate - called for /path options
 * @param {{ reducedMotion?: boolean }} [opts]
 */
export function initEngine(tree, { speechEl, stageEl, choicesEl }, navigate, { reducedMotion } = {}) {
  // ponytail: guard matchMedia for test environments (happy-dom / node)
  const reduced = reducedMotion ??
    (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);

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
      // Restore keyboard focus to first new button so users don't lose their place.
      // Skip on initial render (immediate) to avoid stealing focus on page load.
      if (!immediate) choicesEl.querySelector('button')?.focus();
    };
    if (reduced || immediate) { apply(); return; }
    speechEl.style.opacity = '0';
    setTimeout(apply, 200);
  }

  return render;
}
