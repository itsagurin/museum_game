import type { Artwork, ArtworkPlacement, ArtworkSlot, Era, EraId } from "@/types/game";
import assetManifest from "./asset-manifest.json" with { type: "json" };
import { normalizeWallAssignments, type WallAssignments } from "../lib/wall-gallery";

export const assetUrl = (name: string) =>
  `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/art/${name.split("/").map(encodeURIComponent).join("/")}`;

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

// Wall horizons are calibrated to ceiling mouldings, floor edges and wooden boards.
export const eras: Era[] = [
  {
    id: "era-1",
    numeral: "I",
    name: { pl: "Oświecenie", en: "Enlightenment" },
    period: { pl: "Rozum i nowe spojrzenie", en: "Reason and a new perspective" },
    description: {
      pl: "Pierwszy rozdział kolekcji: odkryj obrazy Oświecenia i urządź nimi swój pokój.",
      en: "The collection’s first chapter: discover Enlightenment paintings and choose them for your room.",
    },
    image: "room1.jpg",
    collectionFolder: "era1_oswiecenie",
    accent: "#c4a16b",
    wallPerspective: { left: { x: 160, y: 48 }, right: { x: -65, y: 47 } },
    doors: {
      previous: { x: 8.5, y: 38, width: 19, height: 27 },
      next: { x: 74, y: 38, width: 20, height: 27 },
    },
  },
  {
    id: "era-2",
    numeral: "II",
    name: { pl: "Romantyzm", en: "Romanticism" },
    period: { pl: "Wyobraźnia i emocje", en: "Imagination and emotion" },
    description: {
      pl: "Ciepłe ściany, stare drewno i miejsce na kolejne historie. Odkryj drugi rozdział domu.",
      en: "Warm walls, old wood and room for more stories. Discover the house’s second chapter.",
    },
    image: "room2.jpg",
    collectionFolder: "era2_romantyzm",
    accent: "#b0b68a",
    wallPerspective: { left: { x: 155, y: 48 }, right: { x: -55, y: 46 } },
    doors: {
      previous: { x: 11, y: 37, width: 19, height: 27 },
      next: { x: 72, y: 37, width: 19, height: 27 },
    },
  },
  {
    id: "era-3",
    numeral: "III",
    name: { pl: "Pozytywizm", en: "Positivism" },
    period: { pl: "Codzienność w nowym świetle", en: "Everyday life in a new light" },
    description: {
      pl: "Delikatne zdobienia i ślady upływu czasu. Ten pokój czeka na odzyskanie swoich barw.",
      en: "Delicate details and traces of passing time. This room is waiting to recover its colours.",
    },
    image: "room3.jpg",
    collectionFolder: "era3_pozytywizm",
    accent: "#bc9287",
    wallPerspective: { left: { x: 155, y: 48 }, right: { x: -55, y: 46 } },
    doors: {
      previous: { x: 10, y: 36.5, width: 19, height: 29 },
      next: { x: 72, y: 37.5, width: 20, height: 29.5 },
    },
  },
  {
    id: "era-4",
    numeral: "IV",
    name: { pl: "Młoda Polska", en: "Young Poland" },
    period: { pl: "Kolor i ekspresja", en: "Colour and expression" },
    description: {
      pl: "Ostatni rozdział kolekcji. Odkryj obrazy Młodej Polski i przywróć kolory wnętrzu.",
      en: "The collection’s final chapter. Discover Young Poland paintings and bring colour back to the room.",
    },
    image: "room4.jpg",
    collectionFolder: "era4_mloda_polska",
    accent: "#91b5ad",
    wallPerspective: { left: { x: 140, y: 47 }, right: { x: -60, y: 49 } },
    doors: {
      previous: { x: 5, y: 41, width: 20, height: 30 },
      next: { x: 74, y: 42, width: 22, height: 30 },
    },
  },
];

// Percentages, including vanishing points outside the scene, use the full illustration.
const placements: ArtworkPlacement[] = [
  { x: 13, y: 23, width: 16, height: 12, wall: "left" },
  { x: 33, y: 31, width: 13, height: 11, wall: "left" },
  { x: 54, y: 24, width: 14, height: 12, wall: "right" },
  { x: 75, y: 23, width: 16, height: 12, wall: "right" },
  { x: 54, y: 43, width: 13, height: 11, wall: "right" },
];

// These five reproductions existed in the previous test catalog.
// Retain their saved identities, without assigning coloring grids to new files.
const legacyCatalogIds: Record<string, string> = {
  "era2_romantyzm/22_22.jpg": "era-3-art-1",
  "era3_pozytywizm/17_17.jpg": "era-3-art-2",
  "era4_mloda_polska/23_23.jpg": "era-3-art-3",
  "era3_pozytywizm/12_12.jpg": "era-3-art-4",
  "era4_mloda_polska/07_07.jpg": "era-3-art-5",
};

// Titles and artist metadata will be supplied by the team. Do not invent them.
export const artworks: Artwork[] = eras.flatMap((era) =>
  assetManifest
    .filter((file) => file.startsWith(`${era.collectionFolder}/`) && /\.(jpg|jpeg|png|webp)$/i.test(file))
    .sort((a, b) => a.localeCompare(b, "pl", { numeric: true }))
    .map((file, index) => ({
      id: legacyCatalogIds[file] ?? `${era.id}-catalog-${encodeURIComponent(file.slice(era.collectionFolder.length + 1))}`,
      eraId: era.id,
      number: index + 1,
      title: { pl: `Obraz ${String(index + 1).padStart(2, "0")}`, en: `Painting ${String(index + 1).padStart(2, "0")}` },
      originalImage: assetUrl(file),
      sourceFile: file,
    })),
);

export const wallSlots: ArtworkSlot[] = eras.flatMap((era) => {
  const collection = artworks.filter((artwork) => artwork.eraId === era.id);
  return placements.map((placement, index) => ({
    id: `${era.id}-slot-${index + 1}`,
    eraId: era.id,
    number: index + 1,
    initialArtworkId: collection[index]?.id ?? "",
    placement,
  }));
});

export const getWallArtworks = (eraId: EraId, saved: WallAssignments = {}) => {
  const assignments = normalizeWallAssignments(saved, wallSlots, artworks);
  return wallSlots.filter((slot) => slot.eraId === eraId).flatMap((slot) => {
    const artwork = artworks.find((item) => item.id === assignments[slot.id] && item.eraId === eraId);
    return artwork ? [{ slot, artwork }] : [];
  });
};

export const getEra = (id: EraId) => eras.find((era) => era.id === id)!;
export const isEraId = (value: string): value is EraId =>
  eras.some((era) => era.id === value);
