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

## Plan zespołu na kolejną iterację

Powyżej opisano działającą implementację. Poniższy plan z repozytorium zdalnego opisuje kolejną iterację; jego pobranie nie oznacza wdrożenia tych funkcji.

> **Aktualna wizja (10.10.2026):** dom z zewnątrz → wejście przez drzwi → hol z czterema pokojami epok → kolorowanie obrazów po numerach na planszach 15×15. Każdy ukończony obraz automatycznie wyposaża pokój; ukończenie całego pokoju zmienia dom i odblokowuje następną epokę. Sceny są ilustracjami 2D. Zespół: cztery osoby, pozostałe 15 godzin w chwili ustalania planu.
>
> **Zacznij od [aktualnego planu projektu](./docs/07_CURRENT_PROJECT_PLAN.md)**. Zawiera ekrany, reguły, kontrakt algorytmu, podział prac, harmonogram i pytania. Starsze opisy poniżej zachowano jako kontekst pierwotnej koncepcji; przy rozbieżności obowiązuje nowy plan i odpowiedzi zespołu.

> **Wygląd nieukończonych obrazów:** przetarta biało-szara kartka papieru z czerwonym krzyżykiem w ramie. Po ukończeniu kolorowania kartkę zastępuje naturalny kolorowy obraz.

---

| Plik | Przeznaczenie |
| :--- | :--- |
| **[`docs/07_CURRENT_PROJECT_PLAN.md`](./docs/07_CURRENT_PROJECT_PLAN.md)** | **Aktualny plan:** cztery pokoje epok, plansze 15×15, automatyczna progresja, sprint 15h dla czterech osób i decyzje do ustalenia. |
| **[`AI_MEMORY.md`](./AI_MEMORY.md)** | **Pigułka pamięci AI**: Kontekst, reguły działania agenta, szybki indeks i standardy pracy. |
| **[`docs/01_VISION_AND_CONCEPT.md`](./docs/01_VISION_AND_CONCEPT.md)** | **Wizja i koncepcja**: Misja projektu, target persona (obcokrajowiec), dlaczego ten format działa. |
| **[`docs/02_GAME_DESIGN.md`](./docs/02_GAME_DESIGN.md)** | **Game Design Document (GDD)**: Pętla gry (Core Loop), mechanika kolorowanki, mechanika domu. |
| **[`docs/03_HISTORICAL_CURATION.md`](./docs/03_HISTORICAL_CURATION.md)** | **Baza kultury i historii**: Chronologiczne epoki, obrazy (m.in. Jan Matejko), struktura wiedzy i pop-upów. |
| **[`docs/04_TECHNICAL_ARCHITECTURE.md`](./docs/04_TECHNICAL_ARCHITECTURE.md)** | **Architektura techniczna**: Stack (React/Next.js/Tailwind), modele danych TypeScript, struktura kodu. |
| **[`docs/05_HACKATHON_ROADMAP.md`](./docs/05_HACKATHON_ROADMAP.md)** | **Plan i priorytety hackathonu**: Fazy MVP, podział zadań, scenariusz demonstracji dla jurorów. |
| **[`docs/06_AGENT_RULES_AND_STANDARDS.md`](./docs/06_AGENT_RULES_AND_STANDARDS.md)** | **Zasady dla agentów i developerów**: Standardy kodowania, konwencje nazewnictwa, obsługa błędów. |
