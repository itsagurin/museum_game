"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { artworks, legacyArtworkIds } from "@/data/eras";
import { decodeCells, encodeCells } from "@/lib/painting-progress";
import { safeStorage } from "./safe-storage";

export interface SavedPainting {
  /** gridSignature of the board the cells belong to. */
  signature: string;
  total: number;
  painted: number;
  cells: string;
  updatedAt: number;
}

interface PaintingProgressState {
  paintings: Record<string, SavedPainting>;
  save: (artworkId: string, signature: string, total: number, cellIds: readonly number[]) => void;
  /** Painted cells of this exact board, or none when the board changed since saving. */
  load: (artworkId: string, signature: string, total: number) => number[];
  clear: (artworkId: string) => void;
  reset: () => void;
}

const without = (paintings: Record<string, SavedPainting>, artworkId: string) => {
  const rest = { ...paintings };
  delete rest[artworkId];
  return rest;
};
const puzzleVersions = new Map(artworks.map(artwork => [artwork.id, [artwork.puzzleVersion, artwork.introPuzzleVersion]]));
const isSavedPainting = (value: unknown): value is SavedPainting => {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  return typeof entry.signature === "string" && typeof entry.cells === "string"
    && Number.isInteger(entry.total) && Number.isInteger(entry.painted)
    && (entry.painted as number) >= 0 && (entry.painted as number) <= (entry.total as number)
    && typeof entry.updatedAt === "number";
};

// Kept apart from the main save: it changes on every stroke and grows with started paintings.
export const usePaintingProgress = create<PaintingProgressState>()(
  persist(
    (set, get) => ({
      paintings: {},
      save: (artworkId, signature, total, cellIds) => set((state) => {
        if (!cellIds.length) return { paintings: without(state.paintings, artworkId) };
        return {
          paintings: {
            ...state.paintings,
            [artworkId]: { signature, total, painted: new Set(cellIds).size, cells: encodeCells(cellIds, total), updatedAt: Date.now() },
          },
        };
      }),
      load: (artworkId, signature, total) => {
        const saved = get().paintings[artworkId];
        if (!saved) return [];
        if (saved.signature === signature && saved.total === total) return decodeCells(saved.cells, total);
        set(state => ({ paintings: without(state.paintings, artworkId) }));
        return [];
      },
      clear: (artworkId) => set((state) => ({ paintings: without(state.paintings, artworkId) })),
      reset: () => set({ paintings: {} }),
    }),
    {
      name: "heritage-paintings-v1",
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      skipHydration: true,
      partialize: ({ paintings }) => ({ paintings }),
      merge: (persisted, current) => {
        const saved = (persisted as { paintings?: unknown } | null)?.paintings;
        if (!saved || typeof saved !== "object") return current;
        // One damaged entry must not discard the rest of the saved paintings.
        const paintings = Object.fromEntries(Object.entries(saved).map(([id, entry]) => [legacyArtworkIds.get(id) ?? id, entry] as const).filter(([id, entry]) => puzzleVersions.has(id) && isSavedPainting(entry) && puzzleVersions.get(id)?.includes(entry.signature)));
        return { ...current, paintings };
      },
    },
  ),
);
