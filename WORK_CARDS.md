# Project cards and collection

## Current content

- Home: dashboard → fitness app → Voice & text bot → all work.
- `/work`: seven screenshot-backed projects. The three older résumé-only project cards and their detail routes are removed.
- Existing voice workflow URL is retained; its displayed title and copy now cover voice, chat, booking and confirmation email automation.
- Reviews: two supplied comments, lightly polished and attributed to Angela Horga and Mobi Shair. A rounded mosaic mixes ivory quote cards, an orange title tile and project previews.
- Additional suggested wording is in `REVIEW_DRAFTS.md`; it is not imported into the public site.

## Interaction

`src/components/ui/scrollable-card-stack.tsx` uses a native sticky scroll track. Scrolling down advances four stacked cards with a downward exit animation. At the end, the stack leaves the viewport and flows directly into System Approach. Reviews follow System Approach.

The page never intercepts wheel input. Buttons, arrows, keyboard navigation and horizontal swipes select the corresponding scroll position. Inactive cards are inert. Reduced-motion and short-height layouts use manual navigation without a tall scroll track. The existing hero and GSAP animations are unchanged.

## Assets

`scripts/prepare-project-assets.cjs` removes the supplied cobalt presentation margins and creates `*-focus.webp` derivatives. Original screenshots remain untouched in `Projects/`. All featured cards, archive cards and detail galleries use these larger cropped previews on subdued dark backgrounds. Information Mail and Personalized Outreach also include their supplied spreadsheet screenshots, as requested. Pass project slugs to the preparation script to regenerate only selected projects.

Data lives in `src/data/screenshot-projects.ts`, `src/data/projects.ts` and `src/data/reviews.ts`. Styling is scoped in `src/app/work.css`.

## Verification

- Production build passes and generates seven project routes.
- ESLint passes.
- Browser visual and interaction checks are recorded in the task response.

- Browser checked at 1440, 1280, 768 and 390px: no horizontal overflow; mobile cards tightened, native scroll advances cards and releases into System Approach. Workflow filter returns the three remaining workflow projects. Console reported no warnings/errors. Screenshot: work/project-review/reviews-final.png. Native touch and OS reduced-motion settings were not exercised on a physical device.

## Complete image audit
All 35 supplied PNGs now appear in their related galleries: Company Command Center 7, Daily Fitness 6, Voice & text bot 5, Client & Admin Portal 11, MGC Sales Assistant 2, Information Mail 2, Personalized Outreach 2. Includes spreadsheets, chat and confirmation screens, sign-in screens and supplied portal introduction images. Every image opens full-size.
