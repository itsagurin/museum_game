# Dom Opowieści implementation

Approved specification: conversation plan, 2026-10-10. Polish UI; Next.js App Router static export; one illustrated house; three chapters (Stańczyk, Bociany, Konstytucja 3 maja); coloring placeholder; demo completion; rewards, stories, local progress, audio, responsive layouts. No backend, authentication, coloring engine, or deployment.

## Task 1: Bootstrap and progress domain
Initialize Next.js, React, TypeScript, Tailwind, Motion, Zustand, Vitest, Playwright and local fonts without replacing existing documents. Write domain tests first for sequential unlocking, duplicate completion, corrupted persistence, unavailable storage, and reset; observe RED, implement minimal model, observe GREEN.
Interfaces: Artwork metadata, Progress v1, ArtworkExperience({artworkId,onComplete,onExit}).
Expected: npm test passes; npm run typecheck passes after bootstrap.

## Task 2: Illustrated responsive experience
Use UI UX Pro Max and ImageGen. Build welcome, entering, intro, house, artwork placeholder, story panel, reward and finale. Write browser acceptance tests first for complete three-chapter journey, persisted progress, reset, keyboard dialog focus and responsive no-overflow; observe RED before implementing UI.
Interfaces: domain from Task 1; static chapter content with primary sources; local scene assets; browser-safe client hydration.
Expected: full browser journey passes at desktop and mobile; 360, 390, 768 and 1440 screenshots inspected.

## Task 3: Audio, resilience and delivery
Test settings and media lifecycle first. Add opt-in synthesized ambient sound/effects, reduced motion, fallbacks and background pause. Update documentation to match the implemented Polish concept. Run tests, lint, typecheck, build, diff check and fresh agent review.
Interfaces: settings persisted by domain; single audio owner; browser visibility state.
Expected: unit and browser suites pass, static export succeeds, no browser console errors; no publication.
