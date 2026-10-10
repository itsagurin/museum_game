# 09. Cztery puste pokoje: widok na narożnik i przejścia między epokami

> Aktualizacja 10.10.2026: wszystkie pokoje pokazują narożnik i dwie szerokie ściany. Nie wyznaczamy miejsc, rzędów ani stref dla obrazów w generowanej grafice. Układ obrazów ustala frontend na gotowej ilustracji.
> **Dalszy kadr:** szeroki widok wnętrza i mniejsze drzwi. Ostatnia instrukcja promptu: kamera około 7–8 metrów od narożnika, drzwi około 22–25% wysokości kadru. To wskazówki dla generatora; rzeczywiste obrazy oceniamy wizualnie.
> **Status assetów:** wszystkie cztery pokoje są już w `img/` i zostały obejrzane. Ich rzeczywisty rozmiar to **896×1200**, około 3:4; frontend dopasowuje się do tych plików.
> Ten dokument zastępuje wcześniejszą kompozycję frontalną z pięcioma miejscami w rzędach 2 + 3. Hol z czterema drzwiami pozostaje osobnym widokiem.

## 1. Referencje i pliki

Domy `img/house0.jpg`–`img/house4.jpg` wyznaczają styl: ciemne nierówne linie, kreskowanie, delikatna malarska faktura, przygaszone kolory i realistyczne materiały. Pierwotna pusta ilustracja pokoju dostarczona w rozmowie jest referencją perspektywy narożnika.

Do pierwszego promptu dołącz pusty pokój jako odniesienie do stylu, materiałów i kierunku narożnika oraz dom jako odniesienie do stylu. Ostatni ciasny kadr wymaga odsunięcia kamery; nie zachowujemy jego przycięcia drzwi. Dopiero po zaakceptowaniu nowego, dalszego kadru dodajemy go do pozostałych promptów jako główną referencję geometrii. Jeśli wcześniejsza pusta ilustracja nie jest dostępna w Flow, kompozycję określa tekst promptu.

Gotowe pliki i robocze przyporządkowanie do epok:

| Plik | Pokój | Widoczne materiały |
| --- | --- | --- |
| [room1.jpg](../img/room1.jpg) | Początki Polski | Drewniane ściany i belki, kamienna podmurówka |
| [room2.jpg](../img/room2.jpg) | Dawna Rzeczpospolita | Jasny tynk, drewniany strop i profilowane drzwi |
| [room3.jpg](../img/room3.jpg) | Droga do niepodległości | Tynk, ozdobny gzyms i ciemne drzwi |
| [room4.jpg](../img/room4.jpg) | Polska nowoczesna | Jasne ściany, proste wykończenia i drewniana podłoga |

Wszystkie pliki mają **896×1200** i pełny pionowy kadr, bez czarnych pasów. Każdy pokazuje narożnik, dwie puste ściany, dwoje drzwi w całości i wolną podłogę. Rozmieszczenie drzwi i linii podłogi różni się między pokojami, więc obszary interakcji konfigurujemy osobno dla każdego tła.

Poniższe prompty pozostają instrukcją ewentualnego tworzenia wariantów. Proponują 9:16, ale gotowe assety zachowujemy w ich rzeczywistych proporcjach. Nie wymagają ponownego generowania tylko z powodu proporcji.

### Osadzenie na telefonie

Skalujemy cały obraz proporcjonalnie i stosujemy tę samą transformację do obrazów, wyposażenia oraz obszarów dotyku. Nie rozciągamy tła do 9:16. Przy ekranie węższym niż ilustracja dopasowujemy pełną scenę, a pozostałe miejsce przeznaczamy na nagłówek i sterowanie. Automatyczne kadrowanie `cover` może odciąć boczne drzwi; rzeczywiste obszary wejść muszą pozostać widoczne.

## 2. Wspólna kompozycja

- Kamera na wysokości oczu, odsunięta około 7–8 metrów od narożnika, skierowana ukośnie ku niemu. Szeroki kadr wnętrza, naturalna perspektywa bez efektu rybiego oka.
- Pionowa linia styku ścian blisko środka kadru. Dwie szerokie ściany zajmują podobną część obrazu.
- Ciągłe, puste powierzchnie ścian. Bez wyznaczania prostokątów, rzędów, miejsc do powieszenia ani liczby obrazów w promptach.
- Dokładnie dwoje zamkniętych drzwi: jedne na lewej ścianie, drugie na prawej. Całe skrzydła i ościeżnice są widoczne, z pasem ściany również po zewnętrznej stronie każdego wejścia. Orientacyjnie drzwi mają 22–25% wysokości kadru; zostawiamy około 8% szerokości obrazu między ościeżnicą a najbliższą krawędzią kadru. To cele kompozycji, wymagające oceny wyniku.
- Dolne około 35% kadru pokazuje pustą podłogę z perspektywą prowadzącą do narożnika, gotową na wyposażenie. U góry widać niewielki fragment sufitu. Ilustracja wypełnia kadr bez czarnych pasów.
- Światło pada z górnej lewej strony. Kadr i geometria są wspólne dla czterech wersji; zmieniają się materiały i wykończenie epoki.

