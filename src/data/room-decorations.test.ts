import { describe, expect, it } from "vitest";
import manifest from "./asset-manifest.json";
import { eras } from "./eras";
import { getDecorationBounds, getDecorationGeometry, getDecorationImageRegion, getNewDecorations, getRoomArtworkPlacement, getRoomDecorations, roomDecorations } from "./room-decorations";
import type { Region } from "../types/game";

const overlaps = (a: Region, b: Region) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
describe("earned furniture and its interaction geometry", () => {
  it("covers every supplied decoration, excludes empty frames, and never mixes eras", () => {
    const files = manifest.filter((file) => /^(oswiecenie|romantyzm|pozytywizm|mloda_polska)_assets\/.*\.png$/.test(file) && !/\/1[234]-rama-/.test(file));
    expect(roomDecorations.map(({ image }) => image).sort()).toEqual(files.sort());
    expect(new Set(roomDecorations.map(({ id }) => id)).size).toBe(files.length);
    for (const era of eras) {
      expect(getRoomDecorations(era.id, 0)).toEqual([]);
      expect(getRoomDecorations(era.id, NaN)).toEqual([]);
      expect(getRoomDecorations(era.id, 9).every(({ eraId }) => eraId === era.id)).toBe(true);
      for (let level = 1; level <= 9; level++) expect(getNewDecorations(era.id, level - 1, level).length).toBeGreaterThan(0);
      expect(getNewDecorations(era.id, 9, 9)).toEqual([]);
    }
  });
  it("never unlocks a tabletop object before its support and retains PNG proportions", () => {
    for (const item of roomDecorations) {
      if (item.supportId) {
        const support = roomDecorations.find(({ id }) => id === item.supportId)!;
        expect(support.eraId).toBe(item.eraId); expect(support.level).toBeLessThanOrEqual(item.level);
      }
      const geometry = getDecorationGeometry(item), region = getDecorationImageRegion(item);
      expect(geometry.hitPath).not.toBe("");
      expect(region.width * 896 / (region.height * 1200)).toBeCloseTo(geometry.width / geometry.height, 4);
      for (const language of ["pl", "en"] as const) {
        expect(item.name[language].length).toBeGreaterThan(2);
        expect(item.fact[language].length).toBeGreaterThan(10);
        expect(item.reason[language].length).toBeGreaterThan(10);
      }
      expect(item.source.url).toMatch(/^https:\/\//);
    }
  });
  it("keeps five paintings clear of furniture and both doors throughout development", () => {
    for (const era of eras) for (let level = 0; level <= 9; level++) {
      const positions = [1, 2, 3, 4, 5].map((number) => getRoomArtworkPlacement(era.id, number, level));
      for (const position of positions) {
        expect(overlaps(position, era.doors.previous)).toBe(false);
        expect(overlaps(position, era.doors.next)).toBe(false);
        for (const item of getRoomDecorations(era.id, level)) expect(overlaps({ ...position, height: position.height + 4 }, getDecorationBounds(item)), `${era.id}, level ${level}, ${item.id}`).toBe(false);
        for (const other of positions) if (position !== other) expect(overlaps(position, other)).toBe(false);
      }
    }
  });
});
