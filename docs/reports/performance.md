# B7 — pomiary wydajności

Pomiar 4 listopada 2026 (Europe/Warsaw). Stan przed: `26ec4c6` (B8); stan po: `9aafbb8`, [PR #14](https://github.com/itsagurin/museum_game/pull/14). Budżety lokalnego audytu zostały spełnione dla median z trzech przebiegów.

## Przed i po

Każda komórka to mediana danej metryki z trzech zimnych nawigacji. Transfer w kB dziesiętnych jest metryką Lighthouse `total-byte-weight` strony.

| Widok | Performance przed → po | LCP przed → po (s) | CLS przed → po | Transfer przed → po (kB) |
| --- | --- | --- | --- | --- |
| Dom | 92 → 97 | 1,512 → 0,901 | 0,0011 → 0 | 629,2 → 370,0 |
| Hol | 94 → 99 | 1,422 → 0,900 | 0,0000 → 0 | 580,5 → 283,6 |
| Pokój I | 78 → 97 | 3,793 → 2,226 | 0,0000 → 0 | 637,4 → 288,2 |
| Biblioteka | 72 → 95 | 3,858 → 2,286 | 0,1220 → 0 | 728,6 → 298,7 |
| Pracownia (intro 192 pola) | 65 → 92 | 6,900 → 0,900 | 0,0000 → 0 | 1494,0 → 346,2 |

Accessibility po zmianach: **100** we wszystkich pięciu widokach. Best Practices: **100** (przed: 92–96). Cele: Performance ≥ 90, Accessibility/Best Practices ≥ 95, LCP < 2,5 s, CLS < 0,1, transfer domu < 1,5 MB. Pracownia ma medianę 92; jeden z jej trzech przebiegów uzyskał 88. Wszystkie wyniki i indeksy benchmarku pozostają w JSON.

[Dane przed](performance-before.json) · [dane po, w tym wszystkie 15 przebiegów](performance-after.json) · [odrębne mediany LHCI](performance-lhci.json).

## Metoda i granice pomiaru

- Lighthouse 13.6.0, Chromium 156, Node 26.12.1; minimalny Node projektu 22.19. Domyślna emulacja mobilna 412×823, DPR 1,75, symulowane RTT 150 ms, przepustowość 1638,4 Kb/s i CPU ×4.
- Oba buildy eksportu były serwowane tym samym narzędziem HTTP/2 z prekompresją Brotli 11, zakończoną przed uruchomieniem pomiaru. Tymczasowy certyfikat i wyjątek jego weryfikacji dotyczą wyłącznie narzędzi na localhost. To jawny model transportu; parametry Vercela nie były odwzorowywane.
- Linux, Intel Core Ultra 9 185H; proces audytu ograniczony przez `taskset -c 2-11`. Nie zmieniano ustawień zasilania ani aplikacji użytkownika. Aktywność systemu wpływa na wyniki; indeksy benchmarku są zapisane przy każdym przebiegu.
- Świeży gracz, bez własnego zapisu. Pracownia jest otwierana przez istniejący przycisk obrazu w pokoju I i potwierdzana obecnością 192 pól intro. Jej tytuł jest widoczny podczas pobierania kodu i planszy. Płynność malowania po otwarciu większej planszy sprawdzono osobno poniżej. `AUDIT_FULL_BOARD=1` pozwala dodatkowo mierzyć pełną planszę.
- Transfer domu po zmianach to **369 954 B** dla strony. Instalacja offline przez service worker buduje osobny cache **143 plików / około 3,91 MiB przed kompresją transportową**. Całkowite pobieranie przy pierwszej wizycie może przekraczać 1,5 MB; budżet w tabeli opisuje transfer foreground raportowany przez Lighthouse.

## Interakcje: 992 pola z numerami

375×812, DPR 1, CPU ×4, automatyczne kolorowanie wyłączone. 41 zaufanych interakcji: zoom, pięć wyborów palety, 30 naciśnięć Enter malujących piksele i pięć cofnięć. Weryfikacja końcowa: 25 pomalowanych pól i 967 widocznych numerów. Event Timing zbiera próbki od 16 ms.

| Próba | Maksymalny Event Timing | Wynik progu < 200 ms |
| --- | --- | --- |
| Przed | 200 ms | Niespełniony |
| Po | 120 ms | Spełniony |

[Próbki przed](performance-interactions-before.json) · [próbki po](performance-interactions-after.json). To laboratoryjny wskaźnik responsywności dla tej sekwencji, wymagający późniejszego potwierdzenia terenowym INP.

## Co zmieniono

Pracownia pobiera swój kod i JSON równolegle po wyborze obrazu. Dostępny ekran oczekiwania zachowuje fokus i pozwala wrócić do pokoju. Motion jest odroczony do paneli, pracowni i dekoracji, a sceny mają wejście CSS. Lekki interfejs kolekcji pozostał w głównym pakiecie po pomiarze kosztu dodatkowego żądania. Pełne opisy są osobnym pakietem; atrybucja pozostaje w metadanych początkowych.

Sceny mają AVIF, miniatury lżejszy WebP, ikony mniejszą paletę, a fonty WOFF2 obejmują Latin i Latin Extended. Waga 600 zawiera znaki tekstów gry; pozostałe publikowane podzbiory zachowują pełny zestaw, w tym imię certyfikatu w wadze 500. Eksport PNG jawnie czeka na fonty dla rysowanego tekstu. Źródła obrazów i plansze w `img/` pozostają bez zmian.

Wymiary miniatur i stałe proporcje kart usuwają przesunięcia. Memo i IntersectionObserver ograniczają pracę kolekcji poza ekranem. Tło SVG planszy ma jedną ścieżkę na kolor, a każde pole nadal ma osobny dostępny przycisk. Oryginał reprodukcji jest pobierany przy 80% pól; efekty dźwiękowe dopiero przy użyciu.

Zapis pędzla jest opróżniany synchronicznie przed zamknięciem i ponownym otwarciem; nowa sesja ma pustą historię cofania. Nieczytelny JSON jednej części zapisu zwalnia ekran oczekiwania, a zdrowa część pozostaje zachowana. Komunikat można zamknąć. Karta dnia z długim tytułem i ciekawostką pozostawia wejście dostępne w sześciu rozmiarach, a biblioteka odtwarza pozycję i fokus po powrocie z opisu.

## Sprawdzenie

- Lint: 0 błędów (3 istniejące ostrzeżenia JS w venv sklearn); typy, build, 75 Vitest, w tym 5 walidacji treści.
- Kontrola CI wykryła niepełny lockfile utworzony npm 12: npm 10.9.9 odrzucił brakujące opcjonalne zależności peer narzędzia Puppeteer. Lockfile uzupełniono npm 10 bez zmiany wersji i integralności istniejących pakietów; czysta instalacja na Node 22.23.4/npm 10.9.9 przeszła. Kod i artefakt pomiarowy pozostają z `9aafbb8`.
- Eksport: **178 e2e zaliczonych, 6 DEV pominiętych**. Prawdziwy serwer DEV: **6/6**. **24 skany axe** bez serious/critical. Pytest: **32 zaliczone / 4 pominięte** z powodu danych spoza repo.
- Ręczny przegląd 12 ekranów domu, holu, pokoju, pracowni, kolekcji i ustawień w 375×812 oraz 1440×1000, dwóch komunikatów uszkodzonego zapisu i PNG certyfikatu z polskim imieniem w EN. Zrzuty lokalnie: `/tmp/museum-b7-verified-screens/` oraz `/tmp/museum-b4/`.
- Osobny build `/museum`: 672 pola, zachowany jeden pomalowany piksel po przeładowaniu offline, 83 karty kolekcji offline, brak błędów skryptów i żądań poza prefiksem.
- CDP: **0 błędów instalowalności i 0 błędów manifestu**; [wynik](performance-installability.json). Lighthouse 13 nie ma kategorii PWA. Fizyczna instalacja Android/iOS, czytnik ekranu i badanie użytkowników pozostają po stronie zespołu.

## LHCI i odtworzenie

`npm run build` → `npx playwright install chromium` → `npm run audit`. Do porównania na tym hoście użyto `taskset -c 2-11 npm run audit`. Polecenie uruchamia 12 pomiarów LHCI (cztery widoki × trzy) oraz osobne 15 pomiarów pięciu widoków, interakcje i kontrolę CDP. Całość zakończyła się kodem 0.

LHCI sprawdza cztery osobne grupy adresów. Parametr `audit-scene` zachowuje ich rozdzielenie, gdy Lighthouse zapisuje `finalUrl` bez hasha. Pracownię sprawdza dodatkowy scenariusz otwarcia przez przycisk. Wszystkie progi pozostają rygorystyczne; surowe raporty HTML/JSON są w `.lighthouseci/`, a job CI przechowuje je przez 14 dni.

Upload jawnie włącza `include-hidden-files`, aby zachować raporty z ukrytego katalogu `.lighthouseci`; domyślne wykluczanie takich plików opisuje [dokumentacja upload-artifact v4](https://github.com/actions/upload-artifact/blob/v4/README.md#uploading-hidden-files).

Job workflow jest przygotowany w osobnym lokalnym commicie. Zgodnie z pkt 4.11 dokumentu 16 użytkownik wypycha go przez SSH, ponieważ token gh nie ma zakresu workflow. Do tego czasu zdalne uruchomienie nowego jobu pozostaje niewykonane.
