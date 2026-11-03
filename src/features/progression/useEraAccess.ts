"use client";
import { useCallback } from "react";
import { artworks, eras } from "@/data/eras";
import { getEraAccess } from "@/lib/room-development";
import type { EraId } from "@/types/game";

export function useEraAccess(completed: string[], exploreAll: boolean) {
  const eraAccess = getEraAccess(eras.map(era => era.id), artworks, completed);
  const isEraOpen = useCallback((id: EraId) => exploreAll || eraAccess[id].unlocked, [exploreAll, eraAccess]);
  return { eraAccess, isEraOpen };
}
