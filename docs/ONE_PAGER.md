# DZIEDZICTWO

**Pokoloruj sztukę. Odkryj historię. Ożyw swój dom.**

Best Hacks 2026 · Sztuka, Historia i Tradycja

Gra przeglądarkowa, która łączy odkrywanie polskiego malarstwa z kolorowaniem po numerach i rozwojem własnego wirtualnego domu. Każde ukończone dzieło staje się częścią osobistej kolekcji i przybliża jego historię.

**83 dzieła · 4 epoki · 47 dekoracji · plansze 32×32**

## Przebieg aplikacji i rozwój pokoju

Pusty pokój → kolorowanie → historia obrazu → kolekcja → wyposażony pokój.

## Problem, na który odpowiadamy

Kontakt ze sztuką bywa bierny: oglądamy reprodukcję lub czytamy opis, ale brakuje nam powodu, żeby zatrzymać się przy dziele. Rozbudowane teksty, specjalistyczne pojęcia i brak kontekstu mogą utrudniać pierwszy krok. Projekt odpowiada na trzy bariery: wysoki próg wejścia, małą sprawczość odbiorcy i brak widocznego postępu. Kierujemy go do młodzieży i młodych dorosłych, zwłaszcza osób rozpoczynających przygodę ze sztuką i lubiących kreatywne gry mobilne.

## Cel projektu

Chcemy rozbudzić ciekawość polskiego dziedzictwa i ułatwić poznawanie malarstwa bez wcześniejszej wiedzy. Łączymy spokojną, twórczą aktywność z krótką opowieścią o dziele oraz nagrodą widoczną we własnym domu. Dom jest metaforą odkrywanej kultury: im więcej obrazów poznajesz, tym bogatsza staje się Twoja przestrzeń.

## Rozwiązanie i przebieg gry

Gracz wchodzi do domu, przechodzi przez hol i wybiera jeden z czterech pokojów: Oświecenie, Romantyzm, Pozytywizm lub Młoda Polska. W pracowni dobiera kolory i wypełnia piksele planszy 32×32. Ukończenie odsłania reprodukcję oraz historię i ciekawostkę. Dzieło trafia do kolekcji, a gracz wybiera jego miejsce na ścianie. Kolejne ukończone obrazy podnoszą poziom pokoju od 0 do 9 i odblokowują wyposażenie. Ukończenie kolekcji epoki zmienia także wygląd domu i holu.

## Korzyści dla użytkownika

Użytkownik otrzymuje relaksującą aktywność, którą wykonuje we własnym tempie, oraz prosty sposób na poznanie autorów, dzieł i ich kontekstu. Obraz obserwowany podczas kolorowania zyskuje znaczenie dzięki opowieści. Własna kolekcja, wybór ekspozycji i nowe dekoracje dają poczucie sprawczości oraz satysfakcję z postępu. Gra działa na telefonie i komputerze, bez instalacji i zakładania konta. Ukończone dzieła i układ ścian zapisują się lokalnie w przeglądarce, więc można wrócić do swojej kolekcji.

## Co wyróżnia Dziedzictwo?

Jedna pętla łączy autentyczne polskie malarstwo, kreatywne kolorowanie, opowieść i trwałą nagrodę w postaci rozwijającego się wnętrza. Dekoracje również mają ciekawostki związane z epoką. Inspiracje to przystępność nauki Duolingo, mechanika kolorowania Pixel Art i rozwój przestrzeni znany z Garden Keeper.

## Gotowy prototyp i dalszy rozwój

Prototyp obejmuje 83 dzieła, cztery pokoje epok, 47 dekoracji, wyszukiwanie i filtry biblioteki oraz powiększanie i przesuwanie planszy. Interfejs obsługuje PL/EN; opisy dzieł są obecnie po polsku.

Następny krok to testy z użytkownikami: ukończenie pierwszego obrazu, chęć powrotu i zapamiętanie ciekawostki. Planujemy tłumaczenia treści oraz pilotaże ze szkołami i muzeami; kolekcje tematyczne mogą stać się ofertą dla instytucji kultury.

## Tech stack i realizacja

Next.js 16 i React 19 • TypeScript • Tailwind CSS 4 • Zustand + localStorage • SVG • Framer Motion / Motion • dane JSON • eksport statyczny. Plansze i palety przygotowuje algorytm zespołu; jakość kodu wspierają Vitest i Playwright.

Ilustracje: aktualne ekrany aplikacji. Pierwszy i ostatni pokazują ten sam pokój Romantyzmu na poziomach 0/9 i 9/9.
