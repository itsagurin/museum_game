# 14. Plan rozwoju po hackathonie

> Stan na 3 listopada 2026. Dokument powstał po przeglądzie całego repozytorium `museum_game`, repozytorium `image_generation`, dokumentów 01–13, treści zadania BEST Hacks 2026 i działającej aplikacji (`npm run dev`).
> Zastępuje harmonogramy z dokumentów 05 i 07, które dotyczyły 15-godzinnego sprintu. Decyzje produktowe z dokumentów 07, 10 i 13 pozostają ważne, dopóki ten plan ich wprost nie zmienia.
> **Założenie:** dalej pracuje głównie jedna osoba (frontend) z Claude Code, ok. 10–15 h tygodniowo. Przy większym zespole fazy 2 i 3 mogą biec równolegle.

## 1. Stan wyjściowy: co faktycznie działa

| Obszar | Stan | Gdzie |
| --- | --- | --- |
| Pętla gry | Dom → hol → 4 pokoje → pracownia → odsłonięcie oryginału → historia → nagroda w pokoju | `src/components/HeritageApp.tsx`, `HeritageGame.tsx` |
| Treści | 83 reprodukcje (21/18/22/22), tytuły, autorzy, daty, opisy stylu, ciekawostki (tylko PL) | `src/data/artworks_qa.json`, `artworks_curiosities.json` |
| Kolorowanie | 83 plansze 32×32, 5 kolorów, autouzupełnianie po serii 5 trafień, zoom/przesuwanie, dźwięki, cofanie | `src/components/coloring-canvas.tsx`, `src/lib/coloring.ts` |
| Rozwój pokoju | Poziomy 0–9, 47 dekoracji PNG z ciekawostkami PL/EN i źródłami, animacja nowych nagród | `src/data/room-decorations.ts`, `RoomDecorations.tsx` |
| Dom i hol | 5 etapów domu, 4 warianty holu, zależne od ukończonych epok | `src/data/halls.ts`, `img/house*.jpg` |
| Biblioteka | Filtry, wyszukiwanie bez polskich znaków, podgląd, zawieszanie i zamiana obrazów | `ArtworkLibrary.tsx`, `src/lib/wall-gallery.ts` |
| Zapis | Zustand + localStorage (`heritage-hearth-ui-v1`): język, ukończone ID, obsada ścian | `src/store/useGameStore.ts` |
| Jakość | Vitest 37/37 ✅, `tsc` ✅, ESLint ✅, 10 plików Playwright (mobile + desktop) | `tests/`, `src/**/*.test.ts` |
| Generator plansz | Python: K-Means w CIELAB, 5 kolorów, N×N, FastAPI; testy 16 ✅ / 3 ❌ / 1 pominięty | osobne repo `../image_generation` |

Oprawa wizualna jest mocną stroną: spójne ilustracje, szklany interfejs, perspektywa ram liczona `matrix3d`, mapy dotyku z kanału alfa. Kod jest porządnie typowany i ma testy, czego zwykle brakuje projektom hackathonowym.

## 2. Diagnoza: luki, które blokują dalszy rozwój

Priorytet: **P0** psuje podstawowe doświadczenie lub blokuje publikację, **P1** wyraźnie obniża jakość, **P2** dług techniczny.

