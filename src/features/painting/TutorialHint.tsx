"use client";
import { X } from "lucide-react";
import { copy } from "@/data/copy";
import { useGameStore } from "@/store/useGameStore";
import type { Language } from "@/types/game";
export function TutorialHint({language, selected, hits}: {language: Language; selected: number | null; hits: number}) {
  const t = copy[language];
  return <div className="tutorial-hint glass" role="status"><p>{selected === null ? t.tutorialChoose : hits < 3 ? t.tutorialPaint : t.tutorialStreak}</p><button className="icon-button" aria-label={t.dismissTip} onClick={() => useGameStore.getState().markTutorialSeen()}><X size={16} /></button></div>;
}
