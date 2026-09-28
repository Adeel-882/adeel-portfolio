# Portfolio QA — 15 September 2026

## Completed checks

- Production build: passes; homepage, not-found page and all three case studies generated successfully.
- TypeScript: passes, including the production build's type check.
- ESLint: passes without warnings after replacing the plain hero image with Next Image.
- Dependency versions are pinned and the lockfile is synchronized.
- Source formatted with Prettier.
- All seven reference images visually inspected. Original Assets folder unchanged.
- Live Browser inspection of Muradov, BilloDesign and Eliaquim completed.
- Browser review of hero, capabilities, selected work, process and contact completed.
- Visualize composition fragment rendered through the skill's sandboxed preview wrapper and visually inspected at desktop and mobile widths. Original architectural SVG is present in both views; no fragment overflow.

## Responsive measurements

Measurements from the running app. The browser reserves 15px for its vertical scrollbar.

| Viewport width | Document client width | Document scroll width | Out-of-bounds headings |
| --- | --- | --- | --- |
| 1440 | 1425 | 1425 | None |
| 1280 | 1265 | 1265 | None |
| 768 | 753 | 753 | None |
| 390 | 375 | 375 | None |
| 320 | 305 | 305 | None |

Hero artwork intentionally bleeds inside its clipped container. This does not produce document overflow. Tablet and mobile compositions were visually reviewed, not inferred only from these measurements.

## Fixes made during review

1. Mobile headline was too small: enlarged the display type and adjusted hero artwork placement.
2. Work section squeezed its description into a narrow column at 320px: stacked the heading and description, eliminating the horizontal scrollbar.
3. Small capability controls: increased mobile targets to at least 44px.
4. Project graphics were too similar: gave the voice-agent feature a distinct acoustic form.
5. Case study showed an empty gallery label and decorative action arrow: omitted empty galleries and removed the non-interactive arrow.
6. Framework warned about smooth-scroll route transitions: added the documented `data-scroll-behavior` marker.
7. Escape handler could move focus while the menu was already closed: scope the handler to the open menu only.
8. Removed the temporary unsent-brief workflow once Adeel supplied his email.

## Interaction checks

- Work navigation scrolls to selected work.
- Mobile menu opens; selecting a navigation link collapses it.
- Clinical case-study link opens the correct route and renders the résumé-grounded content.
- All work returns to the project index.
- Process step selection updates the accessible pressed state and live detail text; Route was exercised in Browser.
- Email copy displays its success state. The visible email and mailto address match the supplied résumé.
- Back to top returns to the hero.
- Hero and contact images load successfully.

## Performance and accessibility design

- Architectural asset: 13,067 bytes; no video or WebGL.
- Supplied envelope original: 43,165 bytes; responsive Next Image delivery with lazy loading.
- Locally bundled fonts; no runtime font CDN requirement.
- Mostly server-rendered content, with client components only for navigation, process controls, contact copy and motion.
- Semantic landmarks/headings, labelled controls, skip link, visible focus, real links and responsive touch targets.
- GSAP media contexts revert effects on breakpoint changes and unmount. Pointer listeners are removed. Slow drift pauses offscreen.
- Reduced-motion behavior is implemented and reviewed in source; the available Browser API does not expose reduced-motion emulation. No claim of an emulated reduced-motion device run.

## Practical limits

- Testing used the Codex Chromium-based Browser; physical iOS Safari and Android devices were not available.
- No Lighthouse score or field Core Web Vitals result is claimed.
- Project covers are labelled system illustrations. Product screenshots, a portrait and LinkedIn URL have not been supplied.
- Project outcomes are limited to the supplied résumé. No invented client savings, revenue, testimonials or clinical efficacy claims.
- Contact opens the visitor's email client; this website does not itself submit email.
- Public hosting was not requested. Search indexing is disabled for this local preview.

## Final production verification

The final build passed after the keyboard-focus fix. A production server was started at `http://127.0.0.1:3001` and inspected in Browser.

- Production mobile menu: opens and closes with Escape; focus returns to Menu; `aria-expanded` returns to false.
- Production mobile layout: 375px client and scroll widths at a 390px viewport, with no active hero animation transform.
- Production desktop layout: 1425px client and scroll widths at a 1440px viewport; GSAP drift initializes on the image layer.
- Dental voice-agent and restaurant WhatsApp case-study routes render their intended headings and complete content.
- No empty Gallery heading or nonfunctional cover arrow remains on case-study pages.
- Final production console inspection returned no warnings or errors.
- Static Visualize composition links target the production preview.

Development remains available on port 3000; the reviewed production preview is on port 3001. Both are local-only services.
