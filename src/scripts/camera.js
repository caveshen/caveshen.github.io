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
 * @returns {{ tx:number, ty:number }}
 */
export function computeCameraTransform({ stage, figure, scale, faceTargetY = stage.height * 0.32 }) {
  const figCx = (figure.left + figure.width  / 2) - stage.left;
  const faceY = (figure.top  - stage.top)         + figure.height * 0.18;
  return {
    tx: stage.width  / 2 - scale * figCx,
    ty: faceTargetY - scale * faceY,
  };
}
