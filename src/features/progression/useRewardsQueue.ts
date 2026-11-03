"use client";
import { useCallback, useState } from "react";
import type { EraId } from "@/types/game";

export function useRewardsQueue() {
  const [pendingRewards, setPendingRewards] = useState<Partial<Record<EraId, string[]>>>({});
  const consumeRewards = useCallback((ids: string[]) => {
    setPendingRewards((current) => Object.fromEntries(Object.entries(current).map(([era, rewards]) => [era, rewards.filter((id) => !ids.includes(id))])));
  }, []);
  const addRewards = (eraId: EraId, ids: string[]) => {
    if (ids.length) setPendingRewards(current => ({...current, [eraId]: [...new Set([...(current[eraId] ?? []), ...ids])]}));
  };
  const resetRewards = () => setPendingRewards({});
  return { pendingRewards, consumeRewards, addRewards, resetRewards };
}
