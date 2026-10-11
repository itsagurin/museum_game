import type { Artwork, EraId } from "../types/game";

export const ROOM_LEVEL_COUNT = 10;
export const MAX_ROOM_LEVEL = ROOM_LEVEL_COUNT - 1;

export function getRoomProgress(
  eraId: EraId,
  collection: Pick<Artwork, "id" | "eraId">[],
  completedArtworkIds: string[],
) {
  const collectionIds = new Set(collection.filter((artwork) => artwork.eraId === eraId).map((artwork) => artwork.id));
  const completedIds = new Set(completedArtworkIds);
  const totalCount = collectionIds.size;
  const completedCount = [...collectionIds].filter((id) => completedIds.has(id)).length;
  const level = totalCount ? Math.floor(completedCount * MAX_ROOM_LEVEL / totalCount) : 0;
  return {
    level,
    totalCount,
    completedCount,
    isComplete: totalCount > 0 && completedCount === totalCount,
    nextLevelAt: totalCount > 0 && level < MAX_ROOM_LEVEL
      ? Math.ceil((level + 1) * totalCount / MAX_ROOM_LEVEL)
      : null,
  };
}
