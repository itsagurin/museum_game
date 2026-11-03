"use client";

import { useState } from "react";
import { ArrowRight, BookOpen, ChevronDown, ImageOff, Paintbrush, Sparkles } from "lucide-react";
import { copy } from "@/data/copy";
import { getEra } from "@/data/eras";
import type { Artwork, Language } from "@/types/game";
import { ArtworkSourceNote } from "./ArtworkSourceNote";

export function ArtworkStory({ artwork, language, completed, onRestore, onClose }: {
  artwork: Artwork;
  language: Language;
  completed: boolean;
  onRestore?: () => void;
  onClose: () => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const t = copy[language];
  const contentLanguage = artwork.untranslated && language === "en" ? "pl" : undefined;

  return (
    <div className="artwork-discovery">
      <figure className="story-preview">
        {artwork.originalImage && !imageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={artwork.originalImage} alt={artwork.title[language]} onError={() => setImageFailed(true)} />
        ) : (
          <div className="story-image-fallback" role="img" aria-label={t.imageError}>
            <ImageOff size={28} /><span>{t.imageError}</span>
          </div>
        )}
      </figure>
      <div className="story-heading">
        <div>
          <span className="eyebrow">{getEra(artwork.eraId).name[language]}</span>
          <h3>{artwork.title[language]}</h3>
          {artwork.artist && <p className="artwork-credit">{artwork.artist}{artwork.year && ` · ${artwork.year}`}</p>}
        </div>
      </div>
      <div className="fun-fact">
        <Sparkles size={18} aria-hidden="true" />
        <p lang={contentLanguage}>{artwork.funFact?.[language] || t.emptyFact}</p>
      </div>
      <details className="story-history">
        <summary><BookOpen size={16} aria-hidden="true" />{t.story}<ChevronDown size={16} aria-hidden="true" /></summary>
        {artwork.style && <p className="story-style" lang={contentLanguage}>{artwork.style[language]}</p>}
        <p className="story-body" lang={contentLanguage}>{artwork.story?.[language] || t.emptyStory}</p>
        <ArtworkSourceNote artwork={artwork} language={language} />
      </details>
      <div className="story-actions">
        {artwork.coloringArtworkId && onRestore && (
          <button className="primary-button" onClick={onRestore}>
            {completed ? t.repaint : t.restore}<Paintbrush size={16} />
          </button>
        )}
        <button className="secondary-button" onClick={onClose}>{t.returnRoom}<ArrowRight size={16} /></button>
      </div>
    </div>
  );
}
