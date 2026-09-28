export interface FlowDot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  depth: number;
  size: number;
  phase: number;
  shade: number;
}

export interface FlowPointer {
  x: number;
  y: number;
  vx: number;
  vy: number;
  influence: number;
}

/** A fixed population spread across the viewport. Pointer input never adds dots. */
export function createDotFlow(width: number, height: number): FlowDot[] {
  const count = Math.max(100, Math.min(340, Math.round((width * height) / 3400)));
  let seed = 91;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return Array.from({ length: count }, (_, index) => ({
    x: random() * width,
    y: random() * height,
    vx: 0,
    vy: 0,
    depth: 0.4 + random() * 0.6,
    size: 0.7 + random() * 0.65,
    phase: random() * Math.PI * 2,
    // Keep the seeded positions stable; reserve just three intentional warm flecks.
    shade: (() => {
      const shade = random();
      return index === 23 || index === 83 ? 2 : index === 61 ? 3 : shade < 0.6 ? 0 : 1;
    })(),
  }));
}

/** Advect existing dots through a slow current; the cursor parts and swirls them. */
export function stepDotFlow(
  dots: FlowDot[],
  seconds: number,
  time: number,
  width: number,
  height: number,
  pointer: FlowPointer,
) {
  const elapsed = Math.min(0.05, Math.max(0, seconds));
  const steps = Math.max(1, Math.ceil(elapsed * 120));
  const dt = elapsed / steps;
  for (let step = 0; step < steps; step++) {
    for (const dot of dots) {
      const flowX = Math.sin(dot.y * 0.005 + time * 0.16 + dot.phase) * 8;
      const flowY = -5 * dot.depth + Math.cos(dot.x * 0.004 + time * 0.12 + dot.phase) * 5;
      const drag = 1 - Math.exp(-2.8 * dt);
      dot.vx += (flowX - dot.vx) * drag;
      dot.vy += (flowY - dot.vy) * drag;
      const dx = dot.x - pointer.x;
      const dy = dot.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      const radius = 210;
      if (pointer.influence > 0 && distance < radius) {
        const angle = distance > 0.01 ? Math.atan2(dy, dx) : dot.phase;
        const nx = Math.cos(angle);
        const ny = Math.sin(angle);
        const weight = (1 - distance / radius) ** 2 * pointer.influence * dot.depth;
        // Radial displacement opens space around the pointer. A lighter
        // tangent and directional wake bend the existing field into loose curls.
        dot.vx += (nx * 1100 - ny * 330 + pointer.vx * 0.85) * weight * dt;
        dot.vy += (ny * 1100 + nx * 330 + pointer.vy * 0.85) * weight * dt;
      }
      const speed = Math.hypot(dot.vx, dot.vy);
      if (speed > 240) {
        dot.vx *= 240 / speed;
        dot.vy *= 240 / speed;
      }
      dot.x += dot.vx * dt;
      dot.y += dot.vy * dt;
      // Recycle at the viewport edges, never at the cursor.
      const margin = 16;
      if (dot.x < -margin) dot.x = width + margin;
      if (dot.x > width + margin) dot.x = -margin;
      if (dot.y < -margin) dot.y = height + margin;
      if (dot.y > height + margin) dot.y = -margin;
    }
  }
}
