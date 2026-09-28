const fs = require('node:fs');
const ts = require('typescript');
const texture =
  'data:image/webp;base64,' +
  fs.readFileSync('public/hero-three/hero-spectral.webp').toString('base64');
function inline(file) {
  const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  }).outputText;
  return output
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];\s*/gm, '')
    .replace(/^export /gm, '')
    .replace('/hero-three/hero-spectral.webp', texture);
}
const html = fs
  .readFileSync('scripts/spectral-study-template.html', 'utf8')
  .replace('__TEXTURE__', texture)
  .replace('__RELIEF__', inline('src/lib/spectral-relief.ts'))
  .replace('__LAYERS__', inline('src/lib/spectral-layers.ts'))
  .replace('__RENDERER__', inline('src/lib/spectral-human.ts'));
fs.writeFileSync(process.argv[2], html);
console.log({
  bytes: Buffer.byteLength(html),
  placeholdersRemaining: /__(?:TEXTURE|RELIEF|LAYERS|RENDERER)__/.test(html),
});
