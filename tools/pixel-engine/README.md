# Pixel Coloring Engine — Code for Culture

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
