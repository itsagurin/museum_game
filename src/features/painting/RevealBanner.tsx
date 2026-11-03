"use client";
import { Eye, Grid, Sparkles } from "lucide-react";
import { coloringCopy } from "@/data/coloring-copy";
import type { Language } from "@/types/game";

export function RevealBanner({language, mode, setMode}: {language: Language; mode: "original" | "pixels"; setMode: (mode: "original" | "pixels") => void}) {
  const t = coloringCopy[language];
  return (
    
      <div className="revealed-banner" role="region" aria-label={t.restored}>
        <div className="revealed-badge">
          <Sparkles size={14} aria-hidden />
          <span>{t.restoredBadge}</span>
        </div>
        <div className="revealed-switch" role="group" aria-label={t.view}>
          <button
            type="button"
            className={`switch-tab ${mode === 'original' ? 'is-active' : ''}`}
            onClick={() => setMode('original')}
            aria-pressed={mode === 'original'}
          >
            <Eye size={12} aria-hidden style={{ display: 'inline', marginRight: 4 }} />
            {t.original}
          </button>
          <button
            type="button"
            className={`switch-tab ${mode === 'pixels' ? 'is-active' : ''}`}
            onClick={() => setMode('pixels')}
            aria-pressed={mode === 'pixels'}
          >
            <Grid size={12} aria-hidden style={{ display: 'inline', marginRight: 4 }} />
            {t.pixels}
          </button>
        </div>
      </div>
  );
}
