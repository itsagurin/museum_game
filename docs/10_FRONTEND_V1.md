# Frontend v1 — uruchomienie, grafiki i integracja

## Zakres

Działająca gra mobile-first na całym ekranie: dom z zewnątrz, hol i cztery pokoje, animowane przejścia, header i kontrolki glass nałożone na scenę, PL domyślnie / EN, pięć obrazów w każdym pokoju, kartki otwierające historię i ciekawostkę. Nawigacja obsługuje przycisk wstecz przeglądarki i bezpośrednie adresy `/#hall`, `/#era-1`–`/#era-4` oraz `/#library`.

Wszystkie pokoje są dostępne do prezentacji UI. Aktualne epoki to **Oświecenie, Romantyzm, Pozytywizm, Młoda Polska**, zgodnie z folderami dostarczonymi przez użytkownika. Biblioteka zawiera **83 reprodukcje**. Nie ma jeszcze potwierdzonych tytułów, autorów ani przypisania do plansz kolorowania; zgodnie z decyzją użytkownika wyświetlamy numery katalogowe i nie podłączamy plików do starych testowych siatek.

## Biblioteka obrazów

Otwórz **„Biblioteka obrazów”** na ekranie domu albo adres `http://localhost:3000/#library`. Dostępne są filtry epok, wyszukiwanie po numerze/epoce/pliku bez wymagania polskich znaków, filtr odnowionych oraz duży podgląd reprodukcji. Nazwy `Obraz 01` / `Painting 01` to numery w obrębie epoki.

| Pokój | Epoka | Folder w `img/` | Obrazy |
| --- | --- | --- | --- |
| I | Oświecenie | `era1_oswiecenie/` | 21 |
| II | Romantyzm | `era2_romantyzm/` | 18 |
| III | Pozytywizm | `era3_pozytywizm/` | 22 |
| IV | Młoda Polska | `era4_mloda_polska/` | 22 |

Wybierz miniaturę, jedno z pięciu miejsc i **„Zawieś w pokoju”**. Biblioteka otwarta z domu pozwala wybrać miejsce w pokoju epoki danego obrazu, po czym przechodzi do tego pokoju. W pokoju przycisk **„Zmień obrazy”** oraz kliknięcie ukończonego obrazu otwierają katalog ograniczony do jego epoki. Kliknięta ukończona rama jest domyślnym miejscem wymiany.

Można wybrać także nieukończony obraz: na ścianie pozostaje kartka z krzyżykiem. Ukończony pokazuje reprodukcję. Jeżeli wybrane dzieło już wisi w innym miejscu, oba obrazy zamieniają się miejscami; nie powstają duplikaty. Pozycja ramy, perspektywa i kartka pod obrazem należą do miejsca i pozostają bez zmian. Kartka otwiera opis aktualnie przypisanego dzieła; bez metadanych pokazuje tekst oczekiwania.

`wallAssignments` w `heritage-hearth-ui-v1` zapisuje mapę ID miejsca → ID obrazu. Zamiana nie zmienia ukończeń ani poziomu pokoju. Wczytywanie naprawia nieznane, powtórzone i przypisane do niewłaściwej epoki ID. Reset postępu przywraca także pięć początkowych obrazów w każdym pokoju. Język i spokojne animacje pozostają zachowane.

## Stan integracji kolorowania

Obecne **83 reprodukcje nie mają `coloringArtworkId`**. Biblioteka wyświetla informację o przygotowywanej pracowni; kliknięcie nieukończonej ramy pokazuje dotychczasowy placeholder i nie nalicza ukończenia. Nie ma sztucznego przycisku ukończenia ani zgadywania tytułów/autorów na podstawie pliku.

`HeritageGame`, `ColoringCanvas` i `src/data/artworks_db.json` są zachowane do integracji przez autora kolorowania. Ta testowa baza ma siatki **32×32**, których nie przetwarzamy; docelowe 20×20 dostarcza kolega. Prototyp z trzema działającymi kolorowankami pozostaje pod `/prototype/`. Po dostarczeniu jawnego przypisania `sourceFile` → ID planszy biblioteka może otworzyć pracownię również dla dzieła niewiszącego na ścianie. Nieukończone piksele w adapterze nie zapisują się po zamknięciu.

