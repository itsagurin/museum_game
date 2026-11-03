import { describe, expect, it } from "vitest";
import { decodeCells, encodeCells, gridSignature } from "./painting-progress";

const board = {
  grid: { width: 3, height: 2, data: [[1, 1, 2], [2, 1, 2]] },
  palette: [{ id: 1, hex: "#7A141A", name: "Czerwień" }, { id: 2, hex: "#1F1A24", name: "Cień" }],
};

describe("painting progress bitset", () => {
  it("round-trips painted cells of a 32×32 board in 172 characters", () => {
    const cells = [0, 1, 7, 8, 511, 1000, 1023];
    const encoded = encodeCells(cells, 1024);
    expect(encoded).toHaveLength(172);
    expect(decodeCells(encoded, 1024)).toEqual(cells);
    expect(decodeCells(encodeCells([], 1024), 1024)).toEqual([]);
    const full = Array.from({ length: 1024 }, (_, id) => id);
    expect(decodeCells(encodeCells(full, 1024), 1024)).toEqual(full);
  });

  it("ignores duplicates and ids outside the board", () => {
    expect(decodeCells(encodeCells([3, 3, -1, 6, 1.5, 99], 6), 6)).toEqual([3]);
  });

  it("rejects corrupted data and bitsets of another board size", () => {
    expect(decodeCells("not base64!", 1024)).toEqual([]);
    expect(decodeCells(encodeCells([1, 2], 64), 1024)).toEqual([]);
  });
});

describe("grid signature", () => {
  it("is stable for the same board and changes with the grid or palette", () => {
    expect(gridSignature(board)).toBe(gridSignature(structuredClone(board)));
    expect(gridSignature({ ...board, grid: { ...board.grid, data: [[1, 1, 2], [2, 2, 2]] } })).not.toBe(gridSignature(board));
    expect(gridSignature({ ...board, palette: [board.palette[0], { ...board.palette[1], hex: "#1F1A25" }] })).not.toBe(gridSignature(board));
  });
});
