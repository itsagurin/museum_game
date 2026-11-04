import type { ColoringBoard } from "./coloring";

/** One background path per palette entry; hit targets remain individual accessible cells. */
export function coloringPaths(grid: ColoringBoard["grid"]) {
  const paths = new Map<number, string>();
  grid.data.forEach((row, y) => row.forEach((id, x) => {
    paths.set(id, (paths.get(id) ?? "") + `M${x} ${y}h1v1h-1z`);
  }));
  return [...paths].map(([id, d]) => ({ id, d }));
}
