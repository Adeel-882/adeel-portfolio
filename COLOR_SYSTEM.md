# Spectral Cobalt — color system

## Source of truth

`src/data/palette.json` owns the palette. `src/lib/colors.ts` exposes the same values to Canvas and WebGL, and the root layout supplies them as `--color-*` CSS custom properties. Global CSS derives translucent borders, shadows and the small spectral gradient from those tokens. There is no Tailwind theme in this project.

## Audit and changes

- Replaced the old black/carbon/graphite/blue/text aliases and component-specific neutral and blue literals throughout production CSS.
- Optical ivory headings and blue-gray supporting copy replace the former cool white/neutral gray mix. Dim metadata uses **#7E89A2** instead of the proposed #69738C to preserve small-text contrast.
- Navigation stays neutral; only the wordmark period uses flare orange. Primary buttons stay cobalt with a 1px spectral lower edge on hover/focus. Secondary arrows can turn orange.
- The hero portrait preserves the source's full spectral face illumination over a dark bust. Its transparent texture is rendered as a shallow Three.js relief; it is not recolored into cobalt only.
- Persistent dots use approximately 60% cobalt and 40% mist blue among the cool dots, plus exactly two dim orange flecks and one dim cream fleck. Their motion and population behavior are unchanged.
- GradientWave uses six colors: near-black, deep base, cobalt, mist, orange and cream. Per-layer exposure and narrower warm noise peaks prevent broad bright fills. A static four-tone atmosphere also remains visible when WebGL is unavailable or motion is paused.
- Project covers are the existing CSS system illustrations, not client screenshots. Cobalt geometry gains selective violet edges; graphite voice/bot illustrations retain distinct forms. The supplied glass envelope image is untouched.
- Workflow pulse uses the spectral gradient within its existing 36px moving segment, now 2px high. The existing GSAP timing and architecture are unchanged. No GSAP color literals were present.
- Favicon colors mirror the shared palette because it is a standalone SVG document. Alpha-only black mask values are intentionally unchanged.
- Historical standalone design/motion/background studies and the unused automation-core illustration are not imported by the live application; they remain historical references.

## Usage rules

Keep surfaces almost black. Cobalt anchors actions and system states; violet enriches optical edges. Orange and cream support logo/signals/focus details and localized low-opacity environmental light. Mist blue softens the atmosphere. Do not use the spectral gradient on headings, card fills or whole buttons.

## Contrast checks

Ratios use WCAG relative luminance and the semantic foreground/background pairs. They are palette checks, not a claim of a full accessibility audit of animated imagery.

| Pair | Ratio |
| --- | ---: |
| Optical ivory / main background | 18.08:1 |
| Supporting text / elevated surface | 7.82:1 |
| Dim metadata / elevated surface | 5.38:1 |
| CTA text / cobalt | 7.07:1 |
| CTA text / brighter hover cobalt | 6.20:1 |
| Navigation / main background | 14.54:1 |
| Solar focus / brighter cobalt | 4.49:1 |

## Validation

- TypeScript, ESLint, production build and existing globe/dot/wave lifecycle tests passed.
- Browser checks cover 1440, 1280, 768 and 390px layouts, palette application and horizontal overflow.
- Desktop/tablet section review covers hero, navigation, capabilities, work, approach, background, toolkit, about and contact.
- Mobile menu, keyboard focus and preserved globe/dot rendering checked in the production build.
- The Visualize study provides a compact navigation/headline/CTA review with orange versus cream logo punctuation and the optical button edge. It is separate from the production interface.

Local preview: http://127.0.0.1:3001/. No public deployment was performed.

Final production review also confirmed the mobile clinical-wellness detail page, loaded artwork, all-ivory contact heading, working menu, solar keyboard focus, and no browser warnings/errors. The temporary viewport override was cleared after inspection.