### Szybkie kolorowanie do testów

W `npm run dev` pracownia ma przycisk **DEV** obok powiększenia i przesuwania. Domyślnie jest wyłączony. Po włączeniu wybierz kolor i dotknij jednego pasującego piksela: wypełnią się wszystkie pola tego koloru, także rozłączne fragmenty. Niepasujący kolor nadal jest odrzucany. „Cofnij” cofa całą ostatnią operację wypełnienia, zachowując wcześniejsze pojedyncze piksele. Ponowne dotknięcie ukończonego koloru nie dodaje postępu. Przełącznik dotyczy bieżącej planszy i nie zapisuje się.

Zwykły build nie pokazuje przycisku DEV. Aby przygotować eksport z narzędziami testowymi, ustaw flagę przed budowaniem:

```bash
NEXT_PUBLIC_ENABLE_DEV_TOOLS=1 npm run build
```

Testy `tests/dev-coloring.spec.ts` uruchamiaj na działającym dev (`PLAYWRIGHT_PORT=3000 npm run test:e2e -- tests/dev-coloring.spec.ts`) albo na eksporcie z tą flagą. Są pomijane, gdy nie ma przypisania testowego dzieła do nowego katalogu lub narzędzia DEV są wyłączone.

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

Źródłem jest istniejący katalog `img/`. Skrypt `scripts/prepare-assets.mjs` rekurencyjnie kopiuje obrazy do `public/art/`, zachowując podfoldery, i przygotowuje manifest przed startem oraz buildem. `npm run dev` dodatkowo obserwuje `img/` i jego podfoldery: nowe warianty pojawiają się bez restartu serwera. Przy serwerze uruchomionym starszym skryptem można uruchomić osobno `npm run assets:watch`. Nie modyfikuje oryginałów. Pliki wynikowe są ignorowane przez Git. Na hostingu statycznym dodanie grafiki wymaga nowego buildu i skopiowania `out/`.

| Plik | Zastosowanie |
| --- | --- |
| `house0.jpg`–`house4.jpg` | Dom i kolejne etapy; wariant wynika z liczby ukończonych pokojów |
| `room1.jpg`–`room4.jpg` | Tła pokojów z zachowanym całym kadrem 896×1200 |
| `room1_level0.jpg`–`room1_level9.jpg` | Dziesięć wariantów rozwoju pokoju I; analogicznie `room2_…`, `room3_…`, `room4_…` |
| `blank_paper_crossmark.jpg` | Nieukończony obraz; czarne obrzeża przycięte jedynie przez CSS |
| `hall1.jpg`–`hall4.jpg` | Cztery wersje tego samego holu; rozpoznawane po restarcie dev / buildzie |
| `hall.jpg` | Opcjonalne wspólne tło awaryjne holu |
| `public/note.svg` | Mała ilustrowana kartka pod obrazem, wykonana jako SVG |

Wszystkie cztery ilustracje holu są podłączone. Każdy wariant ma osobno dopasowane obszary czterech drzwi; bliższe i dalsze drzwi mają etykiety na różnych wysokościach. Obszar dotyku ma co najmniej 44 px szerokości także przy oddaleniu sceny. Cztery gotowe prompty do Flow są w [dokumencie 11](./11_HALL_PROMPTS_FOUR_ERAS.md). Wygląd holu wynika z liczby ukończonych pokojów: 0 → hall1, 1 → hall2, 2 → hall3, 3–4 → hall4. Starszy `hall.jpg` jest tłem awaryjnym, a przy braku grafiki pozostaje hol SVG `HallBackdrop`.

## Rozwój pokojów i kolekcja

Każdy pokój ma **10 poziomów: 0–9**. Zatwierdzona reguła: `floor(9 × ukończone obrazy / wszystkie obrazy epoki)`. Poziom 0 jest stanem początkowym, a poziom 9 wymaga całej niepustej kolekcji. Przy 30 obrazach progi wynoszą **4, 7, 10, 14, 17, 20, 24, 27, 30** ukończeń. Obecna kolekcja ma odpowiednio **21, 18, 22 i 22** obrazy; progi są wyliczane z aktualnej liczby plików w każdej epoce. Powtórne malowanie nie daje kolejnych awansów. Poziom jest wyliczany z zapisanego postępu i nie ma osobnego licznika do synchronizacji.

