# Dziedzictwo

**Pokoloruj sztukę. Odkryj historię. Ożyw swój dom.**

Przeglądarkowa gra mobile-first o polskim malarstwie. Gracz wchodzi do domu, wybiera jeden z czterech pokojów epok (Oświecenie, Romantyzm, Pozytywizm, Młoda Polska) i odnawia obrazy, kolorując je piksel po pikselu. Ukończone dzieło odsłania oryginał i ciekawostkę, trafia na ścianę, a pokój zyskuje kolejne wyposażenie. Projekt powstał na BEST Hacks 2026 (Code for Culture) i jest dalej rozwijany.

**83 dzieła · 4 epoki · 47 dekoracji · plansze o proporcjach obrazów · PL/EN**

## Uruchomienie

Wymagany Node.js 22.19+ (`.nvmrc`).

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
| `npm run audit` | LHCI (3 przebiegi), pięć widoków, interakcje 992 pól i kontrola instalowalności PWA |
| `npm run lint`, `npm run typecheck` | ESLint i TypeScript |

Narzędzia DEV (szybkie kolorowanie, podgląd pokoju 9/9) są widoczne w `npm run dev` lub w buildzie z `NEXT_PUBLIC_ENABLE_DEV_TOOLS=1`. Hosting pod podścieżką: `NEXT_PUBLIC_BASE_PATH=/nazwa npm run build`.

## Jak to działa

- **Next.js 16 (eksport statyczny), React 19, TypeScript, Tailwind 4, Zustand, Framer Motion.** Bez backendu; postęp w `localStorage`.
- **Grafiki źródłowe** leżą w `img/`. `scripts/prepare-assets.mjs` publikuje do `public/art/` tylko używane pliki, zmniejsza je, tworzy AVIF scen, miniatury biblioteki, wymiary obrazów i manifest `src/data/asset-manifest.json`. `public/art/` jest generowany i ignorowany przez Git.
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

Pięć panoram >2:1 ma bok 40 (ustawienie w manifeście), reszta bok 32, intro 16. Raport proporcji: `docs/reports/puzzle-proportions.html`; odtworzenie: `cd tools/pixel-engine && .venv/bin/python -m src.compare_proportions --root ../.. --report outputs/proportions.html`. Raport postępu: `docs/17_RAPORT_POPRAWEK.md`.

## PWA

`npm run build` tworzy ikony z własnej ilustracji domu i service workera Workbox w `out/`. Instalacja wymaga HTTPS lub localhost. Cache startowy ma ok. 6 MB; reprodukcje i plansze są pobierane przy otwieraniu. Odwiedzona plansza działa offline. Aktualizacja czeka na przycisk „Odśwież”. Ikony: `content/icons.json`; pliki: `scripts/make-icons.mjs`, `scripts/build-sw.mjs`.

Na Vercelu `sw.js` ma nagłówek `Cache-Control: no-cache` przez `vercel.json`. Działanie z `NEXT_PUBLIC_BASE_PATH=/museum` sprawdzono osobnym buildem i przeładowaniem offline. Ręczna instalacja na fizycznym Androidzie/iOS pozostaje do wykonania przez zespół.

Obraz dnia na ekranie domu wybiera nieukończone dzieło z otwartych epok i zachowuje je do końca lokalnego dnia. Historia 60 dat i łagodna seria pozostają na urządzeniu. Biblioteka ma zakładkę „Album”: postęp epok, artystów i 21 odznak. Definicje: `content/badges.json`; reguły: `src/lib/daily.ts`, `src/lib/badges.ts`.

Ukończone dzieło ma przycisk „Udostępnij”, a finał certyfikat PNG z opcjonalnym imieniem. Oba pliki powstają lokalnie na canvas, z fontami gry; bez wysyłania obrazu ani imienia na serwer. Brak Web Share powoduje pobranie. Reguły tekstu i eksportu: `src/lib/share-card.ts`.

