"use client";
import { useCallback, useState } from "react";
import type { Milestone } from "@/components/ProgressNotices";
import type { Panel } from "../shell/panels";

export function useMilestones() {
  const [panel, setPanel] = useState<Panel | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const closePanel = useCallback(() => setPanel(null), []);
  const dismissPanel = () => {
    const [next, ...rest] = milestones;
    if (next && panel?.type !== "settings" && panel?.type !== "info") {
      setMilestones(rest);
      setPanel({ type: "milestone", milestone: next });
    } else closePanel();
  };
  const addMilestones = (reached: Milestone[]) => {
    if (reached.length) setMilestones(current => [...current, ...reached]);
  };
  const resetMilestones = () => setMilestones([]);
  return { panel, setPanel, closePanel, dismissPanel, addMilestones, resetMilestones };
}
