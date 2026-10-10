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