Muzyka: pięć zatwierdzonych nagrań CC0, razem ok. 10,6 MB; domyślnie wyłączona. Ustawienia pozwalają sterować muzyką, głośnością i osobno efektami pędzla. Nagrania i licencje: `content/audio.json`, wybór: `docs/19_MUZYKA_PROPOZYCJE.md`. Przenikanie dwóch kanałów trwa 1,5 s; muzyka pauzuje po ukryciu karty i jest ciszej w pracowni. Audio nie trafia do cache PWA.

## Statystyki (gotowe do późniejszej aktywacji)

Integracja Vercel jest domyślnie nieaktywna bez konfiguracji. Właściciel z planem Pro/Enterprise może włączyć Web Analytics i ustawić zmienne z `.env.example`; ta praca nie aktywuje usługi ani płatnego planu. Preferencja gracza pozwala wyłączyć statystyki. Wysyłane mogą być wyłącznie enumy i flagi gry, bez imienia certyfikatu i wolnego tekstu. Definicje, budżety czasów i ograniczenia retencji: `docs/18_METRYKI.md`. Testy `tests/analytics.spec.ts` przechwytują dostawcę lokalnie.

Materiały do badań 5–8 osób: `docs/user-testing/` (scenariusz, moderator, zgoda, obserwacje, SUS, quiz po tygodniu, szablon wyników). Przed użyciem zespół uzupełnia dane administratora i terminy retencji, uzgadnia kontakt oraz klucz quizu. Pliki są szablonami, nie raportem rzeczywistych badań.

## Wydajność i pliki generowane

`npm run build` → `npx playwright install chromium` → `npm run audit` (Node 22.19+, OpenSSL). LHCI ma progi Performance 90, Accessibility/Best Practices 95, LCP 2,5 s, CLS 0,1 i transfer 1,5 MB. LHCI i `audit:scenes` używają lokalnego serwera HTTP/2 z prekompresją Brotli 11 i tymczasowym certyfikatem. Wyjątek certyfikatu dotyczy wyłącznie narzędzi pomiarowych na localhost. `audit:scenes` uruchamia własny serwer eksportu; istniejący można wskazać przez `AUDIT_URL=http://127.0.0.1:3101`. Raporty HTML/JSON i czasy interakcji trafiają do `.lighthouseci/`; nie są commitowane. Wyniki i spełnienie poszczególnych celów: [raport pomiarów](docs/reports/performance.md).

Pracownia, panele i dekoracje są ładowane oddzielnie. Lekki interfejs biblioteki jest w głównym pakiecie, aby usunąć dodatkowe żądanie na ścieżce do LCP; opisy, reprodukcje i miniatury poza ekranem są odroczone. Sceny mają łagodne wejście CSS, a silnik animacji jest dołączany z panelami i pracownią. Kod pracowni i JSON planszy pobierają się równolegle po wyborze obrazu; dostępny ekran oczekiwania pozwala zamknąć okno i zachowuje fokus. `content-summaries.json` oraz `image-sizes.json` powstają z manifestu i obrazów w `prepare-assets`; nie edytuj ich. Atrybucja jest dostępna w metadanych początkowych; opisy są w osobnym pakiecie otwieranym z kartą. Eksport PNG czeka na pełne metadane i fonty dla rysowanego tekstu. `npm run dev` obserwuje `img/`, `content/` i źródła tekstów.

Sceny są publikowane w `public/art/_scenes/` jako AVIF; `assetUrl()` mapuje na nie nazwy źródłowych JPEG. Oryginały w `img/` pozostają bez zmian. `public/fonts/` i `fonts-generated.css` powstają z lokalnych paczek @fontsource: wyłącznie WOFF2 Latin/Latin Extended z zakresami Unicode. Waga 600 zawiera znaki z tekstów UI i manifestu; pozostałe podzbiory, w tym font imienia certyfikatu, pozostają pełne. DM Sans: [źródło](https://github.com/googlefonts/dm-fonts), [OFL](content/licenses/DM-Sans-OFL.txt); Cormorant Garamond: [źródło](https://github.com/CatharsisFonts/Cormorant), [OFL](content/licenses/Cormorant-Garamond-OFL.txt). Kopie licencji są też w eksporcie.
