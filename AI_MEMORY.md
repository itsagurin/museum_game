# AI_MEMORY — aktualne reguły projektu Dziedzictwo

> Krótka pamięć dla ludzi i agentów AI. Plan prac: [docs/14_PLAN_ROZWOJU.md](./docs/14_PLAN_ROZWOJU.md). Pełna pamięć z hackathonu (z koncepcjami, które już nie obowiązują): [docs/archive/AI_MEMORY_HACKATHON.md](./docs/archive/AI_MEMORY_HACKATHON.md).

## Produkt

- Pełnoekranowa gra mobile-first: dom z zewnątrz → hol z czterema drzwiami → pokoje epok I–IV (Oświecenie, Romantyzm, Pozytywizm, Młoda Polska) → pracownia kolorowania.
- Nieukończony obraz to przetarta kartka z czerwonym krzyżykiem (`blank_paper_crossmark.jpg`). Po ukończeniu planszy odsłania się zachowana reprodukcja (nie rekonstrukcja z pikseli), a karta pokazuje ciekawostkę.
- Polski domyślnie, przełącznik EN. Tytuły, opisy i ciekawostki mają szkic tłumaczenia EN (`review.translation: "draft"`); brakujące EN wraca do polskiego tekstu oznaczonego `lang="pl"`.
- Lokalny zapis wystarcza; bez kont i backendu, dopóki plan tego nie zmieni.

## Reguły, których nie wolno łamać

- **Plansze generuje `tools/pixel-engine`** (`npm run content:puzzles`): v2 zachowuje proporcje obrazu (dłuższy bok 32 pola) i ma 6–10 kolorów. Aplikacja nie zmienia siatek ani palet. Nowa plansza unieważnia rozpoczęty obraz (`gridSignature`), ukończenia zostają.
- **Jedno źródło prawdy: `content/artworks.json`.** Stałe ID (slugi), kolejność w epoce, ścieżki do reprodukcji/planszy/podglądu, teksty PL/EN, źródło z licencją i status recenzji. Stare ID z czasów hackathonu są w `legacyIds` i mapowane przy wczytaniu zapisu (`legacyArtworkIds`), więc nazwy plików można zmieniać, aktualizując manifest. Walidacja: `npm run content:validate`.
- **Progresja pokoju:** poziomy 0–9 z nieliniowych progów `getLevelThresholds` (`src/lib/room-development.ts`): pierwszy obraz daje poziom 1, poziom 9 wymaga całej kolekcji epoki. Ponowne ukończenie nic nie przyznaje.
- **Blokady epok:** epoka I otwarta; każda następna otwiera się po poziomie `ERA_UNLOCK_LEVEL` (3) w poprzedniej (`getEraAccess`). Dotyczy holu, drzwi w pokojach, przełącznika epok, adresów `/#era-N` (przekierowanie do holu) i biblioteki. Ustawienie `exploreAll` („Otwórz wszystkie epoki”) zdejmuje blokady.
- **Kamienie milowe** (nowa epoka, ukończona epoka, finał) pokazują się po zamknięciu karty obrazu. Stan jest zapisany wcześniej; okna tylko go prezentują.
- **Postęp planszy** zapisuje `src/store/usePaintingProgress.ts` w osobnym kluczu `heritage-paintings-v1`: bitset pomalowanych pól na obraz plus `gridSignature`, więc zmieniona plansza nie dostaje starego stanu. Zapis po 0,8 s przerwy i przy `pagehide`; po ukończeniu wpis jest usuwany. Stan nagród wynika z ukończeń; animacje tylko go prezentują.
- **Dom i hol:** `house{N}.jpg`, gdzie N to liczba ukończonych epok. Hol: 0 → `hall1`, 1 → `hall2`, 2 → `hall3`, 3–4 → `hall4`. Każdy wariant holu ma własne współrzędne drzwi w `src/data/halls.ts`.
- **Perspektywa ram** pochodzi z `Era.wallPerspective` i `src/lib/scene-projection.ts` (`matrix3d`). Nie przywracaj `skewY` ani obrotów.
- **Dekoracje:** 47 PNG z czterech folderów `*_assets`, poziom 0 pusty. Ramy `12/13/14-rama-*` są pominięte. Pozycje, podpory (`supportId` + `contact`) i źródła w `src/data/room-decorations.ts`. Geometria dotyku powstaje z kanału alfa (`scripts/decoration-geometry.mjs`). Nie animuj nagród przy wczytaniu zapisu.
- **Grafiki:** oryginały w `img/` nie są modyfikowane. `prepare-assets.mjs` publikuje do `public/art/` tylko używane pliki, zmniejszone i skompresowane, z miniaturami `_thumbs/*.webp`. Nowy rodzaj assetu wymaga dopisania wzorca w `publishedAssets`.
- Narzędzia DEV (szybkie wypełnianie koloru, podgląd pokoju 9/9) tylko w `npm run dev` lub przy `NEXT_PUBLIC_ENABLE_DEV_TOOLS=1`. Nie zmieniają zapisu.

