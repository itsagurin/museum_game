import type { ArtworkPlacement, EraId, Localized, Region } from "../types/game";
import geometryData from "./decoration-geometry.json" with { type: "json" };
import { sceneSize } from "./scene";

export interface DecorationGeometry {
  width: number; height: number; intrinsicWidth: number; intrinsicHeight: number;
  bounds: Region;
  hitPath: string;
}
export interface RoomDecoration {
  id: string;
  eraId: EraId;
  image: string;
  level: number;
  /** Opaque bounds in scene percent. Attached x/y locate a contact point on the support. */
  x: number; y: number; width: number;
  layer: number;
  supportId?: string;
  /** Contact point in the object's opaque bounds, between 0 and 1. */
  contact?: { x: number; y: number };
  name: Localized;
  fact: Localized;
  reason: Localized;
  source: { title: string; url: string };
}
export const decorationSources = {
  palace: { title: "Łazienki Królewskie — Garderoba", url: "https://www.lazienki-krolewskie.pl/pl/architektura/palac-na-wyspie/pietro-garderoba?floor=pierwsze-pietro" },
  clocks: { title: "Łazienki Królewskie — zegary słoneczne", url: "https://lazienki-krolewskie.pl/pl/rzezby/zegary-sloneczne" },
  enlightenment: { title: "ZPE — edukacja, nauka i literatura oświecenia", url: "https://zpe.gov.pl/a/przeczytaj/D18hcot6Q" },
  chopin: { title: "Biblioteka Polska w Paryżu — Salon Chopina", url: "https://ibpp.eu/wp-content/uploads/2026/05/Salon-Chopina-PL.pdf" },
  ballads: { title: "Archiwum Narodowe w Krakowie — romantyzm", url: "https://archiwalneopowiesci.ank.gov.pl/wystawa/romantycy-polscy-w-zasobie-archiwum-narodowego-w-krakowie/romantyzm-przedlistopadowy/" },
  wieniawski: { title: "Towarzystwo Muzyczne im. H. Wieniawskiego — muzyka salonowa", url: "https://wieniawski.lublin.pl/wp-content/uploads/2022/11/P%C5%82yta-2022-1.pdf" },
  ruins: { title: "Instytut Adama Mickiewicza — ruiny w kulturze", url: "https://culture.pl/pl/artykul/z-gruzu-i-na-gruzach-miejsce-ruin-w-kulturze" },
  literature: { title: "Muzeum Literatury — lekcje muzealne", url: "https://muzeumliteratury.pl/lekcje-muzealne/" },
  prints: { title: "Muzeum Literatury — zbiory", url: "https://archiwum.muzeumliteratury.pl/zbiory/" },
  work: { title: "ZPE — praca organiczna i praca u podstaw", url: "https://zpe.gov.pl/a/przeczytaj/D9scjC5T8" },
  science: { title: "ZPE — słowniczek terminów pozytywistycznych", url: "https://zpe.gov.pl/a/sprawdz-sie/D15gz0K8G" },
  lamp: { title: "Sieć Badawcza Łukasiewicz — innowacje i postęp", url: "https://emag.lukasiewicz.gov.pl/2025/03/07/ignacy-lukasiewicz-patron-innowacji-i-postepu/" },
  realism: { title: "Muzeum Narodowe w Warszawie — Aleksander Gierymski", url: "https://www.mnw.art.pl/edukacja/programy-do-wystaw-czasowych/rchiwum/aleksander-gierymski-1850-1901--program-towarzyszacy-wystawie/" },
  sewing: { title: "Biblioteka Jagiellońska — reklamy maszyn w „Czasie”, 1881", url: "https://www.jbc.bj.uj.edu.pl/Content/588533/0133_NDIGCZAS026703_79822163.pdf?handler=pdf" },
  salon: { title: "Muzeum Krakowa — Herbatka u Rydlów", url: "https://muzeumkrakowa.pl/oddzialy/herbatka-u-rydlow" },
  young: { title: "ZPE — filozofia i sztuka Młodej Polski", url: "https://zpe.gov.pl/watek/LP7JGOQRCQ/49/a/dowiedz-sie/D9NNZN2O9" },
  rose: { title: "ZPE — młodopolskie symbole", url: "https://zpe.gov.pl/a/w-gaszczu-mlodopolskich-symboli/Dp34pe1SC" },
  tatras: { title: "Muzeum Tatrzańskie — Aparat Witkiewiczów", url: "https://muzeumtatrzanskie.pl/wystawa-aparat-witkiewiczow/" },
} as const;
const folders: Record<EraId, string> = { "era-1": "oswiecenie_assets", "era-2": "romantyzm_assets", "era-3": "pozytywizm_assets", "era-4": "mloda_polska_assets" };
const local = (pl: string, en: string): Localized => ({ pl, en });
function item(eraId: EraId, file: string, level: number, x: number, y: number, width: number, layer: number,
  name: [string, string], fact: [string, string], reason: [string, string], source: keyof typeof decorationSources, support?: string, contact?: RoomDecoration["contact"]): RoomDecoration {
  return { id: `${eraId}-${file}`, eraId, image: `${folders[eraId]}/${file}.png`, level, x, y, width, layer,
    name: local(...name), fact: local(...fact), reason: local(...reason), source: decorationSources[source],
    supportId: support ? `${eraId}-${support}` : undefined, contact };
}

