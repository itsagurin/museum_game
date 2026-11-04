import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import panoramaSignatures from "./panorama-board-signatures.json" with { type: "json" };
import phase2Signatures from "./phase2-board-signatures.json" with { type: "json" };
import { eras } from "./eras";
import content from "../../content/artworks.json" with { type: "json" };
import { gridSignature } from "../lib/painting-progress";
import { parseColoringBoard } from "../lib/coloring";

// `npm run content:validate` runs this file; CI runs it with the other unit tests.
describe("content/artworks.json", () => {
  it("gives every artwork a unique slug and a consecutive position in its era", () => {
    expect(new Set(content.map(({ id }) => id)).size).toBe(content.length);
    for (const entry of content) expect(entry.id, entry.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    for (const era of eras) {
      const orders = content.filter((entry) => entry.era === era.id).map(({ order }) => order).sort((a, b) => a - b);
      expect(orders.length, era.id).toBeGreaterThanOrEqual(5);
      expect(orders).toEqual(orders.map((_, index) => index + 1));
    }
  });

  it("points to an existing reproduction, a playable board and its preview", () => {
    for (const entry of content) {
      expect(entry.image.startsWith(`${eras.find((era) => era.id === entry.era)!.collectionFolder}/`), entry.id).toBe(true);
      for (const path of [entry.image, entry.puzzle, entry.preview]) expect(existsSync(`img/${path}`), path).toBe(true);
      const board = parseColoringBoard(JSON.parse(readFileSync(`img/${entry.puzzle}`, "utf8")));
      expect(Math.max(board.grid.width, board.grid.height), entry.id).toBeLessThanOrEqual(48);
      expect(board.palette.length, entry.id).toBeGreaterThanOrEqual(2);
      expect(board.palette.length, entry.id).toBeLessThanOrEqual(10);
      expect(entry.puzzleVersion, entry.id).toBe(gridSignature(board));
      expect(gridSignature(board), entry.id).toBe(({...phase2Signatures,...panoramaSignatures} as Record<string,string>)[entry.id]);
      expect(new Set(board.palette.map(color => color.name)).size, entry.id).toBe(board.palette.length);
      expect(new Set(board.palette.map(color => color.nameEn)).size, entry.id).toBe(board.palette.length);
      for (const color of board.palette) expect(color.nameEn?.trim(), entry.id).toBeTruthy();
      if (entry.introPuzzle) {
        const intro = parseColoringBoard(JSON.parse(readFileSync(`img/${entry.introPuzzle}`, "utf8")));
        expect(Math.max(intro.grid.width,intro.grid.height),entry.id).toBe(16);
        expect(entry.era).toBe("era-1");
        expect(entry.order).toBe(1);
        expect(entry.introPuzzleVersion).toBe(gridSignature(intro));
      }
      const used = new Set(board.grid.data.flat());
      for (const color of board.palette) expect(used.has(color.id), `${entry.id} colour ${color.id}`).toBe(true);
    }
  });

  it("has the Polish texts and a consistent translation status", () => {
    for (const entry of content) {
      for (const field of [entry.title, entry.style, entry.story, entry.curiosity]) expect(field.pl.trim(), entry.id).not.toBe("");
      expect(entry.artist.trim(), entry.id).not.toBe("");
      expect(entry.year.trim(), entry.id).not.toBe("");
      expect(["unverified", "verified"],entry.id).toContain(entry.review.content);
      expect(["missing", "draft", "reviewed"],entry.id).toContain(entry.review.translation);
      const translated = [entry.title, entry.style, entry.story, entry.curiosity].every((field) => field.en.trim());
      expect(translated, `${entry.id}: translation ${entry.review.translation}`).toBe(entry.review.translation !== "missing");
    }
  });
});

describe("reproduction sources", () => {
  const publicDomain = /^(public domain|pd|cc0)/i;

  it("records a source page, licence and match method for every matched reproduction", () => {
    for (const entry of content.filter(({ source }) => source)) {
      const source = entry.source!;
      expect(source.url, entry.id).toMatch(/^https:\/\//);
      expect(source.title.trim(), entry.id).not.toBe("");
      expect(source.license.trim(), entry.id).not.toBe("");
      expect(["image", "title"], entry.id).toContain(source.match);
      expect(source.retrieved, entry.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      // Anything outside the public domain must name who to credit.
      if (!publicDomain.test(source.license)) expect(source.author?.trim(), `${entry.id}: ${source.license}`).toBeTruthy();
    }
  });

  it("leaves unmatched reproductions unverified for the content review", () => {
    for (const entry of content.filter(({ source }) => !source)) expect(entry.review.content, entry.id).toBe("unverified");
  });
});
