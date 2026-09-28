import palette from '../data/palette.json';

/** One palette supplies CSS custom properties, Canvas 2D and WebGL. */
export const colors = palette;
export const colorVariables = Object.fromEntries(
  Object.entries(colors).map(([role, value]) => [`--color-${role}`, value]),
);
export function colorRGB(hex: string): [number, number, number] {
  return [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255) as [
    number,
    number,
    number,
  ];
}
