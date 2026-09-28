import { writeFileSync } from 'node:fs';

// Original vector architecture: three hollow structural frames and connected bridges.
// Orthographic projection keeps the artwork static, crisp and inexpensive to render.
const project = ([x, y, z]) => [510 + (x - y) * 0.81, 435 + (x + y) * 0.38 - z];
const points = (vertices) =>
  vertices
    .map((p) =>
      project(p)
        .map((n) => n.toFixed(2))
        .join(','),
    )
    .join(' ');
const polygon = (vertices, fill, stroke = '#343941', width = 0.8) =>
  `<polygon points="${points(vertices)}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round"/>`;
function beam(x, y, z, w, d, h, glass = false) {
  const top = [
    [x, y, z + h],
    [x + w, y, z + h],
    [x + w, y + d, z + h],
    [x, y + d, z + h],
  ];
  return (
    polygon(
      [
        [x, y + d, z],
        [x + w, y + d, z],
        [x + w, y + d, z + h],
        [x, y + d, z + h],
      ],
      glass ? 'url(#glassSide)' : 'url(#front)',
    ) +
    polygon(
      [
        [x + w, y, z],
        [x + w, y + d, z],
        [x + w, y + d, z + h],
        [x + w, y, z + h],
      ],
      glass ? 'url(#glassSide)' : 'url(#side)',
    ) +
    polygon(
      top,
      glass ? 'url(#glassTop)' : 'url(#top)',
      glass ? '#839dc6' : '#424a55',
      glass ? 1.3 : 0.75,
    )
  );
}
function ring(x, y, z, w, d, t, h) {
  let s = '';
  s += beam(x, y, z, w, t, h);
  s += beam(x, y + t, z, t, d - t, h);
  // Recessed cobalt channel. The surfaces are part of the structure, not a grid.
  s += polygon(
    [
      [x + t, y + t, z + 8],
      [x + w - t, y + t, z + 8],
      [x + w - t, y + d - t, z + 8],
      [x + t, y + d - t, z + 8],
    ],
    'url(#well)',
    '#184eff',
    1,
  );
  s += polygon(
    [
      [x + t, y + t, z + h],
      [x + w - t, y + t, z + h],
      [x + w - t, y + t, z + 8],
      [x + t, y + t, z + 8],
    ],
    'url(#inner)',
    '#284a9b',
  );
  s += polygon(
    [
      [x + t, y + t, z + 8],
      [x + t, y + d - t, z + 8],
      [x + t, y + d - t, z + h],
      [x + t, y + t, z + h],
    ],
    'url(#inner)',
    '#244582',
  );
  s += beam(x + w - t, y + t, z, t, d - t, h);
  s += beam(x + t, y + d - t, z, w - 2 * t, t, h);
  const inside = [
    [x + t + 5, y + t + 5, z + 12],
    [x + w - t - 5, y + t + 5, z + 12],
    [x + w - t - 5, y + d - t - 5, z + 12],
  ];
  s += `<polyline points="${points(inside)}" fill="none" stroke="#456aff" stroke-width="3" filter="url(#glow)"/>`;
  s += `<polyline points="${points(inside)}" fill="none" stroke="#7d9dff" stroke-width="1.4"/>`;
  return s;
}
let art = '';
// Back elevated frame, then connecting corridor, left frame, and lower main frame.
art += ring(-10, -310, 45, 245, 245, 45, 130);
art += beam(64, -66, 52, 86, 225, 45);
art += polygon(
  [
    [79, -64, 99],
    [100, -64, 99],
    [100, 140, 99],
    [79, 140, 99],
  ],
  'url(#channel)',
  '#496eff',
);
art += ring(-335, -40, 0, 230, 245, 44, 103);
art += beam(-105, 48, 5, 250, 74, 59);
art += polygon(
  [
    [-105, 64, 65],
    [145, 64, 65],
    [145, 78, 65],
    [-105, 78, 65],
  ],
  'url(#channel)',
  '#4563dc',
);
art += ring(-45, 126, -28, 320, 280, 50, 135);
art += beam(6, 286, 110, 133, 40, 28, true);
// A single optical bridge across the upper frame.
art += beam(34, -221, 178, 153, 45, 22, true);
// Fine architectural edges and small machined marks.
for (let i = 0; i < 7; i++)
  art += polygon(
    [
      [232, 170 + i * 12, 108],
      [244, 170 + i * 12, 108],
      [244, 173 + i * 12, 108],
      [232, 173 + i * 12, 108],
    ],
    '#4d535e',
    'none',
  );
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 900"><defs>
<linearGradient id="top" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#606772"/><stop offset=".16" stop-color="#30353d"/><stop offset=".64" stop-color="#171b21"/><stop offset="1" stop-color="#282f3a"/></linearGradient>
<linearGradient id="front" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#12151b"/><stop offset=".75" stop-color="#07080c"/><stop offset="1" stop-color="#151d35"/></linearGradient>
<linearGradient id="side"><stop stop-color="#191e29"/><stop offset=".7" stop-color="#090c14"/><stop offset="1" stop-color="#101b3d"/></linearGradient>
<linearGradient id="inner" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#0d1738"/><stop offset=".7" stop-color="#1338c7"/><stop offset="1" stop-color="#3264ff"/></linearGradient>
<radialGradient id="well"><stop stop-color="#081438"/><stop offset=".6" stop-color="#0c2581"/><stop offset="1" stop-color="#214dff"/></radialGradient>
<linearGradient id="channel"><stop stop-color="#112883"/><stop offset=".4" stop-color="#3769ff"/><stop offset=".7" stop-color="#759eff"/><stop offset="1" stop-color="#153ed4"/></linearGradient>
<linearGradient id="glassTop" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#718dcc" stop-opacity=".2"/><stop offset=".32" stop-color="#789bd4" stop-opacity=".45"/><stop offset=".5" stop-color="#8fd5ee" stop-opacity=".65"/><stop offset=".55" stop-color="#d7b2db" stop-opacity=".7"/><stop offset=".61" stop-color="#626bad" stop-opacity=".3"/><stop offset="1" stop-color="#a7cfff" stop-opacity=".45"/></linearGradient>
<linearGradient id="glassSide"><stop stop-color="#143383" stop-opacity=".6"/><stop offset=".5" stop-color="#68859b" stop-opacity=".4"/><stop offset="1" stop-color="#749fff" stop-opacity=".6"/></linearGradient>
<radialGradient id="halo"><stop stop-color="#133cff" stop-opacity=".16"/><stop offset="1" stop-color="#030303" stop-opacity="0"/></radialGradient>
<filter id="glow"><feGaussianBlur stdDeviation="5"/></filter>
<filter id="shadow" x="-35%" y="-30%" width="175%" height="180%"><feDropShadow dx="10" dy="32" stdDeviation="22" flood-color="#000" flood-opacity=".8"/></filter>
</defs><ellipse cx="540" cy="480" rx="440" ry="390" fill="url(#halo)"/><g filter="url(#shadow)">${art}</g></svg>`;
writeFileSync('public/images/automation-core.svg', svg);
