# Frontend v1 — uruchomienie, grafiki i integracja

## Zakres

Działająca gra mobile-first na całym ekranie: dom z zewnątrz, hol i cztery pokoje, animowane przejścia, header i kontrolki glass nałożone na scenę, PL domyślnie / EN, pięć obrazów w każdym pokoju, kartki otwierające historię i ciekawostkę. Nawigacja obsługuje przycisk wstecz przeglądarki i bezpośrednie adresy `/#hall`, `/#era-1`–`/#era-4` oraz `/#library`.

Wszystkie pokoje są dostępne do prezentacji UI. Aktualne epoki to **Oświecenie, Romantyzm, Pozytywizm, Młoda Polska**, zgodnie z folderami dostarczonymi przez użytkownika. Biblioteka zawiera **83 reprodukcje**. Wszystkie 83 reprodukcje mają już własne plansze **32×32** z dostarczonych katalogów `_kolorowanie`. Tytuły, autorzy, daty, styl i opisy pochodzą z dostarczonego przez użytkownika `src/data/artworks_qa.json`. Robocze metadane generatora nie są przedstawiane jako opisy dzieł.

**Dom na stronie głównej:** pliki źródłowe `img/house0.jpg`–`img/house4.jpg` mają zmniejszony sam budynek (około połowy wcześniejszego rozmiaru), przy zachowanej pełnej ilustracji krajobrazu. Tło nadal wypełnia cały ekran bez ramek i marginesów. `GameViewport.lockCamera` utrzymuje stały kadr i wyłącza przesuwanie oraz kontrolki kamery tylko dla domu. CSS pozycjonuje ten kadr od pierwszego wyświetlenia, jeszcze przed hydratacją; `overflow: clip` uniemożliwia przesunięcie przy przywracaniu przewijania lub ustawianiu fokusu. Obszar kliknięcia drzwi jest dopasowany do nowej grafiki. Hol i pokoje zachowują dotychczasową kamerę oraz przełącznik widoku. Krótkie ekrany mają mniejszy nagłówek, a w poziomie tekst i przyciski stoją po bokach budynku.

## Biblioteka obrazów

Otwórz **„Biblioteka obrazów”** na ekranie domu albo adres `http://localhost:3000/#library`. Dostępne są filtry epok, wyszukiwanie po tytule/autorze/dacie/epoce/pliku bez wymagania polskich znaków, filtr odnowionych oraz duży podgląd reprodukcji. Nazwy, autor i rok pochodzą z katalogu metadanych. Dla nowych plików bez wpisu pozostaje numer `Obraz 01` / `Painting 01`.

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

Wszystkie **83 reprodukcje mają podłączone JSON-y**:

```text
img/era1_oswiecenie_kolorowanie/json/<nazwa-reprodukcji>_grid32.json
img/era2_romantyzm_kolorowanie/json/<nazwa-reprodukcji>_grid32.json
img/era3_pozytywizm_kolorowanie/json/<nazwa-reprodukcji>_grid32.json
img/era4_mloda_polska_kolorowanie/json/<nazwa-reprodukcji>_grid32.json
```

Otwórz nieukończony obraz na ścianie albo wybierz miniaturę w bibliotece i **„Otwórz pracownię”**. `HeritageGame` pobiera tylko wybrany JSON, waliduje go przez `parseColoringArtwork` i przekazuje oryginalną siatkę oraz paletę do istniejącego `ColoringCanvas`. Wszystkie dostarczone siatki mają **32×32 = 1024 pola**; nie są przetwarzane do wcześniejszego celu 20×20. Nie korzystamy z PNG z numerami jako interaktywnej planszy.

Dopasowanie jest ścisłe: folder epoki + dokładna nazwa reprodukcji bez rozszerzenia + `_gridN.json`. Nazwa ze spacją (`01_01 copy`) jest osobnym dziełem. Powtarzające się `id` w JSON-ach z różnych epok nie kolidują, ponieważ `coloringArtworkId` używa całej ścieżki JSON-a. Jeśli brak pliku lub jest kilka rozmiarów dla tego samego dzieła, pracownia pozostaje niepodłączona do czasu jednoznacznego wyboru.

