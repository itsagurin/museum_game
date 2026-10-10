# 08. Grafiki frontendu: kierunek wizualny i prompty do Google Flow

> Ustalone 10.10.2026: użytkownik zajmuje się frontendem i generuje grafiki w Google Flow. Styl odnosi się do dwóch załączonych ilustracji: pustego pokoju oraz tego samego pokoju wyposażonego w drewniany stół i historyczne przedmioty.
> **Urządzenie podstawowe: telefon, mobile-first.** Dom, hol i pokoje komponujemy pionowo, w proporcji 9:16. Obsługa odbywa się dotykiem, a układ na komputerze jest adaptacją.
> To instrukcja przygotowania assetów. Prompty nie zostały jeszcze przetestowane na wynikach Flow. Rozdziały historii i ich wygląd pozostają propozycją z [planu 07](./07_CURRENT_PROJECT_PLAN.md).

## 1. Styl wynikający z referencji

Ilustracja 2D z wyraźnym rysunkiem: nierówne, cienkie ciemnobrązowe kontury, dodatkowe kreski opisujące fakturę, widoczne pociągnięcia pędzla i malarskie cienie. Proporcje przedmiotów i perspektywa są realistyczne. Materiały mają ślady użytkowania: słoje drewna, przetarcia, matowy tynk, pęknięcia. Kolory przygaszone: umbra, beż, szarość, oliwka, ciepłe drewno. Atmosfera spokojna, lekko nostalgiczna. Czerwony krzyżyk na kartce jest jednym z wyraźniejszych akcentów.

Pierwsza referencja określa wygląd pustego wnętrza i światła. Druga pokazuje styl wyposażenia. Przy generowaniu domu obie służą jako odniesienie do stylu, a nie do kompozycji wnętrza.

## 2. Landing page — proponowany układ

Pierwszy ekran jest pionową interaktywną sceną z domem. Nad domem jest miejsce na tytuł i jedno krótkie zdanie. Dom zajmuje większość szerokości telefonu; dach i wejście mieszczą się w kadrze. Dotknięcie drzwi jest główną akcją. Przycisk „Wejdź do domu” w dolnej strefie ekranu zapewnia wygodną obsługę kciukiem. Ustawienia języka/dźwięku i postęp są elementami interfejsu nakładanymi przez frontend.

Tytuł, przyciski, podpisy, postęp i kłódki powstają w HTML/CSS/SVG. Ilustracja ma zapewnić dla nich spokojne tło. Interfejs dopasowujemy przez pergaminowe powierzchnie, ciemne kontury, matowe kolory i oszczędne cienie. Drzwi są czytelnie oznaczone przed dotknięciem i reagują na naciśnięcie; hover może być dodatkiem na komputerze. Krótka animacja wejścia nie wymaga filmu. Propozycja obszarów dotyku: co najmniej 48×48 CSS px, niezależnie od rozmiaru namalowanego detalu.

Nie generujemy całego ekranu z wtopionymi przyciskami i napisami. Interakcje oraz tłumaczenia wymagają osobnych elementów.

## 3. Lista plików i kolejność

**Gotowe i obejrzane:** `img/house0.jpg`–`img/house4.jpg`, `img/room1.jpg`–`img/room4.jpg` oraz `img/blank_paper_crossmark.jpg`. Wszystkie mają 896×1200. Meble nadal wymagają przygotowania; w aktualnym katalogu nie ma osobnej ilustracji holu. Tabela poniżej opisuje pierwotne nazwy proponowane i zakres assetów, a integracja powinna korzystać z rzeczywiście dostarczonych plików. Szczegóły pokojów są w [dokumencie 09](./09_ROOM_PROMPTS_CORNER_VIEW.md).