| # | Problem | Dowód | Skutek | Prio |
| --- | --- | --- | --- | --- |
| 1 | **Postęp kolorowania nie jest zapisywany.** Pomalowane piksele żyją tylko w `useState`. | `coloring-canvas.tsx` (`painted`), `useGameStore` zapisuje tylko ukończone ID | Wyjście z pracowni albo odświeżenie kasuje do 1024 pomalowanych pól. Główna mechanika karze za przerwę. | P0 |
| 2 | **Blokady epok niepodłączone.** Wszystkie pokoje są otwarte od startu. | AI_MEMORY: „Blokady epok pozostają do podłączenia” | Brak celu i napięcia. Dom i hol zmieniają się, ale gracz nie musi niczego odblokowywać. | P0 |
| 3 | **Brak źródeł i licencji dla 83 reprodukcji.** `ATTRIBUTION.md` opisuje tylko 3 obrazy prototypu. | `public/artworks/ATTRIBUTION.md` | Dzieła są w domenie publicznej (autorzy zmarli do 1946 r.), ale reprodukcje muzealne mają własne warunki. Bez rejestru nie można bezpiecznie publikować ani rozmawiać z muzeami. | P0 |
| 4 | **Treści nie są zweryfikowane.** Ciekawostki i opisy powstały szybko, bez recenzji historyka. | `artworks_curiosities.json`, brak pola „zweryfikowano” | Ryzyko błędów merytorycznych w produkcie edukacyjnym. | P0 |
| 5 | **Brak CI i ustalonego adresu demo.** Nie ma `.github/workflows`. Vercel wdraża `main`, ale projekt jest na koncie właściciela repozytorium, a adres jest techniczny. | katalog repo, wdrożenia `vercel[bot]` | Błędy trafiają na produkcję bez testów; trudno udostępnić stały link do testów z użytkownikami. | P0 |
| 6 | **Generator tnie obraz do kwadratu i ma 5 kolorów.** Panoramy Canaletta tracą boki, plansze wyglądają podobnie. Błąd ciemnych pikseli (RGB `(1,1,1)` → biel). | `image_generation/src/core/pixel_engine.py` (`square_crop_and_resize`, `rgb_to_lab`), `.docs/PROJECT_ANALYSIS.md` | Plansze są mniej czytelne i satysfakcjonujące niż oryginały. | P1 |
| 7 | **Generator żyje poza repo gry.** JSON-y są ręcznie kopiowane do `img/eraN_*_kolorowanie/`. | dwa repozytoria, brak skryptu | Każda nowa epoka to ręczna praca; nie da się odtworzyć plansz. | P1 |
| 8 | **ID obrazów zależą od ścieżki pliku**, np. `01_01 copy.jpg` i `romant1.jpg` w Romantyzmie. | `src/data/eras.ts`, AI_MEMORY: „Nie zmieniaj nazw plików bez migracji” | Każde porządkowanie plików niszczy zapisy graczy. | P1 |
| 9 | **Kolorowanie opiera się na barwie.** Pola pokazują blady odcień zamiast numeru. | zrzut pracowni, `showColorNumbers` dotyczy tylko palety | Osoby z zaburzeniami widzenia barw mają trudność przy 5 zbliżonych brązach. | P1 |
| 10 | **Krzywa nagród na starcie jest płaska.** Pierwszy poziom pokoju wymaga 2–3 obrazów (`floor(9 × n / total)`). Pełna kolekcja to ok. 85 tys. pól. | `src/lib/room-development.ts` | Pierwsza nagroda po ok. 6–10 min. Brakuje szybkiego „wow” w pierwszej sesji. | P1 |
| 11 | **Treści tylko po polsku.** Interfejs EN istnieje, opisy dzieł są PL. | `contentLanguage: pl` | Pierwotna grupa docelowa (obcokrajowcy) jest niedostępna. | P1 |
| 12 | **Ciężkie assety.** `public/` ma 247 MB. Reprodukcje to JPG po 0,3–1,5 MB, dekoracje holu PNG do 30 MB na folder. Brak WebP/AVIF i rozmiarów responsywnych. | `du -sh public/art/*` | Wolny pierwszy start na telefonie. Duże repozytorium (429 obrazów śledzonych w git). | P1 |
| 13 | **Martwy kod i śmieci.** Prototyp `/prototype/` z własnym store, `coloring-canvas` importuje `useProgress` z prototypu, stare foldery w `public/art` (`assets-wojtek`, `romantyzm`, `mloda_polska` ≈ 80 MB), `.DS_Store`, `__MACOSX`, `no te wybrane.zip` (46 MB). | `src/store/use-progress.ts`, `scripts/prepare-assets.mjs` nie czyści celu | Myli kolejne osoby i agentów AI, zwiększa build. | P2 |
| 14 | **Duże pliki-węzły.** `HeritageApp.tsx` 771 linii, `globals.css` 1199 linii. | `wc -l` | Trudne zmiany i code review. | P2 |
| 15 | **Nieaktualna dokumentacja.** README i AI_MEMORY mieszają archiwalne koncepcje (20×20, waluta, średniowiecze) z obecnym stanem. | `README.md`, `AI_MEMORY.md`, docs 01–06 | Agenci AI podejmują decyzje na podstawie starych założeń. | P2 |

## 3. Kierunek produktu: decyzje do podjęcia

Te decyzje wpływają na kolejność prac. Przy każdej jest rekomendacja; pozostałe fazy zakładają rekomendowany wariant.

