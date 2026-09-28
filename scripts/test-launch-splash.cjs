const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const compile = (file) =>
  ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
const geometry = {};
vm.runInNewContext(compile('src/lib/launch-geometry.ts'), { exports: geometry });
for (const [width, height] of [
  [1440, 1000],
  [1280, 900],
  [768, 1024],
  [390, 844],
]) {
  const start = geometry.launchGeometry(width, height, 0);
  const end = geometry.launchGeometry(width, height, 1);
  assert(start.y > height, 'Aircraft must enter from below');
  assert(end.tail < 0, 'Entire aircraft must leave above screen');
  let previous = Infinity;
  for (let p = 0; p <= 1; p += 0.01) {
    const g = geometry.launchGeometry(width, height, p);
    assert(g.y < previous);
    previous = g.y;
    assert(Math.abs(g.x - width / 2) < width * 0.01);
    assert(g.leftPanel.includes(g.leftEdge.slice(g.leftEdge.indexOf('C'))));
    assert(g.rightPanel.includes(g.rightEdge.slice(g.rightEdge.indexOf('C'))));
    assert(
      g.strands.every((d) => d.startsWith(`M${g.x},${g.tail}`)),
      'Light anchors must follow aircraft tail',
    );
    assert(!JSON.stringify(g).includes('NaN'));
  }
}
function harness(reduce = false) {
  const listeners = new Map(),
    timers = new Map();
  let timerId = 0,
    setup,
    finished = 0,
    released = 0,
    played = 0,
    killed = 0,
    complete,
    release,
    seenReduced;
  const element = { dataset: { phase: 'waiting', blocking: 'true' }, hidden: false, style: {} };
  const win = {
    addEventListener: (k, f) => listeners.set(k, f),
    removeEventListener: (k) => listeners.delete(k),
    dispatchEvent: () => released++,
    setTimeout: (fn, ms) => {
      timers.set(++timerId, { fn, ms });
      return timerId;
    },
  };
  const media = {
    matches: reduce,
    addEventListener: (k, f) => listeners.set('media:' + k, f),
    removeEventListener: (k) => listeners.delete('media:' + k),
  };
  const exports = {};
  vm.runInNewContext(compile('src/components/SplashLaunch.tsx'), {
    exports,
    window: win,
    innerWidth: 1440,
    innerHeight: 1000,
    document: {
      fonts: { ready: new Promise(() => {}) },
      documentElement: { style: { overflow: '' }, clientWidth: 1425 },
      body: { style: { paddingRight: '' } },
    },
    matchMedia: () => media,
    getComputedStyle: () => ({ paddingRight: '0px' }),
    Image: class {
      decode() {
        return new Promise(() => {});
      }
    },
    Event: class {},
    clearTimeout: (id) => timers.delete(id),
    require: (name) =>
      name === 'react'
        ? {
            useRef: () => ({ current: element }),
            useState: () => [true, () => finished++],
            useId: () => 'test',
          }
        : name === 'react/jsx-runtime'
          ? { jsx: () => null, jsxs: () => null }
          : name === '@gsap/react'
            ? {
                useGSAP: (fn) => {
                  setup = fn;
                },
              }
            : name === 'gsap'
              ? { gsap: { registerPlugin() {} } }
              : {
                  createLaunchTimeline: (_el, r, c, reduced) => {
                    release = r;
                    complete = c;
                    seenReduced = reduced;
                    return { paused: () => !played, play: () => played++, kill: () => killed++ };
                  },
                },
  });
  exports.SplashLaunch();
  let cleanup = setup();
  return {
    element,
    listeners,
    timers,
    runTimer: (ms) => [...timers.values()].find((t) => t.ms === ms)?.fn(),
    release: () => release(),
    complete: () => complete(),
    cleanup: () => cleanup?.(),
    remount: () => {
      exports.SplashLaunch();
      cleanup = setup();
    },
    counts: () => ({ finished, released, played, killed, reduced: seenReduced }),
  };
}
const normal = harness();
normal.runTimer(220);
normal.release();
normal.complete();
normal.complete();
assert.deepEqual(normal.counts(), {
  finished: 1,
  released: 1,
  played: 1,
  killed: 0,
  reduced: false,
});
assert.equal(normal.element.dataset.blocking, 'false');
assert(normal.element.hidden);
assert.equal(normal.listeners.size, 0, 'Completion must detach listeners immediately');
assert.equal(normal.timers.size, 0, 'Completion must clear pending timers immediately');
normal.cleanup();
assert.equal(normal.listeners.size, 0);
assert.equal(normal.timers.size, 0);
normal.remount();
assert.equal(normal.counts().played, 1, 'Client navigation must not replay');
const strict = harness();
strict.cleanup();
strict.remount();
strict.runTimer(220);
assert.equal(strict.counts().played, 1, 'Strict Mode setup/cleanup must permit real mount');
strict.cleanup();
for (const key of ['Escape', 'Tab']) {
  const h = harness();
  h.listeners.get('keydown')({ key });
  assert(h.element.hidden);
  h.cleanup();
}
const reduced = harness(true);
reduced.runTimer(0);
assert(reduced.counts().reduced);
reduced.complete();
reduced.cleanup();
const stalled = harness();
stalled.runTimer(3000);
assert(stalled.element.hidden);
stalled.cleanup();
console.log(
  'PASS: four-size geometry, exact shared seam, attached trails, bounded preload, completion, internal remount, Strict Mode, keyboard escape, reduced route, watchdog and cleanup.',
);
