import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as THREE from 'three';
const compile = (file) =>
  ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
const relief = {};
vm.runInNewContext(compile('src/lib/spectral-relief.ts'), { exports: relief });
assert(
  relief.portraitDepth(0.55, 0.44) > relief.portraitDepth(0.2, 0.9) + 0.2,
  'Front face must stand forward of the shoulder',
);
assert(
  relief.portraitDepth(0.5, 0.75) < relief.portraitDepth(0.55, 0.44),
  'Neck must recede behind face',
);
let min = Infinity,
  max = 0;
for (let u = 0; u <= 1; u += 0.02)
  for (let v = 0; v <= 1; v += 0.02) {
    const z = relief.portraitDepth(u, v);
    min = Math.min(min, z);
    max = Math.max(max, z);
    const x = (u - 0.5) * 2;
    const projected = (x * (1 - z / relief.PORTRAIT_CAMERA_Z)) / (relief.PORTRAIT_CAMERA_Z - z);
    assert(
      Math.abs(projected - x / relief.PORTRAIT_CAMERA_Z) < 1e-10,
      'Neutral projection must preserve source pixels',
    );
  }
assert(max - min > 0.65 && max < 0.9, 'Face relief must be clearly stronger but bounded');
assert(Math.abs(relief.curvePointer(0.2)) < 0.2 && relief.curvePointer(2) === 1);
assert.equal(relief.curvePointer(0.025), 0, 'Center noise must remain in the dead zone');
for (let u = 0; u <= 1; u += 0.02)
  for (let v = 0; v <= 1; v += 0.02) {
    const zones = relief.portraitZones(u, v);
    assert(zones.every((w) => w >= 0 && w <= 1));
    assert(
      Math.abs(zones.reduce((a, b) => a + b, 0) - 1) < 1e-9,
      'Smooth zones must partition the complete surface',
    );
  }
let x60 = 0,
  x120 = 0;
for (let i = 0; i < 60; i++) x60 = relief.dampPointer(x60, 1, 1 / 60);
for (let i = 0; i < 120; i++) x120 = relief.dampPointer(x120, 1, 1 / 120);
assert(Math.abs(x60 - x120) < 1e-10, 'Damping must be frame-rate independent');
assert.equal(relief.normalizePointer(300, 0, 100), 1);
assert.equal(relief.normalizePointer(-300, 0, 100), -1);

