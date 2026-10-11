import type { EraId, Region } from "@/types/game";

interface HallLayout {
  image: string;
  doors: Record<EraId, Region>;
}

// Percentages refer to each complete 896 × 1200 illustration.
// The order is near left, far left, far right, near right.
export const halls: HallLayout[] = [
  {
    image: "hall1",
    doors: {
      "era-1": { x: 25.5, y: 39, width: 6.5, height: 29.5 },
      "era-2": { x: 34.5, y: 44, width: 3.7, height: 16.5 },
      "era-3": { x: 61.8, y: 44, width: 3.7, height: 16.5 },
      "era-4": { x: 68.2, y: 39, width: 6.4, height: 29.5 },
    },
  },
  {
    image: "hall2",
    doors: {
      "era-1": { x: 25.7, y: 39, width: 6.3, height: 27 },
      "era-2": { x: 34.4, y: 44, width: 3.7, height: 17 },
      "era-3": { x: 61.8, y: 44, width: 3.7, height: 17 },
      "era-4": { x: 68.2, y: 39, width: 6.3, height: 27 },
    },
  },
  {
    image: "hall3",
    doors: {
      "era-1": { x: 25.7, y: 36.8, width: 6, height: 29 },
      "era-2": { x: 33.3, y: 42, width: 3.3, height: 18.5 },
      "era-3": { x: 63.4, y: 42, width: 3.3, height: 18.5 },
      "era-4": { x: 68.5, y: 36.8, width: 6, height: 29 },
    },
  },
  {
    image: "hall4",
    doors: {
      "era-1": { x: 25.3, y: 36.7, width: 6.4, height: 30 },
      "era-2": { x: 32.6, y: 42, width: 3.5, height: 19.5 },
      "era-3": { x: 63.9, y: 42, width: 3.5, height: 19.5 },
      "era-4": { x: 68.5, y: 36.7, width: 6.5, height: 30 },
    },
  },
];

// Only used when the photographic hall assets are unavailable.
export const fallbackHallDoors: Record<EraId, Region> = {
  "era-1": { x: 8, y: 38, width: 21, height: 34 },
  "era-2": { x: 32, y: 33, width: 15, height: 28 },
  "era-3": { x: 53, y: 33, width: 15, height: 28 },
  "era-4": { x: 71, y: 38, width: 21, height: 34 },
};
