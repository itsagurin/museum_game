"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { artworks, legacyArtworkIds, wallSlots } from "@/data/eras";
import { normalizeWallAssignments, placeWallArtwork, type WallAssignments } from "@/lib/wall-gallery";
import type { Language } from "@/types/game";
import { safeStorage } from "./safe-storage";

interface GameState {
  language: Language;
  gentleMotion: boolean;
  highContrast: boolean;
  tutorialSeen: boolean;
  toggleHighContrast: () => void;
  markTutorialSeen: () => void;
  autoFill: boolean;
  /** Opens every era regardless of progress, e.g. in a classroom or to browse the collection. */
  exploreAll: boolean;
  completedArtworkIds: string[];
  wallAssignments: WallAssignments;
  setLanguage: (language: Language) => void;
  toggleGentleMotion: () => void;
  toggleAutoFill: () => void;
  toggleExploreAll: () => void;
  completeArtwork: (id: string) => void;
  setWallArtwork: (slotId: string, artworkId: string) => void;
  resetProgress: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      language: "pl",
      gentleMotion: false,
      highContrast: typeof window !== "undefined" && window.matchMedia("(prefers-contrast: more)").matches,
      tutorialSeen: false,
      toggleHighContrast: () => set(state => ({highContrast: !state.highContrast})),
      markTutorialSeen: () => set({tutorialSeen: true}),
      autoFill: true,
      exploreAll: false,
      completedArtworkIds: [],
      wallAssignments: normalizeWallAssignments({}, wallSlots, artworks),
      setLanguage: (language) => set({ language }),
      toggleGentleMotion: () =>
        set((state) => ({ gentleMotion: !state.gentleMotion })),
      toggleAutoFill: () => set((state) => ({ autoFill: !state.autoFill })),
      toggleExploreAll: () => set((state) => ({ exploreAll: !state.exploreAll })),
      completeArtwork: (id) => {
        if (!artworks.some((artwork) => artwork.id === id)) return;
        set((state) => ({
          completedArtworkIds: state.completedArtworkIds.includes(id)
            ? state.completedArtworkIds
            : [...state.completedArtworkIds, id],
        }));
      },
      setWallArtwork: (slotId, artworkId) => set((state) => ({
        wallAssignments: placeWallArtwork(slotId, artworkId, wallSlots, artworks, state.wallAssignments),
      })),
      resetProgress: () => set({ tutorialSeen: false, completedArtworkIds: [], wallAssignments: normalizeWallAssignments({}, wallSlots, artworks) }),
    }),
    {
      name: "heritage-hearth-ui-v1",
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      skipHydration: true,
      partialize: ({ language, gentleMotion, highContrast, tutorialSeen, autoFill, exploreAll, completedArtworkIds, wallAssignments }) => ({
        language,
        gentleMotion,
        highContrast,
        tutorialSeen,
        autoFill,
        exploreAll,
        completedArtworkIds,
        wallAssignments,
      }),
      merge: (persisted, current) => {
        if (!persisted || typeof persisted !== "object") return current;
        const saved = persisted as Record<string, unknown>;
        // Saves from before content/artworks.json used file-path IDs; map them to the stable ones.
        const currentId = (id: unknown) => (typeof id === "string" ? legacyArtworkIds.get(id) ?? id : id);
        const wallAssignments = saved.wallAssignments && typeof saved.wallAssignments === "object"
          ? Object.fromEntries(Object.entries(saved.wallAssignments).map(([slot, id]) => [slot, currentId(id)]))
          : saved.wallAssignments;
        const completedArtworkIds = Array.isArray(saved.completedArtworkIds) ? saved.completedArtworkIds.map(currentId) : saved.completedArtworkIds;
        return {
          ...current,
          language: saved.language === "en" ? "en" : "pl",
          gentleMotion: saved.gentleMotion === true,
          highContrast: typeof saved.highContrast === "boolean" ? saved.highContrast : current.highContrast,
          tutorialSeen: saved.tutorialSeen === true,
          autoFill: saved.autoFill !== false,
          exploreAll: saved.exploreAll === true,
          wallAssignments: normalizeWallAssignments(wallAssignments, wallSlots, artworks),
          completedArtworkIds: Array.isArray(completedArtworkIds)
            ? [...new Set(completedArtworkIds.filter(
                (id): id is string =>
                  typeof id === "string" &&
                  artworks.some((artwork) => artwork.id === id),
              ))]
            : [],
        };
      },
    },
  ),
);
