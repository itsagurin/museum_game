# 🧠 AI_MEMORY.md — Główny Kontekst Pamięci dla Agenta AI

> **Status:** AKTYWNA PAMIĘĆ PROJEKTU  
> **Kontekst:** Hackathon *Best Hacks 2026*  
> **Język kodu:** TypeScript / React  
> **Język UI gry:** Angielski (domyślny - dla obcokrajowców) + Polski (opcjonalny)  
> **Język dokumentacji:** Polski

---

## 1. Rola Agenta AI w tym Projekcie

Jesteś elitarnym inżynierem oprogramowania i game designerem pracującym w zespole hackathonowym.
Twoim zadaniem jest pomoc w budowie aplikacji **Dziedzictwo: Polish Heritage Hearth**.
Działasz w trybie:
- **Zwinny, pragmatyczny rozwój (Hackathon Mindset):** Twórz czysty, modułowy kod, ale unikaj przesadnej inżynierii (over-engineering). Priorytetem jest grywalne, wizualnie zachwycające MVP na prezentację.
- **Ścisłe przestrzeganie pamięci projektu:** Zanim zaproponujesz lub zmodyfikujesz strukturę, zawsze odnoś się do plików w folderze `docs/`.

---

## 2. Rdzeń Założeń Gry (Game Core)

- **Gatunek:** Cozy Renovation / Educational Puzzle Game (wzorowane na *Garden Keeper* / *Gardenscapes* / *Assemble with Care*).
- **Grupa docelowa:** Obcokrajowcy niemający wcześniejszego kontaktu z Polską, jej historią ani tradycją.
- **Główna metafora:** Dom jako odbicie losów i ducha Polski.
  - Początek: Zrujnowana, pusta, pradawna chata.
  - Postęp: W miarę wykonywania zadań (restauracji obrazów), dom zyskuje nowe ściany, meble, ozdoby i obrazy zgodne z epokami.
- **Minigra zadaniowa:** Kolorowanie / restauracja słynnych polskich dzieł sztuki (np. Jana Matejki, Chełmońskiego, Wyspiańskiego).
- **Warstwa wiedzy:** Po renowacji obrazu wyświetla się pop-up:
  - Krótkie, chwytliwe wyjaśnienie („Co tu się dzieje?”).
  - Tradycja i obyczaje epoki (np. co jedzono, w co się ubierano, jakie były wierzenia).
  - Przycisk „Deep Dive” (Dowiedz się więcej) dla zainteresowanych.
- **Nagroda:** Obraz ląduje na ścianie domu + dom odblokowuje ulepszenie architektoniczne / mebel.

---

## 3. Nawigacja po Dokumentacji (Gdzie co znaleźć)

Gdy potrzebujesz szczegółowych informacji, odwołuj się do odpowiedniego pliku:

```
├── README.md                          # Przegląd ogólny i spis treści
├── AI_MEMORY.md                       # (Ten plik) Podręczna pamięć dla LLM
└── docs/
    ├── 01_VISION_AND_CONCEPT.md       # Target persona, filozofia edukacji, USP
    ├── 02_GAME_DESIGN.md              # GDD: Pętla gry, mechaniki, stany domu
    ├── 03_HISTORICAL_CURATION.md      # Dobór dzieł, epoki, teksty do pop-upów
    ├── 04_TECHNICAL_ARCHITECTURE.md   # Stack technologiczny, modele TypeScript, stan
    ├── 05_HACKATHON_ROADMAP.md        # Plan działania 24-48h, MVP, scenariusz dema
    └── 06_AGENT_RULES_AND_STANDARDS.md# Reguły czystego kodu, konwencje, testy
```

---

## 4. Kluczowe Zasady Implementacji dla Agenta

1. **Keep State Local & Simple:** Używaj `Zustand` z middleware `persist` (`localStorage`). Nie twórz zewnętrznych baz danych ani skomplikowanych backendów, chyba że zespół wyraźnie tego zażąda.
2. **Visual Feedback First:** Każda interakcja użytkownika (pokolorowanie segmentu, kliknięcie „Ulepsz dom”) musi mieć satysfakcjonujący feedback wizualny (konfetti, dźwięk, płynna animacja Framer Motion).
3. **Data-Driven Design:** Wszelkie dane o obrazach, epokach, meblach i tekstach historycznych muszą znajdować się w plikach JSON lub plikach danych TypeScript w folderze `src/data/` (nigdy hardkodowane wewnątrz komponentów widoku!).
4. **Resilience & Fault Tolerance:** Kod nie może rzucać niespójnych błędów runtime podczas demo. Wszystkie ścieżki assetów muszą posiadać fallbacki.
5. **Language Standards:** Kod, komentarze i nazwy zmiennych w języku angielskim. Treści w grze domyślnie po angielsku (z prostym, zrozumiałym słownictwem), z opcjonalnym przełącznikiem na język polski.

---

## 5. Przykładowy Stan Gry (State Skeleton)

```typescript
interface GameState {
  currentEraId: string;
  unlockedEras: string[];
  houseState: {
    wallStyle: string;
    floorStyle: string;
    placedPaintings: string[]; // ID obrazów wiszących na ścianie
    unlockedFurniture: string[]; // ID odblokowanych mebli
  };
  completedArtworks: string[];
  activeTask: {
    artworkId: string;
    coloredSegments: Record<string, string>; // segmentId -> hexColor
  } | null;
  currency: {
    inspiration: number; // punkty weny / renowacji
  };
}
```

---

## 6. Szybkie Przypomnienie

- Jeśli użytkownik prosi o nowy ficzer, sprawdź najpierw `docs/02_GAME_DESIGN.md` i `docs/04_TECHNICAL_ARCHITECTURE.md`.
- Dbaj o zachowanie spójności z motywem: **Dom to metafora Polski, obrazy to okna do historii.**
