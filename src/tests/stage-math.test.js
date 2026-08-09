// Solitary unit tests for three pure functions extracted from stage.js.
// No DOM, no browser — all inputs are plain numbers.
import { describe, it, expect } from 'vitest';
import { clampPromptBeside, computeApproachScale, computeNextPlaneDelay } from '../scripts/stage.js';

// ---------------------------------------------------------------------------
// clampPromptBeside
// ---------------------------------------------------------------------------
// All coordinates are frame-relative (fig.top - sf.top, fig.right - sf.left).
// Constants: MARGIN = 8 (hard-coded fence), GAP = 14 (caller-supplied as gap).
describe('clampPromptBeside', () => {
  const base = { sfWidth: 500, sfHeight: 400, btnWidth: 80, btnHeight: 30, gap: 14 };

  it('returns unclamped values when figure is comfortably positioned', () => {
    // figTop=50: top = max(8,50)=50; clamped to min(50,362)=50
    // wantsLeft=114: min(max(8,114),max(8,412))=min(114,412)=114
    const r = clampPromptBeside({ ...base, figTop: 50, figRight: 100 });
    expect(r.left).toBeCloseTo(114);
    expect(r.top).toBeCloseTo(50);
  });

  it('clamps left to 8px floor when figure is near the left edge', () => {
    // figRight=-10 → wantsLeft=4 → max(8,4)=8
    const r = clampPromptBeside({ ...base, figTop: 50, figRight: -10 });
    expect(r.left).toBe(8);
    expect(r.top).toBeCloseTo(50);
  });

  it('clamps left to right-side ceiling when figure is near the right edge', () => {
    // figRight=450 → wantsLeft=464; ceiling=max(8,500-80-8)=412 → min(464,412)=412
    const r = clampPromptBeside({ ...base, figTop: 50, figRight: 450 });
    expect(r.left).toBe(412);
    expect(r.top).toBeCloseTo(50);
  });

  it('clamps top to 8px floor when figTop is very small', () => {
    // figTop=3 → top=max(8,3)=8
    const r = clampPromptBeside({ ...base, figTop: 3, figRight: 100 });
    expect(r.left).toBeCloseTo(114);
    expect(r.top).toBe(8);
  });

  it('clamps top to bottom edge when figure is near the bottom', () => {
    // figTop=380 → top=max(8,380)=380; ceiling=max(8,400-30-8)=362 → min(380,362)=362
    const r = clampPromptBeside({ ...base, figTop: 380, figRight: 100 });
    expect(r.left).toBeCloseTo(114);
    expect(r.top).toBe(362);
  });
});

// ---------------------------------------------------------------------------
// computeApproachScale
// ---------------------------------------------------------------------------
// SAFETY_PX = 6 (internal constant), range [1.3, 2.2].
describe('computeApproachScale', () => {
  it('returns a value in range for a normal cardTop/faceRect', () => {
    // (100-6)/60 = 94/60 ≈ 1.567 — within [1.3, 2.2]
    const s = computeApproachScale(100, { height: 60 });
    expect(s).toBeCloseTo(94 / 60, 5);
  });

  it('floors at 1.3 when headroom is small', () => {
    // (40-6)/50 = 0.68 → clamped to 1.3
    const s = computeApproachScale(40, { height: 50 });
    expect(s).toBe(1.3);
  });

  it('caps at 2.2 when headroom is large', () => {
    // (200-6)/50 = 3.88 → clamped to 2.2
    const s = computeApproachScale(200, { height: 50 });
    expect(s).toBe(2.2);
  });

  it('returns 2.2 when faceRect is null', () => {
    expect(computeApproachScale(100, null)).toBe(2.2);
  });

  it('returns 2.2 when faceRect.height is zero', () => {
    expect(computeApproachScale(100, { height: 0 })).toBe(2.2);
  });
});

// ---------------------------------------------------------------------------
// computeNextPlaneDelay
// ---------------------------------------------------------------------------
// PLANE_INTERVAL_MS = 120_000, PLANE_JITTER_MS = 30_000
// Formula: interval + (rand() * 2 - 1) * jitter
describe('computeNextPlaneDelay', () => {
  it('returns minimum delay when rand() = 0', () => {
    // 120000 + (0*2-1)*30000 = 120000 - 30000 = 90000
    expect(computeNextPlaneDelay(() => 0)).toBe(90_000);
  });

  it('returns maximum delay when rand() = 1', () => {
    // 120000 + (1*2-1)*30000 = 120000 + 30000 = 150000
    expect(computeNextPlaneDelay(() => 1)).toBe(150_000);
  });

  it('returns base interval when rand() = 0.5 (no jitter)', () => {
    // 120000 + (0.5*2-1)*30000 = 120000 + 0 = 120000
    expect(computeNextPlaneDelay(() => 0.5)).toBe(120_000);
  });

  it('uses Math.random by default (result within bounds)', () => {
    const d = computeNextPlaneDelay();
    expect(d).toBeGreaterThanOrEqual(90_000);
    expect(d).toBeLessThanOrEqual(150_000);
  });
});
