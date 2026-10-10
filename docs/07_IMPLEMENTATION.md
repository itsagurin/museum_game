# Dom Opowieści — aktualna architektura

## Produkt i przepływ

welcome → entering → intro → house → artwork → story → house/finale.

Pierwsza rama dostępna, następne otwierają się po odkryciu poprzednich historii. Powtórne czytanie nie daje nagród. Rozdziały są tematyczne, nie chronologiczne. Nastrojowa narracja to autorska interpretacja, fakty mają źródła w panelu „Dowiedz się więcej”.

## Moduły

- src/app: statyczna strona i layout lang=pl; lokalne fonty.
- components/experience.tsx: sceny, wprowadzenie, ramy, nagrody i ustawienia.
- components/artwork-experience.tsx: pobiera JSON z public/artworks lub przyjmuje prop data; obsługuje ładowanie, błędy i ponowienie.
- components/coloring-canvas.tsx: piksele z grid, kolory z palette.hex, bez numerów/zdjęcia. Oddzielne zakraszanie komórek kliknięciem/przeciąganiem, poprawność według palette.id, animacje i dźwięki, cofanie, zoom, przesuwanie i klawiatura.
- lib/coloring.ts: walidacja kontraktu i paintResult sprawdzający id koloru. Dawny buildRegions pozostaje jako niewykorzystywany przez płótno helper; piksele nie są łączone w obszary.
- components/dialog.tsx: natywny modal, Escape, Tab/Shift+Tab, przywracanie fokusu.
- data/artworks.ts: polskie teksty, metadane, źródła, nagrody.
- lib/progress.ts: czyste reguły progresji; store/use-progress.ts: Zustand i storage po hydracji.
- lib/audio.ts i components/audio-owner.tsx: jeden AudioContext, ambient i dzwonki, poza przejściami scen.

## Zapis i odporność

Wersja 1: completed, hasSeenIntroduction, soundEnabled, reducedMotion. Statusy ram i poziom domu są wyliczane. Po przeładowaniu ekran powitalny; niedokończone animacje nie są odtwarzane. Nieznane ID, luki w progresji i uszkodzony JSON nie odblokowują historii. Brak storage pozwala kontynuować w pamięci; ustawienia wyjaśniają brak zapisu. Reset zachowuje preferencje dźwięku/ruchu.

Błąd grafiki daje gradientowe tło, nie blokuje UI. Błędy dźwięku nie blokują historii. Audio wymaga zgody i gestu, pauzuje w ukrytej karcie, jest cichsze w pracowni i podczas czytania.

Nieprawidłowe dane kolorowania pokazują ponowienie zamiast uszkodzonego SVG. Płótno nie pobiera fotografii: kolory pochodzą z palette. Częściowo pokolorowany obraz pozostaje lokalnym stanem pracowni i nie jest zapisywany po jej opuszczeniu. Ukończenie wszystkich obszarów odblokowuje dotychczasowy onComplete, bez zmiany reguł nagród.

## Grafika i dostępność

ImageGen: cztery sceny (exterior/interior × szeroka/portretowa) i trzy przezroczyste nagrody. Wybór scen przez picture, ramy jako HTML. Gotowe WebP w public/assets; oryginalne PNG nie są potrzebne do startu. Iskra to CSS.

Reprodukcje trzech obrazów: lokalne WebP w public/artworks, źródła w ATTRIBUTION.md. Demo ma pięć farb i minimum pięć pól na farbę; JSON wygenerowano z uproszczonych kolorów reprodukcji. To stylizacja niskiej rozdzielczości, nie segmentacja obiektów.

Efekty malowania korzystają z jednego istniejącego AudioContext przez zdarzenie coloringSoundEvent: krótki wybór farby, wznoszące tony i szmer pędzla przy trafieniu, opadające tony przy błędzie. Zgoda, wyciszenie i ukryta karta obowiązują także efekty.

Systemowe ograniczenie ruchu wpływa na React po hydracji, CSS respektuje je od pierwszej klatki. Użytkownik może dodatkowo ograniczyć ruch. Obsługa nie wymaga hover, przeciągania ani gestów.

## Budowa

output: export; brak runtime API; lokalne fonty i grafiki. Webpack jawnie wybrany dla przewidywalnej kompilacji. allowedDevOrigins dopuszcza 127.0.0.1 do lokalnych testów; nie jest produkcyjnym CORS. npm start/preview serwują out jako pliki statyczne. Publikacja osobno.

## Źródła i wcześniejsza koncepcja

Stańczyk: Muzeum Narodowe w Warszawie. Bociany: Zintegrowana Platforma Edukacyjna. Konstytucja: Cyfrowa Kolekcja Zamku Królewskiego. Dokładne linki w data/artworks.ts.

Dokumenty 01–06 zachowano jako wcześniejszą wizję. Nie przenoszono niezweryfikowanych ciekawostek o skrzydłach husarii ani aktualnej populacji bocianów.