| Decyzja | Opcje | Rekomendacja i powód |
| --- | --- | --- |
| **D1. Grupa docelowa** | (a) młodzież i młodzi dorośli w Polsce, (b) obcokrajowcy, (c) szkoły | **(a) na start, (c) jako pierwszy kanał B2B.** Treści już są po polsku, a one-pager i jury oceniały ten wariant. Obcokrajowcy wymagają pełnego tłumaczenia i innego marketingu, więc to etap 4. |
| **D2. Platforma** | (a) PWA, (b) Capacitor (sklepy), (c) natywnie | **(a) PWA teraz, (b) po walidacji retencji.** Statyczny eksport już działa i jest tani w hostingu. Capacitor można dodać bez przepisywania. |
| **D3. Konta i backend** | (a) tylko lokalnie, (b) opcjonalne konto i synchronizacja | **(a) do końca fazy 3.** Najpierw trwały zapis lokalny (IndexedDB) i eksport/import zapisu. Backend dopiero przy trybie szkolnym. |
| **D4. Model biznesowy** | (a) darmowe + kolekcje premium, (b) licencje dla szkół, (c) kolekcje sponsorowane przez muzea | **Testować (c) i (b).** Muzea mają budżety edukacyjne i własne zbiory. Kolekcja „Muzeum X” to naturalny produkt, który nie psuje cozy rozgrywki reklamami. |
| **D5. Zakres epok** | (a) zostają 4, (b) dodać Średniowiecze/Barok, (c) dodać XX wiek | **(a) do fazy 3, potem (b).** XX wiek wymaga licencji praw autorskich (twórcy zmarli po 1956 r.), więc jest najdroższy. |
| **D6. Poziom trudności** | (a) stałe 32×32, (b) wybór 16 / 32 / 48 | **(b).** Generator obsługuje dowolne N. Krótka plansza na start poprawia pierwszą sesję, duża daje wyzwanie. |

## 4. Roadmapa

Fazy są uporządkowane według zależności. Każda kończy się warunkiem „gotowe, gdy…”, który można sprawdzić.

### Faza 0 — Porządki i fundament (tydzień 1–2: 3–14 listopada)

Cel: czyste repo, automatyczne sprawdzanie i publiczny adres demo.

1. **Sprzątanie repozytorium**
   - Usunąć `/prototype/` (route group `(prototype)`, `experience.tsx`, `artwork-experience.tsx`, `StoryDialog.tsx`, `use-progress.ts`, `lib/progress.ts`, `public/artworks/`, `public/assets/`, testy prototypu). W `coloring-canvas.tsx` zastąpić `useProgress(...reducedMotion)` wymaganym propem `gentleMotion`.
   - `scripts/prepare-assets.mjs`: przed kopiowaniem czyścić `public/art/` (albo synchronizować z usuwaniem), żeby znikły stare foldery.
   - Usunąć `.DS_Store`, `__MACOSX`, duplikaty `artworks_*.json` z katalogu nadrzędnego. Przenieść materiały hackathonowe (`output/`, PDF-y) do osobnego folderu `archive/` albo poza repo.
   - Zacommitować lub odrzucić nieśledzone `output/prezentacja/`. Gałąź `frontend` jest w pełni scalona z `main`, więc można ją usunąć.
2. **Dokumentacja dla ludzi i agentów**
   - Przepisać `README.md`: aktualny opis, uruchomienie, architektura w 10 linijkach, link do tego planu. Archiwalną koncepcję przenieść do `docs/archive/`.
   - Skrócić `AI_MEMORY.md` do aktualnych reguł. Dodać `CLAUDE.md`, który importuje `AGENTS.md` (`/init`).
3. **CI (GitHub Actions)**: `npm ci` → `lint` → `typecheck` → `test` → `build` → `test:e2e` na buildzie. Cache Playwright. Uruchamiane na PR i `main`.
4. **Wdrożenie**: repozytorium jest już podłączone do Vercela (produkcja z `main`, podglądy PR). Do zrobienia: stały adres publiczny lub własna domena i dostęp do projektu Vercel dla obu osób.
5. **Optymalizacja assetów** (`sharp` jest już w devDependencies):
   - Reprodukcje: WebP/AVIF, 2 rozmiary (miniatura ok. 400 px, pełna ok. 1600 px). Biblioteka ładuje miniatury, podgląd i odsłonięcie ładują pełny rozmiar.
   - Tła scen: WebP przy jakości ok. 80. Dekoracje: przycięte PNG → WebP z alfą.
   - Cel: `out/` < 60 MB, pierwszy ekran < 1,5 MB.
6. **Repozytorium binariów**: `img/` przenieść do Git LFS albo trzymać oryginały poza git i commitować tylko zoptymalizowane wersje.

**Gotowe, gdy:** CI jest zielone na `main`, demo działa pod publicznym adresem, `out/` < 60 MB, w repo nie ma kodu prototypu.

