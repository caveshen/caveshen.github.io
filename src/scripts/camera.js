// Camera-transform maths — pure function, no DOM.
// faceTargetY/faceY are optional so callers can pass measured values (dialogue
// card position, .face-void centre) instead of the heuristic defaults below.
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
