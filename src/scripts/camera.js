/**
 * Camera-transform maths — pure function, no DOM.
 * Frames the figure's head and shoulders in the stage.
 *
 * Reference (from the approved mock):
 *   figCx = (figure.left + figure.width / 2) − stage.left
 *   faceY = (figure.top − stage.top) + figure.height * 0.18
 *   tx    = stage.width  / 2 − scale * figCx
 *   ty    = stage.height * 0.32 − scale * faceY
 *
 * @param {{ left:number, top:number, width:number, height:number }} stage  – stage-frame bounding rect
 * @param {{ left:number, top:number, width:number, height:number }} figure – visible figure bounding rect
 * @param {number} scale
 * @returns {{ tx:number, ty:number }}
 */
export function computeCameraTransform({ stage, figure, scale }) {
  const figCx = (figure.left + figure.width  / 2) - stage.left;
  const faceY = (figure.top  - stage.top)         + figure.height * 0.18;
  return {
    tx: stage.width  / 2 - scale * figCx,
    ty: stage.height * 0.32 - scale * faceY,
  };
}
