# 17. Raport poprawek i Fazy 3

Stan roboczy: 3 listopada 2026. Kolejne PR-y bazują na poprzednich, dopóki ich bazy nie zostaną scalone.

| Pakiet | PR | Sprawdzenie |
| --- | --- | --- |
| Faza 2: manifest i generator | [#3](https://github.com/itsagurin/museum_game/pull/3) | 34 Vitest, 26 pytest / 4 pominięte, build |
| A1: podział kodu i CSS | [#4](https://github.com/itsagurin/museum_game/pull/4) | 100 e2e / 6 DEV pominiętych, DEV 6, 12/12 identycznych par zrzutów |
| A2–A6: start i zapisy | [#5](https://github.com/itsagurin/museum_game/pull/5) | 44 Vitest, 108 e2e / 6 pominiętych, DEV 6, pytest 28 / 4 pominięte; 83 siatki i palety HEX zachowane |
| A7–A8: samouczek i dostępność | [#6](https://github.com/itsagurin/museum_game/pull/6) | 44 Vitest, 130 e2e / 6 pominiętych, DEV 6, pytest 30 / 4 pominięte; 18 skanów axe bez serious/critical |

W każdym pakiecie kodu wykonano lint, typecheck, walidację treści i build. Ostrzeżenia ESLint (3) pochodzą z JS w venv sklearn, nie z gry. Cztery pomijane testy Python potrzebują danych spoza repo. Raporty, trace i zrzuty są lokalnie w `/tmp/museum-a1`, `/tmp/museum-a2-*`, `/tmp/museum-a7-*`.

## Decyzje zatwierdzone w rozmowie

- D-A1: skrócone intro 16; D-A2: bez oznaczania niezweryfikowanej treści w UI.
- D-B1: zwykła plansza dnia; D-B2: widoczna łagodna seria.
- D-B3: Vercel Analytics; D-B4: domyślnie włączone z możliwością wyłączenia.
- D-B6: tymczasowa ikona z `house4.jpg`; D-B7: osobny job LHCI.
- A10: bok 40 dla pięciu panoram. Użytkownik otrzymał raport i informację o utracie pomalowanych pól rozpoczętych plansz objętych zmianą. Ukończenia i obsada ścian pozostają.
- Muzyka: dopiero po zatwierdzeniu konkretnych nagrań. Historia Git: bez zmian.

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

## Ograniczenia sprawdzenia

Nie przeprowadzono jeszcze badań z uczestnikami ani instalacji na fizycznym Androidzie/iOS. Pomiar czasu do pierwszej nagrody i test czytnika ekranu wymagają tych sesji. Automatyczne testy i emulacja nie zastępują tych pomiarów.
