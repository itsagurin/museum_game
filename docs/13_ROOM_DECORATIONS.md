# Wyposażenie pokojów — 11.10.2026

Obowiązuje nowa decyzja zespołu: używamy obecnych pustych `room1.jpg`–`room4.jpg` oraz osobnych PNG. Poziom 0 nie ma wyposażenia. Portrety i pejzaże z folderów dodatków są dekoracjami, niezależnymi od pięciu obrazów do kolorowania. Trzy puste ramy oświecenia są pominięte. Pozostałe **47 przedmiotów** pojawia się wyłącznie we własnej epoce.

Progresja pozostaje `floor(9 × unikalne ukończone dzieła / cała kolekcja epoki)`. Obrazy spoza ściany również dają postęp, a powtórne kolorowanie nie daje dodatkowej nagrody. Poziom 9 wymaga całej kolekcji; stan wyposażenia wyliczamy z zapisanego postępu. Dotychczasowe ID obrazów i przypisania do ścian są zachowane.

## Nagrody

| Poziom | Oświecenie (12) | Romantyzm (13) | Pozytywizm (10) | Młoda Polska (12) |
| --- | --- | --- | --- | --- |
| 0 | Pusto | Pusto | Pusto | Pusto |
| 1 | Konsola | Fortepian | Biurko | Stół |
| 2 | Księgi, kałamarz i pióro | Taboret | Krzesło | Fotel |
| 3 | Globus | Poezja, listy | Otwarta książka | Książki, korespondencja |
| 4 | Gazeta | Pudełko pamiątek, świecznik | Książka na biurku | Kałamarz, pióro |
| 5 | Zegar | Stolik muzyczny, futerał | Książka do nauki | Lichtarz |
| 6 | Lustro | Skrzypce, smyczek | Mikroskop | Róża |
| 7 | Dwa kinkiety | Kufer | Biblioteczka | Pulpit i nuty |
| 8 | Popiersie i wazon | Pejzaż z ruinami | Pejzaż | Portret poety |
| 9 | Żyrandol | Grafika powstańcza | Maszyna do szycia, lampa | Pejzaż górski |

Najpierw odblokowuje się podpora danego przedmiotu (stół, fortepian, pulpit), potem przedmioty na niej. Nie ma przeciągania wyposażenia. Kolejność ukończenia dzieł nie zmienia układu pokoju.

## Układy i interakcje

Romantyzm nawiązuje do `img/assets_romantyzm_wide.png`: fortepian z dodatkami po lewej, instrument na stoliku po prawej, kufer na pierwszym planie. Młoda Polska nawiązuje do `img/assets_mloda_polska_wide.png`: stół z przyborami, fotel i pulpit. Układy przystosowano do obecnych pustych teł oraz pięciu obrazów gracza. Dla oświecenia przyjęto gabinet kolekcjonera, dla pozytywizmu pracownię z biurkiem, książkami i mikroskopem.

Po zdobyciu pierwszego poziomu pięć obrazów zajmuje górną część ścian, pozostawiając miejsce na całe wyposażenie. Zachowane są punkty zbiegu ścian, ID miejsc i wybór dzieł; ruch ramek ma łagodne przejście. Pejzaż górski i portret mieszczą się między górną galerią a drzwiami; odblokowanie poziomu 9 nie przesuwa już pojedynczego obrazu gracza. Wąskie ramy mają powiększony, niewidoczny obszar dotyku także w oddaleniu. Małe kartki dostosowują rozmiar ilustracji do skali sceny, zachowując obszar dotyku. Dekoracyjne portrety nie otwierają kolorowania ani biblioteki.

Hover lekko unosi przedmiot i pokazuje dymek. Kliknięcie lub tap przypina dymek przy nim; kolejne dotknięcie zamyka. Enter/Spacja otwierają opowieść, Escape zamyka. Dymek ma nazwę, ciekawostkę, wyjaśnienie związku z epoką i link do źródła, wszystko w PL/EN. Jego pozycja uwzględnia przesunięcie kamery, obrót telefonu, header, dolne menu i tryb fullscreen. Krótka zwłoka pozwala przenieść wskaźnik z przedmiotu do dymka.

Nowa nagroda czeka na zamknięcie podsumowania ukończonego obrazu i załadowanie PNG. Pojawia się z poświatą oraz uniesieniem na miejsce; komunikat wymienia odkryte przedmioty. Malowanie z biblioteki odkłada prezentację do wejścia do właściwego pokoju. Przy odświeżeniu strony zdobyte dodatki są od razu widoczne bez odtwarzania nagrody. Spokojne animacje i `prefers-reduced-motion` wyłączają błysk oraz uniesienie.

Zablokowane przedmioty nie są renderowane ani pobierane. Oryginalne PNG, w tym brązowe poświaty, pozostają bez zmian. Obszary interakcji powstają z nieprzezroczystej części obrazu, więc przezroczyste marginesy i otwory między nogami mebli przepuszczają kliknięcia.

## Kalibracja kompozycji

Skalę i pozycje wszystkich 47 dodatków dopasowano do pustych teł: meble i podstawy stoją na podłodze przy ścianach, lampy zaczynają się na suficie, dekoracje nie przekraczają narożnika ani przejść drzwiowych. Pięć ram w wyposażonym pokoju mieści się bliżej środka ścian.

