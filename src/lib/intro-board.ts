import type { Artwork } from "@/types/game";

/** A saved full board takes priority; a started intro remains resumable after the tips close. */
export function usesIntroBoard(artwork: Artwork, completedCount: number, tutorialSeen: boolean, signature?: string) {
  return Boolean(artwork.introPuzzle && completedCount === 0 && (!tutorialSeen || signature === artwork.introPuzzleVersion) && (!signature || signature !== artwork.puzzleVersion));
}
