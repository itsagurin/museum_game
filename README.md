# Dom Opowieści

Minimalistyczne doświadczenie na BEST Hacks 2026. Wejdź do przytulnego domu, poznaj Iskrę i odkryj trzy historie polskiego malarstwa. Każda opowieść rozświetla pokój i dodaje nowy przedmiot.

## Uruchomienie

Node.js 22.13+ i npm (sprawdzone na Node.js 26.8.2).

```sh
npm ci
npm run dev
```

Otwórz http://localhost:3000. Bez kluczy API, kont i usług zewnętrznych.

## Produkcja

```sh
npm run build
npm start
```

Gotowe pliki są w `out/`. Można je umieścić na hostingu statycznym. `npm start` serwuje eksport na porcie 3000, `npm run preview` na 3002. Serwer Next.js nie jest potrzebny w produkcji.

## Funkcje

- Polski interfejs na telefon i laptop, szerokie i portretowe sceny.
- Wejście do domu, jednorazowe wprowadzenie i trzy kolejne rozdziały.
- Stańczyk → Bociany → Konstytucja 3 maja, opowieści z linkami do źródeł.
- Przedmioty-nagrody, rozświetlanie pokoju, finał i ponowne czytanie.
- Lokalny postęp, reset z potwierdzeniem, ograniczenie ruchu, opcjonalny ambient.
- Obsługa klawiatury, dialogi z fokusem i awaryjne tło.

**Pixel art:** wybierz kolor palety i dotknij lub przeciągnij po pasujących pikselach. Każda komórka grid to jeden niezależny kwadrat. Blady kolor podpowiada właściwą farbę; poprawne dopasowanie wypełnia piksel dokładnym hex palety. Błąd nie zmienia postępu. Dostępne są opcjonalne dźwięki, cofanie, powiększenie, tryb przesuwania, klawiatura i reduced motion. Opowieść otwiera się po wypełnieniu całej siatki.

Dane demonstracyjne w `public/artworks/*.json` mają kontrakt `id`, `title`, `artist`, `year` (string), `original_image_url`, `grid: { width, height, data }`, `palette: [{ id, hex, name }]` oraz `cultural_data: { trivia, historical_context }`. Komponent `ArtworkExperience` może też przyjąć otrzymany JSON jako opcjonalny prop `data`. Walidacja odrzuca nieznane kolory, błędne wymiary i nieprawidłowe adresy. Maksymalny rozmiar siatki: 128×128.

Trzy lokalne reprodukcje i ich źródła: `public/artworks/ATTRIBUTION.md`. Demo ma siatki o szerokości 32 pikseli i pięć kolorów. Renderer obsługuje wymiary i paletę otrzymane w JSON; nie używa original_image_url do rysowania płótna. Każdy piksel zachowuje kolor przypisany przez algorytm. Nieukończona sesja nie zapisuje się po wyjściu; ukończone historie pozostają zapisane.

## Weryfikacja

```sh
npm test
npm run typecheck
npm run lint
npx playwright install chromium
npm run test:e2e
npm run build
```

Chromium desktop/mobile: pełny cykl, zapis, reset, storage, rzeczywisty Web Audio, ograniczenie ruchu i klawiatura. Rozmiary: 360×800, 390×844, 768×1024, 1440×900 oraz 844×390.

## Architektura

[Aktualna implementacja](docs/07_IMPLEMENTATION.md) · [Kontekst agentów](AI_MEMORY.md)

Next.js App Router, React, TypeScript strict, Tailwind, Motion, Zustand. Jedna strona, brak backendu. Grafiki ImageGen jako lokalne WebP, Iskra w CSS, ambient w Web Audio bez pobierania mediów. Fonty lokalne z polskimi znakami.

Moduł kolorowania: `src/components/artwork-experience.tsx`, `src/components/coloring-canvas.tsx`, `src/lib/coloring.ts`.

Dokumenty `docs/01`–`docs/06` zachowują wcześniejsze pomysły, w tym nieaktualne EN, epoki i walutę. Obecną implementację opisują README oraz docs/07. UI UX Pro Max wykorzystano do wskazówek projektowych; kierunek wizualny wynika z zatwierdzonej koncepcji.
