# Reference audit

All seven originals in `Assets/` were visually inspected and left untouched. Copies are categorized below.

| Reference | Interpretation | Use / exclusions |
|---|---|---|
| glass-cursor.jpeg | Thick optical edges; mostly blue reflections | Material only. The baked-in “transparent background” text is not reproduced. |
| glass-envelope.jpeg | Clear glass, white edge reflections, restrained spectral glints | Contact artwork; optimized by Next Image. |
| glass-butterfly.jpeg | Fragmentation and refraction | Material reference only; no butterfly mascot. |
| spectral-light.jpeg | Chromatic edges against deep black | Informs isolated glass accents, never rainbow UI. |
| blue-flight-light.jpeg | Cobalt atmosphere and directional energy | Palette and movement reference; aircraft not used. |
| optical-object.jpeg | Isolated glass key and negative space | Informs scale and optical bridge; no scattered floating icons. |
| directional-light-trail.jpeg | Contained forward motion | Informs connected light channels; aircraft not used. |

## Live website review

- [Muradov](https://www.muradov.design/?ref=onepagelove): inspected in Browser. Large type, project-first hierarchy, role metadata, quiet navigation. Its résumé metrics are not copied.
- [BilloDesign listing](https://webflow.com/made-in-webflow/website/billodesign) and [live site](https://billodesign.webflow.io): inspected live after the listing navigation timed out. Dark-space hero and responsive object personality informed depth. No orb, sound, mascot, preloader or Spline runtime adopted.
- [Eliaquim listing](https://www.framer.com/marketplace/templates/eliaquim/) and [live preview](https://eliaquimmiguel.framer.website/): inspected in Browser. Edge-scale typography and spacious project compositions informed rhythm. No orbiting screenshot carousel or copied template assets.

## Asset gaps resolved

No architectural hero render, licensed commercial display font, portrait or project screenshot was supplied. The second brief explicitly allows web-native architecture, so an original static SVG with three hollow structural frames and connecting bridges is used. The render source is `scripts/create-core.mjs`. Standard HTML transforms animate the whole artwork; the geometry is never distorted.

Project covers are clearly labelled SYSTEM ILLUSTRATION. They are conceptual graphics, not fabricated product screenshots. Actual résumé facts supplied during the build replace the initial placeholders. LEADSEDGE and BROADIGO remain unpublished data placeholders.

## Skill findings

The actual Karpathy directory is `Skills/andrej-karpathy-skills-main`, not `andrei-...`. Read its README, SKILL and EXAMPLES. Applied explicit assumptions, simplicity, limited abstractions and verifiable completion criteria.

Recursively inventoried GSAP skills and examples. Read core, React, performance, ScrollTrigger, timeline, utility guidance and the React demo. Relevant instructions: scoped useGSAP, matchMedia for reduced motion and responsive setup, context cleanup, transform/opacity animation, quickTo for pointer input, refresh after fonts, top-level ScrollTriggers, no layout animation or permanent global animation state.