class Events {
  constructor() {
    this.listeners = new Map();
  }
  addEventListener(k, f) {
    if (!this.listeners.has(k)) this.listeners.set(k, new Set());
    this.listeners.get(k).add(f);
  }
  removeEventListener(k, f) {
    this.listeners.get(k)?.delete(f);
  }
  emit(k, data = {}) {
    this.listeners.get(k)?.forEach((f) => f(data));
  }
  count() {
    return [...this.listeners.values()].reduce((n, s) => n + s.size, 0);
  }
}
function harness({ reduce = false, coarse = false, webgl = true, delayed = false } = {}) {
  const queries = [];
  const callbacks = new Set();
  const observers = [];
  const resources = { geometry: 0, material: 0, texture: 0, renderer: 0, frames: 0 };
  const canvas = new Events();
  canvas.setAttribute = () => {};
  canvas.getContext = () => (webgl ? {} : null);
  canvas.remove = () => {
    canvas.removed = true;
  };
  const root = { dataset: {}, clientWidth: 600, clientHeight: 750, appendChild() {} };
  const hero = new Events();
  hero.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1440, height: 900 });
  const doc = new Events();
  doc.hidden = false;
  doc.createElement = () => canvas;
  const win = new Events();
  let doneLoading;
  let renderedMesh;
  class Geometry extends THREE.PlaneGeometry {
    dispose() {
      resources.geometry++;
      super.dispose();
    }
  }
  class Material extends THREE.ShaderMaterial {
    dispose() {
      resources.material++;
      super.dispose();
    }
  }
  class Renderer {
    constructor() {
      this.capabilities = { getMaxAnisotropy: () => 4 };
      this.debug = {};
    }
    setClearColor() {}
    setPixelRatio() {}
    setSize() {}
    render(scene) {
      resources.frames++;
      renderedMesh = scene;
    }
    dispose() {
      resources.renderer++;
    }
    forceContextLoss() {}
  }
  class Loader {
    load(_url, cb) {
      doneLoading = () =>
        cb({
          dispose() {
            resources.texture++;
          },
        });
      if (!delayed) doneLoading();
    }
  }
  class Observer {
    constructor(cb) {
      this.cb = cb;
      this.off = false;
      observers.push(this);
    }
    observe() {}
    disconnect() {
      this.off = true;
    }
  }
  const exports = {};
  const mockThree = {
    ...THREE,
    PlaneGeometry: Geometry,
    ShaderMaterial: Material,
    WebGLRenderer: Renderer,
    TextureLoader: Loader,
  };
  const layers = {};
  vm.runInNewContext(compile('src/lib/spectral-layers.ts'), {
    exports: layers,
    require: (name) => (name === 'three' ? mockThree : relief),
  });
  vm.runInNewContext(compile('src/lib/spectral-human.ts'), {
    exports,
    require: (name) =>
      name === 'three'
        ? mockThree
        : name === 'gsap'
          ? {
              gsap: {
                ticker: { add: (f) => callbacks.add(f), remove: (f) => callbacks.delete(f) },
              },
            }
          : name === './spectral-layers'
            ? layers
            : relief,
    matchMedia: (query) => {
      const m = new Events();
      m.matches = query.includes('reduced') ? reduce : query.includes('coarse') ? coarse : false;
      queries.push(m);
      return m;
    },
    document: doc,
    window: win,
    devicePixelRatio: 2,
    ResizeObserver: Observer,
    IntersectionObserver: Observer,
  });
  const cleanup = exports.mountSpectralHuman(root, hero);
  const tick = () => [...callbacks].forEach((f) => f(0, 1000 / 60));
  return {
    root,
    canvas,
    hero,
    doc,
    win,
    resources,
    queries,
    observers,
    cleanup,
    tick,
    callbacks,
    load: () => doneLoading?.(),
    mesh: () => renderedMesh,
  };
}
const h = harness();
assert.equal(h.root.dataset.renderer, 'three');
assert.equal(h.callbacks.size, 1);
h.hero.emit('pointermove', { clientX: 1440, clientY: 900, pointerType: 'mouse' });
for (let i = 0; i < 90; i++) h.tick();
const groups = ['rear', 'head', 'face', 'spectral', 'front'].map((name) =>
  h.mesh().getObjectByName(name),
);
assert.equal(h.mesh().getObjectByName('spectral-depth-rig').children.length, 2);
assert(
  groups.slice(2).every((g) => g.parent === groups[1]),
  'Face and light must inherit the head pivot',
);
assert(groups[0].rotation.y < 0.046 && groups[1].rotation.y > 0.155);
assert(groups[2].rotation.y > 0.02 && groups[2].rotation.y < 0.022);
assert(groups[4].rotation.y > groups[3].rotation.y);
assert(groups[1].rotation.x > 0.077 && groups[1].rotation.x < 0.08);
const body = h.mesh().getObjectByName('continuous-relief');
assert.equal(
  h.mesh().children.filter((m) => m.isMesh).length,
  3,
  'Three draw calls, shared relief geometry',
);
assert(body.geometry === h.mesh().getObjectByName('front-energy').geometry);
// Project posed vertices using the same skinning matrices as the shader.
function projected(u, v) {
  const d = relief.portraitDepth(u, v),
    c = 1 - d / 4.5;
  const p = new THREE.Vector3((u - 0.5) * 2 * c, (0.5 - v) * 2.5 * c, d);
  const weights = relief.portraitZones(u, v),
    q = new THREE.Vector3();
  ['rearMatrix', 'headMatrix', 'faceMatrix'].forEach((key, i) =>
    q.addScaledVector(p.clone().applyMatrix4(body.material.uniforms[key].value), weights[i]),
  );
  return q.x / (4.5 - q.z);
}
const faceShift = Math.abs(projected(0.55, 0.44) - ((0.55 - 0.5) * 2) / 4.5);
const shoulderShift = Math.abs(projected(0.2, 0.95) - ((0.2 - 0.5) * 2) / 4.5);
for (const [u, v] of [
  [0.5, 0.08],
  [0.23, 0.43],
  [0.65, 0.61],
]) {
  const shift = projected(u, v) - ((u - 0.5) * 2) / 4.5;
  assert(shift > 0.01, 'Hair, ear and jaw must move spatially toward the pointer');
}
assert(
  faceShift > shoulderShift * 6,
  'Face response must be clearly stronger than the rear shoulder',
);
assert(body.material.uniforms.energy.value > 1.08 && body.material.uniforms.energy.value <= 1.1);
h.hero.emit('pointerleave');
for (let i = 0; i < 120; i++) h.tick();
assert(
  groups.every((g) => Math.abs(g.rotation.y) < 0.008),
  'All five layers must settle to neutral',
);
h.observers[1].cb([{ isIntersecting: false }]);
assert.equal(h.callbacks.size, 0, 'Offscreen rendering must stop');
h.observers[1].cb([{ isIntersecting: true }]);
assert.equal(h.callbacks.size, 1);
h.doc.hidden = true;
h.doc.emit('visibilitychange');
assert.equal(h.callbacks.size, 0);
h.doc.hidden = false;
h.doc.emit('visibilitychange');
assert.equal(h.callbacks.size, 1);
h.queries[0].matches = true;
h.queries[0].emit('change');
assert.equal(h.root.dataset.renderer, 'three');
assert.equal(h.callbacks.size, 0);
assert(groups.every((g) => g.rotation.y === 0 && g.rotation.x === 0));
assert.equal(body.material.uniforms.energy.value, 1);
assert.equal(body.material.uniforms.pointer.value.length(), 0);
h.queries[0].matches = false;
h.queries[0].emit('change');
h.canvas.emit('webglcontextlost', { preventDefault() {} });
assert.equal(h.root.dataset.renderer, 'fallback');
assert.equal(h.callbacks.size, 0);
h.canvas.emit('webglcontextrestored');
assert.equal(h.callbacks.size, 1);
h.cleanup();
assert.equal(h.callbacks.size, 0);
assert(h.observers.every((o) => o.off));
assert.equal(
  h.hero.count() +
    h.doc.count() +
    h.win.count() +
    h.canvas.count() +
    h.queries.reduce((n, m) => n + m.count(), 0),
  0,
);
assert.equal(h.resources.geometry, 1);
assert.equal(h.resources.material, 3);
assert.equal(h.resources.texture, 1);
assert.equal(h.resources.renderer, 1);
for (const options of [{ reduce: true }, { webgl: false }]) {
  const f = harness(options);
  assert.equal(f.root.dataset.renderer, options.reduce ? 'three' : 'fallback');
  assert.equal(f.callbacks.size, 0);
  f.cleanup();
}
const touch = harness({ coarse: true });
const touchHead = touch.mesh().getObjectByName('head');
const sendTouch = (kind, x, y, id = 1) =>
  touch.hero.emit(kind, {
    pointerType: 'touch',
    pointerId: id,
    isPrimary: true,
    clientX: x,
    clientY: y,
    preventDefault() {
      assert.fail('Touch must never suppress native scroll');
    },
  });
