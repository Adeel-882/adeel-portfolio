# Background integration — 16 September 2026

## Sparse fountain revision — 17 September 2026 (current)

Replaced the dense dot grid, spring displacement, synchronized response and click rings described in the earlier notes below. The current background has 8–24 irregular stationary specks (around 15–20 on desktop), plus a local cursor fountain. Fountain particles have independently randomized launch velocities, sizes, color shades and lifetimes. They rise, spread, curve down and disappear in 0.85–1.55 seconds. Moving emits up to 42 particles/second, tapering to zero within 650ms of the last movement. Clicks emit 12; the hard cap is 72 active fountain particles. No lattice, expanding waves or trails remain.

Updated `scripts/test-dot-field.cjs` checks upward launch, inherited cursor momentum, gravity turning the arc, bounded count, expiry, sparse ambient count, idle shutdown, single RAF, visibility/intersection pauses, reduced-motion/coarse-pointer fallback, DPR cap and teardown. TypeScript and ESLint passed.

## Dotted background follow-up

Added a visible dot grid over the shaded wave and behind the page content. The reusable `DotPattern` component defaults to 24px spacing, 1px radius and muted blue-gray dots. This is a custom implementation of the requested dotted treatment: the supplied attachment contains a filter-token bar, while the earlier attachment contains Gradient Wave; neither contains a dot-background component.

## Cursor interaction follow-up

Inspected https://antigravity.google/ in the browser, including its particle response around the pointer. Added a custom cobalt interpretation: a 210px cursor influence, repulsion plus tangential swirl, velocity-sensitive wakes, short particle trails and click-triggered expanding waves. Spring motion restores the original grid. The dot canvas is decorative and pointer-transparent, so navigation and text remain usable.

The 2D dot canvas is separate from the existing WebGL wave. Dot density is bounded around 4,500 particles, DPR is capped at 1.5, and colors are batched into eight fill operations per frame. No additional libraries. The loop sleeps once the pointer leaves and springs settle, and pauses when hidden/offscreen. Coarse-pointer and reduced-motion users keep static CSS dots.

Browser checks confirmed visible displacement, brightening, click rings and movement trails at desktop size, without console errors. `node scripts/test-dot-field.cjs` verifies repulsion/swirl, stronger fast-motion response, finite values at zero distance, bounded long-running motion, spring return, click-wave force, idle sleep, single RAF, hidden/offscreen pauses, reduced-motion and touch fallback, DPR cap, and event/observer/canvas cleanup. These lifecycle tests execute the real effects against controlled browser signals; they are not a physical-device performance measurement.

## Implementation

- Preserved portfolio content, layout, architectural artwork and existing GSAP effects.
- Adapted the supplied Gradient Wave's simplex noise and deformed plane into a typed renderer. Fixed deformation updates by retaining nested Uniform objects and assigning their `.value` fields.
- Exact palette: `#030303`, `#050817`, `#08132E`, `#10255F`, `#1740FF`, `#081020`. Seven declared shader layers support up to eight colors without indexing outside the original four-component active-color vector.
- One fixed, decorative, pointer-transparent canvas. GSAP controls only section intensity; one guarded RAF loop owns shader time.
- Global noise speed 0.000005; frequency [0.00008, 0.00035]; incline 0.16; amplitude 200; deformation speed 7; flow 3.
- Hero / positioning / capabilities / work / approach / background / toolkit / about / contact intensities: .50 / .40 / .25 / .14 / .36 / .12 / .18 / .26 / .46. Smooth opacity interpolation and layered shading preserve black areas.
- Container sizing uses ResizeObserver. Desktop DPR capped at 1.5, mobile at 1; backing area capped at 3.5 million pixels. Mesh dimensions are bounded; draw cadence capped at 30 desktop / 24 mobile frames per second. These are configured limits, not measured device performance.
- Static rendered frame for reduced motion. CSS fallback for unavailable WebGL, initialization failure or context loss; context restoration reinitializes the renderer.
- Offscreen/hidden-tab pauses; observers, events, RAF, buffers, shaders, program and canvas are cleaned up. Normal unmount also releases the context.
- Fixed horizontal overflow exposed by the moving workflow highlight after resizing. Blended the envelope artwork into the new background without altering its source image.

## Verification performed

- TypeScript check, ESLint and optimized Next production build passed.
- Browser inspection at 1440×900, 1280×800, 768×1024 and 390×844. Reviewed scrolling from hero through projects, system, experience/toolkit, about and contact. The wave remains subdued behind text and opaque project artwork; no hard canvas boundary was seen.
- Resizing retained exactly one canvas and updated its backing dimensions. Tablet/mobile selected the lighter rendering settings. Horizontal overflow was absent after the fix.
- Actual browser WebGL shader compilation succeeded; inspected browser warning/error logs were empty.
- Navigating into the clinical case study removed the canvas; returning home restored exactly one canvas with the WebGL renderer active.
- Browser-reviewed the Visualize comparison at desktop and narrow widths. Selected-work control changed opacity from .50 to .14; pause switched to Play. Keyboard controls worked. No console warnings/errors were reported for the comparison.
- `node scripts/test-gradient-wave.cjs` passes: six-color upload; nested deformation uniform identity and GPU upload; desktop/mobile DPR caps; unchanged-size buffer reuse; resize disposal; one RAF; shader/program/buffer cleanup; failed shader cleanup; reduced-motion static rendering; visibility/offscreen pause; context-loss fallback and restoration; React effect unmount cleanup.

## Scope of evidence

Reduced-motion, visibility, context loss and GPU resource accounting were tested by executing the real component effects/renderer against controlled browser signals and a mock WebGL context. Browser QA separately confirmed real shader compilation, responsive composition and route remount behavior. An operating-system reduced-motion toggle, physical-phone performance profile and long-duration GPU memory trace were not available in this run; no measured FPS or universal leak-free claim is made.

## Preview

- Portfolio: http://127.0.0.1:3001/
- Background composition comparison: `/background-study.html`
- The comparison embeds the same renderer and palette as the portfolio; it is a contained study, not a replacement homepage.
