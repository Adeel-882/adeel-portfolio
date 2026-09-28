# Motion pass — 15 September 2026

## Scope

Approved sections, hierarchy, palette and content preserved. Added animation wrappers, decorative lines and separate transform layers. No new dependencies, scroll hijacking, pinned sections, custom cursor or preloader.

Used the local GSAP React, ScrollTrigger, timeline and performance guidance, the bundled React example, and Karpathy engineering guidance.

## Choreography

| Area | Behavior |
| --- | --- |
| Hero | 1.3-second entrance; masked lines; 8px/4px ambient drift; 14px maximum opposite-pointer horizontal response; separate text/art scroll speeds |
| Navigation | 5px visual compaction during its scroll exit; existing underline hover preserved |
| Positioning | Alternating horizontal offsets with reduced mobile distances |
| Capabilities | Divider, number, title, description sequence; 9px desktop title hover |
| Work | Opposing title shifts; image crop reveal; inner scale 1.08 to 1; desktop internal parallax; 1.025 hover crop and 4px arrow movement |
| Cobalt feature | Additional 0.94-to-1 horizontal opening and slower graphic parallax |
| Approach | Masked headline; line draw; staggered nodes and labels; one travelling pulse; selection remains visitor-controlled |
| Background | Quiet row dividers, dates, roles and descriptions; lighter education movement |
| Toolkit | Category and individual tool opacity stagger; growing dividers |
| About / Contact | Masked lines; atmospheric about mark; envelope ambient and pointer layers; final button follows headline |
| Boundaries | Three single-play cobalt line accents; two faint desktop background lights |

## Verification performed

- TypeScript, ESLint and optimized Next production build passed.
- Browser: full top-to-bottom desktop (1440px) and mobile (390px) scroll passes, including intermediate motion screenshots and settled-state checks.
- No horizontal document overflow at 1440, 1280, 768, 390 or 320px. Measured client/scroll widths respectively: 1425/1425, 1265/1265, 753/753, 375/375, 305/305. No out-of-viewport heading bounds in the additional 1280/768/320 checks.
- Mobile project masks were initialized before entry and resolved to `none`; final text transforms settled to identity. Hero ambient and scroll layers had no transform on mobile/tablet.
- Completed sections remained visible when resizing from desktop to mobile. No unrevealed reading content remained after the full mobile scroll.
- Hero offscreen drift retained exactly the same transform across separate observations while the visible envelope continued moving.
- Desktop pointer test produced approximately -10.8px horizontal displacement when the pointer was on the right of the hero, within the 14px cap.
- Project hover was observed at scale 1.025. Artwork stays inside clipped panels with an unchanged opaque background, so parallax cannot expose a page-background gap.
- Workflow Route selection updated the description and pressed state correctly; decorative node animation did not alter React selection.
- Mobile Menu opened; Escape closed it. Email copy returned the success status.
- Fast Work navigation, clinical case-study navigation, and return to Work succeeded. Returned visible project masks were fully open with identity entrance scale.
- Production browser warning/error log was empty during final navigation checks.
- Visualize replay study: replay changed headline transforms and line progress; all six labels settled at opacity 1 and the pulse returned to opacity 0. Inspected at 736px and 358px content widths; mobile grid reflowed to three columns without overflow.

## Accessibility and lifecycle review

- Server-rendered content is visible without animation. Hidden states are created only inside the GSAP context.
- `prefers-reduced-motion` returns before animations are created; the pointer media query also excludes reduced motion. CSS disables decorative accents and movement on hover. The available Browser interface does not provide media-preference emulation, so OS-level reduced-motion behavior was source-reviewed, not visually emulated.
- One-time entrances are remembered across media-query changes. Restored scroll positions skip hiding reached content. Keyboard focus finishes the applicable entrance.
- GSAP contexts revert animations and ScrollTriggers. Custom focus, pointer, resize, scroll and document-visibility listeners are removed. No per-frame animation loops outside GSAP.
- Tests used browser viewport resizing, not a physical low-end phone or a frame-rate benchmark. No Lighthouse/performance score is claimed.

Production preview: http://127.0.0.1:3001/
