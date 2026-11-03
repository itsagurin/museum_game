# DECISIONS.md — Architectural Decision Records (ADR)

## ADR-001: Inicjalizacja Repozytorium i Architektura Hybrydowa dla Hackathonu Code for Culture
- **Data**: 2026-10-10
- **Status**: Zastąpione przez ADR-002

---

## ADR-002: Zmiana Założeń — Silnik Kolorowanki Pikselowej zamiast Generatywnego AI
- **Data**: 2026-10-10
- **Status**: Zaakceptowano

### Kontekst
Użytkownik sprecyzował, że serwis nie będzie generować obrazów za pomocą modeli generatywnych (Diffusion/GAN). Oryginalne obrazy wysokiej jakości pochodzą z darmowych, otwartych baz dziedzictwa narodowego (Polona, MNW itp.).
Celem projektu jest przekształcenie autentycznego dzieła sztuki w **prostą kolorowankę pikselową (color-by-number)** z siatką pikseli i dokładnie 5 kolorami do pokolorowania w aplikacji mobilnej w stylu TikTok.

### Decyzja
1. Odrzucenie ciężkich modeli generatywnych AI na rzecz algorytmów wizji komputerowej (PIL, NumPy, scikit-learn K-Means).
2. Generowanie siatki pikseli (32x32) oraz 5-kolorowej palety.

---

## ADR-003: Kanoniczny Kontrakt Danych Wyjściowych dla Algorytmu Kolorowanki
- **Data**: 2026-10-10
- **Status**: Zaakceptowano (Wiążąca definicja użytkownika)

### Kontekst
Aplikacja mobilna (TikTok-style feed) wymaga precyzyjnego kontraktu danych, aby natychmiast renderować siatkę pikseli, przyciski wyboru 5 kolorów oraz po ukończeniu kolorowania odsłonić oryginał z ciekawostką historyczną.

### Decyzja
Zdefiniowano ściśle wiążący format wyjściowy algorytmu i endpointów API:
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

### Konsekwencje
- Algorytm w `src/core/pixel_engine.py` oraz modele Pydantic w `src/api/schemas.py` muszą ściśle mapować dane do tej struktury.
- `grid.data` zawiera wyłącznie liczby całkowite od 1 do 5.
- `palette` zawiera zawsze dokładnie 5 elementów z identyfikatorami 1 do 5.
