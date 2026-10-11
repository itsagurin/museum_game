# 🎨 03. Kuratela Historyczno-Kulturowa (Art & Lore Database)

> **Materiały kandydackie z pierwotnej koncepcji.** Dobór do czterech pokojów, docelowy kontrakt planszy 20×20 i rozdzielenie roku namalowania od przedstawionej epoki opisuje [plan 07](./07_CURRENT_PROJECT_PLAN.md). Starsze teksty wymagają sprawdzenia źródeł przed użyciem w grze; dawny model `ArtworkData` nie jest aktualnym kontraktem algorytmu.

> **Zasada przewodnia:** Opowiadamy o Polsce tak, jakbyśmy opowiadali zafascynowanemu przyjacielowi przy kawie.  
> Żadnego suchego żargonu akademickiego. Skupiamy się na emocjach, symbolach, kulturze codziennej i uniwersalnych ludzkich historiach.

> **Aktualny katalog (11.10.2026):** 83 reprodukcje z folderów Oświecenie (21), Romantyzm (18), Pozytywizm (22), Młoda Polska (22). Plansze 32×32 są dostarczone i podłączone do wszystkich dzieł. Tytuły, autorzy, daty, opisy stylu i dwie ciekawostki dla każdego dzieła są dostarczone w `src/data/artworks_qa.json` i podłączone według dokładnej ścieżki reprodukcji. Treści pliku są po polsku także w UI EN. Robocze „Mistrz Polski” / „XIX w.” z eksportów są zastąpione metadanymi zespołu. Nie przypisuj starszych tekstów poniżej do nowych plików na podstawie przypuszczeń. [Biblioteka i integracja](./10_FRONTEND_V1.md).

---

## 🏛️ 1. Oś Czasu i Selekcja Dzieł Sztuki

Na potrzeby MVP i dalszego rozwoju wybrano ikoniczne obrazy polskiego malarstwa, które idealnie łączą walor estetyczny (atrakcyjne do kolorowania) z głęboką opowieścią o kulturze.

### 🌟 Dzieło #1 (MVP): *Stańczyk* (Jan Matejko, 1862)
- **Tło historyczne:** Renesansowy dwór królewski Zygmunta I Starego i królowej Bony Sforzy (XVI wiek).
- **Nastrój dzieła:** Kontrast między beztroską imprezą na zamku królewskim a samotnym, głębokim zamyśleniem błazna.
- **Treść dla gracza (Bilingual):**
  - **Title (EN):** *Stańczyk: The Thinking Jester*
  - **Quick Story (EN):**  
    *"While the royal court is celebrating at a lavish ball, one man sits in deep silence. Stańczyk was the royal jester, but in Polish history, he represents the sharpest mind in the room — mourning the loss of a vital border town while the nobles dance."*
  - **Culture & Traditions (EN):**  
    *"In old Poland, freedom of speech was taken very seriously among the nobles. Even a jester had the rare privilege to mock and criticize kings without losing his head!"*
  - **Fun Fact (EN):**  
    *"Jan Matejko painted his own face as Stańczyk. Today, Stańczyk is one of the most recognizable memes and cultural icons in Poland."*
  - **Odblokowywany artefakt w domu:** Dębowe biurko z piórem i listem zapieczętowanym woskiem.

---

### 🌟 Dzieło #2: *Bociany* (Józef Chełmoński, 1900)
- **Tło historyczne:** Przełom XIX i XX wieku, tradycyjna polska wieś, związek człowieka z naturą.
- **Nastrój dzieła:** Spokój, melancholia, ciepłe letnie popołudnie, orka na polu.
- **Treść dla gracza (Bilingual):**
  - **Title (EN):** *The Storks (Bociany)*
  - **Quick Story (EN):**  
    *"A peasant father and his young son take a break from plowing the fields to gaze up at a flock of returning storks. For centuries, the arrival of storks marked the coming of spring and hope."*
  - **Culture & Traditions (EN):**  
    *"Poland is home to nearly a quarter of the world's white stork population! In Polish folklore, a stork building a nest on your roof brings peace, good fortune, and fertility to your household."*
  - **Fun Fact (EN):**  
    *"Traditional Polish hospitable greeting: 'Gość w dom, Bóg w dom' (A guest in the home is God in the home) — welcoming strangers with bread and salt was an absolute rule of honour."*
  - **Odblokowywany artefakt w domu:** Tradycyjny bochen chleba na lnianej serwecie oraz gliniany dzban na mleko.

