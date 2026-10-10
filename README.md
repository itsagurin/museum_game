# 🇵🇱 Dziedzictwo: Polish Heritage Hearth (Oikos Polska)
> **Projekt na hackathon Best Hacks 2026**  
> *Interaktywna gra narracyjno-renowacyjna (w stylu cozy game / Garden Keeper) ucząca polskiej kultury i historii od zera poprzez restaurację dzieł sztuki i ewolucję tradycyjnego domu.*

> **Aktualna wizja (10.10.2026):** dom z zewnątrz → wejście przez drzwi → hol z czterema pokojami epok → kolorowanie obrazów po numerach na planszach 20×20. Każdy ukończony obraz automatycznie wyposaża pokój; ukończenie całego pokoju zmienia dom i odblokowuje następną epokę. Sceny są ilustracjami 2D. Zespół: cztery osoby, pozostałe 15 godzin w chwili ustalania planu.
>
> **Zacznij od [aktualnego planu projektu](./docs/07_CURRENT_PROJECT_PLAN.md)**. Zawiera ekrany, reguły, kontrakt algorytmu, podział prac, harmonogram i pytania. Starsze opisy poniżej zachowano jako kontekst pierwotnej koncepcji; przy rozbieżności obowiązuje nowy plan i odpowiedzi zespołu.

> **Wygląd nieukończonych obrazów:** przetarta biało-szara kartka papieru z czerwonym krzyżykiem w ramie. Po ukończeniu kolorowania kartkę zastępuje naturalny kolorowy obraz.

> **Platforma:** mobile-first — telefon w pionie, duże obszary dotyku, pionowe ilustracje domu, holu i pokojów (proponowane 9:16). Plansza 20×20 pozostaje kwadratowa z możliwością powiększenia i przesuwania.

> **Dostarczone grafiki:** pięć etapów domu (`img/house0.jpg`–`house4.jpg`), cztery pokoje (`img/room1.jpg`–`room4.jpg`) i kartka z krzyżykiem. Pliki mają 896×1200; frontend zachowuje ich rzeczywiste proporcje i widoczność obu drzwi pokojów.

## Działający frontend v1

**Pełnoekranowa gra**: dom, hol, cztery pokoje, przesuwana kamera, przejścia, nałożony glass header, PL/EN i kartki z historiami. Kolorowanie 20×20 dostarcza osobna osoba. Wszystkie pokoje są dostępne do prezentacji interfejsu; integracja progresji i nagród jest kolejnym etapem.

```bash
npm ci
npm run dev
```

Strona: `http://localhost:3000`. `npm run build` tworzy `out/` na hosting statyczny zespołu. **[Instrukcja integracji i uruchomienia](./docs/10_FRONTEND_V1.md)** opisuje dane epok, grafiki i callback kolorowania.

Podłączone są wszystkie cztery ilustracje holu `img/hall1.jpg`–`hall4.jpg`, z osobno dopasowanymi obszarami drzwi. Hol zmienia wygląd wraz z ukończonymi pokojami. [Prompty do Flow](./docs/11_HALL_PROMPTS_FOUR_ERAS.md). Polski jest domyślny; bez logowania, tutoriala i dźwięków. Starsza koncepcja poniżej jest materiałem archiwalnym.

## Połączenie z main

Branch `frontend` zawiera zmiany z `main` do commita `38834b9`. Główna strona `/` zachowuje pełnoekranowy dom, hol i cztery pokoje. Prototyp „Dom Opowieści” z trzema obrazami, kolorowaniem i nagrodami jest dostępny pod `/prototype/`. Oba interfejsy mają osobne layouty, style i klucze zapisu; można rozwijać je bez nadpisywania pracy drugiej osoby.

Moduł kolegi: `src/components/artwork-experience.tsx` i `src/components/coloring-canvas.tsx`. Powiązanie konkretnych dzieł z pięcioma miejscami w każdej epoce pozostaje do ustalenia; callback `onRestoreArtwork` w głównym froncie jest zachowany. Dane i grafiki `public/artworks/` oraz `public/assets/` pochodzą z main. [Opis prototypu](./docs/12_MAIN_PROTOTYPE.md).

