import { describe, expect, it } from "vitest";
import { getRoomBackgroundCandidates, getRoomProgress } from "./room-development";

const collection = Array.from({ length: 30 }, (_, index) => ({ id: `painting-${index + 1}`, eraId: "era-1" as const }));

describe("room development across the complete era collection", () => {
  it("spreads all ten levels across thirty paintings and reaches the last only at completion", () => {
    const thresholds = [0, 4, 7, 10, 14, 17, 20, 24, 27, 30];
    thresholds.forEach((count, level) => {
      const progress = getRoomProgress("era-1", collection, collection.slice(0, count).map((artwork) => artwork.id));
      expect(progress.level).toBe(level);
      expect(progress.nextLevelAt).toBe(level === 9 ? null : thresholds[level + 1]);
      expect(progress.isComplete).toBe(level === 9);
      if (count) expect(getRoomProgress("era-1", collection, collection.slice(0, count - 1).map((artwork) => artwork.id)).level).toBe(level - 1);
    });
  });

  it("counts paintings outside the five wall positions and ignores duplicate, unknown and other-era completions", () => {
    const extra = { id: "other-era", eraId: "era-2" as const };
    const progress = getRoomProgress("era-1", [...collection, extra, collection[0]], [collection[29].id, collection[29].id, "other-era", "unknown"]);
    expect(progress).toMatchObject({ totalCount: 30, completedCount: 1, level: 0, isComplete: false });
  });

  it("handles the current five-painting demo, one painting, reset and empty collections", () => {
    const demo = collection.slice(0, 5);
    expect(Array.from({ length: 6 }, (_, count) => getRoomProgress("era-1", demo, demo.slice(0, count).map((artwork) => artwork.id)).level)).toEqual([0, 1, 3, 5, 7, 9]);
    expect(getRoomProgress("era-1", demo, []).level).toBe(0);
    expect(getRoomProgress("era-1", demo.slice(0, 1), [demo[0].id])).toMatchObject({ level: 9, isComplete: true });
    expect(getRoomProgress("era-4", demo, []).isComplete).toBe(false);
    expect(getRoomProgress("era-4", [], []).level).toBe(0);
  });
});

describe("room decoration asset selection", () => {
  it("selects the earned variant first and retains all lower-level fallbacks", () => {
    const files = ["room1_level9.jpg", "room1_level3.png", "room2_level5.jpg", "room1_level0.webp", "room1.jpg", "room1_level5.JPEG"];
    expect(getRoomBackgroundCandidates("room1.jpg", 6, files)).toEqual(["room1_level5.JPEG", "room1_level3.png", "room1_level0.webp", "room1.jpg"]);
  });

  it("never shows locked, invalid or other-room assets and supports the legacy fallback", () => {
    const files = ["room1_level1.jpg", "room1_level10.jpg", "room1_level-1.jpg", "room2_level0.jpg", "room1_LEVEL0.PNG", "room1.png"];
    expect(getRoomBackgroundCandidates("room1.jpg", 0, files)).toEqual(["room1_LEVEL0.PNG", "room1.png"]);
    expect(getRoomBackgroundCandidates("room1.jpg", 5, [])).toEqual(["room1.jpg"]);
    expect(getRoomBackgroundCandidates("room1.jpg", -1, files)).toEqual(["room1_LEVEL0.PNG", "room1.png"]);
    expect(getRoomBackgroundCandidates("room1.jpg", NaN, files)).toEqual(["room1_LEVEL0.PNG", "room1.png"]);
  });
});
