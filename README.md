# Adeel — Business, on autopilot.

Personal portfolio for **Raja Adeel Ahmed**, AI automation developer and systems builder.

## Run locally

Requires Node.js 20.9 or newer.

```sh
npm ci
npm run dev
```

Development URL: `http://127.0.0.1:3000`

```sh
npm run build
npm run start -- --port 3001
```

Production preview: `http://127.0.0.1:3001`

## Edit content

The work section now uses the supplied card-stack interaction, followed by a filterable `/work` collection and screenshot galleries. Edit the seven new projects in `src/data/screenshot-projects.ts`. Add approved client quotes to `src/data/reviews.ts`; the review section stays hidden while that list is empty. See `WORK_CARDS.md` for template integration and asset preparation.

| File | Content |
| --- | --- |
| `src/data/site.ts` | Positioning, capability descriptions, process steps, about copy, public email and optional LinkedIn |
| `src/data/projects.ts` | Projects, full case studies, covers and galleries |
| `src/data/experience.ts` | Employment/project experience and education |
| `src/data/toolkit.ts` | Confirmed tools grouped by purpose |
| `src/data/palette.json` | Shared Spectral Cobalt colors for CSS, Canvas and WebGL |
| `src/app/globals.css` | Semantic derived tokens, typography, spacing and responsive rules |
| `src/components/Motion.tsx` | Scoped GSAP motion and responsive/reduced-motion behavior |
| `src/app/motion.css` | Reveal masks, independent motion layers and hover responses |
| `src/components/PortfolioBackground.tsx` | Background intensity by section |
| `src/components/ui/gradient-wave.tsx` | Reusable canvas lifecycle and accessibility behavior |
| `src/components/ui/dot-pattern.tsx` | Persistent cursor-responsive dots and accessibility behavior |
| `src/lib/dot-flow.ts` | Fixed dot population, ambient currents and local cursor forces |
| `src/lib/gradient-wave.ts` | Six-color palette, wave settings and GPU renderer |
| `src/app/background.css` | Background overlays, static fallback and artwork blending |
| `src/components/HeroSpectralHuman.tsx` | Client-only portrait loader with static alpha fallback |
| `src/lib/spectral-human.ts` | Three.js relief, optical shader and GPU lifecycle |
| `src/lib/spectral-relief.ts` | Relative depth field, projection and pointer damping |
| `src/lib/spectral-layers.ts` | Five depth transforms, shared geometry and optical shaders |
| `src/app/hero-human.css` | Desktop portrait composition and mobile stacking |

### Add a project

Add a record to `projects` with a unique slug. Its page is generated automatically. Set `status: 'published'` only when its facts are ready. Put product screenshots in `public/images/`, set `cover` to the image URL, and add descriptive `gallery` records. The existing covers are original **system illustrations**, not product screenshots.

LEADSEDGE and BROADIGO were proposed in the brief but had no supporting facts. They remain in `futureProjects`, outside the public project list.

## Artwork and motion

The opening launch uses a native black aircraft silhouette and spectral trails to unzip a cobalt overlay in 2.12 seconds. The portfolio mounts immediately below it; the existing hero entrance starts during the opening. Reduced motion uses a brief fade. The overlay and its scroll lock are removed at completion, and client navigation does not replay it. See `SPLASH_QA.md` for behavior and checks.

The hero uses the supplied spectral portrait as an optimized transparent texture on a continuous Three.js relief. The source silhouette, spectral face lighting and dark bust remain recognizable. Relative depth is authored around visible head, face, chin, neck and shoulder landmarks; this is a limited-angle 2.5D approximation, not a full human reconstruction. The former globe component, rendering code, CSS, test and dependency have been removed. The glass envelope remains optimized through Next Image.

Hero-wide pointer coordinates update mutable targets through a clamped nonlinear curve and 0.03 dead zone. An upper-neck head pivot turns the hair, ear, face and jaw together by up to 9° yaw / 4.5° pitch; the bust follows more slowly at 2.6° / 1.3°. Face and optical groups inherit the head with small local additions. Smooth vertex weights keep the neck connected. Camera-compensated vertices preserve neutral projection. Face-local UV shifts reach five texture pixels horizontally and three vertically; red/blue separation stays below three pixels. GSAP owns the single ticker and unchanged entrance/scroll wrappers. Pointer events never update React state or create per-move tweens.

