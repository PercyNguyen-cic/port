// A plain mutable object shared by Lenis, the pointer listener and the WebGL scene.
// It is read every frame, so it deliberately lives outside React state (no re-renders).
export const motion = {
  scroll: 0, // px, Lenis' animated scroll position
  velocity: 0, // px per frame from Lenis, signed
  progress: 0, // 0..1 through the page
  mouse: { x: 0.5, y: 0.5 }, // 0..1, y up (GL convention)
  reduced: false,
};