---

### 🌟 Dzieło #3: *Konstytucja 3 Maja 1791 Roku* (Jan Matejko, 1891)
- **Tło historyczne:** Oświecenie, Warszawa, uchwalenie pierwszej nowoczesnej konstytucji w Europie (i drugiej na świecie po USA).
- **Nastrój dzieła:** Entuzjazm, wielki tłum na ulicach Warszawy niosący twórców reformy do katedry św. Jana.
- **Treść dla gracza (Bilingual):**
  - **Title (EN):** *The Constitution of May 3rd*
  - **Quick Story (EN):**  
    *"In 1791, Polish reformers peacefully voted in the first modern written constitution in Europe, aiming to protect civil rights and modernize the state with mutual respect."*
  - **Culture & Traditions (EN):**  
    *"Poland was famous for its democratic traditions (called 'Golden Liberty'), where hundreds of thousands of citizens gathered in open fields to elect their king."*
  - **Fun Fact (EN):**  
    *"Today, May 3rd is celebrated across Poland as a national holiday with parades, picnics, and white-and-red flags flying from every window."*
  - **Odblokowywany artefakt w domu:** Stylowy zegar ścienny w stylu stanisławowskim oraz księga ustaw.

---

### 🌟 Dzieło #4: *Husarz / Bitwa pod Wiedniem* (Jan Matejko)
- **Tło historyczne:** XVII wiek, era sarmacka, polska jazda skrzydlata (Husaria).
- **Nastrój dzieła:** Majestat, duma, bogactwo kultury szlacheckiej.
- **Treść dla gracza (Bilingual):**
  - **Title (EN):** *The Winged Hussars: Defenders of the Realm*
  - **Quick Story (EN):**  
    *"Feared across the battlefields of Europe, Polish Winged Hussars wore real feathered wings strapped to their armor, creating a roaring psychological shock against charging enemy ranks."*
  - **Culture & Traditions (EN):**  
    *"Sarmatism was a unique lifestyle: Polish nobles believed they were descendants of ancient brave warriors, dressing in silk robes (kontusz) and silk sashes (pas kontuszowy)."*
  - **Odblokowywany artefakt w domu:** Skrzydlata zbroja husarska i skrzyżowane szable na ścianie.

---

## 🍲 2. Katalog Tradycji i Obyczajów (Pigułki do wplecenia w dom)

Gdy gracz kliknie na interaktywne meble w domu, odkrywa mikro-historie:

1. **Piec Kaflowy i Palenisko:**
   - *„Ciepło ogniska domowego”*: W surowym klimacie środkowoeuropejskim piec kaflowy był sercem domu, wokół którego zimą snuto baśnie i legendy o Lechu, Czechu i Rusie czy Smoku Wawelskim.
2. **Stół z Siankiem pod obrusem:**
   - *„Tradycja Wigilijna”*: Do dziś w Polsce pod biały obrus na kolację wigilijną wkłada się źdźbło siana, a przy stole zostawia się jedno puste nakrycie dla niespodziewanego wędrowca.
3. **Chleb i Sól (Bread & Salt):**
   - Od wieków podawane nowożeńcom i ważnym gościom przy progu domu — chleb symbolizuje dostatek, a sól oczyszczenie i trwałość przyjaźni.
4. **Wzory Ludowe (Łowickie i Zalipiańskie):**
   - Kolorowe wycinanki i ręcznie malowane kwiaty na ścianach chat, które rozświetlały szare zimy.

---

## 📐 3. Format Danych w Kodzie (JSON Schema dla Curation)

Poniższa struktura powinna być używana w plikach `src/data/artworks.ts` oraz `src/data/houseAssets.ts`:

```typescript
export interface ArtworkData {
  id: string;
  title: { en: string; pl: string };
  artist: string;
  year: number;
  eraId: string;
  imageThumbnail: string; // Oryginał lub podgląd
  svgOutlinePath: string; // Ścieżka SVG do kolorowania
  palette: Array<{
    id: string;
    hex: string;
    label: string; // np. "Royal Crimson", "Baltic Amber"
  }>;
  segments: Array<{
    id: string;
    targetColorId: string;
    pathData: string; // Wektor konturu
  }>;
  story: {
    quickBite: { en: string; pl: string };
    culturalInsight: { en: string; pl: string };
    funFact: { en: string; pl: string };
  };
  reward: {
    inspirationPoints: number;
    unlockedFurnitureId: string;
  };
}
```
