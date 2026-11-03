# 18. Metryki Dziedzictwa

Stan: 3 listopada 2026. Wybrano Vercel Web Analytics, domyślne ustawienie statystyk z możliwością wyłączenia. Użytkownik zdecydował pozostawić **gotowy kod do późniejszej aktywacji**. Bez konfiguracji aplikacja niczego nie wysyła i nie pobiera skryptu dostawcy.

## Aktywacja przez właściciela projektu

1. Włączyć Web Analytics w projekcie Vercel. [Zdarzenia niestandardowe wymagają Pro lub Enterprise](https://vercel.com/docs/analytics/custom-events); w tej pracy nie zmieniano planu ani ustawień konta.
2. Ustawić `NEXT_PUBLIC_ANALYTICS_PROVIDER=vercel` oraz niepuste `NEXT_PUBLIC_ANALYTICS_SITE=dziedzictwo`, potem zbudować i wdrożyć nową wersję. SITE jest publiczną nazwą konfiguracji, nie identyfikatorem gracza.
3. Sprawdzić w panelu zdarzenia z kontrolowanej sesji i możliwość wyłączenia. Nie włączać konfiguracji przed gotowością projektu i informacji o prywatności.

Skrypt jest ładowany dopiero po hydratacji preferencji i tylko przy aktywnej konfiguracji, w produkcji i online. Tryby dev/test są domyślnie no-op. Lokalny test przeglądarkowy jawnie włącza adapter tylko na localhost/127.0.0.1 i przechwytuje obie trasy dostawcy; dane nie opuszczają serwera testowego.

## Dane i ograniczenia prywatności

Wysyłamy wyłącznie nazwy zdarzeń oraz dozwolone enumy i flagi. Warstwa `safeAnalyticsProps` odrzuca dodatkowe pola, dowolny tekst, surowe czasy i nieznane wartości. `beforeSend` usuwa query i hash z URL oraz blokuje zdarzenia po wyłączeniu statystyk. Imię z certyfikatu, odpowiedzi, wyszukiwanie, identyfikator instalacji i bitsety nie są właściwościami zdarzeń. Pierwsza data gry oraz data ostatniego app_open są wyłącznie w lokalnym zapisie.

Vercel przetwarza także metadane połączenia według [własnej polityki prywatności](https://vercel.com/docs/analytics/privacy-policy); gra nie deklaruje braku wszelkich metadanych po stronie dostawcy ani zgodności prawnej na podstawie samego braku cookies. Usługa nie używa ciasteczek do analityki. Ustawienie można wyłączyć w grze. Kod nie ładuje skryptu, gdy ustawienie jest wyłączone na wejściu; middleware anuluje kolejne zdarzenia po późniejszym wyłączeniu.

## Zdarzenia

| Zdarzenie | Właściwości | Moment |
| --- | --- | --- |
| app_open | returning: first / d1 / d2_6 / d7_plus | Raz na lokalny dzień po odczycie zapisu, również po powrocie do karty; po sukcesie kolejki zapisywana lokalna data |
| tutorial_complete | seconds_bucket | Pierwsze ukończenie dzieła; czas od lokalnego firstPlayedAt, z przerwami |
| painting_open | era, daily | Otwarcie pracowni |
| painting_complete | era, cells_bucket, minutes_bucket, daily | Potwierdzenie odsłonięcia; także powtórki |
| painting_abandon | era, percent_bucket | Zamknięcie pracowni przed 100%, także nieudane ładowanie |
| era_unlock / era_complete | era | Rzeczywiste przejście progu / ukończenie epoki; nie od kliknięcia okna |
| badge_earned | badge | Nowa odznaka wyliczona z różnicy ukończeń |
| share | kind: card/certificate, method: share/download | Udane udostępnienie albo uruchomione pobranie; bez imienia i nazwy pliku |
| pwa_installed | brak | Zdarzenie appinstalled przeglądarki |
| offline_session | brak | Powrót online w tej samej otwartej karcie po okresie offline |

`daily=true` oznacza wybrane dzieło aktualnego dnia, niezależnie od ścieżki wejścia; nie jest pomiarem kliknięć samej karty. `era` to era-1…era-4, `badge` pochodzi z jawnych definicji. Kategorie returning liczą lokalne dni kalendarzowe, a nie kolejne odcinki 24 godzin.

| Pole | Przedziały |
| --- | --- |
| seconds_bucket | under_60, 60_179, 180_299, 300_plus |
| minutes_bucket | under_1, 1_3, 3_5, 5_10, 10_plus |
| cells_bucket | under_500, 500_999, 1000_plus |
| percent_bucket | 0_24, 25_49, 50_74, 75_99 |

## Definicje metryk i cele

| Miara | Cel | Sposób liczenia |
| --- | --- | --- |
| Ukończenie pierwszej planszy | ≥70% | tutorial_complete / app_open z returning=first w tej samej kohorcie startowej. Do pilotażu używać świeżych profili; wznowione lub starsze zapisy opisywać oddzielnie |
| Czas do pierwszej nagrody | <5 min | Udział tutorial_complete w pierwszych trzech przedziałach sekund. Mediana poniżej 5 min, jeśli ponad połowa ukończeń jest w tych przedziałach; brak pozornej dokładności w sekundach |
| Powrót D1 | ≥25% | Przybliżenie agregatowe: app_open(returning=d1) w dniu T / app_open(returning=first) w T−1. Raz dziennie na zapis, bez globalnego identyfikatora osoby |
| Powroty starsze | opisowo | d2_6 i d7_plus osobno. d7_plus **nie pozwala wyliczyć dokładnego D7**; do tego potrzebny osobny uzgodniony pomiar lub badanie kohortowe |
| Porzucenie planszy | obserwacja | painting_abandon / painting_open w oknie badania, rozbicie po epoce i przedziale procentu. Wznowienia i powtórki interpretować oddzielnie |
| Korzystanie z obrazu dnia | obserwacja | painting_open/complete z daily=true. Nie utożsamiać z CTR karty |
| Udział udostępnień | obserwacja | share(kind=card) / painting_complete; share nie dowodzi, że odbiorca otworzył plik |
| Instalacja i offline | obserwacja | Liczby pwa_installed i offline_session. Safari nie gwarantuje appinstalled; zamknięta offline karta może nie dosłać zdarzenia |
| Zapamiętana ciekawostka po tygodniu | ≥50% | Quiz zespołu: osoby przypominające co najmniej jeden zweryfikowany fakt / osoby, które odpowiedziały. Osobno frekwencja quizu |
| Lighthouse mobile / pierwsze ładowanie | ≥90 Performance, ≥95 Accessibility; <1,5 MB | Powtarzalny pomiar eksportu; raport B7 odróżnia zasoby pierwszej sceny od pobierania cache PWA w tle |

Bez identyfikatorów nie łączymy dowolnych zdarzeń konkretnej osoby między dniami. Włączenie statystyk dopiero po pierwszym dniu, wyczyszczenie zapisu, nowe urządzenie, błędny zegar i migracja istniejących graczy zniekształcają kohorty. firstPlayedAt dla starszego zapisu jest pierwszą obserwacją tej wersji, nie odtworzoną datą historyczną. Reset postępu pozwala ponownie ukończyć samouczek, więc mianowniki nie są ścisłym licznikiem ludzi. Zdarzenia malowania offline nie są trwale kolejkowane; nie należy traktować braku zdarzeń jako braku gry.

Raportować okres, liczby bezwzględne, mianowniki, przedziały i ograniczenia. Przy próbie 5–8 osób głównym źródłem oceny pierwszej sesji są obserwacje zespołu, nie pozorna precyzja procentów analityki.
