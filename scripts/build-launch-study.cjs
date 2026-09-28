const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
function compile(file, module = ts.ModuleKind.ES2022) {
  return ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
}
const component = {};
vm.runInNewContext(compile('src/components/SplashLaunch.tsx', ts.ModuleKind.CommonJS), {
  exports: component,
  require: (name) => (name === '@/lib/launch-timeline' ? {} : require(name)),
});
const plane =
  'data:image/svg+xml;base64,' +
  fs.readFileSync('public/splash/supersonic-aircraft.svg').toString('base64');
const splash = renderToStaticMarkup(React.createElement(component.SplashLaunch))
  .replace('/splash/supersonic-aircraft.svg', plane)
  .replace(/<noscript>[\s\S]*?<\/noscript>/, '');
const inline = (file) =>
  compile(file)
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];\s*/gm, '')
    .replace(/^export /gm, '');
const html = fs
  .readFileSync('scripts/launch-study-template.html', 'utf8')
  .replace(
    '__PORTRAIT__',
    'data:image/webp;base64,' +
      fs.readFileSync('public/hero-three/hero-spectral.webp').toString('base64'),
  )
  .replace('__SPLASH__', splash)
  .replace('__GEOMETRY__', inline('src/lib/launch-geometry.ts'))
  .replace('__TIMELINE__', inline('src/lib/launch-timeline.ts'));
fs.writeFileSync(process.argv[2], html);
console.log({
  bytes: Buffer.byteLength(html),
  remaining: /__(?:PORTRAIT|SPLASH|GEOMETRY|TIMELINE)__/.test(html),
});