Dodawaj całe ilustracje do `img/` jako `roomN_levelM.jpg`, `.jpeg`, `.png` albo `.webp`, gdzie N = 1–4, M = 0–9. Widok wybiera najwyższy dostępny poziom nieprzekraczający zdobytego. Brakujące i uszkodzone pliki zastępują niższe warianty, a ostatecznie dotychczasowe `roomN.jpg`. Tło przenika po załadowaniu nowego obrazu; ramy, kartki, drzwi i kamera pozostają aktywne w tych samych miejscach. Spokojne animacje wyłączają przenikanie.

**Wymaganie dla grafik:** zachowaj rozmiar i proporcje **896×1200**, identyczny kadr, perspektywę ścian, narożnik i położenie obu drzwi we wszystkich poziomach danego pokoju. Meble dodawaj do tła, pozostawiając wolne obecne miejsca obrazów i oba przejścia. Bez wtopionych ram, obrazów i tekstów. Nowy kadr wymaga ponownej kalibracji obszarów dotyku i perspektywy we frontendzie.

`artworks` w `src/data/eras.ts` jest **całą kolekcją**, a `wallSlots` określa tylko **pięć miejsc na ścianach**. `Artwork` nie przechowuje pozycji; `ArtworkSlot` zawiera pozycję, ID miejsca i początkowe ID dzieła. Katalog powstaje z plików JPG/JPEG/PNG/WebP w czterech podfolderach epok z manifestu; nowe pliki są automatycznie uwzględniane. Licznik, rozwój pokoju i ukończenie epoki uwzględniają całą kolekcję, również dzieła niewiszące na ścianie.

## Miejsca edycji

- `src/components/ArtworkLibrary.tsx`, `src/app/library.css`: katalog, filtry, podgląd, wybór miejsca i wygląd mobile-first.
- `src/lib/wall-gallery.ts`: walidacja zapisanych przypisań, wybór obrazu i zamiana miejsc.
- `src/data/eras.ts`: nazwy i opisy epok, tła, procentowe obszary drzwi, pełna kolekcja `artworks`, pięć miejsc `wallSlots` i punkty zbiegu ścian.
- `src/lib/room-development.ts`, `src/components/RoomBackdrop.tsx`: progi dziesięciu poziomów, wybór dostępnego tła, ładowanie i przenikanie.
- `src/data/halls.ts`: ilustracje holu i osobne obszary drzwi dla każdego wariantu. Kolejność wejść: bliższe lewe → I, dalsze lewe → II, dalsze prawe → III, bliższe prawe → IV. Współrzędne odnoszą się do całych ilustracji, niezależnie od przesunięcia kamery.
- `src/data/copy.ts`: wszystkie teksty interfejsu PL/EN.
- `src/app/globals.css`: szkło, kolory, typografia, responsywność i animacje.
- `src/components/HeritageApp.tsx`: nawigacja i składanie ekranów.
- `src/components/HeritageGame.tsx`: adapter minigry, pełnoekranowa pracownia i powrót do pokoju.
- `src/data/coloring-library.ts`: walidacja dostarczonej bazy, lokalne reprodukcje i tłumaczenia historii.
- `src/data/coloring-copy.ts`, `src/app/coloring.css`: interfejs pracowni PL/EN oraz style ograniczone do głównego frontendu.
- `src/store/useGameStore.ts`: język, spokojne animacje, lista ukończonych obrazów, przypisania miejsc na ścianie i lokalny zapis. Klucz `heritage-hearth-ui-v1`; zapis nie przechowuje pojedynczych pikseli.

Scena wypełnia cały viewport, bez marginesów, zaokrąglonej ramki i przewijania strony. Ilustracja zachowuje proporcje; obszary drzwi i obrazy skalują się razem z nią. Przy innym kształcie ekranu część sceny znajduje się poza kadrem kamery: przesuwaj palcem, przeciągaj myszą albo użyj strzałek. Przycisk „Pokaż całą scenę” oddala widok, a ponowne kliknięcie wypełnia ekran. Przy obrocie telefonu kamera dopasowuje się do nowego rozmiaru.

