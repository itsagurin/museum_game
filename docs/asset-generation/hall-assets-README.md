# Osobne assety holów

25 samodzielnych plików PNG RGBA przygotowanych wbudowanym narzędziem `image_gen` z czterech zdjęć `hall1_z_dodatkami.jpg`–`hall4_z_dodatkami.jpg`.

- `img/hall1_assets/`: 2 assety.
- `img/hall2_assets/`: 4 assety.
- `img/hall3_assets/`: 7 assetów.
- `img/hall4_assets/`: 12 assetów.
- `output/asset-previews/hall1.jpg`–`hall4.jpg`: podglądy na jasnym tle; jasne tło nie występuje w assetach PNG.
- `output/hall-assets.zip`: cztery foldery PNG, podglądy i dokumentacja.

Każdy przedmiot jest oddzielnym assetem. Obrazy zachowują ramy. Lustra zachowują szkło. Bukiet i ceramiczny wazon pozostają jednym assetem. Dwa kinkiety zapisano osobno. Konsole mają puste blaty, a zegary i wazon nie są częścią konsoli.

Zasłonięte elementy mebli i fragment lustra za kwiatami zostały odtworzone w stylu źródłowej ilustracji. Są to rekonstrukcje na podstawie zdjęć, a nie wyłącznie kadry niezmienionych pikseli. Poszczególne warianty holu mają własne assety.

Każdy finalny PNG ma przezroczyste tło i 24 dodatkowe piksele przezroczystego marginesu. Oryginalny wygenerowany kanał alfa zachowano bez zmian. Sprawdzono przezroczystość, pełne sylwetki przedmiotów i brak nieprzezroczystych pikseli na krawędzi kadru.

Pełne prompty, źródła, przybliżone położenia przedmiotów na obrazach źródłowych i korekty znajdują się w [hall-assets.json](./hall-assets.json). Wyniki kontroli kanału alfa, rozmiary i skróty plików znajdują się w [hall-assets-validation.json](./hall-assets-validation.json).

Współrzędne `source_bounds` odnoszą się do źródłowego płótna 768 × 1376 px. Samodzielne PNG mają własne wymiary i marginesy; nie są gotowymi nakładkami o rozmiarze całego holu.