// These are illustrative objects, not identified museum exhibits or portraits of named people.
export const roomDecorations: RoomDecoration[] = [
  item("era-1", "15-konsola", 1, 31, 52.8, 28, 5, ["Konsola", "Console table"], ["W Łazienkach zachowały się meble z XVIII wieku.", "Łazienki preserves furniture from the eighteenth century."], ["Tworzy miejsce dla gabinetu miłośnika nauki i sztuki.", "It creates a study for a lover of science and art."], "palace"),
  item("era-1", "08-ksiazki", 2, 35, 11, 4.5, 7, ["Księgi", "Books"], ["Oświeceniowi reformatorzy rozwijali edukację i szkolnictwo.", "Enlightenment reformers developed education and schooling."], ["Książki przypominają o upowszechnianiu wiedzy.", "Books recall the spread of knowledge."], "enlightenment", "15-konsola", { x: 0.5, y: 1 }),
  item("era-1", "07-kalamarz-pioro", 2, 87, 7, 3, 7, ["Kałamarz i pióro", "Inkwell and quill"], ["Literatura i publicystyka wspierały oświeceniowe reformy.", "Literature and journalism supported Enlightenment reforms."], ["To symbol pisarza uczestniczącego w debacie publicznej.", "They evoke a writer taking part in public debate."], "enlightenment", "15-konsola", { x: 0.5, y: 1 }),
  item("era-1", "05-globus", 3, 12, 13, 5, 7, ["Globus", "Globe"], ["Oświecenie stawiało na naukę i poznawanie świata.", "The Enlightenment valued science and knowledge of the world."], ["Globus podkreśla ciekawość i szerokie horyzonty gospodarza.", "The globe expresses the owner's curiosity and broad interests."], "enlightenment", "15-konsola", { x: 0.5, y: 1 }),
  item("era-1", "09-gazeta", 4, 63, 14, 6, 8, ["Gazeta", "Newspaper"], ["„Monitor” zaczął ukazywać się w 1765 roku.", "Monitor began publication in 1765."], ["Prasa pomagała dyskutować o reformach społecznych.", "The press helped people debate social reforms."], "enlightenment", "15-konsola", { x: 0.5, y: 1 }),
  item("era-1", "06-zegar", 5, 62, 9, 4.5, 7, ["Zegar", "Clock"], ["Stanisław August kolekcjonował zegary.", "Stanisław August collected clocks."], ["Precyzja i porządek pasują do epoki rozumu.", "Precision and order suit the age of reason."], "clocks", "15-konsola", { x: 0.5, y: 1 }),
  item("era-1", "02-lustro", 6, 36, 41, 6.5, 4, ["Lustro", "Mirror"], ["W królewskiej garderobie odbywał się ceremoniał ubierania.", "The royal dressing room hosted a daily dressing ceremony."], ["Lustro przywołuje kulturę reprezentacyjnych wnętrz dworskich.", "The mirror evokes the culture of formal court interiors."], "palace"),
  item("era-1", "03-kinkiet-lewy", 7, 29.2, 43, 3.2, 4, ["Lewy kinkiet", "Left wall sconce"], ["Świeczniki należały do wyposażenia królewskich wnętrz.", "Candlesticks furnished royal interiors."], ["Przywraca gabinetowi atmosferę dawnego salonu.", "It gives the study the atmosphere of a historical salon."], "palace"),
  item("era-1", "04-kinkiet-prawy", 7, 45.3, 43.7, 3.2, 4, ["Prawy kinkiet", "Right wall sconce"], ["Dworskie dekoracje łączyły funkcję użytkową z ozdobną.", "Court decoration combined practical and ornamental roles."], ["Para świateł porządkuje kompozycję gabinetu.", "Paired lights bring balance to the study."], "palace"),
  item("era-1", "10-popiersie-cokol", 8, 28.5, 51.2, 5.5, 8, ["Popiersie na cokole", "Bust on a pedestal"], ["Łazienki zdobiły kopie antycznych rzeźb.", "Copies of ancient sculptures decorated Łazienki."], ["Popiersie przypomina klasycystyczne zainteresowanie antykiem.", "The bust recalls classicism's interest in antiquity."], "palace"),
  item("era-1", "11-wazon-podstawa", 8, 61.8, 60.3, 5.5, 8, ["Wazon na podstawie", "Vase on a plinth"], ["W XVIII wieku modne były orientalne inspiracje.", "Oriental influences were fashionable in the eighteenth century."], ["Ozdoba podkreśla kolekcjonerski charakter salonu.", "The vase suggests a salon furnished by a collector."], "palace"),
  item("era-1", "01-zyrandol", 9, 52, 5, 8.5, 4, ["Żyrandol", "Chandelier"], ["Złocony brąz zdobił wnętrza Stanisława Augusta.", "Gilded bronze decorated Stanisław August's interiors."], ["Wieńczy rozwój reprezentacyjnego gabinetu.", "It completes the formal study."], "palace"),

  item("era-2", "piano", 1, 30.5, 51.5, 27, 5, ["Fortepian", "Piano"], ["Salon Chopina w Paryżu pokazuje fortepian Pleyela z 1845 roku.", "The Chopin Salon in Paris displays an 1845 Pleyel piano."], ["Muzyka staje się sercem romantycznego salonu.", "Music becomes the heart of the Romantic salon."], "chopin"),
  item("era-2", "piano_stool", 2, 39, 62, 9.5, 8, ["Taboret pianisty", "Piano stool"], ["Chopin i Liszt grali razem na cztery ręce.", "Chopin and Liszt played piano four hands together."], ["Zaprasza do kameralnego muzykowania.", "It invites intimate music making."], "chopin", "piano"),
  item("era-2", "poetry_books", 3, 14, 10, 4.4, 7, ["Tomiki poezji", "Poetry books"], ["„Ballady i romanse” wydano w 1822 roku.", "Ballads and Romances appeared in 1822."], ["Poezja wprowadza wyobraźnię i uczucia do salonu.", "Poetry brings imagination and emotion into the salon."], "ballads", "piano", { x: 0.5, y: 1 }),
  item("era-2", "letters", 3, 85, 7, 5, 8, ["Listy", "Letters"], ["Zachowały się listy Chopina do jego przyjaciół.", "Chopin's letters to his friends survive."], ["Przypominają o więziach podtrzymywanych na odległość.", "They recall friendships maintained across distances."], "chopin", "piano", { x: 0.5, y: 1 }),
  item("era-2", "keepsake_box", 4, 40, 8.5, 4.4, 7, ["Pudełko pamiątek", "Keepsake box"], ["W Saloniku Chopina przechowywane są osobiste pamiątki.", "The Chopin Salon preserves personal keepsakes."], ["Pamiątki przywołują romantyczną pamięć i sentyment.", "Keepsakes evoke Romantic memory and sentiment."], "chopin", "piano", { x: 0.5, y: 1 }),
  item("era-2", "candelabrum", 4, 65, 6.5, 3.3, 7, ["Świecznik", "Candelabrum"], ["Salony łączyły spotkania muzyków i miłośników muzyki.", "Salons brought musicians and music lovers together."], ["Światło świec buduje nastrój wieczornego koncertu.", "Candlelight sets the mood for an evening concert."], "wieniawski", "piano", { x: 0.5, y: 1 }),
  item("era-2", "violin_stand", 5, 60, 58.4, 11.5, 5, ["Stolik muzyczny", "Music table"], ["Muzyka salonowa pomagała nawiązywać artystyczne znajomości.", "Salon music helped people form artistic connections."], ["Tworzy miejsce dla kolejnego instrumentu.", "It makes room for another instrument."], "wieniawski"),
  item("era-2", "violin_case", 5, 50, 16, 10.5, 7, ["Futerał skrzypiec", "Violin case"], ["Henryk Wieniawski należał do wielkich XIX-wiecznych skrzypków.", "Henryk Wieniawski was a major nineteenth-century violinist."], ["Przywołuje świat podróżujących wirtuozów.", "It evokes the world of travelling virtuosos."], "wieniawski", "violin_stand", { x: 0.5, y: 1 }),
  item("era-2", "violin", 6, 53, 82, 8.8, 8, ["Skrzypce", "Violin"], ["Wieniawski wplatał polskie tańce w muzykę skrzypcową.", "Wieniawski incorporated Polish dances into violin music."], ["Instrument podkreśla ekspresję romantycznej muzyki.", "The instrument expresses the emotion of Romantic music."], "wieniawski", "violin_case", { x: 0.5, y: 0.75 }),
  item("era-2", "bow", 6, 50, 65, 8.8, 9, ["Smyczek", "Bow"], ["Wirtuozi epoki rozwijali sztukę gry na skrzypcach.", "The period's virtuosos developed the art of violin playing."], ["Uzupełnia instrument gotowy do salonowego koncertu.", "It completes an instrument ready for a salon concert."], "wieniawski", "violin", { x: 0.5, y: 0.7 }),
  item("era-2", "travel_trunk", 7, 61, 67, 18.5, 9, ["Kufer podróżny", "Travel trunk"], ["Mickiewicz tworzył także podczas emigracyjnej tułaczki.", "Mickiewicz also wrote during his years in exile."], ["Kufer przypomina o podróżach i tęsknocie za domem.", "The trunk recalls journeys and homesickness."], "literature"),
  item("era-2", "ruins_painting", 8, 31.5, 40.5, 9.5, 4, ["Pejzaż z ruinami", "Landscape with ruins"], ["Romantycy chętnie malowali i opisywali ruiny.", "Romantics often painted and wrote about ruins."], ["Przywołuje tajemnicę i przemijanie dawnych czasów.", "It evokes mystery and the passing of earlier ages."], "ruins"),
  item("era-2", "insurrection_print", 9, 60, 40, 10.5, 4, ["Grafika powstańcza", "Insurrection print"], ["Druki powstańcze są częścią zbiorów Muzeum Literatury.", "Insurrection prints form part of the Museum of Literature's collections."], ["Przypomina o romantycznej pamięci walk o niepodległość.", "It recalls Romantic memories of struggles for independence."], "prints"),

  item("era-3", "10-biurko", 1, 30, 52, 27, 5, ["Biurko", "Desk"], ["Pozytywiści podkreślali znaczenie systematycznej pracy.", "Positivists emphasised systematic work."], ["Gabinet zaczyna się od miejsca nauki i działania.", "The study starts with a place to learn and work."], "work"),
  item("era-3", "08-krzeslo", 2, 45.5, 62.5, 10.5, 8, ["Krzesło", "Chair"], ["Praca u podstaw obejmowała upowszechnianie oświaty.", "Grassroots work included spreading education."], ["Zaprasza do codziennej, cierpliwej nauki.", "It invites patient, everyday study."], "work", "10-biurko"),
  item("era-3", "05-ksiazka-tylna", 3, 24, 15, 5.8, 7, ["Otwarta książka", "Open book"], ["Pozytywiści traktowali edukację jako drogę rozwoju społeczeństwa.", "Positivists saw education as a path to social development."], ["Podkreśla dostępność wiedzy.", "It highlights access to knowledge."], "work", "10-biurko", { x: 0.5, y: 1 }),
  item("era-3", "06-ksiazka-przednia", 4, 47, 15, 5.5, 8, ["Książka na biurku", "Book on the desk"], ["Program pracy organicznej opierał się na współdziałaniu.", "The programme of organic work relied on cooperation."], ["Wiedza ma tu służyć wspólnemu dobru.", "Knowledge here should serve the common good."], "science", "10-biurko", { x: 0.5, y: 1 }),
  item("era-3", "07-ksiazka-prawa", 5, 85, 7.5, 5.5, 8, ["Książka do nauki", "Study book"], ["Pozytywizm cenił wiedzę opartą na doświadczeniu.", "Positivism valued knowledge based on experience."], ["Przypomina o uczeniu się przez obserwację.", "It recalls learning through observation."], "science", "10-biurko", { x: 0.5, y: 1 }),
  item("era-3", "04-mikroskop", 6, 63, 6.5, 3.9, 7, ["Mikroskop", "Microscope"], ["Scjentyzm wiązał poznanie z badaniem naukowym.", "Scientism linked knowledge to scientific investigation."], ["Symbolizuje obserwację i sprawdzanie hipotez.", "It symbolises observation and testing hypotheses."], "science", "10-biurko", { x: 0.5, y: 1 }),
  item("era-3", "02-biblioteczka", 7, 31, 40.5, 14, 4, ["Biblioteczka", "Bookshelf"], ["Oświata miała wspierać rozwój całego społeczeństwa.", "Education was meant to support society as a whole."], ["Zebrane książki tworzą zaplecze samokształcenia.", "Collected books provide resources for self-education."], "work"),
  item("era-3", "03-obraz-pejzaz", 8, 58.5, 40.5, 11.5, 4, ["Pejzaż", "Landscape"], ["Gierymski badał w malarstwie światło i codzienność.", "Gierymski explored light and everyday life in painting."], ["Krajobraz odwołuje się do uważnej obserwacji świata.", "The landscape evokes careful observation of the world."], "realism"),
  item("era-3", "09-maszyna-ze-stolem", 9, 59, 55, 12.5, 9, ["Maszyna do szycia", "Sewing machine"], ["Reklamy maszyn Singera pojawiały się w polskiej prasie w 1881 roku.", "Singer machines were advertised in the Polish press in 1881."], ["Przywołuje rozwój rzemiosła i praktycznej techniki.", "It evokes the development of crafts and practical technology."], "sewing"),
  item("era-3", "01-lampa-naftowa", 9, 48.5, 5, 4.3, 4, ["Lampa naftowa", "Oil lamp"], ["Łukasiewicz opracował lampę naftową w 1853 roku.", "Łukasiewicz developed a kerosene lamp in 1853."], ["Wynalazek poprzedza epokę, lecz przypomina jej wiarę w postęp.", "The invention predates the era but evokes its faith in progress."], "lamp"),

  item("era-4", "table", 1, 28.5, 57.5, 27, 5, ["Stół pisarza", "Writer's table"], ["Młodopolskie salony były miejscami literackich spotkań.", "Young Poland salons hosted literary gatherings."], ["Tu powstaje miejsce rozmów o nowej sztuce.", "It creates a place to discuss new art."], "salon"),
  item("era-4", "armchair", 2, 50, 61, 12.5, 8, ["Fotel", "Armchair"], ["Artyści spotykali się w salonach wpływowych krakowian.", "Artists met in the salons of prominent Cracovians."], ["Przywołuje atmosferę kameralnych dyskusji.", "It evokes the atmosphere of intimate discussions."], "salon"),
  item("era-4", "books", 3, 49, 70, 6, 7, ["Książki", "Books"], ["Młoda Polska wracała do twórczości romantycznych poetów.", "Young Poland revisited the works of Romantic poets."], ["Księgi łączą nową sztukę z literacką tradycją.", "Books connect new art with literary tradition."], "young", "table", { x: 0.5, y: 1 }),
  item("era-4", "letters", 3, 70, 10, 5.5, 7, ["Korespondencja", "Correspondence"], ["Rydlówka skupiała malarzy, poetów i pisarzy.", "Rydlówka brought together painters, poets and writers."], ["Listy przywołują wymianę myśli między twórcami.", "Letters evoke exchanges of ideas between artists."], "salon", "table", { x: 0.5, y: 1 }),
  item("era-4", "inkwell", 4, 49, 13, 2.6, 8, ["Kałamarz", "Inkwell"], ["Artyści epoki podkreślali wyjątkową rolę twórcy.", "The period's artists emphasised the creator's special role."], ["To znak osobistego warsztatu pisarza.", "It marks the writer's personal workspace."], "young", "table", { x: 0.5, y: 1 }),
  item("era-4", "quill", 4, 65, 14, 2.6, 8, ["Pióro", "Quill"], ["Literaci Młodej Polski szukali nowych dróg w sztuce.", "Young Poland writers sought new paths in art."], ["Tradycyjne pióro nawiązuje do literackiego salonu.", "The traditional quill evokes a literary salon."], "young", "inkwell", { x: 0.04, y: 0.95 }),
  item("era-4", "candlestick", 5, 15, 19, 2.5, 7, ["Lichtarz", "Candlestick"], ["Sztuka Młodej Polski wkraczała także w życie codzienne.", "Young Poland art also entered everyday life."], ["Ozdobne światło nadaje pracowni intymny nastrój.", "Decorative light gives the study an intimate mood."], "young", "table", { x: 0.5, y: 1 }),
  item("era-4", "rose", 6, 29, 22, 7, 9, ["Róża", "Rose"], ["U Kasprowicza dzika róża symbolizuje między innymi życie.", "In Kasprowicz's poetry, the wild rose can symbolise life."], ["Kwiat przypomina wieloznaczność młodopolskich symboli.", "The flower recalls the ambiguity of Young Poland symbolism."], "rose", "table", { x: 0.5, y: 1 }),
  item("era-4", "music_stand", 7, 64.5, 57, 8.5, 5, ["Pulpit muzyczny", "Music stand"], ["Młoda Polska nawiązywała do romantycznej tradycji.", "Young Poland drew on the Romantic tradition."], ["Muzyka uzupełnia literackie i malarskie inspiracje.", "Music complements literary and artistic inspiration."], "young"),
  item("era-4", "sheet_music", 7, 53, 17, 6.2, 7, ["Nuty", "Sheet music"], ["W Saloniku Chopina można zobaczyć autografy muzyczne.", "The Chopin Salon displays musical manuscripts."], ["Nuty przywołują dziedzictwo romantyzmu w późniejszym salonie.", "The score evokes Romantic heritage in a later salon."], "chopin", "music_stand", { x: 0.5, y: 0.5 }),
  item("era-4", "poet_portrait", 8, 55.5, 42.5, 8, 4, ["Portret poety", "Poet's portrait"], ["Młodopolscy twórcy odwoływali się do narodowych wieszczów.", "Young Poland artists drew inspiration from national Romantic poets."], ["Umowny portret przypomina kult poety i indywidualności.", "The imagined portrait evokes the poet's individuality and status."], "young"),
  item("era-4", "mountain_landscape", 9, 64, 39.1, 9.5, 4, ["Pejzaż górski", "Mountain landscape"], ["Witkiewiczowie utrwalali zarówno portrety, jak i pejzaże.", "The Witkiewicz family recorded both portraits and landscapes."], ["Góry przypominają inspiracje płynące z Zakopanego i Tatr.", "The mountains recall inspiration from Zakopane and the Tatras."], "tatras"),
];

