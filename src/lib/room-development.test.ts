import { describe, expect, it } from "vitest";
import { ERA_UNLOCK_LEVEL, getEraAccess, getLevelThresholds, getRoomProgress } from "./room-development";
import type { EraId } from "../types/game";

const paintings = (eraId: EraId, count: number) => Array.from({ length: count }, (_, index) => ({ id: `${eraId}-painting-${index + 1}`, eraId }));
const collection = paintings("era-1", 30);
const ids = (list: { id: string }[], count: number) => list.slice(0, count).map((artwork) => artwork.id);

describe("room development across the complete era collection", () => {
  it("gives the first level after one painting and spreads later levels further apart", () => {
    expect(getLevelThresholds(21)).toEqual([1, 2, 4, 6, 9, 11, 14, 18, 21]);
    expect(getLevelThresholds(18)).toEqual([1, 2, 3, 5, 7, 10, 12, 15, 18]);
    expect(getLevelThresholds(22)).toEqual([1, 2, 4, 7, 9, 12, 15, 18, 22]);
    for (const total of [9, 10, 18, 21, 22, 30, 60]) {
      const thresholds = getLevelThresholds(total);
      expect(thresholds[0]).toBe(1);
      expect(thresholds.at(-1)).toBe(total);
      thresholds.slice(1).forEach((needed, index) => expect(needed).toBeGreaterThan(thresholds[index]));
    }
  });

  it("reaches every level exactly at its threshold and the last only at completion", () => {
    const thresholds = [0, ...getLevelThresholds(30)];
    thresholds.forEach((count, level) => {
      const progress = getRoomProgress("era-1", collection, ids(collection, count));
      expect(progress.level).toBe(level);
      expect(progress.nextLevelAt).toBe(level === 9 ? null : thresholds[level + 1]);
      expect(progress.isComplete).toBe(level === 9);
      if (count) expect(getRoomProgress("era-1", collection, ids(collection, count - 1)).level).toBe(level - 1);
    });
  });

  it("counts paintings outside the five wall positions and ignores duplicate, unknown and other-era completions", () => {
    const extra = { id: "other-era", eraId: "era-2" as const };
    const progress = getRoomProgress("era-1", [...collection, extra, collection[0]], [collection[29].id, collection[29].id, "other-era", "unknown"]);
    expect(progress).toMatchObject({ totalCount: 30, completedCount: 1, level: 1, isComplete: false });
  });

  it("handles small collections, reset and empty collections", () => {
    const demo = collection.slice(0, 5);
    expect(Array.from({ length: 6 }, (_, count) => getRoomProgress("era-1", demo, ids(demo, count)).level)).toEqual([0, 1, 2, 3, 4, 9]);
    expect(getRoomProgress("era-1", demo, []).level).toBe(0);
    expect(getRoomProgress("era-1", demo.slice(0, 1), [demo[0].id])).toMatchObject({ level: 9, isComplete: true });
    expect(getRoomProgress("era-4", demo, []).isComplete).toBe(false);
    expect(getRoomProgress("era-4", [], []).level).toBe(0);
  });
});

describe("era access", () => {
  const eraIds: EraId[] = ["era-1", "era-2", "era-3", "era-4"];
  const first = paintings("era-1", 21), second = paintings("era-2", 18), third = paintings("era-3", 22);
  const all = [...first, ...second, ...third, ...paintings("era-4", 22)];

  it("opens only the first era at the start and says how many paintings open the next", () => {
    const access = getEraAccess(eraIds, all, []);
    expect(access["era-1"]).toEqual({ unlocked: true, remaining: 0 });
    expect(access["era-2"]).toEqual({ unlocked: false, requiredEraId: "era-1", remaining: getLevelThresholds(21)[ERA_UNLOCK_LEVEL - 1] });
    expect(access["era-3"].unlocked).toBe(false);
  });

  it(`opens the next era at level ${ERA_UNLOCK_LEVEL} of the previous one, one era at a time`, () => {
    const needed = getLevelThresholds(21)[ERA_UNLOCK_LEVEL - 1];
    expect(getEraAccess(eraIds, all, ids(first, needed - 1))["era-2"]).toMatchObject({ unlocked: false, remaining: 1 });
    const opened = getEraAccess(eraIds, all, ids(first, needed));
    expect(opened["era-2"]).toMatchObject({ unlocked: true, remaining: 0 });
    expect(opened["era-3"]).toMatchObject({ unlocked: false, requiredEraId: "era-2" });
    const progressed = [...ids(first, needed), ...ids(second, getLevelThresholds(18)[ERA_UNLOCK_LEVEL - 1])];
    expect(getEraAccess(eraIds, all, progressed)["era-3"].unlocked).toBe(true);
  });

  it("keeps an era closed while the era before it is closed, even with progress there", () => {
    const access = getEraAccess(eraIds, all, ids(second, 18));
    expect(access["era-2"].unlocked).toBe(false);
    expect(access["era-3"]).toMatchObject({ unlocked: false, remaining: 0 });
  });
});
