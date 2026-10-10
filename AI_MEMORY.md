# 🧠 AI_MEMORY.md — Główny Kontekst Pamięci dla Agenta AI

> **Status:** AKTYWNA PAMIĘĆ PROJEKTU  
> **Kontekst:** Hackathon *Best Hacks 2026*  
> **Język kodu:** TypeScript / React  
> **Język UI gry:** Polski domyślnie + przełącznik na angielski
> **Język dokumentacji:** Polski

## Aktualizacja wizji — 10.10.2026

**Najpierw czytaj [07_CURRENT_PROJECT_PLAN.md](./docs/07_CURRENT_PROJECT_PLAN.md).** Ten plan oraz najnowsze instrukcje zespołu mają pierwszeństwo przed starszym szkieletem stanu i mechanikami opisanymi niżej.

Ustalone przez zespół:

- Strona główna: dom z zewnątrz; kliknięcie drzwi prowadzi do holu.
- Hol: cztery drzwi do czterech pokojów epok Polski, od powstania państwa do współczesności.
- Pokój: w ramach nieukończonych obrazów wiszą przetarte biało-szare kartki papieru z czerwonym krzyżykiem. Kliknięcie kartki otwiera kolorowanie po numerach na **siatce 20×20** przygotowywanej algorytmem członka zespołu. Kartka pozostaje do ukończenia, a następnie zastępuje ją kolorowy obraz.
- Ukończenie obrazu: naturalny kolorowy obraz na ścianie i automatyczne wyposażenie pokoju z odpowiedniej epoki.
- Ukończenie wszystkich obrazów pokoju: automatyczne ulepszenie domu i odblokowanie następnych drzwi.
- Oprawa: ilustracje 2D, kreskowe ciemnobrązowe kontury, malarskie cieniowanie i realistyczne materiały według dwóch referencji wnętrza. Użytkownik zajmuje się frontendem i generuje grafiki w Google Flow. Prompty i lista assetów: [08_ASSET_PROMPTS_GOOGLE_FLOW.md](./docs/08_ASSET_PROMPTS_GOOGLE_FLOW.md).
- Platforma: **mobile-first**, telefon w pionie i sterowanie dotykiem. Podstawowe sceny mają proponowane proporcje **9:16** (cel 1080×1920); hol ma cztery czytelne drzwi, a kwadratowa plansza 20×20 wymaga przybliżenia i przesuwania. Nie opieraj interakcji na hover. Komputer jest adaptacją układu mobilnego.
- Każdy pokój pokazuje **wewnętrzny narożnik i dwie szerokie ściany** oraz dwoje drzwi: poprzednia/następna epoka, po lewej i prawej. Generator nie wyznacza miejsc, rzędów ani stref dla obrazów. Frontend rozmieszcza początkowo pięć obrazów na obu ścianach, z możliwością rozszerzenia. Tło nie zawiera ram ani obrazów. Prompty: [09_ROOM_PROMPTS_CORNER_VIEW.md](./docs/09_ROOM_PROMPTS_CORNER_VIEW.md). Liczba wymaganych zadań jest osobną decyzją.
- Kadr pokoju jest **dalszy i szeroki**, z odsuniętą kamerą na wysokości oczu. Drzwi i ościeżnice są widoczne w całości z marginesami po bokach; pozostają duże powierzchnie ścian, więcej podłogi i niewielki fragment sufitu. Bez czarnych pasów. Kolejne epoki bazują na zaakceptowanym dalszym kadrze.
- **Gotowe assety w `img/`:** `house0.jpg`–`house4.jpg`, `room1.jpg`–`room4.jpg`, `hall1.jpg`–`hall4.jpg`, `blank_paper_crossmark.jpg`; wszystkie 896×1200. Pokoje i hole obejrzano; zachowaj faktyczne proporcje obrazów, bez rozciągania do proponowanego wcześniej 9:16. Obszary drzwi są dopasowane osobno dla każdego pokoju i każdej ilustracji holu. Wyposażenie nie jest jeszcze obecne w katalogu.
- Organizacja: cztery osoby, każda z Codexem; 15 godzin pozostałych w chwili planowania.
- **Aktualny układ: pełnoekranowa gra.** Sceny od krawędzi do krawędzi, bez okienka i strony z bocznym opisem. Header i kontrolki glass są nakładane na obraz. Kamera przesuwa się palcem / myszą, ma strzałki i opcję pokazania całej sceny.
- Hol ma cztery podłączone warianty epok (`hall1.jpg`–`hall4.jpg`) i cztery drzwi. Układy są w `src/data/halls.ts`: bliższe lewe → I, dalsze lewe → II, dalsze prawe → III, bliższe prawe → IV. Materiały i pozycje drzwi różnią się między wariantami, więc nie używaj wspólnych współrzędnych. Wygląd: 0 ukończonych pokojów → hall1, 1 → hall2, 2 → hall3, 3–4 → hall4. Prompty: [11_HALL_PROMPTS_FOUR_ERAS.md](./docs/11_HALL_PROMPTS_FOUR_ERAS.md).
- **Obecny etap: implementacja pierwszej wersji frontendu, zlecona przez użytkownika.** Dom → hol → cztery pokoje, animacje, nowoczesne panele glass i header. Kolorowanie 20×20 implementuje inna osoba.
- Potwierdzony stack: Next.js, TypeScript, Tailwind, Zustand. Lokalny zapis wystarczy; bez logowania, tutoriala i dźwięków. Hosting zespołu, eksport statyczny `out/`.
- Małe kartki pod obrazami otwierają historię i ciekawostkę. Lista dzieł i nagród nadal do dostarczenia.
- W pierwszym froncie wszystkie pokoje można obejrzeć. Blokady progresji będą podłączone później. Szczegóły uruchomienia i adaptera minigry: [10_FRONTEND_V1.md](./docs/10_FRONTEND_V1.md).

- **Scalenie main → frontend:** pobrano main do `38834b9`. Główna strona `/` zachowuje nasz dom, hol i cztery pokoje. Prototyp kolegi „Dom Opowieści” z trzema obrazami, kolorowaniem, audio i nagrodami działa osobno pod `/prototype/`; nie zastępuje wizji użytkownika. Layouty i CSS są rozdzielone przez route groups `(heritage)` i `(prototype)`. Moduł `ArtworkExperience` i wszystkie dane obrazów z main są zachowane; przypisanie dzieł do pięciu miejsc każdej epoki wymaga ustalenia, callback `onRestoreArtwork` pozostaje punktem integracji. `StoryDialog.tsx` to dawny `dialog.tsx` z main (kolizja wielkości liter). Node.js ≥22.12; sprawdzenia obejmują testy Vitest i oba zestawy Playwright. Szczegóły: [12_MAIN_PROTOTYPE.md](./docs/12_MAIN_PROTOTYPE.md).

Starsze propozycje (stosuj tylko w zakresie zgodnym z najnowszymi decyzjami):

- Cztery rozdziały: początki/średniowiecze, dawna Rzeczpospolita, droga do niepodległości, Polska XX–XXI wieku.
- Dane algorytmu: paleta HEX i 400 numerów w kolejności wierszowej; dokładny kontrakt opisuje plan.
- Odsłonięcie zachowanego oryginału po ukończeniu, zamiast próby odzyskania szczegółów z 400 pól.
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
5. **Language Standards:** Kod, komentarze i nazwy zmiennych w języku angielskim. Treści w grze domyślnie po polsku, z przełącznikiem na język angielski.

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
