/** One curve definition drives both the opaque panels and their luminous seam. */
export function launchGeometry(width: number, height: number, progress: number) {
  const p = Math.max(0, Math.min(1, progress));
  const planeWidth = Math.min(124, Math.max(72, width * 0.085));
  const scale = 1.05 - p * 0.17;
  const x = width * (0.5 + Math.sin(p * Math.PI) * 0.003);
  const y = height * (1.1 - 1.38 * p);
  const tail = y + planeWidth * (154 / 120) * scale;
  const bottom = height * 1.22;
  const span = Math.max(1, bottom - tail);
  const spread = width * (0.04 + 0.92 * p);
  const curve = (direction: number, amount = 1) =>
    `M${x},${tail} C${x + direction * spread * 0.018 * amount},${tail + span * 0.34} ${x + direction * spread * 0.26 * amount},${tail + span * 0.78} ${x + direction * spread * amount},${bottom}`;
  const leftEdge = curve(-1);
  const rightEdge = curve(1, 1.035);
  return {
    x,
    y,
    tail,
    planeWidth,
    scale,
    leftEdge,
    rightEdge,
    leftPanel: `M-2,-400 L${x + 1},-400 L${x + 1},${tail} L${x},${tail} ${leftEdge.slice(leftEdge.indexOf('C'))} L-2,${bottom}Z`,
    rightPanel: `M${width + 2},-400 L${x - 1},-400 L${x - 1},${tail} L${x},${tail} ${rightEdge.slice(rightEdge.indexOf('C'))} L${width + 2},${bottom}Z`,
    strands: [curve(-1, 0.065), curve(1, 0.12), curve(-1, 0.24)],
  };
}
