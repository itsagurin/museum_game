# Kontekst projektu — Dom Opowieści

Ustalenia z 10 października 2026 mają pierwszeństwo przed starszymi dokumentami.

- Polski UI, angielski kod; minimalistyczna atmosfera Loóna.
- Next.js App Router, React, TypeScript, Tailwind, Motion, Zustand, statyczny eksport.
- Jedna komnata, trzy tematyczne rozdziały: Stańczyk, Bociany, Konstytucja 3 maja.
- Pixel art: grid.data[y][x] wskazuje palette.id; jeden kwadrat na komórkę, dokładny palette.hex, bez numerów i fotografii. Kontrakt ArtworkExperience({artworkId,onComplete,onExit,data?}) pozostaje bez zmian.
- Bledszy kolor pokazuje niepomalowane piksele. Wybór farby, kliknięcie/przeciąganie, animacja trafienia/błędu, opcjonalne dźwięki; cofanie, zoom i przesuwanie, klawiatura, reduced motion. Błędny kolor nie zmienia postępu.
- Demo ma pięć kolorów i co najmniej pięć oddzielnych pól na każdy kolor. Opowieść po ukończeniu wszystkich pól. Częściowe malowanie nie zapisuje się po wyjściu z pracowni.
- Cały pozostały cykl: wprowadzenie, historie, nagrody, odblokowanie, finał, ponowne czytanie.
- localStorage dom-opowiesci:v1; brak backendu, logowania, ekonomii, AI w runtime i symulacji epok.
- Dźwięk tylko po zgodzie i geście; pauzuje w ukrytej karcie; brak lektora.
- Grafiki public/assets mają osobne portretowe warianty. Iskra jest animacją CSS.
- Zachować istniejącą .serena/. Użytkownik autoryzował pracę na main; brak autoryzacji publikacji.
- Dokumenty docs/01–06 są historyczną koncepcją, nie bieżącą specyfikacją.

Szczegóły: README.md i docs/07_IMPLEMENTATION.md.
Weryfikacja: npm test; npm run typecheck; npm run lint; npm run test:e2e; npm run build.

## Plan zespołu z repozytorium zdalnego

Powyżej zapisano stan zaimplementowanego prototypu. Poniżej zachowano plan kolejnej iteracji; nie opisuje jeszcze wdrożonych funkcji.

## Aktualizacja wizji — 10.10.2026

**Najpierw czytaj [07_CURRENT_PROJECT_PLAN.md](./docs/07_CURRENT_PROJECT_PLAN.md).** Ten plan oraz najnowsze instrukcje zespołu mają pierwszeństwo przed starszym szkieletem stanu i mechanikami opisanymi niżej.

Ustalone przez zespół:

- Strona główna: dom z zewnątrz; kliknięcie drzwi prowadzi do holu.
- Hol: cztery drzwi do czterech pokojów epok Polski, od powstania państwa do współczesności.
- Pokój: w ramach nieukończonych obrazów wiszą przetarte biało-szare kartki papieru z czerwonym krzyżykiem. Kliknięcie kartki otwiera kolorowanie po numerach na **siatce 15×15** przygotowywanej algorytmem członka zespołu. Kartka pozostaje do ukończenia, a następnie zastępuje ją kolorowy obraz.
- Ukończenie obrazu: naturalny kolorowy obraz na ścianie i automatyczne wyposażenie pokoju z odpowiedniej epoki.
- Ukończenie wszystkich obrazów pokoju: automatyczne ulepszenie domu i odblokowanie następnych drzwi.
- Oprawa: ilustracje 2D, grafiki i styl zapewnia zespół.
- Organizacja: cztery osoby, każda z Codexem; 15 godzin pozostałych w chwili planowania.
- Obecny etap: planowanie. Nie rozpoczynaj implementacji na podstawie samego zlecenia przygotowania planu.

Robocze propozycje wymagające potwierdzenia:

- Cztery rozdziały: początki/średniowiecze, dawna Rzeczpospolita, droga do niepodległości, Polska XX–XXI wieku.
- Dane algorytmu: paleta HEX i 225 numerów w kolejności wierszowej; dokładny kontrakt opisuje plan.
- Odsłonięcie zachowanego oryginału po ukończeniu, zamiast próby odzyskania szczegółów z 225 pól.
- Dostęp do pierwszego pokoju od początku; pozostałe kolejno, z możliwością powrotu.
- React/Next.js, TypeScript, lokalny zapis; EN/PL i warstwa edukacyjna do potwierdzenia na demo.

W nowej wizji ręczne zakupy renowacji, waluta i kolorowanie dowolnych konturów SVG nie są ustalonym rdzeniem gry. Wcześniejsze przykłady poniżej służą jako historyczny kontekst; modele aktualnej planszy i progresji są w dokumencie 07.

---