`src/components/GameViewport.tsx` odpowiada za kamerę. Header i dolna nawigacja pozostają nałożone na ekran, niezależnie od przesunięcia ilustracji. Na przeglądarkach obsługujących Fullscreen API jest też przycisk pełnego ekranu; pozostałe od razu mają grę wypełniającą obszar aplikacji.

Perspektywę ramek, zawartości i kartek wylicza `src/lib/scene-projection.ts` z `Era.wallPerspective`. Pionowe krawędzie pozostają pionowe, poziome zbiegają się w odpowiednim punkcie, a dalsza krawędź ramki jest krótsza. Punkty są podane w procentach ilustracji 896×1200 i mogą leżeć poza jej kadrem. Kamera aktualizuje `--scene-scale` po zmianie rozmiaru, orientacji lub oddaleniu, więc transformacja skaluje się razem z tłem. Hover ramki nie zastępuje perspektywy, ponieważ znajduje się ona na jej nadrzędnym elemencie.

## Podłączenie kolorowania przez kolegę

Komponent `HeritageApp` przyjmuje opcjonalny callback `onRestoreArtwork`. Kliknięcie obrazu z ustawionym `coloringArtworkId` przekazuje `RestoreArtworkRequest` z `src/types/game.ts`. Gotowy adapter to `HeritageGame`:

```ts
interface RestoreArtworkRequest {
  artwork: Artwork;
  era: Era;
  language: "pl" | "en";
  onComplete: () => void;
  onClose: () => void;
}
```

Adapter jest komponentem klienta (`"use client"`), który otwiera właściwą minigrę i przechowuje request w swoim stanie. Po rzeczywistym ukończeniu planszy wywołuje `request.onComplete()` i zamyka minigrę we własnym stanie; callback zapisuje postęp i otwiera historię. Nie wywołuj wtedy `request.onClose()`, bo zamknie nowo otwartą historię. `request.onClose()` służy do wyjścia bez ukończenia; nie zamyka komponentu będącego własnością adaptera.

Nowe ID dzieł są oparte na epoce i nazwie pliku, więc dopisanie reprodukcji lub zmiana kolejności nie przenosi ukończenia na inny obraz. Nie zmieniaj nazwy źródłowego pliku po rozpoczęciu gry. Pięć rozpoznanych reprodukcji zachowuje historyczne ID `era-3-art-1`–`era-3-art-5`, aby nie utracić rzeczywistego wcześniejszego ukończenia; ich epoka wynika teraz z folderu, a nie z prefiksu ID. Nie oznacza to podłączenia tych plików do siatek. Pozostałe dawne placeholdery nie są częścią katalogu.

Miejsca mają osobne ID `era-N-slot-1`–`era-N-slot-5`. `coloringArtworkId` łączy dzieło z ID planszy w bazie. Metadane i to przypisanie trzeba dodać jawnie w generatorze katalogu `src/data/eras.ts`, według `sourceFile`; samo dopisanie planszy do testowej bazy nie podłącza losowej reprodukcji. Uzupełnij wtedy `title`, `story` i `funFact`. Callback ukończenia odrzuca nieznane ID i nie nalicza powtórnych ukończeń.

`HeritageApp` nie implementuje algorytmu ani logiki malowania. Adapter przekazuje do istniejącego renderera wymiary, dane i paletę z JSON-a. Dekoracje są częścią dziesięciu wariantów tła, a nie osobnymi nakładkami mebli. Blokowanie epok wymaga osobnego podłączenia.

## Weryfikacja

```bash
npx playwright install chromium
npm run build
npm run test:e2e
```

Testy uruchamiają eksport statyczny i sprawdzają przejścia między scenami, drzwi, przycisk wstecz, karty historii, zmianę języka i odświeżenie, zapis i reset, brak dostępu do localStorage, brak grafiki oraz pełnoekranowy viewport 320 px, przesuwanie kamery, oddalenie widoku, zmianę orientacji i cztery warianty holu. Są konfiguracje telefonu i komputera. `tests/library.spec.ts` sprawdza wszystkie kolekcje, filtry, wybór i zamianę miejsc, zapis, PL/EN oraz brak reprodukcji. Testy integracji siatek i DEV są warunkowo pomijane do dostarczenia przypisań; testy dostępnego prototypu i walidacji danych pozostają aktywne.