### Faza 1 — Domknięcie pętli gry (tydzień 3–5: 17 listopada – 5 grudnia)

Cel: gra, którą można przejść od zera do końca bez frustracji.

1. **Zapis postępu planszy (P0)**
   - Nowy moduł `src/lib/painting-progress.ts`: zapis zbioru pomalowanych indeksów per dzieło jako bitset (1024 pola = 128 B, w base64). Klucz: `artworkId` + hash siatki (`puzzleVersion`), żeby zmiana planszy nie dała niespójnego stanu.
   - Magazyn: IndexedDB (np. `idb-keyval`) z fallbackiem na localStorage. Zapis z debounce co 1–2 s i przy `visibilitychange`/`pagehide`.
   - Kartka na ścianie pokazuje mały pasek „W trakcie · 42%”. Zgodnie z ustaleniem kartka z krzyżykiem pozostaje do ukończenia.
   - Testy: jednostkowe dla bitsetu i zmiany wersji, e2e: maluj → wyjdź → odśwież → wróć.
2. **Blokady epok i finał (P0)**
   - Funkcja `getEraAccess(eraId, completed)` w `src/lib/room-development.ts`. Rekomendacja: następna epoka otwiera się po osiągnięciu w poprzedniej **poziomu 3** (ok. ⅓ kolekcji), a nie całej kolekcji. Pełne 21 obrazów przed drugim pokojem to zbyt długi próg.
   - Hol: kłódka, komunikat „Odnów jeszcze N obrazów w Oświeceniu”, drzwi w pokoju prowadzą dalej tylko gdy są otwarte. Bezpośredni adres `/#era-3` respektuje blokadę.
   - Ekran ukończenia epoki: animacja zmiany domu i holu, podsumowanie poznanych dzieł.
   - Finał po 4 epokach: ukończony dom, album kolekcji, certyfikat do pobrania (PNG).
   - Zmiana modelu zapisu: `version: 2` w `persist` z funkcją `migrate`.
3. **Pierwsza sesja i onboarding (P1)**
   - Startowy pokój ma 1 krótki obraz 16×16 jako samouczek (3–4 min). Pierwsza nagroda w pokoju po **1** obrazie: zmienić progi na nieliniowe, np. `[1, 3, 5, 8, 11, 14, 17, 19, all]` liczone proporcjonalnie do kolekcji.
   - 3 krótkie podpowiedzi kontekstowe (wybierz kolor → maluj → seria uruchamia autouzupełnianie). Bez osobnego ekranu tutorialu.
4. **Czytelność i dostępność planszy (P1)**
   - Numery na polach przy powiększeniu ≥ 2× (przy 32×32 na telefonie pole bez zoomu ma ok. 9 px).
   - Podświetlenie pól wybranego koloru i licznik pozostałych pól przy każdym kolorze w palecie.
   - Tryb wysokiego kontrastu / dla daltonistów: wzory lub numery zamiast samych odcieni.
   - Audyt WCAG 2.2 AA (kontrast szkła na jasnych tłach, focus, `aria-live` dla postępu).
5. **Refaktor `HeritageApp.tsx` (P2, przy okazji punktów 1–2)**: wydzielić `HouseScene`, `HallScene`, `RoomScene`, `AppHeader`, `SettingsPanel`, hook `useRewardsQueue`. Podzielić `globals.css` na pliki per scena (lub CSS Modules). Cel: żaden komponent > 300 linii.

**Gotowe, gdy:** nowy gracz przechodzi samouczek w < 5 min i dostaje pierwszą nagrodę w pokoju, postęp przetrwa odświeżenie w każdym momencie, epoki 2–4 są zablokowane do spełnienia warunku, istnieje ekran finału, a e2e pokrywa całą ścieżkę z zapisem (z narzędziem DEV do szybkiego wypełniania).

**Stan na gałęzi `feat/faza-1` (3 listopada 2026):**

