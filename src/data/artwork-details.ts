import manifest from "../../content/artworks.json" with { type: "json" };
import type { ContentEntry } from "@/types/content";
import type { Artwork, Localized } from "@/types/game";

const localized = (text: Localized): Localized => ({ pl: text.pl, en: text.en || text.pl });

/** Kept in a separate chunk: descriptions are needed when a story opens. Credits also stay in the initial catalogue. */
export function getArtworkText(id: string) {
  const entry = (manifest as ContentEntry[]).find(entry => entry.id === id);
  if (!entry) return undefined;
  return { style: localized(entry.style), story: localized(entry.story), funFact: localized(entry.curiosity), source: entry.source ?? undefined, untranslated: !entry.story.en || !entry.curiosity.en };
}
export function getArtworkDetails(artwork: Artwork): Artwork {
  const text = getArtworkText(artwork.id);
  return text ? { ...artwork, ...text } : artwork;
}
