# CURRENT_STATE.md — Bieżący Stan Projektu: image_generation

## Status Projektu
`Zaimplementowano i weryfikowano Pixel Coloring Engine dla dynamicznego N x N, API FastAPI oraz bazę dzieł sztuki`

---

## 1. Działające Elementy
- [x] Repozytorium GitHub powiązane i zsynchronizowane ([wojgww/image_generation](https://github.com/wojgww/image_generation)).
- [x] Pamięć projektu zaktualizowana zgodnie z ADR-001, ADR-002, ADR-003.
- [x] Środowisko wirtualne z zależnościami (`requirements.txt`, `pyproject.toml`).
- [x] **Silnik Kolorowanki Pikselowej (`src/core/pixel_engine.py`)**:
  - Obsługa dynamicznej siatki $N \times N$ (parametr `n`).
  - Ekstrakcja 5 barw w przestrzeni percepcyjnej CIELAB algorytmem K-Means.
  - Automatyczne polskie nazwy barw (`src/core/color_utils.py`).
  - Usuwanie szumów i izolowanych pikseli (Majority Filter).
  - Obsługa obrazów z małą liczbą barw (monochromatyczne, 2-kolorowe) bez ostrzeżeń.
  - Kompaktowy serializator JSON (`to_canonical_json`).
- [x] **Narzędzie Wizualizacji i Katalog Before/After (`src/core/visualizer.py`, `src/core/generate_gallery.py`)**:
  - Generowanie podglądu Pixel Art (`_art.png`).
  - Generowanie diagramu do kolorowania z numerkami 1–5 i legendą palety (`_numbered.png`).
  - Generowanie plakatów zestawieniowych 3 paneli (`comparison.png`).
  - Interaktywny katalog webowy HTML w `outputs/before_after/index.html` oraz pod endpointem `/gallery`.
  - Przejrzysta struktura katalogów `outputs/before_after/<slug>/` (before, after, diagram, composite, data.json).
- [x] **Testy i Walidacja na Obrazach**:
  - Przetestowano na wszystkich 5 obrazach użytkownika z folderu `assets/` dla siatek $N=16, 32, 48$.
  - Pobrano 5 polskich arcydzieł z domeny publicznej (`data/heritage`): *Stańczyk*, *Babie lato*, *Bociany*, *Żydówka z pomarańczami*, *Szał uniesień*.
  - Przetestowano na pobranych dziełach i wygenerowano bazę `src/data/artworks_db.json`.
- [x] **REST API FastAPI (`src/api/main.py`)**:
  - `GET /health`
  - `GET /api/artworks` (z opcją dynamicznego przeliczania `?n=...`)
  - `GET /api/artworks/{id}` (z opcją `?n=...`)
  - `POST /api/convert` (Base64)
  - `POST /api/convert/upload` (Multipart file upload)
  - Serwowanie podglądów statycznych `/static/previews` i assetów `/static/assets`
- [x] **Zestaw Testów Jednostkowych (`tests/`)**:
  - 19 testów jednostkowych i integracyjnych przechodzi pomyślnie (`19 passed in 9.44s`).

---

## 2. Elementy w Trakcie / Do Zrobienia
- Integracja z frontendem mobilnym TikTok-style feed.
- Opcjonalne rozszerzenie bazy dzieł o kolejne pozycje polskiego malarstwa.

---

## 3. Aktywne Blokery
- Brak.

---

## 4. Najbliższe Kroki
1. Commit i push zmian implementacyjnych do zdalnego repozytorium GitHub.
2. Wsparcie zespołu frontendowego przy integracji endpointów `/api/artworks`.