- [x] Zapis postępu planszy: bitset w `localStorage` (`heritage-paintings-v1`, ok. 172 znaki na obraz) zamiast IndexedDB. Przy 83 obrazach to ok. 15 KB, więc dodatkowa biblioteka nie była potrzebna. Kartka pokazuje procent rozpoczętego obrazu.
- [x] Blokady epok na poziomie 3 poprzedniej epoki (decyzja 3.11), w holu, drzwiach pokojów, przełączniku, adresach `/#era-N` i bibliotece. Ustawienie „Otwórz wszystkie epoki” jako tryb zwiedzania.
- [x] Progi nieliniowe: pierwszy obraz zawsze daje poziom 1 (decyzja 3.11).
- [x] Okna „Nowa epoka otwarta”, „Epoka ukończona” (z nowym wyglądem domu) i finał.
- [x] Numery na polach przy przybliżeniu i widoczne liczniki pozostałych pól w palecie.
- [x] Testy: 32 jednostkowe, 100 e2e (nowy `tests/progression.spec.ts`).
- [ ] Samouczek na planszy 16×16: wymaga generatora v2 (faza 2).
- [ ] Krótkie podpowiedzi przy pierwszym kolorowaniu, tryb wysokiego kontrastu, audyt WCAG.
- [ ] Certyfikat PNG w finale.
- [ ] Refaktor `HeritageApp.tsx`: po zmianach ma 870 linii, więc podział na sceny jest pilniejszy niż wcześniej.

### Faza 2 — Treści, wiarygodność i generator (tydzień 6–10: 8 grudnia – 16 stycznia)

Cel: treści, którym można zaufać, i powtarzalny proces dodawania nowych dzieł.

1. **Jeden manifest treści** `content/artworks.json` (lub `.ts` z walidacją Zod), jako źródło prawdy zamiast trzech plików i nazw plików:
   ```ts
   interface ArtworkEntry {
     id: string;            // stały slug, np. "wankowicz-mickiewicz-judah"
     legacyIds: string[];   // stare ID oparte na ścieżce → migracja zapisów
     eraId: EraId;
     title: Localized; artist: string; year: string;
     image: { file: string; width: number; height: number };
     source: { institution: string; url: string; license: "PD" | "CC0" | "CC BY" | string; retrieved: string };
     puzzle: { file: string; version: string; sizes: number[] };
     story: Localized; curiosity: Localized;
     review: { status: "draft" | "verified"; by?: string; date?: string };
   }
   ```
   - Skrypt `scripts/validate-content.mjs` w CI: każde dzieło ma źródło, licencję, planszę, plik i tłumaczenie (lub jawny brak).
   - Zmiana nazw `01_01 copy.jpg`, `romant1.jpg`, `NN_NN.jpg` na opisowe slugi, z migracją zapisów przez `legacyIds` (`wallAssignments` i `completedArtworkIds`).
2. **Rejestr źródeł i licencji (P0)**: dla 83 dzieł link do Wikimedia Commons / Cyfrowego MNW / Polony i warunki reprodukcji. Strona „Źródła” w aplikacji generowana z manifestu.
3. **Weryfikacja merytoryczna (P0)**: lista kontrolna dla każdego dzieła (data, autor, tytuł zgodny z muzeum, ciekawostka z przypisem). Najlepiej konsultacja z nauczycielem historii/plastyki lub studentem historii sztuki. W UI pokazywać tylko `verified`, albo oznaczać pozostałe.
4. **Generator v2 — przeniesienie do monorepo** jako `tools/pixel-engine/` (Python) z komendą `npm run content:puzzles`:
   - Siatka zgodna z proporcjami obrazu (np. 32×24, 24×32) zamiast kwadratowego wycinka. Frontend już obsługuje dowolne `width × height` do 128.
   - Paleta 6–10 kolorów zależnie od obrazu (kryterium: minimalna odległość ΔE między kolorami, żeby uniknąć prawie identycznych brązów).
   - Poprawić `rgb_to_lab` (błąd ciemnych pikseli), walidację schematu i 3 niezaliczone testy.
   - Kilka rozmiarów: 16 (łatwy), 32 (normalny), 48 (trudny).
   - Raport jakości: zestawienie oryginał / pixel art dla każdego dzieła w HTML, do ręcznej akceptacji.
5. **Tłumaczenie EN** opisów i ciekawostek (szkic przez LLM, ręczna korekta). Pole `contentLanguage` przestaje być potrzebne.

**Gotowe, gdy:** `npm run content:validate` przechodzi w CI, każde z 83 dzieł ma źródło, licencję i status recenzji, plansze generuje jedna komenda z repo gry, a zmiana nazwy pliku nie psuje zapisu gracza.

### Faza 3 — Retencja, PWA i testy z użytkownikami (tydzień 11–15: 19 stycznia – 20 lutego)

Cel: sprawdzić, czy ludzie wracają, i dać im powód do powrotu.

