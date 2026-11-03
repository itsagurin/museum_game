"use client";
import { artworks, content, eras, getEra } from "@/data/eras";
import { getEraAccess, getRoomProgress } from "@/lib/room-development";
import { getNewDecorations } from "@/data/room-decorations";
import { getBadges } from "@/lib/badges";
import { useGameStore } from "@/store/useGameStore";
import type { Artwork, EraId, Language, RestoreArtworkRequest } from "@/types/game";
import type { Milestone } from "@/components/ProgressNotices";
import type { Panel } from "../shell/panels";
const eraIds = eras.map(era => era.id);

export function useArtworkRestoration({language, exploreAll, closePanel, setPanel, isEraOpen, onRestoreArtwork, addRewards, addMilestones}: {
  language: Language; exploreAll: boolean; closePanel: () => void; setPanel: (panel: Panel) => void;
  isEraOpen: (id: EraId) => boolean; onRestoreArtwork?: (request: RestoreArtworkRequest) => void;
  addRewards: (eraId: EraId, ids: string[]) => void; addMilestones: (milestones: Milestone[]) => void;
}) {
  const completeArtwork = useGameStore(state => state.completeArtwork);
  const restoreArtwork = (artwork: Artwork) => {
    closePanel();
    if (!isEraOpen(artwork.eraId)) {
      setPanel({ type: "locked", eraId: artwork.eraId });
      return;
    }
    if (onRestoreArtwork && artwork.coloringArtworkId)
      onRestoreArtwork({
        artwork,
        era: getEra(artwork.eraId),
        language,
        onComplete: () => {
          const completedBefore = useGameStore.getState().completedArtworkIds;
          const before = getRoomProgress(artwork.eraId, artworks, completedBefore);
          const accessBefore = getEraAccess(eraIds, artworks, completedBefore);
          completeArtwork(artwork.id);
          useGameStore.getState().recordDailyCompletion(artwork.id);
          const completedAfter = useGameStore.getState().completedArtworkIds;
          const after = getRoomProgress(artwork.eraId, artworks, completedAfter);
          const accessAfter = getEraAccess(eraIds, artworks, completedAfter);
          const newObjects = getNewDecorations(artwork.eraId, before.level, after.level).map(({ id }) => id);
          addRewards(artwork.eraId, newObjects);
          // Shown one by one after the story; the progress itself is already saved.
          const reached: Milestone[] = [];
          if (!before.isComplete && after.isComplete) {
            const finale = eraIds.every((eraId) => getRoomProgress(eraId, artworks, completedAfter).isComplete);
            reached.push(finale ? { type: "finale" } : { type: "eraComplete", eraId: artwork.eraId });
          }
          if (!exploreAll) for (const eraId of eraIds) if (!accessBefore[eraId].unlocked && accessAfter[eraId].unlocked) reached.push({ type: "unlock", eraId });
          const previousBadges=new Set(getBadges(content,completedBefore).filter(badge=>badge.earned).map(badge=>badge.id));
          reached.push(...getBadges(content,completedAfter).filter(badge=>badge.earned && !previousBadges.has(badge.id)).map(badge=>({type:"badge" as const,badgeId:badge.id})));
          addMilestones(reached);
          setPanel({ type: "story", artwork });
        },
        onClose: closePanel,
      });
    else setPanel({ type: "studio", artwork });
  };
  return restoreArtwork;
}
