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
      "era-1": { x: 7, y: 24, width: 16.5, height: 64 },
      "era-2": { x: 27.5, y: 37.5, width: 7, height: 32 },
      "era-3": { x: 66, y: 37.5, width: 7.5, height: 32 },
      "era-4": { x: 77, y: 24, width: 16.5, height: 64 },
    },
  },
  {
    image: "hall2",
    doors: {
      "era-1": { x: 6.5, y: 23, width: 16, height: 65.5 },
      "era-2": { x: 29, y: 37, width: 5.5, height: 29 },
      "era-3": { x: 66, y: 37, width: 5.5, height: 29 },
      "era-4": { x: 78, y: 23, width: 16, height: 65.5 },
    },
  },
  {
    image: "hall3",
    doors: {
      "era-1": { x: 11, y: 25, width: 11.5, height: 65 },
      "era-2": { x: 27, y: 36.5, width: 5, height: 36 },
      "era-3": { x: 68, y: 36.5, width: 5, height: 36 },
      "era-4": { x: 77.5, y: 25, width: 11.5, height: 65 },
    },
  },
  {
    image: "hall4",
    doors: {
      "era-1": { x: 8.5, y: 18, width: 13, height: 73.5 },
      "era-2": { x: 27.5, y: 33.5, width: 4.5, height: 39.5 },
      "era-3": { x: 68, y: 33.5, width: 4.5, height: 39.5 },
      "era-4": { x: 78.5, y: 18, width: 13, height: 73.5 },
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
