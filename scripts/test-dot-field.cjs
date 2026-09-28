const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
function load(path, imports = {}, globals = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, { exports, require: name => imports[name], ...globals });
  return exports;
}
const physics = load('src/lib/dot-flow.ts');
const dots = physics.createDotFlow(1280, 800);
assert(dots.length > 200 && dots.length <= 340, 'Field is present before pointer input');
assert.equal(dots.filter(p=>p.shade===2).length,2,'Only two orange flecks');
assert.equal(dots.filter(p=>p.shade===3).length,1,'Only one cream fleck');
assert(dots.filter(p=>p.shade===0).length > dots.filter(p=>p.shade===1).length,'Cobalt remains the largest group');
const identities = [...dots];
const blankPointer = { x:-1000, y:-1000, vx:0, vy:0, influence:0 };
const initial = dots.map(p => ({...p}));
for (let i = 0; i < 600; i++) physics.stepDotFlow(dots, 1/60, i/60, 1280, 800, {x:640+Math.sin(i/30)*300,y:400,vx:100,vy:0,influence:1});
assert.equal(dots.length, identities.length, 'Moving the cursor never emits or expires particles');
assert(dots.every((p,i) => p === identities[i]), 'The same dot objects remain alive');
assert(dots.every(p => Number.isFinite(p.x) && Number.isFinite(p.y) && Math.hypot(p.vx,p.vy)<=240.0001));
const near = [{...initial[0], x:510,y:400}], far = [{...initial[0],x:510,y:400}];
physics.stepDotFlow(near,1/60,0,1280,800,{x:500,y:400,vx:0,vy:0,influence:1});
physics.stepDotFlow(far,1/60,0,1280,800,blankPointer);
assert(near[0].vx > far[0].vx, 'Cursor parts existing dots radially');
assert(near[0].vy > far[0].vy, 'Tangential response bends the field');
const idle = physics.createDotFlow(1280,800); const before = idle[0].y;
for(let i=0;i<60;i++) physics.stepDotFlow(idle,1/60,i/60,1280,800,blankPointer);
assert(idle[0].y !== before, 'Ambient field moves without an emitter');
assert.equal(idle.length, dots.length);

const effects=[], observers=[], raf=new Map(); let id=0, clock=100, removed=false;
const events=new Map(), docEvents=new Map();
const media=matches=>({matches,listeners:new Map(),addEventListener(n,fn){this.listeners.set(n,fn)},removeEventListener(n){this.listeners.delete(n)}});
const reduce=media(false), fine=media(true);
const context=new Proxy({}, {get:(o,n)=>o[n]??(()=>{}),set:(o,n,v)=>{o[n]=v;return true}});
const canvas={getContext:()=>context,setAttribute(){},remove(){removed=true}};
const container={clientWidth:1280,clientHeight:800,dataset:{},appendChild(){},getBoundingClientRect:()=>({left:0,top:0})};
const document={hidden:false,createElement:()=>canvas,addEventListener:(n,fn)=>docEvents.set(n,fn),removeEventListener:n=>docEvents.delete(n)};
class Observer {constructor(fn){this.fn=fn;observers.push(this)}observe(){}disconnect(){this.done=true}}
const component=load('src/components/ui/dot-pattern.tsx',{
  react:{useRef:value=>({current:value}),useEffect:fn=>effects.push(fn)},
  'react/jsx-runtime':{jsx:(_,props)=>{props.ref.current=container}},
  '@/lib/dot-flow':physics,
  '@/lib/colors':{colors:require('../src/data/palette.json')},
},{document,window:{addEventListener:(n,fn)=>events.set(n,fn),removeEventListener:n=>events.delete(n)},
  matchMedia:q=>q.includes('reduced-motion')?reduce:fine,ResizeObserver:Observer,IntersectionObserver:Observer,devicePixelRatio:2,
  performance:{now:()=>clock},requestAnimationFrame:fn=>{raf.set(++id,fn);return id},cancelAnimationFrame:key=>raf.delete(key),
});
component.DotPattern({}); const cleanup=effects[0]();
const count=container.dataset.dots;
assert.equal(container.dataset.effect,'flow-field'); assert.equal(canvas.width,1920); assert.equal(raf.size,1);
const tick=time=>{clock=time;const [key,fn]=[...raf][0];raf.delete(key);fn(time)};
tick(116); assert.equal(raf.size,1,'Ambient field continues at rest');
for(let i=0;i<50;i++)events.get('pointermove')({pointerType:'mouse',clientX:i*20,clientY:300});
assert.equal(raf.size,1); tick(133); assert.equal(container.dataset.dots,count);
assert.equal(events.has('pointerdown'),false);
document.hidden=true;docEvents.get('visibilitychange')();assert.equal(raf.size,0);
document.hidden=false;docEvents.get('visibilitychange')();assert.equal(raf.size,1);
reduce.matches=true;reduce.listeners.get('change')();assert.equal(raf.size,0);assert.equal(container.dataset.interactive,'false');
reduce.matches=false;reduce.listeners.get('change')();fine.matches=false;fine.listeners.get('change')();assert.equal(raf.size,0);
fine.matches=true;fine.listeners.get('change')();observers[1].fn([{isIntersecting:false}]);assert.equal(raf.size,0);
observers[1].fn([{isIntersecting:true}]);assert.equal(raf.size,1);
cleanup();assert.equal(raf.size,0);assert.equal(events.size+docEvents.size+reduce.listeners.size+fine.listeners.size,0);
assert(removed&&observers.every(o=>o.done));
console.log('PASS: persistent population, no cursor emission, radial/curl interaction, calm ambient motion, bounded velocity, one canvas/loop, DPR cap, hidden/offscreen pause, touch/reduced-motion fallback and cleanup.');

