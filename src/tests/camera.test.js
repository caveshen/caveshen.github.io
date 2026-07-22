// P4 camera-maths unit tests — written BEFORE camera.js exists (TDD)
// These test the pure computeCameraTransform function with no DOM.
import { describe, it, expect } from 'vitest';
import { computeCameraTransform } from '../scripts/camera.js';

describe('computeCameraTransform', () => {
  // Reference formula (from the approved mock):
  //   figCx = (figure.left + figure.width / 2) - stage.left
  //   faceY = (figure.top - stage.top) + figure.height * 0.18
  //   tx    = stage.width  / 2 - scale * figCx
  //   ty    = stage.height * 0.32 - scale * faceY

  it('centres the figure horizontally in the stage at scale 2.2', () => {
    const stage  = { left: 0, top: 0, width: 1200, height: 400 };
    const figure = { left: 960, top: 180, width: 80,  height: 220 };
    const scale  = 2.2;
    const { tx } = computeCameraTransform({ stage, figure, scale });
    // figCx = (960 + 40) - 0 = 1000
    // tx = 600 - 2.2 * 1000 = -1600
    expect(tx).toBeCloseTo(-1600, 1);
  });

  it('positions the face at ~32% down the stage vertically at scale 2.2', () => {
    const stage  = { left: 0, top: 0, width: 1200, height: 400 };
    const figure = { left: 960, top: 180, width: 80,  height: 220 };
    const scale  = 2.2;
    const { ty } = computeCameraTransform({ stage, figure, scale });
    // faceY = (180 - 0) + 220 * 0.18 = 219.6
    // ty = 400 * 0.32 - 2.2 * 219.6 = 128 - 483.12 = -355.12
    expect(ty).toBeCloseTo(-355.12, 1);
  });

  it('produces tx≈0 when the figure is horizontally centred and scale=1', () => {
    const stage  = { left: 0, top: 0, width: 200, height: 100 };
    const figure = { left: 80, top: 10, width: 40, height: 80 };
    const scale  = 1;
    const { tx } = computeCameraTransform({ stage, figure, scale });
    // figCx = (80 + 20) - 0 = 100; tx = 100 - 1 * 100 = 0
    expect(tx).toBeCloseTo(0, 5);
  });

  it('scales tx and ty linearly with the scale parameter', () => {
    const stage  = { left: 0, top: 0, width: 1000, height: 500 };
    const figure = { left: 400, top: 100, width: 100, height: 300 };
    const r1 = computeCameraTransform({ stage, figure, scale: 1 });
    const r2 = computeCameraTransform({ stage, figure, scale: 2 });
    // Doubling scale: tx decreases by figCx more, ty decreases by faceY more
    const figCx = 450; // (400 + 50) - 0
    const faceY = 100 + 300 * 0.18; // 154
    expect(r2.tx - r1.tx).toBeCloseTo(-figCx, 5);
    expect(r2.ty - r1.ty).toBeCloseTo(-faceY, 5);
  });

  it('handles a stage with non-zero left/top (stage not at viewport origin)', () => {
    const stage  = { left: 100, top: 50, width: 1200, height: 400 };
    const figure = { left: 1060, top: 230, width:  80, height: 220 };
    const scale  = 2.2;
    const { tx, ty } = computeCameraTransform({ stage, figure, scale });
    // figCx = (1060 + 40) - 100 = 1000
    // faceY = (230 - 50) + 220 * 0.18 = 219.6
    expect(tx).toBeCloseTo(1200 / 2 - 2.2 * 1000, 1);
    expect(ty).toBeCloseTo(400 * 0.32 - 2.2 * 219.6, 1);
  });

  // ── D2: optional faceTargetY (PRD §15 D2) ─────────────────────────────────
  // Derives the framing target from the measured dialogue card instead of the
  // hard-coded 0.32 constant, so the two can never drift apart again.

  it('uses the explicit faceTargetY when provided, instead of stage.height * 0.32', () => {
    const stage  = { left: 0, top: 0, width: 1200, height: 400 };
    const figure = { left: 960, top: 180, width: 80, height: 220 };
    const scale  = 2.2;
    const faceTargetY = 100;
    const { ty } = computeCameraTransform({ stage, figure, scale, faceTargetY });
    // faceY = (180 - 0) + 220 * 0.18 = 219.6
    // ty = 100 - 2.2 * 219.6 = -383.12
    expect(ty).toBeCloseTo(-383.12, 1);
  });

  it('falls back to stage.height * 0.32 when faceTargetY is omitted (back-compat)', () => {
    const stage  = { left: 0, top: 0, width: 1200, height: 400 };
    const figure = { left: 960, top: 180, width: 80, height: 220 };
    const scale  = 2.2;
    const withTarget    = computeCameraTransform({ stage, figure, scale, faceTargetY: stage.height * 0.32 });
    const withoutTarget = computeCameraTransform({ stage, figure, scale });
    expect(withoutTarget.ty).toBeCloseTo(withTarget.ty, 5);
  });

  // ── D1/D2 follow-up: optional explicit faceY (PRD reviewer follow-up 1a) ──
  // Lets the caller pass the measured .face-void centre directly instead of
  // relying on the figure.height * 0.18 heuristic, so no correction term is
  // needed to cancel the heuristic back out.

  it('uses the explicit faceY when provided, instead of the 0.18 heuristic', () => {
    const stage  = { left: 0, top: 0, width: 1200, height: 400 };
    const figure = { left: 960, top: 180, width: 80, height: 220 };
    const scale  = 2.2;
    const faceTargetY = 100;
    const faceY = 250; // measured face-void centre, stage-relative — not figure.height * 0.18
    const { ty } = computeCameraTransform({ stage, figure, scale, faceTargetY, faceY });
    // ty = 100 - 2.2 * 250 = -450
    expect(ty).toBeCloseTo(-450, 1);
  });

  it('falls back to the 0.18 heuristic when faceY is omitted (back-compat)', () => {
    const stage  = { left: 0, top: 0, width: 1200, height: 400 };
    const figure = { left: 960, top: 180, width: 80, height: 220 };
    const scale  = 2.2;
    const withFaceY    = computeCameraTransform({ stage, figure, scale, faceY: (figure.top - stage.top) + figure.height * 0.18 });
    const withoutFaceY = computeCameraTransform({ stage, figure, scale });
    expect(withoutFaceY.ty).toBeCloseTo(withFaceY.ty, 5);
  });
});
