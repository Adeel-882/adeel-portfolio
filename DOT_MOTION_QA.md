# Persistent dot field — 23 September 2026

Reference: the supplied WhatsApp recording and https://antigravity.google/.

## Replacement

The previous fountain refinement was rejected. Its emitter and particle lifetime module have been removed. The replacement uses a fixed population distributed irregularly across the viewport, with small independent currents. The cursor displaces nearby existing dots radially, adds gentle curl and transfers some movement into a directional wake. Dots wrap at screen edges; no particles are created at the cursor.

- 100–340 dots, based on viewport area; 179 in the tested live viewport.
- Short rounded cobalt/pale-blue flecks, visible at rest.
- Local pointer influence within 210px, with damped velocity and a speed cap.
- One canvas, one animation loop, DPR capped at 1.5.
- Hidden/offscreen rendering pauses. Reduced-motion and touch use static CSS specks.
- Globe, layout, text, gradient and page choreography preserved.

## Verification

Automated physics checks verify a fixed population and persistent object identities through 600 interaction frames, local deflection, independent ambient drift, finite coordinates and bounded speeds. Component checks cover one animation loop, no click handler, hidden/offscreen pause and resume, reduced-motion/coarse-pointer fallbacks, DPR and complete cleanup. Touch and reduced-motion checks are simulated, not physical-device tests.

The live hero showed the distributed dots before pointer input. A browser cursor sweep retained 179 dots and one canvas with the flow-field implementation active. TypeScript, lint and the dot checks passed.

Production build passed. The restarted preview at http://127.0.0.1:3001/ was checked in the browser: flow-field active, 179 dots, one canvas, no console warnings or errors.
