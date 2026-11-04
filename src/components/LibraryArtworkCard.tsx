"use client";

import { memo, useState } from "react";
import { Check, ImageOff, LockKeyhole } from "lucide-react";
import { getEra } from "@/data/eras";
import { copy } from "@/data/copy";
import { useGameStore } from "@/store/useGameStore";
import type { Artwork, Language } from "@/types/game";

export function ArtworkPreview({ artwork, eager = false, priority = false }: { artwork: Artwork; eager?: boolean; priority?: boolean }) {
  const [src, setSrc] = useState(eager ? artwork.originalImage : artwork.thumbnailImage ?? artwork.originalImage);
  const language = useGameStore(state => state.language);
  if (!src) return <span className="library-image-fallback" role="img" aria-label={copy[language].imageError}><ImageOff size={28} /></span>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" width={artwork.imageSize?.width} height={artwork.imageSize?.height} fetchPriority={priority ? "high" : undefined} loading={eager || priority ? "eager" : "lazy"} draggable={false} onError={() => setSrc(src === artwork.originalImage ? undefined : artwork.originalImage)} />
  );
}

/** Keep offscreen image work deferred and avoid rendering every card when a neighbour appears. */
export const LibraryArtworkCard = memo(function LibraryArtworkCard({ artwork, language, completed, hanging, locked, showImage, priority, onReveal, onSelect }: {
  artwork: Artwork; language: Language; completed: boolean; hanging: boolean; locked: boolean;
  showImage: boolean; priority: boolean; onReveal: (id: string) => void; onSelect: (id: string) => void;
}) {
  const t = copy[language];
  return <button className="library-artwork-card" data-artwork-id={artwork.id}
    aria-label={`${artwork.title[language]} — ${getEra(artwork.eraId).name[language]}`}
    onFocus={() => onReveal(artwork.id)} onClick={() => onSelect(artwork.id)}>
    <span className="library-card-image" style={artwork.imageSize ? { aspectRatio: `${artwork.imageSize.width} / ${artwork.imageSize.height}` } : undefined}>
      {showImage && <ArtworkPreview artwork={artwork} priority={priority} />}
      {completed && <span className="library-card-restored">{showImage && <Check size={12} />}{t.restoredLabel}</span>}
      {locked && <span className="library-card-locked" aria-label={t.locked}>{showImage && <LockKeyhole size={12} />}</span>}
    </span>
    <span className="library-card-copy">
      <strong>{artwork.title[language]}</strong>
      {artwork.artist && <span className="artwork-credit">{artwork.artist}{artwork.year && ` · ${artwork.year}`}</span>}
      <span>{getEra(artwork.eraId).name[language]}</span>
      {hanging && <small>{t.libraryOnWall}</small>}
    </span>
  </button>;
});