1. **PWA**: manifest, ikony, service worker (np. Serwist) z cache scen i aktualnie otwartych plansz. Instalacja na ekran główny i gra offline.
2. **Mechaniki powrotu** (zgodne z cozy, bez presji):
   - „Obraz dnia” z krótką planszą i ciekawostką.
   - Album kolekcji: postęp per artysta/epoka, odznaki (np. „Wszystkie Canaletta”).
   - Karta do udostępnienia: PNG „przed/po” z tytułem i linkiem (Web Share API).
3. **Dźwięk i atmosfera**: muzyka tła per epoka (domena publiczna: Chopin, Moniuszko, Szymanowska; nagrania z licencją CC), suwak głośności, domyślnie wyciszone.
4. **Analityka szanująca prywatność** (Plausible / Umami, bez cookies): ukończenie samouczka, czas do pierwszej nagrody, ukończone obrazy na sesję, powroty D1/D7, porzucone plansze.
5. **Testy z użytkownikami**: 5–8 osób z grupy docelowej, scenariusz z one-pagera (ukończenie pierwszego obrazu, chęć powrotu, zapamiętanie ciekawostki). Po tygodniu krótki quiz: czy pamiętają autora i ciekawostkę.
6. **Wydajność**: Lighthouse mobile ≥ 90 (Performance, Accessibility). Wirtualizacja siatki biblioteki przy większej kolekcji.

**Gotowe, gdy:** aplikacja instaluje się jako PWA i działa offline, jest dashboard z metrykami retencji, przeprowadzono ≥ 5 testów z notatkami i listą poprawek.

### Faza 4 — Skalowanie i model biznesowy (od marca 2027)

Kolejność zależy od wyników fazy 3.

- **Nowe epoki**: Średniowiecze i Barok (domena publiczna; nowe tła pokoju, holu i etap domu). Proces z fazy 2 sprawia, że epoka to głównie praca nad treścią i grafiką.
- **Kolekcje partnerskie**: integracja z API (Europeana, Cyfrowe MNW, Polona) do wyszukiwania dzieł. Pilotaż „kolekcji muzeum” z jedną instytucją (MNW, MNK, Zamek Królewski, Łazienki).
- **Tryb szkolny**: nauczyciel tworzy zestaw dzieł → link/kod dla klasy, quiz po obrazie zgodny z podstawą programową plastyki/historii (kl. 4–8). Wymaga lekkiego backendu (np. Supabase) i zgód RODO dla danych uczniów.
- **Konto i synchronizacja** (opcjonalnie): logowanie bez hasła, synchronizacja zapisu między urządzeniami.
- **Sklepy z aplikacjami**: opakowanie PWA w Capacitor (iOS/Android) po potwierdzeniu retencji.
- **Języki**: EN gotowy w fazie 2; następnie UA/DE według danych o ruchu.

## 5. Docelowa architektura (kierunek, nie jednorazowy rewrite)

```text
museum_game/
  content/                 # źródło prawdy: manifest dzieł, epok, dekoracji, źródła
  tools/pixel-engine/      # generator plansz (Python), dawniej osobne repo
  scripts/                 # prepare-assets, optimize-images, validate-content, puzzles
  src/
    app/                   # route (heritage) + strona "Źródła"
    features/
      scenes/              # HouseScene, HallScene, RoomScene, GameViewport
      painting/            # ColoringCanvas, paleta, zapis postępu planszy
      library/             # ArtworkLibrary, wall-gallery
      decorations/         # RoomDecorations + geometria
      progression/         # poziomy, blokady epok, nagrody, finał
    store/                 # useGameStore v2 (slices: settings, progress, gallery) + migracje
    lib/                   # czyste funkcje z testami
```

Zasady:
- Logika gry (poziomy, blokady, nagrody, zapis) to czyste funkcje w `lib/` z testami jednostkowymi. Komponenty tylko je wywołują.
- Każda zmiana formatu zapisu podnosi `version` i ma `migrate` z testem na zapisie z poprzedniej wersji.
- Treść nigdy nie jest identyfikowana nazwą pliku, tylko stałym `id`.
- Statyczny eksport zostaje domyślnym trybem. Backend pojawia się dopiero przy funkcji, która go wymaga (tryb szkolny, synchronizacja).

## 6. Metryki sukcesu

| Metryka | Cel po fazie 3 |
| --- | --- |
| Ukończenie pierwszej planszy przez nowego gracza | ≥ 70% |
| Czas do pierwszej nagrody w pokoju | < 5 min |
| Powrót następnego dnia (D1) | ≥ 25% |
| Zapamiętana ciekawostka po tygodniu (test) | ≥ 50% badanych |
| Lighthouse mobile: Performance / Accessibility | ≥ 90 / ≥ 95 |
| Rozmiar pierwszego ładowania | < 1,5 MB |

