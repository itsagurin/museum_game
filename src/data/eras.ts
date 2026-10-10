import type { Artwork, ArtworkPlacement, Era, EraId } from "@/types/game";

export const assetUrl = (name: string) =>
  `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/art/${name}`;

export const hallThemes = [
  {
    wall: ["#b69b75", "#74604a"],
    floor: ["#6a5440", "#b39a73"],
    door: ["#69513b", "#987956", "#5e4834"],
    ceiling: "#6a5945",
    rear: "#b69b75",
  },
  {
    wall: ["#d0c3a5", "#a69a7f"],
    floor: ["#6a5440", "#b39a73"],
    door: ["#6c543c", "#a38a63", "#685039"],
    ceiling: "#756148",
    rear: "#e2d7bd",
  },
  {
    wall: ["#d9cfba", "#b4a589"],
    floor: ["#75614b", "#b9a384"],
    door: ["#806549", "#b59873", "#786047"],
    ceiling: "#a89c83",
    rear: "#e6ddca",
  },
  {
    wall: ["#e2e5d2", "#b9c0aa"],
    floor: ["#97866c", "#c6b798"],
    door: ["#9c8768", "#c8b797", "#9a886c"],
    ceiling: "#c4c7b4",
    rear: "#edf0df",
  },
];

export const eras: Era[] = [
  {
    id: "era-1",
    numeral: "I",
    name: { pl: "Początki Polski", en: "The beginnings" },
    period: { pl: "Od pierwszych grodów", en: "From the first settlements" },
    description: {
      pl: "Drewno, kamień i ślady pierwszych opowieści. Tutaj zaczyna się podróż przez nasz dom.",
      en: "Wood, stone and the traces of early stories. Your journey through our house begins here.",
    },
    image: "room1.jpg",
    accent: "#c4a16b",
    doors: {
      previous: { x: 8.5, y: 38, width: 19, height: 27 },
      next: { x: 74, y: 38, width: 20, height: 27 },
    },
  },
  {
    id: "era-2",
    numeral: "II",
    name: { pl: "Dawna Rzeczpospolita", en: "The Commonwealth" },
    period: { pl: "W cieniu dawnego dworu", en: "In the old manor" },
    description: {
      pl: "Ciepłe ściany, stare drewno i miejsce na kolejne historie. Odkryj drugi rozdział domu.",
      en: "Warm walls, old wood and room for more stories. Discover the house’s second chapter.",
    },
    image: "room2.jpg",
    accent: "#b0b68a",
    doors: {
      previous: { x: 11, y: 37, width: 19, height: 27 },
      next: { x: 72, y: 37, width: 19, height: 27 },
    },
  },
  {
    id: "era-3",
    numeral: "III",
    name: { pl: "Droga do niepodległości", en: "Towards independence" },
    period: { pl: "Historie, które przetrwały", en: "Stories that endured" },
    description: {
      pl: "Delikatne zdobienia i ślady upływu czasu. Ten pokój czeka na odzyskanie swoich barw.",
      en: "Delicate details and traces of passing time. This room is waiting to recover its colours.",
    },
    image: "room3.jpg",
    accent: "#bc9287",
    doors: {
      previous: { x: 10, y: 36.5, width: 19, height: 29 },
      next: { x: 72, y: 37.5, width: 20, height: 29.5 },
    },
  },
  {
    id: "era-4",
    numeral: "IV",
    name: { pl: "Polska nowoczesna", en: "Modern Poland" },
    period: { pl: "Bliżej naszych czasów", en: "Closer to our time" },
    description: {
      pl: "Jaśniejsze wnętrze i nowy rozdział. Nasza podróż dociera do współczesnej odsłony domu.",
      en: "A brighter interior and a new chapter. Our journey reaches the house’s modern incarnation.",
    },
    image: "room4.jpg",
    accent: "#91b5ad",
    doors: {
      previous: { x: 5, y: 41, width: 20, height: 30 },
      next: { x: 74, y: 42, width: 22, height: 30 },
    },
  },
];

// Percentages belong to the full 896 × 1200 scene, never to the viewport.
const placements: ArtworkPlacement[] = [
  { x: 13, y: 23, width: 16, height: 12, rotation: 2, wall: "left" },
  { x: 33, y: 31, width: 13, height: 11, rotation: 2, wall: "left" },
  { x: 54, y: 24, width: 14, height: 12, rotation: -2, wall: "right" },
  { x: 75, y: 23, width: 16, height: 12, rotation: -2, wall: "right" },
  { x: 54, y: 43, width: 13, height: 11, rotation: -2, wall: "right" },
];

// Editorial placeholders: replace with the team's selected works and verified stories.
export const artworks: Artwork[] = eras.flatMap((era) =>
  placements.map((placement, index) => ({
    id: `${era.id}-art-${index + 1}`,
    eraId: era.id,
    number: index + 1,
    title: { pl: `Obraz ${index + 1}`, en: `Painting ${index + 1}` },
    placement,
  })),
);

export const getEra = (id: EraId) => eras.find((era) => era.id === id)!;
export const isEraId = (value: string): value is EraId =>
  eras.some((era) => era.id === value);