Tablet/mobile place the portrait below the hero copy and actions. Horizontal touch drags control yaw (110px reaches full range); intentional diagonal drags add small pitch. Touch uses 80% rotation range and eases back after release/cancel. Vertical gestures remain scroll-only, with pan-y/pinch-zoom and passive listeners. Pixel density is capped at 1.75 on desktop and 1.25 on compact/coarse-pointer screens. One shared geometry has 31,360 triangles on desktop and 10,240 in compact mode, rendered in three passes without postprocessing. Offscreen and hidden-tab rendering pauses. Reduced motion renders one neutral dimensional frame. WebGL failure and context loss show the optimized transparent source. Cleanup disposes shared geometry, three materials, texture and renderer, removes ticker callbacks/listeners, and disconnects observers.

Display/body/metadata fonts are bundled locally from the freely licensed Inter, Geist and Geist Mono Fontsource packages. Their licenses are included in the respective installed packages.

The motion pass preserves the approved layout. Hero lines reveal in 1.3 seconds, with constrained ambient and pointer movement on desktop. Positioning type settles horizontally; capability dividers and content activate in sequence; project covers unfold through masks with independent scroll and hover layers. Workflow nodes and their connecting line activate once. Experience, education and toolkit use quieter reveals, followed by masked about/contact headlines and subtle envelope movement.

Mobile retains text, image masks and divider reveals, with no ambient loops, pointer effects or scrubbed parallax. Reduced-motion preferences disable GSAP effects and smooth scrolling. Offscreen/background-tab loops pause. Contexts, triggers and listeners clean up on navigation and breakpoint changes; completed entrances are remembered across resizing. Keyboard focus completes any relevant reveal immediately.

The separate background pass adds one optional WebGL wave behind the homepage. It uses a restrained six-color spectral palette with cobalt, mist, orange and cream illumination and preserves the GSAP content animations. GSAP adjusts section opacity; the renderer owns its animation clock. Mobile uses a smaller mesh, a 1× pixel-ratio cap and slower motion. Reduced motion keeps a static frame; unsupported WebGL and context loss show a CSS gradient. Hidden tabs and offscreen instances pause. No new dependencies are required.

The dot layer is a persistent irregular field inspired by the supplied Antigravity recording. Cobalt and mist-blue flecks, with only two dim orange points and one cream point, drift independently before any pointer movement. Moving the cursor pushes nearby existing dots aside and adds a soft curl and directional wake. The population stays fixed at 100–340 dots depending on viewport area; cursor movement never creates particles. The old fountain emitter, gravity and lifetime system have been removed. A transparent 2D canvas uses a 1.5× DPR cap and pauses offscreen or in hidden tabs. Touch devices, reduced-motion preferences and unavailable 2D rendering retain eight scattered CSS specks. All listeners and observers clean up on unmount.

## Quality checks

```sh
npm run typecheck
npm run lint
npm run build
npm run format
node scripts/test-gradient-wave.cjs
node scripts/test-dot-field.cjs
node scripts/test-spectral-human.mjs
node scripts/test-launch-splash.cjs
```

See `QA_REPORT.md` for the original build checks, `MOTION_QA.md` for the motion pass, and `BACKGROUND_QA.md` for the background integration. No API keys, database or environment variables are required. Contact links open the visitor's email client; the site does not send email itself.

## Before public deployment

- Add the final production URL to `site.website` and configure metadata for that domain.
- Enable indexing in `src/app/layout.tsx` when ready. It is intentionally disabled for this local preview.
- Replace illustrations with approved screenshots if desired.
- Add LinkedIn when its URL is supplied.

The site has **not** been published externally.

## Design records

- `DESIGN_INTERPRETATION.md`
- `IMPLEMENTATION_PLAN.md`
- `References/reference-notes.md`
- `public/design-review.html` — static composition review prepared with the Visualize skill
- `public/motion-study.html` — replayable system choreography study
- `HERO_SPECTRAL_QA.md` — portrait integration, source processing, lifecycle and responsive checks
- `GLOBE_QA.md` — historical record of the superseded globe


## Spectral Cobalt

See COLOR_SYSTEM.md for the shared palette, usage rules, color audit and contrast checks. The color pass preserves the approved layout and interactions.


See ATMOSPHERE_QA.md for the focused background correction and four-tone environmental lighting.