Po prawdziwym ukończeniu wszystkich pól odsłania się **lokalna reprodukcja z katalogu epoki**; nie używamy roboczego `/assets/...` z eksportu. **„Odkryj opowieść”** zapisuje ID dzieła i otwiera jego opis. Na ścianie kartkę zastępuje reprodukcja, a postęp całej kolekcji aktualizuje poziom pokoju i wygląd domu/holu. Obraz niewiszący na ścianie też można ukończyć i później zawiesić. Ponowne malowanie nie duplikuje ukończeń. Nieukończone piksele nie zapisują się po zamknięciu.

Wczytywanie pokazuje stan oczekiwania i **„Spróbuj ponownie”** przy uszkodzonym lub niedostępnym JSON-ie. Wyjście z pracowni anuluje pobieranie, więc spóźniona odpowiedź nie zastępuje planszy z innej epoki. Brak reprodukcji nie blokuje ukończenia: pracownia zachowuje pokolorowane piksele, a ściana ma lokalny fallback `previews/<nazwa>_grid32_art.png`.

JSON-y zawierają automatyczne tytuły, autora „Mistrz Polski”, wspólną datę „XIX w.” oraz powtarzalne teksty kulturowe. To robocze dane generatora; UI nie pokazuje ich jako zweryfikowanych opisów. Zastępujemy je metadanymi zespołu z `src/data/artworks_qa.json`. Dopasowanie używa dokładnej ścieżki `filename` po usunięciu prefiksu `assets/artworks/`; tytuł nie wpływa na ID ani zapis. Karta obrazu pokazuje najpierw reprodukcję i aktualną ciekawostkę z `src/data/artworks_curiosities.json`, mieszczące się na jednym ekranie telefonu. Historię i opis stylu można opcjonalnie rozwinąć pod ciekawostką; domyślnie są zwinięte. Jego 83 wpisy dopasowujemy po dokładnym `filename`; pole `curiosity` zastępuje wcześniejsze pytania i odpowiedzi również w danych pracowni. Plik zawiera wyłącznie polskie treści: przy EN zachowujemy te same tytuły/opisy, z oznaczeniem `lang="pl"` dla opisów. Tłumaczenia można uzupełnić później. Baza `src/data/artworks_db.json` jest zachowana, a oddzielny prototyp `/prototype/` nadal używa swoich trzech plansz.

### Szybkie kolorowanie do testów

W `npm run dev` pracownia ma przycisk **DEV** obok powiększenia i przesuwania. Domyślnie jest wyłączony. Po włączeniu wybierz kolor i dotknij jednego pasującego piksela: wypełnią się wszystkie pola tego koloru, także rozłączne fragmenty. Niepasujący kolor nadal jest odrzucany. „Cofnij” cofa całą ostatnią operację wypełnienia, zachowując wcześniejsze pojedyncze piksele. Ponowne dotknięcie ukończonego koloru nie dodaje postępu. Przełącznik dotyczy bieżącej planszy i nie zapisuje się.

Zwykły build nie pokazuje przycisku DEV. Aby przygotować eksport z narzędziami testowymi, ustaw flagę przed budowaniem:

```bash
NEXT_PUBLIC_ENABLE_DEV_TOOLS=1 npm run build
```

Testy `tests/dev-coloring.spec.ts` uruchamiaj na działającym dev (`PLAYWRIGHT_PORT=3000 npm run test:e2e -- tests/dev-coloring.spec.ts`) albo na eksporcie z tą flagą. W zwykłym eksporcie testy DEV są pomijane; na dev i buildzie z flagą sprawdzają dostarczoną planszę katalogu.

### Podgląd gotowego pokoju do oceny assetów

