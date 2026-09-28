# Spectral human hero

## Implemented

The hero now uses the supplied portrait as a transparent, camera-matched Three.js relief. The original JPG remains untouched. The globe component, runtime, CSS, test, palette token and COBE dependency are removed. Hero typography, actions, navigation, background/dots, later sections and the corrected ABOUT monogram are preserved.

### Source and asset provenance

- Original: `C:/Users/adeel_utu7nye/Downloads/10625749119185905.jpg`, 736 × 920, 29,165 bytes. Local img2threejs metadata probe: technical pass; semantic suitability reviewed separately.
- Background extraction: built-in image editing tool, using the source as the edit target. This creates a derived cutout; it is not a claim of pixel-identical extraction.
- Optimized asset: `public/hero-three/hero-spectral.webp`, 960 × 1200, alpha, 86,604 bytes. The original 736px reference limits real source detail despite the larger edited cutout.
- Preparation: `scripts/prepare-spectral-texture.cjs` only optimizes the approved cutout.
- Image editing prompt: `.img2threejs/asset-provenance.txt`.

### Depth and rendering

The depth field in `src/lib/spectral-relief.ts` is an authored relative approximation guided by the visible head, face, chin, neck and shoulder landmarks. It does not infer hidden facial anatomy from bright pixels. One continuous non-planar mesh avoids gaps between detached cards. Inverse projection keeps the neutral view aligned to the texture. This is not a 360° character, a rig, or a measured anatomical reconstruction.

The interaction upgrade retains that asset (SHA256 `6E8A69C6FE626DA6A1BD2DA154C7DB7DB6F5CA617EA15D90B221296296E6FD96`) and its nonuniform relief. The root contains a bust group and upper-neck head pivot. Face, spectral light and front energy inherit the head transform with small local additions. Smooth vertex weights blend the body transforms; two faint face-only emission passes share the same geometry. No opaque overlapping cards or detached head are introduced. Depth extends a two-cell guard band under transparent boundary pixels to avoid contour stair steps; the fragment alpha retains the actual source silhouette.

### September 28 diagnosis

Hero-relative normalization, hero-wide listeners and separate GSAP wrapper ownership were correct. Touch/coarse input was explicitly rejected. Five sibling transforms failed to carry the face/light with one coherent head turn. The old pivot Z=0.08 lay near the hair/ear contour while the raised face extended much farther forward, making the face respond disproportionately. Head range was only 6 degrees (3.9 compact), damping was 4.8/s, and no center dead zone existed. The new head pivot sits behind the upper neck at (0,-0.42,-0.28); the existing depth field is sufficient and remains unchanged. Production per-frame pose/layer DOM telemetry has been removed.

The source remains emitted radiance with sRGB texture/output handling. Face-local UV motion reaches five texture pixels horizontally and three vertically, with at most 2.4px horizontal red/blue separation. Cursor distance increases spectral intensity up to 1.10; idle breathing ranges 1.00–1.04. A restrained derivative-normal shader rim reinforces the viewing direction. No postprocessing or full-canvas bloom is used. Existing CSS masks are unchanged.

### Motion and resources

- Hero-relative targets use a clamped nonlinear curve with a 0.03 dead zone. Per-layer delta-aware damping rates are 4.8, 7.5, 9, 10 and 11/s; engagement reaches 90% in about 288ms.
- Head yaw/pitch ±9°/4.5°; bust ±2.6°/1.3°. Face adds ±1.2°/0.5° locally, spectral light ±1.65°/0.65°, front glow ±2°/0.8°. Compact or touch input uses 80% range (head ±7.2°/3.6°). Head position adds 0.035/0.018 scene units, bust 0.015/0.008, subordinate to rotation. Idle head yaw stays below 0.35°.
- Existing scoped GSAP entrance/scroll wrappers adapted only for the new hero object: entrance x40/scale1.04/1.3s; scroll y5%/scale1.025/opacity0.7.
- One shared geometry: 31,360 triangles desktop; 10,240 compact/coarse. Three draw passes submit 94,080 / 30,720 triangles. DPR caps 1.75 / 1.25.
- Touch records its origin and maps a 110px horizontal drag to full yaw. After a 6px intent threshold, horizontal gestures can add small diagonal pitch; vertical gestures remain scroll-only until release/cancel. Hero touch-action permits vertical panning and pinch zoom. Passive listeners, no preventDefault or pointer capture, and window release/cancel handling preserve links and scrolling. Tiny idle motion resumes after release.
- Hidden tabs and offscreen hero remove the GSAP ticker callback. Reduced motion renders one neutral Three.js frame with no cursor distortion or idle motion; global GSAP transforms remain disabled.
- WebGL failure/context loss shows the static cutout. Context restoration resumes. Resize and unmount dispose replaced geometry and all owned GPU resources. Late-loading textures are disposed after unmount.

