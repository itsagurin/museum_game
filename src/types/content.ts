import type { EraId, Localized } from "./game";

/** Where a reproduction comes from and on what terms it may be shown. */
export interface ArtworkSource {
  /** Page describing the reproduction (e.g. a Wikimedia Commons file page). */
  url: string;
  title: string;
  institution?: string;
  license: string;
  licenseUrl?: string;
  /** Photographer of the reproduction, when the licence requires attribution (e.g. CC BY-SA). */
  author?: string;
  /** How the match was established: compared image hashes, or found by title only. */
  match: "image" | "title";
  retrieved: string;
}

/** One entry of content/artworks.json, the single source of truth for the collection. */
export interface ContentEntry {
  /** Stable slug; never derived from file names again. */
  id: string;
  /** Earlier save identities, mapped to `id` when an old save loads. */
  legacyIds: string[];
  era: EraId;
  /** Position in the era; the first five hang on the walls at the start. */
  order: number;
  /** Paths under img/. */
  image: string;
  puzzle: string;
  introPuzzle?: string;
  introPuzzleVersion?: string;
  puzzleVersion: string;
  preview: string;
  title: Localized;
  artist: string;
  year: string;
  style: Localized;
  story: Localized;
  curiosity: Localized;
  source: ArtworkSource | null;
  review: {
    content: "unverified" | "verified";
    translation: "missing" | "draft" | "reviewed";
  };
}