| Priorytet | Plik lub zestaw | Liczba | Przeznaczenie |
| --- | --- | --- | --- |
| Teraz | `house-stage-0.png` | 1 | Cała scena startowa domu, otoczenie i ścieżka |
| Następnie | `house-stage-1.png` … `house-stage-4.png` | 4 | Ta sama scena po kolejnych ukończonych rozdziałach |
| Następnie | `hall.png` | 1 | Hol z dokładnie czterema widocznymi drzwiami |
| Potem | `room-1-empty.png` … `room-4-empty.png` | 4 | Puste wnętrza, bez obrazów i ruchomego wyposażenia |
| Potem | `unfinished-paper.png` | 1 | Przetarta biało-szara kartka z czerwonym krzyżykiem |
| Potem | `furniture-{id}.png` | Zależnie od liczby nagród | Osobne meble lub małe zestawy wyposażenia |
| Z katalogów dzieł | `artwork-{id}.jpg` lub `.png` | Jeden na dzieło | Prawdziwe kolorowe reprodukcje i oryginały dla minigry |
| Opcjonalnie | `frame-wood.png` | 1 współdzielona | Ozdobna rama z rzeczywiście przezroczystym środkiem |
| Opcjonalnie | Osobne szerokie warianty scen | Według potrzeb | Dodatkowa kompozycja na komputer; niepotrzebna do rozpoczęcia wersji mobilnej |

Minimum do rozpoczęcia frontendu landing page: **jedna zaakceptowana scena domu**. Minimum podstawowych ilustracji dla całej gry: 5 domów + hol + 4 tła pokojów + kartka = **11 plików**, poza wyposażeniem i reprodukcjami.

### Format i kompozycja

- Prompty nowych scen proponują **9:16**, cel eksportu **1080×1920** lub większy obraz o tej samej proporcji. Gotowe domy i pokoje mają **896×1200**; stosujemy ich rzeczywiste proporcje i dopasowujemy pełną scenę do telefonu, bez rozciągania lub przycinania drzwi. Rozdzielczość w promptach jest celem, a nie gwarancją generatora.
- Zachowujemy oryginalne PNG; do aplikacji można przygotować lżejsze WebP.
- Papier i wyposażenie: PNG z prawdziwym kanałem alfa, jeśli dostępny. Jeśli wynik ma jednolite tło, trzeba je wyciąć przed osadzeniem. Narysowana szachownica nie jest przezroczystością.
- Każdy mebel ma kompletne krawędzie, bez obciętych nóg, zgodną perspektywę i światło z pokoju. Wystarczy docelowy rozmiar około 800–1200 px na dłuższym boku, zależnie od wielkości w scenie.
- Bez liter, przycisków, podpisów epok i elementów interfejsu w scenach.
- Każdy etap domu ma te same wymiary, punkt widzenia, tło i pozycję głównych drzwi.
- Wszystkie główne elementy muszą mieścić się w kadrze. Dom nie jest oddalonym szczegółem krajobrazu.
- Referencje użytkownika są pionowe i stanowią dobry punkt wyjścia. Mają inny stosunek boków niż 9:16, więc nowe sceny komponujemy świadomie, zachowując styl i perspektywę.
- Zachowujemy spokojną górną strefę na nagłówek oraz dolną na przyciski. Drzwi i inne kluczowe interakcje znajdują się pomiędzy tymi strefami.
- Telefon może mieć proporcje inne niż 9:16. Skalowanie sceny i obszarów dotyku korzysta z tej samej transformacji; dom i drzwi nie mogą zniknąć wskutek automatycznego kadrowania.

## 4. Jak przygotowywać obrazy we Flow

