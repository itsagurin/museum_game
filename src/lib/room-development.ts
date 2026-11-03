import type { Artwork, EraId } from "../types/game";

export const ROOM_LEVEL_COUNT = 10;
export const MAX_ROOM_LEVEL = ROOM_LEVEL_COUNT - 1;
/** Reaching this level in an era opens the next one. */
export const ERA_UNLOCK_LEVEL = 3;
// Early levels arrive after one or two paintings; later ones need progressively more.
const LEVEL_CURVE = 1.5;

/** Completed paintings needed for levels 1–9; the last level always needs the whole collection. */
export function getLevelThresholds(totalCount: number): number[] {
  const thresholds: number[] = [];
  if (totalCount <= 0) return thresholds;
  for (let level = 1; level <= MAX_ROOM_LEVEL; level++) {
    // The very first painting always furnishes the room.
    const ideal = level === 1 ? 1 : Math.round(totalCount * (level / MAX_ROOM_LEVEL) ** LEVEL_CURVE);
    // Each level needs one more painting than the last while enough paintings remain for the rest.
    const lowest = Math.min((thresholds.at(-1) ?? 0) + 1, totalCount);
    const highest = Math.max(totalCount - (MAX_ROOM_LEVEL - level), lowest);
    thresholds.push(Math.min(Math.max(ideal, lowest), highest));
  }
  return thresholds;
}

export function getRoomProgress(
  eraId: EraId,
  collection: Pick<Artwork, "id" | "eraId">[],
  completedArtworkIds: string[],
) {
  const collectionIds = new Set(collection.filter((artwork) => artwork.eraId === eraId).map((artwork) => artwork.id));
  const completedIds = new Set(completedArtworkIds);
  const totalCount = collectionIds.size;
  const completedCount = [...collectionIds].filter((id) => completedIds.has(id)).length;
  const thresholds = getLevelThresholds(totalCount);
  const level = thresholds.filter((needed) => needed <= completedCount).length;
  return {
    level,
    totalCount,
    completedCount,
    isComplete: totalCount > 0 && completedCount === totalCount,
    nextLevelAt: thresholds[level] ?? null,
    /** Paintings needed in this era before the next era opens; 0 once it has. */
    remainingToUnlockNext: Math.max(0, (thresholds[ERA_UNLOCK_LEVEL - 1] ?? Infinity) - completedCount),
  };
}

export interface EraAccess {
  unlocked: boolean;
  /** The era whose progress opens this one. */
  requiredEraId?: EraId;
  /** Paintings still needed in the required era. */
  remaining: number;
}

/** The first era is always open; each next one needs ERA_UNLOCK_LEVEL in the open era before it. */
export function getEraAccess(
  eraIds: readonly EraId[],
  collection: Pick<Artwork, "id" | "eraId">[],
  completedArtworkIds: string[],
): Record<EraId, EraAccess> {
  const access = {} as Record<EraId, EraAccess>;
  eraIds.forEach((eraId, index) => {
    if (index === 0) {
      access[eraId] = { unlocked: true, remaining: 0 };
      return;
    }
    const requiredEraId = eraIds[index - 1];
    const required = getRoomProgress(requiredEraId, collection, completedArtworkIds);
    const requiredOpen = access[requiredEraId].unlocked;
    access[eraId] = {
      unlocked: requiredOpen && required.remainingToUnlockNext === 0,
      requiredEraId,
      // While the required era is itself closed, opening it comes first.
      remaining: requiredOpen && Number.isFinite(required.remainingToUnlockNext) ? required.remainingToUnlockNext : 0,
    };
  });
  return access;
}
