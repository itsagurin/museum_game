# 🏗️ 04. Architektura Techniczna i Modele Danych

> **Architektura pierwotnej koncepcji.** Aktualny plan przewiduje osobne sceny domu, holu i czterech pokojów, docelową siatkę 20×20 i progresję automatyczną. Kontrakty i propozycję zapisu zawiera [plan 07](./07_CURRENT_PROJECT_PLAN.md), który zastępuje dawne modele segmentów i ręcznego `upgradeHouse`. Wersje zależności należy ustalić przy inicjalizacji.

> **Cel:** Nowoczesny, lekki, w 100% niezawodny stack w przeglądarce, pozwalający na błyskawiczne iteracje podczas hackathonu bez zbędnego boilerplate'u.

---

## Aktualna implementacja rozwoju pokojów

Główny frontend używa `src/types/game.ts`, `src/data/eras.ts` i `src/store/useGameStore.ts`; poniższe przykłady store są archiwalne. `completedArtworkIds` w zapisie `heritage-hearth-ui-v1` pozostaje źródłem postępu. Wczytywanie usuwa nieznane i powtórzone ID. `src/lib/room-development.ts` oblicza poziom 0–9 proporcjonalnie do ukończenia **całej kolekcji epoki**, niezależnie od pięciu widocznych dzieł. Nie zapisujemy osobnego poziomu. Pusta kolekcja nie oznacza ukończonego pokoju.

`Artwork` opisuje dzieło, a osobny `ArtworkSlot` jego potencjalne miejsce na ścianie (geometria i początkowe ID). Kolekcja `artworks` może mieć np. 30 wpisów na epokę, przy stałych pięciu `wallSlots`. Biblioteka `/#library` ma obecnie 83 wpisy z czterech podfolderów epok (21/18/22/22). `wallAssignments` zapisuje ID miejsca → ID dzieła. `src/lib/wall-gallery.ts` waliduje epokę i unikalność, naprawia zapis oraz zamienia miejscami już wiszące obrazy. Wybór nie nalicza ukończenia. Nieukończone dzieła pokazują kartkę z krzyżykiem. Katalog ma 83 przypisania do plansz JSON 32×32 z `img/*_kolorowanie/json/`. Dopasowanie epoka + nazwa pliku wykonuje `src/lib/coloring-assets.ts`; pełna ścieżka planszy stanowi jej ID, więc powtarzające się surowe ID nie kolidują. `HeritageGame` wczytuje i waliduje tylko wybrany JSON, ma retry i anulowanie. Dostarczone metadane są w `src/data/artworks_qa.json`: `filename` po usunięciu `assets/artworks/` odpowiada dokładnemu `sourceFile`. Tytuły, autorzy, daty, style i pytania/odpowiedzi trafiają do biblioteki, historii i pracowni. Zmiana tytułu nie zmienia ID ani zapisu; plik zawiera polskie teksty także dla UI EN.

Dekorowanie używa 47 osobnych przezroczystych PNG na obecnych pustych tłach. `RoomDecorations` renderuje tylko dodatki właściwej epoki do zdobytego poziomu. Konfiguracja określa warstwy, podpory, stałe miejsca i treści PL/EN ze źródłami. Układ pięciu obrazów zachowuje ID/perspektywę i dostosowuje się do wyposażenia. Progi są wyliczane z pełnej kolekcji, a animacje nagród uruchamia tylko nowe ukończenie. Dymki są portalami wewnątrz kontenera gry, więc działają również w fullscreen; dostosowują pozycję do kamery i rozmiaru ekranu. Generowane z alfy obszary klikania pomijają przezroczysty padding, bez edycji PNG. Build i watcher przygotowują dane geometrii. [Szczegóły](./13_ROOM_DECORATIONS.md).

## 💻 1. Wybór Stacku Technologicznego

| Obszar | Technologia | Dlaczego właśnie to? |
| :--- | :--- | :--- |
| **Framework bazowy** | **Next.js 14+ / React 19** | Zero konfiguracji, szybki start, automatyczny routing, gotowy pod hosting (Vercel). |
| **Język** | **TypeScript (Strict)** | Ochrona przed literówkami w modelach danych obrazów i epok. |
| **Stylowanie** | **Tailwind CSS** | Błyskawiczne budowanie UI, estetyczne motywy kolorystyczne, responsywność. |
| **Animacje i UI** | **Framer Motion + Canvas Confetti** | Płynne animacje pojawiania się mebli, renowacji ścian i uroczystego wieszania obrazów. |
| **Silnik Kolorowanki** | **Interaktywny Wektorowy SVG** | Lepszy niż raster Canvas na hackathon: bezproblemowe skalowanie do każdego ekranu, łatwa detekcja kliknięć na `<path>`, wbudowane hover-efekty i podświetlenia. |
| **Zarządzanie Stanem** | **Zustand + `persist`** | Cały stan gry (odblokowane epoki, stan domu, pokolorowane segmenty) zapisuje się w `localStorage`. Gracz nie traci postępu po odświeżeniu strony. |
| **Dźwięki (Audio FX)** | **Howler.js / Native Web Audio API** | Relaksująca muzyka folkowa w tle (np. motywy liry korbowej / fletu) oraz satysfakcjonujące kliknięcia pędzla. |

---

## 📁 2. Struktura Projektu (Katalogi)

