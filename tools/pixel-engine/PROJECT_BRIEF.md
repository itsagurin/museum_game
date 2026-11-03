# PROJECT_BRIEF.md — Podsumowanie Projektu: image_generation (Pixel Coloring Engine)

## 1. Kontekst Biznesowy i Hackathonowy
Projekt powstaje na potrzeby hackathonu **Code for Culture**.
Serwis stanowi silnik przetwarzania obrazów i backend zasilający aplikację mobilną w stylu **TikTok** („Scroll & Paint Culture”).

### Założenia Aplikacji:
- Oryginalne dzieła sztuki (wysokiej rozdzielczości) pochodzą z **darmowych, otwartych baz dziedzictwa kulturowego** (Polona, Cyfrowe Muzeum Narodowe, domena publiczna).
- Serwis **nie generuje sztucznych obrazów AI**, lecz przetwarza autentyczne polskie dzieła malarstwa na **prostą kolorowankę pikselową (pixel coloring book / color-by-numbers)**.
- Użytkownik w aplikacji mobilnej:
  1. Przegląda pionowy feed dzieł kultury.
  2. Otrzymuje siatkę pikseli (np. 32x32 lub 48x48) wraz z paletą dokładnie **5 kolorów** przypisanych do liczb 1–5.
  3. Koloruje piksele dotknięciem ekranu.
  4. Po ukończeniu kolorowania obraz odsłania oryginalne dzieło HD (efekt „odpikselowania” / unpixelate reveal) wraz z **ciekawostką historyczną** i **kontekstem roli dzieła w polskiej kulturze**.

---

## 2. Cele Serwisu (`image_generation`)
1. **Generator Kolorowanek Pikselowych (`src/pipeline/coloring_generator.py`)**:
   - Skalowanie dzieła HD do siatki pikselowej z zachowaniem proporcji.
   - Ekstrakcja 5 dominujących, estetycznych barw dzieła za pomocą algorytmu K-Means (przestrzeń CIELAB / RGB).
   - Przypisanie każdego piksela w siatce do koloru 1–5 z palety.
   - Generowanie macierzy numerycznej `grid[y][x] \in {1, 2, 3, 4, 5}`.
2. **Katalog Dzieł i Metadanych Kulturowych (`src/data/artworks_db.json`)**:
   - Przechowywanie bazy dzieł (tytuł, autor, rok, ciekawa anegdota, kontekst kulturowy, link do oryginału HD).
3. **API Serwisowe (FastAPI)**:
   - Endpointy dostarczające dane kolorowanki bezpośrednio do feedu mobilnego.
   - Endpoint do dynamicznego przekształcania dowolnego wskazanego obrazu na kolorowankę 5-kolorową.

---

## 3. Kluczowe Metryki Sukcesu
- **Czas odpowiedzi**: < 50–100 ms (błyskawiczne działanie bez potrzeby GPU).
- **Czytelność kolorowanki**: Paleta 5 kolorów wiernie oddaje charakter i kompozycję oryginalnego dzieła.
- **Gotowość integracyjna**: Format JSON idealnie dopasowany do komponentów React Native / Flutter (Grid component).