Obrazy, ramy i kartki z krzyżykiem dodaje frontend. Aktualne zapotrzebowanie to pięć obrazów z możliwością późniejszego rozszerzenia; nie narzucamy ich rozmieszczenia generatorowi. Pozycje dobieramy po obejrzeniu tła, osobno dla obu płaszczyzn ścian, uwzględniając ich perspektywę.

## 3. Pokój 1 — początki Polski i średniowiecze

```text
Create a portrait 9:16 EMPTY room illustration for a mobile-first Polish heritage game. Match the attached references: irregular dark-brown ink contours, delicate hatching, painterly brush texture, muted earthy colors, realistic material shading, and believable proportions.

Use a WIDE ESTABLISHING INTERIOR SHOT. Place the eye-level camera approximately 7–8 meters from the INSIDE CORNER, looking diagonally toward it. Show two broad walls meeting near the center, substantial wall width on both sides, and a small visible strip of ceiling. Floorboards converge naturally toward the corner; clear foreground floor fills approximately the lower 35 percent. Use natural rectilinear perspective with no fisheye distortion. Fill the entire portrait canvas with the room, without black borders.

Early Polish timber-house-inspired materials: rough oak wall boards, simple structural beams near the ceiling, worn wooden flooring, and a restrained stone base along the walls. Warm brown and gray tones, soft diffuse daylight from the upper left. The room is structurally intact and gently worn.

EXACTLY TWO CLOSED wooden doors, one on each wall. Show the COMPLETE door leaves and surrounding frames, with visible wall beyond their outer sides. Keep approximately 8 percent of the image width as a margin outside each door frame. Each door occupies roughly 22–25 percent of the image height and remains readable on a phone. Leave clear floor access to both doors and ample uninterrupted wall surface between each door and the corner.

Keep both walls continuous and unoccupied, and the floor empty. Do not create picture slots, designated display areas, grids, rectangles, frames, pictures, paper, hooks, or markings. No furniture, loose objects, windows, people, lettering, signs, locks, or UI.
```

## 4. Pokój 2 — dawna Rzeczpospolita

```text
Create a portrait 9:16 EMPTY manor-inspired room for a mobile-first Polish heritage game. Use the approved WIDE CORNER-VIEW room as the composition reference. Preserve its pulled-back camera, central corner seam, two wall planes, floor line, door positions, outer margins, and light direction.

Use a WIDE ESTABLISHING INTERIOR SHOT, with an eye-level camera approximately 7–8 meters from the INSIDE CORNER. Show two broad walls meeting near the center, substantial wall width on both sides, and a small strip of ceiling. Floorboards converge toward the corner; empty foreground floor fills approximately the lower 35 percent. Natural rectilinear perspective, no fisheye distortion. The room fills the entire portrait canvas without black borders.

Change the materials into a modest old Polish manor interior: warm ivory lime plaster, restrained dark oak trim and ceiling beams, worn oak floorboards, and subtly carved wooden door surrounds. Muted cream, umber, and dusty olive. Soft upper-left daylight. Match the reference's irregular dark-brown contours, fine hatching, painterly textures, and realistic shading. Keep architectural detail close to the edges and ceiling.

EXACTLY TWO CLOSED doors, one on each wall. Show complete door leaves and frames, including visible wall beyond their outer sides. Leave approximately 8 percent image-width margins outside the frames. Each door occupies roughly 22–25 percent of the image height. Preserve clear approaches and ample uninterrupted wall surface between each door and the corner.

Keep the walls continuous and unoccupied. Do not create picture slots, designated display areas, rows, rectangles, frames, paintings, paper, hooks, or markings. No furniture, rugs, tapestries, candles, loose objects, windows, people, lettering, signs, locks, or UI.
```

## 5. Pokój 3 — droga do niepodległości, XIX wiek

```text
Create a portrait 9:16 EMPTY nineteenth-century salon-inspired room for a mobile-first Polish heritage game. Use the approved WIDE CORNER-VIEW room as the composition reference. Preserve its pulled-back camera, central corner seam, two wall planes, floor line, door positions, outer margins, and light direction.

Use a WIDE ESTABLISHING INTERIOR SHOT with an eye-level camera approximately 7–8 meters from the INSIDE CORNER. Show two broad walls meeting near the center, substantial wall width on both sides, and a small visible strip of ceiling. Wooden flooring converges toward the corner and occupies approximately the lower 35 percent. Natural rectilinear perspective, no fisheye distortion. Fill the entire portrait canvas with the room, without black borders.

Use aged warm beige plaster, subtle ceiling molding, pale gray painted baseboards, dark walnut-toned floorboards, and understated paneled wooden doors. Calm nostalgic atmosphere with softly worn surfaces and diffuse upper-left daylight. Keep the established hand-drawn dark-brown contours, delicate sketch marks, painterly shading, and realistic proportions.

EXACTLY TWO CLOSED doors, one on each wall. Show complete door leaves and frames, with visible wall beyond the outer sides. Keep approximately 8 percent image-width margins outside the frames. Each door occupies roughly 22–25 percent of the image height, readable on a phone. Preserve clear approaches and ample uninterrupted wall surface between each door and the corner.

The walls are continuous and unoccupied; the floor is empty. Do not create picture slots, designated display areas, rows, rectangles, frames, pictures, paper, hooks, or markings. No piano, bookshelves, tables, chairs, lamps, rugs, windows, people, lettering, signs, locks, or UI.
```

