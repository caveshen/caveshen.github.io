// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resolveNode, isPath, resolveTheme, initEngine } from '../scripts/dialogue.js';
import tree from '../data/dialogue.json';

// ── Solitary tests (pure logic, no DOM) ──────────────────────────────────────

describe('resolveNode', () => {
  it('returns the node for a valid id', () => {
    const node = resolveNode(tree, 'root');
    expect(node.speech).toBeTruthy();
    expect(Array.isArray(node.options)).toBe(true);
  });

  it('throws for an unknown id', () => {
    expect(() => resolveNode(tree, 'nonexistent'))
      .toThrow('Unknown dialogue node: "nonexistent"');
  });
});

describe('isPath', () => {
  it('returns true for /path', () => {
    expect(isPath('/sheet')).toBe(true);
    expect(isPath('/')).toBe(true);
  });

  it('returns false for a node id', () => {
    expect(isPath('root')).toBe(false);
    expect(isPath('experience')).toBe(false);
  });
});

describe('resolveTheme', () => {
  it('stored "day" → day', ()    => expect(resolveTheme('day')).toBe('day'));
  it('stored "night" → night', () => expect(resolveTheme('night')).toBe('night'));
  it('null → night (default)', () => expect(resolveTheme(null)).toBe('night'));
  it('garbage → night', () => {
    expect(resolveTheme('wat')).toBe('night');
    expect(resolveTheme('')).toBe('night');
    expect(resolveTheme(undefined)).toBe('night');
  });
});

// ── Dialogue-tree flow tests (real JSON) ─────────────────────────────────────

describe('dialogue tree schema', () => {
  it('every node has speech and ≥1 option', () => {
    for (const [id, node] of Object.entries(tree)) {
      expect(node.speech, `"${id}" missing speech`).toBeTruthy();
      expect(node.options?.length >= 1, `"${id}" needs ≥1 option`).toBe(true);
    }
  });

  it('every option has label and to', () => {
    for (const [id, node] of Object.entries(tree)) {
      for (const opt of node.options) {
        expect(opt.label, `"${id}" option missing label`).toBeTruthy();
        expect(opt.to,    `"${id}" option missing to`).toBeTruthy();
      }
    }
  });

  it('every option.to resolves (node id or /path)', () => {
    for (const [id, node] of Object.entries(tree)) {
      for (const opt of node.options) {
        if (!isPath(opt.to)) {
          expect(tree[opt.to], `"${id}" → unknown target "${opt.to}"`).toBeDefined();
        }
      }
    }
  });

  it('every node is reachable from root', () => {
    const visited = new Set();
    const queue   = ['root'];
    while (queue.length) {
      const id = queue.shift();
      if (visited.has(id)) continue;
      visited.add(id);
      const node = tree[id];
      if (!node) continue;
      for (const opt of node.options) {
        if (!isPath(opt.to)) queue.push(opt.to);
      }
    }
    for (const id of Object.keys(tree)) {
      expect(visited.has(id), `"${id}" not reachable from root`).toBe(true);
    }
  });

  it('no dead ends (every node has a path back or a /path out)', () => {
    for (const [id, node] of Object.entries(tree)) {
      const hasEscape = node.options.some(opt => isPath(opt.to) || opt.to === 'root');
      expect(hasEscape, `"${id}" is a dead end`).toBe(true);
    }
  });

  it('root has the /sheet system escape option', () => {
    const sheetOpt = tree.root.options.find(opt => opt.to === '/sheet');
    expect(sheetOpt).toBeDefined();
    expect(sheetOpt.kind).toBe('system');
  });
});

// ── Social tests (engine + DOM) ───────────────────────────────────────────────

describe('engine DOM rendering', () => {
  let speechEl, stageEl, choicesEl;

  beforeEach(() => {
    document.body.innerHTML = `
      <p id="stage"></p>
      <div aria-live="polite"><p id="speech"></p></div>
      <ul id="choices"></ul>
    `;
    speechEl  = document.getElementById('speech');
    stageEl   = document.getElementById('stage');
    choicesEl = document.getElementById('choices');
  });

  const mkEngine = (nav = () => {}) =>
    initEngine(tree, { speechEl, stageEl, choicesEl }, nav, { reducedMotion: true });

  it('renders root speech and options', () => {
    mkEngine()('root', true);
    expect(speechEl.textContent.trim().length).toBeGreaterThan(0);
    expect(choicesEl.querySelectorAll('button').length).toBeGreaterThanOrEqual(1);
  });

  it('clicking an option swaps speech and choices', () => {
    mkEngine()('root', true);
    const rootSpeech = speechEl.textContent;
    const experienceBtn = [...choicesEl.querySelectorAll('button')]
      .find(b => !b.classList.contains('system'));
    expect(experienceBtn).toBeDefined();
    experienceBtn.click();
    expect(speechEl.textContent.trim().length).toBeGreaterThan(0);
    expect(speechEl.textContent).not.toBe(rootSpeech);
    // The next node always offers at least a way back
    expect(choicesEl.querySelectorAll('button').length).toBeGreaterThanOrEqual(1);
  });

  it('system option has class "system"', () => {
    mkEngine()('root', true);
    const systemBtn = choicesEl.querySelector('button.system');
    expect(systemBtn).not.toBeNull();
  });

  it('aria-live region is present and updated', () => {
    expect(document.querySelector('[aria-live="polite"]')).not.toBeNull();
    mkEngine()('root', true);
    const before = speechEl.textContent;
    const nonSystemBtn = [...choicesEl.querySelectorAll('button')]
      .find(b => !b.classList.contains('system'));
    nonSystemBtn.click();
    // Content changed — nodes carry different lines
    expect(speechEl.textContent).not.toBe(before);
    expect(document.querySelector('[aria-live="polite"]')).not.toBeNull();
  });

  it('calls navigate for /path options', () => {
    let called = null;
    mkEngine(path => { called = path; })('root', true);
    choicesEl.querySelector('button.system').click();
    expect(called).toBe('/sheet');
  });
});

