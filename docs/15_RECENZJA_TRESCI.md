# 15. Recenzja treści kolekcji

> Stan na 3 listopada 2026 (koniec Fazy 2). Źródło prawdy: `content/artworks.json`. Ten dokument jest listą roboczą dla recenzenta (najlepiej nauczyciela historii lub plastyki albo studenta historii sztuki) i dla zespołu.

## Jak recenzować jedno dzieło

1. Porównaj reprodukcję (`img/<image>`) ze stroną źródła. Tytuł, autor i rok mają się zgadzać z katalogiem muzeum (Cyfrowe MNW, MNK, Polona) lub z opisem pliku w Commons.
2. Sprawdź przypisanie do epoki. Dla malarstwa historycznego liczy się epoka powstania obrazu; temat może dotyczyć innej epoki.
3. Sprawdź fakty w `story.pl` i `curiosity.pl`. Każde twierdzenie, które nie wynika z obrazu, powinno mieć potwierdzenie w źródle (katalog muzeum, opracowanie). Anegdoty oznaczaj jako legendy albo usuwaj.
4. Sprawdź szkic EN (`*.en`): wierność treści, nazwy własne, tytuły przyjęte w literaturze angielskiej.
5. Poprawki wpisuj do manifestu w obu językach naraz. Po akceptacji ustaw `review.content: "verified"` i po korekcie EN `review.translation: "reviewed"`. `npm run content:validate` pilnuje spójności.

Nie zmieniaj `id`, `legacyIds` ani ścieżek: od nich zależą zapisy graczy.

## Uwagi do sprawdzenia w pierwszej kolejności

1. **`brandt-czarniecki-koldynga`:** opis mówi o „polskiej jeździe szesnastowiecznej” („Brawura polskiej jazdy szesnastowiecznej…”), a przeprawa pod Koldyngą miała miejsce w 1658 r. (XVII w.). Ten sam błąd jest w szkicu EN („sixteenth-century”).
2. **`bacciarelli-portret-doktora-walentego-gagatkiewicza`:** brak dopasowania w Commons. Stara nazwa pliku `17_bacciarelli_akademia_krakowska.jpg` nie pasuje do tytułu, a ciekawostka mówi o portrecie odnalezionym na aukcji w Paryżu. Porównaj obraz z tytułem i znajdź źródło.
3. **Źródła bez dopasowania (13 dzieł):** skrypt `tools/pixel-engine/src/content_sources.py` nie znalazł w Commons pliku o zgodnym obrazie. Dla każdego trzeba znaleźć źródło ręcznie (muzeum, Polona, Commons z inną nazwą) i dopiero po ręcznym porównaniu wpisać `source` z `match: "title"` (z notatką poniżej) albo uruchomić skrypt z innym zapytaniem:
   - `bacciarelli-portret-doktora-walentego-gagatkiewicza`
   - `norblin-swieto-bielanach`
   - `norblin-sejmik-szlachecki-kosciele`
   - `norblin-wieszanie-zdrajcow-rynku-starego`
   - `norblin-starcie-kosynierow-wojskami-rosyjskimi`
   - `vogel-lazienki-krolewskie-palac-wyspie`
   - `michalowski-starzec-siedzacy-stopniach`
   - `zaleski-widok-placu-teatralnego-warszawie`
   - `suchodolski-bitwa-raszynem-1809`
   - `grottger-bitwa`
   - `suchodolski-smierc-ksiecia-jozefa-poniatowskiego`
   - `gierymski-wiosna-malym-miasteczku`
   - `wyspianski-portret-lizy-parenskiej-wsrod`