W każdym pokoju pod statusem postępu jest przycisk **„DEV: podgląd pokoju 9/9”**. Pokazuje wszystkie dekoracje danej epoki oraz pięć kolorowych obrazów w docelowym układzie. Przełącznik pozostaje włączony przy przechodzeniu między pokojami, więc można porównać wszystkie cztery kompozycje. **„DEV: zakończ podgląd 9/9”** przywraca rzeczywisty wygląd pokoju. Podgląd pokazuje całą scenę w każdym pokoju, bez zoomu i kontrolek kamery.

Podgląd nie przyznaje ukończeń ani nagród, nie zmienia zapisanych przypisań obrazów, domu ani holu. Liczniki pokazują rzeczywisty postęp. Po odświeżeniu podgląd jest wyłączony. Obowiązuje ta sama dostępność co dla szybkiego kolorowania: `npm run dev` lub build z `NEXT_PUBLIC_ENABLE_DEV_TOOLS=1`. Test `tests/dev-room-preview.spec.ts` sprawdza cztery epoki, wczytanie assetów, powrót do zapisu i PL/EN na telefonie i komputerze.

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

Źródłem jest istniejący katalog `img/`. Skrypt `scripts/prepare-assets.mjs` rekurencyjnie kopiuje obrazy i JSON-y do `public/art/`, zachowując podfoldery, i przygotowuje manifest przed startem oraz buildem. `npm run dev` dodatkowo obserwuje `img/` i jego podfoldery: nowe warianty pojawiają się bez restartu serwera. Przy serwerze uruchomionym starszym skryptem można uruchomić osobno `npm run assets:watch`. Nie modyfikuje oryginałów. Pliki wynikowe są ignorowane przez Git. Na hostingu statycznym dodanie grafiki wymaga nowego buildu i skopiowania `out/`.

| Plik | Zastosowanie |
| --- | --- |
| `house0.jpg`–`house4.jpg` | Dom i kolejne etapy; wariant wynika z liczby ukończonych pokojów |
| `room1.jpg`–`room4.jpg` | Tła pokojów z zachowanym całym kadrem 896×1200 |
| `oswiecenie_assets/`, `romantyzm_assets/`, `pozytywizm_assets/`, `mloda_polska_assets/` | Osobne PNG wyposażenia, przypisane wyłącznie do własnej epoki |
| `blank_paper_crossmark.jpg` | Nieukończony obraz; czarne obrzeża przycięte jedynie przez CSS |
| `hall1.jpg`–`hall4.jpg` | Cztery wersje tego samego holu; rozpoznawane po restarcie dev / buildzie |
| `hall.jpg` | Opcjonalne wspólne tło awaryjne holu |
| `eraN_<epoka>_kolorowanie/json/*_grid32.json` | Dane plansz, wczytywane dopiero po otwarciu pracowni |
| `eraN_<epoka>_kolorowanie/previews/*_grid32_art.png` | Pikselowy fallback ukończonego obrazu |
| `public/note.svg` | Mała ilustrowana kartka pod obrazem, wykonana jako SVG |

Wszystkie cztery ilustracje holu są podłączone. Każdy wariant ma osobno dopasowane obszary czterech drzwi; nad każdym wejściem znajduje się tylko numer I–IV, bez nazw epok i podpowiedzi zasłaniającej scenę. Nazwy epok pozostają w etykietach dostępności przycisków. Obszar dotyku ma co najmniej 44 px szerokości. Cztery gotowe prompty do Flow są w [dokumencie 11](./11_HALL_PROMPTS_FOUR_ERAS.md). Wygląd holu wynika z liczby ukończonych pokojów: 0 → hall1, 1 → hall2, 2 → hall3, 3–4 → hall4. Starszy `hall.jpg` jest tłem awaryjnym, a przy braku grafiki pozostaje hol SVG `HallBackdrop`.

## Rozwój pokojów i kolekcja

