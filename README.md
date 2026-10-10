# 🇵🇱 Dziedzictwo: Polish Heritage Hearth (Oikos Polska)
> **Projekt na hackathon Best Hacks 2026**  
> *Interaktywna gra narracyjno-renowacyjna (w stylu cozy game / Garden Keeper) ucząca polskiej kultury i historii od zera poprzez restaurację dzieł sztuki i ewolucję tradycyjnego domu.*

> **Aktualna wizja (10.10.2026):** dom z zewnątrz → wejście przez drzwi → hol z czterema pokojami epok → kolorowanie obrazów po numerach na planszach 15×15. Każdy ukończony obraz automatycznie wyposaża pokój; ukończenie całego pokoju zmienia dom i odblokowuje następną epokę. Sceny są ilustracjami 2D. Zespół: cztery osoby, pozostałe 15 godzin w chwili ustalania planu.
>
> **Zacznij od [aktualnego planu projektu](./docs/07_CURRENT_PROJECT_PLAN.md)**. Zawiera ekrany, reguły, kontrakt algorytmu, podział prac, harmonogram i pytania. Starsze opisy poniżej zachowano jako kontekst pierwotnej koncepcji; przy rozbieżności obowiązuje nowy plan i odpowiedzi zespołu.

> **Wygląd nieukończonych obrazów:** przetarta biało-szara kartka papieru z czerwonym krzyżykiem w ramie. Po ukończeniu kolorowania kartkę zastępuje naturalny kolorowy obraz.

---

## 📖 Spis Treści Dokumentacji (Hub Pamięci Projektu)

Ten projekt posiada modularną architekturę pamięci, zaprojektowaną zarówno dla zespołu ludzkiego, jak i dla agentów AI (LLM / pair programmers).

| Plik | Przeznaczenie |
| :--- | :--- |
| **[`docs/07_CURRENT_PROJECT_PLAN.md`](./docs/07_CURRENT_PROJECT_PLAN.md)** | **Aktualny plan:** cztery pokoje epok, plansze 15×15, automatyczna progresja, sprint 15h dla czterech osób i decyzje do ustalenia. |
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
- [ ] **Wielojęzyczność z naciskiem na EN:** Język angielski jako domyślny (dla obcokrajowca bez pojęcia o Polsce) + opcja PL.
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
