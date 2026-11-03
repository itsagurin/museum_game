# AGENTS.md — Specyfikacja Operacyjna Agenta: image_generation

## 1. Cel i Rola Projektu
Projekt **image_generation** realizuje moduł przetwarzania obrazu i backendu dedykowany dla hackathonu **Code for Culture**.
Głównym zadaniem serwisu **NIE JEST** generowanie nowych grafik przez AI (obrazy pochodzą z darmowych baz dziedzictwa kulturowego: Polona, Cyfrowe MNW, domena publiczna).

**Główny cel**:
Tworzenie **interaktywnej kolorowanki pikselowej (color-by-number / pixel art)** na podstawie oryginalnych polskich dzieł sztuki:
1. Pobranie/wczytanie oryginalnego obrazu HD polskiego dzieła sztuki.
2. Konwersja obrazu na zoptymalizowaną siatkę pikseli (np. 32x32, 48x48) z redukcją do 5 kluczowych kolorów (K-Means/kwantyzacja barw).
3. Wygenerowanie struktury kolorowanki dla aplikacji mobilnej (paleta 5 barw z identyfikatorami 1–5, macierz pikseli z numerami, metadane kulturowe).
4. Udostępnienie endpointów dla aplikacji mobilnej w stylu TikTok:
   - feed z przygotowanymi kolorowankami,
   - weryfikacja / odsłonięcie oryginalnego dzieła HD po pokolorowaniu wraz z ciekawostką historyczną i kontekstem kulturowym.

---

## 2. Architektura i Stack Technologiczny
- **Język**: Python 3.10+
- **Przetwarzanie obrazów**: OpenCV, Pillow (PIL), NumPy, scikit-learn (K-Means dla palet barw).
- **API Serwisowe**: FastAPI, Uvicorn, Pydantic (REST API dla aplikacji mobilnej z endpointami `/api/artworks`, `/api/pixelate`, `/api/verify`, `/api/health`).
- **Zarządzanie środowiskiem**: `venv` / `requirements.txt`.
- **Testy**: pytest, httpx.

---

## 3. Kluczowe Zasady i Ograniczenia
1. **Brak ciężkich modeli generatywnych**: Projekt opiera się na wydajnych algorytmach wizji komputerowej i kwantyzacji barw (szybkość < 50ms na konwersję).
2. **Ścisły format danych wyjściowych (zgodny z ADR-003 i .docs/ENGINEERING_BRIEF.md)**:
   - Obiekt z polami: `id`, `title`, `artist`, `year`, `original_image_url`, `grid`, `palette`, `cultural_data`.
   - `grid`: `width`, `height`, `data` (macierz 2D liczb całkowitych wyłącznie 1–5).
   - `palette`: dokładnie 5 elementów `{id: 1..5, hex: "#RRGGBB", name: string}`.
   - `cultural_data`: `{trivia: string, historical_context: string}`.
3. **Optymalizacja UX na hackathonie**:
   - Zero opóźnień inferencyjnych — natychmiastowe ładowanie danych w feedzie a la TikTok.
4. **Zasady Git**: Commitujemy tylko kod źródłowy, schematy i konfigurację. Surowe duże pliki graficzne w `.gitignore` lub serwowane przez dedykowane URL.

---

## 4. Standardowe Polecenia

```bash
# Aktywacja środowiska wirtualnego
source .venv/bin/activate

# Uruchomienie serwera API
uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload

# Uruchomienie testów
pytest tests/ -v

# Przetworzenie katalogu dzieł na kolorowanki pikselowe
python -m src.data.process_coloring --input_dir data/raw --output_file src/data/artworks_db.json
```

---

## 5. Definition of Done (DoD)
Zadanie uznaje się za zakończone, gdy:
- [ ] Kod źródłowy jest w pełni sformatowany, bez błędów składniowych.
- [ ] Pipeline kwantyzacji do 5 barw i generowania siatki pikseli działa deterministycznie i poprawnie.
- [ ] Endpointy API zwracają poprawne schematy Pydantic z paletą 1–5, macierzą pikseli i metadanymi historycznymi.
- [ ] Testy jednostkowe przechodzą pomyślnie.
- [ ] Pamięć projektu (`CURRENT_STATE.md`, `DECISIONS.md`, `TASKS.md`) została zaktualizowana.