## 6. Pokój 4 — Polska nowoczesna, XX–XXI wiek

```text
Create a portrait 9:16 EMPTY present-day heritage room with understated modernist character for a mobile-first Polish game. Use the approved WIDE CORNER-VIEW room as the composition reference. Preserve its pulled-back camera, central corner seam, two wall planes, floor line, door positions, outer margins, and light direction.

Use a WIDE ESTABLISHING INTERIOR SHOT with an eye-level camera approximately 7–8 meters from the INSIDE CORNER. Show two broad walls meeting near the center, substantial wall width on both sides, and a small strip of ceiling. Floorboards converge naturally toward the corner. Keep approximately the lower 35 percent as clear foreground floor. Natural rectilinear perspective, no fisheye distortion. The room fills the entire portrait canvas without black borders.

Use warm off-white plaster, simple natural oak trim, maintained wooden flooring, clean understated wooden doors, and restrained muted gray-green details. Soft upper-left daylight. Keep irregular dark-brown ink contours, subtle hatching, visible painterly texture, believable proportions, and realistic matte materials. Calm and welcoming.

EXACTLY TWO CLOSED doors, one on each wall. Show complete door leaves and frames, with visible wall beyond the outer sides. Keep approximately 8 percent image-width margins outside the frames. Each door occupies roughly 22–25 percent of the image height. Preserve clear approaches and ample uninterrupted wall surface between each door and the corner.

Keep both walls continuous and unoccupied. Do not create picture slots, designated display areas, rows, rectangles, frames, pictures, paper, hooks, or markings. No furniture, radio, TV, plants, posters, decorations, windows, people, lettering, signs, locks, or UI.
```

## 7. Korekta wcześniej wygenerowanego pokoju

Dołącz ostatni obraz pokoju jako referencję stylu i materiałów. Poniższy prompt zmienia ciasny kadr na szeroki, zachowując widok narożnika:

```text
Recompose the attached room as a MUCH WIDER ESTABLISHING INTERIOR SHOT in portrait 9:16. Move the eye-level camera backward, approximately 7–8 meters from the INSIDE CORNER. Extend the visible room architecture and floor across the full canvas. Show two broad walls meeting near the center, more uninterrupted wall surface, a small strip of ceiling, and approximately 35 percent foreground floor. Use natural rectilinear perspective, without fisheye distortion.

Preserve the historical materials, hand-drawn contours, painterly shading, muted palette, and upper-left light. Include exactly two closed doors, one on each wall. Show both complete door leaves and their frames, with a visible band of wall beyond the outer sides. Keep approximately 8 percent image-width margins outside each frame. Doors occupy roughly 22–25 percent of the image height, leaving ample wall between them and the corner. Clear approaches to both doors.

Keep the walls and floor empty. No picture slots, display zones, frames, images, hooks, grids, furniture, people, lettering, or UI. Fill the entire image with the room, with no black borders or blank padding.
```

## 8. Reguły drzwi i odbiór

Lewa strona oznacza poprzednią epokę, prawa następną. Podpisy, strzałki, blokadę i reakcje dotykowe dodajemy w kodzie. Proponowane przypadki graniczne: w pierwszym pokoju lewe drzwi wracają do holu, w ostatnim prawe prowadzą do finału/ukończonego domu. Następne drzwi odblokowują się po ukończeniu wymaganych obrazów.

Sprawdzamy dalszy kadr, wyraźny narożnik, dwie szerokie ściany, dokładnie dwoje drzwi widocznych w całości z marginesami, pustą podłogę i brak wyznaczonych miejsc na obrazy. Obraz wypełnia kadr bez czarnych pasów. Wspólne referencje pomagają zachować geometrię, ale rezultat wymaga obejrzenia. Dopiero zaakceptowany szeroki widok służy jako referencja dla kolejnych epok; wymieniamy w nim jedynie materiały.

Wyposażenie generujemy osobno z zaakceptowanym narożnym pokojem jako referencją kamery i światła. Meble, ramy i obrazy dopasowujemy do właściwej płaszczyzny ściany; nie traktujemy obu ścian jak jednego płaskiego tła. Nie zasłaniamy drzwi ani obszarów dotyku.
