const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');

function load(path, imports, globals = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
  }).outputText, { exports, require: name => imports[name], ...globals });
  return exports;
}
function fixture(failCompile = false) {
  const calls = [];
  let serial = 0;
  const gl = new Proxy({}, { get: (_, name) => {
    if (name === 'getShaderParameter') return () => !failCompile;
    if (name === 'getProgramParameter') return () => true;
    if (name === 'isContextLost') return () => false;
    if (name === 'getAttribLocation') return () => 0;
    if (name === 'getUniformLocation') return (_, key) => key;
    if (name === 'getExtension') return () => ({ loseContext() { calls.push(['loseContext']); } });
    if (/^[A-Z_]+$/.test(name)) return name;
    return (...args) => { calls.push([name, ...args]); if (name.startsWith('create')) return { id: ++serial }; };
  }});
  const events = new Map();
  const canvas = { width: 0, height: 0, getContext: () => gl,
    setAttribute() {}, addEventListener: (name, fn) => events.set(name, fn),
    removeEventListener: name => events.delete(name), remove() { this.removed = true; } };
  return { gl, canvas, calls, events };
}
const raf = new Map();
let rafId = 0;
const globals = {
  requestAnimationFrame: fn => { raf.set(++rafId, fn); return rafId; },
  cancelAnimationFrame: id => raf.delete(id),
};
const shaders = load('src/lib/gradient-wave-shaders.ts', {});
const engine = load('src/lib/gradient-wave.ts', { './gradient-wave-shaders': shaders, './colors':{colors:require('../src/data/palette.json')} }, globals);
const f = fixture();
const gradient = new engine.Gradient(f.canvas);
const uniform = gradient.uniforms.u_vertDeform.value.noiseAmp;
gradient.configure({ deform: { noiseAmp: 233, incline: .21 } });
assert.equal(gradient.uniforms.u_vertDeform.value.noiseAmp, uniform);
assert.equal(uniform.value, 233);
assert(f.calls.some(c => c[0] === 'uniform1f' && c[1] === 'u_vertDeform.noiseAmp' && c[2] === 233));
assert(f.calls.some(c => c[0] === 'uniform1i' && c[1] === 'u_colorCount' && c[2] === 6));
assert(f.calls.some(c => c[0] === 'uniform1f' && c[1] === 'u_waveLayers[3].noiseFloor' && c[2] === .52), 'Warm layers occupy narrower noise peaks');
const warmLight = f.calls.find(c => c[0] === 'uniform3fv' && c[1] === 'u_waveLayers[3].color')[2];
assert(warmLight[0] < .21 && warmLight[0] > warmLight[2], 'Orange illumination has controlled exposure');
gradient.resize(1440, 900, 3);
assert.equal(f.canvas.width, 2160);
assert.equal(f.canvas.height, 1350);
const buffers = f.calls.filter(c => c[0] === 'createBuffer').length;
gradient.resize(1440, 900, 3);
assert.equal(f.calls.filter(c => c[0] === 'createBuffer').length, buffers);
gradient.resize(390, 844, 3);
assert.equal(f.canvas.width, 390);
assert.equal(f.canvas.height, 844);
assert.equal(f.calls.filter(c => c[0] === 'deleteBuffer').length, 4);
gradient.start(); gradient.start(); assert.equal(raf.size, 1);
gradient.stop(); assert.equal(raf.size, 0);
gradient.dispose(true); gradient.dispose(true);
for (const [create, destroy] of [['createShader', 'deleteShader'], ['createProgram', 'deleteProgram'], ['createBuffer', 'deleteBuffer']]) {
  assert.equal(f.calls.filter(c => c[0] === create).length, f.calls.filter(c => c[0] === destroy).length);
}
const bad = fixture(true);
assert.throws(() => new engine.Gradient(bad.canvas));
assert.equal(bad.calls.filter(c => c[0] === 'deleteShader').length, 1);
assert.equal(bad.calls.filter(c => c[0] === 'deleteProgram').length, 1);

// Execute the real React effects with controlled browser signals. This verifies
// reduced-motion / hidden-tab / offscreen / context-loss / unmount cleanup paths.
for (const reduced of [false, true]) {
  const env = fixture();
  const effects = [];
  const listeners = new Map();
  const mediaListeners = new Map();
  const observers = [];
  const container = { clientWidth: 768, clientHeight: 1024, dataset: {}, appendChild() {} };
  const media = { matches: reduced, addEventListener: (n, fn) => mediaListeners.set(n, fn), removeEventListener: n => mediaListeners.delete(n) };
  const document = { hidden: false, createElement: () => env.canvas,
    addEventListener: (n, fn) => listeners.set(n, fn), removeEventListener: n => listeners.delete(n) };
  class Observer {
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe() {} disconnect() { this.disconnected = true; }
  }
  const component = load('src/components/ui/gradient-wave.tsx', {
    react: { useRef: value => ({ current: value }), useEffect: fn => effects.push(fn) },
    'react/jsx-runtime': { jsx: (_, props) => { props.ref.current = container; } },
    '@/lib/gradient-wave': engine,
  }, { document, matchMedia: () => media, ResizeObserver: Observer, IntersectionObserver: Observer, devicePixelRatio: 3 });
  component.GradientWave({ colors: engine.WAVE_COLORS });
  const cleanups = effects.map(fn => fn());
  assert.equal(container.dataset.renderer, 'webgl');
  assert.equal(container.dataset.motion, reduced ? 'static' : 'playing');
  document.hidden = true; listeners.get('visibilitychange')();
  assert.equal(container.dataset.motion, 'paused'); assert.equal(raf.size, 0);
  document.hidden = false; listeners.get('visibilitychange')();
  assert.equal(container.dataset.motion, reduced ? 'static' : 'playing');
  observers[1].callback([{ isIntersecting: false }]); assert.equal(raf.size, 0);
  observers[1].callback([{ isIntersecting: true }]);
  media.matches = true; mediaListeners.get('change')();
  assert.equal(container.dataset.motion, 'static'); assert.equal(raf.size, 0);
  env.events.get('webglcontextlost')({ preventDefault() {} });
  assert.equal(container.dataset.renderer, 'fallback');
  env.events.get('webglcontextrestored')();
  assert.equal(container.dataset.renderer, 'webgl');
  cleanups.filter(Boolean).forEach(fn => fn());
  assert.equal(raf.size, 0); assert.equal(listeners.size, 0); assert.equal(mediaListeners.size, 0);
  assert.equal(env.events.size, 0); assert(env.canvas.removed); assert(observers.every(o => o.disconnected));
  for (const [create, destroy] of [['createShader', 'deleteShader'], ['createProgram', 'deleteProgram'], ['createBuffer', 'deleteBuffer']]) {
    assert.equal(env.calls.filter(c => c[0] === create).length, env.calls.filter(c => c[0] === destroy).length);
  }
}
console.log('PASS: six spectral colors, restrained warm exposure, deformation uniform identity/upload, DPR caps, resize reuse, one RAF, GPU cleanup, failed shader cleanup, reduced motion, visibility, intersection, context recovery and React unmount.');