// ── Streaming reveal ──────────────────────────────────────────────────────────

describe('streaming reveal', () => {
  let speechEl, stageEl, choicesEl, cardEl;
  const miniTree = {
    root: { speech: 'Hello world', options: [{ label: 'Next', to: 'root' }] },
  };

  beforeEach(() => {
    document.body.innerHTML = `
      <main class="card">
        <p id="stage"></p>
        <div aria-live="polite"><p class="speech" id="speech"></p></div>
        <ul id="choices"></ul>
      </main>
    `;
    speechEl  = document.getElementById('speech');
    stageEl   = document.getElementById('stage');
    choicesEl = document.getElementById('choices');
    cardEl    = document.querySelector('.card');
  });

  it('mid-stream: visible text is a strict, shorter prefix while #speech already holds the full line', () => {
    vi.useFakeTimers();
    const render = initEngine(miniTree, { speechEl, stageEl, choicesEl, cardEl }, () => {},
      { reducedMotion: false, streamMs: 20 });
    render('root');
    vi.advanceTimersByTime(200 + 20 * 3); // land the fade, then reveal a few characters
    const shown = cardEl.querySelector('.speech-stream span').textContent;
    expect(speechEl.textContent).toBe('Hello world');
    expect(shown.length).toBeGreaterThan(0);
    expect(shown.length).toBeLessThan('Hello world'.length);
    expect('Hello world'.startsWith(shown)).toBe(true);
    vi.useRealTimers();
  });

  it('completes on a mid-stream keydown: fills the line and clears the streaming state', () => {
    vi.useFakeTimers();
    const render = initEngine(miniTree, { speechEl, stageEl, choicesEl, cardEl }, () => {},
      { reducedMotion: false, streamMs: 20 });
    render('root');
    vi.advanceTimersByTime(200 + 20); // mid-stream
    const evt = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    cardEl.dispatchEvent(evt);
    expect(evt.defaultPrevented).toBe(true);
    expect(cardEl.querySelector('.speech-stream')).toBeNull();
    expect(cardEl.classList.contains('is-streaming')).toBe(false);
    expect(speechEl.textContent).toBe('Hello world');
    vi.useRealTimers();
  });

  it('Escape mid-stream is not swallowed (passes through, no defaultPrevented)', () => {
    vi.useFakeTimers();
    const render = initEngine(miniTree, { speechEl, stageEl, choicesEl, cardEl }, () => {},
      { reducedMotion: false, streamMs: 20 });
    render('root');
    vi.advanceTimersByTime(200 + 20); // mid-stream
    const evt = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    cardEl.dispatchEvent(evt);
    expect(evt.defaultPrevented).toBe(false);
    vi.useRealTimers();
  });

  it('reducedMotion: true never creates a stream node', () => {
    const render = initEngine(miniTree, { speechEl, stageEl, choicesEl, cardEl }, () => {},
      { reducedMotion: true });
    render('root');
    expect(cardEl.querySelector('.speech-stream')).toBeNull();
    expect(speechEl.textContent).toBe('Hello world');
  });

  it('a pointerdown on a choice mid-stream is swallowed, not activated', () => {
    vi.useFakeTimers();
    let navigated = false;
    const render = initEngine(miniTree, { speechEl, stageEl, choicesEl, cardEl },
      () => { navigated = true; }, { reducedMotion: false, streamMs: 20 });
    render('root');
    vi.advanceTimersByTime(200 + 20); // mid-stream
    const btn = choicesEl.querySelector('button');
    const evt = new MouseEvent('pointerdown', { bubbles: true, cancelable: true });
    btn.dispatchEvent(evt);
    expect(evt.defaultPrevented).toBe(true);
    expect(cardEl.querySelector('.speech-stream')).toBeNull(); // swallow completed the line
    expect(navigated).toBe(false); // swallowed pointerdown never produced a click
    vi.useRealTimers();
  });
});