## 7. Ryzyka

| Ryzyko | Prawdopodobieństwo | Ograniczenie |
| --- | --- | --- |
| Błędy merytoryczne w treściach | Średnie | Status `review` w manifeście, recenzent spoza zespołu, przypisy |
| Warunki licencji reprodukcji muzealnych | Średnie | Rejestr źródeł w fazie 2, preferować Wikimedia PD/CC0 |
| Utrata zapisów graczy przy zmianach | Wysokie bez migracji | Wersjonowany zapis, `legacyIds`, testy migracji |
| Rozrost zakresu (backend, konta, AR) | Wysokie | Twarde kryteria „gotowe, gdy” i decyzje D1–D6 przed fazą 4 |
| Monotonia kolorowania przy 83+ obrazach | Średnie | Rozmiary 16/32/48, obraz dnia, kolekcje, zróżnicowane palety |
| Brak czasu jednej osoby | Wysokie | Fazy 0–1 dają kompletny produkt nawet bez dalszych faz |

## 8. Najbliższe 2 tygodnie: konkretne zadania

Każde zadanie to osobny commit/PR, sprawdzony przez CI. Stan na gałęzi `chore/faza-0` (3 listopada 2026):

- [x] Usunąć prototyp `/prototype/` i zależność `coloring-canvas` → `use-progress`. Usunięto też nieużywane `buildRegions`, `AmbientSound`, `artworks_db.json` i zależności `motion`, `@fontsource/manrope`, `@fontsource/plus-jakarta-sans`.
- [x] `prepare-assets.mjs`: publikacja tylko używanych plików, czyszczenie `public/art/`, zmniejszanie grafik (reprodukcje 1600 px, dekoracje 768 px, mozjpeg) i cache. `public/art` 244 MB → 32 MB, `out/` 169 MB → 35 MB.
- [x] Miniatury WebP 480 px w siatce biblioteki, z fallbackiem na oryginał.
- [x] Next.js 16.4.0 → 16.4.4 (krytyczne luki GHSA-2464-fhr4-w9xw, GHSA-673q-mjm6-r5xr; build 16.4.0 był blokowany).
- [x] GitHub Actions: lint, typecheck, vitest, build i Playwright dla PR i `main`. Wdrożenie zostaje na istniejącym Vercelu.
- [x] Nowy README, krótki AI_MEMORY, `CLAUDE.md`, archiwum `docs/archive/`.
- [ ] Sprawdzić podgląd Vercel dla PR i ustalić stały publiczny adres (projekt Vercel jest na koncie właściciela repozytorium).
- [ ] Zdecydować o `output/prezentacja/`, `photo_*.jpg` (nieśledzone) i usunięciu zdalnej gałęzi `frontend` (w pełni scalona).
- [ ] Git LFS lub przeniesienie oryginałów z `img/` poza repozytorium (wymaga przepisania historii, decyzja zespołu).
- [ ] Zapis postępu planszy (bitset + IndexedDB) z testami: start fazy 1.

## 9. Narzędzia Claude Code na kolejnych etapach

| Etap | Skill / polecenie | Zastosowanie |
| --- | --- | --- |
| Faza 0 | `/init` | `CLAUDE.md` na bazie `AGENTS.md` i aktualnego stanu |
| Faza 0 | `/fewer-permission-prompts` | Mniej pytań o `npm test`, `git status` itp. |
| Każdy PR | `/code-review`, `/simplify` | Przegląd poprawności i uproszczeń przed scaleniem |
| Każdy PR | `run` | Uruchomienie gry i sprawdzenie zmiany w przeglądarce |
| Faza 1, 3 | Plugin **Design** (`accessibility-review`, `design-critique`, `ux-copy`) | Audyt WCAG, krytyka ekranów, teksty interfejsu |
| Faza 1, 3 | Plugin **Axe Accessibility** | Automatyczne skany dostępności w pętli |
| Faza 1–3 | Plugin **frontend-design** | Nowe ekrany (finał, album, obraz dnia) w spójnym stylu |
| Faza 2–4 | Plugin **Product Management** (`write-spec`, `sprint-planning`, `roadmap-update`) | Specyfikacje funkcji, planowanie sprintów, aktualizacja tego planu |
| Faza 3–4 | `anthropic-skills:deep-research` | Analiza konkurencji (pixel art, Smartify, Arts & Culture) i programów edukacyjnych muzeów |
| Faza 3 | `dataviz` | Dashboard metryk retencji |
| Faza 4 | `anthropic-skills:pptx` / `pdf` | Pitch dla muzeów i szkół |
| Przed publikacją | `/security-review` | Przegląd przed dodaniem backendu i kont |

