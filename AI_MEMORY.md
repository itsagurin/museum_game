# 🧠 AI_MEMORY.md — Główny Kontekst Pamięci dla Agenta AI

> **Status:** AKTYWNA PAMIĘĆ PROJEKTU  
> **Kontekst:** Hackathon *Best Hacks 2026*  
> **Język kodu:** TypeScript / React  
> **Język UI gry:** Angielski (domyślny - dla obcokrajowców) + Polski (opcjonalny)  
> **Język dokumentacji:** Polski

## Aktualizacja wizji — 10.10.2026

**Najpierw czytaj [07_CURRENT_PROJECT_PLAN.md](./docs/07_CURRENT_PROJECT_PLAN.md).** Ten plan oraz najnowsze instrukcje zespołu mają pierwszeństwo przed starszym szkieletem stanu i mechanikami opisanymi niżej.

Ustalone przez zespół:

- Strona główna: dom z zewnątrz; kliknięcie drzwi prowadzi do holu.
- Hol: cztery drzwi do czterech pokojów epok Polski, od powstania państwa do współczesności.
- Pokój: w ramach nieukończonych obrazów wiszą przetarte biało-szare kartki papieru z czerwonym krzyżykiem. Kliknięcie kartki otwiera kolorowanie po numerach na **siatce 15×15** przygotowywanej algorytmem członka zespołu. Kartka pozostaje do ukończenia, a następnie zastępuje ją kolorowy obraz.
- Ukończenie obrazu: naturalny kolorowy obraz na ścianie i automatyczne wyposażenie pokoju z odpowiedniej epoki.
- Ukończenie wszystkich obrazów pokoju: automatyczne ulepszenie domu i odblokowanie następnych drzwi.
- Oprawa: ilustracje 2D, grafiki i styl zapewnia zespół.
- Organizacja: cztery osoby, każda z Codexem; 15 godzin pozostałych w chwili planowania.
- Obecny etap: planowanie. Nie rozpoczynaj implementacji na podstawie samego zlecenia przygotowania planu.

Robocze propozycje wymagające potwierdzenia:

- Cztery rozdziały: początki/średniowiecze, dawna Rzeczpospolita, droga do niepodległości, Polska XX–XXI wieku.
- Dane algorytmu: paleta HEX i 225 numerów w kolejności wierszowej; dokładny kontrakt opisuje plan.
- Odsłonięcie zachowanego oryginału po ukończeniu, zamiast próby odzyskania szczegółów z 225 pól.
- Dostęp do pierwszego pokoju od początku; pozostałe kolejno, z możliwością powrotu.
- React/Next.js, TypeScript, lokalny zapis; EN/PL i warstwa edukacyjna do potwierdzenia na demo.

W nowej wizji ręczne zakupy renowacji, waluta i kolorowanie dowolnych konturów SVG nie są ustalonym rdzeniem gry. Wcześniejsze przykłady poniżej służą jako historyczny kontekst; modele aktualnej planszy i progresji są w dokumencie 07.

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
