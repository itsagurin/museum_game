import type { ColoringArtwork } from "./coloring";

/** Painted cells as a bitset in base64: a 32×32 board takes 128 bytes (172 characters). */
export function encodeCells(cellIds: Iterable<number>, total: number): string {
  const bytes = new Uint8Array(Math.ceil(total / 8));
  for (const id of cellIds) {
    if (Number.isInteger(id) && id >= 0 && id < total) bytes[id >> 3] |= 1 << (id & 7);
  }
  return btoa(String.fromCharCode(...bytes));
}

/** Returns no cells for anything that is not a bitset of this board size. */
export function decodeCells(encoded: string, total: number): number[] {
  let binary: string;
  try {
    binary = atob(encoded);
  } catch {
    return [];
  }
  if (binary.length !== Math.ceil(total / 8)) return [];
  const cells: number[] = [];
  for (let id = 0; id < total; id++) {
    if (binary.charCodeAt(id >> 3) & (1 << (id & 7))) cells.push(id);
  }
  return cells;
}

/** FNV-1a over the board, so saved cells never apply to a regenerated grid or palette. */
export function gridSignature({ grid, palette }: Pick<ColoringArtwork, "grid" | "palette">): string {
  let hash = 0x811c9dc5;
  const mix = (value: number) => {
    hash ^= value;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  };
  mix(grid.width);
  mix(grid.height);
  for (const row of grid.data) for (const id of row) mix(id);
  for (const color of palette) {
    mix(color.id);
    mix(parseInt(color.hex.slice(1), 16));
  }
  return hash.toString(36);
}