```
best-hacks-2026/
├── public/
│   ├── assets/
│   │   ├── artworks/         # Oryginalne miniatury i wektory SVG do kolorowania
│   │   ├── house/            # Warstwy domu (podłoga, ściany, ruina vs odnowione)
│   │   ├── furniture/        # PNG/SVG mebli i artefaktów
│   │   └── audio/            # Muzyka w tle i efekty dźwiękowe
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Główny layout (fonty, dźwięk tła, motyw)
│   │   ├── page.tsx          # Główny widok: Dom / Renowacja (Hub)
│   │   ├── restore/[id]/     # Podstrona/Tryb kolorowania danego obrazu
│   │   └── gallery/          # Galeria odblokowanych dzieł i ciekawostek
│   ├── components/
│   │   ├── house/
│   │   │   ├── HouseScene.tsx       # Główna scena domu z warstwami
│   │   │   ├── WallGallery.tsx      # Ściana z powieszonymi obrazami
│   │   │   ├── FurnitureSlot.tsx    # Klikalny mebel z dymkiem ciekawostki
│   │   │   └── RenovationModal.tsx  # Wybór ulepszenia ścian / podłogi
│   │   ├── coloring/
│   │   │   ├── ColoringCanvas.tsx   # Obszar roboczy z wektorami SVG
│   │   │   ├── PaletteBar.tsx       # Pasek wyboru kolorów z historią barw
│   │   │   ├── ProgressHeader.tsx   # Licznik postępu (np. 85%) i przycisk powrotu
│   │   │   └── CompletionScreen.tsx # Fanfary, złota rama, pop-up wiedzy
│   │   ├── story/
│   │   │   ├── KnowledgePopup.tsx   # Dwupoziomowy pop-up z historią i obyczajami
│   │   │   └── InspectTooltip.tsx   # Dymek z wiedzą po kliknięciu obiektu w pokoju
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── LanguageToggle.tsx   # Przełącznik EN / PL
│   │       ├── AudioControl.tsx     # Włącz/wyłącz muzykę
│   │       └── InspirationBadge.tsx # Licznik punktów weny
│   ├── data/
│   │   ├── eras.ts                  # Definicje epok (Średniowiecze, Sarmatyzm itd.)
│   │   ├── artworks.ts              # Pełna baza obrazów, palet, segmentów i tekstów
│   │   └── furniture.ts             # Baza mebli, ich powiązanie z obrazami i epokami
│   ├── store/
│   │   └── useGameStore.ts          # Centralny store Zustand z persystencją
│   └── types/
│       └── game.ts                  # Interfejsy TypeScript
```

---

## 🧬 3. Główne Modele Danych TypeScript (`src/types/game.ts`)

```typescript
export type Language = 'en' | 'pl';

export type EraId = 'middle-ages' | 'renaissance' | 'sarmatism' | 'enlightenment' | 'modern';

export interface Era {
  id: EraId;
  name: Record<Language, string>;
  century: string; // np. "XVI Century"
  description: Record<Language, string>;
  architecturalStyle: string; // np. "Renaissance Manor"
  ambientThemeAudio: string;
}

export interface ColorDefinition {
  id: string;
  hex: string;
  name: Record<Language, string>; // np. "Królewska Purpura" / "Royal Crimson"
}

export interface ArtSegment {
  id: string;
  targetColorId: string;
  pathData: string; // SVG path d="..."
}

export interface Artwork {
  id: string;
  eraId: EraId;
  title: Record<Language, string>;
  artist: string;
  year: number;
  previewUrl: string;
  palette: ColorDefinition[];
  segments: ArtSegment[];
  story: {
    overview: Record<Language, string>;
    culturalInsight: Record<Language, string>;
    funFact: Record<Language, string>;
  };
  reward: {
    inspirationPoints: number;
    unlockedFurnitureId: string;
  };
}

export interface FurnitureItem {
  id: string;
  eraId: EraId;
  name: Record<Language, string>;
  description: Record<Language, string>; // Ciekawostka o obyczaju
  iconUrl: string;
  gridSlot: 'floor-center' | 'wall-left' | 'table-center' | 'corner-fireplace';
}

export interface GameState {
  currentEraId: EraId;
  language: Language;
  soundEnabled: boolean;
  inspirationPoints: number;
  
  // Postęp w kolorowaniu: artworkId -> { segmentId: colorId }
  coloringProgress: Record<string, Record<string, string>>;
  
  // Ukończone obrazy
  completedArtworkIds: string[];
  
  // Stan domu
  house: {
    renovationLevel: number; // 0 = ruina, 1 = odnowione ściany, 2 = podłogi, 3 = meble
    placedArtworkIds: string[];
    unlockedFurnitureIds: string[];
  };

  // Akcje
  setLanguage: (lang: Language) => void;
  toggleSound: () => void;
  colorSegment: (artworkId: string, segmentId: string, colorId: string) => void;
  completeArtwork: (artworkId: string) => void;
  upgradeHouse: () => void;
  resetProgress: () => void;
}
```

---

## 🎨 4. Mechanizm Kolorowanki Wektorowej (SVG Architecture)

Dlaczego SVG z `<path>` to najlepszy wybór na hackathon:
1. **Gotowość wektorowa:** Obraz Jana Matejki (np. *Stańczyk*) jest przetworzony na kontury wektorowe z unikalnymi `id`.
2. **Reakcja na kliknięcie:**
   ```tsx
   <path
     d={segment.pathData}
     fill={currentColorId === segment.targetColorId ? activePaletteHex : '#E2E8F0'}
     stroke="#4A5568"
     strokeWidth="1.5"
     className="cursor-pointer transition-colors duration-300 hover:opacity-80"
     onClick={() => handleSegmentClick(segment.id)}
   />
   ```
3. **Wsparcie dla urządzeń dotykowych:** Działa od razu na smartfonach i tabletach jurorów bez skomplikowanych bibliotek dotykowych.
