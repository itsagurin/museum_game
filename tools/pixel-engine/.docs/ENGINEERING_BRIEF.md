# ENGINEERING_BRIEF.md — Specyfikacja Techniczna Silnika Kolorowanki Pikselowej

## 1. Architektura i Przepływ Danych

```
[ Otwarte Bazy Dzieł Kultury ] (Polona / Cyfrowe MNW / Wikimedia Commons)
               │ (oryginalne obrazy HD)
               ▼
   [ Pixel Coloring Engine (src/core/pixel_engine.py) ]
   1. Resize do siatki (np. 32x32 lub 48x48)
   2. K-Means clustering (K = 5 dominant colors w CIELAB/RGB)
   3. Kwantyzacja pikseli -> macierz ID: 1..5
   4. Wygenerowanie palety HEX [#RRGGBB, ...]
               │
               ▼
[ Baza Dzieł Sztuki + Ciekawostki Kulturowe ] (src/data/artworks.json)
               │
               ▼
       [ FastAPI REST API ]
   ├── GET /api/artworks (zwraca listę obiektów wg ścisłego schematu)
   ├── GET /api/artworks/{id} (zwraca konkretny obiekt dzieła)
   └── POST /api/convert (konwersja dowolnego obrazu do schematu)
               │
               ▼
[ Aplikacja Mobilna TikTok-style ]
   1. Renderuje siatkę `grid.data` z paletą 1..5 na dole
   2. Użytkownik koloruje pola
   3. Po ukończeniu: płynne odsłonięcie `original_image_url`
   4. Prezentacja `cultural_data.trivia` oraz `cultural_data.historical_context`
```

---

## 2. Kanoniczny Schemat Wyjściowy Algorytmu i API (Definicja Obowiązująca)

Każde przetworzone dzieło sztuki zwracane przez algorytm oraz API **musi** ściśle spełniać poniższy format JSON:

```json
{
  "id": "stanczyk-matejko",
  "title": "Stańczyk",
  "artist": "Jan Matejko",
  "year": "1862",
  "original_image_url": "https://.../stanczyk_hd.jpg",
  "grid": {
    "width": 32,
    "height": 32,
    "data": [
      [1, 1, 2, 2],
      [1, 3, 4, 5]
    ]
  },
  "palette": [
    { "id": 1, "hex": "#7A141A", "name": "Czerwień szkarłatna" },
    { "id": 2, "hex": "#1F1A24", "name": "Czerń / Ciekawe tło" },
    { "id": 3, "hex": "#C69C55", "name": "Złoto wawelskie" },
    { "id": 4, "hex": "#4B2E1E", "name": "Ciemny brąz" },
    { "id": 5, "hex": "#E3D5C5", "name": "Kremowy / Skóra" }
  ],
  "cultural_data": {
    "trivia": "Stańczyk na balu u królowej Bony jako jedyny przeżywa utratę Smoleńska, podczas gdy polski dwór bawi się w najlepsze.",
    "historical_context": "Symbol narodowej refleksji i odpowiedzialności politycznej. Matejko nadał błaznowi własną twarz."
  }
}
```

### Specyfikacja Typów Pydantic / TypeScript:
- **`id`** (`string`): Unikalny identyfikator dzieła w formacie slug (np. `stanczyk-matejko`).
- **`title`** (`string`): Tytuł dzieła.
- **`artist`** (`string`): Imię i nazwisko autora.
- **`year`** (`string`): Rok powstania lub orientacyjny czas (np. `"1862"`).
- **`original_image_url`** (`string`): Bezpośredni URL do oryginalnego pliku graficznego w jakości HD.
- **`grid`** (`object`):
  - **`width`** (`integer`): Liczba kolumn w siatce pikseli (np. `32`).
  - **`height`** (`integer`): Liczba wierszy w siatce pikseli (np. `32`).
  - **`data`** (`array of arrays of integers`): Macierz 2D o wymiarach `height x width`. Każda komórka przyjmuje wyłącznie wartość całkowitą ze zbioru `{1, 2, 3, 4, 5}`, odpowiadającą `id` z palety.
- **`palette`** (`array of objects`, dokładnie 5 elementów):
  - **`id`** (`integer`): Liczba od 1 do 5.
  - **`hex`** (`string`): Kolor w formacie `#RRGGBB` (wielkie litery).
  - **`name`** (`string`): Przyjazna polska nazwa barwy / kontekstowa nazwa pigmentu.
- **`cultural_data`** (`object`):
  - **`trivia`** (`string`): Ciekawostka historyczna lub anegdota o dziele.
  - **`historical_context`** (`string`): Kontekst roli dzieła w polskiej kulturze i tożsamości.

---

## 3. Algorytm Przetwarzania Obrazu na Kolorowankę
1. **Wczytanie i Skalowanie**:
   - Obraz źródłowy skalowany do zadanej siatki `width x height` (domyślnie $32 \times 32$) przy zachowaniu kadru.
2. **Ekstrakcja Palety 5 Barw**:
   - Algorytm K-Means ($K=5$) w przestrzeni barwnej RGB/CIELAB.
   - Posortowanie klastrów i przypisanie im etykiet od 1 do 5.
3. **Generowanie Siatki**:
   - Każdy piksel zredukowany do indeksu najbliższego centroidu (1–5).
