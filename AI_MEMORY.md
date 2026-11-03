# AI_MEMORY — aktualne reguły projektu Dziedzictwo

> Krótka pamięć dla ludzi i agentów AI. Plan prac: [docs/14_PLAN_ROZWOJU.md](./docs/14_PLAN_ROZWOJU.md). Pełna pamięć z hackathonu (z koncepcjami, które już nie obowiązują): [docs/archive/AI_MEMORY_HACKATHON.md](./docs/archive/AI_MEMORY_HACKATHON.md).

## Produkt

- Pełnoekranowa gra mobile-first: dom z zewnątrz → hol z czterema drzwiami → pokoje epok I–IV (Oświecenie, Romantyzm, Pozytywizm, Młoda Polska) → pracownia kolorowania.
- Nieukończony obraz to przetarta kartka z czerwonym krzyżykiem (`blank_paper_crossmark.jpg`). Po ukończeniu planszy odsłania się zachowana reprodukcja (nie rekonstrukcja z pikseli), a karta pokazuje ciekawostkę.
- Polski domyślnie, przełącznik EN. Treści dzieł są na razie tylko po polsku (`contentLanguage: "pl"`).
- Lokalny zapis wystarcza; bez kont i backendu, dopóki plan tego nie zmieni.

## Reguły, których nie wolno łamać

- **Siatki 32×32 i palety z JSON-ów są nienaruszalne** w aplikacji. Nie przeliczaj ich do 20×20 i nie zmieniaj kolorów. Zmiany plansz robi generator.
- **ID dzieł zależą od ścieżki pliku** w `img/eraN_<epoka>/` (`eras.ts`). Zmiana nazwy pliku bez migracji kasuje ukończenia i obsadę ścian graczy. Pięć dawnych reprodukcji ma ID z `legacyCatalogIds`.
- Metadane i ciekawostki dopasowujemy po dokładnym `filename` (bez prefiksu `assets/artworks/`), nigdy po numerze ani kolejności. `01_01 copy.jpg` to osobne dzieło.
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
