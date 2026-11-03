# Pixel Coloring Engine — generator plansz gry Dziedzictwo

> **W repozytorium gry (od listopada 2026).** Kod pochodzi z [wojgww/image_generation](https://github.com/wojgww/image_generation) i został dołączony z historią (`git subtree`, katalog `tools/pixel-engine/`). Plansze gry powstają tutaj z manifestu `content/artworks.json`.
>
> ```bash
> cd tools/pixel-engine
> python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
> cd ../.. && npm run content:puzzles      # img/puzzles/<id>.json i .png + raport outputs/puzzle-report.html
> ```
>
> **Plansze v2** (`src/core/puzzle_builder.py`, `src/build_puzzles.py`): dłuższy bok ma 32 pola, krótszy wynika z proporcji obrazu (bez wycinania kwadratu); paleta 6–10 kolorów z K-Means w CIELAB, łączenie kolorów bliższych niż ΔE 12 i zajmujących mniej niż 1,2% pól; schemat `{schemaVersion: 2, id, grid, palette}` bez tekstów, które należą do manifestu. Wynik jest deterministyczny.
>
> **Źródła reprodukcji** (`src/content_sources.py`): wyszukuje każde dzieło w Wikimedia Commons i przyjmuje kandydata tylko wtedy, gdy hash jego miniatury zgadza się z naszym plikiem; zapisuje stronę pliku i licencję w `source` manifestu (`--write`). Niedopasowane dzieła wypisuje do ręcznego uzupełnienia.
>
> Testy: `.venv/bin/python -m pytest -q` (też w CI). API i galeria poniżej pochodzą z hackathonu i nie są używane przez grę.

---

## Pierwotny opis (hackathon, Code for Culture)

Serwis backendowy i silnik przetwarzania obrazów dla aplikacji hackathonowej **Code for Culture** (TikTok-style culture feed).

---

## 🎨 O Projekcie
Projekt nie generuje sztucznych obrazów AI — korzysta z autentycznych polskich dzieł sztuki z otwartych baz muzealnych (Polona, Cyfrowe MNW, domena publiczna).

Zadaniem silnika jest automatyczne przekształcanie dzieł malarstwa w **interaktywną kolorowankę pikselową (color-by-number)**:
1. Skalowanie obrazu do siatki (np. 32x32 lub 48x48).
2. Wyodrębnienie kluczowej palety **dokładnie 5 kolorów** za pomocą algorytmu K-Means.
3. Wygenerowanie siatki pikseli z numerami 1–5 dla aplikacji mobilnej.
4. Udostępnienie endpointów REST API dostarczających kolorowanki wraz z **ciekawostkami historycznymi** i **kontekstem kulturowym**.
5. Po pokolorowaniu w aplikacji następuje efektowne „odpikselowanie”, odsłaniające oryginalne dzieło HD.

---

## 🛠️ Stack Technologiczny
- **Python 3.10+**
- **Pillow (PIL), OpenCV, NumPy, scikit-learn** — przetwarzanie grafiki i K-Means clustering
- **FastAPI / Uvicorn** — lekki i szybki REST API
- **Pydantic** — walidacja schematów danych dla aplikacji mobilnej

---

## 🚀 Szybki Start
```bash
# Klonowanie repozytorium
git clone https://github.com/wojgww/image_generation.git
cd image_generation

# Środowisko wirtualne
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Uruchomienie API (FastAPI)
uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 📖 Pamięć Projektu
- [`AGENTS.md`](file:///home/ai_workspace/Projekty/image_generation/AGENTS.md) — Wytyczne operacyjne i DoD
- [`PROJECT_BRIEF.md`](file:///home/ai_workspace/Projekty/image_generation/PROJECT_BRIEF.md) — Cele biznesowe i hackathonowe
- [`CURRENT_STATE.md`](file:///home/ai_workspace/Projekty/image_generation/CURRENT_STATE.md) — Aktualny stan prac
- [`DECISIONS.md`](file:///home/ai_workspace/Projekty/image_generation/DECISIONS.md) — Rejestr decyzji architektonicznych (ADR-001, ADR-002)
- [`TASKS.md`](file:///home/ai_workspace/Projekty/image_generation/TASKS.md) — Zadania projektowe
- [`.docs/ENGINEERING_BRIEF.md`](file:///home/ai_workspace/Projekty/image_generation/.docs/ENGINEERING_BRIEF.md) — Schematy JSON i algorytm K-Means