for (const direction of [-1, 1, -1, 1]) {
  sendTouch('pointerdown', 180, 500);
  sendTouch('pointermove', 180 + direction * 110, 470);
  for (let i = 0; i < 90; i++) touch.tick();
  assert(touchHead.rotation.y * direction > 0.12 && Math.abs(touchHead.rotation.y) < 0.127);
  assert(touchHead.rotation.x < -0.006, 'Intentional diagonal drag controls pitch');
  touch.win.emit('pointerup', { pointerId: 99 });
  touch.tick();
  assert(touchHead.rotation.y * direction > 0.12, 'Unrelated pointer must not cancel a drag');
  touch.win.emit('pointerup', { pointerId: 1 });
  touch.tick();
  assert(touchHead.rotation.y * direction > 0.1, 'Release must damp, not snap');
  for (let i = 0; i < 120; i++) touch.tick();
  assert(Math.abs(touchHead.rotation.y) < 0.007);
}
sendTouch('pointerdown', 180, 500);
sendTouch('pointermove', 185, 400);
sendTouch('pointermove', 280, 390);
for (let i = 0; i < 60; i++) touch.tick();
assert(Math.abs(touchHead.rotation.y) < 0.007, 'A vertical gesture stays scroll-only');
touch.win.emit('pointercancel', { pointerId: 1 });
for (let i = 0; i < 10; i++) {
  sendTouch('pointerdown', 180, 500);
  sendTouch('pointermove', 210 + i, 501);
  touch.tick();
  touch.win.emit('pointercancel', { pointerId: 1 });
}
for (let i = 0; i < 120; i++) touch.tick();
assert(Math.abs(touchHead.rotation.y) < 0.007);
assert.equal(touch.callbacks.size, 1, 'Repeated touch must retain only one ticker');
assert(
  !('pose' in touch.root.dataset) && !('layers' in touch.root.dataset),
  'No production pose telemetry',
);
touch.cleanup();
const late = harness({ delayed: true });
late.cleanup();
late.load();
assert.equal(late.resources.texture, 1, 'Texture finishing after unmount must be disposed');
assert.equal(late.callbacks.size, 0);
console.log(
  'PASS: whole-head hierarchy, hair/ear/jaw projection, frame-independent damping, touch drag/release/cancel/scroll intent, reduced motion, fallback and complete cleanup.',
);
