// Authored relative depth from the visible bust landmarks; not measured anatomy.
// v runs from the top of the supplied portrait to its bottom.
export const PORTRAIT_CAMERA_Z = 4.5;
export const PORTRAIT_LAYERS = [
  { name: 'rear', damping: 4.8, yaw: 2.6, pitch: 1.3, shiftX: 0.015, shiftY: 0.008, idle: 0.3 },
  { name: 'head', damping: 7.5, yaw: 9, pitch: 4.5, shiftX: 0.035, shiftY: 0.018, idle: 1 },
  // These are local additions inherited from the head, not independent head turns.
  { name: 'face', damping: 9, yaw: 1.2, pitch: 0.5, shiftX: 0, shiftY: 0, idle: 0 },
  { name: 'spectral', damping: 10, yaw: 1.65, pitch: 0.65, shiftX: 0, shiftY: 0, idle: 0 },
  { name: 'front', damping: 11, yaw: 2, pitch: 0.8, shiftX: 0, shiftY: 0, idle: 0 },
] as const;

const gaussian = (u: number, v: number, x: number, y: number, sx: number, sy: number) =>
  Math.exp(-(((u - x) / sx) ** 2 + ((v - y) / sy) ** 2) * 2);

export function portraitDepth(u: number, v: number) {
  const cranium = 0.47 * gaussian(u, v, 0.51, 0.29, 0.36, 0.38);
  const face = 0.3 * gaussian(u, v, 0.55, 0.44, 0.24, 0.29);
  const front = 0.1 * gaussian(u, v, 0.56, 0.46, 0.075, 0.14);
  const chin = 0.17 * gaussian(u, v, 0.55, 0.63, 0.14, 0.12);
  const neck = 0.14 * gaussian(u, v, 0.48, 0.77, 0.18, 0.24);
  const ear = 0.13 * gaussian(u, v, 0.235, 0.43, 0.075, 0.16);
  const shoulders = 0.09 * gaussian(u, v, 0.48, 1.03, 0.72, 0.22);
  return cranium + face + front + chin + neck + ear + shoulders;
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function portraitZones(u: number, v: number) {
  const head = 1 - smooth(0.6, 0.88, v);
  const radius = Math.hypot((u - 0.55) / 0.25, (v - 0.45) / 0.3);
  const face = (1 - smooth(0.35, 1.0, radius)) * head;
  return [1 - head, head - face, face];
}

export function curvePointer(value: number) {
  const magnitude = Math.max(0, (Math.min(1, Math.abs(value)) - 0.03) / 0.97);
  return Math.sign(value) * magnitude * (0.8 + 0.2 * magnitude * magnitude);
}

export function dampPointer(current: number, target: number, deltaSeconds: number, rate = 5.6) {
  return current + (target - current) * (1 - Math.exp(-rate * Math.min(deltaSeconds, 0.05)));
}

export function normalizePointer(value: number, start: number, size: number) {
  return Math.max(-1, Math.min(1, ((value - start) / Math.max(1, size)) * 2 - 1));
}
