# Implementation and ownership

## Stack
Next.js App Router, React, TypeScript, GSAP + @gsap/react + ScrollTrigger. CSS for the responsive design system and simple hover states. Lucide utility icons. Locally bundled variable fonts. Original SVG hero; Next Image for the supplied glass asset and future project screenshots.

## Structure
- `src/data/site.ts`: main copy and contact details
- `src/data/projects.ts`: project records, case studies, gallery slots and future placeholders
- `src/data/experience.ts`: résumé and education
- `src/data/toolkit.ts`: confirmed tools by function
- `src/components`: header, hero, capabilities, work, process, background, contact and scoped motion
- `src/app/work/[slug]`: reusable project route with static generation
- `scripts/create-core.mjs`: original architecture source
- `References`: categorized non-destructive reference copies and interpretation notes

## Responsive plan
Desktop: oversized two-line title, artwork bleeding to the right, generous alignment, one dominant project then two supporting features. Tablet: simplified columns and fewer labels. Mobile: text and art stacked, hero explicitly repositioned, native disclosure navigation, vertical sections, three-column process rows. Check 1440, 1280, 768, 390 and 320 CSS pixels.

## Motion strategy
Use `useGSAP` with scoped selectors. `matchMedia` disables motion for reduced-motion preferences and limits pointer/scroll depth to desktop. Separate artwork wrappers prevent concurrent tweens from fighting over transforms. Revert media contexts and listeners on unmount. No global kill-all cleanup. Refresh only after font layout settles or actual viewport/layout changes.

## Verification
1. Review static composition in Browser.
2. Add motion and check section anchors, project navigation, mobile menu, process selection, contact and keyboard focus.
3. Inspect all requested widths and fix overflow or weak hierarchy.
4. Run production build, TypeScript, lint and production browser checks.
5. Document evidence and remaining asset limitations in `QA_REPORT.md`.

## Publication
Local build only. No hosting or publishing requested. Search indexing stays disabled until production URL and final assets are ready. Real project screenshots can replace illustrative covers through data; originals remain untouched.
