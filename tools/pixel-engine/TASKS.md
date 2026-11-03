# TASKS.md — Rejestr Zadań Projektu (Pixel Coloring Engine)

## Faza 1: Inicjalizacja i Repozytorium (Zakończone)
- [x] Inicjalizacja lokalnego repozytorium git (`main`)
- [x] Utworzenie repozytorium GitHub (`wojgww/image_generation`) i pierwszy push
- [x] Stworzenie i aktualizacja dokumentacji pamięci projektu (`AGENTS.md`, `PROJECT_BRIEF.md`, `CURRENT_STATE.md`, `DECISIONS.md`, `TASKS.md`, `.docs/ENGINEERING_BRIEF.md`)
- [x] Rejestracja w centralnym rejestrze `INDEX.md`

## Faza 2: Środowisko i Silnik Przetwarzania Obrazu (Pixel Coloring Core) (Zakończone)
- [x] Utworzenie `requirements.txt` i `pyproject.toml`
- [x] Implementacja modułu `src/core/pixel_engine.py`:
  - [x] Obsługa dynamicznej siatki $N \times N$ (parametr `n` w konstruktorze i wywołaniu)
  - [x] Ekstrakcja 5 barw w przestrzeni CIELAB (K-Means)
  - [x] Mapowanie pikseli do ID 1–5
  - [x] Eksport macierzy numerycznej oraz palety HEX z polskimi nazwami
  - [x] Algorytm czyszczenia szumów (izolowane piksele / Majority Filter)
  - [x] Zabezpieczenie przed obrazami o małej liczbie barw
  - [x] Kompaktowy serializator JSON
- [x] Implementacja wizualizera `src/core/visualizer.py` (podgląd Pixel Art oraz diagram kolorowanki z numerami 1–5 i paletą)

## Faza 3: Baza Dzieł Sztuki i Metadanych Kulturowych (Zakończone)
- [x] Skrypt `src/data/download_heritage.py` pobierający dzieła z Wikimedia Commons (*Stańczyk*, *Babie lato*, *Bociany*, *Żydówka z pomarańczami*, *Szał uniesień*)
- [x] Skrypt `src/data/process_artworks.py` generujący gotowe kolorowanki dla dowolnego $N$
- [x] Utworzenie bazy `src/data/artworks_db.json` z ciekawostkami historycznymi i kontekstem kulturowym

## Faza 4: API REST dla Aplikacji Mobilnej (FastAPI) (Zakończone)
- [x] Endpoint `GET /api/artworks` — lista dzieł do feedu (z opcją dynamicznej siatki `?n=...`)
- [x] Endpoint `GET /api/artworks/{id}` — szczegóły konkretnej kolorowanki
- [x] Endpoint `POST /api/convert` — konwersja obrazu Base64 z parametrem `n`
- [x] Endpoint `POST /api/convert/upload` — konwersja pliku graficznego z parametrem `n`
- [x] Endpoint `GET /health` — health check
- [x] Konfiguracja CORS (dostęp dla Expo / React Native)
- [x] Serwowanie statycznych podglądów `/static/previews` i assetów `/static/assets`

## Faza 5: Testy i Weryfikacja (Zakończone)
- [x] Testy jednostkowe silnika kwantyzacji (`tests/test_pixel_engine.py`)
- [x] Testy konwersji i dynamicznej siatki $N \in \{8, 16, 24, 32, 48, 64\}$
- [x] Testy na obrazach z katalogu `assets/`
- [x] Testy endpointów API (`tests/test_api.py`)
- [x] 19/19 testów zaliczonych pomyślnie
