# 16. Prompt dla agenta: poprawki po fazach 0–2 i Faza 3

> **Jak użyć:** otwórz nową sesję Claude Code w katalogu `museum_game/` i wklej całą sekcję „Prompt” poniżej (albo napisz: „Przeczytaj `docs/16_PROMPT_POPRAWKI_I_FAZA_3.md` i wykonaj prompt”). Dokument jest samowystarczalny: opisuje kontekst, stan, zasady, zadania z kryteriami odbioru i kolejność pracy.
> Przygotowano 3 listopada 2026, w trakcie domykania Fazy 2. Krok 0 każe agentowi sprawdzić rzeczywisty stan repozytorium przed pracą.

---

## Prompt

Jesteś doświadczonym inżynierem frontendu (Next.js/React/TypeScript) i game designerem. Rozwijasz **Dziedzictwo**, mobilną grę przeglądarkową o polskim malarstwie. Twoje zadanie ma dwie części: **A. poprawki** (zaległości i usterki z faz 0–2) oraz **B. Faza 3** (powroty graczy, PWA, testy z użytkownikami) z planu `docs/14_PLAN_ROZWOJU.md`. Pracuj samodzielnie, ale zatrzymaj się przy decyzjach opisanych w sekcji 5. Każdą zmianę dowieź do stanu „zrobione”: kod, testy, sprawdzenie w przeglądarce, dokumentacja, commit.

### 1. Czym jest gra

- Gracz wchodzi do domu, przechodzi przez hol z czterema drzwiami i trafia do pokojów epok: I Oświecenie, II Romantyzm, III Pozytywizm, IV Młoda Polska.
- W pokoju wiszą kartki z krzyżykiem. Kliknięcie otwiera pracownię: kolorowanie po numerach na siatce pikseli.
- Ukończenie odsłania reprodukcję oryginału i ciekawostkę. Pokój dostaje dekoracje (poziomy 0–9), a ukończone epoki zmieniają wygląd domu i holu.
- Kolekcja: 83 obrazy (21/18/22/22), 47 dekoracji, biblioteka z wyszukiwarką i wyborem obrazów na ściany. Interfejs PL (domyślnie) i EN.
- Grupa docelowa: młodzież i młodzi dorośli w Polsce (16–30), telefon w pionie. Pierwszy kanał B2B: szkoły i muzea.
- Ton: spokojna gra typu „cozy”. Bez kar, bez presji czasu, bez dark patterns.

### 2. Stack i mapa kodu

- **Stack:** Next.js 16.4.x (App Router, `output: "export"`, build `--webpack`), React 19, TypeScript, Tailwind 4, Zustand (persist w `localStorage`), Framer Motion, Vitest, Playwright (projekty `mobile` = iPhone 13 i `desktop` = 1440×1000). Node ≥ 22.12 (`.nvmrc` = 22).
- **Next.js 16 ma zmiany łamiące.** Przed użyciem API Next (metadata, manifest, viewport, dynamic, skrypty) przeczytaj odpowiedni przewodnik w `node_modules/next/dist/docs/` (reguła z `AGENTS.md`).
- **Hosting:** Vercel na koncie właściciela repozytorium (Alex, `itsagurin/museum_game`): produkcja z `main`, podgląd dla każdego PR (chroniony logowaniem Vercela). Eksport statyczny `out/`, bez backendu.
- **Generator plansz:** `tools/pixel-engine/` (Python 3.12+, K-Means w CIELAB). Venv: `tools/pixel-engine/.venv`. Plansze: `npm run content:puzzles`. Testy: `cd tools/pixel-engine && .venv/bin/python -m pytest -q`.

| Obszar | Pliki |
| --- | --- |
| Treść kolekcji (jedno źródło prawdy) | `content/artworks.json`, typy `src/types/content.ts`, budowa `src/data/eras.ts` (`artworks`, `legacyArtworkIds`) |
| Nawigacja, sceny, panele | `src/components/HeritageApp.tsx` (**870 linii**, do podziału), `GameViewport.tsx`, `HallBackdrop.tsx`, `RoomBackdrop.tsx`, `src/hooks/useSceneNavigation.ts` |
| Pracownia | `src/components/HeritageGame.tsx` (ładowanie planszy, zapis postępu), `coloring-canvas.tsx`, `src/lib/coloring.ts` (`parseColoringBoard`), `src/data/coloring-library.ts` |
| Progresja | `src/lib/room-development.ts` (`getLevelThresholds`, `getRoomProgress`, `getEraAccess`, `ERA_UNLOCK_LEVEL = 3`) |
| Okna nagród | `src/components/ProgressNotices.tsx` (`EraLockedNotice`, `MilestoneNotice`) |
| Zapis | `src/store/useGameStore.ts` (klucz `heritage-hearth-ui-v1`: język, gentleMotion, autoFill, exploreAll, completedArtworkIds, wallAssignments), `src/store/usePaintingProgress.ts` (`heritage-paintings-v1`: bitset na obraz + `signature`), `src/store/safe-storage.ts`, `src/lib/painting-progress.ts` |
| Biblioteka | `src/components/ArtworkLibrary.tsx`, `ArtworkStory.tsx`, `ArtworkSourceNote.tsx`, `src/lib/wall-gallery.ts` |
| Dekoracje | `src/data/room-decorations.ts`, `RoomDecorations.tsx`, `scripts/decoration-geometry.mjs` |
| Teksty UI | `src/data/copy.ts` (PL/EN, funkcje z odmianą, `plPaintings`), `src/data/coloring-copy.ts` |
| Grafiki | źródła w `img/`, publikacja i optymalizacja `scripts/prepare-assets.mjs` → `public/art/` (generowane, w `.gitignore`), miniatury `public/art/_thumbs/` |
| Style | `src/app/globals.css` (**1242 linie**), `coloring.css`, `library.css`, `decorations.css` |
| Testy | `src/**/*.test.ts`, `src/data/content.test.ts` (= `npm run content:validate`), `tests/*.spec.ts`, helpery `tests/helpers/game-state.ts` (`seedGame`), `tests/helpers/catalog-coloring.ts` |
| CI | `.github/workflows/ci.yml`: lint, typecheck, vitest, build, Playwright i pytest generatora |
| Dokumentacja | `README.md`, `AI_MEMORY.md` (reguły, czytaj zawsze), `CLAUDE.md`, `docs/14_PLAN_ROZWOJU.md` (plan i status), `docs/10`, `13`, `docs/archive/` |

