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

/** Prefer earned levels, descending; never show a future decoration early. */
export function getRoomBackgroundCandidates(baseImage: string, level: number, files: readonly string[]) {
  const prefix = baseImage.replace(/\.(jpg|jpeg|png|webp)$/i, "");
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^${escapedPrefix}_level([0-9])\\.(webp|png|jpg|jpeg)$`, "i");
  const earnedLevel = Math.max(0, Math.min(MAX_ROOM_LEVEL, Math.floor(Number.isFinite(level) ? level : 0)));
  const available = files.flatMap((file) => {
    const match = file.match(pattern);
    return match && Number(match[1]) <= earnedLevel ? [{ file, level: Number(match[1]) }] : [];
  }).sort((a, b) => b.level - a.level || a.file.localeCompare(b.file));
  const legacy = files.find((file) => file === baseImage)
    ?? files.find((file) => new RegExp(`^${escapedPrefix}\\.(jpg|jpeg|png|webp)$`, "i").test(file))
    ?? baseImage;
  return [...available.map(({ file }) => file), legacy];
}