const geometries: Record<string, DecorationGeometry> = geometryData;
export function getDecorationGeometry(decoration: RoomDecoration) { return geometries[decoration.image]; }
export function getDecorationBounds(decoration: RoomDecoration): Region {
  const { bounds } = getDecorationGeometry(decoration);
  const height = decoration.width * sceneSize.width / sceneSize.height * bounds.height / bounds.width;
  if (decoration.contact && decoration.supportId) {
    const support = getDecorationBounds(roomDecorations.find(({ id }) => id === decoration.supportId)!);
    return {
      x: support.x + support.width * decoration.x / 100 - decoration.width * decoration.contact.x,
      y: support.y + support.height * decoration.y / 100 - height * decoration.contact.y,
      width: decoration.width, height,
    };
  }
  return { x: decoration.x, y: decoration.y, width: decoration.width, height };
}
export function getDecorationImageRegion(decoration: RoomDecoration): Region {
  const { width, height, bounds } = getDecorationGeometry(decoration);
  const solid = getDecorationBounds(decoration);
  return { x: solid.x - bounds.x / bounds.width * solid.width,
    y: solid.y - bounds.y / bounds.height * solid.height,
    width: solid.width * width / bounds.width, height: solid.height * height / bounds.height };
}
export function getRoomDecorations(eraId: EraId, level: number) {
  const earned = Math.max(0, Math.min(9, Number.isFinite(level) ? Math.floor(level) : 0));
  return roomDecorations.filter((decoration) => decoration.eraId === eraId && decoration.level <= earned);
}
export function getNewDecorations(eraId: EraId, previousLevel: number, nextLevel: number) {
  const previous = new Set(getRoomDecorations(eraId, previousLevel).map(({ id }) => id));
  return getRoomDecorations(eraId, nextLevel).filter(({ id }) => !previous.has(id));
}

