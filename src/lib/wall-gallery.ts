import type { Artwork, ArtworkSlot } from "../types/game";

type CollectionItem = Pick<Artwork, "id" | "eraId">;
export type WallAssignments = Record<string, string>;

/** Recover valid, unique paintings per era without trusting persisted storage. */
export function normalizeWallAssignments(value: unknown, slots: readonly ArtworkSlot[], collection: readonly CollectionItem[]): WallAssignments {
  const saved = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const result: WallAssignments = {};
  const used = new Set<string>();
  for (const slot of slots) {
    const id = saved[slot.id];
    if (typeof id === "string" && !used.has(id) && collection.some((artwork) => artwork.id === id && artwork.eraId === slot.eraId)) {
      result[slot.id] = id;
      used.add(id);
    }
  }
  for (const slot of slots) {
    if (result[slot.id]) continue;
    const available = collection.filter((artwork) => artwork.eraId === slot.eraId && !used.has(artwork.id));
    const artwork = available.find((artwork) => artwork.id === slot.initialArtworkId) ?? available[0];
    if (artwork) {
      result[slot.id] = artwork.id;
      used.add(artwork.id);
    }
  }
  return result;
}

/** Selecting a painting already on this wall swaps the two positions. */
export function placeWallArtwork(slotId: string, artworkId: string, slots: readonly ArtworkSlot[], collection: readonly CollectionItem[], assignments: WallAssignments): WallAssignments {
  const target = slots.find((slot) => slot.id === slotId);
  const artwork = collection.find((item) => item.id === artworkId);
  if (!target || !artwork || target.eraId !== artwork.eraId) return assignments;
  const current = normalizeWallAssignments(assignments, slots, collection);
  if (current[slotId] === artworkId) return assignments;
  const previousSlot = slots.find((slot) => slot.eraId === target.eraId && current[slot.id] === artworkId);
  if (previousSlot) current[previousSlot.id] = current[slotId];
  return { ...current, [slotId]: artworkId };
}
