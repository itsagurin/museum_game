export interface ColoringArtwork {
  id: string;
  title: string;
  artist: string;
  year: string;
  original_image_url: string;
  grid: { width: number; height: number; data: number[][] };
  palette: { id: number; hex: string; name: string }[];
  cultural_data: { trivia: string; historical_context: string };
}

/** Validate the JSON boundary before generating any SVG paths. */
export function parseColoringArtwork(value: unknown): ColoringArtwork {
  const fail = (): never => { throw new Error('Nie udało się odczytać danych obrazu.'); };
  if (!value || typeof value !== 'object') return fail();
  const art = value as ColoringArtwork;
  if (![art.id, art.title, art.artist, art.year, art.original_image_url].every(item => typeof item === 'string' && item.trim().length > 0)) return fail();
  if (!/^(https?:\/\/|\/(?!\/))/.test(art.original_image_url)) return fail();
  const grid = art.grid;
  if (!grid || !Number.isInteger(grid.width) || !Number.isInteger(grid.height) || grid.width < 1 || grid.height < 1 || grid.width > 128 || grid.height > 128) return fail();
  if (!Array.isArray(art.palette) || !art.palette.length || art.palette.some(color => !color || !Number.isInteger(color.id) || !/^#[0-9a-f]{6}$/i.test(color.hex) || typeof color.name !== 'string')) return fail();
  const ids = new Set(art.palette.map(color => color.id));
  if (ids.size !== art.palette.length || !Array.isArray(grid.data) || grid.data.length !== grid.height || grid.data.some(row => !Array.isArray(row) || row.length !== grid.width || row.some(id => !ids.has(id)))) return fail();
  if (!art.cultural_data || typeof art.cultural_data.trivia !== 'string' || typeof art.cultural_data.historical_context !== 'string') return fail();
  return art;
}

export interface ColoringRegion {
  id: number;
  colorId: number;
  path: string;
  outline: string;
  center: { x: number; y: number };
  cells: number;
  cellIndices: number[];
}

/** Four-connected components: disconnected patches of the same color stay independent. */
export function buildRegions(grid: ColoringArtwork['grid'], minimumPerColor = 1): ColoringRegion[] {
  const { width, height, data } = grid;
  const visited = new Uint8Array(width * height);
  const regions: ColoringRegion[] = [];
  for (let start = 0; start < visited.length; start++) {
    if (visited[start]) continue;
    const colorId = data[Math.floor(start / width)][start % width];
    const queue = [start];
    visited[start] = 1;
    for (let i = 0; i < queue.length; i++) {
      const cell = queue[i], x = cell % width, y = Math.floor(cell / width);
      for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const next = ny * width + nx;
        if (!visited[next] && data[ny][nx] === colorId) { visited[next] = 1; queue.push(next); }
      }
    }
    regions.push(regionFromCells(queue, colorId, width, height, regions.length));
  }
  // Large connected color patches can contain several separately numbered fields.
  // Split along connected flood fronts, retaining the palette id on both sides.
  for (const colorId of new Set(data.flat())) {
    while (regions.filter(region => region.colorId === colorId).length < minimumPerColor) {
      const largest = regions.filter(region => region.colorId === colorId && region.cells > 1).sort((a, b) => b.cells - a.cells)[0];
      if (!largest) break;
      const allowed = new Set(largest.cellIndices);
      const seed = largest.cellIndices[0];
      const farthest = largest.cellIndices.reduce((best, cell) => {
        const distance = (n: number) => (n % width - seed % width) ** 2 + (Math.floor(n / width) - Math.floor(seed / width)) ** 2;
        return distance(cell) > distance(best) ? cell : best;
      });
      const labels = new Map<number, number>([[seed, 0], [farthest, 1]]);
      const fronts = [seed, farthest];
      const parts: number[][] = [[], []];
      for (let i = 0; i < fronts.length; i++) {
        const cell = fronts[i], side = labels.get(cell)!;
        parts[side].push(cell);
        const x = cell % width, y = Math.floor(cell / width);
        for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          const next = ny * width + nx;
          if (allowed.has(next) && !labels.has(next)) { labels.set(next, side); fronts.push(next); }
        }
      }
      regions.splice(regions.indexOf(largest), 1, ...parts.map(part => regionFromCells(part, colorId, width, height, 0)));
    }
  }
  return regions.map((region, id) => ({ ...region, id }));
}

function regionFromCells(queue: number[], colorId: number, width: number, height: number, id: number): ColoringRegion {
    const cells = new Set(queue);
    let path = '', outline = '', sumX = 0, sumY = 0;
    for (const cell of queue) {
      const x = cell % width, y = Math.floor(cell / width);
      path += `M${x},${y}h1v1h-1Z`;
      if (y === 0 || !cells.has(cell - width)) outline += `M${x},${y}h1`;
      if (x === width - 1 || !cells.has(cell + 1)) outline += `M${x + 1},${y}v1`;
      if (y === height - 1 || !cells.has(cell + width)) outline += `M${x + 1},${y + 1}h-1`;
      if (x === 0 || !cells.has(cell - 1)) outline += `M${x},${y + 1}v-1`;
      sumX += x + .5; sumY += y + .5;
    }
    const meanX = sumX / queue.length, meanY = sumY / queue.length;
    const centerCell = queue.reduce((best, cell) => {
      const distance = (n: number) => (n % width + .5 - meanX) ** 2 + (Math.floor(n / width) + .5 - meanY) ** 2;
      return distance(cell) < distance(best) ? cell : best;
    });
    return { id, colorId, path, outline, cells: queue.length, cellIndices: queue, center: { x: centerCell % width + .5, y: Math.floor(centerCell / width) + .5 } };
}

export function paintResult(regionColor: number, selectedColor: number | null, alreadyPainted: boolean): 'correct' | 'wrong' | 'ignored' {
  return alreadyPainted ? 'ignored' : regionColor === selectedColor ? 'correct' : 'wrong';
}
