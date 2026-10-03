export interface ViewportViewDeg {
  yaw: number;
  pitch: number;
  fov: number;
}

let current: ViewportViewDeg = { yaw: 0, pitch: 0, fov: 75 };

export function setViewportView(v: ViewportViewDeg) {
  current = v;
}

export function getViewportView(): ViewportViewDeg {
  return current;
}