Każdy pokój ma **10 poziomów: 0–9**. Zatwierdzona reguła: `floor(9 × ukończone obrazy / wszystkie obrazy epoki)`. Poziom 0 jest stanem początkowym, a poziom 9 wymaga całej niepustej kolekcji. Przy 30 obrazach progi wynoszą **4, 7, 10, 14, 17, 20, 24, 27, 30** ukończeń. Obecna kolekcja ma odpowiednio **21, 18, 22 i 22** obrazy; progi są wyliczane z aktualnej liczby plików w każdej epoce. Powtórne malowanie nie daje kolejnych awansów. Poziom jest wyliczany z zapisanego postępu i nie ma osobnego licznika do synchronizacji.

**Aktualny model:** oddzielne PNG na obecnych pustych `roomN.jpg`. Poziom 0 bez wyposażenia. Poziomy 1–9 odblokowują stałe grupy spośród 47 przedmiotów z czterech folderów `*_assets`. Puste ramy są pominięte. Konfiguracja w `src/data/room-decorations.ts` definiuje miejsca, szerokości, warstwy, podpory i ciekawostki PL/EN ze źródłami. Pięć obrazów przenosi się do górnej galerii po rozpoczęciu wyposażania; ID miejsc, obsada i perspektywa pozostają zachowane.

Hover lekko unosi przedmiot; tap/Enter/Spacja otwiera dymek bezpośrednio przy nim. Escape, zamknięcie i dotknięcie poza dymkiem zamykają go. Kamera, zmiana orientacji i fullscreen aktualizują pozycję; dymek mieści się między headerem i dolną nawigacją. Nowe nagrody mają komunikat, poświatę i animację uniesienia dopiero po powrocie z podsumowania obrazu i załadowaniu PNG. Nagrody z biblioteki czekają na wejście do właściwego pokoju. Wczytanie zapisu i ponowne kolorowanie nie odtwarzają animacji. Spokojne animacje i reduced motion wyłączają błysk i uniesienie.

**Grafiki:** pozostawiamy oryginalne PNG i ich istniejące poświaty. Build odczytuje alfę i generuje obszary interakcji, aby padding i otwory między nogami mebli przepuszczały dotyk. Nowy asset wymaga wpisu w konfiguracji; aktualizacja istniejącego pliku odświeża geometrię w watcherze. Szczegóły, lista nagród i źródła są w [dokumencie 13](./13_ROOM_DECORATIONS.md).

`artworks` w `src/data/eras.ts` jest **całą kolekcją**, a `wallSlots` określa tylko **pięć miejsc na ścianach**. `Artwork` nie przechowuje pozycji; `ArtworkSlot` zawiera pozycję, ID miejsca i początkowe ID dzieła. Katalog powstaje z plików JPG/JPEG/PNG/WebP w czterech podfolderach epok z manifestu; nowe pliki są automatycznie uwzględniane. Licznik, rozwój pokoju i ukończenie epoki uwzględniają całą kolekcję, również dzieła niewiszące na ścianie.

## Miejsca edycji

- `src/components/ArtworkLibrary.tsx`, `src/app/library.css`: katalog, filtry, podgląd, wybór miejsca i wygląd mobile-first.
- `src/lib/wall-gallery.ts`: walidacja zapisanych przypisań, wybór obrazu i zamiana miejsc.
- `src/data/artworks_qa.json`: dostarczone tytuły, autorzy, daty, style i opisy. Stare pytania/odpowiedzi nie są wyświetlane.
- `src/data/artworks_curiosities.json`: aktualne ciekawostki dla wszystkich 83 obrazów, zastępujące wcześniejsze treści.
- `src/data/eras.ts`: nazwy i opisy epok, tła, procentowe obszary drzwi, pełna kolekcja `artworks`, pięć miejsc `wallSlots` i punkty zbiegu ścian.
- `src/lib/room-development.ts`, `src/components/RoomBackdrop.tsx`: progi dziesięciu poziomów i stałe puste tło.
- `src/data/room-decorations.ts`, `src/components/RoomDecorations.tsx`, `src/app/decorations.css`: wyposażenie, układy, dymki i animacje.
- `scripts/decoration-geometry.mjs`: odczyt alfy i generowanie obszarów klikania.
- `src/data/halls.ts`: ilustracje holu i osobne obszary drzwi dla każdego wariantu. Kolejność wejść: bliższe lewe → I, dalsze lewe → II, dalsze prawe → III, bliższe prawe → IV. Współrzędne odnoszą się do całych ilustracji, niezależnie od przesunięcia kamery.
- `src/data/copy.ts`: wszystkie teksty interfejsu PL/EN.
- `src/app/globals.css`: szkło, kolory, typografia, responsywność i animacje.
- `src/components/HeritageApp.tsx`: nawigacja i składanie ekranów.
- `src/components/HeritageGame.tsx`: adapter minigry, pełnoekranowa pracownia i powrót do pokoju.
- `src/lib/coloring-assets.ts`: dopasowanie eksportu i pikselowego podglądu według epoki i nazwy pliku.
- `src/data/coloring-library.ts`: pobranie jednej planszy, walidacja, unikalne ID i właściwa lokalna reprodukcja.
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

