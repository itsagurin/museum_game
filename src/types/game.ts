export type Language = "pl" | "en";
export type Localized = Record<Language, string>;
export type EraId = "era-1" | "era-2" | "era-3" | "era-4";
export type View = "home" | "hall" | EraId;
export interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface ArtworkPlacement extends Region {
  rotation: number;
  wall: "left" | "right";
}
export interface Era {
  id: EraId;
  numeral: string;
  name: Localized;
  period: Localized;
  description: Localized;
  image: string;
  accent: string;
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
  placement: ArtworkPlacement;
}
export interface RestoreArtworkRequest {
  artwork: Artwork;
  era: Era;
  language: Language;
  onComplete: () => void;
  onClose: () => void;
}
