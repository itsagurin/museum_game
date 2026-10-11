"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import type { Artwork } from "@/types/game";

export function RestoredArtwork({ artwork }: { artwork: Artwork }) {
  const [failed, setFailed] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);

  // The algorithm supplies a local pixel preview for missing reproductions.
  if (failed && artwork.coloredPreview && !previewFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={artwork.coloredPreview} className="original-artwork pixel-preview" alt="" draggable={false} onError={() => setPreviewFailed(true)} />
    );
  }

  if (failed || !artwork.originalImage) {
    return <span className="original-artwork library-image-fallback" aria-hidden="true"><ImageOff size={20} /></span>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={artwork.originalImage} alt="" draggable={false} className="original-artwork" onError={() => setFailed(true)} />
  );
}
