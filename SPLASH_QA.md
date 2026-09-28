# Spectral launch intro

## Implementation

- Native custom delta-wing SVG silhouette; the supplied JPEG is visual reference only and is not shipped as a splash background.
- One GSAP timeline: accelerating vertical flight (0.08–1.73s), hero release at 1.22s, opposing blue-panel translation from 1.69s, light dissipation ending at 2.12s.
- Two filled SVG regions leave a real transparent opening above the already-mounted portfolio. Their inner boundaries and spectral trails use exactly the same cubic paths. Three restrained inner strands remain anchored to the aircraft tail.
- Critical image decoding and local fonts are requested concurrently, capped at 220ms before launch. No extra Three.js scene or dependency is added.
- The existing hero entrance is paused only while the splash waits, then released by a single event. Existing entrance values, scroll timelines, typography, palette and spectral-human renderer are preserved.
- Document-local completion prevents replay on client navigation; full refresh can replay. Escape, Tab, viewport resize, preference changes and page departure finish safely. A 3s watchdog prevents a stalled overlay.
- Scroll overflow and body padding are saved and restored exactly. Scrollbar compensation preserves the underlying content width. Completion removes the overlay and immediately detaches event handlers/timers.
- Reduced motion uses a 0.30s fade, with no flight. No-JavaScript markup hides the decorative overlay. The splash is aria-hidden and never traps keyboard focus.

## Checks

- TypeScript, ESLint, production build and `node scripts/test-launch-splash.cjs`: pass.
- Geometry checked at 1440×1000, 1280×900, 768×1024 and 390×844: aircraft begins below and finishes entirely above; both panel edges match the light paths; strands stay attached; all values remain finite.
- Browser reloads at the four requested widths: cobalt initial coverage and eventual removal verified. Desktop in-flight rendering inspected; curved opening exposes actual site content and widens behind the silhouette. Refined overlapping center edges and scroll lock to remove the initial hairline and uncovered scrollbar gutter.
- Production CTA click reaches work. Opening a case study and returning via client history does not replay the splash. No splash remains, saved scroll styles are restored, and no production console warnings/errors were observed.
- Visualize study uses the same geometry and timeline, with replay and a moment scrubber. Mid-flight, upper opening and complete release inspected. It contains a compact illustrative hero; the real site remains the authority for layout and navigation.
- Lifecycle harness verifies completion/cleanup, double cleanup/setup, client remount, bounded asset wait, Escape/Tab, reduced-motion branch and watchdog. Reduced-motion and interrupted lifecycle checks are simulated, not physical-device GPU benchmarks.

## Files

- `src/components/SplashLaunch.tsx`: isolated lifecycle and SVG composition.
- `src/lib/launch-geometry.ts`: responsive shared seam geometry.
- `src/lib/launch-timeline.ts`: coordinated flight, opening and exit.
- `src/app/splash.css`: overlay-only styles.
- `public/splash/supersonic-aircraft.svg`: custom vector silhouette.
