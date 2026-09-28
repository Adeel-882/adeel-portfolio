// Optimize the approved alpha cutout; never modify the original reference.
const sharp = require('sharp');
const fs = require('node:fs');
const path = require('node:path');
async function main() {
  const input = process.argv[2];
  if (!input) throw new Error('Pass the transparent cutout path.');
  const out = path.resolve('public/hero-three');
  fs.mkdirSync(out, { recursive: true });
  const meta = await sharp(input).metadata();
  if (!meta.hasAlpha) throw new Error('The cutout must have a real alpha channel.');
  await sharp(input).resize({ width: 960, withoutEnlargement: true }).webp({ quality: 92, alphaQuality: 100, effort: 6 }).toFile(path.join(out, 'hero-spectral.webp'));
  console.log({ sourceSize: [meta.width, meta.height], hasAlpha: meta.hasAlpha, bytes: fs.statSync(path.join(out, 'hero-spectral.webp')).size });
}
main().catch(error => { console.error(error); process.exitCode = 1; });
