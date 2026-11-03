"use client";

import { copy } from "@/data/copy";
import type { Language } from "@/types/game";
import { House, Sparkles, ArrowRight } from "lucide-react";

export function InfoPanel({ language, onExplore }: {
  language: Language; onExplore: () => void;
}) {
  const t = copy[language];
  return (<>
                  <div className="dialog-illustration">
                    <House size={42} strokeWidth={1} />
                    <Sparkles size={19} />
                  </div>
                  <p className="dialog-intro">{t.infoBody}</p>
                  <button
                    className="primary-button full-width"
                    onClick={onExplore}
                  >
                    {t.explore}
                    <ArrowRight size={18} />
                  </button>
  </>);
}
