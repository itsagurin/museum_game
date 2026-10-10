import type { ChapterId } from '@/lib/progress';
export interface Artwork {
  id: ChapterId;
  title: string;
  artist: string;
  year: number;
  chapter: string;
  theme: string;
  invitation: string;
  story: string[];
  insight: string;
  reward: string;
  rewardDescription: string;
  source: { label: string; url: string };
}
export const artworks: Artwork[] = [
  {
    id: 'stanczyk', title: 'Stańczyk', artist: 'Jan Matejko', year: 1862,
    chapter: 'Cisza, która mówi', theme: 'O uważności', invitation: 'Czasem najwięcej dostrzega ten, kto na chwilę się zatrzyma.',
    story: [
      'Za drzwiami trwa bal. W głębi obrazu migoczą stroje gości, lecz na pierwszym planie siedzi samotny człowiek w czerwieni. To Stańczyk, królewski błazen. Zamiast rozśmieszać innych, milczy. Matejko uczynił tę chwilę zamyślenia sercem swojego obrazu.',
      'Pełny tytuł dzieła przywołuje utratę Smoleńska. Radosna zabawa dworu i troska błazna tworzą przejmujący kontrast. To malarska opowieść o odpowiedzialności i dostrzeganiu tego, co umyka innym — nie dosłowny zapis jednej chwili z historii.',
      'Obraz powstał w 1862 roku, wiele stuleci po czasach Stańczyka. Dziś znajduje się w Muzeum Narodowym w Warszawie. Spójrz jeszcze raz na jego spokojną, ciężką od myśli postać. Być może ta historia zaczyna się właśnie od uważności: od chwili, w której przestajemy patrzeć na to, co najgłośniejsze, i zauważamy to, co ważne.',
    ],
    insight: 'Matejko malował przeszłość ze swojej perspektywy. Obraz historyczny może być interpretacją wydarzeń, a nie ich fotograficznym odtworzeniem.',
    reward: 'Światło refleksji', rewardDescription: 'W domu pojawiają się biurko, list i ciepła lampka.',
    source: { label: 'Muzeum Narodowe w Warszawie', url: 'https://www.mnw.art.pl/wydarzenia/kalendarium/9084,20,1,wydarzenie.html' },
  },
  {
    id: 'bociany', title: 'Bociany', artist: 'Józef Chełmoński', year: 1900,
    chapter: 'Małe wielkie chwile', theme: 'O bliskości', invitation: 'Podnieś wzrok. Niektóre opowieści przelatują tuż nad nami.',
    story: [
      'Nie ma tu królewskiego dworu ani wielkiego tłumu. Jest otwarta przestrzeń, ziemia i ludzie, którzy na chwilę przerywają codzienny rytm. W obrazie Chełmońskiego zwykły dzień na wsi staje się czymś, przy czym chce się zatrzymać.',
      'Ojciec i chłopiec spoglądają ku bocianom. Ten prosty gest łączy ich ze sobą i z otaczającą przyrodą. Nie muszą niczego wyjaśniać. Wspólne patrzenie wystarcza, by na moment ucichły wszystkie inne sprawy. To mała scena, ale mieści się w niej cały świat.',
      'Chełmoński namalował „Bociany” w 1900 roku. Dzieło należy do zbiorów Muzeum Narodowego w Warszawie. Jego spokojny rytm przypomina, że kultura to także codzienność: odpoczynek, relacje i krajobrazy, które pamiętamy. W naszym domu ta opowieść zostawia miejsce przy stole — zaproszenie, żeby usiąść, odetchnąć i po prostu przez chwilę pobyć razem.',
    ],
    insight: 'W polskim malarstwie ważne miejsce zajmują nie tylko wydarzenia historyczne, lecz także życie wsi i relacja człowieka z naturą.',
    reward: 'Miejsce przy stole', rewardDescription: 'Lniany obrus, chleb i gliniany dzban ocieplają wnętrze.',
    source: { label: 'Zintegrowana Platforma Edukacyjna', url: 'https://zpe.gov.pl/watek/LPEJ10m8mx/20/a/bilet-do-pinakoteki/DcA1uYEdJ' },
  },
  {
    id: 'konstytucja', title: 'Konstytucja 3 maja', artist: 'Jan Matejko', year: 1891,
    chapter: 'Razem ku światłu', theme: 'O wspólnocie', invitation: 'Jedna opowieść potrafi połączyć wiele różnych głosów.',
    story: [
      'Warszawska ulica wypełnia się ludźmi. W centrum tłumu, niesiony na ramionach, znajduje się marszałek Stanisław Małachowski. W dłoni unosi dokument. Matejko opowiada o uchwaleniu Konstytucji 3 maja 1791 roku językiem ruchu, gestów i wielkich emocji.',
      'Obraz powstał w 1891 roku, sto lat po wydarzeniu. Nie jest jednak prostą kroniką pochodu. Malarz umieścił w nim także osoby, których obecność ma znaczenie symboliczne. Zestawiając różne postacie i wątki, pokazał własną wizję wspólnoty oraz nadziei związanej z reformą państwa.',
      'Dzieło można oglądać w Zamku Królewskim w Warszawie. Przyjrzyj się twarzom: każda należy do osobnej historii, choć wszystkie znalazły się na jednym płótnie. W naszym domu ta ostatnia opowieść zapala pełne światło. Nie dlatego, że historia się kończy. Dlatego, że od teraz jest tu miejsce na kolejne głosy — także Twój.',
    ],
    insight: 'Data w tytule obrazu oznacza przedstawione wydarzenie. Data powstania płótna jest inna: Matejko namalował je sto lat później.',
    reward: 'Dom pełen opowieści', rewardDescription: 'Zegar i otwarta księga dopełniają dom. Wszystkie okna lśnią.',
    source: { label: 'Zamek Królewski w Warszawie', url: 'https://digitalizacja.zamek-krolewski.pl/obiekt-1167-konstytucja-3-maja-1791' },
  },
];