Przedmioty na blatach, półce, futerale i pulpicie mają `contact` oraz `supportId`. Dla nich `x`/`y` oznaczają procentowe położenie punktu styku na nieprzezroczystych granicach podpory; `contact.x`/`contact.y` określają punkt w samym przedmiocie (0–1). `getDecorationBounds` wylicza pozycję, a PNG i mapa dotyku korzystają z tej samej geometrii. Krzesła i taboret zachowują absolutne współrzędne: ich `supportId` określa wyłącznie kolejność nagród. Test weryfikuje, że punkty podparcia trafiają w faktycznie nieprzezroczyste piksele oraz że żaden dodatek nie zasłania drzwi.

Podgląd DEV ma stały widok całego pokoju bez zoomu i kontrolek kamery, zachowany przy zmianie epoki. Wyłączenie podglądu przywraca zwykłe sterowanie kamerą.

## Edycja i sprawdzenia

- `src/data/room-decorations.ts`: wszystkie nagrody, poziomy, pozycje, szerokości, kolejność warstw, podpory, PL/EN i źródła; `getRoomArtworkPlacement` określa układ pięciu ram.
- `src/components/RoomDecorations.tsx`, `src/app/decorations.css`: interakcje, dymki i animacje. Kolejka nowych nagród jest w `HeritageApp`.
- `scripts/decoration-geometry.mjs`: odczyt alfy i generowanie `src/data/decoration-geometry.json`. Plik wynikowy jest ignorowany przez Git i powstaje przy przygotowywaniu assetów (dev/build/typecheck).
- `src/data/room-decorations.test.ts`: komplet plików, właściwe epoki, podpory, proporcje, wolne miejsca dla pięciu obrazów na poziomach 0–9.
- `tests/decorations.spec.ts`: cztery pokoje, dotyk/hover/klawiatura, język, dymki, realne kolorowanie z biblioteki, nagroda, zapis i reset. `tests/room-development.spec.ts` sprawdza stałe tło oraz postęp.

## Źródła ciekawostek

Przedmioty są ilustracjami, nie zidentyfikowanymi eksponatami muzealnymi. Nie przypisujemy umownemu portretowi nazwiska ani wygenerowanemu pejzażowi autora. Fakty odnoszą się do historii i kultury epoki. Teksty „Dlaczego w tej epoce?” są autorską interpretacją doboru dekoracji do gry. W źródłach sprawdzono kontekst, daty i przykłady; tekstów nie kopiowano.

- Wyposażenie dworskie, inspiracje antykiem i orientem: [Łazienki Królewskie — Garderoba](https://www.lazienki-krolewskie.pl/pl/architektura/palac-na-wyspie/pietro-garderoba?floor=pierwsze-pietro). Zainteresowanie zegarami: [Łazienki — zegary słoneczne](https://lazienki-krolewskie.pl/pl/rzezby/zegary-sloneczne).
- Edukacja i „Monitor”: [ZPE — Oświecenie w polskim wydaniu](https://zpe.gov.pl/a/przeczytaj/D18hcot6Q).
- Instrumenty, listy i pamiątki: [Biblioteka Polska w Paryżu — przewodnik Salonu Chopina](https://ibpp.eu/wp-content/uploads/2026/05/Salon-Chopina-PL.pdf).
- Debiut romantyczny: [Archiwum Narodowe w Krakowie](https://archiwalneopowiesci.ank.gov.pl/wystawa/romantycy-polscy-w-zasobie-archiwum-narodowego-w-krakowie/romantyzm-przedlistopadowy/). Podróże i emigracja: [Muzeum Literatury — lekcje](https://muzeumliteratury.pl/lekcje-muzealne/). Druki powstańcze: [Muzeum Literatury — zbiory](https://archiwum.muzeumliteratury.pl/zbiory/).
- Wieniawski i muzyka salonowa: [Towarzystwo Muzyczne im. Henryka Wieniawskiego](https://wieniawski.lublin.pl/wp-content/uploads/2022/11/P%C5%82yta-2022-1.pdf). Ruiny: [Instytut Adama Mickiewicza](https://culture.pl/pl/artykul/z-gruzu-i-na-gruzach-miejsce-ruin-w-kulturze).
- Pozytywizm: [ZPE — praca organiczna](https://zpe.gov.pl/a/przeczytaj/D9scjC5T8), [terminy pozytywistyczne](https://zpe.gov.pl/a/sprawdz-sie/D15gz0K8G). Realizm: [Muzeum Narodowe w Warszawie — Aleksander Gierymski](https://www.mnw.art.pl/edukacja/programy-do-wystaw-czasowych/rchiwum/aleksander-gierymski-1850-1901--program-towarzyszacy-wystawie/).
- Lampa naftowa: [Sieć Badawcza Łukasiewicz](https://emag.lukasiewicz.gov.pl/2025/03/07/ignacy-lukasiewicz-patron-innowacji-i-postepu/). Prasa z reklamami maszyn: [Biblioteka Jagiellońska — „Czas”, 1881](https://www.jbc.bj.uj.edu.pl/Content/588533/0133_NDIGCZAS026703_79822163.pdf?handler=pdf).
- Salony Młodej Polski: [Muzeum Krakowa — Herbatka u Rydlów](https://muzeumkrakowa.pl/oddzialy/herbatka-u-rydlow). Sztuka i tradycja: [ZPE — Młoda Polska](https://zpe.gov.pl/watek/LP7JGOQRCQ/49/a/dowiedz-sie/D9NNZN2O9). Róża: [ZPE — młodopolskie symbole](https://zpe.gov.pl/a/w-gaszczu-mlodopolskich-symboli/Dp34pe1SC). Portrety i pejzaże: [Muzeum Tatrzańskie — Aparat Witkiewiczów](https://muzeumtatrzanskie.pl/wystawa-aparat-witkiewiczow/).