Oficjalna pomoc Flow opisuje generowanie obrazów, wybór proporcji, dodawanie referencji i edycję. W trybie obrazu wybierz docelową proporcję i dołącz referencje do promptu. Wygenerowane assety można ponownie dodać do promptu przez „Add to Prompt”. [Pomoc Google: Create & edit images](https://support.google.com/flow/answer/16729550?hl=en).

1. Do domu dołącz dwie referencje jako wzór stylu.
2. Wygeneruj kilka wariantów domu startowego i wybierz jeden.
3. Następne stany twórz przez edycję zaakceptowanego domu, dodając go jako główną referencję kompozycji.
4. Po każdej edycji sprawdź pozycję drzwi, skalę i horyzont. Sam prompt nie gwarantuje identycznej geometrii. Odrzuć albo popraw wynik, który się przesunął.
5. Pokój bazowy generuj bez wyposażenia. Meble przygotuj osobno z tym pokojem jako referencją perspektywy i światła.
6. Zapisuj pliki zgodnie z tabelą i zachowuj wariant bazowy.

## 5. Wspólny blok stylu

Dołącz ten blok do promptów nowych scen i obiektów. Prompty edycji domu poniżej odnoszą się już do stylu zatwierdzonej sceny.

```text
Use the attached illustrations as visual style references. Hand-drawn 2D illustration with fine irregular dark-brown ink contours, subtle sketch lines, visible painterly brushwork, and softly shaded volumes. Believable proportions and perspective. Tactile weathered materials: wood grain, worn plaster, aged paper, small imperfections. Muted warm earth tones, umber, beige, warm gray, dusty olive, and restrained amber light. Quiet nostalgic atmosphere with readable shapes. Preserve the balance between drawn outlines and realistic material shading seen in the references. Produce a single still illustration with no lettering or interface elements.
```

Jeśli styl odbiega od referencji, można dopisać:

```text
Avoid glossy 3D surfaces, photographic rendering, anime features, flat vector fills, neon colors, exaggerated cartoon proportions, and dramatic horror lighting.
```

## 6. Dom startowy — `house-stage-0.png`

Referencje: oba załączone wnętrza jako styl. Prompt zawiera już opis stylu i może być użyty samodzielnie.

```text
Create a portrait 9:16 still illustration for the mobile-first entrance screen of a Polish heritage restoration game. Use the attached room illustrations as STYLE references only; create an exterior scene.

Show one modest, weathered timber cottage inspired by early Polish rural architecture. The complete cottage is visible, with a worn thatched roof, rough wooden beams, a few small windows, a low stone foundation, and one clearly visible CLOSED front door. The house feels neglected but structurally recognizable and inviting to restore. Use restrained signs of wear, sparse weeds, and a small uneven path leading toward the door. Place a few softly painted trees at the edges and a quiet muted landscape behind it.

Camera: nearly frontal, at human eye level, with a very slight view of one side. Center the building in the middle of the portrait composition and let it occupy most of the image width, with comfortable side margins. Keep believable architectural proportions. The main CLOSED door faces the viewer near the horizontal center, with enough visual size to be easy to recognize on a phone. Keep the doorway above the bottom control area. Leave approximately the top 18 percent as calm pale sky for a title, and the bottom 15 percent as a quiet foreground path for a frontend button. Keep the complete roof, house, and entrance visible. Avoid a distant tiny house surrounded by excessive landscape.

Match the reference style: fine irregular dark-brown ink outlines, visible painterly brush strokes, realistic material textures and gentle shading, muted umber wood, beige, gray-green foliage, and soft overcast daylight. A calm nostalgic 2D illustration. No people, no lettering, no logos, no buttons or UI.
```

## 7. Cztery ulepszenia domu

To proponowane interpretacje wizualne rozdziałów, nie rekonstrukcje konkretnego zabytku. Generujemy je dopiero po zaakceptowaniu nazw i kierunku zmian domu. Przy ograniczonym czasie można zachować bryłę i zmieniać materiały oraz detale.

Każdy etap edytuje poprzedni zaakceptowany etap; dom startowy pozostaje dodatkową referencją układu.

### Etap 1 — odnowiony dom: `house-stage-1.png`

```text
Edit the attached house illustration into its first restored stage. Keep the exact canvas dimensions, camera position, framing, landscape, path, house placement, and the center and bottom edge of the main door. Keep the door closed. Restore the timber walls, repair the thatched roof, stabilize the stone foundation, and remove the sparse weeds immediately beside the house. Add small restrained signs of care around the entrance. Retain the simple early cottage architecture and the original hand-drawn ink contours, painterly textures, muted colors, and light direction. Change the condition of the house, not the composition. No text, people, or UI.
```

### Etap 2 — inspiracja dawnym dworem: `house-stage-2.png`

```text
Edit the attached house into a modest Polish manor-inspired stage for the Old Commonwealth chapter. Preserve the exact framing, camera, landscape, approach path, ground line, and main entrance coordinates. Keep the main door closed. Within the same compact building footprint, introduce limewashed plaster, visible timber details, a maintained roof, more elegant window surrounds, and a restrained wooden entrance porch. Keep the house readable as the same evolving home. Avoid monumental palace scale and excessive ornament. Preserve the irregular ink linework, matte painterly shading, weathered materials, muted earth tones, and original light direction. No text, people, or UI.
```

### Etap 3 — inspiracja XIX wiekiem: `house-stage-3.png`

```text
Edit the attached house into a late nineteenth-century-inspired restored home. Keep the exact canvas, camera, background, path, ground line, building placement, and main entrance coordinates. Keep the door closed. Add a few restrained brick details, a maintained tiled roof, a modest chimney, and more refined wooden window frames. Show a cared-for garden immediately around the entrance. Preserve visual continuity with the previous house and keep all additions within the established scene framing. Maintain the same hand-drawn dark-brown contours, textured painterly surfaces, realistic proportions, muted palette, and soft light direction. No text, people, or UI.
```

### Etap 4 — dom współczesny zachowujący dziedzictwo: `house-stage-4.png`

```text
Edit the attached house into its final present-day heritage home stage. Preserve the exact canvas, camera, background, path, ground line, house placement, and main entrance coordinates. Keep the main door closed. Carefully maintain the historic character while adding clean warm plaster, restored timber details, larger window glazing within the existing openings, and restrained contemporary entrance lighting. The home is fully cared for, welcoming, and complete. Use modest modern details rather than a futuristic redesign. Keep the established hand-drawn ink outlines, brushwork, realistic materials, muted earthy palette, and the same daylight direction. No text, people, or UI.
```

## 8. Hol — cztery epoki

Potrzebne są **cztery wersje tego samego holu**: `img/hall1.jpg`, `hall2.jpg`, `hall3.jpg`, `hall4.jpg`. Każda ma dwoje drzwi na lewej i dwoje na prawej ścianie, bez dodatkowego wyjścia na tylnej ścianie. Zachowaj tę samą kamerę, proporcje 3:4 i położenie wszystkich drzwi. Materiały zmieniają się wraz z epoką. Glass, podpisy i przyciski nakłada frontend.

**[Cztery pełne prompty do Google Flow](./11_HALL_PROMPTS_FOUR_ERAS.md)**: chata wczesnej Polski, dwór dawnej Rzeczypospolitej, wnętrze XIX / początku XX wieku, współczesny dom zachowujący dawne proporcje. Najpierw generuj hall1 z referencją room1, potem edytuj zatwierdzony hall1 do wariantów 2–4.

Warianty są wykrywane po restarcie dev / buildzie. Cztery dostarczone ilustracje mają osobno dopasowane obszary drzwi w `src/data/halls.ts`; przy zmianie kadru zaktualizuj odpowiedni wariant. Starszy `hall.jpg` nadal może służyć jako wspólne tło awaryjne.

## 9. Puste pokoje — `room-{1..4}-empty.png`

**Aktualizacja:** wszystkie pokoje pokazują **wewnętrzny narożnik i dwie szerokie ściany w dalszym kadrze**, z kamerą odsuniętą około 7–8 metrów. Bez wyznaczonych miejsc, rzędów ani stref dla obrazów. Dwoje zamkniętych drzwi znajduje się na lewej i prawej ścianie; całe skrzydła i ościeżnice są widoczne z marginesem ściany po zewnętrznej stronie. Więcej podłogi pozostaje dostępne na wyposażenie. Obrazy rozmieszcza frontend na gotowym tle. Cztery pełne prompty oraz prompt korekty zawiera [09_ROOM_PROMPTS_CORNER_VIEW.md](./09_ROOM_PROMPTS_CORNER_VIEW.md). Hol pozostaje osobną sceną.

## 10. Kartka — `unfinished-paper.png`

To wygląd nieukończonego dzieła. Ramę można przygotować osobno albo narysować we frontendzie.

```text
Create one isolated front-facing sheet of old paper for a hand-drawn 2D restoration game. The paper is off-white and pale gray, rubbed, scuffed, softly creased, and slightly uneven at the edges. It must remain visibly light against a brown wooden frame. Draw exactly one small muted-red X near the center, made from two short imperfect brush strokes. This X is the only mark on the sheet. No picture, writing, numbers, map, symbols, frame, or surrounding scene.

Match the supplied illustration style: fine irregular dark-brown edge lines, delicate pencil-like wear, painterly matte shading, believable paper texture. Show the entire sheet straight-on without perspective distortion. Use a transparent background if supported; otherwise use a plain uniform background suitable for clean removal. Do not draw a checkerboard pattern. One object, no text or UI.
```

## 11. Wyposażenie — szablon i pierwszy stół

Dołącz tło docelowego pokoju i drugą referencję wyposażenia. Obiekty muszą być zgodne z perspektywą sceny.

```text
Create a single isolated [OBJECT] for the attached CORNER-VIEW room background. Match that room's eye-level camera looking diagonally toward the corner, perspective, light direction, and object scale. Orient the object for its intended position beside the left wall, beside the right wall, or on the open floor, as specified in the request. Use the supplied furnished-room illustration as a reference for irregular dark-brown ink contours, fine sketch marks, painterly shading, worn material textures, and muted earth tones.

Show the complete object, including all legs and edges, with generous clear space around it. Keep a soft restrained contact shadow only near its base. No floor plane, wall, room background, frame, people, lettering, or other loose objects. Use a transparent background if supported; otherwise a plain uniform background suitable for removal. Do not draw a checkerboard. One reusable game asset.
```

Przykładowe obiekty, do zatwierdzenia i przypisania obrazom:

- Pokój 1: `a simple low wooden bench`; `a modest rough oak storage chest with restrained iron fittings`.
- Pokój 2: `a modest writing desk made of dark oak`; `a small arrangement of an inkpot, a feather quill, and a rolled blank parchment`.
- Pokój 3: `a compact nineteenth-century upright piano`; `a small wooden bookcase with unlabelled books`.
- Pokój 4: `a compact wooden radio inspired by early twentieth-century design`; `a simple contemporary wooden side table with a ceramic plant pot`.

Stół z wyposażonej referencji jako osobny asset:

```text
Using the attached furnished-room illustration as a style reference, create a single isolated heavy oak table with the same hand-drawn linework, worn edges, visible wood grain, realistic proportions, and painterly shading. Match the approved CORNER-VIEW room's diagonal eye-level camera, floor perspective, and upper-left lighting. Keep the full tabletop and all legs visible. The tabletop is empty so props can be added independently later. No walls, floor plane, books, candles, food, paper, writing, or other objects. Use a transparent background if supported; otherwise a plain uniform background suitable for removal. Do not draw a checkerboard pattern.
```

Jeśli nagrodą ma być cały stół z przedmiotami, można przygotować je jako jeden asset. Przy osobnych nagrodach każdy zestaw musi być oddzielny. Gotowa wyposażona scena może być referencją lub podglądem końcowego wyglądu, lecz nie zastępuje warstw, gdy wyposażenie przybywa po kolejnych obrazach.

## 12. Opcjonalne warianty

### Drzwi otwarte — edycja domu

```text
Edit only the front-door area of the attached house scene. Keep every other pixel region, the canvas, framing, perspective, and lighting visually unchanged. Open the existing main door slightly inward and reveal a subdued warm interior glow. Keep the doorway in exactly the same position and preserve the established drawn outlines and matte textures. No new architecture, people, text, or UI.
```

Ten wariant nie jest konieczny do działania strony. Jeśli powstaje, generujemy go dla właściwego etapu domu; obraz otwartych drzwi domu startowego nie pasuje automatycznie do wszystkich późniejszych elewacji.

### Korekta domu, jeżeli powstał wcześniej w poziomie

To jednorazowa korekta starego assetu. Nowe grafiki od początku generujemy pionowo.

```text
Recompose the attached approved house scene into a portrait 9:16 mobile-first illustration. Preserve the house design, materials, drawing style, light direction, and surroundings. Center the complete house at a large readable scale across most of the image width, with its closed main door facing the viewer. Leave the upper 18 percent visually calm for a title and the bottom 15 percent as a quiet foreground path for a frontend button. Keep the entrance between these interface zones. Do not crop the roof or entrance. No text, people, or UI.
```

Po korekcie zapisujemy współrzędne drzwi dla pionowej sceny i z niej wyprowadzamy pozostałe etapy. Frontend dopasowuje skalę sceny i nakładek do ekranu, zachowując widoczność wejścia; automatyczne `cover` może obciąć elementy. Przycisk wejścia i strefa drzwi mają duże obszary dotyku. Na komputerze pionową scenę można umieścić w centralnym panelu z rozszerzonym tłem.

### Malowanie na telefonie

Plansza 15×15 pozostaje kwadratowa wewnątrz pionowego interfejsu. Paleta i przyciski znajdują się pod nią, w strefie wygodnej dla kciuka. Przy szerokości planszy 300 px pojedyncze pole ma 20 px, więc przewidujemy powiększenie i przesuwanie planszy. Rozdzielamy tryby „Maluj” oraz „Przesuń”, jeśli jednym palcem ma działać także przeciąganie pędzla. Zoom i sterowanie planszą powstają w kodzie; nie wymagają nowych ilustracji.

## 13. Odbiór assetów i zastosowanie we frontendzie

Po każdym wyniku sprawdzamy:

- Czy kontury i malarskie materiały przypominają referencje?
- Czy dom i drzwi są czytelne także w pomniejszeniu?
- Czy wszystkie podstawowe sceny mają pionowy kadr 9:16 i czytelne miejsca na mobilne sterowanie?
- Czy kolejny etap zachował kadr, skalę, pozycję drzwi i horyzont?
- Czy hol ma dokładnie cztery drzwi?
- Czy puste tła rzeczywiście nie zawierają mebli ani obrazów?
- Czy osobne meble pasują do perspektywy i kierunku światła?
- Czy papier jest biało-szary i zawiera jeden czerwony krzyżyk?
- Czy pliki mają docelowe proporcje i brak wtopionych elementów interfejsu?
- Czy deklarowana przezroczystość jest prawdziwym kanałem alfa?

Przy osadzaniu każda scena ma wspólny układ współrzędnych dla tła, obrazów, wyposażenia i obszarów interakcji. Etykiety, przyciski, ramy oraz czerwony krzyżyk można także dopracować kodem, aby zachować czytelność. Dla obrazów odblokowywanych używamy reprodukcji wybranych dzieł; sceny i wyposażenie są osobnymi ilustracjami gry.

Proponowane miejsca plików: `public/assets/house/`, `hall/`, `rooms/`, `furniture/`, `artworks/` i `ui/`. Po otrzymaniu domu bazowego można rozpocząć ustawianie sceny landing page, tekstów, obszaru drzwi i przejścia do holu.
