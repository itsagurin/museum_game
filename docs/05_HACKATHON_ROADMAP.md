# ⏱️ 05. Hackathon Roadmap & Pitch Demo Plan

> **Pierwotny plan 24–48h.** Zespół ma obecnie 15 godzin i cztery osoby. Aktualny zakres, podział prac, harmonogram oraz demo czterech pokojów opisuje [plan 07](./07_CURRENT_PROJECT_PLAN.md), który ma pierwszeństwo przed poniższą roadmapą.

> **Format:** Plan działania na hackathon (24–48h)  
> **Cel nadrzędny:** Doprowadzenie projektu do stanu zachwycającego, stabilnego i w 100% grywalnego demo dla jurorów.

---

## 🎯 1. Zakres MVP (MoSCoW Prioritization)

### ✅ MUST-HAVE (Absolutny priorytet na pierwsze godziny):
- [x] Spójny projekt pamięci i architektura dokumentacji (`AI_MEMORY.md` + `docs/`).
- [ ] Inicjalizacja projektu Next.js + Tailwind + TypeScript.
- [ ] Widok Domu (Scena początkowa: zniszczona chata/pokój z widocznymi zarysami mebli i pustą ścianą).
- [ ] Minigra Kolorowanki: przynajmniej **1 dopracowane dzieło sztuki** (np. *Stańczyk* Jana Matejki z 6–10 segmentami SVG i historyczną paletą).
- [ ] Satysfakcjonujący Pop-up z wiedzą po ukończeniu: dwujęzyczny (EN/PL), krótka opowieść o błaźnie, obyczajach szlacheckich i ciekawostka.
- [ ] Widok Ulepszonego Domu: odnowiona ściana, powieszony *Stańczyk* w złotej ramie, odblokowane dębowe biurko.

### 🟡 SHOULD-HAVE (Druga faza – pogłębienie doświadczenia):
- [ ] Drugie dzieło sztuki (np. *Bociany* Chełmońskiego lub *Konstytucja 3 Maja*).
- [ ] Tryb inspekcji mebli: kliknięcie wstawionego mebla otwiera dymek z ciekawostką o dawnym polskim życiu codziennym.
- [ ] Efekty audio: spokojna folkowa melodia w tle, dźwięki klikania pędzla i fanfare po ukończeniu.
- [ ] Efekt konfetti i płynne przejścia Framer Motion.

### 🔵 NICE-TO-HAVE (Dodatki, jeśli zostanie czas):
- [ ] Oś czasu epok (wybór: Średniowiecze / Renesans / Sarmatyzm / Młoda Polska).
- [ ] Galeria odblokowanych kart wiedzy (Leksykon kulturowy gracza).
- [ ] Możliwość pobrania pokolorowanego obrazu jako PNG / tapety z certyfikatem "Restorer of Polish Art".

---

## ⏰ 2. Rozkład Czasowy Sprintów (24h/48h)

```
[Faza 1: Baza i Koncepcja] (Godziny 0-4)
  └─ Architektura pamięci, inicjalizacja repozytorium, modele danych.
[Faza 2: Silnik Kolorowanki] (Godziny 4-10)
  └─ Interaktywny komponent SVG, dobór palety, mechanika dopasowywania kolorów.
[Faza 3: Scena Domu i Progresja] (Godziny 10-16)
  └─ Widok pokoju, stan ruina -> odnowiony, Zustand persist, system powieszenia obrazu.
[Faza 4: Warstwa Edukacyjna & Popupy] (Godziny 16-20)
  └─ Popupy wiedzy, ciekawostki o obyczajach, dopracowanie tekstów w języku angielskim.
[Faza 5: Polerowanie & Próba Demo] (Ostatnie 4 godziny)
  └─ Dźwięki, mikro-animacje, testy na telefonie i laptopie, nagranie wideo zapasowego.
```

---

## 🎤 3. 3-Minutowy Scenariusz Prezentacji dla Jurorów (Demo Pitch)

Prezentacja musi skupić się na problemie, rozwiązaniu i natychmiastowym pokazaniu działającej gry.

### Minuta 0:00 – 0:45: Haczyk i Problem (Hook)
> *"Dzień dobry! Ilu z Was próbowało wytłumaczyć znajomemu z zagranicy, czym była Konstytucja 3 Maja, kim był Stańczyk albo dlaczego pod obrusem na Wigilię kładziemy siano? Zwykle kończy się to nudnym wykładem z datami.  
> Obcokrajowcy nie mają emocjonalnego punktu zaczepienia do polskiej kultury. Dlatego stworzyliśmy **Heritage Hearth** — grę w stylu cozy renovation, gdzie gracz zaczyna z zapomnianą ruiną i odbudowuje polski dom na przestrzeni wieków, przywracając blask arcydziełom malarstwa."*

### Minuta 0:45 – 2:00: Live Demo w Przeglądarce
1. **Pokaż dom w ruinie:**  
   *"To jest nasz dom na początku. Szare, zbutwiałe ściany. Aby go ożywić, musimy podjąć zadanie konserwacji."*
2. **Wejdź w kolorowankę:**  
   *"Oto zniszczone arcydzieło Jana Matejki. Gracz wybiera historyczne barwy — królewską purpurę, czerwień szlachecką — i relaksująco przywraca obraz do życia."* (Szybkie pokolorowanie ostatnich segmentów na żywo).
3. **Efekt ukończenia i Pop-up wiedzy:**  
   *"Zamiast nudnego testu, gracz otrzymuje lekką opowieść: dowiaduje się, dlaczego błazen jest jedyną mądrą osobą w pokoju i jak polska wolność słowa pozwalała mu drwić z królów. Może też kliknąć 'Dowiedz się więcej'."*
4. **Powrót do domu (Uroczysta metamorfoza):**  
   *"A teraz magia: obraz zostaje powieszony na ścianie, ściana zmienia się w ciepłe dębowe bale, a w kącie staje biurko z piórem i listem. Gracz widzi namacalny owoc swojej nauki."*

### Minuta 2:00 – 2:40: Skalowalność i Wpływ Społeczny
> *"Gra jest w pełni po angielsku (z opcją PL), co otwiera ją na szkoły polonijne, turystów i globalną społeczność graczy cozy games. W kolejnych etapach wprowadzamy następne epoki — od Piastów po modernizm."*

### Minuta 2:40 – 3:00: Podsumowanie i Q&A
> *"Łączymy relaks gier casualowych z dumą z polskiego dziedzictwa. Dziękujemy i zapraszamy do przetestowania!"*

---

## 🛡️ 4. Potencjalne Pytania Jurorów i Gotowe Odpowiedzi

- **P: Dlaczego właśnie kolorowanka, a nie np. quiz w stylu Kahoot / Duolingo?**  
  *O:* Badania nad cozy games pokazują, że tworzenie i renowacja wywołują stan tzw. *flow* i głębokie przywiązanie emocjonalne. Quiz ocenia i stresuje, a kolorowanie wycisza i sprawia, że gracz uważnie przygląda się detalom historycznego obrazu.

- **P: Czy obcokrajowiec zrozumie tak specyficzną historię?**  
  *O:* Tak, ponieważ filtrujemy historię przez uniwersalne motywy: emocje ludzi (smutek Stańczyka), relację z naturą (bociany Chełmońskiego), odwagę i gościnność (chleb i sól).