## Standardy

- Kod, komentarze i nazwy po angielsku; treści i dokumentacja po polsku.
- Dane gry w `src/data/`, czyste reguły w `src/lib/` z testami Vitest, komponenty tylko je wywołują.
- Każda zmiana zachowania ma test: jednostkowy dla reguł, Playwright dla przepływu (projekty mobile i desktop).
- Przed oddaniem zmiany: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e`.
- Zmiana formatu zapisu wymaga podbicia `version` w `persist` i funkcji `migrate` z testem.

## Poprawki po fazie 2

- Sceny: `src/features/scenes/`; nagłówek i panele: `src/features/shell/`; hooki progresji: `src/features/progression/`. `HeritageApp` tylko je składa. Komponenty mają do 300 linii.
- CSS obszarów jest importowany z `layout.tsx`: globals → shell → scenes → room → dialogs → progress → coloring → library → decorations. Po zmianie kaskady porównaj telefon i desktop.
- E2E eksportu uruchamiaj na osobnym porcie (`PLAYWRIGHT_PORT=3102`), a DEV na 3000. Równoczesne przebiegi wymagają osobnych `--output`, inaczej Playwright usuwa raport drugiego przebiegu. Nie buduj i nie edytuj źródeł podczas testów DEV (HMR przeładowuje karty).

- A2: przed wczytaniem obu magazynów pokazujemy neutralne tło z `aria-busy`; hash jest źródłem widoku przez `useSyncExternalStore`. `noscript` zachowuje wyśrodkowany dom dla przeglądarek bez JS. Nawigacja zachowuje metadane historii Next.
- A4–A5: plansze v2 mają unikalne nazwy `name` PL / `nameEn` EN. Manifest zawiera `puzzleVersion` zgodne z FNV-1a `gridSignature`; merge odrzuca niezgodne postępy, ale zachowuje ukończenia i ściany. Same nazwy nie zmieniają sygnatury. Zestaw sygnatur Fazy 2 chroni 83 siatki i palety przed przypadkową zmianą.

- A7: pierwsza pracownia pokazuje trzy zamykane podpowiedzi. `tutorialSeen` zapisywane przy zamknięciu pracowni, ukończeniu lub odrzuceniu podpowiedzi. Zapisane intro ma własną sygnaturę; zapis pełnej planszy ma pierwszeństwo. Testy katalogu świadomie ustawiają `tutorialSeen`, aby sprawdzać pełne plansze; samouczek ma osobny e2e nowego gracza.
- A8: `highContrast` respektuje `prefers-contrast: more`, jest walidowane w merge i ustawiane na `html` (dialogi są portalami). Pracownia obsługuje strzałki. `tests/a11y.spec.ts` nie dopuszcza serious/critical, bez wyłączeń reguł.

- A10: po obejrzeniu raportu użytkownik zatwierdził bok 40 dla pięciu panoram >2:1. Ich `puzzleSettings.longEdge=40` musi być respektowane przy standardowym `content:puzzles`. Nowe sygnatury są w `panorama-board-signatures.json`; 78 pozostałych pełnych plansz chroni wzorzec Fazy 2. Zmienione panoramy tracą rozpoczęty bitset, nigdy ukończenia ani ściany.
- A9: dopasowanie obrazu do źródła nie jest recenzją treści. Propozycje korekt wpisuj do docs/15. A11 opisuje opcje migracji binariów; nic nie wykonano.

- B1: produkcyjny build uruchamia Workbox po eksporcie. Sceny, miniatury, fonty i shell są precache; reprodukcje/dekoracje CacheFirst, plansze SWR. Adres planszy zawiera `?v=puzzleVersion`, aby nowy manifest nie dostał starej siatki z cache. Audio poza cache.
- Service worker nie aktywuje nowej wersji automatycznie: komunikat → SKIP_WAITING → reload dopiero po kliknięciu. E2E bazowo blokują SW, aby sterować błędami fetch; `pwa.spec` jawnie je włącza i sprawdza prawdziwy offline.

- B2: wybór dnia jest deterministyczny dla lokalnej daty i otwartych epok, a `dailySelection` utrwala go także po ukończeniu. `dailyHistory` waliduje rzeczywiste daty, usuwa duplikaty i zachowuje 60 wpisów. Przerwa nie odbiera nagród.
- B3: 21 odznak w `content/badges.json` (4 epok, 12 artystów, 4 progów i całość). Reguły działają na unikalnych znanych ukończeniach; artyści liczą się przez epoki. Nowe odznaki trafiają do kolejki po historii. E2E jawnie potwierdzają odznaki przed dalszą nawigacją; asercje starych nagród pozostają.
