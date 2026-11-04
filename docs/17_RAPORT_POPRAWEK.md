# 17. Raport poprawek i Fazy 3

Prace: 3–4 listopada 2026. Kolejne PR-y bazują na poprzednich, dopóki ich bazy nie zostaną scalone.

| Pakiet | PR | Sprawdzenie |
| --- | --- | --- |
| Faza 2: manifest i generator | [#3](https://github.com/itsagurin/museum_game/pull/3) | 34 Vitest, 26 pytest / 4 pominięte, build |
| A1: podział kodu i CSS | [#4](https://github.com/itsagurin/museum_game/pull/4) | 100 e2e / 6 DEV pominiętych, DEV 6, 12/12 identycznych par zrzutów |
| A2–A6: start i zapisy | [#5](https://github.com/itsagurin/museum_game/pull/5) | 44 Vitest, 108 e2e / 6 pominiętych, DEV 6, pytest 28 / 4 pominięte; 83 siatki i palety HEX zachowane |
| A7–A8: samouczek i dostępność | [#6](https://github.com/itsagurin/museum_game/pull/6) | 44 Vitest, 130 e2e / 6 pominiętych, DEV 6, pytest 30 / 4 pominięte; 18 skanów axe bez serious/critical |
| A9–A11: recenzja i panoramy | [#7](https://github.com/itsagurin/museum_game/pull/7) | 44 Vitest, 130 e2e / 6 pominiętych, DEV 6, pytest 32 / 4 pominięte |
| B1: PWA | [#8](https://github.com/itsagurin/museum_game/pull/8) | 49 Vitest, 134 e2e / 6 pominiętych, DEV 6; offline także pod /museum |
| B2–B3: powroty i kolekcja | [#9](https://github.com/itsagurin/museum_game/pull/9) | 59 Vitest, 138 e2e / 6 pominiętych, DEV 6; 20 skanów axe |
| B4: karta i certyfikat | [#10](https://github.com/itsagurin/museum_game/pull/10) | 62 Vitest; PNG w obu wymaganych wymiarach; pełny przebieg 141 zaliczonych, 1 fluktuacja hover zaliczona osobno |
| B5: muzyka | [#11](https://github.com/itsagurin/museum_game/pull/11) | 66 Vitest, 144 e2e / 6 pominiętych, DEV 6 |
| B6: analityka do aktywacji później | [#12](https://github.com/itsagurin/museum_game/pull/12) | 70 Vitest, 152 e2e / 6 pominiętych, DEV 6; 22 skany axe |
| B8: materiały badawcze | [#13](https://github.com/itsagurin/museum_game/pull/13) | Siedem szablonów; kod i sprawdzenie z B6 |
| B7: wydajność i stabilność | [#14](https://github.com/itsagurin/museum_game/pull/14) | 75 Vitest, 178 e2e / 6 pominiętych, DEV 6, 24 skany axe; pełny audyt mobile zakończony kodem 0 |

W każdym pakiecie kodu wykonano lint, typecheck, walidację treści i build. Ostrzeżenia ESLint (3) pochodzą z JS w venv sklearn, nie z gry. Cztery pomijane testy Python potrzebują danych spoza repo. Raporty, trace i zrzuty są lokalnie w `/tmp/museum-a1`, `/tmp/museum-a2-*`, `/tmp/museum-a7-*`.

## Decyzje zatwierdzone w rozmowie

- D-A1: skrócone intro 16; D-A2: bez oznaczania niezweryfikowanej treści w UI.
- D-B1: zwykła plansza dnia; D-B2: widoczna łagodna seria.
- D-B3: Vercel Analytics; D-B4: domyślnie włączone z możliwością wyłączenia.
- D-B6: tymczasowa ikona z `house4.jpg`; D-B7: osobny job LHCI.
- A10: bok 40 dla pięciu panoram. Użytkownik otrzymał raport i informację o utracie pomalowanych pól rozpoczętych plansz objętych zmianą. Ukończenia i obsada ścian pozostają.
- Muzyka: zatwierdzone pięć konkretnych nagrań CC0 z docs/19. Historia Git: bez migracji i bez przepisywania.
- Vercel: kod do późniejszej aktywacji; konfiguracji produkcyjnej ani planu konta nie zmieniano.

## A9: recenzja treści

Tabela 83 dzieł pozostaje w [dokumencie recenzji](15_RECENZJA_TRESCI.md). Statusy `unverified` i szkice EN nie stają się zweryfikowane przez samo dopasowanie reprodukcji. Nie poprawiano opisów w manifeście bez recenzji. Ponowny automat korzysta z kopii cache Fazy 2 i dodaje zapytania z tytułami EN oraz wariantami nazwisk. Wynik ponownego wyszukiwania: nadal 70/83. Wszystkie 13 braków pozostają w tabeli recenzji; nie zaakceptowano dopasowania wyłącznie po tytule.

## A10: porównanie plansz

[Raport wizualny](reports/puzzle-proportions.html) i [dane porównania](reports/puzzle-proportions.json) obejmują wszystkie pięć dzieł o proporcji większej niż 2:1. Nie ma dzieł o tak skrajnym pionowym formacie w obecnej kolekcji.

| Dzieło | Poprzednia plansza | Zatwierdzona plansza | Pola |
| --- | --- | --- | --- |
| Bitwa pod Grunwaldem | 32×14 | 40×18 | 448 → 720 |
| Hołd pruski | 32×16 | 40×20 | 512 → 800 |
| Sprawa u wójta | 32×14 | 40×18 | 448 → 720 |
| Czwórka | 32×14 | 40×17 | 448 → 680 |
| Czarniecki pod Koldyngą | 32×15 | 40×19 | 480 → 760 |

`puzzleSettings.longEdge` utrwala wybór przy kolejnych generacjach. Osobny wzorzec sygnatur panoram dokumentuje świadome odstępstwo od siatek Fazy 2. Pozostałych 78 pełnych plansz i intro nie zmieniono.

## A11: duże pliki — decyzja zespołu, bez wykonania

| Opcja | Korzyść | Koszt i konsekwencje |
| --- | --- | --- |
| Git LFS tylko od następnych commitów | Kolejne binaria poza zwykłymi obiektami Git | Historyczny ZIP nadal powiększa klony. Instalacja LFS i limity transferu/przechowywania dostawcy; brak wymuszonego pusha |
| Git LFS z migracją historii | Mniejsza historia zwykłego Git, zachowane wersjonowanie oryginałów | Nowe SHA, wymuszony push wszystkich objętych gałęzi/tagów, ponowne klony całego zespołu, uzgodnienie PR-ów i ochrony gałęzi; limity LFS |
| Archiwa poza repo, usunięcie tylko w nowym commicie | Lżejsze bieżące checkouty i jasne miejsce na materiały | Stare obiekty nadal w historii; utrzymanie zewnętrznego magazynu i dostępów. Bez wymuszonego pusha |
| Zewnętrzny magazyn + `git filter-repo` | Usunięcie historycznego ZIP i ewentualnie oryginałów z całej historii | Nieodwracalne usunięcie z publikowanej historii bez kopii, nowe SHA, wymuszony push, nowe klony, aktualizacja otwartych PR-ów, odtworzenie ścieżek assetów przez skrypt pobierania |

Proponowana kolejność po decyzji: kopia bezpieczeństwa → lista plików i gałęzi → ustalenie okna bez pushowania → migracja na kopii → porównanie buildów → dopiero publikacja i nowe klony. Nie uruchomiono migracji, nie usunięto archiwów i nie zmieniono materiałów prezentacji w indeksie.

## B1: PWA

Osobny build pod `/museum` i przeładowanie pokoju offline zakończyły się powodzeniem. Manifest ma względne start_url/scope; Workbox tworzy 135 wpisów precache (ok. 6 MB). Cztery testy e2e sprawdzają realny offline i zatwierdzanie aktualizacji. Fizyczne urządzenia pozostają do sprawdzenia przez zespół.

## B2–B3: powroty i kolekcja

Obraz dnia zachowuje wybór po ukończeniu i przeładowaniu, a kalendarz jest lokalny. Album ma 21 odznak, w tym 12 artystów policzonych z manifestu. Testy: 59 Vitest, 138 e2e zaliczonych / 6 pominiętych, DEV 6. Axe rozszerzono do 20 skanów bez serious/critical. Zrzuty: `/tmp/museum-b23-screens`, `/tmp/museum-b23-*-album.png`.

## B4: lokalny eksport

Pobrane PNG mają dokładnie 1080×1350 (karta) i 1754×1240 (certyfikat). Sprawdzono układ plików wizualnie i pobranie na obu projektach bez błędów konsoli. Imię nie trafia do zapisu. Web Share wymaga rzeczywistego systemowego okna na obsługującym urządzeniu; fallback pobierania sprawdzono automatycznie.

## B5: muzyka po zatwierdzeniu

Zestaw pięciu wykonań CC0 został zatwierdzony w rozmowie. Faktyczne długości, bitrate i rozmiary potwierdzono ffprobe: 10 572 599 bajtów łącznie, największy plik 2 458 270 bajtów. Vitest: 66; pełne e2e 144 zaliczone / 6 pominiętych; DEV 6. Muzyka domyślnie wyłączona, wymaga gestu i zatrzymuje się w tle.

## B6: analityka gotowa do późniejszej aktywacji

Użytkownik zdecydował pozostawić integrację bez produkcyjnej konfiguracji. Vercel custom events wymaga Pro/Enterprise; planu ani usługi nie zmieniano. Testy: 70 Vitest, 152 e2e zaliczone / 6 pominiętych, DEV 6. Adapter w sześciu testach lokalnych przechwytuje skrypt i żądania; sprawdza brak danych bez konfiguracji i po opt-out, dozwolone właściwości i czyszczenie URL. Axe obejmuje również okno informacji: 22 skany bez serious/critical.

## B8: materiały do badania

Siedem dokumentów w `docs/user-testing/` przygotowano do sesji 5–8 osób. Zawierają kryteria sukcesu, osobne pomiary z pomocą, kwestionariusz SUS i dobrowolny quiz po tygodniu z faktycznie odnowionych dzieł. Dane administratora, kontakt i retencja wymagają wypełnienia przez organizatora. Wyniki pozostają puste. Kod i testy identyczne z B6 (d4733f3); nie powtarzano całego przebiegu dla zmian wyłącznie dokumentacyjnych.

## Ograniczenia sprawdzenia

Nie przeprowadzono jeszcze badań z uczestnikami ani instalacji na fizycznym Androidzie/iOS. Pomiar czasu do pierwszej nagrody i test czytnika ekranu wymagają tych sesji. Automatyczne testy i emulacja nie zastępują tych pomiarów.

## B7: końcowe pomiary i regresje

[Raport przed/po z danymi JSON](reports/performance.md) opisuje metodę, wszystkie przebiegi i ograniczenia. Stan kodu: `9aafbb8`. Mediany Performance pięciu widoków: dom 97, hol 99, pokój 97, kolekcja 95, pracownia 92. Accessibility i Best Practices: po 100. LCP pokoju: 3,793 → 2,226 s, biblioteki: 3,858 → 2,286 s; CLS wszystkich widoków: 0. Dom: 369 954 B transferu strony; osobny cache offline ma około 3,91 MiB przed kompresją transportową.

Niezależny LHCI sprawdził cztery adresy × trzy przebiegi: wszystkie progi przeszły, największa mediana LCP 2,410 s. Całe `npm run audit` obejmuje 27 nawigacji Lighthouse, interakcje i CDP. Maksymalny Event Timing przy 992 polach i CPU ×4: 200 → 120 ms w próbce 41 interakcji. Instalowalność i manifest: po 0 błędów. To pomiar laboratoryjny, wymagający późniejszego potwierdzenia terenowego INP.

Pracownia pobiera kod i planszę równolegle. Lżejsze sceny, fonty, ikony i warstwa SVG ograniczają koszt startu. Biblioteka odracza miniatury i opisy oraz zachowuje pozycję i fokus. Zapis pędzla jest opróżniany przed zamknięciem i szybkim ponownym otwarciem. Nieczytelny JSON nie blokuje startu; poprawne ukończenia i obsada ścian pozostają. Testy obejmują też długi tytuł/ciekawostkę dnia w sześciu rozmiarach oraz eksport EN z polskim imieniem i opóźnionym fontem. Imię pozostaje poza zapisem i URL.

Sprawdzenie: lint 0 błędów, typy, 75 Vitest (w tym 5 treści), build, **178 e2e / 6 DEV pominiętych**, prawdziwy DEV **6/6**, **24 skany axe bez serious/critical**, pytest **32 / 4 pominięte**. Ręcznie obejrzano 12 widoków w 375×812 i 1440×1000, dwa komunikaty błędu i PNG. Osobny build `/museum` wznowił offline 1 pomalowane pole z planszy 672 pól i pokazał 83 karty, bez błędów skryptów ani adresów poza prefiksem. Komponenty mają do 295 linii, `HeritageApp` 157. Manifest, obrazy źródłowe i plansze nie zmieniły się w B7.

## Workflow i kroki właściciela

Końcowa kontrola zdalnego CI wykryła brak opcjonalnych zależności peer Puppeteer w lockfile zapisanym npm 12. Uzupełniono je npm 10.9.9, bez aktualizacji istniejących wersji pakietów. Czyste `npm ci` na Node 22.23.4/npm 10.9.9 przeszło. Starsze PR #4, #5, #6, #9 i #13 miały błędy e2e (hover lub timeout); ich nieudane joby uruchomiono ponownie jednokrotnie. Nie oznacza to potwierdzenia zielonego CI dla całego stosu.

Job Lighthouse jest przygotowany w `.github/workflows/ci.yml`, z zachowaniem istniejącej lokalnej definicji testów generatora. Zgodnie z pkt 4.11 dokumentu 16 token gh nie ma uprawnienia `workflow`, więc ostatni commit należy wypchnąć z terminala właściciela przez SSH:

```bash
git push -u origin perf/b7-lighthouse
```

Do tego kroku nowy job nie jest uruchomiony zdalnie. Repozytorium pozostaje stosem PR #1–#14; należy scalać od najwcześniejszej zależności. Nie scalano `main` i nie zmieniano produkcyjnej konfiguracji Vercela. Analityka pozostaje nieaktywna na życzenie użytkownika.

W sesji nie udostępniono narzędzi `get_status`/`bind_pr`; powiązanie PR w aplikacji pozostaje ręczne. Po powiązaniu można rozważyć Auto-fix. Materiały prezentacji w indeksie pozostały nietknięte.

Po stronie zespołu pozostają recenzja treści i szkiców EN (w tym 13 brakujących źródeł), fizyczne urządzenia i czytnik ekranu oraz badanie 5–8 osób z przygotowanych materiałów. Faza 4: nowe epoki, kolekcje z muzeami i tryb szkolny, po wynikach badania. Nie wpisywano fikcyjnych wyników ani metryk retencji.