4. **Licencje:** 69 dopasowanych reprodukcji jest w domenie publicznej. `wyczolkowski-gra-krokieta` pochodzi z pliku na CC BY-SA 3.0; gra podaje autora zdjęcia („fot. Zorro2212”) i licencję w karcie obrazu i w bibliotece. Jeśli zespół woli źródło w domenie publicznej, warto poszukać innej reprodukcji (np. w zbiorach muzeum).
5. **Wyjaśnione, bez działań:** `norblin-wybor-piasta-krola` (stara nazwa `21_norblin_kawiarnia.jpg`) i `bellotto-widok-warszawy-tarasu-zamku` (stara nazwa `08_canaletto_kosciol_sakramentek.jpg`) mają poprawne tytuły, co potwierdza dopasowanie obrazu do plików Commons z MNK i MNW.
6. **Ciekawostki o charakterze anegdoty**, które warto potwierdzić albo oznaczyć jako legendę, np. złote podkowy posła Ossolińskiego, prośba Chopina o przewiezienie serca, słowa księcia Józefa przed śmiercią w Elsterze, zazdrość Teodory Matejkowej o modelki.

## Wszystkie dzieła

Kolumna „treść” to `review.content`, kolumna „EN” to `review.translation`.

| Nr | ID | Tytuł | Autor, rok | Źródło | Licencja | Treść | EN |
| --- | --- | --- | --- | --- | --- | --- | --- |
| I.01 | `bellotto-widok-warszawy-strony-pragi` | Widok Warszawy od strony Pragi | Bernardo Bellotto (Canaletto), 1770 | [Commons](https://commons.wikimedia.org/wiki/File:Bellotto_View_of_Warsaw_from_Praga.jpg) | Public domain | unverified | draft |
| I.02 | `bellotto-krakowskie-przedmiescie-strone-placu` | Krakowskie Przedmieście w stronę Placu Zamkowego | Bernardo Bellotto (Canaletto), 1767–1768 | [Commons](https://commons.wikimedia.org/wiki/File:Bellotto_Cracow_Suburb_leading_to_the_Castle_Square_(detail).jpg) | Public domain | unverified | draft |
| I.03 | `bellotto-krakowskie-przedmiescie-kolumny-zygmunta` | Krakowskie Przedmieście od Kolumny Zygmunta | Bernardo Bellotto (Canaletto), 1768 | [Commons](https://commons.wikimedia.org/wiki/File:Bellotto_Cracow_Suburb_as_seen_from_the_Cracow_Gate.jpg) | Public domain | unverified | draft |
| I.04 | `bellotto-plac-krasinskich-palacem-rzeczypospolitej` | Plac Krasińskich z Pałacem Rzeczypospolitej | Bernardo Bellotto (Canaletto), 1778 | [Commons](https://commons.wikimedia.org/wiki/File:Bellotto_Krasi%C5%84ski_Square.jpg) | Public domain | unverified | draft |
| I.05 | `bellotto-kosciol-wizytek-warszawie` | Kościół Wizytek w Warszawie | Bernardo Bellotto (Canaletto), 1777 | [Commons](https://commons.wikimedia.org/wiki/File:Bellotto_Visitationist_Church_in_Warsaw.jpg) | Public domain | unverified | draft |
| I.06 | `bellotto-widok-warszawy-tarasu-zamku` | Widok Warszawy z tarasu Zamku Królewskiego | Bernardo Bellotto (Canaletto), 1773 | [Commons](https://commons.wikimedia.org/wiki/File:Bernardo_Bellotto_-_View_of_Warsaw_from_the_Terrace_of_the_Royal_Castle_-_MP_228_-_National_Museum_in_Warsaw.jpg) | Public domain | unverified | draft |
| I.07 | `bellotto-wjazd-jerzego-ossolinskiego-rzymu` | Wjazd Jerzego Ossolińskiego do Rzymu w 1633 r. | Bernardo Bellotto (Canaletto), 1779 | [Commons](https://commons.wikimedia.org/wiki/File:Bellotto_Entry_of_Jerzy_Ossoli%C5%84ski_into_Rome_in_1633.png) | Public domain | unverified | draft |
| I.08 | `bacciarelli-portret-stanislawa-augusta-stroju` | Portret Stanisława Augusta w stroju koronacyjnym | Marcello Bacciarelli, 1768–1771 | [Commons](https://commons.wikimedia.org/wiki/File:Marceli_Bacciarelli_-_Portret_Stanis%C5%82awa_Augusta_Poniatowskiego_w_stroju_koronacyjnym.jpg) | Public domain | unverified | draft |
| I.09 | `bacciarelli-portret-stanislawa-augusta-poniatowskiego` | Portret Stanisława Augusta Poniatowskiego z klepsydrą | Marcello Bacciarelli, 1793 | [Commons](https://commons.wikimedia.org/wiki/File:Marcello_Bacciarelli_-_Portrait_of_Stanis%C5%82aw_August_Poniatowski_with_hourglass_-_MP_3043_MNW_-_National_Museum_in_Warsaw.jpg) | Public domain | unverified | draft |
| I.10 | `bacciarelli-portret-izabeli-czartoryskich-lubomirskiej` | Portret Izabeli z Czartoryskich Lubomirskiej z pieskiem | Marcello Bacciarelli, ok. 1775–1780 | [Commons](https://commons.wikimedia.org/wiki/File:Marcello_Bacciarelli_-_Portret_ksi%C4%99%C5%BCnej_Izabeli_Lubomirskiej_1757.jpg) | Public domain | unverified | draft |
| I.11 | `bacciarelli-portret-ksiecia-jozefa-poniatowskiego` | Portret księcia Józefa Poniatowskiego w mundurze | Marcello Bacciarelli, ok. 1790 | [Commons](https://commons.wikimedia.org/wiki/File:Marcello_Bacciarelli_-_Portrait_of_Prince_J%C3%B3zef_Poniatowski_-_184493_MNW_-_National_Museum_in_Warsaw.jpg) | Public domain | unverified | draft |
| I.12 | `bacciarelli-portret-doktora-walentego-gagatkiewicza` | Portret doktora Walentego Gagatkiewicza | Marcello Bacciarelli, ok. 1790 | **brak** | — | unverified | draft |
| I.13 | `norblin-swieto-bielanach` | Święto na Bielanach | Jan Piotr Norblin, ok. 1785 | **brak** | — | unverified | draft |
| I.14 | `norblin-targ-pradze-warszawa` | Targ na Pradze pod Warszawą | Jan Piotr Norblin, ok. 1785–1790 | [Commons](https://commons.wikimedia.org/wiki/File:Jean-Pierre_Norblin_-_Kr%C3%B3lewska_Street_horse_market.jpg) | Public domain | unverified | draft |
| I.15 | `norblin-wybor-piasta-krola` | Wybór Piasta na króla (Pierwszy Piast) | Jan Piotr Norblin, ok. 1790 | [Commons](https://commons.wikimedia.org/wiki/File:Jan_Piotr_Norblin_-_Piast_Being_Elected_as_the_King_-_MNK_XII-445_-_National_Museum_in_Krak%C3%B3w.jpg) | Public domain | unverified | draft |
| I.16 | `norblin-sejmik-szlachecki-kosciele` | Sejmik szlachecki w kościele | Jan Piotr Norblin, ok. 1790 | **brak** | — | unverified | draft |
| I.17 | `norblin-wieszanie-zdrajcow-rynku-starego` | Wieszanie zdrajców na Rynku Starego Miasta (9 maja 1794) | Jan Piotr Norblin, 1794 | **brak** | — | unverified | draft |
| I.18 | `norblin-starcie-kosynierow-wojskami-rosyjskimi` | Starcie kosynierów z wojskami rosyjskimi (Racławice) | Jan Piotr Norblin, 1794 | **brak** | — | unverified | draft |
| I.19 | `smuglewicz-przysiega-tadeusza-kosciuszki-rynku` | Przysięga Tadeusza Kościuszki na Rynku w Krakowie | Franciszek Smuglewicz, 1797 | [Commons](https://commons.wikimedia.org/wiki/File:Smuglewicz_Kosciuszko_2.jpg) | Public domain | unverified | draft |
| I.20 | `smuglewicz-portret-rodziny-prozorow` | Portret rodziny Prozorów | Franciszek Smuglewicz, 1789 | [Commons](https://commons.wikimedia.org/wiki/File:Smuglewicz_Prozor_Family.jpg) | Public domain | unverified | draft |
| I.21 | `vogel-lazienki-krolewskie-palac-wyspie` | Łazienki Królewskie: Pałac Na Wyspie | Zygmunt Vogel, 1790 | **brak** | — | unverified | draft |
| II.01 | `grottger-pozegnanie-powstanca` | Pożegnanie powstańca (z cyklu Polonia) | Artur Grottger, 1866 | [Commons](https://commons.wikimedia.org/wiki/File:Powitanie_powstanca.jpg) | Public domain | unverified | draft |
| II.02 | `wankowicz-portret-adama-mickiewicza-judahu` | Portret Adama Mickiewicza na Judahu skale | Walenty Wańkowicz, 1827–1828 | [Commons](https://commons.wikimedia.org/wiki/File:Wa%C5%84kowicz_Adam_Mickiewicz.jpg) | Public domain | unverified | draft |
| II.03 | `michalowski-szarza-wawozie-somosierra` | Szarża w wąwozie Somosierra | Piotr Michałowski, ok. 1837 | [Commons](https://commons.wikimedia.org/wiki/File:Battle_of_Somosierra_by_Piotr_Micha%C5%82owski.PNG) | Public domain | unverified | draft |
| II.04 | `michalowski-senko` | Seńko (Portret chłopa w kapeluszu) | Piotr Michałowski, ok. 1846 | [Commons](https://commons.wikimedia.org/wiki/File:Piotr_Micha%C5%82owski_-_Se%C5%84ko_-_MNK_II-a-734_-_National_Museum_Krak%C3%B3w.jpg) | Public domain | unverified | draft |
| II.05 | `michalowski-starzec-siedzacy-stopniach` | Starzec siedzący na stopniach | Piotr Michałowski, ok. 1840 | **brak** | — | unverified | draft |
| II.06 | `zaleski-wziecie-arsenalu-nocy-29` | Wzięcie Arsenału w nocy 29 listopada 1830 r. | Marcin Zaleski, 1831 | [Commons](https://commons.wikimedia.org/wiki/File:Marcin_Zaleski,_Wzi%C4%99cie_Arsena%C5%82u.jpg) | Public domain | unverified | draft |
| II.07 | `zaleski-widok-placu-teatralnego-warszawie` | Widok Placu Teatralnego w Warszawie | Marcin Zaleski, 1838 | **brak** | — | unverified | draft |
| II.08 | `suchodolski-bitwa-raszynem-1809` | Bitwa pod Raszynem 1809 | January Suchodolski, 1855 | **brak** | — | unverified | draft |
| II.09 | `grassi-portret-ksiecia-jozefa-poniatowskiego` | Portret księcia Józefa Poniatowskiego | Josef Grassi, po 1810 | [Commons](https://commons.wikimedia.org/wiki/File:Grassi_Prince_J%C3%B3zef_Poniatowski.jpg) | Public domain | unverified | draft |
| II.10 | `suchodolski-obrona-jasnej-gory-przed` | Obrona Jasnej Góry przed Szwedami | January Suchodolski, 1845 | [Commons](https://commons.wikimedia.org/wiki/File:Jasna_G%C3%B3ra_1655.jpg) | Public domain | unverified | draft |
| II.11 | `rodakowski-portret-generala-henryka-dembinskiego` | Portret generała Henryka Dembińskiego | Henryk Rodakowski, 1852 | [Commons](https://commons.wikimedia.org/wiki/File:RodakowskiHenryk.PortretGeneralaHenrykaDembinskiego.1852.jpg) | Public domain | unverified | draft |
| II.12 | `simmler-smierc-barbary-radziwillowny` | Śmierć Barbary Radziwiłłówny | Józef Simmler, 1860 | [Commons](https://commons.wikimedia.org/wiki/File:Simmler_Death_of_Barbara_Radziwi%C5%82%C5%82.jpg) | Public domain | unverified | draft |
| II.13 | `grottger-kucie-kos` | Kucie kos (cykl Polonia) | Artur Grottger, 1863 | [Commons](https://commons.wikimedia.org/wiki/File:Kucie_kos_(5579011).jpg) | Public domain | unverified | draft |
| II.14 | `matejko-stanczyk-czasie-balu-dworze` | Stańczyk w czasie balu na dworze królowej Bony | Jan Matejko, 1862 | [Commons](https://commons.wikimedia.org/wiki/File:Jan_Matejko,_Sta%C5%84czyk.jpg) | Public domain | unverified | draft |
| II.15 | `grottger-saskim-ogrodzie` | W saskim ogrodzie (Żałoba narodowa) | Artur Grottger, 1863 | [Commons](https://commons.wikimedia.org/wiki/File:Artur_Grottger,_W_Saskim_Ogrodzie.jpg) | Public domain | unverified | draft |
| II.16 | `grottger-bitwa` | Bitwa (z cyklu Lithuania) | Artur Grottger, 1864 | **brak** | — | unverified | draft |
| II.17 | `kwiatkowski-ostatnie-chwile-fryderyka-chopina` | Ostatnie chwile Fryderyka Chopina | Teofil Kwiatkowski, 1849–1850 | [Commons](https://commons.wikimedia.org/wiki/File:Teofil_Kwiatkowski_-_Ostatnie_chwile_Chopina.jpg) | Public domain | unverified | draft |
| II.18 | `suchodolski-smierc-ksiecia-jozefa-poniatowskiego` | Śmierć księcia Józefa Poniatowskiego w Elsterze | January Suchodolski, 1840 | **brak** | — | unverified | draft |
| III.01 | `matejko-rejtan-upadek-polski` | Rejtan – Upadek Polski | Jan Matejko, 1866 | [Commons](https://commons.wikimedia.org/wiki/File:Jan_Matejko_-_Upadek_Polski_(Reytan).jpg) | Public domain | unverified | draft |
| III.02 | `matejko-unia-lubelska` | Unia Lubelska | Jan Matejko, 1869 | [Commons](https://commons.wikimedia.org/wiki/File:Lublin_Union_1569.PNG) | Public domain | unverified | draft |
| III.03 | `matejko-astronom-kopernik-czyli-rozmowa` | Astronom Kopernik, czyli rozmowa z Bogiem | Jan Matejko, 1873 | [Commons](https://commons.wikimedia.org/wiki/File:Jan_Matejko-Astronomer_Copernicus-Conversation_with_God.jpg) | Public domain | unverified | draft |
| III.04 | `matejko-zawieszenie-dzwonu-zygmunta` | Zawieszenie dzwonu Zygmunta | Jan Matejko, 1874 | [Commons](https://commons.wikimedia.org/wiki/File:Jan_Matejko,_Zawieszenie_dzwonu_Zygmunta_na_wie%C5%BCy_katedry_w_Krakowie_w_1521_roku.jpg) | Public domain | unverified | draft |
| III.05 | `matejko-bitwa-grunwaldem` | Bitwa pod Grunwaldem | Jan Matejko, 1878 | [Commons](https://commons.wikimedia.org/wiki/File:Jan_Matejko,_Bitwa_pod_Grunwaldem.jpg) | Public domain | unverified | draft |
| III.06 | `matejko-portret-zony-artysty-sukni` | Portret żony artysty w sukni ślubnej | Jan Matejko, 1879 | [Commons](https://commons.wikimedia.org/wiki/File:Matejko_Teodora_Giebu%C5%82towska.jpg) | Public domain | unverified | draft |
| III.07 | `matejko-hold-pruski` | Hołd pruski | Jan Matejko, 1882 | [Commons](https://commons.wikimedia.org/wiki/File:Prussian_Homage.jpg) | Public domain | unverified | draft |
| III.08 | `gierymski-patrol-powstanczy` | Patrol powstańczy (Pikieta) | Maksymilian Gierymski, 1872 | [Commons](https://commons.wikimedia.org/wiki/File:Maksymilian_Gierymski_-_Insurgent_patrol_-_MP_418_-_National_Museum_in_Warsaw.jpg) | Public domain | unverified | draft |
| III.09 | `gierymski-wiosna-malym-miasteczku` | Wiosna w małym miasteczku | Maksymilian Gierymski, 1872 | **brak** | — | unverified | draft |
| III.10 | `gierymski-zydowka-pomaranczami` | Żydówka z pomarańczami (Pomarańczarka) | Aleksander Gierymski, 1881 | [Commons](https://commons.wikimedia.org/wiki/File:Aleksander_Gierymski,_%C5%BByd%C3%B3wka_z_pomara%C5%84czami.jpg) | Public domain | unverified | draft |
| III.11 | `gierymski-altanie` | W altanie | Aleksander Gierymski, 1882 | [Commons](https://commons.wikimedia.org/wiki/File:Gierymski_In_the_arbour.png) | Public domain | unverified | draft |
| III.12 | `gierymski-swieto-trabek` | Święto Trąbek I | Aleksander Gierymski, 1884 | [Commons](https://commons.wikimedia.org/wiki/File:Aleksander_Gierymski_-_Feast_of_Trumpets_I_-_MP_124_-_National_Museum_in_Warsaw.jpg) | Public domain | unverified | draft |
| III.13 | `gierymski-piaskarze` | Piaskarze | Aleksander Gierymski, 1887 | [Commons](https://commons.wikimedia.org/wiki/File:Aleksander_Gierymski,_Piaskarze.jpg) | Public domain | unverified | draft |
| III.14 | `chelmonski-babie-lato` | Babie lato | Józef Chełmoński, 1875 | [Commons](https://commons.wikimedia.org/wiki/File:J%C3%B3zef_Che%C5%82mo%C5%84ski_-_Indian_summer_-_Google_Art_Project.jpg) | Public domain | unverified | draft |
| III.15 | `chelmonski-sprawa-u-wojta` | Sprawa u wójta | Józef Chełmoński, 1873 | [Commons](https://commons.wikimedia.org/wiki/File:Sprawa_u_w%C3%B3jta.jpg) | Public domain | unverified | draft |
| III.16 | `chelmonski-czworka` | Czwórka | Józef Chełmoński, 1881 | [Commons](https://commons.wikimedia.org/wiki/File:J_Che%C5%82mo%C5%84ski_-_Czw%C3%B3rka_(1881).jpg) | Public domain | unverified | draft |
| III.17 | `chelmonski-krzyz-zadymce` | Krzyż w zadymce | Józef Chełmoński, 1888 | [Commons](https://commons.wikimedia.org/wiki/File:J%C3%B3zef_Che%C5%82mo%C5%84ski_-_Krzy%C5%BC_w_zadymce_(1907).jpg) | Public domain | unverified | draft |
| III.18 | `brandt-czarniecki-koldynga` | Czarniecki pod Koldyngą | Józef Brandt, 1870 | [Commons](https://commons.wikimedia.org/wiki/File:J%C3%B3zef_Brandt,_Czarniecki_pod_Koldyng%C4%85.jpg) | Public domain | unverified | draft |
| III.19 | `brandt-wyjazd-wilanowa-jana-iii` | Wyjazd z Wilanowa Jana III i Marysieńki Sobieskich | Józef Brandt, 1887 | [Commons](https://commons.wikimedia.org/wiki/File:J%C3%B3zef_Brandt_-_Wyjazd_Marysie%C5%84ki_z_Wilanowa.jpg) | Public domain | unverified | draft |
| III.20 | `siemiradzki-pochodnie-nerona` | Pochodnie Nerona (Świeczniki chrześcijaństwa) | Henryk Siemiradzki, 1876 | [Commons](https://commons.wikimedia.org/wiki/File:Siemiradski_Fackeln.jpg) | Public domain | unverified | draft |
| III.21 | `gottlieb-zydzi-modlacy-sie-synagodze` | Żydzi modlący się w synagodze podczas Jom Kippur | Maurycy Gottlieb, 1878 | [Commons](https://commons.wikimedia.org/wiki/File:Jews_Praying_in_the_Synagogue_on_Yom_Kippur.jpg) | Public domain | unverified | draft |
| III.22 | `gottlieb-pisarz-tory` | Pisarz Tory | Maurycy Gottlieb, 1876 | [Commons](https://commons.wikimedia.org/wiki/File:Maurycy_Gottlieb_-_Torah_Scribe.jpg) | Public domain | unverified | draft |
| IV.01 | `boznanska-pracowni` | W pracowni | Olga Boznańska, 1890 | [Commons](https://commons.wikimedia.org/wiki/File:Olga_Bozna%C5%84ska_1890_W_pracowni_2.jpg) | Public domain | unverified | draft |
| IV.02 | `boznanska-dziewczynka-chryzantemami` | Dziewczynka z chryzantemami | Olga Boznańska, 1894 | [Commons](https://commons.wikimedia.org/wiki/File:Olga_Bozna%C5%84ska_-_Girl_with_Chrysanthemums_-_MNK_II-b-1032_-_National_Museum_Krak%C3%B3w.jpg) | Public domain | unverified | draft |
| IV.03 | `boznanska-portret-malarza-paula-nauena` | Portret malarza Paula Nauena | Olga Boznańska, 1893 | [Commons](https://commons.wikimedia.org/wiki/File:Olga_Bozna%C5%84ska_1893_Paul_Neuen.jpg) | Public domain | unverified | draft |
| IV.04 | `podkowinski-dzieci-ogrodzie` | Dzieci w ogrodzie | Władysław Podkowiński, 1892 | [Commons](https://commons.wikimedia.org/wiki/File:Podkowi%C5%84ski_Children_in_the_garden.jpg) | Public domain | unverified | draft |
| IV.05 | `podkowinski-szal-uniesien` | Szał uniesień | Władysław Podkowiński, 1894 | [Commons](https://commons.wikimedia.org/wiki/File:W%C5%82adys%C5%82aw_Podkowi%C5%84ski_-_Sza%C5%82_uniesie%C5%84.jpg) | Public domain | unverified | draft |
| IV.06 | `malczewski-tumanie` | W tumanie | Jacek Malczewski, 1893 | [Commons](https://commons.wikimedia.org/wiki/File:Malczewski_Jacek_W_tumanie.jpg) | Public domain | unverified | draft |
| IV.07 | `malczewski-melancholia` | Melancholia | Jacek Malczewski, 1894 | [Commons](https://commons.wikimedia.org/wiki/File:Malczewski_melancholia.jpg) | Public domain | unverified | draft |
| IV.08 | `malczewski-bledne-kolo` | Błędne koło | Jacek Malczewski, 1897 | [Commons](https://commons.wikimedia.org/wiki/File:Bledne_kolo.jpg) | Public domain | unverified | draft |
| IV.09 | `malczewski-thanatos` | Thanatos | Jacek Malczewski, 1898–1899 | [Commons](https://commons.wikimedia.org/wiki/File:Jacek_Malczewski_-_Thanatos.jpg) | Public domain | unverified | draft |
| IV.10 | `malczewski-zatruta-studnia` | Zatruta studnia I | Jacek Malczewski, 1905 | [Commons](https://commons.wikimedia.org/wiki/File:Malczewski_Jacek_Zatruta_studnia_I.jpg) | Public domain | unverified | draft |
| IV.11 | `malczewski-autoportret-muza` | Autoportret z Muzą | Jacek Malczewski, 1906 | [Commons](https://commons.wikimedia.org/wiki/File:Malczewski_Jacek_Autoportret_z_muza_1.jpg) | Public domain | unverified | draft |
| IV.12 | `wyspianski-chocholy` | Chochoły (Planty o świcie) | Stanisław Wyspiański, 1898 | [Commons](https://commons.wikimedia.org/wiki/File:Stanis%C5%82aw_Wyspia%C5%84ski_-_The_Mulchs_-_Google_Art_Project.jpg) | Public domain | unverified | draft |
| IV.13 | `wyspianski-autoportret-zona` | Autoportret z żoną | Stanisław Wyspiański, 1904 | [Commons](https://commons.wikimedia.org/wiki/File:Portret_z_zona.jpg) | Public domain | unverified | draft |
| IV.14 | `wyspianski-spiacy-stas` | Śpiący Staś | Stanisław Wyspiański, 1904 | [Commons](https://commons.wikimedia.org/wiki/File:Stanis%C5%82aw_Wyspia%C5%84ski_%C5%9Api%C4%85cy_Sta%C5%9B_1902.jpg) | Public domain | unverified | draft |
| IV.15 | `wyspianski-portret-lizy-parenskiej-wsrod` | Portret Lizy Pareńskiej wśród pelargonii | Stanisław Wyspiański, 1904 | **brak** | — | unverified | draft |
| IV.16 | `wyspianski-macierzynstwo` | Macierzyństwo | Stanisław Wyspiański, 1905 | [Commons](https://commons.wikimedia.org/wiki/File:Macierzynstwo_1905.jpg) | Public domain | unverified | draft |
| IV.17 | `chelmonski-kuropatwy-sniegu` | Kuropatwy na śniegu | Józef Chełmoński, 1891 | [Commons](https://commons.wikimedia.org/wiki/File:J%C3%B3zef_Che%C5%82mo%C5%84ski_-_Partridges_-_MP_424_MNW_-_National_Museum_in_Warsaw.jpg) | Public domain | unverified | draft |
| IV.18 | `chelmonski-bociany` | Bociany | Józef Chełmoński, 1900 | [Commons](https://commons.wikimedia.org/wiki/File:J%C3%B3zef_Che%C5%82mo%C5%84ski_-_Bociany_-_01_(MP_561_MNW).jpg) | Public domain | unverified | draft |
| IV.19 | `mehoffer-dziwny-ogrod` | Dziwny ogród | Józef Mehoffer, 1903 | [Commons](https://commons.wikimedia.org/wiki/File:Mehoffer_Strange_garden.jpg) | Public domain | unverified | draft |
| IV.20 | `mehoffer-slonce-majowe` | Słońce majowe | Józef Mehoffer, 1911 | [Commons](https://commons.wikimedia.org/wiki/File:J%C3%B3zef_Mehoffer_-_S%C5%82o%C5%84ce_majowe.jpg) | Public domain | unverified | draft |
| IV.21 | `wyczolkowski-kopanie-burakow` | Kopanie buraków | Leon Wyczółkowski, 1893 | [Commons](https://commons.wikimedia.org/wiki/File:Leon_Wycz%C3%B3%C5%82kowski_-_Kopanie_burak%C3%B3w.jpg) | Public domain | unverified | draft |
| IV.22 | `wyczolkowski-gra-krokieta` | Gra w krokieta | Leon Wyczółkowski, 1895 | [Commons](https://commons.wikimedia.org/wiki/File:Leon_Wycz%C3%B3%C5%82kowski_%27Gra_w_krokieta%27.jpg) | CC BY-SA 3.0, fot. Zorro2212 | unverified | draft |

## Uzupełnienie A9 (3 listopada 2026)

- Ponowne wyszukiwanie zachowuje warunek zgodnego hasha reprodukcji, uwzględnia także tytuły EN i warianty nazwisk. Sama zgodność tytułu nie upoważnia do dopisania źródła.
- Ręcznie obejrzano portret opisany jako Gagatkiewicz: popiersie mężczyzny w ciemnym surducie, z białym żabotem, owalna kompozycja. Sam wygląd nie potwierdza tożsamości modela. Stara nazwa pliku nie jest dowodem błędu. Brak zmiany tytułu i statusu.
- **Propozycja dla recenzenta:** w opisie `brandt-czarniecki-koldynga` zastąpić „szesnastowiecznej” przez „siedemnastowiecznej”, a w EN „sixteenth-century” przez „seventeenth-century”, po potwierdzeniu kontekstu. Materiał do porównania: [audioprzewodnik MNW, pozycja „Czarniecki pod Koldyngą”](https://www.mnw.art.pl/multimedia/audioprzewodniki/archiwum--wystawy-czasowe/archiwum/wystawa-czasowa-jozef-brandt-1841-1915/). To propozycja, nie zatwierdzona korekta manifestu.
- Nie dodano żadnego dopasowania `match: "title"` bez ręcznego potwierdzenia. Atrybucja fotografii „Gry w krokieta” pozostaje zachowana.

Ponowne wyszukiwanie A9 zakończone: nadal **70/83** dopasowań. Dla 13 wskazanych dzieł sprawdzono także tytuły EN i warianty nazwisk, bez reprodukcji spełniającej warunek hasha. Dodatkowa kwerenda katalogów MNW/MNK/Polony dla portretu Gagatkiewicza nie dała potwierdzonego dopasowania; wpis pozostaje otwarty. Nie oznaczono żadnej treści jako zweryfikowanej.
