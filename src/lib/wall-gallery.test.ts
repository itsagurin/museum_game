import { describe, it, expect } from "vitest";
import { normalizeWallAssignments, placeWallArtwork } from "./wall-gallery";
import type { ArtworkSlot } from "../types/game";

const collection = ["era-1", "era-2"].flatMap((era) => Array.from({ length: 8 }, (_, index) => ({ id: `${era}-painting-${index + 1}`, eraId: era as "era-1" | "era-2" })));
const slots: ArtworkSlot[] = ["era-1", "era-2"].flatMap((era) => Array.from({ length: 5 }, (_, index) => ({ id: `${era}-slot-${index + 1}`, eraId: era as "era-1" | "era-2", number: index + 1, initialArtworkId: `${era}-painting-${index + 1}`, placement: { x: 10, y: 10, width: 10, height: 10, wall: "left" as const } })));

describe("saved wall arrangement", () => {
  it("restores five default paintings per era when old storage has no wall arrangement", () => {
    for (const saved of [undefined, null, [], "broken"]) {
      const restored = normalizeWallAssignments(saved, slots, collection);
      expect(Object.keys(restored)).toHaveLength(10);
      expect(restored["era-1-slot-1"]).toBe("era-1-painting-1");
      expect(restored["era-2-slot-5"]).toBe("era-2-painting-5");
    }
  });
  it("preserves valid choices, recovers from duplicates and rejects other-era or unknown paintings", () => {
    const restored = normalizeWallAssignments({ "era-1-slot-1": "era-1-painting-7", "era-1-slot-2": "era-1-painting-7", "era-1-slot-3": "era-2-painting-3", "era-1-slot-4": "unknown", unknown: "era-1-painting-1" }, slots, collection);
    expect(restored["era-1-slot-1"]).toBe("era-1-painting-7");
    expect(new Set(Object.values(restored)).size).toBe(10);
    expect(restored["era-1-slot-3"]).toBe("era-1-painting-3");
    expect(restored.unknown).toBeUndefined();
  });
  it("reserves an existing choice before defaults so no painting appears twice", () => {
    const restored = normalizeWallAssignments({ "era-1-slot-3": "era-1-painting-1" }, slots, collection);
    expect(restored["era-1-slot-3"]).toBe("era-1-painting-1");
    expect(restored["era-1-slot-1"]).not.toBe("era-1-painting-1");
  });
});

describe("placing a library painting", () => {
  const initial = normalizeWallAssignments({}, slots, collection);
  it("replaces one painting and leaves the other era untouched", () => {
    const next = placeWallArtwork("era-1-slot-1", "era-1-painting-8", slots, collection, initial);
    expect(next["era-1-slot-1"]).toBe("era-1-painting-8");
    expect(Object.entries(next).filter(([id]) => id.startsWith("era-2"))).toEqual(Object.entries(initial).filter(([id]) => id.startsWith("era-2")));
    expect(initial["era-1-slot-1"]).toBe("era-1-painting-1");
  });
  it("swaps occupied positions instead of duplicating a painting", () => {
    const next = placeWallArtwork("era-1-slot-1", "era-1-painting-3", slots, collection, initial);
    expect(next["era-1-slot-1"]).toBe("era-1-painting-3");
    expect(next["era-1-slot-3"]).toBe("era-1-painting-1");
    expect(new Set(Object.values(next)).size).toBe(10);
  });
  it("ignores attempts to place an unknown painting, use an unknown slot or cross eras", () => {
    for (const [slot, artwork] of [["era-1-slot-1", "era-2-painting-1"], ["unknown", "era-1-painting-1"], ["era-1-slot-1", "unknown"], ["era-1-slot-1", "era-1-painting-1"]]) {
      expect(placeWallArtwork(slot, artwork, slots, collection, initial)).toBe(initial);
    }
  });
});
