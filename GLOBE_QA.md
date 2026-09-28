# Hero globe replacement — 23 September 2026

## Result

The hero now contains a COBE 2.0.1 globe in black, graphite and cobalt. Eight small markers are decorative network points, not client claims. No card, labels, orbital rings, white rim or extra particles were added. Existing hero typography, copy, CTAs, Gradient Wave, sparse pointer fountain and page animations are preserved.

The old person component, playback effect, pose renderer, damping module, character stylesheet, obsolete tests and study were removed. Six unused production media files (8,385,344 bytes total) and the obsolete character-only working directory were deleted. The user's original clip outside the repository was not modified. Searches of source, scripts and public assets found no obsolete character references. Remaining pointer listeners belong to globe dragging, the existing fountain and existing hover effects; remaining masks belong to text/project reveals.

## Motion and lifecycle

- COBE renders internal rotation; GSAP owns separate entrance and scroll wrappers.
- Entrance: opacity 0→1, scale 0.92→1, x 50→0 over 1.3 seconds, starting after the headline begins.
- Desktop scroll: yPercent 6, scale 1.035, opacity 0.75. Existing reduced-motion media handling disables entrance/parallax.
- Automatic rotation: 0.12 radians/second, equivalent to 0.002 per nominal 60 Hz frame.
- Pointer capture supports horizontal mouse and touch drag, including release beyond the canvas. Mutable values and one animation loop avoid pointer-driven React rerenders. Damping and decaying momentum smooth release.
- Vertical touch scrolling remains enabled with `touch-action: pan-y`.
- ResizeObserver measures actual container size. DPR caps: desktop 1.75, compact/coarse pointer 1.25. Map samples: 20,000 desktop / 12,000 compact.
- Offscreen or hidden instances stop requesting frames. Reduced motion holds orientation still; deliberate dragging remains available. A bounded stationary warm-up renders COBE's asynchronous embedded map texture before sleeping.
- Cleanup cancels the frame, disconnects both observers, removes listeners, destroys COBE, releases the WebGL context and removes the imperatively owned canvas subtree. This handles COBE v2's generated wrapper without leaving duplicates under React Strict Mode.
- Context loss pauses rendering and shows a subdued CSS sphere. Context recovery reinitializes the same canvas. Unavailable WebGL uses that static fallback.

## Browser verification

In-app Chromium, both development and final production build:

| Viewport | Result |
| --- | --- |
| 1440 × 1000 | About 710px visible globe diameter on the right, slight edge crop, dominant readable headline, no visible container |
| 1280 × 800 | About 630px visible diameter; text and CTAs remain readable; restrained blue atmosphere |
| 768 × 1024 | Separate globe below copy and actions; compact rendering; no horizontal overflow |
| 390 × 844 | About 385px globe below CTAs, restrained right crop, no text overlap or horizontal overflow |

Horizontal dragging visibly changed orientation and returned to autonomous rotation. The canvas cursor is `grab` and the active drag rule is `grabbing`. Resizing retained exactly one globe canvas. Navigating to a case study removed the globe; returning recreated exactly one. Clicking “Explore my work” completed the existing project reveal and paused the offscreen globe; its reported angle remained unchanged across observations. The production DOM contains no video elements or old media sources. No new warning, console error or WebGL error appeared during these checks.

Touch pointer events, reduced-motion transitions, hidden-tab behavior, WebGL failure/recovery and cleanup were additionally checked in the automated lifecycle harness. Native physical touch hardware and OS reduced-motion emulation were not available through the browser tools; these are not claimed as physical-device tests.

## Visualize verification

`cobalt-globe.html` in the thread visualization directory embeds the installed COBE renderer and the same production globe controller, with no tuning controls or external asset requests. Its 26,996-byte fragment was checked in the browser at 736px and 390px. The globe renders, responds to drag, resumes rotation and has no overflow or console errors. This is a component preview; the full portfolio composition was checked separately above.

## Checks

- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm run build` — passed; seven pages generated.
- `node scripts/test-globe.cjs` — passed: rotation rate, drag damping, pointer capture, touch events, reduced motion, offscreen/hidden pause, DPR/resize, context recovery, fallback, one loop and cleanup.
- `node scripts/test-dot-field.cjs` — passed.
- `node scripts/test-gradient-wave.cjs` — passed.

Production preview: http://127.0.0.1:3001/. No external deployment.

References: [21st.dev source concept](https://21st.dev/@dillionverma/components/globe), [COBE API](https://cobe.vercel.app/). The original demo uses the older `onRender` API; this integration uses v2's explicit `update()` and `destroy()` methods.
