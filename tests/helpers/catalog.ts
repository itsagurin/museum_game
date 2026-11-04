import { artworks as summaries } from "../../src/data/eras";
import { getArtworkDetails } from "../../src/data/artwork-details";

// Browser loads descriptions on demand; assertions use the complete authoritative texts.
export const artworks = summaries.map(getArtworkDetails);
