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
// Dropped-frame threshold: 25 ms = 1.5 × 16.67 ms budget at 60 Hz.
// ponytail: threshold assumes 60 Hz; see inferred refresh rate in the report.
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
        const dropped = iv.filter(d => d > 25).length;
        const worst   = iv.length ? Math.max(...iv) : 0;
        const sorted  = [...iv].sort((a, b) => a - b);
        const median  = sorted[Math.floor(sorted.length / 2)] ?? 0;
        resolve({
          mean: +mean.toFixed(1), min: +min.toFixed(1),
          dropped, frames: ts.length,
          worstInterval: +worst.toFixed(1),
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
    `    dropped frames : ${fps.dropped}  (interval > 25 ms)`,
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

  // -- Attempt to flip document.hidden via CDP --
  // Page.setWebLifecycleState is the Chrome DevTools Protocol command that
  // fires the visibilitychange event and sets document.visibilityState to 'hidden'.
  // In a headed, on-screen tab it may have no effect — we check and report honestly.
  const cdp = await page.context().newCDPSession(page);
  let cdpWorked = false;
  try {
    await cdp.send('Page.setWebLifecycleState', { state: 'hidden' });
    cdpWorked = await page.evaluate(() => document.hidden);
  } catch (_) {}

  if (cdpWorked) {
    // Does rAF fire while hidden? Browsers are permitted to throttle it to 0.
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

    try { await cdp.send('Page.setWebLifecycleState', { state: 'active' }); } catch (_) {}
  } else {
    items.push({
      check: 'document.hidden via CDP (Page.setWebLifecycleState → hidden)',
      result: 'COULD NOT SET — headed Edge tab did not respond to this CDP command. ' +
              'This is expected when the window is visible and focused on screen. ' +
              'Hidden-tab rAF and animation checks skipped.',
    });
  }

  // -- Offscreen / occluded check (always runs, no CDP needed) --
  // Scroll the viewport far below the .badger-up element's natural position,
  // then check whether its CSS animations keep running.
  // CSS animations are not visibility-aware by specification, so they typically
  // continue; this confirms whether the browser pauses them as an optimisation.
  //
  // Note: repositioning via position:fixed can fail when an animated ancestor
  // has a CSS transform (which promotes position:fixed to position:absolute
  // relative to that ancestor). Scroll approach is more reliable.
  const runBefore = await page.evaluate(() => {
    const el = document.querySelector('.badger-up');
    return el ? el.getAnimations().filter(a => a.playState === 'running').length : -1;
  });

  if (runBefore === -1) {
    items.push({ check: '.badger-up offscreen check', result: 'SKIPPED — element not found on /' });
  } else {
    // Scroll the page far down so .badger-up (near the top) leaves the viewport.
    await page.evaluate(() => window.scrollTo({ top: 9999, behavior: 'instant' }));
    await page.waitForTimeout(80);
    const offscreen = await page.evaluate(() => {
      const el = document.querySelector('.badger-up');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const isOff = rect.bottom < 0 || rect.top > window.innerHeight;
      const running = el.getAnimations().filter(a => a.playState === 'running').length;
      window.scrollTo({ top: 0, behavior: 'instant' }); // restore
      return { isOff, running };
    });
    if (offscreen) {
      items.push({
        check: '.badger-up animations while element is scrolled offscreen (scrollTo 9999px)',
        result: !offscreen.isOff
          ? `INCONCLUSIVE — page did not scroll far enough to push element offscreen ` +
            `(body likely has overflow:hidden). Animation count: ${runBefore} before, ${offscreen.running} after scroll attempt.`
          : (offscreen.running > 0
              ? `YES — ${offscreen.running} animation(s) still running while offscreen ` +
                `(CSS animations are not visibility-aware; browser did not pause them)`
              : `NO — animations paused while offscreen (browser optimisation active)`),
        note: `${runBefore} running before scroll, ${offscreen.running} running during scroll`,
      });
    }
  }

  await cdp.detach();
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

const phases = [
  await phaseIdle(page),
  await phaseDialogue(page),
  await phaseSceneToSheet(page),
  await phaseSheetToScene(page),
];
const hiddenItems = await hiddenComputeChecklist(page);

await browser.close();

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
console.log('  Dropped frame = interval > 25 ms (1.5 × 16.67 ms budget, assumes 60 Hz).');
console.log('  Run-to-run variation is expected — for human judgement, not a pass/fail gate.\n');

let inferredHz = 0;
for (const p of phases) {
  if (!inferredHz && p.fps.estimatedHz > 0) inferredHz = p.fps.estimatedHz;
  console.log(fmtPhase(p.label, p.fps, p.loaf));
  console.log('');
}

if (inferredHz > 0) {
  console.log(`  Inferred display refresh rate : ~${inferredHz} Hz (from median rAF interval)`);
  if (inferredHz > 60) {
    const budget  = (1000 / inferredHz).toFixed(1);
    const thresh  = (1000 / inferredHz * 1.5).toFixed(1);
    console.log(`  NOTE: display > 60 Hz — 25 ms dropped threshold will flag valid frames.`);
    console.log(`        At ${inferredHz} Hz, budget ≈ ${budget} ms; real dropped threshold ≈ ${thresh} ms.`);
  }
  console.log('');
}

console.log(hr);
console.log('\nHidden-compute checklist\n');
for (const item of hiddenItems) {
  console.log(`  CHECK  : ${item.check}`);
  console.log(`  RESULT : ${item.result}`);
  if (item.note) console.log(`  NOTE   : ${item.note}`);
  console.log('');
}

console.log(hr);
console.log('\nHarness notes');
console.log('  Morph phases (3 & 4) sample arrival animations after DOMContentLoaded.');
console.log('  The compositor-driven view-transition crossfade fires before DCL and is');
console.log('  not rAF-measurable from script; it runs at the OS compositor level.');
console.log('  If CDP visibility override failed, the offscreen check still ran.');
console.log(hr + '\n');