## Skill scope

Read the local img2threejs router, README, image analysis, suitability, projection-first likeness, texture/color-space, geometry, quality contract and review guidance. Read local GSAP performance, React and ScrollTrigger guidance, and installed Next.js client/CSS guidance.

The supplied brief explicitly requests a textured limited-angle 2.5D surface and preservation of the source's luminous face. That overrides the skill's default full procedural character factory, generated hair, PBR de-lighting, rear turntable, rig/explodable parts and full-sculpt gates. Those full-model gates are not represented as passing. The scoped plan and adaptations are recorded in `.img2threejs/spectral-spec.json`; direct implementation is reviewed against the requested hero behavior.

## Validation

- Production build and TypeScript: pass.
- ESLint: pass.
- `node scripts/test-spectral-human.mjs`: pass. Uses real Three.js geometry with mocked GPU/DOM lifecycle to verify nonuniform depth, neutral projection invariance, hierarchy, projected hair/ear/jaw displacement, frame-rate-independent damping, angular bounds, neutral settling, touch direction/diagonal/release/cancel/repeated swipes, unrelated pointer release, vertical intent, offscreen/hidden/reduced behavior, fallback/context recovery, complete cleanup and late texture disposal.
- Existing dot-field and gradient-wave tests: pass.
- No globe/COBE references remain in application source or dependency manifests.
- Real browser at 1440×1000, 1280×900, 768×1024 and 390×844: no horizontal overflow; readable existing typography/CTAs; full source identity recognizable; no pale rectangle; crisp spectral face and hair rim; shoulders blend at the crop; intentional stacking below copy on tablet/mobile.
- September 28: center, far-left/right and four corner inputs visually inspected. The hair, ear and jaw shift with the head; the shoulder response is weaker. No detached neck, visible layer seams, melted face or exposed rectangle were observed. Rapid reversing drags and return outside the hero retain smooth movement and tiny neutral idle.
- Tracking remains hero-wide, including headline and CTA descendants. Clicking Explore my work navigates to #work and pauses the offscreen portrait. Returning to the top resumes it. The geometry test verifies the face's projected horizontal response exceeds the shoulder response by more than six times and explicitly checks hair/ear/jaw movement.
- Real offscreen scroll check: portrait reports paused. Production preview reports exactly one Three.js portrait canvas and zero globe elements; console has no warnings/errors.
- Visualize comparison uses the same production relief/render code and embedded texture. Left/neutral/right controls were reviewed at 1440/1280/768/390 viewport widths. Drag-left/right controls dispatch touch PointerEvents through the actual handlers; 390px left, released-neutral and right poses visibly differ across the whole silhouette. Console warnings/errors: none.

Reduced-motion, coarse-pointer, WebGL-failure and cleanup checks are lifecycle simulations. Touch browser evidence uses synthetic PointerEvents in the study; the available browser controls do not expose native touch injection. Vertical scrolling was checked with browser scrolling, and scroll intent/passive listeners/touch-action were separately checked. Physical-phone gesture arbitration and mobile frame rate remain unmeasured. This review does not claim a reconstructed rear surface. Splash, page structure, artwork and existing GSAP animation files were not edited in this pass.
