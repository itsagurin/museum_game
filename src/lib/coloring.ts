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

export type ColoringBoard = Pick<ColoringArtwork, 'grid' | 'palette'>;

/**
 * Validate a generated board (tools/pixel-engine, schema version 2) before drawing it.
 * Titles, stories and the reproduction come from the content manifest, not the board.
 */
export function parseColoringBoard(value: unknown): ColoringBoard {
  const fail = (): never => { throw new Error('Nie udało się odczytać danych obrazu.'); };
  if (!value || typeof value !== 'object') return fail();
  const board = value as ColoringBoard;
  const grid = board.grid;
  if (!grid || !Number.isInteger(grid.width) || !Number.isInteger(grid.height) || grid.width < 1 || grid.height < 1 || grid.width > 128 || grid.height > 128) return fail();
  if (!Array.isArray(board.palette) || !board.palette.length || board.palette.some(color => !color || !Number.isInteger(color.id) || !/^#[0-9a-f]{6}$/i.test(color.hex) || typeof color.name !== 'string')) return fail();
  const ids = new Set(board.palette.map(color => color.id));
  if (ids.size !== board.palette.length || !Array.isArray(grid.data) || grid.data.length !== grid.height || grid.data.some(row => !Array.isArray(row) || row.length !== grid.width || row.some(id => !ids.has(id)))) return fail();
  return { grid, palette: board.palette };
}

export function paintResult(regionColor: number, selectedColor: number | null, alreadyPainted: boolean): 'correct' | 'wrong' | 'ignored' {
  return alreadyPainted ? 'ignored' : regionColor === selectedColor ? 'correct' : 'wrong';
}
