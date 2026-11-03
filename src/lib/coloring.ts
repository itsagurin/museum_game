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

export function paintResult(regionColor: number, selectedColor: number | null, alreadyPainted: boolean): 'correct' | 'wrong' | 'ignored' {
  return alreadyPainted ? 'ignored' : regionColor === selectedColor ? 'correct' : 'wrong';
}
