// pages.perf.js — report-only CI performance suite for / and /sheet.
// Captures Core Web Vitals (LCP, CLS) and CDP metrics (JS heap, layout, recalc, task duration).
// Compares against baselines in perf-baselines.json; warns on regression but never fails the build.
import { test } from '@playwright/test';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const BASELINES = JSON.parse(readFileSync(join(__dir, 'perf-baselines.json'), 'utf8'));

// ponytail: generous tolerances — CLS is absolute (near-zero values make percentage meaningless).
const TOLERANCES = {
  lcp:              0.25,  // 25% of baseline
  cls:              0.10,  // absolute CLS units
  jsHeap:           0.25,
  layoutCount:      0.50,
  recalcStyleCount: 0.50,
  taskDuration:     0.30,
};

// Run measurements for one page. Does not throw — a large delta emits a WARNING only.
async function measurePage(page, context, url, testInfo) {
  // Inject observers BEFORE navigation so LCP and CLS entries from first paint are caught.
  await page.addInitScript(() => {
    window.__perf = { lcp: 0, cls: 0 };
    new PerformanceObserver(list => {
      for (const e of list.getEntries()) window.__perf.lcp = e.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(list => {
      // Exclude shifts caused by user input — they do not count toward CLS.
      for (const e of list.getEntries()) {
        if (!e.hadRecentInput) window.__perf.cls += e.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });

  // CDP is Chromium/Edge-only — fine, this project is branded Edge.
  const cdp = await context.newCDPSession(page);
  await cdp.send('Performance.enable');

  await page.goto(url);
  await page.waitForLoadState('networkidle');

  const vitals = await page.evaluate(() => ({ ...window.__perf }));
  const { metrics } = await cdp.send('Performance.getMetrics');
  const m = Object.fromEntries(metrics.map(({ name, value }) => [name, value]));

  const captured = {
    lcp:              vitals.lcp,
    cls:              vitals.cls,
    jsHeap:           m.JSHeapUsedSize   ?? 0,
    layoutCount:      m.LayoutCount      ?? 0,
    recalcStyleCount: m.RecalcStyleCount ?? 0,
    taskDuration:     m.TaskDuration     ?? 0,
  };

  const baseline = BASELINES[url] ?? {};
  const label    = url === '/' ? 'home' : url.slice(1);
  const lines    = [`\nPerf report: ${url}`];
  const warnings = [];

  for (const [key, actual] of Object.entries(captured)) {
    const base = baseline[key];
    if (base == null) {
      lines.push(`  ${key}: ${fmt(key, actual)}  (no baseline — record with npm run test:perf:record)`);
      continue;
    }
    const delta     = actual - base;
    const tol       = TOLERANCES[key];
    // Use absolute tolerance for CLS; percentage for all others.
    // Guard against zero baseline to avoid tol*0 = zero-width band.
    const exceeded  = key === 'cls'
      ? Math.abs(delta) > tol
      : Math.abs(delta) > tol * Math.max(base, 1);
    const sign      = delta >= 0 ? '+' : '';
    const flag      = exceeded ? '  *** REGRESSION WARNING ***' : '';
    lines.push(`  ${key}: ${fmt(key, actual)}  (baseline ${fmt(key, base)}, delta ${sign}${fmt(key, delta)}${flag})`);
    if (exceeded) warnings.push(`${key} delta ${sign}${fmt(key, delta)} vs baseline ${fmt(key, base)} on ${url}`);
  }

  const report = lines.join('\n');
  console.log(report);
  await testInfo.attach(`perf-${label}-report`, { body: report, contentType: 'text/plain' });

  for (const w of warnings) {
    console.warn(`[PERF WARNING] ${w}`);
    testInfo.annotations.push({ type: 'perf-regression', description: w });
  }
}

function fmt(key, v) {
  if (key === 'lcp')          return `${v.toFixed(0)}ms`;
  if (key === 'cls')          return v.toFixed(4);
  if (key === 'jsHeap')       return `${(v / 1_048_576).toFixed(1)}MB`;
  if (key === 'taskDuration') return `${v.toFixed(3)}s`;
  return String(Math.round(v));
}

test('perf: home page (/)', async ({ page, context }, testInfo) => {
  await measurePage(page, context, '/', testInfo);
});

test('perf: sheet page (/sheet)', async ({ page, context }, testInfo) => {
  await measurePage(page, context, '/sheet', testInfo);
});
