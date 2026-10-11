import { parseColoringArtwork, type ColoringArtwork } from "../lib/coloring";
import type { Artwork } from "@/types/game";

/** Load only the chosen grid; preserve the algorithm's cells and palette IDs. */
export async function loadColoringArtwork(artwork: Artwork, signal?: AbortSignal): Promise<ColoringArtwork> {
  if (!artwork.coloringSource || !artwork.coloringArtworkId || !artwork.originalImage) {
    throw new Error("Missing coloring export");
  }
  const response = await fetch(artwork.coloringSource, { signal });
  if (!response.ok) throw new Error("Could not load coloring export");
  const painting = parseColoringArtwork(await response.json());
  return {
    ...painting,
    id: artwork.coloringArtworkId,
    title: artwork.title.pl,
    original_image_url: artwork.originalImage,
    // Use the supplied catalog metadata rather than the grid's placeholders.
    artist: artwork.artist ?? "",
    year: artwork.year ?? "",
    cultural_data: {
      trivia: artwork.funFact?.pl ?? "",
      historical_context: artwork.story?.pl ?? "",
    },
  };
}
