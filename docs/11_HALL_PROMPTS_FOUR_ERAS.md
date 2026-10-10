# Cztery wersje holu — Google Flow

To cztery wyglądy **tego samego holu w jednym domu**, nie cztery różne układy budynku. Każdy wariant ma dokładnie cztery drzwi do pokojów epok: dwoje na lewej i dwoje na prawej ścianie. Nie generujemy dodatkowych drzwi wyjściowych, ram, obrazów, mebli, napisów ani interfejsu. Glass jest nakładany w aplikacji.

Wygeneruj `hall1.jpg` z `room1.jpg` jako referencją stylu. Następne warianty generuj **edycją zatwierdzonego `hall1.jpg`**. Odpowiedni `room2.jpg`, `room3.jpg` lub `room4.jpg` może być dodatkową referencją materiałów, lecz nie układu. Zachowuj tę samą kamerę, proporcje **3:4**, kierunek światła i położenie drzwi. Zapisz wyniki w `img/`.

## 1. Początki Polski — `hall1.jpg`

```text
Create the entrance hall INSIDE an early Polish timber house, matching the attached room reference: hand-drawn dark-brown ink outlines, painterly shading, realistic rough oak, muted warm earth colours. Portrait 3:4 image, edge-to-edge illustration. Distant eye-level view from the entrance, wide composition, both side walls and the rear wall visible. Exactly FOUR closed wooden doors: two spaced apart on the left wall and two on the right wall. The rear wall has no doorway. Show every door, frame and threshold fully, with wall margins around them; keep the farther doors only slightly smaller. Broad empty wooden floor, timber walls, simple ceiling beams, low stone base, forged iron hinges. Soft diffuse daylight from the upper left. Empty hall, no furniture, paintings, picture frames, marked wall slots, people, text, numbers, signs, glass UI or black borders. This will be the fixed composition for four eras.
```

## 2. Dawna Rzeczpospolita — `hall2.jpg`

```text
Edit the attached approved hall into the entrance hall of an old Polish manor, using the second reference only for its materials and drawing style. Preserve the exact 3:4 canvas, distant camera, perspective, lighting direction, room geometry and positions, outlines and sizes of all FOUR closed doors: two on each side wall, none on the rear wall. Replace the rough timber wall finish with aged warm beige lime plaster and a restrained dark-oak lower wall treatment. Keep visible oak ceiling beams, refined wooden door panels, simple iron fittings and worn wide oak floorboards. Hand-drawn dark-brown ink outlines, painterly shading and believable materials, muted warm colours. Keep all doorways fully visible and the floor empty. No furniture, paintings, picture frames, wall slots, people, text, numbers, signs, interface or borders. Change the architectural finishes, not the camera or layout.
```

## 3. Droga do niepodległości — `hall3.jpg`

```text
Edit the attached approved hall into a modest Polish townhouse entrance hall from the nineteenth to early twentieth century, matching the room reference's linework and materials. Preserve the exact 3:4 canvas, distant camera, perspective, light direction and all FOUR closed doorways in precisely the same positions and sizes: two on each side wall, none on the rear wall. Use aged ivory plaster, discreet hairline cracks, simple plaster cornices, elegant but restrained timber door panels, small brass handles and a worn wooden floor. Slightly more refined than the manor, never a palace. Fine dark-brown ink outlines, painterly shading, realistic textures and muted warm colours. Empty floor and walls. No furniture, paintings, picture frames, marked slots, people, text, numbers, signs, interface or borders. No camera movement, cropping, new openings or rearranged doors.
```

## 4. Polska nowoczesna — `hall4.jpg`

```text
Edit the attached approved hall into the present-day interior of the same restored Polish heritage house. Preserve the exact 3:4 canvas, distant camera, perspective, light direction, room geometry and all FOUR closed doorways in identical positions and sizes: two on each side wall, none on the rear wall. Use clean warm off-white plaster with a subtle pale sage tint, simple slim mouldings, restored light-oak floorboards and four understated light-wood doors with modest contemporary handles. Keep the home's historic proportions and welcoming character. Brighter finishes, without changing the lighting direction. Hand-drawn dark-brown ink outlines, painterly shading and realistic materials, matching the room reference. Empty floor and walls. No furniture, paintings, picture frames, wall slots, people, text, numbers, signs, interface, borders or futuristic elements. Update only the materials and architectural details.
```

## Integracja

Frontend rozpoznaje `hall1.jpg`–`hall4.jpg` po restarcie dev / buildzie. Pierwszy wariant jest początkowy, następne pojawiają się po ukończeniu pokojów; po czwartej epoce zostaje wariant 4. Starszy `hall.jpg` jest wspólnym tłem awaryjnym. Jeżeli nie ma odpowiedniego obrazu, działa hol SVG w kolorach epoki.

Wszystkie cztery grafiki są już dodane i podłączone. Obszary drzwi w `src/data/halls.ts` są dopasowane osobno dla każdego wariantu, ponieważ wygenerowane ościeżnice różnią się położeniem i wielkością. Przy ponownym generowaniu zachowuj kamerę i układ, a przy zmianie kompozycji zaktualizuj odpowiednie współrzędne. Wygenerowane grafiki są pełnym tłem gry; przy innym kształcie ekranu można przesunąć kamerę lub zobaczyć całą scenę.
