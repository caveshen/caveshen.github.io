// gpu-fps-harness.mjs — Ad-hoc local GPU/FPS performance harness.
// Not part of CI or the Playwright test matrix. Run by hand only; no assertions,
// no exit-code gate on the numbers. Prints a human-readable report and exits 0.
//
// Usage:
//   1. npm run build && npm run preview
//   2. node scripts/gpu-fps-harness.mjs
//
// Measures:
//   - Mean / min FPS and dropped frames across four journey phases.
//   - Long animation frames (LoAF) per phase.
//   - Hidden-compute checklist: do animations continue while the page is
//     hidden or an animated element is offscreen / occluded?
//
// ponytail: expects the preview server already running on port 4321 — no server
//           lifecycle managed here; same pattern as capture-return-screenshots.mjs.

import { chromium } from '@playwright/test';

const BASE = 'http://localhost:4321';

// How long to sample rAF for each phase.
const SAMPLE_MS = { idle: 3000, dialogue: 3000, morph: 2000 };

// ---------------------------------------------------------------------------
// FPS sampling
// Drop threshold: 1.5 × median rAF interval, derived per-phase from the
// measured refresh rate. Fallback: 25 ms if no frames were captured.
// ---------------------------------------------------------------------------

async function measureFps(page, durationMs) {
  return page.evaluate((dur) => new Promise(resolve => {
    const ts = [];
    const t0 = performance.now();
    function tick(t) {
      ts.push(t);
      if (t - t0 < dur) {
        requestAnimationFrame(tick);
      } else {
        const iv = [];
        for (let i = 1; i < ts.length; i++) iv.push(ts[i] - ts[i - 1]);
        const fps = iv.map(d => 1000 / d);
        const mean = fps.length ? fps.reduce((a, b) => a + b) / fps.length : 0;
        const min  = fps.length ? Math.min(...fps) : 0;
        const worst   = iv.length ? Math.max(...iv) : 0;
        const sorted  = [...iv].sort((a, b) => a - b);
        const median  = sorted[Math.floor(sorted.length / 2)] ?? 0;
        // ponytail: per-phase median self-masks sustained jank (slow phase lifts its own threshold); mean/min/worst columns carry that signal instead.
        const dropThreshold = median > 0 ? median * 1.5 : 25; // fallback: 25 ms ≈ 40 Hz minimum, only if no frames were captured
        const dropped = iv.filter(d => d > dropThreshold).length;
        resolve({
          mean: +mean.toFixed(1), min: +min.toFixed(1),
          dropped, frames: ts.length,
          worstInterval: +worst.toFixed(1),
          dropThreshold: +dropThreshold.toFixed(1),
          // Infer display refresh from median rAF interval (most representative).
          estimatedHz: median > 0 ? Math.round(1000 / median) : 0,
        });
      }
    }
    requestAnimationFrame(tick);
  }), durationMs);
}

// ---------------------------------------------------------------------------
// Long Animation Frame (LoAF) observer
// ---------------------------------------------------------------------------

async function installLoAF(page) {
  await page.evaluate(() => {
    window.__loaf = [];
    try {
      new PerformanceObserver(list => {
        for (const e of list.getEntries())
          window.__loaf.push({ dur: +e.duration.toFixed(1), t: +e.startTime.toFixed(0) });
      }).observe({ type: 'long-animation-frame', buffered: true });
    } catch (_) {
      window.__loaf = null; // browser build does not support LoAF
    }
  });
}

async function collectLoAF(page) {
  return page.evaluate(() => window.__loaf ?? null);
}

function fmtLoAF(entries) {
  if (entries === null) return 'not supported in this build';
  if (!entries.length)  return 'none';
  const worst = Math.max(...entries.map(e => e.dur));
  return `${entries.length} entry/entries, worst ${worst.toFixed(1)} ms`;
}

// ---------------------------------------------------------------------------
// Report formatting
// ---------------------------------------------------------------------------

