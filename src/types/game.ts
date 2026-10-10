export type Language = "pl" | "en";
export type Localized = Record<Language, string>;
export type EraId = "era-1" | "era-2" | "era-3" | "era-4";
export type View = "home" | "hall" | "library" | EraId;
export interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface ArtworkPlacement extends Region {
  wall: "left" | "right";
}
export interface VanishingPoint {
  /** Percentages of the full illustration; x can lie outside the image. */
  x: number;
  y: number;
}
export interface Era {
  id: EraId;
  numeral: string;
  name: Localized;
  period: Localized;
  description: Localized;
  image: string;
  collectionFolder: string;
  accent: string;
  wallPerspective: Record<ArtworkPlacement["wall"], VanishingPoint>;
  doors: { previous: Region; next: Region };
}
export interface Artwork {
  id: string;
  eraId: EraId;
  number: number;
  title: Localized;
  story?: Localized;
  funFact?: Localized;
  originalImage?: string;
  coloringArtworkId?: string;
  sourceFile?: string;
}
/** Five wall positions are separate from the era's complete artwork collection. */
export interface ArtworkSlot {
  id: string;
  eraId: EraId;
  number: number;
  initialArtworkId: string;
  placement: ArtworkPlacement;
}
export interface RestoreArtworkRequest {
  artwork: Artwork;
  era: Era;
  language: Language;
  onComplete: () => void;
  onClose: () => void;
}