const barePlacements: ArtworkPlacement[] = [
  { x: 13, y: 23, width: 16, height: 12, wall: "left" },
  { x: 33, y: 31, width: 13, height: 11, wall: "left" },
  { x: 54, y: 24, width: 14, height: 12, wall: "right" },
  { x: 75, y: 23, width: 16, height: 12, wall: "right" },
  { x: 54, y: 43, width: 13, height: 11, wall: "right" },
];
const furnishedPlacements: ArtworkPlacement[] = [
  { x: 12, y: 23.5, width: 11, height: 8.5, wall: "left" },
  { x: 26, y: 26, width: 10.5, height: 8, wall: "left" },
  { x: 55, y: 24, width: 12.5, height: 9, wall: "right" },
  { x: 73, y: 23, width: 14, height: 10, wall: "right" },
  { x: 39, y: 28, width: 8.5, height: 7.5, wall: "left" },
];
/** Preserve wall IDs/assignments; reserve free wall space as the room fills up. */
export function getRoomArtworkPlacement(eraId: EraId, number: number, level: number): ArtworkPlacement {
  const source = (level > 0 ? furnishedPlacements : barePlacements)[number - 1];
  // Room IV has lower doors/cornices; the upper gallery stays clear of them.
  return { ...source, y: source.y + (eraId === "era-4" && level > 0 ? 1 : 0) };
}
