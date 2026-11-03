"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { artworks, legacyArtworkIds, wallSlots } from "@/data/eras";
import { normalizeWallAssignments, placeWallArtwork, type WallAssignments } from "@/lib/wall-gallery";
import type { Language } from "@/types/game";
import { isDateKey, localDateKey, normalizeDailyHistory } from "@/lib/daily";
import { safeStorage } from "./safe-storage";

interface GameState {
  language: Language;
  gentleMotion: boolean;
  highContrast: boolean;
  musicEnabled: boolean; musicVolume:number; brushSounds:boolean;
  toggleMusic:()=>void; setMusicVolume:(volume:number)=>void; toggleBrushSounds:()=>void;
  tutorialSeen: boolean;
  dailyHistory: string[];
  dailySelection: {dateKey: string; artworkId: string} | null;
  selectDailyArtwork: (dateKey: string, artworkId: string) => void;
  recordDailyCompletion: (artworkId: string) => void;
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
      musicEnabled:false,musicVolume:.35,brushSounds:true,
      toggleMusic:()=>set(state=>({musicEnabled:!state.musicEnabled})),
      setMusicVolume:volume=>{if(Number.isFinite(volume))set({musicVolume:Math.max(0,Math.min(1,volume))});},
      toggleBrushSounds:()=>set(state=>({brushSounds:!state.brushSounds})),
      tutorialSeen: false,
      dailyHistory: [], dailySelection: null,
      selectDailyArtwork: (dateKey,artworkId) => {
        if(isDateKey(dateKey) && artworks.some(artwork=>artwork.id===artworkId)) set({dailySelection:{dateKey,artworkId}});
      },
      recordDailyCompletion: artworkId => set(state => {
        const today=localDateKey(new Date());
        return state.dailySelection?.dateKey === today && state.dailySelection.artworkId === artworkId
          ? {dailyHistory:normalizeDailyHistory([...state.dailyHistory,today])} : {};
      }),
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
      resetProgress: () => set({ tutorialSeen: false, dailyHistory: [], dailySelection: null, completedArtworkIds: [], wallAssignments: normalizeWallAssignments({}, wallSlots, artworks) }),
    }),
    {
      name: "heritage-hearth-ui-v1",
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      skipHydration: true,
      partialize: ({ language, musicEnabled, musicVolume, brushSounds, dailyHistory, dailySelection, gentleMotion, highContrast, tutorialSeen, autoFill, exploreAll, completedArtworkIds, wallAssignments }) => ({
        language,
        gentleMotion,
        highContrast,
        tutorialSeen,
        musicEnabled,musicVolume,brushSounds,
        dailyHistory,
        dailySelection,
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
          musicEnabled:saved.musicEnabled===true,
          musicVolume:typeof saved.musicVolume === "number" && Number.isFinite(saved.musicVolume) ? Math.max(0,Math.min(1,saved.musicVolume)) : .35,
          brushSounds:saved.brushSounds!==false,
          tutorialSeen: saved.tutorialSeen === true,
          dailyHistory: normalizeDailyHistory(saved.dailyHistory),
          dailySelection: (() => {
            const selection=saved.dailySelection as {dateKey?:unknown; artworkId?:unknown} | null;
            return selection && isDateKey(selection.dateKey) && typeof selection.artworkId === "string" && artworks.some(artwork=>artwork.id===selection.artworkId)
              ? {dateKey:selection.dateKey,artworkId:selection.artworkId} : null;
          })(),
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
