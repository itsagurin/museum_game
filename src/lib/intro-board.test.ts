import { expect, it } from "vitest";
import { artworks } from "@/data/eras";
import { usesIntroBoard } from "./intro-board";

it("selects the same board before loading code and when resuming a saved studio", () => {
  const first = artworks[0];
  expect(usesIntroBoard(first, 0, false)).toBe(true);
  expect(usesIntroBoard(first, 0, true)).toBe(false);
  expect(usesIntroBoard(first, 0, false, first.puzzleVersion)).toBe(false);
  expect(usesIntroBoard(first, 0, true, first.introPuzzleVersion)).toBe(true);
  expect(usesIntroBoard(first, 1, false, first.introPuzzleVersion)).toBe(false);
  expect(usesIntroBoard(artworks[1], 0, false)).toBe(false);
});
