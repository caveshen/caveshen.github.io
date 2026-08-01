/**
 * Camera-transform maths — pure function, no DOM.
 * Frames the figure's head and shoulders in the stage.
 *
 * Reference (from the approved mock):
 *   figCx = (figure.left + figure.width / 2) − stage.left
 *   faceY = (figure.top − stage.top) + figure.height * 0.18
 *   tx    = stage.width  / 2 − scale * figCx
 *   ty    = faceTargetY − scale * faceY
 *
 * @param {{ left:number, top:number, width:number, height:number }} stage  – stage-frame bounding rect
 * @param {{ left:number, top:number, width:number, height:number }} figure – visible figure bounding rect
 * @param {number} scale
 * @param {number} [faceTargetY] – absolute px, stage-relative, to frame the face at.
 *   Optional (PRD §15 D2): callers measure the dialogue card and pass the mid-point
 *   of the band above it, so the zoom can never drift behind the card again. Falls
 *   back to the original stage.height * 0.32 constant when omitted.
 * @param {number} [faceY] – stage-relative Y of the point to frame (pre-scale).
 *   Optional (reviewer follow-up 1a): callers measure the .face-void centre and
 *   pass it directly, so no correction term is needed to cancel the heuristic
 *   back out. Falls back to the original (figure.top - stage.top) + figure.height
 *   * 0.18 heuristic when omitted.
 * @returns {{ tx:number, ty:number }}
 */
export function computeCameraTransform({
  stage, figure, scale,
  faceTargetY = stage.height * 0.32,
  faceY = (figure.top - stage.top) + figure.height * 0.18,
}) {
  const figCx = (figure.left + figure.width  / 2) - stage.left;
  return {
    tx: stage.width  / 2 - scale * figCx,
    ty: faceTargetY - scale * faceY,
  };
}