### 3. Stan wyjściowy (do sprawdzenia w kroku 0)

- **Faza 0 (PR #1, `chore/faza-0`):** usunięty prototyp, Next 16.4.4, `prepare-assets` z optymalizacją (`out/` ok. 35 MB), CI, nowa dokumentacja.
- **Faza 1 (PR #2, `feat/faza-1`):**
  - zapis rozpoczętych obrazów (bitset);
  - blokady epok od poziomu 3 poprzedniej epoki;
  - nieliniowe progi (pierwszy obraz zawsze daje poziom 1);
  - okna: nowa epoka, ukończona epoka, finał;
  - tryb zwiedzania `exploreAll`;
  - numery na polach przy przybliżeniu i liczniki w palecie.
- **Faza 2 (gałąź `feat/faza-2`, PR #3 jeśli już otwarty):**
  - generator dołączony z historią do `tools/pixel-engine/`;
  - manifest `content/artworks.json` ze stałymi ID (slugi) i `legacyIds` (migracja zapisów w `useGameStore.merge`);
  - pliki reprodukcji nazwane slugami;
  - plansze v2 w `img/puzzles/<id>.json|png`: proporcje obrazu, dłuższy bok 32, 6–10 kolorów, schemat `{schemaVersion: 2, id, grid, palette}`;
  - szkic tłumaczeń EN dla 83 dzieł (`review.translation: "draft"`);
  - źródła z Wikimedia Commons dopasowane hashem obrazu dla 70 z 83 dzieł (69 w domenie publicznej, 1 na CC BY-SA 3.0; `tools/pixel-engine/src/content_sources.py`), komponent `ArtworkSourceNote`;
  - testy DEV naprawione pod nowe plansze i progi.
- **Testy na koniec Fazy 2:** vitest zielone (w tym walidacja treści), e2e ok. 100 zielonych plus 6 pominiętych (testy DEV w zwykłym buildzie), pytest 26 zielonych i 4 pominięte (wymagają danych spoza repo).
- **Treści:** wszystkie wpisy mają `review.content: "unverified"`. Lista podejrzanych miejsc i tabela 83 dzieł są w `docs/15_RECENZJA_TRESCI.md` (zadanie A9 je uzupełnia).

### 4. Zasady pracy (obowiązkowe)

1. **Na start przeczytaj** `CLAUDE.md`, `AI_MEMORY.md`, `AGENTS.md`, `docs/14_PLAN_ROZWOJU.md` i ten dokument. Reguły z `AI_MEMORY.md` mają pierwszeństwo przed Twoimi założeniami.
2. **Gałęzie i PR-y:** pracuj na gałęziach od najnowszej zaakceptowanej fazy (`main`, jeśli PR #1–#3 są scalone; inaczej od `feat/faza-2`). Plan PR-ów jest w sekcji 8. Jeden PR = spójny temat, który da się przejrzeć w rozsądnym czasie. Commity w konwencji `typ(zakres): opis` po angielsku, z treścią wyjaśniającą „dlaczego”.
3. **Cudze pliki w indeksie gita:** ktoś z zespołu dodał do indeksu `output/prezentacja/**` i `output/dziedzictwo-prezentacja-pakiet.zip`. Nie commituj ich, nie usuwaj i nie zmieniaj. Commituj z jawną listą ścieżek (`git commit -- <ścieżki>`) albo sprawdzaj `git diff --cached --stat` przed każdym commitem.
4. **Zapis graczy jest święty:**
   - nigdy nie gub ukończeń ani obsady ścian;
   - każda zmiana formatu zapisu to podbicie `version` z `migrate` albo addytywne pole z bezpiecznym domyślnym w `merge`, z testem jednostkowym na starym zapisie;
   - nowe pola waliduj w `merge` jak istniejące.
5. **Czyste reguły w `src/lib/`** (funkcje bez Reacta, z testami Vitest), dane w `content/` i `src/data/`, komponenty tylko je wywołują. **Żaden komponent nie przekracza 300 linii** po zadaniu A1.
6. **Testy dla każdej zmiany zachowania:**
   - jednostkowe dla reguł;
   - Playwright dla przepływu, na obu projektach;
   - testy, które wchodzą bezpośrednio do pokojów, używają `seedGame` (tryb zwiedzania), a testy blokad celowo go nie używają;
   - testy DEV (`tests/dev-*.spec.ts`, część `auto-fill.spec.ts`) uruchamiaj na serwerze dev: `PLAYWRIGHT_PORT=3000 npx playwright test tests/dev-coloring.spec.ts tests/dev-room-preview.spec.ts`, bo w zwykłym buildzie są pomijane;
   - nie osłabiaj istniejących asercji, żeby przeszły. Jeśli zachowanie celowo się zmienia, zmień asercję i napisz dlaczego w commicie.
7. **Sprawdzenie w przeglądarce:** każdą zmianę widoczną dla gracza sprawdź w panelu przeglądarki na telefonie (375×812) i desktopie. Konfiguracja serwera: `/home/redsa/Documents/hackathon/.claude/launch.json` (`dziedzictwo-dev`, port 3000). Pierwsza nawigacja po starcie serwera dev bywa przekierowana na `/`, więc powtórz ją (zob. A2).
8. **Teksty:**
   - kod, komentarze i identyfikatory po angielsku;
   - dokumentacja i UI PL/EN;
   - każdy nowy tekst UI trafia do `src/data/copy.ts` w obu językach, z poprawną polską odmianą liczebników;
   - w treściach gry unikaj form rodzajowych wobec gracza („odnowiłeś”); pisz bezosobowo albo w 2. osobie bez rodzaju („gdy odnowisz”).
9. **Prywatność i bezpieczeństwo:**
   - żadnych danych osobowych w adresach URL ani zdarzeniach;
   - żadnych zewnętrznych skryptów bez decyzji z sekcji 5;
   - wszystko, co gra generuje (karty, certyfikaty), powstaje lokalnie w przeglądarce.
10. **Licencje:** każdy nowy materiał (muzyka, ikony, czcionki, grafiki) wymaga wpisu źródła i licencji w repozytorium. Do domeny publicznej zaliczają się dzieła twórców zmarłych przed 1956 rokiem. Nagranie ma osobne prawa: tylko CC0, Public Domain Mark albo licencje pozwalające na użycie w grze z atrybucją.
11. **Push i CI:**
    - token `gh` użytkownika nie ma uprawnienia `workflow`. Gałąź bez zmian w `.github/workflows/` wypchniesz przez `git -c credential.helper= -c 'credential.helper=!gh auth git-credential' push https://github.com/itsagurin/museum_game.git <gałąź>:<gałąź>`;
    - jeśli zmieniasz workflow, poproś użytkownika o `git push` z jego terminala (SSH z hasłem do klucza);
    - po otwarciu PR podłącz go w aplikacji (`get_status`/`bind_pr`) i zaproponuj Auto-fix. Nie odpytuj CI w pętli.
12. **Terminal użytkownika:** fish w panelu Terminal gubi polecenia wpisane przez agenta podczas startu powłoki (ok. 10 s). Polecenia interaktywne, np. `gh auth refresh`, daj użytkownikowi do ręcznego wpisania.
13. **Dokumentacja na bieżąco:** po każdym zadaniu zaktualizuj `AI_MEMORY.md` (nowe reguły), `README.md` (polecenia, struktura) i status w `docs/14_PLAN_ROZWOJU.md` (checkboxy Fazy 3 oraz sekcja „Stan na gałęzi …”).
14. **Zakończenie każdego PR:** lint, typecheck, vitest, `content:validate`, build, pełne e2e, testy DEV na dev, pytest (jeśli dotykasz generatora), ręczne sprawdzenie w przeglądarce, krótki raport w PR (co, dlaczego, jak sprawdzone, co poza zakresem), stopka `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.

### 5. Decyzje do potwierdzenia z użytkownikiem (zapytaj na początku jednym zestawem pytań)

Każda decyzja ma rekomendację. Nie zaczynaj zadania zależnego od decyzji, zanim jej nie dostaniesz. Resztę rób równolegle.

| # | Decyzja | Opcje | Rekomendacja |
| --- | --- | --- | --- |
| D-A1 | Samouczek (A7) | (a) skrócona plansza pierwszego obrazu Oświecenia (dłuższy bok 16), (b) osobny obraz-samouczek spoza kolekcji, (c) tylko podpowiedzi bez skróconej planszy | **(a)**: nie zmienia kolekcji, a pierwsza nagroda przychodzi po 2–3 min |
| D-A2 | Niezweryfikowane treści w UI (A9) | (a) bez oznaczenia, (b) dyskretny dopisek „tekst w trakcie weryfikacji” | **(a)** do czasu pilotażu z instytucją, potem (b) dla wpisów `unverified` |
| D-B1 | Obraz dnia (B2) | (a) zwykła plansza nieukończonego obrazu z otwartych epok, (b) osobna krótka plansza 16 | **(a)**: liczy się do kolekcji, nie trzeba drugiego zestawu plansz |
| D-B2 | Seria dni (B2) | (a) widoczna, bez kar, (b) bez serii | **(a)** w łagodnej formie („3 dni z rzędu”), bez utraty nagród po przerwie |
| D-B3 | Analityka (B6) | (a) Plausible (płatny, EU), (b) Umami Cloud / self-host, (c) Vercel Web Analytics (konto właściciela repo), (d) bez analityki | **(b) lub (a)**: bez ciasteczek. Konto zakłada użytkownik, nie agent. Do czasu decyzji implementuj warstwę `track()` jako no-op |
| D-B4 | Zgoda na statystyki (B6) | (a) włączone z możliwością wyłączenia i informacją w „O grze”, (b) opt-in | **(a)** przy analityce bez ciasteczek i bez identyfikatorów. Ostateczną decyzję zostaw użytkownikowi |
| D-B5 | Muzyka (B5) | lista konkretnych nagrań z licencjami (przygotowuje agent) | Agent przedstawia listę, użytkownik zatwierdza przed dodaniem plików |
| D-B6 | Ikona aplikacji (B1) | (a) generowana z ilustracji domu (`house4.jpg`), (b) ikona dostarczona przez użytkownika | **(a)** jako tymczasowa, łatwa do podmiany |
| D-B7 | Lighthouse w CI (B7) | (a) osobny job LHCI z progami, (b) pomiar ręczny w raporcie | **(a)**: zmiana workflow, więc push przez SSH użytkownika |

---

## Część A. Poprawki

### A1. Podział `HeritageApp.tsx` i `globals.css` (zrób jako pierwsze, bez zmian zachowania)

- **Problem:** `src/components/HeritageApp.tsx` ma 870 linii. Łączy nawigację, nagłówek, dom, hol, pokój, panele ustawień i informacji, kolejkę nagród, kamienie milowe i blokady. `globals.css` ma 1242 linie.
- **Cel:** struktura z planu (sekcja 5 dokumentu 14):
  - `src/features/scenes/`: `HouseScene.tsx`, `HallScene.tsx`, `RoomScene.tsx` (z `WallArtwork.tsx`);
  - `src/features/shell/`: `AppHeader.tsx`, `EraSwitcher.tsx`, `SettingsPanel.tsx`, `InfoPanel.tsx`, `StorageNotice`;
  - `src/features/progression/`: hooki `useEraAccess` (dostęp + `isEraOpen`), `useRewardsQueue` (`pendingRewards`, `consumeRewards`), `useMilestones` (kolejka, `dismissPanel`), `useLockedRedirect`;
  - `HeritageApp.tsx` zostaje kompozycją: < 250 linii.
- **CSS:** podziel `globals.css` na pliki per obszar (`shell.css`, `scenes.css`, `room.css`, `dialogs.css`, `progress.css`) importowane w `src/app/layout.tsx`. Zachowaj nazwy klas, bo testy i inne pliki ich używają. Kolejność importów ma odtworzyć dotychczasową kaskadę.
- **Kryteria odbioru:**
  - żaden plik komponentu > 300 linii;
  - wszystkie testy przechodzą bez zmian w asercjach;
  - zrzuty ekranu domu, holu, pokoju, pracowni, biblioteki i ustawień przed i po (mobile i desktop) są identyczne wizualnie (porównaj ręcznie albo `toHaveScreenshot` w tymczasowym teście, którego nie commitujesz);
  - osobny PR bez innych zmian.

### A2. Pierwsze renderowanie: bez mignięcia domu i kłódek

- **Problem 1:** `useSceneNavigation` zaczyna od `view = "home"` i dopiero w efekcie czyta hash. Przy wejściu na `/#era-1` czy `/#library` gracz przez chwilę widzi dom (nagłówek bywa już z innego widoku), a po starcie serwera dev pierwsza nawigacja ląduje na `/`.
- **Problem 2:** przed wczytaniem zapisu (`hydrated === false`) gra liczy blokady z pustej listy ukończeń. Powracający gracz przez chwilę widzi kłódki na otwartych drzwiach.
- **Ograniczenie:** eksport statyczny, serwer nie zna hasha. HTML z buildu zawsze renderuje stan początkowy.
- **Wymagania:**
  - do zamontowania i wczytania obu store'ów (`useGameStore`, `usePaintingProgress`) pokazuj neutralny ekran: tło `ambient-backdrop` z kolorem motywu, bez sceny i bez kłódek, z `aria-busy`;
  - potem renderuj od razu widok z hasha, bez animacji wejścia z innej sceny;
  - ustal przyczynę przekierowania na `/` przy pierwszej nawigacji po starcie dev (podejrzenie: przeładowanie HMR + `pushState` przy porównaniu w `navigate`) i napraw ją, jeśli leży w kodzie gry.
- **Testy:** e2e z `addInitScript` instalującym `MutationObserver`. Przy wejściu na `/#era-1` z zapisem nie może pojawić się `.home-canvas`, a przy wejściu na `/#hall` z ukończoną epoką I nie może pojawić się `.hall-door-hit.locked[data-era="era-2"]`. Istniejący test „home stays centered before hydration” musi przejść.

### A3. Polskie formy nazw epok w komunikatach

- **Problem:** komunikaty brzmią „Epoka Romantyzm otworzy się… w epoce Oświecenie”, bez odmiany.
- **Wymaganie:**
  - dodaj do `Era` pole `inEra: Localized`: PL „w Oświeceniu”, „w Romantyzmie”, „w Pozytywizmie”, „w Młodej Polsce”; EN „in the Enlightenment”, „in Romanticism”, „in Positivism”, „in Young Poland”;
  - przepisz `lockedBody`, `libraryLocked`, `lockedGo` itp. w `copy.ts`, np. „Romantyzm otworzy się, gdy odnowisz jeszcze 4 obrazy w Oświeceniu.”, „Najpierw otwórz Romantyzm.”;
  - przejrzyj wszystkie teksty z nazwą epoki w środku zdania.
- **Testy:** `tests/progression.spec.ts` korzysta z funkcji `copy.pl.*`, więc zaktualizuj wywołania. Dodaj test jednostkowy dla 1, 2–4 i 5+ obrazów.

### A4. Nazwy kolorów palety: unikalne w palecie i po angielsku

- **Problem:** generator nadaje nazwy z tabeli `POLISH_ART_COLOR_REFERENCE` (43 pozycje, `tools/pixel-engine/src/core/color_utils.py`). W jednej palecie zdarzają się duplikaty (np. dwie „Ciemna sepia”), a w interfejsie EN nazwy kolorów są po polsku.
- **Wymagania:**
  - dodaj do tabeli nazwy EN;
  - przydziel nazwy zachłannie bez powtórzeń w obrębie palety: kolor po kolorze, od największego udziału, najbliższa jeszcze nieużyta nazwa;
  - generator zapisuje `name` (PL) i `nameEn`;
  - `parseColoringBoard` akceptuje opcjonalne `nameEn`, a pracownia pokazuje nazwę w języku interfejsu;
  - schemat zostaje w wersji 2 (pole addytywne);
  - przegeneruj plansze (`npm run content:puzzles`). Siatki i kolory mają się nie zmienić (sprawdź `git diff --stat` i test porównujący `grid`/`hex`), więc zapisy rozpoczętych obrazów zostają ważne.
- **Testy:**
  - pytest: brak duplikatów w każdej palecie, każda nazwa ma EN;
  - vitest w `content.test.ts`: brak duplikatów nazw w planszach;
  - e2e: etykieta „Colour 3: …” po angielsku.

### A5. Nieaktualny procent „W trakcie” po zmianie planszy

- **Problem:** `usePaintingProgress` przechowuje `signature` planszy, ale kartka w pokoju pokazuje procent bez sprawdzania sygnatury, bo plansza nie jest jeszcze pobrana. Po przegenerowaniu planszy stary procent wisi do otwarcia obrazu.
- **Wymagania:**
  - `build_puzzles.py` liczy tę samą sygnaturę co `gridSignature` w `src/lib/painting-progress.ts` (FNV-1a 32-bit po kolei: width, height, komórki wierszami, potem dla każdego koloru `id` i `hex` jako liczba; wynik w base36) i zapisuje ją w manifeście jako `puzzleVersion`;
  - `content.test.ts` sprawdza zgodność `puzzleVersion === gridSignature(board)` dla każdego wpisu;
  - przy wczytaniu `usePaintingProgress` (`merge`) odrzuca wpisy, których `signature` różni się od `puzzleVersion`;
  - otwarcie obrazu z niezgodną sygnaturą czyści wpis.
- **Testy:** jednostkowy dla `merge` (zgodny wpis zostaje, niezgodny znika); e2e z zapisem o złej sygnaturze, gdzie kartka nie pokazuje procentu.

### A6. „Cofnij” po wczytaniu zapisu

- **Problem:** przycisk jest aktywny, gdy `painted.size > 0`, także gdy jedyne pola pochodzą z zapisu (`paintActions` puste). Kliknięcie nic nie robi.
- **Wymaganie:** stan `canUndo` odzwierciedla `paintActions.current.length > 0`. Przycisk jest nieaktywny po wczytaniu zapisu i aktywny po pierwszym ruchu.
- **Test:** e2e w `progression.spec.ts`.

### A7. Samouczek i pierwsze kolorowanie (zależy od D-A1)

- **Cel:** nowy gracz kończy pierwszy obraz i dostaje pierwszą dekorację w < 5 min, łącznie z czytaniem.
- **Wariant (a):**
  - generator dostaje opcję `--long-edge` i pole manifestu `introPuzzle` (np. `puzzles/<id>.intro.json`, dłuższy bok 16) dla pierwszego obrazu Oświecenia (`order: 1`);
  - pracownia używa planszy intro, gdy gracz nie ma żadnych ukończeń i otwiera ten obraz;
  - ukończenie liczy się normalnie; ponowne malowanie korzysta z pełnej planszy;
  - zapis rozpoczętego intro ma własną sygnaturę.
- **Podpowiedzi** (tylko przy pierwszym kolorowaniu, potem nigdy; flaga `tutorialSeen` w `useGameStore`):
  1. „Wybierz kolor z palety. Numer na polu mówi, którego koloru szuka.”
  2. „Dotknij pola z tym numerem. Możesz też przeciągać palcem.” Pojawia się po wyborze koloru.
  3. „Pięć trafień z rzędu i reszta tego koloru wypełni się sama.” Pojawia się po 3 trafieniach.

  Podpowiedzi to szklane dymki nad planszą: zamykane, dostępne (`role="status"`), bez blokowania gry. Szanuj `gentleMotion`.
- **Na pierwszej planszy:** numery na polach także bez przybliżenia, bo plansza 16 ma większe pola.
- **Testy:** e2e „nowy gracz” (podpowiedzi po kolei, ukończenie, poziom 1, po przeładowaniu bez podpowiedzi); pytest dla `--long-edge`; vitest dla walidacji `introPuzzle` w manifeście.

### A8. Dostępność: tryb wysokiego kontrastu i audyt WCAG 2.2 AA

- **Tryb wysokiego kontrastu:**
  - ustawienie „Wysoki kontrast” (`highContrast`), domyślnie zgodne z `prefers-contrast: more`;
  - w pracowni: wyraźne obramowania pól, numery widoczne zawsze przy zoomie ≥ 1,5 i automatyczny zoom startowy 1,5 na telefonie, zaznaczone pola wybranego koloru (obrys);
  - w scenach: mocniejsze tło przycisków szklanych (`.glass`) i tekstów na ilustracjach.
- **Audyt:**
  - dodaj `@axe-core/playwright` i `tests/a11y.spec.ts`, który skanuje dom, hol, pokój, pracownię, bibliotekę (lista i szczegóły), ustawienia, okno blokady i okno kamienia milowego na obu projektach z tagami `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`;
  - test nie dopuszcza naruszeń `serious` i `critical`; wyjątki tylko z komentarzem i uzasadnieniem.
- **Do sprawdzenia ręcznie:** cały przepływ samą klawiaturą (Tab, Enter, Escape, strzałki w pracowni), focus widoczny wszędzie, `aria-live` dla postępu, kolejność czytania na telefonie.
- **Kryterium:** zero `serious`/`critical` w a11y.spec; Lighthouse Accessibility ≥ 95 (B7).

### A9. Treści: recenzja i brakujące źródła

- **Agent nie jest recenzentem merytorycznym.** Nie zmieniaj treści dzieł bez źródła. Proponuj poprawki w dokumencie, a nie w manifeście.
- **`docs/15_RECENZJA_TRESCI.md`** (utwórz albo uzupełnij):
  - instrukcja dla recenzenta;
  - tabela 83 dzieł: id, tytuł, autor, rok, źródło, status, uwagi;
  - lista podejrzanych miejsc. Stan po dopasowaniu w Fazie 2:
    1. `brandt-czarniecki-koldynga`: opis mówi o „jeździe szesnastowiecznej”, a oblężenie Koldyngi było w 1658 roku (XVII w.); błąd jest też w szkicu EN;
    2. `bacciarelli-portret-doktora-walentego-gagatkiewicza`: brak dopasowania w Commons, stara nazwa pliku `17_bacciarelli_akademia_krakowska.jpg`; porównaj obraz z tytułem;
    3. **13 dzieł bez dopasowanego źródła** (70 z 83 dopasowano hashem obrazu): `bacciarelli-portret-doktora-walentego-gagatkiewicza`, `norblin-swieto-bielanach`, `norblin-sejmik-szlachecki-kosciele`, `norblin-wieszanie-zdrajcow-rynku-starego`, `norblin-starcie-kosynierow-wojskami-rosyjskimi`, `vogel-lazienki-krolewskie-palac-wyspie`, `michalowski-starzec-siedzacy-stopniach`, `zaleski-widok-placu-teatralnego-warszawie`, `suchodolski-bitwa-raszynem-1809`, `grottger-bitwa`, `suchodolski-smierc-ksiecia-jozefa-poniatowskiego`, `gierymski-wiosna-malym-miasteczku`, `wyspianski-portret-lizy-parenskiej-wsrod`;
    4. `wyczolkowski-gra-krokieta`: jedyne źródło spoza domeny publicznej (CC BY-SA 3.0). Atrybucja jest już zrobiona w Fazie 2 (`source.author`, „fot. Zorro2212” w `ArtworkSourceNote`); `content.test.ts` wymaga autora dla każdej licencji spoza domeny publicznej. Do decyzji zespołu: zostawić albo poszukać reprodukcji w domenie publicznej.
  - Wyjaśnione w Fazie 2, bez działań: `norblin-wybor-piasta-krola` i `bellotto-widok-warszawy-tarasu-zamku` mają poprawne tytuły. Obrazy zgadzają się z plikami Commons „Piast Being Elected as the King” (MNK) i „View of Warsaw from the Terrace of the Royal Castle” (MNW); myląca była tylko stara nazwa pliku.
- **Brakujące źródła:**
  - uruchom `src/content_sources.py` jeszcze raz (cache w scratchpadzie);
  - dla pozostałych spróbuj innych zapytań (tytuł EN, nazwisko w innej formie, Cyfrowe MNW, Polona) z tym samym warunkiem dopasowania hashem obrazu;
  - wpis `match: "title"` tylko po ręcznym porównaniu i z adnotacją w dokumencie recenzji.
- **Workflow recenzji:** po akceptacji recenzenta wpis dostaje `review.content: "verified"` (i `review.translation: "reviewed"` po korekcie EN). `content.test.ts` sprawdza spójność statusów.
- **UI według D-A2.**

### A10. Bardzo szerokie i wysokie plansze

- **Problem:** dla obrazów o proporcjach > 2:1 krótszy bok ma 12–14 pól (np. „Bitwa pod Grunwaldem” 32×14 = 448 pól), więc plansza jest mała i uboga.
- **Do oceny:**
  - `min_short_edge = 16`;
  - albo dłuższy bok 40 przy proporcjach > 2;
  - albo bez zmian.

  Przygotuj raport porównawczy (`--report`) dla obrazów o skrajnych proporcjach i pokaż go użytkownikowi przed decyzją. Zmiana plansz unieważnia rozpoczęte obrazy tych dzieł (ukończenia zostają), więc wspomnij o tym.

### A11. Porządki repozytorium (tylko dokumentacja decyzji)

- W historii `main` jest `output/hall-assets.zip` (60 MB), który powoduje ostrzeżenie GitHuba. Całe `img/` (ok. 160 MB) jest w zwykłym gicie.
- Przygotuj w planie opis opcji (Git LFS z przepisaniem historii, przeniesienie archiwów poza repo, `git filter-repo`) z kosztami: wymuszony push, nowe klony dla całego zespołu.
- **Nic nie wykonuj** bez decyzji zespołu.

---

## Część B. Faza 3: powroty graczy, PWA i testy z użytkownikami

### B1. PWA: instalacja i gra offline

- **Manifest** `public/manifest.webmanifest`:
  - `name: "Dziedzictwo"`, `short_name: "Dziedzictwo"`, `lang: "pl"`, opis PL;
  - `start_url: "./"`, `scope: "./"` (względne, działa z `NEXT_PUBLIC_BASE_PATH`);
  - `display: "standalone"`, `orientation: "portrait"`;
  - `background_color` i `theme_color` `#e8e4d8` (jak `viewport.themeColor`);
  - `categories: ["education", "games"]`, ikony 192, 512 i 512 maskable.

  Podłącz go przez API metadata Next 16 (sprawdź dokumentację w `node_modules/next/dist/docs/`), razem z `appleWebApp` i `apple-touch-icon`.
- **Ikony:** `scripts/make-icons.mjs` (sharp) generuje je z wybranego źródła (D-B6). Zapisz źródło i licencję (własna ilustracja zespołu).
- **Service worker:**
  - `workbox-build` (`generateSW`) w `scripts/build-sw.mjs`, uruchamiany po `next build` (rozszerz skrypt `build`);
  - precache: `index.html`, JS/CSS z `_next/static`, czcionki, `note.svg`, sceny domu, holu i pokojów, `blank_paper_crossmark.jpg`, miniatury `_thumbs` (ok. 2 MB). Bez reprodukcji, plansz, dekoracji i audio w precache;
  - runtime caching: reprodukcje i dekoracje `CacheFirst` z limitem wpisów, plansze `StaleWhileRevalidate`, audio bez cache albo z obsługą zakresów (`RangeRequestsPlugin`);
  - poprawna ścieżka przy `basePath`.
- **Aktualizacje:** nowa wersja czeka (`waiting`). Gra pokazuje szklany komunikat „Dostępna nowa wersja · Odśwież”, a przycisk wysyła `SKIP_WAITING` i przeładowuje. Bez automatycznego przeładowania w trakcie kolorowania.
- **Rejestracja:** komponent kliencki w layoucie, tylko gdy `process.env.NODE_ENV === "production"` i `"serviceWorker" in navigator`.
- **Vercel:** `vercel.json` z nagłówkiem `Cache-Control: no-cache` dla `/sw.js`. Projekt jest na koncie właściciela, więc opisz zmianę w PR.
- **Offline epoki (opcjonalnie w tym PR):** przycisk „Zapisz epokę offline” w pokoju (albo w bibliotece z filtrem epoki) dodaje do cache reprodukcje, plansze i dekoracje epoki. Pokazuje postęp i rozmiar (np. „ok. 6 MB”).
- **Testy:**
  - e2e na `out/`: po pierwszym wejściu czekaj na `navigator.serviceWorker.ready`, `context.setOffline(true)`, przeładuj; dom, hol i odwiedzony pokój działają, a obraz odwiedzony online da się pomalować offline;
  - vitest dla konfiguracji ścieżek (basePath).
- **Kryterium:** Lighthouse oznacza aplikację jako instalowalną. Ręcznie: instalacja na Androidzie (Chrome) i iOS (Safari, „Do ekranu początkowego”) i działanie offline.

### B2. Obraz dnia i łagodna seria (zależy od D-B1, D-B2)

- **Reguła** `getDailyArtwork(dateKey, collection, completed, isEraOpen)` w `src/lib/daily.ts`:
  - deterministyczny wybór z hasha daty (`YYYY-MM-DD` w lokalnej strefie);
  - spośród nieukończonych obrazów otwartych epok, a gdy wszystkie są ukończone, spośród wszystkich (wtedy „powtórka”, bez nagrody);
  - ten sam obraz przez cały dzień, także po odświeżeniu.
- **UI:**
  - karta na ekranie domu (szkło, miniatura, tytuł, epoka, „Maluj”), otwiera pracownię bezpośrednio;
  - po ukończeniu obrazu dnia karta pokazuje „Odnowione dziś” i ciekawostkę;
  - seria (D-B2): „3 dni z rzędu” na karcie, bez kar, bez powiadomień push.
- **Zapis:** `dailyHistory: string[]` (daty ukończenia obrazu dnia, max 60 wpisów) w `useGameStore`, walidowane w `merge`.
- **Testy:**
  - vitest: determinizm, filtr otwartych epok, przypadek „wszystko ukończone”, liczenie serii przez granice miesiąca;
  - e2e z `page.clock.setFixedTime`: karta pokazuje oczekiwany obraz, ukończenie dopisuje datę, następny dzień zmienia obraz.

### B3. Album kolekcji i odznaki

- **Definicje** w `content/badges.json`: `id`, `title {pl,en}`, `description {pl,en}`, `rule`, gdzie `rule` to jedno z:
  - `{ "type": "era", "era": "era-1" }`;
  - `{ "type": "artist", "artist": "<dokładnie jak w manifeście>", "count": n | "all" }`;
  - `{ "type": "count", "count": n }`;
  - `{ "type": "all" }`.
- **Zestaw startowy:**
  - 4 odznaki epok;
  - artyści z ≥ 3 dziełami: Bellotto (7), Matejko (8, dwie epoki), Norblin (6), Chełmoński (6, dwie epoki), Malczewski (6), Bacciarelli (5), Wyspiański (5), Grottger (4), Aleksander Gierymski (4), Boznańska (3), Michałowski (3), Suchodolski (3). Policz z manifestu, nie z tej listy;
  - progi 1, 10, 25, 50 i całość.

  Teksty odznak PL/EN, bez form rodzajowych.
- **Reguła:** `getBadges(content, completed)` w `src/lib/badges.ts` zwraca zdobyte i niezdobyte, z postępem (np. 4/7).
- **UI:**
  - zakładka „Album” w bibliotece: postęp epok (paski), artyści (lista z postępem), siatka odznak (zdobyte w kolorze, niezdobyte wygaszone z postępem);
  - nowa odznaka dołącza do kolejki kamieni milowych po zamknięciu karty obrazu (`useMilestones`), tak jak „Nowa epoka otwarta”.
- **Testy:** vitest dla reguł i walidacji `badges.json` (artysta istnieje w manifeście, ID unikalne); e2e: ukończenie obrazu dające odznakę pokazuje okno, a album ją wyświetla.

### B4. Karta do udostępnienia i certyfikat w finale

- **Karta** `src/lib/share-card.ts`:
  - rysuje na `<canvas>` 1080×1350 PNG: tło w kolorach gry, plansza pikselowa (z JSON planszy) obok oryginału (miniatura z tego samego originu), tytuł, autor, rok, epoka, „Odnowione w grze Dziedzictwo” i adres gry (`location.origin` + `basePath`);
  - czcionki z gry (Cormorant Garamond, DM Sans; poczekaj na `document.fonts.ready`).
- **Udostępnianie:**
  - przycisk „Udostępnij” w karcie ukończonego obrazu;
  - `navigator.share({ files })`, gdy `navigator.canShare({ files })`; w przeciwnym razie pobranie pliku (`<a download>`);
  - nic nie jest wysyłane na serwer gry.
- **Certyfikat w finale:**
  - przycisk w oknie „Dom jest gotowy”: PNG 1754×1240 „Opiekun Dziedzictwa”, liczba odnowionych obrazów, data, opcjonalne imię wpisane w polu (nie zapisywane);
  - PL lub EN według języka interfejsu.
- **Testy:**
  - vitest dla układu (podział tekstu na linie, skrócenie długich tytułów);
  - e2e: pobranie (`page.waitForEvent("download")`) przy braku Web Share; sprawdź wymiary PNG (sharp w teście Node) i to, że plik powstał bez błędów w konsoli.

### B5. Muzyka i dźwięk (zależy od D-B5)

- **Najpierw lista dla użytkownika:**
  - 4–6 nagrań: po jednym na epokę oraz neutralne do domu i holu;
  - kompozytorzy z domeny publicznej, np. Ogiński (Oświecenie), Szymanowska lub Chopin (Romantyzm), Moniuszko lub Żeleński (Pozytywizm), Paderewski lub Karłowicz (Młoda Polska);
  - wyłącznie nagrania CC0 / Public Domain Mark (np. Musopen, Wikimedia Commons), z linkiem, wykonawcą, licencją i długością.

  Pobierz pliki dopiero po zatwierdzeniu.
- **Pliki:** `public/audio/music/*.mp3` (mono lub stereo 96–128 kbps, pętle 2–4 min, ≤ 2,5 MB, razem ≤ 12 MB), metadane i licencje w `content/audio.json`, sekcja „Muzyka” w oknie „O grze” z atrybucją.
- **Odtwarzacz** `src/lib/music.ts`:
  - dwa elementy `audio` z przenikaniem (1,5 s);
  - utwór zależny od widoku (dom/hol: neutralny, pokój: epoka);
  - w pracowni głośność o ok. 40% niższa, żeby efekty kolorowania były słyszalne;
  - pauza przy `visibilitychange`, start tylko po geście użytkownika;
  - domyślnie wyłączona.
- **Ustawienia:** przełącznik „Muzyka” i suwak głośności (`musicEnabled`, `musicVolume` w zapisie, walidowane w `merge`). Istniejące efekty kolorowania mają osobny przełącznik „Dźwięki pędzla”.
- **Testy:**
  - vitest dla wyboru utworu i przenikania (fałszywe elementy audio);
  - e2e: domyślnie brak odtwarzania; po włączeniu `audio.src` wskazuje utwór epoki; po ukryciu karty pauza (`Object.defineProperty(document, "hidden")` i zdarzenie).

### B6. Analityka bez ciasteczek (zależy od D-B3, D-B4)

- **Warstwa** `src/lib/analytics.ts`:
  - `track(event, props)`, no-op gdy brak konfiguracji (`NEXT_PUBLIC_ANALYTICS_PROVIDER`, `NEXT_PUBLIC_ANALYTICS_SITE`), w dev i testach (chyba że test włącza ją jawnie) i gdy gracz wyłączył statystyki;
  - skrypt dostawcy ładowany dopiero, gdy analityka jest aktywna.
- **Zdarzenia** (bez identyfikatorów użytkownika i bez treści wpisywanych przez gracza):
  - `app_open` {returning: "first" | "d1" | "d2_6" | "d7_plus"}: liczone lokalnie z `firstPlayedAt` w zapisie (addytywne pole), bo analityka bez ciasteczek nie policzy retencji sama;
  - `tutorial_complete` {seconds_bucket};
  - `painting_open` {era, daily: boolean};
  - `painting_complete` {era, cells_bucket, minutes_bucket, daily};
  - `painting_abandon` {era, percent_bucket}: zamknięcie pracowni poniżej 100%;
  - `era_unlock` {era}, `era_complete` {era}, `badge_earned` {badge};
  - `share` {kind: "card" | "certificate", method: "share" | "download"};
  - `pwa_installed`, `offline_session`.
- **Ustawienie** „Wysyłaj anonimowe statystyki” (domyślna wartość wg D-B4) i akapit „Prywatność” w „O grze”: co zbieramy, czego nie, jak wyłączyć.
- **`docs/18_METRYKI.md`:** definicje metryk z sekcji 6 planu (ukończenie pierwszej planszy ≥ 70%, czas do pierwszej nagrody < 5 min, powrót D1 ≥ 25% itd.) i sposób liczenia każdej ze zdarzeń.
- **Testy:**
  - vitest: no-op, kubełki, wyłączenie;
  - e2e z `page.route` na adres dostawcy: włączona analityka wysyła oczekiwane zdarzenia bez pól osobowych, a wyłączona nie wysyła nic.

### B7. Wydajność

- **Pomiar przed i po:** Lighthouse (mobile, throttling domyślny) na `out/` serwowanym lokalnie dla: domu, holu, pokoju I, biblioteki i pracowni (przez `/#era-1` i kliknięcie). Wyniki w raporcie PR.
- **Cele:** Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, LCP < 2,5 s, INP < 200 ms (pracownia na emulacji średniego telefonu), CLS < 0,1. Pierwsze ładowanie domu < 1,5 MB.
- **Kierunki** (mierz, nie zgaduj):
  - leniwe ładowanie pracowni i biblioteki (`next/dynamic`);
  - `fetchpriority="high"` i preload pierwszej sceny;
  - `LazyMotion` z `domAnimation` zamiast pełnego Framer Motion;
  - tylko używane podzbiory czcionek;
  - dekoracje ładowane po wejściu do pokoju;
  - siatka SVG pracowni: zmierz INP przy ~1000 polach z numerami; jeśli > 200 ms, rozważ jedną warstwę `<canvas>` do rysowania z zachowaniem dostępnych przycisków pól w trybie klawiatury.
- **LHCI (D-B7):** job w CI z progami powyżej, uruchamiany na buildzie `out/`. To zmiana workflow, więc push przez użytkownika.

### B8. Materiały do testów z użytkownikami

W `docs/user-testing/` (PL):
- `scenariusz.md`:
  - cel badania i pytania badawcze (czy gracz kończy pierwszy obraz, czy chce wrócić, czy pamięta autora i ciekawostkę);
  - profil uczestników (5–8 osób, 16–30 lat, w tym 2 osoby rzadko grające w gry);
  - zadania krok po kroku: uruchom grę, odnów pierwszy obraz, przeczytaj ciekawostkę, otwórz nową epokę, udostępnij kartę, zainstaluj na telefonie;
  - czas ok. 25 min.
- `skrypt-moderatora.md`: wprowadzenie, myślenie na głos, pytania pogłębiające, zakończenie.
- `zgoda-uczestnika.md`: informacja RODO (cel, zakres, nagranie ekranu opcjonalne, prawo do rezygnacji, kontakt). Bez danych kontaktowych zespołu; zostaw pola do uzupełnienia.
- `arkusz-obserwacji.md`: tabela zadań (sukces, czas, problemy, cytaty), skala trudności.
- `ankieta-sus.md`: SUS po polsku (10 pytań) z instrukcją liczenia wyniku.
- `quiz-po-tygodniu.md`: 5 pytań o zapamiętane dzieła i ciekawostki, generowane z obrazów, które uczestnik odnowił.
- `wyniki-szablon.md`: zestawienie wyników, priorytety poprawek (P0–P2), decyzje.

Agent przygotowuje materiały; badanie prowadzi zespół.

---

## 8. Kolejność pracy i PR-y

1. **Krok 0 (bez PR):**
   - `git status`, `git log --oneline -10`, stan PR-ów #1–#3 (`gh pr list --repo itsagurin/museum_game`);
   - czy Faza 2 jest zacommitowana i czy istnieje `docs/15_RECENZJA_TRESCI.md`;
   - uruchom komplet testów, żeby mieć punkt odniesienia;
   - zadaj pytania z sekcji 5.
2. **PR A1:** podział `HeritageApp` i CSS (bez zmian zachowania).
3. **PR A2–A6:** pierwsze renderowanie, odmiana epok, nazwy kolorów, `puzzleVersion`, „Cofnij”. Zawiera przegenerowanie plansz bez zmiany siatek.
4. **PR A7–A8:** samouczek i dostępność (z a11y.spec).
5. **PR A9–A11:** dokumenty recenzji treści, źródła, raport plansz skrajnych proporcji, opis opcji LFS.
6. **PR B1:** PWA.
7. **PR B2–B3:** obraz dnia, seria, album i odznaki (wspólna kolejka kamieni milowych).
8. **PR B4:** karta do udostępnienia i certyfikat.
9. **PR B5:** muzyka, po zatwierdzeniu listy nagrań.
10. **PR B6:** analityka, po decyzji o dostawcy i zgodzie.
11. **PR B7:** wydajność i LHCI. Mierzy całość, więc na końcu.
12. **PR B8:** materiały do badań. Może iść równolegle w dowolnym momencie.

Każdy PR bazuje na poprzednim, dopóki wcześniejsze nie są scalone; po scaleniu przenieś bazę na `main`. Nie łącz w jednym PR refaktoru z nowymi funkcjami.

## 9. Definicja ukończenia całości

- [ ] Wszystkie PR-y otwarte, z zielonym CI, opisem i raportem sprawdzenia.
- [ ] Testy: vitest, `content:validate`, e2e (oba projekty), testy DEV na dev, a11y.spec, pytest, LHCI (jeśli D-B7 = a).
- [ ] Nowy gracz na telefonie: samouczek → pierwsza dekoracja w < 5 min, podpowiedzi raz, obraz dnia na ekranie domu, instalacja PWA i gra offline w odwiedzonym pokoju.
- [ ] Zapisy z faz 1–2 wczytują się bez utraty ukończeń, obsady ścian i (gdy plansza się nie zmieniła) rozpoczętych obrazów.
- [ ] Brak naruszeń `serious`/`critical` w axe; Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95.
- [ ] Każdy nowy materiał ma źródło i licencję w repozytorium; muzyka i analityka tylko po decyzjach użytkownika.
- [ ] `AI_MEMORY.md`, `README.md`, `docs/14_PLAN_ROZWOJU.md` (status Fazy 3 i poprawek), `docs/15`, `docs/18` i `docs/user-testing/` aktualne.

## 10. Raport końcowy dla użytkownika (po polsku)

- Co zostało zrobione, w jakich PR-ach (linki), co zmienia się dla gracza.
- Wyniki testów i pomiarów (liczby, a nie „działa”), czego nie udało się sprawdzić i dlaczego.
- Decyzje podjęte po drodze i otwarte pytania.
- Co zostaje na Fazę 4 (nowe epoki, kolekcje z muzeami, tryb szkolny).
