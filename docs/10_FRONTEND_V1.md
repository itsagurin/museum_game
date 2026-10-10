# Frontend v1 — uruchomienie, grafiki i integracja

## Zakres

Działająca gra mobile-first na całym ekranie: dom z zewnątrz, hol i cztery pokoje, animowane przejścia, header i kontrolki glass nałożone na scenę, PL domyślnie / EN, pięć obrazów w każdym pokoju, kartki otwierające historię i ciekawostkę. Nawigacja obsługuje przycisk wstecz przeglądarki i bezpośrednie adresy `/#hall`, `/#era-1`–`/#era-4`.

Wszystkie pokoje są dostępne w tej wersji do prezentacji UI. Nie jest to ukończona progresja gry. Kolorowanie **20×20**, walidacja planszy, odblokowania i wyposażenie należą do integracji z pracą pozostałych osób. Nie ma sztucznego przycisku ukończenia obrazu. Opisy dzieł są jawnymi placeholderami do czasu dostarczenia listy obrazów i sprawdzonych tekstów.

## Uruchomienie

```bash
npm ci
npm run dev
```

Adres: `http://localhost:3000`. Po scaleniu main wymagany jest Node.js 22.12 lub nowszy i zgodna z nim wersja npm. Prototyp kolegi działa osobno pod `/prototype/`; główny frontend pozostaje pod `/`.

```bash
npm run typecheck
npm run build
npm run preview
```

Build tworzy katalog `out/`, gotowy do skopiowania na własny hosting statyczny. Nie wymaga serwera Next.js ani backendu. Dla hostingu pod podścieżką ustaw `NEXT_PUBLIC_BASE_PATH=/nazwa` przed budowaniem.

## Grafiki

Źródłem jest istniejący katalog `img/`. Skrypt `scripts/prepare-assets.mjs` kopiuje obrazy do `public/art/` i przygotowuje manifest przed startem oraz buildem. Nie modyfikuje oryginałów. Pliki wynikowe są ignorowane przez Git.

| Plik | Zastosowanie |
| --- | --- |
| `house0.jpg`–`house4.jpg` | Dom i kolejne etapy; wariant wynika z liczby ukończonych pokojów |
| `room1.jpg`–`room4.jpg` | Tła pokojów z zachowanym całym kadrem 896×1200 |
| `blank_paper_crossmark.jpg` | Nieukończony obraz; czarne obrzeża przycięte jedynie przez CSS |
| `hall1.jpg`–`hall4.jpg` | Cztery wersje tego samego holu; rozpoznawane po restarcie dev / buildzie |
| `hall.jpg` | Opcjonalne wspólne tło awaryjne holu |
| `public/note.svg` | Mała ilustrowana kartka pod obrazem, wykonana jako SVG |

Wszystkie cztery ilustracje holu są podłączone. Każdy wariant ma osobno dopasowane obszary czterech drzwi; bliższe i dalsze drzwi mają etykiety na różnych wysokościach. Obszar dotyku ma co najmniej 44 px szerokości także przy oddaleniu sceny. Cztery gotowe prompty do Flow są w [dokumencie 11](./11_HALL_PROMPTS_FOUR_ERAS.md). Wygląd holu wynika z liczby ukończonych pokojów: 0 → hall1, 1 → hall2, 2 → hall3, 3–4 → hall4. Starszy `hall.jpg` jest tłem awaryjnym, a przy braku grafiki pozostaje hol SVG `HallBackdrop`.

## Miejsca edycji

- `src/data/eras.ts`: nazwy i opisy epok, tła, procentowe obszary drzwi w pokojach, położenie pięciu obrazów.
- `src/data/halls.ts`: ilustracje holu i osobne obszary drzwi dla każdego wariantu. Kolejność wejść: bliższe lewe → I, dalsze lewe → II, dalsze prawe → III, bliższe prawe → IV. Współrzędne odnoszą się do całych ilustracji, niezależnie od przesunięcia kamery.
- `src/data/copy.ts`: wszystkie teksty interfejsu PL/EN.
- `src/app/globals.css`: szkło, kolory, typografia, responsywność i animacje.
- `src/components/HeritageApp.tsx`: nawigacja i składanie ekranów.
- `src/store/useGameStore.ts`: język, spokojne animacje, lista ukończonych obrazów i lokalny zapis. Klucz `heritage-hearth-ui-v1`; zapis nie przechowuje pojedynczych pikseli.

Scena wypełnia cały viewport, bez marginesów, zaokrąglonej ramki i przewijania strony. Ilustracja zachowuje proporcje; obszary drzwi i obrazy skalują się razem z nią. Przy innym kształcie ekranu część sceny znajduje się poza kadrem kamery: przesuwaj palcem, przeciągaj myszą albo użyj strzałek. Przycisk „Pokaż całą scenę” oddala widok, a ponowne kliknięcie wypełnia ekran. Przy obrocie telefonu kamera dopasowuje się do nowego rozmiaru.

`src/components/GameViewport.tsx` odpowiada za kamerę. Header i dolna nawigacja pozostają nałożone na ekran, niezależnie od przesunięcia ilustracji. Na przeglądarkach obsługujących Fullscreen API jest też przycisk pełnego ekranu; pozostałe od razu mają grę wypełniającą obszar aplikacji.

## Podłączenie kolorowania przez kolegę

Komponent `HeritageApp` przyjmuje opcjonalny callback `onRestoreArtwork`. Kliknięcie nieukończonego obrazu przekazuje `RestoreArtworkRequest` z `src/types/game.ts`:

```ts
interface RestoreArtworkRequest {
  artwork: Artwork;
  era: Era;
  language: "pl" | "en";
  onComplete: () => void;
  onClose: () => void;
}
```

Adapter musi być komponentem klienta (`"use client"`), który otwiera właściwą minigrę i przechowuje request w swoim stanie. Po rzeczywistym ukończeniu planszy wywołuje `request.onComplete()` i zamyka minigrę we własnym stanie. `request.onClose()` zamyka panel frontendu; nie zamyka komponentu będącego własnością adaptera. Alternatywnie można bezpośrednio wywołać `useGameStore.getState().completeArtwork(artworkId)`.

Identyfikatory początkowe: `era-1-art-1`–`era-4-art-5`. Nadpisz wpisy w `artworks` własnymi tytułami, `originalImage`, `story` i `funFact` w obu językach. `originalImage` powinien być adresem pełnego, zachowanego kolorowego oryginału. Bez niego frontend nie udaje odzyskania szczegółów obrazu. Callback ukończenia jest odporny na powtórne wywołanie i odrzuca nieznane ID.

Sam frontend nie zna numerów pól, palety ani algorytmu 20×20. Blokowanie epok i pojawianie się nagród wymagają osobnego podłączenia po ustaleniu zasad i listy wyposażenia.

## Weryfikacja

```bash
npx playwright install chromium
npm run build
npm run test:e2e
```

Testy uruchamiają eksport statyczny i sprawdzają przejścia między scenami, drzwi, przycisk wstecz, karty historii, zmianę języka i odświeżenie, zapis i reset, brak dostępu do localStorage, brak grafiki oraz pełnoekranowy viewport 320 px, przesuwanie kamery, oddalenie widoku, zmianę orientacji i cztery warianty holu. Są konfiguracje telefonu i komputera.
