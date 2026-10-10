# 🤖 06. Zasady Pracy dla Agentów AI i Standardy Kodu

> **Aktualizacja:** przed pracą czytaj [plan 07](./07_CURRENT_PROJECT_PLAN.md) i [frontend v1](./10_FRONTEND_V1.md). Standardy jakości poniżej pozostają przydatne, lecz przykłady store, konturów SVG, waluty i renowacji odnoszą się do wcześniejszej koncepcji. Aktualna gra ma plansze **20×20**, kolorowanie dostarcza osobny członek zespołu. Pierwsza wersja to dom, hol i cztery pokoje z nowoczesnym UI glass. **Polski jest domyślny**, EN jest opcją. Bez tutoriala i audio. Otwarte propozycje planu nie są potwierdzonymi decyzjami zespołu.

> **Dla kogo:** Każdy agent LLM oraz programista pracujący nad kodem repozytorium *Best Hacks 2026*.  
> **Priorytet:** Stabilność, czytelność, szybkość wprowadzania zmian i spójność z wizją gry.

---

## 🧭 1. Główne Dyrektywy dla Agenta AI

1. **Zawsze sprawdzaj pamięć przed pisaniem kodu:**
   - Przed dodaniem nowego obrazu lub epoki sprawdź `docs/03_HISTORICAL_CURATION.md`.
   - Przed modyfikacją stanu gry sprawdź `docs/04_TECHNICAL_ARCHITECTURE.md`.
2. **Koniec z 'Magic Strings' i Hardkodowaniem:**
   - Wszelkie teksty kulturowe, kolory palety i identyfikatory muszą znajdować się w `src/data/` lub `src/types/`. Komponenty React mają być czysto prezentacyjne i reużywalne.
3. **Nie twórz niepotrzebnych zależności (No Bloat):**
   - Na hackathonie unikaj instalowania ciężkich bibliotek 3D czy rozbudowanych silników gier, jeśli wystarczy czysty SVG, Canvas lub Tailwind + Framer Motion.
4. **Testuj ścieżkę krytyczną:**
   - Zadbaj o to, aby odświeżenie strony nie resetowało postępu gracza bez jego woli (dzięki Zustand `persist`).
   - Każda akcja użytkownika (kliknięcie segmentu, powieszenie obrazu) musi mieć natychmiastową reakcję wizualną.

---

## 💻 2. Standardy Kodu i TypeScript

- **Język w kodzie:** Kod źródłowy (zmienne, funkcje, interfejsy, komentarze techniczne) piszemy **w języku angielskim**.
- **Język treści gry:** Treści w grze domyślnie **bilingual** (`en` i `pl`) ze wskazaniem na zrozumiały angielski dla obcokrajowca.
- **TypeScript:** Tryb `strict`. Zakaz używania typu `any`. Jeśli typ jest nieznany, użyj `unknown` i type guardów.
- **Komponenty funkcyjne:** Wszystkie komponenty jako standardowe funkcje React z wytypowanymi `props`:
  ```tsx
  interface ColoringCanvasProps {
    artwork: Artwork;
    activeColorId: string;
    onSegmentColored: (segmentId: string) => void;
  }

  export const ColoringCanvas: React.FC<ColoringCanvasProps> = ({ ... }) => { ... };
  ```

---

## 🎨 3. Wytyczne UI / UX (Cozy Aesthetic)

Aplikacja musi wywoływać ciepłe, przytulne uczucie spokoju i nostalgii:
- **Paleta barw interfejsu:** Ciepłe odcienie drewna, pergaminu, miodu, lnu i ciemnego dębu:
  - Tło: Ciepły krem / pergamin (`bg-[#FAF6EE]` lub `bg-stone-50`).
  - Akcenty: Królewska czerwień / purpura (`#991B1B`), bursztynowe złoto (`#D97706`), głęboki granat (`#1E293B`).
  - Ramki i obrysy: Zaokrąglone rogi (`rounded-2xl` / `rounded-3xl`), miękkie cienie (`shadow-lg`, `shadow-amber-900/10`).
- **Mikrointerakcje:**
  - Przyciski powinny reagować na hover i tap delikatnym powiększeniem (`hover:scale-105 active:scale-95 transition-transform`).
  - Ukończenie zadania musi nagradzać gracza (błysk, konfetti, powolne wyłonienie się obrazu w ramie).

---

## 🗄️ 4. Zarządzanie Stanem (Zustand Best Practices)

- Store powinien być modularny:
  ```typescript
  // src/store/useGameStore.ts
  import { create } from 'zustand';
  import { persist } from 'zustand/middleware';

  export const useGameStore = create<GameState>()(
    persist(
      (set, get) => ({
        // Początkowy stan
        currentEraId: 'renaissance',
        language: 'en',
        soundEnabled: true,
        inspirationPoints: 0,
        coloringProgress: {},
        completedArtworkIds: [],
        house: {
          renovationLevel: 0,
          placedArtworkIds: [],
          unlockedFurnitureIds: [],
        },
        // Akcje niemutujące bezpośrednio
        colorSegment: (artworkId, segmentId, colorId) =>
          set((state) => ({
            coloringProgress: {
              ...state.coloringProgress,
              [artworkId]: {
                ...(state.coloringProgress[artworkId] || {}),
                [segmentId]: colorId,
              },
            },
          })),
        // ...
      }),
      {
        name: 'heritage-hearth-storage',
      }
    )
  );
  ```

---

## ⚠️ 5. Odporność na Błędy (Graceful Fallbacks)

- Jeśli plik SVG nie istnieje lub ładuje się z opóźnieniem, wyświetl elegancki placeholder ze szkieletem ładowania (Skeleton Loader).
- Jeśli brakuje danego tłumaczenia, system automatycznie wraca do wersji angielskiej (`en`).
- Przycisk awaryjny: Dodaj w stopce lub w ustawieniach ukryty / dostępny przycisk **"Reset Demo State"** na wypadek, gdyby zespół chciał zresetować grę od zera przed wejściem jurorów.