Nowe ID dzieł są oparte na epoce i nazwie pliku, więc dopisanie reprodukcji lub zmiana kolejności nie przenosi ukończenia na inny obraz. Nie zmieniaj nazwy źródłowego pliku po rozpoczęciu gry. Pięć rozpoznanych reprodukcji zachowuje historyczne ID `era-3-art-1`–`era-3-art-5`, aby nie utracić rzeczywistego wcześniejszego ukończenia; ich epoka wynika teraz z folderu, a nie z prefiksu ID. Te reprodukcje mają teraz własne dostarczone JSON-y. Pozostałe dawne placeholdery nie są częścią katalogu.

Miejsca mają osobne ID `era-N-slot-1`–`era-N-slot-5`. `coloringArtworkId` identyfikuje planszę przez ścieżkę, `coloringSource` podaje jej URL, a `coloredPreview` lokalny fallback pikselowy. `src/lib/coloring-assets.ts` podłącza eksport automatycznie na podstawie `sourceFile`. Dopisanie dzieła wyłącznie do dawnego `artworks_db.json` nie przypisuje go do katalogu. Metadane uzupełniaj w `src/data/artworks_qa.json`; `src/data/eras.ts` przypisuje je do `title`, `artist`, `year`, `style` i `story`. Ciekawostki uzupełniaj w `src/data/artworks_curiosities.json`; pole `curiosity` zasila `funFact`. Callback ukończenia odrzuca nieznane ID i nie nalicza powtórnych ukończeń.

`HeritageApp` nie implementuje algorytmu ani logiki malowania. Adapter przekazuje do istniejącego renderera wymiary, dane i paletę z JSON-a. Dekoracje są osobnymi przezroczystymi PNG, odblokowywanymi na dziesięciu poziomach. Blokowanie epok wymaga osobnego podłączenia.

## Weryfikacja

```bash
npx playwright install chromium
npm run build
npm run test:e2e
```

Testy uruchamiają eksport statyczny i sprawdzają przejścia między scenami, drzwi, przycisk wstecz, karty historii, zmianę języka i odświeżenie, zapis i reset, brak dostępu do localStorage, brak grafiki oraz pełnoekranowy viewport 320 px, przesuwanie kamery, oddalenie widoku, zmianę orientacji i cztery warianty holu. Są konfiguracje telefonu i komputera. `tests/library.spec.ts` sprawdza wszystkie kolekcje, filtry, wybór i zamianę miejsc, zapis, PL/EN oraz brak reprodukcji. `tests/coloring-integration.spec.ts` sprawdza wszystkie epoki, dostarczone siatki/palety, lokalny oryginał, ukończenia, replay, całą kolekcję, błędy JSON, ponowienie, anulowanie, PL/EN i fullscreen. Testy jednostkowe walidują dopasowanie wszystkich 83 eksportów i brak kolizji między epokami. Tylko narzędzia DEV są pomijane w zwykłym buildzie.
