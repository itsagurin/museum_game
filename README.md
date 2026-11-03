# Dziedzictwo

**Pokoloruj sztukę. Odkryj historię. Ożyw swój dom.**

Przeglądarkowa gra mobile-first o polskim malarstwie. Gracz wchodzi do domu, wybiera jeden z czterech pokojów epok (Oświecenie, Romantyzm, Pozytywizm, Młoda Polska) i odnawia obrazy, kolorując je piksel po pikselu. Ukończone dzieło odsłania oryginał i ciekawostkę, trafia na ścianę, a pokój zyskuje kolejne wyposażenie. Projekt powstał na BEST Hacks 2026 (Code for Culture) i jest dalej rozwijany.

**83 dzieła · 4 epoki · 47 dekoracji · plansze o proporcjach obrazów · PL/EN**

## Uruchomienie

Wymagany Node.js 22.12+ (`.nvmrc`).

```bash
npm ci
npm run dev        # http://localhost:3000, obserwuje img/
```

| Polecenie | Działanie |
| --- | --- |
| `npm run build` | Przygotowuje grafiki i tworzy statyczny eksport w `out/` |
| `npm run preview` | Serwuje `out/` lokalnie |
| `npm test` | Testy jednostkowe (Vitest) |
| `npm run test:e2e` | Testy przeglądarkowe (Playwright, mobile + desktop) na `out/` |
| `npm run lint`, `npm run typecheck` | ESLint i TypeScript |

Narzędzia DEV (szybkie kolorowanie, podgląd pokoju 9/9) są widoczne w `npm run dev` lub w buildzie z `NEXT_PUBLIC_ENABLE_DEV_TOOLS=1`. Hosting pod podścieżką: `NEXT_PUBLIC_BASE_PATH=/nazwa npm run build`.

## Jak to działa

- **Next.js 16 (eksport statyczny), React 19, TypeScript, Tailwind 4, Zustand, Framer Motion.** Bez backendu; postęp w `localStorage`.
- **Grafiki źródłowe** leżą w `img/`. `scripts/prepare-assets.mjs` publikuje do `public/art/` tylko używane pliki, zmniejsza je, tworzy miniatury biblioteki i manifest `src/data/asset-manifest.json`. `public/art/` jest generowany i ignorowany przez Git.
- **Kolekcja** jest opisana w `content/artworks.json`: stałe ID, kolejność, reprodukcja w `img/eraN_<epoka>/`, plansza i podgląd w `img/puzzles/`, teksty PL/EN, źródło z licencją i status recenzji. `npm run content:validate` sprawdza manifest.
- **Plansze** generuje `tools/pixel-engine/` (Python, K-Means w CIELAB, proporcje obrazu, 6–10 kolorów): `npm run content:puzzles`. Kod pochodzi z repozytorium `wojgww/image_generation` i jest dołączony z historią.

| Obszar | Pliki |
| --- | --- |
| Nawigacja i sceny | `src/components/HeritageApp.tsx`, `src/features/scenes/`, `src/features/shell/`, `GameViewport.tsx`, `src/hooks/useSceneNavigation.ts` |
| Pracownia kolorowania | `src/components/HeritageGame.tsx`, `coloring-canvas.tsx`, `src/lib/coloring.ts` |
| Epoki, kolekcja, hol | `content/artworks.json`, `src/data/eras.ts`, `src/data/halls.ts` |
| Rozwój pokoju i dekoracje | `src/lib/room-development.ts`, `src/data/room-decorations.ts`, `RoomDecorations.tsx` |
| Biblioteka i ściany | `src/components/ArtworkLibrary.tsx`, `src/lib/wall-gallery.ts` |
| Zapis i ustawienia | `src/store/useGameStore.ts` (klucz `heritage-hearth-ui-v1`) |
| Teksty interfejsu | `src/data/copy.ts`, `src/data/coloring-copy.ts` |

## CI i wdrożenie

`.github/workflows/ci.yml` uruchamia lint, typecheck, testy (w tym walidację treści), build, Playwright i testy generatora plansz dla każdego PR i pusha na `main`. Wdrożenie prowadzi Vercel podłączony do repozytorium: `main` trafia na produkcję, a pull requesty dostają podglądy.

## Dokumentacja

| Plik | Zawartość |
| --- | --- |
| [`docs/14_PLAN_ROZWOJU.md`](./docs/14_PLAN_ROZWOJU.md) | **Plan rozwoju po hackathonie**: diagnoza, decyzje, fazy 0–4 |
| [`AI_MEMORY.md`](./AI_MEMORY.md) | Aktualne reguły i decyzje dla ludzi i agentów AI |
| [`docs/15_RECENZJA_TRESCI.md`](./docs/15_RECENZJA_TRESCI.md) | Recenzja treści: instrukcja, uwagi i tabela 83 dzieł ze źródłami |
| [`docs/16_PROMPT_POPRAWKI_I_FAZA_3.md`](./docs/16_PROMPT_POPRAWKI_I_FAZA_3.md) | Gotowy prompt dla agenta: poprawki po fazach 0–2 i Faza 3 |
| [`docs/10_FRONTEND_V1.md`](./docs/10_FRONTEND_V1.md) | Szczegóły frontendu, grafik i integracji kolorowania |
| [`docs/13_ROOM_DECORATIONS.md`](./docs/13_ROOM_DECORATIONS.md) | Dekoracje pokojów, poziomy i źródła |
| [`docs/07_CURRENT_PROJECT_PLAN.md`](./docs/07_CURRENT_PROJECT_PLAN.md) | Decyzje produktowe z hackathonu (ekrany, reguły progresji) |
| [`docs/08`](./docs/08_ASSET_PROMPTS_GOOGLE_FLOW.md), [`09`](./docs/09_ROOM_PROMPTS_CORNER_VIEW.md), [`11`](./docs/11_HALL_PROMPTS_FOUR_ERAS.md) | Prompty do generowania grafik w Google Flow |
| [`docs/ONE_PAGER.md`](./docs/ONE_PAGER.md) | One-pager z hackathonu |
| [`docs/archive/`](./docs/archive/) | Pierwotna koncepcja, harmonogram hackathonu i opis usuniętego prototypu |

Testowanie eksportu przy działającym dev: `PLAYWRIGHT_PORT=3102 npx playwright test`. Testy DEV: `PLAYWRIGHT_PORT=3000 npx playwright test tests/dev-coloring.spec.ts tests/dev-room-preview.spec.ts --output=/tmp/dziedzictwo-dev-results`. Nie uruchamiaj buildu podczas testów DEV.

Plansze v2 mają nazwy kolorów PL/EN i `puzzleVersion` w manifeście. Zapis postępu jest wczytywany tylko przy zgodnej sygnaturze; zmiana nazwy koloru nie unieważnia zapisu. Nieznane i uszkodzone wpisy są pomijane osobno.

Pierwszy obraz ma krótką planszę 16×12 z podpowiedziami. Ustawienia obejmują wysoki kontrast. Audyt: `npx playwright test tests/a11y.spec.ts tests/tutorial.spec.ts`; generator intro: `cd tools/pixel-engine && .venv/bin/python -m src.build_puzzles --root ../.. --only bellotto-widok-warszawy-strony-pragi --long-edge 16`.