function fmtPhase(label, fps, loaf) {
  return [
    `  ${label}`,
    `    frames sampled : ${fps.frames}`,
    `    mean FPS       : ${fps.mean}`,
    `    min FPS        : ${fps.min}`,
    `    dropped frames : ${fps.dropped}  (interval > ${fps.dropThreshold} ms, ~${fps.estimatedHz} Hz)`,
    `    worst interval : ${fps.worstInterval} ms`,
    `    LoAF           : ${fmtLoAF(loaf)}`,
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Phase 1 — idle scene
// ---------------------------------------------------------------------------

async function phaseIdle(page) {
  process.stdout.write('Phase 1 (idle scene) … ');
  await page.goto(BASE + '/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500); // let idle animations start before sampling
  await installLoAF(page);
  const fps  = await measureFps(page, SAMPLE_MS.idle);
  const loaf = await collectLoAF(page);
  console.log('done');
  return { label: '1. Idle scene', fps, loaf };
}

// ---------------------------------------------------------------------------
// Phase 2 — dialogue (text stream)
// ---------------------------------------------------------------------------

async function phaseDialogue(page) {
  process.stdout.write('Phase 2 (dialogue) … ');
  await page.goto(BASE + '/');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('#approach-prompt').click();
  // Non-system button starts a streaming dialogue line (e.g. "experience").
  await page.locator('#choices button:not(.system)').first().click();
  await page.locator('.speech-stream').waitFor({ state: 'visible' });
  await installLoAF(page);
  const fps  = await measureFps(page, SAMPLE_MS.dialogue);
  const loaf = await collectLoAF(page);
  console.log('done');
  return { label: '2. Dialogue (text stream)', fps, loaf };
}

// ---------------------------------------------------------------------------
// Phase 3 — scene → sheet morph
// Samples animations on the /sheet page immediately after DOMContentLoaded.
// Note: the compositor-driven view-transition crossfade fires before DCL and
// is not rAF-measurable from script; what we capture are the sheet entrance
// animations (portrait, nameplate, columns, XP bar) that run in parallel.
// ---------------------------------------------------------------------------

async function phaseSceneToSheet(page) {
  process.stdout.write('Phase 3 (scene → sheet morph) … ');
  await page.goto(BASE + '/');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('#approach-prompt').click();
  // System button triggers the cross-document view transition to /sheet.
  await page.locator('#choices button.system').click();
  await page.waitForURL(BASE + '/sheet');
  await page.waitForLoadState('domcontentloaded');
  await installLoAF(page);
  const fps  = await measureFps(page, SAMPLE_MS.morph);
  const loaf = await collectLoAF(page);
  console.log('done');
  return { label: '3. Scene → Sheet morph (arrival animations)', fps, loaf };
}

// ---------------------------------------------------------------------------
// Phase 4 — sheet → scene return morph
// Same rationale as phase 3 — samples arrival animations on /.
// ---------------------------------------------------------------------------

async function phaseSheetToScene(page) {
  process.stdout.write('Phase 4 (sheet → scene return morph) … ');
  await page.goto(BASE + '/');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('#approach-prompt').click();
  await page.locator('#choices button.system').click();
  await page.waitForURL(BASE + '/sheet');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('.back-link').waitFor({ state: 'visible' });
  await page.locator('.back-link').click();
  await page.waitForURL(BASE + '/');
  await page.waitForLoadState('domcontentloaded');
  await installLoAF(page);
  const fps  = await measureFps(page, SAMPLE_MS.morph);
  const loaf = await collectLoAF(page);
  console.log('done');
  return { label: '4. Sheet → Scene morph (return animations)', fps, loaf };
}

// ---------------------------------------------------------------------------
// Hidden-compute checklist
// ---------------------------------------------------------------------------

async function hiddenComputeChecklist(page) {
  process.stdout.write('Hidden-compute checklist … ');
  const items = [];

  await page.goto(BASE + '/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(400);

  // -- Make the page hidden by focusing a second tab --
  // Page.setWebLifecycleState only accepts 'frozen'/'active', not 'hidden' —
  // using it here threw and was silently swallowed, so the check never ran.
  // Opening a second tab and bringing it to front fires a real visibilitychange.
  const page2 = await page.context().newPage();
  await page2.bringToFront();
  const isHidden = await page.evaluate(() => document.hidden);

  if (isHidden) {
    // Does rAF fire while hidden? Browsers are permitted to throttle it.
    const rafCount = await page.evaluate(() => new Promise(resolve => {
      let n = 0;
      function tick() { n++; if (n < 5) requestAnimationFrame(tick); }
      requestAnimationFrame(tick);
      setTimeout(() => resolve(n), 600);
    }));
    items.push({
      check: 'rAF fires while document.hidden = true',
      result: rafCount >= 5
        ? `YES — ${rafCount} callbacks fired while hidden (animation compute continues; wasteful)`
        : `NO — only ${rafCount} callback(s) in 600 ms (browser throttled rAF while hidden)`,
    });

    // Are CSS animations still running while hidden?
    const counts = await page.evaluate(() => {
      const all = document.getAnimations();
      return { total: all.length, running: all.filter(a => a.playState === 'running').length };
    });
    items.push({
      check: 'CSS animations running while document.hidden = true',
      result: counts.running > 0
        ? `YES — ${counts.running} of ${counts.total} still running (wasteful)`
        : `NO — ${counts.total} animation(s), all paused or finished`,
    });
  } else {
    items.push({
      check: 'document.hidden via second-tab focus',
      result: 'COULD NOT SET — page did not report hidden after bringing a second tab to front. ' +
              'Browser or OS may have kept the first tab active. Hidden-tab checks skipped.',
    });
  }

  await page2.close();

  // -- Non-visible scene variants check --
  // The DOM holds multiple .scene copies; only the active one has a non-zero bounding box.
  // Check whether non-visible variants (zero-box) still run animations — genuine hidden compute.
  // The scrollTo-to-occlusion probe is not applicable to this layout: the scene sits under
  // overflow:hidden inside a transformed .camera, so nothing scrolls out of the viewport.
  const sceneCheck = await page.evaluate(() => {
    const scenes = [...document.querySelectorAll('.scene')];
    const invisible = scenes.filter(s => {
      const r = s.getBoundingClientRect();
      return r.width === 0 && r.height === 0;
    });
    if (scenes.length < 2) return { skipped: true, reason: 'fewer than 2 .scene elements found' };
    if (invisible.length === 0) return { skipped: true, reason: 'no zero-box .scene variants found' };
    const all     = invisible.flatMap(s => [...s.getAnimations({ subtree: true })]);
    const running = all.filter(a => a.playState === 'running').length;
    const total   = all.length;
    return { skipped: false, totalScenes: scenes.length, invisible: invisible.length, running, total };
  });

  if (sceneCheck.skipped) {
    items.push({
      check: 'Non-visible .scene variants — running animations',
      result: `NOT APPLICABLE — ${sceneCheck.reason}. Scroll-occlusion probe is structurally ` +
              `meaningless on this layout (fullscreen overflow:hidden; nothing scrolls offscreen).`,
    });
  } else {
    items.push({
      check: `Non-visible .scene variants (${sceneCheck.invisible} of ${sceneCheck.totalScenes} have zero bounding box)`,
      result: sceneCheck.running > 0
        ? `YES — ${sceneCheck.running} of ${sceneCheck.total} animation(s) running on non-visible scenes (wasteful hidden compute)`
        : `NO — ${sceneCheck.total} animation(s) on non-visible scenes, none running`,
    });
  }

  console.log('done');
  return items;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const browser = await chromium.launch({ channel: 'msedge', headless: false });
const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page    = await context.newPage();

console.log('GPU/FPS harness starting…\n');

let phases, hiddenItems;
try {
  phases = [
    await phaseIdle(page),
    await phaseDialogue(page),
    await phaseSceneToSheet(page),
    await phaseSheetToScene(page),
  ];
  hiddenItems = await hiddenComputeChecklist(page);
} finally {
  await browser.close();
}

// ---------------------------------------------------------------------------
// Print report
// ---------------------------------------------------------------------------

const hr  = '─'.repeat(64);
const ts  = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Johannesburg' });

console.log('\n' + hr);
console.log('  GPU / FPS PERFORMANCE REPORT');
console.log(`  ${ts}`);
console.log(hr);
console.log('\nFrame rate per phase');
console.log('  Dropped frame = interval > 1.5 × median rAF interval (threshold derived per-phase from measured refresh rate).');
console.log('  Run-to-run variation is expected — for human judgement, not a pass/fail gate.\n');

for (const p of phases) {
  console.log(fmtPhase(p.label, p.fps, p.loaf));
  console.log('');
}

console.log(hr);
console.log('\nHidden-compute checklist\n');
for (const item of hiddenItems) {
  console.log(`  CHECK  : ${item.check}`);
  console.log(`  RESULT : ${item.result}`);
  console.log('');
}

console.log(hr);
console.log('\nHarness notes');
console.log('  Morph phases (3 & 4) sample arrival animations after DOMContentLoaded.');
console.log('  The compositor-driven view-transition crossfade fires before DCL and is');
console.log('  not rAF-measurable from script; it runs at the OS compositor level.');
console.log('  Hidden check opens a second tab to fire a real visibilitychange on the first page.');
console.log(hr + '\n');