## Stan poprawek po Fazie 2 — `refactor/a1-scenes-shell` (3 listopada 2026)

- [x] Faza 2 zapisana osobno i otwarta jako PR #3, bazujący na `feat/faza-1`. Materiały prezentacji i lokalna zmiana workflow poza commitem.
- [x] A1: sceny, panele, hooki progresji i CSS wydzielone; `HeritageApp` ma 125 linii; wszystkie komponenty mieszczą się w 300 liniach.
- [x] A2–A6: renderowanie początkowe, odmiana nazw, nazwy palety, sygnatury plansz i cofanie.
- [x] A7–A8: samouczek i dostępność.
- [x] A9–A11: źródła, raport proporcji i opcje porządków binariów.
- [x] B1: PWA.
- [x] B2–B3: obraz dnia, seria, album i odznaki.
- [x] B4: karty i certyfikat.
- [ ] B5: muzyka po zatwierdzeniu nagrań.
- [ ] B6: Vercel Analytics, domyślnie włączone z możliwością wyłączenia.
- [ ] B7: wydajność i osobny job LHCI.
- [ ] B8: materiały do badań.

Decyzje z sekcji 5 dokumentu 16 zatwierdzone: A1=a (samouczek 16), A2=a (bez etykiety treści), B1=a (zwykła plansza dnia), B2=a (seria), B3=Vercel, B4=a (domyślnie włączone), B6=a (ikona z domu), B7=a (LHCI). Nagrania muzyczne i zmiany proporcji plansz wymagają osobnej decyzji. Przepisanie historii Git pozostaje poza zakresem bez decyzji zespołu.

**Stan `fix/a2-a6-painting`:** neutralny start do hydratacji obu store, odmienione nazwy epok, unikalne palety PL/EN, sygnatury w manifeście i poprawne cofanie po wznowieniu. Porównanie 83 plansz potwierdziło identyczne siatki, ID palety i HEX. Testy jednostkowe: 44; generator: 28 zaliczonych / 4 pominięte.

**Stan `feat/a7-a8-onboarding`:** plansza intro 16×12, trzy podpowiedzi i trwałe pomijanie po pierwszej pracowni; wysoki kontrast, zoom 1,5 na telefonie, nawigacja strzałkami. Axe dla 9 widoków × 2 projekty: zero serious/critical; samouczek i kontrast: 4 e2e; razem 22/22 testy audytu. Generator: 30 zaliczonych / 4 pominięte. Rzeczywisty czas pierwszego przejścia pozostaje do pomiaru podczas badania użytkowników.

**Stan `feat/a9-a11-content-review`:** recenzja i propozycje w docs/15; raport porównawczy pięciu panoram w docs/reports. Użytkownik zatwierdził bok 40 dla panoram; generator respektuje ustawienie w manifeście, nowe sygnatury odrzucają stare bitsety tych pięciu dzieł. Opis opcji LFS i migracji historii w docs/17, bez wykonania. Poszukiwanie brakujących źródeł nie zastępuje recenzji merytorycznej.

**Stan `feat/b1-pwa`:** manifest, ikony (własna ilustracja), Workbox (135 plików / ok. 6 MB precache), runtime cache, komunikat aktualizacji z decyzją gracza i nagłówki Vercel. Przeładowanie offline pod `/museum` sprawdzone. Cztery e2e sprawdzają odwiedzoną planszę offline i oczekującą aktualizację na obu projektach. Pobieranie całej epoki offline było opcjonalne i pozostaje poza zakresem.

**Stan `feat/b2-b3-collection`:** stały obraz dnia, ukończenie i ciekawostka na karcie, seria bez utraty nagród, zapis z walidacją 60 dat; album i 21 odznak z regułami artystów przez epoki. Vitest: 59. Audyt rozszerzony o album: 20 skanów bez serious/critical. Test z kontrolą zegara sprawdza stałość wyboru po ukończeniu/przeładowaniu oraz zmianę kolejnego dnia.

**Stan `feat/b4-sharing`:** lokalna karta 1080×1350 i certyfikat finału 1754×1240, pobranie zamiast niedostępnego Web Share, imię bez zapisu i wysyłki, atrybucja źródła na karcie. Vitest: 62. Cztery e2e pobierają pliki, sprawdzają wymiary i brak błędów konsoli; zrzuty/PNG do przeglądu w `/tmp/museum-b4`.
