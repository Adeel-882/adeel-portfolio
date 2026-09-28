# Background correction — 26 September 2026

The new request supersedes the earlier cool-only environment rule. The UI palette, layout, typography, content, project artwork, COBE globe configuration and GSAP timings remain unchanged.

## Audit

The blue cast came from the five-color wave palette, navy-only CSS fallback, cobalt hero ambient light, violet about light and cobalt/violet particle population. These layers now share cobalt, mist blue, restrained orange and cream on the existing near-black base.

## Implementation

- The six-color wave applies per-layer exposure: deep base 1, cobalt .55, mist .16, flare .20 and solar .12. Warm noise floors are .52, versus .10 for the broader cool layers, limiting warm coverage.
- One static CSS atmosphere supplies offset radial lights: cobalt 9%, mist 7%, flare 10%, solar 7%. Desktop warmth sits above the globe and in a low cream streak. Tablet/mobile move the orange pocket toward the right edge and cream toward the lower left.
- Capabilities receive a 4% flare hint; approach a 3% solar hint; about a 5% mist hint. Existing dark section fades remain.
- Cool particles use roughly 60/40 cobalt/mist. Exactly two orange particles and one cream particle have reduced opacity. Static touch/reduced-motion specks include mist and one faint warm point.
- Existing rendering pause/cleanup and cursor physics remain. No added animation loop or event listener.

## Checks

TypeScript, ESLint, production build, existing dot and wave lifecycle tests passed. The tests additionally assert the warm particle cap and reduced warm wave exposure/coverage. Browser review at 1440, 1280, 768 and 390px confirmed dark reading areas, visible but localized warmth, an intact globe silhouette and no horizontal overflow. Later capabilities and system sections were reviewed as well as the hero. Reduced-motion/coarse-pointer lifecycle branches are simulated checks, not physical-device tests.

The Visualize study was updated to compare mixed spectral lighting with the previous cool-only treatment. Production preview: http://127.0.0.1:3001/.
