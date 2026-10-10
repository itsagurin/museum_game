"use client";

import { create } from "zustand";
import {
  persist,
  createJSONStorage,
  type StateStorage,
} from "zustand/middleware";
import { artworks } from "@/data/eras";
import type { Language } from "@/types/game";

interface GameState {
  language: Language;
  gentleMotion: boolean;
  completedArtworkIds: string[];
  setLanguage: (language: Language) => void;
  toggleGentleMotion: () => void;
  completeArtwork: (id: string) => void;
  resetProgress: () => void;
}

// Storage restrictions must never prevent navigating the house.
const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      window.localStorage.setItem(name, value);
    } catch {
      window.dispatchEvent(new Event("heritage:storage-unavailable"));
    }
  },
  removeItem: (name) => {
    try {
      window.localStorage.removeItem(name);
    } catch {
      /* In-memory state still works. */
    }
  },
};

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      language: "pl",
      gentleMotion: false,
      completedArtworkIds: [],
      setLanguage: (language) => set({ language }),
      toggleGentleMotion: () =>
        set((state) => ({ gentleMotion: !state.gentleMotion })),
      completeArtwork: (id) => {
        if (!artworks.some((artwork) => artwork.id === id)) return;
        set((state) => ({
          completedArtworkIds: state.completedArtworkIds.includes(id)
            ? state.completedArtworkIds
            : [...state.completedArtworkIds, id],
        }));
      },
      resetProgress: () => set({ completedArtworkIds: [] }),
    }),
    {
      name: "heritage-hearth-ui-v1",
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      skipHydration: true,
      partialize: ({ language, gentleMotion, completedArtworkIds }) => ({
        language,
        gentleMotion,
        completedArtworkIds,
      }),
      merge: (persisted, current) => {
        if (!persisted || typeof persisted !== "object") return current;
        const saved = persisted as Record<string, unknown>;
        return {
          ...current,
          language: saved.language === "en" ? "en" : "pl",
          gentleMotion: saved.gentleMotion === true,
          completedArtworkIds: Array.isArray(saved.completedArtworkIds)
            ? saved.completedArtworkIds.filter(
                (id): id is string =>
                  typeof id === "string" &&
                  artworks.some((artwork) => artwork.id === id),
              )
            : [],
        };
      },
    },
  ),
);