Wymagany Node.js 22.12 lub nowszy. Wspólne sprawdzenia: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:e2e`. Testy przeglądarkowe obejmują oba adresy. Skrypt `prepare-assets.mjs` kopiuje nasze ilustracje; skrypt main do przygotowania jego grafik zachowano jako `prepare-story-assets.mjs`.


---

## 📖 Spis Treści Dokumentacji (Hub Pamięci Projektu)

Ten projekt posiada modularną architekturę pamięci, zaprojektowaną zarówno dla zespołu ludzkiego, jak i dla agentów AI (LLM / pair programmers).

| Plik | Przeznaczenie |
| :--- | :--- |
| **[`docs/09_ROOM_PROMPTS_CORNER_VIEW.md`](./docs/09_ROOM_PROMPTS_CORNER_VIEW.md)** | **Aktualne pokoje:** cztery prompty do Flow, widok na narożnik, puste ściany i drzwi do poprzedniej/następnej epoki. |
| **[`docs/08_ASSET_PROMPTS_GOOGLE_FLOW.md`](./docs/08_ASSET_PROMPTS_GOOGLE_FLOW.md)** | **Grafiki frontendu:** prompty do Google Flow, kreskowy styl z realizmem, dom i jego etapy, hol, pokoje, papier i wyposażenie. |
| **[`docs/07_CURRENT_PROJECT_PLAN.md`](./docs/07_CURRENT_PROJECT_PLAN.md)** | **Aktualny plan:** cztery pokoje epok, plansze 20×20, automatyczna progresja, sprint 15h dla czterech osób i decyzje do ustalenia. |
| **[`AI_MEMORY.md`](./AI_MEMORY.md)** | **Pigułka pamięci AI**: Kontekst, reguły działania agenta, szybki indeks i standardy pracy. |
| **[`docs/01_VISION_AND_CONCEPT.md`](./docs/01_VISION_AND_CONCEPT.md)** | **Wizja i koncepcja**: Misja projektu, target persona (obcokrajowiec), dlaczego ten format działa. |
| **[`docs/02_GAME_DESIGN.md`](./docs/02_GAME_DESIGN.md)** | **Game Design Document (GDD)**: Pętla gry (Core Loop), mechanika kolorowanki, mechanika domu. |
| **[`docs/03_HISTORICAL_CURATION.md`](./docs/03_HISTORICAL_CURATION.md)** | **Baza kultury i historii**: Chronologiczne epoki, obrazy (m.in. Jan Matejko), struktura wiedzy i pop-upów. |
| **[`docs/04_TECHNICAL_ARCHITECTURE.md`](./docs/04_TECHNICAL_ARCHITECTURE.md)** | **Architektura techniczna**: Stack (React/Next.js/Tailwind), modele danych TypeScript, struktura kodu. |
| **[`docs/05_HACKATHON_ROADMAP.md`](./docs/05_HACKATHON_ROADMAP.md)** | **Plan i priorytety hackathonu**: Fazy MVP, podział zadań, scenariusz demonstracji dla jurorów. |
| **[`docs/06_AGENT_RULES_AND_STANDARDS.md`](./docs/06_AGENT_RULES_AND_STANDARDS.md)** | **Zasady dla agentów i developerów**: Standardy kodowania, konwencje nazewnictwa, obsługa błędów. |

---

## 💡 Idea Projektu w Pigułce (Elevator Pitch)

Większość materiałów o polskiej historii jest hermetyczna, pełna dat i trudnych nazwisk, przez co obcokrajowcy (i młodzież) szybko tracą zainteresowanie.

**Nasze rozwiązanie:**
Łączymy uzależniający, relaksujący schemat gier renowacyjnych (jak *Gardenscapes*, *Garden Keeper* czy *House Flipper*) z interaktywnym odkrywaniem polskiego dziedzictwa:
1. **Zrujnowany Dom:** Gracz zaczyna z popadającą w ruinę pradawną chatą.
2. **Kolorowanka Historyczna:** Wykonuje zadania polegające na renowacji (pokolorowaniu/złożeniu) słynnych polskich dzieł malarstwa (np. Jana Matejki, Józefa Chełmońskiego, Stanisława Wyspiańskiego).
3. **Pigułka Kultury:** Po ukończeniu obrazu pojawia się lekki, przystępny pop-up wyjaśniający kontekst, obyczaje i ciekawostki epoki (z opcją „Dowiedz się więcej”).
4. **Rozbudowa i Dekoracja:** Obraz ląduje na ścianie domu, a sam budynek ewoluuje architektonicznie – od wczesnośredniowiecznej drewnianej chaty, przez renesansowy dwór, szlachecki barokowy dworek, aż po czasy współczesne.

---

## 🎯 Główne Cele na Hackathon

- [ ] **Działające MVP w przeglądarce:** Responsywna aplikacja webowa.
- [ ] **Core Gameplay Loop:** Widok domu $\rightarrow$ Przejście do kolorowanki $\rightarrow$ Zakończenie i pop-up edukacyjny $\rightarrow$ Widok ulepszonego domu z nowym detalem i powieszonym obrazem.
- [ ] **Wielojęzyczność:** Polski domyślnie + przełącznik na angielski.
- [ ] **Świetna oprawa wizualna i "Cozy Feeling":** Klimatyczna muzyka ludowa w tle, ciepłe kolory, satysfakcjonujące animacje nagród.

---

## 🛠️ Rekomendowany Stack Technologiczny

- **Frontend:** Next.js 14+ (App Router) / React 19, TypeScript
- **Styling:** Tailwind CSS + Framer Motion (płynne przejścia, renowacje domu)
- **Silnik minigry (Kolorowanki):** SVG z interaktywnymi ścieżkami (`path`) lub HTML5 Canvas / Fabric.js
- **Zarządzanie stanem:** Zustand (z persystencją w `localStorage` – brak konieczności skomplikowanego backendu na hackathon)
- **Assety graficzne:** Wektorowe SVG / stylizowane grafiki 2D wygenerowane lub przygotowane w spójnym stylu cozy low-poly/hand-drawn.

---

## 🚀 Jak zacząć pracę?

1. Przeczytaj [`AI_MEMORY.md`](./AI_MEMORY.md), aby poznać wytyczne architektoniczne.
2. Przejrzyj [`docs/02_GAME_DESIGN.md`](./docs/02_GAME_DESIGN.md) i [`docs/04_TECHNICAL_ARCHITECTURE.md`](./docs/04_TECHNICAL_ARCHITECTURE.md).
3. Śledź kamienie milowe w [`docs/05_HACKATHON_ROADMAP.md`](./docs/05_HACKATHON_ROADMAP.md).
